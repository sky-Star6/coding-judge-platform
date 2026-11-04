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
  Wrench,
  Smartphone,
  Palette,
  Blocks,
  Share2,
  User,
  Heart,
  CloudSun,
  Utensils,
  PawPrint,
  Clock,
  Target,
  Home,
  Layout,
  Wifi,
  Battery,
  MessageCircle,
  BookOpen,
  Boxes,
  Link
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 3 · 18강 React 컴포넌트 (Lesson18.tsx)
 * 가족과 친구에게 자랑하기: 세상에 하나뿐인 나만의 스마트 도구 완성
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'builder' | 'preview' | 'checklist';
type ToolType = 'weather' | 'lunch' | 'pet' | 'fortune';
type ThemeColor = 'sky' | 'emerald' | 'rose' | 'purple';

interface ToolConfig {
  type: ToolType;
  name: string;
  theme: ThemeColor;
  message: string;
}

const THEME_STYLES: Record<ThemeColor, {
  bannerBg: string;
  badgeBg: string;
  activeBtn: string;
  accentColor: string;
}> = {
  sky: {
    bannerBg: 'from-sky-500 to-blue-600',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    activeBtn: 'bg-sky-50 border-sky-300 text-sky-700 font-bold',
    accentColor: 'text-sky-600'
  },
  emerald: {
    bannerBg: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBtn: 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold',
    accentColor: 'text-emerald-600'
  },
  rose: {
    bannerBg: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    activeBtn: 'bg-rose-50 border-rose-300 text-rose-700 font-bold',
    accentColor: 'text-rose-600'
  },
  purple: {
    bannerBg: 'from-purple-600 to-indigo-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    activeBtn: 'bg-purple-50 border-purple-300 text-purple-700 font-bold',
    accentColor: 'text-purple-600'
  }
};

export const Lesson18: React.FC = () => {
  // 상태 관리
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [rightTab, setRightTab] = useState<RightConsoleTab>('builder');

  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    type: 'weather',
    name: '은우의 아침 날씨 비서',
    theme: 'sky',
    message: '오늘 비 오니까 우산 잊지 마! 오늘도 좋은 하루 보내! 💖'
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    // 로컬 스토리지 체크리스트 복원
    const savedChecks = [1, 2, 3, 4, 5, 6].map(idx => {
      return localStorage.getItem(`ai_lesson_18_check_${idx}`) === 'true';
    });
    setChecklist(savedChecks);
  }, []);

  const handleCheckChange = (index: number) => {
    const nextChecks = [...checklist];
    nextChecks[index] = !nextChecks[index];
    setChecklist(nextChecks);
    localStorage.setItem(`ai_lesson_18_check_${index + 1}`, nextChecks[index] ? 'true' : 'false');

    const allDone = nextChecks.every(Boolean);
    if (allDone) {
      localStorage.setItem('ai_lesson_18_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_18_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / checklist.length) * 100);
  const isLessonComplete = progressPercent === 100;

  const handleToolTypeChange = (type: ToolType) => {
    let defaultName = '나만의 스마트 도구';
    if (type === 'weather') defaultName = '은우의 아침 날씨 비서';
    else if (type === 'lunch') defaultName = '민서네 맛있는 급식 알리미';
    else if (type === 'pet') defaultName = '포켓몬 백과사전 도감';
    else if (type === 'fortune') defaultName = '매일매일 럭키 조언기';

    setToolConfig(prev => ({
      ...prev,
      type,
      name: defaultName
    }));
  };

  const shareUrl = `https://judge.ai/share#tool=${toolConfig.type}&theme=${toolConfig.theme}&name=${encodeURIComponent(toolConfig.name)}&msg=${encodeURIComponent(toolConfig.message)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentTheme = THEME_STYLES[toolConfig.theme];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased" data-lesson-id="lesson_18">

      {/* ======================================================================= */}
      {/* [상단 GNB] 과정 홈 | 시즌 3 · 18강 피날레 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a href="/materials/ai/index.html" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100">
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              시즌 3 피날레 · 18강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              가족과 친구에게 자랑하기: 세상에 하나뿐인 나만의 스마트 도구 완성
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
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>종합 융합 레고</span>
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
            <span>개인화 커스텀</span>
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
            <span>마법 링크 공유</span>
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
            <span>시즌 3 완주 인증</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span id="header-progress-text" className="text-amber-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                id="header-progress-fill"
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          {isLessonComplete ? (
            <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span>19강 언락</span>
            </div>
          ) : (
            <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>19강 잠김</span>
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
          {/* [STAGE 1: 종합 융합 레고] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border border-amber-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-200/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>시즌 3 피날레 대단원 · 종합 프로젝트 &amp; 쇼케이스</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  세상에 하나뿐인 나만의 도구
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  가족과 친구에게 자랑하기:<br className="hidden sm:inline" />
                  세상에 하나뿐인 나만의 스마트 도구 완성
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
                  JSON, fetch, 오픈 API, 조건부 추천, 그리고 예외 방어까지! 시즌 3에서 연마한 모든 마법을 하나로 융합하여 가족과 친구들이 매일 쓸 수 있는 진짜 웹 서비스를 완성하고 링크로 공유합니다.
                </p>
              </div>

              {/* 메타 카드 3개 박스 */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">소요 시간</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">약 45분</strong>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">실습 난이도</span>
                    <strong className="text-xs font-bold text-slate-800 whitespace-nowrap">종합 실전 프로젝트</strong>
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
              <div className="p-4 rounded-2xl bg-white/95 border border-amber-100 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>이번 18강에서 달성할 4가지 마스터 미션</span>
                </span>
                <ul className="learning-goals-list grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>시즌 3 5대 핵심 기술(JSON, fetch, API, 조건식, 예외처리)을 결합하기</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>닉네임과 테마 컬러, 맞춤 메시지가 살아있는 개인화 엔진 구축</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>카카오톡 및 메시지로 즉시 전달하는 1-Click 마법 링크(URL Hash) 생성</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>시즌 3 실생활 스마트 도구 트랙 완주 디지털 마스터 인증서 획득</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* STAGE 1 */}

              <section id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  장난감에서 진짜 서비스로! 종합 융합 레고 블록
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Blocks className="w-3.5 h-3.5 text-amber-600" />
                <span>5대 기술 결합</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              지금까지 우리가 배운 코딩 기술들은 각자 개성 넘치는 강력한 레고 블록들이었습니다. 흩어져 있을 때는 작은 조각에 불과하지만, 이 조각들을 지혜롭게 딱딱 맞물려 조립하면 세상에 하나뿐인 멋진 스마트 도구가 탄생합니다!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">13강</span>
                  <span>JSON 사물함</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  컴퓨터와 사람이 함께 읽는 깔끔한 이름표 서랍장(Key-Value 데이터)
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-[10px]">14강</span>
                  <span>fetch 배달 오토바이</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  멀리 있는 교육청/기상청 서버까지 빛의 속도로 달려가 데이터를 가져오는 배달부
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">15강</span>
                  <span>오픈 데이터 검색 돋보기</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  수천 가지 정보 중 내가 원하는 것만 쏙쏙 골라내는 필터와 매직 카드
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-[10px]">16강</span>
                  <span>조건부 코디 스타일리스트</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  기온이 20도 이하이면 가디건을, 비가 오면 우산 뱃지를 띄우는 if-else 화면 마법
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>여기에 17강의 '3단계 무릎 보호대(try-catch)'가 더해지면?</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                와이파이가 끊겨도 앱이 꺼지지 않고, 뺑글이 스피너와 친절한 안내창이 뜨는 <strong>진짜 상용 에듀테크 서비스 수준의 견고한 앱</strong>이 완성됩니다!
              </p>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 개인화 커스텀</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 개인화 커스텀] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <section id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  세상에 하나뿐인 나만의 커스텀! 개인화 엔진
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>맞춤형 테마 설계</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              똑같은 가방이라도 내 이름표가 붙어 있고 좋아하는 키링이 달려 있으면 훨씬 소중해지죠? 웹 서비스도 마찬가지입니다. 사용자가 자신의 이름과 좋아하는 테마 컬러, 맞춤 메시지를 직접 지정할 수 있을 때 진짜 애착이 생깁니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. 도구 이름 (닉네임)</span>
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "은우의 아침 날씨 비서", "민서네 맛있는 급식 알리미"처럼 나만의 브랜드 타이틀을 부여합니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. 4가지 감성 테마</span>
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  오션 스카이, 에메랄드 민트, 로맨틱 로즈, 사이버 퍼플 등 취향에 맞는 비주얼 옷을 입힙니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>3. 친구 선물 메시지</span>
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "오늘 비 오니까 우산 잊지 마!", "맛있게 먹고 파이팅!" 같은 따뜻한 한 줄을 담습니다.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>동적 상태 바인딩 (State Binding) 원리</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                우측 제작실 폼에서 글자를 입력하거나 테마 라디오를 누르면, 자바스크립트가 실시간으로 객체(toolConfig)의 값을 바꾸고 즉시 가상 스마트폰 화면을 다시 렌더링(Re-render)합니다!
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
                  ← 이전: Stage 1 종합 융합 레고
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
                  <span>다음: Stage 3 마법 링크 공유</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 마법 링크 공유] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <section id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  친구에게 마법 링크 보내기! URL 공유의 비밀
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-amber-600" />
                <span>상태 직렬화 &amp; 링크</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              내가 기껏 멋지게 세팅해 놓았는데, 친구에게 보여주려고 컴퓨터를 들고 갈 수는 없겠죠? 인터넷 브라우저에서는 <strong>주소창의 URL 뒤에 비밀 암호(해시, #)</strong>를 실어 보내면, 전 세계 어디서든 친구가 그 링크를 누르는 순간 내가 꾸민 그대로 화면이 열립니다!
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-900 block">
                마법 링크의 주소창 구조 돋보기
              </span>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-200 font-mono text-xs text-indigo-800 break-all leading-relaxed">
                https://myjudge.app/tool<strong>#type=weather&amp;theme=emerald&amp;name=은우의날씨비서</strong>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                • <code>#</code> 뒤에 적힌 암호들은 서버를 거치지 않고 브라우저가 바로 읽어내어, 친구 스마트폰에서도 내 세팅 그대로 화면을 복원해 줍니다!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Copy className="w-4 h-4 text-indigo-600" />
                  <span>1-Click 클립보드 복사</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <code>navigator.clipboard.writeText()</code> 마법으로 버튼 한 번에 주소를 주머니에 쏙 넣습니다.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Web Share 스마트폰 공유</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  모바일 폰에서는 카카오톡, 메시지 전송 다이얼로그가 화면에 즉시 뿅 하고 떠오릅니다.
                </p>
              </div>
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
                  ← 이전: Stage 2 개인화 커스텀
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
                  <span>다음: Stage 4 시즌 3 완주 인증</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 시즌 3 완주 인증] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <section id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  주니어 오픈 API 마스터 등극! 시즌 3 완주와 회고
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>명예의 전당</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              13강 'JSON 외계인 통신'부터 시작하여 18강 '나만의 스마트 도구 완성'까지, 여러분은 6번의 거대한 모험을 성공적으로 마쳤습니다. 이제 여러분은 단순히 남이 만든 프로그램을 쓰는 사용자가 아니라, <strong>공공 데이터를 활용해 세상 사람들의 문제를 해결해 주는 진짜 소프트웨어 창작자</strong>입니다!
            </p>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border border-amber-300 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Award className="w-5 h-5 text-amber-600" />
                <span>시즌 3 실생활 스마트 도구 트랙 공식 완주 인증</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                우측 실습 콘솔에서 6개 자가 점검 체크리스트를 모두 완료하면, 여러분의 이름이 새겨진 <strong>'시즌 3 주니어 오픈 API 마스터 디지털 인증서'</strong>가 즉시 발급됩니다. 친구들과 부모님께 자랑스럽게 보여주세요!
              </p>
            </div>
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
                  ← 이전: Stage 3 마법 링크 공유
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
                  JUNIOR DEVELOPER GLOSSARY · 18강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 풀스택 프로덕트 매니저들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 종합 통합 프로젝트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-amber-400" />
                      1. 종합 통합 프로젝트
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Capstone Project (System Integration)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">소프트웨어 공학</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "흩어져 있던 레고 블록들을 조립해서 드디어 완성한 거대하고 멋진 나만의 우주 정거장 발명품!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 개별 학습 단위에서 습득한 프로그래밍 언어, 네트워크 통신, 비동기 제어, 예외 방어 등의 파편화된 기술들을 종합적으로 융합하여 하나의 완전한 완제품 애플리케이션으로 완성하는 최종 프로젝트입니다.
                </p>
              </div>
              {/* 용어 2: 개인화 커스터마이징 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-sky-400" />
                      2. 개인화 커스터마이징
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Personalization (User Experience Customization)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">UX/개인화</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "새 가방에 내 이름표를 달고 내가 좋아하는 스티커로 꾸며 세상에 딱 하나뿐인 내 가방으로 만드는 일!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자의 선호도, 식별자(닉네임), 지리적 위치 등의 개별 특성을 파악하여 각 사용자에게 최적화된 콘텐츠와 인터페이스 레이아웃을 제공하는 개인화 엔지니어링입니다.
                </p>
              </div>
              {/* 용어 3: 주소창 상태 전달 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-emerald-400" />
                      3. 주소창 상태 전달
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: URL Hash & Query Parameters (State Serialization)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">웹 아키텍처</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "친구에게 보낼 편지 봉투 겉면에 적어둔 '비밀 힌트와 보물 위치 번호'!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저의 URI 구조 중 쿼리 스트링(?key=value)이나 해시(#hash)를 활용하여, 페이지를 새로고침하거나 친구에게 공유하더라도 동일한 애플리케이션 상태를 복원할 수 있도록 문자열로 상태를 직렬화하는 기법입니다.
                </p>
              </div>
              {/* 용어 4: 웹 공유 인터페이스 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-purple-400" />
                      4. 웹 공유 인터페이스
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Web Share API (Native Sharing Integration)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">모바일/웹 API</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "스마트폰의 카카오톡이나 메시지 창을 마법처럼 뿅 띄워서 친구에게 내 발명품을 단번에 선물하는 마법 단추!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 애플리케이션에서 스마트폰 OS의 네이티브 공유 다이얼로그(시스템 시트)를 호출하여 텍스트, 링크, 파일 등을 타 앱으로 원클릭 전송할 수 있도록 지원하는 웹 표준 인터페이스입니다.
                </p>
              </div>
              {/* 용어 5: 사용자 경험 완성도 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      5. 사용자 경험 완성도
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: UX Polish (Edge-case Refinement)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">품질 보증/디자인</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "나무 조각을 다 깎은 뒤 손에 가시가 찔리지 않게 고운 사포로 슥슥 문지르고 반짝반짝 광을 내는 마무리 손질!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 핵심 기능의 정상 동작을 넘어 로딩 스켈레톤, 반응형 여백, 경계 입력 검증, 미려한 트랜지션 애니메이션 등 사소한 디테일을 세밀하게 다듬어 최상의 만족도를 제공하는 인터페이스 폴리싱 작업입니다.
                </p>
              </div>
              {/* 용어 6: 디지털 포트폴리오 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-teal-400" />
                      6. 디지털 포트폴리오
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Software Portfolio (Showcase Archive)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">커리어/아카이빙</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "내가 지금까지 직접 만든 멋진 발명품들을 전시해 둔 나만의 비밀 과학 박물관!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 개발자가 스스로 기획, 설계, 구현, 배포한 실제 동작하는 프로젝트들과 그 과정에서 증명된 기술 스택, 문제 해결 능력을 타인에게 증명하는 디지털 작품 모음집입니다.
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
              onClick={() => setRightTab('builder')}
              id="right-tab-btn-builder"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'builder' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>스마트 도구 제작실</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('preview')}
              id="right-tab-btn-preview"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'preview' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>실행 &amp; 공유</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('checklist')}
              id="right-tab-btn-checklist"
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'checklist' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>점검표 &amp; 인증서</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🛠️ 스마트 도구 제작실 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'builder' && (
            <div id="right-tab-content-builder" className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">나만의 스마트 도구 빌더</strong>
                  </div>
                  <span id="builder-status-badge" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    실시간 동기화 중 ✨
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label htmlFor="select-tool-type" className="block text-[11px] font-bold text-slate-700 mb-1">
                      1. 도구 엔진 선택 (어떤 도구를 만들까요?)
                    </label>
                    <select
                      id="select-tool-type"
                      value={toolConfig.type}
                      onChange={(e) => handleToolTypeChange(e.target.value as ToolType)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    >
                      <option value="weather">⛅ 우리 동네 날씨 &amp; 옷차림 코디네이터 (기상청 연동)</option>
                      <option value="lunch">🍱 오늘 학교 영양 급식 알리미 (교육청 식단 연동)</option>
                      <option value="pet">🐾 전설의 반려동물 &amp; 포켓몬 도감 (오픈 API 연동)</option>
                      <option value="fortune">🔮 매일매일 행운 조언기 (럭키 넘버 &amp; 명언 생성)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="input-tool-name" className="block text-[11px] font-bold text-slate-700 mb-1">
                      2. 도구 맞춤 이름 (앱 타이틀)
                    </label>
                    <input
                      type="text"
                      id="input-tool-name"
                      value={toolConfig.name}
                      onChange={(e) => setToolConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="예: 은우의 스마트 비서"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-1.5">3. 나만의 감성 테마 컬러</span>
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      {(['sky', 'emerald', 'rose', 'purple'] as ThemeColor[]).map(thKey => (
                        <button
                          key={thKey}
                          type="button"
                          onClick={() => setToolConfig(prev => ({ ...prev, theme: thKey }))}
                          id={`btn-theme-${thKey}`}
                          className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                            toolConfig.theme === thKey
                              ? THEME_STYLES[thKey].activeBtn
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {thKey === 'sky' && '🌊 스카이'}
                          {thKey === 'emerald' && '🌿 에메랄드'}
                          {thKey === 'rose' && '🌸 로즈'}
                          {thKey === 'purple' && '🌌 퍼플'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-gift-message" className="block text-[11px] font-bold text-slate-700 mb-1">
                      4. 친구나 가족에게 전할 한 줄 선물 메시지
                    </label>
                    <input
                      type="text"
                      id="input-gift-message"
                      value={toolConfig.message}
                      onChange={(e) => setToolConfig(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="예: 오늘도 맛있는 점심 먹고 파이팅!"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setRightTab('preview')}
                    id="btn-build-tool"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>🚀 완성된 도구 실행 &amp; 공유하러 가기!</span>
                  </button>
                </div>
              </div>

              {/* 🚀 실생활 배포 전 필수 점검 3단계 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>실생활 선물 배포 전 3단계 체크포인트</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-slate-800 block">엔진 검증</strong>
                    <span className="text-slate-500 text-[10px]">API 정상 동작</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-slate-800 block">테마 조화</strong>
                    <span className="text-slate-500 text-[10px]">가독성 4.5:1</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-slate-800 block">선물 메시지</strong>
                    <span className="text-slate-500 text-[10px]">맞춤 진심 전달</span>
                  </div>
                </div>
              </div>

              {/* 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Award className="w-4 h-4" />
                  <span>실무 개발자의 4대 소프트웨어 완성도(Polish) 공식</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">핵심 가치를 한눈에 보여주는 헤더 브랜딩</strong>
                      <span className="text-slate-400">도구 이름과 목적을 첫 3초 안에 직관적으로 인지시키세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">URL 해시(#)로 설정값을 영구 보존</strong>
                      <span className="text-slate-400">친구에게 링크만 보내도 내 설정이 그대로 살아나게 직렬화하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">1-Click 복사 시 시각 피드백 제공</strong>
                      <span className="text-slate-400">'복사됨! ✨' 메시지와 체크 아이콘으로 확신을 심어주세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">마지막 한 줄의 따뜻한 선물 메시지</strong>
                      <span className="text-slate-400">기계적인 데이터 앱을 사람의 마음을 잇는 따뜻한 소통 도구로 승화시키세요.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 📱 실행 & 공유 쇼케이스 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'preview' && (
            <div id="right-tab-content-preview" className="space-y-4">
              <div className="bg-white rounded-3xl border-2 border-slate-800 shadow-lg overflow-hidden space-y-0 max-w-sm mx-auto">
                {/* 모바일 상태바 */}
                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>09:41 AM</span>
                  <div className="w-12 h-3.5 bg-slate-800 rounded-full mx-auto"></div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 앱 컨테이너 */}
                <div id="preview-app-container" className="p-4 space-y-3.5 bg-slate-50 min-h-[380px]">
                  <div id="preview-theme-banner" className={`p-4 rounded-2xl bg-gradient-to-r ${currentTheme.bannerBg} text-white space-y-2 shadow-xs transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div id="preview-tool-icon-bg" className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                          {toolConfig.type === 'weather' && <CloudSun className="w-4 h-4" id="preview-tool-icon" />}
                          {toolConfig.type === 'lunch' && <Utensils className="w-4 h-4" id="preview-tool-icon" />}
                          {toolConfig.type === 'pet' && <PawPrint className="w-4 h-4" id="preview-tool-icon" />}
                          {toolConfig.type === 'fortune' && <Sparkles className="w-4 h-4" id="preview-tool-icon" />}
                        </div>
                        <div>
                          <strong id="preview-app-title" className="text-xs sm:text-sm font-bold block leading-tight">
                            {toolConfig.name}
                          </strong>
                          <span id="preview-app-badge" className="text-[10px] text-white/90">
                            {toolConfig.type === 'weather' && '실시간 KMA 기상청 연동'}
                            {toolConfig.type === 'lunch' && '실시간 NEIS 교육청 급식 연동'}
                            {toolConfig.type === 'pet' && 'PokeAPI 오픈 데이터 도감'}
                            {toolConfig.type === 'fortune' && 'AI 일일 행운 나침반'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-xs text-white">
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* 동적 도구 콘텐츠 */}
                  <div id="preview-dynamic-content" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                    {toolConfig.type === 'weather' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="text-xs font-bold text-slate-800 block">서울 종로구 광화문</strong>
                            <span className="text-[10px] text-slate-500">맑은 하늘 (체감 23.5℃)</span>
                          </div>
                          <span className="text-xl font-mono font-extrabold text-sky-600">22.8℃</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <span className="text-[10px] text-slate-400 font-bold block">AI 코디네이터 추천 옷차림</span>
                          <strong className="text-slate-800 block">👕 얇은 긴팔 셔츠 + 편안한 면바지</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <span className="text-slate-500">강수 확률: 10% (우산 불필요)</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> 쾌적함
                          </span>
                        </div>
                      </>
                    )}

                    {toolConfig.type === 'lunch' && (
                      <>
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-slate-800">오늘의 점심 영양 식단표</strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">620 Kcal</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="grid grid-cols-2 gap-1 text-slate-700">
                            <span>🍚 친환경 흑미밥</span>
                            <span>🍲 소고기 미역국</span>
                            <span>🍗 수제 안심 돈가스</span>
                            <span>🥗 아삭 양배추 샐러드</span>
                            <span>🥬 잘 익은 깍두기</span>
                            <span>🧃 생과일 망고주스</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <span className="text-slate-400">알레르기: 1.난류, 5.대두, 6.밀</span>
                          <span className="text-indigo-600 font-bold">인기 만점 식단!</span>
                        </div>
                      </>
                    )}

                    {toolConfig.type === 'pet' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">#025</span>
                            <strong className="text-xs font-bold text-slate-900">피카츄 (Pikachu)</strong>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">전기 타입</span>
                        </div>
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl border border-amber-200">
                            ⚡
                          </div>
                          <div className="flex-1 space-y-1 text-xs">
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>체력 (HP)</span>
                              <span className="font-bold text-slate-800">35 / 35</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full w-4/5"></div>
                            </div>
                            <span className="text-[10px] text-slate-500 block pt-0.5">필살기: 10만 볼트 (Thunderbolt)</span>
                          </div>
                        </div>
                      </>
                    )}

                    {toolConfig.type === 'fortune' && (
                      <>
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-slate-800">오늘의 행운 부적 &amp; 럭키 넘버</strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">대길 (大吉)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-center space-y-1">
                          <span className="text-xs font-bold text-purple-900 block">"작은 도전이 내일의 거대한 기적이 됩니다!"</span>
                          <span className="text-[10px] text-purple-600 block">오늘의 용기 충전율 100% ✨</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold flex items-center justify-center">7</span>
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-mono font-bold flex items-center justify-center">14</span>
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center">21</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 선물 메시지 */}
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>제작자의 선물 메시지</span>
                    </div>
                    <p id="preview-gift-message-text" className="text-xs text-slate-700 leading-snug font-medium">
                      {toolConfig.message}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 py-2 flex justify-center">
                  <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
                </div>
              </div>

              {/* 공유 컨트롤러 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">1-Click 마법 링크 공유</strong>
                  </div>
                  <span id="share-status-toast" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {copied ? '클립보드 복사 완료! 🎉' : '공유 준비 완료 💌'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">생성된 마법 주소 (URL Hash)</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="share-link-input"
                      readOnly
                      value={shareUrl}
                      className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      id="btn-copy-share-link"
                      className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span id="copy-btn-text">{copied ? '복사됨! ✨' : '복사하기'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  id="btn-native-share"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>스마트폰 친구들에게 선물 메시지 전송!</span>
                </button>
              </div>

              {/* 📱 친구와 가족의 반응을 이끌어내는 소통 꿀팁 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>친구와 가족에게 보낼 때 소통 꿀팁</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  "엄마, 아빠! 내가 직접 만든 실시간 스마트 도구야! 아침마다 이 링크만 누르면 오늘 날씨와 급식 메뉴를 바로 확인할 수 있어!"라고 짧은 메시지와 함께 건네보세요. 가족들에게 잊지 못할 특별한 감동을 선사할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 🎓 자가 점검 체크리스트 & 시즌 3 완주 인증서 */}
          {/* ----------------------------------------------------------------- */}
          {rightTab === 'checklist' && (
            <div id="right-tab-content-checklist" className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">18강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 시즌 3 인증서가 발급돼요</span>
                    </div>
                  </div>
                  <span id="right-check-progress-text" className="text-xs font-mono font-bold text-amber-600">
                    {checkedCount} / {checklist.length} ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    id="right-check-progress-fill"
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="space-y-2 pt-1" data-checklist-lesson="lesson_18">
                  {[
                    {
                      id: 1,
                      title: '1. 5대 핵심 기술 융합',
                      desc: 'JSON, fetch, 오픈 데이터, 조건부 로직, 예외 처리를 결합해 완성형 도구를 기획했다.'
                    },
                    {
                      id: 2,
                      title: '2. 나만의 앱 타이틀 & 닉네임 설정',
                      desc: '사용자가 친근하게 느낄 수 있는 맞춤형 도구 이름을 지정하고 화면에 반영했다.'
                    },
                    {
                      id: 3,
                      title: '3. 4대 감성 테마 동적 스타일링',
                      desc: '테마 버튼 클릭 시 실시간으로 앱의 컬러 그라데이션과 뱃지 색상을 변경했다.'
                    },
                    {
                      id: 4,
                      title: '4. URL 해시(#) 상태 직렬화 마법',
                      desc: '도구의 모든 설정값을 URL 주소에 압축하여 친구에게 온보딩시키는 원리를 파악했다.'
                    },
                    {
                      id: 5,
                      title: '5. 1-Click 공유와 마이크로 피드백',
                      desc: '클립보드 복사 시 \'복사됨!\' 알림을 주고 Web Share API로 친구와 연결했다.'
                    },
                    {
                      id: 6,
                      title: '6. 시즌 3 완주와 디지털 포트폴리오',
                      desc: '13강부터 18강까지 전 과정을 완주하고 나만의 소프트웨어 작품을 완성했다.'
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
                        className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900 block mb-0.5">{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* 100% 달성 시 인증서 & 19강 언락 */}
                {isLessonComplete && (
                  <div id="completion-card" className="space-y-4">
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-slate-950 space-y-4 shadow-xl border-4 border-amber-300 relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none"></div>

                      <div className="flex items-center justify-between border-b border-amber-400/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-6 h-6 text-slate-950" />
                          <span className="text-xs font-black tracking-widest uppercase">Certificate of Mastery</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-slate-900 shadow-xs">
                          시즌 3 공식 수료
                        </span>
                      </div>

                      <div className="text-center space-y-1.5 py-1">
                        <span className="text-[11px] font-bold text-amber-950 block">주니어 오픈 API &amp; 스마트 도구 마스터</span>
                        <h3 id="cert-user-name" className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                          {toolConfig.name.split(' ')[0]} 개발자
                        </h3>
                        <p className="text-xs text-amber-950/90 leading-relaxed font-medium max-w-sm mx-auto">
                          위 학생은 오픈 데이터 파싱, 비동기 통신, 조건부 렌더링 및 예외 방어 과정을 모두 완벽히 이수하여 본 인증서를 수여합니다.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-amber-400/60 text-[10px] font-mono text-amber-950 font-bold">
                        <span>ISSUED: 2026. 11. 02</span>
                        <span>AUTHENTIC SEAL: ★★★★★</span>
                      </div>
                    </div>

                    <a
                      href="/materials/ai/lessons/19-ai-inventor/index.html"
                      id="btn-unlock-next"
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>시즌 4 돌입! 19강: 주니어 AI 발명가(챗봇 기획) 시작하기</span>
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

export default Lesson18;
