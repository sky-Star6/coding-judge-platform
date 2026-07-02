# 코딩 플랫폼 기능 추가 및 개선 구현 계획

요청하신 5가지 주요 기능을 구현하기 위한 세부 계획입니다. 데이터베이스 스키마 변경, API 백엔드, 프론트엔드 UI 수정이 모두 포함되어 있습니다.

## User Review Required

> [!IMPORTANT]
> **데이터베이스 스키마 변경 (복사 방지 설정)**
> 문제 테이블(`problems`)에 `prevent_copy` 컬럼을 추가하기 위해 데이터베이스 마이그레이션이 진행됩니다. 기존 데이터는 안전하게 유지됩니다.

> [!TIP]
> **역슬래시(\) 표시 방식**
> 한글 윈도우 환경에서 백슬래시(`\`)가 원화 기호(`₩`)로 보이는 문제를 해결하기 위해, 문제 예시가 표시되는 코드 박스 영역에 영문 전용 고정폭 폰트(`Consolas`, `Monaco` 등)를 강제로 적용하도록 CSS를 수정합니다.

## Proposed Changes

---

### 1. 과제 진행 상황 확인 기능 (Dashboard)
관리자가 부여한 과제를 학생들이 얼마나 진행했는지 확인할 수 있는 대시보드를 추가합니다.

#### [MODIFY] `app.py`
- `/api/admin/assignments/<int:assignment_id>/progress` (GET) 엔드포인트 신규 추가:
  - 해당 과제의 `target_type`과 `target_value`에 매칭되는 유저 목록을 조회합니다.
  - 각 유저별로 과제에 포함된 문제들의 정답(AC) 여부 및 진행률(예: 3/5)을 계산하여 반환합니다.

#### [MODIFY] `admin_assignments.html`
- 과제 목록 테이블에 `진행 현황 보기` 버튼을 추가합니다.
- 버튼 클릭 시 나타나는 모달 창을 생성하여, 대상 학생들의 이름과 진행도, 각 문제별 성공 여부를 표 형태로 시각화합니다.

---

### 2. 정답 제출 시 재제출 방지 (클라이언트 상태 관리)
학생이 문제를 풀고 "정답(AC)"을 받았을 때 연속으로 제출하는 것을 방지합니다.

#### [MODIFY] `judge.html`
- 채점 결과가 `AC`로 판정될 경우:
  - `submit-btn` 버튼의 속성을 `disabled = true`로 변경하고 텍스트를 "정답입니다! (재제출 방지됨)"으로 수정합니다.
- "초기화(코드 리셋)" 버튼을 누르거나, 페이지를 새로고침/재진입 할 경우에는 버튼이 다시 활성화되도록 자바스크립트 상태를 초기화합니다.

---

### 3. 역슬래시(\) 정상 표시 (폰트 적용)
문제 설명 및 예제 영역의 폰트를 영문 기반 코딩 폰트로 강제하여 원화(₩) 기호 대신 백슬래시가 정상 표시되도록 합니다.

#### [MODIFY] `judge.html` 및 `admin_problems_list.html`
- 예제 입출력을 보여주는 `.example-box pre`, `code` 요소의 CSS `font-family` 속성 최상단에 `'Consolas', 'Courier New', monospace`를 명시적으로 추가합니다.

---

### 4. 문제 예제 복사 방지 기능
문제 출제 시 학생들이 예제를 드래그해서 복사하는 것을 막을 수 있는 옵션을 제공합니다.

#### [NEW] `migrate_db_v11.py`
- 데이터베이스 마이그레이션 스크립트를 생성하여 `problems` 테이블에 `prevent_copy BOOLEAN DEFAULT 0` 컬럼을 추가합니다.

#### [MODIFY] `setup_db.py`
- 신규 설치 시에도 `prevent_copy` 컬럼이 생성되도록 스키마를 수정합니다.

#### [MODIFY] `app.py`
- 문제 등록(`POST /api/admin/problems`) 및 문제 수정(`PUT /api/admin/problems/<id>`) API에서 `prevent_copy` 값을 받아 DB에 저장하도록 수정합니다.
- 문제 조회 시 해당 옵션값을 반환하도록 수정합니다.

#### [MODIFY] `admin_problems.html` & `admin_problems_list.html`
- 문제 작성/수정 폼에 "예제 텍스트 복사 금지" 체크박스를 추가합니다.

#### [MODIFY] `judge.html`
- 문제 정보를 렌더링할 때 `prevent_copy`가 `true`이면 예제 컨테이너에 `prevent-copy` CSS 클래스를 부여합니다.
- CSS: `.prevent-copy { user-select: none; }`
- JS: `copy` 이벤트 발생 시 `e.preventDefault()`를 호출하여 강제 복사도 차단합니다.

---

### 5. 관리자 권한 학생 풀이 기록 초기화
학생이 푼 문제의 기록을 초기화하여 다시 시도할 수 있게 하거나 통계를 정리하는 기능을 제공합니다.

#### [MODIFY] `app.py`
- `DELETE /api/admin/users/<int:user_id>/submissions` : 특정 유저의 전체 제출 기록 초기화 (삭제).
- `DELETE /api/admin/users/<int:user_id>/submissions/<int:problem_id>` : 특정 유저의 특정 문제 제출 기록 초기화.

#### [MODIFY] `admin_users.html`
- "유저 통계/기록 보기" 모달 상단에 **[전체 기록 초기화]** 버튼을 추가합니다.
- 통계 표의 각 문제(Row) 우측에 **[이 문제만 초기화]** 버튼을 추가합니다.
- 클릭 시 확인창(Confirm)을 거친 후 백엔드 API를 호출하여 기록을 초기화하고 목록을 새로고침합니다.

## Verification Plan
1. `migrate_db_v11.py`를 실행하여 DB 스키마가 오류 없이 업데이트되는지 확인합니다.
2. `admin_problems.html`에서 "복사 금지"를 체크하고 문제를 생성한 뒤, `judge.html`에서 드래그/복사가 막히는지 테스트합니다.
3. `judge.html`에서 코드를 제출하여 정답 처리 시, 제출 버튼이 비활성화되는지, 코드 초기화 시 다시 활성화되는지 확인합니다.
4. `admin_users.html`에서 테스트 유저의 특정 문제 및 전체 기록 초기화를 수행하고, 데이터가 삭제되는지 확인합니다.
5. `admin_assignments.html`에서 새로 만든 "진행 상황 보기"를 클릭하여 할당된 대상 유저들의 목록과 성공 여부가 올바르게 집계되는지 확인합니다.
