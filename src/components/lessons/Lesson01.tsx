import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Trophy,
  Medal,
  FileCheck,
  PartyPopper,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Search,
  Target,
  Terminal,
  PlayCircle,
  Bug,
  Lock,
  Unlock,
  Eye,
  Info,
  Clock,
  MessageSquare,
  QrCode,
  Share2,
  Flame,
  Radio,
  Sliders,
  CheckSquare,
  Zap,
  ExternalLink,
  Cpu,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 1강 전용 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'detector' | 'builder' | 'checklist';

export interface QuizItem {
  id: number;
  caseTitle: string;
  statement: string;
  isFact: boolean;
  explanation: string;
}

export interface VerificationCardData {
  topic: string;
  claim1: string;
  claim2: string;
  claim3: string;
  source1: string;
  source2: string;
  finalCorrection: string;
}

export interface RetrospectiveData {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

/**
 * ------------------------------------------------------------------------------
 * 환각 탐지관 퀴즈 3문항 데이터
 * ------------------------------------------------------------------------------
 */
const DETECTOR_QUIZZES: QuizItem[] = [
  {
    id: 1,
    caseTitle: '사례 1 · 조선 과학 기구',
    statement: '“조선시대의 대표적인 해시계 앙부일구는 세종대왕이 1434년에 직접 쇠를 깎아 만든 세계 최초의 해시계이다.”',
    isFact: false,
    explanation:
      '해시계 자체는 고대 그리스·이집트에도 존재했으므로 \'세계 최초\'가 아니며, 세종대왕이 직접 손으로 깎은 것이 아니라 세종의 명을 받아 장영실, 이천 등 기술 관료들이 협력하여 제작했습니다!'
  },
  {
    id: 2,
    caseTitle: '사례 2 · 우주 탐사선',
    statement: '“우주 탐사선 보이저 1호는 1977년에 발사되어 현재 인류가 만든 물체 중 지구에서 가장 멀리 떨어진 성간 공간(Interstellar)을 항해 중이다.”',
    isFact: true,
    explanation:
      'NASA의 공식 비행 기록에 따르면, 보이저 1호는 1977년 9월 5일 발사되어 2012년 태양권을 벗어나 성간 공간에 진입한 실존 탐사선입니다.'
  },
  {
    id: 3,
    caseTitle: '사례 3 · 역사 기록 날조',
    statement: '“조선왕조실록 세종 25년 기록에 따르면, 세종대왕이 밤샘 연구에 지친 집현전 학사들에게 토마토 소스와 치즈를 얹은 피자를 야식으로 하사했다는 기록이 전해진다.”',
    isFact: false,
    explanation:
      '인터넷 밈(유머 짤방)을 AI가 역사 기록인 양 매우 진지한 어조로 날조한 전형적인 환각 현상입니다! 조선 초기에는 토마토와 치즈 피자가 존재하지 않았습니다.'
  }
];

/**
 * ------------------------------------------------------------------------------
 * 표준 실습용 프롬프트 데이터
 * ------------------------------------------------------------------------------
 */
const PROMPT_CARDS = [
  {
    id: 'Q1',
    level: '1단계 · 단순 질문',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    title: '세종대왕의 과학 기술 업적 탐구',
    prompt: '세종대왕의 과학 기술 업적에 대해 알려줘.'
  },
  {
    id: 'Q2',
    level: '2단계 · 조건 추가',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    title: '연도와 수치 조건 요약 요청',
    prompt: '세종대왕의 과학 기술 업적을 5문장으로 요약하고, 각 업적의 제작 연도와 핵심 특징을 수치와 함께 포함해줘.'
  },
  {
    id: 'Q3',
    level: '3단계 · 검증 유도',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: '불확실성 태그([확인 필요]) 유도',
    prompt: '세종대왕의 과학 기술 업적 중 역사적 사실로 확실한 것과 후대에 과장되었거나 확인이 필요한 내용을 구분하여 5문장으로 설명해줘. 불확실한 부분에는 [확인 필요]라고 표시해줘.'
  }
];

/**
 * ------------------------------------------------------------------------------
 * 자가 점검 체크리스트 6개 항목
 * ------------------------------------------------------------------------------
 */
const CHECKLIST_ITEMS = [
  { id: 'chk_1', text: 'AI가 \'확률적으로 다음 단어를 예측하는 모델\'임을 설명할 수 있다.' },
  { id: 'chk_2', text: 'AI의 자신감 있는 말투 뒤에 숨은 \'환각(Hallucination)\' 현상을 인지할 수 있다.' },
  { id: 'chk_3', text: '프롬프트에 실명 대신 가상 데이터를 사용하여 개인정보를 보호했다.' },
  { id: 'chk_4', text: 'AI 답변에서 검증이 필요한 핵심 사실 주장 3가지를 선별했다.' },
  { id: 'chk_5', text: '백과사전이나 공식 자료 등 2개 이상의 독립된 출처로 교차 검증했다.' },
  { id: 'chk_6', text: '틀린 내용을 올바른 사실로 수정한 \'팩트체크 검증 카드\'를 완성했다.' }
];

/**
 * ------------------------------------------------------------------------------
 * 메인 컴포넌트: Lesson01 (2-Panel Flexible Workspace)
 * ------------------------------------------------------------------------------
 */
export const Lesson01: React.FC = () => {
  // 상단 퀘스트 스테이지 (Stage 1 ~ 4)
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');

  // 우측 콘솔 탭 ('detector' | 'builder' | 'checklist')
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('detector');

  // 환각 탐지관 퀴즈 상태 (각 퀴즈별 사용자 선택 'fact' | 'lie' | null)
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: 'fact' | 'lie' | null }>({
    1: null,
    2: null,
    3: null
  });

  // 스캐너 레이저 이펙트 상태
  const [scanningId, setScanningId] = useState<number | null>(null);

  // 복사 피드백 상태 (복사된 프롬프트 ID)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 단계별 힌트 아코디언 상태
  const [hintOpen, setHintOpen] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false
  });

  // 실험 관찰 기록 폼 상태
  const [experimentNote, setExperimentNote] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(true);

  // 검증 카드 폼 상태
  const [cardData, setCardData] = useState<VerificationCardData>({
    topic: '세종대왕의 과학 기술 업적 (앙부일구, 자격루, 측우기)',
    claim1: '앙부일구는 1434년에 제작되었다.',
    claim2: '자격루는 자동으로 시각을 알려주는 물시계이다.',
    claim3: '세종대왕이 직접 모든 금속 부품을 손으로 깎아 만들었다.',
    source1: '한국민족문화대백과사전 (앙부일구 항목)',
    source2: '국립고궁박물관 조선 과학 유물 공식 해설서',
    finalCorrection: '앙부일구는 1434년에 세종의 명을 받아 장영실, 이천 등이 협력하여 제작한 해시계로, 백성들이 시간을 쉽게 읽을 수 있도록 글자 대신 12지신 그림을 새겨 넣은 과학 문화유산이다.'
  });

  // 회고록 폼 상태
  const [retroData, setRetroData] = useState<RetrospectiveData>({
    q1: 'AI가 스스로 뜻을 이해하는 것이 아니라 통계적 확률로 다음 단어를 예측한다는 점이 신기했다.',
    q2: 'AI가 앙부일구를 세종대왕이 손수 깎았다고 말해서 처음엔 믿을 뻔했으나, 백과사전을 찾아보고 거짓말임을 발견했다.',
    q3: 'AI가 자신만만하게 말한 1434년 세종 단독 제작 설을 거절하고, 장영실과 이천 등의 공동 제작 사실로 수정했다.',
    q4: '다음 시간에는 프롬프트를 더 정교하게 작성해서 AI가 엉뚱한 대답을 하지 못하도록 제약 조건을 줘보고 싶다.'
  });

  // 자가 점검 체크리스트 상태
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    chk_1: false,
    chk_2: false,
    chk_3: false,
    chk_4: false,
    chk_5: false,
    chk_6: false
  });

  // 초기 로컬 스토리지 로드
  useEffect(() => {
    try {
      const savedChecks = localStorage.getItem('ai_lesson_01_checklist');
      if (savedChecks) {
        setCheckedItems(JSON.parse(savedChecks));
      }
      const savedCard = localStorage.getItem('ai_lesson_01_card');
      if (savedCard) {
        setCardData(JSON.parse(savedCard));
      }
      const savedRetro = localStorage.getItem('ai_lesson_01_retro');
      if (savedRetro) {
        setRetroData(JSON.parse(savedRetro));
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }, []);

  // 체크리스트 진행률 계산 (0% ~ 100%)
  const checkedCount = useMemo(() => {
    return Object.values(checkedItems).filter(Boolean).length;
  }, [checkedItems]);
  const progressPercent = Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100);
  const isAllChecked = checkedCount === CHECKLIST_ITEMS.length;

  // 환각 탐지관 완료 수
  const quizSolvedCount = useMemo(() => {
    return Object.values(quizAnswers).filter((v) => v !== null).length;
  }, [quizAnswers]);

  // 프롬프트 복사 핸들러
  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  // 퀴즈 응답 핸들러 (스캐너 레이저 효과)
  const handleSelectQuiz = (quizId: number, choice: 'fact' | 'lie') => {
    setScanningId(quizId);
    setTimeout(() => {
      setQuizAnswers((prev) => ({ ...prev, [quizId]: choice }));
      setScanningId(null);
    }, 300);
  };

  // 퀴즈 초기화
  const handleResetDetector = () => {
    setQuizAnswers({ 1: null, 2: null, 3: null });
  };

  // 체크박스 토글 핸들러
  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('ai_lesson_01_checklist', JSON.stringify(next));
        if (Object.values(next).filter(Boolean).length === CHECKLIST_ITEMS.length) {
          localStorage.setItem('ai_lesson_01_completed', 'true');
        }
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return next;
    });
  };

  // 검증 카드 폼 변경
  const handleCardDataChange = (field: keyof VerificationCardData, val: string) => {
    const updated = { ...cardData, [field]: val };
    setCardData(updated);
    try {
      localStorage.setItem('ai_lesson_01_card', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // 회고 폼 변경
  const handleRetroDataChange = (field: keyof RetrospectiveData, val: string) => {
    const updated = { ...retroData, [field]: val };
    setRetroData(updated);
    try {
      localStorage.setItem('ai_lesson_01_retro', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // 관찰 메모 변경
  const handleNoteChange = (val: string) => {
    setExperimentNote(val);
    setNoteSaved(false);
    setTimeout(() => setNoteSaved(true), 600);
  };

  // 마크다운 내보내기 다운로드
  const handleExportMarkdown = () => {
    const md = `# [1강 팩트체크 검증 카드 및 학습 회고]
- 작성일시: ${new Date().toLocaleString('ko-KR')}
- 학습 단위: 시즌 1 · 1강 — AI는 무엇을 잘하고 무엇을 틀릴까 (팩트체크 배틀)
- 검증 결과: HUMAN VERIFIED FACT BADGE 발급 완료

---

## 1. AI 팩트체크 검증 카드 (Digital Fact-Check ID)
- **검증 대상 주제**: ${cardData.topic}
- **AI 핵심 주장 1**: ${cardData.claim1}
- **AI 핵심 주장 2**: ${cardData.claim2}
- **AI 핵심 주장 3 (환각 판정)**: ${cardData.claim3}
- **교차 검증 출처 1**: ${cardData.source1}
- **교차 검증 출처 2**: ${cardData.source2}
- **최종 교정된 사실 요약**:
> ${cardData.finalCorrection}

---

## 2. 오늘 학습 회고록 (Retrospective)
1. **오늘 새롭게 배운 점이나 흥미로웠던 개념**:
   ${retroData.q1}

2. **실습 중 마주친 오류나 막혔던 점과 해결 방법**:
   ${retroData.q2}

3. **AI가 제안한 답변 중 비판적으로 거절하거나 수정한 내용**:
   ${retroData.q3}

4. **다음 수업이나 일상에서 시도해보고 싶은 점**:
   ${retroData.q4}

---
*본 문서는 AI·코딩 24강 LMS 워크스페이스에서 발행되었습니다.*`;

    downloadFile(md, 'lesson-01-fact-check-badge.md', 'text/markdown;charset=utf-8;');
  };

  // JSON 내보내기 다운로드
  const handleExportJSON = () => {
    const obj = {
      lessonId: 'lesson_01',
      title: '1강 — AI는 무엇을 잘하고 무엇을 틀릴까 (팩트체크 배틀)',
      issuedAt: new Date().toISOString(),
      cardData,
      retroData,
      checklistProgress: `${checkedCount}/${CHECKLIST_ITEMS.length}`,
      isCompleted: isAllChecked
    };
    downloadFile(JSON.stringify(obj, null, 2), 'lesson-01-fact-check.json', 'application/json;charset=utf-8;');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 진행률 바 너비 클래스 매핑 (0 inline styles)
  const getProgressWidthClass = (count: number) => {
    switch (count) {
      case 1:
        return 'w-1/6';
      case 2:
        return 'w-2/6';
      case 3:
        return 'w-3/6';
      case 4:
        return 'w-4/6';
      case 5:
        return 'w-5/6';
      case 6:
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const getQuizProgressWidthClass = (count: number) => {
    switch (count) {
      case 1:
        return 'w-1/3';
      case 2:
        return 'w-2/3';
      case 3:
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans text-base sm:text-lg selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. 상단 글로벌 GNB & 4단계 퀘스트 스텝퍼 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 flex-none bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 좌측: 과정 홈 링크 & 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
            <span className="w-1 h-3 bg-slate-200 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                시즌 1 · 1강
              </span>
              <span className="text-sm font-bold text-slate-900 truncate">
                AI는 거짓말쟁이? 팩트체크 배틀
              </span>
            </div>
          </div>

          {/* 중앙: 4단계 퀘스트 스텝퍼 탭 */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage1'}
              onClick={() => setActiveStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
              <span>브리핑</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage2'}
              onClick={() => setActiveStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>AI 두뇌 해부</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage3'}
              onClick={() => setActiveStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
              <span>비교 실험</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'stage4'}
              onClick={() => setActiveStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
              <span>검증 &amp; 회고</span>
            </button>
          </nav>

          {/* 우측: 1강 진행률 & 2강 언락 상태 뱃지 */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2">
              <div className="text-right">
                <span className="text-sm font-bold text-slate-500 block">진척도</span>
                <span className="text-xs text-indigo-600 font-bold">{checkedCount}/6 ({progressPercent}%)</span>
              </div>
              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 p-0.5">
                <div
                  className={`bg-indigo-600 h-full rounded-full transition-all duration-300 ${getProgressWidthClass(
                    checkedCount
                  )}`}
                />
              </div>
            </div>

            {isAllChecked ? (
              <a
                href="/lessons/02-better-prompts/index.html"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 animate-pulse transition-all whitespace-nowrap"
              >
                <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>2강 언락!</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap"
                title="우측 체크리스트 6개를 모두 완료하면 2강이 열립니다."
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                <span>2강 잠김 ({checkedCount}/6)</span>
              </span>
            )}
          </div>
        </div>

        {/* 모바일 4단계 스텝퍼 탭 */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 px-2 py-1.5">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold ${
              activeStage === 'stage1' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            1. 브리핑
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold ${
              activeStage === 'stage2' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            2. 두뇌해부
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold ${
              activeStage === 'stage3' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            3. 비교실험
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold ${
              activeStage === 'stage4' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            4. 검증회고
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. 메인 작업 영역: 2-Panel Flexible Workspace (좌 60% / 우 40%) */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* ----------------------------------------------------------------------- */}
        {/* 좌측 패널 (60% 폭 - 동적 퀘스트 콘텐츠 영역) */}
        {/* ----------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* STAGE 1: 미션 브리핑 */}
          {activeStage === 'stage1' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 히어로 헤더 카드 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                    시즌 1: AI 스토리 &amp; 비주얼 노벨 크리에이터
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    카드 등록 없는 전액 무료 AI 실습
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    1강 — AI는 무엇을 잘하고 무엇을 틀릴까
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                    AI는 왜 모르는 것도 아는 척하며 진짜처럼 거짓말을 할까요? AI가 단어를 징검다리처럼 잇는 '끝말잇기 두뇌 비밀'을 파헤치고, 엉터리 답변을 콕 집어내는 '명탐정 팩트체크 5단계'로 진짜와 가짜를 구별하는 멋진 힘을 길러봅니다!
                  </p>
                </div>

                {/* 메타 4구리드 칩 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">학습 속도</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">자기 페이스</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">실습 도구</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">브라우저 &amp; 무료 AI</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">사전 요구지식</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">선행학습 없음</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">오늘의 결과물</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">팩트체크 카드 1종</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4대 성공 기준 루브릭 표 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">오늘 완성할 결과물과 4대 성공 기준</h2>
                    <p className="text-xs text-slate-500">
                      AI의 아리송한 대답을 우리가 꼼꼼하게 따져보고 바르게 고친 <strong>‘AI 거짓말 잡는 명탐정 검증 카드’</strong>를 완성합니다.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm sm:text-base border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-sm sm:text-base">
                        <th className="py-3.5 px-4 w-1/4">탐정 평가 영역</th>
                        <th className="py-3 px-4">미션 성공 기준 <span className="block text-xs font-normal text-slate-500 mt-0.5">꼼꼼 확인 체크!</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">1. 질문 생성</th>
                        <td className="py-3.5 px-4">개인정보를 포함하지 않고, 사실 확인이 필요한 구체적인 질문 프롬프트를 전송했는가?</td>
                      </tr>
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">2. 핵심 주장 추출</th>
                        <td className="py-3.5 px-4">AI의 답변 중에서 '확인이 필요한 사실 주장' 3가지를 표로 분류했는가?</td>
                      </tr>
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">3. 다중 출처 검증</th>
                        <td className="py-3 px-4 leading-relaxed">최소 2개 이상의 신뢰할 수 있는 출처 <span className="inline-block text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">(백과사전, 공식 문서, 뉴스 등)</span>로 대조했는가?</td>
                      </tr>
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-slate-900">4. 비판적 수정</th>
                        <td className="py-3.5 px-4">틀리거나 과장된 내용을 찾아 올바른 사실에 입각한 문장으로 직접 수정했는가?</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5단계 팩트체크 파이프라인 개요 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  우리가 마스터할 명탐정 팩트체크 5단계 코스
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {[
                    { num: 1, name: '질문 전송', desc: '조건과 수치를 갖춘 탐구 프롬프트 전송' },
                    { num: 2, name: '초안 수신', desc: 'AI의 5문장 답변을 비판적으로 읽기' },
                    { num: 3, name: '주장 추출', desc: '연도·수치·인과관계 팩트 주장 3개 선별' },
                    { num: 4, name: '교차 검증', desc: '백과사전·공식 사이트 2개 이상 출처 대조' },
                    { num: 5, name: '최종 교정', desc: '틀린 내용을 바로잡은 나만의 완성 카드 작성' }
                  ].map((step) => (
                    <div key={step.num} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                        {step.num}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{step.name}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-normal">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 실습 로드맵 안내 카드: 우측 콘솔은 언제 쓰나요? */}
              <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 rounded-2xl border border-indigo-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" /> 실습 로드맵: 우측 콘솔은 언제 사용하나요?
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    전체 3단계 실습 순서
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700">1단계 · Stage 2</span>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>① [환각 탐지기]</span></h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-normal">AI의 거짓말 3문항 판별 챌린지 풀기</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">2단계 · Stage 3~4</span>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2"><FileCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>② [검증 카드 빌더]</span></h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-normal">직접 찾은 팩트로 디지털 검증 배지 발급</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700">3단계 · Stage 4 완료 후</span>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" /><span>③ [체크리스트]</span></h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-normal">6개 기준 자가진단 후 2강 게이트 열기</p>
                  </div>
                </div>
              </div>

              {/* 하단 다음 단계 버튼 */}
              <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="text-xs text-indigo-900 font-medium">
                  브리핑을 확인하셨다면 다음 단계로 이동하여 AI의 두뇌 원리를 탐구하세요!
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>다음: Stage 2 AI 두뇌 해부</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: AI 두뇌 해부 */}
          {activeStage === 'stage2' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 단어 확률 예측 인포그래픽 카드 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    AI 두뇌 비밀 🧠
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    1. AI 두뇌의 비밀: 세상에서 제일 똑똑한 끝말잇기 선수!
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    AI는 백과사전에서 정답을 복사해 오는 검색 엔진(Search Engine)도 아니고, 수학 공식을 푸는 계산기(Calculator)도 아닙니다.{' '}
                    <strong>“지금까지 나온 단어들의 맥락을 보고, 가장 자연스럽게 이어질 다음 단어를 확률적으로 계산하여 이어붙이는 모델”</strong>입니다.
                  </p>
                </div>

                {/* 실시간 시뮬레이션 확률 바 */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm sm:text-base font-bold text-slate-700 gap-1 pb-2 border-b border-slate-200">
                    <span>입력 문장 맥락: <em>“오늘 점심에는 따뜻한”</em></span>
                    <span className="inline-flex items-center gap-1.5 text-indigo-600 font-bold"><ArrowRight className="w-4 h-4 text-indigo-500" />[ 다음에 이어질 최유력 단어는? ]</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm sm:text-base font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-600 flex-shrink-0" /><span><strong className="text-amber-950 font-bold">1위 국밥</strong> <span className="text-xs text-slate-600">(가장 자연스러운 최유력 단어)</span></span></span>
                        <span className="text-blue-600 font-bold">68.4%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full w-[68%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm sm:text-base font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-2"><Medal className="w-4 h-4 text-slate-500 flex-shrink-0" /><span><strong className="text-slate-800 font-bold">2위 피자</strong> <span className="text-xs text-slate-600">(문맥상 가능하나 덜 흔한 단어)</span></span></span>
                        <span className="text-blue-400 font-bold">23.1%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full w-[23%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm sm:text-base font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-700 flex-shrink-0" /><span><strong className="text-slate-800 font-bold">3위 스마트폰</strong> <span className="text-xs text-slate-600">(문법이나 상식상 어색한 단어)</span></span></span>
                        <span className="text-slate-400 font-bold">0.01%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full w-[2%]" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 pt-2 border-t border-slate-200 leading-relaxed">
                    <span className="inline-flex items-center gap-1 text-slate-900 font-bold"><Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />핵심 포인트:</span> AI는 국밥이 따끈따끈 맛있는 음식이라는 걸 직접 "생각"해서 말한 게 아니에요! 인터넷에 있는 엄청나게 많은 글에서 <em>"따뜻한"</em> 뒤에 <em>"국밥"</em>이란 단어가 가장 자주 나왔기 때문에 이 단어를 고른 거랍니다.
                  </p>
                </div>
              </div>

              {/* 2대 원칙: 환각 경고 & 가상 데이터 수칙 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 환각 경고 */}
                <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm space-y-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    주의 경보 🚨
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">2. AI의 그럴듯한 거짓말: 모르면 그냥 지어내요!</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    AI는 자기가 지어낸 말이 진짜인지 가짜인지 전혀 몰라요. 문장은 아주 매끄럽고 똑똑해 보이지만, <strong>전혀 사실이 아닌 엉터리 이야기를 진짜처럼 당당하게 지어내는 마법 같은 거짓말</strong>을 한답니다.
                  </p>
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-sm text-rose-950 leading-relaxed">
                    <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />오개념 경고:</span> “AI가 똑똑하게 말했으니 무조건 맞겠지?” → 절대 안 돼요! AI가 한 말은 언제나 우리 사람이 꼼꼼하게 확인해야 하는 <strong>‘연습장 낙서’</strong> 같은 거예요.
                  </div>
                </div>

                {/* 가상 데이터 개인정보 보호 */}
                <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    비밀 지킴이 🛡️
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">3. 개인정보 지킴이: 소중한 내 비밀은 꽁꽁 숨기기!</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    AI와 대화할 때 적는 글은 모두 컴퓨터 서버로 보내져요. 내 진짜 이름, 전화번호, 다니는 학교 같은 소중한 비밀은 절대로 입력하면 안 돼요!
                  </p>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-sm text-emerald-950 leading-relaxed">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold"><ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />실천 요령:</span> 실제 내 정보 대신 언제나 <code className="bg-white px-1 py-0.5 rounded border border-emerald-300">홍길동</code>, <code className="bg-white px-1 py-0.5 rounded border border-emerald-300">010-0000-0000</code>, <code className="bg-white px-1 py-0.5 rounded border border-emerald-300">가상중학교</code> 같은 가상의 플레이스홀더 데이터를 사용하세요!
                  </div>
                </div>
              </div>

              {/* 핵심 정리 4가지 */}
              <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-5 space-y-3">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  핵심 정리: 오늘 꼭 기억할 4가지 원칙
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base text-slate-700">
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-indigo-100">
                    <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span><strong>1. 확률적 예측기:</strong> 문맥상 가장 어울리는 단어를 통계적으로 이어붙일 뿐, 진위를 모릅니다.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-indigo-100">
                    <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span><strong>2. 환각의 필연성:</strong> 모르는 내용도 자신감 넘치는 어조로 거짓말을 지어낼 수 있습니다.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-indigo-100">
                    <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span><strong>3. 가상 데이터 수칙:</strong> 실명 대신 홍길동 가상 데이터로 개인정보를 보호합니다.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-indigo-100">
                    <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span><strong>4. 5단계 팩트체크:</strong> 질문 → 초안 → 주장 추출 → 출처 2개 검증 → 교정 카드를 작성합니다.</span>
                  </li>
                </ul>
              </div>

              {/* [실습 지시] 우측 환각 탐지기 콘솔 수행 알림 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-cyan-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                    ACTION REQUIRED · 1단계 실습 미션
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />지금 우측 콘솔의 [환각 탐지기]를 시작하세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 AI 환각 현상을 직접 체감할 차례입니다. 우측 콘솔의 <strong>[환각 탐지기]</strong>에서 앙부일구, 보이저 1호, 세종대왕 피자 3개 문항의 Fact / Lie를 직접 판별해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('detector')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [환각 탐지기] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 스테이지 전환 버튼 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage1')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  ← 이전: Stage 1 브리핑
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>다음: Stage 3 비교 실험 &amp; 프롬프트</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: 비교 실험 & 프롬프트 */}
          {activeStage === 'stage3' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 비교 실험 안내 & 예상 관찰 표 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">EXPERIMENT GUIDE</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    단계별 비교 실험: 같은 주제, 다른 질문으로 AI 반응 탐구하기
                  </h2>
                  <p className="text-xs text-slate-500">
                    실습 주제인 <strong>'세종대왕의 과학 기술 업적'</strong>을 3가지 다른 프롬프트로 전송하며 답변의 정확도와 어조 차이를 관찰합니다.
                  </p>
                </div>

                {/* 관찰 표 */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm sm:text-base border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-sm sm:text-base">
                        <th className="py-3.5 px-4 w-1/5">단계</th>
                        <th className="py-3.5 px-4 font-bold text-xs sm:text-sm whitespace-nowrap">사용한 프롬프트 유형</th>
                        <th className="py-3.5 px-4">예상 관찰 결과 및 응답 특성</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">1단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(기본)</span></th>
                        <td className="py-3.5 px-4">일반적 질문</td>
                        <td className="py-3.5 px-4">훈민정음 창제, 농업 발전 등 널리 알려진 대표 업적을 포괄적이고 무난하게 나열함</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">2단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(조건 추가)</span></th>
                        <td className="py-3.5 px-4">수치·연도 조건 지정</td>
                        <td className="py-3.5 px-4">측우기, 자격루 등의 연도가 추가되나, 세종의 직접 발명 여부와 장영실 등의 역할이 혼동될 수 있음</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">3단계 <span className="block text-xs font-normal text-slate-500 mt-0.5">(검증 유도)</span></th>
                        <td className="py-3 px-4"><span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mr-1">[확인 필요]</span><span className="block text-xs text-slate-500 mt-0.5">태그 요청</span></td>
                        <td className="py-3.5 px-4">기록의 불확실성이나 제작 주체 구분에 대해 스스로 <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">[확인 필요]</span>를 표시하며 신중한 어조로 변경됨</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 실습용 표준 프롬프트 카드 3종 (원클릭 복사) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  실습용 표준 프롬프트 3종 (클릭 시 즉시 클립보드 복사)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PROMPT_CARDS.map((card) => {
                    const isCopied = copiedId === card.id;
                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-sm font-bold border ${card.badgeClass}`}>
                              {card.level}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">{card.id}</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">{card.title}</h4>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed break-all">
                            {card.prompt}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(card.id, card.prompt)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>복사됨!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-indigo-600" />
                              <span>프롬프트 복사하기</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 학생 실습 4단계 가이드 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-indigo-600" />
                  단계별 학생 실습 4단계 가이드
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { step: '1단계', title: '무료 AI 접속 & 개인정보 체크', desc: 'ChatGPT Free, Gemini, Claude 중 하나에 접속하고 실명 입력 금지 확인' },
                    { step: '2단계', title: '실험 질문 전송 & 답변 복사', desc: '위 표준 프롬프트 Q1, Q2, Q3를 순서대로 전송하고 응답 문장 관찰' },
                    { step: '3단계', title: '핵심 주장 3가지 추출', desc: '답변 문장 중 연도, 발명자, 효과 등 검증이 필요한 팩트 주장 3개 선별' },
                    { step: '4단계', title: '다중 출처로 교차 검증', desc: '백과사전, 박물관 공식 기록 등으로 대조하여 날조된 부분 체포' }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{s.step}</span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{s.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-normal">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 막혔을 때 문제 해결 팁 (3대 오류) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Bug className="w-3.5 h-3.5" />
                  <span>실습 중 마주칠 수 있는 3대 오류와 해결책</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900">문제 1: 엉뚱한 대답을 해요!</h4>
                    <p className="text-slate-600 leading-relaxed">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />해결 방안:</span> 질문의 범위를 좁히세요. "5문장으로 요약해줘", "조선 전기에 한정해줘"처럼 제약 조건을 추가하면 해결됩니다.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900">문제 2: 가짜 링크나 출처를 알려줘요!</h4>
                    <p className="text-slate-600 leading-relaxed">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />해결 방안:</span> AI가 만든 URL은 대부분 존재하지 않는 환각 링크입니다. AI에게 링크를 묻지 말고 사람이 포털/백과사전에서 검색하세요.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900">문제 3: 두 AI의 주장이 달라요!</h4>
                    <p className="text-slate-600 leading-relaxed">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />해결 방안:</span> 둘 다 모델이 다를 뿐 정답 판정자가 아닙니다. 국사편찬위원회, 박물관 공식 아카이브 등 공인된 1차 자료를 기준으로 삼으세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 실습 관찰 메모 기록 폼 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    나의 비교 실험 관찰 기록 메모
                  </label>
                  <span className="text-sm text-emerald-600 font-medium">
                    {noteSaved ? '자동 저장됨' : '저장 중...'}
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="예: Q1은 포괄적으로 나열했지만, Q3에서는 불확실한 부분에 [확인 필요]를 붙이며 훨씬 신중하게 대답했다..."
                  value={experimentNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 leading-relaxed"
                />
              </div>

              {/* [실습 지시] 우측 환각 탐지기 콘솔 수행 알림 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-cyan-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                    ACTION REQUIRED · 1단계 실습 미션
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />지금 우측 콘솔의 [환각 탐지기]를 시작하세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 AI 환각 현상을 직접 체감할 차례입니다. 우측 콘솔의 <strong>[환각 탐지기]</strong>에서 앙부일구, 보이저 1호, 세종대왕 피자 3개 문항의 Fact / Lie를 직접 판별해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('detector')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [환각 탐지기] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

                            {/* [실습 지시] 우측 검증 카드 빌더 연동 알림 */}
              <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-400/40 uppercase">
                    ACTION REQUIRED · 2단계 실습 미션
                  </span>
                  <span className="text-xs text-indigo-300 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />비교 실험을 마쳤다면 우측의 [검증 카드 빌더]를 열어 작성하세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    무료 AI 서비스(ChatGPT, Gemini 등)에 Q1~Q3 프롬프트를 전송해 보셨나요? AI 답변에서 찾은 팩트와 교차 검증한 올바른 사실을 우측 <strong>[검증 카드 빌더]</strong>에 입력하고 실시간 디지털 인증 배지를 발급받으세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('builder')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [검증 카드 빌더] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 스테이지 전환 버튼 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  ← 이전: Stage 2 AI 두뇌 해부
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>다음: Stage 4 심화 &amp; 회고</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: 심화 & 회고 */}
          {activeStage === 'stage4' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 오류 연구소 2대 증상 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <Bug className="w-3.5 h-3.5" />
                    ERROR LAB 2 CASES
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">오류 연구소: AI 답변의 2대 취약점 분석</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">증상 1</span>
                    <h4 className="font-bold text-slate-900">존재하지 않는 가짜 출처 날조</h4>
                    <p className="text-slate-600 leading-relaxed">
                      AI에게 출처를 물으면 '조선왕조실록 권12 p.45'처럼 아주 구체적인 책 이름과 페이지 번호까지 지어내지만, 실제 데이터베이스를 검색해보면 해당 페이지나 구절이 존재하지 않는 경우가 흔합니다.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">증상 2</span>
                    <h4 className="font-bold text-slate-900">역할과 연도 뒤섞기 (크로스오버 환각)</h4>
                    <p className="text-slate-600 leading-relaxed">
                      세종대왕의 명을 받아 기술자들이 제작한 발명품을 세종 본인이 직접 망치로 두드려 만들었다고 단정하거나, 조선 후기의 유물을 세종 때 발명된 것으로 시대를 혼동하는 사례가 잦습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 단계적 힌트 3단계 아코디언 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  단계적 힌트 (막혔을 때 하나씩 열어보세요)
                </h3>
                {[
                  { id: 1, title: '1단계 힌트: 무엇을 검색해야 할지 막막할 때', content: '포털 검색창에 [세종대왕 앙부일구 제작자], [앙부일구 1434년] 처럼 핵심 단어 2개를 조합해 보세요.' },
                  { id: 2, title: '2단계 힌트: AI 답변에서 주장을 찾기 어려울 때', content: '연도(숫자), 사람 이름, ~했다(결과)가 들어간 문장을 찾으세요. 그것이 바로 팩트체크 대상입니다!' },
                  { id: 3, title: '3단계 힌트: 신뢰할 수 있는 출처를 찾고 싶을 때', content: '블로그나 지식iN 대신 [한국민족문화대백과사전], [국립고궁박물관], [국사편찬위원회 조선왕조실록] 사이트를 참조하세요.' }
                ].map((hint) => {
                  const isOpen = hintOpen[hint.id];
                  return (
                    <div key={hint.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setHintOpen((prev) => ({ ...prev, [hint.id]: !prev[hint.id] }))}
                        className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left text-xs font-bold text-slate-800 transition-colors"
                      >
                        <span>{hint.title}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                      {isOpen && (
                        <div className="p-3.5 bg-white text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-200 animate-fadeIn">
                          {hint.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 확장 미션 & 생각해보기 토론 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm space-y-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3 h-3" />
                    확장 미션
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">2개 이상의 AI 교차 비교하기</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    ChatGPT와 Google Gemini 두 군데에 동일한 프롬프트(Q2)를 동시에 붙여넣고 전송해 보세요. 두 모델이 제시하는 연도나 표현 방식이 어떻게 다른지 비교하면 AI별 특성을 더 깊이 체감할 수 있습니다.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <MessageSquare className="w-3 h-3" />
                    생각해보기
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">함께 나누는 토론 이야기</h4>
                  <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed font-normal">
                    <li>• <strong>토론 1:</strong> AI가 작성한 보고서나 과제를 검증하지 않고 그대로 제출하면 어떤 위험이 발생할까요?</li>
                    <li>• <strong>토론 2:</strong> 앞으로 AI가 더 똑똑해져도 사람이 팩트체크를 해야 하는 이유는 무엇일까요?</li>
                  </ul>
                </div>
              </div>

              {/* 오늘 학습 회고록 4문항 폼 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">RETROSPECTIVE</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">오늘 학습 회고록 (4대 성찰 질문)</h3>
                  </div>
                  <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>로컬 자동 저장
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. 오늘 새롭게 배운 점이나 흥미로웠던 개념은 무엇인가요?
                    </label>
                    <textarea
                      rows={2}
                      value={retroData.q1}
                      onChange={(e) => handleRetroDataChange('q1', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. 실습 중 마주친 오류나 막혔던 점과 어떻게 해결했나요?
                    </label>
                    <textarea
                      rows={2}
                      value={retroData.q2}
                      onChange={(e) => handleRetroDataChange('q2', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. AI가 제안한 답변 중 비판적으로 거절하거나 수정한 내용은 무엇인가요?
                    </label>
                    <textarea
                      rows={2}
                      value={retroData.q3}
                      onChange={(e) => handleRetroDataChange('q3', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. 다음 수업이나 일상에서 시도해보고 싶은 점은 무엇인가요?
                    </label>
                    <textarea
                      rows={2}
                      value={retroData.q4}
                      onChange={(e) => handleRetroDataChange('q4', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                </div>

                {/* 다운로드 버튼 그룹 */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>마크다운(.md) 검증 카드 다운로드</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON 데이터 다운로드</span>
                  </button>
                </div>
              </div>

                            {/* [실습 지시] 우측 체크리스트 및 2강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 2강을 여세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    오늘 학습한 6대 핵심 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 2강(나만의 판타지 캐릭터와 세계관 프롬프트)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 &amp; 2강 언락] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
                  JUNIOR DEVELOPER GLOSSARY · 1강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 AI 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 생성형 AI */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-indigo-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      1. 생성형 AI
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Generative AI</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-mono flex-shrink-0">GenAI</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 스스로 새로운 글, 그림, 음악을 만들어내는 마법의 요술 붓!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 방대한 양의 텍스트, 이미지, 음성 데이터를 미리 학습(Pre-training)하여, 입력된 요청에 맞춰 새로운 창작물을 통계적으로 합성해내는 인공지능 기술입니다.
                </p>
              </div>

              {/* 용어 2: 할루시네이션 (환각) */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      2. 환각 현상
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 할루시네이션 (Hallucination)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">Error</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 모르는 문제인데도 아는 척하며 당당하게 지어내는 AI의 하얀 거짓말!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> AI 모델이 학습 데이터에 없는 사실이나 허구의 내용을 매우 그럴듯하고 자신감 넘치는 말투로 답변하는 인공지능의 대표적인 구조적 한계 현상입니다.
                </p>
              </div>

              {/* 용어 3: 다음 토큰 예측 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-cyan-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      3. 다음 토큰 예측
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Next Token Prediction</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700 font-mono flex-shrink-0">LLM Core</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 앞 문장을 보고 다음에 올 단어를 번개처럼 맞히는 '초특급 끝말잇기'!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 거대 언어 모델(LLM)이 문장을 완성할 때, 지금까지 등장한 단어들의 맥락(Context)을 수식으로 계산하여 가장 올 확률이 높은 다음 단어(Token)를 1개씩 이어붙여 나가는 알고리즘입니다.
                </p>
              </div>

              {/* 용어 4: 팩트체크 & 교차 검증 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      4. 팩트체크 &amp; 교차 검증
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Fact-Checking &amp; Cross-Validation</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">Audit</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 친구 말이 진짜인지 백과사전과 신문 2곳 이상에서 확인해보는 탐정 수사!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 하나의 정보원(AI 답변 등)을 맹신하지 않고, 신뢰성이 검증된 2개 이상의 독립된 출처(공식 문서, 백과사전 등)와 대조하여 진위 여부를 객관적으로 입증하는 작업입니다.
                </p>
              </div>

              {/* 용어 5: 프롬프트 엔지니어링 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-violet-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-violet-400" />
                      5. 프롬프트 엔지니어링
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Prompt Engineering</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-violet-900/60 text-violet-200 border border-violet-700 font-mono flex-shrink-0">Skill</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> AI에게 원하는 답을 똑똑하게 얻어내는 '마법의 주문서 작성법'!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 인공지능이 엉뚱한 대답을 하지 않고 가장 유용하고 정확한 결과를 내놓도록 질문의 맥락, 역할(Persona), 규칙, 제약조건 등을 전략적으로 설계하는 기술입니다.
                </p>
              </div>

              {/* 용어 6: 데이터 편향과 그라운딩 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      6. 데이터 편향과 그라운딩
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Data Bias &amp; Grounding</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">Reliability</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> 편식해서 배운 AI의 삐딱한 생각과, 진짜 사실에 단단히 발을 딛게 해주는 닻!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> AI가 학습한 데이터 자체의 왜곡(편향)을 경계하고, 공인된 외부 지식(Grounding Data)을 결합하여 사실에 부합하는 검증된 답변만 내놓도록 고정하는 품질 관리 기법입니다.
                </p>
              </div>
            </div>
          </div>
          )}

          </section>

        {/* ----------------------------------------------------------------------- */}
        {/* 우측 패널 (40% 폭 - 고정형 실습 콘솔 & 실시간 카드 빌더) */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar" aria-label="실습 콘솔 패널">
          {/* 상단 탭 스위처: 언제 실습하는지 명시된 3대 탭 */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('detector')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeRightTab === 'detector'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>환각 탐지기</span>
                <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-700 text-slate-200">
                  {quizSolvedCount}/3
                </span>
              </div>
              <span className={`text-xs font-normal ${activeRightTab === 'detector' ? 'text-cyan-300 font-semibold' : 'text-slate-400'}`}>
                Stage 2에서 실습
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('builder')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeRightTab === 'builder'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>검증 카드 빌더</span>
              </div>
              <span className={`text-xs font-normal ${activeRightTab === 'builder' ? 'text-indigo-300 font-semibold' : 'text-slate-400'}`}>
                Stage 3~4에서 실습
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>체크리스트</span>
                <span className="px-1.5 py-0.2 rounded-full text-xs bg-emerald-700 text-emerald-100">
                  {checkedCount}/6
                </span>
              </div>
              <span className={`text-xs font-normal ${activeRightTab === 'checklist' ? 'text-emerald-300 font-semibold' : 'text-slate-400'}`}>
                Stage 4 완료 후
              </span>
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: AI 환각 탐지기 콘솔 (다크 HUD 스타일 UI) */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'detector' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-slate-100 shadow-xl space-y-4 animate-fadeIn">
              {/* HUD 헤더 */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    HUD SCANNER ACTIVE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    탐지 완료: <strong className="text-emerald-400">{quizSolvedCount}</strong> / 3
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDetector}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="초기화"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 탐지기 진행률 바 */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`bg-cyan-400 h-full rounded-full transition-all duration-300 ${getQuizProgressWidthClass(
                    quizSolvedCount
                  )}`}
                />
              </div>

              {/* 3문제 리스트 */}
              <div className="space-y-4">
                {DETECTOR_QUIZZES.map((quiz) => {
                  const userChoice = quizAnswers[quiz.id];
                  const isAnswered = userChoice !== null;
                  const isCorrect =
                    isAnswered &&
                    ((quiz.isFact && userChoice === 'fact') || (!quiz.isFact && userChoice === 'lie'));
                  const isScanning = scanningId === quiz.id;

                  return (
                    <div
                      key={quiz.id}
                      className={`rounded-xl border p-4 space-y-3 transition-all relative overflow-hidden ${
                        !isAnswered
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          : isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/50'
                          : 'bg-rose-950/30 border-rose-500/50'
                      }`}
                    >
                      {/* 스캐너 레이저 이펙트 */}
                      {isScanning && (
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 animate-pulse" />
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300">
                          {quiz.caseTitle}
                        </span>
                        {isAnswered && (
                          <span
                            className={`text-sm font-bold flex items-center gap-1 ${
                              isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isCorrect ? '사실 일치 검증' : '판별 실패'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-medium">
                        {quiz.statement}
                      </p>

                      {/* Fact / Lie 버튼 */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSelectQuiz(quiz.id, 'fact')}
                          className={`py-2.5 px-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
                            userChoice === 'fact'
                              ? quiz.isFact
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" />진짜 사실 (Fact)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectQuiz(quiz.id, 'lie')}
                          className={`py-2.5 px-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
                            userChoice === 'lie'
                              ? !quiz.isFact
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-rose-600" />AI 거짓말 (Lie)</span>
                        </button>
                      </div>

                      {/* 해설 아코디언 */}
                      {isAnswered && (
                        <div
                          className={`p-3 rounded-lg text-sm leading-relaxed border animate-fadeIn ${
                            isCorrect
                              ? 'bg-emerald-900/30 text-emerald-200 border-emerald-500/30'
                              : 'bg-rose-900/30 text-rose-200 border-rose-500/30'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1 mb-1">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>정답 해설:</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>오답 분석:</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-300">{quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 완료 시 카드 빌더 이동 버튼 */}
              {quizSolvedCount === 3 && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>환각 탐지관 3문항 완료!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('builder')}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <span>실시간 디지털 검증 카드 발급하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: 실시간 디지털 검증 카드 생성기 & 그래픽 프리뷰 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'builder' && (
            <div className="space-y-4 animate-fadeIn">
              {/* 입력 폼 컴팩트 에디터 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    디지털 검증 카드 실시간 편집기
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    실시간 프리뷰 연동
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">검증 대상 주제</label>
                    <input
                      type="text"
                      value={cardData.topic}
                      onChange={(e) => handleCardDataChange('topic', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-0.5">AI 주장 1 &amp; 2 (정상 사실)</label>
                      <input
                        type="text"
                        value={cardData.claim1}
                        onChange={(e) => handleCardDataChange('claim1', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 mb-1.5"
                      />
                      <input
                        type="text"
                        value={cardData.claim2}
                        onChange={(e) => handleCardDataChange('claim2', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-rose-600 mb-0.5">AI 주장 3 (환각 거짓말)</label>
                      <input
                        type="text"
                        value={cardData.claim3}
                        onChange={(e) => handleCardDataChange('claim3', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-rose-300 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-rose-50/40 text-rose-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-0.5">교차 출처 1</label>
                      <input
                        type="text"
                        value={cardData.source1}
                        onChange={(e) => handleCardDataChange('source1', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-0.5">교차 출처 2</label>
                      <input
                        type="text"
                        value={cardData.source2}
                        onChange={(e) => handleCardDataChange('source2', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-0.5">최종 교정 문장</label>
                    <textarea
                      rows={2}
                      value={cardData.finalCorrection}
                      onChange={(e) => handleCardDataChange('finalCorrection', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 실시간 그래픽 렌더링 카드 (Fact-Check ID Badge) */}
              <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 shadow-2xl relative overflow-hidden space-y-3">
                {/* 배경 워터마크 배지 */}
                <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-40 h-40 text-cyan-400" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-sm font-mono font-bold tracking-widest text-cyan-300 uppercase">
                      FACT-CHECK VERIFIED ID
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">#FC-2026-L01</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 block">TOPIC</span>
                  <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">{cardData.topic}</h4>
                </div>

                {/* 주장 리스트 */}
                <div className="space-y-1.5 text-sm font-sans">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{cardData.claim1}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{cardData.claim2}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span className="text-rose-200 line-through">{cardData.claim3}</span>
                  </div>
                </div>

                {/* 교차 검증 출처 */}
                <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 flex flex-wrap gap-2">
                  <span className="text-cyan-400 font-semibold">출처:</span>
                  <span>{cardData.source1}</span>
                  <span>•</span>
                  <span>{cardData.source2}</span>
                </div>

                {/* 최종 교정문 하이라이트 박스 */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 space-y-1">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    VERIFIED HUMAN CORRECTION
                  </span>
                  <p className="text-sm text-emerald-100 leading-relaxed font-medium">
                    {cardData.finalCorrection}
                  </p>
                </div>

                {/* 카드 액션 버튼 */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>마크다운 다운로드</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-all border border-slate-700"
                  >
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 3: 체크리스트 & 언락 게이트 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">COMPLETION GATE</span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">학습 체크리스트 (6대 기준)</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {checkedCount}/6 ({progressPercent}%)
                </span>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200 overflow-hidden">
                <div
                  className={`bg-gradient-to-r from-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-300 ${getProgressWidthClass(
                    checkedCount
                  )}`}
                />
              </div>

              {/* 6개 체크박스 */}
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => {
                  const isChecked = Boolean(checkedItems[item.id]);
                  return (
                    <label
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                          : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCheck(item.id)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <span className="text-sm sm:text-base leading-snug text-slate-700">{item.text}</span>
                    </label>
                  );
                })}
              </div>

              {/* 게이트 상태 배너 */}
              {isAllChecked ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span className="inline-flex items-center gap-2 font-bold"><PartyPopper className="w-5 h-5 text-emerald-600" />1강 완주 달성! 2강 게이트가 열렸습니다.</span>
                  </div>
                  <p className="text-sm text-emerald-700 leading-tight">
                    모든 검증 기준을 완수했습니다. 나만의 판타지 캐릭터와 세계관 프롬프트를 만드는 2강으로 떠나보세요!
                  </p>
                  <a
                    href="/lessons/02-better-prompts/index.html"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all animate-pulse"
                  >
                    <span>2강 지금 시작하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-sm">6개 항목 중 {6 - checkedCount}개 남음</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed">
                    2강 잠김
                  </span>
                </div>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Lesson01;
