import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def migrate():
    print(f"[{DB_FILENAME}] 데이터베이스 마이그레이션 V11을 시작합니다...")
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    try:
        # problems 테이블에 prevent_copy 컬럼 추가
        cursor.execute("ALTER TABLE problems ADD COLUMN prevent_copy BOOLEAN DEFAULT 0")
        print("- 'problems' 테이블에 'prevent_copy' 컬럼이 성공적으로 추가되었습니다.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("- 'prevent_copy' 컬럼이 이미 존재합니다.")
        else:
            print(f"- 오류 발생: {e}")

    conn.commit()
    conn.close()
    print("마이그레이션이 완료되었습니다.")

if __name__ == "__main__":
    migrate()
