# -*- coding: utf-8 -*-
"""
[마이그레이션 v12] 엔트리(EntryJS) 연동을 위한 신규 데이터베이스 테이블들을 생성합니다.
- entry_problems: 문장코딩 가이드 및 시험용 문제 템플릿 정보 테이블
- entry_projects: 사용자의 엔트리 프로젝트(자유코딩/연습기록) 저장 테이블
- entry_exams: 엔트리 평가용 시험일정 테이블
- entry_exam_submissions: 학생들의 시험 응시 제출 결과 및 채점 기록 테이블

실행 방법:
  python migrate_db_v12.py
"""

import os
import sqlite3

# 데이터베이스 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')

# 데이터베이스 연결
conn = sqlite3.connect(DB_FILENAME)
cursor = conn.cursor()

try:
    print("[v12 마이그레이션] 엔트리 테이블 생성 작업을 시작합니다.")

    # 1. entry_problems 테이블 생성 (문제 은행)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entry_problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,       -- 지시사항 및 동작과정 (HTML 형식)
        initial_data TEXT NOT NULL,      -- 초기 엔트리 프로젝트 데이터 (JSON)
        grading_rules TEXT NOT NULL,     -- 자동 채점 검증 규칙 (JSON)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("- entry_problems 테이블 생성 완료")

    # 2. entry_projects 테이블 생성 (자유코딩/연습모드 작품 저장)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entry_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        project_name TEXT NOT NULL,
        project_type TEXT NOT NULL,      -- 'sandbox' (자유코딩) 또는 'practice' (연습)
        problem_id INTEGER NULL,         -- 연습모드일 경우 해당하는 문제 ID
        project_data TEXT NOT NULL,      -- 엔트리 프로젝트 저장 데이터 (JSON)
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (problem_id) REFERENCES entry_problems(id)
    )
    """)
    print("- entry_projects 테이블 생성 완료")

    # 3. entry_exams 테이블 생성 (시험 목록)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entry_exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,             -- 시험 명칭 (예: 1급 Basic 6월 시험)
        time_limit INTEGER NOT NULL,     -- 제한 시간 (분 단위)
        problem_ids TEXT NOT NULL,       -- 포함된 문제 ID 리스트 (예: "1,2,3,4")
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("- entry_exams 테이블 생성 완료")

    # 4. entry_exam_submissions 테이블 생성 (시험 최종 제출 결과)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entry_exam_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        score INTEGER NOT NULL,          -- 획득 점수
        is_passed BOOLEAN NOT NULL,      -- 합격 여부
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answers_data TEXT NOT NULL,      -- 제출된 각 문제별 엔트리 코드 묶음 (JSON)
        FOREIGN KEY (exam_id) REFERENCES entry_exams(id)
    )
    """)
    print("- entry_exam_submissions 테이블 생성 완료")

    # 5. 기존 setup_db.py 등에도 이 테이블들이 자동 구축될 수 있도록 안내 문구 출력
    print("[v12 마이그레이션] 모든 엔트리 테이블 구조가 성공적으로 반영되었습니다.")

except sqlite3.Error as error:
    print(f"[v12 마이그레이션 에러] 마이그레이션 중 오류가 발생했습니다: {error}")
    conn.rollback()
    raise error

# 변경사항 커밋 및 연결 해제
conn.commit()
conn.close()
print("[v12 마이그레이션] 성공적으로 완료되었습니다!")
