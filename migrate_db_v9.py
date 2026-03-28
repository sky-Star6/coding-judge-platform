"""
[32단계 ⑤] DB 마이그레이션 v9
submissions 테이블에 actual_output 컬럼을 추가합니다.
학생의 프로그램 실행 결과(출력값)를 저장하기 위한 컬럼입니다.

실행 방법:
  python migrate_db_v9.py
"""
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

conn = sqlite3.connect(DB_FILENAME)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE submissions ADD COLUMN actual_output TEXT DEFAULT ''")
    print("[v9 마이그레이션] submissions 테이블에 'actual_output' 컬럼 추가 완료!")
except sqlite3.OperationalError as e:
    if 'duplicate column' in str(e).lower():
        print("[v9 마이그레이션] 'actual_output' 컬럼이 이미 존재합니다. 스킵합니다.")
    else:
        raise e

conn.commit()
conn.close()
print("[v9 마이그레이션] 완료!")
