import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  ShieldAlert,
  GitFork,
  Compass,
  Layers,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Terminal,
  RotateCcw,
  Award,
  CheckCircle2,
  Lock,
  Search,
  Flame,
  Copy,
  Check,
  GitCommit
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 3강 전용 데이터 구조 및 타입 정의
 * ------------------------------------------------------------------------------
 */
type StageType = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';
type StoryTheme = 'fantasy' | 'cyberpunk' | 'space';

interface StoryNode {
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
  endingTitle?: string;
  endingReward?: string;
}

const STORY_GRAPH: Record<StoryTheme, Record<string, StoryNode>> = {
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
      scene: '동굴 천장에 빛나는 이끼가 흔들립니다. 길 끝에서 잠든 동굴 골렘을 발견했습니다. 발밑에는 골렘을 우회할 수 있는 좁은 암석 균열과, 골렘 목에 걸린 황금 열쇠가 보입니다.',
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
      endingTitle: '평화로운 생환 엔딩',
      endingReward: '칭호: 그림자 걸음의 기록관'
    },
    ending_cave_treasure: {
      id: 'ending_cave_treasure',
      depth: 3,
      title: '엔딩 2: 용맹한 도전자',
      scene: '손에 땀을 쥐는 순간, 열쇠를 낚아채자 골렘이 눈을 떴지만 당신의 기민한 민첩성으로 보물창고 문을 따고 탈출했습니다! 전설의 보물 세트를 모두 획득했습니다.',
      isEnding: true,
      endingTitle: '황금 보물 쟁취 엔딩',
      endingReward: '칭호: 전설의 유적 도굴왕'
    },
    ending_temple_wisdom: {
      id: 'ending_temple_wisdom',
      depth: 3,
      title: '엔딩 3: 고대의 현자',
      scene: '수호령은 당신의 명쾌한 논리에 감탄하며 미소를 지었습니다. 그는 신전의 비전 마법을 당신에게 전수하고 유적의 공식 수호자로 임명합니다.',
      isEnding: true,
      endingTitle: '진리의 계승자 엔딩',
      endingReward: '칭호: 신전의 영원한 대현자'
    },
    ending_temple_sincerity: {
      id: 'ending_temple_sincerity',
      depth: 3,
      title: '엔딩 4: 새로운 동맹',
      scene: '당신의 순수한 영혼에 감동한 수호령은 자신의 봉인을 풀고 든든한 영혼 동료가 되어 여정에 동행하기로 결심했습니다. 새로운 모험의 문이 열립니다.',
      isEnding: true,
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
      endingTitle: '도시 탈출 엔딩',
      endingReward: '칭호: 자유를 찾은 망명자'
    },
    ending_cyber_blackout: {
      id: 'ending_cyber_blackout',
      depth: 3,
      title: '엔딩 2: 블랙아웃 영웅',
      scene: '도시 전체의 전력이 차단되며 적 드론들이 일제히 추락했습니다! 당신은 혼란을 틈타 무사히 탈출했고 암흑 속 영웅으로 소문납니다.',
      isEnding: true,
      endingTitle: '심야 정전 엔딩',
      endingReward: '칭호: 네온 시티의 정전 유령'
    },
    ending_cyber_revolution: {
      id: 'ending_cyber_revolution',
      depth: 3,
      title: '엔딩 3: 혁명의 기폭제',
      scene: '수억 명의 시민들이 기업의 추악한 음모를 생생히 목격했습니다. 시민 봉기가 시작되었고, 당신은 사이버 혁명의 상징이 되었습니다.',
      isEnding: true,
      endingTitle: '민중 혁명 엔딩',
      endingReward: '칭호: 디지털 레지스탕스 리더'
    },
    ending_cyber_syndicate: {
      id: 'ending_cyber_syndicate',
      depth: 3,
      title: '엔딩 4: 암흑가의 실력자',
      scene: '막대한 크레딧과 최신 군용 사이버웨어로 무장한 당신. 이제 거대 기업도 당신을 함부로 건드릴 수 없는 어둠의 큰손이 되었습니다.',
      isEnding: true,
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
      endingTitle: '새로운 고향 엔딩',
      endingReward: '칭호: 행성 제1호 개척자'
    },
    ending_space_home: {
      id: 'ending_space_home',
      depth: 3,
      title: '엔딩 2: 지구로의 무사 귀환',
      scene: '기적적으로 수리된 탐사선 엔진이 점화되었습니다. 외계 생명체의 귀중한 샘플을 싣고 고향 지구로 금의환향합니다.',
      isEnding: true,
      endingTitle: '영광의 귀환 엔딩',
      endingReward: '칭호: 기적의 솔로 파일럿'
    },
    ending_space_rescue: {
      id: 'ending_space_rescue',
      depth: 3,
      title: '엔딩 3: 은하계 연합의 조우',
      scene: '신호를 수신한 다종족 은하 연합의 거대 모선이 착륙했습니다. 인류는 드디어 우주 연맹의 정식 일원으로 환영받게 됩니다.',
      isEnding: true,
      endingTitle: '퍼스트 콘택트 엔딩',
      endingReward: '칭호: 지구 전권 외교 대사'
    },
    ending_space_warp: {
      id: 'ending_space_warp',
      depth: 3,
      title: '엔딩 4: 미지의 우주 개척자',
      scene: '시공간이 왜곡되며 완전히 새로운 미지의 은하계 중심으로 도약했습니다. 당신의 눈앞에 수천 개의 새로운 성계가 펼쳐집니다.',
      isEnding: true,
      endingTitle: '차원 도약 엔딩',
      endingReward: '칭호: 시공간을 초월한 방랑자'
    }
  }
};

interface KillerQuest {
  id: number;
  emoji: string;
  title: string;
  secret: string;
  prompt: string;
  naiveReaction: string;
  gacoReaction: string;
}

const KILLER_QUESTS: KillerQuest[] = [
  {
    id: 1,
    emoji: '🏰',
    title: '1. 비밀의 고서점과 세 개의 황금 문',
    secret: '비결: 매력적인 이득과 치명적인 리스크 부여',
    prompt: `[Goal]:
플레이어의 선택에 따라 3가지 운명이 펼쳐지는 인터랙티브 모험 게임을 만들어줘.

[Actor]:
20년 경력의 게임북(Gamebook) 전문 수석 시나리오 디자이너

[Condition]:
- 주인공은 숲속 버려진 고서점에서 '비밀의 3대 문'을 발견했어.
- 1번 문(지혜의 서재): 마법 지식을 얻지만 기억의 일부를 잃음
- 2번 문(황금의 금고): 보물을 얻지만 무거운 저주가 붙음
- 3번 문(시간의 회랑): 과거로 갈 수 있지만 다시 못 돌아올 위험

[Output Format]:
1. 도입부 상황 묘사 (몰입감 넘치는 3줄)
2. 플레이어가 선택할 수 있는 1, 2, 3번 선택지 카드
3. 각 선택지별 예상 결말 3줄 요약`,
    aiMagic:
      '각 문마다 완전히 다른 세계관의 결말이 펼쳐지며, 플레이어의 손에 땀을 쥐게 하는 선택의 기로를 만들어냅니다!',
    magicReason:
      '모든 선택지에 확실한 보상(Gain)과 치명적인 대가(Cost)를 동시에 설계하여 뻔한 답이 없는 딜레마를 구축했기 때문입니다.'
  },
  {
    id: 2,
    emoji: '🤖',
    title: '2. 로봇의 눈물 vs 도시의 법률 - SF 법정',
    secret: '비결: 흑백논리를 초월한 깊이 있는 윤리적 양자택일',
    prompt: `[Goal]:
인간의 감정을 배우기 시작한 AI 로봇 '알파'의 처분을 다루는 법정 SF 인터랙티브 스토리를 작성해줘.

[Actor]:
'디트로이트 비컴 휴먼' 스타일의 SF 서사 전문 작가

[Condition]:
- 나는 도시의 최고 판사야.
- 선택지 A: 규정에 따라 알파의 메모리를 즉각 포맷한다 (도시의 안전 확보 vs 로봇의 눈물)
- 선택지 B: 알파를 최초의 인공지능 시민으로 인정한다 (새로운 자유 vs 시민들의 대혼란)
- 두 선택지 모두 납득할 수밖에 없는 명확한 찬반 근거를 제시할 것.

[Output Format]:
- 재판정 상황 브리핑
- 판사의 양자택일 선택지 카드
- 각 선택에 따른 극적인 후폭풍 엔딩 2가지`,
    aiMagic:
      '단순한 권선징악이 아니라, 철학적 고뇌가 담긴 두 갈래의 명작 SF 결말이 펼쳐집니다.',
    magicReason:
      '어느 한쪽이 절대적으로 옳지 않은 "동등한 무게감의 도덕적 갈등"을 조건에 부여하여 AI가 깊은 서사를 직조하게 만들었습니다.'
  },
  {
    id: 3,
    emoji: '🔍',
    title: '3. 오리엔트 특급 열차와 가짜 단서의 함정',
    secret: '비결: 엉뚱한 결말로 이끄는 가짜 단서(Red Herring)',
    prompt: `[Goal]:
폭설로 멈춰선 심야 열차 안에서 보석 도난 사건의 범인을 추리하는 텍스트 어드벤처를 설계해줘.

[Actor]:
아가사 크리스티 풍의 고전 클래식 추리 소설가

[Condition]:
- 용의자는 귀족 부인, 수상한 차장, 소심한 의사 3명이야.
- 반드시 1개의 '가짜 단서(Red Herring)'를 심어서 성급한 플레이어를 함정에 빠뜨려줘.
- 증거를 조합해야만 진짜 범인을 지목할 수 있도록 설계해.

[Output Format]:
1. 사건 개요 및 피해 현장 묘사
2. 조사할 수 있는 3가지 단서 선택지
3. 범인 지목 시 성공 엔딩 vs 오인 체포 실패 엔딩`,
    aiMagic:
      '플레이어가 가짜 단서에 낚여 엉뚱한 사람을 체포했을 때 진범이 유유히 탈출하는 소름 돋는 반전 배드 엔딩이 연출됩니다!',
    magicReason:
      '추리물에서 가장 중요한 "가짜 단서" 조건을 걸어 단순 일자형 조사가 아닌 두뇌 플레이 분기를 강제했기 때문입니다.'
  },
  {
    id: 4,
    emoji: '🧪',
    title: '4. 달콤살벌 엉뚱 마법 포션 상점',
    secret: '비결: 재료 조합에 따른 코믹 다중 분기',
    prompt: `[Goal]:
괴짜 마법사가 되어 손님들에게 엉뚱한 마법 포션을 제조해 파는 코미디 인터랙티브 스토리를 만들어줘.

[Actor]:
유쾌하고 산만한 연금술 아카데미 낙제생 출신 마법사

[Condition]:
- 기본 재료: [드래곤 콧물, 반짝이 버섯, 시간의 모래, 무지개 깃털] 중 2가지를 섞어야 해.
- 조합 1: 폭발하지만 하늘을 나는 포션
- 조합 2: 몸이 투명해지지만 딸꾹질 소리가 천둥처럼 커지는 포션
- 조합 3: 전설의 불로불사약이지만 맛이 썩은 양말 맛

[Output Format]:
- 마법 포션 가게 오프닝 멘트
- 재료 조합 선택 테이블
- 손님의 포복절도 시음 후기 엔딩 3가지`,
    aiMagic:
      '어떤 재료를 넣느냐에 따라 손님이 지붕을 뚫고 날아가거나 천둥 딸꾹질을 하는 등 엉뚱하고 유쾌한 시트콤 에피소드가 완성됩니다.',
    magicReason:
      '조합형 조건(재료 A + B = 결과 C)을 테이블 형태로 지정하여 AI가 예측 불가능한 코미디 분기를 정교하게 생성합니다.'
  },
  {
    id: 5,
    emoji: '⏳',
    title: '5. 째깍째깍 타임머신과 나비효과 분기',
    secret: '비결: 사소한 선택 하나가 거대한 세계를 뒤흔드는 평행우주 설계',
    prompt: `[Goal]:
과거로 돌아가 역사 속 사소한 사건 하나를 바꿨을 때 일어나는 인터랙티브 나비효과 게임을 설계해줘.

[Actor]:
시간 여행과 양자역학 SF를 다루는 전문 시나리오 작가

[Condition]:
- 주인공은 주머니 속 10분짜리 휴대용 타임머신을 가지고 있어.
- 과거의 갈림길: 중요한 시험 날 아침 늦잠을 잔 친구를 깨운다 vs 그냥 둔다.
- 깨웠을 때의 미래: 그 친구가 미래에 세상을 구하는 위대한 천재 과학자가 됨.
- 그냥 두었을 때의 미래: 그 친구가 우연히 산 복권에 당첨되어 세계 최고의 게임 회사를 세움.
- 두 갈래 모두 절대적인 배드 엔딩이 아닌, 기상천외하고 흥미진진한 평행우주 결말로 전개할 것.

[Output Format]:
[과거의 갈림길 선택 ➔ 10년 뒤 펼쳐진 평행우주 A vs B 결말 리포트]`,
    aiMagic:
      '"지각한 친구 깨우기"라는 평범한 아침의 작은 선택이 10년 뒤 천재 과학자의 연구소 vs 초호화 게임 회사 본사라는 극과 극의 미래로 펼쳐집니다!',
    magicReason:
      '양자택일의 결과를 "극단적인 실패"가 아니라 "각자 독특한 매력을 가진 평행우주"로 설계하여 플레이어가 두 결말 모두 확인하고 싶게 만들었습니다.'
  }
];

export const Lesson03: React.FC = () => {
  // 현재 활성화된 스테이지 상태
  const [currentStage, setCurrentStage] = useState<StageType>('stage1');

  // 체크리스트 상태 (6문항)
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false, false]);

  // 스토리 시뮬레이터 상태
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>('fantasy');
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [pathHistory, setPathHistory] = useState<string[]>(['start']);

  // Stage 3 프롬프트 복사 상태 맵
  const [copiedMap, setCopiedMap] = useState<Record<number, boolean>>({});

  // 로컬 스토리지 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('ai_lesson_03_checklist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const next = [1, 2, 3, 4, 5, 6].map((i) => Boolean(parsed[i]));
        setChecklist(next);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 스테이지 전환 핸들러
  const switchStage = (stageId: StageType) => {
    setCurrentStage(stageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 테마 선택 핸들러
  const handleSelectTheme = (themeKey: StoryTheme) => {
    setSelectedTheme(themeKey);
    setCurrentNodeId('start');
    setPathHistory(['start']);
  };

  // 선택지 선택 핸들러
  const handleMakeChoice = (choiceKey: 'A' | 'B') => {
    const graph = STORY_GRAPH[selectedTheme];
    const node = graph[currentNodeId];
    if (!node) return;

    const choice = choiceKey === 'A' ? node.choiceA : node.choiceB;
    if (choice && choice.nextNodeId) {
      const nextId = choice.nextNodeId;
      setCurrentNodeId(nextId);
      setPathHistory((prev) => [...prev, nextId]);

      // 만약 엔딩 노드라면 체크리스트 3번 자동 완료
      const nextNode = graph[nextId];
      if (nextNode && nextNode.isEnding) {
        setChecklist((prevChecks) => {
          const nextChecks = [...prevChecks];
          nextChecks[2] = true;
          const stateObj: Record<number, boolean> = {};
          nextChecks.forEach((val, idx) => {
            stateObj[idx + 1] = val;
          });
          localStorage.setItem('ai_lesson_03_checklist', JSON.stringify(stateObj));
          if (nextChecks.every(Boolean)) {
            localStorage.setItem('ai_lesson_03_completed', 'true');
          }
          return nextChecks;
        });
      }
    }
  };

  // 스토리 초기화 핸들러
  const handleResetStory = () => {
    setCurrentNodeId('start');
    setPathHistory(['start']);
  };

  // Stage 3 프롬프트 복사
  const handleCopyPrompt = (questId: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMap((prev) => ({ ...prev, [questId]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [questId]: false }));
      }, 1800);
    });
  };

  // 체크박스 수동 토글
  const handleCheck = (index: number) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);

    const allChecked = next.every(Boolean);
    const stateObj: Record<number, boolean> = {};
    next.forEach((val, idx) => {
      stateObj[idx + 1] = val;
    });

    localStorage.setItem('ai_lesson_03_checklist', JSON.stringify(stateObj));
    if (allChecked) {
      localStorage.setItem('ai_lesson_03_completed', 'true');
    } else {
      localStorage.removeItem('ai_lesson_03_completed');
    }
  };

  const completedChecks = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedChecks / checklist.length) * 100);
  const isUnlocked = completedChecks === checklist.length;

  const currentGraph = STORY_GRAPH[selectedTheme];
  const currentNode = currentGraph[currentNodeId];

  return (
    <div className="bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 min-h-screen flex flex-col">
      {/* 웹 접근성 본문 바로가기 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg"
      >
        본문 바로가기
      </a>

      {/* ======================================================================= */}
      {/* [상단 고정 GNB 헤더: 화면 왼쪽 끝부터 오른쪽 끝까지 100% Full-Width 사용]    */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [왼쪽 끝]: 브랜드 로고 & 강의 제목 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="/materials/ai/index.html"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 hover:opacity-90 transition-opacity"
              aria-label="교육과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/materials/ai/index.html"
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline"
              >
                AI·코딩 24강
              </a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                3강: 갈림길의 모험 (스토리 분기와 선택지)
              </span>
            </div>
          </div>

          {/* [오른쪽]: 4단계 스테이지 스위처 버튼 그룹 (오른쪽 정렬) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200" role="tablist" aria-label="3강 4단계 스테이지">
            <button
              type="button"
              onClick={() => switchStage('stage1')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage1'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage1'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStage === 'stage1' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </span>
              <span>미션 & 원리</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('stage2')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage2'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage2'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStage === 'stage2' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </span>
              <span>스토리 분기 실습</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('stage3')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage3'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage3'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStage === 'stage3' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                3
              </span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('stage4')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentStage === 'stage4'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              role="tab"
              aria-selected={currentStage === 'stage4'}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStage === 'stage4' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                4
              </span>
              <span>자가 점검</span>
            </button>

            <button
              type="button"
              onClick={() => switchStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                currentStage === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              role="tab"
              aria-selected={currentStage === 'all'}
            >
              <span>전체 보기</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* [모바일 전용 스테이지 탭 스위처]                                        */}
      {/* ======================================================================= */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-around gap-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => switchStage('stage1')}
          className={`flex-1 py-1.5 rounded-lg text-center ${
            currentStage === 'stage1' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          1. 원리
        </button>
        <button
          type="button"
          onClick={() => switchStage('stage2')}
          className={`flex-1 py-1.5 rounded-lg text-center ${
            currentStage === 'stage2' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          2. 분기
        </button>
        <button
          type="button"
          onClick={() => switchStage('stage3')}
          className={`flex-1 py-1.5 rounded-lg text-center ${
            currentStage === 'stage3' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          3. 퀘스트
        </button>
        <button
          type="button"
          onClick={() => switchStage('stage4')}
          className={`flex-1 py-1.5 rounded-lg text-center ${
            currentStage === 'stage4' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
          }`}
        >
          4. 점검
        </button>
        <button
          type="button"
          onClick={() => switchStage('all')}
          className={`py-1.5 px-2 rounded-lg text-center ${
            currentStage === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          전체
        </button>
      </div>

      {/* ======================================================================= */}
      {/* [메인 워크스페이스: 단일 컨테이너 흐름 (max-w-4xl)]                    */}
      {/* ======================================================================= */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ===================================================================== */}
        {/* [STAGE 01] 퀘스트 미션 브리핑 & 조건 분기(if-else) 원리 (통합형)       */}
        {/* ===================================================================== */}
        {(currentStage === 'stage1' || currentStage === 'all') && (
          <section id="stage-content-1" className="space-y-6" aria-labelledby="stage-1-title">
            
            {/* 1. 미션 브리핑 히어로 카드 */}
            <article className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden border border-indigo-500/30 shadow-xl">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-semibold">
                  <ShieldAlert className="w-4 h-4 text-cyan-300" />
                  <span>STAGE 01 · 퀘스트 미션 브리핑</span>
                </div>

                <h2 id="stage-1-title" className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  플레이어의 선택으로 운명이 갈린다! 조건 분기(if-else)와 트리 구조 마스터
                </h2>

                <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
                  "플레이어의 선택 한 번으로 전설의 영웅이 될 수도, 깊은 미궁에 갇힐 수도 있습니다!" <br />
                  소프트웨어와 게임 개발의 가장 위대한 기초인 <strong>조건 분기(if-else)</strong>와 <strong>작업 분해(Decomposition)</strong> 원리를 배우고, 
                  AI와 함께 4가지 서로 다른 결말을 가진 생생한 인터랙티브 스토리 게임을 설계해 보세요.
                </p>

                {/* 오늘의 3대 도전 목표 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                      <GitFork className="w-4 h-4" />
                      <span>목표 1. 분기 논리 마스터</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">컴퓨터가 조건(if-else)에 따라 서로 다른 길을 선택하는 원리를 이해합니다.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                      <Compass className="w-4 h-4" />
                      <span>목표 2. 가상 분기 시뮬레이터</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">인페이지 시뮬레이터에서 3대 세계관의 멀티 엔딩 트리를 직접 탐험합니다.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>목표 3. 실제 AI 분기 퀘스트</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">ChatGPT·Gemini에 마법 주문을 넣어 4대 킬러 분기 게임북을 직접 제작합니다.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 조건 분기와 작업 분해 4대 핵심 원리 카드 */}
            <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-indigo-600">
                <Layers className="w-4 h-4" />
                <span className="text-sm font-extrabold uppercase tracking-wider">인터랙티브 스토리를 지탱하는 4대 기둥</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  작업 분해와 조건 분기: 복잡한 세상을 논리적으로 쪼개는 비결
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  수백 가지 사건이 얽힌 거대한 RPG 게임도 사실은 아래 4가지 논리적 블록이 나뭇가지처럼 연결되어 작동합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 카드 1: 작업 분해 */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">1</div>
                  <h4 className="text-base font-bold text-slate-900">작업 분해</h4>
                  <span className="text-sm font-mono text-indigo-600 font-semibold block">Decomposition</span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    거대한 스토리를 도입 ➔ 1차 갈림길 ➔ 2차 갈림길 ➔ 엔딩의 작은 조각 단위로 쪼개어 설계합니다.
                  </p>
                </div>

                {/* 카드 2: 조건 분기 */}
                <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">2</div>
                  <h4 className="text-base font-bold text-slate-900">조건 분기 (if-else)</h4>
                  <span className="text-sm font-mono text-cyan-700 font-semibold block">Branching Logic</span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    "만약 A를 고르면 동굴로, B를 고르면 신전으로!" 조건에 따라 서로 다른 결과를 실행하는 논리입니다.
                  </p>
                </div>

                {/* 카드 3: 의미 있는 선택 */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">3</div>
                  <h4 className="text-base font-bold text-slate-900">의미 있는 선택</h4>
                  <span className="text-sm font-mono text-amber-700 font-semibold block">Meaningful Choice</span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    단순한 O/X 퀴즈가 아니라 안전과 보물, 명예와 생존 사이에서 고민하게 만드는 가치관의 딜레마입니다.
                  </p>
                </div>

                {/* 카드 4: 트리 구조 */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">4</div>
                  <h4 className="text-base font-bold text-slate-900">트리 구조</h4>
                  <span className="text-sm font-mono text-emerald-700 font-semibold block">Tree Structure</span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    시작 노드에서 갈림길을 거쳐 4가지 이상의 다양한 멀티 엔딩에 도달하는 나뭇가지형 자료구조입니다.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-base font-bold text-indigo-950">주니어 개발자의 스토리 제1원칙</h4>
                  <p className="text-sm text-indigo-900 leading-relaxed mt-0.5">
                    "선택지에 따른 결과의 개연성(Causality)이 무너지면 플레이어는 몰입을 멈춘다. <strong>모든 선택에는 그에 걸맞은 논리적 이유와 대가가 따라야 한다!</strong>"
                  </p>
                </div>
              </div>
            </article>

            {/* [다음 단계 넘어가기 버튼] */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage2')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>다음: Stage 2 가상 스토리 분기 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* [STAGE 02] 🎮 가상 인터랙티브 실습 콘솔: 스토리 분기 시뮬레이터        */}
        {/* ===================================================================== */}
        {(currentStage === 'stage2' || currentStage === 'all') && (
          <section id="stage-content-2" className="space-y-6" aria-labelledby="stage-2-title">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-extrabold uppercase tracking-wider">STAGE 02 · 가상 스토리 분기 시뮬레이터</span>
              </div>
              <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                IN-PAGE SIMULATOR
              </span>
            </div>

            <article className="bg-white rounded-2xl border-2 border-indigo-300 p-6 sm:p-7 shadow-md space-y-6">
              <div>
                <h3 id="stage-2-title" className="text-base sm:text-lg font-bold text-slate-900">
                  선택에 따라 결말이 바뀌는 인터랙티브 분기 엔진
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">
                  원하는 세계관 테마를 선택하고, 주인공의 입장이 되어 선택지를 클릭해 보세요! 단계별 선택에 따라 스토리 트리를 거쳐 <strong>4가지 고유 멀티 엔딩</strong> 중 하나에 도달합니다.
                </p>
              </div>

              {/* 1. 테마 선택 칩 */}
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-700 block">세계관 테마 선택</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('fantasy')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      selectedTheme === 'fantasy'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🏰 고대 유적의 갈림길 (판타지)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('cyberpunk')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      selectedTheme === 'cyberpunk'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🚀 네온 골목의 추적자 (사이버펑크)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('space')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      selectedTheme === 'space'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🌌 미지의 외계 행성 (SF 우주)
                  </button>
                </div>
              </div>

              {/* 2. 진행 경로 브레드크럼 (Breadcrumb) */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-sm overflow-x-auto">
                <span className="font-bold text-slate-500 flex items-center gap-1 shrink-0">
                  <GitCommit className="w-4 h-4 text-indigo-600" />
                  <span>진행 경로:</span>
                </span>
                <div className="flex items-center gap-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                  {pathHistory.map((id, idx) => {
                    const itemNode = currentGraph[id];
                    const isCurrent = id === currentNodeId;
                    const name = itemNode ? itemNode.title : id;
                    return (
                      <React.Fragment key={id}>
                        {idx > 0 && <span className="text-slate-300">➔</span>}
                        <span className={isCurrent ? 'text-indigo-600 font-extrabold underline' : 'text-slate-500'}>
                          {idx + 1}. {name}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* 3. 현재 장면 (Scene) 카드 */}
              {currentNode && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-inner space-y-4 border border-indigo-900">
                  <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-sm font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        {currentNode.depth === 1 ? '1단계: 도입' : (currentNode.depth === 2 ? '2단계: 갈림길' : '3단계: 최종 엔딩')}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {currentNode.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetStory}
                      className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>처음부터</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {currentNode.scene}
                  </p>

                  {/* 선택지 버튼 그룹 (진행 중일 때 표시) */}
                  {!currentNode.isEnding && (
                    <div className="space-y-3 pt-2">
                      {currentNode.choiceA && (
                        <button
                          type="button"
                          onClick={() => handleMakeChoice('A')}
                          className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-start justify-between gap-3 cursor-pointer group"
                        >
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                              선택지 A · {currentNode.choiceA.badge}
                            </span>
                            <p className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                              {currentNode.choiceA.text}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all mt-2" />
                        </button>
                      )}

                      {currentNode.choiceB && (
                        <button
                          type="button"
                          onClick={() => handleMakeChoice('B')}
                          className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-start justify-between gap-3 cursor-pointer group"
                        >
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                              선택지 B · {currentNode.choiceB.badge}
                            </span>
                            <p className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                              {currentNode.choiceB.text}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all mt-2" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* 최종 엔딩 도달 시 표시되는 카드 */}
                  {currentNode.isEnding && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                          <Award className="w-5 h-5 text-emerald-400" />
                          <span>최종 결말: {currentNode.endingTitle}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                          <span className="text-slate-400 font-mono text-sm block">획득 칭호 & 보상:</span>
                          <span className="text-base font-bold text-amber-300 block mt-0.5">{currentNode.endingReward}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetStory}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>다른 선택지로 새로운 결말 탐험하기</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>

            {/* [이전 / 다음 단계 넘어가기 버튼] */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage1')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 1 미션 & 원리</span>
              </button>
              <button
                type="button"
                onClick={() => switchStage('stage3')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>다음: Stage 3 실전 AI 퀘스트</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* [STAGE 03] 🚀 실전! 최신 AI(ChatGPT·Gemini) 4대 킬러 분기 퀘스트        */}
        {/* ===================================================================== */}
        {(currentStage === 'stage3' || currentStage === 'all') && (
          <section id="stage-content-3" className="space-y-6" aria-labelledby="stage-3-title">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-extrabold uppercase tracking-wider">STAGE 03 · 실전 최신 AI 5대 킬러 분기 퀘스트</span>
              </div>
              <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                REAL AI TEST
              </span>
            </div>

            {/* 안내 헤더 카드 */}
            <article className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md space-y-3 border border-indigo-900/60">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>"실제 ChatGPT나 Gemini를 띄우고 진짜 마법을 시험해 보세요!"</span>
              </div>
              <h3 id="stage-3-title" className="text-base sm:text-lg font-bold text-white">
                조건 분기를 만난 최신 AI의 인터랙티브 게임북 설계실
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-cyan-300 font-semibold hover:text-cyan-200"
                >
                  ChatGPT
                </a>{' '}
                또는{' '}
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-cyan-300 font-semibold hover:text-cyan-200"
                >
                  Gemini
                </a>{' '}
                새 탭을 열어두고, 아래 5개 카드의 <strong>[프롬프트 복사]</strong> 버튼을 눌러 그대로 붙여넣어 보세요! 플레이어의 선택에 따라 전율 돋는 멀티 엔딩이 펼쳐집니다.
              </p>
            </article>

            {/* 4대 킬러 퀘스트 카드 그리드 */}
            <div className="space-y-4">
              {KILLER_QUESTS.map((quest) => (
                <article
                  key={quest.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3.5 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{quest.emoji}</span>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{quest.title}</h4>
                        <span className="text-sm font-mono text-indigo-600 font-semibold">{quest.secret}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(quest.id, quest.prompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all cursor-pointer"
                    >
                      {copiedMap[quest.id] ? (
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

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-sm text-slate-800 leading-relaxed select-all whitespace-pre-wrap">
                    {quest.prompt}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                      <span className="font-bold text-amber-900 block">🤖 대충 물어봤다면?</span>
                      <p className="text-amber-800 leading-relaxed">{quest.naiveReaction}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-1">
                      <span className="font-bold text-indigo-900 block">💡 G-A-C-O를 넣었을 때 반응:</span>
                      <p className="text-indigo-800 leading-relaxed">{quest.gacoReaction}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* [이전 / 다음 단계 넘어가기 버튼] */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => switchStage('stage2')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전: Stage 2 분기 실습</span>
              </button>
              <button
                type="button"
                onClick={() => switchStage('stage4')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>다음: Stage 4 자가 점검 및 용어 돋보기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* [STAGE 04] 전문 용어 돋보기 & 자가 점검 체크리스트                   */}
        {/* ===================================================================== */}
        {(currentStage === 'stage4' || currentStage === 'all') && (
          <section id="stage-content-4" className="space-y-8" aria-labelledby="stage-4-title">

            {/* 1. [🔍 주니어 개발자를 위한 전문 용어 돋보기] */}
            <article className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Search className="w-4 h-4" />
                  <h3 id="stage-4-title" className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 3강에서 탐험한 스토리 갈림길의 실제 공식 컴퓨터 과학 / 소프트웨어 공학 용어를 정리합니다.
                </p>
              </div>

              <div className="space-y-4">
                {/* 용어 1: 조건 분기 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                  <h4 className="text-base font-bold text-white tracking-wide">조건 분기</h4>
                  <span className="text-sm font-mono text-slate-400 block">Conditional Branching (if-else)</span>
                  <div className="pt-2 space-y-1">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🧸 <strong>어린이 비유:</strong> 비가 오면 우산을 쓰고, 해가 뜨면 모자를 쓰는 갈림길 규칙.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🎓 <strong>개발자 정의:</strong> 주어진 조건식의 참(True) 또는 거짓(False) 여부에 따라 프로그램의 제어 흐름을 서로 다른 실행 경로로 전환하는 기본 프로그래밍 제어 구조.
                    </p>
                  </div>
                </div>

                {/* 용어 2: 작업 분해 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                  <h4 className="text-base font-bold text-white tracking-wide">작업 분해</h4>
                  <span className="text-sm font-mono text-slate-400 block">Decomposition</span>
                  <div className="pt-2 space-y-1">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🧸 <strong>어린이 비유:</strong> 거대한 레고 성을 조립할 때 성벽, 탑, 문으로 나누어 차근차근 만들기.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🎓 <strong>개발자 정의:</strong> 복잡하고 큰 규모의 문제를 해결하기 위해 독립적으로 관리 및 구현이 가능한 작은 하위 태스크(Sub-task)들로 쪼개어 접근하는 컴퓨팅 사고력 기법.
                    </p>
                  </div>
                </div>

                {/* 용어 3: 트리 자료구조 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                  <h4 className="text-base font-bold text-white tracking-wide">트리 자료구조</h4>
                  <span className="text-sm font-mono text-slate-400 block">Tree Data Structure</span>
                  <div className="pt-2 space-y-1">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🧸 <strong>어린이 비유:</strong> 하나의 뿌리에서 시작해 여러 갈래 나뭇가지로 뻗어 나가는 모험 지도.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🎓 <strong>개발자 정의:</strong> 루트(Root) 노드에서 시작하여 부모-자식 간선(Edge)으로 연결되는 비선형 계층형 자료구조로, 게임 분기 및 탐색 알고리즘의 핵심 뼈대.
                    </p>
                  </div>
                </div>

                {/* 용어 4: 인터랙티브 픽션 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
                  <h4 className="text-base font-bold text-white tracking-wide">인터랙티브 픽션</h4>
                  <span className="text-sm font-mono text-slate-400 block">Interactive Fiction / Gamebook</span>
                  <div className="pt-2 space-y-1">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🧸 <strong>어린이 비유:</strong> 내가 주인공이 되어 선택에 따라 결말을 직접 바꾸는 살아있는 모험 책.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      🎓 <strong>개발자 정의:</strong> 사용자의 입력과 선택지에 따라 줄거리와 결말이 동적으로 변화하는 소프트웨어 기반 상호작용형 서사 매체.
                    </p>
                  </div>
                </div>
              </div>
            </article>

          {/* 자가 점검 체크리스트 카드 (진척도 게이지 연동) */}
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 id="stage-4-title" className="text-base sm:text-lg font-bold text-slate-900">자가 점검 체크리스트</h3>
                  <p className="text-sm text-slate-500">오늘 배운 6가지 질문을 스스로 점검하며 체크박스를 눌러보세요.</p>
                </div>
              </div>
              <span id="checklist-counter" className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {completedChecks} / 6 완료
              </span>
            </div>

            {/* 실시간 진행률 게이지 바 */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                id="checklist-progress-bar"
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedChecks / 6) * 100)}%` }}
              />
            </div>

            {/* 체크리스트 6개 항목 (라벨-인풋 1:1 매핑) */}
            <div className="space-y-2.5">
              {[
                '1. 사용자의 선택에 따라 이야기의 결과가 달라지는 조건 분기(if-else)의 원리를 이해했다.',
                '2. 복잡한 문제를 도입, 분기, 엔딩의 단계별 노드로 쪼개는 작업 분해(Decomposition)를 학습했다.',
                '3. STAGE 02 스토리 분기 시뮬레이터에서 선택지를 조작해 최종 멀티 엔딩을 직접 달성했다.',
                '4. STAGE 03 실제 ChatGPT 또는 Gemini에 프롬프트를 넣어 고퀄리티 분기 스토리를 제작했다.',
                '5. 단순한 정답 맞히기가 아닌, 가치관과 트레이드오프가 있는 의미 있는 선택지의 중요성을 깨달았다.',
                '6. 주니어 개발자를 위한 전문 용어 돋보기(조건 분기, 작업 분해, 트리 구조, 인터랙티브 픽션)를 확인했다.'
              ].map((label, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checklist[idx]}
                    onChange={() => handleCheck(idx)}
                    className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">{label}</span>
                </label>
              ))}
            </div>
          </article>

          {/* 100% 완주 시 나타나는 축하 & 다음 강 언락 펄스 카드 */}
          {isUnlocked && (
            <article id="completion-card" className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-300">스토리 분기와 게임북 설계 마스터 달성을 축하합니다! 🎉</h4>
                  <p className="text-sm text-slate-300">6가지 점검 항목을 모두 통과하여 복잡한 문제를 쪼개고 분기 트리를 구성하는 인터랙티브 픽션 원리를 완전히 정복했습니다.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                  <p className="text-sm text-white font-bold">시즌 1 · 4강: 밸런스 패치! 버그 없는 룰과 난이도 설계</p>
                </div>
                <a
                  href="/materials/ai/lessons/04-balance-patch/index.html"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>4강으로 즉시 이동</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          )}

          {/* 단계 이동 버튼 바 */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => switchStage('stage3')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전: 3단계 실전 AI 퀘스트</span>
            </button>
          </div>
        </section>
        )}
      </main>

      {/* ======================================================================= */}
      {/* [푸터: 헤더와 마찬가지로 100% Full-Width 사용]                         */}
      {/* ======================================================================= */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>📘 AI·코딩 24강 장기 교육과정 - Wanted Montage Design System</p>
          <p>외부 로그인 0개! 순수 브라우저 자바스크립트로 구동되는 인터랙티브 에듀테크</p>
        </div>
      </footer>
    </div>
  );
};
