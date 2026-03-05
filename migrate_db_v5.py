import sqlite3
import os

DB_FILENAME = 'judge_db.sqlite'

def migrate_v5():
    """
    15단계 마이그레이션:
    1. problems 테이블의 기존 initial_code 컬럼을 파이썬/자바 언어별로 분리하기 위해
       기존 initial_code를 initial_code_python으로 이름 변경하려 했으나, 
       SQLite의 ALTER TABLE RENAME COLUMN은 버전에 따라 지원하지 않을 수 있으므로 
       가장 안전하게 신규 컬럼 2개를 모두 추가하고 기존 데이터를 복사하는 방식으로 진행합니다.
    """
    if not os.path.exists(DB_FILENAME):
        print(f"[-] 데이터베이스 파일 {DB_FILENAME}이 존재하지 않아 마이그레이션을 취소합니다.")
        return

    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    try:
        # 현재 테이블 컬럼 정보 확인
        cursor.execute("PRAGMA table_info(problems)")
        columns = [row[1] for row in cursor.fetchall()]
        
        # 1. initial_code_python 파내기
        if 'initial_code_python' not in columns:
            print("[+] initial_code_python 컬럼 추가 중...")
            cursor.execute("ALTER TABLE problems ADD COLUMN initial_code_python TEXT DEFAULT ''")
            
            # 기존 initial_code 값이 있었다면 파이썬 쪽으로 데이터를 이관
            if 'initial_code' in columns:
                print("[+] 기존 initial_code 데이터를 initial_code_python 으로 안전하게 이관 중...")
                cursor.execute("UPDATE problems SET initial_code_python = initial_code")
                
        # 2. initial_code_java 파내기
        if 'initial_code_java' not in columns:
            print("[+] initial_code_java 컬럼 추가 중...")
            cursor.execute("ALTER TABLE problems ADD COLUMN initial_code_java TEXT DEFAULT ''")

        conn.commit()
        print("= 15단계 DB 마이그레이션(v5) 완료: 파이썬/자바 투트랙 분리 성공 =")

    except Exception as e:
        print("[-] 마이그레이션 중 오류 발생:", e)
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_v5()
