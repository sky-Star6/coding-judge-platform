import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Lightbulb,
  Award,
  Target,
  Bot,
  PlayCircle,
  Lock,
  Unlock,
  Clock,
  Layers,
  Search,
  Code2,
  Trophy,
  CheckSquare,
  Zap,
  Rocket,
  Gamepad2,
  Play,
  Pause,
  Flame,
  ShieldCheck,
  BookOpen,
  Repeat,
  Crosshair,
  Keyboard,
  Palette,
  Workflow,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 9강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'arcade' | 'arch' | 'checklist';
export type DifficultyType = 'easy' | 'normal' | 'hard';
export type GameStateType = 'ready' | 'playing' | 'gameover';

export interface Lesson09Props {
  onComplete?: () => void;
}

interface StarItem {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

export const Lesson09: React.FC<Lesson09Props> = ({ onComplete }) => {
  // ----------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ----------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('arcade');
  const [difficulty, setDifficulty] = useState<DifficultyType>('normal');

  // 아케이드 게임 상태
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [gameState, setGameState] = useState<GameStateType>('ready');
  const [score, setScore] = useState<number>(0);
  const [hp, setHp] = useState<number>(3);
  const [viewerCode, setViewerCode] = useState<string>(`// 게임 루프 실시간 상태
let player = { x: 185, y: 235, hp: 3 };
let stars = [];
let score = 0;

function updateGame() {
  if (keys['ArrowLeft']) player.x -= 4.8;
  if (keys['ArrowRight']) player.x += 4.8;
  player.x = Math.max(0, Math.min(370, player.x));
}`);

  // 게임 내부 참조값
  const playerRef = useRef({ x: 185, y: 235, w: 30, h: 24, speed: 4.8 });
  const starsRef = useRef<StarItem[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const frameCountRef = useRef<number>(0);

  // 퀴즈 상태
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // 회고 폼
  const [retroText, setRetroText] = useState<string>('');
  const [isRetroSaved, setIsRetroSaved] = useState<boolean>(false);

  // 체크리스트 6문항 상태
  const [checklist, setChecklist] = useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
    c6: false,
  });

  // 복사 피드백
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ----------------------------------------------------------------------------
  // 퀴즈 데이터셋
  // ----------------------------------------------------------------------------
  const quizData = [
    {
      q: "1초에 60번 화면을 부드럽게 지우고 다시 그리는 자바스크립트 내장 함수는 무엇일까요?",
      options: ["1. requestAnimationFrame", "2. console.log", "3. Math.random"],
      ans: 0,
      tip: "정답입니다! requestAnimationFrame은 모니터의 화면 주사율에 맞추어 1초에 60번 이상 도화지를 지우고 다시 그리는 초고속 플립북 마법입니다."
    },
    {
      q: "우주선과 별똥별의 사각형 상자가 겹쳤는지 판정하는 수학적 기법의 이름은?",
      options: ["1. AABB 충돌 감지", "2. CSS 그라데이션", "3. 팩트체크 파이프라인"],
      ans: 0,
      tip: "정답입니다! AABB(Axis-Aligned Bounding Box)는 축에 나란한 투명 사각형 상자들의 X, Y 좌표를 비교해 겹침을 찾아내는 가장 대중적인 충돌 감지 공식입니다."
    },
    {
      q: "거대한 게임을 욕심내기보다 핵심 재미 1가지를 먼저 빠르게 완성하는 개발 방식을 무엇이라고 할까요?",
      options: ["1. MVP (최소 기능 제품)", "2. LocalStorage 세이브", "3. 버그 폭탄"],
      ans: 0,
      tip: "정답입니다! MVP(Minimum Viable Product)는 가장 중요한 핵심 기능만을 작게 만들어 직접 플레이해보고 개선하는 현업 개발자들의 최고의 전략입니다."
    }
  ];

  // ----------------------------------------------------------------------------
  // 로컬 스토리지 복원
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const savedCheck = localStorage.getItem('lesson_09_checklist');
    if (savedCheck) {
      try {
        setChecklist(JSON.parse(savedCheck));
      } catch (e) {
        console.error(e);
      }
    }

    const savedRetro = localStorage.getItem('lesson_09_retro');
    if (savedRetro) {
      setRetroText(savedRetro);
      setIsRetroSaved(true);
    }
  }, []);

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const isAllCompleted = completedChecklistCount === 6;

  const toggleCheckItem = (key: keyof typeof checklist) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem('lesson_09_checklist', JSON.stringify(next));
  };

  const handleRetroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRetroText(val);
    localStorage.setItem('lesson_09_retro', val);
    setIsRetroSaved(true);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // ----------------------------------------------------------------------------
  // 캔버스 아케이드 루프
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 키보드 이벤트 핸들러
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 정적 배경 그리기 (게임 준비 중일 때)
    if (gameState === 'ready') {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(185 + 15, 235);
      ctx.lineTo(185 + 30, 235 + 24);
      ctx.lineTo(185 + 15, 235 + 19);
      ctx.lineTo(185, 235 + 24);
      ctx.closePath();
      ctx.fill();
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState]);

  // 게임 실행 루프
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let fallSpd = 3.6;
    let spwnRate = 28;
    if (difficulty === 'easy') { fallSpd = 2.4; spwnRate = 40; }
    if (difficulty === 'hard') { fallSpd = 5.2; spwnRate = 18; }

    const loop = () => {
      frameCountRef.current++;
      const frame = frameCountRef.current;

      // 1. 우주선 위치 갱신
      if (keysRef.current.left) playerRef.current.x -= playerRef.current.speed;
      if (keysRef.current.right) playerRef.current.x += playerRef.current.speed;
      playerRef.current.x = Math.max(5, Math.min(canvas.width - playerRef.current.w - 5, playerRef.current.x));

      // 2. 점수 증가
      if (frame % 6 === 0) {
        setScore(prev => prev + 1);
      }

      // 3. 별똥별 스폰
      if (frame % spwnRate === 0) {
        const starX = Math.random() * (canvas.width - 24) + 12;
        const starSize = Math.random() * 8 + 10;
        const spd = fallSpd + (Math.random() * 1.5 - 0.7);
        starsRef.current.push({
          x: starX,
          y: -15,
          size: starSize,
          speed: spd,
          color: Math.random() < 0.2 ? '#facc15' : '#38bdf8'
        });
      }

      // 4. 별똥별 이동 & 충돌 판정
      for (let i = starsRef.current.length - 1; i >= 0; i--) {
        const s = starsRef.current[i];
        s.y += s.speed;

        // AABB 충돌
        const p = playerRef.current;
        if (
          p.x < s.x + s.size &&
          p.x + p.w > s.x - s.size &&
          p.y < s.y + s.size &&
          p.y + p.h > s.y - s.size
        ) {
          starsRef.current.splice(i, 1);
          setHp(prevHp => {
            const nextHp = prevHp - 1;
            if (nextHp <= 0) {
              setGameState('gameover');
            }
            return nextHp;
          });
          continue;
        }

        if (s.y > canvas.height + 20) {
          starsRef.current.splice(i, 1);
        }
      }

      // 5. 캔버스 렌더링
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 별빛 배경
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const bx = (i * 37 + frame * 0.2) % canvas.width;
        const by = (i * 23) % canvas.height;
        ctx.fillRect(bx, by, 1.5, 1.5);
      }

      // 별똥별 그리기
      starsRef.current.forEach(s => {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y - 12);
        ctx.stroke();
        ctx.restore();
      });

      // 플레이어 우주선
      const p = playerRef.current;
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(p.x + p.w / 2, p.y);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.lineTo(p.x + p.w / 2, p.y + p.h - 5);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.closePath();
      ctx.fill();

      // 엔진 불꽃
      if (Math.random() < 0.8) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(p.x + p.w / 2 - 4, p.y + p.h - 4);
        ctx.lineTo(p.x + p.w / 2, p.y + p.h + 6);
        ctx.lineTo(p.x + p.w / 2 + 4, p.y + p.h - 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 6. 뷰어 텍스트 업데이트 (15프레임 주기)
      if (frame % 15 === 0) {
        setViewerCode(`// [실시간 렌더링 프레임: ${frame}]
let player = { x: ${Math.round(p.x)}, y: ${p.y}, hp: ${hp} };
let activeStars = ${starsRef.current.length}개;
let currentScore = ${score};
let gameState = '${gameState}';

// 충돌 감지 공식:
// player.x < s.x + s.w && player.x + 30 > s.x`);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, difficulty, score, hp]);

  const startGame = () => {
    playerRef.current.x = 185;
    starsRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    setHp(3);
    setGameState('playing');
  };

  const handleTouchControl = (dir: 'left' | 'right', pressed: boolean) => {
    if (dir === 'left') keysRef.current.left = pressed;
    if (dir === 'right') keysRef.current.right = pressed;
  };

  const handleQuizAnswer = (idx: number) => {
    setSelectedQuizOption(idx);
    const item = quizData[quizIndex];
    if (idx === item.ans) {
      setQuizFeedback({ isCorrect: true, text: item.tip });
    } else {
      setQuizFeedback({
        isCorrect: false,
        text: `아쉬워요! 다시 생각해보세요. ${item.options[item.ans]}이 정답입니다.`
      });
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    setQuizFeedback(null);
    setQuizIndex(prev => (prev + 1) % quizData.length);
  };

  // ----------------------------------------------------------------------------
  // UI 렌더링
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-500 selection:text-white">
      {/* --------------------------------------------------------------------- */}
      {/* [상단 GNB] 과정 홈 | 시즌 2 · 9강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 whitespace-nowrap">
              시즌 2 · 9강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              하늘에서 쏟아지는 별똥별을 피해라! 웹 기초 미니 프로젝트 &amp; MVP 아케이드 완성
            </h1>
          </div>
        </div>

        {/* 4단계 퀘스트 스텝퍼 */}
                <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage1'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>미션 브리핑</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage2'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>3대 마법 원리</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage3'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>3박자 조립 실습</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStage === 'stage4'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>아케이드 연구소</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 상태 */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">9강 진척도</span>
              <span className="text-xs text-cyan-600 font-bold font-mono">
                {completedChecklistCount}/6 ({Math.round((completedChecklistCount / 6) * 100)}%)
              </span>
            </div>
            <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${(completedChecklistCount / 6) * 100}%` }}
              />
            </div>
          </div>

          <div>
            {!isAllCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>10강 잠김</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse whitespace-nowrap">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>10강 언락 ✨</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 스플릿 뷰 (Split View) */}
      {/* --------------------------------------------------------------------- */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">

        {/* ------------------------------------------------------------------- */}
        {/* ■ 좌측 패널 (60% 폭) - 퀘스트 가이드 본문 (독립 슬라이드바) */}
        {/* ------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 미션 브리핑] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* ■ 히어로 섹션 */}
          <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-cyan-100 border border-white/20 whitespace-nowrap">
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>시즌 2 : 웹 기초 종합 미니 프로젝트 완결판</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-400 text-slate-950 whitespace-nowrap">
                  <Rocket className="w-3 h-3 text-slate-950" />
                  <span>MVP 아케이드 출격!</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                하늘에서 쏟아지는 별똥별을 피해라! 웹 기초 미니 프로젝트 &amp; MVP 아케이드 완성
              </h2>

              <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-2xl font-normal">
                지금까지 배운 <strong>HTML(도화지)</strong>, <strong>CSS(우주복)</strong>, <strong>자바스크립트(움직이는 심장)</strong> 3총사를 하나로 합체합니다! 키보드 화살표로 우주선을 날렵하게 조종하며 밤하늘에서 비처럼 쏟아지는 유성을 아슬아슬하게 피하는 완성형 웹 게임을 직접 만들어봅시다.
              </p>

              {/* 4대 메타 박스 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-cyan-200 font-semibold block leading-tight whitespace-nowrap">핵심 마법</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">HTML + CSS + JS 3총사 합체</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-cyan-200 font-semibold block leading-tight whitespace-nowrap">제작 산출물</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">별똥별 피하기 MVP 아케이드</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-cyan-200 font-semibold block leading-tight whitespace-nowrap">주의 함정</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">화면 밖 탈출 &amp; 무한 렉 방지</span>
                </div>
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[11px] text-cyan-200 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <span className="text-xs font-bold text-white leading-snug whitespace-nowrap">약 45분 (체험 &amp; 실습)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* ■ STAGE 1: 미션 브리핑 */}
          {/* ----------------------------------------------------------------- */}

              <article id="stage1" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                미션 브리핑: 웹 3총사의 위대한 합체 &amp; MVP 원칙
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              우리는 지난 5강에서 <strong>HTML</strong>로 웹페이지의 뼈대를 세우고, 6강에서 <strong>CSS</strong>로 멋진 스타일 옷을 입혔으며, 7강과 8강에서 <strong>자바스크립트</strong>의 클릭 이벤트와 무작위 주사위를 다루었습니다.<br />
              이제 이 모든 지식을 합쳐 <strong>"살아 움직이는 진짜 컴퓨터 게임"</strong>을 만들 차례입니다!
            </p>

            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50/70 to-blue-50/50 border border-cyan-200 space-y-2">
              <div className="flex items-center gap-2 text-cyan-950 font-bold text-xs sm:text-sm">
                <Target className="w-4 h-4 text-cyan-600" />
                <span>💡 주니어 개발자의 특급 무기: MVP (최소 기능 제품) 전략</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                게임을 처음 만들 때 흔히 하는 실수는 "아이템 상점도 넣고, 100종류 몬스터도 넣어야지!" 하고 욕심을 내다가 지쳐서 포기하는 것입니다.<br />
                진짜 멋진 개발자는 <strong>가장 핵심적인 재미 1가지(우주선이 별똥별을 피한다!)</strong>를 먼저 작고 빠르게 완성한 뒤, 조금씩 살을 붙여나갑니다. 이것을 소프트웨어 세상에서는 <strong>MVP(Minimum Viable Product, 최소 기능 제품)</strong>라고 부릅니다.
              </p>
            </div>

            {/* 루브릭 표 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">개발 단계</th>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">핵심 구현 내용</th>
                    <th className="p-2.5 sm:p-3 whitespace-nowrap">성공 판정 기준</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-cyan-700 whitespace-nowrap">1단계: 도화지 &amp; 조종사</td>
                    <td className="p-2.5 sm:p-3">HTML 캔버스를 깔고 키보드 화살표로 우주선을 좌우로 움직이기</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-800 whitespace-nowrap">조종 성공</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-indigo-700 whitespace-nowrap">2단계: 쏟아지는 별똥별</td>
                    <td className="p-2.5 sm:p-3">무작위 X 위치에서 생성된 별똥별이 중력처럼 아래로 계속 떨어지기</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 whitespace-nowrap">비행 장애물 출현</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-emerald-700 whitespace-nowrap">3단계: 충돌 &amp; 점수판</td>
                    <td className="p-2.5 sm:p-3">우주선과 별이 부딪히면 하트(-1) 감소, 끝까지 살아남으면 점수 획득!</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">MVP 완성</span></td>
                  </tr>
                </tbody>
              </table>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 3대 마법 원리</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 3대 마법 원리] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <article id="stage2" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                핵심 개념: 웹 게임을 움직이는 3대 마법 원리
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              멈춰 있는 웹페이지가 어떻게 손에 땀을 쥐게 하는 오락실 게임처럼 실시간으로 돌아갈 수 있을까요? 바로 아래 3가지 비밀 무기 덕분입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 원리 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs sm:text-sm mb-1">
                    <RotateCcw className="w-4 h-4 text-cyan-600" />
                    <span>1. 게임 루프 (Loop)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    1초에 60장을 넘기는 <strong>초고속 플립북 만화책</strong>! 컴퓨터는 1초에 60번씩 도화지를 하얗게 지우고, 별똥별 위치를 살짝 아래로 내린 뒤, 다시 그리는 동작을 번개처럼 반복합니다.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-cyan-700 bg-cyan-50 p-2 rounded-lg border border-cyan-100">
                  requestAnimationFrame(loop)
                </div>
              </div>

              {/* 원리 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs sm:text-sm mb-1">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>2. 조종간 안테나</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    손가락으로 키보드를 누르고(<code>keydown</code>) 뗄 때(<code>keyup</code>)마다 실시간으로 알아채는 귀마개 안테나입니다. 키를 꾹 누르고 있으면 우주선이 멈추지 않고 미끄러지듯 이동합니다.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  addEventListener('keydown')
                </div>
              </div>

              {/* 원리 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs sm:text-sm mb-1">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>3. 투명 범퍼카 센서</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    우주선과 별똥별을 둘러싼 <strong>투명한 사각형 상자</strong>가 서로 겹쳤는지 판정합니다(AABB 충돌 판정). 가로 좌표와 세로 좌표가 겹치는 순간 번쩍이며 하트가 깎입니다!
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-100">
                  if (p.x &lt; s.x + s.w ...)
                </div>
              </div>
            </div>
          </article>

              {/* 우측 아케이드 시뮬레이터 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [아케이드 시뮬레이터]를 플레이하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    HTML, CSS, JS가 하나로 합쳐진 완성형 미니 아케이드 게임을 직접 플레이할 차례입니다! 우측 콘솔의 <strong>[아케이드 시뮬레이터]</strong>에서 우주선을 좌우로 조종하여 하늘에서 떨어지는 별똥별을 피하고 생존 점수를 올려보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('arcade')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [아케이드 시뮬레이터] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 미션 브리핑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 3박자 조립 실습</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 3박자 조립 실습] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <article id="stage3" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                단계별 조립 실습: HTML 도화지 + CSS 우주복 + JS 심장 엔진
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              컴퓨터 게임은 복잡해 보여도 딱 3단계로 조립하면 누구나 쉽게 만들 수 있습니다. AI 코딩 도우미에게 보낼 수 있는 마법 프롬프트 카드를 활용해보세요!
            </p>

            <div className="space-y-3">
              {/* 1단계 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    1단계: HTML 도화지 (&lt;canvas&gt;) 펴기
                  </span>
                  <span className="text-[11px] font-mono text-indigo-200 font-medium">index.html</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  웹 브라우저에 가로 400px, 세로 280px 크기의 도화지를 깔고 점수판(HUD)을 올려놓습니다.
                </p>
                <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
{`<div class="game-container">
  <div class="hud">점수: <span id="score">0</span> | 생명: <span id="hp">❤️❤️❤️</span></div>
  <canvas id="gameCanvas" width="400" height="280"></canvas>
</div>`}
                </pre>
              </div>

              {/* 2단계 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    2단계: CSS 깊고 푸른 우주 감성 입히기
                  </span>
                  <span className="text-[11px] font-mono text-indigo-200 font-medium">style.css</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  캔버스 뒤편에 칠흑 같은 우주와 푸른 네온 테두리, 부드러운 그림자를 더해 오락실 느낌을 살립니다.
                </p>
                <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
{`#gameCanvas {
  background: radial-gradient(circle, #1e1b4b 0%, #030712 100%);
  border: 2px solid #38bdf8;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
}`}
                </pre>
              </div>

              {/* 3단계 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    3단계: JS 무한 게임 루프 &amp; 충돌 판정 가동
                  </span>
                  <span className="text-[11px] font-mono text-indigo-200 font-medium">game.js</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  우주선의 X 좌표를 키보드로 바꾸고, 별똥별 배열을 순회하며 충돌 여부를 감지합니다.
                </p>
                <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
{`function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateStars();      // 별똥별 아래로 떨어뜨리기
  drawPlayer();       // 우주선 그리기
  checkCollision();   // 부딪혔는지 검사!
  if (!isGameOver) requestAnimationFrame(gameLoop);
}`}
                </pre>
              </div>
            </div>

            {/* 프롬프트 카드 */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-600" />
                <span>원클릭 AI 실습 프롬프트 (복사해서 AI 도우미에게 질문해보세요!)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-700 block">프롬프트 1 : 기본 골격 생성</span>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1">
                      "HTML5 canvas를 사용해서 좌우 방향키로 네온 우주선을 조작하는 기본 게임 루프 템플릿 코드를 작성해줘."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("HTML5 canvas를 사용해서 좌우 방향키로 네온 우주선을 조작하는 기본 게임 루프 템플릿 코드를 작성해줘.", "p1")}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'p1' ? (
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

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-700 block">프롬프트 2 : 충돌 &amp; 점수 로직</span>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1">
                      "별똥별이 위에서 떨어질 때 우주선 사각형과 겹치는지 감지하는 AABB 충돌 판정 함수와 하트(-1) 감소 로직을 추가해줘."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("별똥별이 위에서 떨어질 때 우주선 사각형과 겹치는지 감지하는 AABB 충돌 판정 함수와 하트(-1) 감소 로직을 추가해줘.", "p2")}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'p2' ? (
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
              </div>
            </div>
          </article>

              {/* 우측 3박자 & 퀴즈 연동 알림 카드 */}
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
                      게임을 즐겼다면 우측 [3박자 & 퀴즈]에서 구조를 점검하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    게임 루프(Loop), 충돌 판정(Collision), 키보드 이벤트의 결합 구조를 확인하셨나요? 우측 콘솔의 <strong>[3박자 & 퀴즈]</strong> 탭에서 웹 3박자 역할 분담과 아키텍처 퀴즈를 풀고 나만의 MVP 개발자 카드를 완성하세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('arch')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [3박자 & 퀴즈] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 3대 마법 원리
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 아케이드 연구소</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 아케이드 연구소] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <article id="stage4" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                아케이드 연구소: 흔한 버그 2가지 해결 &amp; 자가 회고
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              게임을 만들다 보면 누구나 마주치는 황당한 버그들이 있습니다. 주니어 개발자의 날카로운 눈으로 해결해봅시다!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>버그 1: 우주선 화면 탈출 버그</span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  왼쪽이나 오른쪽 키를 계속 누르고 있으면 우주선이 캔버스 밖으로 영원히 사라져버립니다!
                </p>
                <div className="p-2 bg-white rounded-lg border border-red-200 text-[11px] font-mono text-emerald-700 leading-snug">
                  💡 <strong>해결책:</strong> 화면 끝을 넘지 못하게 가두는 조건문 추가!<br />
                  <code>player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));</code>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>버그 2: 게임오버 후 렉 유발 버그</span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  게임이 끝났는데도 루프가 멈추지 않아 뒤에서 수천 개의 별똥별이 쌓여 컴퓨터가 버벅거립니다!
                </p>
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-[11px] font-mono text-emerald-700 leading-snug">
                  💡 <strong>해결책:</strong> <code>isGameOver = true;</code> 신호로 <code>cancelAnimationFrame</code>을 즉시 호출합니다.
                </div>
              </div>
            </div>

            {/* 회고 입력 폼 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    나만의 아케이드 완성 소감 &amp; 추가하고 싶은 아이디어
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  {isRetroSaved ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-600 font-bold">자동 저장됨</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span>작성 대기 중</span>
                    </>
                  )}
                </span>
              </div>

              <textarea
                value={retroText}
                onChange={handleRetroChange}
                rows={3}
                placeholder="예시: 우주선을 직접 움직여 별똥별을 피할 때 짜릿했습니다! 나중에는 보너스 점수를 주는 황금 별이나 쉴드 아이템도 추가해보고 싶습니다."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>
          </article>

              {/* [실습 지시] 우측 체크리스트 및 10강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 10강을 여세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    오늘 완성한 6대 미니 아케이드 핵심 기능(키보드 조작, 점수 카운터, 게임오버 판정)을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 10강(버그 헌팅 대작전)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 10강 언락] 탭 바로 열기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

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
                  ← 이전: Stage 3 3박자 조립 실습
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
                  JUNIOR DEVELOPER GLOSSARY · 9강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 게임 개발자들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 게임 루프 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-amber-400" />
                      1. 게임 루프
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Game Loop (requestAnimationFrame)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">실행엔진/주기</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "1초에 60장 넘기는 초고속 플립북 만화책 마법입니다. 계속해서 그림을 지우고 새로 그려 움직이게 해요!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 초당 60회(60fps) 이상 화면을 지우고, 객체의 위치를 업데이트한 뒤 다시 렌더링하는 실시간 연속 게임 실행 주기(Cycle)입니다.
                </p>
              </div>
              {/* 용어 2: 바운딩 박스 충돌 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4 text-sky-400" />
                      2. 바운딩 박스 충돌
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 바운딩 박스 충돌 (AABB Collision Detection)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">물리/기하</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "투명한 범퍼카 보호 상자끼리 서로 닿았는지 쾅 부딪혀 확인하는 충돌 센서!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 2D 평면에서 축에 정렬된 사각형(Axis-Aligned Bounding Box)들의 좌표 범위가 서로 겹치는지(Overlap) 수학적으로 판별하는 고속 충돌 감지 기법입니다.
                </p>
              </div>
              {/* 용어 3: 이벤트 리스너 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Keyboard className="w-4 h-4 text-emerald-400" />
                      3. 이벤트 리스너
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Event Listener (keydown / keyup)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">입력/이벤트</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "손가락으로 키보드를 꾹 누르고 뗄 때마다 빛의 속도로 캐릭터에게 전갈을 보내는 전령사!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> DOM 요소 또는 윈도우 창에서 사용자의 입력 사건이 발생했을 때 이를 포착하여 비동기적으로 처리 루틴을 트리거하는 이벤트 구독 모델입니다.
                </p>
              </div>
              {/* 용어 4: 최소 기능 제품 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Rocket className="w-4 h-4 text-purple-400" />
                      4. 최소 기능 제품
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: MVP (Minimum Viable Product)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">소프트웨어 공학</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "처음부터 거대한 로봇을 만들기보다, 딱 걷기만 하는 꼬마 로봇부터 빠르게 만들어 시험해보는 똑똑한 방법!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자에게 가치를 줄 수 있는 최소한의 핵심 기능만을 담아 가장 빠르게 출시하여 시장의 피드백을 검증하는 린(Lean) 개발 원칙입니다.
                </p>
              </div>
              {/* 용어 5: 캔버스 API */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-rose-400" />
                      5. 캔버스 API
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: HTML5 Canvas API (getContext('2d'))</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">그래픽/렌더링</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "자바스크립트 마법 붓으로 마음대로 그림을 그리고 지우는 디지털 스케치북!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 스크립트(주로 JavaScript)를 사용하여 동적으로 비트맵 그래픽과 애니메이션을 2D 픽셀 단위로 직접 제어하고 렌더링하는 웹 그래픽 표준 인터페이스입니다.
                </p>
              </div>
              {/* 용어 6: 상태 기계 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <Workflow className="w-4 h-4 text-teal-400" />
                      6. 상태 기계
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: State Machine (Ready / Playing / GameOver)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">아키텍처/상태</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "시작 전(대기), 비행 중(플레이), 부딪힌 뒤(게임오버)처럼 딱 정해진 규칙에 따라서만 변신하는 로봇 두뇌!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 시스템이 가질 수 있는 유한한 상태(State)들과 이들 간의 전이(Transition) 규칙을 정의하여 복잡한 로직을 안정적으로 제어하는 유한 상태 기계(FSM) 모델입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* ------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭) - 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* ------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">

          {/* 3단 탭 네비게이션 */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveRightTab('arcade')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'arcade'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>아케이드 시뮬레이터</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('arch')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'arch'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>3박자 &amp; 퀴즈</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>체크리스트</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: 🎮 별똥별 피하기 아케이드 시뮬레이터 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'arcade' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 shadow-md space-y-3">
                {/* HUD */}
                <div className="flex items-center justify-between bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>점수:</span>
                    </span>
                    <span className="text-sm font-mono font-extrabold text-amber-300">{score}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">실드:</span>
                    <span className="text-xs font-mono tracking-wider text-rose-400">
                      {hp === 3 ? '❤️❤️❤️' : hp === 2 ? '❤️❤️🤍' : hp === 1 ? '❤️🤍🤍' : '🤍🤍🤍'}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        gameState === 'playing'
                          ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                          : gameState === 'gameover'
                          ? 'bg-rose-900/60 text-rose-300 border-rose-700/50'
                          : 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50'
                      }`}
                    >
                      {gameState === 'playing' ? '비행 중 🚀' : gameState === 'gameover' ? '게임 오버 💥' : '대기 중'}
                    </span>
                  </div>
                </div>

                {/* 캔버스 화면 */}
                <div className="relative w-full aspect-[4/2.8] bg-black rounded-xl overflow-hidden border border-cyan-500/30 shadow-inner flex items-center justify-center">
                  <canvas ref={canvasRef} width={400} height={280} className="w-full h-full block" />

                  {/* 오버레이 */}
                  {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Rocket className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-extrabold text-white">
                          {gameState === 'gameover' ? '💥 우주선 격추! 게임 오버' : '별똥별 피하기 MVP 아케이드'}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                          {gameState === 'gameover'
                            ? `최종 점수: ${score}점! 다시 도전해서 최고 기록을 세워보세요!`
                            : '키보드 좌우 방향키나 하단 버튼으로 우주선을 조종해 떨어지는 별똥별을 피하세요!'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startGame}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{gameState === 'gameover' ? '다시 도전하기 (Retry)' : '우주선 출격하기 (Start)'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 온스크린 조종간 */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>온스크린 조종간 (터치/클릭):</span>
                    <span className="font-mono text-[10px] text-slate-500">키보드: ← / → 또는 A / D</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onMouseDown={() => handleTouchControl('left', true)}
                      onMouseUp={() => handleTouchControl('left', false)}
                      onMouseLeave={() => handleTouchControl('left', false)}
                      onTouchStart={() => handleTouchControl('left', true)}
                      onTouchEnd={() => handleTouchControl('left', false)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 text-cyan-400" />
                      <span>◀ 왼쪽 이동 (A)</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => handleTouchControl('right', true)}
                      onMouseUp={() => handleTouchControl('right', false)}
                      onMouseLeave={() => handleTouchControl('right', false)}
                      onTouchStart={() => handleTouchControl('right', true)}
                      onTouchEnd={() => handleTouchControl('right', false)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer"
                    >
                      <span>오른쪽 이동 (D) ▶</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                </div>

                {/* 난이도 조율 노브 */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>난이도 조율 노브 (Tuning Knobs)</span>
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {difficulty === 'easy' ? '1단계: 천천히' : difficulty === 'hard' ? '3단계: 광속' : '2단계: 표준 속도'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['easy', 'normal', 'hard'] as DifficultyType[]).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          difficulty === lvl
                            ? 'bg-cyan-600 border border-cyan-500 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                        }`}
                      >
                        {lvl === 'easy' ? '1단계 (천천히)' : lvl === 'hard' ? '3단계 (광속)' : '2단계 (표준)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 실시간 JS 게임 엔진 뷰어 */}
              <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>실시간 자바스크립트 게임 엔진 뷰어</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
                    60 FPS 렌더링
                  </span>
                </div>

                <textarea
                  readOnly
                  rows={6}
                  value={viewerCode}
                  className="w-full p-2.5 bg-black/80 text-emerald-400 font-mono text-[11px] rounded-xl border border-slate-800 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* 💡 핵심 3대 공식 요약 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-cyan-950 font-bold text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4 text-cyan-600" />
                  <span>💡 별똥별 피하기 핵심 3대 공식 요약 카드</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">1. 무한 렌더링 루프:</span>
                    <code className="text-cyan-700 font-mono text-[10.5px]">requestAnimationFrame(gameLoop);</code>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">2. 사각형 AABB 충돌 판정:</span>
                    <code className="text-indigo-700 font-mono text-[10.5px]">
                      if (p.x &lt; s.x + s.w &amp;&amp; p.x + p.w &gt; s.x &amp;&amp; p.y &lt; s.y + s.h &amp;&amp; p.y + p.h &gt; s.y)
                    </code>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">3. 캔버스 벽 가두기 공식:</span>
                    <code className="text-emerald-700 font-mono text-[10.5px]">player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: 💡 3박자 아키텍처 & 아케이드 퀴즈 배틀 */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'arch' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <span>웹 게임을 만드는 3총사 아키텍처</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-cyan-900">
                    <strong className="font-bold">1. HTML:</strong> &lt;canvas&gt; 태그로 도화지 깔기
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900">
                    <strong className="font-bold">2. CSS:</strong> 칠흑 같은 우주와 네온 빛 테두리
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                    <strong className="font-bold">3. JavaScript:</strong> 키보드 감지와 1초 60번 게임 루프
                  </div>
                </div>
              </div>

              {/* 퀴즈 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <HelpCircle className="w-4 h-4 text-cyan-600" />
                    <span>아케이드 로직 스피드 퀴즈</span>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-600 font-mono">
                    문제 {quizIndex + 1} / {quizData.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                    {quizData[quizIndex].q}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {quizData[quizIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuizAnswer(idx)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          selectedQuizOption === idx
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {quizFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-normal leading-relaxed ${
                        quizFeedback.isCorrect
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border border-rose-200 text-rose-900'
                      }`}
                    >
                      <strong>{quizFeedback.isCorrect ? '🎉 정답입니다!' : '아쉬워요!'}</strong>{' '}
                      {quizFeedback.text}
                    </div>
                  )}
                </div>

                {quizFeedback && (
                  <button
                    type="button"
                    onClick={handleNextQuiz}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  >
                    다음 문제 풀기 →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: 📋 9강 자가 점검 (6문항 & 10강 언락) */}
          {/* ----------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      9강 퀘스트 완주 자가 점검 (6문항)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-cyan-600 font-mono">
                    {completedChecklistCount} / 6 완료 ({Math.round((completedChecklistCount / 6) * 100)}%)
                  </span>
                </div>

                {/* 게이지 바 */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${(completedChecklistCount / 6) * 100}%` }}
                  />
                </div>

                {/* 6문항 체크리스트 */}
                <div className="space-y-2 pt-1 text-xs" data-checklist-lesson="lesson_09">
                  {[
                    { key: 'c1', text: '1. HTML <canvas>가 컴퓨터 화면에 그래픽을 그리는 디지털 도화지임을 이해했나요?' },
                    { key: 'c2', text: '2. 1초에 60번 지우고 다시 그리는 게임 루프(requestAnimationFrame)의 원리를 확인했나요?' },
                    { key: 'c3', text: '3. 키보드 이벤트(keydown / keyup)로 우주선을 좌우로 매끄럽게 조작해보았나요?' },
                    { key: 'c4', text: '4. 우주선과 별똥별의 상자가 겹치는지 검사하는 AABB 충돌 감지의 기본 원리를 배웠나요?' },
                    { key: 'c5', text: '5. 거대한 게임을 만들기 전 핵심 재미부터 작게 만드는 MVP 개발 방식을 이해했나요?' },
                    { key: 'c6', text: '6. 좌측 최하단의 [주니어 개발자를 위한 전문 용어 돋보기] 6단어를 끝까지 읽고 이해했나요?' },
                  ].map(item => {
                    const isChecked = checklist[item.key as keyof typeof checklist];
                    return (
                      <label
                        key={item.key}
                        onClick={() => toggleCheckItem(item.key as keyof typeof checklist)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-cyan-300 bg-cyan-50/70 text-cyan-900 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="leading-snug">{item.text}</span>
                      </label>
                    );
                  })}
                </div>

                {!isAllCompleted ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>앞으로 {6 - completedChecklistCount}개만 더 완료하면 10강이 열립니다!</span>
                    <span className="font-bold text-slate-400">잠김 🔒</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 via-blue-50 to-emerald-50 border border-cyan-300 space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-cyan-950 font-bold text-xs sm:text-sm">
                      <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                      <span>축하합니다! 시즌 2 미니 프로젝트 완주 성공!</span>
                    </div>
                    <p className="text-xs text-cyan-950 leading-relaxed font-normal">
                      당신은 이제 HTML, CSS, JavaScript를 총동원하여 살아 움직이는 게임을 만드는 **주니어 프론트엔드 아케이드 마스터**입니다!<br />
                      이제 다음 **시즌 3의 시작 · 10강(AI 코딩 도구와 버그 사냥꾼: 콘솔 에러 분석 &amp; AI 디버깅 배틀)**으로 넘어가 강력한 버그 사냥꾼이 되어봅시다!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Lesson09;
