# NFR Requirements - Admin Frontend

## 1. Performance

| 항목 | 목표 |
|---|---|
| 초기 로드 시간 (FCP) | 2초 이내 |
| 번들 크기 (gzip) | 메인 번들 200KB 이내 |
| API 응답 후 UI 반영 | 100ms 이내 |
| SSE 이벤트 수신 → UI 반영 | 500ms 이내 |
| 페이지 전환 | 300ms 이내 |
| 이미지 업로드 프로그레스 | 실시간 표시 |

### 성능 최적화 전략
- Vite 기반 코드 스플리팅 (라우트별 lazy loading)
- React.lazy + Suspense로 페이지 컴포넌트 지연 로드
- TanStack Query 캐싱으로 불필요한 API 재요청 방지
- SSE 이벤트 처리 시 불필요한 리렌더링 방지 (useCallback, useMemo)
- 이미지 최적화 (lazy loading, 적절한 크기)

## 2. Security (SECURITY-01~15 프론트엔드 매핑)

| Rule | 적용 대상 | 구현 방식 |
|---|---|---|
| SECURITY-01 | API 통신 | HTTPS 전용 통신 |
| SECURITY-02 | N/A | 프론트엔드 해당 없음 (서버 측 로깅) |
| SECURITY-03 | 에러 로깅 | 민감 데이터(토큰, 비밀번호) 콘솔 출력 금지 |
| SECURITY-04 | HTML 렌더링 | React 기본 XSS 방지, dangerouslySetInnerHTML 사용 금지 |
| SECURITY-05 | 폼 입력 | 클라이언트 측 입력 검증 (서버 측 검증과 병행) |
| SECURITY-06 | N/A | 프론트엔드 해당 없음 (IAM) |
| SECURITY-07 | N/A | 프론트엔드 해당 없음 (네트워크) |
| SECURITY-08 | 인증/인가 | JWT 토큰 관리, RoleGuard 접근 제어, CORS 설정 |
| SECURITY-09 | 에러 표시 | 사용자에게 제네릭 에러 메시지만 표시, 상세 에러 숨김 |
| SECURITY-10 | 의존성 관리 | package.json 버전 고정, npm audit 취약점 스캔 |
| SECURITY-11 | 아키텍처 | 인증 로직 전용 모듈(AuthProvider), API 클라이언트 인터셉터 |
| SECURITY-12 | 인증 시스템 | JWT localStorage 저장, 16h 만료, 401 자동 로그아웃 |
| SECURITY-13 | 데이터 무결성 | TypeScript 타입 검증, API 응답 타입 가드 |
| SECURITY-14 | N/A | 프론트엔드 해당 없음 (서버 측 모니터링) |
| SECURITY-15 | 에러 처리 | ErrorBoundary 글로벌 에러 캐치, 에러 시 안전한 폴백 UI |

### 추가 보안 조치
- JWT 토큰은 localStorage에 저장 (HttpOnly 쿠키 대안 검토 가능)
- API 요청 시 Authorization 헤더로만 토큰 전송
- 환경 변수로 API URL 관리 (하드코딩 금지)
- 프로덕션 빌드 시 소스맵 비활성화

## 3. Testing (PBT-01~10 프론트엔드 매핑)

| Rule | 적용 대상 | 비고 |
|---|---|---|
| PBT-01 | Functional Design | 테스트 가능 속성 식별 (컴포넌트 상태, 폼 검증) |
| PBT-02 | 직렬화/역직렬화 | API 응답 타입 변환 round-trip |
| PBT-03 | 불변 속성 | 금액 포맷팅, 역할 기반 접근 제어, 폼 검증 규칙 |
| PBT-04 | 멱등성 | SSE 이벤트 중복 처리, 상태 업데이트 멱등성 |
| PBT-05 | N/A | 참조 구현 없음 (신규 프로젝트) |
| PBT-06 | 상태 관리 | AuthContext 상태 머신, SSE 연결 상태 머신 |
| PBT-07 | 생성기 품질 | 도메인 객체 생성기 (Order, MenuItem, Store 등) |
| PBT-08 | 축소/재현성 | fast-check 시드 로깅 |
| PBT-09 | 프레임워크 | fast-check (TypeScript/JavaScript PBT) |
| PBT-10 | 보완 전략 | Example-based + PBT 병행 |

### Testable Properties (PBT-01)

| 컴포넌트 | 속성 카테고리 | 설명 |
|---|---|---|
| 금액 포맷팅 | Invariant | formatCurrency(n) 항상 "₩" 접두사 + 콤마 포맷 |
| RoleGuard | Invariant | staff 역할은 owner 전용 라우트 접근 불가 |
| 폼 검증 | Invariant | 유효한 입력 → 에러 없음, 무효한 입력 → 에러 메시지 |
| SSE 이벤트 처리 | Idempotence | 동일 이벤트 중복 수신 시 상태 일관성 유지 |
| AuthContext | Stateful | 로그인→인증→로그아웃 상태 전이 불변 조건 |
| 주문 상태 표시 | Invariant | 유효한 상태값만 UI에 표시 |

## 4. Accessibility (접근성)

### 기본 수준 준수
- 시맨틱 HTML 태그 사용 (nav, main, section, article, button, form)
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- 포커스 관리 (모달 오픈 시 포커스 트랩, 닫기 시 복원)
- aria-label 속성 (아이콘 버튼, 인터랙티브 요소)
- 색상 대비 최소 4.5:1 (텍스트), 3:1 (대형 텍스트)
- 폼 필드에 label 연결
- 에러 메시지 aria-live="polite"로 스크린 리더 알림

## 5. Reliability

- ErrorBoundary로 컴포넌트 에러 격리 (전체 앱 크래시 방지)
- SSE 연결 끊김 시 자동 재연결 (3초 간격, 최대 5회)
- API 요청 실패 시 TanStack Query 자동 재시도 (최대 3회)
- 오프라인 감지 → "네트워크 연결을 확인해주세요" 배너
- 폼 제출 중복 방지 (버튼 비활성화)

## 6. Maintainability

- TypeScript strict 모드 활성화
- ESLint + Prettier 코드 포맷팅
- 컴포넌트별 CSS Modules 스코핑
- 디렉토리 구조: 기능별 분리 (pages/, components/, contexts/, api/, hooks/, utils/)
- API 타입 정의 별도 관리 (types/)
- 환경 변수 관리 (.env 파일)
- package.json 의존성 버전 고정

## 7. Usability

- 반응형 디자인: 모바일(320px~), 태블릿(768px~), 데스크톱(1024px~)
- 터치 친화적 버튼 크기 (최소 44x44px)
- 로딩 상태 시각적 피드백 (스피너, 스켈레톤)
- 토스트 알림으로 작업 결과 피드백
- 확인 팝업으로 파괴적 작업 보호
- 한국어 전용 UI
