import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Rocket,
  HeartHandshake,
  Bot,
  GitBranch,
  Layers,
  Search,
  UserCheck,
  Route,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Target,
  BookOpen,
  Utensils,
  Heart,
  Compass,
  UserPlus,
  GitPullRequest,
  ClipboardCopy,
  Wifi,
  BatteryCharging,
  RefreshCw,
  Send,
  Terminal,
  Copy,
  Check,
  CheckSquare,
  Award,
  Unlock,
  ArrowUp
} from 'lucide-react';

interface QuickChip {
  label: string;
  userMsg: string;
  botReply: string;
}

interface PresetData {
  name: string;
  target: string;
  tone: string;
  greeting: string;
  chips: QuickChip[];
  fallback: string;
}

const PRESETS: Record<string, PresetData> = {
  voca: {
    name: '보카봇',
    target: '중학 영단어가 막막한 중2 학생',
    tone: '칭찬과 격려를 아끼지 않는 친절한 1:1 코치체 ("잘했어! 다음 단어도 도전해 볼까? 🔥")',
    greeting: '안녕! 나는 너의 든든한 영단어 메이트 보카봇이야. 매일 3분만 나랑 놀다 보면 단어 10개가 저절로 외워져! 💡',
    chips: [
      { label: '오늘의 3초 단어 퀴즈', userMsg: '오늘 단어 퀴즈 내줘!', botReply: '좋아! 오늘 첫 번째 단어는 [curious]야! 무슨 뜻일까?\n1) 호기심 많은\n2) 피곤한\n번호를 골라봐! 🎯' },
      { label: '단어 외우는 꿀팁', userMsg: '단어가 잘 안 외워져요 ㅠㅠ', botReply: '깜지 쓰기는 이제 그만! 어원(어근)으로 묶어서 이야기처럼 외우거나 나만의 예문을 만들면 기억이 3배 오래 가! 🧠' },
      { label: '오답 복습장', userMsg: '어제 틀린 단어 보여줘', botReply: '어제 헷갈렸던 단어는 [hesitate: 망설이다]였어! "망설이지 말고 도전해!" 복습 완료! ⭐' }
    ],
    fallback: '음! 나는 영단어 전문 코치 보카봇이라 그 질문엔 답하기 어려워. 대신 신나는 단어 퀴즈를 풀어볼까? 📖'
  },
  lunch: {
    name: '얌얌봇',
    target: '학교 급식 편식과 알레르기 고민이 있는 학생',
    tone: '편안하게 반말과 이모지로 공감해 주는 단짝 친구체 ("안녕! 오늘 힘든 일 있었어? 다 털어놔 봐 🧸")',
    greeting: '안녕 친구야! 오늘 급식 뭐 나오는지, 어떤 영양소가 가득한지 다 알려주는 얌얌봇이야! 🍱',
    chips: [
      { label: '오늘 우리 학교 급식', userMsg: '오늘 급식 메뉴 알려줘!', botReply: '오늘 점심은 [차수수밥, 돈육김치찌개, 치즈닭갈비, 시금치나물, 깍두기]야! 단백질이 듬뿍 들어있어! 🍗' },
      { label: '알레르기 체크', userMsg: '우유 알레르기 성분 있어?', botReply: '치즈닭갈비에 유제품(알레르기 2번 우유)이 포함되어 있어! 조심해서 먹어야 해 🥛❌' },
      { label: '가장 맛있는 메뉴 투표', userMsg: '오늘의 1등 메뉴는?', botReply: '오늘 친구들이 뽑은 1등 메뉴는 압도적으로 치즈닭갈비야! 맛점해! 🎉' }
    ],
    fallback: '배고픈 건 알겠지만, 나는 학교 급식과 영양 전문 봇이야! 오늘 점심 메뉴 물어봐 줄래? 🥕'
  },
  counsel: {
    name: '마음톡',
    target: '친구 관계나 학업 스트레스를 털어놓고 싶은 청소년',
    tone: '편안하게 반말과 이모지로 공감해 주는 단짝 친구체 ("안녕! 오늘 힘든 일 있었어? 다 털어놔 봐 🧸")',
    greeting: '안녕. 오늘도 참 수고 많았어. 누구에게도 털어놓지 못한 마음속 이야기, 나한테 편하게 들려줄래? 🧸',
    chips: [
      { label: '시험 스트레스 고민', userMsg: '시험 때문에 너무 불안해...', botReply: '결과가 걱정되는 건 네가 그만큼 열심히 하고 싶기 때문이야. 숨을 깊게 들이쉬어 봐. 넌 생각보다 훨씬 강해! 🌿' },
      { label: '친구랑 사소하게 다퉜어', userMsg: '친구한테 사과하고 싶은데 어쩌지?', botReply: '"어제 내 말이 상처가 됐다면 미안해"라고 짧게 진심을 전해봐. 먼저 손 내미는 용기가 가장 멋져! 💌' },
      { label: '기분 좋아지는 마법 명언', userMsg: '힘나는 한 줄 들려줘!', botReply: '"바람이 불지 않으면 노를 저어라." 오늘 하루도 너의 페이스대로 멋지게 가면 돼! ✨' }
    ],
    fallback: '네 말을 조용히 듣고 있어. 더 자세히 이야기해 줄 수 있니? 언제나 네 편이야. 🤍'
  },
  rpg: {
    name: '아스트랄',
    target: '심심한 쉬는 시간에 상상력을 펼치고 싶은 모험가',
    tone: '수수께끼와 상상력을 자극하는 판타지 마법사체 ("그대여, 지혜의 두루마리를 펼칠 준비가 되었는가? 🔮")',
    greeting: '환영하오, 방랑자여! 나는 고대 유적의 길잡이 아스트랄이오. 그대의 선택에 따라 역사가 바뀌리라! 🔮',
    chips: [
      { label: '빛나는 동굴 탐험', userMsg: '동굴 속으로 들어간다', botReply: '어두운 동굴 안쪽에서 파란 보석 상자와 낡은 검이 보입니다. 어느 것을 조사하시겠습니까? ⚔️' },
      { label: '비밀 주문 외우기', userMsg: '루모스 주문을 외친다!', botReply: '지팡이 끝에서 환한 빛이 뿜어져 나오며 벽면에 숨겨진 고대 암호가 드러납니다! [7-3-1] 🗝️' },
      { label: '마을 주막으로 후퇴', userMsg: '일단 마을로 돌아가자', botReply: '따뜻한 모닥불이 타오르는 주막에 도착했습니다. 모험 점수가 +10점 회복되었습니다! 🍺' }
    ],
    fallback: '안개 속에서 그대의 목소리가 흩어졌소. 다시 명확한 행동(동굴 탐험, 주문 외우기 등)을 선택하시오! 📜'
  }
};

const QUESTS = [
  {
    id: 'quest-01',
    badge: 'QUEST 01',
    level: '디자인 씽킹 ★☆☆',
    title: '잠재 사용자의 숨은 고통(Pain Point)을 캐내는 5문항 인터뷰 질문지 생성',
    desc: '사용자에게 단순히 "이 앱 쓸 거야?"라고 물으면 100% 거짓말을 합니다. 사용자가 과거에 실제로 겪은 행동과 불편한 순간을 구체적으로 캐내는 인터뷰 질문을 요청합니다.',
    prompt: `[역할]
너는 디자인 씽킹(Design Thinking)과 사용자 경험(UX) 연구를 전문으로 하는 시니어 프로덕트 매니저(PM)야.

[상황]
우리는 [해결할 문제: 예 - 중학생 영단어 암기의 막막함]을 해결하는 스마트 챗봇을 기획하고 있어.

[요청 사항]
1. 잠재 사용자(중학생 2명)를 인터뷰할 때 사용할 5가지 심층 질문을 작성해 줘.
2. "이 챗봇 좋나요?" 같은 유도 질문을 배제하고, "최근 일주일 동안 단어를 외우다 가장 화가 났던 순간은 언제였나요?"처럼 과거의 실제 행동과 감정을 묻는 방식으로 구성해 줘.
3. 각 질문마다 이 질문을 통해 기획자가 알아내야 하는 핵심 인사이트를 1줄씩 덧붙여 줘.`,
    magic: '엄마 테스트(The Mom Test) 원칙이 적용되어, 빈말 칭찬이 아닌 진짜 사용자의 숨은 결핍을 발굴하는 날카로운 질문지를 도출합니다.',
    csSecret: '좋은 소프트웨어 사양(Spec)은 개발자의 머리가 아니라 사용자의 행동 로그와 인터뷰 데이터에서 시작됩니다.'
  },
  {
    id: 'quest-02',
    badge: 'QUEST 02',
    level: '프롬프트 엔지니어링 ★★☆',
    title: '챗봇의 이름, 성격, 말투, 절대 해선 안 되는 말(안전 가드레일) 시스템 명세 작성',
    desc: '챗봇에게 영혼을 불어넣는 시스템 프롬프트(System Prompt)를 설계합니다. 답변의 길이 제한, 이모지 사용 빈도, 금기어 방어선을 철저히 구축합니다.',
    prompt: `[역할]
너는 대화형 AI 프롬프트 엔지니어이자 캐릭터 세계관 디자이너야.

[목표]
[챗봇 이름: 보카봇]의 시스템 프롬프트(System Prompt) 규격서를 작성해 줘.

[세부 규칙]
1. 정체성(Identity): 이름, 나이대, 챗봇의 핵심 임무를 2줄로 정의해 줘.
2. 톤앤매너(Tone): 친구처럼 다정하지만 학습 목표를 놓치지 않는 말투 규칙(문장 끝맺음, 이모지 규칙).
3. 제약 조건(Constraints): 한 번에 3줄을 넘지 않는 간결한 대답, 전문 용어 자제.
4. 안전 가드레일(Guardrails): 학생이 비속어나 폭력적인 말을 할 때 차분히 주의를 주고 본래 학습 주제로 되돌리는 규칙.
5. 초보자도 바로 복사해 쓸 수 있도록 깔끔한 마크다운 양식으로 출력해 줘.`,
    magic: '챗봇이 정체성을 잃고 횡설수설하지 않도록 붙잡아 주는 일관된 성격 헌법(Constitution)을 생성합니다.',
    csSecret: 'System Prompt는 LLM의 가중치 컨텍스트 최상단에 상주하며 모든 응답의 필터 역할을 수행하는 제로 레벨 지침입니다.'
  },
  {
    id: 'quest-03',
    badge: 'QUEST 03',
    level: '시스템 아키텍처 ★★☆',
    title: '사용자 진입부터 해결 완료까지의 대화 분기 트리(Mermaid Flowchart) 시각화',
    desc: '텍스트로만 쓰인 시나리오는 놓치는 갈림길이 생기기 쉽습니다. 코딩 전에 머메이드(Mermaid.js) 다이어그램으로 시각적 플로우차트를 소환합니다.',
    prompt: `[역할]
너는 대화형 UX와 시스템 플로우차트를 전문으로 설계하는 시스템 아키텍트야.

[목표]
[프로젝트: 영단어 암기 챗봇]의 사용자 대화 여정을 시각화하는 Mermaid flowchart TD 코드를 작성해 줘.

[흐름 요건]
1. [시작] 환영 인사 및 3대 선택지 칩(오늘의 퀴즈, 단어 검색, 오답 복습) 제시.
2. [분기 A: 퀴즈] 단어 퀴즈 출제 -> 정답/오답 판정 -> 칭찬 또는 힌트 제공.
3. [분기 B: 단어 검색] 사용자가 단어 입력 -> 뜻과 예문, 어원 꿀팁 출력.
4. [예외 처리: Fallback] 학습 외 엉뚱한 입력 -> "단어와 관련된 질문을 부탁해!" 안내 후 메뉴로 복귀.
5. Markdown 펜스 블록(\`\`\`mermaid)으로 코드를 출력해 줘.`,
    magic: '복잡한 if/else 분기를 개발자와 기획자가 한눈에 이해할 수 있는 아름다운 유한 상태 기계(FSM) 다이어그램으로 변환합니다.',
    csSecret: '상태 머신(Finite State Machine)은 현재 상태(State)와 입력(Event)에 따라 다음 상태로 전이하는 대화 엔진의 핵심 수학적 모델입니다.'
  },
  {
    id: 'quest-04',
    badge: 'QUEST 04',
    level: '예외 회복력 ★★★',
    title: '"너 바보야?" 같은 짓궂은 질문과 모르는 말에 센스 있게 대처하는 3단계 폴백 방어문',
    desc: '사용자가 챗봇을 시험하려 들 때 "죄송합니다, 무슨 말인지 모르겠어요"만 반복하면 사용자 경험은 바닥으로 떨어집니다. 재치 있게 웃어넘기고 다시 본론으로 데려오는 방어 화술을 완성합니다.',
    prompt: `[역할]
너는 대화형 UX 결함 내성(Fault Tolerance)과 위기 대처 시나리오를 설계하는 대화 시나리오 작가야.

[상황]
사용자가 [영단어 챗봇: 보카봇]에게 엉뚱한 질문을 던졌어. "죄송합니다"라는 기계적 사과 대신, 챗봇의 성격을 살려 센스 있게 대처하는 폴백(Fallback) 답변 3세트를 만들어 줘.

[시나리오 3종]
1. 짓궂은 도발("너 바보야?", "너 AI 맞냐?"): 유쾌하게 맞받아치면서 퀴즈로 승부를 유도하는 멘트.
2. 챗봇의 범위를 벗어난 질문("내일 비 와?", "주식 추천해줘"): 자신이 영단어 전문임을 알리고 본업으로 유도하는 멘트.
3. 아무 의미 없는 외계어("ㅋㅋㅋㅋㅋ", "asdfasdf"): 웃으며 추천 질문 칩 3개를 다시 띄워주는 멘트.`,
    magic: '챗봇이 모욕당하거나 당황하는 대신, 사용자에게 뜻밖의 재미와 호감을 안겨주는 고품격 에러 핸들링 대사를 완성합니다.',
    csSecret: '폴백(Fallback)은 시스템이 예기치 못한 입력을 만났을 때 크래시를 내지 않고 안전한 기본 상태로 복원하는 점진적 성능 저하(Graceful Degradation) 원칙입니다.'
  },
  {
    id: 'quest-05',
    badge: 'QUEST 05',
    level: '프로덕트 매니지먼트 ★★★',
    title: '문제-고객-해결책-고유 가치-핵심 지표를 한눈에 정리하는 린 캔버스 PRD 소환',
    desc: '해커톤 심사위원과 개발 팀원들이 1분 만에 프로젝트의 핵심 가치를 납득할 수 있도록, 실리콘밸리 표준 린 캔버스(Lean Canvas) 1페이지 기획서를 완성합니다.',
    prompt: `[역할]
너는 실리콘밸리 스타트업 액셀러레이터이자 주니어 해커톤 심사위원이야.

[상황]
우리가 기획한 [챗봇 아이디어: 보카봇 - 중학생 맞춤 영단어 퀴즈 챗봇]의 1페이지 린 캔버스(Lean Canvas) 기획서를 작성하려고 해.

[출력 양식: 마크다운 표]
1. 문제(Problem): 대상 고객이 겪는 치명적인 불편 3가지.
2. 고객군(Customer Segments): 이 챗봇이 가장 절실한 타깃 페르소나.
3. 고유 가치 제안(UVP): 다른 앱과 구별되는 단 한 줄의 강력한 매력 문구.
4. 해결책(Solution): 챗봇이 제공하는 3대 핵심 기능.
5. 성공 지표(Key Metrics): 이 프로젝트가 성공했는지 측정할 수 있는 수치(예: 퀴즈 완료율 80% 등).
6. 불공정 우위(Unfair Advantage): 우리 팀만이 만들 수 있는 차별점.`,
    magic: '수십 쪽짜리 무거운 기획서 대신, 해커톤 팀원 전체가 같은 목표를 바라보게 만드는 날렵한 나침반 기획서를 소환합니다.',
    csSecret: '애자일(Agile) 개발 문화의 핵심은 \'문서 작성보다 작동하는 소프트웨어\'이며, 린 캔버스는 최소 기능 제품(MVP)의 스코프를 확정하는 도구입니다.'
  }
];

export const Lesson19: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all'>('stage1');
  const [currentPresetKey, setCurrentPresetKey] = useState<string>('voca');
  const [botName, setBotName] = useState<string>(PRESETS.voca.name);
  const [botTarget, setBotTarget] = useState<string>(PRESETS.voca.target);
  const [botTone, setBotTone] = useState<string>(PRESETS.voca.tone);
  const [botGreeting, setBotGreeting] = useState<string>(PRESETS.voca.greeting);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: PRESETS.voca.greeting }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedCanvas, setCopiedCanvas] = useState<boolean>(false);

  // 체크리스트 상태 관리 (8강 표준)
  const CHECKLIST_KEY = 'ai_lesson_19_checklist';
  const COMPLETION_KEY = 'ai_lesson_19_completed';
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'check-1': false,
    'check-2': false,
    'check-3': false,
    'check-4': false,
    'check-5': false,
    'check-6': false
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Checklist load error:', e);
    }
  }, []);

  const handleCheckChange = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));

    const checkedCount = Object.values(updated).filter(Boolean).length;
    if (checkedCount === 6) {
      localStorage.setItem(COMPLETION_KEY, 'true');
    }
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);

  // 프리셋 적용
  const handleApplyPreset = (key: string) => {
    setCurrentPresetKey(key);
    const p = PRESETS[key];
    if (!p) return;
    setBotName(p.name);
    setBotTarget(p.target);
    setBotTone(p.tone);
    setBotGreeting(p.greeting);
    setChatHistory([{ sender: 'bot', text: p.greeting }]);
  };

  // 퀵 칩 전송
  const handleTriggerQuickChip = (chip: QuickChip) => {
    setChatHistory(prev => [...prev, { sender: 'user', text: chip.userMsg }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'bot', text: chip.botReply }]);
    }, 400);
  };

  // 일반 채팅 전송
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      const p = PRESETS[currentPresetKey] || PRESETS.voca;
      const matched = p.chips.find(c => userText.includes(c.label.slice(0, 3)) || c.userMsg.includes(userText));
      let reply = '';
      if (matched) {
        reply = matched.botReply;
      } else if (userText.includes('안녕') || userText.includes('반가워')) {
        reply = '반가워! 오늘 어떤 도움이 필요하니? 아래 추천 질문 칩을 골라봐! 😊';
      } else {
        reply = p.fallback;
      }
      setChatHistory(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  // 린 캔버스 복사
  const handleCopyLeanCanvas = () => {
    const p = PRESETS[currentPresetKey] || PRESETS.voca;
    const markdown = `# [1페이지 AI 챗봇 린 캔버스 기획서]

- 챗봇 이름: ${botName}
- 대상 사용자(페르소나): ${botTarget}
- 톤앤매너(말투): ${botTone}

## 1. 해결하려는 진짜 문제(Pain Point)
- 사용자가 일상에서 겪는 막막함과 불편함을 해소

## 2. 챗봇의 핵심 가치 제안(UVP)
- "${botGreeting}"

## 3. 3대 대화 시나리오 트리
${p.chips.map((c, i) => `${i + 1}. [${c.label}]: 사용자("${c.userMsg}") -> 챗봇("${c.botReply}")`).join('\n')}

## 4. 예외 방어(Fallback)
- "${p.fallback}"

---
작성일: ${new Date().toLocaleDateString('ko-KR')} | AI·코딩 24강 19강 주니어 AI 발명가`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedCanvas(true);
      setTimeout(() => setCopiedCanvas(false), 1800);
    });
  };

  // 프롬프트 복사
  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 1800);
    });
  };

  const currentPreset = PRESETS[currentPresetKey] || PRESETS.voca;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준) */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/index.html" className="flex items-center gap-2 text-slate-900 hover:text-violet-600 transition-colors font-bold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">AI·코딩 24강</span>
          </a>
          <span className="text-slate-300">/</span>
          <h1 className="text-xs sm:text-sm font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-md">
            시즌 4 · 19강: 주니어 AI 발명가: 주변의 불편을 해결하는 챗봇 기획
          </h1>
        </div>

        {/* 4단계 스위처 (20px 원형 배지 표준) */}
        <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="학습 단계 선택">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeStage === 'stage1'
                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              activeStage === 'stage1' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>1</span>
            <span className="hidden md:inline">미션 &amp; 원리</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeStage === 'stage2'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 font-bold'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              activeStage === 'stage2' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>2</span>
            <span className="hidden md:inline">기획 캔버스</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeStage === 'stage3'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 font-bold'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              activeStage === 'stage3' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>3</span>
            <span className="hidden md:inline">실전 AI 퀘스트</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeStage === 'stage4'
                ? 'bg-violet-50 text-violet-700 border border-violet-200 font-bold'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              activeStage === 'stage4' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>4</span>
            <span className="hidden md:inline">용어&amp;체크리스트</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5 sm:mx-1 hidden sm:block"></div>

          <button
            type="button"
            onClick={() => setActiveStage('all')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeStage === 'all'
                ? 'bg-violet-600 text-white font-bold shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            전체 보기
          </button>
        </nav>
      </header>

      {/* 2. 단일 컨테이너 몰입형 워크스페이스 */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">
        {/* STAGE 1 */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section id="stage1" className="space-y-8">
            <article className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-violet-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30 flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-violet-400" />
                    <span>시즌 4 그랜드 오프닝 · 주니어 AI 해커톤 트랙</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    아이디어 기획 &amp; 디자인 씽킹
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    주니어 AI 발명가:<br className="hidden sm:inline" />
                    주변의 불편을 해결하는 스마트 챗봇 기획
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    진짜 뛰어난 소프트웨어 창작자는 코드를 먼저 치지 않고, 사람이 겪는 진짜 불편함부터 찾아냅니다. 친구와 가족의 고민을 관찰하고, 챗봇의 성격(페르소나)과 대화 지도를 설계하여 나만의 1페이지 AI 기획서를 완성합니다.
                  </p>
                </div>

                {/* 3대 도전 미션 목표 (표준 3열 카드, 3열 카드) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                      <HeartHandshake className="w-4 h-4" />
                      <span>1. 공감과 문제 정의</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      디자인 씽킹 5단계로 친구의 진짜 불편함(Pain Point)을 포착하고 해결할 단 하나의 핵심 목표를 정의합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <Bot className="w-4 h-4" />
                      <span>2. 챗봇 페르소나 설정</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      차가운 기계가 아닌 친절한 코치나 따뜻한 친구처럼, 챗봇의 성격·말투·첫인상과 금기어 안전모를 규정합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <GitBranch className="w-4 h-4" />
                      <span>3. 3단계 대화 지도 &amp; 린 캔버스</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      환영 인사부터 추천 해결책, 엉뚱한 말 방어(Fallback)까지 대화 흐름을 그리고 1페이지 기획서로 압축합니다.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 3구 벤토 그리드 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  사람을 감동시키는 소프트웨어를 만드는 3대 기획 원리
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-violet-600">원리 01</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">1. 디자인 씽킹</h4>
                    <span className="text-sm font-mono text-slate-400 block">Design Thinking Framework</span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      책상에 앉아 혼자 상상하지 않고, 실제 사용자가 어디서 답답함을 느끼는지 관찰하고 공감하는 5단계 발명 방법론입니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      <span>어린이 눈높이 비유</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "친구의 꽉 끼는 신발을 직접 신어보고, 어느 발가락이 아픈지 함께 느껴보는 공감 돋보기"
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">원리 02</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">2. 페르소나 &amp; 톤앤매너</h4>
                    <span className="text-sm font-mono text-slate-400 block">Persona &amp; Tone of Voice</span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      누가 쓸지(초등학생, 직장인, 할머니) 가상의 구체적 인물을 세우고, 챗봇의 말투와 성격을 맞춤 옷처럼 디자인합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>어린이 눈높이 비유</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "무뚝뚝한 로봇에게 친절한 선생님 분장이나 신나는 동아리 선배 가면을 씌워주는 캐릭터 분장실"
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        <Route className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">원리 03</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">3. 대화 트리 &amp; 폴백</h4>
                    <span className="text-sm font-mono text-slate-400 block">Decision Tree &amp; Fallback</span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      인사부터 해결책까지 길을 잃지 않는 분기 지도와, 예상치 못한 엉뚱한 질문을 받았을 때 센스 있게 되돌아오는 안전망입니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>어린이 눈높이 비유</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "갈림길마다 표지판을 세우고 막다른 길을 만나도 웃으며 다시 본선으로 안내하는 친절한 내비게이션"
                    </p>
                  </div>
                </div>
              </div>

              {/* 주니어 개발자 제1원칙 */}
              <div className="p-4 rounded-2xl bg-violet-50/80 border border-violet-200/80 flex items-start gap-3.5 text-violet-950">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-sm leading-relaxed">
                  <strong className="font-bold text-violet-950 block">💡 주니어 개발자 제1원칙: "내가 만들고 싶은 기술보다, 사용자가 겪는 진짜 불편함이 언제나 먼저다!"</strong>
                  <p className="text-violet-900/90 text-sm">
                    인공지능, 화려한 버튼, 복잡한 코드는 수단일 뿐입니다. 진짜 훌륭한 해커톤 결과물은 "우리 엄마가 매일 겪는 장보기 고민", "내 짝꿍이 단어 외울 때마다 겪는 막막함" 같은 작지만 절실한 문제를 해결하는 데서 출발합니다.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>다음: Stage 2 챗봇 기획 캔버스 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STAGE 2 */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section id="stage2" className="space-y-8">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-xs">2</span>
                <span>가상 인터랙티브 실습 콘솔</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                나만의 AI 챗봇 기획 캔버스 &amp; 가상 대화 시뮬레이터
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                4대 문제 해결 프리셋을 고르거나 직접 입력하여, 챗봇의 페르소나와 3단계 대화 시나리오를 설계하고 가상 스마트폰 화면에서 대화를 시뮬레이션해 보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 좌측 컨트롤러 (7열) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. 프리셋 선택 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-600" />
                    <span>1. 해결하고 싶은 문제 영역 (아이디어 프리셋)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('voca')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2 ${
                        currentPresetKey === 'voca'
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm">영단어 멘토 보카봇</div>
                        <div className="text-xs text-slate-500 font-normal truncate">단어 암기 &amp; 3초 퀴즈</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('lunch')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2 ${
                        currentPresetKey === 'lunch'
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <Utensils className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm">급식 코치 얌얌봇</div>
                        <div className="text-xs text-slate-500 font-normal truncate">메뉴 영양 &amp; 알레르기</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('counsel')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2 ${
                        currentPresetKey === 'counsel'
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm">비밀 상담소 마음톡</div>
                        <div className="text-xs text-slate-500 font-normal truncate">친구 고민 &amp; 위로 명언</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('rpg')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2 ${
                        currentPresetKey === 'rpg'
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm">모험 가이드 아스트랄</div>
                        <div className="text-xs text-slate-500 font-normal truncate">인터랙티브 텍스트 RPG</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. 페르소나 설정 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>2. 챗봇 페르소나 및 톤앤매너 상세 설정</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 block">챗봇 이름</label>
                      <input
                        type="text"
                        value={botName}
                        onChange={e => setBotName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 block">대상 사용자 (타깃)</label>
                      <input
                        type="text"
                        value={botTarget}
                        onChange={e => setBotTarget(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">말투 및 톤앤매너</label>
                    <input
                      type="text"
                      value={botTone}
                      onChange={e => setBotTone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">첫 환영 인사말</label>
                    <textarea
                      rows={2}
                      value={botGreeting}
                      onChange={e => setBotGreeting(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm leading-relaxed"
                    />
                  </div>
                </div>

                {/* 3. 추천 질문 칩 & 린 캔버스 복사 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <GitPullRequest className="w-4 h-4 text-emerald-600" />
                      <span>3. 추천 질문 칩 (시나리오 트리 버튼)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyLeanCanvas}
                      className="px-3 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <ClipboardCopy className="w-3.5 h-3.5" />
                      <span>{copiedCanvas ? '✓ 복사 완료!' : '린 캔버스 기획서 복사'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentPreset.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTriggerQuickChip(chip)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-left text-xs font-semibold text-slate-700 transition-all truncate"
                      >
                        💬 {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 우측 스마트폰 뷰포트 (5열) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[340px] rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 relative">
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full flex items-center justify-center gap-2 z-20">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                  </div>

                  <div className="bg-slate-50 rounded-[28px] overflow-hidden flex flex-col h-[520px] relative border border-slate-700/50">
                    <div className="h-9 bg-violet-600 text-white px-4 flex items-center justify-between text-xs font-bold pt-1 z-10 shrink-0">
                      <span className="font-mono">09:41 AM</span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span>5G</span>
                        <Wifi className="w-3 h-3" />
                        <BatteryCharging className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="bg-violet-600 text-white px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-white leading-tight">{botName}</h5>
                          <span className="text-xs text-violet-200 block">온라인 · 응답 준비 완료</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChatHistory([{ sender: 'bot', text: botGreeting }])}
                        title="대화 초기화"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-violet-100 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-sm">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                          {msg.sender === 'bot' && (
                            <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                            msg.sender === 'bot'
                              ? 'rounded-tl-sm bg-white border border-slate-200 text-slate-800'
                              : 'rounded-tr-sm bg-violet-600 text-white'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5 shrink-0">
                      {currentPreset.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTriggerQuickChip(chip)}
                          className="px-2.5 py-1 rounded-full bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-bold transition-all shrink-0 shadow-2xs"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="챗봇에게 말을 걸어보세요..."
                        className="flex-1 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-300 text-xs sm:text-sm outline-none"
                      />
                      <button
                        type="submit"
                        className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
                <span className="text-xs text-slate-400 mt-2">💡 추천 질문 칩을 누르거나 직접 질문을 입력해 보세요</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 1 미션 &amp; 원리</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>다음: Stage 3 실전 AI 5대 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STAGE 3 */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section id="stage3" className="space-y-8">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-xs">3</span>
                <span>실전 최신 AI 5대 킬러 퀘스트</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                ChatGPT &amp; Gemini 실전 프롬프트 배틀
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                아래의 원클릭 프롬프트를 복사하여 실제 AI 챗봇에 입력해 보세요. 인터뷰 질문지, 페르소나 시스템 프롬프트, 플로우차트, 폴백 방어문, 린 캔버스를 즉시 소환합니다!
              </p>
            </div>

            <div className="space-y-6">
              {QUESTS.map(quest => (
                <article key={quest.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-800 font-bold text-xs">{quest.badge}</span>
                      <span className="text-sm font-bold text-slate-900">{quest.title}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{quest.level}</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">{quest.desc}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-violet-600">
                        <Terminal className="w-4 h-4" />
                        <span>실전 AI 복사 프롬프트</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(quest.id, quest.prompt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        {copiedPromptId === quest.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">복사됨! ✨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>프롬프트 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                      {quest.prompt}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-100 text-sm space-y-1.5">
                    <div className="font-bold text-violet-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>AI 소환 마법 &amp; 💡 컴퓨터 과학 비밀 해설</span>
                    </div>
                    <p className="text-violet-950 text-sm leading-relaxed">
                      <strong>마법 효과:</strong> {quest.magic}<br />
                      <strong>CS 비밀:</strong> {quest.csSecret}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 2 기획 캔버스</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>다음: Stage 4 전문 용어 &amp; 체크리스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STAGE 4 */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section id="stage4" className="space-y-8">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-violet-600 font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-xs">4</span>
                <span>전문 용어 &amp; 자가 점검</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                주니어 개발자 전문 용어 돋보기 &amp; 자가 점검 체크리스트
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                오늘 배운 챗봇 기획과 디자인 씽킹의 컴퓨터 과학 핵심 용어를 복습하고, 6가지 자가 점검 체크리스트를 100% 달성하여 20강을 언락해 보세요!
              </p>
            </div>

            {/* 전문 용어 돋보기 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-600" />
                <h4 className="text-base font-bold text-slate-900">🔍 주니어 개발자를 위한 전문 용어 돋보기</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-2.5">
                  <div>
                    <h5 className="text-base font-bold text-violet-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>디자인 씽킹</span>
                    </h5>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Design Thinking</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>🧸 어린이 비유:</strong> 친구가 불편해하는 모습을 탐정처럼 몰래 관찰하고, 친구 입장이 되어 문제를 해결해 주는 배려 마법.<br />
                    <strong>🎓 개발자 공식 정의:</strong> 공감(Empathize), 문제 정의(Define), 아이디어 도출(Ideate), 시제품 제작(Prototype), 테스트(Test)의 5단계로 사용자의 진정한 결핍을 풀어내는 인간 중심 문제 해결 방법론입니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-2.5">
                  <div>
                    <h5 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>타깃 페르소나</span>
                    </h5>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Target User Persona</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>🧸 어린이 비유:</strong> 가상의 대표 친구 한 명에게 이름, 성격, 좋아하는 음식, 제일 싫어하는 숙제를 정해주는 인형 놀이.<br />
                    <strong>🎓 개발자 공식 정의:</strong> 실제 서비스 이용자 집단의 대표적 행동 양식, 고통, 동기를 한 명의 구체적인 가상 인물 프로필로 표준화하여 팀원 전체의 개발 나침반으로 삼는 모델입니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-2.5">
                  <div>
                    <h5 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>시스템 프롬프트 &amp; 가드레일</span>
                    </h5>
                    <span className="text-sm font-mono text-slate-400 block pl-6">System Prompt &amp; Safety Guardrail</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>🧸 어린이 비유:</strong> 연극 무대에 오르는 배우에게 "너는 친절한 마법사야. 절대 나쁜 말은 하면 안 돼!"라고 적어준 비밀 쪽지.<br />
                    <strong>🎓 개발자 공식 정의:</strong> 대화형 AI 모델에게 역할, 말투, 금기어, 응답 길이를 강제하는 최상위 지침(System Instructions)과 비윤리적 발언을 원천 차단하는 안전 방어벽입니다.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-2.5">
                  <div>
                    <h5 className="text-base font-bold text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>대화 분기 트리</span>
                    </h5>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Decision Tree &amp; State Machine</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>🧸 어린이 비유:</strong> "오른쪽 길로 가면 보물 상자, 왼쪽 길로 가면 괴물"처럼 선택에 따라 갈라지는 갈림길 모험 지도.<br />
                    <strong>🎓 개발자 공식 정의:</strong> 사용자의 응답 조건(A/B)에 따라 다음 상태(State)로 이동하는 로직을 나뭇가지(Tree) 구조로 설계하여 챗봇이 논리적으로 대화를 이끌도록 만드는 제어 구조입니다.
                  </p>
                </div>

                <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-2.5">
                  <div>
                    <h5 className="text-base font-bold text-rose-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>폴백 핸들링 &amp; 린 캔버스</span>
                    </h5>
                    <span className="text-sm font-mono text-slate-400 block pl-6">Fallback Handling &amp; Lean Canvas</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>🧸 어린이 비유:</strong> 달리기를 하다 넘어져도 당황하지 않고 툭툭 털며 웃는 보호대와, 준비물을 한 장에 쏙 적어둔 알림장.<br />
                    <strong>🎓 개발자 공식 정의:</strong> 폴백(Fallback)은 챗봇이 이해할 수 없는 입력이 들어왔을 때 재치 있게 본래 대화로 유도하는 안전망이며, 린 캔버스(Lean Canvas)는 문제·솔루션·가치 제안을 1페이지 표로 압축한 애자일 프로젝트 명세서입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 체크리스트 6문항 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">오늘의 19강 마스터 자가 점검 체크리스트</h4>
                    <p className="text-sm text-slate-500">6개 항목을 모두 체크하면 시즌 4 20강이 즉시 언락됩니다!</p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm shrink-0 self-start sm:self-auto">
                  {checkedCount} / 6 완료
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>체크리스트 달성률</span>
                  <span className="text-emerald-600 font-mono font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-violet-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: 'check-1', title: '디자인 씽킹 5단계와 \'공감\'의 의미 체득', desc: '개발자 혼자 상상하지 않고, 실제 사용자가 겪는 진짜 불편함(Pain Point)을 인터뷰와 관찰로 파악하는 원리를 이해했습니다.' },
                  { id: 'check-2', title: '챗봇 타깃 페르소나 및 톤앤매너 확정', desc: '챗봇의 대상 사용자(예: 중학생 영포자)와 말투(다정한 코치체, 친구체 등), 첫 환영 인사말을 구체적으로 설정했습니다.' },
                  { id: 'check-3', title: '3단계 대화 분기 트리(Flowchart) 시나리오 설계', desc: '환영 인사부터 추천 질문 칩, 핵심 솔루션 도출, 엉뚱한 입력 예외 방어까지의 대화 상태 머신을 완성했습니다.' },
                  { id: 'check-4', title: '센스 있는 폴백(Fallback) 방어 및 안전 가드레일 수립', desc: '모르는 질문이나 짓궂은 도발이 들어왔을 때 크래시 없이 센스 있게 대답하고 본론으로 유도하는 화술을 마련했습니다.' },
                  { id: 'check-5', title: '가상 모바일 뷰포트에서 대화 시뮬레이션 및 피드백 점검', desc: '기획한 챗봇의 첫인상과 빠른 질문 칩 상호작용을 실제 스마트폰 화면에서 직접 체험해 보고 대화감을 확인했습니다.' },
                  { id: 'check-6', title: '1페이지 린 캔버스(Lean Canvas) 기획서 도출', desc: '문제, 고객군, 고유 가치 제안, 핵심 지표를 한 장으로 압축해 20강 로컬 AI 엔진 구현을 위한 청사진을 확보했습니다.' }
                ].map(item => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => handleCheckChange(item.id)}
                      className="w-5 h-5 rounded-lg text-violet-600 focus:ring-violet-500 border-slate-300 mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-1">
                      <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {checkedCount === 6 && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 text-white border border-violet-500/40 shadow-xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-400/30 flex items-center justify-center font-bold text-xl shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-white">🎉 19강 미션 완주! AI 챗봇 기획자 마스터 등극!</h5>
                      <p className="text-sm text-violet-200">
                        주변의 문제를 꿰뚫어 보는 디자인 씽킹과 나만의 챗봇 기획서를 완벽하게 완성하셨습니다.
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    이제 종이 위의 기획서를 진짜 똑똑한 소프트웨어로 만들 차례입니다! 다음 20강에서는 외부 API 키 없이 순수 자바스크립트로 키워드를 분석하고 대화 문맥을 추론하는 <strong>인-브라우저 로컬 AI 대화 엔진</strong>을 직접 구축합니다.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      <span>시즌 4 · 20강 언락 완료!</span>
                    </div>
                    <a
                      href="/lessons/20-chatbot-brain/index.html"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>20강 로컬 AI 엔진 만들기 이동하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 3 실전 AI 퀘스트</span>
              </button>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowUp className="w-4 h-4" />
                <span>맨 위로</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* 3. 바닥글 푸터 */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <span>AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span>시즌 4 그랜드 오프닝 · 19강 챗봇 아이디어 기획</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <a href="/index.html" className="hover:text-violet-600 transition-colors">과정 홈</a>
            <a href="/lessons/18-smart-tool-showcase/index.html" className="hover:text-violet-600 transition-colors">18강 바로가기</a>
            <a href="/lessons/20-chatbot-brain/index.html" className="hover:text-violet-600 transition-colors">20강 바로가기</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Lesson19;
