# NFR Requirements - Backend API

## 1. Performance

| 항목 | 목표 |
|---|---|
| API 응답 시간 (CRUD) | 500ms 이내 (p95) |
| SSE 이벤트 전달 | 2초 이내 |
| 동시 테이블 접속 | 50개 |
| SSE 동시 연결 | 10개 |
| DB 커넥션 풀 | min=5, max=20 |

## 2. Security (SECURITY-01~15 매핑)

| Rule | 적용 대상 | 구현 방식 |
|---|---|---|
| SECURITY-01 | PostgreSQL, S3 | TLS 1.2+ 연결, S3 암호화 활성화 |
| SECURITY-02 | API Gateway/LB | 액세스 로깅 활성화 |
| SECURITY-03 | FastAPI 전체 | structlog 구조화 로깅, 민감 데이터 마스킹 |
| SECURITY-04 | N/A | Backend API는 HTML 미제공 (Frontend에서 적용) |
| SECURITY-05 | 모든 API 엔드포인트 | Pydantic 스키마 검증, parameterized queries |
| SECURITY-06 | AWS IAM | 최소 권한 정책, 리소스별 권한 |
| SECURITY-07 | VPC, Security Groups | deny-by-default, 필요 포트만 개방 |
| SECURITY-08 | 모든 엔드포인트 | FastAPI Depends 인증, 역할 검증, CORS 제한, JWT 서버 검증 |
| SECURITY-09 | 전체 | 기본 자격증명 없음, 프로덕션 에러 제네릭 응답, S3 퍼블릭 차단 |
| SECURITY-10 | 의존성 관리 | requirements.txt 버전 고정, pip-audit 취약점 스캔 |
| SECURITY-11 | 아키텍처 | 보안 로직 전용 모듈(core/security.py), rate limiting, 오용 시나리오 |
| SECURITY-12 | 인증 시스템 | bcrypt 해싱, 16h 세션, brute-force 방지, 하드코딩 자격증명 없음 |
| SECURITY-13 | 데이터 무결성 | Pydantic 역직렬화, 의존성 체크섬, 감사 로깅 |
| SECURITY-14 | 모니터링 | 인증 실패 알림, 로그 보존 90일+, 보안 대시보드 |
| SECURITY-15 | 에러 처리 | 글로벌 에러 핸들러, fail-closed, 리소스 정리, 제네릭 에러 응답 |

## 3. Testing (PBT-01~10 매핑)

| Rule | 적용 대상 | 비고 |
|---|---|---|
| PBT-01 | Functional Design | 테스트 가능 속성 식별 (domain entities, business rules) |
| PBT-02 | 직렬화/역직렬화 | Pydantic 스키마 round-trip, JSON 직렬화 |
| PBT-03 | 불변 속성 | 주문 총액 계산, 상태 전이 규칙, 데이터 검증 |
| PBT-04 | 멱등성 | 소프트 삭제 멱등성, 메뉴 순서 재정렬 |
| PBT-05 | N/A | 참조 구현 없음 (신규 프로젝트) |
| PBT-06 | 상태 관리 | 주문 상태 머신, 테이블 세션 생명주기 |
| PBT-07 | 생성기 품질 | 도메인 객체 생성기 (Order, MenuItem, User 등) |
| PBT-08 | 축소/재현성 | Hypothesis 시드 로깅, CI 통합 |
| PBT-09 | 프레임워크 | Hypothesis (Python) |
| PBT-10 | 보완 전략 | Example-based + PBT 병행 |

### Testable Properties (PBT-01)

| 컴포넌트 | 속성 카테고리 | 설명 |
|---|---|---|
| Pydantic 스키마 | Round-trip | serialize → deserialize = identity |
| 주문 총액 계산 | Invariant | sum(item.quantity * item.unit_price) == order.total_amount |
| 주문 상태 전이 | Invariant | 유효한 전이만 허용, 무효 전이 거부 |
| 소프트 삭제 | Idempotence | delete(delete(x)) == delete(x) |
| 메뉴 순서 재정렬 | Idempotence | reorder(reorder(ids)) == reorder(ids) |
| 주문 상태 머신 | Stateful | 랜덤 명령 시퀀스 후 불변 조건 유지 |
| 테이블 세션 | Stateful | 세션 생명주기 (시작→주문→종료) 불변 조건 |

## 4. Reliability

- 글로벌 에러 핸들러 (모든 미처리 예외 캐치)
- DB 트랜잭션 롤백 (에러 시 자동)
- SSE 연결 끊김 시 자동 재연결 지원
- 구조화 로깅으로 디버깅 용이성 확보

## 5. Maintainability

- Alembic DB 마이그레이션
- structlog 구조화 로깅
- Pydantic 스키마로 API 문서 자동 생성 (OpenAPI/Swagger)
- 의존성 버전 고정 (requirements.txt)
