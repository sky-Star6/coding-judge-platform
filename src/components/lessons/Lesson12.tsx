import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Award,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileDiff,
  Play,
  RotateCcw,
  Copy,
  Check,
  Search,
  Flame,
  Bot,
  Lightbulb,
  Layers,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Database,
  KeyRound,
  ArrowUpDown,
  Archive,
  Package,
  PackageOpen,
  PlusCircle,
  Eye,
  Trash2
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

interface RankingRecord {
  id: number;
  name: string;
  score: number;
  date: string;
}

const DEFAULT_RANKINGS: RankingRecord[] = [
  { id: 1, name: '초고수_알고', score: 9800, date: '2026-11-01' },
  { id: 2, name: '버그슬레이어', score: 8750, date: '2026-11-03' },
  { id: 3, name: '파이썬마스터', score: 7920, date: '2026-11-05' },
  { id: 4, name: '웹장인_루키', score: 6540, date: '2026-11-07' },
  { id: 5, name: '코딩꿈나무', score: 5200, date: '2026-11-08' }
];

const STORAGE_KEY = 'arcade_rankings';

interface QuestItem {
  id: string;
  badge: string;
  title: string;
  desc: string;
  situation: string;
  prompt: string;
  reaction: string;
  csSecret: string;
}

const QUESTS: QuestItem[] = [
  {
    id: 'quest-01',
    badge: '단일 값 보관',
    title: '새로고침해도 영원히 남는 단일 최고 점수(High Score) 보관함 소환하기',
    desc: '게임이 끝났을 때 현재 점수가 역대 최고 점수보다 높으면 브라우저 금고에 단일 값을 갱신하는 기본 영속 로직입니다.',
    situation: '내 미니 아케이드 게임에서 F5(새로고침)를 누를 때마다 최고 점수(Best Score)가 0점으로 초기화되는 버그를 고치고 싶을 때',
    prompt: `[역할]
너는 웹 게임 영속성 데이터 저장 전문 프론트엔드 엔지니어이자 시니어 멘토야.

[상황]
자바스크립트 아케이드 게임에서 게임이 끝날 때마다 현재 점수(currentScore)와 브라우저 로컬스토리지에 저장된 최고 점수(bestScore)를 비교해 신기록을 영구 보관하고 싶어.

[요청 조건]
1. localStorage.getItem('arcade_best_score')를 읽어와 기존 최고 점수를 가져오고, 없으면 기본값 0으로 처리하는 코드를 작성해 줘.
2. 현재 점수가 최고 점수보다 크면 localStorage.setItem('arcade_best_score', currentScore)로 갱신하는 saveBestScore(score) 함수를 만들어 줘.
3. 데이터가 성공적으로 갱신되었을 때 콘솔과 화면에 축하 메시지("🎉 신기록 달성!")를 띄우는 예시를 포함해 줘.
4. 초보자도 이해하기 쉽게 단계별 한국어 주석과 localStorage의 기본 작동 원리를 함께 설명해 줘.`,
    reaction: '최고 점수를 브라우저 금고에 쏙 집어넣어 전원을 꺼도 절대 지워지지 않는 1차 방어막 코드를 완성합니다!',
    csSecret: 'localStorage는 웹 브라우저가 사용자 컴퓨터에 할당해 준 약 5MB 용량의 영구 Key-Value 저장소입니다. 탭을 닫거나 컴퓨터를 재부팅해도 유지됩니다.'
  },
  {
    id: 'quest-02',
    badge: 'JSON 직렬화',
    title: '객체 배열을 한 줄 텍스트로 압축하는 JSON 택배 포장술',
    desc: '이름, 점수, 달성일이 담긴 복잡한 자바스크립트 객체 배열을 localStorage에 안전하게 보관하는 JSON 문자열 변환 기법입니다.',
    situation: 'localStorage.setItem("rankings", rankingArray)를 실행했더니 화면에 "[object Object]"라는 외계어가 저장되어 멘붕에 빠졌을 때',
    prompt: `[역할]
너는 자바스크립트 데이터 구조와 직렬화(Serialization)를 가르치는 주니어 코딩 코치야.

[문제 상황]
학생이 [{ name: '철수', score: 100 }, { name: '영희', score: 200 }] 형태의 랭킹 배열을 localStorage.setItem('ranks', rankingList)로 저장했더니, 스토리지에 "[object Object]"라는 문자열로 변환되어 데이터가 모두 손실되었습니다.

[해결 요청]
1. 자바스크립트 객체나 배열을 localStorage에 직접 넣으면 왜 '[object Object]'가 되는지 그 이유를 초등학생도 이해할 수 있는 택배 상자 은유로 설명해 줘.
2. JSON.stringify() 함수를 사용해 배열 객체를 온전한 텍스트 문자열(JSON String)로 포장하여 저장하는 안전한 함수를 작성해 줘.
3. 반대로 꺼낼 때 JSON.parse()로 되돌리는 흐름을 나란히 비교 코드로 제시해 줘.
4. 초보자를 위해 콘솔 출력(console.log) 결과 예시를 친절하게 첨부해 줘.`,
    reaction: '복잡한 랭킹 장부를 투명한 압축 택배 상자(JSON 문자열)에 곱게 담아 안전하게 스토리지로 보냅니다!',
    csSecret: '컴퓨터의 메모리 속 복합 객체를 파일이나 네트워크로 전송 가능한 일렬의 문자열로 변환하는 과정을 직렬화(Serialization)라고 합니다.'
  },
  {
    id: 'quest-03',
    badge: '예외 방어 가드',
    title: '깨진 데이터도 튕기지 않는 방어적 JSON 택배 언박싱(try-catch)',
    desc: '누군가 임의로 스토리지를 수정했거나 데이터가 비어 있을 때 웹 앱 전체가 멈추지 않도록 안전망을 치는 방어적 프로그래밍입니다.',
    situation: '사용자가 브라우저 개발자 도구에서 스토리지 값을 잘못 건드려 SyntaxError가 발생하고 게임 전체 화면이 하얗게 멈춰버렸을 때',
    prompt: `[역할]
너는 웹 애플리케이션의 런타임 안정성을 책임지는 소프트웨어 품질 보증(QA) 수석 엔지니어이자 자바스크립트 전문가야.

[상황 및 요구사항]
localStorage.getItem('arcade_rankings')로 문자열을 꺼내와 JSON.parse()를 실행할 때, 스토리지 값이 null이거나 오염된 텍스트('invalid_json{')일 경우 JSON.parse()가 SyntaxError를 던지며 웹사이트 전체 렌더링이 멈추는 치명적인 버그가 발생할 수 있습니다.

[요청 사항]
1. try-catch 문을 완벽하게 적용하여 파싱 실패 시에도 프로그램이 절대 멈추지 않고 기본 빈 배열([])을 안전하게 반환하는 loadRankingsSafely() 함수를 구현해 줘.
2. 데이터가 null인 경우(처음 방문한 사용자)와 비정상적인 문자열인 경우의 분기 처리 및 에러 로깅을 포함해 줘.
3. 왜 방어적 파싱(Defensive Parsing)이 실무 대규모 서비스에서 필수적인지 주니어 개발자의 관점에서 교훈을 2줄로 요약해 줘.`,
    reaction: '깨진 택배가 와도 시스템이 폭발하지 않고 "새 택배 상자"로 우아하게 교체하는 무결점 방어벽을 구축합니다!',
    csSecret: '외부 저장소나 네트워크에서 받아오는 데이터는 언제든 변조되거나 깨질 수 있다는 가정하에 예외 처리(try-catch)와 기본값 가드를 두는 것이 소프트웨어 안정성의 핵심입니다.'
  },
  {
    id: 'quest-04',
    badge: '정렬 & 커트라인',
    title: 'TOP 5 내림차순 정렬과 커트라인 잘라내기 알고리즘',
    desc: '새로운 6번째, 7번째 기록이 들어와도 상위 5위까지만 엄선하여 명예의 전당 품격을 유지하는 알고리즘 파이프라인입니다.',
    situation: '랭킹판에 100개의 점수가 무질서하게 뒤섞여 쌓여 화면이 지저분해지고 명예의 전당의 권위가 떨어졌을 때',
    prompt: `[역할]
너는 알고리즘과 자료구조를 지도하는 프론트엔드 테크니컬 리드야.

[시나리오]
새로운 도전자의 닉네임과 점수가 들어왔을 때 기존 랭킹 목록에 추가한 뒤:
1. 점수가 가장 높은 사람이 1등이 되도록 내림차순(Descending Order)으로 정렬하고,
2. 동점자일 경우 최근 등록일 순서로 우선순위를 매긴 다음,
3. 오직 상위 5명(TOP 5)만 남기고 6등 이하의 기록은 잘라내는(Slice) 완전한 파이프라인 함수 registerScore(name, score)를 작성해 줘.

[세부 구현 요건]
- Array.prototype.sort() 비교 함수((a, b) => b.score - a.score) 원리를 직관적인 비유로 주석에 설명할 것.
- Array.prototype.slice(0, 5)로 배열 길이를 5개 이하로 제한할 것.
- 최종 정제된 5개의 데이터를 다시 localStorage에 안전하게 직렬화해 저장하고 반환할 것.
- 입력값 유효성 검증(이름이 빈칸이거나 점수가 음수일 때의 방어)을 포함할 것.`,
    reaction: '치열한 점수 경쟁 속에서 가장 높은 5개의 기록만 골라내어 빛나는 트로피 선반에 올리는 자동 정렬기를 완성합니다!',
    csSecret: 'Array.prototype.sort((a,b) => b - a)는 음수를 반환하면 순서를 유지하고 양수를 반환하면 순서를 바꾸는 원리로 전체 배열을 내림차순 정렬합니다.'
  },
  {
    id: 'quest-05',
    badge: '관리자 초기화',
    title: '명예의 전당 초기화 및 안전한 관리자 모드 프롬프트',
    desc: '시즌이 종료되었거나 테스트 데이터가 쌓였을 때 스토리지 특정 키만 선택적으로 안전하게 청소하는 시스템 유지보수 로직입니다.',
    situation: '테스트용으로 마구잡이 등록한 99,999점 더미 데이터를 지우고 싶은데, 실수로 다른 학습용 진행도 데이터까지 다 날려버릴까 봐 두려울 때',
    prompt: `[역할]
너는 브라우저 스토리지 라이프사이클 관리와 클라이언트 보안에 능숙한 시니어 웹 아키텍트야.

[배경 상황]
게임 랭킹판에 축적된 명예의 전당 데이터를 새로운 시즌 개막을 맞아 초기화하거나 관리자가 리셋해야 하는 상황입니다.

[요구사항]
1. localStorage.clear()와 localStorage.removeItem('arcade_rankings')의 치명적인 차이점을 주니어 개발자에게 설명해 줘 (왜 clear()를 쓰면 다른 앱의 데이터까지 날아가는 대참사가 일어나는가?).
2. window.confirm() 대화상자를 띄워 관리자가 "정말 시즌을 초기화할까요?"를 승인했을 때만 명예의 전당 키만 안전하게 삭제하거나 기본 데모 데이터로 복원하는 resetRankings() 함수를 만들어 줘.
3. 초기화 후 화면 렌더링 함수를 다시 호출하여 UI를 즉시 갱신하는 완결된 자바스크립트 코드를 작성해 줘.`,
    reaction: '내 소중한 다른 저장소 데이터는 건드리지 않고 랭킹 보관함만 깔끔하게 비우는 안전 관리자 콘솔을 획득합니다!',
    csSecret: 'localStorage.clear()는 동일 도메인의 모든 Key를 전멸시킵니다. 따라서 실무에서는 항상 특정 기능에 할당된 Key만 명시적으로 삭제하는 removeItem(key)을 사용하는 것이 표준 규격입니다.'
  }
];

export const Lesson12: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. 네비게이션 & 복사 상태
  // ---------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPromptText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // ---------------------------------------------------------------------------
  // 2. 가상 명예의 전당 스토리지 상태 (Stage 2)
  // ---------------------------------------------------------------------------
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // 로컬스토리지 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRankings(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('랭킹 데이터 로드 중 오류 발생:', e);
    }
    // 기본값 초기화
    setRankings(DEFAULT_RANKINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RANKINGS));
    } catch (e) {}
  }, []);

  // 새 기록 등록 핸들러
  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const score = parseInt(scoreInput.trim(), 10);

    if (!name) {
      alert('도전자의 멋진 닉네임을 입력해 주세요!');
      return;
    }
    if (isNaN(score) || score < 0) {
      alert('유효한 점수 숫자를 입력해 주세요!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newRecord: RankingRecord = {
      id: Date.now(),
      name,
      score,
      date: today
    };

    const updated = [...rankings, newRecord];
    // 내림차순 정렬 후 상위 5개 유지
    updated.sort((a, b) => b.score - a.score);
    const top5 = updated.slice(0, 5);

    setRankings(top5);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
    } catch (e) {
      console.error('로컬스토리지 저장 실패:', e);
    }

    setNameInput('');
    setScoreInput('');
    setFeedbackMsg(`🏆 "${name}" 님의 ${score.toLocaleString()}점 기록이 등록되었습니다!`);
    setTimeout(() => setFeedbackMsg(null), 3000);

    // 체크리스트 4번 자동 체크
    setCheckedItems(prev => {
      const next = { ...prev, 4: true };
      localStorage.setItem('ai_lesson_12_checklist', JSON.stringify(next));
      return next;
    });
  };

  // 랭킹 리셋 핸들러
  const handleResetRankings = () => {
    if (window.confirm('정말 명예의 전당 기록을 초기 데모 랭킹으로 리셋할까요?')) {
      setRankings(DEFAULT_RANKINGS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RANKINGS));
      } catch (e) {}
      setFeedbackMsg('🔄 명예의 전당 기록이 초기 데모 데이터로 복원되었습니다.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. 자가 점검 체크리스트 상태 & 영속화 (Stage 4 - 8강 최신 표준)
  // ---------------------------------------------------------------------------
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_lesson_12_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed)) {
            const map: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
            parsed.forEach((val: any) => {
              const num = parseInt(val, 10);
              if (num >= 1 && num <= 6) map[num] = true;
            });
            setCheckedItems(map);
          } else {
            setCheckedItems({
              1: !!parsed[1],
              2: !!parsed[2],
              3: !!parsed[3],
              4: !!parsed[4],
              5: !!parsed[5],
              6: !!parsed[6]
            });
          }
        }
      }
    } catch (e) {}
  }, []);

  const toggleCheck = (num: number) => {
    setCheckedItems(prev => {
      const next = { ...prev, [num]: !prev[num] };
      localStorage.setItem('ai_lesson_12_checklist', JSON.stringify(next));
      const allDone = Object.values(next).filter(Boolean).length === 6;
      if (allDone) {
        localStorage.setItem('ai_lesson_12_completed', 'true');
      }
      return next;
    });
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);
  const isAllCompleted = completedCount === 6;

  // ---------------------------------------------------------------------------
  // 4. 렌더링
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* ===================================================================== */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃)                   */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-amber-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">시즌 3 피날레 · 12강: 우리 반 명예의 전당! 최고 점수 저장과 랭킹판</span>
              </div>
            </div>
          </div>

          {/* [우측]: 4단계 스테이지 스위처 버튼 그룹 (1강 최신 표준 20px 원형 배지) */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            <button
              type="button"
              onClick={() => setActiveStage('stage1')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage1'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage1' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
              }`}>1</span>
              <span>미션&원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage2'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage2' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
              }`}>2</span>
              <span>가상 랭킹랩</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage3' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
              }`}>3</span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage4')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage4'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage4' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
              }`}>4</span>
              <span>용어&체크리스트</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeStage === 'all'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 보기
            </button>
          </nav>
        </div>
      </header>

      {/* 모바일 서브 탭 바 */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage1' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage2' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          2. 가상 랭킹랩
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage3' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          3. 실전 AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage4' ? 'text-amber-700 bg-amber-50' : 'text-slate-600'
          }`}
        >
          4. 용어&점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'all' ? 'text-amber-700 bg-amber-50' : 'text-slate-500'
          }`}
        >
          전체
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. 메인 컨테이너 (단일 컨테이너 몰입형 워크스페이스)                  */}
      {/* ===================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1">

        {/* =================================================================== */}
        {/* STAGE 01: 미션 브리핑 & 3대 핵심 원리                              */}
        {/* =================================================================== */}
        {(activeStage === 'stage1' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* 1. 미션 브리핑 히어로 카드 (Wanted Montage) */}
            <article className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    SEASON 3 FINALE
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-slate-200">
                    STAGE 01
                  </span>
                  <span className="text-sm text-slate-400">데이터 영속성 & 랭킹 시스템</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
                    새로고침해도 사라지지 않는 영구 저장소!<br className="hidden sm:inline" />
                    우리 반 명예의 전당과 TOP 5 랭킹 시스템
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    어제까지 만든 멋진 게임에 F5(새로고침)를 누르는 순간 모든 최고 점수가 날아가 버렸나요? 브라우저 내부에 마련된 영구 비밀 금고 <strong className="text-amber-400 font-bold">로컬 스토리지(localStorage)</strong>와 데이터를 규격화하는 <strong className="text-amber-400 font-bold">JSON 택배 포장술</strong>을 배워 명예의 전당을 영원히 보존해 봅시다.
                  </p>
                </div>

                {/* 핵심 도전 목표 3가지 */}
                <div className="pt-2">
                  <h4 className="text-base font-bold text-amber-200 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>오늘 완수할 3가지 데이터 엔지니어링 미션</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-amber-400 font-bold text-sm mb-1">01. 브라우저 비밀 금고</div>
                      <p className="text-sm text-slate-300">새로고침해도 전원이 꺼져도 값을 영구 보존하는 로컬 스토리지 원리 정복</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-amber-400 font-bold text-sm mb-1">02. JSON 압축 택배술</div>
                      <p className="text-sm text-slate-300">복잡한 닉네임과 점수 목록을 한 줄 텍스트로 안전하게 직렬화/역직렬화</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-amber-400 font-bold text-sm mb-1">03. TOP 5 커트라인</div>
                      <p className="text-sm text-slate-300">내림차순 정렬과 슬라이스로 오직 상위 5개의 명예 기록만 엄선하는 알고리즘</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 핵심 개념 원리 탐구 카드 (Bento Grid) */}
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-600">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    💡 명예의 전당을 지탱하는 3대 데이터 핵심 원리
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  자바스크립트의 변수(let, const)는 새로고침하면 전부 증발합니다. 데이터를 영구히 지키는 비결을 살펴봅니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 카드 1 */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    💾
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    로컬 스토리지<br />
                    <span className="text-sm font-mono text-amber-700">localStorage</span>
                  </h4>
                  <p className="text-sm text-amber-900 font-medium">
                    🧸 <strong>어린이 비유:</strong> 게임팩에 꽂혀 있는 세이브 배터리! 게임기를 꺼도 내 최고 레벨이 그대로 저장됩니다.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 브라우저 내부 Key-Value 영구 스토리지입니다. <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-sm">setItem()</code>과 <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-sm">getItem()</code>으로 제어합니다.
                  </p>
                </div>

                {/* 카드 2 */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    📦
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    JSON 직렬화<br />
                    <span className="text-sm font-mono text-indigo-700">JSON.stringify & parse</span>
                  </h4>
                  <p className="text-sm text-indigo-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 레고 성을 납작한 택배 상자에 담아 포장하고(stringify), 꺼내서 다시 조립하는(parse) 마법.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 스토리지는 문자열만 저장할 수 있으므로, 객체 배열을 한 줄 텍스트 규격으로 변환해야 손실이 없습니다.
                  </p>
                </div>

                {/* 카드 3 */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    🥇
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    TOP 5 커트라인<br />
                    <span className="text-sm font-mono text-emerald-700">sort() & slice()</span>
                  </h4>
                  <p className="text-sm text-emerald-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 키 큰 순서대로 줄을 세운 뒤 1등부터 5등까지만 메달을 걸어주는 시상대 관리자.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded text-sm">sort((a,b) =&gt; b.score - a.score)</code>로 점수 내림차순 정렬 후 <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded text-sm">slice(0, 5)</code>로 상위 5개 데이터만 유지합니다.
                  </p>
                </div>

              </div>

              {/* 주니어 개발자 제1원칙 알림 카드 */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-amber-950">
                    주니어 데이터 엔지니어의 황금 법칙: "스토리지에는 반드시 문자열(JSON)만 담긴다!"
                  </h4>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <code className="bg-amber-200/80 px-1 py-0.5 rounded text-sm">localStorage.setItem('ranks', rankingArray)</code>처럼 배열을 그냥 집어넣으면 화면에 흉측한 <span className="font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">[object Object]</span>가 저장되어 모든 기록이 날아갑니다. 저장할 땐 무조건 <span className="font-mono font-bold text-indigo-700">JSON.stringify</span>, 꺼낼 땐 <span className="font-mono font-bold text-indigo-700">JSON.parse</span>를 외치세요!
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 2 가상 명예의 전당 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 명예의 전당 & 스토리지 랩                */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* 1. 명예의 전당 스코어보드 & 새 기록 등록 카드 */}
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      🏆 우리 반 실시간 명예의 전당 (TOP 5)
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    브라우저 로컬스토리지에 안전하게 보관된 실제 데이터입니다. 페이지를 새로고침해도 그대로 유지됩니다!
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleResetRankings}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto border border-slate-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>데모 기록 초기화</span>
                </button>
              </div>

              {/* 피드백 알림 배너 */}
              {feedbackMsg && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm font-bold flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* TOP 5 랭킹 리스트 */}
              <div className="space-y-2.5">
                {rankings.map((rec, idx) => {
                  const rank = idx + 1;
                  let medal = <span className="font-bold text-slate-500">{rank}위</span>;
                  let rowBg = 'bg-slate-50 border-slate-200';
                  if (rank === 1) {
                    medal = <span className="text-xl">🥇</span>;
                    rowBg = 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm';
                  } else if (rank === 2) {
                    medal = <span className="text-xl">🥈</span>;
                    rowBg = 'bg-slate-100/90 border-slate-300 text-slate-900';
                  } else if (rank === 3) {
                    medal = <span className="text-xl">🥉</span>;
                    rowBg = 'bg-amber-100/40 border-amber-200 text-amber-900';
                  }

                  return (
                    <div
                      key={rec.id || idx}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${rowBg}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-center shrink-0 text-sm font-bold">
                          {medal}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>{rec.name}</span>
                            {rank === 1 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                                챔피언
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">기록일: {rec.date}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-extrabold text-amber-600 font-mono">
                          {rec.score.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium ml-1">PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 새 도전자 기록 등록 폼 */}
              <form onSubmit={handleAddScore} className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <PlusCircle className="w-5 h-5" />
                  <h4 className="text-base font-bold text-white">새로운 도전자 점수 등록하기</h4>
                </div>
                <p className="text-sm text-slate-300">
                  점수를 등록하면 자동으로 내림차순 정렬되고, 상위 5등 안에 들어야만 명예의 전당 보드에 살아남습니다!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">도전자 닉네임</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      placeholder="예: 코딩꿈나무, 번개코더"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">달성 점수 (PTS)</label>
                    <input
                      type="number"
                      value={scoreInput}
                      onChange={e => setScoreInput(e.target.value)}
                      placeholder="예: 8500"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>랭킹 등록 & 정렬 실행</span>
                  </button>
                </div>
              </form>
            </article>

            {/* 2. localStorage 엑스레이(X-Ray) 실시간 뷰어 카드 */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Eye className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 로컬스토리지 내부 X-레이 투시경
                  </h3>
                </div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                  KEY: {STORAGE_KEY}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                실제 여러분 브라우저의 <code className="text-amber-400 font-mono font-bold">localStorage.getItem('{STORAGE_KEY}')</code>에 저장되어 있는 원본 JSON 텍스트입니다.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-48">
                {JSON.stringify(rankings, null, 2)}
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>실시간 스토리지 상태 동기화 중 · JSON 문자열로 압축 보관되어 있습니다.</span>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage1')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 1 미션&원리</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 3 실전 최신 AI 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 03: 실전 최신 AI 5대 킬러 퀘스트 (Real AI Test)               */}
        {/* =================================================================== */}
        {(activeStage === 'stage3' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <Flame className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  🔥 최신 AI 5대 실전 퀘스트: 명예의 전당 보관소 구축
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                실제 ChatGPT나 Gemini를 옆 창에 띄워두고 아래 고난도 프롬프트를 복사하여 붙여넣어 보세요. AI가 생성한 코드를 분석하며 현업 개발자의 영속성 노하우를 흡수합니다.
              </p>
            </div>

            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article
                  key={q.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5 transition-all hover:border-amber-300"
                >
                  {/* 퀘스트 헤더 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-amber-500 text-white">
                        QUEST 0{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {q.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      실전 AI 연동 테스트
                    </span>
                  </div>

                  {/* 퀘스트 제목 & 상황 */}
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {q.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {q.desc}
                    </p>
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>실전 함정 상황:</strong> {q.situation}
                      </div>
                    </div>
                  </div>

                  {/* 프롬프트 박스 (whitespace-pre-wrap 필수 준수) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-amber-600" />
                        <span>복사해서 AI에게 보낼 프롬프트 (클릭 시 자동 복사)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPromptText(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-amber-200 shadow-xs"
                      >
                        {copiedId === q.id ? (
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
                      {q.prompt}
                    </div>
                  </div>

                  {/* AI 소환 마법 & 컴퓨터 과학 비밀 해설 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI 소환 마법 반응</span>
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {q.reaction}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>💡 컴퓨터 과학의 비밀</span>
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {q.csSecret}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 2 가상 랭킹랩</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 4 용어 돋보기 & 자가 점검</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 04: 전문 용어 돋보기 & 자가 점검 체크리스트 (8강 최신 표준)    */}
        {/* =================================================================== */}
        {(activeStage === 'stage4' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* 1. 주니어 개발자를 위한 전문 용어 돋보기 (다크 테마) */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400">
                  <Search className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 12강 명예의 전당 랭킹전에서 사용된 실제 공식 컴퓨터 과학 / 데이터 저장 표준 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                {/* 용어 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>💾</span>
                      <span>로컬 스토리지</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">localStorage / 새로고침을 해도 영구 보존되는 브라우저 비밀 금고</span>
                  </div>
                  <p className="text-sm text-amber-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 게임기 본체에 꽂아둔 세이브 팩! 전원을 꺼도 내 레벨과 아이템이 그대로 남아 있는 보관함.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 브라우저에 키-값(Key-Value) 형태로 데이터를 영구 보관하는 클라이언트 웹 스토리지 규격입니다 (약 5MB 제공).
                  </p>
                </div>

                {/* 용어 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>📦</span>
                      <span>JSON 직렬화 & 역직렬화</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">JSON.stringify & JSON.parse / 객체를 텍스트로 압축하고 푸는 기술</span>
                  </div>
                  <p className="text-sm text-amber-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 레고 자동차를 분해해서 납작한 상자에 포장했다가, 도착하면 설명서대로 다시 조립하기!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 메모리 상의 복합 객체를 텍스트 문자열로 변환(직렬화)하거나 반대로 객체로 복원(역직렬화)하는 표준 데이터 변환 기법입니다.
                  </p>
                </div>

                {/* 용어 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>데이터 영속성</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Data Persistence / 프로그램 종료 후에도 데이터가 유지되는 성질</span>
                  </div>
                  <p className="text-sm text-amber-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 칠판에 분필로 쓴 글씨(증발) 대신 종이 일기장에 잉크 펜으로 적어 책장에 꽂아두기(영구 보관).
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 메모리(RAM)의 휘발성을 극복하고 디스크, 로컬 스토리지, 데이터베이스 등에 데이터를 영구히 기록해 두는 특성입니다.
                  </p>
                </div>

                {/* 용어 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>방어적 예외 처리</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Defensive Exception Handling / try-catch 가드</span>
                  </div>
                  <p className="text-sm text-amber-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 자전거를 탈 때 무릎 보호대를 차서 넘어져도 다치지 않고 바로 다시 일어나는 것.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 오염된 JSON 파싱 시 발생하는 SyntaxError 등을 <code className="text-amber-400 font-mono">try-catch</code>로 가로채어 앱 전체가 비정상 종료(Crash)되는 것을 방지하는 기법입니다.
                  </p>
                </div>

                {/* 용어 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 md:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>✂️</span>
                      <span>데이터 슬라이싱 & 정렬 알고리즘</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Array Sorting & Slicing / 상위 커트라인 필터링 파이프라인</span>
                  </div>
                  <p className="text-sm text-amber-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 달리기 시합 후 기록이 좋은 5명의 어린이만 골라내어 명예의 단상에 세우는 과정.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> <code className="text-amber-400 font-mono">sort((a,b) =&gt; b.score - a.score)</code> 비교 함수를 통해 데이터를 순서대로 재배치하고 <code className="text-amber-400 font-mono">slice(0, 5)</code>로 원하는 개수만큼만 배열을 잘라내는 정제 파이프라인입니다.
                  </p>
                </div>

              </div>
            </article>

            {/* 2. 자가 점검 체크리스트 (8강 최신 표준 규격) */}
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      12강 완주를 위한 자가 점검 체크리스트
                    </h3>
                    <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
                  {completedCount} / 6 완료
                </span>
              </div>

              {/* 카드 전용 실시간 그라데이션 게이지 바 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* 체크리스트 6개 항목 */}
              <div className="space-y-2.5">
                
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[1]}
                    onChange={() => toggleCheck(1)}
                    className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    1. 브라우저를 새로고침하거나 닫아도 데이터를 영구 보존하는 <span className="font-mono text-amber-700 font-bold">localStorage</span>의 원리를 이해했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[2]}
                    onChange={() => toggleCheck(2)}
                    className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    2. 자바스크립트 객체 배열을 텍스트로 압축하는 <span className="font-mono text-amber-700 font-bold">JSON.stringify</span>와 다시 객체로 푸는 <span className="font-mono text-amber-700 font-bold">JSON.parse</span>의 차이를 파악했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[3]}
                    onChange={() => toggleCheck(3)}
                    className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    3. 점수 내림차순 정렬(<span className="font-mono text-amber-700 font-bold">b.score - a.score</span>)과 <span className="font-mono text-amber-700 font-bold">slice(0, 5)</span>를 사용해 TOP 5를 추리는 알고리즘을 체험했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[4]}
                    onChange={() => toggleCheck(4)}
                    className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    4. 가상 명예의 전당 콘솔에서 새 도전자 기록을 등록하고, 엑스레이 뷰어로 저장된 JSON 원문을 확인해 보았나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[5]}
                    onChange={() => toggleCheck(5)}
                    className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    5. 최신 AI에게 객체 배열 직렬화와 try-catch 방어적 파싱 코드를 요구하는 랭킹 보관소 퀘스트를 성공시켰나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[6]}
                    onChange={() => toggleCheck(6)}
                    className="w-4 h-4 mt-1 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    6. 데이터가 깨지거나 비어 있어도 프로그램이 절대 멈추지 않는 <span className="font-mono text-amber-700 font-bold">방어적 파싱(Defensive Parsing)</span>의 가치를 기억하나요?
                  </span>
                </label>

              </div>
            </article>

            {/* 3. 100% 완주 축하 및 시즌 4 · 13강 언락 다크 펄스 카드 */}
            {isAllCompleted && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">
                      시즌 3 피날레 완주 & 12강 달성을 축하합니다! 🏆✨
                    </h4>
                    <p className="text-sm text-slate-300">
                      6가지 점검 항목을 모두 통과하여 로컬스토리지 영구 보관과 JSON 직렬화 & 명예의 전당 랭킹 시스템을 완전히 정복했습니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 4 · 13강: 인터넷 세상의 비밀 배달부: 다른 서버에서 데이터 가져오기 (JSON & Fetch)</p>
                  </div>
                  <a
                    href="../13-open-api/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>13강으로 즉시 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            )}

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 3 실전 AI 퀘스트</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('all')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>전체 코스 한눈에 보기</span>
                <Layers className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

      </main>

      {/* ===================================================================== */}
      {/* 3. 모던 푸터                                                         */}
      {/* ===================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AI·코딩 24강 교육과정. All rights reserved.</span>
          <span className="text-slate-400">시즌 3 피날레 · 12강: 우리 반 명예의 전당</span>
        </div>
      </footer>

    </div>
  );
};
