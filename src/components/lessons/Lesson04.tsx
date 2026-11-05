import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ArrowLeft,
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
  Clock,
  MessageSquare,
  Zap,
  Wrench,
  Compass,
  Trophy,
  CheckSquare,
  FileCheck,
  Undo2,
  Scale,
  RefreshCw,
  Sliders,
  Flame,
  KeyRound,
  ShieldAlert,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 4강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'hunter' | 'patch_card' | 'checklist';

export interface Lesson04Props {
  onComplete?: () => void;
}

export const Lesson04: React.FC<Lesson04Props> = ({ onComplete }) => {
  // ---------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('hunter');

  // QA 버그 헌터 상태
  const [foundBugs, setFoundBugs] = useState<number[]>([]);
  const [isPatched, setIsPatched] = useState<boolean>(false);
  const totalBugs = 3;

  // 패치노트 실시간 카드 빌더 상태
  const [patchForm, setPatchForm] = useState({
    gameTitle: '별빛 미궁의 시간 여행자',
    bugType: '구멍 양말 버그 (플롯 홀)',
    v1: '과거에서 시간 나침반을 잃어버렸는데 다음 동굴에서 갑자기 나침반을 꺼내 길을 찾았다.',
    v2: '나침반 대신 반짝이는 수정 동굴의 천장 별빛 패턴을 기억해 출구를 찾아냈다.'
  });
  const [isPatchCardCopied, setIsPatchCardCopied] = useState(false);

  // 프롬프트 복사 토스트 상태
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // 미니 퀴즈 상태
  const [quiz1Answer, setQuiz1Answer] = useState<number | null>(null);
  const [quiz1Submitted, setQuiz1Submitted] = useState<boolean>(false);

  // 주니어 디렉터 회고 수첩 상태
  const [retro, setRetro] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  });

  // 자가 점검 체크리스트 상태 (6개)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
    c6: false
  });

  // ---------------------------------------------------------------------------
  // 로컬 스토리지 연동 및 초기화
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const savedRetro = localStorage.getItem('lesson04_retro');
      if (savedRetro) {
        setRetro(JSON.parse(savedRetro));
      }
      const savedChecklist = localStorage.getItem('lesson04_checklist');
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
      localStorage.setItem('lesson04_retro', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChecklistToggle = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem('lesson04_checklist', JSON.stringify(updated));
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

  // 패치노트 카드 복사
  const handleCopyPatchCard = () => {
    const md = `## 🛠️ [패치노트 v2.0] ${patchForm.gameTitle || '나의 게임'}
- **수정 유형:** ${patchForm.bugType}
- **[-] 수정 전 (v1):** ${patchForm.v1}
- **[+] 수정 후 (v2):** ${patchForm.v2}`;
    navigator.clipboard.writeText(md);
    setIsPatchCardCopied(true);
    setTimeout(() => {
      setIsPatchCardCopied(false);
    }, 1500);
  };

  // QA 버그 헌터 클릭 핸들러
  const handleBugClick = (pNum: number) => {
    if (pNum === 1) {
      alert('문단 1은 배경과 소지품을 소개하는 정상적인 문단입니다. 다른 문단에서 삐걱거리는 곳을 찾아보세요!');
      return;
    }
    if (!foundBugs.includes(pNum)) {
      setFoundBugs(prev => [...prev, pNum]);
    }
  };

  const handleResetQa = () => {
    setFoundBugs([]);
    setIsPatched(false);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans text-base sm:text-lg leading-relaxed selection:bg-indigo-100 selection:text-indigo-900 flex flex-col antialiased">

      {/* ===================================================================== */}
      {/* 1. 상단 글로벌 GNB & 4단계 퀘스트 스텝퍼 */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 좌측 과정 홈 링크 & 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
            <span className="w-1 h-3 bg-slate-200 rounded-full hidden sm:block"></span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                시즌 1 · 4강
              </span>
              <span className="text-sm font-bold text-slate-900 truncate">
                게임의 삐걱거리는 곳을 고쳐라 (AI 스토리 밸런스 패치)
              </span>
            </div>
          </div>

          {/* 중앙: 4단계 퀘스트 스텝퍼 탭 */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200" role="tablist">
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
              <span>브리핑</span>
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
              <span>3대 버그 해부</span>
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
              <span>AI 탐정 실습</span>
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
              <span>미션 &amp; 회고</span>
            </button>
          </nav>

          {/* 우측 진척도 & 언락 상태 */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold block">진척도</span>
                <span className="text-xs text-indigo-600 font-bold">{completedChecklistCount}/6 ({checklistPercent}%)</span>
              </div>
              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 p-0.5">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              {isAllCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 whitespace-nowrap animate-pulse">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>5강 언락됨!</span>
                </span>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" />
                  <span>5강 잠김</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 전용 4단계 퀘스트 스텝퍼 */}
        <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto border-t border-slate-200 bg-slate-50 px-2 py-1.5">
          <button
            type="button"
            onClick={() => handleStageChange('stage1')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage1' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            1. 브리핑
          </button>
          <button
            type="button"
            onClick={() => handleStageChange('stage2')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage2' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            2. 3대 버그
          </button>
          <button
            type="button"
            onClick={() => handleStageChange('stage3')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage3' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            3. AI 탐정
          </button>
          <button
            type="button"
            onClick={() => handleStageChange('stage4')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage4' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            4. 미션회고
          </button>
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
          {/* STAGE 1: 퀘스트 브리핑 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 히어로 배너 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/50 via-sky-50/30 to-transparent rounded-full blur-3xl -z-10"></div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    시즌 1 · 스토리 완성편
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    소요 시간: 40분
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    스토리 QA &amp; 밸런스 패치
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  게임의 삐걱거리는 곳을 고쳐라!<br />
                  <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-800 bg-clip-text text-transparent">
                    스토리 버그 사냥과 반전의 밸런스 패치
                  </span>
                </h1>

                <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                  3강에서 멋진 가지치기 분기표를 만들었나요? 그런데 플레이어가 어떤 길을 선택했을 때 갑자기 게임이 허무하게 끝나버리거나, 앞뒤가 맞지 않는 황당한 일이 벌어지면 실망하고 말 거예요.<br />
                  이번 4강에서는 인기 온라인 게임들처럼 내 스토리를 꼼꼼히 점검하고 수리하는 <strong className="text-indigo-700 font-bold">‘게임 마법 수리점(스토리 밸런스 패치)’</strong>을 열어봅니다!
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>오늘의 학습 목표: 3대 스토리 버그 퇴치 + 반전 양념 추가</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStageChange('stage2')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm ml-auto"
                  >
                    <span>버그 사냥 시작하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 벤토 카드 1: 왜 밸런스 패치가 필요할까요? */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    🔍 왜 이야기에도 '밸런스 패치'가 필요할까요?
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  우리가 좋아하는 <strong className="text-slate-800 font-semibold">브롤스타즈나 롤(LoL)</strong> 같은 게임을 떠올려보세요. 한 캐릭터만 너무 세면 다른 캐릭터를 할 이유가 없어 시시해지죠? 반대로 적 몬스터가 너무 말도 안 되게 세면 금방 화가 나서 게임을 꺼버립니다.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>밸런스가 무너진 안 좋은 게임</span>
                    </div>
                    <ul className="text-xs text-rose-800 space-y-1.5 pl-4 list-disc leading-normal font-normal">
                      <li>치트키 같은 선택지 하나만 누르면 무조건 쉽게 승리함.</li>
                      <li>평화롭게 걷다가 아무 힌트 없이 이유 없이 즉사함.</li>
                      <li>열쇠를 잃어버렸는데 다음 방에서 열쇠로 문을 열음.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>황금 밸런스를 맞춘 웰메이드 게임</span>
                    </div>
                    <ul className="text-xs text-emerald-800 space-y-1.5 pl-4 list-disc leading-normal font-normal">
                      <li>안전한 길은 보상이 소소하고, 위험한 길은 대박 보상이 따름.</li>
                      <li>모든 죽음과 실패에는 플레이어가 납득할 만한 사전 힌트가 있음.</li>
                      <li>앞뒤 소지품과 사건의 인과관계가 레고 블록처럼 딱딱 들어맞음.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 벤토 카드 2: 4강 핵심 액션 플랜 3가지 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    🎯 오늘 우리가 완수할 3가지 특급 미션
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      3대 버그 몬스터 잡기
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-normal font-normal">
                      구멍 양말, 치트키 사기, 억울한 낭떠러지 버그를 찾아내어 싹 수리합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      AI와 1채택·1직접수정
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-normal font-normal">
                      AI 제안 1개는 멋지게 수용하고, 1개는 내 상상력으로 직접 고쳐 총괄 디렉터가 됩니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      반전 &amp; 절단 신공 양념
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-normal font-normal">
                      친구들의 심장을 쫄깃하게 만드는 깜짝 반전과 다음 화가 궁금한 클리프행어를 심습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 벤토 카드 3: 우측 인터랙티브 콘솔 안내 */}
              <div className="bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-white rounded-2xl p-5 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-indigo-900">
                    실습 로드맵: 우측 콘솔은 어떻게 사용하나요?
                  </h3>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed font-normal">
                  우측 패널은 좌측 가이드를 읽으며 실시간으로 조작할 수 있는 나만의 작업실입니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">① [버그 헌터]</span>
                    <p className="text-[11px] text-slate-500 font-normal leading-normal">
                      스토리 속 숨겨진 3대 몬스터 버그를 직접 클릭해 잡고 밸런스 패치 비포&amp;애프터를 확인합니다.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">② [패치노트 빌더]</span>
                    <p className="text-[11px] text-slate-500 font-normal leading-normal">
                      내가 수정한 스토리 v1과 v2를 멋진 패치노트 카드로 만들어 원클릭으로 복사합니다.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-emerald-600 block">③ [체크리스트]</span>
                    <p className="text-[11px] text-slate-500 font-normal leading-normal">
                      6개 탐정 수리 미션을 완료하면 5강 웹 화면 코딩(HTML 대사창)으로 가는 문이 열립니다!
                    </p>
                  </div>
                </div>
              </div>

              {/* 다음 단계 버튼 */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleStageChange('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>2단계: 3대 스토리 버그 해부하러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 2: 3대 버그 해부 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* 섹션 타이틀 카드 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <Bug className="w-4 h-4" />
                  <span>2단계 · 몬스터 도감</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  내 게임을 망치는 3대 스토리 버그 몬스터
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  스토리 버그는 코드의 오타가 아니라, <strong className="text-indigo-700 font-semibold">이야기의 흐름이나 논리가 삐걱거리는 현상</strong>을 말해요. 이 3대 몬스터만 퇴치하면 누구에게나 칭찬받는 명작 게임이 완성됩니다!
                </p>
              </div>

              {/* 몬스터 1: 구멍 양말 버그 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-200/80 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                      🧦
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          몬스터 #1
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          구멍 양말 버그
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block pl-0.5">
                        공식 개발자 용어: 플롯 홀 (Plot Hole)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold whitespace-nowrap">
                    위험도: ★★★☆☆
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  양말에 뻥 뚫린 구멍처럼, <strong className="text-slate-800 font-semibold">앞에서 일어난 일과 뒤에서 벌어지는 상황이 서로 충돌하는 말실수</strong>입니다. 플레이어가 "어? 아까는 잃어버렸다며?"라고 어리둥절하게 만들어요.
                </p>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] whitespace-nowrap">버그 예시</span>
                    <p className="text-slate-600 font-normal">
                      "강물에 빠져 소중한 비밀 지도를 잃어버렸다!" ➔ (다음 방) ➔ "가방에서 비밀 지도를 꺼내 암호를 풀었다."
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] whitespace-nowrap">패치 처방전</span>
                    <p className="text-emerald-900 font-normal">
                      "지도는 잃어버렸지만 벽에 새겨진 고대 벽화의 문양을 기억해 암호를 풀었다."로 수정하여 논리를 매끄럽게 연결합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 몬스터 2: 치트키 사기 버그 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-200/80 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                      💥
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          몬스터 #2
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          치트키 사기 버그
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block pl-0.5">
                        공식 개발자 용어: 밸런스 붕괴 (Overpowered Choice)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold whitespace-nowrap">
                    위험도: ★★★★☆
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  선택지 둘 중 하나가 <strong className="text-slate-800 font-semibold">아무 위험도 없이 무조건 너무 좋아서, 다른 선택지를 누를 이유가 아예 사라지는 문제</strong>입니다. 고민할 필요가 없어지면 게임의 긴장감이 0이 되어 지루해집니다.
                </p>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] whitespace-nowrap">버그 예시</span>
                    <p className="text-slate-600 font-normal">
                      [선택 A] 목숨 걸고 드래곤 굴로 들어가기 (사망 확률 90%)<br />
                      [선택 B] 마법 물약 마시고 날아서 단번에 보물방 가기 (위험 0%, 100% 승리)
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] whitespace-nowrap">패치 처방전</span>
                    <p className="text-emerald-900 font-normal">
                      마법 물약에도 '시야가 흐려지는 부작용'이나 '물약을 1개 소모함' 같은 대가를 붙여, 두 선택지 모두 저마다의 장단점이 생기도록 줄타기를 만듭니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 몬스터 3: 낭떠러지 버그 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-purple-200/80 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                      🕳️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          몬스터 #3
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          낭떠러지 버그
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block pl-0.5">
                        공식 개발자 용어: 허무한 막다른 길 (Dead End)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold whitespace-nowrap">
                    위험도: ★★★★★
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  눈앞에 아무런 경고나 힌트도 주지 않고, <strong className="text-slate-800 font-semibold">선택지를 누르자마자 억울하게 즉사하거나 게임이 끝나버리는 악질 버그</strong>입니다. 플레이어는 "내가 뭘 잘못했다고?"라며 억울해합니다.
                </p>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] whitespace-nowrap">버그 예시</span>
                    <p className="text-slate-600 font-normal">
                      "평화로워 보이는 왼쪽 꽃길로 걸어갔다. ➔ 갑자기 천둥 번개가 치며 즉사했습니다. 게임 오버!"
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] whitespace-nowrap">패치 처방전</span>
                    <p className="text-emerald-900 font-normal">
                      꽃길 앞에 '마른 뼈들이 널려 있고 탄 냄새가 난다'는 복선(힌트)을 미리 주거나, 곧바로 즉사하지 않고 위기를 탈출할 수 있는 추가 선택지를 제공합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 미니 퀴즈 인터랙션 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    🎯 10초 퀴즈! 이 상황은 어떤 버그일까요?
                  </h3>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  <strong className="text-indigo-900 font-bold block mb-1">상황 지문:</strong>
                  "어두운 미로를 탈출하기 위해 [횃불을 켠다]와 [스마트폰 손전등을 켠다] 중 하나를 골라야 합니다. 스마트폰을 켜면 배터리도 무제한이고 밝기도 100배 밝아서 모든 함정이 한눈에 보입니다."
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setQuiz1Answer(1); setQuiz1Submitted(true); }}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      quiz1Answer === 1
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    1. 구멍 양말 버그
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuiz1Answer(2); setQuiz1Submitted(true); }}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      quiz1Answer === 2
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    2. 치트키 사기 버그 ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuiz1Answer(3); setQuiz1Submitted(true); }}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      quiz1Answer === 3
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    3. 낭떠러지 버그
                  </button>
                </div>

                {quiz1Submitted && (
                  <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    quiz1Answer === 2
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}>
                    {quiz1Answer === 2 ? (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">정답입니다! 🎉</strong> 스마트폰 손전등이 너무 좋아서 횃불을 고를 이유가 아예 사라지는 전형적인 치트키(밸런스 붕괴) 버그예요. "스마트폰은 배터리가 5%뿐이다" 같은 제한을 주어야 밸런스가 맞습니다.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">아쉬워요! 다시 생각해보세요.</strong> 이 상황은 스마트폰 선택지가 너무 압도적으로 유리해서 다른 선택지가 버려지는 문제예요. 정답은 <strong>2번 치트키 사기 버그</strong>입니다.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

                            {/* 우측 버그 헌터 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [버그 헌터]를 시작하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    스토리 속에 숨겨진 3대 치명적 버그를 직접 찾아낼 차례입니다. 우측 콘솔의 <strong>[버그 헌터]</strong>에서 구멍 양말, 치트키 사기, 억울한 낭떠러지 버그를 발견하고 패치 버튼을 눌러 스토리를 말끔하게 수리해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('hunter')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [버그 헌터] 탭 바로 열기</span>
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
                  <span>3단계: AI 탐정과 버그 잡으러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 3: AI 탐정 실습 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* 섹션 안내 헤더 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <Bot className="w-4 h-4" />
                  <span>3단계 · 프롬프트 마스터클래스</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  AI 조수를 깐깐한 '게임 QA 탐정'으로 소환하는 법
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  "내 스토리 고쳐줘"라고만 말하면 AI는 내 개성을 다 지우고 뻔한 동화책으로 바꿔버립니다.<br />
                  AI에게 <strong className="text-indigo-700 font-semibold">버그만 꼭 집어 찾아내고 2가지 해결책만 제안해달라고 정밀하게 주문</strong>하는 마법 프롬프트를 배워봅시다!
                </p>
              </div>

              {/* 프롬프트 1: 3대 버그 전담 사냥 프롬프트 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      3대 스토리 버그 정밀 진단 프롬프트
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt('p1', `너는 세계 최고의 게임 시나리오 QA(품질 검사) 탐정이야.
내가 아래에 제공하는 인터랙티브 모험 스토리 분기표를 꼼꼼히 읽고, 오직 다음 3가지 버그만 찾아내 줘:
1. 구멍 양말 버그 (앞뒤 설정이 모순되는 플롯 홀)
2. 치트키 사기 버그 (한쪽 선택지가 너무 좋아 긴장감이 없는 경우)
3. 낭떠러지 버그 (힌트 없이 억울하게 즉사하는 허무한 결말)

[답변 형식]
- 발견된 버그 이름 및 위치:
- 버그 발생 원인:
- 밸런스 패치 대안 2가지 (A안: 논리 보강, B안: 리스크 추가):`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700"
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

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed space-y-2">
                  <div className="text-slate-400"># 게임 QA 탐정 페르소나 소환 주문서</div>
                  <div>너는 세계 최고의 게임 시나리오 QA(품질 검사) 탐정이야.</div>
                  <div>내가 제공하는 인터랙티브 모험 스토리 분기표를 읽고, 다음 3가지 버그를 찾아줘:</div>
                  <div className="text-amber-300 pl-3">1. 구멍 양말 버그 (앞뒤 모순 플롯 홀)</div>
                  <div className="text-amber-300 pl-3">2. 치트키 사기 버그 (너무 쉬운 밸런스 붕괴)</div>
                  <div className="text-amber-300 pl-3">3. 낭떠러지 버그 (억울한 즉사 결말)</div>
                  <div className="text-slate-400 pt-1"># 각 버그마다 2가지 해결책(A안: 논리 보강, B안: 리스크 추가)을 제안해줘.</div>
                </div>
              </div>

              {/* 프롬프트 2: 깜짝 반전 & 클리프행어 양념 주문서 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">2</span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      깜짝 반전 &amp; 클리프행어 양념 추가 주문서
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt('p2', `내 게임 스토리의 마지막 결말이 너무 뻔하지 않도록 멋진 양념을 치고 싶어.
아래 두 가지 기법을 각각 적용한 아이디어를 하나씩 제안해줘:
1. 뒤통수 찌릿! 깜짝 반전 (Plot Twist): 알고 보니 아군이었던 인물의 진짜 정체나 숨겨진 진실
2. 다음 화가 궁금한 심장 쫄깃 절단 신공 (Cliffhanger): 포털 너머에서 나타난 의문의 그림자 직전에서 딱 끊기`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-700"
                  >
                    {copiedPromptId === 'p2' ? (
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

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed space-y-2">
                  <div className="text-slate-400"># 반전 &amp; 클리프행어 양념 주문서</div>
                  <div>내 게임의 결말에 2가지 양념을 추가하고 싶어:</div>
                  <div className="text-sky-300 pl-3">1. 깜짝 반전 (Plot Twist): 사실 가장 친절했던 가이드 로봇이 고대 유적의 파수꾼이었다는 식의 반전</div>
                  <div className="text-sky-300 pl-3">2. 절단 신공 (Cliffhanger): 보물 상자를 여는 순간 뒤에서 묵직한 발자국 소리가 들리며 "To be continued..."로 끊기</div>
                </div>
              </div>

              {/* 주니어 디렉터의 황금률 벤토 카드 */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 rounded-2xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm sm:text-base font-bold text-amber-950">
                    주니어 개발자의 황금률: "1개 채택 &amp; 1개 직접 수정"
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  AI가 2~3가지 해결책을 제시하면 그대로 복사해서 붙여넣지 마세요!<br />
                  <strong className="text-indigo-700 font-bold">1개는 AI의 기발한 아이디어를 그대로 채택</strong>하고, <strong className="text-amber-700 font-bold">나머지 1개는 내 취향과 상상력을 담아 직접 손으로 고치는 것</strong>이 진정한 총괄 디렉터의 프로다운 자세입니다.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>내가 게임의 감독이고, AI는 나를 돕는 유능한 조수라는 점을 잊지 마세요!</span>
                </div>
              </div>

                            {/* 우측 패치노트 빌더 연동 알림 카드 */}
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
                      버그 수리를 마쳤다면 우측의 [패치노트 빌더]를 열어 작성하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI QA 탐정의 피드백을 반영하여 버그를 모두 잡으셨나요? 우측 콘솔의 <strong>[패치노트 빌더]</strong>에 발견한 버그와 수리한 패치 내역을 입력하고 정식 게임 패치노트 카드와 인증 뱃지를 발급받으세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('patch_card')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [패치노트 빌더] 탭 바로 열기</span>
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
                  <span>4단계: 미션 완수 및 회고록 쓰러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 4: 미션 & 회고 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* 섹션 헤더 카드 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <CheckSquare className="w-4 h-4" />
                  <span>4단계 · 실전 패치 완료 &amp; 회고</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  게임 마법 수리점 클로징: 패치노트 발행과 회고
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  우측 실습 콘솔에서 수정한 내용을 바탕으로 공식 패치노트 카드를 만들고, 오늘의 디렉터 활동을 회고 수첩에 기록해보세요. 6가지 점검표를 모두 채우면 대망의 5강이 열립니다!
                </p>
              </div>

              {/* 주니어 디렉터 회고 수첩 폼 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    주니어 디렉터의 마법 수리 수첩 (회고)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      1. 내 이야기에서 발견한 가장 엉뚱했던 버그는 무엇이었나요?
                    </label>
                    <input
                      type="text"
                      value={retro.q1}
                      onChange={e => handleRetroChange('q1', e.target.value)}
                      placeholder="예: 나침반을 떨어뜨렸는데 다음 방에서 나침반으로 길을 찾았던 구멍 양말 버그"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      2. AI가 제안한 아이디어 중 어떤 것을 채택했나요?
                    </label>
                    <input
                      type="text"
                      value={retro.q2}
                      onChange={e => handleRetroChange('q2', e.target.value)}
                      placeholder="예: 나침반 대신 동굴 천장의 야광 이끼 별자리 패턴을 보고 탈출하는 아이디어"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      3. 내 손으로 직접 고쳐 넣은 '나만의 규칙이나 반전'은 무엇인가요?
                    </label>
                    <input
                      type="text"
                      value={retro.q3}
                      onChange={e => handleRetroChange('q3', e.target.value)}
                      placeholder="예: 마지막 탈출 직전, 나를 도와주던 다람쥐 로봇이 사실 과거의 나였다는 반전 추가!"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      4. 5강 웹 화면 코딩(HTML 대사창)에서 가장 기대되는 점은?
                    </label>
                    <input
                      type="text"
                      value={retro.q4}
                      onChange={e => handleRetroChange('q4', e.target.value)}
                      placeholder="예: 진짜 닌텐도 젤다의 전설처럼 대사창과 선택지 버튼이 웹 브라우저 화면에 뜨게 만드는 것"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>
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
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>우측 점검표 확인하기</span>
                </button>
              </div>
            

              {/* ================================================================= */}
          {/* ■ 좌측 패널 최하단: 주니어 개발자를 위한 전문 용어 돋보기 표준 */}
          {/* ================================================================= */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md space-y-6 mt-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  🔍 주니어 개발자를 위한 전문 용어 돋보기
                </h3>
                <p className="text-xs text-slate-400 font-normal">
                  본문에서 다룬 원리의 공식 개발 용어입니다. 표제어 아래 보조 캡션과 어린이 비유로 쉽게 기억해보세요!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 밸런스 패치 */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-bold text-white">
                    1. 밸런스 패치
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block pl-5.5">
                    영문: Balance Patch
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pl-0.5 pt-1">
                  <p className="leading-relaxed">
                    <strong className="text-amber-200 font-bold">🧸 어린이 비유:</strong> 게임 시소의 무게를 양쪽 똑같이 맞추어, 어느 한쪽만 너무 유리하거나 불리하지 않게 마법으로 수리하는 작업입니다.
                  </p>
                  <p className="leading-relaxed text-slate-400 font-normal">
                    <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 게임 내 수치나 시스템을 조정하여 특정 전략이나 선택지가 과도하게 유리(Overpowered)하거나 불리(Underpowered)해지지 않도록 공평성과 재미를 유지하는 업데이트 과정입니다.
                  </p>
                </div>
              </div>

              {/* 용어 2: 플롯 홀 */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-bold text-white">
                    2. 플롯 홀
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block pl-5.5">
                    외래어·영문: 플롯 홀, Plot Hole
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pl-0.5 pt-1">
                  <p className="leading-relaxed">
                    <strong className="text-amber-200 font-bold">🧸 어린이 비유:</strong> 양말에 뚫린 구멍처럼 이야기 앞뒤가 서로 맞지 않아 삐걱거리는 엉뚱한 말실수입니다.
                  </p>
                  <p className="leading-relaxed text-slate-400 font-normal">
                    <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 시나리오의 설정, 인물의 행동, 사건의 논리적 선후 관계에서 발생하는 모순이나 개연성 결여 현상을 일컫습니다.
                  </p>
                </div>
              </div>

              {/* 용어 3: QA 테스팅 */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-bold text-white">
                    3. QA 테스팅
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block pl-5.5">
                    영문: Quality Assurance Testing
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pl-0.5 pt-1">
                  <p className="leading-relaxed">
                    <strong className="text-amber-200 font-bold">🧸 어린이 비유:</strong> 과자를 세상에 출시하기 전에 맛이나 포장에 불량이 없는지 꼼꼼히 맛보는 맛 검사관 탐정 활동입니다.
                  </p>
                  <p className="leading-relaxed text-slate-400 font-normal">
                    <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 소프트웨어나 콘텐츠가 기획 의도대로 결함 없이 완벽히 동작하는지 체계적으로 검증하여 최상의 사용자 경험을 보증하는 품질 보증 과정입니다.
                  </p>
                </div>
              </div>

              {/* 용어 4: 클리프행어 */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-bold text-white">
                    4. 클리프행어
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block pl-5.5">
                    외래어·영문: 클리프행어, Cliffhanger
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pl-0.5 pt-1">
                  <p className="leading-relaxed">
                    <strong className="text-amber-200 font-bold">🧸 어린이 비유:</strong> 만화책에서 주인공이 절벽에 매달려 떨어지기 직전 "다음 주에 계속!"이라며 심장을 쫄깃하게 만들며 끊는 절단 신공입니다.
                  </p>
                  <p className="leading-relaxed text-slate-400 font-normal">
                    <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 극적 긴장감이 최고조(Climax)에 달했을 때 이야기를 일시 중단하여 독자나 플레이어가 다음 회차를 강렬하게 기대하게 만드는 서사 연출 기법입니다.
                  </p>
                </div>
              </div>

              {/* 용어 5: 반전 기법 */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-bold text-white">
                    5. 반전 기법
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block pl-5.5">
                    영문: Plot Twist
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pl-0.5 pt-1">
                  <p className="leading-relaxed">
                    <strong className="text-amber-200 font-bold">🧸 어린이 비유:</strong> 친구인 줄 알았던 착한 요정이 사실 나를 지켜보던 진짜 최종 대마왕이었다는 식의 뒤통수 찌릿 선물 상자입니다.
                  </p>
                  <p className="leading-relaxed text-slate-400 font-normal">
                    <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 관객이나 플레이어가 당연하게 믿고 있던 전제나 예상을 뒤집어 신선한 충격과 서사적 카타르시스를 제공하는 반전 스토리텔링 기법입니다.
                  </p>
                </div>
              </div>

              {/* 용어 6: 회귀 테스트 */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base font-bold text-white">
                    6. 회귀 테스트
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block pl-5.5">
                    영문: Regression Test
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5 pl-0.5 pt-1">
                  <p className="leading-relaxed">
                    <strong className="text-amber-200 font-bold">🧸 어린이 비유:</strong> 레고 성벽의 구멍 하나를 수리하고 나서, 다른 쪽 성벽이 흔들려 무너지지 않는지 다시 한번 툭툭 두드려 점검하는 도미노 방지 테스트입니다.
                  </p>
                  <p className="leading-relaxed text-slate-400 font-normal">
                    <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 소프트웨어의 특정 버그를 수정하거나 기능을 추가한 뒤, 기존에 잘 동작하던 다른 기능에 예기치 않은 결함(부작용)이 생기지 않았는지 전체적으로 재확인하는 테스트 기법입니다.
                  </p>
                </div>
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
              onClick={() => setActiveRightTab('hunter')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'hunter'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>버그 헌터</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('patch_card')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'patch_card'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>패치노트 빌더</span>
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
              <span>체크리스트 ({checklistPercent}%)</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: QA 버그 헌터 시뮬레이터 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'hunter' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      실전 버그 사냥: 대본 속 3대 버그를 클릭해 잡으세요!
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    foundBugs.length === totalBugs
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    찾은 버그: {foundBugs.length} / {totalBugs}개
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal font-normal">
                  아래 대본에서 삐걱거리는 문단을 마우스로 직접 클릭하세요. 3대 버그를 모두 잡으면 밸런스 패치 버튼이 활성화됩니다!
                </p>

                {/* 대본 문단 인터랙션 */}
                <div className="space-y-2.5 pt-1">
                  {/* 문단 1: 정상 */}
                  <div
                    onClick={() => handleBugClick(1)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer text-xs sm:text-sm text-slate-700 leading-relaxed"
                  >
                    <span className="font-bold text-slate-400 text-xs block mb-1">문단 1</span>
                    "용사 레오는 신비한 시간 동굴을 탐험하고 있었습니다. 허리춤에는 아버지가 물려주신 황금빛 회중시계와 비상용 성냥 3개뿐이었습니다."
                  </div>

                  {/* 문단 2: 구멍 양말 버그 (버그 1) */}
                  <div
                    onClick={() => handleBugClick(2)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm leading-relaxed ${
                      foundBugs.includes(2)
                        ? 'bg-rose-50/70 border-rose-400 text-slate-800'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-slate-400 text-xs block mb-1">문단 2</span>
                    "거센 돌풍에 미끄러져 가방이 절벽 밑 깊은 강물로 떨어졌고, 성냥을 몽땅 잃어버렸습니다. 그러나 다음 어두운 방에 도착하자마자 레오는 주머니에서 성냥을 꺼내 횃불을 환하게 밝혔습니다."
                    {foundBugs.includes(2) && (
                      <div className="mt-2 pt-2 border-t border-rose-200 text-xs text-rose-800 font-normal">
                        <strong className="font-bold text-rose-900 block mb-0.5">🧦 구멍 양말 버그 (플롯 홀) 퇴치!</strong>
                        방금 성냥을 몽땅 잃어버렸다고 했는데, 곧바로 주머니에서 성냥을 꺼내는 명백한 모순입니다.
                      </div>
                    )}
                  </div>

                  {/* 문단 3: 치트키 사기 버그 (버그 2) */}
                  <div
                    onClick={() => handleBugClick(3)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm leading-relaxed ${
                      foundBugs.includes(3)
                        ? 'bg-rose-50/70 border-rose-400 text-slate-800'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-slate-400 text-xs block mb-1">문단 3</span>
                    "눈앞에 갈림길이 나타났습니다. [A안: 목숨을 걸고 가시 함정을 뛰어넘기 (성공 확률 10%)] vs [B안: 버튼 하나만 누르면 문이 스르륵 열리는 마법 버튼 누르기 (위험 0%, 보물 즉시 획득)]"
                    {foundBugs.includes(3) && (
                      <div className="mt-2 pt-2 border-t border-rose-200 text-xs text-rose-800 font-normal">
                        <strong className="font-bold text-rose-900 block mb-0.5">💥 치트키 사기 버그 (밸런스 붕괴) 퇴치!</strong>
                        B안이 아무런 위험 없이 모든 보상을 주므로, A안을 고를 이유가 전혀 없어 긴장감이 사라집니다.
                      </div>
                    )}
                  </div>

                  {/* 문단 4: 낭떠러지 버그 (버그 3) */}
                  <div
                    onClick={() => handleBugClick(4)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm leading-relaxed ${
                      foundBugs.includes(4)
                        ? 'bg-rose-50/70 border-rose-400 text-slate-800'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-slate-400 text-xs block mb-1">문단 4</span>
                    "레오는 조용해 보이는 오른쪽 복도로 발걸음을 옮겼습니다. 발을 딛자마자 천장에서 거대한 바위가 떨어져 즉사했습니다. 게임 오버!"
                    {foundBugs.includes(4) && (
                      <div className="mt-2 pt-2 border-t border-rose-200 text-xs text-rose-800 font-normal">
                        <strong className="font-bold text-rose-900 block mb-0.5">🕳️ 낭떠러지 버그 (허무한 즉사) 퇴치!</strong>
                        바닥이 갈라져 있거나 먼지가 떨어진다는 사전 힌트도 없이 갑자기 즉사하여 플레이어를 허탈하게 만듭니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3대 버그 모두 발견 시 밸런스 패치 버튼 */}
                {foundBugs.length === totalBugs && !isPatched && (
                  <div className="pt-2 animate-bounce">
                    <button
                      type="button"
                      onClick={() => setIsPatched(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>🎉 3대 버그 퇴치 완료! 마법 밸런스 패치 적용하기</span>
                    </button>
                  </div>
                )}

                {/* 밸런스 패치 완료 후 결과 카드 */}
                {isPatched && (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>🛠️ 밸런스 패치 v2.0 적용 대본 완성!</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetQa}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>다시 테스트</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-white p-3.5 rounded-lg border border-emerald-200 font-normal">
                      <p>
                        <strong className="text-emerald-900 font-bold">[수정 패치 #1]:</strong> 성냥 대신 벽에서 자라는 발광 버섯의 푸른빛을 손에 묻혀 길을 밝혔습니다.
                      </p>
                      <p>
                        <strong className="text-emerald-900 font-bold">[수정 패치 #2]:</strong> 마법 버튼에는 '아끼는 보석을 1개 공물로 바쳐야 한다'는 리스크를 부여하여 가시밭길(무료지만 위험)과 대등한 줄타기를 만들었습니다.
                      </p>
                      <p>
                        <strong className="text-emerald-900 font-bold">[수정 패치 #3]:</strong> 오른쪽 복도 바닥에 짓눌린 방패 파편을 묘사하여 플레이어가 직감적으로 피할 수 있는 힌트를 주었습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 패치노트 실시간 카드 빌더 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'patch_card' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      나만의 공식 스토리 패치노트 카드 빌더
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPatchCard}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-slate-700 transition-colors"
                  >
                    {isPatchCardCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>카드 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">게임 제목</label>
                    <input
                      type="text"
                      value={patchForm.gameTitle}
                      onChange={e => setPatchForm(prev => ({ ...prev, gameTitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">수정한 버그 유형</label>
                    <select
                      value={patchForm.bugType}
                      onChange={e => setPatchForm(prev => ({ ...prev, bugType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 font-medium"
                    >
                      <option value="구멍 양말 버그 (플롯 홀)">구멍 양말 버그 (앞뒤 모순 플롯 홀)</option>
                      <option value="치트키 사기 버그 (밸런스 붕괴)">치트키 사기 버그 (과도하게 쉬운 선택지)</option>
                      <option value="낭떠러지 버그 (허무한 막다른 길)">낭떠러지 버그 (힌트 없는 허무한 즉사)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">[-] 수정 전 초안 (v1.0)</label>
                    <textarea
                      rows={2}
                      value={patchForm.v1}
                      onChange={e => setPatchForm(prev => ({ ...prev, v1: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 leading-relaxed font-normal"
                    ></textarea>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">[+] 수정 후 완성본 (v2.0)</label>
                    <textarea
                      rows={2}
                      value={patchForm.v2}
                      onChange={e => setPatchForm(prev => ({ ...prev, v2: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 leading-relaxed font-normal"
                    ></textarea>
                  </div>
                </div>

                {/* 실시간 패치노트 프리뷰 카드 */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">실시간 카드 프리뷰</span>
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-indigo-400">🛠️ [패치노트 v2.0]</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {patchForm.bugType}
                      </span>
                    </div>
                    <div className="font-extrabold text-white text-sm">
                      {patchForm.gameTitle || '나의 게임 제목'}
                    </div>
                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-rose-950/40 border border-rose-900/60 text-rose-200 font-normal">
                        <strong className="text-rose-400 font-bold block">[-] v1.0 초안:</strong>
                        {patchForm.v1 || '수정 전 초안 내용...'}
                      </div>
                      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 font-normal">
                        <strong className="text-emerald-400 font-bold block">[+] v2.0 밸런스 패치:</strong>
                        {patchForm.v2 || '수정 후 완성 대본...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 자가 점검 체크리스트 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      4강 자가 점검 체크리스트 (6문항)
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
                <div className="space-y-2 pt-1 text-xs">
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
                      1. 앞뒤 소지품이나 사건이 충돌하는 <strong>‘구멍 양말 버그(플롯 홀)’</strong>를 찾아내 매끄럽게 수정했나요?
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
                      2. 한쪽 선택지가 너무 쉬워 다른 선택지가 무의미해지는 <strong>‘치트키 사기 버그’</strong>를 조율했나요?
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
                      3. 아무 힌트 없이 억울하게 즉사하는 <strong>‘낭떠러지 버그’</strong>에 사전 복선(힌트)을 심었나요?
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
                      4. AI 조수의 제안 1개는 멋지게 채택하고, 1개는 <strong>내 상상력으로 직접 고치는 황금률</strong>을 실천했나요?
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
                      5. 결말 부분에 깜짝 반전(Plot Twist)이나 <strong>심장 쫄깃 절단 신공(Cliffhanger)</strong> 양념을 넣었나요?
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

                {/* 완료 카드 또는 잔여 안내 */}
                {isAllCompleted ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                      <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                      <span>🎉 4강 퀘스트 완주! 5강 언락 성공!</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-normal">
                      완벽하게 밸런스 패치된 스토리가 준비되었습니다. 이제 5강에서는 브라우저 화면에 진짜 게임 대사창을 띄우는 <strong>HTML 웹 인터페이스 코딩</strong>을 시작합니다!
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 5강 웹 화면 코딩이 열립니다!</span>
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

export default Lesson04;
