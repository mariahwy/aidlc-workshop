# Business Rules - Backend API

## 1. 인증/인가 규칙

### BR-AUTH-01: JWT 세션 만료
- 모든 JWT 토큰은 16시간 후 만료
- 만료된 토큰으로 요청 시 401 Unauthorized 반환

### BR-AUTH-02: 역할 기반 접근 제어
| 기능 | owner | staff | customer |
|---|---|---|---|
| 주문 모니터링/상태 변경 | ✅ | ✅ | ❌ |
| 주문 삭제 | ✅ | ✅ | ❌ |
| 테이블 세션 관리 | ✅ | ✅ | ❌ |
| 메뉴 관리 (CRUD) | ✅ | ❌ | ❌ |
| 매장 관리 | ✅ | ❌ | ❌ |
| 직원 관리 | ✅ | ❌ | ❌ |
| 메뉴 조회 | ✅ | ✅ | ✅ |
| 주문 생성 | ❌ | ❌ | ✅ |
| 주문 내역 조회 (본인 세션) | ❌ | ❌ | ✅ |

### BR-AUTH-03: Brute-force 방지
- 연속 5회 로그인 실패 시 15분 잠금
- 잠금 해제 후 카운터 리셋

### BR-AUTH-04: 매장 격리
- 모든 API 요청은 인증된 사용자의 store_id로 필터링
- 다른 매장의 데이터에 접근 불가 (IDOR 방지)

## 2. 주문 규칙

### BR-ORDER-01: 상태 전이
```
[기본 흐름 - 단방향]
pending → preparing → completed

[관리자 예외 - 역방향 허용]
completed → preparing
preparing → pending
```
- 고객은 상태 변경 불가
- 관리자(owner/staff)만 상태 변경 가능
- 관리자는 역방향 전이도 허용

### BR-ORDER-02: 주문 유효성
- 장바구니에 최소 1개 항목 필요
- 수량은 1 이상
- 모든 메뉴 항목이 동일 매장 소속이어야 함
- 활성 테이블 세션이 있어야 주문 가능

### BR-ORDER-03: 주문 번호
- 매장별 고유 번호 (타임스탬프 + 순차 번호)
- 형식: YYYYMMDD-NNN (예: 20260331-001)

## 3. 테이블 세션 규칙

### BR-SESSION-01: 세션 생명주기
- 테이블당 활성 세션은 최대 1개
- 세션 시작: 테이블 로그인 시 활성 세션 없으면 자동 생성
- 세션 종료: 관리자가 이용 완료 처리

### BR-SESSION-02: 이용 완료 처리
- 해당 세션의 모든 주문을 OrderHistory로 복사
- 원본 Order 데이터 유지
- TableSession.is_active = False
- 고객 앱에서 해당 세션 주문 더 이상 표시 안 됨

## 4. 데이터 검증 규칙

### BR-VALID-01: 메뉴 항목
- 메뉴명: 필수, 1~100자
- 가격: 필수, 0 이상 정수
- 카테고리: 필수, 유효한 category_id
- 이미지 URL: 선택, 최대 500자

### BR-VALID-02: 매장
- 매장명: 필수, 1~100자

### BR-VALID-03: 사용자
- 사용자명: 필수, 1~50자, 매장 내 고유
- 비밀번호: 필수, 최소 8자

### BR-VALID-04: 테이블
- 테이블 번호: 필수, 양의 정수, 매장 내 고유
- 비밀번호: 필수, 최소 4자

## 5. 소프트 삭제 규칙

### BR-DELETE-01: 소프트 삭제 대상
- Store, User, Table, Category, MenuItem에 적용
- deleted_at 필드에 삭제 시각 기록
- 모든 조회 쿼리에 `deleted_at IS NULL` 필터 적용

### BR-DELETE-02: 매장 삭제 시
- 매장의 deleted_at 설정
- 하위 데이터(User, Table, Category, MenuItem) 보존
- 삭제된 매장으로 로그인 불가

## 6. 이미지 업로드 규칙

### BR-IMAGE-01: 허용 파일 타입
- JPEG, PNG, WebP만 허용
- 최대 파일 크기: 5MB

### BR-IMAGE-02: 파일명
- UUID 기반 고유 파일명 생성
- 원본 확장자 유지
