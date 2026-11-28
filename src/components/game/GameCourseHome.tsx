import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Terminal,
  Sparkles,
  Clock,
  Lock,
  Star,
  Check,
  Award,
  ArrowRight,
  Bot,
  Ghost,
  Cpu,
  Rocket
} from 'lucide-react';

interface GameLessonItem {
  id: number;
  seasonId: number;
  seasonName: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'available' | 'locked' | 'completed';
  link: string;
  tags: string[];
  unlockCondition?: string;
}

interface GameSeasonInfo {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeType: 'progress' | 'upcoming' | 'project' | 'success';
  accentColor: string;
}

const GAME_SEASONS: GameSeasonInfo[] = [
  {
    id: 1,
    title: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP (1~6강)',
    subtitle: 'Kilo 세팅, SPEC.md 아키텍처, 가속도·중력, AABB 충돌, 8비트 사운드, Debug 모드',
    badge: '1강 오픈 / 2~6강 순차 도전',
    badgeType: 'progress',
    accentColor: 'violet'
  },
  {
    id: 2,
    title: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포 (7~12강)',
    subtitle: '상태 머신(FSM), 시야·A* 길찾기, 보스 패턴 & 회귀 테스트, 랭킹, 커스터마이징, 배포',
    badge: '실전 출시 트랙 (순차 오픈)',
    badgeType: 'project',
    accentColor: 'cyan'
  }
];

const GAME_LESSONS_DATA: GameLessonItem[] = [
  // 시즌 1 (1~6강)
  {
    id: 1,
    seasonId: 1,
    seasonName: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP',
    title: 'VS Code + Kilo 세팅 & 60FPS 게임 루프',
    subtitle: 'Kilo Ask·Code 모드 & requestAnimationFrame',
    description:
      'VS Code와 Kilo Code를 세팅하고, 1초에 60번 도화지를 지우고 그리는 게임 루프로 첫 네온 볼 바운스 엔진을 실행합니다.',
    status: 'available',
    link: '/materials/game-ai/lessons/01-game-loop/index.html',
    tags: ['#VSCode', '#KiloCode', '#60FPS루프']
  },
  {
    id: 2,
    seasonId: 1,
    seasonName: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP',
    title: '코딩 전에 설계도부터! Kilo Architect & 모듈 분리',
    subtitle: 'SPEC.md 작성 & 멀티 파일 구조화',
    description:
      'Kilo Architect 모드로 게임 기획서(SPEC.md)를 먼저 작성하고, main.js · player.js 등 유지보수하기 좋은 폴더 구조를 설계합니다.',
    status: 'locked',
    unlockCondition: '1강을 완료하면 열립니다',
    link: '#',
    tags: ['#Architect모드', '#SPEC설계', '#모듈분리']
  },
  {
    id: 3,
    seasonId: 1,
    seasonName: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP',
    title: '손끝에 감기는 조작감: 가속도·마찰력 & 중력 점프',
    subtitle: '@player.js 컨텍스트 지시 & 물리 튜닝',
    description:
      'Kilo에게 @player.js만 짚어주며 속도(Velocity), 마찰력, 중력 점프를 구현하고 브라우저에서 직접 수치를 튜닝합니다.',
    status: 'locked',
    unlockCondition: '2강을 완료하면 열립니다',
    link: '#',
    tags: ['#가속도', '#중력점프', '#컨텍스트지정']
  },
  {
    id: 4,
    seasonId: 1,
    seasonName: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP',
    title: '벽 뚫기 금지 & 타격감: AABB 충돌과 파티클',
    subtitle: 'Bounding Box 충돌 & Diff 검토',
    description:
      '발판 착지, 벽 충돌, 코인 수집, 화면 흔들림·파티클 효과를 추가하고 Kilo가 고친 코드의 Diff를 직접 검토합니다.',
    status: 'locked',
    unlockCondition: '3강을 완료하면 열립니다',
    link: '#',
    tags: ['#AABB충돌', '#파티클', '#Diff검토']
  },
  {
    id: 5,
    seasonId: 1,
    seasonName: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP',
    title: '귀가 즐거운 오락실: Web Audio 8비트 사운드 엔진',
    subtitle: 'sound.js 모듈 분리 & 효과음 합성',
    description:
      'mp3 파일 없이 Web Audio API 주파수 합성으로 점프·코인·피격 효과음과 레트로 BGM 모듈(sound.js)을 연결합니다.',
    status: 'locked',
    unlockCondition: '4강을 완료하면 열립니다',
    link: '#',
    tags: ['#WebAudio', '#8비트사운드', '#모듈연결']
  },
  {
    id: 6,
    seasonId: 1,
    seasonName: '시즌 1: VS Code + Kilo로 2D 게임 엔진 & 플레이어 MVP',
    title: 'Kilo Debug 모드 & 점프런 MVP 완성',
    subtitle: 'Debug 모드 버그 헌팅 & Checkpoint 복구',
    description:
      'F12 콘솔 에러를 Kilo Debug 모드에 전달해 버그를 잡고, Checkpoint 롤백 훈련을 거쳐 시즌 1 점프런 MVP를 완성합니다.',
    status: 'locked',
    unlockCondition: '5강을 완료하면 열립니다',
    link: '#',
    tags: ['#Debug모드', '#Checkpoint', '#MVP완성']
  },

  // 시즌 2 (7~12강)
  {
    id: 7,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포',
    title: '생각하는 몬스터: 상태 머신(FSM) 적군 AI',
    subtitle: '@enemy.js 설계 & Finite State Machine',
    description:
      '평화 순찰(😴) → 플레이어 발견 시 추격(😡) → 체력 저하 시 도망(😱)으로 상태가 전환되는 지능형 몬스터를 구축합니다.',
    status: 'locked',
    unlockCondition: '6강을 완료하면 열립니다',
    link: '#',
    tags: ['#상태머신', '#FSM', '#몬스터AI']
  },
  {
    id: 8,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포',
    title: '벽 뒤는 안 보여! 시야 판정 & A* 길찾기 AI',
    subtitle: 'Raycasting · A* Pathfinding & 디버그 시각화',
    description:
      '벽 너머 투시를 막는 시야 광선과 장애물을 우회하는 A* 길찾기를 Kilo로 구현하고, 디버그 선 시각화로 검증합니다.',
    status: 'locked',
    unlockCondition: '7강을 완료하면 열립니다',
    link: '#',
    tags: ['#레이캐스팅', '#A*길찾기', '#시각화테스트']
  },
  {
    id: 9,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포',
    title: '거대 보스 레이드: 3단계 패턴 & 회귀 테스트',
    subtitle: 'Boss Phase Engine & 도미노 방지 테스트',
    description:
      '체력 구간별 탄막·돌진 패턴 보스를 추가하고, 기존 이동·충돌·사운드가 망가지지 않았는지 회귀 테스트를 수행합니다.',
    status: 'locked',
    unlockCondition: '8강을 완료하면 열립니다',
    link: '#',
    tags: ['#보스레이드', '#탄막패턴', '#회귀테스트']
  },
  {
    id: 10,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포',
    title: '오락실 완성도 200%: UI/UX, 콤보 & 최고 점수 랭킹',
    subtitle: 'Game State UI & LocalStorage 명예의 전당',
    description:
      '타이틀 화면, 일시정지, 게임오버/재시작 루프와 콤보 점수, LocalStorage 기반 최고 점수 랭킹 보드를 완성합니다.',
    status: 'locked',
    unlockCondition: '9강을 완료하면 열립니다',
    link: '#',
    tags: ['#게임UI', '#콤보시스템', '#명예의전당']
  },
  {
    id: 11,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포',
    title: '나만의 게임으로 개조하기: 테마 커스터마이징 & 리팩토링',
    subtitle: 'Kilo 코드 리팩토링 & 나만의 세계관 스킨',
    description:
      'Kilo에게 중복 코드 정리(리팩토링)를 지시하고, 나만의 세계관 스킨·무기·모바일 터치 버튼을 자유롭게 개조합니다.',
    status: 'locked',
    unlockCondition: '10강을 완료하면 열립니다',
    link: '#',
    tags: ['#리팩토링', '#커스터마이징', '#터치지원']
  },
  {
    id: 12,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터 AI, 보스전 & 웹 배포',
    title: '세상에 내 게임 출시하기: 배포 & 데모데이',
    subtitle: 'README.md 작성 · GitHub Pages 웹 배포',
    description:
      '게임 소개서(README.md)를 작성하고 GitHub Pages로 실제 웹 링크를 배포해 친구들과 플레이하며 데모데이를 엽니다.',
    status: 'locked',
    unlockCondition: '11강을 완료하면 열립니다',
    link: '#',
    tags: ['#웹배포', '#데모데이', '#12강수료']
  }
];

export const GameCourseHome: React.FC = () => {
  const [lessons, setLessons] = useState<GameLessonItem[]>(GAME_LESSONS_DATA);
  const [completedCount, setCompletedCount] = useState<number>(0);

  useEffect(() => {
    // LocalStorage 연동: game_lesson_01_completed ~ game_lesson_12_completed
    let count = 0;
    const updated = GAME_LESSONS_DATA.map((lesson, idx) => {
      const padId = String(lesson.id).padStart(2, '0');
      const isCompleted = localStorage.getItem(`game_lesson_${padId}_completed`) === 'true';
      if (isCompleted) {
        count++;
        return { ...lesson, status: 'completed' as const };
      }
      // 순차 잠금 해제: 이전 강의가 완주되었거나 1강이면 available
      if (idx === 0) {
        return { ...lesson, status: 'available' as const };
      }
      const prevPadId = String(GAME_LESSONS_DATA[idx - 1].id).padStart(2, '0');
      const prevCompleted = localStorage.getItem(`game_lesson_${prevPadId}_completed`) === 'true';
      if (prevCompleted) {
        return { ...lesson, status: 'available' as const };
      }
      return { ...lesson, status: 'locked' as const };
    });

    setLessons(updated);
    setCompletedCount(count);
  }, []);

  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* 본문 바로가기 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-violet-600 text-white font-bold rounded-lg shadow-lg"
      >
        본문 바로가기
      </a>

      {/* 상단 고정 GNB 헤더 (Wanted Montage Style) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-violet-200">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  나만의 웹 아케이드 게임 만들기
                </span>
                <span className="text-xs font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  VS CODE + KILO
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                VS Code Kilo AI 에이전트와 협업해 설계·구현·디버깅·배포까지 완주하는 12강 실전 트랙
              </p>
            </div>
          </div>

          {/* 우측 링크 그룹 */}
          <div className="flex items-center gap-3">
            <a
              href="/materials/ai/index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI 24강 기초 트랙</span>
            </a>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 컨테이너 */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 1. 네오 레트로 아케이드 히어로 배너 */}
        <section className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white relative overflow-hidden border border-violet-500/30 shadow-2xl">
          {/* 배경 글로우 */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-sm font-semibold">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>AI 실전 프로젝트 1탄 · VS Code + Kilo Code 에이전트 협업 개발</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
              아이디어에서 출시까지, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300">
                Kilo AI와 함께 만드는 나만의 웹 아케이드
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              브라우저 복붙 코딩을 졸업하고 진짜 개발자의 작업실(VS Code)로 들어갑니다.
              Kilo의 Architect·Code·Debug 모드를 적재적소에 지휘하며 게임 기획서(SPEC.md), 60FPS 물리 엔진, 지능형 몬스터 AI, 보스전, 웹 배포까지 완성합니다.
            </p>

            {/* 핵심 피처 뱃지 4개 */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-violet-500/30 text-sm font-medium text-slate-200">
                <Bot className="w-4 h-4 text-violet-400" />
                <span>Kilo 4대 모드 지휘</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-sm font-medium text-slate-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>60FPS · 물리 · 사운드</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-sm font-medium text-slate-200">
                <Ghost className="w-4 h-4 text-amber-400" />
                <span>FSM · 시야 · 보스 AI</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-sm font-medium text-slate-200">
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>모듈 설계 &amp; 웹 배포</span>
              </span>
            </div>
          </div>
        </section>

        {/* 2. 학습 진도 통계 카드 */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 w-full md:w-auto">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-600" />
              <span>내 12강 게임 개발 진도</span>
            </h2>
            <p className="text-sm text-slate-500">
              이전 강의의 체크리스트를 완료하면 다음 강의가 자동으로 잠금 해제됩니다.
            </p>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-slate-600">진행률</span>
              <span className="text-violet-600 font-mono">
                {completedCount} / {lessons.length}강 완주 ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* 3. 12강 시즌별 로드맵 그리드 */}
        <div className="space-y-10">
          {GAME_SEASONS.map((season) => {
            const seasonLessons = lessons.filter((l) => l.seasonId === season.id);

            return (
              <section key={season.id} className="space-y-4">
                {/* 시즌 헤더 & 알약 뱃지 */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm ${
                        season.accentColor === 'violet'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      S{season.id}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{season.title}</h3>
                      <p className="text-sm text-slate-500">{season.subtitle}</p>
                    </div>
                  </div>

                  <div>
                    {season.badgeType === 'progress' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                        <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                    {season.badgeType === 'project' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                        <Star className="w-4 h-4 text-rose-600" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                    {season.badgeType === 'upcoming' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                        <Lock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                    {season.badgeType === 'success' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 강의 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {seasonLessons.map((lesson) => {
                    const isAvailable = lesson.status === 'available';
                    const isCompleted = lesson.status === 'completed';
                    const isLocked = lesson.status === 'locked';

                    return (
                      <article
                        key={lesson.id}
                        className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                          isAvailable
                            ? 'bg-white border-2 border-violet-300 shadow-sm hover:shadow-md'
                            : isCompleted
                            ? 'bg-emerald-50/40 border border-emerald-200 shadow-sm'
                            : 'bg-slate-50/70 border border-slate-200 opacity-80 shadow-none'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-slate-100 text-slate-700">
                              {lesson.id}강
                            </span>

                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>완주 완료</span>
                              </span>
                            )}
                            {isAvailable && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-bold bg-violet-50 text-violet-700 border border-violet-200">
                                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                                <span>도전 가능</span>
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>잠김</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {lesson.title}
                          </h4>
                          <p
                            className={`text-sm font-semibold ${
                              season.accentColor === 'violet' ? 'text-violet-600' : 'text-cyan-600'
                            }`}
                          >
                            {lesson.subtitle}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {lesson.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lesson.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 카드 하단 액션 버튼 */}
                        <div className="pt-5">
                          {isAvailable || isCompleted ? (
                            <a
                              href={lesson.link}
                              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                                isCompleted
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
                              }`}
                            >
                              <span>{isCompleted ? '복습하기' : `${lesson.id}강 시작하기`}</span>
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-sm cursor-not-allowed border border-slate-200 flex items-center justify-center gap-1.5"
                            >
                              <Lock className="w-4 h-4" />
                              <span>{lesson.unlockCondition || '잠겨 있음'}</span>
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>🎮 나만의 웹 아케이드 게임 만들기 (VS Code + Kilo 12강 실전 트랙)</p>
          <p>설계(Architect) · 구현(Code) · 디버깅(Debug) · 배포까지 AI 에이전트와 함께 완성하는 인디 게임 프로젝트</p>
        </div>
      </footer>
    </div>
  );
};

export default GameCourseHome;
