from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import simple_judge

app = Flask(__name__)
CORS(app)  # CORS 설정: 프론트엔드(웹 브라우저)에서 API 서버로 요청을 보낼 수 있도록 허용합니다.

DB_FILENAME = 'judge_db.sqlite'

def get_db_connection():
    # 데이터베이스 쿼리결과를 딕셔너리(JSON) 형태로 쉽게 변환하기 위해 row_factory 설정
    conn = sqlite3.connect(DB_FILENAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- 사용자인증 API ---

@app.route("/api/signup", methods=["POST"])
def signup():
    """사용자로부터 넘겨받은 아이디/비밀번호/닉네임을 DB에 등록(회원가입)합니다."""
    data = request.json
    username = data.get('username')
    password = data.get('password') # 실제 서비스에서는 해시(암호화) 처리해야 안전합니다.
    nickname = data.get('nickname')
    
    if not username or not password or not nickname:
        return jsonify({"detail": "입력값을 모두 채워주세요."}), 400
        
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
                       (username, password, nickname))
        user_id = cursor.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"detail": "이미 사용 중인 아이디입니다."}), 400
    
    conn.close()
    return jsonify({"message": "회원가입 성공", "user_id": user_id, "nickname": nickname})

@app.route("/api/login", methods=["POST"])
def login():
    """아이디/비밀번호를 DB와 대조하여 로그인 승인을 내립니다."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute('SELECT id, nickname FROM users WHERE username = ? AND password = ?',
                        (username, password)).fetchone()
    conn.close()
    
    if user:
        return jsonify({"message": "로그인 성공", "user_id": user['id'], "nickname": user['nickname']})
    else:
        return jsonify({"detail": "아이디 또는 비밀번호가 잘못되었습니다."}), 401

# --- API 엔드포인트 구현 ---

@app.route("/api/problems", methods=["GET"])
def get_problems():
    """
    등록된 문제 목록을 조회합니다.
    만약 user_id가 쿼리 파라미터로 넘어오면, 해당 유저가 정답(AC)을 맞춘 이력을 포함시킵니다.
    """
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    problems = conn.execute('SELECT id, title, difficulty FROM problems').fetchall()
    
    solved_problem_ids = set()
    if user_id:
        solved_records = conn.execute(
            'SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND status = "AC"',
            (user_id,)
        ).fetchall()
        solved_problem_ids = {row['problem_id'] for row in solved_records}
    conn.close()
    
    result_list = []
    for p in problems:
        p_dict = dict(p)
        p_dict['is_solved'] = p_dict['id'] in solved_problem_ids
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
    
    return jsonify({"message": "코드가 성공적으로 제출되고 채점이 완료되었습니다.", "submission_id": submission_id})

@app.route("/api/submissions/<int:submission_id>", methods=["GET"])
def get_submission_result(submission_id):
    """특정 제출의 현재 채점 상태(Pending 로딩 중, AC 통과 등)를 조회합니다."""
    conn = get_db_connection()
    submission = conn.execute(
        'SELECT status, time_used, memory_used FROM submissions WHERE id = ?',
        (submission_id,)
    ).fetchone()
    conn.close()
    
    if not submission:
        return jsonify({"detail": "제출 내역을 찾을 수 없습니다."}), 404
        
    return jsonify(dict(submission))

# --- 프론트엔드 HTML 파일 제공 라우터 ---
@app.route("/")
def serve_index():
    return send_file('index.html')

@app.route("/judge.html")
def serve_judge():
    return send_file('judge.html')

@app.route("/auth.html")
def serve_auth():
    return send_file('auth.html')

if __name__ == '__main__':
    app.run(port=8000, debug=True)
