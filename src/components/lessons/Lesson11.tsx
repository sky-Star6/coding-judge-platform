import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Award,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileDiff,
  Play,
  RotateCcw,
  Copy,
  Check,
  Search,
  Flame,
  Bot,
  Lightbulb,
  Layers,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TestCase {
  id: number;
  title: string;
  desc: string;
  status: 'waiting' | 'running' | 'pass' | 'fail';
}

export const Lesson11: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. 스테이지 상태 관리
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all'>('stage1');

  // ---------------------------------------------------------------------------
  // 2. 프롬프트 복사 피드백 상태
  // ---------------------------------------------------------------------------
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyPrompt = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  // ---------------------------------------------------------------------------
  // 3. 자가 점검 체크리스트 상태
  // ---------------------------------------------------------------------------
  const [checklist, setChecklist] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_11_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  });

  const handleToggleCheck = (num: number) => {
    setChecklist(prev => {
      const next = { ...prev, [num]: !prev[num] };
      try {
        localStorage.setItem('ai_lesson_11_checklist', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / 6) * 100);
  const isAllComplete = checkedCount === 6;

  useEffect(() => {
    try {
      if (isAllComplete) {
        localStorage.setItem('ai_lesson_11_completed', 'true');
      } else {
        localStorage.removeItem('ai_lesson_11_completed');
      }
    } catch (e) {}
  }, [isAllComplete]);

  // ---------------------------------------------------------------------------
  // 4. Stage 2 가상 Diff 심사대 & 회귀 러너 시뮬레이터 상태
  // ---------------------------------------------------------------------------
  const [diffScenario, setDiffScenario] = useState<'danger' | 'safe'>('danger');
  const [diffFeedback, setDiffFeedback] = useState<{ isSuccess: boolean; title: string; msg: string } | null>(null);

  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, title: 'TC 1. 플레이어 좌우 벽 충돌 경계선 검증', desc: '0px 미만 또는 360px 초과 시 모니터 밖으로 우주선이 탈출하지 않는지 단언', status: 'waiting' },
    { id: 2, title: 'TC 2. 운석 피격 시 하트 1개만 정상 감소', desc: '연속 프레임 중복 충돌로 하트가 한 번에 3개 다 깎이는 즉사 버그 방지', status: 'waiting' },
    { id: 3, title: 'TC 3. 보너스 별(⭐) 획득 시 +50점 분기 처리', desc: '일반 운석 충돌과 아이템 획득이 정확히 분기되어 점수가 가산되는지 판정', status: 'waiting' },
    { id: 4, title: 'TC 4. 시간 경과에 따른 다이내믹 레벨업 수식', desc: '10초 경과 시 속도가 3.0에서 3.8로 정확하게 선형 가속되는지 검증', status: 'waiting' }
  ]);
  const [isSuiteRunning, setIsSuiteRunning] = useState<boolean>(false);
  const [suiteStatus, setSuiteStatus] = useState<string>('테스트 대기 중 ⏸️');

  const handleSelectDiffScenario = (mode: 'danger' | 'safe') => {
    setDiffScenario(mode);
    setDiffFeedback(null);
  };

  const handleDiffAction = (action: 'accept' | 'reject') => {
    if (diffScenario === 'danger') {
      if (action === 'reject') {
        setDiffFeedback({
          isSuccess: true,
          title: '정확한 심사 판정! 위험 코드 반려 성공 (Reject Approved)',
          msg: '잘하셨습니다! 삭제된 빨간 줄(- playerX 경계 보호)을 감시하여 우주선이 화면 밖으로 탈출하는 치명적인 회귀 버그를 사전에 막았습니다. 🎯'
        });
        handleToggleCheck(2);
      } else {
        setDiffFeedback({
          isSuccess: false,
          title: '경고! 회귀 버그가 포함된 코드가 병합되었습니다!',
          msg: '위험합니다! 삭제된 빨간 줄 때문에 우주선이 모니터 화면 밖으로 튕겨 나가 사라져 버립니다. 빨간 줄(-)을 반려하세요.'
        });
      }
    } else {
      if (action === 'accept') {
        setDiffFeedback({
          isSuccess: true,
          title: '안전 변경안 병합 완료! (Merge Safe)',
          msg: '기존의 벽 보호 로직이 그대로 보존되었으며, 새로운 레벨업 변수만 정상적으로 추가되었습니다. 이제 하단 회귀 테스트를 실행해 보세요! 🚀'
        });
      } else {
        setDiffFeedback({
          isSuccess: false,
          title: '안전한 제안이 반려되었습니다.',
          msg: '이 제안은 기존 코드를 전혀 건드리지 않고 새 기능만 추가한 안전한 코드입니다. [승인]을 눌러 병합해도 무방합니다.'
        });
      }
    }
  };

  const runRegressionSuite = () => {
    if (isSuiteRunning) return;
    setIsSuiteRunning(true);
    setSuiteStatus('테스트 실행 중... ⏳');

    // 순차적 테스트 실행 애니메이션
    [1, 2, 3, 4].forEach((tcId, idx) => {
      setTimeout(() => {
        setTestCases(prev => prev.map(tc => tc.id === tcId ? { ...tc, status: 'running' } : tc));
        setTimeout(() => {
          setTestCases(prev => prev.map(tc => tc.id === tcId ? { ...tc, status: 'pass' } : tc));
          if (idx === 3) {
            setIsSuiteRunning(false);
            setSuiteStatus('모든 테스트 통과 (4/4 PASS) 🎉');
            handleToggleCheck(4);
          }
        }, 350);
      }, idx * 300);
    });
  };

  const resetTestSuite = () => {
    setTestCases([
      { id: 1, title: 'TC 1. 플레이어 좌우 벽 충돌 경계선 검증', desc: '0px 미만 또는 360px 초과 시 모니터 밖으로 우주선이 탈출하지 않는지 단언', status: 'waiting' },
      { id: 2, title: 'TC 2. 운석 피격 시 하트 1개만 정상 감소', desc: '연속 프레임 중복 충돌로 하트가 한 번에 3개 다 깎이는 즉사 버그 방지', status: 'waiting' },
      { id: 3, title: 'TC 3. 보너스 별(⭐) 획득 시 +50점 분기 처리', desc: '일반 운석 충돌과 아이템 획득이 정확히 분기되어 점수가 가산되는지 판정', status: 'waiting' },
      { id: 4, title: 'TC 4. 시간 경과에 따른 다이내믹 레벨업 수식', desc: '10초 경과 시 속도가 3.0에서 3.8로 정확하게 선형 가속되는지 검증', status: 'waiting' }
    ]);
    setIsSuiteRunning(false);
    setSuiteStatus('테스트 대기 중 ⏸️');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* ======================================================================= */}
      {/* [상단 고정 풀 너비 GNB 헤더] 1강 최신 표준                               */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* 1. [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-indigo-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">11강: 도미노처럼 무너지지 마라! 안전한 회귀 테스트</span>
              </div>
            </div>
          </div>

          {/* 2. [우측]: 4단계 스테이지 스위처 버튼 그룹 (1강 최신 표준 20px 원형 배지) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage1' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>미션 & 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage2' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>회귀 실습</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage3' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage4' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                4
              </span>
              <span>자가 점검</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ml-1 ${
                activeStage === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 보기
            </button>
          </nav>
        </div>
      </header>

      {/* 모바일 서브 스위처 바 */}
      <nav className="md:hidden flex items-center justify-around gap-1 px-3 py-2 bg-white border-b border-slate-200 sticky top-16 z-30 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage1' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage2' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. 회귀 실습
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage3' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. 실전 AI
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage4' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. 자가 점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'all' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'
          }`}
        >
          전체
        </button>
      </nav>

      {/* ======================================================================= */}
      {/* [단일 컨테이너 몰입형 워크스페이스] max-w-4xl mx-auto                      */}
      {/* ======================================================================= */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* ===================================================================== */}
        {/* STAGE 01: 퀘스트 미션 브리핑 & 핵심 개념 원리                           */}
        {/* ===================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8">
            <article className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-indigo-500/20">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    시즌 3 2차전 · 회귀 테스트 & Diff 코드 리뷰
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Regression Testing + Git Diff Inspector + Smoke Suite
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug text-white">
                  새 기능을 넣었더니 원래 되던 기능이 망가졌다고요?! 💥
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                  AI에게 새로운 기능을 만들어 달라고 요청했더니, 기존에 잘 동작하던 벽 충돌이나 생명 감소 코드를 싹 날려버리는 '도미노 회귀 사고'가 자주 발생합니다. 기존 코드를 철통 방어하는 깃 디프(Git Diff) 출입국 심사와 4대 스모크 회귀 테스트 기법을 마스터해 보세요!
                </p>
              </div>

              {/* 3대 퀘스트 도전 목표 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <FileDiff className="w-4 h-4" />
                    <span className="font-bold text-sm">Diff 빨간 줄(-) 감시</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    새 코드(+)보다 삭제된 줄(-)을 먼저 검토하여 기존 안전장치 훼손 여부를 밝혀내는 코드 심사대 운영하기
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-300">
                    <Play className="w-4 h-4" />
                    <span className="font-bold text-sm">4대 스모크 테스트</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    업데이트 후 1분 만에 게임의 핵심 생명줄(벽 경계, 충돌, 하트, 점수)이 살아있는지 자동 검증하기
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Shield className="w-4 h-4" />
                    <span className="font-bold text-sm">기존 코드 100% 보존</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    AI 프롬프트에 '절대 보존 원칙'과 'Diff 출력 지시'를 결합해 도미노 붕괴를 원천 차단하기
                  </p>
                </div>
              </div>
            </article>

            {/* 핵심 개념 원리 탐구 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Layers className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    🧱 도미노 현상을 막아주는 프로 개발자의 3대 안전 원리
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  프로그래밍에서는 하나의 수정이 연쇄적으로 다른 기능을 무너뜨리는 현상을 '회귀(Regression)'라고 부릅니다.
                </p>
              </div>

              {/* 3대 안전 원리 3구리드 Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-600">
                    <span className="text-lg">🁡</span>
                    <h4 className="text-base font-bold text-slate-900">회귀 버그</h4>
                  </div>
                  <span className="text-sm font-mono text-slate-500 block">Regression Bug / 도미노 붕괴</span>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      🧸 <strong>어린이 비유:</strong> 블록 장난감 집 지붕을 멋지게 고치려다, 1층 기둥을 건드려서 집 전체가 와르르 무너진 상황!
                    </p>
                    <p className="text-slate-600">
                      🎓 <strong>개발자 원리:</strong> 새로운 기능을 추가하거나 버그를 고치는 과정에서, 기존에 완벽하게 잘 돌아가던 다른 코드에 결함이 새로 생기는 현상입니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-sky-600">
                    <span className="text-lg">🔍</span>
                    <h4 className="text-base font-bold text-slate-900">Git Diff 돋보기</h4>
                  </div>
                  <span className="text-sm font-mono text-slate-500 block">Diff Inspector / 틀린 그림 찾기</span>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      🧸 <strong>어린이 비유:</strong> 옛날 코드와 새 코드를 겹쳐서 빨간 줄(-)로 지워진 것과 초록 줄(+)로 추가된 것을 찾아내는 마법 돋보기!
                    </p>
                    <p className="text-slate-600">
                      🎓 <strong>개발자 원리:</strong> 파일 간 변경 사항을 라인 단위로 대조하여 표시하는 도구로, 프로 개발자는 삭제 줄(-)에 중요한 예외 처리가 빠졌는지 먼저 감시합니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="text-lg">💨</span>
                    <h4 className="text-base font-bold text-slate-900">스모크 테스트</h4>
                  </div>
                  <span className="text-sm font-mono text-slate-500 block">Smoke Testing / 연기 점검</span>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      🧸 <strong>어린이 비유:</strong> 새로 만든 전자 로봇의 전원을 켰을 때 "연기(Smoke)가 뿜어져 나오지 않는가?"를 가장 먼저 보는 기본 테스트!
                    </p>
                    <p className="text-slate-600">
                      🎓 <strong>개발자 원리:</strong> 세부 기능 테스트에 들어가기 전, 프로그램의 핵심 주요 기능들이 정상 구동되는지 최단 시간(1분 이내)에 점검하는 필수 검증 슈트입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 주니어 개발자 제1원칙 알림 카드 */}
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-indigo-900">
                    주니어 QA 엔지니어의 황금 법칙: "초록 줄(+)보다 빨간 줄(-)을 먼저 보라!"
                  </h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    AI가 작성해 준 화려한 새 기능(초록색 추가 줄)에 현혹되지 마세요! 버그는 언제나 <span className="font-bold underline decoration-indigo-400">원래 있던 방어 코드(빨간색 삭제 줄)</span>가 소리 없이 지워졌을 때 발생합니다. 코드 출입국 심사대에서 빨간 줄을 철저히 심사하세요!
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 2 가상 회귀 테스트 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 회귀 테스트 & Diff 심사 랩                     */}
        {/* ===================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            
            {/* 1. AI 코드 Diff 출입국 심사대 카드 */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-600/30 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <FileDiff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>AI 코드 변경 대조기 (Diff Inspector)</span>
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-normal border border-sky-500/30">코드 출입국 심사대</span>
                    </h3>
                    <p className="text-sm text-slate-400">AI가 제안한 변경안에서 삭제된 줄을 검토하고 승인 또는 반려를 결정하세요!</p>
                  </div>
                </div>
                <span className={`px-3.5 py-1.5 rounded-full text-sm font-bold border ${
                  diffFeedback?.isSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : diffFeedback
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {diffFeedback?.isSuccess ? '심사 완료 🟢' : diffFeedback ? '병합 경고 🔴' : '검토 대기 중 🔍'}
                </span>
              </div>

              {/* 시나리오 선택 탭 2개 */}
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-300 block">검토할 AI 제안 시나리오를 선택하세요:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectDiffScenario('danger')}
                    className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                      diffScenario === 'danger'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-800/90 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>시나리오 A (도미노 파괴 제안)</span>
                    </div>
                    <span className={`text-sm ${diffScenario === 'danger' ? 'text-rose-200' : 'text-slate-400'}`}>
                      벽 보호 삭제 위험
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDiffScenario('safe')}
                    className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                      diffScenario === 'safe'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/90 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span>시나리오 B (안전한 확장 제안)</span>
                    </div>
                    <span className={`text-sm ${diffScenario === 'safe' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      기존 코드 100% 보존
                    </span>
                  </button>
                </div>
              </div>

              {/* 시나리오 설명 안내 */}
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-slate-300 leading-relaxed">
                {diffScenario === 'danger' ? (
                  <>
                    <strong className="text-white">제안 내용:</strong> "10초마다 속도가 빨라지는 레벨업 로직 추가" — <span className="text-rose-400 font-bold">빨간색 삭제 줄(-)을 주의 깊게 관찰하세요!</span>
                  </>
                ) : (
                  <>
                    <strong className="text-white">제안 내용:</strong> "기존 코드는 온전히 보존하고 레벨 변수만 추가" — <span className="text-emerald-400 font-bold">삭제 줄 없이 초록 줄만 안전하게 추가되었습니다!</span>
                  </>
                )}
              </div>

              {/* Git Diff 코드 뷰어 */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-sm shadow-inner">
                <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 text-slate-400 text-sm flex items-center justify-between">
                  <span>game.js (Line 24-32)</span>
                  <span className="text-slate-500">git diff output</span>
                </div>
                <div className="p-4 space-y-1 overflow-x-auto leading-relaxed">
                  <div className="text-slate-400">&nbsp;let score = 0;</div>
                  <div className="text-slate-400">&nbsp;let hp = 3;</div>
                  {diffScenario === 'danger' ? (
                    <>
                      <div className="p-1.5 rounded bg-rose-950/70 text-rose-300 font-bold border-l-4 border-rose-500">
                        -let playerX = Math.max(0, Math.min(360, playerX)); // 💥 원래 있던 좌우 벽 탈출 방지 코드가 삭제됨!
                      </div>
                      <div className="p-1.5 rounded bg-emerald-950/70 text-emerald-300 font-bold border-l-4 border-emerald-500">
                        +let gameLevel = 1;
                      </div>
                      <div className="p-1.5 rounded bg-emerald-950/70 text-emerald-300 font-bold border-l-4 border-emerald-500">
                        +let meteorSpeed = 3 + (gameLevel - 1) * 1.5;
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-slate-400">&nbsp;let playerX = Math.max(0, Math.min(360, playerX)); // 🛡️ 기존 벽 보호 코드 안전 유지</div>
                      <div className="p-1.5 rounded bg-emerald-950/70 text-emerald-300 font-bold border-l-4 border-emerald-500">
                        +let gameLevel = 1;
                      </div>
                      <div className="p-1.5 rounded bg-emerald-950/70 text-emerald-300 font-bold border-l-4 border-emerald-500">
                        +let meteorSpeed = 3 + (gameLevel - 1) * 1.5;
                      </div>
                    </>
                  )}
                  <div className="text-slate-400">&nbsp;function updateGameLoop() {</div>
                  <div className="text-slate-400">&nbsp;&nbsp;&nbsp;drawPlayer();</div>
                </div>
              </div>

              {/* 승인 / 반려 버튼 & 피드백 박스 */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDiffAction('reject')}
                    className="flex-1 py-3 px-4 rounded-xl border border-rose-500/50 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>반려 (Reject - 코드 거부)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiffAction('accept')}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>승인 (Accept - 코드 병합)</span>
                  </button>
                </div>

                {diffFeedback && (
                  <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
                    diffFeedback.isSuccess ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {diffFeedback.isSuccess ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{diffFeedback.title}</span>
                    </div>
                    <p>{diffFeedback.msg}</p>
                  </div>
                )}
              </div>

            </article>

            {/* 2. 핵심 스모크 회귀 테스트 슈트 러너 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      핵심 스모크 회귀 테스트 슈트 (Smoke Regression Suite)
                    </h3>
                    <p className="text-sm text-slate-500">배포 전 4개 핵심 생명줄 기능이 정상 통과하는지 1초 만에 자동 검증합니다.</p>
                  </div>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                  suiteStatus.includes('PASS')
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : isSuiteRunning
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {suiteStatus}
                </span>
              </div>

              {/* 4개 TC 목록 */}
              <div className="space-y-3">
                {testCases.map(tc => (
                  <div
                    key={tc.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      tc.status === 'pass'
                        ? 'bg-emerald-50 border-emerald-300'
                        : tc.status === 'running'
                        ? 'bg-indigo-50/50 border-indigo-200'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-900 block">{tc.title}</span>
                      <span className="text-sm text-slate-500 block">{tc.desc}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-mono font-bold ${
                      tc.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : tc.status === 'running'
                        ? 'bg-indigo-200 text-indigo-800 animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tc.status === 'pass' ? 'PASS 🟢' : tc.status === 'running' ? 'RUNNING' : 'WAITING'}
                    </span>
                  </div>
                ))}
              </div>

              {/* 테스트 실행 컨트롤러 */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={runRegressionSuite}
                  disabled={isSuiteRunning}
                  className={`flex-1 py-3 px-5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    suiteStatus.includes('PASS')
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSuiteRunning ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>스모크 테스트 실행 중...</span>
                    </>
                  ) : suiteStatus.includes('PASS') ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>회귀 테스트 전체 통과 (4/4 PASS)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>회귀 테스트 자동 실행 (Run All 4 Tests)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetTestSuite}
                  className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                  title="테스트 상태 초기화"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>초기화</span>
                </button>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 1 미션 & 원리</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 3 실전 최신 AI 5대 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 03: 실전 최신 AI 5대 킬러 퀘스트 (QUEST 01 ~ QUEST 05 고정)         */}
        {/* ===================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">STAGE 03 · 실전 최신 AI 5대 킬러 퀘스트</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                실제 ChatGPT와 Gemini에게 명령하여 도미노 붕괴를 막아보세요!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                실제 외부 AI 창을 띄워두고 [프롬프트 복사] 버튼을 눌러 테스트해 보세요. 개발자들이 현업에서 쓰는 기존 코드 보존 원칙과 회귀 테스트 자동화의 비밀을 배울 수 있습니다.
              </p>
            </div>

            {/* QUEST 01 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🛡️</span>
                    <span>QUEST 01. "기존 코드는 100% 보존해 줘!" 도미노 방지 프롬프트</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">기능 확장(Feature Extension) & 부작용(Side Effect) 원천 차단</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(1, `[Goal]:
별똥별 피하기 웹 게임에 '30초마다 피버 타임(Fever Time)' 기능을 추가하려고 해. 기존에 완성된 우주선 이동, 충돌 감지, 점수 계산 로직이 망가지지 않도록 안전한 수정 코드를 작성해 줘.

[Condition]:
1. [기존 코드 절대 보존 원칙]: 기존의 requestAnimationFrame 루프, 충돌 판정 함수, HP 차감 로직은 단 한 줄도 임의로 수정하거나 삭제하지 마.
2. [변경 범위 최소화]: 피버 타임과 관련된 새로운 변수와 함수만 깔끔하게 추가해 줘.
3. [Diff 형식 출력]: 어느 줄 사이에 새 코드를 끼워 넣어야 하는지 Git Diff 형식(+ 초록 줄 표시)으로 명확히 보여줘.`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedId === 1 ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">복사됨! ✨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>프롬프트 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
별똥별 피하기 웹 게임에 '30초마다 피버 타임(Fever Time)' 기능을 추가하려고 해. 기존에 완성된 우주선 이동, 충돌 감지, 점수 계산 로직이 망가지지 않도록 안전한 수정 코드를 작성해 줘.

[Condition]:
1. [기존 코드 절대 보존 원칙]: 기존의 requestAnimationFrame 루프, 충돌 판정 함수, HP 차감 로직은 단 한 줄도 임의로 수정하거나 삭제하지 마.
2. [변경 범위 최소화]: 피버 타임과 관련된 새로운 변수와 함수만 깔끔하게 추가해 줘.
3. [Diff 형식 출력]: 어느 줄 사이에 새 코드를 끼워 넣어야 하는지 Git Diff 형식(+ 초록 줄 표시)으로 명확히 보여줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    "기존 코드를 건드리지 말라"는 제약 조건을 걸면, 전체 코드를 제멋대로 덮어써서 기존 기능을 날려먹는 도미노 사고를 원천 방지합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    AI에게 코딩을 시킬 때 가장 흔한 사고는 새 기능을 넣으려다 기존의 핵심 예외 처리를 지워버리는 '코드 덮어쓰기 회귀(Regression)'입니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 02 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🔍</span>
                    <span>QUEST 02. 코드 출입국 심사: 깃 디프(Git Diff) 빨간 줄(-) 감시하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">Git Diff 독해법 & 변경 사항 코드 리뷰(Code Review)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(2, `[Goal]:
AI가 수정한 자바스크립트 코드의 Git Diff를 검토하고 있어. 삭제된 줄(빨간색 - 표시) 중에서 기존 게임의 안전장치가 파괴된 '회귀 버그(Regression)'가 숨어 있는지 찾아내 줘.

[Git Diff Context]:
 function movePlayer(e) {
-  if (playerX < 0 || playerX > 360) return; // 벽 탈출 방지
+  playerX += (e.key === 'ArrowRight' ? 10 : -10);
   player.style.left = playerX + 'px';
 }

[Condition]:
1. 삭제된 \`- if (playerX < 0 ...)\` 줄이 빠지면 게임 화면에서 어떤 심각한 버그(우주선이 모니터 밖으로 사라짐)가 발생하는지 설명해 줘.
2. 기능을 개선하면서도 벽 탈출 방지 안전장치를 완벽히 유지하는 올바른 수정 코드를 제안해 줘.`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedId === 2 ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">복사됨! ✨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>프롬프트 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
AI가 수정한 자바스크립트 코드의 Git Diff를 검토하고 있어. 삭제된 줄(빨간색 - 표시) 중에서 기존 게임의 안전장치가 파괴된 '회귀 버그(Regression)'가 숨어 있는지 찾아내 줘.

[Git Diff Context]:
 function movePlayer(e) {
-  if (playerX < 0 || playerX > 360) return; // 벽 탈출 방지
+  playerX += (e.key === 'ArrowRight' ? 10 : -10);
   player.style.left = playerX + 'px';
 }

[Condition]:
1. 삭제된 \`- if (playerX < 0 ...)\` 줄이 빠지면 게임 화면에서 어떤 심각한 버그(우주선이 모니터 밖으로 사라짐)가 발생하는지 설명해 줘.
2. 기능을 개선하면서도 벽 탈출 방지 안전장치를 완벽히 유지하는 올바른 수정 코드를 제안해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    빨간 줄 하나가 빠졌을 때 발생하는 잠재적 재앙을 정확히 경고하며, 벽 경계를 지키는 안전한 코드를 즉시 복원합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    전문 개발자들은 코드 리뷰 시 초록색 추가 줄(+)보다 빨간색 삭제 줄(-)을 먼저 검사합니다. 삭제된 줄에 중요한 예외 처리가 숨어 있기 때문입니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 03 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>💨</span>
                    <span>QUEST 03. 4대 스모크 테스트(Smoke Test) 시나리오 작성 요청하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">스모크 테스트(Smoke Testing) & 최소 필수 검증 슈트</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(3, `[Goal]:
웹 아케이드 게임을 업데이트한 후, 전체 기능이 마비되지 않았는지 1분 안에 빠르게 확인하는 [4대 핵심 스모크 테스트(Smoke Test)] 시나리오를 표 형식으로 작성해 줘.

[Target Features]:
우주선 좌우 이동, 별똥별 낙하 및 충돌, HP 감소 및 하트 UI 갱신, 게임오버 창 팝업

[Condition]:
1. 각 테스트마다 [테스트 번호], [검증할 핵심 기능], [사용자 행동(Action)], [기대 결과(Expected Output)], [실패 시 위험도] 5개 열로 구성해 줘.
2. 배포 직전 빠르게 손으로 테스트할 수 있도록 직관적이고 간단한 절차로 서술해 줘.`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedId === 3 ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">복사됨! ✨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>프롬프트 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
웹 아케이드 게임을 업데이트한 후, 전체 기능이 마비되지 않았는지 1분 안에 빠르게 확인하는 [4대 핵심 스모크 테스트(Smoke Test)] 시나리오를 표 형식으로 작성해 줘.

[Target Features]:
우주선 좌우 이동, 별똥별 낙하 및 충돌, HP 감소 및 하트 UI 갱신, 게임오버 창 팝업

[Condition]:
1. 각 테스트마다 [테스트 번호], [검증할 핵심 기능], [사용자 행동(Action)], [기대 결과(Expected Output)], [실패 시 위험도] 5개 열로 구성해 줘.
2. 배포 직전 빠르게 손으로 테스트할 수 있도록 직관적이고 간단한 절차로 서술해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    1분 만에 게임의 핵심 생명줄을 검증할 수 있는 초고속 스모크 테스트 체크리스트를 일목요연하게 정리해 줍니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    '스모크 테스트'는 하드웨어를 수리한 뒤 전원을 켰을 때 "연기가 나는가?"를 보듯, 핵심 기능의 작동 여부만 최단 시간에 확인하는 QA 기법입니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 04 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>⚡</span>
                    <span>QUEST 04. Jest / 브라우저 자동 단언(assert) 테스트 함수 소환하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">자동화 단위 테스트(Unit Test) & 단언문(assert)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(4, `[Goal]:
플레이어의 HP 차감 로직과 레벨업 계산 함수가 의도대로 작동하는지 자동으로 검증해 주는 순수 자바스크립트 assert 테스트 함수를 작성해 줘.

[Target Function]:
function calculateSpeed(level) {
  return 3.0 + (level - 1) * 0.8;
}

[Condition]:
1. 외부 테스팅 라이브러리(Jest, Mocha 등) 없이 순수 브라우저 콘솔에서 바로 실행할 수 있는 간단한 \`assertEquals(actual, expected, testName)\` 함수를 구현해 줘.
2. 레벨 1일 때 3.0, 레벨 3일 때 4.6이 나오는지 검증하는 2가지 자동 테스트 케이스를 포함해 줘.
3. 테스트가 통과하면 콘솔에 초록색 \`[PASS]\`, 실패하면 빨간색 \`[FAIL]\` 로그를 출력해 줘.`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedId === 4 ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">복사됨! ✨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>프롬프트 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
플레이어의 HP 차감 로직과 레벨업 계산 함수가 의도대로 작동하는지 자동으로 검증해 주는 순수 자바스크립트 assert 테스트 함수를 작성해 줘.

[Target Function]:
function calculateSpeed(level) {
  return 3.0 + (level - 1) * 0.8;
}

[Condition]:
1. 외부 테스팅 라이브러리(Jest, Mocha 등) 없이 순수 브라우저 콘솔에서 바로 실행할 수 있는 간단한 \`assertEquals(actual, expected, testName)\` 함수를 구현해 줘.
2. 레벨 1일 때 3.0, 레벨 3일 때 4.6이 나오는지 검증하는 2가지 자동 테스트 케이스를 포함해 줘.
3. 테스트가 통과하면 콘솔에 초록색 \`[PASS]\`, 실패하면 빨간색 \`[FAIL]\` 로그를 출력해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    외부 도구 설치 없이 브라우저 F12 콘솔에 복사하기만 하면 바로 돌아가는 자체 단언(assert) 테스트 엔진을 즉시 구현해 줍니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    버튼을 수백 번 손으로 누르지 않고, 컴퓨터가 0.001초 만에 수학 공식과 함수를 자동 검증하게 만드는 것이 '자동화 단위 테스트'의 힘입니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 05 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🧹</span>
                    <span>QUEST 05. 리팩토링 안전 가이드: 기능 변경 없는 코드 정리 요청하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">리팩토링(Refactoring) & 회귀(Regression) 없는 클린 코드</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(5, `[Goal]:
지저분하게 뒤엉킨 100줄짜리 자바스크립트 게임 코드를 가독성 높게 정리(Refactoring)하려고 해. 기능 동작은 1%도 변하지 않으면서 코드만 깔끔해지는 리팩토링 프롬프트를 작성해 줘.

[Condition]:
1. [Refactoring 제1원칙]: 외부로 드러나는 동작(동일한 입력에 동일한 출력)은 절대 바꾸지 말 것.
2. 반복되는 중복 코드(스파게티 코드)를 함수로 분리하고, 변수명을 명확한 영어 카멜케이스로 변경할 것.
3. 변경 전과 변경 후 코드를 나란히 비교해 보여주고, 회귀 테스트를 통과했음을 증명하는 검증 체크리스트 3가지를 함께 제시해 줘.`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedId === 5 ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">복사됨! ✨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>프롬프트 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
지저분하게 뒤엉킨 100줄짜리 자바스크립트 게임 코드를 가독성 높게 정리(Refactoring)하려고 해. 기능 동작은 1%도 변하지 않으면서 코드만 깔끔해지는 리팩토링 프롬프트를 작성해 줘.

[Condition]:
1. [Refactoring 제1원칙]: 외부로 드러나는 동작(동일한 입력에 동일한 출력)은 절대 바꾸지 말 것.
2. 반복되는 중복 코드(스파게티 코드)를 함수로 분리하고, 변수명을 명확한 영어 카멜케이스로 변경할 것.
3. 변경 전과 변경 후 코드를 나란히 비교해 보여주고, 회귀 테스트를 통과했음을 증명하는 검증 체크리스트 3가지를 함께 제시해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    코드가 꼬여서 손대기 두려운 스파게티 코드를 기능 훼손 없이 안전하게 분리하고 리팩토링하는 정석을 제시합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    마틴 파울러의 원칙에 따르면, 리팩토링이란 '소프트웨어의 겉보기 동작은 그대로 유지하면서 내부 구조를 개선하는 작업'입니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 2 회귀 테스트 실습</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 4 전문 용어 돋보기 & 자가 점검</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 04: 전문 용어 돋보기 & 자가 점검 체크리스트 (8강 최신 표준)        */}
        {/* ===================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8">
            
            {/* 1. [🔍 주니어 개발자를 위한 전문 용어 돋보기] (어두운 배경 표준) */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Search className="w-4 h-4" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 11강 회귀 테스트와 Diff 심사에서 사용된 실제 공식 컴퓨터 과학 / QA 테스팅 표준 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                {/* 용어 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🁡</span>
                      <span>회귀 버그</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Regression Bug / 새로운 기능을 넣었더니 잘 되던 옛 기능이 망가지는 현상</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 블록 장난감 집 지붕을 올리려다 애써 쌓은 1층 기둥을 무너뜨린 꼴!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 소프트웨어 업데이트나 버그 수정 후, 기존에 정상 동작하던 다른 기능에 결함이나 성능 저하가 발생하는 현상.
                  </p>
                </div>

                {/* 용어 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🔍</span>
                      <span>깃 디프</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Git Diff / 두 코드 버전 사이의 추가(+)와 삭제(-) 대조표</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 두 장의 그림에서 틀린 그림 찾기를 해 주는 마법의 투명 필름!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 파일 간 또는 커밋 간의 소스 코드 변경 내역을 라인 단위로 대조하여 추가된 코드(+)와 삭제된 코드(-)를 시각화한 목록.
                  </p>
                </div>

                {/* 용어 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>💨</span>
                      <span>스모크 테스트</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Smoke Testing / 시스템의 가장 중요한 핵심 기능만 1분 만에 확인하는 초고속 점검</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 새로 산 로봇의 전원을 켰을 때 "연기가 나는가?"를 가장 먼저 보는 간단한 확인!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 새로운 빌드 배포 후, 세부 기능 테스트에 들어가기 전 핵심적인 주요 기능들이 정상 동작하는지 신속하게 확인하는 최소 검증 절차.
                  </p>
                </div>

                {/* 용어 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>단언문</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Assertion / "이 계산 결과는 반드시 참이어야 한다"는 컴퓨터와의 약속</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> "1+1은 무조건 2여야 해! 아니면 삐- 하고 사이렌을 울려줘!"
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 프로그램의 특정 위치에서 특정 조건이 참(True)이어야 함을 명시하는 검증문으로, 거짓(False)일 경우 테스트 실패를 즉각 보고합니다.
                  </p>
                </div>

                {/* 용어 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 md:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🧹</span>
                      <span>리팩토링</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Refactoring / 겉보기 동작은 유지하면서 내부 코드 구조만 깔끔하게 청소하는 작업</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 방 안의 물건 위치는 그대로 두면서 어질러진 서랍 속만 착착 정리하는 것!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 소프트웨어의 외부 동작을 바꾸지 않고, 코드의 가독성을 높이고 유지보수를 쉽게 만들기 위해 내부 구조를 개선하는 개발 기법.
                  </p>
                </div>

              </div>
            </article>

            {/* 2. [자가 점검 체크리스트 & 완주 언락 카드] (8강 최신 표준 규격) */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* 2단 헤더 레이아웃 (좌측 타이틀 + 우측 에메랄드 알약 뱃지) */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                  {checkedCount} / 6 완료
                </span>
              </div>

              {/* 카드 전용 실시간 그라데이션 게이지 바 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* 체크리스트 6개 항목 */}
              <div className="space-y-2.5">
                {[
                  {
                    num: 1,
                    label: (
                      <>
                        1. 새 코드를 추가했을 때 기존 기능이 무너지는{' '}
                        <span className="font-mono text-indigo-600 font-bold">회귀 버그(Regression Bug)</span>
                        의 위험성을 이해했나요?
                      </>
                    )
                  },
                  {
                    num: 2,
                    label: (
                      <>
                        2. 변경된 코드 대조표인{' '}
                        <span className="font-mono text-indigo-600 font-bold">Git Diff</span>
                        에서 삭제 줄(-)을 먼저 감시하는 코드 리뷰 습관을 익혔나요?
                      </>
                    )
                  },
                  {
                    num: 3,
                    label: (
                      <>
                        3. 배포 직전 핵심 생명선 기능만 빠르게 검증하는{' '}
                        <span className="font-mono text-indigo-600 font-bold">스모크 테스트(Smoke Test)</span>
                        의 역할을 파악했나요?
                      </>
                    )
                  },
                  {
                    num: 4,
                    label: (
                      <>
                        4. 가상 테스트 러너에서 4대 핵심 회귀 테스트 케이스를 자동 실행하고 결과를 분석해 보았나요?
                      </>
                    )
                  },
                  {
                    num: 5,
                    label: (
                      <>
                        5. 최신 AI에게 "기존 코드 보존" 제약 조건과 Diff 형식 출력을 요구하는 도미노 방지 프롬프트 퀘스트를 성공시켰나요?
                      </>
                    )
                  },
                  {
                    num: 6,
                    label: (
                      <>
                        6. 프로그램의 겉보기 동작을 보존하면서 코드 구조만 깔끔하게 청소하는{' '}
                        <span className="font-mono text-indigo-600 font-bold">리팩토링(Refactoring)</span>
                        의 제1원칙을 기억하나요?
                      </>
                    )
                  }
                ].map(item => (
                  <label
                    key={item.num}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[item.num]}
                      onChange={() => handleToggleCheck(item.num)}
                      className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">{item.label}</span>
                  </label>
                ))}
              </div>
            </article>

            {/* 3. [100% 완주 축하 & 12강 잠금 해제 다크 펄스 카드] (8강 표준) */}
            {isAllComplete && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">
                      회귀 테스트 & 11강 완주 달성을 축하합니다! 🛡️🎉
                    </h4>
                    <p className="text-sm text-slate-300">
                      6가지 점검 항목을 모두 통과하여 도미노 방지 회귀 테스트와 Diff 감시 기법을 완전히 정복했습니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 3 · 12강: 우리 반 명예의 전당! 로컬스토리지 최고 점수 저장과 랭킹판</p>
                  </div>
                  <a
                    href="../12-ranking-storage/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>12강으로 즉시 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            {/* 하단 이전 네비게이션 버튼 */}
            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 3 실전 최신 AI 5대 퀘스트</span>
              </button>
            </div>

          </section>
        )}

      </main>

      {/* 푸터 */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>AI·코딩 24강 장기 교육과정 · 시즌 3 회귀 테스트 & QA 자동화</p>
          <div className="flex items-center gap-4">
            <a href="../../index.html" className="hover:text-slate-800 transition-colors">과정 홈</a>
            <span>·</span>
            <a href="../10-bug-hunter/index.html" class="hover:text-slate-800 transition-colors">10강 버그 사냥꾼</a>
            <span>·</span>
            <a href="../12-ranking-storage/index.html" class="hover:text-slate-800 transition-colors">12강 랭킹 보관소</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson11;
