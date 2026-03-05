import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def insert_dummy_data():
    """
    플랫폼 테스트를 위해 초기 더미 데이터(사용자, 문제, 테스트 케이스)를 삽입합니다.
    """
    print(f"[{DB_FILENAME}] 더미 데이터 삽입을 시작합니다...")
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    try:
        # 1. 더미 사용자 (Admin) 추가
        # 기본적으로 admin/admin 으로 로그인 가능하게 설정 (실제 서비스에서는 비밀번호 해싱 필수)
        cursor.execute('''
            INSERT OR IGNORE INTO users (username, password, nickname)
            VALUES ('admin', 'admin', '관리자')
        ''')
        print("- 더미 사용자(admin) 삽입 완료")

        # 2. 첫 번째 더미 문제 추가: A + B
        cursor.execute('''
            INSERT INTO problems (title, description, difficulty, time_limit, memory_limit)
            VALUES (
                'A + B',
                '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.\n\n**입력**\n첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)\n\n**출력**\n첫째 줄에 A+B를 출력한다.',
                1, 1.0, 128
            )
        ''')
        # 방금 삽입된 문제의 ID를 가져옵니다.
        problem1_id = cursor.lastrowid
        print(f"- 더미 문제 'A + B' 삽입 완료 (문제 ID: {problem1_id})")

        # 3. 'A + B' 문제에 대한 테스트 케이스 추가
        test_cases_p1 = [
            ("1 2", "3", 1),       # 공개 테스트 케이스 (is_public=1)
            ("4 5", "9", 0),       # 비공개 테스트 케이스 (is_public=0)
            ("9 9", "18", 0)       # 비공개 테스트 케이스 
        ]
        for input_data, expected_output, is_public in test_cases_p1:
            cursor.execute('''
                INSERT INTO test_cases (problem_id, input_data, expected_output, is_public)
                VALUES (?, ?, ?, ?)
            ''', (problem1_id, input_data, expected_output, is_public))
        print("- 'A + B' 문제의 테스트 케이스 3개 삽입 완료")


        # 4. 두 번째 더미 문제 추가: Hello World
        cursor.execute('''
            INSERT INTO problems (title, description, difficulty, time_limit, memory_limit)
            VALUES (
                'Hello World',
                'Hello World!를 출력하시오.\n\n**입력**\n없음\n\n**출력**\nHello World!를 출력하시오.',
                1, 1.0, 128
            )
        ''')
        problem2_id = cursor.lastrowid
        print(f"- 더미 문제 'Hello World' 삽입 완료 (문제 ID: {problem2_id})")

        # 5. 'Hello World' 문제에 대한 테스트 케이스 추가
        test_cases_p2 = [
            ("", "Hello World!", 1)  # 공개 테스트 케이스 (입력값 없음)
        ]
        for input_data, expected_output, is_public in test_cases_p2:
            cursor.execute('''
                INSERT INTO test_cases (problem_id, input_data, expected_output, is_public)
                VALUES (?, ?, ?, ?)
            ''', (problem2_id, input_data, expected_output, is_public))
        print("- 'Hello World' 문제의 테스트 케이스 1개 삽입 완료")

        # 트랜잭션 정상 반영
        conn.commit()
        print("\n성공적으로 모든 더미 데이터를 삽입했습니다!")

    except sqlite3.Error as e:
        # 오류 발생 시 방금 수행한 작업들을 취소(Rollback)합니다.
        conn.rollback()
        print(f"데이터 삽입 중 오류가 발생했습니다: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    insert_dummy_data()
