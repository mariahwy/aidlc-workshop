# Business Logic Model - Admin Frontend

## 1. 인증 로직

### 1.1 관리자 로그인 플로우
1. 사용자가 매장 식별자(store_id), 사용자명, 비밀번호 입력
2. `POST /admin/auth/login` API 호출
3. 성공 시:
   - JWT 토큰 + role 수신
   - 토큰을 localStorage에 저장
   - role이 owner인 경우 → 매장 선택 화면으로 이동
   - role이 staff인 경우 → 로그인 시 사용한 store_id의 대시보드로 바로 이동
4. 실패 시:
   - 에러 메시지 표시 (잘못된 인증 정보 / 계정 잠금)
   - 입력 폼 유지

### 1.2 세션 관리
1. 앱 로드 시 localStorage에서 JWT 토큰 확인
2. 토큰 존재 시 → JWT 디코딩하여 만료 시간 확인
3. 만료 전 → 인증 상태 복원, 대시보드로 이동
4. 만료 후 → 토큰 삭제, 로그인 화면으로 리다이렉트
5. API 요청 시 401 응답 → 자동 로그아웃 처리

### 1.3 매장 선택 (소유자 전용)
1. 소유자 로그인 성공 후 `GET /admin/stores`
 호출하여 매장 목록 조회
2. 매장 목록 화면에서 매장 선택
3. 선택된 store_id를 Context에 저장
4. 대시보드로 이동
5. 헤더에 매장 전환 드롭다운 제공 (소유자만)
6. 직원은 로그인 시 사용한 store_id로 자동 진입 (매장 선택 화면 스킵)

## 2. 대시보드 (실시간 주문 모니터링) 로직

### 2.1 초기 데이터 로드
1. 대시보드 진입 시 `GET /admin/orders?store_id={store_id}` 호출
2. 응답 데이터를 테이블별로 그룹핑
3. 활성 주문이 있는 테이블만 카드로 표시 (동적)
4. 각 카드에 테이블 번호, 총 주문액, 최신 주문 미리보기 표시

### 2.2 SSE 실시간 업데이트
1. 대시보드 마운트 시 `GET /admin/orders/stream?store_id={store_id}` SSE 연결
2. 이벤트 타입별 처리:
   - `new_order`: 해당 테이블 카드에 주문 추가, 카드 없으면 새 카드 생성, 사운드 알림 재생, 카드 하이라이트 애니메이션
   - `order_status_changed`: 해당 주문의 상태 UI 업데이트
   - `order_deleted`: 해당 주문 카드에서 제거, 총 주문액 재계산, 주문 0건이면 카드 제거
   - `table_session_completed`: 해당 테이블 카드 제거 (주문 0건 리셋)
3. SSE 연결 끊김 시 자동 재연결 (3초 간격, 최대 5회)
4. 대시보드 언마운트 시 SSE 연결 종료

### 2.3 사운드 알림
1. 신규 주문 도착 시 알림 사운드 재생
2. 사운드 on/off 토글 버튼 제공 (기본: on)
3. 브라우저 autoplay 정책 대응: 첫 사용자 인터랙션 후 AudioContext 활성화

### 2.4 테이블 카드 인터랙션
1. 카드 클릭 → TableDetailModal 오픈
2. 모달에서 해당 테이블의 전체 주문 목록 표시
3. 각 주문별 메뉴 항목, 수량, 금액, 상태 표시
4. 주문 상태 변경 버튼 (pending → preparing → completed, 역방향도 허용)
5. 주문 삭제 버튼 → 확인 팝업 → 삭제 실행
6. 이용 완료 버튼 → 확인 팝업 → 세션 종료 실행
7. 과거 내역 버튼 → 과거 주문 목록 표시

## 3. 테이블 관리 로직

### 3.1 테이블 목록 조회
1. `GET /admin/tables?store_id={store_id}` 호출
2. 테이블 번호 순으로 정렬하여 목록 표시
3. 각 테이블에 활성 세션 여부 표시

### 3.2 테이블 초기 설정
1. 테이블 번호 + 비밀번호 입력 폼
2. 입력 검증: 테이블 번호(양의 정수, 매장 내 고유), 비밀번호(최소 4자)
3. `POST /admin/tables` API 호출
4. 성공 시 목록 갱신, 실패 시 에러 메시지

### 3.3 주문 삭제
1. 삭제 버튼 클릭 → 확인 팝업 표시
2. 확인 시 `DELETE /admin/orders/{order_id}` 호출
3. 성공 시 주문 목록에서 제거, 총 주문액 재계산
4. 실패 시 에러 메시지 표시

### 3.4 이용 완료 (세션 종료)
1. 이용 완료 버튼 클릭 → 확인 팝업 표시
2. 확인 시 `POST /admin/tables/{table_id}/complete` 호출
3. 성공 시 해당 테이블 카드 제거 (대시보드), 주문 목록 초기화
4. 실패 시 에러 메시지 표시

### 3.5 과거 내역 조회
1. `GET /admin/tables/{table_id}/history` 호출 (date_from, date_to 선택)
2. 시간 역순으로 과거 주문 목록 표시
3. 각 주문: 주문 번호, 시각, 메뉴 목록(items_snapshot), 총 금액, 이용 완료 시각
4. 날짜 필터 변경 시 재조회
5. 닫기 버튼으로 대시보드 복귀

## 4. 메뉴 관리 로직

### 4.1 카테고리 관리
1. `GET /admin/categories?store_id={store_id}` 로 카테고리 목록 조회
2. 카테고리 생성: 이름 입력 → `POST /admin/categories`
3. 카테고리 수정: 이름 변경 → `PUT /admin/categories/{category_id}`
4. 카테고리 삭제: 확인 팝업 → `DELETE /admin/categories/{category_id}`
5. 카테고리 순서 조정: 드래그 또는 버튼 → `PATCH /admin/categories/reorder`

### 4.2 메뉴 항목 관리
1. 카테고리 선택 시 해당 카테고리의 메뉴 목록 조회
2. `GET /admin/menus?store_id={store_id}&category_id={category_id}`
3. 메뉴 등록: 폼 입력 (메뉴명, 가격, 설명, 카테고리, 이미지) → `POST /admin/menus`
4. 메뉴 수정: 기존 데이터 로드 → 수정 → `PUT /admin/menus/{menu_id}`
5. 메뉴 삭제: 확인 팝업 → `DELETE /admin/menus/{menu_id}`
6. 메뉴 순서 조정: 드래그 또는 버튼 → `PATCH /admin/menus/reorder`

### 4.3 이미지 업로드
1. 파일 선택 (JPEG, PNG, WebP, 최대 5MB)
2. 클라이언트 측 파일 타입/크기 사전 검증
3. `POST /admin/images/upload` (multipart/form-data)
4. 성공 시 반환된 image_url을 메뉴 폼에 설정
5. 미리보기 표시
6. 실패 시 에러 메시지

## 5. 매장 관리 로직 (소유자 전용)

### 5.1 매장 목록 조회
1. `GET /admin/stores` 호출
2. 매장 목록 표시 (매장명, 주소, 연락처)

### 5.2 매장 CRUD
1. 매장 등록: 매장명(필수), 주소, 연락처 입력 → `POST /admin/stores`
2. 매장 수정: 기존 데이터 로드 → 수정 → `PUT /admin/stores/{store_id}`
3. 매장 삭제: 확인 팝업 → `DELETE /admin/stores/{store_id}`
4. 삭제 시 하위 데이터(메뉴, 테이블, 직원) 보존 안내 메시지

### 5.3 매장 전환
1. 헤더 드롭다운에서 매장 선택
2. Context의 현재 store_id 변경
3. 대시보드 및 모든 관리 화면 데이터 재로드
4. SSE 연결 재설정 (새 store_id로)

## 6. 직원 관리 로직 (소유자 전용)

### 6.1 직원 목록 조회
1. `GET /admin/staff?store_id={store_id}` 호출
2. 직원 목록 표시 (사용자명, 역할, 생성일)

### 6.2 직원 CRUD
1. 직원 생성: 사용자명(필수, 1~50자, 매장 내 고유) + 비밀번호(필수, 최소 8자) → `POST /admin/staff`
2. 직원 수정: 사용자명/비밀번호 변경 → `PUT /admin/staff/{user_id}`
3. 직원 삭제: 확인 팝업 → `DELETE /admin/staff/{user_id}`

## 7. 네비게이션 및 라우팅 로직

### 7.1 라우트 구조
```
/login                    → LoginPage
/stores                   → StoreSelectionPage (소유자 전용)
/dashboard                → DashboardPage (기본 화면)
/tables                   → TableManagementPage
/menus                    → MenuManagementPage (소유자 전용)
/stores/manage            → StoreManagementPage (소유자 전용)
/staff                    → StaffManagementPage (소유자 전용)
```

### 7.2 네비게이션 규칙
1. 미인증 → /login으로 리다이렉트
2. 인증 완료 + 소유자 + 매장 미선택 → /stores로 리다이렉트
3. 인증 완료 + 매장 선택 완료 → /dashboard가 기본
4. 직원이 소유자 전용 라우트 접근 시 → /dashboard로 리다이렉트
5. 사이드바 네비게이션: 역할에 따라 메뉴 항목 필터링
