/**
 * ==============================================================================
 * Wanted Montage Game AI Core Engine & Course Manager
 * - 8-Bit Retro Web Audio Synthesizer (No external sound files, 100% Code)
 * - 12-Lecture Roadmap Sequential Gate & Checklist Synchronization
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. 8-Bit 레트로 사운드 신시사이저 (Web Audio API 기반 순수 코드 음향 엔진)
// ------------------------------------------------------------------------------
const RetroAudio = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  playBounce(freq = 440) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  },

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (_) {}
  },

  playCoin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [987.77, 1318.51].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + (idx * 0.07);

        osc.type = 'square';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.15);
      });
    } catch (_) {}
  },

  playPowerup() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [330, 392, 659, 523, 587, 784];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + (idx * 0.05);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch (_) {}
  }
};

// ------------------------------------------------------------------------------
// 2. 12강 커리큘럼 메타데이터 (Game AI Metadata)
// ------------------------------------------------------------------------------
const GAME_LESSON_METADATA = {
  1: { id: 'game_01', folder: '01-game-loop', title: '1강: 60FPS의 비밀과 게임 루프' },
  2: { id: 'game_02', folder: '02-smooth-movement', title: '2강: 부드러운 8방향 이동과 마찰력' },
  3: { id: 'game_03', folder: '03-gravity-jump', title: '3강: 점프와 중력 물리 시뮬레이션' },
  4: { id: 'game_04', folder: '04-box-collision', title: '4강: 박스 충돌 판정(AABB)' },
  5: { id: 'game_05', folder: '05-retro-audio', title: '5강: 8비트 사운드 신시사이저' },
  6: { id: 'game_06', folder: '06-jump-run-showcase', title: '6강: 시즌 1 점프런 게임 쇼케이스' },
  7: { id: 'game_07', folder: '07-monster-fsm', title: '7강: 몬스터의 감정 스위치(FSM)' },
  8: { id: 'game_08', folder: '08-line-of-sight', title: '8강: 투시 방지 시야 센서(Raycasting)' },
  9: { id: 'game_09', folder: '09-maze-pathfinding', title: '9강: 팩맨 유령의 미로 길찾기' },
  10: { id: 'game_10', folder: '10-autonomous-sensor', title: '10강: 스스로 벽을 피하는 자율주행 AI' },
  11: { id: 'game_11', folder: '11-boss-phases', title: '11강: 3단계 광폭화 보스 AI 패턴' },
  12: { id: 'game_12', folder: '12-indie-game-release', title: '12강: 시즌 2 나만의 2D 인디 게임 출시' }
};

// ------------------------------------------------------------------------------
// 3. 12강 로드맵 과정 홈 관리자 (Game Course Home Manager)
// ------------------------------------------------------------------------------
const GameCourseHomeManager = {
  async init() {
    const totalLessons = 12;
    const progressMap = {};
    let completedCount = 0;

    // 1. 로컬 스토리지로부터 오프라인/비로그인 진도 우선 복원
    let prevDone = true; // 1강은 항상 오픈
    for (let i = 1; i <= totalLessons; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const isDone = localStorage.getItem(`game_lesson_${numStr}_completed`) === 'true';
      const isAccessible = (i === 1) ? true : (isDone || prevDone);
      progressMap[i] = { isDone, isAccessible };
      if (isDone) completedCount++;
      prevDone = isDone;
    }

    // 2. 홈 화면 상단 진행률 바 갱신
    const barEl = document.getElementById('game-home-progress-bar');
    const textEl = document.getElementById('game-home-progress-text');
    if (barEl && textEl) {
      const pct = Math.round((completedCount / totalLessons) * 100);
      barEl.style.width = `${pct}%`;
      textEl.textContent = `${completedCount} / ${totalLessons}강 완주 (${pct}%)`;
    }

    // 3. 카드 상태 DOM 갱신
    GameCourseHomeManager.syncCards(progressMap);
  },

  syncCards(progressMap) {
    for (let i = 1; i <= 12; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const cardEl = document.getElementById(`card-game-lesson-${numStr}`);
      const badgeEl = document.getElementById(`badge-game-lesson-${numStr}`);
      const actionEl = document.getElementById(`action-game-lesson-${numStr}`);
      const meta = GAME_LESSON_METADATA[i];
      const state = progressMap[i] || { isDone: false, isAccessible: (i === 1) };

      if (!cardEl || !meta) continue;

      if (state.isDone) {
        cardEl.className = 'rounded-2xl p-6 flex flex-col justify-between transition-all bg-white border-2 border-emerald-300 shadow-sm hover:shadow-md';
        if (badgeEl) {
          badgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
          badgeEl.innerHTML = `<svg class="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>완료됨</span>`;
        }
        if (actionEl) {
          actionEl.innerHTML = `<a href="./lessons/${meta.folder}/index.html" class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-sm"><span>${i}강 복습하기</span><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>`;
        }
      } else if (state.isAccessible) {
        cardEl.className = 'rounded-2xl p-6 flex flex-col justify-between transition-all bg-white border-2 border-violet-300 shadow-sm hover:shadow-md hover:border-violet-500';
        if (badgeEl) {
          badgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200';
          badgeEl.innerHTML = `<svg class="w-3 h-3 text-violet-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg><span>도전 가능</span>`;
        }
        if (actionEl) {
          actionEl.innerHTML = `<a href="./lessons/${meta.folder}/index.html" class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-violet-200"><span>${i}강 플레이하기</span><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>`;
        }
      } else {
        cardEl.className = 'rounded-2xl p-6 flex flex-col justify-between transition-all bg-slate-50/70 border border-slate-200 opacity-80 shadow-none';
        if (badgeEl) {
          badgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200';
          badgeEl.innerHTML = `<svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>잠김</span>`;
        }
        if (actionEl) {
          const prevNum = i - 1;
          actionEl.innerHTML = `<button type="button" disabled class="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed border border-slate-200 flex items-center justify-center gap-1.5"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>${prevNum}강을 완료하면 열립니다</span></button>`;
        }
      }
    }
  }
};

// ------------------------------------------------------------------------------
// 4. 전역 게임 강좌 완료 헬퍼
// ------------------------------------------------------------------------------
window.syncGameLessonCompletion = async function(lessonId) {
  if (!lessonId) return;
  const numMatch = String(lessonId).match(/(\d+)/);
  if (!numMatch) return;
  const num = parseInt(numMatch[1], 10);
  const numStr = num < 10 ? `0${num}` : `${num}`;
  const key = `game_lesson_${numStr}`;

  try {
    localStorage.setItem(`${key}_completed`, 'true');
  } catch (e) {}
};
