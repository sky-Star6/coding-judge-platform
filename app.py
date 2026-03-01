from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import simple_judge

app = FastAPI(title="Programmers Clone API", version="1.0")

# CORS 설정: 프론트엔드(웹 브라우저)에서 API 서버로 요청을 보낼 수 있도록 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 실제 서비스에서는 특정 도메인만 허용해야 합니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILENAME = 'judge_db.sqlite'

def get_db_connection():
    # 데이터베이스 쿼리결과를 딕셔너리(JSON) 형태로 쉽게 변환하기 위해 row_factory 설정
    conn = sqlite3.connect(DB_FILENAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- 모델(Pydantic) 정의: 클라이언트가 보내는 데이터의 형식을 지정합니다 ---
class SubmissionRequest(BaseModel):
    user_id: int
    problem_id: int
    language: str
    code: str

# --- API 엔드포인트 구현 ---

@app.get("/")
def read_root():
    return {"message": "온라인 코딩 채점 플랫폼 API 서버가 정상 작동 중입니다."}

@app.get("/api/problems")
def get_problems():
    """등록된 문제 목록을 조회합니다."""
    conn = get_db_connection()
    problems = conn.execute('SELECT id, title, difficulty FROM problems').fetchall()
    conn.close()
    return {"problems": [dict(p) for p in problems]}

@app.get("/api/problems/{problem_id}")
def get_problem_detail(problem_id: int):
    """특정 문제의 상세 설명과 제한 조건 등을 조회합니다."""
    conn = get_db_connection()
    problem = conn.execute('SELECT * FROM problems WHERE id = ?', (problem_id,)).fetchone()
    
    if not problem:
        conn.close()
        raise HTTPException(status_code=404, detail="해당 문제를 찾을 수 없습니다.")
        
    # 공개된 테스트 케이스(예제 입출력)도 함께 내려보내줍니다.
    public_cases = conn.execute(
        'SELECT input_data, expected_output FROM test_cases WHERE problem_id = ? AND is_public = 1',
        (problem_id,)
    ).fetchall()
    conn.close()
    
    result = dict(problem)
    result["examples"] = [dict(case) for case in public_cases]
    return result

@app.post("/api/submissions")
def submit_code(request: SubmissionRequest, background_tasks: BackgroundTasks):
    """
    사용자가 작성한 코드를 제출받아 실행 대기열(DB)에 넣고,
    백그라운드 작업(Background Task)으로 채점을 시작합니다.
    (API 서버가 채점을 기다리느라 멈추지 않게 하기 위함입니다)
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. 제출 내역을 DB에 Pending(대기 중) 상태로 저장
    cursor.execute('''
        INSERT INTO submissions (user_id, problem_id, language, code, status)
        VALUES (?, ?, ?, ?, 'Pending')
    ''', (request.user_id, request.problem_id, request.language, request.code))
    submission_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # 2. 백그라운드 환경에서 simple_judge의 채점 함수 실행을 지시
    background_tasks.add_task(simple_judge.judge_submission, submission_id)
    
    return {"message": "코드가 성공적으로 제출되고 채점이 시작되었습니다.", "submission_id": submission_id}

@app.get("/api/submissions/{submission_id}")
def get_submission_result(submission_id: int):
    """특정 제출의 현재 채점 상태(Pending 로딩 중, AC 통과 등)를 조회합니다."""
    conn = get_db_connection()
    submission = conn.execute(
        'SELECT status, time_used, memory_used FROM submissions WHERE id = ?',
        (submission_id,)
    ).fetchone()
    conn.close()
    
    if not submission:
        raise HTTPException(status_code=404, detail="제출 내역을 찾을 수 없습니다.")
        
    return dict(submission)

# 서버 실행 방법: uvicorn app:app --reload
