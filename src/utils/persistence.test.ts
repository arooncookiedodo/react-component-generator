import { beforeEach, describe, expect, it } from 'vitest';
import type { GeneratedComponent } from '../types';
import {
  loadApiKey,
  loadComponents,
  loadPromptHistory,
  loadProvider,
  saveApiKey,
  saveComponents,
  savePromptHistory,
  saveProvider,
} from './persistence';

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('API 키를 저장하고 복원한다', () => {
    saveApiKey('test-api-key');

    expect(loadApiKey()).toBe('test-api-key');
  });

  it('선택한 Provider를 저장하고 복원한다', () => {
    saveProvider('anthropic');

    expect(loadProvider()).toBe('anthropic');
  });

  it('프롬프트 히스토리를 저장하고 복원한다', () => {
    savePromptHistory(['프로필 카드', '검색 필터']);

    expect(loadPromptHistory()).toEqual(['프로필 카드', '검색 필터']);
  });

  it('생성된 컴포넌트를 Date 값을 유지해 저장하고 복원한다', () => {
    const components: GeneratedComponent[] = [{
      id: 'component-1',
      prompt: '프로필 카드',
      code: 'render(<div />);',
      createdAt: new Date('2026-09-11T03:00:00.000Z'),
    }];

    saveComponents(components);

    const restoredComponents = loadComponents();
    expect(restoredComponents).toEqual(components);
    expect(restoredComponents[0]?.createdAt).toBeInstanceOf(Date);
  });
});
