/**
 * 엔트리 학습관 공통 GNB 네비게이션 & UI 보정 스크립트 (entry-nav.js)
 * 1. 단원 선택 드롭다운 토글, ESC/외부 클릭 닫기 및 마우스휠 스크롤 지원
 * 2. 좌측 지문 패널-우측 워크스페이스 분할 리사이저 (#drag-splitter)
 * 3. 엔트리 스테이지(실행 화면)-블록 코딩 분할선 고도화 패치 (applyEntryStageSplitterPatch)
 */

(function() {
    /**
     * 1. 단원 선택 드롭다운 초기화
     */
    function initChapterDropdown() {
        var dropdown = document.getElementById('chapter-dropdown');
        var btn = document.getElementById('chapter-dropdown-btn');

        if (dropdown && btn && !dropdown._navInitialized) {
            dropdown._navInitialized = true;
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = dropdown.classList.toggle('is-open');
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            // 드롭다운 외부 클릭 시 닫기
            document.addEventListener('click', function (e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('is-open');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });

            // ESC 키 입력 시 닫기
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' || e.key === 'Esc') {
                    dropdown.classList.remove('is-open');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    /**
     * 2. 좌측 지문 패널 드래그 리사이저 (#drag-splitter)
     */
    function initLeftPaneSplitter() {
        var splitter = document.getElementById('drag-splitter');
        var leftPane = document.getElementById('left-pane');
        var layout = document.getElementById('main-layout') || document.querySelector('.edu-main-layout');
        var rightPane = document.getElementById('right-pane') || document.querySelector('.edu-right-pane');

        if (!splitter || !leftPane || splitter._splitterInitialized) return;
        splitter._splitterInitialized = true;

        var isDragging = false;

        function startDrag(e) {
            isDragging = true;
            splitter.classList.add('dragging', 'active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            if (rightPane) {
                rightPane.style.pointerEvents = 'none';
            }
        }

        function doDrag(clientX) {
            if (!isDragging) return;
            var layoutRect = layout ? layout.getBoundingClientRect() : { left: 0, width: window.innerWidth };
            var newWidth = clientX - layoutRect.left;
            var minWidth = 240;
            var maxWidth = Math.min(layoutRect.width - 320, Math.floor(window.innerWidth * 0.75));

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                leftPane.style.width = newWidth + 'px';
                if (window.Entry && Entry.stage && Entry.stage.update) {
                    Entry.stage.update();
                }
            }
        }

        function stopDrag() {
            if (isDragging) {
                isDragging = false;
                splitter.classList.remove('dragging', 'active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                if (rightPane) {
                    rightPane.style.pointerEvents = '';
                }
                window.dispatchEvent(new Event('resize'));
                if (window.Entry && Entry.stage && Entry.stage.update) {
                    Entry.stage.update();
                }
            }
        }

        // 마우스 드래그 이벤트
        splitter.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', function(e) {
            if (isDragging) doDrag(e.clientX);
        });
        document.addEventListener('mouseup', stopDrag);

        // 터치 드래그 이벤트 (태블릿/2-in-1 노트북 지원)
        splitter.addEventListener('touchstart', function(e) {
            if (e.touches && e.touches.length === 1) startDrag(e);
        }, { passive: true });
        document.addEventListener('touchmove', function(e) {
            if (isDragging && e.touches && e.touches.length === 1) {
                doDrag(e.touches[0].clientX);
            }
        }, { passive: true });
        document.addEventListener('touchend', stopDrag);
    }

    /**
     * 3. 엔트리 스테이지(실행 화면)와 블록 코딩 영역 사이 분할선 고도화 패치
     */
    function patchEntryStageSplitter() {
        if (!window.Entry) return;

        // 스테이지 기본 크기 설정
        Entry.CANVAS_MIN_WIDTH = 162;
        Entry.CANVAS_DEFAULT_WIDTH = 324;
        Entry.CANVAS_MAX_WIDTH = Math.max(850, Math.floor(window.innerWidth * 0.65));

        // 3-1. PropertyPanel splitter 바인딩 패치
        if (Entry.PropertyPanel && Entry.PropertyPanel.prototype && !Entry.PropertyPanel.prototype._patchedSplitter) {
            Entry.PropertyPanel.prototype._patchedSplitter = true;
            Entry.PropertyPanel.prototype._initializeSplitter = function(splitter) {
                var _this = this;
                splitter.bind('mousedown touchstart', function(e) {
                    e.preventDefault();
                    if (Entry.disposeEvent) {
                        Entry.disposeEvent.notify();
                    }
                    var container = Entry.container;
                    splitter.addClass('enabled');
                    _this._cover.removeClass('entryRemove');
                    _this._cover._isVisible = true;
                    container.splitterEnable = true;
                    document.body.style.userSelect = 'none';

                    var targetContainer = document.getElementById('entry-workspace-target') || document.querySelector('.entryContainer');
                    var rightPane = document.getElementById('right-pane') || document.querySelector('.edu-right-pane');

                    function getClientX(evt) {
                        if (evt.touches && evt.touches.length > 0) {
                            return evt.touches[0].clientX;
                        }
                        if (evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length > 0) {
                            return evt.originalEvent.touches[0].clientX;
                        }
                        return (evt.clientX !== undefined) ? evt.clientX : (evt.x !== undefined ? evt.x : 0);
                    }

                    function onMove(evt) {
                        if (!container.splitterEnable) return;
                        var containerLeft = targetContainer ? targetContainer.getBoundingClientRect().left : 0;
                        var clientX = getClientX(evt);
                        var relX = clientX - containerLeft;

                        var maxW = Math.min(Entry.CANVAS_MAX_WIDTH, targetContainer ? targetContainer.offsetWidth - 200 : 640);
                        var targetWidth = Math.min(Math.max(relX, 180), maxW);

                        Entry.resizeElement({
                            canvasWidth: targetWidth
                        });
                    }

                    function onUp() {
                        container.splitterEnable = false;
                        splitter.removeClass('enabled');
                        if (_this._cover && _this._cover._isVisible) {
                            _this._cover._isVisible = false;
                            _this._cover.addClass('entryRemove');
                        }
                        document.body.style.userSelect = '';
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                        document.removeEventListener('touchmove', onMove);
                        document.removeEventListener('touchend', onUp);
                        $(document).unbind('.container:splitter');
                        window.dispatchEvent(new Event('resize'));
                        if (Entry.stage && Entry.stage.update) {
                            Entry.stage.update();
                        }
                    }

                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                    document.addEventListener('touchmove', onMove, { passive: false });
                    document.addEventListener('touchend', onUp);
                });

                // 더블 클릭 시 스테이지 크기 토글 (컴팩트 324px <-> 넓은 모드 560px)
                splitter.bind('dblclick', function() {
                    var curWidth = Entry.engineContainer ? parseInt(Entry.engineContainer.style.width) || 324 : 324;
                    if (curWidth <= 380) {
                        Entry.resizeElement({ canvasWidth: 560 });
                    } else {
                        Entry.resizeElement({ canvasWidth: 324 });
                    }
                    window.dispatchEvent(new Event('resize'));
                    if (Entry.stage && Entry.stage.update) {
                        Entry.stage.update();
                    }
                });

                splitter.attr('title', '드래그하여 실행 화면 크기 조절 (더블 클릭 시 크기 토글)');
            };
        }

        // 3-2. Entry.resizeElement 부드러운 폭 조절 패치
        if (Entry.resizeElement && !Entry._origResizeElement) {
            Entry._origResizeElement = Entry.resizeElement;
            Entry.resizeElement = function(interfaceModel) {
                var mainWorkspace = Entry.getMainWS();
                if (!mainWorkspace) return;
                if (!interfaceModel) interfaceModel = this.interfaceState || {};
                if (Entry.type === 'workspace') {
                    var canvasSize = interfaceModel.canvasWidth;
                    if (!canvasSize) {
                        canvasSize = Entry.CANVAS_DEFAULT_WIDTH || 324;
                    } else if (canvasSize < 160) {
                        canvasSize = 160;
                    } else if (canvasSize > (Entry.CANVAS_MAX_WIDTH || 850)) {
                        canvasSize = Entry.CANVAS_MAX_WIDTH || 850;
                    }
                    interfaceModel.canvasWidth = canvasSize;

                    if (Entry.engine && Entry.engine.view_ && Entry.engine.view_.parentElement) {
                        var engineContainer = Entry.engine.view_.parentElement;
                        engineContainer.style.width = canvasSize + "px";
                        Entry.engine.view_.style.width = (canvasSize - 24) + "px";
                        if (Entry.stage && Entry.stage.canvas && Entry.stage.canvas.canvas) {
                            Entry.stage.canvas.canvas.style.width = (canvasSize - 26) + "px";
                        }
                    }
                    this.interfaceState = interfaceModel;
                    if (Entry.windowResized && Entry.windowResized.notify) {
                        Entry.windowResized.notify();
                    }
                }
            };
        }
    }

    // 전역 스코프에 노출하여 각 페이지 함수와 100% 호환 보장
    window.applyEntryStageSplitterPatch = patchEntryStageSplitter;
    window.applyLeftPaneSplitter = initLeftPaneSplitter;
    window.patchEntryStageSplitter = patchEntryStageSplitter;
    window.initLeftPaneSplitter = initLeftPaneSplitter;

    // DOM 로드 즉시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        initChapterDropdown();
        initLeftPaneSplitter();
        patchEntryStageSplitter();
    });

    // 윈도우 완전 로드 시 재확인 (EntryJS 지연 로딩 대비)
    window.addEventListener('load', function() {
        initLeftPaneSplitter();
        patchEntryStageSplitter();
    });
})();
