# 문제 JSON 백업·가져오기 구현 계획

> **For Hermes:** 개발 Bot이 이 계획을 작업 단위별로 구현한다.

**Goal:** 관리자 문제·정답 데이터를 JSON으로 내보내고 검증 후 가져오며, 가져오기 전 DB 자동 백업을 제공한다.

**Architecture:** 운영 DB는 그대로 유지하고 JSON을 사람이 검토·수정하는 표준 원본으로 둔다. Export는 문제/정답/필수 메타데이터를 안정적인 스키마로 출력하고, Import는 dry-run 검증·미리보기 후 자동 백업을 만든 뒤 트랜잭션으로 반영한다.

**Tech Stack:** 기존 Flask/Python API, 현재 사용 중인 SQLite/DB 계층, 관리자 HTML/JavaScript.

---

## 1. 현황 조사 및 스키마 확정
- 대상: `app.py`, DB 모델/초기화 파일, `admin_problems.html`, `admin_problems_list.html`
- 기존 문제 CRUD 필드와 식별자 정책을 확인한다.
- JSON 스키마(버전, 문제 ID/제목/설명/유형/테스트·정답 필드, 선택 필드, 내보내기 시각)를 문서화한다.
- 정답·사용자 개인정보·제출 기록의 포함 여부를 명확히 분리한다. 기본은 문제 정의만 포함한다.

## 2. Export API 및 관리자 UI
- 서버에 관리자 인증이 적용된 `GET /admin/problems/export`를 추가한다.
- UTF-8 JSON 다운로드와 스키마 버전을 제공한다.
- 관리자 문제 목록에 “JSON 내보내기” 버튼을 추가한다.
- 필드 누락, 순서 불안정, 민감정보 노출을 검증한다.

## 3. Import 검증(dry-run) API
- `POST /admin/problems/import/validate`를 추가한다.
- JSON 문법, 스키마 버전, 필수값·타입, 중복 ID, 존재하지 않는 참조, 허용되지 않은 필드를 검사한다.
- 기존 DB와 비교해 신규/수정/삭제 예정 항목을 반환하고 실제 DB는 변경하지 않는다.
- 관리자 UI에서 파일 선택 후 검증 결과와 변경 미리보기를 표시한다.

## 4. 자동 백업 및 실제 Import
- 실제 반영 직전에 DB 파일을 타임스탬프 포함 경로로 복사하고 백업 성공 여부를 확인한다.
- `POST /admin/problems/import`는 검증 통과 데이터만 트랜잭션으로 반영한다.
- 실패 시 롤백하고, 백업 경로와 결과 요약을 관리자에게 표시한다.
- 삭제는 기본 비활성화하거나 명시적 옵션으로 제한해 기존 문제 유실을 방지한다.

## 5. 테스트 및 운영 문서
- API 테스트: export 형식, invalid JSON, 필수값 누락, 중복, dry-run 무변경, import 성공/롤백.
- HTML/JS 정적 검사와 `git diff --check`를 실행한다.
- 실제 운영 DB 복사본으로 export → 수정 → validate → backup → import → restore 시나리오를 검증한다.
- `docs/problem-data-workflow.md`에 권장 순서와 백업 복원 절차를 기록한다.

## 완료 조건
- JSON export 파일을 다운로드하고 Git에서 diff로 검토할 수 있다.
- import 전 dry-run 미리보기와 자동 DB 백업이 동작한다.
- 검증 실패 시 DB가 바뀌지 않고, 반영 실패 시 복원 가능하다.
- 기존 관리자 CRUD, 사용자 제출/채점 기능에 회귀가 없다.

## 위험 및 결정 필요 사항
- 운영 DB 종류와 실제 백업 경로를 구현 전에 확정한다.
- 문제 ID를 유지할지 제목 기반 매칭을 허용할지 결정한다(기본은 안정적인 ID 유지).
- 정답 코드가 JSON/Git에 저장될 때 저장소 접근 권한과 비밀정보 포함 여부를 검토한다.
- 초기 단계에서는 삭제 import를 막고 신규/수정만 허용하는 보수적 기본값을 권장한다.
