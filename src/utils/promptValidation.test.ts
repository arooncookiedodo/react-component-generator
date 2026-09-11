import { describe, expect, it } from 'vitest';
import { isValidPromptLength } from './promptValidation';

describe('isValidPromptLength', () => {
  it('500자 프롬프트를 허용한다', () => {
    expect(isValidPromptLength('a'.repeat(500))).toBe(true);
  });

  it('501자 프롬프트를 거부한다', () => {
    expect(isValidPromptLength('a'.repeat(501))).toBe(false);
  });
});
