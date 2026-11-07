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
  Globe,
  Radio,
  Send,
  Receipt,
  Package,
  Gift,
  Network,
  ShieldCheck,
  BookOpen,
  ArrowLeftRight,
  Download,
  AlertCircle,
  Compass,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 4 · 13강 React 컴포넌트 (Lesson13.tsx)
 * 인터넷 세상의 비밀 배달부: 다른 서버에서 데이터 가져오기 (JSON & Fetch)
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'fetcher' | 'receipt' | 'checklist';
type ApiChannel = 'quote' | 'dog' | 'pokemon';

const ENDPOINTS: Record<ApiChannel, string> = {
  quote: 'https://api.adviceslip.com/advice',
  dog: 'https://dog.ceo/api/breeds/image/random',
  pokemon: 'https://pokeapi.co/api/v2/pokemon/25'
};

export default function Lesson13() {
  // 스테이지 및 우측 탭 상태
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('fetcher');

  // 오픈 API 배달 상태
  const [currentChannel, setCurrentChannel] = useState<ApiChannel>('quote');
  const [deliveryStatus, setDeliveryStatus] = useState<string>('대기 중');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchResult, setFetchResult] = useState<any>(null);

  // 영수증 시뮬레이터 상태
  const [receiptMode, setReceiptMode] = useState<'200' | '404'>('200');

  // 프롬프트 복사 상태
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 자가 점검 체크리스트 (6개)
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 로컬스토리지 복원
  useEffect(() => {
    const saved = localStorage.getItem('ai_lesson_13_completed');
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
      localStorage.setItem('ai_lesson_13_completed', 'true');
      fetch('/api/ai/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ lesson_id: 'lesson_13' })
      }).catch(() => {});
    } else {
      setIsCompleted(false);
    }
  };

  // 오픈 API 데이터 요청 실행
  const handleFetchData = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setDeliveryStatus('배달 오토바이 출발! 🛵');

    try {
      let data: any;
      try {
        const res = await fetch(ENDPOINTS[currentChannel]);
        data = await res.json();
      } catch (err) {
        // 오프라인/CORS 대체 데이터
        if (currentChannel === 'quote') {
          data = { slip: { id: 77, advice: 'Always do what you are afraid to do.' } };
        } else if (currentChannel === 'dog') {
          data = { message: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg', status: 'success' };
        } else {
          data = { name: 'pikachu', id: 25, height: 4, weight: 60, types: [{ type: { name: 'electric' } }] };
        }
      }

      setFetchResult(data);
      setDeliveryStatus('배달 완료 (200 OK) 🎉');

      // 체크리스트 5번 자동 체크
      if (!checkedItems[4]) {
        const next = [...checkedItems];
        next[4] = true;
        setCheckedItems(next);
        if (next.filter(Boolean).length === 6) {
          setIsCompleted(true);
          localStorage.setItem('ai_lesson_13_completed', 'true');
        }
      }
    } catch (e) {
      setDeliveryStatus('오류 발생 💥');
    } finally {
      setIsFetching(false);
    }
  };

  // 영수증 모드 토글
  const handleToggleReceiptMode = (mode: '200' | '404') => {
    setReceiptMode(mode);
    if (!checkedItems[3]) {
      const next = [...checkedItems];
      next[3] = true;
      setCheckedItems(next);
      if (next.filter(Boolean).length === 6) {
        setIsCompleted(true);
        localStorage.setItem('ai_lesson_13_completed', 'true');
      }
    }
  };

  // 프롬프트 복사
  const handleCopyPrompt = () => {
    const prompt = `무료 오픈 API(https://api.adviceslip.com/advice)에 fetch()를 사용해 오늘의 명언을 비동기(async/await)로 가져와줘.

1. 데이터를 불러오는 동안 로딩 중 스피너를 보여줘.
2. 네트워크 오류가 생기면 try-catch로 잡아서 친절한 재시도 안내를 띄워줘.
3. 배달이 완료되면 예쁜 카드 UI에 명언과 번호를 렌더링해줘.`;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);

      if (!checkedItems[5]) {
        const next = [...checkedItems];
        next[5] = true;
        setCheckedItems(next);
        if (next.filter(Boolean).length === 6) {
          setIsCompleted(true);
          localStorage.setItem('ai_lesson_13_completed', 'true');
        }
      }
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ===================================================================== */}
      {/* [상단 GNB] 과정 홈 | 시즌 4 시작 · 13강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
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
              <a href="../12-ranking-storage/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">12강 랭킹 저장소</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 whitespace-nowrap">13강 오픈 API와 배달부</span>
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
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
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
                  <span>컴퓨터 밖으로</span>
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
                  <span>배달부 fetch</span>
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
                  <span>진동벨 대기</span>
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
                  <span>오픈 API 뷔페</span>
                </button>
              </nav>
            </div>

            {isCompleted ? (
              <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                <Unlock className="w-3.5 h-3.5" />
                <span>14강 언락</span>
              </div>
            ) : (
              <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>14강 잠김</span>
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
          {/* [STAGE 1: 컴퓨터 밖으로] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border border-indigo-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300/60">
                  <Globe className="w-3.5 h-3.5 text-indigo-700" />
                  시즌 4 개막 · 실생활 스마트 도구 &amp; 오픈 API
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Fetch API &amp; Async
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                인터넷 세상의 비밀 배달부:<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600">
                  다른 서버에서 데이터 가져오기 (JSON &amp; Fetch)
                </span>
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                내 컴퓨터 안에서만 돌던 코드는 안녕! 전 세계 인터넷 서버에서 실시간 명언, 귀여운 동물 사진, 포켓몬 정보를 무료로 배달받는 fetch 마법을 배워봐요.
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
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">fetch &amp; async/await</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">완료 조건</span>
                  <strong className="text-xs font-bold text-indigo-700 leading-snug whitespace-nowrap">오픈 API 요청 &amp; 렌더링</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. STAGE 1: 미션 브리핑 */}

              <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-base sm:text-lg">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">1단계: 내 컴퓨터 밖으로 — 섬에 갇힌 컴퓨터에서 인터넷 세상으로!</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              지금까지 1강부터 12강까지 우리가 짠 자바스크립트는 오직 내 컴퓨터(브라우저) 안에서만 일어나는 일이었어요. 마치 바다 한가운데 외딴섬에 혼자 살면서 내가 가진 재료로만 집을 짓고 놀았던 것과 같아요.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>하지만 진짜 멋진 앱들은 어떻게 동작할까요?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-indigo-950">
                  <strong className="block mb-0.5 text-indigo-700">☀️ 실시간 날씨 앱</strong>
                  <span>기상청 슈퍼컴퓨터에 물어봐서 현재 온도를 받아와요!</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-indigo-950">
                  <strong className="block mb-0.5 text-indigo-700">🍱 학교 급식 알리미</strong>
                  <span>교육청 데이터베이스에 접속해 오늘 식단표를 가져와요!</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-indigo-950">
                  <strong className="block mb-0.5 text-indigo-700">🐶 동물 도감 앱</strong>
                  <span>전 세계 사진 도서관 서버에서 강아지 사진을 배달받아요!</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  손님(클라이언트)과 식당(서버)의 비밀 대화
                </span>
                <span className="text-[10px] font-mono text-slate-400">CLIENT &amp; SERVER</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                인터넷 세상은 손님과 식당의 관계와 똑같아요!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                  <strong className="text-sky-300 block mb-0.5">👤 손님 (Client, 우리 웹 브라우저)</strong>
                  <span className="text-slate-400">"여기 오늘의 멋진 명언 하나 배달해 주세요!" (요청, Request)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                  <strong className="text-emerald-300 block mb-0.5">🏢 식당 (Server, 상대방 컴퓨터)</strong>
                  <span className="text-slate-400">"네! 따끈따끈한 명언 JSON 데이터 포장해서 보냅니다!" (응답, Response)</span>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 배달부 fetch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 배달부 fetch] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">2단계: 배달부 fetch — 자바스크립트의 초특급 배달 오토바이</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              브라우저에는 인터넷 세상의 다른 식당(서버)으로 주문서를 들고 달려가는 전용 배달부가 기본으로 탑재되어 있어요. 그 이름이 바로 <strong className="text-slate-900 font-bold font-mono">fetch()</strong>입니다!
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 text-white font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
              <div className="text-slate-400 pb-1 border-b border-slate-800 text-[11px]">// 3단계 초간단 배달 공식</div>
              <div><span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-sky-400">fetch</span>(<span className="text-amber-300">'https://api.adviceslip.com/advice'</span>); <span className="text-slate-500">// 1. 배달 보내기</span></div>
              <div><span className="text-purple-400">const</span> data = <span className="text-purple-400">await</span> response.<span className="text-emerald-400">json</span>(); <span className="text-slate-500">// 2. 도착한 택배 상자 뜯기</span></div>
              <div>console.<span className="text-sky-400">log</span>(data.slip.advice); <span className="text-slate-500">// 3. 화면에 맛있는 데이터 쓰기</span></div>
            </div>

            <div className="space-y-1.5 pt-1">
              <strong className="text-xs font-bold text-slate-900 block">배달 영수증 확인하기: HTTP 상태 코드 3총사</strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="font-mono font-bold text-emerald-800 block text-xs">200 OK ✅</span>
                  <p className="text-sm text-emerald-900 leading-relaxed">배달 성공! 음식이 따끈따끈하게 정상 도착했어요.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="font-mono font-bold text-amber-800 block text-xs">404 Not Found ❓</span>
                  <p className="text-sm text-amber-900 leading-relaxed">가게나 음식이 없대요! 인터넷 주소 철자(URL)를 확인하세요.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="font-mono font-bold text-rose-800 block text-xs">500 Server Error 💥</span>
                  <p className="text-sm text-rose-900 leading-relaxed">식당 주방에 문제가 생겼어요! 상대방 서버 컴퓨터가 고장 난 상태예요.</p>
                </div>
              </div>
            </div>
          </article>

              {/* 우측 배달 실습실 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [배달 실습실]을 시작하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    방금 배운 자바스크립트 특급 배달부(fetch)를 직접 출발시킬 차례입니다. 우측 콘솔의 <strong>[배달 실습실]</strong>에서 주문 주소(URL)를 확인하고 데이터 배달 출발 버튼을 눌러 실시간 응답을 직접 받아보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('fetcher')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [배달 실습실] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 컴퓨터 밖으로
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
                  <span>다음: Stage 3 진동벨 대기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 진동벨 대기] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">3단계: 진동벨 대기 — 비동기 통신(async / await)의 비밀</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              인터넷 저 멀리 바다 건너 미국에 있는 서버에 데이터를 요청하면, 아무리 빛의 속도라도 0.5초에서 1초 정도 배달 시간이 걸려요!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <strong className="text-rose-900 font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ❌ 얼음 땡 방식 (동기, Synchronous)
                </strong>
                <p className="text-sm text-rose-800 leading-relaxed">
                  커피가 나올 때까지 계산대 앞에서 눈 하나 깜빡 안 하고 굳어있는 것! 화면이 꽁꽁 얼어붙어 마우스 클릭도 안 먹히고 사용자가 답답해해요.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <strong className="text-emerald-900 font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ⭕ 카페 진동벨 방식 (비동기, Asynchronous)
                </strong>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  주문 후 진동벨(<code className="font-mono font-bold text-emerald-950">await</code>)을 받고 다른 일을 자유롭게 하다가, 징~ 울리면 커피를 받아오는 스마트한 방식!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
              <strong className="text-amber-300 block font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                async와 await 한눈에 외우기
              </strong>
              <ul className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>• <strong className="text-white font-mono">async</strong>: "이 함수 안에서는 진동벨을 쓰는 배달이 있어요!"라고 미리 선언하기</li>
                <li>• <strong className="text-white font-mono">await</strong>: "배달이 도착할 때까지 여기서 얌전히 기다려요!"라고 멈춰 세우기</li>
              </ul>
            </div>
          </article>

              {/* 우측 배달 영수증 연동 알림 카드 */}
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
                      배달이 완료되었다면 우측 [배달 영수증]을 열어 검증하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    비동기 통신(async/await)으로 배달된 JSON 상자를 열어보셨나요? 우측 콘솔의 <strong>[배달 영수증]</strong> 탭을 클릭하여 상태 코드 200(성공)과 도착한 원문 데이터를 대조하고 나만의 API 통신 뱃지를 발급받으세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('receipt')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [배달 영수증] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 배달부 fetch
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
                  <span>다음: Stage 4 오픈 API 뷔페</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 오픈 API 뷔페] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Gift className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">4단계: 오픈 API 보물찾기 — 전 세계가 무료로 나눠주는 데이터 뷔페</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              <strong className="text-slate-900 font-bold">"오픈 API(Open API)"</strong>란 전 세계 개발자들과 학생들이 자유롭게 앱을 만들 수 있도록 비밀번호 없이 열어둔 무료 데이터 보물창고예요.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">🌟 오늘의 명언 API</strong>
                <span className="text-[10px] font-mono text-slate-500 block truncate">api.adviceslip.com/advice</span>
                <span className="text-[11px] text-slate-600 block">짧고 지혜로운 한 줄 인생 명언을 랜덤으로 배달!</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">🐶 귀여운 강아지 API</strong>
                <span className="text-[10px] font-mono text-slate-500 block truncate">dog.ceo/api/breeds/image/random</span>
                <span className="text-[11px] text-slate-600 block">전 세계 귀여운 댕댕이 사진을 무한으로 배달!</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">⚡ 포켓몬 도감 API</strong>
                <span className="text-[10px] font-mono text-slate-500 block truncate">pokeapi.co/api/v2/pokemon/...</span>
                <span className="text-[11px] text-slate-600 block">피카츄 등 수백 마리 포켓몬의 스탯과 이미지를 배달!</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ❌ 위험한 프롬프트
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">위험</span>
                </div>
                <pre className="p-3 rounded-xl bg-white border border-rose-200 text-rose-900 font-mono text-xs leading-relaxed overflow-x-auto">
                  인터넷에서 명언 가져와서 보여줘.
                </pre>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  API 주소나 에러 처리, 로딩 스피너가 없어서 통신이 실패하면 흰 화면으로 굳어버려요!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ⭕ 안전한 프롬프트 (안정성 100%)
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
{`무료 오픈 API(https://api.adviceslip.com/advice)에 fetch()를 사용해 오늘의 명언을 비동기(async/await)로 가져와줘.

1. 데이터를 불러오는 동안 로딩 중 스피너를 보여줘.
2. 네트워크 오류가 생기면 try-catch로 잡아서 친절한 재시도 안내를 띄워줘.
3. 배달이 완료되면 예쁜 카드 UI에 명언과 번호를 렌더링해줘.`}
                </pre>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  로딩 표시와 오류 방어선(try-catch)을 모두 챙겨 전문가 수준의 웹앱이 완성됩니다!
                </p>
              </div>
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 14강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 14강을 여세요!</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    오늘 학습한 6대 Open API 통신과 fetch 영수증 발급 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 14강(우리 학교 오늘의 급식 메뉴 알리미)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 14강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 진동벨 대기
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
                  JUNIOR DEVELOPER GLOSSARY · 13강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 백엔드·프론트엔드 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 오픈 API */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-400" />
                      1. 오픈 API
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Open API (Application Programming Interface)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">통신/인터페이스</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "누구나 마음껏 가져다 먹을 수 있도록 전 세계에 차려진 정보 뷔페 식당!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 외부 개발자나 프로그램이 특정 서비스의 데이터나 기능에 표준화된 방식으로 접근하여 활용할 수 있도록 공개된 프로그래밍 인터페이스 규격입니다.
                </p>
              </div>
              {/* 용어 2: HTTP 요청과 응답 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-sky-300 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                      2. HTTP 요청과 응답
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: HTTP Request & Response</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">웹 네트워크</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "손님이 식당에 건네는 주문서(요청)와 식당에서 테이블로 날라주는 맛있는 음식(응답)!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 클라이언트가 특정 URI로 서버에 자원을 요구하는 HTTP 요청 메시지를 보내고, 서버가 처리 결과와 상태 코드를 담아 돌려주는 양방향 통신 모델입니다.
                </p>
              </div>
              {/* 용어 3: 비동기 처리 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      3. 비동기 처리
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 비동기 처리 (Asynchronous / async & await)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">실행 엔진</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "음료가 나올 때까지 굳어있지 않고 진동벨을 들고 자유롭게 책을 읽으며 기다리는 스마트 카페 시스템!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 시간이 걸리는 네트워크 I/O 작업 동안 메인 실행 흐름을 멈추지 않고(Non-blocking), 결과가 도착했을 때 등록된 작업을 순차 실행하는 자바스크립트 실행 메커니즘입니다.
                </p>
              </div>
              {/* 용어 4: 패치 API */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-purple-400" />
                      4. 패치 API
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 패치 API (Fetch API)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">브라우저 내장 API</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "자바스크립트가 다른 컴퓨터로 보내는 신속 배달 오토바이 라이더!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저에서 네트워크 리소스를 비동기적으로 가져오기 위해 제공하는 Promise 기반의 최신 자바스크립트 표준 통신 메서드입니다.
                </p>
              </div>
              {/* 용어 5: HTTP 상태 코드 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      5. HTTP 상태 코드
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: HTTP 상태 코드 (Status Code / 200, 404, 500)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">프로토콜/검증</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "배달이 무사히 왔는지(200), 주소가 틀렸는지(404), 식당 주방에 불이 났는지(500)를 세 자리 숫자로 알려주는 신호등!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 클라이언트의 HTTP 요청이 성공했는지, 리다이렉트되었는지, 클라이언트 또는 서버 오류가 발생했는지를 3자리 숫자로 표준화하여 나타내는 상태 식별자입니다.
                </p>
              </div>
              {/* 용어 6: 엔드포인트 URL */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-teal-400" />
                      6. 엔드포인트 URL
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 엔드포인트 URL (API Endpoint)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">웹 자원 주소</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "원하는 메뉴(명언, 날씨, 강아지)가 준비되어 있는 인터넷 식당의 정확한 번지수 주소판!"</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> API 서버에서 특정 자원이나 기능에 접근할 수 있도록 공개해 둔 고유한 URL 경로(URI Path)입니다.
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
              onClick={() => setActiveRightTab('fetcher')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'fetcher'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>배달 실습실</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('receipt')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'receipt'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>배달 영수증</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>체크리스트</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🌐 비밀 배달부 실습실 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'fetcher' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Send className="w-4 h-4" />
                    </div>
                    <strong className="text-base font-bold text-slate-900">오픈 API 실시간 배달기</strong>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      deliveryStatus.includes('완료')
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : deliveryStatus.includes('출발')
                        ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {deliveryStatus}
                  </span>
                </div>

                {/* 채널 선택 버튼 3개 */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentChannel('quote')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      currentChannel === 'quote' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌟 오늘의 명언
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentChannel('dog')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      currentChannel === 'dog' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🐶 귀여운 강아지
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentChannel('pokemon')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      currentChannel === 'pokemon' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ 피카츄 스탯
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-sky-300 truncate">{ENDPOINTS[currentChannel]}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 pl-1">CORS OK</span>
                </div>

                <button
                  type="button"
                  onClick={handleFetchData}
                  disabled={isFetching}
                  className={`w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isFetching ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>데이터 배달 주문하기 (fetch 실행)</span>
                </button>

                {/* 결과 렌더링 카드 */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 min-h-[110px] flex flex-col justify-center items-center text-center space-y-2">
                  {isFetching ? (
                    <>
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-600 border-t-transparent mx-auto" />
                      <span className="text-xs font-bold text-indigo-900">인터넷 서버로 배달부 가는 중... (async/await)</span>
                    </>
                  ) : fetchResult ? (
                    currentChannel === 'quote' ? (
                      <>
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                          ADVICE #{fetchResult.slip ? fetchResult.slip.id : '42'}
                        </div>
                        <p className="text-xs font-bold text-indigo-950 leading-relaxed font-sans">
                          "{fetchResult.slip ? fetchResult.slip.advice : 'Always do what you are afraid to do.'}"
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold">배달 완료! 200 OK</span>
                      </>
                    ) : currentChannel === 'dog' ? (
                      <>
                        <img
                          src={fetchResult.message || 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'}
                          alt="강아지 사진"
                          className="w-24 h-24 object-cover rounded-xl border border-indigo-200 shadow-xs mx-auto"
                        />
                        <span className="text-xs font-bold text-indigo-950 block">귀여운 댕댕이 사진 배달 완료! 🐶</span>
                        <span className="text-[10px] text-emerald-600 font-bold">200 OK</span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 justify-center">
                          <span className="w-8 h-8 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center text-xs">⚡</span>
                          <strong className="text-xs font-bold text-indigo-950 capitalize">
                            {fetchResult.name || '피카츄'} (#{fetchResult.id || 25})
                          </strong>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          키: {(fetchResult.height || 4) * 10}cm | 몸무게: {(fetchResult.weight || 60) / 10}kg | 속성: 전기
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">PokeAPI 200 OK</span>
                      </>
                    )
                  ) : (
                    <>
                      <Package className="w-8 h-8 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-900">배달 주문을 기다리고 있어요!</span>
                      <span className="text-[11px] text-indigo-700">위 버튼을 누르면 인터넷 서버로 배달부가 출발합니다.</span>
                    </>
                  )}
                </div>
              </div>

              {/* 📡 오픈 API 통신 흐름 다이어그램 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  <span>실시간 네트워크 통신 3단계 흐름</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-slate-800 block">요청 전송</strong>
                    <span className="text-slate-500 text-[10px]">fetch(URL)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-slate-800 block">진동벨 대기</strong>
                    <span className="text-slate-500 text-[10px]">await res</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-slate-800 block">JSON 언패킹</strong>
                    <span className="text-slate-500 text-[10px]">res.json()</span>
                  </div>
                </div>
              </div>

              {/* 💡 비밀 배달부 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>비밀 배달부 4대 핵심 공식 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">fetch는 비동기 함수(async/await)와 짝꿍</strong>
                      <span className="text-slate-400">배달이 올 때까지 화면이 얼지 않도록 진동벨(await)로 대기하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">response.json()으로 택배 상자 뜯기</strong>
                      <span className="text-slate-400">서버에서 날아온 글자 패킷을 살아있는 자바스크립트 객체로 풀어내요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">200 OK 상태 코드 먼저 확인</strong>
                      <span className="text-slate-400">음식이 제대로 왔는지 확인하고 404나 500 에러를 방어해요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">네트워크 실패를 대비해 try-catch 장착</strong>
                      <span className="text-slate-400">와이파이가 끊겨도 게임이 꺼지지 않도록 친절한 에러 안내를 띄워요.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 📦 HTTP 배달 영수증 돋보기 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'receipt' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-base font-bold text-slate-900 block">HTTP 통신 영수증 돋보기</strong>
                      <span className="text-[11px] text-slate-500 font-normal">네트워크 패킷의 헤더와 원문 응답을 확인하세요</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                      receiptMode === '200'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {receiptMode === '200' ? '200 OK' : '404 Not Found'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleReceiptMode('200')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      receiptMode === '200' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    정상 배달 (200 OK)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleReceiptMode('404')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      receiptMode === '404' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    주소 오류 (404 Not Found)
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between"><span className="text-slate-500">Method:</span> <strong className="text-slate-800">GET</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Content-Type:</span> <strong className="text-slate-800">application/json</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Latency:</span> <strong className="text-slate-800">{receiptMode === '200' ? '180ms' : '320ms'}</strong></div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">원문 JSON 패킷 (Raw Payload)</span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {receiptMode === '200'
                      ? JSON.stringify({ slip: { id: 42, advice: 'Always do what you are afraid to do.' } }, null, 2)
                      : JSON.stringify({ error: 'Not Found', message: '주소 오타: 해당 엔드포인트의 리소스를 찾을 수 없습니다.' }, null, 2)}
                  </pre>
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
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-base font-bold text-slate-900 block">13강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 14강이 열려요</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {checkedCount} / 6 ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { title: '1. 클라이언트와 서버의 역할 이해', desc: '손님(내 브라우저)이 요청하고 식당(서버)이 응답하는 구조를 이해했다.' },
                    { title: '2. 비밀 배달부 fetch() 명령 실습', desc: '원하는 엔드포인트 URL로 배달부를 보내 데이터를 요청할 수 있다.' },
                    { title: '3. 비동기 통신(async / await) 원리', desc: '배달이 올 때까지 화면이 얼지 않고 기다리는 진동벨 원리를 이해했다.' },
                    { title: '4. HTTP 상태 코드(200, 404, 500) 구별', desc: '배달 영수증을 보고 성공(200)과 주소 오류(404)를 구별할 수 있다.' },
                    { title: '5. 오픈 API 데이터 직접 배달 성공', desc: '배달 실습실에서 명언, 강아지, 포켓몬 데이터를 직접 가져와 렌더링했다.' },
                    { title: '6. 안전한 오픈 API 프롬프트 작성', desc: '로딩 스피너와 try-catch 에러 방어선이 포함된 안전 프롬프트를 실습했다.' }
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems[idx]}
                        onChange={() => handleToggleCheck(idx)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                        <span className="text-[11px] text-slate-500 font-normal block">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <span>축하합니다! 13강 미션 100% 완주!</span>
                    </div>
                    <p className="text-sm text-indigo-50 leading-relaxed font-normal">
                      인터넷 비밀 배달부 fetch와 오픈 API의 기초를 마스터했습니다! 이제 14강에서 전국 교육청 공공데이터를 연동해 실시간 급식 알리미를 만들어 봐요.
                    </p>
                    <a
                      href="../14-school-lunch/index.html"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-50 transition-all shadow-xs"
                    >
                      <span>14강 학교 급식 알리미 도전하기</span>
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
