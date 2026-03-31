# Application Design - 통합 문서

## 1. 시스템 아키텍처 개요

```
+-------------------+     +-------------------+
|  Customer App     |     |  Admin App        |
|  (React + TS)     |     |  (React + TS)     |
|  Context+Reducer  |     |  Context+Reducer  |
+--------+----------+     +---+----------+----+
         |                    |          |
         | REST API           | REST API | SSE
         v                    v          v
+--------+----------+  +-----+----------+----+
| Customer API Group|  | Admin API Group      |
| - auth            |  | - auth, orders, SSE  |
| - menus           |  | - tables, menus      |
| - orders          |  | - stores, staff, img |
+--------+----------+  +-----+---------------+
         |                    |
         +--------+-----------+
                  |
         +--------v---------+
         |  Service Layer    |
         |  Auth, Order,     |
         |  Table, Menu,     |
         |  Store, Staff,    |
         |  SSE, Image       |
         +----+--------+----+
              |        |
              v        v
         +----+--+ +---+---+
         |  PG   | |  S3   |
         +-------+ +-------+
```

## 2. 기술 결정 사항

| 항목 | 결정 |
|---|---|
| 프론트엔드 프레임워크 | React + TypeScript |
| 프론트엔드 상태 관리 | React Context + useReducer |
| 프론트엔드 구성 | 별도 앱 2개 (Customer, Admin) |
| 백엔드 프레임워크 | Python + FastAPI |
| 백엔드 API 구조 | 기능별 통합 (Customer API / Admin API) |
| ORM | SQLAlchemy |
| 인증/인가 | FastAPI Depends 기반 의존성 주입 + JWT |
| 데이터베이스 | PostgreSQL |
| 파일 저장소 | AWS S3 |
| 실시간 통신 | Server-Sent Events (SSE) |
| 배포 | AWS Cloud |

## 3. 컴포넌트 요약

- **Customer App**: 6개 컴포넌트 (Auth, Menu, Cart, Order, OrderHistory, APIClient)
- **Admin App**: 10개 컴포넌트 (Auth, Dashboard, TableDetail, TableMgmt, MenuMgmt, StoreMgmt, StaffMgmt, RoleGuard, APIClient, SSEClient)
- **Backend Customer API**: 3개 라우터 (auth, menu, order)
- **Backend Admin API**: 7개 라우터 (auth, order, table, menu, store, staff, image)
- **Backend Core**: 6개 모듈 (auth_dependency, database, models, schemas, config, exceptions)
- **Services**: 8개 (Auth, Store, Menu, Order, Table, SSE, Image, Staff)

## 4. 데이터 모델 (핵심 엔티티)

| 엔티티 | 설명 |
|---|---|
| Store | 매장 정보 |
| User | 관리자/직원 계정 (role: owner/staff) |
| Table | 테이블 정보 (매장 소속) |
| TableSession | 테이블 세션 (시작~종료) |
| Category | 메뉴 카테고리 (매장 소속) |
| MenuItem | 메뉴 항목 (카테고리 소속) |
| Order | 주문 (테이블 세션 소속) |
| OrderItem | 주문 항목 (주문 소속) |
| OrderHistory | 과거 주문 이력 (세션 종료 시 이동) |

## 5. 참조 문서
- 상세 컴포넌트: [components.md](components.md)
- 메서드 시그니처: [component-methods.md](component-methods.md)
- 서비스 정의: [services.md](services.md)
- 의존성 관계: [component-dependency.md](component-dependency.md)
