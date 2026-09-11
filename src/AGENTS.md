# Frontend Module Guide

## Module Context

`src`는 프롬프트 입력, 생성 결과 상태, 코드 보기와 react-live 미리보기를 담당한다. API 호출은 Vite가 프록시하는 상대 `/api` 경로만 사용한다.

## Tech Stack and Constraints

- React 19와 TypeScript를 사용한다. 새 브라우저 API 사용은 jsdom 테스트 환경에서 동작 여부를 확인한다.
- 생성 코드는 `LiveProvider`에 `noInline`으로 전달된다. 일반 JSX에 원문 코드를 삽입하거나 `dangerouslySetInnerHTML`로 대체하지 않는다. 근거: `components/LivePreview.tsx:14-18`.
- API 키는 컴포넌트 상태에서 다루고 현재 요청 본문에만 조건부로 포함한다. 사용자가 명시적으로 요청한 경우에만 이 브라우저의 `localStorage`에 영속화할 수 있으며, 저장소·로그·응답·번들 환경변수에는 추가하지 않는다. 근거: `App.tsx`, `utils/persistence.ts`, `hooks/useComponentGenerator.ts`.

## Implementation Patterns

- 생성 API 호출과 결과 배열 갱신은 `useComponentGenerator`에 둔다. 화면 컴포넌트에서 같은 fetch·로딩·오류 상태를 중복 구현하지 않는다. 근거: `hooks/useComponentGenerator.ts:13-60`, `App.tsx:21-38`.
- `GeneratedComponent`를 만들 때 `createdAt`을 `Date`로 유지한다. 카드가 `toLocaleTimeString`을 호출한다. 근거: `types/index.ts:3-8`, `components/ComponentCard.tsx:18-21`.
- 새로고침은 컴포넌트 카드의 `previewKey` 변경으로 미리보기를 리마운트한다. 생성 코드를 바꾸지 않고 이 동작을 유지한다. 근거: `components/ComponentCard.tsx:16-17`, `components/ComponentCard.tsx:31-38`, `components/ComponentCard.tsx:69-72`.

## Testing Strategy

- 전체 UI 테스트: `bun run test -- src`
- 사용자 상호작용은 Testing Library의 role 기반 질의와 `userEvent`로 검증한다. 근거: `components/PromptInput.test.tsx:1-29`.
- 테스트 사이 DOM 정리는 공통 setup이 담당하므로, 개별 테스트에 중복 cleanup을 추가하지 않는다. 근거: `test/setup.ts:1-8`, `vite.config.ts:16-20`.

## Local Golden Rules

- 프로바이더를 바꿀 때 입력 API 키를 비운다. 다른 제공자의 키를 재사용하지 않는다. 근거: `App.tsx:41-44`.
- 버튼 활성화와 로딩 표시는 제출 조건과 일치해야 한다. 프롬프트가 비었거나 생성 중이면 요청을 시작하지 않는다. 근거: `components/PromptInput.tsx:20-24`, `components/PromptInput.tsx:50-59`, `components/PromptInput.test.tsx:7-28`.
