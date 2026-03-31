# Domain Entities - Backend API

## Entity Relationship Overview

```
Store 1──N User (owner/staff)
Store 1──N Table
Store 1──N Category
Category 1──N MenuItem
Table 1──N TableSession
TableSession 1──N Order
Order 1──N OrderItem
OrderItem N──1 MenuItem
TableSession 1──N OrderHistory
```

## Entities

### Store (매장)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 매장 고유 ID |
| name | String(100) | NOT NULL | 매장명 |
| address | String(255) | NULL | 매장 주소 |
| phone | String(20) | NULL | 연락처 |
| deleted_at | DateTime | NULL | 소프트 삭제 시각 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |
| updated_at | DateTime | NOT NULL, DEFAULT NOW | 수정 시각 |

### User (관리자/직원)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 사용자 고유 ID |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| username | String(50) | NOT NULL, UNIQUE(store_id, username) | 사용자명 |
| password_hash | String(255) | NOT NULL | bcrypt 해시 비밀번호 |
| role | Enum(owner, staff) | NOT NULL | 역할 |
| deleted_at | DateTime | NULL | 소프트 삭제 시각 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

### Table (테이블)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 테이블 고유 ID |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| table_number | Integer | NOT NULL, UNIQUE(store_id, table_number) | 테이블 번호 |
| password_hash | String(255) | NOT NULL | bcrypt 해시 비밀번호 |
| deleted_at | DateTime | NULL | 소프트 삭제 시각 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

### TableSession (테이블 세션)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 세션 고유 ID |
| table_id | UUID | FK(Table), NOT NULL | 테이블 |
| store_id | UUID | FK(Store), NOT NULL | 매장 |
| started_at | DateTime | NOT NULL, DEFAULT NOW | 세션 시작 시각 |
| ended_at | DateTime | NULL | 세션 종료 시각 (이용 완료) |
| is_active | Boolean | NOT NULL, DEFAULT TRUE | 활성 세션 여부 |

### Category (메뉴 카테고리)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 카테고리 고유 ID |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| name | String(50) | NOT NULL | 카테고리명 |
| sort_order | Integer | NOT NULL, DEFAULT 0 | 정렬 순서 |
| deleted_at | DateTime | NULL | 소프트 삭제 시각 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

### MenuItem (메뉴 항목)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 메뉴 고유 ID |
| category_id | UUID | FK(Category), NOT NULL | 소속 카테고리 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| name | String(100) | NOT NULL | 메뉴명 |
| price | Integer | NOT NULL, >= 0 | 가격 (원) |
| description | Text | NULL | 메뉴 설명 |
| image_url | String(500) | NULL | S3 이미지 URL |
| sort_order | Integer | NOT NULL, DEFAULT 0 | 정렬 순서 |
| deleted_at | DateTime | NULL | 소프트 삭제 시각 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

### Order (주문)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 주문 고유 ID |
| store_id | UUID | FK(Store), NOT NULL | 매장 |
| table_id | UUID | FK(Table), NOT NULL | 테이블 |
| table_session_id | UUID | FK(TableSession), NOT NULL | 테이블 세션 |
| order_number | String(20) | NOT NULL, UNIQUE | 주문 번호 (표시용) |
| status | Enum(pending, preparing, completed) | NOT NULL, DEFAULT pending | 주문 상태 |
| total_amount | Integer | NOT NULL, >= 0 | 총 주문 금액 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 주문 시각 |
| updated_at | DateTime | NOT NULL, DEFAULT NOW | 수정 시각 |

### OrderItem (주문 항목)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 주문 항목 고유 ID |
| order_id | UUID | FK(Order), NOT NULL | 소속 주문 |
| menu_item_id | UUID | FK(MenuItem), NOT NULL | 메뉴 항목 |
| menu_name | String(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | Integer | NOT NULL, >= 1 | 수량 |
| unit_price | Integer | NOT NULL, >= 0 | 주문 시점 단가 (스냅샷) |
| subtotal | Integer | NOT NULL, >= 0 | 소계 (quantity * unit_price) |

### OrderHistory (과거 주문 이력)
| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 이력 고유 ID |
| order_id | UUID | NOT NULL | 원본 주문 ID |
| store_id | UUID | NOT NULL | 매장 |
| table_id | UUID | NOT NULL | 테이블 |
| table_session_id | UUID | NOT NULL | 테이블 세션 |
| order_number | String(20) | NOT NULL | 주문 번호 |
| status | String(20) | NOT NULL | 주문 상태 |
| total_amount | Integer | NOT NULL | 총 금액 |
| items_snapshot | JSON | NOT NULL | 주문 항목 스냅샷 |
| ordered_at | DateTime | NOT NULL | 원본 주문 시각 |
| archived_at | DateTime | NOT NULL, DEFAULT NOW | 이력 저장 시각 |
