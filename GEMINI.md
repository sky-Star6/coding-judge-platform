# 온라인 코딩 저지 플랫폼 - 프로젝트 작업 규칙 (GEMINI.md)

이 문서는 `coding-judge-platform` 프로젝트에서 문제를 제작하고 데이터베이스를 관리할 때 AI 에이전트가 항상 준수해야 하는 핵심 지침입니다.

---

## 1. 급수 체계 및 출제 방식
* **입문/기초 (`difficulty: 0`)**: 사용자가 완성된 코드를 제공하면 이를 기반으로 문제 설명, 초기 코드(빈칸 등), 정답 코드, 테스트 케이스를 생성하여 DB에 등록/수정합니다.
* **3급 테스트 (`difficulty: 1`)**: AI가 자체 창작하며, 기초 구현, 조건문/반복문 기본 활용 위주로 출제합니다.
* **2급 테스트 (`difficulty: 3`)**: AI가 자체 창작하며, COS Pro 2급 표준(실생활 시나리오 + `solution(...)` 함수 구조 + 한 줄 디버깅(`debugging`) 또는 빈칸(`blank`))으로 출제합니다.
  * **빈칸 조립형 지문 작성 시 주의**: `func_a`, `func_b` 등의 함수 역할을 나열하지 않고, 프로그램 진행 순서(`### 단계` 아래 `1. 설명`, `2. 설명`...)로 구조를 기술합니다.
* **1급 테스트 (`difficulty: 5`)**: AI가 자체 창작하며, 실전 알고리즘/자료구조(탐욕법, 스택/큐, 투 포인터, 시뮬레이션 등) 위주로 출제합니다.

---

## 2. 코드 및 주석 절대 원칙
* **학생용 초기 코드 (`initial_code_python`, `initial_code_java`)**:
  * **주석을 일체 표기하지 않습니다.** (초기 코드 주석 완전 제거)
  * 학생 스스로 코드를 읽고 분석할 수 있도록 합니다.
* **채점 및 해설용 정답 코드 (`answer_python`, `answer_java`)**:
  * **초보자도 이해할 수 있도록 매 줄마다 아주 상세한 한국어 주석**을 작성합니다.
  * 기술 용어는 한국어와 영어를 병기합니다 (예: 나머지 연산자(Modulo Operator, %)).
  * 파이썬은 PEP 8 표준(명확한 변수명), 자바는 카멜케이스를 준수합니다.
  * 정답 포인트는 `[[정답]]` 형식으로 표기합니다.
* **Java 17 필수**:
  * 모든 문제는 Python 3과 함께 **Java 17 버전 코드**가 1:1 세트로 반드시 작성되어야 합니다.
  * 채점 엔진 규격에 따라 `public class Main`을 기본 클래스로 사용합니다.
  * DB 컬럼 `supported_languages`는 `'python3,java'`로 설정합니다.

---

## 3. 테스트 케이스 및 채점 검증
* 각 문제는 공개 예제(`is_public = 1`) 1~2개와 비공개 채점용(`is_public = 0`) 3개 이상으로 구성합니다.
* 정답 코드가 준비된 모든 테스트 케이스를 100% 통과(AC)하는지 미리 사전 검증합니다.
* 디버깅 문제의 경우, 버그 코드가 테스트 케이스에서 오답(WA)을 내는지 확인하며 변경 줄 수가 2 이하인지 확인합니다.

---

## 4. 데이터베이스 반영 절차
* DB 파일: `judge_db.sqlite`
* DB 수정/추가 전에는 반드시 자동 백업(`judge_db_backup_*.sqlite`)을 먼저 생성합니다.
* 해당 급수의 다음 `display_id`를 자동으로 계산하여 순서대로 부여합니다.

---

## 5. AI·코딩 24강 교육과정 교재 제작 표준 (ai-lesson-creator & UI/UX Pro Max)
* **UI/UX Pro Max 기본 원칙 필수 준수**:
  * 모든 교육자료(HTML/React) 제작 및 리뉴얼 시 `ui-ux-pro-max` 스킬의 인터랙션 설계 원칙과 Wanted Montage 디자인 시스템을 최우선으로 적용합니다.
  * **풀 너비 GNB 헤더 & 4단계 버튼 스위처 구조 (1강 최신 표준)**:
    * **풀 너비 GNB 헤더 (`w-full px-4 sm:px-6 lg:px-8 flex justify-between`)**: 헤더 좌우 여백 제약을 없애고 화면 가로 전체를 100% 사용하여 좌측 브랜드/타이틀, 우측 4단계 스텝 버튼 그룹의 시원한 2분할 레이아웃을 구성합니다 (헤더 우측의 `0/6 (0%)` 체크 표시 및 잠금 뱃지는 상단 복잡도 해소를 위해 제거하고 Stage 4 본문으로 집중).
    * **스텝 번호 원형 배지 규격 (`w-5 h-5 rounded-full font-bold`)**: 버튼 내 번호 원형 배지는 찌그러짐이나 왜곡 없는 완전한 20px 구모양(`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold`)을 준수하며, JS `switchStage()` 동적 클래스 전환 시에도 동일 규격을 100% 유지합니다.
    * **버튼 기반 단계 이동 (`switchStage`) & 하단 Prev/Next 네비게이션**: 상단 헤더 탭 및 모바일 전용 탭 바(`m-step-btn`)로 원하는 단계를 즉시 전환하며, 각 스테이지 최하단에 선형적인 [이전] / [다음] 단계 버튼을 필수로 배치합니다 (`전체 보기` 탭 지원).
  * **단일 컨테이너 몰입형 워크스페이스 (`max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10`)**:
    * 좁은 좌·우 2패널 분할 스플릿 뷰 대신, 본문 가독성과 실습 몰입도를 극대화하는 **단일 컨테이너 중앙 흐름**을 적용합니다 (15.6인치 노트북 및 태블릿 최적화).
  * **4단계 표준 커리큘럼 구성**:
    * **Stage 1 (미션 & 원리)**: 미션 브리핑 카드(도전 목표 3가지 - 1~16강 일관 표준 3열 카드, **소요 시간 표기 배제**)와 핵심 개념 원리 탐구 카드(3구리드 어린이 은유 + 개발자 원칙 알림)를 하나로 자연스럽게 결합.
    * **Stage 2 (가상 AI 실습 콘솔)**: 외부 로그인이나 API 키 없이 순수 브라우저 클라이언트 JS 엔진으로 구동되는 대화/도구 시뮬레이터 (추천 질문 칩 + 팩트체크/검증 반격 버튼 + 분석 리포트 카드).
    * **Stage 3 (실전 최신 AI 5대 킬러 퀘스트)**: 실제 외부 ChatGPT나 Gemini 창을 띄워두고 바로 테스트해 볼 수 있는 **5개 실전 카드 고정(QUEST 01 ~ QUEST 05)** (원클릭 프롬프트 복사 + whitespace-pre-wrap 멀티라인 줄바꿈 + 충격 반응/소환 마법 + 💡 컴퓨터 과학 비밀 해설).
    * **Stage 4 (전문 용어 돋보기 & 자가 점검 체크리스트 - 8강 최신 표준)**: 표제어/영문 캡션이 분리된 주니어 개발자 용어 돋보기 + 8강 표준 6개 자가 점검 체크리스트(에메랄드 알약 카운터 뱃지, 카드 내 실시간 그라데이션 게이지 바 `#checklist-progress-bar`, 호버 인디고 틴트 라벨, 100% 완주 시 다크 에메랄드 펄스 축하 카드 `#completion-card` 및 다음 강 언락 링크).
  * **학생 눈높이 본문 순화 & 교사용 문구 일체 배제 (절대 규칙)**:
    * 본문에서는 어려운 컴퓨터공학/AI 기술 용어를 직접 쓰지 않고, 초·중학생이 직관적으로 이해할 수 있는 **어린이용 은유(끝말잇기 선수, AI의 그럴듯한 거짓말, 도미노 방지 테스트 등)**로 풀어서 설명합니다.
    * **"선생님 팁", "교사 지도안" 같은 교사용 안내 문구는 교재 본문에 일체 넣지 않으며**, 오직 학생의 자기주도적 학습 관점으로만 작성합니다.
  * **페이지 최하단 전문 용어 돋보기 (Junior Developer Glossary) 표준**:
    * 본문에서 다룬 원리의 실제 공식 컴퓨터 과학 / AI 전문 용어는 **각 강의 최하단(Stage 4)에 [🔍 주니어 개발자를 위한 전문 용어 돋보기] 섹션으로 모아서 배치**합니다.
    * **표제어 및 괄호 분리 절대 규칙**: 카드 제목 줄에는 긴 괄호나 영문 없이 한국어 대표 표제어만 크고 시원하게 표기하고, **괄호에 들어가던 영문 공식 명칭이나 외래어 표기는 제목 바로 밑에 보조 캡션 블록(`text-sm font-mono text-slate-400 block pl-5.5`)으로 분리 작성 (최소 크기 14px 준수)**합니다.
    * 각 용어마다 **🧸 어린이 비유(1줄)** + **🎓 개발자 공식 정의(심화 설명)** 2단계를 반드시 포함합니다.
  * **디스플레이 최적화 (15.6인치 기준)**: 15.6인치 화면(패널 폭 60%) 기준에서 제목이 줄바꿈되지 않도록 적정 헤더 스케일을 유지하고, 메타 박스 등은 `whitespace-nowrap`을 적용하여 텍스트 쪼개짐을 방지합니다.
  * **타이포그래피 가독성 표준 및 글씨 최소 크기 14px 절대 준수**:
    * **글씨 최소 크기 14px (`text-sm`) 전면 적용**: 초·중학생의 눈 피로 방지를 위해 화면 내 모든 텍스트(설명 본문, 뱃지, 태그, 칩, 버튼 라벨, 보조 캡션, 체크리스트, 푸터 등)의 최소 크기를 **14px (`text-sm`) 이상으로 제한**합니다 (`text-[10px]`, `text-[11px]`, `text-xs`(12px) 사용 전면 금지).
    * **소제목/카드 제목 (`<h4>`, `<strong>`)**: **`text-base font-bold` (16px)** 적용.
    * **스테이지 대표 제목 (`<h3>`)**: `text-base sm:text-lg font-bold` (18px), **메인 대제목 (`<h2>`)**: `text-xl sm:text-2xl md:text-3xl` (24~30px)로 위계를 유지합니다.
    * **시각적 위계 표현**: 글씨 크기를 11px/12px로 깎지 않고, 폰트 색상 대비(`text-slate-400`, `text-slate-500`)와 굵기(`font-medium`, `font-semibold`)로만 위계를 표현합니다.
  * **프롬프트 가독성 및 줄바꿈 표준 (`whitespace-pre-wrap` 절대 규칙)**:
    * 프롬프트 박스 컨테이너(`class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap"`)에 `whitespace-pre-wrap`을 필수로 적용하여 브라우저에서 개행이 공백으로 합쳐지지 않도록 합니다.
    * 프롬프트 본문은 한 줄로 뭉쳐놓지 않고, 질문/조건 간 자연스러운 개행이나 섹션(`[Goal]`, `[Actor]`, `[Condition]`, `[Output Format]`) 간 단락 구분 빈 줄(`\n\n`)을 배치하여 시각적 블록 구조로 가독성을 극대화합니다.
    * 복사 스크립트는 `copyPromptText(this, 'prompt-text-N')` 규격으로 DOM의 멀티라인 텍스트를 온전히 클립보드에 복사합니다.
  * **마이크로 인터랙션 & 피드백**: 원클릭 프롬프트 복사 시 시각적 피드백(체크 아이콘 + '복사됨! ✨'), 폼 입력 포커스 링, 실시간 로컬 자동 저장 상태, 퀴즈 즉각 피드백, 게이트 락/언락(Pulse) 효과를 기본 탑재합니다.
  * **클린 코드 & 무(Zero) 인라인 스타일**: `style="..."` 사용을 일체 금지하고, 100% Tailwind CSS 유틸리티 클래스로만 반응형 및 접근성(WCAG 2.1 AA)을 구현합니다. 정적 HTML과 React 컴포넌트(`src/components/lessons/`)는 항상 1:1 동기화합니다.
* **디자인 표준**: 원티드 몽타주(Wanted Montage) 디자인 시스템 준수 (`.montage-lesson-hero`, `.montage-section-card`, `.montage-bento-grid`).
* **아이콘 표준 (Lucide Icons 필수 준수)**: 
  * 기본 OS 유니코드 이모지 단독 사용을 배제하고, **공식 Lucide Icons ([lucide.dev](https://lucide.dev/)) 규격**을 전면 적용합니다.
  * React 컴포넌트(`src/components/lessons/`)에서는 `lucide-react` 패키지 컴포넌트(`<Sparkles />`, `<CheckCircle2 />`, `<Lightbulb />`, `<ShieldCheck />` 등)를 100% 사용합니다.
  * 정적 HTML 교재에서는 Lucide CDN (`<script src="https://unpkg.com/lucide@latest"></script>`) 연동 및 Lucide 24x24 SVG 벡터 규격을 적용하여 언제나 일관되고 세련된 에듀테크 UI를 유지합니다.
* **체크리스트 버그 방지 절대 규칙 (8강 최신 표준)**:
  * 상단 학습 목표나 일반 리스트에 `.checklist-items` 클래스 사용 금지 (반드시 `.learning-goals-list` 사용).
  * 자가 점검 체크리스트는 **8강 최신 규격을 100% 준수**:
    - 에메랄드 `check-square` 아이콘 + 2단 헤더(`h3` + 안내 문구) + 우측 에메랄드 알약 카운터 뱃지 (`#checklist-counter`).
    - 카드 내부 실시간 그라데이션 게이지 바 (`#checklist-progress-bar` / `from-emerald-500 to-indigo-600`).
    - 라벨-체크박스 1:1 매핑 및 호버 틴트 (`hover:border-indigo-300 hover:bg-indigo-50/20`).
    - 100% 완주 축하 및 다음 강 언락 다크 펄스 카드 (`#completion-card` / `from-emerald-900 via-slate-900 to-indigo-950 text-white animate-pulse`).
    - 헤더 요소 참조 오류 방지를 위한 안전 널 가드(`if (gnbText)...`, `if (gateSlot)...`) 및 로컬 스토리지(`ai_lesson_XX_checklist`, `ai_lesson_XX_completed`) 양방향 동기화.
* **인터랙티브 체험관**: 조작 컨트롤러, 실시간 뷰어, 리셋(Reset) 및 복사(Copy) 기능과 함께 실제 동작하는 JS 엔진을 100% 동봉합니다.
* **브라우저 검증**: 모든 신규 강의 및 리뉴얼 페이지는 에고라이트 브라우저(`ego-browser`)를 통해 순차 완주 및 잠금 해제 동작을 사전에 검증합니다.

---

## 6. 엔트리(Entry) 기초 학습 자료 및 워크스페이스 제작 규칙 (절대 준수)
* **표준 스킬 및 공통 자산 (`entry-interactive-creator`)**:
  * 모든 엔트리 학습관 페이지(`materials/entry/`)는 공통 스타일시트(`/materials/entry/css/entry-edu.css`)와 공통 네비게이션 스크립트(`/materials/entry/js/entry-nav.js`)를 필수로 연동하여, GNB 헤더(브레드크럼, STEP 뱃지, 탭 스위처, 단원 드롭다운)와 좌측 지문 패널(최소 280px & 드래그 스플리터)의 글씨 크기, 여백, 카드 레이아웃을 100% 동일하게 통일합니다.
* **GNB 헤더(브레드크럼, 탭 스위처, 단원 이동 드롭다운) 표준 원칙 (절대 규칙)**:
  * **좌측 브레드크럼**: `홈 / 학습자료실 / [STEP XX] 단원명` (예: `[STEP 01] 순차구조`)
    - 해당 단원 내 모든 서브 페이지(1단계, 2단계, 3단계, 4단계 등)에서 **브레드크럼의 STEP 번호와 단원명은 변경되지 않고 항상 고정**됩니다 (개별 예제 제목이 브레드크럼에 들어가지 않음).
  * **스텝 스위처 탭 바**:
    - 해당 단원 내 서브 단계 버튼을 온전히 나열합니다: `[1 순차구조란?] [2 대화 만들기] [3 파리 움직임] [4 과일가게 주행]`
    - 현재 학습 중인 페이지의 버튼에만 `active` 클래스를 부여하고, 다른 버튼 클릭 시 해당 페이지로 즉시 이동합니다.
  * **우측 단원 이동 드롭다운 (`.edu-chapter-dropdown` - 전 단원 풀 리스트 동기화 필수)**:
    - 모든 엔트리 학습관 페이지 헤더 우측에 `[단원 선택 ▾]` 드롭다운 버튼을 배치하여, 언제든 다른 단원으로 즉시 점프할 수 있도록 지원합니다.
    - **새로운 단원 추가 시 기존 모든 페이지의 `#chapter-dropdown-menu`에도 새 단원 항목을 빠짐없이 등록**하여, 어느 페이지에서 열더라도 STEP 01부터 최신 단원까지 동일한 목록과 슬림 스크롤바(`max-height: min(350px, calc(100vh - 80px));`)가 제공되어야 합니다.
  * **개념 설명 카드 제목 번호 일치**:
    - 좌측 패널 첫 번째 개념 카드의 제목 번호는 스위처의 단계 번호와 1:1로 일치시킵니다 (`1단계: 1. ~`, `2단계: 2. ~`, `3단계: 3. ~`, `4단계: 4. ~`).
* **초기 프로젝트 블록 최소화 및 사전 노출 방지 원칙**:
  * 학생이 스스로 지문을 읽고 블록 카테고리(시작, 움직임, 흐름, 생김새 등)에서 직접 필요한 블록을 꺼내어 조립하는 실습 목적을 달성해야 합니다.
  * **엔트리 파일 내용(초기 프로젝트 JSON) 등록 시, 지문(지시사항)에 설명되어 있는 실행 블록(`말하기`, `기다리기`, `움직이기`, `모양바꾸기` 등)은 작업 영역에 미리 올려두지 않고 반드시 모두 삭제하고 등록**합니다.
  * 초기 프로젝트(`initial_project_*.json`)의 작업 영역에는 각 오브젝트별 시작 이벤트 블록(예: `[시작하기 버튼을 클릭했을 때]`)만 남깁니다.
  * 정답 프로젝트(`solution_project_*.json`)에는 `[💡 정답 불러오기]` 및 자동 채점용으로 모든 블록이 정상 연결된 코드를 유지합니다.
* **좌측 지문 4-Card 표준 레이아웃 및 컴포넌트 규격**:
  * 1) **개념 설명 카드** (`.edu-card`, `.edu-card-title`, `.edu-card-badge`, `.edu-concept-intro`, `.edu-diagram-box`):
    - 도해 프로세스 단계(`.edu-diagram-step`, `.edu-timeline-step`)는 `display: flex; align-items: flex-start; gap: 10px;`를 적용합니다.
    - 단계 번호는 **반드시 22px 원형 배지(`.edu-diagram-step-num`, `.edu-timeline-num` / `border-radius: 50% !important; display: inline-flex !important;`)**를 준수하며, 가로 색깔 바로 늘어나거나 줄바꿈되는 현상을 절대 금지합니다.
  * 2) **실습 미션 지시사항 카드 (표준 아이템 리스트 규격 절대 준수 - 최신 표준)**:
    - 카드 헤더: `<div class="edu-card-header"><h3 class="edu-card-title"><span>🎯 실습 미션 지시사항</span></h3></div>` 통일.
    - 안내 리드문: `<div class="edu-card-body"><div class="edu-mission-lead">오른쪽 엔트리 스튜디오에서 <strong>[오브젝트명]</strong>을 선택하고, 아래 블록들을 지시사항에 맞게 조립해 보세요!</div>`
    - 가이드 섹션: `<div class="edu-block-guide-section">` 상단에 **오브젝트명만 단독 표기** (`⭐ [오브젝트명] 오브젝트 코딩`), **파일명 뱃지(`파일명.ent`, `xxx.pptx`)는 지문에 일체 넣지 않음**.
    - **이벤트/기능별 블록 묶음 소제목 (이모지 절대 배제)**: `(1) 시작하기 버튼을 클릭했을 때`, `(2) 위쪽 화살표 키를 눌렀을 때 (퍼지는 불꽃)`처럼 괄호 번호와 텍스트로만 구성하고 **📍 등의 이모지는 일체 사용 금지** (`<div style="margin-top: 14px; margin-bottom: 6px; font-weight: 700; color: #1e293b; font-size: 0.88rem;">`).
    - **반복문/조건문 블록 내부 들여쓰기 (`indent`) 절대 규칙**: 반복문(`~번 반복하기`, `계속 반복하기`)이나 조건문(`만일 ~라면`) 안쪽에 들어가는 블록들은 반드시 **`class="edu-block-guide-item indent" style="margin-left: 20px;"`를 적용**하여 시각적 중첩 구조를 직관적으로 표현.
    - **블록명 및 파라미터 표준 표기**: 블록명은 `[블록명]`, 파라미터는 `( 값 )` 괄호 및 공백 표기 (예: `[x: ( 0 ), y: ( 0 ) 위치로 이동하기]`, `[크기를 ( 100 )%로 정하기]`, `[( 20 ) 번 반복하기]`, `[크기를 ( 5 )만큼 바꾸기]`, `[방향을 ( 10˚ )만큼 회전하기]`).
    - 개별 블록 가이드: 반드시 `<div class="edu-block-guide-item">` 구조를 사용하며, 좌측에 카테고리 컬러 태그(`<span class="edu-block-tag" style="background: #10b981;">시작</span>`), 우측에 블록 조립 설명(`<span><strong>[블록명]</strong> 지시사항</span>`)을 배치.
    - **절대 금지**: 지시사항 카드(Card 2) 내부에 `.edu-timeline-num` 번호 배지나 임의의 서술형 번호 박스를 혼용하지 않으며, 전 단원 100% 동일한 `.edu-block-guide-item` 블록 가이드 규격을 준수.
  * 3) **교재 TIP 박스 카드** (`.edu-tip-box`, `.edu-tip-title`, `.edu-tip-desc`)
  * 4) **실시간 미션 체크 & 채점 카드** (`.edu-grade-result`, `.edu-action-bar`, `.edu-action-main-btn` [🎯 미션 채점하기]):
    - `[🔄 처음 상태로]`와 `[💡 정답 불러오기]` 버튼은 반드시 `<div class="edu-action-sub-btns">`로 감싸며, 패널 너비 확장 시 **두 버튼이 50%씩 균등하게 가로로 비례 확장(`flex: 1; min-width: 0; width: 100%;`)**되도록 합니다.
* **스플리터 리사이징 및 워크스페이스 최적화 (`entry-nav.js`)**:
  * 패널 너비 조절 바는 `<div class="edu-splitter edu-drag-splitter" id="drag-splitter">` 클래스를 온전히 부여하고, `applyLeftPaneSplitter()`를 통해 우측 캔버스 간섭 없이 부드럽게 크기를 조절합니다.
  * 엔트리 스테이지 크기 조절기는 `applyEntryStageSplitterPatch()`로 마우스 오프셋 왜곡을 없애 160px~850px 범위에서 부드럽게 조절되며, 더블 클릭 시 `324px ↔ 560px` 토글을 지원합니다.
  * 엔트리 오브젝트 정보창(`.entryContainerListWorkspaceWrapper`)은 세로 오버플로우와 슬림 스크롤바가 항상 동작하여 다중 오브젝트가 하단에서 잘리지 않도록 합니다.
* **엔트리 우클릭 컨텍스트 메뉴 스타일 (`entry-tool.css`) 및 블록 미디어 경로 (`mediaFilePath`) 표준 (절대 준수)**:
  * 마우스 우클릭 시 엔트리 공식 컨텍스트 메뉴(코드 복사하기, 코드 복제하기, 붙여넣기, 코드 정리하기)가 정상 렌더링되도록 `<link rel="stylesheet" href="/static/css/entry-tool.css">` 및 `entry-edu.css` 맨 위 `@import url('/static/css/entry-tool.css');`를 필수로 유지합니다.
  * `Entry.init(container, initOptions)` 호출 시 `libDir: ''`, `entryDir: '/lib/entryjs'`로 설정하고, 직후 반드시 `Entry.mediaFilePath = '/lib/entryjs/images/';`를 선언해야 합니다. 누락 시 블록 SVG 아이콘이 404로 깨집니다.
* **하단 선형 이전 / 다음 단계 네비게이션 (`.edu-step-nav-bottom`) 표준 원칙 (절대 규칙)**:
  * 좌측 지문 패널 최하단(Card 4 아래, `</aside>` 바로 직전)에 이전 단계 및 다음 단계로 선형 이동할 수 있는 2분할 네비게이션 버튼을 필수로 배치합니다.
  * **버튼 구성 규격**:
    - 좌측: 이전 버튼 (`class="edu-btn edu-btn-secondary"`), 우측: 다음 버튼 (`class="edu-btn edu-btn-primary"`).
    - 첫 단원 첫 단계(`index.html`): 이전 버튼은 `[← 학습자료실] (/materials.html)`.
    - 단원 1단계: 이전 버튼은 이전 단원의 마지막 단계로 링크 (예: `repeat1.html` -> `step4.html`).
    - 단원 마지막 단계: 다음 버튼은 다음 단원의 1단계로 링크 (예: `step4.html` -> `repeat1.html`).
  * **반응형 텍스트 및 가독성 (`entry-edu.css`)**:
    - 기본 패널 폭(280px)에서 긴 라벨(예: `← 이전 (3단계: 음식 자동판매기)`)이 말줄임표나 글자 잘림 없이 자연스럽게 2줄 중앙 정렬(`white-space: normal; word-break: keep-all; line-height: 1.35;`)되도록 처리하며, 인라인 스타일 없이 공통 CSS 클래스(`.edu-step-nav-bottom`)만 사용합니다.
* **검증 브라우저 원칙 (에고라이트 `ego-browser` 필수 준수)**:
  * 모든 엔트리 인터랙티브 학습관 및 AI 교육자료의 기능 검증, UI 레이아웃, 채점 시뮬레이션 및 화면 스크린샷 캡처는 **반드시 에고라이트(`ego-browser`)를 기본 검증 브라우저로 사용하여 수행**합니다.
  * `ego-browser`를 통해 실제 브라우저 환경에서 블록 아이콘 정상 로딩, 채점 로직 통과, 리사이징 및 인터랙션이 원활히 동작하는지 사전 검증을 완료한 후 배포합니다.




