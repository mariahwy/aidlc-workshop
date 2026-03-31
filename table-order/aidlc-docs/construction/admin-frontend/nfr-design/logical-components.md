# Logical Components - Admin Frontend

## 1. 논리적 컴포넌트 개요

```
+----------------------------------------------------------+
|                      Admin Frontend                       |
|                                                          |
|  +-----------+  +-------------+  +-------------------+   |
|  | Auth      |  | API         |  | SSE               |   |
|  | Module    |  | Module      |  | Module            |   |
|  |           |  |             |  |                   |   |
|  | - Provider|  | - Client    |  | - Client          |   |
|  | - Guard   |  | - Intercept |  | - Reconnect       |   |
|  | - Session |  | - Query     |  | - Polling Fallback|   |
|  +-----------+  +-------------+  +-------------------+   |
|                                                          |
|  +-----------+  +-------------+  +-------------------+   |
|  | Error     |  | Notification|  | Store             |   |
|  | Module    |  | Module      |  | Module            |   |
|  |           |  |             |  |                   |   |
|  | - Boundary|  | - Toast     |  | - Provider        |   |
|  | - Handler |  | - Sound     |  | - Selector        |   |
|  | - Offline |  | - Confirm   |  | - Switcher        |   |
|  +-----------+  +-------------+  +-------------------+   |
+----------------------------------------------------------+
```

## 2. Auth Module (인증 모듈)

### 2.1 AuthProvider
- **책임**: 인증 상태 관리, 세션 복원, 로그아웃
- **위치**: 앱 최상위 Context
- **상태**: token, user(id, store_id, role, username), isAuthenticated, isLoading
- **동작**:
  - 앱 로드 시 localStorage에서 토큰 복원
  - JWT 디코딩하여 만료 확인
  - 만료 시 자동 로그아웃
  - login(token, role) / logout() 메서드 제공

### 2.2 RoleGuard
- **책임**: 역할 기반 라우트 보호
- **위치**: 보호 대상 라우트 래퍼
- **동작**:
  - requiredRole prop으로 필요 역할 지정
  - 현재 사용자 역할 확인
  - 권한 없으면 /dashboard로 리다이렉트
  - 미인증이면 /login으로 리다이렉트

### 2.3 SessionManager
- **책임**: JWT 만료 타이머 관리
- **위치**: AuthProvider 내부
- **동작**:
  - 로그인 시 만료 시간까지 타이머 설정
  - 만료 5분 전 경고 (선택)
  - 만료 시 자동 로그아웃

## 3. API Module (API 통신 모듈)

### 3.1 APIClient (axios 인스턴스)
- **책임**: HTTP 통신, 인터셉터 관리
- **설정**:
  - baseURL: 환경 변수 (VITE_API_URL)
  - timeout: 10000ms
  - 요청 인터셉터: JWT 토큰 자동 첨부
  - 응답 인터셉터: 401 자동 로그아웃, 에러 변환

### 3.2 QueryClientProvider
- **책임**: TanStack Query 전역 설정
- **설정**:
  - queries: retry=3, 지수 백오프, staleTime=0
  - mutations: retry=3, 지수 백오프
  - refetchOnWindowFocus: false

### 3.3 API Hooks (커스텀 훅)
- **패턴**: 각 API 엔드포인트별 useQuery/useMutation 훅
- **예시**:
  - `useOrders(storeId)` → GET /admin/orders
  - `useUpdateOrderStatus()` → PATCH /admin/orders/{id}/status
  - `useDeleteOrder()` → DELETE /admin/orders/{id}
  - `useTables(storeId)` → GET /admin/tables
  - `useMenuItems(storeId, categoryId)` → GET /admin/menus
  - `useStores()` → GET /admin/stores
  - `useStaff(storeId)` → GET /admin/staff

## 4. SSE Module (실시간 통신 모듈)

### 4.1 SSEClient
- **책임**: EventSource 연결 관리, 이벤트 디스패치
- **상태 머신**: DISCONNECTED → CONNECTING → CONNECTED → RECONNECTING → POLLING_FALLBACK
- **설정**:
  - reconnectInterval: 3000ms
  - maxReconnectAttempts: 5
  - pollingInterval: 30000ms

### 4.2 SSEProvider
- **책임**: SSE 상태를 React Context로 제공
- **위치**: DashboardPage 상위
- **제공 값**: isConnected, connectionMode('sse'|'polling'), reconnect()
- **동작**:
  - 마운트 시 SSE 연결 시작
  - 이벤트 수신 → QueryClient 캐시 직접 업데이트
  - 언마운트 시 연결 종료
  - 매장 전환 시 재연결

### 4.3 PollingFallback
- **책임**: SSE 실패 시 폴링 모드 운영
- **동작**:
  - 30초 간격 GET /admin/orders 호출
  - 이전 데이터와 diff하여 변경분만 UI 업데이트
  - SSE 재연결 성공 시 폴링 중단

## 5. Error Module (에러 처리 모듈)

### 5.1 GlobalErrorBoundary
- **책임**: 앱 전체 최후의 안전망
- **위치**: App 최상위
- **폴백 UI**: "앱에 오류가 발생했습니다" + "새로고침" 버튼

### 5.2 PageErrorBoundary
- **책임**: 페이지 단위 에러 격리
- **위치**: 각 페이지 컴포넌트 래퍼
- **폴백 UI**: "이 페이지에 오류가 발생했습니다" + "다시 시도" 버튼
- **동작**: "다시 시도" 클릭 시 resetErrorBoundary 호출

### 5.3 OfflineDetector
- **책임**: 네트워크 상태 감지
- **동작**:
  - navigator.onLine + online/offline 이벤트 리스너
  - 오프라인 시 상단 배너 표시
  - 온라인 복귀 시 배너 제거 + TanStack Query refetch 트리거

## 6. Notification Module (알림 모듈)

### 6.1 ToastProvider
- **책임**: 토스트 알림 관리
- **위치**: App 레벨 Context
- **API**: showToast({ message, type, duration })
- **동작**:
  - 토스트 큐 관리 (최대 3개 동시 표시)
  - 자동 닫힘 (기본 3초)
  - 수동 닫기 버튼

### 6.2 SoundManager
- **책임**: 신규 주문 사운드 알림
- **동작**:
  - AudioContext 기반 사운드 재생
  - 브라우저 autoplay 정책 대응 (첫 인터랙션 후 활성화)
  - on/off 토글 상태 localStorage 저장
  - SSE new_order 이벤트 시 사운드 재생

### 6.3 ConfirmDialog
- **책임**: 파괴적 작업 확인 팝업
- **API**: confirm({ title, message, onConfirm, isDangerous })
- **동작**:
  - 모달 오버레이로 표시
  - 포커스 트랩 적용
  - Escape 키로 취소
  - isDangerous=true 시 확인 버튼 빨간색

## 7. Store Module (매장 관리 모듈)

### 7.1 StoreProvider
- **책임**: 현재 선택된 매장 상태 관리
- **위치**: AuthProvider 하위
- **상태**: currentStoreId, stores[]
- **동작**:
  - 소유자: 매장 목록 로드 → 선택 → currentStoreId 설정
  - 직원: 로그인 시 store_id 자동 설정

### 7.2 StoreSwitcher
- **책임**: 매장 전환 UI (소유자 전용)
- **위치**: Header 내 드롭다운
- **동작**:
  - 매장 선택 → StoreContext 업데이트
  - SSE 재연결 (새 store_id)
  - TanStack Query 캐시 전체 무효화
  - 대시보드 데이터 재로드

## 8. 컴포넌트 간 통신 흐름

```
[SSE Event] ──> SSEProvider ──> QueryClient.setQueryData
                                      │
                                      v
                              [TanStack Query Cache]
                                      │
                                      v
                              [useQuery hooks] ──> [Components re-render]

[User Action] ──> Component ──> useMutation ──> API Request
                                      │
                                      v
                              [onSuccess callback]
                                      │
                              ┌───────┴───────┐
                              v               v
                    invalidateQueries    showToast
```

## 9. 디렉토리 구조 (논리적 모듈 매핑)

```
admin-frontend/src/
├── api/                    # API Module
│   ├── client.ts           # axios 인스턴스 + 인터셉터
│   ├── hooks/              # useQuery/useMutation 커스텀 훅
│   │   ├── useOrders.ts
│   │   ├── useTables.ts
│   │   ├── useMenus.ts
│   │   ├── useCategories.ts
│   │   ├── useStores.ts
│   │   ├── useStaff.ts
│   │   └── useImages.ts
│   └── types.ts            # API 요청/응답 타입
├── contexts/               # Context Providers
│   ├── AuthContext.tsx      # Auth Module
│   ├── StoreContext.tsx     # Store Module
│   └── SSEContext.tsx       # SSE Module
├── components/             # 공통 컴포넌트
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── RoleGuard.tsx       # Auth Module
│   ├── ConfirmDialog.tsx   # Notification Module
│   ├── Toast.tsx           # Notification Module
│   ├── ImageUploader.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx   # Error Module
│   └── OfflineBanner.tsx   # Error Module
├── pages/                  # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── StoreSelectionPage.tsx
│   ├── DashboardPage.tsx
│   ├── TableManagementPage.tsx
│   ├── MenuManagementPage.tsx
│   ├── StoreManagementPage.tsx
│   └── StaffManagementPage.tsx
├── hooks/                  # 공통 커스텀 훅
│   ├── useSound.ts         # Notification Module
│   └── useOffline.ts       # Error Module
├── utils/                  # 유틸리티
│   ├── format.ts           # 금액 포맷팅 등
│   └── validation.ts       # 폼 검증 함수
├── types/                  # 공통 타입 정의
│   └── index.ts
├── App.tsx                 # 라우팅 + Provider 조합
├── main.tsx                # 엔트리 포인트
└── vite-env.d.ts
```
