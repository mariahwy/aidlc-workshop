# Frontend Components - Admin Frontend

## 1. 컴포넌트 계층 구조

```
App
├── AuthProvider (Context)
│   ├── LoginPage
│   ├── StoreProvider (Context)
│   │   ├── StoreSelectionPage (소유자 전용)
│   │   ├── RoleGuard
│   │   │   ├── Layout
│   │   │   │   ├── Sidebar
│   │   │   │   ├── Header (매장 전환 드롭다운)
│   │   │   │   └── MainContent
│   │   │   │       ├── SSEProvider (Context)
│   │   │   │       │   └── DashboardPage
│   │   │   │       │       ├── TableCard (반복)
│   │   │   │       │       └── TableDetailModal
│   │   │   │       │           ├── OrderList
│   │   │   │       │           │   └── OrderCard (반복)
│   │   │   │       │           ├── OrderHistoryPanel
│   │   │   │       │           └── SessionActions
│   │   │   │       ├── TableManagementPage
│   │   │   │       │   ├── TableList
│   │   │   │       │   └── TableCreateForm
│   │   │   │       ├── MenuManagementPage (소유자)
│   │   │   │       │   ├── CategoryPanel
│   │   │   │       │   │   ├── CategoryList
│   │   │   │       │   │   └── CategoryForm
│   │   │   │       │   ├── MenuList
│   │   │   │       │   ├── MenuForm
│   │   │   │       │   └── ImageUploader
│   │   │   │       ├── StoreManagementPage (소유자)
│   │   │   │       │   ├── StoreList
│   │   │   │       │   └── StoreForm
│   │   │   │       └── StaffManagementPage (소유자)
│   │   │   │           ├── StaffList
│   │   │   │           └── StaffForm
│   │   │   └── (권한 없는 접근 → /dashboard 리다이렉트)
│   │   └── ...
│   └── (미인증 → /login 리다이렉트)
└── 공통 컴포넌트
    ├── ConfirmDialog
    ├── Toast
    ├── LoadingSpinner
    └── ErrorBoundary
```

## 2. Context 정의

### 2.1 AuthContext
```typescript
interface AuthState {
  token: string | null;
  user: {
    user_id: string;
    store_id: string;
    role: 'owner' | 'staff';
    username: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; role: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: AuthState['user'] }
  | { type: 'SET_LOADING'; payload: boolean };
```

### 2.2 StoreContext
```typescript
interface StoreState {
  currentStoreId: string | null;
  stores: Store[];
  isLoading: boolean;
}

type StoreAction =
  | { type: 'SET_STORES'; payload: Store[] }
  | { type: 'SELECT_STORE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };
```

### 2.3 SSEContext
```typescript
interface SSEState {
  isConnected: boolean;
  reconnectCount: number;
  lastEvent: SSEEvent | null;
}
```

## 3. 페이지 컴포넌트 상세

### 3.1 LoginPage
- **라우트**: `/login`
- **역할**: 모든 사용자
- **Props**: 없음
- **State**:
  - `formData: { store_id: string; username: string; password: string }`
  - `error: string | null`
  - `isSubmitting: boolean`
- **API**: `POST /admin/auth/login`
- **인터랙션 플로우**:
  1. 폼 입력 → 실시간 검증
  2. 로그인 버튼 클릭 → API 호출
  3. 성공 → AuthContext 업데이트 → 역할별 리다이렉트
  4. 실패 → 에러 메시지 표시

### 3.2 StoreSelectionPage (소유자 전용)
- **라우트**: `/stores`
- **역할**: owner
- **Props**: 없음
- **State**:
  - `stores: Store[]`
  - `isLoading: boolean`
- **API**: `GET /admin/stores`
- **인터랙션 플로우**:
  1. 마운트 시 매장 목록 조회
  2. 매장 카드 클릭 → StoreContext에 store_id 설정 → /dashboard 이동

### 3.3 DashboardPage
- **라우트**: `/dashboard`
- **역할**: owner, staff
- **Props**: 없음
- **State**:
  - `orders: Map<string, Order[]>` (table_id → 주문 목록)
  - `tables: Map<string, Table>` (table_id → 테이블 정보)
  - `selectedTableId: string | null`
  - `isModalOpen: boolean`
  - `soundEnabled: boolean`
- **API**:
  - `GET /admin/orders?store_id={store_id}`
  - `GET /admin/orders/stream?store_id={store_id}` (SSE)
  - `GET /admin/tables?store_id={store_id}`
- **인터랙션 플로우**:
  1. 마운트 → 주문 + 테이블 데이터 로드 + SSE 연결
  2. SSE 이벤트 → 실시간 UI 업데이트
  3. 테이블 카드 클릭 → TableDetailModal 오픈
  4. 사운드 토글 → soundEnabled 상태 변경

### 3.4 TableDetailModal
- **트리거**: DashboardPage에서 테이블 카드 클릭
- **역할**: owner, staff
- **Props**:
  - `tableId: string`
  - `tableName: string`
  - `orders: Order[]`
  - `isOpen: boolean`
  - `onClose: () => void`
- **State**:
  - `activeTab: 'orders' | 'history'`
  - `historyData: OrderHistory[]`
  - `historyDateFilter: { from: string; to: string }`
- **API**:
  - `PATCH /admin/orders/{order_id}/status`
  - `DELETE /admin/orders/{order_id}`
  - `POST /admin/tables/{table_id}/complete`
  - `GET /admin/tables/{table_id}/history`
- **인터랙션 플로우**:
  1. 주문 탭: 현재 주문 목록 표시, 상태 변경/삭제 가능
  2. 과거 내역 탭: 날짜 필터 + 과거 주문 목록
  3. 이용 완료 버튼 → 확인 팝업 → 세션 종료
  4. 닫기 버튼 → 모달 닫기

### 3.5 TableManagementPage
- **라우트**: `/tables`
- **역할**: owner, staff
- **Props**: 없음
- **State**:
  - `tables: Table[]`
  - `isCreateFormOpen: boolean`
  - `formData: { table_number: number; password: string }`
  - `isLoading: boolean`
- **API**:
  - `GET /admin/tables?store_id={store_id}`
  - `POST /admin/tables`
- **인터랙션 플로우**:
  1. 마운트 → 테이블 목록 조회
  2. 테이블 추가 버튼 → 폼 표시
  3. 폼 입력 → 검증 → API 호출 → 목록 갱신

### 3.6 MenuManagementPage (소유자 전용)
- **라우트**: `/menus`
- **역할**: owner
- **Props**: 없음
- **State**:
  - `categories: Category[]`
  - `selectedCategoryId: string | null`
  - `menuItems: MenuItem[]`
  - `isMenuFormOpen: boolean`
  - `editingMenuItem: MenuItem | null`
  - `isCategoryFormOpen: boolean`
  - `editingCategory: Category | null`
- **API**:
  - `GET /admin/categories?store_id={store_id}`
  - `POST/PUT/DELETE /admin/categories/{category_id}`
  - `PATCH /admin/categories/reorder`
  - `GET /admin/menus?store_id={store_id}&category_id={category_id}`
  - `POST/PUT/DELETE /admin/menus/{menu_id}`
  - `PATCH /admin/menus/reorder`
  - `POST /admin/images/upload`
- **인터랙션 플로우**:
  1. 좌측: 카테고리 패널 (목록 + CRUD)
  2. 우측: 선택된 카테고리의 메뉴 목록
  3. 메뉴 추가/수정 → MenuForm 모달
  4. 이미지 업로드 → ImageUploader 컴포넌트
  5. 순서 변경 → 드래그 앤 드롭

### 3.7 StoreManagementPage (소유자 전용)
- **라우트**: `/stores/manage`
- **역할**: owner
- **Props**: 없음
- **State**:
  - `stores: Store[]`
  - `isFormOpen: boolean`
  - `editingStore: Store | null`
- **API**:
  - `GET /admin/stores`
  - `POST/PUT/DELETE /admin/stores/{store_id}`
- **인터랙션 플로우**:
  1. 매장 목록 표시
  2. 매장 추가/수정 → StoreForm 모달
  3. 매장 삭제 → 확인 팝업

### 3.8 StaffManagementPage (소유자 전용)
- **라우트**: `/staff`
- **역할**: owner
- **Props**: 없음
- **State**:
  - `staffList: User[]`
  - `isFormOpen: boolean`
  - `editingStaff: User | null`
- **API**:
  - `GET /admin/staff?store_id={store_id}`
  - `POST/PUT/DELETE /admin/staff/{user_id}`
- **인터랙션 플로우**:
  1. 직원 목록 표시
  2. 직원 추가/수정 → StaffForm 모달
  3. 직원 삭제 → 확인 팝업

## 4. 공통 컴포넌트

### 4.1 Layout
- **Props**: `children: ReactNode`
- **구성**: Sidebar + Header + MainContent
- **반응형**: 모바일 햄버거 메뉴, 데스크톱 고정 사이드바

### 4.2 Sidebar
- **Props**: `role: 'owner' | 'staff'`
- **메뉴 항목**:
  - 대시보드 (owner, staff)
  - 테이블 관리 (owner, staff)
  - 메뉴 관리 (owner)
  - 매장 관리 (owner)
  - 직원 관리 (owner)
  - 로그아웃 (owner, staff)

### 4.3 Header
- **Props**: `storeName: string; role: string; username: string`
- **구성**: 매장명 표시, 매장 전환 드롭다운(소유자), 사용자 정보

### 4.4 ConfirmDialog
- **Props**:
  - `isOpen: boolean`
  - `title: string`
  - `message: string`
  - `onConfirm: () => void`
  - `onCancel: () => void`
  - `confirmLabel?: string`
  - `isDangerous?: boolean`

### 4.5 Toast
- **Props**:
  - `message: string`
  - `type: 'success' | 'error' | 'info'`
  - `duration?: number` (기본 3000ms)

### 4.6 ImageUploader
- **Props**:
  - `currentImageUrl?: string`
  - `onUploadComplete: (url: string) => void`
  - `onError: (message: string) => void`
- **검증**: 파일 타입(JPEG/PNG/WebP), 크기(5MB 이하)
- **기능**: 미리보기, 프로그레스 바, 에러 표시

## 5. API Client 설계

### 5.1 APIClient
```typescript
// 기본 설정
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// 요청 인터셉터: JWT 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 401 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 삭제 + 로그인 리다이렉트
    }
    return Promise.reject(error);
  }
);
```

### 5.2 SSEClient
```typescript
class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectCount = 0;
  private maxReconnect = 5;
  private reconnectInterval = 3000;

  connect(storeId: string, handlers: SSEHandlers): void;
  disconnect(): void;
  private handleReconnect(): void;
}

interface SSEHandlers {
  onNewOrder: (order: Order) => void;
  onOrderStatusChanged: (data: { order_id: string; new_status: string }) => void;
  onOrderDeleted: (data: { order_id: string; table_id: string }) => void;
  onTableSessionCompleted: (data: { table_id: string }) => void;
  onConnectionError: () => void;
}
```

## 6. API 연동 매핑

| 컴포넌트 | Backend API 엔드포인트 | 스토리 |
|---|---|---|
| LoginPage | POST /admin/auth/login | US-A01 |
| StoreSelectionPage | GET /admin/stores | US-A05 |
| DashboardPage | GET /admin/orders, GET /admin/tables | US-A02 |
| DashboardPage (SSE) | GET /admin/orders/stream | US-A02 |
| TableDetailModal | PATCH /admin/orders/{id}/status | US-A02 |
| TableDetailModal | DELETE /admin/orders/{id} | US-A03 |
| TableDetailModal | POST /admin/tables/{id}/complete | US-A03 |
| TableDetailModal | GET /admin/tables/{id}/history | US-A03 |
| TableManagementPage | GET/POST /admin/tables | US-A03 |
| MenuManagementPage | GET/POST/PUT/DELETE /admin/menus | US-A04 |
| MenuManagementPage | PATCH /admin/menus/reorder | US-A04 |
| MenuManagementPage | GET/POST/PUT/DELETE /admin/categories | US-A04 |
| ImageUploader | POST /admin/images/upload | US-S01 |
| StoreManagementPage | GET/POST/PUT/DELETE /admin/stores | US-A05 |
| StaffManagementPage | GET/POST/PUT/DELETE /admin/staff | US-A06 |
| Header (매장 전환) | GET /admin/stores | US-A05 |
