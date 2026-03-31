# Application Design Plan

## Design Steps

### Step 1: Component Identification
- [x] 프론트엔드 컴포넌트 식별 (Customer App, Admin App)
- [x] 백엔드 서비스 컴포넌트 식별 (API 모듈별)
- [x] 데이터 액세스 컴포넌트 식별

### Step 2: Component Methods Definition
- [x] 각 컴포넌트별 메서드 시그니처 정의
- [x] 입출력 타입 정의

### Step 3: Service Layer Design
- [x] 서비스 정의 및 오케스트레이션 패턴
- [x] 서비스 간 통신 패턴

### Step 4: Component Dependencies
- [x] 의존성 매트릭스 작성
- [x] 데이터 흐름 다이어그램

### Step 5: Generate Artifacts
- [x] components.md 생성
- [x] component-methods.md 생성
- [x] services.md 생성
- [x] component-dependency.md 생성
- [x] application-design.md (통합 문서) 생성

---

## Clarifying Questions

아래 질문에 답변해 주세요.

### Question 1
백엔드 API 구조를 어떻게 구성하시겠습니까?

A) 도메인별 라우터 분리 (stores, menus, orders, tables, auth 등 각각 별도 모듈)
B) 기능별 통합 (customer API / admin API 두 그룹으로 분리)
C) 단일 모놀리식 (하나의 앱에서 모든 엔드포인트 관리)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 2
프론트엔드 상태 관리 라이브러리로 무엇을 사용하시겠습니까?

A) React Context + useReducer (외부 라이브러리 없이)
B) Zustand (경량 상태 관리)
C) Redux Toolkit
D) Recoil / Jotai (Atomic 상태 관리)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
백엔드 데이터베이스 접근 방식으로 무엇을 사용하시겠습니까?

A) SQLAlchemy ORM
B) Tortoise ORM (async 네이티브)
C) Raw SQL (asyncpg 직접 사용)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
API 인증/인가 미들웨어 구조를 어떻게 하시겠습니까?

A) FastAPI Depends 기반 의존성 주입 (경량)
B) 커스텀 미들웨어 클래스 (전역 적용)
C) FastAPI Security 유틸리티 (OAuth2PasswordBearer 등) + Depends 조합
D) Other (please describe after [Answer]: tag below)

[Answer]: A
