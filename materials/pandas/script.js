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

            // Scroll to top of main content
            document.querySelector('.main-content').scrollTop = 0;
        });
    });

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
                feedback.style.display = "block";
                feedback.style.color = "#10b981";
                feedback.innerHTML = "🎉 정답입니다! 아주 훌륭해요!";
            } else {
                this.classList.add('wrong');
                feedback.style.display = "block";
                feedback.style.color = "#ef4444";
                feedback.innerHTML = "오답입니다. 다시 한번 생각해볼까요?";
            }
        });
    });
});
