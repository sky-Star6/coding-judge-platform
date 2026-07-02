import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

conn = sqlite3.connect(DB_FILENAME)
cursor = conn.cursor()

try:
    print("[v13 마이그레이션] 시작: 등급 통합 및 숨긴 문제 컬럼 추가")

    # 1. users 테이블에 can_view_hidden 컬럼 추가
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'can_view_hidden' not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN can_view_hidden BOOLEAN DEFAULT 0")
        print("- users 테이블에 can_view_hidden 컬럼 추가 완료")

    # 2. problems 테이블에 is_hidden 컬럼 추가
    cursor.execute("PRAGMA table_info(problems)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'is_hidden' not in columns:
        cursor.execute("ALTER TABLE problems ADD COLUMN is_hidden BOOLEAN DEFAULT 0")
        print("- problems 테이블에 is_hidden 컬럼 추가 완료")

    # 3. users 테이블 role 변환
    role_map = {
        'level_3_adv': 'level_3',
        'level_2_adv': 'level_2',
        'level_1_adv': 'level_1'
    }
    
    for old_role, new_role in role_map.items():
        cursor.execute('''
            UPDATE users
            SET role = ?, can_view_hidden = 1
            WHERE role = ?
        ''', (new_role, old_role))
    print("- users 테이블 고급(adv) 회원 권한 변환 완료")

    # 4. problems 테이블 difficulty 변환 및 is_hidden 업데이트
    # 기존: 0(기초), 1(3급기본), 2(3급고급), 3(2급기본), 4(2급고급), 5(1급기본), 6(1급고급)
    # 신규: 0(기초), 1(3급), 3(2급), 5(1급)
    difficulty_map = {
        2: 1,  # 3급 고급 -> 3급 기본
        4: 3,  # 2급 고급 -> 2급 기본
        6: 5   # 1급 고급 -> 1급 기본
    }

    for old_diff, new_diff in difficulty_map.items():
        cursor.execute('''
            UPDATE problems
            SET difficulty = ?, is_hidden = 1
            WHERE difficulty = ?
        ''', (new_diff, old_diff))
    print("- problems 테이블 고급 난이도 숨김 문제로 변환 완료")

    # 5. 각 급수별 문제 번호(display_id) 재배열
    # 0(기초), 1(3급), 3(2급), 5(1급) 
    # 숨김 아닌 것(is_hidden=0) 먼저 정렬, 그다음 숨긴 것(is_hidden=1) 정렬. 정렬 기준은 기존 display_id -> id
    for diff in [0, 1, 3, 5]:
        cursor.execute('''
            SELECT id FROM problems
            WHERE difficulty = ?
            ORDER BY is_hidden ASC, display_id ASC, id ASC
        ''', (diff,))
        
        rows = cursor.fetchall()
        for i, row in enumerate(rows, start=1):
            cursor.execute('UPDATE problems SET display_id = ? WHERE id = ?', (i, row[0]))

    print("- problems 테이블 각 난이도별 문제 번호(display_id) 재배열 완료")

    conn.commit()
    print("[v13 마이그레이션] 성공적으로 완료되었습니다!")

except sqlite3.Error as e:
    conn.rollback()
    print(f"[오류] 마이그레이션 실패: {e}")
finally:
    conn.close()
