import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Award,
  Terminal,
  Bug,
  ShieldAlert,
  ShieldCheck,
  Search,
  FileText,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Flame,
  Bot,
  Lightbulb,
  FileCode
} from 'lucide-react';

interface Scenario {
  title: string;
  errorName: string;
  file: string;
  severity: string;
  brokenCode: string;
  consoleLog: string[];
  options: {
    text: string;
    correct: boolean;
    msg: string;
  }[];
}

const bugScenarios: Record<'a' | 'b' | 'c', Scenario> = {
  a: {
    title: 'A. 오타 변수 참조 에러',
    errorName: 'ReferenceError',
    file: 'game.js (Line 14)',
    severity: 'Critical 🔴',
    brokenCode: `// game.js: 점수 추가 함수
function addScore(points) {
  socre += points; // 💥 socre 오타 발생!
  updateDisplay();
}`,
    consoleLog: [
      "Uncaught ReferenceError: socre is not defined",
      "    at addScore (game.js:14:3)",
      "    at handleStarPassed (game.js:45:7)",
      "    at gameLoop (game.js:88:12)"
    ],
    options: [
      { text: 'let socre = 0; 변수를 새로 선언하여 덮어쓴다.', correct: false, msg: '새 변수를 선언하면 기존 전역 score 변수와 따로 놀아 화면 점수가 오르지 않습니다.' },
      { text: 'score += points; 로 오타 철자를 바르게 고친다.', correct: true, msg: '정답입니다! 전역 score 변수에 올바르게 점수가 누적되어 화면에 즉시 반영됩니다. 🎯' },
      { text: 'updateDisplay(socre); 처럼 함수 인자로 넘긴다.', correct: false, msg: 'socre 자체가 정의되지 않았으므로 여전히 ReferenceError가 발생합니다.' }
    ]
  },
  b: {
    title: 'B. null 객체 호출 에러',
    errorName: 'TypeError',
    file: 'index.html (Line 8)',
    severity: 'Critical 🔴',
    brokenCode: `// index.html: 시작 버튼 리스너
const btn = document.getElementById("start-btn");
// 💥 HTML 태그가 렌더링되기 전 실행되어 btn이 null!
btn.addEventListener("click", startGame);`,
    consoleLog: [
      "Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')",
      "    at initGame (index.html:8:5)",
      "    at window.onload (index.html:2:1)"
    ],
    options: [
      { text: 'btn을 var 키워드로 바꿔서 호이스팅시킨다.', correct: false, msg: 'var로 바꿔도 DOM 요소 탐색 결과가 null인 것은 해결되지 않습니다.' },
      { text: 'DOMContentLoaded 이벤트 안에서 버튼을 찾거나 defer 속성을 붙인다.', correct: true, msg: '정답입니다! HTML 태그가 브라우저에 모두 그려진 뒤 스크립트가 실행되어 null 에러가 완벽히 차단됩니다. 🛡️' },
      { text: 'addEventListener 대신 onclick="startGame()"을 인라인으로 100개 복붙한다.', correct: false, msg: '인라인 핸들러는 유지보수가 불가능해지는 안티 패턴입니다.' }
    ]
  },
  c: {
    title: 'C. 괄호 누락 문법 에러',
    errorName: 'SyntaxError',
    file: 'app.js (Line 22)',
    severity: 'Fatal 🛑',
    brokenCode: `// app.js: 키 입력 조건문
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' { // 💥 닫는 괄호 ) 누락!
    fireLaser();
  }
});`,
    consoleLog: [
      "Uncaught SyntaxError: Unexpected token '{' (app.js:22:26)",
      "    at ScriptRunner.execute (engine.js:5:1)"
    ],
    options: [
      { text: 'if (e.code === "Space") { 로 닫는 소괄호를 추가한다.', correct: true, msg: '정답입니다! if 조건문의 괄호 짝을 맞춰 자바스크립트 파서가 문법을 올바르게 해석합니다. 💡' },
      { text: 'if 문을 지우고 무조건 fireLaser()를 실행하게 한다.', correct: false, msg: '아무 키나 눌러도, 키를 안 눌러도 레이저가 나가버리는 버그가 됩니다.' },
      { text: '코드 끝에 세미콜론(;) 3개를 덧붙인다.', correct: false, msg: '세미콜론은 괄호 문법 오류를 해결하지 못합니다.' }
    ]
  }
};

export const Lesson10: React.FC = () => {
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
      const saved = localStorage.getItem('ai_lesson_10_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  });

  const handleToggleCheck = (num: number) => {
    setChecklist(prev => {
      const next = { ...prev, [num]: !prev[num] };
      try {
        localStorage.setItem('ai_lesson_10_checklist', JSON.stringify(next));
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
        localStorage.setItem('ai_lesson_10_completed', 'true');
      } else {
        localStorage.removeItem('ai_lesson_10_completed');
      }
    } catch (e) {}
  }, [isAllComplete]);

  // ---------------------------------------------------------------------------
  // 4. 가상 버그 사냥꾼 스튜디오 시뮬레이터 상태
  // ---------------------------------------------------------------------------
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'a' | 'b' | 'c'>('a');
  const [isErrorTriggered, setIsErrorTriggered] = useState<boolean>(false);
  const [battleScore, setBattleScore] = useState<number>(0);
  const [patchFeedback, setPatchFeedback] = useState<{ isSuccess: boolean; msg: string } | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '> 가상 웹 브라우저 로드 완료. [버그 유발 실행] 버튼을 눌러 에러를 감지하세요.'
  ]);

  const currentScenario = bugScenarios[selectedScenarioKey];

  const handleSelectScenario = (key: 'a' | 'b' | 'c') => {
    setSelectedScenarioKey(key);
    setIsErrorTriggered(false);
    setPatchFeedback(null);
    setConsoleLogs([`> [${bugScenarios[key].title}] 선택됨. 아래 [버그 유발 실행]을 눌러보세요.`]);
  };

  const handleTriggerBug = () => {
    setIsErrorTriggered(true);
    setPatchFeedback(null);
    setConsoleLogs([
      `> 스크립트 실행 중... http://localhost:8000/${currentScenario.file.split(' ')[0]}`,
      `❌ ${currentScenario.consoleLog[0]}`,
      ...currentScenario.consoleLog.slice(1),
      `> 💥 런타임 크래시 감지! 하단 핫픽스 스테이션에서 코드를 수리하세요.`
    ]);
  };

  const handleApplyHotfix = (index: number) => {
    const opt = currentScenario.options[index];
    if (opt.correct) {
      setBattleScore(prev => prev + 100);
      setPatchFeedback({ isSuccess: true, msg: opt.msg });
      setConsoleLogs(prev => [
        ...prev,
        `> [HOTFIX APPLIED] 핫픽스 코드가 성공적으로 병합되었습니다!`,
        `> 프로그램이 정상 재가동됩니다. All tests passed. ✅`
      ]);
      // 자동 4번 체크
      handleToggleCheck(4);
    } else {
      setPatchFeedback({ isSuccess: false, msg: opt.msg });
      setConsoleLogs(prev => [
        ...prev,
        `> [PATCH FAILED] 수정 코드가 올바르지 않아 에러가 재발했습니다. 다른 보기를 선택하세요.`
      ]);
    }
  };

  const handleResetSimulator = () => {
    handleSelectScenario(selectedScenarioKey);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      
      {/* ======================================================================= */}
      {/* [상단 고정 풀 너비 GNB 헤더] 1강 최신 표준                               */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* 1. [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-rose-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">10강: 빨간 에러는 보물지도! 버그 사냥꾼 배틀</span>
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
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage1' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage2' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>버그 사냥 실습</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage3' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage4' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-rose-700 shadow-sm'
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
            activeStage === 'stage1' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage2' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. 버그 사냥
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage3' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. 실전 AI
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage4' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. 자가 점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'all' ? 'text-rose-700 bg-rose-50' : 'text-slate-500'
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
            {/* 미션 히어로 카드 */}
            <article className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-rose-500/20">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-500/30 text-rose-300 border border-rose-400/30">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    시즌 3 개막 · QA 디버거 & 테스트 기초
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    F12 DevTools + Stack Trace + Given-When-Then BDD
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  빨간 에러는 실패가 아니라 보물지도! 🗺️
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                  브라우저 콘솔의 빨간 에러 메시지를 만났을 때 당황하지 마세요! 컴퓨터는 거짓말을 하지 않으며, 에러는 '어느 파일 몇 번째 줄에서 왜 멈췄는지' 정확히 가리키는 가장 친절한 나침반입니다. AI와 함께 버그를 체포하는 프로 QA 버그 사냥꾼이 되어 보세요!
                </p>
              </div>

              {/* 3대 퀘스트 도전 목표 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-300">
                    <Search className="w-4 h-4" />
                    <span className="font-bold text-sm">3대 단골 에러 독해</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    문법(Syntax), 이름 오타(Reference), 유령 객체(Type) 에러 메시지의 차이를 완벽히 구분하기
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300">
                    <FileText className="w-4 h-4" />
                    <span className="font-bold text-sm">Given-When-Then 공식</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    프로 테스터들이 쓰는 3단계 표준 버그 리포트로 AI에게 한 방에 통하는 핫픽스 패치 요청하기
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-sm">방어적 프로그래밍</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    경계값(Boundary) 예외 처리와 로깅 트랩으로 어떤 잘못된 입력에도 튕기지 않는 무적 코드 완성하기
                  </p>
                </div>
              </div>
            </article>

            {/* 핵심 개념 원리 탐구 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <Bug className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    🐞 버그를 두려워하지 않는 주니어 개발자의 3대 단골 에러 독해법
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  자바스크립트가 화면에 뱉어내는 수많은 에러 중 90% 이상은 단 3가지 유형에 속합니다.
                </p>
              </div>

              {/* 3대 에러 3구리드 Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-600">
                    <span className="text-lg">🛑</span>
                    <h4 className="text-base font-bold text-slate-900">문법 에러</h4>
                  </div>
                  <span className="text-sm font-mono text-slate-500 block">SyntaxError / 규칙 위반</span>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      🧸 <strong>어린이 비유:</strong> 문장의 마침표나 따옴표를 빼먹어서 컴퓨터가 "외계어인가요?" 하고 읽기 자체를 거부한 상태!
                    </p>
                    <p className="text-slate-600">
                      🎓 <strong>개발자 원리:</strong> 자바스크립트 해석기가 코드를 읽는 파싱(Parsing) 단계에서 괄호 짝 `&#125;`, 따옴표 `"`, 쉼표 `,` 등이 빠져 실행조차 되지 않는 에러입니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="text-lg">🔍</span>
                    <h4 className="text-base font-bold text-slate-900">참조 에러</h4>
                  </div>
                  <span className="text-sm font-mono text-slate-500 block">ReferenceError / 이름 오타</span>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      🧸 <strong>어린이 비유:</strong> 출석부에 없는 친구 이름을 부른 상황! '영희'를 '영히'로 잘못 불러서 아무도 대답하지 못하는 상태!
                    </p>
                    <p className="text-slate-600">
                      🎓 <strong>개발자 원리:</strong> 아직 선언되지 않았거나 철자가 틀린 변수나 함수를 호출했을 때 발생하며, 90% 이상이 단순 철자 오타(socre vs score)입니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <span className="text-lg">👻</span>
                    <h4 className="text-base font-bold text-slate-900">타입 에러</h4>
                  </div>
                  <span className="text-sm font-mono text-slate-500 block">TypeError / 유령 객체</span>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      🧸 <strong>어린이 비유:</strong> 투명인간에게 악수를 청한 꼴! 빈 상자(null)를 가져와 놓고 뚜껑을 열려고 하니 화를 내는 상태!
                    </p>
                    <p className="text-slate-600">
                      🎓 <strong>개발자 원리:</strong> `null`이나 `undefined` 상태인 대상의 속성이나 메서드(`null.addEventListener`)를 강제로 실행하려 할 때 런타임에 발생합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 주니어 QA 개발자 제1원칙 알림 카드 */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-rose-900">
                    주니어 QA 버그 사냥꾼의 제1원칙: "에러의 맨 앞 단어와 맨 뒷 줄 번호를 보라!"
                  </h4>
                  <p className="text-sm text-rose-800 leading-relaxed">
                    빨간 에러가 길게 쏟아져도 겁먹을 필요가 없습니다. <span className="font-bold underline decoration-rose-400">맨 앞의 에러 이름(무슨 실수인지)</span>과 <span className="font-bold underline decoration-rose-400">맨 오른쪽의 파일명:줄 번호(어디서 터졌는지)</span>만 확인하면 10초 안에 버그의 위치를 찾아낼 수 있습니다!
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 2 가상 버그 사냥 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 버그 사냥꾼 스튜디오                           */}
        {/* ===================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              
              {/* 콘솔 헤더 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600/30 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>가상 브라우저 F12 개발자 도구</span>
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-normal border border-rose-500/30">순수 JS 엔진</span>
                    </h3>
                    <p className="text-sm text-slate-400">시나리오를 선택하고 버그를 유발한 뒤, 올바른 핫픽스 코드로 수리해 보세요!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-sm font-semibold text-amber-400">사냥 점수:</span>
                  <span className="text-base font-bold text-white font-mono">{battleScore}점 🎯</span>
                </div>
              </div>

              {/* 3대 버그 시나리오 탭 버튼 */}
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-300 block">사냥할 버그 시나리오를 선택하세요:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['a', 'b', 'c'] as const).map(key => {
                    const s = bugScenarios[key];
                    const isSelected = selectedScenarioKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectScenario(key)}
                        className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                            : 'bg-slate-800/90 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{key === 'a' ? '🔍' : key === 'b' ? '👻' : '🛑'}</span>
                          <span>{s.title.split('. ')[1]}</span>
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-rose-200' : 'text-slate-400'}`}>
                          {s.errorName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 가상 브라우저 창 쉘 */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-sm font-mono text-slate-400 pl-2">http://localhost:8000/game.html (Console F12)</span>
                  </div>
                  <span className="text-sm font-mono text-rose-400 font-bold">{currentScenario.title}</span>
                </div>

                {/* 터미널 콘솔 로그 출력창 */}
                <div className="p-4 sm:p-5 font-mono text-sm space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto bg-black/90">
                  {consoleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.startsWith('❌')
                          ? 'text-rose-400 font-bold mt-1.5'
                          : log.startsWith('    at')
                          ? 'text-rose-300/80 pl-6 text-sm'
                          : log.includes('HOTFIX APPLIED')
                          ? 'text-emerald-400 font-bold mt-2'
                          : log.includes('All tests passed')
                          ? 'text-slate-300'
                          : log.includes('크래시 감지')
                          ? 'text-amber-400 mt-2'
                          : log.includes('PATCH FAILED')
                          ? 'text-rose-400 mt-1'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* 컨트롤 버튼 */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerBug}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>🚨 버그 유발 실행 (콘솔 에러 발생시키기)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>콘솔 초기화</span>
                </button>
              </div>

            </article>

            {/* 핫픽스 코드 패치 배틀 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    🛠️ 에러 코드 진단 & 핫픽스(Hotfix) 패치 스테이션
                  </h3>
                </div>
                <span className={`text-sm font-mono px-3 py-1 rounded-full font-bold ${
                  patchFeedback?.isSuccess
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : isErrorTriggered
                    ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {patchFeedback?.isSuccess
                    ? '🟢 패치 완료 (정상 동작)'
                    : isErrorTriggered
                    ? '🚨 버그 감지됨! 수리 필요'
                    : '에러 대기 중'}
                </span>
              </div>

              {/* 문제의 코드 스니펫 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">문제의 소스 코드 스니펫:</span>
                  <span className="text-sm font-mono text-rose-600 font-bold">{currentScenario.file}</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-rose-300 font-mono text-sm overflow-x-auto leading-relaxed border border-slate-800">
                  {isErrorTriggered
                    ? currentScenario.brokenCode
                    : '// 에러 유발 전입니다. 상단 콘솔에서 [버그 유발 실행]을 눌러보세요.'}
                </pre>
              </div>

              {/* 핫픽스 3지선다 선택지 */}
              <div className="space-y-2.5">
                <span className="text-sm font-bold text-slate-700 block">버그를 박멸할 올바른 수정 코드를 선택하세요:</span>
                <div className="space-y-2">
                  {!isErrorTriggered ? (
                    <div className="p-4 rounded-xl border border-slate-200 text-sm text-slate-500 bg-slate-50 text-center">
                      먼저 상단의 [🚨 버그 유발 실행] 버튼을 눌러 에러를 감지해야 패치 보기가 활성화됩니다.
                    </div>
                  ) : (
                    currentScenario.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyHotfix(idx)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/20 text-sm font-medium text-slate-800 transition-all flex items-start gap-2.5 cursor-pointer bg-white"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{opt.text}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* 핫픽스 결과 피드백 박스 */}
              {patchFeedback && (
                <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
                  patchFeedback.isSuccess
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {patchFeedback.isSuccess ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800">핫픽스 패치 성공! (+100점)</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-800">패치 실패: 버그가 여전히 남아 있습니다!</span>
                      </>
                    )}
                  </div>
                  <p>{patchFeedback.msg}</p>
                </div>
              )}

              {/* 실시간 QA 텔레메트리 리포트 */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-500 block">에러 이름</span>
                  <span className="text-sm font-mono font-bold text-rose-600">
                    {isErrorTriggered ? currentScenario.errorName : '대기 중'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-500 block">발생 위치</span>
                  <span className="text-sm font-mono font-bold text-slate-800">
                    {isErrorTriggered ? currentScenario.file : '-'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-500 block">위험 심각도</span>
                  <span className="text-sm font-bold text-amber-600">
                    {isErrorTriggered ? (patchFeedback?.isSuccess ? 'Safe 🟢' : currentScenario.severity) : '-'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm text-slate-500 block">패치 상태</span>
                  <span className="text-sm font-bold text-slate-600">
                    {patchFeedback?.isSuccess ? '패치 성공 (정상 가동)' : isErrorTriggered ? '패치 대기 중 ⚠️' : '미완료'}
                  </span>
                </div>
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
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
              <div className="flex items-center gap-2 text-rose-600">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">STAGE 03 · 실전 최신 AI 5대 킬러 퀘스트</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                실제 ChatGPT와 Gemini에게 명령하여 버그를 체포해 보세요!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                실제 외부 AI 창을 띄워두고 [프롬프트 복사] 버튼을 눌러 테스트해 보세요. 개발자들이 현업에서 쓰는 버그 리포트와 예외 처리의 비밀을 배울 수 있습니다.
              </p>
            </div>

            {/* QUEST 01 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📋</span>
                    <span>QUEST 01. 브라우저 콘솔 빨간 에러 통째로 복붙해 원인 소환하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">에러 스택 트레이스(Stack Trace) & 라인 넘버 역추적</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(1, `[Goal]:
웹 게임을 만들던 중 브라우저 개발자 도구(F12) 콘솔에 발생한 빨간 에러 메시지를 분석하고, 버그가 발생한 정확한 원인과 수정 코드를 알려줘.

[Error Message]:
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at initGame (game.js:14:22)
    at onload (index.html:8:5)

[Code Context]:
const startBtn = document.getElementById("start-button");
startBtn.addEventListener("click", startGame);

[Condition]:
1. 왜 null 에러가 발생했는지 초보 학생도 이해할 수 있게 어린이 은유(투명인간 버튼)로 설명해 줘.
2. HTML 문서가 로드되기 전에 스크립트가 먼저 실행되어 발생하는 문제인지 진단해 줘.
3. defer 속성 추가 또는 DOMContentLoaded 이벤트 리스너를 적용한 안전한 해결 코드 2가지를 제시해 줘.`)}
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
웹 게임을 만들던 중 브라우저 개발자 도구(F12) 콘솔에 발생한 빨간 에러 메시지를 분석하고, 버그가 발생한 정확한 원인과 수정 코드를 알려줘.

[Error Message]:
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at initGame (game.js:14:22)
    at onload (index.html:8:5)

[Code Context]:
const startBtn = document.getElementById("start-button");
startBtn.addEventListener("click", startGame);

[Condition]:
1. 왜 null 에러가 발생했는지 초보 학생도 이해할 수 있게 어린이 은유(투명인간 버튼)로 설명해 줘.
2. HTML 문서가 로드되기 전에 스크립트가 먼저 실행되어 발생하는 문제인지 진단해 줘.
3. defer 속성 추가 또는 DOMContentLoaded 이벤트 리스너를 적용한 안전한 해결 코드 2가지를 제시해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    에러 메시지만 보고도 스크립트 실행 타이밍 문제임을 즉시 짚어내며, 완벽한 defer 속성과 DOMContentLoaded 해결책을 1초 만에 제시합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    자바스크립트는 브라우저가 HTML을 위에서 아래로 읽을 때 &lt;button&gt; 태그를 만나기 전 스크립트를 먼저 실행하면 null을 반환합니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 02 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🎯</span>
                    <span>QUEST 02. Given-When-Then 3단계 공식으로 AI QA 엔지니어 소환하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">BDD(행위 주도 개발) 버그 리포트 표준</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(2, `[Goal]:
별똥별 피하기 게임에서 발생한 치명적인 점수 버그를 해결하기 위해, Given-When-Then 형식의 버그 리포트를 바탕으로 버그 원인을 분석하고 핫픽스 패치 코드를 작성해 줘.

[Bug Report (Given-When-Then)]:
- Given (사전 상태): 플레이어가 우주선을 조종하며 점수가 50점인 상태에서
- When (발생 조건): 별똥별에 부딪혀 생명(HP)이 0이 되어 게임오버 화면이 떴을 때
- Then (기대 결과): 점수 증가가 즉시 멈추고 최종 점수 50점이 고정되어야 함
- But (실제 버그 현상): 게임오버 창이 떴는데도 뒤에서 게임 루프가 계속 돌며 점수가 계속 100점, 200점으로 올라감!

[Condition]:
1. 게임 루프가 멈추지 않는 원인(cancelAnimationFrame 누락 또는 gameover flag 미검사)을 명쾌히 설명해 줘.
2. gameState === 'gameover' 상태일 때 점수 증가 및 requestAnimationFrame 호출을 즉시 중단하는 수정 코드를 작성해 줘.`)}
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
별똥별 피하기 게임에서 발생한 치명적인 점수 버그를 해결하기 위해, Given-When-Then 형식의 버그 리포트를 바탕으로 버그 원인을 분석하고 핫픽스 패치 코드를 작성해 줘.

[Bug Report (Given-When-Then)]:
- Given (사전 상태): 플레이어가 우주선을 조종하며 점수가 50점인 상태에서
- When (발생 조건): 별똥별에 부딪혀 생명(HP)이 0이 되어 게임오버 화면이 떴을 때
- Then (기대 결과): 점수 증가가 즉시 멈추고 최종 점수 50점이 고정되어야 함
- But (실제 버그 현상): 게임오버 창이 떴는데도 뒤에서 게임 루프가 계속 돌며 점수가 계속 100점, 200점으로 올라감!

[Condition]:
1. 게임 루프가 멈추지 않는 원인(cancelAnimationFrame 누락 또는 gameover flag 미검사)을 명쾌히 설명해 줘.
2. gameState === 'gameover' 상태일 때 점수 증가 및 requestAnimationFrame 호출을 즉시 중단하는 수정 코드를 작성해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    Given-When-Then 구조 덕분에 부가 설명 없이도 게임 루프 플래그 및 애니메이션 취소 누락을 단번에 찾아내어 핫픽스 코드를 제공합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    Given(상황)-When(행동)-Then(결과)은 전 세계 빅테크 QA 엔지니어들이 버그를 재현하고 검증할 때 사용하는 BDD 테스트 표준 프레임워크입니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 03 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🕵️</span>
                    <span>QUEST 03. 유령 버그 잡는 console.log 사냥꾼 트랩 심기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">런타임 상태 추적 & 디버깅 로깅(Logging)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(3, `[Goal]:
게임 실행 중 아무런 빨간 에러 메시지도 뜨지 않는데 캐릭터가 오른쪽으로 움직이지 않는 '논리 에러(Logic Bug)'를 추적하기 위한 console.log 디버깅 트랩 코드를 작성해 줘.

[Target Code]:
let posX = 100;
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    posX =+ 5; // 💥 동작하지 않음!
    player.style.left = posX + 'px';
  }
});

[Condition]:
1. 눈으로 찾기 어려운 \`posX =+ 5\`와 \`posX += 5\`의 결정적인 차이점을 설명해 줘.
2. 키 입력 시점마다 e.key 값과 posX의 변화를 콘솔에서 실시간 확인할 수 있는 이모지 로깅(console.log('🎮 키 입력:', e.key, '📍 현재 위치:', posX)) 코드를 포함해 줘.
3. 올바르게 위치가 증가하도록 수정한 완전한 코드를 제공해 줘.`)}
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
게임 실행 중 아무런 빨간 에러 메시지도 뜨지 않는데 캐릭터가 오른쪽으로 움직이지 않는 '논리 에러(Logic Bug)'를 추적하기 위한 console.log 디버깅 트랩 코드를 작성해 줘.

[Target Code]:
let posX = 100;
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    posX =+ 5; // 💥 동작하지 않음!
    player.style.left = posX + 'px';
  }
});

[Condition]:
1. 눈으로 찾기 어려운 \`posX =+ 5\`와 \`posX += 5\`의 결정적인 차이점을 설명해 줘.
2. 키 입력 시점마다 e.key 값과 posX의 변화를 콘솔에서 실시간 확인할 수 있는 이모지 로깅(console.log('🎮 키 입력:', e.key, '📍 현재 위치:', posX)) 코드를 포함해 줘.
3. 올바르게 위치가 증가하도록 수정한 완전한 코드를 제공해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    단순 오타(=+는 단항 덧셈 할당으로 무조건 5로 고정됨)를 즉각 발견하고, 디버깅 로그를 통해 값 변화를 직관적으로 시각화해 줍니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    문법은 맞으나 동작이 엉뚱한 '논리 에러(Logic Error)'는 브라우저가 빨간 에러를 띄우지 않으므로, console.log나 브레이크포인트로만 잡을 수 있습니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 04 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🛡️</span>
                    <span>QUEST 04. 경계값(Boundary) 맹점 뚫기: 0점과 음수 HP 예외 테스트</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">경계값 분석(Boundary Value Analysis) & 방어적 프로그래밍</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(4, `[Goal]:
게임 내 플레이어 생명(HP)과 아이템 점수 계산 함수에서 발생할 수 있는 엣지 케이스(Edge Case)를 방어하는 견고한 예외 처리 코드를 작성해 줘.

[Target Function]:
function takeDamage(damage) {
  hp -= damage;
  if (hp === 0) {
    gameOver();
  }
}

[Condition]:
1. \`hp === 0\`으로 검사할 경우, 현재 HP가 1인 상태에서 2 데미지를 입었을 때 왜 게임오버가 영원히 실행되지 않는 치명적 버그가 발생하는지 설명해 줘.
2. 경계값(Boundary) 조건을 고려하여 \`hp <= 0\`으로 수정하고, 음수로 떨어지지 않도록 \`Math.max(0, hp)\`를 적용한 방어적 코드를 작성해 줘.
3. 비정상적인 데미지 값(음수 데미지나 NaN 등)이 들어왔을 때 유효성을 검사하는 가드 절(Guard Clause)을 포함해 줘.`)}
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
게임 내 플레이어 생명(HP)과 아이템 점수 계산 함수에서 발생할 수 있는 엣지 케이스(Edge Case)를 방어하는 견고한 예외 처리 코드를 작성해 줘.

[Target Function]:
function takeDamage(damage) {
  hp -= damage;
  if (hp === 0) {
    gameOver();
  }
}

[Condition]:
1. \`hp === 0\`으로 검사할 경우, 현재 HP가 1인 상태에서 2 데미지를 입었을 때 왜 게임오버가 영원히 실행되지 않는 치명적 버그가 발생하는지 설명해 줘.
2. 경계값(Boundary) 조건을 고려하여 \`hp <= 0\`으로 수정하고, 음수로 떨어지지 않도록 \`Math.max(0, hp)\`를 적용한 방어적 코드를 작성해 줘.
3. 비정상적인 데미지 값(음수 데미지나 NaN 등)이 들어왔을 때 유효성을 검사하는 가드 절(Guard Clause)을 포함해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    `===` 엄격 동등 비교의 경계값 함정(-1이 되어 영원히 살아남는 버그)을 정확히 지적하고, `Math.max` 기반의 방어적 프로그래밍 패턴을 제시합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    QA 테스팅에서 가장 많은 버그가 터지는 지점은 바로 0, -1, 최대값 등 경계선(Boundary)이며, 방어적 가드 절은 시스템 다운을 원천 봉쇄합니다.
                  </p>
                </div>
              </div>
            </article>

            {/* QUEST 05 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📊</span>
                    <span>QUEST 05. AI에게 3대 단골 에러 자동 검사 체크리스트 요청하기</span>
                  </h4>
                  <span className="text-sm font-mono text-slate-500 block">정적 코드 분석(Linting) & 사전 예방 QA 체크리스트</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(5, `[Goal]:
초보 웹 개발자가 작성한 자바스크립트 프로젝트에서 자주 발생하는 3대 단골 런타임 에러(SyntaxError, ReferenceError, TypeError)를 사전에 예방할 수 있는 [원클릭 QA 자가 진단 체크리스트]를 표(Table) 형식으로 만들어 줘.

[Condition]:
1. 각 에러 유형별로 [에러 이름], [대표적인 실수 원인], [브라우저가 띄우는 빨간 문장 예시], [1초 해결 비결] 4개 열로 정리해 줘.
2. 특히 변수명 철자 오타, 정의되지 않은 객체 프로퍼티 접근(undefined), 괄호 짝 불일치를 반드시 다뤄 줘.
3. 마지막에 개발자가 실시간으로 실수를 감지할 수 있도록 돕는 추천 도구(VS Code ESLint 확장 프로그램, TypeScript 소개)를 2줄로 요약해 줘.`)}
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
초보 웹 개발자가 작성한 자바스크립트 프로젝트에서 자주 발생하는 3대 단골 런타임 에러(SyntaxError, ReferenceError, TypeError)를 사전에 예방할 수 있는 [원클릭 QA 자가 진단 체크리스트]를 표(Table) 형식으로 만들어 줘.

[Condition]:
1. 각 에러 유형별로 [에러 이름], [대표적인 실수 원인], [브라우저가 띄우는 빨간 문장 예시], [1초 해결 비결] 4개 열로 정리해 줘.
2. 특히 변수명 철자 오타, 정의되지 않은 객체 프로퍼티 접근(undefined), 괄호 짝 불일치를 반드시 다뤄 줘.
3. 마지막에 개발자가 실시간으로 실수를 감지할 수 있도록 돕는 추천 도구(VS Code ESLint 확장 프로그램, TypeScript 소개)를 2줄로 요약해 줘.`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span>최신 AI의 소환 마법</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    3대 에러의 원인과 해결법을 깔끔한 비교 표로 정리하여, 초보자가 코드를 완성한 후 즉시 대조해 볼 수 있는 치트시트를 완성해 줍니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span>컴퓨터 과학 비밀</span>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    현대 빅테크 기업은 사람이 일일이 눈으로 에러를 찾는 대신, ESLint와 정적 타입 검사기(TypeScript)를 통해 코드 작성 즉시 빨간 밑줄로 버그를 차단합니다.
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
                <span>이전: Stage 2 버그 사냥 실습</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                <div className="flex items-center gap-2 text-rose-400">
                  <Search className="w-4 h-4" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 10강 버그 사냥꾼 배틀에서 사용된 실제 공식 컴퓨터 과학 / QA 테스팅 표준 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                {/* 용어 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>👣</span>
                      <span>스택 트레이스</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Stack Trace / 에러가 터지기까지 거쳐온 함수의 발자국</span>
                  </div>
                  <p className="text-sm text-rose-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 모래밭에 찍힌 범인의 발자국! 함수가 어디서 어디로 불려 갔는지 보여주는 지도.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 프로그램 오류 발생 시점까지 호출된 함수들의 계층적 역추적 목록으로, 정확한 파일 경로와 줄 번호를 제공합니다.
                  </p>
                </div>

                {/* 용어 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>런타임 에러 vs 컴파일 에러</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Runtime vs Compile / 실행 전 잡히는 버그와 실행 중 터지는 버그</span>
                  </div>
                  <p className="text-sm text-rose-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 요리책 인쇄 전 찾은 오타(컴파일) vs 요리하다 냄비 태운 실수(런타임)!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 빌드 시점에 문법 규칙으로 잡히는 에러와, 코드가 브라우저에서 실제 실행되는 도중에 발생하는 예외 상황의 차이.
                  </p>
                </div>

                {/* 용어 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>📐</span>
                      <span>Given-When-Then 공식</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">BDD Pattern / 사전조건·실행·검증의 3단계 테스팅 표준</span>
                  </div>
                  <p className="text-sm text-rose-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> "어떤 상황에서(Given), 무슨 버튼을 눌렀더니(When), 이런 결과가 나와야 한다(Then)!"의 3단계 규칙.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 행위 주도 개발(BDD)에서 테스트 케이스 및 버그 재현 시나리오를 기술하는 전 세계 표준 템플릿.
                  </p>
                </div>

                {/* 용어 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>방어적 프로그래밍</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Defensive Programming / 잘못된 입력에도 죽지 않는 안전벨트</span>
                  </div>
                  <p className="text-sm text-rose-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 자동차를 탈 때 안전벨트와 에어백을 미리 준비해 충돌 사고를 막는 것!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 잘못된 입력이나 null 값, 경계값 초과가 발생하더라도 프로그램이 다운되지 않도록 가드 절을 사전에 배치하는 기법.
                  </p>
                </div>

                {/* 용어 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 md:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🔍</span>
                      <span>린터 & 정적 분석</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Linter & Static Analysis / 코드를 쓰자마자 빨간 밑줄로 오타를 잡아주는 AI 조수</span>
                  </div>
                  <p className="text-sm text-rose-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 글을 쓸 때 맞춤법이 틀리면 즉시 빨간 물결선을 그어주는 친절한 국어 선생님!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 프로그램을 직접 실행하지 않고도 소스 코드의 문법 오류, 스타일 위반, 잠재적 버그를 자동으로 탐지해 주는 도구(예: ESLint).
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
                        1. 브라우저 개발자 도구(F12) 콘솔에서 빨간 에러 메시지와 발생 줄 번호(
                        <span className="font-mono text-rose-600 font-bold">Line Number</span>
                        )를 확인하는 방법을 익혔나요?
                      </>
                    )
                  },
                  {
                    num: 2,
                    label: (
                      <>
                        2. 자바스크립트의 3대 단골 에러인{' '}
                        <span className="font-mono text-rose-600 font-bold">SyntaxError</span>,{' '}
                        <span className="font-mono text-rose-600 font-bold">ReferenceError</span>,{' '}
                        <span className="font-mono text-rose-600 font-bold">TypeError</span>
                        의 발생 원인을 구분할 수 있나요?
                      </>
                    )
                  },
                  {
                    num: 3,
                    label: (
                      <>
                        3. 전 세계 QA 엔지니어들이 버그를 기술할 때 사용하는{' '}
                        <span className="font-mono text-rose-600 font-bold">Given-When-Then</span>{' '}
                        3단계 작성 공식을 이해했나요?
                      </>
                    )
                  },
                  {
                    num: 4,
                    label: (
                      <>
                        4. 가상 버그 사냥꾼 콘솔에서 시나리오별 버그를 발생시키고, 핫픽스 패치 코드로 오류를 해결해 보았나요?
                      </>
                    )
                  },
                  {
                    num: 5,
                    label: (
                      <>
                        5. 최신 AI에게 스택 트레이스 전문과 Given-When-Then 리포트를 제공하여 정확한 수정 코드를 소환하는 퀘스트를 성공시켰나요?
                      </>
                    )
                  },
                  {
                    num: 6,
                    label: (
                      <>
                        6. 잘못된 값이 들어와도 프로그램이 다운되지 않도록 예외를 방어하는{' '}
                        <span className="font-mono text-rose-600 font-bold">방어적 프로그래밍(Defensive Programming)</span>
                        의 가치를 기억하나요?
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
                      className="w-4 h-4 mt-1 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">{item.label}</span>
                  </label>
                ))}
              </div>
            </article>

            {/* 3. [100% 완주 축하 & 11강 잠금 해제 다크 펄스 카드] (8강 표준) */}
            {isAllComplete && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">
                      버그 사냥꾼 배틀 & 10강 완주 달성을 축하합니다! 🐞✨
                    </h4>
                    <p className="text-sm text-slate-300">
                      6가지 점검 항목을 모두 통과하여 3대 콘솔 에러와 Given-When-Then QA 디버깅 기법을 완전히 정복했습니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 3 · 11강: 도미노처럼 무너지지 마라! AI 코드 업데이트와 안전한 회귀 테스트</p>
                  </div>
                  <a
                    href="../11-regression-test/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>11강으로 즉시 이동</span>
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
          <p>AI·코딩 24강 장기 교육과정 · 시즌 3 QA 테스팅 & 디버거</p>
          <div className="flex items-center gap-4">
            <a href="../../index.html" className="hover:text-slate-800 transition-colors">과정 홈</a>
            <span>·</span>
            <a href="../09-mini-project/index.html" className="hover:text-slate-800 transition-colors">9강 웹 게임</a>
            <span>·</span>
            <a href="../11-regression-test/index.html" className="hover:text-slate-800 transition-colors">11강 회귀 테스트</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson10;
