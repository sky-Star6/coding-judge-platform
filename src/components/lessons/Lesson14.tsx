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
  Utensils,
  School,
  FileCode,
  Filter,
  Info,
  Home,
  BookOpen,
  Database,
  Sliders,
  ShieldAlert
} from 'lucide-react';

/**
 * ------------------------------------------------------------------------------
 * 시즌 4 · 14강 React 컴포넌트 (Lesson14.tsx)
 * 오늘 점심 메뉴는 뭘까? 교육청 데이터로 실시간 급식 알리미 만들기
 * UI/UX Pro Max 2-패널 독립 슬라이드바 워크스페이스 & Lucide Icons 100% 준수
 * ------------------------------------------------------------------------------
 */

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4';
type RightConsoleTab = 'tray' | 'inspect' | 'checklist';
type SchoolKey = 'seoul' | 'gyeonggi' | 'busan' | 'sejong';
type DateKey = 'today' | 'tomorrow' | 'yesterday' | 'weekend';

interface MealInfo {
  title: string;
  rice: string;
  soup: string;
  main: string;
  side: string;
  dessert: string;
  calorie: string;
  allergies: string;
  raw: {
    DDISH_NM: string;
    CAL_INFO: string;
    NTR_INFO: string;
  };
}

interface SchoolData {
  schoolName: string;
  today: MealInfo;
  tomorrow: MealInfo;
  yesterday: MealInfo;
  weekend: null;
}

const MEAL_DATABASE: Record<SchoolKey, SchoolData> = {
  seoul: {
    schoolName: '서울초등학교',
    today: {
      title: '오늘의 급식 (특식)',
      rice: '🍚 친환경 흑미밥',
      soup: '🍲 쇠고기 맑은 무국',
      main: '🍖 수제 눈꽃 치즈 돈가스',
      side: '🥗 아삭 김치 & 샐러드',
      dessert: '🍓 생딸기 요거트',
      calorie: '785.4 Kcal',
      allergies: '난류(1), 우유(2), 대두(5), 밀(6), 돼지고기(10)',
      raw: {
        DDISH_NM: '친환경흑미밥<br/>쇠고기미역국(5.6.16)<br/>수제치즈돈가스(1.2.5.6.10.12.13)<br/>배추김치(9)<br/>생딸기그릭요거트(2)',
        CAL_INFO: '785.4 Kcal',
        NTR_INFO: '탄수화물(g): 102.4 / 단백질(g): 36.5 / 지방(g): 21.8'
      }
    },
    tomorrow: {
      title: '내일의 급식 (분식 데이)',
      rice: '🍙 참치마요 삼각밥',
      soup: '🍢 꼬치어묵 우동장국',
      main: '🌶️ 매콤달콤 쌀떡볶이',
      side: '🥟 바삭 모둠튀김',
      dessert: '🧃 유기농 청포도 주스',
      calorie: '812.0 Kcal',
      allergies: '난류(1), 대두(5), 밀(6), 생선(7)',
      raw: {
        DDISH_NM: '참치마요밥(1.5)<br/>꼬치어묵국(1.5.6)<br/>쌀떡볶이(5.6)<br/>모둠튀김(1.5.6)<br/>청포도주스',
        CAL_INFO: '812.0 Kcal',
        NTR_INFO: '탄수화물(g): 115.0 / 단백질(g): 28.2 / 지방(g): 24.1'
      }
    },
    yesterday: {
      title: '어제의 급식 (전통 한식)',
      rice: '🍚 찰기 가득 조밥',
      soup: '🍲 얼큰 꽃게 된장찌개',
      main: '🥩 돈육 간장 불고기',
      side: '🥬 시금치나물 & 깍두기',
      dessert: '🍊 달콤 꿀 감귤',
      calorie: '720.5 Kcal',
      allergies: '대두(5), 게(8), 돼지고기(10)',
      raw: {
        DDISH_NM: '차조밥<br/>꽃게된장찌개(5.6.8)<br/>돼지간장불고기(5.6.10)<br/>시금치무침<br/>깍두기(9)<br/>감귤',
        CAL_INFO: '720.5 Kcal',
        NTR_INFO: '탄수화물(g): 95.0 / 단백질(g): 32.0 / 지방(g): 18.5'
      }
    },
    weekend: null
  },
  gyeonggi: {
    schoolName: '판교AI중학교',
    today: {
      title: '오늘의 급식 (이탈리안)',
      rice: '🥖 따끈 마늘 바게트',
      soup: '🥣 단호박 크림스프',
      main: '🍝 눈꽃 로제 파스타',
      side: '🥗 수제 피클 & 샐러드',
      dessert: '🍎 착즙 사과에이드',
      calorie: '840.2 Kcal',
      allergies: '우유(2), 대두(5), 밀(6), 토마토(12)',
      raw: {
        DDISH_NM: '마늘바게트(2.5.6)<br/>단호박스프(2)<br/>로제파스타(1.2.5.6.12)<br/>수제피클<br/>사과에이드',
        CAL_INFO: '840.2 Kcal',
        NTR_INFO: '탄수화물(g): 110.5 / 단백질(g): 30.0 / 지방(g): 26.0'
      }
    },
    tomorrow: {
      title: '내일의 급식 (일품 비빔)',
      rice: '🥗 전주 찰비빔밥',
      soup: '🍲 맑은 콩나물국',
      main: '🍳 부드러운 달걀후라이',
      side: '🥟 고기 왕만두 찜',
      dessert: '🥛 저지방 칼슘우유',
      calorie: '750.0 Kcal',
      allergies: '난류(1), 우유(2), 대두(5), 밀(6), 돼지고기(10)',
      raw: {
        DDISH_NM: '전주비빔밥(5.6.16)<br/>콩나물국(5)<br/>계란후라이(1)<br/>고기만두(1.5.6.10)<br/>칼슘우유(2)',
        CAL_INFO: '750.0 Kcal',
        NTR_INFO: '탄수화물(g): 98.0 / 단백질(g): 35.0 / 지방(g): 19.0'
      }
    },
    yesterday: {
      title: '어제의 급식 (바비큐 특식)',
      rice: '🍚 렌틸콩 영양밥',
      soup: '🍲 감자 고추장찌개',
      main: '🍖 숯불 수제 떡갈비',
      side: '🥗 도토리묵 야채무침',
      dessert: '🍉 달콤 수박',
      calorie: '790.0 Kcal',
      allergies: '대두(5), 밀(6), 돼지고기(10)',
      raw: {
        DDISH_NM: '렌틸콩밥<br/>감자고추장찌개(5.6)<br/>수제떡갈비(1.5.6.10)<br/>도토리묵야채무침(5.6)<br/>수박',
        CAL_INFO: '790.0 Kcal',
        NTR_INFO: '탄수화물(g): 100.0 / 단백질(g): 34.0 / 지방(g): 22.0'
      }
    },
    weekend: null
  },
  busan: {
    schoolName: '해운대고등학교',
    today: {
      title: '오늘의 급식 (해산물 밥상)',
      rice: '🍚 고소한 기장밥',
      soup: '🍲 얼큰 부산 어묵탕',
      main: '🐟 삼치 데리야끼 구이',
      side: '🥬 아삭 파김치 & 콩나물',
      dessert: '🍌 바나나 푸딩',
      calorie: '760.8 Kcal',
      allergies: '대두(5), 밀(6), 생선(7)',
      raw: {
        DDISH_NM: '기장밥<br/>부산어묵탕(1.5.6)<br/>삼치구이(5.6)<br/>콩나물무침(5)<br/>파김치(9)<br/>바나나푸딩(1.2.5.6)',
        CAL_INFO: '760.8 Kcal',
        NTR_INFO: '탄수화물(g): 96.0 / 단백질(g): 38.0 / 지방(g): 17.5'
      }
    },
    tomorrow: {
      title: '내일의 급식 (치킨 특식)',
      rice: '🍚 잡곡밥',
      soup: '🍲 맑은 소고기 뭇국',
      main: '🍗 크리스피 순살치킨',
      side: '🥗 양배추 샐러드 & 깍두기',
      dessert: '🧃 감귤 주스',
      calorie: '830.0 Kcal',
      allergies: '난류(1), 대두(5), 밀(6), 닭고기(15)',
      raw: {
        DDISH_NM: '잡곡밥<br/>소고기무국(16)<br/>순살치킨(1.5.6.15)<br/>양배추샐러드(1.5)<br/>깍두기(9)<br/>감귤주스',
        CAL_INFO: '830.0 Kcal',
        NTR_INFO: '탄수화물(g): 105.0 / 단백질(g): 40.0 / 지방(g): 25.0'
      }
    },
    yesterday: {
      title: '어제의 급식 (든든 국밥)',
      rice: '🍚 따끈한 쌀밥',
      soup: '🍲 진한 돼지국밥',
      main: '🥩 부추 겉절이 & 수육',
      side: '🥬 섞박지 & 소면 사리',
      dessert: '🍎 꿀 사과',
      calorie: '810.0 Kcal',
      allergies: '대두(5), 밀(6), 돼지고기(10)',
      raw: {
        DDISH_NM: '쌀밥<br/>돼지국밥(10)<br/>수육&부추무침(5.6.10)<br/>소면사리(6)<br/>섞박지(9)<br/>사과',
        CAL_INFO: '810.0 Kcal',
        NTR_INFO: '탄수화물(g): 102.0 / 단백질(g): 42.0 / 지방(g): 23.0'
      }
    },
    weekend: null
  },
  sejong: {
    schoolName: '미래소프트웨어고',
    today: {
      title: '오늘의 급식 (개발자 파워팩)',
      rice: '🍚 강황 카레라이스',
      soup: '🥣 미소 유부된장국',
      main: '🍗 왕새우튀김 & 타르타르',
      side: '🥗 그린 비타민 샐러드',
      dessert: '🥤 비타민 음료',
      calorie: '795.0 Kcal',
      allergies: '난류(1), 대두(5), 밀(6), 새우(9)',
      raw: {
        DDISH_NM: '강황카레라이스(5.6.10)<br/>유부된장국(5.6)<br/>왕새우튀김(1.5.6.9)<br/>비타민샐러드(1.5)<br/>비타민음료',
        CAL_INFO: '795.0 Kcal',
        NTR_INFO: '탄수화물(g): 108.0 / 단백질(g): 31.0 / 지방(g): 22.5'
      }
    },
    tomorrow: {
      title: '내일의 급식 (바비큐 데이)',
      rice: '🍚 귀리밥',
      soup: '🍲 순두부 짬뽕국',
      main: '🍖 수제 바비큐 폭립',
      side: '🥗 콘샐러드 & 겉절이',
      dessert: '🍦 소프트 아이스크림',
      calorie: '850.0 Kcal',
      allergies: '우유(2), 대두(5), 밀(6), 돼지고기(10)',
      raw: {
        DDISH_NM: '귀리밥<br/>순두부짬뽕국(5.6.9.10.17)<br/>바비큐폭립(5.6.10)<br/>콘샐러드(1.5)<br/>겉절이(9)<br/>아이스크림(2)',
        CAL_INFO: '850.0 Kcal',
        NTR_INFO: '탄수화물(g): 112.0 / 단백질(g): 36.0 / 지방(g): 27.0'
      }
    },
    yesterday: {
      title: '어제의 급식 (영양 솥밥)',
      rice: '🍄 표고버섯 영양밥',
      soup: '🍲 배추 맑은 된장국',
      main: '🥩 언양식 불고기',
      side: '🥗 연근 조림 & 깍두기',
      dessert: '🍇 씨없는 청포도',
      calorie: '730.0 Kcal',
      allergies: '대두(5), 밀(6), 쇠고기(16)',
      raw: {
        DDISH_NM: '버섯영양밥<br/>배추된장국(5.6)<br/>언양식불고기(5.6.16)<br/>연근조림(5.6)<br/>깍두기(9)<br/>청포도',
        CAL_INFO: '730.0 Kcal',
        NTR_INFO: '탄수화물(g): 97.0 / 단백질(g): 33.0 / 지방(g): 19.0'
      }
    },
    weekend: null
  }
};

export default function Lesson14() {
  // 스테이지 및 우측 탭 상태
  const [activeStage, setActiveStage] = useState<StageTab>('stage1');
  const [activeRightTab, setActiveRightTab] = useState<RightConsoleTab>('tray');

  // 급식 시뮬레이터 상태
  const [schoolKey, setSchoolKey] = useState<SchoolKey>('seoul');
  const [selectedDate, setSelectedDate] = useState<DateKey>('today');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('배달 대기 중 💤');
  const [isAllergyHighlighted, setIsAllergyHighlighted] = useState<boolean>(false);

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
    const savedCompleted = localStorage.getItem('ai_lesson_14_completed');
    if (savedCompleted === 'true') {
      setCheckedItems([true, true, true, true, true, true]);
      setIsCompleted(true);
    }

    const savedQ1 = localStorage.getItem('ai_lesson_14_reflection_q1');
    const savedQ2 = localStorage.getItem('ai_lesson_14_reflection_q2');
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
      localStorage.setItem('ai_lesson_14_completed', 'true');
    }
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  // 급식 데이터 가져오기 시뮬레이션
  const handleFetchLunch = () => {
    setIsFetching(true);
    setDeliveryStatus('나이스 통신 중... 🚚');

    setTimeout(() => {
      setIsFetching(false);
      if (selectedDate === 'weekend') {
        setDeliveryStatus('배달 완료 (200 OK / 주말) 🏖️');
      } else {
        setDeliveryStatus('배달 완료 (200 OK) 🎉');
      }
    }, 350);
  };

  // 프롬프트 복사
  const handleCopyPrompt = () => {
    const promptText = `교육청 나이스(NEIS) 급식 API(mealServiceDietInfo)에서 가져온 JSON 데이터를 파싱하는 자바스크립트 함수를 작성해줘.

[필수 조건]
1. async/await와 fetch를 사용해 주어진 교육청코드, 학교코드, 날짜로 요청을 보낼 것.
2. 중첩된 mealServiceDietInfo[1].row[0] 객체에서 DDISH_NM(식단)과 CAL_INFO(칼로리)를 안전하게 꺼낼 것.
3. 식단 문자열에 포함된 <br/> 태그를 기준으로 나누고, (1.2.5.6) 같은 알레르기 번호는 정규표현식 replace(/\\([0-9.]+\\)/g, '')로 깨끗이 지워 배열로 반환할 것.
4. 주말이나 방학으로 급식이 없을 경우(data.mealServiceDietInfo가 없음) '오늘은 급식이 없는 날이에요'라는 친절한 안내 메시지를 반환하는 예외 처리를 반드시 포함할 것.`;

    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);
    });
  };

  // 회고 저장
  const handleReflectionChange = (q: 'q1' | 'q2', val: string) => {
    if (q === 'q1') {
      setReflectionQ1(val);
      localStorage.setItem('ai_lesson_14_reflection_q1', val);
    } else {
      setReflectionQ2(val);
      localStorage.setItem('ai_lesson_14_reflection_q2', val);
    }
    setSaveIndicator('자동 저장됨');
  };

  const currentSchoolData = MEAL_DATABASE[schoolKey];
  const currentMeal = currentSchoolData[selectedDate];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ======================================================================= */}
      {/* [상단 GNB] 과정 홈 | 시즌 4 · 14강 타이틀 | 4단계 스텝퍼 | 진척도 & 언락 뱃지 */}
      {/* ======================================================================= */}
            <header className="sticky top-0 z-50 flex-none h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-[1720px] h-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <a
                href="../../index.html"
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 font-bold"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span className="text-xs sm:text-sm font-bold">홈</span>
              </a>
              <span className="text-slate-300">/</span>
              <a href="../13-open-api/index.html" className="px-2.5 py-1 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex">13강 오픈 API</a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 whitespace-nowrap">14강 학교 급식표 API</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-600">완료 게이지</span>
              <span id="header-progress-text" className="text-emerald-600 font-mono font-bold text-xs">{progressPercent}%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  id="header-progress-fill"
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* 4단계 퀘스트 스텝퍼 (데스크톱 전용 네비게이션) */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80" aria-label="학습 단계 네비게이션">
                <button
                  type="button"
                  onClick={() => setActiveStage('stage1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage1'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">1</span>
                  <span>공공 급식 데이터</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage2'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">2</span>
                  <span>물음표 쪽지(Query)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage3')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage3'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">3</span>
                  <span>도시락통 파싱</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStage === 'stage4'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">4</span>
                  <span>식판 렌더링 & 방어</span>
                </button>
              </nav>
            </div>

            {isCompleted ? (
              <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                <Unlock className="w-3.5 h-3.5" />
                <span>15강 언락!</span>
              </div>
            ) : (
              <div id="header-unlock-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>15강 잠김</span>
              </div>
            )}
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
        <section className="lg:col-span-7 xl:col-span-7 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3 custom-scrollbar" aria-label="퀘스트 콘텐츠 패널">
          {/* ========================================================================= */}
          {/* [STAGE 1: 공공 급식 데이터] */}
          {/* ========================================================================= */}
          {activeStage === 'stage1' && (
            <div className="space-y-6">
              {/* 1. 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-slate-50 border border-emerald-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  실생활 오픈 API 프로젝트
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  회원가입 & API 키 없는 100% 무료
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                오늘 점심 메뉴는 뭘까?<br />
                교육청 데이터로 실시간 급식 알리미 만들기
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                13강에서 익힌 비밀 배달부 <code className="px-1.5 py-0.5 rounded bg-slate-100 text-emerald-700 font-mono font-bold text-xs">fetch()</code>를 타고 이제 진짜 대한민국 교육청 서버로 출동합니다! 전국 1만 개 초·중·고등학교의 영양사 선생님들이 매일 아침 올려주시는 나이스(NEIS) 오픈 데이터로 우리 학교 급식 식판 웹앱을 직접 만들어보아요.
              </p>

              {/* 4대 메타 그리드 (15.6인치 최적화) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">소요 시간</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">약 40분</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">난이도</span>
                  <strong className="text-xs font-bold text-emerald-700 leading-snug whitespace-nowrap">실전 레벨 4 ★★★★☆</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">실습 도구</span>
                  <strong className="text-xs font-bold text-slate-900 leading-snug whitespace-nowrap">NEIS 교육청 오픈 API</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold block leading-tight whitespace-nowrap">최종 산출물</span>
                  <strong className="text-xs font-bold text-indigo-700 leading-snug whitespace-nowrap">실시간 급식 식판 앱</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 1: 미션 브리핑 & 4대 성공 루브릭 */}
          {/* ------------------------------------------------------------------- */}

              <div id="stage1" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 1: 미션 브리핑 (점심시간 10분 전! 🔔)
                </h3>
                <span className="text-xs text-slate-500">배에서 꼬르륵 소리가 날 때, 친구들이 가장 먼저 켜보는 특급 웹앱</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 font-bold">"오늘 급식 메뉴는 과연 돈가스일까, 카레라이스일까?"</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    매일 아침 복도 게시판까지 걸어갈 필요 없이, 내가 직접 만든 웹앱에 접속해 우리 학교 이름과 오늘 날짜만 고르면 김이 모락모락 나는 급식 식판이 화면에 짠 나타나는 알리미를 구현합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 4대 성공 루브릭 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>이번 퀘스트의 4대 성공 루브릭 (성공 판정 기준)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1. 공공 데이터(NEIS) 연동</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    교육청 나이스 급식 API의 공식 엔드포인트에 성공적으로 접속하여 원격 JSON 패킷을 수신합니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. 물음표 쪽지(Query) 전달</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    교육청 코드, 학교 표준 코드, 날짜 파라미터를 물음표(?) 뒤에 조합하여 원하는 학교의 식단만 정확히 배달받습니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. 중첩 도시락통(JSON) 파싱</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    복잡하게 겹쳐진 배열과 객체 계층(<code className="text-emerald-700 font-mono">mealServiceDietInfo[1].row[0]</code>)을 뚫고 진짜 식단 텍스트를 꺼냅니다.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>4. 껍질 정제 & 예외 방어</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    알레르기 유발 번호와 HTML 태그 찌꺼기를 정규표현식으로 정제하고, 주말/방학 시 친절한 안내 화면을 띄웁니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

              {/* Stage 1 Bottom Navigation */}
              <div className="flex justify-end items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage2');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 2 물음표 쪽지(Query)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 2: 물음표 쪽지(Query)] */}
          {/* ========================================================================= */}
          {activeStage === 'stage2' && (
            <div className="space-y-6">
              <div id="stage2" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 2: 핵심 원리 (물음표 쪽지와 중첩 도시락통)
                </h3>
                <span className="text-xs text-slate-500">배달부에게 자세한 주문서 쪽지를 건네고, 포장을 벗겨내는 기술</span>
              </div>
            </div>

            {/* 개념 1: 쿼리 파라미터 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">1. 물음표 뒤의 보물 지도: 쿼리 파라미터 (Query Parameter)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                비밀 배달부에게 그냥 "교육청 다녀와!"라고만 하면 전국 어느 학교의 몇 월 며칠 급식을 가져와야 할지 알 수 없어요. 그래서 주소 뒤에 물음표(<code className="font-mono text-emerald-700 font-bold">?</code>)를 붙이고 주문 쪽지를 꽂아 보냅니다!
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-2 overflow-x-auto border border-slate-800">
                <div className="text-slate-400">// 배달부 주소와 물음표(?) 쪽지</div>
                <div>
                  <span className="text-emerald-400">https://open.neis.go.kr/hub/mealServiceDietInfo</span><span className="text-amber-300 font-bold">?</span><br />
                  &nbsp;&nbsp;<span className="text-sky-300">Type</span>=<span className="text-amber-200">json</span><span className="text-slate-400">&amp;</span><br />
                  &nbsp;&nbsp;<span className="text-sky-300">ATPT_OFCDC_SC_CODE</span>=<span className="text-amber-200">B10</span><span className="text-slate-400">&amp;</span> <span className="text-slate-500">// 서울특별시교육청</span><br />
                  &nbsp;&nbsp;<span className="text-sky-300">SD_SCHUL_CODE</span>=<span className="text-amber-200">7010578</span><span className="text-slate-400">&amp;</span> <span className="text-slate-500">// 우리 학교 고유 번호</span><br />
                  &nbsp;&nbsp;<span className="text-sky-300">MLSV_YMD</span>=<span className="text-amber-200">20261101</span> <span className="text-slate-500">// 2026년 11월 1일 급식</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-600 text-xs">? (물음표)</span>
                  <span>"여기서부터 주문 쪽지 시작입니다!"</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-600 text-xs">&amp; (앰퍼샌드)</span>
                  <span>"다음 주문 항목으로 넘어가세요!"</span>
                </div>
              </div>
            </div>

            {/* 개념 2: 중첩 JSON 파싱 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">2. 러시아 마트료시카 같은 중첩 도시락통 (Nested JSON)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                나이스 교육청 서버에서 배달된 택배 상자를 열어보면, 상자 속에 작은 상자가 있고 그 속에 편지 봉투가 들어있는 것처럼 여러 겹으로 포장되어 있습니다. 이 포장을 차례대로 벗겨야 진짜 요리 이름이 나와요!
              </p>

              {/* 계층 구조 다이어그램 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">1단계</span>
                  <span>data.<strong className="text-emerald-700">mealServiceDietInfo</strong></span>
                  <span className="text-slate-400 text-[11px]">➔ 거대한 나이스 급식 보물상자</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-mono pl-4 border-l-2 border-emerald-300">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">2단계</span>
                  <span>[1].<strong className="text-amber-700">row</strong></span>
                  <span className="text-slate-400 text-[11px]">➔ 0번째 헤더 상자를 지나 진짜 식단 목록 서랍</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-mono pl-8 border-l-2 border-amber-300">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[11px]">3단계</span>
                  <span>[0].<strong className="text-indigo-700">DDISH_NM</strong></span>
                  <span className="text-slate-400 text-[11px]">➔ 드디어 나타난 오늘의 따끈따끈한 메뉴 문자열!</span>
                </div>
              </div>
            </div>

            {/* 개념 3: 요리용 체로 껍질 거르기 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">3. 요리용 체로 껍질 거르기: 정규표현식 데이터 정제 (Regex)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                원문 메뉴를 열어보면 <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-xs">돈육불고기(10)&lt;br/&gt;배추김치(9)</code>처럼 괄호 속 알레르기 번호와 줄바꿈 HTML 태그가 덕지덕지 붙어 있습니다. 요리용 체(정규식)로 찌꺼기를 걸러내야 식판에 깨끗하게 담을 수 있어요.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-1.5">
                <div className="text-slate-400">// 알레르기 번호 괄호 (1.2.5.6) 깔끔히 지우기</div>
                <div className="text-emerald-400">
                  const cleanMenu = rawMenu.<span className="text-amber-300">replace</span>(<span className="text-rose-400">/\([0-9.]+\)/g</span>, '');
                </div>
                <div className="text-slate-400 pt-1">// 줄바꿈 태그 &lt;br/&gt; 기준으로 반찬별 쪼개기</div>
                <div className="text-emerald-400">
                  const menuList = cleanMenu.<span className="text-amber-300">split</span>('<span className="text-sky-300">&lt;br/&gt;</span>');
                </div>
              </div>
            </div>
          </div>

              {/* 우측 급식 식판 연동 알림 카드 */}
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
                      지금 우측 콘솔의 [급식 식판]에서 오늘 메뉴를 확인하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    방금 배운 물음표 쪽지(Query String)와 공공 API 연동을 시험해 보세요. 우측 콘솔의 <strong>[급식 식판]</strong>에서 날짜와 학교를 선택하고 급식 정보 불러오기를 눌러 맛있는 메뉴가 식판에 담기는 모습을 직접 확인해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('tray')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [급식 식판] 탭 바로 열기</span>
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
                  ← 이전: Stage 1 공공 급식 데이터
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage3');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 3 도시락통 파싱</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 3: 도시락통 파싱] */}
          {/* ========================================================================= */}
          {activeStage === 'stage3' && (
            <div className="space-y-6">
              <div id="stage3" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 3: 비교 실험 & 실전 프롬프트 공작소
                </h3>
                <span className="text-xs text-slate-500">날것의 지저분한 데이터와 정제된 식판의 차이를 눈으로 확인하기</span>
              </div>
            </div>

            {/* 비교 테이블 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 whitespace-nowrap">구분</th>
                    <th className="p-3">서버에서 날아온 원문 데이터 (Raw)</th>
                    <th className="p-3 text-emerald-700">AI 정제 후 최종 식판 데이터</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">밥 & 국</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">친환경흑미밥&lt;br/&gt;쇠고기미역국(5.6.16)</td>
                    <td className="p-3 font-semibold text-slate-800">🍚 친환경 흑미밥, 🍲 쇠고기 미역국</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">메인 반찬</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">수제치즈돈가스(1.2.5.6.10.12.13)&lt;br/&gt;돈가스소스</td>
                    <td className="p-3 font-semibold text-slate-800">🍖 수제 눈꽃 치즈 돈가스</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">반찬 & 후식</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">배추김치(9)&lt;br/&gt;생딸기그릭요거트(2)</td>
                    <td className="p-3 font-semibold text-slate-800">🥗 아삭 김치, 🍓 생딸기 요거트</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">열량 (칼로리)</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">"CAL_INFO": "785.4 Kcal"</td>
                    <td className="p-3 font-bold text-emerald-600">🔥 785.4 Kcal 든든 뱃지</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI 실전 프롬프트 원클릭 복사 카드 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <strong className="text-xs sm:text-sm font-bold text-emerald-200">AI 코딩 도우미에게 건넬 실전 프롬프트</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold transition-all text-white shadow-xs cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? '복사됨! ✨' : '프롬프트 복사'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed select-all">
{`교육청 나이스(NEIS) 급식 API(mealServiceDietInfo)에서 가져온 JSON 데이터를 파싱하는 자바스크립트 함수를 작성해줘.

[필수 조건]
1. async/await와 fetch를 사용해 주어진 교육청코드, 학교코드, 날짜로 요청을 보낼 것.
2. 중첩된 mealServiceDietInfo[1].row[0] 객체에서 DDISH_NM(식단)과 CAL_INFO(칼로리)를 안전하게 꺼낼 것.
3. 식단 문자열에 포함된 <br/> 태그를 기준으로 나누고, (1.2.5.6) 같은 알레르기 번호는 정규표현식 replace(/\\([0-9.]+\\)/g, '')로 깨끗이 지워 배열로 반환할 것.
4. 주말이나 방학으로 급식이 없을 경우(data.mealServiceDietInfo가 없음) '오늘은 급식이 없는 날이에요'라는 친절한 안내 메시지를 반환하는 예외 처리를 반드시 포함할 것.`}
              </pre>
            </div>
          </div>

              {/* 우측 데이터 비교 연동 알림 카드 */}
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
                      식판을 채웠다면 우측 [데이터 비교] 탭에서 원문을 해부하세요!
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    복잡한 중첩 객체(JSON)에서 알레르기 번호와 칼로리 정보가 어떻게 추출되는지 확인하셨나요? 우측 콘솔의 <strong>[데이터 비교]</strong> 탭에서 원문 데이터와 정제된 식판 카드를 비교하며 파싱 과정을 완벽히 이해해 보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('inspect')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [데이터 비교] 탭 바로 열기</span>
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
                  ← 이전: Stage 2 물음표 쪽지(Query)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStage('stage4');
                    const lp = document.querySelector('[aria-label="퀘스트 콘텐츠 패널"]') || document.querySelector('.lg\\:col-span-7');
                    if (lp) lp.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>다음: Stage 4 식판 렌더링 &amp; 방어</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [STAGE 4: 식판 렌더링 &amp; 방어] */}
          {/* ========================================================================= */}
          {activeStage === 'stage4' && (
            <div className="space-y-6">
              <div id="stage4" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Stage 4: 오류 연구소 (주말·방학 예외 방어 & 배움 회고)
                </h3>
                <span className="text-xs text-slate-500">데이터가 없어도 웹앱이 멈추지 않도록 지켜주는 방패 만들기</span>
              </div>
            </div>

            {/* 예외 방어 2대 비법 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>방패 1: 토요일·일요일 주말 방어</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  주말에 나이스 API를 부르면 <code className="text-amber-800 font-mono">INFO-200: 데이터가 없습니다</code> 응답이 옵니다. 이때 에러가 터지지 않도록 "오늘은 달콤한 주말이에요! 집밥을 맛있게 드세요 🏖️" 화면을 띄워줍니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>방패 2: 학교 코드 오타 방어</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  학교 코드를 잘못 입력하면 서버가 400 에러를 보냅니다. <code className="text-sky-800 font-mono">try ... catch</code> 블록으로 오류를 낚아채서 "학교 번호를 다시 확인해주세요" 토스트 창을 띄워줍니다.
                </p>
              </div>
            </div>

            {/* 주니어 개발자 성찰 회고 폼 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <strong className="text-xs sm:text-sm font-bold text-slate-900">주니어 개발자 14강 배움 회고 노트</strong>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{saveIndicator}</span>
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="ref-q1" className="block text-xs font-bold text-slate-700 mb-1">
                    Q1. 오늘 공공 API에서 가져온 데이터를 정제하면서 가장 신기했던 점은 무엇인가요?
                  </label>
                  <textarea
                    id="ref-q1"
                    rows={2}
                    value={reflectionQ1}
                    onChange={(e) => handleReflectionChange('q1', e.target.value)}
                    placeholder="예: 괄호 속에 알레르기 번호가 숨어있는 줄 몰랐는데, 정규표현식으로 1초 만에 지우는 게 정말 신기했어요!"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="ref-q2" className="block text-xs font-bold text-slate-700 mb-1">
                    Q2. 다음엔 또 어떤 공공 데이터를 가져와 나만의 웹앱을 만들어보고 싶나요?
                  </label>
                  <textarea
                    id="ref-q2"
                    rows={2}
                    value={reflectionQ2}
                    onChange={(e) => handleReflectionChange('q2', e.target.value)}
                    placeholder="예: 우리 동네 버스가 언제 오는지 알려주는 버스 도착 알리미나, 미세먼지 수치를 알려주는 환경 지킴이 앱을 만들어보고 싶어요."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

              {/* [실습 지시] 우측 체크리스트 및 15강 언락 알림 */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-400/40 uppercase">
                    FINAL GATE · 3단계 최종 관문
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-bold">마지막 단계!</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5"><ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />회고를 마쳤다면 우측 [체크리스트]를 완료하고 15강을 여세요!</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    오늘 조립한 6대 급식 식단표 파싱과 알레르기 영양소 분류 기준을 스스로 점검할 시간입니다. 우측 콘솔의 <strong>[체크리스트]</strong> 6개 항목을 모두 체크하면 15강(포켓몬 도감 검색 라이브러리)이 즉시 열립니다!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('checklist')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <span>우측 [체크리스트 & 15강 언락] 탭 바로 열기</span>
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
                  ← 이전: Stage 3 도시락통 파싱
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
                  JUNIOR DEVELOPER GLOSSARY · 14강 전문 용어 도감
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  💡 본문은 쉬운 말로 쏙쏙! 더 깊이 알고 싶을 땐 여기서 확인하세요.
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🔍 주니어 개발자를 위한 전문 용어 돋보기</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                오늘 수업에서 배운 재미있는 원리들, 실제 컴퓨터 과학자들과 데이터 엔지니어들은 어떤 멋진 전문 용어로 부를까요? 궁금한 친구들은 아래의 전문 지식을 돋보기로 들여다보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 용어 1: 공공 데이터 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-amber-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-amber-400" />
                      1. 공공 데이터
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Public Open Data</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700 font-mono flex-shrink-0">공공/오픈데이터</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "국민의 세금으로 만든 정부의 거대한 보물 창고! 누구나 신청하면 급식 메뉴, 날씨, 버스 위치를 무료로 열어볼 수 있는 데이터 상자!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 정부와 공공기관이 생성하거나 취득하여 관리하는 디지털 형태의 데이터로, 국민 누구에게나 개방되어 영리적·비영리적 활용이 보장된 공공 정보 자산입니다.
                </p>
              </div>
              {/* 용어 2: 쿼리 파라미터 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-sky-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-sky-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-sky-400" />
                      2. 쿼리 파라미터
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Query Parameter (URL Search Params)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-200 border border-sky-700 font-mono flex-shrink-0">URL/요청 규격</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "배달부의 주머니에 넣어주는 물음표(?) 쪽지! '내일 날짜 급식으로, 2학년 3반 메뉴만 골라주세요!' 하고 주문 옵션을 덧붙이는 마법 쪽지!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 웹 주소(URL) 끝에 물음표(?)를 시작으로 '키=값' 쌍 형태로 덧붙여, 서버에 특정 조건(필터링, 페이징, 검색어 등)을 전달하는 HTTP 요청 매개변수입니다.
                </p>
              </div>
              {/* 용어 3: 데이터 정제 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-emerald-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      3. 데이터 정제
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Data Cleansing & Sanitization</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono flex-shrink-0">데이터 가공</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "밭에서 갓 뽑은 당근에 묻은 흙을 털고 껍질을 깎아 먹기 좋게 씻어내는 주방장 이모의 깔끔 손질법!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 수신한 원천 데이터(Raw Data)에 포함된 불필요한 태그, 특수문자, 결측치(Null), 오탈자를 제거하고 사용자가 읽기 좋은 표준 형식으로 가공하는 데이터 정제 작업입니다.
                </p>
              </div>
              {/* 용어 4: 정규표현식 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-purple-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-purple-400" />
                      4. 정규표현식
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">외래어·영문: 정규표현식 (Regular Expression / Regex)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700 font-mono flex-shrink-0">문자열/패턴매칭</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "글자 세상의 마법 만능 돋보기! 아무리 복잡한 글 속에서도 괄호 속 글자나 알레르기 번호만 콕콕 집어 쏙 뽑아내거나 지워주는 스캐너!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 문자열 안에서 특정한 규칙이나 패턴(숫자, 기호, 이메일, 괄호 등)을 정의하여, 해당 패턴과 일치하는 텍스트를 검색, 치환, 추출할 수 있도록 지원하는 정형 언어 표현식입니다.
                </p>
              </div>
              {/* 용어 5: 중첩 데이터 구조 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-rose-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-rose-400" />
                      5. 중첩 데이터 구조
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Nested Object & Array (Tree Data)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700 font-mono flex-shrink-0">자료구조</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "큰 상자 속에 서랍이 있고, 그 서랍 속에 작은 봉투가 들어있는 러시아 마트료시카 인형 같은 데이터 정리함!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 객체(Object) 안에 또 다른 객체나 배열(Array)이 계층적으로 포함된 복합 트리 구조로, 복잡한 현실 세계의 연관 관계 정보를 단일 JSON 파일에 체계적으로 담아냅니다.
                </p>
              </div>
              {/* 용어 6: 예외 처리 */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2.5 hover:border-teal-400/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-teal-400" />
                      6. 예외 처리
                    </span>
                    <span className="text-[11px] font-mono text-indigo-200 font-medium block pl-5.5">영문: Exception Handling & Fallback UI</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700 font-mono flex-shrink-0">안전성/방어코드</span>
                </div>
                <div className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                  <span>🧸 <strong className="text-amber-200 font-bold">어린이 비유:</strong> "주말에 식당 문이 닫혀 있어도 당황하지 않고 '오늘은 쉬는 날이에요' 안내판을 얌전히 세워두는 안전 센서!"</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  <strong className="text-white font-bold">🎓 개발자 공식 정의:</strong> 데이터 부재, 네트워크 단절, 오타 등 예상치 못한 오류(Exception)가 발생했을 때 프로그램이 멈추거나 튕기지 않고 안전한 대체 화면(Fallback)을 제공하는 방어적 프로그래밍 기법입니다.
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
    </section>

        {/* --------------------------------------------------------------------- */}
        {/* ■ 우측 패널 (40% 폭): 인터랙티브 실습 콘솔 (독립 슬라이드바) */}
        {/* --------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 xl:col-span-5 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          {/* 3단 탭 네비게이션 헤더 */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setActiveRightTab('tray')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'tray'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>급식 식판</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('inspect')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'inspect'
                  ? 'bg-emerald-600 text-white shadow-xs'
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
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>점검표</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: 🍱 실시간 급식 식판 대시보드 콘솔 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'tray' && (
            <div className="space-y-4">
              {/* 컨트롤러 카드 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <School className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">우리 학교 급식 찾기</strong>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isFetching
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : deliveryStatus.includes('200')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {deliveryStatus}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* 학교 선택 드롭다운 */}
                  <div>
                    <label htmlFor="react-select-school" className="block text-[11px] font-bold text-slate-700 mb-1">
                      학교 선택 (교육청 및 표준 학교 코드)
                    </label>
                    <select
                      id="react-select-school"
                      value={schoolKey}
                      onChange={(e) => setSchoolKey(e.target.value as SchoolKey)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    >
                      <option value="seoul">[서울] 서울초등학교 (코드: 7010578)</option>
                      <option value="gyeonggi">[경기] 판교AI중학교 (코드: 7530123)</option>
                      <option value="busan">[부산] 해운대고등학교 (코드: 7150456)</option>
                      <option value="sejong">[세종] 미래소프트웨어고 (코드: 9300789)</option>
                    </select>
                  </div>

                  {/* 날짜 선택 버튼 그룹 */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-1">급식 날짜 선택</span>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                      {(['today', 'tomorrow', 'yesterday', 'weekend'] as DateKey[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                            selectedDate === d
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {d === 'today' && '오늘 (특식)'}
                          {d === 'tomorrow' && '내일 (분식)'}
                          {d === 'yesterday' && '어제 (한식)'}
                          {d === 'weekend' && '주말 (휴일)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 배달 실행 버튼 */}
                  <button
                    type="button"
                    onClick={handleFetchLunch}
                    disabled={isFetching}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>🍱 실시간 급식 배달 출발!</span>
                  </button>
                </div>
              </div>

              {/* 🍱 비주얼 5칸 급식 식판 UI */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">
                      {currentMeal
                        ? `${currentSchoolData.schoolName} - ${currentMeal.title}`
                        : `${currentSchoolData.schoolName} (휴일)`}
                    </strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    🔥 {currentMeal ? currentMeal.calorie : '0 Kcal'}
                  </span>
                </div>

                {/* 은색 식판 컨테이너 */}
                <div className="p-4 rounded-2xl bg-slate-100 border-2 border-slate-300 shadow-inner space-y-3">
                  {currentMeal ? (
                    <>
                      {/* 윗줄 3칸 */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-center min-h-[78px] flex flex-col justify-center items-center">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">밥 (주식)</span>
                          <span className="text-xs font-bold text-slate-900">{currentMeal.rice}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-center min-h-[78px] flex flex-col justify-center items-center">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">국 / 찌개</span>
                          <span className="text-xs font-bold text-slate-900">{currentMeal.soup}</span>
                        </div>
                        <div
                          className={`p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-center min-h-[78px] flex flex-col justify-center items-center transition-all ${
                            isAllergyHighlighted ? 'ring-2 ring-amber-400 bg-amber-50/50' : ''
                          }`}
                        >
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">후식 / 과일</span>
                          <span className="text-xs font-bold text-slate-900">{currentMeal.dessert}</span>
                        </div>
                      </div>

                      {/* 아랫줄 2칸 */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div
                          className={`p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-center min-h-[85px] flex flex-col justify-center items-center transition-all ${
                            isAllergyHighlighted ? 'ring-2 ring-rose-400 bg-rose-50/50' : ''
                          }`}
                        >
                          <span className="text-[10px] text-emerald-600 font-bold block mb-0.5">메인 요리</span>
                          <span className="text-xs font-bold text-slate-900">{currentMeal.main}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-center min-h-[85px] flex flex-col justify-center items-center">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">반찬 & 김치</span>
                          <span className="text-xs font-bold text-slate-900">{currentMeal.side}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
                      <span className="text-xs font-bold text-amber-900 block">오늘은 맛있는 주말 / 방학이에요! 🏖️</span>
                      <span className="text-[11px] text-amber-700">학교 급식이 운영되지 않는 날입니다. 집밥을 맛있게 드세요.</span>
                    </div>
                  )}
                </div>

                {/* 알레르기 안내 뱃지 바 */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {currentMeal ? `알레르기 정보: ${currentMeal.allergies}` : '알레르기 정보: 주말/방학 급식 미운영'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAllergyHighlighted(!isAllergyHighlighted)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    {isAllergyHighlighted ? '강조 해제' : '내 알레르기 강조'}
                  </button>
                </div>
              </div>

              {/* 📡 오픈 API 통신 & 데이터 정제 3단계 흐름 카드 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>실시간 급식 API 처리 3단계 파이프라인</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-slate-800 block">쪽지 전송</strong>
                    <span className="text-slate-500 text-[10px]">?SD_SCHUL=...</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-slate-800 block">도시락 파싱</strong>
                    <span className="text-slate-500 text-[10px]">[1].row[0]</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-slate-800 block">정규식 정제</strong>
                    <span className="text-slate-500 text-[10px]">replace(/\(..\)/)</span>
                  </div>
                </div>
              </div>

              {/* 💡 급식 알리미 4대 골든 룰 요약 카드 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>급식 알리미 4대 핵심 공식 요약</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">물음표(?)로 쪽지 시작, &amp;로 쪽지 연결</strong>
                      <span className="text-slate-400">원하는 교육청과 학교 코드, 날짜를 정확한 쿼리 파라미터로 적어 보내세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">[1].row[0] 2번째 서랍 공략</strong>
                      <span className="text-slate-400">나이스 급식 데이터는 헤더 다음 1번째 인덱스의 row 배열에 숨어있어요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">정규표현식으로 알레르기 번호 껍질 벗기기</strong>
                      <span className="text-slate-400">replace(/\([0-9.]+\)/g, '')로 괄호와 번호를 1초 만에 걸러내세요.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <div>
                      <strong className="text-white block">주말·방학엔 예외 방패(Fallback) 발동</strong>
                      <span className="text-slate-400">데이터가 없어도 에러 대신 "즐거운 주말!" 안내창을 띄워 완성도를 높여요.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: 🧾 원문 JSON vs 정제 비교 돋보기 */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'inspect' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">원문 패킷 vs 정제 객체</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {compareMode === 'raw' ? 'Raw String View' : 'Cleaned View'}
                  </span>
                </div>

                {/* 보기 모드 토글 */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCompareMode('raw')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                      compareMode === 'raw'
                        ? 'bg-white text-emerald-700 shadow-xs'
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
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    정제된 객체 (Cleaned)
                  </button>
                </div>

                {/* 패킷 메타 정보 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <strong className="text-slate-800">NEIS Open API Hub</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format:</span>
                    <strong className="text-slate-800">application/json</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parsed Items:</span>
                    <strong className="text-slate-800">{currentMeal ? '5개 메뉴 항목' : '0개 항목 (휴일)'}</strong>
                  </div>
                </div>

                {/* 코드/데이터 뷰어 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {compareMode === 'raw' ? '나이스 교육청 원문 패킷 (Raw DDISH_NM String)' : '정제된 JavaScript 데이터 객체'}
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {compareMode === 'raw'
                      ? JSON.stringify(
                          currentMeal
                            ? {
                                mealServiceDietInfo: [
                                  { head: [{ list_total_count: 1 }, { RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리' } }] },
                                  {
                                    row: [
                                      {
                                        SCHUL_NM: currentSchoolData.schoolName,
                                        MLSV_YMD: '20261101',
                                        DDISH_NM: currentMeal.raw.DDISH_NM,
                                        CAL_INFO: currentMeal.raw.CAL_INFO,
                                        NTR_INFO: currentMeal.raw.NTR_INFO
                                      }
                                    ]
                                  }
                                ]
                              }
                            : {
                                RESULT: {
                                  CODE: 'INFO-200',
                                  MESSAGE: '해당하는 데이터가 없습니다. (주말 또는 방학)'
                                }
                              },
                          null,
                          2
                        )
                      : JSON.stringify(
                          currentMeal
                            ? {
                                schoolName: currentSchoolData.schoolName,
                                date: '2026-11-01',
                                calorie: currentMeal.calorie,
                                menuList: [
                                  currentMeal.rice.replace(/^[^\s]+\s/, ''),
                                  currentMeal.soup.replace(/^[^\s]+\s/, ''),
                                  currentMeal.main.replace(/^[^\s]+\s/, ''),
                                  currentMeal.side.replace(/^[^\s]+\s/, ''),
                                  currentMeal.dessert.replace(/^[^\s]+\s/, '')
                                ],
                                allergyInfo: currentMeal.allergies
                              }
                            : {
                                schoolName: currentSchoolData.schoolName,
                                date: '2026-11-01',
                                message: '오늘은 급식이 없는 주말/방학입니다.'
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
          {/* TAB 3: ✅ 자가 점검 체크리스트 (6문항 & 15강 언락) */}
          {/* ------------------------------------------------------------------- */}
          {activeRightTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900 block">14강 자가 점검 체크리스트</strong>
                      <span className="text-[11px] text-slate-500 font-normal">6개 미션을 완수하면 15강이 열려요</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {completedCount} / 6 ({progressPercent}%)
                  </span>
                </div>

                {/* 진행률 바 */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* 6개 문항 리스트 */}
                <div className="space-y-2 pt-1">
                  {[
                    {
                      id: 'check-1',
                      title: '1. 공공 오픈 데이터의 가치',
                      desc: 'NEIS 교육청 급식 데이터가 전 국민에게 가입이나 비용 없이 개방된 이유를 이해했다.'
                    },
                    {
                      id: 'check-2',
                      title: '2. 쿼리 파라미터 (물음표 쪽지)',
                      desc: '주소 뒤에 ?와 &를 붙여 학교 코드와 날짜를 전달하는 원리를 파악했다.'
                    },
                    {
                      id: 'check-3',
                      title: '3. 중첩 도시락통 파싱',
                      desc: 'mealServiceDietInfo[1].row[0] 계층을 열어 식단 객체에 접근했다.'
                    },
                    {
                      id: 'check-4',
                      title: '4. 정규표현식 데이터 정제',
                      desc: '<br/> 태그와 괄호 속 알레르기 번호(1.2.5.6)를 깔끔하게 걸러내는 비법을 배웠다.'
                    },
                    {
                      id: 'check-5',
                      title: '5. 주말·방학 예외 방패 (Fallback)',
                      desc: '급식 데이터가 없는 날에도 에러로 꺼지지 않고 친절한 안내를 띄우는 예외 처리를 익혔다.'
                    },
                    {
                      id: 'check-6',
                      title: '6. 실시간 식판 대시보드 조작',
                      desc: '학교와 날짜를 직접 변경하며 실시간으로 식판에 메뉴가 채워지는 인터랙션을 완주했다.'
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
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900 block mb-0.5">{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* 15강 언락 카드 */}
                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-300" />
                      <strong className="text-sm font-bold">14강 미션 완벽 정복! 🎉</strong>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed font-normal">
                      공공 오픈 API의 쿼리 파라미터와 중첩 데이터 파싱, 데이터 정제를 완벽하게 마스터하셨습니다! 다음 15강 포켓몬 도감 검색기 프로젝트로 모험을 이어가세요.
                    </p>
                    <a
                      href="../15-pokemon-api/index.html"
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>15강: 포켓몬 도감 검색기 도전하기</span>
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
