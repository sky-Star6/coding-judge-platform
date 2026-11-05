import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Award,
  Lock,
  Unlock,
  Layers,
  Search,
  Code2,
  Trophy,
  CheckSquare,
  Radio,
  Send,
  ShieldCheck,
  Bot,
  UserCheck,
  GitBranch,
  ClipboardList,
  HeartHandshake,
  Tag,
  Smile,
  Shield,
  Lightbulb,
  AlertCircle,
  Edit3,
  MessageSquare,
  MessageCircle,
  ShieldAlert,
  Clock,
  Target,
  Home,
  Layout,
  Wifi,
  Battery,
  BookOpen,
  Rocket
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 4 · 19강 React 컴포넌트 (Lesson19.tsx)
 * 주니어 AI 발명가: 주변의 불편을 해결하는 챗봇 아이디어 기획
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'canvas' | 'simulator' | 'checklist';
type PresetKey = 'chef' | 'homework' | 'pet' | 'trpg';

interface PresetData {
  name: string;
  avatar: string;
  target: string;
  painPoint: string;
  persona: string;
  welcomeMsg: string;
  scenarios: { q: string; a: string }[];
}

const CHATBOT_PRESETS: Record<PresetKey, PresetData> = {
  chef: {
    name: '냉장고 파먹기 햄스터 셰프',
    avatar: '🐹',
    target: '퇴근 후 매일 저녁 메뉴를 고민하는 엄마와 배고픈 나',
    painPoint: '냉장고에 재료가 남아도 무엇을 만들어야 할지 막막하고 조리법 찾기가 귀찮음',
    persona: '요리를 사랑하는 다정하고 엉뚱한 햄스터 (~찍, ~해요 말투)',
    welcomeMsg: '어서오세찍! 오늘 냉장고에 남은 재료 2가지만 귓속말해줘찍!',
    scenarios: [
      { q: '감자랑 계란이 있어!', a: '감자랑 계란이면 포슬포슬한 스페인식 감자 오믈렛 어때찍? 15분 만에 뚝딱 완성돼요찍!' },
      { q: '초간단 양념장 비율도 알려줘!', a: '진간장 1스푼, 참기름 반 스푼, 설탕 톡톡이면 황금 양념 완성찍! 고소한 냄새가 솔솔 나요찍!' },
      { q: '수학 숙제 대신 풀어줘!', a: '앗! 저는 요리사 햄스터라서 수학 문제는 잘 몰라요찍! 대신 두뇌 회전에 좋은 호두 간식 요리를 알려드릴게찍!' }
    ]
  },
  homework: {
    name: '우리 반 숙제 요정 챗봇',
    avatar: '📚',
    target: '교과서 개념이 너무 길고 어려워 이해하기 힘든 학생들',
    painPoint: '사전이나 포털 검색을 해도 대학생 수준의 어려운 설명만 나와서 지침',
    persona: '핵심만 쏙쏙 3줄로 요약해 주는 똑똑하고 친절한 공부 멘토',
    welcomeMsg: '안녕! 오늘 숙제 중에 헷갈리는 과학이나 역사 개념이 있니? 딱 3줄로 요약해 줄게!',
    scenarios: [
      { q: '광합성이 뭔지 3줄로 요약해줘!', a: '1. 식물이 잎으로 햇빛을 쬐고 물을 마셔요.\n2. 햇빛 에너지로 달콤한 포도당 영양분을 만들어요.\n3. 우리가 숨 쉴 수 있는 맑은 산소를 내뿜어요!' },
      { q: '예시 문제를 하나 내줄래?', a: '좋아! 퀴즈: 식물이 광합성을 할 때 공기 중에서 마시는 기체는 무엇일까요? 힌트: 이산화OO!' },
      { q: '롤 티어 올리는 챔피언 추천해줘!', a: '앗, 저는 공부 숙제 요정이라 게임 공략은 잘 몰라요! 숙제 얼른 끝내고 게임하러 가자!' }
    ]
  },
  pet: {
    name: '반려동물 마음 번역기 냥냥이',
    avatar: '🐱',
    target: '강아지, 고양이의 이상 행동 이유를 알고 싶은 초보 집사들',
    painPoint: '동물이 갑자기 꼬리를 흔들거나 벽을 긁을 때 불안하고 이유를 모름',
    persona: '동물 심리학을 통달한 시크하지만 다정한 삼색 고양이 (~냥 체)',
    welcomeMsg: '안냥! 오늘 네 반려동물이 어떤 이상한 행동을 했냥? 행동을 묘사해주면 속마음을 통역해줄게냥!',
    scenarios: [
      { q: '강아지가 꼬리를 내리고 헥헥거려!', a: '그건 무섭거나 긴장했다는 신호다냥! 편안한 방으로 데려가서 부드럽게 쓰다듬어줘냥.' },
      { q: '고양이가 골골송을 부르며 꾹꾹이를 해!', a: '그건 너를 엄마처럼 믿고 최고의 행복을 느끼고 있다는 뜻이다냥! 기분 좋게 안아줘냥.' },
      { q: '내일 비 오는지 날씨 알려줘!', a: '냥? 나는 동물 마음 통역사지 기상청 슈퍼컴퓨터가 아니다냥! 대신 비 올 때 냥이들이 졸려 하는 이유는 알려줄 수 있다냥!' }
    ]
  },
  trpg: {
    name: '용사의 모험 TRPG 스토리 마스터',
    avatar: '🎮',
    target: '직접 선택지를 고르며 나만의 판타지 소설을 즐기고 싶은 게이머',
    painPoint: '정해진 결말의 일방적인 게임에 지루함을 느끼고 자유도를 갈망함',
    persona: '중후하고 신비로운 판타지 대륙의 스토리텔러 현자',
    welcomeMsg: '어둠의 동굴 앞에 선 용사여, 환영하오. 당신의 손에 든 무기는 무엇이며 어느 길로 가겠소?',
    scenarios: [
      { q: '오른쪽 횃불이 켜진 좁은 통로로 갈게!', a: '횃불 불빛 아래에서 잠든 아기 드래곤을 발견했소! [1] 살금살금 지나간다 [2] 먹이를 준다, 당신의 선택은?' },
      { q: '배낭에서 육포를 꺼내 조심스럽게 건넬래!', a: '아기 드래곤이 눈을 번쩍 뜨더니 기뻐하며 당신의 어깨에 올라탔소! 든든한 동료가 생겼구려!' },
      { q: '라면 끓이는 법 알려줘!', a: '허허, 용사여! 마왕성으로 향하는 던전 안에서 라면 레시피를 묻다니 엉뚱하구려! 모험에 집중하시오!' }
    ]
  }
};

export const Lesson19: React.FC = () => {
  // 상태 관리
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [rightTab, setRightTab] = useState<RightConsoleTab>('canvas');
  const [currentPreset, setCurrentPreset] = useState<PresetKey>('chef');

  // 캔버스 폼 상태
  const [botName, setBotName] = useState<string>(CHATBOT_PRESETS.chef.name);
  const [targetUser, setTargetUser] = useState<string>(CHATBOT_PRESETS.chef.target);
  const [painPoint, setPainPoint] = useState<string>(CHATBOT_PRESETS.chef.painPoint);
  const [persona, setPersona] = useState<string>(CHATBOT_PRESETS.chef.persona);
  const [welcomeMsg, setWelcomeMsg] = useState<string>(CHATBOT_PRESETS.chef.welcomeMsg);

  // 시뮬레이터 대화 메시지 상태
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    // 로컬 스토리지 체크리스트 복원
    const savedChecks = [1, 2, 3, 4, 5, 6].map(idx => {
      return localStorage.getItem(`ai_lesson_19_check_${idx}`) === 'true';
    });
    setChecklist(savedChecks);
  }, []);

  const handleCheckChange = (index: number) => {
    const nextChecks = [...checklist];
    nextChecks[index] = !nextChecks[index];
    setChecklist(nextChecks);
    localStorage.setItem(`ai_lesson_19_check_${index + 1}`, nextChecks[index] ? 'true' : 'false');

    const allDone = nextChecks.every(Boolean);
    if (allDone) {
      localStorage.setItem('ai_lesson_19_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_19_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / checklist.length) * 100);
  const isLessonComplete = progressPercent === 100;

  const handleLoadPreset = (key: PresetKey) => {
    setCurrentPreset(key);
    const data = CHATBOT_PRESETS[key];
    setBotName(data.name);
    setTargetUser(data.target);
    setPainPoint(data.painPoint);
    setPersona(data.persona);
    setWelcomeMsg(data.welcomeMsg);
    setChatMessages([]);
  };

  const handleSendMessage = (scenarioIndex: number) => {
    const data = CHATBOT_PRESETS[currentPreset];
    const sc = data.scenarios[scenarioIndex - 1];
    if (!sc) return;

    setChatMessages(prev => [...prev, { role: 'user', text: sc.q }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { role: 'bot', text: sc.a }]);
    }, 500);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased" data-lesson-id="lesson_19">

      {/* ======================================================================= */}
      {/* [상단 GNB] 과정 홈 | 시즌 4 · 19강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a href="/materials/ai/index.html" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100">
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              시즌 4 · 19강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              주니어 AI 발명가: 주변의 불편을 해결하는 챗봇 아이디어 기획
            </h1>
          </div>
        </div>

        {/* 4단계 퀘스트 스텝퍼 */}
                {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage1'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>불편함 돋보기</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage2'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>페르소나 성격</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage3'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>대화 흐름 지도</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage4'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>기획 캔버스</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span id="header-progress-text" className="text-rose-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                id="header-progress-fill"
                className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          {isLessonComplete ? (
            <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span>20강 언락</span>
            </div>
          ) : (
            <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>20강 잠김</span>
            </div>
          )}
        </div>
      </header>

      {/* ======================================================================= */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 2-패널 스플릿 뷰 */}
      {/* ======================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">

        {/* --------------------------------------------------------------------- */}
        {/* ■ 좌측 패널 (60% 폭): 퀘스트 가이드 & 본문 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 불편함 돋보기] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-rose-50/40 to-slate-50 border border-rose-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-rose-200/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>시즌 4 오프닝 · 주니어 AI 해커톤 &amp; 스마트 챗봇 웹앱</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  세상을 바꾸는 작은 아이디어
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  주니어 AI 발명가:<br className="hidden sm:inline" />
                  주변의 불편을 해결하는 챗봇 아이디어 기획
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
                  모든 위대한 발명은 "아, 이거 너무 귀찮은데?"라는 작은 불편을 발견하는 것에서 시작합니다. 복잡한 코딩을 시작하기 전, 누구의 어떤 문제를 해결할지 기획하고 챗봇의 성격과 대화 지도를 그리는 AI 발명가의 첫걸음을 뗍니다.
                </p>
              </div>

              {/* 메타 카드 3개 박스 */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">소요 시간</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">약 40분</strong>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">실습 난이도</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">기획 &amp; 디자인 씽킹</strong>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">권장 모드</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">2-패널 실습</strong>
                  </div>
                </div>
              </div>

              {/* 4대 학습 목표 */}
              <div className="p-4 rounded-2xl bg-white/95 border border-rose-100 space-y-2">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-600" />
                  <span>이번 19강에서 완성할 핵심 무기 4가지</span>
                </span>
                <ul className="learning-goals-list grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>나와 가족, 친구들의 진짜 불편함(Pain Point)을 찾아 문제 정의하기</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>챗봇의 역할과 성격, 독특한 말투를 부여하는 페르소나(Persona) 설계</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>첫 인사부터 엉뚱한 질문 대응까지 3단계 대화 흐름도(Flowchart) 완성</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>20강 Gemini API 연동을 위한 한 장짜리 챗봇 기획 캔버스 작성</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* STAGE 1 */}
          <section id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  챗봇은 왜 만들까? 불편함을 찾는 돋보기
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-rose-600" />
                <span>문제 발견과 공감</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              많은 사람들이 인공지능 챗봇을 만들 때 "멋진 최신 AI 기술을 써봐야지!" 하고 코드부터 짭니다. 하지만 아무도 겪지 않는 가짜 문제를 풀면, 기껏 만든 챗봇도 아무도 쓰지 않는 외로운 로봇이 되고 맙니다.
            </p>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>진짜 발명은 일상의 작은 투덜거림에서 시작돼요!</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "퇴근하고 온 엄마가 매일 '오늘 저녁은 또 뭐 해 먹지?' 한숨 쉬실 때", "친구가 수학 숙제 개념을 이해 못 해 끙끙 앓을 때", "내가 키우는 고양이가 왜 자꾸 우는지 답답할 때"! 이렇게 <strong>주변 사람들의 진짜 불편함에 귀를 기울이는 것</strong>이 주니어 AI 발명가의 첫 번째 비밀입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">1</span>
                  <span>나 자신의 불편</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  숙제할 때 단어가 너무 어렵거나, 시험 계획을 세우기 막막했던 순간이 있나요?
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
                  <span>가족의 고민</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  냉장고 속 재료가 썩어가는 게 아깝거나, 부모님의 건강 챙기기가 걱정되나요?
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
                  <span>친구들의 호기심</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  인기 있는 게임 공략을 찾기 힘들거나, 재미있는 이야기 속 주인공이 되고 싶나요?
                </p>
              </div>
            </div>
          </section>

              {/* Stage 1 Bottom Navigation */}
              <div className="flex justify-end items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage2');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 페르소나 성격</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 페르소나 성격] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* STAGE 2 */}
          <section id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  누구를 위한 챗봇일까? 페르소나와 말투 성격
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>캐릭터 페르소나</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              챗봇에게 영혼을 불어넣는 마법을 <strong>페르소나(Persona, 캐릭터 성격)</strong>라고 합니다. 똑같은 요리 정보를 알려주더라도, 딱딱한 기계처럼 말하는 것보다 귀여운 햄스터 셰프가 볼을 빵빵하게 채우고 <em>"오늘 냉장고에 남은 재료를 말해줘찍!"</em> 하고 말하면 훨씬 정감이 가죠?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  <span>1. 명확한 역할 (Role)</span>
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "나는 초등학생 역사 전문 멘토야", "나는 15분 초간단 요리사야"처럼 역할을 1줄로 한정합니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. 독특한 말투 (Tone)</span>
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  다정한 존댓말, 재치 있는 사투리, 혹은 동물 어미(~찍, ~냥)를 섞어 대화의 몰입감을 높입니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. 안전 가드레일</span>
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  자신의 전문 분야 밖 질문이나 위험한 요청에는 "저는 요리사라 그건 몰라요!" 하고 안전하게 거절합니다.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Lightbulb className="w-4 h-4" />
                <span>개발자 팁: 시스템 프롬프트(System Prompt)로 연결돼요!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                오늘 여러분이 정한 역할과 말투 규칙은 다음 20강에서 Google Gemini AI 모델에게 건네줄 <strong>'시스템 프롬프트(지침서)'</strong>의 뼈대가 됩니다!
              </p>
            </div>
          </section>

              {/* 우측 기획 캔버스 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [기획 캔버스]를 시작하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 챗봇의 4대 기둥(해결할 불편, 이름과 역할, 말투 성격, 금기 규칙)을 직접 설계할 차례입니다. 우측 콘솔의 <strong>[기획 캔버스]</strong>에서 나만의 AI 페르소나를 입력하고 실시간 기획안 카드를 조립해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRightTab('canvas')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [기획 캔버스] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stage 2 Bottom Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage1');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 1 불편함 돋보기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 대화 흐름 지도</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 대화 흐름 지도] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* STAGE 3 */}
          <section id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  3단계 대화 지도! 플로우차트와 시나리오
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-rose-600" />
                <span>대화 흐름도</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              챗봇과 사용자가 처음 만났을 때 어색하게 침묵이 흐르지 않으려면, 지하철 노선도처럼 대화의 정거장을 미리 그려두어야 합니다. 이를 <strong>대화 흐름도(Conversation Flowchart)</strong>라고 부릅니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px]">1</span>
                  <span>1단계: 환영 &amp; 유도 질문</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "안녕! 난 햄스터 셰프야. 오늘 냉장고에 남은 재료 2가지만 적어줘찍!" ➔ 사용자가 무엇을 입력해야 할지 바로 안내합니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[10px]">2</span>
                  <span>2단계: 정보 분석 &amp; 솔루션</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  사용자("감자랑 양파") ➔ 봇("감자 양파 볶음밥 어때찍? 10분 만에 만드는 초간단 레시피야!")
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
                  <span>3단계: 피드백 &amp; 후속 액션</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "더 자세한 양념 비율이 궁금해찍? 아니면 다른 요리를 추천해줄까찍?" ➔ 대화가 자연스럽게 이어집니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>만약 사용자가 엉뚱한 질문을 던진다면? (예외 처리 시나리오)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                요리 챗봇에게 "게임 레벨 올리는 법 알려줘"라고 묻는다면 당황하지 않고 <em>"앗, 저는 요리 햄스터라서 게임은 잘 몰라요찍! 대신 오늘 저녁에 먹을 맛있는 간식 레시피를 알려드릴게요찍!"</em> 하고 자연스럽게 본래 주제로 복귀시킵니다.
              </p>
            </div>
          </section>

              {/* 우측 대화 시뮬레이터 연동 알림 카드 */}
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
                      시나리오를 짰다면 우측 [대화 시뮬레이터]에서 시험 대화를 나눠보세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    인사-질문-답변-마무리로 이어지는 4단계 대화 지도를 완성하셨나요? 우측 콘솔의 <strong>[대화 시뮬레이터]</strong> 탭을 클릭하여 내가 기획한 페르소나 챗봇과 가상 대화를 나누며 어색한 대답을 미리 교정해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRightTab('simulator')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [대화 시뮬레이터] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stage 3 Bottom Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage2');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 2 페르소나 성격
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 기획 캔버스</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 기획 캔버스] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* STAGE 4 */}
          <section id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  한 장으로 끝내는 AI 기획 캔버스
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-rose-600" />
                <span>린 캔버스 완성</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              실리콘밸리의 유능한 창업자들은 100페이지짜리 두꺼운 기획서 대신 <strong>단 1장의 캔버스(Lean Canvas)</strong>에 핵심만 적어 팀원들과 소통합니다. 이것을 <strong>MVP(최소 기능 제품) 기획</strong>이라고 불러요.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <strong className="text-xs sm:text-sm font-bold text-indigo-900 block">
                우측 실습 콘솔에서 바로 써먹을 수 있는 4대 챗봇 롤모델
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold">📚 숙제 요정 챗봇</strong>
                  <span className="text-slate-500 text-[11px]">어려운 교과서 개념을 3줄로 요약해 주는 똑똑한 친구</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold">🥦 냉장고 파먹기 셰프</strong>
                  <span className="text-slate-500 text-[11px]">남은 재료 2개로 15분 만에 완성하는 레시피 추천</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold">🐱 반려동물 마음 번역기</strong>
                  <span className="text-slate-500 text-[11px]">강아지·고양이의 행동을 동물 심리학으로 공감 통역</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold">🎮 TRPG 스토리 마스터</strong>
                  <span className="text-slate-500 text-[11px]">내 선택에 따라 운명이 바뀌는 인터랙티브 모험 게임</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              우측 실습 콘솔에서 4가지 롤모델 중 하나를 고르거나 나만의 독창적인 아이디어를 직접 적어, 나만의 챗봇 기획서를 완성하고 가상 대화 시뮬레이션을 돌려보세요!
            </p>
          </section>

              {/* [실습 지시] 우측 체크리스트 및 20 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 20강을 여세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    오늘 기획한 6대 AI 챗봇 페르소나 및 안전 가드레일 설계 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 20강(Google Gemini 무료 API 열쇠 발급과 연동)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 20강 언락] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stage 4 Bottom Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 3 대화 흐름 지도
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
                  JUNIOR DEVELOPER GLOSSARY · 19강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 AI 프로덕트 매니저들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 문제 정의 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-400" />
                      1. 문제 정의
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Problem Definition (Pain Point Analysis)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">기획/문제발견</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "신발 속에 들어간 작은 모래알처럼 사람들을 매일 불편하게 만드는 진짜 원인을 찾아내는 일!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자가 일상이나 업무에서 겪는 근본적인 불편함과 결핍(Pain Point)을 발견하고, 이를 기술적으로 해결할 수 있도록 명확한 명제로 서술하는 기획의 첫 단계입니다.
                </p>
              </div>
              {/* 용어 2: 사용자 페르소나 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-sky-400" />
                      2. 사용자 페르소나
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: User Persona (Target Audience Profiling)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">UX/고객분석</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "내 챗봇을 가장 좋아하고 매일 쓸 가상의 단짝 친구 프로필을 미리 그려보는 상상 도감!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 제품이나 서비스를 사용할 실제 고객 집단의 인구통계학적 특성, 행동 패턴, 목표와 고충을 대표하도록 모델링한 가상의 대표 사용자 인물상입니다.
                </p>
              </div>
              {/* 용어 3: 대화 흐름도 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-emerald-400" />
                      3. 대화 흐름도
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Conversation Flowchart (Dialogue Tree)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">시나리오/설계</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "미로를 탈출하거나 보물섬을 찾아갈 때 어디로 꺾어야 할지 미리 그려둔 똑똑한 대화 지도!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자의 다양한 발화 입력과 챗봇의 응답 및 분기 조건을 순서도(Flowchart) 형태로 시각화하여 설계한 시나리오 분기 다이어그램입니다.
                </p>
              </div>
              {/* 용어 4: 프롬프트 시스템 지침 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-purple-400" />
                      4. 프롬프트 시스템 지침
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: System Prompt (Behavior Instructions)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">프롬프트 엔지니어링</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "연극 배우에게 '너는 오늘부터 친절한 탐험가야!' 하고 건네주는 절대 규칙 대본!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 대형 언어 모델(LLM)이 대화 전체에서 일관되게 유지해야 할 페르소나, 말투, 허용 작업, 답변 형식 등을 규정하는 최상위 운영 지침입니다.
                </p>
              </div>
              {/* 용어 5: 최소 기능 제품 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Rocket className="w-4 h-4 text-rose-400" />
                      5. 최소 기능 제품
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: MVP (Minimum Viable Product)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">린 개발/검증</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "바퀴와 손잡이만 먼저 만들어서 탈 수 있는지 시험해보는 씽씽이 킥보드!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 고객의 핵심 문제를 해결할 수 있는 최소한의 필수 기능만을 구현하여, 가장 빠르고 효율적으로 시장 반응을 학습하기 위한 초기 제품 프로토타입입니다.
                </p>
              </div>
              {/* 용어 6: 안전 방어 가이드라인 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-teal-400" />
                      6. 안전 방어 가이드라인
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: AI 세이프티 가드레일 (Safety Guardrails)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">AI 윤리/보안</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "놀이터 그네 주변에 위험하지 않도록 둘러쳐 둔 안전 펜스와 푹신한 모래사장!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 인공지능이 유해한 콘텐츠(욕설, 폭력, 개인정보 침해, 허위 사실)를 생성하거나 편향된 답변을 출력하지 않도록 사전에 차단하고 필터링하는 안전 정책 체계입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* --------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">

          {/* 3단 탭 네비게이션 */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setRightTab('canvas')}
              id="right-tab-btn-canvas"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'canvas' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>기획 캔버스</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('simulator')}
              id="right-tab-btn-simulator"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'simulator' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>대화 시뮬레이터</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('checklist')}
              id="right-tab-btn-checklist"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'checklist' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>점검표</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 📋 챗봇 기획 캔버스 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'canvas' && (
            <div id="right-tab-content-canvas" className="space-y-4">
              {/* 프리셋 로더 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>4대 챗봇 롤모델 프리셋 (원클릭 불러오기)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">1-Click Load</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('homework')}
                    id="btn-preset-homework"
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      currentPreset === 'homework'
                        ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    📚 숙제 요정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('chef')}
                    id="btn-preset-chef"
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      currentPreset === 'chef'
                        ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    🥦 냉장고 셰프
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('pet')}
                    id="btn-preset-pet"
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      currentPreset === 'pet'
                        ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    🐱 펫 번역기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('trpg')}
                    id="btn-preset-trpg"
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      currentPreset === 'trpg'
                        ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    🎮 TRPG 모험
                  </button>
                </div>
              </div>

              {/* 캔버스 폼 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">나만의 AI 챗봇 기획 캔버스</strong>
                  </div>
                  <span id="canvas-save-badge" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    자동 저장됨 ✨
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="canvas-bot-name" className="block text-[11px] font-bold text-slate-700 mb-1">
                      1. 챗봇 이름 (브랜드 네이밍)
                    </label>
                    <input
                      type="text"
                      id="canvas-bot-name"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="예: 우리 반 숙제 요정 챗봇"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="canvas-target-user" className="block text-[11px] font-bold text-slate-700 mb-1">
                      2. 타겟 사용자 (누가 이 챗봇을 쓰나요?)
                    </label>
                    <input
                      type="text"
                      id="canvas-target-user"
                      value={targetUser}
                      onChange={(e) => setTargetUser(e.target.value)}
                      placeholder="예: 어려운 과학 개념을 쉽게 이해하고 싶은 초·중학생"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="canvas-pain-point" className="block text-[11px] font-bold text-slate-700 mb-1">
                      3. 해결할 핵심 불편 (어떤 점이 답답했나요?)
                    </label>
                    <textarea
                      id="canvas-pain-point"
                      rows={2}
                      value={painPoint}
                      onChange={(e) => setPainPoint(e.target.value)}
                      placeholder="예: 냉장고에 재료가 썩어가는 게 아깝고 무엇을 만들지 막막함"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="canvas-persona" className="block text-[11px] font-bold text-slate-700 mb-1">
                      4. 페르소나 성격 &amp; 말투 규칙 (AI 캐릭터)
                    </label>
                    <input
                      type="text"
                      id="canvas-persona"
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      placeholder="예: 친절하고 재치 있는 마법사 (~하오, ~냥 체)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="canvas-welcome-msg" className="block text-[11px] font-bold text-slate-700 mb-1">
                      5. 첫 환영 인사말 &amp; 질문 유도 (1단계 발화)
                    </label>
                    <input
                      type="text"
                      id="canvas-welcome-msg"
                      value={welcomeMsg}
                      onChange={(e) => setWelcomeMsg(e.target.value)}
                      placeholder="예: 안녕! 오늘 어려운 숙제나 궁금한 개념을 물어봐!"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setRightTab('simulator')}
                    id="btn-test-dialogue"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>💬 기획한 챗봇과 대화 시뮬레이션 해보기!</span>
                  </button>
                </div>
              </div>

              {/* 기획 체크포인트 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  <span>좋은 AI 챗봇 기획의 3대 필수 조건</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-slate-800 block">대상 좁히기</strong>
                    <span className="text-slate-500 text-[10px]">모두가 아닌 특정인</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-slate-800 block">역할 제한</strong>
                    <span className="text-slate-500 text-[10px]">1가지 전문 분야</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-slate-800 block">말투 일관성</strong>
                    <span className="text-slate-500 text-[10px]">친근한 캐릭터</span>
                  </div>
                </div>
              </div>

              {/* 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <Award className="w-4 h-4" />
                  <span>주니어 AI 발명가의 4대 기획 공식 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">만능 챗봇의 유혹을 버리기</strong>
                      <span className="text-slate-400">세상의 모든 것을 다 아는 챗봇보다, 라면 요리 하나만 기가 막히게 알려주는 챗봇이 훨씬 사랑받습니다.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">첫인사에서 질문 가이드 제시하기</strong>
                      <span className="text-slate-400">그냥 "안녕" 대신 "남은 재료 2가지를 적어줘"처럼 사용자가 답하기 쉬운 질문을 먼저 던지세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">엉뚱한 질문을 유쾌하게 방어하기</strong>
                      <span className="text-slate-400">"오류입니다" 대신 "저는 요리사라서 그건 몰라요!" 하고 본래 주제로 부드럽게 이끌어내세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">20강 Gemini API 연동을 염두에 두기</strong>
                      <span className="text-slate-400">오늘 짠 기획서는 다음 강의에서 실제 거대 AI 두뇌를 장착할 기초 설계도입니다.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 💬 대화 흐름 시뮬레이터 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'simulator' && (
            <div id="right-tab-content-simulator" className="space-y-4">
              <div className="bg-white rounded-3xl border-2 border-slate-800 shadow-lg overflow-hidden space-y-0 max-w-sm mx-auto">
                {/* 모바일 헤더 */}
                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>10:30 AM</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 챗봇 프로필 상단바 */}
                <div className="p-3 bg-rose-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div id="sim-bot-avatar" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-sm font-bold">
                      {CHATBOT_PRESETS[currentPreset].avatar}
                    </div>
                    <div>
                      <strong id="sim-bot-title" className="text-xs font-bold block leading-tight">
                        {botName}
                      </strong>
                      <span id="sim-bot-status" className="text-[10px] text-rose-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>상담 대기 중</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatMessages([])}
                    className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    대화 리셋 🔄
                  </button>
                </div>

                {/* 대화 메시지 영역 */}
                <div id="sim-chat-window" className="p-3.5 space-y-3 bg-slate-50 min-h-[300px] max-h-[360px] overflow-y-auto text-xs">
                  {/* 환영 인사 */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                      AI
                    </div>
                    <div className="p-2.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-xs max-w-[80%] space-y-1">
                      <span id="sim-welcome-bubble" className="text-slate-800 leading-snug block">
                        {welcomeMsg}
                      </span>
                    </div>
                  </div>

                  {/* 동적 메시지 */}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex items-start gap-2'}>
                      {msg.role === 'bot' && (
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`p-2.5 rounded-2xl max-w-[80%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'rounded-tr-none bg-rose-600 text-white shadow-xs leading-snug'
                            : 'rounded-tl-none bg-white border border-slate-200 shadow-xs text-slate-800 whitespace-pre-line'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        AI
                      </div>
                      <div className="p-2.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-xs text-slate-400 text-[10px]">
                        생각 중... 💭
                      </div>
                    </div>
                  )}
                </div>

                {/* 시나리오 질문 버튼 3개 */}
                <div className="p-2.5 bg-slate-100 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block px-1">가상 사용자 질문 던져보기:</span>
                  <div className="grid grid-cols-1 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSendMessage(1)}
                      id="btn-quick-scene-1"
                      className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>"{CHATBOT_PRESETS[currentPreset].scenarios[0].q}"</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(2)}
                      id="btn-quick-scene-2"
                      className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>"{CHATBOT_PRESETS[currentPreset].scenarios[1].q}"</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(3)}
                      id="btn-quick-scene-3"
                      className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-amber-50 hover:text-amber-800 border border-slate-200 transition-colors font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>"{CHATBOT_PRESETS[currentPreset].scenarios[2].q}" (예외 방어)</span>
                      <ShieldAlert className="w-3 h-3 text-amber-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 팁 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>대화 흐름 점검 팁</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  정상적인 질문에 챗봇이 본래 말투를 지키며 답변하는지 확인하고, 주제에서 벗어난 엉뚱한 질문을 던졌을 때 안전하게 본인의 전문 분야로 복귀시키는지 테스트해보세요!
                </p>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: ✅ 자가 점검 체크리스트 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'checklist' && (
            <div id="right-tab-content-checklist" className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">19강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 20강이 열려요</span>
                    </div>
                  </div>
                  <span id="right-check-progress-text" className="text-xs font-mono font-bold text-rose-600">
                    {checkedCount} / {checklist.length} ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    id="right-check-progress-fill"
                    className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="space-y-2 pt-1" data-checklist-lesson="lesson_19">
                  {[
                    {
                      id: 1,
                      title: '1. 일상 속 문제 정의와 공감',
                      desc: '나와 가족, 친구들이 겪는 진짜 불편함(Pain Point)을 구체적으로 관찰하고 정의했다.'
                    },
                    {
                      id: 2,
                      title: '2. 챗봇 페르소나와 캐릭터 말투',
                      desc: '챗봇의 역할과 성격, 어조(~찍, 존댓말 등)를 설정하여 캐릭터에 일관성을 부여했다.'
                    },
                    {
                      id: 3,
                      title: '3. 1단계 환영 인사 및 질문 유도',
                      desc: '사용자가 무엇을 적어야 할지 막막하지 않도록 첫 인사말에 구체적인 가이드를 담았다.'
                    },
                    {
                      id: 4,
                      title: '4. 예외 질문 방어와 가드레일',
                      desc: '주제에서 벗어난 질문이 들어왔을 때 당황하지 않고 부드럽게 본래 주제로 복귀시켰다.'
                    },
                    {
                      id: 5,
                      title: '5. 대화 시뮬레이션 검증',
                      desc: '기획한 챗봇의 가상 대화창에서 3가지 시나리오 버튼을 눌러 흐름을 사전에 검증했다.'
                    },
                    {
                      id: 6,
                      title: '6. 린 기획 캔버스 작성 완료',
                      desc: '20강 Google Gemini 무료 API 연동에 즉시 투입할 한 장짜리 기획서를 완성했다.'
                    }
                  ].map((item, idx) => (
                    <label
                      key={item.id}
                      htmlFor={`check-item-${item.id}`}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={`check-item-${item.id}`}
                        checked={checklist[idx]}
                        onChange={() => handleCheckChange(idx)}
                        className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900 block mb-0.5">{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {isLessonComplete && (
                  <div id="completion-card" className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <strong className="text-sm font-bold">19강 기획 미션 완벽 정복! 🎉</strong>
                    </div>
                    <p className="text-xs text-rose-100 leading-relaxed font-normal">
                      주니어 AI 발명가로서 멋진 챗봇 아이디어와 대화 지도, 린 캔버스를 완성하셨습니다! 이제 20강에서 구글 계정으로 Google Gemini 무료 API 열쇠를 발급받고 챗봇의 진짜 두뇌를 연결하러 떠나보세요.
                    </p>
                    <a
                      href="/materials/ai/lessons/20-gemini-api/index.html"
                      id="btn-unlock-next"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-rose-900 hover:bg-rose-50 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>20강: Google Gemini 무료 API 열쇠 발급과 연동 도전하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
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

export default Lesson19;
