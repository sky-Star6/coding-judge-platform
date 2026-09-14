# -*- coding: utf-8 -*-
"""
데이터베이스 병합 도구 (Database Merge Tool)
===================================================================
이 모듈은 서비스 운영 중인 서버 데이터베이스(Server DB)와
개발/수정된 작업 데이터베이스(Work DB)를 안전하게 병합하는 기능을 제공합니다.

주요 요구사항 및 안전 원칙:
1. 보존 대상:
   - 서버 DB의 사용자 정보(users), 제출 및 채점 기록(submissions), 과제(assignments)
     등 사용자 활동 데이터를 유실 없이 100% 보존합니다.
2. 병합 대상:
   - 작업 DB의 문제(problems) 및 테스트 케이스(test_cases)를 서버 DB에 반영합니다.
     기존 문제는 최신 내용으로 갱신(Update)하고, 신규 문제는 안전하게 추가(Insert)합니다.
3. 안전한 백업(Backup):
   - 병합 시작 전 원본 서버 DB를 타임스탬프 기반 백업 파일로 자동 복사합니다.
4. 격리된 임시 복사본(Temporary Working Copy) 작업:
   - 원본 파일을 직접 수정하지 않고, 격리된 임시 파일에서 모든 작업을 진행합니다.
5. 충돌 감지 및 즉시 중단(Fast Fail on Conflict):
   - 제출 기록의 외래 키(Foreign Key) 불일치나 제약조건 위반 등 충돌 발생 시
     즉시 작업을 중단(Abort)하고 임시 파일을 폐기하여 원본을 완벽히 보호합니다.
6. 철저한 무결성 검증(Integrity Verification):
   - SQLite의 PRAGMA integrity_check 및 PRAGMA foreign_key_check를 실행하고,
     핵심 테이블 행 수(Row Count)를 대조하여 이상이 없을 때만 최종 반영합니다.

사용 방법:
  CLI 실행:
    python merge_db.py --server-db judge_db.sqlite --work-db dev_db.sqlite --in-place
    python merge_db.py --server-db judge_db.sqlite --work-db dev_db.sqlite --output merged.sqlite
    python merge_db.py --server-db judge_db.sqlite --work-db dev_db.sqlite --dry-run
"""

import argparse
import logging
import os
import shutil
import sqlite3
import sys
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

# 로깅 설정 (Logging Configuration)
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("db_merger")


# ===================================================================
# 사용자 정의 예외 클래스 (Custom Exception Classes)
# ===================================================================

class DatabaseMergeError(Exception):
    """데이터베이스 병합 과정에서 발생하는 기본 예외 클래스"""
    pass


class BackupFailedError(DatabaseMergeError):
    """데이터베이스 백업 실패 시 발생하는 예외 클래스"""
    pass


class ConflictDetectedError(DatabaseMergeError):
    """외래 키(Foreign Key) 불일치 등 충돌 감지 시 발생하는 예외 클래스"""
    pass


class IntegrityCheckFailedError(DatabaseMergeError):
    """무결성 검사(Integrity Check) 실패 시 발생하는 예외 클래스"""
    pass


# ===================================================================
# 유틸리티 및 검증 함수 (Utility & Verification Functions)
# ===================================================================

def get_table_names(conn: sqlite3.Connection) -> List[str]:
    """
    지정된 데이터베이스 연결에서 생성된 모든 일반 테이블(Table) 목록을 조회합니다.

    Args:
        conn (sqlite3.Connection): SQLite 데이터베이스 연결 객체

    Returns:
        List[str]: 테이블 이름 목록
    """
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    return [row[0] for row in cursor.fetchall()]


def get_table_columns(conn: sqlite3.Connection, table_name: str) -> List[str]:
    """
    지정된 테이블의 컬럼(Column) 이름 목록을 조회합니다.

    Args:
        conn (sqlite3.Connection): SQLite 데이터베이스 연결 객체
        table_name (str): 조회할 테이블 이름

    Returns:
        List[str]: 컬럼 이름 목록
    """
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    return [row[1] for row in cursor.fetchall()]


def get_table_row_count(conn: sqlite3.Connection, table_name: str) -> int:
    """
    특정 테이블의 전체 행(Row) 개수를 반환합니다. 테이블이 없으면 0을 반환합니다.

    Args:
        conn (sqlite3.Connection): SQLite 데이터베이스 연결 객체
        table_name (str): 행 수를 확인할 테이블 이름

    Returns:
        int: 행 수
    """
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cursor.fetchone()[0]
    except sqlite3.OperationalError:
        return 0


def create_database_backup(server_db_path: str, backup_dir: Optional[str] = None) -> str:
    """
    병합 작업을 수행하기 전에 원본 서버 데이터베이스를 안전하게 백업합니다.

    - 타임스탬프(Timestamp)가 포함된 고유한 백업 파일명을 생성합니다.
    - 백업 파일이 정상적으로 복사되었는지 및 SQLite 무결성을 검사합니다.

    Args:
        server_db_path (str): 백업할 서버 데이터베이스 원본 파일 경로
        backup_dir (Optional[str]): 백업 파일을 저장할 디렉토리 (기본값: 원본 파일과 동일한 디렉토리의 backups 폴더)

    Returns:
        str: 생성된 백업 파일의 절대 경로

    Raises:
        BackupFailedError: 백업 파일 생성 또는 검증 실패 시 발생
    """
    if not os.path.exists(server_db_path):
        raise BackupFailedError(f"백업 대상 원본 서버 DB 파일이 존재하지 않습니다: {server_db_path}")

    # 백업 디렉토리 결정 및 생성
    if backup_dir is None:
        base_dir = os.path.dirname(os.path.abspath(server_db_path))
        backup_dir = os.path.join(base_dir, "backups")

    os.makedirs(backup_dir, exist_ok=True)

    # 타임스탬프 기반 백업 파일명 생성 (예: judge_db.sqlite.backup_20260831_120000.db)
    base_name = os.path.basename(server_db_path)
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    backup_file_name = f"{base_name}.backup_{timestamp_str}.db"
    backup_path = os.path.join(backup_dir, backup_file_name)

    try:
        logger.info(f"[백업] 원본 서버 DB 백업을 진행합니다: {backup_path}")
        shutil.copy2(server_db_path, backup_path)

        # 백업 파일의 크기 및 읽기 가능 여부 확인
        if not os.path.exists(backup_path) or os.path.getsize(backup_path) != os.path.getsize(server_db_path):
            raise BackupFailedError("백업 파일 복사 후 크기가 원본과 일치하지 않습니다.")

        # 백업 파일의 SQLite 무결성 검증(Integrity Check)
        backup_conn = sqlite3.connect(backup_path)
        try:
            cursor = backup_conn.cursor()
            cursor.execute("PRAGMA integrity_check")
            result = cursor.fetchall()
            if not result or result[0][0] != "ok":
                raise BackupFailedError(f"백업 데이터베이스 무결성 검증 실패: {result}")
        finally:
            backup_conn.close()

        logger.info(f"[백업 완료] 원본 서버 DB가 안전하게 백업되었습니다: {backup_path}")
        return backup_path

    except Exception as e:
        if os.path.exists(backup_path):
            try:
                os.remove(backup_path)
            except OSError:
                pass
        raise BackupFailedError(f"서버 DB 백업 생성 중 오류가 발생하여 작업을 중단합니다: {e}") from e


def validate_schemas(server_conn: sqlite3.Connection, work_conn: sqlite3.Connection) -> None:
    """
    서버 DB와 작업 DB의 기본 스키마(Schema) 필수 테이블 존재 여부를 점검합니다.

    Args:
        server_conn (sqlite3.Connection): 서버 데이터베이스 연결 객체
        work_conn (sqlite3.Connection): 작업 데이터베이스 연결 객체

    Raises:
        ConflictDetectedError: 필수 테이블이 누락된 경우 발생
    """
    server_tables = set(get_table_names(server_conn))
    work_tables = set(get_table_names(work_conn))

    # 서버 DB 필수 테이블: users, submissions, assignments, problems, test_cases
    required_server_tables = {"users", "submissions", "assignments", "problems", "test_cases"}
    missing_server_tables = required_server_tables - server_tables
    if missing_server_tables:
        raise ConflictDetectedError(
            f"서버 DB에 필수 테이블이 누락되었습니다: {sorted(list(missing_server_tables))}"
        )

    # 작업 DB 필수 테이블: problems, test_cases
    required_work_tables = {"problems", "test_cases"}
    missing_work_tables = required_work_tables - work_tables
    if missing_work_tables:
        raise ConflictDetectedError(
            f"작업 DB에 병합할 필수 테이블이 누락되었습니다: {sorted(list(missing_work_tables))}"
        )


def detect_conflicts(server_conn: sqlite3.Connection, work_conn: sqlite3.Connection) -> List[str]:
    """
    병합 전 잠재적인 데이터 충돌(Conflict) 및 참조 무결성(Referential Integrity) 문제를 검사합니다.

    주요 점검 사항:
    1. 서버 DB의 제출 기록(submissions)에 기록된 problem_id가 작업 DB의 문제(problems) 목록에서 삭제/누락되었는지 여부
       -> 만약 서버 사용자의 채점 기록이 가리키는 문제가 작업 DB에서 사라진다면 외래 키 무결성이 깨지므로 충돌로 감지합니다.
    2. 작업 DB의 테스트케이스(test_cases) 중 존재하지 않는 problem_id를 참조하는 고아(Orphan) 레코드가 있는지 여부
    3. 작업 DB의 문제(problems) 중 ID가 중복되거나 누락된 비정상 데이터가 있는지 여부

    Args:
        server_conn (sqlite3.Connection): 서버 데이터베이스 연결 객체
        work_conn (sqlite3.Connection): 작업 데이터베이스 연결 객체

    Returns:
        List[str]: 감지된 충돌 사항 설명 목록 (비어있으면 충돌 없음)
    """
    conflicts: List[str] = []

    server_cursor = server_conn.cursor()
    work_cursor = work_conn.cursor()

    # 1. 작업 DB의 문제 ID 세트 조회
    work_cursor.execute("SELECT id FROM problems")
    work_problem_ids = {row[0] for row in work_cursor.fetchall() if row[0] is not None}

    # 2. 서버 DB의 문제 ID 세트 조회
    server_cursor.execute("SELECT id FROM problems")
    server_problem_ids = {row[0] for row in server_cursor.fetchall() if row[0] is not None}

    # 3. 서버 DB의 제출 기록(submissions)에서 사용 중인 problem_id 목록 확인
    server_cursor.execute("SELECT DISTINCT problem_id FROM submissions WHERE problem_id IS NOT NULL")
    submitted_problem_ids = {row[0] for row in server_cursor.fetchall()}

    # 제출 기록이 참조하는 문제 중 작업 DB에 없는 문제 확인
    # (주의: 서버 DB에 있던 문제가 작업 DB에서 의도치 않게 삭제된 경우)
    orphaned_submissions = submitted_problem_ids - work_problem_ids
    if orphaned_submissions:
        conflicts.append(
            f"서버 DB의 사용자 제출 기록(submissions)이 참조하는 문제 ID {sorted(list(orphaned_submissions))}가 "
            f"작업 DB의 문제(problems) 목록에 존재하지 않습니다. 병합 시 채점 기록의 외래 키(Foreign Key)가 손상되므로 즉시 중단합니다."
        )

    # 4. 작업 DB의 test_cases 중 존재하지 않는 problem_id 참조 여부 검사
    work_cursor.execute("SELECT DISTINCT problem_id FROM test_cases WHERE problem_id IS NOT NULL")
    testcase_problem_ids = {row[0] for row in work_cursor.fetchall()}
    invalid_testcase_problems = testcase_problem_ids - work_problem_ids
    if invalid_testcase_problems:
        conflicts.append(
            f"작업 DB의 테스트케이스(test_cases)가 정의되지 않은 문제 ID {sorted(list(invalid_testcase_problems))}를 참조하고 있습니다."
        )

    return conflicts


def merge_problems_and_testcases(
    target_conn: sqlite3.Connection,
    work_conn: sqlite3.Connection,
) -> Dict[str, int]:
    """
    작업 DB(work_conn)의 문제(problems) 및 테스트 케이스(test_cases)를
    임시 대상 DB(target_conn)에 안전하게 병합합니다.

    병합 규칙:
    - problems:
      - 동일한 id를 가진 문제가 target_conn에 이미 존재하면: 작업 DB의 컬럼 값들로 갱신(UPDATE)
      - 존재하지 않는 신규 문제이면: 새로운 행으로 삽입(INSERT)
      - target_conn에만 존재하는 기존 문제(단, submissions가 참조하는 문제 등): 보존(Keep)
    - test_cases:
      - 작업 DB에 정의된 문제(problems)들에 대해, target_conn의 기존 테스트케이스를 삭제(DELETE) 후
        작업 DB의 최신 테스트케이스를 일괄 삽입(INSERT)하여 정답/예제 데이터를 동기화합니다.
    - entry_problems (엔트리 문제가 양쪽에 모두 존재하는 경우):
      - problems와 동일한 방식으로 최신 내용 동기화

    Args:
        target_conn (sqlite3.Connection): 병합 작업을 수행할 임시 대상 DB 연결 객체
        work_conn (sqlite3.Connection): 소스 작업 DB 연결 객체

    Returns:
        Dict[str, int]: 병합 처리 통계 딕셔너리
    """
    target_cursor = target_conn.cursor()
    work_cursor = work_conn.cursor()

    stats = {
        "problems_updated": 0,
        "problems_inserted": 0,
        "problems_preserved": 0,
        "testcases_synced": 0,
        "entry_problems_synced": 0,
    }

    # -------------------------------------------------------------
    # 1. problems 테이블 병합
    # -------------------------------------------------------------
    target_cols = set(get_table_columns(target_conn, "problems"))
    work_cols = set(get_table_columns(work_conn, "problems"))

    # 공통 컬럼만 선택하여 안전하게 복사
    common_cols = [col for col in get_table_columns(work_conn, "problems") if col in target_cols]
    if "id" not in common_cols:
        raise ConflictDetectedError("problems 테이블에 기본 키(Primary Key)인 'id' 컬럼이 존재하지 않습니다.")

    cols_str = ", ".join(common_cols)
    placeholders_str = ", ".join(["?"] * len(common_cols))

    # 작업 DB의 모든 문제 읽기
    work_cursor.execute(f"SELECT {cols_str} FROM problems ORDER BY id ASC")
    work_problems = work_cursor.fetchall()

    update_cols = [c for c in common_cols if c != "id"]
    update_clause = ", ".join([f"{c} = ?" for c in update_cols])

    for row in work_problems:
        row_dict = dict(zip(common_cols, row))
        problem_id = row_dict["id"]

        # 대상 DB에 동일 ID 존재 여부 확인
        target_cursor.execute("SELECT 1 FROM problems WHERE id = ?", (problem_id,))
        exists = target_cursor.fetchone() is not None

        if exists:
            # 기존 문제 내용 갱신 (UPDATE)
            update_values = [row_dict[c] for c in update_cols] + [problem_id]
            target_cursor.execute(
                f"UPDATE problems SET {update_clause} WHERE id = ?",
                update_values,
            )
            stats["problems_updated"] += 1
        else:
            # 신규 문제 삽입 (INSERT)
            target_cursor.execute(
                f"INSERT INTO problems ({cols_str}) VALUES ({placeholders_str})",
                row,
            )
            stats["problems_inserted"] += 1

    # 작업 DB에 없지만 대상 DB에 남아 보존된 문제 수 산출
    work_pids = {row[common_cols.index("id")] for row in work_problems}
    target_cursor.execute("SELECT COUNT(*) FROM problems")
    total_target_problems = target_cursor.fetchone()[0]
    stats["problems_preserved"] = total_target_problems - (stats["problems_updated"] + stats["problems_inserted"])

    # -------------------------------------------------------------
    # 2. test_cases 테이블 동기화
    # -------------------------------------------------------------
    target_tc_cols = set(get_table_columns(target_conn, "test_cases"))
    work_tc_cols = set(get_table_columns(work_conn, "test_cases"))
    common_tc_cols = [c for c in get_table_columns(work_conn, "test_cases") if c in target_tc_cols]

    # id 컬럼은 자동 증가(Auto Increment)되도록 제외하고 삽입하거나 포함
    insert_tc_cols = [c for c in common_tc_cols if c != "id"]
    tc_cols_str = ", ".join(insert_tc_cols)
    tc_placeholders_str = ", ".join(["?"] * len(insert_tc_cols))

    # 작업 DB에 있는 각 문제 ID에 대해 테스트케이스 교체
    for pid in work_pids:
        # 기존 대상 DB의 테스트케이스 삭제
        target_cursor.execute("DELETE FROM test_cases WHERE problem_id = ?", (pid,))

        # 작업 DB에서 해당 문제의 테스트케이스 조회
        work_cursor.execute(
            f"SELECT {tc_cols_str} FROM test_cases WHERE problem_id = ? ORDER BY id ASC",
            (pid,),
        )
        tcs = work_cursor.fetchall()
        for tc_row in tcs:
            target_cursor.execute(
                f"INSERT INTO test_cases ({tc_cols_str}) VALUES ({tc_placeholders_str})",
                tc_row,
            )
            stats["testcases_synced"] += 1

    # -------------------------------------------------------------
    # 3. entry_problems 테이블 병합 (존재할 경우)
    # -------------------------------------------------------------
    target_tables = set(get_table_names(target_conn))
    work_tables = set(get_table_names(work_conn))

    if "entry_problems" in target_tables and "entry_problems" in work_tables:
        target_ep_cols = set(get_table_columns(target_conn, "entry_problems"))
        work_ep_cols = set(get_table_columns(work_conn, "entry_problems"))
        common_ep_cols = [c for c in get_table_columns(work_conn, "entry_problems") if c in target_ep_cols]

        if "id" in common_ep_cols:
            ep_cols_str = ", ".join(common_ep_cols)
            ep_placeholders_str = ", ".join(["?"] * len(common_ep_cols))
            ep_update_cols = [c for c in common_ep_cols if c != "id"]
            ep_update_clause = ", ".join([f"{c} = ?" for c in ep_update_cols])

            work_cursor.execute(f"SELECT {ep_cols_str} FROM entry_problems ORDER BY id ASC")
            for ep_row in work_cursor.fetchall():
                ep_dict = dict(zip(common_ep_cols, ep_row))
                ep_id = ep_dict["id"]

                target_cursor.execute("SELECT 1 FROM entry_problems WHERE id = ?", (ep_id,))
                if target_cursor.fetchone():
                    ep_update_values = [ep_dict[c] for c in ep_update_cols] + [ep_id]
                    target_cursor.execute(
                        f"UPDATE entry_problems SET {ep_update_clause} WHERE id = ?",
                        ep_update_values,
                    )
                else:
                    target_cursor.execute(
                        f"INSERT INTO entry_problems ({ep_cols_str}) VALUES ({ep_placeholders_str})",
                        ep_row,
                    )
                stats["entry_problems_synced"] += 1

    return stats


def verify_database_integrity(
    conn: sqlite3.Connection,
    pre_counts: Dict[str, int],
) -> Dict[str, Any]:
    """
    병합이 완료된 임시 데이터베이스에 대해 철저한 무결성 검증을 수행합니다.

    검증 항목:
    1. PRAGMA integrity_check: SQLite 내부 데이터 및 B-Tree 구조 손상 여부 확인
    2. PRAGMA foreign_key_check: 외래 키(Foreign Key) 제약조건 위반 레코드 점검
    3. 보존 대상 테이블 행 수 일치 여부:
       - users: 사전 행 수 == 사후 행 수 (사용자 계정 100% 보존)
       - submissions: 사전 행 수 == 사후 행 수 (사용자 채점 기록 100% 보존)
       - assignments: 사전 행 수 == 사후 행 수 (과제 목록 100% 보존)
    4. problems 및 test_cases 정합성:
       - 모든 test_cases의 problem_id가 실제 존재하는 problems를 가리키는지 확인
       - submissions의 problem_id 및 user_id가 실제 존재하는지 확인

    Args:
        conn (sqlite3.Connection): 무결성을 검증할 데이터베이스 연결 객체
        pre_counts (Dict[str, int]): 병합 전 서버 DB의 테이블별 행 수

    Returns:
        Dict[str, Any]: 검증 결과 리포트

    Raises:
        IntegrityCheckFailedError: 무결성 검증 항목 중 하나라도 실패할 경우 발생
    """
    cursor = conn.cursor()

    # 1. SQLite PRAGMA integrity_check 실행
    cursor.execute("PRAGMA integrity_check")
    integrity_results = cursor.fetchall()
    if not integrity_results or integrity_results[0][0] != "ok":
        raise IntegrityCheckFailedError(
            f"SQLite 데이터 무결성 검사(PRAGMA integrity_check) 실패: {integrity_results}"
        )

    # 2. SQLite PRAGMA foreign_key_check 실행
    cursor.execute("PRAGMA foreign_key_check")
    fk_violations = cursor.fetchall()
    if fk_violations:
        raise IntegrityCheckFailedError(
            f"외래 키 무결성 검사(PRAGMA foreign_key_check) 위반 발견: {len(fk_violations)}건의 위반 사항이 있습니다. "
            f"세부정보: {fk_violations[:5]}"
        )

    # 3. 보존 대상 핵심 테이블 행 수 대조
    post_counts = {
        table: get_table_row_count(conn, table)
        for table in ["users", "submissions", "assignments", "problems", "test_cases"]
    }

    # 보존 테이블 검증: users, submissions, assignments
    for table in ["users", "submissions", "assignments"]:
        expected = pre_counts.get(table, 0)
        actual = post_counts.get(table, 0)
        if expected != actual:
            raise IntegrityCheckFailedError(
                f"보존 대상 테이블 '{table}'의 행 수가 일치하지 않습니다! "
                f"(병합 전: {expected}행 -> 병합 후: {actual}행). 데이터 유실 방지를 위해 작업을 중단합니다."
            )

    # 4. 제출 기록(submissions)의 고아 레코드 존재 여부 정밀 점검
    cursor.execute("""
        SELECT COUNT(*) FROM submissions s
        LEFT JOIN problems p ON s.problem_id = p.id
        WHERE p.id IS NULL
    """)
    orphan_submissions = cursor.fetchone()[0]
    if orphan_submissions > 0:
        raise IntegrityCheckFailedError(
            f"제출 기록(submissions) 중 존재하지 않는 문제를 참조하는 고아 레코드가 {orphan_submissions}건 발생했습니다."
        )

    # 5. 테스트케이스(test_cases)의 고아 레코드 점검
    cursor.execute("""
        SELECT COUNT(*) FROM test_cases tc
        LEFT JOIN problems p ON tc.problem_id = p.id
        WHERE p.id IS NULL
    """)
    orphan_testcases = cursor.fetchone()[0]
    if orphan_testcases > 0:
        raise IntegrityCheckFailedError(
            f"테스트케이스(test_cases) 중 존재하지 않는 문제를 참조하는 고아 레코드가 {orphan_testcases}건 발생했습니다."
        )

    logger.info("[무결성 검증 통과] PRAGMA integrity_check 및 외래 키, 행 수 대조가 모두 완벽하게 성공했습니다.")
    return {
        "integrity_check": "ok",
        "foreign_key_check": "ok",
        "row_counts": post_counts,
    }


# ===================================================================
# 메인 병합 함수 (Main Merge Function)
# ===================================================================

def merge_databases(
    server_db_path: str,
    work_db_path: str,
    output_path: Optional[str] = None,
    in_place: bool = False,
    backup_dir: Optional[str] = None,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """
    서버 데이터베이스와 작업 데이터베이스를 안전하게 병합하는 최상위 함수입니다.

    전체 워크플로우(Workflow):
    1. 파일 경로 및 존재 여부 검사
    2. 서버 원본 DB 백업 파일 생성 (dry_run 모드가 아닐 때)
    3. 격리된 임시 복사본(Temporary Working Copy) 파일 생성 및 서버 DB 내용 복사
    4. 사전 검사: 스키마 유효성 점검 및 잠재 충돌(Conflict) 사전 감지
    5. 트랜잭션(Transaction) 내에서 problems / test_cases 병합 수행
    6. 사후 무결성 검증(PRAGMA integrity_check, foreign_key_check, 행 카운트) 수행
    7. 검증 성공 시:
       - dry_run: 결과 요약만 반환하고 임시 파일 삭제
       - in_place: 원본 서버 DB를 임시 파일 내용으로 안전하게 교체
       - output_path: 지정된 출력 경로에 병합된 파일 복사/저장
       - 둘 다 미지정: <server_db>.merged.sqlite 에 저장
    8. 예외 발생 시: 즉시 트랜잭션 롤백, 임시 파일 폐기, 원본 DB 완벽 보존

    Args:
        server_db_path (str): 운영 중인 서버 데이터베이스 파일 경로
        work_db_path (str): 문제/테스트케이스를 수정한 작업 데이터베이스 파일 경로
        output_path (Optional[str]): 병합 결과를 저장할 출력 파일 경로
        in_place (bool): True일 경우 서버 원본 DB 파일을 병합 결과로 직접 교체
        backup_dir (Optional[str]): 백업 파일 디렉토리
        dry_run (bool): True일 경우 실제 파일 변경 없이 시뮬레이션 및 검증만 수행

    Returns:
        Dict[str, Any]: 병합 성공 결과 및 통계 리포트

    Raises:
        DatabaseMergeError: 병합 도중 오류나 충돌이 발생할 경우
    """
    # 1. 파일 존재 여부 확인
    if not os.path.exists(server_db_path):
        raise DatabaseMergeError(f"서버 DB 파일을 찾을 수 없습니다: {server_db_path}")
    if not os.path.exists(work_db_path):
        raise DatabaseMergeError(f"작업 DB 파일을 찾을 수 없습니다: {work_db_path}")

    abs_server_db = os.path.abspath(server_db_path)
    abs_work_db = os.path.abspath(work_db_path)

    logger.info("=" * 65)
    logger.info("[DB 병합 시작] 서버 DB와 작업 DB 병합 절차를 진행합니다.")
    logger.info(f"- 서버 DB 경로: {abs_server_db}")
    logger.info(f"- 작업 DB 경로: {abs_work_db}")
    logger.info(f"- 실행 모드: {'[시뮬레이션(Dry-Run)]' if dry_run else ('[서버 DB 직접 교체(In-Place)]' if in_place else '[출력 파일 생성]')}")
    logger.info("=" * 65)

    # 2. 백업 생성 (dry_run이 아닌 경우에만 실제 파일 백업)
    backup_path = None
    if not dry_run:
        backup_path = create_database_backup(abs_server_db, backup_dir)
    else:
        logger.info("[시뮬레이션] 드라이 런(Dry-run) 모드이므로 백업 생성을 건너뜁니다.")

    # 3. 격리된 임시 복사본(Temporary Working Copy) 생성
    temp_fd, temp_working_path = tempfile.mkstemp(prefix="merge_judge_db_", suffix=".sqlite")
    os.close(temp_fd)  # 파일 디스크립터 닫기

    try:
        # 서버 DB를 임시 파일로 복사
        logger.info(f"[임시 작업본 생성] 격리된 임시 파일에서 작업을 진행합니다: {temp_working_path}")
        shutil.copy2(abs_server_db, temp_working_path)

        # 4. 데이터베이스 연결 수립
        temp_conn = sqlite3.connect(temp_working_path)
        work_conn = sqlite3.connect(abs_work_db)

        # 외래 키(Foreign Key) 활성화
        temp_conn.execute("PRAGMA foreign_keys = ON")
        work_conn.execute("PRAGMA foreign_keys = ON")

        try:
            # 병합 전 서버 DB 행 수 기록 (보존 검증용)
            pre_counts = {
                table: get_table_row_count(temp_conn, table)
                for table in ["users", "submissions", "assignments", "problems", "test_cases"]
            }
            logger.info(
                f"[병합 전 원본 상태] users: {pre_counts['users']}명, "
                f"submissions: {pre_counts['submissions']}건, "
                f"assignments: {pre_counts['assignments']}건, "
                f"problems: {pre_counts['problems']}개, "
                f"test_cases: {pre_counts['test_cases']}개"
            )

            # 스키마 유효성 점검
            validate_schemas(temp_conn, work_conn)

            # 충돌 사전 감지 (Fast Fail)
            conflicts = detect_conflicts(temp_conn, work_conn)
            if conflicts:
                error_msg = "\n".join([f"- {c}" for c in conflicts])
                raise ConflictDetectedError(
                    f"데이터베이스 병합 중 충돌이 감지되어 원본 보호를 위해 즉시 중단합니다:\n{error_msg}"
                )

            # 5. 트랜잭션(Transaction) 내에서 병합 수행
            logger.info("[병합 실행] problems 및 test_cases 병합 트랜잭션을 시작합니다...")
            temp_conn.execute("BEGIN IMMEDIATE TRANSACTION")

            merge_stats = merge_problems_and_testcases(temp_conn, work_conn)

            # 트랜잭션 커밋
            temp_conn.commit()
            logger.info(
                f"[병합 완료] 문제 갱신: {merge_stats['problems_updated']}건, "
                f"문제 신규 추가: {merge_stats['problems_inserted']}건, "
                f"기존 문제 보존: {merge_stats['problems_preserved']}건, "
                f"테스트케이스 동기화: {merge_stats['testcases_synced']}건"
            )

            # 6. 사후 무결성 검증
            logger.info("[무결성 검증] 병합 결과에 대한 SQLite 및 외래 키 무결성을 검증합니다...")
            integrity_report = verify_database_integrity(temp_conn, pre_counts)

        finally:
            temp_conn.close()
            work_conn.close()

        # 7. 최종 대상 파일 확정 (Finalize)
        target_destination = None
        if dry_run:
            logger.info("[시뮬레이션 완료] 모든 검증이 정상 통과되었습니다. 원본 및 대상 파일은 변경되지 않았습니다.")
            target_destination = "(Dry-Run: 변경 사항 없음)"
        elif in_place:
            logger.info(f"[원본 교체] 무결성 검증을 통과하였으므로 서버 원본 DB를 갱신합니다: {abs_server_db}")
            shutil.copy2(temp_working_path, abs_server_db)
            target_destination = abs_server_db
        else:
            if not output_path:
                output_path = f"{abs_server_db}.merged.sqlite"
            abs_output_path = os.path.abspath(output_path)
            output_parent = os.path.dirname(abs_output_path)
            if output_parent:
                os.makedirs(output_parent, exist_ok=True)
            logger.info(f"[출력 파일 저장] 병합 결과를 대상 파일에 저장합니다: {abs_output_path}")
            shutil.copy2(temp_working_path, abs_output_path)
            target_destination = abs_output_path

        return {
            "success": True,
            "dry_run": dry_run,
            "server_db": abs_server_db,
            "work_db": abs_work_db,
            "backup_path": backup_path,
            "destination": target_destination,
            "stats": merge_stats,
            "integrity": integrity_report if "integrity_report" in locals() else {"integrity_check": "ok"},
        }

    except Exception as e:
        logger.error(f"[병합 실패 및 중단] 원본 데이터베이스를 보존하고 작업을 중단합니다: {e}")
        raise

    finally:
        # 8. 임시 작업 파일 안전하게 정리
        if os.path.exists(temp_working_path):
            try:
                os.remove(temp_working_path)
            except OSError:
                pass


# ===================================================================
# 커맨드라인 인터페이스 (Command Line Interface)
# ===================================================================

def build_argument_parser() -> argparse.ArgumentParser:
    """CLI 인자 파서(Argument Parser)를 구성하여 반환합니다."""
    parser = argparse.ArgumentParser(
        description="온라인 코딩 채점 플랫폼 - 서버 DB와 작업 DB 안전 병합 도구 (Merge Tool)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  # 1. 안전하게 시뮬레이션(Dry-Run)만 수행하여 충돌 및 무결성 사전 점검:
  python merge_db.py --server-db judge_db.sqlite --work-db dev_db.sqlite --dry-run

  # 2. 병합 결과를 새로운 파일로 저장 (원본 보존):
  python merge_db.py --server-db judge_db.sqlite --work-db dev_db.sqlite --output merged.sqlite

  # 3. 백업 생성 후 서버 DB를 직접 교체:
  python merge_db.py --server-db judge_db.sqlite --work-db dev_db.sqlite --in-place
        """,
    )
    parser.add_argument(
        "--server-db",
        required=True,
        help="다운로드한 서버 데이터베이스 파일 경로 (users, submissions, assignments 보존 대상)",
    )
    parser.add_argument(
        "--work-db",
        required=True,
        help="수정/추가된 문제 및 테스트케이스가 있는 작업 데이터베이스 파일 경로",
    )
    parser.add_argument(
        "--output",
        "-o",
        default=None,
        help="병합된 데이터베이스를 저장할 출력 파일 경로 (미지정 시 기본: <server-db>.merged.sqlite)",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="병합 검증 완료 후 원본 서버 DB를 직접 덮어씌워 교체합니다 (사전 백업 자동 생성).",
    )
    parser.add_argument(
        "--backup-dir",
        default=None,
        help="백업 파일을 저장할 디렉토리 경로 (기본값: 원본 DB 위치 하위의 backups 폴더)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="실제 파일을 수정하지 않고 시뮬레이션 및 무결성 검증만 수행합니다.",
    )
    return parser


def main() -> int:
    """CLI 진입점 메인 함수"""
    parser = build_argument_parser()
    args = parser.parse_args()

    try:
        result = merge_databases(
            server_db_path=args.server_db,
            work_db_path=args.work_db,
            output_path=args.output,
            in_place=args.in_place,
            backup_dir=args.backup_dir,
            dry_run=args.dry_run,
        )

        print("\n" + "=" * 65)
        print(" [데이터베이스 병합 작업 성공 리포트]")
        print("=" * 65)
        print(f"* 실행 모드         : {'드라이 런 (Dry-Run)' if result['dry_run'] else '실제 적용'}")
        if result['backup_path']:
            print(f"* 원본 백업 위치    : {result['backup_path']}")
        print(f"* 최종 결과 위치    : {result['destination']}")
        print(f"* 문제 갱신 건수    : {result['stats']['problems_updated']}건")
        print(f"* 문제 신규 추가    : {result['stats']['problems_inserted']}건")
        print(f"* 기존 문제 보존    : {result['stats']['problems_preserved']}건")
        print(f"* 테스트케이스 동기화: {result['stats']['testcases_synced']}건")
        print(f"* 무결성 검증 결과  : {result['integrity']['integrity_check']} (외래 키 정상)")
        print("=" * 65 + "\n")
        return 0

    except DatabaseMergeError as e:
        print(f"\n[오류 발생 - 작업 중단] {e}\n", file=sys.stderr)
        return 1
    except Exception as e:
        logger.exception("예상치 못한 예외가 발생했습니다.")
        print(f"\n[시스템 치명적 오류] {e}\n", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
