import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Award,
  RotateCcw,
  Copy,
  Check,
  Bot,
  Lightbulb,
  Layers,
  Send,
  Volume2,
  Bell,
  Palette,
  Compass,
  BookOpen,
  User,
  Terminal,
  Gem,
  ZoomIn,
  Sliders,
  Eye
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type ThemeType = 'chef' | 'study' | 'story';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface ThemeConfig {
  name: string;
  badge: string;
  avatarBg: string;
  bubbleAccent: string;
  welcome: string;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  chef: {
    name: '챗봇 셰프 (Beta)',
    badge: 'THEME: 셰프 (Emerald/Amber)',
    avatarBg: 'bg-emerald-600',
    bubbleAccent: 'bg-emerald-600',
    welcome: '안녕하세요! 요리 레시피와 건강 급식을 알려주는 챗봇 셰프 베타입니다! 🍱 무엇이든 물어보시면 귀로 들려드려요!'
  },
  study: {
    name: '스터디 메이트 (Beta)',
    badge: 'THEME: 스터디 메이트 (Indigo)',
    avatarBg: 'bg-indigo-600',
    bubbleAccent: 'bg-indigo-600',
    welcome: '반가워요! 영어단어와 시험 공부 꿀팁을 전수하는 스터디 메이트 베타입니다! 📚 지치지 않게 함께해요!'
  },
  story: {
    name: '스토리텔러 (Beta)',
    badge: 'THEME: 스토리텔러 (Purple)',
    avatarBg: 'bg-purple-600',
    bubbleAccent: 'bg-purple-600',
    welcome: '안녕! 상상 속 모험 이야기를 끝없이 지어내는 스토리텔러 베타야! 🔮 어떤 흥미진진한 모험을 시작해볼까?'
  }
};

const INTENT_DATA: Record<string, { keywords: string[]; responses: string[] }> = {
  meal: {
    keywords: ['급식', '점심', '메뉴', '밥', '식단', '칼로리'],
    responses: [
      '오늘의 점심 급식 식단은 [찰흑미밥, 소고기 미역국, 수제 치즈돈가스, 콩나물무침, 배추김치, 방울토마토] 입니다! 총 680칼로리로 영양 만점이에요! 🍱',
      '오늘 점심 메뉴는 [치킨마요 덮밥, 팽이버섯 된장국, 떡볶이, 깍두기, 요구르트] 입니다! 친구들에게 가장 인기 많은 식단이에요! 😋'
    ]
  },
  weather: {
    keywords: ['날씨', '비', '우산', '눈', '기온', '추워', '더워'],
    responses: [
      '오후 3시경부터 비 소식이 있으니 가방에 가벼운 3단 접이식 우산을 챙기세요! 쌀쌀할 수 있으니 겉옷도 잊지 마세요! ☔',
      '오늘은 쾌청하고 맑은 하늘이 이어지겠지만, 일교차가 10도 이상 벌어지니 감기 조심하세요! 🌤️'
    ]
  },
  voca: {
    keywords: ['단어', '영어', '외우', '암기', '꿀팁', '깜지'],
    responses: [
      '영단어는 깜지 쓰기보다 연상 단어와 함께 문장 속에서 소리 내어 읽고, 에빙하우스 망각주기(1일 뒤, 3일 뒤)로 복습할 때 기억이 3배 오래 갑니다! 📚',
      '오늘의 강력 추천 단어는 "Resilience(회복탄력성)"입니다! 넘어져도 툭툭 털고 일어나는 힘을 뜻해요! 💡'
    ]
  }
};

const Lesson22: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('chef');
  const [autoTts, setAutoTts] = useState(true);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 채팅 상태
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '안녕하세요! 모든 기능이 합체된 \\'베타 빌드 챗봇\\'에 오신 것을 환영해요! 🎉\\n이제 제 답변 오른쪽 위의 [🔊 음성 듣기] 버튼을 누르면 사람 목소리로 읽어드리고, [📋 복사하기] 버튼을 누르면 화면 아래에 예쁜 토스트가 뿅 나타납니다!',
      time: '방금 전'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // 체크리스트 상태
  const TOTAL_CHECKS = 6;
  const [checklist, setChecklist] = useState<number[]>([]);
  const [copiedQuest, setCopiedQuest] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_22_checklist');
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch {
      setChecklist([]);
    }
  }, []);

  const toggleCheck = (idx: number) => {
    const next = checklist.includes(idx)
      ? checklist.filter((i) => i !== idx)
      : [...checklist, idx];
    setChecklist(next);
    localStorage.setItem('ai_lesson_22_checklist', JSON.stringify(next));
    if (next.length === TOTAL_CHECKS) {
      localStorage.setItem('ai_lesson_22_completed', 'true');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('현재 브라우저가 음성 합성(TTS)을 지원하지 않습니다.');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[[^\]]+\]/g, '').replace(/[🍱☔📚💡✨😊😋🎉]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = ttsRate;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    showToast('답변 낭독을 시작합니다. 🔊');
  };

  const copyBubble = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('클립보드에 답변이 복사되었습니다! ✨');
    });
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || userInput).trim();
    if (!query || isProcessing) return;

    setUserInput('');
    setIsProcessing(true);

    const currentTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    // 1. 사용자 메시지 렌더링
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: currentTime
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. 인위적 비동기 딜레이 (700ms) 후 봇 응답
    setTimeout(() => {
      let finalReply = '';
      let matchedIntent: string | null = null;

      for (const [key, data] of Object.entries(INTENT_DATA)) {
        if (data.keywords.some(k => query.includes(k))) {
          matchedIntent = key;
          break;
        }
      }

      if (matchedIntent) {
        const resps = INTENT_DATA[matchedIntent].responses;
        finalReply = resps[Math.floor(Math.random() * resps.length)];
      } else {
        finalReply = '죄송해요, 입력하신 내용에서 정확한 키워드를 찾지 못했어요. 😅 "급식 메뉴", "오늘 날씨", "영단어 꿀팁"처럼 명확하게 다시 말씀해 주시겠어요?';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: finalReply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (autoTts) {
        speakText(finalReply);
      }

      setIsProcessing(false);
    }, 700);
  };

  const resetRoom = () => {
    window.speechSynthesis?.cancel();
    setTurnCount(0);
    setMessages([
      {
        id: 'reset-welcome',
        sender: 'bot',
        text: '대화창이 깨끗하게 리셋되었습니다! 새로운 질문을 들려주세요. 😊',
        time: '방금 전'
      }
    ]);
    showToast('대화창이 성공적으로 초기화되었습니다! 🔄');
  };

  const copyPrompt = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuest(idx);
    setTimeout(() => setCopiedQuest(null), 1800);
  };

  const progressPercent = Math.round((checklist.length / TOTAL_CHECKS) * 100);
  const themeCfg = THEMES[currentTheme];

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">
      
      {/* ===================================================================== */}
      {/* 1. 풀 너비 GNB 헤더 (Full-Width GNB)                                   */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 심볼 & 코스 브레드크럼 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm hover:bg-indigo-700 transition-colors shrink-0"
              title="코스 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2 min-w-0 text-sm">
              <a href="../../index.html" className="font-medium text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                AI·코딩 24강
              </a>
              <span className="text-slate-300 shrink-0">/</span>
              <span className="text-sm font-bold text-slate-900 truncate">
                시즌 4 · 22강: 모든 기능 합체! 디자인 다듬기와 마지막 버그 잡기 (베타 빌드)
              </span>
            </div>
          </div>

          {/* [우측]: 4단계 스테이지 스위처 버튼 그룹 (20px 정원형 배지) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0" role="tablist">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              <span>베타 스튜디오</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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

      {/* [모바일 전용] 서브 스위처 바 */}
      <div className="md:hidden flex items-center justify-around gap-1 px-3 py-2 bg-white border-b border-slate-200 sticky top-16 z-30 overflow-x-auto">
        {(['stage1', 'stage2', 'stage3', 'stage4', 'all'] as StageTab[]).map((stg, i) => (
          <button
            key={stg}
            type="button"
            onClick={() => setActiveStage(stg)}
            className={`px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 whitespace-nowrap ${
              activeStage === stg ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            {stg !== 'all' && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === stg ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {i + 1}
              </span>
            )}
            <span>
              {stg === 'stage1' && '원리'}
              {stg === 'stage2' && '스튜디오'}
              {stg === 'stage3' && '퀘스트'}
              {stg === 'stage4' && '점검'}
              {stg === 'all' && '전체'}
            </span>
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* 2. 단일 컨테이너 몰입형 워크스페이스 (max-w-4xl)                        */}
      {/* ===================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* ------------------------------------------------------------------- */}
        {/* [STAGE 1] 미션 브리핑 & 핵심 개념 원리                              */}
        {/* ------------------------------------------------------------------- */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8">
            {/* 히어로 카드 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl relative overflow-hidden space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Gem className="w-4 h-4" />
                    시즌 4 로컬 AI 코어 트랙 · 베타 빌드 완성
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-slate-200 border border-white/10">
                    <Volume2 className="w-4 h-4" />
                    UX 폴리싱 &amp; 브라우저 TTS
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  모든 기능 합체! 디자인 다듬기와 마지막 버그 잡기<br />
                  (완성도 95% 챗봇 베타 빌드)
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  21강에서 챗봇의 첫 심장이 힘차게 뛰기 시작했습니다. 하지만 친구들에게 자랑하기에는 아직 아쉬운 부분들이 있죠! 
                  귀로 듣는 <strong>한국어 음성 합성(Web Speech TTS)</strong>, 
                  화면을 가리지 않고 2초 뒤 사라지는 <strong>플로팅 토스트(Toast)</strong>, 
                  그리고 챗봇의 성격에 맞춘 <strong>감성 테마 스위처</strong>까지 모두 결합하여 
                  진짜 상용 서비스 수준의 당당한 <strong>'베타 빌드(Beta Build)'</strong>를 완성해 봅니다.
                </p>
              </div>

              {/* 도전 목표 3열 카드 (소요 시간 완전 배제) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Volume2 className="w-4 h-4" />
                    <span>1. 한국어 음성 합성(TTS)</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Web Speech API를 연동하여 챗봇 답변을 또박또박 귀로 들려주는 성우 마이크를 장착합니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Bell className="w-4 h-4" />
                    <span>2. 플로팅 토스트 &amp; 복사</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    화면을 방해하지 않는 토스트 알림과 말풍선 1-Click 클립보드 복사 편의성을 구축합니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Palette className="w-4 h-4" />
                    <span>3. 감성 테마 &amp; UX 폴리싱</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    캐릭터 페르소나별 테마 동기화와 마지막 잔여 버그 소탕으로 완성도를 95%로 끌어올립니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 원리 카드 */}
            <article className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                  <Compass className="w-4 h-4" />
                  <span>Core Principles</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  알파에서 베타로 도약하는 3대 폴리싱 원리
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  단순히 돌아가는 코드를 넘어, 사용자 경험(UX)을 극대화하는 3대 고급 웹 테크닉을 배웁니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 원리 01 */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      원리 01
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">1. 소프트웨어 폴리싱</h4>
                    <span className="text-sm font-mono text-slate-400 block">Software Polishing</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    알파 빌드가 "기능이 돌아가는가?"를 증명했다면, 베타 빌드는 "누가 써도 편안하고 친절한가?"를 만족하도록 마이크로 인터랙션을 다듬는 작업입니다.
                  </p>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                    <span className="text-sm font-bold text-indigo-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 어린이 눈높이 비유
                    </span>
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      "거친 원목 나무의 모서리를 고운 사포로 문지르고 반짝반짝 니스칠을 하는 것과 같아요!"
                    </p>
                  </div>
                </div>

                {/* 원리 02 */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      원리 02
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">2. 브라우저 음성 합성</h4>
                    <span className="text-sm font-mono text-slate-400 block">Web Speech API (TTS)</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    별도의 외부 유료 라이브러리 없이, 최신 웹 브라우저가 기본 제공하는 SpeechSynthesisUtterance 객체를 통해 한국어 음성을 스피커로 출력합니다.
                  </p>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                    <span className="text-sm font-bold text-purple-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 어린이 눈높이 비유
                    </span>
                    <p className="text-sm text-purple-900 leading-relaxed">
                      "챗봇에게 작은 확성기와 마이크를 쥐어주고 사람 목소리로 노래하듯 읽어주는 마술 스피커예요!"
                    </p>
                  </div>
                </div>

                {/* 원리 03 */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      원리 03
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">3. 비간섭 플로팅 토스트</h4>
                    <span className="text-sm font-mono text-slate-400 block">Non-blocking Toast UI</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    화면을 멈추고 확인 버튼을 강요하는 alert() 대신, 화면 하단에서 부드럽게 솟아올라 상태를 알리고 2초 뒤 조용히 사라지는 현대적 알림창입니다.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 어린이 눈높이 비유
                    </span>
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      "토스터기에서 노릇노릇 구워진 빵이 뿅 튀어나왔다가 부드럽게 들어가는 것과 같아요!"
                    </p>
                  </div>
                </div>
              </div>

              {/* 주니어 개발자 알림 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <strong className="text-base font-bold text-indigo-950 block">
                    주니어 개발자 원칙: 진짜 소프트웨어의 가치는 마지막 10%의 '디테일 사포질'에서 완성됩니다!
                  </strong>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    핵심 알고리즘을 구현했다고 개발이 끝난 것이 아닙니다. 텍스트를 손쉽게 복사할 수 있는 편의성, 음성으로 귀로 들을 수 있는 웹 접근성, 에러 상황에서도 당황하지 않게 돕는 친절한 안내가 모여 평범한 코드를 <strong>'사람들이 매일 쓰고 싶어 하는 진짜 제품'</strong>으로 변화시킵니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 */}
            <div className="flex justify-end items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>다음: Stage 2 베타 스튜디오 실습 →</span>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* [STAGE 2] 가상 인터랙티브 실습 콘솔 (Beta Chatbot Studio & Polish Lab) */}
        {/* ------------------------------------------------------------------- */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                <Gem className="w-4 h-4" />
                <span>Interactive Beta Chatbot Studio</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                완성도 95% 챗봇 베타 스튜디오 &amp; 실시간 UX 폴리싱 랩
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                한국어 음성 TTS, 1-Click 복사 플로팅 토스트, 감성 테마 스위처가 모두 합체된 풀옵션 베타 챗봇입니다. 직접 말풍선의 스피커와 복사 아이콘을 눌러보세요.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
              {/* 툴바 */}
              <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-200">풀옵션 챗봇 베타 v0.9</span>
                  <span className="text-sm font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
                    {themeCfg.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-sm">
                    <span className="text-slate-400 px-2 font-medium">테마:</span>
                    {(['chef', 'study', 'story'] as ThemeType[]).map((thm) => (
                      <button
                        key={thm}
                        type="button"
                        onClick={() => {
                          setCurrentTheme(thm);
                          showToast(`[테마 변경] ${THEMES[thm].name} 모드가 활성화되었습니다! 🎨`);
                        }}
                        className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                          currentTheme === thm
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {thm === 'chef' && '🍱 셰프'}
                        {thm === 'study' && '📚 스터디'}
                        {thm === 'story' && '🔮 스토리'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={resetRoom}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>대화 리셋</span>
                  </button>
                </div>
              </div>

              {/* 보조 설정 바 */}
              <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={autoTts}
                    onChange={(e) => setAutoTts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span>🔊 답변 도착 시 자동 음성 읽기 (TTS Auto-Play)</span>
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500">목소리 속도:</span>
                  <div className="flex items-center gap-1.5">
                    {[0.85, 1.0, 1.2].map((rt) => (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => {
                          setTtsRate(rt);
                          showToast(`음성 재생 속도가 ${rt}x 배속으로 설정되었습니다. ⚡`);
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                          ttsRate === rt
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {rt}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 칩 바 */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>베타 테스트 추천 칩 (음성 합성 &amp; 복사 시험)</span>
                  </span>
                  <span className="text-sm text-slate-400">클릭 즉시 질문 전송</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('오늘 점심 급식 식단이랑 칼로리 알려줘!')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🍱</span>
                    <span>오늘 점심 급식 식단이랑 칼로리 알려줘!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('오늘 비 올 거 같은데 우산 챙길까?')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>☔</span>
                    <span>오늘 비 올 거 같은데 우산 챙길까?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('영단어 깜지 안 쓰고 쉽게 외우는 꿀팁이 뭐야?')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>📚</span>
                    <span>영단어 깜지 안 쓰고 쉽게 외우는 꿀팁</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('샬라샬라 외계어 장난치기')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/40 text-sm font-medium text-amber-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🛡️</span>
                    <span>외계어 폴백 및 예외 안내창 시험</span>
                  </button>
                </div>
              </div>

              {/* 채팅 메시지 뷰포트 */}
              <div className="p-4 sm:p-5 h-96 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className={`w-9 h-9 rounded-xl ${themeCfg.avatarBg} text-white flex items-center justify-center font-bold shrink-0 shadow-xs`}>
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    <div className={`space-y-1 max-w-[85%] ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                      <div className="flex items-center gap-2">
                        {msg.sender === 'user' && <span className="text-sm text-slate-400">{msg.time}</span>}
                        <span className="text-sm font-bold text-slate-900">
                          {msg.sender === 'user' ? '나 (User)' : themeCfg.name}
                        </span>
                        {msg.sender === 'bot' && <span className="text-sm text-slate-400">{msg.time}</span>}
                        {msg.sender === 'bot' && (
                          <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                            BETA ANSWER
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs relative group ${
                          msg.sender === 'user'
                            ? 'rounded-tr-sm bg-indigo-600 text-white'
                            : 'rounded-tl-sm bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* 봇 말풍선 음성 및 복사 액션 버튼 */}
                        {msg.sender === 'bot' && (
                          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => speakText(msg.text)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="음성으로 듣기"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>음성 듣기</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => copyBubble(msg.text)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="클립보드에 복사"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>복사하기</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* 생각 중 인디케이터 */}
                {isProcessing && (
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl text-slate-600 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                    <span>베타 AI 두뇌가 문맥을 분석하고 답변을 정밀 조립하는 중... 💭</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 폼 */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="궁금한 내용을 입력하세요... (Enter 키로 전송)"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !userInput.trim()}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>전송</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* 하단 패널 */}
              <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300">TTS 엔진: 준비 완료 (한국어)</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">토스트 알림: 대기 중</span>
                  </div>
                </div>
                <span className="text-sm font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  총 {turnCount}턴 대화 진행
                </span>
              </div>

              {/* 플로팅 토스트 컴포넌트 */}
              {toastMessage && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2.5 pointer-events-none z-50 animate-bounce">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-100">
                    {toastMessage}
                  </span>
                </div>
              )}
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                ← 이전: Stage 1 미션 &amp; 원리
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>다음: Stage 3 실전 AI 퀘스트 →</span>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* [STAGE 3] 실전 최신 AI 5대 킬러 퀘스트                               */}
        {/* ------------------------------------------------------------------- */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                <Terminal className="w-4 h-4" />
                <span>Real AI 5 Killer Quests</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                실전 최신 AI 5대 킬러 퀘스트
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                외부 ChatGPT나 Gemini 창을 옆에 띄우고 아래 정밀 설계된 5대 프롬프트를 원클릭으로 복사하여 브라우저 TTS, 플로팅 토스트, 테마 시스템 코드를 직접 소환하고 테스트해 보세요.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  id: 1,
                  badge: 'QUEST 01',
                  tag: 'Web Speech API · 음성 합성 ★★★',
                  title: '외부 라이브러리 없이 순수 브라우저 Web Speech TTS 한국어 음성 출력 함수 작성',
                  desc: '챗봇이 작성한 답변 텍스트를 사람이 또박또박 읽어주듯 스피커로 출력하는 SpeechSynthesisUtterance 연동 모듈을 소환합니다.',
                  prompt: `[역할]\n너는 웹 프론트엔드 멀티미디어 인터랙션 전문 시니어 자바스크립트 엔지니어이자 코딩 멘토야.\n\n[목표]\n외부 유료 API나 라이브러리 없이, 100% 브라우저 내장 Web Speech API를 활용해 한국어 음성을 스피커로 또박또박 재생하는 speakText(text, options) 함수를 순수 자바스크립트로 작성해 줘.\n\n[세부 요구사항]\n1. window.speechSynthesis와 SpeechSynthesisUtterance 객체를 활용해 줘.\n2. 언어 설정(lang = 'ko-KR'), 말하기 속도(rate, 기본 1.0), 목소리 높낮이(pitch, 기본 1.0)를 옵션으로 제어할 수 있게 해 줘.\n3. 이미 이전 음성이 재생 중이라면 speechSynthesis.cancel()을 먼저 호출해 목소리가 겹치지 않도록 깔끔하게 처리해 줘.\n4. 브라우저가 음성 합성을 지원하지 않을 때의 예외 방어 로직을 포함해 줘.\n5. 초보자도 쉽게 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: 'Web Speech API는 운영체제(Windows, macOS, Android, iOS)에 내장된 음성 합성 엔진(TTS Engine)을 브라우저가 직접 호출하는 W3C 웹 표준 기술입니다. 클라우드 서버로 오디오 파일을 주고받지 않고 사용자의 기기 CPU에서 직접 소리를 생성하므로 네트워크 데이터 비용이 0원이며 지연 시간(Latency) 없이 즉각 재생됩니다.'
                },
                {
                  id: 2,
                  badge: 'QUEST 02',
                  tag: '마이크로 인터랙션 · 토스트 ★★★',
                  title: '화면 중앙을 가리지 않고 2초 뒤 스르륵 사라지는 비간섭 플로팅 토스트 컴포넌트',
                  desc: '웹 사용성을 저해하는 구식 alert()를 대체하여, 화면 하단에서 부드러운 애니메이션과 함께 상태를 알리는 토스트 UI를 소환합니다.',
                  prompt: `[역할]\n너는 UI/UX 인터랙션 전문 시니어 프론트엔드 엔지니어이자 코딩 멘토야.\n\n[목표]\n사용자의 작업을 방해하지 않는 모던 플로팅 토스트 알림창(Floating Toast Notification)을 순수 자바스크립트와 CSS(또는 Tailwind)로 구현하는 showToast(message, duration = 2000) 함수를 작성해 줘.\n\n[세부 요구사항]\n1. 화면 하단 중앙(fixed bottom-6 left-1/2 -translate-x-1/2)에 위치시키고 부드러운 슬라이드 업 & 페이드인 효과를 줘.\n2. 여러 번 연속 호출되더라도 이전 타이머를 clear하고 새 메시지로 갱신하는 디바운스/타이머 가드를 적용해 줘.\n3. 지정된 시간(기본 2초)이 지나면 페이드아웃 효과와 함께 DOM에서 사라지게 해 줘.\n4. 초보자도 바로 웹페이지에 적용할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: 'alert() 창은 브라우저의 메인 자바스크립트 스레드를 일시 정지(Blocking)시키는 모달 방식이라 사용자 경험을 크게 해칩니다. 반면 플로팅 토스트는 스레드를 차단하지 않는 비동기 논블로킹(Non-blocking) 방식으로 동작하여 사용자가 타이핑이나 스크롤을 멈추지 않고도 실시간 상태 피드백을 전달받을 수 있습니다.'
                },
                {
                  id: 3,
                  badge: 'QUEST 03',
                  tag: '클립보드 API · 사용성 배려 ★★★',
                  title: '말풍선마다 1-Click 복사 버튼을 달고 클립보드에 안전하게 담는 복사 핸들러 작성',
                  desc: '긴 레시피나 학습 요약을 일일이 드래그할 필요 없이 버튼 한 번으로 복사하고 시각적 완료 피드백을 주는 코드를 소환합니다.',
                  prompt: `[역할]\n너는 클립보드 인터랙션 및 프론트엔드 보안 전문가이자 코딩 멘토야.\n\n[목표]\n챗봇 말풍선 카드 안에 [📋 복사하기] 버튼을 부착하고, 클릭 시 해당 말풍선의 텍스트를 navigator.clipboard.writeText를 통해 사용자의 클립보드에 복사하며 버튼 아이콘을 체크 표시(✓)로 1.8초간 피드백하는 copyBubbleContent(buttonEl) 함수를 작성해 줘.\n\n[세부 요구사항]\n1. 현대적인 비동기 navigator.clipboard API를 우선 사용하고, 보안 컨텍스트(HTTPS/localhost)가 아닐 경우의 document.execCommand 폴백도 안전하게 처리해 줘.\n2. 복사 완료 즉시 버튼 텍스트를 '복사됨! ✨'으로 바꾸고 1.8초 후 원래 모양으로 복구해 줘.\n3. 2번 퀘스트의 showToast와 연계하여 화면 아래에 토스트가 동시에 뜨도록 연결해 줘.\n4. 초보자도 쉽게 따라할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: '클립보드 접근은 사용자의 비밀번호나 개인정보를 탈취할 수 있는 민감한 권한이므로, 브라우저는 반드시 사용자의 직접적인 클릭(User Gesture) 이벤트 내부에서만 navigator.clipboard.writeText 호출을 허용합니다. 이러한 보안 규칙을 \\'사용자 활성화(User Activation)\\' 모델이라고 부릅니다.'
                },
                {
                  id: 4,
                  badge: 'QUEST 04',
                  tag: '디자인 시스템 · 테마 동기화 ★★★★',
                  title: '캐릭터 페르소나에 맞춰 색상과 아바타가 살아 움직이는 동적 테마 스위처',
                  desc: '셰프 챗봇(오렌지/에메랄드), 스터디 챗봇(인디고), 스토리 챗봇(바이올렛)으로 챗봇 룸의 분위기를 0.1초 만에 전환하는 테마 모듈을 소환합니다.',
                  prompt: `[역할]\n너는 프론트엔드 디자인 시스템 및 CSS 변수 아키텍처 전문가야.\n\n[목표]\n챗봇의 캐릭터 페르소나(셰프, 스터디봇, 스토리텔러)를 선택할 때마다 채팅창의 대표 색상(Primary Color), 아바타 아이콘, 헤더 타이틀을 실시간으로 변경하는 ThemeManager 모듈을 작성해 줘.\n\n[세부 요구사항]\n1. CSS Custom Properties(--theme-primary, --theme-bg 등) 또는 Tailwind 클래스를 동적으로 변경해 줘.\n2. 사용자가 선택한 테마 설정을 localStorage에 저장하여 새로고침 후에도 유지되도록 해 줘.\n3. 테마가 바뀔 때 환영 메시지와 봇 소개 텍스트도 캐릭터 성격에 맞게 갱신해 줘.\n4. 초보자도 쉽게 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: 'CSS 커스텀 프로퍼티(변수, CSS Variables)를 사용하면 자바스크립트로 HTML 구조를 일일이 뜯어고치지 않고도 최상위 DOM 요소의 속성값 하나만 변경하여 전체 UI의 색상 테마를 한 번에 리렌더링할 수 있습니다. 이것이 넷플릭스나 디스코드의 다크 모드/테마 엔진의 기본 아키텍처입니다.'
                },
                {
                  id: 5,
                  badge: 'QUEST 05',
                  tag: '풀옵션 아키텍처 완성 ★★★★★',
                  title: '추론 두뇌, 음성 TTS, 플로팅 토스트, 테마 시스템이 통합된 완성형 챗봇 베타 코어',
                  desc: '20강의 인텐트 추론 두뇌와 21강의 멀티턴 대화 루프, 22강의 사포질 폴리싱을 집대성한 올인원 클래스를 소환합니다.',
                  prompt: `[역할]\n너는 에듀테크 상용 소프트웨어 총괄 아키텍트이자 학생들을 위한 코딩 멘토야.\n\n[목표]\n외부 유료 의존성 없이, 100% 브라우저 순수 자바스크립트로 구동되는 완성형 챗봇 베타 애플리케이션 클래스(ChatbotBetaApp)를 작성해 줘.\n\n[세부 요구사항]\n1. 내부 상태로 messages, conversationHistory, currentTheme, isProcessing, ttsEnabled를 관리해 줘.\n2. 20강의 가중치 인텐트 판별기와 21강의 멀티턴 계승 로직을 온전히 탑재해 줘.\n3. 봇의 답변 생성 완료 시 자동 음성 재생(TTS), 각 말풍선별 1-Click 복사 버튼, 하단 플로팅 토스트 통지를 매끄럽게 연결해 줘.\n4. 초보자도 바로 웹페이지에 붙여넣어 상용 서비스 수준으로 시연할 수 있도록 완벽한 주석과 HTML 연동 예시를 달아줘.`,
                  secret: '알파에서 베타로의 진화는 단순한 기능 추가가 아닌 \\'소프트웨어 완성도(Polish)\\'의 도약입니다. 모든 컴포넌트가 하나의 통합 인터페이스를 통해 협력하도록 구조화되면, 23강에서 실제 사용자들의 피드백을 받아 코드를 수정할 때도 버그 없이 신속하게 반응할 수 있는 유지보수성(Maintainability)이 확보됩니다.'
                }
              ].map((q) => (
                <article key={q.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      {q.badge}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      {q.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{q.desc}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-indigo-600" />
                        <span>실전 AI 복사 프롬프트</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPrompt(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedQuest === q.id ? (
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
                    <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {q.prompt}
                    </pre>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      <span>AI 소환 마법 &amp; 💡 컴퓨터 과학 비밀 해설</span>
                    </span>
                    <p className="text-sm text-indigo-950 leading-relaxed">
                      💡 <strong>컴퓨터 과학 비밀:</strong> {q.secret}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                ← 이전: Stage 2 베타 스튜디오
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>다음: Stage 4 용어 &amp; 체크리스트 →</span>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* [STAGE 4] 전문 용어 돋보기 & 자가 점검 체크리스트                   */}
        {/* ------------------------------------------------------------------- */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8">
            {/* 스테이지 헤더 소개 */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    전문 용어 돋보기 &amp; 자가 점검 체크리스트
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  오늘 배운 소프트웨어 폴리싱과 멀티미디어 인터랙션의 컴퓨터 과학 원리를 전문 용어로 복습하고, 6개 항목을 스스로 점검하여 23강(사용성 테스트)을 언락해 보세요!
                </p>
              </div>
            </div>

            {/* 1. 주니어 개발자를 위한 전문 용어 돋보기 (다크 슬레이트 카드 5종) */}
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
                
                {/* 용어 1: 베타 빌드 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-indigo-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>1. 베타 빌드</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Beta Build</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200">
                    <strong>🧸 어린이 비유:</strong> "모터와 바퀴만 있던 자동차에 멋진 시트와 라이트, 스피커까지 달아 친구들에게 시승해 보라고 건네는 완성 직전의 차!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 핵심 기능 검증(알파)을 마친 뒤, 부가 편의 기능과 세련된 디자인, 예외 처리를 완료하여 실제 외부 사용자 대상 테스트를 수행할 수 있는 완성도 90% 이상의 소프트웨어 버전입니다.
                  </p>
                </div>

                {/* 용어 2: 음성 합성 API */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-purple-300 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span>2. 음성 합성 API</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Speech Synthesis (TTS)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
                    <strong>🧸 어린이 비유:</strong> "컴퓨터가 눈으로 글자를 읽고 입으로 소리 내어 또박또박 구연동화를 들려주는 인공 성대!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 텍스트 문장을 음성 파형 신호로 변환하여 기기의 오디오 출력 장치로 재생하는 기술(Text-To-Speech)이며, 브라우저 표준 Web Speech API를 통해 접근합니다.
                  </p>
                </div>

                {/* 용어 3: 토스트 알림 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-cyan-300 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span>3. 토스트 알림</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Toast Notification</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-200">
                    <strong>🧸 어린이 비유:</strong> "토스터에서 빵이 뿅 튀어나왔다가 들어가는 것처럼, 화면 구석에 살짝 떴다가 사라지는 착한 알림 쪽지!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 사용자의 기존 작업 흐름을 차단하지 않고(Non-blocking), 화면 모서리나 하단에 잠시 나타났다가 설정된 시간 뒤 자동으로 사라지는 비간섭 일시적 피드백 UI 패턴입니다.
                  </p>
                </div>

                {/* 용어 4: 소프트웨어 폴리싱 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-amber-300 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>4. 소프트웨어 폴리싱</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Software Polishing</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
                    <strong>🧸 어린이 비유:</strong> "나무 로봇의 거친 모서리를 사포로 매끄럽게 갈아내고 기름칠하여 부드럽게 움직이게 만드는 마무리 공정!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 기능 개발 완료 후 애니메이션 부드러움, 터치 피드백, 에러 메시지 톤앤매너, 반응형 정렬 등 사용자 인터페이스의 미세한 디테일을 정밀 교정하는 마감 공정입니다.
                  </p>
                </div>

                {/* 용어 5: 웹 접근성 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-emerald-300 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>5. 웹 접근성</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Web Accessibility (a11y)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
                    <strong>🧸 어린이 비유:</strong> "키가 작거나 안경을 깜빡한 친구도 휠체어를 타고 놀이터에 와서 모든 놀이기구를 재미있게 탈 수 있게 배려하는 마음!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 신체적 장애나 기기 환경에 관계없이 모든 사람이 동등하게 웹 사이트의 정보를 인지하고 조작할 수 있도록 보장하는 소프트웨어 설계 표준 원칙(WCAG 2.1)입니다.
                  </p>
                </div>

              </div>
            </article>

            {/* 자가 점검 체크리스트 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  {checklist.length} / {TOTAL_CHECKS} 완료
                </span>
              </div>

              {/* 진행률 게이지 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* 체크 문항 */}
              <div className="space-y-2.5">
                {[
                  {
                    id: 1,
                    text: '베타 빌드의 가치: 알파의 뼈대 위에 편의 기능과 감성 디자인을 덧붙여 완성도 95%의 베타 빌드로 도약하는 이유를 이해했나요?'
                  },
                  {
                    id: 2,
                    text: 'Web Speech TTS 음성 합성: 브라우저 내장 음성 엔진으로 챗봇 답변을 한국어 소리(SpeechSynthesisUtterance)로 재생하는 코드를 확인했나요?'
                  },
                  {
                    id: 3,
                    text: '플로팅 토스트(Toast): 사용자의 화면을 차단하지 않고 2초 뒤 자연스럽게 사라지는 비간섭 알림 UI의 동작 원리를 체득했나요?'
                  },
                  {
                    id: 4,
                    text: '말풍선 1-Click 복사: navigator.clipboard API를 연동하여 긴 답변도 손쉽게 복사할 수 있는 사용자 배려를 직접 시험해 보았나요?'
                  },
                  {
                    id: 5,
                    text: '감성 테마 스위처: 캐릭터 페르소나에 맞추어 색상 테마와 아바타가 실시간으로 변하는 동적 테마 전환(Theme Switching) 원리를 확인했나요?'
                  },
                  {
                    id: 6,
                    text: '23강 사용자 피드백 도약 준비: 완성도 높은 베타 버전을 완성하고, 23강에서 친구들의 솔직한 피드백을 수집하여 완성도를 200% 올릴 준비를 마쳤나요?'
                  }
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist.includes(item.id)}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed font-normal">
                      <strong>{item.id}.</strong> {item.text}
                    </span>
                  </label>
                ))}
              </div>

              {/* 100% 완주 축하 카드 */}
              {checklist.length === TOTAL_CHECKS && (
                <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider font-mono">
                          Stage 22 Cleared · Chatbot Beta Builder
                        </span>
                        <span className="text-sm bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          베타 빌드 마스터 ★★★★★
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        22강 챗봇 베타 빌드 완성 수료! 🎉
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        축하합니다! 챗봇의 모든 부가 편의 기능을 성공적으로 합체하고 디테일 사포질을 마쳤습니다! 한국어 음성 합성(TTS), 원클릭 복사 플로팅 토스트, 그리고 감성 테마 스위처까지 완벽하게 정복했습니다. 이제 23강에서 친구들의 냉정한 맛보기 평가와 솔직한 피드백을 수집하여 완성도를 200% 끌어올릴 준비가 되었습니다!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                      <span className="text-sm text-white font-bold block">
                        23강: 친구들의 냉정한 맛보기 평가: 솔직한 피드백으로 완성도 200% 올리기
                      </span>
                    </div>
                    <a
                      href="../23-user-testing/index.html"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition-all shadow-md"
                    >
                      <span>23강으로 즉시 이동하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              )}
            </article>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                ← 이전: Stage 3 실전 AI 퀘스트
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUp className="w-4 h-4" />
                <span>맨 위로</span>
              </button>
            </div>
          </section>
        )}

      </main>

      {/* ===================================================================== */}
      {/* 3. 푸터 영역 (글로벌 표준 푸터)                                       */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="font-medium">AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span className="truncate">시즌 4 · 22강: 챗봇 베타 빌드 완성</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap shrink-0">
            <a href="../../index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="../21-chatbot-alpha/index.html" className="hover:text-slate-900 transition-colors">21강 바로가기</a>
            <a href="../23-user-testing/index.html" className="hover:text-slate-900 transition-colors">23강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson22;
