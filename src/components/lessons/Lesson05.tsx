import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  BookOpen,
  MessageSquare,
  Eye,
  Plus,
  Globe,
  Sliders,
  Layout,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 5강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'editor' | 'prompt' | 'checklist';

export interface Lesson05Props {
  onComplete?: () => void;
}

export const Lesson05: React.FC<Lesson05Props> = ({ onComplete }) => {
  // ---------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('editor');

  // 프리셋 데이터
  const presets: Record<string, string> = {
    library: `<!-- 📚 고대 도서관 장면 1 -->
<h1>고대 도서관 3층</h1>

<div class="dialogue-box">
  <span class="name">마법사 루카:</span>
  <p>"쉿! 저 먼지 쌓인 서가 뒤에서 수상한 푸른빛이 새어 나오고 있어."</p>
</div>

<div class="choices">
  <button onclick="alert('푸른 책을 집어 들었습니다!')">📘 푸른 책을 집어 든다</button>
  <button onclick="alert('조용히 계단으로 물러섰습니다!')">🚪 살금살금 계단으로 도망친다</button>
</div>`,
    dragon: `<!-- 🐉 화염 드래곤의 둥지 -->
<h1>화염산 정상 분화구</h1>

<div class="dialogue-box">
  <span class="name">붉은 용 이그니스:</span>
  <p>"감히 내 황금 보물창고에 발을 들인 인간이 너로구나!"</p>
</div>

<div class="choices">
  <button onclick="alert('용감하게 방패를 들었습니다!')">🛡️ 방패를 들어 화염을 막는다</button>
  <button onclick="alert('주머니에서 반짝이는 보석을 꺼냈습니다!')">💎 반짝이는 보석을 던져 유혹한다</button>
</div>`,
    shop: `<!-- 🔮 밤도깨비의 비밀 만물상 -->
<h1>달빛 골목 비밀 상점</h1>

<div class="dialogue-box">
  <span class="name">상인 니코:</span>
  <p>"어서 오게, 꼬마 탐험가여! 오늘만 특별히 전설의 물약을 할인해 주지."</p>
</div>

<div class="choices">
  <button onclick="alert('체력 물약을 샀습니다!')">🧪 체력 물약 (금화 10닢)</button>
  <button onclick="alert('투명 망토를 구경했습니다!')">🧥 투명 망토 (금화 50닢)</button>
</div>`
  };

  const [activePreset, setActivePreset] = useState<string>('library');
  const [htmlCode, setHtmlCode] = useState<string>(presets.library);
  const [isHtmlCopied, setIsHtmlCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 미니 퀴즈 상태
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // 프롬프트 복사 토스트 상태
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // 주니어 개발자 코딩 수첩 (회고)
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

  // ---------------------------------------------------------------------------
  // 로컬 스토리지 연동 및 초기화
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const savedRetro = localStorage.getItem('lesson05_retro');
      if (savedRetro) {
        setRetro(JSON.parse(savedRetro));
      }
      const savedChecklist = localStorage.getItem('lesson05_checklist');
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
      localStorage.setItem('lesson05_retro', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChecklistToggle = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem('lesson05_checklist', JSON.stringify(updated));
      const count = Object.values(updated).filter(Boolean).length;
      if (count === 6) {
        localStorage.setItem('ai_lesson_05_completed', 'true');
        fetch('/api/ai/complete-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ lesson_id: 'lesson_05' })
        }).catch(() => {});
      } else {
        localStorage.removeItem('ai_lesson_05_completed');
      }
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

  // 코드 복사
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setIsHtmlCopied(true);
    setTimeout(() => {
      setIsHtmlCopied(false);
    }, 1500);
  };

  // 프리셋 로드
  const handleLoadPreset = (key: string) => {
    setActivePreset(key);
    setHtmlCode(presets[key] || '');
  };

  // 빠른 태그 삽입
  const handleInsertTag = (tag: string) => {
    let snippet = '';
    if (tag === 'h1') snippet = '<h1>새로운 장면 제목</h1>\n';
    else if (tag === 'p') snippet = '<p>"여기에 새로운 대사를 입력하세요."</p>\n';
    else if (tag === 'button') snippet = '<button onclick="alert(\'선택완료!\')">👉 새로운 선택지</button>\n';
    else if (tag === 'span') snippet = '<span class="name">캐릭터이름:</span> ';

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextCode = htmlCode.substring(0, start) + snippet + htmlCode.substring(end);
      setHtmlCode(nextCode);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionEnd = start + snippet.length;
      }, 0);
    } else {
      setHtmlCode(prev => prev + '\n' + snippet);
    }
  };

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
                <span className="text-base font-bold">홈</span>
              </a>
              <span className="text-slate-300">/</span>
              <a href="../04-balance-patch/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">4강 밸런스 패치</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 whitespace-nowrap">5강 HTML 대사창</span>
            </nav>
          </div>

          {/* 우측: 5강 완료 게이지 & 4단계 퀘스트 스텝퍼 & 6강 언락 뱃지 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span className="text-xs text-indigo-600 font-bold font-mono">{completedChecklistCount}/6 ({checklistPercent}%)</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" role="tablist">
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeStage === 'stage2'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>레고 태그</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage3')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeStage === 'stage3'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>코드 조립</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => handleStageChange('stage4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeStage === 'stage4'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>미션 회고</span>
                </button>
              </nav>
            </div>

            <div id="header-unlock-badge-wrapper">
              {isAllCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 whitespace-nowrap animate-pulse">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>6강 언락됨!</span>
                </span>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" />
                  <span>6강 잠김</span>
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
                    시즌 1 · 웹 프로그래밍 첫걸음
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    소요 시간: 40분
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5 whitespace-nowrap">
                    <Code2 className="w-3.5 h-3.5 text-sky-600" />
                    HTML 구조 &amp; 대사창 마크업
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  게임 화면의 레고 블록 조립하기!<br />
                  <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-800 bg-clip-text text-transparent">
                    HTML로 대사창과 선택지 버튼 만들기
                  </span>
                </h1>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed font-normal">
                  4강까지 준비한 멋진 대본과 모험 이야기를 이제 진짜 컴퓨터 화면에 띄울 시간입니다!<br />
                  웹 브라우저는 글씨만 적힌 메모장을 주면 무엇이 제목이고 무엇이 버튼인지 알지 못해요. 우리가 <strong className="text-indigo-700 font-bold">HTML(이름표 스티커)</strong>을 붙여주면, 브라우저가 게임 대사창과 선택 버튼으로 척척 변신시켜 줍니다.
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>오늘의 미션: 내 비주얼 노벨의 첫 번째 장면을 HTML 화면으로 조립하기</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStageChange('stage2')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm ml-auto"
                  >
                    <span>레고 태그 배우러 가기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 벤토 카드 1: 웹 3총사 비유 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    🏰 웹 페이지를 만드는 3총사: HTML, CSS, JavaScript
                  </h2>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  우리가 매일 보는 네이버나 유튜브, 로블록스 웹사이트는 모두 3가지 마법 기술이 힘을 합쳐 만들어집니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-800 font-mono">1. HTML</span>
                      <span className="text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">오늘 배울 것! ⭐</span>
                    </div>
                    <h3 className="text-base font-bold text-indigo-950">건물의 뼈대 &amp; 레고 블록</h3>
                    <p className="text-sm text-indigo-900/80 leading-relaxed font-normal">
                      "여기는 게임 제목 간판!", "여기는 주인공 대사 말풍선!", "여기는 누르는 버튼!"처럼 화면의 위치와 역할을 정해주는 뼈대입니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">2. CSS</span>
                      <span className="text-[11px] font-bold text-slate-500">다음 6강 예정</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">예쁜 마법 옷 &amp; 인테리어</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      글자 색을 황금빛으로 바꾸고, 버튼에 반짝이는 네온 불빛을 켜고, 밤하늘 배경을 깔아주는 멋진 분장 기술입니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">3. JavaScript</span>
                      <span className="text-[11px] font-bold text-slate-500">시즌 2 예정</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">살아 숨쉬는 심장 &amp; 두뇌</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      버튼을 딸깍 클릭했을 때 다음 장면으로 슝 넘어가거나 점수가 올라가도록 만드는 살아있는 엔진입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 벤토 카드 2: 3대 미션 */}
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
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">1</div>
                    <h3 className="text-base font-bold text-slate-900">레고 태그 5총사 익히기</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      제목 간판(`h1`), 대사 말풍선(`p`), 선택 버튼(`button`), 상자(`div`)의 쓰임새를 마스터합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">2</div>
                    <h3 className="text-base font-bold text-slate-900">AI와 HTML 조립하기</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      AI 조수에게 깨끗한 HTML 뼈대를 주문하고, 내 게임 대본 내용으로 직접 갈아끼웁니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</div>
                    <h3 className="text-base font-bold text-slate-900">실시간 화면으로 확인하기</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      우측 콘솔에서 코드를 직접 고치며 대사창과 선택지 버튼이 웹 화면에 뜨는 모습을 확인합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 벤토 카드 3: 우측 실습 콘솔 안내 */}
              <div className="bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-white rounded-2xl p-5 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-indigo-900">
                    실습 안내: 우측 패널의 [HTML 레고 조립기]를 활용해보세요!
                  </h3>
                </div>
                <p className="text-sm text-indigo-800 leading-relaxed font-normal">
                  우측 콘솔은 내가 쓴 코드가 즉시 게임 화면으로 변신하는 신기한 라이브 작업실입니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">① [HTML 조립기]</span>
                    <p className="text-[11px] text-slate-500 font-normal leading-normal">
                      코드를 입력하면 하단 뷰어에 내 게임 대사창과 버튼이 실시간으로 나타납니다.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">② [AI 주문서]</span>
                    <p className="text-[11px] text-slate-500 font-normal leading-normal">
                      내 대본을 깔끔한 HTML 뼈대로 바꿔주는 마법 프롬프트를 원클릭으로 복사합니다.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
                    <span className="text-xs font-bold text-emerald-600 block">③ [체크리스트]</span>
                    <p className="text-[11px] text-slate-500 font-normal leading-normal">
                      6개 조립 미션을 완수하면 6강 화려한 마법 옷(CSS) 입히기로 가는 문이 열립니다!
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
                  <span>2단계: 레고 태그 5총사 배우러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 2: 레고 태그 5총사 & 닫기 규칙 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* 섹션 타이틀 카드 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <Code2 className="w-4 h-4" />
                  <span>2단계 · 마크업 문법 탐구</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  태그(Tag)의 절대 규칙과 게임 화면 5총사 블록
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  HTML에서 <strong className="text-indigo-700 font-semibold">태그(Tag)는 브라우저에게 붙여주는 이름표 스티커</strong>입니다. 단 하나의 절대 규칙만 기억하면 어떤 화면이든 쉽게 조립할 수 있습니다!
                </p>
              </div>

              {/* 벤토 카드: 태그의 절대 규칙 (뚜껑 닫기) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    🏷️ 태그의 절대 규칙: "열었으면 반드시 뚜껑을 닫아라!"
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  음료수 캔을 땄으면 다 마시고 뚜껑을 닫듯이, 태그도 시작했으면 어디서 끝나는지 슬래시(<strong className="text-rose-600">/</strong>) 꼬리표를 붙여서 닫아주어야 합니다.
                </p>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm space-y-2">
                  <div className="text-slate-400 text-xs"># 태그의 기본 구조</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700 font-bold">&lt;시작태그&gt;</span>
                    <span className="text-amber-300 font-sans font-bold">화면에 보여줄 내용</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">&lt;/끝내는태그&gt;</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 font-sans">
                    💡 끝내는 태그에는 반드시 이름 앞에 슬래시(<strong className="text-rose-400">/</strong>)가 붙습니다!
                  </div>
                </div>
              </div>

              {/* 벤토 카드: 게임 화면 레고 블록 5총사 도감 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    🧱 비주얼 노벨을 조립하는 필수 레고 블록 5총사
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* 블록 1: h1 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-bold text-xs">&lt;h1&gt; ... &lt;/h1&gt;</span>
                      <span className="text-xs font-bold text-slate-600">대문짝만한 게임 제목 간판</span>
                    </div>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                      Heading(제목)의 약자예요. 게임의 타이틀이나 장소 이름("고대 도서관 3층")처럼 가장 굵고 크게 보여줄 때 사용합니다.
                    </p>
                  </div>

                  {/* 블록 2: p */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-mono font-bold text-xs">&lt;p&gt; ... &lt;/p&gt;</span>
                      <span className="text-xs font-bold text-slate-600">이야기꾼의 대사 말풍선</span>
                    </div>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                      Paragraph(문단)의 약자예요. 캐릭터의 긴 대사나 나레이션("어두운 복도 끝에서 수상한 발소리가 들려온다...")을 담습니다.
                    </p>
                  </div>

                  {/* 블록 3: button */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold text-xs">&lt;button&gt; ... &lt;/button&gt;</span>
                      <span className="text-xs font-bold text-slate-600">콕 누르는 갈림길 선택 버튼</span>
                    </div>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                      플레이어가 마우스로 클릭할 수 있는 선택지 버튼이에요. "[왼쪽 문을 연다]"처럼 결정을 내릴 때 누릅니다.
                    </p>
                  </div>

                  {/* 블록 4: div */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold text-xs">&lt;div&gt; ... &lt;/div&gt;</span>
                      <span className="text-xs font-bold text-slate-600">레고 정리 상자 (투명 묶음 상자)</span>
                    </div>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                      Division(나누기)의 약자예요. 캐릭터 이름, 대사, 버튼들을 하나의 '대사창 상자'로 묶어 이사시키거나 테두리를 칠할 때 씁니다.
                    </p>
                  </div>

                  {/* 블록 5: span */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-bold text-xs">&lt;span&gt; ... &lt;/span&gt;</span>
                      <span className="text-xs font-bold text-slate-600">단어 강조 형광펜</span>
                    </div>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                      문장 전체가 아니라 주인공 이름이나 중요한 단어("용사 레오", "황금 열쇠")에만 쏙 들어가 색을 칠할 때 쓰는 얇은 스티커예요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 벤토 카드: 초보자 단골 HTML 버그 TOP 3 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm sm:text-base">
                  <AlertTriangle className="w-4 h-4" />
                  <span>초보자가 가장 많이 하는 실수 TOP 3</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                    <strong className="text-rose-900 font-bold block">1. 닫는 슬래시 실종</strong>
                    <p className="text-sm text-rose-800 font-normal leading-relaxed">`&lt;button&gt;선택&lt;button&gt;`처럼 슬래시를 빼먹으면 뒤에 오는 모든 글자가 버튼으로 변해버려요!</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                    <strong className="text-rose-900 font-bold block">2. 부등호 괄호 오타</strong>
                    <p className="text-sm text-rose-800 font-normal leading-relaxed">`&lt;p&gt;` 대신 `(p)`나 `[p]`를 쓰면 브라우저가 태그로 알아보지 못하고 그냥 글자로 보여줍니다.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                    <strong className="text-rose-900 font-bold block">3. 엉뚱한 짝짓기</strong>
                    <p className="text-sm text-rose-800 font-normal leading-relaxed">`&lt;p&gt;`로 열고 `&lt;/div&gt;`로 닫으면 컴퓨터가 "어느 상자를 닫아야 하지?" 하고 당황해요.</p>
                  </div>
                </div>
              </div>

              {/* 미니 퀴즈 인터랙션 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    🎯 10초 퀴즈! 올바르게 작성된 HTML 태그는 무엇일까요?
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
                    1. &lt;h1&gt;모험의 시작&lt;h1&gt;
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
                    2. &lt;button&gt;동굴 진입&lt;/button&gt; ⭐
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
                    3. [p]마법의 주문[/p]
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
                          <strong className="font-bold">정답입니다! 🎉</strong> &lt;button&gt;으로 열고, 끝에는 슬래시가 붙은 &lt;/button&gt;으로 정확하게 닫아주었어요!
                        </div>
                      </div>
                    ) : quizAnswer === 1 ? (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">아쉬워요!</strong> 끝내는 태그에는 슬래시(/)가 들어가야 해요! &lt;/h1&gt;이 올바른 닫기 태그입니다.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">아쉬워요!</strong> HTML 태그는 대괄호 [ ]가 아니라 부등호 괄호 &lt; &gt;를 사용해야 브라우저가 알아봅니다!
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

                            {/* 우측 HTML 조립기 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [HTML 조립기]를 시작하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    방금 배운 5대 태그(div, h2, p, button)가 실제로 어떻게 화면에 나타나는지 확인해 볼 차례입니다. 우측 콘솔의 <strong>[HTML 조립기]</strong>에서 실시간 대화창 화면을 확인하고, 텍스트나 태그를 직접 수정하며 미리보기를 관찰해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('editor')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [HTML 조립기] 탭 바로 열기</span>
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
                  <span>3단계: AI와 코드 조립하러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* STAGE 3: AI 코드 조립 실습 */}
          {/* ----------------------------------------------------------------- */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* 섹션 헤더 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <Bot className="w-4 h-4" />
                  <span>3단계 · AI 프롬프트 협업</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  내 대본을 깨끗한 HTML 뼈대로 바꿔주는 마법 주문서
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  AI에게 "HTML 만들어줘"라고만 하면 너무 어렵고 복잡한 코드를 쏟아냅니다.<br />
                  우리가 배운 <strong className="text-indigo-700 font-semibold">필수 5총사 태그만 사용해서 초보자도 한눈에 알아볼 수 있게 조립해달라고 요청</strong>하는 프로페셔널 프롬프트를 복사해 사용해보세요!
                </p>
              </div>

              {/* 프롬프트 카드 1: 깨끗한 1장면 HTML 뼈대 요청 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
                    <h3 className="text-base font-bold text-slate-900">
                      비주얼 노벨 1장면 HTML 초보자 뼈대 주문서
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt('p1', `너는 친절한 초보자용 웹 코딩 선생님이야.
내가 아래에 작성한 게임 스토리 대본 1장면을 읽고, 오직 다음 5가지 기본 태그만 사용해서 가장 읽기 쉬운 HTML 코드를 만들어 줘:
- <h1>: 게임 제목 간판
- <div class="dialogue-box">: 대사창 묶음 상자
- <span class="character-name">: 말하는 캐릭터 이름
- <p class="dialogue-text">: 캐릭터 대사 및 상황 설명
- <button>: 플레이어 선택지 2개
# 복잡한 자바스크립트나 CSS 없이 순수 HTML 태그만 보여주고, 주석으로 각 태그 역할을 한 줄씩 설명해 줘.`)}
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
                  <div className="text-slate-400"># 초보자용 비주얼 노벨 HTML 뼈대 생성 주문서</div>
                  <div>너는 친절한 초보자용 웹 코딩 선생님이야.</div>
                  <div>내가 작성한 게임 스토리 대본 1장면을 읽고, 5가지 기본 태그만 사용해서 HTML 코드를 만들어 줘:</div>
                  <div className="text-amber-300 pl-3">- &lt;h1&gt;: 게임 제목 간판</div>
                  <div className="text-amber-300 pl-3">- &lt;div class="dialogue-box"&gt;: 대사창 묶음 상자</div>
                  <div className="text-amber-300 pl-3">- &lt;span class="character-name"&gt;: 말하는 캐릭터 이름</div>
                  <div className="text-amber-300 pl-3">- &lt;p class="dialogue-text"&gt;: 캐릭터 대사 및 상황 설명</div>
                  <div className="text-amber-300 pl-3">- &lt;button&gt;: 플레이어 선택지 2개</div>
                  <div className="text-slate-400 pt-1"># 복잡한 자바스크립트나 CSS 없이 순수 HTML 태그만 보여주고 주석을 달아줘.</div>
                </div>
              </div>

              {/* 실습 요령: 텍스트 갈아끼우기 */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 rounded-2xl p-5 sm:p-6 border border-indigo-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-indigo-950">
                    💡 실습 요령: 태그 뼈대는 그대로 두고 글자만 갈아끼우기!
                  </h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  우측 실습 콘솔에서 미리 준비된 코드를 보세요. 부등호(`&lt; &gt;`) 기호는 건드리지 않고, **태그 안쪽의 글씨(캐릭터 이름, 대사, 버튼 글씨)**만 내 4강 대본의 내용으로 쏙쏙 바꿔치기하면 순식간에 나만의 게임 화면이 완성됩니다!
                </p>
              </div>

                            {/* 우측 AI 주문서 연동 알림 카드 */}
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
                      AI와 협업할 준비가 되었다면 우측의 [AI 주문서]를 확인하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    내 대본을 깔끔한 HTML 코드로 바꿔줄 전문 프롬프트가 필요하신가요? 우측 콘솔의 <strong>[AI 주문서]</strong>에서 준비된 실전 프롬프트를 원클릭으로 복사하여 AI 서비스에 전송하고, 반환된 코드를 조립기에 붙여넣어 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('prompt')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [AI 주문서] 탭 바로 열기</span>
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
              {/* 섹션 헤더 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <CheckSquare className="w-4 h-4" />
                  <span>4단계 · 실전 화면 완성 &amp; 회고</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  나의 첫 번째 게임 화면 완성 &amp; 주니어 웹 개발자 회고
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  우측 실습 콘솔에서 내 게임의 1장면 HTML 코드를 완성해 복사하고, 오늘의 코딩 경험을 회고 수첩에 기록해보세요. 6가지 점검표를 모두 완료하면 6강(CSS 스타일링)이 열립니다!
                </p>
              </div>

              {/* 주니어 디렉터 회고 수첩 폼 */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    주니어 웹 개발자의 코딩 수첩 (회고)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      1. 오늘 배운 태그 중 가장 재미있거나 신기했던 레고 블록은 무엇인가요?
                    </label>
                    <input
                      type="text"
                      value={retro.q1}
                      onChange={e => handleRetroChange('q1', e.target.value)}
                      placeholder="예: 화면에 클릭할 수 있는 진짜 버튼이 생기는 <button> 태그"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      2. 코드를 작성하면서 발생했던 실수(슬래시 빼먹음 등)는 어떻게 고쳤나요?
                    </label>
                    <input
                      type="text"
                      value={retro.q2}
                      onChange={e => handleRetroChange('q2', e.target.value)}
                      placeholder="예: 버튼 태그 끝에 /button을 안 닫아서 글씨가 다 버튼으로 변했었는데 슬래시를 넣어 고쳤어요"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      3. 내가 만든 게임 장면에서 가장 마음에 드는 대사나 선택지는 무엇인가요?
                    </label>
                    <input
                      type="text"
                      value={retro.q3}
                      onChange={e => handleRetroChange('q3', e.target.value)}
                      placeholder="예: [왼쪽 보물상자를 연다]와 [일단 도망친다] 갈림길 선택지"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      4. 다음 6강(CSS 스타일링)에서 내 게임 화면에 어떤 색이나 분위기를 입히고 싶나요?
                    </label>
                    <input
                      type="text"
                      value={retro.q4}
                      onChange={e => handleRetroChange('q4', e.target.value)}
                      placeholder="예: 어두운 밤하늘색 배경에 형광 민트색으로 빛나는 멋진 SF 사이버 테마를 입히고 싶어요"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* [실습 지시] 우측 체크리스트 및 6강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 6강을 여세요!</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    오늘 조립한 6대 HTML 시각 뼈대 태그를 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 6강(화려한 마법 옷 입히기: CSS 비주얼 스타일링)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 6강 언락] 탭 바로 열기</span>
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
                  JUNIOR DEVELOPER GLOSSARY · 5강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 웹 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 하이퍼텍스트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-indigo-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-indigo-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      1. 하이퍼텍스트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Hypertext</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-mono flex-shrink-0">Web</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "클릭 한 번으로 다른 방이나 다른 웹 세상으로 순식간에 날아가는 마법의 순간이동 포털 글자입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 문서와 문서가 하이퍼링크(Hyperlink)를 통해 거미줄처럼 상호 연결되어 있어 사용자가 원하는 정보를 비순차적으로 탐색할 수 있는 텍스트 시스템입니다.
                </p>
              </div>

              {/* 용어 2: 마크업 언어 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      2. 마크업 언어
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Markup Language (HTML)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">Markup</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "레고 설명서처럼 '여기서부터 여기까지는 대사창이야!'라고 컴퓨터 브라우저에게 붙여주는 이름표 스티커 언어입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 태그(Tag)를 사용하여 문서의 구조, 제목, 본문, 버튼 등의 의미와 역할을 브라우저가 해석할 수 있도록 정의하는 표기 체계입니다.
                </p>
              </div>

              {/* 용어 3: DOM 트리 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      3. DOM 트리
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Document Object Model Tree</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">DOM</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "큰 상자 안에 작은 상자가 쏙쏙 들어가 있는 러시아 인형(마트료시카)이나 가지를 뻗는 레고 나무 구조입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저가 HTML 문서를 읽어 태그들의 부모-자식 관계를 계층적 트리(Tree) 객체 구조로 메모리에 표현한 모델입니다.
                </p>
              </div>

              {/* 용어 4: 속성 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      4. 속성
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Attribute</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">Option</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "이름표 스티커에 적힌 보너스 옵션(색상, 아이디, 연결 주소)입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> HTML 태그에 추가적인 정보나 제어 옵션(id, class, src, href 등)을 부여하는 key="value" 형태의 설정값입니다.
                </p>
              </div>

              {/* 용어 5: 개발자 도구 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      5. 개발자 도구
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Browser DevTools (F12)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">Debug</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "의사 선생님의 엑스레이 기계처럼 웹 화면의 뼈대와 숨겨진 버그를 들여다보는 투시 안경입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저에 내장되어 HTML 구조 분석, CSS 실시간 수정, 자바스크립트 콘솔 에러를 점검하는 전문 디버깅 도구입니다.
                </p>
              </div>

              {/* 용어 6: 인라인 vs 블록 요소 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                      <Layout className="w-4 h-4 text-purple-400" />
                      6. 인라인 vs 블록 요소
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Inline vs Block Elements</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">Layout</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "한 줄을 혼자 다 차지하는 뚱뚱한 기차 상자(Block) vs 글자 옆에 찰싹 달라붙는 얇은 스티커(Inline)입니다."</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 화면 전체 너비를 차지하며 줄바꿈을 일으키는 블록 레벨 요소(div, p, h1)와, 콘텐츠 너비만큼만 차지하여 가로로 나열되는 인라인 요소(span, a)의 레이아웃 성질입니다.
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
              onClick={() => setActiveRightTab('editor')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeRightTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML 조립기</span>
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
              <span>AI 주문서</span>
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
          {/* TAB 1: HTML 레고 조립기 (코드 에디터 & 라이브 뷰어) */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'editor' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <h3 className="text-base font-bold text-slate-900">
                      실시간 게임 화면 뷰어 &amp; 코드 조립기
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyHtml}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-slate-700 transition-colors"
                    >
                      {isHtmlCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>코드 복사</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('library')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="기본 코드로 초기화"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 스토리 프리셋 선택 칩 */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">예제 대본:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('library')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      activePreset === 'library'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    📚 고대 도서관
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('dragon')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      activePreset === 'dragon'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    🐉 화염 드래곤
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('shop')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      activePreset === 'shop'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    🔮 비밀 만물상
                  </button>
                </div>

                {/* 빠른 태그 삽입 칩 */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400">태그 넣기:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('h1')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + &lt;h1&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('p')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + &lt;p&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('button')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + &lt;button&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('span')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + &lt;span&gt;
                  </button>
                </div>

                {/* HTML 코드 입력 에디터 */}
                <div className="space-y-1">
                  <label htmlFor="tsx-html-editor" className="text-xs font-bold text-slate-700 block">
                    HTML 코드 에디터
                  </label>
                  <textarea
                    id="tsx-html-editor"
                    ref={textareaRef}
                    rows={9}
                    value={htmlCode}
                    onChange={e => setHtmlCode(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed bg-slate-900 text-emerald-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 selection:bg-indigo-700 selection:text-white"
                    spellCheck={false}
                  ></textarea>
                </div>

                {/* 실시간 렌더링 게임 화면 뷰어 */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">실시간 게임 화면 뷰어 (미리보기)</span>
                    <span className="text-[10px] text-slate-400">실시간 렌더링</span>
                  </div>
                  <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-inner min-h-[180px] p-4 flex flex-col justify-between">
                    <div
                      className="space-y-3 font-sans [&_h1]:text-sm [&_h1]:sm:text-base [&_h1]:font-extrabold [&_h1]:text-indigo-900 [&_h1]:border-b [&_h1]:border-indigo-100 [&_h1]:pb-1 [&_h1]:mb-2 [&_h1]:block [&_div.dialogue-box]:p-3 [&_div.dialogue-box]:rounded-xl [&_div.dialogue-box]:bg-slate-50 [&_div.dialogue-box]:border [&_div.dialogue-box]:border-slate-200 [&_div.dialogue-box]:space-y-1 [&_div.dialogue-box]:my-2 [&_span.name]:text-xs [&_span.name]:font-bold [&_span.name]:text-indigo-700 [&_span.name]:block [&_p]:text-xs [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:font-normal [&_p]:my-1 [&_button]:inline-block [&_button]:mr-2 [&_button]:mb-2 [&_button]:px-3 [&_button]:py-1.5 [&_button]:rounded-lg [&_button]:text-xs [&_button]:font-bold [&_button]:bg-indigo-600 [&_button]:text-white [&_button]:hover:bg-indigo-700 [&_button]:active:scale-95 [&_button]:transition-all [&_button]:shadow-xs [&_button]:cursor-pointer"
                      dangerouslySetInnerHTML={{ __html: htmlCode }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: AI 주문서 (프롬프트 복사기) */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'prompt' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    AI 소환 프롬프트 주문서 모음
                  </h3>
                </div>

                {/* 주문서 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">① 비주얼 노벨 1장면 변환</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p1', `너는 친절한 초보자용 웹 코딩 선생님이야.
내가 아래에 작성한 게임 스토리 대본 1장면을 읽고, 오직 다음 5가지 기본 태그만 사용해서 가장 읽기 쉬운 HTML 코드를 만들어 줘:
- <h1>: 게임 제목 간판
- <div class="dialogue-box">: 대사창 묶음 상자
- <span class="character-name">: 말하는 캐릭터 이름
- <p class="dialogue-text">: 캐릭터 대사 및 상황 설명
- <button>: 플레이어 선택지 2개
# 복잡한 자바스크립트나 CSS 없이 순수 HTML 태그만 보여주고, 주석으로 각 태그 역할을 한 줄씩 설명해 줘.`)}
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
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    4강에서 작성한 대본 v2를 전달하면 &lt;h1&gt;, &lt;p&gt;, &lt;button&gt;, &lt;div&gt; 태그로 구성된 깔끔한 1장면 HTML 코드로 만들어 줍니다.
                  </p>
                </div>

                {/* 주문서 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-700">② HTML 코드 오류 진단 주문서</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt('p2', `내가 작성한 HTML 코드에서 닫히지 않은 태그나 오타가 있는지 꼼꼼히 검사해 줘:
[여기에 내 HTML 코드 붙여넣기]
오류가 있다면 1) 틀린 부분 위치, 2) 올바른 수정 코드를 친절하게 설명해 줘.`)}
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
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    태그가 닫히지 않았거나 부등호 오타가 났을 때 AI에게 코드를 보여주고 버그를 즉시 찾아달라고 요청합니다.
                  </p>
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
                    <h3 className="text-base font-bold text-slate-900">
                      5강 자가 점검 체크리스트 (6문항)
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
                <div className="space-y-2 pt-1 text-xs" data-checklist-lesson="lesson_05">
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
                      1. 웹 페이지를 만드는 3총사(HTML, CSS, JavaScript)의 각 역할을 비유로 이해했나요?
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
                      2. 태그(Tag)를 열었으면 슬래시(&lt;/<strong className="text-rose-600">태그명</strong>&gt;)로 닫아야 한다는 절대 규칙을 확인했나요?
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
                      3. 제목(&lt;h1&gt;), 대사(&lt;p&gt;), 선택 버튼(&lt;button&gt;) 3가지 핵심 태그를 직접 써보았나요?
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
                      4. 여러 요소를 하나의 대사창으로 묶어주는 &lt;div&gt; 상자의 쓰임새를 이해했나요?
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
                      5. 우측 조립기에서 코드를 고치며 실시간 게임 뷰어 화면에 버튼과 대사가 뜨는 것을 확인했나요?
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
                      <span>🎉 5강 퀘스트 완주! 6강 언락 성공!</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-normal">
                      웹 화면의 튼튼한 HTML 뼈대를 완벽히 조립했습니다! 이제 6강에서는 다크 테마와 네온 버튼 효과 등 <strong>CSS 마법 옷을 입히는 비주얼 스타일링</strong>을 시작합니다!
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 6강 화려한 마법 옷(CSS) 입히기가 열립니다!</span>
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

export default Lesson05;
