"""
[36단계] DB 마이그레이션 v10
problems 테이블에 supported_languages 컬럼을 추가합니다.
문제별로 지원하는 언어(파이썬, 자바)를 선택할 수 있도록 합니다.

실행 방법:
  python migrate_db_v10.py
"""
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

conn = sqlite3.connect(DB_FILENAME)
cursor = conn.cursor()

try:
    # 기본값: 파이썬과 자바 모두 지원 (기존 문제들 호환)
    cursor.execute("ALTER TABLE problems ADD COLUMN supported_languages TEXT DEFAULT 'python3,java'")
    print("[v10 마이그레이션] problems 테이블에 'supported_languages' 컬럼 추가 완료!")
except sqlite3.OperationalError as e:
    if 'duplicate column' in str(e).lower():
        print("[v10 마이그레이션] 'supported_languages' 컬럼이 이미 존재합니다. 스킵합니다.")
    else:
        raise e

conn.commit()
conn.close()
print("[v10 마이그레이션] 완료!")
