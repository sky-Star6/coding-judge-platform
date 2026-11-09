import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Award,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Search,
  Flame,
  Bot,
  Lightbulb,
  Layers,
  AlertTriangle,
  Send,
  Loader2,
  UtensilsCrossed,
  Utensils,
  FileText,
  Activity,
  Filter,
  ShieldAlert,
  Calendar,
  Compass
} from 'lucide-react';

type StageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'all';

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
    badge: '쿼리 스트링 URL 조립',
    title: '나이스(NEIS) 급식 오픈 API URL과 필수 쿼리 스트링 조합 함수 만들기',
    desc: '교육청 코드, 학교 코드, 조회 날짜(YYYYMMDD)를 인자로 받아 표준 규격의 완전한 나이스 API 호출 URL을 안전하게 조립하는 파이프라인 함수를 작성합니다.',
    situation: '문자열 더하기(+)로 URL을 조합하다가 '&'나 '='가 누락되어 서버로부터 'INVALID_REQUEST' 에러를 받는 흔한 실수!',
    prompt: `[역할]
너는 공공데이터 포털과 나이스(NEIS) 교육정보 개방 포털 API에 능숙한 시니어 백엔드 엔지니어이자 웹 코치야.

[상황 및 요구사항]
학생이 나이스 급식 식단 정보 API('https://open.neis.go.kr/hub/mealServiceDietInfo')를 호출하려고 해.
필수 쿼리 파라미터는 다음과 같아:
- Type: 'json'
- pIndex: 1
- pSize: 5
- ATPT_OFCDC_SC_CODE: 교육청 코드 (예: 서울 'B10')
- SD_SCHUL_CODE: 표준 학교 코드 (예: '7010578')
- MLSV_YMD: 급식 일자 8자리 (예: '20261109')

[요청 사항]
1. URLSearchParams 객체를 사용하여 위 파라미터들을 인코딩 누락 없이 안전하게 하나의 완성된 URL 문자열로 조합하는 buildNeisMealUrl(officeCode, schoolCode, ymd) 함수를 작성해 줘.
2. 왜 단순 문자열 더하기('url?a=' + a)보다 URLSearchParams를 사용하는 것이 실무 표준인지 주니어 개발자의 눈높이에서 설명해 줘.
3. 매 줄마다 초보 학생을 위한 친절한 한국어 주석을 달아줘.`,
    reaction: 'URLSearchParams 규격을 적용해 파라미터 누락과 오타 위험을 0%로 줄이는 현대적 URL 빌더 코드를 소환합니다!',
    csSecret: 'URLSearchParams는 파라미터 값에 특수문자나 한글이 포함되어도 자동으로 안전한 퍼센트 인코딩을 적용해 주는 브라우저 표준 Web API입니다.'
  },
  {
    id: 'quest-02',
    badge: '문자열 정제 & 전처리',
    title: '<br/> 태그와 알레르기 번호 (1.5.6)를 깨끗하게 날리는 정규표현식(Regex) 문자열 정제술',
    desc: '나이스 API가 전송한 원시 텍스트 "친환경 흑미밥<br/>수제 치즈 돈가스(1.2.5.6.10.)"를 파싱해 괄호 속 번호는 따로 분리하고 깨끗한 반찬 배열로 변환하는 정제 함수입니다.',
    situation: '정제하지 않고 그냥 innerHTML로 넣으면 번호가 덕지덕지 붙어 식판 UI가 엉망이 되고, XSS 보안 취약점 위험까지 발생합니다!',
    prompt: `[역할]
너는 텍스트 처리와 정규표현식(Regular Expression)을 가르치는 데이터 사이언스 강사야.

[문제 상황]
교육청 급식 API의 DDISH_NM 속성에는 다음과 같은 지저분한 문자열이 들어있어:
'친환경 흑미밥<br/>쇠고기 맑은 무국(5.6.16.)<br/>수제 치즈 돈가스(1.2.5.6.10.)<br/>양배추 샐러드 & 깍두기(9.)'

[해결 요청]
1. 정규표현식을 사용해 <br/> 태그로 각 요리를 쪼개어 배열로 만드는 cleanMealString(rawString) 함수를 작성해 줘.
2. 반찬 이름 뒤에 붙은 '(1.2.5.6.)' 같은 알레르기 번호를 괄호째 정규식(/\([0-9.]+\)/g)으로 제거해 순수한 음식 이름만 남기는 정제 로직을 포함해 줘.
3. 반대로 추출한 알레르기 번호 목록([1, 2, 5, 6, 10])을 별도 배열로 보존하는 방법도 함께 알려줘.
4. 초등학생도 정규식의 기호(., +, \)를 이해할 수 있는 친절한 주석을 달아줘.`,
    reaction: '복잡한 공공데이터 텍스트를 마법처럼 한 줄의 정규식으로 잘라내어 반찬과 알레르기 정보로 깔끔히 분류하는 정제 코드를 완성합니다!',
    csSecret: '정규표현식(Regex)은 텍스트 패턴을 찾아내는 초고속 언어입니다. 실무 데이터 파이프라인에서 데이터 정제 시간의 80%가 정규표현식으로 처리됩니다.'
  },
  {
    id: 'quest-03',
    badge: '주말 & 휴일 예외 가드',
    title: '"주말이라 급식이 없어요!" — 데이터가 비어 있을 때(INFO-200) 예외 방어 카드 구현',
    desc: '토요일이나 일요일, 여름방학 등 급식이 없는 날짜를 조회했을 때 나이스 API가 던지는 INFO-200(해당 일자에 데이터가 없습니다) 응답을 감지해 친절한 휴일 식판 화면을 띄웁니다.',
    situation: '데이터가 당연히 있을 것이라 믿고 data.mealServiceDietInfo[1].row[0]에 바로 접근하면 'TypeError: Cannot read properties of undefined'로 앱이 다운됩니다!',
    prompt: `[역할]
너는 프론트엔드 오류 방어와 널 세이프티(Null-Safety)를 연구하는 소프트웨어 아키텍트야.

[상황]
학생이 주말 날짜로 나이스 급식 API를 호출했더니, data.mealServiceDietInfo 배열이 존재하지 않고 { RESULT: { CODE: 'INFO-200', MESSAGE: '해당하는 데이터가 없습니다.' } } 객체만 반환되어 스크립트 오류가 발생했습니다.

[요청 사항]
1. 옵셔널 체이닝(?.)과 조건문 분기를 활용해 급식 데이터 row가 존재하는지 안전하게 검증하는 parseMealResponse(data) 함수를 작성해 줘.
2. 데이터가 정상인 경우 정제된 식단 객체를 반환하고, 주말/방학으로 데이터가 없을 때는 { isHoliday: true, message: '오늘은 급식이 없는 즐거운 휴일입니다! 🏖️' }를 안전하게 반환하도록 처리해 줘.
3. 왜 외부 API 데이터를 다룰 때 '옵셔널 체이닝(?.)'이 실무 필수 기술인지 2문장으로 요약해 줘.`,
    reaction: '휴일과 방학에도 절대 흰 화면 멈춤이 발생하지 않는 무결점 옵셔널 체이닝 예외 방어 함수를 완성합니다!',
    csSecret: '옵셔널 체이닝(?.)은 중간 객체가 null이나 undefined여도 런타임 에러를 던지지 않고 안전하게 undefined를 반환하여 프로그램 강제 종료를 막습니다.'
  },
  {
    id: 'quest-04',
    badge: '알레르기 안심 필터',
    title: '내 알레르기 유발 번호(난류 1번, 우유 2번)를 감지해 빨간 경고 뱃지를 다는 안전 필터 로직',
    desc: '사용자가 설정한 알레르기 유발 식품(예: 1번 난류, 2번 우유, 5번 대두)이 포함된 반찬 카드에 빨간 테두리와 경고 뱃지를 띄워 건강을 지켜주는 안심 필터를 구축합니다.',
    situation: '알레르기 번호 1번(난류)을 찾을 때 단순 문자열 포함('1')으로 검사하면 '10번(돼지고기)'이나 '15번'까지 1번으로 오인 감지되는 버그 발생!',
    prompt: `[역할]
너는 에듀테크 헬스케어 및 환자 안전 UX를 설계하는 프론트엔드 수석 개발자야.

[나이스 알레르기 표준 번호표]
1: 난류(계란), 2: 우유, 3: 메밀, 4: 땅콩, 5: 대두, 6: 밀, 7: 고등어, 8: 게, 9: 새우, 10: 돼지고기, 11: 복숭아, 12: 토마토, 13: 아황산염, 14: 호두, 15: 닭고기, 16: 쇠고기, 17: 오징어, 18: 조개류

[요구사항]
1. 학생의 알레르기 유발 번호 배열(예: [1, 2] -> 계란, 우유 알레르기 보유)과 반찬의 알레르기 정보 문자열(예: '치즈 돈가스(1.2.5.6.10.)')을 비교하는 checkAllergyRisk(dishString, userAllergies) 함수를 작성해 줘.
2. '10번'이나 '15번'을 1번으로 잘못 인식하지 않도록 정확하게 번호 단위로 분리(split('.'))하여 일치 여부를 판별하는 완벽한 배열 비교 로직을 작성해 줘.
3. 알레르기 위험이 발견되었을 때 반환할 결과 객체({ hasRisk: true, matchedAllergies: ['난류', '우유'] })와 화면에 띄울 UI 뱃지 예시를 포함해 줘.`,
    reaction: '정밀한 숫자 분리 알고리즘으로 오탐을 0%로 줄이고, 위험 반찬에 빨간 안전 경고 뱃지를 달아주는 헬스케어 코드를 소환합니다!',
    csSecret: '문자열 내 부분 일치(includes) 대신 토큰화(Tokenization)를 거쳐 개별 번호 객체로 변환하여 Set이나 Array.some()으로 검사하는 것이 데이터 안전의 기본 원칙입니다.'
  },
  {
    id: 'quest-05',
    badge: '주간 식단표 배치 루프',
    title: '이번 주 월~금 5일치 급식 데이터를 한 번에 가져와 주간 식단표로 묶어주는 날짜 범위 쿼리술',
    desc: '하루치만 가져오는 것이 아니라, MLSV_FROM_YMD=20261109&MLSV_TO_YMD=20261113 범위 쿼리를 활용해 월요일부터 금요일까지 5일치 식단을 한 번에 받아와 5일 달력 식판으로 펼치는 고급 API 기술입니다.',
    situation: 'fetch를 for문으로 5번 반복 호출하면 서버에 불필요한 트래픽 5배를 유발하고 응답 순서가 뒤죽박죽 섞여 월요일과 금요일이 바뀌는 대참사 발생!',
    prompt: `[역할]
너는 대규모 트래픽 최적화와 배치(Batch) API 통신을 전담하는 시니어 웹 아키텍트야.

[상황 및 요구사항]
학생이 월요일부터 금요일까지 5일치 학교 식단을 한 번에 조회하여 '주간 급식표'를 만들려고 해.
나이스 API는 MLSV_FROM_YMD와 MLSV_TO_YMD 쿼리 파라미터로 기간 조회를 지원해.

[요청 사항]
1. 불필요하게 fetch를 5번 호출하지 않고, 단 1번의 API 호출로 이번 주 5일치 급식 배열을 통째로 받아오는 fetchWeeklyMeals(schoolCode, fromDate, toDate) 함수를 작성해 줘.
2. 받아온 배열을 요일별(월, 화, 수, 목, 금) 키로 묶어주는 자바스크립트 객체 매핑 로직을 작성해 줘.
3. 왜 여러 번의 네트워크 호출(N+1 Query)보다 단일 기간 쿼리가 성능과 배터리 절약 측면에서 우수한지 초보자를 위한 비유로 2줄 요약해 줘.`,
    reaction: '단 한 번의 네트워크 요청으로 5일치 식단을 완벽하게 요일별로 그룹핑하는 고효율 배치 파이프라인 코드를 소환합니다!',
    csSecret: '네트워크 요청은 매번 TCP/TLS 핸드셰이크 왕복 시간이 듭니다. 기간 쿼리로 1번에 묶어 가져오면 데이터 전송 속도가 최대 5배 빨라집니다.'
  }
];

interface MealDetail {
  title: string;
  calorie: string;
  rice: string;
  soup: string;
  main: string;
  side: string;
  dessert: string;
  allergies: string;
  rawText: string;
}

interface SchoolConfig {
  schoolName: string;
  officeCode: string;
  schoolCode: string;
  today: MealDetail;
  tomorrow: MealDetail;
  wednesday: MealDetail;
  weekend: null;
}

const MEAL_DATABASE: Record<string, SchoolConfig> = {
  seoul: {
    schoolName: '서울상상초등학교',
    officeCode: 'B10',
    schoolCode: '7010578',
    today: {
      title: '오늘의 급식',
      calorie: '785.4 Kcal',
      rice: '🍚 친환경 흑미밥',
      soup: '🍲 쇠고기 맑은 무국',
      main: '🥩 수제 치즈 돈가스 & 브라운 소스',
      side: '🥗 양배추 샐러드 & 깍두기',
      dessert: '🍓 생딸기 요거트',
      allergies: '1.난류, 2.우유, 5.대두, 6.밀, 10.돼지고기, 16.쇠고기',
      rawText: '친환경 흑미밥<br/>쇠고기 맑은 무국(5.6.16.)<br/>수제 치즈 돈가스(1.2.5.6.10.)<br/>양배추 샐러드 & 깍두기(9.)<br/>생딸기 요거트(2.)'
    },
    tomorrow: {
      title: '내일의 급식',
      calorie: '742.0 Kcal',
      rice: '🍚 기장밥',
      soup: '🍲 얼큰 닭개장',
      main: '🐟 삼치 엿장 구이',
      side: '🥬 시금치 무침 & 배추김치',
      dessert: '🍊 꿀 감귤',
      allergies: '5.대두, 6.밀, 15.닭고기',
      rawText: '기장밥<br/>얼큰 닭개장(15.)<br/>삼치 엿장 구이(5.6.)<br/>시금치 무침 & 배추김치(9.)<br/>꿀 감귤'
    },
    wednesday: {
      title: '수요일 특식 (맛있는 날)',
      calorie: '890.5 Kcal',
      rice: '🍛 치킨 카레라이스',
      soup: '🍲 팽이버섯 장국',
      main: '🥟 바삭 비빔 만두',
      side: '🥒 오이피클 & 깍두기',
      dessert: '🧃 100% 사과 주스',
      allergies: '1.난류, 2.우유, 5.대두, 6.밀, 10.돼지고기, 15.닭고기',
      rawText: '치킨 카레라이스(1.2.5.6.15.)<br/>팽이버섯 장국(5.6.)<br/>바삭 비빔 만두(1.5.6.10.)<br/>오이피클 & 깍두기(9.)<br/>100% 사과 주스'
    },
    weekend: null
  },
  gyeonggi: {
    schoolName: '경기미래중학교',
    officeCode: 'J10',
    schoolCode: '7530842',
    today: {
      title: '오늘의 급식',
      calorie: '820.1 Kcal',
      rice: '🍚 찰보리밥',
      soup: '🍲 부대찌개 (라면사리)',
      main: '🍗 크리스피 순살 치킨 & 어니언딥',
      side: '🌽 콘 샐러드 & 석박지',
      dessert: '🍇 청포도',
      allergies: '1.난류, 2.우유, 5.대두, 6.밀, 10.돼지고기, 15.닭고기',
      rawText: '찰보리밥<br/>부대찌개(1.2.5.6.10.)<br/>크리스피 순살 치킨(1.5.6.15.)<br/>콘 샐러드 & 석박지(9.)<br/>청포도'
    },
    tomorrow: {
      title: '내일의 급식',
      calorie: '760.3 Kcal',
      rice: '🍚 렌틸콩밥',
      soup: '🍲 순두부 백탕',
      main: '🥩 고추장 제육볶음 & 파채',
      side: '🥗 도토리묵 야채무침 & 김치',
      dessert: '🍌 바나나',
      allergies: '5.대두, 6.밀, 10.돼지고기',
      rawText: '렌틸콩밥<br/>순두부 백탕(5.)<br/>고추장 제육볶음(5.6.10.)<br/>도토리묵 야채무침 & 김치(9.)<br/>바나나'
    },
    wednesday: {
      title: '수요일 특식',
      calorie: '865.0 Kcal',
      rice: '🍝 미트 스파게티 & 마늘빵',
      soup: '🍲 양송이 크림 수프',
      main: '🍕 콤비네이션 조각 피자',
      side: '🥗 수제 수제 오이피클',
      dessert: '🍹 자몽 에이드',
      allergies: '1.난류, 2.우유, 5.대두, 6.밀, 10.돼지고기, 12.토마토',
      rawText: '미트 스파게티 & 마늘빵(1.2.5.6.10.12.)<br/>양송이 크림 수프(2.)<br/>콤비네이션 피자(1.2.5.6.10.12.)<br/>수제 피클<br/>자몽 에이드'
    },
    weekend: null
  },
  busan: {
    schoolName: '부산코딩고등학교',
    officeCode: 'C10',
    schoolCode: '7150123',
    today: {
      title: '오늘의 급식',
      calorie: '850.7 Kcal',
      rice: '🍚 발아현미밥',
      soup: '🍲 부산 어묵탕 (꼬치어묵)',
      main: '🥩 언양식 불고기 & 파채',
      side: '🥗 부추 겉절이 & 깍두기',
      dessert: '🧃 망고 주스',
      allergies: '1.난류, 5.대두, 6.밀, 16.쇠고기',
      rawText: '발아현미밥<br/>부산 어묵탕(1.5.6.)<br/>언양식 불고기(5.6.16.)<br/>부추 겉절이 & 깍두기(9.)<br/>망고 주스'
    },
    tomorrow: {
      title: '내일의 급식',
      calorie: '795.0 Kcal',
      rice: '🍚 곤드레 나물밥 & 양념장',
      soup: '🍲 들깨 미역국',
      main: '🍗 안동식 찜닭 (당면사리)',
      side: '🥬 콩나물 무침 & 배추김치',
      dessert: '🍎 꿀 사과',
      allergies: '5.대두, 6.밀, 15.닭고기',
      rawText: '곤드레 나물밥 & 양념장(5.6.)<br/>들깨 미역국(5.6.)<br/>안동식 찜닭(5.6.15.)<br/>콩나물 무침 & 배추김치(9.)<br/>꿀 사과'
    },
    wednesday: {
      title: '수요일 특식',
      calorie: '910.2 Kcal',
      rice: '🍛 돈코츠 차슈 라멘',
      soup: '🍲 맑은 국물 (라멘 육수)',
      main: '🍤 왕새우 튀김 & 타르타르 소스',
      side: '🥗 단무지 & 초생강 무침',
      dessert: '🍦 젤라또 아이스크림',
      allergies: '1.난류, 2.우유, 5.대두, 6.밀, 9.새우, 10.돼지고기',
      rawText: '돈코츠 차슈 라멘(1.5.6.10.)<br/>왕새우 튀김 & 소스(1.2.5.6.9.)<br/>단무지 & 초생강<br/>젤라또 아이스크림(2.)'
    },
    weekend: null
  }
};

export const Lesson14: React.FC = () => {
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
  // 2. 가상 급식 알리미 상태 (Stage 2)
  // ---------------------------------------------------------------------------
  const [selectedSchool, setSelectedSchool] = useState<'seoul' | 'gyeonggi' | 'busan'>('seoul');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'wednesday' | 'weekend'>('today');
  const [isAllergyActive, setIsAllergyActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusBadgeText, setStatusBadgeText] = useState('READY (대기 중)');
  const [mealData, setMealData] = useState<MealDetail | null>(MEAL_DATABASE.seoul.today);
  const [isWeekend, setIsWeekend] = useState<boolean>(false);
  const [rawJson, setRawJson] = useState<string>(JSON.stringify({
    mealServiceDietInfo: [
      { head: [{ list_total_count: 1 }, { RESULT: { CODE: "INFO-000", MESSAGE: "정상 처리되었습니다." } }] },
      {
        row: [
          {
            ATPT_OFCDC_SC_NM: "서울특별시교육청",
            SCHUL_NM: "서울상상초등학교",
            MLSV_YMD: "20261109",
            DDISH_NM: MEAL_DATABASE.seoul.today.rawText,
            CAL_INFO: MEAL_DATABASE.seoul.today.calorie
          }
        ]
      }
    ]
  }, null, 2));

  const executeFetch = async () => {
    setIsLoading(true);
    setStatusBadgeText('나이스 교육청 통신 중... 🚚');

    await new Promise(r => setTimeout(r, 600));

    const school = MEAL_DATABASE[selectedSchool];
    const meal = school[selectedDate];

    if (!meal) {
      setIsWeekend(true);
      setMealData(null);
      setStatusBadgeText('배달 완료 (INFO-200 휴일)');
      setRawJson(JSON.stringify({
        RESULT: {
          CODE: "INFO-200",
          MESSAGE: "해당하는 일자에 급식 데이터가 없습니다. (주말/방학)"
        }
      }, null, 2));
    } else {
      setIsWeekend(false);
      setMealData(meal);
      setStatusBadgeText('배달 성공 (200 OK)');
      setRawJson(JSON.stringify({
        mealServiceDietInfo: [
          { head: [{ list_total_count: 1 }, { RESULT: { CODE: "INFO-000", MESSAGE: "정상 처리되었습니다." } }] },
          {
            row: [
              {
                ATPT_OFCDC_SC_NM: school.schoolName.includes('서울') ? "서울특별시교육청" : school.schoolName.includes('경기') ? "경기도교육청" : "부산광역시교육청",
                SCHUL_NM: school.schoolName,
                MLSV_YMD: selectedDate === 'today' ? "20261109" : selectedDate === 'tomorrow' ? "20261110" : "20261111",
                DDISH_NM: meal.rawText,
                CAL_INFO: meal.calorie
              }
            ]
          }
        ]
      }, null, 2));
    }

    setIsLoading(false);

    // 체크리스트 4번 자동 체크
    setCheckedItems(prev => {
      const next = { ...prev, 4: true };
      localStorage.setItem('ai_lesson_14_checklist', JSON.stringify(next));
      return next;
    });
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
      const saved = localStorage.getItem('ai_lesson_14_checklist');
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
      localStorage.setItem('ai_lesson_14_checklist', JSON.stringify(next));
      const allDone = Object.values(next).filter(Boolean).length === 6;
      if (allDone) {
        localStorage.setItem('ai_lesson_14_completed', 'true');
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ===================================================================== */}
      {/* 1. 풀 너비 GNB 헤더 (1강 최신 표준 2분할 레이아웃)                   */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* [좌측]: 브랜드 로고 & 강의 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="../../index.html"
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-emerald-700 transition-colors"
              title="과정 홈으로 이동"
            >
              <Sparkles className="w-5 h-5" />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium truncate">AI·코딩 24강</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-bold text-slate-900 truncate">시즌 4 · 14강: 오늘 점심 메뉴는 뭘까? 교육청 데이터 실시간 급식 알리미</span>
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
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage1' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>1</span>
              <span>미션&원리</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage2')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage2'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage2' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>2</span>
              <span>가상 급식 알리미</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage3')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage3'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage3' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>3</span>
              <span>실전 AI 퀘스트</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStage('stage4')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeStage === 'stage4'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                activeStage === 'stage4' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>4</span>
              <span>용어&체크리스트</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeStage === 'all'
                  ? 'bg-white text-emerald-700 shadow-sm'
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
            activeStage === 'stage1' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          1. 미션&원리
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage2' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          2. 급식 알리미
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage3' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          3. AI 퀘스트
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('stage4')}
          className={`px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'stage4' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          4. 용어&점검
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('all')}
          className={`px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer ${
            activeStage === 'all' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500'
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
            <article className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-900/40">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SEASON 4 · PUBLIC DATA & NEIS API
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-slate-200">
                    STAGE 01
                  </span>
                  <span className="text-sm text-slate-400">실전 공공데이터 & 식판 렌더링</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
                    오늘 우리 학교 점심 급식은 돈가스일까?! 🍱<br className="hidden sm:inline" />
                    교육청 나이스(NEIS) 공공데이터로 만드는 실시간 급식 알리미
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    매일 아침 "오늘 점심 메뉴 뭐야?" 하고 친구들에게 물어보던 호기심을 이제 내 손으로 직접 해결합니다! 대한민국 교육부 교육행정정보시스템(나이스 NEIS) 오픈 API를 호출하여 내 학교와 오늘 날짜를 콕 집어 주문하고, 지저분한 문자열을 다듬어 5칸 식판에 예쁘게 담아내는 실전 데이터 엔지니어링을 정복해 봅시다.
                  </p>
                </div>

                {/* 핵심 도전 목표 3가지 */}
                <div className="pt-2">
                  <h4 className="text-base font-bold text-emerald-200 mb-3 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
                    <span>오늘 완수할 3가지 급식 데이터 엔지니어링 미션</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-emerald-400 font-bold text-sm mb-1">01. 나이스 공공데이터</div>
                      <p className="text-sm text-slate-300">전국 1만여 개 학교의 급식 정보를 무료로 나눠주는 교육청 공식 오픈 API 탐구</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-emerald-400 font-bold text-sm mb-1">02. 꼬리표 쿼리 스트링</div>
                      <p className="text-sm text-slate-300">학교 코드와 날짜(20261109)를 물음표(?) 뒤에 붙여 원하는 메뉴만 쏙 골라내는 주문법</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-emerald-400 font-bold text-sm mb-1">03. 5칸 식판 & 알레르기</div>
                      <p className="text-sm text-slate-300">특수문자를 정제해 밥, 국, 반찬 5칸 식판에 담고 알레르기 유발 식품을 감지하는 방패</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 핵심 개념 원리 탐구 카드 (Bento Grid) */}
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    💡 실시간 급식 알리미를 움직이는 3대 핵심 원리
                  </h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  교육청 서버의 거대한 식단 데이터베이스에서 어떻게 우리 학교 점심 메뉴만 찾아낼 수 있을까요?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 카드 1 */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    🏛️
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    나이스(NEIS) 오픈 API<br />
                    <span className="text-sm font-mono text-emerald-700">Gov Public Data API</span>
                  </h4>
                  <p className="text-sm text-emerald-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 교육청이 전국 모든 학생들을 위해 무료로 열어둔 거대한 공개 급식 도서관.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> 교육부 NEIS 공공데이터 포털에서 발급한 인증키를 통해 전국 초·중·고교의 일별 급식 식단, 열량, 원산지 정보를 실시간 JSON으로 제공합니다.
                  </p>
                </div>

                {/* 카드 2 */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    💌
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    물음표 쪽지 주문서<br />
                    <span className="text-sm font-mono text-indigo-700">Query String (?key=value)</span>
                  </h4>
                  <p className="text-sm text-indigo-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 택배 상자에 "우리 학교 번호는 B10, 배달 날짜는 11월 9일!"이라고 적어 붙이는 세부 주문 쪽지.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> URL 끝에 <code className="bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded text-sm">?ATPT_OFCDC_SC_CODE=...&MLSV_YMD=20261109</code>처럼 키-값 쌍을 연결해 원하는 데이터만 정밀하게 필터링하여 서버에 전달합니다.
                  </p>
                </div>

                {/* 카드 3 */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    🥗
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    텍스트 정제 & 알레르기<br />
                    <span className="text-sm font-mono text-amber-700">Data Sanitization & Filter</span>
                  </h4>
                  <p className="text-sm text-amber-950 font-medium">
                    🧸 <strong>어린이 비유:</strong> 밭에서 뽑아온 사과의 흙과 잎사귀를 깨끗이 씻어내어 예쁜 접시에 담기 좋게 다듬는 과정.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    🎓 <strong>개발자 원리:</strong> API 원문에 섞여 있는 <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-sm">&lt;br/&gt;</code> 태그와 번호(1.5.13.)를 정규식으로 정리하고, 알레르기 번호를 감지해 하이라이트합니다.
                  </p>
                </div>

              </div>

              {/* 주니어 개발자 제1원칙 알림 카드 */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-emerald-950">
                    주니어 데이터 엔지니어의 황금 법칙: "공공데이터는 반드시 지저분하다! 정제(Cleaning)가 생명이다!"
                  </h4>
                  <p className="text-sm text-emerald-900 leading-relaxed">
                    공공기관이 제공하는 원시 데이터(Raw Data)는 화면에 바로 띄울 수 있을 만큼 예쁘지 않습니다. 줄바꿈 태그(<span className="font-mono text-rose-700 bg-rose-100 px-1 py-0.5 rounded">&lt;br/&gt;</span>), 알레르기 유발 번호, 괄호, 영양 성분 기호 등이 어지럽게 뒤섞여 있습니다. 이 원석을 다듬어 5칸 식판 UI에 정갈하게 올리는 것이 바로 <strong>데이터 전처리(Pre-processing)</strong>의 진짜 개발자 실력입니다!
                  </p>
                </div>
              </div>
            </article>

            {/* 하단 네비게이션 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStage('stage2')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 2 가상 급식 알리미 실습</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </section>
        )}

        {/* =================================================================== */}
        {/* STAGE 02: 가상 인터랙티브 급식 알리미 (In-Page Simulator)             */}
        {/* =================================================================== */}
        {(activeStage === 'stage2' || activeStage === 'all') && (
          <section className="space-y-8 animate-fadeIn">
            
            <article className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    <h3 id="stage-2-title" class="text-base sm:text-lg font-bold text-slate-900">
                      🍱 가상 실시간 나이스(NEIS) 급식 알리미 랩
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    학교와 날짜를 선택한 뒤 [실시간 급식 배달 출발!]을 누르면 5칸 식판에 오늘의 반찬이 차려집니다.
                  </p>
                </div>
                
                {/* 알레르기 안심 필터 토글 스위치 */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl self-start sm:self-auto">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>알레르기 안심 필터</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={isAllergyActive}
                    onChange={e => setIsAllergyActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* 학교 & 날짜 선택 컨트롤러 */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>NEIS OPEN API ENDPOINT: mealServiceDietInfo</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">{statusBadgeText}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">대상 학교 선택</label>
                    <select
                      value={selectedSchool}
                      onChange={e => setSelectedSchool(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="seoul">서울상상초등학교 (서울교육청)</option>
                      <option value="gyeonggi">경기미래중학교 (경기교육청)</option>
                      <option value="busan">부산코딩고등학교 (부산교육청)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">급식 날짜 선택</label>
                    <select
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="today">오늘 (2026년 11월 9일 월)</option>
                      <option value="tomorrow">내일 (2026년 11월 10일 화)</option>
                      <option value="wednesday">수요일 (2026년 11월 11일 수 · 맛있는 날)</option>
                      <option value="weekend">주말 테스트 (2026년 11월 14일 토 · 휴일)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={executeFetch}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>나이스 배달 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>🍱 실시간 급식 배달 출발!</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 실시간 쿼리 스트링 미리보기 */}
                <div className="pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 truncate select-all">
                    <span className="text-slate-500">REQUEST URL: </span>
                    https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=5&ATPT_OFCDC_SC_CODE={MEAL_DATABASE[selectedSchool].officeCode}&SD_SCHUL_CODE={MEAL_DATABASE[selectedSchool].schoolCode}&MLSV_YMD={selectedDate === 'today' ? '20261109' : selectedDate === 'tomorrow' ? '20261110' : selectedDate === 'wednesday' ? '20261111' : '20261114'}
                  </div>
                </div>
              </div>

              {/* 🍱 비주얼 5칸 급식 식판 UI */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                    <strong className="text-base font-bold text-slate-900">
                      {isWeekend ? `${MEAL_DATABASE[selectedSchool].schoolName} (휴일)` : `${MEAL_DATABASE[selectedSchool].schoolName} - ${mealData?.title || '급식'}`}
                    </strong>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    🔥 {isWeekend ? '0 Kcal' : mealData?.calorie || '785.4 Kcal'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-slate-100/90 border-2 border-slate-300/80 shadow-inner space-y-3.5 relative overflow-hidden">
                  
                  {/* 주말 오버레이 */}
                  {isWeekend && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-10 animate-fadeIn">
                      <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl mb-2">
                        🏖️
                      </div>
                      <h4 className="text-base font-bold text-white">주말 및 공휴일 급식 미운영</h4>
                      <p className="text-sm text-slate-200 max-w-sm mt-1">
                        학교 급식실이 쉬는 날입니다! 공공데이터 API는 빈 데이터(INFO-200)를 반환하므로 안전한 휴일 화면을 띄웠습니다.
                      </p>
                    </div>
                  )}

                  {/* 윗줄 3칸 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center min-h-[90px] flex flex-col justify-center items-center space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">밥 (주식)</span>
                      <span className="text-sm font-bold text-slate-900">{mealData?.rice || '🍚 친환경 흑미밥'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center min-h-[90px] flex flex-col justify-center items-center space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">국 / 찌개</span>
                      <span className="text-sm font-bold text-slate-900">{mealData?.soup || '🍲 쇠고기 맑은 무국'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center min-h-[90px] flex flex-col justify-center items-center space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">후식 / 음료</span>
                      <span className="text-sm font-bold text-slate-900">{mealData?.dessert || '🍓 생딸기 요거트'}</span>
                    </div>
                  </div>

                  {/* 아랫줄 2칸 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-2xl shadow-xs text-center min-h-[95px] flex flex-col justify-center items-center space-y-1 transition-all ${
                      isAllergyActive
                        ? 'bg-rose-50 border-2 border-rose-400 animate-pulse'
                        : 'bg-white border border-slate-200'
                    }`}>
                      <span className={`text-xs font-bold block ${isAllergyActive ? 'text-rose-700' : 'text-emerald-600'}`}>
                        {isAllergyActive ? '⚠️ 알레르기 주의 (난류/우유)' : '메인 요리 (특식)'}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">{mealData?.main || '🥩 수제 치즈 돈가스 & 소스'}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center min-h-[95px] flex flex-col justify-center items-center space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">밑반찬 & 김치</span>
                      <span className="text-sm font-bold text-slate-900">{mealData?.side || '🥗 양배추 샐러드 & 깍두기'}</span>
                    </div>
                  </div>

                  {/* 알레르기 띠지 */}
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span className="truncate font-medium">
                      알레르기 유발 물질: {isWeekend ? '주말/공휴일 미운영' : mealData?.allergies || '1.난류, 2.우유, 5.대두, 6.밀, 10.돼지고기'}
                    </span>
                    <span className="text-slate-400 font-mono shrink-0 ml-2">원산지: 국내산 식재료</span>
                  </div>

                </div>
              </div>

              {/* 나이스 원본 JSON 영수증 X-Ray */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>나이스(NEIS) 교육청 API 원본 JSON 영수증 (Raw Data)</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    FORMAT: JSON
                  </span>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed h-48 select-all">
                  {rawJson}
                </pre>
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
                <span>이전: Stage 1 미션 & 원리</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage3')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>다음: Stage 3 실전 최신 AI 5대 퀘스트</span>
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
              <div className="flex items-center gap-2 text-emerald-600">
                <Flame className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  🔥 최신 AI 5대 실전 퀘스트: 공공데이터와 급식 알리미 구축
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                실제 ChatGPT나 Gemini 창을 옆에 띄워두고 아래의 고난도 프롬프트를 복사하여 보내보세요. 실무 데이터 엔지니어들이 공공데이터를 가공하고 정제하는 실전 노하우를 완벽히 흡수합니다.
              </p>
            </div>

            <div className="space-y-6">
              {QUESTS.map((q, idx) => (
                <article
                  key={q.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5 transition-all hover:border-emerald-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-emerald-600 text-white">
                        QUEST 0{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {q.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      NEIS API & Regex
                    </span>
                  </div>

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

                  {/* 프롬프트 박스 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-emerald-600" />
                        <span>복사해서 AI에게 보낼 프롬프트 (클릭 시 자동 복사)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPromptText(q.id, q.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200 shadow-xs"
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
                <span>이전: Stage 2 가상 급식 알리미</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('stage4')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                <div className="flex items-center gap-2 text-emerald-400">
                  <Search className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    🔍 주니어 개발자를 위한 전문 용어 돋보기
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  오늘 14강 교육청 공공데이터와 급식 알리미에서 사용된 실제 공식 컴퓨터 과학 / 웹 데이터 표준 용어를 정리합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                {/* 용어 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>공공데이터</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Public Open Data / 정부 및 교육청이 무료 개방한 공익 데이터</span>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 국민 모두가 세금으로 함께 만든 공공 도서관의 책을 누구나 무료로 대여해 볼 수 있는 것!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 공공기관이 생성하거나 관리하는 버스 위치, 날씨, 급식 등의 정보를 국민과 개발자가 영리·비영리 목적으로 자유롭게 재활용할 수 있도록 개방한 디지털 자산입니다.
                  </p>
                </div>

                {/* 용어 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>💌</span>
                      <span>쿼리 스트링</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Query String / URL 뒤에 붙는 ?key=value 형태의 꼬리표 주문서</span>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 햄버거 주문 시 "피클 빼고, 치즈 추가!"라고 적어 주방에 전달하는 옵션 쪽지.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 웹 주소(URL) 끝에 물음표(?)를 시작으로 앤드(&) 기호를 통해 연결되는 매개변수 목록으로, 서버에 특정 조건의 데이터를 필터링해 달라고 요청할 때 사용합니다.
                  </p>
                </div>

                {/* 용어 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🧹</span>
                      <span>데이터 정제</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Data Sanitization & Cleaning / 원시 텍스트의 불순물 제거</span>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 밭에서 뽑아온 사과의 흙과 잎사귀를 깨끗이 씻어내어 예쁜 접시에 담기 좋게 다듬는 과정.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 원시 데이터에 포함된 불필요한 HTML 태그(&lt;br/&gt;), 공백, 특수문자, 보안 위험 요소(XSS)를 정규표현식이나 필터 함수로 정제하여 UI 렌더링에 적합하게 가공하는 과정입니다.
                  </p>
                </div>

                {/* 용어 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🔑</span>
                      <span>인증키</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">API Key / 서버 통신을 위한 고유 출입증</span>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 놀이공원 자유이용권 손목 띠! 입장할 때 손목 띠를 보여주면 직원이 바로 통과시켜 주는 것.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> API 제공자가 호출자의 신원을 확인하고 과도한 트래픽(DDoS)을 제어하기 위해 발급하는 문자열 암호키입니다.
                  </p>
                </div>

                {/* 용어 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 md:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span>🍱</span>
                      <span>데이터 파싱 & 식판 매핑</span>
                    </h4>
                    <span className="text-sm font-mono text-slate-400 block pl-5.5">Data Parsing & UI Mapping / 원시 JSON을 화면 컴포넌트에 배치</span>
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">
                    🧸 <strong>어린이 비유:</strong> 커다란 반찬 통에서 밥, 국, 고기, 샐러드를 알맞은 식판 칸에 숟가락으로 예쁘게 나누어 담기!
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    🎓 <strong>개발자 정의:</strong> 서버로부터 전송된 JSON 계층 구조(Tree)에서 필요한 속성(DDISH_NM, CAL_INFO)을 추출해 웹 화면의 각 UI 영역(식판 5칸 컴포넌트)에 바인딩하여 렌더링하는 기법입니다.
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
                      14강 완주를 위한 자가 점검 체크리스트
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
                    className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    1. 국가와 교육청이 무료로 공개하는 <span className="font-mono text-emerald-700 font-bold">공공데이터(나이스 오픈 API)</span>의 가치를 이해했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[2]}
                    onChange={() => toggleCheck(2)}
                    className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    2. 학교 코드와 날짜를 URL 뒤에 물음표로 붙이는 <span className="font-mono text-emerald-700 font-bold">쿼리 스트링(?key=value)</span>의 원리를 배웠나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[3]}
                    onChange={() => toggleCheck(3)}
                    className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    3. 급식 텍스트에 섞인 &lt;br/&gt; 태그와 번호를 깔끔하게 다듬는 <span className="font-mono text-emerald-700 font-bold">데이터 정제(Cleaning)</span>의 필요성을 파악했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[4]}
                    onChange={() => toggleCheck(4)}
                    className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    4. 가상 급식 알리미 콘솔에서 학교와 날짜를 선택하고, 5칸 식판에 담긴 실제 메뉴와 칼로리를 확인했나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[5]}
                    onChange={() => toggleCheck(5)}
                    className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    5. 최신 AI에게 나이스 API 쿼리 조합 및 알레르기 번호 감지 필터 코드를 요구하는 퀘스트를 성공시켰나요?
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems[6]}
                    onChange={() => toggleCheck(6)}
                    className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    6. 주말이나 방학처럼 데이터가 비어 있을 때 웹 앱이 튕기지 않도록 하는 <span className="font-mono text-emerald-700 font-bold">방어적 조건 분기</span>의 중요성을 기억하나요?
                  </span>
                </label>

              </div>
            </article>

            {/* 3. 100% 완주 축하 및 15강 언락 다크 펄스 카드 */}
            {isAllCompleted && (
              <article className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-300">
                      시즌 4 공공데이터 마스터! 14강 완주를 축하합니다! 🍱✨
                    </h4>
                    <p className="text-sm text-slate-300">
                      6가지 점검 항목을 모두 통과하여 교육청 나이스 오픈 API 쿼리 스트링 조합과 데이터 정제, 그리고 비주얼 식판 렌더링을 완전히 정복했습니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm text-emerald-300 font-semibold block">다음 학습 코스 잠금 해제</span>
                    <p className="text-sm text-white font-bold">시즌 4 · 15강: 전설의 포켓몬을 찾아라! 오픈 데이터 포켓몬 도감 검색기</p>
                  </div>
                  <a
                    href="../15-pokemon-api/index.html"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>15강으로 즉시 이동</span>
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
          <span className="text-slate-400">시즌 4 · 14강: 교육청 공공데이터 급식 알리미</span>
        </div>
      </footer>

    </div>
  );
};
