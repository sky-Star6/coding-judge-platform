import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Award,
  Lock,
  Unlock,
  Layers,
  Search,
  Code2,
  Trophy,
  CheckSquare,
  Radio,
  Send,
  ShieldCheck,
  Zap,
  Globe,
  FileCode,
  BarChart2,
  Home,
  BookOpen,
  Image,
  BarChart3,
  Timer,
  RefreshCw,
  HardDrive
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 4 · 15강 React 컴포넌트 (Lesson15.tsx)
 * 전설의 포켓몬을 찾아라! 오픈 데이터 포켓몬 도감 검색기
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'pokedex' | 'inspect' | 'checklist';

interface PokeType {
  name: string;
  name_kr: string;
  bg: string;
}

interface PokeStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

interface PokemonData {
  id: number;
  name: string;
  name_kr: string;
  height: number;
  weight: number;
  exp: number;
  types: PokeType[];
  stats: PokeStats;
  defaultImg: string;
  shinyImg: string;
}

const POKEMON_PRESETS: Record<string, PokemonData | string> = {
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
  'pikachu': '25',
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
  'charizard': '6',
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
  'squirtle': '7',
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
  'bulbasaur': '1',
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
  'mewtwo': '150'
};

export default function Lesson15() {
  // 스테이지 및 우측 탭 상태
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('pokedex');

  // 포켓몬 도감 상태
  const [searchQuery, setSearchQuery] = useState<string>('25');
  const [currentPoke, setCurrentPoke] = useState<PokemonData | null>(POKEMON_PRESETS['25'] as PokemonData);
  const [isShinyMode, setIsShinyMode] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('소환 완료 (#25 200 OK) 🎉');

  // 데이터 비교 뷰어 상태
  const [compareMode, setCompareMode] = useState<'raw' | 'cleaned'>('cleaned');

  // 프롬프트 복사 상태
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 자가 점검 체크리스트 (6개)
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 회고 노트 상태
  const [reflectionQ1, setReflectionQ1] = useState<string>('');
  const [reflectionQ2, setReflectionQ2] = useState<string>('');
  const [saveIndicator, setSaveIndicator] = useState<string>('자동 저장 대기');

  // 로컬스토리지 복원
  useEffect(() => {
    const savedCompleted = localStorage.getItem('ai_lesson_15_completed');
    if (savedCompleted === 'true') {
      setCheckedItems([true, true, true, true, true, true]);
      setIsCompleted(true);
    }

    const savedQ1 = localStorage.getItem('ai_lesson_15_reflection_q1');
    const savedQ2 = localStorage.getItem('ai_lesson_15_reflection_q2');
    if (savedQ1) setReflectionQ1(savedQ1);
    if (savedQ2) setReflectionQ2(savedQ2);
  }, []);

  // 체크리스트 핸들러
  const handleCheck = (index: number) => {
    const next = [...checkedItems];
    next[index] = !next[index];
    setCheckedItems(next);

    const allChecked = next.every(Boolean);
    setIsCompleted(allChecked);
    if (allChecked) {
      localStorage.setItem('ai_lesson_15_completed', 'true');
    }
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  // 포켓몬 검색 함수
  const executeSearch = (targetQuery?: string) => {
    const q = (targetQuery !== undefined ? targetQuery : searchQuery).trim().toLowerCase();
    setIsFetching(true);
    setDeliveryStatus('도감 통신 중... ⚡');

    setTimeout(() => {
      setIsFetching(false);
      let matched = POKEMON_PRESETS[q];
      if (typeof matched === 'string') {
        matched = POKEMON_PRESETS[matched];
      }

      if (!matched) {
        setIsNotFound(true);
        setCurrentPoke(null);
        setDeliveryStatus('404 Not Found (로켓단 출몰) 🚀');
      } else {
        setIsNotFound(false);
        const pokeData = matched as PokemonData;
        setCurrentPoke(pokeData);
        setDeliveryStatus(`소환 완료 (#${pokeData.id} 200 OK) 🎉`);
      }
    }, 350);
  };

  const handleQuickSearch = (id: string) => {
    setSearchQuery(id);
    executeSearch(id);
  };

  // 프롬프트 복사
  const handleCopyPrompt = () => {
    const promptText = `공식 PokeAPI(https://pokeapi.co/api/v2/pokemon/{query})를 호출해 포켓몬 도감 카드를 렌더링하는 안전한 비동기 자바스크립트 함수를 작성해줘.

[필수 조건]
1. async/await와 fetch를 사용해 도감 번호(숫자) 또는 소문자 영문 이름을 엔드포인트에 전달할 것.
2. sprites.other['official-artwork'].front_default 경로에서 고화질 공식 일러스트 URL을 안전하게 추출할 것.
3. stats 배열에서 hp, attack, defense, speed 값을 꺼내 최대값 255 기준으로 퍼센트(width: X%)를 계산하여 게이지 바로 표시할 것.
4. types 배열을 순회하여 속성명(electric, fire, water, grass 등)에 맞는 고유 배경색 태그를 부여할 것.
5. 검색한 포켓몬이 없을 때(404 에러 발생 시) 웹앱이 멈추지 않고 '로켓단이 도감을 숨겼어요! 번호를 다시 확인해주세요'라는 친절한 Fallback 안내 화면을 표시할 것.`;

    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);
    });
  };

  // 회고 저장
  const handleReflectionChange = (q: 'q1' | 'q2', val: string) => {
    if (q === 'q1') {
      setReflectionQ1(val);
      localStorage.setItem('ai_lesson_15_reflection_q1', val);
    } else {
      setReflectionQ2(val);
      localStorage.setItem('ai_lesson_15_reflection_q2', val);
    }
    setSaveIndicator('자동 저장됨');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ======================================================================= */}
      {/* [상단 GNB] 과정 홈 | 시즌 4 · 15강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              시즌 4 · 15강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              전설의 포켓몬을 찾아라! 오픈 데이터 포켓몬 도감 검색기
            </h1>
          </div>
        </div>

        {/* 4단계 퀘스트 스텝퍼 */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage1' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>오 박사의 미션</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage2' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>도감 엔드포인트</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage3' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>스탯 게이지 시각화</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage4' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>오타 방어 & 회고</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span className="text-amber-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-amber-50 text-amber-700 border border-amber-300 animate-pulse'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {isCompleted ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isCompleted ? '16강 언락!' : '16강 잠김'}</span>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 2-패널 스플릿 뷰 */}
      {/* ======================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* --------------------------------------------------------------------- */}
        {/* ■ 좌측 패널 (60% 폭): 퀘스트 가이드 & 본문 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar">
          {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border border-amber-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-200/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  전 세계 개발자들의 놀이터 PokeAPI
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  1,025마리 포켓몬 실시간 데이터 연동
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                전설의 포켓몬을 찾아라!<br />
                오픈 데이터 포켓몬 도감 검색기
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                13강의 기본 fetch와 14강의 교육청 급식 파싱을 거쳐, 이제 전 세계 소프트웨어 개발자들이 가장 사랑하는 공공 데이터인 **PokeAPI**로 나만의 인터랙티브 포켓몬 도감(Pokédex) 웹앱을 만듭니다! 번호나 영문 이름을 입력하면 공식 일러스트와 속성 뱃지, 전투력 스탯 그래프가 화면에 역동적으로 펼쳐집니다.
              </p>

              {/* 4대 메타 그리드 (15.6인치 최적화) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">약 40분</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">난이도</span>
                  <strong className="text-xs font-bold text-amber-700 leading-snug whitespace-nowrap">실전 레벨 4 ★★★★☆</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">실습 도구</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">PokeAPI & DOM 시각화</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <strong className="text-xs font-bold text-rose-700 leading-snug whitespace-nowrap">인터랙티브 포켓몬 도감</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 1: 미션 브리핑 & 4대 성공 루브릭 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 1: 미션 브리핑 (오 박사님의 특급 미션! 🎒)
                </h3>
                <span className="text-xs text-slate-500">포켓몬 트레이너의 필수 장비, 스마트 전자도감을 내 손으로 코딩하기</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950 font-bold">"도감 번호 25번 피카츄부터 150번 전설의 뮤츠까지!"</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    스마트폰이나 게임기에서만 보던 멋진 포켓몬 도감을 우리가 직접 만든 웹 브라우저 화면에 띄웁니다. 수천 줄의 복잡한 원문 데이터를 분석하여, 친구들이 환호할 수 있도록 일러스트와 전투력 게이지로 변신시키는 데이터 시각화의 즐거움을 경험해 보세요!
                  </p>
                </div>
              </div>
            </div>

            {/* 4대 성공 루브릭 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>이번 퀘스트의 4대 성공 루브릭 (성공 판정 기준)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>1. PokeAPI REST 엔드포인트 연동</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <code className="text-amber-800 font-mono">/pokemon/{'{id_or_name}'}</code> 주소 규격에 맞추어 포켓몬 데이터 패킷을 수신합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. 스프라이트 그래픽 추출</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    복잡한 <code className="text-amber-800 font-mono">sprites.other['official-artwork']</code> 객체 트리를 탐색해 고화질 공식 일러스트를 화면에 렌더링합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>3. 스탯 바(Stats Bar) 데이터 시각화</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    HP, 공격력, 방어력, 스피드 숫자를 최대 255 기준의 체력 게이지 바(가로 막대그래프)로 생동감 있게 변환합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>4. 검색 오타 404 방어 & 이로치 모드</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    존재하지 않는 포켓몬 검색 시 404 에러를 낚아채어 친절한 안내를 띄우고, 반짝이(Shiny) 일러스트 토글을 지원합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 2: 핵심 개념 & 인터랙티브 인포그래픽 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 2: 핵심 원리 (도감 엔드포인트와 스탯 게이지 시각화)
                </h3>
                <span className="text-xs text-slate-500">숫자 데이터와 그림 주소를 조립해 하나의 완성된 도감 카드를 만드는 비법</span>
              </div>
            </div>

            {/* 개념 1: RESTful 엔드포인트 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">1. 번호나 이름표만 주면 배달 출발! (RESTful 엔드포인트)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                PokeAPI는 복잡한 물음표 쪽지 없이도, 주소 끝에 내가 원하는 포켓몬의 **도감 번호(ID)**나 **영문 이름**만 적어주면 알아서 찾아주는 똑똑한 규칙(REST API)을 가지고 있습니다.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-2 overflow-x-auto border border-slate-800">
                <div className="text-slate-400">// 1. 도감 번호 25번으로 피카츄 소환</div>
                <div>
                  <span className="text-emerald-400">https://pokeapi.co/api/v2/pokemon/</span><span className="text-amber-300 font-bold">25</span>
                </div>
                <div className="text-slate-400 pt-1">// 2. 영문 이름으로 전설의 뮤츠 소환</div>
                <div>
                  <span className="text-emerald-400">https://pokeapi.co/api/v2/pokemon/</span><span className="text-sky-300 font-bold">mewtwo</span>
                </div>
              </div>
            </div>

            {/* 개념 2: 스프라이트 이미지 트리 탐색 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">2. 고화질 공식 일러스트 찾기: 스프라이트 객체 트리 탐색</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                포켓몬 서버가 보내주는 데이터에는 수십 장의 게임 도트 그림과 3D 일러스트가 들어있습니다. 우리가 원하는 멋진 공식 일러스트는 <code className="font-mono text-amber-800 font-bold">sprites.other['official-artwork'].front_default</code> 주소에 보관되어 있어요!
              </p>

              {/* 계층 구조 비주얼 다이어그램 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-mono">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">1단계</span>
                  <span>data.<strong className="text-amber-700">sprites</strong></span>
                  <span className="text-slate-400 text-[11px]">➔ 모든 이미지 파일들이 모여있는 앨범 서랍</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-mono pl-4 border-l-2 border-amber-300">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">2단계</span>
                  <span>other[<strong className="text-rose-700">'official-artwork'</strong>]</span>
                  <span className="text-slate-400 text-[11px]">➔ 작은 도트가 아닌 고화질 공식 일러스트 전용 폴더</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-mono pl-8 border-l-2 border-rose-300">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">3단계</span>
                  <span><strong className="text-emerald-700">front_default</strong></span>
                  <span className="text-slate-400 text-[11px]">➔ 바로 화면의 &lt;img src="..."&gt;에 꽂아 넣을 최종 URL!</span>
                </div>
              </div>
            </div>

            {/* 개념 3: 스탯 막대그래프 시각화 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">3. 숫자를 게임 체력바로 바꾸는 데이터 시각화의 마법</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                단순히 "HP: 35, Speed: 90"이라고 글자로만 보여주면 피카츄가 얼마나 빠른지 한눈에 알기 어려워요. 포켓몬의 최대 스탯 한계치인 **255**를 기준으로 비율을 계산해 가로 막대그래프로 칠해주면 멋진 게임 화면이 완성됩니다!
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-1.5">
                <div className="text-slate-400">// 스탯 숫자(0~255)를 퍼센트(0%~100%) 폭으로 변환하는 공식</div>
                <div className="text-amber-300">
                  const percent = Math.min(100, Math.round((statValue / 255) * 100));
                </div>
                <div className="text-slate-400 pt-1">// HTML 요소의 너비 스타일로 지정</div>
                <div className="text-emerald-400">
                  statGaugeBar.style.width = `\${percent}%`;
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 3: 비교 실험 & 프롬프트 복사 실습 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 3: 비교 실험 & 실전 프롬프트 공작소
                </h3>
                <span className="text-xs text-slate-500">지루한 텍스트 덩어리와 화려한 그래픽 도감 카드의 엄청난 차이</span>
              </div>
            </div>

            {/* 비교 테이블 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 whitespace-nowrap">비교 항목</th>
                    <th className="p-3">지루한 텍스트 출력 방식 (Before)</th>
                    <th className="p-3 text-amber-700">시각화된 현대적 도감 카드 (After)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">포켓몬 모습</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">https://raw.github.../25.png</td>
                    <td className="p-3 font-semibold text-slate-800">✨ 고화질 공식 3D 일러스트 렌더링</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">속성 분류</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">types[0].type.name = "electric"</td>
                    <td className="p-3 font-semibold text-slate-800">⚡ 노란색 전기 속성 컬러 뱃지</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">전투력 (스탯)</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">hp: 35, attack: 55, speed: 90</td>
                    <td className="p-3 font-semibold text-slate-800">📊 체력·공격·스피드 컬러 게이지 그래프</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">인터랙션</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">단순 글자 조회 (기능 없음)</td>
                    <td className="p-3 font-bold text-amber-600">🌟 반짝이(이로치) 모드 원클릭 토글</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI 실전 프롬프트 원클릭 복사 카드 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900 via-slate-900 to-rose-950 text-white space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <strong className="text-xs sm:text-sm font-bold text-amber-200">AI 코딩 도우미에게 건넬 실전 프롬프트</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-xs font-bold transition-all text-white shadow-xs cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? '복사됨! ✨' : '프롬프트 복사'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-amber-300 whitespace-pre-wrap leading-relaxed select-all">
{`공식 PokeAPI(https://pokeapi.co/api/v2/pokemon/{query})를 호출해 포켓몬 도감 카드를 렌더링하는 안전한 비동기 자바스크립트 함수를 작성해줘.

[필수 조건]
1. async/await와 fetch를 사용해 도감 번호(숫자) 또는 소문자 영문 이름을 엔드포인트에 전달할 것.
2. sprites.other['official-artwork'].front_default 경로에서 고화질 공식 일러스트 URL을 안전하게 추출할 것.
3. stats 배열에서 hp, attack, defense, speed 값을 꺼내 최대값 255 기준으로 퍼센트(width: X%)를 계산하여 게이지 바로 표시할 것.
4. types 배열을 순회하여 속성명(electric, fire, water, grass 등)에 맞는 고유 배경색 태그를 부여할 것.
5. 검색한 포켓몬이 없을 때(404 에러 발생 시) 웹앱이 멈추지 않고 '로켓단이 도감을 숨겼어요! 번호를 다시 확인해주세요'라는 친절한 Fallback 안내 화면을 표시할 것.`}
              </pre>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 4: 오류 연구소, 실전 예외 방어 & 배움 회고 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 4: 오류 연구소 (오타 404 방어 & 배움 회고)
                </h3>
                <span className="text-xs text-slate-500">로켓단이 도감을 숨겨도 끄떡없는 튼튼한 방어선 구축하기</span>
              </div>
            </div>

            {/* 예외 방어 2대 비법 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>방패 1: 오타 및 존재하지 않는 포켓몬 방어</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  도감에 없는 이름(<code className="text-rose-800 font-mono">pikachuuu</code>)이나 99999번을 검색하면 서버가 404를 보냅니다. <code className="text-rose-800 font-mono">if (!response.ok)</code>로 가로채서 친절한 로켓단 출몰 안내창을 띄워줍니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>방패 2: 대문자·소문자 자동 정리 (Trim & Lowercase)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  사용자가 <code className="text-amber-800 font-mono">PIKACHU</code>나 앞뒤에 공백을 넣어도 배달부가 헷갈리지 않도록 <code className="text-amber-800 font-mono">query.trim().toLowerCase()</code>로 정돈해 보내야 실패하지 않습니다.
                </p>
              </div>
            </div>

            {/* 주니어 개발자 성찰 회고 폼 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <strong className="text-xs sm:text-sm font-bold text-slate-900">주니어 개발자 15강 배움 회고 노트</strong>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{saveIndicator}</span>
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="ref-q1" className="block text-xs font-bold text-slate-700 mb-1">
                    Q1. 오늘 PokeAPI에서 가져온 스탯 숫자를 게이지 막대그래프로 직접 시각화하면서 어떤 점이 가장 재미있었나요?
                  </label>
                  <textarea
                    id="ref-q1"
                    rows={2}
                    value={reflectionQ1}
                    onChange={(e) => handleReflectionChange('q1', e.target.value)}
                    placeholder="예: 단순한 숫자 90이 아니라 노란색 스피드 게이지 바가 쭉 차오르는 모습을 보니까 진짜 게임 도감을 만든 것 같아 신기했어요!"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="ref-q2" className="block text-xs font-bold text-slate-700 mb-1">
                    Q2. 내가 만약 포켓몬 트레이너 게임을 만든다면, 도감에 또 어떤 재미있는 기능(소리 재생, 기술 목록 등)을 추가해보고 싶나요?
                  </label>
                  <textarea
                    id="ref-q2"
                    rows={2}
                    value={reflectionQ2}
                    onChange={(e) => handleReflectionChange('q2', e.target.value)}
                    placeholder="예: 포켓몬 울음소리 오디오(cries)를 재생하는 스피커 버튼을 달거나, 서로 전투력을 대결하는 배틀 시뮬레이터를 추가하고 싶어요."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
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
                  JUNIOR DEVELOPER GLOSSARY · 15강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 게임·웹 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 레스트풀 통신 규격 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-400" />
                      1. 레스트풀 통신 규격
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: RESTful API (Representational State Transfer)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">아키텍처/네트워크</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "도서관 책꽂이의 깔끔한 번호표! '포켓몬 번호 25번'만 말하면 전 세계 누구라도 정확히 피카츄 서랍을 열어볼 수 있는 전 세계 공통 약속!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹의 장점을 최대한 활용할 수 있도록 네트워크 자원(URI)과 행위(HTTP 메서드: GET, POST 등)를 명확하게 분리하여 설계한 현대적 웹 서비스 아키텍처 스타일입니다.
                </p>
              </div>
              {/* 용어 2: 스프라이트 그래픽 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-sky-400" />
                      2. 스프라이트 그래픽
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 스프라이트 이미지 (Sprite Image & Asset)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">그래픽/게임에셋</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "게임 속 캐릭터의 앞모습, 뒷모습, 공격 모션이 가득 담긴 투명 스티커 모음판!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 2D 컴퓨터 그래픽스나 웹 애플리케이션에서 캐릭터, 아이템 등의 그래픽 요소를 독립된 픽셀 레이어로 분리하여 동적으로 렌더링하고 합성하기 위한 비트맵 이미지 자산입니다.
                </p>
              </div>
              {/* 용어 3: 데이터 시각화 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      3. 데이터 시각화
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Data Visualization (Bar Chart & Gauge)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">UI/UX·데이터</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "복잡한 수학 성적표 대신 한눈에 쏙 들어오는 무지개색 게이지 바와 파워 그래프!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 방대한 원시 수치 데이터(Raw Data)를 그래프, 게이지 바, 차트 등 시각적 요소로 변환하여 사용자가 정보의 크기와 비율을 직관적으로 비교·판단할 수 있게 돕는 데이터 표현 기술입니다.
                </p>
              </div>
              {/* 용어 4: 입력 지연 제어 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-purple-400" />
                      4. 입력 지연 제어
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 검색 디바운싱 (Debounce & Throttling)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">성능 최적화</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "타자를 칠 때마다 매번 배달부를 출발시키지 않고, 타자를 다 칠 때까지 0.3초 동안 얌전히 숨죽여 기다리는 똑똑한 전령!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 연속적으로 발생하는 고빈도 이벤트(키보드 입력, 스크롤 등) 중 마지막 이벤트가 발생하고 일정 시간이 지난 후에야 단 한 번 콜백 함수를 실행시키는 호출 최적화 제어 기법입니다.
                </p>
              </div>
              {/* 용어 5: 객체 속성 맵핑 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-rose-400" />
                      5. 객체 속성 맵핑
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Object Mapping (Key-Value Transformation)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">데이터 변환</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "'electric'이라는 영어 단어를 보면 자동으로 '⚡ 전기 타입' 노란색 배지로 번역해주는 주머니 속 자동 통역기!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 서로 다른 데이터 모델이나 키-값 쌍(Key-Value Pair)을 참조하여, 원천 객체의 특정 속성값을 다른 이름, 언어, 스타일 포맷으로 일대일 변환해 재배열하는 데이터 전처리 작업입니다.
                </p>
              </div>
              {/* 용어 6: 로컬 임시 저장소 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-teal-400" />
                      6. 로컬 임시 저장소
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 클라이언트 캐시 (Client-side Caching)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">웹 스토리지</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "방금 본 피카츄 카드를 책상 위에 올려두었다가, 다시 피카츄를 부르면 먼 도서관까지 가지 않고 책상 위에서 0.01초 만에 꺼내오는 비법!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 한 번 서버로부터 수신한 정적 데이터나 리소스를 브라우저 메모리나 로컬 스토리지에 임시 저장해 두어, 동일한 요청 시 중복 네트워크 통신 비용을 없애고 로딩 속도를 극대화하는 성능 최적화 기법입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          {/* 3단 탭 네비게이션 헤더 */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('pokedex')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'pokedex'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>포켓몬 도감</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('inspect')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'inspect'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>원문 데이터</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>점검표</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: ⚡ 실시간 포켓몬 도감 검색기 콘솔 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'pokedex' && (
            <div className="space-y-4">
              {/* 검색 및 빠른 소환 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Search className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">도감 검색 & 소환</strong>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isFetching
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : isNotFound
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {deliveryStatus}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* 검색창 */}
                  <div>
                    <label htmlFor="react-poke-query" className="block text-[11px] font-bold text-slate-700 mb-1">
                      포켓몬 번호(1~1025) 또는 영문 이름
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        id="react-poke-query"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                        placeholder="예: 25 또는 pikachu"
                        className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => executeSearch()}
                        disabled={isFetching}
                        className="absolute right-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Search className="w-3 h-3" />
                        <span>검색</span>
                      </button>
                    </div>
                  </div>

                  {/* 빠른 소환 버튼들 */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-1">인기 포켓몬 빠른 소환</span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('25')}
                        className="py-1 px-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        ⚡ 피카츄 (#25)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('6')}
                        className="py-1 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 font-bold hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        🔥 리자몽 (#6)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('7')}
                        className="py-1 px-2.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 font-bold hover:bg-sky-100 transition-all cursor-pointer"
                      >
                        💧 꼬부기 (#7)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('1')}
                        className="py-1 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        🌿 이상해씨 (#1)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSearch('150')}
                        className="py-1 px-2.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 font-bold hover:bg-purple-100 transition-all cursor-pointer"
                      >
                        🔮 뮤츠 (#150)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ⚡ 비주얼 인터랙티브 포켓몬 도감 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                {currentPoke ? (
                  <>
                    {/* 도감 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[11px]">
                          #{String(currentPoke.id).padStart(4, '0')}
                        </span>
                        <div>
                          <strong className="text-sm sm:text-base font-bold text-slate-900 block">{currentPoke.name_kr}</strong>
                          <span className="text-[11px] font-mono text-slate-400 capitalize">{currentPoke.name}</span>
                        </div>
                      </div>

                      {/* 속성 뱃지 */}
                      <div className="flex items-center gap-1">
                        {currentPoke.types.map((t) => (
                          <span key={t.name} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${t.bg}`}>
                            {t.name_kr} ({t.name})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 중앙 일러스트 뷰어 & 반짝이 토글 */}
                    <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-50/50 via-slate-50 to-white border border-slate-200 flex flex-col items-center justify-center min-h-[180px]">
                      <button
                        type="button"
                        onClick={() => setIsShinyMode(!isShinyMode)}
                        className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                          isShinyMode
                            ? 'border-amber-400 bg-amber-50 text-amber-800 animate-pulse'
                            : 'border-slate-200 bg-white/90 text-slate-600 hover:text-amber-600 hover:border-amber-300'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{isShinyMode ? '이로치 모드 ON 🌟' : '이로치 모드 OFF'}</span>
                      </button>

                      <img
                        src={isShinyMode ? currentPoke.shinyImg : currentPoke.defaultImg}
                        alt={`${currentPoke.name_kr} 공식 일러스트`}
                        className="w-36 h-36 object-contain drop-shadow-md transition-transform duration-200 hover:scale-105"
                      />

                      {/* 기본 스펙 */}
                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 pt-2">
                        <div>
                          키: <strong className="text-slate-900 font-bold">{(currentPoke.height * 0.1).toFixed(1)}m ({currentPoke.height * 10}cm)</strong>
                        </div>
                        <div className="h-3 w-px bg-slate-200"></div>
                        <div>
                          몸무게: <strong className="text-slate-900 font-bold">{(currentPoke.weight * 0.1).toFixed(1)}kg</strong>
                        </div>
                        <div className="h-3 w-px bg-slate-200"></div>
                        <div>
                          경험치: <strong className="text-slate-900 font-bold">{currentPoke.exp} EXP</strong>
                        </div>
                      </div>
                    </div>

                    {/* 📊 전투력 스탯 막대그래프 시각화 */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5 text-amber-600" />
                          전투력 스탯 막대그래프 (Stats Gauge)
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">최대치 255 기준</span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        {/* HP */}
                        <div>
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-emerald-700">체력 (HP)</span>
                            <span className="font-mono text-slate-800">{currentPoke.stats.hp} / 255</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((currentPoke.stats.hp / 255) * 100))}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* 공격력 */}
                        <div>
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-rose-700">공격력 (Attack)</span>
                            <span className="font-mono text-slate-800">{currentPoke.stats.attack} / 255</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((currentPoke.stats.attack / 255) * 100))}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* 방어력 */}
                        <div>
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-sky-700">방어력 (Defense)</span>
                            <span className="font-mono text-slate-800">{currentPoke.stats.defense} / 255</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((currentPoke.stats.defense / 255) * 100))}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* 스피드 */}
                        <div>
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-amber-700">스피드 (Speed)</span>
                            <span className="font-mono text-slate-800">{currentPoke.stats.speed} / 255</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((currentPoke.stats.speed / 255) * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
                    <span className="text-xs font-bold text-rose-900 block">로켓단이 도감을 숨겼어요! 🚀</span>
                    <span className="text-[11px] text-rose-700">검색하신 포켓몬을 찾을 수 없습니다. 도감 번호(1~1025)를 확인해보세요.</span>
                  </div>
                )}
              </div>

              {/* 📡 오픈 API 통신 & 데이터 시각화 3단계 흐름 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>실시간 도감 통신 및 시각화 3단계 파이프라인</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-slate-800 block">엔드포인트 호출</strong>
                    <span className="text-slate-500 text-[10px]">/pokemon/25</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-slate-800 block">일러스트 추출</strong>
                    <span className="text-slate-500 text-[10px]">sprites.other</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-slate-800 block">스탯 바 시각화</strong>
                    <span className="text-slate-500 text-[10px]">(stat / 255)%</span>
                  </div>
                </div>
              </div>

              {/* 💡 포켓몬 도감 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>포켓몬 도감 4대 핵심 공식 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">도감 번호나 영문 소문자로 호출하기</strong>
                      <span className="text-slate-400">대문자나 공백이 섞이면 실패하니 toLowerCase().trim()으로 손질해 보내세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">official-artwork 서랍에서 고화질 낚아채기</strong>
                      <span className="text-slate-400">sprites.other['official-artwork'] 폴더에 진짜 멋진 공식 그림이 들어있어요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">숫자는 막대그래프로 변환해 시각화</strong>
                      <span className="text-slate-400">숫자 나열보다 가로 게이지 바 그래프가 100배 더 직관적이고 게임다워요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">없는 포켓몬 404 에러 낚아채기</strong>
                      <span className="text-slate-400">로켓단 출몰 안내 화면을 띄워 사용자가 당황하지 않도록 지켜주세요.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: 🧾 원문 JSON vs 도감 스펙 비교 돋보기 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'inspect' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">PokeAPI 원문 vs 도감 객체</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {compareMode === 'raw' ? 'Raw JSON View' : 'Cleaned View'}
                  </span>
                </div>

                {/* 보기 모드 토글 */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCompareMode('raw')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      compareMode === 'raw'
                        ? 'bg-white text-amber-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    날것의 원문 (Raw JSON)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareMode('cleaned')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      compareMode === 'cleaned'
                        ? 'bg-white text-amber-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    정제된 도감 객체 (Cleaned)
                  </button>
                </div>

                {/* 패킷 메타 정보 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <strong className="text-slate-800">PokeAPI v2 Public Server</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Protocol:</span>
                    <strong className="text-slate-800">HTTPS RESTful GET</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Stats:</span>
                    <strong className="text-slate-800">{currentPoke ? '4대 핵심 전투 스탯' : '0개 항목 (미발견)'}</strong>
                  </div>
                </div>

                {/* 코드/데이터 뷰어 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {compareMode === 'raw' ? 'PokeAPI 원문 JSON 패킷 (Raw Endpoint Response)' : '정제된 도감 데이터 객체 (Cleaned Model)'}
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {compareMode === 'raw'
                      ? JSON.stringify(
                          currentPoke
                            ? {
                                id: currentPoke.id,
                                name: currentPoke.name,
                                base_experience: currentPoke.exp,
                                height: currentPoke.height,
                                weight: currentPoke.weight,
                                sprites: {
                                  front_default: `https://raw.githubusercontent.com/.../${currentPoke.id}.png`,
                                  other: {
                                    'official-artwork': {
                                      front_default: currentPoke.defaultImg,
                                      front_shiny: currentPoke.shinyImg
                                    }
                                  }
                                },
                                stats: [
                                  { base_stat: currentPoke.stats.hp, stat: { name: 'hp' } },
                                  { base_stat: currentPoke.stats.attack, stat: { name: 'attack' } },
                                  { base_stat: currentPoke.stats.defense, stat: { name: 'defense' } },
                                  { base_stat: currentPoke.stats.speed, stat: { name: 'speed' } }
                                ],
                                types: currentPoke.types.map((t, idx) => ({ slot: idx + 1, type: { name: t.name } }))
                              }
                            : {
                                error: '404 Not Found',
                                detail: 'Cannot find pokemon. Team Rocket stole the pokedex data.'
                              },
                          null,
                          2
                        )
                      : JSON.stringify(
                          currentPoke
                            ? {
                                id: currentPoke.id,
                                name: currentPoke.name,
                                name_kr: currentPoke.name_kr,
                                height_m: currentPoke.height * 0.1,
                                weight_kg: currentPoke.weight * 0.1,
                                types: currentPoke.types.map((t) => t.name_kr),
                                stats: currentPoke.stats,
                                artwork: currentPoke.defaultImg
                              }
                            : {
                                error: '404 Not Found',
                                message: '존재하지 않는 포켓몬입니다.'
                              },
                          null,
                          2
                        )}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 3: ✅ 자가 점검 체크리스트 (6문항 & 16강 언락) */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">15강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 16강이 열려요</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600">
                    {completedCount} / 6 ({progressPercent}%)
                  </span>
                </div>

                {/* 진행률 바 */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* 6개 문항 리스트 */}
                <div className="space-y-2 pt-1">
                  {[
                    {
                      id: 'check-1',
                      title: '1. PokeAPI의 개방성과 가치',
                      desc: '전 세계 개발자들이 사용하는 PokeAPI가 키 없이 무료로 개방된 원리를 이해했다.'
                    },
                    {
                      id: 'check-2',
                      title: '2. 도감 엔드포인트 호출 규격',
                      desc: '포켓몬 번호(25)나 영문 이름(pikachu)을 URL 엔드포인트 끝에 붙여 호출하는 규칙을 익혔다.'
                    },
                    {
                      id: 'check-3',
                      title: '3. 고화질 스프라이트 일러스트 추출',
                      desc: 'sprites.other["official-artwork"] 객체에서 3D 공식 이미지를 꺼냈다.'
                    },
                    {
                      id: 'check-4',
                      title: '4. 전투력 스탯 바 시각화',
                      desc: 'HP, 공격력, 방어력, 스피드 숫자를 최대 255 기준의 가로 막대그래프로 시각화했다.'
                    },
                    {
                      id: 'check-5',
                      title: '5. 검색 오타 404 에러 방패 (Fallback)',
                      desc: '없는 포켓몬 검색 시 에러로 꺼지지 않고 친절한 로켓단 출몰 안내 화면을 띄우는 예외 처리를 익혔다.'
                    },
                    {
                      id: 'check-6',
                      title: '6. 실시간 포켓몬 도감 조작',
                      desc: '원하는 포켓몬을 검색하고 반짝이(Shiny) 모드를 켜보는 인터랙션을 완주했다.'
                    }
                  ].map((item, idx) => (
                    <label
                      key={item.id}
                      htmlFor={item.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={checkedItems[idx]}
                        onChange={() => handleCheck(idx)}
                        className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900 block mb-0.5">{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* 16강 언락 카드 */}
                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <strong className="text-sm font-bold">15강 미션 완벽 정복! 🎉</strong>
                    </div>
                    <p className="text-xs text-amber-100 leading-relaxed font-normal">
                      PokeAPI의 REST 엔드포인트, 고화질 스프라이트 추출, 스탯 막대그래프 시각화를 완벽하게 마스터하셨습니다! 다음 16강 실시간 날씨 및 옷차림 코디네이터 프로젝트로 모험을 이어가세요.
                    </p>
                    <a
                      href="../16-weather-coord/index.html"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-amber-800 hover:bg-amber-50 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>16강: 날씨 & 옷차림 코디네이터 도전하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
