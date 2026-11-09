import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Award,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Search,
  Flame,
  Bot,
  Lightbulb,
  Layers,
  AlertTriangle,
  Send,
  Loader2,
  Compass,
  FileText,
  Activity,
  Layout,
  Box,
  Dices,
  Network
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

interface QuestItem {
  id: string;
  badge: string;
  title: string;
  desc: string;
  situation: string;
  prompt: string;
  reaction: string;
  csSecret: string;
}

const QUESTS: QuestItem[] = [
  {
    id: 'quest-01',
    badge: '기초 fetch & 2단계 진동벨',
    title: '기초 fetch 요청과 async/await 2단계 진동벨 문법 완성하기',
    desc: '버튼을 눌렀을 때 원격 서버에 요청을 보내고, 2단계 진동벨(fetch 대기 → json 파싱 대기)을 차례대로 수행해 콘솔에 출력하는 표준 비동기 함수를 작성합니다.',
    situation: 'fetch() 앞에 await를 붙였는데 data 앞에 await를 안 붙여서 화면에 "[object Promise]"가 찍히고 데이터가 안 나오는 흔한 실수!',
    prompt: `[역할]
너는 자바스크립트 비동기 네트워크 통신을 지도하는 친절한 시니어 웹 프론트엔드 멘토야.

[상황 및 요구사항]
초등학생 코딩 입문자가 원격 명언 API('https://api.adviceslip.com/advice')에서 오늘의 조언을 받아와 웹 화면에 띄우는 함수를 만들려고 해.

[요청 조건]
1. async/await 문법을 사용해 fetch()로 데이터를 요청하고, response.json()으로 언박싱하는 비동기 함수 fetchDailyAdvice()를 작성해 줘.
2. 왜 await를 1번(fetch)과 2번(.json()) 총 두 번 써야 하는지 초보자도 이해할 수 있는 카페 진동벨 은유로 설명해 줘.
3. 받아온 JSON 데이터(slip.advice)를 콘솔(console.log)과 화면의 #advice-text 요소에 안전하게 반영하는 예제 코드를 포함해 줘.
4. 매 줄마다 초보 학생을 위한 친절한 한국어 주석을 달아줘.`,
    reaction: '2단계 진동벨의 이유를 명쾌하게 짚어주며, 화면이 멈추지 않고 데이터를 부드럽게 가져오는 무결점 async/await 표준 코드를 소환합니다!',
    csSecret: '자바스크립트는 싱글 스레드 언어입니다. 만약 동기(Synchronous) 방식으로 인터넷 데이터를 기다리면 다운로드가 끝날 때까지 브라우저 화면 전체가 얼어붙습니다.'
  },
  {
    id: 'quest-02',
    badge: 'HTTP 상태 검증',
    title: '깨진 주소도 즉시 감지하는 response.ok & HTTP 상태 코드 검증술',
    desc: 'API 주소를 잘못 입력했거나 없는 포켓몬 번호를 조회했을 때(404 Not Found), 아무 경고 없이 하얗게 멈추지 않고 즉시 친절한 안내를 띄우는 방어 가드를 세웁니다.',
    situation: 'fetch는 404 Not Found나 500 에러를 받아도 네트워크 자체는 연결되었으므로 에러로 취급하지 않고 정상 실행해 버립니다!',
    prompt: `[역할]
너는 웹 API 런타임 안정성을 책임지는 프론트엔드 테크니컬 리드야.

[배경 및 문제점]
자바스크립트의 fetch() 함수는 서버가 '404 Not Found'나 '500 Internal Server Error'를 반환해도 Promise를 거부(reject)하지 않고 성공한 것으로 처리해 초보 개발자들을 당황하게 만듭니다.

[해결 요청]
1. fetch()를 호출한 직후 response.ok 속성과 response.status 코드를 확인하여 200번대 정상이 아닐 경우 커스텀 에러를 던지는 방어적 함수 fetchPokemon(id)를 작성해 줘.
2. 예: 만약 99999번 포켓몬을 요청해서 404가 나오면 '존재하지 않는 포켓몬입니다! (오류 코드: 404)'라는 안내를 화면에 띄우도록 처리해 줘.
3. response.ok가 왜 필수적인지 주니어 개발자의 관점에서 핵심 이유를 2문장으로 요약해 줘.`,
    reaction: 'res.ok 검증 가드를 탑재하여 404/500 에러 상태에서도 웹 앱이 침착하게 사용자에게 올바른 상태를 알리는 방어 코드를 작성해 줍니다!',
    csSecret: 'HTTP 상태 코드는 200(성공), 404(못 찾음), 500(서버 고장) 등 전 세계 표준 약속입니다. fetch는 오직 랜선이 끊겼을 때만 catch로 넘어가므로 res.ok 체크가 필수입니다.'
  },
  {
    id: 'quest-03',
    badge: '네트워크 에러 방패',
    title: '인터넷이 끊기거나 서버가 터졌을 때! try-catch 네트워크 에러 방패 구축',
    desc: '와이파이가 끊겼거나 비행기 모드일 때, 혹은 상대방 서버 점검으로 연결이 끊겨도 게임이나 앱이 다운되지 않고 우아하게 안내하는 예외 처리 방패입니다.',
    situation: 'try-catch 없이 네트워크 요청을 보냈다가 와이파이가 잠깐 끊기면 Uncaught TypeError가 발생하며 전체 페이지의 다른 버튼까지 먹통이 됩니다!',
    prompt: `[역할]
너는 무중단 웹 애플리케이션을 구축하는 사이트 신뢰성 엔지니어(SRE)이자 자바스크립트 코치야.

[상황]
학생이 오픈 API를 사용해 데이터를 불러오는 기능을 만들었는데, 가끔 사용자의 인터넷 연결이 불안정할 때 브라우저 콘솔에 빨간 에러가 뜨며 화면이 멈춰버립니다.

[요청 사항]
1. try-catch 문을 완벽하게 적용하여 네트워크 단절(오프라인), 타임아웃, JSON 파싱 오류 등 어떤 돌발 상황에서도 웹 앱이 다운되지 않는 완전한 안전 함수 safeFetchData(url)를 작성해 줘.
2. catch 블록에서 에러 메시지를 사용자 친화적인 한국어 안내("네트워크 연결을 확인해 주세요! 📡")로 화면에 출력하는 로직을 넣어줘.
3. finally 블록을 활용해 성공하든 실패하든 무조건 로딩 상태를 해제하는 필수 정리 작업을 시연해 줘.`,
    reaction: 'try-catch-finally의 3단계 철벽 방어막을 설계하여 어떤 네트워크 돌발 사태에도 화면이 우아하게 복구되는 코드를 작성해 줍니다!',
    csSecret: '클라우드와 분산 시스템에서는 "네트워크는 언제든 실패할 수 있다(Fallacies of Distributed Computing)"가 제1공리입니다. 방어적 예외 처리는 프로 개발자의 기본 소양입니다.'
  },
  {
    id: 'quest-04',
    badge: '로딩 인디케이터 UX',
    title: '실시간 로딩 인디케이터(스피너/스켈레톤)와 사용자 피드백 UX 설계',
    desc: '데이터가 서버에서 날아오는 1~2초 동안 사용자가 "고장 났나?" 하고 버튼을 연타하지 않도록 뱅글뱅글 도는 스피너와 버튼 비활성화(disabled) 처리를 구현합니다.',
    situation: '로딩 처리를 안 해두면 사용자가 답답해서 버튼을 10번 연속 누르고, 서버에 불필요한 요청이 10번 폭탄처럼 쏟아집니다!',
    prompt: `[역할]
너는 에듀테크 서비스의 사용자 경험(UX)과 인터랙션을 책임지는 시니어 UI/UX 엔지니어이자 프론트엔드 전문가야.

[요구사항]
데이터 배달 버튼을 눌렀을 때:
1. 배달 버튼을 즉시 비활성화(button.disabled = true)하고 버튼 안에 뱅글뱅글 도는 회전 스피너 아이콘과 "데이터를 가져오는 중..." 텍스트를 표시해 줘.
2. 결과 카드 영역에는 회색 스켈레톤 깜빡임 애니메이션(animate-pulse)을 띄워 데이터가 올 자리임을 시각적으로 미리 보여줘.
3. fetch가 완료(성공 또는 에러)되면 finally 블록에서 버튼을 다시 활성화하고 스피너를 원래 버튼 아이콘으로 원상 복구하는 완결된 HTML/자바스크립트 코드를 작성해 줘.
4. Tailwind CSS 클래스만을 사용하여 군더더기 없이 깔끔하게 작성해 줘.`,
    reaction: '버튼 중복 클릭 방지와 감성적인 스켈레톤 애니메이션을 조합해 상용 서비스 수준의 완성도 높은 비동기 UX를 구현해 줍니다!',
    csSecret: '사용자 인터페이스의 0.1초~1초 지연 시 적절한 시각 피드백을 제공하면 사용자가 느끼는 체감 대기 시간이 최대 40% 단축된다는 연구 결과가 있습니다.'
  },
  {
    id: 'quest-05',
    badge: '쿼리 파라미터 & 오픈 API',
    title: '도시 이름과 날씨를 골라 담는 URL 쿼리 파라미터(?city=Seoul) 조합술',
    desc: '단순한 고정 URL이 아니라, 사용자가 검색창에 입력한 도시 이름(서울, 부산, 도쿄 등)을 URL 뒤에 물음표(?)와 앤드(&)로 조합해 원하는 맞춤 데이터를 가져오는 기술입니다.',
    situation: '도시 이름에 한글(예: '서울')이나 공백이 들어갔을 때 URL 인코딩(encodeURIComponent)을 안 거치면 주소가 깨져 에러가 납니다!',
    prompt: `[역할]
너는 웹 API 데이터 연동과 URL 구조를 가르치는 풀스택 테크 리드야.

[상황]
실시간 날씨 오픈 API를 사용해 사용자가 입력한 도시명의 현재 기온, 습도, 날씨 아이콘을 가져오는 작은 검색기를 만들고 싶어.

[요청 사항]
1. URL 뒤에 붙는 쿼리 파라미터(?q=도시명&appid=API키&units=metric)의 문법과 구조를 초등학생도 이해할 수 있는 택배 주문 옵션 비유로 설명해 줘.
2. 한글 도시명 입력 시 깨짐을 방지하는 encodeURIComponent()의 필요성을 설명하고, 이를 적용한 검색 함수 searchWeather(cityName)을 작성해 줘.
3. 반환된 날씨 JSON 객체에서 기온(main.temp)과 날씨 묘사(weather[0].description)를 안전하게 추출해 화면에 렌더링하는 예제를 완성해 줘.`,
    reaction: 'URL 쿼리 스트링의 원리와 한글 인코딩 방어까지 완벽히 탑재한 실전 날씨 검색기 코드를 깔끔하게 소환합니다!',
    csSecret: 'URL은 원래 아스키(ASCII) 영문과 숫자만 허용됩니다. 따라서 한글이나 특수문자는 %EC%84%9C처럼 16진수 바이트 코드로 안전하게 인코딩(Percent-Encoding)되어야 합니다.'
  }
];

interface ApiChannelConfig {
  type: 'quote' | 'dog' | 'pokemon' | 'weather';
  name: string;
  url: string;
  mock: any;
}

const API_CHANNELS: Record<string, ApiChannelConfig> = {
  quote: {
    type: 'quote',
    name: '명언 카드',
    url: 'https://api.adviceslip.com/advice',
    mock: { slip: { id: 142, advice: "새로운 기술을 배울 때는 실수하는 것을 결코 두려워하지 마세요!" } }
  },
  dog: {
    type: 'dog',
    name: '귀여운 댕댕이 사진',
    url: 'https://dog.ceo/api/breeds/image/random',
    mock: { message: "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg", status: "success" }
  },
  pokemon: {
    type: 'pokemon',
    name: '피카츄 도감',
    url: 'https://pokeapi.co/api/v2/pokemon/25',
    mock: { id: 25, name: "pikachu", height: 4, weight: 60, types: [{ type: { name: "electric" } }], sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" }
  },
  weather: {
    type: 'weather',
    name: '서울 실시간 날씨',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true',
    mock: { latitude: 37.5665, longitude: 126.9780, current_weather: { temperature: 18.5, windspeed: 3.2, weathercode: 1, time: "2026-11-09T15:00" } }
  }
};

export const Lesson13: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. 네비게이션 & 복사 상태
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPromptText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // ---------------------------------------------------------------------------
  // 2. 가상 오픈 API 랩 상태 (Stage 2)
  // ---------------------------------------------------------------------------
  const [selectedApi, setSelectedApi] = useState<'quote' | 'dog' | 'pokemon' | 'weather'>('quote');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0); // 0: ready, 1: fetch, 2: await, 3: done
  const [statusText, setStatusText] = useState('STATUS: WAITING');
  const [rawJson, setRawJson] = useState('{\n  "status": "ready",\n  "message": "상단의 [데이터 배달 출발! (fetch)] 버튼을 누르면 서버의 실시간 응답이 여기에 출력됩니다."\n}');
  const [renderedData, setRenderedData] = useState<any>(null);
  const [duration, setDuration] = useState(0);

  const handleSelectApi = (type: 'quote' | 'dog' | 'pokemon' | 'weather') => {
    setSelectedApi(type);
  };

  const handlePickRandomApi = () => {
    const keys: ('quote' | 'dog' | 'pokemon' | 'weather')[] = ['quote', 'dog', 'pokemon', 'weather'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setSelectedApi(randomKey);
    executeDelivery(randomKey);
  };

  const executeDelivery = async (targetApi = selectedApi) => {
    const config = API_CHANNELS[targetApi];
    setIsLoading(true);
    setPipelineStep(1);
    setStatusText('STATUS: 1단계 fetch() 전송 중...');

    const start = performance.now();

    try {
      await new Promise(r => setTimeout(r, 400));
      setPipelineStep(2);
      setStatusText('STATUS: 2단계 진동벨 대기 (await)...');

      let resultData: any = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(config.url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          resultData = await res.json();
        } else {
          resultData = config.mock;
        }
      } catch (e) {
        resultData = config.mock;
      }

      await new Promise(r => setTimeout(r, 350));
      setPipelineStep(3);

      const end = performance.now();
      const dur = Math.round(end - start);
      setDuration(dur);
      setStatusText('STATUS: 200 OK');
      setRawJson(JSON.stringify(resultData, null, 2));
      setRenderedData({ type: targetApi, data: resultData });

      // 체크리스트 4번 자동 체크
      setCheckedItems(prev => {
        const next = { ...prev, 4: true };
        localStorage.setItem('ai_lesson_13_checklist', JSON.stringify(next));
        return next;
      });

    } catch (err: any) {
      setStatusText('STATUS: ERROR');
      setRawJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. 자가 점검 체크리스트 상태 & 영속화 (Stage 4 - 8강 최신 표준)
  // ---------------------------------------------------------------------------
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_13_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed)) {
            const map: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
            parsed.forEach((val: any) => {
              const num = parseInt(val, 10);
              if (num >= 1 && num <= 6) map[num] = true;
            });
            setCheckedItems(map);
          } else {
            setCheckedItems({
              1: !!parsed[1],
              2: !!parsed[2],
              3: !!parsed[3],
              4: !!parsed[4],
              5: !!parsed[5],
              6: !!parsed[6]
            });
          }
        }
      }
    } catch (e) {}
  }, []);

  const toggleCheck = (num: number) => {
    setCheckedItems(prev => {
      const next = { ...prev, [num]: !prev[num] };
      localStorage.setItem('ai_lesson_13_checklist', JSON.stringify(next));
      const allDone = Object.values(next).filter(Boolean).length === 6;
      if (allDone) {
        localStorage.setItem('ai_lesson_13_completed', 'true');
      }
      return next;
    });
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);
  const isAllCompleted = completedCount === 6;

  // ---------------------------------------------------------------------------
  // 4. 렌더링
  // ---------------------------------------------------------------------------
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
                <span className="text-sm font-bold text-slate-900 truncate">시즌 4 시작 · 13강: 인터넷 세상의 비밀 배달부! 오픈 API & Fetch</span>
              </div>
            </div>
          </div>

          {/* [우측]: 4단계 스테이지 스위처 버튼 그룹 (1강 최신 표준 20px 원형 배지) */}
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
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage1' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>1</span>
              <span>미션&원리</span>
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
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage2' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>2</span>
              <span>가상 API 랩</span>
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
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage3' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>3</span>
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
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage4' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>4</span>
              <span>용어&체크리스트</span>
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

      {/* 모바일 서브 탭 바 */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage1' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage2' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600'
          }`}
        >
          2. API 랩
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
          4. 용어&점검
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
      {/* 2. 메인 컨테이너 (단일 컨테이너 몰입형 워크스페이스)                  */}
      {/* ===================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* =================================================================== */}
        {/* STAGE 01: 미션 브리핑 & 3대 핵심 원리                              */}
        {/* =================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* 1. 미션 브리핑 히어로 카드 (Wanted Montage) */}
            <article className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SEASON 4 PREMIERE · NETWORK & OPEN API
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-slate-200">
                    STAGE 01
                  </span>
                  <span className="text-sm text-slate-400">외부 데이터 수신 & 비동기 통신</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
                    내 컴퓨터라는 외딴섬에서 전 세계 인터넷 세상으로!<br className="hidden sm:inline" />
                    비밀 배달부 fetch와 오픈 API 뷔페의 개막
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    어제까지 우리는 내 컴퓨터 메모리 안에서만 작동하는 코드를 만들었습니다. 오늘부터는 랜선 너머 지구 반대편 서버에 데이터를 달라고 요청하는 <strong className="text-cyan-400 font-bold">비밀 배달부 fetch</strong>와 카페 진동벨처럼 화면 멈춤 없이 기다리는 <strong className="text-cyan-400 font-bold">비동기 통신(async/await)</strong>의 놀라운 신세계를 탐험합니다.
                  </p>
                </div>

                {/* 핵심 도전 목표 3가지 */}
                <div className="pt-2">
                  <h4 className="text-base font-bold text-cyan-200 mb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <span>오늘 완수할 3가지 네트워크 탐험 미션</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-cyan-400 font-bold text-sm mb-1">01. 내 컴퓨터 밖으로</div>
                      <p className="text-sm text-slate-300">지구 반대편 서버에 주문서(URL)를 정중하게 보내는 HTTP 요청 원리 정복</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-cyan-400 font-bold text-sm mb-1">02. 비밀 배달부 & 진동벨</div>
                      <p className="text-sm text-slate-300">화면이 멈추지 않고(Non-blocking) 비동기로 데이터를 받아오는 async/await</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-cyan-400 font-bold text-sm mb-1">03. JSON 택배 언박싱</div>
                      <p className="text-sm text-slate-300">배달 상자(Response)를 열어 자바스크립트 객체로 즉시 조립하는 .json() 기술</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 핵심 개념 원리 탐구 카드 (Bento Grid) */}
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    💡 인터넷 배달을 지탱하는 3대 네트워크 핵심 원리
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  컴퓨터는 어떻게 랜선을 타고 다른 컴퓨터의 데이터베이스와 대화할까요? 어린이 눈높이 비유로 파헤쳐 봅니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 카드 1 */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    🛵
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    비밀 배달부 fetch<br />
                    <span className="text-sm font-mono text-indigo-700">fetch(url)</span>
                  </h4>
                  <p className="text-sm text-indigo-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 맛집에 전화해 "짜장면 한 그릇 집으로 배달해 주세요!" 하고 주소(URL)를 적어 보내는 배달 오토바이.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 브라우저 내장 Web API로, 원격 서버의 URL로 HTTP GET 네트워크 요청을 보내 리소스를 받아오는 비동기 함수입니다.
                  </p>
                </div>

                {/* 카드 2 */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    ⏳
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    카페 진동벨 시스템<br />
                    <span className="text-sm font-mono text-amber-700">async / await</span>
                  </h4>
                  <p className="text-sm text-amber-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 카페에서 주문 후 진동벨을 들고 친구와 수다를 떨며 놀다가, 벨이 울릴 때 음료를 받아오는 것!
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 네트워크 통신은 지연이 발생하므로 브라우저 렌더링이 멈추지 않도록 비동기(Promise)로 동작하며, <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-sm">await</code>로 도착을 기다립니다.
                  </p>
                </div>

                {/* 카드 3 */}
                <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    📦
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    JSON 택배 언박싱<br />
                    <span className="text-sm font-mono text-cyan-700">response.json()</span>
                  </h4>
                  <p className="text-sm text-cyan-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 집 앞에 도착한 택배 상자 테이프를 뜯고 안에 든 장난감을 꺼내 내 책상 위에 올려놓는 과정!
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 서버가 전송한 원시 텍스트 스트림(Response)을 파싱하여 자바스크립트가 바로 다룰 수 있는 객체나 배열로 변환합니다.
                  </p>
                </div>

              </div>

              {/* 주니어 개발자 제1원칙 알림 카드 */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-indigo-950">
                    주니어 웹 개발자의 황금 법칙: "네트워크 통신은 진동벨(await)을 반드시 2번 울려야 완성된다!"
                  </h4>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    <span className="font-mono font-bold text-indigo-800">1차 진동벨:</span> <code className="bg-indigo-100 px-1.5 py-0.5 rounded font-mono text-sm">const res = await fetch(url);</code> (배달부가 문 앞에 도착할 때까지 대기)<br />
                    <span className="font-mono font-bold text-indigo-800">2차 진동벨:</span> <code className="bg-indigo-100 px-1.5 py-0.5 rounded font-mono text-sm">const data = await res.json();</code> (택배 상자를 뜯고 내용물을 객체로 꺼낼 때까지 대기)<br />
                    둘 중 하나라도 <span className="font-mono font-bold text-rose-700">await</span>를 빠뜨리면 데이터 대신 아직 뚜껑이 닫힌 <span className="font-mono font-bold text-slate-700">[Promise]</span> 객체가 나와 오류가 발생합니다!
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 2 가상 오픈 API 랩 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 오픈 API 랩 (In-Page Simulator)             */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Network className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      🌐 가상 오픈 API 배달 라이브 랩
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    원하는 공개 API 채널을 선택하고 [데이터 주문하기]를 누르면 브라우저 배달부가 비동기로 데이터를 가져옵니다.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handlePickRandomApi}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto border border-slate-300"
                >
                  <Dices className="w-4 h-4" />
                  <span>랜덤 API 뽑기</span>
                </button>
              </div>

              {/* 4대 오픈 API 채널 선택 칩 */}
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-700 block">무료 오픈 API 채널 선택:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectApi('quote')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedApi === 'quote'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">💬</div>
                    <div className="text-sm font-bold">인생 명언 API</div>
                    <div className="text-xs text-indigo-600 font-mono truncate">adviceslip.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectApi('dog')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedApi === 'dog'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">🐶</div>
                    <div className="text-sm font-bold">귀여운 댕댕이</div>
                    <div className="text-xs text-slate-400 font-mono truncate">dog.ceo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectApi('pokemon')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedApi === 'pokemon'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">⚡</div>
                    <div className="text-sm font-bold">포켓몬 도감</div>
                    <div className="text-xs text-slate-400 font-mono truncate">pokeapi.co</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectApi('weather')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedApi === 'weather'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">🌤️</div>
                    <div className="text-sm font-bold">서울 실시간 날씨</div>
                    <div className="text-xs text-slate-400 font-mono truncate">open-weather</div>
                  </button>
                </div>
              </div>

              {/* URL 바 & 배달 발송 버튼 */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>HTTP METHOD: GET</span>
                  </span>
                  <span className="text-cyan-400 font-mono">HTTPS SECURE</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={API_CHANNELS[selectedApi].url}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 font-mono text-sm text-cyan-300 select-all focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeDelivery()}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>배달 중...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>데이터 배달 출발! (fetch)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3단계 배달 타임라인 애니메이션 인디케이터 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>실시간 비동기 배달 파이프라인 진행 상태</span>
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pipelineStep === 0 ? 'text-slate-500 bg-slate-200' :
                    pipelineStep === 1 ? 'text-amber-700 bg-amber-100 animate-pulse' :
                    pipelineStep === 2 ? 'text-indigo-700 bg-indigo-100 animate-pulse' :
                    'text-emerald-700 bg-emerald-100'
                  }`}>
                    {pipelineStep === 0 ? '대기 중 (Ready)' :
                     pipelineStep === 1 ? '1단계: 배달부 출발 (fetch)' :
                     pipelineStep === 2 ? '2단계: 진동벨 대기 (await response)' :
                     '배달 완료! 200 OK'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className={`p-3 rounded-xl border transition-all ${
                    pipelineStep >= 1 ? 'border-indigo-400 bg-indigo-50 text-indigo-950 font-bold' : 'border-slate-200 bg-white text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span>1. 🛵 fetch(url)</span>
                    </div>
                    <p className="text-xs text-slate-500">원격 서버로 HTTP 주문서 발송</p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    pipelineStep >= 2 ? 'border-amber-400 bg-amber-50 text-amber-950 font-bold' : 'border-slate-200 bg-white text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span>2. ⏳ await response</span>
                    </div>
                    <p className="text-xs text-slate-500">진동벨 대기 (상태 200 OK)</p>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${
                    pipelineStep >= 3 ? 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 bg-white text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span>3. 📦 await res.json()</span>
                    </div>
                    <p className="text-xs text-slate-500">JSON 객체로 언박싱 조립</p>
                  </div>
                </div>
              </div>

              {/* 2단 결과 뷰어: 영수증 & 실시간 화면 렌더링 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                
                {/* 좌측: HTTP 배달 영수증 (X-Ray JSON 뷰어) */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>HTTP 배달 영수증 (JSON 원문)</span>
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      statusText.includes('200')
                        ? 'text-emerald-300 bg-emerald-950 border border-emerald-800'
                        : 'text-slate-400 bg-slate-800'
                    }`}>
                      {statusText}
                    </span>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed h-56 select-all">
                    {rawJson}
                  </pre>
                </div>

                {/* 우측: 실제 화면 렌더링 카드 조립 뷰어 */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                      <Layout className="w-4 h-4" />
                      <span>실제 웹사이트 화면 조립 결과 (UI Preview)</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-400">자바스크립트 DOM 바인딩</span>
                  </div>

                  {/* 동적 렌더링 컨테이너 */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[224px]">
                    {!renderedData ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Box className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-800">도착한 데이터가 없습니다</h4>
                          <p className="text-sm text-slate-500">배달을 시작하면 이곳에 멋진 카드가 완성됩니다.</p>
                        </div>
                      </>
                    ) : renderedData.type === 'quote' ? (
                      <div className="space-y-3 w-full animate-fadeIn">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          오늘의 명언 카드
                        </span>
                        <blockquote className="text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed italic px-2">
                          "{renderedData.data.slip ? renderedData.data.slip.advice : renderedData.data.advice}"
                        </blockquote>
                        <p className="text-xs text-slate-400 font-mono">출처: adviceslip.com Open API</p>
                      </div>
                    ) : renderedData.type === 'dog' ? (
                      <div className="space-y-3 w-full animate-fadeIn flex flex-col items-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          랜덤 댕댕이 사진
                        </span>
                        <img
                          src={renderedData.data.message}
                          alt="귀여운 댕댕이"
                          className="w-40 h-32 object-cover rounded-xl shadow-md border border-slate-200"
                        />
                        <p className="text-xs text-slate-400 font-mono">출처: dog.ceo Open API</p>
                      </div>
                    ) : renderedData.type === 'pokemon' ? (
                      <div className="space-y-2 w-full animate-fadeIn flex flex-col items-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-300">
                          포켓몬 도감 #25
                        </span>
                        <img
                          src={renderedData.data.sprite || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"}
                          alt={renderedData.data.name}
                          className="w-24 h-24 object-contain animate-bounce"
                        />
                        <div className="text-base font-extrabold text-slate-900">{renderedData.data.name.toUpperCase()} ⚡</div>
                        <p className="text-xs text-slate-400 font-mono">속성: 전기 (Electric)</p>
                      </div>
                    ) : (
                      <div className="space-y-3 w-full animate-fadeIn flex flex-col items-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          서울 실시간 날씨
                        </span>
                        <div className="text-3xl font-extrabold text-cyan-600 font-mono">
                          {renderedData.data.current_weather ? renderedData.data.current_weather.temperature : 18.5}°C
                        </div>
                        <p className="text-sm font-bold text-slate-700">맑음 · 외출하기 좋은 날씨 🌤️</p>
                        <p className="text-xs text-slate-400 font-mono">위도: 37.56 / 경도: 126.97</p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                    <span>렌더링 모드: <span className="font-bold text-slate-700">{API_CHANNELS[selectedApi].name}</span></span>
                    <span className="font-mono text-slate-500">지연 시간: {duration}ms</span>
                  </div>
                </div>

              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 1 미션 & 원리</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 3 실전 최신 AI 5대 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 03: 실전 최신 AI 5대 킬러 퀘스트 (Real AI Test)               */}
        {/* =================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <Flame className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  🔥 최신 AI 5대 실전 퀘스트: 오픈 API와 비동기 배달부 소환
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                실제 ChatGPT나 Gemini 창을 옆에 띄워두고 아래의 고난도 프롬프트를 복사하여 보내보세요. 실무 프론트엔드 엔지니어들이 네트워크 통신을 다루는 프로페셔널한 기법을 완벽히 흡수합니다.
              </p>
            </div>

            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article
                  key={q.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5 transition-all hover:border-indigo-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-indigo-600 text-white">
                        QUEST 0{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {q.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      HTTP GET & async/await
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {q.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {q.desc}
                    </p>
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>실전 함정 상황:</strong> {q.situation}
                      </div>
                    </div>
                  </div>

                  {/* 프롬프트 박스 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <span>복사해서 AI에게 보낼 프롬프트 (클릭 시 자동 복사)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPromptText(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-200 shadow-xs"
                      >
                        {copiedId === q.id ? (
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

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {q.prompt}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI 소환 마법 반응</span>
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {q.reaction}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>💡 컴퓨터 과학의 비밀</span>
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {q.csSecret}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 2 가상 오픈 API 랩</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 4 용어 돋보기 & 자가 점검</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 04: 전문 용어 돋보기 & 자가 점검 체크리스트 (8강 최신 표준)    */}
        {/* =================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* 1. 주니어 개발자를 위한 전문 용어 돋보기 (다크 테마) */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Search className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 13강 오픈 API와 비동기 통신에서 사용된 실제 공식 컴퓨터 과학 / 웹 네트워크 표준 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                {/* 용어 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🌐</span>
                      <span>오픈 API</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Open API / Application Programming Interface</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 식당의 공개 메뉴판! 누구나 규칙대로 주문하면 정해진 맛있는 요리(데이터)를 가져다주는 창구.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 외부 개발자나 일반 대중이 특정 기업이나 기관의 데이터·기능을 자유롭게 호출해 소프트웨어에 활용할 수 있도록 공개한 인터페이스입니다.
                  </p>
                </div>

                {/* 용어 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>비동기 통신 & 프로미스</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Asynchronous Programming & Promise / async & await</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 빨래를 세탁기에 넣고 돌리는 동안 멈춰 서서 멍하니 바라보는 대신, 방 청소를 하거나 게임을 하는 것!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 작업이 완료될 때까지 메인 실행 흐름(UI 스레드)을 차단(Block)하지 않고 백그라운드에서 처리한 뒤 결과를 미래에 반환하는 프로그래밍 패러다임입니다.
                  </p>
                </div>

                {/* 용어 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🛵</span>
                      <span>HTTP GET 요청</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">HTTP GET Request / 브라우저 배달부의 조회 주문서</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 도서관 사서 선생님께 책 번호표를 보여주며 "이 동화책 좀 꺼내서 보여주세요" 하고 요청하는 것.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 인터넷 통신 규약(HTTP)에서 서버의 데이터를 수정하지 않고 지정된 리소스(URL)의 정보를 읽어오기만(Read/Query) 위해 전송하는 요청 메서드입니다.
                  </p>
                </div>

                {/* 용어 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🚦</span>
                      <span>HTTP 상태 코드</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">HTTP Status Code / 200 OK & 404 Not Found & 500 Error</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 신호등! 초록불(200 OK)이면 건너가고, 빨간불(404 못 찾음/500 고장)이면 즉시 멈추고 안내 방송 듣기.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 클라이언트의 요청에 대해 서버가 처리 결과를 3자리 숫자로 응답하는 글로벌 표준 신호입니다 (2xx: 성공, 4xx: 클라이언트 오류, 5xx: 서버 오류).
                  </p>
                </div>

                {/* 용어 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 md:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>방어적 네트워크 예외 처리</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Network Exception Handling / try-catch-finally 가드</span>
                  </div>
                  <p className="text-sm text-indigo-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 비가 올지 안 올지 몰라도 항상 가방에 3단 접이식 우산을 챙겨 다니는 똑똑한 지혜.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 무선 인터넷 단절, 서버 다운, 오염된 JSON 파싱 오류 등 외부 네트워크 환경의 변수를 항상 예측하고 <code className="text-indigo-400 font-mono">try-catch</code>로 가로채어 앱 붕괴(Crash)를 방지하는 프로그래밍 기법입니다.
                  </p>
                </div>

              </div>
            </article>

            {/* 2. 자가 점검 체크리스트 (8강 최신 표준 규격) */}
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      13강 완주를 위한 자가 점검 체크리스트
                    </h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
                  {completedCount} / 6 완료
                </span>
              </div>

              {/* 카드 전용 실시간 그라데이션 게이지 바 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* 체크리스트 6개 항목 */}
              <div className="space-y-2.5">
                
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[1]}
                    onChange={() => toggleCheck(1)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    1. 내 컴퓨터 안의 파일이 아닌 다른 서버에 데이터를 요청하는 <span className="font-mono text-indigo-700 font-bold">오픈 API</span>의 개념을 이해했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[2]}
                    onChange={() => toggleCheck(2)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    2. 자바스크립트에서 원격 데이터를 가져올 때 사용하는 <span className="font-mono text-indigo-700 font-bold">fetch()</span> 함수의 역할을 파악했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[3]}
                    onChange={() => toggleCheck(3)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    3. 데이터가 도착할 때까지 화면이 멈추지 않고 진동벨처럼 기다리는 <span className="font-mono text-indigo-700 font-bold">async / await</span>의 작동 원리를 배웠나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[4]}
                    onChange={() => toggleCheck(4)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    4. 가상 오픈 API 랩에서 배달 버튼을 누르고, 배달 영수증(JSON)과 렌더링된 화면 카드를 직접 확인했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[5]}
                    onChange={() => toggleCheck(5)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    5. 최신 AI에게 2단계 진동벨(fetch → json)과 try-catch 방어 코드를 요청하는 퀘스트를 성공시켰나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[6]}
                    onChange={() => toggleCheck(6)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    6. 인터넷 연결 오류나 서버 다운(404, 500)에 대비하는 <span className="font-mono text-indigo-700 font-bold">방어적 네트워크 프로그래밍</span>의 필요성을 기억하나요?
                  </span>
                </label>

              </div>
            </article>

            {/* 3. 100% 완주 축하 및 14강 언락 다크 펄스 카드 */}
            {isAllCompleted && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">
                      시즌 4의 첫 관문 돌파! 13강 완주를 축하합니다! 🚀🌐
                    </h4>
                    <p className="text-sm text-slate-300">
                      6가지 점검 항목을 모두 통과하여 오픈 API와 비동기 fetch 배달부, 그리고 JSON 데이터 언박싱 원리를 완전히 정복했습니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 4 · 14강: 오늘 점심 메뉴는 뭘까? 교육청 데이터로 실시간 급식 알리미 만들기</p>
                  </div>
                  <a
                    href="../14-school-lunch/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>14강으로 즉시 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 3 실전 AI 퀘스트</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('all')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>전체 코스 한눈에 보기</span>
                <Layers className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

      </main>

      {/* ===================================================================== */}
      {/* 3. 모던 푸터                                                         */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AI·코딩 24강 교육과정. All rights reserved.</span>
          <span className="text-slate-400">시즌 4 시작 · 13강: 오픈 API & Fetch 배달부</span>
        </div>
      </footer>

    </div>
  );
};
