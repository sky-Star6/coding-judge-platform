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
  Hourglass,
  Loader2,
  LayoutGrid,
  ShieldAlert,
  LifeBuoy,
  Smile,
  MessageSquare,
  RefreshCw,
  Sliders,
  Inbox,
  Heart,
  WifiOff,
  GitBranch,
  Home,
  Layout,
  Clock,
  Target,
  BookOpen,
  LayoutTemplate,
  RotateCcw
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 3 · 17강 React 컴포넌트 (Lesson17.tsx)
 * 와이파이가 끊겨도 끄떡없어! 뺑글이 로딩 화면과 친절한 안내창
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'simulator' | 'inspect' | 'checklist';
type ScenarioKey = 'fast' | 'slow' | 'offline' | 'error';
type ViewState = 'idle' | 'loading' | 'success' | 'error';
type CodeMode = 'unsafe' | 'safe';

interface ScenarioInfo {
  latency: number;
  speedLabel: string;
  badgeText: string;
  status: number;
  ok: boolean;
  errorTitle?: string;
  errorDesc?: string;
  errorLog?: string;
  errorIcon?: string;
}

const SCENARIO_CONFIGS: Record<ScenarioKey, ScenarioInfo> = {
  fast: {
    latency: 300,
    speedLabel: 'Fast (300ms)',
    badgeText: '초고속 통신 ⚡',
    status: 200,
    ok: true
  },
  slow: {
    latency: 1800,
    speedLabel: 'Slow 3G (1,800ms)',
    badgeText: '지연 통신 🐢',
    status: 200,
    ok: true
  },
  offline: {
    latency: 800,
    speedLabel: 'Offline (단절)',
    badgeText: '와이파이 단절 🔌',
    status: 0,
    ok: false,
    errorTitle: '앗, 인터넷 연결이 불안정해요!',
    errorDesc: '와이파이나 데이터 케이블 연결 상태를 확인한 후 다시 시도해주세요.',
    errorLog: 'TypeError: Failed to fetch (NetworkOffline: Connection Refused)',
    errorIcon: 'wifi-off'
  },
  error: {
    latency: 600,
    speedLabel: 'Server Error (500)',
    badgeText: '서버 500 오류 💣',
    status: 500,
    ok: false,
    errorTitle: '서버가 잠시 휴식 중이에요 (500 Error)',
    errorDesc: '우주 서버에 일시적인 장애가 발생했습니다. 잠시 후 다시 시도해주세요.',
    errorLog: 'HTTPError: 500 Internal Server Error at api.petnews.com',
    errorIcon: 'alert-triangle'
  }
};

export const Lesson17: React.FC = () => {
  // 상태 관리
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [rightTab, setRightTab] = useState<RightConsoleTab>('simulator');
  const [currentScenario, setCurrentScenario] = useState<ScenarioKey>('fast');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [stepHighlight, setStepHighlight] = useState<'idle' | 'try' | 'catch' | 'success' | 'finally'>('idle');
  const [codeMode, setCodeMode] = useState<CodeMode>('safe');

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    // 로컬 스토리지 체크리스트 복원
    const savedChecks = [1, 2, 3, 4, 5, 6].map(idx => {
      return localStorage.getItem(`ai_lesson_17_check_${idx}`) === 'true';
    });
    setChecklist(savedChecks);
  }, []);

  const handleCheckChange = (index: number) => {
    const nextChecks = [...checklist];
    nextChecks[index] = !nextChecks[index];
    setChecklist(nextChecks);
    localStorage.setItem(`ai_lesson_17_check_${index + 1}`, nextChecks[index] ? 'true' : 'false');

    const allDone = nextChecks.every(Boolean);
    if (allDone) {
      localStorage.setItem('ai_lesson_17_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_17_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / checklist.length) * 100);
  const isLessonComplete = progressPercent === 100;

  // 네트워크 요청 시뮬레이션
  const handleTriggerNetwork = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setViewState('loading');
    setStepHighlight('try');

    const sc = SCENARIO_CONFIGS[currentScenario];

    setTimeout(() => {
      try {
        if (!sc.ok) {
          throw new Error(sc.errorLog || 'Network Error');
        }
        setViewState('success');
        setStepHighlight('success');
      } catch {
        setViewState('error');
        setStepHighlight('catch');
      } finally {
        setIsRequesting(false);
        setTimeout(() => {
          setStepHighlight('finally');
        }, 400);
      }
    }, sc.latency);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased" data-lesson-id="lesson_17">

      {/* ======================================================================= */}
      {/* [상단 GNB] 과정 홈 | 시즌 3 · 17강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a href="/materials/ai/index.html" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100">
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              시즌 3 · 17강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              와이파이가 끊겨도 끄떡없어! 뺑글이 로딩 화면과 친절한 안내창
            </h1>
          </div>
        </div>

        {/* 4단계 퀘스트 스텝퍼 */}
                <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage1'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>하얀 화면의 공포</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage2'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>스피너 &amp; 스켈레톤</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage3'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>try-catch 안전모</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage4'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>친절한 안내창 &amp; 복구</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span id="header-progress-text" className="text-indigo-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                id="header-progress-fill"
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          {isLessonComplete ? (
            <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span>18강 언락</span>
            </div>
          ) : (
            <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>18강 잠김</span>
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
          {/* [STAGE 1: 하얀 화면의 공포] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border border-indigo-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>시즌 3 트랙 5단계 · 예외 처리 &amp; 사용자 경험(UX)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  안전한 웹 서비스 만들기
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  와이파이가 끊겨도 끄떡없어!<br className="hidden sm:inline" />
                  뺑글이 로딩 화면과 친절한 안내창
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
                  네트워크 지연 시간을 지혜롭게 채우는 로딩 스피너와 스켈레톤 UI, 그리고 try-catch-finally 3단계 안전모로 완성하는 무적의 방어벽! 어떤 돌발 상황에서도 앱이 멈추거나 튕기지 않는 프로의 비결을 배웁니다.
                </p>
              </div>

              {/* 메타 카드 3개 박스 */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">소요 시간</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">약 40분</strong>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">실습 난이도</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">중급 · 실무 UX</strong>
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
              <div className="p-4 rounded-2xl bg-white/95 border border-indigo-100 space-y-2">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>이번 17강에서 완성할 핵심 무기 4가지</span>
                </span>
                <ul className="learning-goals-list grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>인터넷 지연 시간(Latency)의 원리와 하얀 먹통 현상 분석</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>지루함을 없애는 뺑글이 스피너와 종이틀 스켈레톤(Skeleton) 제작</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>프로그램 다운을 막는 3단계 무릎 보호대 try-catch-finally 장착</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>친절한 Fallback 안내창과 원클릭 '다시 시도' 복구 메커니즘 구축</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* STAGE 1 */}

              <section id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  어? 화면이 멈췄나? 하얀 화면의 공포
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Hourglass className="w-3.5 h-3.5 text-indigo-500" />
                <span>지연 시간과 불안감</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              식당에서 맛있는 햄버거를 주문했는데, 직원이 아무 말도 없이 멍하니 서 있거나 주방 문이 굳게 닫혀 있다면 어떤 생각이 들까요? "내 주문이 들어간 건가? 기계가 고장 났나?" 불안해서 주문 취소 버튼을 누르거나 가게를 나가버리고 싶어질 거예요.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>웹 브라우저 세상에서도 똑같은 일이 일어납니다!</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                우리가 버튼을 눌러 인터넷 건너편 서버에 데이터를 요청하면, 빛의 속도로 전파가 왕복하더라도 <strong>0.5초에서 2초 정도의 시간</strong>이 걸립니다. 이것을 <strong>네트워크 지연 시간(Latency)</strong>이라고 불러요. 이때 화면에 아무런 표시도 하지 않으면, 사용자는 "앱이 멈췄다!"고 오해하여 새로고침 버튼을 10번 연타하거나 앱을 꺼버리게 됩니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>나쁜 경험: 묵묵부답 하얀 화면</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <li>• 버튼을 눌러도 화면에 아무 변화가 없음</li>
                  <li>• 사용자가 버그나 오류로 오해하여 당황함</li>
                  <li>• 조급한 마음에 버튼을 마구 눌러 서버에 과부하를 줌</li>
                </ul>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>좋은 경험: 친절한 로딩 안내</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <li>• "데이터를 열심히 가져오는 중이에요!" 신호 전달</li>
                  <li>• 빙글빙글 도는 팽이나 반짝이는 종이틀로 기대감 조성</li>
                  <li>• 체감 대기 시간을 절반 이하로 줄여주는 심리 효과</li>
                </ul>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 스피너 &amp; 스켈레톤</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 스피너 &amp; 스켈레톤] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <section id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  뺑글이 스피너와 종이틀 스켈레톤
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>2대 로딩 인터페이스</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              개발자들은 사용자가 지루하지 않게 기다릴 수 있도록 두 가지 대표적인 시각 무기를 발명했습니다. 바로 <strong>회전 로딩 스피너</strong>와 <strong>스켈레톤(Skeleton) 화면</strong>입니다!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">1. 회전 로딩 스피너</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">Spinner</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  빙글빙글 팽이처럼 제자리에서 회전하는 원형 그래픽입니다. 간단한 버튼 클릭이나 화면 전체를 가리는 모달창에서 <strong>"잠시만 기다려 주세요!"</strong>라는 신호를 줄 때 아주 유용합니다.
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-indigo-700">
                  &lt;Loader2 className="animate-spin" /&gt;
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">2. 종이틀 스켈레톤</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">Skeleton</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  진짜 사진과 글자가 도착하기 전에, 들어올 자리의 크기와 모양을 미리 회색 네모 상자로 그려두고 깜빡이게 만드는 기법입니다. 유튜브나 인스타그램 피드처럼 내용물이 많은 화면에 최고입니다!
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-purple-700">
                  &lt;div className="bg-slate-200 animate-pulse h-4 rounded" /&gt;
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>왜 최신 앱들은 스피너 대신 스켈레톤을 더 좋아할까요?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                스피너는 "아직 멀었어"라는 느낌을 주지만, 스켈레톤은 "곧 여기에 제목이 나오고 사진이 뜰 거야!"라는 밑그림을 미리 보여주기 때문에 뇌가 정보를 예측하기 쉬워져 기다림이 훨씬 짧게 느껴진답니다.
              </p>
            </div>
          </section>

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
                  ← 이전: Stage 1 하얀 화면의 공포
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 try-catch 안전모</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: try-catch 안전모] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <section id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  무릎 보호대 삼총사! try-catch-finally
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                <span>예외 방어 문법</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              인터넷 세상에서는 언제든 돌발 사고가 생길 수 있습니다. 지하철 터널에서 와이파이가 끊기거나, 기상청 서버가 점검 중이거나, 주소를 살짝 잘못 적을 수도 있죠. 무방비 상태로 코드를 실행하면 자바스크립트는 <strong>"펑!" 하고 에러를 터뜨리며 앱 전체를 멈춰버립니다.</strong>
            </p>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <LifeBuoy className="w-4 h-4 text-amber-600" />
                <span>자전거를 탈 때 무릎 보호대를 차는 원리와 똑같아요!</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                넘어질까 봐 무서워서 자전거를 안 탈 수는 없죠? 대신 무릎 보호대와 헬멧을 착용하면 넘어져도 툭툭 털고 다시 일어날 수 있습니다. 프로그래밍에서는 바로 <strong>try-catch-finally</strong> 블록이 든든한 3단계 무릎 보호대입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px]">1</span>
                  <span>try &#123; 도전! &#125;</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "위험할 수 있지만 데이터를 요청해볼게!" 일단 정상 코드를 실행합니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px]">2</span>
                  <span>catch (error) &#123; 보호 &#125;</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "아야! 에러가 났지만 앱은 멈추지 않아!" 오류를 안전하게 포획하여 보관합니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">3</span>
                  <span>finally &#123; 뒷정리 &#125;</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "성공했든 실패했든 뺑글이 스피너는 꺼야지!" 무조건 마지막에 실행됩니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>safe-fetch.js</span>
                <span className="text-indigo-400">3단계 방어 표준 코드</span>
              </div>
              <pre className="font-mono text-xs text-indigo-200 leading-relaxed overflow-x-auto p-1">{`async function loadData() {
  setIsLoading(true); // 1. 뺑글이 켜기!
  try {
    const res = await fetch("https://api.petnews.com/feed");
    if (!res.ok) throw new Error("서버가 아파요!");
    const data = await res.json();
    setFeedData(data);  // 성공!
  } catch (err) {
    setErrorMsg("네트워크가 잠시 쉬고 있어요."); // 실패 시 포획!
  } finally {
    setIsLoading(false); // 3. 무조건 뺑글이 끄기!
  }
}`}</pre>
            </div>
          </section>

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
                  ← 이전: Stage 2 스피너 &amp; 스켈레톤
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 친절한 안내창 &amp; 복구</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 친절한 안내창 &amp; 복구] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <section id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  깜깜한 먹통 대신 친절한 안내창
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Fallback &amp; 자동 복구</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              에러가 났을 때 화면에 영어로 된 빨간 글씨를 그대로 보여주면 학생이나 일반 사용자는 겁을 먹습니다. 이때 진짜 실력 있는 개발자는 <strong>대체 안내 화면(Fallback UI)</strong>을 띄웁니다.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <strong className="text-xs sm:text-sm font-bold text-indigo-900 block">
                친절한 대체 안내 화면의 3대 필수 요소
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>1. 따뜻한 그림 &amp; 공감</span>
                  </span>
                  <span className="text-slate-600 text-[11px] leading-snug block">
                    끊어진 와이파이나 쉬고 있는 서버 아이콘으로 친근하게 다가갑니다.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>2. 쉬운 한국어 원인</span>
                  </span>
                  <span className="text-slate-600 text-[11px] leading-snug block">
                    "와이파이가 잠시 끊겼거나 신호가 약한 상태예요."라고 명확히 알려줍니다.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                    <span>3. 다시 시도 버튼</span>
                  </span>
                  <span className="text-slate-600 text-[11px] leading-snug block">
                    새로고침 없이 버튼 하나로 즉시 재요청할 수 있는 해결책을 줍니다.
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              우측 실습 콘솔에서 초고속 통신, 지연 통신, 와이파이 단절, 서버 에러의 4가지 시나리오를 직접 눌러보며, 스피너와 스켈레톤, 그리고 친절한 안내창이 어떻게 동작하는지 눈으로 직접 확인해보세요!
            </p>
          </section>

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
                  ← 이전: Stage 3 try-catch 안전모
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
                  JUNIOR DEVELOPER GLOSSARY · 17강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 안정성 엔지니어들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 네트워크 지연 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <WifiOff className="w-4 h-4 text-amber-400" />
                      1. 네트워크 지연
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Network Latency (Round Trip Time)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">네트워크/성능</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "배달 주문을 넣었을 때 배달 오토바이가 신호등에 걸려 도착할 때까지 걸리는 째깍째깍 기다림 시간!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 데이터 패킷이 출발지(클라이언트 브라우저)에서 목적지(API 서버)로 전송되어 다시 응답을 받아 돌아올 때까지 소요되는 왕복 지연 시간(RTT)입니다.
                </p>
              </div>
              {/* 용어 2: 회전 로딩 표시기 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 text-sky-400" />
                      2. 회전 로딩 표시기
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Loading Spinner (Activity Indicator)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">UI 피드백</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "컴퓨터가 쉬지 않고 열심히 일하고 있다고 알려주려고 빙글빙글 돌아가는 안심 바람개비!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 백그라운드 비동기 작업(I/O, 네트워크 통신)이 진행 중임을 사용자에게 시각적으로 알려주어, 앱이 멈추거나 먹통이 된 것이 아님을 안내하는 애니메이션 인디케이터입니다.
                </p>
              </div>
              {/* 용어 3: 스켈레톤 화면 구조 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <LayoutTemplate className="w-4 h-4 text-emerald-400" />
                      3. 스켈레톤 화면 구조
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Skeleton Screen (Placeholder Loading UI)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">UX/레이아웃</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "진짜 그림을 그리기 전에 스케치북에 연필로 먼저 슥슥 밑그림 윤곽선을 잡아두는 뼈대 스케치!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 콘텐츠가 로드되는 동안 실제 UI 컴포넌트의 레이아웃 형태를 모방한 연회색 회색 박스를 깜빡이며 먼저 보여줌으로써 사용자가 느끼는 대기 시간을 심리적으로 단축시키는 화면 설계 기법입니다.
                </p>
              </div>
              {/* 용어 4: 예외 방어 블록 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      4. 예외 방어 블록
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Exception Handling (try-catch-finally Defense)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">안전성/방어코드</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "스케이트보드를 탈 때 무릎 보호대와 헬멧을 차서 넘어져도 다치지 않고 툭툭 털고 일어나는 안전 장비!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 런타임에 발생할 수 있는 잠재적 오류(예외, Exception)를 try 블록으로 감싸서 시스템 중단을 방지하고, catch 블록에서 안전한 후속 조치를 취할 수 있도록 제어하는 방어 문법입니다.
                </p>
              </div>
              {/* 용어 5: 대체 안내 화면 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      5. 대체 안내 화면
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Fallback UI (Graceful Degradation)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">UX 복원력</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "자판기 음료수가 다 떨어졌을 때 그냥 돈을 삼키는 대신 '품절' 불을 켜고 돈을 돌려주는 친절한 자판기 안내판!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 주요 기능이나 원본 데이터 수신이 실패했을 때, 전체 시스템이 백지로 깨지는 대신 사용자에게 친절한 에러 메시지와 재시도 버튼을 제공하여 서비스 지속성을 유지하는 점진적 기능 저하 설계입니다.
                </p>
              </div>
              {/* 용어 6: 자동 재시도 로직 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-teal-400" />
                      6. 자동 재시도 로직
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Exponential Backoff & Retry (Auto-Recovery)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">신뢰성/알고리즘</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "친구 집 초인종을 눌렀는데 안 나오면, 1초 뒤에 한 번 더 누르고, 그래도 안 나오면 2초 뒤에 똑똑 노크해보는 스마트 벨!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 일시적인 네트워크 장애나 서버 혼잡으로 통신이 실패했을 때, 즉시 포기하지 않고 대기 시간을 점진적으로 늘려가며(지수 백오프) 자동으로 재차 HTTP 요청을 시도하여 시스템 성공률을 높이는 복구 알고리즘입니다.
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
              onClick={() => setRightTab('simulator')}
              id="right-tab-btn-simulator"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'simulator' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ActivityIcon className="w-3.5 h-3.5" />
              <span>상태 시뮬레이터</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('inspect')}
              id="right-tab-btn-inspect"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'inspect' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>타임라인 &amp; 코드</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('checklist')}
              id="right-tab-btn-checklist"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'checklist' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>점검표</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🌀 네트워크 상태 시뮬레이터 콘솔 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'simulator' && (
            <div id="right-tab-content-simulator" className="space-y-4">

              {/* 상태 선택 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">네트워크 환경 조작실</strong>
                  </div>
                  <span id="simulator-status-badge" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {isRequesting ? '통신 중... ⏳' : '대기 중 💤'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-1.5">네트워크 조건 선택</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setCurrentScenario('fast')}
                        id="btn-scene-fast"
                        className={`py-2 px-2 rounded-xl border text-center transition-all font-bold cursor-pointer ${
                          currentScenario === 'fast'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ⚡ 초고속(300ms)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentScenario('slow')}
                        id="btn-scene-slow"
                        className={`py-2 px-2 rounded-xl border text-center transition-all font-bold cursor-pointer ${
                          currentScenario === 'slow'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🐢 지연(1.8초)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentScenario('offline')}
                        id="btn-scene-offline"
                        className={`py-2 px-2 rounded-xl border text-center transition-all font-bold cursor-pointer ${
                          currentScenario === 'offline'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🔌 와이파이 단절
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentScenario('error')}
                        id="btn-scene-error"
                        className={`py-2 px-2 rounded-xl border text-center transition-all font-bold cursor-pointer ${
                          currentScenario === 'error'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        💣 서버 500 오류
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerNetwork}
                    id="run-network-btn"
                    disabled={isRequesting}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>🚀 데이터 요청 전송 (fetch)</span>
                  </button>
                </div>
              </div>

              {/* 가상 브라우저 화면 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      https://api.petnews.com/feed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span id="network-speed-indicator" className="text-indigo-600 font-bold">
                      {SCENARIO_CONFIGS[currentScenario].speedLabel}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 min-h-[300px] flex flex-col justify-center">
                  {/* IDLE */}
                  {viewState === 'idle' && (
                    <div id="view-idle" className="text-center py-8 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-800 block">데이터 요청 대기 중</strong>
                        <p className="text-xs text-slate-500 mt-1">상단의 '데이터 요청 전송' 버튼을 누르면 통신이 시작됩니다.</p>
                      </div>
                    </div>
                  )}

                  {/* LOADING */}
                  {viewState === 'loading' && (
                    <div id="view-loading" className="space-y-4">
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                          <span id="loading-desc-text">우주 서버에서 데이터를 배달받는 중...</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-600">
                          FETCHING
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
                              <div className="h-2.5 bg-slate-200 rounded w-1/3"></div>
                            </div>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                            <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
                              <div className="h-2.5 bg-slate-200 rounded w-1/4"></div>
                            </div>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {viewState === 'success' && (
                    <div id="view-success" className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>오늘의 반려동물 실시간 피드</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          200 OK (성공)
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                              🐱
                            </div>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">치즈냥이의 햇살 낮잠</strong>
                              <span className="text-[10px] text-slate-400">방금 전 도착</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            인기 급상승
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          따스한 창가에서 햇살을 받으며 세상 편하게 잠든 치즈 태비 고양이의 평화로운 일상입니다.
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>좋아요 1,420개</span>
                          </span>
                          <span className="text-indigo-600 font-medium">댓글 84개</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                              🐶
                            </div>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">골든리트리버 뭉치의 공놀이</strong>
                              <span className="text-[10px] text-slate-400">2분 전 도착</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            신규 등록
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          잔디밭을 신나게 달리며 노란 테니스공을 물고 환하게 웃는 뭉치의 귀여운 순간이에요!
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>좋아요 892개</span>
                          </span>
                          <span className="text-indigo-600 font-medium">댓글 35개</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ERROR */}
                  {viewState === 'error' && (
                    <div id="view-error" className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3.5">
                      <div id="error-icon-box" className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                        {SCENARIO_CONFIGS[currentScenario].errorIcon === 'wifi-off' ? (
                          <WifiOff className="w-6 h-6" />
                        ) : (
                          <AlertTriangle className="w-6 h-6" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <strong id="error-message-title" className="text-sm font-bold text-slate-900 block">
                          {SCENARIO_CONFIGS[currentScenario].errorTitle}
                        </strong>
                        <p id="error-message-desc" className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                          {SCENARIO_CONFIGS[currentScenario].errorDesc}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-left font-mono text-[11px] text-rose-700 space-y-1">
                        <span className="text-[10px] text-slate-400 block font-sans font-bold">포획된 에러 코드:</span>
                        <span id="error-tech-log" className="block font-bold">
                          {SCENARIO_CONFIGS[currentScenario].errorLog}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTriggerNetwork}
                        id="btn-retry-network"
                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>다시 시도하기 🔄</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3단계 안전모 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>try-catch-finally 3단계 안전모 파이프라인</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div
                    id="step-box-try"
                    className={`p-2.5 rounded-xl border space-y-1 transition-all ${
                      stepHighlight === 'try'
                        ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                        : stepHighlight === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="w-5 h-5 mx-auto rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="block">try &#123; 요청 &#125;</strong>
                    <span className="text-slate-500 text-[10px]">fetch() 시도</span>
                  </div>
                  <div
                    id="step-box-catch"
                    className={`p-2.5 rounded-xl border space-y-1 transition-all ${
                      stepHighlight === 'catch'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="w-5 h-5 mx-auto rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="block">catch &#123; 방어 &#125;</strong>
                    <span className="text-slate-500 text-[10px]">Fallback 렌더</span>
                  </div>
                  <div
                    id="step-box-finally"
                    className={`p-2.5 rounded-xl border space-y-1 transition-all ${
                      stepHighlight === 'finally'
                        ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="block">finally &#123; 종료 &#125;</strong>
                    <span className="text-slate-500 text-[10px]">스피너 OFF</span>
                  </div>
                </div>
              </div>

              {/* UX 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Award className="w-4 h-4" />
                  <span>실무 개발자의 4대 예외 처리 &amp; UX 공식</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">로딩 스피너 종료는 무조건 finally에서 처리</strong>
                      <span className="text-slate-400">성공하든 실패하든 finally 블록에서 isLoading = false를 보장하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">목록형 데이터는 스켈레톤(Skeleton) 우선 적용</strong>
                      <span className="text-slate-400">레이아웃 흔들림(CLS)을 막고 체감 대기 시간을 극적으로 단축합니다.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">사용자에게 영문 에러 코드를 날것 그대로 노출하지 않기</strong>
                      <span className="text-slate-400">친절한 한국어 안내와 따뜻한 아이콘으로 불안감을 해소하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">에러 안내창엔 언제나 '다시 시도' 버튼 제공</strong>
                      <span className="text-slate-400">사용자가 전체 페이지를 새로고침하지 않고도 스스로 복구하게 만듭니다.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 📊 상태 전환 타임라인 & 코드 비교 (Inspector) */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'inspect' && (
            <div id="right-tab-content-inspect" className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">상태 전이 &amp; 방어벽 코드</strong>
                  </div>
                  <span id="code-view-mode-badge" className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {codeMode === 'safe' ? 'Safe try-catch Code' : 'Unsafe (No Protection)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCodeMode('unsafe')}
                    id="btn-code-unsafe"
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      codeMode === 'unsafe' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    위험한 코드 (무방비)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeMode('safe')}
                    id="btn-code-safe"
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      codeMode === 'safe' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    안전한 방어벽 코드
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between"><span className="text-slate-500">Current State:</span> <strong id="inspect-current-state" className="text-indigo-600">{viewState.toUpperCase()}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Last Latency:</span> <strong id="inspect-latency-label" className="text-slate-800">{SCENARIO_CONFIGS[currentScenario].latency}ms</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Status Code:</span> <strong id="inspect-status-code" className="text-slate-800">{SCENARIO_CONFIGS[currentScenario].status} {SCENARIO_CONFIGS[currentScenario].ok ? 'OK' : 'Error'}</strong></div>
                </div>

                <div className="space-y-1.5">
                  <span id="code-viewer-label" className="text-[11px] font-bold text-slate-700 block">
                    {codeMode === 'safe' ? 'try-catch-finally 3단계 안전 코드' : '무방비 상태의 위험한 통신 코드'}
                  </span>
                  <pre id="code-payload-viewer" className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {codeMode === 'safe' ? `// [안전한 방어벽 표준 코드]
async function safeFetchNews() {
  setIsLoading(true); // 로딩 스피너 ON
  setError(null);

  try {
    const res = await fetch("https://api.petnews.com/feed");
    if (!res.ok) {
      throw new Error(\`서버 오류 발생: \${res.status}\`);
    }
    const data = await res.json();
    setFeedList(data.articles);
  } catch (err) {
    // 에러를 포획하여 친절한 Fallback 화면으로 전달!
    setError(err.message || "네트워크 연결 실패");
  } finally {
    // 성공/실패 여부와 무관하게 100% 실행 보장
    setIsLoading(false); // 로딩 스피너 OFF!
  }
}` : `// [위험한 무방비 코드]
async function dangerousFetchNews() {
  setIsLoading(true);

  // 에러 방어선이 전혀 없음!
  // 와이파이가 끊기거나 서버가 다운되면 앱이 즉시 멈추고 하얀 화면이 됨!
  const res = await fetch("https://api.petnews.com/feed");
  const data = await res.json();
  setFeedList(data.articles);

  // 만약 위에서 에러가 나면 이 코드는 절대 실행되지 않음!
  // 스피너가 영원히 멈추지 않고 뺑글뺑글 돕니다.
  setIsLoading(false);
}`}
                  </pre>
                </div>
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
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">17강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 18강이 열려요</span>
                    </div>
                  </div>
                  <span id="right-check-progress-text" className="text-xs font-mono font-bold text-indigo-600">
                    {checkedCount} / {checklist.length} ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    id="right-check-progress-fill"
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="space-y-2 pt-1" data-checklist-lesson="lesson_17">
                  {[
                    {
                      id: 1,
                      title: '1. 지연 시간(Latency)과 UX 재난 이해',
                      desc: '인터넷 통신 중 하얀 먹통 화면이 사용자에게 주는 불안감을 이해하고 로딩의 필요성을 파악했다.'
                    },
                    {
                      id: 2,
                      title: '2. 뺑글이 스피너와 animate-spin',
                      desc: 'Tailwind CSS의 animate-spin 클래스로 제자리 회전 로딩 표시기를 구현할 수 있다.'
                    },
                    {
                      id: 3,
                      title: '3. 종이틀 스켈레톤(Skeleton UI) 마스터',
                      desc: 'animate-pulse를 활용하여 데이터가 들어올 자리를 미리 보여주는 뼈대 화면을 설계했다.'
                    },
                    {
                      id: 4,
                      title: '4. try-catch 3단계 무릎 보호대',
                      desc: '네트워크 에러가 발생해도 프로그램이 멈추지 않도록 오류를 안전하게 포획하는 원리를 익혔다.'
                    },
                    {
                      id: 5,
                      title: '5. finally 블록의 스피너 종료 보장',
                      desc: '성공과 실패 여부와 상관없이 무조건 로딩 상태를 false로 정리하는 finally의 역할을 이해했다.'
                    },
                    {
                      id: 6,
                      title: '6. 친절한 Fallback 안내창과 다시 시도',
                      desc: '에러 화면에 쉬운 한국어 설명과 \'다시 시도하기\' 버튼을 붙여 사용자가 스스로 복구하게 도왔다.'
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
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900 block mb-0.5">{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {isLessonComplete && (
                  <div id="completion-card" className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <strong className="text-sm font-bold">17강 미션 완벽 정복! 🎉</strong>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed font-normal">
                      스피너, 스켈레톤, try-catch-finally 3단계 안전모와 친절한 대체 화면(Fallback UI)을 완벽히 마스터하셨습니다! 이제 시즌 3의 대단원! 나만의 스마트 도구를 완성하고 세상에 자랑하는 18강 프로젝트로 출발하세요.
                    </p>
                    <a
                      href="/materials/ai/lessons/18-smart-tool-showcase/index.html"
                      id="btn-unlock-next"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>18강: 세상에 하나뿐인 나만의 스마트 도구 완성 도전하기</span>
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

// Activity 아이콘 fallback
const ActivityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default Lesson17;
