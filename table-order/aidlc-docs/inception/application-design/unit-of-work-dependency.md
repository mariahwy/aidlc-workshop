# Unit of Work Dependencies

## Dependency Matrix

| 유닛 | 의존 대상 | 의존 유형 | 비고 |
|---|---|---|---|
| Customer Frontend | Backend API | REST API 호출 | 메뉴 조회, 주문 생성/조회, 인증 |
| Admin Frontend | Backend API | REST API + SSE | 관리 기능 전체 + 실시간 주문 스트림 |
| Backend API | Infrastructure | 런타임 환경 | PostgreSQL, S3, 네트워크 |
| Infrastructure | 없음 | 독립 | 다른 유닛에 의존하지 않음 |

## 의존성 다이어그램

```
Customer Frontend ---REST---> Backend API ----> PostgreSQL
                                  |                 ^
Admin Frontend ---REST+SSE--> Backend API ----> AWS S3
                                  |
                                  v
                            Infrastructure
                          (AWS 리소스 제공)
```

## 개발 순서 전략

**병렬 개발 (API 스펙 선행 합의)**:

1. **Phase 0 (선행)**: OpenAPI 스펙 합의 → 모든 유닛이 참조할 API 계약 확정
2. **Phase 1 (병렬)**: 4개 유닛 동시 개발
   - Backend API: 실제 API 구현
   - Customer Frontend: API 스펙 기반 개발 (mock/stub 활용)
   - Admin Frontend: API 스펙 기반 개발 (mock/stub 활용)
   - Infrastructure: AWS 리소스 프로비저닝
3. **Phase 2 (통합)**: Frontend ↔ Backend 통합 테스트

## CONSTRUCTION 단계 유닛 실행 순서

모든 유닛이 병렬 개발 가능하나, CONSTRUCTION per-unit loop는 순차 실행:

1. **Unit 1: Backend API** (핵심 비즈니스 로직, API 스펙 확정)
2. **Unit 2: Customer Frontend** (고객 주문 기능)
3. **Unit 3: Admin Frontend** (관리자 기능)
4. **Unit 4: Infrastructure** (배포 아키텍처)
