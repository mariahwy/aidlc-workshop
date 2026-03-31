# Unit of Work Definitions

## 유닛 개요

| # | 유닛명 | 유형 | 기술 스택 |
|---|---|---|---|
| 1 | Backend API | Service | Python, FastAPI, SQLAlchemy, PostgreSQL |
| 2 | Customer Frontend | App | React, TypeScript |
| 3 | Admin Frontend | App | React, TypeScript |
| 4 | Infrastructure | IaC | AWS (배포 아키텍처) |

## 개발 전략
- **병렬 개발**: API 스펙(OpenAPI) 먼저 합의 후 4개 유닛 동시 개발
- **디렉토리 구조**: 모노레포

```
table-order/
├── backend/              # Unit 1: Backend API
│   ├── app/
│   │   ├── api/
│   │   │   ├── customer/    # Customer API 그룹
│   │   │   └── admin/       # Admin API 그룹
│   │   ├── models/          # SQLAlchemy 모델
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── services/        # 비즈니스 로직
│   │   ├── core/            # 설정, 보안, DB
│   │   └── main.py
│   ├── tests/
│   ├── alembic/             # DB 마이그레이션
│   └── requirements.txt
├── customer-frontend/    # Unit 2: Customer Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── admin-frontend/       # Unit 3: Admin Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── infrastructure/       # Unit 4: Infrastructure
    └── (AWS 배포 설정)
```

---

## Unit 1: Backend API

**책임**: 모든 비즈니스 로직, 데이터 관리, API 제공, SSE 스트림
**범위**:
- Customer API 그룹 (auth, menu, order)
- Admin API 그룹 (auth, order, table, menu, store, staff, image)
- 8개 서비스 (Auth, Store, Menu, Order, Table, SSE, Image, Staff)
- SQLAlchemy ORM 모델 (9개 엔티티)
- Pydantic 스키마
- JWT 인증/인가 (FastAPI Depends)
- S3 이미지 업로드
- DB 마이그레이션 (Alembic)

---

## Unit 2: Customer Frontend

**책임**: 고객 주문 인터페이스
**범위**:
- 자동 로그인 / 세션 관리
- 카테고리별 메뉴 조회
- 장바구니 관리 (로컬 저장)
- 주문 생성 및 결과 표시
- 주문 내역 조회
- React Context + useReducer 상태 관리

---

## Unit 3: Admin Frontend

**책임**: 매장 관리자 인터페이스
**범위**:
- 관리자 로그인 (소유자/직원 역할)
- 실시간 주문 모니터링 대시보드 (SSE)
- 테이블 관리 (설정, 세션 종료, 과거 내역)
- 메뉴 관리 (CRUD, 순서, 이미지 업로드)
- 매장 관리 (CRUD)
- 직원 계정 관리
- 역할 기반 접근 제어 (RoleGuard)
- React Context + useReducer 상태 관리

---

## Unit 4: Infrastructure

**책임**: AWS 클라우드 배포 아키텍처
**범위**:
- AWS 리소스 정의 (컴퓨팅, 네트워킹, 스토리지)
- PostgreSQL 데이터베이스 인프라
- S3 버킷 설정
- 네트워크 구성 (VPC, 보안 그룹)
- 배포 파이프라인
