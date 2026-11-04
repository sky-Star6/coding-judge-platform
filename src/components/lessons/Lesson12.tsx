import React, { useState, useEffect } from 'react';
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
  Archive,
  Package,
  PackageOpen,
  PlusCircle,
  ShieldCheck,
  BookOpen,
  Database,
  KeyRound,
  ArrowUpDown,
  HardDrive,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 3 · 12강 React 컴포넌트 (Lesson12.tsx)
 * 우리 반 명예의 전당: 최고 점수 저장(로컬 스토리지)과 랭킹전
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'ranking' | 'storage' | 'checklist';

interface RankingItem {
  name: string;
  score: number;
  date: string;
}

const STORAGE_KEY = 'arcade_rankings';
const DEFAULT_RANKINGS: RankingItem[] = [
  { name: '민우', score: 1200, date: '11/01' },
  { name: '지아', score: 950, date: '11/01' },
  { name: '준혁', score: 800, date: '10/31' },
  { name: '하은', score: 650, date: '10/30' },
  { name: '서진', score: 500, date: '10/29' }
];

export default function Lesson12() {
  // 스테이지 및 우측 탭 상태
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('ranking');

  // 랭킹 리스트 상태
  const [rankings, setRankings] = useState<RankingItem[]>(DEFAULT_RANKINGS);
  const [playerName, setPlayerName] = useState<string>('우주비행사');
  const [playerScore, setPlayerScore] = useState<number>(1350);
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false);

  // JSON 시뮬레이터 상태
  const [simState, setSimState] = useState<'idle' | 'stringified' | 'parsed'>('idle');

  // 프롬프트 복사 상태
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 자가 점검 체크리스트 (6개)
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 로컬스토리지에서 랭킹 및 완료 상태 복원
  useEffect(() => {
    try {
      const savedRankings = localStorage.getItem(STORAGE_KEY);
      if (savedRankings) {
        setRankings(JSON.parse(savedRankings));
      }
    } catch (e) {
      console.warn('랭킹 파싱 실패:', e);
    }

    const savedCompleted = localStorage.getItem('ai_lesson_12_completed');
    if (savedCompleted === 'true') {
      setCheckedItems([true, true, true, true, true, true]);
      setIsCompleted(true);
    }
  }, []);

  // 체크리스트 진행률 계산
  const checkedCount = checkedItems.filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / 6) * 100);

  const handleToggleCheck = (index: number) => {
    const newItems = [...checkedItems];
    newItems[index] = !newItems[index];
    setCheckedItems(newItems);

    const newCount = newItems.filter(Boolean).length;
    if (newCount === 6) {
      setIsCompleted(true);
      localStorage.setItem('ai_lesson_12_completed', 'true');
    } else {
      setIsCompleted(false);
    }
  };

  // 새 기록 랭킹 등록
  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim() || '익명 도전자';
    const score = Number(playerScore) || 100;

    const updated = [...rankings, { name, score, date: '오늘' }];
    updated.sort((a, b) => b.score - a.score);
    const top5 = updated.slice(0, 5);

    setRankings(top5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));

    setRegisteredSuccess(true);
    setTimeout(() => setRegisteredSuccess(false), 1500);

    // 체크리스트 4번 자동 체크
    if (!checkedItems[3]) {
      const next = [...checkedItems];
      next[3] = true;
      setCheckedItems(next);
      if (next.filter(Boolean).length === 6) {
        setIsCompleted(true);
        localStorage.setItem('ai_lesson_12_completed', 'true');
      }
    }
  };

  const handleResetRankings = () => {
    setRankings(DEFAULT_RANKINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RANKINGS));
  };

  // JSON 시뮬레이션
  const handleSimulateStringify = () => {
    setSimState('stringified');
    if (!checkedItems[2]) {
      const next = [...checkedItems];
      next[2] = true;
      setCheckedItems(next);
      if (next.filter(Boolean).length === 6) {
        setIsCompleted(true);
        localStorage.setItem('ai_lesson_12_completed', 'true');
      }
    }
  };

  const handleSimulateParse = () => {
    setSimState('parsed');
    if (!checkedItems[2]) {
      const next = [...checkedItems];
      next[2] = true;
      setCheckedItems(next);
      if (next.filter(Boolean).length === 6) {
        setIsCompleted(true);
        localStorage.setItem('ai_lesson_12_completed', 'true');
      }
    }
  };

  // 프롬프트 복사
  const handleCopyPrompt = () => {
    const prompt = `우리 별똥별 아케이드 게임에 localStorage를 사용한 최고 점수 저장 및 TOP 5 랭킹 기능을 만들어줘.

1. 게임 오버 시 플레이어 이름과 점수를 JSON.stringify로 'arcade_rankings' 키에 저장해줘.
2. 이전 기록을 불러와 점수 기준 내림차순(sort)으로 정렬하고 상위 5명(slice)만 남겨줘.
3. 게임 시작 화면에 금·은·동 메달이 표시된 명예의 전당 스코어보드를 렌더링해줘.`;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);

      if (!checkedItems[5]) {
        const next = [...checkedItems];
        next[5] = true;
        setCheckedItems(next);
        if (next.filter(Boolean).length === 6) {
          setIsCompleted(true);
          localStorage.setItem('ai_lesson_12_completed', 'true');
        }
      }
    });
  };

  const medals = [
    { icon: '🥇', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    { icon: '🥈', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
    { icon: '🥉', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { icon: '4', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
    { icon: '5', bg: 'bg-slate-50 text-slate-600 border-slate-200' }
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ===================================================================== */}
      {/* [상단 GNB] 과정 홈 | 시즌 3 피날레 · 12강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              시즌 3 · 12강 피날레
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              우리 반 명예의 전당: 최고 점수 저장(로컬 스토리지)과 랭킹전
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
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
            <span>사라진 점수</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage2'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
            <span>비밀 세이브함</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage3'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">3</span>
            <span>JSON 택배술</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage4'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">4</span>
            <span>TOP 5 랭킹전</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span className="text-amber-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {isCompleted ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
              <Unlock className="w-3.5 h-3.5 text-amber-700" />
              <span>13강 언락됨!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>13강 잠김</span>
            </div>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 2-패널 스플릿 뷰 */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">

        {/* ------------------------------------------------------------------- */}
        {/* ■ 좌측 패널 (60% 폭): 퀘스트 가이드 & 본문 (독립 슬라이드바) */}
        {/* ------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 사라진 점수] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border border-amber-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/60">
                  <Trophy className="w-3.5 h-3.5 text-amber-700" />
                  시즌 3 피날레 · 데이터 영속성과 랭킹전
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Web Storage API
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                우리 반 명예의 전당:<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600">
                  최고 점수 저장(로컬 스토리지)과 랭킹전
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                새로고침을 눌러도, 컴퓨터를 껐다 켜도 내 최고 점수가 사라지지 않는 마법! 브라우저 비밀 세이브 상자(localStorage)와 우리 반 랭킹 보드를 완성해봐요.
              </p>

              {/* 메타 4구리드 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">난이도</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">★★☆☆☆ 초급</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">45분 집중</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">핵심 도구</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">localStorage &amp; JSON</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">완료 조건</span>
                  <strong className="text-xs font-bold text-amber-800 leading-snug whitespace-nowrap">최고점 저장 + TOP 5 랭킹</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STAGE 1: 미션 브리핑 */}

              <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3>1단계: 사라진 점수의 비밀 — 새로고침했더니 내 1,200점이 날아갔어요!</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              열심히 9강, 10강, 11강을 거쳐 완성한 별똥별 피하기 아케이드 게임을 신나게 플레이해서 드디어 <strong className="text-slate-900 font-bold">1,200점</strong>이라는 역대급 최고 점수를 기록했어요!
              "선생님, 친구들한테 자랑해야지!" 하고 기뻐하며 브라우저 새로고침(F5)을 누르거나 창을 닫았다가 다시 열었더니...
            </p>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>앗! 내 점수가 0점으로 리셋되었어요! 😭</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-normal">
                방금 달성한 1,200점이 감쪽같이 증발하고 화면에는 다시 0점만 덩그러니 남아있습니다. 컴퓨터를 껐다 켜거나 브라우저를 닫아도 내 점수를 영원히 기억하게 만들 수는 없을까요?
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  왜 자바스크립트 변수는 기억을 잃어버릴까요?
                </span>
                <span className="text-[10px] font-mono text-slate-400">VOLATILE MEMORY</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                우리가 코드에서 만든 일반 변수(<code className="text-sky-300 font-mono">let score = 0;</code>)는 컴퓨터 뇌(RAM) 속에 잠깐 적어두는 <strong className="text-amber-200 font-bold">'휘발성 메모리'</strong>예요.
                칠판에 분필로 쓴 글씨처럼, 브라우저 새로고침이나 창 닫기라는 지우개가 쓱 지나가면 기억이 싹 날아가 버립니다!
              </p>
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] leading-relaxed text-slate-300">
                💡 <strong className="text-emerald-300">우리의 목표:</strong> 브라우저 하드디스크에 영구적으로 기록하는 <strong className="text-white font-bold">로컬 세이브 상자(localStorage)</strong>를 장착하여, 언제 게임을 다시 켜도 내 최고 점수와 랭킹이 살아있게 만듭니다!
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
                  <span>다음: Stage 2 비밀 세이브함</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 비밀 세이브함] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Archive className="w-4 h-4" />
              </div>
              <h3>2단계: 비밀 세이브 상자 — 컴퓨터를 꺼도 지워지지 않는 localStorage</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              브라우저 안에는 사용자 몰래 영구적으로 데이터를 보관해 주는 비밀 창고가 있어요. 이를 <strong className="text-slate-900 font-bold">로컬 스토리지 (localStorage)</strong>라고 부릅니다.
              오락실 게임기 뒷면에 붙은 세이브 칩처럼 동작해요!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center font-mono font-bold">1</span>
                  <span>보물 넣기 (setItem)</span>
                </div>
                <pre className="p-2 rounded-lg bg-white border border-amber-200 text-amber-950 font-mono text-[10px] leading-relaxed overflow-x-auto">
{`localStorage.setItem(
  'bestScore',
  1200
);`}
                </pre>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  'bestScore'라는 이름표(Key)가 붙은 상자에 1200(Value)을 쏙 집어넣어요.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs">
                  <span className="w-5 h-5 rounded-md bg-sky-200 text-sky-900 flex items-center justify-center font-mono font-bold">2</span>
                  <span>보물 꺼내기 (getItem)</span>
                </div>
                <pre className="p-2 rounded-lg bg-white border border-sky-200 text-sky-950 font-mono text-[10px] leading-relaxed overflow-x-auto">
{`let saved = 
  localStorage.getItem(
    'bestScore'
  );`}
                </pre>
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  이름표를 찾아 상자를 열고 안에 든 1200을 꺼내와요. 없으면 <code className="text-rose-600 font-mono">null</code>이 나와요.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                  <span className="w-5 h-5 rounded-md bg-rose-200 text-rose-900 flex items-center justify-center font-mono font-bold">3</span>
                  <span>상자 비우기 (removeItem)</span>
                </div>
                <pre className="p-2 rounded-lg bg-white border border-rose-200 text-rose-950 font-mono text-[10px] leading-relaxed overflow-x-auto">
{`localStorage.removeItem(
  'bestScore'
);`}
                </pre>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  더 이상 필요 없는 상자는 깨끗이 비워서 초기화할 수 있어요.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <strong className="text-indigo-900 font-bold block">F12 개발자 도구에서 눈으로 직접 확인하는 법!</strong>
                <span className="text-indigo-800 leading-relaxed">
                  키보드의 <code className="px-1 py-0.5 rounded bg-white font-mono text-indigo-900 font-bold">F12</code>를 누르고 [애플리케이션(Application)] ➔ [로컬 스토리지(Local Storage)] 메뉴를 클릭하면 내 컴퓨터에 저장된 이름표와 값들을 엑스레이처럼 확인할 수 있어요!
                </span>
              </div>
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
                  ← 이전: Stage 1 사라진 점수
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
                  <span>다음: Stage 3 JSON 택배술</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: JSON 택배술] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Package className="w-4 h-4" />
              </div>
              <h3>3단계: 데이터 택배 포장술 — 복잡한 목록을 한 줄로 만드는 JSON의 마법</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              숫자 하나(<code className="font-mono text-slate-900 font-bold">1200</code>)는 그냥 넣어도 되지만, 우리 반 친구들의 이름과 점수가 담긴 목록(<code className="font-mono text-slate-900 font-bold">{'[{name:\'민우\', score:1200}, ...]'}</code>)은 그대로 넣으면 <strong className="text-rose-600 font-bold">[object Object]</strong>라는 외계어로 깨져버려요!
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-900">
              <strong className="block font-bold">🚨 로컬 스토리지의 철칙: "오직 한 줄의 글자(문자열)만 통과할 수 있다!"</strong>
              <span className="leading-relaxed block">
                복잡한 객체나 배열을 사물함에 넣으려면 반드시 <strong className="underline decoration-amber-500">한 줄의 글자 택배</strong>로 포장해야 합니다. 이때 사용하는 것이 바로 <strong className="font-mono font-bold">JSON</strong>입니다!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Archive className="w-4 h-4" />
                    1. 택배 포장하기 (stringify)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">OBJECT → STRING</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  자바스크립트 배열을 테이프로 꽁꽁 감아 한 줄의 텍스트로 압축 포장해요.
                </p>
                <pre className="p-2.5 rounded-xl bg-slate-950 font-mono text-[10px] text-amber-200 leading-relaxed overflow-x-auto">
{`let parcel = JSON.stringify(rankList);
localStorage.setItem('ranks', parcel);`}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <PackageOpen className="w-4 h-4" />
                    2. 택배 상자 뜯기 (parse)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">STRING → OBJECT</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  사물함에서 꺼낸 글자 택배를 뜯어서 원래의 살아있는 자바스크립트 배열로 복원해요!
                </p>
                <pre className="p-2.5 rounded-xl bg-slate-950 font-mono text-[10px] text-emerald-200 leading-relaxed overflow-x-auto">
{`let parcel = localStorage.getItem('ranks');
let rankList = JSON.parse(parcel);`}
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
                  ← 이전: Stage 2 비밀 세이브함
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
                  <span>다음: Stage 4 TOP 5 랭킹전</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: TOP 5 랭킹전] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
                <Trophy className="w-4 h-4" />
              </div>
              <h3>4단계: 명예의 전당 랭킹전 — 우리 반 오락실 스코어보드 완성</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              오락실 게임기처럼 플레이가 끝났을 때 최고 기록 TOP 5를 실시간으로 줄 세우는 4단계 수학 공식입니다.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-slate-900 block">기존 랭킹 불러오기</strong>
                  <span className="text-slate-600 text-[11px]"><code className="text-indigo-600 font-mono">let list = JSON.parse(localStorage.getItem('rankings')) || [];</code></span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <strong className="text-slate-900 block">새 플레이어 기록 추가</strong>
                  <span className="text-slate-600 text-[11px]"><code className="text-indigo-600 font-mono">list.push({'{ name: \'민우\', score: 1200 }'});</code></span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-slate-900 block">내림차순 정렬 (높은 점수 1등)</strong>
                  <span className="text-slate-600 text-[11px]"><code className="text-indigo-600 font-mono">list.sort((a, b) =&gt; b.score - a.score);</code> (b에서 a를 빼면 큰 수가 위로!)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <div>
                  <strong className="text-slate-900 block">TOP 5만 남기고 포장 저장</strong>
                  <span className="text-slate-600 text-[11px]"><code className="text-indigo-600 font-mono">localStorage.setItem('rankings', JSON.stringify(list.slice(0, 5)));</code></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ❌ 위험한 프롬프트
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">휘발성</span>
                </div>
                <pre className="p-3 rounded-xl bg-white border border-rose-200 text-rose-900 font-mono text-xs leading-relaxed overflow-x-auto">
                  게임 끝나면 랭킹 보여줘.
                </pre>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  AI가 localStorage 없이 일반 변수로만 만들어 새로고침하면 랭킹이 전부 사라져요!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ⭕ 안전한 프롬프트 (영구 저장 100%)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? '복사됨! ✨' : '복사하기'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-mono text-xs leading-relaxed overflow-x-auto">
{`우리 별똥별 아케이드 게임에 localStorage를 사용한 최고 점수 저장 및 TOP 5 랭킹 기능을 만들어줘.

1. 게임 오버 시 플레이어 이름과 점수를 JSON.stringify로 'arcade_rankings' 키에 저장해줘.
2. 이전 기록을 불러와 점수 기준 내림차순(sort)으로 정렬하고 상위 5명(slice)만 남겨줘.
3. 게임 시작 화면에 금·은·동 메달이 표시된 명예의 전당 스코어보드를 렌더링해줘.`}
                </pre>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  로컬스토리지 키 이름과 JSON 직렬화, 정렬 규칙을 명시해 완벽한 오락실 시스템이 완성됩니다!
                </p>
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
                  ← 이전: Stage 3 JSON 택배술
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
                  JUNIOR DEVELOPER GLOSSARY · 12강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 데이터베이스 엔지니어들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 로컬 스토리지 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-amber-400" />
                      1. 로컬 스토리지
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: LocalStorage (Web Storage API)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">웹 저장소</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "컴퓨터를 끄거나 브라우저를 닫아도 지워지지 않는 내 컴퓨터 속 비밀 세이브 상자!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저가 사용자 컴퓨터에 영구적으로 데이터를 저장할 수 있도록 지원하는 HTML5 Web Storage 규격의 클라이언트 저장소입니다.
                </p>
              </div>
              {/* 용어 2: 키-값 저장소 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-sky-400" />
                      2. 키-값 저장소
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Key-Value Store</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">자료구조</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "사물함마다 이름표(키)를 붙여두고, 이름표를 불러서 안에 든 보물(값)을 꺼내는 정리법!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 고유한 식별자 키(Key)와 실제 데이터 값(Value)의 쌍으로 정보를 관리하고 초고속으로 검색하는 데이터베이스 패러다임입니다.
                </p>
              </div>
              {/* 용어 3: 제이슨 직렬화 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-400" />
                      3. 제이슨 직렬화
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: JSON 직렬화 (JSON Serialization / stringify)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">데이터 변환</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "여러 물건이 담긴 장난감 상자를 테이프로 꽁꽁 감아 한 줄의 택배 상자로 압축 포장하기!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 자바스크립트 객체나 배열 같은 메모리 내 복합 데이터 구조를 다른 시스템이나 파일에 저장·전송할 수 있도록 텍스트 문자열(JSON)로 변환하는 작업입니다.
                </p>
              </div>
              {/* 용어 4: 제이슨 역직렬화 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <PackageOpen className="w-4 h-4 text-purple-400" />
                      4. 제이슨 역직렬화
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: JSON 파싱 (JSON Deserialization / parse)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">데이터 변환</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "배달받은 택배 상자를 칼로 뜯어서 원래의 살아있는 장난감들로 다시 꺼내놓기!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> JSON 형식의 텍스트 문자열을 파싱(해석)하여 프로그램이 즉시 조작할 수 있는 자바스크립트 객체나 배열로 다시 복원하는 과정입니다.
                </p>
              </div>
              {/* 용어 5: 배열 정렬 알고리즘 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <ArrowUpDown className="w-4 h-4 text-rose-400" />
                      5. 배열 정렬 알고리즘
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Array Sorting (sort / 내림차순)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">알고리즘</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "키 큰 순서대로 줄을 서듯, 점수가 가장 높은 친구부터 1등으로 차례차례 줄 세우기!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 비교 함수(Comparator)를 기반으로 배열 속 요소들을 특정 기준(점수 내림차순, 알파벳순 등)에 맞추어 재배열하는 알고리즘 연산입니다.
                </p>
              </div>
              {/* 용어 6: 데이터 영속성 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-teal-400" />
                      6. 데이터 영속성
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Data Persistence (영구 저장)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">시스템/스토리지</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "게임 전원을 끄고 내일 다시 켜도 내 캐릭터 레벨과 보물이 그대로 남아있는 것!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 프로그램을 종료하거나 컴퓨터 프로세스가 중단되어도 저장 매체에 기록되어 데이터가 유실되지 않고 영구히 보존되는 특성입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* ------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* ------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">

          {/* 상단 3단 탭 네비게이션 */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('ranking')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'ranking'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>명예의 전당</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('storage')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'storage'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>세이브 상자</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>체크리스트</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🏆 명예의 전당 랭킹보드 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'ranking' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                      <Award className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">우리 반 명예의 전당 TOP 5</strong>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    실시간 동기화
                  </span>
                </div>

                {/* 랭킹 리스트 */}
                <div className="space-y-2">
                  {rankings.slice(0, 5).map((item, idx) => {
                    const m = medals[idx] || { icon: `${idx + 1}`, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          idx === 0 ? 'bg-amber-50/50 border-amber-200 shadow-xs' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg ${m.bg} flex items-center justify-center font-bold text-xs shrink-0`}>
                            {m.icon}
                          </span>
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">{item.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{item.date || '최근'}</span>
                          </div>
                        </div>
                        <span className={`font-mono text-xs font-bold ${idx === 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {item.score.toLocaleString()} 점
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 새 기록 등록 폼 */}
                <form onSubmit={handleSubmitRecord} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                      도전자 새 기록 등록하기
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">localStorage 실시간 반영</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="react-player-name" className="text-[10px] font-bold text-slate-500 block mb-1">
                        도전자 이름
                      </label>
                      <input
                        type="text"
                        id="react-player-name"
                        value={playerName}
                        onChange={e => setPlayerName(e.target.value)}
                        placeholder="예: 민우"
                        maxLength={6}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="react-player-score" className="text-[10px] font-bold text-slate-500 block mb-1">
                        달성 점수
                      </label>
                      <input
                        type="number"
                        id="react-player-score"
                        value={playerScore}
                        onChange={e => setPlayerScore(Number(e.target.value))}
                        placeholder="점수"
                        step={50}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className={`flex-1 py-2 px-3 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        registeredSuccess ? 'bg-emerald-600' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{registeredSuccess ? '등록 완료! 🎉' : '랭킹 등록 (세이브 상자 저장)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRankings}
                      className="px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                      title="기본 데모 랭킹으로 리셋"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* 💡 명예의 전당 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>명예의 전당 4대 핵심 공식 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">localStorage는 브라우저 영구 창고</strong>
                      <span className="text-slate-400">새로고침을 하거나 컴퓨터를 꺼도 내 점수가 그대로 유지돼요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">목록은 JSON.stringify로 택배 포장</strong>
                      <span className="text-slate-400">배열이나 객체는 반드시 문자열 택배로 포장해서 저장해야 깨지지 않아요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">꺼낼 때는 JSON.parse로 택배 풀기</strong>
                      <span className="text-slate-400">문자열 텍스트를 다시 살아있는 자바스크립트 배열로 복원해요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">내림차순 정렬(b - a)과 TOP 5 자르기</strong>
                      <span className="text-slate-400">
                        <code className="text-amber-300 font-mono">sort((a,b)=&gt;b.score-a.score)</code> 후{' '}
                        <code className="text-amber-300 font-mono">slice(0,5)</code>로 1등부터 5등만 기록!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 📦 세이브 상자 엑스레이 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'storage' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">localStorage 엑스레이 뷰어</strong>
                      <span className="text-[11px] text-slate-500 font-normal">브라우저 비밀 창고 안을 실시간으로 들여다보세요</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    Key: arcade_rankings
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">현재 저장된 원문 텍스트 (Raw String in Storage)</span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {JSON.stringify(rankings)}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-600" />
                      JSON 택배 포장 &amp; 뜯기 시뮬레이터
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">
                      {simState === 'idle' ? '대기 중' : simState === 'stringified' ? '택배 포장 완료! 📦' : '택배 뜯기 완료! ✂️'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border font-mono text-[11px] min-h-[60px] flex items-center justify-center text-center overflow-x-auto ${
                      simState === 'stringified'
                        ? 'bg-slate-900 border-indigo-300 text-amber-300'
                        : simState === 'parsed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {simState === 'idle' && '버튼을 눌러 객체를 포장하거나 택배를 뜯어보세요!'}
                    {simState === 'stringified' && JSON.stringify({ name: '민우', score: 1200, stage: 3 })}
                    {simState === 'parsed' && '객체 복원: name="민우", score=1200, stage=3'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateStringify}
                      className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>JSON.stringify (포장)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateParse}
                      className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <PackageOpen className="w-3.5 h-3.5" />
                      <span>JSON.parse (뜯기)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: ✅ 자가 점검 체크리스트 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">12강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 시즌 3가 졸업돼요</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600">
                    {checkedCount} / 6 ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { title: '1. 로컬 스토리지(localStorage) 원리 이해', desc: '브라우저를 닫아도 데이터가 유지되는 영구 창고의 개념을 이해했다.' },
                    { title: '2. setItem과 getItem 명령 실습', desc: '이름표(Key)와 보물(Value)을 사용해 데이터를 저장하고 꺼낼 수 있다.' },
                    { title: '3. JSON 직렬화 & 역직렬화 마법', desc: '복잡한 배열을 택배로 포장(stringify)하고 푸는(parse) 원리를 실습했다.' },
                    { title: '4. 명예의 전당 새 기록 등록 완료', desc: '직접 도전자 이름과 점수를 입력하여 랭킹 보드에 새 기록을 올렸다.' },
                    { title: '5. 내림차순 정렬 & TOP 5 자르기', desc: '높은 점수가 1등으로 올라가는 sort 공식과 상위 5개 추출 원리를 이해했다.' },
                    { title: '6. 시즌 3 완주 & 안전 프롬프트 마스터', desc: '시즌 3(미니프로젝트·버그사냥·회귀테스트·랭킹)을 마스터하고 13강 진출 준비를 마쳤다!' }
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems[idx]}
                        onChange={() => handleToggleCheck(idx)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                        <span className="text-[11px] text-slate-500 font-normal block">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-indigo-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      <span>축하합니다! 시즌 3 완주 &amp; 12강 100% 클리어!</span>
                    </div>
                    <p className="text-xs text-amber-50 leading-relaxed font-normal">
                      브라우저 비밀 창고(localStorage)와 우리 반 명예의 전당을 완벽하게 마스터했습니다! 이제 시즌 4에서 인터넷 세상의 오픈 API 공공데이터를 다루는 진짜 개발자로 진화해 봐요.
                    </p>
                    <a
                      href="../13-open-api/index.html"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-50 transition-all shadow-xs"
                    >
                      <span>시즌 4 · 13강 오픈 API의 세계 도전하기</span>
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
}
