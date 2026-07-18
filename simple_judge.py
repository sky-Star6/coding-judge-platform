import sqlite3
import subprocess
import os
import time
import difflib
import json
import base64

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def count_changed_lines(initial_code, submitted_code):
    if not initial_code or not initial_code.strip(): return 0
    if not submitted_code or not submitted_code.strip(): return 0
    init_lines = [l.rstrip() for l in initial_code.strip().splitlines()]
    sub_lines = [l.rstrip() for l in submitted_code.strip().splitlines()]
    diff = difflib.ndiff(init_lines, sub_lines)
    changed_count = 0
    for line in diff:
        if (line.startswith('- ') or line.startswith('+ ')) and line[2:].strip() != '':
            changed_count += 1
    return changed_count

def update_submission_status(submission_id, status, time_used=0.0, memory_used=0, actual_output=''):
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE submissions 
        SET status = ?, time_used = ?, memory_used = ?, actual_output = ?
        WHERE id = ?
    ''', (status, time_used, memory_used, actual_output, submission_id))
    conn.commit()
    conn.close()

def judge_submission(submission_id):
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()
    cursor.execute('SELECT problem_id, code, language FROM submissions WHERE id = ?', (submission_id,))
    submission = cursor.fetchone()
    
    if not submission:
        print(f"[오류] 제출 번호 {submission_id}를 찾을 수 없습니다.")
        return None
        
    problem_id, code, language = submission
    cursor.execute('SELECT time_limit, memory_limit, problem_type, initial_code_python, initial_code_java FROM problems WHERE id = ?', (problem_id,))
    problem = cursor.fetchone()
    if not problem:
        update_submission_status(submission_id, 'Error')
        return 'Error'
        
    time_limit, memory_limit, problem_type, initial_code_python, initial_code_java = problem

    if problem_type == 'debugging':
        init_code = initial_code_python if language == 'python3' else initial_code_java
        changes_score = count_changed_lines(init_code, code)
        if changes_score > 2:
            update_submission_status(submission_id, 'RV (너무 많이 배를 갈랐음)')
            return 'RV'
            
    cursor.execute('SELECT input_data, expected_output FROM test_cases WHERE problem_id = ?', (problem_id,))
    test_cases = cursor.fetchall()
    conn.close()
    
    if not test_cases:
        update_submission_status(submission_id, 'Error')
        return 'Error'

    print(f"\n--- [제출 번호: {submission_id}] 일괄 채점(Batch) 시작 (언어: {language}) ---")
    
    if language == 'python3':
        return judge_python(submission_id, code, test_cases, time_limit, memory_limit)
    elif language == 'java':
        return judge_java(submission_id, code, test_cases, time_limit, memory_limit)
    else:
        update_submission_status(submission_id, 'Error')
        return 'Error'


def judge_python(submission_id, code, test_cases, time_limit, memory_limit):
    forbidden_keywords = ['import os', 'import sys', 'import subprocess', 'open(', 'eval(', 'exec(']
    for keyword in forbidden_keywords:
        if keyword in code:
            update_submission_status(submission_id, 'RE', 0, 0, f"보안 경고: {keyword}")
            return 'RE'
            
    code_b64 = base64.b64encode(code.encode('utf-8')).decode('utf-8')
    tc_inputs_b64 = [base64.b64encode(tc[0].encode('utf-8')).decode('utf-8') for tc in test_cases]
    
    wrapper_code = f"""
import sys
import io
import time
import base64

tc_inputs_b64 = {tc_inputs_b64}
user_code_b64 = "{code_b64}"
user_code_str = base64.b64decode(user_code_b64).decode('utf-8')

sys.setrecursionlimit(2000)
global_env = {{}}
global_env['__builtins__'] = __builtins__

try:
    compiled_code = compile(user_code_str, '<string>', 'exec')
except SyntaxError as e:
    print("---TC_SEP---")
    print("SYNTAX_ERROR")
    print(str(e))
    sys.exit(0)

for tc_b64 in tc_inputs_b64:
    tc_in = base64.b64decode(tc_b64).decode('utf-8')
    old_stdin = sys.stdin
    old_stdout = sys.stdout
    sys.stdin = io.StringIO(tc_in)
    sys.stdout = io.StringIO()
    
    start = time.time()
    error_msg = ""
    try:
        exec(compiled_code, global_env)
    except SystemExit:
        pass
    except Exception as e:
        import traceback
        error_msg = str(e)
    finally:
        out = sys.stdout.getvalue()
        sys.stdin = old_stdin
        sys.stdout = old_stdout
        elapsed = time.time() - start
        
        print("---TC_SEP---")
        print(f"TIME:{{elapsed}}")
        if error_msg:
            print(f"ERROR:{{error_msg}}")
        else:
            print("OUT_START")
            print(out, end='')
            print("OUT_END")
"""
    filename = f"temp_user_code_{submission_id}.py"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(wrapper_code)
        
    final_status = parse_batch_execution(
        submission_id, test_cases, time_limit, ["python", filename], time_limit * len(test_cases) + 2.0
    )
    if os.path.exists(filename):
        os.remove(filename)
    return final_status


def judge_java(submission_id, code, test_cases, time_limit, memory_limit):
    class_name = f"Main_{submission_id}"
    modified_code = code.replace("public class Main", f"public class {class_name}")
    
    if "System.exit" in modified_code:
        update_submission_status(submission_id, 'RE', 0, 0, "보안 경고: System.exit 사용 금지")
        return 'RE'
        
    wrapper_name = f"JudgeWrapper_{submission_id}"
    tc_inputs_b64 = [base64.b64encode(tc[0].encode('utf-8')).decode('utf-8') for tc in test_cases]
    b64_array_str = ", ".join('"' + x + '"' for x in tc_inputs_b64)
    
    wrapper_code = f"""
import java.io.*;
import java.util.*;

public class {wrapper_name} {{
    public static void main(String[] args) throws Exception {{
        String[] inputsB64 = {{ {b64_array_str} }};
        for (String b64 : inputsB64) {{
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(b64);
            String tcIn = new String(decodedBytes, "UTF-8");
            
            InputStream originalIn = System.in;
            PrintStream originalOut = System.out;
            
            ByteArrayInputStream bais = new ByteArrayInputStream(tcIn.getBytes("UTF-8"));
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream ps = new PrintStream(baos, true, "UTF-8");
            
            System.setIn(bais);
            System.setOut(ps);
            
            long start = System.currentTimeMillis();
            String errorMsg = "";
            try {{
                {class_name}.main(new String[0]);
            }} catch (Throwable t) {{
                errorMsg = t.toString();
            }} finally {{
                System.setIn(originalIn);
                System.setOut(originalOut);
                
                long elapsed = System.currentTimeMillis() - start;
                System.out.println("---TC_SEP---");
                System.out.println("TIME:" + (elapsed / 1000.0));
                if (!errorMsg.isEmpty()) {{
                    System.out.println("ERROR:" + errorMsg);
                }} else {{
                    System.out.println("OUT_START");
                    System.out.print(baos.toString("UTF-8"));
                    System.out.println("");
                    System.out.println("OUT_END");
                }}
            }}
        }}
    }}
}}
"""
    with open(f"{class_name}.java", "w", encoding="utf-8") as f:
        f.write(modified_code)
    with open(f"{wrapper_name}.java", "w", encoding="utf-8") as f:
        f.write(wrapper_code)
        
    try:
        compile_result = subprocess.run(["javac", f"{class_name}.java", f"{wrapper_name}.java"], capture_output=True, text=True, timeout=10)
        if compile_result.returncode != 0:
            update_submission_status(submission_id, 'CE', 0, 0, compile_result.stderr)
            cleanup_java_files(class_name, wrapper_name)
            return 'CE'
    except Exception as e:
        update_submission_status(submission_id, 'Error', 0, 0, str(e))
        cleanup_java_files(class_name, wrapper_name)
        return 'Error'
        
    final_status = parse_batch_execution(
        submission_id, test_cases, time_limit, ["java", wrapper_name], time_limit * len(test_cases) + 3.0
    )
    cleanup_java_files(class_name, wrapper_name)
    return final_status

def cleanup_java_files(cname, wname):
    for f in [f"{cname}.java", f"{cname}.class", f"{wname}.java", f"{wname}.class"]:
        if os.path.exists(f): os.remove(f)

def parse_batch_execution(submission_id, test_cases, time_limit, base_cmd, total_timeout):
    max_time_used = 0.0
    final_status = 'AC'
    results_list = []
    
    try:
        result = subprocess.run(base_cmd, capture_output=True, text=True, timeout=total_timeout)
        stdout = result.stdout
        stderr = result.stderr
        
        blocks = stdout.split("---TC_SEP---")[1:]
        
        if len(blocks) > 0 and "SYNTAX_ERROR" in blocks[0]:
            update_submission_status(submission_id, 'RE', 0, 0, "문법 에러\n" + blocks[0].replace("SYNTAX_ERROR", ""))
            return 'RE'
            
        for i, (input_data, expected_output) in enumerate(test_cases):
            tc_result = {"tc": i + 1, "status": "AC", "expected": expected_output.strip(), "actual": "", "error_msg": ""}
            
            if i >= len(blocks):
                tc_result["status"] = "RE"
                tc_result["error_msg"] = "프로그램 비정상 종료 (메모리 초과 등) " + stderr
                results_list.append(tc_result)
                if final_status == 'AC': final_status = 'RE'
                continue
                
            block = blocks[i].strip()
            lines = block.split('\n')
            
            tc_time = 0.0
            tc_err = ""
            tc_out = ""
            in_out = False
            out_lines = []
            
            for line in lines:
                line = line.strip('\r')
                if line.startswith("TIME:"): tc_time = float(line.split("TIME:")[1])
                elif line.startswith("ERROR:"): tc_err = line.split("ERROR:")[1]
                elif line == "OUT_START": in_out = True
                elif line == "OUT_END": in_out = False
                elif in_out: out_lines.append(line)
                
            tc_out = "\n".join(out_lines).strip()
            max_time_used = max(max_time_used, tc_time)
            
            if tc_time > time_limit:
                tc_result["status"] = "TLE"
                tc_result["error_msg"] = "시간 초과"
                if final_status == 'AC': final_status = 'TLE'
            elif tc_err:
                tc_result["status"] = "RE"
                tc_result["error_msg"] = tc_err
                if final_status == 'AC': final_status = 'RE'
            else:
                tc_result["actual"] = tc_out
                if tc_out != expected_output.strip():
                    tc_result["status"] = "WA"
                    if final_status == 'AC': final_status = 'WA'
                    
            results_list.append(tc_result)
            
    except subprocess.TimeoutExpired:
        final_status = 'TLE'
        max_time_used = total_timeout
        results_list = [{"tc": 1, "status": "TLE", "expected": "", "actual": "", "error_msg": "전체 시간 초과"}]
    except Exception as e:
        final_status = 'Error'
        results_list = [{"tc": 1, "status": "Error", "expected": "", "actual": "", "error_msg": str(e)}]
        
    update_submission_status(submission_id, final_status, max_time_used, 0, json.dumps(results_list, ensure_ascii=False))
    return final_status

if __name__ == "__main__":
    pass
