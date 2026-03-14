import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'coding_platform.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print("데이터베이스 파일이 존재하지 않습니다.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # problems 테이블에 problem_type 열을 추가합니다 (기본값: 'coding')
        print("problems 테이블에 problem_type 컬럼 추가 중...")
        cursor.execute("ALTER TABLE problems ADD COLUMN problem_type TEXT DEFAULT 'coding';")
        print("[성공] problem_type 추가 완료!")
        
    except sqlite3.OperationalError as e:
        # 이미 열이 존재하는 경우 에러가 발생합니다.
        print(f"[안내] {e} (이미 마이그레이션이 완료되었을 수 있습니다.)")
    except Exception as e:
        print(f"[오류] 데이터베이스 마이그레이션 중 오류 발생: {e}")

    conn.commit()
    conn.close()
    print("마이그레이션 8(문제 유형 분리) 스크립트가 종료되었습니다.")

if __name__ == '__main__':
    migrate()
