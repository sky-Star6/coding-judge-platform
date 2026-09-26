# 2급 테스트 일반 코딩 지문 스냅샷 (ID 301–312)

`level2_test_301_312.json`은 로컬 `judge_db.sqlite`에서 추출한 공개 지문만 보관하는 결정론적 UTF-8 JSON 자료원이다. DB 자체와 답안·초기 코드·테스트 케이스·사용자·제출 데이터는 포함하지 않는다. 각 상태에 `id`, `title`, `difficulty`, `problem_type`, `description`만 ID 오름차순으로 담았다.

## 상태 출처

- `baseline_before_2026_09_26_185503_update`: `judge_db.backup_20260926_185503_before_2급_test_301_312_description.sqlite`에서 읽기 전용 추출.
- `current_verified_after_update`: 현재 공식 로컬 `judge_db.sqlite`에서 읽기 전용 추출. 독립 검증 카드 `t_af5d8999`의 PASS 결과와 대조.
- 추출 시점 확인 SHA-256 — 기준 백업 `ef2133f1ec062bf0b0559c9a107db6595b90cb5c945343956670187df21e3f7d`; 현재 DB `52807996b5853a6ec13ba0bc5d78e35b66792f20d929b13eb041699dc63d1655`.

## 12개 지문의 의미 비교

ID 301–312 전체에서 바뀐 텍스트는 섹션 제목 네 줄뿐이다. 기존 `매개변수 설명`, `return 값 설명`, `예제`, 예제 뒤의 설명 제목을 각각 `### ■ 매개변수 설명`, `### ■ return 값 설명`, `### ■ 예제`, `### ■ 예제 설명`으로 정리했다. ID 302의 기존 `#####예제`도 동일한 예제 제목으로 바뀌었다. 문제 본문, 제약, 예제 표·값, 예제 설명의 내용과 나머지 공백/줄바꿈은 기준본과 동일하다. 제목·난이도·문제 유형 등 식별 메타데이터도 두 상태에서 같다.

수록 ID: 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312.

## 선택 복원 절차 초안 (실행 금지·별도 승인 필요)

1. 복원할 ID를 명시적으로 하나씩 정하고, JSON의 `baseline_before_2026_09_26_185503_update`와 `current_verified_after_update`에서 해당 ID의 레코드를 찾는다. 전체 상태나 전체 DB를 교체하지 않는다.
2. 복원 전에 공식 로컬 DB에서 해당 ID의 `id`, `title`, `difficulty`, `problem_type`, `description`을 읽어 JSON `current_verified_after_update`의 같은 다섯 필드와 값이 모두 정확히 같은지 확인한다. 하나라도 다르거나 행이 없으면 즉시 중단한다. 최신 DB 변경을 덮어쓸 수 있으므로 승인된 스냅샷으로 간주하지 말고, 원인을 확인해 스냅샷과 복원 계획을 다시 검토·승인받는다. description뿐 아니라 식별 메타데이터도 비교한다.
3. 일치 확인 후 별도 승인을 받고 작업 직전 공식 DB를 백업해 파일 크기와 SHA-256을 기록한다. `BEGIN IMMEDIATE`를 시작한 뒤 잠금이 유지되는 동안 동일 행을 다시 읽어 앞 단계와 마찬가지로 JSON `current_verified_after_update`의 다섯 필드 모두와 정확히 일치하는지 재검사한다. 불일치하면 아무것도 쓰지 말고 롤백·중단한 뒤 재검토·재승인을 받는다.
4. 일치할 때만 JSON의 `baseline_before_2026_09_26_185503_update`에서 지정 ID의 `description`을 복원 값으로 사용한다. 매개변수화된 조건부 단일 필드 UPDATE를 실행하며, WHERE guard에는 스냅샷의 현재 값을 사용한다: `UPDATE problems SET description = ? WHERE id IS ? AND title IS ? AND difficulty IS ? AND problem_type IS ? AND description IS ?`. 값은 순서대로 baseline description, 현재 스냅샷의 id/title/difficulty/problem_type/description이다. 따라서 복원 직전 description만 우연히 관측한 값을 guard로 삼지 않는다.
5. 변경 행 수가 정확히 1인지 확인한다. 아니면 롤백하고 중단한다. 트랜잭션 안에서 복원 지문과 메타데이터를 읽어 결과를 확인한 뒤 커밋하고, 커밋 후 다시 읽어 description이 baseline과 일치하며 메타데이터는 보존됐는지 확인한다.
6. `PRAGMA integrity_check`가 `ok`, `PRAGMA foreign_key_check`가 0행인지 확인한다. 변경 전후 해당 행과 테이블 행 수를 비교하고 description 외 필드는 불변이어야 한다.

이 문서는 절차 초안일 뿐 DB 복원 권한이나 승인으로 간주하지 않는다. 이 작업에서는 DB 쓰기, 백업 삭제, Git stage/commit/push/PR을 수행하지 않았다.
