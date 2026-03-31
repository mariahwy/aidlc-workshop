# Components

## 1. Customer Frontend App (React + TypeScript)

| 컴포넌트 | 책임 |
|---|---|
| AuthProvider | 자동 로그인, 세션 관리, 인증 상태 관리 |
| MenuPage | 카테고리별 메뉴 조회, 메뉴 카드 표시 |
| CartProvider | 장바구니 상태 관리, 로컬 저장, 수량 조절 |
| OrderPage | 주문 확정, 주문 결과 표시, 리다이렉트 |
| OrderHistoryPage | 현재 세션 주문 내역 조회 |
| APIClient | 백엔드 API 통신 (axios/fetch 래퍼) |

## 2. Admin Frontend App (React + TypeScript)

| 컴포넌트 | 책임 |
|---|---|
| AuthProvider | 관리자 로그인, JWT 세션 관리 |
| DashboardPage | 테이블별 그리드 레이아웃, 실시간 주문 모니터링 (SSE) |
| TableDetailModal | 테이블 주문 상세, 상태 변경, 주문 삭제 |
| TableManagementPage | 테이블 초기 설정, 세션 종료, 과거 내역 조회 |
| MenuManagementPage | 메뉴 CRUD, 순서 조정, 이미지 업로드 |
| StoreManagementPage | 매장 CRUD, 매장 선택 |
| StaffManagementPage | 직원 계정 CRUD |
| RoleGuard | 역할 기반 접근 제어 (소유자/직원) |
| APIClient | 백엔드 API 통신 래퍼 |
| SSEClient | SSE 연결 관리, 실시간 이벤트 수신 |

## 3. Backend API (Python + FastAPI)

### 3.1 Customer API 그룹

| 컴포넌트 | 책임 |
|---|---|
| customer_auth_router | 테이블 로그인, 세션 검증 |
| customer_menu_router | 메뉴 조회 (카테고리별) |
| customer_order_router | 주문 생성, 주문 내역 조회 |

### 3.2 Admin API 그룹

| 컴포넌트 | 책임 |
|---|---|
| admin_auth_router | 관리자 로그인, 토큰 갱신 |
| admin_order_router | 주문 모니터링, 상태 변경, 주문 삭제, SSE 스트림 |
| admin_table_router | 테이블 설정, 세션 관리, 과거 내역 조회 |
| admin_menu_router | 메뉴 CRUD, 순서 조정 |
| admin_store_router | 매장 CRUD |
| admin_staff_router | 직원 계정 CRUD |
| admin_image_router | S3 이미지 업로드 |

### 3.3 Core 컴포넌트

| 컴포넌트 | 책임 |
|---|---|
| auth_dependency | FastAPI Depends 기반 인증/인가 (JWT 검증, 역할 확인) |
| database | SQLAlchemy 엔진, 세션 관리 |
| models | SQLAlchemy ORM 모델 (Store, User, Table, TableSession, Category, MenuItem, Order, OrderItem, OrderHistory) |
| schemas | Pydantic 요청/응답 스키마 |
| config | 환경 설정 (DB URL, JWT Secret, S3 설정 등) |
| exceptions | 글로벌 에러 핸들러, 커스텀 예외 |

## 4. Data Layer

| 컴포넌트 | 책임 |
|---|---|
| PostgreSQL | 영구 데이터 저장 (매장, 메뉴, 주문, 사용자 등) |
| AWS S3 | 메뉴 이미지 파일 저장 |
