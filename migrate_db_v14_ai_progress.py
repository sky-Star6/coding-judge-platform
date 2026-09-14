"""
데이터베이스 마이그레이션 스크립트 (Database Migration Script) - 버전 14 (v14)
AI 교육과정 학습 진도 관리 테이블(ai_lesson_progress) 생성 스크립트입니다.

[주의 사항 / Caution]
- 본 스크립트는 사전 정의 전용 마이그레이션 스크립트이며, 명시적 승인 전까지 자동으로 실행되지 않습니다.
- 실제 실행 시점에 단 1회의 타임스탬프 기반 데이터베이스 백업(Timestamped Backup)을 안전하게 수행합니다.
- 외래 키 제약 조건(Foreign Key Constraint)을 활성화하고 테이블을 생성한 뒤, 무결성 검사(Integrity Check) 결과를 보고합니다.
"""

import os
import shutil
import sqlite3
from datetime import datetime

# 프로젝트 기본 디렉터리 경로(Base Directory) 및 SQLite 데이터베이스 파일 경로 정의
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE_PATH = os.path.join(BASE_DIR, 'judge_db.sqlite')


def run_migration():
    """
    ai_lesson_progress 테이블을 안전하게 생성하고 외래 키 및 데이터베이스 무결성을 검사합니다.
    실제 실행 시점에 1회 타임스탬프 백업을 수행합니다.
    """
    print("[v14 AI 진도 마이그레이션] 시작: AI 교육과정 진도 테이블 생성 준비")

    # 1. 데이터베이스 파일 존재 여부 검증
    if not os.path.exists(DATABASE_FILE_PATH):
        print(f"[오류] 대상 데이터베이스 파일을 찾을 수 없습니다: {DATABASE_FILE_PATH}")
        return

    # 2. 실행 시점에 단 1회 타임스탬프 백업(Timestamped Backup) 수행
    backup_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file_name = f"judge_db.backup_{backup_timestamp}.sqlite"
    backup_file_path = os.path.join(BASE_DIR, backup_file_name)

    try:
        shutil.copyfile(DATABASE_FILE_PATH, backup_file_path)
        print(f"- [백업 완료] 안전한 마이그레이션을 위해 데이터베이스를 백업했습니다: {backup_file_name}")
    except Exception as backup_error:
        print(f"[치명적 오류] 데이터베이스 백업 실패로 마이그레이션을 중단합니다: {backup_error}")
        return

    # 3. SQLite 데이터베이스 연결 및 커서 생성
    database_connection = sqlite3.connect(DATABASE_FILE_PATH)
    database_cursor = database_connection.cursor()

    try:
        # SQLite 외래 키 제약 조건(Foreign Key Constraint) 활성화
        database_cursor.execute("PRAGMA foreign_keys = ON;")

        # 4. ai_lesson_progress 테이블 생성 (CREATE TABLE IF NOT EXISTS)
        # - user_id: 사용자 고유 번호 (users 테이블의 id를 참조하는 외래 키)
        # - lesson_id: 학습 단위 식별 문자열 (예: 'lesson_01')
        # - completed_at: 완료 일시 (ISO 8601 UTC 형식 문자열)
        # - UNIQUE(user_id, lesson_id): 동일 사용자의 동일 학습 중복 등록 방지 (멱등성 보장)
        # - FOREIGN KEY(user_id) REFERENCES users(id): 사용자 참조 무결성 유지
        create_table_statement = """
        CREATE TABLE IF NOT EXISTS ai_lesson_progress (
            user_id INTEGER NOT NULL,
            lesson_id TEXT NOT NULL,
            completed_at TEXT NOT NULL,
            UNIQUE(user_id, lesson_id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        """
        database_cursor.execute(create_table_statement)
        print("- [테이블 생성] ai_lesson_progress 테이블이 안전하게 준비되었습니다.")

        # 트랜잭션(Transaction) 커밋(Commit)
        database_connection.commit()
        print("- [커밋 완료] 변경 사항이 데이터베이스에 정상적으로 반영되었습니다.")

        # 5. 외래 키 제약 조건 검사(Foreign Key Check) 수행 및 결과 보고
        database_cursor.execute("PRAGMA foreign_key_check;")
        foreign_key_violations = database_cursor.fetchall()
        if foreign_key_violations:
            print(f"[경고] 외래 키 위반(Foreign Key Violations) 감지됨: {foreign_key_violations}")
        else:
            print("- [외래 키 검증] 외래 키 제약 조건 검사(Foreign Key Check) 통과: 위반 항목 없음")

        # 6. 데이터베이스 무결성 검사(Integrity Check) 수행 및 결과 보고
        database_cursor.execute("PRAGMA integrity_check;")
        integrity_check_results = database_cursor.fetchall()
        print(f"- [무결성 검증] 데이터베이스 무결성 검사(Integrity Check) 결과: {integrity_check_results}")

        print("[v14 AI 진도 마이그레이션] 성공적으로 완료되었습니다!")

    except sqlite3.Error as migration_error:
        # 오류 발생 시 변경 사항 롤백(Rollback)
        database_connection.rollback()
        print(f"[오류 발생] 마이그레이션 실패 및 롤백(Rollback) 수행: {migration_error}")
    finally:
        database_connection.close()


if __name__ == '__main__':
    run_migration()
