import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Search,
  Target,
  Bot,
  Code2,
  PlayCircle,
  Bug,
  Lock,
  Unlock,
  Eye,
  Info,
  Clock,
  MessageSquare,
  Terminal,
  Zap,
  Sliders,
  Send,
  Trophy,
  Medal,
  CheckSquare,
  FileCheck,
  PartyPopper,
  SlidersHorizontal,
  Compass,
  Cpu,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 2강 전용 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'builder' | 'quiz_card' | 'checklist';
export type ThemeKey = 'fantasy' | 'cyberpunk' | 'magic_school';

export interface ThemePromptData {
  name: string;
  badge: string;
  goal: string;
  audience: string;
  constraints: string;
  output: string;
}

export interface ExperimentNoteData {
  diff1_2: string;
  diff3_format: string;
  diff4_usability: string;
  coreRule: string;
}

export interface MissionReportData {
  topic: string;
  draftPrompt: string;
  flaw1: string;
  flaw2: string;
  improvedPrompt: string;
  finalResult: string;
}

export interface RetrospectiveData {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

/**
 * ------------------------------------------------------------------------------
 * 인터랙티브 프롬프트 조립기 3개 테마 데이터
 * ------------------------------------------------------------------------------
 */
const BUILDER_THEMES: Record<ThemeKey, ThemePromptData> = {
  fantasy: {
    name: '조선 판타지 비주얼 노벨',
    badge: '장영실 비밀 공방',
    goal: '너는 판타지 비주얼 노벨의 전문 스토리 기획자야. 조선 전기 세종대왕 시대와 마법 기술이 공존하는 독창적인 퓨전 판타지 게임 세계관을 기획해 줘.',
    audience: '[대상 독자]\n중학교 2학년 학생들이 흥미진진하게 몰입할 수 있도록 역사적 사실과 판타지 요소를 친근하고 명확한 문체로 설명해 줘.',
    constraints: '[세부 조건]\n1. 주인공은 장영실의 비밀 공방에서 마법 기계 \'자격루\'를 다루는 견습 마법공학자로 설정할 것.\n2. 낮에는 천문 관측 의기를 정밀 측정하고, 밤에는 그림자 요괴를 퇴치하는 이중 생활 갈등을 다룰 것.\n3. 실제 역사적 배경 50%와 판타지 상상력 50%를 조화롭게 융합할 것.',
    output: '[출력 형식]\n1) 세계관 1줄 요약\n2) 주인공 캐릭터 시트 (이름, 나이, 특기, 비밀 무기)\n3) 1화 오프닝 장면 대본 (등장인물 대사와 배경 지문)'
  },
  cyberpunk: {
    name: '사이버펑크 SF 탐정',
    badge: '네오 서울 AI 해커',
    goal: '너는 네오 서울을 배경으로 하는 사이버펑크 추리 게임의 시나리오 작가야. 인공지능 해커와 안드로이드 탐정이 활약하는 미스터리 사건을 기획해 줘.',
    audience: '[대상 독자]\nSF와 추리물을 좋아하는 청소년과 코딩 입문자가 쉽게 이해할 수 있도록 어려운 공학 용어는 비유를 곁들여 흥미롭게 설명해 줘.',
    constraints: '[세부 조건]\n1. 주인공은 인간 두뇌를 가진 사이버 탐정과 메모리를 잃어버린 AI 조수 콤비로 구성할 것.\n2. 중앙 데이터 타워에서 삭제된 \'금지된 코드\'를 추적하는 사건을 뼈대로 삼을 것.\n3. 플레이어가 3가지 증거 중 하나를 선택해 범인을 지목할 수 있는 분기 구조를 마련할 것.',
    output: '[출력 형식]\n1) 사건 개요 및 배경 설정\n2) 탐정 콤비 캐릭터 프로필\n3) 범행 현장 조사 단서 목록 (3가지 핵심 증거)'
  },
  magic_school: {
    name: '별빛 마법학원 어드벤처',
    badge: '마법 코딩 연구회',
    goal: '너는 마법 판타지 웹소설 작가야. 코딩 알고리즘의 원리가 고대 마법 주문으로 발현되는 신비로운 \'별빛 아카데미\'의 1학기 배경 설정을 창작해 줘.',
    audience: '[대상 독자]\n코딩을 처음 접하는 초·중학생들이 루프(반복문)와 조건문 개념을 마법 주문처럼 재미있게 배울 수 있도록 유쾌한 톤으로 서술해 줘.',
    constraints: '[세부 조건]\n1. 신입생들이 마법 지팡이 대신 \'룬 스크립트 단말기\'를 다루는 수업 장면을 묘사할 것.\n2. 잘못된 반복문 마법을 시전해 마법 도서관의 책들이 무한 증식하는 해프닝 에피소드를 포함할 것.\n3. 등장인물은 열혈 코딩 마법사 주인공과 원리주의자 우등생 라이벌로 대비시킬 것.',
    output: '[출력 형식]\n1) 아카데미 3대 학칙 요약\n2) 마법 코딩 필수 주문 2종 (주문명, 코딩 원리, 효과)\n3) 무한 반복문 도서관 소동 사건 일지'
  }
};

/**
 * ------------------------------------------------------------------------------
 * 4단계 비교 실험용 프롬프트 데이터
 * ------------------------------------------------------------------------------
 */
const EXPERIMENT_PROMPTS = [
  {
    step: '1단계',
    title: '모호한 프롬프트 (조건 없음)',
    desc: '조건, 대상, 형식 없이 던진 지시',
    content: '역사 퀴즈 내줘.',
    analysis: '넌센스 퀴즈 1문제 혹은 너무 쉬운 단답형 퀴즈가 무작위로 출력됨. 학년이나 난이도 기준이 없어 학습용으로 사용 불가능.'
  },
  {
    step: '2단계',
    title: '역할과 목적 및 대상 추가',
    desc: '누가 누구를 위해 출제하는지 명시',
    content: `너는 중학교 역사 교사야.
중학교 2학년 학생이 조선 전기 세종대왕의 업적을 복습할 수 있는 객관식 퀴즈를 출제해 줘.`,
    analysis: '주제와 난이도가 중2 수준에 맞춰짐. 하지만 문항 수, 보기 개수 등이 지정되지 않아 AI 마음대로 1~2문제만 출제함.'
  },
  {
    step: '3단계',
    title: '구체적 제약 조건 추가',
    desc: '문항 수, 보기 수, 오답 설계 명시',
    content: `너는 중학교 역사 교사야.
중학교 2학년 학생이 조선 전기 세종대왕의 업적을 복습할 수 있는 4지선다형 객관식 퀴즈 5문항을 출제해 줘.
- 각 문항마다 오답 보기 3개는 학생들이 흔히 헷갈리는 유사 역사적 사실(예: 장영실, 정조 등)로 구성할 것.
- 5문항 모두 정답과 해설을 포함할 것.`,
    analysis: '5문항 4지선다형으로 완벽히 통제됨. 그러나 문제 바로 밑에 정답과 해설이 붙어 나와, 학생이 스스로 풀어보기 전에 답이 스포일러됨.'
  },
  {
    step: '4단계',
    title: '완성형 프롬프트 (출력 형식 분리)',
    desc: '정답과 해설을 하단 표로 완벽히 분리',
    content: `너는 중학교 역사 교사야.
중학교 2학년 학생이 조선 전기 세종대왕의 업적을 복습할 수 있는 4지선다형 객관식 퀴즈 5문항을 출제해 줘.
- 각 문항마다 오답 보기 3개는 학생들이 흔히 헷갈리는 유사 역사적 사실로 정교하게 구성할 것.

[출력 형식]
1. 1~5번 문제는 보기(①, ②, ③, ④)만 먼저 나열하고 정답은 절대 표시하지 말 것.
2. 모든 문제가 끝난 뒤 맨 아래에 마크다운 표(Table)로 [문항 번호 | 정답 | 핵심 해설 | 오답 함정 피하는 법]을 분리하여 제시할 것.`,
    analysis: '문제지와 정답지가 완벽히 분리되어 스스로 문제를 풀어본 뒤 채점할 수 있는 온전한 시험지(워킹 시트) 형태로 완성됨!'
  }
];

/**
 * ------------------------------------------------------------------------------
 * 5문항 퀴즈 출제 표준 템플릿
 * ------------------------------------------------------------------------------
 */
const STANDARD_PROMPT_TEMPLATE = `너는 [전문가 역할, 예: 중학교 과학교사]야.
[대상 독자, 예: 중학교 2학년 학생]이 [학습 주제, 예: 소화 기관과 영양소 흡수]를 복습할 수 있는 4지선다형 객관식 퀴즈 5문항을 출제해 줘.

[세부 제약 조건]
1. 각 문항은 실생활 시나리오나 관찰 상황을 2줄 이내로 제시하고 물어볼 것.
2. 오답 보기 3개는 학생들이 흔히 갖는 오개념을 반영하여 매력적인 함정으로 만들 것.
3. 문제 지문에는 정답에 대한 힌트나 단서를 노출하지 말 것.

[출력 형식]
- 1번부터 5번까지 문제를 먼저 제시할 것 (보기 ①~④ 포함, 정답 미표시).
- 문제 목록이 끝난 후 맨 아래에 마크다운 표로 [번호 | 정답 | 정답 이유 | 가장 헷갈리는 오답 해설]을 정리해 줄 것.`;

/**
 * ------------------------------------------------------------------------------
 * AI 학생 페르소나 테스트 프롬프트
 * ------------------------------------------------------------------------------
 */
const PERSONA_TEST_PROMPT = `너는 방금 [학습 주제]를 배운 평범한 중학교 2학년 학생 페르소나야.
아래 5문항 퀴즈를 학생 입장에서 진지하게 풀어보고, 다음 질문에 솔직하게 답해 줘:

1. 각 문제(1~5번)에서 네가 선택한 답은 무엇이고, 왜 그 답을 골랐는지 생각 과정을 설명해 줘.
2. 문제 중에서 보기가 너무 엉뚱해서 보자마자 탈락시킨 보기가 있었니? (문항 번호와 보기 번호 명시)
3. 지문이나 보기에서 표현이 애매하거나 헷갈렸던 문장이 있었니?

[검증할 5문항 퀴즈 붙여넣기]`;

/**
 * ------------------------------------------------------------------------------
 * 자가 점검 체크리스트 6개 항목 데이터
 * ------------------------------------------------------------------------------
 */
const CHECKLIST_ITEMS = [
  { id: 'chk_c1', text: '프롬프트 4대 핵심 요소(목적, 대상, 조건, 출력 형식)의 의미와 역할을 이해했다.' },
  { id: 'chk_c2', text: '1단계부터 4단계까지의 비교 프롬프트를 전송하고 실험 관찰 기록을 작성·저장했다.' },
  { id: 'chk_c3', text: '나만의 관심 주제로 5문항 퀴즈 출제 프롬프트를 작성하여 AI에 전송했다.' },
  { id: 'chk_c4', text: 'AI 페르소나 시뮬레이션 또는 자체 진단 루브릭을 통해 퀴즈의 결함 2가지를 찾았다.' },
  { id: 'chk_c5', text: '결함을 보완하는 개선 프롬프트를 작성하여 최종 5문항 퀴즈 세트를 완성했다.' },
  { id: 'chk_c6', text: '하단의 회고(Retrospective) 양식을 작성하고 브라우저에 저장했다.' }
];

export const Lesson02: React.FC = () => {
  // 4단계 퀘스트 스텝퍼 활성 상태 ('stage1' | 'stage2' | 'stage3' | 'stage4')
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');

  // 우측 고정형 실습 콘솔 탭 활성 상태 ('builder' | 'quiz_card' | 'checklist')
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('builder');

  // 조립기 테마 선택 상태
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('fantasy');

  // 조립기 4대 기둥 체크 상태
  const [builderChecks, setBuilderChecks] = useState({
    goal: true,
    audience: true,
    constraints: true,
    output: true
  });

  // 복사 피드백 상태 (복사된 버튼 식별자)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 단계별 힌트 아코디언 상태
  const [openHints, setOpenHints] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false
  });

  // 실험 관찰 기록 상태
  const [expNote, setExpNote] = useState<ExperimentNoteData>({
    diff1_2: '1단계는 넌센스 퀴즈 1문제가 무작위로 나왔는데, 2단계는 중학생 역사 주제로 범위가 좁혀졌습니다.',
    diff3_format: '4지선다형 객관식 5문항으로 규격화되었으나 여전히 문제 바로 밑에 답이 나와 스포일러가 되었습니다.',
    diff4_usability: '정답과 해설이 하단 표로 완벽히 분리되어 스스로 답을 가리고 문제를 풀어볼 수 있게 되었습니다.',
    coreRule: '원하는 결과물의 시각적 배치(출력 형식)까지 구체적으로 지시해야 온전한 결과물이 나온다는 것을 배웠습니다.'
  });

  // 미션 보고서 상태
  const [missionData, setMissionData] = useState<MissionReportData>({
    topic: '중학교 2학년 파이썬 기초 변수와 자료형',
    draftPrompt: '파이썬 변수 퀴즈 5개 내줘.',
    flaw1: '문전문법이 너무 단순하여 단순 암기식이었고 보기가 엉성함.',
    flaw2: '정답이 문제 바로 밑에 노출되어 시험지로서 풀 수가 없음.',
    improvedPrompt: `너는 파이썬 코딩 강사야. 중학교 2학년 학생이 변수와 자료형을 복습할 수 있도록 4지선다 객관식 5문항을 출제해 줘.
- 문제에 간단한 2줄 코드 예시를 포함할 것.
- 문제는 1~5번 목록으로 제시하고, 정답 및 해설은 맨 아래 마크다운 표로 분리할 것.`,
    finalResult: '문제 5개와 하단 정답/해설 표가 깔끔하게 분리된 실전형 코딩 퀴즈 완성'
  });

  // 회고록 상태
  const [retroData, setRetroData] = useState<RetrospectiveData>({
    q1: '출력 형식을 표로 명시하지 않으면 정답이 문제 밑에 바로 스포일러된다는 점을 알게 되어 형식이 매우 중요하다고 느꼈습니다.',
    q2: 'AI가 처음에는 해설을 너무 짧게 써서, 프롬프트에 \'정답 이유와 오답 1개 이유를 포함하라\'는 제약 조건을 추가하여 해결했습니다.',
    q3: '3번 문항의 4번 보기가 너무 엉뚱해서 초등학생도 맞힐 수 있을 정도여서, 교과서에 나오는 유사 개념으로 보기를 직접 수정했습니다.',
    q4: '앞으로 AI에 질문할 때 무작정 질문하지 않고 목적-대상-조건-형식을 메모장에 먼저 정리한 뒤 질문하는 습관을 들이겠습니다.'
  });

  // 자가 점검 체크리스트 상태
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    chk_c1: false,
    chk_c2: false,
    chk_c3: false,
    chk_c4: false,
    chk_c5: false,
    chk_c6: false
  });

  // 자동 저장 상태 피드백
  const [noteSaved, setNoteSaved] = useState<boolean>(true);

  // 로컬 스토리지 복원
  useEffect(() => {
    try {
      const savedExp = localStorage.getItem('lesson02_exp_note');
      if (savedExp) setExpNote(JSON.parse(savedExp));

      const savedMission = localStorage.getItem('lesson02_mission_data');
      if (savedMission) setMissionData(JSON.parse(savedMission));

      const savedRetro = localStorage.getItem('lesson02_retro_data');
      if (savedRetro) setRetroData(JSON.parse(savedRetro));

      const savedChecks = localStorage.getItem('lesson02_checklist');
      if (savedChecks) setCheckedItems(JSON.parse(savedChecks));
    } catch {
      // 로컬스토리지 접근 제한 환경 예외 처리
    }
  }, []);

  // 조립기 점수 계산 (0, 25, 50, 75, 100)
  const activePillarCount = useMemo(() => {
    return Object.values(builderChecks).filter(Boolean).length;
  }, [builderChecks]);
  const builderScore = activePillarCount * 25;

  // 조립된 프롬프트 텍스트 실시간 생성
  const assembledPrompt = useMemo(() => {
    const t = BUILDER_THEMES[currentTheme];
    const parts: string[] = [];
    if (builderChecks.goal) parts.push(t.goal);
    if (builderChecks.audience) parts.push(t.audience);
    if (builderChecks.constraints) parts.push(t.constraints);
    if (builderChecks.output) parts.push(t.output);
    return parts.join('\n\n');
  }, [currentTheme, builderChecks]);

  // 체크리스트 진행률
  const checkedCount = useMemo(() => {
    return Object.values(checkedItems).filter(Boolean).length;
  }, [checkedItems]);
  const progressPercent = Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100);
  const isAllChecked = checkedCount === CHECKLIST_ITEMS.length;

  // 프롬프트 클립보드 1-Click 복사
  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  // 체크리스트 토글
  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('lesson02_checklist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // 실험 관찰 기록 필드 변경
  const handleExpChange = (field: keyof ExperimentNoteData, val: string) => {
    setExpNote((prev) => {
      const next = { ...prev, [field]: val };
      try {
        localStorage.setItem('lesson02_exp_note', JSON.stringify(next));
      } catch {}
      return next;
    });
    setNoteSaved(false);
    setTimeout(() => setNoteSaved(true), 500);
  };

  // 미션 보고서 필드 변경
  const handleMissionChange = (field: keyof MissionReportData, val: string) => {
    setMissionData((prev) => {
      const next = { ...prev, [field]: val };
      try {
        localStorage.setItem('lesson02_mission_data', JSON.stringify(next));
      } catch {}
      return next;
    });
    setNoteSaved(false);
    setTimeout(() => setNoteSaved(true), 500);
  };

  // 회고록 필드 변경
  const handleRetroChange = (field: keyof RetrospectiveData, val: string) => {
    setRetroData((prev) => {
      const next = { ...prev, [field]: val };
      try {
        localStorage.setItem('lesson02_retro_data', JSON.stringify(next));
      } catch {}
      return next;
    });
    setNoteSaved(false);
    setTimeout(() => setNoteSaved(true), 500);
  };

  // 마크다운 내보내기 다운로드
  const handleExportMarkdown = () => {
    const md = `# [2강 5문항 퀴즈 출제 프롬프트 검증 카드 및 회고록]
- 작성일시: ${new Date().toLocaleString('ko-KR')}
- 학습 단위: 시즌 1 · 2강 — 좋은 질문이 좋은 결과를 만든다 (G-A-C-O 프레임워크)
- 검증 상태: PROMPT CRAFTSMAN CERTIFIED (완성도 ${builderScore}점)

---

## 1. 나만의 5문항 퀴즈 출제 보고서
- **출제 대상 주제**: ${missionData.topic}
- **수정 전 초안 프롬프트**:
> ${missionData.draftPrompt}

- **발견된 결함 1**: ${missionData.flaw1}
- **발견된 결함 2**: ${missionData.flaw2}

- **최종 개선된 G-A-C-O 프롬프트**:
\`\`\`
${missionData.improvedPrompt}
\`\`\`

- **최종 검증 결과**:
> ${missionData.finalResult}

---

## 2. 실험 관찰 및 핵심 규칙 기록
1. **1단계 vs 2단계 차이점**: ${expNote.diff1_2}
2. **3단계에서 발견된 형식 문제**: ${expNote.diff3_format}
3. **4단계 출력 형식 분리의 효과**: ${expNote.diff4_usability}
4. **내가 발견한 프롬프트 절대 규칙**: ${expNote.coreRule}

---

## 3. 오늘 학습 회고록 (Retrospective)
1. **오늘 새롭게 배운 점이나 흥미로웠던 개념**:
   ${retroData.q1}

2. **실습 중 마주친 오류나 막혔던 점과 해결 방법**:
   ${retroData.q2}

3. **AI 답변 중 비판적으로 거절하거나 수정한 내용**:
   ${retroData.q3}

4. **다음 수업이나 일상에서 시도해보고 싶은 점**:
   ${retroData.q4}

---
*본 문서는 AI·코딩 24강 LMS 워크스페이스에서 발행되었습니다.*`;

    downloadFile(md, 'lesson-02-quiz-prompt-badge.md', 'text/markdown;charset=utf-8;');
  };

  // JSON 내보내기 다운로드
  const handleExportJSON = () => {
    const obj = {
      lessonId: 'lesson_02',
      title: '2강 — 좋은 질문이 좋은 결과를 만든다',
      issuedAt: new Date().toISOString(),
      builderScore,
      currentTheme,
      builderChecks,
      missionData,
      expNote,
      retroData,
      checklistProgress: `${checkedCount}/${CHECKLIST_ITEMS.length}`,
      isCompleted: isAllChecked
    };
    downloadFile(JSON.stringify(obj, null, 2), 'lesson-02-prompt-craft.json', 'application/json;charset=utf-8;');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 점수 바 색상 및 너비 클래스 매핑 (0 inline style)
  const getScoreWidthClass = (score: number) => {
    switch (score) {
      case 25: return 'w-1/4 bg-rose-500';
      case 50: return 'w-2/4 bg-amber-500';
      case 75: return 'w-3/4 bg-sky-500';
      case 100: return 'w-full bg-emerald-500';
      default: return 'w-0 bg-slate-300';
    }
  };

  const getProgressWidthClass = (count: number) => {
    switch (count) {
      case 1: return 'w-1/6';
      case 2: return 'w-2/6';
      case 3: return 'w-3/6';
      case 4: return 'w-4/6';
      case 5: return 'w-5/6';
      case 6: return 'w-full';
      default: return 'w-0';
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans text-base sm:text-lg leading-relaxed selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. 상단 글로벌 GNB & 4단계 퀘스트 스텝퍼 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 flex-none bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 좌측: 과정 홈 링크 & 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
            <span className="w-1 h-3 bg-slate-200 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                시즌 1 · 2강
              </span>
              <span className="text-sm font-bold text-slate-900 truncate">
                좋은 질문이 좋은 결과를 만든다
              </span>
            </div>
          </div>

          {/* 중앙: 4단계 퀘스트 스텝퍼 탭 */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage1'}
              onClick={() => setActiveStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
              <span>브리핑</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage2'}
              onClick={() => setActiveStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>G-A-C-O 두뇌 해부</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage3'}
              onClick={() => setActiveStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
              <span>4단계 비교 실험</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage4'}
              onClick={() => setActiveStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
              <span>미션 &amp; 회고</span>
            </button>
          </nav>

          {/* 우측: 2강 진행률 & 3강 언락 상태 뱃지 */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold block">진척도</span>
                <span className="text-xs text-indigo-600 font-bold">{checkedCount}/6 ({progressPercent}%)</span>
              </div>
              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 p-0.5">
                <div
                  className={`bg-indigo-600 h-full rounded-full transition-all duration-300 ${getProgressWidthClass(
                    checkedCount
                  )}`}
                />
              </div>
            </div>

            {isAllChecked ? (
              <a
                href="/lessons/03-story-branch/index.html"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 animate-pulse transition-all whitespace-nowrap"
              >
                <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>3강 언락!</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>3강 잠김</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. 메인 2-패널 스플릿 뷰 워크스페이스 */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* ======================================================================= */}
        {/* ■ 좌측 패널 (60% 폭) - 동적 퀘스트 콘텐츠 영역 (독립 스크롤) */}
        {/* ======================================================================= */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ===================================================================== */}
          {/* STAGE 1: 미션 브리핑 & 성공 기준 */}
          {/* ===================================================================== */}
          {activeStage === 'stage1' && (
            <section className="space-y-6" aria-labelledby="stage1-heading">
              {/* 히어로 헤더 카드 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>비밀 주문서 만들기 · G-A-C-O 4가지 황금 열쇠</span>
                </div>

                <div className="space-y-2">
                  <h1 id="stage1-heading" className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    2강 — 좋은 질문이 좋은 결과를 만든다
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                    AI에게 "대충 알아서 해줘"라고 부탁하면 엉뚱한 답을 내놓지만, 목적(소원)·대상(친구 눈높이)·규칙(안전 울타리)·모양(선물 상자) 4가지 황금 열쇠를 주면 천재 조수가 됩니다! 나만의 비밀 주문서(G-A-C-O)로 친구들이 깜짝 놀랄 5문항 탐정 퀴즈 세트를 만들어볼까요?
                  </p>
                </div>

                {/* 메타 4구리드 칩 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">학습 속도</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">자기 페이스</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">실습 도구</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">브라우저 &amp; 무료 AI</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">사전 요구지식</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">1강 팩트체크</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">오늘의 결과물</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">5문항 퀴즈 세트</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4대 성공 기준 루브릭 표 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">오늘 완성할 결과물과 4대 성공 기준</h2>
                    <p className="text-xs text-slate-500">
                      단순 질의응답을 넘어, 정답이 바로 스포일러되지 않고 학습자가 직접 풀 수 있는 <strong>‘실전형 5문항 객관식 퀴즈 세트’</strong>를 완성합니다.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm sm:text-base border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-sm sm:text-base">
                        <th className="py-3.5 px-4 w-1/4">평가 영역</th>
                        <th className="py-3 px-4">성공 기준 <span className="block text-xs font-normal text-slate-500 mt-0.5">(Success Criteria)</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">1. 목적·대상 구체화</th>
                        <td className="py-3.5 px-4">AI의 역할(전문가 페르소나)과 문제를 풀 대상 독자(예: 중2 학생)를 명확히 제시했는가?</td>
                      </tr>
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">2. 제약 조건 구체화</th>
                        <td className="py-3.5 px-4">문항 수(5문항), 보기 수(4지선다), 오답 설계(매력적인 오답 함정) 조건을 구체적으로 명시했는가?</td>
                      </tr>
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">3. 스포일러 방지 형식</th>
                        <td className="py-3.5 px-4">문제와 정답/해설을 완전히 분리하고, 정답표를 맨 아래 마크다운 표(Table)로 출력하도록 통제했는가?</td>
                      </tr>
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">4. 퀴즈 품질 자체 검증</th>
                        <td className="py-3.5 px-4">AI 수험자 페르소나 시뮬레이션을 통해 결함 2가지를 발견하고 최종 개선 프롬프트를 완성했는가?</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 실습 로드맵 안내 박스 */}
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-amber-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>실습 로드맵: 우측 콘솔은 언제 사용하나요?</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-normal">
                  본문 가이드를 읽으면서 우측 고정 콘솔을 단계별로 전환해 보세요. 4대 기둥을 직접 조립하고, 나만의 퀴즈 카드를 완성할 수 있습니다!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>① [프롬프트 조립기]</span>
                    </h4>
                    <p className="text-slate-600">Stage 2 학습 중, 4대 기둥을 토글하며 완성도 점수를 100점으로 끌어올립니다.</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>② [퀴즈 검증 카드]</span>
                    </h4>
                    <p className="text-slate-600">Stage 3 비교 실험 후, 내가 만든 5문항 퀴즈 출제 개선 보고서를 실시간 작성합니다.</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>③ [체크리스트]</span>
                    </h4>
                    <p className="text-slate-600">Stage 4 회고를 마치고 6대 기준을 점검하여 다음 3강 잠금을 해제합니다.</p>
                  </div>
                </div>
              </div>
              {/* 하단 다음 단계 이동 버튼 */}
              <div className="flex justify-end items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 G-A-C-O 두뇌 해부</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* STAGE 2: G-A-C-O 프레임워크 & 핵심 개념 */}
          {/* ===================================================================== */}
          {activeStage === 'stage2' && (
            <section className="space-y-6" aria-labelledby="stage2-heading">
              {/* 4대 핵심 기둥 Bento Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 id="stage2-heading" className="text-lg sm:text-xl font-bold text-slate-900">
                      프롬프트 4대 핵심 기둥 (G-A-C-O 프레임워크)
                    </h2>
                    <p className="text-xs text-slate-500">
                      좋은 프롬프트는 우연히 만들어지지 않아요! 소원(G), 친구(A), 규칙(C), 포장(O) 4가지 황금 열쇠를 갖추면 AI가 내 마음을 100% 알아채고 완벽하게 일해줍니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* G - Goal */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 hover:border-indigo-400 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shadow-sm">G</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">목적 (Goal)</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">무엇을 달성하고 싶은가?</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      AI에게 부여할 명확한 역할(페르소나)과 궁극적으로 해결해야 할 핵심 과제를 한 문장으로 지시합니다. (예: "너는 중학교 역사 교사야...")
                    </p>
                  </div>

                  {/* A - Audience */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 hover:border-indigo-400 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-sky-600 text-white text-xs font-extrabold flex items-center justify-center shadow-sm">A</span>
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">대상 (Audience)</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">누구를 위한 결과물인가?</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      결과물을 소비할 대상 독자의 연령, 이해도, 배경지식을 규정합니다. 이에 따라 어조와 사용 어휘 수준이 결정됩니다.
                    </p>
                  </div>

                  {/* C - Constraints */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 hover:border-indigo-400 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center shadow-sm">C</span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">조건 (Constraints)</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">어떤 제한과 규칙을 지켜야 하는가?</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      문항 수(5문항), 보기 수(4지선다), 난이도, 포함/배제할 요소 등 하지 말아야 할 것(Negative Constraints)을 명확히 설정합니다.
                    </p>
                  </div>

                  {/* O - Output */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 hover:border-indigo-400 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center shadow-sm">O</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">형식 (Output)</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">어떤 모양으로 배치할 것인가?</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      결과물의 시각적 구조를 지정합니다. 문제와 정답을 분리하여 하단 마크다운 표로 정리하게 하는 것이 스포일러 방지의 핵심입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 긴 글이 무조건 좋을까? 인포그래픽 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">말이 너무 길어지면 AI도 헷갈려요! (수다쟁이 함정)</h3>
                    <p className="text-xs text-slate-500">길게 쓰기만 한다고 좋은 프롬프트가 아닙니다. 장황한 설명은 오히려 AI의 핵심 집중도를 떨어뜨립니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs sm:text-sm">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      <span>피해야 할 프롬프트 (중언부언 장문)</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-mono bg-white p-3 rounded-lg border border-rose-100">
                      "안녕 AI야! 내가 오늘 역사 공부를 하는데 세종대왕이 너무 대단한 것 같아. 그래서 퀴즈를 좀 풀고 싶은데 너무 어렵지도 않고 너무 쉽지도 않게 잘 생각해보고 역사에 나오는 것들 위주로 좀 길고 자세하게 재미있게 문제 좀 내줘..."
                    </p>
                    <p className="text-xs text-rose-700 font-medium">→ 명확한 조건이 없어 AI가 핵심을 파악하지 못하고 임의로 대답함.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>권장 프롬프트 (구조화된 G-A-C-O)</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-mono bg-white p-3 rounded-lg border border-emerald-100">
                      "너는 중2 역사 교사야. 세종대왕 업적 객관식 5문항 출제해 줘.<br />
                      - 4지선다형, 오답은 매력적인 역사적 사실 포함.<br />
                      - 출력: 문제는 보기만 제시, 정답/해설은 맨 아래 표로 분리."
                    </p>
                    <p className="text-xs text-emerald-800 font-medium">→ 짧지만 4대 기둥이 명확하여 정확하고 일관된 고품질 출제 완료!</p>
                  </div>
                </div>
              </div>

              {/* 우측 콘솔 조립기 유도 배너 */}
                            {/* 우측 프롬프트 조립기 연동 알림 카드 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-cyan-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                    ACTION REQUIRED · 1단계 실습 미션
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      지금 우측 콘솔의 [프롬프트 조립기]를 시작하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 프롬프트 3대 기둥(역할, 목표, 제약)을 직접 조립할 차례입니다. 우측 콘솔의 <strong>[프롬프트 조립기]</strong>에서 기둥을 하나씩 켜고 끄면서 점수가 100점으로 완성되는 과정을 확인하고 완성된 프롬프트를 복사해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('builder')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [프롬프트 조립기] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

                <div className="grid grid-cols-1 gap-4 pt-1">
                  {EXPERIMENT_PROMPTS.map((p, idx) => {
                    const isCopied = copiedId === `exp_${idx}`;
                    return (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 hover:border-indigo-400 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{p.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.content, `exp_${idx}`)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              isCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>복사됨!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>복사하기</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {p.content}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal flex items-start gap-1.5">
                          <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span><strong>예상 반응:</strong> {p.analysis}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 단계별 비교 분석 표 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">단계별 예상 결과 및 특징 분석 가이드</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm sm:text-base border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-sm sm:text-base">
                        <th className="py-3.5 px-4 w-28 whitespace-nowrap font-bold">단계</th>
                        <th className="py-3.5 px-4 font-bold text-xs sm:text-sm whitespace-nowrap">사용한 프롬프트 유형</th>
                        <th className="py-3.5 px-4 font-bold text-xs sm:text-sm">예상 관찰 결과 및 응답 특성</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          1단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(기본)</span>
                        </th>
                        <td className="py-3.5 px-4 font-medium">모호한 단문 질문</td>
                        <td className="py-3.5 px-4">넌센스 퀴즈 1문제 혹은 너무 쉬운 단답형 질문 무작위 출력</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          2단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(목적·대상)</span>
                        </th>
                        <td className="py-3.5 px-4 font-medium">역할과 대상 규정</td>
                        <td className="py-3.5 px-4">중2 수준의 역사 문제로 좁혀지나, 문항 수와 형태가 제각각</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          3단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(조건 추가)</span>
                        </th>
                        <td className="py-3.5 px-4 font-medium">5문항 4지선다 지정</td>
                        <td className="py-3.5 px-4">형식은 갖추었으나 문제 바로 밑에 답이 적혀 스포일러 발생</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          4단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(형식 완성)</span>
                        </th>
                        <td className="py-3.5 px-4 font-medium">출력 형식 완벽 분리</td>
                        <td className="py-3.5 px-4">문제지와 하단 정답/해설 표가 분리되어 완벽한 시험지 완성</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 오류 연구소 (단골 실수 3선과 해결 방안) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">오류 연구소: AI 퀴즈 출제 시 단골 실수 3선</h3>
                    <p className="text-xs text-slate-500">학생들이 프롬프트를 작성할 때 가장 많이 겪는 문제와 명쾌한 해결 방안입니다.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>증상 1: 정답이 문제 바로 밑에 나와 스스로 풀어볼 수 없어요</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />해결 방안:</span> [출력 형식] 조건에 <em>"정답과 해설은 문제 영역에 표시하지 말고 맨 아래 마크다운 표로 따로 분리할 것"</em>이라고 명시하세요.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>증상 2: 오답 보기가 너무 엉뚱해서 초등학생도 맞힐 수 있어요</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />해결 방안:</span> [제약 조건]에 <em>"오답 보기는 학생들이 흔히 헷갈리는 유사 개념이나 그럴듯한 오개념으로 구성하라"</em>는 지침을 추가하세요.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>증상 3: 너무 지엽적인 연도나 수치만 외우게 하는 문제가 나와요</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />해결 방안:</span> [목적]에 <em>"단순 암기 대신 개념의 작동 원리나 역사적 의의를 묻는 사고력 중심 문항을 출제하라"</em>고 조건을 명시하세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 실험 관찰 기록 양식 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">실험 관찰 기록 양식</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{noteSaved ? '자동 저장됨' : '저장 중...'}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="diff1_2" className="block text-xs font-bold text-slate-700 mb-1">
                      1. 1단계(모호)와 2단계(목적·대상) 답변의 가장 큰 차이점은?
                    </label>
                    <input
                      id="diff1_2"
                      type="text"
                      value={expNote.diff1_2}
                      onChange={(e) => handleExpChange('diff1_2', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="diff3_format" className="block text-xs font-bold text-slate-700 mb-1">
                      2. 3단계에서 규격은 좋아졌지만 여전히 불편했던 점은?
                    </label>
                    <input
                      id="diff3_format"
                      type="text"
                      value={expNote.diff3_format}
                      onChange={(e) => handleExpChange('diff3_format', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="diff4_usability" className="block text-xs font-bold text-slate-700 mb-1">
                      3. 4단계에서 출력 형식을 표로 분리했을 때 얻은 학습 효과는?
                    </label>
                    <input
                      id="diff4_usability"
                      type="text"
                      value={expNote.diff4_usability}
                      onChange={(e) => handleExpChange('diff4_usability', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="coreRule" className="block text-xs font-bold text-slate-700 mb-1">
                      4. 이번 비교 실험을 통해 깨달은 프롬프트의 절대 규칙은?
                    </label>
                    <input
                      id="coreRule"
                      type="text"
                      value={expNote.coreRule}
                      onChange={(e) => handleExpChange('coreRule', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 우측 콘솔 카드 빌더 유도 배너 */}
                            {/* 우측 퀴즈 검증 카드 연동 알림 카드 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-400/40 uppercase">
                    ACTION REQUIRED · 2단계 실습 미션
                  </span>
                  <span className="text-xs text-indigo-300 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      실험을 마쳤다면 우측의 [퀴즈 검증 카드]를 열어 작성하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    무료 AI 서비스(ChatGPT, Gemini 등)에 퀴즈 출제 프롬프트를 전송해 보셨나요? AI의 출제 오류를 분석하고 수정한 내역을 우측 <strong>[퀴즈 검증 카드]</strong>에 입력하여 실시간 디지털 뱃지 카드를 발급받으세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('quiz_card')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [퀴즈 검증 카드] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(STANDARD_PROMPT_TEMPLATE, 'std_template')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      copiedId === 'std_template'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
                    }`}
                  >
                    {copiedId === 'std_template' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>템플릿 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {STANDARD_PROMPT_TEMPLATE}
                </div>
              </div>

              {/* AI 학생 페르소나 테스트 가이드 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">AI 학생 페르소나(Persona) 탐정 시험관 테스트</h3>
                      <p className="text-xs text-slate-500">AI에게 "너는 중학생 친구야"라는 역할을 입혀 내가 만든 퀴즈를 직접 풀어보게 하세요. 너무 쉽거나 헷갈리는 문제가 없는지 즉시 찾아낼 수 있습니다!</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(PERSONA_TEST_PROMPT, 'persona_prompt')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      copiedId === 'persona_prompt'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-sky-600'
                    }`}
                  >
                    {copiedId === 'persona_prompt' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {PERSONA_TEST_PROMPT}
                </div>
              </div>

              {/* 확장 미션 & 생각해보기 토론 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm space-y-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3 h-3" />
                    <span>확장 미션</span>
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">2개 이상의 AI 교차 비교하기</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    ChatGPT와 Google Gemini 두 군데에 동일한 4단계 프롬프트를 전송해 보세요. 두 모델이 제시하는 오답 보기의 매력도와 표 서식 지원 능력이 어떻게 다른지 비교해 봅니다.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <MessageSquare className="w-3 h-3" />
                    <span>생각해보기</span>
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">함께 나누는 토론 이야기</h4>
                  <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed font-normal">
                    <li>• <strong>토론 1:</strong> 왜 AI는 사람보다 프롬프트의 구체적인 형식(Format) 지시에 더 민감하게 반응할까요?</li>
                    <li>• <strong>토론 2:</strong> 일상 업무나 학습에서 'G-A-C-O 프레임워크'를 어떻게 적용할 수 있을까요?</li>
                  </ul>
                </div>
              </div>

              {/* 오늘 학습 회고록 4문항 폼 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">RETROSPECTIVE</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">오늘 학습 회고록 (4대 성찰 질문)</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>로컬 자동 저장</span>
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="retro_q1" className="block text-xs font-bold text-slate-700 mb-1">
                      1. 오늘 새롭게 배운 점이나 가장 흥미로웠던 개념은 무엇인가요?
                    </label>
                    <textarea
                      id="retro_q1"
                      rows={2}
                      value={retroData.q1}
                      onChange={(e) => handleRetroChange('q1', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="retro_q2" className="block text-xs font-bold text-slate-700 mb-1">
                      2. 실습 중 마주친 오류나 막혔던 점과 그것을 해결한 방법은?
                    </label>
                    <textarea
                      id="retro_q2"
                      rows={2}
                      value={retroData.q2}
                      onChange={(e) => handleRetroChange('q2', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="retro_q3" className="block text-xs font-bold text-slate-700 mb-1">
                      3. AI가 생성한 퀴즈 문항 중 비판적으로 거절하거나 수정한 내용은?
                    </label>
                    <textarea
                      id="retro_q3"
                      rows={2}
                      value={retroData.q3}
                      onChange={(e) => handleRetroChange('q3', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="retro_q4" className="block text-xs font-bold text-slate-700 mb-1">
                      4. 다음 수업이나 일상에서 시도해보고 싶은 프롬프트 응용 방법은?
                    </label>
                    <textarea
                      id="retro_q4"
                      rows={2}
                      value={retroData.q4}
                      onChange={(e) => handleRetroChange('q4', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>회고록 마크다운(.md) 저장</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON 내보내기</span>
                  </button>
                </div>
              </div>

              {/* 우측 콘솔 체크리스트 유도 배너 */}
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">COMPLETION GATE</span>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>회고를 마쳤다면 우측 [체크리스트]를 완료하고 3강을 여세요!</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal">
                    6대 학습 목표를 모두 체크하면 3강 잠금이 해제되고 학습 인증서가 발행됩니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  <span>우측 [체크리스트 &amp; 3강 언락] 열기</span>
                </button>
              </div>
              {/* 하단 이전 이동 버튼 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 3 4단계 비교 실험
                </button>
              </div>
            

              {/* ========================================================================= */}
          {/* 🔍 주니어 개발자를 위한 전문 용어 돋보기 (Glossary) */}
          {/* 본문은 쉬운 말로 쏙쏙! 진짜 개발자들의 전문 용어가 궁금할 땐 여기서 확인하세요! */}
          {/* ========================================================================= */}
          <div className="mt-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 p-6 md:p-8 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  JUNIOR DEVELOPER GLOSSARY · 2강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 AI 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 프롬프트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-indigo-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      1. 프롬프트
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Prompt</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-mono flex-shrink-0">Prompt</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> AI 요정에게 무엇을 어떻게 해달라고 적어 보내는 마법의 비밀 편지!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 대규모 언어 모델(LLM)이 원하는 작업(Task)을 수행하고 적절한 결과물을 생성하도록 사용자가 입력하는 자연어 명령문, 지시문, 문맥 데이터입니다.
                </p>
              </div>

              {/* 용어 2: 페르소나 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-sky-400" />
                      2. 페르소나
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 페르소나 (Persona)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">Role</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 연극 무대에 오르기 전에 배우가 입는 탐정 옷, 과학자 가운 같은 '역할 변신 가면'!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> AI에게 특정 인물, 직업, 성격, 전문 지식을 가진 캐릭터 역할을 부여하여 답변의 어조, 깊이, 관점(Perspective)을 목적에 맞게 제어하는 프롬프팅 기법입니다.
                </p>
              </div>

              {/* 용어 3: 제약 조건 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      3. 제약 조건
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Constraints</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">Rules</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 게임을 할 때 "선 넘지 마!"라고 그어두는 안전 울타리와 금기 규칙!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> AI가 답변을 작성할 때 반드시 포함해야 하거나 절대 넘어서는 안 되는 글자 수, 형식, 금지 단어 등의 경계 조건(Boundary Conditions)입니다.
                </p>
              </div>

              {/* 용어 4: 마크다운 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      4. 마크다운
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 마크다운 (Markdown)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">Syntax</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> '#'(제목)이나 '*'(별표) 같은 쉬운 기호로 글을 깔끔하고 예쁘게 정리해 주는 비밀 기호 놀이!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 일반 텍스트에 간단한 특수 기호를 더해 제목, 굵은 글씨, 목록, 표 등을 손쉽게 서식화할 수 있는 경량 마크업 언어(Lightweight Markup Language)입니다.
                </p>
              </div>

              {/* 용어 5: 퓨샷 프롬프팅 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-violet-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-violet-400" />
                      5. 퓨샷 프롬프팅
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 퓨샷 프롬프팅 (Few-Shot Prompting)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-violet-900/60 text-violet-200 border border-violet-700 font-mono flex-shrink-0">Technique</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 말로만 설명하는 대신, "이렇게 해봐!" 하고 예시 문제와 정답을 2~3개 먼저 보여주는 시범 보이기!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> AI 모델에 질문하기 전 몇 가지 예시(입력-출력 쌍)를 프롬프트에 미리 제공하여 출력 패턴, 문체, 추론 과정을 유도하는 문맥 내 학습(In-Context Learning) 기법입니다.
                </p>
              </div>

              {/* 용어 6: 콘텍스트 윈도우 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      6. 콘텍스트 윈도우
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 콘텍스트 윈도우 (Context Window)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">Memory</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 책상 위에 한 번에 펼쳐놓고 기억할 수 있는 메모지의 크기나 생각 주머니의 방 크기!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 대형 언어 모델(LLM)이 단일 요청 또는 대화 맥락에서 한 번에 입력받아 기억하고 처리할 수 있는 최대 텍스트 용량(토큰 한도)을 의미합니다.
                </p>
              </div>
            </div>
          </div>
            </section>
          )}

        </section>

        {/* ======================================================================= */}
        {/* ■ 우측 패널 (40% 폭) - 상시 고정형 인터랙티브 실습 콘솔 */}
        {/* ======================================================================= */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar" aria-label="실시간 인터랙티브 실습 콘솔">
          {/* 상단 3단 탭 스위처 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('builder')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'builder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>프롬프트 조립기</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('quiz_card')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'quiz_card'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>퀴즈 검증 카드</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>체크리스트 ({checkedCount}/6)</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* 1. [프롬프트 조립기] 인터랙티브 시뮬레이터 콘솔 */}
          {/* ===================================================================== */}
          {activeRightTab === 'builder' && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">G-A-C-O BUILDER HUD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-300">완성도:</span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    builderScore === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {builderScore}점
                  </span>
                </div>
              </div>

              {/* 완성도 점수 게이지 바 */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${getScoreWidthClass(builderScore)}`} />
                </div>
              </div>

              {/* 세계관 테마 스위처 */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">세계관 테마 선택</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['fantasy', 'cyberpunk', 'magic_school'] as ThemeKey[]).map((themeKey) => (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => setCurrentTheme(themeKey)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-center truncate ${
                        currentTheme === themeKey
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {themeKey === 'fantasy' && '조선 판타지'}
                      {themeKey === 'cyberpunk' && '사이버펑크'}
                      {themeKey === 'magic_school' && '마법학원'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4대 기둥 토글 스위치 카드 */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">4대 기둥 활성화 스위치</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    builderChecks.goal ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">G</span>
                      <span>목적 (Goal)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={builderChecks.goal}
                      onChange={(e) => setBuilderChecks({ ...builderChecks, goal: e.target.checked })}
                      className="rounded accent-indigo-600"
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    builderChecks.audience ? 'bg-sky-950/60 border-sky-500/60 text-sky-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-sky-600 text-white flex items-center justify-center text-[10px]">A</span>
                      <span>대상 (Audience)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={builderChecks.audience}
                      onChange={(e) => setBuilderChecks({ ...builderChecks, audience: e.target.checked })}
                      className="rounded accent-sky-600"
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    builderChecks.constraints ? 'bg-amber-950/60 border-amber-500/60 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-amber-600 text-white flex items-center justify-center text-[10px]">C</span>
                      <span>조건 (Constraints)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={builderChecks.constraints}
                      onChange={(e) => setBuilderChecks({ ...builderChecks, constraints: e.target.checked })}
                      className="rounded accent-amber-600"
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    builderChecks.output ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">O</span>
                      <span>형식 (Output)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={builderChecks.output}
                      onChange={(e) => setBuilderChecks({ ...builderChecks, output: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                  </label>
                </div>
              </div>

              {/* 실시간 조립 프롬프트 결과 미리보기 터미널 */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="uppercase font-bold tracking-wider">조립 결과 (실시간 뷰어)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(assembledPrompt, 'assembled_prompt')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      copiedId === 'assembled_prompt'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {copiedId === 'assembled_prompt' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>1-Click 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {assembledPrompt || '(최소 1개 이상의 기둥 스위치를 켜주세요)'}
                </div>
              </div>

              {/* 100점 달성 축하 메시지 */}
              {builderScore === 100 && (
                <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
                  <PartyPopper className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>축하합니다! 4대 기둥이 완벽히 조립되어 최고 수준의 프롬프트가 완성되었습니다!</span>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. [퀴즈 검증 카드] 실시간 카드 빌더 콘솔 */}
          {/* ===================================================================== */}
          {activeRightTab === 'quiz_card' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">QUIZ PROMPT ID CARD</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">실시간 렌더링</span>
              </div>

              {/* 퀴즈 보고서 입력 필드 */}
              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="mission_topic" className="block font-bold text-slate-700 mb-1">
                    출제 대상 주제
                  </label>
                  <input
                    id="mission_topic"
                    type="text"
                    value={missionData.topic}
                    onChange={(e) => handleMissionChange('topic', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="예: 중2 파이썬 기초 변수"
                  />
                </div>

                <div>
                  <label htmlFor="mission_flaw1" className="block font-bold text-slate-700 mb-1">
                    발견한 결함 1 (페르소나 테스트)
                  </label>
                  <input
                    id="mission_flaw1"
                    type="text"
                    value={missionData.flaw1}
                    onChange={(e) => handleMissionChange('flaw1', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="예: 문제 바로 밑에 정답 노출"
                  />
                </div>

                <div>
                  <label htmlFor="mission_flaw2" className="block font-bold text-slate-700 mb-1">
                    발견한 결함 2 (페르소나 테스트)
                  </label>
                  <input
                    id="mission_flaw2"
                    type="text"
                    value={missionData.flaw2}
                    onChange={(e) => handleMissionChange('flaw2', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="예: 오답 보기가 너무 엉뚱하여 변별력 부족"
                  />
                </div>

                <div>
                  <label htmlFor="mission_prompt" className="block font-bold text-slate-700 mb-1">
                    최종 교정된 G-A-C-O 프롬프트
                  </label>
                  <textarea
                    id="mission_prompt"
                    rows={4}
                    value={missionData.improvedPrompt}
                    onChange={(e) => handleMissionChange('improvedPrompt', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* 실시간 렌더링 디지털 뱃지 카드 */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-indigo-700/50 pb-2">
                  <span className="text-[11px] font-bold text-indigo-300">AI PROMPT CRAFTSMAN</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    VERIFIED
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block">TOPIC:</span>
                  <h4 className="text-sm font-bold text-white truncate">{missionData.topic}</h4>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 space-y-1">
                  <span className="text-[10px] text-indigo-300 font-bold block">FIXED DEFECTS:</span>
                  <p className="text-[11px] text-slate-300 line-clamp-2">• {missionData.flaw1}</p>
                  <p className="text-[11px] text-slate-300 line-clamp-2">• {missionData.flaw2}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>보고서 마크다운 저장</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. [체크리스트 & 3강 언락] 게이트 콘솔 */}
          {/* ===================================================================== */}
          {activeRightTab === 'checklist' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">SELF-CHECKLIST GATE</span>
                </div>
                <span className="text-xs font-bold text-indigo-600">{checkedCount} / 6 완료 ({progressPercent}%)</span>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
                <div
                  className={`bg-indigo-600 h-full rounded-full transition-all duration-300 ${getProgressWidthClass(
                    checkedCount
                  )}`}
                />
              </div>

              {/* 체크리스트 6개 항목 */}
              <div className="space-y-2 pt-1">
                {CHECKLIST_ITEMS.map((item, idx) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <label
                      key={item.id}
                      htmlFor={item.id}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80'
                      }`}
                    >
                      <input
                        id={item.id}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCheck(item.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 accent-emerald-600"
                      />
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        <strong className="text-slate-800 font-bold mr-1">[{idx + 1}]</strong>
                        {item.text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* 언락 상태 및 완료 버튼 */}
              <div className="pt-2">
                {isAllChecked ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <PartyPopper className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>2강의 모든 기준을 달성했습니다! 3강으로 전진하세요.</span>
                    </div>
                    <a
                      href="/lessons/03-story-branch/index.html"
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700 animate-pulse transition-all flex items-center justify-center gap-2"
                    >
                      <span>3강 시작하기 (스토리 분기 게임)</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>6개 항목을 모두 체크하면 3강이 열립니다</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-400">
                      남은 항목: {CHECKLIST_ITEMS.length - checkedCount}개
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Lesson02;
