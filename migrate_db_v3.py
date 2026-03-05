import sqlite3
import os

DB_FILENAME = 'judge_db.sqlite'

def migrate_v3():
    print(f"[{DB_FILENAME}] 데이터베이스 3차 마이그레이션을 시작합니다 (10단계: 인적사항 추가)...")
    if not os.path.exists(DB_FILENAME):
        print(f"오류: {DB_FILENAME} 파일이 존재하지 않습니다.")
        return

    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    columns_to_add = [
        ("birth_date", "TEXT DEFAULT ''"),     # 생년월일 (예: 20001015)
        ("school_name", "TEXT DEFAULT ''"),    # 소속 학교 (예: 구미고등학교)
        ("grade", "TEXT DEFAULT ''"),          # 학년 (예: 1학년)
        ("phone_number", "TEXT DEFAULT ''")    # 연락처 (예: 010-1234-5678)
    ]

    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"- 'users' 테이블에 '{col_name}' 컬럼을 성공적으로 추가했습니다.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"- '{col_name}' 컬럼이 이미 존재합니다. (안전하게 건너뜀)")
            else:
                print(f"- '{col_name}' 컬럼 추가 중 오류 발생: {e}")

    conn.commit()
    conn.close()
    print("3차 마이그레이션이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    migrate_v3()
