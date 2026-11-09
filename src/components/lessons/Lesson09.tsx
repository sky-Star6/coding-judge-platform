import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Award,
  Gamepad2,
  Rocket,
  Play,
  RotateCcw,
  Copy,
  Check,
  Search,
  Flame,
  Bot,
  Lightbulb,
  Workflow,
  Repeat,
  Crosshair,
  Trophy,
  Layers
} from 'lucide-react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

export const Lesson09: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. 스테이지 상태 관리
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all'>('stage1');

  // ---------------------------------------------------------------------------
  // 2. 프롬프트 복사 피드백 상태
  // ---------------------------------------------------------------------------
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyPrompt = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  // ---------------------------------------------------------------------------
  // 3. 자가 점검 체크리스트 상태
  // ---------------------------------------------------------------------------
  const [checklist, setChecklist] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_09_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  });

  const handleToggleCheck = (num: number) => {
    setChecklist(prev => {
      const next = { ...prev, [num]: !prev[num] };
      try {
        localStorage.setItem('ai_lesson_09_checklist', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / 6) * 100);
  const isAllComplete = checkedCount === 6;

  useEffect(() => {
    try {
      if (isAllComplete) {
        localStorage.setItem('ai_lesson_09_completed', 'true');
      } else {
        localStorage.removeItem('ai_lesson_09_completed');
      }
    } catch (e) {}
  }, [isAllComplete]);

  // ---------------------------------------------------------------------------
  // 4. 별똥별 피하기 아케이드 캔버스 게임 엔진
  // ---------------------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState<number>(0);
  const [hp, setHp] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [activeStarCount, setActiveStarCount] = useState<number>(0);

  const gameStateRef = useRef<'ready' | 'playing' | 'gameover'>('ready');
  gameStateRef.current = gameState;

  const difficultyRef = useRef<'easy' | 'normal' | 'hard'>('normal');
  difficultyRef.current = difficulty;

  const playerRef = useRef({ x: 185, y: 245, w: 30, h: 24, speed: 5.2 });
  const starsRef = useRef<Star[]>([]);
  const keysRef = useRef<{ ArrowLeft: boolean; ArrowRight: boolean; KeyA: boolean; KeyD: boolean }>({
    ArrowLeft: false,
    ArrowRight: false,
    KeyA: false,
    KeyD: false
  });
  const animationFrameIdRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.ArrowLeft = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.ArrowRight = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.ArrowLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.ArrowRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouchKey = (dir: 'left' | 'right', isPressed: boolean) => {
    if (dir === 'left') {
      keysRef.current.ArrowLeft = isPressed;
      keysRef.current.KeyA = isPressed;
    } else {
      keysRef.current.ArrowRight = isPressed;
      keysRef.current.KeyD = isPressed;
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHp(3);
    starsRef.current = [];
    frameCountRef.current = 0;
    playerRef.current.x = 185;

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    gameLoop();
  };

  const gameLoop = () => {
    if (gameStateRef.current !== 'playing') return;

    frameCountRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. 난이도 설정값
    let fallSpeed = 3.6;
    let spawnRate = 28;
    if (difficultyRef.current === 'easy') {
      fallSpeed = 2.4;
      spawnRate = 38;
    } else if (difficultyRef.current === 'hard') {
      fallSpeed = 5.2;
      spawnRate = 18;
    }

    // 2. 플레이어 이동
    if (keysRef.current.ArrowLeft || keysRef.current.KeyA) {
      playerRef.current.x -= playerRef.current.speed;
    }
    if (keysRef.current.ArrowRight || keysRef.current.KeyD) {
      playerRef.current.x += playerRef.current.speed;
    }
    playerRef.current.x = Math.max(5, Math.min(canvas.width - playerRef.current.w - 5, playerRef.current.x));

    // 3. 점수 증가
    if (frameCountRef.current % 6 === 0) {
      setScore(prev => prev + 1);
    }

    // 4. 별똥별 스폰
    if (frameCountRef.current % spawnRate === 0) {
      const starX = Math.random() * (canvas.width - 24) + 12;
      const starSize = Math.random() * 8 + 10;
      const speed = fallSpeed + (Math.random() * 1.5 - 0.7);
      starsRef.current.push({
        x: starX,
        y: -15,
        size: starSize,
        speed,
        color: Math.random() < 0.2 ? '#facc15' : '#38bdf8'
      });
    }

    // 5. 충돌 판정 및 업데이트
    const player = playerRef.current;
    for (let i = starsRef.current.length - 1; i >= 0; i--) {
      const s = starsRef.current[i];
      s.y += s.speed;

      // AABB 충돌 검사
      if (
        player.x < s.x + s.size &&
        player.x + player.w > s.x - s.size &&
        player.y < s.y + s.size &&
        player.y + player.h > s.y - s.size
      ) {
        starsRef.current.splice(i, 1);
        setHp(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setGameState('gameover');
            // 체크리스트 4번 자동 활성화
            setChecklist(c => ({ ...c, 4: true }));
          }
          return Math.max(0, next);
        });
        continue;
      }

      if (s.y > canvas.height + 20) {
        starsRef.current.splice(i, 1);
      }
    }

    setActiveStarCount(starsRef.current.length);

    // 6. 화면 렌더링
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 우주 배경 별빛
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 20; i++) {
      const bx = (i * 37 + frameCountRef.current * 0.2) % canvas.width;
      const by = (i * 23) % canvas.height;
      ctx.fillRect(bx, by, 1.5, 1.5);
    }

    // 별똥별
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
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(player.x + player.w / 2, player.y);
    ctx.lineTo(player.x, player.y + player.h);
    ctx.lineTo(player.x + player.w / 2, player.y + player.h - 5);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.closePath();
    ctx.fill();

    // 부스터 불꽃
    if (frameCountRef.current % 4 < 2) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2 - 4, player.y + player.h - 3);
      ctx.lineTo(player.x + player.w / 2, player.y + player.h + 6);
      ctx.lineTo(player.x + player.w / 2 + 4, player.y + player.h - 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    if (gameStateRef.current === 'playing') {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 25; i++) {
      const bx = (i * 37) % canvas.width;
      const by = (i * 23) % canvas.height;
      ctx.fillRect(bx, by, 1.5, 1.5);
    }

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* ===================================================================== */}
      {/* [상단 고정 풀 너비 GNB 헤더] 1강 최신 표준                              */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/materials/ai/index.html"
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-indigo-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  9강: 하늘에서 쏟아지는 별똥별을 피해라!
                </span>
              </div>
            </div>
          </div>

          {/* 4단계 스테이지 스위처 (1강 최신 표준 20px 원형 배지) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage1' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>미션 &amp; 원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage2' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>아케이드 실습</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage3' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage4')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                activeStage === 'stage4' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                4
              </span>
              <span>자가 점검</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ml-1 ${
                activeStage === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 보기
            </button>
          </nav>
        </div>
      </header>

      {/* 모바일 전용 스테이지 탭 바 */}
      <nav className="md:hidden flex items-center justify-around gap-1 px-3 py-2 bg-white border-b border-slate-200 sticky top-16 z-30 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage1' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. 미션&amp;원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage2' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. 아케이드 실습
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage3' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. 실전 AI
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'stage4' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. 자가 점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
            activeStage === 'all' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'
          }`}
        >
          전체
        </button>
      </nav>

      {/* ===================================================================== */}
      {/* [단일 컨테이너 몰입형 워크스페이스] max-w-4xl mx-auto                    */}
      {/* ===================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* =================================================================== */}
        {/* STAGE 01: 퀘스트 미션 브리핑 & 핵심 개념 원리                         */}
        {/* =================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-1-title">
            
            {/* 1. 미션 브리핑 히어로 카드 */}
            <article className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-indigo-500/20">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    시즌 2 완주 미니 프로젝트 · 실시간 웹 아케이드
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    HTML5 Canvas + Game Loop + Collision Detection
                  </span>
                </div>
                <h2 id="stage-1-title" className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  하늘에서 쏟아지는 별똥별을 피해라! 🌠
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  HTML 도화지 위에 CSS로 우주를 꾸미고, 자바스크립트의 무한 심장 박동(Game Loop)과 충돌 감지로 나만의 첫 웹 게임을 완성해 보세요!
                </p>
              </div>

              {/* 3대 도전 목표 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">무한 게임 루프</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    1초에 60번씩 화면을 다시 그리는 requestAnimationFrame 심장 박동 이해하기
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">실시간 충돌 판정</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    우주선과 별똥별이 닿았는지 알아채는 AABB 충돌 알고리즘과 HP 시스템
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">키보드 &amp; 터치 제어</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    방향키와 모바일 터치 버튼으로 부드럽게 조종하고 생존 점수 획득하기
                  </p>
                </div>
              </div>
            </article>

            {/* 2. 웹 게임 3총사 핵심 원리 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>🕹️ 웹 게임을 살아 숨쉬게 만드는 3대 핵심 원리</span>
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  비디오 게임은 복잡해 보이지만, 사실 컴퓨터의 "도화지 준비 -&gt; 무한 반복 -&gt; 부딪힘 감지" 3단계가 전부입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <span className="text-xl">🎨</span>
                    <h4 className="text-base font-bold text-slate-900">도화지 (&lt;canvas&gt;)</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    🧸 <strong>어린이 비유:</strong> 자바스크립트 화가가 1초에 60번씩 우주선과 별을 뚝딱 그리는 마법의 스케치북!
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> HTML5 &lt;canvas&gt; 태그와 2D 렌더링 컨텍스트(getContext('2d'))를 활용해 픽셀 단위로 그래픽을 동적 출력합니다.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <span className="text-xl">💓</span>
                    <h4 className="text-base font-bold text-slate-900">게임 루프 (Game Loop)</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    🧸 <strong>어린이 비유:</strong> 멈추지 않고 뛰는 컴퓨터의 심장 박동! "위치 계산 -&gt; 화면 그리기 -&gt; 다시 반복!"
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> requestAnimationFrame()을 호출해 모니터 주사율(60Hz)에 맞춰 끊김 없이 화면을 갱신하는 핵심 제어 루프입니다.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <span className="text-xl">💥</span>
                    <h4 className="text-base font-bold text-slate-900">충돌 판정 (Collision)</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    🧸 <strong>어린이 비유:</strong> 우주선 둘레에 보이지 않는 투명 상자를 씌우고, 별똥별 상자와 겹치면 "아야!" 하는 감각 센서!
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 사각형 바운딩 박스(AABB) 또는 좌표 거리 공식을 사용해 두 물체가 겹쳤는지 판별하고 상태를 갱신합니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-indigo-900">
                <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <strong className="font-bold">주니어 개발자 제1원칙:</strong> "게임은 처음부터 거대하게 만들지 않고, 가장 단순하게 굴러가는 핵심 재미(MVP)를 먼저 출시한 뒤 하나씩 살을 붙여 나간다!"
                </div>
              </div>
            </article>

            {/* 단계 이동 버튼 바 */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 2단계 아케이드 실습 콘솔</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 실습 콘솔 (별똥별 피하기 아케이드)           */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-2-title">
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              
              {/* 콘솔 헤더 */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-cyan-400" />
                    <h3 id="stage-2-title" className="text-base sm:text-lg font-bold text-white">가상 웹 아케이드 스튜디오</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">순수 JS 엔진</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    키보드 좌우 방향키(←, →) 또는 하단 버튼을 눌러 떨어지는 별똥별을 피하세요!
                  </p>
                </div>

                {/* 난이도 칩 */}
                <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                  <span className="text-sm text-slate-400 px-2 font-semibold">난이도:</span>
                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      difficulty === 'easy' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    쉬움
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('normal')}
                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      difficulty === 'normal' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    보통
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      difficulty === 'hard' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    어려움
                  </button>
                </div>
              </div>

              {/* HUD 상태 바 */}
              <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-400 font-bold">SCORE:</span>
                    <span className="text-lg font-extrabold text-amber-400">{score}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold">HP:</span>
                    <span className="text-rose-400 font-bold tracking-widest">
                      {'❤️'.repeat(hp) + '🖤'.repeat(Math.max(0, 3 - hp))}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  gameState === 'playing'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : gameState === 'gameover'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}>
                  {gameState === 'playing' ? '비행 중 🚀' : gameState === 'gameover' ? '게임 오버 💥' : '비행 대기 🛸'}
                </span>
              </div>

              {/* 캔버스 화면 */}
              <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-black rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl">
                <canvas ref={canvasRef} width={400} height={300} className="w-full h-full block" />

                {gameState !== 'playing' && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      {gameState === 'gameover' ? `게임 오버! 최종 점수: ${score}점 🌟` : '별똥별 피하기 아케이드'}
                    </h4>
                    <p className="text-sm text-slate-300 max-w-xs">
                      {gameState === 'gameover'
                        ? '별똥별과의 충돌을 피하며 우주 비행을 성공시켰습니다. 다시 도전해 보세요!'
                        : '우주선을 좌우로 조종하여 쏟아지는 별똥별을 피하고 높은 점수를 달성해 보세요!'}
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="mt-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{gameState === 'gameover' ? '다시 비행하기 🔄' : '게임 시작하기 🚀'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 버튼 컨트롤러 */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  onMouseDown={() => handleTouchKey('left', true)}
                  onMouseUp={() => handleTouchKey('left', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchKey('left', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchKey('left', false); }}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-bold text-sm border border-slate-700 transition-all flex items-center gap-2 select-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>왼쪽 (A / ←)</span>
                </button>

                <button
                  type="button"
                  onMouseDown={() => handleTouchKey('right', true)}
                  onMouseUp={() => handleTouchKey('right', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchKey('right', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchKey('right', false); }}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-bold text-sm border border-slate-700 transition-all flex items-center gap-2 select-none cursor-pointer"
                >
                  <span>오른쪽 (D / →)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 텔레메트리 리포트 */}
              <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Workflow className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-white">실시간 게임 엔진 텔레메트리 리포트</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">화면 주사율 (FPS)</span>
                    <span className="text-emerald-400 font-mono font-bold">60 FPS (requestAnimationFrame)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">화면 내 별똥별</span>
                    <span className="text-cyan-400 font-mono font-bold">{activeStarCount}개 활성</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">충돌 감지 알고리즘</span>
                    <span className="text-amber-400 font-mono font-bold">AABB 박스 충돌 공식</span>
                  </div>
                </div>
              </div>
            </article>

            {/* 단계 이동 버튼 바 */}
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
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 3단계 실전 AI 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 03: 실전! 최신 AI 5대 킬러 퀘스트 (QUEST 01 ~ QUEST 05 고정)     */}
        {/* =================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8" aria-labelledby="stage-3-title">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-extrabold uppercase tracking-wider">STAGE 03 · 실전 최신 AI 5대 킬러 퀘스트</span>
              </div>
              <h3 id="stage-3-title" className="text-base sm:text-lg font-bold text-slate-900">
                실제 ChatGPT와 Gemini에게 명령하여 웹 게임을 고도화해 보세요!
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                실제 외부 AI 창을 띄워두고 [프롬프트 복사] 버튼을 눌러 테스트해 보세요. 개발자들이 현업에서 쓰는 게임 로직의 비밀을 배울 수 있습니다.
              </p>
            </div>

            <div className="space-y-6">
              
              {/* QUEST 01 */}
              <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💓</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">QUEST 01. 1초에 60번 뛰는 게임 루프 소환하기</h4>
                      <span className="text-sm font-mono text-indigo-600 font-bold block">requestAnimationFrame 심장 박동 템플릿</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(1, `[Goal]:\nHTML5 캔버스(Canvas) 기반 미니 아케이드 게임을 만들기 위해, 1초에 60번 화면을 부드럽게 다시 그리는 requestAnimationFrame 게임 루프 자바스크립트 템플릿을 작성해 줘.\n\n[Condition]:\n1. update() 함수에서는 게임 오브젝트의 위치를 계산하고, render() 함수에서는 캔버스를 지우고 다시 그리도록 역할을 분리해 줘.\n2. 게임이 일시정지(pause)되거나 게임오버(gameOver)되었을 때 루프를 멈추는 cancelAnimationFrame 처리도 포함해 줘.\n3. 초보 학생도 이해할 수 있게 각 코드 줄마다 친절한 한국어 주석을 달아줘.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 1 ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
HTML5 캔버스(Canvas) 기반 미니 아케이드 게임을 만들기 위해, 1초에 60번 화면을 부드럽게 다시 그리는 requestAnimationFrame 게임 루프 자바스크립트 템플릿을 작성해 줘.

[Condition]:
1. update() 함수에서는 게임 오브젝트의 위치를 계산하고, render() 함수에서는 캔버스를 지우고 다시 그리도록 역할을 분리해 줘.
2. 게임이 일시정지(pause)되거나 게임오버(gameOver)되었을 때 루프를 멈추는 cancelAnimationFrame 처리도 포함해 줘.
3. 초보 학생도 이해할 수 있게 각 코드 줄마다 친절한 한국어 주석을 달아줘.`}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-amber-600" />
                      최신 AI의 소환 마법
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      화면이 깜빡거리지 않고 60 FPS로 물 흐르듯 작동하는 완벽한 게임 루프 뼈대 코드를 즉시 소환해 냅니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      컴퓨터 과학 비밀
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      setInterval 대신 requestAnimationFrame을 쓰면 브라우저가 모니터 주사율과 완벽히 동기화되어 끊김 현상을 방지합니다.
                    </p>
                  </div>
                </div>
              </article>

              {/* QUEST 02 */}
              <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💥</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">QUEST 02. 우주선과 별똥별의 거리를 재는 충돌 판정</h4>
                      <span className="text-sm font-mono text-indigo-600 font-bold block">AABB 박스 충돌 &amp; 피타고라스 거리 계산</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(2, `[Goal]:\n웹 캔버스 게임에서 우주선(Player)과 하늘에서 떨어지는 별똥별(Meteor)이 서로 부딪혔는지 감지하는 충돌 판정(Collision Detection) 함수를 작성해 줘.\n\n[Condition]:\n1. 사각형 바운딩 박스(AABB) 방식과 원형 중심 거리(Math.hypot) 방식 중 게임에 가장 적합한 방식을 제안해 줘.\n2. 충돌이 감지되면 true를 반환하고, 플레이어의 HP를 1 깎고 별똥별을 배열에서 제거(splice)하는 로직을 보여줘.\n3. 중학생 눈높이에서 x, y 좌표 차이와 크기 비교 원리를 주석으로 설명해 줘.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 2 ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
웹 캔버스 게임에서 우주선(Player)과 하늘에서 떨어지는 별똥별(Meteor)이 서로 부딪혔는지 감지하는 충돌 판정(Collision Detection) 함수를 작성해 줘.

[Condition]:
1. 사각형 바운딩 박스(AABB) 방식과 원형 중심 거리(Math.hypot) 방식 중 게임에 가장 적합한 방식을 제안해 줘.
2. 충돌이 감지되면 true를 반환하고, 플레이어의 HP를 1 깎고 별똥별을 배열에서 제거(splice)하는 로직을 보여줘.
3. 중학생 눈높이에서 x, y 좌표 차이와 크기 비교 원리를 주석으로 설명해 줘.`}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-amber-600" />
                      최신 AI의 소환 마법
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      복잡한 수학 계산 없이도 컴퓨터가 "앗! 부딪혔다!"를 1초에 60번 정확하게 판정하는 감각 함수를 제공합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      컴퓨터 과학 비밀
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      게임 속 모든 물리적 상호작용은 눈에 보이지 않는 좌표 간의 덧셈·뺄셈 수학 계산으로 구현됩니다.
                    </p>
                  </div>
                </div>
              </article>

              {/* QUEST 03 */}
              <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">QUEST 03. 얼음판 위를 미끄러지듯 부드러운 관성 조작</h4>
                      <span className="text-sm font-mono text-indigo-600 font-bold block">가속도와 마찰력(Friction) 물리 엔진</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(3, `[Goal]:\n우주선 조작감을 업그레이드하기 위해, 방향키를 누르면 딱딱하게 끊기지 않고 부드럽게 가속도가 붙으며 미끄러지는 관성(Inertia) 이동 코드를 작성해 줘.\n\n[Condition]:\n1. 속도 변수(vx)와 마찰력 계수(friction = 0.92)를 적용해 키를 뗐을 때 자연스럽게 감속되게 해줘.\n2. 캔버스 화면 왼쪽/오른쪽 벽에 부딪혔을 때 화면 밖으로 탈출하지 못하도록 멈추는 경계 제한을 걸어줘.\n3. 이벤트 리스너에서 keydown/keyup 플래그를 객체(keys)로 관리하는 표준 방식을 사용해 줘.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 3 ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
우주선 조작감을 업그레이드하기 위해, 방향키를 누르면 딱딱하게 끊기지 않고 부드럽게 가속도가 붙으며 미끄러지는 관성(Inertia) 이동 코드를 작성해 줘.

[Condition]:
1. 속도 변수(vx)와 마찰력 계수(friction = 0.92)를 적용해 키를 뗐을 때 자연스럽게 감속되게 해줘.
2. 캔버스 화면 왼쪽/오른쪽 벽에 부딪혔을 때 화면 밖으로 탈출하지 못하도록 멈추는 경계 제한을 걸어줘.
3. 이벤트 리스너에서 keydown/keyup 플래그를 객체(keys)로 관리하는 표준 방식을 사용해 줘.`}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-amber-600" />
                      최신 AI의 소환 마법
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      키보드를 살짝만 눌러도 우주선이 스케이트를 타듯 매끄럽게 비행하는 고급 조작감을 완성해 줍니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      컴퓨터 과학 비밀
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      현실 세계의 물리 법칙(가속도, 마찰력, 중력)을 수학 변수로 흉내 내는 것을 게임 물리학(Game Physics)이라고 부릅니다.
                    </p>
                  </div>
                </div>
              </article>

              {/* QUEST 04 */}
              <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">QUEST 04. 15초마다 터지는 피버 타임 &amp; 황금 별 보너스</h4>
                      <span className="text-sm font-mono text-indigo-600 font-bold block">타이머 이벤트 &amp; 룰 반전(Bonus Party)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(4, `[Goal]:\n게임의 긴장감과 재미를 높이기 위해, 15초마다 5초 동안 배경이 네온 핑크로 바뀌며 황금 별이 쏟아지는 '피버 타임(Fever Time)' 시스템을 추가해 줘.\n\n[Condition]:\n1. 피버 타임 중에는 별똥별을 피하는 대신 '먹으면 점수가 10점씩 오르는' 보너스 모드로 규칙이 반전되게 해줘.\n2. 화면 상단에 'FEVER TIME! X2' 네온 텍스트가 깜빡이도록 캔버스 드로잉 효과를 넣어줘.\n3. 초보 개발자도 기존 코드에 쉽게 끼워 넣을 수 있도록 feverMode 불리언 플래그 기반으로 작성해 줘.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 4 ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
게임의 긴장감과 재미를 높이기 위해, 15초마다 5초 동안 배경이 네온 핑크로 바뀌며 황금 별이 쏟아지는 '피버 타임(Fever Time)' 시스템을 추가해 줘.

[Condition]:
1. 피버 타임 중에는 별똥별을 피하는 대신 '먹으면 점수가 10점씩 오르는' 보너스 모드로 규칙이 반전되게 해줘.
2. 화면 상단에 'FEVER TIME! X2' 네온 텍스트가 깜빡이도록 캔버스 드로잉 효과를 넣어줘.
3. 초보 개발자도 기존 코드에 쉽게 끼워 넣을 수 있도록 feverMode 불리언 플래그 기반으로 작성해 줘.`}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-amber-600" />
                      최신 AI의 소환 마법
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      피하기만 하던 수동적인 게임이 갑자기 신나는 보너스 파티 타임으로 뒤바뀌는 룰 반전 코드를 제안합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      컴퓨터 과학 비밀
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      게임 디자이너들은 유저가 지루해하지 않도록 일정한 시간 주기나 확률로 규칙이 바뀌는 '변주(Dynamic Event)'를 배치합니다.
                    </p>
                  </div>
                </div>
              </article>

              {/* QUEST 05 */}
              <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👾</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">QUEST 05. 외계 보스 등장 &amp; 미사일 발사 슈팅 확장</h4>
                      <span className="text-sm font-mono text-indigo-600 font-bold block">투사체(Projectile) 배열 &amp; 애자일 기능 확장</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(5, `[Goal]:\n별똥별 피하기 아케이드 게임에, 50점을 넘기면 거대한 외계 보스 몬스터가 상단에 등장하고 플레이어가 스페이스바로 미사일을 쏘아 격추하는 보스전 기능을 추가해 줘.\n\n[Condition]:\n1. 플레이어가 쏘는 미사일 배열(bullets)을 만들고 위쪽으로 날아가는 궤적을 그려줘.\n2. 보스의 HP 게이지 바를 상단에 표시하고, 미사일이 보스에게 닿았을 때 보스 HP가 깎이는 충돌 로직을 구현해 줘.\n3. 코드가 너무 복잡해지지 않도록 핵심 보스 객체와 발사 로직만 간결하고 명확하게 작성해 줘.`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 5 ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">복사됨! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>프롬프트 복사</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
{`[Goal]:
별똥별 피하기 아케이드 게임에, 50점을 넘기면 거대한 외계 보스 몬스터가 상단에 등장하고 플레이어가 스페이스바로 미사일을 쏘아 격추하는 보스전 기능을 추가해 줘.

[Condition]:
1. 플레이어가 쏘는 미사일 배열(bullets)을 만들고 위쪽으로 날아가는 궤적을 그려줘.
2. 보스의 HP 게이지 바를 상단에 표시하고, 미사일이 보스에게 닿았을 때 보스 HP가 깎이는 충돌 로직을 구현해 줘.
3. 코드가 너무 복잡해지지 않도록 핵심 보스 객체와 발사 로직만 간결하고 명확하게 작성해 줘.`}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-amber-600" />
                      최신 AI의 소환 마법
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      단순한 피하기 게임이 레트로 오락실의 슈팅 명작 게임(갤러그/인베이더)으로 진화하는 확장 코드를 구현합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                    <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      컴퓨터 과학 비밀
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      소프트웨어 개발에서는 가장 단순한 버전(MVP)을 먼저 동작시킨 뒤 새로운 기능을 계단식으로 추가하는 애자일(Agile) 방식을 사용합니다.
                    </p>
                  </div>
                </div>
              </article>

            </div>

            {/* 단계 이동 버튼 바 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 2단계 아케이드 실습</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 4단계 점검 &amp; 언락</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 04: 전문 용어 돋보기 & 자가 점검 체크리스트                     */}
        {/* =================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-6" aria-labelledby="stage-4-title">

            {/* 1. 전문 용어 돋보기 */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Search className="w-4 h-4" />
                  <h3 id="stage-4-title" className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 9강 웹 아케이드 미니 프로젝트에서 사용된 실제 공식 컴퓨터 과학 / 게임 개발 표준 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>💓</span>
                      <span>게임 루프</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Game Loop / 1초에 60번 깜빡이는 컴퓨터의 숨결</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 멈추지 않고 계속 뛰는 컴퓨터의 심장 박동! 계산하고, 그리고, 또 반복하기!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 사용자 입력 처리, 게임 상태 갱신, 화면 렌더링 과정을 매 프레임마다 끊임없이 반복 실행하는 핵심 제어 루프.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>캔버스</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Canvas (&lt;canvas&gt;) / 자바스크립트 화가의 디지털 스케치북</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 자바스크립트 명령어를 붓 삼아 점, 선, 도형, 그림을 자유자재로 그려내는 마법의 백지 도화지!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 웹 브라우저에서 스크립트를 통해 비트맵 그래픽을 동적으로 렌더링할 수 있도록 지원하는 HTML5 표준 그래픽 컨테이너.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>💥</span>
                      <span>충돌 판정</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Collision Detection / 두 물체가 부딪혔는지 알아내는 감각 센서</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 캐릭터와 장애물 둘레에 보이지 않는 상자를 씌우고, 상자가 겹치는 순간 "쿵!" 소리를 내는 촉각 신경!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 게임 내 둘 이상의 기하학적 오브젝트(AABB 상자, 원형 등)가 물리적으로 교차하는지 좌표 연산으로 판별하는 계산 알고리즘.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🚀</span>
                      <span>최소 기능 제품</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">MVP (Minimum Viable Product) / 가장 핵심 재미만 먼저 굴리는 1호 발명품</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 완벽한 성을 한 번에 지으려다 지치지 않고, 먼저 튼튼한 텐트부터 쳐서 하룻밤 캠핑해 보는 것!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 사용자에게 핵심 가치를 전달할 수 있는 최소한의 필수 기능만을 구현하여 빠르게 시장 피드백을 검증하는 제품 개발 전략.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 md:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🎞️</span>
                      <span>프레임 레이트</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Frame Rate (FPS) / 1초 동안 보여주는 연속 사진의 장수</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 교과서 귀퉁이에 졸라맨을 그리고 빠르게 넘기면 살아 움직이는 플립북 만화책!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 1초당 디스플레이 화면에 표시되는 정지 영상(프레임)의 수(Frames Per Second). 보통 60 FPS 이상이어야 부드럽고 쾌적한 플레이를 느낄 수 있습니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 2. 자가 점검 체크리스트 카드 (8강 최신 표준) */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span id="checklist-counter" className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {checkedCount} / 6 완료
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

              {/* 6대 문항 */}
              <div className="space-y-2.5">
                {[
                  '1. 게임의 멈추지 않는 심장 박동인 게임 루프(requestAnimationFrame)의 동작 원리를 이해했나요?',
                  '2. 자바스크립트 화가가 픽셀을 직접 그리는 디지털 도화지 태그(<canvas>)의 역할을 확인했나요?',
                  '3. 우주선과 별똥별의 좌표를 비교하여 부딪힘을 감지하는 충돌 판정(Collision Detection)을 체험했나요?',
                  '4. 가상 아케이드 콘솔에서 난이도를 조절하고 별똥별을 피하며 최고 점수 획득에 도전해 보았나요?',
                  '5. 최신 AI에게 부드러운 관성 조작이나 피버 타임 보너스 이벤트를 생성하는 프롬프트 퀘스트를 성공시켰나요?',
                  '6. 가장 핵심 재미만 먼저 완성해 출시하는 주니어 개발자의 MVP(최소 기능 제품) 원칙을 기억하나요?'
                ].map((text, idx) => {
                  const num = idx + 1;
                  return (
                    <label
                      key={num}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!checklist[num]}
                        onChange={() => handleToggleCheck(num)}
                        className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
                    </label>
                  );
                })}
              </div>
            </article>

            {/* 100% 완주 축하 & 다음 강 언락 카드 */}
            {isAllComplete && (
              <article id="completion-card" className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">웹 아케이드 미니 프로젝트 &amp; 시즌 2 완주 달성을 축하합니다! 🎉</h4>
                    <p className="text-sm text-slate-300">6가지 점검 항목을 모두 통과하여 HTML·CSS·JS를 총동원한 실시간 웹 게임 루프와 충돌 판정을 완전히 정복했습니다.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 3 · 10강: 꼼꼼한 코드 검사관! 버그 잡는 QA 디버거 &amp; 테스트 기초</p>
                  </div>
                  <a
                    href="/materials/ai/lessons/10-bug-hunter/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>10강으로 즉시 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            {/* 단계 이동 버튼 바 */}
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
      <footer className="border-t border-slate-200 bg-white mt-16 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>📘 AI·코딩 24강 장기 교육과정 - Wanted Montage Design System</p>
          <p>외부 로그인 0개! 순수 브라우저 자바스크립트로 구동되는 인터랙티브 에듀테크</p>
        </div>
      </footer>
    </div>
  );
};

export default Lesson09;
