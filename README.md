# MCM RE:SENSE

MCM RE:SENSE는 고객의 취향을 바탕으로 자신만의 가방을 발견하고, 오프라인 매장 방문까지 연결하는 AI co-creation 서비스입니다.

사용자는 단계별 선택 또는 자유로운 텍스트·음성 입력으로 원하는 가방을 표현할 수 있습니다. 생성된 `UNSEEN`을 확인한 뒤 방문할 매장과 일정을 선택하고 디지털 예약 PASS를 발급받습니다.

## 핵심 기능

- 고객 정보 등록과 생성 세션 시작
- 선택형 취향 설계
  - 가방 유형과 사용 목적
  - 형태, 비율, 색상, 분위기
  - 유지할 핵심 속성
- 자유 입력형 취향 설계
  - 텍스트 설명
  - 브라우저 음성 녹음
- 생성 진행 상태와 UNSEEN 결과 확인
- 방문 매장, 날짜, 시간 선택
- 예약 확인과 디지털 PASS 제공
- 예약 PASS 이미지 다운로드 및 캘린더 일정 추가

## 서비스 흐름

```text
Home
  → Registration
  → Choose Creation Method
      ├─ Guided: Category → Shape → Importance
      └─ Freeform: Text | Voice Brief
  → Generating
  → UNSEEN Result
  → Store Selection
  → Appointment Schedule
  → Appointment Confirmation
```

선택형과 자유 입력형은 서로 다른 방식으로 취향을 수집한 뒤 동일한 생성·결과·예약 흐름으로 합류합니다.

## 기술 스택

| 영역            | 기술                               |
| --------------- | ---------------------------------- |
| UI              | React 19                           |
| Build           | Vite 8                             |
| Routing         | React Router 7                     |
| Language        | JavaScript, JSX                    |
| State           | React Context, `useReducer`        |
| Styling         | CSS Modules, CSS Custom Properties |
| Network         | Fetch API, REST API                |
| Package Manager | npm                                |
| Quality         | ESLint, Vite Build                 |

별도의 상태 관리 라이브러리나 UI 프레임워크를 추가하지 않고 React와 브라우저 기본 기능을 중심으로 구성했습니다.

## 프론트엔드 구조

```text
BrowserRouter
└─ CreationFlowProvider
   └─ App Routes
      ├─ Layouts
      ├─ Pages
      │  ├─ Guided Creation
      │  ├─ Freeform Creation
      │  ├─ Generation / Result
      │  └─ Appointment
      ├─ Shared Components
      └─ API Services
```

- `BrowserRouter`가 SPA의 화면 전환과 URL 파라미터를 관리합니다.
- `CreationFlowProvider`가 생성부터 예약까지 이어지는 사용자 선택을 공유합니다.
- 각 Page는 화면 구성과 해당 화면의 interaction을 담당합니다.
- 공통 Layout과 Component는 여러 페이지에서 반복되는 UI를 제공합니다.
- API Service 계층은 페이지와 외부 REST API 사이의 요청을 담당합니다.

## 디렉터리 구조

```text
src/
├─ assets/       # 브랜드, 폰트, 아이콘, 이미지
├─ components/   # 공통 Header, Button, Card
├─ context/      # 서비스 Flow 공유 상태
├─ hooks/        # 공통 React hooks
├─ layouts/      # 공통 페이지 Layout
├─ pages/        # Route 단위 화면
├─ services/     # API client와 서비스 요청
├─ styles/       # 전역 font와 design token
├─ App.jsx       # Route 구성
└─ main.jsx      # 애플리케이션 진입점
```

## 시작하기

### 요구 환경

- Node.js `^20.19.0` 또는 `>=22.12.0`
- npm

### 설치

```bash
npm ci
```

### 개발 서버 실행

```bash
npm run dev
```

기본 개발 주소는 `http://localhost:5173`입니다.

## npm Scripts

| 명령어            | 설명                        |
| ----------------- | --------------------------- |
| `npm run dev`     | 개발 서버 실행              |
| `npm run lint`    | JavaScript와 JSX 정적 검사  |
| `npm run build`   | production bundle 생성      |
| `npm run preview` | production bundle 로컬 확인 |

## 디자인과 스타일

- Figma를 UI 구현의 source of truth로 사용합니다.
- 공통 색상과 font는 `src/styles`의 token으로 관리합니다.
- 페이지별 스타일은 CSS Modules로 격리합니다.
- 공통 Header, Button, Option Card는 재사용 가능한 Component로 관리합니다.
- React + JavaScript + JSX만 사용합니다.

## 검증

변경 작업을 완료한 뒤 다음 명령으로 코드 품질과 production build를 확인합니다.

```bash
npm run lint
npm run build
```
