import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Sparkles,
  Lock,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Clock,
  Film,
  Eraser,
  Compass,
  Check,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Eye,
  Activity,
  ArrowRight
} from 'lucide-react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const GameLesson01: React.FC = () => {
  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // 캔버스 컨트롤 상태
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMult, setSpeedMult] = useState<number>(1);
  const [trailMode, setTrailMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [ballCount, setBallCount] = useState<number>(1);

  // Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>([
    { x: 100, y: 100, vx: 4, vy: 3, radius: 14, color: '#A855F7' }
  ]);
  const isRunningRef = useRef<boolean>(true);
  const speedMultRef = useRef<number>(1);
  const trailModeRef = useRef<boolean>(false);
  const soundEnabledRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 동기화
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    speedMultRef.current = speedMult;
  }, [speedMult]);

  useEffect(() => {
    trailModeRef.current = trailMode;
  }, [trailMode]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // 로컬 스토리지 초기화
  useEffect(() => {
    const saved = localStorage.getItem('game_lesson_01_checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setChecklist(parsed);
          const allDone = parsed.every(Boolean);
          setIsUnlocked(allDone);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 효과음 합성 함수
  const playBounceSound = () => {
    if (!soundEnabledRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // ignore
    }
  };

  // 60FPS 애니메이션 루프
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (timestamp: number) => {
      frameCount++;
      if (timestamp - lastFpsUpdate >= 500) {
        const fps = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate));
        setCurrentFps(fps);
        frameCount = 0;
        lastFpsUpdate = timestamp;
      }

      const canvas = canvasRef.current;
      if (canvas && isRunningRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 지우개 단계
          if (trailModeRef.current) {
            ctx.fillStyle = 'rgba(15, 15, 35, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          // 공 업데이트 및 렌더링
          const balls = ballsRef.current;
          balls.forEach((ball) => {
            ball.x += ball.vx * speedMultRef.current;
            ball.y += ball.vy * speedMultRef.current;

            let bounced = false;
            // 좌우 벽 충돌
            if (ball.x - ball.radius <= 0) {
              ball.x = ball.radius;
              ball.vx = -ball.vx;
              bounced = true;
            } else if (ball.x + ball.radius >= canvas.width) {
              ball.x = canvas.width - ball.radius;
              ball.vx = -ball.vx;
              bounced = true;
            }

            // 상하 벽 충돌
            if (ball.y - ball.radius <= 0) {
              ball.y = ball.radius;
              ball.vy = -ball.vy;
              bounced = true;
            } else if (ball.y + ball.radius >= canvas.height) {
              ball.y = canvas.height - ball.radius;
              ball.vy = -ball.vy;
              bounced = true;
            }

            if (bounced) {
              playBounceSound();
            }

            // 네온 공 렌더링
            ctx.save();
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.shadowColor = ball.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // 체크박스 클릭 핸들러
  const handleCheck = (index: number) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);

    const allChecked = next.every(Boolean);
    setIsUnlocked(allChecked);

    localStorage.setItem('game_lesson_01_checklist', JSON.stringify(next));
    if (allChecked) {
      localStorage.setItem('game_lesson_01_completed', 'true');
    } else {
      localStorage.removeItem('game_lesson_01_completed');
    }
  };

  // 공 추가
  const addBall = () => {
    const colors = ['#A855F7', '#06B6D4', '#F43F5E', '#10B981', '#F59E0B'];
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 400;
    const h = canvas ? canvas.height : 260;
    const newBall: Ball = {
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 8 || 3,
      vy: (Math.random() - 0.5) * 8 || -3,
      radius: Math.floor(Math.random() * 8) + 10,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    ballsRef.current.push(newBall);
    setBallCount(ballsRef.current.length);
  };

  // 캔버스 리셋
  const resetCanvas = () => {
    ballsRef.current = [
      { x: 100, y: 100, vx: 4, vy: 3, radius: 14, color: '#A855F7' }
    ];
    setBallCount(1);
    setSpeedMult(1);
    setTrailMode(false);
  };

  const completedChecks = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedChecks / checklist.length) * 100);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-violet-100 selection:text-violet-900 flex flex-col">
      {/* 본문 바로가기 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-violet-600 text-white font-bold rounded-lg shadow-lg"
      >
        본문 바로가기
      </a>

      {/* 상단 고정 GNB 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/materials/game-ai/index.html"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-violet-200 hover:opacity-90 transition-opacity"
            >
              <Gamepad2 className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/materials/game-ai/index.html"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline"
              >
                2D 게임 AI 12강
              </a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                1강: 60FPS의 비밀과 게임 루프
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 체크리스트 게이지 */}
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
              <span className="font-mono font-bold text-slate-700">
                {completedChecks}/6 ({progressPercent}%)
              </span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 언락 게이트 슬롯 */}
            <div>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm animate-pulse">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2강 도전 열림!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" />
                  <span>2강 잠김</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 2-패널 워크스페이스 */}
      <main
        id="main-content"
        className="flex-1 lg:h-[calc(100vh-4rem)] lg:overflow-hidden max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
          {/* ==================================================================== */}
          {/* [좌측 패널: 퀘스트 가이드 (70% 폭 / 독립 슬라이드바)]                   */}
          {/* ==================================================================== */}
          <section
            className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:pr-3 space-y-6 pb-12 custom-scrollbar"
            aria-label="1강 퀘스트 가이드"
          >
            {/* 히어로 미션 카드 */}
            <article className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 text-white relative overflow-hidden border border-violet-500/30 shadow-lg">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>퀘스트 01 · 게임 엔진의 심장</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                  1초에 60장의 스케치북을 넘기는 플립북 마법사
                </h2>

                <p className="text-sm text-slate-200 leading-relaxed">
                  만화책 구석에 그림을 조금씩 다르게 그려놓고 손가락으로 촤르륵 넘기면 캐릭터가 살아
                  움직였던 기억이 있나요? 컴퓨터 모니터 속 게임 캐릭터도 똑같습니다! 1초에 60번, 도화지를
                  깨끗이 지우고 위치를 조금씩 바꿔 다시 그리는 <strong>게임 루프(Game Loop)</strong>의
                  비밀을 파헤쳐 봅니다.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-violet-400/30 text-xs font-mono text-cyan-300">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>60 FPS Target</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-violet-400/30 text-xs font-mono text-violet-200">
                    <RefreshCw className="w-3 h-3 text-violet-400" />
                    <span>requestAnimationFrame</span>
                  </span>
                </div>
              </div>
            </article>

            {/* STAGE 01 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-violet-600">
                <Film className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">STAGE 01</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                깜빡임 없는 세상을 만드는 60FPS의 마법
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                사람의 눈은 1초에 약 24장 이상의 그림이 연속으로 지나가면, 그것이 정지 사진들의 모음이
                아니라 <strong>‘부드러운 하나의 움직임’</strong>이라고 착각합니다. 현대 2D 게임은 더 부드러운
                움직임을 위해 <strong>1초에 정확히 60번(60FPS)</strong> 화면을 갱신합니다.
              </p>

              <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-200 space-y-2">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-600" />
                  <span>1프레임에 주어지는 시간: 단 16.6밀리초 (ms)</span>
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  1초(1,000ms) 나누기 60은 약 <strong>16.6밀리초</strong>입니다. 게임 엔진은 눈 깜짝할 새보다
                  훨씬 빠른 16.6ms 안에{' '}
                  <strong className="text-violet-700">
                    [1. 플레이어 입력 확인] ➡️ [2. 물리 및 위치 계산] ➡️ [3. 캔버스에 그리기]
                  </strong>{' '}
                  3단계를 끝내야 렉(Stutter) 없이 부드러운 60FPS를 유지합니다.
                </p>
              </div>
            </article>

            {/* STAGE 02 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-violet-600">
                <Eraser className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">STAGE 02</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                지우개질(clearRect)을 안 하면 무슨 일이 생길까?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                스케치북에 공을 그린 뒤 다음 페이지로 안 넘기고 그 위에 덧그리면 어떻게 될까요? 지나간 자리마다
                공의 흔적이 뱀처럼 줄줄이 남게 됩니다! 그래서 게임 루프의 시작점에서는 항상{' '}
                <strong>이전 프레임의 그림을 지우개로 깨끗이 닦아내는 코드</strong>가 들어갑니다.
              </p>

              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-slate-200 p-4 font-mono text-xs leading-relaxed space-y-1">
                <div className="text-slate-400">// 🎮 60FPS 게임 엔진의 핵심 루프 뼈대</div>
                <div>
                  <span className="text-purple-400">function</span>{' '}
                  <span className="text-cyan-400">gameLoop</span>() &#123;
                </div>
                <div className="pl-4 text-emerald-400">// 1. 이전 화면 깨끗하게 닦아내기 (지우개)</div>
                <div className="pl-4">
                  ctx.<span className="text-yellow-300">clearRect</span>(0, 0, canvas.width,
                  canvas.height);
                </div>
                <div className="pl-4 text-emerald-400">// 2. 공의 물리와 위치 계산 (업데이트)</div>
                <div className="pl-4">updatePhysics();</div>
                <div className="pl-4 text-emerald-400">// 3. 새로운 위치에 다시 그리기 (렌더링)</div>
                <div className="pl-4">drawNeonBall();</div>
                <div className="pl-4 text-emerald-400">
                  // 4. 다음 16.6ms 뒤에 다시 이 함수를 불러줘!
                </div>
                <div className="pl-4">
                  <span className="text-cyan-400">requestAnimationFrame</span>(gameLoop);
                </div>
                <div>&#125;</div>
              </div>
            </article>

            {/* STAGE 03 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-violet-600">
                <Compass className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">STAGE 03</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                위치와 속도 벡터: x = x + vx 공식의 비밀
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                공이 오른쪽으로 움직인다는 것은, 매 프레임마다 현재 x 좌표에 오른쪽 속도(vx)를 더해준다는 뜻입니다.
                벽에 쾅! 부딪히면 속도에 -1을 곱해(vx = -vx) 반대 방향으로 튕겨 나갑니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-1">📐 전진 공식 (Update)</h4>
                  <p className="text-xs font-mono text-violet-700">x += vx;</p>
                  <p className="text-xs font-mono text-violet-700">y += vy;</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-1">💥 탄성 바운스 (Bounce)</h4>
                  <p className="text-xs font-mono text-cyan-700">if (x &gt; width) vx = -vx;</p>
                  <p className="text-xs font-mono text-cyan-700">if (y &gt; height) vy = -vy;</p>
                </div>
              </div>
            </article>

            {/* 🔍 주니어 개발자를 위한 전문 용어 돋보기 (Junior Developer Glossary) */}
            <article className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-5 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  🔍 주니어 개발자를 위한 전문 용어 돋보기
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                오늘 실습에서 체험한 마법의 원리를 공식 컴퓨터 과학 및 게임 프로그래밍 용어로 정리합니다.
              </p>

              <div className="space-y-4">
                {/* 용어 1: 게임 루프 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                  <h4 className="text-base font-bold text-white">게임 루프</h4>
                  <span className="text-[11px] font-mono text-slate-400 block">Game Loop</span>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1">
                    🧸 <strong>어린이 비유:</strong> 1초에 60장을 촤르륵 넘기는 스케치북 플립북.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 게임이 종료될 때까지 입력 처리, 상태 업데이트, 화면
                    렌더링을 60FPS 주기로 무한 반복하는 핵심 제어 구조.
                  </p>
                </div>

                {/* 용어 2: 초당 프레임 수 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                  <h4 className="text-base font-bold text-white">초당 프레임 수</h4>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    FPS (Frames Per Second)
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1">
                    🧸 <strong>어린이 비유:</strong> 1초 동안 눈앞에 지나가는 사진 장수.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 1초당 렌더링되는 이미지 프레임 수. 60FPS 기준 1프레임당 약
                    16.6ms의 렌더링 예산이 주어집니다.
                  </p>
                </div>

                {/* 용어 3: 브라우저 애니메이션 프레임 요청 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                  <h4 className="text-base font-bold text-white">브라우저 애니메이션 프레임 요청</h4>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    window.requestAnimationFrame()
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1">
                    🧸 <strong>어린이 비유:</strong> 모니터에게 "화면 바꿀 준비 되면 나 불러줘!" 하고 약속하는 호출벨.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 브라우저의 화면 주사율에 완벽히 동기화되어 배터리와 CPU
                    낭비 없이 부드러운 애니메이션을 보장하는 표준 웹 API.
                  </p>
                </div>
              </div>
            </article>

            {/* 자가 점검 체크리스트 (6문항) */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">1강 자가 점검 체크리스트</h3>
                </div>
                <span className="text-xs font-mono font-bold text-violet-600">
                  {completedChecks}/6 완료
                </span>
              </div>
              <p className="text-xs text-slate-500">
                6개 항목을 모두 완료하면 다음 2강(손끝으로 조종하는 네온 캐릭터)이 잠금 해제됩니다.
              </p>

              <div className="space-y-2.5">
                {[
                  '게임 루프(Game Loop)가 1초에 60번 반복되는 플립북 원리임을 이해했다.',
                  '60FPS 게임에서 1프레임에 주어지는 시간이 약 16.6밀리초(ms)임을 확인했다.',
                  '지우개(clearRect)를 끄면 잔상이 뱀처럼 남는 이유를 우측 캔버스에서 확인했다.',
                  'x = x + vx 공식을 이용해 공이 매 프레임 위치를 갱신하는 원리를 이해했다.',
                  '벽에 부딪혔을 때 속도 부호(vx = -vx)를 뒤집어 튕겨 나가는 바운스를 체험했다.',
                  '속도 조절 슬라이더와 공 추가 버튼으로 다중 물리 오브젝트의 움직임을 관찰했다.'
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      checklist[idx]
                        ? 'bg-violet-50/70 border-violet-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => handleCheck(idx)}
                      className="mt-0.5 w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                    />
                    <span className="text-xs sm:text-sm font-medium leading-relaxed">{item}</span>
                  </label>
                ))}
              </div>

              {/* 축하 완주 카드 */}
              {isUnlocked && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white flex items-center justify-between shadow-md mt-4 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>1강 마스터 완주! 2강 잠금 해제</span>
                    </h4>
                    <p className="text-xs text-slate-100 mt-0.5">
                      키보드 이벤트와 부드러운 가속도 물리 엔진을 배울 준비가 되었습니다!
                    </p>
                  </div>
                  <a
                    href="/materials/game-ai/index.html"
                    className="px-3.5 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-bold shadow hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <span>로드맵으로 가기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </article>
          </section>

          {/* ==================================================================== */}
          {/* [우측 패널: 실습 콘솔 (50% 폭 / 독립 슬라이드바)]                     */}
          {/* ==================================================================== */}
          <section
            className="lg:col-span-5 lg:h-full lg:overflow-y-auto lg:pr-2 space-y-4 pb-12 custom-scrollbar"
            aria-label="1강 실시간 네온 바운스 캔버스"
          >
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              {/* 상단 타이틀 & FPS 미터 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    60FPS LIVE ENGINE CANVAS
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 text-cyan-400 border border-slate-700 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>{currentFps} FPS</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-800 text-violet-300 border border-slate-700">
                    공: {ballCount}개
                  </span>
                </div>
              </div>

              {/* 아케이드 모니터 프레임 */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={280}
                  className="w-full h-auto block bg-[#0F0F23]"
                />
              </div>

              {/* 인터랙티브 컨트롤 패널 */}
              <div className="space-y-3 pt-1">
                {/* 속도 조절 슬라이더 */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">엔진 시뮬레이션 속도 배율</span>
                    <span className="text-cyan-400 font-mono">{speedMult.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.2"
                    value={speedMult}
                    onChange={(e) => setSpeedMult(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* 버튼 토글 그리드 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTrailMode(!trailMode)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-colors ${
                      trailMode
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{trailMode ? '잔상 모드 ON' : '잔상 모드 OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-colors ${
                      soundEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{soundEnabled ? '8비트 효과음 ON' : '8비트 효과음 OFF'}</span>
                  </button>
                </div>

                {/* 동작 조작 버튼 */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRunning(!isRunning)}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isRunning
                        ? 'bg-violet-600 hover:bg-violet-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunning ? '일시정지' : '다시 재생'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={addBall}
                    className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>공 추가</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetCanvas}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>초기화</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default GameLesson01;
