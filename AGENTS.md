# Agent Guide

## Operational Commands

- 의존성 설치와 모든 명령은 `bun`을 사용한다. npm, yarn, pnpm으로 lockfile을 변경하지 않는다.
- 개발 서버: `bun run dev`
- API 서버만 실행: `bun run server`
- 정적 검사: `bun run lint`
- 프로덕션 빌드 및 타입 검사: `bun run build`
- 전체 테스트: `bun run test`

## Golden Rules

### Immutable

- API 키는 서버 환경변수 또는 요청 본문에서만 해석한다. 브라우저 번들, 로그, 응답 본문에 키를 노출하거나 Vite 환경변수로 옮기지 않는다. 서버는 키 존재 여부만 `/api/config`으로 반환한다. 근거: `server/index.ts:59-65`, `server/index.ts:147-156`, `.gitignore:29`.
- 생성 코드는 `react-live`의 `noInline` 실행 환경을 만족해야 한다. import·TypeScript 문법·외부 CSS 의존성을 넣지 말고, 자기 완결적인 JavaScript 컴포넌트와 `render(...)` 호출을 유지한다. 근거: `server/index.ts:9-20`, `server/generator.ts:13-23`, `src/components/LivePreview.tsx:14-18`.

### Do's and Don'ts

- 생성 응답 정규화에서 시스템 프롬프트의 `render(...)` 요구와 `ensureRenderCall` 보정을 함께 유지한다. 둘 중 하나를 제거하지 않는다. 근거: `server/index.ts:10-16`, `server/index.ts:188`, `server/generator.ts:16-23`.
- Google 모델 경로의 순차 폴백과 순서를 보존한다. Anthropic 호출에는 같은 폴백이 없는 비대칭 구조다. 근거: `server/index.ts:4-5`, `server/index.ts:134-135`, `server/index.ts:183-186`.
- 순수 변환 및 폴백 로직을 바꾸면 같은 디렉터리의 단위 테스트를 함께 수정한다. 해당 영역은 현재 테스트가 있으며 HTTP 핸들러에는 직접 테스트가 없다. 근거: `server/generator.test.ts:1-40`, `server/fallback.test.ts:1-42`, `server/index.ts:138-220`.
- UI 생성 요청은 프록시된 상대 경로 `/api/generate`를 사용한다. API 서버 주소를 프런트엔드에 하드코딩하지 않는다. 근거: `src/hooks/useComponentGenerator.ts:23-26`, `vite.config.ts:8-14`.

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.** 이 섹션은 전역 기본값이다. 하위 디렉터리의 `AGENTS.md`에 별도 TDD 규칙이 있으면 **그 규칙을 우선**한다.

### 적용 기준

- **반드시 적용:** 비즈니스 로직, API, 유틸리티 함수, 버그 수정.
- **불필요:** 타입 정의, 설정 파일, 순수 UI 변경, SQL.

### RED-GREEN-REFACTOR

1. **RED:** 하나의 동작에 하나의 테스트만 작성한다. 반드시 실행해 실패를 확인하고, 실패 이유가 **기능 미구현**임을 확인한다.
2. **GREEN:** 테스트를 통과시키는 최소한의 코드만 작성한다. **YAGNI**를 지키고, 신규 테스트와 기존 테스트가 모두 통과하는지 확인한다.
3. **REFACTOR:** 중복 제거, 이름 개선, 헬퍼 추출만 수행한다. green 상태를 유지하며, 새 동작을 추가하지 않는다.
4. **반복:** 다음 동작에 대한 RED로 돌아간다.

### 삭제 강제 규칙

- 테스트보다 먼저 프로덕션 코드를 작성했다면 **즉시 삭제**하고 RED부터 다시 시작한다.
- 작성한 코드를 **참고용으로 남기는 것도 금지**한다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| 너무 단순해서 테스트 불필요 | 단순한 동작일수록 테스트 작성 비용이 낮고, 요구사항을 가장 빠르게 고정한다. |
| 나중에 추가하겠다 | 구현 뒤의 테스트는 구현을 검증하는 것이 아니라 정당화하기 쉽다. 지금 RED를 작성한다. |
| 시간이 없다 | 결함 탐색과 회귀 수정 비용이 더 크다. 범위를 줄여서라도 RED부터 시작한다. |
| 삭제하면 낭비 | 검증되지 않은 선행 코드는 설계 편향을 만든다. 삭제 비용이 계속 유지되는 비용보다 작다. |
| 프로토타입이다 | 프로토타입도 변경된다. 핵심 동작은 테스트로 고정해야 빠르게 반복할 수 있다. |

## Project Context

프롬프트에서 React 컴포넌트를 생성해 코드와 실행 가능한 미리보기를 제공한다. API 키는 브라우저 입력 또는 서버 환경변수에서 제공한다.

React 19, TypeScript, Vite, Bun, Vitest, Testing Library, react-live.

## Standards and References

- TypeScript는 strict 설정이며 미사용 지역 변수·매개변수도 오류다. 근거: `tsconfig.app.json:20-25`.
- 커밋 메시지는 `feat: 한국어 요약`, `fix: 한국어 요약`, `refactor: 한국어 요약`, `chore: 한국어 요약` 형식을 사용한다.
- 코드와 이 문서의 규칙이 어긋나면 구현을 바꾸기 전에 이 문서의 업데이트를 제안한다.

## Context Map

- **[React UI, 상태, 미리보기](./src/AGENTS.md)** — 브라우저 코드, 스타일, 컴포넌트 테스트를 수정할 때.
- **[Bun API와 AI 제공자](./server/AGENTS.md)** — 생성 요청, API 키 처리, 모델 폴백, 응답 정규화를 수정할 때.
