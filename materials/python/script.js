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
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Scroll to top of main content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        });
    });

    // 2. Code Copy Logic
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy-target');
            const codeElem = document.getElementById(targetId);
            if (!codeElem) return;
            
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

    // 3. Interactive 5-Question Quiz System
    function initQuizCards() {
        const quizCards = document.querySelectorAll('.interactive-quiz-card');
        
        quizCards.forEach(card => {
            const questionBlocks = card.querySelectorAll('.quiz-item-block');
            const totalQuestions = questionBlocks.length;
            const progressBadge = card.querySelector('.quiz-progress-badge');
            const guideMsg = card.querySelector('.quiz-guide-msg');
            const scoreSummary = card.querySelector('.quiz-score-summary');
            const resetBtn = card.querySelector('.quiz-reset-btn');
            
            function updateQuizState() {
                let answeredCount = 0;
                let correctCount = 0;
                
                questionBlocks.forEach(block => {
                    const selected = block.querySelector('input[type="radio"]:checked');
                    if (selected) {
                        answeredCount++;
                    }
                });
                
                // Update badge text
                if (progressBadge) {
                    const badgeText = progressBadge.querySelector('.status-text strong');
                    if (badgeText) {
                        badgeText.textContent = `${answeredCount} / ${totalQuestions}`;
                    }
                }
                
                // If not all answered yet, keep answers and explanations hidden
                if (answeredCount < totalQuestions) {
                    if (progressBadge) progressBadge.classList.remove('completed');
                    if (guideMsg) {
                        guideMsg.style.display = 'flex';
                        guideMsg.innerHTML = `<span>🔒 모든 문제를 체크하면 채점 결과와 해설이 열립니다! (현재 <strong>${answeredCount}/${totalQuestions}</strong> 완료)</span>`;
                    }
                    if (scoreSummary) scoreSummary.style.display = 'none';
                    
                    questionBlocks.forEach(block => {
                        const tag = block.querySelector('.quiz-result-tag');
                        if (tag) tag.style.display = 'none';
                        const exp = block.querySelector('.quiz-explanation-box');
                        if (exp) exp.style.display = 'none';
                        
                        block.querySelectorAll('.quiz-option-label').forEach(lbl => {
                            lbl.classList.remove('ans-correct', 'ans-wrong');
                        });
                    });
                    return;
                }
                
                // ALL answered! Grade immediately!
                if (progressBadge) progressBadge.classList.add('completed');
                if (guideMsg) guideMsg.style.display = 'none';
                
                questionBlocks.forEach(block => {
                    const correctAns = block.getAttribute('data-correct');
                    const selected = block.querySelector('input[type="radio"]:checked');
                    const tag = block.querySelector('.quiz-result-tag');
                    const exp = block.querySelector('.quiz-explanation-box');
                    const labels = block.querySelectorAll('.quiz-option-label');
                    
                    labels.forEach(lbl => {
                        lbl.classList.remove('ans-correct', 'ans-wrong');
                        const radio = lbl.querySelector('input[type="radio"]');
                        if (radio && radio.value === correctAns) {
                            lbl.classList.add('ans-correct');
                        }
                    });
                    
                    if (selected && selected.value === correctAns) {
                        correctCount++;
                        if (tag) {
                            tag.className = 'quiz-result-tag correct';
                            tag.textContent = '✔ 정답';
                            tag.style.display = 'inline-block';
                        }
                    } else if (selected) {
                        const selectedLabel = selected.closest('.quiz-option-label');
                        if (selectedLabel) {
                            selectedLabel.classList.add('ans-wrong');
                        }
                        if (tag) {
                            tag.className = 'quiz-result-tag wrong';
                            tag.textContent = '✖ 오답';
                            tag.style.display = 'inline-block';
                        }
                    }
                    
                    if (exp) {
                        exp.style.display = 'block';
                    }
                });
                
                // Show score summary
                if (scoreSummary) {
                    const scoreNum = scoreSummary.querySelector('.quiz-score-number');
                    const scoreMsg = scoreSummary.querySelector('.quiz-score-msg');
                    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
                    
                    if (scoreNum) {
                        scoreNum.innerHTML = `<span>${correctCount}</span> / ${totalQuestions} <span style="font-size: 1.2rem; color: #64748b; font-weight: normal;">(${scorePercent}점)</span>`;
                    }
                    
                    if (scoreMsg) {
                        if (correctCount === totalQuestions) {
                            scoreSummary.classList.add('perfect');
                            scoreMsg.textContent = '🎉 완벽합니다! 100점 만점으로 모든 문제를 맞히셨습니다!';
                        } else if (correctCount >= 3) {
                            scoreSummary.classList.remove('perfect');
                            scoreMsg.textContent = '👏 훌륭해요! 틀린 문제는 아래 해설을 통해 개념을 보완해 보세요.';
                        } else {
                            scoreSummary.classList.remove('perfect');
                            scoreMsg.textContent = '💡 본문 내용을 다시 한번 훑어본 후 다시 풀기에 도전해 보세요!';
                        }
                    }
                    scoreSummary.style.display = 'block';
                }
            }
            
            // Radio button selection event
            questionBlocks.forEach(block => {
                const labels = block.querySelectorAll('.quiz-option-label');
                labels.forEach(label => {
                    const radio = label.querySelector('input[type="radio"]');
                    if (!radio) return;
                    
                    radio.addEventListener('change', () => {
                        labels.forEach(l => l.classList.remove('is-selected'));
                        if (radio.checked) {
                            label.classList.add('is-selected');
                        }
                        updateQuizState();
                    });
                });
            });
            
            // Reset button
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    questionBlocks.forEach(block => {
                        const radios = block.querySelectorAll('input[type="radio"]');
                        radios.forEach(r => { r.checked = false; });
                        const labels = block.querySelectorAll('.quiz-option-label');
                        labels.forEach(l => {
                            l.classList.remove('is-selected', 'ans-correct', 'ans-wrong');
                        });
                        const tag = block.querySelector('.quiz-result-tag');
                        if (tag) tag.style.display = 'none';
                        const exp = block.querySelector('.quiz-explanation-box');
                        if (exp) exp.style.display = 'none';
                    });
                    
                    if (progressBadge) {
                        progressBadge.classList.remove('completed');
                        const badgeText = progressBadge.querySelector('.status-text strong');
                        if (badgeText) badgeText.textContent = `0 / ${totalQuestions}`;
                    }
                    if (guideMsg) {
                        guideMsg.style.display = 'flex';
                        guideMsg.innerHTML = `<span>🔒 모든 문제를 체크하면 채점 결과와 해설이 열립니다! (현재 <strong>0/${totalQuestions}</strong> 완료)</span>`;
                    }
                    if (scoreSummary) scoreSummary.style.display = 'none';
                    
                    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        });
    }
    
    initQuizCards();
});
