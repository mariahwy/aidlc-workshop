# Unit of Work - Story Map

## Story → Unit 매핑

| Story ID | Story 이름 | Unit 1: Backend | Unit 2: Customer FE | Unit 3: Admin FE | Unit 4: Infra |
|---|---|---|---|---|---|
| US-C01 | 테이블 자동 로그인 | ✅ API | ✅ UI | | |
| US-C02 | 메뉴 조회 및 탐색 | ✅ API | ✅ UI | | |
| US-C03 | 장바구니 관리 | | ✅ UI (로컬) | | |
| US-C04 | 주문 생성 | ✅ API | ✅ UI | | |
| US-C05 | 주문 내역 조회 | ✅ API | ✅ UI | | |
| US-A01 | 매장 관리자 인증 | ✅ API | | ✅ UI | |
| US-A02 | 실시간 주문 모니터링 | ✅ API+SSE | | ✅ UI | |
| US-A03 | 테이블 관리 | ✅ API | | ✅ UI | |
| US-A04 | 메뉴 관리 | ✅ API | | ✅ UI | |
| US-A05 | 매장 관리 | ✅ API | | ✅ UI | |
| US-A06 | 직원 계정 관리 | ✅ API | | ✅ UI | |
| US-S01 | 메뉴 이미지 S3 업로드 | ✅ API | | ✅ UI | ✅ S3 |

## Unit별 Story 수

| 유닛 | Story 수 | 주요 스토리 |
|---|---|---|
| Backend API | 11 | US-C01~C05, US-A01~A06, US-S01 (전체) |
| Customer Frontend | 5 | US-C01~C05 |
| Admin Frontend | 7 | US-A01~A06, US-S01 |
| Infrastructure | 1 | US-S01 (S3 버킷) + 전체 배포 환경 |

## 검증
- ✅ 모든 12개 스토리가 최소 1개 유닛에 매핑됨
- ✅ US-C03 (장바구니)은 클라이언트 전용으로 Customer Frontend에만 매핑
- ✅ Backend API가 모든 서버 측 스토리를 커버
