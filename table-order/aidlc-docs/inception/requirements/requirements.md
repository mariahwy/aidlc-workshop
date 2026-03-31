# Requirements Document - 테이블오더 시스템

## Intent Analysis Summary
- **User Request**: 테이블 오더 시스템 개발 (디지털 주문 시스템)
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: System-wide (고객용 UI, 관리자 UI, 백엔드 API, 데이터베이스)
- **Complexity Estimate**: Complex (다수 기능, 실시간 통신, 인증, 세션 관리, 다중 매장)

---

## 1. Technology Stack Decisions

| Layer | Technology |
|---|---|
| Frontend (Customer) | React + TypeScript |
| Frontend (Admin) | React + TypeScript |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| File Storage | AWS S3 (메뉴 이미지) |
| Real-time Communication | Server-Sent Events (SSE) |
| Authentication | JWT (bcrypt 해싱) |
| Deployment | AWS Cloud |
| PBT Framework (Python) | Hypothesis |
| PBT Framework (TypeScript) | fast-check |

---

## 2. Functional Requirements

### 2.1 고객용 기능 (Customer App - 별도 React 앱)

#### FR-C01: 테이블 태블릿 자동 로그인 및 세션 관리
- 관리자가 1회 초기 설정 (매장 식별자, 테이블 번호, 테이블 비밀번호)
- 로그인 정보 로컬 저장 후 자동 로그인
- 16시간 세션 유지

#### FR-C02: 메뉴 조회 및 탐색
- 메뉴 화면이 기본 화면
- 카테고리별 메뉴 분류 및 표시
- 메뉴 상세 정보: 메뉴명, 가격, 설명, 이미지
- 카테고리 간 빠른 이동
- 카드 형태 레이아웃, 터치 친화적 (최소 44x44px)

#### FR-C03: 장바구니 관리
- 메뉴 추가/삭제, 수량 조절
- 총 금액 실시간 계산
- 장바구니 비우기
- 클라이언트 측 로컬 저장 (새로고침 시 유지)
- 서버 전송은 주문 확정 시에만

#### FR-C04: 주문 생성
- 주문 내역 최종 확인 후 확정
- 성공 시: 주문 번호 표시 → 장바구니 비우기 → 5초 후 메뉴 화면 리다이렉트
- 실패 시: 에러 메시지 표시, 장바구니 유지
- 주문 정보: 매장 ID, 테이블 ID, 메뉴 목록(메뉴명, 수량, 단가), 총 금액, 세션 ID

#### FR-C05: 주문 내역 조회
- 현재 테이블 세션 주문만 표시
- 주문 시간 순 정렬
- 주문별: 주문 번호, 시각, 메뉴/수량, 금액, 상태(대기중/준비중/완료)
- 매장 이용 완료 처리된 주문 제외

### 2.2 관리자용 기능 (Admin App - 별도 React 앱)

#### FR-A01: 매장 인증
- 매장 식별자 + 사용자명 + 비밀번호 로그인
- JWT 토큰 기반, 16시간 세션 유지
- 브라우저 새로고침 시 세션 유지
- bcrypt 해싱, 로그인 시도 제한

#### FR-A02: 실시간 주문 모니터링
- SSE 기반 실시간 주문 업데이트 (2초 이내)
- 그리드/대시보드 레이아웃: 테이블별 카드
- 각 카드: 총 주문액, 최신 주문 미리보기
- 카드 클릭 시 전체 메뉴 목록 상세 보기
- 주문 상태 변경 (대기중/준비중/완료)
- 신규 주문 시각적 강조

#### FR-A03: 테이블 관리
- 테이블 초기 설정 (번호, 비밀번호, 세션 생성)
- 주문 삭제 (확인 팝업 → 즉시 삭제 → 총 주문액 재계산)
- 테이블 세션 종료 (이용 완료): 주문 내역 → 과거 이력 이동, 현재 주문/총액 리셋
- 과거 주문 내역 조회 (시간 역순, 날짜 필터링)

#### FR-A04: 메뉴 관리
- 카테고리별 메뉴 조회
- 메뉴 CRUD (메뉴명, 가격, 설명, 카테고리, 이미지 URL)
- 메뉴 노출 순서 조정
- 필수 필드 및 가격 범위 검증

#### FR-A05: 매장 관리
- 다중 매장 지원
- 매장 등록/수정/삭제 기능
- 매장별 독립적인 메뉴, 테이블, 주문 관리

### 2.3 이미지 관리

#### FR-IMG01: S3 이미지 업로드
- 메뉴 이미지 AWS S3 업로드
- 업로드된 이미지 URL 반환 및 메뉴 데이터에 저장

---

## 3. Non-Functional Requirements

### NFR-01: Performance
- SSE 기반 주문 알림 2초 이내 전달
- API 응답 시간 500ms 이내 (일반 CRUD)
- 동시 접속 테이블 50개 이상 지원

### NFR-02: Security
- JWT 토큰 기반 인증 (Secure, HttpOnly, SameSite 쿠키)
- bcrypt 비밀번호 해싱
- 로그인 시도 제한 (brute-force 방지)
- HTTPS 필수 (TLS 1.2+)
- 입력값 검증 및 SQL Injection 방지 (parameterized queries)
- CORS 제한적 설정
- Security Extension Rules (SECURITY-01 ~ SECURITY-15) 전체 적용

### NFR-03: Reliability
- 장바구니 로컬 저장으로 데이터 유실 방지
- 주문 실패 시 장바구니 유지
- 글로벌 에러 핸들러 적용

### NFR-04: Usability
- 터치 친화적 UI (최소 44x44px 버튼)
- 직관적 카드 기반 레이아웃
- 명확한 시각적 피드백 (성공/실패)

### NFR-05: Testing
- Property-Based Testing (PBT) 전체 적용
- Python: Hypothesis, TypeScript: fast-check
- Example-based + Property-based 병행 테스트 전략

---

## 4. Architecture Overview

### 4.1 시스템 구성
```
+-------------------+     +-------------------+
|  Customer App     |     |  Admin App        |
|  (React + TS)     |     |  (React + TS)     |
+--------+----------+     +--------+----------+
         |                         |
         +----------+--------------+
                    |
                    v
         +----------+----------+
         |  FastAPI Backend     |
         |  (Python)           |
         +----+------+----+---+
              |      |    |
              v      v    v
         +----+ +---++ +--+---+
         | PG | | S3 | | SSE  |
         +----+ +----+ +------+
```

### 4.2 프론트엔드 구성
- Customer App: 별도 React 앱 (모바일/태블릿 최적화)
- Admin App: 별도 React 앱 (데스크탑 최적화)

### 4.3 데이터 모델 (핵심 엔티티)
- Store (매장)
- User (관리자 계정)
- Table (테이블)
- TableSession (테이블 세션)
- Category (메뉴 카테고리)
- MenuItem (메뉴 항목)
- Order (주문)
- OrderItem (주문 항목)
- OrderHistory (과거 주문 이력)

---

## 5. Exclusions (구현 제외)
- 결제 처리 (PG사 연동, 영수증, 환불, 포인트/쿠폰)
- 복잡한 인증 (OAuth, SNS, 2FA)
- 이미지 리사이징/최적화
- 알림 시스템 (푸시, SMS, 이메일)
- 주방 기능 (주방 전달, 재고 관리)
- 고급 기능 (분석, 매출 리포트, 직원 관리, 예약, 리뷰, 다국어)
- 외부 연동 (배달 플랫폼, POS, 소셜 미디어)
