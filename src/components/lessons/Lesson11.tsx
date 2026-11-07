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
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Play,
  FileDiff,
  BookOpen,
  Flame,
  TrendingUp,
  UserCheck,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 3 · 11강 React 컴포넌트 (Lesson11.tsx)
 * 도미노처럼 무너지지 마라! AI 코드 업데이트와 안전한 회귀 테스트
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'runner' | 'diff' | 'checklist';

interface TestCaseItem {
  id: number;
  title: string;
  desc: string;
  status: 'WAITING' | 'RUNNING' | 'PASS';
}

export default function Lesson11() {
  // 스테이지 및 우측 탭 상태
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('runner');

  // 회귀 테스트 슈트 상태
  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { id: 1, title: 'TC 1. 플레이어 좌우 벽 충돌 경계', desc: '0px 미만 또는 360px 초과 탈출 방지', status: 'WAITING' },
    { id: 2, title: 'TC 2. 운석 피격 시 하트 1개만 감소', desc: '다중 프레임 즉사 방지 (splice 호출 검증)', status: 'WAITING' },
    { id: 3, title: 'TC 3. 보너스 별(⭐) 획득 시 +50점', desc: '아이템 타입별 점수 분기 정상 판정', status: 'WAITING' },
    { id: 4, title: 'TC 4. 시간 경과에 따른 다이내믹 레벨업', desc: '10초 경과 시 속도 및 레벨 정상 상승', status: 'WAITING' }
  ]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [suiteStatus, setSuiteStatus] = useState<'대기 중' | '테스트 실행 중...' | '4/4 PASS 올 통과! 🎉'>('대기 중');

  // 난이도 밸런서 슬라이더
  const [baseSpeed, setBaseSpeed] = useState<number>(3.0);
  const [accel, setAccel] = useState<number>(0.8);
  const [spawnRate, setSpawnRate] = useState<number>(400);

  // Diff 검토기 상태
  const [diffScenario, setDiffScenario] = useState<'danger' | 'safe'>('danger');
  const [diffBadge, setDiffBadge] = useState<string>('검토 대기 중');
  const [diffFeedback, setDiffFeedback] = useState<{ isSuccess: boolean; msg: string } | null>(null);

  // 프롬프트 복사 상태
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 자가 점검 체크리스트 (6개)
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 로컬스토리지 복원
  useEffect(() => {
    const saved = localStorage.getItem('ai_lesson_11_completed');
    if (saved === 'true') {
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
      localStorage.setItem('ai_lesson_11_completed', 'true');
      fetch('/api/ai/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ lesson_id: 'lesson_11' })
      }).catch(() => {});
    } else {
      setIsCompleted(false);
    }
  };

  // 회귀 테스트 슈트 실행
  const runRegressionSuite = () => {
    if (isTestRunning) return;
    setIsTestRunning(true);
    setSuiteStatus('테스트 실행 중...');

    // 순차적 테스트 실행 애니메이션
    [1, 2, 3, 4].forEach((tcId, idx) => {
      setTimeout(() => {
        setTestCases(prev => prev.map(tc => tc.id === tcId ? { ...tc, status: 'RUNNING' } : tc));
      }, idx * 300);

      setTimeout(() => {
        setTestCases(prev => prev.map(tc => tc.id === tcId ? { ...tc, status: 'PASS' } : tc));

        if (idx === 3) {
          setSuiteStatus('4/4 PASS 올 통과! 🎉');
          setIsTestRunning(false);

          // 체크리스트 4번 자동 체크
          if (!checkedItems[3]) {
            const next = [...checkedItems];
            next[3] = true;
            setCheckedItems(next);
            if (next.filter(Boolean).length === 6) {
              setIsCompleted(true);
              localStorage.setItem('ai_lesson_11_completed', 'true');
            }
          }
        }
      }, (idx + 1) * 350);
    });
  };

  const resetTestSuite = () => {
    setSuiteStatus('대기 중');
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'WAITING' })));
  };

  // 슬라이더 변경 시 체크리스트 5번 자동 체크
  const handleSliderChange = () => {
    if (!checkedItems[4]) {
      const next = [...checkedItems];
      next[4] = true;
      setCheckedItems(next);
      if (next.filter(Boolean).length === 6) {
        setIsCompleted(true);
        localStorage.setItem('ai_lesson_11_completed', 'true');
      }
    }
  };

  // Diff 시나리오 액션 처리
  const handleDiffAction = (action: 'accept' | 'reject') => {
    if (diffScenario === 'danger') {
      if (action === 'reject') {
        setDiffBadge('반려 완료 (버그 차단) 🛡️');
        setDiffFeedback({
          isSuccess: true,
          msg: '원래 있던 playerX 화면 경계 코드가 삭제된 것을 정확하게 적발하여 반려했습니다. 이제 AI에게 "기존 코드 유지"를 명시해 다시 요청해야 해요.'
        });
        if (!checkedItems[2]) {
          const next = [...checkedItems];
          next[2] = true;
          setCheckedItems(next);
          if (next.filter(Boolean).length === 6) {
            setIsCompleted(true);
            localStorage.setItem('ai_lesson_11_completed', 'true');
          }
        }
      } else {
        setDiffBadge('위험 승인 경고 💥');
        setDiffFeedback({
          isSuccess: false,
          msg: '위험! 빨간색(-) 줄에 있던 원래의 벽 충돌 코드가 삭제되었습니다. 이대로 실행하면 우주선이 화면 밖으로 탈출해버려요. 반려 (Reject) 버튼을 눌러주세요!'
        });
      }
    } else {
      if (action === 'accept') {
        setDiffBadge('안전 승인 완료 (엔진 반영) ✅');
        setDiffFeedback({
          isSuccess: true,
          msg: '완벽한 코드 심사 완료! 기존의 핵심 로직이 온전히 보존된 채 난이도 계산식만 안전하게 추가되었습니다. 게임 엔진에 성공적으로 반영되었습니다.'
        });
        if (!checkedItems[2]) {
          const next = [...checkedItems];
          next[2] = true;
          setCheckedItems(next);
          if (next.filter(Boolean).length === 6) {
            setIsCompleted(true);
            localStorage.setItem('ai_lesson_11_completed', 'true');
          }
        }
      } else {
        setDiffBadge('불필요한 반려');
        setDiffFeedback({
          isSuccess: false,
          msg: '안내: 이 제안은 기존 코드를 100% 안전하게 보호하고 있어요. 승인(Accept)하셔도 안전합니다!'
        });
      }
    }
  };

  // 프롬프트 복사
  const handleCopyPrompt = () => {
    const prompt = `game.js의 게임 루프에서 10초마다 운석 속도가 0.8씩 증가하는 레벨업 로직을 추가해줘.

주의: 기존의 playerX 화면 경계 제한(Math.max/min)과 충돌 체력 차감 로직은 100% 그대로 유지하고, 변경 사항을 Diff(+/-) 형태로 먼저 보여줘.`;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);

      if (!checkedItems[5]) {
        const next = [...checkedItems];
        next[5] = true;
        setCheckedItems(next);
        if (next.filter(Boolean).length === 6) {
          setIsCompleted(true);
          localStorage.setItem('ai_lesson_11_completed', 'true');
        }
      }
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ===================================================================== */}
      {/* [상단 GNB] 과정 홈 | 시즌 3 · 11강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
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
              <a href="../10-bug-hunter/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">10강 버그 사냥꾼</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 whitespace-nowrap">11강 도미노 방지 회귀 테스트</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span id="header-progress-text" className="text-indigo-600 font-mono font-bold text-xs">{progressPercent}%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  id="header-progress-fill"
                  className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
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
                  <span>도미노 악몽</span>
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
                  <span>Diff 돋보기</span>
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
                  <span>스모크 슈트</span>
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
                  <span>안전 프롬프트</span>
                </button>
              </nav>
            </div>

            {isCompleted ? (
              <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 animate-pulse">
                <Unlock className="w-3.5 h-3.5 text-indigo-700" />
                <span>12강 언락됨!</span>
              </div>
            ) : (
              <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>12강 잠김</span>
              </div>
            )}
          </div>
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
          {/* [STAGE 1: 도미노 악몽] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-slate-50 border border-sky-100 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  시즌 3 · 코드 안정성과 완성도
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                  안전한 업데이트
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                도미노처럼 무너지지 마라!<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600">
                  AI 코드 업데이트와 안전한 회귀 테스트
                </span>
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                새 기능을 신나게 추가하다가 잘 되던 원래 기능까지 고장 나면 곤란해요! 기존 코드를 안전하게 지키는 Diff 검토와 도미노 방지 회귀 테스트를 배워봐요.
              </p>

              {/* 메타 4구리드 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">난이도</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">★★☆☆☆ 초급</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">40분 집중</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">핵심 도구</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">테스트 슈트 &amp; Diff</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">완료 조건</span>
                  <strong className="text-xs font-bold text-emerald-700 leading-snug whitespace-nowrap">4/4 PASS + Diff 승인</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STAGE 1: 미션 브리핑 */}

              <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-base sm:text-lg">
              <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">1단계: 도미노의 악몽 — 잘 되던 기능이 왜 갑자기 고장 났을까?</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              9강과 10강에서 멋지게 완성한 우리의 '별똥별 피하기 아케이드 게임'! 친구들이 너무 재미있어하며 한 가지 멋진 아이디어를 냈어요.{' '}
              <strong className="text-slate-900 font-bold">"시간이 지나도 속도가 똑같아서 조금 심심해! 10초마다 속도가 더 빨라지게 해줘!"</strong>
            </p>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>실제 벌어진 황당한 사건!</span>
              </div>
              <p className="text-sm text-rose-700 leading-relaxed font-normal">
                AI에게 "10초마다 빨라지는 레벨업 기능 넣어줘!"라고 부탁해서 받은 코드를 붙여넣었더니...<br />
                속도는 정말 빨라졌는데, 우주선이 왼쪽 벽을 뚫고 화면 밖 우주로 영원히 사라져버렸어요! 게다가 별똥별에 딱 한 번 스쳤을 뿐인데 하트 3개가 한꺼번에 증발해 즉사해버립니다!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  도미노 현상 (회귀 버그 / Regression Bug)이란?
                </span>
                <span className="text-[10px] font-mono text-slate-400">SIDE EFFECT EXPLAINED</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                블록 탑을 높게 쌓으려고 새 블록을 살짝 끼워 넣다가, 옆에 잘 서 있던 든든한 기둥을 툭 건드려 와르르 무너뜨리는 현상이에요!
                프로그래밍에서는 <strong className="text-amber-300 font-bold">"새 기능을 넣으려다 원래 잘 되던 기능이 과거의 고장 난 상태로 퇴보하는 것"</strong>을 <strong className="text-white font-bold">회귀(Regression) 버그</strong>라고 불러요.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                  <strong className="text-rose-300 block mb-1">🚨 AI가 흔히 저지르는 실수</strong>
                  <span className="text-slate-400">"새 기능"에만 너무 집중한 나머지, 이전 코드에 있던 벽 충돌 방지나 하트 차감 로직을 잊어버리고 덮어써서 지워버립니다.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                  <strong className="text-emerald-300 block mb-1">🛡️ 우리의 똑똑한 해결책</strong>
                  <span className="text-slate-400">코드를 바꾸기 전과 후에 4대 스모크 테스트를 돌리고, 바뀐 줄(Diff)을 한 줄씩 돋보기로 검사합니다!</span>
                </div>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 Diff 돋보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: Diff 돋보기] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">2단계: Diff 돋보기 — 코드 출입국 심사대의 3색 신호등</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              AI가 고친 코드를 그냥 "전체 선택 ➔ 복사 ➔ 붙여넣기" 하면 절대 안 돼요!
              진짜 프로 개발자들은 <strong className="text-slate-900 font-bold">Git Diff(디프)</strong>라는 특수 돋보기를 통해 코드가 어떻게 바뀌었는지 줄 단위로 검사합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-md bg-emerald-200 text-emerald-900 flex items-center justify-center font-mono font-bold">+</span>
                  <span>초록색 줄 (추가)</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  새로 태어난 손님 코드예요! 내가 부탁한 레벨업 공식이 맞게 들어왔는지 확인해요.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-md bg-rose-200 text-rose-900 flex items-center justify-center font-mono font-bold">-</span>
                  <span>빨간색 줄 (삭제)</span>
                </div>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  <strong>가장 위험한 곳!</strong> 기존의 소중한 벽 충돌 코드가 억울하게 지워진 것은 아닌지 두 눈을 크게 뜨고 확인해야 해요.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-800 flex items-center justify-center font-mono font-bold"> </span>
                  <span>회색 줄 (문맥)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  지워지지도 더해지지도 않고 그 자리를 든든히 지키고 있는 원래 코드예요.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <strong className="text-sky-900 font-bold block">코드 출입국 심사관의 절대 원칙</strong>
                <span className="text-sky-800 leading-relaxed">
                  심사관인 내가 Diff 돋보기로 빨간 줄과 초록 줄을 대조해보고 "안전하다"고 판단하여 <strong className="underline decoration-sky-400">승인(Accept)</strong> 도장을 찍기 전까지는, 어떤 코드도 게임 본체에 들어올 수 없습니다!
                </span>
              </div>
            </div>
          </article>

              {/* 우측 Diff 검토기 연동 알림 카드 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-cyan-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                    ACTION REQUIRED · 1단계 실습 미션
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      지금 우측 콘솔의 [Diff 검토기]에서 코드 변경안을 심사하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    코드 출입국 심사관이 되어 AI가 제안한 업데이트 코드를 직접 검토할 차례입니다! 우측 콘솔의 <strong>[Diff 검토기]</strong>에서 빨간 줄(삭제)과 초록 줄(추가)을 대조하며 위험한 제안과 안전한 제안을 판별해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('diff')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [Diff 검토기] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 도미노 악몽
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 스모크 슈트</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 스모크 슈트] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">3단계: 도미노 방지 슈트 — 3초 스모크(Smoke) 테스트 4총사</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              <strong className="text-slate-900 font-bold">"스모크 테스트"</strong>란 전자기기를 조립한 후 스위치를 올렸을 때 <strong className="text-amber-700 font-bold">"불이나 연기(Smoke)가 나는가 안 나는가?"</strong>를 3초 만에 훑어보는 가장 빠르고 확실한 기본 검사예요!
            </p>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200">
                    <th className="p-3 whitespace-nowrap">테스트 케이스</th>
                    <th className="p-3 whitespace-nowrap">검증 조건 (기대 결과)</th>
                    <th className="p-3 whitespace-nowrap text-right">방어 목표</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] flex items-center justify-center font-bold">1</span>
                        플레이어 벽 충돌 경계
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">좌우 벽(0px 미만 또는 360px 초과) 탈출 시도 시 경계에 멈춤</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">화면 탈출 방지</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] flex items-center justify-center font-bold">2</span>
                        피격 시 하트 1개 감소
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">운석에 닿았을 때 즉사하지 않고 정확히 하트 1개만 감소</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">즉사 버그 방지</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] flex items-center justify-center font-bold">3</span>
                        보너스 별 획득 (+50점)
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">황금 별(⭐) 아이템을 먹었을 때 점수가 정확히 +50점 가산</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">점수 판정 보호</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold">4</span>
                        10초 경과 다이내믹 레벨업
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">시간 경과에 따라 낙하 속도가 올라가며 레벨 1에서 2로 상승</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">난이도 확장</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

              {/* 우측 회귀 러너 연동 알림 카드 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-400/40 uppercase">
                    ACTION REQUIRED · 2단계 실습 미션
                  </span>
                  <span className="text-xs text-indigo-300 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      심사를 통과했다면 우측 [회귀 러너]에서 4대 테스트를 가동하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    새로운 기능을 추가했을 때 기존 기능이 와르르 무너지지 않는지 확인할 시간입니다! 우측 콘솔의 <strong>[회귀 러너]</strong>에서 3초 스모크 회귀 테스트를 실행하여 4개 테스트 케이스(벽 충돌, 무적 시간 등)의 100% All-Pass를 달성하세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('runner')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [회귀 러너] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 Diff 돋보기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 안전 프롬프트</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 안전 프롬프트] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">4단계: 안전한 프롬프트 — AI에게 기존 코드 지키게 명령하기</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              AI에게 코드를 수정해달라고 요청할 때, 원래 코드를 지우지 못하도록 안전망을 치는 3대 프롬프트 작성 비법입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ❌ 위험한 프롬프트 (도미노 버그 90%)
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">위험</span>
                </div>
                <pre className="p-3 rounded-xl bg-white border border-rose-200 text-rose-900 font-mono text-xs leading-relaxed overflow-x-auto">
                  10초마다 속도가 빨라지는 레벨업 기능 넣어줘.
                </pre>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  AI가 전체 파일을 다시 쓰면서 원래 있던 벽 충돌이나 하트 차감 코드를 싹 날려버립니다!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ⭕ 안전한 프롬프트 (도미노 방지 100%)
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
{`game.js의 게임 루프에서 10초마다 운석 속도가 0.8씩 증가하는 레벨업 로직을 추가해줘.

주의: 기존의 playerX 화면 경계 제한(Math.max/min)과 충돌 체력 차감 로직은 100% 그대로 유지하고, 변경 사항을 Diff(+/-) 형태로 먼저 보여줘.`}
                </pre>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  수정할 범위를 한정하고 <strong className="font-bold">"기존 코드 보존"</strong>을 명시했기 때문에 기존 기능이 안전하게 지켜집니다!
                </p>
              </div>
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 12강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 12강을 여세요!</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    오늘 수행한 6대 회귀 방어 수칙(코드 디프 검토, 3초 스모크 테스트, 안전 프롬프트)을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 시즌 2 최종장인 12강(영구 저장 랭킹 보드)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 12강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 스모크 슈트
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
                  JUNIOR DEVELOPER GLOSSARY · 11강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 QA 엔지니어들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 회귀 테스트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      1. 회귀 테스트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Regression Testing</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">QA/테스트</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "새 블록을 쌓을 때 예전에 쌓아둔 탑이 도미노처럼 무너지지 않았는지 확인하는 안전 점검!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 소프트웨어를 수정한 후 기존의 정상 기능들이 의도치 않게 고장 나거나 깨지지 않았는지(Regression) 확인하는 재검증 테스트입니다.
                </p>
              </div>
              {/* 용어 2: 코드 디프 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-sky-300 flex items-center gap-1.5">
                      <FileDiff className="w-4 h-4 text-sky-400" />
                      2. 코드 디프
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 디프 (Git Diff / Differences)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">버전 관리/협업</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "틀린그림찾기처럼, 옛날 코드와 새 코드 사이에 무엇이 바뀌었는지 빨간 줄·초록 줄로 딱 짚어주는 돋보기!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 두 버전의 소스 코드 파일 간 변경 사항(추가된 줄, 삭제된 줄, 수정된 줄)을 라인 단위로 계산하여 시각적으로 대조하는 차이 분석 도구입니다.
                </p>
              </div>
              {/* 용어 3: 스모크 테스트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-emerald-400" />
                      3. 스모크 테스트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 스모크 테스트 (Smoke Testing)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">빌드/검증</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "전자기기 스위치를 켰을 때 불이나 연기(Smoke)가 나지 않고 불이 잘 들어오는지 5초 만에 확인하는 1초 점검!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 본격적인 세부 테스트 전, 시스템의 핵심적이고 치명적인 기능들이 최소한 정상 작동하는지 빠르게 확인하는 초기 통과 검증 테스트입니다.
                </p>
              </div>
              {/* 용어 4: 테스트 케이스 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                      4. 테스트 케이스
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 테스트 케이스 (Test Case / TC)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">품질 보증</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "'벽으로 달리면 멈추는가?', '코인을 먹으면 점수가 오르는가?'처럼 하나씩 적어둔 시험 문제지!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 특정 기능이 요구사항대로 정확히 작동하는지 확인하기 위해 입력값, 사전 실행 조건, 예상 결과(Expected Result)를 명시한 시험 단위 명세서입니다.
                </p>
              </div>
              {/* 용어 5: 난이도 곡선 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                      5. 난이도 곡선
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 난이도 곡선 (Difficulty Curve / Dynamic Balancing)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">게임 기획/수학</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "롤러코스터처럼 처음엔 천천히 달리다가 점점 빨라지며 손에 땀을 쥐게 만드는 재미 마법선!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 플레이어의 플레이 시간, 숙련도, 스테이지에 따라 속도나 장애물 빈도 등 게임 시스템의 난이도를 점진적으로 조절하는 밸런싱 설계 곡선입니다.
                </p>
              </div>
              {/* 용어 6: 코드 리뷰 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-teal-400" />
                      6. 코드 리뷰
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 코드 리뷰 (Code Review & Approval)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">소프트웨어 공학</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "AI 조수가 가져온 숙제에 오탈자나 원래 지키기로 한 약속이 빠졌는지 꼼꼼히 확인하고 도장을 찍어주는 일!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> AI나 동료가 작성한 소스 코드를 메인 저장소에 병합하기 전, 결함 방지와 코드 품질 향상을 위해 검토하고 피드백을 주는 협업 품질 관리 과정입니다.
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
              onClick={() => setActiveRightTab('runner')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'runner'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>회귀 러너</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('diff')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'diff'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Diff 검토기</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>체크리스트</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🧪 회귀 테스트 러너 & 난이도 밸런서 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'runner' && (
            <div className="space-y-4">
              {/* 회귀 테스트 슈트 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <strong className="text-base font-bold text-slate-900">핵심 스모크 회귀 테스트 슈트</strong>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      suiteStatus.includes('PASS')
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : suiteStatus.includes('실행')
                        ? 'bg-sky-100 text-sky-800 border-sky-300 animate-pulse'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {suiteStatus}
                  </span>
                </div>

                {/* 4개 TC 목록 */}
                <div className="space-y-2">
                  {testCases.map(tc => (
                    <div
                      key={tc.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        tc.status === 'PASS'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : tc.status === 'RUNNING'
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{tc.title}</span>
                        <span className="text-[11px] text-slate-500 font-normal block">{tc.desc}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          tc.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : tc.status === 'RUNNING'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tc.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 테스트 실행 버튼 */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={runRegressionSuite}
                    disabled={isTestRunning}
                    className={`flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isTestRunning ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>회귀 테스트 자동 실행 (Run All)</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetTestSuite}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                    title="테스트 상태 초기화"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 난이도 밸런서 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <strong className="text-base font-bold text-slate-900">다이내믹 난이도 밸런서</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    STAGE 1
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span>기본 낙하 속도 (Base Speed)</span>
                      <span className="font-mono text-sky-600 font-bold">{baseSpeed.toFixed(1)} px/f</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="0.5"
                      value={baseSpeed}
                      onChange={e => {
                        setBaseSpeed(parseFloat(e.target.value));
                        handleSliderChange();
                      }}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span>10초당 가속도 (Accel / 10s)</span>
                      <span className="font-mono text-sky-600 font-bold">+{accel.toFixed(1)} px/f</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={accel}
                      onChange={e => {
                        setAccel(parseFloat(e.target.value));
                        handleSliderChange();
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span>운석 생성 주기 (Spawn Interval)</span>
                      <span className="font-mono text-sky-600 font-bold">{spawnRate} ms</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="800"
                      step="50"
                      value={spawnRate}
                      onChange={e => {
                        setSpawnRate(parseInt(e.target.value, 10));
                        handleSliderChange();
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 밸런스 시뮬레이션 미리보기 */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-sky-300 font-bold pb-1 border-b border-slate-800">
                    <span>📊 실시간 밸런스 시뮬레이션</span>
                    <span className="text-[10px] text-slate-400">MATH PREVIEW</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5 pt-1">
                    <div>• 0초 시작: 속도 <strong className="text-sky-400 font-bold">{baseSpeed.toFixed(1)} px/f</strong> (초보 친화적)</div>
                    <div>• 30초 생존: 속도 <strong className="text-amber-400 font-bold">{(baseSpeed + accel * 3).toFixed(1)} px/f</strong> (중급자 긴장감)</div>
                    <div>• 60초 생존: 속도 <strong className="text-rose-400 font-bold">{(baseSpeed + accel * 6).toFixed(1)} px/f</strong> (최고수 영역 도전)</div>
                  </div>
                </div>
              </div>

              {/* 💡 도미노 방지 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>도미노 방지 4대 골든 룰 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">코드 수정 전 스모크 테스트 먼저 실행</strong>
                      <span className="text-slate-400">원래 코드가 정상적으로 잘 도는지 기준점(Baseline)을 먼저 기록하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">Diff에서 빨간 줄(-)을 가장 먼저 감시</strong>
                      <span className="text-slate-400">기존의 벽 충돌이나 하트 차감 같은 중요한 안전장치가 지워졌는지 체크!</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">AI 프롬프트에 "기존 코드 보존" 필수 명시</strong>
                      <span className="text-slate-400">"기존 로직은 100% 유지하고 수정 부위만 Diff로 보여줘"라고 지시하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">패치 후 전체 회귀 테스트를 다시 실행</strong>
                      <span className="text-slate-400">새 코드를 넣은 후 4개 테스트 케이스가 모두 초록 불(PASS)인지 확인해야 완료!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 🔍 AI 코드 Diff 검토기 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'diff' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <FileDiff className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-base font-bold text-slate-900 block">AI 코드 변경 대조 (Diff Inspector)</strong>
                      <span className="text-[11px] text-slate-500 font-normal">코드 출입국 심사대에서 변경안을 검토하세요</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      diffBadge.includes('반려 완료') || diffBadge.includes('안전 승인')
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : diffBadge.includes('위험')
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {diffBadge}
                  </span>
                </div>

                {/* 시나리오 선택 탭 */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setDiffScenario('danger');
                      setDiffFeedback(null);
                      setDiffBadge('검토 대기 중');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      diffScenario === 'danger'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    시나리오 A (위험한 제안)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiffScenario('safe');
                      setDiffFeedback(null);
                      setDiffBadge('검토 대기 중');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      diffScenario === 'safe'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    시나리오 B (안전한 제안)
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-normal">
                  <strong>제안 내용:</strong>{' '}
                  {diffScenario === 'danger'
                    ? '"10초마다 속도가 빨라지는 레벨업 로직 추가" (위험한 변경 감지 중)'
                    : '"기존 playerX 경계 코드는 100% 유지하고 난이도 공식만 안전하게 추가"'}
                </div>

                {/* Diff 뷰어 */}
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 space-y-0.5">
                  <div className="text-slate-500 pb-1 border-b border-slate-800">// game.js (Line 24-32)</div>
                  <div className="text-slate-400">&nbsp;let score = 0;</div>
                  <div className="text-slate-400">&nbsp;let hp = 3;</div>
                  {diffScenario === 'danger' ? (
                    <>
                      <div className="p-0.5 rounded bg-rose-950/60 text-rose-300 font-bold">
                        -let playerX = Math.max(0, Math.min(360, playerX)); // 💥 원래 있던 벽 보호 삭제!
                      </div>
                      <div className="p-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold">+let gameLevel = 1;</div>
                      <div className="p-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold">+let meteorSpeed = 3 + (gameLevel - 1) * 1.5;</div>
                    </>
                  ) : (
                    <>
                      <div className="text-slate-400">&nbsp;let playerX = Math.max(0, Math.min(360, playerX)); // ✅ 기존 벽 보호 안전 유지</div>
                      <div className="p-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold">+let gameLevel = 1;</div>
                      <div className="p-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold">+let meteorSpeed = 3 + (gameLevel - 1) * 0.8; // ✅ 다이내믹 난이도 안전 추가</div>
                    </>
                  )}
                  <div className="text-slate-400">&nbsp;function updateGameLoop() {'{'}</div>
                  <div className="text-slate-400">&nbsp;&nbsp;&nbsp;drawPlayer();</div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDiffAction('reject')}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    반려 (Reject)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiffAction('accept')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    승인 및 엔진 반영 (Accept)
                  </button>
                </div>

                {diffFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-normal leading-relaxed ${
                      diffFeedback.isSuccess
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border border-rose-200 text-rose-900'
                    }`}
                  >
                    <strong>{diffFeedback.isSuccess ? '🎉 검토 성공!' : '🚨 경고!'}</strong> {diffFeedback.msg}
                  </div>
                )}
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
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-base font-bold text-slate-900 block">11강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 12강이 열려요</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-600">
                    {checkedCount} / 6 ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { title: '1. 도미노 현상(회귀 버그) 원리 이해', desc: '새 기능을 넣을 때 기존 기능이 왜 망가질 수 있는지 이해했다.' },
                    { title: '2. Git Diff 3색 신호등 대조', desc: '초록색(+) 추가와 빨간색(-) 삭제의 의미를 알고 한 줄씩 읽을 수 있다.' },
                    { title: '3. 코드 출입국 심사 (승인/반려)', desc: 'AI 제안 코드에서 원래 있던 중요 코드가 빠지지 않았는지 검토했다.' },
                    { title: '4. 4대 스모크 테스트 4/4 PASS', desc: '벽 충돌, 하트 감소, 보너스 별, 레벨업 4개 검사를 모두 통과시켰다.' },
                    { title: '5. 다이내믹 난이도 밸런서 실험', desc: '슬라이더를 조절하여 시간에 따라 점진적으로 빨라지는 공식을 설계했다.' },
                    { title: '6. 안전한 프롬프트 주문서 작성', desc: 'AI에게 "기존 코드 100% 보존"을 명시하는 안전 프롬프트를 복사·실습했다.' }
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems[idx]}
                        onChange={() => handleToggleCheck(idx)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                        <span className="text-[11px] text-slate-500 font-normal block">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <span>축하합니다! 11강 미션 100% 완주!</span>
                    </div>
                    <p className="text-sm text-emerald-50 leading-relaxed font-normal">
                      도미노 방지 회귀 테스트와 Diff 돋보기 검토를 완벽히 통과했습니다! 이제 기능이 와르르 망가질 걱정 없이 안전하게 코드를 업그레이드할 수 있어요.
                    </p>
                    <a
                      href="../12-ranking-storage/index.html"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-all shadow-xs"
                    >
                      <span>12강 우리 반 명예의 전당 도전하기</span>
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
