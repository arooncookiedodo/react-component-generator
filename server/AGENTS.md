# Server Module Guide

## Module Context

`server`는 Bun HTTP API에서 API 키를 해석하고 Anthropic 또는 Google에 생성 요청을 전달한 뒤, react-live 실행용 코드를 반환한다. 순수 변환과 폴백은 HTTP 서버와 분리되어 단위 테스트한다.

## Tech Stack and Constraints

- Bun 내장 `Bun.serve`와 표준 `fetch`를 사용한다. 이 디렉터리에 별도 서버 프레임워크를 추가하지 않는다. 근거: `index.ts:68-81`, `index.ts:101-108`, `index.ts:138-220`.
- 제공자 키 우선순위는 요청의 `apiKey`, 그다음 서버 환경변수다. 키를 응답, 에러, 로그에 포함하지 않는다. 근거: `index.ts:59-65`, `index.ts:167-172`.
- `/api/config`은 키의 존재 여부만 반환한다. 키 값이나 제공자별 설정 객체를 브라우저로 확장하지 않는다. 근거: `index.ts:147-156`.

## Implementation Patterns

- 생성 결과는 코드 펜스를 제거한 뒤 `ensureRenderCall`을 적용해 반환한다. 순서를 바꾸거나 한 단계를 생략하지 않는다. 근거: `index.ts:188`, `generator.ts:5-23`.
- Google 모델은 선언된 배열 순서대로 하나씩 시도하고 첫 성공을 반환한다. 모든 시도가 실패하면 마지막 오류를 유지한다. 근거: `index.ts:4-5`, `index.ts:134-135`, `fallback.ts:7-20`.
- 503과 429는 사용자가 이해할 수 있는 별도 오류로 매핑하고, 나머지는 500으로 처리한다. 근거: `index.ts:191-211`.

## Testing Strategy

- 서버 단위 테스트: `bun run test -- server`
- 정규화 규칙을 변경하면 코드펜스 제거, 기존 render 보존, 컴포넌트 render 주입, 비컴포넌트 보존을 검증한다. 근거: `generator.test.ts:4-40`.
- 폴백 규칙을 변경하면 첫 성공 중단, 다음 모델 진행, 마지막 오류, 빈 목록을 검증한다. 근거: `fallback.test.ts:4-42`.

## Local Golden Rules

- `SYSTEM_PROMPT`의 실행 제약은 `react-live` 호환성 계약이다. import, TypeScript 문법, 외부 CSS를 허용하는 변경을 하지 않는다. 근거: `index.ts:7-20`, `generator.ts:13-23`.
- Anthropic 단일 호출 경로에 Google 폴백을 무단 적용하지 않고, Google 모델 배열의 우선순위도 임의로 뒤집지 않는다. 근거: `index.ts:4-5`, `index.ts:68-96`, `index.ts:134-135`.
