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
  Zap,
  Target,
  Lightbulb,
  ShieldCheck,
  History,
  CheckSquare,
  Clover,
  Circle
} from 'lucide-react';

interface Lesson08Props {
  onComplete?: () => void;
}

type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type SimTabType = 'gacha' | 'quiz';
type ItemGrade = 'legendary' | 'rare' | 'common';

interface PullResult {
  grade: ItemGrade;
  item: string;
  dice: string;
  emoji: string;
  badgeClass: string;
  badgeText: string;
}

interface KillerQuest {
  id: number;
  emoji: string;
  title: string;
  weakness: string;
  prompt: string;
  aiMagic: string;
  magicReason: string;
}

interface GlossaryTerm {
  id: number;
  emoji: string;
  term: string;
  caption: string;
  kidMetaphor: string;
  devDefinition: string;
}

interface CheckItem {
  id: number;
  text: string;
}

interface QuizItem {
  question: string;
  code: string;
  options: string[];
  answer: number;
  explanation: string;
}

const ITEMS_DB: Record<ItemGrade, string[]> = {
  legendary: [
    '👑 황금 엑스칼리버',
    '🔥 전설의 드래곤 날개',
    '⚡ 영원의 불꽃 건틀릿',
    '🌟 신화의 천사 날개'
  ],
  rare: [
    '⚔️ 은빛 기사 방패',
    '🔮 룬 마법 지팡이',
    '🌪️ 바람의 질주 부츠',
    '🛡️ 미스릴 수호 투구'
  ],
  common: [
    '🪵 단단한 나무 몽둥이',
    '🗡️ 녹슨 철단검',
    '👢 낡은 가죽 장화',
    '🍎 신선한 회복 사과'
  ]
};

const QUIZ_DATA: QuizItem[] = [
  {
    question: "const items = ['사과', '바나나', '포도']; 에서 items[0] 은 무엇일까요?",
    code: "const items = ['사과', '바나나', '포도'];\nconsole.log(items[0]);",
    options: ["1번: '사과'", "2번: '바나나'", "3번: '포도'"],
    answer: 0,
    explanation: "컴퓨터는 1번이 아닌 0번 인덱스(Zero-based Index)부터 카운트하므로 items[0]은 첫 번째 원소인 '사과'입니다!"
  },
  {
    question: "자바스크립트 Math.random() 함수가 반환하는 값의 범위는 무엇일까요?",
    code: "const r = Math.random();\n// r의 수학적 범위는?",
    options: ["1번: 1 이상 100 이하의 자연수", "2번: 0 이상 1 미만의 소수 (0.00 ~ 0.999...)", "3번: 0 또는 1 (둘 중 하나)"],
    answer: 1,
    explanation: "Math.random()은 0 이상 1 미만의 부동소수점을 반환합니다. 여기에 100을 곱해야 0부터 99.99까지의 난수가 됩니다!"
  },
  {
    question: "자바스크립트에서 두 값이 '타입과 값까지 완벽히 똑같은지' 검사할 때 쓰는 일치 연산자는?",
    code: "if (score ___ 100) {\n  alert('만점!');\n}",
    options: ["1번: = (외로운 단일 등호)", "2번: == (느슨한 이중 등호)", "3번: === (엄격한 삼중 등호)"],
    answer: 2,
    explanation: "= 은 상자에 값을 집어넣는 대입 연산자이고, === 이 값과 데이터 타입까지 철저히 비교하는 엄격 일치 연산자입니다!"
  }
];

const KILLER_QUESTS: KillerQuest[] = [
  {
    id: 1,
    emoji: '🎲',
    title: '1. 100면체 주사위와 3단계 가챠 확률(70/25/5) 로직 소환 퀘스트',
    weakness: 'Math.random() * 100과 if / else if / else 계단식 조건문 분기 설계',
    prompt: `[Goal]:
웹 브라우저에서 '보물 상자 열기' 버튼을 누르면 100면체 주사위를 굴려 70%, 25%, 5% 확률로 등급을 나누어 아이템을 추첨하는 자바스크립트 가챠 함수를 작성해줘.

[Actor]:
초보자에게 게임 수학과 알고리즘을 친절히 설명하는 주니어 게임 개발 튜터

[Condition]:
- 요구사항:
  1) Math.random() * 100으로 0 ~ 99.99 난수를 생성할 것.
  2) if (dice >= 95) 전설(5%), else if (dice >= 70) 희귀(25%), else 일반(70%) 조건문 구조를 갖출 것.
  3) 각 등급별 아이템 목록은 객체 안의 배열(itemsDB = { legendary: [...], ... })로 보관할 것.
  4) 배열의 길이(list.length)를 이용해 해당 등급 아이템 중 1개를 무작위 추첨할 것.
- 초보자도 바로 이해할 수 있도록 매 줄마다 상세한 한국어 주석을 달아줘.

[Output Format]:
- 바로 실행 가능한 완성형 자바스크립트 코드 블록
- 주사위와 조건문이 어떻게 확률을 나누는지 어린이 눈높이 해설 2줄`,
    aiMagic:
      '복잡한 게임 기획서의 확률표를 단 15줄 이내의 간결하고 우아한 자바스크립트 조건문 분기 함수로 즉시 변환해 줍니다!',
    magicReason:
      '계단식 조건문(Chained if-else)은 위에서부터 순서대로 조건을 검사하므로, 95 이상을 먼저 걸러내면 아래쪽 조건에서는 95 미만임이 자동으로 보장되기 때문입니다.'
  },
  {
    id: 2,
    emoji: '🎒',
    title: '2. 0번 인덱스 실종 사건과 Off-by-One 버그 탐정 QA 퀘스트',
    weakness: '배열의 첫 번째 원소(items[0])와 array.length 범위 초과(undefined) 결함',
    prompt: `[Goal]:
내가 작성한 가챠 코드에서 첫 번째 아이템이 절대 안 나오거나, 가끔 'undefined'라는 유령 아이템이 뽑히는 치명적 인덱스 버그를 찾아 교정해줘.

[Actor]:
배열 경계값 검사(Bounds Check) 전문 크롬 디버깅 QA 엔지니어

[Condition]:
- 검사할 버그 코드:
  const weapons = ['황금검', '마법봉', '강철도끼'];
  // 버그 1: 첫 번째 아이템을 1번으로 착각함
  const firstWeapon = weapons[1];
  // 버그 2: 1부터 3까지 뽑으려다 범위를 벗어남
  const randomWeapon = weapons[Math.floor(Math.random() * 3) + 1];
- 문제점:
  1) firstWeapon을 출력했더니 '황금검'이 아니라 '마법봉'이 나옴!
  2) randomWeapon을 반복해서 뽑다 보면 가끔 'undefined'가 뜸!
- 원인을 어린이 눈높이로 진단하고 완벽한 교정 코드를 제시해줘.

[Output Format]:
1. 왜 황금검이 안 나왔는지 '0번 인덱스 규칙' 해설
2. 왜 undefined가 떴는지 '배열 길이와 마지막 인덱스의 차이(Off-by-One)' 해설
3. 안전하게 랜덤 아이템을 꺼내는 올바른 1줄 코드`,
    aiMagic:
      "전 세계 초보 프로그래머 99%가 겪는 '하나 차이 오차(Off-by-One)'와 0번 인덱스 함정을 명쾌하게 분석하여 버그 없는 안전한 인덱싱을 코칭합니다!",
    magicReason:
      '길이가 N인 배열의 유효한 인덱스는 0부터 N-1까지이므로, Math.floor(Math.random() * N)은 정확히 0 이상 N-1 이하의 정수만을 만들어내기 때문입니다.'
  },
  {
    id: 3,
    emoji: '✨',
    title: '3. 천장 시스템(Pity System)! 10회 연속 꽝 시 확정 전설 지급 퀘스트',
    weakness: '뽑기 실패 횟수를 기억하는 카운터 변수(pityCount)와 상태 전이 로직',
    prompt: `[Goal]:
유저가 10번 연속으로 전설 아이템을 뽑지 못하면 10번째 뽑기에서는 주사위 값과 상관없이 무조건 전설을 선물하는 '천장(Pity) 보호 로직'을 만들어줘.

[Actor]:
유저 이탈을 막고 쾌적한 게임 경제를 설계하는 모바일 가챠 게임 시스템 디렉터

[Condition]:
- 요구사항:
  1) 천장 카운터 변수 let pityCount = 0; 선언.
  2) 뽑기를 할 때마다 pityCount를 1 증가시킬 것.
  3) if (pityCount >= 10) 조건이 참이면:
     - 주사위를 굴리지 않고 바로 '전설 등급 확정!' 당첨 처리.
     - pityCount를 0으로 리셋.
  4) 만약 10번이 되기 전에 일반 확률(5%)로 전설이 나왔다면 역시 pityCount를 0으로 리셋할 것.
- 화면에 '천장까지 남은 횟수: X회'를 갱신할 수 있는 힌트를 포함해줘.

[Output Format]:
- 천장 로직이 완벽하게 결합된 pullGachaWithPity() 자바스크립트 함수
- 플레이어에게 신뢰를 주는 천장 시스템의 컴퓨터 상태(State) 관리 원리 해설`,
    aiMagic:
      "불운한 유저를 구제하는 상용 게임의 필수 시스템인 '천장 알고리즘'을 변수와 조건문의 환상적인 조화로 즉시 코딩해 줍니다.",
    magicReason:
      '독립 시행(Independent Trial)인 확률에 누적 상태(State) 변수를 결합하여 특정 임계값(Threshold) 도달 시 조건 분기를 강제 전이시키는 기법입니다.'
  },
  {
    id: 4,
    emoji: '❓',
    title: '4. 배열과 객체로 엮어낸 3문항 웹 퀴즈 엔진 자동 출제 퀘스트',
    weakness: '문제, 보기, 정답 인덱스, 해설을 객체 배열(quizData)로 구조화하고 렌더링',
    prompt: `[Goal]:
자바스크립트 초보자를 위한 '3문항 객관식 퀴즈 게임 엔진'을 배열과 객체 자료구조를 활용해 깔끔하게 구현해줘.

[Actor]:
인터랙티브 웹 교육 플랫폼 에듀테크 프론트엔드 개발자

[Condition]:
- 데이터 구조:
  const quizData = [
    { question: '...', options: ['...', '...', '...'], answer: 0, explanation: '...' },
    ...
  ];
- 요구 기능:
  1) 현재 문제 번호(currentIdx)를 추적하여 화면에 문제와 선택지 버튼 3개를 동적으로 표시.
  2) 유저가 버튼을 눌렀을 때 if (userChoice === quizData[currentIdx].answer) 조건으로 정답/오답 판정.
  3) 정답이면 초록색, 오답이면 빨간색 피드백 및 친절한 해설 문구 노출.
  4) '다음 문제' 버튼을 누르면 currentIdx를 1 올리고 다음 문제로 이동.
- 순수 자바스크립트로 동작하게 작성해줘.

[Output Format]:
- quizData 배열과 퀴즈 처리 함수(renderQuiz, checkAnswer)가 포함된 자바스크립트 코드
- 객체 배열을 사용했을 때 왜 코드가 깨끗해지는지 2줄 설명`,
    aiMagic:
      '문제마다 일일이 변수를 만들지 않고, 배열 안에 객체를 담는 현업 표준 데이터 모델링(Data Modeling) 기법을 한 방에 완성해 줍니다!',
    magicReason:
      '데이터(퀴즈 목록)와 로직(출제 및 채점 엔진)을 분리하면, 나중에 문제가 100개로 늘어나도 자바스크립트 코드는 단 한 줄도 고칠 필요가 없기 때문입니다.'
  },
  {
    id: 5,
    emoji: '⚖️',
    title: '5. 대입(=) vs 비교(===) 치명적 무한 조건 버그 격퇴 퀘스트',
    weakness: "if (grade = '전설') 처럼 실수로 대입 연산자를 써서 무조건 참이 되는 결함 차단",
    prompt: `[Goal]:
내가 작성한 가챠 게임에서 주사위 점수가 10점밖에 안 나왔는데도 무조건 '전설 당첨!'이 터져버리는 끔찍한 버그를 찾아 퇴치해줘.

[Actor]:
자바스크립트 문법 검사기(ESLint) 규칙 설계 전문가

[Condition]:
- 버그가 터진 코드:
  let dice = 10;
  let grade = '일반';
  if (grade = '전설') {
    alert('축하합니다! 황금 엑스칼리버 당첨!');
  }
- 문제점:
  1) 주사위도 낮고 분명 '일반' 등급인데 조건문이 무조건 실행됨!
  2) 게다가 grade 변수마저 '전설'로 강제 변경되어 버림!
- 원인을 어린이 눈높이로 진단하고 왜 = 대신 === 를 써야 하는지 해설해줘.

[Output Format]:
1. 왜 if문 안에서 = 을 쓰면 무조건 참(true)이 되는지 알기 쉬운 원리 설명
2. = (대입), == (느슨한 비교), === (엄격한 일치)의 차이점 3줄 정리
3. 버그가 완벽히 박멸된 올바른 자바스크립트 코드`,
    aiMagic:
      "눈으로 찾기 가장 힘든 '외로운 등호 1개(=)'의 대재앙을 즉시 적발하고, 타입까지 깐깐하게 비교하는 엄격한 삼중 등호(===)의 중요성을 알려줍니다!",
    magicReason:
      "자바스크립트에서 대입식(grade = '전설')은 우변의 값인 '전설' 자체를 평가 결과로 반환하며, 빈 문자열이 아닌 글자는 불리언 변환 시 항상 참(truthy)으로 취급되기 때문입니다."
  }
];

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 1,
    emoji: '🚦',
    term: '조건문',
    caption: 'Conditional Statement (if / else) / 갈림길 판단 신호등',
    kidMetaphor: '"점수가 95점 넘으면 전설 상자로 가고, 아니면 일반 상자로 가자!" 신호등!',
    devDefinition:
      '주어진 불리언(boolean) 조건식의 참/거짓 여부에 따라 서로 다른 코드 블록을 분기 실행하는 제어 흐름문.'
  },
  {
    id: 2,
    emoji: '🍱',
    term: '배열',
    caption: 'Array / 순서 번호표가 붙은 데이터 찬합 도시락',
    kidMetaphor: '여러 개의 장난감이나 보물을 하나의 커다란 상자에 순서대로 넣어둔 보따리!',
    devDefinition:
      '동일하거나 다양한 데이터 타입의 여러 값을 하나의 변수에 순서대로 나열하여 저장하는 선형 자료구조.'
  },
  {
    id: 3,
    emoji: '🏷️',
    term: '인덱스',
    caption: 'Index (Zero-based) / 컴퓨터가 0번부터 매기는 방 번호표',
    kidMetaphor: '첫 번째 보물에 붙어 있는 번호표가 1번이 아니라 0번이라는 컴퓨터만의 비밀 규칙!',
    devDefinition:
      '배열 내부의 각 원소(element)가 위치한 상대적 메모리 오프셋을 가리키는 0부터 시작하는 정수 번호.'
  },
  {
    id: 4,
    emoji: '🎲',
    term: '난수',
    caption: 'Random Number (Math.random) / 0 이상 1 미만의 무작위 주사위',
    kidMetaphor: '누구도 다음에 뭐가 나올지 맞힐 수 없는 컴퓨터 속 신기한 요술 주사위!',
    devDefinition:
      '규칙적인 패턴 없이 예측 불가능하게 생성되는 수열로, 자바스크립트에서는 의사 난수 생성기(PRNG)를 통해 구현됨.'
  },
  {
    id: 5,
    emoji: '⚖️',
    term: '일치 연산자',
    caption: 'Strict Equality (===) / 값과 타입까지 철저히 따지는 삼중 등호',
    kidMetaphor: '"모양만 같은 척하는 가짜인가, 진짜 쌍둥이인가?" 돋보기로 확인하는 깐깐한 판사님!',
    devDefinition:
      '자동 형변환(Type Coercion) 없이 좌변과 우변의 자료형(Type)과 값(Value)이 완벽히 일치하는지 비교하는 엄격 동등 연산자.'
  }
];

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 1,
    text: '조건문(if / else if / else)이 주사위 값에 따라 갈림길을 나누어주는 신호등임을 이해했나요?'
  },
  {
    id: 2,
    text: '여러 개의 아이템이나 퀴즈 문제를 하나의 이름표 아래 담아두는 찬합 도시락 배열([ ])의 형태를 확인했나요?'
  },
  {
    id: 3,
    text: '컴퓨터는 배열의 첫 번째 칸을 1번이 아닌 0번 인덱스(items[0])부터 센다는 사실을 기억하나요?'
  },
  {
    id: 4,
    text: '가상 가챠 콘솔에서 Math.random() * 100으로 확률(70%, 25%, 5%)을 나누어 보물 상자를 뽑아보았나요?'
  },
  {
    id: 5,
    text: '값을 상자에 집어넣는 대입(=)과 양쪽이 똑같은지 검사하는 엄격한 일치(===)의 차이를 구별할 수 있나요?'
  },
  {
    id: 6,
    text: '최신 AI에게 천장 시스템이나 3문항 퀴즈 엔진을 생성하는 프롬프트 퀘스트를 성공적으로 실행해 보았나요?'
  }
];

export const Lesson08: React.FC<Lesson08Props> = ({ onComplete }) => {
  // 단계 네비게이션 상태
  const [activeStage, setActiveStage] = useState<StageType>('stage1');

  // 시뮬레이터 상태
  const [simTab, setSimTab] = useState<SimTabType>('gacha');
  const [isCharmActive, setIsCharmActive] = useState<boolean>(false);
  const [totalPulls, setTotalPulls] = useState<number>(0);
  const [pullHistory, setPullHistory] = useState<PullResult[]>([]);
  const [lastResult, setLastResult] = useState<PullResult | null>(null);
  const [isBoxBouncing, setIsBoxBouncing] = useState<boolean>(false);

  // 퀴즈 상태
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [hasAnsweredQuiz, setHasAnsweredQuiz] = useState<boolean>(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // 복사 피드백 상태
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState<boolean>(false);

  // 체크리스트 상태
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / 6) * 100);

  useEffect(() => {
    if (checkedCount === 6 && onComplete) {
      onComplete();
    }
  }, [checkedCount, onComplete]);

  // 가챠 뽑기 함수
  const handlePullGacha = (count: number) => {
    setIsBoxBouncing(true);
    setTimeout(() => setIsBoxBouncing(false), 450);

    const legendaryThreshold = isCharmActive ? 80 : 95;
    let latestResult: PullResult | null = null;
    const newResults: PullResult[] = [];

    for (let i = 0; i < count; i++) {
      const dice = Math.random() * 100;
      let grade: ItemGrade = 'common';
      let badgeClass = 'bg-slate-700 text-slate-300 border-slate-600';
      let badgeText = '🪵 일반 등급 (70% 당첨)';
      let emoji = '🪵';

      if (dice >= legendaryThreshold) {
        grade = 'legendary';
        badgeClass = 'bg-amber-500 text-slate-950 border-amber-400 font-black';
        badgeText = isCharmActive ? '👑 전설 등급! (부적 마법 20% 당첨!)' : '👑 전설 등급! (5% 극악 확률 당첨!)';
        emoji = '👑';
      } else if (dice >= 70) {
        grade = 'rare';
        badgeClass = 'bg-indigo-600 text-white border-indigo-500 font-bold';
        badgeText = '⚔️ 희귀 등급! (25% 당첨)';
        emoji = '⚔️';
      }

      const list = ITEMS_DB[grade];
      const randomIndex = Math.floor(Math.random() * list.length);
      const item = list[randomIndex];

      latestResult = {
        grade,
        item,
        dice: dice.toFixed(2),
        emoji,
        badgeClass,
        badgeText
      };
      newResults.unshift(latestResult);
    }

    setTotalPulls(prev => prev + count);
    if (latestResult) setLastResult(latestResult);
    setPullHistory(prev => [...newResults, ...prev].slice(0, 5));
  };

  const handleToggleCharm = () => {
    setIsCharmActive(prev => !prev);
  };

  const handleResetGacha = () => {
    setTotalPulls(0);
    setPullHistory([]);
    setLastResult(null);
    setIsCharmActive(false);
  };

  // 퀴즈 처리 함수
  const handleSelectQuizOption = (choiceIdx: number) => {
    if (hasAnsweredQuiz) return;
    setHasAnsweredQuiz(true);
    setSelectedQuizChoice(choiceIdx);

    const q = QUIZ_DATA[currentQuizIdx];
    if (choiceIdx === q.answer) {
      setQuizScore(prev => prev + 10);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < QUIZ_DATA.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      setHasAnsweredQuiz(false);
      setSelectedQuizChoice(null);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIdx(0);
    setQuizScore(0);
    setHasAnsweredQuiz(false);
    setSelectedQuizChoice(null);
    setIsQuizCompleted(false);
  };

  // 복사 핸들러
  const handleCopyPrompt = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 1800);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 1800);
  };

  const handleToggleCheck = (id: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const currentGachaCode = `// gacha.js - 현재 가챠 머신의 실제 동작 코드
const itemsDB = {
  legendary: ["👑 황금 엑스칼리버", "전설의 드래곤 날개", "영원의 불꽃 건틀릿"],
  rare: ["⚔️ 은빛 기사 방패", "룬 마법 지팡이", "바람의 부츠", "미스릴 투구"],
  common: ["🪵 단단한 나무 몽둥이", "녹슨 철단검", "낡은 가죽 장화", "신선한 사과"]
};

function pullGacha() {
  // 1. 0 ~ 99.99 사이의 100면체 주사위 굴리기
  const dice = Math.random() * 100;
  let grade = "common";

  ${isCharmActive ? '// 황금 부적 적용: 80 이상이면 전설(20%)' : '// 일반 모드: 95 이상이면 전설(5%)'}
  if (dice >= ${isCharmActive ? 80 : 95}) {
    grade = "legendary"; // ${isCharmActive ? '20%' : '5%'} 확률 당첨!
  } else if (dice >= 70) {
    grade = "rare";      // 25% 확률
  } else {
    grade = "common";    // ${isCharmActive ? '55%' : '70%'} 확률
  }

  // 2. 찬합 도시락 배열(Array)에서 0번 인덱스 규칙으로 아이템 무작위 추첨
  const list = itemsDB[grade];
  const randomIndex = Math.floor(Math.random() * list.length);
  return { grade: grade, item: list[randomIndex], dice: dice.toFixed(2) };
}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">

      {/* ======================================================================= */}
      {/* [상단 GNB 헤더] 풀 너비 헤더 & 4단계 버튼 스위처 구조 (1강 최신 표준)    */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full h-full mx-auto flex items-center justify-between gap-2 sm:gap-4">

          {/* 좌측: 코스 홈 및 강좌 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/lessons"
              className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 font-bold shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span className="text-sm hidden sm:inline">코스 홈</span>
            </a>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-sm border border-amber-200 shrink-0">
                8강
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight">
                조건과 반복으로 게임 로직 설계 (럭키 가챠 상자 &amp; 3문항 퀴즈)
              </h1>
            </div>
          </div>

          {/* 중앙: 4단계 스텝 스위처 버튼 그룹 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0" aria-label="학습 단계">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-sm flex items-center justify-center font-black ${
                activeStage === 'stage1' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
              }`}>1</span>
              <span>미션 &amp; 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-sm flex items-center justify-center font-black ${
                activeStage === 'stage2' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
              }`}>2</span>
              <span>럭키 가챠 콘솔</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-sm flex items-center justify-center font-black ${
                activeStage === 'stage3' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
              }`}>3</span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-sm flex items-center justify-center font-black ${
                activeStage === 'stage4' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
              }`}>4</span>
              <span>점검 &amp; 언락</span>
            </button>

            <div className="h-4 w-px bg-slate-300 mx-0.5" />
            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeStage === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              전체 보기
            </button>
          </nav>

          {/* 우측: 실시간 체크리스트 게이지 & 언락 슬롯 */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-700 font-mono">
                {checkedCount}/6 ({progressPercent}%)
              </span>
              <div className="w-12 sm:w-16 h-2 bg-slate-200 rounded-full overflow-hidden hidden xs:block">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {checkedCount === 6 ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-300">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>9강 잠금 해제!</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-sm font-bold border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>8강 진행 중</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 모바일 서브 탭 바 */}
      <div className="md:hidden flex items-center justify-around bg-white border-b border-slate-200 px-2 py-2 overflow-x-auto">
        {(['stage1', 'stage2', 'stage3', 'stage4'] as StageType[]).map((stage, idx) => {
          const titles = ['1. 미션 & 원리', '2. 가챠 콘솔', '3. AI 퀘스트', '4. 점검 & 언락'];
          const isActive = activeStage === stage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => setActiveStage(stage)}
              className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${
                isActive ? 'text-indigo-700 bg-indigo-50 font-bold' : 'text-slate-600'
              }`}
            >
              {titles[idx]}
            </button>
          );
        })}
      </div>

      {/* ======================================================================= */}
      {/* [메인 컨테이너] 단일 컨테이너 몰입형 레이아웃                             */}
      {/* ======================================================================= */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* ===================================================================== */}
        {/* STAGE 1: 미션 & 원리 (Mission & Principles)                           */}
        {/* ===================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-6">

            {/* 히어로 배너 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>시즌 2 · 프론트엔드 게임 로직 설계</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  행운의 황금 상자를 열어라!<br className="hidden sm:inline" />
                  조건문과 배열로 만드는 럭키 가챠 &amp; 웹 퀴즈 게임
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  게임을 신나게 만드는 일등 공신은 바로 '두근두근 뽑기'와 '도전 퀴즈'입니다!
                  자바스크립트의 랜덤 주사위(<span className="text-amber-300 font-mono font-bold">Math.random()</span>)와 길을 나누어주는 신호등 조건문(<span className="text-amber-300 font-mono font-bold">if / else</span>), 
                  그리고 아이템을 차곡차곡 담는 찬합 도시락 배열(<span className="text-amber-300 font-mono font-bold">Array</span>)의 원리를 정복해 봅니다.
                </p>
              </div>
            </div>

            {/* 미션 브리핑 카드: 3가지 목표 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">오늘의 3대 도전 미션 브리핑</h3>
                  <p className="text-sm text-slate-500">8강을 완주하면 직접 만들 수 있는 3가지 핵심 기능입니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center shrink-0">1</span>
                    <h4 className="text-base font-bold text-slate-900">100면체 랜덤 주사위</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-mono text-amber-700 font-bold">Math.random() * 100</span>으로 0부터 99.99까지 예측할 수 없는 숫자를 뽑아 확률의 기초를 설계합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">2</span>
                    <h4 className="text-base font-bold text-slate-900">조건문(if/else) 갈림길</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    굴려 나온 주사위 값에 따라 일반(70%), 희귀(25%), 전설(5%) 등급으로 안내하는 신호등 판정문을 세웁니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">3</span>
                    <h4 className="text-base font-bold text-slate-900">보물 도시락 배열([ ])</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    보물 목록과 퀴즈 문제를 차곡차곡 담아두고, 컴퓨터의 0번 인덱스 규칙(<span className="font-mono text-emerald-700 font-bold">items[0]</span>)으로 쏙쏙 꺼냅니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 핵심 개념 원리 탐구 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span>동작 원리 탐구: 3총사로 이해하는 게임 로직의 비밀</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  어렵게 느껴지는 프로그래밍 개념을 어린이 눈높이의 친숙한 일상 도구로 비유해 봅니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎲</span>
                    <div>
                      <h4 className="text-base font-bold text-amber-950">보이지 않는 투명 주사위</h4>
                      <span className="text-sm font-mono text-amber-700 font-semibold block">Math.random()</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    컴퓨터 손바닥 안에서 0.00부터 0.99까지 무한히 구르는 투명 주사위입니다. 100을 곱하면 100면체 주사위가 되어 확률 놀이의 마법사가 됩니다!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚦</span>
                    <div>
                      <h4 className="text-base font-bold text-indigo-950">갈림길 판단 신호등</h4>
                      <span className="text-sm font-mono text-indigo-700 font-semibold block">if / else if / else</span>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    "주사위가 95점 이상이면 황금 궁전으로, 70점 이상이면 은빛 성문으로, 나머지는 나무 다리로!" 상황에 맞추어 길을 인도하는 똑똑한 신호등입니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍱</span>
                    <div>
                      <h4 className="text-base font-bold text-emerald-950">칸칸이 나뉜 찬합 도시락</h4>
                      <span className="text-sm font-mono text-emerald-700 font-semibold block">Array [ 0, 1, 2 ]</span>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-900 leading-relaxed">
                    0번 칸에는 샌드위치, 1번 칸에는 김밥, 2번 칸에는 과일을 담아두듯, 수십 개의 보물이나 퀴즈 문제를 하나의 이름표 아래 순서대로 묶어두는 마법 상자입니다.
                  </p>
                </div>
              </div>

              {/* 주니어 개발자 황금률 */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-amber-300">주니어 개발자의 황금률: "컴퓨터는 1이 아니라 0부터 센다!"</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    사람은 첫 번째 아이템을 1번이라고 부르지만, 컴퓨터는 <strong>0번 인덱스(Zero-based Index)</strong>부터 카운트합니다.
                    <span className="font-mono text-amber-200">items[0]</span>이 첫 번째 보물이고, <span className="font-mono text-amber-200">items[1]</span>이 두 번째 보물입니다!
                    또한 상자에 값을 넣는 <strong>대입(=)</strong>과 양쪽이 똑같은지 비교하는 <strong>검사(===)</strong>를 절대 헷갈리지 마세요!
                  </p>
                </div>
              </div>
            </article>

            {/* 단계 이동 버튼 */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>다음: 2단계 럭키 가챠 콘솔 체험</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 2: 가상 럭키 가챠 & 아케이드 퀴즈 콘솔 (Interactive Simulator)   */}
        {/* ===================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-6">

            {/* 콘솔 헤더 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">Stage 2</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  가상 게임 엔진: 럭키 가챠 상자 &amp; 3문항 아케이드 퀴즈
                </h3>
              </div>
              <p className="text-sm text-slate-500">
                외부 서버나 로그인 없이 순수 자바스크립트 엔진으로 구동되는 대화형 가챠 머신과 퀴즈 콘솔입니다.
                직접 확률을 굴려보고, 퀴즈를 풀며 실시간으로 변하는 <span className="font-mono text-indigo-600 font-bold">gacha.js</span> 코드를 관찰하세요.
              </p>
            </div>

            {/* 탭 스위처: 가챠 / 퀴즈 */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setSimTab('gacha')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  simTab === 'gacha'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🎁 행운의 보물 상자 뽑기</span>
              </button>
              <button
                type="button"
                onClick={() => setSimTab('quiz')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  simTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🎮 3문항 자바스크립트 퀴즈</span>
              </button>
            </div>

            {/* 패널 A: 보물 상자 뽑기 */}
            {simTab === 'gacha' && (
              <div className="space-y-5">
                <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">

                  {/* 상자 비주얼 */}
                  <div className="text-center space-y-3 py-4">
                    <div className={`inline-block transition-transform duration-300 ${isBoxBouncing ? 'animate-bounce' : ''}`}>
                      <span
                        className="text-6xl sm:text-7xl block select-none cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                        onClick={() => handlePullGacha(1)}
                      >
                        {lastResult ? lastResult.emoji : '🎁'}
                      </span>
                    </div>

                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${
                        lastResult ? lastResult.badgeClass : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        <span>{lastResult ? lastResult.badgeText : '보물 상자가 봉인되어 있습니다'}</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-amber-300 mt-2 tracking-tight">
                        {lastResult ? `획득: ${lastResult.item}` : '아래 버튼을 눌러 상자를 열어보세요!'}
                      </h4>
                      <p className="text-sm font-mono text-slate-400 mt-1">
                        {lastResult ? `마지막 굴린 주사위 값: ${lastResult.dice} (0 ~ 99.99)` : '굴린 주사위 값: 아직 안 굴림 (0 ~ 99.99)'}
                      </p>
                    </div>
                  </div>

                  {/* 확률표 */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                      <span className="block text-slate-400 text-sm font-normal">일반 (70%)</span>
                      <span className="text-slate-200">🪵 나무 몽둥이 등</span>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
                      <span className="block text-indigo-400 text-sm font-normal">희귀 (25%)</span>
                      <span className="text-indigo-200">⚔️ 은빛 기사 방패 등</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-300">
                      <span className="block text-amber-400 text-sm font-normal">
                        {isCharmActive ? '전설 (20% UP!)' : '전설 (5%)'}
                      </span>
                      <span className="text-amber-200">👑 황금 엑스칼리버!</span>
                    </div>
                  </div>

                  {/* 조작 버튼 */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handlePullGacha(1)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>상자 1회 뽑기 🎲</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePullGacha(10)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>10연속 뽑기 🔥</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleCharm}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isCharmActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                      }`}
                    >
                      <Clover className="w-4 h-4 text-emerald-400" />
                      <span>{isCharmActive ? '황금 부적 작동 중! ✨ (전설 20%)' : '황금 부적 착용 (전설 20%로 상승)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetGacha}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>리셋</span>
                    </button>
                  </div>

                  {/* 최근 기록 */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <History className="w-4 h-4" />
                        <span>최근 획득 보물 기록 (총 <span className="font-mono text-amber-400 font-bold">{totalPulls}</span>회)</span>
                      </span>
                      <span className="text-slate-500 font-mono text-sm">최근 5건</span>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
                      {pullHistory.length === 0 ? (
                        <span className="text-sm text-slate-500 italic">아직 뽑은 보물이 없습니다. 상자를 열어보세요!</span>
                      ) : (
                        pullHistory.map((h, idx) => {
                          let tagClass = 'bg-slate-800 text-slate-300 border-slate-700';
                          if (h.grade === 'legendary') tagClass = 'bg-amber-900/60 text-amber-300 border-amber-600/70 font-bold';
                          else if (h.grade === 'rare') tagClass = 'bg-indigo-900/60 text-indigo-300 border-indigo-600/70';
                          return (
                            <span key={idx} className={`px-2.5 py-1 rounded-lg border text-sm font-mono flex items-center gap-1 ${tagClass}`}>
                              <span>{h.emoji}</span>
                              <span>{h.item}</span>
                              <span className="text-slate-400">({h.dice})</span>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 패널 B: 3문항 아케이드 퀴즈 */}
            {simTab === 'quiz' && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🕹️</span>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">자바스크립트 논리 아케이드 3문항</h4>
                        <p className="text-sm text-slate-500">배열과 조건문, 일치 연산자의 핵심 규칙을 퀴즈로 점검합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-sm font-bold border border-indigo-200">
                        현재 점수: {quizScore} / 30점
                      </span>
                      <button
                        type="button"
                        onClick={handleRestartQuiz}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-all cursor-pointer"
                      >
                        다시 풀기
                      </button>
                    </div>
                  </div>

                  {isQuizCompleted ? (
                    <div className="p-6 rounded-2xl bg-indigo-50 text-indigo-950 border border-indigo-200 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
                        <Award className="w-6 h-6" />
                      </div>
                      <h5 className="text-lg font-bold">3문항 퀴즈 완주를 축하합니다! 🏆</h5>
                      <p className="text-sm font-semibold">
                        최종 획득 점수: <span className="font-mono text-indigo-600 font-extrabold text-base">{quizScore}점</span> / 30점
                      </p>
                      <p className="text-sm text-slate-600">
                        배열의 0번 인덱스 규칙과 Math.random, 그리고 엄격 일치 연산자(===)를 완벽히 이해하셨습니다!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-sm font-bold">
                          Q{currentQuizIdx + 1} / 3
                        </span>
                        <h5 className="text-base font-bold text-slate-900">
                          {QUIZ_DATA[currentQuizIdx].question}
                        </h5>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-sm whitespace-pre-wrap select-all">
                        {QUIZ_DATA[currentQuizIdx].code}
                      </div>

                      {/* 보기 버튼 */}
                      <div className="space-y-2">
                        {QUIZ_DATA[currentQuizIdx].options.map((opt, idx) => {
                          const q = QUIZ_DATA[currentQuizIdx];
                          let btnStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800 font-semibold';
                          if (hasAnsweredQuiz) {
                            if (idx === q.answer) {
                              btnStyle = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                            } else if (idx === selectedQuizChoice && selectedQuizChoice !== q.answer) {
                              btnStyle = 'border-2 border-rose-400 bg-rose-50 text-rose-950 font-bold';
                            } else {
                              btnStyle = 'border-slate-200 text-slate-400 opacity-60';
                            }
                          }
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectQuizOption(idx)}
                              className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              <Circle className="w-4 h-4 text-slate-400" />
                            </button>
                          );
                        })}
                      </div>

                      {/* 피드백 */}
                      {hasAnsweredQuiz && (
                        <div className={`p-3.5 rounded-xl text-sm leading-relaxed border font-medium ${
                          selectedQuizChoice === QUIZ_DATA[currentQuizIdx].answer
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                            : 'bg-rose-50 text-rose-950 border-rose-200'
                        }`}>
                          {selectedQuizChoice === QUIZ_DATA[currentQuizIdx].answer ? (
                            <span><strong>정답입니다! 🎉</strong> {QUIZ_DATA[currentQuizIdx].explanation}</span>
                          ) : (
                            <span><strong>아쉽네요! 다시 확인해 볼까요?</strong> {QUIZ_DATA[currentQuizIdx].explanation}</span>
                          )}
                        </div>
                      )}

                      {/* 다음 문제 버튼 */}
                      {hasAnsweredQuiz && (
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleNextQuizQuestion}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{currentQuizIdx === QUIZ_DATA.length - 1 ? '퀴즈 완주! 결과 확인' : '다음 문제'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 실시간 동작 gacha.js 소스코드 뷰어 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-base font-bold text-slate-900">실시간 게임 스크립트 뷰어 (gacha.js)</h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentGachaCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                >
                  {isCodeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">복사됨! ✨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>코드 복사</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl font-mono text-sm text-emerald-400 overflow-x-auto leading-relaxed select-all">
                <code>{currentGachaCode}</code>
              </pre>
            </article>

            {/* 단계 이동 버튼 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 1단계 미션 &amp; 원리</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>다음: 3단계 실전 AI 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 3: 실전 최신 AI 5대 킬러 퀘스트 (5 Killer Quests)                */}
        {/* ===================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-6">

            {/* 안내 카드 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">Stage 3</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    외부 AI(ChatGPT / Gemini)에 프롬프트를 복사하여 게임 로직을 소환해 보세요!
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    원클릭 복사 버튼을 누른 후 실제 생성형 AI에 입력해 보고 정교한 조건문과 배열 알고리즘 코드를 관찰합니다.
                  </p>
                </div>
              </div>

              {/* 외부 AI 배너 */}
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

              {/* 5개 퀘스트 카드 */}
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
                          <span className="text-sm font-mono text-indigo-600 font-semibold block">약점: {quest.weakness}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(quest.id, quest.prompt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                      >
                        {copiedPromptId === quest.id ? (
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

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {quest.prompt}
                    </div>

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
            </div>

            {/* 단계 이동 버튼 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 2단계 럭키 가챠 콘솔</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>다음: 4단계 점검 &amp; 언락</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* STAGE 4: 전문 용어 돋보기 & 자가 점검 체크리스트                       */}
        {/* ===================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-6">

            {/* 전문 용어 돋보기 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600" />
                  <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  오늘 배운 게임 로직 설계의 실제 공식 컴퓨터 과학 / 자바스크립트 표준 전문 용어를 확인해 보세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {GLOSSARY_TERMS.map(term => (
                  <div
                    key={term.id}
                    className={`p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 ${term.id === 5 ? 'md:col-span-2' : ''}`}
                  >
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{term.emoji}</span>
                        <span>{term.term}</span>
                      </h4>
                      <span className="text-sm font-mono text-slate-400 block pl-5.5">{term.caption}</span>
                    </div>
                    <p className="text-sm text-indigo-900 font-medium">
                      🧸 <strong>어린이 비유:</strong> {term.kidMetaphor}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      🎓 <strong>개발자 정의:</strong> {term.devDefinition}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            {/* 자가 점검 체크리스트 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {checkedCount} / 6 완료
                </span>
              </div>

              {/* 게이지 바 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 6대 문항 */}
              <div className="space-y-2.5">
                {CHECKLIST_ITEMS.map(item => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => handleToggleCheck(item.id)}
                      className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {item.id}. {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </article>

            {/* 100% 완주 축하 카드 */}
            {checkedCount === 6 && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">조건과 반복의 게임 로직 마스터 달성을 축하합니다! 🎉</h4>
                    <p className="text-sm text-slate-300">6가지 점검 항목을 모두 통과하여 시즌 2 프론트엔드 핵심 로직을 완전히 정복했습니다.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 2 · 9강: 나만의 웹 미니 게임 기획 &amp; 1차 릴리즈</p>
                  </div>
                  <a
                    href="/lessons/09"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>9강으로 즉시 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            {/* 이전 버튼 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 3단계 실전 AI 퀘스트</span>
              </button>
            </div>
          </section>
        )}

      </main>

      {/* 바닥글 푸터 */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto space-y-1">
          <p>AI·코딩 24강 완주 장기 프로젝트 · 시즌 2: 웹 프론트엔드 게임 로직 설계</p>
          <p className="text-slate-400">자바스크립트 조건문(if/else)과 배열(Array), 난수(Math.random)를 정복하고 나만의 웹 게임을 구축하세요.</p>
        </div>
      </footer>
    </div>
  );
};

export default Lesson08;
