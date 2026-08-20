# 세션 생성 API 404 장애 리포트

- 작성일: 2026-08-20
- 대상 API: `POST /api/v1/sessions`
- 목적: 배포 서버의 API route 및 reverse proxy 상태 확인 요청

## 1. 문제 요약

Registration 화면에서 세션 생성 요청을 전송하면 명세상 예상 응답인 `201 Created` 대신 `404 Not Found`가 반환됩니다.

```text
POST https://1-201-117-204.sslip.io/api/v1/sessions
→ 404 Not Found
```

응답 body:

```json
{
  "timestamp": "2026-08-19T19:11:58.848+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/api/v1/sessions"
}
```

현재 증거로는 요청 body 검증 문제가 아니라, 배포 서버에서 해당 route를 찾지 못하는 문제로 판단됩니다.

## 2. 기대 동작

최신 API 명세 기준:

```text
Production Base URL: https://{host}/api/v1
Method: POST
URI: /api/v1/sessions
Success: 201 Created
```

요청 예시:

```json
{
  "demoCustomerId": "demo-web-customer",
  "customerName": "Frontend Test",
  "phone": "010-0000-0000",
  "email": "frontend-test@example.com",
  "gender": "MALE",
  "dataConsent": true
}
```

성공 응답에는 유효한 `sessionId`가 포함되어야 합니다.

## 3. 프런트엔드 확인 결과

프런트엔드는 다음 순서로 URL을 한 곳에서 조합합니다.

```text
VITE_API_BASE_URL
+ /api/v1
+ /sessions
```

브라우저와 로컬 mock API를 이용해 실제 Registration 제출을 독립 검증했습니다.

| 확인 항목 | 결과 |
| --- | --- |
| HTTP method | `POST` 정상 |
| 요청 path | `/api/v1/sessions` 정상 |
| Content-Type | `application/json` 정상 |
| 요청 body | 명세의 6개 필드 정상 전송 |
| 요청 횟수 | submit 1회당 1회 |
| 성공 처리 | `201 + sessionId` 수신 후 `/create/:sessionId/choose` 이동 정상 |
| 실패 처리 | 현재 화면 유지 및 오류 안내 정상 |
| 정적 검증 | `npm run lint`, `npm run build` 통과 |

`Accept`는 브라우저 기본값인 `*/*`이지만 JSON 응답을 허용하므로 route 미매칭에 의한 `404` 원인은 아닙니다.

## 4. 서버 측 확인 과정

### 4.1 네트워크 및 CORS

- 요청은 nginx 서버까지 정상 도달했습니다.
- 응답 서버: `nginx/1.18.0 (Ubuntu)`
- `OPTIONS /api/v1/sessions`는 `200 OK`였습니다.
- `Access-Control-Allow-Origin: http://localhost:5173`가 반환됐습니다.
- 따라서 DNS, TLS, CORS 차단으로 발생한 오류는 아닙니다.
- 단, OPTIONS 응답은 전역 CORS 설정일 수 있으므로 실제 route 존재를 증명하지는 않습니다.

### 4.2 동일 API 영역의 읽기 요청

| 요청 | 결과 |
| --- | --- |
| `GET /api/v1/preference-options` | `404` |
| `GET /api/v1/stores` | `404` |
| `GET /api/v1/sessions` | `404` |
| `GET /sessions` | `404` |
| `GET /v1/sessions` | `404` |
| `GET /api/sessions` | `404` |

명세상 GET endpoint인 `preference-options`와 `stores`도 404이므로 세션 생성 DTO만의 문제라기보다, 명세의 API 전체가 현재 host에 노출되지 않은 정황입니다.

### 4.3 API 문서 및 상태 endpoint

다음 경로도 모두 `404`였습니다.

```text
/v3/api-docs
/api/v1/v3/api-docs
/swagger-ui/index.html
/actuator/health
```

운영 환경에서 Swagger와 Actuator를 비활성화했을 수 있으므로 이 결과만으로 장애를 판단하지는 않았습니다.

## 5. 원인 후보

우선순위가 높은 순서입니다.

1. `VITE_API_BASE_URL`이 실제 백엔드 서버가 아닌 다른 서버를 가리키고 있음
2. nginx upstream이 다른 애플리케이션 또는 이전 컨테이너를 바라보고 있음
3. 최신 Session/Preference/Store Controller가 포함되지 않은 이전 JAR 또는 이미지가 배포됨
4. Spring context path와 nginx `location`/`proxy_pass` rewrite 규칙이 명세와 다름
5. Controller component scan 또는 profile 조건 때문에 API mapping이 등록되지 않음

요청이 DTO binding 단계까지 도달했다면 명세상 입력 오류는 `400`으로 반환되어야 합니다. 현재의 공통 `404` body는 handler mapping 이전에 실패했을 가능성이 높습니다.

## 6. 백엔드 확인 요청

### A. 대상 서버 확인

가비아 콘솔의 `네트워크 → 공인 IP`에서 백엔드 서버에 연결된 공인 IP가 아래 값과 같은지 확인해 주세요.

```text
1.201.117.204
```

다르면 실제 Production Base URL을 프런트엔드 팀에 전달해 주세요.

### B. 서버 내부에서 애플리케이션 직접 호출

먼저 명세상 GET endpoint를 호출해 주세요.

```bash
curl -i http://127.0.0.1:8080/api/v1/preference-options
```

- `200`: Spring API는 정상이며 nginx 설정 확인 필요
- `404`: 실행 중인 백엔드 artifact 또는 Controller mapping 확인 필요
- 연결 실패: 애플리케이션 프로세스, 컨테이너 및 포트 확인 필요

필요하면 테스트 레코드가 생성될 수 있음을 인지한 상태에서 세션 API도 직접 확인해 주세요.

```bash
curl -i -X POST http://127.0.0.1:8080/api/v1/sessions \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"demoCustomerId":"backend-smoke-test","customerName":"Backend Test","phone":"010-0000-0000","email":"backend-test@example.com","gender":"MALE","dataConsent":true}'
```

### C. Spring route 및 배포본 확인

- 실행 중인 JAR/image의 commit 또는 tag가 최신본인지 확인
- Session, Preference, Store Controller가 배포 artifact에 포함됐는지 확인
- `@RequestMapping("/api/v1")` 및 `@PostMapping("/sessions")` 조합 확인
- `server.servlet.context-path` 또는 profile별 설정 확인
- 애플리케이션 시작 로그에서 해당 Controller mapping 등록 여부 확인

### D. nginx 확인

```bash
sudo nginx -T | grep -nE 'server_name|location|proxy_pass'
sudo ss -lntp | grep -E ':80|:443|:8080'
```

특히 `location /api/v1/`와 `proxy_pass`의 trailing slash에 따라 `/api/v1` prefix가 제거되는지 확인해 주세요. 현재 외부 응답 body의 `path`는 `/api/v1/sessions`이므로 요청 path 자체는 nginx까지 정상 전달된 것으로 보입니다.

## 7. 조치 완료 기준

아래 조건이 충족되면 프런트엔드에서 재검증할 수 있습니다.

1. 외부 `POST https://{host}/api/v1/sessions`가 `201 Created` 반환
2. 응답 body에 유효한 `sessionId` 포함
3. `GET https://{host}/api/v1/preference-options`가 `200 OK` 반환
4. 실제 Production Base URL과 배포 commit/tag 공유
5. nginx `location` 및 upstream 대상 확인 완료

## 8. 백엔드 회신 요청 정보

- 가비아 공인 IP
- 실제 Production Base URL
- 서버 내부 GET/POST 테스트 결과
- 현재 실행 중인 commit/tag 또는 Docker image
- nginx의 관련 `location`과 `proxy_pass` 설정

