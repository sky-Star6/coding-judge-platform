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
  Zap,
  Gift,
  Dice5,
  CircleDot,
  Dices,
  BookOpen,
  GitBranch,
  Boxes,
  Hash,
  ToggleLeft,
  ShieldCheck,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 8강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'gacha' | 'quiz' | 'checklist';
export type CharmType = 'basic' | 'clover' | 'fever';

export interface Lesson08Props {
  onComplete?: () => void;
}

export const Lesson08: React.FC<Lesson08Props> = ({ onComplete }) => {
  // ---------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('gacha');

  // 가챠 머신 상태
  const [lastDice, setLastDice] = useState<string | null>(null);
  const [lastGrade, setLastGrade] = useState<string>('');
  const [lastItem, setLastItem] = useState<string>('대기 중 (준비 완료)');
  const [charmType, setCharmType] = useState<CharmType>('basic');
  const [isGachaRolling, setIsGachaRolling] = useState<boolean>(false);
  const [isJsCopied, setIsJsCopied] = useState<boolean>(false);

  // 미니 퀴즈 (Stage 2)
  const [stage2QuizAnswer, setStage2QuizAnswer] = useState<number | null>(null);

  // 3문항 스피드 아케이드 퀴즈 (우측 탭 2)
  const arcadeQuestions = [
    {
      q: "1. 컴퓨터가 배열 속 첫 번째 보물을 꺼낼 때 사용하는 번호표는?",
      options: ["0번 (Zero-based 인덱스)", "1번 (첫 번째니까 1번)"],
      answer: 0,
      explanation: "정답! 자바스크립트의 모든 배열은 0번부터 시작합니다."
    },
    {
      q: "2. '만약 조건이 참이 아니라면' 다른 길로 갈 때 쓰는 조건문 단어는?",
      options: ["then", "else"],
      answer: 1,
      explanation: "정답! if (조건) { ... } else { ... } 구조에서 else는 '그렇지 않으면'입니다."
    },
    {
      q: "3. 두 값이 진짜 완벽히 똑같은지 비교할 때 쓰는 양팔 저울 기호는?",
      options: ["=== (엄격 비교)", "= (대입하기)"],
      answer: 0,
      explanation: "정답! = 기호 1개는 값을 상자에 넣는 것이고, === 기호 3개는 똑같은지 비교하는 것입니다!"
    }
  ];

  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);

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
  // 로컬 스토리지 연동 및 초기화
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const savedRetro = localStorage.getItem('lesson08_retro');
      if (savedRetro) {
        setRetro(JSON.parse(savedRetro));
      }
      const savedChecklist = localStorage.getItem('lesson08_checklist');
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
      localStorage.setItem('lesson08_retro', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChecklistToggle = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem('lesson08_checklist', JSON.stringify(updated));
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
  // 가챠 머신 액션
  // ---------------------------------------------------------------------------
  const itemsDB = {
    legendary: ['🌟 전설의 황금 엑스칼리버', '👑 불멸의 태양 왕관', '✨ 마법사의 궁극 오브'],
    rare: ['🛡️ 은빛 기사 수호 방패', '⚔️ 날카로운 강철 장검', '🏹 바람의 엘프 활'],
    common: ['🪵 평범한 나무 몽둥이', '🪖 낡은 가죽 투구', '🥖 말라붙은 바게트 빵']
  };

  const handlePullGacha = () => {
    setIsGachaRolling(true);
    setTimeout(() => setIsGachaRolling(false), 500);

    const dice = Math.random() * 100;
    setLastDice(dice.toFixed(2));

    let threshold = 95;
    if (charmType === 'clover') threshold = 85;
    else if (charmType === 'fever') threshold = 70;

    let grade = 'common';
    if (dice >= threshold) {
      grade = 'legendary';
    } else if (dice >= 70) {
      grade = 'rare';
    } else {
      grade = 'common';
    }

    const list = itemsDB[grade as keyof typeof itemsDB];
    const picked = list[Math.floor(Math.random() * list.length)];
    setLastGrade(grade);
    setLastItem(picked);
  };

  const handleResetGacha = () => {
    setLastDice(null);
    setLastGrade('');
    setLastItem('대기 중 (준비 완료)');
    setCharmType('basic');
  };

  const handleCopyGachaCode = () => {
    const code = `// 🎲 럭키 가챠 자바스크립트 확률 분기 로직
const dice = ${lastDice !== null ? lastDice : 'Math.random() * 100'}; // 0~99.99

if (dice >= ${charmType === 'clover' ? 85 : charmType === 'fever' ? 70 : 95}) {
  // ${charmType === 'clover' ? '15%' : charmType === 'fever' ? '30%' : '5%'} 확률: 전설의 황금 엑스칼리버!
  result = '${lastGrade === 'legendary' ? lastItem : '전설 등급'}';
} else if (dice >= 70) {
  // 25% 확률: 은빛 기사 수호 방패
  result = '${lastGrade === 'rare' ? lastItem : '희귀 등급'}';
} else {
  // 일반 등급
  result = '${lastGrade === 'common' ? lastItem : '일반 등급'}';
}

document.getElementById('gacha-result-name').innerText = result;`;

    navigator.clipboard.writeText(code).then(() => {
      setIsJsCopied(true);
      setTimeout(() => setIsJsCopied(false), 1500);
    });
  };

  // ---------------------------------------------------------------------------
  // 퀴즈 액션
  // ---------------------------------------------------------------------------
  const handleArcadeQuizSelect = (idx: number) => {
    if (quizAnswered) return;
    setChosenIdx(idx);
    setQuizAnswered(true);

    const q = arcadeQuestions[currentQIdx];
    if (idx === q.answer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setCurrentQIdx(prev => prev + 1);
    setQuizAnswered(false);
    setChosenIdx(null);
  };

  const handleRestartQuiz = () => {
    setCurrentQIdx(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setChosenIdx(null);
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
              시즌 2 · 8강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              행운의 황금 상자를 열어라! 럭키 가챠 &amp; 퀴즈 게임
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
            <span>가챠 오프닝</span>
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
            <span>조건문 &amp; 배열</span>
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
            <span>가챠 &amp; 퀴즈 제작</span>
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
            <span>인덱스 0 연구소</span>
          </button>
        </nav>

        {/* 우측 진척도 & 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">8강 진척도</span>
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
                <span>9강 언락됨!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>9강 잠김</span>
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
          {/* [STAGE 1: 가챠 오프닝] */}
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
                  <Gift className="w-3 h-3 text-slate-950" />
                  <span>보물 상자 &amp; 퀴즈 개장!</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                행운의 황금 상자를 열어라! 럭키 가챠 &amp; 퀴즈 게임
              </h2>

              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-2xl font-normal">
                무작위 주사위와 갈림길 신호등으로 게임에 짜릿한 긴장감을 불어넣습니다! 100면체 주사위를 굴려 전설의 황금검을 뽑고, 3문항 스피드 퀴즈 아케이드를 완성합니다.
              </p>

              {/* 4대 메타 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">핵심 마법</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">조건문 &amp; 배열([ ]) &amp; 난수</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">제작 산출물</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">럭키 가챠 &amp; 3문항 퀴즈</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">주의 함정</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">인덱스 0번 &amp; 대입(=) 함정</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-amber-200 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">약 40분 (체험 &amp; 실습)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 1: 가챠 오프닝 */}
          {/* ----------------------------------------------------------------- */}

              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                가챠 오프닝: 매번 똑같은 결과는 심심해! 우연과 행운의 마법
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              7강 쿠키클리커는 버튼을 누르면 정직하게 1개씩 숫자가 올라갔습니다. 하지만 모바일 게임 속 보물 상자를 열 때처럼 <strong>"이번엔 뭐가 나올까?!"</strong> 하고 심장이 두근두근 뛰는 재미를 주려면 어떻게 해야 할까요?<br />
              컴퓨터가 보이지 않는 주사위를 던져 결과를 무작위로 결정하는 <strong>난수(Math.random)</strong>와, 그 결과에 따라 다른 보상을 선물하는 <strong>조건문(if/else)</strong>이 필요합니다!
            </p>

            {/* 2대 아케이드 미션 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>미션 1: 두근두근 럭키 가챠 상자</span>
                </div>
                <p className="text-xs text-amber-950 font-normal leading-relaxed">
                  황금 열쇠를 돌리면 상자가 흔들리며 아이템이 튀어나옵니다! <strong>일반 아이템(70%)</strong>, <strong>희귀 아이템(25%)</strong>, 그리고 단 5% 확률의 <strong>전설의 황금검</strong>을 뽑아보세요!
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>미션 2: 3문항 스피드 상식 퀴즈</span>
                </div>
                <p className="text-xs text-indigo-950 font-normal leading-relaxed">
                  문제를 하나 풀면 다음 문제로 쏙 넘어가는 배열 퀴즈! 정답을 맞히면 점수가 올라가고 즉시 해설 피드백을 보여줍니다.
                </p>
              </div>
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
                  <span>다음: Stage 2 조건문 &amp; 배열</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 조건문 &amp; 배열] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                핵심 원리: 갈림길 신호등(조건문)과 번호표 서랍장(배열)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              컴퓨터에게 상황 판단력과 보관함을 선물해주는 3대 마법 도구를 알아봅시다!
            </p>

            {/* 3대 마법 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span>1. if / else (신호등)</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 text-indigo-300 p-2 rounded-lg">
                  if (점수 &gt;= 80) &#123; 합격! &#125;
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong>"만약 비가 오면 우산을 쓰고, 안 오면 모자를 써라!"</strong> 처럼 참/거짓에 따라 다른 길로 안내하는 갈림길 신호등입니다.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>2. 배열 (번호표 서랍장)</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 text-amber-300 p-2 rounded-lg">
                  ['나무검', '은방패', '황금검']
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  아이템이나 퀴즈 문제를 차례대로 담아두는 칸칸이 보관함입니다. <strong>대괄호([ ])</strong>로 묶어주고 쉼표(,)로 구분합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Dices className="w-4 h-4 text-emerald-500" />
                  <span>3. Math.random (주사위)</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 text-emerald-300 p-2 rounded-lg">
                  Math.random() * 100
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  컴퓨터가 0부터 1 사이의 예측 불가능한 소수를 무작위로 던져주는 마법 주사위입니다. 100을 곱하면 <strong>100면체 주사위</strong>가 됩니다!
                </p>
              </div>
            </div>

            {/* 인포그래픽 */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>🎲 100면체 주사위로 가챠 등급 결정하는 마법 공식</span>
                <span className="text-[11px] text-slate-400 font-mono">dice = Math.random() * 100</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span>일반 (Common)</span>
                    <span className="text-slate-400 font-mono">70%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">주사위 번호: 0 ~ 69</p>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">나무 몽둥이, 녹슨 투구</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800 border border-indigo-500/50 space-y-1">
                  <div className="flex items-center justify-between font-bold text-indigo-400">
                    <span>희귀 (Rare)</span>
                    <span className="text-indigo-300 font-mono">25%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">주사위 번호: 70 ~ 94</p>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 font-bold">은빛 기사 방패</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800 border border-amber-500 space-y-1 shadow-md shadow-amber-950/50">
                  <div className="flex items-center justify-between font-bold text-amber-400">
                    <span>전설 (Legendary!)</span>
                    <span className="text-amber-300 font-mono">5%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">주사위 번호: 95 ~ 99</p>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">빛나는 황금 엑스칼리버</span>
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
                자바스크립트에서 <code className="font-mono text-xs font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">const bag = ['사과', '바나나', '포도'];</code> 배열에서 첫 번째 과일인 <strong>'사과'</strong>를 꺼내려면 번호표를 몇 번으로 불러야 할까요?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStage2QuizAnswer(1)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    stage2QuizAnswer === 1
                      ? 'border-rose-300 bg-rose-50 text-rose-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  1. bag[1] (1번 칸)
                </button>
                <button
                  type="button"
                  onClick={() => setStage2QuizAnswer(2)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    stage2QuizAnswer === 2
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  2. bag[0] (0번 칸)
                </button>
                <button
                  type="button"
                  onClick={() => setStage2QuizAnswer(3)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    stage2QuizAnswer === 3
                      ? 'border-rose-300 bg-rose-50 text-rose-800'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  3. bag['사과']
                </button>
              </div>

              {stage2QuizAnswer !== null && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed font-normal ${
                    stage2QuizAnswer === 2
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {stage2QuizAnswer === 2 ? (
                    <span>
                      <strong className="font-bold">정답입니다! 🎉</strong> 컴퓨터 배열의 첫 번째 칸은 항상 <strong>0번(Zero-based)</strong>입니다! 그래서 첫 번째 아이템은 bag[0]으로 꺼냅니다.
                    </span>
                  ) : (
                    <span>
                      <strong className="font-bold">아쉬워요!</strong> 사람은 1번부터 세지만, 컴퓨터는 0번부터 세요! 정답은 <strong>2번 bag[0]</strong>입니다!
                    </span>
                  )}
                </div>
              )}
            </div>
          </article>

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
                  ← 이전: Stage 1 가챠 오프닝
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
                  <span>다음: Stage 3 가챠 &amp; 퀴즈 제작</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 가챠 &amp; 퀴즈 제작] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                실전 제작: 가챠 뽑기와 퀴즈 진행 코드 들여다보기
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              우측 실습 콘솔에서 실제로 구동되는 가챠 머신과 퀴즈 아케이드의 핵심 코드를 확인해봅시다!
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>1. 럭키 가챠 확률 판정 함수 (if/else if 문)</span>
                </span>
                <pre className="font-mono text-xs bg-slate-900 text-amber-300 p-2.5 rounded-lg overflow-x-auto">
{`function openGacha() {
  const dice = Math.random() * 100; // 0 ~ 99.99 사이의 무작위 주사위!
  
  if (dice >= 95) {
    return '🌟 전설의 황금검 (5% 당첨!)';
  } else if (dice >= 70) {
    return '🛡️ 은빛 기사 방패 (25% 당첨)';
  } else {
    return '🪵 평범한 나무 몽둥이 (70%)';
  }
}`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>2. 문제 목록을 담은 퀴즈 객체 배열 (Array of Objects)</span>
                </span>
                <pre className="font-mono text-xs bg-slate-900 text-indigo-300 p-2.5 rounded-lg overflow-x-auto">
{`const quizList = [
  { q: "컴퓨터 배열의 첫 번째 칸 번호는?", choices: ["0번", "1번"], answer: 0 },
  { q: "조건문의 '그렇지 않으면' 명령어는?", choices: ["else", "then"], answer: 0 },
  { q: "난수를 뽑아주는 자바스크립트 도구는?", choices: ["Math.random()", "Random.roll()"], answer: 0 }
];`}
                </pre>
              </div>
            </div>
          </article>

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
                  ← 이전: Stage 2 조건문 &amp; 배열
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
                  <span>다음: Stage 4 인덱스 0 연구소</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 인덱스 0 연구소] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                명탐정 오류 연구소: 개발자들을 울리는 2대 마법 함정!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              조건문과 배열을 다룰 때 10명 중 9명이 겪는 치명적인 버그 함정입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>함정 1: 컴퓨터는 0번부터 셉니다! (Off-by-One)</span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed font-normal">
                  아이템이 3개 들어있는 배열 <code className="font-mono text-xs">['A', 'B', 'C']</code>에서 마지막 3번째 아이템을 꺼내려고 <code className="font-mono text-rose-700 font-bold">list[3]</code>을 부르면 컴퓨터는 <strong className="text-rose-700 font-bold">undefined(텅 빔!)</strong>를 뱉어냅니다.<br />
                  마지막 3번째 아이템의 진짜 번호표는 <code className="font-mono text-emerald-700 font-bold">list[2]</code>입니다!
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <CircleDot className="w-4 h-4 text-amber-600" />
                  <span>함정 2: 넣기(=)와 비교하기(===)를 헷갈리면 안 돼요!</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-normal">
                  • <code className="font-mono text-xs font-bold">score = 100</code> ➔ 상자에 100을 집어넣어라! (대입)<br />
                  • <code className="font-mono text-xs font-bold">if (score === 100)</code> ➔ 상자 안의 숫자가 진짜 100과 똑같니? (비교)<br />
                  조건문 안에서 <code className="font-mono text-rose-700 font-bold">if (score = 100)</code>이라고 쓰면 무조건 참이 되어 게임 규칙이 엉망이 됩니다!
                </p>
              </div>
            </div>

            {/* 회고 수첩 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>8강 가챠 &amp; 퀴즈 마스터 회고 수첩</span>
                </h4>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>자동 저장 중</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label htmlFor="tsx-retro-q1" className="font-bold text-slate-700 block mb-1">
                    Q1. 가챠 상자에서 내가 원하는 전설 아이템이 나왔을 때의 확률 마법 원리는 무엇이었나요?
                  </label>
                  <input
                    type="text"
                    id="tsx-retro-q1"
                    value={retro.q1}
                    onChange={(e) => handleRetroChange('q1', e.target.value)}
                    placeholder="예: Math.random() 주사위가 95 이상으로 나왔을 때 if문이 전설 상자를 열어줬어요!"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-normal"
                  />
                </div>
                <div>
                  <label htmlFor="tsx-retro-q2" className="font-bold text-slate-700 block mb-1">
                    Q2. 컴퓨터가 1번이 아닌 0번부터 센다는 사실을 알았을 때 어떤 점을 조심해야겠다고 느꼈나요?
                  </label>
                  <input
                    type="text"
                    id="tsx-retro-q2"
                    value={retro.q2}
                    onChange={(e) => handleRetroChange('q2', e.target.value)}
                    placeholder="예: 첫 번째 아이템을 찾을 땐 꼭 0번 인덱스를 적어야 엉뚱한 결과가 안 나온다는 걸 배웠어요."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-normal"
                  />
                </div>
              </div>
            </div>
          </article>

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
                  ← 이전: Stage 3 가챠 &amp; 퀴즈 제작
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
                  JUNIOR DEVELOPER GLOSSARY · 8강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 게임 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 조건문 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-amber-400" />
                      1. 조건문
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Conditional Statement (if / else)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">제어 흐름</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "비가 오면 우산을 쓰고, 해가 뜨면 모자를 쓰는 갈림길 표지판!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 주어진 불리언(Boolean) 조건식의 참(true) 또는 거짓(false) 결과에 따라 프로그램의 실행 흐름을 여러 갈래로 분기시키는 제어문입니다.
                </p>
              </div>
              {/* 용어 2: 배열 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-sky-400" />
                      2. 배열
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Array ([ ])</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">자료구조</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "번호표(0, 1, 2...)가 붙어 여러 개의 보물을 한 줄로 가지런히 넣어둔 기차 칸 서랍장!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 여러 개의 데이터 요소를 순서대로 나열하여 단일 변수에 연속적으로 저장하는 대표적인 선형 자료구조(Linear Data Structure)입니다.
                </p>
              </div>
              {/* 용어 3: 인덱스 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-emerald-400" />
                      3. 인덱스
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Array Index</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">주소/참조</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "서랍장의 몇 번째 칸인지 알려주는 번호표입니다. 컴퓨터는 신기하게 0번부터 세어요!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 배열이나 리스트 등의 순차적 컬렉션에서 특정 요소의 위치를 식별하기 위해 부여된 0 기반(Zero-based) 정수 위치 번호입니다.
                </p>
              </div>
              {/* 용어 4: 난수 생성기 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Dices className="w-4 h-4 text-purple-400" />
                      4. 난수 생성기
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Random Number Generator (Math.random)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">수학/알고리즘</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "0부터 1 사이에서 아무도 예측할 수 없는 숫자를 데굴데굴 굴려주는 디지털 요술 주사위!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 0 이상 1 미만의 부동소수점 난수를 균일한 확률 분포(Uniform Distribution)로 무작위 생성하는 알고리즘 함수입니다.
                </p>
              </div>
              {/* 용어 5: 불리언 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <ToggleLeft className="w-4 h-4 text-rose-400" />
                      5. 불리언
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Boolean (true / false)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">데이터 타입</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "스위치처럼 '켜짐(참)'과 '꺼짐(거짓)' 딱 두 가지만 대답하는 진실의 거울!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 참(true)과 거짓(false) 두 가지 논리적 진리값만을 가질 수 있는 원시 데이터 타입(Primitive Data Type)입니다.
                </p>
              </div>
              {/* 용어 6: 엄격 동등 비교 연산자 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      6. 엄격 동등 비교 연산자
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Strict Equality Operator (===)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">연산자/검증</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "왼쪽과 오른쪽이 진짜 완벽하게 똑같은지 저울에 올려 꼼꼼하게 따져보는 감별사!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 두 피연산자의 값과 자료형(Data Type)이 모두 일치하는지를 엄격하게 판별하는 일치 비교 연산자입니다.
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
              onClick={() => setActiveRightTab('gacha')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'gacha'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>가챠 머신</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('quiz')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'quiz'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>3문항 퀴즈</span>
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
              <span>8강 완주 ({checklistPercent}%)</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 럭키 가챠 머신 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'gacha' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      실시간 럭키 가챠 머신 v1.0
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleResetGacha}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-slate-600 transition-colors cursor-pointer"
                      title="가챠 초기화"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>초기화</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyGachaCode}
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

                {/* 가챠 상자 비주얼 */}
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/60 to-orange-50/60 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-inner relative overflow-hidden">
                  <div className={`relative py-2 transition-transform duration-200 ${isGachaRolling ? 'animate-bounce' : ''}`}>
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-xl border-4 border-amber-200 text-white">
                      <Gift className="w-16 h-16" />
                    </div>
                  </div>

                  <div className="space-y-1 w-full">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        lastGrade === 'legendary'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : lastGrade === 'rare'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          : 'bg-white/80 border border-amber-200 text-amber-800 shadow-2xs'
                      }`}
                    >
                      {lastGrade === 'legendary'
                        ? '👑 전설 등급 (당첨!)'
                        : lastGrade === 'rare'
                        ? '⚔️ 희귀 등급 (당첨)'
                        : lastGrade === 'common'
                        ? '🪵 일반 등급'
                        : '상자를 열어 행운을 시험해보세요!'}
                    </span>
                    <div
                      className={`text-lg sm:text-xl font-black tracking-tight pt-1 ${
                        lastGrade === 'legendary'
                          ? 'text-amber-600 animate-pulse'
                          : lastGrade === 'rare'
                          ? 'text-indigo-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {lastItem}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {lastDice !== null ? `주사위 번호: ${lastDice}점 / 100점` : '주사위 값: 아직 안 굴림'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePullGacha}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Dice5 className="w-5 h-5 text-amber-200" />
                    <span>보물 상자 1회 뽑기 (무료)</span>
                  </button>
                </div>

                {/* 확률 안내 바 */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <span className="block text-slate-400 font-normal">일반 (70%)</span>
                    <span>나무 몽둥이 등</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                    <span className="block text-indigo-400 font-normal">희귀 (25%)</span>
                    <span>은빛 기사 방패</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-800">
                    <span className="block text-amber-500 font-normal">전설 (5%)</span>
                    <span>황금 엑스칼리버!</span>
                  </div>
                </div>

                {/* 실시간 JS 코드 뷰어 */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <label htmlFor="tsx-gacha-editor" className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>실시간 동작 중인 가챠 JavaScript 코드</span>
                    <span className="text-[10px] font-mono text-amber-600">Math.random() &amp; if/else</span>
                  </label>
                  <textarea
                    id="tsx-gacha-editor"
                    rows={8}
                    value={`// 🎲 럭키 가챠 자바스크립트 확률 분기 로직
const dice = ${lastDice !== null ? lastDice : 'Math.random() * 100'}; // 0~99.99

if (dice >= ${charmType === 'clover' ? 85 : charmType === 'fever' ? 70 : 95}) {
  // ${charmType === 'clover' ? '15%' : charmType === 'fever' ? '30%' : '5%'} 확률: 전설의 황금 엑스칼리버!
  result = '${lastGrade === 'legendary' ? lastItem : '전설 등급'}';
} else if (dice >= 70) {
  // 25% 확률: 은빛 기사 수호 방패
  result = '${lastGrade === 'rare' ? lastItem : '희귀 등급'}';
} else {
  // 일반 등급
  result = '${lastGrade === 'common' ? lastItem : '일반 등급'}';
}

document.getElementById('gacha-result-name').innerText = result;`}
                    readOnly
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed bg-slate-900 text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    spellCheck={false}
                  ></textarea>
                </div>

                {/* 부적 튜닝 놉 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>행운의 부적 확률 조율 (Luck Charm)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">실시간 확률 &amp; 코드 반영</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">전설 당첨 확률 부스트</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCharmType('basic')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          charmType === 'basic'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        기본 (5%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCharmType('clover')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          charmType === 'clover'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        황금 클로버 (15%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCharmType('fever')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                          charmType === 'fever'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        대박 피버 (30%)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 요약 카드 */}
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>💡 럭키 가챠 핵심 3대 공식 요약</span>
                </div>
                <ul className="text-[11px] text-amber-950/80 space-y-1 leading-relaxed">
                  <li>• <strong>Math.random() * 100:</strong> 0부터 99.99 사이의 무작위 100면체 주사위</li>
                  <li>• <strong>if / else if / else:</strong> 주사위 점수 구간별로 아이템 등급을 가르는 신호등</li>
                  <li>• <strong>배열[인덱스]:</strong> 순서대로 담긴 보물 사물함 (첫 번째 칸은 0번!)</li>
                </ul>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 3문항 스피드 퀴즈 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'quiz' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      3문항 스피드 아케이드 퀴즈
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    현재 점수: {quizScore * 10}점
                  </span>
                </div>

                {currentQIdx < arcadeQuestions.length ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">
                        문제 {currentQIdx + 1} / {arcadeQuestions.length}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">배열 순회 실습</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {arcadeQuestions[currentQIdx].q}
                    </h4>

                    <div className="space-y-2 pt-1">
                      {arcadeQuestions[currentQIdx].options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleArcadeQuizSelect(idx)}
                          className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                            chosenIdx === idx
                              ? idx === arcadeQuestions[currentQIdx].answer
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs'
                                : 'border-rose-300 bg-rose-50 text-rose-800'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {idx + 1}. {opt}
                        </button>
                      ))}
                    </div>

                    {quizAnswered && (
                      <div
                        className={`p-3 rounded-xl text-xs font-normal leading-relaxed ${
                          chosenIdx === arcadeQuestions[currentQIdx].answer
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                            : 'bg-rose-50 text-rose-900 border border-rose-200'
                        }`}
                      >
                        {chosenIdx === arcadeQuestions[currentQIdx].answer ? (
                          <span>
                            <strong className="font-bold">정답입니다! 🎉</strong> {arcadeQuestions[currentQIdx].explanation}
                          </span>
                        ) : (
                          <span>
                            <strong className="font-bold">아쉬워요!</strong> {arcadeQuestions[currentQIdx].explanation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-center">
                    <h4 className="text-sm font-bold text-slate-900">🎉 퀴즈 완료!</h4>
                    <p className="text-xs text-slate-600">
                      축하합니다! 3문항을 모두 풀었습니다. 총 점수: {quizScore * 10}점!
                    </p>
                    <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold text-center">
                      조건문과 배열 마법을 완벽히 마스터했습니다!
                    </div>
                    <button
                      type="button"
                      onClick={handleRestartQuiz}
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer hover:bg-slate-900 transition-all text-center"
                    >
                      퀴즈 다시 풀기
                    </button>
                  </div>
                )}

                {quizAnswered && currentQIdx < arcadeQuestions.length && (
                  <button
                    type="button"
                    onClick={handleNextQuiz}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  >
                    다음 문제 풀기 →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 8강 자가 점검 (6문항) */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      8강 퀘스트 완주 자가 점검 (6문항)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600 font-mono">
                    {completedChecklistCount} / 6 완료 ({checklistPercent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-amber-500 rounded-full transition-all duration-300 ${widthClasses[completedChecklistCount]}`}
                  ></div>
                </div>

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
                      1. `if / else` 조건문이 상황에 따라 갈림길을 나누어주는 신호등임을 이해했나요?
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
                      2. 여러 아이템이나 퀴즈를 순서대로 담아두는 배열(`[ ]`)의 형태를 확인했나요?
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
                      3. `Math.random() * 100`으로 100면체 주사위를 굴려 확률(70%, 25%, 5%)을 나누어보았나요?
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
                      4. 컴퓨터는 배열의 첫 번째 칸을 1번이 아닌 <strong>0번</strong>부터 센다는 규칙을 확인했나요?
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
                      5. 상자에 값을 넣는 대입(`=`)과 양쪽이 같은지 비교하는(`===`) 연산자의 차이를 이해했나요?
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

                {!isAllCompleted ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 9강 종합 미니 프로젝트가 열립니다!</span>
                    <span className="font-bold text-slate-400">잠김 🔒</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 border border-amber-300 space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                      <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                      <span>축하합니다! 8강 퀘스트 완주 성공!</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-normal">
                      당신은 이제 확률과 조건문을 자유자재로 다루는 **주니어 아케이드 로직 마스터**입니다!<br />
                      이제 다음 **9강(웹 기초 미니 프로젝트: 별똥별 피하기 &amp; MVP 아케이드 완성)**으로 넘어가 종합 미니 프로젝트를 완성해봅시다!
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

export default Lesson08;
