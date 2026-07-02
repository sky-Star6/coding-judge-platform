
        MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']]
            },
            svg: { fontCache: 'global' }
        };
    

        // 백엔드 API 주소 (동일한 도메인이므로 상대 경로를 사용합니다)
        const API_BASE_URL = '/api';

        // --- 로그인 즉시 검증 ---
        const userId = localStorage.getItem('user_id');
        const nickname = localStorage.getItem('nickname');
        const userRole = localStorage.getItem('role') || 'level_3';

        if (!userId) {
            window.location.href = 'auth.html';
        }

        // 등급을 한글 및 색상 뱃지로 바꿔주는 함수
        function getRoleBadgeHtml(role) {
            if (role === 'admin') return '<span class="badge" style="background-color: #9C27B0; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">👑 관리자</span>';
            if (role === 'level_1_adv') return '<span class="badge" style="background-color: #D32F2F; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">🥇 1급(고급)</span>';
            if (role === 'level_1') return '<span class="badge" style="background-color: #F44336; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">🥇 1급(기본)</span>';
            if (role === 'level_2_adv') return '<span class="badge" style="background-color: #F57C00; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">🥈 2급(고급)</span>';
            if (role === 'level_2') return '<span class="badge" style="background-color: #FF9800; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">🥈 2급(기본)</span>';
            if (role === 'level_3_adv') return '<span class="badge" style="background-color: #388E3C; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">🥉 3급(고급)</span>';
            return '<span class="badge" style="background-color: #4CAF50; color: white; padding: 2px 6px; font-size: 0.8rem; border-radius: 4px;">🥉 3급(기본)</span>';
        }

        // 헤더 닉네임 교체
        document.getElementById('nav-nickname').innerHTML = `${nickname} ${getRoleBadgeHtml(userRole)}`;

        function logout() {
            localStorage.clear();
            window.location.href = 'auth.html';
        }

        let editor;
        let currentProblemId = null;
        let currentProblemTitle = "Untitled";
        let currentProblemInitialCodePython = "";
        let currentProblemInitialCodeJava = "";

        let isBlankProblem = false; // 빈칸 문제 여부 플래그
        let currentDecorations = []; // [27단계] 빈칸 하이라이트 ID 배열
        let isSubmitting = false; // [36단계] 채점 중복 클릭 방지 플래그
        let isPreventCopy = false; // [40단계] 복사 방지 플래그

        /* --- [신규 추가] AI 챗봇 튜터 관련 전역 변수 초기화 --- */
        let aiUsed = false;            // AI의 도움을 받았는지 기록하는 전역 플래그(Flag)
        let remainingSeconds = 600;    // 10분 잠금 카운트다운 타이머용 잔여 초 변수
        let timerInterval = null;      // 타이머의 setInterval 인스턴스 홀더
        let chatCooldownTimer = null;  // [신규] 쿨다운(Cooldown) 카운트다운 타이머 인스턴스
        let chatDailyRemaining = 10;   // [신규] 오늘 남은 AI 질문 횟수 (서버 응답으로 동기화)

        // [보안 강화] 전역 복사(Copy), 붙여넣기(Paste), 잘라내기(Cut), 우클릭(Context Menu) 전면 제한
        window.addEventListener('copy', function (e) {
            if (isPreventCopy) {
                e.preventDefault();
                alert("보안 정책(Security Policy)에 따라 고급 문제는 화면 내 텍스트 및 코드 복사가 금지되어 있습니다.");
            }
        });
        window.addEventListener('cut', function (e) {
            if (isPreventCopy) {
                e.preventDefault();
                alert("보안 정책(Security Policy)에 따라 고급 문제는 잘라내기(Cut) 기능이 금지되어 있습니다.");
            }
        });
        window.addEventListener('paste', function (e) {
            if (isPreventCopy) {
                e.preventDefault();
                alert("보안 정책(Security Policy)에 따라 고급 문제는 외부 코드 무단 도용 방지를 위해 붙여넣기가 제한됩니다.\n직접 구현해 주세요.");
            }
        });
        window.addEventListener('contextmenu', function (e) {
            if (isPreventCopy) {
                e.preventDefault();
            }
        });

        // [보안 강화] 개발자 도구 및 취약 단축키 제한 (F12, 소스 보기 Ctrl+U, 저장 Ctrl+S, 개발자 도구 창 단축키)
        window.addEventListener('keydown', function (e) {
            if (!isPreventCopy) return;

            // F12 키(Keycode 123) 제한
            if (e.keyCode === 123) {
                e.preventDefault();
                alert("고급 문제 시험 진행 중에는 개발자 도구(Developer Tools)를 열 수 없습니다.");
                return false;
            }
            // Ctrl + Shift + I / J / C (개발자 도구 단축키) 제한
            if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                e.preventDefault();
                alert("고급 문제 시험 진행 중에는 개발자 도구(Developer Tools)를 사용할 수 없습니다.");
                return false;
            }
            // Ctrl + U (웹페이지 소스 보기) 제한
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                alert("고급 문제 시험 진행 중에는 소스 보기(View Source)가 제한됩니다.");
                return false;
            }
            // Ctrl + S (웹페이지 파일로 저장) 제한
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                alert("고급 문제 시험 진행 중에는 페이지 저장 기능이 제한됩니다.");
                return false;
            }
        });

        // [보안 강화] 화면 캡처 방지 보완 기법: PrintScreen 키 입력 시 클립보드 강제 삭제
        window.addEventListener('keyup', function (e) {
            if (isPreventCopy && (e.key === 'PrintScreen' || e.keyCode === 44)) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText("화면 캡처 행위가 감지되어 클립보드 데이터가 즉시 초기화되었습니다.").then(() => {
                        alert("고급 문제 영역에서는 화면 캡처 및 PrintScreen 단축키의 사용이 엄격히 금지되어 있습니다.");
                    }).catch(err => {
                        console.error("클립보드 데이터 초기화 오류:", err);
                    });
                } else {
                    alert("고급 문제 영역에서는 화면 캡처 및 PrintScreen 단축키의 사용이 엄격히 금지되어 있습니다.");
                }
            }
        });

        // [보안 강화] 브라우저 창이 포커스를 잃을 때(캡처 도구 실행 또는 타 프로그램 활성화 시) 화면을 일시적으로 흐리게(Blur) 만드는 보호망 작동
        window.addEventListener('blur', function () {
            if (isPreventCopy) {
                document.body.style.filter = 'blur(15px)';
            }
        });
        window.addEventListener('focus', function () {
            if (isPreventCopy) {
                document.body.style.filter = 'none';
            }
        });

        // 빈칸(underlines 및 @@@) 구역을 파싱하고 하이라이팅하는 매니저
        window.applyBlankZones = function () {
            if (!isBlankProblem) {
                currentDecorations = editor.deltaDecorations(currentDecorations, []);
                return;
            }
            const model = editor.getModel();
            const val = model.getValue();
            const lines = val.split(/\r?\n/);
            const newDecorations = [];
            let contentChanged = false;

            // [31단계] @@@ 혹은 ___ 기호 모두 통용되도록 정규식 스위칭 개조
            const regex = /(@@@+|___+)/g;

            for (let i = 0; i < lines.length; i++) {
                let match;
                // 정규식 실행 루프 (치환된 문자열 길이와 원래 길이가 매치되므로 무한루프 없음)
                while ((match = regex.exec(lines[i])) !== null) {
                    const startCol = match.index + 1;
                    const endCol = match.index + match[0].length + 1;

                    newDecorations.push({
                        range: new monaco.Range(i + 1, startCol, i + 1, endCol),
                        options: {
                            inlineClassName: 'monaco-blank-zone',
                            stickiness: monaco.editor.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
                        }
                    });

                    // 핵심: 기호 덩어리를 완벽히 똑같은 길이의 스페이스바(투명 공백)로 둔갑시켜 흰 박스 속에 넣음
                    const spaces = " ".repeat(match[0].length);
                    lines[i] = lines[i].substring(0, match.index) + spaces + lines[i].substring(match.index + match[0].length);
                    contentChanged = true;
                }
            }

            if (contentChanged) {
                // 파싱된 흔적(기호 -> 공백치환본)을 다시 에디터 뼈대로 덮어씌움
                editor.setValue(lines.join('\n'));
            }

            // 데코레이션(흰색 테두리 박스)을 강제로 덧씌워 유저가 타이핑할 수 있는 하얀 폼 영역 활성화
            currentDecorations = editor.deltaDecorations(currentDecorations, newDecorations);
        };

        // URL 파라미터에서 특정 문제 ID 읽어오기 (?id=1)
        const urlParams = new URLSearchParams(window.location.search);
        const urlProblemId = urlParams.get('id');

        // 1. 레이아웃 초기화
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // [29단계] 폰 진입 시 위아래 방향으로 틀고 폰트 확대
            Split(['#problem-panel', '#right-container'], { direction: 'vertical', sizes: [40, 60], minSize: 150, gutterSize: 8 });
        } else {
            // PC 데스크톱 기본 모드
            Split(['#problem-panel', '#right-container'], { sizes: [40, 60], minSize: 300, gutterSize: 6 });
        }
        Split(['#editor-panel', '#console-panel'], { sizes: [70, 30], direction: 'vertical', minSize: 100, gutterSize: 6 });

        // 2. Monaco 에디터 생성
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
                value: '로딩 중...',
                language: 'python',
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: 16,
                minimap: { enabled: false }
            });

            if (urlProblemId) {
                currentProblemId = parseInt(urlProblemId);
                loadProblemDetail(currentProblemId);
            } else {
                document.getElementById('problem-desc-text').innerHTML = `<span class="status-wa">오류: 선택된 문제가 없습니다. 홈 화면에서 문제를 선택해 주세요.</span>`;
            }

            // [27단계] 키보드 블록 이벤트 커스텀 (빈칸 구역 외 타이핑/지우기 원천 차단 및 복사/붙여넣기 제어)
            editor.onKeyDown(function (e) {
                // [보안 강화] 복사 방지(isPreventCopy) 상태일 때 에디터 내부의 복사/붙여넣기/잘라내기(Ctrl+C, Ctrl+V, Ctrl+X) 원천 제한
                if (isPreventCopy) {
                    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
                    const isCopy = e.keyCode === monaco.KeyCode.KeyC;
                    const isPaste = e.keyCode === monaco.KeyCode.KeyV;
                    const isCut = e.keyCode === monaco.KeyCode.KeyX;

                    if (isCtrlOrMeta && (isCopy || isPaste || isCut)) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isCopy) {
                            alert("보안 정책에 따라 이 문제의 코드는 복사(Copy)할 수 없습니다.");
                        } else if (isPaste) {
                            alert("보안 정책에 따라 이 문제에는 외부 코드를 붙여넣기(Paste)할 수 없습니다. 직접 타이핑하여 작성해 주세요.");
                        } else if (isCut) {
                            alert("보안 정책에 따라 이 문제의 코드는 잘라내기(Cut)할 수 없습니다.");
                        }
                        return;
                    }
                }

                if (!isBlankProblem) return;

                const pos = editor.getPosition();
                const model = editor.getModel();

                let isInside = false;
                for (let id of currentDecorations) {
                    const range = model.getDecorationRange(id);
                    if (range && pos.lineNumber === range.startLineNumber && pos.column >= range.startColumn && pos.column <= range.endColumn) {
                        isInside = true;
                        break;
                    }
                }

                // 이동 키나 기능 키, 복붙(Ctrl+C 등)은 허용 (복사방지가 켜져 있으면 위에서 이미 다 걸러집니다)
                const allowedKeys = [
                    monaco.KeyCode.LeftArrow, monaco.KeyCode.RightArrow,
                    monaco.KeyCode.UpArrow, monaco.KeyCode.DownArrow,
                    monaco.KeyCode.PageUp, monaco.KeyCode.PageDown,
                    monaco.KeyCode.Home, monaco.KeyCode.End,
                    monaco.KeyCode.Escape, monaco.KeyCode.F5,
                    monaco.KeyCode.Ctrl, monaco.KeyCode.Alt, monaco.KeyCode.Shift
                ];

                // 백스페이스 특별 예외 (빈칸 안쪽이라도 커서가 맨 앞이면 윗줄(밖)을 지우므로 차단)
                if (e.keyCode === monaco.KeyCode.Backspace) {
                    let isAtStart = false;
                    for (let id of currentDecorations) {
                        const range = model.getDecorationRange(id);
                        if (range && pos.lineNumber === range.startLineNumber && pos.column === range.startColumn) {
                            isAtStart = true;
                            break;
                        }
                    }
                    if (isAtStart) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }

                // 커서가 빈칸(isInside) 밖이고, 허용된 방향키 조작이 아니라면 다 막아버립니다. (Read-Only)
                if (!isInside && !allowedKeys.includes(e.keyCode)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        });

        // 언어 변경 시 처리
        function changeLanguage() {
            const lang = document.getElementById('language-select').value;
            const headerText = document.getElementById('editor-header-text');

            if (lang === 'python3') {
                monaco.editor.setModelLanguage(editor.getModel(), "python");
                headerText.textContent = "코드 작성 (Python 3)";
                resetEditorCode("python3");
            } else if (lang === 'java') {
                monaco.editor.setModelLanguage(editor.getModel(), "java");
                headerText.textContent = "코드 작성 (Java 17)";
                resetEditorCode("java");
            }
        }

        let currentFontSize = 16;
        function changeFontSize(delta) {
            currentFontSize += delta;
            if (currentFontSize < 10) currentFontSize = 10;
            if (currentFontSize > 36) currentFontSize = 36;
            editor.updateOptions({ fontSize: currentFontSize });
        }

        function resetToInitialCode() {
            if (confirm("정말 처음 상태 코드로 덮어씌울까요?\n지금까지 작성하신 코드는 모두 지워집니다.")) {
                const lang = document.getElementById('language-select').value;
                resetEditorCode(lang);
            }
        }

        // 언어별 기초 코드 세팅 (15단계: 파이썬/자바 투트랙 최우선 적용)
        function resetEditorCode(lang) {
            // [A] 파이썬 선택 시
            if (lang === "python3") {
                if (currentProblemInitialCodePython && currentProblemInitialCodePython.trim() !== '') {
                    editor.setValue(currentProblemInitialCodePython);
                } else {
                    const pyCode = `# [${currentProblemTitle}] 코드를 작성하세요.
def solution(a, b):
    answer = 0
    return answer

# 아래는 채점 환경을 위한 기본 코드입니다.
a, b = map(int, input().split())
print(solution(a, b))`;
                    editor.setValue(pyCode);
                }
            }
            // [B] 자바 선택 시
            else if (lang === "java") {
                if (currentProblemInitialCodeJava && currentProblemInitialCodeJava.trim() !== '') {
                    editor.setValue(currentProblemInitialCodeJava);
                } else {
                    const javaCode = `import java.util.Scanner;

// 주의: 클래스 이름은 반드시 Main으로 유지해야 합니다.
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // [${currentProblemTitle}] 입력을 받고 로직을 구현하세요.
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(a + b);
        }
        sc.close();
    }
}`;
                    editor.setValue(javaCode);
                }
            }

            // 구역 재설정을 위해 짧게 딜레이를 주어 확실히 하이라이팅되도록 함
            setTimeout(window.applyBlankZones, 50);
        }

        // 3. 선택된 문제의 상세 정보를 가져와 왼쪽 화면과 에디터를 갱신하는 함수
        async function loadProblemDetail(problemId) {
            try {
                const response = await fetch(`${API_BASE_URL}/problems/${problemId}`);
                if (!response.ok) throw new Error("문제 상세 정보 로딩 실패");

                const data = await response.json();

                // 권한(등급) 2차 검증: URL을 수동으로 치고 들어오더라도 난이도(difficulty)를 걸고 넘어집니다.
                let isLocked = false;
                if (userRole === 'level_3' && data.difficulty > 1) isLocked = true;
                if (userRole === 'level_2' && data.difficulty > 2) isLocked = true;
                if (userRole === 'admin') isLocked = false;

                if (isLocked) {
                    alert("이 문제에 접근할 권한(등급)이 부족합니다.");
                    window.location.href = "index.html";
                    return;
                }

                currentProblemTitle = data.title;
                currentProblemInitialCodePython = data.initial_code_python || data.initial_code || "";
                currentProblemInitialCodeJava = data.initial_code_java || "";

                // [27단계 락] 빈칸 채우기 문제일 경우 읽기 전용 락 체제를 켭니다.
                isBlankProblem = (data.problem_type === 'blank');

                // [보안 강화] 복사 방지 설정 적용: 개별 문제 설정(prevent_copy === 1) 혹은 등급별 고급 문제(난이도 2: 3급고급, 4: 2급고급, 6: 1급고급)인 경우 강제 적용
                isPreventCopy = (data.prevent_copy === 1 || [2, 4, 6].includes(data.difficulty));
                const problemContentDiv = document.getElementById('problem-content');
                const mainBody = document.body;
                if (isPreventCopy) {
                    problemContentDiv.classList.add('no-copy');
                    mainBody.classList.add('no-select');
                    // Monaco 에디터의 우클릭 컨텍스트 메뉴(Context Menu) 비활성화 연동
                    if (editor) {
                        editor.updateOptions({ contextmenu: false });
                    }
                } else {
                    problemContentDiv.classList.remove('no-copy');
                    mainBody.classList.remove('no-select');
                    if (editor) {
                        editor.updateOptions({ contextmenu: true });
                    }
                }

                // [36단계] 지원 언어에 따라 언어 선택 옵션 필터링
                const supportedLangs = (data.supported_languages || 'python3,java').split(',');
                const langSelect = document.getElementById('language-select');
                const pythonOpt = langSelect.querySelector('option[value="python3"]');
                const javaOpt = langSelect.querySelector('option[value="java"]');

                if (pythonOpt) pythonOpt.style.display = supportedLangs.includes('python3') ? '' : 'none';
                if (javaOpt) javaOpt.style.display = supportedLangs.includes('java') ? '' : 'none';

                // 현재 선택된 언어가 비활성화된 경우 지원되는 첫 번째 언어로 자동 전환
                if (!supportedLangs.includes(langSelect.value)) {
                    langSelect.value = supportedLangs[0];
                    changeLanguage();
                }

                // 화면 상단 제목
                document.getElementById('header-problem-name').textContent = `[문제 ${data.display_id}] ${data.title}`;
                // [32단계 ④] 난이도 기억 (이전/다음 버튼용)
                currentProblemDifficulty = data.difficulty;

                // 왼쪽 패널(문제 설명) 갱신
                document.querySelector('.problem-title').textContent = `[문제 ${data.display_id}] ${data.title}`;
                document.querySelector('.problem-meta').textContent = `시간 제한: ${data.time_limit}초 | 메모리 제한: ${data.memory_limit}MB`;

                // [26단계] 문제 유형별 전용 안내 배너 (띠 배너) 주입
                let typeBannerHtml = '';
                if (data.problem_type === 'blank') {
                    typeBannerHtml = `<div style="background-color: #3b2818; border-left: 5px solid #ff9800; color: #ffb74d; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; font-weight: bold; line-height: 1.5;">
                        🧩 [빈칸 채우기 문제]<br>
                        <span style="font-weight: normal; font-size: 0.95em; color: #ddd;">우측 템플릿 코드에서 비어있는 지점(흰색 빈칸)을 알맞은 코드로 바꿔 완성하세요!</span>
                    </div>`;
                } else if (data.problem_type === 'debugging') {
                    typeBannerHtml = `<div style="background-color: #3b1c1c; border-left: 5px solid #f44336; color: #ef9a9a; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; font-weight: bold; line-height: 1.5;">
                        🛠️ [디버깅 수정 문제]<br>
                        <span style="font-weight: normal; font-size: 0.95em; color: #ddd;">우측 초기 코드에 심어진 논리적 오류나 잘못된 부분을 <b>단 한두 줄만</b> 고쳐 정상 동작하게 만드세요!</span>
                    </div>`;
                }

                const descHtml = marked.parse(data.description);
                document.getElementById('problem-desc-text').innerHTML = typeBannerHtml + descHtml;

                // [25단계] 마크다운 파싱 직후 수식 렌더링 비동기 트리거
                if (window.MathJax) {
                    MathJax.typesetPromise([document.getElementById('problem-desc-text')]).catch(function (err) {
                        console.error('MathJax 렌더링 오류:', err.message);
                    });
                }

                // 왼쪽 하단(테스트 케이스) 갱신
                const examplesDiv = document.getElementById('problem-examples');
                examplesDiv.innerHTML = '';
                data.examples.forEach((ex, idx) => {
                    examplesDiv.innerHTML += `
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr>
                                    <th style="width: 50%; text-align: left; color: #aaa; padding-bottom: 8px; font-weight: bold; font-size: 0.95em;">입력 ${idx + 1}</th>
                                    <th style="width: 50%; text-align: left; color: #aaa; padding-bottom: 8px; padding-left: 10px; font-weight: bold; font-size: 0.95em;">출력 ${idx + 1}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="vertical-align: top; padding-right: 5px;">
                                        <div class="test-case-box" style="margin: 0; min-height: 40px;">${ex.input_data || "(입력값 없음)"}</div>
                                    </td>
                                    <td style="vertical-align: top; padding-left: 5px;">
                                        <div class="test-case-box" style="margin: 0; min-height: 40px; border-left: 3px solid #007acc;">${ex.expected_output}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                });

                // 문제에 맞게 에디터 초기화 (현재 선택된 언어 기준)
                const currentLang = document.getElementById('language-select').value;
                resetEditorCode(currentLang);

                // 실행 콘솔 화면도 초기화
                document.getElementById('console-output').innerHTML = "문제 세팅이 완료되었습니다. 코드를 작성해 보세요.";

                // [신규] 문제 로드가 완전히 끝나면 AI 챗봇 10분 카운트다운 타이머를 기동합니다.
                startChatbotTimer();

            } catch (error) {
                document.getElementById('problem-desc-text').innerHTML = `<span class="status-wa">오류: ${error.message}</span>`;
            }
        }

        // 4. [제출 후 채점하기] 버튼 동작
        function submitCode() {
            if (!currentProblemId) {
                alert("먼저 문제를 선택해 주세요.");
                return;
            }

            // [36단계] 채점 중 중복 클릭 방지
            if (isSubmitting) {
                return; // 이미 채점 중이면 무시
            }
            isSubmitting = true;
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '채점 중... ⏳';
            submitBtn.style.opacity = '0.5';

            let userCode = editor.getValue();
            const consoleOutput = document.getElementById('console-output');
            const selectedLang = document.getElementById('language-select').value;

            if (!userCode.trim()) {
                alert("코드를 입력해주세요.");
                // 버튼 복원
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.textContent = '제출 후 채점하기';
                submitBtn.style.opacity = '1';
                return;
            }

            // [36단계] 빈칸 문제일 때: 빈칸 구역 내의 남은 여분 공백(패딩)을 자동 제거
            if (isBlankProblem && editor) {
                const model = editor.getModel();
                const lines = userCode.split(/\r?\n/);
                // 데코레이션(빈칸 구역)을 뒤에서부터 처리하여 인덱스 꼬임 방지
                const zones = [];
                for (let id of currentDecorations) {
                    const range = model.getDecorationRange(id);
                    if (range) zones.push(range);
                }
                // 같은 줄 내에서 뒤쪽 구역부터 처리
                zones.sort((a, b) => b.startLineNumber - a.startLineNumber || b.startColumn - a.startColumn);

                for (const range of zones) {
                    const lineIdx = range.startLineNumber - 1;
                    const startCol = range.startColumn - 1;
                    const endCol = range.endColumn - 1;
                    const line = lines[lineIdx];
                    if (!line) continue;

                    // 빈칸 구역 안의 텍스트 추출
                    const zoneText = line.substring(startCol, endCol);
                    // 양쪽 끝의 여분 공백(패딩)을 모두 잘라냄 (사용자 요청 사항)
                    const trimmedZone = zoneText.trim();
                    // 줄 재조립 (왼쪽 + 트림된 빈칸 텍스트 + 오른쪽)
                    lines[lineIdx] = line.substring(0, startCol) + trimmedZone + line.substring(endCol);
                }
                userCode = lines.join('\n');
            }

            consoleOutput.innerHTML = "서버로 코드를 전송 중입니다... ⏳";

            fetch(`${API_BASE_URL}/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    problem_id: currentProblemId,
                    language: selectedLang,
                    code: userCode,
                    ai_used: aiUsed ? 1 : 0 // [신규] AI 도움 사용 여부 플래그 전달
                })
            })
                .then(res => res.json())
                .then(data => {
                    const subId = data.submission_id;
                    consoleOutput.innerHTML = `제출 완료! (채점 번호: ${subId}, 언어: ${selectedLang})<br>채점을 진행 중입니다... 🔄`;
                    pollSubmissionResult(subId); // 채점 확인 함수 호출
                })
                .catch(err => {
                    consoleOutput.innerHTML = `<span class="status-wa">서버 연결 오류: ${err.message}</span>`;
                    // [36단계] 에러 시에도 버튼 복원
                    isSubmitting = false;
                    submitBtn.disabled = false;
                    submitBtn.textContent = '제출 후 채점하기';
                    submitBtn.style.opacity = '1';
                });
        }

        // 5. 채점이 끝날 때까지 1초마다 문의하는 함수
        function pollSubmissionResult(submissionId) {
            const consoleOutput = document.getElementById('console-output');
            const interval = setInterval(() => {
                fetch(`${API_BASE_URL}/submissions/${submissionId}`)
                    .then(res => res.json())
                    .then(data => {
                        const status = data.status;
                        if (status === 'Pending') {
                            consoleOutput.innerHTML += " .";
                        } else {
                            clearInterval(interval);
                            let resultHtml = `<br><br><b>--- 채점 결과 ---</b><br>`;
                            if (status === 'AC') resultHtml += `<span class="status-ac">🟢 정답입니다! (Accepted)</span>`;
                            else if (status === 'AC_AI') {
                                resultHtml += `<span class="status-wa" style="color: #94a3b8; text-shadow: 0 0 5px rgba(148, 163, 184, 0.4);">⚪ 정답 (AI 힌트 도움으로 무효)</span>`;
                                resultHtml += `<div style="background: rgba(148, 163, 184, 0.15); border-left: 4px solid #94a3b8; padding: 12px; border-radius: 6px; color: #cbd5e1; margin-top: 10px; font-size: 0.9em; line-height: 1.6;">
                                    ⚠️ <b>안내</b>: AI 튜터의 힌트/설명을 사용했으므로 정답으로 인정되지만 공식 순위 및 통계 점수에는 반영되지 않는 <b>AC_AI 상태</b>로 무효화되었습니다.<br>
                                    <span style="color: var(--accent-color); font-weight: bold;">[해결책]</span>: 브라우저를 <b>새로고침(F5)</b>하거나 <b>다른 문제 페이지에 다녀온 뒤</b>, AI 챗봇을 한 번도 사용하지 않고 오직 본인의 힘으로만 문제를 완벽히 코딩하여 제출하면 공식 정답(Accepted)을 공인받으실 수 있습니다!
                                </div>`;
                            }
                            else if (status === 'WA') resultHtml += `<span class="status-wa">🔴 틀렸습니다. (Wrong Answer)</span>`;
                            else if (status === 'TLE') resultHtml += `<span class="status-tle">🟡 시간 초과 (Time Limit Exceeded)</span>`;
                            else if (status === 'RE') resultHtml += `<span class="status-re">🟣 런타임 에러 (Runtime Error)</span>`;
                            else if (status === 'CE') resultHtml += `<span class="status-re" style="color:orange;">🟠 컴파일 에러 (Compile Error)</span>`;
                            else if (status.startsWith('RV')) resultHtml += `<span class="status-wa" style="color:#d32f2f; font-weight:bold;">⛔ ${status}</span>`;
                            else resultHtml += `<span class="status-wa">알 수 없는 에러 (${status})</span>`;

                            resultHtml += `<br>최대 소요 시간: ${data.time_used.toFixed(3)}초`;

                            // [32단계 ⑤] 실제 프로그램 출력값 표시
                            if (data.actual_output !== undefined && data.actual_output !== null) {
                                resultHtml += `<br><br><b>📋 프로그램 출력:</b><pre style="background:#1a1a1a; padding:10px; border-radius:4px; border:1px solid #444; margin-top:5px; color:#d4d4d4; white-space:pre-wrap; word-break:break-all;">${data.actual_output}</pre>`;
                            }

                            consoleOutput.innerHTML += resultHtml;

                            // [36단계 & 40단계] 채점 완료 → 정답(AC) 시에는 버튼 비활성화 유지, 오답일 때만 재제출 허용
                            isSubmitting = false;
                            const submitBtn = document.getElementById('submit-btn');

                            if (status === 'AC') {
                                submitBtn.disabled = true;
                                submitBtn.textContent = '이미 성공한 문제입니다';
                                submitBtn.style.opacity = '0.5';
                            } else if (status === 'AC_AI') {
                                submitBtn.disabled = false;
                                submitBtn.textContent = '스스로 다시 풀기 제출';
                                submitBtn.style.opacity = '1';
                            } else {
                                submitBtn.disabled = false;
                                submitBtn.textContent = '제출 후 다시 채점하기';
                                submitBtn.style.opacity = '1';
                            }
                        }
                    })
                    .catch(err => {
                        clearInterval(interval);
                        // [36단계] 통신 오류 시에도 버튼 복원
                        isSubmitting = false;
                        const submitBtn = document.getElementById('submit-btn');
                        submitBtn.disabled = false;
                        submitBtn.textContent = '제출 후 채점하기';
                        submitBtn.style.opacity = '1';
                    });
            }, 1000);
        }

        // [32단계 ④] 이전/다음 문제 이동 (같은 난이도 내 ID 순서)
        let problemListCache = []; // 문제 목록 캐시
        let currentProblemDifficulty = null;

        async function loadProblemNavList() {
            try {
                const response = await fetch(`${API_BASE_URL}/problems?user_id=${userId}`);
                const data = await response.json();
                // [33단계] display_id 오름차순 정렬 (이전/다음이 번호 순서대로 이동)
                problemListCache = data.problems.sort((a, b) => a.display_id - b.display_id);
            } catch (e) { console.error('문제 목록 로드 실패:', e); }
        }

        // 페이드아웃 후 페이지 이동하는 트랜지션 함수
        function navigateWithTransition(url) {
            document.body.classList.add('page-leaving');
            setTimeout(() => { window.location.href = url; }, 280);
        }

        function goToPrevProblem() {
            if (!problemListCache.length || !currentProblemId) return;
            const sameDiff = problemListCache.filter(p => String(p.difficulty) === String(currentProblemDifficulty));
            const idx = sameDiff.findIndex(p => p.id === currentProblemId);
            if (idx > 0) {
                navigateWithTransition(`judge.html?id=${sameDiff[idx - 1].id}`);
            }
        }

        function goToNextProblem() {
            if (!problemListCache.length || !currentProblemId) return;
            const sameDiff = problemListCache.filter(p => String(p.difficulty) === String(currentProblemDifficulty));
            const idx = sameDiff.findIndex(p => p.id === currentProblemId);
            if (idx >= 0 && idx < sameDiff.length - 1) {
                navigateWithTransition(`judge.html?id=${sameDiff[idx + 1].id}`);
            }
        }

        // 페이지 로드 시 문제 목록 캐시 준비
        loadProblemNavList();

        /* --- [신규 추가] AI 챗봇 튜터 함수 정의 --- */

        // 챗봇 위젯 열기/닫기 토글 함수
        function toggleChatbot() {
            const widget = document.getElementById('ai-chatbot-widget');
            widget.classList.toggle('active');
            
            // 위젯이 활성화되었을 때 스크롤바를 맨 아래로 즉시 갱신합니다.
            if (widget.classList.contains('active')) {
                const container = document.getElementById('chat-messages-container');
                container.scrollTop = container.scrollHeight;
            }
        }

        // 문제 진입 또는 새로 로드 시 구동되는 타이머 제어 함수
        function startChatbotTimer() {
            // 이전에 설정된 타이머 인스턴스가 존재할 경우 리소스 누수 방지를 위해 해제합니다.
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            // AI 도움 및 시간 상태를 기본 값으로 세팅합니다.
            aiUsed = false;
            remainingSeconds = 600; // 정밀 10분(600초) 대기 구동

            const lockOverlay = document.getElementById('chat-lock-overlay');
            const countdownEl = document.getElementById('chat-lock-countdown');
            const headerTimerEl = document.getElementById('chat-header-timer-val');
            const inputField = document.getElementById('chat-input-field');
            const sendBtn = document.getElementById('chat-send-button');

            // 10분 타이머 가동 중에는 입력 폼을 엄격히 제한(Disabled)합니다.
            lockOverlay.style.opacity = '1';
            lockOverlay.style.pointerEvents = 'auto';
            inputField.disabled = true;
            sendBtn.disabled = true;
            inputField.placeholder = "스스로 생각할 시간! 10분 대기 후 활성화";

            // 초 단위의 값을 MM:SS 포맷팅 텍스트로 변환해 주는 이너 헬퍼 함수
            function refreshTimerUI() {
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                countdownEl.textContent = formatted;
                headerTimerEl.textContent = formatted;
            }

            refreshTimerUI();

            // 1초마다 실시간으로 잔여 시간을 줄이며 뷰를 갱신합니다.
            timerInterval = setInterval(() => {
                remainingSeconds--;

                if (remainingSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;

                    // 10분이 모두 만료되면 자물쇠 효과와 함께 폼 잠금을 완벽히 해제합니다.
                    lockOverlay.style.opacity = '0';
                    lockOverlay.style.pointerEvents = 'none';
                    inputField.disabled = false;
                    sendBtn.disabled = false;
                    inputField.placeholder = "AI 튜터에게 힌트 또는 에러 원인을 물어보세요...";
                    headerTimerEl.textContent = "🔓 활성";

                    // 챗 보드에 연한 민트색 톤의 해제 알림을 추가합니다.
                    const chatContainer = document.getElementById('chat-messages-container');
                    chatContainer.innerHTML += `
                        <div class="chat-bubble bot" style="background: rgba(45, 212, 191, 0.15); border-color: var(--accent-color); color: var(--accent-color); font-weight: 700; text-align: center; max-width: 90%; align-self: center; border-radius: 8px;">
                            🔓 AI 튜터 힌트방이 잠금 해제되었습니다!<br>
                            <span style="font-weight: normal; font-size: 0.9em; color: #cbd5e1;">힌트를 얻으시면 채점 시 공식 Accepted(정답) 기록에서 무효화(AC_AI 상태 부여)되니 최선을 다해 자력으로 먼저 풀어보세요.</span>
                        </div>
                    `;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                } else {
                    refreshTimerUI();
                }
            }, 1000);
        }

        // 사용자가 입력한 대화를 백엔드로 송신하는 비동기 처리 함수
        async function sendChatMessage() {
            const inputField = document.getElementById('chat-input-field');
            const chatContainer = document.getElementById('chat-messages-container');
            const questionText = inputField.value.trim();

            if (!questionText) return;

            // 전송 완료 즉시 인풋 입력창을 초기화합니다.
            inputField.value = "";

            // 유저 말풍선을 추가합니다.
            chatContainer.innerHTML += `<div class="chat-bubble user">${questionText}</div>`;
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // 최초로 질문을 전송한 순간 AI 패널티 도움 활성 상태(aiUsed = true)를 마킹합니다.
            if (!aiUsed) {
                aiUsed = true;
                chatContainer.innerHTML += `
                    <div class="chat-bubble bot" style="background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.3); color: #fecdd3; font-size: 0.85em; text-align: center; max-width: 90%; align-self: center; border-radius: 8px;">
                        🚨 AI 튜터 도움 이력이 활성화되었습니다! 현재 코드가 완벽히 맞아도 이번 제출은 공식 인정이 불가능(AC_AI)해집니다. 순수 자력 통과 기록을 복구하려면 F5를 눌러 처음부터 새롭게 풀어주세요.
                    </div>
                `;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            // AI의 응답 대기 💭 말풍선 마킹을 생성합니다.
            const tempBubbleId = `ai-wait-bubble-${Date.now()}`;
            chatContainer.innerHTML += `<div class="chat-bubble bot" id="${tempBubbleId}">생각 중... 💭</div>`;
            chatContainer.scrollTop = chatContainer.scrollHeight;

            try {
                const currentCode = editor ? editor.getValue() : "";
                const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problem_id: currentProblemId,
                        question: questionText,
                        user_code: currentCode,
                        user_id: parseInt(userId)  // [신규] 사용자 ID를 서버에 전송하여 일일 횟수/쿨다운 추적에 사용
                    })
                });

                // 응답 수신 즉시 대기 말풍선을 삭제합니다.
                const tempBubble = document.getElementById(tempBubbleId);
                if (tempBubble) tempBubble.remove();

                if (!response.ok) throw new Error("AI 튜터 응답 취득 실패");

                const result = await response.json();

                // [신규] 서버 응답에 쿨다운(cooldown) 또는 일일 제한(daily_limit) 에러가 포함된 경우 특별 처리
                if (result.error === 'cooldown') {
                    // 쿨다운 에러: 전송 버튼 및 입력 필드를 일시적으로 비활성화하고 남은 초를 실시간 표시
                    chatContainer.innerHTML += `<div class="chat-bubble bot" style="background: rgba(234, 179, 8, 0.12); border-color: rgba(234, 179, 8, 0.3); color: #fde68a; font-size: 0.9em; text-align: center; max-width: 90%; align-self: center; border-radius: 8px;">⏳ ${result.response}</div>`;
                    chatContainer.scrollTop = chatContainer.scrollHeight;

                    // 쿨다운 동안 입력 필드 잠금 + 실시간 카운트다운 표시
                    const sendBtn = document.getElementById('chat-send-button');
                    inputField.disabled = true;
                    sendBtn.disabled = true;
                    let cdRemain = result.cooldown_remaining || 30;
                    inputField.placeholder = `⏳ ${cdRemain}초 후 질문 가능...`;

                    // 기존 쿨다운 타이머가 있으면 해제 (중복 방지)
                    if (chatCooldownTimer) clearInterval(chatCooldownTimer);

                    chatCooldownTimer = setInterval(() => {
                        cdRemain--;
                        if (cdRemain <= 0) {
                            clearInterval(chatCooldownTimer);
                            chatCooldownTimer = null;
                            inputField.disabled = false;
                            sendBtn.disabled = false;
                            inputField.placeholder = "AI 튜터에게 힌트 또는 에러 원인을 물어보세요...";
                        } else {
                            inputField.placeholder = `⏳ ${cdRemain}초 후 질문 가능...`;
                        }
                    }, 1000);

                    // 쿨다운 거절은 횟수를 소모하지 않으므로 aiUsed를 되돌립니다.
                    // (첫 질문이었을 경우 aiUsed가 true로 설정되었지만, 실제 API 호출이 안 되었으므로)
                    return;
                }

                if (result.error === 'daily_limit') {
                    // 일일 질문 소진: 입력 필드를 완전히 비활성화
                    chatContainer.innerHTML += `<div class="chat-bubble bot" style="background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; font-size: 0.9em; text-align: center; max-width: 90%; align-self: center; border-radius: 8px;">📛 ${result.response}</div>`;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    inputField.disabled = true;
                    document.getElementById('chat-send-button').disabled = true;
                    inputField.placeholder = "오늘의 질문 횟수를 모두 사용했습니다.";
                    updateDailyRemainingUI(0);
                    return;
                }

                // [신규] 정상 응답인 경우 잔여 횟수 UI를 갱신합니다.
                if (result.daily_remaining !== undefined) {
                    updateDailyRemainingUI(result.daily_remaining);
                }

                chatContainer.innerHTML += `<div class="chat-bubble bot">${result.response || "적합한 힌트 대답을 얻지 못했습니다."}</div>`;
                chatContainer.scrollTop = chatContainer.scrollHeight;

            } catch (err) {
                const tempBubble = document.getElementById(tempBubbleId);
                if (tempBubble) tempBubble.remove();

                chatContainer.innerHTML += `<div class="chat-bubble bot" style="color: var(--error); border-color: rgba(244,63,94,0.3);">🔴 AI 튜터와의 통신 오류가 발생했습니다: ${err.message}</div>`;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    

        // [신규] AI 챗봇 잔여 질문 횟수 배지(Badge) 실시간 갱신 헬퍼 함수
        function updateDailyRemainingUI(remaining) {
            chatDailyRemaining = remaining;
            const badge = document.getElementById('chat-daily-remaining');
            if (!badge) return;

            badge.textContent = `🎫 ${remaining}/10`;

            // 남은 횟수에 따라 배지 색상을 단계별로 변경합니다.
            if (remaining <= 0) {
                badge.style.color = '#fca5a5';
                badge.style.background = 'rgba(239, 68, 68, 0.2)';
            } else if (remaining <= 3) {
                badge.style.color = '#fde68a';
                badge.style.background = 'rgba(234, 179, 8, 0.2)';
            } else {
                badge.style.color = '#94a3b8';
                badge.style.background = 'rgba(148,163,184,0.15)';
            }
        }
    
