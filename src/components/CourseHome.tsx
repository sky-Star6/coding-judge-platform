import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Gamepad2,
  Star,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Lock,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  RefreshCw,
  Terminal,
  Search,
  Target,
  Lightbulb,
  FileText,
  Bot,
  Code2,
  PlayCircle,
  Bug,
  ShieldAlert,
  KeyRound,
  Award,
  ChevronRight,
  Layers,
  Check
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 강의 상태 및 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type LessonStatus = 'available' | 'locked' | 'completed' | 'upcoming';

export interface LessonItem {
  id: number;
  seasonId: number;
  title: string;
  subtitle: string;
  description: string;
  status: LessonStatus;
  unlockCondition?: string;
  link?: string;
  tags?: string[];
}

export interface SeasonInfo {
  id: number;
  trackId: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeType: 'success' | 'progress' | 'upcoming' | 'project';
  accentColor: string;
}

/**
 * ------------------------------------------------------------------------------
 * 24강 정규 커리큘럼 데이터 (2026 Revised 24-Lecture Curriculum)
 * ------------------------------------------------------------------------------
 */
const SEASONS: SeasonInfo[] = [
  {
    id: 1,
    trackId: 'season-1',
    title: '시즌 1: AI 스토리 & 비주얼 노벨 크리에이터 (1~6강)',
    subtitle: '생성형 AI의 원리 이해부터 인터랙티브 웹 비주얼 노벨 v1 완성까지',
    badge: '전 강좌 오픈 완료',
    badgeType: 'success',
    accentColor: 'indigo'
  },
  {
    id: 2,
    trackId: 'season-2',
    title: '시즌 2: 미니 웹 아케이드 & 버그 헌터 (7~12강)',
    subtitle: '동적 인터랙션, 로직 설계, 디버깅 배틀, 회귀 테스트로 완성하는 실시간 웹 아케이드',
    badge: '전 강좌 오픈 완료',
    badgeType: 'success',
    accentColor: 'blue'
  },
  {
    id: 3,
    trackId: 'season-3',
    title: '시즌 3: 실생활 스마트 도구 & 오픈 API (13~18강)',
    subtitle: 'JSON과 fetch, 공공 오픈 API, 날씨 연동, 예외 처리로 만드는 스마트 일상 웹앱',
    badge: '전 강좌 오픈 완료',
    badgeType: 'success',
    accentColor: 'emerald'
  },
  {
    id: 4,
    trackId: 'season-4',
    title: '시즌 4: 주니어 AI 해커톤 & 스마트 챗봇 웹앱 (19~24강)',
    subtitle: '기획, 로컬 AI 대화 엔진, 알파/베타 빌드, 사용자 테스트, 최종 데모 데이',
    badge: '실전 프로젝트',
    badgeType: 'project',
    accentColor: 'rose'
  }
];

const LESSONS_DATA: LessonItem[] = [
  // 시즌 1 (1~6강)
  {
    id: 1,
    seasonId: 1,
    title: 'AI는 거짓말쟁이? AI 원리와 팩트체크 배틀',
    subtitle: '생성형 AI 원리와 팩트체크',
    description: '생성형 AI의 확률적 생성 원리와 환각(Hallucination) 현상을 이해하고, AI 거짓말 탐지기 챌린지로 팩트체크를 훈련합니다.',
    status: 'available',
    link: '/lessons/01-ai-literacy/index.html',
    tags: ['AI 리터러시', '환각 검증', '확률 모델']
  },
  {
    id: 2,
    seasonId: 1,
    title: '나만의 판타지 캐릭터와 세계관 프롬프트',
    subtitle: '역할·맥락·조건 프롬프트',
    description: '역할, 맥락, 조건을 갖춘 프롬프트 엔지니어링으로 비주얼 노벨의 개성 넘치는 주인공과 빌런 시트를 창작합니다.',
    status: 'locked',
    unlockCondition: '1강을 완료하면 열립니다.',
    link: '/lessons/02-better-prompts/index.html',
    tags: ['프롬프트 4대 기둥', '캐릭터 시트']
  },
  {
    id: 3,
    seasonId: 1,
    title: '갈림길의 모험: 스토리 분기와 선택지 설계',
    subtitle: '스토리 분기 및 트리 구조',
    description: '작업 분해 기법으로 스토리를 장면 단위로 쪼개고, 독자의 선택에 따라 엔딩이 바뀌는 인터랙티브 분기 트리를 완성합니다.',
    status: 'locked',
    unlockCondition: '2강을 완료하면 열립니다.',
    link: '/lessons/03-story-branch/index.html',
    tags: ['작업 분해', '스토리 트리', '선택지 설계']
  },
  {
    id: 4,
    seasonId: 1,
    title: 'AI와 함께하는 밸런스 패치: 스토리 검증',
    subtitle: '논리 모순 검증 & 대본 완성',
    description: '스토리의 논리적 모순과 버그를 찾아 수정하고, 극적인 반전을 더해 완성도 높은 대본 v2를 확정합니다.',
    status: 'locked',
    unlockCondition: '3강을 완료하면 열립니다.',
    link: '/lessons/04-balance-patch/index.html',
    tags: ['논리 검증', '밸런스 패치', '대본 확정']
  },
  {
    id: 5,
    seasonId: 1,
    title: '게임 화면의 뼈대 세우기: HTML 대사창',
    subtitle: 'HTML 구조 & UI 마크업',
    description: 'HTML 태그와 문서 구조를 익혀 게임 화면에 대사창, 캐릭터 일러스트 자리, 선택 버튼을 직접 마크업합니다.',
    status: 'locked',
    unlockCondition: '4강을 완료하면 열립니다.',
    link: '/lessons/05-html-dialogue/index.html',
    tags: ['HTML5', '웹 접근성', '대사창 마크업']
  },
  {
    id: 6,
    seasonId: 1,
    title: '판타지 감성 입히기: CSS & 시즌 1 완성 쇼케이스',
    subtitle: 'CSS 스타일링 & 시즌 1 완성',
    description: '다크 테마, 빛나는 버튼 효과 등 CSS 스타일을 입혀 나만의 인터랙티브 웹 비주얼 노벨 v1을 완성하고 친구와 플레이합니다.',
    status: 'locked',
    unlockCondition: '5강을 완료하면 열립니다.',
    link: '/lessons/06-css-showcase/index.html',
    tags: ['CSS3', '비주얼 노벨 v1', '시즌 1 완주']
  },

  // 시즌 2 (7~12강)
  {
    id: 7,
    seasonId: 2,
    title: 'JavaScript로 반응하는 게임 화면',
    subtitle: '클릭 이벤트 & 동적 UI',
    description: '클릭 이벤트와 변수를 배워 버튼을 누르면 점수가 올라가는 쿠키클리커 게임의 기초를 만듭니다.',
    status: 'locked',
    unlockCondition: '6강을 완료하면 열립니다.',
    link: '/lessons/07-javascript-intro/index.html',
    tags: ['JavaScript', '이벤트 리스너', '쿠키클리커']
  },
  {
    id: 8,
    seasonId: 2,
    title: '조건과 반복으로 게임 로직 설계',
    subtitle: '럭키 가챠 상자 & 3문항 퀴즈',
    description: '조건문(if/else)과 배열, 무작위 확률(Math.random)을 활용해 행운의 보물 상자 뽑기와 3문항 퀴즈 게임을 구현합니다.',
    status: 'locked',
    unlockCondition: '7강을 완료하면 열립니다.',
    link: '/lessons/08-lucky-gacha/index.html',
    tags: ['조건문', '확률 로직', '가챠 뽑기']
  },
  {
    id: 9,
    seasonId: 2,
    title: '장애물 피하기 미니게임 제작',
    subtitle: '별똥별 피하기 & MVP 아케이드',
    description: 'HTML·CSS·JS를 총동원하여 키보드 방향키 조작과 충돌 판정, 점수 시스템을 갖춘 실시간 웹 아케이드를 완성합니다.',
    status: 'locked',
    unlockCondition: '8강을 완료하면 열립니다.',
    link: '/lessons/09-mini-project/index.html',
    tags: ['충돌 판정', '게임 루프', 'MVP 아케이드']
  },
  {
    id: 10,
    seasonId: 2,
    title: 'AI 코딩 도구와 버그 사냥꾼(Bug Hunter)',
    subtitle: '콘솔 에러 분석 & AI 디버깅',
    description: '개발자 도구 콘솔의 오류 메시지를 읽고 Given-When-Then 형식으로 AI에게 정확한 수정 프롬프트를 내려 버그를 체포합니다.',
    status: 'locked',
    unlockCondition: '9강을 완료하면 열립니다.',
    link: '/lessons/10-bug-hunter/index.html',
    tags: ['콘솔 디버깅', 'Bug Hunter', 'Given-When-Then']
  },
  {
    id: 11,
    seasonId: 2,
    title: '게임 난이도 조절과 회귀 테스트',
    subtitle: 'Diff 검토 & 안전한 코드 변경',
    description: '새 기능을 추가할 때 기존 기능이 고장 나지 않도록 검증하는 회귀 테스트(Regression Test)와 안전한 AI 변경 승인 원칙을 배웁니다.',
    status: 'locked',
    unlockCondition: '10강을 완료하면 열립니다.',
    link: '/lessons/11-regression-test/index.html',
    tags: ['회귀 테스트', 'Diff 검토', '난이도 밸런싱']
  },
  {
    id: 12,
    seasonId: 2,
    title: '미니 아케이드 게임 완성 & 랭킹전',
    subtitle: '로컬 스토리지 랭킹 & 시즌 2 완성',
    description: '최고 점수 저장 기능(Local Storage)을 넣고 완성된 아케이드 게임으로 반 친구들과 점수 경쟁을 펼칩니다.',
    status: 'locked',
    unlockCondition: '11강을 완료하면 열립니다.',
    link: '/lessons/12-ranking-storage/index.html',
    tags: ['Local Storage', '랭킹전', '시즌 2 완주']
  },

  // 시즌 3 (13~18강)
  {
    id: 13,
    seasonId: 3,
    title: '인터넷 데이터의 열쇠: JSON과 비동기 통신',
    subtitle: 'fetch API & JSON 기초',
    description: '웹 브라우저가 다른 서버에서 데이터를 가져오는 fetch 원리와 JSON 데이터 구조를 익힙니다.',
    status: 'locked',
    unlockCondition: '12강을 완료하면 열립니다.',
    link: '/lessons/13-open-api/index.html',
    tags: ['JSON', 'fetch API', '비동기 통신']
  },
  {
    id: 14,
    seasonId: 3,
    title: '우리 학교 오늘 급식 식단표 앱 만들기',
    subtitle: '공공 오픈 API 연동',
    description: '가입과 키가 필요 없는 공공 오픈 API로 오늘 우리 학교 점심 메뉴와 칼로리를 가져와 화면에 띄웁니다.',
    status: 'locked',
    unlockCondition: '13강을 완료하면 열립니다.',
    link: '/lessons/14-school-lunch/index.html',
    tags: ['오픈 API', '식단표 앱', '공공 데이터']
  },
  {
    id: 15,
    seasonId: 3,
    title: '포켓몬 도감 검색기 & 능력치 비교기',
    subtitle: 'PokeAPI 연동 & 스탯 차트',
    description: 'PokeAPI를 연동해 포켓몬 이름 검색, 속성 아이콘, 스탯 그래프를 보여주는 실전 웹앱을 제작합니다.',
    status: 'locked',
    unlockCondition: '14강을 완료하면 열립니다.',
    link: '/lessons/15-pokemon-api/index.html',
    tags: ['PokeAPI', '검색 기능', '데이터 시각화']
  },
  {
    id: 16,
    seasonId: 3,
    title: '실시간 날씨 안내 & 옷차림 추천기',
    subtitle: '날씨 API & 추천 로직',
    description: '무료 실시간 날씨 데이터를 기반으로 오늘 비가 오는지, 기온에 맞춰 어떤 옷을 입을지 추천하는 도구를 만듭니다.',
    status: 'locked',
    unlockCondition: '15강을 완료하면 열립니다.',
    link: '/lessons/16-weather-coord/index.html',
    tags: ['날씨 API', '조건부 추천', '실시간 데이터']
  },
  {
    id: 17,
    seasonId: 3,
    title: '오류 없는 안전한 앱: 로딩과 예외 처리',
    subtitle: '에러 핸들링 & UX 안전망',
    description: '인터넷이 끊기거나 오타가 났을 때 앱이 꺼지지 않도록 로딩 스피너와 친절한 안내 화면을 구현합니다.',
    status: 'locked',
    unlockCondition: '16강을 완료하면 열립니다.',
    link: '/lessons/17-loading-states/index.html',
    tags: ['try-catch', '로딩 스피너', '예외 처리']
  },
  {
    id: 18,
    seasonId: 3,
    title: '시즌 3 완성: 나만의 실생활 스마트 도구',
    subtitle: '실생활 도구 완성 & 배포',
    description: '친구들이나 가족들이 실제로 매일 쓸 수 있는 유용한 웹 도구를 완성하고 링크로 공유합니다.',
    status: 'locked',
    unlockCondition: '17강을 완료하면 열립니다.',
    link: '/lessons/18-smart-tool-showcase/index.html',
    tags: ['스마트 도구', '웹 공유', '시즌 3 완주']
  },

  // 시즌 4 (19~24강)
  {
    id: 19,
    seasonId: 4,
    title: '프로젝트 기획: 문제 발견과 제안서',
    subtitle: '문제 발견 & 기획서 작성',
    description: '주변 사람들의 진짜 불편을 관찰하고, 해결할 핵심 문제와 가치를 담은 제안서를 작성합니다.',
    status: 'locked',
    unlockCondition: '18강을 완료하면 열립니다.',
    link: '/lessons/19-ai-inventor/index.html',
    tags: ['해커톤 기획', '문제 정의', '제안서']
  },
  {
    id: 20,
    seasonId: 4,
    title: '키워드 분석과 로컬 AI 추론 엔진',
    subtitle: '로컬 AI 엔진 & 화면 설계',
    description: '외부 API 키 없이 순수 자바스크립트로 키워드 분석, 감정 매칭, 문맥 분기 로컬 AI 엔진을 설계합니다.',
    status: 'locked',
    unlockCondition: '19강을 완료하면 열립니다.',
    link: '/lessons/20-chatbot-brain/index.html',
    tags: ['로컬 AI 엔진', '키워드 분석', '와이어프레임']
  },
  {
    id: 21,
    seasonId: 4,
    title: '핵심 흐름 알파(Alpha) 구현',
    subtitle: '핵심 유저 흐름 프로토타입',
    description: 'AI와의 대화나 핵심 기능이 처음부터 끝까지 중단 없이 돌아가는 첫 버전을 만듭니다.',
    status: 'locked',
    unlockCondition: '20강을 완료하면 열립니다.',
    link: '/lessons/21-chatbot-alpha/index.html',
    tags: ['알파 빌드', 'E2E 흐름', 'MVP']
  },
  {
    id: 22,
    seasonId: 4,
    title: '통합 기능 완성 및 베타(Beta) 디버깅',
    subtitle: '전체 기능 결합 & 버그 수정',
    description: '모든 부가 기능을 연결하고, 버그 사냥과 예외 처리를 통해 완성도를 끌어올립니다.',
    status: 'locked',
    unlockCondition: '21강을 완료하면 열립니다.',
    link: '/lessons/22-chatbot-beta/index.html',
    tags: ['베타 빌드', '버그 추적표', '안정화']
  },
  {
    id: 23,
    seasonId: 4,
    title: '친구들의 사용자 테스트(User Test)와 개선',
    subtitle: '유저 피드백 & RC 출시',
    description: '친구 2명 이상에게 내 앱을 쓰게 하고, 막히거나 불편한 점을 찾아 마지막 다듬기를 마칩니다.',
    status: 'locked',
    unlockCondition: '22강을 완료하면 열립니다.',
    link: '/lessons/23-user-testing/index.html',
    tags: ['사용자 테스트', '피드백 수렴', 'RC 빌드']
  },
  {
    id: 24,
    seasonId: 4,
    title: '최종 데모 데이 쇼케이스 & 회고',
    subtitle: '라이브 시연 & 24강 완주',
    description: '완성된 프로젝트를 부모님과 친구들 앞에서 시연하고, 24강 동안의 성장 과정을 발표합니다.',
    status: 'locked',
    unlockCondition: '23강을 완료하면 열립니다.',
    link: '/lessons/24-hackathon-demoday/index.html',
    tags: ['데모 데이', '라이브 시연', '최종 수료']
  }
];

/**
 * ------------------------------------------------------------------------------
 * 교육 개요 메타 4구리드 데이터
 * ------------------------------------------------------------------------------
 */
const METADATA_CARDS = [
  {
    icon: Users,
    label: '교육 대상',
    value: '중학생 이상 누구나',
    description: '프로그래밍 경험이 없어도 직관적인 실습으로 시작'
  },
  {
    icon: Calendar,
    label: '교육 기간',
    value: '24강 정규 (시즌제 운영)',
    description: '시즌당 4~6강으로 완성하는 단계별 프로젝트'
  },
  {
    icon: RefreshCw,
    label: '학습 방식',
    value: '문제정의 → AI → 검증',
    description: 'AI 결과물을 비판적으로 검토하고 개선하는 힘 배양'
  },
  {
    icon: Terminal,
    label: '준비 도구',
    value: '브라우저 & 무료 AI',
    description: '별도 유료 결제나 고사양 PC 없이 100% 무료 실습'
  }
];

/**
 * ------------------------------------------------------------------------------
 * 8단계 AI 협업 개발 루프 파이프라인
 * ------------------------------------------------------------------------------
 */
const DEV_LOOP_STEPS = [
  { step: 1, title: '문제 발견', desc: '일상의 불편함과 개선점을 탐색', icon: Search },
  { step: 2, title: '문제 정의', desc: '사용자·목표·입출력 범위 확정', icon: Target },
  { step: 3, title: '아이디어 구체화', desc: '화면 구조 및 동작 규칙 스케치', icon: Lightbulb },
  { step: 4, title: '요구사항 작성', desc: 'Given-When-Then 동작 명세화', icon: FileText },
  { step: 5, title: 'AI에 작업 지시', desc: '역할·맥락·조건 프롬프트 전달', icon: Bot },
  { step: 6, title: '코드 생성', desc: '모듈별 초안 코드 획득 및 분석', icon: Code2 },
  { step: 7, title: '실행 & 테스트', desc: '브라우저 직접 실행 및 검증', icon: PlayCircle },
  { step: 8, title: '오류 분석 & 개선', desc: '콘솔 에러 분석 및 디버깅', icon: Bug }
];

/**
 * ------------------------------------------------------------------------------
 * 안전 수칙 및 윤리 가이드라인 4대 원칙
 * ------------------------------------------------------------------------------
 */
const ETHICS_CARDS = [
  {
    title: '개인정보 보호',
    principle: '가상 데이터 사용 원칙',
    desc: '실명, 전화번호, 주소, 학교명 등 실제 개인정보를 AI 프롬프트나 코드에 절대 입력하지 않습니다. 테스트는 항상 가상의 데이터(예: 홍길동, user01)를 사용합니다.',
    borderColor: 'border-rose-200',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    tagColor: 'text-rose-600',
    icon: ShieldAlert
  },
  {
    title: '비밀 키(API Key) 보안',
    principle: '키 노출 금지 & 노키 우선',
    desc: 'API 비밀 키는 절대 공개 깃허브나 웹에 업로드하지 않습니다. 유출 시 즉시 재발급하며, 본 과정에서는 키 등록 없는 무인증 오픈 API 실습을 최우선합니다.',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    tagColor: 'text-amber-600',
    icon: KeyRound
  },
  {
    title: 'AI 답변 비판적 검증',
    principle: '환각 경계 & 2개 이상 근거',
    desc: '생성형 AI는 그럴듯한 거짓말(환각, Hallucination)을 생성할 수 있습니다. AI가 작성한 코드는 맹신하지 않고 반드시 직접 브라우저 콘솔에서 실행하고 테스트합니다.',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    tagColor: 'text-blue-600',
    icon: CheckCircle2
  },
  {
    title: '저작권 및 라이선스 준수',
    principle: '출처 표기 & MIT/CC BY 준수',
    desc: '타인의 이미지나 오픈소스 코드를 활용할 때는 반드시 상업적 이용 가능 여부(CC0, MIT 등)를 확인하고, 출처와 AI 협업 프롬프트 기록을 투명하게 남깁니다.',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    tagColor: 'text-emerald-600',
    icon: Award
  }
];

/**
 * ------------------------------------------------------------------------------
 * 정형 데이터 테이블 1: 도구 선택지 및 오프라인 대체 경로
 * ------------------------------------------------------------------------------
 */
const FALLBACK_TOOLS_DATA = [
  {
    category: 'AI 협업',
    recommended: '무료 웹 AI 서비스 (ChatGPT Free, Claude Free, Gemini)',
    fallback: '수업용 사전 제공 오프라인 프롬프트-응답 데이터셋 카드 활용'
  },
  {
    category: '코드 작성',
    recommended: 'VS Code (Visual Studio Code) 또는 기본 메모장',
    fallback: '웹 브라우저 내장 개발자 도구 (Console) 또는 온라인 웹 에디터'
  },
  {
    category: '데이터 연동 (시즌 3)',
    recommended: '공개 REST API (급식, 날씨, 포켓몬 등 키 없이 무료 호출)',
    fallback: 'API 키가 전혀 필요 없는 로컬 샘플 data.json 및 내장 Mock 데이터'
  },
  {
    category: 'AI 모델 연동 (시즌 4)',
    recommended: '인-브라우저 로컬 AI 엔진 (순수 JS 키워드 분석 & 규칙 추론)',
    fallback: '구글 계정/외부망 불가 시: 콘솔 내장 안전 모의(Mock) 모드로 100% 실습'
  },
  {
    category: '결과물 저장',
    recommended: '브라우저 로컬 스토리지 (Local Storage)',
    fallback: '마크다운(.md) 및 JSON 파일 직접 다운로드 (회고 내보내기 지원)'
  }
];

/**
 * ------------------------------------------------------------------------------
 * 메인 컴포넌트: CourseHome
 * ------------------------------------------------------------------------------
 */
export const CourseHome: React.FC = () => {
  // 시즌 필터 상태 관리 ('all' 또는 'season-1' ~ 'season-4')
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  // 1~24강 실시간 동적 진도 및 접근 권한 상태
  const [lessons, setLessons] = useState<LessonItem[]>(LESSONS_DATA);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const totalLessons = 24;
  const progressPercent = useMemo(() => {
    return Math.round((completedCount / totalLessons) * 100);
  }, [completedCount]);

  useEffect(() => {
    const syncProgress = async () => {
      let serverData: Record<string, any> | null = null;
      try {
        const res = await fetch('/api/ai/progress', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin'
        });
        if (res.ok) {
          serverData = await res.json();
        }
      } catch (e) {
        // 오프라인 / 정적 호스팅 폴백
      }

      let doneCount = 0;
      let prevDone = true; // 1강은 항상 오픈

      const updated = LESSONS_DATA.map((lesson) => {
        const numStr = lesson.id < 10 ? `0${lesson.id}` : `${lesson.id}`;
        const key = `lesson_${numStr}`;
        const localDone = typeof window !== 'undefined' && localStorage.getItem(`ai_${key}_completed`) === 'true';
        const serverDone = serverData ? Boolean(serverData[`${key}_completed`]) : false;
        const isDone = serverDone || localDone;

        if (isDone) doneCount++;

        // 로컬에 완료 기록이 있으나 서버에 미반영된 경우 백그라운드 멱등 동기화
        if (localDone && !serverDone && serverData) {
          fetch('/api/ai/complete-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ lesson_id: key })
          }).catch(() => {});
        }

        const serverAccessible = serverData ? Boolean(serverData[`${key}_accessible`]) : false;
        const isAccessible = (lesson.id === 1) ? true : (isDone || prevDone || serverAccessible);

        prevDone = isDone;

        let status: LessonStatus = 'locked';
        if (isDone) {
          status = 'completed';
        } else if (isAccessible) {
          status = 'available';
        } else {
          status = 'locked';
        }

        return {
          ...lesson,
          status
        };
      });

      setLessons(updated);
      setCompletedCount(doneCount);
    };

    syncProgress();
  }, []);

  // 다음 학습할 미완료 강의 및 전체 완주 여부
  const nextUncompletedLesson = useMemo(() => {
    return lessons.find((l) => l.status !== 'completed');
  }, [lessons]);

  const isAllLessonsCompleted = completedCount === totalLessons || !nextUncompletedLesson;

  // 필터링된 시즌 목록
  const filteredSeasons = useMemo(() => {
    if (selectedSeason === 'all') return SEASONS;
    return SEASONS.filter((s) => s.trackId === selectedSeason);
  }, [selectedSeason]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 웹 접근성 건너뛰기 링크 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        본문 바로가기
      </a>

      {/* 상단 글로벌 내비게이션 바 (Montage GNB) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 tracking-tight">AI·코딩 24강 완주</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span className="ml-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                STUDENT
              </span>
            </div>
          </div>

          {/* 우측 내비게이션 & 빠른 이동 버튼 그룹 */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600" aria-label="주요 메뉴">
              <a href="#roadmap" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                로드맵
              </a>
              <a href="#core-loop" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                8단계 AI 루프
              </a>
              <a href="#safety-rules" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                안전 수칙
              </a>
              <a href="#fallback-paths" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                도구 안내
              </a>
            </nav>

            <a
              href="/materials/game-ai/index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-violet-600" aria-hidden="true" />
              🎮 게임 AI 12강 트랙
            </a>

            <a
              href="#roadmap"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              내 진도 현황
            </a>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-16">
        {/* 1. 상단 히어로 & 진행률 위젯 */}
        <section id="hero-section" className="space-y-8" aria-labelledby="hero-title">
          {/* 상단 뱃지 그룹 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              REVISED CURRICULUM
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              카드 등록 없는 전액 무료 API 실습
            </span>
          </div>

          {/* 메인 타이틀 & 서브 설명 */}
          <div className="space-y-4 max-w-4xl">
            <h1 id="hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI와 함께 문제를 정의하고 해결하는<br className="hidden sm:inline" /> 24강 실전 코딩 여정
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              생성형 AI(Generative AI)의 원리를 바르게 이해하고, 웹 프로그래밍 기초부터 나만의 웹 게임과 실생활 스마트 도구, 그리고 풀스택 AI 웹앱까지 직접 만들며 배웁니다.
            </p>
          </div>

          {/* 학습 진행률 위젯 카드 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* 좌측: 진행률 상태 바 */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                    <BookOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                    내 학습 완료 진행률
                  </span>
                  <span className="text-base font-bold text-indigo-600">
                    {completedCount} / {totalLessons}강 완료 ({progressPercent}%)
                  </span>
                </div>

                {/* 프로그레스 트랙 */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200/80 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="내 학습 완료 진행률"
                  />
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  각 강의의 자가 점검 체크리스트를 100% 완료하면 다음 강의가 자동으로 해제됩니다.
                </p>
              </div>

              {/* 우측: 프라이머리 CTA 버튼 (24강 전체 완주 시 '게임 만드는 12강 바로가기'로 동적 전환) */}
              <div className="flex-shrink-0 flex items-center">
                {isAllLessonsCompleted ? (
                  <a
                    href="/materials/game-ai/index.html"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all group animate-pulse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <Gamepad2 className="w-5 h-5 text-violet-200" aria-hidden="true" />
                    <span>🎮 게임 만드는 12강 바로가기</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                ) : (
                  <a
                    href={nextUncompletedLesson?.link || '/lessons/01-ai-literacy/index.html'}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-sm hover:shadow-indigo-200 hover:shadow-md transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <span>{completedCount > 0 ? `${nextUncompletedLesson?.id || 1}강 이어하기` : '1강 시작하기'}</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. 교육 개요 메타 4구리드 카드 */}
        <section aria-labelledby="overview-meta-title">
          <h2 id="overview-meta-title" className="sr-only">
            교육과정 핵심 개요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {METADATA_CARDS.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow transition-all flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                    <IconComp className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</span>
                    <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{card.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. 핵심 경험: 8단계 AI 협업 개발 루프 파이프라인 */}
        <section id="core-loop" className="space-y-6 scroll-mt-20" aria-labelledby="core-loop-title">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              CORE COLLABORATIVE WORKFLOW
            </div>
            <h2 id="core-loop-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              8단계 AI 협업 개발 루프
            </h2>
          </div>

          {/* 안내 배너 콜아웃 */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 sm:p-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p className="font-medium">
              본 과정에서 AI의 답변은 정답지가 아니라 <strong>‘검토하고 개선해야 할 초안’</strong>입니다. 모든 학생은 매 강마다 다음의 8단계 개발 루프를 반복하며 스스로 검증하는 힘을 기릅니다.
            </p>
          </div>

          {/* 순서형 프로세스 바 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEV_LOOP_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                      <StepIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {step.step}. {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. 24강 시즌제 로드맵 카드 그리드 (상태값 시각화) */}
        <section id="roadmap" className="space-y-8 scroll-mt-20" aria-labelledby="roadmap-title">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                SEASONAL CURRICULUM
              </div>
              <h2 id="roadmap-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI·코딩 24강 시즌제 로드맵
              </h2>
              <p className="text-sm text-slate-500">
                4~6강 단위의 시즌제로 운영되며, 매 시즌마다 완성도 높은 실전 웹앱과 게임을 완성합니다.
              </p>
            </div>

            {/* 시즌 필터 탭 바 */}
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="시즌별 강의 필터">
              <button
                type="button"
                onClick={() => setSelectedSeason('all')}
                role="tab"
                aria-selected={selectedSeason === 'all'}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedSeason === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                전체 보기
              </button>
              {SEASONS.map((season) => (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => setSelectedSeason(season.trackId)}
                  role="tab"
                  aria-selected={selectedSeason === season.trackId}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    selectedSeason === season.trackId
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  시즌 {season.id} ({season.id === 1 ? '1~6강' : season.id === 2 ? '7~12강' : season.id === 3 ? '13~18강' : '19~24강'})
                </button>
              ))}
            </div>
          </div>

          {/* 각 시즌 트랙 렌더링 */}
          <div className="space-y-12">
            {filteredSeasons.map((season) => {
              const seasonLessons = lessons.filter((l) => l.seasonId === season.id);
              return (
                <div key={season.id} className="space-y-5">
                  {/* 시즌 헤더 */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-6 rounded-full bg-${season.accentColor}-600`} />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{season.title}</h3>
                        <p className="text-xs text-slate-500">{season.subtitle}</p>
                      </div>
                    </div>
                    <div>
                      {season.badgeType === 'success' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          {season.badge}
                        </span>
                      )}
                      {season.badgeType === 'progress' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          {season.badge}
                        </span>
                      )}
                      {season.badgeType === 'upcoming' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                          {season.badge}
                        </span>
                      )}
                      {season.badgeType === 'project' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <Star className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                          {season.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3열 반응형 카드 그리드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {seasonLessons.map((lesson) => {
                      const isCompleted = lesson.status === 'completed';
                      const isAvailable = lesson.status === 'available';
                      const isLocked = lesson.status === 'locked';
                      const isUpcoming = lesson.status === 'upcoming';
                      const canEnter = isAvailable || isCompleted;

                      return (
                        <article
                          key={lesson.id}
                          className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                            canEnter
                              ? 'bg-white border-2 border-indigo-200/90 shadow-sm hover:shadow-md hover:border-indigo-400'
                              : isLocked
                              ? 'bg-slate-50/70 border border-slate-200 opacity-90 hover:opacity-100 shadow-none'
                              : 'bg-slate-50/40 border border-dashed border-slate-300 opacity-80 shadow-none'
                          }`}
                        >
                          <div>
                            {/* 상단 뱃지 행 */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                {lesson.id}강
                              </span>
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                                  완료됨
                                </span>
                              )}
                              {isAvailable && !isCompleted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                                  학습 가능
                                </span>
                              )}
                              {isLocked && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                  <Lock className="w-3 h-3" aria-hidden="true" />
                                  잠김
                                </span>
                              )}
                              {isUpcoming && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                  <Clock className="w-3 h-3" aria-hidden="true" />
                                  준비 중
                                </span>
                              )}
                            </div>

                            {/* 강의 제목 & 서브 설명 */}
                            <h4 className="text-base font-bold text-slate-900 mb-1 leading-snug">{lesson.title}</h4>
                            <p className="text-xs text-indigo-600 font-semibold mb-2">{lesson.subtitle}</p>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4">{lesson.description}</p>

                            {/* 태그 리스트 */}
                            {lesson.tags && (
                              <div className="flex flex-wrap gap-1 mb-6">
                                {lesson.tags.map((tag, tIdx) => (
                                  <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 하단 액션 버튼 */}
                          <div>
                            {canEnter ? (
                              <a
                                href={lesson.link || '#'}
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              >
                                <span>{isCompleted ? `${lesson.id}강 복습하기` : `${lesson.id}강 시작하기`}</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed border border-slate-200 flex items-center justify-center gap-1.5"
                              >
                                {isLocked && <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
                                <span>{lesson.unlockCondition || '오픈 예정'}</span>
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. 안전 수칙 및 윤리 가이드라인 (4대 원칙 카드) */}
        <section id="safety-rules" className="space-y-6 scroll-mt-20" aria-labelledby="safety-rules-title">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              SAFETY &amp; ETHICS GUIDELINES
            </div>
            <h2 id="safety-rules-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              안전 수칙 및 윤리 가이드라인 (Safety &amp; Ethics)
            </h2>
            <p className="text-sm text-slate-500">
              안전하고 신뢰할 수 있는 개발을 위해 모든 학생이 준수해야 하는 4대 기본 원칙입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ETHICS_CARDS.map((item, idx) => {
              const EthIcon = item.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border ${item.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${item.iconBg}`}>
                      <EthIcon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className={`text-[11px] font-bold ${item.tagColor}`}>원칙: {item.principle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. 정형 데이터 테이블 2종 (가로 스크롤 대응) */}
        <section className="space-y-12">
          {/* 테이블 1: 도구 선택지 및 오프라인 대체 경로 */}
          <div id="fallback-paths" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                FALLBACK PATHS
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                도구 선택지 및 오프라인 대체 경로 (Fallback Paths)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                학교 실습실의 보안 방화벽이나 네트워크 제약 환경에서도 100% 정상 실습이 가능하도록 대체 경로를 기본 제공합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-5">구분</th>
                      <th scope="col" className="py-3.5 px-5">기본 권장 도구</th>
                      <th scope="col" className="py-3.5 px-5">설치/네트워크 불가 시 대체 경로</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {FALLBACK_TOOLS_DATA.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                        <th scope="row" className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                          {row.category}
                        </th>
                        <td className="py-3.5 px-5">{row.recommended}</td>
                        <td className="py-3.5 px-5 text-slate-600">{row.fallback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. 하단 푸터 (Footer) */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">AI·코딩 24강 실전 교육과정</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Wanted Montage
                </span>
              </div>
              <p className="text-slate-500">
                본 교재는 웹 표준과 웹 접근성(WCAG 2.1 AA)을 준수하며 Wanted Montage Design System 기반으로 제작되었습니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <a href="#roadmap" className="hover:text-indigo-600 transition-colors">
                로드맵
              </a>
              <a href="#core-loop" className="hover:text-indigo-600 transition-colors">
                8단계 루프
              </a>
              <a href="#safety-rules" className="hover:text-indigo-600 transition-colors">
                안전 수칙
              </a>
              <a href="#fallback-paths" className="hover:text-indigo-600 transition-colors">
                도구 안내
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseHome;
