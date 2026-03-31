# Code Generation Plan - Admin Frontend

## Unit Context
- **유닛명**: Admin Frontend (Unit 3)
- **기술 스택**: React 18, TypeScript, Vite, CSS Modules, TanStack Query, React Router v6, axios, fast-check
- **코드 위치**: `admin-frontend/` (워크스페이스 루트 하위)
- **담당 스토리**: US-A01, US-A02, US-A03, US-A04, US-A05, US-A06, US-S01

## Dependencies
- Backend API (Unit 1): REST API + SSE 엔드포인트 (개발 시 MSW 모킹 활용)

## Story Traceability
- [x] US-A01: 매장 관리자 인증 → LoginPage, AuthContext
- [x] US-A02: 실시간 주문 모니터링 → DashboardPage, SSEContext, TableDetailModal
- [x] US-A03: 테이블 관리 → TableManagementPage, TableDetailModal (세션/삭제/이력)
- [x] US-A04: 메뉴 관리 → MenuManagementPage, ImageUploader
- [x] US-A05: 매장 관리 → StoreManagementPage, StoreSelectionPage, StoreSwitcher
- [x] US-A06: 직원 계정 관리 → StaffManagementPage
- [x] US-S01: 메뉴 이미지 S3 업로드 → ImageUploader

## Generation Steps

### Phase 1: Project Structure Setup
- [x] Step 1: Vite + React + TypeScript 프로젝트 초기화
- [x] Step 2: ESLint + Prettier 설정
- [x] Step 3: 디렉토리 구조 생성

### Phase 2: Core Infrastructure (공통 모듈)
- [x] Step 4: 타입 정의 (src/types/index.ts)
- [x] Step 5: 유틸리티 함수 (src/utils/format.ts, validation.ts)
- [x] Step 6: API Client (src/api/client.ts)
- [x] Step 7: AuthContext (src/contexts/AuthContext.tsx)
- [x] Step 8: StoreContext (src/contexts/StoreContext.tsx)
- [x] Step 9: SSEContext (src/contexts/SSEContext.tsx)

### Phase 3: Common Components
- [x] Step 10: Layout + Sidebar + Header
- [x] Step 11: RoleGuard
- [x] Step 12: 공통 UI 컴포넌트

### Phase 4: API Hooks
- [x] Step 13: API 훅 (7개 모듈)

### Phase 5: Page Components
- [x] Step 14: LoginPage [US-A01]
- [x] Step 15: StoreSelectionPage [US-A05]
- [x] Step 16: DashboardPage [US-A02]
- [x] Step 17: TableDetailModal [US-A02, US-A03]
- [x] Step 18: TableManagementPage [US-A03]
- [x] Step 19: MenuManagementPage [US-A04, US-S01]
- [x] Step 20: StoreManagementPage [US-A05]
- [x] Step 21: StaffManagementPage [US-A06]

### Phase 6: App Entry + Routing
- [x] Step 22: App.tsx + main.tsx

### Phase 7: Sound & Hooks
- [x] Step 23: useSound + useOffline

### Phase 8: Unit Testing
- [x] Step 24: Vitest 설정
- [x] Step 25: 유틸리티 테스트 (PBT 포함)
- [x] Step 26: AuthContext 테스트 (RoleGuard 테스트에 포함)
- [x] Step 27: RoleGuard 테스트 (PBT 포함)
- [x] Step 28: 주요 컴포넌트 테스트

### Phase 9: Documentation
- [x] Step 29: README.md

## Total: 29 Steps (ALL COMPLETE)
