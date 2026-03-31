# Backend API - Functional Design Plan

## Design Steps

### Step 1: Domain Entities Design
- [x] 핵심 엔티티 정의 (Store, User, Table, TableSession, Category, MenuItem, Order, OrderItem, OrderHistory)
- [x] 엔티티 간 관계 정의 (1:N, N:M)
- [x] 필드별 타입, 제약조건, 기본값 정의

### Step 2: Business Logic Model
- [x] 인증 로직 (고객 테이블 로그인, 관리자 로그인, JWT 발급/검증)
- [x] 주문 로직 (생성, 상태 변경, 삭제, SSE 이벤트 발행)
- [x] 테이블 세션 로직 (시작, 종료, 이력 이동)
- [x] 메뉴 관리 로직 (CRUD, 순서 조정)
- [x] 매장/직원 관리 로직

### Step 3: Business Rules
- [x] 인증/인가 규칙 (역할별 접근 제어, 세션 만료)
- [x] 주문 규칙 (상태 전이, 유효성 검증)
- [x] 데이터 검증 규칙 (필수 필드, 범위, 형식)

### Step 4: Generate Artifacts
- [x] domain-entities.md 생성
- [x] business-logic-model.md 생성
- [x] business-rules.md 생성

---

## Clarifying Questions

### Question 1
주문 상태 전이 규칙을 어떻게 하시겠습니까?

A) 단방향만 허용: 대기중 → 준비중 → 완료 (역방향 불가)
B) 유연한 전이: 어떤 상태에서든 다른 상태로 변경 가능
C) 단방향 + 관리자 예외: 기본 단방향이지만 관리자는 역방향 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
테이블 세션 종료(이용 완료) 시 주문 데이터 처리 방식은?

A) 주문 데이터를 OrderHistory 테이블로 복사 후 원본 Order 유지 (soft archive)
B) 주문 데이터를 OrderHistory로 이동 후 원본 Order 삭제 (hard move)
C) Order 테이블에 archived 플래그 추가 (별도 테이블 없이)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
매장 삭제 시 하위 데이터(메뉴, 테이블, 주문 등) 처리 방식은?

A) 캐스케이드 삭제 (매장 삭제 시 모든 하위 데이터 삭제)
B) 소프트 삭제 (deleted_at 플래그, 데이터 보존)
C) 하위 데이터 존재 시 삭제 차단 (먼저 하위 데이터 정리 필요)
D) Other (please describe after [Answer]: tag below)

[Answer]: B
