import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Lightbulb,
  Award,
  Target,
  Bot,
  PlayCircle,
  Lock,
  Unlock,
  Clock,
  Layers,
  Search,
  Code2,
  Trophy,
  CheckSquare,
  Zap,
  Flame,
  CircleDot,
  MousePointerClick,
  BookOpen,
  FileCode,
  Cpu,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 7강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'game' | 'prompt' | 'checklist';
export type SkinType = 'choco' | 'donut' | 'star';

export interface Lesson07Props {
  onComplete?: () => void;
}

export const Lesson07: React.FC<Lesson07Props> = ({ onComplete }) => {
  // ---------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('game');
  
  // 쿠키클리커 게임 상태
  const [cookieCount, setCookieCount] = useState<number>(0);
  const [clickPower, setClickPower] = useState<number>(1);
  const [ovenLevel, setOvenLevel] = useState<number>(0);
  const [fairyHired, setFairyHired] = useState<boolean>(false);
  const [currentSkin, setCurrentSkin] = useState<SkinType>('choco');
  const [clickToast, setClickToast] = useState<boolean>(false);
  const [isJsCopied, setIsJsCopied] = useState<boolean>(false);

  // 미니 퀴즈 상태
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // 프롬프트 복사 토스트 상태
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // 회고 수첩 상태
  const [retro, setRetro] = useState({
    q1: '',
    q2: ''
  });

  // 자가 점검 체크리스트 (6개)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
    c6: false
  });

  // ---------------------------------------------------------------------------
  // 요정 셰프 자동 쿠키 생성 타이머
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (fairyHired) {
      timer = setInterval(() => {
        setCookieCount(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [fairyHired]);

  // ---------------------------------------------------------------------------
  // 로컬 스토리지 연동 및 초기화
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const savedRetro = localStorage.getItem('lesson07_retro');
      if (savedRetro) {
        setRetro(JSON.parse(savedRetro));
      }
      const savedChecklist = localStorage.getItem('lesson07_checklist');
      if (savedChecklist) {
        setChecklist(JSON.parse(savedChecklist));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleRetroChange = (key: keyof typeof retro, val: string) => {
    const updated = { ...retro, [key]: val };
    setRetro(updated);
    try {
      localStorage.setItem('lesson07_retro', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChecklistToggle = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem('lesson07_checklist', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // 진행률 계산
  const completedChecklistCount = useMemo(() => {
    return Object.values(checklist).filter(Boolean).length;
  }, [checklist]);

  const checklistPercent = useMemo(() => {
    return Math.round((completedChecklistCount / 6) * 100);
  }, [completedChecklistCount]);

  const isAllCompleted = completedChecklistCount === 6;

  // ---------------------------------------------------------------------------
  // 쿠키클리커 상호작용 함수들
  // ---------------------------------------------------------------------------
  const handleClickCookie = () => {
    setCookieCount(prev => prev + clickPower);
    setClickToast(true);
    setTimeout(() => {
      setClickToast(false);
    }, 250);
  };

  const handleBuyOven = () => {
    if (cookieCount >= 10) {
      setCookieCount(prev => prev - 10);
      setClickPower(prev => prev + 1);
      setOvenLevel(prev => prev + 1);
    }
  };

  const handleBuyFairy = () => {
    if (cookieCount >= 25 && !fairyHired) {
      setCookieCount(prev => prev - 25);
      setFairyHired(true);
    }
  };

  const handleResetGame = () => {
    setCookieCount(0);
    setClickPower(1);
    setOvenLevel(0);
    setFairyHired(false);
  };

  const handleCopyJsCode = () => {
    const code = `// 🍪 실시간 쿠키클리커 자바스크립트 상태
let cookieCount = ${cookieCount}; // 현재 구운 쿠키
let clickPower = ${clickPower};  // 1클릭당 파워 (황금오븐 Lv.${ovenLevel})
let fairyActive = ${fairyHired}; // 자동 요정 셰프

// [이벤트 함수] 쿠키 클릭 시 실행
function clickCookie() {
  cookieCount += clickPower;
  document.getElementById('cookie-display').innerText = cookieCount;
}

// [업그레이드 함수] 황금 오븐 구매 (조건문)
if (cookieCount >= 10) {
  // 황금 오븐 버튼 활성화 완료!
}`;
    navigator.clipboard.writeText(code).then(() => {
      setIsJsCopied(true);
      setTimeout(() => setIsJsCopied(false), 1500);
    });
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 1500);
    });
  };

  const widthClasses = ['w-0', 'w-1/6', 'w-2/6', 'w-3/6', 'w-4/6', 'w-5/6', 'w-full'];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-500 selection:text-white">
      {/* ===================================================================== */}
      {/* [상단 GNB] 헤더 */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
              시즌 2 · 7강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              클릭하면 살아 움직인다! 자바스크립트 쿠키클리커 만들기
            </h1>
          </div>
        </div>

        {/* 4단계 스텝퍼 네비게이션 */}
                <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage1'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>시즌 2 오프닝</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage2'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>JS 3총사 마법</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage3'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>쿠키클리커 제작</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage4'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>오류 연구소</span>
          </button>
        </nav>

        {/* 우측 진척도 & 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">7강 진척도</span>
              <span className="text-xs text-amber-600 font-bold">{completedChecklistCount}/6 ({checklistPercent}%)</span>
            </div>
            <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full ${widthClasses[completedChecklistCount]}`}
              ></div>
            </div>
          </div>
          <div>
            {isAllCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 whitespace-nowrap animate-pulse">
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>8강 언락됨!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>8강 잠김</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 2-패널 */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">

        {/* =================================================================== */}
        {/* ■ 좌측 패널 (60% 폭) - 퀘스트 콘텐츠 가이드 (독립 슬라이드바) */}
        {/* =================================================================== */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 시즌 2 오프닝] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 히어로 섹션 */}
          <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-amber-100 border border-white/20 whitespace-nowrap">
                  <PlayCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>시즌 2 : 미니 웹 아케이드 &amp; 버그 헌터</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 whitespace-nowrap">
                  <Zap className="w-3 h-3 text-slate-950" />
                  <span>첫 아케이드 게임 개장!</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                클릭하면 살아 움직인다! 자바스크립트 쿠키클리커 만들기
              </h2>

              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-2xl font-normal">
                정적인 그림 같던 화면에 심장과 모터를 달아주는 시간! 클릭할 때마다 쿠키가 바삭바삭 구워지고 점수가 팡팡 터지는 나만의 아케이드 게임을 만듭니다.
              </p>

              {/* 4대 메타 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">핵심 마법</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">JS 3총사(변수·함수·이벤트)</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">제작 산출물</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">반응형 쿠키클리커 v1.0</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">주의 함정</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">글자 vs 숫자 덧셈 함정</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">약 40분 (체험 &amp; 실습)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 1: 시즌 2 오프닝 */}
          {/* ----------------------------------------------------------------- */}

              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                시즌 2 오프닝: 드디어 웹 화면에 심장이 뜁니다!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              시즌 1에서 우리는 멋진 이야기 대사창을 만들고 예쁜 CSS 옷을 입혔습니다. 하지만 아직은 아무리 버튼을 눌러도 대사가 바뀌거나 점수가 올라가지 않는 <strong>'움직이지 않는 로봇 조각상'</strong>이었어요.<br />
              오늘 만나는 <strong>자바스크립트(JavaScript)</strong>는 이 로봇에게 심장과 두뇌, 그리고 모터를 달아주는 마법의 프로그래밍 언어입니다!
            </p>

            {/* 웹 3총사 완전체 비유 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>1. HTML (뼈대)</span>
                </div>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  건물의 벽돌과 기둥! 쿠키 버튼과 점수 글자가 들어갈 자리를 마련해줍니다.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>2. CSS (화려한 옷)</span>
                </div>
                <p className="text-xs text-indigo-900/80 font-normal leading-relaxed">
                  알록달록 예쁜 색깔과 조약돌 모양 둥근 테두리, 그리고 마우스를 올렸을 때 빛나는 효과를 줍니다.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>3. JavaScript (심장 &amp; 두뇌!)</span>
                </div>
                <p className="text-xs text-amber-950 font-normal leading-relaxed">
                  버튼 클릭 신호를 감지하고, 숫자를 기억하며, 점수를 1개씩 팡팡 올려주는 진짜 살아있는 생명력입니다!
                </p>
              </div>
            </div>

            {/* 오늘 만들 미션 브리핑 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>오늘 만들 미니 아케이드: 쿠키클리커 v1.0</span>
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-normal">
                화면 한가운데 커다란 초코칩 쿠키가 있습니다. 마우스로 쿡 누를 때마다 점수가 올라가고, 쿠키를 10개 모으면 <strong>[황금 오븐 업그레이드]</strong>를 열어 클릭 한 번에 쿠키가 2개씩 구워지게 만듭니다!
              </p>
            </div>
          </article>

              {/* Stage 1 Bottom Navigation */}
              <div className="flex justify-end items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage2');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 JS 3총사 마법</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: JS 3총사 마법] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                자바스크립트 3총사 마법: 기억하고, 신호받고, 행동하라!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              자바스크립트가 화면을 움직이는 원리는 아주 간단합니다. 딱 3가지만 기억하면 세상의 모든 게임을 만들 수 있어요!
            </p>

            {/* 3대 마법 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>1. 변수 (기억 상자)</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 text-amber-300 p-2 rounded-lg">
                  let cookies = 0;
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>"여기에 쿠키 개수를 적어두자!"</strong> 하고 컴퓨터 기억장치에 이름표를 붙여둔 투명 보물상자입니다. 숫자가 올라갈 때마다 새 숫자로 갈아 끼웁니다.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <MousePointerClick className="w-4 h-4 text-amber-500" />
                  <span>2. 이벤트 (초인종 신호)</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 text-sky-300 p-2 rounded-lg">
                  onclick="bakeCookie()"
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>"손님이 마우스를 쿡 눌렀다!"</strong> 하고 알려주는 감시 센서 레이더입니다. 사용자의 클릭이나 터치 신호를 즉각 포착합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>3. 함수 (행동 레시피)</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 text-emerald-300 p-2 rounded-lg">
                  function bakeCookie() &#123; &#125;
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>"신호가 오면 이 순서대로 일해라!"</strong> 하고 적어둔 행동 지시서입니다. 숫자를 1개 늘리고 화면 글자를 바꾸는 일련의 동작을 묶어줍니다.
                </p>
              </div>
            </div>

            {/* 3총사 연결 흐름도 */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>✨ 자바스크립트가 일하는 4단계 흐름도</span>
                <span className="text-[11px] text-slate-400 font-mono">신호 ➔ 처리 ➔ 저장 ➔ 출력</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="block text-amber-400 font-bold mb-1">① 클릭 신호</span>
                  <span className="text-[11px] text-slate-300">손가락으로 쿡!</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="block text-emerald-400 font-bold mb-1">② 함수 호출</span>
                  <span className="text-[11px] text-slate-300">bakeCookie 실행</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="block text-indigo-400 font-bold mb-1">③ 변수 갱신</span>
                  <span className="text-[11px] text-slate-300">cookies = cookies + 1</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="block text-sky-400 font-bold mb-1">④ 화면 출력</span>
                  <span className="text-[11px] text-slate-300">DOM 글자 바꾸기</span>
                </div>
              </div>
            </div>

            {/* 미니 퀴즈 */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>도전! 즉석 1초 퀴즈</span>
              </div>
              <p className="text-xs text-amber-950 font-normal">
                자바스크립트에서 구운 쿠키의 개수처럼 계속 변하는 숫자를 기억해두는 <strong>'투명 이름표 상자'</strong>의 공식 이름은 무엇일까요?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setQuizAnswer(1)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    quizAnswer === 1
                      ? 'border-rose-300 bg-rose-50 text-rose-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  1. 함수 (Function)
                </button>
                <button
                  type="button"
                  onClick={() => setQuizAnswer(2)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    quizAnswer === 2
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  2. 변수 (Variable)
                </button>
                <button
                  type="button"
                  onClick={() => setQuizAnswer(3)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    quizAnswer === 3
                      ? 'border-rose-300 bg-rose-50 text-rose-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  3. 이벤트 (Event)
                </button>
              </div>

              {quizAnswer !== null && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed font-normal ${
                    quizAnswer === 2
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {quizAnswer === 2 ? (
                    <span>
                      <strong className="font-bold">정답입니다! 🎉</strong> 숫자를 기억해두는 보물상자는 바로 <strong>변수(Variable)</strong>입니다! 코드가 실행되는 동안 바뀐 점수를 계속 기억해줘요.
                    </span>
                  ) : (
                    <span>
                      <strong className="font-bold">아쉬워요!</strong> 행동을 묶어두는 것은 함수이고, 신호는 이벤트예요. 숫자를 보관하는 상자의 정답은 <strong>2번 변수(Variable)</strong>입니다!
                    </span>
                  )}
                </div>
              )}
            </div>
          </article>

              {/* 우측 쿠키 게임기 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [쿠키 게임기]를 시작하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 자바스크립트 3총사(변수, 이벤트 리스너, 함수)가 실제로 어떻게 동작하는지 체감할 차례입니다. 우측 콘솔의 <strong>[쿠키 게임기]</strong>에서 황금 쿠키를 클릭하고, 생산 업그레이드를 구매하며 숫자가 올라가는 인터랙션을 직접 체험해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('game')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [쿠키 게임기] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 시즌 2 오프닝
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 쿠키클리커 제작</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 쿠키클리커 제작] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                쿠키클리커 실전 제작: 코드 4단계 마법 조립
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              이제 우측 실습 콘솔에서 실제로 작동하는 쿠키클리커의 자바스크립트 코드를 단계별로 살펴봅시다. 복잡해 보이지만 딱 4단계뿐입니다!
            </p>

            {/* 4단계 코드 카드 */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>1단계: 쿠키 개수와 클릭 파워를 기억할 상자 만들기</span>
                </span>
                <pre className="font-mono text-xs bg-slate-900 text-indigo-300 p-2.5 rounded-lg overflow-x-auto">
{`let cookieCount = 0;  // 현재 구운 쿠키 개수
let clickPower = 1;   // 한 번 누를 때 얻는 쿠키 개수`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>2단계: 쿠키를 쿡 누를 때 실행할 마법 레시피(함수)</span>
                </span>
                <pre className="font-mono text-xs bg-slate-900 text-amber-300 p-2.5 rounded-lg overflow-x-auto">
{`function bakeCookie() {
  cookieCount = cookieCount + clickPower; // 파워만큼 쿠키 추가!
  updateDisplay(); // 화면에 새 숫자를 보여주기
}`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span>3단계: 화면에 숫자를 실제로 갈아 끼우는 기술 (DOM 조작)</span>
                </span>
                <pre className="font-mono text-xs bg-slate-900 text-sky-300 p-2.5 rounded-lg overflow-x-auto">
{`function updateDisplay() {
  const display = document.getElementById('cookie-display');
  display.innerText = cookieCount; // 글자를 상자 속 숫자로 변경!
}`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>4단계: 황금 오븐 업그레이드 상점 로직</span>
                </span>
                <pre className="font-mono text-xs bg-slate-900 text-emerald-300 p-2.5 rounded-lg overflow-x-auto">
{`function upgradeOven() {
  if (cookieCount >= 10) { // 쿠키가 10개 이상이면?
    cookieCount = cookieCount - 10; // 가격 10개 지불!
    clickPower = clickPower + 1;    // 이제 1클릭당 2개씩 획득!
    updateDisplay();
  }
}`}
                </pre>
              </div>
            </div>
          </article>

              {/* 우측 AI JS 주문서 연동 알림 카드 */}
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
                      원리를 파악했다면 우측 [AI JS 주문서] 탭을 열어 완성하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    쿠키클리커 4단계 조립 코드를 살펴보셨나요? 우측 콘솔의 <strong>[AI JS 주문서]</strong> 탭에서 AI 프롬프트를 복사하여 나만의 특수 기능(피버 타임, 황금 쿠키 폭발 등)을 추가하고 완성된 자바스크립트 코드를 실행해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('prompt')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [AI JS 주문서] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 JS 3총사 마법
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 오류 연구소</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 오류 연구소] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                명탐정 오류 연구소: 초보자가 꼭 빠지는 2대 함정!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              자바스크립트를 처음 배울 때 화면이 먹통이 되는 원인은 90%가 이 두 가지 실수 때문입니다. 미리 알아두면 버그를 만났을 때 바로 해결할 수 있어요!
            </p>

            {/* 2대 함정 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>함정 1: 글자 vs 숫자 덧셈 함정!</span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed font-normal">
                  따옴표로 둘러싸인 <code className="font-mono text-rose-700 font-bold">"1"</code>은 글자이고, 따옴표가 없는 <code className="font-mono text-emerald-700 font-bold">1</code>은 숫자입니다!<br />
                  • <code className="font-mono text-xs">"1" + 1</code> ➔ <strong className="text-rose-700 font-bold">"11"</strong> (글자 이어붙이기 대참사!)<br />
                  • <code className="font-mono text-xs">1 + 1</code> ➔ <strong className="text-emerald-700 font-bold">2</strong> (진짜 수학 덧셈!)
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <CircleDot className="w-4 h-4 text-amber-600" />
                  <span>함정 2: id 이름 오타 및 대소문자</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-normal">
                  HTML 태그에 <code className="font-mono text-xs font-bold">id="cookie-btn"</code>이라고 지어두고 JS에서 <code className="font-mono text-xs">getElementById('cookieBtn')</code>처럼 부르면 컴퓨터는 대소문자를 엄격히 따지기 때문에 찾지 못하고 멍때립니다 (<strong className="text-amber-800 font-bold">null 오류</strong>).
                </p>
              </div>
            </div>

            {/* 개발 회고 수첩 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>시즌 2 첫 아케이드 개발 수첩</span>
                </h4>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>자동 저장 중</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label htmlFor="tsx-retro-q1" className="font-bold text-slate-700 block mb-1">
                    Q1. 버튼을 눌렀을 때 숫자가 실시간으로 올라가는 것을 본 기분은 어떤가요?
                  </label>
                  <input
                    type="text"
                    id="tsx-retro-q1"
                    value={retro.q1}
                    onChange={(e) => handleRetroChange('q1', e.target.value)}
                    placeholder="예: 그냥 그림 같던 웹사이트가 진짜 살아있는 오락기가 된 것 같았어요!"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-normal"
                  />
                </div>
                <div>
                  <label htmlFor="tsx-retro-q2" className="font-bold text-slate-700 block mb-1">
                    Q2. 변수, 이벤트, 함수 3총사 중에서 내가 생각하기에 가장 핵심인 마법은 무엇인가요?
                  </label>
                  <input
                    type="text"
                    id="tsx-retro-q2"
                    value={retro.q2}
                    onChange={(e) => handleRetroChange('q2', e.target.value)}
                    placeholder="예: 클릭 신호를 받아주는 이벤트 덕분에 내가 누르는 손맛이 느껴졌어요."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-normal"
                  />
                </div>
              </div>
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 8강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 8강을 여세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    오늘 학습한 6대 자바스크립트 3총사(변수, 이벤트, DOM 제어) 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 8강(랜덤 가챠 머신 & 퀴즈 게임)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 8강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 쿠키클리커 제작
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
                  JUNIOR DEVELOPER GLOSSARY · 7강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 프론트엔드 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 자바스크립트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-amber-400" />
                      1. 자바스크립트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: JavaScript (JS)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">언어/실행엔진</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "정지된 로봇 화면에 심장을 달아주고, 버튼을 누르면 춤추게 만드는 마법의 생명 주문!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저에서 동적인 상호작용, 데이터 처리, 애니메이션 등을 제어할 수 있도록 해주는 객체 기반의 고수준 스크립트 언어(High-Level Scripting Language)입니다.
                </p>
              </div>
              {/* 용어 2: 변수 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-400" />
                      2. 변수
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Variable (let / const)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">메모리/데이터</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "게임 속 점수나 플레이어 이름을 적어두고 필요할 때마다 꺼내보는 이름표 달린 보물 상자!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 컴퓨터 메모리에 특정 데이터 값을 저장하고 필요에 따라 읽거나 재할당(Reassignment)하기 위해 이름을 부여한 기억 공간입니다.
                </p>
              </div>
              {/* 용어 3: 함수 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      3. 함수
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Function</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">동작/모듈</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "'쿠키 개수 늘리고 화면에 보여줘!'처럼 복잡한 일련의 주문을 버튼 하나에 모아둔 마법 도구함!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 특정 작업을 수행하기 위해 독립적으로 설계된 코드 블록으로, 입력값(매개변수)을 받아 처리 후 결과값(반환값)을 돌려주는 재사용 가능한 모듈입니다.
                </p>
              </div>
              {/* 용어 4: 이벤트 리스너 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <MousePointerClick className="w-4 h-4 text-purple-400" />
                      4. 이벤트 리스너
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Event Listener & Handler</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">인터랙션/이벤트</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "'손님이 마우스를 쿡 찌르는지 잘 지켜봐!' 하고 문 앞에서 기다리는 눈썰미 좋은 안내원!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자의 마우스 클릭, 키보드 입력, 터치 등 브라우저 환경에서 발생하는 특정 이벤트(Event)를 감지하여 등록된 콜백 함수를 실행시키는 메커니즘입니다.
                </p>
              </div>
              {/* 용어 5: 문서 객체 모델 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-rose-400" />
                      5. 문서 객체 모델
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 돔 (Document Object Model, DOM)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">웹/트리구조</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "자바스크립트가 웹 페이지 속 글자나 상자를 마음대로 조종할 수 있게 도와주는 거대한 장난감 조종 지도!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> HTML 문서를 계층적 트리 구조의 객체(노드)로 표현하여, 프로그래밍 언어가 웹 문서의 내용, 스타일, 구조를 동적으로 제어할 수 있도록 한 표준 인터페이스입니다.
                </p>
              </div>
              {/* 용어 6: 상태 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      6. 상태
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: State</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">데이터/라이프사이클</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "현재 내가 모은 쿠키 개수나 레벨처럼, 지금 이 순간 게임이 기억하고 있는 살아있는 정보들!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 애플리케이션의 특정 시점에 메모리에 저장되어 있는 데이터 값들의 집합으로, UI 렌더링과 비즈니스 로직 결정의 기준이 됩니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* =================================================================== */}
        {/* ■ 우측 패널 (40% 폭) - 실시간 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* =================================================================== */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar" aria-label="실시간 인터랙티브 실습 콘솔">

          {/* 상단 3단 탭 스위처 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('game')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'game'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>쿠키 게임기</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('prompt')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'prompt'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI JS 주문서</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>7강 완주 ({checklistPercent}%)</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 실시간 쿠키클리커 게임기 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'game' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      실시간 쿠키클리커 아케이드 v1.0
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleResetGame}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-slate-600 transition-colors cursor-pointer"
                      title="게임 초기화"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>초기화</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyJsCode}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-slate-700 transition-colors cursor-pointer"
                    >
                      {isJsCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>JS 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 게임 인터랙티브 스테이지 */}
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-orange-50/50 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-inner relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-800 block">현재 구운 바삭한 쿠키</span>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-amber-600 tracking-tight">{cookieCount}</span>
                      <span className="text-sm font-bold text-amber-700">개</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/80 border border-amber-200 text-amber-800 shadow-2xs">
                        <span>1클릭 파워:</span>
                        <strong className="text-orange-600">+{clickPower}개</strong>
                      </span>
                      {fairyHired && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span>요정 셰프 자동 굽기 중!</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 거대 쿠키 버튼 */}
                  <div className="relative py-2">
                    <button
                      type="button"
                      onClick={handleClickCookie}
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-2 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-90 transition-all duration-150 cursor-pointer flex items-center justify-center relative border-4 border-amber-200"
                      aria-label="쿠키 굽기 버튼"
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center relative">
                        <svg className="w-20 h-20 text-amber-950/70" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" fill="#d97706"/>
                          <circle cx="8" cy="8" r="1.5" fill="#451a03"/>
                          <circle cx="15" cy="7" r="1.8" fill="#451a03"/>
                          <circle cx="16" cy="14" r="1.6" fill="#451a03"/>
                          <circle cx="9" cy="15" r="2" fill="#451a03"/>
                          <circle cx="12" cy="11" r="1.4" fill="#451a03"/>
                        </svg>
                      </div>
                    </button>
                    {clickToast && (
                      <div className="absolute top-0 right-2 font-black text-amber-600 text-base transition-all -translate-y-4 opacity-100 duration-200 pointer-events-none">
                        +{clickPower}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-amber-900/80 font-normal">
                    쿠키를 힘차게 눌러 10개를 모으면 <strong>황금 오븐</strong>을 열 수 있습니다!
                  </p>
                </div>

                {/* 업그레이드 상점 */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>🛒 베이커리 업그레이드 상점</span>
                    <span className="text-[11px] text-slate-400 font-mono">자바스크립트 if 조건문 실습</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleBuyOven}
                      disabled={cookieCount < 10}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        cookieCount >= 10
                          ? 'border-amber-300 bg-amber-50 text-amber-900 cursor-pointer shadow-2xs hover:bg-amber-100'
                          : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">🔥 황금 오븐</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">10개 필요</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">클릭당 쿠키 +1 추가!</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 mt-1 block">현재: Lv.{ovenLevel}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyFairy}
                      disabled={cookieCount < 25 || fairyHired}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        fairyHired
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-700 cursor-default'
                          : cookieCount >= 25
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 cursor-pointer shadow-2xs hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">🧚 요정 셰프</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">25개 필요</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">1초마다 자동 +1 쿠키!</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 mt-1 block">
                        {fairyHired ? '현재: 고용됨 (초당 +1)' : '현재: 미고용'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 쿠키 스킨 변경 */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block">쿠키 디저트 스킨 변경</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentSkin('choco')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        currentSkin === 'choco'
                          ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      초코칩 쿠키
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSkin('donut')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        currentSkin === 'donut'
                          ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      딸기 도넛
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSkin('star')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        currentSkin === 'star'
                          ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      별사탕 보석
                    </button>
                  </div>
                </div>

                {/* 실시간 JS 코드 뷰어 */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <label htmlFor="tsx-js-editor" className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>실시간 동작 중인 JavaScript 코드</span>
                    <span className="text-[10px] font-mono text-emerald-600">State &amp; DOM Sync</span>
                  </label>
                  <textarea
                    id="tsx-js-editor"
                    rows={8}
                    value={`// 🍪 실시간 쿠키클리커 자바스크립트 상태
let cookieCount = ${cookieCount}; // 현재 구운 쿠키
let clickPower = ${clickPower};  // 1클릭당 파워 (황금오븐 Lv.${ovenLevel})
let fairyActive = ${fairyHired}; // 자동 요정 셰프

// [이벤트 함수] 쿠키 클릭 시 실행
function clickCookie() {
  cookieCount += clickPower;
  document.getElementById('cookie-display').innerText = cookieCount;
}

// [업그레이드 함수] 황금 오븐 구매 (조건문)
if (cookieCount >= 10) {
  // 황금 오븐 버튼 활성화 완료!
}`}
                    readOnly
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed bg-slate-900 text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    spellCheck={false}
                  ></textarea>
                </div>
              </div>

              {/* 요약 카드 */}
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>💡 자바스크립트 쿠키클리커 작동 공식 요약</span>
                </div>
                <ul className="text-[11px] text-amber-950/80 space-y-1 leading-relaxed">
                  <li>• <strong>변수(let cookies):</strong> 컴퓨터가 쿠키 개수를 기억하는 투명 상자</li>
                  <li>• <strong>이벤트(onclick):</strong> 플레이어가 쿠키를 쿡 누를 때 감지하는 레이더 센서</li>
                  <li>• <strong>함수(bakeCookie):</strong> "숫자를 늘리고 화면 글자를 바꿔라!" 하고 일하는 레시피 북</li>
                </ul>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: AI JS 주문서 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'prompt' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    AI 소환 프롬프트 주문서 모음
                  </h3>
                </div>

                {/* 주문서 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">① 황금 쿠키 돌발 보너스 이벤트 만들기</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p1', "초보자용 JavaScript 쿠키클리커 게임을 제작 중이야. 10초마다 화면 구석에 5초 동안 반짝이며 나타났다가 사라지는 '황금 쿠키' 이벤트를 만들어줘. 플레이어가 황금 쿠키를 클릭하면 즉시 쿠키 10개를 보너스로 얻고 멋진 축하 메시지가 뜨게 해줘. 초등학생도 이해할 수 있게 한 줄씩 한국어로 주석을 달아줘.")}
                      className="px-2 py-1 rounded text-[11px] font-bold border border-slate-200 hover:bg-white text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === 'p1' ? (
                        <span className="text-emerald-600 font-bold">복사됨!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-normal">
                    10초마다 깜짝 출현하는 황금 쿠키 보너스 이벤트 코드를 AI에게 주문합니다.
                  </p>
                </div>

                {/* 주문서 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">② 초당 자동 쿠키 생성기(CPS) 기능</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p2', "자바스크립트 setInterval 타이머 함수를 사용해서, 1초마다 자동으로 쿠키가 1개씩 구워지는 '자동 베이킹 오븐' 기능을 만들고 싶어. 게임이 켜지면 자동으로 작동하고 화면 점수판도 실시간으로 갱신되는 쉬운 코드를 작성해줘.")}
                      className="px-2 py-1 rounded text-[11px] font-bold border border-slate-200 hover:bg-white text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === 'p2' ? (
                        <span className="text-emerald-600 font-bold">복사됨!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-normal">
                    손으로 누르지 않아도 저절로 쿠키가 올라가는 타이머 마법 주문서입니다.
                  </p>
                </div>

                {/* 주문서 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-800">③ 100점 달성 축하 폭죽 효과</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p3', "쿠키클리커 게임에서 cookieCount가 100점에 도달하는 순간, 화면 전체에 알록달록 꽃가루 폭죽(Confetti)이 팡 터지며 '전설의 쿠키 명장 등극!' 팝업창이 뜨는 자바스크립트 효과를 만들어줘. 초보자용으로 가장 가볍고 쉬운 방식으로 구현해줘.")}
                      className="px-2 py-1 rounded text-[11px] font-bold border border-slate-200 hover:bg-white text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === 'p3' ? (
                        <span className="text-emerald-600 font-bold">복사됨!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-normal">
                    100개 목표를 달성했을 때 짜릿한 성취감을 주는 폭죽 효과 주문서입니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 7강 자가 점검 (6문항) */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      7강 퀘스트 완주 자가 점검 (6문항)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600 font-mono">
                    {completedChecklistCount} / 6 완료 ({checklistPercent}%)
                  </span>
                </div>

                {/* 게이지 바 */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-amber-500 rounded-full transition-all duration-300 ${widthClasses[completedChecklistCount]}`}
                  ></div>
                </div>

                {/* 체크리스트 문항 */}
                <div className="space-y-2 pt-1 text-xs">
                  <label
                    onClick={() => handleChecklistToggle('c1')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c1
                        ? 'bg-amber-50/60 text-amber-950 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c1}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">
                      1. 자바스크립트가 웹 화면에 심장과 모터를 달아주는 생명력 언어임을 이해했나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c2')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c2
                        ? 'bg-amber-50/60 text-amber-950 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c2}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">
                      2. 변수(`let cookies = 0`)가 컴퓨터 메모리에 숫자를 기억해두는 보물상자임을 확인했나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c3')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c3
                        ? 'bg-amber-50/60 text-amber-950 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c3}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">
                      3. 마우스 클릭을 감지하는 이벤트 센서(`onclick`)와 일하는 함수(`function`)의 연결을 이해했나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c4')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c4
                        ? 'bg-amber-50/60 text-amber-950 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c4}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">
                      4. `document.getElementById().innerText`로 화면의 글자를 숫자로 갈아 끼워보았나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c5')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c5
                        ? 'bg-amber-50/60 text-amber-950 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c5}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">
                      5. 글자 `"1" + 1`은 `"11"`이 되고 숫자 `1 + 1`은 `2`가 되는 덧셈 함정을 주의 깊게 확인했나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c6')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c6
                        ? 'bg-amber-50/60 text-amber-950 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c6}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">
                      6. 좌측 최하단의 <strong>[주니어 개발자를 위한 전문 용어 돋보기]</strong> 6단어를 끝까지 읽고 이해했나요?
                    </span>
                  </label>
                </div>

                {/* 게이트 락 및 완주 카드 */}
                {!isAllCompleted ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 8강 럭키 가차가 열립니다!</span>
                    <span className="font-bold text-slate-400">잠김 🔒</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 border border-amber-300 space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                      <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                      <span>축하합니다! 7강 퀘스트 완주 성공!</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-normal">
                      당신은 이제 웹 화면에 심장을 달아주고 숫자를 제어하는 **주니어 아케이드 게임 크리에이터**입니다!<br />
                      이제 다음 **8강(두근두근 랜덤 뽑기! 자바스크립트 럭키 가차 만들기)**으로 넘어가 행운의 확률 마법을 배워봅시다!
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

export default Lesson07;
