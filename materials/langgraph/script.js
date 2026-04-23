// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation logic
  const tocItems = document.querySelectorAll('.toc-item');
  const sections = document.querySelectorAll('.chapter-section');
  
  function showSection(targetId) {
    // Hide all sections
    sections.forEach(sec => sec.classList.remove('active'));
    // Show target section
    const targetSection = document.getElementById(targetId);
    if(targetSection) {
      targetSection.classList.add('active');
    }
    
    // Update sidebar active state
    tocItems.forEach(item => {
      if(item.dataset.target === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Add click listeners to TOC items
  tocItems.forEach(item => {
    item.addEventListener('click', () => {
      showSection(item.dataset.target);
    });
  });

  // Next/Prev Buttons Logic
  const nextBtns = document.querySelectorAll('.btn-next');
  const prevBtns = document.querySelectorAll('.btn-prev');

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.target;
      showSection(targetId);
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.target;
      showSection(targetId);
    });
  });

  // Add Copy code feature
  const preElements = document.querySelectorAll('pre');
  preElements.forEach(pre => {
    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '📋 복사';
    
    pre.appendChild(copyBtn);

    copyBtn.addEventListener('click', () => {
      // Find the code element inside this pre
      const codeBlock = pre.querySelector('code');
      if (!codeBlock) return;
      
      const codeText = codeBlock.innerText;
      
      navigator.clipboard.writeText(codeText).then(() => {
        copyBtn.innerHTML = '✅ 복사 완료!';
        copyBtn.style.color = '#14b8a6';
        
        setTimeout(() => {
          copyBtn.innerHTML = '📋 복사';
          copyBtn.style.color = 'var(--text-muted)';
        }, 2000);
      }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        copyBtn.innerHTML = '❌ 오류';
      });
    });
  });
});
