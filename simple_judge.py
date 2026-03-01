import sqlite3
import subprocess
import os
import time

# 데이터베이스 파일 이름 상수
DB_FILENAME = 'judge_db.sqlite'

def update_submission_status(submission_id, status, time_used=0.0, memory_used=0):
    """
    채점이 끝난 후, 데이터베이스의 'submissions' 테이블에 최종 상태(AC, WA 등)와 소요된 자원을 업데이트합니다.
    """
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE submissions 
        SET status = ?, time_used = ?, memory_used = ?
        WHERE id = ?
    ''', (status, time_used, memory_used, submission_id))
    conn.commit()
    conn.close()

def judge_submission(submission_id):
    """
    제출 번호(submission_id)를 입력받아 DB에서 코드와 테스트 케이스를 꺼내오고 채점을 수행합니다.
    """
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()
    
    # 1. 제출된 코드 및 사용된 프로그래밍 언어, 어떤 문제인지(problem_id) 확인
    cursor.execute('SELECT problem_id, code, language FROM submissions WHERE id = ?', (submission_id,))
    submission = cursor.fetchone()
    
    if not submission:
        print(f"[오류] 제출 번호 {submission_id}를 찾을 수 없습니다.")
        return None
    
    problem_id, code, language = submission
    
    # 파이썬(python3) 이외의 언어는 아직 지원하지 않는다고 가정합니다.
    if language != 'python3':
        print(f"[오류] 지원하지 않는 언어입니다: {language}")
        update_submission_status(submission_id, 'Error')
        return 'Error'
    
    # 2. 문제에 설정된 시간 제한(초)과 메모리 제한(MB)을 가져옵니다.
    cursor.execute('SELECT time_limit, memory_limit FROM problems WHERE id = ?', (problem_id,))
    problem = cursor.fetchone()
    if not problem:
        print(f"[오류] 문제 번호 {problem_id}를 찾을 수 없습니다.")
        update_submission_status(submission_id, 'Error')
        return 'Error'
    
    time_limit, memory_limit = problem
    
    # 3. 이 문제에 속한 모든 테스트 케이스를 가져옵니다.
    cursor.execute('SELECT input_data, expected_output FROM test_cases WHERE problem_id = ?', (problem_id,))
    test_cases = cursor.fetchall()
    conn.close()
    
    if not test_cases:
        print(f"[경고] 문제 {problem_id}에 테스트 케이스가 없습니다.")
        update_submission_status(submission_id, 'Error')
        return 'Error'
    
    # --- 폴리싱(보안): 악의적인 코드(os 모듈 사용 등) 1차단 ---
    forbidden_keywords = ['import os', 'import sys', 'import subprocess', 'open(', 'eval(', 'exec(']
    for keyword in forbidden_keywords:
        if keyword in code:
            print(f"[보안 경고] 허용되지 않은 코드 사용 감지: {keyword}")
            update_submission_status(submission_id, 'RE')
            return 'RE'
            
    # --- 폴리싱: 메모리 및 시스템 자원 제한을 위한 파이썬 코드 주입기판 ---
    # Windows는 리눅스(ulimit)와 달라 파이썬 내부 resource를 쓰기 어려우므로, 
    # 본 클론 코딩에서는 가장 가볍게 동작하는 '메모리/재귀 방어막 코드'를 유저 코드 상단에 심어 넣습니다.
    wrapper_code = f"""
import sys
# [보안 래퍼] 재귀 깊이 무한으로 인한 서버 방해 방지
sys.setrecursionlimit(2000)

{code}
"""
    
    # 격리를 위해 임시 파일명에 고유한 submission_id를 붙입니다.
    filename = f"temp_user_code_{submission_id}.py"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(wrapper_code)
    
    print(f"\n--- [제출 번호: {submission_id}] 채점 시작 ---")
    
    # 기록을 위한 변수들
    max_time_used = 0.0
    final_status = 'AC'  # 모든 테스트 케이스가 통과하면 AC(Accepted)
    
    # --- 테스트 케이스 순회 채점 ---
    for i, (input_data, expected_output) in enumerate(test_cases):
        start_time = time.time()
        
        try:
            # 외부 서브프로세스로 파이썬 코드 실행 (보안/격리 래퍼 역할)
            result = subprocess.run(
                ["python", filename],
                input=input_data,
                text=True,
                capture_output=True,
                timeout=time_limit  # 시간 제한(Time Limit) 적용
            )
            
            elapsed_time = time.time() - start_time
            max_time_used = max(max_time_used, elapsed_time)
            
            # 1) 런타임 에러(Runtime Error) 판별
            if result.returncode != 0:
                print(f"테스트 케이스 {i+1}: RE (런타임 에러) - {result.stderr.strip()}")
                final_status = 'RE'
                break
                
            actual_output = result.stdout.strip()
            
            # 2) 정답/오답(Wrong Answer) 판별
            # 양쪽 여백을 없앤 뒤 비교하여 일치하는지 확인
            if actual_output == expected_output.strip():
                print(f"테스트 케이스 {i+1}: 통과 (소요 시간: {elapsed_time:.3f}초)")
            else:
                print(f"테스트 케이스 {i+1}: WA (오답)")
                print(f"   예상 출력: {expected_output.strip()}")
                print(f"   실제 출력: {actual_output}")
                final_status = 'WA'
                break
                
        # 3) 시간 초과(Time Limit Exceeded) 판별
        except subprocess.TimeoutExpired:
            print(f"테스트 케이스 {i+1}: TLE (시간 초과 - {time_limit}초 초과)")
            final_status = 'TLE'
            max_time_used = time_limit
            break
            
        except MemoryError:
            print(f"테스트 케이스 {i+1}: MLE (메모리 초과)")
            final_status = 'RE' # Windows 제약 상 RE로 함께 처리
            break
            
        except Exception as e:
            print(f"테스트 케이스 {i+1}: 시스템 에러 ({e})")
            final_status = 'Error'
            break
            
    # --- 채점 종료 및 정리 ---
    if os.path.exists(filename):
        os.remove(filename)  # 임시 파일 삭제 완료
        
    print(f"--- 최종 결과: {final_status} (최대 소요 시간: {max_time_used:.3f}초) ---")
    
    # 데이터베이스에 최종 채점 결과 업데이트 (메모리는 추후 고도화를 위해 0으로 더미 처리)
    update_submission_status(submission_id, final_status, max_time_used, 0)
    
    return final_status


# ==========================================
# 실행 테스트 세션
# ==========================================
if __name__ == "__main__":
    print("[DB 연동 채점기 테스트를 시작합니다.]")
    
    # 테스트 코드를 데이터베이스에 '제출(Submission)'로 흉내내서 넣어봅니다.
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()
    # 4. 해킹 방어 테스트 (시스템 명령어 삽입 시도)
    hack_code = "import os\nos.system('dir')"
    cursor.execute('''
        INSERT INTO submissions (user_id, problem_id, language, code, status)
        VALUES (1, 1, 'python3', ?, 'Pending')
    ''', (hack_code,))
    hack_sub_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    print("\n--- 4. 악의적인 해킹 코드 방어 테스트 ---")
    judge_submission(hack_sub_id)
