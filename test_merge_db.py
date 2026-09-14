# -*- coding: utf-8 -*-
"""
데이터베이스 병합 도구 테스트 모듈 (Database Merge Tool Test Suite)
===================================================================
이 테스트 스위트는 merge_db.py의 모든 핵심 기능과 안전 장치를 철저하게 검증합니다.

테스트 시나리오:
1. 정상 병합 (Happy Path):
   - 서버 DB의 users, submissions, assignments 보존 검증
   - 작업 DB의 problems 수정 사항 갱신 및 신규 문제 추가 검증
   - test_cases 최신 데이터 동기화 검증
   - PRAGMA integrity_check 및 foreign_key_check 통과 검증
2. 외래 키 충돌 감지 및 즉시 중단 (Conflict Detection & Abort):
   - 서버 DB의 submissions가 참조하는 문제가 작업 DB에서 누락된 경우 충돌 감지
   - 충돌 시 작업이 즉시 중단되고 서버 원본 DB가 100% 보존되는지 검증
3. 백업 생성 및 무결성 검증 (Backup Verification):
   - 병합 전 타임스탬프 백업 파일 생성 및 무결성 검증
4. 격리된 임시 파일 작업 및 롤백 검증 (Isolation & Rollback):
   - 중간 오류 발생 시 임시 파일 정리 및 원본 불변성 보증
5. 드라이 런(Dry-Run) 시뮬레이션 검증:
   - dry_run=True 시 실제 파일 변경 없이 검증 및 통계 반환 확인
6. 출력 경로 지정(--output) 및 직접 교체(--in-place) 검증:
   - 각 모드별 대상 파일 생성 및 정상 동작 확인
7. CLI 커맨드라인 인터페이스(CLI) 실행 검증:
   - subprocess를 통한 CLI 호출 및 종료 코드(Exit code) 확인
"""

import os
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import unittest

# 테스트 대상 모듈 임포트
import merge_db
from merge_db import (
    BackupFailedError,
    ConflictDetectedError,
    DatabaseMergeError,
    IntegrityCheckFailedError,
    create_database_backup,
    detect_conflicts,
    merge_databases,
    merge_problems_and_testcases,
    verify_database_integrity,
)


class TestDatabaseMerge(unittest.TestCase):
    """서버 DB와 작업 DB 병합 기능에 대한 포괄적인 단위 및 통합 테스트 클래스"""

    def setUp(self):
        """각 테스트 메서드 실행 전에 독립된 임시 디렉토리와 테스트 DB를 생성합니다."""
        # 격리된 임시 테스트 디렉토리 생성
        self.test_dir = tempfile.mkdtemp(prefix="test_db_merge_")
        self.server_db_path = os.path.join(self.test_dir, "server_db.sqlite")
        self.work_db_path = os.path.join(self.test_dir, "work_db.sqlite")
        self.backup_dir = os.path.join(self.test_dir, "backups")

        # 1. 서버 데이터베이스 초기화 (기존 운영 데이터 구축)
        self._init_server_db()

        # 2. 작업 데이터베이스 초기화 (문제 출제/수정 데이터 구축)
        self._init_work_db()

    def tearDown(self):
        """테스트 종료 후 생성된 모든 임시 파일과 디렉토리를 안전하게 삭제합니다."""
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def _init_server_db(self):
        """서버 DB 스키마 생성 및 사용자/제출/과제/기존문제 샘플 데이터 삽입"""
        conn = sqlite3.connect(self.server_db_path)
        cursor = conn.cursor()

        # 사용자 테이블 (Users)
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nickname TEXT NOT NULL,
                role TEXT DEFAULT 'level_3',
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 문제 테이블 (Problems)
        cursor.execute("""
            CREATE TABLE problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_id INTEGER DEFAULT 0,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty INTEGER DEFAULT 1,
                time_limit REAL DEFAULT 1.0,
                memory_limit INTEGER DEFAULT 128,
                initial_code_python TEXT DEFAULT '',
                initial_code_java TEXT DEFAULT '',
                supported_languages TEXT DEFAULT 'python3,java',
                prevent_copy BOOLEAN DEFAULT 0,
                is_hidden BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 테스트 케이스 테이블 (Test Cases)
        cursor.execute("""
            CREATE TABLE test_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id INTEGER NOT NULL,
                input_data TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_public BOOLEAN DEFAULT 1,
                FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
            )
        """)

        # 제출 기록 테이블 (Submissions)
        cursor.execute("""
            CREATE TABLE submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                problem_id INTEGER NOT NULL,
                language TEXT NOT NULL,
                code TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                time_used REAL,
                memory_used INTEGER,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
            )
        """)

        # 과제 테이블 (Assignments)
        cursor.execute("""
            CREATE TABLE assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                target_type TEXT DEFAULT 'all',
                target_value TEXT DEFAULT '',
                start_time TEXT,
                end_time TEXT,
                problem_ids TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 더미 데이터 삽입
        # 사용자 2명
        cursor.execute("INSERT INTO users (id, username, password, nickname, role) VALUES (1, 'admin', 'pass1', '관리자', 'admin')")
        cursor.execute("INSERT INTO users (id, username, password, nickname, role) VALUES (2, 'student1', 'pass2', '학생1', 'level_3')")

        # 기존 문제 2개 (ID: 101, 102)
        cursor.execute("""
            INSERT INTO problems (id, display_id, title, description, difficulty, time_limit)
            VALUES (101, 1, '두 수의 합', 'A와 B를 더하시오.', 1, 1.0)
        """)
        cursor.execute("""
            INSERT INTO problems (id, display_id, title, description, difficulty, time_limit)
            VALUES (102, 2, '두 수의 차', 'A에서 B를 빼시오.', 1, 1.0)
        """)

        # 기존 테스트케이스
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (101, '1 2', '3')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (101, '5 7', '12')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (102, '5 2', '3')")

        # 제출 기록 2건 (사용자 2가 101번과 102번에 제출)
        cursor.execute("""
            INSERT INTO submissions (id, user_id, problem_id, language, code, status)
            VALUES (1, 2, 101, 'python3', 'print(sum(map(int, input().split())))', 'AC')
        """)
        cursor.execute("""
            INSERT INTO submissions (id, user_id, problem_id, language, code, status)
            VALUES (2, 2, 102, 'python3', 'a, b = map(int, input().split()); print(a-b)', 'AC')
        """)

        # 과제 1건 (101번, 102번 문제 포함)
        cursor.execute("""
            INSERT INTO assignments (id, title, problem_ids)
            VALUES (1, '1주차 사칙연산 과제', '101,102')
        """)

        conn.commit()
        conn.close()

    def _init_work_db(self):
        """작업 DB 스키마 생성 및 수정된 문제/신규 문제/새로운 테스트케이스 삽입"""
        conn = sqlite3.connect(self.work_db_path)
        cursor = conn.cursor()

        # 작업 DB는 problems와 test_cases 위주
        cursor.execute("""
            CREATE TABLE problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_id INTEGER DEFAULT 0,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty INTEGER DEFAULT 1,
                time_limit REAL DEFAULT 1.0,
                memory_limit INTEGER DEFAULT 128,
                initial_code_python TEXT DEFAULT '',
                initial_code_java TEXT DEFAULT '',
                supported_languages TEXT DEFAULT 'python3,java',
                prevent_copy BOOLEAN DEFAULT 0,
                is_hidden BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE test_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id INTEGER NOT NULL,
                input_data TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_public BOOLEAN DEFAULT 1,
                FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
            )
        """)

        # 작업 내용:
        # 1. 101번 문제: 제목 및 설명 수정, 시간제한 2.0초로 변경 (UPDATE 대상)
        cursor.execute("""
            INSERT INTO problems (id, display_id, title, description, difficulty, time_limit)
            VALUES (101, 1, '두 수의 합 (수정본)', 'A와 B를 입력받아 합을 구하세요.', 2, 2.0)
        """)

        # 2. 102번 문제: 내용 유지하되 설명 보강 (UPDATE 대상)
        cursor.execute("""
            INSERT INTO problems (id, display_id, title, description, difficulty, time_limit)
            VALUES (102, 2, '두 수의 차', 'A와 B의 차를 구하세요.', 1, 1.0)
        """)

        # 3. 103번 문제: 신규 문제 추가 (INSERT 대상)
        cursor.execute("""
            INSERT INTO problems (id, display_id, title, description, difficulty, time_limit)
            VALUES (103, 3, '두 수의 곱', 'A와 B의 곱을 구하세요.', 1, 1.5)
        """)

        # 테스트케이스 설정:
        # 101번: 기존 2개에서 3개로 확장
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (101, '1 2', '3')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (101, '10 20', '30')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (101, '-5 5', '0')")

        # 102번: 기존 1개 유지
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (102, '5 2', '3')")

        # 103번: 신규 2개
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (103, '3 4', '12')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (103, '0 10', '0')")

        conn.commit()
        conn.close()

    # -------------------------------------------------------------
    # 1. 정상 병합 테스트 (Happy Path)
    # -------------------------------------------------------------

    def test_successful_merge_with_output_file(self):
        """병합 결과가 지정된 출력 파일에 올바르게 저장되고 보존/병합 데이터가 정확한지 검증"""
        output_db_path = os.path.join(self.test_dir, "merged_result.sqlite")

        result = merge_databases(
            server_db_path=self.server_db_path,
            work_db_path=self.work_db_path,
            output_path=output_db_path,
            backup_dir=self.backup_dir,
        )

        self.assertTrue(result["success"])
        self.assertTrue(os.path.exists(output_db_path))
        self.assertIsNotNone(result["backup_path"])
        self.assertTrue(os.path.exists(result["backup_path"]))

        # 병합된 DB 결과 검증
        conn = sqlite3.connect(output_db_path)
        cursor = conn.cursor()

        # 1. 사용자(Users) 보존 검증: 2명 그대로 유지
        cursor.execute("SELECT COUNT(*), GROUP_CONCAT(username) FROM users")
        user_count, usernames = cursor.fetchone()
        self.assertEqual(user_count, 2)
        self.assertIn("admin", usernames)
        self.assertIn("student1", usernames)

        # 2. 제출 기록(Submissions) 보존 검증: 2건 그대로 유지
        cursor.execute("SELECT COUNT(*) FROM submissions")
        self.assertEqual(cursor.fetchone()[0], 2)

        # 3. 과제(Assignments) 보존 검증: 1건 그대로 유지
        cursor.execute("SELECT COUNT(*) FROM assignments")
        self.assertEqual(cursor.fetchone()[0], 1)

        # 4. 문제(Problems) 병합 검증: 총 3건 (101 수정, 102 갱신, 103 신규)
        cursor.execute("SELECT COUNT(*) FROM problems")
        self.assertEqual(cursor.fetchone()[0], 3)

        # 101번 문제가 수정되었는지 확인
        cursor.execute("SELECT title, time_limit, difficulty FROM problems WHERE id = 101")
        p101 = cursor.fetchone()
        self.assertEqual(p101[0], "두 수의 합 (수정본)")
        self.assertEqual(p101[1], 2.0)
        self.assertEqual(p101[2], 2)

        # 103번 신규 문제가 추가되었는지 확인
        cursor.execute("SELECT title FROM problems WHERE id = 103")
        p103 = cursor.fetchone()
        self.assertIsNotNone(p103)
        self.assertEqual(p103[0], "두 수의 곱")

        # 5. 테스트케이스(test_cases) 동기화 검증: 총 6건 (101번 3건, 102번 1건, 103번 2건)
        cursor.execute("SELECT COUNT(*) FROM test_cases")
        self.assertEqual(cursor.fetchone()[0], 6)

        cursor.execute("SELECT COUNT(*) FROM test_cases WHERE problem_id = 101")
        self.assertEqual(cursor.fetchone()[0], 3)

        cursor.execute("SELECT COUNT(*) FROM test_cases WHERE problem_id = 103")
        self.assertEqual(cursor.fetchone()[0], 2)

        # 6. SQLite 무결성 검증
        cursor.execute("PRAGMA integrity_check")
        self.assertEqual(cursor.fetchone()[0], "ok")
        cursor.execute("PRAGMA foreign_key_check")
        self.assertEqual(len(cursor.fetchall()), 0)

        conn.close()

    def test_successful_merge_in_place(self):
        """--in-place 옵션 사용 시 원본 서버 DB가 직접 갱신되고 백업이 남는지 검증"""
        # 병합 전 원본 DB 파일 수정 시간 및 내용 확인
        result = merge_databases(
            server_db_path=self.server_db_path,
            work_db_path=self.work_db_path,
            in_place=True,
            backup_dir=self.backup_dir,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["destination"], os.path.abspath(self.server_db_path))

        # 백업 파일이 잘 생성되었는지 확인
        self.assertIsNotNone(result["backup_path"])
        self.assertTrue(os.path.exists(result["backup_path"]))

        # 서버 DB가 실제로 업데이트되었는지 확인
        conn = sqlite3.connect(self.server_db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT title FROM problems WHERE id = 101")
        self.assertEqual(cursor.fetchone()[0], "두 수의 합 (수정본)")
        cursor.execute("SELECT COUNT(*) FROM users")
        self.assertEqual(cursor.fetchone()[0], 2)
        conn.close()

    # -------------------------------------------------------------
    # 2. 충돌 감지 및 즉시 중단 테스트 (Conflict Detection)
    # -------------------------------------------------------------

    def test_conflict_aborts_when_submitted_problem_is_missing_in_work_db(self):
        """
        서버 DB의 제출 기록(submissions)이 참조하는 문제(102번)가
        작업 DB에서 임의로 삭제된 경우 충돌 감지 및 즉시 중단(Abort)되는지 검증
        """
        # 작업 DB에서 102번 문제 삭제
        work_conn = sqlite3.connect(self.work_db_path)
        work_conn.execute("DELETE FROM test_cases WHERE problem_id = 102")
        work_conn.execute("DELETE FROM problems WHERE id = 102")
        work_conn.commit()
        work_conn.close()

        # 서버 DB의 원본 크기 및 체크섬(행 수) 저장
        server_conn = sqlite3.connect(self.server_db_path)
        original_user_count = server_conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        original_sub_count = server_conn.execute("SELECT COUNT(*) FROM submissions").fetchone()[0]
        original_prob_count = server_conn.execute("SELECT COUNT(*) FROM problems").fetchone()[0]
        server_conn.close()

        output_db_path = os.path.join(self.test_dir, "should_not_exist.sqlite")

        # 병합 시도 시 ConflictDetectedError 발생 확인
        with self.assertRaises(ConflictDetectedError) as context:
            merge_databases(
                server_db_path=self.server_db_path,
                work_db_path=self.work_db_path,
                output_path=output_db_path,
                backup_dir=self.backup_dir,
            )

        # 에러 메시지에 충돌 이유(102번 문제) 명시 확인
        self.assertIn("102", str(context.exception))
        self.assertIn("submissions", str(context.exception))

        # 출력 파일이 생성되지 않았는지 확인
        self.assertFalse(os.path.exists(output_db_path))

        # 원본 서버 DB가 100% 온전히 보존되었는지 검증
        server_conn = sqlite3.connect(self.server_db_path)
        self.assertEqual(server_conn.execute("SELECT COUNT(*) FROM users").fetchone()[0], original_user_count)
        self.assertEqual(server_conn.execute("SELECT COUNT(*) FROM submissions").fetchone()[0], original_sub_count)
        self.assertEqual(server_conn.execute("SELECT COUNT(*) FROM problems").fetchone()[0], original_prob_count)
        server_conn.close()

    def test_conflict_aborts_when_work_db_has_invalid_foreign_keys(self):
        """작업 DB의 test_cases가 존재하지 않는 문제를 참조하는 경우 충돌 감지 확인"""
        work_conn = sqlite3.connect(self.work_db_path)
        # 999번 문제(존재하지 않음)에 대한 테스트케이스 삽입
        work_conn.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (999, '0', '0')")
        work_conn.commit()
        work_conn.close()

        with self.assertRaises(ConflictDetectedError) as context:
            merge_databases(
                server_db_path=self.server_db_path,
                work_db_path=self.work_db_path,
                backup_dir=self.backup_dir,
            )
        self.assertIn("999", str(context.exception))

    def test_missing_required_tables_raises_conflict(self):
        """서버 DB나 작업 DB에 필수 테이블이 누락된 경우 즉시 에러 발생 확인"""
        empty_db_path = os.path.join(self.test_dir, "empty.sqlite")
        conn = sqlite3.connect(empty_db_path)
        conn.execute("CREATE TABLE dummy (id INT)")
        conn.commit()
        conn.close()

        with self.assertRaises(ConflictDetectedError):
            merge_databases(
                server_db_path=empty_db_path,
                work_db_path=self.work_db_path,
                backup_dir=self.backup_dir,
            )

    # -------------------------------------------------------------
    # 3. 백업 생성 및 무결성 검증
    # -------------------------------------------------------------

    def test_create_database_backup_creates_valid_file(self):
        """백업 생성 함수가 유효하고 손상 없는 SQLite 백업본을 만드는지 검증"""
        backup_path = create_database_backup(self.server_db_path, self.backup_dir)

        self.assertTrue(os.path.exists(backup_path))
        self.assertEqual(os.path.getsize(backup_path), os.path.getsize(self.server_db_path))

        # 백업 DB 쿼리 가능 여부 확인
        conn = sqlite3.connect(backup_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        self.assertEqual(cursor.fetchone()[0], "ok")
        cursor.execute("SELECT COUNT(*) FROM users")
        self.assertEqual(cursor.fetchone()[0], 2)
        conn.close()

    def test_backup_nonexistent_file_raises_error(self):
        """존재하지 않는 파일을 백업하려 할 때 BackupFailedError 발생 확인"""
        with self.assertRaises(BackupFailedError):
            create_database_backup(os.path.join(self.test_dir, "nonexistent.db"))

    # -------------------------------------------------------------
    # 4. 드라이 런(Dry-Run) 시뮬레이션 검증
    # -------------------------------------------------------------

    def test_dry_run_mode_does_not_modify_files(self):
        """드라이 런 모드에서는 백업 파일이나 결과 파일이 생성/수정되지 않는지 검증"""
        original_server_mtime = os.path.getmtime(self.server_db_path)
        output_db_path = os.path.join(self.test_dir, "dry_run_output.sqlite")

        result = merge_databases(
            server_db_path=self.server_db_path,
            work_db_path=self.work_db_path,
            output_path=output_db_path,
            backup_dir=self.backup_dir,
            dry_run=True,
        )

        self.assertTrue(result["success"])
        self.assertTrue(result["dry_run"])
        self.assertIsNone(result["backup_path"])

        # 출력 파일이 생성되지 않아야 함
        self.assertFalse(os.path.exists(output_db_path))

        # 서버 원본 DB 내용이 변경되지 않았는지 확인
        conn = sqlite3.connect(self.server_db_path)
        title = conn.execute("SELECT title FROM problems WHERE id = 101").fetchone()[0]
        self.assertEqual(title, "두 수의 합")  # 수정본이 아닌 원본 제목 유지
        conn.close()

    # -------------------------------------------------------------
    # 5. 무결성 검증 세부 테스트 (Integrity Verification)
    # -------------------------------------------------------------

    def test_verify_database_integrity_catches_tampered_users(self):
        """사용자(users) 테이블 행 수가 임의로 변조/유실된 경우 무결성 검증 실패 확인"""
        conn = sqlite3.connect(self.server_db_path)
        # 사용자 1명 임의 삭제
        conn.execute("DELETE FROM users WHERE id = 2")
        conn.commit()

        pre_counts = {"users": 2, "submissions": 2, "assignments": 1, "problems": 2, "test_cases": 3}

        with self.assertRaises(IntegrityCheckFailedError) as context:
            verify_database_integrity(conn, pre_counts)

        self.assertIn("users", str(context.exception))
        conn.close()

    # -------------------------------------------------------------
    # 6. CLI 인터페이스 실행 검증 (Subprocess Test)
    # -------------------------------------------------------------

    def test_cli_execution_success(self):
        """CLI 명령어로 실행했을 때 성공(Exit Code 0) 및 출력 확인"""
        output_db_path = os.path.join(self.test_dir, "cli_output.sqlite")
        cmd = [
            sys.executable,
            os.path.join(os.path.dirname(__file__), "merge_db.py"),
            "--server-db", self.server_db_path,
            "--work-db", self.work_db_path,
            "--output", output_db_path,
            "--backup-dir", self.backup_dir,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"CLI 실패: {result.stderr}")
        self.assertIn("데이터베이스 병합 작업 성공 리포트", result.stdout)
        self.assertTrue(os.path.exists(output_db_path))

    def test_cli_execution_dry_run(self):
        """CLI --dry-run 명령어로 실행했을 때 성공 및 파일 미생성 확인"""
        output_db_path = os.path.join(self.test_dir, "cli_dry_run.sqlite")
        cmd = [
            sys.executable,
            os.path.join(os.path.dirname(__file__), "merge_db.py"),
            "--server-db", self.server_db_path,
            "--work-db", self.work_db_path,
            "--output", output_db_path,
            "--dry-run",
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, f"CLI 실패: {result.stderr}")
        self.assertIn("드라이 런 (Dry-Run)", result.stdout)
        self.assertFalse(os.path.exists(output_db_path))


try:
    os.environ.setdefault("FLASK_TESTING", "1")
    import flask
    import app as flask_app_module
    from app import app
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


@unittest.skipUnless(HAS_FLASK, "Flask 환경이 아니므로 API 엔드포인트 테스트를 건너뜁니다.")
class TestDatabaseMergeApi(unittest.TestCase):
    """Flask 웹 애플리케이션의 관리자 DB 병합 API (/api/admin/database/merge) 검증 테스트"""

    def setUp(self):
        """임시 테스트 디렉토리 및 격리된 DB 환경 구성"""
        self.temp_dir = tempfile.mkdtemp(prefix="test_api_merge_")
        self.server_db_path = os.path.join(self.temp_dir, "server_judge.sqlite")
        self.work_db_path = os.path.join(self.temp_dir, "work_judge.sqlite")

        # app.py DB 경로 임시 교체
        self.original_db_filename = flask_app_module.DB_FILENAME
        self.original_base_dir = flask_app_module.BASE_DIR
        flask_app_module.DB_FILENAME = self.server_db_path
        flask_app_module.BASE_DIR = self.temp_dir

        # DB 초기화
        self._init_server_db()
        self._init_work_db()

        app.config["TESTING"] = True
        self.client = app.test_client()

    def _set_session_user(self, user_id, role):
        with self.client.session_transaction() as flask_session:
            flask_session["user_id"] = user_id
            flask_session["role"] = role

    def tearDown(self):
        """설정 복구 및 임시 디렉토리 삭제"""
        flask_app_module.DB_FILENAME = self.original_db_filename
        flask_app_module.BASE_DIR = self.original_base_dir
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _init_server_db(self):
        conn = sqlite3.connect(self.server_db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nickname TEXT NOT NULL,
                role TEXT DEFAULT 'level_3',
                is_active BOOLEAN DEFAULT 1
            )
        """)
        cursor.execute("""
            CREATE TABLE problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_id INTEGER DEFAULT 0,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty INTEGER DEFAULT 1,
                time_limit REAL DEFAULT 1.0,
                memory_limit INTEGER DEFAULT 128
            )
        """)
        cursor.execute("""
            CREATE TABLE test_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id INTEGER NOT NULL,
                input_data TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_public BOOLEAN DEFAULT 1,
                FOREIGN KEY (problem_id) REFERENCES problems (id)
            )
        """)
        cursor.execute("""
            CREATE TABLE submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                problem_id INTEGER NOT NULL,
                language TEXT NOT NULL,
                code TEXT NOT NULL,
                status TEXT DEFAULT 'AC',
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (problem_id) REFERENCES problems (id)
            )
        """)
        cursor.execute("""
            CREATE TABLE assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                problem_ids TEXT NOT NULL
            )
        """)
        # 1: 관리자, 2: 일반학생
        cursor.execute("INSERT INTO users (id, username, password, nickname, role, is_active) VALUES (1, 'admin', 'p1', '관리자', 'admin', 1)")
        cursor.execute("INSERT INTO users (id, username, password, nickname, role, is_active) VALUES (2, 'student', 'p2', '학생', 'level_3', 1)")
        cursor.execute("INSERT INTO problems (id, display_id, title, description) VALUES (1, 1, '문제1', '설명1')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (1, 'in', 'out')")
        cursor.execute("INSERT INTO submissions (user_id, problem_id, language, code) VALUES (2, 1, 'python3', 'pass')")
        cursor.execute("INSERT INTO assignments (title, problem_ids) VALUES ('과제1', '1')")
        conn.commit()
        conn.close()

    def _init_work_db(self):
        conn = sqlite3.connect(self.work_db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_id INTEGER DEFAULT 0,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty INTEGER DEFAULT 1,
                time_limit REAL DEFAULT 1.0,
                memory_limit INTEGER DEFAULT 128
            )
        """)
        cursor.execute("""
            CREATE TABLE test_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id INTEGER NOT NULL,
                input_data TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_public BOOLEAN DEFAULT 1
            )
        """)
        cursor.execute("INSERT INTO problems (id, display_id, title, description) VALUES (1, 1, '문제1(수정)', '새설명')")
        cursor.execute("INSERT INTO problems (id, display_id, title, description) VALUES (2, 2, '신규문제2', '설명2')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (1, 'in_new', 'out_new')")
        cursor.execute("INSERT INTO test_cases (problem_id, input_data, expected_output) VALUES (2, 'in2', 'out2')")
        conn.commit()
        conn.close()

    def test_merge_api_without_auth_returns_401(self):
        """인증 정보 없이 API 호출 시 401 Unauthorized 반환 확인"""
        response = self.client.post("/api/admin/database/merge", json={"work_db_path": self.work_db_path})
        self.assertEqual(response.status_code, 401)

    def test_merge_api_with_non_admin_returns_403(self):
        """일반 학생 권한으로 API 호출 시 403 Forbidden 차단 확인"""
        self._set_session_user(2, "level_3")
        response = self.client.post("/api/admin/database/merge", json={"work_db_path": self.work_db_path})
        self.assertEqual(response.status_code, 403)

    def test_merge_api_rejects_forged_client_identifiers(self):
        """위조 가능한 헤더와 쿼리 ID는 관리자 권한을 부여하지 않습니다."""
        attempts = [
            ("/api/admin/database/merge", {"Authorization": "Bearer 1"}),
            ("/api/admin/database/merge", {"X-User-Id": "1"}),
            ("/api/admin/database/merge?user_id=1", {}),
        ]
        for path, headers in attempts:
            response = self.client.post(path, headers=headers, json={"work_db_path": self.work_db_path})
            self.assertEqual(response.status_code, 401, path)

    def test_merge_api_rejects_server_db_and_outside_json_paths(self):
        """JSON 경로로 운영 DB 또는 작업 디렉터리 밖 파일을 병합 대상으로 지정할 수 없습니다."""
        self._set_session_user(1, "admin")
        for forbidden_path in (self.server_db_path, os.path.abspath(__file__)):
            response = self.client.post(
                "/api/admin/database/merge",
                json={"work_db_path": forbidden_path},
            )
            self.assertEqual(response.status_code, 400, forbidden_path)

    def test_merge_api_with_admin_success(self):
        """관리자 권한으로 API 호출 시 정상 병합 및 200 반환 확인"""
        self._set_session_user(1, "admin")
        response = self.client.post("/api/admin/database/merge", json={"work_db_path": self.work_db_path})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIsNotNone(data["backup_path"])
        self.assertEqual(data["stats"]["problems_updated"], 1)
        self.assertEqual(data["stats"]["problems_inserted"], 1)

        # 실제 서버 DB 반영 확인
        conn = sqlite3.connect(self.server_db_path)
        title = conn.execute("SELECT title FROM problems WHERE id = 1").fetchone()[0]
        self.assertEqual(title, "문제1(수정)")
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        self.assertEqual(user_count, 2)  # 사용자 보존
        conn.close()

    def test_merge_api_conflict_returns_400(self):
        """충돌 발생 시 400 Bad Request 및 원본 보존 확인"""
        # 작업 DB에서 1번 문제 삭제하여 충돌 유도 (서버 DB의 submissions가 1번 참조 중)
        work_conn = sqlite3.connect(self.work_db_path)
        work_conn.execute("DELETE FROM problems WHERE id = 1")
        work_conn.commit()
        work_conn.close()

        self._set_session_user(1, "admin")
        response = self.client.post("/api/admin/database/merge", json={"work_db_path": self.work_db_path})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("submissions", data["detail"])


if __name__ == "__main__":
    unittest.main()
