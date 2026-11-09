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
  ZoomIn
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
    badge: 'RESTful 엔드포인트 연동',
    level: '초급 실전 레벨 ★☆☆',
    title: 'PokeAPI 도감 호출과 대소문자·공백 자동 손질(Trim & Lowercase) 함수 구현',
    desc: '사용자가 "PIKACHU "처럼 대문자나 공백을 섞어 검색해도 404 에러 없이 깔끔하게 소환할 수 있도록 입력값을 정돈하고 비동기 통신을 수행하는 파이프라인 함수를 작성합니다.',
    situation: '대문자 'PIKACHU'나 앞뒤 공백을 그대로 URL에 전송하면 PokeAPI 서버가 404 Not Found를 응답해 도감이 멈춥니다!',
    prompt: `[역할]
너는 웹 프론트엔드와 오픈 API 연동을 가르치는 시니어 개발자이자 코딩 멘토야.

[상황 및 요구사항]
오픈 API인 PokeAPI('https://pokeapi.co/api/v2/pokemon/{query}')를 비동기로 호출하는 fetchPokemonData(query) 자바스크립트 함수를 작성하려고 해.

[요청 사항]
1. 사용자가 'PIKACHU'나 ' 25 '처럼 입력해도 안전하도록 query.trim().toLowerCase()를 적용해 줘.
2. async/await와 fetch를 사용해 도감 번호(숫자) 또는 소문자 영문 이름을 엔드포인트에 전달할 것.
3. response.ok를 검사해 성공 시 data JSON을 반환하고, 실패 시 친절한 에러 객체를 던질 것.
4. 초등학생 및 입문자도 각 줄의 목적을 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.`,
    reaction: '대소문자 오차를 100% 방어하는 trim/toLowerCase 전처리와 안전한 async/await 통신 코드를 단 3초 만에 완성합니다!',
    csSecret: 'REST API 규격에서 URI 경로는 리소스 고유 식별자(ID)이므로, 공백이나 대소문자가 정확히 일치해야만 서버가 대상을 올바르게 매칭합니다.'
  },
  {
    id: 'quest-02',
    badge: '고화질 공식 일러스트 안전 추출',
    level: '중급 객체 탐색 ★★☆',
    title: '옵셔널 체이닝(?.)을 활용한 official-artwork 고화질 일러스트와 Fallback 도트 이미지 추출술',
    desc: '수십 단계로 중첩된 PokeAPI의 스프라이트 앨범에서 3D 공식 일러스트를 추출하고, 속성이 누락되었을 때 앱이 다운되지 않도록 안전한 기본 도트 이미지로 우아하게 대체하는 방어 로직을 작성합니다.',
    situation: '방어 코드 없이 data.sprites.other['official-artwork'].front_default에 직행하면 속성이 없을 때 TypeError로 브라우저가 정지합니다!',
    prompt: `[역할]
너는 자바스크립트 런타임 오류 방어와 중첩 객체 탐색 전문가야.

[문제 상황]
PokeAPI의 응답 JSON에서 공식 일러스트를 추출하려고 해.
경로는 data.sprites.other['official-artwork'].front_default인데, 일부 최신 포켓몬이나 특수 폼은 official-artwork 객체가 비어있거나 null일 수 있어.

[해결 요청]
1. 최신 옵셔널 체이닝(?.) 문법을 사용하여 중첩 속성이 없어도 절대 TypeError를 내지 않는 getOfficialArtworkUrl(pokeData, isShiny) 함수를 작성해 줘.
2. 만약 공식 일러스트가 없으면 data?.sprites?.front_default(기본 도트 이미지)로 대체하고, 그것마저 없으면 더미 물음표 이미지 URL로 안전하게 fallback하는 삼중 안전망을 구축해 줘.
3. isShiny 플래그가 true일 때는 shiny 버전 일러스트를 우선 반환하도록 설계해 줘.
4. 옵셔널 체이닝이 왜 '점(.) 표기법'보다 안전한지 주니어 개발자 눈높이에서 설명해 줘.`,
    reaction: '어떤 포켓몬이 들어와도 절대 깨지지 않는 3중 안전망(Official ➔ 기본 도트 ➔ 물음표 Fallback) 이미지 추출기를 구축합니다!',
    csSecret: '옵셔널 체이닝(?.)은 참조 대상이 nullish(null/undefined)일 때 평가를 즉시 중단하고 undefined를 반환하여 런타임 크래시를 원천 차단합니다.'
  },
  {
    id: 'quest-03',
    badge: '데이터 시각화 & 스탯 바',
    level: '시각화 디자인 ★★★',
    title: '최대치 255 기준 퍼센트 비율 계산 및 컬러풀 게이지 바 동적 생성',
    desc: '지루한 텍스트 숫자 "HP: 35, Speed: 90"을 최대치 255 기준의 퍼센트 폭(width: X%)으로 변환해 부드러운 애니메이션과 함께 차오르는 게임 체력 막대그래프로 변신시킵니다.',
    situation: '최대 기준치(255) 없이 그냥 숫자를 픽셀이나 퍼센트로 지정하면 게이지 바가 화면을 뚫고 나가거나 형태가 깨집니다!',
    prompt: `[역할]
너는 게임 UI/UX 디자인과 프론트엔드 데이터 시각화를 가르치는 인터랙션 개발자야.

[요구사항]
PokeAPI의 data.stats 배열에는 6대 전투력 스탯(hp, attack, defense, special-attack, special-defense, speed)이 담겨있어.
이 수치를 게임 체력 게이지 바처럼 웹 브라우저에 시각화하려고 해.

[해결 요청]
1. 포켓몬 정규 최대 스탯치인 255를 기준으로 퍼센트 비율(Math.min(100, Math.round((statValue / 255) * 100)))을 계산하는 renderStatGauges(statsArray) 함수를 작성해 줘.
2. 체력(초록색), 공격력(빨간색), 방어력(파란색), 스피드(노란색) 등 스탯 종류에 어울리는 Tailwind CSS 배경색 클래스를 적용해 줘.
3. 게이지 바가 0.5초 동안 부드럽게 뻗어나가는 transition-all CSS 스타일을 적용해 줘.
4. 매 줄마다 초보 학생이 이해하기 쉽도록 친절한 한국어 주석을 달아줘.`,
    reaction: '지루했던 숫자 데이터가 실제 포켓몬 배틀 화면의 화려한 컬러 게이지 바로 생동감 있게 다시 태어납니다!',
    csSecret: '데이터 시각화(Data Visualization)는 비례식 정규화(Normalization, 0~1 사이 값)를 통해 크기가 다른 데이터를 동일한 스케일의 시각적 길이로 맵핑하는 핵심 원리입니다.'
  },
  {
    id: 'quest-04',
    badge: '속성(Type) 뱃지 맵핑 & 듀얼 타입',
    level: '데이터 맵핑 ★★☆',
    title: '18개 포켓몬 속성(Type) 영문명을 한국어와 고유 컬러 배지로 변환하는 딕셔너리 맵핑',
    desc: '영문 단어 'electric', 'fire', 'water'를 직관적인 한국어 뱃지로 번역하고, 리자몽처럼 불꽃과 비행을 모두 가진 듀얼 속성 포켓몬도 깔끔하게 나열 렌더링하는 객체 매핑 함수를 설계합니다.',
    situation: 'if-else 문으로 18개 속성을 하나하나 분기하면 코드가 100줄이 넘어가고, 듀얼 속성 처리가 꼬여버립니다!',
    prompt: `[역할]
너는 UI 디자인 시스템과 데이터 변환 딕셔너리 설계에 능숙한 자바스크립트 아키텍트야.

[상황]
PokeAPI의 data.types 배열은 [{'type': {'name': 'fire'}}, {'type': {'name': 'flying'}}] 형태로 전송돼.
사용자에게 친숙한 한국어 이름과 알록달록한 속성 배지를 화면에 렌더링하고 싶어.

[요청 사항]
1. 18개 속성 영문 키를 받아 { nameKr, bgClass, textClass, borderClass } 객체를 반환하는 TYPE_DICTIONARY 상수를 정의해 줘. (fire: 불꽃, water: 물, grass: 풀, electric: 전기, psychic: 에스퍼 등)
2. data.types 배열을 .map()으로 순회해 1개(단일) 또는 2개(듀얼) 속성 배지 HTML 문자열을 생성하는 renderTypeBadges(typesArray) 함수를 작성해 줘.
3. 사전에 없는 낯선 속성이 들어왔을 때 회색 일반 배지로 대응하는 방어 로직을 포함해 줘.
4. if-else 문 대신 객체 매핑(Key-Value Lookup)을 사용하는 이유를 성능과 가독성 관점에서 설명해 줘.`,
    reaction: '100줄짜리 지저분한 if-else 문을 단 한 장의 세련된 딕셔너리 객체와 O(1) 초고속 조회 함수로 압축합니다!',
    csSecret: '해시 테이블(Hash Table) 기반의 객체 키 조회는 상수 시간 복잡도 O(1)로 실행되므로 조건문 분기보다 훨씬 빠르고 확장이 용이합니다.'
  },
  {
    id: 'quest-05',
    badge: '로켓단 404 방어 & 디바운싱',
    level: '성능 & 예외 처리 ★★★',
    title: '없는 포켓몬 404 예외 안내창과 키보드 연타를 막아주는 디바운싱(Debounce) 최적화',
    desc: '도감에 없는 번호 검색 시 "로켓단이 도감을 숨겼어요!"라는 Fallback 화면을 띄워 브라우저 멈춤을 방어하고, 타이핑할 때마다 수십 번 불필요하게 API를 호출하지 않도록 300ms 입력 지연 제어를 적용합니다.',
    situation: '검색창에 글자를 칠 때마다 API를 매번 부르면 PokeAPI 서버로부터 요청 차단(Rate Limit 429)을 당할 수 있습니다!',
    prompt: `[역할]
너는 프론트엔드 성능 최적화와 예외 처리 아키텍처 전문가야.

[상황 및 요구사항]
포켓몬 도감 검색기에 두 가지 치명적 문제를 해결해야 해:
1. 없는 번호(예: 99999)나 오타 검색 시 404 에러를 감지하여 '로켓단이 도감을 숨겼어요!'라는 친절한 에러 카드 띄우기
2. 사용자가 실시간 검색창에 'pikachu'를 타이핑할 때 p, pi, pik... 7번 연속 호출되지 않도록 디바운싱(Debounce) 적용하기

[요청 사항]
1. response.status === 404를 깔끔히 가로채 에러 메시지 UI를 토글하는 safeSearchPokemon(query) 함수를 작성해 줘.
2. 클로저(Closure)와 setTimeout을 사용해 300ms 지연 후 마지막 입력만 실행시키는 debounce(func, delay) 유틸리티 함수를 구현해 줘.
3. 이 두 가지를 검색창 'input' 이벤트 리스너에 어떻게 연결하는지 실제 연동 예제 코드를 보여줘.
4. 초등학생도 이해할 수 있는 친절한 한국어 주석을 달아줘.`,
    reaction: '404 에러에도 끄떡없는 튼튼한 방어선과 서버 호출량을 80% 줄여주는 실무급 디바운싱 코드를 완성합니다!',
    csSecret: '디바운싱은 연속적인 타이머 재설정을 통해 이벤트 폭주를 억제하는 고성능 비동기 패턴으로, 네트워크 자원 절약의 필수 기술입니다.'
  }
];

interface PokemonData {
  id: number;
  name: string;
  name_kr: string;
  height: number;
  weight: number;
  exp: number;
  types: { name: string; name_kr: string; bg: string }[];
  stats: { hp: number; attack: number; defense: number; speed: number };
  defaultImg: string;
  shinyImg: string;
}

const POKEMON_PRESETS: Record<string, PokemonData> = {
  '25': {
    id: 25,
    name: 'pikachu',
    name_kr: '피카츄',
    height: 4,
    weight: 60,
    exp: 112,
    types: [{ name: 'electric', name_kr: '전기', bg: 'bg-amber-100 text-amber-800 border-amber-300' }],
    stats: { hp: 35, attack: 55, defense: 40, speed: 90 },
    defaultImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    shinyImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png'
  },
  '6': {
    id: 6,
    name: 'charizard',
    name_kr: '리자몽',
    height: 17,
    weight: 905,
    exp: 267,
    types: [
      { name: 'fire', name_kr: '불꽃', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
      { name: 'flying', name_kr: '비행', bg: 'bg-sky-100 text-sky-800 border-sky-300' }
    ],
    stats: { hp: 78, attack: 84, defense: 78, speed: 100 },
    defaultImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    shinyImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png'
  },
  '7': {
    id: 7,
    name: 'squirtle',
    name_kr: '꼬부기',
    height: 5,
    weight: 90,
    exp: 63,
    types: [{ name: 'water', name_kr: '물', bg: 'bg-sky-100 text-sky-800 border-sky-300' }],
    stats: { hp: 44, attack: 48, defense: 65, speed: 43 },
    defaultImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    shinyImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/7.png'
  },
  '1': {
    id: 1,
    name: 'bulbasaur',
    name_kr: '이상해씨',
    height: 7,
    weight: 69,
    exp: 64,
    types: [
      { name: 'grass', name_kr: '풀', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      { name: 'poison', name_kr: '독', bg: 'bg-purple-100 text-purple-800 border-purple-300' }
    ],
    stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
    defaultImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    shinyImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png'
  },
  '150': {
    id: 150,
    name: 'mewtwo',
    name_kr: '뮤츠 (전설)',
    height: 20,
    weight: 1220,
    exp: 340,
    types: [{ name: 'psychic', name_kr: '에스퍼', bg: 'bg-purple-100 text-purple-800 border-purple-300' }],
    stats: { hp: 106, attack: 110, defense: 90, speed: 130 },
    defaultImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    shinyImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/150.png'
  },
  '94': {
    id: 94,
    name: 'gengar',
    name_kr: '팬텀',
    height: 15,
    weight: 405,
    exp: 250,
    types: [
      { name: 'ghost', name_kr: '고스트', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      { name: 'poison', name_kr: '독', bg: 'bg-purple-100 text-purple-800 border-purple-300' }
    ],
    stats: { hp: 60, attack: 65, defense: 60, speed: 110 },
    defaultImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    shinyImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/94.png'
  }
};

export const Lesson15: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<StageTab>('stage1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 시뮬레이터 상태
  const [searchQuery, setSearchQuery] = useState('25');
  const [currentPoke, setCurrentPoke] = useState<PokemonData | null>(POKEMON_PRESETS['25']);
  const [isShiny, setIsShiny] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // 8강 표준 체크리스트 상태 (6항목)
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_15_checklist');
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
    localStorage.setItem('ai_lesson_15_checklist', JSON.stringify(next));
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

  const handleSearchPokemon = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : searchQuery).trim().toLowerCase();
    setIsSearching(true);
    setSearchError(false);

    setTimeout(() => {
      let matched = POKEMON_PRESETS[q];
      if (!matched) {
        // 이름 검색 대응
        const foundKey = Object.keys(POKEMON_PRESETS).find(
          k => POKEMON_PRESETS[k].name === q
        );
        if (foundKey) matched = POKEMON_PRESETS[foundKey];
      }

      if (matched) {
        setCurrentPoke(matched);
        setSearchError(false);
      } else {
        setSearchError(true);
        setCurrentPoke(null);
      }
      setIsSearching(false);
    }, 350);
  };

  const quickSearch = (id: string) => {
    setSearchQuery(id);
    handleSearchPokemon(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* ======================================================================= */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃)                     */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* 좌측 브랜드 로고 & 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  시즌 4 · 15강: 전설의 포켓몬을 찾아라! 오픈 데이터 포켓몬 도감 검색기
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
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage1' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage2' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>가상 도감 랩</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentStage === 'stage3'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage3' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStage === 'stage4' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-amber-700 shadow-sm'
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
            currentStage === 'stage1' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage2' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          2. 도감 랩
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage3' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          3. AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'stage4' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          4. 용어&점검
        </button>
        <button
          type="button"
          onClick={() => setCurrentStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            currentStage === 'all' ? 'text-amber-700 bg-amber-50' : 'text-slate-500'
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
            <article className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    시즌 4 · 웹 앱 & 오픈 데이터 프로젝트
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    도감 번호 25번 피카츄부터 150번 전설의 뮤츠까지!
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 id="stage-1-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    오 박사님의 특급 미션! 🎒 나만의 인터랙티브 스마트 포켓몬 도감 만들기
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    스마트폰이나 게임기에서만 보던 멋진 포켓몬 도감을 우리가 직접 만든 웹 브라우저 화면에 띄웁니다! 전 세계 무료 오픈 API인 PokeAPI를 연동해 수천 줄의 복잡한 원본 JSON 데이터에서 고화질 공식 일러스트(Official Artwork)와 속성 배지, 최대치 255 기준의 전투력 스탯 게이지 바를 멋지게 시각화해 보세요.
                  </p>
                </div>

                {/* 3대 도전 미션 목표 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Globe className="w-4 h-4" />
                      <span>1. REST 엔드포인트 연동</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      /pokemon/{'{id_or_name}'} 주소 규칙으로 번호나 소문자 영문 이름을 전달해 1초 만에 포켓몬 패킷을 소환합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <Layers className="w-4 h-4" />
                      <span>2. 고화질 스프라이트 추출</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      sprites.other['official-artwork'] 깊숙한 서랍에서 3D 공식 일러스트와 반짝이(Shiny) 이미지를 안전하게 추출합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <BarChart2 className="w-4 h-4" />
                      <span>3. 스탯 게이지 시각화</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      HP·공격력·방어력·스피드 숫자를 최대치 255 기준의 컬러풀 체력 막대그래프로 변환해 생동감을 불어넣습니다.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 핵심 개념 원리 탐구 카드 (3구리드 Bento) */}
            <section className="space-y-4" aria-labelledby="principles-heading">
              <div className="flex items-center justify-between">
                <h3 id="principles-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <span>도감 개발을 위한 3대 핵심 개념 원리</span>
                </h3>
                <span className="text-sm font-mono text-slate-500">POKEDEX CORE ARCHITECTURE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 원리 1 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">1. RESTful 도감 엔드포인트</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      복잡한 물음표 쿼리 스트링 없이도, 주소 끝에 포켓몬 번호나 이름만 붙이면 즉시 응답하는 REST API 표준 규격입니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-sm text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      🧸 <span className="text-amber-950">어린이 비유</span>
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      도감 번호표나 영문 이름만 적어주면 알아서 찾아오는 똑똑한 도감 전령!
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 pt-1 border-t border-slate-100">
                    <strong className="text-slate-700 font-semibold">🎓 개발자 원리:</strong> <code className="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded">/pokemon/{'{query}'}</code> 경로 리소스 식별
                  </div>
                </article>

                {/* 원리 2 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Image className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">2. 스프라이트 객체 트리 탐색</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      서버가 보내준 방대한 앨범에서 작은 게임 도트가 아닌 고화질 3D 공식 일러스트 URL을 안전하게 찾아내는 기술입니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 text-sm text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      🧸 <span className="text-rose-950">어린이 비유</span>
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      수십 장의 스티커 중 가장 화려하고 선명한 3D 공식 일러스트가 숨겨진 비밀 서랍!
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 pt-1 border-t border-slate-100">
                    <strong className="text-slate-700 font-semibold">🎓 개발자 원리:</strong> <code className="font-mono text-rose-700 bg-rose-50 px-1 py-0.5 rounded">sprites.other['official-artwork']</code> 객체 체이닝
                  </div>
                </article>

                {/* 원리 3 */}
                <article className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">3. 데이터 시각화 & 스탯 바</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      단순 텍스트 숫자 "HP: 35"를 포켓몬 한계치 255 기준의 가로 막대 그래프로 변환해 전투력을 직관적으로 보여줍니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-sm text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      🧸 <span className="text-emerald-950">어린이 비유</span>
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      지루한 성적표 대신 게임 화면처럼 체력이 쭉쭉 차오르는 무지개색 게이지 바!
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 pt-1 border-t border-slate-100">
                    <strong className="text-slate-700 font-semibold">🎓 개발자 원리:</strong> <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">(stat / 255) * 100</code> 퍼센트 비율 연산
                  </div>
                </article>
              </div>

              {/* 주니어 개발자 제1원칙 알림창 */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <strong className="font-bold text-amber-950 block">주니어 개발자 제1원칙: 검색 오타와 404 Not Found를 우아하게 방어하라!</strong>
                  <p className="text-slate-700 leading-relaxed">
                    사용자가 <code className="font-mono text-amber-800 font-bold">pikachuuu</code>처럼 오타를 내거나 99999번을 검색했을 때 웹앱이 멈추면 안 됩니다. <code className="font-mono text-amber-800 font-bold">if (!response.ok)</code>로 404 상태 코드를 감지하여 "로켓단이 도감을 숨겼어요! 번호를 확인해주세요"라는 친절한 Fallback 안내 화면을 보여주는 것이 실무 프론트엔드의 핵심입니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 가상 도감 랩 실습하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 시뮬레이터 (스마트 포켓몬 도감 라이브 랩)  */}
        {/* =================================================================== */}
        {(currentStage === 'stage2' || currentStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-2-title">
            
            {/* 상단 안내 배너 */}
            <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-amber-800/40">
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    STAGE 02 · 가상 포켓몬 도감 랩
                  </span>
                  <span className="text-sm font-mono text-slate-300">PokeAPI REST Engine</span>
                </div>
                <h2 id="stage-2-title" className="text-xl sm:text-2xl font-black text-white">
                  실시간 포켓몬 도감 검색기 & 스탯 시각화 시뮬레이터
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  원하는 포켓몬 번호나 이름을 입력하고 검색해 보세요! 전 세계 오픈 API와 연동되어 고화질 공식 일러스트, 속성 배지, 4대 전투력 스탯 게이지 바가 즉시 렌더링됩니다. 반짝이(Shiny) 이로치 모드도 토글해 보세요!
                </p>
              </div>
            </div>

            {/* 검색창 및 빠른 소환 컨트롤 패널 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <Search className="w-5 h-5 text-amber-600" />
                  <span>포켓몬 검색 및 빠른 소환</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-sm font-bold border ${
                  isSearching
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : searchError
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isSearching ? '도감 통신 중... ⚡' : searchError ? '404 Not Found (로켓단 출몰) 🚀' : `소환 완료 (#${currentPoke?.id || 25} 200 OK) 🎉`}
                </span>
              </div>

              {/* 검색 입력창 */}
              <div className="space-y-2">
                <label htmlFor="input-pokemon" className="block text-sm font-bold text-slate-700">
                  포켓몬 도감 번호 (1~1025) 또는 영문 이름
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="input-pokemon"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchPokemon()}
                    placeholder="예: 25 또는 pikachu, charizard, 150"
                    className="w-full pl-3 pr-24 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchPokemon()}
                    className="absolute right-1 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>소환!</span>
                  </button>
                </div>
              </div>

              {/* 빠른 소환 칩 버튼들 */}
              <div className="space-y-1.5">
                <span className="block text-sm font-bold text-slate-700">인기 포켓몬 원클릭 소환 칩:</span>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => quickSearch('25')}
                    className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    ⚡ 피카츄 (#25)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSearch('6')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 font-bold hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    🔥 리자몽 (#6)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSearch('7')}
                    className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-bold hover:bg-sky-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    💧 꼬부기 (#7)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSearch('1')}
                    className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    🌿 이상해씨 (#1)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSearch('150')}
                    className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 font-bold hover:bg-purple-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    🔮 뮤츠 (#150)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSearch('94')}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 font-bold hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    👻 팬텀 (#94)
                  </button>
                </div>
              </div>
            </div>

            {/* 인터랙티브 포켓몬 도감 디스플레이 카드 */}
            {currentPoke && !searchError && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
                
                {/* 도감 헤더: 번호, 이름, 속성 태그 */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-sm">
                      #{String(currentPoke.id).padStart(4, '0')}
                    </span>
                    <div>
                      <strong className="text-lg sm:text-xl font-black text-slate-900 block">
                        {currentPoke.name_kr}
                      </strong>
                      <span className="text-sm font-mono text-slate-500 font-semibold capitalize">
                        {currentPoke.name}
                      </span>
                    </div>
                  </div>

                  {/* 속성 배지 */}
                  <div className="flex items-center gap-1.5">
                    {currentPoke.types.map((t, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm font-bold border ${t.bg}`}>
                        {t.name_kr} ({t.name})
                      </span>
                    ))}
                  </div>
                </div>

                {/* 중앙 일러스트 뷰어 & 반짝이(이로치) 토글 */}
                <div className="relative p-6 rounded-2xl bg-gradient-to-b from-amber-50/60 via-slate-50 to-white border border-slate-200 flex flex-col items-center justify-center min-h-[220px]">
                  <button
                    type="button"
                    onClick={() => setIsShiny(!isShiny)}
                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                      isShiny
                        ? 'border border-amber-400 bg-amber-50 text-amber-800 animate-pulse'
                        : 'border border-slate-200 bg-white/90 text-slate-700 hover:text-amber-600 hover:border-amber-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isShiny ? '이로치 모드 ON 🌟' : '이로치 모드 OFF'}</span>
                  </button>

                  {/* 공식 일러스트 이미지 */}
                  <img
                    src={isShiny ? currentPoke.shinyImg : currentPoke.defaultImg}
                    alt={`${currentPoke.name_kr} 공식 일러스트`}
                    className="w-44 h-44 object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
                  />

                  {/* 신체 스펙 바 */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-mono text-slate-600 pt-3">
                    <div>키: <strong className="text-slate-900 font-bold">{(currentPoke.height * 0.1).toFixed(1)}m ({currentPoke.height * 10}cm)</strong></div>
                    <div className="h-3 w-px bg-slate-300" />
                    <div>몸무게: <strong className="text-slate-900 font-bold">{(currentPoke.weight * 0.1).toFixed(1)}kg</strong></div>
                    <div className="h-3 w-px bg-slate-300" />
                    <div>기본 경험치: <strong className="text-slate-900 font-bold">{currentPoke.exp} EXP</strong></div>
                  </div>
                </div>

                {/* 📊 전투력 스탯 막대그래프 시각화 */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-base font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-amber-600" />
                      전투력 스탯 막대그래프 (Stats Gauge)
                    </span>
                    <span className="text-sm text-slate-400 font-normal">최대치 255 기준</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    {/* HP 게이지 */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-emerald-700">체력 (HP)</span>
                        <span className="font-mono text-slate-800">{currentPoke.stats.hp} / 255</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((currentPoke.stats.hp / 255) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* 공격력 게이지 */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-rose-700">공격력 (Attack)</span>
                        <span className="font-mono text-slate-800">{currentPoke.stats.attack} / 255</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((currentPoke.stats.attack / 255) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* 방어력 게이지 */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-sky-700">방어력 (Defense)</span>
                        <span className="font-mono text-slate-800">{currentPoke.stats.defense} / 255</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((currentPoke.stats.defense / 255) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* 스피드 게이지 */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-amber-700">스피드 (Speed)</span>
                        <span className="font-mono text-slate-800">{currentPoke.stats.speed} / 255</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((currentPoke.stats.speed / 255) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 에러/로켓단 출몰 알림창 */}
            {searchError && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-rose-800 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>로켓단이 도감을 숨겼어요! 🚀</span>
                </div>
                <p className="text-sm text-rose-700 leading-relaxed">
                  검색하신 포켓몬을 찾을 수 없습니다. 도감 번호(1~1025) 또는 영문 소문자 철자를 확인해보세요!
                </p>
              </div>
            )}

            {/* JSON 영수증 뷰어 */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <Code className="w-4 h-4" />
                  <span>실시간 응답 영수증 뷰어 (PokeAPI Raw Payload)</span>
                </div>
                <span className="text-sm font-mono text-slate-400">
                  {searchError ? 'HTTP 404 NOT FOUND' : 'HTTP 200 OK'}
                </span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-sm text-amber-300 whitespace-pre-wrap overflow-x-auto leading-relaxed border border-slate-800 max-h-48 overflow-y-auto">
                {searchError
                  ? JSON.stringify({ error: "404 Not Found", message: "로켓단이 도감을 숨겼습니다. 번호를 확인하세요.", statusCode: 404 }, null, 2)
                  : JSON.stringify(
                      {
                        id: currentPoke?.id,
                        name: currentPoke?.name,
                        nameKr: currentPoke?.name_kr,
                        types: currentPoke?.types.map(t => t.name),
                        height: `${(currentPoke?.height || 0) * 10}cm`,
                        weight: `${(currentPoke?.weight || 0) * 0.1}kg`,
                        stats: currentPoke?.stats,
                        sprites: {
                          officialArtwork: isShiny ? currentPoke?.shinyImg : currentPoke?.defaultImg,
                          shiny: isShiny
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
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
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
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-amber-800/40">
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    STAGE 03 · 5대 실전 AI 퀘스트
                  </span>
                  <span className="text-sm font-mono text-slate-300">ChatGPT & Gemini 프롬프트 공작소</span>
                </div>
                <h2 id="stage-3-title" className="text-xl sm:text-2xl font-black text-white">
                  실전 최신 AI 5대 킬러 퀘스트 마스터 🎯
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  원클릭으로 프롬프트를 복사하여 ChatGPT나 Gemini 창에 붙여넣어 보세요! 주니어 개발자가 마주하는 오픈 API 호출, 복잡한 스프라이트 트리 탐색, 게이지 바 시각화, 타입 컬러 매핑, 로켓단 404 예외 가드를 AI와 함께 완벽히 정복합니다.
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
                        idx === 0 ? 'bg-amber-600' :
                        idx === 1 ? 'bg-rose-600' :
                        idx === 2 ? 'bg-emerald-600' :
                        idx === 3 ? 'bg-purple-600' : 'bg-indigo-600'
                      }`}>
                        QUEST 0{idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm">
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
                        <Bot className="w-4 h-4 text-amber-600" />
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
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        ✨ <span className="text-amber-900">AI 충격 반응 & 소환 마법</span>
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
                <span>이전: 가상 도감 랩</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStage('stage4')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 용어 돋보기 & 자가 점검</span>
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
                    <ZoomIn className="w-5 h-5 text-amber-600" />
                    <span>주니어 개발자를 위한 전문 용어 돋보기</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    오늘 실습에서 사용된 핵심 컴퓨터 과학 및 오픈 API 전문 용어를 정복해 보세요.
                  </p>
                </div>
                <span className="text-sm font-mono text-slate-400">GLOSSARY</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* 용어 1: REST API 엔드포인트 */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-amber-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-amber-300 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>1. REST API 엔드포인트</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        외래어·영문: REST API Endpoint (URI & Resource Identifier)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700/60 font-mono shrink-0">
                      네트워크/API
                    </span>
                  </div>
                  <div className="text-sm text-amber-200 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
                    🧸 <strong className="text-amber-300">어린이 비유:</strong> "원하는 포켓몬 번호표나 이름표만 주소 뒤에 붙여주면 전 세계 어디서든 배달 출발하는 웹 주소 규칙!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 자원(Resource)의 고유한 위치를 나타내는 URI로, 클라이언트가 HTTP 표준 메서드(GET, POST 등)를 통해 서버의 특정 데이터에 접근하고 조작할 수 있도록 설계된 네트워크 통신 접점입니다.
                  </p>
                </article>

                {/* 용어 2: 스프라이트 이미지 & 에셋 */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-rose-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-rose-300 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>2. 스프라이트 이미지 & 에셋</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        외래어·영문: Sprite Image & Graphic Asset
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-200 border border-rose-700/60 font-mono shrink-0">
                      그래픽/게임에셋
                    </span>
                  </div>
                  <div className="text-sm text-rose-200 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">
                    🧸 <strong className="text-rose-300">어린이 비유:</strong> "게임 속 캐릭터의 앞모습, 뒷모습, 반짝이는 이로치 모습이 착착 정리된 투명 스티커 앨범!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 2D 컴퓨터 그래픽스나 게임 웹앱에서 캐릭터, 아이템 등의 그래픽 요소를 독립된 비트맵 픽셀 단위로 분리하여 브라우저 화면에 동적으로 렌더링하고 합성하기 위한 이미지 자산입니다.
                  </p>
                </article>

                {/* 용어 3: 데이터 시각화 */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-emerald-300 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>3. 데이터 시각화</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Data Visualization (Bar Chart & Gauge)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 font-mono shrink-0">
                      UI/UX·데이터
                    </span>
                  </div>
                  <div className="text-sm text-emerald-200 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
                    🧸 <strong className="text-emerald-300">어린이 비유:</strong> "복잡한 숫자 나열 대신 한눈에 파워와 속도를 알아볼 수 있는 무지개색 게이지 바와 체력 막대그래프!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 방대한 원시 수치 데이터(Raw Data)를 그래프, 게이지 바, 차트 등 시각적 도형과 비율로 변환하여 사용자가 정보의 크기와 패턴을 직관적으로 비교·판단할 수 있게 돕는 사용자 인터페이스 표현 기술입니다.
                  </p>
                </article>

                {/* 용어 4: 입력 지연 제어 (디바운싱) */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-indigo-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>4. 입력 지연 제어 (디바운싱)</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        외래어·영문: Debounce & Throttling (Event Optimization)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700/60 font-mono shrink-0">
                      성능 최적화
                    </span>
                  </div>
                  <div className="text-sm text-indigo-200 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30">
                    🧸 <strong className="text-indigo-300">어린이 비유:</strong> "타자를 칠 때마다 매번 배달부를 출발시키지 않고, 타자를 완전히 멈출 때까지 0.3초 동안 얌전히 숨죽여 기다리는 똑똑한 전령!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 키보드 입력이나 창 크기 변경처럼 연속적으로 발생하는 고빈도 이벤트 중 마지막 이벤트가 발생하고 일정 지연 시간이 지난 후에야 단 한 번 콜백 함수를 실행시키는 호출 최적화 제어 기법입니다.
                  </p>
                </article>

                {/* 용어 5: 안전한 객체 탐색 (옵셔널 체이닝) */}
                <article className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md hover:border-sky-500/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-sky-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>5. 안전한 객체 탐색 (옵셔널 체이닝)</span>
                      </span>
                      <span className="text-sm font-mono text-slate-400 block pl-6">
                        영문: Optional Chaining (?.) & Nullish Coalescing (??)
                      </span>
                    </div>
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-sky-900/60 text-sky-200 border border-sky-700/60 font-mono shrink-0">
                      런타임 안정성
                    </span>
                  </div>
                  <div className="text-sm text-sky-200 bg-sky-950/40 p-3 rounded-xl border border-sky-500/30">
                    🧸 <strong className="text-sky-300">어린이 비유:</strong> "서랍장 안에 상자가 없어도 '상자가 없어요!'라고 조용히 지나가지, 상자를 부수고 울지 않는 안전한 열쇠!"
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">🎓 개발자 공식 정의:</strong> 중첩된 객체 프로퍼티를 참조할 때 중간 경로가 null 또는 undefined여도 런타임 에러(TypeError)를 발생시키지 않고 안전하게 undefined를 반환하여 기본값(Fallback)으로 대체할 수 있게 해주는 문법 체계입니다.
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
                    <span>15강 학습 성취도 자가 점검 체크리스트</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    6개 항목을 모두 완료하면 다음 16강(실시간 날씨 & 옷차림 코디네이터) 프로젝트가 잠금 해제됩니다.
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
                    <strong>PokeAPI REST 엔드포인트 연동:</strong> <code className="font-mono text-amber-800 bg-amber-50 px-1 py-0.5 rounded">/pokemon/{'{id_or_name}'}</code> 규격에 맞추어 영문 소문자나 번호로 포켓몬 데이터를 호출할 수 있다.
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
                    <strong>고화질 스프라이트 추출 & 옵셔널 체이닝:</strong> <code className="font-mono text-rose-800 bg-rose-50 px-1 py-0.5 rounded">sprites.other['official-artwork']</code> 경로에서 3D 공식 일러스트를 안전하게 추출할 수 있다.
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
                    <strong>전투력 스탯 막대그래프 시각화:</strong> 최대치 255를 기준으로 HP, 공격력, 방어력, 스피드 비율을 계산해 컬러풀 게이지 바로 시각화할 수 있다.
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
                    <strong>속성(Type) 딕셔너리 매핑:</strong> 18개 속성 영문명을 한국어로 변환하고 단일 및 듀얼 타입 배지를 고유 컬러로 렌더링할 수 있다.
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
                    <strong>로켓단 404 예외 가드:</strong> 존재하지 않는 번호나 오타 검색 시 404 에러를 가로채 친절한 Fallback 안내 화면을 표시할 수 있다.
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
                    <strong>성능 최적화 & 이로치 모드:</strong> 키보드 입력 폭주를 막는 디바운싱(Debounce)과 반짝이(Shiny) 일러스트 토글의 동작 원리를 설명할 수 있다.
                  </span>
                </label>

              </div>

              {/* 100% 완주 축하 및 16강 언락 다크 펄스 카드 */}
              {completedCount === 6 && (
                <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-500/50 shadow-xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">15강 미션 완벽 정복! 🎉</h4>
                      <span className="text-sm text-emerald-300 font-medium">오픈 데이터 포켓몬 도감 마스터 달성</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    PokeAPI의 REST 엔드포인트 연동, 고화질 3D 공식 일러스트 추출, 스탯 막대그래프 시각화, 속성 딕셔너리 매핑과 로켓단 404 예외 방어까지 모두 마스터하셨습니다! 이제 실시간 기상청 날씨와 기온별 옷차림 추천을 코디하는 16강 프로젝트로 모험을 이어가세요.
                  </p>
                  <div className="pt-2">
                    <a
                      href="/lessons/16-weather-coord"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition-all cursor-pointer"
                    >
                      <span>시즌 4 · 16강: 오늘 우산 챙길까? 날씨 & 옷차림 코디네이터 도전하기</span>
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
                <span>처음으로: 미션 & 원리</span>
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
          <span className="text-slate-400">시즌 4 · 15강 포켓몬 오픈 데이터 도감 검색기</span>
        </div>
      </footer>
    </div>
  );
};

export default Lesson15;
