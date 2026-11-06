import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Activity,
  Bot,
  HeartPulse,
  ShieldCheck,
  Shield,
  RotateCcw,
  Search,
  MessageCircle,
  Brain,
  CheckSquare,
  Send,
  Copy,
  Check,
  Lock,
  Unlock,
  CheckCircle,
  BookOpen,
  Boxes,
  MessageSquare,
  Layers,
  ArrowDownCircle,
  Home
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
    welcome: '어서오세찍! 오늘 냉장고에 남은 재료 2가지만 귓속말해줘찍! 맛있는 요리를 만들어줄게찍! 🐹✨',
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
    welcome: '안녕! 숙제 중에 어려운 개념이 있으면 물어봐! 딱 3줄로 알기 쉽게 정리해 줄게! 📚✨',
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
    welcome: '안냥! 오늘 네 반려동물이 어떤 이상한 행동을 했냥? 행동을 묘사해주면 속마음을 통역해줄게냥! 🐱🐾',
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
    welcome: '허허, 용감한 모험가여! 미지의 던전 입구에 섰소. 어느 길로 먼저 향하겠소? 🎮⚔️',
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
}

interface HistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';

export const Lesson21: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  // 탭 및 캐릭터 상태
  const [activeTab, setActiveTab] = useState<'chatroom' | 'memory' | 'checklist'>('chatroom');
  const [currentBotKey, setCurrentBotKey] = useState<string>('chef');

  // 대화 메시지 상태
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'model',
      text: BOT_CHARACTERS.chef.welcome,
      avatar: BOT_CHARACTERS.chef.avatar
    }
  ]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([
    { role: 'model', parts: [{ text: BOT_CHARACTERS.chef.welcome }] }
  ]);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 로컬스토리지 복원
  useEffect(() => {
    const savedChecks = checklist.map((_, idx) => {
      return localStorage.getItem(`ai_lesson_21_check_${idx + 1}`) === 'true';
    });
    setChecklist(savedChecks);
  }, []);

  // 자동 스크롤
  useEffect(() => {
    if (activeTab === 'chatroom') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, activeTab]);

  // 캐릭터 전환
  const handleSelectBot = (key: string) => {
    setCurrentBotKey(key);
    const config = BOT_CHARACTERS[key];
    setMessages([
      { role: 'model', text: config.welcome, avatar: config.avatar }
    ]);
    setChatHistory([
      { role: 'model', parts: [{ text: config.welcome }] }
    ]);
  };

  // 대화 초기화
  const handleResetChat = () => {
    const config = BOT_CHARACTERS[currentBotKey];
    setMessages([
      { role: 'model', text: config.welcome, avatar: config.avatar }
    ]);
    setChatHistory([
      { role: 'model', parts: [{ text: config.welcome }] }
    ]);
  };

  // 메시지 전송 로직
  const handleSend = async (customText?: string) => {
    if (isThinking) return;
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    // 사용자 말풍선 추가
    const newMessages: ChatItem[] = [...messages, { role: 'user', text: textToSend }];
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

    setMessages([...newMessages, { role: 'model', text: reply, avatar: config.avatar }]);
    setChatHistory([...newHistory, { role: 'model', parts: [{ text: reply }] }]);
    setIsThinking(false);
  };

  // 히스토리 JSON 복사
  const handleCopyHistory = () => {
    const jsonStr = JSON.stringify(chatHistory, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });
  };

  // 체크리스트 변경
  const handleChecklistToggle = (idx: number) => {
    const updated = [...checklist];
    updated[idx] = !updated[idx];
    setChecklist(updated);
    localStorage.setItem(`ai_lesson_21_check_${idx + 1}`, updated[idx] ? 'true' : 'false');

    const allChecked = updated.every(Boolean);
    if (allChecked) {
      localStorage.setItem('ai_lesson_21_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_21_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);
  const currentConfig = BOT_CHARACTERS[currentBotKey];
  const turnCount = Math.floor(chatHistory.length / 2) || 1;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* ------------------------------------------------------------------- */}
      {/* 상단 헤더 GNB */}
      {/* ------------------------------------------------------------------- */}
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
              <a href="../20-gemini-api/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">20강 API 연동</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200/60 whitespace-nowrap">21강 AI 챗봇 알파 빌드</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span className="text-purple-600 font-mono font-bold text-xs">{progressPct}%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>

              {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage1'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>알파 빌드 설계</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage2'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>기본 대화 루프</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage3'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>컨텍스트 유지</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage4'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>첫 사용자 테스트</span>
                </button>
              </nav>
            </div>

            {progressPct === 100 ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                <span>22강 언락</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>22강 잠김</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 메인 2-패널 워크스페이스 */}
      {/* ------------------------------------------------------------------- */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* ■ 좌측 패널 (60% 폭): 퀘스트 가이드 */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 첫 심장 박동] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-slate-50 border border-purple-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  시즌 4: 첫 완성본 (알파 빌드)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  소요 시간: 약 45분
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <Activity className="w-3.5 h-3.5" />
                  첫 심장 박동
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                기획서와 AI 두뇌의 역사적 합체!<br />
                질문과 답변이 끝없이 오가는 첫 챗봇 알파 빌드
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                19강에서 종이에 그린 <strong>'린 기획 캔버스'</strong>와 20강에서 뚫어낸 <strong>'Google Gemini API 신경망'</strong>이{' '}
                드디어 하나로 연결됩니다! 아직 예쁜 스티커나 복잡한 부가 기능은 없어도, 내가 질문을 던지면 AI가 성격에 맞게{' '}
                대답하고 이전 대화까지 기억하는 <strong>'살아있는 첫 번째 프로토타입(알파 빌드)'</strong>을 내 손으로 작동시켜 봅니다.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white/80 border border-purple-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">선수 지식</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">19강 기획 &amp; 20강 API</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-purple-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">오늘의 무기</span>
                  <span className="text-xs font-bold text-purple-700 leading-snug whitespace-nowrap">동적 말풍선 &amp; 기억 상자</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-purple-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">핵심 개념</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">알파 빌드 &amp; 멀티턴</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-purple-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <span className="text-xs font-bold text-emerald-700 leading-snug whitespace-nowrap">동작하는 챗봇 알파 버전</span>
                </div>
              </div>
            </div>
          </div>

          {/* [Stage 1] 첫 심장 박동 */}
          <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                첫 심장 박동: 완벽함보다 중요한 '끝까지 돌아가는 한 바퀴'
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              세계적인 게임 회사나 IT 스타트업 개발자들은 제품을 만들 때 처음부터 완벽한 디자인을 꾸미지 않아요.{' '}
              가장 먼저 하는 일은 <strong>"핵심 기능이 중단 없이 처음부터 끝까지 한 바퀴 도는가?"</strong>를 확인하는 것입니다.{' '}
              이를 개발자들은 <strong>'알파 빌드(Alpha Build)'</strong>라고 불러요.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs sm:text-sm">
                  <Bot className="w-4 h-4" />
                  <span>레고 로봇의 첫 걸음마</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  멋진 스티커나 도색은 아직 없지만, 모터와 배터리를 연결했을 때 로봇이 앞뒤로 쿵쾅쿵쾅 넘어지지 않고 걸어가는 순간! 그 첫 걸음마가 바로 알파 빌드예요.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-xs sm:text-sm">
                  <HeartPulse className="w-4 h-4" />
                  <span>챗봇의 첫 심장 박동 5단계 루프</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  1) 질문 입력 ➔ 2) 로딩 스피너 ➔ 3) 구글 AI 전송 ➔ 4) 말풍선 렌더링 ➔ 5) 대화 기억 보관! 이 5단계 사이클이 멈춤 없이 돌아가면 100점입니다!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-300">오늘 우리의 알파 빌드 3대 합격 루브릭</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Alpha Milestone</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <strong className="text-white block font-bold">① 끊김 없는 왕복</strong>
                  <span className="text-[11px] text-slate-400">엔터를 쳤을 때 에러 없이 AI 답변이 화면에 나타나는가?</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 space-y-1">
                  <strong className="text-purple-300 block font-bold">② 답답함 없는 피드백</strong>
                  <span className="text-[11px] text-slate-300">AI가 생각하는 동안 '생각 중... 💭' 인디케이터가 뜨는가?</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <strong className="text-white block font-bold">③ 2번째 대화 기억</strong>
                  <span className="text-[11px] text-slate-400">"방금 말한 재료로 소스 비율도 알려줘!"처럼 문맥을 잇는가?</span>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 말풍선 공장 가동</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 말풍선 공장 가동] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* [Stage 2] 말풍선 공장 가동 */}
          <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                말풍선 공장 가동: 자바스크립트로 그리는 대화창 UI
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              채팅창은 고정된 웹페이지가 아니에요. 사용자가 말을 걸고 AI가 답을 할 때마다 화면에 새로운 네모 상자(말풍선)가{' '}
              실시간으로 쑥쑥 생겨나야 합니다. 자바스크립트의 <strong>DOM 조작</strong>을 사용하면 화면 새로고침 없이 부드럽게 대화 장면을 이어갈 수 있어요.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  USER
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-base font-bold text-purple-950">내 말풍선 (우측 정렬 &amp; 보라색)</strong>
                    <span className="text-[10px] font-mono text-purple-700">justify-end</span>
                  </div>
                  <p className="text-xs text-purple-900 leading-relaxed">
                    내가 쓴 글은 오른쪽에 착 붙고, 보라색 배경에 흰 글씨로 눈에 띄게 배치합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  BOT
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-base font-bold text-slate-900">챗봇 말풍선 (좌측 정렬 &amp; 캐릭터 아바타)</strong>
                    <span className="text-[10px] font-mono text-slate-500">justify-start</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    왼쪽에 귀여운 캐릭터 아이콘(🐹 셰프 등)과 함께 하얀색 카드 형태로 답변을 또박또박 띄웁니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  UX
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-base font-bold text-amber-950">자동 스크롤 마법 (Auto Scroll)</strong>
                    <span className="text-[10px] font-mono text-amber-700">scrollTop = scrollHeight</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    대화가 길어지면 새 메시지가 화면 밑으로 가려지지 않도록, 말풍선이 추가될 때마다 대화창 맨 아래로 자동 스크롤을 시켜줍니다!
                  </p>
                </div>
              </div>
            </div>
          </article>

              {/* 우측 챗봇 룸 (알파) 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [챗봇 룸]에서 알파 챗봇을 깨워보세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    방금 배운 DOM 말풍선 생성 엔진과 자동 스크롤 메커니즘을 가동할 차례입니다. 우측 콘솔의 <strong>[챗봇 룸]</strong>에서 질문을 입력하고, 사용자 말풍선과 AI의 파란색 말풍선이 자연스럽게 올라오는 첫 심장 박동을 느껴보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('chatroom')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [챗봇 룸 (알파)] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 첫 심장 박동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 기억 상자 조립</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 기억 상자 조립] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* [Stage 3] 기억 상자 조립 */}
          <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                기억 상자 조립: 이전 대화를 기억하는 멀티턴(Multi-turn) 마법
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              "계란으로 요리 추천해줘!" ➔ "오믈렛 어때요찍?" ➔ <strong>"그럼 양념 비율도 알려줘!"</strong><br />
              만약 챗봇이 이전 대화를 기억하지 못한다면 "무슨 양념을 말씀하시는 거죠?"라며 엉뚱한 답을 할 거예요.{' '}
              진짜 사람처럼 자연스럽게 대화가 이어지려면 <strong>대화 기억 상자(Chat History Array)</strong>가 필수입니다!
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-purple-300">구글 Gemini에게 보내는 '눈덩이 기억 상자' 구조</strong>
                <span className="text-[10px] font-mono text-slate-400">contents: [ ... ]</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-purple-200 leading-relaxed border border-slate-800 overflow-x-auto">
                <span className="text-slate-500">// 이전 질문과 답변을 차곡차곡 누적해서 배열로 보냅니다!</span><br />
                [<br />
                &nbsp;&nbsp;&#123; <span className="text-amber-300">role</span>: <span className="text-emerald-300">'user'</span>, parts: [&#123; text: <span className="text-white">'계란 요리 추천해줘'</span> &#125;] &#125;,<br />
                &nbsp;&nbsp;&#123; <span className="text-amber-300">role</span>: <span className="text-indigo-300">'model'</span>, parts: [&#123; text: <span className="text-white">'스페인식 감자 오믈렛 어때요찍?'</span> &#125;] &#125;,<br />
                &nbsp;&nbsp;&#123; <span className="text-amber-300">role</span>: <span className="text-emerald-300">'user'</span>, parts: [&#123; text: <span className="text-white">'그 오믈렛 소스 비율도 알려줘!'</span> &#125;] &#125;<br />
                ]
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                질문과 답변이 오갈 때마다 상자에 차곡차곡 쌓아서 구글 슈퍼컴퓨터에게 통째로 건네주면, AI가 이전 대화를 완벽히 이해하고 똑똑하게 답을 이어갑니다!
              </p>
            </div>
          </article>

              {/* 우측 기억 상자 연동 알림 카드 */}
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
                      대화를 나눴다면 우측 [기억 상자] 탭에서 대화 히스토리를 확인하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    AI가 내 이전 말을 잊어버리지 않게 누적 보관하는 대화 히스토리(History Array)를 확인하셨나요? 우측 콘솔의 <strong>[기억 상자]</strong> 탭에서 주고받은 role: user와 role: model 메시지 목록의 실시간 배열 구조를 관찰해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('memory')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [기억 상자] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 말풍선 공장 가동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 알파 테스터 출동</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 알파 테스터 출동] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* [Stage 4] 알파 테스터 출동 */}
          <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                알파 테스터 출동: 내 챗봇의 첫 대화 테스트 &amp; 에러 방어
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              알파 빌드를 완성했다면 주니어 개발자로서 3가지 필수 방어벽을 테스트해야 합니다.{' '}
              실제 사용자들이 실수로 누를 수 있는 오작동을 미리 차단해 두는 것이 멋진 프로그래머의 자세예요!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                  <Shield className="w-3.5 h-3.5" />
                  <span>1. 빈 말풍선 방지</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  아무 글자도 안 쓰고 스페이스만 누른 채 엔터를 치면 전송되지 않도록 <code className="font-mono text-[10px]">text.trim()</code>으로 걸러냅니다.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>2. 광클 연타 방지</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  AI가 답장을 쓰는 중에는 전송 버튼을 비활성화(<code className="font-mono text-[10px]">disabled</code>)하여 중복 질문 폭주를 막습니다.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>3. 새 대화 청소</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  주제를 바꾸고 싶을 때 언제든 [🔄 새 대화] 버튼을 눌러 기억 상자와 대화창을 깔끔하게 리셋할 수 있습니다.
                </p>
              </div>
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 22 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 22강을 여세요!</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    오늘 조립한 6대 챗봇 알파 대화창과 다중 턴 문맥 기억 배열 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 22강(로딩 스피너와 퀵 버튼으로 다듬는 챗봇 베타)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 22강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 기억 상자 조립
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
                  JUNIOR DEVELOPER GLOSSARY · 21강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 대화형 AI 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 알파 버전 소프트웨어 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-amber-400" />
                      1. 알파 버전 소프트웨어
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Alpha Build (Internal Milestone)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">빌드/마일스톤</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "색칠은 아직 안 했지만 바퀴와 모터가 힘차게 돌아가는 레고 자동차 초기 모델!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 핵심 기능(Core Feature)이 처음부터 끝까지 실제로 동작하는 첫 번째 내부 테스트 버전으로, 기능의 유효성을 최초로 검증하는 초기 개발 마일스톤 빌드입니다.
                </p>
              </div>
              {/* 용어 2: 다중 턴 대화 문맥 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-sky-300 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      2. 다중 턴 대화 문맥
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 멀티턴 컨텍스트 (Multi-turn Context Window)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">대화 상태 관리</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "앞서 나눈 이야기들을 까먹지 않고 머릿속에 기억해 둔 채 대화를 자연스럽게 이어가는 능력!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 이전의 질문과 답변 기록(Chat History)을 배열 형태로 보존하고 다음 API 호출 시 함께 전송하여, LLM이 앞선 대화의 문맥(Context)을 이해하고 답변하도록 돕는 연속 대화 기법입니다.
                </p>
              </div>
              {/* 용어 3: 동적 화면 조작 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      3. 동적 화면 조작
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 돔 조작 (DOM Manipulation)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">프론트엔드/DOM</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "만화책 종이에 새로운 캐릭터 말풍선 스티커를 착착 붙여 페이지를 생생하게 늘려가는 마법!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 자바스크립트를 사용하여 웹 브라우저의 HTML 문서 객체 모델(DOM Tree)에 새로운 노드(말풍선 등)를 생성(createElement), 삽입(appendChild), 수정하는 동적 UI 제어 기법입니다.
                </p>
              </div>
              {/* 용어 4: 자동 스크롤 내리기 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                      <ArrowDownCircle className="w-4 h-4 text-purple-400" />
                      4. 자동 스크롤 내리기
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Auto-scroll to Bottom (Scroll Anchoring)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">채팅 UI/인터랙션</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "긴 영수증이 기계에서 출력될 때, 방금 찍힌 맨 밑 글자가 보이도록 종이를 스르륵 내려주는 센서!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 채팅 메시지가 새로 추가될 때 사용자의 수동 조작 없이도 스크롤 위치를 대화창의 맨 아래(scrollTop = scrollHeight)로 자동 이동시켜 최신 발화를 즉각 시야에 노출하는 인터랙션 제어입니다.
                </p>
              </div>
              {/* 용어 5: 동시 입력 방지 가드 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      5. 동시 입력 방지 가드
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 디바운스 & 방어 가드 (Request Guard)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">안전성/방어코드</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "엘리베이터 문이 닫히는 중에는 닫힘 버튼을 아무리 백 번 눌러도 안전하게 한 번만 출발시키는 가드!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 비동기 네트워크 요청이 진행 중일 때 추가 클릭이나 엔터 입력을 잠금(isPending = true) 처리하여 불필요한 중복 호출과 시스템 혼선을 원천 차단하는 상태 제어 기법입니다.
                </p>
              </div>
              {/* 용어 6: 대화 기록 초기화 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-teal-300 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-teal-400" />
                      6. 대화 기록 초기화
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Session Reset & State Flush</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">세션/메모리</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "스케치북을 다 쓰면 지우개로 깨끗이 지우거나 새 도화지를 꺼내어 새로운 그림을 그리는 것!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 메모리에 저장된 대화 히스토리 배열과 UI 메시지 트리를 초기 상태로 리셋하여, 이전 대화의 간섭 없이 새로운 세션을 시작하는 상태 관리 메커니즘입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          {/* 3단 탭 내비게이션 바 */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('chatroom')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chatroom'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>챗봇 룸 (알파)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('memory')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'memory'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>기억 상자</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>21강 점검표</span>
            </button>
          </div>

          {/* [우측 탭 1] 챗봇 룸 */}
          {activeTab === 'chatroom' && (
            <div className="space-y-4">
              {/* 캐릭터 선택 바 */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-1">
                <div className="grid grid-cols-4 gap-1 flex-1">
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
                            ? 'border-purple-300 bg-purple-50 text-purple-800 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="mr-1">{cfg.avatar}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="px-2.5 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="대화 기록 비우고 새로 시작하기"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">새 대화</span>
                </button>
              </div>

              {/* 채팅 윈도우 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[480px] overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentConfig.avatar}</span>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block leading-tight">
                        {currentConfig.name}
                      </strong>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 대화 준비 완료
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    알파 빌드 (Mock 엔진)
                  </span>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar bg-slate-50/40">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}
                    >
                      {m.role === 'model' && (
                        <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm shrink-0 font-bold">
                          {m.avatar || currentConfig.avatar}
                        </span>
                      )}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap max-w-[85%] ${
                          m.role === 'user'
                            ? 'rounded-tr-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                            : 'rounded-tl-none bg-white border border-slate-200 shadow-xs text-slate-800'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 생각 중 인디케이터 */}
                {isThinking && (
                  <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs shrink-0 font-bold">
                      AI
                    </div>
                    <span className="text-xs text-purple-700 font-medium animate-pulse flex items-center gap-1">
                      생각 중... 💭
                    </span>
                  </div>
                )}

                {/* 퀵 질문 바 */}
                <div className="p-2 bg-slate-50/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">추천:</span>
                  {currentConfig.quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
                    >
                      "{q.length > 15 ? q.slice(0, 15) + '...' : q}"
                    </button>
                  ))}
                </div>

                {/* 인풋 바 */}
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
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={isThinking || !inputText.trim()}
                    className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>전송</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 알파 빌드 멀티턴 테스트 가이드 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>알파 빌드 멀티턴 대화 테스트 꿀팁</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                    Context Test
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <strong className="text-slate-800 block font-bold">💡 1단계: 재료 말하기</strong>
                    <p>"계란이랑 식빵이 있어!" 처럼 요리 재료를 알려주세요.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                    <strong className="text-purple-900 block font-bold">💡 2단계: 문맥 이어 질문</strong>
                    <p>"그 요리에 소스 비율은?" 처럼 앞 대화를 생략하고 물어보세요!</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] flex items-center justify-between">
                  <span>⌨️ 단축키: <kbd className="px-1.5 py-0.5 rounded bg-white font-mono font-bold text-[10px] border border-amber-200">Enter</kbd> 전송 / <kbd className="px-1.5 py-0.5 rounded bg-white font-mono font-bold text-[10px] border border-amber-200">Shift+Enter</kbd> 줄바꿈</span>
                  <span className="font-bold text-amber-700">안전 가드 작동 중</span>
                </div>
              </div>
            </div>
          )}

          {/* [우측 탭 2] 기억 상자 */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>대화 기억 상자 현황</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    현재 {turnCount}개 턴 (누적 {chatHistory.length}개 메시지)
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  구글 Gemini AI는 스스로 과거를 기억하지 못합니다. 우리가 대화를 주고받을 때마다 아래의{' '}
                  <code className="font-mono text-purple-700">history</code> 배열에 대화를 차곡차곡 누적하여 다음 요청 시 통째로 전송하기 때문에 문맥이 유지되는 것이에요!
                </p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-1">chat_history_state.json</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyHistory}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isCopied ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? '복사됨! ✨' : '히스토리 복사'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-purple-200 leading-relaxed border border-slate-800 overflow-x-auto max-h-[380px] custom-scrollbar">
                  <pre>{JSON.stringify(chatHistory, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* [우측 탭 3] 점검표 */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>21강 알파 빌드 완주 점검표</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-600">
                    {checkedCount} / 6 ({progressPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  모든 항목을 직접 체크하고 완료하면 다음 22강(베타 빌드 &amp; 버그 사냥)으로 진입할 수 있어요!
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: '1. 알파 빌드의 의미 이해하기',
                    desc: "완벽한 디자인보다 '핵심 기능이 처음부터 끝까지 끊김 없이 도는 첫 버전'의 가치를 배웠다."
                  },
                  {
                    title: '2. 동적 말풍선 UI 생성 (DOM 조작)',
                    desc: '새로운 질문과 답변이 발생할 때마다 실시간으로 말풍선 노드가 대화창에 추가되는 원리를 확인했다.'
                  },
                  {
                    title: '3. 자동 스크롤(Auto Scroll) 작동',
                    desc: '대화창이 길어지더라도 방금 나온 최신 메시지로 스크롤이 자동으로 내려가는 경험을 테스트했다.'
                  },
                  {
                    title: '4. 멀티턴 대화 기억 상자 관찰',
                    desc: "이전 대화가 '기억 상자 탭'의 JSON 배열에 누적되어 2번째 질문에도 문맥이 이어지는 것을 확인했다."
                  },
                  {
                    title: '5. 생각 중... 로딩 피드백 체감',
                    desc: 'AI가 답을 준비하는 동안 사용자가 멈춘 것으로 오해하지 않도록 인디케이터가 뜨는 UX를 경험했다.'
                  },
                  {
                    title: '6. 빈 문자열 및 연타 방지 가드 검증',
                    desc: '아무 글자도 안 적었을 때 전송이 막히고, 전송 중에는 버튼이 비활성화되는 안전 처리를 확인했다.'
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
                      className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                    />
                    <div className="text-xs leading-relaxed text-slate-800">
                      <strong className="font-bold text-slate-900 block mb-0.5">{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {progressPct === 100 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm sm:text-base font-bold block">축하합니다! 21강 알파 빌드 완주 완료 🎉</strong>
                      <span className="text-xs text-purple-100">살아있는 첫 번째 챗봇이 성공적으로 심장을 뛰기 시작했습니다!</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    질문과 답변이 끝없이 이어지고 대화 문맥까지 기억하는 온전한 알파 버전을 완성했습니다.{' '}
                    다음 22강에서는 이 챗봇에 모든 부가 기능을 합체하고 디자인을 다듬는 <strong>'베타 빌드(Beta Build)'</strong>로 넘어갑니다!
                  </p>
                  <a
                    href="../22-chatbot-beta/index.html"
                    className="w-full py-3 px-4 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>22강(베타 빌드 &amp; 버그 사냥)으로 이동하기</span>
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

export default Lesson21;
