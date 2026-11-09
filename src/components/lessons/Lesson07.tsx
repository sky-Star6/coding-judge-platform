import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  Lock,
  Unlock,
  Award,
  Search,
  Code2,
  Gamepad2,
  Eye,
  FileCode,
  CheckSquare,
  BookOpen,
  MousePointer,
  ShoppingCart,
  Zap
} from 'lucide-react';

interface Lesson07Props {
  onComplete?: () => void;
}

type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type SkinType = 'choco' | 'donut' | 'star';

interface SkinInfo {
  name: string;
  emoji: string;
  unit: string;
}

const SKINS: Record<SkinType, SkinInfo> = {
  choco: { name: '초코칩 쿠키', emoji: '🍪', unit: '개' },
  donut: { name: '딸기 도넛', emoji: '🍩', unit: '개' },
  star: { name: '황금 별사탕', emoji: '⭐', unit: '개' }
};

interface KillerQuest {
  id: number;
  emoji: string;
  title: string;
  weakness: string;
  prompt: string;
  aiMagic: string;
  magicReason: string;
}

const KILLER_QUESTS: KillerQuest[] = [
  {
    id: 1,
    emoji: '🍪',
    title: '1. 쿠키클리커 3대 필수 로직(변수+클릭+DOM) 소환 퀘스트',
    weakness: '자바스크립트의 변수, 이벤트 리스너, DOM 조작 연결',
    prompt: `[Goal]:
웹 브라우저에서 버튼을 누를 때마다 점수가 1씩 올라가 화면에 실시간으로 표시되는 '가장 심플한 쿠키클리커 자바스크립트' 코드를 작성해줘.

[Actor]:
초보자에게 코딩을 가르치는 친절한 주니어 웹 게임 튜터

[Condition]:
- 세 가지 핵심 요소가 반드시 들어갈 것:
  1) 점수를 기억하는 변수 let score = 0;
  2) 점수를 1 증가시키고 화면을 갱신하는 함수 function handleClick()
  3) 버튼에 연결된 클릭 이벤트 addEventListener('click', handleClick)
- 화면의 <span id="score"> 요소를 innerText로 갱신할 것.
- 초보자도 1초 만에 이해할 수 있도록 매 줄마다 쉬운 한국어 주석을 달아줘.

[Output Format]:
- HTML + JS가 포함된 순수 코드 블록
- 변수, 함수, 이벤트의 역할을 어린이 눈높이로 1줄씩 요약`,
    aiMagic:
      '변수 선언부터 DOM 탐색, 이벤트 리스너 부착까지 단 10줄 이내의 가장 완벽하고 군더더기 없는 초보자용 표준 스크립트를 즉시 완성해 줍니다!',
    magicReason:
      '자바스크립트의 이벤트 기반 프로그래밍(Event-driven Programming) 모델은 사용자의 동작(Input)➔연산(Process)➔화면 갱신(Output)의 표준 3단 구조를 따르기 때문입니다.'
  },
  {
    id: 2,
    emoji: '🕵️',
    title: '2. Undefined와 NaN 버그 탐정 QA 검사관 퀘스트',
    weakness: '문자열과 숫자의 덧셈 혼동("1" + 1 = "11") 및 미선언 변수 참조 버그',
    prompt: `[Goal]:
내가 작성한 자바스크립트 코드에서 숫자가 이상하게 더해지거나 오류가 터지는 '치명적 버그 3가지'를 찾아 교정해줘.

[Actor]:
구글 크롬 개발자 도구 디버깅 전문 시니어 QA 엔지니어

[Condition]:
- 검사할 버그 코드:
  let cookieCount = "0";
  function clickCookie() {
    cookieCount = cookieCount + 1;
    document.getElementById("count").innerText = cookieCount;
    if (cookiecount >= 10) {
      alert("황금 오븐 열림!");
    }
  }
- 문제점:
  1) 1을 더했더니 1이 아니라 "01", "011", "0111"로 늘어남!
  2) 오븐 열림 알림이 영원히 뜨지 않음!
- 원인을 어린이 눈높이로 진단하고 완벽한 정답 코드를 제시해줘.

[Output Format]:
1. 왜 "0111"로 늘어났는지 '문자열과 숫자 덧셈의 차이' 해설
2. 왜 알림창이 안 떴는지 '대소문자 오타(cookiecount)' 지적
3. 말끔하게 버그가 고쳐진 올바른 자바스크립트 코드`,
    aiMagic:
      "초보자가 가장 많이 울음을 터뜨리는 '문자열 이어붙이기 버그'와 '카멜케이스 오타'를 1초 만에 족집게처럼 잡아내어 속 시원한 해설을 선사합니다!",
    magicReason:
      '자바스크립트의 동적 타입 변환(Type Coercion) 규칙상 따옴표가 붙은 문자열과 숫자를 더하면 수학 덧셈이 아닌 글자 붙이기가 실행되기 때문입니다.'
  },
  {
    id: 3,
    emoji: '🛒',
    title: '3. 잔액 부족 방어막! 조건문(if/else) 상점 업그레이드 퀘스트',
    weakness: '조건문 if (cookies >= cost) 검증 없이 마이너스 통장이 되는 로직 결함 방지',
    prompt: `[Goal]:
쿠키클리커 게임에서 쿠키가 부족할 때는 구매를 거절하고, 충분할 때만 점수를 깎고 능력을 올려주는 '조건문(if/else) 상점 시스템'을 만들어줘.

[Actor]:
게임 경제 밸런스 및 부정 결제 방지 전문 게임 서버 개발자

[Condition]:
- 업그레이드 아이템: '황금 오븐' (가격: 쿠키 10개, 효과: 클릭당 쿠키 +1 영구 증가)
- 구매 함수 buyOven() 규칙:
  1) 현재 쿠키가 10개 이상인지 if (cookies >= 10) 조건으로 검사할 것.
  2) 충분하다면: 쿠키 10개를 차감하고(cookies -= 10), 클릭 파워를 1 올리고(clickPower += 1), 화면을 갱신.
  3) 부족하다면: alert('쿠키가 부족합니다! 10개를 모아오세요!') 경고창을 띄우고 점수를 깎지 말 것.

[Output Format]:
- 완벽하게 검증된 자바스크립트 코드 함수
- if와 else가 어떻게 문지기 역할을 하는지 주니어 개발자를 위한 해설`,
    aiMagic:
      '쿠키가 0개인데도 버튼을 눌러 점수가 마이너스(-10개)로 떨어지는 엉터리 버그를 철통같이 막아내는 조건문 가드(Guard) 로직을 설계해 줍니다.',
    magicReason:
      '컴퓨터 프로그램의 모든 지능은 조건 분기(Branching)에서 출발합니다. 참(true)과 거짓(false)을 판단하는 if문이 게임의 법칙과 경제를 수호합니다.'
  },
  {
    id: 4,
    emoji: '⏰',
    title: '4. 잠자는 동안에도 구워진다! 요정 셰프 자동 타이머(setInterval) 퀘스트',
    weakness: '비동기 타이머 setInterval과 중복 실행 방지 플래그 관리',
    prompt: `[Goal]:
플레이어가 손가락 하나 까딱하지 않아도 1초마다 자동으로 쿠키가 1개씩 쑥쑥 늘어나는 '요정 셰프 자동 생산 타이머' 코드를 만들어줘.

[Actor]:
방치형(Idle) 모바일 게임 전문 프로그래머

[Condition]:
- 자바스크립트 내장 타이머 setInterval() 함수를 활용할 것.
- 요정 셰프 고용 함수 hireFairy() 규칙:
  1) 가격: 쿠키 30개 (쿠키가 부족하면 구매 불가)
  2) 이미 요정을 고용했다면 타이머가 2개, 3개 겹쳐서 폭주하지 않도록 중복 고용 방지 플래그(isFairyHired)를 둘 것.
  3) 고용 성공 시 1초(1000밀리초)마다 cookies를 1씩 올리고 화면을 실시간 업데이트할 것.

[Output Format]:
- 요정 셰프 고용 및 setInterval 자동 실행 자바스크립트 코드
- 타이머가 겹쳐서 미친 듯이 숫자가 폭주하는 버그를 막는 비결 2줄 요약`,
    aiMagic:
      "버튼을 연타해서 타이머가 여러 개 중첩되어 초당 수백 개씩 올라가는 악명 높은 '타이머 폭주 버그'를 불리언 플래그로 완벽하게 차단합니다.",
    magicReason:
      '자바스크립트 이벤트 루프(Event Loop)의 타이머 API는 백그라운드 큐에서 주기적으로 실행되므로, 이전 타이머 상태를 철저히 추적 관리해야 합니다.'
  },
  {
    id: 5,
    emoji: '🔥',
    title: '5. 10콤보 달성 시 피버 타임(Fever Time) 2배 보너스 퀘스트',
    weakness: '콤보 카운터와 타임아웃을 결합한 동적 게임 상태 머신 설계',
    prompt: `[Goal]:
쿠키를 빠르게 10번 연속으로 클릭하면 화면이 황금빛으로 물들며 5초간 점수가 2배로 폭발하는 '피버 타임(Fever Time)' 시스템을 자바스크립트로 구현해줘.

[Actor]:
오락실 아케이드 게임 타격감 & 보너스 연출 전문 기획자

[Condition]:
- 요구사항:
  1) 1.5초 이내에 연속으로 쿠키를 누를 때마다 combo 수가 1씩 누적됨.
  2) combo가 10에 도달하면 즉시 5초간 '피버 모드' 가동 (isFever = true, 클릭당 +2 쿠키).
  3) 피버 모드가 시작되면 화면 상단에 '🔥 FEVER TIME! 5초간 쿠키 2배!' 배너 노출.
  4) setTimeout()을 이용해 정확히 5초 뒤 피버 모드가 해제되고 콤보가 0으로 초기화될 것.

[Output Format]:
- 콤보 계산과 setTimeout 타이머가 결합된 완벽한 게임 스크립트
- 플레이어가 지루하지 않게 긴장감을 주는 콤보 타임아웃 원리 해설`,
    aiMagic:
      "단순한 클릭 노가다 게임을 손에 땀을 쥐게 만드는 아케이드 명작 게임으로 변신시키는 '콤보-피버 상태 머신' 코드를 환상적으로 직조해 냅니다!",
    magicReason:
      "게임 루프에서 '상태(State)'와 '시간 제약(Timeout)'을 결합하면 플레이어의 뇌에 도파민을 분비시키는 즉각적인 인터랙티브 보상 체계가 완성됩니다."
  }
];

interface GlossaryTerm {
  id: number;
  emoji: string;
  term: string;
  caption: string;
  kidMetaphor: string;
  devDefinition: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 1,
    emoji: '🧠',
    term: 'JavaScript',
    caption: 'JavaScript / 웹 브라우저 동적 제어 언어',
    kidMetaphor: '멈춰 있는 장난감 로봇에 배터리를 끼우고 지능을 주는 두뇌와 심장!',
    devDefinition:
      '정적인 HTML/CSS 웹 문서에 사용자 입력 처리, 연산, 비동기 통신 등 동적 인터랙션을 부여하는 표준 프로그래밍 언어.'
  },
  {
    id: 2,
    emoji: '📦',
    term: '변수',
    caption: 'Variable / 이름표가 붙은 데이터 기억 상자',
    kidMetaphor: "'점수', '쿠키'라는 이름표를 붙여두고 사탕을 넣었다 뺐다 하는 마법 주머니!",
    devDefinition:
      '컴퓨터 메모리 공간에 이름을 붙여 프로그램 실행 중 변화하는 숫자, 문자열 등의 데이터를 저장하고 재사용하는 저장소.'
  },
  {
    id: 3,
    emoji: '👂',
    term: '이벤트 리스너',
    caption: 'Event Listener / 사용자의 행동을 감지하는 귀와 센서',
    kidMetaphor: '"누가 벨을 누르면 문을 열어줘!" 하고 문 앞에서 기다리는 문지기 귀!',
    devDefinition:
      '마우스 클릭, 키보드 타이핑 등 특정 사건(Event)이 일어났을 때 사전에 등록된 자바스크립트 함수를 실행하는 감시 메커니즘.'
  },
  {
    id: 4,
    emoji: '🔄',
    term: 'DOM 조작',
    caption: 'DOM Manipulation / 웹 요소 동적 변경 기술',
    kidMetaphor: '칠판에 적힌 점수를 지우개로 쓱 지우고 새로운 점수를 분필로 다시 적는 손길!',
    devDefinition:
      '자바스크립트를 이용해 HTML 문서의 텍스트, 속성, 스타일을 실시간으로 변경하여 화면을 새로고침 없이 갱신하는 기술.'
  },
  {
    id: 5,
    emoji: '🚦',
    term: '조건문',
    caption: 'Conditional Statement (if / else) / 갈림길 판단 신호등',
    kidMetaphor: '"지갑에 1000원이 있으면 아이스크림을 사고, 없으면 그냥 집에 가자!"',
    devDefinition:
      '주어진 논리식의 참(true) 또는 거짓(false) 여부에 따라 서로 다른 코드 블록을 선택적으로 실행하는 제어문.'
  }
];

interface CheckItem {
  id: number;
  text: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 1,
    text: '웹을 만드는 3총사 중 JavaScript(두뇌와 살아 움직이는 동작)의 역할을 설명할 수 있나요?'
  },
  {
    id: 2,
    text: '변수(let cookies = 0;)가 컴퓨터 메모리에 값을 기억하는 상자임을 이해했나요?'
  },
  {
    id: 3,
    text: '마우스 클릭 이벤트(click)가 발생했을 때 함수를 실행하는 원리를 알고 있나요?'
  },
  {
    id: 4,
    text: '가상 쿠키클리커 콘솔에서 쿠키를 굽고, 황금 오븐과 요정 셰프 업그레이드를 체험했나요?'
  },
  {
    id: 5,
    text: '최신 AI에게 피버 타임이나 상점 조건문이 포함된 게임 스크립트 소환 퀘스트를 성공시켰나요?'
  },
  {
    id: 6,
    text: '등호(=)의 대입 의미와 대소문자 구분의 중요성을 주니어 개발자 언어로 설명할 수 있나요?'
  }
];

export const Lesson07: React.FC<Lesson07Props> = ({ onComplete }) => {
  const [stage, setStage] = useState<StageType>('stage1');
  const [cookies, setCookies] = useState<number>(0);
  const [clickPower, setClickPower] = useState<number>(1);
  const [ovenLevel, setOvenLevel] = useState<number>(0);
  const [isFairyHired, setIsFairyHired] = useState<boolean>(false);
  const [currentSkin, setCurrentSkin] = useState<SkinType>('choco');
  const [floatingToast, setFloatingToast] = useState<string | null>(null);
  const [copiedJs, setCopiedJs] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  // 요정 셰프 자동 생산 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isFairyHired) {
      timer = setInterval(() => {
        setCookies(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isFairyHired]);

  // 로컬 스토리지 체크리스트 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_07_checklist');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('ai_lesson_07_checklist', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      if (next.length === CHECKLIST_ITEMS.length && onComplete) {
        onComplete();
      }
      return next;
    });
  };

  const handleCookieClick = () => {
    setCookies(prev => prev + clickPower);
    setFloatingToast(`+${clickPower}`);
    setTimeout(() => setFloatingToast(null), 400);
  };

  const handleBuyOven = () => {
    const ovenCost = 10;
    if (cookies >= ovenCost) {
      setCookies(prev => prev - ovenCost);
      setClickPower(prev => prev + 1);
      setOvenLevel(prev => prev + 1);
      setFloatingToast('오븐 업그레이드! ⚡');
      setTimeout(() => setFloatingToast(null), 500);
    } else {
      alert(`쿠키가 부족합니다! 황금 오븐은 ${ovenCost}쿠키가 필요합니다.`);
    }
  };

  const handleBuyFairy = () => {
    const fairyCost = 30;
    if (isFairyHired) {
      alert('요정 셰프는 이미 주방에서 열심히 일하고 있습니다! ✨');
      return;
    }
    if (cookies >= fairyCost) {
      setCookies(prev => prev - fairyCost);
      setIsFairyHired(true);
      setFloatingToast('요정 셰프 출근! 🧚');
      setTimeout(() => setFloatingToast(null), 500);
    } else {
      alert(`쿠키가 부족합니다! 요정 셰프 고용비는 ${fairyCost}쿠키입니다.`);
    }
  };

  const handleResetGame = () => {
    setCookies(0);
    setClickPower(1);
    setOvenLevel(0);
    setIsFairyHired(false);
  };

  const jsCodeString = `// 🍪 쿠키클리커 핵심 자바스크립트 로직 (game.js)

// 1. 상태 변수 선언 (데이터 기억 상자)
let cookies = ${cookies};
let clickPower = ${clickPower};
let ovenLevel = ${ovenLevel};
let isFairyHired = ${isFairyHired};

// 2. 쿠키 클릭 함수 (플레이어 조작 반응)
function handleCookieClick() {
  cookies = cookies + clickPower;
  updateUI();
}

// 3. 상점 업그레이드 함수 (조건문 if / else)
function buyOven() {
  const cost = 10;
  if (cookies >= cost) {
    cookies = cookies - cost;
    clickPower = clickPower + 1;
    ovenLevel = ovenLevel + 1;
    updateUI();
  } else {
    alert("쿠키가 부족합니다! 10개를 모아오세요!");
  }
}

// 4. 요정 셰프 자동 생산 타이머 (비동기 setInterval)
function hireFairy() {
  if (cookies >= 30 && !isFairyHired) {
    cookies = cookies - 30;
    isFairyHired = true;
    setInterval(() => {
      cookies = cookies + 1;
      updateUI();
    }, 1000);
    updateUI();
  }
}

// 5. 화면 갱신 함수 (DOM 조작)
function updateUI() {
  document.getElementById('game-cookie-count').innerText = cookies;
  document.getElementById('game-click-power').innerText = '+' + clickPower;
}`;

  const handleCopyJs = async () => {
    try {
      await navigator.clipboard.writeText(jsCodeString);
      setCopiedJs(true);
      setTimeout(() => setCopiedJs(false), 2000);
    } catch (e) {
      // fallback
    }
  };

  const handleCopyPrompt = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (e) {
      // fallback
    }
  };

  const progressPercent = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100);
  const isAllChecked = checkedItems.length === CHECKLIST_ITEMS.length;

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800">
      {/* ===================================================================
          [GNB HEADER] 풀 너비 헤더 & 4단계 버튼 스위처 (1강 최신 표준)
          =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [왼쪽 끝]: 브랜드 로고 & 강의 제목 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="/materials/ai/index.html"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-200 hover:opacity-90 transition-opacity"
              aria-label="교육과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/materials/ai/index.html"
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline"
              >
                AI·코딩 24강
              </a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                7강: 자바스크립트로 반응하는 게임 화면 (클릭 이벤트와 변수)
              </span>
            </div>
          </div>

          {/* [오른쪽]: 4단계 스테이지 스위처 버튼 그룹 (오른쪽 정렬) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200" role="tablist" aria-label="7강 4단계 스테이지">
            <button
              type="button"
              onClick={() => setStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                stage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={stage === 'stage1'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage === 'stage1' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </span>
              <span>미션 & 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                stage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={stage === 'stage2'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage === 'stage2' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </span>
              <span>쿠키클리커 실습</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                stage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={stage === 'stage3'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage === 'stage3' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                3
              </span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                stage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={stage === 'stage4'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage === 'stage4' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                4
              </span>
              <span>자가 점검</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                stage === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              role="tab"
              aria-selected={stage === 'all'}
            >
              <span>전체 보기</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 모바일 전용 스테이지 탭 스위처 */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-around gap-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setStage('stage1')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
            stage === 'stage1' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          1. 원리
        </button>
        <button
          type="button"
          onClick={() => setStage('stage2')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
            stage === 'stage2' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          2. 클릭게임
        </button>
        <button
          type="button"
          onClick={() => setStage('stage3')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
            stage === 'stage3' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          3. 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setStage('stage4')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
            stage === 'stage4' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          4. 점검
        </button>
        <button
          type="button"
          onClick={() => setStage('all')}
          className={`px-2.5 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
            stage === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          전체
        </button>
      </div>

      {/* ===================================================================
          단일 컨테이너 몰입형 워크스페이스 (15.6인치 최적화)
          =================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ===================================================================
            [STAGE 01] 퀘스트 미션 브리핑 & 핵심 개념 원리
            =================================================================== */}
        {(stage === 'stage1' || stage === 'all') && (
          <section className="space-y-6">
            {/* 상단 미션 브리핑 카드 */}
            <article className="bg-gradient-to-br from-amber-600 via-orange-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-amber-100 text-sm font-mono font-bold tracking-wider uppercase border border-white/20">
                  시즌 2 · 7강 미션 브리핑
                </span>
                <span className="text-sm text-amber-200 font-semibold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  클릭 이벤트 & 동적 게임 UI
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  화면을 클릭하면 살아 움직인다! 자바스크립트 쿠키클리커를 만들어봅시다!
                </h2>
                <p className="text-sm text-amber-100 mt-2 leading-relaxed">
                  5강(HTML 뼈대)과 6강(CSS 스타일링)을 통해 예쁜 화면을 완성했습니다. 하지만 아직 버튼을 눌러도 화면 숫자가 올라가거나 점수가 저장되지 않습니다.
                  오늘 <strong>웹의 두뇌와 심장인 JavaScript</strong>를 배우면, 마우스 클릭을 감지하여 점수를 올리고, 오븐을 업그레이드하고, 요정 셰프를 고용하는
                  진짜 살아 숨 쉬는 웹 아케이드 게임을 내 손으로 직접 만들 수 있습니다!
                </p>
              </div>

              {/* 3대 도전 목표 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>1. JS 3총사 마법</span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    변수(기억 상자), 함수(마법 주문), 이벤트 리스너(클릭 감지)의 역할을 정복합니다.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <MousePointer className="w-4 h-4" />
                    <span>2. 쿠키클리커 구현</span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    클릭 시 점수 증가, 조건문 상점(오븐 구매), 자동 타이머(요정 셰프)를 직접 조작합니다.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Code2 className="w-4 h-4" />
                    <span>3. AI 게임 로직 소환</span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    피버 타임 2배 보너스, 오류 방어막 등 완성도 높은 게임 스크립트를 AI에게 주문합니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 핵심 개념 원리 탐구 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>💡 주니어 개발자를 위한 핵심 개념 3가지</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  버튼을 누를 때 컴퓨터 브라우저 내부에서 어떤 일이 일어나는지 직관적으로 살펴봅시다.
                </p>
              </div>

              <div className="space-y-4">
                {/* 개념 1: JS 3총사 */}
                <div className="p-4.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <h4 className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <span>🧠</span>
                    <span>1. 자바스크립트를 움직이는 3총사: 변수, 함수, 이벤트</span>
                  </h4>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    게임이 플레이어의 조작에 반응하려면 다음 3가지 핵심 요소가 톱니바퀴처럼 맞물려 돌아가야 합니다:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <span className="font-mono font-bold text-amber-700 text-sm">let cookies = 0;</span>
                      <p className="text-sm text-slate-600 mt-1"><strong>변수 (기억 상자):</strong> 현재 구운 쿠키 개수나 플레이어의 점수를 잊지 않고 담아두는 상자입니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <span className="font-mono font-bold text-amber-700 text-sm">function bake() {`{ ... }`}</span>
                      <p className="text-sm text-slate-600 mt-1"><strong>함수 (마법 주문):</strong> "쿠키를 1개 더하고 화면에 표시해!"라는 일련의 명령들을 묶어둔 레시피입니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-amber-200">
                      <span className="font-mono font-bold text-amber-700 text-sm">btn.onclick = bake;</span>
                      <p className="text-sm text-slate-600 mt-1"><strong>이벤트 (감각 기관):</strong> 마우스 클릭을 감지하여 마법 주문(함수)을 자동으로 실행시키는 방아쇠입니다.</p>
                    </div>
                  </div>
                </div>

                {/* 개념 2: DOM 조작 */}
                <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🔄</span>
                    <span>2. DOM 조작: 기억 상자의 숫자를 화면에 실시간으로 반영하기</span>
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    자바스크립트 변수 속 숫자가 100개가 되어도, 화면의 글자를 바꿔주지 않으면 플레이어는 알 수 없습니다.
                    이때 브라우저 화면의 글자를 실시간으로 갈아 끼우는 기술을 <strong>DOM(문서 객체 모델) 조작</strong>이라고 부릅니다:
                  </p>
                  <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-sm leading-relaxed">
                    <span className="text-slate-400">// 1. HTML에서 id가 'cookie-count'인 글자 요소를 찾아온다</span><br />
                    <span className="text-cyan-400">const</span> display = document.getElementById(<span className="text-amber-300">'cookie-count'</span>);<br /><br />
                    <span className="text-slate-400">// 2. 그 요소의 글자(innerText)를 변수값으로 쏙 교체한다!</span><br />
                    display.innerText = cookies;
                  </div>
                </div>

                {/* 개념 3: 주니어 개발자의 황금 원칙 */}
                <div className="p-4.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-2">
                  <h4 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                    <span>⚡</span>
                    <span>3. 주니어 개발자가 절대 헷갈리지 말아야 할 자바스크립트 2대 원칙</span>
                  </h4>
                  <div className="space-y-2 text-sm text-indigo-900">
                    <p className="leading-relaxed">
                      <strong>원칙 1: 등호(=)는 '같다'가 아니라 '상자에 쏙 넣기(대입)'다!</strong><br />
                      수학에서 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">x = x + 1</code>은 말이 안 되지만, 프로그래밍에서는 "기존 x 상자의 값에 1을 더해서 다시 x 상자에 넣어라!"라는 가장 중요한 대입 명령입니다.
                    </p>
                    <p className="leading-relaxed">
                      <strong>원칙 2: 대소문자를 틀리면 컴퓨터는 다른 사람으로 안다!</strong><br />
                      자바스크립트는 대소문자를 아주 엄격하게 구분합니다. <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">cookieCount</code>와 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">cookiecount</code>는 컴퓨터에게 완전히 다른 별개의 상자이므로 카멜케이스(camelCase) 표기법을 정확히 지켜야 합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 하단 단계 이동 버튼 */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStage('stage2')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 가상 쿠키클리커 실습</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </section>
        )}

        {/* ===================================================================
            [STAGE 02] 가상 AI 실습 콘솔 - 쿠키클리커 인터랙티브 아케이드
            =================================================================== */}
        {(stage === 'stage2' || stage === 'all') && (
          <section className="space-y-6">
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <Gamepad2 className="w-5 h-5" />
                    <span className="text-sm font-extrabold uppercase tracking-wider">
                      STAGE 02 · 가상 AI 실습 콘솔
                    </span>
                  </div>
                  <h3 id="stage-2-title" class="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    쿠키클리커 아케이드 시뮬레이터 & 실시간 JS 로직 뷰어
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    거대 쿠키를 클릭하여 점수를 올리고, 상점에서 오븐과 요정 셰프를 구매해 보세요!
                  </p>
                </div>

                {/* 상단 스킨 스위처 3종 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">디저트 스킨:</span>
                  {(['choco', 'donut', 'star'] as SkinType[]).map(skinKey => (
                    <button
                      key={skinKey}
                      type="button"
                      onClick={() => setCurrentSkin(skinKey)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                        currentSkin === skinKey
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {SKINS[skinKey].emoji} {SKINS[skinKey].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2열 워크스페이스: 왼쪽 게임 인터랙션, 오른쪽 자바스크립트 코드 뷰어 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 왼쪽: 쿠키클리커 게임기 */}
                <div className="flex flex-col space-y-3 bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/80 shadow-inner">
                  
                  {/* 점수 및 상태판 */}
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                    <div>
                      <span className="text-sm font-bold text-amber-800 block">구운 디저트 개수:</span>
                      <div className="flex items-baseline gap-1.5">
                        <span id="game-cookie-count" className="text-3xl sm:text-4xl font-extrabold text-amber-900 font-mono">
                          {cookies}
                        </span>
                        <span className="text-base font-bold text-amber-700">
                          {SKINS[currentSkin].unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-sm font-semibold text-amber-700 block">
                        클릭 파워: <strong className="font-mono text-amber-900">+{clickPower}</strong>
                      </span>
                      <span className={`text-sm font-bold block ${isFairyHired ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {isFairyHired ? '요정 셰프: 자동 굽기 중! 🧚' : '요정 셰프: 미고용'}
                      </span>
                    </div>
                  </div>

                  {/* 거대 클릭 버튼 영역 */}
                  <div className="py-6 flex flex-col items-center justify-center relative">
                    <button
                      type="button"
                      id="cookie-click-btn"
                      onClick={handleCookieClick}
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-2 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center border-4 border-amber-200 select-none"
                      aria-label="쿠키 굽기 버튼"
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center text-6xl">
                        {SKINS[currentSkin].emoji}
                      </div>
                    </button>

                    {/* 클릭 피드백 플로팅 텍스트 */}
                    {floatingToast && (
                      <div className="absolute top-2 right-12 sm:right-16 font-extrabold text-amber-700 text-lg animate-bounce pointer-events-none">
                        {floatingToast}
                      </div>
                    )}
                  </div>

                  {/* 업그레이드 상점 2종 */}
                  <div className="space-y-2 pt-1">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-amber-700" />
                      <span>디저트 주방 업그레이드 상점:</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* 황금 오븐 */}
                      <button
                        type="button"
                        id="btn-buy-oven"
                        onClick={handleBuyOven}
                        className="p-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-left transition-all shadow-2xs cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">⚡ 황금 오븐</span>
                          <span className="text-sm font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Lv.{ovenLevel}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 mt-1">클릭당 생산량 +1 증가</span>
                        <span className="text-sm font-bold text-amber-700 font-mono mt-2 block">
                          비용: 10 쿠키
                        </span>
                      </button>

                      {/* 요정 셰프 */}
                      <button
                        type="button"
                        id="btn-buy-fairy"
                        onClick={handleBuyFairy}
                        className="p-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-left transition-all shadow-2xs cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">🧚 요정 셰프</span>
                          <span
                            className={`text-sm font-bold px-1.5 py-0.5 rounded ${
                              isFairyHired
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate-400 bg-slate-100'
                            }`}
                          >
                            {isFairyHired ? '고용 완료 ✨' : '미고용'}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 mt-1">1초마다 자동 쿠키 1개 굽기</span>
                        <span className="text-sm font-bold text-amber-700 font-mono mt-2 block">
                          비용: 30 쿠키
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 하단 리셋 컨트롤러 */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleResetGame}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-slate-700 text-sm font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>게임 리셋</span>
                    </button>
                  </div>
                </div>

                {/* 오른쪽: 실제 실행 중인 자바스크립트 코드 뷰어 */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <span>game.js 실행 스크립트 뷰어</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyJs}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                    >
                      {copiedJs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJs ? '복사됨! ✨' : 'JS 복사'}</span>
                    </button>
                  </div>
                  <textarea
                    value={jsCodeString}
                    readOnly
                    rows={16}
                    className="w-full p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-sm leading-relaxed border border-slate-700 focus:outline-hidden shadow-inner resize-y select-all"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* JS 구조 자동 점검 리포트 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-sm font-bold text-slate-700 block">
                  🔍 자바스크립트 5대 핵심 로직 가동 상태:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    ✓ 변수 선언(let / const)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    ✓ 클릭 이벤트(onclick)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    ✓ 화면 갱신(innerText DOM)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      ovenLevel > 0 || isFairyHired
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {ovenLevel > 0 || isFairyHired ? '✓' : '✗'} 조건문 상점(if cookies &gt;= cost)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      isFairyHired ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isFairyHired ? '✓' : '✗'} 자동 타이머(setInterval)
                  </span>
                </div>
              </div>

              {/* 하단 단계 이동 버튼 */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStage('stage1')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 1 미션 & 원리</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage('stage3')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 실전 AI 5대 퀘스트</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </section>
        )}

        {/* ===================================================================
            [STAGE 03] 실전 최신 AI 5대 킬러 퀘스트 (5개 고정: QUEST 01 ~ QUEST 05)
            =================================================================== */}
        {(stage === 'stage3' || stage === 'all') && (
          <section className="space-y-6">
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-extrabold uppercase tracking-wider">
                      STAGE 03 · 실전 최신 AI 5대 킬러 퀘스트
                    </span>
                  </div>
                  <h3 id="stage-3-title" className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    외부 AI(ChatGPT / Gemini)에 프롬프트를 복사하여 실제 게임 스크립트를 소환해 보세요!
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    원클릭 복사 버튼을 누른 후 실제 생성형 AI에 입력해 보고 놀라운 자바스크립트 동작 코드를 관찰합니다.
                  </p>
                </div>
              </div>

              {/* 외부 AI 바로가기 배너 */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <span className="text-sm font-bold text-indigo-300 block">실제 AI 테스트 권장</span>
                    <p className="text-sm text-slate-200">
                      새 창에 <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="underline text-cyan-300 font-semibold">ChatGPT</a> 또는{' '}
                      <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="underline text-amber-300 font-semibold">Gemini</a>를 띄워두고 아래 프롬프트를 테스트해 보세요!
                    </p>
                  </div>
                </div>
              </div>

              {/* 5대 킬러 퀘스트 카드 목록 (QUEST 01 ~ QUEST 05) */}
              <div className="space-y-4">
                {KILLER_QUESTS.map(quest => (
                  <article
                    key={quest.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3.5 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{quest.emoji}</span>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{quest.title}</h4>
                          <span className="text-sm font-mono text-indigo-600 font-semibold block">
                            약점: {quest.weakness}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(quest.id, quest.prompt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                      >
                        {copiedPromptId === quest.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>복사됨! ✨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>프롬프트 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 프롬프트 박스 (multiline + whitespace-pre-wrap) */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {quest.prompt}
                    </div>

                    {/* 충격 반응 & 해설 2열 박스 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                        <span className="font-bold text-amber-900 block">🤖 AI의 놀라운 코드 생성 마법:</span>
                        <p className="text-amber-800 leading-relaxed">{quest.aiMagic}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1">
                        <span className="font-bold text-indigo-900 block">💡 왜 그럴까요? (컴퓨터 과학 비밀):</span>
                        <p className="text-indigo-800 leading-relaxed">{quest.magicReason}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* 하단 단계 이동 버튼 */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStage('stage2')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 2 가상 쿠키클리커</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage('stage4')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 전문 용어 & 자가 점검</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </section>
        )}

        {/* ===================================================================
            [STAGE 04] 전문 용어 돋보기 & 자가 점검 체크리스트
            =================================================================== */}
        {(stage === 'stage4' || stage === 'all') && (
          <section className="space-y-6">
            {/* 전문 용어 돋보기 카드 */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Search className="w-4 h-4" />
                  <h3 id="stage-4-title" className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 배운 자바스크립트의 실제 공식 컴퓨터 과학 / 웹 표준 전문 용어를 확인해 보세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {GLOSSARY_TERMS.map(term => (
                  <div
                    key={term.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 ${term.id === 5 ? 'md:col-span-2' : ''}`}
                  >
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                        <span>{term.emoji}</span>
                        <span>{term.term}</span>
                      </h4>
                      <span className="text-sm font-mono text-slate-400 block pl-5.5">
                        {term.caption}
                      </span>
                    </div>
                    <p className="text-sm text-cyan-300 font-medium">
                      🧸 <strong>어린이 비유:</strong> {term.kidMetaphor}
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🎓 <strong>개발자 정의:</strong> {term.devDefinition}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            {/* 자가 점검 체크리스트 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    <span>7강 학습 성취도 자가 점검 체크리스트</span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    스스로 이해했는지 확인하며 체크박스를 눌러보세요. 6개를 모두 완료하면 8강이 언락됩니다!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-600">완료율:</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">
                    {checkedItems.length} / {CHECKLIST_ITEMS.length} ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* 체크리스트 6개 항목 */}
              <div className="space-y-2.5">
                {CHECKLIST_ITEMS.map(chk => {
                  const isChecked = checkedItems.includes(chk.id);
                  return (
                    <label
                      key={chk.id}
                      onClick={() => toggleCheck(chk.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4.5 h-4.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-800 leading-relaxed">
                        {chk.text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* 100% 달성 시 완주 축하 및 8강 언락 카드 */}
              {isAllChecked && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 text-white space-y-4 shadow-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl flex-shrink-0">
                      🍪
                    </div>
                    <div>
                      <span className="text-sm font-mono font-bold uppercase tracking-wider text-amber-200 block">
                        LESSON 07 COMPLETE!
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        자바스크립트 입문 & 쿠키클리커 마스터 달성을 축하합니다! 🎉
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-amber-100 leading-relaxed">
                    이제 마우스 클릭에 즉각 반응하고 상태를 기억하는 진짜 게임 로직을 만들 수 있게 되었습니다!
                    다음 <strong>8강에서는 조건문과 반복문, 무작위 확률(Math.random)</strong>을 배워, 두근두근 행운의 럭키 가챠 상자와 3문항 퀴즈 미니게임을 만들어 봅시다!
                  </p>
                  <div className="pt-1">
                    <a
                      href="/lessons/08"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-900 font-bold text-sm shadow-sm hover:bg-amber-50 transition-all cursor-pointer"
                    >
                      <span>8강: 조건과 반복으로 게임 로직 설계 (럭키 가챠 상자) 도전하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* 하단 단계 이동 버튼 */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStage('stage3')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 3 실전 AI 퀘스트</span>
                </button>
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
};

export default Lesson07;
