// Domain Types

export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  store_id: string;
  username: string;
  role: 'owner' | 'staff';
  created_at: string;
}

export interface Table {
  id: string;
  store_id: string;
  table_number: number;
  created_at: string;
}

export interface TableSession {
  id: string;
  table_id: string;
  store_id: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  store_id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  store_id: string;
  table_id: string;
  table_session_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderHistory {
  id: string;
  order_id: string;
  store_id: string;
  table_id: string;
  table_session_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  items_snapshot: OrderItem[];
  ordered_at: string;
  archived_at: string;
}

// API Request Types

export interface LoginRequest {
  store_id: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'owner' | 'staff';
}

export interface CreateTableRequest {
  table_number: number;
  password: string;
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  description?: string;
  category_id: string;
  image_url?: string;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  description?: string;
  category_id?: string;
  image_url?: string;
}

export interface CreateCategoryRequest {
  name: string;
  store_id: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface ReorderRequest {
  menu_ids: string[];
}

export interface CategoryReorderRequest {
  category_ids: string[];
}

export interface CreateStoreRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  address?: string;
  phone?: string;
}

export interface CreateStaffRequest {
  username: string;
  password: string;
  store_id: string;
}

export interface UpdateStaffRequest {
  username?: string;
  password?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface ImageUploadResponse {
  image_url: string;
}

// SSE Event Types

export interface SSENewOrderEvent {
  type: 'new_order';
  data: Order;
}

export interface SSEOrderStatusChangedEvent {
  type: 'order_status_changed';
  data: { order_id: string; new_status: OrderStatus };
}

export interface SSEOrderDeletedEvent {
  type: 'order_deleted';
  data: { order_id: string; table_id: string };
}

export interface SSETableSessionCompletedEvent {
  type: 'table_session_completed';
  data: { table_id: string };
}

export type SSEEvent =
  | SSENewOrderEvent
  | SSEOrderStatusChangedEvent
  | SSEOrderDeletedEvent
  | SSETableSessionCompletedEvent;

// Auth Context Types

export interface AuthUser {
  user_id: string;
  store_id: string;
  role: 'owner' | 'staff';
  username: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: AuthUser } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { token: string; user: AuthUser } }
  | { type: 'SET_LOADING'; payload: boolean };

// Store Context Types

export interface StoreState {
  currentStoreId: string | null;
  stores: Store[];
  isLoading: boolean;
}

export type StoreAction =
  | { type: 'SET_STORES'; payload: Store[] }
  | { type: 'SELECT_STORE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };
