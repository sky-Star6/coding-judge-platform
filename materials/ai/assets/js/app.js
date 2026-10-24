/**
 * ==============================================================================
 * AI·코딩 장기 교육과정 공통 스크립트 (Common Application Script)
 * - 클립보드 복사 (Clipboard Copy) 및 접근성 지원 토스트 알림
 * - 체크리스트 상태 및 진행률 로컬 스토리지(Local Storage) 저장
 * - 회고(Retrospective) 자동 저장 및 마크다운/JSON 내보내기(Export)
 * - 과정 홈 진행률 및 1~24강 순차적 잠금/해제(Sequential Locking & Unlock) 동기화
 * - 선행 학습 미완료 시 하위 강의 직접 접근 차단 가드(Route Guard)
 * ==============================================================================
 */

// 엄격 모드(Strict Mode) 활성화로 안전한 코드 실행 보장
'use strict';

/**
 * ------------------------------------------------------------------------------
 * 강의 메타데이터 정의 (Lesson Metadata Map)
 * ------------------------------------------------------------------------------
 * 각 강의별 폴더명, 강의 번호(1~24), 강의 제목을 매핑하여
 * 직접 접근 가드 및 홈 화면 카드 동기화에 공통 활용합니다.
 */
const LESSON_METADATA = {
  1: { id: 'lesson_01', folder: '01-ai-literacy', title: '1강: AI는 거짓말쟁이? AI 원리와 팩트체크 배틀' },
  2: { id: 'lesson_02', folder: '02-better-prompts', title: '2강: 나만의 판타지 캐릭터와 세계관 프롬프트' },
  3: { id: 'lesson_03', folder: '03-story-branch', title: '3강: 갈림길의 모험: 스토리 분기와 선택지 설계' },
  4: { id: 'lesson_04', folder: '04-balance-patch', title: '4강: AI와 함께하는 밸런스 패치: 스토리 검증' },
  5: { id: 'lesson_05', folder: '05-html-dialogue', title: '5강: 게임 화면의 뼈대 세우기: HTML 대사창' },
  6: { id: 'lesson_06', folder: '06-css-showcase', title: '6강: 판타지 감성 입히기: CSS & 시즌 1 완성 쇼케이스' },
  7: { id: 'lesson_07', folder: '07-javascript-intro', title: '7강: JavaScript로 반응하는 게임 화면' }
};

/**
 * 현재 페이지의 URL 경로 또는 data 속성으로부터 강의 번호(숫자)를 추출합니다.
 * @returns {number|null} 강의 번호(1~24) 또는 강의 페이지가 아니면 null
 */
function getCurrentLessonNumber() {
  // 1. body 태그의 data-lesson-id 확인 (예: lesson_02, lesson-02)
  const lessonBody = document.querySelector('[data-lesson-id]');
  if (lessonBody) {
    const rawId = lessonBody.getAttribute('data-lesson-id');
    const matched = rawId.match(/(\d+)/);
    if (matched) {
      return parseInt(matched[1], 10);
    }
  }

  // 2. URL 경로 확인 (예: /lessons/02-better-prompts/index.html)
  const pathName = window.location.pathname;
  const urlMatch = pathName.match(/\/lessons\/(\d{2})-[^\/]+/);
  if (urlMatch) {
    return parseInt(urlMatch[1], 10);
  }

  return null;
}

/**
 * ------------------------------------------------------------------------------
 * 0. 학습 진도 통제 및 직접 접근 차단 가드 (Sequential Route Guard)
 * ------------------------------------------------------------------------------
 * 1강은 누구에게나 항상 열려 있습니다.
 * 2강부터 24강까지는 선행 학습(N-1강)이 완료되지 않은 상태에서
 * URL로 직접 접근하는 경우, 서버 세션 및 완료 여부를 비동기로 검증하여
 * 온페이지 안내 배너와 함께 과정 홈(index.html?locked=XX)으로 즉시 리다이렉트합니다.
 */
async function guardLessonAccess() {
  const currentNum = getCurrentLessonNumber();
  // 강의 페이지가 아니거나 1강(항상 오픈)인 경우 가드를 통과합니다.
  if (!currentNum || currentNum <= 1) {
    return;
  }

  const prevNum = currentNum - 1;
  const currentKey = currentNum < 10 ? `lesson_0${currentNum}` : `lesson_${currentNum}`;
  const prevKey = prevNum < 10 ? `lesson_0${prevNum}` : `lesson_${prevNum}`;
  const lockedParam = currentNum < 10 ? `0${currentNum}` : `${currentNum}`;
  const noticeMessage = `${prevNum}강을 완료하면 열립니다. ${prevNum}강을 먼저 완료해 주세요.`;

  try {
    const response = await fetch('/api/ai/progress', {
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    });

    if (response.status === 401) {
      // 비로그인 상태일 때 로컬스토리지 백업 확인
      const localPrevCompleted = localStorage.getItem(`ai_${prevKey}_completed`) === 'true';
      if (!localPrevCompleted) {
        sessionStorage.setItem('ai_locked_notice', noticeMessage);
        window.location.replace(`../../index.html?locked=${lockedParam}`);
      }
      return;
    }

    if (!response.ok) {
      // 서버 에러 시 로컬스토리지 보조 검증
      const localPrevCompleted = localStorage.getItem(`ai_${prevKey}_completed`) === 'true';
      if (!localPrevCompleted) {
        sessionStorage.setItem('ai_locked_notice', noticeMessage);
        window.location.replace(`../../index.html?locked=${lockedParam}`);
      }
      return;
    }

    const progressData = await response.json();
    const isAccessible = Boolean(progressData[`${currentKey}_accessible`]);

    // 서버 권한 검증: 관리자이거나 직전 강의가 완료되었는지 확인
    if (!isAccessible) {
      // 로컬스토리지 보조 확인 (오프라인/클라이언트 캐시 보완)
      const localPrevCompleted = localStorage.getItem(`ai_${prevKey}_completed`) === 'true';
      if (!localPrevCompleted) {
        sessionStorage.setItem('ai_locked_notice', noticeMessage);
        window.location.replace(`../../index.html?locked=${lockedParam}`);
      }
    }
  } catch (error) {
    console.warn(`[Guard] ${currentNum}강 접근 권한 검증 중 오류, 로컬 캐시 확인:`, error);
    const localPrevCompleted = localStorage.getItem(`ai_${prevKey}_completed`) === 'true';
    if (!localPrevCompleted) {
      sessionStorage.setItem('ai_locked_notice', noticeMessage);
      window.location.replace(`../../index.html?locked=${lockedParam}`);
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
  show(message, duration = 2500) {
    let container = document.getElementById('toast-container');

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

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

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

        const textToCopy = targetElement.innerText || targetElement.textContent;

        try {
          await navigator.clipboard.writeText(textToCopy.trim());

          const originalText = button.innerHTML;
          button.classList.add('copied');
          button.innerHTML = '<span>복사 완료!</span>';
          ToastManager.show('프롬프트가 클립보드에 복사되었습니다.');

          setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalText;
          }, 2000);
        } catch (error) {
          console.error('클립보드 복사 실패:', error);
          CopyManager.fallbackCopy(textToCopy.trim());
          ToastManager.show('텍스트가 복사되었습니다.');
        }
      });
    });
  },

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

    const normalizedId = lessonId.replace('-', '_');
    const storageKey = `ai_curriculum_experiment_${normalizedId}`;
    const statusMsg = document.getElementById('exp-save-status');
    const fields = form.querySelectorAll('textarea, input[type="text"]');

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

    const saveBtn = document.getElementById('btn-save-exp');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ExperimentManager.saveData(fields, storageKey, statusMsg);
        ToastManager.show('실험 관찰 기록이 안전하게 저장되었습니다.');
      });
    }
  },

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
 * 비보안 체크리스트 UI 상태(체크박스 체크 여부)는 브라우저 로컬 저장소에 저장되고,
 * 최종 완료 여부 및 권한 판정은 서버 세션(/api/ai/progress)을 통해 영구 확정됩니다.
 */
const ChecklistManager = {
  async init(lessonId) {
    if (!lessonId) return;

    const normalizedId = lessonId.replace('-', '_');
    // 해당 강의 전용 체크리스트 컨테이너 우선 탐색 및 체크박스 보유 여부 검증
    let checklistContainer = document.querySelector(`[data-checklist-lesson="${normalizedId}"]`) 
      || document.querySelector('[data-checklist-lesson]') 
      || document.getElementById('checklist')
      || document.querySelector('.checklist-container');

    if (!checklistContainer || !checklistContainer.querySelector('input[type="checkbox"]')) {
      const potentialContainers = document.querySelectorAll('.checklist-container, .checklist, .checklist-items');
      for (const container of potentialContainers) {
        if (container.querySelector('input[type="checkbox"]')) {
          checklistContainer = container;
          break;
        }
      }
    }
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
        isLessonCompletedOnServer = Boolean(progressData[`${normalizedId}_completed`]);
      } else {
        // 서버 비인가 시 로컬스토리지 백업 확인
        isLessonCompletedOnServer = localStorage.getItem(`ai_${normalizedId}_completed`) === 'true';
      }
    } catch (e) {
      console.warn('서버 진도 조회 실패, 로컬 캐시 확인:', e);
      isLessonCompletedOnServer = localStorage.getItem(`ai_${normalizedId}_completed`) === 'true';
    }

    // 2. 비보안 체크리스트 UI 상태는 로컬스토리지에서 복원
    const localStateRaw = localStorage.getItem(`ai_curriculum_checklist_${normalizedId}`);
    if (localStateRaw) {
      try {
        savedState = JSON.parse(localStateRaw);
      } catch (_) {}
    }

    // 3. 초기 체크박스 상태 복원
    checkboxes.forEach((checkbox, idx) => {
      const itemId = checkbox.id || checkbox.getAttribute('data-check-id') || `chk_${idx}`;
      if (savedState[itemId]) {
        checkbox.checked = true;
        const parentLabel = checkbox.closest('.checklist-item') || checkbox.closest('label');
        if (parentLabel) parentLabel.classList.add('checked');
      }

      // 4. 체크박스 변경 이벤트 리스너 등록
      checkbox.addEventListener('change', () => {
        const parentLabel = checkbox.closest('.checklist-item') || checkbox.closest('label');
        if (checkbox.checked) {
          if (parentLabel) parentLabel.classList.add('checked');
        } else {
          if (parentLabel) parentLabel.classList.remove('checked');
        }

        const currentState = {};
        checkboxes.forEach((cb, cIdx) => {
          const key = cb.id || cb.getAttribute('data-check-id') || `chk_${cIdx}`;
          currentState[key] = cb.checked;
        });
        localStorage.setItem(`ai_curriculum_checklist_${normalizedId}`, JSON.stringify(currentState));

        // 진행률 업데이트
        ChecklistManager.updateProgress(checkboxes, progressBarFill, progressText, normalizedId, isLessonCompletedOnServer);
      });
    });

    // 5. 초기 진행률 렌더링
    ChecklistManager.updateProgress(checkboxes, progressBarFill, progressText, normalizedId, isLessonCompletedOnServer);

    // 6. 모든 강의(1~24강)에 대해 범용 완료 확인 모듈 초기화
    LessonCompletionManager.init(normalizedId, checkboxes, isLessonCompletedOnServer);
  },

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

    LessonCompletionManager.updateButtonState(lessonId, checkboxes, isLessonCompletedOnServer);
  }
};

/**
 * ------------------------------------------------------------------------------
 * 4-1. 전 강좌 범용 학습 완료 명시적 확인 모듈 (Generic Lesson Completion Manager)
 * ------------------------------------------------------------------------------
 * 체크리스트가 완료된 상태에서 학생이 'N강 완료' 버튼을 클릭하면
 * 서버 API(/api/ai/complete-lesson)를 호출하여 서버 SQLite 데이터베이스에 영구 완료를 기록합니다.
 * 성공 시 다음 강의(N+1강)가 즉시 잠금 해제됩니다.
 */
const LessonCompletionManager = {
  completedMap: {},

  init(lessonId, checkboxes, initialCompletedState = false) {
    const normalizedId = lessonId.replace('-', '_');
    LessonCompletionManager.completedMap[normalizedId] = initialCompletedState;

    const confirmButton = document.getElementById('btn-confirm-completion');
    if (!confirmButton) return;

    // 중복 이벤트 리스너 방지를 위해 클론 노드로 교체 후 등록
    const newButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newButton, confirmButton);

    const match = normalizedId.match(/(\d+)/);
    const lessonNum = match ? parseInt(match[1], 10) : 1;
    const nextNum = lessonNum + 1;

    newButton.addEventListener('click', async () => {
      let isAllChecked = true;
      checkboxes.forEach((cb) => {
        if (!cb.checked) isAllChecked = false;
      });

      if (!isAllChecked) {
        ToastManager.show('모든 체크리스트 항목을 먼저 완료해 주세요.');
        return;
      }

      newButton.disabled = true;
      newButton.setAttribute('aria-disabled', 'true');
      newButton.textContent = '완료 처리 중...';

      try {
        const response = await fetch('/api/ai/complete-lesson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify({ lesson_id: normalizedId })
        });

        if (response.ok) {
          LessonCompletionManager.completedMap[normalizedId] = true;
          localStorage.setItem(`ai_${normalizedId}_completed`, 'true');
          LessonCompletionManager.renderConfirmedState(normalizedId);
          ToastManager.show(`${lessonNum}강을 완료했습니다. ${nextNum}강이 열렸습니다! 🎉`);
        } else if (response.status === 401 || response.status === 404 || response.status === 501) {
          // 비로그인 상태이거나 정적 호스팅/오프라인 환경일 때도 로컬 스토리지에 완료 저장하여 학습 진행 보장
          LessonCompletionManager.completedMap[normalizedId] = true;
          localStorage.setItem(`ai_${normalizedId}_completed`, 'true');
          LessonCompletionManager.renderConfirmedState(normalizedId);
          ToastManager.show(`${lessonNum}강 완료가 저장되었습니다. ${nextNum}강이 열렸습니다! 🎉`);
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.detail || `${lessonNum}강 완료 처리에 실패했습니다.`;
          ToastManager.show(errMsg);
          LessonCompletionManager.updateButtonState(normalizedId, checkboxes, LessonCompletionManager.completedMap[normalizedId]);
        }
      } catch (err) {
        console.error('완료 처리 요청 오류:', err);
        // 네트워크 장애 시 로컬 스토리지에 폴백 저장
        LessonCompletionManager.completedMap[normalizedId] = true;
        localStorage.setItem(`ai_${normalizedId}_completed`, 'true');
        LessonCompletionManager.renderConfirmedState(normalizedId);
        ToastManager.show(`${lessonNum}강 완료가 로컬에 저장되었습니다. (네트워크 오프라인)`);
      }
    });

    LessonCompletionManager.updateButtonState(normalizedId, checkboxes, initialCompletedState);
  },

  updateButtonState(lessonId, checkboxes, isCompleted = false) {
    const normalizedId = lessonId.replace('-', '_');
    const confirmButton = document.getElementById('btn-confirm-completion');
    const guidanceText = document.getElementById('completion-guidance');
    const statusMsg = document.getElementById('completion-status-msg');
    const nextLockedButton = document.getElementById('btn-nav-next-locked');
    const nextOpenLink = document.getElementById('link-nav-next-open');

    if (!confirmButton) return;

    const match = normalizedId.match(/(\d+)/);
    const lessonNum = match ? parseInt(match[1], 10) : 1;
    const nextNum = lessonNum + 1;

    let checkedCount = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) checkedCount++;
    });
    const isAllChecked = (checkedCount === checkboxes.length && checkboxes.length > 0);

    const alreadyDone = isCompleted || LessonCompletionManager.completedMap[normalizedId];

    if (alreadyDone) {
      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
      confirmButton.textContent = `${lessonNum}강 완료됨`;
      confirmButton.classList.remove('btn-primary', 'montage-btn-primary');
      confirmButton.classList.add('btn-success', 'montage-btn-success');

      if (guidanceText) {
        guidanceText.textContent = `${lessonNum}강이 완료되었습니다. ${nextNum}강을 시작할 수 있습니다.`;
      }
      if (statusMsg) {
        statusMsg.textContent = '강의 완료 확인됨';
      }

      if (nextLockedButton) nextLockedButton.style.display = 'none';
      if (nextOpenLink) nextOpenLink.style.display = 'inline-block';
    } else if (isAllChecked) {
      confirmButton.disabled = false;
      confirmButton.removeAttribute('aria-disabled');
      confirmButton.textContent = `${lessonNum}강 완료하기`;
      confirmButton.classList.remove('btn-success', 'montage-btn-success');
      confirmButton.classList.add('btn-primary', 'montage-btn-primary');

      if (guidanceText) {
        guidanceText.textContent = `모든 체크리스트 항목이 완료되었습니다. 버튼을 눌러 ${lessonNum}강을 확정하세요.`;
      }
      if (statusMsg) {
        statusMsg.textContent = '';
      }

      if (nextLockedButton) nextLockedButton.style.display = 'inline-block';
      if (nextOpenLink) nextOpenLink.style.display = 'none';
    } else {
      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
      confirmButton.textContent = `${lessonNum}강 완료`;
      confirmButton.classList.remove('btn-success', 'montage-btn-success');
      confirmButton.classList.add('btn-primary', 'montage-btn-primary');

      if (guidanceText) {
        guidanceText.textContent = `모든 체크리스트 항목을 완료하면 ${lessonNum}강 완료 버튼이 활성화됩니다.`;
      }
      if (statusMsg) {
        statusMsg.textContent = '';
      }

      if (nextLockedButton) nextLockedButton.style.display = 'inline-block';
      if (nextOpenLink) nextOpenLink.style.display = 'none';
    }
  },

  renderConfirmedState(lessonId) {
    const normalizedId = lessonId.replace('-', '_');
    const confirmButton = document.getElementById('btn-confirm-completion');
    const guidanceText = document.getElementById('completion-guidance');
    const statusMsg = document.getElementById('completion-status-msg');
    const nextLockedButton = document.getElementById('btn-nav-next-locked');
    const nextOpenLink = document.getElementById('link-nav-next-open');

    const match = normalizedId.match(/(\d+)/);
    const lessonNum = match ? parseInt(match[1], 10) : 1;
    const nextNum = lessonNum + 1;

    if (confirmButton) {
      confirmButton.textContent = `${lessonNum}강 완료됨`;
      confirmButton.classList.remove('btn-primary', 'montage-btn-primary');
      confirmButton.classList.add('btn-success', 'montage-btn-success');
      confirmButton.disabled = true;
      confirmButton.setAttribute('aria-disabled', 'true');
    }
    if (guidanceText) {
      guidanceText.textContent = `${lessonNum}강이 완료되었습니다. ${nextNum}강을 시작할 수 있습니다.`;
    }
    if (statusMsg) {
      statusMsg.textContent = '강의 완료 확인됨';
    }
    if (nextLockedButton) nextLockedButton.style.display = 'none';
    if (nextOpenLink) nextOpenLink.style.display = 'inline-block';
  }
};

/**
 * ------------------------------------------------------------------------------
 * 5. 회고(Retrospective) 폼 관리 및 내보내기 모듈 (Retrospective Manager)
 * ------------------------------------------------------------------------------
 */
const RetrospectiveManager = {
  init(lessonId, lessonTitle) {
    if (!lessonId) return;

    const form = document.getElementById('retrospective-form');
    if (!form) return;

    const normalizedId = lessonId.replace('-', '_');
    const storageKey = `ai_curriculum_retro_${normalizedId}`;
    const statusMsg = document.getElementById('retro-save-status');
    const fields = form.querySelectorAll('textarea, input[type="text"]');

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

    const saveBtn = document.getElementById('btn-save-retro');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        RetrospectiveManager.saveData(fields, storageKey, statusMsg);
        ToastManager.show('회고가 브라우저에 안전하게 저장되었습니다.');
      });
    }

    const exportMdBtn = document.getElementById('btn-export-retro-md');
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', (e) => {
        e.preventDefault();
        RetrospectiveManager.exportMarkdown(fields, normalizedId, lessonTitle);
      });
    }

    const exportJsonBtn = document.getElementById('btn-export-retro-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', (e) => {
        e.preventDefault();
        RetrospectiveManager.exportJson(fields, normalizedId, lessonTitle);
      });
    }
  },

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
 * 과정 홈(index.html)에서 서버 API(/api/ai/progress)를 호출하여
 * 1~24강 전체의 완료 상태 및 순차 잠금/해제(Sequential Unlock)를 동기화합니다.
 * 1강은 항상 열려있고, 2강은 1강 완료 시, 3강은 2강 완료 시 열립니다.
 */
const CourseHomeManager = {
  async init() {
    const totalLessons = 24;
    let completedLessonsCount = 0;
    const progressMap = {};

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
        for (let i = 1; i <= totalLessons; i++) {
          const key = i < 10 ? `lesson_0${i}` : `lesson_${i}`;
          const isDone = Boolean(data[`${key}_completed`]);
          // 1강은 항상 accessible, 그 외는 API의 accessible 또는 이전 강의 완료 여부
          const isAccessible = (i === 1) ? true : Boolean(data[`${key}_accessible`]);
          progressMap[i] = { isDone, isAccessible };
          if (isDone) completedLessonsCount++;
        }
      } else {
        // 미인증 또는 서버 에러 시 로컬 스토리지 보조 확인
        CourseHomeManager.loadLocalProgress(progressMap, totalLessons);
        for (let i = 1; i <= totalLessons; i++) {
          if (progressMap[i].isDone) completedLessonsCount++;
        }
      }
    } catch (e) {
      console.warn('과정 홈 서버 진도 조회 실패, 로컬 스토리지 확인:', e);
      CourseHomeManager.loadLocalProgress(progressMap, totalLessons);
      for (let i = 1; i <= totalLessons; i++) {
        if (progressMap[i].isDone) completedLessonsCount++;
      }
    }

    // 3. 홈 화면 상단 개인 학습 완료 진행률 바 갱신 (24강 기준)
    const homeProgressBar = document.getElementById('home-progress-bar');
    const homeProgressText = document.getElementById('home-progress-text');

    if (homeProgressBar && homeProgressText) {
      const percentage = Math.round((completedLessonsCount / totalLessons) * 100);
      homeProgressBar.style.width = `${percentage}%`;
      homeProgressText.textContent = `${completedLessonsCount} / ${totalLessons}강 완료 (${percentage}%)`;
    }

    // 4. 1강부터 24강까지 전체 카드의 순차 잠금/해제 상태를 일괄 동기화
    CourseHomeManager.syncAllLessonsState(progressMap);
  },

  /**
   * 로컬 스토리지로부터 오프라인/비로그인 진도를 복원합니다.
   */
  loadLocalProgress(progressMap, totalLessons) {
    let prevDone = true; // 1강은 항상 접근 가능
    for (let i = 1; i <= totalLessons; i++) {
      const key = i < 10 ? `lesson_0${i}` : `lesson_${i}`;
      const isDone = localStorage.getItem(`ai_${key}_completed`) === 'true';
      const isAccessible = (i === 1) ? true : prevDone;
      progressMap[i] = { isDone, isAccessible };
      prevDone = isDone;
    }
  },

  /**
   * 진입이 차단되어 리다이렉트된 경우 동적 안내 배너를 표시합니다.
   */
  checkLockedNotice() {
    const urlParams = new URLSearchParams(window.location.search);
    const lockedParam = urlParams.get('locked');
    const sessionNotice = sessionStorage.getItem('ai_locked_notice');

    const noticeBanner = document.getElementById('locked-notice-banner');
    const noticeText = document.getElementById('locked-notice-text');

    if (lockedParam || sessionNotice) {
      if (noticeBanner) {
        if (noticeText) {
          if (sessionNotice) {
            noticeText.textContent = sessionNotice;
          } else if (lockedParam) {
            const currentNum = parseInt(lockedParam, 10);
            const prevNum = Math.max(1, currentNum - 1);
            noticeText.textContent = `${prevNum}강을 완료하면 열립니다. ${prevNum}강을 먼저 완료해 주세요.`;
          }
        }
        noticeBanner.style.display = 'block';
        noticeBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      sessionStorage.removeItem('ai_locked_notice');
    }
  },

  /**
   * 1강~24강 전체 카드를 순회하며 순차 잠금/해제 상태를 DOM에 반영합니다.
   */
  syncAllLessonsState(progressMap) {
    for (let i = 1; i <= 24; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const cardEl = document.getElementById(`card-lesson-${numStr}`);
      const badgeEl = document.getElementById(`badge-lesson-${numStr}`);
      const actionEl = document.getElementById(`action-lesson-${numStr}`);

      const meta = LESSON_METADATA[i];
      const state = progressMap[i] || { isDone: false, isAccessible: (i === 1) };

      // 오픈 예정 강의(8강 이후)인 경우 기본 준비 중 유지
      if (!meta && i > 7) {
        continue;
      }

      if (i === 1) {
        // 1강: 항상 오픈
        if (badgeEl) {
          if (state.isDone) {
            badgeEl.className = 'badge badge-success';
            badgeEl.textContent = '완료됨';
          } else {
            badgeEl.className = 'badge badge-primary';
            badgeEl.textContent = '학습 가능';
          }
        }
        if (actionEl && meta) {
          actionEl.innerHTML = `<a href="./lessons/${meta.folder}/index.html" class="montage-btn montage-btn-primary">1강 시작하기 →</a>`;
        }
        continue;
      }

      // 2강 ~ 7강 (오픈된 강의 순차 잠금/해제)
      if (cardEl && meta) {
        const prevNum = i - 1;
        if (state.isAccessible) {
          // 이전 강의 완료되어 현재 강의 접근 허용됨
          cardEl.classList.remove('disabled');
          cardEl.removeAttribute('aria-disabled');

          if (badgeEl) {
            if (state.isDone) {
              badgeEl.className = 'badge badge-success';
              badgeEl.textContent = '완료됨';
            } else {
              badgeEl.className = 'badge badge-primary';
              badgeEl.textContent = '학습 가능';
            }
          }

          if (actionEl) {
            actionEl.innerHTML = `<a href="./lessons/${meta.folder}/index.html" class="montage-btn montage-btn-primary">${i}강 시작하기 →</a>`;
          }
        } else {
          // 이전 강의 미완료로 현재 강의 잠김 유지
          cardEl.classList.add('disabled');
          cardEl.setAttribute('aria-disabled', 'true');

          if (badgeEl) {
            badgeEl.className = 'badge badge-muted';
            badgeEl.textContent = '잠김';
          }

          if (actionEl) {
            actionEl.innerHTML = `<button type="button" class="montage-btn montage-btn-disabled" disabled aria-disabled="true">${prevNum}강을 완료하면 열립니다.</button>`;
          }
        }
      }
    }
  }
};

/**
 * ------------------------------------------------------------------------------
 * DOM 콘텐츠 로드 완료 시 전역 초기화 실행
 * ------------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  // 클립보드 복사 초기화
  CopyManager.init();

  // 과정 홈인 경우 로드맵 상태 동기화
  if (document.body.classList.contains('page-course-home')) {
    CourseHomeManager.init();
  }

  // 학습별 페이지인 경우 data 속성 기반으로 비교 실험, 체크리스트 및 회고 초기화
  const lessonBody = document.querySelector('[data-lesson-id]');
  if (lessonBody) {
    const rawLessonId = lessonBody.getAttribute('data-lesson-id');
    const lessonTitle = lessonBody.getAttribute('data-lesson-title') || rawLessonId;
    const normalizedLessonId = rawLessonId.replace('-', '_');

    ExperimentManager.init(normalizedLessonId);
    ChecklistManager.init(normalizedLessonId);
    RetrospectiveManager.init(normalizedLessonId, lessonTitle);
  }
});
