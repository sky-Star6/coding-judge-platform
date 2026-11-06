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
  Bug,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Terminal,
  FileCode,
  BookOpen,
  AlertCircle,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 10강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'battle' | 'builder' | 'checklist';
export type ScenarioKey = 'a' | 'b' | 'c';

export interface Lesson10Props {
  onComplete?: () => void;
}

export const Lesson10: React.FC<Lesson10Props> = ({ onComplete }) => {
  // ----------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ----------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('battle');
  const [scenario, setScenario] = useState<ScenarioKey>('a');
  const [isErrorTriggered, setIsErrorTriggered] = useState<boolean>(false);
  const [battleScore, setBattleScore] = useState<number>(0);
  const [patchFeedback, setPatchFeedback] = useState<{ isSuccess: boolean; msg: string } | null>(null);
  const [virtualConsoleLogs, setVirtualConsoleLogs] = useState<Array<{ type: 'info' | 'error' | 'success'; text: string }>>([
    { type: 'info', text: '> 콘솔 준비 완료. 상단 시나리오를 고르고 [버그 유발 실행]을 누르세요.' }
  ]);

  // 프롬프트 빌더 폼 상태
  const [builderGiven, setBuilderGiven] = useState<string>('별똥별 피하기 게임 시작 화면에서 우주선이 대기 중일 때');
  const [builderWhen, setBuilderWhen] = useState<string>('키보드 오른쪽 화살표 키를 3번 연속 꾹 눌렀을 때');
  const [builderThen, setBuilderThen] = useState<string>('TypeError: Cannot read properties of null (game.js:24)');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false);

  // 퀴즈 상태
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // 회고 폼 상태
  const [retroText, setRetroText] = useState<string>('');
  const [isRetroSaved, setIsRetroSaved] = useState<boolean>(false);

  // 체크리스트 6문항 상태
  const [checklist, setChecklist] = useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
    c6: false,
  });

  // 복사 피드백 키
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ----------------------------------------------------------------------------
  // 시나리오 데이터셋
  // ----------------------------------------------------------------------------
  const scenarios = {
    a: {
      title: 'A. 오타 변수 참조 에러',
      code: `// game.js (Line 14)\nfunction addScore() {\n  socre += 10; // 💥 변수명 오타!\n  updateDisplay();\n}`,
      error: `Uncaught ReferenceError: socre is not defined\n    at addScore (game.js:14:3)\n    at HTMLButtonElement.onclick (index.html:42:15)`,
      options: [
        '1. score += 10; (올바른 변수명으로 교체)',
        '2. // socre += 10; (코드를 통째로 주석 처리)',
        '3. let socre = 0; (오타 변수를 새로 선언)'
      ],
      correct: 0,
      tip: '정답입니다! 선언되지 않은 socre 오타를 원래 의도했던 score 변수명으로 교체하는 것이 가장 안전하고 올바른 핫픽스입니다.'
    },
    b: {
      title: 'B. null 객체 접근 에러',
      code: `// app.js (Line 28)\nconst btn = document.getElementById('start-butn');\nbtn.addEventListener('click', startGame);\n// 💥 HTML id='start-btn'과 불일치!`,
      error: `Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')\n    at app.js:28:5`,
      options: [
        "1. document.getElementById('start-btn') (HTML id와 일치시킴)",
        '2. btn = {}; (가짜 객체를 강제로 대입)',
        '3. window.location.reload(); (페이지 새로고침)'
      ],
      correct: 0,
      tip: "정답입니다! HTML의 실제 id='start-btn'과 일치하도록 자바스크립트의 선택자 철자를 맞추어주면 null 대신 올바른 요소를 찾아냅니다."
    },
    c: {
      title: 'C. 닫는 괄호 누락 문법 에러',
      code: `// engine.js (Line 52)\nfunction checkCollision(p, s) {\n  if (p.x < s.x + s.w && p.x + p.w > s.x) {\n    return true;\n  // 💥 닫는 중괄호 '}' 누락!`,
      error: `Uncaught SyntaxError: Unexpected end of input (missing '}' after function body)\n    at engine.js:55:1`,
      options: [
        '1. 함수 끝에 닫는 중괄호 } 를 추가하여 문법 짝 맞추기',
        '2. function 키워드를 지워버리기',
        '3. if 문 전체를 삭제하기'
      ],
      correct: 0,
      tip: '정답입니다! 열린 중괄호 { 의 짝이 맞지 않아 파서가 멈춘 상태이므로, 닫는 중괄호 } 를 채워 넣어야 문법이 정상화됩니다.'
    }
  };

  // 퀴즈 데이터셋
  const quizData = [
    {
      q: "변수 이름에 철자 오타가 났을 때 발생하는 자바스크립트 에러의 이름은 무엇일까요?",
      options: ["1. ReferenceError (참조 에러)", "2. SyntaxError (문법 에러)", "3. NetWorkError (통신 에러)"],
      ans: 0,
      tip: "정답입니다! 선언되지 않은 변수를 호출하면 컴퓨터가 '그런 이름의 상자는 태어난 적이 없다'며 ReferenceError를 던집니다."
    },
    {
      q: "브라우저에서 빨간 에러 메시지와 콘솔 창을 열 수 있는 만능 단축키는?",
      options: ["1. F12 (또는 Ctrl+Shift+I)", "2. Ctrl+S", "3. Alt+F4"],
      ans: 0,
      tip: "정답입니다! F12 키를 누르면 크롬 및 엣지 브라우저의 개발자 도구 콘솔이 즉시 열려 에러 보물지도를 확인할 수 있습니다."
    },
    {
      q: "오류 상황을 '준비 - 행동 - 결과'로 정리하여 AI에게 정밀하게 질문하는 디버깅 기법의 이름은?",
      options: ["1. Given-When-Then", "2. Copy-And-Paste", "3. Click-And-Wait"],
      ans: 0,
      tip: "정답입니다! Given-When-Then 형식을 갖추어 AI에게 질문하면 할루시네이션 없이 단 한 번에 정밀한 핫픽스를 도출할 수 있습니다."
    }
  ];

  // ----------------------------------------------------------------------------
  // 로컬 스토리지 복원
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const savedCheck = localStorage.getItem('lesson_10_checklist');
    if (savedCheck) {
      try {
        setChecklist(JSON.parse(savedCheck));
      } catch (e) {
        console.error(e);
      }
    }

    const savedRetro = localStorage.getItem('lesson_10_retro');
    if (savedRetro) {
      setRetroText(savedRetro);
      setIsRetroSaved(true);
    }
  }, []);

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const isAllCompleted = completedChecklistCount === 6;

  const toggleCheckItem = (key: keyof typeof checklist) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem('lesson_10_checklist', JSON.stringify(next));
  };

  const handleRetroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRetroText(val);
    localStorage.setItem('lesson_10_retro', val);
    setIsRetroSaved(true);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // 버그 유발 실행
  const triggerBug = () => {
    setIsErrorTriggered(true);
    const sc = scenarios[scenario];
    setVirtualConsoleLogs(prev => [
      ...prev,
      { type: 'info', text: '> 게임 실행 중...' },
      { type: 'error', text: `🚨 ${sc.error}` }
    ]);
  };

  // 핫픽스 적용
  const handleApplyHotfix = (idx: number) => {
    if (!isErrorTriggered) {
      alert('먼저 [🚨 버그 유발 실행] 버튼을 눌러 에러를 확인해보세요!');
      return;
    }

    const sc = scenarios[scenario];
    if (idx === sc.correct) {
      setPatchFeedback({ isSuccess: true, msg: sc.tip });
      setBattleScore(prev => prev + 100);
      setVirtualConsoleLogs(prev => [
        ...prev,
        { type: 'success', text: '✅ [SUCCESS] 핫픽스 패치 성공! 에러가 사라지고 게임이 정상 작동합니다. (+100점)' }
      ]);
    } else {
      setPatchFeedback({
        isSuccess: false,
        msg: `💥 가짜 수정 경고! 코드를 무작정 지우거나 엉뚱하게 대입하면 기능이 완전히 망가집니다. ${sc.options[sc.correct]}를 선택해보세요.`
      });
    }
  };

  // 프롬프트 빌더 생성
  const handleGeneratePrompt = () => {
    const text = `[버그 리포트 & 디버깅 요청]
- 상황 (Given): ${builderGiven}
- 행동 (When): ${builderWhen}
- 발생 오류 (Then): ${builderThen}

요청 사항:
위 오류가 발생하는 원인을 주니어 개발자 눈높이로 설명해주고, 기존 다른 기능이 고장 나지 않는 안전한 최소 단위의 핫픽스(수정 코드)를 작성해줘.`;
    setGeneratedPrompt(text);
  };

  const handleCopyBuiltPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 1500);
    }
  };

  const handleQuizAnswer = (idx: number) => {
    setSelectedQuizOption(idx);
    const item = quizData[quizIndex];
    if (idx === item.ans) {
      setQuizFeedback({ isCorrect: true, text: item.tip });
    } else {
      setQuizFeedback({
        isCorrect: false,
        text: `아쉬워요! 다시 생각해보세요. ${item.options[item.ans]}이 정답입니다.`
      });
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    setQuizFeedback(null);
    setQuizIndex(prev => (prev + 1) % quizData.length);
  };

  // ----------------------------------------------------------------------------
  // UI 렌더링
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* --------------------------------------------------------------------- */}
      {/* [상단 GNB] 과정 홈 | 시즌 3 · 10강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* --------------------------------------------------------------------- */}
            <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-[1720px] h-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <a
                href="../../index.html"
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 font-bold"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span className="text-base font-bold">홈</span>
              </a>
              <span className="text-slate-300">/</span>
              <a href="../09-mini-project/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">9강 웹 미니 프로젝트</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200/60 whitespace-nowrap">10강 버그 사냥꾼 배틀</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span id="header-progress-text" className="text-rose-600 font-mono font-bold text-xs">{completedChecklistCount}/6 ({Math.round((completedChecklistCount / 6) * 100)}%)</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  id="header-progress-fill"
                  className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(completedChecklistCount / 6) * 100}%` }}
                ></div>
              </div>

              {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage1'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>미션 브리핑</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage2'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>3대 단골 에러</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage3'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>Given-When-Then</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage4'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>버그 연구소</span>
                </button>
              </nav>
            </div>

            <div id="header-unlock-badge-wrapper">
              {!isAllCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>11강 잠김</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse whitespace-nowrap">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>11강 언락 ✨</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 스플릿 뷰 (Split View) */}
      {/* --------------------------------------------------------------------- */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">

        {/* ------------------------------------------------------------------- */}
        {/* ■ 좌측 패널 (60% 폭) - 퀘스트 가이드 본문 (독립 슬라이드바) */}
        {/* ------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 미션 브리핑] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* ■ 히어로 섹션 */}
          <div className="bg-gradient-to-br from-rose-600 via-red-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-rose-100 border border-white/20 whitespace-nowrap">
                  <Bug className="w-3.5 h-3.5 text-rose-300" />
                  <span>시즌 3 : AI 실전 디버깅 &amp; 코드 품질</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-400 text-slate-950 whitespace-nowrap">
                  <Search className="w-3 h-3 text-slate-950" />
                  <span>버그 사냥꾼 출동!</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                빨간 에러는 보물지도! AI 코딩 도구와 버그 사냥꾼 배틀
              </h2>

              <p className="text-sm text-rose-100/90 leading-relaxed max-w-2xl font-normal">
                훌륭한 프로그래머와 초보자의 진짜 차이는 <strong>"오류를 만났을 때 당황하지 않는 힘"</strong>에서 결정됩니다! 브라우저 개발자 도구(F12)의 붉은 콘솔 오류를 독해하고, "안 돼요 고쳐줘" 대신 <strong>Given-When-Then 재현 조건</strong>과 <strong>에러 스택</strong>을 제공하여 AI와 함께 버그를 체포하는 법을 배웁니다.
              </p>

              {/* 4대 메타 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-rose-200 font-semibold block leading-tight whitespace-nowrap">핵심 마법</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">F12 콘솔 &amp; 3대 에러 독해</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-rose-200 font-semibold block leading-tight whitespace-nowrap">제작 산출물</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">Given-When-Then 핫픽스</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-rose-200 font-semibold block leading-tight whitespace-nowrap">주의 함정</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">코드 지워버리는 가짜 수정</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-rose-200 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">약 45분 (체험 &amp; 실습)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* ■ STAGE 1: 미션 브리핑 */}
          {/* ----------------------------------------------------------------- */}

              <article id="stage1" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                미션 브리핑: 빨간색 에러 메시지는 컴퓨터가 보낸 비밀 보물지도!
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              코딩을 하다가 화면에 아무것도 안 뜨거나 게임이 멈추면 가슴이 철렁 내려앉나요?<br />
              걱정하지 마세요! 컴퓨터는 절대로 우리를 골탕 먹이려고 멈추지 않습니다. 대신 키보드의 <strong>[F12]</strong> 버튼을 누르면 열리는 <strong>개발자 도구 콘솔(Console)</strong> 창에 <strong>"몇 번째 줄에 어떤 글자가 잘못되었는지"</strong> 아주 정확하게 적힌 비밀 편지를 남겨둡니다.
            </p>

            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/70 to-orange-50/50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
                <Target className="w-4 h-4 text-rose-600" />
                <span>💡 주니어 명탐정의 돋보기: "에러 메시지를 읽으면 답이 보인다!"</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                초보자는 화면이 멈추면 "어? 왜 안 되지?" 하고 코드를 아무 데나 무작정 지우지만, 진짜 멋진 개발자는 콘솔 창을 열어 에러 이름과 <strong>줄 번호(Line Number)</strong>를 먼저 확인합니다. 빨간 에러 메시지는 오류를 치료해달라는 컴퓨터의 친절한 보물지도입니다!
              </p>
            </div>

            {/* 루브릭 표 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">평가 영역</th>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">기본 수준 (Lv.1)</th>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">우수 수준 (Lv.2)</th>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">명탐정 수준 (Lv.3)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-rose-700 whitespace-nowrap">콘솔 에러 독해력</td>
                    <td className="p-2.5 sm:p-3">에러가 난 줄 번호(Line)를 찾아냄</td>
                    <td className="p-2.5 sm:p-3">3대 에러(Reference/Type/Syntax)의 원인을 구별</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 whitespace-nowrap">호출 스택 역추적</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-orange-700 whitespace-nowrap">AI 디버깅 프롬프트</td>
                    <td className="p-2.5 sm:p-3">"고쳐줘" 대신 에러 글자를 복사해 질문</td>
                    <td className="p-2.5 sm:p-3">에러 발생 코드 5~10줄을 함께 전달</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 whitespace-nowrap">Given-When-Then 형식 질문</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-emerald-700 whitespace-nowrap">핫픽스 안전 검증</td>
                    <td className="p-2.5 sm:p-3">수정 코드를 붙여넣어 에러 빨간 줄 제거</td>
                    <td className="p-2.5 sm:p-3">console.log로 변수 상태값 직접 검증</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">무결점 버그 체포 완료</span></td>
                  </tr>
                </tbody>
              </table>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 3대 단골 에러</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 3대 단골 에러] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article id="stage2" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                핵심 개념: 자바스크립트 3대 단골 에러 해부
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              개발자들이 매일 만나는 에러의 90%는 딱 3가지 가족입니다. 이 3총사의 얼굴만 익혀두면 어떤 버그도 무섭지 않습니다!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. ReferenceError */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs sm:text-sm mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>1. ReferenceError (참조)</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    <strong>"그런 이름의 상자는 태어난 적이 없어요!"</strong> 변수 이름에 오타가 났거나(예: <code>socre</code>), 만들기 전에 먼저 불렀을 때 발생합니다.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  socre is not defined
                </div>
              </div>

              {/* 2. TypeError */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs sm:text-sm mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>2. TypeError (타입/자료형)</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    <strong>"빈 껍데기(null)에게 일을 시켰어요!"</strong> HTML 아이디를 틀려서 요소를 못 찾았거나, 숫자를 함수처럼 <code>score()</code>로 불렀을 때 터집니다.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  Cannot read properties of null
                </div>
              </div>

              {/* 3. SyntaxError */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs sm:text-sm mb-1">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    <span>3. SyntaxError (문법 구문)</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    <strong>"자바스크립트 문법 철자가 틀렸어요!"</strong> 닫는 중괄호(<code>&#125;</code>), 따옴표(<code>"</code>), 쉼표(<code>,</code>)를 빠뜨려서 컴퓨터가 읽기를 멈춘 상태입니다.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-100">
                  Unexpected token '&#125;'
                </div>
              </div>
            </div>
          </article>

              {/* 우측 버그 배틀 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [버그 배틀]에서 빨간 에러를 사냥하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    TypeError, ReferenceError, SyntaxError 3대 단골 에러 몬스터를 직접 격퇴할 차례입니다! 우측 콘솔의 <strong>[버그 배틀]</strong>에서 고장 난 코드 3문항의 원인을 진단하고 수정 버튼을 눌러 버그를 물리쳐보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('battle')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [버그 배틀] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 미션 브리핑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 Given-When-Then</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: Given-When-Then] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article id="stage3" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                단계별 조립 실습: Given-When-Then 3단계 마법 주문
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              AI 코딩 도구에게 "게임이 안 돼요 고쳐주세요"라고만 하면 AI도 눈뜬장님이 되어 엉뚱한 코드를 지어냅니다(할루시네이션).<br />
              대신 <strong>상황(Given) - 행동(When) - 결과(Then)</strong> 3단계로 정리해서 에러 메시지와 함께 전달하면 단 3초 만에 완벽한 정답 코드를 얻을 수 있습니다!
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white whitespace-nowrap mt-0.5">Given (상황)</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>"어떤 상태에서?"</strong> ➔ 별똥별 피하기 게임 시작 화면에서 우주선이 대기 중일 때
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white whitespace-nowrap mt-0.5">When (행동)</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>"무슨 버튼을 눌렀을 때?"</strong> ➔ 키보드 오른쪽 화살표 키를 3번 연속 꾹 눌렀을 때
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white whitespace-nowrap mt-0.5">Then (결과)</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>"어떤 에러가 터졌는가?"</strong> ➔ F12 콘솔에 <code>TypeError: Cannot read properties of null (game.js:24)</code>가 뜨면서 우주선이 멈춤
                </p>
              </div>
            </div>

            {/* AI 코딩 프롬프트 원클릭 복사 카드 */}
            <div className="space-y-2 pt-2">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-rose-600" />
                <span>원클릭 AI 디버깅 프롬프트 (복사해서 AI 도우미에게 질문해보세요!)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-rose-700 block">프롬프트 1 : 오타 참조 에러 체포</span>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1">
                      "아래 자바스크립트 코드에서 'ReferenceError: socre is not defined'가 발생합니다. 오타가 난 변수 위치를 찾아서 올바르게 수정한 코드 블록을 작성해줘."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("아래 자바스크립트 코드에서 'ReferenceError: socre is not defined'가 발생합니다. 오타가 난 변수 위치를 찾아서 올바르게 수정한 코드 블록을 작성해줘.", "p1")}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'p1' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-700 block">프롬프트 2 : null 객체 접근 에러 치료</span>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1">
                      "버튼 클릭 시 'TypeError: Cannot read properties of null' 에러가 납니다. document.getElementById의 아이디가 HTML과 일치하는지 점검하고 안전한 핫픽스를 제공해줘."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("버튼 클릭 시 'TypeError: Cannot read properties of null' 에러가 납니다. document.getElementById의 아이디가 HTML과 일치하는지 점검하고 안전한 핫픽스를 제공해줘.", "p2")}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'p2' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </article>

              {/* 우측 프롬프트 & 퀴즈 연동 알림 카드 */}
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
                      사냥을 마쳤다면 우측 [프롬프트 & 퀴즈]에서 디버깅 주문서를 작성하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    AI에게 버그 수정을 요청할 때 필요한 Given-When-Then 3원칙을 직접 조합해 보세요! 우측 콘솔의 <strong>[프롬프트 & 퀴즈]</strong> 탭에서 상황, 재현 경로, 기대 결과를 조립하여 완벽한 버그 리포트 카드를 발급받으세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('builder')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [프롬프트 & 퀴즈] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 3대 단골 에러
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 버그 연구소</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 버그 연구소] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article id="stage4" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                버그 연구소: "가짜 수정"의 함정에 빠지지 않는 법 &amp; 자가 회고
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              버그를 고칠 때 가장 위험한 실수는 무엇일까요? 바로 에러 빨간 줄만 없애려고 <strong>필요한 코드 자체를 통째로 지워버리는 가짜 수정</strong>입니다!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>함정 1: 무작정 코드 삭제하기</span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  에러가 난 줄을 그냥 지워버리면 빨간 글씨는 사라지지만, 게임의 점수 계산이나 이동 기능 자체가 영원히 멈춰버립니다!
                </p>
                <div className="p-2 bg-white rounded-lg border border-red-200 text-[11px] font-mono text-emerald-700 leading-snug">
                  💡 <strong>정답:</strong> 왜 컴퓨터가 못 찾았는지(오타, ID 불일치) 원인을 밝혀서 글자를 고쳐야 합니다.
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>함정 2: 고친 후 테스트 건너뛰기</span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  하나를 고치다가 다른 쪽 코드를 건드려 새로운 버그(사이드 이펙트)가 생길 수 있습니다.
                </p>
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-[11px] font-mono text-emerald-700 leading-snug">
                  💡 <strong>정답:</strong> 수정 후 다시 버튼을 누르고 게임을 10초간 플레이하며 정상 작동을 확인합니다.
                </div>
              </div>
            </div>

            {/* 자가 회고 입력 폼 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <h4 className="text-base font-bold text-slate-900">
                    나만의 버그 사냥 회고 &amp; 가장 기억에 남는 에러
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  {isRetroSaved ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-600 font-bold">자동 저장됨</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span>작성 대기 중</span>
                    </>
                  )}
                </span>
              </div>

              <textarea
                value={retroText}
                onChange={handleRetroChange}
                rows={3}
                placeholder="예시: 코딩할 때 철자 하나 틀려서 ReferenceError가 자주 났는데, F12 콘솔 줄 번호를 보고 바로 찾는 법을 배워서 속이 시원했습니다!"
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 11강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 11강을 여세요!</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    오늘 실습한 6대 디버깅 탐정 수사법(콘솔 로그, 에러 메시지 역추적, 핫픽스 패치)을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 11강(도미노 방지 회귀 테스트)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 11강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 Given-When-Then
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
                  JUNIOR DEVELOPER GLOSSARY · 10강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 시니어 엔지니어들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 디버깅 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-amber-400" />
                      1. 디버깅
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Debugging (Bug Fixing)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">소프트웨어 공학</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "프로그램 속에 몰래 숨어든 벌레(Bug)를 명탐정 돋보기로 찾아내어 안전하게 고치는 과정!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 소프트웨어 소스 코드의 오류나 결함(Bug)을 찾아내고, 그 원인을 분석하여 시스템이 올바르게 동작하도록 수정하는 일련의 문제 해결 프로세스입니다.
                </p>
              </div>
              {/* 용어 2: 개발자 도구 콘솔 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-sky-400" />
                      2. 개발자 도구 콘솔
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Browser DevTools Console (F12)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">진단/도구</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "컴퓨터가 아플 때 어디가 어떻게 아픈지 의사 선생님께 일러바치는 청진기 화면!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 브라우저에서 실행 중인 웹 애플리케이션의 상태, 로그 출력(console.log), 자바스크립트 런타임 에러를 실시간으로 모니터링하고 코드를 즉석에서 평가할 수 있는 진단 터미널입니다.
                </p>
              </div>
              {/* 용어 3: 참조 에러 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-emerald-400" />
                      3. 참조 에러
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: ReferenceError</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">런타임 에러</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "이름표를 만들어준 적 없는 유령 친구를 심부름 보내려고 할 때 '그런 친구 없어요!' 하고 깜짝 놀라는 에러!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 현재 스코프(Scope)에 선언되지 않았거나 유효하지 않은 식별자(변수나 함수 이름)를 참조하려고 시도할 때 자바스크립트 엔진이 던지는 표준 런타임 오류입니다.
                </p>
              </div>
              {/* 용어 4: 타입 에러 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-purple-400" />
                      4. 타입 에러
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: TypeError</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">런타임 에러</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "텅 빈 깡통(null)에게 '안에 든 사탕 꺼내줘!' 하고 불가능한 명령을 내렸을 때 당황하는 에러!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 값이 기대하는 데이터 타입이 아니거나, null 또는 undefined와 같은 비객체 속성에 접근·호출하려 할 때 발생하는 데이터 타입 불일치 런타임 오류입니다.
                </p>
              </div>
              {/* 용어 5: 콜 스택 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-rose-400" />
                      5. 콜 스택
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 콜 스택 (Call Stack / Stack Trace)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">실행 엔진</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "명탐정이 사건 현장까지 어떤 골목길을 거쳐 왔는지 적혀 있는 비밀 지도 메모장!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 프로그램이 어떤 함수들을 순서대로 호출하여 현재 지점(또는 에러 지점)에 도달했는지를 후입선출(LIFO) 스택 구조로 추적하여 보여주는 호출 실행 기록입니다.
                </p>
              </div>
              {/* 용어 6: 핫픽스 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-teal-400" />
                      6. 핫픽스
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 핫픽스 (Hotfix / Quick Patch)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">배포/유지보수</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "경기 중에 펑크 난 자전거 바퀴를 번개처럼 빠르게 때워 다시 달리게 만드는 긴급 치료 반창고!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 소프트웨어에서 치명적인 버그가 발견되었을 때, 긴급하게 버그만을 안전하게 수정하여 즉시 배포하는 패치 작업입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* ------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭) - 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* ------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">

          {/* 3단 탭 네비게이션 */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveRightTab('battle')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'battle'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>버그 배틀</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('builder')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'builder'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>프롬프트 &amp; 퀴즈</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>체크리스트</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🐛 버그 배틀 시뮬레이터 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'battle' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 shadow-md space-y-3">
                {/* 헤더 */}
                <div className="flex items-center justify-between bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-indigo-200 font-medium pl-2">Console (F12)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-400 font-mono font-bold">배틀 점수:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                      {battleScore}점
                    </span>
                  </div>
                </div>

                {/* 콘솔 출력 화면 */}
                <div className="bg-black rounded-xl p-3.5 border border-slate-800 min-h-[170px] max-h-[190px] overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar">
                  {virtualConsoleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.type === 'error'
                          ? 'p-2 rounded bg-rose-950/80 border-l-4 border-rose-500 text-rose-300 whitespace-pre-wrap leading-relaxed'
                          : log.type === 'success'
                          ? 'p-2 rounded bg-emerald-950/80 border-l-4 border-emerald-500 text-emerald-300 leading-relaxed'
                          : 'text-slate-400'
                      }
                    >
                      {log.text}
                    </div>
                  ))}
                </div>

                {/* 시나리오 버튼 */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>사냥할 버그 시나리오:</span>
                    <span className="font-mono text-rose-400 text-[10.5px]">
                      {scenarios[scenario].title}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['a', 'b', 'c'] as ScenarioKey[]).map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          setScenario(k);
                          setIsErrorTriggered(false);
                          setPatchFeedback(null);
                          setVirtualConsoleLogs([
                            { type: 'info', text: `> 시나리오 [${scenarios[k].title}] 선택됨. [버그 유발 실행]을 누르세요.` }
                          ]);
                        }}
                        className={`py-2 px-1.5 rounded-xl font-bold text-center transition-all cursor-pointer ${
                          scenario === k
                            ? 'bg-rose-600 border border-rose-500 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                        }`}
                      >
                        {k === 'a' ? '버그 A (오타)' : k === 'b' ? '버그 B (null)' : '버그 C (문법)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 버그 유발 실행 버튼 */}
                <button
                  type="button"
                  onClick={triggerBug}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>🚨 버그 유발 실행 (에러 발생시키기)</span>
                </button>
              </div>

              {/* 핫픽스 선택 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Terminal className="w-4 h-4 text-rose-600" />
                    <span>에러 코드 진단 &amp; 핫픽스 패치</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isErrorTriggered ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {isErrorTriggered ? '🚨 에러 검출됨' : '버그 유발 대기 중'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 block">발생 코드 확인:</span>
                  <pre className="p-2.5 rounded-xl bg-slate-900 text-rose-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {scenarios[scenario].code}
                  </pre>
                </div>

                {/* 핫픽스 선택지 */}
                <div className="space-y-1.5 pt-1">
                  {scenarios[scenario].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyHotfix(idx)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-mono text-slate-700 text-left transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {patchFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-normal leading-relaxed ${
                      patchFeedback.isSuccess
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border border-rose-200 text-rose-900'
                    }`}
                  >
                    <strong>{patchFeedback.isSuccess ? '🎉 버그 체포 성공!' : '💥 가짜 수정 경고!'}</strong>{' '}
                    {patchFeedback.msg}
                  </div>
                )}
                {/* 💡 버그 사냥꾼 4대 골든 룰 요약 카드 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>버그 사냥꾼 4대 골든 룰 요약</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </span>
                      <div>
                        <strong className="text-white block">빨간 에러를 두려워하지 말 것</strong>
                        <span className="text-slate-400">에러는 프로그램이 친절하게 건네는 수리 안내장이자 버그 지도예요.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </span>
                      <div>
                        <strong className="text-white block">에러 이름과 줄 번호(Line) 먼저 확인</strong>
                        <span className="text-slate-400">
                          <code className="text-sky-300">game.js:14</code> 처럼 범인이 숨은 파일과 방 번호부터 빠르게 읽으세요.
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </span>
                      <div>
                        <strong className="text-white block">가짜 수정(코드 지우기) 절대 금지</strong>
                        <span className="text-slate-400">빨간 줄을 없애려고 코드를 통째로 삭제하면 게임이 아예 고장 나요.</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        4
                      </span>
                      <div>
                        <strong className="text-white block">AI에게는 3단계(Given-When-Then)로 제보</strong>
                        <span className="text-slate-400">상황, 내 행동, 에러 메시지를 함께 전해야 AI가 단번에 정답을 찾아냅니다.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 📝 프롬프트 빌더 & 퀴즈 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'builder' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <FileCode className="w-4 h-4 text-rose-600" />
                  <span>Given-When-Then AI 리포트 빌더</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">1. 상황 (Given):</label>
                    <input
                      type="text"
                      value={builderGiven}
                      onChange={e => setBuilderGiven(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">2. 행동 (When):</label>
                    <input
                      type="text"
                      value={builderWhen}
                      onChange={e => setBuilderWhen(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">3. 결과 (Then - 콘솔 에러):</label>
                    <input
                      type="text"
                      value={builderThen}
                      onChange={e => setBuilderThen(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>✨ AI 디버깅 프롬프트 생성하기</span>
                </button>

                {generatedPrompt && (
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-2 leading-relaxed">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                      <span>완성된 AI 질문문</span>
                      <button
                        type="button"
                        onClick={handleCopyBuiltPrompt}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold transition-all cursor-pointer"
                      >
                        {isPromptCopied ? '복사됨! ✨' : '복사하기'}
                      </button>
                    </div>
                    <p className="text-emerald-300 whitespace-pre-wrap">{generatedPrompt}</p>
                  </div>
                )}
              </div>

              {/* 퀴즈 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <HelpCircle className="w-4 h-4 text-rose-600" />
                    <span>디버깅 기초 상식 퀴즈</span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-600 font-mono">
                    문제 {quizIndex + 1} / {quizData.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <p className="text-base font-bold text-slate-800 leading-snug">
                    {quizData[quizIndex].q}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {quizData[quizIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuizAnswer(idx)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          selectedQuizOption === idx
                            ? 'border-rose-500 bg-rose-50 text-rose-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {quizFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-normal leading-relaxed ${
                        quizFeedback.isCorrect
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border border-rose-200 text-rose-900'
                      }`}
                    >
                      <strong>{quizFeedback.isCorrect ? '🎉 정답입니다!' : '아쉬워요!'}</strong>{' '}
                      {quizFeedback.text}
                    </div>
                  )}
                </div>

                {quizFeedback && (
                  <button
                    type="button"
                    onClick={handleNextQuiz}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  >
                    다음 문제 풀기 →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 📋 10강 자가 점검 (6문항 & 11강 언락) */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      10강 퀘스트 완주 자가 점검 (6문항)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-rose-600 font-mono">
                    {completedChecklistCount} / 6 완료 ({Math.round((completedChecklistCount / 6) * 100)}%)
                  </span>
                </div>

                {/* 게이지 바 */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${(completedChecklistCount / 6) * 100}%` }}
                  />
                </div>

                {/* 6문항 체크리스트 */}
                <div className="space-y-2 pt-1 text-xs" data-checklist-lesson="lesson_10">
                  {[
                    { key: 'c1', text: '1. F12 개발자 도구의 콘솔(Console) 창에서 빨간 에러 메시지와 줄 번호를 읽을 수 있나요?' },
                    { key: 'c2', text: '2. 변수 오타로 인한 ReferenceError와 빈 껍데기를 부른 TypeError의 차이를 이해했나요?' },
                    { key: 'c3', text: '3. 버그 상황을 명확하게 설명하는 Given - When - Then 3단계 구조를 익혔나요?' },
                    { key: 'c4', text: '4. AI에게 "안 돼요 고쳐줘" 대신 에러 전문과 코드 10줄을 제공하는 프롬프트를 작성해보았나요?' },
                    { key: 'c5', text: '5. 에러만 없애려고 멀쩡한 코드를 통째로 삭제하는 가짜 수정의 위험성을 배웠나요?' },
                    { key: 'c6', text: '6. 좌측 최하단의 [주니어 개발자를 위한 전문 용어 돋보기] 6단어를 끝까지 읽고 이해했나요?' },
                  ].map(item => {
                    const isChecked = checklist[item.key as keyof typeof checklist];
                    return (
                      <label
                        key={item.key}
                        onClick={() => toggleCheckItem(item.key as keyof typeof checklist)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-rose-300 bg-rose-50/70 text-rose-900 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="leading-snug">{item.text}</span>
                      </label>
                    );
                  })}
                </div>

                {!isAllCompleted ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 11강이 열립니다!</span>
                    <span className="font-bold text-slate-400">잠김 🔒</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 via-orange-50 to-emerald-50 border border-rose-300 space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
                      <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                      <span>축하합니다! 10강 버그 사냥 퀘스트 완주 성공!</span>
                    </div>
                    <p className="text-sm text-rose-950 leading-relaxed font-normal">
                      당신은 이제 콘솔 에러를 논리적으로 독해하고 완벽한 핫픽스를 도출하는 **주니어 AI 버그 사냥꾼**입니다!<br />
                      이제 다음 **11강(게임 난이도 조절과 회귀 테스트: 안전한 AI 코드 변경 &amp; Diff 검토)**으로 넘어가 코드가 고장 나지 않게 지키는 테스트 마스터가 되어봅시다!
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

export default Lesson10;
