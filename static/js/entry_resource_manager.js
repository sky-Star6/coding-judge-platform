/**
 * Entry Resource Manager (오브젝트 / 모양 / 소리 추가 모달 시스템)
 * - PlayEntry 갤러리 프리셋 (스프라이트, 모양, 소리)
 * - 글상자 텍스트 오브젝트 생성
 * - 사용자 로컬 파일 (이미지, 오디오) 직접 업로드
 */

(function () {
    let spritesPreset = [];
    let soundsPreset = [];
    let currentMode = 'sprite'; // 'sprite' | 'picture' | 'sound'
    let currentTab = 'gallery'; // 'gallery' | 'textbox' | 'upload'
    let selectedItems = [];
    let activeCategory = 'all';
    let searchQuery = '';
    let currentAudio = null;

    // 프리셋 데이터 사전 비동기 로드
    fetch('/static/entry_data/sprites_preset.json')
        .then(res => res.json())
        .then(data => { spritesPreset = data; })
        .catch(err => console.warn('스프라이트 프리셋 로드 실패:', err));

    fetch('/static/entry_data/sounds_preset.json')
        .then(res => res.json())
        .then(data => { soundsPreset = data; })
        .catch(err => console.warn('소리 프리셋 로드 실패:', err));

    // 모달 DOM 동적 생성
    function ensureModalDom() {
        if (document.getElementById('resource-modal')) return;

        const modalHtml = `
        <div id="resource-modal" class="rm-overlay">
            <div class="rm-dialog">
                <header class="rm-header">
                    <div class="rm-title-group">
                        <h2 id="rm-title" class="rm-title">오브젝트 추가하기</h2>
                        <div class="rm-tabs" id="rm-tabs">
                            <button class="rm-tab-btn active" data-tab="gallery" onclick="switchRmTab('gallery')">갤러리 선택</button>
                            <button class="rm-tab-btn" id="rm-tab-textbox" data-tab="textbox" onclick="switchRmTab('textbox')">글상자</button>
                            <button class="rm-tab-btn" data-tab="upload" onclick="switchRmTab('upload')">내 파일 올리기</button>
                        </div>
                    </div>
                    <button class="rm-close-btn" onclick="closeResourceManager()" title="닫기">&times;</button>
                </header>

                <div class="rm-body">
                    <!-- 1. 갤러리 탭 -->
                    <div id="rm-panel-gallery" style="display:flex; flex-direction:column; height:100%;">
                        <div class="rm-filter-bar">
                            <div class="rm-category-chips" id="rm-categories"></div>
                            <input type="text" class="rm-search-input" id="rm-search" placeholder="이름으로 검색..." oninput="handleRmSearch(this.value)" />
                        </div>
                        <div class="rm-grid-container">
                            <div class="rm-grid" id="rm-grid"></div>
                        </div>
                    </div>

                    <!-- 2. 글상자 탭 (오브젝트 전용) -->
                    <div id="rm-panel-textbox" style="display:none; height:100%; overflow-y:auto;">
                        <div class="rm-textbox-panel">
                            <div class="rm-form-group">
                                <label for="rm-tb-text">글상자 내용</label>
                                <textarea id="rm-tb-text" class="rm-textarea" placeholder="화면에 표시할 텍스트를 입력하세요">안녕! 마이로봇코딩</textarea>
                            </div>
                            <div class="rm-color-row">
                                <div class="rm-color-item">
                                    <label>글자색:</label>
                                    <input type="color" id="rm-tb-color" class="rm-color-input" value="#000000" onchange="updateTbPreview()" />
                                </div>
                                <div class="rm-color-item">
                                    <label>배경색:</label>
                                    <input type="color" id="rm-tb-bg" class="rm-color-input" value="#ffffff" onchange="updateTbPreview()" />
                                </div>
                            </div>
                            <div class="rm-form-group">
                                <label>미리보기</label>
                                <div id="rm-tb-preview" class="rm-preview-box" style="background:#ffffff; color:#000000;">
                                    안녕! 마이로봇코딩
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. 내 파일 업로드 탭 -->
                    <div id="rm-panel-upload" style="display:none; height:100%;">
                        <div class="rm-upload-panel">
                            <div class="rm-drop-zone" onclick="document.getElementById('rm-file-input').click()">
                                <div class="rm-drop-icon" id="rm-drop-icon">📁</div>
                                <div style="font-size:1.1rem; font-weight:700; color:#1e293b;" id="rm-drop-title">내 컴퓨터에서 파일 선택</div>
                                <div class="rm-upload-info" id="rm-drop-desc">이미지 파일(.png, .jpg, .svg, .gif)을 클릭하여 업로드하세요</div>
                                <input type="file" id="rm-file-input" style="display:none;" onchange="handleFileUpload(event)" />
                            </div>
                            <div id="rm-upload-preview" style="margin-top:16px; font-weight:600; color:#10b981; display:none;"></div>
                        </div>
                    </div>
                </div>

                <footer class="rm-footer">
                    <div class="rm-selected-info" id="rm-selected-info">선택된 항목: 없음</div>
                    <div class="rm-footer-actions">
                        <button class="cos-btn cos-btn-secondary" onclick="closeResourceManager()">취소</button>
                        <button class="cos-btn cos-btn-primary" style="background:#10b981; font-weight:700;" onclick="confirmResourceSelection()">추가하기</button>
                    </div>
                </footer>
            </div>
        </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstElementChild);

        // 글상자 실시간 미리보기 바인딩
        const tbText = document.getElementById('rm-tb-text');
        if (tbText) {
            tbText.addEventListener('input', updateTbPreview);
        }
    }

    // 모달 열기 함수 (전역 노출)
    window.openResourceManager = function (mode) {
        ensureModalDom();
        currentMode = mode || 'sprite';
        currentTab = 'gallery';
        selectedItems = [];
        activeCategory = 'all';
        searchQuery = '';

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        const modal = document.getElementById('resource-modal');
        const titleEl = document.getElementById('rm-title');
        const tbTab = document.getElementById('rm-tab-textbox');
        const searchInput = document.getElementById('rm-search');
        if (searchInput) searchInput.value = '';

        if (currentMode === 'sprite') {
            titleEl.textContent = '오브젝트 추가하기';
            tbTab.style.display = 'block';
        } else if (currentMode === 'picture') {
            titleEl.textContent = '모양 추가하기';
            tbTab.style.display = 'none';
        } else if (currentMode === 'sound') {
            titleEl.textContent = '소리 추가하기';
            tbTab.style.display = 'none';
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
        document.getElementById('rm-panel-textbox').style.display = (tab === 'textbox') ? 'block' : 'none';
        document.getElementById('rm-panel-upload').style.display = (tab === 'upload') ? 'block' : 'none';

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

    // 카테고리 칩 렌더링
    function renderCategories() {
        const container = document.getElementById('rm-categories');
        if (!container) return;
        container.innerHTML = '';

        let cats = [];
        if (currentMode === 'sound') {
            cats = [
                { id: 'all', name: '전체' },
                { id: '효과음', name: '효과음' },
                { id: '사람', name: '사람' },
                { id: '동물', name: '동물' },
                { id: '자연', name: '자연' },
                { id: '사물', name: '사물' },
                { id: '악기', name: '악기' }
            ];
        } else {
            cats = [
                { id: 'all', name: '전체' },
                { id: 'entrybot_friends', name: '엔트리봇' },
                { id: 'people', name: '사람' },
                { id: 'animal', name: '동물' },
                { id: 'vehicles', name: '탈것' },
                { id: 'background', name: '배경' },
                { id: 'food', name: '음식' },
                { id: 'stuff', name: '사물' },
                { id: 'plant', name: '식물' }
            ];
        }

        cats.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'rm-chip' + (activeCategory === c.id ? ' active' : '');
            btn.textContent = c.name;
            btn.onclick = () => {
                activeCategory = c.id;
                renderCategories();
                renderGrid();
            };
            container.appendChild(btn);
        });
    }

    // 검색 핸들러
    window.handleRmSearch = function (val) {
        searchQuery = (val || '').trim().toLowerCase();
        renderGrid();
    };

    // 갤러리 그리드 렌더링
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
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:40px;">검색 결과가 없습니다.</div>';
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
                    <div class="rm-card-sub">${item.duration || 1}초</div>
                    <button class="rm-sound-play-btn" onclick="playPreviewSound(event, '${soundUrl}')">▶ 재생</button>
                `;

                card.onclick = (e) => {
                    if (e.target.tagName === 'BUTTON') return;
                    toggleSelectItem(item);
                };

                grid.appendChild(card);
            });
        } else {
            // sprite 또는 picture
            let list = spritesPreset.filter(s => {
                const matchCat = (activeCategory === 'all') || (s.category === activeCategory);
                const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery);
                return matchCat && matchSearch;
            });

            if (list.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:40px;">검색 결과가 없습니다.</div>';
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
                    <div class="rm-card-check">✓</div>
                    <div class="rm-card-thumb-wrap">
                        <img src="${thumbSrc}" alt="${item.name}" loading="lazy" onerror="this.src='/lib/entryjs/images/media/entrybot1.png'" />
                    </div>
                    <div class="rm-card-name" title="${item.name}">${item.name}</div>
                    <div class="rm-card-sub">모양 ${item.pictures ? item.pictures.length : 1}개</div>
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

    // 아이템 선택/해제 토글
    function toggleSelectItem(item) {
        const idKey = (currentMode === 'sound') ? 'filename' : 'name';
        const idx = selectedItems.findIndex(x => x[idKey] === item[idKey]);

        if (idx >= 0) {
            selectedItems.splice(idx, 1);
        } else {
            // 다중 선택 또는 단일 선택 지원
            selectedItems.push(item);
        }

        renderGrid();
        updateSelectedInfo();
    }

    function updateSelectedInfo() {
        const infoEl = document.getElementById('rm-selected-info');
        if (!infoEl) return;
        if (selectedItems.length === 0) {
            infoEl.textContent = '선택된 항목: 없음';
        } else {
            const names = selectedItems.map(x => x.name).join(', ');
            infoEl.textContent = `선택된 항목 (${selectedItems.length}개): ${names}`;
        }
    }

    // 글상자 미리보기 갱신
    window.updateTbPreview = function () {
        const text = document.getElementById('rm-tb-text').value;
        const color = document.getElementById('rm-tb-color').value;
        const bg = document.getElementById('rm-tb-bg').value;
        const preview = document.getElementById('rm-tb-preview');
        if (preview) {
            preview.textContent = text || '텍스트를 입력하세요';
            preview.style.color = color;
            preview.style.backgroundColor = bg;
        }
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

    // 최종 추가하기 버튼 핸들러
    window.confirmResourceSelection = function () {
        if (!window.Entry || !Entry.container) {
            alert('엔트리 엔진이 준비되지 않았습니다.');
            return;
        }

        // 1. 글상자 탭 추가
        if (currentTab === 'textbox') {
            const textVal = document.getElementById('rm-tb-text').value.trim() || '글상자';
            const colorVal = document.getElementById('rm-tb-color').value;
            const bgVal = document.getElementById('rm-tb-bg').value;

            Entry.container.addObject({
                id: Entry.generateHash(),
                name: textVal,
                text: textVal,
                objectType: 'textBox',
                rotateMethod: 'free',
                scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
                options: {
                    font: 'NanumGothic',
                    underline: false,
                    italic: false,
                    bold: false,
                    bgColor: bgVal,
                    textColor: colorVal,
                    lineBreak: true
                },
                entity: {
                    x: 0,
                    y: 0,
                    regX: 50,
                    regY: 20,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    direction: 90,
                    lineBreak: true,
                    visible: true
                }
            });

            closeResourceManager();
            return;
        }

        // 2. 파일 업로드 탭 추가
        if (currentTab === 'upload') {
            if (!uploadedFileCache) {
                alert('업로드할 파일을 먼저 선택해주세요.');
                return;
            }

            if (currentMode === 'sound') {
                const targetObj = Entry.container.selectedObject;
                if (!targetObj) {
                    alert('소리를 추가할 오브젝트를 먼저 선택해주세요.');
                    return;
                }
                targetObj.addSound({
                    id: Entry.generateHash(),
                    name: uploadedFileCache.name,
                    fileurl: uploadedFileCache.dataUrl,
                    duration: 2
                });
            } else if (currentMode === 'picture') {
                const targetObj = Entry.container.selectedObject;
                if (!targetObj) {
                    alert('모양을 추가할 오브젝트를 먼저 선택해주세요.');
                    return;
                }
                targetObj.addPicture({
                    id: Entry.generateHash(),
                    name: uploadedFileCache.name,
                    fileurl: uploadedFileCache.dataUrl,
                    thumbUrl: uploadedFileCache.dataUrl,
                    dimension: { width: 100, height: 100 }
                });
            } else {
                // sprite 업로드
                Entry.container.addObject({
                    id: Entry.generateHash(),
                    name: uploadedFileCache.name,
                    objectType: 'sprite',
                    rotateMethod: 'free',
                    scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
                    sprite: {
                        name: uploadedFileCache.name,
                        pictures: [
                            {
                                id: Entry.generateHash(),
                                name: uploadedFileCache.name,
                                fileurl: uploadedFileCache.dataUrl,
                                thumbUrl: uploadedFileCache.dataUrl,
                                dimension: { width: 100, height: 100 }
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
                        rotation: 0,
                        direction: 90,
                        lineBreak: true,
                        visible: true
                    }
                });
            }

            uploadedFileCache = null;
            closeResourceManager();
            return;
        }

        // 3. 갤러리 프리셋 선택 추가
        if (selectedItems.length === 0) {
            alert('추가할 항목을 1개 이상 선택해주세요.');
            return;
        }

        if (currentMode === 'sound') {
            const targetObj = Entry.container.selectedObject;
            if (!targetObj) {
                alert('소리를 추가할 대상 오브젝트를 선택해주세요.');
                return;
            }
            selectedItems.forEach(snd => {
                const soundUrl = snd.fileurl || `https://playentry.org/uploads/${snd.filename.slice(0, 2)}/${snd.filename.slice(2, 4)}/${snd.filename}.mp3`;
                targetObj.addSound({
                    id: Entry.generateHash(),
                    name: snd.name,
                    fileurl: soundUrl,
                    duration: snd.duration || 1
                });
            });
        } else if (currentMode === 'picture') {
            const targetObj = Entry.container.selectedObject;
            if (!targetObj) {
                alert('모양을 추가할 대상 오브젝트를 선택해주세요.');
                return;
            }
            selectedItems.forEach(sp => {
                (sp.pictures || []).forEach(pic => {
                    const picUrl = pic.fileurl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/image/${pic.filename}.png`;
                    const thumbUrl = pic.thumbUrl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/thumb/${pic.filename}.png`;
                    targetObj.addPicture({
                        id: Entry.generateHash(),
                        name: pic.name || sp.name,
                        fileurl: picUrl,
                        thumbUrl: thumbUrl,
                        dimension: pic.dimension || { width: 100, height: 100 }
                    });
                });
            });
        } else {
            // 스프라이트 추가
            selectedItems.forEach(sp => {
                const pictures = (sp.pictures || []).map((pic, idx) => ({
                    id: Entry.generateHash(),
                    name: pic.name || (sp.name + '_' + (idx + 1)),
                    filename: pic.filename,
                    fileurl: pic.fileurl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/image/${pic.filename}.png`,
                    thumbUrl: pic.thumbUrl || `https://playentry.org/uploads/${pic.filename.slice(0, 2)}/${pic.filename.slice(2, 4)}/thumb/${pic.filename}.png`,
                    dimension: pic.dimension || { width: 100, height: 100 }
                }));

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

                Entry.container.addObject({
                    id: Entry.generateHash(),
                    name: sp.name,
                    objectType: 'sprite',
                    rotateMethod: 'free',
                    scene: Entry.scene && Entry.scene.selectedScene ? Entry.scene.selectedScene.id : undefined,
                    sprite: {
                        name: sp.name,
                        pictures: pictures,
                        sounds: sounds
                    },
                    entity: {
                        x: 0,
                        y: 0,
                        regX: w / 2,
                        regY: h / 2,
                        scaleX: 1,
                        scaleY: 1,
                        rotation: 0,
                        direction: 90,
                        lineBreak: true,
                        visible: true
                    }
                });
            });
        }

        closeResourceManager();
    };

    // 엔트리 이벤트 바인딩 (DOM 및 Entry 로드 완료 시)
    function bindEntryEvents() {
        if (!window.Entry || !Entry.addEventListener) {
            setTimeout(bindEntryEvents, 100);
            return;
        }

        Entry.addEventListener('openSpriteManager', function () {
            window.openResourceManager('sprite');
        });

        Entry.addEventListener('openPictureManager', function () {
            window.openResourceManager('picture');
        });

        Entry.addEventListener('openSoundManager', function () {
            window.openResourceManager('sound');
        });

        console.log('✔ 엔트리 리소스 매니저 이벤트(openSpriteManager, openPictureManager, openSoundManager) 바인딩 완료');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindEntryEvents);
    } else {
        bindEntryEvents();
    }
})();
