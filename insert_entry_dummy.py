# -*- coding: utf-8 -*-
"""
엔트리(EntryJS) 실습 및 시험 기능을 테스트하기 위해,
초기 더미 문제(problems) 및 시험(exams) 데이터를 데이터베이스에 인입하는 스크립트입니다.
"""

import json
import os
import sqlite3

# 데이터베이스 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILENAME = os.path.join(BASE_DIR, 'judge_db.sqlite')


def create_basic_entry_project(object_name, extra_shapes=None, signals=None):
    """
    엔트리 엔진이 오류 없이 해석하고 화면에 오브젝트를 띄울 수 있는 최소한의 프로젝트 JSON 구조를 생성합니다.
    """
    shapes = [{"id": "shape_1", "name": f"{object_name}1", "fileId": "default_shape"}]
    if extra_shapes:
        for i, shape_name in enumerate(extra_shapes):
            shapes.append({"id": f"shape_{i+2}", "name": shape_name, "fileId": "default_shape"})

    messages = []
    if signals:
        for i, sig_name in enumerate(signals):
            messages.append({"id": f"msg_{i+1}", "name": sig_name})

    project_dict = {
        "objects": [
            {
                "id": "obj_1",
                "name": object_name,
                "script": "[]",  # 빈 스크립트 리스트
                "objectType": "sprite",
                "sprite": {
                    "name": object_name,
                    "shapes": shapes
                },
                "x": 0,
                "y": 0,
                "rotate": 0,
                "scaleX": 1,
                "scaleY": 1
            }
        ],
        "variables": [],
        "messages": messages,
        "functions": []
    }
    return json.dumps(project_dict, ensure_ascii=False)


def insert_dummy_data():
    """
    엔트리 문제와 시험 더미 데이터를 데이터베이스에 삽입합니다.
    """
    print(f"[{DB_FILENAME}] 엔트리 더미 데이터 삽입 작업을 시작합니다...")
    conn = sqlite3.connect(DB_FILENAME)
    cursor = conn.cursor()

    try:
        # 1. 기존 데이터 초기화 (개발 테스트 목적)
        cursor.execute("DELETE FROM entry_problems")
        cursor.execute("DELETE FROM entry_projects")
        cursor.execute("DELETE FROM entry_exams")
        cursor.execute("DELETE FROM entry_exam_submissions")
        print("- 기존 엔트리 테이블 데이터 초기화 완료")

        # 2. 연습 문제 삽입
        practice_project_data = create_basic_entry_project("구름", ["구름2"], ["바람"])
        practice_rules = [
            {
                "name": "구름 클릭 시 모양 바꾸기 흐름 구성",
                "type": "sequence",
                "object_name": "구름",
                "sequence": ["when_clicked_object", "change_shape"],
                "points": 50
            },
            {
                "name": "바람 신호 보내기 블록 사용",
                "type": "has_block",
                "object_name": "구름",
                "target_block": "send_signal",
                "points": 50
            }
        ]

        cursor.execute('''
            INSERT INTO entry_problems (id, title, description, initial_data, grading_rules)
            VALUES (1, ?, ?, ?, ?)
        ''', (
            "구름 날리기 (연습)",
            """<h3>구름 클릭 시 바람 신호 보내기</h3>
            <p>구름을 마우스로 클릭하면 모양이 바뀌고 바람 신호가 전파되도록 코딩해 보세요.</p>
            <strong>동작과정:</strong>
            <ol>
              <li>[시작하기] 클릭 후 화면 중앙의 구름을 마우스로 클릭합니다.</li>
              <li>구름의 모양이 '구름2' 모양으로 변경됩니다.</li>
              <li>'바람' 신호를 보냅니다.</li>
            </ol>
            <strong>지시사항:</strong>
            <ul>
              <li><strong>구름</strong> 오브젝트에 대해 지시사항대로 블록을 순서대로 조립하세요.</li>
            </ul>""",
            practice_project_data,
            json.dumps(practice_rules, ensure_ascii=False)
        ))
        print("- 연습용 엔트리 문제 1개 삽입 완료 (ID: 1)")

        # 3. 시험용 문제 1 삽입 (풍차 날리기)
        exam_p1_data = create_basic_entry_project("구름", ["구름2"], ["바람"])
        exam_p1_rules = [
            {
                "name": "구름 클릭 시작 블록 사용",
                "type": "has_block",
                "object_name": "구름",
                "target_block": "when_clicked_object",
                "points": 50
            },
            {
                "name": "구름2 모양 변경 및 바람 신호 송신 순서",
                "type": "sequence",
                "object_name": "구름",
                "sequence": ["when_clicked_object", "change_shape", "send_signal"],
                "points": 50
            }
        ]

        cursor.execute('''
            INSERT INTO entry_problems (id, title, description, initial_data, grading_rules)
            VALUES (2, ?, ?, ?, ?)
        ''', (
            "구름 오브젝트 제어 (시험 1번)",
            """<h3>구름을 클릭하면 바람 신호가 작동하는 문제</h3>
            <strong>지시사항:</strong>
            <ul>
              <li>구름 오브젝트를 클릭했을 때 아래 순서로 작동하게 하시오.
                <ol>
                  <li>[구름2] 모양으로 바꾸기.</li>
                  <li>[바람] 신호 보내기.</li>
                </ol>
              </li>
            </ul>
            <strong>유의사항:</strong>
            <ul>
              <li>지시사항에서 설명한 블록들만 올바른 순서로 연결하여 사용하세요.</li>
            </ul>""",
            exam_p1_data,
            json.dumps(exam_p1_rules, ensure_ascii=False)
        ))
        print("- 시험용 엔트리 문제 1번 삽입 완료 (ID: 2)")

        # 4. 시험용 문제 2 삽입 (풍차 회전 및 보이기)
        exam_p2_data = create_basic_entry_project("풍차날개", [], ["바람"])
        exam_p2_rules = [
            {
                "name": "바람 신호 수신 블록 적용",
                "type": "has_block",
                "object_name": "풍차날개",
                "target_block": "when_message_cast",
                "points": 50
            },
            {
                "name": "오브젝트 보이기 및 회전 조립 순서",
                "type": "sequence",
                "object_name": "풍차날개",
                "sequence": ["when_message_cast", "show", "rotate"],
                "points": 50
            }
        ]

        cursor.execute('''
            INSERT INTO entry_problems (id, title, description, initial_data, grading_rules)
            VALUES (3, ?, ?, ?, ?)
        ''', (
            "풍차날개 제어 (시험 2번)",
            """<h3>바람 신호를 받았을 때 작동하는 문제</h3>
            <strong>지시사항:</strong>
            <ul>
              <li>[바람] 신호를 받았을 때 아래 순서로 풍차날개가 작동하게 하시오.
                <ol>
                  <li>오브젝트를 보이게(show) 하시오.</li>
                  <li>반시계 방향(rotate)으로 회전시키시오.</li>
                </ol>
              </li>
            </ul>
            <strong>유의사항:</strong>
            <ul>
              <li>지시사항에서 설명한 블록들만 사용하세요.</li>
            </ul>""",
            exam_p2_data,
            json.dumps(exam_p2_rules, ensure_ascii=False)
        ))
        print("- 시험용 엔트리 문제 2번 삽입 완료 (ID: 3)")

        # 5. 시험 일정 1개 삽입 (위의 시험용 문제 2개 바인딩)
        cursor.execute('''
            INSERT INTO entry_exams (id, title, time_limit, problem_ids)
            VALUES (1, ?, ?, ?)
        ''', ("1급 Basic 모의평가 (엔트리 실기)", 40, "2,3"))
        print("- 모의 평가 시험 일정 1개 삽입 완료 (ID: 1, 제한시간: 40분)")

        conn.commit()
        print("\n▶ 모든 엔트리 더미 데이터 인입이 성공적으로 완료되었습니다!")

    except sqlite3.Error as error:
        conn.rollback()
        print(f"▶ 데이터 삽입 실패 (롤백 수행): {error}")
    finally:
        conn.close()


if __name__ == "__main__":
    insert_dummy_data()
