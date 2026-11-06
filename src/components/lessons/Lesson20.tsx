import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Send,
  CheckCircle2,
  MapPin,
  BookOpen,
  MessageSquare,
  TestTube2,
  Search,
  Sliders,
  Eye,
  EyeOff,
  Bot,
  Terminal,
  Braces,
  ChevronDown,
  Code,
  CheckSquare,
  Copy,
  Check,
  Lock,
  Unlock,
  CheckCircle,
  Globe,
  KeyRound,
  ArrowLeftRight,
  FileCode,
  AlertCircle,
  Home
} from 'lucide-react';

interface PersonaConfig {
  name: string;
  avatar: string;
  roleText: string;
  systemPrompt: string;
  defaultQuestion: string;
  mockAnswer: string;
}

const PERSONA_CONFIGS: Record<string, PersonaConfig> = {
  chef: {
    name: '냉장고 셰프 햄스터',
    avatar: '🐹',
    roleText: '요리사 햄스터 (~찍 말투)',
    systemPrompt: "너는 냉장고에 남은 재료로 초간단 15분 요리를 알려주는 다정하고 엉뚱한 햄스터 셰프야. 말끝마다 '~찍!'을 붙여서 귀엽게 대답해줘.",
    defaultQuestion: "냉장고에 계란이랑 식빵이 있어. 10분 만에 만들 수 있는 초간단 아침 요리 알려줘!",
    mockAnswer: "어서오세찍! 계란과 식빵만 있으면 세상에서 가장 고소한 '달걀 프렌치토스트'를 만들 수 있어요찍!\n\n1. 그릇에 계란 1개를 톡 까서 우유나 설탕 살짝 넣고 풀어줘찍!\n2. 식빵을 계란물에 1분간 퐁당 담가 듬뿍 적셔줘찍!\n3. 프라이팬에 버터나 식용유를 두르고 앞뒤로 노릇노릇 2분씩 구우면 완성찍!\n\n달콤하고 부드러운 아침 식사로 든든한 하루 시작해봐찍! 🐹✨"
  },
  homework: {
    name: '우리 반 숙제 요정',
    avatar: '📚',
    roleText: '친절한 공부 멘토 (3줄 요약)',
    systemPrompt: "너는 교과서의 복잡한 과학과 역사 개념을 초·중학생 눈높이에 맞게 딱 3줄로 알기 쉽게 요약해 주는 똑똑하고 친절한 공부 숙제 요정이야.",
    defaultQuestion: "식물이 햇빛을 받아서 만드는 '광합성'이 뭔지 3줄로 요약해줘!",
    mockAnswer: "안녕! 숙제 요정이 광합성을 딱 3줄로 정리해 줄게! 📚✨\n\n1. 식물이 잎으로 햇빛을 쬐고 땅속의 물과 공기 중의 이산화탄소를 마셔요.\n2. 햇빛 에너지로 스스로 먹을 달콤한 포도당 영양분을 만들어요.\n3. 그리고 우리가 숨 쉴 수 있는 맑고 깨끗한 산소를 선물로 내뿜어준답니다!"
  },
  pet: {
    name: '반려동물 마음 번역기 냥냥이',
    avatar: '🐱',
    roleText: '동물 심리학자 고양이 (~냥 체)',
    systemPrompt: "너는 강아지와 고양이의 독특한 행동을 통역해 주는 시크하지만 다정한 삼색 고양이 심리학자야. 말끝마다 '~냥!'을 붙여줘.",
    defaultQuestion: "강아지가 꼬리를 프로펠러처럼 빙글빙글 흔들며 달려오는데 무슨 뜻이야?",
    mockAnswer: "안냥! 그건 너를 온 세상에서 제일 사랑한다는 특급 신호다냥! 🐱🐾\n\n꼬리를 헬리콥터처럼 원을 그리며 흔드는 건 단순한 인사가 아니라 '내가 가장 좋아하는 사람이 돌아왔다!'라며 최고의 행복과 흥분을 터뜨리는 중이다냥.\n눈을 마주치며 이름을 부르고 턱 밑을 부드럽게 쓰다듬어줘냥!"
  },
  trpg: {
    name: '던전 마스터 고블린',
    avatar: '🎮',
    roleText: '모험 게임 마스터 (판타지 풍)',
    systemPrompt: "너는 신비로운 판타지 던전의 안내자이자 게임 마스터야. 플레이어의 선택에 따라 박진감 넘치는 2가지 다음 선택지를 제시해줘.",
    defaultQuestion: "동굴 입구에 붉은 횃불과 낡은 나무 상자가 보여. 상자를 열어볼까?",
    mockAnswer: "허허, 용감한 모험가여! 상자 뚜껑을 만지자 삐걱이는 소리와 함께 자물쇠가 풀렸소! 🎮⚔️\n\n상자 안에는 푸른빛으로 빛나는 '마나의 물약'과 먼지 쌓인 '지도 조각'이 들어있소.\n자, 다음은 어떻게 행동하겠소?\n1. 물약을 가방에 넣고 동굴 깊은 곳으로 조용히 전진한다.\n2. 지도 조각을 펼쳐 동굴의 숨겨진 보물 방 위치를 먼저 확인한다."
  }
};

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';

export const Lesson20: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  // 모드 및 탭 상태
  const [apiMode, setApiMode] = useState<'mock' | 'real'>('mock');
  const [activeTab, setActiveTab] = useState<'tester' | 'code' | 'checklist'>('tester');
  const [activePersona, setActivePersona] = useState<string>('chef');

  // 실제 API Key 관리
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyVisible, setIsKeyVisible] = useState<boolean>(false);

  // 질문 및 통신 상태
  const [userQuestion, setUserQuestion] = useState<string>(
    '냉장고에 계란이랑 식빵이 있어. 10분 만에 만들 수 있는 초간단 아침 요리 알려줘!'
  );
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<string>('대기 중 (Ready)');
  const [latency, setLatency] = useState<number>(0);
  const [responseText, setResponseText] = useState<string>(
    '위의 [요청서 보내기] 버튼을 누르면 구글 Gemini 슈퍼컴퓨터가 보낸 따끈따끈한 첫 답변이 여기에 도착합니다!'
  );
  const [rawJson, setRawJson] = useState<string>(
    '{"status": "waiting", "message": "아직 요청이 전송되지 않았습니다."}'
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  // 로컬스토리지 복원
  useEffect(() => {
    const savedKey = localStorage.getItem('user_gemini_api_key');
    if (savedKey) setApiKey(savedKey);

    const savedChecks = checklist.map((_, idx) => {
      return localStorage.getItem(`ai_lesson_20_check_${idx + 1}`) === 'true';
    });
    setChecklist(savedChecks);
  }, []);

  // API Key 변경 핸들러
  const handleKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('user_gemini_api_key', val.trim());
  };

  // 페르소나 변경 핸들러
  const handlePersonaChange = (key: string) => {
    setActivePersona(key);
  };

  // 추천 질문 채우기
  const handleFillDefaultQuestion = () => {
    const config = PERSONA_CONFIGS[activePersona];
    if (config) {
      setUserQuestion(config.defaultQuestion);
    }
  };

  // 요청 전송 함수
  const handleSendRequest = async () => {
    if (isRequesting) return;
    if (!userQuestion.trim()) {
      alert('질문 내용을 입력해 주세요!');
      return;
    }

    setIsRequesting(true);
    setResponseStatus('통신 중... (Pending)');
    setResponseText('Google Gemini AI 슈퍼컴퓨터가 답변을 요리하는 중입니다...');
    const startTime = performance.now();

    try {
      if (apiMode === 'mock') {
        // 모의 모드 지연 시뮬레이션
        await new Promise((r) => setTimeout(r, 600));

        const config = PERSONA_CONFIGS[activePersona];
        const mockJsonObj = {
          candidates: [
            {
              content: {
                parts: [{ text: config.mockAnswer }],
                role: 'model'
              },
              finishReason: 'STOP',
              index: 0
            }
          ],
          usageMetadata: {
            promptTokenCount: 38,
            candidatesTokenCount: 124,
            totalTokenCount: 162
          }
        };

        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));
        setResponseStatus('200 OK (모의)');
        setResponseText(config.mockAnswer);
        setRawJson(JSON.stringify(mockJsonObj, null, 2));
      } else {
        // 실제 Google Gemini API 호출
        const key = apiKey.trim() || localStorage.getItem('user_gemini_api_key') || '';
        if (!key) {
          throw new Error('401: Google API Key가 입력되지 않았습니다. 상단 입력창에 키를 넣어주세요!');
        }

        const config = PERSONA_CONFIGS[activePersona];
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

        const payload = {
          system_instruction: {
            parts: [{ text: config.systemPrompt }]
          },
          contents: [{ parts: [{ text: userQuestion }] }]
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP 에러 ${res.status}`;
          throw new Error(`${res.status}: ${errMsg}`);
        }

        const data = await res.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '(답변을 추출할 수 없습니다)';

        setResponseStatus('200 OK');
        setResponseText(answer);
        setRawJson(JSON.stringify(data, null, 2));
      }
    } catch (err: unknown) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      const errStr = err instanceof Error ? err.message : String(err);
      let codeLabel = '오류 발생';
      if (errStr.includes('401')) codeLabel = '401 Unauthorized';
      else if (errStr.includes('403')) codeLabel = '403 Forbidden';
      else if (errStr.includes('429')) codeLabel = '429 Rate Limit';

      setResponseStatus(codeLabel);
      setResponseText(`🚨 [통신 오류 발생]\n${errStr}\n\n💡 팁: '안전 모의(Mock) 모드'로 전환하시면 실제 열쇠 없이도 100% 정상 통신 체험이 가능합니다!`);
      setRawJson(JSON.stringify({ error: errStr }, null, 2));
    } finally {
      setIsRequesting(false);
    }
  };

  // 통신 코드 복사
  const handleCopyCode = () => {
    const config = PERSONA_CONFIGS[activePersona];
    const isReal = apiMode === 'real';
    const keyVal = isReal ? (apiKey || 'AIzaSy_YOUR_KEY_HERE') : 'MOCK_KEY_FOR_TEST';

    const codeString = `// 1. 구글 Gemini API 엔드포인트와 비밀 열쇠
const API_KEY = "${keyVal}";
const URL = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${API_KEY}\`;

// 2. 비동기 통신 함수 정의 (19강 ${config.name} 연동)
async function askGemini(userQuestion) {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "${config.systemPrompt}" }]
        },
        contents: [
          { parts: [{ text: userQuestion }] }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(\`HTTP 에러 발생! 상태 코드: \${response.status}\`);
    }

    const data = await response.json();
    const answer = data.candidates[0].content.parts[0].text;
    console.log("AI의 답변:", answer);
    return answer;
  } catch (error) {
    console.error("통신 실패:", error);
  }
}`;

    navigator.clipboard.writeText(codeString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });
  };

  // 체크리스트 핸들러
  const handleChecklistChange = (idx: number) => {
    const updated = [...checklist];
    updated[idx] = !updated[idx];
    setChecklist(updated);
    localStorage.setItem(`ai_lesson_20_check_${idx + 1}`, updated[idx] ? 'true' : 'false');

    const allChecked = updated.every(Boolean);
    if (allChecked) {
      localStorage.setItem('ai_lesson_20_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_20_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);
  const currentConfig = PERSONA_CONFIGS[activePersona];

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
              <a href="../19-ai-inventor/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">19강 AI 발명가</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 whitespace-nowrap">20강 구글 AI 스튜디오와 API</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span className="text-indigo-600 font-mono font-bold text-xs">{progressPct}%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
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
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>API 열쇠와 프롬프트</span>
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
                  <span>구글 AI 스튜디오</span>
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
                  <span>첫 번째 API 호출</span>
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
                  <span>AI 응답 다듬기</span>
                </button>
              </nav>
            </div>

            {progressPct === 100 ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                <span>21강 언락</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>21강 잠김</span>
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
          {/* [STAGE 1: 자유이용권의 비밀] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border border-indigo-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  시즌 4: 스마트 챗봇 웹앱
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  소요 시간: 약 45분
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  보안 수칙 엄수
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                AI의 거대한 뇌를 내 손끝으로!<br />
                Google Gemini 무료 API 열쇠 발급과 첫 통신
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                수천억 개의 생각 회로를 가진 구글의 초거대 AI 슈퍼컴퓨터! 내 컴퓨터에 직접 설치할 수는 없지만,{' '}
                <strong>마법의 비밀 열쇠(API Key)</strong>만 있으면 인터넷 전화선(fetch)을 통해 언제든 질문하고 3초 만에{' '}
                똑똑한 대답을 들을 수 있어요. 19강에서 기획한 나만의 챗봇에게 살아 숨 쉬는 진짜 AI 뇌를 연결해 볼까요?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">선수 지식</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">19강 린 캔버스 기획</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">오늘의 무기</span>
                  <span className="text-xs font-bold text-indigo-700 leading-snug whitespace-nowrap">fetch() 비동기 통신</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">핵심 개념</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">API Key &amp; 토큰 보안</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <span className="text-xs font-bold text-emerald-700 leading-snug whitespace-nowrap">Gemini 첫 인사 성공</span>
                </div>
              </div>
            </div>
          </div>

          {/* [Stage 1] 자유이용권의 비밀 */}
          <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                놀이공원 자유이용권의 비밀: API와 비밀 열쇠의 정체
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              우리가 19강에서 멋진 챗봇의 성격과 대화 규칙을 기획했습니다. 이제 이 챗봇이 진짜로 생각하고 말을 하려면{' '}
              <strong>Google의 거대한 AI 두뇌(Gemini)</strong>를 빌려와야 해요. 그런데 왜 AI 프로그램을 내 컴퓨터에 직접 다운받지 않고{' '}
              인터넷으로 연결해서 쓰는 걸까요?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs sm:text-sm">
                  <Key className="w-4 h-4" />
                  <span>놀이공원 롤러코스터와 자유이용권</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  롤러코스터가 타고 싶다고 내 방에 롤러코스터 레일을 깔 수는 없어요! 대신 놀이공원에 가서{' '}
                  <strong>'자유이용권 손목 밴드'</strong>를 차면 모든 놀이기구를 자유롭게 즐길 수 있죠.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs sm:text-sm">
                  <Key className="w-4 h-4" />
                  <span>Google 슈퍼컴퓨터와 API Key</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  수천억 개의 생각 회로를 돌리는 컴퓨터는 건물 하나만큼 거대해요! 구글이 발급해 준{' '}
                  <strong>'비밀 열쇠(API Key)'</strong>만 웹 브라우저에 꽂으면 어디서나 AI 뇌를 바로 쓸 수 있어요.
                </p>
              </div>
            </div>

            {/* 식당 비유 다이어그램 */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300">식당으로 이해하는 API 3단 왕복 여정</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Request &amp; Response</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg mb-1">👦</div>
                  <strong className="text-white block font-bold mb-0.5">손님 (우리의 웹사이트)</strong>
                  <span className="text-[11px] text-slate-400">"햄스터 요리사 챗봇님, 계란으로 뭐 만들까?"</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/50">
                  <div className="text-lg mb-1">🚴‍♂️</div>
                  <strong className="text-indigo-300 block font-bold mb-0.5">배달원 웨이터 (API / fetch)</strong>
                  <span className="text-[11px] text-slate-300">비밀 열쇠(인증)와 주문서를 안전 가방에 담아 질주!</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg mb-1">🧠</div>
                  <strong className="text-white block font-bold mb-0.5">주방장 (Google Gemini AI)</strong>
                  <span className="text-[11px] text-slate-400">주문서와 페르소나를 읽고 3초 만에 맛있는 답변 요리!</span>
                </div>
              </div>
            </div>

            {/* 보안 3계명 */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>주니어 개발자를 위한 비밀 열쇠(API Key) 보안 3계명</span>
              </div>
              <ul className="text-xs text-amber-800 space-y-1 pl-4 list-disc leading-relaxed">
                <li><strong>절대 친구에게 사진 찍어 보내지 않기</strong>: 나만의 고유한 번호이므로 남이 마음대로 쓰면 내 무료 이용 한도가 깎여요!</li>
                <li><strong>깃허브 공개 금고에 그냥 올리지 않기</strong>: 인터넷에 공개된 열쇠는 1분 만에 구글 로봇이 찾아내어 보안상 즉시 잠가버려요.</li>
                <li><strong>잃어버리면 언제든 다시 만들기</strong>: 혹시 실수로 노출되었더라도 Google AI Studio에서 1초 만에 지우고 새 열쇠를 발급받으면 끝!</li>
              </ul>
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
                  <span>다음: Stage 2 열쇠 발급 작전</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 열쇠 발급 작전] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* [Stage 2] 열쇠 발급 작전 */}
          <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                비밀 열쇠 발급 작전: Google AI Studio 3분 마스터 코스
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              구글은 학생과 개발자들이 인공지능을 자유롭게 만들어볼 수 있도록 <strong>완전 무료 티어(Free Tier)</strong>를 제공하고 있어요.{' '}
              신용카드 등록 없이 구글 계정만 있으면 3단계 만에 나만의 열쇠를 손에 쥘 수 있습니다.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  STEP 1
                </div>
                <div className="space-y-1">
                  <strong className="text-base font-bold text-slate-900">Google AI Studio 사이트 접속 및 로그인</strong>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    인터넷 주소창에 <code className="px-1.5 py-0.5 rounded bg-slate-200 text-indigo-700 font-mono font-bold text-[11px]">aistudio.google.com</code>을 입력하고 내 구글 계정으로 로그인합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  STEP 2
                </div>
                <div className="space-y-1">
                  <strong className="text-base font-bold text-slate-900">파란색 [Get API key] 버튼 클릭</strong>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    화면 왼쪽 사이드바 메뉴 맨 위에 있는 열쇠 모양 아이콘 <span className="font-bold text-slate-800">[Get API key]</span> 메뉴를 클릭합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  STEP 3
                </div>
                <div className="space-y-1">
                  <strong className="text-base font-bold text-indigo-950">[Create API key] 누르고 39자리 비밀 열쇠 복사!</strong>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    새 프로젝트 만들기(Create API key in new project)를 누르면 <code className="px-1.5 py-0.5 rounded bg-white text-indigo-800 font-mono font-bold text-[11px]">AIzaSy...</code>로 시작하는 39자리의 마법 열쇠가 나타나요. 옆의 복사 버튼을 눌러 안전하게 보관합니다!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-emerald-900 block">영구 무료(Free Tier) 요금제의 혜택</strong>
                  <span className="text-[11px] text-emerald-700">1분당 최대 15번 질문 가능(15 RPM)! 주니어 챗봇 실습에는 아주 충분해요.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200">
                비용 0원 안심
              </span>
            </div>
          </article>

              {/* 우측 API 테스터 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [API 테스터]에서 첫 연결을 테스트하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Google AI Studio에서 발급받은 비밀 열쇠(API Key) 또는 안전한 시뮬레이션 모드로 첫 AI 통신을 시험할 차례입니다. 우측 콘솔의 <strong>[API 테스터]</strong>에서 프롬프트를 전송하고 Gemini의 실시간 응답을 직접 받아보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('tester')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [API 테스터] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 자유이용권의 비밀
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
                  <span>다음: Stage 3 fetch 통신 조립</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: fetch 통신 조립] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* [Stage 3] fetch 통신 조립 */}
          <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                코드 우편함 조립: fetch()로 주고받는 마법의 주문서
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              열쇠를 챙겼다면 이제 웹 브라우저가 구글 슈퍼컴퓨터로 편지 봉투(HTTP Request)를 보내는 자바스크립트 표준 마법 주문인{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono font-bold text-xs">fetch()</code>를 배울 차례예요!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. 우편함 주소 (URL)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  구글 Gemini 모델이 기다리고 있는 도착지 주소와 끝부분에 내 비밀 열쇠를 달아줍니다.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>2. 연기 대본 (System)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  19강에서 만든 페르소나! <code className="font-mono text-[10px] text-rose-800">system_instruction</code>에 "너는 햄스터 요리사야"라고 적어줍니다.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>3. 손님 질문 (Contents)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  사용자가 웹 화면의 입력창에 타이핑한 진짜 질문 텍스트를 <code className="font-mono text-[10px] text-emerald-800">contents</code>에 쏙 담습니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-indigo-300">구글이 보낸 답장 택배 상자에서 알맹이만 쏙 꺼내는 방법!</strong>
                <span className="text-[10px] font-mono text-slate-400">JSON Parsing</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-indigo-200 leading-relaxed border border-slate-800 overflow-x-auto">
                <span className="text-slate-500">// 구글 서버가 돌려준 데이터 객체(data)에서 텍스트 뽑기</span><br />
                <span className="text-rose-400">const</span> replyText = data.<span className="text-amber-300">candidates</span>[0].<span className="text-indigo-300">content</span>.<span className="text-emerald-300">parts</span>[0].<span className="text-white font-bold">text</span>;
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                택배 상자(<code className="text-indigo-300">candidates</code>)를 열고, 1번째 답변의 내용(<code className="text-indigo-300">content</code>) 속 조각(<code className="text-indigo-300">parts</code>)에서 글자(<code className="text-white">text</code>)를 쏙 꺼내면 끝이에요!
              </p>
            </div>
          </article>

              {/* 우측 통신 코드 연동 알림 카드 */}
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
                      통신에 성공했다면 우측 [통신 코드] 탭에서 fetch() 구조를 복사하세요!
                    </span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    API 엔드포인트 URL, 헤더(Header), 바디(Body)의 표준 규격을 확인하셨나요? 우측 콘솔의 <strong>[통신 코드]</strong> 탭에서 안전한 환경변수 분리 코드와 실전 통신 함수 템플릿을 확인하고 내 프로젝트로 가져가세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [통신 코드] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 열쇠 발급 작전
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
                  <span>다음: Stage 4 오류 해결 & 보안</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 오류 해결 & 보안] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* [Stage 4] 오류 해결 & 보안 */}
          <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                오류 연구소 &amp; 보안: 401, 403, 429 빨간 딱지 해결사
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              코딩을 하다 보면 구글 서버가 친절하게 빨간 숫자 딱지(HTTP 상태 코드)를 붙여줄 때가 있어요.{' '}
              겁먹지 말고 딱지에 적힌 숫자를 보면 무엇이 잘못되었는지 바로 고칠 수 있답니다!
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-3">
                <div className="px-2 py-1 rounded-lg bg-rose-600 text-white font-mono font-bold text-xs shrink-0">
                  401
                </div>
                <div>
                  <strong className="text-xs font-bold text-rose-950 block">Unauthorized (열쇠가 엉뚱해요!)</strong>
                  <span className="text-xs text-rose-800 leading-relaxed">
                    비밀 열쇠를 복사할 때 앞뒤에 공백(띄어쓰기)이 들어갔거나 끝 글자가 잘렸을 때 발생해요. AI Studio에서 다시 깔끔하게 복사해 보세요.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div className="px-2 py-1 rounded-lg bg-amber-600 text-white font-mono font-bold text-xs shrink-0">
                  403
                </div>
                <div>
                  <strong className="text-xs font-bold text-amber-950 block">Forbidden (출입 금지 권한 없음)</strong>
                  <span className="text-xs text-amber-800 leading-relaxed">
                    선택한 모델 이름에 오타가 있거나, 구글 계정에서 Generative Language API 기능이 켜져 있지 않을 때 나타나요.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <div className="px-2 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shrink-0">
                  429
                </div>
                <div>
                  <strong className="text-xs font-bold text-blue-950 block">Too Many Requests (주문이 너무 빨라요! 🏃)</strong>
                  <span className="text-xs text-blue-800 leading-relaxed">
                    무료 티어는 1분에 15번까지만 질문할 수 있어요. 연타로 버튼을 눌렀다면 5초 정도 숨을 고르고 다시 요청해 보세요!
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <TestTube2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <strong className="text-base font-bold text-indigo-950">오늘 당장 구글 계정이 없어도 걱정 마세요! (모의 모드 지원)</strong>
                <p className="text-sm text-indigo-900 leading-relaxed">
                  우측 실습 창에는 실제 구글 API Key 없이도 통신 과정을 100% 동일하게 체험할 수 있는{' '}
                  <strong>'안전 모의(Mock) 모드'</strong>가 탑재되어 있어요. 학교나 공용 PC에서도 안심하고 실습을 완료할 수 있답니다!
                </p>
              </div>
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 21 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 21강을 여세요!</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    오늘 성공한 6대 Gemini API 비동기 통신과 프롬프트 연동 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 21강(대화 히스토리를 기억하는 챗봇 알파 조립)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 21강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 fetch 통신 조립
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
                  JUNIOR DEVELOPER GLOSSARY · 20강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 클라우드 AI 엔지니어들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 응용 프로그램 인터페이스 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-400" />
                      1. 응용 프로그램 인터페이스
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: API (Application Programming Interface)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">통신/인터페이스</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "손님의 음식 주문서를 주방 요리사에게 안전하게 배달하고 음식을 날라주는 식당 지배인!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 서로 다른 소프트웨어 시스템이나 애플리케이션이 미리 정의된 규약에 따라 데이터와 기능을 원활하게 주고받을 수 있도록 연결해 주는 표준 인터페이스입니다.
                </p>
              </div>
              {/* 용어 2: 인증 비밀 열쇠 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-sky-300 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-sky-400" />
                      2. 인증 비밀 열쇠
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: API 키 (API Key & Bearer Token)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">인증/보안</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "놀이공원 놀이기구를 탈 때 손목에 차는 나만의 고유한 무제한 자유이용권 밴드!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 서비스 공급자(Google 등)가 요청을 보낸 클라이언트의 신원을 확인하고 사용 권한과 호출 한도를 검증하기 위해 발급하는 고유한 암호화 문자열 식별자입니다.
                </p>
              </div>
              {/* 용어 3: 비동기 웹 통신 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                      3. 비동기 웹 통신
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: HTTP Fetch & REST Request</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">네트워크 통신</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "편지를 우체통에 쏙 넣고 다른 숙제를 하다가, 답장 벨이 울리면 편지함을 열어보는 똑똑한 심부름!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 브라우저가 현재 페이지를 새로고침(Reload)하지 않고도 백그라운드에서 원격 서버와 HTTP 데이터를 비동기적으로 주고받을 수 있도록 하는 자바스크립트 표준 통신 방식입니다.
                </p>
              </div>
              {/* 용어 4: 데이터 교환 표준 포맷 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      4. 데이터 교환 표준 포맷
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 제이슨 (JSON - JavaScript Object Notation)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">데이터 포맷</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "전 세계 모든 컴퓨터가 바로 알아들을 수 있게 이름표와 값을 상자에 담아 포장한 디지털 소포!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 속성-값 쌍(Key-Value) 구조로 인간과 기계가 모두 읽고 해석하기 쉬운 경량의 텍스트 기반 개방형 표준 데이터 교환 포맷입니다.
                </p>
              </div>
              {/* 용어 5: 시스템 지침 프롬프트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-rose-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      5. 시스템 지침 프롬프트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 시스템 프롬프트 (System Instruction)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">LLM 제어</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "AI 배우가 무대에 오르기 전 감독님이 건네주는 '너는 씩씩한 우주선 캡틴이야!' 비밀 메모!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 거대 언어 모델이 일반 대화를 처리하기 전, 모델의 역할(Role), 어조(Tone), 지식 범위, 금지 규칙 등을 사전 정의하여 답변의 일관성을 제어하는 최상위 운영 지침입니다.
                </p>
              </div>
              {/* 용어 6: 네트워크 오류 코드 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-teal-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-teal-400" />
                      6. 네트워크 오류 코드
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: HTTP 상태 코드 (Status Codes: 401 / 403 / 429)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">프로토콜/예외</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "배달원이 문 앞에 붙여둔 '열쇠가 안 맞아요(401)', '너무 빨리 문을 두드렸어요(429)' 안내 쪽지!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 클라이언트의 HTTP 요청에 대해 원격 서버가 요청의 성공(200 OK), 클라이언트 인증 오류(401), 권한 거부(403), 처리량 한도 초과(429) 등을 표준화된 3자리 정수로 응답하는 규약입니다.
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
              onClick={() => setActiveTab('tester')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tester'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API 테스터</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>통신 코드</span>
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
              <span>20강 점검표</span>
            </button>
          </div>

          {/* [우측 탭 1] API 테스터 */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              {/* 모드 전환 스위치 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>통신 모드 선택</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      apiMode === 'mock'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {apiMode === 'mock' ? '안전 모의(Mock) 모드 가동 중' : '실제 Gemini API 연동 모드'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApiMode('mock')}
                    className={`py-2.5 px-2 rounded-xl border text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                      apiMode === 'mock'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-1">🧪 안전 모의(Mock) 모드</span>
                    <span className="text-[10px] font-normal text-emerald-700">열쇠 없이 즉시 실습</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiMode('real')}
                    className={`py-2.5 px-2 rounded-xl border text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                      apiMode === 'real'
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-1">🚀 실제 Gemini API 연동</span>
                    <span className="text-[10px] font-normal text-slate-500">Google AI Studio 열쇠 입력</span>
                  </button>
                </div>

                {/* 실제 모드일 때 API Key 입력창 */}
                {apiMode === 'real' && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label htmlFor="react-input-api-key" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Google Gemini API Key 입력</span>
                      <span className="text-[10px] text-slate-400 font-normal">브라우저 로컬 저장 지원</span>
                    </label>
                    <div className="relative">
                      <input
                        id="react-input-api-key"
                        type={isKeyVisible ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        placeholder="AIzaSy... (39자리 열쇠 입력)"
                        className="w-full text-xs font-mono px-3 py-2.5 pr-9 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="API 키 보기 토글"
                      >
                        {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      🔒 입력한 API Key는 본인의 웹 브라우저 메모리에만 저장되며 외부 서버로 절대 전송되지 않습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* 19강 페르소나 선택기 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    <span>19강 챗봇 페르소나 선택</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    system_instruction 연동
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['chef', 'homework', 'pet', 'trpg'] as const).map((key) => {
                    const cfg = PERSONA_CONFIGS[key];
                    const isSelected = activePersona === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePersonaChange(key)}
                        className={`p-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-800 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{cfg.avatar}</span>
                        <span>{key === 'chef' ? '햄스터 셰프' : key === 'homework' ? '숙제 요정' : key === 'pet' ? '펫 번역기' : 'TRPG 모험'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-800">
                  <div className="text-[10px] text-indigo-400 font-bold mb-1 flex items-center justify-between">
                    <span>// 주입된 system_instruction</span>
                    <span className="text-white">{currentConfig.roleText}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] whitespace-pre-wrap">
                    "{currentConfig.systemPrompt}"
                  </p>
                </div>
              </div>

              {/* 질문 전송 인터랙션 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="react-user-question" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>테스트 질문 입력 (Contents)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDefaultQuestion}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    추천 질문 채우기 ✨
                  </button>
                </div>

                <textarea
                  id="react-user-question"
                  rows={3}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="AI에게 물어보고 싶은 질문을 적어보세요..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all leading-relaxed"
                />

                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={isRequesting}
                  className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                    isRequesting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isRequesting ? 'Google Gemini와 통신 중... 💭' : 'Google Gemini에 요청서 보내기 (Fetch)'}</span>
                </button>
              </div>

              {/* 통신 결과 & 응답 뷰어 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>통신 결과 리포트</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        responseStatus.includes('200')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : responseStatus.includes('Pending')
                          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          : responseStatus.includes('Ready')
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {responseStatus}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{latency}ms</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{currentConfig.avatar}</span>
                    <strong className="text-xs font-bold text-indigo-900">{currentConfig.name}</strong>
                    <span className="text-[10px] text-slate-400">gemini-1.5-flash</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {responseText}
                  </p>
                </div>

                <details className="group rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden text-xs">
                  <summary className="p-2.5 font-bold text-slate-600 cursor-pointer flex items-center justify-between hover:bg-slate-100 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Braces className="w-3.5 h-3.5 text-slate-500" />
                      <span>JSON 원본 응답 데이터 열람</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-3 bg-slate-900 text-slate-300 font-mono text-[10px] overflow-x-auto leading-relaxed border-t border-slate-800">
                    <pre>{rawJson}</pre>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* [우측 탭 2] 통신 코드 */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-1">gemini_api_fetch.js</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? '복사됨! ✨' : '코드 복사'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-200 leading-relaxed border border-slate-800 overflow-x-auto max-h-[360px] custom-scrollbar">
                  <pre>
{`// 1. 구글 Gemini API 엔드포인트와 비밀 열쇠
const API_KEY = "${apiMode === 'real' ? (apiKey || 'AIzaSy_YOUR_KEY_HERE') : 'MOCK_KEY_FOR_TEST'}";
const URL = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${API_KEY}\`;

// 2. 비동기 통신 함수 정의 (19강 ${currentConfig.name} 연동)
async function askGemini(userQuestion) {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "${currentConfig.systemPrompt}" }]
        },
        contents: [
          { parts: [{ text: userQuestion }] }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(\`HTTP 에러 발생! 상태 코드: \${response.status}\`);
    }

    const data = await response.json();
    const answer = data.candidates[0].content.parts[0].text;
    console.log("AI의 답변:", answer);
    return answer;
  } catch (error) {
    console.error("통신 실패:", error);
  }
}`}
                  </pre>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  💡 위 코드는 다음 21강에서 우리가 직접 만들 챗봇 웹 애플리케이션의 핵심 엔진으로 그대로 사용됩니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <strong className="text-xs font-bold text-slate-900 block">통신 코드 4대 핵심 구조 분석</strong>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-indigo-700 block mb-0.5">① POST 방식 통신</span>
                    <span className="text-slate-600 text-[11px]">단순히 주소를 치고 들어가는 GET과 달리, 편지 봉투에 많은 글을 담아 보낼 때는 POST를 사용해요.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-indigo-700 block mb-0.5">② Content-Type: application/json</span>
                    <span className="text-slate-600 text-[11px]">"지금 보내는 편지 봉투 속 내용물은 JSON 포맷의 데이터예요!"라고 구글 서버에 명시해요.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-indigo-700 block mb-0.5">③ JSON.stringify() 포장하기</span>
                    <span className="text-slate-600 text-[11px]">자바스크립트 객체를 인터넷 케이블선을 타고 날아갈 수 있는 텍스트 문자열로 압축 포장해요.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-indigo-700 block mb-0.5">④ await response.json() 뜯어보기</span>
                    <span className="text-slate-600 text-[11px]">구글이 보내온 JSON 택배 상자를 자바스크립트가 바로 다룰 수 있는 객체로 안전하게 풀어냅니다.</span>
                  </div>
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
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>20강 핵심 미션 자가 점검표</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {checkedCount} / 6 ({progressPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  모든 항목을 직접 체크하고 완료하면 다음 21강(챗봇 알파 빌드)으로 진입할 수 있어요!
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: '1. API의 배달원 역할 이해하기',
                    desc: "API가 내 웹 브라우저와 Google AI 슈퍼컴퓨터를 연결해 주는 '친절한 웨이터/배달원'임을 이해했다."
                  },
                  {
                    title: '2. API Key 비밀 열쇠의 보안 수칙',
                    desc: "API Key가 놀이공원 '자유이용권 손목 밴드'와 같으며 절대 남에게 노출하면 안 되는 비밀임을 배웠다."
                  },
                  {
                    title: '3. Google AI Studio 발급 3단계 파악',
                    desc: 'Google AI Studio 사이트에서 영구 무료(Free Tier) API Key를 발급받는 3단계 순서를 익혔다.'
                  },
                  {
                    title: '4. 시스템 지침(system_instruction) 주입',
                    desc: '19강에서 기획한 챗봇 페르소나를 AI의 연기 대본인 system_instruction에 담아 전달하는 방법을 확인했다.'
                  },
                  {
                    title: '5. fetch() 요청서 전송 및 첫 응답 수신',
                    desc: '우측 테스터에서 [요청서 보내기]를 눌러 200 OK 상태 코드와 함께 첫 번째 AI 답변을 성공적으로 수신했다.'
                  },
                  {
                    title: '6. 401, 403, 429 오류 코드 및 모의 모드 숙지',
                    desc: '숫자 오류 딱지가 뜨더라도 침착하게 원인을 분석할 수 있고, 안전 모의(Mock) 모드의 가치를 이해했다.'
                  }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => handleChecklistChange(idx)}
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
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm sm:text-base font-bold block">축하합니다! 20강 미션 완주 완료 🎉</strong>
                      <span className="text-xs text-indigo-100">이제 구글의 거대한 AI 뇌를 내 손끝으로 자유자재로 부를 수 있어요!</span>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    비밀 열쇠 발급과 fetch() 비동기 통신의 기초를 완벽하게 마스터했습니다.{' '}
                    다음 21강에서는 19강에서 기획한 챗봇 캔버스와 오늘 배운 Gemini API를 완벽히 결합하여 <strong>'진짜 말하는 챗봇 알파 빌드'</strong>를 만들어봅니다!
                  </p>
                  <a
                    href="../21-chatbot-alpha/index.html"
                    className="w-full py-3 px-4 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>21강(챗봇 알파 빌드)으로 이동하기</span>
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

export default Lesson20;
