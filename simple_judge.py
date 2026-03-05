import sqlite3
import subprocess
import os
import time

# 데이터베이스 파일 이름 상수
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

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

    print(f"\n--- [제출 번호: {submission_id}] 채점 시작 (언어: {language}) ---")
    
    # 언어별 채점 실행 분기 코어
    if language == 'python3':
        return judge_python(submission_id, code, test_cases, time_limit, memory_limit)
    elif language == 'java':
        return judge_java(submission_id, code, test_cases, time_limit, memory_limit)
    else:
        print(f"[오류] 지원하지 않는 언어입니다: {language}")
        update_submission_status(submission_id, 'Error')
        return 'Error'


def judge_python(submission_id, code, test_cases, time_limit, memory_limit):
    # --- 폴리싱(보안): 악의적인 코드(os 모듈 사용 등) 1차단 ---
    forbidden_keywords = ['import os', 'import sys', 'import subprocess', 'open(', 'eval(', 'exec(']
    for keyword in forbidden_keywords:
        if keyword in code:
            print(f"[보안 경고] 허용되지 않은 코드 사용 감지: {keyword}")
            update_submission_status(submission_id, 'RE')
            return 'RE'
            
    wrapper_code = f"""
import sys
sys.setrecursionlimit(2000)

{code}
"""
    
    # 격리를 위해 임시 파일명 정의
    filename = f"temp_user_code_{submission_id}.py"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(wrapper_code)
    
    final_status, max_time_used = execute_and_evaluate(
        submission_id, test_cases, time_limit, 
        base_cmd=["python", filename]
    )
    
    # 파일 정리
    if os.path.exists(filename):
        os.remove(filename)
        
    update_submission_status(submission_id, final_status, max_time_used, 0)
    return final_status


def judge_java(submission_id, code, test_cases, time_limit, memory_limit):
    # Java 코드는 반드시 파일명이 public class 이름과 같아야 하므로, Main 고정 방식을 권장합니다.
    # 사용자가 제출한 코드 안에 "public class Main" 이 있다고 가정합니다.
    filename = f"Main_{submission_id}.java"
    class_name = f"Main_{submission_id}"
    
    # 강제로 제출 코드의 Main 클래스 이름을 고유한 클래스 이름으로 교체하여 충돌을 방지합니다.
    modified_code = code.replace("public class Main", f"public class {class_name}")
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(modified_code)
        
    try:
        # 1. Java 컴파일러(javac)를 통한 컴파일 시도
        compile_result = subprocess.run(
            ["javac", filename],
            capture_output=True,
            text=True,
            timeout=10 # 컴파일 여유 시간
        )
        if compile_result.returncode != 0:
            print(f"컴파일 에러(CE):\n {compile_result.stderr}")
            update_submission_status(submission_id, 'CE')  # Compile Error
            if os.path.exists(filename): os.remove(filename)
            return 'CE'
    except Exception as e:
        print(f"컴파일러 래퍼 에러: {e}")
        update_submission_status(submission_id, 'Error')
        if os.path.exists(filename): os.remove(filename)
        return 'Error'
        
    # 2. 컴파일 성공 시 테스트 케이스 실행 (java 명령어)
    final_status, max_time_used = execute_and_evaluate(
        submission_id, test_cases, time_limit, 
        base_cmd=["java", class_name]
    )
    
    # 3. 파일 정리 (.java 및 .class 삭제)
    if os.path.exists(filename):
        os.remove(filename)
    if os.path.exists(f"{class_name}.class"):
        os.remove(f"{class_name}.class")
        
    update_submission_status(submission_id, final_status, max_time_used, 0)
    return final_status


def execute_and_evaluate(submission_id, test_cases, time_limit, base_cmd):
    """
    공통 채점 로직 (실행 및 결과 비교)
    """
    max_time_used = 0.0
    final_status = 'AC'
    
    for i, (input_data, expected_output) in enumerate(test_cases):
        start_time = time.time()
        try:
            result = subprocess.run(
                base_cmd,
                input=input_data,
                text=True,
                capture_output=True,
                timeout=time_limit
            )
            elapsed_time = time.time() - start_time
            max_time_used = max(max_time_used, elapsed_time)
            
            if result.returncode != 0:
                print(f"테스트 케이스 {i+1}: RE (런타임 에러) - {result.stderr.strip()}")
                final_status = 'RE'
                break
                
            actual_output = result.stdout.strip()
            
            if actual_output == expected_output.strip():
                print(f"테스트 케이스 {i+1}: 통과 (소요 시간: {elapsed_time:.3f}초)")
            else:
                print(f"테스트 케이스 {i+1}: WA (오답)")
                print(f"   예상 출력: {expected_output.strip()}")
                print(f"   실제 출력: {actual_output}")
                final_status = 'WA'
                break
                
        except subprocess.TimeoutExpired:
            print(f"테스트 케이스 {i+1}: TLE (시간 초과 - {time_limit}초 초과)")
            final_status = 'TLE'
            max_time_used = time_limit
            break
        except Exception as e:
            print(f"테스트 케이스 {i+1}: 시스템 에러 ({e})")
            final_status = 'Error'
            break
            
    print(f"--- 최종 결과: {final_status} (최대 소요 시간: {max_time_used:.3f}초) ---")
    return final_status, max_time_used


# ==========================================
# 실행 테스트 세션
# ==========================================
if __name__ == "__main__":
    print("[DB 연동 채점기 - Java 언어 확장 테스트 시작]")
    
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()
    
    # Java 정답 코드 (A + B 문제: problem_id = 1)
    java_correct_code = """
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(a + b);
        }
    }
}
"""
    cursor.execute('''
        INSERT INTO submissions (user_id, problem_id, language, code, status)
        VALUES (1, 1, 'java', ?, 'Pending')
    ''', (java_correct_code,))
    java_sub_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    print("\n--- 5. Java 정답 코드 채점 테스트 ---")
    judge_submission(java_sub_id)
