# Requirements Verification Questions

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

## Question 1
프론트엔드(고객용 + 관리자용) 기술 스택으로 무엇을 사용하시겠습니까?

A) React + TypeScript
B) Vue.js + TypeScript
C) Next.js (React 기반 풀스택 프레임워크)
D) Svelte + TypeScript
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
백엔드 기술 스택으로 무엇을 사용하시겠습니까?

A) Node.js + Express + TypeScript
B) Node.js + NestJS + TypeScript
C) Java + Spring Boot
D) Python + FastAPI
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 3
데이터베이스로 무엇을 사용하시겠습니까?

A) PostgreSQL (관계형)
B) MySQL (관계형)
C) MongoDB (NoSQL Document)
D) DynamoDB (AWS NoSQL)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
배포 환경은 어떻게 계획하고 계십니까?

A) AWS 클라우드 (EC2, ECS, Lambda 등)
B) 로컬/온프레미스 서버
C) Docker 컨테이너 기반 (로컬 또는 클라우드)
D) 개발/데모 목적으로 로컬 실행만 (배포 고려 안 함)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 앱에서 라우팅으로 분리
B) 별도의 프론트엔드 앱 2개 (고객용, 관리자용)
C) 고객용은 모바일 최적화 웹앱, 관리자용은 데스크탑 웹앱 (별도 앱)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
메뉴 이미지 관리는 어떻게 하시겠습니까? (요구사항에 이미지 URL로 명시되어 있습니다)

A) 외부 이미지 URL만 사용 (이미지 업로드 기능 없음)
B) 서버에 이미지 파일 업로드 및 로컬 저장
C) 클라우드 스토리지 사용 (S3 등)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 7
매장(Store) 데이터는 어떻게 관리됩니까?

A) 단일 매장만 지원 (하드코딩 또는 환경변수)
B) 다중 매장 지원 (매장 등록/관리 기능 포함)
C) 다중 매장 지원하되, 매장 등록은 DB 직접 입력 (관리 UI 없음)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
D) Other (please describe after [Answer]: tag below)

[Answer]: A
