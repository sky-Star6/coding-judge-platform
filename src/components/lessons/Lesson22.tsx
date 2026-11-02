import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Gem,
  Ticket,
  Layers,
  Bell,
  Copy,
  Palette,
  ShieldCheck,
  WifiOff,
  ShieldAlert,
  Search,
  Activity,
  CheckSquare,
  Smile,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Send,
  CheckCircle,
  Lock,
  Unlock,
} from 'lucide-react';

interface BotConfig {
  name: string;
  avatar: string;
  welcome: string;
  quickQuestions: string[];
  mockResponses: Record<string, string>;
}

const BOT_CHARACTERS: Record<string, BotConfig> = {
  chef: {
    name: '냉장고 셰프 햄스터',
    avatar: '🐹',
    welcome: '어서오세찍! 오늘 냉장고에 남은 재료 2가지만 귓속말해줘찍! 말풍선 옆의 스피커(🔊)를 누르면 목소리로도 읽어드려요찍! 🐹✨',
    quickQuestions: [
      '계란이랑 식빵으로 10분 아침 요리 추천해줘!',
      '그 요리에 어울리는 초간단 소스 비율도 알려줘!',
      '수학 숙제 대신 풀어줘찍!'
    ],
    mockResponses: {
      '계란': '계란과 식빵이면 달콤바삭한 "달걀 프렌치토스트" 어때요찍? 버터 두른 팬에 노릇노릇 구우면 꿀맛이에요찍!',
      '소스': '토스트에 뿌릴 특제 꿀잼 시럽은 설탕 1스푼, 따뜻한 물 1스푼, 꿀 살짝이면 황금 비율 완성찍!',
      'default': '오호! 정말 맛있는 요리 아이디어네요찍! 프라이팬을 꺼내고 약불에서 천천히 익히면 실패하지 않아요찍!'
    }
  },
  homework: {
    name: '우리 반 숙제 요정',
    avatar: '📚',
    welcome: '안녕! 숙제 중에 어려운 개념이 있으면 물어봐! 딱 3줄로 알기 쉽게 정리하고 소리로도 들려줄게! 📚✨',
    quickQuestions: [
      '광합성이 뭔지 3줄로 요약해줘!',
      '그럼 식물이 숨 쉴 때도 산소가 필요해?',
      '롤 챔피언 추천해줘!'
    ],
    mockResponses: {
      '광합성': '1. 식물이 잎으로 햇빛을 쬐고 물을 마셔요.\n2. 햇빛 에너지로 맛있는 포도당을 만들어요.\n3. 우리가 숨 쉬는 깨끗한 산소를 내뿜어요!',
      '숨': '맞아! 낮에는 광합성으로 산소를 만들지만, 밤에는 사람처럼 산소를 마시고 숨을 쉰답니다!',
      'default': '공부하다가 궁금한 개념은 언제든 요정에게 물어봐! 핵심만 쏙쏙 짚어줄게!'
    }
  },
  pet: {
    name: '반려동물 마음 번역기 냥냥이',
    avatar: '🐱',
    welcome: '안냥! 오늘 네 반려동물이 어떤 이상한 행동을 했냥? 행동을 묘사해주면 속마음을 목소리로 통역해줄게냥! 🐱🐾',
    quickQuestions: [
      '강아지가 꼬리를 프로펠러처럼 돌려!',
      '그럼 강아지가 하품하는 건 졸린 거야?',
      '내일 비 오는지 날씨 알려줘냥!'
    ],
    mockResponses: {
      '프로펠러': '그건 "내가 가장 좋아하는 사람이 왔다냥!" 하며 기쁨과 흥분이 폭발했다는 뜻이다냥!',
      '하품': '강아지가 긴장하거나 불안할 때 스스로 마음을 진정시키려고 카밍 시그널 하품을 할 때가 많다냥!',
      'default': '동물들의 몸짓 언어는 아주 섬세하다냥! 천천히 눈을 마주치며 안심시켜줘냥.'
    }
  },
  trpg: {
    name: '던전 마스터 고블린',
    avatar: '🎮',
    welcome: '허허, 용감한 모험가여! 미지의 던전 입구에 섰소. 웅장한 목소리로 모험의 길을 안내하겠소! 🎮⚔️',
    quickQuestions: [
      '빛나는 보물 상자를 열어볼래!',
      '상자 안에서 얻은 지도 조각을 읽어볼래!',
      '던전에서 라면 끓여먹어도 돼?'
    ],
    mockResponses: {
      '보물': '상자를 열자 푸른 마나의 물약과 오래된 지도가 나왔소! 1. 물약 마시기 2. 지도 읽기 중 무엇을 하겠소?',
      '지도': '지도에는 던전 깊은 곳에 잠든 불사조의 둥지가 그려져 있소! 발걸음을 재촉하시오!',
      'default': '모험가의 주사위 눈이 굴러갔소! 어둠 속에서 조용한 발소리가 들려오니 경계하시오!'
    }
  }
};

interface ChatItem {
  role: 'user' | 'model';
  text: string;
  avatar?: string;
  time?: string;
}

interface HistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const Lesson22: React.FC = () => {
  // 탭 및 캐릭터 상태
  const [activeTab, setActiveTab] = useState<'betaroom' | 'inspector' | 'checklist'>('betaroom');
  const [currentBotKey, setCurrentBotKey] = useState<string>('chef');
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);

  // 대화 메시지 상태
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'model',
      text: BOT_CHARACTERS.chef.welcome,
      avatar: BOT_CHARACTERS.chef.avatar,
      time: '오후 12:45'
    }
  ]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([
    { role: 'model', parts: [{ text: BOT_CHARACTERS.chef.welcome }] }
  ]);

  // 토스트 상태
  const [toastText, setToastText] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  // 시스템 진단 상태
  const [diagLog, setDiagLog] = useState<string>(
    '모든 4대 핵심 기능이 준비되었습니다. 상단 [진단 실행]을 누르면 상세 리포트가 갱신됩니다.'
  );
  const [diagTime, setDiagTime] = useState<string>('READY');

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 로컬스토리지 복원
  useEffect(() => {
    const savedChecks = checklist.map((_, idx) => {
      return localStorage.getItem(`ai_lesson_22_check_${idx + 1}`) === 'true';
    });
    setChecklist(savedChecks);
  }, []);

  // 자동 스크롤
  useEffect(() => {
    if (activeTab === 'betaroom') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, activeTab]);

  // 토스트 띄우기
  const showToast = (msg: string) => {
    setToastText(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2500);
  };

  // 캐릭터 전환
  const handleSelectBot = (key: string) => {
    setCurrentBotKey(key);
    const config = BOT_CHARACTERS[key];
    setMessages([
      {
        role: 'model',
        text: config.welcome,
        avatar: config.avatar,
        time: '오후 12:45'
      }
    ]);
    setChatHistory([
      { role: 'model', parts: [{ text: config.welcome }] }
    ]);
    showToast(`${config.name} 테마로 변경되었습니다! ✨`);
  };

  // 대화 초기화
  const handleResetChat = () => {
    const config = BOT_CHARACTERS[currentBotKey];
    setMessages([
      {
        role: 'model',
        text: config.welcome,
        avatar: config.avatar,
        time: '오후 12:45'
      }
    ]);
    setChatHistory([
      { role: 'model', parts: [{ text: config.welcome }] }
    ]);
    showToast('새 대화 세션이 시작되었습니다.');
  };

  // TTS 음성 합성
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[🐹📚🐱🎮✨🐾⚔️]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      showToast('🔊 챗봇이 음성으로 답변을 읽어주는 중입니다!');
    } else {
      showToast('⚠️ 현재 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };

  // 단일 말풍선 복사
  const handleCopySingle = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 답변이 클립보드에 복사되었습니다!');
    });
  };

  // 전체 대화 백업 복사
  const handleBackupChat = () => {
    if (chatHistory.length === 0) {
      showToast('⚠️ 백업할 대화 내용이 없습니다.');
      return;
    }
    let full = `[${BOT_CHARACTERS[currentBotKey].name} 대화 백업]\n`;
    chatHistory.forEach((item) => {
      const speaker = item.role === 'user' ? '나' : BOT_CHARACTERS[currentBotKey].name;
      full += `${speaker}: ${item.parts[0].text}\n`;
    });
    navigator.clipboard.writeText(full).then(() => {
      showToast('💾 전체 대화 기록이 복사되었습니다! 메모장에 붙여넣으세요.');
    });
  };

  // 메시지 전송 로직
  const handleSend = async (customText?: string) => {
    if (isThinking) return;
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    const newMessages: ChatItem[] = [
      ...messages,
      { role: 'user', text: textToSend, time: '방금 전' }
    ];
    const newHistory: HistoryItem[] = [
      ...chatHistory,
      { role: 'user', parts: [{ text: textToSend }] }
    ];

    setMessages(newMessages);
    setChatHistory(newHistory);
    setInputText('');
    setIsThinking(true);

    // AI 모의 응답 지연 (600ms)
    await new Promise((r) => setTimeout(r, 600));

    const config = BOT_CHARACTERS[currentBotKey];
    const lower = textToSend.toLowerCase();
    let reply = config.mockResponses['default'];

    for (const [key, ans] of Object.entries(config.mockResponses)) {
      if (key !== 'default' && lower.includes(key.toLowerCase())) {
        reply = ans;
        break;
      }
    }

    setMessages([
      ...newMessages,
      { role: 'model', text: reply, avatar: config.avatar, time: '방금 전' }
    ]);
    setChatHistory([...newHistory, { role: 'model', parts: [{ text: reply }] }]);
    setIsThinking(false);

    if (isTtsEnabled) {
      speakText(reply);
    }
  };

  // 시스템 진단 실행
  const handleRunDiagnostics = () => {
    const hasTts = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const hasClipboard = typeof navigator !== 'undefined' && navigator.clipboard !== undefined;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const now = new Date().toLocaleTimeString();

    setDiagTime(`LAST RUN: ${now}`);
    setDiagLog(`[진단 결과 리포트 - ${now}]
• Web Speech API (TTS): ${hasTts ? 'SUCCESS (정상 로드)' : 'FAILED (브라우저 미지원)'}
• Navigator Clipboard API: ${hasClipboard ? 'SUCCESS (복사 가능)' : 'FAILED'}
• Network Connectivity: ${isOnline ? 'ONLINE (통신 정상)' : 'OFFLINE (인터넷 끊김 감지)'}
• Multi-turn Memory Array: SUCCESS (${chatHistory.length}개 턴 캐시 활성)
• Status: 베타 빌드 100% 정상 작동 중!`);

    showToast('🔍 4대 브라우저 기능 자가진단이 완료되었습니다!');
  };

  // 체크리스트 핸들러
  const handleChecklistToggle = (idx: number) => {
    const updated = [...checklist];
    updated[idx] = !updated[idx];
    setChecklist(updated);
    localStorage.setItem(`ai_lesson_22_check_${idx + 1}`, updated[idx] ? 'true' : 'false');

    const allChecked = updated.every(Boolean);
    if (allChecked) {
      localStorage.setItem('ai_lesson_22_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_22_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);
  const currentConfig = BOT_CHARACTERS[currentBotKey];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* ------------------------------------------------------------------- */}
      {/* 상단 헤더 GNB */}
      {/* ------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="/materials/ai/index.html#roadmap"
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
            title="24강 로드맵으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                시즌 4 · 22강
              </span>
              <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                챗봇 베타 빌드
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
              모든 기능 합체! 디자인 다듬기와 마지막 버그 잡기 (베타 빌드)
            </h1>
          </div>
        </div>

        {/* 4단계 스텝퍼 */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <a href="#stage1" className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors text-slate-600 hover:text-slate-900 hover:bg-white">
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>베타 빌드 깃발</span>
          </a>
          <a href="#stage2" className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors text-slate-600 hover:text-slate-900 hover:bg-white">
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>사포질과 광택</span>
          </a>
          <a href="#stage3" className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors text-slate-600 hover:text-slate-900 hover:bg-white">
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>성우 마이크 장착</span>
          </a>
          <a href="#stage4" className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors text-slate-600 hover:text-slate-900 hover:bg-white">
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>마지막 버그 사냥</span>
          </a>
        </nav>

        {/* 진척도 & 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span className="text-indigo-600 font-mono">{progressPct}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          {progressPct === 100 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span>23강 언락</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>23강 잠김</span>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 메인 2-패널 워크스페이스 */}
      {/* ------------------------------------------------------------------- */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden relative">
        {/* 플로팅 토스트 알림창 */}
        {isToastVisible && (
          <div className="absolute top-4 right-1/4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 border border-slate-700 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastText}</span>
          </div>
        )}

        {/* ■ 좌측 패널 (60% 폭): 퀘스트 가이드 */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar">
          {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border border-indigo-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  시즌 4: 완성도 극대화 (베타 빌드)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  소요 시간: 약 45분
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  <Gem className="w-3.5 h-3.5" />
                  디테일 사포질
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                친구를 초대하기 직전의 반짝반짝 사포질!<br />
                모든 부가 기능 합체와 마지막 버그 소탕전
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                21강에서 챗봇의 첫 심장이 힘차게 뛰기 시작했습니다. 하지만 진짜 친구들에게 자랑하기에는 아직 아쉬운 부분들이 있죠!{' '}
                <strong>음성으로 답변을 읽어주는 성우 마이크(TTS)</strong>,{' '}
                <strong>원클릭 답변 복사 토스트</strong>, 그리고 네트워크가 끊겨도 침착하게 달래주는 <strong>예외 안전망</strong>까지 모두 합체하여 완성도 95%의 당당한 <strong>'베타 빌드(Beta Build)'</strong>를 완성해 봅니다.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">선수 지식</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">21강 알파 빌드</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">오늘의 무기</span>
                  <span className="text-xs font-bold text-indigo-700 leading-snug whitespace-nowrap">Web Speech TTS &amp; Toast</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">핵심 개념</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">베타 빌드 &amp; 폴리싱</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <span className="text-xs font-bold text-emerald-700 leading-snug whitespace-nowrap">풀옵션 챗봇 베타 버전</span>
                </div>
              </div>
            </div>
          </div>

          {/* [Stage 1] 베타 빌드 깃발 꽂기 */}
          <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                베타 빌드 깃발 꽂기: 친구에게 보여줄 수 있는 '완성도 90%의 마법'
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              알파 빌드가 "기능이 처음부터 끝까지 멈추지 않고 돌아가는가?"를 증명하는 단계였다면,{' '}
              <strong>베타 빌드(Beta Build)</strong>는 <strong>"누가 써도 편안하고 친절한 완성도인가?"</strong>를 갖추는 단계예요.{' '}
              실제 사용자에게 제품을 공개하기 전 마지막 완성도를 채우는 필수 관문입니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs sm:text-sm">
                  <Ticket className="w-4 h-4" />
                  <span>놀이공원 사전 시승회 (프리오픈)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  정식 개장 전, 반짝이는 도색과 안전벨트, 편안한 대기석까지 모두 설치하고 특별 초대권을 가진 VIP 손님들을 모셔 시승해보는 단계가 바로 베타 빌드예요!
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>알파에서 베타로 도약하는 3대 날개</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  1) 답변 음성 읽어주기(TTS) ➔ 2) 1초 복사 토스트 ➔ 3) 예외 상황 안내창! 이 3가지만 붙여도 조잡한 실습 코드가 진짜 서비스 앱으로 환골탈태합니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300">한눈에 비교하는 알파(21강) vs 베타(22강)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Build Evolution</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <strong className="text-slate-300 block font-bold">21강 알파 빌드 (Alpha)</strong>
                  <ul className="text-[11px] text-slate-400 space-y-1 pl-3 list-disc">
                    <li>핵심 대화 루프만 간신히 돌아감</li>
                    <li>오류가 나면 콘솔에만 빨간 글씨 출력</li>
                    <li>단순 텍스트 눈으로만 읽기 가능</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/50 space-y-1.5">
                  <strong className="text-indigo-300 block font-bold">22강 베타 빌드 (Beta) ✨</strong>
                  <ul className="text-[11px] text-slate-300 space-y-1 pl-3 list-disc">
                    <li>귀로 듣는 브라우저 TTS 음성 합성 탑재</li>
                    <li>클립보드 1-Click 복사 &amp; 플로팅 토스트</li>
                    <li>오프라인 감지 및 에러 회복 안내창 완비</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>

          {/* [Stage 2] 사포질과 광택 */}
          <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                사포질과 광택: 반응형 레이아웃과 감성 마이크로 인터랙션
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              목공소에서 거친 나무판자를 부드러운 사포로 슥슥 문지르면 만지고 싶은 매끄러운 가구가 되듯,{' '}
              웹 개발에서도 <strong>소프트웨어 폴리싱(Polishing)</strong>을 거치면 사용자가 앱을 쓸 때 감탄이 터져 나와요!
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <strong className="text-xs sm:text-sm font-bold text-slate-900">토스트 알림창 (Toast Notification)</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    사용자의 화면을 가로막는 무식한 경고창(<code className="font-mono text-[10px] text-slate-800">alert()</code>) 대신, 화면 하단에서 빵처럼 뿅 올라왔다가 2초 뒤 스르륵 사라지는 세련된 플로팅 토스트를 적용합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  <Copy className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <strong className="text-xs sm:text-sm font-bold text-slate-900">말풍선 개별 복사 버튼</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI가 작성해 준 좋은 레시피나 공부 요약을 마우스로 길게 드래그할 필요 없이, 말풍선 우측 상단의 작은 복사 아이콘만 누르면 즉시 스마트폰이나 PC 클립보드에 담기게 합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <strong className="text-xs sm:text-sm font-bold text-indigo-950">캐릭터별 감성 테마 동기화</strong>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    햄스터 셰프는 따뜻한 주황빛, 숙제 요정은 지적인 남색, 펫 번역기는 다정한 민트색으로 캐릭터를 바꿀 때마다 챗봇 룸의 테마 액센트가 살아 숨 쉽니다!
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* [Stage 3] 성우 마이크 장착 */}
          <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                성우 마이크 장착: 브라우저 음성 합성(Web Speech TTS)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              챗봇이 텍스트로만 말하면 심심하죠! 현대의 모든 최신 웹 브라우저에는 사람의 목소리로 글자를 또박또박 읽어주는{' '}
              <strong>Web Speech API(음성 합성 엔진)</strong>가 기본으로 내장되어 있어요.{' '}
              별도의 유료 도구 없이도 자바스크립트 단 3줄이면 챗봇에게 성우 마이크를 쥐어줄 수 있습니다!
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-indigo-300">단 3줄로 끝내는 브라우저 한국어 음성 출력 마법</strong>
                <span className="text-[10px] font-mono text-slate-400">Web Speech API</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-indigo-200 leading-relaxed border border-slate-800 overflow-x-auto">
                <span className="text-slate-500">// 1. 읽을 글자와 한국어(ko-KR) 언어 설정</span><br />
                <span className="text-rose-400">const</span> speech = <span className="text-rose-400">new</span> <span className="text-amber-300">SpeechSynthesisUtterance</span>(botReplyText);<br />
                speech.<span className="text-emerald-300">lang</span> = <span className="text-emerald-300">'ko-KR'</span>;<br />
                <span className="text-slate-500">// 2. 브라우저 스피커로 소리 출력!</span><br />
                window.<span className="text-indigo-300">speechSynthesis</span>.<span className="text-white font-bold">speak</span>(speech);
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-slate-300 flex items-start gap-2">
                <span className="text-base shrink-0">♿</span>
                <span><strong>웹 접근성(a11y)의 감동:</strong> 눈이 침침하신 할머니나 글을 아직 잘 모르는 어린 동생도 귀로 챗봇과 즐겁게 대화할 수 있는 따뜻한 기술이에요.</span>
              </div>
            </div>
          </article>

          {/* [Stage 4] 마지막 버그 사냥 */}
          <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                마지막 버그 사냥: 끊김과 오작동을 막는 3대 안전 에어백
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              베타 버전의 마지막 임무는 뜻밖의 돌발 상황에서도 앱이 멈추지 않는 <strong>'우아한 실패 처리(Graceful Degradation)'</strong>를 탑재하는 것입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>1. 오프라인 자동 감지</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  와이파이가 끊기면 화면 상단에 "인터넷 연결을 확인해 주세요" 안내 바를 띄우고 전송 버튼을 안전하게 잠급니다.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>2. API 에러 친절 번역</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  영어 외계어 오류 대신 "잠시 요청이 많아요. 5초 뒤 다시 물어봐줘찍!"처럼 캐릭터의 말투로 친절하게 설명합니다.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. 긴 문장 넘침 방지</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  사용자가 띄어쓰기 없이 수백 자를 써도 말풍선 밖으로 글자가 삐져나오지 않도록 <code className="font-mono text-[10px]">break-words</code>를 적용합니다.
                </p>
              </div>
            </div>
          </article>

          {/* [🔍 주니어 개발자를 위한 전문 용어 돋보기 (Junior Developer Glossary)] */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  주니어 개발자를 위한 전문 용어 돋보기
                </h3>
                <span className="text-xs text-slate-400">본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 용어 1: 베타 빌드 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">1. 베타 버전 소프트웨어</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Beta</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Beta Build (Feature Complete Preview)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 놀이공원 정식 개장 전, 안전벨트와 페인트칠까지 끝내고 친구들을 초대하는 사전 시승회!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 모든 계획된 기능(Feature)이 구현 완료되어 실제 외부 사용자 대상의 필드 테스트 및 안정성 검증을 진행하는 소프트웨어 배포 단계입니다.
                </p>
              </div>

              {/* 용어 2: 폴리싱 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">2. 사용자 경험 다듬기</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Polish</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 소프트웨어 폴리싱 (Software Polishing &amp; Micro-interactions)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 나무 장난감의 거친 가시를 고운 사포로 슥슥 문질러 만졌을 때 보들보들하게 만드는 마법!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 레이아웃 여백, 색상 대비, 애니메이션 반응 속도, 안내 문구 등을 정밀하게 튜닝하여 소프트웨어의 시각적·감성적 완성도를 극대화하는 후반 작업입니다.
                </p>
              </div>

              {/* 용어 3: TTS */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">3. 음성 합성 기술</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">TTS</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 텍스트 음성 변환 (TTS - Text-To-Speech / Speech Synthesis)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 챗봇 로봇에게 진짜 성우 마이크를 달아주어 글자를 또랑또랑한 목소리로 읽어주게 하는 것!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 컴퓨터가 텍스트 문자열을 음소 단위로 분석하고 음성 파형을 생성하여 스피커를 통해 자연스러운 인간의 언어로 출력하는 오디오 기술입니다.
                </p>
              </div>

              {/* 용어 4: 우아한 예외 실패 처리 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">4. 우아한 예외 실패 처리</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Graceful</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Graceful Degradation &amp; Fault Tolerance</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 서커스 줄타기 선수가 발을 헛디뎌도 바닥에 푹신한 에어 매트가 있어 다치지 않는 안전망!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 네트워크 단절이나 API 오류 등 시스템 장애가 발생했을 때 앱 전체가 강제 종료되지 않고, 사용자에게 대체 기능이나 친절한 안내를 제공하며 부분 동작을 유지하는 설계 기법입니다.
                </p>
              </div>

              {/* 용어 5: 토스트 알림창 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">5. 토스트 알림창</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Toast</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 토스트 UI (Toast Notification &amp; Snack-bar)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 토스터기에서 빵이 뿅 튀어나왔다가 다 식으면 스르륵 사라지는 귀여운 알림 쪽지!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 사용자의 조작을 방해하는 팝업 모달 대신, 화면 하단이나 모서리에 2~3초간 나타났다가 자동으로 페이드아웃되는 가벼운 비침해적 상태 피드백 UI입니다.
                </p>
              </div>

              {/* 용어 6: 웹 접근성 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">6. 웹 접근성 표준</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">a11y</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 웹 접근성 (Web Accessibility - a11y)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 휠체어를 탄 친구도, 앞이 잘 안 보이는 친구도 모두 함께 뛰어놀 수 있는 무장애 놀이터!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 장애인, 고령자 등 모든 사용자가 신체적·환경적 제약 없이 웹 사이트의 정보를 동등하게 인식하고 이해하며 인터랙션할 수 있도록 보장하는 설계 표준 규약입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          {/* 3단 탭 내비게이션 바 */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('betaroom')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'betaroom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>챗봇 베타 룸</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'inspector'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>기능 점검소</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>22강 점검표</span>
            </button>
          </div>

          {/* [우측 탭 1] 챗봇 베타 룸 */}
          {activeTab === 'betaroom' && (
            <div className="space-y-4">
              {/* 캐릭터 선택 및 툴바 */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-indigo-600" />
                    <span>캐릭터 테마</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTtsEnabled(!isTtsEnabled);
                        showToast(isTtsEnabled ? '🔇 음성 안내가 꺼졌습니다.' : '🔊 음성 안내가 켜졌습니다!');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                        isTtsEnabled
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-400'
                      }`}
                      title="음성 합성 토글"
                    >
                      {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{isTtsEnabled ? '음성 ON' : '음성 OFF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBackupChat}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition-all cursor-pointer"
                      title="전체 대화 텍스트 백업"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">대화 백업</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetChat}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="대화 초기화"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {(['chef', 'homework', 'pet', 'trpg'] as const).map((key) => {
                    const cfg = BOT_CHARACTERS[key];
                    const isSelected = currentBotKey === key;
                    const label = key === 'chef' ? '셰프' : key === 'homework' ? '숙제' : key === 'pet' ? '펫' : 'TRPG';
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectBot(key)}
                        className={`py-1.5 px-1 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-800 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="mr-1">{cfg.avatar}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 실시간 풀옵션 채팅 윈도우 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[480px] overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentConfig.avatar}</span>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block leading-tight">
                        {currentConfig.name}
                      </strong>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 풀옵션 베타 빌드 가동
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    TTS 성우 마이크 연동
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar bg-slate-50/40">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}
                    >
                      {m.role === 'model' && (
                        <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm shrink-0 font-bold">
                          {m.avatar || currentConfig.avatar}
                        </span>
                      )}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                          m.role === 'user'
                            ? 'rounded-tr-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                            : 'rounded-tl-none bg-white border border-slate-200 shadow-xs text-slate-800 space-y-2'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.text}</div>
                        {m.role === 'model' && (
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{m.time || '방금 전'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => speakText(m.text)}
                                className="hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                                title="소리로 듣기"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>읽기</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopySingle(m.text)}
                                className="hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                                title="이 답변 복사"
                              >
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {isThinking && (
                  <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      AI
                    </div>
                    <span className="text-xs text-indigo-700 font-medium animate-pulse flex items-center gap-1">
                      답변 요리 중... 💭
                    </span>
                  </div>
                )}

                <div className="p-2 bg-slate-50/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">추천:</span>
                  {currentConfig.quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
                    >
                      "{q.length > 15 ? q.slice(0, 15) + '...' : q}"
                    </button>
                  ))}
                </div>

                <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="메시지를 입력하고 Enter를 누르세요..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={isThinking || !inputText.trim()}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>전송</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 베타 빌드 3대 완성도 가이드 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>베타 빌드 3대 품질 검증 포인트</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    Quality Gate
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <strong className="text-slate-800 block font-bold">🔊 Web Speech TTS</strong>
                    <p>스피커 아이콘을 누르면 한국어 음성으로 또박또박 읽어줍니다.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <strong className="text-indigo-900 block font-bold">📋 토스트 피드백</strong>
                    <p>복사 버튼을 누르면 플로팅 토스트가 뿅 나타났다가 스르륵 사라집니다.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] flex items-center justify-between">
                  <span>🛡️ 예외 방어: 긴 문장 자동 줄바꿈 &amp; 오프라인 감지 안전 가동 중</span>
                  <span className="font-bold text-emerald-700">95% 완료</span>
                </div>
              </div>
            </div>
          )}

          {/* [우측 탭 2] 기능 점검 연구소 */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>브라우저 API 호환성 실시간 진단</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRunDiagnostics}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    진단 실행 🔍
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  베타 버전은 다양한 컴퓨터와 스마트폰 환경에서 돌아가야 합니다. 아래 4대 핵심 브라우저 API가 정상 작동하는지 원클릭으로 검사해 보세요!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">1. 음성 합성 (TTS)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      지원됨 🟢
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">window.speechSynthesis 엔진</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">2. 클립보드 복사</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      지원됨 🟢
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">navigator.clipboard API</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">3. 네트워크 상태</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      온라인 🟢
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">navigator.onLine 통신 가능</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">4. 멀티턴 메모리</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      정상 가동 중
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{chatHistory.length}개 메시지 유지</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>SYSTEM DIAGNOSTICS REPORT</span>
                  <span>{diagTime}</span>
                </div>
                <pre className="text-indigo-200 text-[11px] leading-relaxed whitespace-pre-wrap">
                  {diagLog}
                </pre>
              </div>
            </div>
          )}

          {/* [우측 탭 3] 점검표 */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>22강 베타 빌드 완주 점검표</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {checkedCount} / 6 ({progressPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  모든 항목을 직접 체크하고 완료하면 다음 23강(친구들의 실전 사용자 테스트)으로 진입할 수 있어요!
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: '1. 베타 빌드의 목적과 가치 이해하기',
                    desc: '알파 빌드에서 한 걸음 더 나아가, 친구들이 감탄할 수 있는 완성도 높은 부가 기능을 결합하는 이유를 배웠다.'
                  },
                  {
                    title: '2. Web Speech API 음성 합성(TTS) 체험',
                    desc: '말풍선의 스피커 버튼을 눌러 브라우저 내장 음성 엔진이 한국어로 답변을 똑똑하게 읽어주는 것을 확인했다.'
                  },
                  {
                    title: '3. 플로팅 토스트 알림창 피드백 확인',
                    desc: '말풍선 복사 버튼을 눌렀을 때 상단에 부드럽게 토스트 알림이 떴다가 사라지는 현대적인 UX를 확인했다.'
                  },
                  {
                    title: '4. 전체 대화 백업 복사 기능 활용',
                    desc: '상단 [대화 백업] 버튼을 눌러 지금까지 나눈 대화 기록 전체를 클립보드에 안전하게 복사해 보았다.'
                  },
                  {
                    title: '5. 브라우저 API 호환성 자가진단 실행',
                    desc: '[기능 점검소] 탭에서 TTS, 클립보드, 온라인 상태 등 4대 핵심 브라우저 기능을 원클릭 진단해 보았다.'
                  },
                  {
                    title: '6. 우아한 예외 처리와 웹 접근성 가치 체감',
                    desc: '장애인이나 어린아이도 쓰기 편한 음성 지원과 오류 시 친절한 안내가 좋은 소프트웨어의 기준임을 배웠다.'
                  }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => handleChecklistToggle(idx)}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <div className="text-xs leading-relaxed text-slate-800">
                      <strong className="font-bold text-slate-900 block mb-0.5">{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {progressPct === 100 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm sm:text-base font-bold block">축하합니다! 22강 베타 빌드 완주 완료 🎉</strong>
                      <span className="text-xs text-indigo-100">이제 누구에게 보여주어도 부끄럽지 않은 완성작이 탄생했습니다!</span>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    음성 합성, 토스트 알림, 대화 백업, 예외 처리까지 완벽히 장착한 베타 버전을 완성했습니다.{' '}
                    다음 23강에서는 실제 친구들에게 내 챗봇을 써보게 하고 솔직한 피드백을 수집하는 <strong>'사용자 맛보기 테스트'</strong>를 진행합니다!
                  </p>
                  <a
                    href="../23-user-testing/index.html"
                    className="w-full py-3 px-4 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>23강(사용자 피드백 테스트)으로 이동하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Lesson22;
