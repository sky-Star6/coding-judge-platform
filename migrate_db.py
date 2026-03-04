import sqlite3
import os

DB_FILENAME = 'judge_db.sqlite'

def migrate():
    print(f"[{DB_FILENAME}] 데이터베이스 마이그레이션을 시작합니다 (8단계: Role 추가)...")
    if not os.path.exists(DB_FILENAME):
        print(f"오류: {DB_FILENAME} 파일이 존재하지 않습니다. 먼저 setup_db.py를 실행하세요.")
        return

    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    # 1. users 테이블에 role 컬럼 추가 시도
    try:
        # 새로 가입하는 사용자는 기본적으로 level_3 (초보) 등급을 받습니다.
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'level_3'")
        print("- 'users' 테이블에 'role' 컬럼을 성공적으로 추가했습니다.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("- 'role' 컬럼이 이미 존재합니다. (안전하게 건너뜀)")
        else:
            print(f"- 컬럼 추가 중 오류 발생: {e}")

    # 2. 만약 첫 번째 사용자(id=1) 혹은 'admin'이라는 아이디가 있다면 특권을 부여합니다.
    cursor.execute("UPDATE users SET role = 'admin' WHERE id = 1 OR username = 'admin'")
    print("- 기본 관리자(Admin) 권한 부여 시도 완료.")

    conn.commit()
    conn.close()
    print("마이그레이션이 완료되었습니다!")

if __name__ == "__main__":
    migrate()
