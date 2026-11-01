import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Award,
  Lock,
  Unlock,
  Layers,
  Search,
  Code2,
  Trophy,
  CheckSquare,
  Radio,
  Send,
  ShieldCheck,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Sun,
  Snowflake,
  Flame,
  Wind,
  Mountain,
  Umbrella,
  Shirt,
  MapPin,
  FileCode,
  Thermometer,
  Home
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 4 · 16강 React 컴포넌트 (Lesson16.tsx)
 * 오늘 우산 챙길까? 기상청 데이터 연동 날씨 & 옷차림 코디네이터
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'weather' | 'inspect' | 'checklist';
type CityKey = 'seoul' | 'busan' | 'jeju' | 'pyeongchang';
type SceneKey = 'sunny' | 'rainy' | 'cold' | 'hot';

interface OutfitInfo {
  top: string;
  bottom: string;
  acc: string;
}

interface ScenarioData {
  temp: number;
  apparent: number;
  pty: number;
  sky: number;
  pop: number;
  humidity: number;
  wind: number;
  uv: string;
  summary: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBg: string;
  bannerIcon: string;
  needUmbrella: boolean;
  outfit: OutfitInfo;
}

interface CityData {
  name: string;
  grid: { nx: number; ny: number };
  scenarios: Record<SceneKey, ScenarioData>;
}

const WEATHER_DATABASE: Record<CityKey, CityData> = {
  seoul: {
    name: '서울 종로구 광화문',
    grid: { nx: 60, ny: 127 },
    scenarios: {
      sunny: {
        temp: 24.2,
        apparent: 25.0,
        pty: 0,
        sky: 1,
        pop: 10,
        humidity: 45,
        wind: 2.1,
        uv: '보통 (5)',
        summary: '기분 좋은 맑은 하늘 (체감 25.0℃)',
        bannerTitle: '산뜻한 봄가을 날씨',
        bannerSubtitle: '활동하기 딱 좋은 쾌적한 온도예요',
        bannerBg: 'from-sky-500 to-blue-600',
        bannerIcon: 'sun',
        needUmbrella: false,
        outfit: {
          top: '👕 얇은 긴팔 셔츠 / 티셔츠',
          bottom: '👖 편안한 면바지 / 슬랙스',
          acc: '🧥 얇은 가디건, 자외선차단제'
        }
      },
      rainy: {
        temp: 16.5,
        apparent: 15.2,
        pty: 1,
        sky: 4,
        pop: 90,
        humidity: 88,
        wind: 3.5,
        uv: '낮음 (1)',
        summary: '촉촉한 가을비 내리는 중 (체감 15.2℃)',
        bannerTitle: '비 내리는 쌀쌀한 날씨',
        bannerSubtitle: '빗길 미끄럼과 체온 유지에 유의하세요',
        bannerBg: 'from-blue-700 to-slate-800',
        bannerIcon: 'cloud-rain',
        needUmbrella: true,
        outfit: {
          top: '👕 톡톡한 맨투맨 / 셔츠',
          bottom: '👖 방수 코팅 청바지 / 어두운 바지',
          acc: '🧥 방수 바람막이, 튼튼한 장우산 ☂️'
        }
      },
      cold: {
        temp: 1.2,
        apparent: -3.5,
        pty: 3,
        sky: 4,
        pop: 70,
        humidity: 75,
        wind: 4.8,
        uv: '낮음 (1)',
        summary: '꽁꽁 얼어붙는 눈 소식 (체감 -3.5℃)',
        bannerTitle: '눈 내리는 겨울철 한파',
        bannerSubtitle: '두꺼운 외투로 체온을 꼭 지키세요',
        bannerBg: 'from-indigo-800 to-slate-900',
        bannerIcon: 'snowflake',
        needUmbrella: true,
        outfit: {
          top: '🧶 기모 니트 / 히트텍 내의',
          bottom: '👖 도톰한 기모 팬츠',
          acc: '🧣 롱패딩, 털모자, 방한 장갑'
        }
      },
      hot: {
        temp: 32.5,
        apparent: 34.0,
        pty: 0,
        sky: 1,
        pop: 0,
        humidity: 65,
        wind: 1.2,
        uv: '매우 높음 (9)',
        summary: '햇살이 쨍쨍한 한여름 폭염 (체감 34.0℃)',
        bannerTitle: '한여름 무더위 경보',
        bannerSubtitle: '시원한 물을 자주 마시고 그늘을 찾으세요',
        bannerBg: 'from-amber-500 to-rose-600',
        bannerIcon: 'flame',
        needUmbrella: false,
        outfit: {
          top: '🎽 통풍 잘되는 반팔 티셔츠',
          bottom: '🩳 시원한 린넨 반바지',
          acc: '🕶️ 선글라스, 모자, 시원한 얼음물'
        }
      }
    }
  },
  busan: {
    name: '부산 해운대 해변',
    grid: { nx: 98, ny: 75 },
    scenarios: {
      sunny: {
        temp: 22.8,
        apparent: 23.5,
        pty: 0,
        sky: 1,
        pop: 10,
        humidity: 55,
        wind: 3.8,
        uv: '높음 (6)',
        summary: '시원한 바닷바람과 맑은 하늘 (체감 23.5℃)',
        bannerTitle: '화창한 해변 날씨',
        bannerSubtitle: '가벼운 겉옷 하나면 충분해요',
        bannerBg: 'from-cyan-500 to-blue-600',
        bannerIcon: 'wind',
        needUmbrella: false,
        outfit: {
          top: '👕 시원한 스트라이프 셔츠',
          bottom: '👖 편안한 치노 팬츠',
          acc: '🧥 얇은 윈드브레이커'
        }
      },
      rainy: {
        temp: 18.0,
        apparent: 17.0,
        pty: 1,
        sky: 4,
        pop: 85,
        humidity: 92,
        wind: 5.5,
        uv: '낮음 (1)',
        summary: '해풍과 함께 내리는 바닷비 (체감 17.0℃)',
        bannerTitle: '강풍 동반 비바람',
        bannerSubtitle: '우산이 뒤집히지 않게 조심하세요',
        bannerBg: 'from-slate-700 to-blue-900',
        bannerIcon: 'cloud-lightning',
        needUmbrella: true,
        outfit: {
          top: '👕 보온 후드티',
          bottom: '👖 활동적인 조거 팬츠',
          acc: '🧥 튼튼한 방풍 방수 점퍼, 접이식 우산'
        }
      },
      cold: {
        temp: 4.5,
        apparent: 1.0,
        pty: 0,
        sky: 3,
        pop: 20,
        humidity: 50,
        wind: 6.0,
        uv: '보통 (3)',
        summary: '차가운 겨울 바닷바람 (체감 1.0℃)',
        bannerTitle: '매서운 해풍 한기',
        bannerSubtitle: '목과 귀를 따뜻하게 감싸세요',
        bannerBg: 'from-blue-900 to-slate-900',
        bannerIcon: 'wind',
        needUmbrella: false,
        outfit: {
          top: '🧶 두꺼운 울 니트',
          bottom: '👖 기모 청바지',
          acc: '🧥 숏패딩 / 코트, 넥워머'
        }
      },
      hot: {
        temp: 30.5,
        apparent: 32.8,
        pty: 0,
        sky: 1,
        pop: 10,
        humidity: 78,
        wind: 2.5,
        uv: '매우 높음 (8)',
        summary: '해수욕장 피서 날씨 (체감 32.8℃)',
        bannerTitle: '뜨거운 여름 바다',
        bannerSubtitle: '자외선 차단제를 꼼꼼히 바르세요',
        bannerBg: 'from-amber-500 to-orange-600',
        bannerIcon: 'sun',
        needUmbrella: false,
        outfit: {
          top: '🎽 시원한 민소매 / 반팔',
          bottom: '🩳 비치 숏팬츠',
          acc: '🧴 워터프루프 선크림, 비치 샌들'
        }
      }
    }
  },
  jeju: {
    name: '제주 서귀포 올레길',
    grid: { nx: 52, ny: 38 },
    scenarios: {
      sunny: {
        temp: 23.5,
        apparent: 24.2,
        pty: 0,
        sky: 1,
        pop: 10,
        humidity: 60,
        wind: 2.8,
        uv: '높음 (7)',
        summary: '돌담길 걷기 좋은 온화한 날 (체감 24.2℃)',
        bannerTitle: '따스한 제주 봄바람',
        bannerSubtitle: '올레길 산책하기에 최적의 날씨예요',
        bannerBg: 'from-emerald-500 to-teal-600',
        bannerIcon: 'sun',
        needUmbrella: false,
        outfit: {
          top: '👕 편안한 면 티셔츠',
          bottom: '👖 신축성 좋은 카고 팬츠',
          acc: '👟 푹신한 트레킹화, 챙 넓은 모자'
        }
      },
      rainy: {
        temp: 19.5,
        apparent: 19.0,
        pty: 4,
        sky: 4,
        pop: 80,
        humidity: 90,
        wind: 4.2,
        uv: '낮음 (2)',
        summary: '안개비와 촉촉한 숲길 (체감 19.0℃)',
        bannerTitle: '촉촉한 제주 소나기',
        bannerSubtitle: '비옷이나 가벼운 우산을 챙기세요',
        bannerBg: 'from-teal-800 to-slate-800',
        bannerIcon: 'cloud-drizzle',
        needUmbrella: true,
        outfit: {
          top: '👕 통풍 기능성 긴팔',
          bottom: '👖 속건성 아웃도어 팬츠',
          acc: '🧥 레인코트(비옷), 방수팩'
        }
      },
      cold: {
        temp: 6.8,
        apparent: 3.5,
        pty: 0,
        sky: 3,
        pop: 20,
        humidity: 55,
        wind: 5.2,
        uv: '보통 (3)',
        summary: '한라산 눈바람이 부는 날 (체감 3.5℃)',
        bannerTitle: '쌀쌀한 한라산 겨울 바람',
        bannerSubtitle: '겉옷을 든든히 챙겨 입으세요',
        bannerBg: 'from-indigo-800 to-slate-900',
        bannerIcon: 'wind',
        needUmbrella: false,
        outfit: {
          top: '🧶 도톰한 플리스 자켓',
          bottom: '👖 방풍 안감 바지',
          acc: '🧥 다운 자켓, 귀마개'
        }
      },
      hot: {
        temp: 31.0,
        apparent: 33.5,
        pty: 0,
        sky: 1,
        pop: 0,
        humidity: 72,
        wind: 2.0,
        uv: '위험 (10)',
        summary: '강렬한 남쪽 햇살 폭염 (체감 33.5℃)',
        bannerTitle: '남국 휴양지 무더위',
        bannerSubtitle: '낮 12시~2시 야외활동을 자제하세요',
        bannerBg: 'from-rose-500 to-amber-600',
        bannerIcon: 'flame',
        needUmbrella: false,
        outfit: {
          top: '🎽 린넨 오픈 카라 셔츠',
          bottom: '🩳 가벼운 반바지',
          acc: '🕶️ 편광 선글라스, 양우산'
        }
      }
    }
  },
  pyeongchang: {
    name: '강원 평창 대관령',
    grid: { nx: 77, ny: 122 },
    scenarios: {
      sunny: {
        temp: 18.5,
        apparent: 17.5,
        pty: 0,
        sky: 1,
        pop: 10,
        humidity: 40,
        wind: 3.2,
        uv: '보통 (5)',
        summary: '해발 800m 청정 고원 맑음 (체감 17.5℃)',
        bannerTitle: '선선한 고원 힐링 날씨',
        bannerSubtitle: '평지보다 5도 이상 낮으니 겉옷 필수!',
        bannerBg: 'from-emerald-600 to-sky-700',
        bannerIcon: 'mountain',
        needUmbrella: false,
        outfit: {
          top: '👕 도톰한 긴팔 맨투맨',
          bottom: '👖 등산 바지 / 청바지',
          acc: '🧥 가을 자켓 / 집업 후디'
        }
      },
      rainy: {
        temp: 12.0,
        apparent: 9.8,
        pty: 1,
        sky: 4,
        pop: 85,
        humidity: 95,
        wind: 4.5,
        uv: '낮음 (1)',
        summary: '대관령 안개구름과 차가운 비 (체감 9.8℃)',
        bannerTitle: '으슬으슬 차가운 비',
        bannerSubtitle: '보온과 방수에 신경 써야 감기를 피해요',
        bannerBg: 'from-slate-700 to-indigo-950',
        bannerIcon: 'cloud-rain',
        needUmbrella: true,
        outfit: {
          top: '🧶 기모 이너웨어',
          bottom: '👖 두꺼운 방수 팬츠',
          acc: '🧥 고어텍스 방수 자켓, 큰 우산 ☂️'
        }
      },
      cold: {
        temp: -7.5,
        apparent: -14.0,
        pty: 3,
        sky: 4,
        pop: 90,
        humidity: 80,
        wind: 7.2,
        uv: '낮음 (1)',
        summary: '칼바람 블리자드 대설 (체감 -14.0℃)',
        bannerTitle: '살을 에는 극강 한파',
        bannerSubtitle: '노출 부위를 최소화하고 완전 무장하세요',
        bannerBg: 'from-sky-950 to-slate-950',
        bannerIcon: 'snowflake',
        needUmbrella: true,
        outfit: {
          top: '🧶 발열 내의 + 두꺼운 스웨터',
          bottom: '👖 방한 스키 팬츠 / 기모바지',
          acc: '🧣 헤비 롱다운, 방한 부츠, 핫팩 필수'
        }
      },
      hot: {
        temp: 26.5,
        apparent: 26.0,
        pty: 0,
        sky: 1,
        pop: 10,
        humidity: 50,
        wind: 2.5,
        uv: '높음 (7)',
        summary: '한여름에도 열대야 없는 대관령 (체감 26.0℃)',
        bannerTitle: '쾌적한 고원 피서지',
        bannerSubtitle: '햇살은 따스하고 바람은 시원해요',
        bannerBg: 'from-sky-500 to-teal-600',
        bannerIcon: 'sun',
        needUmbrella: false,
        outfit: {
          top: '👕 반팔 면 티셔츠',
          bottom: '👖 얇은 긴바지 / 반바지',
          acc: '🧥 해 질 녘 걸칠 얇은 셔츠'
        }
      }
    }
  }
};

export default function Lesson16() {
  // 스테이지 및 우측 탭 상태
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('weather');

  // 날씨 시뮬레이터 상태
  const [cityKey, setCityKey] = useState<CityKey>('seoul');
  const [sceneKey, setSceneKey] = useState<SceneKey>('sunny');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('관측 완료 (200 OK) 🌈');

  // 데이터 비교 뷰어 상태
  const [compareMode, setCompareMode] = useState<'raw' | 'cleaned'>('cleaned');

  // 프롬프트 복사 상태
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // 자가 점검 체크리스트 (6개)
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 회고 노트 상태
  const [reflectionQ1, setReflectionQ1] = useState<string>('');
  const [reflectionQ2, setReflectionQ2] = useState<string>('');
  const [saveIndicator, setSaveIndicator] = useState<string>('자동 저장 대기');

  // 로컬스토리지 복원
  useEffect(() => {
    const savedCompleted = localStorage.getItem('ai_lesson_16_completed');
    if (savedCompleted === 'true') {
      setCheckedItems([true, true, true, true, true, true]);
      setIsCompleted(true);
    }

    const savedQ1 = localStorage.getItem('ai_lesson_16_reflection_q1');
    const savedQ2 = localStorage.getItem('ai_lesson_16_reflection_q2');
    if (savedQ1) setReflectionQ1(savedQ1);
    if (savedQ2) setReflectionQ2(savedQ2);
  }, []);

  // 체크리스트 핸들러
  const handleCheck = (index: number) => {
    const next = [...checkedItems];
    next[index] = !next[index];
    setCheckedItems(next);

    const allChecked = next.every(Boolean);
    setIsCompleted(allChecked);
    if (allChecked) {
      localStorage.setItem('ai_lesson_16_completed', 'true');
    }
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  // 날씨 측정 시뮬레이션
  const handleFetchWeather = () => {
    setIsFetching(true);
    setDeliveryStatus('기상청 위성 통신 중... 📡');

    setTimeout(() => {
      setIsFetching(false);
      setDeliveryStatus('관측 완료 (200 OK) 🌈');
    }, 350);
  };

  // 프롬프트 복사
  const handleCopyPrompt = () => {
    const promptText = `기상청 초단기실황 API(getUltraSrtNcst)에서 가져온 기온(T1H), 강수형태(PTY), 습도(REH) 데이터를 기반으로 오늘의 맞춤 옷차림을 추천하는 자바스크립트 함수를 작성해줘.

[필수 조건]
1. 입력받은 기온(temp)을 5단계 임계값(28도 이상: 무더위 반팔, 20~27도: 얇은 긴팔, 12~19도: 가디건/자켓, 5~11도: 코트/경량패딩, 4도 이하: 롱패딩/목도리)으로 분류하여 상의, 하의, 외투 추천 텍스트를 반환할 것.
2. 강수 형태(PTY)가 1(비), 2(비/눈), 4(소나기)이거나 강수확률이 높을 경우 '우산을 꼭 챙기세요!' 알림 플래그(needUmbrella: true)를 활성화할 것.
3. 맑음, 비, 눈, 무더위 등 현재 날씨 상태에 어울리는 대표 색상(themeColor)과 Lucide 아이콘 명칭을 객체에 함께 담아 반환할 것.
4. 기상청 서버 점검이나 데이터 누락으로 기온 값이 없을 경우(null 또는 -999) 기본 평년 기온(18도)으로 안전하게 대체하는 Fallback 예외 처리를 포함할 것.`;

    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);
    });
  };

  // 회고 저장
  const handleReflectionChange = (q: 'q1' | 'q2', val: string) => {
    if (q === 'q1') {
      setReflectionQ1(val);
      localStorage.setItem('ai_lesson_16_reflection_q1', val);
    } else {
      setReflectionQ2(val);
      localStorage.setItem('ai_lesson_16_reflection_q2', val);
    }
    setSaveIndicator('자동 저장됨');
  };

  const currentCity = WEATHER_DATABASE[cityKey];
  const currentWeather = currentCity.scenarios[sceneKey];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ======================================================================= */}
      {/* [상단 GNB] 과정 홈 | 시즌 4 · 16강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ======================================================================= */}
      <header className="sticky top-0 z-50 flex-none h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <a
            href="../../index.html"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold">과정 홈</span>
          </a>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              시즌 4 · 16강
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              오늘 우산 챙길까? 기상청 데이터 연동 날씨 & 옷차림 코디네이터
            </h1>
          </div>
        </div>

        {/* 4단계 퀘스트 스텝퍼 */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveStage('stage1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage1' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>현관문 앞 고민</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage2' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>하늘의 숫자 암호</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage3' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>조건부 코디 로직</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('stage4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeStage === 'stage4' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>결측치 방어 & 회고</span>
          </button>
        </nav>

        {/* 우측 진척도 & 다음 강 언락 뱃지 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span>진척도</span>
              <span className="text-sky-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-sky-50 text-sky-700 border border-sky-300 animate-pulse'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {isCompleted ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isCompleted ? '17강 언락!' : '17강 잠김'}</span>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* [메인 워크스페이스] 좌·우 독립 슬라이드바 2-패널 스플릿 뷰 */}
      {/* ======================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* --------------------------------------------------------------------- */}
        {/* ■ 좌측 패널 (60% 폭): 퀘스트 가이드 & 본문 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar">
          {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-slate-50 border border-sky-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-sky-200/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                  실생활 오픈 API 프로젝트
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  기온별 맞춤 의류 추천 알고리즘
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                오늘 우산 챙길까?<br />
                기상청 데이터 연동 날씨 & 옷차림 코디네이터
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                아침에 눈을 떴을 때 "오늘 패딩 입을까, 얇은 셔츠 입을까?", "비가 올까 봐 우산을 챙겨야 할까?" 고민한 적 있나요? 기상청이 제공하는 실시간 하늘의 편지(기상 관측 데이터)를 받아와, 컴퓨터가 기온과 비 소식을 똑똑하게 분석해 오늘의 완벽한 옷차림을 골라주는 **인공지능 스타일리스트 웹앱**을 직접 만들어보아요!
              </p>

              {/* 4대 메타 그리드 (15.6인치 최적화) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">약 40분</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">난이도</span>
                  <strong className="text-xs font-bold text-sky-700 leading-snug whitespace-nowrap">실전 레벨 4 ★★★★☆</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">실습 도구</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">기상청 오픈 API & JS</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <strong className="text-xs font-bold text-indigo-700 leading-snug whitespace-nowrap">날씨 & 코디 웹앱</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 1: 미션 브리핑 & 4대 성공 루브릭 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 1: 미션 브리핑 (아침 등굣길, 현관문 앞 5분의 고민! 🚪)
                </h3>
                <span className="text-xs text-slate-500">날씨를 몰라 비를 맞거나 감기에 걸리지 않도록 지켜주는 생활 밀착형 도구</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-950 font-bold">"날씨 앱을 켜면 왜 온도 숫자만 덩그러니 있을까?"</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    아이들에게 진짜 필요한 건 "14도"라는 숫자보다 "오늘은 아침저녁 쌀쌀하니 가디건을 걸치고, 오후에 소나기가 오니 접이식 우산을 챙겨!"라는 친절한 조언입니다. 우리는 데이터를 그냥 보여주는 데서 멈추지 않고, 데이터를 분석해 **진짜 실생활의 행동 가이드**를 만들어냅니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 4대 성공 루브릭 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-sky-600" />
                <span>이번 퀘스트의 4대 성공 루브릭 (성공 판정 기준)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>1. 기상청 관측 데이터 연동</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    기상청 초단기 예보 API 규격에 맞추어 기온(T1H), 강수형태(PTY), 하늘상태(SKY) 패킷을 수신합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>2. 기온별 5단계 의류 알고리즘</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    임계값(4℃, 12℃, 20℃, 28℃)에 따라 롱패딩부터 반팔까지 최적의 상의·하의·외투를 판정합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>3. 강수 조건부 우산 알림</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    비, 눈, 소나기 또는 강수확률 60% 이상일 때 '노란 우산 챙기기' 경보 뱃지를 조건부 렌더링합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>4. 날씨 반응형 테마 UI</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    맑음(하늘색), 비(남색), 눈(청록색), 폭염(주황색) 날씨 상태에 따라 배경색과 아이콘이 카멜레온처럼 변합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 2: 핵심 개념 & 인터랙티브 인포그래픽 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 2: 핵심 원리 (하늘의 숫자 암호와 조건부 알고리즘)
                </h3>
                <span className="text-xs text-slate-500">기상청이 보낸 영문 약자 암호를 해석하고, 의류 추천 로직을 짜는 비법</span>
              </div>
            </div>

            {/* 개념 1: 기상청 4대 핵심 코드 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <h4 className="text-sm font-bold text-slate-900">1. 기상청 슈퍼컴퓨터가 보낸 4대 숫자 암호</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                기상청 서버에서 날아온 데이터는 "비가 와요"라고 한글로 적혀있지 않고, 짧은 영문 약자와 숫자로 인코딩되어 있습니다. 이 4가지 암호만 풀면 날씨 마스터가 될 수 있어요!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-sky-700 text-sm block">T1H / TMP</span>
                  <strong className="text-slate-900 text-xs block">기온 (Temperature)</strong>
                  <span className="text-slate-500 text-[10px]">현재 기온 (섭씨 ℃)</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-indigo-700 text-sm block">PTY</span>
                  <strong className="text-slate-900 text-xs block">강수 형태 (Type)</strong>
                  <span className="text-slate-500 text-[10px]">0:없음, 1:비, 3:눈</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-amber-700 text-sm block">SKY</span>
                  <strong className="text-slate-900 text-xs block">하늘 상태 (Sky)</strong>
                  <span className="text-slate-500 text-[10px]">1:맑음, 3:구름, 4:흐림</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-mono font-bold text-emerald-700 text-sm block">REH</span>
                  <strong className="text-slate-900 text-xs block">습도 (Humidity)</strong>
                  <span className="text-slate-500 text-[10px]">공기 속 수분 비율 (%)</span>
                </div>
              </div>
            </div>

            {/* 개념 2: 기온별 옷차림 분기 알고리즘 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-sky-600" />
                <h4 className="text-sm font-bold text-slate-900">2. 기온 임계값(Threshold)에 따른 옷차림 분기 공식</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                컴퓨터에게 "오늘 기온이 28℃ 이상이면 반팔을 추천하고, 4℃ 이하면 롱패딩을 추천해!"라고 가르치는 조건문(<code className="font-mono text-sky-700 font-bold">if ... else if</code>) 구조입니다.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-1.5 overflow-x-auto border border-slate-800">
                <div className="text-slate-400">// 기온(temp)에 따른 5단계 의류 추천 분기표</div>
                <div><span className="text-purple-400">if</span> (temp &gt;= <span className="text-amber-300">28</span>) &#123; <span className="text-emerald-400">outfit = '민소매, 반팔 티셔츠, 반바지 🩳';</span> &#125;</div>
                <div><span className="text-purple-400">else if</span> (temp &gt;= <span className="text-amber-300">20</span>) &#123; <span className="text-emerald-400">outfit = '얇은 셔츠, 7부 바지, 면바지 👕';</span> &#125;</div>
                <div><span className="text-purple-400">else if</span> (temp &gt;= <span className="text-amber-300">12</span>) &#123; <span className="text-emerald-400">outfit = '가디건, 바람막이, 청바지 🧥';</span> &#125;</div>
                <div><span className="text-purple-400">else if</span> (temp &gt;= <span className="text-amber-300">5</span>) &#123; <span className="text-emerald-400">outfit = '코트, 기모 후드티, 경량패딩 🧤';</span> &#125;</div>
                <div><span className="text-purple-400">else</span> &#123; <span className="text-emerald-400">outfit = '롱패딩, 두꺼운 코트, 목도리 🧣';</span> &#125;</div>
              </div>
            </div>

            {/* 개념 3: 조건부 우산 경보 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-sky-600" />
                <h4 className="text-sm font-bold text-slate-900">3. 비 오면 자동으로 켜지는 노란 우산 신호등</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                강수 형태 코드(<code className="font-mono text-sky-700 font-bold">PTY &gt; 0</code>)가 비나 눈을 가리키면, 화면에 <code className="font-mono text-amber-700 font-bold">노란 우산 필수 지참!</code> 경고 뱃지를 띄웁니다. 이것이 바로 상태에 따라 화면이 바뀌는 **조건부 렌더링(Conditional Rendering)**입니다.
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  <strong className="text-slate-800">강수 확률 60% 이상 또는 PTY=1 감지</strong>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  ☂️ 우산 챙기기 알림 활성화!
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 3: 비교 실험 & 프롬프트 복사 실습 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 3: 비교 실험 & 실전 프롬프트 공작소
                </h3>
                <span className="text-xs text-slate-500">차가운 숫자 데이터와 따뜻한 생활 코디네이터의 차이를 비교하기</span>
              </div>
            </div>

            {/* 비교 테이블 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 whitespace-nowrap">비교 상황</th>
                    <th className="p-3">일반 날씨 앱의 숫자 출력</th>
                    <th className="p-3 text-sky-700">우리가 만드는 맞춤 코디네이터</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">봄 환절기</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">기온: 14.5℃, 풍속: 3.2m/s</td>
                    <td className="p-3 font-semibold text-slate-800">🧥 아침엔 쌀쌀하니 가디건을 걸치고 가요!</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">여름 장마철</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">PTY: 1, RN1: 15mm</td>
                    <td className="p-3 font-semibold text-slate-800">☂️ 장대비 주의보! 방수 운동화와 노란 장우산 챙기기</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">한여름 폭염</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">기온: 33.0℃, 습도: 80%</td>
                    <td className="p-3 font-semibold text-slate-800">🩳 통풍 잘되는 반팔 티셔츠와 시원한 얼음물병 지참</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">겨울철 한파</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">기온: -5.2℃, 풍속: 5.0m/s</td>
                    <td className="p-3 font-bold text-sky-600">🧣 체감온도 -10℃! 롱패딩과 방한 목도리 완전 무장</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI 실전 프롬프트 원클릭 복사 카드 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950 text-white space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400"></i>
                  <strong className="text-xs sm:text-sm font-bold text-sky-200">AI 코딩 도우미에게 건넬 실전 프롬프트</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-xs font-bold transition-all text-white shadow-xs cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? '복사됨! ✨' : '프롬프트 복사'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-sky-300 whitespace-pre-wrap leading-relaxed select-all">
{`기상청 초단기실황 API(getUltraSrtNcst)에서 가져온 기온(T1H), 강수형태(PTY), 습도(REH) 데이터를 기반으로 오늘의 맞춤 옷차림을 추천하는 자바스크립트 함수를 작성해줘.

[필수 조건]
1. 입력받은 기온(temp)을 5단계 임계값(28도 이상: 무더위 반팔, 20~27도: 얇은 긴팔, 12~19도: 가디건/자켓, 5~11도: 코트/경량패딩, 4도 이하: 롱패딩/목도리)으로 분류하여 상의, 하의, 외투 추천 텍스트를 반환할 것.
2. 강수 형태(PTY)가 1(비), 2(비/눈), 4(소나기)이거나 강수확률이 높을 경우 '우산을 꼭 챙기세요!' 알림 플래그(needUmbrella: true)를 활성화할 것.
3. 맑음, 비, 눈, 무더위 등 현재 날씨 상태에 어울리는 대표 색상(themeColor)과 Lucide 아이콘 명칭을 객체에 함께 담아 반환할 것.
4. 기상청 서버 점검이나 데이터 누락으로 기온 값이 없을 경우(null 또는 -999) 기본 평년 기온(18도)으로 안전하게 대체하는 Fallback 예외 처리를 포함할 것.`}
              </pre>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 4: 오류 연구소, 실전 예외 방어 & 배움 회고 */}
          {/* ------------------------------------------------------------------- */}
          <div id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 4: 오류 연구소 (데이터 결측치 방어 & 배움 회고)
                </h3>
                <span className="text-xs text-slate-500">기상청 서버가 점검 중이어도 끄떡없는 튼튼한 안전망 구축하기</span>
              </div>
            </div>

            {/* 예외 방어 2대 비법 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>방패 1: 기상청 점검 시간 결측치(-999) 방어</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  매시 정각 기상청 서버 점검 시 데이터가 비어있거나 <code className="text-sky-800 font-mono">-999</code>가 날아올 수 있습니다. <code className="text-sky-800 font-mono">if (temp === -999 || isNaN(temp))</code>로 가로채어 직전 시간대 관측값으로 자동 대체합니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>방패 2: 강수 확률 50%의 애매한 날 방어</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  비가 올지 안 올지 반반일 때는 "비가 안 올 수도 있으니 무거운 장우산 대신 가방에 쏙 들어가는 **3단 접이식 미니 우산**을 챙기세요!"라는 센스 있는 안내를 제공합니다.
                </p>
              </div>
            </div>

            {/* 주니어 개발자 성찰 회고 폼 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <strong className="text-xs sm:text-sm font-bold text-slate-900">주니어 개발자 16강 배움 회고 노트</strong>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{saveIndicator}</span>
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="ref-q1" className="block text-xs font-bold text-slate-700 mb-1">
                    Q1. 오늘 기온과 날씨 조건에 따라 옷차림을 추천하는 코드를 짜면서 어떤 조건 분기가 가장 흥미로웠나요?
                  </label>
                  <textarea
                    id="ref-q1"
                    rows={2}
                    value={reflectionQ1}
                    onChange={(e) => handleReflectionChange('q1', e.target.value)}
                    placeholder="예: 단순히 기온뿐만 아니라 강수 형태(PTY)를 체크해서 자동으로 노란 우산 알림이 켜지는 조건문이 실생활에 정말 유용했어요!"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="ref-q2" className="block text-xs font-bold text-slate-700 mb-1">
                    Q2. 나만의 날씨 앱에 추가하고 싶은 특별한 날씨 추천 기능(세차 지수, 빨래 건조 지수, 축구하기 좋은 날 등)이 있다면 무엇인가요?
                  </label>
                  <textarea
                    id="ref-q2"
                    rows={2}
                    value={reflectionQ2}
                    onChange={(e) => handleReflectionChange('q2', e.target.value)}
                    placeholder="예: 미세먼지가 좋고 바람이 적당한 날에 '오늘은 친구들과 운동장에서 축구하기 딱 좋은 날!'이라고 알려주는 스포츠 지수를 넣고 싶어요."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* [🔍 주니어 개발자를 위한 전문 용어 돋보기 (Junior Developer Glossary)] */}
          {/* ------------------------------------------------------------------- */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  주니어 개발자를 위한 전문 용어 돋보기
                </h3>
                <span className="text-xs text-slate-400">본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 용어 1: 기상 관측 데이터 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">1. 기상 관측 데이터</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">Weather</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Meteorological Data (Weather Forecast API)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 하늘 위 기상 위성과 슈퍼컴퓨터가 날씨 신호등처럼 보내주는 하늘의 편지!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 기온, 습도, 기압, 풍향, 풍속, 강수량 등 지구 대기의 물리적 상태를 지상 관측소와 위성 레이더로 측정하여 디지털 수치로 집계한 공공 데이터입니다.
                </p>
              </div>

              {/* 용어 2: 조건부 렌더링 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">2. 조건부 화면 표시</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Conditional</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Conditional Rendering (If-Else UI Logic)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 비가 오면 우산 그림을 꺼내고, 해가 쨍쨍하면 선글라스 그림을 자동으로 꺼내 보여주는 요술 칠판!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 특정 조건(데이터 상태, 사용자 입력 등)의 참/거짓 평가 결과에 따라 웹 애플리케이션의 화면 요소나 컴포넌트를 동적으로 표시하거나 숨기는 프런트엔드 프로그래밍 기법입니다.
                </p>
              </div>

              {/* 용어 3: 임계값 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">3. 경계 판정 기준값</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Threshold</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Threshold Value (Decision Boundary)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> "여기서부터는 패딩을 입어야 해!"라고 정해둔 온도의 국경선 (예: 4℃)!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 시스템이나 알고리즘에서 상태의 전환이나 동작의 변화를 유발하는 기준 경계값(Boundary Condition)을 의미합니다.
                </p>
              </div>

              {/* 용어 4: 격자 좌표계 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">4. 기상청 격자 좌표</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Grid</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Grid Coordinate System (nx, ny)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 우리나라 지도를 바둑판처럼 촘촘히 나누어, 우리 동네 칸의 가로(nx)·세로(ny) 번호표를 매긴 지도!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 둥근 지구 표면을 평면 투영(람베르트 정각원추도법)하여 기상청 예보 구역을 가로(nx), 세로(ny) 정수 격자 좌표로 환산한 전용 위치 표기 체계입니다.
                </p>
              </div>

              {/* 용어 5: 데이터 정규화 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">5. 데이터 정규화</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Normalization</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: Data Normalization (Unit &amp; Format Conversion)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> '28.4', '28도', '28℃'처럼 제각각인 글자들을 컴퓨터가 계산하기 좋게 순수한 숫자 28.4로 통일해주는 작업!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 다양한 소스나 형식으로 수집된 이종(Heterogeneous) 데이터를 일관된 기준 단위와 정형 데이터 타입으로 변환 및 정돈하는 데이터 전처리 기법입니다.
                </p>
              </div>

              {/* 용어 6: 상태 기반 스타일링 */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-white">6. 상태 기반 테마</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">Theme</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block pl-5.5">영문: State-Driven UI (Dynamic Theme &amp; Styling)</span>
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300 text-xs flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🧸</span>
                  <span><strong>어린이 비유:</strong> 맑은 날엔 하늘색 배경, 비 오는 날엔 짙은 남색 배경으로 날씨에 맞춰 옷을 갈아입는 카멜레온 화면!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  <strong>🎓 개발자 공식 정의:</strong> 애플리케이션의 내부 상태(State) 값의 변화에 즉각 반응하여 CSS 클래스, 테마 색상, 시각 효과를 동적으로 재계산하고 반영하는 인터페이스 설계 패턴입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          {/* 3단 탭 네비게이션 헤더 */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('weather')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'weather'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>날씨 코디</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('inspect')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'inspect'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>데이터 비교</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('checklist')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'checklist'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>점검표</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: ⛅ 실시간 날씨 & 코디네이터 콘솔 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'weather' && (
            <div className="space-y-4">
              {/* 컨트롤러 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">우리 동네 날씨 탐색</strong>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isFetching
                        ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {deliveryStatus}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* 지역 선택 */}
                  <div>
                    <label htmlFor="react-city-select" className="block text-[11px] font-bold text-slate-700 mb-1">
                      지역 선택 (기상청 격자 nx, ny 좌표)
                    </label>
                    <select
                      id="react-city-select"
                      value={cityKey}
                      onChange={(e) => setCityKey(e.target.value as CityKey)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                    >
                      <option value="seoul">[서울] 종로구 광화문 (격자: 60, 127)</option>
                      <option value="busan">[부산] 해운대 해변 (격자: 98, 75)</option>
                      <option value="jeju">[제주] 서귀포 올레길 (격자: 52, 38)</option>
                      <option value="pyeongchang">[강원] 평창 대관령 (격자: 77, 122)</option>
                    </select>
                  </div>

                  {/* 날씨 시나리오 버튼 */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-1">날씨 시나리오 시뮬레이션</span>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                      {(['sunny', 'rainy', 'cold', 'hot'] as SceneKey[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSceneKey(s)}
                          className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                            sceneKey === s
                              ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {s === 'sunny' && '☀️ 맑음(24℃)'}
                          {s === 'rainy' && '🌧️ 비(16℃)'}
                          {s === 'cold' && '❄️ 한파(1℃)'}
                          {s === 'hot' && '🔥 폭염(32℃)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 관측 버튼 */}
                  <button
                    type="button"
                    onClick={handleFetchWeather}
                    disabled={isFetching}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>⛅ 실시간 날씨 측정 & 코디 추천!</span>
                  </button>
                </div>
              </div>

              {/* ⛅ 비주얼 실시간 날씨 & 코디네이터 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                {/* 상단 헤더 */}
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 block">{currentCity.name}</strong>
                    <span className="text-[11px] text-slate-500">{currentWeather.summary}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-sky-600 font-mono tracking-tight block">
                      {currentWeather.temp.toFixed(1)}℃
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {currentWeather.pty === 1
                        ? '비 🌧️'
                        : currentWeather.pty === 3
                        ? '눈 ❄️'
                        : currentWeather.pty === 4
                        ? '소나기 🌦️'
                        : '맑음 ☀️'}{' '}
                      (강수 {currentWeather.pop}%)
                    </span>
                  </div>
                </div>

                {/* 중앙 테마 배너 */}
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${currentWeather.bannerBg} text-white space-y-2 relative overflow-hidden transition-all duration-300`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                        {currentWeather.bannerIcon === 'sun' && <Sun className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'cloud-rain' && <CloudRain className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'snowflake' && <Snowflake className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'flame' && <Flame className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'wind' && <Wind className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'cloud-lightning' && <CloudLightning className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'cloud-drizzle' && <CloudDrizzle className="w-6 h-6" />}
                        {currentWeather.bannerIcon === 'mountain' && <Mountain className="w-6 h-6" />}
                      </div>
                      <div>
                        <strong className="text-xs sm:text-sm font-bold block">{currentWeather.bannerTitle}</strong>
                        <span className="text-[11px] text-sky-100">{currentWeather.bannerSubtitle}</span>
                      </div>
                    </div>

                    {/* 우산 경보 뱃지 */}
                    {currentWeather.needUmbrella && (
                      <div className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-xs animate-bounce">
                        <Umbrella className="w-3.5 h-3.5" />
                        <span>우산 챙기기!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 👔 오늘의 맞춤 옷차림 추천 가이드 박스 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Shirt className="w-4 h-4 text-sky-600" />
                    <span>AI 스타일리스트의 추천 옷차림</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">상의 (Top)</span>
                      <strong className="text-slate-900 font-bold block text-xs">{currentWeather.outfit.top}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">하의 (Bottom)</span>
                      <strong className="text-slate-900 font-bold block text-xs">{currentWeather.outfit.bottom}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">외투 & 소지품</span>
                      <strong className="text-sky-700 font-bold block text-xs">{currentWeather.outfit.acc}</strong>
                    </div>
                  </div>
                </div>

                {/* 세부 기상 메타 수치 */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">습도 (REH)</span>
                    <strong className="text-slate-800">{currentWeather.humidity}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">풍속 (WSD)</span>
                    <strong className="text-slate-800">{currentWeather.wind.toFixed(1)} m/s</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">자외선 지수</span>
                    <strong className="text-amber-600 font-bold">{currentWeather.uv}</strong>
                  </div>
                </div>
              </div>

              {/* 📡 오픈 API 통신 & 데이터 시각화 3단계 흐름 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-sky-600" />
                  <span>실시간 날씨 분석 및 추천 3단계 파이프라인</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-slate-800 block">격자 좌표 요청</strong>
                    <span className="text-slate-500 text-[10px]">?nx=60&ny=127</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-slate-800 block">임계값 의류 분기</strong>
                    <span className="text-slate-500 text-[10px]">if (temp &gt;= 20)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-slate-800 block">우산 경보 렌더링</strong>
                    <span className="text-slate-500 text-[10px]">PTY &gt; 0 ➔ ☂️</span>
                  </div>
                </div>
              </div>

              {/* 💡 날씨 코디네이터 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>날씨 코디네이터 4대 핵심 공식 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">T1H(기온)와 PTY(강수)를 우선 추출</strong>
                      <span className="text-slate-400">수십 개 기상 요소 중 가장 중요한 2가지를 먼저 안전하게 파싱하세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">기온 임계값으로 5단계 옷차림 판정</strong>
                      <span className="text-slate-400">28도, 20도, 12도, 5도를 경계선으로 나누면 가장 실용적인 가이드가 됩니다.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">비/눈 소식엔 우산 뱃지 조건부 렌더링</strong>
                      <span className="text-slate-400">PTY가 1이거나 강수 확률이 높을 때 우산 알림을 화면에 띄워주세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">결측치(-999) 방어선 구축</strong>
                      <span className="text-slate-400">서버 점검으로 기온 데이터가 비어있어도 평년 기온으로 안전하게 복구하세요.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: 🧾 원문 JSON vs 코디네이터 모델 비교 돋보기 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'inspect' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">기상청 원문 vs 코디 모델</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {compareMode === 'raw' ? 'Raw JSON View' : 'Cleaned View'}
                  </span>
                </div>

                {/* 보기 모드 토글 */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCompareMode('raw')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      compareMode === 'raw'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    날것의 원문 (Raw Data)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareMode('cleaned')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      compareMode === 'cleaned'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    정제된 코디 객체 (Cleaned)
                  </button>
                </div>

                {/* 패킷 메타 정보 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <strong className="text-slate-800">KMA UltraSrtNcst API</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grid Pos:</span>
                    <strong className="text-slate-800">nx: {currentCity.grid.nx}, ny: {currentCity.grid.ny}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <strong className="text-slate-800">정상 관측 완료 (200 OK)</strong>
                  </div>
                </div>

                {/* 코드/데이터 뷰어 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {compareMode === 'raw' ? '기상청 초단기실황 원문 JSON 패킷 (Raw KMA Payload)' : '정제된 코디네이터 데이터 객체 (Cleaned Model)'}
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {compareMode === 'raw'
                      ? JSON.stringify(
                          {
                            response: {
                              header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
                              body: {
                                dataType: 'JSON',
                                items: {
                                  item: [
                                    { baseDate: '20261102', baseTime: '0800', category: 'T1H', obsrValue: String(currentWeather.temp) },
                                    { baseDate: '20261102', baseTime: '0800', category: 'PTY', obsrValue: String(currentWeather.pty) },
                                    { baseDate: '20261102', baseTime: '0800', category: 'REH', obsrValue: String(currentWeather.humidity) },
                                    { baseDate: '20261102', baseTime: '0800', category: 'WSD', obsrValue: String(currentWeather.wind) }
                                  ]
                                }
                              }
                            }
                          },
                          null,
                          2
                        )
                      : JSON.stringify(
                          {
                            location: currentCity.name,
                            grid: currentCity.grid,
                            temperature: currentWeather.temp,
                            apparentTemp: currentWeather.apparent,
                            rainType: currentWeather.pty,
                            rainProbability: currentWeather.pop,
                            needUmbrella: currentWeather.needUmbrella,
                            outfit: {
                              top: currentWeather.outfit.top,
                              bottom: currentWeather.outfit.bottom,
                              accessories: currentWeather.outfit.acc
                            }
                          },
                          null,
                          2
                        )}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 3: ✅ 자가 점검 체크리스트 (6문항 & 17강 언락) */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">16강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 17강이 열려요</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-600">
                    {completedCount} / 6 ({progressPercent}%)
                  </span>
                </div>

                {/* 진행률 바 */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* 6개 문항 리스트 */}
                <div className="space-y-2 pt-1">
                  {[
                    {
                      id: 'check-1',
                      title: '1. 공공 기상 데이터의 가치',
                      desc: '기상청 기온, 강수, 하늘 데이터가 실생활 옷차림 선택에 주는 도움을 이해했다.'
                    },
                    {
                      id: 'check-2',
                      title: '2. 기상청 핵심 코드 판독',
                      desc: 'T1H(기온), PTY(강수 형태), SKY(하늘 상태)의 의미와 수치를 해석할 수 있다.'
                    },
                    {
                      id: 'check-3',
                      title: '3. 기온별 임계값 의류 분기',
                      desc: '4도, 12도, 20도, 28도 경계선을 기준으로 옷차림을 5단계로 판정하는 로직을 익혔다.'
                    },
                    {
                      id: 'check-4',
                      title: '4. 강수 조건부 우산 알림',
                      desc: '비나 눈이 올 때 "우산 챙기기" 뱃지를 조건부 렌더링하는 원리를 이해했다.'
                    },
                    {
                      id: 'check-5',
                      title: '5. 결측치(-999) 방어선',
                      desc: '서버 점검 등으로 기온 데이터가 누락되었을 때 안전하게 복구하는 Fallback을 파악했다.'
                    },
                    {
                      id: 'check-6',
                      title: '6. 실시간 날씨 코디 조작',
                      desc: '지역과 날씨 시나리오를 변경하며 실시간으로 코디가 바뀌는 인터랙션을 완주했다.'
                    }
                  ].map((item, idx) => (
                    <label
                      key={item.id}
                      htmlFor={item.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={checkedItems[idx]}
                        onChange={() => handleCheck(idx)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900 block mb-0.5">{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* 17강 언락 카드 */}
                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <strong className="text-sm font-bold">16강 미션 완벽 정복! 🎉</strong>
                    </div>
                    <p className="text-xs text-sky-100 leading-relaxed font-normal">
                      기상청 관측 데이터 파싱과 기온별 의류 추천 알고리즘, 조건부 렌더링을 완벽하게 마스터하셨습니다! 다음 17강 실전 네트워크 로딩 스피너와 오류 방어 프로젝트로 모험을 이어가세요.
                    </p>
                    <a
                      href="../17-loading-states/index.html"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-sky-900 hover:bg-sky-50 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>17강: 와이파이 오류 방어 & 로딩창 도전하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
