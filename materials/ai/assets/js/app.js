/**
 * ==============================================================================
 * AI·코딩 장기 교육과정 공통 스크립트 (Common Application Script)
 * - 클립보드 복사 (Clipboard Copy) 및 접근성 지원 토스트 알림
 * - 체크리스트 상태 및 진행률 로컬 스토리지(Local Storage) 저장
 * - 회고(Retrospective) 자동 저장 및 마크다운/JSON 내보내기(Export)
 * - 과정 홈 진행률 및 완료 상태 동기화
 * ==============================================================================
 */

// 엄격 모드(Strict Mode) 활성화로 안전한 코드 실행 보장
'use strict';

/**
 * ------------------------------------------------------------------------------
 * 0. 학습 진도 통제 및 직접 접근 차단 가드 (Access & Route Guard)
 * ------------------------------------------------------------------------------
 * 선행 학습(1 학습)이 완료되지 않은 상태에서 2 학습 URL로 직접 접근하는 경우,
 * 서버 세션(Flask Session) 및 서버 저장 진도를 비동기로 검증하여 과정 홈으로 리다이렉트합니다.
 */
async function guardLessonAccess() {
  // 현재 페이지 URL 경로를 바탕으로 2 학습 여부 판별
  const pathName = window.location.pathname;
  const isLessonTwoPage = pathName.includes('02-better-prompts');

  if (isLessonTwoPage) {
    try {
      const response = await fetch('/api/ai/progress', {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });

      if (response.status === 401) {
        // 인증되지 않은(미로그인) 사용자인 경우 로그인 페이지로 이동
        window.location.replace('/auth.html');
        return;
      }

      if (!response.ok) {
        sessionStorage.setItem('ai_locked_notice', '1 학습을 완료하면 열립니다.');
        window.location.replace('../../index.html?locked=02');
        return;
      }

      const progressData = await response.json();
      // 관리자가 아니고 2 학습 접근 권한이 없는 경우(1 학습 미완료) 과정 홈으로 이동
      if (!progressData.lesson_02_accessible) {
        sessionStorage.setItem('ai_locked_notice', '1 학습을 완료하면 열립니다.');
        window.location.replace('../../index.html?locked=02');
      }
    } catch (error) {
      console.error('2 학습 접근 권한 서버 검증 실패:', error);
      sessionStorage.setItem('ai_locked_notice', '1 학습을 완료하면 열립니다.');
      window.location.replace('../../index.html?locked=02');
    }
  }
}

// 스크립트 파싱 즉시 비동기 가드 실행
guardLessonAccess();

/**
 * ------------------------------------------------------------------------------
 * 1. 토스트 알림 관리 모듈 (Toast Notification Manager)
 * ------------------------------------------------------------------------------
 * 스크린 리더(Screen Reader) 접근성을 고려하여 aria-live 영역에 알림을 띄웁니다.
 */
const ToastManager = {
  /**
   * 토스트 메시지를 화면 및 스크린 리더에 표시합니다.
   * @param {string} message - 표시할 알림 문구
   * @param {number} duration - 표시 지속 시간 (밀리초, 기본값 2500ms)
   */
  show(message, duration = 2500) {
    let container = document.getElementById('toast-container');
    
    // 토스트 컨테이너가 없으면 동적으로 생성하여 body에 추가
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('role', 'status');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    // 다음 렌더링 프레임에서 show 클래스를 추가하여 애니메이션 트리거
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 지정된 시간이 지나면 페이드아웃 후 DOM에서 제거
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, duration);
  }
};

/**
 * ------------------------------------------------------------------------------
 * 2. 클립보드 복사 모듈 (Clipboard Copy Module)
 * ------------------------------------------------------------------------------
 * data-copy-target 속성을 가진 버튼을 찾아 대상 요소의 텍스트를 복사합니다.
 */
const CopyManager = {
  init() {
    const copyButtons = document.querySelectorAll('[data-copy-target]');

    copyButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const targetSelector = button.getAttribute('data-copy-target');
        const targetElement = document.querySelector(targetSelector);

        if (!targetElement) {
          console.warn('복사 대상 요소를 찾을 수 없습니다:', targetSelector);
          return;
        }

        // 대상 요소의 텍스트 내용 추출 (인라인 태그 등 포함 텍스트)
        const textToCopy = targetElement.innerText || targetElement.textContent;

        try {
          // 최신 브라우저의 클립보드 API(Clipboard API) 사용
          await navigator.clipboard.writeText(textToCopy.trim());

          // 버튼 시각적 피드백 제공
          const originalText = button.innerHTML;
          button.classList.add('copied');
          button.innerHTML = '<span>복사 완료!</span>';
          ToastManager.show('프롬프트가 클립보드에 복사되었습니다.');

          // 2초 후 원래 버튼 상태로 복원
          setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalText;
          }, 2000);
        } catch (error) {
          console.error('클립보드 복사 실패:', error);
          // 구형 브라우저 대체 복사 방식(Fallback)
          CopyManager.fallbackCopy(textToCopy.trim());
          ToastManager.show('텍스트가 복사되었습니다.');
        }
      });
    });
  },

  /**
   * Clipboard API 미지원 환경을 위한 대체 복사 함수
   */
  fallbackCopy(text) {
    const temporaryTextArea = document.createElement('textarea');
    temporaryTextArea.value = text;
    temporaryTextArea.style.position = 'fixed';
    temporaryTextArea.style.top = '-9999px';
    document.body.appendChild(temporaryTextArea);
    temporaryTextArea.focus();
    temporaryTextArea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.error('대체 복사 실패:', e);
    }
    document.body.removeChild(temporaryTextArea);
  }
};

/**
 * ------------------------------------------------------------------------------
 * 3. 단계별 비교 실험 기록 관리 모듈 (Experiment Manager)
 * ------------------------------------------------------------------------------
 * 학생이 단계별 비교 실험에서 입력한 관찰 기록을 로컬 스토리지에 자동 저장하고 복원합니다.
 */
const ExperimentManager = {
  init(lessonId) {
    if (!lessonId) return;

    const form = document.getElementById('experiment-form');
    if (!form) return;

    const storageKey = `ai_curriculum_experiment_${lessonId}`;
    const statusMsg = document.getElementById('exp-save-status');
    const fields = form.querySelectorAll('textarea, input[type="text"]');

    // 1. 기존에 저장된 실험 기록 불러오기
    const savedDataRaw = localStorage.getItem(storageKey);
    if (savedDataRaw) {
      try {
        const savedData = JSON.parse(savedDataRaw);
        fields.forEach((field) => {
          if (savedData[field.name]) {
            field.value = savedData[field.name];
          }
        });
      } catch (e) {
        console.error('실험 기록 복원 오류:', e);
      }
    }

    // 2. 입력 시 디바운스(Debounce) 자동 저장
    let debounceTimer;
    fields.forEach((field) => {
      field.addEventListener('input', () => {
        if (statusMsg) statusMsg.textContent = '저장 중...';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          ExperimentManager.saveData(fields, storageKey, statusMsg);
        }, 600);
      });
    });

    // 3. 수동 저장 버튼 이벤트 리스너
    const saveBtn = document.getElementById('btn-save-exp');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ExperimentManager.saveData(fields, storageKey, statusMsg);
        ToastManager.show('실험 관찰 기록이 안전하게 저장되었습니다.');
      });
    }
  },

  /**
   * 실험 관찰 필드의 데이터를 수집하여 로컬 스토리지에 저장합니다.
   */
  saveData(fields, storageKey, statusMsgElement) {
    const data = {
      updatedAt: new Date().toISOString()
    };

    fields.forEach((field) => {
      data[field.name] = field.value;
    });

    localStorage.setItem(storageKey, JSON.stringify(data));

    if (statusMsgElement) {
      statusMsgElement.textContent = '자동 저장 완료';
      setTimeout(() => {
        statusMsgElement.textContent = '';
      }, 2000);
    }
  }
};

/**
 * ------------------------------------------------------------------------------
 * 4. 체크리스트 및 진행률 모듈 (Checklist & Progress Module)
 * ------------------------------------------------------------------------------
 * 비보안 체크리스트 UI 상태(체크박스 체크 여부)는 브라우저 로컬 저장소(localStorage)에
 * 로컬 전용으로 유지되며, 최종 완료 여부 및 라우트 접근 권한 판정은
 * 서버 세션(/api/ai/progress) 결과만을 신뢰합니다.
 */
const ChecklistManager = {
  async init(lessonId) {
    if (!lessonId) return;

    const checklistContainer = document.querySelector('[data-checklist-lesson]');
    if (!checklistContainer) return;

    const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-percentage');

    let savedState = {};
    let isLessonCompletedOnServer = false;

    // 1. 서버 세션 기반으로 최신 완료 상태 조회 (/api/ai/progress)
    try {
      const response = await fetch('/api/ai/progress', {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      if (response.ok) {
        const progressData = await response.json();
        if (lessonId === 'lesson_01') {
          isLessonCompletedOnServer = Boolean(progressData.lesson_01_completed);
        } else if (lessonId === 'lesson_02') {
          isLessonCompletedOnServer = Boolean(progressData.lesson_02_completed);
        }
      }
    } catch (e) {
      console.warn('서버 진도 조회 실패:', e);
    }

    // 2. 비보안 체크리스트 UI 상태는 로컬스토리지에서 복원
    const localStateRaw = localStorage.getItem(`ai_curriculum_checklist_${lessonId}`);
    if (localStateRaw) {
      try {
        savedState = JSON.parse(localStateRaw);
      } catch (_) {}
    }

    // 3. 초기 체크박스 상태 복원
    checkboxes.forEach((checkbox) => {
      const itemId = checkbox.id;
      if (savedState[itemId]) {
        checkbox.checked = true;
        const parentLabel = checkbox.closest('.checklist-item');
        if (parentLabel) parentLabel.classList.add('checked');
      }

      // 4. 체크박스 변경 이벤트 리스너 등록
      checkbox.addEventListener('change', () => {
        const parentLabel = checkbox.closest('.checklist-item');
        if (checkbox.checked) {
          if (parentLabel) parentLabel.classList.add('checked');
        } else {
          if (parentLabel) parentLabel.classList.remove('checked');
        }

        // 현재 모든 체크박스 상태 수집 및 로컬스토리지 저장 (UI 상태 보존 목적)
        const currentState = {};
        checkboxes.forEach((cb) => {
          currentState[cb.id] = cb.checked;
        });
        localStorage.setItem(`ai_curriculum_checklist_${lessonId}`, JSON.stringify(currentState));

        // 진행률 업데이트
        ChecklistManager.updateProgress(checkboxes, progressBarFill, progressText, lessonId, isLessonCompletedOnServer);
      });
    });

    // 5. 초기 진행률 렌더링
    ChecklistManager.updateProgress(checkboxes, progressBarFill, progressText, lessonId, isLessonCompletedOnServer);

    // 6. 1 학습(lesson_01) 전용 명시적 완료 확인 모듈 초기화
    if (lessonId === 'lesson_01') {
      LessonCompletionManager.init(lessonId, checkboxes, isLessonCompletedOnServer);
    }
  },

  /**
   * 체크리스트 진행률을 계산하고 UI 및 완료 상태를 갱신합니다.
   */
  updateProgress(checkboxes, barFillElement, textElement, lessonId, isLessonCompletedOnServer = false) {
    if (!checkboxes.length) return;

    let checkedCount = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) checkedCount++;
    });

    const totalCount = checkboxes.length;
    const percentage = Math.round((checkedCount / totalCount) * 100);

    if (barFillElement) {
      barFillElement.style.width = `${percentage}%`;
    }

    if (textElement) {
      textElement.textContent = `${percentage}% (${checkedCount}/${totalCount})`;
    }

    // 1 학습(lesson_01)의 경우 버튼 상태 갱신
    if (lessonId === 'lesson_01') {
      LessonCompletionManager.updateButtonState(checkboxes, isLessonCompletedOnServer);
    }
  }
};

/**
 * ------------------------------------------------------------------------------
 * 4-1. 1 학습 완료 명시적 확인 모듈 (Lesson 1 Completion Confirmation Module)
 * ------------------------------------------------------------------------------
 * 체크리스트가 완료된 상태에서 학생이 '1 학습 완료' 버튼을 클릭하면
 * 서버 API(/api/ai/complete-lesson)를 자격증명 포함 동일 출처(credentials: same-origin)로 호출하여
 * 서버 SQLite 데이터베이스에 완료를 영구 확정합니다.
 * 교사 승인 의존성 없이 학생 주도 확인과 서버 권한 검증으로 동작하며, 장식성 이모지를 사용하지 않습니다.
 */
const LessonCompletionManager = {
  isCompletedOnServer: false,

  init(lessonId, checkboxes, initialCompletedState = false) {
    LessonCompletionManager.isCompletedOnServer = initialCompletedState;
    const confirmButton = document.getElementById('btn-confirm-completion');
    if (!confirmButton) return;

    // '1 학습 완료' 버튼 클릭 이벤트 리스너 등록
    confirmButton.addEventListener('click', async () => {
      let isAllChecked = true;
      checkboxes.forEach((cb) => {
        if (!cb.checked) isAllChecked = false;
      });

      // 체크리스트가 전부 체크되어 있지 않은 경우 예외 방어
      if (!isAllChecked) {
        ToastManager.show('모든 체크리스트 항목을 먼저 완료해 주세요.');
        return;
      }

      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
      confirmButton.textContent = '완료 처리 중...';

      try {
        const response = await fetch('/api/ai/complete-lesson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify({ lesson_id: lessonId })
        });

        if (response.ok) {
          LessonCompletionManager.isCompletedOnServer = true;
          LessonCompletionManager.renderConfirmedState();
          ToastManager.show('1 학습을 완료했습니다. 2 학습이 열렸습니다.');
        } else if (response.status === 401) {
          ToastManager.show('인증이 필요합니다. 로그인 화면으로 이동합니다.');
          setTimeout(() => {
            window.location.href = '/auth.html';
          }, 1500);
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.detail || '1 학습 완료 처리에 실패했습니다.';
          ToastManager.show(errMsg);
          LessonCompletionManager.updateButtonState(checkboxes, LessonCompletionManager.isCompletedOnServer);
        }
      } catch (err) {
        console.error('완료 처리 요청 오류:', err);
        ToastManager.show('서버 통신 오류가 발생했습니다. 다시 시도해 주세요.');
        LessonCompletionManager.updateButtonState(checkboxes, LessonCompletionManager.isCompletedOnServer);
      }
    });

    // 초기 버튼 및 내비게이션 상태 동기화
    LessonCompletionManager.updateButtonState(checkboxes, initialCompletedState);
  },

  /**
   * 체크리스트 진행 상태에 따라 '1 학습 완료' 버튼 및 하단 내비게이션 잠금/해제를 동기화합니다.
   */
  updateButtonState(checkboxes, isCompleted = false) {
    const confirmButton = document.getElementById('btn-confirm-completion');
    const guidanceText = document.getElementById('completion-guidance');
    const statusMsg = document.getElementById('completion-status-msg');
    const nextLockedButton = document.getElementById('btn-nav-next-locked');
    const nextOpenLink = document.getElementById('link-nav-next-open');

    if (!confirmButton) return;

    let checkedCount = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) checkedCount++;
    });
    const isAllChecked = (checkedCount === checkboxes.length && checkboxes.length > 0);

    if (isCompleted || LessonCompletionManager.isCompletedOnServer) {
      // 1) 서버 상에서 이미 완료 확정된 상태
      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
      confirmButton.textContent = '1 학습 완료됨';
      confirmButton.classList.remove('btn-primary');
      confirmButton.classList.add('btn-success');

      if (guidanceText) {
        guidanceText.textContent = '1 학습이 완료되었습니다. 2 학습을 시작할 수 있습니다.';
      }
      if (statusMsg) {
        statusMsg.textContent = '학습 완료 확인됨';
      }

      // 하단 내비게이션 2 학습 링크 활성화
      if (nextLockedButton) nextLockedButton.style.display = 'none';
      if (nextOpenLink) nextOpenLink.style.display = 'inline-block';
    } else if (isAllChecked) {
      // 2) 모든 체크리스트 완료됨, 학생의 '1 학습 완료' 클릭 대기
      confirmButton.disabled = false;
      confirmButton.removeAttribute('aria-disabled');
      confirmButton.textContent = '1 학습 완료';
      confirmButton.classList.remove('btn-success');
      confirmButton.classList.add('btn-primary');

      if (guidanceText) {
        guidanceText.textContent = '모든 체크리스트 항목이 완료되었습니다. 아래 버튼을 눌러 1 학습을 완료하세요.';
      }
      if (statusMsg) {
        statusMsg.textContent = '';
      }

      // 하단 내비게이션은 학생 확인 전까지 여전히 잠김 상태 유지
      if (nextLockedButton) nextLockedButton.style.display = 'inline-block';
      if (nextOpenLink) nextOpenLink.style.display = 'none';
    } else {
      // 3) 체크리스트 미완료 상태
      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
      confirmButton.textContent = '1 학습 완료';
      confirmButton.classList.remove('btn-success');
      confirmButton.classList.add('btn-primary');

      if (guidanceText) {
        guidanceText.textContent = '모든 체크리스트 항목을 완료하면 1 학습 완료 버튼이 활성화됩니다.';
      }
      if (statusMsg) {
        statusMsg.textContent = '';
      }

      // 하단 내비게이션 잠김 상태 유지
      if (nextLockedButton) nextLockedButton.style.display = 'inline-block';
      if (nextOpenLink) nextOpenLink.style.display = 'none';
    }
  },

  /**
   * 학생이 '1 학습 완료' 확인 버튼을 눌렀을 때 즉시 화면 UI를 완료 상태로 갱신합니다.
   */
  renderConfirmedState() {
    const confirmButton = document.getElementById('btn-confirm-completion');
    const guidanceText = document.getElementById('completion-guidance');
    const statusMsg = document.getElementById('completion-status-msg');
    const nextLockedButton = document.getElementById('btn-nav-next-locked');
    const nextOpenLink = document.getElementById('link-nav-next-open');

    if (confirmButton) {
      confirmButton.textContent = '1 학습 완료됨';
      confirmButton.classList.remove('btn-primary');
      confirmButton.classList.add('btn-success');
      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
    }
    if (guidanceText) {
      guidanceText.textContent = '1 학습이 완료되었습니다. 2 학습을 시작할 수 있습니다.';
    }
    if (statusMsg) {
      statusMsg.textContent = '학습 완료 확인됨';
    }
    if (nextLockedButton) nextLockedButton.style.display = 'none';
    if (nextOpenLink) nextOpenLink.style.display = 'inline-block';
  }
};


/**
 * ------------------------------------------------------------------------------
 * 5. 회고(Retrospective) 폼 관리 및 내보내기 모듈 (Retrospective Manager)
 * ------------------------------------------------------------------------------
 * 입력한 회고 내용을 로컬스토리지에 자동 저장하고, 마크다운/JSON 파일로 다운로드합니다.
 */
const RetrospectiveManager = {
  init(lessonId, lessonTitle) {
    if (!lessonId) return;

    const form = document.getElementById('retrospective-form');
    if (!form) return;

    const storageKey = `ai_curriculum_retro_${lessonId}`;
    const statusMsg = document.getElementById('retro-save-status');
    const fields = form.querySelectorAll('textarea, input[type="text"]');

    // 1. 기존에 저장된 회고 내용 불러오기
    const savedDataRaw = localStorage.getItem(storageKey);
    if (savedDataRaw) {
      try {
        const savedData = JSON.parse(savedDataRaw);
        fields.forEach((field) => {
          if (savedData[field.name]) {
            field.value = savedData[field.name];
          }
        });
      } catch (e) {
        console.error('회고 데이터 복원 오류:', e);
      }
    }

    // 2. 입력 시 디바운스(Debounce) 자동 저장
    let debounceTimer;
    fields.forEach((field) => {
      field.addEventListener('input', () => {
        if (statusMsg) statusMsg.textContent = '저장 중...';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          RetrospectiveManager.saveData(fields, storageKey, statusMsg);
        }, 600);
      });
    });

    // 3. 수동 저장 버튼
    const saveBtn = document.getElementById('btn-save-retro');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        RetrospectiveManager.saveData(fields, storageKey, statusMsg);
        ToastManager.show('회고가 브라우저에 안전하게 저장되었습니다.');
      });
    }

    // 4. 마크다운(.md) 파일로 내보내기 버튼
    const exportMdBtn = document.getElementById('btn-export-retro-md');
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', (e) => {
        e.preventDefault();
        RetrospectiveManager.exportMarkdown(fields, lessonId, lessonTitle);
      });
    }

    // 5. JSON(.json) 파일로 내보내기 버튼
    const exportJsonBtn = document.getElementById('btn-export-retro-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', (e) => {
        e.preventDefault();
        RetrospectiveManager.exportJson(fields, lessonId, lessonTitle);
      });
    }
  },

  /**
   * 폼 필드의 데이터를 수집하여 로컬스토리지에 저장합니다.
   */
  saveData(fields, storageKey, statusMsgElement) {
    const data = {
      updatedAt: new Date().toISOString()
    };

    fields.forEach((field) => {
      data[field.name] = field.value;
    });

    localStorage.setItem(storageKey, JSON.stringify(data));

    if (statusMsgElement) {
      statusMsgElement.textContent = '자동 저장 완료';
      setTimeout(() => {
        statusMsgElement.textContent = '';
      }, 2000);
    }
  },

  /**
   * 회고 데이터를 마크다운 파일로 다운로드합니다.
   */
  exportMarkdown(fields, lessonId, lessonTitle) {
    const data = {};
    fields.forEach((field) => {
      data[field.name] = field.value || '(작성 내용 없음)';
    });

    const now = new Date().toLocaleString('ko-KR');

    const markdownContent = `# ${lessonTitle || lessonId} - 학습 회고록

- **작성 일시**: ${now}
- **학습 단위**: ${lessonId}

---

## 1. 오늘 새롭게 배운 점이나 흥미로웠던 개념
${data['q1_learned'] || '(내용 없음)'}

## 2. 실습 중 마주친 오류나 막혔던 점과 해결한 방법
${data['q2_blocked'] || '(내용 없음)'}

## 3. AI가 제안한 답변 중 비판적으로 거절하거나 수정한 내용
${data['q3_ai_rejected'] || '(내용 없음)'}

## 4. 다음 수업이나 일상에서 시도해보고 싶은 점
${data['q4_next_step'] || '(내용 없음)'}

---
*본 문서는 AI·코딩 장기 교육과정 온라인 교재에서 생성되었습니다.*
`;

    RetrospectiveManager.downloadFile(markdownContent, `${lessonId}-retrospective.md`, 'text/markdown;charset=utf-8;');
    ToastManager.show('마크다운 회고 파일이 다운로드되었습니다.');
  },

  /**
   * 회고 데이터를 JSON 파일로 다운로드합니다.
   */
  exportJson(fields, lessonId, lessonTitle) {
    const exportObject = {
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      exportedAt: new Date().toISOString(),
      answers: {}
    };

    fields.forEach((field) => {
      exportObject.answers[field.name] = field.value || '';
    });

    const jsonContent = JSON.stringify(exportObject, null, 2);
    RetrospectiveManager.downloadFile(jsonContent, `${lessonId}-retrospective.json`, 'application/json;charset=utf-8;');
    ToastManager.show('JSON 회고 데이터가 다운로드되었습니다.');
  },

  /**
   * 가상 <a> 태그를 생성하여 Blob 다운로드를 수행합니다.
   */
  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = fileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }
};

/**
 * ------------------------------------------------------------------------------
 * 6. 과정 홈 페이지 상태 동기화 모듈 (Course Home Module)
 * ------------------------------------------------------------------------------
 * 과정 홈(index.html)에서 서버 API(/api/ai/progress)를 자격증명 포함 동일 출처(credentials: same-origin)로 호출하여
 * 서버에 저장된 진도 및 세션 권한을 기반으로 뱃지, 진행률 바, 2 학습 카드를 동기화합니다.
 * 로컬스토리지(localStorage)의 역할(role)이나 완료 상태를 일절 신뢰하지 않습니다.
 */
const CourseHomeManager = {
  async init() {
    const totalLessons = 24;
    let completedLessonsCount = 0;
    let isLessonOneDone = false;
    let isLessonTwoDone = false;
    let isLessonTwoAccessible = false;

    // 1. 직접 접근 차단 리다이렉트로 인한 온페이지 잠김 안내문 확인 및 표시
    CourseHomeManager.checkLockedNotice();

    // 2. 서버에서 인증 상태 및 AI 진도 데이터 조회
    try {
      const response = await fetch('/api/ai/progress', {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        isLessonOneDone = Boolean(data.lesson_01_completed);
        isLessonTwoDone = Boolean(data.lesson_02_completed);
        isLessonTwoAccessible = Boolean(data.lesson_02_accessible);

        if (isLessonOneDone) completedLessonsCount++;
        if (isLessonTwoDone) completedLessonsCount++;
      } else {
        // 미인증(401) 또는 서버 에러 시 기본 잠김 상태 유지
        isLessonOneDone = false;
        isLessonTwoDone = false;
        isLessonTwoAccessible = false;
      }
    } catch (e) {
      console.warn('과정 홈 서버 진도 조회 실패:', e);
      isLessonOneDone = false;
      isLessonTwoDone = false;
      isLessonTwoAccessible = false;
    }

    // 3. 1 학습 뱃지 갱신
    const badgeLessonOne = document.getElementById('badge-lesson-01');
    if (badgeLessonOne) {
      if (isLessonOneDone) {
        badgeLessonOne.className = 'badge badge-success';
        badgeLessonOne.textContent = '완료됨';
      } else {
        badgeLessonOne.className = 'badge badge-primary';
        badgeLessonOne.textContent = '학습 가능';
      }
    }

    // 4. 홈 화면 상단 진행률 바 갱신 (라벨 1/2 기준)
    const homeProgressBar = document.getElementById('home-progress-bar');
    const homeProgressText = document.getElementById('home-progress-text');

    if (homeProgressBar && homeProgressText) {
      const percentage = Math.round((completedLessonsCount / totalLessons) * 100);
      homeProgressBar.style.width = `${percentage}%`;
      homeProgressText.textContent = `${completedLessonsCount} / ${totalLessons} 완료 (${percentage}%)`;
    }

    // 5. 2 학습 잠금 및 해제 상태 서버 권한 기반 동기화
    CourseHomeManager.syncLessonTwoState(isLessonTwoAccessible, isLessonTwoDone);
  },

  /**
   * 2 학습 진입이 잠겨 있어 리다이렉트된 경우 간결한 온페이지 안내 배너를 표시합니다.
   */
  checkLockedNotice() {
    const urlParams = new URLSearchParams(window.location.search);
    const lockedParam = urlParams.get('locked');
    const sessionNotice = sessionStorage.getItem('ai_locked_notice');

    const noticeBanner = document.getElementById('locked-notice-banner');
    const noticeText = document.getElementById('locked-notice-text');

    if (lockedParam === '02' || sessionNotice) {
      if (noticeBanner) {
        if (noticeText) {
          noticeText.textContent = '1 학습을 완료하면 열립니다. 1 학습을 먼저 완료해 주세요.';
        }
        noticeBanner.style.display = 'block';
        noticeBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // 세션에 임시 저장된 안내 플래그 제거
      sessionStorage.removeItem('ai_locked_notice');
    }
  },

  /**
   * 서버 권한(isAccessible) 및 완료 여부에 따라 2 학습 카드를 잠금 또는 클릭 가능한 상태로 전환합니다.
   */
  syncLessonTwoState(isAccessible, isCompleted) {
    const cardLessonTwo = document.getElementById('card-lesson-02');
    const badgeLessonTwo = document.getElementById('badge-lesson-02');
    const actionLessonTwo = document.getElementById('action-lesson-02');

    if (!cardLessonTwo || !actionLessonTwo) return;

    if (isAccessible) {
      // 관리자이거나 1 학습이 완료되어 2 학습 접근 허용됨
      cardLessonTwo.classList.remove('disabled');
      cardLessonTwo.removeAttribute('aria-disabled');

      if (badgeLessonTwo) {
        if (isCompleted) {
          badgeLessonTwo.className = 'badge badge-success';
          badgeLessonTwo.textContent = '완료됨';
        } else {
          badgeLessonTwo.className = 'badge badge-primary';
          badgeLessonTwo.textContent = '학습 가능';
        }
      }

      actionLessonTwo.innerHTML = '<a href="./lessons/02-better-prompts/index.html" class="btn btn-primary btn-sm lesson-link">2 학습 시작하기 →</a>';
    } else {
      // 1 학습 미완료 또는 미인증 상태로 2 학습 잠김 유지
      cardLessonTwo.classList.add('disabled');
      cardLessonTwo.setAttribute('aria-disabled', 'true');

      if (badgeLessonTwo) {
        badgeLessonTwo.className = 'badge badge-muted';
        badgeLessonTwo.textContent = '잠김';
      }

      actionLessonTwo.innerHTML = '<button type="button" class="btn btn-secondary btn-sm" disabled aria-disabled="true">1 학습을 완료하면 열립니다.</button>';
    }
  }
};

/**
 * ------------------------------------------------------------------------------
 * DOM 콘텐츠 로드 완료 시 전역 초기화 실행
 * ------------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM 로드 시점에도 재차 2 학습 접근 제어 확인
  guardLessonAccess();

  // 클립보드 복사 초기화
  CopyManager.init();

  // 과정 홈인 경우 로드맵 상태 동기화
  if (document.body.classList.contains('page-course-home')) {
    CourseHomeManager.init();
  }

  // 학습별 페이지인 경우 data 속성 기반으로 비교 실험, 체크리스트 및 회고 초기화
  const lessonBody = document.querySelector('[data-lesson-id]');
  if (lessonBody) {
    const lessonId = lessonBody.getAttribute('data-lesson-id');
    const lessonTitle = lessonBody.getAttribute('data-lesson-title') || lessonId;
    ExperimentManager.init(lessonId);
    ChecklistManager.init(lessonId);
    RetrospectiveManager.init(lessonId, lessonTitle);
  }
});
