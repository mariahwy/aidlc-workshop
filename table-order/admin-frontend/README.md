# Admin Frontend - 테이블오더 관리자

매장 관리자용 React 웹 애플리케이션.

## 기술 스택
- React 18 + TypeScript
- Vite (빌드/개발 서버)
- TanStack Query (서버 상태 관리)
- React Router v6 (라우팅)
- CSS Modules (스타일링)
- Vitest + React Testing Library + fast-check (테스트)

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 (포트 3001)
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 린트
npm run lint
```

## 디렉토리 구조
```
src/
├── api/          # API 클라이언트 + TanStack Query 훅
├── components/   # 공통 컴포넌트
├── contexts/     # React Context (Auth, Store, SSE)
├── hooks/        # 커스텀 훅
├── pages/        # 페이지 컴포넌트
├── types/        # TypeScript 타입 정의
└── utils/        # 유틸리티 함수
```

## 환경 변수
- `VITE_API_URL`: Backend API URL (기본: http://localhost:8000)
