/**
 * Entry Resource Manager (오브젝트 / 모양 / 소리 추가 모달 시스템)
 * - PlayEntry 공식 디자인(UI/UX) 1:1 복제 구현
 * - 상단: 노란색 ✕ 닫기 버튼 + 탭 바(오브젝트 선택, 파일 올리기, 새로 그리기, 글상자)
 * - 본문: 좌측 세로 카테고리(엔트리봇, 우엔보, 사람, 동물...) + 상단 서브필터 + 5열 카드 그리드
 * - 하단: 선택된 오브젝트 카운터 + 취소/추가하기 버튼
 */

(function () {
    let spritesPreset = [];
    let soundsPreset = [];
    let currentMode = 'sprite'; // 'sprite' | 'picture' | 'sound'
    let currentTab = 'gallery'; // 'gallery' | 'upload' | 'draw' | 'textbox'
    let selectedItems = [];
    let activeCategory = '엔트리봇'; // 기본 카테고리: 엔트리봇
    let currentSubFilter = 'all'; // 'all' | 'renewal' | 'emoticon' | 'old'
    let searchQuery = '';
    let isVectorOnly = false;
    let currentAudio = null;

    // 공식 엔트리 카테고리 정의 (스프라이트용)
    const SPRITE_CATEGORIES = [
        { id: '엔트리봇', name: '엔트리봇', targets: ['entrybot_friends'] },
        { id: '우엔보', name: '우엔보', targets: ['main_IYYpuwnMXN'] },
        { id: '사람', name: '사람', targets: ['people'] },
        { id: '동물', name: '동물', targets: ['animal'] },
        { id: '식물', name: '식물', targets: ['plant'] },
        { id: '탈것', name: '탈것', targets: ['vehicles'] },
        { id: '건물', name: '건물', targets: ['architect'] },
        { id: '음식', name: '음식', targets: ['food'] },
        { id: '환경', name: '환경', targets: ['environment'] },
        { id: '물건', name: '물건', targets: ['stuff'] },
        { id: '판타지', name: '판타지', targets: ['fantasy'] },
        { id: '인터페이스', name: '인터페이스', targets: ['interface'] },
        { id: '배경', name: '배경', targets: ['background'] }
    ];

    // 소리용 카테고리 정의
    const SOUND_CATEGORIES = [
        { id: 'all', name: '전체' },
        { id: '효과음', name: '효과음' },
        { id: '사람', name: '사람' },
        { id: '동물', name: '동물' },
        { id: '자연', name: '자연' },
        { id: '사물', name: '사물' },
        { id: '악기', name: '악기' }
    ];

    // 프리셋 데이터 사전 비동기 로드
    fetch('/static/entry_data/sprites_preset.json')
        .then(res => res.json())
        .then(data => { spritesPreset = data; })
        .catch(err => console.warn('스프라이트 프리셋 로드 실패:', err));

    fetch('/static/entry_data/sounds_preset.json')
        .then(res => res.json())
        .then(data => { soundsPreset = data; })
        .catch(err => console.warn('소리 프리셋 로드 실패:', err));

    // 모달 DOM 동적 생성 (PlayEntry 1:1 복제 레이아웃)
    function ensureModalDom() {
        if (document.getElementById('resource-modal')) return;

        const modalHtml = `
        <div id="resource-modal" class="rm-overlay">
            <div class="rm-dialog">
                <!-- 1. 최상단 타이틀 바 (노란색 ✕ 닫기 버튼) -->
                <div class="rm-title-bar">
                    <span class="rm-close-icon" onclick="closeResourceManager()" title="닫기">✕</span>
                    <h2 id="rm-title" class="rm-title">오브젝트 추가하기</h2>
                </div>

                <!-- 2. 상단 탭 & 툴바 바 -->
                <div class="rm-top-nav">
                    <div class="rm-tabs" id="rm-tabs">
                        <button class="rm-tab-btn active" id="rm-tab-gallery" data-tab="gallery" onclick="switchRmTab('gallery')">오브젝트 선택</button>
                        <button class="rm-tab-btn" id="rm-tab-upload" data-tab="upload" onclick="switchRmTab('upload')">파일 올리기</button>
                        <button class="rm-tab-btn" id="rm-tab-draw" data-tab="draw" onclick="switchRmTab('draw')">새로 그리기</button>
                        <button class="rm-tab-btn" id="rm-tab-textbox" data-tab="textbox" onclick="switchRmTab('textbox')">글상자</button>
                    </div>

                    <div class="rm-top-tools">
                        <div class="rm-search-box">
                            <span class="rm-search-icon">🔍</span>
                            <input type="text" class="rm-search-input" id="rm-search" placeholder="이름으로 검색..." oninput="handleRmSearch(this.value)" />
                        </div>
                        <label class="rm-vector-check">
                            <input type="checkbox" id="rm-vector-cb" onchange="handleVectorToggle(this.checked)" /> 벡터 모아보기
                        </label>
                    </div>
                </div>

                <!-- 3. 본문 2컬럼 레이아웃 (좌: 세로 카테고리, 우: 갤러리/패널) -->
                <div class="rm-body">
                    <!-- 좌측 카테고리 사이드바 -->
                    <aside class="rm-sidebar" id="rm-sidebar"></aside>

                    <!-- 우측 메인 패널 -->
                    <main class="rm-main-pane">
                        <!-- 1) 갤러리 탭 -->
                        <div id="rm-panel-gallery" style="display: flex; flex-direction: column; height: 100%;">
                            <!-- 상단 서브 필터 행 -->
                            <div class="rm-sub-filters" id="rm-sub-filters">
                                <span class="rm-sub-filter-item active" data-sub="all" onclick="setSubFilter('all')">전체</span>
                                <span class="rm-sub-filter-item" data-sub="renewal" onclick="setSubFilter('renewal')">리뉴얼</span>
                                <span class="rm-sub-filter-item" data-sub="emoticon" onclick="setSubFilter('emoticon')">이모티콘</span>
                                <span class="rm-sub-filter-item" data-sub="old" onclick="setSubFilter('old')">예전</span>
                            </div>

                            <!-- 5열 카드 그리드 스크롤 영역 -->
                            <div class="rm-grid-scroll">
                                <div class="rm-grid" id="rm-grid"></div>
                            </div>
                        </div>

                        <!-- 2) 새로 그리기 탭 -->
                        <div id="rm-panel-draw" class="rm-sub-panel" style="display: none;">
                            <div style="font-size: 3rem; margin-bottom: 12px;">🎨</div>
                            <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #1e293b;">새로 그리기</h3>
                            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px; text-align: center;">
                                그림판에서 직접 모양을 그릴 수 있는 새로운 빈 오브젝트를 추가합니다.
                            </p>
                            <button class="rm-btn-confirm" onclick="confirmAddBlankObject()">새 오브젝트 추가하기</button>
                        </div>

                        <!-- 3) 글상자 탭 (플레이엔트리 공식 규격 1:1 복제) -->
                        <div id="rm-panel-textbox" class="rm-textbox-panel" style="display: none;">
                            <div class="rm-textbox-card">
                                <!-- 상단 툴바: 폰트 드롭다운 + 서식 버튼들 + 모드 스위처 -->
                                <div class="rm-tb-toolbar">
                                    <!-- 폰트 선택 -->
                                    <div class="rm-tb-select-wrap">
                                        <select id="rm-tb-font" class="rm-tb-select" onchange="handleTbFontChange(this.value)">
                                            <option value="Nanum Gothic" selected>나눔고딕</option>
                                            <option value="Nanum Myeongjo">나눔명조</option>
                                            <option value="Nanum Barun Gothic">나눔바른고딕</option>
                                            <option value="Nanum Pen Script">나눔손글씨</option>
                                            <option value="Nanum Square Round">나눔스퀘어라운드</option>
                                            <option value="D2Coding">코딩고딕체</option>
                                            <option value="Batang">바탕체</option>
                                        </select>
                                        <span class="rm-tb-select-arrow">▼</span>
                                    </div>

                                    <!-- 서식 버튼 그룹 (굵게, 밑줄, 기울임, 취소선, 글자색, 배경색) -->
                                    <div class="rm-tb-btn-group">
                                        <!-- 1. 굵게 -->
                                        <button type="button" class="rm-tb-tool-btn" id="rm-tb-bold" title="굵게" onclick="toggleTbEffect('bold')">
                                            <strong style="font-size: 15px; font-weight: 900;">가</strong>
                                        </button>
                                        <!-- 2. 밑줄 -->
                                        <button type="button" class="rm-tb-tool-btn" id="rm-tb-underline" title="밑줄" onclick="toggleTbEffect('underline')">
                                            <span style="font-size: 15px; text-decoration: underline; text-underline-offset: 3px; font-weight: 600;">가</span>
                                        </button>
                                        <!-- 3. 기울임꼴 -->
                                        <button type="button" class="rm-tb-tool-btn" id="rm-tb-italic" title="기울임꼴" onclick="toggleTbEffect('italic')">
                                            <span style="font-size: 15px; font-style: italic; font-family: 'Times New Roman', serif; font-weight: 600;">가</span>
                                        </button>
                                        <!-- 4. 취소선 -->
                                        <button type="button" class="rm-tb-tool-btn" id="rm-tb-strike" title="취소선" onclick="toggleTbEffect('strike')">
                                            <span style="font-size: 15px; text-decoration: line-through; font-weight: 600;">가</span>
                                        </button>
                                        <!-- 5. 글자색 -->
                                        <div class="rm-tb-color-picker-wrap" title="글자색">
                                            <button type="button" class="rm-tb-tool-btn rm-tb-color-btn" onclick="document.getElementById('rm-tb-color').click()">
                                                <div class="rm-tb-color-inner">
                                                    <span class="rm-tb-color-char">가</span>
                                                    <span id="rm-tb-color-bar" class="rm-tb-color-bar" style="background-color: #000000;"></span>
                                                </div>
                                                <span class="rm-tb-mini-arrow">▼</span>
                                            </button>
                                            <input type="color" id="rm-tb-color" value="#000000" class="rm-tb-hidden-color" onchange="handleTbColorChange(this.value)" />
                                        </div>
                                        <!-- 6. 배경/채우기색 -->
                                        <div class="rm-tb-color-picker-wrap" title="배경색">
                                            <button type="button" class="rm-tb-tool-btn rm-tb-color-btn" onclick="document.getElementById('rm-tb-bg').click()">
                                                <div class="rm-tb-color-inner">
                                                    <svg class="rm-tb-bucket-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/>
                                                        <path d="m5 2 5 5"/>
                                                        <path d="M2 13h15"/>
                                                        <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" fill="currentColor"/>
                                                    </svg>
                                                    <span id="rm-tb-bg-bar" class="rm-tb-color-bar" style="background-color: #ffffff; border: 1px solid #d1d5db;"></span>
                                                </div>
                                                <span class="rm-tb-mini-arrow">▼</span>
                                            </button>
                                            <input type="color" id="rm-tb-bg" value="#ffffff" class="rm-tb-hidden-color" onchange="handleTbBgChange(this.value)" />
                                        </div>
                                    </div>

                                    <!-- 우측 모드 전환 (한 줄 쓰기 / 여러 줄 쓰기) -->
                                    <div class="rm-tb-mode-group">
                                        <button type="button" id="rm-tb-mode-single" class="rm-tb-mode-btn active" onclick="setTbMode('single')">한 줄 쓰기</button>
                                        <button type="button" id="rm-tb-mode-multi" class="rm-tb-mode-btn" onclick="setTbMode('multi')">여러 줄 쓰기</button>
                                    </div>
                                </div>

                                <!-- 본문 입력 필드 -->
                                <div class="rm-tb-input-wrap">
                                    <input type="text" id="rm-tb-input" class="rm-tb-field" placeholder="글상자의 내용을 입력해주세요." oninput="updateTbLivePreview()" />
                                    <textarea id="rm-tb-textarea" class="rm-tb-field rm-tb-textarea" placeholder="글상자의 내용을 입력해주세요." style="display: none;" oninput="updateTbLivePreview()"></textarea>
                                </div>

                                <!-- 하단 안내 문구 -->
                                <div class="rm-tb-notices">
                                    <ul id="rm-tb-notice-single" class="rm-tb-notice-list">
                                        <li><span class="rm-tb-bullet">•</span> 내용을 한 줄로만 작성할 수 있습니다.</li>
                                        <li><span class="rm-tb-bullet">•</span> 새로운 글자가 추가되면 글상자의 좌우 길이가 길어집니다.</li>
                                    </ul>
                                    <ul id="rm-tb-notice-multi" class="rm-tb-notice-list" style="display: none;">
                                        <li><span class="rm-tb-bullet">•</span> 여러 줄로 내용을 작성할 수 있습니다.</li>
                                        <li><span class="rm-tb-bullet">•</span> 새로운 줄이 추가되면 글상자의 상하 길이가 길어집니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- 4) 파일 올리기 탭 -->
                        <div id="rm-panel-upload" class="rm-sub-panel" style="display: none;">
                            <div class="rm-drop-box" onclick="document.getElementById('rm-file-input').click()">
                                <div style="font-size: 3rem; margin-bottom: 12px;" id="rm-drop-icon">📁</div>
                                <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;" id="rm-drop-title">내 컴퓨터에서 파일 선택</div>
                                <div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;" id="rm-drop-desc">이미지 파일(.png, .jpg, .svg, .gif)을 클릭하여 업로드하세요</div>
                                <input type="file" id="rm-file-input" style="display: none;" onchange="handleFileUpload(event)" />
                            </div>
                            <div id="rm-upload-preview" style="margin-top: 16px; font-weight: 600; color: #10b981; display: none;"></div>
                        </div>
                    </main>
                </div>

                <!-- 4. 하단 푸터 바 -->
                <footer class="rm-footer">
                    <div class="rm-selected-info">
                        선택된 항목: <span class="rm-selected-count" id="rm-selected-count">0</span>개
                    </div>
                    <div class="rm-footer-actions">
                        <button class="rm-btn-cancel" onclick="closeResourceManager()">취소</button>
                        <button class="rm-btn-confirm" onclick="confirmResourceSelection()">추가하기</button>
                    </div>
                </footer>
            </div>
        </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstElementChild);
    }

    // 모달 열기 함수 (전역 노출)
    window.openResourceManager = function (mode) {
        ensureModalDom();
        currentMode = mode || 'sprite';
        currentTab = 'gallery';
        selectedItems = [];
        activeCategory = (currentMode === 'sound') ? 'all' : '엔트리봇';
        currentSubFilter = 'all';
        searchQuery = '';
        isVectorOnly = false;

        if (window.resetTbState) {
            window.resetTbState();
        }

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        const modal = document.getElementById('resource-modal');
        const titleEl = document.getElementById('rm-title');
        const tabGallery = document.getElementById('rm-tab-gallery');
        const tabDraw = document.getElementById('rm-tab-draw');
        const tabTextbox = document.getElementById('rm-tab-textbox');
        const searchInput = document.getElementById('rm-search');
        const vectorCb = document.getElementById('rm-vector-cb');

        if (searchInput) searchInput.value = '';
        if (vectorCb) vectorCb.checked = false;

        if (currentMode === 'sprite') {
            titleEl.textContent = '오브젝트 추가하기';
            tabGallery.textContent = '오브젝트 선택';
            tabDraw.style.display = 'block';
            tabTextbox.style.display = 'block';
        } else if (currentMode === 'picture') {
            titleEl.textContent = '모양 추가하기';
            tabGallery.textContent = '모양 선택';
            tabDraw.style.display = 'block';
            tabTextbox.style.display = 'none';
        } else if (currentMode === 'sound') {
            titleEl.textContent = '소리 추가하기';
            tabGallery.textContent = '소리 선택';
            tabDraw.style.display = 'none';
            tabTextbox.style.display = 'none';
        }

        switchRmTab('gallery');
        renderCategories();
        renderGrid();
        updateSelectedInfo();

        modal.style.display = 'flex';
    };

    window.closeResourceManager = function () {
        const modal = document.getElementById('resource-modal');
        if (modal) modal.style.display = 'none';
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        if (window.Entry && Entry.dispatchEvent) {
            Entry.dispatchEvent('dismissModal');
        }
    };

    // 탭 전환
    window.switchRmTab = function (tab) {
        currentTab = tab;
        document.querySelectorAll('.rm-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.getElementById('rm-panel-gallery').style.display = (tab === 'gallery') ? 'flex' : 'none';
        document.getElementById('rm-panel-draw').style.display = (tab === 'draw') ? 'flex' : 'none';
        document.getElementById('rm-panel-textbox').style.display = (tab === 'textbox') ? 'flex' : 'none';
        document.getElementById('rm-panel-upload').style.display = (tab === 'upload') ? 'flex' : 'none';

        // 갤러리 외의 탭일 때는 사이드바 및 상단 검색/필터 도구 숨김
        const sidebar = document.getElementById('rm-sidebar');
        if (sidebar) {
            sidebar.style.display = (tab === 'gallery') ? 'flex' : 'none';
        }
        const topTools = document.querySelector('.rm-top-tools');
        if (topTools) {
            topTools.style.display = (tab === 'gallery') ? 'flex' : 'none';
        }

        // 하단 선택된 항목 텍스트 갱신
        const selectedInfo = document.querySelector('.rm-selected-info');
        if (selectedInfo) {
            if (tab === 'textbox') {
                selectedInfo.innerHTML = '선택된 항목: <span class="rm-selected-count">글상자</span>';
            } else if (tab === 'draw') {
                selectedInfo.innerHTML = '선택된 항목: <span class="rm-selected-count">새 그림</span>';
            } else if (tab === 'upload') {
                selectedInfo.innerHTML = '선택된 항목: <span class="rm-selected-count">' + (uploadedFileCache ? '1개' : '0개') + '</span>';
            } else {
                selectedInfo.innerHTML = '선택된 항목: <span class="rm-selected-count" id="rm-selected-count">' + selectedItems.length + '</span>개';
            }
        }

        if (tab === 'textbox') {
            if (window.applyTbLiveStyles) {
                window.applyTbLiveStyles();
            }
            setTimeout(() => {
                const activeInp = (tbState.mode === 'single')
                    ? document.getElementById('rm-tb-input')
                    : document.getElementById('rm-tb-textarea');
                if (activeInp) activeInp.focus();
            }, 60);
        }

        if (tab === 'upload') {
            const dropIcon = document.getElementById('rm-drop-icon');
            const dropTitle = document.getElementById('rm-drop-title');
            const dropDesc = document.getElementById('rm-drop-desc');
            const fileInput = document.getElementById('rm-file-input');
            const previewEl = document.getElementById('rm-upload-preview');
            previewEl.style.display = 'none';
            previewEl.textContent = '';

            if (currentMode === 'sound') {
                dropIcon.textContent = '🎵';
                dropTitle.textContent = '내 컴퓨터에서 소리 파일 선택';
                dropDesc.textContent = '오디오 파일(.mp3, .wav)을 클릭하여 업로드하세요';
                fileInput.accept = 'audio/*,.mp3,.wav';
            } else {
                dropIcon.textContent = '🖼️';
                dropTitle.textContent = '내 컴퓨터에서 이미지 선택';
                dropDesc.textContent = '이미지 파일(.png, .jpg, .svg, .gif)을 클릭하여 업로드하세요';
                fileInput.accept = 'image/*,.png,.jpg,.jpeg,.svg,.gif';
            }
        }
    };

    // 좌측 사이드바 카테고리 렌더링
    function renderCategories() {
        const sidebar = document.getElementById('rm-sidebar');
        if (!sidebar) return;
        sidebar.innerHTML = '';

        const cats = (currentMode === 'sound') ? SOUND_CATEGORIES : SPRITE_CATEGORIES;

        cats.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'rm-side-btn' + (activeCategory === c.id ? ' active' : '');
            btn.textContent = c.name;
            btn.onclick = () => {
                activeCategory = c.id;
                renderCategories();
                renderGrid();
            };
            sidebar.appendChild(btn);
        });
    }

    // 상단 서브 필터 (전체, 리뉴얼, 이모티콘, 예전)
    window.setSubFilter = function (filter) {
        currentSubFilter = filter;
        document.querySelectorAll('.rm-sub-filter-item').forEach(item => {
            item.classList.toggle('active', item.dataset.sub === filter);
        });
        renderGrid();
    };

    // 검색 핸들러
    window.handleRmSearch = function (val) {
        searchQuery = (val || '').trim().toLowerCase();
        renderGrid();
    };

    // 벡터 모아보기 토글
    window.handleVectorToggle = function (checked) {
        isVectorOnly = checked;
        renderGrid();
    };

    // 갤러리 그리드 렌더링 (5열 고정 그리드)
    function renderGrid() {
        const grid = document.getElementById('rm-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (currentMode === 'sound') {
            let list = soundsPreset.filter(s => {
                const matchCat = (activeCategory === 'all') || (s.category === activeCategory);
                const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery);
                return matchCat && matchSearch;
            });

            if (list.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 60px;">검색 결과가 없습니다.</div>';
                return;
            }

            list.forEach(item => {
                const isSelected = selectedItems.some(x => x.filename === item.filename);
                const card = document.createElement('div');
                card.className = 'rm-card' + (isSelected ? ' selected' : '');

                const soundUrl = item.fileurl || `https://playentry.org/uploads/${item.filename.slice(0, 2)}/${item.filename.slice(2, 4)}/${item.filename}.mp3`;

                card.innerHTML = `
                    <div class="rm-card-check">✓</div>
                    <div class="rm-sound-icon-wrap">🔊</div>
                    <div class="rm-card-name" title="${item.name}">${item.name}</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${item.duration || 1}초</div>
                    <button class="rm-sound-play-btn" onclick="playPreviewSound(event, '${soundUrl}')">▶ 재생</button>
                `;

                card.onclick = (e) => {
                    if (e.target.tagName === 'BUTTON') return;
                    toggleSelectItem(item);
                };

                grid.appendChild(card);
            });
        } else {
            // 스프라이트 또는 모양
            const activeDef = SPRITE_CATEGORIES.find(c => c.id === activeCategory);
            const targets = activeDef ? activeDef.targets : ['entrybot_friends'];

            let list = spritesPreset.filter(s => {
                const matchCat = searchQuery ? true : targets.includes(s.category);
                const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery);
                const matchVector = !isVectorOnly || (s.pictures && s.pictures.some(p => p.imageType === 'svg'));
                return matchCat && matchSearch && matchVector;
            });

            // 서브 필터 적용 (예: emoticon 등 키워드 필터)
            if (currentSubFilter === 'emoticon') {
                list = list.filter(s => s.name.includes('표정') || s.name.includes('얼굴') || s.name.includes('스티커') || s.name.includes('하트') || s.name.includes('축하') || s.name.includes('HELP') || s.name.includes('OK') || s.name.includes('NO'));
            } else if (currentSubFilter === 'renewal') {
                list = list.filter(s => s.name.includes('엔트리봇') || s.name.includes('기본') || s.name.includes('최고'));
            }

            if (list.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 60px;">해당 카테고리에 표시할 항목이 없습니다.</div>';
                return;
            }

            list.forEach(item => {
                const isSelected = selectedItems.some(x => x.name === item.name);
                const card = document.createElement('div');
                card.className = 'rm-card' + (isSelected ? ' selected' : '');

                const pic = item.pictures && item.pictures[0];
                let thumbSrc = '';
                if (pic) {
                    thumbSrc = pic.thumbUrl || pic.fileurl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/thumb/${pic.filename}.png`;
                }

                card.innerHTML = `
                    <div class="rm-card-badge" title="편집 가능">✏️</div>
                    <div class="rm-card-check">✓</div>
                    <div class="rm-card-thumb-wrap">
                        <img src="${thumbSrc}" alt="${item.name}" loading="lazy" onerror="this.src='/lib/entryjs/images/media/entrybot1.png'" />
                    </div>
                    <div class="rm-card-name" title="${item.name}">${item.name}</div>
                `;

                card.onclick = () => toggleSelectItem(item);
                grid.appendChild(card);
            });
        }
    }

    // 소리 미리듣기
    window.playPreviewSound = function (e, url) {
        e.stopPropagation();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        currentAudio = new Audio(url);
        currentAudio.play().catch(err => console.warn('오디오 재생 실패:', err));
    };

    // 아이템 선택 토글
    function toggleSelectItem(item) {
        const idKey = (currentMode === 'sound') ? 'filename' : 'name';
        const idx = selectedItems.findIndex(x => x[idKey] === item[idKey]);

        if (idx >= 0) {
            selectedItems.splice(idx, 1);
        } else {
            selectedItems.push(item);
        }

        renderGrid();
        updateSelectedInfo();
    }

    function updateSelectedInfo() {
        const countEl = document.getElementById('rm-selected-count');
        if (countEl) {
            countEl.textContent = selectedItems.length;
        }
    }

    // =========================================================================
    // 글상자 탭 상태 관리 및 이벤트 핸들러 (플레이엔트리 공식 규격 1:1)
    // =========================================================================
    let tbState = {
        mode: 'single', // 'single' | 'multi'
        font: 'Nanum Gothic',
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        color: '#000000',
        bg: '#ffffff'
    };

    window.resetTbState = function () {
        tbState = {
            mode: 'single',
            font: 'Nanum Gothic',
            bold: false,
            italic: false,
            underline: false,
            strike: false,
            color: '#000000',
            bg: '#ffffff'
        };

        const fontSel = document.getElementById('rm-tb-font');
        if (fontSel) fontSel.value = 'Nanum Gothic';

        ['bold', 'underline', 'italic', 'strike'].forEach(eff => {
            const btn = document.getElementById('rm-tb-' + eff);
            if (btn) btn.classList.remove('active');
        });

        const colorInput = document.getElementById('rm-tb-color');
        if (colorInput) colorInput.value = '#000000';
        const colorBar = document.getElementById('rm-tb-color-bar');
        if (colorBar) colorBar.style.backgroundColor = '#000000';

        const bgInput = document.getElementById('rm-tb-bg');
        if (bgInput) bgInput.value = '#ffffff';
        const bgBar = document.getElementById('rm-tb-bg-bar');
        if (bgBar) bgBar.style.backgroundColor = '#ffffff';

        const inp = document.getElementById('rm-tb-input');
        if (inp) inp.value = '';
        const txtarea = document.getElementById('rm-tb-textarea');
        if (txtarea) txtarea.value = '';

        setTbMode('single');
    };

    window.setTbMode = function (mode) {
        tbState.mode = mode;
        const singleBtn = document.getElementById('rm-tb-mode-single');
        const multiBtn = document.getElementById('rm-tb-mode-multi');
        const singleNotice = document.getElementById('rm-tb-notice-single');
        const multiNotice = document.getElementById('rm-tb-notice-multi');
        const inputField = document.getElementById('rm-tb-input');
        const textareaField = document.getElementById('rm-tb-textarea');

        if (mode === 'single') {
            if (singleBtn) singleBtn.classList.add('active');
            if (multiBtn) multiBtn.classList.remove('active');
            if (singleNotice) singleNotice.style.display = 'flex';
            if (multiNotice) multiNotice.style.display = 'none';
            if (inputField && textareaField) {
                inputField.value = textareaField.value.replace(/\n.*/s, '');
                inputField.style.display = 'block';
                textareaField.style.display = 'none';
                inputField.focus();
            }
        } else {
            if (singleBtn) singleBtn.classList.remove('active');
            if (multiBtn) multiBtn.classList.add('active');
            if (singleNotice) singleNotice.style.display = 'none';
            if (multiNotice) multiNotice.style.display = 'flex';
            if (inputField && textareaField) {
                textareaField.value = inputField.value;
                inputField.style.display = 'none';
                textareaField.style.display = 'block';
                textareaField.focus();
            }
        }
        applyTbLiveStyles();
    };

    window.toggleTbEffect = function (effect) {
        tbState[effect] = !tbState[effect];
        const btn = document.getElementById('rm-tb-' + effect);
        if (btn) {
            btn.classList.toggle('active', tbState[effect]);
        }
        applyTbLiveStyles();
    };

    window.handleTbFontChange = function (font) {
        tbState.font = font;
        applyTbLiveStyles();
    };

    window.handleTbColorChange = function (color) {
        tbState.color = color;
        const bar = document.getElementById('rm-tb-color-bar');
        if (bar) bar.style.backgroundColor = color;
        applyTbLiveStyles();
    };

    window.handleTbBgChange = function (bg) {
        tbState.bg = bg;
        const bar = document.getElementById('rm-tb-bg-bar');
        if (bar) bar.style.backgroundColor = bg;
        applyTbLiveStyles();
    };

    window.updateTbLivePreview = function () {
        applyTbLiveStyles();
    };

    window.applyTbLiveStyles = function () {
        const activeInput = (tbState.mode === 'single')
            ? document.getElementById('rm-tb-input')
            : document.getElementById('rm-tb-textarea');
        if (!activeInput) return;

        activeInput.style.fontFamily = `"${tbState.font}", 'Nanum Gothic', Pretendard, sans-serif`;
        activeInput.style.fontWeight = tbState.bold ? '900' : 'normal';
        activeInput.style.fontStyle = tbState.italic ? 'italic' : 'normal';

        let deco = [];
        if (tbState.underline) deco.push('underline');
        if (tbState.strike) deco.push('line-through');
        activeInput.style.textDecoration = deco.length > 0 ? deco.join(' ') : 'none';

        activeInput.style.color = tbState.color;
    };

    // 로컬 파일 업로드 처리
    let uploadedFileCache = null;
    window.handleFileUpload = function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            const dataUrl = evt.target.result;
            uploadedFileCache = {
                file: file,
                name: file.name.replace(/\.[^/.]+$/, ''),
                dataUrl: dataUrl
            };
            const previewEl = document.getElementById('rm-upload-preview');
            previewEl.style.display = 'block';
            previewEl.textContent = `✔ 파일이 준비되었습니다: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        };

        reader.readAsDataURL(file);
    };

    const BLANK_CANVAS_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    // 새로 그리기: 빈 캔버스 오브젝트 또는 빈 모양 추가
    window.confirmAddBlankObject = function () {
        if (!window.Entry || !Entry.container) {
            alert('엔트리 엔진이 준비되지 않았습니다.');
            return;
        }

        // 1. 모양 추가 모드인 경우: 현재 선택된 오브젝트에 새 빈 모양 추가
        if (currentMode === 'picture') {
            const targetObj = getTargetObject();
            if (!targetObj) {
                alert('모양을 추가할 대상 오브젝트를 선택해주세요.');
                return;
            }
            const newPicId = Entry.generateHash();
            const newPic = {
                id: newPicId,
                objectId: targetObj.id,
                name: '새 모양',
                fileurl: BLANK_CANVAS_DATA_URL,
                thumbUrl: BLANK_CANVAS_DATA_URL,
                dimension: { width: 100, height: 100 },
                filename: Entry.generateHash(),
                imageType: 'png'
            };
            if (Entry.do && Entry.STATIC && Entry.STATIC.COMMAND_TYPES && Entry.STATIC.COMMAND_TYPES.objectAddPicture) {
                Entry.do('objectAddPicture', targetObj.id, newPic, true);
            } else if (Entry.playground && Entry.playground.addPicture) {
                Entry.playground.addPicture(newPic, true);
            } else {
                targetObj.addPicture(newPic);
            }
            if (Entry.playground) {
                Entry.playground.injectPicture && Entry.playground.injectPicture(true);
                Entry.playground.selectPicture && Entry.playground.selectPicture(newPic);
                if (Entry.playground.changeViewMode) {
                    Entry.playground.changeViewMode('picture');
                }
            }
            closeResourceManager();
            return;
        }

        // 2. 스프라이트 추가 모드인 경우: 투명 1x1 캔버스 기반의 새 그림 오브젝트 추가
        const blankPicId = Entry.generateHash();
        const blankObjId = Entry.generateHash();

        const newObj = Entry.container.addObject({
            id: blankObjId,
            name: '새 그림',
            objectType: 'sprite',
            rotateMethod: 'free',
            scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
            sprite: {
                name: '새 그림',
                pictures: [
                    {
                        id: blankPicId,
                        objectId: blankObjId,
                        name: '새 모양',
                        fileurl: BLANK_CANVAS_DATA_URL,
                        thumbUrl: BLANK_CANVAS_DATA_URL,
                        dimension: { width: 100, height: 100 },
                        filename: Entry.generateHash(),
                        imageType: 'png'
                    }
                ],
                sounds: []
            },
            entity: {
                x: 0,
                y: 0,
                regX: 50,
                regY: 50,
                scaleX: 1,
                scaleY: 1,
                width: 100,
                height: 100,
                rotation: 0,
                direction: 90,
                lineBreak: true,
                visible: true
            }
        });

        if (Entry.container && Entry.container.selectObject) {
            Entry.container.selectObject(blankObjId);
        }
        if (Entry.playground && Entry.playground.changeViewMode) {
            Entry.playground.changeViewMode('picture');
        }

        closeResourceManager();
    };

    // 대상 오브젝트 안전 조회 헬퍼
    function getTargetObject() {
        if (!window.Entry) return null;
        if (Entry.container && Entry.container.selectedObject) {
            return Entry.container.selectedObject;
        }
        if (Entry.playground && Entry.playground.object) {
            return Entry.playground.object;
        }
        if (Entry.container && Entry.container.getAllObjects) {
            const list = Entry.container.getAllObjects();
            if (list && list.length > 0) return list[0];
        }
        if (Entry.container && Entry.container.objects_ && Entry.container.objects_.length > 0) {
            return Entry.container.objects_[0];
        }
        return null;
    }

    // 최종 추가하기 버튼 핸들러
    window.confirmResourceSelection = function () {
        if (!window.Entry || !Entry.container) {
            alert('엔트리 엔진이 준비되지 않았습니다.');
            return;
        }

        // 1. 글상자 탭 추가
        if (currentTab === 'textbox') {
            const isMulti = tbState.mode === 'multi';
            const rawVal = isMulti 
                ? (document.getElementById('rm-tb-textarea') ? document.getElementById('rm-tb-textarea').value : '')
                : (document.getElementById('rm-tb-input') ? document.getElementById('rm-tb-input').value : '');
            const textVal = rawVal.trim() || '글상자';
            const colorVal = tbState.color || '#000000';
            const bgVal = tbState.bg || '#ffffff';
            const fontVal = tbState.font || 'Nanum Gothic';
            const isBold = !!tbState.bold;
            const isItalic = !!tbState.italic;
            const isUnderline = !!tbState.underline;
            const isStrike = !!tbState.strike;

            const newObj = Entry.container.addObject({
                id: Entry.generateHash(),
                name: textVal.slice(0, 15) || '글상자',
                text: textVal,
                objectType: 'textBox',
                rotateMethod: 'free',
                scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
                sprite: {
                    name: textVal.slice(0, 15) || '글상자',
                    pictures: [],
                    sounds: []
                },
                options: {
                    font: fontVal,
                    underline: isUnderline,
                    italic: isItalic,
                    bold: isBold,
                    strike: isStrike,
                    bgColor: bgVal,
                    textColor: colorVal,
                    lineBreak: isMulti
                },
                entity: {
                    x: 0,
                    y: 0,
                    regX: 25,
                    regY: 12,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    width: isMulti ? 100 : 50,
                    height: isMulti ? 50 : 24,
                    rotation: 0,
                    direction: 90,
                    lineBreak: isMulti,
                    visible: true,
                    font: '20 ' + fontVal,
                    fontType: fontVal,
                    fontBold: isBold,
                    fontItalic: isItalic,
                    underLine: isUnderline,
                    strike: isStrike,
                    colour: colorVal,
                    bgColor: bgVal,
                    text: textVal
                }
            });

            if (newObj && newObj.entity) {
                const ent = newObj.entity;
                if (ent.setFontType) ent.setFontType(fontVal);
                if (ent.setLineBreak) ent.setLineBreak(isMulti);
                if (ent.setText) ent.setText(textVal);
                if (ent.setFontBold) ent.setFontBold(isBold);
                if (ent.setFontItalic) ent.setFontItalic(isItalic);
                if (ent.setUnderLine) ent.setUnderLine(isUnderline);
                if (ent.setStrike) ent.setStrike(isStrike);
                if (ent.setColour) ent.setColour(colorVal);
                if (ent.setBGColour) ent.setBGColour(bgVal);
                if (ent.updateTextbox) ent.updateTextbox();
                if (ent.syncFont) ent.syncFont();
            }

            if (Entry.stage && Entry.stage.update) Entry.stage.update();
            closeResourceManager();
            return;
        }

        // 2. 새로 그리기 탭 추가
        if (currentTab === 'draw') {
            confirmAddBlankObject();
            return;
        }

        // 3. 파일 업로드 탭 추가
        if (currentTab === 'upload') {
            if (!uploadedFileCache) {
                alert('업로드할 파일을 먼저 선택해주세요.');
                return;
            }

            if (currentMode === 'sound') {
                const targetObj = getTargetObject();
                if (!targetObj) {
                    alert('소리를 추가할 오브젝트를 먼저 선택하거나 추가해주세요.');
                    return;
                }
                const newSound = {
                    id: Entry.generateHash(),
                    name: uploadedFileCache.name,
                    fileurl: uploadedFileCache.dataUrl,
                    duration: 2
                };
                if (Entry.do && Entry.STATIC && Entry.STATIC.COMMAND_TYPES && Entry.STATIC.COMMAND_TYPES.objectAddSound) {
                    Entry.do('objectAddSound', targetObj.id, newSound, true);
                } else {
                    targetObj.addSound(newSound);
                    if (Entry.playground) {
                        Entry.playground.injectSound && Entry.playground.injectSound(true);
                        Entry.playground.selectSound && Entry.playground.selectSound(newSound);
                    }
                }
            } else if (currentMode === 'picture') {
                const targetObj = getTargetObject();
                if (!targetObj) {
                    alert('모양을 추가할 오브젝트를 먼저 선택하거나 추가해주세요.');
                    return;
                }
                const ext = (uploadedFileCache.name.endsWith('.svg') || uploadedFileCache.dataUrl.startsWith('data:image/svg')) ? 'svg' : 'png';
                const newPic = {
                    id: Entry.generateHash(),
                    objectId: targetObj.id,
                    name: uploadedFileCache.name,
                    fileurl: uploadedFileCache.dataUrl,
                    thumbUrl: uploadedFileCache.dataUrl,
                    dimension: { width: 100, height: 100 },
                    filename: Entry.generateHash(),
                    imageType: ext
                };
                if (Entry.do && Entry.STATIC && Entry.STATIC.COMMAND_TYPES && Entry.STATIC.COMMAND_TYPES.objectAddPicture) {
                    Entry.do('objectAddPicture', targetObj.id, newPic, true);
                } else if (Entry.playground && Entry.playground.addPicture) {
                    Entry.playground.addPicture(newPic, true);
                } else {
                    targetObj.addPicture(newPic);
                    if (Entry.playground) {
                        Entry.playground.injectPicture && Entry.playground.injectPicture(true);
                        Entry.playground.selectPicture && Entry.playground.selectPicture(newPic);
                    }
                }
            } else {
                // sprite 업로드
                const isBg = (activeCategory === '배경') || (uploadedFileCache.name && uploadedFileCache.name.includes('배경'));
                const uploadDataUrl = uploadedFileCache.dataUrl;
                const uploadName = uploadedFileCache.name;
                const uploadImg = new Image();
                uploadImg.onload = function () {
                    const w = uploadImg.naturalWidth || uploadImg.width || 100;
                    const h = uploadImg.naturalHeight || uploadImg.height || 100;
                    const scale = isBg 
                        ? Math.max(270 / h, 480 / w)
                        : (200 / (w + h));

                    const newObjId = Entry.generateHash();
                    const newPicId = Entry.generateHash();
                    const ext = (uploadName.endsWith('.svg') || uploadDataUrl.startsWith('data:image/svg')) ? 'svg' : 'png';

                    Entry.container.addObject({
                        id: newObjId,
                        name: uploadName,
                        objectType: 'sprite',
                        rotateMethod: 'free',
                        scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
                        sprite: {
                            name: uploadName,
                            pictures: [
                                {
                                    id: newPicId,
                                    objectId: newObjId,
                                    name: uploadName,
                                    fileurl: uploadDataUrl,
                                    thumbUrl: uploadDataUrl,
                                    imageType: ext,
                                    dimension: { width: w, height: h }
                                }
                            ],
                            sounds: [],
                            category: isBg ? { main: 'background' } : {}
                        },
                        entity: {
                            x: 0,
                            y: 0,
                            regX: w / 2,
                            regY: h / 2,
                            scaleX: scale,
                            scaleY: scale,
                            width: w,
                            height: h,
                            rotation: 0,
                            direction: 90,
                            lineBreak: true,
                            visible: true
                        }
                    });

                    if (Entry.container && Entry.container.selectObject) {
                        Entry.container.selectObject(newObjId);
                    }
                };
                uploadImg.src = uploadDataUrl;
            }

            uploadedFileCache = null;
            closeResourceManager();
            return;
        }

        // 4. 갤러리 프리셋 선택 추가
        if (selectedItems.length === 0) {
            alert('추가할 항목을 1개 이상 선택해주세요.');
            return;
        }

        if (currentMode === 'sound') {
            const targetObj = getTargetObject();
            if (!targetObj) {
                alert('소리를 추가할 대상 오브젝트를 선택해주세요.');
                return;
            }
            selectedItems.forEach(snd => {
                const soundUrl = snd.fileurl || `https://playentry.org/uploads/${snd.filename.slice(0, 2)}/${snd.filename.slice(2, 4)}/${snd.filename}.mp3`;
                const newSound = {
                    id: Entry.generateHash(),
                    name: snd.name,
                    fileurl: soundUrl,
                    duration: snd.duration || 1
                };
                if (Entry.do && Entry.STATIC && Entry.STATIC.COMMAND_TYPES && Entry.STATIC.COMMAND_TYPES.objectAddSound) {
                    Entry.do('objectAddSound', targetObj.id, newSound, true);
                } else {
                    targetObj.addSound(newSound);
                    if (Entry.playground) {
                        Entry.playground.injectSound && Entry.playground.injectSound(true);
                        Entry.playground.selectSound && Entry.playground.selectSound(newSound);
                    }
                }
            });
        } else if (currentMode === 'picture') {
            const targetObj = getTargetObject();
            if (!targetObj) {
                alert('모양을 추가할 대상 오브젝트를 선택해주세요.');
                return;
            }
            selectedItems.forEach(sp => {
                (sp.pictures || []).forEach(pic => {
                    const ext = pic.imageType || (pic.fileurl && pic.fileurl.endsWith('.svg') ? 'svg' : (pic.filename && pic.filename.endsWith('.svg') ? 'svg' : 'png'));
                    const picUrl = pic.fileurl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/image/${pic.filename}.${ext === 'svg' ? 'svg' : 'png'}`;
                    const thumbUrl = pic.thumbUrl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/thumb/${pic.filename}.png`;
                    const newPic = {
                        id: Entry.generateHash(),
                        objectId: targetObj.id,
                        name: pic.name || sp.name,
                        fileurl: picUrl,
                        thumbUrl: thumbUrl,
                        dimension: pic.dimension || { width: 100, height: 100 },
                        filename: pic.filename,
                        imageType: ext
                    };
                    if (Entry.do && Entry.STATIC && Entry.STATIC.COMMAND_TYPES && Entry.STATIC.COMMAND_TYPES.objectAddPicture) {
                        Entry.do('objectAddPicture', targetObj.id, newPic, true);
                    } else if (Entry.playground && Entry.playground.addPicture) {
                        Entry.playground.addPicture(newPic, true);
                    } else {
                        targetObj.addPicture(newPic);
                        if (Entry.playground) {
                            Entry.playground.injectPicture && Entry.playground.injectPicture(true);
                            Entry.playground.selectPicture && Entry.playground.selectPicture(newPic);
                        }
                    }
                });
            });
        } else {
            // 스프라이트 추가
            selectedItems.forEach(sp => {
                const newObjId = Entry.generateHash();
                const pictures = (sp.pictures || []).map((pic, idx) => {
                    const ext = pic.imageType || (pic.fileurl && pic.fileurl.endsWith('.svg') ? 'svg' : (pic.filename && pic.filename.endsWith('.svg') ? 'svg' : 'png'));
                    const picUrl = pic.fileurl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/image/${pic.filename}.${ext === 'svg' ? 'svg' : 'png'}`;
                    const thumbUrl = pic.thumbUrl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/thumb/${pic.filename}.png`;
                    return {
                        id: Entry.generateHash(),
                        objectId: newObjId,
                        name: pic.name || (sp.name + '_' + (idx + 1)),
                        filename: pic.filename,
                        fileurl: picUrl,
                        thumbUrl: thumbUrl,
                        imageType: ext,
                        dimension: pic.dimension || { width: 100, height: 100 }
                    };
                });

                const sounds = (sp.sounds || []).map(snd => ({
                    id: Entry.generateHash(),
                    name: snd.name,
                    filename: snd.filename,
                    fileurl: snd.fileurl || `https://playentry.org/uploads/${snd.filename.slice(0, 2)}/${snd.filename.slice(2, 4)}/${snd.filename}.mp3`,
                    duration: snd.duration || 1
                }));

                const firstPic = pictures[0] || { dimension: { width: 100, height: 100 } };
                const w = (firstPic.dimension && firstPic.dimension.width) || 100;
                const h = (firstPic.dimension && firstPic.dimension.height) || 100;
                const isBg = (sp.category === 'background') ||
                             (sp.category && sp.category.main === 'background') ||
                             (typeof sp.category === 'string' && sp.category.includes('background')) ||
                             (activeCategory === '배경') ||
                             (sp.name && sp.name.includes('배경'));
                const scale = isBg 
                    ? Math.max(270 / h, 480 / w)
                    : (200 / (w + h));

                Entry.container.addObject({
                    id: newObjId,
                    name: sp.name,
                    objectType: 'sprite',
                    rotateMethod: 'free',
                    scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
                    sprite: {
                        name: sp.name,
                        pictures: pictures,
                        sounds: sounds,
                        category: isBg ? { main: 'background' } : (sp.category || {})
                    },
                    entity: {
                        x: 0,
                        y: 0,
                        regX: w / 2,
                        regY: h / 2,
                        scaleX: scale,
                        scaleY: scale,
                        width: w,
                        height: h,
                        rotation: 0,
                        direction: 90,
                        lineBreak: true,
                        visible: true
                    }
                });

                if (Entry.container && Entry.container.selectObject) {
                    Entry.container.selectObject(newObjId);
                }
            });
        }

        closeResourceManager();
    };

    // =========================================================================
    // 실시간 블록 수 카운터 동기화 모듈 (블록 삭제/추가/이동 시 실시간 100% 반영)
    // =========================================================================
    function getProjectBlockCount() {
        var count = 0;
        if (window.Entry && Entry.container && Entry.container.objects_) {
            Entry.container.objects_.forEach(function (obj) {
                if (obj.script && obj.script.getBlockList) {
                    var blocks = obj.script.getBlockList();
                    blocks.forEach(function (b) {
                        if (b && (!b.isParamBlockType || !b.isParamBlockType())) {
                            count++;
                        }
                    });
                }
            });
        }
        return count;
    }

    function getSelectedObjectBlockCount() {
        var count = 0;
        var ws = window.Entry && Entry.getMainWS && Entry.getMainWS();
        var board = ws && ws.getBoard && ws.getBoard();
        if (board && board.code && board.code.getBlockList) {
            var blocks = board.code.getBlockList();
            blocks.forEach(function (b) {
                if (b && (!b.isParamBlockType || !b.isParamBlockType())) {
                    count++;
                }
            });
        } else {
            var obj = window.Entry && Entry.container && Entry.container.selectedObject;
            if (obj && obj.script && obj.script.getBlockList) {
                var blocks = obj.script.getBlockList();
                blocks.forEach(function (b) {
                    if (b && (!b.isParamBlockType || !b.isParamBlockType())) {
                        count++;
                    }
                });
            }
        }
        return count;
    }

    function syncEntryBlockCount() {
        if (!window.Entry) return;
        try {
            if (Entry.Utils && Entry.Utils.clearObjectsBlocksForEventThread) {
                Entry.Utils.clearObjectsBlocksForEventThread();
            }

            var totalCount = getProjectBlockCount();
            var objCount = getSelectedObjectBlockCount();

            // 1. 상단 플로팅 뷰 동기화
            var topView = document.querySelector('.entryBlockCountView .blockCountView');
            if (topView) {
                topView.innerHTML = '블록 <strong>' + totalCount + '</strong> 개';
            }

            // 2. 보드 상단 오브젝트 타이틀 동기화
            var svgCountText = document.querySelector('.svgObjectBlockCount text');
            if (svgCountText) {
                svgCountText.textContent = '블록 ' + objCount + ' 개';
            }
            var svgRect = document.querySelector('.svgObjectBlockCount rect');
            if (svgRect && svgCountText && svgCountText.getBoundingClientRect) {
                var textWidth = svgCountText.getBoundingClientRect().width;
                if (textWidth > 10) {
                    svgRect.setAttribute('width', (textWidth + 16));
                }
            }
        } catch (e) {}
    }
    window.syncEntryBlockCount = syncEntryBlockCount;

    // 주기적 동기화 (드래그 휴지통 삭제, 단축키 등 모든 케이스 방어)
    setInterval(syncEntryBlockCount, 250);

    // 엔트리 이벤트 등록 함수
    function registerEntryEvents() {
        if (!window.Entry) return;

        if (Entry.addEventListener) {
            Entry.addEventListener('openSpriteManager', function () {
                window.openResourceManager('sprite');
            });
            Entry.addEventListener('openPictureManager', function () {
                window.openResourceManager('picture');
            });
            Entry.addEventListener('openSoundManager', function () {
                window.openResourceManager('sound');
            });

            // 모양 그리기/수정 저장 이벤트 처리 (saveCanvasImage)
            Entry.addEventListener('saveCanvasImage', function (data) {
                if (!data || !data.file) return;
                var file = data.file;
                var imageSrc = data.image;
                if (!imageSrc) return;

                var targetObj = (file.objectId && Entry.container && Entry.container.getObject && Entry.container.getObject(file.objectId)) ||
                                (Entry.container && Entry.container.selectedObject) ||
                                (Entry.playground && Entry.playground.object);

                if (!targetObj) {
                    console.warn('[saveCanvasImage] 대상 오브젝트를 찾을 수 없습니다.');
                    return;
                }

                var img = new Image();
                img.onload = function () {
                    var width = img.naturalWidth || img.width || 100;
                    var height = img.naturalHeight || img.height || 100;

                    if (file.mode === 'new') {
                        // 새 모양 추가
                        var newPic = {
                            id: file.id || Entry.generateHash(),
                            name: file.name || '새 모양',
                            fileurl: imageSrc,
                            thumbUrl: imageSrc,
                            dimension: { width: width, height: height },
                            filename: Entry.generateHash(),
                            imageType: file.ext || 'png'
                        };
                        if (file.svg) newPic.svg = file.svg;

                        if (Entry.do && Entry.STATIC && Entry.STATIC.COMMAND_TYPES && Entry.STATIC.COMMAND_TYPES.objectAddPicture) {
                            Entry.do('objectAddPicture', targetObj.id, newPic, true);
                        } else if (Entry.playground && Entry.playground.addPicture) {
                            Entry.playground.addPicture(newPic, true);
                        } else {
                            targetObj.addPicture(newPic);
                        }
                    } else {
                        // 기존 모양 수정 저장
                        var pic = targetObj.getPicture(file.id);
                        if (!pic && targetObj.selectedPicture) {
                            pic = targetObj.selectedPicture;
                        }
                        if (pic) {
                            pic.fileurl = imageSrc;
                            pic.thumbUrl = imageSrc;
                            pic.dimension = { width: width, height: height };
                            pic.imageType = file.ext || 'png';
                            if (file.svg) pic.svg = file.svg;

                            if (targetObj.entity && targetObj.entity.setImage) {
                                try { targetObj.entity.setImage(pic); } catch (e) {}
                            }
                            if (targetObj.updateThumbnailView) {
                                try { targetObj.updateThumbnailView(); } catch (e) {}
                            }
                            if (Entry.container && Entry.container.selectPicture) {
                                try { Entry.container.selectPicture(pic.id, targetObj.id); } catch (e) {}
                            }
                        }
                    }

                    if (Entry.playground && Entry.playground.injectPicture) {
                        Entry.playground.injectPicture(targetObj);
                    }
                    if (Entry.stage && Entry.stage.updateObject) {
                        Entry.stage.updateObject();
                    }
                    if (window.updateSaveBadge) {
                        window.updateSaveBadge('modified', '그림 수정됨');
                    }
                };
                img.src = imageSrc;
            });

            Entry.addEventListener('loadComplete', syncEntryBlockCount);
            Entry.addEventListener('selectObject', syncEntryBlockCount);
            Entry.addEventListener('workspaceChangeMode', syncEntryBlockCount);
            console.log('✔ 엔트리 리소스 매니저 및 블록 카운터 이벤트 리스너 등록 완료');
        }
    }
    window.registerEntryEvents = registerEntryEvents;

    // Entry.init 및 dispatchEvent 후킹 (Entry.init 시 events_ 초기화 대응)
    function hookEntry() {
        if (!window.Entry) {
            setTimeout(hookEntry, 50);
            return;
        }

        // 1. Entry.init 래핑
        if (Entry.init && !Entry._resourceManagerHooked) {
            Entry._resourceManagerHooked = true;
            const originalInit = Entry.init;
            Entry.init = function () {
                const result = originalInit.apply(this, arguments);
                registerEntryEvents();
                syncEntryBlockCount();
                return result;
            };
        }

        // 2. Entry.dispatchEvent 래핑 (이벤트 객체가 비워져도 dispatch 시 무조건 실행)
        if (Entry.dispatchEvent && !Entry._dispatchHooked) {
            Entry._dispatchHooked = true;
            const originalDispatch = Entry.dispatchEvent;
            Entry.dispatchEvent = function (eventName) {
                if (eventName === 'openSpriteManager') {
                    window.openResourceManager('sprite');
                } else if (eventName === 'openPictureManager' || eventName === 'openPictureImport') {
                    window.openResourceManager('picture');
                } else if (eventName === 'openSoundManager') {
                    window.openResourceManager('sound');
                }
                return originalDispatch.apply(this, arguments);
            };
        }

        // 3. Entry.commander.doEvent 후킹 (모든 블록 추가/삭제/이동 명령 시 실시간 블록 수 갱신)
        if (Entry.commander && Entry.commander.doEvent && !Entry._blockCountHooked) {
            Entry._blockCountHooked = true;
            Entry.commander.doEvent.attach({}, syncEntryBlockCount);
        }

        // 4. Entry.Painter 그림 전환 및 캔버스 초기화 동기화 보강 후킹
        if (window.Entry && Entry.Painter && Entry.Painter.prototype && !Entry._painterHooked) {
            Entry._painterHooked = true;

            const originalAfterModified = Entry.Painter.prototype.afterModified;
            Entry.Painter.prototype.afterModified = function (picture) {
                // 이전 오브젝트 그림 잔상이 캔버스에 남거나 겹쳐 나오는 버그 방지: 무조건 캔버스 리셋 후 새 모양 렌더링
                if (this.entryPaint && this.entryPaint.reset) {
                    try { this.entryPaint.reset(); } catch (e) {}
                }
                if (picture) {
                    if (!picture.imageType) {
                        const url = (picture.fileurl || picture.filename || '').toLowerCase();
                        picture.imageType = (url.endsWith('.svg') || url.includes('image/svg') || url.includes('.svg?')) ? 'svg' : 'png';
                    }
                }
                return originalAfterModified.apply(this, arguments);
            };

            const originalGetImageSrc = Entry.Painter.prototype.getImageSrc;
            Entry.Painter.prototype.getImageSrc = function (picture) {
                if (!picture) return '';
                if (picture.fileurl) return picture.fileurl;
                const filename = picture.filename;
                if (!filename) return '';
                const imageType = picture.imageType === 'svg' ? 'svg' : 'png';
                return `https://playentry.org/uploads/${filename.substring(0, 2)}/${filename.substring(2, 4)}/image/${filename}.${imageType}`;
            };
        }

        // 5. Entry.Playground selectPicture 동기화 보강 후킹
        if (window.Entry && Entry.Playground && Entry.Playground.prototype && !Entry._playgroundSelectPicHooked) {
            Entry._playgroundSelectPicHooked = true;
            const originalSelectPicture = Entry.Playground.prototype.selectPicture;
            Entry.Playground.prototype.selectPicture = function (picture, removed) {
                if (picture && this.object) {
                    if (!picture.objectId) {
                        picture.objectId = this.object.id;
                    }
                }
                const res = originalSelectPicture.apply(this, arguments);
                if (picture && this.painter && (!this.painter.file || this.painter.file.id !== picture.id)) {
                    try {
                        this.painter.changePicture(picture);
                    } catch (e) {}
                }
                return res;
            };
        }

        registerEntryEvents();
        syncEntryBlockCount();
    }

    hookEntry();

    // 3. 글로벌 DOM 클릭 이벤트 안전 위임 (버블 단계에서 정확한 추가 버튼만 감지)
    // 오브젝트 정보 패널, 드래그, 인풋 입력 시 모달 오작동 완전 방지
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (!target) return;

        // 모달 내부 클릭은 통과
        if (target.closest && target.closest('#resource-modal')) return;

        // 오브젝트 항목(정보 수정/드래그/이름변경) 내부 클릭은 추가 모달 방지
        if (target.closest && target.closest('.entryObjectElementWorkspace, .entryObject, input, select, textarea, .entryContainerListWorkspace') && 
            !target.closest('.entryAddObjectWorkspace, .entryAddButtonWorkspace_w')) {
            return;
        }

        // A. 오브젝트 추가 버튼 감지 (정확한 클래스 매칭)
        const spriteBtn = target.closest && target.closest('.entryAddObjectWorkspace, .entryAddButtonWorkspace_w');
        if (spriteBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.openResourceManager('sprite');
            return;
        }

        // B. 모양 추가 버튼 감지
        const picBtn = target.closest && target.closest('.entryPlaygroundAddPictureInner, .entryPlaygroundPictureAdd, .entryPictureAdd');
        if (picBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.openResourceManager('picture');
            return;
        }

        // C. 소리 추가 버튼 감지
        const soundBtn = target.closest && target.closest('.entryPlaygroundAddSoundInner, .entryPlaygroundSoundAdd, .entrySoundAdd');
        if (soundBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.openResourceManager('sound');
            return;
        }
    }, false);
})();
