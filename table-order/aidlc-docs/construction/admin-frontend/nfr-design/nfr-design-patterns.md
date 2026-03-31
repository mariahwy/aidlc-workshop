# NFR Design Patterns - Admin Frontend

## 1. 성능 패턴

### 1.1 코드 스플리팅 (Route-based Lazy Loading)
```
App.tsx
├── React.lazy(() => import('./pages/LoginPage'))
├── React.lazy(() => import('./pages/StoreSelectionPage'))
├── React.lazy(() => import('./pages/DashboardPage'))
├── React.lazy(() => import('./pages/TableManagementPage'))
├── React.lazy(() => import('./pages/MenuManagementPage'))
├── React.lazy(() => import('./pages/StoreManagementPage'))
└── React.lazy(() => import('./pages/StaffManagementPage'))
```
- 각 페이지 컴포넌트를 React.lazy로 지연 로드
- Suspense fallback으로 로딩 스피너 표시
- 초기 번들에는 LoginPage + 공통 컴포넌트만 포함
- Vite의 자동 청크 분리 활용

### 1.2 TanStack Query 캐싱 전략
| 데이터 | staleTime | gcTime | 근거 |
|---|---|---|---|
| 매장 목록 | 5분 | 30분 | 자주 변경되지 않음 |
| 테이블 목록 | 1분 | 10분 | 간헐적 변경 |
| 카테고리 목록 | 5분 | 30분 | 자주 변경되지 않음 |
| 메뉴 목록 | 2분 | 15분 | 간헐적 변경 |
| 주문 목록 | 0 (항상 stale) | 5분 | SSE로 실시간 업데이트 |
| 직원 목록 | 5분 | 30분 | 자주 변경되지 않음 |
| 과거 내역 | 10분 | 60분 | 변경 없음 (아카이브) |

### 1.3 SSE 이벤트 기반 캐시 무효화
```
SSE Event → QueryClient.invalidateQueries / setQueryData
─────────────────────────────────────────────────────────
new_order           → setQueryData(['orders', storeId])에 직접 추가
order_status_changed → setQueryData로 해당 주문 상태 업데이트
order_deleted       → setQueryData로 해당 주문 제거
table_session_completed → invalidateQueries(['orders', storeId])
```
- SSE 이벤트 수신 시 서버 재요청 없이 캐시 직접 업데이트 (optimistic)
- table_session_completed는 전체 무효화 (데이터 구조 변경이 큼)

### 1.4 번들 최적화
- Vite build.rollupOptions.output.manualChunks로 벤더 청크 분리
  - `vendor-react`: react, react-dom, react-router-dom
  - `vendor-query`: @tanstack/react-query
  - `vendor-dnd`: @dnd-kit/core, @dnd-kit/sortable
- Tree shaking으로 미사용 코드 제거
- CSS Modules는 빌드 타임에 처리 (런타임 오버헤드 없음)

### 1.5 리렌더링 최적화
- SSE 이벤트 핸들러에 useCallback 적용
- 테이블 카드 목록에 React.memo 적용 (props 변경 시만 리렌더)
- 대시보드 주문 데이터를 Map 구조로 관리 (O(1) 조회)
- useMemo로 파생 데이터 계산 (테이블별 총 주문액 등)

## 2. 보안 패턴

### 2.1 인증 인터셉터 패턴
```
API Request Flow:
─────────────────
Request → [Auth Interceptor] → Server
                │
                ├── JWT 토큰 자동 첨부 (Authorization: Bearer)
                └── 토큰 없으면 요청 차단

Response → [Error Interceptor] → Component
                │
                ├── 401 → 자동 로그아웃 (토큰 삭제 + /login 리다이렉트)
                ├── 403 → "권한이 없습니다" 토스트
                ├── 5xx → "서버 오류가 발생했습니다" 토스트
                └── Network Error → "네트워크 연결을 확인해주세요" 토스트
```

### 2.2 XSS 방지 패턴
- React의 기본 이스케이핑 활용 (JSX 내 자동 이스케이프)
- dangerouslySetInnerHTML 사용 금지 (ESLint 규칙으로 강제)
- 사용자 입력 데이터 렌더링 시 추가 sanitize 불필요 (React 기본 보호)
- URL 파라미터 사용 시 encodeURIComponent 적용

### 2.3 민감 데이터 보호
- JWT 토큰: localStorage 저장, 콘솔 출력 금지
- 비밀번호: 폼 state에만 존재, API 전송 후 즉시 클리어
- 에러 응답: 서버 상세 에러 숨김, 사용자에게 제네릭 메시지만 표시
- 프로덕션 빌드: 소스맵 비활성화, console.log 제거

### 2.4 환경 변수 관리
```
.env.development    → VITE_API_URL=http://localhost:8000
.env.production     → VITE_API_URL=https://api.example.com
```
- VITE_ 접두사로 클라이언트 노출 변수 명시
- 하드코딩된 URL/시크릿 금지 (ESLint 커스텀 규칙)

## 3. 신뢰성 패턴

### 3.1 SSE 재연결 + 폴링 폴백 패턴
```
SSE Connection State Machine:
─────────────────────────────
CONNECTED ──(error)──> RECONNECTING
    ^                       │
    │                  (retry, 3초 간격)
    │                       │
    └──(success)────────────┘
                            │
                       (5회 실패)
                            │
                            v
                      POLLING_FALLBACK
                    (30초 간격 GET 요청)
                            │
                       (수동 재연결 클릭)
                            │
                            v
                      RECONNECTING (리셋)
```
- 연결 끊김 → 3초 간격 자동 재연결 (최대 5회)
- 5회 실패 → "연결 끊김" 배너 + 수동 재연결 버튼 + 30초 폴링 전환
- 폴링 모드: `GET /admin/orders?store_id={store_id}` 30초 간격 호출
- 수동 재연결 성공 → SSE 모드 복귀, 폴링 중단

### 3.2 TanStack Query 재시도 패턴
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,                    // 3회 재시도
      retryDelay: (attempt) =>     // 지수 백오프
        Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 3,                    // 뮤테이션도 3회 재시도
      retryDelay: (attempt) =>
        Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});
```

### 3.3 페이지별 ErrorBoundary 패턴
```
App
├── GlobalErrorBoundary (최상위 폴백 - "앱 오류" 화면)
│   ├── Layout
│   │   ├── PageErrorBoundary (DashboardPage)
│   │   │   └── DashboardPage
│   │   ├── PageErrorBoundary (MenuManagementPage)
│   │   │   └── MenuManagementPage
│   │   ├── PageErrorBoundary (TableManagementPage)
│   │   │   └── TableManagementPage
│   │   └── ... (각 페이지별)
```
- 페이지별 ErrorBoundary: 해당 페이지만 에러 UI 표시, 다른 페이지 정상 동작
- 폴백 UI: "오류가 발생했습니다" + "다시 시도" 버튼
- GlobalErrorBoundary: 최후의 안전망 (Layout 자체 에러 시)

### 3.4 오프라인 감지 패턴
```
navigator.onLine 감지
─────────────────────
Online  → 정상 동작
Offline → 상단 배너 "네트워크 연결을 확인해주세요"
        → API 요청 일시 중단
        → 재연결 시 자동 리페치 (TanStack Query refetchOnReconnect)
```

## 4. 접근성 패턴

### 4.1 포커스 관리
- 모달 오픈 시: 모달 내 첫 포커스 가능 요소로 포커스 이동
- 모달 닫기 시: 트리거 요소로 포커스 복원
- 모달 내 Tab 키: 포커스 트랩 (모달 밖으로 이동 불가)
- Escape 키: 모달/드롭다운 닫기

### 4.2 키보드 네비게이션
- 사이드바 메뉴: 화살표 키로 이동, Enter로 선택
- 테이블 카드 그리드: Tab으로 카드 간 이동, Enter로 모달 오픈
- 폼: Tab으로 필드 이동, Enter로 제출
- 확인 팝업: Tab으로 버튼 이동, Enter로 실행, Escape로 취소

### 4.3 ARIA 속성
- 모달: role="dialog", aria-modal="true", aria-labelledby
- 토스트: role="alert", aria-live="polite"
- 로딩 스피너: aria-busy="true", aria-label="로딩 중"
- 사이드바: role="navigation", aria-label="메인 네비게이션"
- 폼 에러: aria-invalid="true", aria-describedby (에러 메시지 연결)
