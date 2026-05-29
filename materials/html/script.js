document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation SPA Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Add active to clicked target
            item.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // 테마 색상 업데이트 (HTML, CSS, JS 챕터별 테마 변경)
            updateThemeColors(targetId);

            // Scroll to top of main content
            document.querySelector('.main-content').scrollTop = 0;
        });
    });

    // 테마 색상 동적 변경 로직
    function updateThemeColors(targetId) {
        const root = document.documentElement;
        // targetId format: module-1, module-11, module-17 등
        const moduleNum = parseInt(targetId.replace('module-', ''));
        
        if (moduleNum >= 1 && moduleNum <= 10) {
            // HTML Theme (Orange)
            root.style.setProperty('--primary-color', '#E44D26');
            root.style.setProperty('--secondary-color', '#F16529');
            root.style.setProperty('--accent-color', '#FF8A65');
            root.style.setProperty('--accent-primary', '#E44D26');
        } else if (moduleNum >= 11 && moduleNum <= 16) {
            // CSS Theme (Blue)
            root.style.setProperty('--primary-color', '#264DE4');
            root.style.setProperty('--secondary-color', '#2965F1');
            root.style.setProperty('--accent-color', '#42A5F5');
            root.style.setProperty('--accent-primary', '#264DE4');
        } else if (moduleNum >= 17) {
            // JS Theme (Yellow)
            root.style.setProperty('--primary-color', '#F7DF1E');
            root.style.setProperty('--secondary-color', '#E5A50A'); // slightly darker for contrast
            root.style.setProperty('--accent-color', '#FFC107');
            root.style.setProperty('--accent-primary', '#F7DF1E');
        }
    }

    // 2. Code Copy Logic
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy-target');
            const codeElem = document.getElementById(targetId);
            
            // Retrieve only the unformatted raw text without HTML tags
            const textToCopy = codeElem.innerText;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy code: ", err);
            });
        });
    });

    // 3. Quiz Logic
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            const isCorrect = this.getAttribute('data-correct') === 'true';
            const feedback = this.parentElement.nextElementSibling;
            
            // Reset siblings
            const siblings = this.parentElement.querySelectorAll('.quiz-option');
            siblings.forEach(sib => {
                sib.classList.remove('correct', 'wrong');
            });

            if (isCorrect) {
                this.classList.add('correct');
                if (feedback && feedback.classList.contains('feedback-msg')) {
                    feedback.style.display = "block";
                    feedback.style.color = "#10b981";
                    feedback.innerHTML = "🎉 정답입니다! 아주 훌륭해요!";
                }
            } else {
                this.classList.add('wrong');
                if (feedback && feedback.classList.contains('feedback-msg')) {
                    feedback.style.display = "block";
                    feedback.style.color = "#ef4444";
                    feedback.innerHTML = "오답입니다. 다시 한번 생각해볼까요?";
                }
            }
        });
    });

    // 4. Live Preview Logic
    const liveEditors = document.querySelectorAll('.live-editor-textarea');
    liveEditors.forEach(editor => {
        const targetId = editor.getAttribute('data-preview-target');
        const iframe = document.getElementById(targetId);
        
        // 초기 로드 시 렌더링
        updateIframe(editor, iframe);

        // 입력 시 실시간 렌더링
        editor.addEventListener('input', () => {
            updateIframe(editor, iframe);
        });
    });

    function updateIframe(textarea, iframe) {
        if(!iframe) return;
        const code = textarea.value;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        // HTML 코드가 들어오면 기본 스타일을 살짝 적용해줌
        iframeDoc.write(`
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 10px; margin: 0; color: #333; }
                </style>
            </head>
            <body>${code}</body>
            </html>
        `);
        iframeDoc.close();
    }
});
