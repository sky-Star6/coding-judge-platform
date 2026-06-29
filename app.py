from flask import Flask, request, jsonify, send_file, send_from_directory, render_template
from flask_cors import CORS
import sqlite3
import os
import json
import simple_judge
# (?뷀듃由?愿??肄붾뱶 ??젣??

app = Flask(__name__)
CORS(app)  # CORS ?ㅼ젙: ?꾨줎?몄뿏????釉뚮씪?곗?)?먯꽌 API ?쒕쾭濡??붿껌??蹂대궪 ???덈룄濡??덉슜?⑸땲??

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
    """?뚯썝媛???붿껌??泥섎━?섏뿬 DB????ν빀?덈떎. (湲곕낯媛? ?뱀씤 ?湲?"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    nickname = data.get('nickname')
    
    # [10?④퀎 異붽? ?뺣낫]
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
        return jsonify({"message": "?뚯썝媛???깃났. 愿由ъ옄???뱀씤???湲고빀?덈떎.", "user_id": user_id, "nickname": nickname}), 201
    except sqlite3.IntegrityError:
        return jsonify({"detail": "?대? 議댁옱?섎뒗 ?꾩씠?붿엯?덈떎."}), 400
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
         return jsonify({"detail": "?앸뀈?붿씪怨??꾪솕踰덊샇瑜??낅젰?댁＜?몄슂."}), 400
         
    conn = get_db_connection()
    user = conn.execute(
        'SELECT username, nickname FROM users WHERE birth_date = ? AND phone_number = ?',
        (birth_date, phone_number)
    ).fetchone()
    conn.close()
    
    if user:
        return jsonify({"message": "?꾩씠??李얘린 ?깃났", "username": user['username'], "nickname": user['nickname']})
    else:
        return jsonify({"detail": "?쇱튂?섎뒗 怨꾩젙??李얠쓣 ???놁뒿?덈떎."}), 404

# --- 鍮꾨?踰덊샇 李얘린 API (10?④퀎) ---
@app.route("/api/find-password", methods=["POST"])
def find_password():
    """?꾩씠?? ?앸뀈?붿씪, ?꾪솕踰덊샇瑜??議고븯???껋뼱踰꾨┛ 鍮꾨?踰덊샇瑜?諛섑솚?⑸땲??"""
    data = request.json
    username = data.get('username')
    birth_date = data.get('birth_date')
    phone_number = data.get('phone_number')
    
    if not username or not birth_date or not phone_number:
         return jsonify({"detail": "紐⑤뱺 ?뺣낫瑜??뺥솗???낅젰?댁＜?몄슂."}), 400
         
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
    """?꾩씠??鍮꾨?踰덊샇瑜?DB? ?議고븯??濡쒓렇???뱀씤???대┰?덈떎."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute('SELECT id, nickname, role, is_active FROM users WHERE username = ? AND password = ?',
                        (username, password)).fetchone()
    conn.close()
    
    if user:
        # [9?④퀎] 0??寃쎌슦 ?묒냽 李⑤떒
        if not user['is_active']:
            return jsonify({"detail": "愿由ъ옄??媛???뱀씤???湲?以묒씠嫄곕굹 ?뺤???怨꾩젙?낅땲??"}), 403
            
        return jsonify({
            "message": "濡쒓렇???깃났", 
            "user_id": user['id'], 
            "nickname": user['nickname'],
            "role": user['role']
        })
    else:
        return jsonify({"detail": "?꾩씠???먮뒗 鍮꾨?踰덊샇媛 ?섎せ?섏뿀?듬땲??"}), 401

# --- 愿由ъ옄(Admin) API ---

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    """紐⑤뱺 媛?낆옄 ?뺣낫(愿由ъ옄 ?⑤꼸??瑜?諛섑솚?⑸땲??"""
    conn = get_db_connection()
    # [10?④퀎 異붽? ?뺣낫 ?대엺 吏?? ?앸뀈?붿씪, ?뚯냽 ?숆탳, ?숇뀈, ?꾪솕踰덊샇 ?ы븿 
    users = conn.execute(
        'SELECT id, username, nickname, role, is_active, birth_date, school_name, grade, phone_number FROM users ORDER BY id DESC'
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
        # 鍮꾨?踰덊샇媛 ?낅젰??寃쎌슦 鍮꾨?踰덊샇???④퍡 ??뼱?곌린
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
    """?뱀젙 ?뚯썝???깃툒(role)??媛뺤젣濡?蹂寃쏀빀?덈떎."""
    new_role = request.json.get('role')
    if new_role not in ['admin', 'level_1', 'level_1_adv', 'level_2', 'level_2_adv', 'level_3', 'level_3_adv']:
        return jsonify({"detail": "?섎せ???깃툒?낅땲??"}), 400
        
    conn = get_db_connection()
    conn.execute('UPDATE users SET role = ? WHERE id = ?', (new_role, user_id))
    conn.commit()
    conn.commit()
    conn.close()
    return jsonify({"message": f"{user_id}???깃툒??{new_role}濡?蹂寃쎈릺?덉뒿?덈떎."})

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
            
            conn.execute('''
                UPDATE problems 
                SET title = ?, description = ?, difficulty = ?, time_limit = ?, memory_limit = ?,
                    initial_code_python = ?, initial_code_java = ?, display_id = ?, problem_type = ?,
                    supported_languages = ?, prevent_copy = ?, answer_python = ?, answer_java = ?
                WHERE id = ?
            ''', (
                data.get("title"), data.get("description"), data.get("difficulty"),
                data.get("time_limit"), data.get("memory_limit"), 
                data.get("initial_code_python", ""), data.get("initial_code_java", ""), 
                data.get("display_id", current_display_id), data.get("problem_type", "coding"),
                data.get("supported_languages", "python3,java"),
                1 if data.get("prevent_copy") else 0,
                data.get("answer_python", ""), data.get("answer_java", ""),
                problem_id
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

# --- [愿由ъ옄 ?ъ씤??愿由? API ?붾뱶?ъ씤??---

@app.route("/api/admin/points", methods=["GET"])
def get_all_user_points():
    """
    ?뱀씤??is_active=1) 紐⑤뱺 ?ъ슜?먯쓽 ?ъ씤???꾪솴??諛섑솚?⑸땲??
    臾몄젣 ????먯닔(?붽컙 ?먯닔 ?⑹궛)? 愿由ъ옄 遺??蹂대꼫???ъ씤?? 醫낇빀 ?ъ씤?몃? ?ы븿?⑸땲??
    """
    conn = get_db_connection()
    
    # ?뱀씤???ъ슜??紐⑸줉 (愿由ъ옄 ?쒖쇅)
    users = conn.execute(
        'SELECT id, nickname, username, role, bonus_points FROM users WHERE is_active = 1 AND role != "admin" ORDER BY nickname ASC'
    ).fetchall()
    
    # 媛??ъ슜?먮퀎 臾몄젣 ????먯닔 怨꾩궛 (理쒓렐 3媛쒖썡)
    result = []
    for u in users:
        # ?쇰퀎 怨좎쑀 臾몄젣 湲곗??쇰줈 ????먯닔 吏묎퀎
        rows = conn.execute('''
            SELECT p.difficulty, s.problem_id, strftime('%Y-%m-%d', s.submitted_at) as day
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? AND s.status = 'AC'
              AND s.submitted_at >= date('now', '-3 months')
            GROUP BY day, s.problem_id
        ''', (u['id'],)).fetchall()
        
        solve_score = 0
        for row in rows:
            d = row['difficulty']
            if d <= 2:
                solve_score += 1
            elif d <= 4:
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
    ?뱀젙 ?ъ슜?먯쓽 醫낇빀 ?ъ씤?몃? 諛섑솚?⑸땲?? (????먯닔 + 蹂대꼫???ъ씤??
    ?숈깮 蹂몄씤?????붾㈃?먯꽌 ?먭린 醫낇빀 ?ъ씤?몃? ?뺤씤?????ъ슜?⑸땲??
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id媛 ?꾩슂?⑸땲??"}), 400
    
    conn = get_db_connection()
    
    # 蹂대꼫???ъ씤??議고쉶
    user = conn.execute('SELECT bonus_points FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎."}), 404
    
    bonus = user['bonus_points'] or 0
    
    # ????먯닔 怨꾩궛 (理쒓렐 3媛쒖썡, ?쇰퀎 怨좎쑀 臾몄젣 湲곗?)
    rows = conn.execute('''
        SELECT p.difficulty, s.problem_id, strftime('%Y-%m-%d', s.submitted_at) as day
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ? AND s.status = 'AC'
          AND s.submitted_at >= date('now', '-3 months')
        GROUP BY day, s.problem_id
    ''', (user_id,)).fetchall()
    
    solve_score = 0
    for row in rows:
        d = row['difficulty']
        if d <= 2:
            solve_score += 1
        elif d <= 4:
            solve_score += 2
        else:
            solve_score += 3
    
    # 오늘 푼 고유 문제 수 계산
    today_row = conn.execute('''
        SELECT COUNT(DISTINCT problem_id) as cnt
        FROM submissions
        WHERE user_id = ? AND status = 'AC'
          AND date(submitted_at, 'localtime') = date('now', 'localtime')
    ''', (user_id,)).fetchone()
    today_solved_count = today_row['cnt'] if today_row else 0
    
    conn.close()
    
    return jsonify({
        "solve_score": solve_score,
        "bonus_points": bonus,
        "total_points": solve_score + bonus,
        "today_solved_count": today_solved_count
    })

# --- 蹂??쒕퉬??API ?붾뱶?ъ씤??---

@app.route("/api/problems", methods=["GET"])
def get_problems():
    """
    ?깅줉??臾몄젣 紐⑸줉??議고쉶?⑸땲??
    留뚯빟 user_id媛 荑쇰━ ?뚮씪誘명꽣濡??섏뼱?ㅻ㈃, ?대떦 ?좎?媛 ?뺣떟(AC)??留욎텣 ?대젰???ы븿?쒗궢?덈떎.
    """
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    problems = conn.execute('SELECT id, display_id, title, difficulty, problem_type, supported_languages, prevent_copy FROM problems ORDER BY difficulty ASC, display_id ASC').fetchall()
    
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
    if data.get('is_late'):
        conn2 = get_db_connection()
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

# --- ?꾨줎?몄뿏??HTML ?뚯씪 ?쒓났 ?쇱슦??---
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

# --- ?덈줈 異붽????숈뒿 ?먮즺???쇱슦??(26?④퀎) ---
@app.route("/materials.html")
def serve_materials_dashboard():
    return send_file('materials.html')

@app.route("/materials/<lang>/<path:filename>")
def serve_material_file(lang, filename):
    return send_from_directory(os.path.join(BASE_DIR, 'materials', lang), filename)


@app.route("/admin_users.html")
def serve_admin_users():
    return send_file('admin_users.html')

@app.route("/admin_problems.html")
def serve_admin_problems():
    return send_file('admin_problems.html')

@app.route("/admin_problems_list.html")
def serve_admin_problems_list():
    return send_file('admin_problems_list.html')

@app.route("/admin_assignments.html")
def serve_admin_assignments():
    return send_file('admin_assignments.html')

@app.route("/user_assignments.html")
def serve_user_assignments():
    return send_file('user_assignments.html')

@app.route("/admin_points.html")
def serve_admin_points():
    return send_file('admin_points.html')

# --- [?먮룞 留덉씠洹몃젅?댁뀡] ?쒕쾭 ?쒖옉 ??bonus_points 而щ읆 ?먮룞 異붽? ---
def auto_migrate_bonus_points():
    """users ?뚯씠釉붿뿉 bonus_points 而щ읆???놁쑝硫??먮룞?쇰줈 異붽??⑸땲??"""
    conn = get_db_connection()
    columns = [col[1] for col in conn.execute('PRAGMA table_info(users)').fetchall()]
    if 'bonus_points' not in columns:
        conn.execute('ALTER TABLE users ADD COLUMN bonus_points INTEGER DEFAULT 0')
        conn.commit()
        print("[留덉씠洹몃젅?댁뀡] users ?뚯씠釉붿뿉 bonus_points 而щ읆??異붽??덉뒿?덈떎.")
    conn.close()

def auto_migrate_problem_answers():
    """problems ?뚯씠釉붿뿉 answer_python, answer_java 而щ읆???놁쑝硫?異붽??⑸땲??"""
    conn = get_db_connection()
    columns = [col[1] for col in conn.execute('PRAGMA table_info(problems)').fetchall()]
    if 'answer_python' not in columns:
        conn.execute('ALTER TABLE problems ADD COLUMN answer_python TEXT DEFAULT ""')
        conn.commit()
        print("[留덉씠洹몃젅?댁뀡] problems ?뚯씠釉붿뿉 answer_python 而щ읆??異붽??덉뒿?덈떎.")
    if 'answer_java' not in columns:
        conn.execute('ALTER TABLE problems ADD COLUMN answer_java TEXT DEFAULT ""')
        conn.commit()
        print("[留덉씠洹몃젅?댁뀡] problems ?뚯씠釉붿뿉 answer_java 而щ읆??異붽??덉뒿?덈떎.")
    conn.close()

auto_migrate_bonus_points()
auto_migrate_problem_answers()

if __name__ == '__main__':
    app.run(port=8000, debug=True)
