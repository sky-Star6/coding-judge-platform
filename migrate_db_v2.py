import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def migrate_v2():
    print(f"[{DB_FILENAME}] 데이터베이스 2차 마이그레이션을 시작합니다 (9단계: is_active 추가)...")
    if not os.path.exists(DB_FILENAME):
        print(f"오류: {DB_FILENAME} 파일이 존재하지 않습니다.")
        return

    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    # 1. users 테이블에 is_active (활성화 상태) 컬럼 추가 시도
    # 기본값 0(False)로 설정하여, 앞으로 가입하는 모든 회원은 승인 대기로 전환
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 0")
        print("- 'users' 테이블에 'is_active' 컬럼을 성공적으로 추가했습니다.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("- 'is_active' 컬럼이 이미 존재합니다. (안전하게 건너뜀)")
        else:
            print(f"- 컬럼 추가 중 오류 발생: {e}")

    # 2. 그러나 "지금까지" 가입했던 기존 회원들은 사이트 이용에 불편을 겪지 않도록
    #    일괄적으로 모두 승인(is_active = 1) 처리해줍니다. (소급 적용)
    cursor.execute("UPDATE users SET is_active = 1")
    print("- 기존 가입된 모든 회원의 상태를 '승인 완료(1)'로 일괄 전환했습니다.")

    conn.commit()
    conn.close()
    print("2차 마이그레이션이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    migrate_v2()
