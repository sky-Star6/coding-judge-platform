/**
 * 코딩 플랫폼 공용 테마 토글 및 서버 동기화 스크립트 (theme-toggle.js)
 * 
 * [핵심 기능 및 설계 원칙]
 * 1. 서버 저장값 최우선 (Server Preference Priority):
 *    로그인 후 사용자의 서버 저장 테마('system' | 'light' | 'dark')를 우선 조회하여 적용합니다.
 * 2. 시스템 기본 및 OS 동기화 (System Fallback & OS Preference):
 *    로그인 전 또는 무인증 페이지에서는 기본값이 'system'이며, 사용자의 운영체제(OS) 환경 설정을 반영합니다.
 * 3. 조기 복원(Early Restore)을 통한 화면 깜빡임 방지 (FOUC 방지):
 *    <head> 태그 내에서 즉시 실행되어 캐시된 선호도 또는 OS 설정을 선반영하여 스타일 깜빡임(FOUC)을 차단합니다.
 * 4. 안전한 무인증/네트워크 오류 처리 (Silent Fallback):
 *    로그인되지 않은 상태나 네트워크 요청 실패 시에도 에러 없이 안전하게 시스템(system) 모드로 동작합니다.
 * 5. 단일 네임스페이스 로컬 스토리지 키 ('coding_platform_theme') 사용으로 모나코 에디터 등과의 충돌 방지.
 */

(function () {
    'use strict';

    // 1. 단일 네임스페이스 로컬 스토리지 키 (Namespaced LocalStorage Key)
    var THEME_STORAGE_KEY = 'coding_platform_theme';

    // 2. 지원하는 테마 선호도 목록 (Allowed Preferences)
    var VALID_PREFERENCES = ['system', 'light', 'dark'];

    // 3. 현재 메모리에 유지되는 테마 선호도 (기본값: 'system')
    var activePreference = 'system';

    /**
     * 운영체제(OS)의 다크 모드 활성화 여부를 판별합니다.
     * @returns {boolean} OS 다크 모드 활성화 여부
     */
    function getSystemPrefersDark() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (e) {
            return false;
        }
    }

    /**
     * 사용자 선호도('system' | 'light' | 'dark')를 기반으로 실제 HTML에 적용될 테마('light' | 'dark')를 계산합니다.
     * @param {string} preference - 사용자가 선택한 선호도
     * @returns {string} 실제 렌더링될 테마 ('light' 또는 'dark')
     */
    function resolveTheme(preference) {
        if (preference === 'light') {
            return 'light';
        }
        if (preference === 'dark') {
            return 'dark';
        }
        // 'system'이거나 정의되지 않은 값인 경우 OS 환경 설정을 반영합니다.
        return getSystemPrefersDark() ? 'dark' : 'light';
    }

    /**
     * 로컬 스토리지에 캐시된 테마 선호도를 가져옵니다.
     * 값이 없거나 유효하지 않은 경우 'system'을 반환합니다.
     * @returns {string} 테마 선호도
     */
    function getCachedPreference() {
        try {
            var cached = localStorage.getItem(THEME_STORAGE_KEY);
            if (cached && VALID_PREFERENCES.indexOf(cached) !== -1) {
                return cached;
            }
        } catch (storageError) {
            console.warn('[테마 시스템] 로컬 스토리지 읽기 실패:', storageError);
        }
        return 'system';
    }

    /**
     * 테마 선호도를 설정하고 화면에 즉시 렌더링 테마를 적용합니다.
     * @param {string} newPreference - 설정할 선호도 ('system', 'light', 'dark')
     * @param {boolean} shouldPersistLocally - 로컬 스토리지에 저장할지 여부
     */
    function applyPreference(newPreference, shouldPersistLocally) {
        if (VALID_PREFERENCES.indexOf(newPreference) === -1) {
            newPreference = 'system';
        }
        activePreference = newPreference;

        // 실제 렌더링에 사용할 테마 계산 ('light' 또는 'dark')
        var resolvedTheme = resolveTheme(activePreference);

        // HTML 루트(<html>) 태그의 data-theme 속성에 테마 주입
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', resolvedTheme);
        }

        // 로컬 스토리지 캐시 갱신 (새로고침 시 조기 복원에 활용)
        if (shouldPersistLocally !== false) {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, activePreference);
            } catch (storageError) {
                console.warn('[테마 시스템] 로컬 스토리지 저장 실패:', storageError);
            }
        }

        // 혹시 페이지 내에 이전 버전의 드롭다운(#theme-select)이 존재할 경우 동기화
        syncDropdownIfPresent(activePreference);
    }

    /**
     * 화면 내에 레거시 테마 드롭다운(#theme-select)이 존재하는 경우 선택값을 동기화합니다.
     * @param {string} themeValue - 동기화할 값
     */
    function syncDropdownIfPresent(themeValue) {
        var selectElement = document.getElementById('theme-select');
        if (selectElement) {
            // 드롭다운 옵션에 system이 없는 경우 resolved된 light/dark로 매핑
            var hasSystemOption = false;
            for (var i = 0; i < selectElement.options.length; i++) {
                if (selectElement.options[i].value === 'system') {
                    hasSystemOption = true;
                    break;
                }
            }
            if (hasSystemOption) {
                selectElement.value = themeValue;
            } else {
                selectElement.value = resolveTheme(themeValue);
            }
        }
    }

    /**
     * 서버의 선호도 API(/api/me/preferences)를 호출하여 서버 저장값을 우선 적용합니다.
     * 무인증(401) 또는 네트워크 실패 시 안전하게 시스템(system) 모드로 폴백합니다.
     */
    function syncWithServer() {
        fetch('/api/me/preferences', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            // 401 Unauthorized(미로그인)이거나 다른 상태 코드인 경우 조용히 system fallback
            return null;
        })
        .then(function (data) {
            if (data && data.theme && VALID_PREFERENCES.indexOf(data.theme) !== -1) {
                // 로그인 후: 서버에 저장된 테마 값을 최우선 적용
                applyPreference(data.theme, true);
            } else {
                // 로그인 전 또는 서버 데이터 없음: 로컬 캐시가 없으면 system 기본값 유지
                var cached = getCachedPreference();
                applyPreference(cached, false);
            }
        })
        .catch(function () {
            // 네트워크 오류 또는 서버 응답 불가 시 조용히 캐시/시스템 테마 유지 (에러 전파 방지)
            var cached = getCachedPreference();
            applyPreference(cached, false);
        });
    }

    // =========================================================================
    // [1단계: 조기 복원 실행 (Early Restore Execution - FOUC 방지)]
    // HTML 파싱 중 스크립트 로드 즉시 로컬 캐시(또는 system) 기반으로 data-theme을 선부여합니다.
    // =========================================================================
    var cachedInitial = getCachedPreference();
    activePreference = cachedInitial;
    var initialResolved = resolveTheme(cachedInitial);
    if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', initialResolved);
    }

    // =========================================================================
    // [2단계: 서버 저장값 비동기 동기화 및 이벤트 리스너 등록]
    // =========================================================================
    function onInit() {
        // 서버의 최신 저장값 조회 및 반영
        syncWithServer();

        // 레거시 #theme-select 요소가 있다면 변경 이벤트 바인딩
        var selectElement = document.getElementById('theme-select');
        if (selectElement) {
            selectElement.addEventListener('change', function (event) {
                applyPreference(event.target.value, true);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onInit);
    } else {
        onInit();
    }

    // =========================================================================
    // [3단계: OS 다크 모드 실시간 변경 감지]
    // 사용자가 'system' 선호도를 사용하는 중에 OS의 다크/라이트 모드가 바뀌면 즉시 화면을 갱신합니다.
    // =========================================================================
    if (window.matchMedia) {
        try {
            var colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            var handleColorSchemeChange = function () {
                if (activePreference === 'system') {
                    var newResolved = resolveTheme('system');
                    if (document.documentElement) {
                        document.documentElement.setAttribute('data-theme', newResolved);
                    }
                    syncDropdownIfPresent('system');
                }
            };
            if (colorSchemeQuery.addEventListener) {
                colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
            } else if (colorSchemeQuery.addListener) {
                colorSchemeQuery.addListener(handleColorSchemeChange);
            }
        } catch (mediaError) {
            console.warn('[테마 시스템] OS 미디어 쿼리 감지 등록 실패:', mediaError);
        }
    }

    // =========================================================================
    // [4단계: 다중 탭 간 로컬 스토리지 동기화]
    // 다른 탭에서 테마를 변경했을 때 실시간으로 현재 탭에도 반영합니다.
    // =========================================================================
    window.addEventListener('storage', function (event) {
        if (event.key === THEME_STORAGE_KEY && event.newValue) {
            if (VALID_PREFERENCES.indexOf(event.newValue) !== -1) {
                applyPreference(event.newValue, false);
            }
        }
    });

    // =========================================================================
    // [5단계: 외부 공개 인터페이스 (Public API)]
    // 설정 페이지나 외부 모듈에서 테마 제어에 활용할 수 있도록 window.PlatformTheme 객체를 노출합니다.
    // =========================================================================
    window.PlatformTheme = {
        getTheme: function () {
            return resolveTheme(activePreference);
        },
        getPreference: function () {
            return activePreference;
        },
        setTheme: function (newTheme) {
            applyPreference(newTheme, true);
        },
        syncWithServer: syncWithServer,
        storageKey: THEME_STORAGE_KEY
    };
})();
