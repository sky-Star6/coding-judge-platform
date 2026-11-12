import React, { useState, useEffect } from 'react';
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
  Search,
  Bot,
  Lightbulb,
  Layers,
  Send,
  FileText,
  Code,
  ZoomIn,
  ShieldAlert,
  MessageSquare,
  Tag,
  Filter,
  BarChart2,
  Cpu,
  Scissors,
  Target,
  Calculator,
  Activity,
  Play
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

interface IntentRule {
  name: string;
  color: string;
  threshold: number;
  keywords: Record<string, number>;
  response: string;
}

const INTENT_RULES: Record<string, IntentRule> = {
  meal: {
    name: '급식 정보 조회 (Meal)',
    color: 'indigo',
    threshold: 40,
    keywords: {
      '급식': 50,
      '점심': 35,
      '메뉴': 30,
      '밥': 25,
      '식단': 30,
      '맛': 15,
      '배고파': 20,
      '돈까스': 25,
      '알레르기': 30
    },
    response: '오늘의 급식 메뉴는 [찰보리밥, 소고기미역국, 수제 치즈돈까스, 콩나물무침, 깍두기, 청포도 에이드]야! 맛있게 먹어! 🍱'
  },
  weather: {
    name: '날씨 & 우산 코디 (Weather)',
    color: 'sky',
    threshold: 40,
    keywords: {
      '날씨': 50,
      '비': 40,
      '우산': 35,
      '더워': 20,
      '추워': 20,
      '기온': 30,
      '눈': 30,
      '하늘': 15,
      '바람': 20
    },
    response: '오늘 오후에 전국적으로 흐리고 비가 올 확률이 80%야! 외출할 때 작은 접이식 우산을 꼭 챙겨가! ☔'
  },
  voca: {
    name: '영단어 학습 꿀팁 (Voca)',
    color: 'purple',
    threshold: 40,
    keywords: {
      '단어': 50,
      '영어': 35,
      '외우': 30,
      '꿀팁': 30,
      '암기': 35,
      '공부': 20,
      '퀴즈': 25,
      '시험': 20
    },
    response: '영단어 암기 꿀팁! 단어를 깜지처럼 무작정 쓰지 말고, [in(안으로) + vent(오다) = 발명하다]처럼 어원을 쪼개서 외우면 3배 오래 기억나! 🧠'
  },
  greeting: {
    name: '친절한 첫인사 (Greeting)',
    color: 'emerald',
    threshold: 30,
    keywords: {
      '안녕': 40,
      '반가워': 35,
      '하이': 30,
      'hello': 35,
      'hi': 30,
      '좋은아침': 40,
      '누구': 25
    },
    response: '반가워! 나는 브라우저에서 스스로 생각하는 로컬 AI 비서야. 급식, 날씨, 영단어 공부에 대해 무엇이든 물어봐줘! 🤖✨'
  }
};

const STOPWORDS = ['은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '좀', '해줘', '알려줘', '뭐야', '어때', '있어', '없어'];

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
    badge: '한국어 텍스트 정제 & 불용어 필터',
    level: '전처리 엔지니어링 ★★★',
    title: '사용자의 자연어 문장에서 특수기호, 이모지, 불필요한 조사(은/는/이/가)를 제거하는 JS 정제 함수 작성',
    desc: '사용자가 아무리 오타나 기호를 섞어 보내도 꿋꿋하게 순수 키워드만 쏙쏙 발라내는 자연어 전처리 정규식 엔진을 소환합니다.',
    prompt: `[역할]
너는 자연어 처리(NLP) 텍스트 전처리(Preprocessing) 전문 소프트웨어 엔지니어이자 코딩 멘토야.

[목표]
웹 브라우저에서 사용자가 입력한 자연어 문장에서 불필요한 기호와 조사를 걸러내고 순수 의미 키워드만 배열(Array)로 추출하는 cleanAndTokenize(sentence) 함수를 자바스크립트로 작성해 줘.

[세부 요구사항]
1. 정규표현식(RegEx)을 사용해 특수문자, 이모지, 연속된 공백을 깔끔하게 제거해 줘.
2. 한국어 조사(은, 는, 이, 가, 을, 를, 에, 에서, 으로)를 끝에서 분리하는 간단한 불용어(Stopwords) 필터 로직을 포함해 줘.
3. 빈 문자열이나 1글자짜리 무의미한 자음/모음은 결과 배열에서 제외해 줘.
4. "오늘 급식 메뉴가 뭐야?!"를 넣었을 때 ['오늘', '급식', '메뉴']가 반환되는 실행 예시를 보여줘.
5. 초보자도 쉽게 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '사람들의 문장에서 노이즈를 걷어내고 순수 핵심 토큰만 쏙쏙 발라내는 정제기를 완성합니다!',
    csSecret: '최신 거대 언어 모델(LLM)이라도 전체 학습 및 추론 시간의 70% 이상이 쓰레기 데이터(Garbage Data)를 걸러내고 토큰화하는 데이터 전처리(Data Cleaning)에 투입됩니다.'
  },
  {
    id: 'quest-02',
    badge: '가중치 기반 인텐트 분류기',
    level: '로컬 추론 알고리즘 ★★★',
    title: '키워드 사전의 가중치 점수를 합산하여 가장 확률이 높은 의도(Intent)를 판별하는 Scoring 함수 구현',
    desc: '단순히 한 단어만 보고 답하지 않고, 문장 속 여러 키워드의 중요도를 수학적으로 계산하여 1등 의도를 골라내는 지능형 점수 판정 알고리즘을 작성합니다.',
    prompt: `[역할]
너는 가벼운 규칙 기반 인공지능(Rule-Based AI)과 분류 알고리즘을 설계하는 머신러닝 엔지니어야.

[목표]
추출된 키워드 배열과 의도별 키워드 사전(Intent Dictionary)을 비교하여, 각 의도별 매칭 점수를 계산하고 가장 점수가 높은 Best Intent를 반환하는 classifyIntent(tokens, intentRules) 함수를 작성해 줘.

[세부 요구사항]
1. intentRules 객체는 { meal: { keywords: { '급식': 50, '점심': 30, '메뉴': 20 } }, weather: { ... } } 구조로 가중치를 차등 부여해 줘.
2. 토큰 목록을 순회하며 매칭되는 키워드의 점수를 누적 합산(Score Accumulation)해 줘.
3. 1등 의도의 이름, 총점, 신뢰도(Confidence 백분율)를 객체로 반환해 줘.
4. 모든 점수가 0점일 때는 'unknown' 인텐트를 반환하도록 예외 처리를 해 줘.
5. 모든 코드에 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '여러 키워드의 점수를 공정하게 합산하여 가장 확률 높은 답변을 스스로 찾아냅니다!',
    csSecret: '구글 검색 엔진의 초기 알고리즘과 질의 분류 시스템 역시 단어의 출현 빈도와 희소성을 가중치로 계산하는 TF-IDF 및 벡터 스페이스 모델(Vector Space Model)에서 출발했습니다.'
  },
  {
    id: 'quest-03',
    badge: '신뢰도 임계값 & 동적 폴백 핸들러',
    level: '안전성 아키텍처 ★★★',
    title: '신뢰도가 기준치 미만일 때 엉뚱한 답변을 차단하고 추천 질문 칩으로 되돌리는 Dynamic Fallback 설계',
    desc: '확신 점수가 낮을 때 아는 척하며 거짓말을 지어내지 않고, 사용자의 문장 길이에 따라 센스 있게 되묻는 스마트 안전망을 구축합니다.',
    prompt: `[역할]
너는 대화형 시스템의 안전성(Safety)과 사용자 경험(UX)을 전담하는 대화 설계자(Conversation Designer)야.

[목표]
챗봇 엔진의 추론 신뢰도(Confidence Score)가 기준 임계값(예: 40점)보다 낮을 때, 기계적인 에러 대신 사용자가 다시 올바른 질문을 하도록 유도하는 handleFallback(score, rawText) 함수를 작성해 줘.

[세부 요구사항]
1. 사용자가 입력한 문장 길이에 따라 다른 3단계 폴백 메시지(너무 짧음, 오타 추정, 범위 외 질문)를 작성해 줘.
2. 챗봇이 알고 있는 대표 질문 3가지(오늘 급식, 아침 날씨, 단어 퀴즈)를 추천 버튼 칩 형태로 함께 반환해 줘.
3. 왜 챗봇이 모르는 것을 아는 척하는 환각(Hallucination)보다 솔직한 폴백이 훨씬 더 우수한 UX인지 설명해 줘.
4. 모든 코드에 초보자를 위한 상세한 주석을 달아줘.`,
    reaction: '모르는 질문이나 엉뚱한 입력에도 당황하지 않고 친절하게 다시 대화를 이끄는 안전망을 확립합니다!',
    csSecret: '자율주행 자동차나 의료 인공지능에서도 시스템의 확신도(Confidence)가 기준치 이하로 떨어지면 즉시 인간 운전자에게 제어권을 넘기거나 안전 정지(Fail-Safe)를 실행하도록 안전 규정이 강제되어 있습니다.'
  },
  {
    id: 'quest-04',
    badge: '오타 및 유사어 거리 알고리즘',
    level: '문자열 알고리즘 ★★★',
    title: '"급식" 대신 "급식ㅇ"이나 "급식은"으로 잘못 쳤을 때도 찰떡같이 알아듣는 레벤슈타인 편집 거리 알고리즘',
    desc: '글자가 완벽히 똑같지 않아도 삽입, 삭제, 교체 횟수를 계산해 유사도를 매기는 컴퓨터 과학의 고전 명작 알고리즘을 장착합니다.',
    prompt: `[역할]
너는 텍스트 검색 엔진과 철자 교정(Spell Checker)을 개발하는 컴퓨터 과학 연구원이야.

[목표]
사용자가 한두 글자 오타를 내더라도 사전의 정답 키워드와 얼마나 닮았는지 0~1 사이의 유사도로 측정하는 calculateSimilarity(word1, word2) 함수를 자바스크립트로 구현해 줘.

[세부 요구사항]
1. 두 문자열 간의 삽입, 삭제, 교체 최소 횟수를 구하는 레벤슈타인 거리(Levenshtein Distance) 알고리즘을 적용해 줘.
2. 계산된 거리를 바탕으로 0(전혀 다름)부터 1(100% 일치) 사이의 정규화된 유사도 점수를 반환해 줘.
3. "급식"과 "급식ㅇ", "메뉴"와 "메유"를 넣었을 때 유사도가 0.6 이상 나와 오타를 자동 보정하는 예시를 보여줘.
4. 알고리즘의 원리를 초등학생도 이해할 수 있는 동적 계획법(DP) 표 비유로 쉽게 설명해 줘.
5. 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '오타가 섞여 있어도 찰떡같이 올바른 키워드를 찾아내는 마법 유사도 알고리즘을 소환합니다!',
    csSecret: '스마트폰 키보드의 오타 자동 완성, 구글 검색창의 "이것을 찾으셨나요?", 그리고 생물학에서 DNA 돌연변이 염기서열 비교 분석 모두 이 레벤슈타인 거리(동적 계획법) 알고리즘을 동일하게 사용합니다.'
  },
  {
    id: 'quest-05',
    badge: '로컬스토리지 지식 베이스 확장 모듈',
    level: '지능형 데이터 관리 ★★★',
    title: '사용자가 대화 중에 새로운 단어와 질문-답변 규칙을 가르치면 영구 저장되는 Knowledge Base 확장 매니저',
    desc: '개발자가 코드를 고치지 않아도 사용자와 대화하며 스스로 지식을 넓혀가는 지속 학습(Continual Learning) 데이터 매니저를 구현합니다.',
    prompt: `[역할]
너는 브라우저 클라이언트 사이드 데이터 영속성(Persistence)과 온디바이스 지식 관리 시스템 전문가야.

[목표]
사용자가 "A라고 물어보면 B라고 대답해"라고 새로운 규칙을 가르치면, 이를 기존 키워드 사전에 추가하고 브라우저 localStorage에 영구 보관하는 ChatbotKnowledgeManager 클래스를 작성해 줘.

[세부 요구사항]
1. learnNewRule(keyword, intentName, answer, weight) 메서드를 작성해 줘.
2. saveToStorage(), loadFromStorage(), resetToDefault() 메서드로 브라우저 재방문 시에도 학습 데이터가 유지되게 해 줘.
3. 악의적이거나 비정상적인 데이터가 저장되지 않도록 XSS 방어 및 빈 값 검증을 철저히 해 줘.
4. 브라우저 로컬 저장 공간(5MB)만으로도 수천 개의 챗봇 문답 규칙을 충분히 저장할 수 있는 데이터 압축 팁을 설명해 줘.
5. 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '대화를 나눌수록 스스로 똑똑해지는 영구 저장형 지식 베이스를 구축합니다!',
    csSecret: '인공지능이 새로운 지식을 배울 때 과거 지식을 까먹는 현상을 "파괴적 망각(Catastrophic Forgetting)"이라고 부릅니다. 규칙 기반 지식 베이스는 과거의 소중한 규칙을 100% 안전하게 보존하면서 새 규칙을 끝없이 덧붙일 수 있는 강력한 장점이 있습니다.'
  }
];

export const Lesson20: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  
  // 시뮬레이터 입력 및 추론 상태
  const [userInput, setUserInput] = useState('오늘 점심 급식 메뉴 뭐야?');
  const [tokens, setTokens] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bestIntent, setBestIntent] = useState<string>('meal');
  const [confidence, setConfidence] = useState<number>(0);
  const [isConfident, setIsConfident] = useState<boolean>(true);

  // 복사 피드백
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 체크리스트 상태
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);

  const cleanAndTokenize = (text: string): string[] => {
    if (!text) return [];
    const cleaned = text.replace(/[^가-힣a-zA-Z0-9\s]/g, ' ').toLowerCase();
    const rawWords = cleaned.split(/\s+/).filter(w => w.trim().length > 0);
    const result: string[] = [];
    rawWords.forEach(word => {
      let stripped = word;
      for (const stop of STOPWORDS) {
        if (stripped.length > stop.length && stripped.endsWith(stop)) {
          stripped = stripped.slice(0, -stop.length);
          break;
        }
      }
      if (stripped.length >= 1) {
        result.push(stripped);
      }
    });
    return result;
  };

  const executeInference = (inputText?: string) => {
    const text = (inputText !== undefined ? inputText : userInput).trim();
    if (!text) return;

    const extractedTokens = cleanAndTokenize(text);
    setTokens(extractedTokens);

    const calcScores: Record<string, number> = {};
    let topIntent = 'unknown';
    let maxScore = 0;

    Object.keys(INTENT_RULES).forEach(intentKey => {
      const rule = INTENT_RULES[intentKey];
      let total = 0;
      extractedTokens.forEach(tok => {
        if (rule.keywords[tok]) {
          total += rule.keywords[tok];
        }
      });
      calcScores[intentKey] = total;
      if (total > maxScore) {
        maxScore = total;
        topIntent = intentKey;
      }
    });

    const conf = Math.min(100, Math.round((maxScore / 80) * 100));
    setScores(calcScores);
    setBestIntent(topIntent);
    setConfidence(conf);
    setIsConfident(maxScore >= 35);
  };

  useEffect(() => {
    executeInference('오늘 점심 급식 메뉴 뭐야?');
    try {
      const saved = localStorage.getItem('ai_lesson_20_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setCheckedItems(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleToggleCheck = (index: number) => {
    const newItems = [...checkedItems];
    newItems[index] = !newItems[index];
    setCheckedItems(newItems);
    localStorage.setItem('ai_lesson_20_checklist', JSON.stringify(newItems));
    if (newItems.every(Boolean)) {
      localStorage.setItem('ai_lesson_20_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_20_completed');
    }
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* ===================================================================== */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃)                   */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-indigo-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">시즌 4 · 20강: 챗봇에게 두뇌를 선물하자! 키워드 분석과 로컬 AI 추론 엔진 만들기</span>
              </div>
            </div>
          </div>

          {/* [우측]: 4단계 스테이지 스위처 버튼 그룹 (20px 원형 배지) */}
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
              <span>추론 엔진 랩</span>
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
          2. 추론 랩
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

      {/* ===================================================================== */}
      {/* 2. 메인 워크스페이스 (단일 컨테이너 몰입형 레이아웃)                   */}
      {/* ===================================================================== */}
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
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>시즌 4 로컬 AI 코어 트랙 · 순수 브라우저 지능형 엔진</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    키워드 분석 &amp; 로컬 추론
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    챗봇에게 두뇌를 선물하자!<br className="hidden sm:inline" />
                    키워드 분석과 로컬 AI 추론 엔진 만들기
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    외부 유료 API나 복잡한 열쇠(API Key) 발급 없이, 100% 브라우저 순수 자바스크립트로 동작하는 챗봇의 지능형 두뇌를 만듭니다! 사람이 입력한 문장에서 불필요한 단어를 털어내고, 핵심 키워드의 가중치 점수를 합산해 질문의 의도(Intent)를 스스로 알아맞히는 진짜 로컬 추론 엔진을 구축합니다.
                  </p>
                </div>

                {/* 3대 도전 미션 목표 (3열 카드, 소요 시간 배제) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <Filter className="w-4 h-4" />
                      <span>1. 텍스트 정제 &amp; 토큰화</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      문장에서 특수기호와 불필요한 조사를 털어내고 핵심 단어만 쏙쏙 추출합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <BarChart2 className="w-4 h-4" />
                      <span>2. 가중치 기반 인텐트 판별</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      여러 키워드의 중요도 점수를 합산하여 질문의 진짜 의도(Intent)를 계산합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4" />
                      <span>3. 신뢰도 &amp; 동적 폴백 방어</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      확신이 부족할 때 엉뚱한 거짓말 대신 재치 있게 되묻는 안전망을 설계합니다.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 핵심 개념 원리 탐구 카드 (3구 그리드) */}
            <section className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>CORE PRINCIPLES</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  로컬 AI 추론 엔진의 3대 핵심 원리
                </h3>
                <p className="text-sm text-slate-500 font-normal">
                  거대 언어 모델(LLM)의 복잡한 수학 뒤에 숨겨진, 자연어 이해의 기초 알고리즘을 체득합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">원리 01</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">1. 텍스트 정제 &amp; 토큰화</h4>
                      <span className="text-sm font-mono text-slate-400 block">Text Normalization</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      컴퓨터는 긴 문장을 통째로 이해하지 못하므로, 특수문자를 없애고 의미 단위(토큰)로 쪼개는 청소 작업을 먼저 거칩니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm text-indigo-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "쌀을 씻기 전에 돌과 지푸라기를 먼저 쏙쏙 골라내고 맑은 쌀알만 남기는 쌀 일기!"
                    </p>
                  </div>
                </article>

                {/* 2 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-purple-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-purple-50 text-purple-700">원리 02</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">2. 가중치 점수 합산</h4>
                      <span className="text-sm font-mono text-slate-400 block">Weighted Intent Scoring</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      '오늘', '날씨', '우산' 같은 단어마다 중요도 점수(가중치)를 매겨, 총점이 가장 높은 답변을 지능적으로 선택합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-sm text-purple-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-purple-800">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "스무고개 퀴즈를 풀 때 결정적 힌트 카드가 나오면 정답 상자에 별 스티커를 잔뜩 붙이는 점수판!"
                    </p>
                  </div>
                </article>

                {/* 3 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">원리 03</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">3. 신뢰도 &amp; 폴백 안전망</h4>
                      <span className="text-sm font-mono text-slate-400 block">Confidence &amp; Fallback</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      최고 점수가 기준치(임계값)를 넘지 못하면 억지로 답하지 않고, 정중히 다시 묻는 지능형 예외 방어를 실행합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-sm text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>어린이 눈높이 비유</span>
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "시험 문제에서 모르는 단어가 나왔을 때 엉뚱한 답을 쓰지 않고 선생님께 조용히 손들고 여쭤보는 정직한 행동!"
                    </p>
                  </div>
                </article>

              </div>
            </section>

            {/* 주니어 개발자 제1원칙 */}
            <aside className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-700/60 shadow-md flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-base font-bold text-white block">주니어 개발자의 제1원칙: 예측 가능하고 안전한 규칙이 똑똑한 AI의 가장 튼튼한 뼈대다!</strong>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  수십억 개의 파라미터를 가진 거대 AI 모델이라도 기본 규칙과 가드레일이 없으면 엉뚱한 거짓말(환각)을 쏟아냅니다. 키워드 분석과 가중치 스코어링 같은 <strong>로컬 규칙 기반 엔진을 스스로 만들 수 있는 개발자만이 외부 AI도 가장 안전하고 정밀하게 다룰 수 있습니다.</strong>
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
                  <span>다음 단계: Stage 2 추론 엔진 랩 &amp; 시뮬레이터</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 로컬 AI 추론 엔진 실험실                    */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    나만의 로컬 AI 추론 엔진 랩 &amp; 실시간 뇌파 시각화
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  내가 입력한 문장이 어떻게 정제되고, 어떤 키워드가 점수를 받아 최종 답변으로 이어지는지 AI 두뇌의 생각 과정을 0.1초 단위로 투명하게 들여다보세요.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* 추천 질문 칩 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>원클릭 문장 테스트 칩</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserInput('오늘 점심 급식 메뉴 뭐야?');
                      executeInference('오늘 점심 급식 메뉴 뭐야?');
                    }}
                    className="p-3 rounded-2xl border text-left transition-all bg-indigo-50/60 border-indigo-200 text-indigo-800 hover:bg-indigo-100/70 cursor-pointer"
                  >
                    <div className="text-sm font-bold">🍱 오늘 급식 메뉴 뭐야?</div>
                    <span className="text-xs text-indigo-600 block mt-1">급식 Intent 테스트</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserInput('비 올 거 같은데 우산 챙길까?');
                      executeInference('비 올 거 같은데 우산 챙길까?');
                    }}
                    className="p-3 rounded-2xl border text-left transition-all bg-sky-50/60 border-sky-200 text-sky-800 hover:bg-sky-100/70 cursor-pointer"
                  >
                    <div className="text-sm font-bold">☔ 비 올 거 같은데 우산 챙길까?</div>
                    <span className="text-xs text-sky-600 block mt-1">날씨 Intent 테스트</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserInput('영단어 외우는 꿀팁 좀 알려줘');
                      executeInference('영단어 외우는 꿀팁 좀 알려줘');
                    }}
                    className="p-3 rounded-2xl border text-left transition-all bg-purple-50/60 border-purple-200 text-purple-800 hover:bg-purple-100/70 cursor-pointer"
                  >
                    <div className="text-sm font-bold">📚 영단어 외우는 꿀팁 알려줘</div>
                    <span className="text-xs text-purple-600 block mt-1">단어공부 Intent 테스트</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserInput('크크루삥뽕 샬라샬라 외계어');
                      executeInference('크크루삥뽕 샬라샬라 외계어');
                    }}
                    className="p-3 rounded-2xl border text-left transition-all bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100/70 cursor-pointer"
                  >
                    <div className="text-sm font-bold">🛸 샬라샬라 외계어 장난</div>
                    <span className="text-xs text-amber-600 block mt-1">폴백(Fallback) 방어 테스트</span>
                  </button>
                </div>
              </div>

              {/* 입력 컨트롤러 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>사용자 입력 문장 (직접 타이핑 가능)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') executeInference(); }}
                    placeholder="예: 오늘 비 올까? 우산 챙길까?"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800 bg-slate-50 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => executeInference()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Play className="w-4 h-4" />
                    <span>추론 실행</span>
                  </button>
                </div>
              </div>

              {/* 4단계 추론 파이프라인 */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>실시간 AI 두뇌 추론 4단계 파이프라인</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">PURE JAVASCRIPT INFERENCE ENGINE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1단계 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">STEP 1</span>
                      <span className="text-xs text-slate-500 font-medium">텍스트 정제 &amp; 불용어 분리</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 block">정제된 토큰(Tokens) 목록:</span>
                      <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                        {tokens.length === 0 ? (
                          <span className="text-xs text-rose-500 font-medium">유효 키워드 없음 (모두 기호/공백)</span>
                        ) : (
                          tokens.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">
                              # {t}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2단계 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">STEP 2</span>
                      <span className="text-xs text-slate-500 font-medium">최고 득점 의도 &amp; 신뢰도</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isConfident ? 'text-indigo-700' : 'text-amber-600'}`}>
                          {isConfident && INTENT_RULES[bestIntent] ? INTENT_RULES[bestIntent].name : '식별 불가 (신뢰도 미달)'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isConfident ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {confidence}% 확신
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isConfident ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'
                          }`}
                          style={{ width: `${confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3단계 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">STEP 3</span>
                    <span className="text-xs text-slate-500 font-medium">의도별 가중치 스코어보드 (Threshold: 40점)</span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    {Object.keys(INTENT_RULES).map(k => {
                      const rule = INTENT_RULES[k];
                      const score = scores[k] || 0;
                      const isWinner = (k === bestIntent && score > 0);
                      const barWidth = Math.min(100, (score / 80) * 100);
                      return (
                        <div key={k} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className={isWinner ? 'font-bold text-indigo-700' : 'text-slate-600'}>
                              {rule.name}
                            </span>
                            <span className={`font-mono font-bold ${isWinner ? 'text-indigo-700' : 'text-slate-500'}`}>
                              {score}점
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isWinner ? 'bg-indigo-600' : 'bg-slate-400'}`}
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4단계 */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span>STEP 4 최종 챗봇 응답</span>
                    </span>
                    <span className={`text-xs font-bold ${isConfident ? 'text-indigo-700' : 'text-amber-700'}`}>
                      {isConfident ? '✅ 의도 판별 성공' : '⚠️ 신뢰도 임계값 미달: 폴백(Fallback) 방어 발동!'}
                    </span>
                  </div>
                  <div className={`text-sm leading-relaxed font-medium p-3 rounded-xl border shadow-2xs ${
                    isConfident
                      ? 'bg-white text-slate-800 border-indigo-200/80'
                      : 'bg-amber-50/70 text-slate-800 border-amber-200'
                  }`}>
                    {isConfident && INTENT_RULES[bestIntent] ? (
                      INTENT_RULES[bestIntent].response
                    ) : (
                      <>
                        <span className="text-amber-700 font-bold block mb-1">🤖 "무슨 말인지 정확히 이해하지 못했어요!"</span>
                        <span>현재 엔진의 신뢰도가 {confidence}%로 임계치(40점)보다 낮습니다. 혹시 <strong>'오늘 급식'</strong>이나 <strong>'비 올까'</strong>, <strong>'단어 암기'</strong>에 대해 물어보셨나요?</span>
                      </>
                    )}
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
                    실전 최신 AI 5대 킬러 퀘스트
                  </h3>
                </div>
                <p className="text-sm text-slate-500 font-normal">
                  외부 ChatGPT나 Gemini 창을 옆에 띄우고 아래 정밀 설계된 5대 프롬프트를 원클릭으로 복사하여 로컬 자바스크립트 추론 엔진 코드를 직접 소환하고 테스트해 보세요.
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
                  <span>이전: Stage 2 추론 엔진 랩</span>
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
                  오늘 배운 로컬 AI 엔진의 컴퓨터 과학 원리를 전문 용어로 복습하고, 6개 항목을 스스로 점검하여 21강(알파 빌드)을 언락해 보세요!
                </p>
              </div>
            </div>

            {/* 1. 전문 용어 돋보기 */}
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
                    <strong className="text-base font-bold text-indigo-300 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-indigo-400" />
                      <span>1. 자연어 전처리</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Text Preprocessing &amp; Normalization</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200">
                    <strong>🧸 어린이 비유:</strong> "요리하기 전에 흙 묻은 감자를 깨끗이 씻고 껍질을 깎아 요리하기 좋게 다듬는 일!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 사람의 일상 언어(자연어)를 컴퓨터 알고리즘이 분석하기 쉽도록 특수문자 제거, 대소문자 통일, 불용어 필터링 등을 거쳐 정형화된 데이터로 정제하는 단계입니다.
                  </p>
                </div>

                {/* 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-purple-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>2. 토큰화</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Tokenization</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
                    <strong>🧸 어린이 비유:</strong> "긴 기차를 칸칸이 분리해서 어떤 화물이 실렸는지 하나씩 살펴보는 일!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 연속된 텍스트 문자열을 의미를 가진 최소 단위인 토큰(Token, 단어·형태소·서브워드)으로 분할하여 배열 형태로 구조화하는 자연어 처리의 필수 기초 단계입니다.
                  </p>
                </div>

                {/* 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-sky-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-sky-400" />
                      <span>3. 의도 분류</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Intent Classification</span>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm text-sky-200">
                    <strong>🧸 어린이 비유:</strong> "우체부 아저씨가 편지 봉투 주소를 보고 '이건 서울행, 저건 부산행'으로 분류 상자에 착착 나누는 일!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 사용자가 입력한 자연어 문장이 전달하고자 하는 궁극적인 목적이나 요구(급식 조회, 날씨 문의, 잡담 등)를 사전에 정의된 의도 범주(Intent) 중 하나로 매핑하는 분류 기술입니다.
                  </p>
                </div>

                {/* 4 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>4. 신뢰도 점수 &amp; 임계값</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Confidence Score &amp; Threshold</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
                    <strong>🧸 어린이 비유:</strong> "범인을 지목할 때 '이 사람이 90% 확실해요!'라는 확신의 점수와, 50점 미만이면 함부로 말하지 않는 안전선!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 알고리즘이 도출한 예측 결과에 대한 수학적 확신도를 나타내는 지표이며, 임계값(Threshold) 미만일 경우 오류 확산을 막기 위해 안전 대응(Fallback)을 발동시키는 기준선입니다.
                  </p>
                </div>

                {/* 5 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="space-y-0.5">
                    <strong className="text-base font-bold text-rose-300 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-rose-400" />
                      <span>5. 규칙 기반 추론 엔진</span>
                    </strong>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Rule-Based Inference Engine</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200">
                    <strong>🧸 어린이 비유:</strong> "신호등의 빨간 불, 노란 불, 초록 불에 따라 차가 어떻게 움직여야 하는지 한 치의 오차도 없이 적어둔 규칙 책!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal pl-1">
                    <strong>🎓 개발자 공식 정의:</strong> 사전에 설계된 지식 베이스(IF-THEN 조건, 키워드 가중치, 패턴 매칭)를 바탕으로 입력 데이터를 연역적으로 추론하여 한 치의 오차 없이 투명하고 설명 가능한 응답을 생성하는 시스템입니다.
                  </p>
                </div>

              </div>
            </article>

            {/* 2. 자가 점검 체크리스트 */}
            <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-emerald-600" />
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      20강 완주 자가 점검 체크리스트
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 font-normal">
                    배운 내용을 확인하고 6개 항목을 모두 완료하면 다음 21강(알파 빌드)이 열립니다.
                  </p>
                </div>
                <div className={`px-3.5 py-1.5 rounded-full font-bold text-sm shrink-0 self-start sm:self-auto ${
                  completedCount === 6
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {completedCount} / 6 완료
                </div>
              </div>

              {/* 실시간 게이지 바 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600">체크리스트 달성률</span>
                  <span className="text-emerald-600 font-mono font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* 6개 체크박스 */}
              <div className="space-y-3 pt-2">
                
                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[0]}
                    onChange={() => handleToggleCheck(0)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      텍스트 정제와 특수기호·불용어 분리 원리 체득
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      사람이 입력한 자연어 문장에서 불필요한 기호를 제거하고 키워드만 추출했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[1]}
                    onChange={() => handleToggleCheck(1)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      단어 토큰화(Tokenization)와 배열 분할 이해
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      긴 문자열을 의미 단위의 단어로 쪼개어 컴퓨터가 다루기 쉬운 토큰 배열로 변환했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[2]}
                    onChange={() => handleToggleCheck(2)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      가중치 기반 의도(Intent) 점수 합산 알고리즘 이해
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      키워드마다 차등 점수를 부여하여 가장 총점이 높은 최적의 의도를 선별했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[3]}
                    onChange={() => handleToggleCheck(3)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      신뢰도(Confidence)와 동적 폴백(Fallback) 안전망 설계
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      확신이 부족한 엉뚱한 입력에 당황하지 않고 지능적으로 되묻는 방어벽을 구축했습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[4]}
                    onChange={() => handleToggleCheck(4)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      레벤슈타인 편집 거리 기반 오타 보정 개념 체득
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      한두 글자 오타가 나더라도 유사도를 측정해 올바른 단어를 찾아내는 원리를 배웠습니다.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[5]}
                    onChange={() => handleToggleCheck(5)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <strong className="text-sm font-bold text-slate-900 block">
                      21강 알파 빌드(실시간 대화 완성)를 위한 추론 엔진 준비 완료
                    </strong>
                    <span className="text-sm text-slate-500 leading-relaxed block font-normal">
                      챗봇의 뇌 역할을 할 로컬 추론 엔진을 완성하고 21강 첫 대화 버전을 만들 준비를 마쳤습니다.
                    </span>
                  </div>
                </label>

              </div>

              {/* 100% 완주 축하 및 21강 언락 카드 */}
              {completedCount === 6 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-indigo-500/50 shadow-2xl space-y-5 animate-pulse">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
                        🧠
                      </div>
                      <div>
                        <strong className="text-lg font-black text-white block">
                          20강 로컬 AI 추론 엔진 마스터 수료!
                        </strong>
                        <span className="text-sm font-mono text-indigo-300 font-bold">STAGE 20 CLEARED · INFERENCE ENGINE MASTER</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      추론 완료 ★★★★★
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-1">
                    <h5 className="text-base font-bold text-indigo-200">
                      축하합니다! 챗봇에게 스스로 생각하는 로컬 AI 두뇌를 선물하셨습니다!
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      텍스트 정제, 키워드 토큰화, 가중치 인텐트 판별, 그리고 신뢰도 폴백 안전망까지 완벽히 마스터했습니다. 이제 다음 21강에서 챗봇의 첫 심장 박동(알파 빌드)을 울리며 진짜 살아있는 대화를 나눌 수 있습니다!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-sm text-indigo-300 font-semibold block">다음 21강: 챗봇의 첫 심장 박동!</span>
                      <p className="text-sm text-white font-bold">21강: AI와 대화가 오가는 첫 버전 완성 (알파 빌드)</p>
                    </div>
                    <a
                      href="../21-chatbot-alpha/index.html"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>21강으로 즉시 이동하기</span>
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

      {/* ===================================================================== */}
      {/* 3. 푸터 영역 (글로벌 표준 푸터)                                       */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="font-medium">AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span className="truncate">시즌 4 · 20강: 챗봇 로컬 AI 추론 엔진</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap shrink-0">
            <a href="../../index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="../19-ai-inventor/index.html" className="hover:text-slate-900 transition-colors">19강 바로가기</a>
            <a href="../21-chatbot-alpha/index.html" className="hover:text-slate-900 transition-colors">21강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson20;
