# NFR Design Plan - Admin Frontend

## Unit Context
- **유닛명**: Admin Frontend (Unit 3)
- **기술 스택**: React + TypeScript, Vite, CSS Modules, TanStack Query, React Router v6
- **NFR 핵심**: 성능(FCP 2초), 보안(JWT/XSS), SSE 실시간, 반응형, PBT(fast-check)

## Plan Steps

- [x] Step 1: 성능 패턴 설계 (코드 스플리팅, 캐싱, 번들 최적화)
- [x] Step 2: 보안 패턴 설계 (인증 인터셉터, XSS 방지, 에러 처리)
- [x] Step 3: 신뢰성 패턴 설계 (SSE 재연결, API 재시도, ErrorBoundary)
- [x] Step 4: 논리적 컴포넌트 설계 (미들웨어, 인터셉터, 가드)
- [x] Step 5: nfr-design-patterns.md 생성
- [x] Step 6: logical-components.md 생성

## Clarifying Questions

### Q1: API 요청 재시도 전략
TanStack Query의 재시도 전략을 어떻게 설정할까요?

- A) 기본 설정 (3회 재시도, 지수 백오프)
- B) 보수적 (1회 재시도, 빠른 실패)
- C) 뮤테이션은 재시도 없음, 쿼리만 3회 재시도

[Answer]: A

### Q2: SSE 연결 실패 시 폴백
SSE 재연결 5회 실패 후 폴백 전략은?

- A) 수동 재연결 버튼만 표시
- B) 수동 재연결 버튼 + 30초 간격 폴링으로 전환
- C) 수동 재연결 버튼 + 페이지 새로고침 안내

[Answer]: B

### Q3: 에러 바운더리 범위
ErrorBoundary의 적용 범위를 어떻게 할까요?

- A) 앱 전체 1개 (전체 폴백 UI)
- B) 페이지별 ErrorBoundary (페이지 단위 격리)
- C) 페이지별 + 주요 컴포넌트별 (세밀한 격리)

[Answer]: B

