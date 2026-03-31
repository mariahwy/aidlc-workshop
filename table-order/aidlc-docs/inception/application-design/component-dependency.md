# Component Dependencies

## Dependency Matrix

| 컴포넌트 | 의존 대상 |
|---|---|
| Customer App | Backend Customer API |
| Admin App | Backend Admin API, SSE 스트림 |
| customer_auth_router | AuthService, TableService |
| customer_menu_router | MenuService |
| customer_order_router | OrderService |
| admin_auth_router | AuthService |
| admin_order_router | OrderService, SSEService |
| admin_table_router | TableService |
| admin_menu_router | MenuService, ImageService |
| admin_store_router | StoreService |
| admin_staff_router | StaffService |
| admin_image_router | ImageService |
| AuthService | models, database, config (JWT) |
| OrderService | models, database, SSEService |
| TableService | models, database, OrderService (이력 이동) |
| MenuService | models, database |
| StoreService | models, database |
| StaffService | models, database, AuthService (비밀번호 해싱) |
| SSEService | (인메모리 이벤트 큐) |
| ImageService | AWS S3 (boto3), config |

## Data Flow

```
Customer App                          Admin App
     |                                     |
     v                                     v
Customer API Group                  Admin API Group
     |                                     |
     +----------+  +----------+  +---------+
                |  |          |  |
                v  v          v  v
            Service Layer (AuthService,
            OrderService, TableService,
            MenuService, StoreService,
            StaffService, SSEService,
            ImageService)
                    |          |
                    v          v
              PostgreSQL    AWS S3
              (SQLAlchemy)  (boto3)
```

## 통신 패턴
- **Frontend → Backend**: REST API (HTTP/HTTPS)
- **Backend → Frontend (실시간)**: SSE (Server-Sent Events)
- **Service → Service**: 동기 함수 호출 (FastAPI 내부)
- **Service → DB**: SQLAlchemy async session
- **Service → S3**: boto3 SDK
