import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Zap,
  Sparkles,
  Clock,
  Lock,
  Star,
  Check,
  Award,
  ArrowRight,
  Volume2,
  Ghost,
  Cpu,
  Activity,
  ChevronRight,
  BookOpen
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
    title: '시즌 1: 플레이어와 2D 물리 엔진 (1~6강)',
    subtitle: '60FPS 게임 루프, 가속도 이동, 중력 점프, 박스 충돌, 8비트 사운드 신시사이저',
    badge: '1강 오픈 / 2~6강 순차 도전',
    badgeType: 'progress',
    accentColor: 'violet'
  },
  {
    id: 2,
    title: '시즌 2: 지능형 몬스터와 자율 게임 AI (7~12강)',
    subtitle: '상태 머신(FSM), 투시 방지 레이캐스팅 시야 센서, 미로 길찾기(A*), 보스전',
    badge: '실전 프로젝트 (준비 중)',
    badgeType: 'project',
    accentColor: 'cyan'
  }
];

const GAME_LESSONS_DATA: GameLessonItem[] = [
  // 시즌 1 (1~6강)
  {
    id: 1,
    seasonId: 1,
    seasonName: '시즌 1: 플레이어와 2D 물리 엔진',
    title: '60FPS의 비밀과 게임 루프',
    subtitle: 'requestAnimationFrame & Canvas',
    description: '영화 필름처럼 1초에 60번 도화지를 지우고 다시 그리는 게임 루프의 원리를 이해하고 네온 볼 바운스 엔진을 완성합니다.',
    status: 'available',
    link: '/materials/game-ai/lessons/01-game-loop/index.html',
    tags: ['#60FPS', '#게임루프', '#탄성충돌']
  },
  {
    id: 2,
    seasonId: 1,
    seasonName: '시즌 1: 플레이어와 2D 물리 엔진',
    title: '손끝으로 조종하는 네온 캐릭터',
    subtitle: '키보드 이벤트 & 부드러운 가속도/마찰력',
    description: '뚝뚝 끊기는 순간이동은 가라! 벨로시티(Velocity) 벡터와 마찰력 수식으로 아이스링크를 미끄러지듯 부드러운 캐릭터 조작감을 완성합니다.',
    status: 'locked',
    unlockCondition: '1강을 완료하면 열립니다',
    link: '#',
    tags: ['#키보드이벤트', '#가속도', '#마찰력수식']
  },
  {
    id: 3,
    seasonId: 1,
    seasonName: '시즌 1: 플레이어와 2D 물리 엔진',
    title: '중력과 점프 물리 엔진',
    subtitle: '중력 가속도, 수직 속도, 바닥 착지 판정',
    description: '마리오 점프의 핵심 원리! 중력 가속도(Gravity)와 수직 점프 속도, 바닥 감지 판정으로 역동적인 점프 액션을 만듭니다.',
    status: 'locked',
    unlockCondition: '2강을 완료하면 열립니다',
    link: '#',
    tags: ['#중력엔진', '#점프물리', '#착지감지']
  },
  {
    id: 4,
    seasonId: 1,
    seasonName: '시즌 1: 플레이어와 2D 물리 엔진',
    title: '벽을 뚫지 마! AABB 박스 충돌 판정',
    subtitle: '축 정렬 경계 상자 & 충돌 반발력',
    description: '게임 개발의 기초 수학 AABB(Axis-Aligned Bounding Box) 알고리즘으로 플랫폼 위를 딛고 서거나 벽을 뚫고 나가지 못하게 막습니다.',
    status: 'locked',
    unlockCondition: '3강을 완료하면 열립니다',
    link: '#',
    tags: ['#AABB', '#충돌판정', '#벽뚫기방지']
  },
  {
    id: 5,
    seasonId: 1,
    seasonName: '시즌 1: 플레이어와 2D 물리 엔진',
    title: '8비트 사운드 신시사이저',
    subtitle: 'Web Audio API 효과음 합성',
    description: 'mp3 파일 다운로드 없이! 순수 코드로 주파수를 합성해 점프할 때 삐용~ 코인 먹을 때 띠링~ 효과음을 연출합니다.',
    status: 'locked',
    unlockCondition: '4강을 완료하면 열립니다',
    link: '#',
    tags: ['#WebAudio', '#8비트사운드', '#효과음']
  },
  {
    id: 6,
    seasonId: 1,
    seasonName: '시즌 1: 플레이어와 2D 물리 엔진',
    title: '시즌 1 점프런 게임 쇼케이스',
    subtitle: '2D 타일맵 러닝 액션 완성',
    description: '점프, 충돌, 코인 수집, 함정 회피, 사운드가 모두 결합된 시즌 1 완결판 2D 점프런 게임을 완성하고 친구와 겨룹니다.',
    status: 'locked',
    unlockCondition: '5강을 완료하면 열립니다',
    link: '#',
    tags: ['#점프런', '#쇼케이스', '#시즌1완주']
  },

  // 시즌 2 (7~12강)
  {
    id: 7,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터와 자율 게임 AI',
    title: '몬스터의 감정 스위치: 상태 머신 AI',
    subtitle: 'Finite State Machine (FSM)',
    description: '플레이어가 멀리 있으면 평화 순찰(😴), 다가가면 분노 추격(😡), 피가 닳으면 공포 도망(😱)치는 지능형 몬스터 구현.',
    status: 'locked',
    unlockCondition: '6강을 완료하면 열립니다',
    link: '#',
    tags: ['#상태머신', '#FSM', '#몬스터AI']
  },
  {
    id: 8,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터와 자율 게임 AI',
    title: '벽 뒤에 숨은 적은 안 보여! 레이캐스팅 시야 센서',
    subtitle: '선분 교차 수학과 가시선(Line of Sight)',
    description: '몬스터가 벽 너머 투시 능력을 쓰지 못하도록, 광선(Ray)을 쏘아 시야 방해 벽을 검출하는 진짜 잠입 시야 엔진을 코딩합니다.',
    status: 'locked',
    unlockCondition: '7강을 완료하면 열립니다',
    link: '#',
    tags: ['#레이캐스팅', '#시야판정', '#잠입액션']
  },
  {
    id: 9,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터와 자율 게임 AI',
    title: '미로 속 지름길을 찾는 천재 AI: A* 길찾기',
    subtitle: 'Grid Graph & A* (A-Star) Pathfinding',
    description: '벽에 부딪히며 멍청하게 비비적거리지 않고, 장애물을 피해 플레이어의 등 뒤까지 최단거리로 돌아오는 A* 길찾기 알고리즘을 구축합니다.',
    status: 'locked',
    unlockCondition: '8강을 완료하면 열립니다',
    link: '#',
    tags: ['#길찾기', '#AStar', '#최단경로']
  },
  {
    id: 10,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터와 자율 게임 AI',
    title: '살아있는 무리: 보이드 군집 조향 AI',
    subtitle: 'Craig Reynolds Boids Steering Behaviors',
    description: '분리(Separation)·정렬(Alignment)·응집(Cohesion) 3대 수식으로 물고기 떼나 박쥐 무리처럼 환상적으로 흩어지고 뭉치는 지능형 군집 AI 완성.',
    status: 'locked',
    unlockCondition: '9강을 완료하면 열립니다',
    link: '#',
    tags: ['#보이드', '#군집지능', '#조향행동']
  },
  {
    id: 11,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터와 자율 게임 AI',
    title: '3단계 패턴의 거대 보스 AI 전투',
    subtitle: '보스 체력별 패턴 변환 & 탄막 생성 엔진',
    description: '체력 100% 원거리 탄막 → 체력 50% 분노 돌진 → 체력 20% 분신 소환으로 폭주하는 보스 레이드 알고리즘을 설계합니다.',
    status: 'locked',
    unlockCondition: '10강을 완료하면 열립니다',
    link: '#',
    tags: ['#보스레이드', '#탄막엔진', '#패턴변화']
  },
  {
    id: 12,
    seasonId: 2,
    seasonName: '시즌 2: 지능형 몬스터와 자율 게임 AI',
    title: '최종 프로젝트: 던전 이스케이프 아케이드 & 데모데이',
    subtitle: '전체 시스템 통합, 최고 점수 랭킹전 & 배포',
    description: '물리 엔진 + 몬스터 AI + A* 길찾기 + 보스전이 하나로 결합된 완전한 2D 탑다운 액션 게임을 배포하고 친구들과 명예의 전당을 엽니다.',
    status: 'locked',
    unlockCondition: '11강을 완료하면 열립니다',
    link: '#',
    tags: ['#최종프로젝트', '#던전게임', '#데모데이']
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
                  2D 게임 엔진 &amp; 게임 AI 12강
                </span>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  GAME TRACK
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                물리 엔진과 생각하는 몬스터를 직접 코딩하는 12강 완주 코스
              </p>
            </div>
          </div>

          {/* 우측 링크 그룹 */}
          <div className="flex items-center gap-3">
            <a
              href="/materials/ai/index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>📘 AI 24강 기초 트랙으로 가기</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>로그인 0개! API 키 없이 브라우저에서 100% 순수 코드로 완성</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
              화면 뒤의 마법, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300">
                2D 게임 엔진과 살아 숨 쉬는 몬스터 AI
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              단순한 클릭 게임을 넘어 중력·점프 물리 엔진, 8비트 사운드 신시사이저, 그리고 플레이어를
              능동적으로 감지하고 추격하는 몬스터 인공지능(FSM·Raycasting·길찾기)을 직접 코딩합니다.
            </p>

            {/* 핵심 피처 뱃지 4개 */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-violet-500/30 text-xs font-medium text-slate-200">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span>60FPS 게임 루프</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-xs font-medium text-slate-200">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>중력·점프 물리 엔진</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-amber-500/30 text-xs font-medium text-slate-200">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>8비트 사운드 신시사이저</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-xs font-medium text-slate-200">
                <Ghost className="w-3.5 h-3.5 text-emerald-400" />
                <span>상태 머신 &amp; 자율 길찾기 AI</span>
              </span>
            </div>
          </div>
        </section>

        {/* 2. 학습 진도 통계 카드 */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 w-full md:w-auto">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-600" />
              <span>내 12강 게임 개발 진도</span>
            </h2>
            <p className="text-xs text-slate-500">
              이전 강의의 체크리스트를 완료하면 다음 강의가 자동으로 잠금 해제됩니다.
            </p>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
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
                {/* 시즌 헤더 & 알약 뱃지 4대 규격 적용 */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs ${
                        season.accentColor === 'violet'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      S{season.id}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{season.title}</h3>
                      <p className="text-xs text-slate-500">{season.subtitle}</p>
                    </div>
                  </div>

                  {/* 4대 시즌 알약 뱃지 규격 렌더링 */}
                  <div>
                    {season.badgeType === 'progress' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                    {season.badgeType === 'project' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                        <Star className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                    {season.badgeType === 'upcoming' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>{season.badge}</span>
                      </span>
                    )}
                    {season.badgeType === 'success' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
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
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              {lesson.id}강
                            </span>

                            {/* 카드 내부 상태 뱃지 */}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>완주 완료</span>
                              </span>
                            )}
                            {isAvailable && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                                <Sparkles className="w-3 h-3 text-violet-600" />
                                <span>도전 가능</span>
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>잠김</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {lesson.title}
                          </h4>
                          <p
                            className={`text-xs font-semibold ${
                              season.accentColor === 'violet' ? 'text-violet-600' : 'text-cyan-600'
                            }`}
                          >
                            {lesson.subtitle}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {lesson.description}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {lesson.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium"
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
                              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                                isCompleted
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
                              }`}
                            >
                              <span>{isCompleted ? '복습하기' : `${lesson.id}강 시작하기`}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed border border-slate-200 flex items-center justify-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>🎮 2D 레트로 게임 엔진 &amp; 게임 AI 12강 마스터 트랙 - 코딩 저지 플랫폼</p>
          <p>외부 AI 로그인 및 API 키 없이 100% 브라우저 순수 자바스크립트 알고리즘 실습</p>
        </div>
      </footer>
    </div>
  );
};

export default GameCourseHome;
