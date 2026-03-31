# Services

## 1. AuthService
- **책임**: 인증/인가 처리
- **오케스트레이션**: 로그인 요청 → 자격 증명 검증 → JWT 발급 → 세션 생성
- **사용처**: customer_auth_router, admin_auth_router, auth_dependency

## 2. StoreService
- **책임**: 매장 CRUD, 매장별 데이터 격리
- **오케스트레이션**: 매장 생성/수정/삭제, 매장 소유권 검증
- **사용처**: admin_store_router

## 3. MenuService
- **책임**: 메뉴/카테고리 관리
- **오케스트레이션**: 메뉴 CRUD, 카테고리별 조회, 순서 조정, 매장 소속 검증
- **사용처**: customer_menu_router, admin_menu_router

## 4. OrderService
- **책임**: 주문 생성, 조회, 상태 변경, 삭제
- **오케스트레이션**: 주문 생성 → 주문 항목 저장 → SSE 이벤트 발행 / 상태 변경 → SSE 이벤트 발행
- **사용처**: customer_order_router, admin_order_router

## 5. TableService
- **책임**: 테이블 설정, 세션 관리
- **오케스트레이션**: 테이블 생성 → 세션 시작 / 이용 완료 → 주문 이력 이동 → 세션 종료
- **사용처**: admin_table_router, customer_auth_router

## 6. SSEService
- **책임**: Server-Sent Events 관리
- **오케스트레이션**: 클라이언트 연결 관리, 주문 이벤트 브로드캐스트 (매장별)
- **사용처**: admin_order_router

## 7. ImageService
- **책임**: S3 이미지 업로드
- **오케스트레이션**: 파일 수신 → S3 업로드 → URL 반환
- **사용처**: admin_image_router

## 8. StaffService
- **책임**: 직원 계정 관리
- **오케스트레이션**: 직원 CRUD, 역할 할당, 매장 소속 검증
- **사용처**: admin_staff_router

## 서비스 간 통신 패턴
- 모든 서비스는 동기 호출 (FastAPI 내부 함수 호출)
- SSE는 비동기 이벤트 발행 (OrderService → SSEService)
- 데이터베이스 접근은 SQLAlchemy 세션을 통한 의존성 주입
