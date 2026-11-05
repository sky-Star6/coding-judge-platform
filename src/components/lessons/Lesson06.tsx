import React, { useState, useEffect, useMemo } from 'react';
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
  Palette,
  Eye,
  Zap,
  Heart,
  Share2,
  BookOpen,
  Smartphone,
  Sliders,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 6강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'styler' | 'prompt' | 'checklist';
export type ThemeKey = 'fantasy' | 'cyber' | 'candy';

export interface Lesson06Props {
  onComplete?: () => void;
}

export const Lesson06: React.FC<Lesson06Props> = ({ onComplete }) => {
  // ---------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('styler');
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('fantasy');
  const [isCssCopied, setIsCssCopied] = useState(false);
  const [tuneRadius, setTuneRadius] = useState<'md' | 'xl' | '3xl'>('xl');
  const [tuneFont, setTuneFont] = useState<'sm' | 'base' | 'lg'>('base');

  // 미니 퀴즈 상태
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // 프롬프트 복사 토스트 상태
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // 시즌 1 완주 수첩 (회고)
  const [retro, setRetro] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
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

  // 3대 테마 데이터
  const themes = {
    fantasy: {
      name: '다크 판타지',
      badge: '🌌 다크 판타지',
      stageBg: 'bg-slate-950 border-indigo-900 text-white',
      titleColor: 'text-indigo-300 border-indigo-800',
      boxBg: 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/50',
      nameColor: 'text-amber-300',
      textColor: 'text-slate-300',
      btn1: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30',
      btn2: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700',
      cssCode: `/* 🌌 다크 판타지 테마 CSS */
body {
  background-color: #020617; /* 칠흑 같은 밤하늘 */
  color: #f8fafc;
}
h1 {
  color: #a5b4fc;
  border-bottom: 2px solid #312e81;
}
.dialogue-box {
  background-color: rgba(15, 23, 42, 0.9);
  border: 1px solid #6366f1;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.2);
}
.character-name {
  color: #fde68a; /* 황금빛 텍스트 */
  font-weight: bold;
}
button {
  background-color: #4f46e5;
  color: white;
  border-radius: 12px;
  transition: all 0.2s ease;
}
button:hover {
  background-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
}`
    },
    cyber: {
      name: '네온 사이버',
      badge: '⚡ 네온 사이버',
      stageBg: 'bg-zinc-950 border-cyan-800 text-cyan-50',
      titleColor: 'text-cyan-400 border-cyan-700',
      boxBg: 'bg-zinc-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/50',
      nameColor: 'text-fuchsia-400',
      textColor: 'text-zinc-300',
      btn1: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-500/40 font-extrabold',
      btn2: 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-800',
      cssCode: `/* ⚡ 네온 사이버 테마 CSS */
body {
  background-color: #09090b; /* 네온 골목 칠흑 */
  color: #ecfeff;
}
h1 {
  color: #22d3ee;
  border-bottom: 2px solid #0891b2;
}
.dialogue-box {
  background-color: rgba(24, 24, 27, 0.9);
  border: 1px solid #06b6d4;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}
.character-name {
  color: #e879f9; /* 네온 핑크 */
  font-weight: bold;
}
button {
  background-color: #06b6d4;
  color: #09090b;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.2s;
}
button:hover {
  background-color: #22d3ee;
  box-shadow: 0 0 20px #22d3ee;
}`
    },
    candy: {
      name: '솜사탕 동화',
      badge: '🌸 솜사탕 동화',
      stageBg: 'bg-rose-50/80 border-rose-200 text-slate-800',
      titleColor: 'text-rose-600 border-rose-200',
      boxBg: 'bg-white border-rose-300 shadow-lg shadow-rose-200/50',
      nameColor: 'text-rose-500',
      textColor: 'text-slate-700',
      btn1: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-400/30',
      btn2: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200',
      cssCode: `/* 🌸 솜사탕 동화 테마 CSS */
body {
  background-color: #fff1f2; /* 부드러운 딸기우유색 */
  color: #1e293b;
}
h1 {
  color: #e11d48;
  border-bottom: 2px dashed #fda4af;
}
.dialogue-box {
  background-color: #ffffff;
  border: 2px solid #f43f5e;
  border-radius: 24px; /* 동글동글 조약돌 */
  box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.2);
}
.character-name {
  color: #f43f5e; /* 딸기 시럽색 */
  font-weight: bold;
}
button {
  background-color: #f43f5e;
  color: white;
  border-radius: 20px;
  transition: all 0.2s ease;
}
button:hover {
  background-color: #fb7185;
  transform: scale(1.05);
}`
    }
  };

  // ---------------------------------------------------------------------------
  // 로컬 스토리지 연동 및 초기화
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const savedRetro = localStorage.getItem('lesson06_retro');
      if (savedRetro) {
        setRetro(JSON.parse(savedRetro));
      }
      const savedChecklist = localStorage.getItem('lesson06_checklist');
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
      localStorage.setItem('lesson06_retro', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChecklistToggle = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem('lesson06_checklist', JSON.stringify(updated));
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

  useEffect(() => {
    if (isAllCompleted && onComplete) {
      onComplete();
    }
  }, [isAllCompleted, onComplete]);

  // 스테이지 변경 시 좌측 패널 상단 스크롤
  const handleStageChange = (stage: StageTab) => {
    setActiveStage(stage);
    const leftPanel = document.querySelector('section[aria-label="퀘스트 콘텐츠 패널"]');
    if (leftPanel) {
      leftPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 프롬프트 원클릭 복사
  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => {
      setCopiedPromptId(null);
    }, 1500);
  };

  // CSS 코드 복사
  const handleCopyCss = () => {
    navigator.clipboard.writeText(themes[currentTheme].cssCode);
    setIsCssCopied(true);
    setTimeout(() => {
      setIsCssCopied(false);
    }, 1500);
  };

  const curThemeObj = themes[currentTheme];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans text-base sm:text-lg leading-relaxed selection:bg-indigo-100 selection:text-indigo-900 flex flex-col antialiased">

      {/* ===================================================================== */}
      {/* 1. 상단 글로벌 GNB & 4단계 퀘스트 스텝퍼 */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-[1720px] h-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <a
                href="../../index.html"
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 font-bold"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span className="text-xs sm:text-sm font-bold">홈</span>
              </a>
              <span className="text-slate-300">/</span>
              <a href="../05-html-dialogue/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">5강 HTML 다이얼로그</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200/60 whitespace-nowrap">시즌 1 완주 · 6강 CSS 쇼케이스</span>
            </nav>
          </div>

          {/* 우측: 6강 완료 게이지 & 4단계 퀘스트 스텝퍼 & 시즌 2 언락 뱃지 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span className="text-xs text-amber-600 font-bold font-mono">{completedChecklistCount}/6 ({checklistPercent}%)</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" role="tablist">
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage1'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>피날레 브리핑</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage2'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>CSS 마법 문법</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage3')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage3'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>AI 감성 스타일러</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage4'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>쇼케이스 &amp; 완주</span>
                </button>
              </nav>
            </div>

            <div id="header-unlock-badge-wrapper">
              {isAllCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 whitespace-nowrap animate-pulse">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span>시즌 2 (7강) 언락됨!</span>
                </span>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" />
                  <span>시즌 2 잠김</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. 메인 워크스페이스 컨테이너 (좌·우 독립 슬라이드바 2-패널 스플릿 뷰) */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">

        {/* =================================================================== */}
        {/* ■ 좌측 패널 (60% 폭) - 동적 퀘스트 콘텐츠 영역 (독립 슬라이드바) */}
        {/* =================================================================== */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 1: 피날레 브리핑 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 히어로 배너 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-100/50 via-indigo-50/40 to-transparent rounded-full blur-3xl -z-10"></div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    시즌 1 최종 완성 피날레
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    소요 시간: 40분
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    CSS 비주얼 스타일링 &amp; 쇼케이스
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  게임 화면에 화려한 마법 옷 입히기!<br />
                  <span className="bg-gradient-to-r from-amber-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                    CSS 스타일링과 나만의 비주얼 노벨 v1 완성 쇼케이스
                  </span>
                </h1>

                <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  5강에서 조립한 우리 게임의 HTML 대사창, 기억나시나요? 뼈대는 훌륭했지만 흰 바탕에 검은 글씨라 아직은 조금 썰렁했을 거예요.<br />
                  이번 6강에서는 <strong className="text-indigo-700 font-bold">마법의 페인트통과 네온 조명인 CSS</strong>를 사용해, 칠흑 같은 밤하늘 배경을 깔고 반짝이는 선택 버튼을 만들어 **진짜 상용 게임 같은 감성적인 비주얼 노벨 v1.0**을 완성합니다!
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>시즌 1 완주 목표: 내 인터랙티브 게임북을 친구에게 보여주고 첫 플레이어 모시기</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStageChange('stage2')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm ml-auto cursor-pointer"
                  >
                    <span>CSS 마법 배우러 가기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 벤토 카드 1: 비포 & 애프터 비교 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    ✨ CSS 마법 전과 후: 비포(Before) vs 애프터(After)
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  글자만 적혀 있던 메모장 화면이 CSS 몇 줄로 어떻게 몰입감 넘치는 게임으로 바뀌는지 비교해보세요!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">[-] 5강 HTML만 있을 때</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-bold">단순 뼈대</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-300 font-sans text-xs space-y-1 text-slate-800">
                      <div className="font-bold text-sm">고대 도서관 3층</div>
                      <div className="text-slate-600">마법사 루카: "수상한 푸른빛이 새어 나와..."</div>
                      <div className="pt-1 flex gap-1">
                        <span className="px-2 py-1 bg-slate-200 border border-slate-400 text-[11px] rounded">📘 푸른 책 조사</span>
                        <span className="px-2 py-1 bg-slate-200 border border-slate-400 text-[11px] rounded">🚪 도망치기</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">흑백 메모장 같아서 판타지 게임의 분위기가 전혀 느껴지지 않아요.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900 space-y-2 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">[+] 6강 CSS 마법을 입혔을 때</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-900 text-indigo-200 font-bold">판타지 완성</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-indigo-500/50 font-sans text-xs space-y-1 shadow-lg shadow-indigo-500/20">
                      <div className="font-bold text-sm text-indigo-300 border-b border-indigo-800/80 pb-1">고대 도서관 3층</div>
                      <div className="text-slate-300"><span className="text-amber-300 font-bold">마법사 루카:</span> "수상한 푸른빛이 새어 나와..."</div>
                      <div className="pt-1 flex gap-1.5">
                        <span className="px-2 py-1 bg-indigo-600 text-white font-bold text-[11px] rounded-lg shadow-md shadow-indigo-600/40">📘 푸른 책 조사</span>
                        <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded-lg">🚪 도망치기</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-indigo-300/80 font-normal">신비로운 밤하늘 배경에 반짝이는 네온 버튼까지, 진짜 상용 게임 같아요!</p>
                  </div>
                </div>
              </div>

              {/* 벤토 카드 2: 6강 3대 핵심 미션 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    🎯 오늘 우리가 완수할 3가지 피날레 미션
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">1</div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">CSS 4대 마법 속성 마스터</h3>
                    <p className="text-[11px] text-slate-600 leading-normal font-normal">
                      배경색(`background`), 글자색(`color`), 모서리 둥글리기(`border-radius`), 마우스 올림 효과(`:hover`)를 배웁니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">2</div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">원클릭 테마 변신 실습</h3>
                    <p className="text-[11px] text-slate-600 leading-normal font-normal">
                      우측 콘솔에서 다크 판타지, 네온 사이버, 솜사탕 동화 테마로 내 게임 화면의 옷을 순식간에 갈아입힙니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">시즌 1 완주 쇼케이스 &amp; 뱃지</h3>
                    <p className="text-[11px] text-slate-600 leading-normal font-normal">
                      완성된 비주얼 노벨 v1을 공유하고, 6주간의 모험을 기념하는 공식 수료 뱃지와 트로피를 획득합니다!
                    </p>
                  </div>
                </div>
              </div>

              {/* 다음 단계 버튼 */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleStageChange('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>2단계: CSS 마법 문법 배우러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 2: CSS 마법 문법 & 4대 핵심 속성 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* 섹션 타이틀 카드 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <Code2 className="w-4 h-4" />
                  <span>2단계 · 스타일링 공식</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  CSS 문법의 황금 공식: "누구에게 { 무엇을: 어떻게; }"
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  CSS는 영어가 아니라 **단순한 주문서(레시피)**예요. 딱 3단어의 순서만 기억하면 브라우저의 모든 것을 내 마음대로 꾸밀 수 있습니다.
                </p>
              </div>

              {/* 벤토 카드: CSS 기본 공식 구조 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    📜 3단계 주문 공식과 세미콜론(;) 마침표 규칙
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm space-y-2">
                  <div className="text-slate-400 text-xs"># CSS의 3단계 기본 공식</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700 font-bold">선택자 (누구에게)</span>
                    <span className="text-slate-400">&#123;</span>
                    <span className="px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700 font-bold">속성 (무엇을)</span>
                    <span className="text-slate-400">:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-bold">값 (어떻게)</span>
                    <span className="text-rose-400 font-bold font-sans">;</span>
                    <span className="text-slate-400">&#125;</span>
                  </div>
                  <div className="text-slate-300 text-xs pt-2 space-y-1">
                    <div><strong className="text-amber-300">button</strong> &#123;</div>
                    <div className="pl-4"><strong className="text-sky-300">background-color</strong>: <strong className="text-emerald-300">#4f46e5</strong><span className="text-rose-400 font-bold font-sans">;</span> <span className="text-slate-500 font-sans">/* 버튼 배경을 남색으로! */</span></div>
                    <div className="pl-4"><strong className="text-sky-300">color</strong>: <strong className="text-emerald-300">white</strong><span className="text-rose-400 font-bold font-sans">;</span> <span className="text-slate-500 font-sans">/* 글자색은 하얗게! */</span></div>
                    <div>&#125;</div>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 font-sans">
                    💡 주문이 끝날 때마다 반드시 세미콜론(<strong className="text-rose-400">;</strong>) 마침표를 찍어주어야 다음 주문을 알아듣습니다!
                  </div>
                </div>
              </div>

              {/* 벤토 카드: 판타지 감성 4대 핵심 속성 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    🎨 판타지 감성을 살리는 4대 핵심 속성
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-mono font-bold text-xs">background-color</span>
                      <span className="text-[11px] font-bold text-slate-500">배경색 마법</span>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-normal">
                      `#0f172a`(깊은 밤하늘색)나 `#1e1b4b`(마법사 연구실색)로 전체 배경 분위기를 순식간에 바꿉니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold text-xs">color</span>
                      <span className="text-[11px] font-bold text-slate-500">글자색 조명</span>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-normal">
                      대사와 제목 글자의 색상이에요. `#fde68a`(황금빛)나 `#38bdf8`(시원한 푸른빛)으로 시선을 끕니다.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-bold text-xs">border-radius</span>
                      <span className="text-[11px] font-bold text-slate-500">모서리 둥글리기</span>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-normal">
                      뾰족한 직사각형 모서리를 둥글게 깎아 부드러운 게임 대사창과 알약 모양 버튼으로 만듭니다 (`12px`, `20px`).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold text-xs">:hover 마법</span>
                      <span className="text-[11px] font-bold text-slate-500">마우스 반응 효과</span>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-normal">
                      `button:hover` 주문을 걸면 플레이어가 마우스를 버튼 위에 올렸을 때 버튼이 커지거나 불빛이 켜집니다!
                    </p>
                  </div>
                </div>
              </div>

              {/* 미니 퀴즈 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    🎯 10초 퀴즈! 버튼 위에 마우스를 올렸을 때만 스타일을 바꾸는 마법은?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setQuizAnswer(1); setQuizSubmitted(true); }}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all ${
                      quizAnswer === 1
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    1. button:click
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuizAnswer(2); setQuizSubmitted(true); }}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all ${
                      quizAnswer === 2
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    2. button:hover ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuizAnswer(3); setQuizSubmitted(true); }}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all ${
                      quizAnswer === 3
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    3. button:touch
                  </button>
                </div>

                {quizSubmitted && (
                  <div className={`p-3.5 rounded-xl text-xs leading-relaxed font-normal ${
                    quizAnswer === 2
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}>
                    {quizAnswer === 2 ? (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">정답입니다! 🎉</strong> 마우스를 요소 위에 올렸을 때(:hover) 상태를 지정하는 가상 클래스입니다!
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">아쉬워요!</strong> 마우스를 올리는 동작은 영어로 "Hover"예요. 정답은 <strong>2번 button:hover</strong>입니다!
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

                            {/* 우측 테마 스타일러 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [테마 스타일러]를 시작하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 CSS 4대 마법 속성(color, background, border, font)을 직접 조작해 볼 차례입니다. 우측 콘솔의 <strong>[테마 스타일러]</strong>에서 슬라이더와 테마 프리셋을 클릭하여 대화창이 실시간으로 변신하는 모습을 관찰해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('styler')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [테마 스타일러] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 스텝퍼 이동 버튼 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleStageChange('stage1')}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>1단계로 돌아가기</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStageChange('stage3')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>3단계: AI 테마 스타일러 실습 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 3: AI 감성 스타일러 & 테마 실습 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* 섹션 헤더 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <Bot className="w-4 h-4" />
                  <span>3단계 · 감성 테마 프롬프트</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  내 세계관에 찰떡인 CSS 마법 옷을 AI에게 주문하는 법
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  내 스토리가 '우주 탐사선'인지, '신비한 마법 학교'인지, '달콤한 디저트 카페'인지에 따라 어울리는 색상과 분위기가 완전히 다릅니다.<br />
                  AI에게 <strong className="text-indigo-700 font-semibold">내 게임의 세계관 분위기를 전달하고 어울리는 &lt;style&gt; 코드를 1초 만에 받아내는 주문서</strong>를 활용해 보세요!
                </p>
              </div>

              {/* 프롬프트 카드 1: 테마 CSS 요청 주문서 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      세계관 맞춤형 감성 CSS 테마 생성 주문서
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt('p1', `너는 게임 UI 전문 웹 디자이너야.
내 게임은 [세계관 키워드: 예: 어두운 판타지 동굴 / 사이버펑크 네온 도시] 분위기야.
5강에서 만든 내 HTML 대사창(<h1>, <div class="dialogue-box">, <span class="name">, <p>, <button>)에 딱 어울리는 감성적인 CSS 코드를 작성해 줘:
1. 전체 배경색 (밤하늘이나 어두운 질감의 감성 색상)
2. 대사창 테두리와 부드러운 둥근 모서리(border-radius)
3. 마우스를 올렸을 때(:hover) 살짝 커지며 네온 빛이 나는 버튼 효과
# 초보자가 복사해서 바로 쓸 수 있게 <style> 태그 안에 넣어주고, 각 속성마다 친절한 설명을 달아줘.`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700 cursor-pointer"
                  >
                    {copiedPromptId === 'p1' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사 완료! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed space-y-1.5">
                  <div className="text-slate-400"># 게임 테마 CSS 스타일 주문서</div>
                  <div>너는 게임 UI 전문 웹 디자이너야.</div>
                  <div>내 게임은 [세계관 키워드] 분위기야.</div>
                  <div>내 HTML 대사창에 딱 어울리는 감성적인 CSS 코드를 작성해 줘:</div>
                  <div className="text-amber-300 pl-3">1. 전체 배경색 (밤하늘이나 어두운 질감의 감성 색상)</div>
                  <div className="text-amber-300 pl-3">2. 대사창 테두리와 부드러운 둥근 모서리(border-radius)</div>
                  <div className="text-amber-300 pl-3">3. 마우스를 올렸을 때(:hover) 살짝 커지며 네온 빛이 나는 버튼 효과</div>
                  <div className="text-slate-400 pt-1"># &lt;style&gt; 태그 안에 넣어주고 친절한 설명을 달아줘.</div>
                </div>
              </div>

              {/* 3대 인기 테마 안내 */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 rounded-2xl p-5 sm:p-6 border border-indigo-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-bold text-indigo-950">
                    우측 콘솔에서 3대 인기 테마를 원클릭으로 체험해보세요!
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  우측 실습 콘솔의 **[🌌 다크 판타지]**, **[⚡ 네온 사이버]**, **[🌸 솜사탕 동화]** 버튼을 눌러보세요. 코드가 어떻게 바뀌고 화면이 어떻게 변신하는지 실시간으로 확인하며 내 스타일에 맞게 직접 숫자를 바꿔볼 수 있습니다!
                </p>
              </div>

                            {/* 우측 AI 테마 주문서 연동 알림 카드 */}
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
                      테마 스타일을 선택했다면 우측의 [AI 테마 주문서]를 확인하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    내 게임 세계관에 어울리는 완성형 CSS 테마를 AI에게 요청해 볼 차례입니다. 우측 콘솔의 <strong>[AI 테마 주문서]</strong>에서 네온 사이버펑크, 클래식 레트로 등 실전 테마 프롬프트를 원클릭 복사하여 AI 서비스에 전송해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('prompt')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [AI 테마 주문서] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 스텝퍼 이동 버튼 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleStageChange('stage2')}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>2단계로 돌아가기</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStageChange('stage4')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>4단계: 쇼케이스 &amp; 완주 축하받기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 4: 쇼케이스 & 시즌 1 완주 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* 섹션 헤더 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>4단계 · 시즌 1 그랜드 피날레</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  축하합니다! 나만의 인터랙티브 비주얼 노벨 v1.0 완성!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  1강 AI 팩트체크부터 2강 캐릭터 시트, 3강 분기 트리, 4강 밸런스 패치, 5강 HTML 조립, 그리고 6강 CSS 감성 스타일링까지!<br />
                  우리가 머릿속으로 상상했던 이야기와 규칙이 마침내 **진짜 웹 브라우저에서 실행되는 멋진 인터랙티브 게임**으로 탄생했습니다!
                </p>
              </div>

              {/* 3분 짝꿍 플레이 쇼케이스 가이드 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    🎮 3분 짝꿍 플레이 쇼케이스 페스티벌
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  완성된 내 게임 화면을 옆자리 친구나 가족에게 보여주고 직접 버튼을 클릭해보게 하세요!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-indigo-700 block">1. 첫인상 질문하기</span>
                    <p className="text-slate-600 font-normal">"내 게임 화면의 색상과 버튼 분위기가 어때 보여?"</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-sky-700 block">2. 선택지 플레이</span>
                    <p className="text-slate-600 font-normal">"어느 버튼을 누르고 싶었어? 그 이유는 뭐야?"</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-700 block">3. 피드백 기록</span>
                    <p className="text-slate-600 font-normal">친구가 칭찬해준 점과 아쉬웠던 점을 아래 수첩에 적기!</p>
                  </div>
                </div>
              </div>

              {/* 시즌 1 완주 회고록 폼 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    🏆 주니어 크리에이터 시즌 1 완주 수첩 (회고)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      1. 1강부터 6강까지 내가 완성한 비주얼 노벨의 제목과 한 줄 소개는?
                    </label>
                    <input
                      type="text"
                      value={retro.q1}
                      onChange={e => handleRetroChange('q1', e.target.value)}
                      placeholder="예: '별빛 미궁의 시간 여행자' - 과거와 미래를 넘나들며 시공간 탈출 암호를 푸는 모험 게임"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      2. 오늘 CSS로 꾸미면서 가장 마음에 드는 시각적 효과는 무엇인가요?
                    </label>
                    <input
                      type="text"
                      value={retro.q2}
                      onChange={e => handleRetroChange('q2', e.target.value)}
                      placeholder="예: 어두운 우주 배경 위에 마우스를 올리면 형광 민트색으로 커지는 네온 버튼"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      3. 친구나 가족이 내 게임을 플레이하고 해준 가장 기분 좋은 칭찬은?
                    </label>
                    <input
                      type="text"
                      value={retro.q3}
                      onChange={e => handleRetroChange('q3', e.target.value)}
                      placeholder="예: 진짜 닌텐도 게임 화면처럼 버튼 누르는 맛이 난다고 칭찬해 주었어요"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      4. 다음 시즌 2(자바스크립트 아케이드 게임 &amp; 쿠키클리커)에서 가장 기대되는 점은?
                    </label>
                    <input
                      type="text"
                      value={retro.q4}
                      onChange={e => handleRetroChange('q4', e.target.value)}
                      placeholder="예: 버튼을 클릭할 때마다 진짜 점수가 팡팡 올라가고 친구들과 최고 랭킹전을 펼치는 것!"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* [실습 지시] 우측 체크리스트 및 시즌 1 완주 & 시즌 2강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />쇼케이스와 회고를 마쳤다면 우측 [체크리스트]를 완료하고 시즌 1을 완주하세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    오늘 완성한 CSS 마법 스타일링과 시즌 1 6대 핵심 역량을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 공식 주니어 웹 게임 크리에이터 인증 뱃지와 함께 시즌 2(7강 자바스크립트 쿠키클리커)가 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 시즌 1 완주] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 스텝퍼 이동 버튼 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleStageChange('stage3')}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>3단계로 돌아가기</span>
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
                  JUNIOR DEVELOPER GLOSSARY · 6강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 웹 퍼블리셔들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 캐스케이딩 스타일 시트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-indigo-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      1. 캐스케이딩 스타일 시트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Cascading Style Sheets (CSS)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-mono flex-shrink-0">CSS</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "회색 시멘트 레고 성벽에 알록달록 무지개 페인트를 칠하고 네온 조명을 켜는 마법 분장 기술입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> HTML로 작성된 웹 문서의 레이아웃, 색상, 글꼴, 시각적 효과 등 프레젠테이션(표현) 계층을 구조와 분리하여 제어하는 스타일시트 표준 언어입니다.
                </p>
              </div>

              {/* 용어 2: 선택자 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-sky-400" />
                      2. 선택자
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: CSS Selector</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">Selector</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "빨간 모자를 쓴 사람 나와라!" 하고 콕 집어 마법을 걸 대상을 지목하는 타겟팅 지팡이입니다.</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 스타일 규칙을 적용할 특정 HTML 요소(태그명, 클래스, 아이디 등)를 지정하는 패턴 식별자입니다.
                </p>
              </div>

              {/* 용어 3: 박스 모델 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      3. 박스 모델
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: CSS Box Model</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">BoxModel</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "선물 상자의 푹신한 뽁뽁이 안쪽 포장(패딩)과 상자 겉면의 단단한 상자벽(테두리), 상자 밖의 안전거리(마진)입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 요소가 콘텐츠(Content), 안쪽 여백(Padding), 테두리(Border), 바깥 여백(Margin)의 4중 사각형 레이어로 공간을 차지하는 레이아웃 기본 모델입니다.
                </p>
              </div>

              {/* 용어 4: 가상 클래스 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      4. 가상 클래스
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Pseudo-class (:hover)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">State</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "버튼이 얌전히 있다가 마우스 손가락이 다가오면 반짝! 눈을 뜨며 색깔이 바뀌는 카멜레온 변신 마법입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 요소의 특별한 상태(마우스 오버 `:hover`, 포커스 `:focus`, 방문 기록 `:visited` 등)에 따라 동적으로 스타일을 적용하는 선택자 확장 키워드입니다.
                </p>
              </div>

              {/* 용어 5: 반응형 웹 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-rose-400" />
                      5. 반응형 웹
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Responsive Web Design</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">Responsive</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "물을 담는 그릇의 크기(스마트폰, 태블릿, 대형 모니터)에 따라 스스로 모습을 찰떡같이 바꾸는 슬라임 화면입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 다양한 기기의 화면 크기와 해상도를 감지하여 미디어 쿼리(Media Query) 등을 통해 최적의 레이아웃으로 유연하게 재배치되는 웹 디자인 기법입니다.
                </p>
              </div>

              {/* 용어 6: 디자인 시스템 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      6. 디자인 시스템
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Design System &amp; Tokens</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">Tokens</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "레고 세트의 공식 색상 팔레트처럼, 게임 전체의 버튼과 글자 모양을 통일감 있게 맞추어 주는 약속 상자입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 일관된 사용자 경험(UX)과 브랜드 아이덴티티를 유지하기 위해 색상, 폰트, 간격, 컴포넌트 규칙을 체계적으로 표준화한 디자인 자산 규격입니다.
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
              onClick={() => setActiveRightTab('styler')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'styler'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>테마 스타일러</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('prompt')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI 테마 주문서</span>
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
              <span>시즌 1 완주 ({checklistPercent}%)</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 실시간 테마 스타일러 & 라이브 뷰어 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'styler' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      실시간 게임 화면 뷰어 &amp; 테마 체인저
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCss}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-slate-700 transition-colors"
                  >
                    {isCssCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>CSS 복사</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3대 테마 선택 버튼 */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">원클릭 감성 테마 변신:</span>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('fantasy')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                        currentTheme === 'fantasy'
                          ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      🌌 다크 판타지
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('cyber')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                        currentTheme === 'cyber'
                          ? 'border border-cyan-300 bg-cyan-50 text-cyan-800 shadow-sm'
                          : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ⚡ 네온 사이버
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('candy')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                        currentTheme === 'candy'
                          ? 'border border-rose-300 bg-rose-50 text-rose-800 shadow-sm'
                          : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      🌸 솜사탕 동화
                    </button>
                  </div>
                </div>

                {/* 실시간 렌더링 게임 화면 뷰어 */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">라이브 게임 화면 (마우스를 버튼에 올려보세요!)</span>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                      {curThemeObj.name}
                    </span>
                  </div>
                  
                  <div className={`rounded-2xl border transition-all duration-300 p-5 space-y-3 min-h-[200px] shadow-inner flex flex-col justify-between ${curThemeObj.stageBg}`}>
                    <h1 className={`text-sm sm:text-base font-extrabold pb-1.5 border-b transition-all ${curThemeObj.titleColor}`}>
                      고대 도서관 3층의 비밀
                    </h1>
                    
                    <div className={`p-3.5 border transition-all space-y-1.5 ${curThemeObj.boxBg} ${tuneRadius === "md" ? "rounded-md" : tuneRadius === "xl" ? "rounded-xl" : "rounded-3xl"}`}>
                      <span className={`text-xs font-bold block transition-all ${curThemeObj.nameColor}`}>
                        마법사 루카 (Lv.1):
                      </span>
                      <p className={`leading-relaxed font-normal transition-all ${curThemeObj.textColor} ${tuneFont === "sm" ? "text-[11px]" : tuneFont === "base" ? "text-xs" : "text-sm"}`}>
                        "쉿! 저 먼지 쌓인 서가 뒤에서 수상한 푸른빛이 새어 나오고 있어. 어서 결정을 내려야 해!"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => alert('📘 푸른 책을 조심스럽게 꺼냈습니다!')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${curThemeObj.btn1}`}
                      >
                        📘 푸른 책을 집어 든다
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('🚪 살금살금 계단으로 탈출했습니다!')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${curThemeObj.btn2}`}
                      >
                        🚪 계단으로 도망친다
                      </button>
                    </div>
                  </div>
                </div>

                {/* CSS 코드 미리보기 */}
                <div className="space-y-1 pt-1">
                  <label htmlFor="tsx-css-editor" className="text-xs font-bold text-slate-700 block">
                    적용 중인 CSS 코드
                  </label>
                  <textarea
                    id="tsx-css-editor"
                    rows={7}
                    value={curThemeObj.cssCode}
                    readOnly
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed bg-slate-900 text-sky-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    spellCheck={false}
                  ></textarea>
                </div>

                {/* 마법 세부 튜닝 컨트롤러 (Live Tuning Knobs) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>마법 세부 조율 (Live CSS Tuning)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">실시간 화면 &amp; 코드 반영</span>
                  </div>

                  {/* 대사창 둥글기 조절 */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">모서리 둥글기 (border-radius)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTuneRadius('md')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          tuneRadius === 'md'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        4px (각진형)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTuneRadius('xl')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          tuneRadius === 'xl'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        16px (표준)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTuneRadius('3xl')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          tuneRadius === '3xl'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        28px (알약형)
                      </button>
                    </div>
                  </div>

                  {/* 글자 크기 조절 */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">글자 크기 (font-size)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTuneFont('sm')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          tuneFont === 'sm'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        작게 (12px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTuneFont('base')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          tuneFont === 'base'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        보통 (14px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTuneFont('lg')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          tuneFont === 'lg'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        크게 (16px)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 💡 CSS 핵심 3요소 마법 공식 요약 카드 */}
              <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>💡 CSS 스타일링 핵심 3대 공식 요약</span>
                </div>
                <ul className="text-[11px] text-indigo-950/80 space-y-1 leading-relaxed">
                  <li>• <strong>누구에게(선택자):</strong> 꾸미고 싶은 태그나 클래스 이름 (`h1`, `button`, `.dialogue-box`)</li>
                  <li>• <strong>무엇을(속성):</strong> 바꾸고 싶은 외형 부위 (`background-color`, `color`, `border-radius`)</li>
                  <li>• <strong>어떻게(값 + ;):</strong> 구체적인 색상이나 크기 수치를 적고 반드시 <strong>세미콜론(;) 마침표</strong>로 닫기</li>
                </ul>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: AI 테마 주문서 (프롬프트 복사기) */}
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
                    <span className="text-xs font-bold text-indigo-700">① 세계관 맞춤형 감성 CSS 테마 생성</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p1', `너는 게임 UI 전문 웹 디자이너야.
내 게임은 [세계관 키워드: 예: 어두운 판타지 동굴 / 사이버펑크 네온 도시] 분위기야.
5강에서 만든 내 HTML 대사창(<h1>, <div class="dialogue-box">, <span class="name">, <p>, <button>)에 딱 어울리는 감성적인 CSS 코드를 작성해 줘:
1. 전체 배경색 (밤하늘이나 어두운 질감의 감성 색상)
2. 대사창 테두리와 부드러운 둥근 모서리(border-radius)
3. 마우스를 올렸을 때(:hover) 살짝 커지며 네온 빛이 나는 버튼 효과
# 초보자가 복사해서 바로 쓸 수 있게 <style> 태그 안에 넣어주고, 각 속성마다 친절한 설명을 달아줘.`)}
                      className="px-2 py-1 rounded text-[11px] font-bold border border-slate-200 hover:bg-white text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === 'p1' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-normal">
                    내 게임 장르(판타지/SF/학원물)를 넣으면 배경, 폰트, 대사창, 마우스 반응 네온 버튼까지 완벽한 CSS 코드를 완성해 줍니다.
                  </p>
                </div>

                {/* 주문서 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-700">② 마우스 호버(:hover) 반짝임 효과 생성</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p2', `내 비주얼 노벨의 선택지 버튼에 플레이어가 마우스를 올렸을 때(:hover) 살짝 1.05배 커지고, 네온 광채(box-shadow)가 반짝이는 세련된 CSS 코드를 작성해 줘. 부드럽게 움직이도록 transition 속성도 꼭 포함해 줘.`)}
                      className="px-2 py-1 rounded text-[11px] font-bold border border-slate-200 hover:bg-white text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPromptId === 'p2' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-normal">
                    선택지 버튼을 누를 때 쫀득하고 생생한 손맛을 주는 고급 마우스 오버 효과 주문서입니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 시즌 1 완주 점검표 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      시즌 1 완주 점검표 (6문항)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {completedChecklistCount} / 6 완료 ({checklistPercent}%)
                  </span>
                </div>

                {/* 게이지 바 */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  ></div>
                </div>

                {/* 체크리스트 문항 6개 */}
                <div className="space-y-2 pt-1 text-xs" data-checklist-lesson="lesson_06">
                  <label
                    onClick={() => handleChecklistToggle('c1')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c1
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c1}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-snug">
                      1. CSS 문법의 3단계 기본 공식(선택자, 속성, 값)과 세미콜론(;) 마침표 규칙을 이해했나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c2')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c2
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c2}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-snug">
                      2. 배경색(`background-color`)과 글자색(`color`)으로 내 게임의 감성 분위기를 연출했나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c3')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c3
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c3}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-snug">
                      3. `border-radius` 속성을 조절해 대사창과 버튼의 뾰족한 모서리를 둥글게 다듬었나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c4')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c4
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c4}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-snug">
                      4. 마우스를 올렸을 때 색상이 바뀌는 `:hover` 효과를 직접 체험하고 적용해보았나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c5')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c5
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c5}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-snug">
                      5. 1강부터 6강까지 내가 만든 비주얼 노벨 v1.0을 친구나 가족에게 쇼케이스로 보여주었나요?
                    </span>
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('c6')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist.c6
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.c6}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="leading-snug">
                      6. 좌측 최하단의 <strong>[주니어 개발자를 위한 전문 용어 돋보기]</strong> 6단어를 끝까지 읽고 이해했나요?
                    </span>
                  </label>
                </div>

                {/* 완주 카드 */}
                {isAllCompleted ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-300 space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                      <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                      <span>🎉 축하합니다! 시즌 1 그랜드 완주 성공!</span>
                    </div>
                    <p className="text-xs text-emerald-950 leading-relaxed font-normal">
                      당신은 이제 멋진 이야기를 쓰고 웹 화면으로 구현해내는 **공식 주니어 웹 게임 크리에이터**입니다!<br />
                      이제 다음 **시즌 2(미니 웹 아케이드 &amp; 버그 헌터 - 7강 자바스크립트 쿠키클리커)**로 넘어가 화면을 살아 숨쉬게 만들어봅시다!
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 시즌 1 완주 뱃지와 시즌 2가 열립니다!</span>
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

export default Lesson06;
