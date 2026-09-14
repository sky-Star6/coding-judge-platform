from flask import Flask, redirect, request, jsonify, send_file, send_from_directory, render_template, session
from flask_cors import CORS
from functools import wraps
import sqlite3
import os
import json
import io
import shutil
import secrets
from datetime import datetime, timezone
import simple_judge

app = Flask(__name__)
# 세션 서명 키는 운영 환경에서 반드시 배포 비밀 관리자로 주입해야 합니다.
# 테스트는 매 실행마다 무작위 키를 사용하며, 고정된 개발용 키를 절대 폴백으로 사용하지 않습니다.
_secret_key = os.environ.get('SECRET_KEY')
if not _secret_key:
    if os.environ.get('FLASK_TESTING') == '1':
        _secret_key = secrets.token_urlsafe(48)
    else:
        raise RuntimeError('SECRET_KEY 환경 변수가 설정되지 않았습니다.')
app.secret_key = _secret_key
CORS(app)

@app.before_request
def force_https():
    # 파이썬애니웨어(PythonAnywhere) 등 리버스 프록시 환경에서 HTTP 접속 시 HTTPS로 강제 리다이렉트(Redirect)합니다.
    if request.headers.get('X-Forwarded-Proto') == 'http':
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)

def is_beginner_user():
    """
    현재 요청을 전송한 사용자가 '기초반(beginner)' 역할인지 식별하는 함수입니다.
    보안 강화를 위해 클라이언트가 위조 가능한 요청 헤더, 쿼리 파라미터, 요청 본문, 경로 변수를 배제하고
    오직 서버 측 플라스크 세션(Flask Session)의 'role' 값만을 신뢰하여 검증합니다.
    """
    return session.get('role') == 'beginner'

@app.before_request
def restrict_beginner_access():
    """
    기초반(beginner) 사용자의 비인가 자산 및 API 직접 접근을 서버 측에서 엄격하게 차단합니다.
    기초반 계정은 materials.html 및 /materials/* 학습 자산과 인증 엔드포인트만 열람할 수 있습니다.
    그 외 index.html, user_assignments.html, judge.html 및 문제/제출/과제/포인트 API 등은
    HTML 요청 시 materials.html 리다이렉트(Redirect), API 요청 시 403 Forbidden JSON으로 거부합니다.
    """
    request_path = request.path

    # 기초반 사용자에게 허용된 안전한 화이트리스트(Allowlist) 엔드포인트 목록
    allowed_endpoints = [
        '/materials.html',
        '/materials/',
        '/materials',
        '/auth.html',
        '/api/login',
        '/api/signup',
        '/api/find-id',
        '/api/find-password',
        '/api/logout',
        '/logout',
        '/static/',
        '/api/ai/'
    ]

    # 화이트리스트에 부합하는 경로이거나 브라우저 기본 파비콘(Favicon) 요청인 경우 통과
    if any(request_path == endpoint or request_path.startswith(endpoint) for endpoint in allowed_endpoints) or request_path == '/favicon.ico':
        return None

    # 현재 사용자가 기초반(beginner)인 경우 비인가 자산에 대한 접근 거부(Deny) 수행
    if is_beginner_user():
        # [1] HTML 페이지 직접 접근 시: 학습 자료실(materials.html)로 안전하게 리다이렉트
        if request_path in ['/', '/index.html', '/judge.html', '/user_assignments.html'] or request_path.endswith('.html'):
            return redirect('/materials.html')

        # [2] 문제/제출/과제/포인트 등 비인가 API 직접 접근 시: 403 Forbidden JSON 응답 반환
        return jsonify({"detail": "접근 권한이 없습니다. 기초반(beginner) 계정은 학습 자료실만 이용할 수 있습니다."}), 403

    return None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

def get_db_connection():
    # ?곗씠?곕쿋?댁뒪 荑쇰━寃곌낵瑜??뺤뀛?덈━(JSON) ?뺥깭濡??쎄쾶 蹂?섑븯湲??꾪빐 row_factory ?ㅼ젙
    conn = sqlite3.connect(DB_FILENAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- ?ъ슜?먯씤利?API ---

@app.route("/api/signup", methods=["POST"])
def signup():
    """
    회원가입 요청을 처리하여 DB에 저장합니다.
    신규 회원은 SQLite 기본값에 의존하지 않고 명시적으로 'beginner'(기초반) 역할을 부여합니다.
    """
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
        # 신규 회원의 role 컬럼에 'beginner'를 명시적으로 삽입(Explicit Insert)합니다.
        cursor.execute(
            'INSERT INTO users (username, password, nickname, birth_date, school_name, grade, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (username, password, nickname, birth_date, school_name, grade, phone_number, 'beginner')
        )
        user_id = cursor.lastrowid
        conn.commit()
        return jsonify({"message": "회원가입 성공. 관리자의 승인을 대기합니다.", "user_id": user_id, "nickname": nickname}), 201
    except sqlite3.IntegrityError:
        return jsonify({"detail": "이미 존재하는 아이디입니다."}), 400
    finally:
        conn.close()

# --- ?꾩씠??李얘린 API (11?④퀎) ---
@app.route("/api/find-id", methods=["POST"])
def find_id():
    """?앸뀈?붿씪, ?꾪솕踰덊샇瑜??議고븯??濡쒓렇???꾩씠?붾? 諛섑솚?⑸땲??"""
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
        return jsonify({"message": "?꾩씠??李얘린 ?깃났", "username": user['username'], "nickname": user['nickname']})
    else:
        return jsonify({"detail": "일치하는 계정을 찾을 수 없습니다."}), 404

# --- 鍮꾨?踰덊샇 李얘린 API (10?④퀎) ---
@app.route("/api/find-password", methods=["POST"])
def find_password():
    """?꾩씠?? ?앸뀈?붿씪, ?꾪솕踰덊샇瑜??議고븯???껋뼱踰꾨┛ 鍮꾨?踰덊샇瑜?諛섑솚?⑸땲??"""
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
        return jsonify({"message": "鍮꾨?踰덊샇 李얘린 ?깃났", "password": user['password']})
    else:
        return jsonify({"detail": "?낅젰?섏떊 ?뺣낫? ?쇱튂?섎뒗 怨꾩젙??李얠쓣 ???놁뒿?덈떎."}), 404

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    conn = get_db_connection()
    user = conn.execute("SELECT id, nickname, role, is_active FROM users WHERE username = ? AND password = ?", (username, password)).fetchone()
    conn.close()
    if user:
        if not user["is_active"]:
            return jsonify({"detail": "관리자의 가입 승인 대기 중이거나 정지된 계정입니다."}), 403

        # [서버 측 세션(Flask Session) 등록]
        # 로그인 성공 시 사용자의 고유 ID(user_id)와 역할(role)을 서버 세션에 기록합니다.
        session['user_id'] = user["id"]
        session['role'] = user["role"]

        # 기존 프론트엔드 UI의 로컬 스토리지(localStorage) 동작을 보존하기 위해 기존 JSON 응답 형식을 그대로 반환합니다.
        return jsonify({"message": "로그인 성공", "user_id": user["id"], "nickname": user["nickname"], "role": user["role"]})
    else:
        return jsonify({"detail": "아이디 또는 비밀번호가 잘못되었습니다."}), 401

@app.route("/api/logout", methods=["POST", "GET"])
@app.route("/logout", methods=["POST", "GET"])
def logout():
    """
    로그아웃(Logout) 요청을 처리하여 서버 측 세션(Flask Session)을 안전하게 초기화(Clear)합니다.
    """
    session.clear()
    if request.is_json:
        return jsonify({"message": "로그아웃 성공"})
    return redirect("/auth.html")

# --- AI 교육과정 진도 관리 SQLite 헬퍼 함수 (AI Lesson Progress Database Helpers) ---
# 기존 임시 JSON 파일(ai_progress_store.json) 기반의 저장 로직을 완전히 대체하여,
# SQLite 데이터베이스의 ai_lesson_progress 테이블을 직접 쿼리(Query)하여 진도를 영속화합니다.
# 주의: 데이터베이스 스키마(Schema) 자동 생성(Auto-migration)을 수행하지 않으며,
# 테이블이 존재하지 않을 경우 명확하게 데이터베이스 오류(OperationalError)를 보고합니다.

def get_user_ai_completed_lessons(user_id):
    """
    지정된 사용자의 완료된 AI 학습 단위(lesson_id) 목록을 SQLite ai_lesson_progress 테이블에서 조회합니다.
    테이블이 존재하지 않는 경우 sqlite3.OperationalError 예외가 발생합니다.
    """
    if not user_id:
        return []
    database_connection = get_db_connection()
    try:
        progress_rows = database_connection.execute(
            "SELECT lesson_id, completed_at FROM ai_lesson_progress WHERE user_id = ?",
            (user_id,)
        ).fetchall()
        return [row['lesson_id'] for row in progress_rows]
    finally:
        database_connection.close()

def is_ai_lesson_completed(user_id, lesson_id):
    """
    특정 사용자가 지정된 학습 단위(lesson_id)를 완료했는지 여부를 ai_lesson_progress 테이블에서 확인합니다.
    테이블이 존재하지 않는 경우 sqlite3.OperationalError 예외가 발생합니다.
    """
    if not user_id or not lesson_id:
        return False
    database_connection = get_db_connection()
    try:
        progress_row = database_connection.execute(
            "SELECT 1 FROM ai_lesson_progress WHERE user_id = ? AND lesson_id = ?",
            (user_id, lesson_id)
        ).fetchone()
        return progress_row is not None
    finally:
        database_connection.close()

def mark_user_ai_lesson_completed(user_id, lesson_id):
    """
    특정 사용자의 학습 단위 완료 기록을 ai_lesson_progress 테이블에 멱등(Idempotent)하게 저장합니다.
    UNIQUE(user_id, lesson_id) 제약 조건에 의해 이미 완료된 경우 중복 삽입되지 않고 무시됩니다.
    테이블이 존재하지 않는 경우 sqlite3.OperationalError 예외가 발생합니다.
    """
    if not user_id or not lesson_id:
        return
    database_connection = get_db_connection()
    try:
        database_connection.execute("PRAGMA foreign_keys = ON;")
        current_time_utc = datetime.now(timezone.utc).isoformat()
        database_connection.execute(
            "INSERT OR IGNORE INTO ai_lesson_progress (user_id, lesson_id, completed_at) VALUES (?, ?, ?)",
            (user_id, lesson_id, current_time_utc)
        )
        database_connection.commit()
    finally:
        database_connection.close()

# --- AI 교육과정 진도 및 순차 접근 제어 API (AI Lesson Progress & Access APIs) ---

@app.route("/api/ai/progress", methods=["GET"])
def get_ai_progress():
    """
    현재 로그인된 세션(Session) 사용자의 AI 교육과정 진도 및 2 학습 접근 권한 상태를 조회하는 API입니다.
    클라이언트가 전달하는 로컬스토리지(localStorage), 요청 헤더(Headers), 쿼리 파라미터(Query Parameters),
    요청 본문(Body) 등의 사용자 식별자는 일절 신뢰하지 않으며, 오직 Flask 서버 세션(Flask Session)의
    user_id 및 role만을 기준으로 판별합니다.
    """
    session_user_id = session.get('user_id')
    session_user_role = session.get('role')

    # 세션에 user_id가 없으면 인증 실패(401 Unauthorized) 반환
    if not session_user_id:
        return jsonify({"detail": "인증이 필요합니다. 로그인 후 이용해 주세요."}), 401

    is_admin = (session_user_role == 'admin')

    # SQLite ai_lesson_progress 테이블에서 사용자의 완료 목록 조회
    try:
        completed_lessons = get_user_ai_completed_lessons(session_user_id)
    except sqlite3.OperationalError as database_error:
        # 테이블이 존재하지 않거나 알 수 없는 데이터베이스 오류 발생 시 스키마를 자동 생성하지 않고 500 에러 반환
        return jsonify({
            "detail": f"데이터베이스 오류: ai_lesson_progress 테이블을 조회할 수 없습니다 ({database_error})."
        }), 500

    lesson_01_done = ('lesson_01' in completed_lessons)
    lesson_02_done = ('lesson_02' in completed_lessons)

    # 2 학습 접근 권한 판별: 관리자(Admin) 세션이거나, ai_lesson_progress 테이블에 lesson_01 완료 기록이 있는 세션 사용자
    lesson_02_accessible = is_admin or lesson_01_done

    return jsonify({
        "authenticated": True,
        "user_id": session_user_id,
        "role": session_user_role,
        "is_admin": is_admin,
        "completed_lessons": completed_lessons,
        "lesson_01_completed": lesson_01_done,
        "lesson_02_completed": lesson_02_done,
        "lesson_02_accessible": lesson_02_accessible
    }), 200

@app.route("/api/ai/complete-lesson", methods=["POST"])
def complete_ai_lesson():
    """
    현재 로그인된 사용자의 1 학습(lesson_01) 완료를 확정하고 ai_lesson_progress 테이블에 멱등(Idempotent)하게 기록하는 API입니다.
    클라이언트가 전달하는 임의의 사용자 식별자는 일절 신뢰하지 않으며, 오직 Flask 서버 세션(Session)의 user_id만 사용합니다.
    """
    session_user_id = session.get('user_id')
    if not session_user_id:
        return jsonify({"detail": "인증이 필요합니다. 로그인 후 이용해 주세요."}), 401

    request_payload = request.get_json(silent=True) or {}
    requested_lesson_id = request_payload.get('lesson_id')

    # 오직 1 학습(lesson_01) 완료 등록만 허용
    if requested_lesson_id != 'lesson_01':
        return jsonify({
            "detail": "지원되지 않거나 유효하지 않은 학습 단위입니다. 오직 1 학습(lesson_01)만 완료 등록할 수 있습니다."
        }), 400

    # ai_lesson_progress 테이블에 멱등하게 완료 기록 저장
    try:
        mark_user_ai_lesson_completed(session_user_id, requested_lesson_id)
    except sqlite3.OperationalError as database_error:
        # 테이블이 존재하지 않거나 알 수 없는 데이터베이스 오류 발생 시 스키마를 자동 생성하지 않고 500 에러 반환
        return jsonify({
            "detail": f"데이터베이스 오류: ai_lesson_progress 테이블에 기록할 수 없습니다 ({database_error})."
        }), 500

    return jsonify({
        "message": "1 학습 완료가 정상적으로 등록되었습니다. 2 학습이 열렸습니다.",
        "lesson_id": requested_lesson_id,
        "completed": True,
        "lesson_02_accessible": True
    }), 200

# --- 愿€由ъ옄(Admin) API ---

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    """모든 가입자 정보(관리자 패널용)를 반환합니다."""
    conn = get_db_connection()
    # [10단계 추가 정보 열람 지원] 생년월일, 소속 학교, 학년, 전화번호 포함
    users = conn.execute(
        'SELECT id, username, nickname, role, is_active, birth_date, school_name, grade, phone_number, can_view_hidden FROM users ORDER BY id DESC'
    ).fetchall()
    conn.close()
    return jsonify({"users": [dict(u) for u in users]})

@app.route("/api/admin/users/<int:user_id>/status", methods=["POST"])
def update_user_status(user_id):
    """愿由ъ옄媛 ?뱀젙 ?ъ슜?먯쓽 怨꾩젙 ?쒖꽦??is_active) ?곹깭瑜?蹂寃쏀빀?덈떎."""
    data = request.json
    new_status = data.get('is_active')
    
    if new_status not in [0, 1]:
        return jsonify({"detail": "?щ컮瑜댁? ?딆? ?곹깭媛믪엯?덈떎."}), 400
        
    conn = get_db_connection()
    conn.execute('UPDATE users SET is_active = ? WHERE id = ?', (new_status, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "?ъ슜???곹깭媛 ?낅뜲?댄듃?섏뿀?듬땲??"})

# --- 媛?낆옄 ?뺣낫 媛뺤젣 ?섏젙 API (11?④퀎 援щ쾭???명솚) ---
@app.route("/api/admin/users/<int:user_id>/info", methods=["POST"])
def update_user_info(user_id):
    """愿由ъ옄媛 ?뱀젙 ?ъ슜?먯쓽 鍮꾨?踰덊샇 諛??몄쟻?ы빆 鍮덉뭏??媛뺤젣 ?섏젙?⑸땲??"""
    data = request.json
    
    # ?꾨떖諛쏆? ?꾨뱶媛?異붿텧
    password = data.get('password', '').strip()
    nickname = data.get('nickname', '').strip()
    birth_date = data.get('birth_date', '').strip()
    school_name = data.get('school_name', '').strip()
    grade = data.get('grade', '').strip()
    phone_number = data.get('phone_number', '').strip()

    conn = get_db_connection()
    try:
        # 鍮꾨?踰덊샇媛€ ?낅젰??寃쎌슦 鍮꾨?踰덊샇???④퍡 ??뼱?곌린
        if password:
            conn.execute('''
                UPDATE users 
                SET password = ?, nickname = ?, birth_date = ?, school_name = ?, grade = ?, phone_number = ?
                WHERE id = ?
            ''', (password, nickname, birth_date, school_name, grade, phone_number, user_id))
        else:
            # 鍮꾨?踰덊샇??嫄대뱶由ъ? ?딄퀬 ?몄쟻?ы빆留???뼱?곌린
            conn.execute('''
                UPDATE users 
                SET nickname = ?, birth_date = ?, school_name = ?, grade = ?, phone_number = ?
                WHERE id = ?
            ''', (nickname, birth_date, school_name, grade, phone_number, user_id))
            
        conn.commit()
        return jsonify({"message": "?뚯썝?뺣낫媛 ?깃났?곸쑝濡??섏젙?섏뿀?듬땲??"})
    except Exception as e:
        return jsonify({"detail": f"?섏젙 以??ㅻ쪟 諛쒖깮: {e}"}), 500
    finally:
        conn.close()

@app.route("/api/admin/users/<int:user_id>/role", methods=["POST"])
def update_user_role(user_id):
    data = request.json
    new_role = data.get('role')
    can_view_hidden = data.get('can_view_hidden', False)
    
    # 허용되는 사용자 등급(Role Allowlist)에 신규 기초반('beginner') 역할을 포함합니다.
    if new_role not in ['admin', 'level_1', 'level_2', 'level_3', 'beginner']:
        return jsonify({"detail": "Invalid role"}), 400
        
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            'UPDATE users SET role = ?, can_view_hidden = ? WHERE id = ?',
            (new_role, 1 if can_view_hidden else 0, user_id)
        )
        if cursor.rowcount == 0:
            conn.rollback()
            return jsonify({"detail": "User not found"}), 404
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": f"{user_id} updated"})

@app.route("/api/admin/users/<int:target_user_id>/history", methods=["GET"])
def get_user_history(target_user_id):
    """(19?④퀎) ?뱀젙 ?뚯썝??臾몄젣 ????듦퀎(?쒖떆 踰덊샇, ?쒕ぉ, ?쒕룄 ?잛닔, ?몄뼱, ?깃났 ?щ? ??瑜??곸꽭 ?대엺?⑸땲??"""
    conn = get_db_connection()
    # ?뱀젙 ?좎?媛 ???쒕쾲?대씪???쒕룄??臾몄젣?ㅼ뿉 ??? ?몄뼱蹂꾨줈 ?듦낵 ?잛닔? ?꾩껜 ?쒕룄 ?잛닔瑜?諛섑솚
    query = '''
        SELECT 
            p.id,
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

@app.route("/api/admin/users/<int:target_user_id>/submissions", methods=["DELETE"])
def reset_all_submissions(target_user_id):
    """?뱀젙 ?뚯썝??紐⑤뱺 ???湲곕줉??珥덇린?뷀빀?덈떎."""
    conn = get_db_connection()
    conn.execute('DELETE FROM submissions WHERE user_id = ?', (target_user_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "?대떦 ?좎???紐⑤뱺 ???湲곕줉??珥덇린?붾릺?덉뒿?덈떎."})

@app.route("/api/admin/users/<int:target_user_id>/submissions/<int:problem_id>", methods=["DELETE"])
def reset_problem_submissions(target_user_id, problem_id):
    """?뱀젙 ?뚯썝???뱀젙 臾몄젣 ???湲곕줉??珥덇린?뷀빀?덈떎."""
    conn = get_db_connection()
    conn.execute('DELETE FROM submissions WHERE user_id = ? AND problem_id = ?', (target_user_id, problem_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "?대떦 ?좎????좏깮??臾몄젣 ???湲곕줉??珥덇린?붾릺?덉뒿?덈떎."})

@app.route("/api/admin/images/upload", methods=["POST"])
def upload_image():
    """[35?④퀎] 臾몄젣 ?ㅻ챸 ?깆뿉 ?쎌엯???대?吏瑜??낅줈?쒗븯??API"""
    if 'image' not in request.files:
        return jsonify({"detail": "?뚯씪???꾩넚?섏? ?딆븯?듬땲??"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"detail": "?좏깮???뚯씪???놁뒿?덈떎."}), 400
        
    try:
        # static/images ?대뜑 ?앹꽦
        images_dir = os.path.join(BASE_DIR, 'static', 'images')
        os.makedirs(images_dir, exist_ok=True)
        
        # ?덉쟾???뚯씪紐??앹꽦 (??꾩뒪?ы봽 ?쒖슜)
        import time
        ext = os.path.splitext(file.filename)[1]
        new_filename = f"img_{int(time.time() * 1000)}{ext}"
        save_path = os.path.join(images_dir, new_filename)
        
        file.save(save_path)
        
        # 諛섑솚??URL 寃쎈줈 (/static ???ㅼ뼱媛???뚯씪? Flask媛 湲곕낯 ?쒓났??
        file_url = f"/static/images/{new_filename}"
        return jsonify({"url": file_url, "message": "?낅줈???깃났"})
    except Exception as e:
        return jsonify({"detail": f"?쒕쾭 ???以??ㅻ쪟 諛쒖깮: {e}"}), 500

@app.route("/api/admin/problems/<int:problem_id>", methods=["GET", "PUT", "DELETE"])
def manage_single_problem(problem_id):
    """(13?④퀎) ?뱀젙 臾몄젣 ?곸꽭 議고쉶, ?섏젙, ??젣 泥섎━"""
    conn = get_db_connection()
    try:
        if request.method == "GET":
            # 臾몄젣 湲곕낯 ?뺣낫 議고쉶
            p_row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
            if not p_row:
                return jsonify({"detail": "臾몄젣瑜?李얠쓣 ???놁뒿?덈떎."}), 404
            
            # ?쏀엺 ?뚯뒪??耳?댁뒪??紐⑤몢 議고쉶
            tc_rows = conn.execute("SELECT id, input_data, expected_output FROM test_cases WHERE problem_id = ?", (problem_id,)).fetchall()
            
            result = dict(p_row)
            result["examples"] = [dict(tc) for tc in tc_rows]
            return jsonify(result)

        elif request.method == "PUT":
            # 臾몄젣 ??뼱?곌린 (?섏젙)
            data = request.json
            
            # 湲곗〈 DB?먯꽌 display_id 蹂댁〈 (?꾨줎?몄뿏?쒖뿉???꾨씫 ??0?쇰줈 ??뼱?⑥???踰꾧렇 諛⑹?)
            p_row = conn.execute("SELECT display_id FROM problems WHERE id = ?", (problem_id,)).fetchone()
            current_display_id = p_row["display_id"] if p_row else 0
            is_hidden = 1 if data.get("is_hidden") else 0
            
            conn.execute('''
                UPDATE problems 
                SET title = ?, description = ?, difficulty = ?, time_limit = ?, memory_limit = ?,
                    initial_code_python = ?, initial_code_java = ?, display_id = ?, problem_type = ?,
                    supported_languages = ?, prevent_copy = ?, answer_python = ?, answer_java = ?, is_hidden = ?
                WHERE id = ?
            ''', (
                data.get("title"), data.get("description"), data.get("difficulty"),
                data.get("time_limit"), data.get("memory_limit"), 
                data.get("initial_code_python", ""), data.get("initial_code_java", ""), 
                data.get("display_id", current_display_id), data.get("problem_type", "coding"),
                data.get("supported_languages", "python3,java"),
                1 if data.get("prevent_copy") else 0,
                data.get("answer_python", ""), data.get("answer_java", ""),
                is_hidden, problem_id
            ))
            
            # ?뚯뒪??耳?댁뒪 ??뼱?곌린: 湲곗〈 寃껊뱾 ?꾨? ??젣 ???덈줈 INSERT ?섎뒗 諛⑹떇??媛??源붾걫??
            conn.execute("DELETE FROM test_cases WHERE problem_id = ?", (problem_id,))
            examples = data.get("examples", [])
            for ex in examples:
                conn.execute(
                    'INSERT INTO test_cases (problem_id, input_data, expected_output, is_public) VALUES (?, ?, ?, 1)',
                    (problem_id, ex.get("input_data"), ex.get("expected_output"))
                )
            
            conn.commit()
            return jsonify({"message": "臾몄젣媛 ?깃났?곸쑝濡?媛깆떊?섏뿀?듬땲??"})

        elif request.method == "DELETE":
            # [33?④퀎] ??젣 ?꾩뿉 ?대떦 臾몄젣???쒖씠?꾩? 踰덊샇瑜?癒쇱? 議고쉶
            problem_info = conn.execute(
                'SELECT difficulty, display_id FROM problems WHERE id = ?', (problem_id,)
            ).fetchone()
            
            # 臾몄젣 ??젣 (愿???뚯뒪??耳?댁뒪???④퍡 ??젣)
            conn.execute("DELETE FROM test_cases WHERE problem_id = ?", (problem_id,))
            conn.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
            
            # [33?④퀎] ??젣??臾몄젣蹂대떎 ??踰덊샇??臾몄젣?ㅼ쓣 -1???밴린湲?
            if problem_info:
                conn.execute(
                    'UPDATE problems SET display_id = display_id - 1 WHERE difficulty = ? AND display_id > ?',
                    (problem_info['difficulty'], problem_info['display_id'])
                )
            
            conn.commit()
            return jsonify({"message": "臾몄젣媛 ?곴뎄 ??젣?섏뿀?듬땲?? (??踰덊샇?ㅼ씠 ?먮룞?쇰줈 ?밴꺼議뚯뒿?덈떎.)"})
            
    except Exception as e:
        return jsonify({"detail": f"泥섎━ 以??ㅻ쪟 諛쒖깮: {e}"}), 500
    finally:
        conn.close()

@app.route("/api/admin/problems", methods=["POST"])
def add_new_problem():
    """???붾㈃?먯꽌 ?낅젰???덈줈??臾몄젣瑜??곗씠?곕쿋?댁뒪???깅줉?⑸땲??"""
    data = request.json
    title = data.get('title')
    desc = data.get('description')
    diff = data.get('difficulty', 1)
    t_limit = data.get('time_limit', 1.0)
    m_limit = data.get('memory_limit', 128)
    initial_code_python = data.get('initial_code_python', '')
    initial_code_java = data.get('initial_code_java', '')
    answer_python = data.get('answer_python', '')
    answer_java = data.get('answer_java', '')
    problem_type = data.get('problem_type', 'coding')
    supported_languages = data.get('supported_languages', 'python3,java')
    examples = data.get('examples', []) # { input_data: "", expected_output: "" }
    
    prevent_copy = 1 if data.get('prevent_copy') else 0
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # [37?④퀎] 臾댁“嫄??대떦 ?쒖씠???앸쾲??1 ?먮룞 遺??(以묎컙?쎌엯 ?쒓굅)
    max_row = cursor.execute(
        'SELECT MAX(display_id) as max_did FROM problems WHERE difficulty = ?', (diff,)
    ).fetchone()
    display_id = (max_row['max_did'] or 0) + 1
    
    cursor.execute('''
        INSERT INTO problems (title, description, difficulty, time_limit, memory_limit, initial_code_python, initial_code_java, display_id, problem_type, supported_languages, prevent_copy, answer_python, answer_java)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (title, desc, diff, t_limit, m_limit, initial_code_python, initial_code_java, display_id, problem_type, supported_languages, prevent_copy, answer_python, answer_java))
    
    new_pid = cursor.lastrowid
    
    for ex in examples:
        cursor.execute('''
            INSERT INTO test_cases (problem_id, input_data, expected_output, is_public)
            VALUES (?, ?, ?, 1)
        ''', (new_pid, ex.get('input_data', ''), ex.get('expected_output', '')))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": f"臾몄젣媛 ?깃났?곸쑝濡??깅줉?섏뿀?듬땲?? (踰덊샇: {display_id})", "problem_id": new_pid})

# --- 문제 JSON 백업/가져오기 (스키마 v1) ---
PROBLEM_EXPORT_VERSION = 1
PROBLEM_EXPORT_FIELDS = {
    'id', 'display_id', 'title', 'description', 'difficulty', 'time_limit',
    'memory_limit', 'initial_code_python', 'initial_code_java', 'problem_type',
    'supported_languages', 'prevent_copy', 'answer_python', 'answer_java',
    'is_hidden', 'examples'
}


def _problem_payload(conn):
    rows = conn.execute('SELECT * FROM problems ORDER BY difficulty ASC, display_id ASC, id ASC').fetchall()
    result = []
    for row in rows:
        item = {key: row[key] for key in row.keys() if key in PROBLEM_EXPORT_FIELDS and key != 'examples'}
        item['examples'] = [dict(tc) for tc in conn.execute(
            'SELECT input_data, expected_output, is_public FROM test_cases WHERE problem_id = ? ORDER BY id ASC',
            (row['id'],)
        ).fetchall()]
        result.append(item)
    return result


def _validate_problem_document(document):
    errors = []
    if not isinstance(document, dict) or document.get('schema_version') != PROBLEM_EXPORT_VERSION:
        return ['schema_version은 1이어야 합니다.']
    problems = document.get('problems')
    if not isinstance(problems, list):
        return ['problems는 배열이어야 합니다.']
    seen = set()
    for index, problem in enumerate(problems):
        if not isinstance(problem, dict):
            errors.append(f'problems[{index}]은 객체여야 합니다.'); continue
        unknown = set(problem) - PROBLEM_EXPORT_FIELDS
        if unknown: errors.append(f'problems[{index}] 허용되지 않은 필드: {sorted(unknown)}')
        for field in ('id', 'title', 'description', 'difficulty'):
            if field not in problem: errors.append(f'problems[{index}] 필수 필드 누락: {field}')
        pid = problem.get('id')
        if not isinstance(pid, int) or isinstance(pid, bool): errors.append(f'problems[{index}].id는 정수여야 합니다.')
        elif pid in seen: errors.append(f'중복 문제 ID: {pid}')
        else: seen.add(pid)
        if not isinstance(problem.get('examples', []), list): errors.append(f'problems[{index}].examples는 배열이어야 합니다.')
        for ex_index, example in enumerate(problem.get('examples', [])):
            if not isinstance(example, dict) or not {'input_data', 'expected_output'} <= set(example):
                errors.append(f'problems[{index}].examples[{ex_index}] 입력/출력 필드가 필요합니다.')
    return errors


def require_admin(view_function):
    """
    관리자(Admin) 권한을 서버 측 세션(Session)에서만 검증하는 데코레이터(Decorator) 함수입니다.

    보안 취약점 방지를 위해 요청 헤더(Authorization, X-User-Id), 쿼리 파라미터(user_id),
    요청 본문(Request Body), 로컬 스토리지(localStorage) 등 클라이언트가 전달하는
    일체의 사용자 식별자를 배제하고,
    오직 서버 측 플라스크 세션(Flask Server Session)의 'user_id' 및 'role' 값만을 신뢰하여 인가합니다.

    - 세션에 user_id가 없는 비로그인 요청: 401 Unauthorized 반환
    - 로그인되어 있으나 role이 'admin'이 아닌 비관리자 요청: 403 Forbidden 반환
    """
    @wraps(view_function)
    def decorated_function(*args, **kwargs):
        # 1. 서버 측 세션(Flask Session)에 사용자 식별자(user_id)가 존재하는지(로그인 여부) 검증
        # 세션에 user_id가 없는 경우 401 Unauthorized JSON 응답을 반환합니다.
        session_user_id = session.get('user_id')
        if not session_user_id:
            return jsonify({"detail": "인증이 필요합니다. 로그인 후 다시 시도해주세요."}), 401

        # 2. 서버 측 세션(Flask Session)의 사용자 역할(role)이 'admin'인지 검증
        # 로그인되어 있으나 관리자 역할이 아닌 경우 403 Forbidden JSON 응답을 반환합니다.
        session_user_role = session.get('role')
        if session_user_role != 'admin':
            return jsonify({"detail": "관리자(Admin) 권한이 필요합니다."}), 403

        # 3. 유효한 관리자 세션인 경우 기존 뷰 함수(View Function) 정상 실행
        return view_function(*args, **kwargs)

    return decorated_function


@app.route("/api/admin/problems/export", methods=["GET"])
@require_admin
def export_problems():
    conn = get_db_connection()
    try:
        document = {'schema_version': PROBLEM_EXPORT_VERSION,
                    'exported_at': datetime.now(timezone.utc).isoformat(),
                    'problems': _problem_payload(conn)}
    finally:
        conn.close()
    body = json.dumps(document, ensure_ascii=False, indent=2) + '\n'
    return send_file(io.BytesIO(body.encode('utf-8')), mimetype='application/json',
                     as_attachment=True, download_name='problems.json')


@app.route("/api/admin/problems/import/validate", methods=["POST"])
@require_admin
def validate_problem_import():
    document = request.get_json(silent=True)
    errors = _validate_problem_document(document)
    if errors: return jsonify({'valid': False, 'errors': errors, 'dry_run': True}), 400
    conn = get_db_connection()
    try:
        existing = {row['id'] for row in conn.execute('SELECT id FROM problems')}
    finally: conn.close()
    incoming = {p['id'] for p in document['problems']}
    return jsonify({'valid': True, 'dry_run': True, 'new_ids': sorted(incoming-existing),
                    'updated_ids': sorted(incoming & existing), 'deleted_ids': [],
                    'count': len(incoming)})


@app.route("/api/admin/problems/import", methods=["POST"])
@require_admin
def import_problems():
    document = request.get_json(silent=True)
    errors = _validate_problem_document(document)
    if errors: return jsonify({'valid': False, 'errors': errors}), 400
    backup_dir = os.path.join(BASE_DIR, 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, 'judge_db_' + datetime.now().strftime('%Y%m%d_%H%M%S') + '.sqlite')
    shutil.copy2(DB_FILENAME, backup_path)
    conn = get_db_connection()
    try:
        conn.execute('BEGIN')
        for p in document['problems']:
            exists = conn.execute('SELECT 1 FROM problems WHERE id = ?', (p['id'],)).fetchone()
            values = (p['title'], p['description'], p['difficulty'], p.get('time_limit'), p.get('memory_limit'), p.get('initial_code_python',''), p.get('initial_code_java',''), p.get('display_id', 0), p.get('problem_type','coding'), p.get('supported_languages','python3,java'), int(bool(p.get('prevent_copy'))), p.get('answer_python',''), p.get('answer_java',''), int(bool(p.get('is_hidden'))))
            if exists:
                conn.execute('UPDATE problems SET title=?, description=?, difficulty=?, time_limit=?, memory_limit=?, initial_code_python=?, initial_code_java=?, display_id=?, problem_type=?, supported_languages=?, prevent_copy=?, answer_python=?, answer_java=?, is_hidden=? WHERE id=?', values + (p['id'],))
            else:
                conn.execute('INSERT INTO problems (id, title, description, difficulty, time_limit, memory_limit, initial_code_python, initial_code_java, display_id, problem_type, supported_languages, prevent_copy, answer_python, answer_java, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (p['id'],) + values)
            conn.execute('DELETE FROM test_cases WHERE problem_id = ?', (p['id'],))
            for example in p.get('examples', []):
                conn.execute('INSERT INTO test_cases (problem_id, input_data, expected_output, is_public) VALUES (?, ?, ?, ?)', (p['id'], example['input_data'], example['expected_output'], int(bool(example.get('is_public', True)))))
        conn.commit()
    except Exception:
        conn.rollback(); raise
    finally: conn.close()
    return jsonify({'imported': True, 'updated_count': len(document['problems']), 'backup_path': backup_path})


@app.route("/api/admin/database/merge", methods=["POST"])
@require_admin
def admin_database_merge():
    """
    [서버 DB와 작업 DB 안전 병합 API]
    관리자가 업로드한 작업 DB 파일 또는 서버 내 작업 DB 파일 경로를 받아
    운영 중인 서버 DB의 사용자/제출/과제 데이터를 100% 보존하면서
    문제 및 테스트케이스를 안전하게 병합합니다.

    - 파일 업로드(Multipart Form) 또는 JSON 경로 지정 지원
    - 충돌 발생 시 원본을 변경하지 않고 즉시 400 에러 반환
    - 병합 전 자동 백업 생성 및 PRAGMA integrity_check 무결성 검증 수행
    """
    import tempfile
    import merge_db

    # 1. 요청 파라미터 추출 (Multipart Form 또는 JSON)
    uploaded_file = request.files.get("work_db")
    dry_run = False
    temp_work_file = None

    try:
        if uploaded_file:
            # 파일 업로드인 경우: 임시 파일로 저장 후 처리
            dry_run = request.form.get("dry_run", "false").lower() in ("true", "1", "yes")
            temp_fd, temp_work_file = tempfile.mkstemp(prefix="uploaded_work_db_", suffix=".sqlite")
            os.close(temp_fd)
            uploaded_file.save(temp_work_file)
            work_db_path = temp_work_file
        else:
            # JSON 요청인 경우: 파일 경로 지정
            data = request.get_json(silent=True) or {}
            work_db_path = data.get("work_db_path")
            dry_run = bool(data.get("dry_run", False))

            if not work_db_path or not os.path.exists(work_db_path):
                return jsonify({
                    "success": False,
                    "detail": "유효한 작업 데이터베이스 파일(work_db)을 업로드하거나 경로(work_db_path)를 지정해야 합니다."
                }), 400

        # 2. 안전한 DB 병합 실행 (In-Place 모드로 운영 DB에 반영 또는 Dry-Run)
        backup_dir = os.path.join(BASE_DIR, "backups")
        merge_result = merge_db.merge_databases(
            server_db_path=DB_FILENAME,
            work_db_path=work_db_path,
            in_place=True,
            backup_dir=backup_dir,
            dry_run=dry_run,
        )

        return jsonify({
            "success": True,
            "message": "데이터베이스 병합이 안전하게 완료되었습니다." if not dry_run else "데이터베이스 병합 시뮬레이션(Dry-Run)이 성공적으로 완료되었습니다.",
            "dry_run": dry_run,
            "backup_path": merge_result.get("backup_path"),
            "stats": merge_result.get("stats"),
            "integrity": merge_result.get("integrity"),
        }), 200

    except merge_db.DatabaseMergeError as error:
        return jsonify({
            "success": False,
            "detail": f"데이터베이스 병합 중단 (원본 보존됨): {str(error)}",
            "error_type": error.__class__.__name__,
        }), 400
    except Exception as error:
        return jsonify({
            "success": False,
            "detail": f"서버 내부 오류로 병합 중단: {str(error)}",
        }), 500
    finally:
        # 임시 업로드 파일 정리
        if temp_work_file and os.path.exists(temp_work_file):
            try:
                os.remove(temp_work_file)
            except OSError:
                pass


@app.route("/api/admin/problems/reorder", methods=["POST"])
def reorder_problems():
    """[37?④퀎] ?뱀젙 ?쒖씠????臾몄젣 ?쒖꽌瑜??쒕옒洹몄븻?쒕∼?쇰줈 蹂寃쏀빀?덈떎."""
    data = request.json
    difficulty = data.get('difficulty')
    order = data.get('order', [])  # 臾몄젣 ID 諛곗뿴 (???쒖꽌?濡?
    
    if difficulty is None or not order:
        return jsonify({"detail": "?쒖씠?꾩? ?쒖꽌 ?곗씠?곌? ?꾩슂?⑸땲??"}), 400
    
    conn = get_db_connection()
    try:
        # 諛쏆? ?쒖꽌?濡?display_id瑜?1遺???쒖감 遺??
        for idx, problem_id in enumerate(order):
            conn.execute(
                'UPDATE problems SET display_id = ? WHERE id = ? AND difficulty = ?',
                (idx + 1, problem_id, difficulty)
            )
        conn.commit()
        return jsonify({"message": f"?쒖씠??{difficulty}??臾몄젣 ?쒖꽌媛 ?깃났?곸쑝濡?蹂寃쎈릺?덉뒿?덈떎."})
    except Exception as e:
        return jsonify({"detail": f"?쒖꽌 蹂寃?以??ㅻ쪟: {e}"}), 500
    finally:
        conn.close()

# --- 遺媛 湲곕뒫 API (??궧/?밴툒) ---

@app.route("/api/ranking", methods=["GET"])
def get_ranking():
    """紐⑤뱺 媛?낆옄???뺣떟(AC)??留욎텣 怨좎쑀 臾몄젣 媛쒖닔瑜?吏묎퀎?섏뿬 ?곸쐞 10紐낆쓽 ??궧??諛섑솚?⑸땲??"""
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

# --- [?붽컙 ?먯닔 ?쒖뒪?? API ?붾뱶?ъ씤??---

@app.route("/api/monthly-scores", methods=["GET"])
def get_monthly_scores():
    """
    ?뱀젙 ?ъ슜?먯쓽 ?붽컙 ?먯닔瑜?理쒕? 3媛쒖썡移?諛섑솚?⑸땲??
    ?먯닔 洹쒖튃:
      - 湲곗큹(?쒖씠??0) / 3湲??쒖씠??1, 2) 臾몄젣: 臾몄젣??1??
      - 2湲??쒖씠??3, 4) 臾몄젣: 臾몄젣??2??
      - 1湲??쒖씠??5, 6) 臾몄젣: 臾몄젣??3??
    媛숈? 臾몄젣?쇰룄 ?섎（??1踰덉뵫 ?먯닔媛 遺?щ맗?덈떎. (?좎쭨媛 ?ㅻⅤ硫??ㅼ떆 ?먯닔 ?띾뱷 媛??
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id媛 ?꾩슂?⑸땲??"}), 400

    conn = get_db_connection()

    # 理쒓렐 3媛쒖썡 ?숈븞 AC瑜?諛쏆? 怨좎쑀 (臾몄젣, ?좎쭨) 議고빀??媛?몄샃?덈떎.
    # 媛숈? 臾몄젣?쇰룄 ?좎쭨媛 ?ㅻⅤ硫?媛곴컖 ?먯닔媛 遺?щ맗?덈떎.
    query = '''
        SELECT 
            strftime('%Y-%m', s.submitted_at) as month,
            strftime('%Y-%m-%d', s.submitted_at) as day,
            p.difficulty,
            s.problem_id
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ?
          AND s.status = 'AC'
          AND s.submitted_at >= date('now', '-3 months')
        GROUP BY day, s.problem_id
        ORDER BY month DESC
    '''
    rows = conn.execute(query, (user_id,)).fetchall()
    conn.close()

    # ?붾퀎濡??먯닔瑜??⑹궛?⑸땲??
    monthly_data = {}
    for row in rows:
        month = row['month']
        difficulty = row['difficulty']

        # ?쒖씠?꾨퀎 ?먯닔 ?섏궛
        if difficulty <= 2:       # 湲곗큹(0) / 3湲?湲곕낯(1) / 3湲?怨좉툒(2) ??1??
            score = 1
        elif difficulty <= 4:     # 2湲?湲곕낯(3) / 2湲?怨좉툒(4) ??2??
            score = 2
        else:                     # 1湲?湲곕낯(5) / 1湲?怨좉툒(6) ??3??
            score = 3

        if month not in monthly_data:
            monthly_data[month] = {"month": month, "score": 0, "problem_count": 0}
        monthly_data[month]["score"] += score
        monthly_data[month]["problem_count"] += 1

    # 理쒖떊 ?쒖쑝濡??뺣젹?섏뿬 理쒕? 3媛쒖썡源뚯?留?諛섑솚
    result = sorted(monthly_data.values(), key=lambda x: x["month"], reverse=True)[:3]

    return jsonify({"monthly_scores": result})

# --- [愿€由ъ옄 ?ъ씤??愿€由? API ?붾뱶?ъ씤??---

@app.route("/api/admin/points", methods=["GET"])
def get_all_user_points():
    """
    승인된(is_active=1) 모든 사용자의 누적 포인트 현황을 반환합니다.
    전체 기간 AC를 집계하며, 같은 문제는 같은 날짜에 여러 번 맞혀도 1회만 인정하고
    다른 날짜에 다시 맞히면 날짜별로 각각 점수를 누적합니다.
    """
    conn = get_db_connection()
    
    # 승인된 사용자 목록 조회 (관리자 계정 제외)
    users = conn.execute(
        'SELECT id, nickname, username, role, bonus_points FROM users WHERE is_active = 1 AND role != "admin" ORDER BY nickname ASC'
    ).fetchall()
    
    # 각 사용자별 문제 해결 점수 계산 (전체 기간 모든 AC 제출 누적)
    result = []
    for u in users:
        # 전체 기간(All-time) 동안의 모든 승인된 AC 제출에서 문제 난이도(difficulty)를 가져옵니다.
        # Count all stored AC submissions, but recognize one AC per problem per calendar date.
        # 날짜와 문제별로 그룹화해 같은 날짜의 같은 문제 AC는 1회만 인정합니다.
        rows = conn.execute('''
            SELECT p.difficulty, s.problem_id, strftime('%Y-%m-%d', s.submitted_at) AS day
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? AND s.status = 'AC'
            GROUP BY day, s.problem_id
        ''', (u['id'],)).fetchall()
        
        solve_score = 0
        for row in rows:
            difficulty_level = row['difficulty']
            # 난이도(difficulty)별 해결 점수 부여:
            # - 기초(0), 3급 기본(1), 3급 고급(2): 1점
            # - 2급 기본(3), 2급 고급(4): 2점
            # - 1급 기본(5), 1급 고급(6): 3점
            if difficulty_level <= 2:
                solve_score += 1
            elif difficulty_level <= 4:
                solve_score += 2
            else:
                solve_score += 3
        
        bonus = u['bonus_points'] or 0
        result.append({
            'id': u['id'],
            'nickname': u['nickname'],
            'username': u['username'],
            'role': u['role'],
            'solve_score': solve_score,
            'bonus_points': bonus,
            'total_points': solve_score + bonus
        })
    
    conn.close()
    return jsonify({"users": result})


@app.route("/api/admin/users/<int:user_id>/bonus-points", methods=["POST"])
def update_bonus_points(user_id):
    """
    愿由ъ옄媛 ?뱀젙 ?ъ슜?먯쓽 蹂대꼫???ъ씤?몃? 利앷컧?⑸땲??
    ?붿껌 body: { "amount": 10 } (?묒닔硫?利앷?, ?뚯닔硫?李④컧)
    """
    data = request.json
    amount = data.get('amount', 0)
    
    if not isinstance(amount, int):
        return jsonify({"error": "amount???뺤닔?ъ빞 ?⑸땲??"}), 400
    
    conn = get_db_connection()
    # ?꾩옱 蹂대꼫???ъ씤??議고쉶
    user = conn.execute('SELECT bonus_points FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎."}), 404
    
    current_bonus = user['bonus_points'] or 0
    new_bonus = current_bonus + amount
    
    conn.execute('UPDATE users SET bonus_points = ? WHERE id = ?', (new_bonus, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "new_bonus_points": new_bonus})


@app.route("/api/user-points", methods=["GET"])
def get_user_points():
    """
    특정 사용자의 전체 누적 종합 포인트를 반환합니다. (전체 기간 해결 점수 + 보너스 포인트)
    학생 본인의 홈 화면에서 자기 종합 포인트를 확인할 때 사용합니다.
    (최근 3개월 날짜 필터는 제거하여 전체 저장 기간 동안의 정답 제출을 집계하되,
     동일한 달력 날짜에 동일한 문제의 중복 AC 제출은 1회만 인정되는 규칙을 유지합니다.)
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id가 필요합니다."}), 400
    
    conn = get_db_connection()
    
    # 보너스 포인트(bonus_points) 조회
    user = conn.execute('SELECT bonus_points FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404
    
    bonus = user['bonus_points'] or 0
    
    # 전체 저장 기간(All-time) 동안의 승인된 정답(AC, Accepted) 제출로부터 문제 풀이 점수(solve_score) 계산
    # - 최근 3개월 날짜 필터는 제거하여 전체 저장 기간 동안의 제출을 집계합니다.
    # - 동일한 달력 날짜(day)에 동일한 문제(problem_id)를 반복해서 맞힌 경우 1회만 계산(GROUP BY day, s.problem_id)하는 기존 규칙을 유지합니다.
    rows = conn.execute('''
        SELECT p.difficulty, s.problem_id, strftime('%Y-%m-%d', s.submitted_at) as day
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ? AND s.status = 'AC'
        GROUP BY day, s.problem_id
    ''', (user_id,)).fetchall()
    
    solve_score = 0
    for row in rows:
        difficulty_level = row['difficulty']
        # 난이도(difficulty)별 해결 점수 부여:
        # - 기초(0), 3급 기본(1), 3급 고급(2): 1점
        # - 2급 기본(3), 2급 고급(4): 2점
        # - 1급 기본(5), 1급 고급(6): 3점
        if difficulty_level <= 2:
            solve_score += 1
        elif difficulty_level <= 4:
            solve_score += 2
        else:
            solve_score += 3
    
    # 오늘 푼 고유 문제 수 계산 (당일 학습 현황용)
    today_row = conn.execute('''
        SELECT COUNT(DISTINCT problem_id) as cnt
        FROM submissions
        WHERE user_id = ? AND status IN ('AC', 'AC_LATE')
          AND date(submitted_at, 'localtime') = date('now', 'localtime')
    ''', (user_id,)).fetchone()
    today_solved_count = today_row['cnt'] if today_row else 0
    
    # 오늘 답안 열람 횟수 계산 (당일 학습 현황용)
    viewed_row = conn.execute('''
        SELECT COUNT(id) as cnt
        FROM submissions
        WHERE user_id = ? AND status = 'VIEW_ANSWER'
          AND date(submitted_at, 'localtime') = date('now', 'localtime')
    ''', (user_id,)).fetchone()
    today_viewed_count = viewed_row['cnt'] if viewed_row else 0
    
    conn.close()
    
    return jsonify({
        "solve_score": solve_score,
        "bonus_points": bonus,
        "total_points": solve_score + bonus,
        "today_solved_count": today_solved_count,
        "today_viewed_count": today_viewed_count
    })

# --- 蹂??쒕퉬??API ?붾뱶?ъ씤??---

@app.route("/api/problems", methods=["GET"])
def get_problems():
    """
    ?깅줉??臾몄젣 紐⑸줉??議고쉶?⑸땲??
    留뚯빟 user_id媛 荑쇰━ ?뚮씪誘명꽣濡??섏뼱?ㅻ㈃, ?대떦 ?좎?媛 ?뺣떟(AC)??留욎텣 ?대젰???ы븿?쒗궢?덈떎.
    """
    user_id = request.args.get('user_id')
    is_admin = request.args.get('is_admin') == 'true'
    
    conn = get_db_connection()
    problems_raw = conn.execute('SELECT id, display_id, title, difficulty, problem_type, supported_languages, prevent_copy, is_hidden FROM problems ORDER BY difficulty ASC, display_id ASC').fetchall()
    
    can_view_hidden = False
    if is_admin:
        can_view_hidden = True
    elif user_id:
        user_info = conn.execute('SELECT role, can_view_hidden FROM users WHERE id = ?', (user_id,)).fetchone()
        if user_info:
            can_view_hidden = bool(user_info['can_view_hidden']) or user_info['role'] == 'admin'
            
    solved_python_counts = {}
    solved_java_counts = {}
    view_answer_counts = {}
    
    if user_id:
        # 풀이 횟수는 답안 열람 후 정답(AC_LATE)도 포함
        solved_records = conn.execute(
            'SELECT problem_id, language, COUNT(*) as cnt FROM submissions WHERE user_id = ? AND status IN ("AC", "AC_LATE") GROUP BY problem_id, language',
            (user_id,)
        ).fetchall()
        
        for row in solved_records:
            if row['language'] == 'python3':
                solved_python_counts[row['problem_id']] = row['cnt']
            elif row['language'] == 'java':
                solved_java_counts[row['problem_id']] = row['cnt']
                
        # 답안 열람 횟수
        view_records = conn.execute(
            'SELECT problem_id, COUNT(*) as cnt FROM submissions WHERE user_id = ? AND status = "VIEW_ANSWER" GROUP BY problem_id',
            (user_id,)
        ).fetchall()
        
        for row in view_records:
            view_answer_counts[row['problem_id']] = row['cnt']
        
    conn.close()
    
    result_list = []
    for p in problems_raw:
        p_dict = dict(p)
        # 권한이 없으면 숨긴 문제를 목록에서 제외
        if p_dict.get('is_hidden') and not can_view_hidden:
            continue
            
        p_dict['is_solved_python'] = p_dict['id'] in solved_python_counts
        p_dict['is_solved_java'] = p_dict['id'] in solved_java_counts
        p_dict['solve_count_python'] = solved_python_counts.get(p_dict['id'], 0)
        p_dict['solve_count_java'] = solved_java_counts.get(p_dict['id'], 0)
        p_dict['view_answer_count'] = view_answer_counts.get(p_dict['id'], 0)
        result_list.append(p_dict)
        
    return jsonify({"problems": result_list})

@app.route("/api/problems/<int:problem_id>", methods=["GET"])
def get_problem_detail(problem_id):
    """?뱀젙 臾몄젣???곸꽭 ?ㅻ챸怨??쒗븳 議곌굔 ?깆쓣 議고쉶?⑸땲??"""
    conn = get_db_connection()
    problem = conn.execute('SELECT * FROM problems WHERE id = ?', (problem_id,)).fetchone()
    
    if not problem:
        conn.close()
        return jsonify({"detail": "?대떦 臾몄젣瑜?李얠쓣 ???놁뒿?덈떎."}), 404
        
    # 怨듦컻???뚯뒪??耳?댁뒪(?덉젣 ?낆텧?????④퍡 ?대젮蹂대궡以띾땲??
    public_cases = conn.execute(
        'SELECT input_data, expected_output FROM test_cases WHERE problem_id = ? AND is_public = 1',
        (problem_id,)
    ).fetchall()
    conn.close()
    
    result = dict(problem)
    result["examples"] = [dict(case) for case in public_cases]
    return jsonify(result)

@app.route("/api/problems/<int:problem_id>/answer", methods=["GET"])
def get_problem_answer(problem_id):
    """?숈깮???듭븞 蹂닿린瑜??붿껌?????뺣떟 肄붾뱶瑜?諛섑솚?⑸땲??"""
    lang = request.args.get('lang', 'python3')
    conn = get_db_connection()
    row = conn.execute(
        "SELECT answer_python, answer_java FROM problems WHERE id = ?", (problem_id,)
    ).fetchone()
    conn.close()
    
    if not row:
        return jsonify({"error": "臾몄젣瑜?李얠쓣 ???놁뒿?덈떎."}), 404
        
    answer_code = row['answer_python'] if lang == 'python3' else row['answer_java']
    return jsonify({"answer": answer_code})

@app.route("/api/view-answer", methods=["POST"])
def record_view_answer():
    """모범 답안을 열람한 경우, 어뷰징 방지를 위해 당일 열람 기록(VIEW_ANSWER)을 DB에 남깁니다."""
    data = request.json
    user_id = data.get('user_id')
    problem_id = data.get('problem_id')
    
    if not user_id or not problem_id:
        return jsonify({"error": "잘못된 요청입니다."}), 400
        
    conn = get_db_connection()
    # 이미 오늘 열람 기록이 있는지 확인
    existing = conn.execute('''
        SELECT id FROM submissions
        WHERE user_id = ? AND problem_id = ? AND status = 'VIEW_ANSWER'
          AND date(submitted_at, 'localtime') = date('now', 'localtime')
    ''', (user_id, problem_id)).fetchone()
    
    if not existing:
        conn.execute('''
            INSERT INTO submissions (user_id, problem_id, language, code, status)
            VALUES (?, ?, 'none', '답안 열람', 'VIEW_ANSWER')
        ''', (user_id, problem_id))
        conn.commit()
    conn.close()
    
    return jsonify({"success": True})


@app.route("/api/submissions", methods=["POST"])
def submit_code():
    """
    ?ъ슜?먭? ?묒꽦??肄붾뱶瑜??쒖텧諛쏆븘 ?ㅽ뻾 ?湲곗뿴(DB)???ｊ퀬 梨꾩젏?⑸땲??
    """
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. ?쒖텧 ?댁뿭??DB??Pending(?湲?以? ?곹깭濡????
    cursor.execute('''
        INSERT INTO submissions (user_id, problem_id, language, code, status)
        VALUES (?, ?, ?, ?, 'Pending')
    ''', (data.get('user_id'), data.get('problem_id'), data.get('language'), data.get('code')))
    submission_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # 2. PythonAnywhere ?ㅻ젅???쒗븳 ?고쉶瑜??꾪빐 bg_tasks ????숆린?곸쑝濡?吏곸젒 梨꾩젏 ?ㅽ뻾
    simple_judge.judge_submission(submission_id)
    
    # [?뺣떟 蹂닿린 ?⑤꼸?? 紐⑤쾾 ?듭븞???대엺???곹깭濡??쒖텧?덈떎硫? AC ?듦낵 ???ъ씤?몃? 吏湲됲븯吏 ?딄린 ?꾪빐 AC_LATE濡?媛뺤젣 ?곹깭 蹂寃?
    is_late_flag = data.get('is_late', False)
    
    conn2 = get_db_connection()
    if not is_late_flag:
        viewed = conn2.execute('''
            SELECT id FROM submissions
            WHERE user_id = ? AND problem_id = ? AND status = 'VIEW_ANSWER'
              AND date(submitted_at, 'localtime') = date('now', 'localtime')
        ''', (data.get('user_id'), data.get('problem_id'))).fetchone()
        if viewed:
            is_late_flag = True

    if is_late_flag:
        s = conn2.execute('SELECT status FROM submissions WHERE id = ?', (submission_id,)).fetchone()
        if s and s['status'] == 'AC':
            conn2.execute("UPDATE submissions SET status = 'AC_LATE' WHERE id = ?", (submission_id,))
            conn2.commit()
    conn2.close()
    
    # [9?④퀎] 3. 湲곗〈??議댁옱?덈뜕 ?먮룞 ?밴툒(Auto-Promotion) 泥섎━ 肄붾뱶????젣?섏뿀?듬땲?? (?댁젣 ?섎룞?쇰줈留?
    
    return jsonify({"message": "肄붾뱶媛 ?깃났?곸쑝濡??쒖텧?섍퀬 梨꾩젏???꾨즺?섏뿀?듬땲??", "submission_id": submission_id})

@app.route("/api/submissions/<int:submission_id>", methods=["GET"])
def get_submission_result(submission_id):
    """?뱀젙 ?쒖텧???꾩옱 梨꾩젏 ?곹깭(Pending 濡쒕뵫 以? AC ?듦낵 ??瑜?議고쉶?⑸땲??"""
    conn = get_db_connection()
    submission = conn.execute(
        'SELECT status, time_used, memory_used, actual_output FROM submissions WHERE id = ?',
        (submission_id,)
    ).fetchone()
    conn.close()
    
    if not submission:
        return jsonify({"detail": "?쒖텧 ?댁뿭??李얠쓣 ???놁뒿?덈떎."}), 404
        
    return jsonify(dict(submission))

# --- 怨쇱젣(Assignment) API (愿由ъ옄?? ---
import random

@app.route("/api/admin/assignments", methods=["GET"])
def get_assignments():
    conn = get_db_connection()
    assignments = conn.execute('SELECT * FROM assignments ORDER BY id DESC').fetchall()
    
    # ?꾩껜 ?ъ슜??紐⑸줉 (admin ?쒖쇅)
    all_users = conn.execute("SELECT id, username, role FROM users WHERE role != 'admin'").fetchall()
    
    result = []
    for a in assignments:
        a_dict = dict(a)
        
        # ??怨쇱젣??????숈깮 ?꾪꽣留?
        target_users = []
        if a_dict['target_type'] == 'all':
            target_users = all_users
        elif a_dict['target_type'] == 'group':
            target_users = [u for u in all_users if u['role'] == a_dict['target_value']]
        elif a_dict['target_type'] == 'user':
            target_users = [u for u in all_users if u['username'] == a_dict['target_value']]
        
        # 怨쇱젣???ы븿??臾몄젣 ID ?뚯떛
        p_ids = [pid.strip() for pid in (a_dict['problem_ids'] or '').split(',') if pid.strip()]
        total_probs = len(p_ids)
        
        # 媛?????숈깮???꾨즺 ?щ? 吏묎퀎
        total_students = len(target_users)
        completed_students = 0
        
        if total_probs > 0 and total_students > 0:
            phs = ','.join(['?'] * total_probs)
            # end_time???덉쑝硫?留덇컧?쇨퉴吏留? ?놁쑝硫?異쒖젣 ?댄썑 ?꾩껜
            has_end = bool(a_dict.get('end_time'))
            for u in target_users:
                if has_end:
                    ac_query = f'''
                        SELECT COUNT(DISTINCT problem_id) as ac_cnt
                        FROM submissions
                        WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs})
                          AND submitted_at >= ? AND submitted_at <= ?
                    '''
                    params = [u['id']] + p_ids + [a_dict['created_at'], a_dict['end_time']]
                else:
                    ac_query = f'''
                        SELECT COUNT(DISTINCT problem_id) as ac_cnt
                        FROM submissions
                        WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs})
                          AND submitted_at >= ?
                    '''
                    params = [u['id']] + p_ids + [a_dict['created_at']]
                ac_row = conn.execute(ac_query, params).fetchone()
                if ac_row['ac_cnt'] >= total_probs:
                    completed_students += 1
        
        a_dict['total_students'] = total_students
        a_dict['completed_students'] = completed_students
        result.append(a_dict)
    
    conn.close()
    return jsonify(result)

@app.route("/api/admin/assignments", methods=["POST"])
def create_assignment():
    data = request.json
    title = data.get('title')
    description = data.get('description', '')
    target_type = data.get('target_type', 'all')
    target_value = data.get('target_value', '')
    start_time = data.get('start_time', '')
    end_time = data.get('end_time', '')
    problem_mode = data.get('problem_mode', 'manual')
    
    conn = get_db_connection()
    problem_ids_str = ""
    
    if problem_mode == 'random':
        # ?쒕뜡 異쒖젣: ?뱀젙 ?쒖씠?꾩뿉??N媛?戮묎린
        diff = data.get('random_difficulty')
        count = data.get('random_count', 5)
        # ?쒖씠???꾪꽣
        if diff == 'all':
            pool = conn.execute('SELECT id FROM problems').fetchall()
        else:
            pool = conn.execute('SELECT id FROM problems WHERE difficulty = ?', (diff,)).fetchall()
            
        pool_ids = [p['id'] for p in pool]
        if len(pool_ids) < int(count):
            count = len(pool_ids)  # ???媛?닔蹂대떎 留롮씠 戮묒쑝???쒕룄?섎㈃ ?꾩껜留?戮묒쓬
            
        selected_ids = random.sample(pool_ids, int(count))
        problem_ids_str = ",".join(map(str, selected_ids))
    else:
        # ?섎룞 異쒖젣: 嫄대꽕諛쏆? ID 諛곗뿴
        manual_ids = data.get('manual_ids', [])
        problem_ids_str = ",".join(map(str, manual_ids))
        
    if not problem_ids_str:
        conn.close()
        return jsonify({"detail": "?좊떦??臾몄젣媛 ?놁뒿?덈떎. 議곌굔??留욌뒗 臾몄젣媛 議댁옱?섎뒗吏 ?뺤씤?섏꽭??"}), 400
        
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO assignments (title, description, target_type, target_value, start_time, end_time, problem_ids)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (title, description, target_type, target_value, start_time, end_time, problem_ids_str))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "怨쇱젣媛 ?깃났?곸쑝濡?諛쒗뻾?섏뿀?듬땲??"}), 201

@app.route("/api/admin/assignments/<int:assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM assignments WHERE id = ?', (assignment_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "怨쇱젣媛 ??젣?섏뿀?듬땲??"})

@app.route("/api/admin/assignments/<int:assignment_id>/progress", methods=["GET"])
def get_assignment_admin_progress(assignment_id):
    """愿由ъ옄?? ?대떦 怨쇱젣???좊떦??紐⑤뱺 ?숈깮??吏꾪뻾瑜좉낵 臾몄젣蹂??깃났 ?щ?瑜?諛섑솚?⑸땲??"""
    conn = get_db_connection()
    assignment = conn.execute('SELECT * FROM assignments WHERE id = ?', (assignment_id,)).fetchone()
    if not assignment:
        conn.close()
        return jsonify({"detail": "Assignment not found"}), 404
        
    p_ids = [pid.strip() for pid in assignment['problem_ids'].split(',') if pid.strip()]
    if not p_ids:
        conn.close()
        return jsonify({"users": [], "problems": []})

    # 臾몄젣 ?뺣낫 媛?몄삤湲?
    phs = ','.join(['?']*len(p_ids))
    problems = conn.execute(f'SELECT id, display_id, title FROM problems WHERE id IN ({phs}) ORDER BY display_id ASC', p_ids).fetchall()
    
    # ????좎? 媛?몄삤湲?
    target_type = assignment['target_type']
    target_value = assignment['target_value']
    
    if target_type == 'all':
        users = conn.execute("SELECT id, username, nickname FROM users WHERE role != 'admin' ORDER BY id ASC").fetchall()
    elif target_type == 'group':
        users = conn.execute("SELECT id, username, nickname FROM users WHERE role = ? ORDER BY id ASC", (target_value,)).fetchall()
    elif target_type == 'user':
        users = conn.execute("SELECT id, username, nickname FROM users WHERE username = ?", (target_value,)).fetchall()
    else:
        users = []

    user_progress = []
    created_at = assignment['created_at']
    end_time = assignment['end_time']  # 留덇컧??(None?????덉쓬)
    
    for u in users:
        # ???좎?媛 怨쇱젣 湲곌컙 ?댁뿉 ??臾몄젣??(AC)
        if end_time:
            ac_records = conn.execute(
                f"SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs}) AND submitted_at >= ? AND submitted_at <= ?",
                [u['id']] + p_ids + [created_at, end_time]
            ).fetchall()
        else:
            ac_records = conn.execute(
                f"SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs}) AND submitted_at >= ?",
                [u['id']] + p_ids + [created_at]
            ).fetchall()
        
        ac_set = {row['problem_id'] for row in ac_records}
        
        # 臾몄젣蹂?寃곌낵
        results = []
        for p in problems:
            results.append({
                "problem_id": p['id'],
                "is_solved": p['id'] in ac_set
            })
            
        user_progress.append({
            "user_id": u['id'],
            "username": u['username'],
            "nickname": u['nickname'],
            "solved_count": len(ac_set),
            "total_count": len(problems),
            "results": results
        })

    conn.close()
    return jsonify({
        "assignment_title": assignment['title'],
        "problems": [dict(p) for p in problems],
        "users": user_progress
    })


# --- 怨쇱젣 API (?숈깮?? ---
@app.route("/api/assignments/my/<int:user_id>", methods=["GET"])
def get_my_assignments(user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT username, role FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
         conn.close()
         return jsonify({"detail": "User not found"}), 404
         
    role = user['role']
    username = user['username']
    
    # 1. ??곸씠 all ?닿굅?? group????role ?닿굅?? user媛 ??username ??怨쇱젣留?媛?몄샂
    query = '''
        SELECT * FROM assignments 
        WHERE target_type = 'all' 
           OR (target_type = 'group' AND target_value = ?)
           OR (target_type = 'user' AND target_value = ?)
        ORDER BY id DESC
    '''
    my_assignments = conn.execute(query, (role, username)).fetchall()
    
    result = []
    # 2. 媛?怨쇱젣蹂꾨줈 ?꾩옱 ?ъ꽦??紐?臾몄젣 ?듦낵?덈뒗吏) 怨꾩궛
    for a in my_assignments:
        a_dict = dict(a)
        if not a_dict['problem_ids']:
            continue
        p_ids = a_dict['problem_ids'].split(',')
        total_probs = len(p_ids)
        
        # 臾몄젣 以??닿? ?듦낵(AC)??寃껋쓽 媛?닔 援ы븯湲?(怨쇱젣 湲곌컙 ?댁뿉 ??寃껊쭔 ?몄젙)
        phs = ','.join(['?']*total_probs)
        # end_time???덉쑝硫?留덇컧?쇨퉴吏留? ?놁쑝硫?異쒖젣 ?댄썑 ?꾩껜
        if a_dict.get('end_time'):
            ac_count_query = f'''
                SELECT COUNT(DISTINCT problem_id) as ac_cnt
                FROM submissions
                WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs})
                  AND submitted_at >= ? AND submitted_at <= ?
            '''
            params = [user_id] + p_ids + [a_dict['created_at'], a_dict['end_time']]
        else:
            ac_count_query = f'''
                SELECT COUNT(DISTINCT problem_id) as ac_cnt
                FROM submissions
                WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs})
                  AND submitted_at >= ?
            '''
            params = [user_id] + p_ids + [a_dict['created_at']]
        ac_row = conn.execute(ac_count_query, params).fetchone()
        
        a_dict['solved_count'] = ac_row['ac_cnt']
        a_dict['total_count'] = total_probs
        result.append(a_dict)
        
    conn.close()
    return jsonify(result)

@app.route("/api/assignments/<int:assignment_id>/progress/<int:user_id>", methods=["GET"])
def get_assignment_progress(assignment_id, user_id):
    """怨쇱젣 ?곸꽭 酉? ?랁븳 臾몄젣?ㅼ쓽 ?쒕ぉ/?쒖씠??諛?蹂몄씤 ?⑥뒪 ?щ?瑜?諛섑솚"""
    conn = get_db_connection()
    assignment = conn.execute('SELECT * FROM assignments WHERE id = ?', (assignment_id,)).fetchone()
    if not assignment:
        conn.close()
        return jsonify({"detail": "Assignment not found"}), 404
        
    p_ids = [pid.strip() for pid in assignment['problem_ids'].split(',') if pid.strip()]
    if not p_ids:
        conn.close()
        return jsonify({"assignment": dict(assignment), "problems": []})
        
    phs = ','.join(['?']*len(p_ids))
    # 臾몄젣 湲곕낯 ?뺣낫 議고쉶
    problems_query = f'''
        SELECT id, display_id, title, difficulty 
        FROM problems 
        WHERE id IN ({phs})
        ORDER BY display_id ASC
    '''
    problems = conn.execute(problems_query, p_ids).fetchall()
    
    # ???좎?媛 ?대떦 臾몄젣?ㅼ쓣 AC 諛쏆븯?붿? ?뺤씤 (怨쇱젣 湲곌컙 ?댁뿉 ??寃껊쭔)
    end_time = assignment['end_time']
    if end_time:
        ac_query = f'''
            SELECT DISTINCT problem_id 
            FROM submissions 
            WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs})
              AND submitted_at >= ? AND submitted_at <= ?
        '''
        params = [user_id] + p_ids + [assignment['created_at'], end_time]
    else:
        ac_query = f'''
            SELECT DISTINCT problem_id 
            FROM submissions 
            WHERE user_id = ? AND status = 'AC' AND problem_id IN ({phs})
              AND submitted_at >= ?
        '''
        params = [user_id] + p_ids + [assignment['created_at']]
    ac_records = conn.execute(ac_query, params).fetchall()
    ac_set = {row['problem_id'] for row in ac_records}
    
    result_probs = []
    for p in problems:
        p_dict = dict(p)
        p_dict['is_solved'] = p_dict['id'] in ac_set
        result_probs.append(p_dict)
        
    conn.close()
    return jsonify({
        "assignment": dict(assignment),
        "problems": result_probs
    })

# --- 프론트엔드 HTML 파일 서빙 라우트 ---
@app.route("/")
@app.route("/index.html")
def serve_index():
    # 기초반(beginner) 사용자가 대시보드(index.html)에 직접 접근할 경우 학습 자료실로 안전하게 리다이렉트합니다.
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('index.html')

@app.route("/judge.html")
def serve_judge():
    # 기초반(beginner) 사용자가 문제 풀이 및 채점실(judge.html)에 직접 접근할 경우 학습 자료실로 리다이렉트합니다.
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('judge.html')

@app.route("/auth.html")
def serve_auth():
    return send_file('auth.html')

# --- 새로 추가된 통합 학습 자료실 라우트 ---
@app.route("/materials.html")
def serve_materials_dashboard():
    return send_file('materials.html')

@app.route("/materials/<lang>/", methods=["GET"])
@app.route("/materials/<lang>", methods=["GET"])
@app.route("/materials/<lang>/<path:filename>", methods=["GET"])
def serve_material_file(lang, filename="index.html"):
    """
    각 과목별 학습 교재 및 정적 자산(CSS, JS, 이미지 등)을 서빙하는 통합 라우트입니다.
    AI 교육과정(lang == 'ai')의 2 학습(02-better-prompts)은 서버 세션 및 진도 기반으로 직접 접근을 차단합니다.
    """
    if not filename:
        filename = "index.html"

    # 요청 경로가 디렉터리인 경우 index.html을 기본 파일로 지정
    target_material_path = os.path.join(BASE_DIR, 'materials', lang, filename)
    if os.path.isdir(target_material_path):
        filename = os.path.join(filename, 'index.html')

    # AI 교육과정 자산 및 학습 페이지 접근 권한 제어
    if lang == 'ai':
        # 2 학습(02-better-prompts) 관련 페이지에 대한 직접 접근 차단 가드
        if "02-better-prompts" in filename:
            # 1. 인증되지 않은(미로그인) 사용자 접근 차단 -> 로그인 페이지로 리다이렉트
            session_user_id = session.get('user_id')
            session_user_role = session.get('role')

            if not session_user_id:
                # HTML 페이지 요청인 경우 로그인 화면(auth.html)으로 리다이렉트
                if filename.endswith('.html') or not os.path.splitext(filename)[1]:
                    return redirect('/auth.html')
                return jsonify({"detail": "인증이 필요합니다. 로그인 후 이용해 주세요."}), 401

            # 2. 관리자(Admin)는 선행 학습 완료 여부와 관계없이 무조건 열람 허용 (세션 role == 'admin'만 인정)
            if session_user_role == 'admin':
                return send_from_directory(os.path.join(BASE_DIR, 'materials', 'ai'), filename)

            # 3. 일반 사용자(기초반 beginner 포함): 1 학습 완료 여부를 SQLite ai_lesson_progress 테이블에서 확인
            try:
                lesson_01_done = is_ai_lesson_completed(session_user_id, 'lesson_01')
            except sqlite3.OperationalError as database_error:
                # 테이블이 존재하지 않거나 알 수 없는 데이터베이스 오류 발생 시 스키마를 자동 생성하지 않고 500 에러 반환
                return jsonify({
                    "detail": f"데이터베이스 오류: ai_lesson_progress 테이블을 조회할 수 없습니다 ({database_error})."
                }), 500

            if not lesson_01_done:
                # 1 학습 미완료 시 과정 홈(index.html)으로 일관되게 리다이렉트하며 잠김 안내 쿼리 전달
                if filename.endswith('.html') or not os.path.splitext(filename)[1]:
                    return redirect('/materials/ai/index.html?locked=02')
                return jsonify({"detail": "1 학습을 먼저 완료해야 2 학습에 접근할 수 있습니다."}), 403

    return send_from_directory(os.path.join(BASE_DIR, 'materials', lang), filename)


@app.route("/admin_users.html")
def serve_admin_users():
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('admin_users.html')

@app.route("/admin_problems.html")
def serve_admin_problems():
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('admin_problems.html')

@app.route("/admin_problems_list.html")
def serve_admin_problems_list():
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('admin_problems_list.html')

@app.route("/admin_assignments.html")
def serve_admin_assignments():
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('admin_assignments.html')

@app.route("/user_assignments.html")
def serve_user_assignments():
    # 기초반(beginner) 사용자가 내 과제함(user_assignments.html)에 직접 접근할 경우 학습 자료실로 리다이렉트합니다.
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('user_assignments.html')

@app.route("/admin_points.html")
def serve_admin_points():
    if is_beginner_user():
        return redirect('/materials.html')
    return send_file('admin_points.html')

# --- [자동 마이그레이션] 서버 시작 시 bonus_points 컬럼 자동 추가 ---
def auto_migrate_bonus_points():
    """users 테이블에 bonus_points 컬럼이 없으면 자동으로 추가합니다."""
    conn = get_db_connection()
    try:
        table_exists = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").fetchone()
        if not table_exists:
            return
        columns = [col[1] for col in conn.execute('PRAGMA table_info(users)').fetchall()]
        if 'bonus_points' not in columns:
            conn.execute('ALTER TABLE users ADD COLUMN bonus_points INTEGER DEFAULT 0')
            conn.commit()
            print("[마이그레이션] users 테이블에 bonus_points 컬럼을 추가했습니다.")
    except Exception as e:
        print(f"[마이그레이션 알림] bonus_points 확인 건너뜀: {e}")
    finally:
        conn.close()

def auto_migrate_problem_answers():
    """problems 테이블에 answer_python, answer_java 컬럼이 없으면 추가합니다."""
    conn = get_db_connection()
    try:
        table_exists = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='problems'").fetchone()
        if not table_exists:
            return
        columns = [col[1] for col in conn.execute('PRAGMA table_info(problems)').fetchall()]
        if 'answer_python' not in columns:
            conn.execute('ALTER TABLE problems ADD COLUMN answer_python TEXT DEFAULT ""')
            conn.commit()
            print("[마이그레이션] problems 테이블에 answer_python 컬럼을 추가했습니다.")
        if 'answer_java' not in columns:
            conn.execute('ALTER TABLE problems ADD COLUMN answer_java TEXT DEFAULT ""')
            conn.commit()
            print("[마이그레이션] problems 테이블에 answer_java 컬럼을 추가했습니다.")
    except Exception as e:
        print(f"[마이그레이션 알림] problem_answers 확인 건너뜀: {e}")
    finally:
        conn.close()

auto_migrate_bonus_points()
auto_migrate_problem_answers()

if __name__ == '__main__':
    app.run(port=8000, debug=True)
