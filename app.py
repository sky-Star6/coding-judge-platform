from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import os
import simple_judge

app = Flask(__name__)
CORS(app)  # CORS 설정: 프론트엔드(웹 브라우저)에서 API 서버로 요청을 보낼 수 있도록 허용합니다.

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def get_db_connection():
    # 데이터베이스 쿼리결과를 딕셔너리(JSON) 형태로 쉽게 변환하기 위해 row_factory 설정
    conn = sqlite3.connect(DB_FILENAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- 사용자인증 API ---

@app.route("/api/signup", methods=["POST"])
def signup():
    """회원가입 요청을 처리하여 DB에 저장합니다. (기본값: 승인 대기)"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    nickname = data.get('nickname')
    
    # [10단계 추가 정보]
    birth_date = data.get('birth_date', '')
    school_name = data.get('school_name', '')
    grade = data.get('grade', '')
    phone_number = data.get('phone_number', '')

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, password, nickname, birth_date, school_name, grade, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (username, password, nickname, birth_date, school_name, grade, phone_number)
        )
        user_id = cursor.lastrowid
        conn.commit()
        return jsonify({"message": "회원가입 성공. 관리자의 승인을 대기합니다.", "user_id": user_id, "nickname": nickname}), 201
    except sqlite3.IntegrityError:
        return jsonify({"detail": "이미 존재하는 아이디입니다."}), 400
    finally:
        conn.close()

# --- 아이디 찾기 API (11단계) ---
@app.route("/api/find-id", methods=["POST"])
def find_id():
    """생년월일, 전화번호를 대조하여 로그인 아이디를 반환합니다."""
    data = request.json
    birth_date = data.get('birth_date')
    phone_number = data.get('phone_number')
    
    if not birth_date or not phone_number:
         return jsonify({"detail": "생년월일과 전화번호를 입력해주세요."}), 400
         
    conn = get_db_connection()
    user = conn.execute(
        'SELECT username, nickname FROM users WHERE birth_date = ? AND phone_number = ?',
        (birth_date, phone_number)
    ).fetchone()
    conn.close()
    
    if user:
        return jsonify({"message": "아이디 찾기 성공", "username": user['username'], "nickname": user['nickname']})
    else:
        return jsonify({"detail": "일치하는 계정을 찾을 수 없습니다."}), 404

# --- 비밀번호 찾기 API (10단계) ---
@app.route("/api/find-password", methods=["POST"])
def find_password():
    """아이디, 생년월일, 전화번호를 대조하여 잃어버린 비밀번호를 반환합니다."""
    data = request.json
    username = data.get('username')
    birth_date = data.get('birth_date')
    phone_number = data.get('phone_number')
    
    if not username or not birth_date or not phone_number:
         return jsonify({"detail": "모든 정보를 정확히 입력해주세요."}), 400
         
    conn = get_db_connection()
    user = conn.execute(
        'SELECT password FROM users WHERE username = ? AND birth_date = ? AND phone_number = ?',
        (username, birth_date, phone_number)
    ).fetchone()
    conn.close()
    
    if user:
        return jsonify({"message": "비밀번호 찾기 성공", "password": user['password']})
    else:
        return jsonify({"detail": "입력하신 정보와 일치하는 계정을 찾을 수 없습니다."}), 404

@app.route("/api/login", methods=["POST"])
def login():
    """아이디/비밀번호를 DB와 대조하여 로그인 승인을 내립니다."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute('SELECT id, nickname, role, is_active FROM users WHERE username = ? AND password = ?',
                        (username, password)).fetchone()
    conn.close()
    
    if user:
        # [9단계] 0일 경우 접속 차단
        if not user['is_active']:
            return jsonify({"detail": "관리자의 가입 승인을 대기 중이거나 정지된 계정입니다."}), 403
            
        return jsonify({
            "message": "로그인 성공", 
            "user_id": user['id'], 
            "nickname": user['nickname'],
            "role": user['role']
        })
    else:
        return jsonify({"detail": "아이디 또는 비밀번호가 잘못되었습니다."}), 401

# --- 관리자(Admin) API ---

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    """모든 가입자 정보(관리자 패널용)를 반환합니다."""
    conn = get_db_connection()
    # [10단계 추가 정보 열람 지원] 생년월일, 소속 학교, 학년, 전화번호 포함 
    users = conn.execute(
        'SELECT id, username, nickname, role, is_active, birth_date, school_name, grade, phone_number FROM users ORDER BY id DESC'
    ).fetchall()
    conn.close()
    return jsonify({"users": [dict(u) for u in users]})

@app.route("/api/admin/users/<int:user_id>/status", methods=["POST"])
def update_user_status(user_id):
    """관리자가 특정 사용자의 계정 활성화(is_active) 상태를 변경합니다."""
    data = request.json
    new_status = data.get('is_active')
    
    if new_status not in [0, 1]:
        return jsonify({"detail": "올바르지 않은 상태값입니다."}), 400
        
    conn = get_db_connection()
    conn.execute('UPDATE users SET is_active = ? WHERE id = ?', (new_status, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "사용자 상태가 업데이트되었습니다."})

# --- 가입자 정보 강제 수정 API (11단계 구버전 호환) ---
@app.route("/api/admin/users/<int:user_id>/info", methods=["POST"])
def update_user_info(user_id):
    """관리자가 특정 사용자의 비밀번호 및 인적사항 빈칸을 강제 수정합니다."""
    data = request.json
    
    # 전달받은 필드값 추출
    password = data.get('password', '').strip()
    nickname = data.get('nickname', '').strip()
    birth_date = data.get('birth_date', '').strip()
    school_name = data.get('school_name', '').strip()
    grade = data.get('grade', '').strip()
    phone_number = data.get('phone_number', '').strip()

    conn = get_db_connection()
    try:
        # 비밀번호가 입력된 경우 비밀번호도 함께 덮어쓰기
        if password:
            conn.execute('''
                UPDATE users 
                SET password = ?, nickname = ?, birth_date = ?, school_name = ?, grade = ?, phone_number = ?
                WHERE id = ?
            ''', (password, nickname, birth_date, school_name, grade, phone_number, user_id))
        else:
            # 비밀번호는 건드리지 않고 인적사항만 덮어쓰기
            conn.execute('''
                UPDATE users 
                SET nickname = ?, birth_date = ?, school_name = ?, grade = ?, phone_number = ?
                WHERE id = ?
            ''', (nickname, birth_date, school_name, grade, phone_number, user_id))
            
        conn.commit()
        return jsonify({"message": "회원정보가 성공적으로 수정되었습니다."})
    except Exception as e:
        return jsonify({"detail": f"수정 중 오류 발생: {e}"}), 500
    finally:
        conn.close()

@app.route("/api/admin/users/<int:user_id>/role", methods=["POST"])
def update_user_role(user_id):
    """특정 회원의 등급(role)을 강제로 변경합니다."""
    new_role = request.json.get('role')
    if new_role not in ['admin', 'level_1', 'level_1_adv', 'level_2', 'level_2_adv', 'level_3', 'level_3_adv']:
        return jsonify({"detail": "잘못된 등급입니다."}), 400
        
    conn = get_db_connection()
    conn.execute('UPDATE users SET role = ? WHERE id = ?', (new_role, user_id))
    conn.commit()
    conn.commit()
    conn.close()
    return jsonify({"message": f"{user_id}의 등급이 {new_role}로 변경되었습니다."})

@app.route("/api/admin/users/<int:target_user_id>/history", methods=["GET"])
def get_user_history(target_user_id):
    """(19단계) 특정 회원의 문제 풀이 통계(표시 번호, 제목, 시도 횟수, 언어, 성공 여부 등)를 상세 열람합니다."""
    conn = get_db_connection()
    # 특정 유저가 단 한번이라도 시도한 문제들에 대해, 언어별로 통과 횟수와 전체 시도 횟수를 반환
    query = '''
        SELECT 
            p.display_id, 
            p.title, 
            s.language, 
            SUM(CASE WHEN s.status = 'AC' THEN 1 ELSE 0 END) as ac_cnt,
            COUNT(*) as total_cnt
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ?
        GROUP BY p.id, s.language
        ORDER BY p.display_id ASC, p.id ASC
    '''
    history = conn.execute(query, (target_user_id,)).fetchall()
    conn.close()
    return jsonify([dict(h) for h in history])

@app.route("/api/admin/images/upload", methods=["POST"])
def upload_image():
    """[35단계] 문제 설명 등에 삽입할 이미지를 업로드하는 API"""
    if 'image' not in request.files:
        return jsonify({"detail": "파일이 전송되지 않았습니다."}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"detail": "선택된 파일이 없습니다."}), 400
        
    try:
        # static/images 폴더 생성
        images_dir = os.path.join(BASE_DIR, 'static', 'images')
        os.makedirs(images_dir, exist_ok=True)
        
        # 안전한 파일명 생성 (타임스탬프 활용)
        import time
        ext = os.path.splitext(file.filename)[1]
        new_filename = f"img_{int(time.time() * 1000)}{ext}"
        save_path = os.path.join(images_dir, new_filename)
        
        file.save(save_path)
        
        # 반환할 URL 경로 (/static 에 들어가는 파일은 Flask가 기본 제공함)
        file_url = f"/static/images/{new_filename}"
        return jsonify({"url": file_url, "message": "업로드 성공"})
    except Exception as e:
        return jsonify({"detail": f"서버 저장 중 오류 발생: {e}"}), 500

@app.route("/api/admin/problems/<int:problem_id>", methods=["GET", "PUT", "DELETE"])
def manage_single_problem(problem_id):
    """(13단계) 특정 문제 상세 조회, 수정, 삭제 처리"""
    conn = get_db_connection()
    try:
        if request.method == "GET":
            # 문제 기본 정보 조회
            p_row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
            if not p_row:
                return jsonify({"detail": "문제를 찾을 수 없습니다."}), 404
            
            # 얽힌 테스트 케이스들 모두 조회
            tc_rows = conn.execute("SELECT id, input_data, expected_output FROM test_cases WHERE problem_id = ?", (problem_id,)).fetchall()
            
            result = dict(p_row)
            result["examples"] = [dict(tc) for tc in tc_rows]
            return jsonify(result)

        elif request.method == "PUT":
            # 문제 덮어쓰기 (수정)
            data = request.json
            conn.execute('''
                UPDATE problems 
                SET title = ?, description = ?, difficulty = ?, time_limit = ?, memory_limit = ?,
                    initial_code_python = ?, initial_code_java = ?, display_id = ?, problem_type = ?,
                    supported_languages = ?
                WHERE id = ?
            ''', (
                data.get("title"), data.get("description"), data.get("difficulty"),
                data.get("time_limit"), data.get("memory_limit"), 
                data.get("initial_code_python", ""), data.get("initial_code_java", ""), 
                data.get("display_id", 0), data.get("problem_type", "coding"),
                data.get("supported_languages", "python3,java"), problem_id
            ))
            
            # 테스트 케이스 덮어쓰기: 기존 것들 전부 삭제 후 새로 INSERT 하는 방식이 가장 깔끔함
            conn.execute("DELETE FROM test_cases WHERE problem_id = ?", (problem_id,))
            examples = data.get("examples", [])
            for ex in examples:
                conn.execute(
                    'INSERT INTO test_cases (problem_id, input_data, expected_output, is_public) VALUES (?, ?, ?, 1)',
                    (problem_id, ex.get("input_data"), ex.get("expected_output"))
                )
            
            conn.commit()
            return jsonify({"message": "문제가 성공적으로 갱신되었습니다."})

        elif request.method == "DELETE":
            # [33단계] 삭제 전에 해당 문제의 난이도와 번호를 먼저 조회
            problem_info = conn.execute(
                'SELECT difficulty, display_id FROM problems WHERE id = ?', (problem_id,)
            ).fetchone()
            
            # 문제 삭제 (관련 테스트 케이스도 함께 삭제)
            conn.execute("DELETE FROM test_cases WHERE problem_id = ?", (problem_id,))
            conn.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
            
            # [33단계] 삭제된 문제보다 뒤 번호의 문제들을 -1씩 당기기
            if problem_info:
                conn.execute(
                    'UPDATE problems SET display_id = display_id - 1 WHERE difficulty = ? AND display_id > ?',
                    (problem_info['difficulty'], problem_info['display_id'])
                )
            
            conn.commit()
            return jsonify({"message": "문제가 영구 삭제되었습니다. (뒤 번호들이 자동으로 당겨졌습니다.)"})
            
    except Exception as e:
        return jsonify({"detail": f"처리 중 오류 발생: {e}"}), 500
    finally:
        conn.close()

@app.route("/api/admin/problems", methods=["POST"])
def add_new_problem():
    """웹 화면에서 입력한 새로운 문제를 데이터베이스에 등록합니다."""
    data = request.json
    title = data.get('title')
    desc = data.get('description')
    diff = data.get('difficulty', 1)
    t_limit = data.get('time_limit', 1.0)
    m_limit = data.get('memory_limit', 128)
    initial_code_python = data.get('initial_code_python', '')
    initial_code_java = data.get('initial_code_java', '')
    display_id = data.get('display_id', 0)
    problem_type = data.get('problem_type', 'coding')
    supported_languages = data.get('supported_languages', 'python3,java')
    examples = data.get('examples', []) # { input_data: "", expected_output: "" }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # [33단계] 자동 번호 부여 로직
    # display_id가 0이거나 빈 값이면 해당 난이도 내 마지막 번호 + 1
    if not display_id or display_id == 0:
        max_row = cursor.execute(
            'SELECT MAX(display_id) as max_did FROM problems WHERE difficulty = ?', (diff,)
        ).fetchone()
        display_id = (max_row['max_did'] or 0) + 1
    else:
        display_id = int(display_id)
        # 중간 번호 삽입 시: 같은 난이도 내에서 해당 번호 이상의 문제들을 +1씩 밀기
        existing = cursor.execute(
            'SELECT id FROM problems WHERE difficulty = ? AND display_id >= ?', (diff, display_id)
        ).fetchall()
        if existing:
            cursor.execute(
                'UPDATE problems SET display_id = display_id + 1 WHERE difficulty = ? AND display_id >= ?',
                (diff, display_id)
            )
    
    cursor.execute('''
        INSERT INTO problems (title, description, difficulty, time_limit, memory_limit, initial_code_python, initial_code_java, display_id, problem_type, supported_languages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (title, desc, diff, t_limit, m_limit, initial_code_python, initial_code_java, display_id, problem_type, supported_languages))
    
    new_pid = cursor.lastrowid
    
    for ex in examples:
        cursor.execute('''
            INSERT INTO test_cases (problem_id, input_data, expected_output, is_public)
            VALUES (?, ?, ?, 1)
        ''', (new_pid, ex.get('input_data', ''), ex.get('expected_output', '')))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": f"문제가 성공적으로 등록되었습니다. (번호: {display_id})", "problem_id": new_pid})

# --- 부가 기능 API (랭킹/승급) ---

@app.route("/api/ranking", methods=["GET"])
def get_ranking():
    """모든 가입자의 정답(AC)을 맞춘 고유 문제 개수를 집계하여 상위 10명의 랭킹을 반환합니다."""
    conn = get_db_connection()
    query = '''
        SELECT u.id, u.nickname, u.role, COUNT(DISTINCT s.problem_id) as solved_count
        FROM users u
        LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'AC'
        WHERE u.role != 'admin'
        GROUP BY u.id
        ORDER BY solved_count DESC, u.id ASC
        LIMIT 10
    '''
    ranking = conn.execute(query).fetchall()
    conn.close()
    return jsonify({"ranking": [dict(r) for r in ranking]})

# --- 본 서비스 API 엔드포인트 ---

@app.route("/api/problems", methods=["GET"])
def get_problems():
    """
    등록된 문제 목록을 조회합니다.
    만약 user_id가 쿼리 파라미터로 넘어오면, 해당 유저가 정답(AC)을 맞춘 이력을 포함시킵니다.
    """
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    problems = conn.execute('SELECT id, display_id, title, difficulty, problem_type, supported_languages FROM problems ORDER BY difficulty ASC, display_id ASC').fetchall()
    
    solved_python_counts = {}
    solved_java_counts = {}
    
    if user_id:
        solved_records = conn.execute(
            'SELECT problem_id, language, COUNT(*) as cnt FROM submissions WHERE user_id = ? AND status = "AC" GROUP BY problem_id, language',
            (user_id,)
        ).fetchall()
        
        for row in solved_records:
            if row['language'] == 'python3':
                solved_python_counts[row['problem_id']] = row['cnt']
            elif row['language'] == 'java':
                solved_java_counts[row['problem_id']] = row['cnt']
        
    conn.close()
    
    result_list = []
    for p in problems:
        p_dict = dict(p)
        p_dict['is_solved_python'] = p_dict['id'] in solved_python_counts
        p_dict['is_solved_java'] = p_dict['id'] in solved_java_counts
        p_dict['solve_count_python'] = solved_python_counts.get(p_dict['id'], 0)
        p_dict['solve_count_java'] = solved_java_counts.get(p_dict['id'], 0)
        result_list.append(p_dict)
        
    return jsonify({"problems": result_list})

@app.route("/api/problems/<int:problem_id>", methods=["GET"])
def get_problem_detail(problem_id):
    """특정 문제의 상세 설명과 제한 조건 등을 조회합니다."""
    conn = get_db_connection()
    problem = conn.execute('SELECT * FROM problems WHERE id = ?', (problem_id,)).fetchone()
    
    if not problem:
        conn.close()
        return jsonify({"detail": "해당 문제를 찾을 수 없습니다."}), 404
        
    # 공개된 테스트 케이스(예제 입출력)도 함께 내려보내줍니다.
    public_cases = conn.execute(
        'SELECT input_data, expected_output FROM test_cases WHERE problem_id = ? AND is_public = 1',
        (problem_id,)
    ).fetchall()
    conn.close()
    
    result = dict(problem)
    result["examples"] = [dict(case) for case in public_cases]
    return jsonify(result)

@app.route("/api/submissions", methods=["POST"])
def submit_code():
    """
    사용자가 작성한 코드를 제출받아 실행 대기열(DB)에 넣고 채점합니다.
    """
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. 제출 내역을 DB에 Pending(대기 중) 상태로 저장
    cursor.execute('''
        INSERT INTO submissions (user_id, problem_id, language, code, status)
        VALUES (?, ?, ?, ?, 'Pending')
    ''', (data.get('user_id'), data.get('problem_id'), data.get('language'), data.get('code')))
    submission_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # 2. PythonAnywhere 스레드 제한 우회를 위해 bg_tasks 대신 동기적으로 직접 채점 실행
    simple_judge.judge_submission(submission_id)
    
    # [9단계] 3. 기존에 존재했던 자동 승급(Auto-Promotion) 처리 코드는 삭제되었습니다. (이제 수동으로만)
    
    return jsonify({"message": "코드가 성공적으로 제출되고 채점이 완료되었습니다.", "submission_id": submission_id})

@app.route("/api/submissions/<int:submission_id>", methods=["GET"])
def get_submission_result(submission_id):
    """특정 제출의 현재 채점 상태(Pending 로딩 중, AC 통과 등)를 조회합니다."""
    conn = get_db_connection()
    submission = conn.execute(
        'SELECT status, time_used, memory_used, actual_output FROM submissions WHERE id = ?',
        (submission_id,)
    ).fetchone()
    conn.close()
    
    if not submission:
        return jsonify({"detail": "제출 내역을 찾을 수 없습니다."}), 404
        
    return jsonify(dict(submission))

# --- 프론트엔드 HTML 파일 제공 라우터 ---
@app.route("/")
@app.route("/index.html")
def serve_index():
    return send_file('index.html')

@app.route("/judge.html")
def serve_judge():
    return send_file('judge.html')

@app.route("/auth.html")
def serve_auth():
    return send_file('auth.html')

@app.route("/admin_users.html")
def serve_admin_users():
    return send_file('admin_users.html')

@app.route("/admin_problems.html")
def serve_admin_problems():
    return send_file('admin_problems.html')

@app.route("/admin_problems_list.html")
def serve_admin_problems_list():
    return send_file('admin_problems_list.html')

if __name__ == '__main__':
    app.run(port=8000, debug=True)
