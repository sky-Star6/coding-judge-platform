import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Terminal,
  Sparkles,
  RefreshCw,
  Film,
  Eraser,
  Bot,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Activity,
  RotateCcw,
  Pause,
  Play,
  Plus,
  Volume2,
  VolumeX,
  Gauge,
  Copy,
  Check,
  Search,
  CheckSquare,
  Award,
  Code2,
  Wrench,
  Download
} from 'lucide-react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

type StageId = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

const NEON_COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

export const GameLesson01: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageId>('stage1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  // 캔버스 컨트롤 상태
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMult, setSpeedMult] = useState<number>(1);
  const [trailMode, setTrailMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [ballCount, setBallCount] = useState<number>(1);
  const [bounceCount, setBounceCount] = useState<number>(0);
  const [liveCode, setLiveCode] = useState<string>(`{\n  "vx": 6,\n  "vy": 4,\n  "radius": 18,\n  "color": "#ec4899",\n  "trail": true\n}`);
  const [liveCodeMsg, setLiveCodeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>([{ x: 100, y: 100, vx: 4, vy: 3, radius: 14, color: '#06b6d4' }]);
  const isRunningRef = useRef<boolean>(true);
  const speedMultRef = useRef<number>(1);
  const trailModeRef = useRef<boolean>(false);
  const soundEnabledRef = useRef<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  useEffect(() => {
    const saved = localStorage.getItem('game_lesson_01_checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setChecklist(parsed);
        } else if (parsed && typeof parsed === 'object') {
          setChecklist([1, 2, 3, 4, 5, 6].map((i) => Boolean(parsed[i])));
        }
      } catch (_) {}
    }
  }, []);

  const playBounceSound = () => {
    if (!soundEnabledRef.current) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(792, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (_) {}
  };

  useEffect(() => {
    let animId: number;
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
      if (canvas && isRunningRef.current && canvas.width > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (trailModeRef.current) {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          let newBounces = 0;
          ballsRef.current.forEach((ball) => {
            ball.x += ball.vx * speedMultRef.current;
            ball.y += ball.vy * speedMultRef.current;

            let bounced = false;
            if (ball.x - ball.radius < 0) {
              ball.x = ball.radius;
              ball.vx *= -1;
              bounced = true;
            } else if (ball.x + ball.radius > canvas.width) {
              ball.x = canvas.width - ball.radius;
              ball.vx *= -1;
              bounced = true;
            }
            if (ball.y - ball.radius < 0) {
              ball.y = ball.radius;
              ball.vy *= -1;
              bounced = true;
            } else if (ball.y + ball.radius > canvas.height) {
              ball.y = canvas.height - ball.radius;
              ball.vy *= -1;
              bounced = true;
            }

            if (bounced) {
              newBounces++;
              playBounceSound();
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.shadowColor = ball.color;
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.restore();
          });

          if (newBounces > 0) {
            setBounceCount((prev) => prev + newBounces);
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSpawnBall = () => {
    const canvas = canvasRef.current;
    const w = canvas?.width || 600;
    const h = canvas?.height || 340;
    const color = NEON_COLORS[ballsRef.current.length % NEON_COLORS.length];
    ballsRef.current.push({
      x: Math.max(30, Math.min(w - 30, Math.random() * w)),
      y: Math.max(30, Math.min(h - 30, Math.random() * h)),
      vx: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2.5),
      vy: (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2.5),
      radius: 12 + Math.random() * 5,
      color
    });
    setBallCount(ballsRef.current.length);
  };

  const handleReset = () => {
    ballsRef.current = [{ x: 100, y: 100, vx: 4, vy: 3, radius: 14, color: '#06b6d4' }];
    setBallCount(1);
    setBounceCount(0);
    setSpeedMult(1);
  };

  const applyLiveCode = () => {
    try {
      const cfg = JSON.parse(liveCode);
      const vx = typeof cfg.vx === 'number' ? cfg.vx : 4;
      const vy = typeof cfg.vy === 'number' ? cfg.vy : 3;
      const radius = typeof cfg.radius === 'number' ? Math.max(5, Math.min(40, cfg.radius)) : 14;
      const color = typeof cfg.color === 'string' ? cfg.color : '#ec4899';
      setTrailMode(Boolean(cfg.trail));
      ballsRef.current[0] = {
        x: ballsRef.current[0]?.x || 120,
        y: ballsRef.current[0]?.y || 120,
        vx,
        vy,
        radius,
        color
      };
      setLiveCodeMsg({ text: '내 코드가 60FPS 엔진에 즉시 적용되었습니다!', ok: true });
    } catch (_) {
      setLiveCodeMsg({ text: 'JSON 형식을 확인해 주세요! (따옴표와 쉼표가 올바른지 체크)', ok: false });
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }).catch(() => {});
  };

  const toggleCheck = (idx: number) => {
    const next = [...checklist];
    next[idx] = !next[idx];
    setChecklist(next);
    const obj: Record<number, boolean> = {};
    next.forEach((v, i) => {
      obj[i + 1] = v;
    });
    localStorage.setItem('game_lesson_01_checklist', JSON.stringify(obj));
    if (next.every(Boolean)) {
      localStorage.setItem('game_lesson_01_completed', 'true');
    } else {
      localStorage.removeItem('game_lesson_01_completed');
    }
  };

  const checkedCount = checklist.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);
  const showStage = (s: Exclude<StageId, 'all'>) => activeStage === 'all' || activeStage === s;

  const prompts = [
    {
      id: 'q1',
      badge: 'Ask 모드',
      badgeClass: 'bg-violet-100 text-violet-700',
      title: 'QUEST 01. 파일 건드리지 않고 먼저 물어보기',
      sub: 'Kilo Ask 모드로 준비 상태 점검',
      text: `[Mode: Ask]\n\n[Goal]:\n나는 이제부터 HTML5 Canvas와 JavaScript로 나만의 웹 아케이드 게임을 만들 거야.\n아직 파일을 생성하지 말고, 아래 두 가지만 초보 개발자 눈높이에서 설명해 줘.\n\n[Question]:\n1. requestAnimationFrame이 setInterval보다 게임 루프에 더 좋은 이유 2가지\n2. 오늘 첫 단계로 index.html 하나에 Canvas(800x450)를 띄우려면 어떤 태그와 JS 코드가 핵심인지 5줄 이내로 요약해 줘.`,
      magic: 'Ask 모드는 파일을 멋대로 수정하지 않고, 내 질문에 대해 안전한 코드 설명과 설계 힌트만 제공합니다.',
      secret: '실무 개발자도 코드를 바로 짜지 않고, 읽기 전용 질문으로 원리와 범위를 먼저 확인한 뒤 구현에 들어갑니다.'
    },
    {
      id: 'q2',
      badge: 'Code 모드',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      title: 'QUEST 02. 60FPS 네온 볼 아케이드 파일 생성하기',
      sub: 'Code 모드로 index.html 첫 파일 자동 생성',
      text: `[Mode: Code]\n\n[Goal]:\n현재 폴더에 index.html 파일을 새로 만들어서, 어두운 우주 배경(#0f172a) 위에서 네온 공이 60FPS로 튕겨 다니는 캔버스 데모를 구현해 줘.\n\n[Condition]:\n1. 캔버스 크기는 800x450으로 중앙 정렬해 줘.\n2. requestAnimationFrame을 사용한 gameLoop(update + render 분리 구조)로 작성해 줘.\n3. 공이 벽 4면에 닿을 때마다 속도를 반전(-vx, -vy)시키고 벽 충돌 횟수(bounces)를 좌측 상단에 표시해 줘.\n4. 중학생도 읽을 수 있도록 핵심 코드마다 한국어 주석을 달아줘.`,
      magic: '복사·붙여넣기 없이 Kilo가 내 VS Code 폴더 안에 직접 index.html을 생성하고 저장 승인을 요청합니다.',
      secret: '상태 계산(update)과 화면 그리기(render)를 분리해 두어야 나중에 캐릭터와 몬스터가 늘어나도 코드가 꼬이지 않습니다.'
    },
    {
      id: 'q3',
      badge: 'Code 모드',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      title: 'QUEST 03. 특정 파일(@index.html)만 짚어 기능 추가하기',
      sub: '스페이스바 일시정지 & 클릭 공 추가',
      text: `[Mode: Code]\n\n[Goal]:\n@index.html 파일을 수정해서 사용자가 직접 조작할 수 있는 인터랙션 2가지를 추가해 줘.\n\n[Condition]:\n1. 캔버스를 마우스로 클릭하면 클릭한 위치에 무작위 네온 색상의 새 공이 1개씩 추가되게 해줘.\n2. 키보드 스페이스바(Space)를 누르면 게임이 일시정지/재개(isPaused)되도록 만들어 줘.\n3. 일시정지 상태일 때는 캔버스 중앙에 "PAUSED" 안내 문구를 띄워 줘.`,
      magic: '@파일명을 명시하면 Kilo가 해당 파일의 현재 구조를 정확히 읽고, 필요한 부분만 Diff로 수정합니다.',
      secret: '여러 개의 공을 배열(Array)로 관리하고 반복문으로 돌리는 패턴은 적군과 총알을 수십 개 띄울 때 그대로 쓰입니다.'
    },
    {
      id: 'q4',
      badge: '시각화 튜닝',
      badgeClass: 'bg-amber-100 text-amber-800',
      title: 'QUEST 04. 잔상 트레일 & 실시간 FPS HUD 달기',
      sub: 'clearRect vs rgba 잔상 비교 실험',
      text: `[Mode: Code]\n\n[Goal]:\n@index.html 의 아케이드 화면을 더 멋지게 업그레이드하기 위해 잔상(Trail) 효과와 FPS 측정기를 추가해 줘.\n\n[Condition]:\n1. 화면 아래에 '잔상 모드 ON/OFF' 버튼을 만들고, 켜졌을 때는 clearRect 대신 rgba(15, 23, 42, 0.2)로 덮어 공 뒤에 혜성 꼬리가 남게 해줘.\n2. performance.now()를 이용해 현재 FPS를 계산하고 화면 우측 상단에 표시해 줘.\n3. 기존 클릭 공 추가와 스페이스바 일시정지 기능은 그대로 유지해야 해.`,
      magic: '"기존 기능은 그대로 유지해"라는 제약 조건을 주면 Kilo가 기존 이벤트 리스너를 지우지 않도록 조심해서 수정합니다.',
      secret: '반투명 사각형을 매 프레임 덮어 씌우는 기법은 무거운 파티클 없이도 빠른 속도감을 연출하는 고전 아케이드 트릭입니다.'
    },
    {
      id: 'q5',
      badge: '안전 훈련',
      badgeClass: 'bg-rose-100 text-rose-700',
      title: 'QUEST 05. 과감한 실험 후 Checkpoint로 시간 되돌리기',
      sub: '에이전트 실수 복구 & Diff 읽기',
      text: `[Mode: Code -> Checkpoint 복구 실험]\n\n[Goal]:\n@index.html 에서 공이 벽에 부딪힐 때마다 화면 전체가 무지개색으로 번쩍이게 바꿔 줘.\n\n[실습 미션]:\n1. Live Server로 확인해 본 뒤, 눈이 너무 아프다면 Kilo 채팅창의 이전 메시지 옆 'Restore Checkpoint' 버튼을 눌러 실험 전 상태로 안전하게 되돌려 보세요!`,
      magic: 'Kilo는 매 작업마다 스냅샷(Checkpoint)을 저장하므로, 실험이 마음에 들지 않으면 클릭 한 번으로 완벽하게 복구할 수 있습니다.',
      secret: '언제든 되돌릴 수 있다는 안전망(Checkpoint · Git)이 있어야 두려움 없이 다양한 게임 아이디어를 실험할 수 있습니다.'
    }
  ];

  const switchStage = (next: StageId) => {
    setActiveStage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-violet-500 selection:text-white">
      {/* 상단 고정 풀 너비 GNB 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/materials/game-ai/index.html"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm hover:opacity-90 transition-opacity"
              title="게임 트랙 홈으로 이동"
            >
              <Gamepad2 className="w-5 h-5" />
            </a>
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium truncate">VS Code + Kilo 12강</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-bold text-slate-900 truncate">1강: VS Code + Kilo 세팅 &amp; 60FPS 게임 루프</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            {[
              { id: 'stage1' as const, num: 1, label: '미션 & 원리' },
              { id: 'stage2' as const, num: 2, label: '60FPS 엔진 실습' },
              { id: 'stage3' as const, num: 3, label: '실전 Kilo 퀘스트' },
              { id: 'stage4' as const, num: 4, label: '자가 점검' }
            ].map((item) => {
              const isActive = activeStage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchStage(item.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.num}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => switchStage('all')}
              role="tab"
              aria-selected={activeStage === 'all'}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ml-1 ${
                activeStage === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 보기
            </button>
          </nav>
        </div>
      </header>

      {/* 모바일 전용 스테이지 바 */}
      <nav className="md:hidden flex items-center justify-around gap-1 px-3 py-2 bg-white border-b border-slate-200 sticky top-16 z-30 overflow-x-auto">
        {[
          { id: 'stage1' as const, label: '1. 미션&원리' },
          { id: 'stage2' as const, label: '2. 엔진 실습' },
          { id: 'stage3' as const, label: '3. Kilo 퀘스트' },
          { id: 'stage4' as const, label: '4. 자가 점검' },
          { id: 'all' as const, label: '전체' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchStage(item.id)}
            className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
              activeStage === item.id ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* 단일 컨테이너 워크스페이스 */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">
        {/* STAGE 1 */}
        {showStage('stage1') && (
          <section className="space-y-8">
            <article className="bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-violet-500/20">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-violet-500/30 text-violet-200 border border-violet-400/30">
                    <Terminal className="w-4 h-4 text-cyan-300" />
                    시즌 1 · 1강 · 개발자 작업실 오픈
                  </span>
                  <span className="text-sm font-semibold text-slate-300">VS Code + Kilo Code + 60FPS Game Loop</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  VS Code에 AI 파트너 Kilo를 태우고 첫 60FPS 게임 루프를 띄워라! 🚀
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  이제 웹 브라우저에서 코드를 복사·붙여넣기하던 습관을 졸업하고, 실제 개발자들이 쓰는 VS Code 작업실로 들어갑니다.
                  AI 에이전트 Kilo Code와 함께 1초에 60번 화면을 다시 그리는 게임 엔진의 심장을 만들어 봅시다!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">VS Code + Kilo 세팅</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">내 프로젝트 폴더를 열고 Live Server와 Kilo Code 확장 연결하기</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">60FPS 게임 루프</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">1초에 60장 플립북처럼 화면을 지우고 그리는 심장 박동 이해하기</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-white">첫 아케이드 파일 생성</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">Kilo에게 명령해 네온 볼 바운스 게임을 내 컴퓨터에 직접 만들고 실행하기</p>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">🕹️ 1강에서 꼭 알아야 할 3가지 핵심 원리</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Kilo에게 좋은 명령을 내리려면 게임 화면이 움직이는 원리와 Kilo의 작업 방식을 먼저 이해해야 합니다.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Film className="w-5 h-5" />
                    <h4 className="text-base font-bold text-slate-900">플립북 만화책 (60FPS)</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    🧸 <strong>어린이 비유:</strong> 교과서 귀퉁이에 공을 조금씩 옮겨 그린 뒤 손가락으로 촤르륵 넘기면 살아 움직이는 마법!
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> <span className="font-mono text-indigo-700">requestAnimationFrame</span>은 1초에 60번 함수를 불러 위치 계산과 그리기를 반복합니다.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Eraser className="w-5 h-5" />
                    <h4 className="text-base font-bold text-slate-900">도화지 지우개 (Clear)</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    🧸 <strong>어린이 비유:</strong> 화이트보드에 전 그림을 안 지우고 계속 그리면 낙서장이 되겠죠? 매 순간 깨끗이 지워야 공이 움직입니다.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> <span className="font-mono text-indigo-700">clearRect()</span>로 캔버스를 비우거나 반투명 검은색을 덮어 잔상 효과를 만듭니다.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Bot className="w-5 h-5" />
                    <h4 className="text-base font-bold text-slate-900">Kilo 4대 모드 지휘</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    🧸 <strong>어린이 비유:</strong> 설계자(Architect), 목수(Code), 탐정(Debug), 선생님(Ask) 4명의 AI 전문가 팀이 내 폴더 안에 있어요!
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 질문할 땐 <strong>Ask</strong>, 코드를 만들 땐 <strong>Code</strong> 모드를 골라 쓰는 것이 실수 없는 비결입니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-indigo-900">
                <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <strong className="font-bold">주니어 개발자 제1원칙:</strong> "Kilo는 내 파일들을 직접 읽고 수정할 수 있는 강력한 에이전트입니다. 한꺼번에 게임을 다 만들어 달라고 하지 말고, 1단계씩 실행 확인을 하며 쌓아 올리세요!"
                </div>
              </div>
            </article>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 2단계 60FPS 엔진 실습 콘솔</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STAGE 2 */}
        {showStage('stage2') && (
          <section className="space-y-8">
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white">60FPS 네온 볼 엔진 시뮬레이터</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">실시간 캔버스</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    VS Code에서 만들기 전에, 지우개(잔상 모드)와 속도 배율이 게임 루프에 어떤 변화를 주는지 먼저 실험해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>초기화</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">실시간 주사율</span>
                  <span className="font-mono font-extrabold text-emerald-400">{currentFps} FPS</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">네온 볼 개수</span>
                  <span className="font-mono font-extrabold text-cyan-400">{ballCount}개</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">벽 충돌 횟수</span>
                  <span className="font-mono font-extrabold text-amber-400">{bounceCount}회</span>
                </div>
              </div>

              <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl">
                <canvas ref={canvasRef} width={760} height={428} className="w-full h-full block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning((r) => !r)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? '일시정지' : '다시 재생'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSpawnBall}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>네온 볼 추가</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrailMode((t) => !t)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{trailMode ? '잔상 모드: 켜짐' : '잔상 모드: 꺼짐'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSoundEnabled((s) => !s)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>{soundEnabled ? '사운드: ON' : '사운드: OFF'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200 whitespace-nowrap">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>공 이동 속도 배율:</span>
                  <span className="font-mono text-cyan-400">{speedMult.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.25"
                  value={speedMult}
                  onChange={(e) => setSpeedMult(parseFloat(e.target.value))}
                  className="w-full sm:w-72 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">직접 코드 고쳐보기 (Live Code Lab)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={applyLiveCode}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>내 코드 적용하기</span>
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  아래 설정 코드의 숫자나 색상(<span className="font-mono text-cyan-300">#ec4899</span> 등)을 직접 고친 뒤 <strong>[내 코드 적용하기]</strong>를 눌러 캔버스 변화를 확인해 보세요!
                </p>
                <textarea
                  value={liveCode}
                  onChange={(e) => setLiveCode(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-cyan-400"
                />
                {liveCodeMsg && (
                  <p className={`text-sm font-medium ${liveCodeMsg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveCodeMsg.text}
                  </p>
                )}
              </div>
            </article>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage1')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 1단계 미션 &amp; 원리</span>
              </button>
              <button
                type="button"
                onClick={() => switchStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 3단계 실전 Kilo 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STAGE 3 */}
        {showStage('stage3') && (
          <section className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <Terminal className="w-5 h-5" />
                <span className="text-sm font-extrabold uppercase tracking-wider">STAGE 03 · 실전 VS CODE + KILO 5대 퀘스트</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                VS Code에서 내 게임 폴더를 열고 Kilo에게 순서대로 명령해 보세요!
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                내 컴퓨터에 <span className="font-mono font-bold text-slate-700">my-arcade-game</span> 폴더를 만든 뒤 VS Code로 열고, 아래 순서대로 Kilo Code 채팅창에 복사해 실행하세요.
              </p>
            </div>

            <article className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 p-6 sm:p-7 shadow-md space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Wrench className="w-5 h-5" />
                  <h4 className="text-base font-bold text-white">STEP 0. 스타터 템플릿 받기 &amp; VS Code + Kilo 세팅</h4>
                </div>
                <a
                  href="/materials/game-ai/starter/01-arcade-starter.zip"
                  download="01-arcade-starter.zip"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-extrabold shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>스타터 템플릿 다운로드 (.zip)</span>
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-bold text-cyan-300 block">1. 압축 풀고 VS Code로 열기</span>
                  <p className="text-slate-300 leading-relaxed"><span className="font-mono text-white">01-arcade-starter.zip</span> 압축을 풀고, VS Code → <span className="font-mono text-white">File &gt; Open Folder</span>로 엽니다.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-bold text-cyan-300 block">2. 확장 2개 설치</span>
                  <p className="text-slate-300 leading-relaxed">좌측 확장(Extensions) 탭에서 <span className="font-mono text-white">Kilo Code</span>와 <span className="font-mono text-white">Live Server</span>를 설치합니다.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-bold text-cyan-300 block">3. .kilorules 자동 보호막</span>
                  <p className="text-slate-300 leading-relaxed">폴더 안의 <span className="font-mono text-white">.kilorules</span> 파일 덕분에 Kilo가 한국어 주석을 달고 기존 코드를 안전하게 지켜줍니다.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-bold text-cyan-300 block">4. Go Live로 바로 실행</span>
                  <p className="text-slate-300 leading-relaxed">VS Code 우측 하단 <strong>Go Live</strong>를 눌러 <span className="font-mono text-white">index.html</span>이 브라우저에 뜨는지 확인하세요.</p>
                </div>
              </div>
            </article>

            <div className="space-y-6">
              {prompts.map((q) => (
                <article key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-sm font-extrabold ${q.badgeClass}`}>{q.badge}</span>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                        <span className="text-sm font-mono text-indigo-600 font-bold block">{q.sub}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(q.id, q.text)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === q.id ? (
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
                    {q.text}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                      <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-amber-600" />
                        Kilo의 에이전트 마법
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.magic}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                      <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        컴퓨터 과학 비밀
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.secret}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage2')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 2단계 60FPS 엔진 실습</span>
              </button>
              <button
                type="button"
                onClick={() => switchStage('stage4')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 4단계 점검 &amp; 언락</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* STAGE 4 */}
        {showStage('stage4') && (
          <section className="space-y-6">
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Search className="w-4 h-4" />
                  <h3 className="text-base sm:text-lg font-bold text-white">🔍 주니어 개발자를 위한 전문 용어 돋보기</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 1강에서 VS Code와 Kilo를 사용해 구현한 게임 루프와 에이전트 협업의 공식 개발 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide">💓 게임 루프</h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Game Loop / requestAnimationFrame</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 1초에 60번씩 "지우고 → 위치 옮기고 → 다시 그리기"를 반복하는 게임의 심장 박동!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 입력 처리, 상태 갱신(Update), 화면 렌더링(Render)을 모니터 주사율에 맞춰 무한 반복하는 제어 구조.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide">🎞️ 초당 프레임 수</h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">FPS (Frames Per Second)</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 1초 동안 눈앞에 몇 장의 만화책 그림을 넘겨 보여주느냐를 나타내는 부드러움 지수!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 1초 동안 화면에 그려지는 정지 화면(프레임)의 개수. 보통 60 FPS일 때 끊김 없는 조작감을 느낍니다.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide">🤖 AI 코딩 에이전트</h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">AI Coding Agent (Kilo Code)</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 질문만 답해주는 챗봇을 넘어, 내 작업실 책상에서 직접 파일도 만들고 고쳐주는 AI 팀원!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 프로젝트 파일을 읽고 쓰며 터미널 실행과 디버깅까지 수행하는 자율형 개발 보조 소프트웨어.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide">🔍 변경점 비교와 체크포인트</h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Diff Review &amp; Checkpoint</span>
                  </div>
                  <p className="text-sm text-cyan-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> AI가 고친 줄만 형광펜(초록/빨강)으로 확인하고, 이상하면 게임 세이브 파일처럼 되돌리는 안전장치!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 수정 전후 코드 차이를 검토(Diff)하고 특정 시점의 파일 상태로 즉시 복원(Checkpoint)하는 변경 관리 기법.
                  </p>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 실습을 모두 완료했는지 체크박스를 눌러 점검해 보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {checkedCount} / 6 완료
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="space-y-2.5">
                {[
                  '1. 내 컴퓨터에 게임 폴더를 만들고 VS Code에서 Kilo Code와 Live Server를 연결했나요?',
                  '2. Stage 2 시뮬레이터에서 잔상 모드(clearRect vs 반투명 덮기)와 속도 배율의 차이를 직접 실험해 보았나요?',
                  '3. Kilo의 Ask 모드로 파일을 건드리지 않고 먼저 원리를 질문해 보았나요?',
                  '4. Kilo Code 모드로 index.html을 생성하고 브라우저에서 네온 볼이 튕기는 것을 확인했나요?',
                  '5. @index.html을 지정해 클릭 공 추가, 스페이스바 일시정지 기능을 성공적으로 붙였나요?',
                  '6. Diff 확인과 Checkpoint 되돌리기로 안전하게 실험하는 방법을 익혔나요?'
                ].map((labelText, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">{labelText}</span>
                  </label>
                ))}
              </div>
            </article>

            {checkedCount === 6 && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">1강 완주! VS Code + Kilo 첫 게임 엔진 기동 성공 🎉</h4>
                    <p className="text-sm text-slate-300">6가지 점검 항목을 모두 완료했습니다. 이제 설계도부터 먼저 그리는 2강으로 넘어갈 준비가 되었습니다!</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">2강: 코딩 전에 설계도부터! Kilo Architect &amp; 모듈 분리</p>
                  </div>
                  <a
                    href="/materials/game-ai/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>로드맵 홈으로 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage3')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: 3단계 실전 Kilo 퀘스트</span>
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
                <span>맨 위로</span>
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Gamepad2 className="w-4 h-4 text-violet-600" />
            <span className="font-bold text-slate-700">나만의 웹 아케이드 게임 만들기 (VS Code + Kilo 12강)</span>
          </div>
          <span>1강 · VS Code + Kilo 세팅 &amp; 60FPS 게임 루프</span>
        </div>
      </footer>
    </div>
  );
};

export default GameLesson01;
