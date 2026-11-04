import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  Lightbulb,
  Award,
  Layers,
  Search,
  Target,
  Bot,
  Code2,
  PlayCircle,
  Bug,
  Lock,
  Unlock,
  Clock,
  MessageSquare,
  Zap,
  GitFork,
  Compass,
  Trophy,
  CheckSquare,
  FileCheck,
  Undo2,
  GitMerge,
  Workflow,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 3강 타입 정의 (Type Definitions)
 * ------------------------------------------------------------------------------
 */
export type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
export type RightConsoleTab = 'simulator' | 'tree_card' | 'checklist';
export type StoryTheme = 'fantasy' | 'cyberpunk' | 'space';

export interface StoryNode {
  id: string;
  depth: number;
  title: string;
  scene: string;
  choiceA?: {
    text: string;
    nextNodeId: string;
    badge: string;
  };
  choiceB?: {
    text: string;
    nextNodeId: string;
    badge: string;
  };
  isEnding?: boolean;
  endingType?: 'victory' | 'sacrifice' | 'peace' | 'mystery';
  endingTitle?: string;
  endingReward?: string;
}

export interface TreeCardData {
  gameTitle: string;
  protagonist: string;
  premise: string;
  choiceA: string;
  choiceB: string;
  endingA: string;
  endingB: string;
}

export interface ExperimentNoteData {
  decompositionReview: string;
  dilemmaDesign: string;
  endingTwist: string;
}

export interface RetrospectiveData {
  learnedLogic: string;
  aiPromptInsight: string;
  difficultPart: string;
  nextGoal: string;
}

/**
 * ------------------------------------------------------------------------------
 * 시뮬레이터 테마별 스토리 그래프 데이터 (Story Data)
 * ------------------------------------------------------------------------------
 */
const STORY_DATA: Record<StoryTheme, Record<string, StoryNode>> = {
  fantasy: {
    start: {
      id: 'start',
      depth: 1,
      title: '고대 유적의 갈림길',
      scene: '전설의 수정 구슬을 찾아 어둠의 숲 깊은 곳에 도달한 당신. 앞에는 푸른 안개가 감도는 바위 동굴과 무너진 고대 신전의 대리석 문이 나타났습니다.',
      choiceA: {
        text: '푸른 안개 자욱한 동굴로 조용히 침투한다',
        nextNodeId: 'cave_path',
        badge: '은신과 탐색'
      },
      choiceB: {
        text: '고대 신전의 웅장한 대리석 문을 밀고 정면 돌파한다',
        nextNodeId: 'temple_path',
        badge: '용기와 결단'
      }
    },
    cave_path: {
      id: 'cave_path',
      depth: 2,
      title: '발광 이끼 동굴의 수수께끼',
      scene: '동굴 천장에 빛나는 이끼가 흔들립니다. 길 끝에서 잠든 동굴 골렘을 발견했습니다. 발밑에는 골렘을 우회할 수 있는 좁은 암석 균열과, 골렘의 목에 걸린 황금 열쇠가 보입니다.',
      choiceA: {
        text: '골렘을 깨우지 않고 좁은 균열로 기어 들어간다',
        nextNodeId: 'ending_cave_safe',
        badge: '신중한 안전책'
      },
      choiceB: {
        text: '위험을 무릅쓰고 골렘 목의 보물 열쇠를 낚아챈다',
        nextNodeId: 'ending_cave_treasure',
        badge: '도박적 모험'
      }
    },
    temple_path: {
      id: 'temple_path',
      depth: 2,
      title: '신전 수호령과의 대면',
      scene: '신전 중앙 홀에 들어서자 공중에 빛나는 고대 수호령이 나타나 당신의 길을 막아섭니다. 수호령은 엄숙한 목소리로 지혜를 증명하는 수수께끼를 제시합니다.',
      choiceA: {
        text: '고대 비문에서 배운 역사와 마법 지식으로 수수께끼를 푼다',
        nextNodeId: 'ending_temple_wisdom',
        badge: '지식의 해답'
      },
      choiceB: {
        text: '속임수를 쓰지 않고 순수한 진심과 모험의 대의를 고백한다',
        nextNodeId: 'ending_temple_sincerity',
        badge: '진실된 심장'
      }
    },
    ending_cave_safe: {
      id: 'ending_cave_safe',
      depth: 3,
      title: '엔딩 1: 신중한 탐험가',
      scene: '당신은 상처 하나 없이 비밀 출구로 빠져나와 유적 안쪽의 마법 도서관에 도달했습니다. 위대한 마법서 한 권을 무사히 손에 넣고 은신처로 복귀합니다.',
      isEnding: true,
      endingType: 'peace',
      endingTitle: '평화로운 생환 엔딩',
      endingReward: '칭호: 그림자 걸음의 기록관'
    },
    ending_cave_treasure: {
      id: 'ending_cave_treasure',
      depth: 3,
      title: '엔딩 2: 용맹한 도전자',
      scene: '손에 땀을 쥐는 순간, 열쇠를 낚아채자 골렘이 눈을 떴지만 당신의 기민한 민첩성으로 보물창고 문을 따고 탈출했습니다! 전설의 보물 세트를 모두 획득했습니다.',
      isEnding: true,
      endingType: 'victory',
      endingTitle: '황금 보물 쟁취 엔딩',
      endingReward: '칭호: 전설의 유적 도굴왕'
    },
    ending_temple_wisdom: {
      id: 'ending_temple_wisdom',
      depth: 3,
      title: '엔딩 3: 고대의 현자',
      scene: '수호령은 당신의 명쾌한 논리에 감탄하며 미소를 지었습니다. 그는 신전의 비전 마법을 당신에게 전수하고 유적의 공식 수호자로 임명합니다.',
      isEnding: true,
      endingType: 'victory',
      endingTitle: '진리의 계승자 엔딩',
      endingReward: '칭호: 신전의 영원한 대현자'
    },
    ending_temple_sincerity: {
      id: 'ending_temple_sincerity',
      depth: 3,
      title: '엔딩 4: 새로운 동맹',
      scene: '당신의 순수한 영혼에 감동한 수호령은 자신의 봉인을 풀고 든든한 영혼 동료가 되어 여정에 동행하기로 결심했습니다. 새로운 모험의 문이 열립니다.',
      isEnding: true,
      endingType: 'mystery',
      endingTitle: '영혼의 서약 엔딩',
      endingReward: '칭호: 수호령의 영혼 친구'
    }
  },
  cyberpunk: {
    start: {
      id: 'start',
      depth: 1,
      title: '네온 골목의 추적자',
      scene: '2088년 네오 서울, 거대 기업의 기밀 데이터칩을 확보한 의뢰인이 살해당했습니다. 추적 장치를 감지한 당신 앞에는 고가 환풍로와 지하 하수 네트워크 두 갈래가 열립니다.',
      choiceA: {
        text: '사이버 의체를 가동해 옥상 환풍로로 질주한다',
        nextNodeId: 'roof_path',
        badge: '고공 기동'
      },
      choiceB: {
        text: '드론을 피해 어두운 지하 해킹 네트워크로 숨어든다',
        nextNodeId: 'under_path',
        badge: '다크웹 은신'
      }
    },
    roof_path: {
      id: 'roof_path',
      depth: 2,
      title: '고공 비행선 추격전',
      scene: '네온 광고판 위를 달리던 중 기업의 무장 헬기가 서치라이트를 비춥니다. 앞쪽 착륙 패드에 비어있는 화물 수송선과, 비상 통신탑이 보입니다.',
      choiceA: {
        text: '화물 수송선 조종석을 강제 점거해 조종한다',
        nextNodeId: 'ending_cyber_escape',
        badge: '직접 탈환'
      },
      choiceB: {
        text: '통신탑에 접속하여 시내 전체에 EMP 신호를 방출한다',
        nextNodeId: 'ending_cyber_blackout',
        badge: '광역 무력화'
      }
    },
    under_path: {
      id: 'under_path',
      depth: 2,
      title: '지하 레지스탕스의 은신처',
      scene: '하수구를 지나 도달한 곳은 반기업 해커 조직의 기지입니다. 그들의 리더가 데이터칩을 언론에 무료 폭로할지, 암시장에 팔아 자금을 마련할지 묻습니다.',
      choiceA: {
        text: '전 세계 무료 방송망에 기업 비리를 실시간 생중계한다',
        nextNodeId: 'ending_cyber_revolution',
        badge: '진실 폭로'
      },
      choiceB: {
        text: '암시장에 매각하여 최첨단 해킹 장비와 비밀 안전가옥을 얻는다',
        nextNodeId: 'ending_cyber_syndicate',
        badge: '현실적 이득'
      }
    },
    ending_cyber_escape: {
      id: 'ending_cyber_escape',
      depth: 3,
      title: '엔딩 1: 자유의 망명',
      scene: '도시 경계선을 뚫고 수송선은 중립 지대로 진입했습니다. 당신은 자유를 찾았고, 칩의 암호를 해독할 시간적 여유를 확보했습니다.',
      isEnding: true,
      endingType: 'peace',
      endingTitle: '도시 탈출 엔딩',
      endingReward: '칭호: 자유를 찾은 망명자'
    },
    ending_cyber_blackout: {
      id: 'ending_cyber_blackout',
      depth: 3,
      title: '엔딩 2: 블랙아웃 영웅',
      scene: '도시 전체의 전력이 차단되며 적 드론들이 일제히 추락했습니다! 당신은 혼란을 틈타 무사히 탈출했고 암흑 속 영웅으로 소문납니다.',
      isEnding: true,
      endingType: 'victory',
      endingTitle: '심야 정전 엔딩',
      endingReward: '칭호: 네온 시티의 정전 유령'
    },
    ending_cyber_revolution: {
      id: 'ending_cyber_revolution',
      depth: 3,
      title: '엔딩 3: 혁명의 기폭제',
      scene: '수억 명의 시민들이 기업의 추악한 음모를 생생히 목격했습니다. 시민 봉기가 시작되었고, 당신은 사이버 혁명의 상징이 되었습니다.',
      isEnding: true,
      endingType: 'victory',
      endingTitle: '민중 혁명 엔딩',
      endingReward: '칭호: 디지털 레지스탕스 리더'
    },
    ending_cyber_syndicate: {
      id: 'ending_cyber_syndicate',
      depth: 3,
      title: '엔딩 4: 암흑가의 실력자',
      scene: '막대한 크레딧과 최신 군용 사이버웨어로 무장한 당신. 이제 거대 기업도 당신을 함부로 건드릴 수 없는 어둠의 큰손이 되었습니다.',
      isEnding: true,
      endingType: 'mystery',
      endingTitle: '암흑가 거물 엔딩',
      endingReward: '칭호: 언더그라운드 픽서'
    }
  },
  space: {
    start: {
      id: 'start',
      depth: 1,
      title: '미지의 외계 행성 불시착',
      scene: '탐사선 오디세이호가 통신 불가 구역에 불시착했습니다. 산소 잔여량은 4시간. 레이더에 미확인 외계 유기 신호와 인공 전파 송신탑 신호가 동시에 잡힙니다.',
      choiceA: {
        text: '유기 생명 신호가 감지된 거대 수정 숲으로 향한다',
        nextNodeId: 'forest_path',
        badge: '생명체 조우'
      },
      choiceB: {
        text: '인공 전파가 발신되는 금속성 절벽 구조물로 전진한다',
        nextNodeId: 'cliff_path',
        badge: '고대 문명 탐색'
      }
    },
    forest_path: {
      id: 'forest_path',
      depth: 2,
      title: '수정 숲의 지적 생명체',
      scene: '숲속에서 텔레파시를 사용하는 발광 식물 군락과 마주했습니다. 그들은 당신에게 행성의 대기를 정화하는 씨앗과 치유의 샘물 중 하나를 제안합니다.',
      choiceA: {
        text: '대기 정화 씨앗을 받아 행성을 테라포밍한다',
        nextNodeId: 'ending_space_terraform',
        badge: '생태 개척'
      },
      choiceB: {
        text: '치유의 샘물로 부서진 탐사선 생명유지장치를 복구한다',
        nextNodeId: 'ending_space_home',
        badge: '귀환 선택'
      }
    },
    cliff_path: {
      id: 'cliff_path',
      depth: 2,
      title: '선구자의 우주 관제 센터',
      scene: '수천 년 전 버려진 외계 함선 관제탑을 가동했습니다. 은하계 연합 함대로 향하는 SOS 신호 증폭기와 고대 하이퍼드라이브 워프 엔진이 가동 대기 중입니다.',
      choiceA: {
        text: 'SOS 신호를 최대 출력으로 발신하여 구조대를 기다린다',
        nextNodeId: 'ending_space_rescue',
        badge: '구조 요청'
      },
      choiceB: {
        text: '검증되지 않은 미지의 하이퍼드라이브를 즉각 가동한다',
        nextNodeId: 'ending_space_warp',
        badge: '미지의 차원 도약'
      }
    },
    ending_space_terraform: {
      id: 'ending_space_terraform',
      depth: 3,
      title: '엔딩 1: 새로운 신세계 개척',
      scene: '행성의 대기가 몇 시간 만에 지구와 같은 맑은 산소로 변했습니다. 당신은 인류 최초의 외계 행성 정착민이자 건국자가 됩니다.',
      isEnding: true,
      endingType: 'victory',
      endingTitle: '새로운 고향 엔딩',
      endingReward: '칭호: 행성 제1호 개척자'
    },
    ending_space_home: {
      id: 'ending_space_home',
      depth: 3,
      title: '엔딩 2: 지구로의 무사 귀환',
      scene: '기적적으로 수리된 탐사선 엔진이 점화되었습니다. 외계 생명체의 귀중한 샘플을 싣고 고향 지구로 금의환향합니다.',
      isEnding: true,
      endingType: 'peace',
      endingTitle: '영광의 귀환 엔딩',
      endingReward: '칭호: 기적의 솔로 파일럿'
    },
    ending_space_rescue: {
      id: 'ending_space_rescue',
      depth: 3,
      title: '엔딩 3: 은하계 연합의 조우',
      scene: '신호를 수신한 다종족 은하 연합의 거대 모선이 착륙했습니다. 인류는 드디어 우주 연맹의 정식 일원으로 환영받게 됩니다.',
      isEnding: true,
      endingType: 'victory',
      endingTitle: '퍼스트 콘택트 엔딩',
      endingReward: '칭호: 지구 전권 외교 대사'
    },
    ending_space_warp: {
      id: 'ending_space_warp',
      depth: 3,
      title: '엔딩 4: 시간의 미궁 탐험가',
      scene: '워프 엔진이 시공간 균열을 열었습니다. 당신은 알려지지 않은 5차원 우주 공간으로 도약하여 영원한 시간의 탐험가가 되었습니다.',
      isEnding: true,
      endingType: 'mystery',
      endingTitle: '차원 방랑자 엔딩',
      endingReward: '칭호: 5차원 시공간 여행자'
    }
  }
};

/**
 * 3단계 분기 프롬프트 템플릿
 */
const PROMPT_TEMPLATES = {
  step1: `[역할]: 당신은 텍스트 어드벤처 게임 마스터(Game Master)입니다.
[목표]: 플레이어가 몰입할 수 있는 흥미진진한 3단계 분기 스토리의 시작점을 만드세요.
[세계관]: 버려진 마법 공학 도시 '아르카나'의 지하 미궁
[주인공]: 마도공학자 '카엘' (분석적이며 신중한 성격, 마법 나침반 보유)
[요구사항]:
1. 도입부 상황을 3~4문장으로 묘사하세요.
2. 주인공이 마주한 최초의 위기 상황을 제시하세요.
3. 플레이어가 선택할 수 있는 1차 갈림길(선택지 A와 선택지 B)을 명확한 장단점과 함께 제시하세요.`,

  step2: `[이전 맥락]: 주인공 카엘이 지하 미궁에서 '선택지 A: 무너져가는 마법 도서관의 비밀 통로'를 선택했습니다.
[역할]: 게임 마스터
[목표]: 1차 선택에 따른 2단계 상황 전개 및 2차 분기 갈림길 2개를 설계하세요.
[규칙]:
1. 1차 선택의 직접적인 결과와 새로운 사건을 3문장으로 서술하세요.
2. 단순한 정답 맞히기가 아닌, 가치관이나 전술적 판단이 담긴 2차 선택지 2종(A-1, A-2)을 만드세요.
3. 각 선택지 선택 시 예상되는 리스크를 한 문장씩 포함하세요.`,

  step3: `[역할]: 게임 마스터
[목표]: 지금까지의 모든 분기를 종합하여 서로 다른 4가지 멀티 엔딩을 완성하세요.
[분기 트리]:
- A-1 경로 선택 -> 엔딩 1 (승리/성공)
- A-2 경로 선택 -> 엔딩 2 (희생/반전)
- B-1 경로 선택 -> 엔딩 3 (평화/타협)
- B-2 경로 선택 -> 엔딩 4 (새로운 비밀 발견)
[출력 형식]:
각 엔딩마다 다음 요소를 반드시 포함하세요:
1. 엔딩 명칭 (예: [엔딩 1: 고대 비전의 계승자])
2. 결말 스토리 (4~5문장 서술)
3. 획득 칭호 및 플레이어 평가`
};

export const Lesson03: React.FC = () => {
  // ----------------------------------------------------------------------------
  // 상태 관리 (State Management)
  // ----------------------------------------------------------------------------
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('simulator');

  // 시뮬레이터 상태
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>('fantasy');
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  // 퀴즈 상태
  const [quiz1Answer, setQuiz1Answer] = useState<number | null>(null);
  const [quiz2Answer, setQuiz2Answer] = useState<number | null>(null);

  // 복사 피드백
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 기획 카드 빌더 상태
  const [treeCard, setTreeCard] = useState<TreeCardData>({
    gameTitle: '별빛 미궁의 나침반',
    protagonist: '엘레나 (유적 탐사관)',
    premise: '마법 장막이 걷히며 드러난 전설의 별빛 사원 문 앞',
    choiceA: '사원의 정문 봉인 문양을 마법 지팡이로 해제한다',
    choiceB: '벽면 덩굴을 타고 사원 위쪽 비밀 창문으로 잠입한다',
    endingA: '엔딩 A: 고대 지식의 계승자 (성공)',
    endingB: '엔딩 B: 잠든 골렘의 파수꾼 (반전)'
  });

  // 실험 관찰 기록장 (로컬스토리지 연동)
  const [notes, setNotes] = useState<ExperimentNoteData>(() => {
    try {
      const saved = localStorage.getItem('lesson03_notes');
      return saved
        ? JSON.parse(saved)
        : {
            decompositionReview: '',
            dilemmaDesign: '',
            endingTwist: ''
          };
    } catch {
      return { decompositionReview: '', dilemmaDesign: '', endingTwist: '' };
    }
  });

  // 회고록 상태
  const [retro, setRetro] = useState<RetrospectiveData>(() => {
    try {
      const saved = localStorage.getItem('lesson03_retro');
      return saved
        ? JSON.parse(saved)
        : {
            learnedLogic: '',
            aiPromptInsight: '',
            difficultPart: '',
            nextGoal: ''
          };
    } catch {
      return { learnedLogic: '', aiPromptInsight: '', difficultPart: '', nextGoal: '' };
    }
  });

  // 체크리스트 상태
  const [checklist, setChecklist] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('lesson03_checklist');
      return saved ? JSON.parse(saved) : [false, false, false, false, false, false];
    } catch {
      return [false, false, false, false, false, false];
    }
  });

  // 로컬스토리지 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem('lesson03_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('lesson03_retro', JSON.stringify(retro));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [retro]);

  useEffect(() => {
    try {
      localStorage.setItem('lesson03_checklist', JSON.stringify(checklist));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [checklist]);

  // 체크리스트 진행률 계산
  const checklistProgress = useMemo(() => {
    const checkedCount = checklist.filter(Boolean).length;
    return Math.round((checkedCount / checklist.length) * 100);
  }, [checklist]);

  const isGateUnlocked = checklistProgress === 100;

  // 시뮬레이터 현재 노드
  const currentNode = useMemo(() => {
    const themeTree = STORY_DATA[selectedTheme];
    return themeTree[currentNodeId] || themeTree['start'];
  }, [selectedTheme, currentNodeId]);

  // 시뮬레이터 선택지 이동
  const handleMakeChoice = (nextNodeId: string) => {
    setHistoryStack((prev) => [...prev, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  // 시뮬레이터 되돌아가기 (Undo)
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prevNodeId = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setCurrentNodeId(prevNodeId);
  };

  // 시뮬레이터 초기화
  const handleResetSimulator = (newTheme?: StoryTheme) => {
    if (newTheme) setSelectedTheme(newTheme);
    setCurrentNodeId('start');
    setHistoryStack([]);
  };

  // 클립보드 복사 유틸리티
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // 체크리스트 토글
  const toggleChecklist = (index: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // 회고록 다운로드 (JSON)
  const handleDownloadRetro = () => {
    const exportData = {
      lesson: 'Lesson 03 - 스토리 분기와 선택지 설계',
      exportedAt: new Date().toISOString(),
      treeCard,
      notes,
      retro,
      checklistProgress: `${checklistProgress}%`
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lesson03_story_design_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans text-base sm:text-lg leading-relaxed selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* =========================================================================
          1. 상단 글로벌 GNB & 4단계 퀘스트 스텝퍼 (Wanted Montage 라이트 규격)
      ========================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* 좌측: 과정 홈 링크 & 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
            <span className="w-1 h-3 bg-slate-200 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                시즌 1 · 3강
              </span>
              <span className="text-sm font-bold text-slate-900 truncate">
                갈림길의 모험: 스토리 분기와 선택지 설계
              </span>
            </div>
          </div>

          {/* 중앙: 4단계 퀘스트 스텝퍼 탭 (GNB 중앙 정렬) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
              <span>브리핑</span>
            </button>

            <button
              onClick={() => setActiveStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>분기 논리</span>
            </button>

            <button
              onClick={() => setActiveStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
              <span>실습·오류</span>
            </button>

            <button
              onClick={() => setActiveStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
              <span>미션 & 회고</span>
            </button>
          </nav>

          {/* 우측: 3강 진행률 & 4강 언락 상태 뱃지 */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold block leading-tight">진척도</span>
                <span className="text-xs text-indigo-600 font-bold leading-tight">{checklist.filter(Boolean).length}/6 ({checklistProgress}%)</span>
              </div>
              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 p-0.5">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            </div>

            <div>
              {isGateUnlocked ? (
                <a
                  href="/materials/ai/lessons/04-balance-patch/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-sm"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4강 열림</span>
                </a>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed whitespace-nowrap"
                  title="우측 체크리스트 6개를 완료하면 4강이 열립니다."
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>4강 잠김</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 전용 4단계 퀘스트 스텝퍼 (가로 스크롤) */}
        <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto border-t border-slate-200 bg-slate-50 px-2 py-1.5">
          <button
            onClick={() => setActiveStage('stage1')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage1' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            1. 브리핑
          </button>
          <button
            onClick={() => setActiveStage('stage2')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage2' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            2. 분기논리
          </button>
          <button
            onClick={() => setActiveStage('stage3')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage3' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            3. 실습오류
          </button>
          <button
            onClick={() => setActiveStage('stage4')}
            className={`px-2.5 py-1 rounded-md text-sm font-bold whitespace-nowrap ${
              activeStage === 'stage4' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            4. 미션회고
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. 메인 2-패널 스플릿 뷰 워크스페이스
      ========================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* =====================================================================
            좌측 60% 캔버스: 4단계 퀘스트 동적 콘텐츠 영역 (독립 슬라이드바)
        ===================================================================== */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ------------------------------------------------------------------
              STAGE 1: 퀘스트 브리핑 (오리엔테이션)
          ------------------------------------------------------------------ */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 히어로 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                    갈림길 모험 설계 · 선택의 갈림길과 트리 구조
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    3강 — 갈림길의 모험: 스토리 분기와 선택지 설계
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                    플레이어의 선택 한 번으로 영웅이 될 수도, 미궁에 갇힐 수도 있습니다!
                    소프트웨어의 핵심 원리인 <strong className="text-indigo-600 font-semibold">조건 분기(if-else)</strong>와{' '}
                    <strong className="text-indigo-600 font-semibold">작업 분해(Decomposition)</strong>를 활용해
                    AI와 함께 4가지 결말을 가진 살아 숨 쉬는 인터랙티브 스토리 게임을 설계해 보세요.
                  </p>
                </div>

                {/* 메타 4구리드 칩 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">약 45~50분 (자기 페이스)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">실습 도구</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">브라우저 & 무료 AI</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">선수 지식</span>
                      <span className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">2강 G-A-C-O 프레임워크</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">오늘의 결과물</span>
                      <span className="text-xs font-bold text-indigo-700 leading-snug whitespace-nowrap">3단계 분기 스토리 기획서</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4대 핵심 학습 목표 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      오늘 정복할 4가지 핵심 퀘스트 (Rubric)
                    </h3>
                    <p className="text-xs text-slate-500">각 단계를 거치며 인터랙티브 스토리 공학의 기초를 탄탄히 다집니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      01
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">작업 분해 (Decomposition)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        복잡한 스토리를 시작점(도입), 1차 갈림길, 2차 갈림길, 최종 엔딩의 단계별 노드로 쪼개어 구조화합니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      02
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">의미 있는 선택지 (Meaningful Choice)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        단순 퀴즈가 아닌, 장단점과 가치관이 뚜렷한 진정한 딜레마를 설계하여 플레이어의 깊은 고민을 유도합니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      03
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">4대 멀티 엔딩 (Multiple Endings)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        대성공, 극적 반전, 명예로운 타협, 미스터리 등 선택에 따른 개연성 있는 결말 4종을 완전히 매핑합니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      04
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">플레이테스트 & 버그 검증</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        우측 콘솔의 시뮬레이터와 AI를 통해 가짜 선택지 및 개연성 없는 돌연사 함정을 사전 필터링합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측 실습 콘솔 가이드 배너 */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 flex items-start gap-3.5 text-xs leading-relaxed">
                <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-slate-700 space-y-1">
                  <strong className="text-indigo-900 font-semibold block text-sm">실습 안내 (Right Console):</strong>
                  <p>
                    화면 우측 고정 콘솔에서 <strong className="text-slate-900">[스토리 분기 시뮬레이터]</strong>를 직접 조작해 판타지, 사이버펑크, 우주 테마의 인터랙티브 선택지를 즉시 체험할 수 있습니다. 기획 중인 스토리는 <strong className="text-slate-900">[트리 카드 빌더]</strong>에 기록해 멋진 게임 카드로 완성해 보세요!
                  </p>
                </div>
              </div>

              {/* 하단 이동 네비게이션 */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setActiveStage('stage2');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>다음: Stage 2 분기 논리 두뇌 해부</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              STAGE 2: 분기 논리 두뇌 해부 (Decomposition & Branching)
          ------------------------------------------------------------------ */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              {/* 섹션 타이틀 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                    Core Computational Principles
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  컴퓨팅 사고의 핵심: 레고 블록 쪼개기와 갈림길 마법
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  컴퓨터 과학자처럼 생각하기! 거대한 게임 세계를 만드는 2가지 강력한 생각 도구를 배워봅니다.
                </p>
              </div>

              {/* 벤토 그리드: 2대 원리 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-3">
                      <Layers className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center justify-between">
                      <span>1. 작업 분해 (Decomposition)</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                        Divide & Conquer
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      "재미있는 모험 이야기를 써줘"라고 한꺼번에 요구하면 AI는 뻔하고 일직선인 이야기를 출력합니다.
                      방대한 세계를 <strong className="text-violet-700 font-semibold">[시작 노드] → [1차 갈림길] → [2차 갈림길] → [엔딩]</strong>으로 잘게 쪼개어 각 단계를 독립적으로 완성해 나가는 것이 작업 분해의 힘입니다.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>한 번에 하나의 선택 지점에 집중하여 깊이를 더합니다.</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                      <GitFork className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center justify-between">
                      <span>2. 조건 분기 (Condition & Branching)</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        if / else Logic
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      소프트웨어의 영혼은 조건문입니다.
                      <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded mx-1">if (플레이어 == '동굴')</code>이면 어둠의 시련을,
                      <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded mx-1">else if (플레이어 == '신전')</code>이면 지혜의 시련을 호출합니다.
                      사용자의 입력 값에 따라 다른 상태로 전이되는 메커니즘을 스토리로 구현하는 과정입니다.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>선택마다 플레이어가 체감하는 결과의 질이 달라져야 합니다.</span>
                  </div>
                </div>
              </div>

              {/* 분기 트리 아키텍처 다이어그램 시각화 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      표준 3단계 바이너리 트리(Binary Tree) 아키텍처
                    </h3>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold">
                    총 4대 멀티 엔딩
                  </span>
                </div>

                {/* 계층형 트리 렌더링 */}
                <div className="space-y-4 font-mono text-xs">
                  {/* Root Node */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-md bg-indigo-50/70 border-2 border-indigo-200 rounded-xl p-3.5 text-center shadow-sm">
                      <span className="text-indigo-700 font-bold block text-xs uppercase tracking-wider mb-0.5">
                        Depth 1: Root Node (시작점)
                      </span>
                      <span className="text-slate-900 font-bold text-sm">도입부 상황 & 최초의 갈림길 마주함</span>
                    </div>
                  </div>

                  {/* Connector 1 */}
                  <div className="flex justify-center items-center space-x-20 text-slate-400 font-sans font-medium text-xs">
                    <span>↙ [선택지 A]</span>
                    <span>↘ [선택지 B]</span>
                  </div>

                  {/* Level 2 Nodes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <span className="text-violet-700 font-bold block text-xs mb-0.5">Depth 2: 경로 A (예: 은신)</span>
                      <span className="text-slate-700 text-xs font-sans">2차 선택지 A-1 vs A-2 제시</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <span className="text-emerald-700 font-bold block text-xs mb-0.5">Depth 2: 경로 B (예: 정면돌파)</span>
                      <span className="text-slate-700 text-xs font-sans">2차 선택지 B-1 vs B-2 제시</span>
                    </div>
                  </div>

                  {/* Connector 2 */}
                  <div className="grid grid-cols-4 gap-2 text-center text-slate-400 text-[11px] font-sans font-medium">
                    <span>↓ A-1</span>
                    <span>↓ A-2</span>
                    <span>↓ B-1</span>
                    <span>↓ B-2</span>
                  </div>

                  {/* Level 3 Leaves (Endings) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-center">
                      <span className="text-emerald-700 font-bold block text-[11px] mb-0.5">엔딩 1</span>
                      <span className="text-slate-900 text-xs font-sans font-bold">명예로운 대승리</span>
                    </div>
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-center">
                      <span className="text-amber-700 font-bold block text-[11px] mb-0.5">엔딩 2</span>
                      <span className="text-slate-900 text-xs font-sans font-bold">희생과 극적 탈출</span>
                    </div>
                    <div className="bg-cyan-50/80 border border-cyan-200 rounded-xl p-3 text-center">
                      <span className="text-cyan-700 font-bold block text-[11px] mb-0.5">엔딩 3</span>
                      <span className="text-slate-900 text-xs font-sans font-bold">평화적 타협 합의</span>
                    </div>
                    <div className="bg-violet-50/80 border border-violet-200 rounded-xl p-3 text-center">
                      <span className="text-violet-700 font-bold block text-[11px] mb-0.5">엔딩 4</span>
                      <span className="text-slate-900 text-xs font-sans font-bold">미지의 차원 방랑</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 15.6인치 최적화 테이블: 좋은 선택지 vs 나쁜 선택지 비교 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Search className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    선택지 설계 품질 체크 (Meaningful vs False Choice)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                        <th className="py-2.5 px-3 font-semibold whitespace-nowrap">구분</th>
                        <th className="py-2.5 px-3 font-semibold text-emerald-700 whitespace-nowrap">
                          좋은 선택지 (True Dilemma)
                        </th>
                        <th className="py-2.5 px-3 font-semibold text-rose-700 whitespace-nowrap">
                          나쁜 선택지 (False Choice)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">선택의 본질</td>
                        <td className="py-3 px-3">
                          양쪽 모두 타당한 이득과 대가가 존재하여 고민을 유발함
                          <div className="text-slate-500 text-[11px] mt-0.5">(예: 은신=안전하지만 단서 부족 vs 정면돌파=위험하지만 보물 직행)</div>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          한쪽이 명백한 정답이거나 상식적으로 고를 수 없는 오답
                          <div className="text-rose-600 text-[11px] mt-0.5">(예: 문을 연다 vs 제자리에서 가만히 잠을 잔다)</div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">스토리 영향도</td>
                        <td className="py-3 px-3">
                          다음 장면의 배경, 만나는 인물, 획득 단서가 완전히 달라짐
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          어느 쪽을 골라도 "어찌 되었든 당신은 앞으로 걸어갔다"처럼 합류함
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">플레이어 경험</td>
                        <td className="py-3 px-3 text-emerald-700 font-semibold">
                          "내 판단과 가치관에 의해 결말이 바뀌었구나!" (성취감 극대화)
                        </td>
                        <td className="py-3 px-3 text-rose-600 font-semibold">
                          "내가 뭘 골라도 제작자 마음대로 정해져 있네..." (몰입도 급락)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 돌발 퀴즈 2문항 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Quick Check Quiz</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  두뇌 깨우기: 좋은 선택지 판별 퀴즈
                </h3>

                {/* 퀴즈 1 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    Q1. 다음 중 플레이어에게 깊은 고민을 유발하는 가장 훌륭한 선택지 설계는 무엇일까요?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setQuiz1Answer(1)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        quiz1Answer === 1
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      A. 보물 상자를 연다 vs 상자를 발로 차서 부순다
                    </button>
                    <button
                      onClick={() => setQuiz1Answer(2)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        quiz1Answer === 2
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      B. 위험하지만 강력한 마법검을 뽑는다 vs 마법검을 포기하고 부상당한 동료를 안전지대로 후송한다
                    </button>
                  </div>
                  {quiz1Answer !== null && (
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        quiz1Answer === 2
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {quiz1Answer === 2 ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>정답입니다!</strong> 개인의 강함(위험 감수)과 동료의 구출(도덕적 가치관)이라는 명확한 딜레마가 형성되어 깊은 몰입감을 줍니다.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>오답입니다.</strong> 상자를 여는 것과 차는 것은 뚜렷한 철학적 딜레마나 계산 가능한 대가가 없어 단순 장난형 선택지에 가깝습니다.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 퀴즈 2 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    Q2. 복잡한 텍스트 어드벤처 스토리를 AI에게 요청할 때 '작업 분해(Decomposition)'를 적용하는 가장 올바른 방법은?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setQuiz2Answer(1)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        quiz2Answer === 1
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      A. 시작 상황 → 1차 분기 → 2차 분기 → 엔딩 순서로 단계별 프롬프트를 나누어 순차 발전시킨다
                    </button>
                    <button
                      onClick={() => setQuiz2Answer(2)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        quiz2Answer === 2
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      B. 한 번의 프롬프트에 모든 분기와 엔딩 10개를 1초 만에 한 번에 다 써달라고 명령한다
                    </button>
                  </div>
                  {quiz2Answer !== null && (
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        quiz2Answer === 1
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {quiz2Answer === 1 ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>정답입니다!</strong> 복잡한 생성 작업을 모듈별로 분해하여 단계적으로 요청할 때 환각 없이 가장 밀도 높은 플롯이 완성됩니다.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>오답입니다.</strong> 한 번에 과도한 분기를 지시하면 AI의 맥락 집중력이 분산되어 모든 분기가 판에 박힌 클리셰로 전락합니다.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 이동 네비게이션 */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveStage('stage1');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 1 브리핑</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStage('stage3');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>다음: Stage 3 실습·오류 연구소</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              STAGE 3: 비교 실험 & 실습 연구소 (3-Step Practice & Error Lab)
          ------------------------------------------------------------------ */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              {/* 섹션 타이틀 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                    Progressive Story Prompting
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  3단계 점진적 프롬프트 프레임워크
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  AI 스토리 작가와 함께 나만의 텍스트 모험 게임을 한 단계씩 차근차근 빌드하는 마법의 주문서!
                </p>
              </div>

              {/* 프롬프트 카드 3종 */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Step 1: 세계관 & 주인공 소환 프롬프트
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(PROMPT_TEMPLATES.step1, 'prompt1')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                    >
                      {copiedKey === 'prompt1' ? (
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
                  <p className="text-xs text-slate-500">
                    주인공의 성격, 특수 아이템, 그리고 최초로 직면한 갈림길의 긴장감을 설정합니다.
                  </p>
                  <pre className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                    {PROMPT_TEMPLATES.step1}
                  </pre>
                </div>

                {/* Step 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Step 2: 1차 선택 반영 및 2차 분기 갈림길 설계
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(PROMPT_TEMPLATES.step2, 'prompt2')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                    >
                      {copiedKey === 'prompt2' ? (
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
                  <p className="text-xs text-slate-500">
                    플레이어의 선택을 인과적으로 반영하고, 2차 딜레마(A-1 vs A-2)를 발생시킵니다.
                  </p>
                  <pre className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                    {PROMPT_TEMPLATES.step2}
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Step 3: 4대 멀티 엔딩 및 칭호 보상 완성
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(PROMPT_TEMPLATES.step3, 'prompt3')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                    >
                      {copiedKey === 'prompt3' ? (
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
                  <p className="text-xs text-slate-500">
                    각 분기 경로의 인과관계를 마감하고, 칭호와 함께 결말의 여운을 남깁니다.
                  </p>
                  <pre className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                    {PROMPT_TEMPLATES.step3}
                  </pre>
                </div>
              </div>

              {/* 오류 연구소: 3대 함정 & 처방전 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-rose-600 pb-3 border-b border-slate-100">
                  <Bug className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">
                    오류 연구소: 분기 스토리의 치명적 함정 3선
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* 함정 1 */}
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>함정 1. 가짜 선택지</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        A를 고르든 B를 고르든 바로 다음 줄에서 똑같은 결과를 만나는 구조입니다. 플레이어는 심한 배신감을 느낍니다.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-rose-100 text-indigo-700 font-medium">
                      처방: 획득 아이템, NPC 호감도 등 <strong>'상태(State) 변화'</strong>를 명시하세요.
                    </div>
                  </div>

                  {/* 함정 2 */}
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>함정 2. 뜬금없는 돌연사</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        아무런 복선 없이 "함정을 밟아 게임오버되었습니다"로 끝나는 경우입니다. 운에 의존하는 게임으로 전락합니다.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-rose-100 text-indigo-700 font-medium">
                      처방: 사전에 바닥 균열이나 바람 소리 같은 <strong>'시각·청각적 복선'</strong>을 깔아두세요.
                    </div>
                  </div>

                  {/* 함정 3 */}
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>함정 3. 가지치기 폭발</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-normal">
                        선택지를 무한정 늘리다 보면 엔딩이 수십 개로 불어나 작가도 AI도 수습할 수 없는 미완성작이 됩니다.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-rose-100 text-indigo-700 font-medium">
                      처방: 초보 단계에서는 <strong>'깊이 3단계 제한'</strong> 또는 합류 지점(Choke Point)을 두세요.
                    </div>
                  </div>
                </div>
              </div>

              {/* 실험 관찰 및 분석 기록장 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <FileCheck className="w-5 h-5" />
                    <h3 className="text-base font-bold text-slate-900">
                      실시간 실험 관찰 기록장 (자동 저장)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 로컬 브라우저 보관
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      1. 작업 분해 과정에서 스토리를 몇 단계로 나누었을 때 가장 흐름이 매끄러웠나요?
                    </label>
                    <input
                      type="text"
                      value={notes.decompositionReview}
                      onChange={(e) => setNotes({ ...notes, decompositionReview: e.target.value })}
                      placeholder="예: 3단계(도입-1차갈림길-엔딩)로 나눌 때 가장 구조가 탄탄했습니다."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      2. 내가 설계한 선택지 중 플레이어가 가장 고민할 만한 딜레마 포인트는 무엇인가요?
                    </label>
                    <input
                      type="text"
                      value={notes.dilemmaDesign}
                      onChange={(e) => setNotes({ ...notes, dilemmaDesign: e.target.value })}
                      placeholder="예: 안전하지만 유물을 놓치는 길 vs 위험하지만 유물을 얻는 모험"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      3. AI가 생성한 엔딩 중 예상치 못한 참신한 반전이나 보완할 점이 있었나요?
                    </label>
                    <input
                      type="text"
                      value={notes.endingTwist}
                      onChange={(e) => setNotes({ ...notes, endingTwist: e.target.value })}
                      placeholder="예: 보물만 얻는 줄 알았는데 수호령이 동료로 합류하는 반전이 좋았습니다."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 이동 네비게이션 */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveStage('stage2');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 2 분기 논리</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStage('stage4');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>다음: Stage 4 실전 미션 & 회고</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              STAGE 4: 실전 미션 & 학습 회고 (Quest & Retrospective)
          ------------------------------------------------------------------ */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              {/* 섹션 타이틀 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                    Final Quest & Reflection
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  실전 미션: 나만의 텍스트 어드벤처 기획 완성
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  갈림길 마법과 블록 쪼개기를 총동원하여, 친구들이 직접 플레이할 수 있는 나만의 모험을 완성하세요!
                </p>
              </div>

              {/* 미션 수행 가이드 카드 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 pb-3 border-b border-slate-100">
                  <Target className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">
                    최종 미션 수행 3원칙
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-indigo-700 block">1. 테마 선택</span>
                    <p className="text-slate-600 leading-relaxed font-normal">
                      [판타지 미궁], [사이버펑크 수사], [SF 우주 탐사] 중 하나를 고르거나 나만의 세계관을 정합니다.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-indigo-700 block">2. 짝꿍 플레이테스트</span>
                    <p className="text-slate-600 leading-relaxed font-normal">
                      완성된 분기를 친구나 AI에게 플레이하게 한 뒤 "가짜 선택지였는지" 냉정하게 피드백을 받습니다.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-indigo-700 block">3. 히든 엔딩 챌린지</span>
                    <p className="text-slate-600 leading-relaxed font-normal">
                      (선택 과제) 특정 조건(예: 1차에서 열쇠 획득 + 2차에서 정면돌파)을 만족해야 열리는 비밀 엔딩을 추가해 봅니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 생각해보기 토론 질문 카드 */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  <span>Thinking Expansion (생각해보기)</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  AI 시대의 분기 공학 토론
                </h3>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong className="text-indigo-900 font-semibold">질문 1:</strong> 현실의 자율주행 자동차가 보행자와 가드레일 중 하나를 피해야 하는 상황도 if-else 조건 분기로 완벽히 통제할 수 있을까요? 인공지능 윤리와 분기 논리는 어떻게 연결될까요?
                  </p>
                  <p>
                    <strong className="text-indigo-900 font-semibold">질문 2:</strong> 플레이어가 게임에서 '자유도가 높다'고 느끼는 순간은 선택지가 100개일 때일까요, 아니면 2개뿐이라도 내 선택에 세상이 반응할 때일까요?
                  </p>
                </div>
              </div>

              {/* 4문항 학습 회고록 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <FileText className="w-5 h-5" />
                    <h3 className="text-base font-bold text-slate-900">
                      3강 학습 회고록 (Self-Retrospective)
                    </h3>
                  </div>
                  <button
                    onClick={handleDownloadRetro}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>기록 다운로드</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      1. 오늘 배운 조건 분기(if-else)와 작업 분해 원리를 한 줄로 요약한다면?
                    </label>
                    <input
                      type="text"
                      value={retro.learnedLogic}
                      onChange={(e) => setRetro({ ...retro, learnedLogic: e.target.value })}
                      placeholder="예: 복잡한 사건을 작은 노드로 나누고, 플레이어 선택에 따라 다른 세상을 여는 프로그래밍의 기초!"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      2. AI에게 스토리를 지시할 때 가장 효과적이었던 프롬프트 작성 팁은?
                    </label>
                    <input
                      type="text"
                      value={retro.aiPromptInsight}
                      onChange={(e) => setRetro({ ...retro, aiPromptInsight: e.target.value })}
                      placeholder="예: 4개 엔딩을 한꺼번에 시키지 않고 3단계로 점진적으로 확장시킨 점"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      3. 선택지를 설계할 때 가장 어려웠던 점이나 고민스러웠던 부분은?
                    </label>
                    <input
                      type="text"
                      value={retro.difficultPart}
                      onChange={(e) => setRetro({ ...retro, difficultPart: e.target.value })}
                      placeholder="예: 두 선택지 모두 매력적으로 느껴지도록 딜레마 균형을 맞추는 일"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      4. 다음 4강(스토리 검증과 밸런스 패치)에서 도전해보고 싶은 목표는?
                    </label>
                    <input
                      type="text"
                      value={retro.nextGoal}
                      onChange={(e) => setRetro({ ...retro, nextGoal: e.target.value })}
                      placeholder="예: AI를 악랄한 게임 버그 테스터로 만들어 내 스토리의 허점을 찾아내게 하기"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 다음 4강 예고 프리뷰 카드 */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Next Level Preview</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    4강 — AI와 함께하는 밸런스 패치: 스토리 검증과 개선
                  </h3>
                  <p className="text-xs text-slate-600 max-w-lg leading-relaxed font-normal">
                    내가 만든 스토리에 버그는 없을까? AI에게 까다로운 게임 비평가 페르소나를 입혀 재미와 난이도를 정밀 튜닝하는 밸런스 패치 비법이 펼쳐집니다!
                  </p>
                </div>
                <div className="hidden sm:block shrink-0 pl-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold shadow-sm">
                    <span>4강 준비 완료</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  </span>
                </div>
              </div>

              {/* 하단 이동 네비게이션 */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveStage('stage3');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전: Stage 3 실습·오류</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRightTab('checklist');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>우측 자가 점검 체크리스트로 완주하기</span>
                  <CheckSquare className="w-4 h-4" />
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
                  JUNIOR DEVELOPER GLOSSARY · 3강 전문 용어 도감
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
              {/* 용어 1: 조건 분기 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-indigo-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                      <GitFork className="w-4 h-4 text-indigo-400" />
                      1. 조건 분기
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 조건 분기 (If-Else Branching)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-mono flex-shrink-0">Logic</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "비가 오면 우산을 쓰고, 해가 뜨면 모자를 쓰는 갈림길 선택 마법!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 주어진 조건식의 참(True) 또는 거짓(False) 판별 결과에 따라 프로그램의 실행 흐름을 여러 갈래로 나누어 처리하는 제어문(Control Flow) 구조입니다.
                </p>
              </div>

              {/* 용어 2: 작업 분해 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-400" />
                      2. 작업 분해
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Decomposition</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">Thinking</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "거대한 레고 성을 만들기 위해 방, 탑, 성문 블록으로 쪼개어 하나씩 조립하기!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 복잡한 문제나 거대한 전체 시스템을 해결하기 쉽고 독립적인 작은 하위 작업(Sub-tasks)으로 나누어 분석하는 컴퓨팅 사고(Computational Thinking)의 핵심 기법입니다.
                </p>
              </div>

              {/* 용어 3: 트리 구조 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Workflow className="w-4 h-4 text-amber-400" />
                      3. 트리 구조
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Tree Structure</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">Data Tree</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "나무 기둥에서 큰 가지가 뻗고, 가지마다 또 작은 나뭇가지와 잎사귀가 펼쳐지는 모험 지도!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 하나의 뿌리(Root) 노드에서 시작하여 부모-자식 관계를 이루며 여러 갈래로 뻗어나가는 계층적 비선형 자료구조(Hierarchical Data Structure)입니다.
                </p>
              </div>

              {/* 용어 4: 상태 관리 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      4. 상태 관리
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: State Management</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">Memory</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "모험을 하면서 가방에 주워 담은 열쇠, 마법 물약, 체력을 잊어버리지 않게 수첩에 적어두기!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 애플리케이션이나 게임이 진행되는 동안 변화하는 동적 데이터(주인공 체력, 인벤토리, 플레이어의 이전 선택 이력 등)를 메모리에 보관하고 추적하는 기술입니다.
                </p>
              </div>

              {/* 용어 5: 멀티 엔딩 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-violet-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-violet-400" />
                      5. 멀티 엔딩
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 멀티 엔딩 (Multiple Endings)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-violet-900/60 text-violet-200 border border-violet-700 font-mono flex-shrink-0">Story Flow</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "주인공이 어떤 길을 선택했느냐에 따라 전설의 영웅이 될 수도, 보물섬 선장이 될 수도 있는 여러 가지 결말!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 사용자의 선택과 누적된 상호작용 결과에 따라 서로 다른 이야기 결말(승리, 패배, 히든 엔딩 등)로 도달하게 설계된 비선형 스토리텔링(Non-linear Storytelling) 구조입니다.
                </p>
              </div>

              {/* 용어 6: 플레이테스트 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <PlayCircle className="w-4 h-4 text-teal-400" />
                      6. 플레이테스트
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block pl-5.5">외래어·영문: 플레이테스트 (Playtesting)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">QA Audit</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "내가 만든 미로 게임을 친구들에게 먼저 해보게 해서 막다른 길이나 고장 난 함정을 찾아내는 시범 게임!"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 게임이나 인터랙티브 소프트웨어를 실제 플레이어에게 직접 시연하게 하여 선택지의 균형(밸런스), 논리적 결함(버그), 사용자 경험(UX)을 사전 검증하는 소프트웨어 테스팅 과정입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}

        </section>

        {/* =====================================================================
            우측 40% 고정형 인터랙티브 콘솔 (Sticky Console)
        ===================================================================== */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar" aria-label="실시간 인터랙티브 실습 콘솔">
          {/* 콘솔 상단 탭 스위처 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setActiveRightTab('simulator')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">분기 시뮬레이터</span>
            </button>

            <button
              onClick={() => setActiveRightTab('tree_card')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'tree_card'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">카드 빌더</span>
            </button>

            <button
              onClick={() => setActiveRightTab('checklist')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">체크리스트 ({checklistProgress}%)</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------
              RIGHT TAB 1: 분기 시뮬레이터 (Interactive Story Simulator Engine)
          ------------------------------------------------------------------ */}
          {activeRightTab === 'simulator' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    인터랙티브 스토리 시뮬레이터
                  </h3>
                </div>
                {/* 되돌리기 버튼 */}
                <button
                  onClick={handleUndo}
                  disabled={historyStack.length === 0}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                  title="이전 갈림길로 되돌아가기"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>되돌아가기</span>
                </button>
              </div>

              {/* 세계관 테마 셀렉터 */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => handleResetSimulator('fantasy')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    selectedTheme === 'fantasy'
                      ? 'bg-white text-indigo-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  판타지 유적
                </button>
                <button
                  onClick={() => handleResetSimulator('cyberpunk')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    selectedTheme === 'cyberpunk'
                      ? 'bg-white text-indigo-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  사이버펑크
                </button>
                <button
                  onClick={() => handleResetSimulator('space')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    selectedTheme === 'space'
                      ? 'bg-white text-indigo-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  우주 탐사
                </button>
              </div>

              {/* 진행 깊이 상태 바 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>현재 단계: Depth {currentNode.depth} / 3</span>
                  <span className="text-indigo-600 font-bold">
                    {currentNode.isEnding ? '결말 도달!' : currentNode.title}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${(currentNode.depth / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* 스토리 씬 디스플레이 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 min-h-[160px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-indigo-700">
                      {currentNode.title}
                    </span>
                    {currentNode.isEnding && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold">
                        Ending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {currentNode.scene}
                  </p>
                </div>

                {/* 엔딩 카드 렌더링 */}
                {currentNode.isEnding ? (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5 bg-emerald-50/70 -mx-4 -mb-4 p-4 rounded-b-xl border-t border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs">{currentNode.endingTitle}</span>
                    </div>
                    <div className="text-xs text-slate-700 flex items-center justify-between">
                      <span className="text-indigo-700 font-semibold">
                        {currentNode.endingReward}
                      </span>
                      <button
                        onClick={() => handleResetSimulator()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>다시 플레이</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 선택지 버튼 2종 */
                  <div className="space-y-2 pt-2">
                    {currentNode.choiceA && (
                      <button
                        onClick={() => handleMakeChoice(currentNode.choiceA!.nextNodeId)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group flex items-start gap-2 shadow-sm"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px] shrink-0 mt-0.5">
                          A
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-800 group-hover:text-indigo-900 font-semibold leading-snug">
                            {currentNode.choiceA.text}
                          </p>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                            {currentNode.choiceA.badge}
                          </span>
                        </div>
                      </button>
                    )}

                    {currentNode.choiceB && (
                      <button
                        onClick={() => handleMakeChoice(currentNode.choiceB!.nextNodeId)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-violet-400 hover:bg-violet-50/40 text-left transition-all group flex items-start gap-2 shadow-sm"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-bold text-[10px] shrink-0 mt-0.5">
                          B
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-800 group-hover:text-violet-900 font-semibold leading-snug">
                            {currentNode.choiceB.text}
                          </p>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                            {currentNode.choiceB.badge}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>선택을 바꿀 때마다 상태가 실시간으로 재계산됩니다.</span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              RIGHT TAB 2: 분기 트리 카드 빌더 (Decision Tree Card Builder)
          ------------------------------------------------------------------ */}
          {activeRightTab === 'tree_card' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    분기 트리 기획 카드 빌더
                  </h3>
                </div>
                <button
                  onClick={() => {
                    const cardText = `[${treeCard.gameTitle}]\n주인공: ${treeCard.protagonist}\n시작 상황: ${treeCard.premise}\n선택지 A: ${treeCard.choiceA}\n선택지 B: ${treeCard.choiceB}\n결말: ${treeCard.endingA} / ${treeCard.endingB}`;
                    handleCopy(cardText, 'card');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  {copiedKey === 'card' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>카드 복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* 입력 폼 */}
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-semibold mb-1">게임 제목</label>
                    <input
                      type="text"
                      value={treeCard.gameTitle}
                      onChange={(e) => setTreeCard({ ...treeCard, gameTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] font-semibold mb-1">주인공 및 특성</label>
                    <input
                      type="text"
                      value={treeCard.protagonist}
                      onChange={(e) => setTreeCard({ ...treeCard, protagonist: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-semibold mb-1">도입부 상황 (시작 노드)</label>
                  <input
                    type="text"
                    value={treeCard.premise}
                    onChange={(e) => setTreeCard({ ...treeCard, premise: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-indigo-700 text-[11px] font-semibold mb-1">선택지 A (딜레마 1)</label>
                    <input
                      type="text"
                      value={treeCard.choiceA}
                      onChange={(e) => setTreeCard({ ...treeCard, choiceA: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-violet-700 text-[11px] font-semibold mb-1">선택지 B (딜레마 2)</label>
                    <input
                      type="text"
                      value={treeCard.choiceB}
                      onChange={(e) => setTreeCard({ ...treeCard, choiceB: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 실시간 렌더링 카드 뷰어 */}
              <div className="bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-200 rounded-xl p-4 space-y-2.5 relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                    STORY SPEC CARD
                  </span>
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{treeCard.gameTitle || '제목 미입력'}</h4>
                <p className="text-[11px] text-slate-600">
                  <strong className="text-indigo-700">주인공:</strong> {treeCard.protagonist || '미정'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                  <div>
                    <span className="text-indigo-700 font-bold">A:</span> {treeCard.choiceA}
                  </div>
                  <div>
                    <span className="text-violet-700 font-bold">B:</span> {treeCard.choiceB}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              RIGHT TAB 3: 자가 점검 체크리스트 & 4강 언락 게이트
          ------------------------------------------------------------------ */}
          {activeRightTab === 'checklist' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    3강 자가 점검 체크리스트
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-600">
                  {checklistProgress}% 완주
                </span>
              </div>

              {/* 진행률 게이지 바 */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>

              {/* 6대 체크리스트 항목 */}
              <div className="space-y-2.5 text-xs">
                {[
                  '스토리를 3단계(시작-갈림길-엔딩)로 작업 분해했는가?',
                  '선택지마다 명확한 딜레마와 대가 차이가 존재하는가?',
                  '결과가 똑같이 끝나는 가짜 선택지를 배제했는가?',
                  '최소 4가지 서로 다른 멀티 엔딩을 구성했는가?',
                  '돌연사 배드엔딩에 합당한 복선과 힌트를 부여했는가?',
                  '짝꿍이나 AI와 시뮬레이션 플레이테스트를 완료했는가?'
                ].map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleChecklist(idx)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      checklist[idx]
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[idx]}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-0 shrink-0"
                    />
                    <span className="text-xs leading-snug select-none">{item}</span>
                  </label>
                ))}
              </div>

              {/* 4강 언락 게이트 카드 */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isGateUnlocked
                    ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300 shadow-sm animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isGateUnlocked ? (
                    <Unlock className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <h4
                    className={`text-xs font-bold ${
                      isGateUnlocked ? 'text-emerald-800' : 'text-slate-600'
                    }`}
                  >
                    {isGateUnlocked ? '3강 완주 축하! 4강 게이트 잠금 해제' : '4강 잠금 해제 조건'}
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed mb-3 text-slate-600">
                  {isGateUnlocked
                    ? '완벽한 분기 트리 설계 역량을 입증하셨습니다! 이제 AI 게임 테스터와 함께 버그를 잡는 4강으로 진입할 수 있습니다.'
                    : '위의 6가지 자가 점검 체크리스트를 100% 완료하면 4강 게이트가 열립니다.'}
                </p>

                {isGateUnlocked && (
                  <a
                    href="/materials/ai/lessons/04-balance-patch/"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>4강 밸런스 패치로 진입하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Lesson03;
