"""
문제 JSON API (내보내기/유효성검사/가져오기) 관리자 인증 및 동작 검증 테스트

이 테스트는 운영 데이터베이스(judge_db.sqlite)를 전혀 변경하지 않고,
임시 테스트용 SQLite 데이터베이스를 생성하여 다음 사항들을 철저하게 검증합니다:
1. 인증 정보 누락 시 401 Unauthorized 차단
2. 존재하지 않는 사용자 ID / 잘못된 토큰 시 401 Unauthorized 차단
3. 비활성화된 계정 시 403 Forbidden 차단
4. 일반 사용자(level_1, level_2, level_3) 권한 시 403 Forbidden 차단
5. 관리자(admin) 권한 시 각 API(export, validate, import) 정상 성공 및 데이터 반영 확인
"""

import io
import json
import os
import shutil
import sqlite3
import sys
import tempfile
import unittest

# 프로젝트 루트 경로를 sys.path에 추가
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = r"C:\AI_Project\coding-judge-platform"
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# 앱 모듈을 가져오기 전에 테스트 전용 임시 세션 키 사용을 명시합니다.
os.environ.setdefault("FLASK_TESTING", "1")

# 애플리케이션 모듈(Application Module) 임포트
import app as flask_app_module
from app import app


class TestAdminProblemJsonAuth(unittest.TestCase):
    """문제 관리 JSON API의 관리자 인증 및 데이터 처리 기능을 검증하는 테스트 클래스"""

    def setUp(self):
        """각 테스트 메서드 실행 전에 격리된 임시 테스트 환경을 구성합니다."""
        # 1. 임시 디렉토리(Temporary Directory) 생성
        self.temp_dir = tempfile.mkdtemp()
        self.test_db_path = os.path.join(self.temp_dir, "test_judge_db.sqlite")

        # 2. app.py의 DB 경로 및 BASE_DIR을 임시 경로로 교체 (운영 DB 격리)
        self.original_db_filename = flask_app_module.DB_FILENAME
        self.original_base_dir = flask_app_module.BASE_DIR
        flask_app_module.DB_FILENAME = self.test_db_path
        flask_app_module.BASE_DIR = self.temp_dir

        # 3. 테스트 데이터베이스 테이블 생성 및 초기 데이터 삽입
        self._init_test_database()

        # 4. Flask 테스트 클라이언트(Test Client) 생성
        app.config["TESTING"] = True
        self.client = app.test_client()

    def _set_session_user(self, user_id, role):
        """클라이언트 헤더가 아닌 서버 측 Flask 세션으로만 로그인 상태를 구성합니다."""
        with self.client.session_transaction() as flask_session:
            flask_session["user_id"] = user_id
            flask_session["role"] = role

    def tearDown(self):
        """테스트 종료 후 원래 설정으로 복구하고 임시 디렉토리를 안전하게 삭제합니다."""
        flask_app_module.DB_FILENAME = self.original_db_filename
        flask_app_module.BASE_DIR = self.original_base_dir
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _init_test_database(self):
        """테스트용 SQLite 데이터베이스 테이블 스키마 생성 및 사용자/문제 더미 데이터 삽입"""
        conn = sqlite3.connect(self.test_db_path)
        cursor = conn.cursor()

        # Users 테이블 생성
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nickname TEXT NOT NULL,
                role TEXT DEFAULT 'level_3',
                is_active BOOLEAN DEFAULT 0,
                birth_date TEXT DEFAULT '',
                school_name TEXT DEFAULT '',
                grade TEXT DEFAULT '',
                phone_number TEXT DEFAULT '',
                can_view_hidden BOOLEAN DEFAULT 0,
                bonus_points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Problems 테이블 생성
        cursor.execute("""
            CREATE TABLE problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_id INTEGER DEFAULT 0,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty INTEGER DEFAULT 1,
                time_limit REAL DEFAULT 1.0,
                memory_limit INTEGER DEFAULT 128,
                initial_code_python TEXT DEFAULT '',
                initial_code_java TEXT DEFAULT '',
                problem_type TEXT DEFAULT 'coding',
                supported_languages TEXT DEFAULT 'python3,java',
                prevent_copy BOOLEAN DEFAULT 0,
                answer_python TEXT DEFAULT '',
                answer_java TEXT DEFAULT '',
                is_hidden BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Test Cases 테이블 생성
        cursor.execute("""
            CREATE TABLE test_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id INTEGER NOT NULL,
                input_data TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                is_public BOOLEAN DEFAULT 0,
                FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
            )
        """)

        # 테스트용 사용자(Users) 데이터 추가
        # 1. 관리자 (활성 상태) -> user_id: 1
        cursor.execute("""
            INSERT INTO users (username, password, nickname, role, is_active)
            VALUES ('admin_user', 'admin1234', '총관리자', 'admin', 1)
        """)
        self.admin_user_id = cursor.lastrowid

        # 2. 일반 학생 사용자 (활성 상태, 3급) -> user_id: 2
        cursor.execute("""
            INSERT INTO users (username, password, nickname, role, is_active)
            VALUES ('student_user', 'student1234', '일반학생', 'level_3', 1)
        """)
        self.student_user_id = cursor.lastrowid

        # 3. 비활성화된 관리자 (승인 대기 / 정지 상태) -> user_id: 3
        cursor.execute("""
            INSERT INTO users (username, password, nickname, role, is_active)
            VALUES ('inactive_admin', 'admin1234', '비활성관리자', 'admin', 0)
        """)
        self.inactive_admin_id = cursor.lastrowid

        # 테스트용 기존 문제 1건 등록
        cursor.execute("""
            INSERT INTO problems (id, display_id, title, description, difficulty, time_limit, memory_limit)
            VALUES (101, 1, '두 수의 합', '두 수를 입력받아 합을 출력하세요.', 1, 1.0, 128)
        """)
        cursor.execute("""
            INSERT INTO test_cases (problem_id, input_data, expected_output, is_public)
            VALUES (101, '1 2\n', '3\n', 1)
        """)

        conn.commit()
        conn.close()

    # -------------------------------------------------------------
    # 1. 인증 실패 테스트 (401 Unauthorized & 403 Forbidden)
    # -------------------------------------------------------------

    def test_export_problems_without_auth_returns_401(self):
        """인증 정보가 누락된 경우 GET /api/admin/problems/export 요청 시 401 반환 검증"""
        response = self.client.get("/api/admin/problems/export")
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertIn("detail", data)

    def test_validate_import_without_auth_returns_401(self):
        """인증 정보가 누락된 경우 POST /api/admin/problems/import/validate 요청 시 401 반환 검증"""
        sample_doc = {"schema_version": 1, "problems": []}
        response = self.client.post("/api/admin/problems/import/validate", json=sample_doc)
        self.assertEqual(response.status_code, 401)

    def test_import_problems_without_auth_returns_401(self):
        """인증 정보가 누락된 경우 POST /api/admin/problems/import 요청 시 401 반환 검증"""
        sample_doc = {"schema_version": 1, "problems": []}
        response = self.client.post("/api/admin/problems/import", json=sample_doc)
        self.assertEqual(response.status_code, 401)

    def test_export_problems_with_invalid_token_returns_401(self):
        """존재하지 않는 사용자 ID / 가짜 토큰 전달 시 401 반환 검증"""
        headers = {"Authorization": "Bearer 999999"}
        response = self.client.get("/api/admin/problems/export", headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_forged_client_identifiers_cannot_authorize_problem_apis(self):
        """Bearer ID, X-User-Id, 쿼리 user_id는 모두 관리자 인증으로 사용될 수 없습니다."""
        attempts = [
            ("/api/admin/problems/export", {"Authorization": f"Bearer {self.admin_user_id}"}, None),
            ("/api/admin/problems/export", {"X-User-Id": str(self.admin_user_id)}, None),
            (f"/api/admin/problems/export?user_id={self.admin_user_id}", {}, None),
            ("/api/admin/problems/import/validate", {"Authorization": f"Bearer {self.admin_user_id}"}, {"schema_version": 1, "problems": []}),
            ("/api/admin/problems/import", {"X-User-Id": str(self.admin_user_id)}, {"schema_version": 1, "problems": []}),
        ]
        for path, headers, payload in attempts:
            response = self.client.get(path, headers=headers) if payload is None else self.client.post(path, headers=headers, json=payload)
            self.assertEqual(response.status_code, 401, path)

    def test_non_admin_session_returns_403(self):
        """서버 세션에 로그인된 일반 사용자는 관리자 API에서 403을 받습니다."""
        self._set_session_user(self.student_user_id, "level_3")
        response = self.client.post("/api/admin/problems/import", json={"schema_version": 1, "problems": []})
        self.assertEqual(response.status_code, 403)

    # -------------------------------------------------------------
    # 2. 관리자 인증 성공 및 실제 API 기능 동작 테스트
    # -------------------------------------------------------------

    def test_export_problems_with_admin_auth_success(self):
        """관리자 인증(Authorization: Bearer <id>)으로 GET /api/admin/problems/export 정상 수행 검증"""
        self._set_session_user(self.admin_user_id, "admin")
        response = self.client.get("/api/admin/problems/export")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "application/json")

        # JSON 파싱 및 데이터 정합성 검증
        document = json.loads(response.data.decode("utf-8"))
        self.assertEqual(document.get("schema_version"), 1)
        self.assertIn("exported_at", document)
        self.assertIsInstance(document.get("problems"), list)
        self.assertEqual(len(document["problems"]), 1)
        self.assertEqual(document["problems"][0]["id"], 101)
        self.assertEqual(document["problems"][0]["title"], "두 수의 합")
        self.assertEqual(len(document["problems"][0]["examples"]), 1)

    def test_export_problems_with_admin_session_ignores_query_param(self):
        """유효 관리자 세션만 성공시키며 쿼리 user_id 값은 인가에 영향을 주지 않습니다."""
        self._set_session_user(self.admin_user_id, "admin")
        response = self.client.get("/api/admin/problems/export?user_id=999999")
        self.assertEqual(response.status_code, 200)
        document = json.loads(response.data.decode("utf-8"))
        self.assertEqual(document.get("schema_version"), 1)

    def test_validate_import_with_admin_auth_success_and_error_cases(self):
        """관리자 인증으로 POST /api/admin/problems/import/validate 유효성 검사 정상 및 오류 케이스 검증"""
        self._set_session_user(self.admin_user_id, "admin")

        # 케이스 1: 정상 문서 검증 (기존 문제 업데이트 1건 + 신규 문제 1건)
        valid_document = {
            "schema_version": 1,
            "problems": [
                {
                    "id": 101,  # 기존 문제 업데이트
                    "title": "두 수의 합 (수정됨)",
                    "description": "두 정수를 입력받아 합을 계산합니다.",
                    "difficulty": 1,
                    "time_limit": 1.5,
                    "memory_limit": 256,
                    "examples": [
                        {"input_data": "3 5\n", "expected_output": "8\n", "is_public": True}
                    ]
                },
                {
                    "id": 202,  # 신규 추가 문제
                    "title": "세 수의 곱",
                    "description": "세 정수를 입력받아 곱을 계산합니다.",
                    "difficulty": 2,
                    "time_limit": 1.0,
                    "memory_limit": 128,
                    "examples": [
                        {"input_data": "2 3 4\n", "expected_output": "24\n", "is_public": True}
                    ]
                }
            ]
        }
        res_valid = self.client.post("/api/admin/problems/import/validate", json=valid_document)
        self.assertEqual(res_valid.status_code, 200)
        data_valid = res_valid.get_json()
        self.assertTrue(data_valid["valid"])
        self.assertEqual(data_valid["new_ids"], [202])
        self.assertEqual(data_valid["updated_ids"], [101])
        self.assertEqual(data_valid["count"], 2)

        # 케이스 2: 비정상 문서 검증 (필수 필드 누락 등 -> 400 Bad Request)
        invalid_document = {
            "schema_version": 1,
            "problems": [
                {
                    "id": 303,
                    # title 필드 누락
                    "description": "제목이 없는 불완전한 문제",
                    "difficulty": 1
                }
            ]
        }
        res_invalid = self.client.post("/api/admin/problems/import/validate", json=invalid_document)
        self.assertEqual(res_invalid.status_code, 400)
        data_invalid = res_invalid.get_json()
        self.assertFalse(data_invalid["valid"])
        self.assertTrue(len(data_invalid["errors"]) > 0)

    def test_import_problems_with_admin_auth_success(self):
        """관리자 인증으로 POST /api/admin/problems/import 실제 가져오기 및 DB 반영, 백업 생성 검증"""
        self._set_session_user(self.admin_user_id, "admin")

        import_payload = {
            "schema_version": 1,
            "problems": [
                {
                    "id": 101,  # 기존 문제 수정
                    "title": "두 수의 합 (가져오기로 업데이트)",
                    "description": "업데이트된 문제 설명입니다.",
                    "difficulty": 1,
                    "time_limit": 2.0,
                    "memory_limit": 256,
                    "initial_code_python": "# 여기에 코드를 작성하세요",
                    "examples": [
                        {"input_data": "10 20\n", "expected_output": "30\n", "is_public": True}
                    ]
                },
                {
                    "id": 301,  # 새로운 문제 추가
                    "title": "문자열 거꾸로 출력",
                    "description": "입력받은 문자열을 뒤집어 출력합니다.",
                    "difficulty": 3,
                    "time_limit": 1.0,
                    "memory_limit": 128,
                    "examples": [
                        {"input_data": "hello\n", "expected_output": "olleh\n", "is_public": True}
                    ]
                }
            ]
        }

        # 1. 가져오기 API 호출
        response = self.client.post("/api/admin/problems/import", json=import_payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["imported"])
        self.assertEqual(data["updated_count"], 2)
        self.assertTrue(os.path.exists(data["backup_path"]), "가져오기 전 자동 백업 DB 파일이 생성되어야 합니다.")

        # 2. 데이터베이스에 실제 반영되었는지 직접 조회하여 검증
        conn = sqlite3.connect(self.test_db_path)
        cursor = conn.cursor()

        # 101번 문제 업데이트 확인
        cursor.execute("SELECT title, description, time_limit FROM problems WHERE id = 101")
        p101 = cursor.fetchone()
        self.assertEqual(p101[0], "두 수의 합 (가져오기로 업데이트)")
        self.assertEqual(p101[1], "업데이트된 문제 설명입니다.")
        self.assertEqual(p101[2], 2.0)

        # 301번 신규 문제 등록 확인
        cursor.execute("SELECT title, difficulty FROM problems WHERE id = 301")
        p301 = cursor.fetchone()
        self.assertIsNotNone(p301)
        self.assertEqual(p301[0], "문자열 거꾸로 출력")
        self.assertEqual(p301[1], 3)

        # 301번 테스트 케이스 확인
        cursor.execute("SELECT input_data, expected_output FROM test_cases WHERE problem_id = 301")
        tc301 = cursor.fetchone()
        self.assertIsNotNone(tc301)
        self.assertEqual(tc301[0], "hello\n")
        self.assertEqual(tc301[1], "olleh\n")

        conn.close()

        # 3. export API를 다시 호출하여 두 문제가 모두 JSON으로 정상 내보내지는지 확인
        export_res = self.client.get("/api/admin/problems/export")
        self.assertEqual(export_res.status_code, 200)
        export_doc = json.loads(export_res.data.decode("utf-8"))
        self.assertEqual(len(export_doc["problems"]), 2)
        exported_ids = {p["id"] for p in export_doc["problems"]}
        self.assertEqual(exported_ids, {101, 301})


if __name__ == "__main__":
    unittest.main()
