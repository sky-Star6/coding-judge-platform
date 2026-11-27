/**
 * YBM COS 3급 PDF 지문 디자인 포맷터
 * - 이미 .cos-pdf-* 클래스로 작성된 지문은 그대로 유지하고 인라인 배지/값 강조만 보강합니다.
 * - 기존 HTML(h3, p, strong+ol/ul) 지문은 3급 1번.pdf 카드 스택 구조로 자동 변환합니다.
 */
(function (global) {
    'use strict';

    var START_BADGE_HTML =
        '<span class="cos-start-badge" aria-label="시작하기">' +
        '<span class="cos-start-tri">▶</span>' +
        '<span class="cos-start-text">시작하기</span>' +
        '</span>';

    /**
     * 텍스트 노드 내 [시작하기], [▶ 시작하기], '값' 토큰을 시각적 배지/밑줄로 치환합니다.
     */
    function enhanceInlineTokens(rootEl) {
        if (!rootEl) return;

        var walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        var node;
        while ((node = walker.nextNode())) {
            if (node.parentElement && node.parentElement.closest('.cos-start-badge, .cos-val, script, style')) {
                continue;
            }
            if (/\[(?:▶\s*)?시작하기\]|'[^'\n]{1,24}'/.test(node.nodeValue)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(function (textNode) {
            var text = textNode.nodeValue;
            var html = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            html = html.replace(/\[(?:▶\s*)?시작하기\]/g, START_BADGE_HTML);
            html = html.replace(/'([^'\n]{1,24})'/g, '<span class="cos-val">\'$1\'</span>');

            if (html !== text) {
                var span = document.createElement('span');
                span.innerHTML = html;
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    /**
     * 블록 리스트(<ol>/<ul>) 내부를 PDF 스타일(1., ①②③, →)로 정리합니다.
     */
    function formatListToPdf(listEl, mode) {
        var wrapper = document.createElement('div');
        wrapper.className = mode === 'process' ? 'cos-pdf-process-list' : 'cos-pdf-instruction-list';

        var items = Array.prototype.slice.call(listEl.children).filter(function (el) {
            return el.tagName === 'LI';
        });

        var circled = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

        items.forEach(function (li, idx) {
            var subLists = Array.prototype.slice.call(li.querySelectorAll(':scope > ol, :scope > ul'));
            var clone = li.cloneNode(true);
            Array.prototype.slice.call(clone.querySelectorAll(':scope > ol, :scope > ul')).forEach(function (sl) {
                sl.remove();
            });

            var rawHtml = clone.innerHTML.trim();

            if (mode === 'process') {
                var row = document.createElement('div');
                row.className = 'cos-pdf-process-item';
                if (/^→/.test(clone.textContent.trim())) {
                    row.className = 'cos-pdf-arrow-line';
                    row.innerHTML = rawHtml;
                } else {
                    row.innerHTML = '<span class="cos-pdf-num">' + (idx + 1) + '.</span><div class="cos-pdf-item-body">' + rawHtml + '</div>';
                }
                wrapper.appendChild(row);
            } else if (mode === 'notice') {
                var noticeRow = document.createElement('div');
                noticeRow.className = 'cos-pdf-notice-item';
                noticeRow.innerHTML = rawHtml;
                wrapper.appendChild(noticeRow);
            } else {
                // 지시사항: 하위 리스트가 있으면 이벤트 트리거(▶) + 1) + ①②③ 구조로 변환
                if (subLists.length > 0) {
                    var evRow = document.createElement('div');
                    evRow.className = 'cos-pdf-event-row';
                    evRow.innerHTML = '<span class="cos-pdf-tri">▶</span><span class="cos-pdf-event-text">' + rawHtml + '</span>';
                    wrapper.appendChild(evRow);

                    subLists.forEach(function (subList, sIdx) {
                        var stepGroup = document.createElement('div');
                        stepGroup.className = 'cos-pdf-step-group';

                        var stepLabel = document.createElement('div');
                        stepLabel.className = 'cos-pdf-step-title';
                        stepLabel.innerHTML = '<span class="cos-pdf-step-num">' + (sIdx + 1) + ')</span> 다음 지시사항을 순서대로 작성하시오.';
                        stepGroup.appendChild(stepLabel);

                        var subItems = Array.prototype.slice.call(subList.children).filter(function (el) {
                            return el.tagName === 'LI';
                        });
                        subItems.forEach(function (sLi, cIdx) {
                            var cRow = document.createElement('div');
                            cRow.className = 'cos-pdf-circle-item';
                            var badge = circled[cIdx] || ((cIdx + 1) + '.');
                            cRow.innerHTML = '<span class="cos-pdf-circle-num">' + badge + '</span><span class="cos-pdf-circle-body">' + sLi.innerHTML.trim() + '</span>';
                            stepGroup.appendChild(cRow);
                        });

                        wrapper.appendChild(stepGroup);
                    });
                } else {
                    var simpleRow = document.createElement('div');
                    simpleRow.className = 'cos-pdf-circle-item';
                    var badge = circled[idx] || ((idx + 1) + '.');
                    simpleRow.innerHTML = '<span class="cos-pdf-circle-num">' + badge + '</span><span class="cos-pdf-circle-body">' + rawHtml + '</span>';
                    wrapper.appendChild(simpleRow);
                }
            }
        });

        return wrapper;
    }

    /**
     * 레거시 HTML 지문을 3급 1번.pdf 카드 스택으로 변환합니다.
     */
    function convertLegacyHtml(container, problemTitle) {
        var temp = document.createElement('div');
        temp.innerHTML = container.innerHTML;

        var summaryTexts = [];
        var processLists = [];
        var variableBlocks = [];
        var situationBlocks = [];
        var instructionLists = [];
        var noticeLists = [];
        var extraNodes = [];

        var children = Array.prototype.slice.call(temp.children);
        var currentSection = 'summary';

        children.forEach(function (el) {
            var tag = el.tagName;
            var txt = el.textContent.trim();

            if (tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4') {
                if (txt) summaryTexts.push(el.innerHTML.trim());
                return;
            }

            if (tag === 'STRONG' || (tag === 'P' && el.children.length === 1 && el.children[0].tagName === 'STRONG' && txt.length < 20)) {
                var cleanLabel = txt.replace(/[:：\s]/g, '');
                if (cleanLabel.indexOf('동작과정') !== -1) { currentSection = 'process'; return; }
                if (cleanLabel.indexOf('변수설명') !== -1) { currentSection = 'variable'; return; }
                if (cleanLabel.indexOf('상황설명') !== -1) { currentSection = 'situation'; return; }
                if (cleanLabel.indexOf('지시사항') !== -1) { currentSection = 'instruction'; return; }
                if (cleanLabel.indexOf('유의사항') !== -1) { currentSection = 'notice'; return; }
            }

            if (tag === 'OL' || tag === 'UL') {
                if (currentSection === 'process') processLists.push(el);
                else if (currentSection === 'notice') noticeLists.push(el);
                else if (currentSection === 'instruction') instructionLists.push(el);
                else extraNodes.push(el);
            } else if (tag === 'P') {
                if (currentSection === 'summary') summaryTexts.push(el.innerHTML.trim());
                else if (currentSection === 'variable') variableBlocks.push(el.innerHTML.trim());
                else if (currentSection === 'situation') situationBlocks.push(el.innerHTML.trim());
                else if (currentSection === 'instruction') instructionLists.push(el);
                else if (currentSection === 'notice') noticeLists.push(el);
                else extraNodes.push(el);
            } else {
                extraNodes.push(el);
            }
        });

        // 아무 구조도 매칭되지 않으면 원본 유지 후 토큰만 강조
        if (summaryTexts.length === 0 && processLists.length === 0 && instructionLists.length === 0) {
            enhanceInlineTokens(container);
            return;
        }

        var frag = document.createDocumentFragment();

        // 1) 설명 카드
        var descCard = document.createElement('section');
        descCard.className = 'cos-pdf-summary-card';
        var descBody = summaryTexts.length > 0 ? summaryTexts.map(function (t) { return '<p>' + t + '</p>'; }).join('') : '<p>' + (problemTitle || '') + '</p>';
        descCard.innerHTML =
            '<div class="cos-pdf-summary-title">설명</div>' +
            '<div class="cos-pdf-summary-body">' + descBody + '</div>';
        frag.appendChild(descCard);

        // 2) 동작과정 카드
        if (processLists.length > 0) {
            var procCard = document.createElement('section');
            procCard.className = 'cos-pdf-summary-card';
            procCard.innerHTML = '<div class="cos-pdf-summary-title">동작과정</div>';
            var procBody = document.createElement('div');
            procBody.className = 'cos-pdf-summary-body';
            processLists.forEach(function (listEl) {
                procBody.appendChild(formatListToPdf(listEl, 'process'));
            });
            procCard.appendChild(procBody);
            frag.appendChild(procCard);
        }

        // 3) 변수설명 카드 (선택)
        if (variableBlocks.length > 0) {
            var varCard = document.createElement('section');
            varCard.className = 'cos-pdf-object-card';
            varCard.innerHTML =
                '<div class="cos-pdf-object-header">' +
                '<div class="cos-pdf-object-label">변수설명</div>' +
                '<div class="cos-pdf-object-name">주요 변수</div>' +
                '</div>' +
                '<div class="cos-pdf-object-body">' +
                variableBlocks.map(function (v) { return '<p>' + v + '</p>'; }).join('') +
                '</div>';
            frag.appendChild(varCard);
        }

        // 4) 코딩 오브젝트 카드 (지시사항 + 유의사항)
        if (instructionLists.length > 0 || noticeLists.length > 0 || situationBlocks.length > 0) {
            var objName = extractObjectName(instructionLists, problemTitle);
            var objCard = document.createElement('section');
            objCard.className = 'cos-pdf-object-card';

            var header = document.createElement('div');
            header.className = 'cos-pdf-object-header';
            header.innerHTML =
                '<div class="cos-pdf-object-label">코딩 오브젝트</div>' +
                '<div class="cos-pdf-object-name">' + objName + '</div>';
            objCard.appendChild(header);

            var body = document.createElement('div');
            body.className = 'cos-pdf-object-body';

            if (situationBlocks.length > 0) {
                var sitTitle = document.createElement('div');
                sitTitle.className = 'cos-pdf-section-label';
                sitTitle.textContent = '상황설명';
                body.appendChild(sitTitle);
                situationBlocks.forEach(function (s) {
                    var p = document.createElement('div');
                    p.className = 'cos-pdf-event-row';
                    p.innerHTML = '<span class="cos-pdf-tri">▶</span><span>' + s + '</span>';
                    body.appendChild(p);
                });
            }

            if (instructionLists.length > 0) {
                var instTitle = document.createElement('div');
                instTitle.className = 'cos-pdf-section-label';
                instTitle.textContent = '지시사항';
                body.appendChild(instTitle);

                instructionLists.forEach(function (el) {
                    if (el.tagName === 'OL' || el.tagName === 'UL') {
                        body.appendChild(formatListToPdf(el, 'instruction'));
                    } else {
                        var p = document.createElement('p');
                        p.innerHTML = el.innerHTML;
                        body.appendChild(p);
                    }
                });
            }

            if (noticeLists.length > 0) {
                var notTitle = document.createElement('div');
                notTitle.className = 'cos-pdf-section-label cos-pdf-section-notice';
                notTitle.textContent = '유의사항';
                body.appendChild(notTitle);

                noticeLists.forEach(function (el) {
                    if (el.tagName === 'OL' || el.tagName === 'UL') {
                        body.appendChild(formatListToPdf(el, 'notice'));
                    } else {
                        var p = document.createElement('div');
                        p.className = 'cos-pdf-notice-item';
                        p.innerHTML = el.innerHTML;
                        body.appendChild(p);
                    }
                });
            }

            objCard.appendChild(body);
            frag.appendChild(objCard);
        }

        if (extraNodes.length > 0) {
            var extraWrap = document.createElement('div');
            extraWrap.className = 'cos-pdf-extra';
            extraNodes.forEach(function (n) { extraWrap.appendChild(n); });
            frag.appendChild(extraWrap);
        }

        container.innerHTML = '';
        container.appendChild(frag);
        enhanceInlineTokens(container);
    }

    function extractObjectName(instructionLists, problemTitle) {
        for (var i = 0; i < instructionLists.length; i++) {
            var strong = instructionLists[i].querySelector('strong');
            if (strong && strong.textContent.trim().length > 0 && strong.textContent.trim().length <= 12) {
                return strong.textContent.trim();
            }
        }
        if (problemTitle) {
            var cleaned = problemTitle.replace(/\(.*?\)/g, '').trim();
            var firstWord = cleaned.split(/\s+/)[0];
            if (firstWord && firstWord.length <= 10) return firstWord;
        }
        return '대상 오브젝트';
    }

    /**
     * 지문 컨테이너에 COS PDF 디자인을 적용합니다.
     */
    global.renderCosPdfSheet = function (containerId, problemTitle) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var hasStructuredPdf = container.querySelector('.cos-pdf-summary-card, .cos-pdf-object-card');
        if (hasStructuredPdf) {
            enhanceInlineTokens(container);
        } else {
            convertLegacyHtml(container, problemTitle);
        }
    };
})(window);
