import type { GeneratedComponent, Provider } from '../types';

const STORAGE_KEYS = {
  apiKey: 'react-component-generator:api-key',
  provider: 'react-component-generator:provider',
  promptHistory: 'react-component-generator:prompt-history',
  components: 'react-component-generator:components',
} as const;

function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 브라우저 저장소를 사용할 수 없으면 현재 세션 상태만 유지한다.
  }
}

function parseArray(value: string | null): unknown[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStringArray(value: string | null): string[] {
  const parsed = parseArray(value);
  return parsed.every((item) => typeof item === 'string') ? parsed as string[] : [];
}

function isProvider(value: string | null): value is Provider {
  return value === 'anthropic' || value === 'google';
}

export function loadApiKey(): string {
  return getItem(STORAGE_KEYS.apiKey) ?? '';
}

export function saveApiKey(apiKey: string): void {
  setItem(STORAGE_KEYS.apiKey, apiKey);
}

export function loadProvider(): Provider {
  const provider = getItem(STORAGE_KEYS.provider);
  return isProvider(provider) ? provider : 'google';
}

export function saveProvider(provider: Provider): void {
  setItem(STORAGE_KEYS.provider, provider);
}

export function loadPromptHistory(): string[] {
  return parseStringArray(getItem(STORAGE_KEYS.promptHistory));
}

export function savePromptHistory(promptHistory: string[]): void {
  setItem(STORAGE_KEYS.promptHistory, JSON.stringify(promptHistory));
}

export function loadComponents(): GeneratedComponent[] {
  const storedComponents = parseArray(getItem(STORAGE_KEYS.components));

  return storedComponents.flatMap((storedComponent) => {
    if (typeof storedComponent !== 'object' || storedComponent === null) {
      return [];
    }

    const component = storedComponent as Record<string, unknown>;
    const createdAt = new Date(String(component.createdAt));

    if (
      typeof component.id !== 'string' ||
      typeof component.prompt !== 'string' ||
      typeof component.code !== 'string' ||
      Number.isNaN(createdAt.getTime())
    ) {
      return [];
    }

    return [{ id: component.id, prompt: component.prompt, code: component.code, createdAt }];
  });
}

export function saveComponents(components: GeneratedComponent[]): void {
  setItem(
    STORAGE_KEYS.components,
    JSON.stringify(components),
  );
}
