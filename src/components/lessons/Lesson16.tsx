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
  CloudSun,
  CloudRain,
  Sun,
  Snowflake,
  Flame,
  Umbrella,
  Shirt,
  MapPin,
  Sliders,
  Radio
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

interface QuestItem {
  id: string;
  badge: string;
  level: string;
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
    badge: '기상청 격자 좌표 & 파라미터 빌더',
    level: '초급 실전 레벨 ★☆☆',
    title: '기상청 초단기실황 API 호출용 격자 좌표(nx, ny)와 발표 시간 자동 조합기 구현',
    desc: '위도·경도가 아닌 기상청 고유의 격자 정수 좌표(nx, ny)와 현재 시각 기준의 발표일자(base_date), 발표시각(base_time)을 안전하게 조합해 요청 URL을 완성하는 함수를 작성합니다.',
    situation: 'GPS 위경도(37.56, 126.97)를 기상청 API에 그대로 던지거나 40분 정각 전 이전 시간대를 계산하지 못하면 400 Bad Request가 발생합니다!',
    prompt: `[역할]
너는 공공데이터 포털과 기상청 오픈 API 연동을 담당하는 시니어 백엔드 엔지니어이자 웹 코치야.

[상황 및 요구사항]
기상청 초단기실황 API('http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst')를 호출하려고 해.
기상청은 30분 단위로 데이터를 생성하며, 매시 40분 이후에 직전 정시 데이터가 최종 확정돼.

[요청 사항]
1. URLSearchParams를 사용해 serviceKey, pageNo=1, numOfRows=10, dataType='JSON', base_date, base_time, nx, ny 파라미터를 안전하게 조합하는 buildWeatherApiUrl(nx, ny) 함수를 작성해 줘.
2. 현재 시각이 40분 이전이면 1시간 전 발표 시각으로 자동 롤백하는 안전한 base_time 계산 로직을 포함해 줘.
3. 왜 기상청은 구글 지도 같은 GPS 위도/경도가 아니라 정수 격자 좌표(nx, ny)를 요구하는지 설명해 줘.
4. 초등학생 및 입문자도 각 줄의 목적을 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '정각 직후 데이터 누락을 방지하는 40분 롤백 알고리즘과 완벽한 URLSearchParams 파이프라인을 단 3초 만에 소환합니다!',
    csSecret: '기상청은 람베르트 정각원추 투영법(Lambert Conformal Conic)으로 한반도를 5km 격자망으로 나눈 정수 좌표계(nx, ny)를 사용해 계산량을 획기적으로 줄입니다.'
  },
  {
    id: 'quest-02',
    badge: '기상 코드(T1H, PTY, REH) 정규화',
    level: '데이터 정제 & 파싱 ★★☆',
    title: '배열로 흩어진 기상청 원시 항목(item)들을 단일 날씨 상태 객체로 변환하는 정규화 함수',
    desc: '기상청 API가 보낸 복잡한 배열 형태의 원시 데이터에서 카테고리별 키값(T1H: 기온, PTY: 강수형태, REH: 습도)을 추출해 깔끔한 자바스크립트 객체로 묶어내는 정규화 파서를 구현합니다.',
    situation: 'obsrValue가 문자열 "24.2"로 전송되는데, 숫자 변환 없이 더하면 "24.2" + 5 = "24.25"라는 엉터리 기온이 계산됩니다!',
    prompt: `[역할]
너는 공공데이터 JSON 파싱과 데이터 정규화(Normalization) 전문가야.

[문제 상황]
기상청 API 응답 json.response.body.items.item은 다음과 같은 배열 형태야:
[
  { "category": "T1H", "obsrValue": "24.2" },
  { "category": "PTY", "obsrValue": "0" },
  { "category": "REH", "obsrValue": "45" },
  { "category": "WSD", "obsrValue": "2.1" }
]

[해결 요청]
1. 위 배열을 .reduce() 또는 순회문으로 탐색해 { temperature: 24.2, rainType: 0, humidity: 45, windSpeed: 2.1 } 단일 객체로 정규화하는 parseWeatherItems(itemArray) 함수를 작성해 줘.
2. 문자열 obsrValue를 parseFloat/parseInt를 사용해 안전한 숫자로 변환하고 NaN 결측치를 감지해 Fallback 기본값을 지정할 것.
3. 데이터 정규화가 프론트엔드 UI 렌더링 코드의 복잡도를 어떻게 70% 이상 낮춰주는지 설명해 줘.
4. 초보자도 쉽게 읽을 수 있도록 친절한 한국어 주석을 달아줘.`,
    reaction: '지저분한 배열 항목을 단 한 번의 순회로 깨끗한 수치 상태 모델로 압축해 런타임 버그를 차단합니다!',
    csSecret: '데이터 정규화(Normalization)는 외부 서버의 제각각인 규격을 애플리케이션 표준 모델로 일원화해 유지보수성을 극대화하는 기법입니다.'
  },
  {
    id: 'quest-03',
    badge: '기온별 5단계 맞춤 의류 알고리즘',
    level: '조건 분기 알고리즘 ★★★',
    title: '임계값(28℃, 20℃, 12℃, 5℃)에 따른 상·하의·외투 5단계 판정 알고리즘',
    desc: '기온에 따라 28℃ 이상(한여름), 20~27℃(초여름/봄가을), 12~19℃(환절기), 5~11℃(늦가을), 4℃ 이하(한겨울)의 5개 구간을 한치의 오차 없이 판정하는 추천 엔진을 작성합니다.',
    situation: '조건문에서 등호(>=)나 부등호 범위를 잘못 적으면 20도에서 두 조건이 동시에 걸리거나 추천이 증발합니다!',
    prompt: `[역할]
너는 패션 테크 알고리즘과 인터랙션 설계를 연구하는 프론트엔드 엔지니어 개발자야.

[요구사항]
기온(temperature)을 전달받아 사용자에게 오늘의 최적 의류를 추천하는 getOutfitRecommendation(temp) 함수를 작성하려고 해.

[해결 요청]
1. 다음 5단계 임계값에 따라 { top, bottom, outer, advice } 객체를 완벽히 반환할 것:
   - 28℃ 이상: 민소매/반팔, 반바지, 선글라스, "폭염 주의! 린넨 소재 옷 추천"
   - 20℃ ~ 27℃: 얇은 긴팔/반팔, 면바지/슬랙스, 얇은 가디건, "쾌적하고 산뜻한 날씨"
   - 12℃ ~ 19℃: 셔츠/맨투맨, 청바지, 가디건/바람막이, "아침저녁 쌀쌀한 환절기"
   - 5℃ ~ 11℃: 기모 후드티, 두꺼운 바지, 트렌치코트/경량패딩, "쌀쌀하니 외투 필수"
   - 4℃ 이하: 두꺼운 니트, 방한 기모바지, 롱패딩/목도리/장갑, "한파 경보! 완전 무장"
2. 경계값(28, 20, 12, 5)에서 if-else if 구조가 겹침 없이 정확하게 동작하도록 작성할 것.
3. 매 줄마다 초보 학생이 이해할 수 있도록 친절한 한국어 주석을 달아줘.`,
    reaction: '날씨 숫자 하나만 주면 머리부터 발끝까지 완벽한 패션을 제안하는 스마트 코디네이터 로직을 완성합니다!',
    csSecret: '임계값 분기(Threshold Branching)는 연속적인 아날로그 물리량을 이산적인 의사결정 카테고리로 나누는 규칙 기반 인공지능(Rule-based AI)의 기초입니다.'
  },
  {
    id: 'quest-04',
    badge: '강수 형태(PTY) 우산 조건부 렌더링',
    level: '조건부 UI & 반응형 테마 ★★☆',
    title: '비·눈 감지 시 통통 튀는 노란 우산 알림과 날씨 상태별 배경 테마 카멜레온 전환',
    desc: '강수형태(PTY > 0)일 때 우산 챙기기 알림 뱃지를 통통 튀는 애니메이션과 함께 띄우고, 맑음·비·눈·폭염에 맞춰 배경 그라데이션을 즉시 전환하는 인터랙션 코드를 작성합니다.',
    situation: '날씨가 맑음으로 바뀌었을 때 우산 뱃지를 다시 숨기지 않으면 하루 종일 우산을 챙기라는 버그가 남습니다!',
    prompt: `[역할]
너는 상태 기반 UI(State-driven UI)와 동적 테마 디자인 시스템 전문가야.

[상황]
사용자 화면의 #umbrella-alert-badge는 평소엔 hidden 상태여야 해.
비(PTY=1), 진눈깨비(PTY=2), 눈(PTY=3), 소나기(PTY=4)일 때만 통통 튀는 애니메이션(animate-bounce)과 함께 화면에 나타나야 해.

[요청 사항]
1. weatherData.rainType > 0 여부에 따라 classList.remove('hidden') / classList.add('hidden')을 안전하게 토글하는 updateUmbrellaAlert(rainType) 함수를 작성해 줘.
2. 맑음(하늘색 그라데이션), 비(남색/파란색), 눈(청록색), 폭염(주황색/붉은색) 4가지 상태에 맞추어 #weather-banner-box의 Tailwind CSS 배경 클래스를 교체하는 renderWeatherTheme(temp, rainType) 함수를 구현해 줘.
3. DOM 요소가 없을 때 에러가 나지 않도록 널 가드(Null Guard)를 적용해 줘.
4. 초등학생도 이해할 수 있도록 친절한 한국어 주석을 달아줘.`,
    reaction: '날씨가 바뀌자마자 화면 분위기와 우산 신호등이 마법처럼 동기화되는 카멜레온 UI 코드를 완성합니다!',
    csSecret: '조건부 렌더링(Conditional Rendering)은 데이터의 상태 변화(State Change)를 감지하여 시각적 표현(View)을 동기화하는 프론트엔드의 핵심 원리입니다.'
  },
  {
    id: 'quest-05',
    badge: '결측치(-999) 방어 & 슬라이더 양방향 연동',
    level: '결측치 처리 & 이벤트 연동 ★★★',
    title: '기상청 점검 시간 결측치(-999) 안전 대체와 기온 슬라이더 즉시 반응형 인터랙션',
    desc: '점검 시간에 전송되는 -999 결측치나 통신 실패를 감지해 계절 평균 온도로 자동 보정하고, 사용자가 슬라이더를 움직일 때마다 실시간으로 옷차림 카드가 부드럽게 재계산되는 양방향 인터랙션을 완성합니다.',
    situation: '-999를 숫자 그대로 연산에 투입하면 "체감온도 -1020도이므로 우주복을 입으세요" 같은 치명적 오류가 발생합니다!',
    prompt: `[역할]
너는 결측치 처리(Data Imputation)와 반응형 UI 이벤트 처리를 전문으로 하는 시니어 프론트엔드 개발자야.

[상황 및 요구사항]
1. 기상청 API에서 기온(T1H) 값이 -999(점검 결측치)이거나 null로 들어올 때, 직전 관측치 또는 기본 안전값(20℃)으로 자동 대체하는 safeTemperature(rawVal, fallback) 유틸 함수 만들기
2. 화면의 <input type="range"> 기온 슬라이더의 input 이벤트 리스너를 작성하여, 슬라이더를 드래그하는 순간 실시간으로 기온 뱃지와 5단계 옷차림 추천 카드가 즉시 업데이트되도록 연결하기

[요청 사항]
1. 결측치 방어 로직과 슬라이더 실시간 업데이트 이벤트 리스너를 자바스크립트로 구현해 줘.
2. 실무에서 결측치(Missing Value)를 방치했을 때 어떤 비즈니스 사고가 발생하는지 쉬운 예시로 설명해 줘.
3. 매 줄마다 초보 학생을 위한 친절한 한국어 주석을 달아줘.`,
    reaction: '결측치에도 끄떡없는 견고한 안전망과 0.01초 만에 반응하는 매끄러운 슬라이더 인터랙션을 구축합니다!',
    csSecret: '데이터 보정(Data Imputation)과 방어적 프로그래밍(Defensive Programming)은 불안정한 외부 API 환경에서도 서비스를 무중단 유지하는 필수 아키텍처입니다.'
  }
];

interface WeatherScenario {
  temp: number;
  pty: number;
  sky: number;
  reh: number;
  pop: number;
  summary: string;
  bannerTitle: string;
  bannerSubtitle: string;
  themeClass: string;
  iconName: 'sun' | 'cloud-rain' | 'snowflake' | 'flame';
}

const CITY_PRESETS: Record<string, { name: string; nx: number; ny: number }> = {
  'seoul': { name: '서울 종로구 광화문', nx: 60, ny: 127 },
  'busan': { name: '부산 해운대 해변', nx: 98, ny: 75 },
  'jeju': { name: '제주 서귀포 올레길', nx: 52, ny: 38 },
  'pyeongchang': { name: '강원 평창 대관령', nx: 77, ny: 122 }
};

const SCENARIOS: Record<string, WeatherScenario> = {
  'sunny': {
    temp: 24.2,
    pty: 0,
    sky: 1,
    reh: 45,
    pop: 10,
    summary: '기분 좋은 맑은 하늘 (체감 25.0℃)',
    bannerTitle: '산뜻한 봄가을 날씨',
    bannerSubtitle: '활동하기 딱 좋은 쾌적한 온도예요',
    themeClass: 'from-sky-500 to-blue-600',
    iconName: 'sun'
  },
  'rainy': {
    temp: 16.0,
    pty: 1,
    sky: 4,
    reh: 85,
    pop: 80,
    summary: '소나기 주의보 (체감 15.2℃)',
    bannerTitle: '비 내리는 쌀쌀한 날씨',
    bannerSubtitle: '노란 우산과 방수 외투를 챙기세요!',
    themeClass: 'from-indigo-700 to-slate-900',
    iconName: 'cloud-rain'
  },
  'cold': {
    temp: 1.5,
    pty: 3,
    sky: 4,
    reh: 70,
    pop: 90,
    summary: '한파 및 눈 소식 (체감 -3.5℃)',
    bannerTitle: '매서운 겨울 눈 소식',
    bannerSubtitle: '롱패딩과 장갑으로 완전 무장하세요!',
    themeClass: 'from-slate-700 to-cyan-900',
    iconName: 'snowflake'
  },
  'hot': {
    temp: 32.8,
    pty: 0,
    sky: 1,
    reh: 78,
    pop: 15,
    summary: '폭염 특보 발령 (체감 35.0℃)',
    bannerTitle: '이글이글 무더운 한여름',
    bannerSubtitle: '시원한 물병과 반팔 차림 필수예요!',
    themeClass: 'from-amber-600 to-rose-700',
    iconName: 'flame'
  }
};

export const Lesson16: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<StageTab>('stage1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 시뮬레이터 상태
  const [cityKey, setCityKey] = useState('seoul');
  const [scenarioKey, setScenarioKey] = useState('sunny');
  const [currentTemp, setCurrentTemp] = useState(24.2);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // 8강 표준 체크리스트 상태 (6항목)
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_16_checklist');
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleCheck = (index: number) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);
    localStorage.setItem('ai_lesson_16_checklist', JSON.stringify(next));
  };

  const completedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const currentScene = SCENARIOS[scenarioKey];
  const currentCity = CITY_PRESETS[cityKey];

  const calculateOutfit = (temp: number) => {
    if (temp >= 28) {
      return {
        top: '🎽 민소매, 얇은 반팔 티셔츠',
        bottom: '🩳 반바지, 통풍 린넨 팬츠',
        acc: '🕶️ 선글라스, 자외선 차단제'
      };
    } else if (temp >= 20) {
      return {
        top: '👕 얇은 긴팔 셔츠 / 티셔츠',
        bottom: '👖 편안한 면바지 / 슬랙스',
        acc: '🧥 얇은 가디건, 자외선차단제'
      };
    } else if (temp >= 12) {
      return {
        top: '👔 맨투맨, 옥스포드 셔츠',
        bottom: '👖 청바지, 면바지',
        acc: '🧥 니트 가디건, 바람막이 외투'
      };
    } else if (temp >= 5) {
      return {
        top: '🧶 기모 후드티, 두꺼운 니트',
        bottom: '👖 도톰한 슬랙스, 청바지',
        acc: '🧥 경량 패딩, 울 코트'
      };
    } else {
      return {
        top: '🧣 방한 내의, 두꺼운 스웨터',
        bottom: '👖 방한 기모 바지',
        acc: '🧤 롱패딩, 털 목도리, 장갑'
      };
    }
  };

  const currentOutfit = calculateOutfit(currentTemp);

  const handleSelectScenario = (key: string) => {
    setScenarioKey(key);
    setCurrentTemp(SCENARIOS[key].temp);
  };

  const handleFetchWeather = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      setIsMeasuring(false);
      handleSelectScenario(scenarioKey);
    }, 350);
  };

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'cloud-rain':
        return <CloudRain className="w-7 h-7" />;
      case 'snowflake':
        return <Snowflake className="w-7 h-7" />;
      case 'flame':
        return <Flame className="w-7 h-7" />;
      case 'sun':
      default:
        return <Sun className="w-7 h-7" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
      
      {/* ======================================================================= */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃)                     */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* 좌측 브랜드 로고 & 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  시즌 4 · 16강: 오늘 우산 챙길까? 기상청 데이터 연동 날씨 & 옷차림 코디네이터
                </span>
              </div>
            </div>
          </div>

          {/* 우측 4단계 스위처 버튼 그룹 (20px 원형 배지) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              onClick={() => setCurrentStage('stage1')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentStage === 'stage1'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage1' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>미션 & 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStage('stage2')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentStage === 'stage2'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage2' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>가상 코디 랩</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentStage === 'stage3'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage3' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStage('stage4')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentStage === 'stage4'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage4' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                4
              </span>
              <span>용어&체크리스트</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => setCurrentStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                currentStage === 'all'
                  ? 'bg-white text-sky-700 shadow-sm'
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
          onClick={() => setCurrentStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage1' ? 'text-sky-700 bg-sky-50' : 'text-slate-600'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage2' ? 'text-sky-700 bg-sky-50' : 'text-slate-600'
          }`}
        >
          2. 코디 랩
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage3' ? 'text-sky-700 bg-sky-50' : 'text-slate-600'
          }`}
        >
          3. AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage4' ? 'text-sky-700 bg-sky-50' : 'text-slate-600'
          }`}
        >
          4. 용어&점검
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'all' ? 'text-sky-700 bg-sky-50' : 'text-slate-500'
          }`}
        >
          전체
        </button>
      </div>

      {/* ======================================================================= */}
      {/* 2. 메인 워크스페이스 (단일 컨테이너 몰입형 레이아웃)                   */}
      {/* ======================================================================= */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* =================================================================== */}
        {/* STAGE 01: 퀘스트 미션 브리핑 & 핵심 개념 원리                      */}
        {/* =================================================================== */}
        {(currentStage === 'stage1' || currentStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-1-title">
            
            {/* 1. 미션 브리핑 히어로 카드 */}
            <article className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-sky-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    시즌 4 · 웹 앱 & 오픈 데이터 프로젝트
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    기온별 맞춤 의류 추천 알고리즘
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 id="stage-1-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    현관문 앞 5분의 고민 해결! 🚪 나만의 스마트 날씨 & 옷차림 코디네이터
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    아침에 일어났을 때 "오늘 패딩 입을까, 가벼운 셔츠 입을까?", "소나기 온다는데 우산 챙겨야 할까?" 고민한 적 있나요? 기상청 슈퍼컴퓨터가 보낸 실시간 관측 데이터(기온 T1H, 강수형태 PTY, 하늘상태 SKY)를 받아와, 컴퓨터가 기온 구간별 옷차림과 비 소식을 똑똑하게 분석해 주는 <strong>인공지능 스타일리스트 웹앱</strong>을 직접 완성합니다!
                  </p>
                </div>

                {/* 3대 도전 미션 목표 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <CloudSun className="w-4 h-4" />
                      <span>1. 기상청 초단기 관측 연동</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      격자 좌표(nx, ny) 기반으로 기온(T1H), 강수형태(PTY), 하늘상태(SKY) 패킷을 안전하게 수신합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <Shirt className="w-4 h-4" />
                      <span>2. 기온별 5단계 의류 알고리즘</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      4℃, 12℃, 20℃, 28℃ 임계값에 따라 롱패딩부터 반팔까지 최적의 상의·하의·외투를 판정합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Umbrella className="w-4 h-4" />
                      <span>3. 강수 조건부 우산 신호등</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      비·눈(PTY &gt; 0) 소식 감지 시 노란 우산 알림 뱃지를 조건부 렌더링하고 카멜레온 테마를 적용합니다.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 핵심 개념 원리 탐구 카드 (3구리드 Bento) */}
            <section className="space-y-4" aria-labelledby="principles-heading">
              <div className="flex items-center justify-between">
                <h3 id="principles-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-sky-600" />
                  <span>날씨 코디 개발을 위한 3대 핵심 개념 원리</span>
                </h3>
                <span className="text-sm font-mono text-slate-500">METEOROLOGY &amp; UI ARCHITECTURE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 원리 1 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">1. 기상청 4대 숫자 암호</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      서버가 보낸 영문 약자 T1H(기온), PTY(강수형태: 0없음/1비/3눈), SKY(하늘상태), REH(습도)를 디코딩합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/60 text-sm text-sky-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      🧸 <span className="text-sky-950">어린이 비유</span>
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      기상 위성과 슈퍼컴퓨터가 날씨 신호등처럼 보내주는 지구의 생생한 체온 측정기!
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 pt-1 border-t border-slate-100">
                    <strong className="text-slate-700 font-semibold">🎓 개발자 원리:</strong> 표준 기상 관측 시계열 데이터 디코딩
                  </div>
                </article>

                {/* 원리 2 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">2. 임계값(Threshold) 분기</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      기온 경계 수치(28℃, 20℃, 12℃, 5℃)에 따라 조건문(if...else)으로 상·하의·외투를 판정합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/60 text-sm text-indigo-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      🧸 <span className="text-indigo-950">어린이 비유</span>
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      "여기서부터는 패딩을 입어야 해!" 하고 똑똑하게 기준선을 그어주는 스마트 자!
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 pt-1 border-t border-slate-100">
                    <strong className="text-slate-700 font-semibold">🎓 개발자 원리:</strong> 연속 수치 구간화(Binning) & 조건 분기
                  </div>
                </article>

                {/* 원리 3 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Umbrella className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">3. 조건부 렌더링 & 테마</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      비가 올 때만 우산 뱃지를 띄우고, 날씨에 따라 하늘색·남색·주황색으로 배경 테마를 동적 교체합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-sm text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      🧸 <span className="text-amber-950">어린이 비유</span>
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      비가 오면 우산 그림을 꺼내고, 해가 뜨면 선글라스를 띄워주는 변신 화면!
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 pt-1 border-t border-slate-100">
                    <strong className="text-slate-700 font-semibold">🎓 개발자 원리:</strong> 상태 기반 동적 DOM 제어 (Conditional UI)
                  </div>
                </article>
              </div>

              {/* 주니어 개발자 제1원칙 알림창 */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-slate-800 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <strong className="font-bold text-sky-950 block">주니어 개발자 제1원칙: 기상청 점검 시간 결측치(-999)를 방어하라!</strong>
                  <p className="text-slate-700 leading-relaxed">
                    기상청 서버 점검 시간이나 통신 장애 시 기온이 누락되거나 <code className="font-mono text-sky-800 font-bold">-999</code> 같은 결측치가 날아올 수 있습니다. 방어 코드 없이 계산하면 "영하 999도이므로 롱패딩을 입으세요!"라는 황당한 오류가 발생합니다. <code className="font-mono text-sky-800 font-bold">if (temp === -999 || isNaN(temp))</code>로 가로채어 직전 유효 관측값이나 기본 계절 평균 기온으로 대체하는 방어 로직이 필수입니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 가상 코디 랩 실습하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 시뮬레이터 (실시간 날씨 & 코디 라이브 랩)  */}
        {/* =================================================================== */}
        {(currentStage === 'stage2' || currentStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-2-title">
            
            {/* 상단 안내 배너 */}
            <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-sky-800/40">
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    STAGE 02 · 가상 날씨 &amp; 코디 랩
                  </span>
                  <span className="text-sm font-mono text-slate-300">Weather &amp; Styling Engine</span>
                </div>
                <h2 id="stage-2-title" className="text-xl sm:text-2xl font-black text-white">
                  실시간 날씨 측정 &amp; 기온별 옷차림 추천 시뮬레이터
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  원하는 도시나 시나리오를 선택하고 기온 슬라이더를 움직여 보세요! 기온에 따라 가디건부터 패딩까지 최적의 옷차림이 실시간으로 바뀌며, 비나 눈이 올 때는 '노란 우산 챙기기' 알림이 켜집니다.
                </p>
              </div>
            </div>

            {/* 지역 및 시나리오 컨트롤러 카드 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  <span>우리 동네 날씨 탐색 및 시나리오</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-sm font-bold border ${
                  isMeasuring
                    ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isMeasuring ? '기상청 관측망 수신 중... 📡' : '실시간 측정 완료 (200 OK) 🎉'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 지역 선택 */}
                <div className="space-y-1.5">
                  <label htmlFor="select-city" className="block text-sm font-bold text-slate-700">
                    지역 선택 (기상청 격자 nx, ny 좌표)
                  </label>
                  <select
                    id="select-city"
                    value={cityKey}
                    onChange={e => setCityKey(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                  >
                    <option value="seoul">[서울] 종로구 광화문 (격자: 60, 127)</option>
                    <option value="busan">[부산] 해운대 해변 (격자: 98, 75)</option>
                    <option value="jeju">[제주] 서귀포 올레길 (격자: 52, 38)</option>
                    <option value="pyeongchang">[강원] 평창 대관령 (격자: 77, 122)</option>
                  </select>
                </div>

                {/* 기온 슬라이더 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="temp-slider" className="block text-sm font-bold text-slate-700">
                      기온 직접 조절 (시뮬레이션)
                    </label>
                    <span className="text-sm font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      {currentTemp.toFixed(1)}℃
                    </span>
                  </div>
                  <input
                    type="range"
                    id="temp-slider"
                    min="-10"
                    max="38"
                    step="0.5"
                    value={currentTemp}
                    onChange={e => setCurrentTemp(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 mt-2"
                  />
                </div>
              </div>

              {/* 날씨 4대 시나리오 원클릭 칩 */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-sm font-bold text-slate-700">날씨 시나리오 빠른 적용:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSelectScenario('sunny')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      scenarioKey === 'sunny'
                        ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ☀️ 맑음 (24.2℃)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectScenario('rainy')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      scenarioKey === 'rainy'
                        ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🌧️ 소나기 (16.0℃)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectScenario('cold')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      scenarioKey === 'cold'
                        ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ❄️ 한파·눈 (1.5℃)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectScenario('hot')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      scenarioKey === 'hot'
                        ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🔥 폭염 (32.8℃)
                  </button>
                </div>
              </div>

              {/* 관측 실행 버튼 */}
              <button
                type="button"
                onClick={handleFetchWeather}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>⛅ 실시간 날씨 측정 &amp; 코디 추천하기!</span>
              </button>
            </div>

            {/* ⛅ 비주얼 실시간 날씨 & 코디네이터 디스플레이 카드 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
              
              {/* 카드 상단: 지역 & 기온 메인 헤더 */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <strong className="text-lg sm:text-xl font-black text-slate-900 block">
                    {currentCity.name}
                  </strong>
                  <span className="text-sm text-slate-500 font-medium">
                    {currentScene.summary}
                  </span>
                </div>

                {/* 기온 뱃지 */}
                <div className="text-right">
                  <span className="text-3xl font-black text-sky-600 font-mono tracking-tight block">
                    {currentTemp.toFixed(1)}℃
                  </span>
                  <span className={`text-sm font-bold px-3 py-0.5 rounded-full border ${
                    currentScene.pty > 0
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : currentTemp >= 30
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {currentScene.pty > 0
                      ? (currentScene.pty === 3 ? '❄️ 눈 소식 (강수 90%)' : '🌧️ 비 소식 (강수 80%)')
                      : currentTemp >= 30
                      ? '🔥 폭염 (강수 15%)'
                      : '☀️ 맑음 (강수 10%)'}
                  </span>
                </div>
              </div>

              {/* 중앙 테마 배너 & 우산 알림 */}
              <div className={`p-5 rounded-2xl bg-gradient-to-r ${currentScene.themeClass} text-white space-y-2 relative overflow-hidden transition-all duration-300 shadow-sm`}>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      {renderWeatherIcon(currentScene.iconName)}
                    </div>
                    <div>
                      <strong className="text-lg font-bold block">
                        {currentScene.bannerTitle}
                      </strong>
                      <span className="text-sm text-sky-100">
                        {currentScene.bannerSubtitle}
                      </span>
                    </div>
                  </div>

                  {/* 우산 경보 뱃지 (조건부 표시) */}
                  {(currentScene.pty > 0 || currentScene.pop >= 60) && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-sm animate-bounce">
                      <Umbrella className="w-4 h-4" />
                      <span>우산 챙기기!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 👔 오늘의 맞춤 옷차림 추천 가이드 박스 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Shirt className="w-5 h-5 text-sky-600" />
                  <span>AI 스타일리스트의 추천 옷차림</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-sm text-slate-400 font-bold block">상의 (Top)</span>
                    <strong className="text-slate-900 font-bold block text-sm">{currentOutfit.top}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-sm text-slate-400 font-bold block">하의 (Bottom)</span>
                    <strong className="text-slate-900 font-bold block text-sm">{currentOutfit.bottom}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-sm text-slate-400 font-bold block">외투 &amp; 소지품</span>
                    <strong className="text-sky-700 font-bold block text-sm">{currentOutfit.acc}</strong>
                  </div>
                </div>
              </div>

              {/* 세부 기상 관측 메타 수치 */}
              <div className="grid grid-cols-3 gap-3 text-center text-sm font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-sm font-sans font-bold">습도 (REH)</span>
                  <strong className="text-slate-800 text-base">{currentScene.reh}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-sm font-sans font-bold">강수형태 (PTY)</span>
                  <strong className="text-slate-800 text-base">
                    {currentScene.pty === 0 ? '0 (강수 없음)' : currentScene.pty === 1 ? '1 (비)' : '3 (눈)'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-sm font-sans font-bold">격자 좌표</span>
                  <strong className="text-slate-800 text-base">{currentCity.nx}, {currentCity.ny}</strong>
                </div>
              </div>

            </div>

            {/* JSON 영수증 뷰어 */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                  <Code className="w-4 h-4" />
                  <span>기상청 초단기실황 응답 영수증 뷰어 (KMA Raw Data)</span>
                </div>
                <span className="text-sm font-mono text-slate-400">HTTP 200 OK</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-sm text-sky-300 whitespace-pre-wrap overflow-x-auto leading-relaxed border border-slate-800 max-h-48 overflow-y-auto">
                {JSON.stringify(
                  {
                    location: currentCity.name,
                    gridCoordinate: { nx: currentCity.nx, ny: currentCity.ny },
                    weather: {
                      T1H_temperature: `${currentTemp.toFixed(1)}℃`,
                      PTY_precipitationType: currentScene.pty,
                      SKY_skyStatus: currentScene.pty > 0 ? 4 : 1,
                      REH_humidity: `${currentScene.reh}%`
                    },
                    recommendation: {
                      top: currentOutfit.top,
                      bottom: currentOutfit.bottom,
                      outer: currentOutfit.acc,
                      umbrellaRequired: currentScene.pty > 0 || currentScene.pop >= 60
                    }
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* 하단 이전/다음 네비게이션 */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStage('stage1')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 미션 브리핑</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 실전 AI 퀘스트 도전하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 03: 실전 최신 AI 5대 킬러 퀘스트 (QUEST 01 ~ QUEST 05 고정)   */}
        {/* =================================================================== */}
        {(currentStage === 'stage3' || currentStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-3-title">
            
            {/* 상단 헤더 배너 */}
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-sky-800/40">
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    STAGE 03 · 5대 실전 AI 퀘스트
                  </span>
                  <span className="text-sm font-mono text-slate-300">ChatGPT &amp; Gemini 프롬프트 공작소</span>
                </div>
                <h2 id="stage-3-title" className="text-xl sm:text-2xl font-black text-white">
                  실전 최신 AI 5대 킬러 퀘스트 마스터 🎯
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  원클릭으로 프롬프트를 복사하여 ChatGPT나 Gemini 창에 붙여넣어 보세요! 기상청 격자 좌표 연동, T1H·PTY 4대 기상 코드 정규화, 기온별 5단계 옷차림 알고리즘, 조건부 우산 알림, -999 결측치 예외 가드를 AI와 함께 완벽히 정복합니다.
                </p>
              </div>
            </div>

            {/* 5대 퀘스트 카드 목록 */}
            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article key={q.id} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-xl text-white font-black text-sm ${
                        idx === 0 ? 'bg-sky-600' :
                        idx === 1 ? 'bg-indigo-600' :
                        idx === 2 ? 'bg-emerald-600' :
                        idx === 3 ? 'bg-amber-600' : 'bg-teal-600'
                      }`}>
                        QUEST 0{idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold text-sm">
                        {q.badge}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-slate-400">{q.level}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{q.desc}</p>
                  </div>

                  {/* 실전 함정 상황 */}
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">실전 함정:</strong> {q.situation}
                    </div>
                  </div>

                  {/* 복사 가능한 프롬프트 박스 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-sky-600" />
                        실전 AI 프롬프트 (원클릭 복사)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {copiedId === q.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">복사됨! ✨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>복사하기</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {q.prompt}
                    </div>
                  </div>

                  {/* AI 소환 마법 & CS 해설 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
                    <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5">
                        ✨ <span className="text-sky-900">AI 충격 반응 &amp; 소환 마법</span>
                      </span>
                      <p className="text-slate-700 leading-relaxed text-sm">{q.reaction}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        💡 <span className="text-slate-700">컴퓨터 과학 비밀 해설</span>
                      </span>
                      <p className="text-slate-600 leading-relaxed text-sm">{q.csSecret}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 하단 이전/다음 네비게이션 */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 가상 코디 랩</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStage('stage4')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 용어 돋보기 &amp; 자가 점검</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 04: 전문 용어 돋보기 & 자가 점검 체크리스트 (8강 최신 표준)    */}
        {/* =================================================================== */}
        {(currentStage === 'stage4' || currentStage === 'all') && (
          <section className="space-y-10" aria-labelledby="stage-4-title">
            
            {/* 1. 🔍 주니어 개발자를 위한 전문 용어 돋보기 */}
            <section className="space-y-4" aria-labelledby="glossary-heading">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 id="glossary-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ZoomIn className="w-5 h-5 text-sky-600" />
                    <span>주니어 개발자를 위한 전문 용어 돋보기</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    오늘 실습에서 사용된 핵심 기상 데이터 및 프론트엔드 전문 용어를 정복해 보세요.
                  </p>
                </div>
                <span className="text-sm font-mono text-slate-400">GLOSSARY</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* 용어 1: 기상 관측 데이터 */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-sky-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-sky-300 flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>1. 기상 관측 데이터</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Meteorological Observation Data (Weather Forecast API)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-sky-900/60 text-sky-200 border border-sky-700/60 font-mono shrink-0">
                      공공/센서데이터
                    </span>
                  </div>
                  <div className="text-sm text-sky-200 bg-sky-950/40 p-3 rounded-xl border border-sky-500/30">
                    🧸 <strong className="text-sky-300">어린이 비유:</strong> "하늘 위 기상 위성과 슈퍼컴퓨터가 날씨 신호등처럼 보내주는 지구의 생생한 체온 측정기!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 기온, 습도, 기압, 풍향, 풍속, 강수량 등 지구 대기 상태를 측정한 물리량 데이터로, 기상청 공공 API를 통해 실시간 및 초단기 예보 형태로 표준 제공되는 시계열 관측 정보입니다.
                  </p>
                </article>

                {/* 용어 2: 조건부 화면 표시 (조건부 렌더링) */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-indigo-300 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>2. 조건부 화면 표시 (조건부 렌더링)</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Conditional Rendering (If-Else UI Logic)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 font-mono shrink-0">
                      UI/상태제어
                    </span>
                  </div>
                  <div className="text-sm text-indigo-200 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30">
                    🧸 <strong className="text-indigo-300">어린이 비유:</strong> "비가 오면 우산 그림을 꺼내고, 해가 쨍쨍하면 선글라스 낀 태양 그림을 마법처럼 바꿔 띄워주는 변신 화면!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 특정 조건(데이터 상태, 사용자 입력 등)의 참/거짓 평가 결과에 따라 다른 UI 컴포넌트나 스타일 요소를 동적으로 화면에 마운트(렌더링)하는 프론트엔드 제어 기법입니다.
                  </p>
                </article>

                {/* 용어 3: 경계 판정 기준값 (임계값) */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-emerald-300 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>3. 경계 판정 기준값 (임계값)</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Threshold Value (Decision Boundary)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 font-mono shrink-0">
                      알고리즘/수학
                    </span>
                  </div>
                  <div className="text-sm text-emerald-200 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
                    🧸 <strong className="text-emerald-300">어린이 비유:</strong> "'여기서부터는 패딩을 입어야 해!', '여기서부터는 우산을 챙겨야 해!' 하고 똑똑하게 기준선을 그어주는 스마트 자!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 시스템이나 알고리즘에서 상태의 전환이나 동작의 변화를 유발하는 임계 경계치(Boundary Condition)로, 조건 분기문(if)의 참/거짓을 가르는 기준 수치입니다.
                  </p>
                </article>

                {/* 용어 4: 기상청 격자 좌표계 */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-purple-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-purple-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>4. 기상청 격자 좌표계</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Grid Coordinate System (nx, ny Integer Grid)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/60 font-mono shrink-0">
                      지리정보/수학
                    </span>
                  </div>
                  <div className="text-sm text-purple-200 bg-purple-950/40 p-3 rounded-xl border border-purple-500/30">
                    🧸 <strong className="text-purple-300">어린이 비유:</strong> "우리나라 지도를 바둑판처럼 촘촘히 나누어, 우리 동네가 몇 번째 가로줄, 세로줄에 있는지 딱 짚어주는 바둑판 지도 좌표!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 둥근 지구 표면을 평면 투영(람베르트 정각원추도법)하여 한반도 전역을 일정한 간격의 격자점(nx, ny 정수쌍)으로 변환해 기상 예보를 부여하는 공간 좌표 체계입니다.
                  </p>
                </article>

                {/* 용어 5: 데이터 결측치 방어 */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-teal-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-teal-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>5. 데이터 결측치 방어</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Missing Data Handling &amp; Fallback Imputation (-999 Guard)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-teal-900/60 text-teal-200 border border-teal-700/60 font-mono shrink-0">
                      런타임 안정성
                    </span>
                  </div>
                  <div className="text-sm text-teal-200 bg-teal-950/40 p-3 rounded-xl border border-teal-500/30">
                    🧸 <strong className="text-teal-300">어린이 비유:</strong> "서버 점검으로 기온계가 고장 나도 영하 999도로 착각하지 않고, 직전 온도를 기억해 내는 영리한 기억 상자!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 데이터 수집이나 통신 오류로 인해 누락되거나 특수 결측 표기값(-999 등)이 유입되었을 때, 이를 감지하여 직전 유효 관측값이나 기본 대체값(Fallback)으로 보정해 시스템 장애를 방지하는 데이터 정제 기법입니다.
                  </p>
                </article>

              </div>
            </section>

            {/* 2. 자가 점검 체크리스트 (8강 최신 규격 100% 준수) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6" aria-labelledby="checklist-title">
              
              {/* 체크리스트 헤더 */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <h3 id="checklist-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    <span>16강 학습 성취도 자가 점검 체크리스트</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    6개 항목을 모두 완료하면 다음 17강(로딩 스피너와 네트워크 예외 처리) 프로젝트가 잠금 해제됩니다.
                  </p>
                </div>
                
                {/* 실시간 알약 카운터 배지 */}
                <div className="flex items-center gap-2">
                  <span className={`px-3.5 py-1.5 rounded-full font-bold text-sm ${
                    completedCount === 6
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {completedCount} / 6 완료
                  </span>
                </div>
              </div>

              {/* 카드 내부 실시간 그라데이션 게이지 바 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600 font-medium">
                  <span>미션 달성률</span>
                  <span className="font-mono font-bold text-emerald-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 체크리스트 6개 항목 */}
              <div className="space-y-3">
                
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[0]}
                    onChange={() => handleToggleCheck(0)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong>기상청 오픈 API 연동:</strong> 격자 좌표(nx, ny)와 발표 일시 규격에 맞추어 초단기실황 데이터를 호출할 수 있다.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[1]}
                    onChange={() => handleToggleCheck(1)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong>기상 코드 정규화:</strong> T1H(기온), PTY(강수형태), REH(습도) 배열 데이터를 단일 날씨 상태 객체로 파싱할 수 있다.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[2]}
                    onChange={() => handleToggleCheck(2)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong>기온별 5단계 옷차림 알고리즘:</strong> 4℃, 12℃, 20℃, 28℃ 임계값에 따라 상의·하의·외투 추천을 분기할 수 있다.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[3]}
                    onChange={() => handleToggleCheck(3)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong>강수 조건부 우산 알림:</strong> 비나 눈(PTY &gt; 0) 발생 시 노란 우산 뱃지를 화면에 조건부로 렌더링할 수 있다.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[4]}
                    onChange={() => handleToggleCheck(4)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong>날씨 반응형 테마 UI:</strong> 맑음, 비, 눈, 폭염 등 날씨 상태에 따라 배경색과 아이콘을 동적으로 전환할 수 있다.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[5]}
                    onChange={() => handleToggleCheck(5)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    <strong>결측치(-999) 예외 방어:</strong> 기상청 서버 점검 시 -999 결측치나 통신 오류를 Fallback 기본값으로 안전하게 방어할 수 있다.
                  </span>
                </label>

              </div>

              {/* 100% 완주 축하 및 17강 언락 다크 펄스 카드 */}
              {completedCount === 6 && (
                <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-500/50 shadow-xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">16강 미션 완벽 정복! 🎉</h4>
                      <span className="text-sm text-emerald-300 font-medium">기상청 데이터 &amp; 실시간 스타일리스트 마스터 달성</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    기상청 초단기 관측 데이터 연동, T1H·PTY 4대 기상 코드 정규화, 기온별 5단계 맞춤 옷차림 알고리즘, 노란 우산 조건부 렌더링과 -999 결측치 방어까지 모두 완벽하게 마스터하셨습니다! 이제 네트워크 지연 시 뺑글이 로딩 화면과 스켈레톤 UI를 설계하는 17강 프로젝트로 모험을 이어가세요.
                  </p>
                  <div className="pt-2">
                    <a
                      href="/lessons/17-loading-states"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer"
                    >
                      <span>시즌 4 · 17강: 와이파이가 끊겨도 끄떡없어! 뺑글이 로딩 화면 도전하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

            </section>

            {/* 하단 이전 단계 네비게이션 */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 실전 AI 퀘스트</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStage('stage1')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>처음으로: 미션 &amp; 원리</span>
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AI·코딩 장기 교육과정. All rights reserved.</span>
          <span className="text-slate-400">시즌 4 · 16강 기상청 데이터 연동 날씨 &amp; 옷차림 코디네이터</span>
        </div>
      </footer>
    </div>
  );
};

export default Lesson16;
