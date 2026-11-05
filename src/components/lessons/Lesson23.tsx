import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Target,
  ShieldCheck,
  AlertTriangle,
  GitPullRequest,
  Code2,
  Search,
  FlaskConical,
  Kanban,
  CheckSquare,
  UserCheck,
  Wrench,
  Mic,
  Play,
  RotateCcw,
  BarChart2,
  CheckCircle2,
  CheckCircle,
  Copy,
  Lock,
  Unlock,
  ArrowRight,
  Info,
  BookOpen,
  Repeat,
  Bug,
  MessageCircle,
  Compass,
  Award,
  Home
} from 'lucide-react';

interface TesterLog {
  time: string;
  speaker: string;
  text: string;
}

interface TesterPersona {
  id: string;
  name: string;
  avatar: string;
  desc: string;
  logsBefore: TesterLog[];
  logsAfter: TesterLog[];
}

const TESTERS: Record<string, TesterPersona> = {
  seoyeon: {
    id: 'seoyeon',
    name: '서연이 (성격 급함)',
    avatar: '⚡',
    desc: '"엔터 쳤는데 왜 바로 답 안 나와? 멈춘 줄 알고 새로고침했잖아!"',
    logsBefore: [
      { time: '10:02:11', speaker: '서연', text: '일단 질문창에 "배고파 뭐 먹지?" 쳤어.' },
      { time: '10:02:13', speaker: '서연', text: '어? 전송 눌렀는데 화면에 아무 반응이 없는데? (멈칫)' },
      { time: '10:02:15', speaker: '서연', text: '야 이거 고장 난 거 아냐? 나 새로고침 누를래!' },
      { time: '10:02:18', speaker: '시스템', text: '🚨 사용성 허들 발견: 생각 중 시각 피드백 부재로 인한 조기 이탈!' }
    ],
    logsAfter: [
      { time: '10:05:02', speaker: '서연', text: '질문창에 "배고파 뭐 먹지?" 입력!' },
      { time: '10:05:03', speaker: '서연', text: '오! 전송 누르자마자 "생각 중... 💭" 점 3개가 퐁퐁 튀네!' },
      { time: '10:05:05', speaker: '서연', text: '기다리는 동안 귀여워서 쳐다보게 된다! 바로 답변 나왔어!' },
      { time: '10:05:06', speaker: '시스템', text: '✨ 사용성 개선 완료: 로딩 인디케이터로 불안감 100% 해소!' }
    ]
  },
  minwoo: {
    id: 'minwoo',
    name: '민우 (초보 사용자)',
    avatar: '🔍',
    desc: '"처음 들어왔는데 하얀 화면만 있어서 뭘 쳐야 할지 멍하니 있었어."',
    logsBefore: [
      { time: '10:11:05', speaker: '민우', text: '화면 열렸는데... 어... 어디를 눌러야 해? (10초간 멈춤)' },
      { time: '10:11:15', speaker: '민우', text: '뭐라고 질문해야 대답해 주는지 힌트가 하나도 없어서 막막해.' },
      { time: '10:11:22', speaker: '시스템', text: '🚨 사용성 허들 발견: 빈 화면(Empty State)으로 인한 진입 장벽!' }
    ],
    logsAfter: [
      { time: '10:14:20', speaker: '민우', text: '오! 화면 켜지자마자 추천 질문 칩 3개가 바로 뜨네?' },
      { time: '10:14:23', speaker: '민우', text: '키보드 칠 필요 없이 "🍳 10분 아침 요리" 칩 눌렀더니 즉시 대화 시작!' },
      { time: '10:14:27', speaker: '시스템', text: '✨ 사용성 개선 완료: 온보딩 추천 칩으로 첫 사용자 참여율 극대화!' }
    ]
  },
  junho: {
    id: 'junho',
    name: '준호 (장난꾸러기)',
    avatar: '🚀',
    desc: '"엄청 긴 글자를 100글자 넘게 연속으로 쳤더니 말풍선이 깨졌어!"',
    logsBefore: [
      { time: '10:20:01', speaker: '준호', text: '"가나다라마바사아자차카타파하..." 150글자 복사해서 보냈다!' },
      { time: '10:20:03', speaker: '준호', text: '우와! 말풍선이 화면 오른쪽 밖으로 삐져나가서 글씨가 잘렸어!' },
      { time: '10:20:06', speaker: '시스템', text: '🚨 사용성 허들 발견: 긴 텍스트 자동 줄바꿈(break-words) 누락!' }
    ],
    logsAfter: [
      { time: '10:25:10', speaker: '준호', text: '다시 150글자 폭탄 전송!' },
      { time: '10:25:12', speaker: '준호', text: '어라? 긴 글자가 말풍선 안에서 예쁘게 자동 줄바꿈되네? 안 깨져!' },
      { time: '10:25:15', speaker: '시스템', text: '✨ 사용성 개선 완료: CSS break-words & 예외 에어백 장착!' }
    ]
  }
};

interface TriageItem {
  id: string;
  title: string;
  correct: string;
  userChoice: string | null;
}

const INITIAL_TRIAGE_ITEMS: TriageItem[] = [
  { id: 'fb1', title: 'FB-01. AI 답변 만드는 동안 화면 멈춘 줄 알고 새로고침함', correct: 'P0', userChoice: null },
  { id: 'fb2', title: 'FB-02. 처음 화면 켰을 때 무슨 질문을 해야 할지 막막함', correct: 'P1', userChoice: null },
  { id: 'fb3', title: 'FB-03. 글씨 배경색을 민트색이나 보라색으로 바꿔주면 좋겠음', correct: 'P2', userChoice: null },
  { id: 'fb4', title: 'FB-04. 100자 넘는 긴 문장 입력 시 말풍선이 화면 밖으로 탈출함', correct: 'P0', userChoice: null },
  { id: 'fb5', title: 'FB-05. 복사 버튼이 너무 작아서 손가락으로 누르기 힘듦', correct: 'P1', userChoice: null },
  { id: 'fb6', title: 'FB-06. 햄스터 말고 귀여운 아기 공룡 캐릭터도 추가해 줬으면 함', correct: 'P2', userChoice: null }
];

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';

export const Lesson23: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  // 탭 상태
  const [activeTab, setActiveTab] = useState<'testroom' | 'triage' | 'checklist'>('testroom');

  // 시뮬레이터 상태
  const [currentTesterId, setCurrentTesterId] = useState<string>('seoyeon');
  const [isPatchActive, setIsPatchActive] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<TesterLog[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 트리아지 상태
  const [triageItems, setTriageItems] = useState<TriageItem[]>(INITIAL_TRIAGE_ITEMS);

  // 체크리스트 상태
  const [checkedList, setCheckedList] = useState<boolean[]>([false, false, false, false, false, false]);

  // 토스트 상태
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 기존 완료 상태 복원
  useEffect(() => {
    const isCompleted = localStorage.getItem('ai_lesson_23_completed') === 'true';
    if (isCompleted) {
      setCheckedList([true, true, true, true, true, true]);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 테스터 전환
  const handleSelectTester = (id: string) => {
    setCurrentTesterId(id);
    setSimulationLogs([]);
  };

  // 친절 패치 토글
  const handleTogglePatch = () => {
    const nextState = !isPatchActive;
    setIsPatchActive(nextState);
    setSimulationLogs([]);
    if (nextState) {
      showToast('✨ 3대 친절 UX 패치(온보딩+로딩점+에러복구)가 적용되었습니다!');
    } else {
      showToast('일반 초기 빌드 모드로 복귀했습니다.');
    }
  };

  // 시뮬레이션 실행
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    const tester = TESTERS[currentTesterId];
    const logs = isPatchActive ? tester.logsAfter : tester.logsBefore;

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          setIsSimulating(false);
        }
      }, (idx + 1) * 600);
    });
  };

  // 시뮬레이션 리셋
  const handleResetSimulation = () => {
    setSimulationLogs([]);
  };

  // 트리아지 분류
  const handleAssignTriage = (itemId: string, grade: string) => {
    setTriageItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, userChoice: grade } : it))
    );
  };

  // 트리아지 완료 여부
  const triageCompletedCount = triageItems.filter(it => it.userChoice !== null).length;
  const isTriageComplete = triageCompletedCount === triageItems.length;

  const triageReportData = {
    lesson: 'Lesson 23 Usability Test & Triage',
    timestamp: new Date().toISOString(),
    summary: {
      p0_critical_bugs: triageItems.filter(it => it.userChoice === 'P0').map(it => it.title),
      p1_important_improvements: triageItems.filter(it => it.userChoice === 'P1').map(it => it.title),
      p2_future_backlog: triageItems.filter(it => it.userChoice === 'P2').map(it => it.title)
    },
    status: 'RC-Ready (Release Candidate Approved)'
  };

  const handleCopyTriageReport = () => {
    navigator.clipboard.writeText(JSON.stringify(triageReportData, null, 2)).then(() => {
      showToast('📋 트리아지 리포트 JSON이 클립보드에 복사되었습니다!');
    });
  };

  // 체크리스트 핸들러
  const handleCheckItem = (index: number) => {
    const updated = [...checkedList];
    updated[index] = !updated[index];
    setCheckedList(updated);

    const checkedCount = updated.filter(Boolean).length;
    if (checkedCount === 6) {
      localStorage.setItem('ai_lesson_23_completed', 'true');
      showToast('🎉 23강 완주 완료! 최종 24강 해커톤 데모 데이가 잠금 해제되었습니다!');
    } else {
      localStorage.removeItem('ai_lesson_23_completed');
    }
  };

  const checkedCount = checkedList.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);

  // 테스터 정보
  const currentTester = TESTERS[currentTesterId];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* =================================================================== */}
      {/* [상단 고정 GNB 헤더 (Wanted Montage Global Nav Bar)]                  */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-[1720px] h-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>

            <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1"></div>

            <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <a href="../../index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">홈</a>
              <span className="text-slate-300">/</span>
              <a href="../22-chatbot-beta/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">22강 베타 빌드</a>
              <span className="text-slate-300">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">23강 사용성 테스트</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span className="text-indigo-600 font-mono font-bold text-xs">{progressPct}%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>

        {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage1'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>사용자 관찰 작전</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage2'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>3대 사용성 허들</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage3'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>피드백 트리아지</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage4'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>친절 UX 패치</span>
          </button>
        </nav>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                progressPct === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {progressPct === 100 ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>24강 언락</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>24강 잠김</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* [메인 워크스페이스: 2-패널 독립 슬라이드바 스플릿 뷰]                  */}
      {/* =================================================================== */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        
        {/* ----------------------------------------------------------------- */}
        {/* [좌측 패널 (60% 폭)] 퀘스트 가이드 & 4단계 강의 교재                  */}
        {/* ----------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 사용자 관찰 작전] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="montage-lesson-hero p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white relative overflow-hidden shadow-lg border border-slate-800">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>시즌 4 · 23강 / 총 24강</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  친구들의 냉정한 맛보기 평가: 솔직한 피드백으로 완성도 200% 올리기
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  내가 직접 만든 챗봇은 내 눈에는 너무 쉽고 완벽해 보입니다. 하지만 처음 사용하는 친구는 
                  어디를 눌러야 할지 머뭇거립니다. 친구 2명에게 직접 사용해보게 하고, '생각 말하기(Think-Aloud)' 
                  기법으로 숨은 버그를 찾아 소프트웨어를 200% 업그레이드해 봅시다!
                </p>
              </div>

              {/* 4구 메타 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <strong className="text-xs font-bold text-white leading-snug whitespace-nowrap">60분 (테스트+개선)</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block leading-tight whitespace-nowrap">테스트 대상</span>
                  <strong className="text-xs font-bold text-white leading-snug whitespace-nowrap">실제 친구 2명 (페르소나)</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block leading-tight whitespace-nowrap">핵심 분석</span>
                  <strong className="text-xs font-bold text-white leading-snug whitespace-nowrap">P0/P1 버그 트리아지</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <strong className="text-xs font-bold text-white leading-snug whitespace-nowrap">RC 빌드 &amp; 리포트</strong>
                </div>
              </div>

              {/* 4단계 스텝퍼 */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">오늘의 4단계 퀘스트 로드맵</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-medium flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span className="truncate">개발자의 함정 탈출</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-medium flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span className="truncate">3대 사용성 허들</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-medium flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span className="truncate">피드백 트리아지</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-medium flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                    <span className="truncate">3대 친절 패치</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* [Stage 1] 미션 브리핑 */}
          <article id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>STAGE 1. 미션 브리핑</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              개발자의 익숙함이라는 함정: "내가 만든 건 다 쉬워 보이는데?"
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              개발자는 코드를 한 줄 한 줄 직접 짰기 때문에, 어떤 질문을 해야 챗봇이 잘 대답하는지 이미 다 알고 있습니다. 
              하지만 처음 보는 친구에게 화면을 넘겨주면 어떤 일이 일어날까요? 
              <strong>"어? 이거 엔터 쳐야 해? 전송 버튼은 어디 있어?", "답변 나오는 동안 아무 반응이 없어서 멈춘 줄 알았어!"</strong> 
              하고 당황하기 일쑤입니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold">개발자의 시선</span>
                  <strong className="text-xs font-bold text-indigo-950">"당연히 알겠지!"</strong>
                </div>
                <ul className="text-xs text-indigo-900/80 space-y-1 list-disc list-inside">
                  <li>"아래 입력창에 질문 치고 비행기 아이콘 누르면 되잖아!"</li>
                  <li>"AI가 생각하는 1.5초는 당연히 기다려야지."</li>
                  <li>"질문은 2줄 이내로 명확하게 해야 좋은 답변이 나와."</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-600 text-white text-[10px] font-bold">친구의 시선</span>
                  <strong className="text-xs font-bold text-amber-950">"어디 눌러야 해...?"</strong>
                </div>
                <ul className="text-xs text-amber-900/80 space-y-1 list-disc list-inside">
                  <li>"하얀 빈 화면만 있어서 무슨 말을 걸어야 할지 모르겠어."</li>
                  <li>"버튼 눌렀는데 글씨가 바로 안 떠서 멈춘 줄 알고 새로고침했어."</li>
                  <li>"엄청 길게 물어봤더니 말풍선이 화면 밖으로 삐져나왔어!"</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>사용성 관찰의 3대 황금 규칙</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li><strong>입술 꾹 다물기 (절대 훈수 금지):</strong> 친구가 헤매더라도 "거기 누르면 안 돼!"라고 말하지 않고 조용히 관찰합니다.</li>
                <li><strong>생각 말하기 유도:</strong> "마음속으로 생각나는 말을 혼잣말처럼 소리 내어 말해줘!"라고 부탁합니다.</li>
                <li><strong>친구가 아닌 프로그램 탓하기:</strong> 친구가 못 찾는 것은 친구 탓이 아니라 내 버튼 배치가 불친절했기 때문입니다.</li>
              </ol>
            </div>
          </article>

              {/* Stage 1 Bottom Navigation */}
              <div className="flex justify-end items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage2');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 3대 사용성 허들</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 3대 사용성 허들] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* [Stage 2] 핵심 원리 */}
          <article id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>STAGE 2. 핵심 원리</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              친구들을 멈칫거리게 만드는 '3대 사용성 허들'과 명쾌한 해결책
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              소프트웨어 공학에서는 사용자가 작업을 진행하지 못하고 길을 잃는 지점을 <strong>'사용성 허들(Usability Hurdle)'</strong>이라고 부릅니다. 
              베타 챗봇을 테스트할 때 가장 빈번하게 발생하는 3대 허들을 살펴보고, 이를 어떻게 부드러운 디딤돌로 바꿀 수 있는지 알아봅시다.
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center font-bold">1</span>
                    <span>빈 화면의 침묵 (Empty State Horror)</span>
                  </strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">시작 허들</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>증상:</strong> 대화창이 텅 비어 있으면 사용자는 "여기에 무슨 질문을 해야 하지?" 하고 몇 초 동안 멈칫합니다.
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2 border border-emerald-200/60">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>해결책 (온보딩 추천 칩):</strong> 챗봇이 먼저 "안녕! 아래 질문 중 하나를 골라 눌러봐!" 하고 3가지 추천 질문 칩을 제시해 줍니다.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">2</span>
                    <span>생각 중 무반응 (Loading Silence)</span>
                  </strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">진행 허들</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>증상:</strong> 전송 버튼을 누른 후 AI 답변이 올 때까지 화면에 아무 변화가 없으면 사용자는 챗봇이 멈춘 줄 알고 버튼을 연타합니다.
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2 border border-emerald-200/60">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>해결책 (통통 튀는 생각 점):</strong> 즉시 'AI가 답변을 적고 있어요... 💭' 말풍선과 3개의 펄스 애니메이션 점을 띄워 기다림을 안심시킵니다.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
                    <span>차가운 빨간 오류 (Cold Error Crash)</span>
                  </strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">실패 허들</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>증상:</strong> 와이파이가 끊기거나 이상한 글자가 들어왔을 때 'Error 500' 같은 영어 외계어가 뜨면 친구는 겁을 먹고 창을 끕니다.
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2 border border-emerald-200/60">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>해결책 (따뜻한 재시도 버튼):</strong> "앗! 인터넷 신호가 잠시 약해졌어요. [다시 시도하기] 버튼을 눌러주세요!" 같은 친절한 복구 카드를 보여줍니다.</span>
                </div>
              </div>
            </div>
          </article>

              {/* 우측 사용성 테스트 룸 연동 알림 카드 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-cyan-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                    ACTION REQUIRED · 1단계 실습 미션
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      지금 우측 콘솔의 [사용성 테스트 룸]에서 맛보기 평가를 진행하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    친구나 가족에게 내 챗봇을 건네주고 첫인상과 반응을 관찰하는 '사용자 테스팅'을 시작할 차례입니다. 우측 콘솔의 <strong>[사용성 테스트 룸]</strong>에서 안내 가이드를 띄우고 테스트 질문 3가지를 직접 던져보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('testroom')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [사용성 테스트 룸] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stage 2 Bottom Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage1');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 1 사용자 관찰 작전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 피드백 트리아지</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 피드백 트리아지] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* [Stage 3] 실전 전략 */}
          <article id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <GitPullRequest className="w-4 h-4" />
              <span>STAGE 3. 실전 전략</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              피드백 트리아지(Bug Triaging): 응급실 의사처럼 우선순위 정하기
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              테스트가 끝나면 친구들은 "이거 버튼 색이 마음에 안 들어", "질문 길게 치니까 멈췄어", "음악도 나오게 해줘" 등 
              수십 가지 피드백을 쏟아냅니다. 모든 것을 한 번에 다 고칠 수는 없습니다. 
              응급실에서 가장 위급한 환자부터 치료하듯, 버그도 **P0(긴급), P1(중요), P2(여유)**로 나누어 처리해야 합니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 bg-slate-50">
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">등급 (Priority)</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">버그 성격</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">실제 예시</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">대응 행동</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">P0 (치명적)</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">프로그램 중단, 대화 불가</td>
                    <td className="py-2.5 px-3 text-slate-700">"긴 문장 전송 시 흰 화면만 뜸", "전송 버튼 먹통"</td>
                    <td className="py-2.5 px-3 text-rose-600 font-bold">지금 즉시 당장 수정!</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">P1 (중요 개선)</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">사용하기 많이 불편함</td>
                    <td className="py-2.5 px-3 text-slate-700">"로딩 표시가 없어 답답함", "모바일에서 버튼이 너무 작음"</td>
                    <td className="py-2.5 px-3 text-amber-700 font-bold">오늘 안으로 해결</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">P2 (사소함/아이디어)</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">개인 취향, 새로운 기능 제안</td>
                    <td className="py-2.5 px-3 text-slate-700">"글씨 색을 민트색으로 해줘", "음악 플레이어 넣어줘"</td>
                    <td className="py-2.5 px-3 text-slate-500 font-medium">다음 버전 백로그에 기록</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

              {/* 우측 피드백 트리아지 연동 알림 카드 */}
              <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/40 p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-400/40 uppercase">
                    ACTION REQUIRED · 2단계 실습 미션
                  </span>
                  <span className="text-xs text-indigo-300 font-mono font-bold">지금 수행할 차례!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      의견을 수집했다면 우측 [피드백 트리아지]에서 응급 우선순위를 분류하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    친구들의 쏟아지는 의견 중 당장 고칠 '빨간 불(Critical)'과 나중에 할 '초록 불'을 가려낼 시간입니다! 우측 콘솔의 <strong>[피드백 트리아지]</strong> 탭에서 피드백 카드를 3개 등급으로 분류하고 최종 개선 계획을 확정하세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('triage')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [피드백 트리아지] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stage 3 Bottom Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage2');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 2 3대 사용성 허들
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 친절 UX 패치</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 친절 UX 패치] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* [Stage 4] 업그레이드 실습 */}
          <article id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>STAGE 4. 업그레이드 실습</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              피드백을 코드로 바꾸기: 3대 친절 UX 패치 기법
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              우측 실습 콘솔에서 수집한 피드백을 바탕으로, 챗봇을 한층 더 다정하게 만들어주는 
              3대 핵심 패치 로직을 살펴봅시다.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 font-mono">1. 온보딩 추천 칩 렌더링</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">UX Patch 01</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`// 처음 입장한 친구에게 3가지 추천 질문을 선물해 부담을 줄여줍니다.
function renderWelcomeChips(bot) {
  return \`
    <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs">
      <p class="font-bold text-indigo-900 mb-2">\${bot.welcome}</p>
      <div class="flex flex-wrap gap-1.5">
        \${bot.chips.map(chip => \`
          <button onclick="sendQuickMessage('\${chip}')" 
                  class="px-2.5 py-1 rounded-lg bg-white border text-indigo-600 font-medium hover:bg-indigo-600 hover:text-white transition-all">
            ✨ \${chip}
          </button>
        \`).join('')}
      </div>
    </div>
  \`;
}`}
              </pre>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 font-mono">2. 생각 중 타이핑 닷(Typing Dots)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">UX Patch 02</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`// AI가 답을 만드는 동안 3개의 점이 통통 튀며 안심을 선물합니다.
function createTypingBubble() {
  return \`
    <div class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border text-xs text-slate-500 shadow-xs">
      <span class="font-bold text-slate-700">AI 생각 중</span>
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
    </div>
  \`;
}`}
              </pre>
            </div>
          </article>

              {/* Stage 4 Bottom Navigation */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  ← 이전: Stage 3 피드백 트리아지
                </button>
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
                  JUNIOR DEVELOPER GLOSSARY · 23강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 QA·사용자 경험 연구원들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 사용자 사용성 테스트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      1. 사용자 사용성 테스트
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 사용성 테스트 (Usability Testing)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">UX 리서치</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "새로 만든 보드게임을 친구들에게 먼저 시켜보고, 설명서 없이도 재미있게 잘 노는지 지켜보는 관찰 카메라!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 실제 사용자가 제품을 조작하는 과정을 관찰하여 인터페이스의 사용하기 어려운 점, 헷갈리는 요소를 정밀하게 발견하고 개선점을 도출하는 검증 테스트입니다.
                </p>
              </div>
              {/* 용어 2: 피드백 루프 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-sky-400" />
                      2. 피드백 루프
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 피드백 루프 (Feedback Loop & Iteration)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">애자일/개선주기</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "메아리산에서 '야호!' 외치면 되돌아오는 메아리를 듣고 내 목소리 크기를 다듬어가는 둥근 순환 고리!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자의 반응, 오류 로그, 제안 사항을 수집하여 제품에 반영하고 다시 테스트하는 일련의 점진적 개선 반복 사이클입니다.
                </p>
              </div>
              {/* 용어 3: 버그 우선순위 분류 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-emerald-400" />
                      3. 버그 우선순위 분류
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 버그 트리아지 (Bug Triaging & Scoring)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">품질 관리/이슈</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "응급실 의사 선생님이 가장 아픈 환자부터 먼저 치료하듯, 프로그램이 멈추는 큰 고장부터 먼저 고치는 순서표!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 발견된 결함과 개선 요청의 심각도(Severity)와 발생 빈도를 평가하여, 개발 자원을 가장 효율적으로 집중할 수 있도록 처리 우선순위를 체계적으로 결정하는 회의 프로세스입니다.
                </p>
              </div>
              {/* 용어 4: 생각 말하기 기법 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                      4. 생각 말하기 기법
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: 싱크 얼라우드 프로토콜 (Think-Aloud Protocol)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">인터뷰/행동분석</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "마음속으로 생각하는 혼잣말을 입 밖으로 소리 내어 말하면서, 어디서 헤매고 있는지 연구원에게 알려주는 투명한 마음 방송!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 피험자가 과업을 수행하는 동안 머릿속에 떠오르는 모든 생각, 당혹감, 의도를 가감 없이 말로 표현하게 하여 심리적 병목을 분석하는 UX 연구 기법입니다.
                </p>
              </div>
              {/* 용어 5: 온보딩 가이드 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-rose-400" />
                      5. 온보딩 가이드
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 온보딩 UX (Onboarding Experience)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">첫인상/안내</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "놀이공원 입구에서 친절한 안내원 언니가 손을 잡고 첫 번째 놀이기구까지 데려다주는 친절한 가이드!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 처음 앱을 실행한 신규 사용자가 헤매지 않고 핵심 가치를 단번에 경험할 수 있도록 튜토리얼 칩, 예시 질문, 빈 화면 안내를 제공하는 첫인상 설계 기법입니다.
                </p>
              </div>
              {/* 용어 6: 배포 후보 버전 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-teal-400" />
                      6. 배포 후보 버전
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: RC 버전 (Release Candidate - RC Build)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">릴리즈/최종후보</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "최종 시험 직전 마지막 모의고사! 더 이상 큰 고장이 발견되지 않으면 그대로 백 점짜리 상장에 도장을 쾅 찍을 완성품!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 치명적 버그가 모두 해결되어 정식 상용 출시(Gold Master)가 가능한 상태로 간주되는 소프트웨어 최종 후보 빌드 단계입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* ----------------------------------------------------------------- */}
        {/* [우측 패널 (40% 폭)] 인터랙티브 실습 콘솔 (3단 탭 독립 스크롤)          */}
        {/* ----------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          
          {/* 3단 탭 내비게이션 바 */}
          <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 backdrop-blur-sm border border-slate-300/60 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setActiveTab('testroom')}
              id="tab-btn-testroom"
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'testroom'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>사용성 테스트 룸</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('triage')}
              id="tab-btn-triage"
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'triage'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>피드백 트리아지</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              id="tab-btn-checklist"
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>23강 점검표</span>
            </button>
          </nav>

          {/* =============================================================== */}
          {/* [우측 탭 1] 실전 사용성 테스트 룸                                 */}
          {/* =============================================================== */}
          {activeTab === 'testroom' && (
            <div id="tab-panel-testroom" className="space-y-4 relative">
              
              {/* 플로팅 토스트 */}
              {toastMessage && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>{toastMessage}</span>
                </div>
              )}

              {/* 테스터 선택 바 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>가상 친구 테스터 선택 (3인 페르소나)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">관찰 대상 전환</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['seoyeon', 'minwoo', 'junho'] as const).map(id => {
                    const t = TESTERS[id];
                    const isSelected = currentTesterId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectTester(id)}
                        id={`btn-tester-${id}`}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xl mb-1">{t.avatar}</div>
                        <div className="text-xs truncate">{t.name.split(' ')[0]}</div>
                        <div className="text-[9px] text-slate-500 font-normal">
                          {id === 'seoyeon' ? '빠른 반응' : id === 'minwoo' ? '추천 필요' : '예외 입력'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 실전 관찰 모니터 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[460px]">
                <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span id="active-tester-avatar" className="text-lg">{currentTester.avatar}</span>
                    <div>
                      <strong id="active-tester-name" className="text-xs font-bold text-slate-900 block leading-tight">
                        {currentTester.name}의 관찰 카메라
                      </strong>
                      <span id="active-tester-desc" className="text-[10px] text-indigo-600 font-semibold">
                        {currentTester.desc}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-toggle-patch"
                    onClick={handleTogglePatch}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isPatchActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span id="text-patch-status">{isPatchActive ? '친절 패치: ON ✨' : '친절 패치: OFF'}</span>
                  </button>
                </div>

                <div id="tester-log-container" className="flex-1 p-3.5 space-y-2.5 overflow-y-auto custom-scrollbar bg-slate-50/50">
                  {simulationLogs.length === 0 ? (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-indigo-600" />
                        <span>생각 말하기(Think-Aloud) 음성 스트림</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        아래 [테스트 시뮬레이션 시작] 버튼을 누르면 {currentTester.name}의 실시간 관찰 반응이 기록됩니다.
                      </p>
                    </div>
                  ) : (
                    simulationLogs.map((log, idx) => {
                      const isSystem = log.speaker === '시스템';
                      return (
                        <div
                          key={idx}
                          className={
                            isSystem
                              ? 'p-3 rounded-xl bg-indigo-900 text-indigo-100 text-xs font-mono border border-indigo-700/60 flex items-start gap-2 shadow-xs'
                              : 'p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 space-y-1 shadow-xs'
                          }
                        >
                          {isSystem ? (
                            <span>{log.text}</span>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                  <span>{currentTester.avatar}</span>
                                  <span>{log.speaker}의 생각 말하기</span>
                                </span>
                                <span>{log.time}</span>
                              </div>
                              <p className="leading-relaxed font-medium">{log.text}</p>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-run-simulation"
                    disabled={isSimulating}
                    onClick={handleRunSimulation}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isSimulating ? '시뮬레이션 진행 중...' : '테스트 시뮬레이션 시작'}</span>
                  </button>
                  <button
                    type="button"
                    id="btn-reset-simulation"
                    onClick={handleResetSimulation}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>리셋</span>
                  </button>
                </div>
              </div>

              {/* 테스터 실시간 만족도 점수 카드 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>사용성 종합 지표 (Usability Score)</span>
                  </strong>
                  <span
                    id="score-summary-badge"
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isPatchActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isPatchActive ? '종합 지표: 95점' : '초기 상태: 45점'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">조작 직관성 (첫 입장 시 망설임 없음)</span>
                      <span id="score-intuit-text" className="font-bold text-slate-800">
                        {isPatchActive ? '90%' : '40%'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        id="score-intuit-bar"
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: isPatchActive ? '90%' : '40%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">반응 안정감 (AI 생각 중 안심 피드백)</span>
                      <span id="score-speed-text" className="font-bold text-slate-800">
                        {isPatchActive ? '95%' : '35%'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        id="score-speed-bar"
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: isPatchActive ? '95%' : '35%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">오류 회복력 (예외 발생 시 재시도 안내)</span>
                      <span id="score-recovery-text" className="font-bold text-slate-800">
                        {isPatchActive ? '100%' : '50%'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        id="score-recovery-bar"
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: isPatchActive ? '100%' : '50%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* [우측 탭 2] 피드백 트리아지 보드                                  */}
          {/* =============================================================== */}
          {activeTab === 'triage' && (
            <div id="tab-panel-triage" className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Kanban className="w-3.5 h-3.5 text-indigo-600" />
                    <span>친구들의 피드백 6종 트리아지(우선순위 분류)</span>
                  </span>
                  <span
                    id="triage-status-badge"
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isTriageComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {triageCompletedCount} / 6 완료
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  친구들이 남긴 6개의 피드백을 읽고 <strong>[P0 긴급]</strong>, <strong>[P1 중요]</strong>, <strong>[P2 사소/제안]</strong> 중 올바른 상자에 분류해 보세요!
                </p>
              </div>

              <div id="triage-cards-container" className="space-y-2.5">
                {triageItems.map(item => {
                  const isChosen = item.userChoice !== null;
                  const isCorrect = item.userChoice === item.correct;
                  return (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{item.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            !isChosen
                              ? 'bg-slate-100 text-slate-500'
                              : isCorrect
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {!isChosen ? '미분류' : `${item.userChoice} (${isCorrect ? '적절함 🟢' : '재조정 필요 🔴'})`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAssignTriage(item.id, 'P0')}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all border ${
                            item.userChoice === 'P0'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                          }`}
                        >
                          P0 긴급
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignTriage(item.id, 'P1')}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all border ${
                            item.userChoice === 'P1'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          P1 중요
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignTriage(item.id, 'P2')}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all border ${
                            item.userChoice === 'P2'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                          }`}
                        >
                          P2 아이디어
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isTriageComplete && (
                <div id="triage-report-card" className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>트리아지 완료! RC 빌드 반영 계획서</span>
                    </span>
                    <button
                      type="button"
                      id="btn-copy-triage-report"
                      onClick={handleCopyTriageReport}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>리포트 복사</span>
                    </button>
                  </div>
                  <pre id="triage-report-json" className="text-[10px] font-mono text-indigo-200 bg-slate-950 p-2.5 rounded-xl overflow-x-auto">
                    {JSON.stringify(triageReportData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* [우측 탭 3] 23강 점검표 & 24강 최종 언락 게이트                   */}
          {/* =============================================================== */}
          {activeTab === 'checklist' && (
            <div id="tab-panel-checklist" className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>23강 사용성 테스트 완주 점검표</span>
                  </span>
                  <span id="right-check-progress-text" className="text-xs font-mono font-bold text-indigo-600">
                    {checkedCount} / 6 ({progressPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    id="right-check-progress-fill"
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  모든 항목을 직접 체크하고 완료하면 최종 24강 주니어 AI 해커톤 데모 데이로 진입할 수 있어요!
                </p>
              </div>

              <div data-checklist-lesson="lesson_23" className="space-y-2.5">
                {[
                  {
                    title: '1. 개발자의 함정과 사용성 테스트 이해',
                    desc: '내가 만든 코드는 내 눈에만 익숙하다는 사실을 알고, 실제 사용자를 직접 관찰해야 하는 이유를 배웠다.'
                  },
                  {
                    title: '2. 생각 말하기(Think-Aloud) 관찰법 습득',
                    desc: '테스터가 마음속 생각을 입 밖으로 말하게 유도하고, 설명하거나 화내지 않고 관찰하는 황금률을 익혔다.'
                  },
                  {
                    title: '3. 3대 사용성 허들(침묵·무반응·오류) 분석',
                    desc: '빈 화면, 생각 중 무반응, 차가운 에러가 사용자를 당황하게 만드는 주요 원인임을 파악했다.'
                  },
                  {
                    title: '4. 피드백 트리아지(P0, P1, P2) 우선순위 분류',
                    desc: '쏟아지는 피드백을 감정이 아닌 치명도와 긴급도에 따라 체계적으로 분류하는 법을 실습했다.'
                  },
                  {
                    title: '5. 온보딩 칩 & 로딩 닷 친절 패치 확인',
                    desc: '환영 칩, 통통 튀는 생각 중 점, 친절한 재시도 버튼이 사용자 만족도를 200% 올려줌을 확인했다.'
                  },
                  {
                    title: '6. 최종 배포 후보(RC 빌드) 완성',
                    desc: '버그가 정리된 상태로 최종 24강 데모 데이 발표를 맞이할 준비를 마쳤다.'
                  }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checkedList[idx]}
                      onChange={() => handleCheckItem(idx)}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <div className="text-xs leading-relaxed text-slate-800">
                      <strong className="font-bold text-slate-900 block mb-0.5">{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {progressPct === 100 && (
                <div id="completion-card" className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold block leading-tight">
                        🎉 23강 실전 사용성 테스트 완주!
                      </strong>
                      <span className="text-xs text-indigo-100">
                        친구들의 피드백을 멋지게 반영하여 챗봇 완성도를 200% 끌어올렸습니다.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex flex-col sm:flex-row gap-2">
                    <a
                      href="../24-hackathon-demoday/index.html"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white text-indigo-700 font-bold text-xs text-center hover:bg-indigo-50 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>최종 24강 해커톤 데모 데이 도전!</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="../../index.html"
                      className="py-2.5 px-3 rounded-xl bg-white/10 text-white font-bold text-xs text-center hover:bg-white/20 transition-colors"
                    >
                      과정 홈
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

        </aside>

      </main>
    </div>
  );
};

export default Lesson23;
