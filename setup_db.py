import sqlite3
import os

# 데이터베이스 파일 이름 설정
DB_FILENAME = 'judge_db.sqlite'

def create_tables():
    """
    온라인 코딩 채점 플랫폼을 위한 데이터베이스 테이블을 생성하는 함수입니다.
    """
    print(f"[{DB_FILENAME}] 데이터베이스 연결 및 테이블 생성을 시작합니다...")

    # 1. 데이터베이스 연결 (파일이 존재하지 않으면 새로 생성됩니다)
    conn = sqlite3.connect(DB_FILENAME)
    
    # 2. 커서(Cursor) 생성: SQL 명령어를 실행하기 위한 객체입니다.
    cursor = conn.cursor()

    # --- 테이블 구조 (Schema) 정의 ---

    # [Users 테이블]: 사용자 정보를 저장합니다.
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL, -- 로그인 아이디 (중복 불가)
            password TEXT NOT NULL,        -- 비밀번호
            nickname TEXT NOT NULL,        -- 표시될 닉네임
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("- 'users' 테이블 생성 완료 (또는 이미 존재함)")

    # [Problems 테이블]: 문제 정보를 저장합니다.
    # time_limit(시간 제한)의 기본 단위는 초(sec), memory_limit(메모리 제한)의 기본 단위는 메가바이트(MB)입니다.
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS problems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,           -- 문제 제목
            description TEXT NOT NULL,     -- 문제 내용 및 설명 (Markdown)
            difficulty INTEGER DEFAULT 1,  -- 난이도 (기본값 1)
            time_limit REAL DEFAULT 1.0,   -- 시간 제한 (초)
            memory_limit INTEGER DEFAULT 128, -- 메모리 제한 (MB)
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("- 'problems' 테이블 생성 완료 (또는 이미 존재함)")

    # [Test Cases 테이블]: 각 문제에 딸린 테스트용 입출력 데이터를 저장합니다.
    # 여러 개의 테스트 케이스가 하나의 문제(problem_id)에 속하는 1:N 구조(Foreign Key 관계)를 가집니다.
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            problem_id INTEGER NOT NULL,   -- 참조하는 problem 의 ID
            input_data TEXT NOT NULL,      -- 주어지는 입력값
            expected_output TEXT NOT NULL, -- 예상되는 정답 출력값
            is_public BOOLEAN DEFAULT 0,   -- 예제 공개 여부 (1: 공개, 0: 비공개)
            FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
        )
    ''')
    print("- 'test_cases' 테이블 생성 완료 (또는 이미 존재함)")

    # [Submissions 테이블]: 사용자가 제출한 코드와 그 채점 결과를 기록합니다.
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,      -- 코드를 제출한 사용자의 ID
            problem_id INTEGER NOT NULL,   -- 제출된 문제의 ID
            language TEXT NOT NULL,        -- 프로그래밍 언어 (예: 'python3')
            code TEXT NOT NULL,            -- 사용자가 작성한 소스코드 전문
            status TEXT DEFAULT 'Pending', -- 채점 상태 (Pending, AC, WA, TLE, RE 등)
            time_used REAL,                -- 소요된 런타임 (초)
            memory_used INTEGER,           -- 소요된 메모리 용량 (MB)
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
        )
    ''')
    print("- 'submissions' 테이블 생성 완료 (또는 이미 존재함)")

    # --- 트랜잭션 마무리 ---
    
    # 3. 변경된 사항(테이블 생성)을 데이터베이스 파일에 최종 반영합니다.
    conn.commit()
    
    # 4. 데이터베이스 연결을 안전하게 종료합니다.
    conn.close()
    print("성공적으로 데이터베이스 초기화가 완료되었습니다!")

if __name__ == "__main__":
    # 이 스크립트를 직접 실행할 때(`python setup_db.py`) 아래 함수를 호출합니다.
    create_tables()
