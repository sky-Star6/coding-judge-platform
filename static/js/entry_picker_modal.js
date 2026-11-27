/**
 * 엔트리 미션 풀이 / COS 실전 모의고사 선택 팝업 모달
 * - 미션 풀이: 회차 제목(예: 3급 1번) 아래 1 ~ 10 번호 버튼 그리드 표시
 * - COS 모의고사: 등록된 실전 모의고사 목록 표시
 */
(function (global) {
    'use strict';

    var MODAL_ID = 'entry-picker-modal';
    var STYLE_ID = 'entry-picker-modal-style';

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.epm-backdrop{position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:9999;padding:16px;}',
            '.epm-backdrop.open{display:flex;}',
            '.epm-dialog{background:#ffffff;color:#0f172a;width:100%;max-width:520px;max-height:84vh;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.28);display:flex;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0;font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif;}',
            '.epm-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #e2e8f0;background:#f8fafc;}',
            '.epm-title-wrap{display:flex;align-items:center;gap:10px;}',
            '.epm-badge{font-size:12px;font-weight:700;padding:3px 9px;border-radius:9999px;}',
            '.epm-badge.practice{background:#dbeafe;color:#1d4ed8;}',
            '.epm-badge.exam{background:#ede9fe;color:#6d28d9;}',
            '.epm-title{margin:0;font-size:17px;font-weight:800;color:#0f172a;}',
            '.epm-close{background:transparent;border:none;width:32px;height:32px;border-radius:8px;font-size:20px;line-height:1;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;}',
            '.epm-close:hover{background:#e2e8f0;color:#0f172a;}',
            '.epm-body{padding:18px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;}',
            /* 회차별 그룹 카드 (예: 3급 1번 + 1~10 번호 그리드) */
            '.epm-group{border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#f8fafc;}',
            '.epm-group-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}',
            '.epm-group-title{font-size:16px;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:8px;}',
            '.epm-group-dot{width:8px;height:8px;border-radius:50%;background:#2563eb;display:inline-block;}',
            '.epm-group-count{font-size:12px;font-weight:600;color:#64748b;}',
            '.epm-num-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}',
            '.epm-num-btn{height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;text-decoration:none;transition:all 0.15s ease;border:1px solid #cbd5e1;background:#ffffff;color:#1e293b;cursor:pointer;}',
            '.epm-num-btn.active{border-color:#2563eb;background:#eff6ff;color:#1d4ed8;box-shadow:0 2px 6px rgba(37,99,235,0.12);}',
            '.epm-num-btn.active:hover{background:#2563eb;color:#ffffff;transform:translateY(-1px);box-shadow:0 6px 14px rgba(37,99,235,0.22);}',
            '.epm-num-btn.disabled{background:#f1f5f9;border-color:#e2e8f0;color:#94a3b8;cursor:not-allowed;opacity:0.65;}',
            /* 모의고사 리스트 아이템 */
            '.epm-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;text-decoration:none;color:inherit;transition:all 0.15s ease;cursor:pointer;}',
            '.epm-item.exam:hover{border-color:#8b5cf6;background:#faf5ff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(139,92,246,0.1);}',
            '.epm-item-left{display:flex;align-items:center;gap:12px;min-width:0;}',
            '.epm-num{width:30px;height:30px;border-radius:8px;background:#f3e8ff;color:#7c3aed;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
            '.epm-item-info{min-width:0;}',
            '.epm-item-title{font-size:15px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.epm-item-sub{font-size:13px;color:#64748b;margin-top:2px;}',
            '.epm-go{font-size:13px;font-weight:700;color:#7c3aed;flex-shrink:0;white-space:nowrap;}',
            '.epm-empty{text-align:center;padding:32px 16px;color:#64748b;font-size:14px;}'
        ].join('');
        document.head.appendChild(style);
    }

    function ensureModal() {
        ensureStyle();
        var el = document.getElementById(MODAL_ID);
        if (el) return el;

        el = document.createElement('div');
        el.id = MODAL_ID;
        el.className = 'epm-backdrop';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.innerHTML =
            '<div class="epm-dialog">' +
                '<div class="epm-header">' +
                    '<div class="epm-title-wrap">' +
                        '<span class="epm-badge" id="epm-badge"></span>' +
                        '<h3 class="epm-title" id="epm-title"></h3>' +
                    '</div>' +
                    '<button type="button" class="epm-close" id="epm-close-btn" aria-label="닫기">&times;</button>' +
                '</div>' +
                '<div class="epm-body" id="epm-body"></div>' +
            '</div>';

        el.addEventListener('click', function (e) {
            if (e.target === el) closeModal();
        });
        document.body.appendChild(el);
        document.getElementById('epm-close-btn').addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && el.classList.contains('open')) closeModal();
        });
        return el;
    }

    function closeModal() {
        var el = document.getElementById(MODAL_ID);
        if (el) el.classList.remove('open');
    }

    /**
     * 문제 제목에서 회차 그룹명(예: "3급 1번")과 문제 번호(1~10)를 추출합니다.
     */
    function parseProblemGroup(title) {
        var m1 = title.match(/(\d급\s*\d+번)\s*[-·:]\s*(\d+)번/);
        if (m1) {
            return { group: m1[1].replace(/\s+/g, ' '), num: parseInt(m1[2], 10) };
        }
        var m2 = title.match(/(\d급)\s*(\d+)회\s*(\d+)번/);
        if (m2) {
            return { group: m2[1] + ' ' + m2[2] + '번', num: parseInt(m2[3], 10) };
        }
        return { group: '기타 문제', num: null };
    }

    function renderPracticeGroups(body, list, openInNewTab) {
        var groupsOrder = [];
        var groupsMap = {};

        list.forEach(function (item) {
            var parsed = parseProblemGroup(item.title || '');
            if (!groupsMap[parsed.group]) {
                groupsMap[parsed.group] = { numbers: {}, extras: [] };
                groupsOrder.push(parsed.group);
            }
            if (parsed.num && parsed.num >= 1 && parsed.num <= 10) {
                groupsMap[parsed.group].numbers[parsed.num] = item;
            } else {
                groupsMap[parsed.group].extras.push(item);
            }
        });

        body.innerHTML = '';
        groupsOrder.forEach(function (groupName) {
            var g = groupsMap[groupName];
            var readyCount = Object.keys(g.numbers).length + g.extras.length;

            var card = document.createElement('div');
            card.className = 'epm-group';

            var header = document.createElement('div');
            header.className = 'epm-group-header';
            header.innerHTML =
                '<div class="epm-group-title"><span class="epm-group-dot"></span><span></span></div>' +
                '<span class="epm-group-count"></span>';
            header.querySelector('.epm-group-title span:last-child').textContent = groupName;
            header.querySelector('.epm-group-count').textContent = readyCount + ' / 10 문제';
            card.appendChild(header);

            var grid = document.createElement('div');
            grid.className = 'epm-num-grid';

            for (var n = 1; n <= 10; n++) {
                var prob = g.numbers[n];
                if (prob) {
                    var a = document.createElement('a');
                    a.className = 'epm-num-btn active';
                    a.href = '/entry/practice/' + prob.id;
                    a.textContent = String(n);
                    a.title = prob.title;
                    if (openInNewTab) {
                        a.target = '_blank';
                        a.rel = 'noopener';
                    }
                    a.addEventListener('click', function () {
                        if (openInNewTab) closeModal();
                    });
                    grid.appendChild(a);
                } else {
                    var span = document.createElement('span');
                    span.className = 'epm-num-btn disabled';
                    span.textContent = String(n);
                    span.title = n + '번 문제 준비 중';
                    grid.appendChild(span);
                }
            }

            card.appendChild(grid);
            body.appendChild(card);
        });
    }

    function openPicker(type, openInNewTab) {
        var modal = ensureModal();
        var badge = document.getElementById('epm-badge');
        var title = document.getElementById('epm-title');
        var body = document.getElementById('epm-body');

        var isExam = type === 'exam';
        badge.className = 'epm-badge ' + (isExam ? 'exam' : 'practice');
        badge.textContent = isExam ? 'COS 모의고사' : '미션 풀이';
        title.textContent = isExam ? '응시할 COS 실전 모의고사를 선택하세요' : '풀어볼 문제 번호를 선택하세요';
        body.innerHTML = '<div class="epm-empty">목록을 불러오는 중...</div>';
        modal.classList.add('open');

        var apiUrl = isExam ? '/api/entry/exams' : '/api/entry/problems';
        fetch(apiUrl)
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var list = isExam ? (data.exams || []) : (data.problems || []);
                if (!list.length) {
                    body.innerHTML = '<div class="epm-empty">등록된 항목이 없습니다.</div>';
                    return;
                }

                if (!isExam) {
                    renderPracticeGroups(body, list, openInNewTab);
                    return;
                }

                body.innerHTML = '';
                list.forEach(function (item, idx) {
                    var a = document.createElement('a');
                    a.className = 'epm-item exam';
                    a.href = '/entry/exam/' + item.id;
                    if (openInNewTab) {
                        a.target = '_blank';
                        a.rel = 'noopener';
                    }
                    a.addEventListener('click', function () {
                        if (openInNewTab) closeModal();
                    });

                    var subText = '제한시간 ' + (item.time_limit || 40) + '분 · 총 ' + (item.problem_count || 1) + '문항';

                    a.innerHTML =
                        '<div class="epm-item-left">' +
                            '<span class="epm-num">' + (idx + 1) + '</span>' +
                            '<div class="epm-item-info">' +
                                '<div class="epm-item-title"></div>' +
                                '<div class="epm-item-sub"></div>' +
                            '</div>' +
                        '</div>' +
                        '<span class="epm-go">응시하기 &rarr;</span>';

                    a.querySelector('.epm-item-title').textContent = item.title;
                    a.querySelector('.epm-item-sub').textContent = subText;
                    body.appendChild(a);
                });
            })
            .catch(function () {
                body.innerHTML = '<div class="epm-empty">목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>';
            });
    }

    global.openEntryPracticePicker = function (openInNewTab) {
        openPicker('practice', !!openInNewTab);
    };

    global.openEntryExamPicker = function (openInNewTab) {
        openPicker('exam', !!openInNewTab);
    };
})(window);
