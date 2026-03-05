import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def migrate():
    """14단계: problems 테이블에 초기 뼈대 코드(initial_code) 컬럼 추가"""
    print("--- 14단계 DB 마이그레이션 시작 ---")
    
    if not os.path.exists(DB_FILENAME):
        print("오류: 데이터베이스 파일이 존재하지 않습니다.")
        return

    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    try:
        # 기존 problems 테이블에 initial_code 컬럼이 있는지 확인
        cursor.execute("PRAGMA table_info(problems)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'initial_code' not in columns:
            print("[진행 중] problems 테이블에 'initial_code' 컬럼을 추가합니다...")
            cursor.execute("ALTER TABLE problems ADD COLUMN initial_code TEXT DEFAULT ''")
            print("=> 성공: initial_code 컬럼이 안전하게 추가되었습니다.")
        else:
            print("=> 안내: initial_code 컬럼이 이미 존재합니다. (건너뜀)")
            
        conn.commit()
        print("--- 14단계 마이그레이션 완료 ---")
        
    except Exception as e:
        print(f"마이그레이션 중 오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
