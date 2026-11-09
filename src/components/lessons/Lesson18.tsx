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
  MessageSquare,
  Blocks,
  Palette,
  Link,
  Cpu,
  Tag,
  MapPin,
  Utensils,
  School,
  Compass,
  Share2,
  Wifi,
  Battery
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type ToolType = 'weather' | 'lunch' | 'pet' | 'fortune';
type ThemeColor = 'sky' | 'emerald' | 'rose' | 'purple';

interface ToolConfig {
  type: ToolType;
  name: string;
  theme: ThemeColor;
  message: string;
}

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
    badge: 'URL 해시 상태 직렬화 파서',
    level: '웹 아키텍처 ★☆☆',
    title: 'URL Hash 기반 클라이언트 상태 직렬화(Serialize) 및 자동 복원(Deserialize) 함수 작성',
    desc: '서버 DB 없이도 도구 종류, 테마, 닉네임, 메시지를 URL 뒤에 인코딩하고, 페이지 로드 시 이를 파싱해 앱 화면을 온전히 복원하는 코드를 요청합니다.',
    prompt: `[역할]
너는 웹 프론트엔드 아키텍처와 URL 상태 관리를 전문으로 하는 시니어 개발자이자 코딩 멘토야.

[목표]
서버 데이터베이스를 사용하지 않고도, 사용자의 설정 상태를 브라우저 주소창의 해시(#hash) 문자열로 인코딩하고 복원하는 serializeStateToHash(state) 및 parseHashToState() 함수를 자바스크립트로 작성해 줘.

[세부 요구사항]
1. state 객체는 { tool: 'weather', theme: 'emerald', name: '은우의비서', msg: '안녕!' } 형태야.
2. 한글이나 특수문자가 깨지지 않도록 encodeURIComponent / decodeURIComponent 처리를 철저히 해 줘.
3. window.location.hash를 파싱할 때 '#' 기호를 안전하게 제거하고 URLSearchParams를 활용하는 최신 표준 방식을 적용해 줘.
4. 왜 URL 해시(#) 뒤의 문자열은 서버로 전송되지 않고 브라우저 클라이언트에서만 소비되는지 그 이유와 장점을 설명해 줘.
5. 초등학생도 쉽게 읽을 수 있도록 각 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '서버 트래픽을 단 1바이트도 쓰지 않고 전 세계 친구에게 내 도구 설정을 온전히 전달하는 마법 코드를 소환합니다!',
    csSecret: 'HTTP 스펙(RFC 3986)에 따르면 URL의 해시(#) 프래그먼트는 클라이언트 앵커 전용이므로 서버 요청 헤더에 절대 실리지 않아 무료 영구 보존이 가능합니다.'
  },
  {
    id: 'quest-02',
    badge: 'Web Share & 클립보드 하이브리드',
    level: '모바일 웹 ★★☆',
    title: 'Web Share API 지원 기기에서는 네이티브 공유 시트를, 미지원 기기에서는 1-Click 클립보드 복사를 실행하는 하이브리드 공유 모듈',
    desc: '스마트폰에서는 카카오톡·문자 다이얼로그를 띄우고, PC에서는 클립보드 복사와 토스트 알림을 띄우는 크로스 브라우징 함수를 작성합니다.',
    prompt: `[역할]
너는 크로스 플랫폼 모바일 웹 앱과 네이티브 인터페이스 연동 전문가야.

[목표]
사용자가 [공유하기] 버튼을 눌렀을 때 모바일과 PC 환경에 맞추어 최적의 동작을 제공하는 shareCustomTool(toolTitle, toolText, shareUrl) 함수를 자바스크립트로 구현해 줘.

[세부 요구사항]
1. navigator.share가 존재하는지 확인하여, 모바일 환경에서는 navigator.share({ title, text, url })을 실행해 줘.
2. 사용자가 공유 창을 열었다가 취소(AbortError)했을 때 브라우저 콘솔에 빨간 에러가 터지지 않도록 안전하게 try-catch로 감싸줘.
3. navigator.share가 없는 PC 환경에서는 navigator.clipboard.writeText(shareUrl)을 호출해 주소를 복사하고 '복사 완료!' 안내창을 띄워줘.
4. 초보자도 쉽게 따라 할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '기기 환경을 똑똑하게 감지해 스마트폰에선 메신저 창을, PC에선 클립보드 복사를 지능적으로 분기 실행합니다!',
    csSecret: 'Web Share API는 사용자의 직접적인 제스처(클릭) 이벤트 핸들러 안에서만 동작하도록 보안 샌드박스로 격리되어 있습니다.'
  },
  {
    id: 'quest-03',
    badge: '다중 테마 CSS 토큰 스위처',
    level: '디자인 시스템 ★★☆',
    title: 'CSS 커스텀 프로퍼티(변수)를 활용한 4대 감성 테마(Sky, Emerald, Rose, Purple) 동적 스위칭 엔진',
    desc: '버튼 클릭 하나로 전체 애플리케이션의 배경 그라데이션, 포인트 뱃지, 폰트 컬러를 리렌더링 없이 GPU 가속으로 0.3초 부드럽게 전환하는 테마 시스템을 구축합니다.',
    prompt: `[역할]
너는 글로벌 디자인 시스템과 테마 토큰(Theme Tokens)을 설계하는 UI 엔지니어이자 프론트엔드 개발자야.

[목표]
사용자가 선택한 테마에 따라 전체 웹 앱의 비주얼을 실시간으로 바꾸어주는 CSS 변수 기반 다중 테마 시스템을 만들어 줘.

[세부 요구사항]
1. 4가지 테마(sky: 시원한 바다 파랑, emerald: 싱그러운 민트 초록, rose: 따뜻한 벚꽃 핑크, purple: 신비로운 우주 보라)의 CSS 커스텀 변수(--theme-primary, --theme-from, --theme-to, --theme-bg)를 정의해 줘.
2. 자바스크립트 함수 applyTheme(themeKey)를 작성해, document.documentElement 또는 컨테이너에 data-theme="emerald" 속성을 주입하게 해 줘.
3. 테마가 전환될 때 눈이 아프지 않도록 transition: all 0.3s ease-in-out을 적용하는 팁을 제공해 줘.
4. 모든 코드에 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '단 한 줄의 CSS 변수 갱신으로 수백 개 컴포넌트의 테마를 0.3초 만에 우아하게 갈아입히는 토큰 엔진을 완성합니다!',
    csSecret: 'CSS 변수를 활용하면 리플로우(Reflow) 없이 페인트/합성(Composite) 단계만 거치므로 버벅임 없는 60FPS 애니메이션이 보장됩니다.'
  },
  {
    id: 'quest-04',
    badge: 'localStorage 즐겨찾기 보관함',
    level: '스토리지 연동 ★★★',
    title: '로컬스토리지(localStorage)와 실시간 렌더링을 결합한 "나만의 즐겨찾기 도구" 영구 저장 매니저 구현',
    desc: '브라우저를 종료하거나 새로고침하더라도 내가 꾸민 설정값(도구 타입, 이름, 테마, 메시지)이 지워지지 않고 즉시 복원되는 스토리지 관리 클래스를 생성합니다.',
    prompt: `[역할]
너는 클라이언트 사이드 데이터 저장소와 웹 지속성(Persistence)을 전담하는 프론트엔드 엔지니어이자 교육자야.

[목표]
사용자가 스마트 도구 빌더에서 조립한 설정을 localStorage에 안전하게 영구 저장하고, 다음 방문 시 자동으로 불러오는 ToolStorageManager 객체를 자바스크립트로 구현해 줘.

[세부 요구사항]
1. saveConfig(config), loadConfig(), clearConfig() 3개의 메서드를 작성해 줘.
2. JSON.stringify()와 JSON.parse()를 안전하게 try-catch로 감싸, 로컬 스토리지가 손상되었을 때도 기본값(defaultConfig)을 반환하게 해 줘.
3. 브라우저의 시크릿 모드나 용량 초과(QuotaExceededError) 상황에서도 프로그램이 다운되지 않는 예외 처리 방패를 달아줘.
4. 초보자도 쉽게 따라 할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '브라우저를 껐다 켜도 내가 꾸민 스마트 도구가 마법처럼 복구되는 안전한 영구 보관 매니저를 완성합니다!',
    csSecret: 'localStorage는 HTTP 헤더에 실리지 않아 통신 대역폭을 낭비하지 않는 도메인별 5MB 용량의 브라우저 전용 로컬 영구 데이터베이스입니다.'
  },
  {
    id: 'quest-05',
    badge: '메신저 풍선 미리보기(OG) 태그',
    level: '소셜 최적화 ★★★',
    title: '카카오톡이나 문자 메신저에 링크를 붙여넣었을 때 예쁜 카드 미리보기를 띄우는 Open Graph(OG) 메타 태그 설계',
    desc: '그냥 까만 글씨 주소만 덩그러니 가는 것이 아니라, 매력적인 도구 제목, 대표 썸네일 이미지, 설명이 카드 박스로 뿅 나타나게 만드는 소셜 메타데이터 기술을 배웁니다.',
    prompt: `[역할]
너는 소셜 미디어 메타데이터 최적화(SMO)와 웹 검색 엔진 최적화(SEO)를 담당하는 전문가야.

[목표]
학생이 만든 나만의 스마트 도구 웹 링크를 카카오톡이나 디스코드, 인스타그램 DM에 전송했을 때 매력적인 미리보기 리치 카드(Rich Snippet)가 뜨도록 HTML 메타 태그 템플릿을 작성해 줘.

[세부 요구사항]
1. og:title, og:description, og:image, og:url, og:type 메타 태그의 역할을 초등학생 비유로 설명해 줘.
2. 카카오톡 스크랩 봇이 좋아하는 이미지 권장 규격(1200x630 비율)과 캐시 삭제(스크랩 갱신) 방법을 알려줘.
3. 트위터/X 카드용 twitter:card, twitter:title 메타 태그도 함께 포함해 줘.
4. 모든 코드에 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '카카오톡 채팅창에 링크를 올리자마자 예쁜 썸네일과 제목이 풍선처럼 돋보이는 리치 카드 메타 태그를 완벽하게 생성합니다!',
    csSecret: '소셜 봇은 자바스크립트를 해석하지 않고 HTML 헤더의 Open Graph 태그만 읽으므로, 메타 태그는 최초 HTML 문서에 직접 선언되어야 합니다.'
  }
];

export default function Lesson18() {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 빌더 상태
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    type: 'weather',
    name: '은우의 아침 날씨 비서',
    theme: 'sky',
    message: '오늘 비 오니까 우산 잊지 마! 오늘도 좋은 하루 보내! 💖'
  });

  const [shareToast, setShareToast] = useState<string>('공유 준비 완료 💌');

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_18_checklist');
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
    localStorage.setItem('ai_lesson_18_checklist', JSON.stringify(next));
    if (next.every(Boolean)) {
      localStorage.setItem('ai_lesson_18_completed', 'true');
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

  const shareUrl = `https://judge.ai/share#tool=${toolConfig.type}&theme=${toolConfig.theme}&name=${encodeURIComponent(toolConfig.name)}&msg=${encodeURIComponent(toolConfig.message)}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareToast('클립보드 복사 완료! 🎉');
      setTimeout(() => setShareToast('공유 준비 완료 💌'), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: toolConfig.name,
        text: `${toolConfig.name} - ${toolConfig.message}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/materials/ai/index.html"
              className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-amber-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  시즌 4 · 18강: 가족과 친구에게 자랑하기: 세상에 하나뿐인 나만의 스마트 도구 완성
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
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage1' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage2' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>스마트 도구 빌더</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage3' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage4' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-amber-700 shadow-sm'
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
            activeStage === 'stage1' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          1. 미션&amp;원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage2' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          2. 도구 빌더
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage3' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          3. AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage4' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          4. 용어&amp;점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'all' ? 'text-amber-700 bg-amber-50' : 'text-slate-500'
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
            <article className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>시즌 4 피날레 대단원 · 종합 프로젝트 &amp; 쇼케이스</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    세상에 하나뿐인 나만의 도구
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    가족과 친구에게 자랑하기:<br className="hidden sm:inline" />
                    세상에 하나뿐인 나만의 스마트 도구 완성
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    JSON, fetch, 공공 오픈 데이터, 조건부 추천, 예외 방어까지! 시즌 4에서 연마한 5대 핵심 기술을 하나로 융합하여 가족과 친구들이 매일 쓰는 진짜 완성형 웹 서비스를 제작하고 1-Click 링크로 선물합니다.
                  </p>
                </div>

                {/* 메타 정보 3개 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-slate-400 block font-medium">소요 시간</span>
                      <strong className="text-sm font-bold text-slate-100 whitespace-nowrap">약 45분 완주</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-slate-400 block font-medium">실습 난이도</span>
                      <strong className="text-sm font-bold text-slate-100 whitespace-nowrap">종합 실전 프로젝트</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-slate-400 block font-medium">배포 방식</span>
                      <strong className="text-sm font-bold text-slate-100 whitespace-nowrap">1-Click 마법 링크</strong>
                    </div>
                  </div>
                </div>

                {/* 3대 도전 목표 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-amber-900/60 space-y-3">
                  <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>이번 18강에서 달성할 3대 종합 마스터 목표</span>
                  </span>
                  <ul className="learning-goals-list grid grid-cols-1 gap-2.5 text-sm text-slate-200">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>5대 실무 기술 통합 융합:</strong> JSON 사물함, fetch 배달부, 오픈 API, 조건부 추천, try-catch 안전모를 하나의 완제품으로 결합합니다.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>맞춤 닉네임 &amp; 4대 감성 테마 개인화:</strong> 도구 제목과 컬러(스카이, 에메랄드, 로즈, 퍼플), 선물 메시지를 동적으로 반영합니다.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>URL 해시(#) 상태 직렬화 &amp; 1-Click 공유:</strong> 서버 데이터베이스 없이 주소창 링크만으로 전 세계 친구에게 내 작품을 선물합니다.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* 3구 벤토 그리드 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  소프트웨어 완제품을 만드는 3대 프로덕트 엔지니어링 원리
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 원리 01 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-amber-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Blocks className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-amber-50 text-amber-700">원리 01</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">1. 시스템 통합 융합</h4>
                      <span className="text-sm font-mono text-slate-400 block">System Integration</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      각자 떨어져 있던 JSON, 비동기 통신, 조건문, 예외 처리를 하나로 맞물려 실제 사람들의 불편을 해결하는 완전한 완제품 애플리케이션으로 승화시킵니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-sm text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "흩어져 있던 레고 조각들을 모아 마침내 우주선 발명품을 완성하는 순간!"
                    </p>
                  </div>
                </article>

                {/* 원리 02 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Palette className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">원리 02</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">2. 개인화 커스터마이징</h4>
                      <span className="text-sm font-mono text-slate-400 block">Personalization Engine</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      사용자의 취향(테마 컬러)과 닉네임, 전하고 싶은 한 줄 메시지를 실시간 상태로 묶어 화면 전체에 살아 숨 쉬듯 즉각 반영하는 인터랙션을 만듭니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm text-indigo-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "새 가방에 내 이름표를 달고 내가 좋아하는 캐릭터 키링을 달아주는 일!"
                    </p>
                  </div>
                </article>

                {/* 원리 03 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Link className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">원리 03</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">3. URL 해시 직렬화</h4>
                      <span className="text-sm font-mono text-slate-400 block">URL State Serialization</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      복잡한 서버 DB 없이도 주소창 뒤의 # 해시 파라미터에 모든 설정값을 압축하여 전송해 친구 폰에서도 내 작품이 똑같이 복원되게 합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-sm text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "친구에게 보내는 보물 지도 편지 봉투에 '비밀 좌표 번호'를 적어두는 것!"
                    </p>
                  </div>
                </article>

              </div>
            </section>

            {/* 알림 배너 */}
            <aside className="p-5 rounded-2xl bg-gradient-to-r from-amber-900 to-slate-900 text-white border border-amber-700/60 shadow-md flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-base font-bold text-white block">주니어 개발자의 제1원칙: 완성도(Polish)와 따뜻한 사용자 배려가 진짜 실력이다!</strong>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  단순히 API 코드가 돌아간다고 해서 프로그램이 끝난 것이 아닙니다. 사용자가 첫 3초 만에 무엇을 하는 도구인지 알아차릴 수 있는 직관적인 이름표, 눈이 편안한 테마 대비, 그리고 1-Click 공유 후 '복사됨!' 알림처럼 <strong>사소한 디테일을 세심하게 챙길 때 비로소 사람들이 사랑하는 진짜 서비스</strong>가 됩니다.
                </p>
              </div>
            </aside>

            {activeStage !== 'all' && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>다음 단계: Stage 2 스마트 도구 빌더</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 스마트 도구 제작실 & 라이브 쇼케이스    */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    나만의 스마트 도구 제작실 &amp; 라이브 쇼케이스
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  도구 엔진(날씨, 급식, 포켓몬, 행운 조언기)을 고르고, 나만의 타이틀과 감성 테마, 따뜻한 선물 메시지를 설정하여 실시간 가상 모바일 화면에 조립해보세요.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* 컨트롤러 폼 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-600" />
                    <span>1. 도구 엔진 선택</span>
                  </label>
                  <select
                    value={toolConfig.type}
                    onChange={(e) => setToolConfig({ ...toolConfig, type: e.target.value as ToolType })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="weather">⛅ 우리 동네 날씨 &amp; 옷차림 코디네이터 (기상청 연동)</option>
                    <option value="lunch">🍱 오늘 학교 영양 급식 알리미 (교육청 식단 연동)</option>
                    <option value="pet">🐾 전설의 포켓몬 &amp; 반려동물 도감 (PokeAPI 연동)</option>
                    <option value="fortune">🔮 매일매일 AI 행운 나침반 (럭키 넘버 &amp; 명언 조언)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>2. 도구 맞춤 이름 (앱 타이틀)</span>
                  </label>
                  <input
                    type="text"
                    value={toolConfig.name}
                    onChange={(e) => setToolConfig({ ...toolConfig, name: e.target.value })}
                    placeholder="예: 은우의 스마트 비서"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                </div>

              </div>

              {/* 감성 테마 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>3. 감성 테마 컬러 선택</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'sky', label: '🌊 오션 스카이' },
                    { key: 'emerald', label: '🌿 에메랄드 민트' },
                    { key: 'rose', label: '🌸 로맨틱 로즈' },
                    { key: 'purple', label: '🌌 사이버 퍼플' }
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setToolConfig({ ...toolConfig, theme: t.key as ThemeColor })}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all font-bold text-sm cursor-pointer ${
                        toolConfig.theme === t.key
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 선물 메시지 */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>4. 친구나 가족에게 전할 한 줄 선물 메시지</span>
                </label>
                <input
                  type="text"
                  value={toolConfig.message}
                  onChange={(e) => setToolConfig({ ...toolConfig, message: e.target.value })}
                  placeholder="예: 오늘도 맛있는 점심 먹고 파이팅!"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
              </div>

              {/* 가상 모바일 디바이스 프레임 */}
              <div className="bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-xl overflow-hidden max-w-md mx-auto">
                
                <div className="bg-slate-950 px-5 py-2.5 flex items-center justify-between text-sm text-slate-400 font-mono">
                  <span>09:41 AM</span>
                  <div className="w-14 h-4 bg-slate-800 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-5 space-y-4 bg-slate-900 min-h-[380px]">
                  
                  {/* 테마 배너 */}
                  <div className={`p-4 rounded-2xl text-white space-y-2 shadow-md transition-all duration-300 bg-gradient-to-r ${
                    toolConfig.theme === 'sky'
                      ? 'from-sky-500 to-blue-600'
                      : toolConfig.theme === 'emerald'
                      ? 'from-emerald-500 to-teal-600'
                      : toolConfig.theme === 'rose'
                      ? 'from-rose-500 to-pink-600'
                      : 'from-purple-600 to-indigo-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                          {toolConfig.type === 'weather' && <CloudSun className="w-5 h-5" />}
                          {toolConfig.type === 'lunch' && <Utensils className="w-5 h-5" />}
                          {toolConfig.type === 'pet' && <Sparkles className="w-5 h-5" />}
                          {toolConfig.type === 'fortune' && <Compass className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-sm sm:text-base font-bold block leading-tight truncate">
                            {toolConfig.name || '나만의 스마트 도구'}
                          </strong>
                          <span className="text-sm text-white/90 font-medium">
                            {toolConfig.type === 'weather' && '실시간 기상청 날씨 연동'}
                            {toolConfig.type === 'lunch' && '교육청 실시간 급식 식단 연동'}
                            {toolConfig.type === 'pet' && '오픈 API 포켓몬 & 펫 도감'}
                            {toolConfig.type === 'fortune' && 'AI 일일 행운 나침반'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-white/20 backdrop-blur-xs text-white">
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* 동적 도구 콘텐츠 박스 */}
                  <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-sm space-y-3 text-white">
                    {toolConfig.type === 'weather' && (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                          <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-400" />
                            <span>서울특별시 종로구 세종대로</span>
                          </span>
                          <span className="text-sm font-mono px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 font-bold border border-sky-500/40">
                            18.5°C 맑음
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                          <strong className="text-sm font-bold text-amber-300 block flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>추천 옷차림 코디네이션</span>
                          </strong>
                          <p className="text-sm text-slate-300 leading-relaxed font-normal">
                            일교차가 10도 이상 벌어지니 <strong>가벼운 가디건</strong>이나 <strong>바람막이</strong>를 챙기세요!
                          </p>
                        </div>
                      </>
                    )}

                    {toolConfig.type === 'lunch' && (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                          <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <School className="w-4 h-4 text-emerald-400" />
                            <span>서울미래초등학교 오늘의 식단</span>
                          </span>
                          <span className="text-sm font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                            중식 완료
                          </span>
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1 pl-1 font-normal">
                          <li>• 발아현미밥 &amp; 차돌된장찌개</li>
                          <li>• 수제 떡갈비 구이 (특제 양념소스)</li>
                          <li>• 해물 쟁반 볶음우동 &amp; 깍두기</li>
                          <li>• 유기농 조각 사과 &amp; 칼슘 요구르트</li>
                        </ul>
                      </>
                    )}

                    {toolConfig.type === 'pet' && (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-slate-400">#025</span>
                            <strong className="text-sm font-bold text-white">피카츄 (Pikachu)</strong>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            전기 타입
                          </span>
                        </div>
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/30">
                            ⚡
                          </div>
                          <div className="flex-1 space-y-1 text-sm">
                            <div className="flex justify-between text-sm text-slate-300">
                              <span>체력 (HP)</span>
                              <span className="font-bold text-white">35 / 35</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full w-4/5"></div>
                            </div>
                            <span className="text-sm text-slate-400 block pt-0.5">대표 기술: 10만 볼트 (Thunderbolt)</span>
                          </div>
                        </div>
                      </>
                    )}

                    {toolConfig.type === 'fortune' && (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                          <strong className="text-sm font-bold text-white">오늘의 행운 부적 &amp; 럭키 넘버</strong>
                          <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                            대길 (大吉)
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center space-y-1">
                          <span className="text-sm font-bold text-purple-300 block">"작은 도전이 내일의 거대한 기적이 됩니다!"</span>
                          <span className="text-sm text-purple-400 block">오늘의 용기 충전율 100% ✨</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 text-sm font-mono font-bold flex items-center justify-center border border-amber-500/30">7</span>
                          <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-mono font-bold flex items-center justify-center border border-indigo-500/30">14</span>
                          <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-mono font-bold flex items-center justify-center border border-emerald-500/30">21</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 친구 선물 메시지 카드 */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-amber-300">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30" />
                      <span>제작자의 선물 메시지</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-snug font-medium pl-0.5">
                      {toolConfig.message || '행복한 하루 보내세요!'}
                    </p>
                  </div>

                </div>

                <div className="bg-slate-950 py-2.5 flex justify-center">
                  <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
                </div>
              </div>

              {/* 3. 🔗 1-Click 마법 링크 공유 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <strong className="text-sm sm:text-base font-bold text-slate-900">1-Click 마법 링크 공유</strong>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-white text-slate-600 border border-slate-200 self-start sm:self-auto">
                    {shareToast}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-700 block">생성된 마법 주소 (URL Hash 직렬화)</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-700 focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                      <span>복사하기</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>스마트폰 친구들에게 선물 메시지 전송 (Web Share)</span>
                </button>
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
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
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
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    실전 최신 AI 5대 킬러 퀘스트 (ChatGPT &amp; Gemini 실전 프롬프트)
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  아래의 원클릭 프롬프트를 복사하여 실제 AI 챗봇에 입력해보세요. 상태 직렬화, 하이브리드 공유, 다중 테마 토큰, Open Graph 메타 태그 코드를 즉시 소환합니다!
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article key={q.id} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-bold bg-amber-50 text-amber-700">
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
                        <Code className="w-4 h-4 text-amber-500" />
                        <span>실전 AI 복사 프롬프트</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPrompt(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
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
                  <span>이전: Stage 2 스마트 도구 빌더</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
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
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    전문 용어 돋보기 &amp; 자가 점검 체크리스트
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  오늘 배운 쉬운 원리들을 공식 소프트웨어 공학 용어로 정리하고, 6개 항목을 스스로 체크하여 시즌 4 완주 인증서와 시즌 5(19강 AI 챗봇 발명가)를 잠금 해제하세요!
                </p>
              </div>
            </div>

            {/* 1. 주니어 개발자를 위한 전문 용어 돋보기 */}
            <article className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-900/40 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-amber-400" />
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
                      <Blocks className="w-4 h-4 text-amber-400" />
                      <span>1. 종합 통합 프로젝트</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">System Integration &amp; Capstone Project</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
                    <strong>🧸 어린이 비유:</strong> "흩어져 있던 레고 블록들을 조립해서 드디어 완성한 거대하고 멋진 나만의 우주 정거장 발명품!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 개별 학습 단위에서 습득한 프로그래밍 언어, 네트워크 통신, 비동기 제어, 예외 방어 등의 파편화된 기술들을 종합적으로 융합하여 하나의 완전한 완제품 애플리케이션으로 완성하는 최종 프로젝트입니다.
                  </p>
                </div>

                {/* 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-sky-300 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-sky-400" />
                      <span>2. 개인화 커스터마이징</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Personalization Engine (UX Customization)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm text-sky-200">
                    <strong>🧸 어린이 비유:</strong> "새 가방에 내 이름표를 달고 내가 좋아하는 스티커로 꾸며 세상에 딱 하나뿐인 내 가방으로 만드는 일!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 사용자의 선호도, 식별자(닉네임), 지리적 위치 등의 개별 특성을 파악하여 각 사용자에게 최적화된 콘텐츠와 인터페이스 레이아웃을 제공하는 개인화 엔지니어링입니다.
                  </p>
                </div>

                {/* 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-emerald-300 flex items-center gap-2">
                      <Link className="w-4 h-4 text-emerald-400" />
                      <span>3. 주소창 상태 직렬화</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">URL Hash State Serialization (URI Fragmentation)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
                    <strong>🧸 어린이 비유:</strong> "친구에게 보낼 편지 봉투 겉면에 적어둔 '비밀 힌트와 보물 위치 번호'!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 웹 브라우저의 URI 구조 중 해시(#hash)를 활용하여, 페이지를 새로고침하거나 친구에게 공유하더라도 동일한 애플리케이션 상태를 복원할 수 있도록 문자열로 상태를 직렬화하는 기법입니다.
                  </p>
                </div>

                {/* 4 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-purple-300 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-purple-400" />
                      <span>4. 웹 공유 인터페이스</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Web Share API (Native Sharing Integration)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
                    <strong>🧸 어린이 비유:</strong> "스마트폰의 카카오톡이나 메시지 창을 마법처럼 뿅 띄워서 친구에게 내 발명품을 단번에 선물하는 마법 단추!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 웹 애플리케이션에서 스마트폰 OS의 네이티브 공유 다이얼로그(시스템 시트)를 호출하여 텍스트, 링크, 파일 등을 타 앱으로 원클릭 전송할 수 있도록 지원하는 웹 표준 인터페이스입니다.
                  </p>
                </div>

                {/* 5 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-rose-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-rose-400" />
                      <span>5. 사용자 경험 완성도</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">UX Polish (Micro-Interaction &amp; Refinement)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200">
                    <strong>🧸 어린이 비유:</strong> "나무 조각을 다 깎은 뒤 손에 가시가 찔리지 않게 고운 사포로 슥슥 문지르고 반짝반짝 광을 내는 마무리 손질!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 핵심 기능의 정상 동작을 넘어 로딩 피드백, 반응형 여백, 색상 대비, 복사 시 시각 피드백 등 사소한 디테일을 세밀하게 다듬어 최상의 만족도를 제공하는 인터페이스 폴리싱 작업입니다.
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
                      18강 완주 자가 점검 체크리스트
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 font-normal">
                    배운 내용을 확인하고 6개 항목을 모두 완료하면 시즌 4 완주 인증서와 19강이 열립니다.
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
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>

              {/* 6개 항목 */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: '5대 핵심 기술 융합과 종합 시스템 통합 이해',
                    desc: 'JSON, fetch, 오픈 데이터, 조건부 로직, 예외 처리를 결합해 완성형 스마트 웹 도구를 조립했습니다.'
                  },
                  {
                    title: '나만의 앱 타이틀 & 닉네임 동적 상태 바인딩 체득',
                    desc: '사용자가 친근하게 느낄 수 있는 맞춤형 도구 이름을 지정하고 실시간 화면에 반영했습니다.'
                  },
                  {
                    title: '4대 감성 테마(스카이, 에메랄드, 로즈, 퍼플) 동적 스타일링 정복',
                    desc: '테마 버튼 클릭 시 실시간으로 앱의 컬러 그라데이션과 뱃지 색상을 변경했습니다.'
                  },
                  {
                    title: 'URL 해시(#) 상태 직렬화 마법과 서버리스 공유 체득',
                    desc: '도구의 모든 설정값을 URL 주소에 압축하여 친구에게 온보딩시키는 원리를 파악했습니다.'
                  },
                  {
                    title: '1-Click 공유와 마이크로 피드백 & Web Share API 연동',
                    desc: '클립보드 복사 시 "복사됨!" 알림을 주고 Web Share API로 모바일 메신저와 연결했습니다.'
                  },
                  {
                    title: '시즌 4 스마트 도구 완주와 나만의 디지털 포트폴리오 확보',
                    desc: '13강부터 18강까지 전 과정을 완주하고 세상에 단 하나뿐인 나만의 소프트웨어 작품을 완성했습니다.'
                  }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => handleCheck(idx)}
                      className="w-5 h-5 rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                      <span className="text-sm text-slate-500 leading-relaxed block font-normal">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* 100% 완주 축하 및 19강 언락 카드 */}
              {checkedCount === 6 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white border-2 border-amber-500/50 shadow-2xl space-y-5 animate-pulse">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
                        🏆
                      </div>
                      <div>
                        <strong className="text-lg font-black text-white block">
                          시즌 4 실생활 스마트 도구 트랙 공식 완주 인증서!
                        </strong>
                        <span className="text-sm font-mono text-amber-300 font-bold">CERTIFICATE OF FULL-STACK MASTERY</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      공식 수료 ★★★★★
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-1">
                    <h5 className="text-base font-bold text-amber-200">
                      축하합니다! 주니어 오픈 API &amp; 스마트 웹 도구 마스터에 등극하셨습니다!
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      13강 JSON 외계인 통신부터 18강 나만의 스마트 도구 완성까지 전 과정을 완벽히 이수하여, 이제 공공 데이터를 활용해 사람들의 문제를 해결하는 진짜 소프트웨어 창작자가 되었습니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-sm text-amber-300 font-semibold block">시즌 5 대망의 시작! AI 챗봇 발명가 트랙 오픈</span>
                      <p className="text-sm text-white font-bold">시즌 5 · 19강: 주니어 AI 발명가: 주변의 불편을 해결하는 챗봇 기획</p>
                    </div>
                    <a
                      href="/materials/ai/lessons/19-ai-inventor/index.html"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>19강으로 즉시 이동하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
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
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-medium">AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span>시즌 4 피날레 · 18강 나만의 스마트 도구 완성</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="/materials/ai/index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="/materials/ai/lessons/17-loading-states/index.html" className="hover:text-slate-900 transition-colors">17강 바로가기</a>
            <a href="/materials/ai/lessons/19-ai-inventor/index.html" className="hover:text-slate-900 transition-colors">19강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
