import sqlite3

def migrate_v6():
    """
    [17단계] problems 테이블에 display_id(표시용 문제 번호) 컬럼 추가
    기존 데이터는 현재 부여된 id 값과 동일하게 초기 설정하여 관리자에게 혼선이 없도록 함.
    """
    db_file = 'judge_db.sqlite'
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    try:
        # 1. 컬럼 존재 여부 확인
        cursor.execute("PRAGMA table_info(problems)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'display_id' not in columns:
            print("[v6 마이그레이션] 'problems' 테이블에 'display_id' 컬럼을 추가합니다...")
            # display_id 컬럼 추가 (디폴트는 0)
            cursor.execute("ALTER TABLE problems ADD COLUMN display_id INTEGER DEFAULT 0")
            
            # 기존 문제들의 display_id 를 시스템 id 와 동일하게 초기값으로 덮어씀
            cursor.execute("UPDATE problems SET display_id = id")
            
            # 변경사항 저장
            conn.commit()
            print("- 'display_id' 컬럼 생성 및 데이터 복사 완료!")
        else:
            print("[v6 마이그레이션] 이미 'display_id' 컬럼이 존재합니다. 생략합니다.")

    except Exception as e:
        print(f"마이그레이션 중 오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_v6()
