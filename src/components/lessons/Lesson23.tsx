import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Award,
  RotateCcw,
  Copy,
  Check,
  Bot,
  Lightbulb,
  Layers,
  Send,
  Volume2,
  Bell,
  Palette,
  Compass,
  BookOpen,
  User,
  Terminal,
  Gem,
  Play,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Smile,
  Frown,
  CheckCircle2,
  Activity,
  Sliders,
  Flag,
  ShieldAlert,
  Search,
  MessageSquare
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type PersonaKey = 'seoyeon' | 'minwoo' | 'junho';

interface TestLogItem {
  time: string;
  text: string;
  type: 'thought' | 'thought_good' | 'action_bad' | 'action_good' | 'complaint';
}

interface PersonaData {
  name: string;
  avatar: string;
  desc: string;
  scenarioUnpatched: TestLogItem[];
  scenarioPatched: TestLogItem[];
  scoreUnpatched: { stars: string; score: number; badge: string; summary: string };
  scorePatched: { stars: string; score: number; badge: string; summary: string };
}

const PERSONAS: Record<PersonaKey, PersonaData> = {
  seoyeon: {
    name: '서연이 (성격 급함)',
    avatar: '⚡',
    desc: '답변 지연 시 멈춤으로 오인하고 즉시 새로고침',
    scenarioUnpatched: [
      { time: '00:01', text: '"어? 질문 입력하고 전송 눌렀는데 아무 반응이 없네?"', type: 'thought' },
      { time: '00:03', text: '"0.8초 동안 화면이 하얘... 멈춘 거 아냐? 고장 났나 봐!"', type: 'thought' },
      { time: '00:04', text: '서연이가 답답함을 참지 못하고 브라우저 새로고침(F5)을 연타했습니다!', type: 'action_bad' },
      { time: '00:06', text: '"휴... 질문 다시 쳐야 하잖아! 너무 불편해 ㅠㅠ"', type: 'complaint' }
    ],
    scenarioPatched: [
      { time: '00:01', text: '"오! 전송 누르자마자 [AI 생각 중... 💭] 닷 점이 통통 튀네!"', type: 'thought_good' },
      { time: '00:03', text: '"점 세 개가 춤추니까 생각 중인 게 한눈에 보여서 안심돼!"', type: 'thought_good' },
      { time: '00:04', text: '"바로 또박또박 답변이 올라오고 스피커로 소리까지 나와! 대박!"', type: 'thought_good' },
      { time: '00:06', text: '서연이가 엄지손가락을 치켜세우며 별점 5개를 주었습니다!', type: 'action_good' }
    ],
    scoreUnpatched: { stars: '★☆☆☆☆', score: 35, badge: 'P0 긴급 개선 필요', summary: '로딩 무반응으로 인해 새로고침을 유발하는 치명적 사용성 결함(P0)이 확인되었습니다.' },
    scorePatched: { stars: '★★★★★', score: 98, badge: '완성도 200% 달성!', summary: '통통 튀는 바운스 닷 애니메이션 덕분에 대기 불안감이 완전히 해소되었습니다!' }
  },
  minwoo: {
    name: '민우 (초보·조용함)',
    avatar: '🔍',
    desc: '빈 화면 앞에서 무슨 말을 걸지 몇 초간 망설임',
    scenarioUnpatched: [
      { time: '00:01', text: '"어... 하얀 빈 화면만 있어서 무슨 말을 걸어야 할지 모르겠어..."', type: 'thought' },
      { time: '00:05', text: '민우가 키보드에 손을 올린 채 5초 동안 멈칫거리고 있습니다.', type: 'action_bad' },
      { time: '00:08', text: '"힌트나 예시가 하나도 없어서 그냥 창을 닫고 싶어져..."', type: 'complaint' }
    ],
    scenarioPatched: [
      { time: '00:01', text: '"우와! 첫 화면에 [🍱 급식 메뉴], [☔ 날씨와 우산] 추천 칩이 딱 있네!"', type: 'thought_good' },
      { time: '00:02', text: '민우가 칩을 클릭하자마자 질문이 자동으로 전송되었습니다!', type: 'action_good' },
      { time: '00:04', text: '"타이핑 안 쳐도 바로 물어볼 수 있어서 초보자한테 너무 친절해!"', type: 'thought_good' }
    ],
    scoreUnpatched: { stars: '★★☆☆☆', score: 45, badge: 'P1 시작 허들 발견', summary: '빈 화면의 침묵(Empty State)으로 인해 초기 진입에 어려움을 겪고 있습니다.' },
    scorePatched: { stars: '★★★★★', score: 95, badge: '온보딩 완성!', summary: '웰컴 추천 칩 카드 덕분에 첫 접속자도 망설임 없이 즉각 대화를 시작합니다!' }
  },
  junho: {
    name: '준호 (장난꾸러기)',
    avatar: '🚀',
    desc: '외계어, 오타, 연속 공백을 입력해 시스템을 시험함',
    scenarioUnpatched: [
      { time: '00:01', text: '"크크루삥뽕 샬라샬라 외계어 쳐봐야지! 어떻게 되나 보자!"', type: 'thought' },
      { time: '00:02', text: '준호가 무의미한 외계어 문장을 전송했습니다.', type: 'action_bad' },
      { time: '00:03', text: '"차가운 빨간 오류 텍스트가 뜨거나 먹통이 됐어... 에이 재미없네."', type: 'complaint' }
    ],
    scenarioPatched: [
      { time: '00:01', text: '"외계어 장난을 쳤는데 챗봇이 다정하게 반응하네?!"', type: 'thought_good' },
      { time: '00:02', text: '"[이런 걸 물어보셨나요?] 하면서 추천 질문 버튼을 다시 띄워줘!"', type: 'thought_good' },
      { time: '00:04', text: '"장난쳐도 안 꺼지고 스스로 회복하다니 진짜 똑똑한 챗봇이다!"', type: 'action_good' }
    ],
    scoreUnpatched: { stars: '★★☆☆☆', score: 50, badge: 'P1 예외 처리 미흡', summary: '비정상 입력 시 사용자에게 당황감을 주는 에러 처리가 발견되었습니다.' },
    scorePatched: { stars: '★★★★★', score: 96, badge: '철벽 방어 달성!', summary: '친절한 폴백 안내창과 재시도 복구 카드로 어떤 돌발 행동도 포용합니다!' }
  }
};

const CHECKLIST_ITEMS = [
  '사용자가 입으로 생각을 소리 내어 말하며 사용하는 생각 말하기(Think-Aloud) 관찰법의 원리를 이해했다.',
  '사용자를 막아서는 3대 허들(빈 화면의 침묵, 로딩 무반응, 차가운 에러)이 왜 위험한지 설명할 수 있다.',
  '쏟아지는 친구들의 피드백을 P0(치명적 긴급), P1(중요), P2(사소함)로 나누는 피드백 트리아지(Triage) 기준을 익혔다.',
  'AI가 답변을 작성하는 동안 통통 튀는 생각 점(Typing Dots) 애니메이션을 띄워 대기 불안감을 없애는 법을 배웠다.',
  '첫 방문자가 망설이지 않도록 웰컴 추천 칩을 띄우고, 오타 장난에도 다정하게 되묻는 자가 치유 로직의 필요성을 체득했다.',
  '3대 친절 UX 패치를 모두 적용하여 최종 데모데이에 출품할 릴리스 후보(RC) 빌드를 성공적으로 마련했다.'
];

export const Lesson23: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [currentPersona, setCurrentPersona] = useState<PersonaKey>('seoyeon');
  const [friendlyPatch, setFriendlyPatch] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Simulation State
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<TestLogItem[]>([]);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simFinished, setSimFinished] = useState<boolean>(false);

  // Checklist State
  const [checklist, setChecklist] = useState<boolean[]>(() => {
    const saved = localStorage.getItem('ai_lesson_23_checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === CHECKLIST_ITEMS.length) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return new Array(CHECKLIST_ITEMS.length).fill(false);
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('ai_lesson_23_checklist', JSON.stringify(checklist));
    const allDone = checklist.every(Boolean);
    localStorage.setItem('ai_lesson_23_completed', allDone ? 'true' : 'false');
  }, [checklist]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleCheckItem = (index: number) => {
    setChecklist(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const completedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);
  const allCompleted = completedCount === CHECKLIST_ITEMS.length;

  const currentPersonaData = PERSONAS[currentPersona];

  // Start Usability Simulation
  const startSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSimRunning(true);
    setSimFinished(false);
    setSimLogs([]);
    setSimProgress(0);

    const scenario = friendlyPatch ? currentPersonaData.scenarioPatched : currentPersonaData.scenarioUnpatched;
    let step = 0;

    timerRef.current = setInterval(() => {
      if (step < scenario.length) {
        setSimLogs(prev => [...prev, scenario[step]]);
        step++;
        setSimProgress(Math.round((step / scenario.length) * 100));
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setSimRunning(false);
        setSimFinished(true);
      }
    }, 700);
  };

  const resetSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSimRunning(false);
    setSimFinished(false);
    setSimLogs([]);
    setSimProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ===================================================================== */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 규격)                               */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* 브랜드 및 타이틀 */}
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-600 tracking-wide uppercase">AI & Coding Curriculum</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">시즌 4 · 실전 프로젝트 완성</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                23강: 친구들의 냉정한 맛보기 평가: 솔직한 피드백으로 완성도 200% 올리기
              </h1>
            </div>
          </div>

          {/* 데스크톱 스테이지 네비게이션 */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeStage === 'stage1'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage1' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>미션 & 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeStage === 'stage2'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage2' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>사용성 관찰 실습실</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeStage === 'stage3'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage3' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeStage === 'stage4'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage4' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                4
              </span>
              <span>용어 & 자가점검</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeStage === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>전체 보기</span>
            </button>
          </nav>
        </div>

        {/* 모바일 탭 바 */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50/80">
          {(['stage1', 'stage2', 'stage3', 'stage4', 'all'] as StageTab[]).map((st, idx) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStage(st)}
              className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeStage === st ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              {st === 'all' ? (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>전체</span>
                </>
              ) : (
                <>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStage === st ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{st === 'stage1' ? '미션' : st === 'stage2' ? '관찰' : st === 'stage3' ? '퀘스트' : '점검'}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. 메인 단일 워크스페이스 컨테이너 (max-w-4xl)                          */}
      {/* ===================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* =================================================================== */}
        {/* STAGE 1: 미션 & 원리 (Mission Briefing & Core Principles)           */}
        {/* =================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            {/* 상단 타이틀 배너 */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-sm font-semibold backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Stage 1 · 발견의 시작</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug">
                친구들의 냉정한 맛보기 평가:<br />
                <span className="text-emerald-400">솔직한 피드백으로 완성도 200% 올리기</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                내가 만들 때는 완벽해 보였던 챗봇도, 친구나 부모님이 처음 만져보면 당황하며 멈칫거리는 순간이 생깁니다!
                사용자가 속으로 느끼는 당황스러움을 밖으로 끄집어내는 <strong className="text-white">생각 말하기(Think-Aloud) 관찰법</strong>과,
                쏟아지는 피드백을 침착하게 정리하는 <strong className="text-white">우선순위 분류(Triage)</strong>를 통해 최종 데모데이를 앞둔 최고의 릴리스 후보(RC)를 완성해 봅니다.
              </p>
            </div>

            {/* 미션 브리핑 카드 (도전 목표 3가지 - 소요 시간 표기 배제) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Flag className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  오늘의 3대 도전 미션 브리핑
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                    <h4 className="text-sm font-bold text-slate-900">생각 말하기 관찰법</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    친구에게 힌트를 주지 않고 조용히 지켜보며 어디서 멈칫거리는지 3대 보이지 않는 허들을 포착합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h4 className="text-sm font-bold text-slate-900">피드백 우선순위 분류</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    모든 불만을 다 고칠 순 없습니다! P0(치명적 긴급), P1(중요), P2(사소함)로 나누어 전략적으로 정리합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h4 className="text-sm font-bold text-slate-900">3대 친절 UX 패치 완성</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    로딩 바운스 닷, 웰컴 추천 칩, 자가 치유 안내창을 탑재하여 별점 5점짜리 릴리스 후보(RC)를 배포합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 핵심 개념 원리 탐구 카드 (3구리드 어린이 은유 + 개발자 원칙 알림) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  핵심 개념 원리 탐구: 사용자의 마음을 읽는 3가지 기술
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <MessageSquare className="w-5 h-5" />
                    <h4 className="text-sm font-bold">1. 생각 말하기 관찰법</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>🧸 은유: 마음을 읽는 초능력 마이크!</strong><br />
                    테스터 친구에게 "지금 무슨 생각 중인지 입 밖으로 중얼거리며 써줘!"라고 부탁하는 관찰 기술입니다. 설명해 주고 싶은 입을 꾹 참는 것이 핵심입니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-100 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <h4 className="text-sm font-bold">2. 3대 보이지 않는 허들</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>🧸 은유: 문 앞의 돌부리 3개!</strong><br />
                    아무것도 안 떠서 망설이는 <strong className="text-slate-900">빈 화면의 침묵</strong>, 0.8초 멈칫거림에 불안해지는 <strong className="text-slate-900">로딩 무반응</strong>, 오타를 내면 차갑게 거절하는 <strong className="text-slate-900">빨간 에러</strong>입니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Sliders className="w-5 h-5" />
                    <h4 className="text-sm font-bold">3. 피드백 분류 & 친절 패치</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>🧸 은유: 응급실 의사 선생님의 처방전!</strong><br />
                    멈춤을 유발하는 치명적인 버그(P0)부터 먼저 고치고, 온보딩 추천 칩과 통통 튀는 애니메이션으로 사포질하여 친구를 감동시킵니다.
                  </p>
                </div>
              </div>

              {/* 주니어 개발자 꿀팁 알림 */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <strong className="text-indigo-950 font-bold block">💡 주니어 개발자 골든 룰: 관찰할 때는 입을 꼭 다물기!</strong>
                  <p className="text-indigo-900 leading-relaxed">
                    친구가 "어? 이거 어디 눌러야 해?"라고 물어볼 때 바로 "거기 파란 버튼 눌러!"라고 가르쳐주면 테스트는 실패합니다!
                    친구가 멈칫거리는 바로 그 순간이 우리 앱의 사용성 결함을 발견할 수 있는 가장 소중한 황금 찬스이기 때문입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 단계 이동 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-100"
              >
                <span>다음: Stage 2 사용성 관찰 실습실로 가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 2: 가상 사용성 관찰 실습실 (Usability Lab Simulator)         */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            {/* 상단 안내 배너 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Stage 2 · 가상 사용성 관찰 및 피드백 트리아지 실습실
                  </h3>
                  <p className="text-sm text-slate-500">
                    3명의 테스터 페르소나가 내 챗봇을 사용할 때 느끼는 생생한 마음의 소리를 관찰하고, 친절 UX 패치 전후를 비교해 보세요!
                  </p>
                </div>
              </div>

              {/* 조작 컨트롤 바: 페르소나 선택 + 친절 UX 패치 토글 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                {/* 페르소나 선택 버튼 3개 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 shrink-0">테스터 선택:</span>
                  {(['seoyeon', 'minwoo', 'junho'] as PersonaKey[]).map(pKey => (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        setCurrentPersona(pKey);
                        resetSimulation();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        currentPersona === pKey
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{PERSONAS[pKey].avatar}</span>
                      <span>{PERSONAS[pKey].name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* 친절 UX 패치 토글 스위치 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">3대 친절 UX 패치:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFriendlyPatch(!friendlyPatch);
                      resetSimulation();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      friendlyPatch
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-100 border border-rose-200 text-rose-700'
                    }`}
                  >
                    {friendlyPatch ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>적용 완료 (RC 빌드)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>미적용 (원형)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 메인 관찰 시뮬레이터 뷰 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 좌측: 페르소나 프로필 및 시뮬레이션 제어 (5열) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-100">{currentPersonaData.avatar}</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{currentPersonaData.name}</h4>
                      <p className="text-sm text-slate-500">{currentPersonaData.desc}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-sm">
                    <span className="font-semibold text-slate-700 block">현재 테스트 환경 설정</span>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>• 로딩 애니메이션:</span>
                      <strong className={friendlyPatch ? 'text-emerald-600' : 'text-rose-600'}>
                        {friendlyPatch ? '바운스 닷 ON' : '화면 멈춤 (무반응)'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>• 웰컴 온보딩:</span>
                      <strong className={friendlyPatch ? 'text-emerald-600' : 'text-rose-600'}>
                        {friendlyPatch ? '추천 칩 카드 ON' : '하얀 빈 화면'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>• 예외 입력 처리:</span>
                      <strong className={friendlyPatch ? 'text-emerald-600' : 'text-rose-600'}>
                        {friendlyPatch ? '자가 치유 안내 ON' : '차가운 에러 문구'}
                      </strong>
                    </div>
                  </div>

                  {/* 관찰 실행 버튼 */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={simRunning}
                      onClick={startSimulation}
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>{simRunning ? '관찰 기록 중...' : '생각 말하기 관찰 시작!'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetSimulation}
                      className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 결과 요약 카드 (시뮬레이션 완료 시 표시) */}
                {simFinished && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">사용성 평가 결과</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        friendlyPatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {friendlyPatch ? currentPersonaData.scorePatched.badge : currentPersonaData.scoreUnpatched.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-black text-amber-500">
                        {friendlyPatch ? currentPersonaData.scorePatched.stars : currentPersonaData.scoreUnpatched.stars}
                      </span>
                      <span className="text-lg font-bold text-slate-800">
                        {friendlyPatch ? currentPersonaData.scorePatched.score : currentPersonaData.scoreUnpatched.score}점
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {friendlyPatch ? currentPersonaData.scorePatched.summary : currentPersonaData.scoreUnpatched.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* 우측: 실시간 생각 말하기 관찰 로그 화면 (7열) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[380px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold text-slate-900">생각 말하기 관찰 타임라인</span>
                    </div>
                    {simRunning && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        관찰 마이크 수음 중...
                      </span>
                    )}
                  </div>

                  {/* 로그 출력 영역 */}
                  <div className="space-y-2.5 min-h-[220px]">
                    {simLogs.length === 0 ? (
                      <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 space-y-2 text-sm">
                        <MessageSquare className="w-8 h-8 opacity-40" />
                        <span>[생각 말하기 관찰 시작!] 버튼을 눌러 테스트를 진행해 보세요.</span>
                      </div>
                    ) : (
                      simLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl text-sm leading-relaxed animate-fadeIn flex items-start gap-2.5 ${
                            log.type === 'thought'
                              ? 'bg-amber-50 border border-amber-200 text-amber-900'
                              : log.type === 'thought_good'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium'
                              : log.type === 'action_bad'
                              ? 'bg-rose-50 border border-rose-200 text-rose-900 font-semibold'
                              : log.type === 'action_good'
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="text-xs px-1.5 py-0.5 rounded bg-white/70 font-mono text-slate-500 shrink-0">
                            {log.time}
                          </span>
                          <span>{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 하단 트리아지 우선순위 매트릭스 미니 가이드 */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-800">
                    <strong className="block font-bold">P0 (Critical)</strong>
                    <span>새로고침·화면 멈춤</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-800">
                    <strong className="block font-bold">P1 (Important)</strong>
                    <span>첫 진입 침묵·오타 에러</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <strong className="block font-bold">P2 (Minor)</strong>
                    <span>글꼴 크기·미세 여백</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                ← 이전: Stage 1 미션 & 원리
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-100"
              >
                <span>다음: Stage 3 실전 AI 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 3: 실전 최신 AI 5대 킬러 퀘스트 (5 Killer Quests)             */}
        {/* =================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            {/* 상단 안내 배너 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Terminal className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Stage 3 · 실전 최신 AI 5대 킬러 퀘스트
                  </h3>
                  <p className="text-sm text-slate-500">
                    실제 ChatGPT나 Gemini 창을 띄워두고 바로 복사해 테스트해 보는 5대 친절 UX 패치 프롬프트 세트입니다!
                  </p>
                </div>
              </div>
            </div>

            {/* 5대 퀘스트 카드 리스트 */}
            <div className="space-y-6">

              {/* QUEST 01 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold tracking-wider uppercase">
                    QUEST 01 · 기획서 작성
                  </span>
                  <span className="text-sm font-semibold text-slate-400">관찰법 뼈대 구축</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  생각 말하기(Think-Aloud) 테스트 시나리오 기획서 자동 작성 마법
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  친구들에게 무엇을 시키고 어떤 질문을 던져야 할지 막막할 때, AI에게 10분짜리 사용성 관찰 대본을 작성해 달라고 요청합니다.
                </p>

                {/* 프롬프트 박스 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">Prompt (Click to Copy)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('q1', `[Goal] 초등/중학생 친구들을 대상으로 학교 생활 챗봇의 사용성을 관찰하기 위한 10분 생각 말하기(Think-Aloud) 테스트 시나리오를 작성해 줘.

[Actor] 나는 사용자의 조용한 관찰자이자 진행자야. 절대 정답을 먼저 가르쳐주지 않아.

[Condition]
1. 시작 전 친구의 긴장을 풀어주고 "지금 머릿속에 드는 생각을 소리 내어 중얼거리며 써봐!"라고 안내하는 환영 멘트를 작성해 줘.
2. 친구가 수행할 구체적인 3가지 미션(첫 접속 후 질문 찾기, 급식 물어보기, 긴 대화 시도하기)을 단계별로 제시해 줘.
3. 친구가 멈칫거리거나 당황할 때 진행자가 개입하지 않고 부드럽게 마음을 묻는 중립적인 질문 3가지를 포함해 줘.`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === 'q1' ? (
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal] 초등/중학생 친구들을 대상으로 학교 생활 챗봇의 사용성을 관찰하기 위한 10분 생각 말하기(Think-Aloud) 테스트 시나리오를 작성해 줘.

[Actor] 나는 사용자의 조용한 관찰자이자 진행자야. 절대 정답을 먼저 가르쳐주지 않아.

[Condition]
1. 시작 전 친구의 긴장을 풀어주고 "지금 머릿속에 드는 생각을 소리 내어 중얼거리며 써봐!"라고 안내하는 환영 멘트를 작성해 줘.
2. 친구가 수행할 구체적인 3가지 미션(첫 접속 후 질문 찾기, 급식 물어보기, 긴 대화 시도하기)을 단계별로 제시해 줘.
3. 친구가 멈칫거리거나 당황할 때 진행자가 개입하지 않고 부드럽게 마음을 묻는 중립적인 질문 3가지를 포함해 줘.`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
                  <span className="font-bold text-slate-900 block">⚡ 충격 반응 & 소환 마법</span>
                  <p className="text-slate-600 leading-relaxed">
                    "앱을 평가하는 것이 아니라, 앱이 얼마나 친절한지 확인하는 중이니 편하게 마음껏 써줘!"라는 진행자 가이드 대본이 완성됩니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-sm">
                  <span className="font-bold text-indigo-950 block">💡 컴퓨터 과학의 비밀: 무간섭의 원칙 (Non-Intervention)</span>
                  <p className="text-indigo-900 leading-relaxed">
                    관찰자가 힌트를 주는 순간, 앱의 실제 사용성 결함은 은폐됩니다. 사용자의 실수와 망설임이야말로 최고의 디버깅 데이터입니다.
                  </p>
                </div>
              </div>

              {/* QUEST 02 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold tracking-wider uppercase">
                    QUEST 02 · 체감 속도 향상
                  </span>
                  <span className="text-sm font-semibold text-slate-400">P0 결함 해결</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  통통 튀는 로딩 바운스 닷(CSS Bouncing Dots) 애니메이션 생성 마법
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  답변이 생성되는 동안 하얀 침묵 대신 점 3개가 물결치듯 통통 튀어 사용자의 새로고침 충동을 막는 CSS 애니메이션을 만듭니다.
                </p>

                {/* 프롬프트 박스 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">Prompt (Click to Copy)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('q2', `[Goal] 챗봇이 답변을 작성할 때 화면에 표시할 Tailwind CSS 기반 '통통 튀는 생각 점(Bouncing Typing Dots)' 컴포넌트를 만들어 줘.

[Actor] 나는 사용자의 지루함과 대기 불안감을 해소해 주는 UI 디자이너야.

[Condition]
1. 회색 둥근 말풍선 안에 작은 점 3개(w-2 h-2 rounded-full bg-indigo-500)가 순차적으로 위아래로 튕기는 CSS 키프레임 애니메이션을 구현해 줘.
2. 각 점마다 애니메이션 딜레이(0s, 0.2s, 0.4s)를 주어 파도타기처럼 리듬감 있게 움직이도록 해줘.
3. 말풍선 옆에는 "AI가 따뜻한 답변을 생각하고 있어요... 💭"라는 안내 문구를 은은하게 표시해 줘.`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === 'q2' ? (
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal] 챗봇이 답변을 작성할 때 화면에 표시할 Tailwind CSS 기반 '통통 튀는 생각 점(Bouncing Typing Dots)' 컴포넌트를 만들어 줘.

[Actor] 나는 사용자의 지루함과 대기 불안감을 해소해 주는 UI 디자이너야.

[Condition]
1. 회색 둥근 말풍선 안에 작은 점 3개(w-2 h-2 rounded-full bg-indigo-500)가 순차적으로 위아래로 튕기는 CSS 키프레임 애니메이션을 구현해 줘.
2. 각 점마다 애니메이션 딜레이(0s, 0.2s, 0.4s)를 주어 파도타기처럼 리듬감 있게 움직이도록 해줘.
3. 말풍선 옆에는 "AI가 따뜻한 답변을 생각하고 있어요... 💭"라는 안내 문구를 은은하게 표시해 줘.`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
                  <span className="font-bold text-slate-900 block">⚡ 충격 반응 & 소환 마법</span>
                  <p className="text-slate-600 leading-relaxed">
                    실제 서버 응답 시간이 1초라도, 점이 통통 튀는 시각적 움직임이 있으면 체감 시간은 0.3초 수준으로 짧게 느껴집니다!
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-sm">
                  <span className="font-bold text-indigo-950 block">💡 컴퓨터 과학의 비밀: 체감 대기 시간 (Perceived Performance)</span>
                  <p className="text-indigo-900 leading-relaxed">
                    시스템이 멈춘 것이 아니라 열심히 계산 중임을 시각 피드백으로 알리면, 사용자의 이탈율과 새로고침 빈도가 90% 이상 격감합니다.
                  </p>
                </div>
              </div>

              {/* QUEST 03 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold tracking-wider uppercase">
                    QUEST 03 · 첫 접속 가이드
                  </span>
                  <span className="text-sm font-semibold text-slate-400">P1 온보딩 해결</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  첫 접속자를 위한 웰컴 온보딩 칩(Welcome Chips) UI 컴포넌트 마법
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  하얀 빈 화면을 보고 망설이는 초보 친구를 위해, 클릭 한 번으로 질문이 즉시 전송되는 추천 칩 버튼들을 만듭니다.
                </p>

                {/* 프롬프트 박스 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">Prompt (Click to Copy)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('q3', `[Goal] 챗봇의 첫 화면(대화 내역이 없을 때)에 표시할 '웰컴 온보딩 추천 질문 칩' 컴포넌트를 만들어 줘.

[Actor] 나는 처음 방문한 사용자를 친절하게 에스코트하는 안내원이야.

[Condition]
1. [🍱 오늘 점심 급식 뭐야?], [☔ 비 올까? 우산 챙겨야 해?], [⏰ 다음 주 시험 일정 알려줘], [🎉 오늘의 칭찬 한마디 해줘] 등 학교 생활 질문 4개를 칩 버튼으로 만들어 줘.
2. 사용자가 칩을 클릭하면 입력창에 타이핑할 필요 없이 즉시 질문이 전송되고 웰컴 카드는 부드럽게 사라지도록(fade-out) 자바스크립트 핸들러를 작성해 줘.
3. 칩 버튼에는 호버 시 은은한 인디고 그림자 효과와 1.02배 확대 트랜지션을 적용해 줘.`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === 'q3' ? (
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal] 챗봇의 첫 화면(대화 내역이 없을 때)에 표시할 '웰컴 온보딩 추천 질문 칩' 컴포넌트를 만들어 줘.

[Actor] 나는 처음 방문한 사용자를 친절하게 에스코트하는 안내원이야.

[Condition]
1. [🍱 오늘 점심 급식 뭐야?], [☔ 비 올까? 우산 챙겨야 해?], [⏰ 다음 주 시험 일정 알려줘], [🎉 오늘의 칭찬 한마디 해줘] 등 학교 생활 질문 4개를 칩 버튼으로 만들어 줘.
2. 사용자가 칩을 클릭하면 입력창에 타이핑할 필요 없이 즉시 질문이 전송되고 웰컴 카드는 부드럽게 사라지도록(fade-out) 자바스크립트 핸들러를 작성해 줘.
3. 칩 버튼에는 호버 시 은은한 인디고 그림자 효과와 1.02배 확대 트랜지션을 적용해 줘.`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
                  <span className="font-bold text-slate-900 block">⚡ 충격 반응 & 소환 마법</span>
                  <p className="text-slate-600 leading-relaxed">
                    타이핑을 치기 귀찮아하던 친구도 칩 하나를 툭 누르며 자연스럽게 챗봇과의 첫 대화를 열게 됩니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-sm">
                  <span className="font-bold text-indigo-950 block">💡 컴퓨터 과학의 비밀: 엠프티 스테이트 디자인 (Empty State Design)</span>
                  <p className="text-indigo-900 leading-relaxed">
                    빈 데이터 상태를 방치하지 않고 첫 행동을 유도하는 가이드를 심어두는 것은 실리콘밸리 프로덕트의 필수 규칙입니다.
                  </p>
                </div>
              </div>

              {/* QUEST 04 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold tracking-wider uppercase">
                    QUEST 04 · 철벽 예외 방어
                  </span>
                  <span className="text-sm font-semibold text-slate-400">P1 폴백 완성</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  엉뚱한 입력 및 오타를 포용하는 자가 치유(Self-Healing Fallback) 로직 마법
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  준호처럼 외계어를 치거나 오타를 냈을 때, 차가운 에러 창 대신 "이런 걸 찾으셨나요?"라며 추천을 되묻는 치유 로직을 구현합니다.
                </p>

                {/* 프롬프트 박스 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">Prompt (Click to Copy)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('q4', `[Goal] 챗봇이 사용자의 알 수 없는 질문, 심한 오타, 장난성 외계어 입력을 받았을 때 작동할 '다정한 자가 치유(Self-Healing) 폴백 시스템'을 설계해 줘.

[Actor] 나는 사용자의 실수를 따뜻하게 품어주고 길을 안내하는 배려 깊은 AI야.

[Condition]
1. "오류 404", "이해할 수 없습니다" 같은 기계적인 표현을 완전히 제거해 줘.
2. "제가 아직 그 단어는 배우지 못했어요! 혹시 이런 걸 물어보셨나요? 😊"라며 관련 질문 3개를 다시 제시해 줘.
3. 입력창 아래에 원클릭 재시도 버튼과 홈 리셋 버튼을 함께 배치해 줘.`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === 'q4' ? (
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal] 챗봇이 사용자의 알 수 없는 질문, 심한 오타, 장난성 외계어 입력을 받았을 때 작동할 '다정한 자가 치유(Self-Healing) 폴백 시스템'을 설계해 줘.

[Actor] 나는 사용자의 실수를 따뜻하게 품어주고 길을 안내하는 배려 깊은 AI야.

[Condition]
1. "오류 404", "이해할 수 없습니다" 같은 기계적인 표현을 완전히 제거해 줘.
2. "제가 아직 그 단어는 배우지 못했어요! 혹시 이런 걸 물어보셨나요? 😊"라며 관련 질문 3개를 다시 제시해 줘.
3. 입력창 아래에 원클릭 재시도 버튼과 홈 리셋 버튼을 함께 배치해 줘.`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
                  <span className="font-bold text-slate-900 block">⚡ 충격 반응 & 소환 마법</span>
                  <p className="text-slate-600 leading-relaxed">
                    장난을 치려던 친구도 챗봇이 화내지 않고 다정하게 길을 다시 열어주자 신기해하며 진지하게 질문을 고쳐 쓰게 됩니다!
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-sm">
                  <span className="font-bold text-indigo-950 block">💡 컴퓨터 과학의 비밀: 우아한 장애 복구 (Graceful Degradation)</span>
                  <p className="text-indigo-900 leading-relaxed">
                    예상치 못한 입력이 들어와도 전체 시스템이 충돌하지 않고, 사용자에게 유용한 대안을 제시하며 안전하게 복구하는 원리입니다.
                  </p>
                </div>
              </div>

              {/* QUEST 05 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold tracking-wider uppercase">
                    QUEST 05 · 트리아지 매트릭스
                  </span>
                  <span className="text-sm font-semibold text-slate-400">우선순위 최종 정리</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  사용자 피드백 우선순위 분류(P0/P1/P2 Triage Matrix) 산출 마법
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  친구들에게 수집한 수많은 피드백 메모들을 한눈에 들어오는 P0, P1, P2 우선순위 개선 로드맵 표로 변환합니다.
                </p>

                {/* 프롬프트 박스 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">Prompt (Click to Copy)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('q5', `[Goal] 테스터 3명에게 수집한 다음 피드백 메모들을 분석하여, 데모데이 전 반드시 고쳐야 할 '우선순위 트리아지 매트릭스(Triage Matrix)'를 작성해 줘.

[User Feedback Notes]
- "답변 기다리는 동안 멈춘 줄 알고 새로고침을 3번이나 눌렀어"
- "첫 화면에 아무 글자도 없어서 무슨 말을 써야 할지 모르겠어"
- "외계어를 쳤더니 빨간색 에러 영어 문구가 떠서 무서웠어"
- "버튼 모서리가 조금 더 둥글었으면 좋겠어"
- "글자 폰트가 내 폰에서 약간 큰 것 같아"

[Output Format]
1. P0 (Critical - 서비스 중단 위험, 즉시 수정), P1 (Important - 사용성 저해, 데모 전 필수 수정), P2 (Minor - 디자인 취향, 백로그 보관) 표로 분류.
2. 각 항목별 구체적인 한 줄 해결 패치 아이디어 제시.`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === 'q5' ? (
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal] 테스터 3명에게 수집한 다음 피드백 메모들을 분석하여, 데모데이 전 반드시 고쳐야 할 '우선순위 트리아지 매트릭스(Triage Matrix)'를 작성해 줘.

[User Feedback Notes]
- "답변 기다리는 동안 멈춘 줄 알고 새로고침을 3번이나 눌렀어"
- "첫 화면에 아무 글자도 없어서 무슨 말을 써야 할지 모르겠어"
- "외계어를 쳤더니 빨간색 에러 영어 문구가 떠서 무서웠어"
- "버튼 모서리가 조금 더 둥글었으면 좋겠어"
- "글자 폰트가 내 폰에서 약간 큰 것 같아"

[Output Format]
1. P0 (Critical - 서비스 중단 위험, 즉시 수정), P1 (Important - 사용성 저해, 데모 전 필수 수정), P2 (Minor - 디자인 취향, 백로그 보관) 표로 분류.
2. 각 항목별 구체적인 한 줄 해결 패치 아이디어 제시.`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
                  <span className="font-bold text-slate-900 block">⚡ 충격 반응 & 소환 마법</span>
                  <p className="text-slate-600 leading-relaxed">
                    뒤죽박죽 쏟아지던 5개의 불만 사항이 명확한 1순위, 2순위, 3순위 개발 태스크로 깔끔하게 정돈됩니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-sm">
                  <span className="font-bold text-indigo-950 block">💡 컴퓨터 과학의 비밀: 이슈 트리아지 (Issue Triage)</span>
                  <p className="text-indigo-900 leading-relaxed">
                    구글이나 애플 같은 빅테크 엔지니어링 팀도 매일 아침 버그의 우선순위를 P0~P3로 분류하며 개발 시간의 낭비를 원천 차단합니다.
                  </p>
                </div>
              </div>

            </div>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                ← 이전: Stage 2 사용성 관찰 실습실
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-100"
              >
                <span>다음: Stage 4 전문 용어 & 자가점검</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 4: 전문 용어 돋보기 & 자가 점검 체크리스트 (Glossary & Checklist) */}
        {/* =================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            {/* Article 1: 주니어 개발자를 위한 전문 용어 돋보기 (5개 다크 카드) */}
            <article className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                  <p className="text-sm text-slate-400">
                    오늘 배운 원리들의 공식 컴퓨터 과학 및 UX 엔지니어링 용어를 알아봅니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. 생각 말하기 관찰법 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <h4 className="text-base font-bold text-emerald-400">생각 말하기 관찰법</h4>
                  <span className="text-sm font-mono text-slate-400 block">Think-Aloud Protocol</span>
                  <div className="space-y-1 text-sm text-slate-300 pt-1">
                    <p><strong>🧸 어린이 비유:</strong> 내 마음의 생각을 중얼중얼 밖으로 내보내는 초능력 스피커!</p>
                    <p><strong>🎓 개발자 정의:</strong> 사용자가 인터페이스를 조작하면서 느끼는 의문, 망설임, 혼란을 실시간 구어로 발화하게 하여 인지 과정을 분석하는 정성적 사용성 조사 기법.</p>
                  </div>
                </div>

                {/* 2. 피드백 분류 및 우선순위화 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <h4 className="text-base font-bold text-indigo-400">피드백 분류 및 우선순위화</h4>
                  <span className="text-sm font-mono text-slate-400 block">Feedback Triage</span>
                  <div className="space-y-1 text-sm text-slate-300 pt-1">
                    <p><strong>🧸 어린이 비유:</strong> 응급실에서 가장 위급한 환자부터 먼저 치료하는 순서표!</p>
                    <p><strong>🎓 개발자 정의:</strong> 쏟아지는 버그와 개선 요구 사항을 심각도와 영향도에 따라 P0(긴급), P1(중요), P2(사소함)로 체계화하여 한정된 개발 자원을 최적 배치하는 프로세스.</p>
                  </div>
                </div>

                {/* 3. 엠프티 스테이트 온보딩 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <h4 className="text-base font-bold text-amber-400">엠프티 스테이트 온보딩</h4>
                  <span className="text-sm font-mono text-slate-400 block">Empty State Onboarding</span>
                  <div className="space-y-1 text-sm text-slate-300 pt-1">
                    <p><strong>🧸 어린이 비유:</strong> 처음 놀러 온 친구에게 무슨 놀이를 할지 알려주는 환영 카드!</p>
                    <p><strong>🎓 개발자 정의:</strong> 대화 내역이나 데이터가 없는 초기 진입 화면에서 추천 행동(예: 추천 질문 칩)을 시각적으로 제공하여 사용자의 첫 실행 장벽을 낮추는 UX 설계 기법.</p>
                  </div>
                </div>

                {/* 4. 체감 대기 시간 감소 기법 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <h4 className="text-base font-bold text-sky-400">체감 대기 시간 감소 기법</h4>
                  <span className="text-sm font-mono text-slate-400 block">Perceived Performance</span>
                  <div className="space-y-1 text-sm text-slate-300 pt-1">
                    <p><strong>🧸 어린이 비유:</strong> 붕어빵을 기다리는 동안 굽는 모습을 보여주어 지루함을 잊게 하는 마술!</p>
                    <p><strong>🎓 개발자 정의:</strong> 비동기 통신 중 통통 튀는 애니메이션이나 스켈레톤 UI를 제공하여 실제 물리적 소요 시간보다 사용자가 인지하는 지연 시간을 비약적으로 단축시키는 최적화 기법.</p>
                  </div>
                </div>

                {/* 5. 자가 치유 폴백 시스템 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2 md:col-span-2">
                  <h4 className="text-base font-bold text-purple-400">자가 치유 폴백 시스템</h4>
                  <span className="text-sm font-mono text-slate-400 block">Self-Healing Fallback Mechanism</span>
                  <div className="space-y-1 text-sm text-slate-300 pt-1">
                    <p><strong>🧸 어린이 비유:</strong> 길을 잃었을 때 친절하게 다른 지도를 펼쳐주는 다정한 내비게이션!</p>
                    <p><strong>🎓 개발자 정의:</strong> 예외적인 사용자 입력이나 시스템 장애가 발생했을 때 프로그램이 충돌하지 않고 안전한 기본 상태로 복구되며 대안을 안내하는 고가용성 방어 설계 패턴.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Article 2: 8강 최신 표준 6개 자가 점검 체크리스트 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckSquare className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      23강 학습 성취도 자가 점검 체크리스트
                    </h3>
                    <p className="text-sm text-slate-500">
                      모든 항목을 달성하여 최종 24강 해커톤 데모데이 출품 자격을 획득하세요!
                    </p>
                  </div>
                </div>

                {/* 에메랄드 알약 카운터 뱃지 */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold self-start sm:self-auto">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>달성도: {completedCount} / {CHECKLIST_ITEMS.length} ({progressPercent}%)</span>
                </div>
              </div>

              {/* 실시간 그라데이션 게이지 바 */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* 6개 체크박스 리스트 */}
              <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => handleCheckItem(idx)}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                    />
                    <span className={`text-sm leading-relaxed ${
                      checklist[idx] ? 'text-slate-900 font-medium' : 'text-slate-600'
                    }`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>

              {/* 100% 완주 축하 및 다음 강 언락 다크 펄스 카드 */}
              {allCompleted && (
                <article className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-950 text-white shadow-xl space-y-4 border border-emerald-500/30 animate-pulse">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        23강 사용성 평가 및 RC 빌드 완성 수료! 🎉
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        축하합니다! 친구들의 냉정한 관찰 피드백을 침착하게 트리아지하고, 3대 친절 UX 패치(로딩 점 애니메이션, 온보딩 칩, 자가 치유 안내)를 적용하여 완성도 200%의 릴리스 후보(RC)를 만들어냈습니다! 이제 드디어 마지막 24강, 모든 친구와 선생님 앞에서 나의 AI 웹 앱을 발표하는 대망의 해커톤 데모데이가 열립니다!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-sm text-emerald-300 font-semibold block">최종 파이널 코스 잠금 해제</span>
                      <span className="text-sm text-white font-bold block">
                        24강: 최종 해커톤 데모데이: 세상에 단 하나뿐인 나의 AI 웹 앱 발표하기
                      </span>
                    </div>
                    <a
                      href="../24-hackathon-demoday/index.html"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition-all shadow-md"
                    >
                      <span>24강 최종 데모데이로 이동하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              )}
            </article>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                ← 이전: Stage 3 실전 AI 퀘스트
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUp className="w-4 h-4" />
                <span>맨 위로</span>
              </button>
            </div>
          </section>
        )}

      </main>

      {/* ===================================================================== */}
      {/* 3. 푸터 영역 (글로벌 표준 푸터)                                       */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="font-medium">AI·코딩 24강 완주 교육과정</span>
            <span className="text-slate-300">|</span>
            <span className="truncate">시즌 4 · 23강: 친구들의 냉정한 맛보기 평가</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap shrink-0">
            <a href="../../index.html" className="hover:text-slate-900 transition-colors">과정 홈</a>
            <a href="../22-chatbot-beta/index.html" className="hover:text-slate-900 transition-colors">22강 바로가기</a>
            <a href="../24-hackathon-demoday/index.html" className="hover:text-slate-900 transition-colors">24강 바로가기</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Lesson23;
