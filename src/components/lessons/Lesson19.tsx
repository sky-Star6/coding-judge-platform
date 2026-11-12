import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Award,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Search,
  Bot,
  Lightbulb,
  Layers,
  Send,
  FileText,
  Code,
  ZoomIn,
  Smile,
  Heart,
  GitBranch,
  ShieldAlert,
  User,
  MessageSquare,
  Tag
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type PresetKey = 'word' | 'meal' | 'career' | 'coder';

interface PresetData {
  name: string;
  target: string;
  tone: 'coach' | 'friend' | 'detective';
  welcome: string;
  chips: string[];
  responses: Record<string, string>;
}

interface QuestItem {
  id: string;
  badge: string;
  level: string;
  title: string;
  desc: string;
  prompt: string;
  reaction: string;
  csSecret: string;
}

const PRESETS: Record<PresetKey, PresetData> = {
  word: {
    name: '보카보카 단어 코치',
    target: '단어 외우기가 막막한 중학생',
    tone: 'coach',
    welcome: '안녕! 나는 너만의 1:1 영단어 트레이너 보카보카야. 오늘 외우고 싶은 단어나 시험 범위를 말해줘!',
    chips: ['오늘의 5단어 추천해줘', '단어 쉽게 외우는 법', '간단한 퀴즈 볼래'],
    responses: {
      '오늘의 5단어 추천해줘': '좋았어! 오늘 함께 정복할 5단어야:\n1. achieve (이루다)\n2. challenge (도전)\n3. invent (발명하다)\n4. resilient (회복력 있는)\n5. spark (불꽃, 영감)\n어떤 단어부터 외워볼까?',
      '단어 쉽게 외우는 법': '꿀팁 방출! 단어를 그냥 외우지 말고 [어원 쪼개기]와 [웃긴 문장 만들기]를 써봐! 예를 들어 invent는 in(안으로) + vent(오다)로 머릿속에 새로운 아이디어가 쑥 들어오는 거야!',
      '간단한 퀴즈 볼래': '깜짝 퀴즈 타임! 🔔\n"새로운 것을 창작하거나 만들어내다"라는 뜻의 영어 단어는 무엇일까요?\n힌트: i 로 시작해!'
    }
  },
  meal: {
    name: '맛있는 급식 요정',
    target: '매일 4교시 종 치기만 기다리는 학생들',
    tone: 'friend',
    welcome: '야호! 배고프지? 오늘의 학교 급식 메뉴와 칼로리, 알레르기 유발 식품을 1초 만에 알려줄게!',
    chips: ['오늘 점심 메뉴 뭐야?', '후식은 뭐 나와?', '돼지고기 알레르기 있어'],
    responses: {
      '오늘 점심 메뉴 뭐야?': '오늘의 꿀맛 식단표야! 🍱\n- 찰보리밥 & 소고기미역국\n- 수제 치즈돈까스 + 돈까스소스\n- 매콤 콩나물무침\n- 깍두기\n- 후식: 청포도 에이드! 맛있겠지?',
      '후식은 뭐 나와?': '오늘의 달콤한 후식은 시원한 [청포도 에이드 🍇]와 미니 초코 마카롱이야!',
      '돼지고기 알레르기 있어': '안전 주의보 발령! ⚠️ 오늘 메인 메뉴 [치즈돈까스]는 돼지고기(10번)가 포함되어 있어. 대체 단백질로 소고기미역국을 듬뿍 먹는 걸 추천해!'
    }
  },
  career: {
    name: '주니어 진로 나침반',
    target: '내가 무엇을 좋아하는지 고민인 청소년',
    tone: 'coach',
    welcome: '반가워! 내 흥미와 성향을 솔직하게 말해주면, 미래의 유망한 직업과 추천 공부법을 찾아줄게!',
    chips: ['게임 만드는 사람 될래', '수학은 싫은데 만들긴 좋아', 'AI 시대엔 어떤 직업이 좋아?'],
    responses: {
      '게임 만드는 사람 될래': '멋진 꿈이야! 🎮 게임 제작에는 게임 기획자, 배경 원화가, Unity/Unreal 프로그래머, 사운드 디자이너 등 다양한 역할이 있어. 넌 어떤 역할에 가장 끌려?',
      '수학은 싫은데 만들긴 좋아': '수학 공식에 얽매이지 않아도 UI/UX 인터랙션 디자이너, 3D 모델러, 웹 퍼블리셔 등 시각적인 창작과 감각으로 세상을 바꾸는 직업이 무궁무진해!',
      'AI 시대엔 어떤 직업이 좋아?': 'AI를 두려워하지 않고 "AI에게 일을 잘 시키는" 프롬프트 엔지니어, AI 윤리 감사관, 그리고 AI 도구를 활용해 문제를 푸는 도메인 전문가가 가장 빛날 거야!'
    }
  },
  coder: {
    name: '코딩 오류 해결사',
    target: '빨간 에러 메시지를 보고 멘붕 온 코린이',
    tone: 'detective',
    welcome: '사건 현장 접수 완료! 터미널이나 콘솔에 뜬 빨간 에러 메시지를 그대로 복사해서 나에게 보여줘.',
    chips: ['SyntaxError 가 뭐야?', 'TypeError: Cannot read property', '들여쓰기 에러 고쳐줘'],
    responses: {
      'SyntaxError 가 뭐야?': '탐정의 추리 돋보기! 🔍 SyntaxError는 문법 에러야! 따옴표 짝이 안 맞거나, 괄호를 닫지 않았거나, 줄 끝에 콜론(:)을 빠뜨리지 않았는지 단서 1번을 확인해봐!',
      'TypeError: Cannot read property': '범인은 바로 "상자 안이 비어있음"이야! undefined나 null인 변수 뒤에 . 점을 찍었을 때 발생하는 대표적 버그지. console.log()로 앞 변수 값을 먼저 확인해봐!',
      '들여쓰기 에러 고쳐줘': 'IndentationError 검거! 파이썬은 공백 4칸이나 Tab 키 규칙이 한 줄이라도 어긋나면 멈춰버려. 파일 전체를 들여쓰기 4칸으로 통일해봐!'
    }
  }
};

const QUESTS: QuestItem[] = [
  {
    id: 'quest-01',
    badge: '디자인 씽킹 공감 인터뷰 시나리오',
    level: '공감 & 발견 ★★★',
    title: '친구와 가족의 숨은 일상 불편함(Pain Point)을 날카롭게 포착하는 5가지 공감 인터뷰 질문지 작성',
    desc: '단순히 "어떤 챗봇이 필요해?"라고 묻지 않고, 사용자의 실제 하루 일과 속에서 가장 답답했던 순간을 이끌어내는 전문 디자인 씽킹 인터뷰 프롬프트를 실행합니다.',
    prompt: `[역할]
너는 스탠퍼드 d.school 출신의 세계적인 디자인 씽킹 코치이자 UX 리서처야.

[목표]
중·고등학생 또는 주니어 개발자가 일상에서 겪는 진짜 불편함(예: 단어 암기 스트레스, 급식 메뉴 확인, 진로 고민)을 포착할 수 있도록, 친구나 가족을 대상으로 진행할 5가지 심층 인터뷰 질문을 설계해 줘.

[세부 요구사항]
1. 단순 "예/아니오" 단답형을 금지하고, 구체적인 일화("가장 최근에 ~했을 때 기분이 어땠나요?")를 유도하는 열린 질문(Open-ended)으로 작성해 줘.
2. 질문마다 '이 질문을 통해 얻고자 하는 핵심 인사이트'를 1줄로 설명해 줘.
3. 상대방의 말속에서 '진짜 고통(Pain Point)'을 식별하는 인터뷰 꿀팁 3가지를 함께 제시해 줘.`,
    reaction: '사람들의 진짜 일상 속 불편함을 날카롭게 포착하는 심층 인터뷰 질문지를 생성합니다!',
    csSecret: '헨리 포드는 "사람들에게 무엇을 원하느냐고 물었다면 더 빠른 말을 원한다고 했을 것이다"라고 말했습니다. 사람들은 자신이 겪는 근본 문제를 정확히 정의하지 못하므로, 개발자는 그들의 행동 데이터를 분석해 진짜 결핍을 찾아내는 "문제 정의(Problem Definition)" 능력이 최우선입니다.'
  },
  {
    id: 'quest-02',
    badge: '챗봇 페르소나 및 시스템 프롬프트',
    level: '페르소나 설계 ★★★',
    title: '챗봇의 이름, 성격, 세계관, 금기 사항을 통제하는 마스터 "시스템 프롬프트(System Prompt)" 정의',
    desc: '기계적인 답변을 벗어나 살아있는 캐릭터처럼 대화하고, 절대 역할을 이탈하지 않도록 가두는 프롬프트 엔지니어링 규칙을 생성합니다.',
    prompt: `[역할]
너는 챗봇 인격(Persona)과 시스템 프롬프트를 설계하는 대화형 AI 프롬프트 아키텍트야.

[목표]
사용자가 지정한 주제(예: "단어 외우기가 힘든 학생을 격려하는 영단어 트레이너")에 딱 맞는 완벽한 '시스템 프롬프트(System Instruction)' 템플릿을 완성해 줘.

[세부 요구사항]
1. [Identity & Background]: 이름, 성별/외모 비유, 왜 이 챗봇이 탄생했는지 2줄 스토리.
2. [Tone & Manner]: 사용하는 어조(예: 경어체, 칭찬 가득한 에너지, 이모지 활용 규칙).
3. [Guiding Principles]: 사용자가 모르는 단어를 물었을 때 어원이나 암기 꿀팁을 제공하는 3단계 답변 공식.
4. [Negative Constraints]: 절대 해서는 안 되는 3가지 행동(정답만 툭 던지기 금지, 비난 금지, 다른 과목 답변 시 완곡히 본론 유도).`,
    reaction: '챗봇의 인격과 행동 양식을 빈틈없이 통제하는 최상위 시스템 지침을 확립합니다!',
    csSecret: '대규모 언어 모델(LLM)에서 시스템 프롬프트는 일반 사용자의 입력보다 최상위 가중치(System Priority)를 부여받아 모델의 행동 양식과 안전 규칙을 강력하게 제어하는 헌법 역할을 수행합니다.'
  },
  {
    id: 'quest-03',
    badge: '3단계 대화 분기 트리 & 플로우차트',
    level: '상태 머신 설계 ★★★',
    title: '인사 → 요구 파악 → 맞춤 솔루션 → 피드백으로 이어지는 대화 흐름도(Mermaid Flowchart) 도출',
    desc: '사용자가 어떤 대답을 하든 막힘없이 다음 단계로 자연스럽게 이끌 수 있도록 대화의 상태(State)와 분기점을 설계합니다.',
    prompt: `[역할]
너는 챗봇 시나리오 기획자이자 소프트웨어 흐름도 설계자야.

[목표]
사용자가 챗봇을 실행했을 때 시작부터 마무리까지 거치는 대화 분기 흐름을 Mermaid 다이어그램 코드와 텍스트 시나리오로 작성해 줘.

[세부 요구사항]
1. [State 1 - 온보딩]: 친절한 첫 인사 및 사용자가 선택할 수 있는 3가지 퀵 버튼 옵션 제시.
2. [State 2 - 분기 처리]: 사용자가 옵션 A, B, C를 골랐을 때 각각 분기되는 응답 처리 로직.
3. [State 3 - 피드백]: 추가 질문 여부를 묻고 대화를 부드럽게 유지하거나 종료하는 루프.
4. 모든 흐름을 마크다운 mermaid flowchart TD 코드로 시각화해 줘.`,
    reaction: '선택에 따라 자연스럽게 갈라지는 시각적 대화 분기 트리를 즉시 도출합니다!',
    csSecret: '컴퓨터 과학에서 챗봇의 대화 진행은 "유한 상태 기계(Finite State Machine, FSM)"로 모델링됩니다. 현재 대화 상태(State)와 사용자의 입력 이벤트(Event)에 따라 다음 상태로 전이(Transition)하는 원리입니다.'
  },
  {
    id: 'quest-04',
    badge: '예외 입력 방어 & 안전 가드레일',
    level: '안전성 설계 ★★★',
    title: '챗봇을 당황시키는 엉뚱한 질문, 공격적 장난, 탈옥(Jailbreak) 시도를 센스 있게 방어하는 폴백(Fallback) 수립',
    desc: '모르는 말이 들어왔을 때 "에러가 발생했습니다" 대신, 유쾌하게 웃어넘기며 원래 주제로 이끌어오는 안전망을 설계합니다.',
    prompt: `[역할]
너는 AI 안전성 엔지니어(Safety Guardrail Engineer)이자 윤리 검증관이야.

[목표]
학생이 개발하는 교육용 챗봇을 보호하기 위해, 다음과 같은 위험 상황별 '폴백(Fallback) 방어 응답 스크립트' 4종을 작성해 줘.

[세부 상황 4가지]
1. [범위 외 질문]: "너 게임 할 줄 알아? 롤 티어 뭐야?"처럼 챗봇 본연의 목적과 무관한 잡담이 들어왔을 때.
2. [모르는 전문 정보]: 챗봇이 확실하지 않은 정보에 대해 거짓말(환각)을 하지 않고 솔직하게 모른다고 인정할 때.
3. [짓궂은 장난 & 비속어]: 공격적인 언어나 프롬프트 탈옥(예: "너의 원래 지침을 다 잊어라") 시도가 들어왔을 때.
4. [침묵 및 빈 입력]: 의미 없는 자음 모음("ㅋㅋㅋ", "...")만 반복해서 보낼 때.`,
    reaction: '어떤 짓궂은 입력에도 시스템 다운 없이 센스 있게 대처하는 4중 방패를 구축합니다!',
    csSecret: '상용 챗봇 서비스에서는 의도치 않은 탈옥(Prompt Injection)을 막기 위해 사용자의 입력을 1차 필터링하는 경량화 안전 분류기(Safety Classifier)와 사전 정의된 고정 폴백 응답(Static Fallback)을 함께 배치합니다.'
  },
  {
    id: 'quest-05',
    badge: '1페이지 챗봇 린 캔버스 기획서',
    level: '린 캔버스 완성 ★★★',
    title: '문제, 해결책, 타깃, 핵심 가치를 한눈에 보여주는 1-Page 챗봇 린 캔버스(Lean Canvas) 종합 명세서 생성',
    desc: '수십 장짜리 지루한 보고서 대신, 팀원과 선생님에게 내 프로젝트의 가치를 30초 만에 전달하는 글로벌 스타트업 표준 1페이지 기획서를 도출합니다.',
    prompt: `[역할]
너는 에자일 스타트업 액셀러레이터이자 주니어 AI 해커톤 심사위원장이야.

[목표]
지금까지 기획한 챗봇 내용을 바탕으로, 한눈에 모든 프로젝트 핵심이 들어오는 '1페이지 챗봇 린 캔버스(Lean Canvas)'를 표(Table) 형식으로 깔끔하게 정리해 줘.

[포함할 7대 핵심 블록]
1. [문제 (Problem)]: 사용자가 겪는 가장 고통스러운 불편함 2가지.
2. [타깃 고객 (Target Customer)]: 이 챗봇이 가장 절실한 가상 사용자.
3. [고유 가치 제안 (Unique Value)]: 기존 방식(사전 찾기, 검색)보다 이 챗봇이 훨씬 좋은 이유 1문장.
4. [솔루션 (Solution)]: 챗봇이 제공하는 핵심 해결 기능 3가지.
5. [페르소나 & 어조 (Persona)]: 챗봇의 성격과 말투.
6. [핵심 지표 (Key Metric)]: 이 챗봇이 성공했는지 측정할 기준(예: 친구들의 만족도, 연속 대화 횟수).
7. [향후 확장 계획 (Next Step)]: 다음 20강에서 구현할 기술적 로드맵(키워드 분석 및 로컬 AI 엔진).`,
    reaction: '핵심 아이디어를 1페이지 표로 일목요연하게 압축한 글로벌 스타트업 표준 린 캔버스를 도출합니다!',
    csSecret: '소프트웨어 공학에서 "애자일(Agile)" 철학은 방대한 문서 작성보다 빠르게 작동하는 소프트웨어와 핵심 가치 검증을 중시합니다. 린 캔버스는 불필요한 낭비를 없애고 본질에 집중하게 만드는 강력한 도구입니다.'
  }
];

interface ChatMsg {
  sender: 'user' | 'bot';
  text: string;
}

export const Lesson19: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [presetKey, setPresetKey] = useState<PresetKey>('word');
  
  // 기획 폼 상태
  const [botName, setBotName] = useState(PRESETS.word.name);
  const [targetUser, setTargetUser] = useState(PRESETS.word.target);
  const [tone, setTone] = useState(PRESETS.word.tone);
  const [welcomeMsg, setWelcomeMsg] = useState(PRESETS.word.welcome);
  const [chips, setChips] = useState<string[]>(PRESETS.word.chips);

  // 폰 시뮬레이터 대화 내역
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
    { sender: 'bot', text: PRESETS.word.welcome }
  ]);
  const [phoneInput, setPhoneInput] = useState('');

  // 복사 피드백 상태
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [canvasCopied, setCanvasCopied] = useState(false);

  // 체크리스트 상태
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_19_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setCheckedItems(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePresetSelect = (key: PresetKey) => {
    setPresetKey(key);
    const data = PRESETS[key];
    setBotName(data.name);
    setTargetUser(data.target);
    setTone(data.tone);
    setWelcomeMsg(data.welcome);
    setChips(data.chips);
    setChatHistory([{ sender: 'bot', text: data.welcome }]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || phoneInput).trim();
    if (!text) return;

    const newHistory: ChatMsg[] = [...chatHistory, { sender: 'user', text }];
    setPhoneInput('');

    // 응답 도출
    const currentData = PRESETS[presetKey];
    let reply = currentData.responses[text];
    if (!reply) {
      reply = `좋은 질문이야! 💡 "${text}"에 대해 물어봤구나! 지금은 기획 단계 프로토타입이라 정해진 칩 위주로 응답하지만, 20강에서 로컬 추론 엔진을 달아주면 어떤 말이든 척척 분석해서 대답할 수 있게 될 거야!`;
    }

    newHistory.push({ sender: 'bot', text: reply });
    setChatHistory(newHistory);
  };

  const handleResetChat = () => {
    setChatHistory([{ sender: 'bot', text: welcomeMsg }]);
  };

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyLeanCanvas = () => {
    const canvasText = `[1페이지 챗봇 린 캔버스 기획서]
1. 프로젝트명: ${botName}
2. 타깃 페르소나: ${targetUser}
3. 챗봇 톤앤매너: ${tone}
4. 첫 환영 인사말: "${welcomeMsg}"
5. 핵심 가치 제안: 사용자의 일상 불편함을 3초 만에 덜어주는 맞춤형 챗봇
6. 다음 단계: 20강 로컬 AI 엔진 연동을 통한 지능형 키워드 추론 탑재`;

    navigator.clipboard.writeText(canvasText).then(() => {
      setCanvasCopied(true);
      setTimeout(() => setCanvasCopied(false), 2000);
    });
  };

  const handleToggleCheck = (index: number) => {
    const newItems = [...checkedItems];
    newItems[index] = !newItems[index];
    setCheckedItems(newItems);
    localStorage.setItem('ai_lesson_19_checklist', JSON.stringify(newItems));
    if (newItems.every(Boolean)) {
      localStorage.setItem('ai_lesson_19_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_19_completed');
    }
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-violet-100 selection:text-violet-900">
      
      {/* ===================================================================== */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃)                   */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-violet-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">시즌 4 · 19강: 주니어 AI 발명가: 주변의 불편을 해결하는 챗봇 기획</span>
              </div>
            </div>
          </div>

          {/* [우측]: 4단계 스테이지 스위처 버튼 그룹 (20px 원형 배지) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage1'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage1' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>미션 &amp; 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage2'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage2' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>기획 캔버스</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage3' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage4')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage4'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage4' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                4
              </span>
              <span>용어&amp;체크리스트</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeStage === 'all'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 보기
            </button>
          </nav>

        </div>
      </header>

      {/* 모바일 전용 서브 탭 바 */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage1' ? 'text-violet-700 bg-violet-50' : 'text-slate-600'
          }`}
        >
          1. 미션&amp;원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage2' ? 'text-violet-700 bg-violet-50' : 'text-slate-600'
          }`}
        >
          2. 기획 캔버스
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage3' ? 'text-violet-700 bg-violet-50' : 'text-slate-600'
          }`}
        >
          3. AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage4' ? 'text-violet-700 bg-violet-50' : 'text-slate-600'
          }`}
        >
          4. 용어&amp;점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'all' ? 'text-violet-700 bg-violet-50' : 'text-slate-500'
          }`}
        >
          전체
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. 메인 워크스페이스 (단일 컨테이너 몰입형 레이아웃)                   */}
      {/* ===================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* =================================================================== */}
        {/* STAGE 01: 퀘스트 미션 브리핑 & 핵심 개념 원리                      */}
        {/* =================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8">
            
            {/* 미션 브리핑 히어로 카드 */}
            <article className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-violet-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-violet-400" />
                    <span>시즌 4 그랜드 오프닝 · 주니어 AI 해커톤 트랙</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    아이디어 기획 &amp; 디자인 씽킹
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    주니어 AI 발명가:<br className="hidden sm:inline" />
                    주변의 불편을 해결하는 챗봇 기획
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    진짜 뛰어난 소프트웨어 창작자는 코드를 먼저 치지 않고, 사람이 겪는 진짜 불편함부터 찾아냅니다. 친구와 가족의 고민을 관찰하고, 챗봇의 성격(페르소나)과 대화 지도를 설계하여 나만의 1페이지 AI 기획서를 완성합니다.
                  </p>
                </div>

                {/* 3대 도전 미션 목표 (3열 카드, 소요 시간 배제) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                      <Heart className="w-4 h-4" />
                      <span>1. 진짜 불편함 발견</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      디자인 씽킹 기법으로 친구나 가족이 매일 겪는 귀찮고 답답한 문제를 찾아냅니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <User className="w-4 h-4" />
                      <span>2. 챗봇 페르소나 정의</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      챗봇의 이름, 역할, 말투(다정한 코치, 유쾌한 친구)와 첫 환영 인사를 정합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <GitBranch className="w-4 h-4" />
                      <span>3. 3단계 대화 지도 완성</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      인사부터 추천 질문 칩, 핵심 솔루션, 엉뚱한 입력 방어까지 대화 갈림길을 설계합니다.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 핵심 원리 탐구 카드 (3구 그리드) */}
            <section className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>CORE PRINCIPLES</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  소프트웨어 기획의 3대 핵심 원리
                </h3>
                <p className="text-sm text-slate-500 font-normal">
                  코드 한 줄 치기 전에 실리콘밸리 일류 개발팀이 가장 먼저 거치는 생각의 도구들입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-violet-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                        <Search className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-violet-50 text-violet-700">원리 01</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">1. 디자인 씽킹</h4>
                      <span className="text-sm font-mono text-slate-400 block">Design Thinking</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      공감 → 문제 정의 → 아이디어 도출 → 프로토타입 → 테스트로 이어지는 인간 중심 문제 해결 공식입니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-sm text-violet-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-violet-800">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "친구가 무거운 짐을 들고 낑낑댈 때, '왜 힘들까?' 가만히 관찰하고 딱 맞는 바퀴 달린 가방을 만들어주는 배려 탐정!"
                    </p>
                  </div>
                </article>

                {/* 2 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Smile className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">원리 02</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">2. 타깃 페르소나</h4>
                      <span className="text-sm font-mono text-slate-400 block">Target Persona &amp; Tone</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      내 앱을 쓸 단 한 명의 대표 사용자를 상상하고, 그 사람에게 가장 편안한 말투와 태도로 챗봇의 캐릭터를 입힙니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm text-indigo-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "연극 무대에 올릴 인형에게 '너는 다정한 멘토 선생님이야' 혹은 '단짝 친구야'라고 성격과 옷을 정해주는 일!"
                    </p>
                  </div>
                </article>

                {/* 3 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">원리 03</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">3. 분기 트리 &amp; 폴백</h4>
                      <span className="text-sm font-mono text-slate-400 block">Decision Tree &amp; Fallback</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      대화의 갈림길을 정해두고, 사용자가 엉뚱한 말을 하더라도 당황하지 않고 대화를 되돌리는 안전망을 준비합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-sm text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "갈림길이 있는 보물섬 모험 지도와, 엉뚱한 곳으로 걸어가도 친절하게 표지판으로 돌아오게 해주는 등대 불빛!"
                    </p>
                  </div>
                </article>

              </div>
            </section>

            {/* 주니어 개발자 제1원칙 */}
            <aside className="p-5 rounded-2xl bg-gradient-to-r from-violet-900 to-slate-900 text-white border border-violet-700/60 shadow-md flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-base font-bold text-white block">주니어 개발자의 제1원칙: 사람의 불편함에 진심으로 귀 기울여라!</strong>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  아무리 복잡하고 똑똑한 최신 AI 모델이라도, 사용자가 진짜 원하지 않는 기능을 만들면 아무도 쓰지 않는 빈 깡통이 됩니다. <strong>"이 챗봇이 누구의 어떤 고통(Pain Point)을 덜어주는가?"</strong>를 한 문장으로 명확하게 설명할 수 있을 때, 비로소 세상에 꼭 필요한 따뜻한 소프트웨어가 탄생합니다.
                </p>
              </div>
            </aside>

            {activeStage !== 'all' && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음 단계: Stage 2 기획 캔버스 &amp; 시뮬레이터</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 챗봇 기획 캔버스 & 폰 시뮬레이터                    */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    나만의 챗봇 기획 캔버스 &amp; 가상 폰 프로토타입
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  주변의 불편함을 해결할 4가지 추천 테마를 선택하거나 직접 입력하여 페르소나와 환영 인사를 정하고, 우측 가상 폰에서 실시간 대화를 체험해 보세요.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* 추천 프리셋 4종 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span>아이디어 영감 4대 추천 프리셋</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['word', 'meal', 'career', 'coder'] as PresetKey[]).map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handlePresetSelect(k)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        presetKey === k
                          ? 'bg-violet-50 border-violet-300 text-violet-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold">
                        {k === 'word' && '📚 단어 암기 메이트'}
                        {k === 'meal' && '🍱 맛있는 급식 요정'}
                        {k === 'career' && '🎯 주니어 진로 나침반'}
                        {k === 'coder' && '🐛 코딩 오류 해결사'}
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">
                        {k === 'word' && '영포자 친구를 위한 코치'}
                        {k === 'meal' && '오늘 메뉴와 알레르기 안내'}
                        {k === 'career' && '적성과 흥미 기반 직업 탐색'}
                        {k === 'coder' && '빨간 에러 메시지 힌트 요정'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2분할: 폼 vs 폰 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* 폼 */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-violet-600" />
                      <span>챗봇 이름 (Name)</span>
                    </label>
                    <input
                      type="text"
                      value={botName}
                      onChange={e => setBotName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-sm text-slate-800 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>타깃 사용자 (Target)</span>
                      </label>
                      <input
                        type="text"
                        value={targetUser}
                        onChange={e => setTargetUser(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-sm text-slate-800 bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-pink-600" />
                        <span>챗봇 말투 (Persona Tone)</span>
                      </label>
                      <select
                        value={tone}
                        onChange={e => setTone(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-sm text-slate-800 bg-slate-50 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="coach">따뜻한 칭찬 코치체 ("잘했어! 한 걸음 더!")</option>
                        <option value="friend">다정한 동갑내기 친구체 ("안녕! 오늘 급식 봤어?")</option>
                        <option value="detective">예리한 명탐정체 ("흠, 이 오류의 단서는 바로...")</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>첫 환영 인사말 (Welcome Message)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={welcomeMsg}
                      onChange={e => setWelcomeMsg(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-sm text-slate-800 bg-slate-50 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>사용자 유도 추천 질문 칩 (Quick Chips)</span>
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {chips.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                          # {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCopyLeanCanvas}
                      className="w-full py-2.5 px-4 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-sm border border-violet-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {canvasCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">린 캔버스 복사 완료! ✨</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>📋 1페이지 챗봇 린 캔버스 기획서 클립보드 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 폰 */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[320px] rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 relative">
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-700 mr-2"></div>
                      <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                    </div>

                    <div className="bg-slate-50 rounded-[28px] overflow-hidden flex flex-col h-[460px] border border-slate-200">
                      <div className="p-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                            🤖
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-sm truncate block leading-tight">{botName}</span>
                            <span className="text-[11px] text-violet-100 block">온라인 · 응답 준비 완료</span>
                          </div>
                        </div>
                        <button type="button" onClick={handleResetChat} title="채팅 초기화" className="text-white/80 hover:text-white p-1 cursor-pointer">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                        {chatHistory.map((m, i) => (
                          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'items-start gap-1.5'}`}>
                            {m.sender === 'bot' && (
                              <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                AI
                              </div>
                            )}
                            <div className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                              m.sender === 'user'
                                ? 'bg-violet-600 text-white rounded-tr-xs shadow-2xs'
                                : 'bg-white border border-slate-200 rounded-tl-xs text-slate-800 shadow-2xs whitespace-pre-wrap'
                            }`}>
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
                        {chips.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendMessage(c)}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-bold shrink-0 shadow-2xs transition-colors cursor-pointer"
                          >
                            {c}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={phoneInput}
                          onChange={e => setPhoneInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                          placeholder="메시지를 입력하세요..."
                          className="flex-1 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-violet-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendMessage()}
                          className="w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 text-center">
                    💡 추천 질문 칩을 누르거나 직접 메시지를 입력해 보세요!
                  </p>
                </div>

              </div>

            </div>

            {activeStage !== 'all' && (
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage1')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 1 미션 &amp; 원리</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음: Stage 3 실전 AI 퀘스트</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 03: 실전 최신 AI 5대 킬러 퀘스트                             */}
        {/* =================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    실전 최신 AI 5대 킬러 퀘스트
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  외부 ChatGPT나 Gemini 창을 옆에 띄우고 아래 정밀 설계된 5대 프롬프트를 원클릭으로 복사하여 전문 기획자 수준의 기획서와 가드레일을 생성해 보세요.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article key={q.id} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-violet-300 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-bold bg-violet-50 text-violet-700">
                        QUEST 0{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-500">{q.badge}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-slate-100 text-slate-700">
                      {q.level}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">{q.desc}</p>
                  </div>

                  {/* 프롬프트 박스 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-violet-500" />
                        <span>실전 AI 복사 프롬프트</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPrompt(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">복사됨! ✨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>프롬프트 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {q.prompt}
                    </div>
                  </div>

                  {/* 충격 반응 & CS 비밀 */}
                  <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-2">
                    <span className="text-sm font-bold text-violet-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>AI 소환 마법 &amp; 💡 컴퓨터 과학 비밀 해설</span>
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      <strong>💡 컴퓨터 과학 비밀:</strong> {q.csSecret}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {activeStage !== 'all' && (
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 2 기획 캔버스</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음: Stage 4 용어 &amp; 체크리스트</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 04: 주니어 개발자 전문 용어 돋보기 & 자가 점검 체크리스트    */}
        {/* =================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    전문 용어 돋보기 &amp; 자가 점검 체크리스트
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  오늘 배운 쉬운 기획 원리들을 공식 소프트웨어 공학 용어로 정리하고, 6개 항목을 스스로 점검하여 다음 20강(로컬 AI 추론 엔진)을 언락하세요!
                </p>
              </div>
            </div>

            {/* 1. 주니어 개발자를 위한 전문 용어 돋보기 */}
            <article className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-violet-900/40 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30 flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-violet-400" />
                    <span>JUNIOR DEVELOPER GLOSSARY</span>
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    어린이 비유와 컴퓨터 과학 공식 정의 1:1 매칭
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🔍 주니어 개발자를 위한 전문 용어 돋보기
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  본문에서 다룬 재미있는 비유들의 실제 소프트웨어 공학 공식 명칭과 정의를 확인해보세요.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-violet-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>1. 디자인 씽킹</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Design Thinking (Human-Centered Design)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-200">
                    <strong>🧸 어린이 비유:</strong> "친구가 불편해하는 모습을 탐정처럼 몰래 관찰하고, 친구 입장이 되어 문제를 해결해 주는 배려 마법!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 공감(Empathize), 문제 정의(Define), 아이디어 도출(Ideate), 시제품 제작(Prototype), 테스트(Test)의 5단계 반복을 통해 사용자의 잠재적 요구를 충족시키는 인간 중심 문제 해결 프레임워크입니다.
                  </p>
                </div>

                {/* 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-indigo-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>2. 타깃 페르소나</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Target User Persona</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200">
                    <strong>🧸 어린이 비유:</strong> "가상의 대표 친구 한 명에게 이름, 성격, 좋아하는 음식, 제일 싫어하는 숙제를 정해주는 인형 놀이!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 제품을 사용할 실제 핵심 고객 군의 행동 패턴, 고통(Pain Point), 동기를 대표하도록 가공된 가상의 구체적 인물 프로필로, 제품 설계 시 명확한 의사결정의 기준점이 됩니다.
                  </p>
                </div>

                {/* 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-emerald-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>3. 시스템 프롬프트 &amp; 가드레일</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">System Instructions &amp; Safety Guardrails</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
                    <strong>🧸 어린이 비유:</strong> "연극 무대에 오르는 배우에게 '너는 친절한 마법사야. 절대 나쁜 말은 하면 안 돼!'라고 적어준 비밀 대본!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> LLM의 최상위 컨텍스트에 주입되어 모델의 기본 성격, 역할, 출력 형식, 금기 규칙을 강제하는 시스템 레벨 지침과 비윤리적 발언을 사전에 차단하는 안전 방어막입니다.
                  </p>
                </div>

                {/* 4 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-amber-300 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-amber-400" />
                      <span>4. 대화 분기 트리</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Decision Tree &amp; State Machine</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
                    <strong>🧸 어린이 비유:</strong> "'오른쪽 길로 가면 보물 상자, 왼쪽 길로 가면 괴물'처럼 선택에 따라 갈라지는 갈림길 모험 지도!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 사용자의 응답 조건(A/B/C)에 따라 다음 상태(State)로 이동하는 로직을 나뭇가지(Tree) 구조로 설계하여 챗봇이 논리적인 흐름 속에서 대화를 주도하도록 제어하는 구조입니다.
                  </p>
                </div>

                {/* 5 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-rose-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>5. 폴백 핸들링 &amp; 린 캔버스</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Fallback Handling &amp; Lean Canvas</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200">
                    <strong>🧸 어린이 비유:</strong> "달리기를 하다 넘어져도 당황하지 않고 툭툭 털며 웃는 보호대와, 준비물을 한 장에 쏙 적어둔 알림장!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 폴백(Fallback)은 시스템이 인식할 수 없는 입력이 유입되었을 때 오류를 뿜지 않고 정중히 재입력을 유도하는 예외 대응 로직이며, 린 캔버스(Lean Canvas)는 문제, 솔루션, 차별화 가치를 1페이지 표로 압축한 애자일 프로젝트 명세서입니다.
                  </p>
                </div>

              </div>
            </article>

            {/* 2. 자가 점검 체크리스트 */}
            <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-emerald-600" />
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      19강 완주 자가 점검 체크리스트
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 font-normal">
                    배운 내용을 확인하고 6개 항목을 모두 완료하면 다음 20강(로컬 AI 엔진)이 열립니다.
                  </p>
                </div>
                <div className={`px-3.5 py-1.5 rounded-full font-bold text-sm shrink-0 self-start sm:self-auto ${
                  completedCount === 6
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {completedCount} / 6 완료
                </div>
              </div>

              {/* 실시간 게이지 바 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600">체크리스트 달성률</span>
                  <span className="text-emerald-600 font-mono font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-violet-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* 6개 체크박스 */}
              <div className="space-y-3 pt-2">
                
                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[0]}
                    onChange={() => handleToggleCheck(0)}
                    className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      디자인 씽킹 5단계와 사용자 공감 인터뷰 이해
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      개발자 혼자 상상하지 않고, 실제 사용자가 겪는 진짜 불편함(Pain Point)을 열린 질문으로 탐색하는 원리를 체득했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[1]}
                    onChange={() => handleToggleCheck(1)}
                    className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      챗봇 타깃 페르소나 및 톤앤매너 설정
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      챗봇의 대표 사용자 프로필과 말투(칭찬 코치체, 친구체 등), 첫 환영 인사말을 구체적으로 확정했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[2]}
                    onChange={() => handleToggleCheck(2)}
                    className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      3단계 대화 분기 트리 및 유한 상태 머신(FSM) 설계
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      첫 인사부터 추천 칩, 핵심 솔루션 도출, 마무리 피드백으로 이어지는 자연스러운 대화 갈림길을 설계했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[3]}
                    onChange={() => handleToggleCheck(3)}
                    className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      엉뚱한 입력에 대처하는 폴백(Fallback)과 안전 가드레일 수립
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      예상치 못한 질문이나 짓궂은 입력이 들어와도 시스템 다운 없이 재치 있게 본론으로 복귀시키는 대응책을 마련했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[4]}
                    onChange={() => handleToggleCheck(4)}
                    className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      1페이지 챗봇 린 캔버스(Lean Canvas) 기획서 작성 완료
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      문제, 솔루션, 타깃, 고유 가치를 한 장의 표로 일목요연하게 압축 정리하는 애자일 기획 능력을 길렀습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[5]}
                    onChange={() => handleToggleCheck(5)}
                    className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      20강 로컬 AI 엔진 연동을 위한 아이디어 준비 완료
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      다음 강에서 구현할 키워드 매칭과 로컬 AI 추론 엔진을 내 챗봇 기획안에 적용할 준비를 완벽히 마쳤습니다.
                    </span>
                  </div>
                </label>

              </div>

              {/* 100% 완주 축하 및 20강 언락 카드 */}
              {completedCount === 6 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white border-2 border-violet-500/50 shadow-2xl space-y-5 animate-pulse">
                  <div className="flex items-center justify-between border-b border-violet-500/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
                        💡
                      </div>
                      <div>
                        <strong className="text-lg font-black text-white block">
                          19강 주니어 AI 발명가 기획 마스터 수료!
                        </strong>
                        <span className="text-sm font-mono text-violet-300 font-bold">STAGE 19 CLEARED · JUNIOR AI INVENTOR</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30">
                      기획 완료 ★★★★★
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-1">
                    <h5 className="text-base font-bold text-violet-200">
                      축하합니다! 주변의 불편을 해결하는 스마트 챗봇 기획안을 완성하셨습니다!
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      사용자 공감부터 페르소나, 대화 분기 트리, 폴백 방어, 1페이지 린 캔버스까지 완벽히 마스터했습니다. 이제 다음 20강에서 챗봇에게 똑똑한 로컬 AI 두뇌를 직접 심어줄 수 있습니다!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-sm text-violet-300 font-semibold block">다음 20강: 챗봇에게 두뇌를 선물하자!</span>
                      <p className="text-sm text-white font-bold">20강: 키워드 분석과 로컬 AI 추론 엔진 만들기</p>
                    </div>
                    <a
                      href="../20-chatbot-brain/index.html"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>20강으로 즉시 이동하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

            </article>

            {activeStage !== 'all' && (
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 3 실전 AI 퀘스트</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>맨 위로</span>
                </button>
              </div>
            )}
          </section>
        )}

      </main>

      {/* ===================================================================== */}
      {/* 3. 푸터 영역 (글로벌 표준 푸터)                                       */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <span className="font-medium">AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span>시즌 4 · 19강 주니어 AI 발명가: 주변의 불편을 해결하는 챗봇 기획</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="../../index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="../18-smart-tool-showcase/index.html" className="hover:text-slate-900 transition-colors">18강 바로가기</a>
            <a href="../20-chatbot-brain/index.html" className="hover:text-slate-900 transition-colors">20강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson19;
