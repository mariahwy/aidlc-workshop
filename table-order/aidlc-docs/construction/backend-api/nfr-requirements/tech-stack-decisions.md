# Tech Stack Decisions - Backend API

## Core Framework

| 패키지 | 용도 |
|---|---|
| fastapi | 웹 프레임워크 |
| uvicorn | ASGI 서버 |
| pydantic | 데이터 검증/직렬화 |
| pydantic-settings | 환경 설정 관리 |

## Database

| 패키지 | 용도 |
|---|---|
| sqlalchemy | ORM |
| asyncpg | PostgreSQL async 드라이버 |
| alembic | DB 마이그레이션 |

## Authentication & Security

| 패키지 | 용도 |
|---|---|
| python-jose[cryptography] | JWT 토큰 생성/검증 |
| passlib[bcrypt] | 비밀번호 해싱 |
| python-multipart | 파일 업로드 (multipart) |

## AWS

| 패키지 | 용도 |
|---|---|
| boto3 | S3 이미지 업로드 |

## Logging

| 패키지 | 용도 |
|---|---|
| structlog | 구조화 로깅 |

## Testing

| 패키지 | 용도 |
|---|---|
| pytest | 테스트 러너 |
| pytest-asyncio | 비동기 테스트 |
| hypothesis | Property-Based Testing |
| httpx | 비동기 HTTP 테스트 클라이언트 |

## Dev Tools

| 패키지 | 용도 |
|---|---|
| pip-audit | 의존성 취약점 스캔 (SECURITY-10) |

## Version Pinning Strategy
- requirements.txt에 모든 의존성 정확한 버전 고정 (==)
- pip-audit로 취약점 정기 스캔
- lock file 커밋 필수
