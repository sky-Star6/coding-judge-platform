import React, { useState, useEffect, useRef } from 'react';
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
  PlayCircle,
  Eye,
  FileCode,
  CheckSquare,
  ShieldCheck,
  BookOpen,
  Layers
} from 'lucide-react';

interface Lesson05Props {
  onComplete?: () => void;
}

type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type PresetKey = 'library' | 'dragon' | 'shop';

interface PresetData {
  title: string;
  desc: string;
  code: string;
}

const PRESETS: Record<PresetKey, PresetData> = {
  library: {
    title: '📚 고대 도서관 3층',
    desc: '마법사 루카의 대사와 2대 선택지 (도서관 탐색)',
    code: `<h1>고대 도서관 3층</h1>

<div class="dialogue-box">
  <span class="name">마법사 루카:</span>
  <p>"쉿! 저 먼지 쌓인 서가 뒤에서 수상한 푸른빛이 새어 나오고 있어."</p>
</div>

<div class="choices">
  <button onclick="alert('📘 푸른 마법책을 조심스럽게 꺼냈습니다!')">📘 푸른 마법책을 집어 든다</button>
  <button onclick="alert('🚪 살금살금 계단 아래로 도망쳤습니다!')">🚪 살금살금 계단으로 도망친다</button>
</div>`
  },
  dragon: {
    title: '🐉 화염산 정상 분화구',
    desc: '붉은 용 이그니스 보스전 대사창과 액션 선택 버튼',
    code: `<h1>화염산 정상 분화구</h1>

<div class="dialogue-box">
  <span class="name">붉은 용 이그니스:</span>
  <p>"감히 내 황금 보물창고에 발을 들인 인간이 너로구나!"</p>
</div>

<div class="choices">
  <button onclick="alert('🛡️ 방패를 들어 올려 불꽃 브레스를 막아냈습니다!')">🛡️ 방패로 브레스 방어하기</button>
  <button onclick="alert('🗣️ 드래곤에게 황금보다 값진 수수께끼를 제안했습니다!')">🗣️ 대화로 수수께끼 내기</button>
</div>`
  },
  shop: {
    title: '🌙 달빛 골목 비밀 상점',
    desc: '달빛 상인 릴리의 신비한 아이템 판매 대사창',
    code: `<h1>달빛 골목 비밀 상점</h1>

<div class="dialogue-box">
  <span class="name">달빛 상인 릴리:</span>
  <p>"어둠 속을 헤매는 여행자여, 오늘 밤엔 특별한 마법 물건만 판다오."</p>
</div>

<div class="choices">
  <button onclick="alert('✨ 100골드를 주고 투명 망토를 구입했습니다!')">✨ 투명 망토 구입 (100G)</button>
  <button onclick="alert('👋 상인에게 정중히 인사하고 골목을 빠져나왔습니다!')">👋 그냥 지나치기</button>
</div>`
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
    emoji: '🧱',
    title: '1. 비주얼 노벨 3단 HTML 뼈대 소환 퀘스트',
    weakness: '시맨틱 태그 구조화와 컨테이너 분리',
    prompt: `[Goal]:
웹 브라우저에서 실행 가능한 비주얼 노벨 게임의 'HTML 대사창과 3대 선택지' 뼈대 코드를 만들어줘.

[Actor]:
초보 웹 개발자를 가르치는 친절한 시니어 프론트엔드 멘토

[Condition]:
- CSS나 JS 파일 없이, 순수 HTML 태그(h1, div, span, p, button)만 사용할 것.
- 구조:
  1) 최상단 게임 제목(h1)
  2) 캐릭터 이름표(span)와 대사 본문(p)을 감싼 대사창 박스(div)
  3) 세 가지 선택지 버튼(button 3개)을 감싼 버튼 영역(div)
- 각 버튼을 클릭하면 alert() 창이 뜨도록 onclick 속성을 넣어줘.

[Output Format]:
- 순수 HTML 코드 블록 (초보자용 매 줄 주석 포함)
- 사용된 태그(h1, div, span, p, button)의 역할 1줄 요약`,
    aiMagic:
      '복잡한 설명 없이 바로 브라우저에 붙여넣으면 버튼 클릭까지 작동하는 완성도 높은 HTML 대사창 템플릿이 단 3초 만에 작성됩니다!',
    magicReason:
      'AI에게 필요한 태그 목록과 3단 구조(제목➔대사➔선택지)를 명확히 못 박았기 때문에, 군더더기 코드 없이 시맨틱한 규격 코드를 정확히 생성합니다.'
  },
  {
    id: 2,
    emoji: '🕵️',
    title: '2. 닫는 태그 실종 사건 QA 검사관 퀘스트',
    weakness: '닫는 태그 누락 및 태그 중첩(Nesting) 오류 탐지',
    prompt: `[Goal]:
내가 작성한 HTML 코드에서 닫는 태그 누락이나 중첩 오류 같은 '문법 버그'를 매의 눈으로 찾아내줘.

[Actor]:
W3C 웹 표준 검사관 출신의 깐깐한 코드 리뷰어

[Condition]:
- 검사할 코드:
  <h1>신비한 숲속의 갈림길
  <div class="dialogue-box">
    <p>바람이 거세게 불어온다. 어디로 갈까?
  <div>
  <button onclick="alert('왼쪽')">왼쪽 동굴
  <button onclick="alert('오른쪽')">오른쪽 오솔길</button>
- 코드에 숨겨진 치명적인 문법 실수 3가지를 명확히 짚어줄 것.

[Output Format]:
1. 버그 1, 2, 3의 위치와 원인 (초보자가 이해할 수 있는 쉬운 비유)
2. 완벽하게 문법이 수정된 깨끗한 HTML 코드`,
    aiMagic:
      '닫는 태그 누락(<h1>, <p>, <button>)과 div 닫는 태그 오타(<div>)를 정확히 잡아내어 깔끔하게 교정된 코드를 되돌려줍니다!',
    magicReason:
      'LLM은 구문 분석 트리(AST)를 가상으로 시뮬레이션할 수 있어 태그의 짝이 맞지 않는 구조적 결함을 인간보다 훨씬 빠르고 정확하게 찾아냅니다.'
  },
  {
    id: 3,
    emoji: '🏷️',
    title: '3. 명찰과 옷장(id & class) 이름표 설계 퀘스트',
    weakness: 'id와 class의 차이점 및 고유 식별자 설계',
    prompt: `[Goal]:
비주얼 노벨 화면의 각 태그에 나중에 CSS로 예쁘게 꾸밀 수 있도록 'id'와 'class' 명찰을 체계적으로 달아줘.

[Actor]:
10년 차 게임 UI/UX 디자인 시스템 엔지니어

[Condition]:
- 대상: 사이버펑크 도시의 해커 대화창 (화면 타이틀, 해커 이름, 시스템 경고 대사, 암호 해독 버튼 2개).
- 규칙:
  - 단 하나만 존재하는 고유 영역은 'id'를 붙일 것.
  - 여러 개가 반복되거나 공통 스타일을 적용할 요소는 'class'를 붙일 것.
  - 카멜케이스나 케밥케이스 중 웹 표준에 맞는 직관적인 영문 이름 사용.

[Output Format]:
- 명찰(id, class)이 부착된 HTML 코드
- 왜 특정 태그에 id를 쓰고 왜 class를 썼는지 주니어 개발자를 위한 해설`,
    aiMagic:
      'id와 class의 구분을 명확히 지키며, 나중에 CSS를 적용하기 가장 좋은 표준 클래스명(game-title, dialogue-card, btn-choice 등)을 완벽히 설계해 줍니다.',
    magicReason:
      '속성(Attributes)에 대한 설계 원칙을 미리 지정하면, AI가 임의로 네이밍하지 않고 실제 상용 프론트엔드 네이밍 컨벤션에 맞춰 구조화합니다.'
  },
  {
    id: 4,
    emoji: '🎮',
    title: '4. 판타지 RPG 보스전 인터랙티브 선택지 생성 퀘스트',
    weakness: '속성(Attributes)과 이벤트 핸들러 onclick 결합',
    prompt: `[Goal]:
플레이어가 버튼을 눌렀을 때 서로 다른 브라우저 알림창이 뜨는 '드래곤 보스전 3대 선택지' HTML 코드를 작성해줘.

[Actor]:
텍스트 어드벤처 웹 게임 전문 프로그래머

[Condition]:
- 상황: 분화구 정상에서 화염 드래곤을 마주친 클라이맥스.
- 선택지 3개:
  1) [방패 방어]: alert('드래곤의 불꽃을 방패로 막아냈습니다! HP -5')
  2) [얼음 화살]: alert('드래곤의 날개에 얼음 화살이 적중했습니다! 보스가 비틀거립니다.')
  3) [항복하기]: alert('드래곤의 한 끼 간식이 되었습니다... 게임 오버!')
- 각 button 태그에 onclick 속성으로 브라우저 팝업이 바로 뜨게 만들 것.

[Output Format]:
- 즉시 브라우저에서 실행 가능한 HTML 코드 (버튼 영역)
- 각 버튼의 대사와 효과를 일목요연하게 정리한 표`,
    aiMagic:
      '버튼을 누를 때마다 각기 다른 대사와 효과음 같은 alert 창이 시원하게 뜨는 몰입감 넘치는 인터랙티브 게임 버튼 세트를 만들어줍니다.',
    magicReason:
      'HTML 버튼의 onclick 속성은 자바스크립트 함수를 실행하는 가장 기초적인 이벤트 통로입니다. AI는 이벤트 핸들러와 UI 요소를 자연스럽게 연결합니다.'
  },
  {
    id: 5,
    emoji: '🧩',
    title: '5. 텍스트 소설을 HTML 대사창으로 변환하는 자동 파서 퀘스트',
    weakness: '일반 텍스트 문서를 웹 구조화 데이터로 파싱 변환',
    prompt: `[Goal]:
내가 쓴 평범한 줄글 소설을 웹 브라우저에서 바로 보이는 'HTML 비주얼 노벨 대사창 코드'로 완벽하게 변환해줘.

[Actor]:
텍스트-웹 변환 자동화 전문 프론트엔드 아키텍트

[Condition]:
- 원본 소설 텍스트:
  [장소: 달빛 아래 버려진 시계탑]
  태엽 수리공 아리아가 떨리는 손으로 황금 렌치를 쥐었다.
  "이 톱니바퀴가 멈추면 도시 전체의 시간이 영원히 정지해버려!"
  선택 1: 황금 톱니바퀴에 기름을 붓는다.
  선택 2: 시계탑 비상 레버를 힘껏 당긴다.
- 규칙:
  - 장소는 <h1> 태그
  - 캐릭터 이름은 <span class="character-name">
  - 대사와 독백은 각각 <p> 태그
  - 선택지는 각각 onclick="alert(...)"가 달린 <button> 태그로 구조화할 것.

[Output Format]:
- 완벽하게 변환된 HTML 코드 블록
- 소설 텍스트와 HTML 태그가 1:1로 어떻게 대응되었는지 정리한 매핑표`,
    aiMagic:
      '작가가 쓴 비구조화 줄글 소설을 순식간에 웹 표준 시맨틱 HTML 대사창 구조로 1:1 자동 변환해 줍니다!',
    magicReason:
      'LLM의 가장 강력한 장점 중 하나인 '비정형 데이터의 구조화(Structuring)' 능력을 활용하여 문맥 속 화자와 대사, 선택지를 식별해 태그로 감싸는 원리입니다.'
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
    emoji: '🧱',
    term: 'HTML',
    caption: 'HyperText Markup Language / 웹 문서 구조 언어',
    kidMetaphor: '건물을 지을 때 가장 먼저 튼튼하게 세우는 철근 뼈대와 레고 블록!',
    devDefinition:
      '웹 브라우저가 화면에 제목, 본문, 버튼, 이미지 등의 위치와 구조를 해석하도록 규정한 국제 표준 마크업 언어.'
  },
  {
    id: 2,
    emoji: '🏷️',
    term: '시맨틱 태그',
    caption: 'Semantic Tags / 의미를 담은 태그',
    kidMetaphor:
      "그냥 빈 상자가 아니라 '냉장고', '보물상자', '우편함'처럼 이름과 용도가 적힌 특수 레고 블록!",
    devDefinition:
      '브라우저와 검색엔진, 스크린 리더가 콘텐츠의 구조적 의미를 직관적으로 이해할 수 있도록 용도에 맞게 명명된 HTML 태그(<h1>, <p>, <button> 등).'
  },
  {
    id: 3,
    emoji: '📦',
    term: '태그와 요소',
    caption: 'Tags & Elements / 여는 태그, 닫는 태그, 요소',
    kidMetaphor:
      '빵(여는 태그 <p>)과 빵(닫는 태그 </p>) 사이에 맛있는 패티(내용)를 넣은 햄버거 완성품(요소)!',
    devDefinition:
      '시작 태그(<tag>), 콘텐츠, 종료 태그(</tag>)로 구성된 웹 문서의 기본 독립 단위를 HTML 요소(Element)라고 부릅니다.'
  },
  {
    id: 4,
    emoji: '🔖',
    term: '속성',
    caption: 'Attributes / id, class, onclick',
    kidMetaphor:
      '레고 블록에 붙이는 특별한 스티커! (주민번호 id, 동아리 단체복 class, 마법 스위치 onclick)',
    devDefinition:
      'HTML 시작 태그 내부에 작성되어 해당 요소에 고유 식별자, 스타일 그룹명, 이벤트 동작 등의 추가 정보를 부여하는 부가 설정값.'
  },
  {
    id: 5,
    emoji: '🌳',
    term: 'DOM 트리',
    caption: 'Document Object Model Tree / 부모-자식 트리 구조',
    kidMetaphor:
      '커다란 나뭇가지(body)에 줄기(div)가 뻗고, 줄기 끝에 잎사귀(span, button)가 달린 패밀리 트리!',
    devDefinition:
      '브라우저가 HTML 문서를 읽어 태그들의 부모-자식(상하 계층) 관계를 메모리상에 나뭇가지 형태로 표현한 계층적 객체 모델.'
  }
];

interface CheckItem {
  id: number;
  text: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: 1,
    text: '웹을 만드는 3총사(HTML=뼈대, CSS=옷, JS=동작)의 역할을 구분할 수 있나요?'
  },
  {
    id: 2,
    text: 'HTML의 핵심 레고 태그 5총사(<h1>, <p>, <div>, <span>, <button>)를 알고 있나요?'
  },
  {
    id: 3,
    text: '태그는 <여는태그>로 시작해서 슬래시가 붙은 </닫는태그>로 닫아야 함을 기억하나요?'
  },
  {
    id: 4,
    text: '가상 HTML 조립기 콘솔에서 프리셋을 불러오고 실시간 대화창 화면을 직접 확인했나요?'
  },
  {
    id: 5,
    text: '최신 AI에게 내 비주얼 노벨 스토리를 전달하여 완성도 높은 HTML 뼈대 코드를 소환해 보았나요?'
  },
  {
    id: 6,
    text: '태그에 명찰을 다는 속성(id, class, onclick)의 역할을 주니어 개발자의 언어로 설명할 수 있나요?'
  }
];

export const Lesson05: React.FC<Lesson05Props> = ({ onComplete }) => {
  const [stage, setStage] = useState<StageType>('stage1');
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('library');
  const [code, setCode] = useState<string>(PRESETS.library.code);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load saved checklist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_05_checklist');
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
        localStorage.setItem('ai_lesson_05_checklist', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      if (next.length === CHECKLIST_ITEMS.length && onComplete) {
        onComplete();
      }
      return next;
    });
  };

  const handleSelectPreset = (key: PresetKey) => {
    setSelectedPreset(key);
    setCode(PRESETS[key].code);
  };

  const handleInsertTag = (tag: string) => {
    const snippetMap: Record<string, string> = {
      h1: '<h1>새로운 장면 제목</h1>',
      div: '<div class="dialogue-box">\n  <p>대사 내용...</p>\n</div>',
      span: '<span class="name">캐릭터 이름:</span>',
      p: '<p>"새로운 대사 내용입니다."</p>',
      button: '<button onclick="alert(\'선택완료!\')">새로운 선택지</button>'
    };
    const snippet = snippetMap[tag] || `<${tag}></${tag}>`;
    setCode(prev => prev + '\n\n' + snippet);
  };

  const handleResetCode = () => {
    setCode(PRESETS[selectedPreset].code);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
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

  // Analysis badges
  const hasH1 = code.includes('<h1>') || code.includes('<h1 ');
  const hasP = code.includes('<p>') || code.includes('<p ');
  const hasDiv = code.includes('<div>') || code.includes('<div ');
  const hasSpan = code.includes('<span>') || code.includes('<span ');
  const hasButton = code.includes('<button>') || code.includes('<button ');

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
                5강: 게임 화면의 레고 블록 조립하기 (HTML 대사창과 선택 버튼)
              </span>
            </div>
          </div>

          {/* [오른쪽]: 4단계 스테이지 스위처 버튼 그룹 (오른쪽 정렬) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200" role="tablist" aria-label="5강 4단계 스테이지">
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
              <span>HTML 조립기</span>
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
          2. 조립기
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
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-extrabold uppercase tracking-wider">
                  STAGE 01 · 퀘스트 미션 & 핵심 원리
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  웹 화면의 뼈대를 만드는 레고 블록, HTML의 마법을 배워봅시다!
                </h2>
                <p className="text-base text-slate-600 mt-2 leading-relaxed">
                  시즌 1에서 기획한 흥미진진한 비주얼 노벨 스토리를 이제 실제 컴퓨터 웹 브라우저 화면 위에
                  띄워볼 시간입니다. 웹 브라우저는 텍스트를 그냥 보여주지 않고, <strong>HTML이라는 레고 블록</strong>을
                  하나씩 쌓아서 화면을 완성합니다.
                </p>
              </div>

              {/* 3가지 도전 목표 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
                    <span>1️⃣</span>
                    <h4>웹의 3총사 이해하기</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    웹을 지탱하는 세 기둥(HTML=뼈대, CSS=옷, JS=두뇌)의 역할을 명확히 구분합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
                    <span>2️⃣</span>
                    <h4>레고 태그 5총사 조립</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    제목(&lt;h1&gt;), 대사(&lt;p&gt;), 이름표(&lt;span&gt;), 박스(&lt;div&gt;), 버튼(&lt;button&gt;)을 조립합니다.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
                    <span>3️⃣</span>
                    <h4>AI에게 뼈대 코드 소환</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    내가 쓴 소설을 웹 표준 규격의 완전한 HTML 대사창 코드로 자동 소환합니다.
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
              </div>

              <div className="space-y-4">
                {/* 개념 1: 웹 3총사 */}
                <div className="p-4.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <h4 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                    <span>🏗️</span>
                    <span>1. 웹 브라우저를 지탱하는 3총사 (HTML, CSS, JavaScript)</span>
                  </h4>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    웹 브라우저(크롬, 사파리, 엣지 등)는 웹사이트를 방문할 때 3가지 기술을 동시에 읽어 화면을 만듭니다:
                  </p>
                  <ul className="text-sm text-indigo-900 space-y-1.5 pl-4 list-disc">
                    <li>
                      <strong>HTML (뼈대와 레고 블록):</strong> 사람의 뼈대처럼 화면에 제목, 본문 글, 사진, 버튼 등의 위치와 뼈대를 잡습니다.
                    </li>
                    <li>
                      <strong>CSS (예쁜 옷과 화장):</strong> 뼈대에 색상, 글꼴 크기, 배경 그림, 그림자 효과 등 시각적 아름다움을 입힙니다.
                    </li>
                    <li>
                      <strong>JavaScript (두뇌와 심장):</strong> 버튼을 클릭했을 때 다음 장면으로 넘어가거나 체력이 닳는 동작을 만듭니다.
                    </li>
                  </ul>
                </div>

                {/* 개념 2: 레고 태그 5총사 */}
                <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🧱</span>
                    <span>2. 오늘 바로 써먹는 비주얼 노벨 레고 태그 5총사</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">&lt;h1&gt; 큰 제목&lt;/h1&gt;</span>
                      <p className="text-sm text-slate-600 mt-1">게임의 타이틀이나 현재 장소 이름을 크게 표시할 때 씁니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">&lt;p&gt; 본문 대사&lt;/p&gt;</span>
                      <p className="text-sm text-slate-600 mt-1">캐릭터의 대사나 장면의 상황 설명 글을 담는 문단 상자입니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">&lt;div&gt; 큰 상자(구역)&lt;/div&gt;</span>
                      <p className="text-sm text-slate-600 mt-1">대사창 전체나 선택지 버튼들을 한데 묶어 정리하는 커다란 서랍입니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-indigo-600 text-sm">&lt;span&gt; 작은 이름표&lt;/span&gt;</span>
                      <p className="text-sm text-slate-600 mt-1">대사 앞의 [말하는 캐릭터 이름]처럼 짧은 단어를 감쌀 때 씁니다.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 sm:col-span-2">
                      <span className="font-mono font-bold text-indigo-600 text-sm">&lt;button onclick="..."&gt; 선택지 버튼&lt;/button&gt;</span>
                      <p className="text-sm text-slate-600 mt-1">플레이어가 마우스로 클릭하면 다음 스토리로 이동하거나 팝업을 띄우는 상호작용 버튼입니다.</p>
                    </div>
                  </div>
                </div>

                {/* 개념 3: 주니어 개발자의 황금 원칙 */}
                <div className="p-4.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                  <h4 className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <span>⚡</span>
                    <span>3. 주니어 개발자가 꼭 지켜야 할 HTML 황금 원칙 2가지</span>
                  </h4>
                  <div className="space-y-2 text-sm text-amber-900">
                    <p className="leading-relaxed">
                      <strong>원칙 1: 열었으면 반드시 닫기!</strong><br />
                      레고 상자를 열었으면(&lt;p&gt;), 대사를 넣고 반드시 슬래시(/)가 붙은 닫는 뚜껑(&lt;/p&gt;)으로 닫아야 브라우저가 화면을 엉망으로 뭉개지 않습니다.
                    </p>
                    <p className="leading-relaxed">
                      <strong>원칙 2: id는 주민번호(유일), class는 동아리 단체복(여러 개)!</strong><br />
                      태그에 이름표를 달 때 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">id="main-title"</code>처럼 화면에 딱 하나만 있는 것은 id를 쓰고, 여러 버튼에 공통으로 붙일 때는 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">class="choice-btn"</code>을 사용합니다.
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
                  <span>다음: Stage 2 가상 HTML 조립기 체험</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          </section>
        )}

        {/* ===================================================================
            [STAGE 02] 가상 AI 실습 콘솔 - HTML 대사창 레고 조립기
            =================================================================== */}
        {(stage === 'stage2' || stage === 'all') && (
          <section className="space-y-6">
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Code2 className="w-5 h-5" />
                    <span className="text-sm font-extrabold uppercase tracking-wider">
                      STAGE 02 · 가상 AI 실습 콘솔
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    HTML 대사창 레고 조립기 & 실시간 브라우저 뷰어
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    외부 설치 없이 브라우저 안에서 직접 코드를 수정하고 실시간 게임 화면을 확인해 보세요.
                  </p>
                </div>

                {/* 상단 프리셋 버튼 3가지 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">스토리 프리셋:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('library')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      selectedPreset === 'library'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📚 고대 도서관
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('dragon')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      selectedPreset === 'dragon'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🐉 화염산 보스전
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('shop')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                      selectedPreset === 'shop'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🌙 비밀 상점
                  </button>
                </div>
              </div>

              {/* 태그 삽입 칩스 & 컨트롤러 바 */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-600 mr-1">원클릭 태그 삽입:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('h1')}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-mono text-sm font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    + &lt;h1&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('div')}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-mono text-sm font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    + &lt;div&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('span')}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-mono text-sm font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    + &lt;span&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('p')}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-mono text-sm font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    + &lt;p&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('button')}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-indigo-700 font-mono text-sm font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    + &lt;button&gt;
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>초기화</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? '복사됨! ✨' : '코드 복사'}</span>
                  </button>
                </div>
              </div>

              {/* 2열 워크스페이스: 왼쪽 코드 에디터, 오른쪽 라이브 프리뷰 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 왼쪽: HTML 코드 에디터 */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <span>index.html 코드 편집기</span>
                    </span>
                    <span className="text-sm font-mono text-slate-400">직접 수정해 보세요!</span>
                  </div>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    rows={14}
                    className="w-full p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-sm leading-relaxed border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-inner resize-y"
                    spellCheck={false}
                  />
                </div>

                {/* 오른쪽: 라이브 브라우저 미리보기 */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-cyan-600" />
                      <span>브라우저 렌더링 화면</span>
                    </span>
                    <span className="text-sm font-mono text-slate-400">버튼을 눌러보세요!</span>
                  </div>
                  <div
                    ref={previewRef}
                    className="w-full h-full min-h-[320px] p-5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 text-slate-100 shadow-inner flex flex-col justify-between overflow-auto"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: code }}
                      className="space-y-4 [&>h1]:text-lg sm:[&>h1]:text-xl [&>h1]:font-extrabold [&>h1]:text-amber-300 [&>h1]:border-b [&>h1]:border-slate-700 [&>h1]:pb-2 [&_.dialogue-box]:p-4 [&_.dialogue-box]:bg-slate-800/90 [&_.dialogue-box]:rounded-xl [&_.dialogue-box]:border [&_.dialogue-box]:border-slate-600 [&_.name]:font-bold [&_.name]:text-cyan-300 [&_.name]:text-sm [&_.name]:block [&_.name]:mb-1 [&_.dialogue-box>p]:text-sm [&_.dialogue-box>p]:text-slate-200 [&_.dialogue-box>p]:leading-relaxed [&_.choices]:flex [&_.choices]:flex-col [&_.choices]:gap-2 [&_.choices>button]:w-full [&_.choices>button]:text-left [&_.choices>button]:px-4 [&_.choices>button]:py-2.5 [&_.choices>button]:bg-indigo-600/80 [&_.choices>button]:hover:bg-indigo-500 [&_.choices>button]:text-white [&_.choices>button]:text-sm [&_.choices>button]:font-semibold [&_.choices>button]:rounded-lg [&_.choices>button]:border [&_.choices>button]:border-indigo-400 [&_.choices>button]:transition-all [&_.choices>button]:cursor-pointer [&>button]:px-4 [&>button]:py-2 [&>button]:bg-indigo-600 [&>button]:text-white [&>button]:rounded-lg [&>button]:text-sm [&>button]:font-semibold [&>button]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 코드 분석 리포트 카드 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-sm font-bold text-slate-700 block">
                  🔍 코드 구조 자동 점검 리포트:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasH1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasH1 ? '✓' : '✗'} 제목 태그(&lt;h1&gt;)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasP ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasP ? '✓' : '✗'} 대사 문단(&lt;p&gt;)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasButton ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasButton ? '✓' : '✗'} 선택지 버튼(&lt;button&gt;)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasDiv ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasDiv ? '✓' : '✗'} 대사창 서랍(&lt;div&gt;)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                      hasSpan ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {hasSpan ? '✓' : '✗'} 이름표(&lt;span&gt;)
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
                    외부 AI(ChatGPT / Gemini)에 프롬프트를 복사하여 실제 코드를 소환해 보세요!
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    원클릭 복사 버튼을 누른 후 실제 생성형 AI에 입력해 보고 그 놀라운 결과를 관찰합니다.
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
                  <span>이전: Stage 2 가상 HTML 조립기</span>
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
                  오늘 배운 HTML 기초의 실제 공식 웹 표준 / 컴퓨터 과학 전문 용어를 확인해 보세요.
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

            {/* 자가 점검 체크리스트 카드 (진척도 게이지 연동) */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 id="stage-4-title" className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span id="checklist-counter" className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {checkedItems.length} / 6 완료
                </span>
              </div>

              {/* 실시간 진행률 게이지 바 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  id="checklist-progress-bar"
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 체크리스트 6개 항목 (라벨-인풋 1:1 매핑) */}
              <div className="space-y-2.5">
                {CHECKLIST_ITEMS.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.includes(item.id)}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">{item.id}. {item.text}</span>
                  </label>
                ))}
              </div>
            </article>

            {/* 100% 완주 시 나타나는 축하 & 다음 강 언락 펄스 카드 */}
            {isAllChecked && (
              <article id="completion-card" className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">웹 레고 블록 HTML 대사창 마스터 달성을 축하합니다! 🎉</h4>
                    <p className="text-sm text-slate-300">6가지 점검 항목을 모두 통과하여 웹 화면의 뼈대를 만드는 핵심 레고 태그 5총사와 속성 구조를 완전히 정복했습니다.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 2 · 6강: 화려한 스타일링! CSS로 비주얼 완성하기</p>
                  </div>
                  <a
                    href="/materials/ai/lessons/06-css-showcase/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>6강으로 즉시 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            {/* 단계 이동 버튼 바 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage('stage3')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 3단계 실전 AI 퀘스트</span>
              </button>
            </div>
        </section>
        )}
      </main>
    </div>
  );
};

export default Lesson05;
