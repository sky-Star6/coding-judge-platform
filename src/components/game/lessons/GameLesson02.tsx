import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Compass,
  FileText,
  ShieldCheck,
  FolderTree,
  Layers,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Terminal,
  Download,
  Copy,
  Check,
  Search,
  CheckSquare,
  Award
} from 'lucide-react';

type StageId = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type FileKey = 'kilorules' | 'spec' | 'html' | 'css' | 'main' | 'player';

const FILE_INFO: Record<FileKey, { name: string; role: string; desc: string; code: string }> = {
  kilorules: {
    name: '.kilorules',
    role: 'AI 안전 규칙서',
    desc: 'Kilo Code가 코드를 작성하거나 고칠 때 가장 먼저 읽는 프로젝트 규칙 파일입니다.',
    code: '# Kilo Code 프로젝트 규칙\n1. 모든 JS 코드에 한국어 주석 작성\n2. 기존 기능 임의 삭제 금지\n3. 순수 HTML/CSS/JS(ES Module) 유지'
  },
  spec: {
    name: 'SPEC.md',
    role: '게임 기획 설계도',
    desc: '게임의 목표, 조작키, 구현 진행 체크리스트를 정리해 AI와 공유하는 기준 문서입니다.',
    code: '# 게임 기획서 (SPEC.md)\n- 해상도: 800 x 450\n- [x] 1강: 60FPS 게임 루프\n- [ ] 2강: 모듈 분리'
  },
  html: {
    name: 'index.html',
    role: '화면 뼈대 & 연결',
    desc: '캔버스(<canvas>)와 UI를 배치하고, style.css와 js/main.js를 연결하는 입구 파일입니다.',
    code: '<link rel="stylesheet" href="style.css">\n<canvas id="gameCanvas" width="800" height="450"></canvas>\n<script type="module" src="js/main.js"></script>'
  },
  css: {
    name: 'style.css',
    role: '디자인 & 스타일',
    desc: '배경색, 캔버스 테두리, 점수판 등 시각적인 꾸미기만 전담합니다.',
    code: 'body { background: #020617; color: #e2e8f0; }\ncanvas { border: 2px solid #334155; border-radius: 12px; }'
  },
  main: {
    name: 'js/main.js',
    role: '게임 루프 심장',
    desc: 'player.js 등을 import해서 requestAnimationFrame 루프를 돌리는 지휘자 파일입니다.',
    code: 'import { Player } from "./player.js";\nconst player = new Player(400, 225);\nfunction gameLoop() {\n  player.update();\n  player.draw(ctx);\n  requestAnimationFrame(gameLoop);\n}'
  },
  player: {
    name: 'js/player.js',
    role: '플레이어 물리 & 이동',
    desc: '플레이어의 위치, 속도, 키보드 조작, 그리기를 독립적으로 담당하는 모듈입니다.',
    code: 'export class Player {\n  constructor(x, y) { this.x = x; this.y = y; }\n  update() { /* 이동 계산 */ }\n  draw(ctx) { /* 그리기 */ }\n}'
  }
};

export const GameLesson02: React.FC = () => {
  const [activeStage, setActiveStage] = useState<StageId>('stage1');
  const [selectedFile, setSelectedFile] = useState<FileKey>('kilorules');
  const [ruleKor, setRuleKor] = useState(true);
  const [ruleKeep, setRuleKeep] = useState(true);
  const [ruleMod, setRuleMod] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  useEffect(() => {
    const saved = localStorage.getItem('game_lesson_02_checklist');
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

  const switchStage = (next: StageId) => {
    setActiveStage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (id: string, text: string) => {
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
    localStorage.setItem('game_lesson_02_checklist', JSON.stringify(obj));
    if (next.every(Boolean)) {
      localStorage.setItem('game_lesson_02_completed', 'true');
    } else {
      localStorage.removeItem('game_lesson_02_completed');
    }
  };

  const kilorulesText = [
    '# Kilo Code 프로젝트 규칙 (.kilorules)',
    ruleKor ? '- 모든 자바스크립트 코드에는 초보자가 이해할 수 있는 한국어 주석을 달아주세요.' : null,
    ruleKeep ? '- 기존에 잘 작동하던 기능은 요청 없이 임의로 삭제하지 마세요.' : null,
    ruleMod ? '- 코드는 style.css, js/main.js, js/player.js 등 ES 모듈 구조로 분리하세요.' : null
  ]
    .filter(Boolean)
    .join('\n');

  const checkedCount = checklist.filter(Boolean).length;
  const progressPct = Math.round((checkedCount / 6) * 100);
  const showStage = (s: Exclude<StageId, 'all'>) => activeStage === 'all' || activeStage === s;

  const prompts = [
    {
      id: 'q1',
      badge: 'Architect 모드',
      badgeClass: 'bg-violet-100 text-violet-700',
      title: 'QUEST 01. @SPEC.md 설계도 완성 & 분리 계획 세우기',
      sub: '코딩 전 아키텍처 설계',
      text: `[Mode: Architect]\n\n[Goal]:\n@index.html 과 @SPEC.md 를 읽고, 앞으로 12강까지 확장하기 좋게 파일을 분리하는 설계도를 제안해 줘.\n\n[Condition]:\n1. 아직 코드는 수정하지 말고, style.css / js/main.js / js/player.js 3개 파일로 나눌 때 각 파일이 맡을 역할만 정리해 줘.\n2. 내가 만들 게임 테마(예: 우주 별똥별 피하기 또는 네온 던전)에 맞춰 @SPEC.md 의 1번 항목을 채우는 초안을 보여줘.`
    },
    {
      id: 'q2',
      badge: 'Code 모드',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      title: 'QUEST 02. @index.html에서 디자인(style.css) 분리하기',
      sub: 'HTML과 CSS 역할 분리',
      text: `[Mode: Code]\n\n[Goal]:\n@index.html 안에 들어있는 <style> 태그 내용을 새 파일 style.css 로 분리하고, @index.html 에서 <link rel="stylesheet" href="style.css"> 로 연결해 줘.\n\n[Condition]:\n1. 화면 디자인이나 캔버스 크기가 1강과 똑같이 유지되어야 해.\n2. 작업 후 Live Server에서 화면이 깨지지 않는지 확인할 수 있게 알려줘.`
    },
    {
      id: 'q3',
      badge: 'Code 모드',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      title: 'QUEST 03. js/main.js & js/player.js 모듈로 쪼개기',
      sub: 'ES Module (import / export) 적용',
      text: `[Mode: Code]\n\n[Goal]:\n@index.html 의 <script> 코드를 js/main.js 로 옮기고, 공(또는 플레이어) 객체와 이동/그리기 로직은 js/player.js 로 분리해 줘.\n\n[Condition]:\n1. @index.html 에서는 <script type="module" src="js/main.js"></script> 로 연결해 줘.\n2. js/player.js 는 Player(또는 Ball) 클래스를 export 하고, js/main.js 에서 import 해서 사용해 줘.\n3. .kilorules 규칙에 따라 기존 1강 기능(60FPS 루프, 클릭 추가, 일시정지)이 모두 그대로 동작해야 해.`
    },
    {
      id: 'q4',
      badge: '문서 동기화',
      badgeClass: 'bg-amber-100 text-amber-800',
      title: 'QUEST 04. @SPEC.md 진행 상황 업데이트하기',
      sub: '설계도와 실제 코드 일치시키기',
      text: `[Mode: Code]\n\n[Goal]:\n지금까지 완성된 @index.html @style.css @js/main.js @js/player.js 구조를 반영해서 @SPEC.md 를 업데이트해 줘.\n\n[Condition]:\n1. 1강과 2강 체크박스를 [x] 완료 표시로 바꿔줘.\n2. 현재 프로젝트 폴더 트리도 @SPEC.md 아래에 정리해 줘.`
    },
    {
      id: 'q5',
      badge: 'Ask 모드',
      badgeClass: 'bg-cyan-100 text-cyan-800',
      title: 'QUEST 05. 내 코드 구조 이해하고 점검하기',
      sub: '모듈 간 연결(import/export) 복습',
      text: `[Mode: Ask]\n\n[Goal]:\n@js/main.js 와 @js/player.js 가 서로 어떻게 데이터를 주고받는지 중학생 눈높이에서 3단계로 설명해 줘.\n그리고 3강에서 방향키 이동과 점프 물리를 추가할 때 @js/player.js 의 어느 함수에 코드를 넣어야 하는지 알려줘.`
    }
  ];

  const currentFile = FILE_INFO[selectedFile];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-violet-500 selection:text-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/materials/game-ai/index.html"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Gamepad2 className="w-5 h-5" />
            </a>
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium truncate">VS Code + Kilo 12강</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-bold text-slate-900 truncate">2강: 코딩 전에 설계도부터! Kilo Architect &amp; 모듈 분리</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            {[
              { id: 'stage1' as const, num: 1, label: '미션 & 원리' },
              { id: 'stage2' as const, num: 2, label: '설계도 & 모듈 실습' },
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

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">
        {showStage('stage1') && (
          <section className="space-y-8">
            <article className="bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-violet-500/20">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-violet-500/30 text-violet-200 border border-violet-400/30">
                    <Compass className="w-4 h-4 text-cyan-300" />
                    시즌 1 · 2강 · 설계와 모듈 분리
                  </span>
                  <span className="text-sm font-semibold text-slate-300">Architect Mode + SPEC.md + .kilorules</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  코딩 전에 설계도부터! Kilo Architect로 깔끔한 게임 폴더 만들기 📐
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  1강에서 만든 <span className="font-mono text-cyan-300">index.html</span> 한 파일에 모든 기능을 다 우겨 넣으면 AI도 길을 잃습니다.
                  오늘은 <strong>Kilo Architect 모드</strong>로 <span className="font-mono text-cyan-300">SPEC.md</span> 설계도를 먼저 작성하고, 역할별로 파일을 깔끔하게 나누는 방법을 배웁니다!
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <FileText className="w-5 h-5 text-violet-300" />
                  <h4 className="text-base font-bold text-white">SPEC.md 설계도</h4>
                  <p className="text-sm text-slate-300">Architect 모드로 내 게임의 규칙, 조작키, 목표를 먼저 문서화하기</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <ShieldCheck className="w-5 h-5 text-cyan-300" />
                  <h4 className="text-base font-bold text-white">.kilorules 안전 규칙</h4>
                  <p className="text-sm text-slate-300">Kilo가 내 코딩 스타일과 한국어 주석 약속을 매번 기억하게 만들기</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <FolderTree className="w-5 h-5 text-emerald-300" />
                  <h4 className="text-base font-bold text-white">멀티 파일 모듈 분리</h4>
                  <p className="text-sm text-slate-300">style.css, js/main.js, js/player.js로 역할을 나누어 조립하기</p>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-indigo-600">
                <Layers className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">🏗️ 왜 설계도와 모듈 분리가 중요할까요?</h3>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-indigo-900">
                <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <strong className="font-bold">주니어 개발자 제2원칙:</strong> "코드를 수정할 때 파일이 짧고 역할이 분명할수록, Kilo가 실수할 확률은 10배 줄어듭니다!"
                </div>
              </div>
            </article>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: 2단계 설계도 &amp; 모듈 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {showStage('stage2') && (
          <section className="space-y-8">
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">모듈 구조 &amp; .kilorules 설계 시뮬레이터</h3>
                </div>
                <p className="text-sm text-slate-400">왼쪽 폴더에서 파일을 클릭해 각 모듈의 역할을 확인하고, 나만의 .kilorules 규칙을 조립해 보세요!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <div className="text-sm font-bold text-slate-400 px-2 pb-1 border-b border-slate-800">📁 01-arcade-starter/</div>
                  {(Object.keys(FILE_INFO) as FileKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedFile(key)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-mono cursor-pointer ${
                        selectedFile === key
                          ? 'bg-indigo-600/30 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {FILE_INFO[key].name}
                    </button>
                  ))}
                </div>
                <div className="md:col-span-7 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-sm font-bold text-cyan-300">{currentFile.name}</span>
                    <span className="text-sm font-semibold text-emerald-400">{currentFile.role}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{currentFile.desc}</p>
                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {currentFile.code}
                  </pre>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>나만의 .kilorules 규칙 조립기</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy('rules', kilorulesText)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'rules' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === 'rules' ? '복사됨! ✨' : '규칙 복사'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm cursor-pointer">
                    <input type="checkbox" checked={ruleKor} onChange={(e) => setRuleKor(e.target.checked)} className="accent-cyan-400" />
                    <span>한국어 주석 필수</span>
                  </label>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm cursor-pointer">
                    <input type="checkbox" checked={ruleKeep} onChange={(e) => setRuleKeep(e.target.checked)} className="accent-cyan-400" />
                    <span>기존 기능 삭제 금지</span>
                  </label>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm cursor-pointer">
                    <input type="checkbox" checked={ruleMod} onChange={(e) => setRuleMod(e.target.checked)} className="accent-cyan-400" />
                    <span>js/ 폴더 ES 모듈 분리</span>
                  </label>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-cyan-300 whitespace-pre-wrap leading-relaxed">
                  {kilorulesText}
                </pre>
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

        {showStage('stage3') && (
          <section className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <Terminal className="w-5 h-5" />
                <span className="text-sm font-extrabold uppercase tracking-wider">STAGE 03 · 실전 VS CODE + KILO 5대 퀘스트</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                1강에서 쓰던 스타터 폴더를 열고 Architect → Code 순서로 모듈을 분리해 보세요!
              </h3>
            </div>

            <article className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 p-6 sm:p-7 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Compass className="w-5 h-5" />
                  <h4 className="text-base font-bold text-white">STEP 0. 1강 폴더 이어받기 &amp; Architect 모드 전환</h4>
                </div>
                <a
                  href="/materials/game-ai/starter/01-arcade-starter.zip"
                  download="01-arcade-starter.zip"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-extrabold shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>스타터 템플릿 받기 (.zip)</span>
                </a>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                VS Code에서 1강 작업 폴더(.kilorules, SPEC.md, index.html)를 연 뒤, QUEST 01에서는 Kilo 모드를 <strong>Architect</strong>로 바꾸고 실행하세요.
              </p>
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
                      onClick={() => handleCopy(q.id, q.text)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === q.id ? '복사됨! ✨' : '프롬프트 복사'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                    {q.text}
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
                <span>이전: 2단계 설계도 &amp; 모듈 실습</span>
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

        {showStage('stage4') && (
          <section className="space-y-6">
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Search className="w-4 h-4" />
                <h3 className="text-base sm:text-lg font-bold text-white">🔍 주니어 개발자를 위한 전문 용어 돋보기</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <h4 className="text-base font-bold text-white">📐 아키텍트 모드</h4>
                  <span className="text-sm font-mono text-slate-400 block">Architect Mode</span>
                  <p className="text-sm text-slate-300">코드를 수정하기 전에 시스템 구조와 파일 분리 계획을 수립하는 설계 전용 모드.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <h4 className="text-base font-bold text-white">🧩 모듈 분리</h4>
                  <span className="text-sm font-mono text-slate-400 block">Modularization (ES Modules)</span>
                  <p className="text-sm text-slate-300">import/export로 코드를 독립된 파일 단위로 나누어 유지보수성을 높이는 기법.</p>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 설계·모듈 분리 실습을 모두 완료했는지 점검해 보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {checkedCount} / 6 완료
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="space-y-2.5">
                {[
                  '1. 한 파일에 모든 코드를 넣지 않고 역할별로 나누어야 하는 이유를 이해했나요?',
                  '2. .kilorules 파일이 AI의 실수를 막아주는 안전장치 역할을 한다는 것을 확인했나요?',
                  '3. Kilo Architect 모드로 @SPEC.md 설계도를 먼저 검토했나요?',
                  '4. style.css를 분리하고 Live Server에서 화면이 깨지지 않는지 확인했나요?',
                  '5. js/main.js와 js/player.js를 ES 모듈로 분리해 정상 실행했나요?',
                  '6. 변경된 폴더 구조에 맞춰 SPEC.md를 최신 상태로 업데이트했나요?'
                ].map((txt, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                    <input type="checkbox" checked={checklist[idx]} onChange={() => toggleCheck(idx)} className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm text-slate-700 leading-relaxed">{txt}</span>
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
                    <h4 className="text-base font-bold text-emerald-300">2강 완주! 설계도 &amp; 모듈 분리 아키텍처 완성 🎉</h4>
                    <p className="text-sm text-slate-300">이제 3강에서 js/player.js에 가속도 이동과 중력 점프 물리를 얹을 준비가 끝났습니다!</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">3강: 손끝에 감기는 조작감: 가속도·마찰력 &amp; 중력 점프</p>
                  </div>
                  <a href="/materials/game-ai/index.html" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer">
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
          <span>2강 · Kilo Architect &amp; 모듈 분리</span>
        </div>
      </footer>
    </div>
  );
};

export default GameLesson02;
