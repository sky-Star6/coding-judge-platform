/**
 * 엔트리 미션 풀이 / COS 실전 모의고사 선택 팝업 모달
 * - home.html, block_coding.html 등에서 공통으로 사용합니다.
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
            '.epm-dialog{background:#ffffff;color:#0f172a;width:100%;max-width:560px;max-height:82vh;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.28);display:flex;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0;font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif;}',
            '.epm-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #e2e8f0;background:#f8fafc;}',
            '.epm-title-wrap{display:flex;align-items:center;gap:10px;}',
            '.epm-badge{font-size:12px;font-weight:700;padding:3px 9px;border-radius:9999px;}',
            '.epm-badge.practice{background:#dbeafe;color:#1d4ed8;}',
            '.epm-badge.exam{background:#ede9fe;color:#6d28d9;}',
            '.epm-title{margin:0;font-size:17px;font-weight:800;color:#0f172a;}',
            '.epm-close{background:transparent;border:none;width:32px;height:32px;border-radius:8px;font-size:20px;line-height:1;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;}',
            '.epm-close:hover{background:#e2e8f0;color:#0f172a;}',
            '.epm-body{padding:16px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}',
            '.epm-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;text-decoration:none;color:inherit;transition:all 0.15s ease;cursor:pointer;}',
            '.epm-item:hover{border-color:#3b82f6;background:#f8faff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(37,99,235,0.1);}',
            '.epm-item.exam:hover{border-color:#8b5cf6;background:#faf5ff;box-shadow:0 4px 12px rgba(139,92,246,0.1);}',
            '.epm-item-left{display:flex;align-items:center;gap:12px;min-width:0;}',
            '.epm-num{width:30px;height:30px;border-radius:8px;background:#eff6ff;color:#2563eb;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
            '.epm-item.exam .epm-num{background:#f3e8ff;color:#7c3aed;}',
            '.epm-item-info{min-width:0;}',
            '.epm-item-title{font-size:15px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.epm-item-sub{font-size:13px;color:#64748b;margin-top:2px;}',
            '.epm-go{font-size:13px;font-weight:700;color:#2563eb;flex-shrink:0;white-space:nowrap;}',
            '.epm-item.exam .epm-go{color:#7c3aed;}',
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

    function openPicker(type, openInNewTab) {
        var modal = ensureModal();
        var badge = document.getElementById('epm-badge');
        var title = document.getElementById('epm-title');
        var body = document.getElementById('epm-body');

        var isExam = type === 'exam';
        badge.className = 'epm-badge ' + (isExam ? 'exam' : 'practice');
        badge.textContent = isExam ? 'COS 모의고사' : '미션 풀이';
        title.textContent = isExam ? '응시할 COS 실전 모의고사를 선택하세요' : '풀어볼 엔트리 미션을 선택하세요';
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

                body.innerHTML = '';
                list.forEach(function (item, idx) {
                    var a = document.createElement('a');
                    a.className = 'epm-item' + (isExam ? ' exam' : '');
                    a.href = (isExam ? '/entry/exam/' : '/entry/practice/') + item.id;
                    if (openInNewTab) {
                        a.target = '_blank';
                        a.rel = 'noopener';
                    }
                    a.addEventListener('click', function () {
                        if (openInNewTab) closeModal();
                    });

                    var subText = isExam
                        ? ('제한시간 ' + (item.time_limit || 40) + '분 · 총 ' + (item.problem_count || 1) + '문항')
                        : ('문제 #' + item.id + ' · 자동 채점 지원');

                    a.innerHTML =
                        '<div class="epm-item-left">' +
                            '<span class="epm-num">' + (idx + 1) + '</span>' +
                            '<div class="epm-item-info">' +
                                '<div class="epm-item-title"></div>' +
                                '<div class="epm-item-sub"></div>' +
                            '</div>' +
                        '</div>' +
                        '<span class="epm-go">' + (isExam ? '응시하기 &rarr;' : '미션 풀기 &rarr;') + '</span>';

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
