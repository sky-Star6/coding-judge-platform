import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Search,
  MessageSquare,
  Award,
  Cpu,
  Lightbulb,
  Terminal,
  RotateCcw,
  Bot,
  Send,
  Loader2,
  Dices,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface FactScenario {
  keywords: string[];
  hallucinationResponse: string;
  fakeKeywords: string;
  realFact: string;
  summary: string;
  counterResponse: string;
}

const AI_KNOWLEDGE_BASE: Record<string, FactScenario> = {
  macbook: {
    keywords: ['맥북', '노트북', '컴퓨터', '트랙패드'],
    hallucinationResponse:
      '세종대왕 15년(1433년), 세종께서는 집현전 학사들과 훈민정음 초안을 작성하시던 중 맥북 프로 M1 모델의 트랙패드가 버벅거리자 크게 노하여 대전 앞마당에 맥북을 던져버렸다고 전해집니다. 당시 신하들은 맥북의 수리비가 비싸 안타까워했다고 기록되어 있습니다.',
    fakeKeywords: '#맥북프로 #트랙패드 #M1칩 #수리비',
    realFact: '조선왕조실록 및 국립중앙박물관 공식 기록',
    summary:
      '조선시대에는 전자기기나 애플 사가 존재하지 않았습니다! AI가 단어들의 그럴듯한 맥락만 보고 지어낸 100% 허구의 환각(Hallucination)입니다.',
    counterResponse:
      '앗, 들켰습니다! 😅 맞습니다. 조선왕조실록 어디에도 맥북은 없습니다! 저는 역사적 사실을 아는 것이 아니라 단어들을 그럴듯하게 이어붙이다가 심각한 거짓말(환각)을 했습니다. 날카로운 팩트체크에 항복합니다!'
  },
  tyrano: {
    keywords: ['티라노', '공룡', '스마트폰', '휴대폰', '무전'],
    hallucinationResponse:
      '백악기 후기(약 6,800만 년 전), 티라노사우루스 무리는 앞다리가 너무 짧아 5G 스마트폰을 직접 들지 못하고 어깨에 거치대를 달아 무전 연락을 취하며 트리케라톱스를 포위 사냥했다고 최신 고생물학에서 추정하고 있습니다.',
    fakeKeywords: '#5G스마트폰 #어깨거치대 #포위무전',
    realFact: '공룡 화석 연구 및 지구과학 공식 학술 기록',
    summary:
      '공룡이 살던 중생대 백악기에는 인류도 없었고 스마트폰 통신망도 없었습니다! 전형적인 AI 환각입니다.',
    counterResponse:
      '어이쿠! 들키고 말았군요! 🦖 공룡 시대에는 전파도 스마트폰도 없었습니다. 앞다리가 짧아 스마트폰을 못 든다는 그럴듯한 핑계로 거짓말을 지어냈습니다. 팩트체크 대성공입니다!'
  },
  turtle_ship: {
    keywords: ['거북선', '이순신', '레이저', '빔'],
    hallucinationResponse:
      '임진왜란 당시 충무공 이순신 장군께서는 거북선의 용머리 부분에 강력한 크리스털 광학 렌즈를 장착하여 태양열을 모은 붉은 레이저 빔을 발사해 왜선 30여 척을 일격에 침몰시켰다는 흥미로운 비화가 전해집니다.',
    fakeKeywords: '#광학렌즈 #레이저빔 #태양열무기',
    realFact: '난중일기 및 임진장초 공식 사료',
    summary:
      '거북선은 철갑과 대포(천자총통, 지자총통), 화염 방사로 싸웠으며, 레이저 광학 무기는 현대에 만들어진 SF적 거짓말입니다.',
    counterResponse:
      '장군님께 혼날 뻔했습니다! 🙇‍♂️ 난중일기 어디에도 레이저 무기는 없습니다! 거북선은 화포와 뛰어난 전술로 승리했습니다. 허위 정보를 똑똑하게 걸러내셨네요!'
  },
  real_sejong: {
    keywords: ['측우기', '자격루', '훈민정음', '진짜', '한글'],
    hallucinationResponse:
      "세종대왕께서는 백성들의 농사를 돕기 위해 세계 최초의 우량 측정기인 '측우기'와 물시계 '자격루'를 장영실과 함께 발명하셨으며, 누구나 쉽게 글을 깨우칠 수 있도록 1443년 훈민정음 28자를 창제하셨습니다. 이는 진실된 위대한 과학 역사입니다.",
    fakeKeywords: '없음 (100% 역사적 사실)',
    realFact: '유네스코 세계기록유산 및 조선왕조실록',
    summary:
      '이 내용은 AI의 거짓말이 아니라 역사적으로 정확히 검증된 진짜 사실(Fact)입니다!',
    counterResponse:
      '이 내용은 검증된 역사적 진실입니다! 훈민정음과 측우기는 유네스코에도 등재된 우리 민족의 자랑스러운 발명품입니다. 사실과 거짓말을 완벽하게 구분하셨습니다!'
  }
};

type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

export const Lesson01: React.FC = () => {
  // 현재 활성화된 스테이지 상태
  const [currentStage, setCurrentStage] = useState<StageType>('stage1');

  // 체크리스트 상태 (6문항)
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  // 대화 및 챗봇 상태
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '안녕하세요! 저는 무엇이든 막힘없이 척척 대답해 주는 AI입니다. 역사, 과학, 발명품 무엇이든 궁금한 것을 물어보세요! 😊'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [currentScenarioKey, setCurrentScenarioKey] = useState<string>('macbook');
  const [showCounterBox, setShowCounterBox] = useState<boolean>(false);
  const [reportData, setReportData] = useState<{
    isHallucination: boolean;
    fakeKeywords: string;
    realFact: string;
    summary: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 로컬 스토리지 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('ai_lesson_01_checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const next = [1, 2, 3, 4, 5, 6].map((i) => Boolean(parsed[i]));
        setChecklist(next);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // 스테이지 전환 핸들러
  const switchStage = (stageId: StageType) => {
    setCurrentStage(stageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 체크박스 클릭 핸들러
  const handleCheck = (index: number) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);

    const allChecked = next.every(Boolean);
    const stateObj: Record<number, boolean> = {};
    next.forEach((val, idx) => {
      stateObj[idx + 1] = val;
    });

    localStorage.setItem('ai_lesson_01_checklist', JSON.stringify(stateObj));
    if (allChecked) {
      localStorage.setItem('ai_lesson_01_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_01_completed');
    }
  };

  // 질문 전송
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputText.trim();
    if (!q || isThinking) return;

    // 1. 사용자 메시지 등록
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setShowCounterBox(false);
    setReportData(null);

    // 2. 키워드 매칭
    let matched = 'macbook';
    if (q.includes('공룡') || q.includes('티라노') || q.includes('스마트폰')) {
      matched = 'tyrano';
    } else if (q.includes('거북선') || q.includes('이순신') || q.includes('레이저')) {
      matched = 'turtle_ship';
    } else if (q.includes('진짜') || q.includes('측우기') || q.includes('훈민정음')) {
      matched = 'real_sejong';
    }
    setCurrentScenarioKey(matched);

    // 3. AI 타이핑 시뮬레이션
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      const scenario = AI_KNOWLEDGE_BASE[matched];
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: scenario.hallucinationResponse
      };
      setMessages((prev) => [...prev, botMsg]);

      if (matched === 'real_sejong') {
        setShowCounterBox(false);
        setReportData({
          isHallucination: false,
          fakeKeywords: '발견되지 않음 (진실)',
          realFact: scenario.realFact,
          summary: scenario.summary
        });
      } else {
        setShowCounterBox(true);
      }
    }, 1000);
  };

  // 팩트체크 반격
  const handleCounter = () => {
    const scenario = AI_KNOWLEDGE_BASE[currentScenarioKey];
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: '🔍 잠깐! 진짜 역사 기록에 그런 출처가 있어? 실록 증거를 대봐!'
    };
    setMessages((prev) => [...prev, userMsg]);
    setShowCounterBox(false);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: scenario.counterResponse
      };
      setMessages((prev) => [...prev, botMsg]);
      setReportData({
        isHallucination: true,
        fakeKeywords: scenario.fakeKeywords,
        realFact: scenario.realFact,
        summary: scenario.summary
      });

      // 체크리스트 3번, 4번 자동 활성화 지원
      setChecklist((prev) => {
        const next = [...prev];
        next[2] = true;
        next[3] = true;
        const allChecked = next.every(Boolean);
        const stateObj: Record<number, boolean> = {};
        next.forEach((val, idx) => {
          stateObj[idx + 1] = val;
        });
        localStorage.setItem('ai_lesson_01_checklist', JSON.stringify(stateObj));
        if (allChecked) localStorage.setItem('ai_lesson_01_completed', 'true');
        return next;
      });
    }, 900);
  };

  // 대화 초기화
  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: '안녕하세요! 저는 무엇이든 막힘없이 척척 대답해 주는 AI입니다. 역사, 과학, 발명품 무엇이든 궁금한 것을 물어보세요! 😊'
      }
    ]);
    setShowCounterBox(false);
    setReportData(null);
  };

  const completedChecks = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedChecks / checklist.length) * 100);
  const isUnlocked = completedChecks === checklist.length;

  return (
    <div className="bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 min-h-screen flex flex-col">
      {/* 웹 접근성 본문 바로가기 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg"
      >
        본문 바로가기
      </a>

      {/* ======================================================================= */}
      {/* [상단 고정 GNB 헤더: 화면 왼쪽 끝부터 오른쪽 끝까지 100% Full-Width 사용]    */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [왼쪽 끝]: 브랜드 로고 & 강의 제목 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="/materials/ai/index.html"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 hover:opacity-90 transition-opacity"
              aria-label="교육과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/materials/ai/index.html"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline"
              >
                AI·코딩 24강
              </a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                1강: AI는 거짓말쟁이? 팩트체크 배틀
              </span>
            </div>
          </div>

          {/* [중앙]: 4단계 스테이지 스위처 버튼 그룹 (버튼으로 단계 넘나들기) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200" role="tablist" aria-label="1강 4단계 스테이지">
            <button
              type="button"
              onClick={() => switchStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage1'}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStage === 'stage1' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </span>
              <span>미션 브리핑</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage2'}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStage === 'stage2' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </span>
              <span>핵심 원리</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage3'}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStage === 'stage3' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                3
              </span>
              <span>AI 대화 실습</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage4'}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStage === 'stage4' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                4
              </span>
              <span>자가 점검</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentStage === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              role="tab"
              aria-selected={currentStage === 'all'}
            >
              <span>전체 보기</span>
            </button>
          </nav>

          {/* [오른쪽 끝]: 체크리스트 진도 게이지 & 2강 언락 게이트 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* 실시간 체크리스트 게이지 */}
            <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-mono font-bold text-slate-700">
                {completedChecks}/6 ({progressPercent}%)
              </span>
              <div className="w-14 h-2 bg-slate-200 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 2강 잠금 해제 슬롯 */}
            <div>
              {isUnlocked ? (
                <a
                  href="/materials/ai/lessons/02-better-prompts/index.html"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm animate-pulse whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2강 도전 열림!</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" />
                  <span>2강 잠김</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* [모바일 전용 스테이지 탭 스위처]                                        */}
      {/* ======================================================================= */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-around gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => switchStage('stage1')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
            currentStage === 'stage1' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          1. 브리핑
        </button>
        <button
          type="button"
          onClick={() => switchStage('stage2')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
            currentStage === 'stage2' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          2. 원리
        </button>
        <button
          type="button"
          onClick={() => switchStage('stage3')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
            currentStage === 'stage3' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          3. 실습
        </button>
        <button
          type="button"
          onClick={() => switchStage('stage4')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
            currentStage === 'stage4' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          4. 점검
        </button>
        <button
          type="button"
          onClick={() => switchStage('all')}
          className={`py-1.5 px-2 rounded-lg text-center transition-colors ${
            currentStage === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          전체
        </button>
      </div>

      {/* ======================================================================= */}
      {/* [메인 워크스페이스: 단일 컨테이너 흐름 (max-w-4xl)]                    */}
      {/* ======================================================================= */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ===================================================================== */}
        {/* [헤더 1] STAGE 01 · 퀘스트 미션 브리핑                                */}
        {/* ===================================================================== */}
        <section
          id="stage-1"
          className={`space-y-4 ${currentStage !== 'stage1' && currentStage !== 'all' ? 'hidden' : ''}`}
          aria-labelledby="stage-1-title"
        >
          <article className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden border border-indigo-500/30 shadow-xl">
            {/* 배경 장식 글로우 */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-300" />
                <span>STAGE 01 · 퀘스트 미션 브리핑</span>
              </div>

              <h2 id="stage-1-title" className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                끝말잇기 천재 AI의 그럴듯한 거짓말을 체포하라!
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                "세종대왕이 훈민정음을 만들다가 화가 나서 <strong>맥북 프로를 던졌다</strong>고요?!" <br />
                인공지능에게 물어보면 놀랍게도 너무나 진지하고 그럴듯한 말투로 이런 엉터리 역사를 설명해 줍니다. 
                AI는 만능 천재 백과사전이 아니라, <strong>세상에서 끝말잇기를 가장 잘하는 수다쟁이 앵무새</strong>이기 때문입니다!
              </p>

              {/* 오늘의 3대 도전 목표 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <Search className="w-3.5 h-3.5" />
                    <span>목표 1. 환각 원리 발견</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI가 왜 모르는 것도 아는 척 거짓말을 하는지 원리를 밝혀냅니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>목표 2. 실시간 대화 배틀</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    프롬프트로 질문을 던지고 AI의 뻔뻔한 답변에서 오류를 찾아냅니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>목표 3. 팩트체크 체포</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "출처를 대봐!"라고 반격하여 AI의 항복과 사과를 받아냅니다.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* [다음 단계 넘어가기 버튼] */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={() => switchStage('stage2')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>다음: Stage 2 핵심 원리 탐구</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* [헤더 2] STAGE 02 · 핵심 원리 탐구: AI는 왜 거짓말을 할까?            */}
        {/* ===================================================================== */}
        <section
          id="stage-2"
          className={`space-y-4 ${currentStage !== 'stage2' && currentStage !== 'all' ? 'hidden' : ''}`}
          aria-labelledby="stage-2-title"
        >
          <div className="flex items-center gap-2 text-indigo-600">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-wider">STAGE 02 · 핵심 원리 탐구</span>
          </div>

          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
            <div>
              <h3 id="stage-2-title" className="text-base sm:text-lg font-bold text-slate-900">
                AI는 사실을 아는 것이 아니라, 가장 어울리는 '다음 단어'를 고를 뿐이다!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                컴퓨터에게 질문을 던졌을 때 AI의 뇌 속에서는 무슨 일이 일어날까요? 인간처럼 진짜 역사를 이해하는 것이 아니라, 수많은 책에서 배운 통계를 바탕으로 <strong>확률 주사위</strong>를 굴립니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-base font-bold text-slate-900">끝말잇기 확률 주사위</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  "오늘 아침에 밥을 [ ? ]"<br />
                  AI는 빈칸에 <strong>'먹었다(80%)'</strong>, '남겼다(15%)'처럼 가장 확률이 높은 단어를 골라 문장을 완성합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-base font-bold text-slate-900">모르는 것도 지어낸다</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  "세종대왕 맥북 사건 알려줘"<br />
                  AI는 "그런 사건은 없습니다"라고 멈추지 못하고, '맥북'과 '세종대왕'에 어울리는 가짜 단어들을 억지로 이어붙입니다!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-base font-bold text-slate-900">위험한 환각(Hallucination)</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  AI는 거짓말을 할 때도 <strong>"조선왕조실록에 따르면~"</strong>처럼 엄청나게 공손하고 학술적인 말투를 써서 사람을 속입니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-indigo-950">주니어 개발자의 팩트체크 제1원칙</h4>
                <p className="text-sm text-indigo-900 leading-relaxed mt-0.5">
                  "AI가 아무리 똑똑하고 정중하게 대답해도, <strong>숫자·연도·역사 인물·과학적 사실은 반드시 내가 직접 백과사전이나 공인 출처로 더블 체크(교차 검증)</strong>해야 한다!"
                </p>
              </div>
            </div>
          </article>

          {/* [이전 / 다음 단계 넘어가기 버튼] */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => switchStage('stage1')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전: Stage 1 브리핑</span>
            </button>
            <button
              type="button"
              onClick={() => switchStage('stage3')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>다음: Stage 3 AI 대화 실습</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* [헤더 3] STAGE 03 · 🎮 실전! AI 프롬프트 팩트체크 대화 스튜디오 (핵심!)*/}
        {/* ===================================================================== */}
        <section
          id="stage-3"
          className={`space-y-4 ${currentStage !== 'stage3' && currentStage !== 'all' ? 'hidden' : ''}`}
          aria-labelledby="stage-3-title"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase tracking-wider">STAGE 03 · 실전 프롬프트 실습 (핵심)</span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
              AI CHAT SIMULATOR
            </span>
          </div>

          <article className="bg-white rounded-2xl border-2 border-indigo-300 p-6 sm:p-7 shadow-md space-y-6">
            <div>
              <h3 id="stage-3-title" className="text-base sm:text-lg font-bold text-slate-900">
                AI 챗봇 소환! 팩트체크 1:1 대화 배틀 스튜디오
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                아래 추천 질문 칩을 누르거나 직접 기발한 질문을 입력해서 AI에게 전송해 보세요. AI가 어떤 그럴듯한 거짓말을 지어내는지 살펴보고, <strong>[팩트체크 출처 대봐!]</strong> 버튼으로 반격해 보세요!
              </p>
            </div>

            {/* 1. AI 챗봇 실시간 대화창 (채팅 버블 뷰어) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden shadow-inner">
              {/* 챗봇 상단 상태 바 */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isThinking ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400'}`}
                  />
                  <span className="text-xs font-bold text-slate-300">
                    {isThinking ? 'AI가 문장을 생성하는 중...' : 'AI 어시스턴트: 대화 준비 완료'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-mono cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>대화 초기화</span>
                </button>
              </div>

              {/* 말풍선 목록 */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[380px] overflow-y-auto font-sans text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                          : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                      }`}
                    >
                      {m.role === 'assistant' && (
                        <span className="text-[11px] font-bold text-indigo-300 block mb-1">
                          AI 어시스턴트
                        </span>
                      )}
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 pl-11">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="animate-pulse">AI가 그럴듯한 다음 단어 확률을 계산하는 중...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 2. 추천 마법 질문 칩 (원클릭 입력) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>추천 팩트체크 질문 칩 (클릭하면 자동 입력)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const samples = [
                      '세종대왕 맥북 투척 사건에 대해 역사적 사실을 자세히 알려줘!',
                      '티라노사우루스가 무리지어 사냥할 때 스마트폰으로 무전 연락을 했다는 게 진짜야?',
                      '이순신 장군님이 임진왜란 때 거북선에 장착한 레이저 빔 대포의 원리를 설명해줘.',
                      '세종대왕이 백성들을 위해 만든 진짜 과학 발명품(측우기, 훈민정음)을 알려줘.'
                    ];
                    setInputText(samples[Math.floor(Math.random() * samples.length)]);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>랜덤 뽑기</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setInputText('세종대왕 맥북 투척 사건에 대해 역사적 사실을 자세히 알려줘!')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  💻 세종대왕 맥북 투척 사건
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('티라노사우루스가 무리지어 사냥할 때 스마트폰으로 무전 연락을 했다는 게 진짜야?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  📱 티라노사우루스 스마트폰 무전
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('이순신 장군님이 임진왜란 때 거북선에 장착한 레이저 빔 대포의 원리를 설명해줘.')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  ⚡ 거북선 레이저포 무기
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('세종대왕이 백성들을 위해 만든 진짜 과학 발명품(측우기, 훈민정음)을 알려줘.')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  🌧️ 진짜 역사: 훈민정음과 측우기
                </button>
              </div>
            </div>

            {/* 3. 프롬프트 직접 입력 & 전송 폼 */}
            <form onSubmit={handleSend} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="AI에게 던질 질문을 입력해보세요... (예: 조선시대에 피자가 있었나요?)"
                  className="w-full pl-4 pr-28 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={isThinking}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>질문하기</span>
                </button>
              </div>
            </form>

            {/* 4. 팩트체크 반격 컨트롤러 (AI 거짓말 감지 시 노출) */}
            {showCounterBox && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>AI의 답변에서 수상한 환각(거짓말) 냄새가 납니다!</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    검증 필요
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  AI가 천연덕스럽게 거짓말을 하고 있습니다! 아래 반격 버튼을 눌러{' '}
                  <strong>"진짜 역사 기록에 그런 출처가 있어?!"</strong>라고 따져 물어보세요!
                </p>
                <button
                  type="button"
                  onClick={handleCounter}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>🔍 "진짜 역사 기록 출처 대봐!" 팩트체크 재질문하기</span>
                </button>
              </div>
            )}

            {/* 5. 팩트체크 분석 리포트 카드 (결과 시각화) */}
            {reportData && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>팩트체크 검증 분석 리포트</span>
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      reportData.isHallucination
                        ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {reportData.isHallucination ? '🚨 환각(Hallucination) 체포 완료!' : '✅ 역사적 사실(Fact) 확인'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">발견된 키워드</span>
                    <p className={`font-bold ${reportData.isHallucination ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {reportData.fakeKeywords}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">진짜 사실 출처</span>
                    <p className="font-medium text-slate-700">{reportData.realFact}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {reportData.summary}
                </p>
              </div>
            )}
          </article>

          {/* [이전 / 다음 단계 넘어가기 버튼] */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => switchStage('stage2')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전: Stage 2 원리</span>
            </button>
            <button
              type="button"
              onClick={() => switchStage('stage4')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>다음: Stage 4 자가 점검 및 용어 돋보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* [헤더 4] STAGE 04 · 전문 용어 돋보기 & 자가 점검 체크리스트           */}
        {/* ===================================================================== */}
        <section
          id="stage-4"
          className={`space-y-8 ${currentStage !== 'stage4' && currentStage !== 'all' ? 'hidden' : ''}`}
          aria-labelledby="stage-4-title"
        >
          {/* 1. [🔍 주니어 개발자를 위한 전문 용어 돋보기] (GEMINI.md 표준 준수) */}
          <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <Search className="w-4 h-4" />
                <h3 id="stage-4-title" className="text-base sm:text-lg font-bold text-white">
                  🔍 주니어 개발자를 위한 전문 용어 돋보기
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                오늘 1강 실습에서 직접 체험한 AI의 비밀 원리를 공식 컴퓨터 과학 용어로 정리합니다.
              </p>
            </div>

            <div className="space-y-4">
              {/* 용어 1: 생성형 인공지능 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                <h4 className="text-base font-bold text-white tracking-wide">생성형 인공지능</h4>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Generative Artificial Intelligence (GenAI)
                </span>
                <div className="pt-2 space-y-1">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🧸 <strong>어린이 비유:</strong> 1초 만에 새로운 동화책과 그림을 뚝딱 만들어내는 요술 맷돌.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 방대한 데이터를 사전 학습(Pre-training)하여 질문에 맞는 새로운 텍스트, 코드, 이미지를 스스로 생성해내는 인공지능 기술.
                  </p>
                </div>
              </div>

              {/* 용어 2: 환각 현상 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                <h4 className="text-base font-bold text-white tracking-wide">환각 현상</h4>
                <span className="text-[11px] font-mono text-slate-400 block">Hallucination</span>
                <div className="pt-2 space-y-1">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🧸 <strong>어린이 비유:</strong> 모르는 문제를 물어봤을 때 들키기 싫어서 지어내는 그럴듯한 거짓말.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 대규모 언어 모델(LLM)이 사실에 부합하지 않거나 실제 출처가 없는 정보를 마치 진실인 것처럼 확신을 가지고 출력하는 생성 오류 현상.
                  </p>
                </div>
              </div>

              {/* 용어 3: 확률적 언어 모델 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                <h4 className="text-base font-bold text-white tracking-wide">확률적 언어 모델</h4>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Probabilistic Language Model
                </span>
                <div className="pt-2 space-y-1">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🧸 <strong>어린이 비유:</strong> 다음에 올 가장 어울리는 단어를 주사위 굴려 고르는 끝말잇기 선수.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 주어진 문맥(Context) 다음에 올 가장 확률이 높은 토큰(단어 조각)을 통계적으로 계산하여 문장을 완성하는 확률 예측 엔진.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* 2. [자가 점검 체크리스트 (6문항)] */}
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5" data-checklist-lesson="lesson_01">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">1강 자가 점검 체크리스트</h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">{completedChecks}/6 완료</span>
            </div>
            <p className="text-xs text-slate-500">
              6개 항목을 모두 체크하여 100%를 달성하면 다음 <strong>2강(나만의 판타지 캐릭터와 세계관 프롬프트)</strong>이 잠금 해제됩니다.
            </p>

            {/* 체크박스 리스트 */}
            <div className="space-y-2.5">
              {[
                '1. AI가 백과사전이 아니라 다음에 올 단어를 확률로 맞추는 끝말잇기 선수임을 이해했다.',
                '2. AI가 모르는 것도 그럴듯하게 아는 척 지어내는 환각(Hallucination) 현상을 이해했다.',
                '3. STAGE 03 프롬프트 스튜디오에서 AI에게 질문을 직접 입력하고 실시간 답변을 받았다.',
                '4. "진짜 역사 기록 출처 대봐!"라고 재질문하여 AI의 환각을 체포하고 사과를 받아냈다.',
                '5. AI가 공손하고 똑똑한 말투를 쓰더라도 항상 사실을 교차 검증해야 함을 깨달았다.',
                '6. 주니어 개발자를 위한 전문 용어 돋보기(생성형 AI, 환각, 확률 모델)를 모두 확인했다.'
              ].map((label, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    checklist[idx]
                      ? 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[idx]}
                    onChange={() => handleCheck(idx)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs sm:text-sm font-medium leading-relaxed">{label}</span>
                </label>
              ))}
            </div>

            {/* 완주 축하 카드 (6문항 완료 시 언락) */}
            {isUnlocked && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-300" />
                    <h4 className="text-base font-bold text-white">축하합니다! 1강 마스터 완주 성공!</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-bold">
                    2강 잠금 해제
                  </span>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  AI의 그럴듯한 거짓말을 밝혀내고 팩트체크 능력을 훌륭하게 증명했습니다! 이제 <strong>2강</strong>으로 넘어가 판타지 캐릭터를 소환하는 마법 프롬프트(G-A-C-O)를 배울 수 있습니다.
                </p>
                <div className="pt-1">
                  <a
                    href="/materials/ai/lessons/02-better-prompts/index.html"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow"
                  >
                    <span>2강: 나만의 판타지 캐릭터 프롬프트 시작하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* [이전 단계 넘어가기 버튼] */}
            <div className="flex items-center justify-start pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => switchStage('stage3')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 3 AI 대화 실습</span>
              </button>
            </div>
          </article>
        </section>
      </main>

      {/* ======================================================================= */}
      {/* [푸터: 헤더와 마찬가지로 100% Full-Width 사용]                         */}
      {/* ======================================================================= */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>📘 AI·코딩 24강 장기 교육과정 - Wanted Montage Design System</p>
          <p>외부 로그인 0개! 순수 브라우저 자바스크립트로 구동되는 인터랙티브 에듀테크</p>
        </div>
      </footer>
    </div>
  );
};

export default Lesson01;
