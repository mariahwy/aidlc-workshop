# Tech Stack Decisions - Admin Frontend

## Core Framework

| 패키지 | 용도 |
|---|---|
| react | UI 프레임워크 |
| react-dom | DOM 렌더링 |
| typescript | 정적 타입 검사 |
| vite | 빌드 도구 / 번들러 / 개발 서버 |

## Routing

| 패키지 | 용도 |
|---|---|
| react-router-dom | 클라이언트 사이드 라우팅 (v6) |

## State Management

| 패키지 | 용도 |
|---|---|
| @tanstack/react-query | 서버 상태 관리, 캐싱, 자동 재요청 |
| React Context + useReducer | 클라이언트 상태 관리 (Auth, Store, SSE) |

## HTTP Client

| 패키지 | 용도 |
|---|---|
| axios | HTTP 클라이언트 (인터셉터, 타임아웃 지원) |

## Styling

| 패키지 | 용도 |
|---|---|
| CSS Modules | 컴포넌트 스코프 스타일링 (Vite 내장 지원) |

## Testing

| 패키지 | 용도 |
|---|---|
| vitest | 테스트 러너 (Vite 네이티브) |
| @testing-library/react | 컴포넌트 테스트 |
| @testing-library/jest-dom | DOM 매처 확장 |
| @testing-library/user-event | 사용자 이벤트 시뮬레이션 |
| fast-check | Property-Based Testing (PBT-09) |
| msw | API 모킹 (Mock Service Worker) |
| jsdom | 테스트 환경 DOM |

## Code Quality

| 패키지 | 용도 |
|---|---|
| eslint | 코드 린팅 |
| @typescript-eslint/eslint-plugin | TypeScript ESLint 규칙 |
| @typescript-eslint/parser | TypeScript ESLint 파서 |
| eslint-plugin-react-hooks | React Hooks 린트 규칙 |
| prettier | 코드 포맷팅 |

## Drag & Drop (메뉴 순서 조정)

| 패키지 | 용도 |
|---|---|
| @dnd-kit/core | 드래그 앤 드롭 코어 |
| @dnd-kit/sortable | 정렬 가능한 리스트 |

## Version Pinning Strategy
- package.json에 모든 의존성 정확한 버전 고정
- package-lock.json 커밋 필수
- npm audit로 취약점 정기 스캔 (SECURITY-10)

## 기술 선택 근거

### Vite 선택 이유
- ESM 기반 빠른 HMR (개발 생산성)
- 빌드 속도 우수 (Rollup 기반)
- CSS Modules, TypeScript 네이티브 지원
- Vitest와 자연스러운 통합

### CSS Modules 선택 이유
- 컴포넌트별 스타일 스코핑 (클래스명 충돌 방지)
- 런타임 오버헤드 없음 (빌드 타임 처리)
- Vite 내장 지원 (추가 설정 불필요)
- 표준 CSS 문법 사용 (학습 비용 낮음)

### TanStack Query 선택 이유
- 서버 상태 캐싱으로 불필요한 API 재요청 방지
- 자동 재시도, 백그라운드 리페치
- 로딩/에러 상태 자동 관리
- SSE 이벤트로 인한 데이터 무효화(invalidation) 용이

### fast-check 선택 이유
- TypeScript/JavaScript 네이티브 PBT 프레임워크
- Vitest와 통합 용이
- 풍부한 Arbitrary 생성기
- 축소(shrinking) 지원으로 최소 반례 탐색
