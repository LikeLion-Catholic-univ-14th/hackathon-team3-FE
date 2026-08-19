# Frontend Flow / API Contract Gaps

기준 문서: `수정본.pdf` (MCM Re:SENSE Backend ERD & API Specification, 2026-08-15)

이 문서는 Figma 서비스 Flow와 현재 API 명세가 아직 일치하지 않는 지점을 추적한다. 명세에 없는 필드는 프론트엔드 Flow 상태에만 보관하고, 백엔드 계약이 갱신되기 전에는 API 요청에 임의로 포함하지 않는다.

## 현재 확정된 고객 Flow

`Session → Preferences/Input → Intent → UNSEEN → Store/Slot → Reservation`

- API base URL: `VITE_API_BASE_URL` 또는 기본값 `http://localhost:8080/api/v1`
- 인증: 현재 명세상 없음
- 주요 세션 상태: `CREATED → PREFERENCES_SAVED → INTENT_READY → UNSEEN_PROCESSING → UNSEEN_READY → RESERVED`
- UNSEEN 생성 후 `GET /sessions/{sessionId}/unseen`을 500~1000ms 간격으로 조회한다.
- 예약은 미래 시각, 11:00~18:00 정시 슬롯, 세션당 1건이며 동일 매장/시간 중복 시 `409`가 발생한다.

## 미확정 계약

| 영역 | Figma / 프론트엔드 필요 정보 | 현재 API 명세 | 임시 처리 및 확인 필요 사항 |
| --- | --- | --- | --- |
| 세션 생성과 URL | Registration 제출 후 생성 Flow를 식별할 ID | `POST /sessions`는 등록 값과 함께 서버 세션을 생성 | Registration은 `/create/registration`에서 진행한다. 응답의 ID 필드가 확정되면 `sessionId`를 저장하고 `/create/{sessionId}/choose`로 이동한다. |
| Registration | 이름, 전화번호, 이메일, 성별 | `demoCustomerId`, `customerName`, `dataConsent`만 요청 예시 존재 | 미지원 값은 Flow 상태에만 둔다. `demoCustomerId` 생성 규칙과 동의 UI/필수 여부도 확인한다. |
| Choose | Guided와 Writing/Speaking 분기 | 별도 method 필드 없음. 입력 결과로 `last_input_mode`가 저장되는 것으로 보임 | 화면 분기 상태만 로컬 보관한다. 서버 전송 필드로 추측하지 않는다. |
| Category | Daily, Work, Travel, Weekend 목적 선택 | preferences의 `contexts`, 생성된 intent의 `purpose` 존재 | purpose↔contexts 매핑, 다중 선택 여부, enum 값/대소문자를 확정해야 한다. |
| Shape | 연속형 silhouette/proportion/attitude, color, Visetos pattern, monogram | `silhouette`, `structure`, `proportion`, `color`, `attitude`만 존재 | UI 원값은 로컬 보관한다. 연속값→서버 enum 매핑, `structure`의 입력 출처, pattern/monogram 필드를 확정한다. |
| Importance | 사용자가 지킬 한 가지 속성 | `lockedAttribute` | Figma의 `Space`가 `proportion`인지, 허용 enum과 표기 형식을 확정한다. |
| Text/Voice input | Writing/Speaking 제출과 진행 상태 | endpoint와 voice multipart 필드만 명시 | text 요청 body, voice 응답, input-progress 전체 응답 스키마를 확정한다. 음성 Blob은 전역 상태에 저장하지 않는다. |
| Intent | 결과 화면의 제목, 속성 설명, 사용자용 요약 | 응답 예시는 `purpose`, `priority`, `style`, `signature`, `lockedAttribute`, `concern`; entity에는 `summary` 존재 | Figma 표시 정보가 더 많다. 누락된 응답 필드와 `summary` 반환 여부를 확정한다. |
| Session response | 생성 후 ID와 재진입 데이터 | create/get endpoint만 있고 응답 예시 없음 | 응답 DTO와 nullable 필드를 확정한다. |
| Store/Slot | 매장 카드, 날짜별 예약 가능 시간 | endpoint만 있고 응답 예시 없음 | store/slot DTO, unavailable 표현, 날짜·시간대 기준을 확정한다. |
| Reservation/Confirmation | 예약 ID, 고객, 매장, 시간, pass code, UNSEEN 정보 | 생성/get endpoint와 요청 예시만 존재 | 생성/get 응답 DTO 및 confirmation에 필요한 조합 데이터를 확정한다. |
| 오류 표시 | `409`, `422`에 대한 사용자 행동 안내 | 상태 코드 의미만 존재 | 공통 오류 body (`code`, `message`, field errors 등)를 확정한다. 현재는 status와 원본 payload를 보존한다. |
| Calendar/Download | 최종 화면의 캘린더 추가·다운로드 | 관련 endpoint 없음 | 브라우저에서 처리할 기능인지 별도 API가 필요한지 확정한다. |

## 구현 원칙

- API service는 현재 문서에 명시된 고객 Flow endpoint만 제공한다.
- DTO 스키마가 없는 응답은 가공하거나 가상의 필드를 만들지 않고 원본을 반환한다.
- `409`와 `422`를 포함한 비정상 응답은 `ApiError`의 `status`와 `payload`로 페이지에 전달한다.
- Advisor, Reveal, Feedback/Memory Flow는 해당 UI 작업이 시작될 때 필요한 범위만 추가한다.
