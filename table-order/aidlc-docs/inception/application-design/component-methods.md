# Component Methods

> 참고: 상세 비즈니스 로직은 Functional Design (CONSTRUCTION) 단계에서 정의됩니다.

## 1. Backend - Customer API

### customer_auth_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| POST /customer/auth/login | {store_id, table_number, password} | {token, session_id} | 테이블 로그인 |

### customer_menu_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| GET /customer/menus | store_id (query) | MenuCategory[] | 카테고리별 메뉴 목록 조회 |

### customer_order_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| POST /customer/orders | {items[], table_session_id} | {order_id, order_number} | 주문 생성 |
| GET /customer/orders | table_session_id (query) | Order[] | 현재 세션 주문 내역 조회 |

## 2. Backend - Admin API

### admin_auth_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| POST /admin/auth/login | {store_id, username, password} | {token, role} | 관리자 로그인 |

### admin_order_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| GET /admin/orders/stream | store_id (query) | SSE stream | 실시간 주문 스트림 |
| GET /admin/orders | store_id, table_id? (query) | Order[] | 주문 목록 조회 |
| PATCH /admin/orders/{order_id}/status | {status} | Order | 주문 상태 변경 |
| DELETE /admin/orders/{order_id} | - | {success} | 주문 삭제 |

### admin_table_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| POST /admin/tables | {table_number, password} | Table | 테이블 초기 설정 |
| GET /admin/tables | store_id (query) | Table[] | 테이블 목록 조회 |
| POST /admin/tables/{table_id}/complete | - | {success} | 테이블 이용 완료 (세션 종료) |
| GET /admin/tables/{table_id}/history | date_from?, date_to? | OrderHistory[] | 과거 주문 내역 조회 |

### admin_menu_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| GET /admin/menus | store_id, category_id? (query) | MenuItem[] | 메뉴 목록 조회 |
| POST /admin/menus | {name, price, description, category_id, image_url} | MenuItem | 메뉴 등록 |
| PUT /admin/menus/{menu_id} | {name?, price?, description?, category_id?, image_url?} | MenuItem | 메뉴 수정 |
| DELETE /admin/menus/{menu_id} | - | {success} | 메뉴 삭제 |
| PATCH /admin/menus/reorder | {menu_ids[]} | {success} | 메뉴 순서 변경 |

### admin_store_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| GET /admin/stores | - | Store[] | 매장 목록 조회 |
| POST /admin/stores | {name, address, ...} | Store | 매장 등록 |
| PUT /admin/stores/{store_id} | {name?, address?, ...} | Store | 매장 수정 |
| DELETE /admin/stores/{store_id} | - | {success} | 매장 삭제 |

### admin_staff_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| GET /admin/staff | store_id (query) | User[] | 직원 목록 조회 |
| POST /admin/staff | {username, password, store_id} | User | 직원 계정 생성 |
| PUT /admin/staff/{user_id} | {username?, password?} | User | 직원 계정 수정 |
| DELETE /admin/staff/{user_id} | - | {success} | 직원 계정 삭제 |

### admin_image_router
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| POST /admin/images/upload | file (multipart) | {image_url} | S3 이미지 업로드 |

## 3. Backend - Core

### auth_dependency
| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| get_current_user | JWT token (header) | User | 현재 인증된 사용자 반환 |
| require_role(role) | User | User | 역할 검증 (owner/staff) |
| get_current_table_session | JWT token (header) | TableSession | 현재 테이블 세션 반환 |
