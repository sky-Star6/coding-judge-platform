import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Award,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  Search,
  Bot,
  Lightbulb,
  Layers,
  AlertTriangle,
  Send,
  Loader2,
  FileText,
  Activity,
  Filter,
  BarChart2,
  Clock,
  Globe,
  Image,
  Code,
  Trophy,
  Zap,
  ZoomIn,
  Target,
  LayoutGrid,
  Sliders,
  Inbox,
  Heart,
  WifiOff,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type ScenarioKey = 'fast' | 'slow' | 'offline' | 'error';
type ViewState = 'idle' | 'loading' | 'success' | 'error';
type StepHighlight = 'reset' | 'try' | 'catch' | 'success' | 'finally';

interface QuestItem {
  id: string;
  badge: string;
  level: string;
  title: string;
  desc: string;
  prompt: string;
  reaction: string;
  csSecret: string;
}

const QUESTS: QuestItem[] = [
  {
    id: 'quest-01',
    badge: 'async/await 3단계 방어벽 템플릿',
    level: '기본 방어 ★☆☆',
    title: 'async/await와 try-catch-finally를 활용한 프론트엔드 표준 통신 템플릿 생성',
    desc: '데이터를 불러오는 동안 로딩 상태를 켜고, 오류 발생 시 안전하게 포획하며, 성공/실패 여부와 무관하게 finally에서 로딩을 종료하는 표준 함수를 요청합니다.',
    prompt: `[역할]
너는 웹 프론트엔드 안정성과 사용자 경험(UX)을 담당하는 시니어 엔지니어이자 친절한 코딩 코치야.

[목표]
REST API를 호출할 때 브라우저가 하얗게 멈추거나 먹통이 되지 않도록 지켜주는 비동기 통신 표준 함수 fetchSafeData(apiUrl)를 자바스크립트로 작성해 줘.

[세부 요구사항]
1. isLoading(로딩 중 여부), error(에러 객체 또는 메시지), data(정상 수신 결과)의 3가지 상태 변수를 정의해 줘.
2. try 블록에서 fetch와 response.ok를 검증하고, !response.ok일 경우 throw new Error를 던져 catch로 넘기게 만들어 줘.
3. catch 블록에서는 에러 메시지를 한국어로 정제하여 error 상태에 저장해 줘.
4. finally 블록에서는 성공하든 실패하든 무조건 isLoading = false를 보장하게 작성해 줘.
5. 초보자도 쉽게 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '어떤 돌발 상황에서도 로딩 스피너가 영원히 멈추지 않는 버그를 원천 차단하는 완벽한 3단계 표준 코드를 소환합니다!',
    csSecret: '자바스크립트의 finally 블록은 try나 catch 블록 안에서 return문이 실행되어 함수가 조기 종료되더라도 브라우저 런타임에 의해 100% 무조건 실행됩니다.'
  },
  {
    id: 'quest-02',
    badge: 'CSS 스켈레톤 UI 펄스 애니메이션',
    level: '인터랙션 ★★☆',
    title: 'Tailwind CSS의 animate-pulse를 활용한 모던 스켈레톤(Skeleton UI) 카드 컴포넌트 제작',
    desc: '피드 목록이 도착하기 전 깜빡이는 회색 뼈대 카드를 제작하고, 데이터 도착 시 실제 피드로 부드럽게 페이드인 전환하는 코드를 생성합니다.',
    prompt: `[역할]
너는 글로벌 소셜 미디어 피드를 설계하는 UI/UX 모션 디자이너이자 프론트엔드 퍼블리셔야.

[목표]
Tailwind CSS의 animate-pulse 유틸리티 클래스를 사용해 인스타그램 피드 형태의 반응형 스켈레톤 로딩 카드 컴포넌트를 만들어 줘.

[세부 요구사항]
1. 상단에 사용자 원형 프로필 아바타(w-10 h-10 rounded-full)와 2줄의 텍스트 뼈대를 배치해 줘.
2. 중간에는 종횡비 16:9 비율의 대표 이미지 스켈레톤 박스를 배치해 줘.
3. 하단에는 좋아요 아이콘 자리와 3줄의 본문 텍스트 뼈대(w-full, w-5/6, w-2/3)를 연회색(bg-slate-200)으로 만들어 줘.
4. 왜 단순 스피너보다 스켈레톤 UI가 사용자의 체감 대기 시간을 줄이고 레이아웃 흔들림(CLS)을 방지하는지 심리학적 이유 2가지를 설명해 줘.`,
    reaction: '회색 직사각형 펄스로 치수를 완벽히 보존하며 레이아웃 이동을 0으로 만드는 모던 스켈레톤 코드를 즉각 생성합니다!',
    csSecret: '구글 Core Web Vitals의 CLS(Cumulative Layout Shift)는 요소가 늦게 로드되며 화면이 덜컹거리는 폭을 측정합니다. 스켈레톤은 CLS 점수를 0으로 유지하는 비결입니다.'
  },
  {
    id: 'quest-03',
    badge: 'AbortController 타임아웃 가드',
    level: '통신 제어 ★★☆',
    title: '서버가 응답하지 않을 때 무한 대기를 차단하는 5초 타임아웃(Timeout) 가드 구현',
    desc: '자바스크립트의 표준 fetch는 기본적으로 무한정 대기할 수 있습니다. AbortController를 결합해 지정 시간 내 응답이 없으면 연결을 끊고 안전한 안내를 띄우는 기법을 배웁니다.',
    prompt: `[역할]
너는 네트워크 통신 최적화와 결함 내성(Fault Tolerance) 시스템을 구축하는 웹 아키텍트야.

[상황 및 문제점]
브라우저의 fetch() 함수는 서버가 먹통이거나 응답을 주지 않을 때 기본적으로 타임아웃 제한이 없어서 사용자가 몇 분 동안 영원히 뺑글이 스피너만 쳐다보게 될 위험이 있어.

[요청 사항]
1. 자바스크립트 표준 AbortController와 setTimeout을 결합한 fetchWithTimeout(url, options, timeoutMs = 5000) 유틸리티 함수를 작성해 줘.
2. 5초가 지나면 controller.abort()를 실행해 HTTP 요청을 강제로 중단시키고, catch 블록에서 AbortError인지 판별하는 방법을 알려줘.
3. 요청이 5초 전에 정상 성공하면 clearTimeout을 호출해 불필요한 메모리 누수를 방지하는 클린업 로직을 포함해 줘.
4. 모든 코드에 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '5초 이상 응답이 지연되는 순간 안전하게 연결을 끊고 즉시 에러 안내창으로 우회하는 강력한 가드를 소환합니다!',
    csSecret: 'AbortController는 DOM 통신 트리에 취소 신호를 브로드캐스트하는 웹 표준 API로, 연결 소켓을 즉시 닫아 배터리와 통신 자원을 보호합니다.'
  },
  {
    id: 'quest-04',
    badge: '친절한 Fallback 카드 & 원클릭 복구',
    level: 'UX 복원력 ★★★',
    title: '상황별 에러 코드(404, 500, Offline) 맞춤형 친절한 Fallback 안내창 및 재시도 함수 설계',
    desc: '영문 에러 메시지 노출을 엄격히 금지하고, 사용자가 이해하기 쉬운 한국어 설명과 따뜻한 아이콘, 그리고 페이지 새로고침 없이 즉시 재호출하는 [다시 시도] 메커니즘을 구축합니다.',
    prompt: `[역할]
너는 에러 상태의 회복 탄력성(Resilience)과 친화적 UX를 연구하는 프로덕트 디자이너이자 웹 프론트엔드 개발자야.

[상황]
API 통신 중 오류가 발생했을 때 사용자에게 영문 빨간 글씨(TypeError: Failed to fetch at line 42 등)를 보여주지 않고, 친절한 Fallback 안내 컴포넌트를 띄우려고 해.

[요청 사항]
1. 에러 유형 3가지(오프라인 와이파이 단절, 404 데이터 미발견, 500 서버 일시 장애)에 따라 제목, 쉬운 한국어 설명, 아이콘을 분기하는 ErrorFallback({ errorType, onRetry }) 컴포넌트를 만들어 줘.
2. 컴포넌트 하단에 [🔄 다시 시도하기] 버튼을 배치하고, 클릭 시 로딩 스피너를 켜며 이전 실패한 API를 즉시 재호출하는 연결 코드를 작성해 줘.
3. 실패 횟수에 따라 지수 백오프(Exponential Backoff: 1초, 2초, 4초) 지연을 두고 자동 재시도하는 실무 팁을 한 줄로 요약해 줘.`,
    reaction: '기계적인 영문 에러 대신 사용자에게 심리적 안정감을 주는 따뜻한 Fallback 컴포넌트와 원클릭 재시도 핸들러를 완성합니다!',
    csSecret: '점진적 기능 저하(Graceful Degradation)는 시스템 일부가 망가지더라도 전체 서비스가 백지로 터지지 않고 최소한의 안내와 복구 경로를 유지하는 원칙입니다.'
  },
  {
    id: 'quest-05',
    badge: 'navigator.onLine 실시간 감지 신호등',
    level: '실시간 이벤트 ★★★',
    title: '브라우저의 online/offline 이벤트를 감지하여 상단에 실시간 연결 상태 배지 띄우기',
    desc: '사용자가 지하철 터널에 진입해 와이파이가 끊기거나 다시 연결될 때 화면 상단에 초록/빨강 신호등 토스트 바를 띄우는 실시간 브라우저 센싱 스크립트를 구현합니다.',
    prompt: `[역할]
너는 모바일 웹 앱과 PWA(Progressive Web Apps) 통신 인프라를 전담하는 웹 플랫폼 엔지니어이자 교육자야.

[목표]
사용자의 기기가 와이파이나 모바일 네트워크에 연결되어 있는지 실시간으로 모니터링하는 NetworkStatusMonitor 코드를 작성해 줘.

[세부 요구사항]
1. navigator.onLine 불리언 속성을 확인하여 최초 연결 상태를 감지하는 로직을 작성해 줘.
2. window.addEventListener('online', ...) 및 window.addEventListener('offline', ...) 이벤트 리스너를 등록해 줘.
3. 와이파이가 끊기면 화면 상단에 빨간색 '현재 오프라인 상태입니다' 알림 바를 슬라이드 다운으로 띄우고, 다시 복구되면 초록색 '온라인으로 복귀했습니다' 배너를 3초간 띄운 후 사라지게 해 줘.
4. 리액트 useEffect 훅 또는 바닐라 자바스크립트에서 이벤트 리스너를 해제(clean-up)하는 방법도 설명해 줘.`,
    reaction: '운영체제 네트워크 변경을 즉각 가로채 사용자에게 친절한 온라인/오프라인 신호등 배지를 띄우는 이벤트를 소환합니다!',
    csSecret: '브라우저는 OS의 네트워크 인터페이스 상태 변경을 직접 수신하므로, 무거운 주기적 핑(Polling) 없이도 실시간 online/offline 감지가 가능합니다.'
  }
];

export default function Lesson17() {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [scenario, setScenario] = useState<ScenarioKey>('fast');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [stepHighlight, setStepHighlight] = useState<StepHighlight>('reset');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_17_checklist');
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCheck = (index: number) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);
    localStorage.setItem('ai_lesson_17_checklist', JSON.stringify(next));
    if (next.every(Boolean)) {
      localStorage.setItem('ai_lesson_17_completed', 'true');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // 시뮬레이터 실행 로직
  const handleTriggerRequest = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setViewState('loading');
    setStepHighlight('try');

    const latency = scenario === 'fast' ? 300 : scenario === 'slow' ? 3000 : scenario === 'offline' ? 800 : 600;

    setTimeout(() => {
      if (scenario === 'fast' || scenario === 'slow') {
        setViewState('success');
        setStepHighlight('success');
      } else {
        setViewState('error');
        setStepHighlight('catch');
      }

      setIsRequesting(false);
      setTimeout(() => {
        setStepHighlight('finally');
      }, 350);
    }, latency);
  };

  const handleResetSimulator = () => {
    setViewState('idle');
    setStepHighlight('reset');
    setIsRequesting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/materials/ai/index.html"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-indigo-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  시즌 4 · 17강: 와이파이가 끊겨도 끄떡없어! 뺑글이 로딩 화면과 친절한 안내창
                </span>
              </div>
            </div>
          </div>

          {/* [우측]: 4단계 스테이지 스위처 버튼 그룹 (20px 원형 배지) */}
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
              <span>미션 &amp; 원리</span>
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
              <span>가상 로딩 랩</span>
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
              <span>용어&amp;체크리스트</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
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

      {/* 모바일 전용 서브 탭 바 */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage1' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'
          }`}
        >
          1. 미션&amp;원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage2' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'
          }`}
        >
          2. 로딩 랩
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage3' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'
          }`}
        >
          3. AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage4' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'
          }`}
        >
          4. 용어&amp;점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'all' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'
          }`}
        >
          전체
        </button>
      </div>

      {/* 2. 메인 워크스페이스 (단일 컨테이너 몰입형 레이아웃) */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* =================================================================== */}
        {/* STAGE 01: 퀘스트 미션 브리핑 & 핵심 개념 원리                      */}
        {/* =================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8">
            
            {/* 미션 브리핑 히어로 카드 */}
            <article className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>시즌 4 트랙 5단계 · 예외 처리 &amp; 사용자 경험(UX)</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    안전한 무적 웹 서비스 구축
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    와이파이가 끊겨도 끄떡없어!<br className="hidden sm:inline" />
                    뺑글이 로딩 화면과 친절한 안내창
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    인터넷 지연 시간(Latency)을 마법처럼 채우는 회전 로딩 스피너와 깜빡이는 스켈레톤(Skeleton UI), 그리고 어떤 돌발 상황에서도 웹 앱이 튕기거나 멈추지 않는 무적의 3단계 안전모 try-catch-finally 방어벽을 완성합니다!
                  </p>
                </div>

                {/* 메타 정보 3개 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-slate-400 block font-medium">소요 시간</span>
                      <strong className="text-sm font-bold text-slate-100 whitespace-nowrap">약 40분 완주</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-slate-400 block font-medium">학습 난이도</span>
                      <strong className="text-sm font-bold text-slate-100 whitespace-nowrap">중급 · 실무 UX 방어</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-slate-400 block font-medium">실습 도구</span>
                      <strong className="text-sm font-bold text-slate-100 whitespace-nowrap">가상 네트워크 랩</strong>
                    </div>
                  </div>
                </div>

                {/* 3대 도전 목표 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-indigo-900/60 space-y-3">
                  <span className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>이번 17강에서 정복할 3대 도전 목표</span>
                  </span>
                  <ul className="learning-goals-list grid grid-cols-1 gap-2.5 text-sm text-slate-200">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>지연 시간(Latency)과 하얀 먹통 화면 분석:</strong> 응답 대기 중 화면 멈춤이 사용자에게 주는 불안감의 원리를 파악합니다.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>스피너 &amp; 스켈레톤 2대 로딩 UI 설계:</strong> 단순 제자리 회전 인디케이터와 레이아웃 흔들림을 막는 종이틀 스켈레톤의 차이를 마스터합니다.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>try-catch-finally 3단계 안전모 장착:</strong> 와이파이가 끊기거나 500 에러가 터져도 친절한 안내창과 원클릭 복구 버튼을 제공합니다.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* 3구 벤토 그리드 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  앱을 튼튼하게 지켜주는 3대 UX &amp; 방어 프로그래밍 원리
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 원리 01 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">원리 01</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">1. 회전 로딩 스피너</h4>
                      <span className="text-sm font-mono text-slate-400 block">Loading Spinner UI</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      빙글빙글 팽이처럼 제자리에서 회전하는 그래픽입니다. 백그라운드에서 데이터를 열심히 가져오고 있음을 즉각 알려주어 "앱이 멈춘 것 아닌가?" 하는 불안을 없애줍니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm text-indigo-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "컴퓨터가 쉬지 않고 열심히 달리고 있다고 알려주는 안심 바람개비!"
                    </p>
                  </div>
                </article>

                {/* 원리 02 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-purple-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-purple-50 text-purple-700">원리 02</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">2. 종이틀 스켈레톤 UI</h4>
                      <span className="text-sm font-mono text-slate-400 block">Skeleton Placeholder UI</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      진짜 사진과 글자가 도착하기 전에 들어올 자리를 연회색 박스로 미리 깜빡이게 그려두는 기법입니다. 화면 레이아웃이 덜컹거리는 현상(CLS)을 막고 체감 대기 시간을 절반으로 줄여줍니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-sm text-purple-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-purple-800">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "색칠 놀이를 하기 전에 스케치북에 연필로 먼저 슥슥 밑그림을 잡아두는 뼈대 스케치!"
                    </p>
                  </div>
                </article>

                {/* 원리 03 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">원리 03</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">3. 3단계 안전모 방어벽</h4>
                      <span className="text-sm font-mono text-slate-400 block">try-catch-finally Defense</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      통신 중 오류가 터져도 앱이 튕기지 않게 보호합니다. try 블록에서 요청하고, catch에서 에러를 안전하게 포획하며, finally에서 무조건 로딩 스피너를 꺼서 정상 복구합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-sm text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "스케이트보드를 탈 때 무릎 보호대와 헬멧을 차서 넘어져도 다치지 않고 툭툭 털고 일어나는 안전 장비!"
                    </p>
                  </div>
                </article>

              </div>
            </section>

            {/* 알림 배너 */}
            <aside className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-700/60 shadow-md flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-base font-bold text-white block">주니어 개발자의 제1원칙: 로딩 스피너 종료는 무조건 finally 블록에서!</strong>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  API 호출이 성공하든, 와이파이가 끊겨 실패하든 간에 사용자 화면의 로딩 뺑글이는 <strong>100% 반드시 꺼져야</strong> 합니다. try나 catch 각각에 종료 코드를 중복해서 적지 말고, 무조건 실행을 보장하는 <code className="text-indigo-200 font-mono bg-indigo-950/80 px-1.5 py-0.5 rounded">finally</code> 블록에 <code className="text-indigo-200 font-mono bg-indigo-950/80 px-1.5 py-0.5 rounded">isLoading = false</code>를 배치하는 것이 실무 표준입니다.
                </p>
              </div>
            </aside>

            {activeStage !== 'all' && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음 단계: Stage 2 가상 로딩 랩</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 로딩 & 네트워크 예외 시뮬레이터          */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    가상 로딩 &amp; 네트워크 예외 처리 인터랙티브 실험실
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  초고속 통신, 지연 통신, 와이파이 단절, 500 서버 장애의 4가지 네트워크 상태를 직접 시험하고 스피너, 스켈레톤, Fallback 안내창의 동작을 실시간으로 확인하세요.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* 시나리오 선택 칩 */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>네트워크 통신 시나리오 선택</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => !isRequesting && setScenario('fast')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all font-bold text-sm cursor-pointer ${
                      scenario === 'fast'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⚡ 초고속 정상 (300ms)
                  </button>
                  <button
                    type="button"
                    onClick={() => !isRequesting && setScenario('slow')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all font-bold text-sm cursor-pointer ${
                      scenario === 'slow'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🐢 네트워크 지연 (3.0초)
                  </button>
                  <button
                    type="button"
                    onClick={() => !isRequesting && setScenario('offline')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all font-bold text-sm cursor-pointer ${
                      scenario === 'offline'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🔌 와이파이 단절 (에러)
                  </button>
                  <button
                    type="button"
                    onClick={() => !isRequesting && setScenario('error')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all font-bold text-sm cursor-pointer ${
                      scenario === 'error'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    💣 서버 500 오류 (장애)
                  </button>
                </div>
              </div>

              {/* 실행 트리거 */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerRequest}
                  disabled={isRequesting}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>데이터 요청 수신 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>🚀 선택한 시나리오로 데이터 요청 전송 (fetch)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>초기화</span>
                </button>
              </div>

              {/* 가상 브라우저 화면 */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
                <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <span className="font-mono text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                      https://api.petnews.com/v1/feed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-indigo-400 font-bold">
                      {scenario === 'fast' ? 'Fast (300ms)' : scenario === 'slow' ? 'Slow 3G (3,000ms)' : scenario === 'offline' ? 'Offline' : 'Server 500'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {viewState === 'idle' ? '대기 중' : viewState === 'loading' ? '수신 중 ⏳' : viewState === 'success' ? '200 OK ✨' : '오류 발생 🚨'}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/60 min-h-[340px] flex flex-col justify-center">
                  
                  {/* IDLE */}
                  {viewState === 'idle' && (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center shadow-inner">
                        <Inbox className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <strong className="text-base font-bold text-slate-200 block">데이터 요청 대기 중</strong>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                          상단의 시나리오를 선택한 뒤 [데이터 요청 전송] 버튼을 누르면 통신이 시작됩니다.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LOADING */}
                  {viewState === 'loading' && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-sm font-bold text-indigo-300">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                          <span>원격 서버에서 귀여운 반려동물 피드를 수신하는 중...</span>
                        </div>
                        <span className="text-sm font-mono font-bold bg-indigo-900 text-indigo-200 px-2.5 py-0.5 rounded border border-indigo-700 animate-pulse">
                          FETCHING
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-slate-700"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-700 rounded w-2/5"></div>
                              <div className="h-3 bg-slate-700/70 rounded w-1/4"></div>
                            </div>
                          </div>
                          <div className="space-y-2 pt-1">
                            <div className="h-3 bg-slate-700/80 rounded w-full"></div>
                            <div className="h-3 bg-slate-700/60 rounded w-4/5"></div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-slate-700"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                              <div className="h-3 bg-slate-700/70 rounded w-1/5"></div>
                            </div>
                          </div>
                          <div className="space-y-2 pt-1">
                            <div className="h-3 bg-slate-700/80 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {viewState === 'success' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>오늘의 실시간 반려동물 피드</span>
                        </span>
                        <span className="text-sm font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                          200 OK (성공)
                        </span>
                      </div>

                      {/* 피드 1 */}
                      <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                              🐱
                            </div>
                            <div>
                              <strong className="text-sm font-bold text-white block">치즈냥이의 햇살 낮잠</strong>
                              <span className="text-sm text-slate-400 font-medium">방금 전 도착 · 사진 1장</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            인기 급상승
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-normal">
                          따스한 창가에서 봄 햇살을 받으며 세상 편하게 낮잠에 빠져든 치즈 태비 고양이의 평화로운 일상입니다.
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5 text-rose-400">
                            <Heart className="w-4 h-4 fill-rose-500/20" />
                            <span className="font-bold">좋아요 1,420개</span>
                          </span>
                          <span className="text-indigo-400 font-medium">댓글 84개</span>
                        </div>
                      </div>

                      {/* 피드 2 */}
                      <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-sm">
                              🐶
                            </div>
                            <div>
                              <strong className="text-sm font-bold text-white block">골든리트리버 뭉치의 공놀이</strong>
                              <span className="text-sm text-slate-400 font-medium">2분 전 도착 · 비디오</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            신규 등록
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-normal">
                          푸른 잔디밭을 전력 질주하며 노란 테니스공을 물고 해맑게 웃는 뭉치의 사랑스러운 순간을 담았습니다!
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5 text-rose-400">
                            <Heart className="w-4 h-4 fill-rose-500/20" />
                            <span className="font-bold">좋아요 892개</span>
                          </span>
                          <span className="text-indigo-400 font-medium">댓글 35개</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ERROR */}
                  {viewState === 'error' && (
                    <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                        {scenario === 'offline' ? <WifiOff className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                      </div>
                      <div className="space-y-1.5">
                        <strong className="text-base font-bold text-white block">
                          {scenario === 'offline' ? '앗, 인터넷 연결이 불안정해요!' : '서버가 잠시 점검 중이에요!'}
                        </strong>
                        <p className="text-sm text-rose-200 leading-relaxed max-w-sm mx-auto font-normal">
                          {scenario === 'offline'
                            ? '와이파이나 데이터 케이블 연결 상태를 확인한 후 아래 버튼을 눌러 다시 시도해주세요.'
                            : '원격 서버에 일시적인 장애가 발생했습니다. 잠시 후 [다시 시도하기] 버튼을 눌러주세요.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 text-left font-mono text-sm text-rose-300 space-y-1">
                        <span className="text-sm text-slate-400 block font-sans font-bold">포획된 에러 코드:</span>
                        <span className="block font-bold">
                          {scenario === 'offline'
                            ? 'TypeError: Failed to fetch (NetworkOffline: Connection Refused)'
                            : 'HTTP 500 Internal Server Error (Remote Database Connection Timeout)'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTriggerRequest}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-sm font-bold transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>다시 시도하기 (원클릭 재요청)</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* 3단계 파이프라인 시각화 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>실시간 코드 진행 경로: try-catch-finally 3단계 안전모 추적</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-sm">
                  <div className={`p-3 rounded-xl border space-y-1 transition-all ${
                    stepHighlight === 'try' ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm' : 'bg-white border-slate-200'
                  }`}>
                    <span className="w-5 h-5 mx-auto rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm">1</span>
                    <strong className="text-slate-800 block">try {'{ 요청 시작 }'}</strong>
                    <span className="text-slate-500 text-sm">fetch() API 비동기 호출</span>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 transition-all ${
                    stepHighlight === 'catch' ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm' : 'bg-white border-slate-200'
                  }`}>
                    <span className="w-5 h-5 mx-auto rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm">2</span>
                    <strong className="text-slate-800 block">catch {'{ 오류 방어 }'}</strong>
                    <span className="text-slate-500 text-sm">친절한 Fallback 카드 렌더</span>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 transition-all ${
                    stepHighlight === 'finally' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm' : 'bg-white border-slate-200'
                  }`}>
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">3</span>
                    <strong className="text-slate-800 block">finally {'{ 안전 뒷정리 }'}</strong>
                    <span className="text-slate-500 text-sm">로딩 스피너 OFF 100% 보장</span>
                  </div>
                </div>
              </div>

            </div>

            {activeStage !== 'all' && (
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage1')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 1 미션 &amp; 원리</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음: Stage 3 실전 AI 퀘스트</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 03: 실전 최신 AI 5대 킬러 퀘스트                             */}
        {/* =================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    실전 최신 AI 5대 킬러 퀘스트 (ChatGPT &amp; Gemini 실전 프롬프트)
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  아래의 원클릭 프롬프트를 복사하여 실제 AI 챗봇에 입력해보세요. 예외 방어벽 구축과 타임아웃 가드, 실시간 온라인 감지 마법 코드를 즉시 소환합니다!
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article key={q.id} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-bold bg-indigo-50 text-indigo-700">
                        QUEST 0{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-500">{q.badge}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-slate-100 text-slate-700">
                      {q.level}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">{q.desc}</p>
                  </div>

                  {/* 프롬프트 박스 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-indigo-500" />
                        <span>실전 AI 복사 프롬프트</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPrompt(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">복사됨! ✨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>프롬프트 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {q.prompt}
                    </div>
                  </div>

                  {/* 충격 반응 & CS 비밀 */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>AI 소환 마법 &amp; 💡 컴퓨터 과학 비밀 해설</span>
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      <strong>💡 컴퓨터 과학 비밀:</strong> {q.csSecret}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {activeStage !== 'all' && (
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 2 가상 로딩 랩</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음: Stage 4 용어 &amp; 체크리스트</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 04: 주니어 개발자 전문 용어 돋보기 & 자가 점검 체크리스트    */}
        {/* =================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    전문 용어 돋보기 &amp; 자가 점검 체크리스트
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  오늘 배운 쉬운 원리들을 공식 컴퓨터 과학 용어로 정리하고, 6개 항목을 스스로 체크하여 시즌 4 최종장인 18강을 잠금 해제하세요!
                </p>
              </div>
            </div>

            {/* 1. 주니어 개발자를 위한 전문 용어 돋보기 */}
            <article className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/40 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-indigo-400" />
                    <span>JUNIOR DEVELOPER GLOSSARY</span>
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    어린이 비유와 컴퓨터 과학 공식 정의 1:1 매칭
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🔍 주니어 개발자를 위한 전문 용어 돋보기
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  본문에서 다룬 재미있는 비유들의 실제 소프트웨어 공학 공식 명칭과 정의를 확인해보세요.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-amber-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>1. 네트워크 지연 시간</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Network Latency (Round Trip Time)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
                    <strong>🧸 어린이 비유:</strong> "배달 주문을 넣었을 때 배달 오토바이가 신호등에 걸려 도착할 때까지 걸리는 째깍째깍 기다림 시간!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 데이터 패킷이 출발지(클라이언트 브라우저)에서 목적지(API 서버)로 전송되어 다시 응답을 받아 돌아올 때까지 소요되는 왕복 지연 시간(RTT)을 뜻합니다.
                  </p>
                </div>

                {/* 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-sky-300 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-sky-400" />
                      <span>2. 회전 로딩 표시기</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Loading Spinner (Activity Indicator)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm text-sky-200">
                    <strong>🧸 어린이 비유:</strong> "컴퓨터가 쉬지 않고 열심히 달리고 있다고 알려주려고 빙글빙글 돌아가는 안심 바람개비!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 백그라운드 비동기 작업(I/O, 네트워크 통신)이 진행 중임을 사용자에게 시각적으로 알려주어, 앱이 멈추거나 먹통이 된 것이 아님을 안내하는 애니메이션 인디케이터입니다.
                  </p>
                </div>

                {/* 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-purple-300 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-purple-400" />
                      <span>3. 스켈레톤 화면 구조</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Skeleton Screen (Placeholder Loading UI)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
                    <strong>🧸 어린이 비유:</strong> "진짜 그림을 채우기 전에 스케치북에 연필로 먼저 슥슥 밑그림 윤곽선을 잡아두는 뼈대 스케치!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 콘텐츠가 로드되는 동안 실제 UI 컴포넌트의 레이아웃 형태를 모방한 연회색 박스를 깜빡이며 먼저 보여줌으로써 레이아웃 흔들림(CLS)을 막고 체감 대기 시간을 심리적으로 단축시키는 화면 설계 기법입니다.
                  </p>
                </div>

                {/* 4 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-emerald-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span>4. 예외 방어 블록</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Exception Handling (try-catch-finally Defense)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
                    <strong>🧸 어린이 비유:</strong> "스케이트보드를 탈 때 무릎 보호대와 헬멧을 차서 넘어져도 다치지 않고 툭툭 털고 일어나는 안전 장비!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 런타임에 발생할 수 있는 잠재적 오류(예외, Exception)를 try 블록으로 감싸서 시스템 중단을 방지하고, catch 블록에서 안전한 후속 조치를 취하며, finally에서 정리 작업을 보장하는 방어 문법입니다.
                  </p>
                </div>

                {/* 5 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-rose-300 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <span>5. 대체 안내 화면</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Fallback UI &amp; Graceful Degradation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200">
                    <strong>🧸 어린이 비유:</strong> "자판기 음료수가 다 떨어졌을 때 그냥 돈을 삼키는 대신 '품절' 불을 켜고 돈을 돌려주는 친절한 자판기 안내판!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 주요 기능이나 원본 데이터 수신이 실패했을 때, 전체 시스템이 백지로 깨지는 대신 사용자에게 친절한 에러 메시지와 재시도 버튼을 제공하여 서비스 지속성을 유지하는 점진적 기능 저하 설계입니다.
                  </p>
                </div>

              </div>
            </article>

            {/* 2. 자가 점검 체크리스트 (8강 최신 규격) */}
            <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-emerald-600" />
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      17강 완주 자가 점검 체크리스트
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 font-normal">
                    배운 내용을 확인하고 6개 항목을 모두 완료하면 다음 강으로 이동할 수 있습니다.
                  </p>
                </div>
                <div className={`px-3.5 py-1.5 rounded-full font-bold text-sm shrink-0 self-start sm:self-auto ${
                  checkedCount === 6 ? 'bg-emerald-600 text-white font-black shadow-sm' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {checkedCount} / 6 완료
                </div>
              </div>

              {/* 게이지 바 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600">체크리스트 달성률</span>
                  <span className="text-emerald-600 font-mono font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>

              {/* 6개 항목 */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: '네트워크 지연 시간(Latency)과 하얀 먹통 화면의 심리적 불안감 이해',
                    desc: '0.5초에서 2초가량 걸리는 통신 왕복 시간 동안 화면에 피드백이 없으면 사용자가 앱 고장으로 오해함을 파악했습니다.'
                  },
                  {
                    title: '회전 스피너와 종이틀 스켈레톤(Skeleton UI)의 장단점 및 사용 기준 비교',
                    desc: '간단한 버튼엔 회전 스피너를, 피드나 카드 목록형 화면엔 레이아웃 흔들림(CLS)을 막는 스켈레톤을 적용함을 익혔습니다.'
                  },
                  {
                    title: 'try-catch-finally 3단계 안전모 파이프라인의 구조와 finally 필수성 체득',
                    desc: '오류가 발생하든 성공하든 무조건 100% 실행되는 finally 블록에서 로딩 스피너 종료(isLoading = false)를 보장했습니다.'
                  },
                  {
                    title: '가상 로딩 랩에서 4대 네트워크 시나리오(초고속, 3초 지연, 오프라인, 500 오류) 실험 완료',
                    desc: '지연 시간 변화에 따른 스켈레톤 펄스와 에러 발생 시 Fallback 카드로 상태가 전환되는 흐름을 직접 조작했습니다.'
                  },
                  {
                    title: '영문 에러 코드 날것 노출 금지 및 원클릭 "다시 시도" 복구 메커니즘 정복',
                    desc: '친절한 한국어 안내 문구와 따뜻한 아이콘, 그리고 페이지 새로고침 없이 즉시 재호출하는 retry 함수를 확인했습니다.'
                  },
                  {
                    title: '실전 AI 퀘스트를 통한 AbortController 타임아웃 및 온라인 감지 스크립트 확보',
                    desc: '무한 대기를 차단하는 5초 타임아웃 가드와 navigator.onLine 실시간 감지 신호등 프롬프트를 복사하여 실행했습니다.'
                  }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => handleCheck(idx)}
                      className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                      <span className="text-sm text-slate-500 leading-relaxed block font-normal">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* 100% 완주 축하 카드 */}
              {checkedCount === 6 && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/50 shadow-2xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
                      🎉
                    </div>
                    <div className="space-y-0.5">
                      <strong className="text-lg font-black text-white block">
                        축하합니다! 17강 로딩 상태 &amp; 예외 방어 과정을 완벽히 정복하셨습니다!
                      </strong>
                      <p className="text-sm text-emerald-300 font-normal">
                        이제 어떤 네트워크 장애가 닥쳐도 끄떡없는 프로 개발자의 UX 방어벽을 손에 넣었습니다.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href="/materials/ai/lessons/18-smart-tool-showcase/index.html"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>시즌 4 · 18강: 내 손으로 완성하는 AI 스마트 도구 종합 쇼케이스 도전하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <span className="text-sm text-slate-400 font-medium">시즌 4 트랙 최종 관문 언락 완료 ✨</span>
                  </div>
                </div>
              )}

            </article>

            {activeStage !== 'all' && (
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 3 실전 AI 퀘스트</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>맨 위로</span>
                </button>
              </div>
            )}
          </section>
        )}

      </main>

      {/* 3. 푸터 */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span>시즌 4 · 17강 로딩 상태 디자인 &amp; 예외 처리</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="/materials/ai/index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="/materials/ai/lessons/16-weather-coord/index.html" className="hover:text-slate-900 transition-colors">16강 바로가기</a>
            <a href="/materials/ai/lessons/18-smart-tool-showcase/index.html" className="hover:text-slate-900 transition-colors">18강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
