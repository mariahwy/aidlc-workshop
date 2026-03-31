# Business Logic Model - Backend API

## 1. 인증 로직

### 1.1 테이블 로그인 (고객)
1. store_id + table_number + password 수신
2. Store 존재 확인 (deleted_at IS NULL)
3. Table 조회 (store_id + table_number, deleted_at IS NULL)
4. bcrypt 비밀번호 검증
5. 활성 TableSession 조회 또는 신규 생성
6. JWT 발급 (payload: table_id, table_session_id, store_id, type=customer, exp=16h)

### 1.2 관리자 로그인
1. store_id + username + password 수신
2. 로그인 시도 횟수 확인 (brute-force 방지)
3. Store 존재 확인 (deleted_at IS NULL)
4. User 조회 (store_id + username, deleted_at IS NULL)
5. bcrypt 비밀번호 검증
6. 실패 시 시도 횟수 증가, 임계값 초과 시 잠금
7. 성공 시 JWT 발급 (payload: user_id, store_id, role, type=admin, exp=16h)

### 1.3 JWT 검증 (auth_dependency)
1. Authorization 헤더에서 Bearer 토큰 추출
2. JWT 서명, 만료, 발급자 검증
3. 토큰 타입(customer/admin) 확인
4. 해당 엔티티(Table/User) 존재 및 활성 상태 확인
5. 역할 기반 접근 제어 (owner/staff)

## 2. 주문 로직

### 2.1 주문 생성
1. 장바구니 항목 수신 (menu_item_id, quantity 배열)
2. table_session_id 검증 (활성 세션인지 확인)
3. 각 menu_item_id 존재 및 동일 매장 소속 확인
4. 메뉴명, 단가 스냅샷 저장 (OrderItem에 menu_name, unit_price)
5. 소계 계산 (quantity * unit_price)
6. 총 금액 계산 (소계 합산)
7. 주문 번호 생성 (매장별 순차 또는 타임스탬프 기반)
8. Order + OrderItem 저장
9. SSE 이벤트 발행 (new_order)

### 2.2 주문 상태 변경
1. order_id + 새 상태 수신
2. 현재 상태 확인
3. 상태 전이 규칙 검증:
   - 기본: pending → preparing → completed (단방향)
   - 관리자(owner/staff): 역방향 허용 (completed → preparing, preparing → pending)
4. 상태 업데이트
5. SSE 이벤트 발행 (order_status_changed)

### 2.3 주문 삭제
1. order_id 수신
2. 주문 존재 및 매장 소속 확인
3. Order + OrderItem 삭제
4. SSE 이벤트 발행 (order_deleted)

## 3. 테이블 세션 로직

### 3.1 세션 시작
- 첫 주문 생성 시 활성 세션이 없으면 자동 생성
- 또는 테이블 로그인 시 활성 세션 없으면 생성

### 3.2 세션 종료 (이용 완료)
1. table_id 수신
2. 활성 TableSession 조회
3. 해당 세션의 모든 Order + OrderItem을 OrderHistory로 복사:
   - Order 정보 + OrderItem을 items_snapshot(JSON)으로 저장
4. 원본 Order 데이터 유지 (soft archive)
5. TableSession.is_active = False, ended_at = NOW
6. SSE 이벤트 발행 (table_session_completed)

### 3.3 과거 내역 조회
1. table_id + 날짜 필터 수신
2. OrderHistory에서 해당 테이블의 이력 조회 (시간 역순)

## 4. 메뉴 관리 로직

### 4.1 메뉴 CRUD
- 생성: 필수 필드 검증 → MenuItem 저장
- 수정: 존재 확인 → 필드 업데이트
- 삭제: 소프트 삭제 (deleted_at = NOW)
- 조회: deleted_at IS NULL 필터, 카테고리별, sort_order 정렬

### 4.2 메뉴 순서 조정
1. menu_ids 배열 수신 (새 순서)
2. 각 menu_id의 sort_order를 배열 인덱스로 업데이트

## 5. 매장/직원 관리 로직

### 5.1 매장 CRUD
- 생성: 매장 정보 저장
- 수정: 존재 확인 → 필드 업데이트
- 삭제: 소프트 삭제 (deleted_at = NOW, 하위 데이터 보존)
- 조회: deleted_at IS NULL 필터

### 5.2 직원 CRUD
- 생성: username 중복 확인 → bcrypt 해싱 → User(role=staff) 저장
- 수정: 비밀번호 변경 시 재해싱
- 삭제: 소프트 삭제
- 조회: 매장별, deleted_at IS NULL 필터

## 6. SSE 이벤트 관리

### 이벤트 타입
| 이벤트 | 데이터 | 트리거 |
|---|---|---|
| new_order | Order 전체 정보 | 주문 생성 |
| order_status_changed | {order_id, new_status} | 상태 변경 |
| order_deleted | {order_id, table_id} | 주문 삭제 |
| table_session_completed | {table_id} | 이용 완료 |

### 브로드캐스트 방식
- 매장별(store_id) 연결 관리
- 해당 매장에 연결된 모든 Admin 클라이언트에 이벤트 전송

## 7. 이미지 업로드

1. multipart 파일 수신
2. 파일 타입 검증 (이미지만 허용)
3. 고유 파일명 생성 (UUID 기반)
4. S3 업로드
5. 이미지 URL 반환
