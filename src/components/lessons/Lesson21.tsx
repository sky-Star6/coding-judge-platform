import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Award,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Bot,
  Lightbulb,
  Layers,
  Send,
  MessageSquare,
  History,
  MessageCircle,
  Database,
  Terminal,
  BookOpen,
  User,
  HeartPulse,
  Compass
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  metaTag?: string;
  time: string;
}

interface HistoryItem {
  turn: number;
  role: 'user' | 'bot';
  text: string;
  intent?: string;
  timestamp: string;
}

interface IntentData {
  name: string;
  keywords: Array<{ word: string; weight: number }>;
  responses: string[];
}

const INTENT_DATABASE: Record<string, IntentData> = {
  meal: {
    name: '급식 정보 조회 (Meal)',
    keywords: [
      { word: '급식', weight: 45 }, { word: '점심', weight: 40 },
      { word: '메뉴', weight: 30 }, { word: '밥', weight: 25 },
      { word: '식단', weight: 35 }, { word: '맛있는', weight: 15 }
    ],
    responses: [
      '오늘의 점심 급식 식단은 [찰흑미밥, 소고기 미역국, 돈가스 & 소스, 마카로니 샐러드, 배추김치, 방울토마토] 입니다! 맛있게 드시고 힘내세요! 🍱',
      '오늘 급식 메뉴는 [치킨마요 덮밥, 팽이버섯 된장국, 떡볶이, 깍두기, 요구르트] 입니다! 완전 인기 폭발 메뉴네요! 😋'
    ]
  },
  weather: {
    name: '날씨 & 우산 코디 (Weather)',
    keywords: [
      { word: '날씨', weight: 45 }, { word: '비', weight: 40 },
      { word: '우산', weight: 45 }, { word: '눈', weight: 40 },
      { word: '기온', weight: 30 }, { word: '추워', weight: 20 },
      { word: '더워', weight: 20 }, { word: '비와', weight: 35 }
    ],
    responses: [
      '오늘 오후부터 비 예보가 있어요! 가방에 꼭 접이식 우산을 챙기시고 쌀쌀할 수 있으니 겉옷을 입으세요! ☔',
      '현재 날씨는 맑고 따뜻하지만, 저녁에는 기온이 뚝 떨어질 예정입니다. 감기 조심하세요! 🌤️'
    ]
  },
  voca: {
    name: '영단어 학습 꿀팁 (Voca)',
    keywords: [
      { word: '단어', weight: 45 }, { word: '영어', weight: 40 },
      { word: '외우', weight: 35 }, { word: '암기', weight: 35 },
      { word: '꿀팁', weight: 25 }, { word: '공부', weight: 25 }
    ],
    responses: [
      '영단어를 외울 때는 깜지 대신 문장 속에서 쓰임을 보고, 하루 뒤와 3일 뒤에 복습하는 망각곡선 암기법을 추천해요! 📚',
      '오늘의 추천 영단어는 "Adventure(모험)"와 "Curious(호기심 많은)"입니다! 스스로 짧은 문장을 만들어 보세요! 💡'
    ]
  },
  greeting: {
    name: '친절한 첫인사 (Greeting)',
    keywords: [
      { word: '안녕', weight: 40 }, { word: '반가', weight: 35 },
      { word: '하이', weight: 35 }, { word: '누구', weight: 30 }
    ],
    responses: [
      '반가워요! 저는 브라우저 순수 자바스크립트로 생각하는 로컬 챗봇 알파입니다. 무엇을 도와드릴까요? 😊',
      '안녕하세요! 19강 기획과 20강 두뇌를 거쳐 21강에서 심장이 뛰기 시작한 알파 챗봇이에요! 반갑습니다! ✨'
    ]
  }
};

const Lesson21: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');

  // 챗봇 시뮬레이터 상태
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '반가워요! 19강에서 설계한 페르소나와 20강의 로컬 추론 엔진을 탑재한 \'알파 챗봇\'입니다. 😊\n급식 메뉴, 날씨와 우산, 영어단어 공부 팁을 물어보시면 즉시 답변해 드려요! 연속 질문("방금 말한 거 다시 알려줘")도 테스트해 보세요.',
      metaTag: '시스템 연결됨',
      time: '방금 전'
    }
  ]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 체크리스트 상태
  const TOTAL_CHECKS = 6;
  const [checklist, setChecklist] = useState<number[]>([]);

  // 퀘스트 복사 상태
  const [copiedQuest, setCopiedQuest] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_21_checklist');
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
    localStorage.setItem('ai_lesson_21_checklist', JSON.stringify(next));
    if (next.length === TOTAL_CHECKS) {
      localStorage.setItem('ai_lesson_21_completed', 'true');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const classifyIntent = (text: string) => {
    const cleaned = text.replace(/[^가-힣a-zA-Z0-9\s]/g, ' ').toLowerCase();
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 0);
    const scores: Record<string, number> = { meal: 0, weather: 0, voca: 0, greeting: 0 };

    tokens.forEach(token => {
      for (const [intentKey, data] of Object.entries(INTENT_DATABASE)) {
        data.keywords.forEach(kw => {
          if (token.includes(kw.word) || kw.word.includes(token)) {
            scores[intentKey] += kw.weight;
          }
        });
      }
    });

    let topIntent: string | null = null;
    let maxScore = 0;
    for (const [intentKey, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topIntent = intentKey;
      }
    }

    const recognized = maxScore >= 40;
    return { topIntent, maxScore, recognized };
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

    // 2. 인위적 비동기 딜레이 (700ms) 후 봇 응답 처리
    setTimeout(() => {
      let finalIntent: string | null = null;
      let botResponse = '';
      let intentLabel = '';

      const isMultiTurnRefer = ['방금', '아까', '그거', '요약', '다시'].some(kw => query.includes(kw));

      if (isMultiTurnRefer && chatHistory.length > 0) {
        const lastBotTurn = [...chatHistory].reverse().find(msg => msg.role === 'bot' && msg.intent);
        if (lastBotTurn?.intent) {
          finalIntent = lastBotTurn.intent;
          intentLabel = `[문맥 계승: ${INTENT_DATABASE[finalIntent]?.name || finalIntent}]`;
          botResponse = `네! 방금 말씀하신 [${INTENT_DATABASE[finalIntent]?.name.split(' ')[0]}]에 대해 요약해 드릴게요. 핵심 내용이 잘 기억나지 않으시면 언제든 다시 물어보세요! 😊`;
        }
      }

      if (!finalIntent) {
        const inference = classifyIntent(query);
        if (inference.recognized && inference.topIntent) {
          finalIntent = inference.topIntent;
          const resps = INTENT_DATABASE[finalIntent].responses;
          botResponse = resps[Math.floor(Math.random() * resps.length)];
          intentLabel = `[인텐트 판별: ${INTENT_DATABASE[finalIntent].name.split(' ')[0]}]`;
        } else {
          finalIntent = 'fallback';
          intentLabel = '[폴백 안전망 발동 · 신뢰도 미달]';
          botResponse = '죄송해요, 입력하신 내용에서 정확한 의도를 파악하지 못했어요. 😅 혹시 "급식 메뉴", "오늘 날씨", "영단어 꿀팁"처럼 명확한 단어로 다시 말씀해 주시겠어요?';
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        metaTag: intentLabel,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      // 히스토리 누적
      setChatHistory(prev => [
        ...prev,
        {
          turn: newTurn,
          role: 'user',
          text: query,
          timestamp: currentTime
        },
        {
          turn: newTurn,
          role: 'bot',
          text: botResponse,
          intent: finalIntent || undefined,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);

      setIsProcessing(false);
    }, 700);
  };

  const resetChat = () => {
    setChatHistory([]);
    setTurnCount(0);
    setMessages([
      {
        id: 'reset-welcome',
        sender: 'bot',
        text: '대화창과 기억 상자가 깨끗하게 비워졌습니다! 새로운 질문을 던져보세요. 😊',
        metaTag: '초기화 완료',
        time: '방금 전'
      }
    ]);
  };

  const copyPrompt = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuest(idx);
    setTimeout(() => setCopiedQuest(null), 1800);
  };

  const progressPercent = Math.round((checklist.length / TOTAL_CHECKS) * 100);

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
                시즌 4 · 21강: 챗봇의 첫 심장 박동: AI와 대화가 오가는 첫 버전 완성 (알파 빌드)
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
              <span>알파 챗봇 룸</span>
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
              {stg === 'stage2' && '챗봇룸'}
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
                    <HeartPulse className="w-4 h-4" />
                    시즌 4 로컬 AI 코어 트랙 · 첫 프로토타입
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-slate-200 border border-white/10">
                    <Layers className="w-4 h-4" />
                    대화 루프 &amp; 멀티턴 기억
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  챗봇의 첫 심장 박동!<br />
                  AI와 대화가 오가는 첫 버전 완성 (알파 빌드)
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  19강에서 종이에 스케치한 <strong>'챗봇 페르소나'</strong>와 20강에서 완성한 <strong>'로컬 AI 추론 엔진'</strong>이 드디어 하나로 합체합니다!
                  외부 유료 API나 복잡한 열쇠 없이, 내가 말을 걸면 실시간으로 말풍선을 띄우고, 이전 대화 기록(멀티턴)까지 기억하며 티키타카가 오가는
                  <strong>'살아있는 첫 번째 챗봇 프로토타입(알파 빌드)'</strong>의 첫 심장 박동을 울려봅니다.
                </p>
              </div>

              {/* 도전 목표 3열 카드 (소요 시간 완전 배제) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>1. 동적 말풍선 렌더링</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    사용자와 AI의 메시지를 DOM으로 실시간 찍어내고 자동 스크롤로 바닥에 붙입니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <History className="w-4 h-4" />
                    <span>2. 멀티턴 대화 기억 상자</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    이전 대화 내역(History Array)을 차곡차곡 누적하여 문맥을 잇는 지능형 대화를 만듭니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. 3대 필수 UX 방어벽</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    빈 말풍선 전송 방지(trim), 응답 중 연타 방지(disabled), 새 대화 리셋을 구축합니다.
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
                  로컬 챗봇 알파 빌드의 3대 핵심 원리
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  화려한 스티커를 붙이기 전, 대화 프로그램이 멈추지 않고 끝없이 순환하게 만드는 3대 프로그래밍 기둥을 배웁니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 원리 01 */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      원리 01
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">1. 동적 DOM 말풍선 생성</h4>
                    <span className="text-sm font-mono text-slate-400 block">Dynamic DOM Rendering</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    사용자 말풍선(우측)과 봇 말풍선(좌측)을 JavaScript로 동적 생성하여 대화창에 삽입하고, 새 메시지가 추가될 때마다 바닥으로 즉시 스크롤(scrollTop = scrollHeight)합니다.
                  </p>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                    <span className="text-sm font-bold text-indigo-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 어린이 눈높이 비유
                    </span>
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      "끝없이 늘어나는 롤페이퍼 만화책에 말풍선 스티커를 아래로 차곡차곡 이어 붙이는 것과 같아요!"
                    </p>
                  </div>
                </div>

                {/* 원리 02 */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <History className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      원리 02
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">2. 멀티턴 대화 기억 상자</h4>
                    <span className="text-sm font-mono text-slate-400 block">Conversation History Array</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    AI는 이전 대화를 저절로 기억하지 못하므로, 주고받은 질문과 답변을 chatHistory 배열에 차곡차곡 보관하여 "그럼 아까 말한 건?" 같은 연속 질문에 답할 수 있게 합니다.
                  </p>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                    <span className="text-sm font-bold text-purple-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 어린이 눈높이 비유
                    </span>
                    <p className="text-sm text-purple-900 leading-relaxed">
                      "방금 나눈 이야기를 스케치북 메모장에 적어두고, 다음 질문이 왔을 때 메모장을 훔쳐보며 답하는 것과 같아요!"
                    </p>
                  </div>
                </div>

                {/* 원리 03 */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      원리 03
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">3. 3대 필수 사용자 안전망</h4>
                    <span className="text-sm font-mono text-slate-400 block">Input &amp; UX Defensive Guards</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    공백만 입력하고 엔터를 칠 때 방어하는 trim(), 봇이 생각하는 동안 중복 클릭을 막는 disabled, 대화가 꼬였을 때 새로 시작하는 reset 안전망을 구축합니다.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 어린이 눈높이 비유
                    </span>
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      "자동차를 달리기 전에 안전벨트를 매고, 신호등 빨간불에는 잠시 멈추는 든든한 가드레일이에요!"
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
                    주니어 개발자 원칙: 완벽한 디자인보다 '끝까지 돌아가는 한 바퀴(알파 빌드)'가 먼저입니다!
                  </strong>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    IT 스타트업과 빅테크 엔지니어들은 화려한 애니메이션이나 스티커를 넣기 전, <strong>"입력 ➔ 정제 및 추론 ➔ 말풍선 출력 ➔ 대화 기록 누적 ➔ 다음 입력 대기"</strong>의 5단계 사이클이 에러 없이 무한히 순환하는지(End-to-End Loop)를 가장 먼저 검증합니다.
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
                <span>다음: Stage 2 알파 챗봇 룸 실습 →</span>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* [STAGE 2] 가상 인터랙티브 실습 콘솔 (In-Page Alpha Chatbot Simulator) */}
        {/* ------------------------------------------------------------------- */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                <Bot className="w-4 h-4" />
                <span>Interactive Alpha Chatbot Room</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                살아있는 챗봇 알파 빌드 룸 &amp; 실시간 멀티턴 대화 실습
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                19강의 페르소나와 20강의 로컬 추론 두뇌가 결합된 실전 대화창입니다. 직접 질문을 던지거나 추천 칩을 눌러 첫 심장 박동을 확인해 보세요.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* 툴바 */}
              <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-200">로컬 챗봇 알파 빌드 v0.1</span>
                  <span className="text-sm font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    STATUS: READY
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                    대화 진행: {turnCount}턴
                  </span>
                  <button
                    type="button"
                    onClick={resetChat}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>대화 초기화</span>
                  </button>
                </div>
              </div>

              {/* 칩 바 */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>원클릭 추천 질문 칩 (타이핑 없이 바로 테스트)</span>
                  </span>
                  <span className="text-sm text-slate-400">클릭 즉시 질문 전송</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('오늘 점심 급식 메뉴 뭐야?')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🍱</span>
                    <span>오늘 점심 급식 메뉴 뭐야?</span>
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
                    onClick={() => handleSendMessage('방금 말한 거 다시 한 번 요약해줘!')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🧠</span>
                    <span>방금 말한 거 다시 한 번 요약해줘! (멀티턴)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage('샬라샬라 크크루삥뽕 외계어 장난')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/40 text-sm font-medium text-amber-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>🛡️</span>
                    <span>샬라샬라 외계어 장난 (폴백 테스트)</span>
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
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    <div className={`space-y-1 max-w-[85%] ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                      <div className="flex items-center gap-2">
                        {msg.sender === 'user' && <span className="text-sm text-slate-400">{msg.time}</span>}
                        <span className="text-sm font-bold text-slate-900">
                          {msg.sender === 'user' ? '나 (User)' : '로컬 AI 챗봇'}
                        </span>
                        {msg.sender === 'bot' && <span className="text-sm text-slate-400">{msg.time}</span>}
                        {msg.metaTag && (
                          <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                            {msg.metaTag}
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                          msg.sender === 'user'
                            ? 'rounded-tr-sm bg-indigo-600 text-white'
                            : 'rounded-tl-sm bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        {msg.text}
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
                    <span>AI 두뇌가 문장을 정제하고 인텐트를 추론하는 중... 💭</span>
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
                    placeholder="챗봇에게 궁금한 점을 질문해 보세요... (Enter 키로 전송)"
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

              {/* 하단 메모리 인스펙터 */}
              <div className="p-4 bg-slate-900 text-white border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Database className="w-4 h-4" />
                    <span>실시간 대화 기억 상자 뷰어 (chatHistory Array Inspector)</span>
                  </div>
                  <span className="text-sm font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    {chatHistory.length}개 메시지 누적
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  내가 질문하고 챗봇이 대답할 때마다 아래 JavaScript 배열에 <code>{'{ role, text, intent }'}</code> 객체가 실시간 저장되며, 다음 턴의 문맥 판단에 사용됩니다.
                </p>
                <pre className="bg-slate-950 p-3 rounded-xl font-mono text-sm text-emerald-400 border border-slate-800 overflow-x-auto max-h-36 whitespace-pre">
                  {chatHistory.length === 0
                    ? '// 아직 대화 내역이 없습니다. 위 대화창에서 질문을 전송해 보세요!\n[]'
                    : JSON.stringify(chatHistory, null, 2)}
                </pre>
              </div>
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
                외부 ChatGPT나 Gemini 창을 옆에 띄우고 아래 정밀 설계된 5대 프롬프트를 원클릭으로 복사하여 챗봇 알파 빌드의 핵심 모듈 코드를 직접 소환하고 테스트해 보세요.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  id: 1,
                  badge: 'QUEST 01',
                  tag: 'DOM 렌더링 & 스크롤 ★★★',
                  title: '새 메시지가 오면 화면에 말풍선을 띄우고 바닥으로 자동 이동시키는 JS 렌더러 작성',
                  desc: '사용자와 봇의 말풍선 UI를 동적으로 생성하고, 메시지가 길어져도 최신 대화가 가려지지 않게 바닥으로 스크롤을 내리는 코드를 소환합니다.',
                  prompt: `[역할]\n너는 웹 프론트엔드 인터랙션 전문 시니어 자바스크립트 엔지니어이자 코딩 멘토야.\n\n[목표]\n웹 브라우저 채팅창에서 사용자(우측 정렬)와 챗봇(좌측 정렬)의 말풍선을 동적으로 생성하여 추가하고, 대화창 스크롤을 자동으로 맨 바닥으로 내리는 appendMessage(sender, text) 함수를 순수 자바스크립트로 작성해 줘.\n\n[세부 요구사항]\n1. sender가 'user'면 우측 정렬(bg-indigo-600, 흰 글씨), 'bot'이면 좌측 정렬(bg-white, 캐릭터 아이콘 포함)로 분기해 줘.\n2. 메시지가 화면에 삽입된 즉시 chatContainer.scrollTop = chatContainer.scrollHeight를 실행해 최신 글이 항상 보이게 해 줘.\n3. DOM XSS 방지를 위해 사용자 텍스트는 textContent로 안전하게 처리해 줘.\n4. 초보자도 쉽게 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: '브라우저는 DOM에 새 요소를 추가한 뒤 화면을 다시 그리는 리플로우(Reflow)와 리페인트(Repaint) 과정을 거칩니다. 요소가 화면에 온전히 추가되기 전에 스크롤 위치를 계산하면 높이가 반영되지 않아 스크롤이 중간에 멈출 수 있습니다. 따라서 DOM 트리에 노드를 완전히 부착한 뒤 scrollTop = scrollHeight를 적용해야 완벽한 자동 스크롤이 작동합니다.'
                },
                {
                  id: 2,
                  badge: 'QUEST 02',
                  tag: '상태 관리 & 문맥 계승 ★★★★',
                  title: '이전 대화를 기억하고 "방금 말한 거" 같은 지시어를 알아채는 멀티턴 기억 상자 구현',
                  desc: '단발성 문답을 넘어 이전 질문과 답변의 맥락을 배열에 보관하고 연속된 질문을 처리하는 상태 머신 로직을 소환합니다.',
                  prompt: `[역할]\n너는 대화형 AI 시스템 아키텍처 전문가이자 자바스크립트 알고리즘 멘토야.\n\n[목표]\n챗봇이 이전 대화 내역을 최대 10개까지 배열로 보관하고, 사용자가 "방금 말한 거", "아까 그거" 같은 연속 질문을 던졌을 때 직전 턴의 의도(Intent)를 계승하여 대답할 수 있는 ConversationMemory 클래스를 작성해 줘.\n\n[세부 요구사항]\n1. addMessage(role, text, intent) 메서드로 메시지 객체를 차곡차곡 push하고, 10개가 넘으면 가장 오래된 메시지를 shift(FIFO)해 줘.\n2. getContextIntent(currentText) 메서드를 만들어 만약 사용자의 입력에 ['방금', '아까', '그거', '다시'] 키워드가 포함되어 있다면 직전 봇 답변의 intent를 찾아 반환해 줘.\n3. clear() 메서드로 기억 상자를 초기화하는 기능도 포함해 줘.\n4. 초보자도 쉽게 따라할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: '거대 언어 모델(LLM)이나 서버 API는 자체적으로 이전 대화를 기억하지 않는 \'무상태(Stateless)\' 방식으로 동작합니다. 따라서 대화가 자연스럽게 이어지는 모든 상용 챗봇은 클라이언트나 세션 저장소에서 이전 대화 이력(History Buffer)을 관리하며 매 요청마다 문맥을 함께 전달하는 구조로 설계됩니다.'
                },
                {
                  id: 3,
                  badge: 'QUEST 03',
                  tag: '방어적 프로그래밍 & 안전망 ★★★',
                  title: '공백 입력 차단, 광클 연타 방지, 세션 리셋을 처리하는 3대 UX 방어 모듈 작성',
                  desc: '사용자가 아무 글자도 안 치고 엔터를 누르거나 전송 버튼을 빠르게 10번 누를 때 시스템이 고장 나지 않도록 지키는 방어벽을 구축합니다.',
                  prompt: `[역할]\n너는 사용자 경험(UX) 안전성과 프론트엔드 방어적 프로그래밍 전문 소프트웨어 엔지니어이자 코딩 멘토야.\n\n[목표]\n사용자의 비정상적인 돌발 행동으로부터 챗봇 시스템을 지키는 3대 안전 가드(빈 문자열 차단, 광클 연타 방지, 대화 리셋)를 순수 자바스크립트로 구현해 줘.\n\n[세부 요구사항]\n1. validateInput(text): text.trim()의 길이가 0이면 alert나 시각적 흔들림(shake) 효과와 함께 전송을 취소하는 함수 작성.\n2. setGeneratingState(isGenerating): AI가 답변을 작성 중일 때(isGenerating = true) 전송 버튼을 disabled로 잠그고 입력창 포커스를 보호하는 함수 작성.\n3. resetSession(): 대화창 DOM을 초기화하고 안내 인사말만 남기며 메모리 버퍼를 청소하는 함수 작성.\n4. 초보자도 쉽게 이해할 수 있도록 매 줄마다 친절한 한국어 주석을 달아줘.`,
                  secret: '실제 소프트웨어 개발에서는 정상적인 사용보다 사용자의 오작동이나 네트워크 딜레이 상황에서 발생하는 버그가 전체 이슈의 80% 이상을 차지합니다. 이를 사전에 차단하는 기법을 \'방어적 프로그래밍(Defensive Programming)\'이라 부르며, 버튼 비활성화(Debouncing)는 서버 부하와 클라이언트 충돌을 막는 가장 기본적이면서 강력한 기술입니다.'
                },
                {
                  id: 4,
                  badge: 'QUEST 04',
                  tag: '비동기 인터랙션 & 딜레이 ★★★★',
                  title: '점 3개가 춤추는 생각 중 애니메이션과 인간미 넘치는 타이핑 지연 시뮬레이션',
                  desc: '컴퓨터의 0.001초 즉답 대신, 사용자가 기계적이지 않게 느끼도록 자연스러운 생각 시간(0.6초~1초)을 부여하는 비동기 지연 모듈을 소환합니다.',
                  prompt: `[역할]\n너는 웹 프론트엔드 비동기 프로그래밍 및 마이크로 인터랙션 전문가야.\n\n[목표]\n사용자가 질문을 보낸 직후 채팅창에 "AI가 생각 중입니다... 💭" 말풍선(또는 점 3개 바운스 애니메이션)을 띄우고, 600ms~1000ms의 인위적 지연 후 실제 챗봇 답변으로 매끄럽게 교체하는 simulateBotResponseWithDelay() 비동기 함수를 작성해 줘.\n\n[세부 요구사항]\n1. Promise와 setTimeout을 활용한 sleep(ms) 헬퍼 함수를 구현해 줘.\n2. 생각 중 말풍선을 임시로 화면에 추가했다가 응답이 준비되면 임시 요소를 제거하고 최종 답변 말풍선으로 치환해 줘.\n3. 생각하는 동안 스크롤이 자동으로 바닥을 유지하도록 처리해 줘.\n4. 초보자도 쉽게 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: 'HCI(인간-컴퓨터 상호작용) 연구에 따르면, AI가 0.001초 만에 답을 내놓으면 사용자는 "제대로 생각하지 않고 기계적으로 출력했다"고 느끼는 반면, 0.6초~1초의 짧은 타이핑 인디케이터가 표시되면 "내 질문을 분석하고 고민해서 답을 주었다"는 심리적 만족감(인지된 지능, Perceived Intelligence)이 크게 상승합니다.'
                },
                {
                  id: 5,
                  badge: 'QUEST 05',
                  tag: '풀 아키텍처 완성 ★★★★★',
                  title: '렌더러, 추론 엔진, 멀티턴 기억, 안전망을 하나로 엮은 올인원 챗봇 알파 앱',
                  desc: '20강의 추론 엔진과 21강의 대화 루프 모듈을 완벽하게 통합하여 독립 실행 가능한 하나의 완성형 알파 클래스를 소환합니다.',
                  prompt: `[역할]\n너는 에듀테크 웹 소프트웨어 총괄 아키텍트이자 학생들을 위한 코딩 멘토야.\n\n[목표]\n외부 라이브러리나 API 키 없이, 100% 브라우저 순수 자바스크립트로 동작하는 올인원 챗봇 알파 애플리케이션 클래스(ChatbotAlphaApp)를 작성해 줘.\n\n[세부 요구사항]\n1. 내부 상태로 messages 배열, conversationMemory 객체, isProcessing 플래그를 관리해 줘.\n2. 20강의 가중치 기반 인텐트 분석기(classifyIntent)를 내장해 급식, 날씨, 단어공부, 인사, 폴백을 판별해 줘.\n3. handleSendMessage(userText) 메서드로 [입력 검증 ➔ 유저 말풍선 렌더 ➔ 인디케이터 표시 ➔ 700ms 딜레이 ➔ 로컬 추론 ➔ 봇 말풍선 렌더 ➔ 자동 스크롤 ➔ 히스토리 저장]의 8단계 전체 라이프사이클을 완성해 줘.\n4. 초보자도 바로 웹페이지에 붙여넣어 구동할 수 있도록 HTML 연동 예시와 매 줄마다 상세한 한국어 주석을 달아줘.`,
                  secret: '여러 함수와 전역 변수를 따로 두지 않고 하나의 클래스나 모듈로 캡슐화(Encapsulation)하면, 코드 간의 충돌을 방지하고 22강의 세련된 디자인 테마나 23강의 사용자 피드백 분석 도구를 레고 블록처럼 손쉽게 덧붙일 수 있는 탄탄한 소프트웨어 기반이 완성됩니다.'
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
                ← 이전: Stage 2 알파 챗봇 룸
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
            {/* 용어 돋보기 */}
            <article className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                  <BookOpen className="w-4 h-4" />
                  <span>Junior Developer Glossary</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  주니어 개발자를 위한 전문 용어 돋보기
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  오늘 배운 챗봇 대화 루프와 멀티턴 원리의 공식 컴퓨터 과학 용어를 완벽하게 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 용어 1 */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                      <span>알파 빌드</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-4.5">Alpha Build</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 어린이 비유
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        멋진 페인트칠을 하기 전, 모터와 바퀴를 달고 처음으로 앞으로 굴러가는 레고 자동차의 첫 걸음마!
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-white">🎓 개발자 공식 정의:</strong> 화려한 디자인이나 부가 기능보다, 핵심 기능의 입력부터 처리 및 출력까지 전체 라이프사이클이 멈춤 없이 작동하는지 검증하는 초기 소프트웨어 버전입니다.
                    </p>
                  </div>
                </div>

                {/* 용어 2 */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                      <span>멀티턴 대화</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-4.5">Multi-turn Dialogue</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 어린이 비유
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        "아까 말한 그거!"라고 말해도 친구가 앞선 대화를 기억하고 척척 알아듣는 핑퐁 대화!
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-white">🎓 개발자 공식 정의:</strong> 단발성 질의응답(Single-turn)과 달리, 이전 발화 내역(History)을 메모리에 보관하여 연속된 질문 간의 문맥과 지시대명사를 해석하는 대화형 AI 기술입니다.
                    </p>
                  </div>
                </div>

                {/* 용어 3 */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <span>동적 DOM 조작</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-4.5">DOM Manipulation</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 어린이 비유
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        도화지를 통째로 새로 사지 않고, 새로운 만화 스티커를 가위로 오려 실시간으로 쏙쏙 붙이는 마법!
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-white">🎓 개발자 공식 정의:</strong> 웹페이지를 새로고침하지 않고 JavaScript 코드를 통해 문서 객체 모델(DOM) 트리에 새로운 HTML 엘리먼트를 동적으로 생성(createElement)하고 부착(appendChild)하는 기술입니다.
                    </p>
                  </div>
                </div>

                {/* 용어 4 */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span>자동 스크롤</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-4.5">Auto Scroll (scrollTop = scrollHeight)</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 어린이 비유
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        새로운 글이 나타나면 손가락으로 밀지 않아도 화면이 스르륵 내려가서 바로 보여주는 마법 에스컬레이터!
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-white">🎓 개발자 공식 정의:</strong> 컨테이너 엘리먼트의 스크롤 위치(scrollTop)를 전체 스크롤 높이(scrollHeight)로 설정하여 새로 추가된 최신 콘텐츠가 사용자 시야에 즉시 보이도록 보장하는 UI 인터랙션입니다.
                    </p>
                  </div>
                </div>

                {/* 용어 5 */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 md:col-span-2">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span>방어적 프로그래밍과 UX 가드</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-4.5">Defensive Programming &amp; Guard Rails</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 어린이 비유
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        자판기에 찌그러진 캔이나 종이 조각을 넣으면 고장 나기 전에 자동으로 퉤 뱉어내는 똑똑한 안전 센서!
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong className="text-white">🎓 개발자 공식 정의:</strong> 공백 입력 필터링(trim), 비동기 처리 중 중복 클릭 방지(disabled), 비정상 상태 초기화(reset) 등을 통해 사용자의 오작동이나 예외 상황에서도 시스템이 다운되지 않도록 사전에 보호하는 핵심 개발 기법입니다.
                    </p>
                  </div>
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
                    text: '알파 빌드의 가치: 화려한 꾸밈보다 "질문 ➔ 추론 ➔ 답변 ➔ 기억" 사이클이 중단 없이 돌아가는 첫 심장 박동(알파 빌드)의 중요성을 이해했나요?'
                  },
                  {
                    id: 2,
                    text: '동적 말풍선 렌더링: 사용자(우측)와 챗봇(좌측)의 말풍선을 JavaScript로 실시간 화면에 찍어내는 DOM 조작(createElement & appendChild) 원리를 확인했나요?'
                  },
                  {
                    id: 3,
                    text: '자동 스크롤(Auto Scroll): 새 메시지가 추가될 때마다 대화창 맨 바닥으로 자동 이동하는 scrollTop = scrollHeight 메커니즘을 체득했나요?'
                  },
                  {
                    id: 4,
                    text: '멀티턴 대화 기억 상자: chatHistory 배열에 이전 발화 내역을 누적하여 "방금 말한 거" 같은 연속된 문맥 질문에 대응하는 원리를 이해했나요?'
                  },
                  {
                    id: 5,
                    text: '3대 필수 UX 방어벽: 빈 말풍선 전송 방지(trim), 답변 중복 연타 방지(disabled), 대화 초기화(reset)를 직접 테스트해 보았나요?'
                  },
                  {
                    id: 6,
                    text: '22강 베타 빌드 도약 준비: 첫 대화 알파 버전을 완성하고, 22강에서 모든 기능을 합체하고 디자인 테마를 다듬을 준비를 마쳤나요?'
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
                          Stage 21 Cleared · Chatbot Alpha Builder
                        </span>
                        <span className="text-sm bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          알파 빌드 마스터 ★★★★★
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        21강 챗봇 알파 빌드 완성 수료! 🎉
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        축하합니다! 챗봇의 첫 심장 박동을 성공적으로 울렸습니다! 동적 말풍선 렌더링, 자동 스크롤, 멀티턴 대화 기억 상자, 그리고 3대 UX 방어벽까지 완벽하게 정복했습니다. 이제 22강에서 모든 기능을 하나로 합체하고 세련된 디자인을 입히는 베타 빌드 단계로 나아갈 수 있습니다!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                      <span className="text-sm text-white font-bold block">
                        22강: 모든 기능 합체! 디자인 다듬기와 마지막 버그 잡기 (베타 빌드)
                      </span>
                    </div>
                    <a
                      href="../22-chatbot-beta/index.html"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition-all shadow-md"
                    >
                      <span>22강으로 즉시 이동하기</span>
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
            <span className="truncate">시즌 4 · 21강: 챗봇 첫 심장 박동 (알파 빌드)</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap shrink-0">
            <a href="../../index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="../20-chatbot-brain/index.html" className="hover:text-slate-900 transition-colors">20강 바로가기</a>
            <a href="../22-chatbot-beta/index.html" className="hover:text-slate-900 transition-colors">22강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson21;
