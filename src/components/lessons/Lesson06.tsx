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
  Sliders,
  Eye,
  FileCode,
  CheckSquare,
  BookOpen,
  Palette,
  Square,
  Type,
  Sparkle
} from 'lucide-react';

interface Lesson06Props {
  onComplete?: () => void;
}

type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type ThemeKey = 'fantasy' | 'cyber' | 'candy';
type RadiusSize = 8 | 16 | 28;
type FontSize = 14 | 16 | 18;
type GlowType = 'soft' | 'glow' | 'none';

interface ThemeDefinition {
  name: string;
  badge: string;
  containerBg: string;
  titleColor: string;
  titleBorder: string;
  boxBg: string;
  boxBorder: string;
  nameColor: string;
  dialogueColor: string;
  btnBg: string;
  btnColor: string;
  btnBorder: string;
  glowSoft: string;
  glowBright: string;
  glowNone: string;
  cssTemplate: string;
}

const THEMES: Record<ThemeKey, ThemeDefinition> = {
  fantasy: {
    name: '다크 판타지',
    badge: '🌌 다크 판타지',
    containerBg: '#020617',
    titleColor: '#a5b4fc',
    titleBorder: '#312e81',
    boxBg: 'rgba(15, 23, 42, 0.9)',
    boxBorder: '#6366f1',
    nameColor: '#fde68a',
    dialogueColor: '#cbd5e1',
    btnBg: '#4f46e5',
    btnColor: '#ffffff',
    btnBorder: '#6366f1',
    glowSoft: '0 8px 20px rgba(99, 102, 241, 0.25)',
    glowBright: '0 0 25px rgba(99, 102, 241, 0.55)',
    glowNone: 'none',
    cssTemplate: `/* 🌌 다크 판타지 테마 CSS */
body {
  background-color: #020617; /* 칠흑 같은 심야 밤하늘 */
  color: #f8fafc;
}

h1 {
  color: #a5b4fc;
  border-bottom: 2px solid #312e81;
}

.dialogue-box {
  background-color: rgba(15, 23, 42, 0.9);
  border: 1px solid #6366f1;
  border-radius: __RADIUS__px;
  box-shadow: __GLOW__;
}

.name {
  color: #fde68a; /* 눈부신 황금빛 이름표 */
  font-weight: bold;
}

.dialogue {
  font-size: __FONT__px;
  color: #cbd5e1;
}

button {
  background-color: #4f46e5;
  color: #ffffff;
  border: 1px solid #6366f1;
  border-radius: __RADIUS__px;
  transition: all 0.2s ease;
}

button:hover {
  background-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
}`
  },
  cyber: {
    name: '네온 사이버',
    badge: '⚡ 네온 사이버',
    containerBg: '#09090b',
    titleColor: '#22d3ee',
    titleBorder: '#0891b2',
    boxBg: 'rgba(24, 24, 27, 0.9)',
    boxBorder: '#06b6d4',
    nameColor: '#f472b6',
    dialogueColor: '#ecfeff',
    btnBg: '#06b6d4',
    btnColor: '#09090b',
    btnBorder: '#22d3ee',
    glowSoft: '0 8px 20px rgba(6, 182, 212, 0.3)',
    glowBright: '0 0 25px rgba(6, 182, 212, 0.65)',
    glowNone: 'none',
    cssTemplate: `/* ⚡ 네온 사이버 테마 CSS */
body {
  background-color: #09090b; /* 네온 골목 칠흑 */
  color: #ecfeff;
}

h1 {
  color: #22d3ee;
  border-bottom: 2px solid #0891b2;
}

.dialogue-box {
  background-color: rgba(24, 24, 27, 0.9);
  border: 1px solid #06b6d4;
  border-radius: __RADIUS__px;
  box-shadow: __GLOW__;
}

.name {
  color: #f472b6; /* 네온 핑크 캐릭터 명찰 */
  font-weight: bold;
}

.dialogue {
  font-size: __FONT__px;
  color: #ecfeff;
}

button {
  background-color: #06b6d4;
  color: #09090b;
  font-weight: bold;
  border: 1px solid #22d3ee;
  border-radius: __RADIUS__px;
  transition: all 0.15s ease;
}

button:hover {
  background-color: #22d3ee;
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
}`
  },
  candy: {
    name: '캔디 파스텔',
    badge: '🍬 캔디 파스텔',
    containerBg: '#fff1f2',
    titleColor: '#e11d48',
    titleBorder: '#fecdd3',
    boxBg: '#ffffff',
    boxBorder: '#fda4af',
    nameColor: '#0d9488',
    dialogueColor: '#475569',
    btnBg: '#fb7185',
    btnColor: '#ffffff',
    btnBorder: '#f43f5e',
    glowSoft: '0 8px 20px rgba(251, 113, 133, 0.2)',
    glowBright: '0 0 20px rgba(251, 113, 133, 0.45)',
    glowNone: 'none',
    cssTemplate: `/* 🍬 캔디 파스텔 테마 CSS */
body {
  background-color: #fff1f2; /* 부드러운 딸기우유 크림 */
  color: #475569;
}

h1 {
  color: #e11d48;
  border-bottom: 2px solid #fecdd3;
}

.dialogue-box {
  background-color: #ffffff;
  border: 1px solid #fda4af;
  border-radius: __RADIUS__px;
  box-shadow: __GLOW__;
}

.name {
  color: #0d9488; /* 민트초코 캐릭터 이름표 */
  font-weight: bold;
}

.dialogue {
  font-size: __FONT__px;
  color: #475569;
}

button {
  background-color: #fb7185;
  color: #ffffff;
  font-weight: bold;
  border: 1px solid #f43f5e;
  border-radius: __RADIUS__px;
  transition: all 0.2s ease;
}

button:hover {
  background-color: #f43f5e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
}`
  }
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
    emoji: '🌌',
    title: '1. 다크 판타지 마법진 발광 CSS 소환 퀘스트',
    weakness: 'box-shadow 다중 발광과 그라데이션을 결합한 입체 조명 연출',
    prompt: `[Goal]:
내가 만든 HTML 비주얼 노벨 대사창을 으스스하고 신비로운 '다크 판타지 마법 테마'로 완벽하게 변신시키는 CSS 코드를 작성해줘.

[Actor]:
블리자드 판타지 게임 전문 15년 차 시니어 UI/UX 비주얼 아티스트

[Condition]:
- 대상 HTML 구조:
  <h1>장면 제목</h1>, <div class="dialogue-box">, <span class="name">, <p class="dialogue">, <button class="choice-btn">
- 스타일 요구사항:
  1) 전체 배경: 칠흑 같은 심야 밤하늘 (#020617)
  2) 대사창: 반투명 다크 슬레이트 배경에 은은한 보라빛 테두리와 마법진 그림자(box-shadow)
  3) 캐릭터 이름표: 눈부신 황금빛 골드 (#fde68a)
  4) 선택지 버튼: 마우스를 올리면(:hover) 보라색 네온 불빛이 번쩍이며 살짝 커지는 인터랙션

[Output Format]:
- 순수 CSS 코드 블록 (초보자용 매 줄 주석 포함)
- 각 속성이 어떤 시각적 분위기를 연출하는지 3줄 설명`,
    aiMagic:
      '버튼에 마우스를 올렸을 때 마법진이 실제로 작동하듯 번쩍이는 CSS hover 애니메이션과 box-shadow 발광 효과를 단 3초 만에 설계합니다.',
    magicReason:
      'AI에게 명확한 헥스(Hex) 컬러와 발광 반경(blur radius) 조건을 주면, 고난도 그래픽 엔진 수준의 시각적 명암 대비를 정확히 계산합니다.'
  },
  {
    id: 2,
    emoji: '🕵️',
    title: '2. 세미콜론 실종과 중괄호 탈옥 QA 검사관 퀘스트',
    weakness: '세미콜론(;) 누락 및 닫는 중괄호(}) 불일치로 인한 CSS 붕괴 탐지',
    prompt: `[Goal]:
내가 작성한 CSS 코드에서 화면을 하얗게 망가뜨리는 '문법 버그 3가지'를 매의 눈으로 찾아내 교정해줘.

[Actor]:
W3C CSS 유효성 검사관 출신의 엄격한 프론트엔드 코드 리뷰어

[Condition]:
- 검사할 버그 코드:
  .dialogue-box {
    background-color: #0f172a
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  
  .choice-btn {
    color: #ffffff;
    background: linear-gradient(to right, #4f46e5, #06b6d4)
    padding: 12px 20px;
    border: none;
  }
  .choice-btn:hover {
    transform: scale(1.05)
    transition: all 0.2s;
  }
- 숨겨진 문법 에러 3가지를 초보자도 이해할 수 있는 비유로 짚어줄 것.

[Output Format]:
1. 버그 1, 2, 3의 위치와 그로 인해 발생하는 치명적 결과
2. 완벽하게 교정된 깨끗한 정답 CSS 코드`,
    aiMagic:
      '세미콜론 누락(background-color, transform)과 닫는 중괄호(}) 실종을 정확히 짚어내며 완벽한 정답 코드로 즉시 복구해 줍니다!',
    magicReason:
      'CSS 파서는 오류를 만나면 오류 메시지 없이 조용히 무시(Fail silently)합니다. AI는 추상 구문 트리를 가상으로 돌려 파싱이 깨진 지점을 정확히 추적합니다.'
  },
  {
    id: 3,
    emoji: '⚡',
    title: '3. 네온 사이버펑크 글래스모피즘 대사창 디자인 퀘스트',
    weakness: '반투명 배경(rgba)과 backdrop-filter: blur(), 네온 보더 효과',
    prompt: `[Goal]:
미래 SF 해커 도시를 배경으로 하는 '네온 사이버펑크 글래스모피즘(유리창 투과) 대사창 CSS'를 만들어줘.

[Actor]:
사이버펑크 2077 스타일의 미래형 게임 그래픽 디자이너

[Condition]:
- 반투명 유리 효과:
  - backdrop-filter: blur(12px)로 뒷배경을 부드럽게 흐리게 처리
  - background: rgba(9, 9, 11, 0.75)의 칠흑 반투명 유리
- 네온 발광 테두리:
  - border: 1px solid #22d3ee (시안 형광빛)
  - box-shadow를 3중으로 겹쳐 테두리 바깥으로 청록색 네온이 뿜어져 나오게 연출
- 캐릭터 이름표: 네온 핑크 (#f472b6) 텍스트 섀도우

[Output Format]:
- 단독으로 적용 가능한 CSS 클래스 세트 (.cyber-window, .cyber-btn 등)
- 초보자가 수치를 바꿔가며 네온 밝기를 조절할 수 있는 튜닝 가이드 2가지`,
    aiMagic:
      '마치 미래 SF 영화 속 해커 콘솔 창처럼 뒤가 은은하게 비치는 환상적인 글래스모피즘과 네온 광원 효과를 순수 CSS 코드로 구현해 줍니다!',
    magicReason:
      '현대 브라우저의 GPU 가속 렌더링 엔진은 backdrop-filter와 다중 박스 섀도우를 실시간 셰이더처럼 고속 연산하므로, 별도 이미지 없이도 화려한 연출이 가능합니다.'
  },
  {
    id: 4,
    emoji: '🎮',
    title: '4. 마우스 호버(Hover) 시 통통 튀는 게임 버튼 인터랙션 퀘스트',
    weakness: '가상 클래스(:hover, :active)와 transform, transition 타이밍 조율',
    prompt: `[Goal]:
플레이어가 마우스를 올리거나 클릭할 때 '찰진 손맛과 타격감'이 느껴지는 비주얼 노벨 인터랙티브 버튼 CSS를 작성해줘.

[Actor]:
게임 패드 조작감과 UI 타격감 전문 게임 엔지니어

[Condition]:
- 기본 상태:
  - 둥근 모서리(border-radius: 12px)와 살짝 떠 있는 그림자
- 마우스 호버(:hover) 상태:
  - 버튼이 위로 3px 떠오름 (transform: translateY(-3px))
  - 그림자가 더 짙고 넓게 퍼지며 입체감 상승
- 클릭 중(:active) 상태:
  - 버튼이 쏙 눌림 (transform: translateY(1px) scale(0.98))
  - 부드러운 전환 효과: transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)

[Output Format]:
- 바로 복사해서 button 태그에 먹일 수 있는 CSS 코드
- 버튼의 탄력감(바운스 효과)을 조절하는 비결 1줄 요약`,
    aiMagic:
      '마우스를 대면 붕 떠오르고 클릭하면 쏙 들어가는 진짜 아케이드 게임기 버튼 같은 물리적 손맛을 브라우저에 불어넣어 줍니다!',
    magicReason:
      'CSS 가상 클래스(:hover, :active)와 베지에 곡선(cubic-bezier) 타이밍 함수는 사람의 눈과 뇌가 인지하는 탄력 가속도를 모방하여 손맛을 만듭니다.'
  },
  {
    id: 5,
    emoji: '🎨',
    title: '5. 텍스트 소설 분위기 기반 맞춤형 CSS 테마 변수 추출 퀘스트',
    weakness: '비정형 텍스트 분위기 분석 및 CSS 커스텀 변수(--root) 자동 추출',
    prompt: `[Goal]:
내가 쓴 단편 소설의 분위기(무드)를 AI가 정밀 분석하여, 게임에 즉시 적용 가능한 '5대 감성 CSS 변수 컬러 팔레트'를 뽑아줘.

[Actor]:
색채 심리학을 전공한 게임 아트 디렉터

[Condition]:
- 소설 줄거리:
  "눈보라가 몰아치는 얼음 호수 한가운데, 버려진 크리스탈 등대에서 에메랄드빛 불꽃이 깜빡이고 있었다. 얼어붙은 소년 카일은 호흡을 가다듬으며 등대의 문을 두드렸다."
- 요구사항:
  1) 이야기의 감성(차가움, 신비로움, 희망의 불꽃)을 반영한 5가지 색상 추출
  2) :root { --bg-color: ...; --text-color: ...; } 형태의 CSS 커스텀 변수로 작성
  3) 각 색상이 소설의 어떤 상징을 나타내는지 색채 심리학적 이유 설명

[Output Format]:
- :root CSS 변수 코드 블록
- 색상별 상징 의미와 헥스(Hex) 코드 표`,
    aiMagic:
      '소설 줄글 속 '눈보라, 크리스탈, 에메랄드빛 불꽃'을 즉시 분석하여 신비롭고 차가운 판타지 전용 5가지 하모니 컬러 코드를 완벽하게 배색해 줍니다!',
    magicReason:
      'LLM의 문맥 감성 분석(Sentiment Analysis) 능력을 색채 조화 이론과 결합하여, 이야기의 무드에 수학적으로 어울리는 명도/채도 팔레트를 생성하기 때문입니다.'
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
    emoji: '🎨',
    term: 'CSS',
    caption: 'Cascading Style Sheets / 계단식 스타일 시트',
    kidMetaphor: '새하얀 도화지 인형에 알록달록 입히는 마법 옷과 스티커북!',
    devDefinition:
      'HTML 문서의 레이아웃, 색상, 글꼴, 시각적 효과를 브라우저에 지시하는 웹 스타일 시트 표준 언어.'
  },
  {
    id: 2,
    emoji: '🎯',
    term: '선택자',
    caption: 'Selector / 스타일 적용 대상 지정자',
    kidMetaphor: '"파란 모자 쓴 친구 앞으로 나와!" 하고 콕 집어 부르는 출석부 호명!',
    devDefinition:
      'HTML 문서 내에서 스타일 규칙을 적용할 특정 요소(태그명, class, id)를 지정하는 검색 표현식.'
  },
  {
    id: 3,
    emoji: '📦',
    term: '속성과 값',
    caption: 'Property & Value / 스타일 항목과 구체적 수치',
    kidMetaphor: '"눈동자 색상(속성)은 파란색(값)으로 칠해줘!"',
    devDefinition:
      '변경하고자 하는 시각적 특성(예: font-size)과 그 특성에 대입하는 구체적인 수치나 키워드(예: 16px).'
  },
  {
    id: 4,
    emoji: '🎁',
    term: '박스 모델',
    caption: 'Box Model / 콘텐츠, 패딩, 테두리, 마진의 4중 공간 모델',
    kidMetaphor:
      '선물 상자 안의 과자(콘텐츠), 뽁뽁이 완충재(패딩), 튼튼한 포장 상자(테두리), 상자들끼리 부딪히지 않는 간격(마진)!',
    devDefinition:
      '웹의 모든 요소가 콘텐츠(Content), 안쪽 여백(Padding), 테두리(Border), 바깥쪽 여백(Margin)으로 계산되는 공간 모델.'
  },
  {
    id: 5,
    emoji: '🪄',
    term: '의사 클래스 호버',
    caption: 'Pseudo-class :hover / 상태 감지 가상 클래스',
    kidMetaphor: '잠자고 있던 햄스터에게 손가락을 대면 눈을 번쩍 뜨고 꼬리를 흔드는 마법 스위치!',
    devDefinition:
      '사용자가 마우스 포인터를 요소 위에 올렸을 때만 임시로 활성화되는 CSS 상태 가상 클래스.'
  }
];

interface CheckItem {
  id: number;
  text: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 1,
    text: '웹을 만드는 3총사 중 CSS(화면 꾸미기와 감성 연출)의 역할을 설명할 수 있나요?'
  },
  {
    id: 2,
    text: 'CSS 문법의 황금 공식 "누구를 { 어떻게: 얼마나; }"의 3요소를 구분할 수 있나요?'
  },
  {
    id: 3,
    text: '4대 마법 속성(color, border-radius, box-shadow, transition)의 기능을 알고 있나요?'
  },
  {
    id: 4,
    text: '가상 CSS 스타일러 콘솔에서 3대 테마(판타지, 사이버, 캔디)를 직접 적용하고 실시간 화면을 관찰했나요?'
  },
  {
    id: 5,
    text: '최신 AI에게 내 비주얼 노벨 분위기에 어울리는 화려한 CSS 코드 소환 퀘스트를 성공시켰나요?'
  },
  {
    id: 6,
    text: '세미콜론(;)의 중요성과 class(.), id(#) 선택자 기호의 차이를 주니어 개발자 언어로 설명할 수 있나요?'
  }
];

export const Lesson06: React.FC<Lesson06Props> = ({ onComplete }) => {
  const [stage, setStage] = useState<StageType>('stage1');
  const [currentThemeKey, setCurrentThemeKey] = useState<ThemeKey>('fantasy');
  const [currentRadius, setCurrentRadius] = useState<RadiusSize>(16);
  const [currentFontSize, setCurrentFontSize] = useState<FontSize>(16);
  const [currentGlow, setCurrentGlow] = useState<GlowType>('glow');
  const [cssCode, setCssCode] = useState<string>('');
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  // CSS 코드 문자열 계산 함수
  const generateCss = (theme: ThemeKey, radius: RadiusSize, font: FontSize, glow: GlowType) => {
    const t = THEMES[theme];
    let glowVal = t.glowBright;
    if (glow === 'soft') glowVal = t.glowSoft;
    if (glow === 'none') glowVal = t.glowNone;

    return t.cssTemplate
      .replace(/__RADIUS__/g, String(radius))
      .replace(/__FONT__/g, String(font))
      .replace(/__GLOW__/g, glowVal);
  };

  // 초기화 및 테마 변경 시 동기화
  useEffect(() => {
    setCssCode(generateCss(currentThemeKey, currentRadius, currentFontSize, currentGlow));
  }, [currentThemeKey, currentRadius, currentFontSize, currentGlow]);

  // 로컬 스토리지 체크리스트 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_06_checklist');
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
        localStorage.setItem('ai_lesson_06_checklist', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      if (next.length === CHECKLIST_ITEMS.length && onComplete) {
        onComplete();
      }
      return next;
    });
  };

  const handleSelectTheme = (key: ThemeKey) => {
    setCurrentThemeKey(key);
  };

  const handleResetCss = () => {
    setCssCode(generateCss(currentThemeKey, currentRadius, currentFontSize, currentGlow));
  };

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
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

  const currentTheme = THEMES[currentThemeKey];
  let activeGlowVal = currentTheme.glowBright;
  if (currentGlow === 'soft') activeGlowVal = currentTheme.glowSoft;
  if (currentGlow === 'none') activeGlowVal = currentTheme.glowNone;

  // Analysis badges
  const hasColor = cssCode.includes('color:');
  const hasBg = cssCode.includes('background-color:') || cssCode.includes('background:');
  const hasRadius = cssCode.includes('border-radius:');
  const hasShadow = cssCode.includes('box-shadow:');
  const hasHover = cssCode.includes(':hover');

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
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 hover:opacity-90 transition-opacity"
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
                6강: 게임 화면에 화려한 마법 옷 입히기 (CSS 스타일링)
              </span>
            </div>
          </div>

          {/* [오른쪽]: 4단계 스테이지 스위처 버튼 그룹 (오른쪽 정렬) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200" role="tablist" aria-label="6강 4단계 스테이지">
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
              <span>CSS 스타일러</span>
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
          2. 스타일
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
            <article className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-sm font-mono font-bold tracking-wider uppercase border border-indigo-400/30">
                  시즌 2 · 6강 미션 브리핑
                </span>
                <span className="text-sm text-cyan-300 font-semibold flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  CSS 스타일링 & 테마 쇼케이스
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  밋밋한 흑백 게임 화면에 화려한 마법의 옷(CSS)을 입혀봅시다!
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  5강에서 조립한 대사창과 선택지 버튼은 아직 색깔도, 그림자도 없는 밋밋한 흑백 레고 블록입니다.
                  오늘 <strong>CSS(Cascading Style Sheets)</strong>의 마법을 배우면, 단 몇 줄의 코드로 어두운 밤하늘의 <strong>다크 판타지</strong>,
                  눈부신 네온 불빛의 <strong>사이버펑크</strong>, 폭신폭신 달콤한 <strong>캔디 파스텔</strong> 게임 화면으로 순식간에 변신시킬 수 있습니다!
                </p>
              </div>

              {/* 3대 도전 목표 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>1. CSS 황금 공식</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    "누구를 {`{`} 어떻게: 얼마나; {`}`}" 선택자-속성-값의 문법 규칙을 정복합니다.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Sliders className="w-4 h-4" />
                    <span>2. 4대 마법 속성</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    색상, 둥근 모서리, 네온 그림자, 마우스 호버(Hover) 효과를 직접 조작합니다.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Code2 className="w-4 h-4" />
                    <span>3. AI 테마 소환</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    최신 생성형 AI에게 내 게임 분위기에 딱 맞는 환상적인 CSS를 주문합니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 핵심 개념 원리 탐구 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>💡 주니어 개발자를 위한 핵심 개념 3가지</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  웹 브라우저가 화면을 예쁘게 꾸밀 때 사용하는 CSS의 작동 원리를 직관적으로 이해해 봅시다.
                </p>
              </div>

              <div className="space-y-4">
                {/* 개념 1: CSS 황금 공식 */}
                <div className="p-4.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <h4 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                    <span>🎯</span>
                    <span>1. CSS 문법의 황금 공식: "누구를 {`{`} 어떻게: 얼마나; {`}`}"</span>
                  </h4>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    CSS 코드는 마치 마법사가 마법 주문을 외우는 것과 같습니다. 주문의 구조는 단 3단어로 이루어집니다:
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-indigo-200 font-mono text-sm text-slate-800 leading-relaxed">
                    <span className="text-indigo-600 font-bold">h1</span> {`{`}<br />
                    &nbsp;&nbsp;<span className="text-purple-600 font-bold">color</span>: <span className="text-emerald-600 font-bold">#a5b4fc</span>; <span className="text-slate-400 font-sans">/* 큰 제목의 글자색을 연보라색으로! */</span><br />
                    &nbsp;&nbsp;<span className="text-purple-600 font-bold">font-size</span>: <span className="text-emerald-600 font-bold">24px</span>; <span className="text-slate-400 font-sans">/* 글자 크기는 24픽셀로! */</span><br />
                    {`}`}
                  </div>
                  <ul className="text-sm text-indigo-900 space-y-1 pl-4 list-disc">
                    <li><strong>누구를 (선택자, Selector):</strong> 스타일을 입힐 대상 태그나 명찰 (예: <code className="font-mono font-bold">h1</code>, <code className="font-mono font-bold">.dialogue-box</code>)</li>
                    <li><strong>어떻게 (속성, Property):</strong> 바꾸고 싶은 스타일 항목 (예: <code className="font-mono font-bold">color</code>, <code className="font-mono font-bold">background-color</code>)</li>
                    <li><strong>얼마나 (값, Value):</strong> 구체적인 색상이나 크기 수치 (예: <code className="font-mono font-bold">#a5b4fc</code>, <code className="font-mono font-bold">16px</code>)</li>
                  </ul>
                </div>

                {/* 개념 2: 4대 마법 속성 */}
                <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🪄</span>
                    <span>2. 오늘 바로 써먹는 비주얼 노벨 CSS 4대 마법 속성</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">color & background-color</span>
                      <p className="text-sm text-slate-600 mt-1">글자색과 배경색을 지정합니다. 어두운 배경에 밝은 글자를 쓰면 즉시 다크 판타지 분위기가 완성됩니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">border-radius</span>
                      <p className="text-sm text-slate-600 mt-1">날카로운 사각형 모서리를 둥글게 깎아 부드러운 카드나 알약 모양 버튼으로 만듭니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">box-shadow</span>
                      <p className="text-sm text-slate-600 mt-1">대사창과 버튼 뒤에 그림자를 드리워 화면에서 붕 떠오르는 입체감과 네온빛 발광 효과를 줍니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">:hover & transform & transition</span>
                      <p className="text-sm text-slate-600 mt-1">마우스를 올렸을 때 버튼이 쏙 커지거나 색상이 부드럽게 바뀌는 살아 숨 쉬는 게임 손맛을 만듭니다.</p>
                    </div>
                  </div>
                </div>

                {/* 개념 3: 주니어 개발자의 황금 원칙 */}
                <div className="p-4.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                  <h4 className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <span>⚡</span>
                    <span>3. 주니어 개발자가 절대 잊지 말아야 할 CSS 2대 황금 원칙</span>
                  </h4>
                  <div className="space-y-2 text-sm text-amber-900">
                    <p className="leading-relaxed">
                      <strong>원칙 1: 세미콜론(;)은 마침표다!</strong><br />
                      CSS 속성 값 뒤에는 반드시 세미콜론(<code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">;</code>)을 찍어야 합니다. 세미콜론을 빼먹으면 브라우저는 어디서 마법이 끝났는지 알 수 없어 그 아래쪽 모든 스타일을 무시해 버립니다!
                    </p>
                    <p className="leading-relaxed">
                      <strong>원칙 2: 점(.)은 class 명찰, 샵(#)은 id 주민번호!</strong><br />
                      5강에서 배운 HTML 명찰을 부를 때, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">class="choices"</code>는 앞에 점을 붙여 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.choices</code>로 부르고, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">id="game-title"</code>은 샵을 붙여 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">#game-title</code>로 호명합니다.
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
                  <span>다음: Stage 2 가상 CSS 스타일러 실습</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </section>
        )}

        {/* ===================================================================
            [STAGE 02] 가상 AI 실습 콘솔 - CSS 스타일러 & 라이브 뷰어
            =================================================================== */}
        {(stage === 'stage2' || stage === 'all') && (
          <section className="space-y-6">
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Sliders className="w-5 h-5" />
                    <span className="text-sm font-extrabold uppercase tracking-wider">
                      STAGE 02 · 가상 AI 실습 콘솔
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    CSS 테마 스위처 & 실시간 브라우저 렌더링 뷰어
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    원클릭으로 3대 게임 테마를 교체하고, 모서리 둥글기와 그림자 효과를 실시간으로 조절해 보세요.
                  </p>
                </div>

                {/* 상단 3대 테마 버튼 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">테마 프리셋:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('fantasy')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      currentThemeKey === 'fantasy'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🌌 다크 판타지
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('cyber')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      currentThemeKey === 'cyber'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ⚡ 네온 사이버
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('candy')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      currentThemeKey === 'candy'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🍬 캔디 파스텔
                  </button>
                </div>
              </div>

              {/* 미세 조절 컨트롤러 바 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm">
                {/* 모서리 둥글기 */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-indigo-600" />
                    <span>모서리 (border-radius)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {([8, 16, 28] as RadiusSize[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCurrentRadius(r)}
                        className={`flex-1 py-1 px-2 rounded-md font-mono text-sm font-bold transition-all ${
                          currentRadius === r
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-700'
                            : 'bg-white border border-slate-200 hover:border-indigo-400 text-slate-700'
                        }`}
                      >
                        {r}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 글자 크기 */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-indigo-600" />
                    <span>글자 크기 (font-size)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {([14, 16, 18] as FontSize[]).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setCurrentFontSize(sz)}
                        className={`flex-1 py-1 px-2 rounded-md font-mono text-sm font-bold transition-all ${
                          currentFontSize === sz
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-700'
                            : 'bg-white border border-slate-200 hover:border-indigo-400 text-slate-700'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 그림자 효과 */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>네온 그림자 (box-shadow)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {(['soft', 'glow', 'none'] as GlowType[]).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setCurrentGlow(g)}
                        className={`flex-1 py-1 px-2 rounded-md font-mono text-sm font-bold transition-all capitalize ${
                          currentGlow === g
                            ? 'bg-indigo-50 border border-indigo-300 text-indigo-700'
                            : 'bg-white border border-slate-200 hover:border-indigo-400 text-slate-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2열 워크스페이스: 왼쪽 CSS 코드 에디터, 오른쪽 라이브 프리뷰 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 왼쪽: style.css 코드 편집기 */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <span>style.css 코드 뷰어</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleResetCss}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-bold transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>초기화</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyCss}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                      >
                        {copiedCss ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCss ? '복사됨! ✨' : 'CSS 복사'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={cssCode}
                    onChange={e => setCssCode(e.target.value)}
                    rows={15}
                    className="w-full p-3.5 rounded-xl bg-slate-900 text-cyan-300 font-mono text-sm leading-relaxed border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-inner resize-y"
                    spellCheck={false}
                  />
                </div>

                {/* 오른쪽: 실시간 브라우저 렌더링 화면 */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-cyan-600" />
                      <span>브라우저 렌더링 화면</span>
                    </span>
                    <span className="text-sm font-mono text-slate-400">버튼에 마우스를 올려보세요!</span>
                  </div>
                  <div
                    className="w-full h-full min-h-[340px] p-5 rounded-xl border border-slate-700 shadow-inner flex flex-col justify-between overflow-auto transition-all duration-300"
                    style={{ backgroundColor: currentTheme.containerBg }}
                  >
                    <div className="space-y-4">
                      <h1
                        className="text-lg font-bold pb-2 transition-all border-b"
                        style={{
                          color: currentTheme.titleColor,
                          borderBottomColor: currentTheme.titleBorder
                        }}
                      >
                        고대 유적 지하 5층
                      </h1>
                      <div
                        className="p-4 rounded-xl border transition-all space-y-1.5"
                        style={{
                          backgroundColor: currentTheme.boxBg,
                          borderColor: currentTheme.boxBorder,
                          borderRadius: `${currentRadius}px`,
                          boxShadow: activeGlowVal
                        }}
                      >
                        <span
                          className="font-bold text-sm block"
                          style={{ color: currentTheme.nameColor }}
                        >
                          마법사 엘리아:
                        </span>
                        <p
                          className="text-sm leading-relaxed"
                          style={{
                            color: currentTheme.dialogueColor,
                            fontSize: `${currentFontSize}px`
                          }}
                        >
                          "벽면에 새겨진 고대 마법 문양이 푸른빛으로 요동치고 있어. 조심해!"
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => alert('✨ 마법 지팡이를 꺼내 마법진을 분석했습니다!')}
                          className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer hover:scale-[1.02]"
                          style={{
                            backgroundColor: currentTheme.btnBg,
                            color: currentTheme.btnColor,
                            borderColor: currentTheme.btnBorder,
                            borderRadius: `${currentRadius}px`
                          }}
                        >
                          ✨ 마법 지팡이로 고대 문양 해독하기
                        </button>
                        <button
                          type="button"
                          onClick={() => alert('🛡️ 방패를 앞세워 한 걸음 뒤로 물러났습니다!')}
                          className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer hover:scale-[1.02]"
                          style={{
                            backgroundColor: currentTheme.btnBg,
                            color: currentTheme.btnColor,
                            borderColor: currentTheme.btnBorder,
                            borderRadius: `${currentRadius}px`
                          }}
                        >
                          🛡️ 방패를 들고 조심스럽게 방어 태세 취하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSS 속성 자동 점검 리포트 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-sm font-bold text-slate-700 block">
                  🔍 CSS 핵심 속성 자동 적용 상태:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasColor ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasColor ? '✓' : '✗'} 글자색(color)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasBg ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasBg ? '✓' : '✗'} 배경색(background)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasRadius ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasRadius ? '✓' : '✗'} 둥근모서리(border-radius)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasShadow ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasShadow ? '✓' : '✗'} 네온그림자(box-shadow)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasHover ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasHover ? '✓' : '✗'} 호버반응(:hover)
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
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    외부 AI(ChatGPT / Gemini)에 프롬프트를 복사하여 실제 스타일을 소환해 보세요!
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    원클릭 복사 버튼을 누른 후 실제 생성형 AI에 입력해 보고 화려한 비주얼 노벨 CSS 코드를 완성합니다.
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
                  <span>이전: Stage 2 가상 CSS 스타일러</span>
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
                  오늘 배운 CSS 스타일링의 실제 공식 웹 표준 / 컴퓨터 과학 전문 용어를 확인해 보세요.
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
                    <span>6강 학습 성취도 자가 점검 체크리스트</span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    스스로 이해했는지 확인하며 체크박스를 눌러보세요. 6개를 모두 완료하면 7강이 언락됩니다!
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

              {/* 100% 달성 시 완주 축하 및 7강 언락 카드 */}
              {isAllChecked && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white space-y-4 shadow-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl flex-shrink-0">
                      🎨
                    </div>
                    <div>
                      <span className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-200 block">
                        LESSON 06 COMPLETE!
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        시즌 1 완주 & 웹 스타일링 마스터 달성을 축하합니다! 🎉
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    이제 내가 만든 대사창에 멋진 감성 옷을 입힐 수 있게 되었습니다!
                    다음 <strong>7강에서는 드디어 JavaScript(동작과 두뇌)</strong>를 배워, 클릭할 때마다 점수가 올라가는 실시간 쿠키클리커 미니게임을 만들어 봅시다!
                  </p>
                  <div className="pt-1">
                    <a
                      href="/lessons/07"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-800 font-bold text-sm shadow-sm hover:bg-indigo-50 transition-all cursor-pointer"
                    >
                      <span>7강: JavaScript로 반응하는 게임 화면 도전하기</span>
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

export default Lesson06;
