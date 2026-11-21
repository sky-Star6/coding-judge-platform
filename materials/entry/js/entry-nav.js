/**
 * 엔트리 학습관 공통 GNB 네비게이션 스크립트 (entry-nav.js)
 * - 단원 선택 드롭다운 토글 및 외부 클릭 닫기 핸들러
 */
document.addEventListener('DOMContentLoaded', function () {
    var dropdown = document.getElementById('chapter-dropdown');
    var btn = document.getElementById('chapter-dropdown-btn');

    if (dropdown && btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = dropdown.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // ESC 키 입력 시 닫기
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.key === 'Esc') {
                dropdown.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});
