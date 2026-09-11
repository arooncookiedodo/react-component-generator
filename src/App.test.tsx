import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ envKeys: { anthropic: false, google: false } }),
    }));
  });

  it('새로고침 후 저장된 설정과 생성 컴포넌트를 복원한다', () => {
    localStorage.setItem('react-component-generator:api-key', 'saved-api-key');
    localStorage.setItem('react-component-generator:provider', 'anthropic');
    localStorage.setItem('react-component-generator:prompt-history', JSON.stringify(['프로필 카드']));
    localStorage.setItem('react-component-generator:components', JSON.stringify([{
      id: 'component-1',
      prompt: '프로필 카드',
      code: 'render(<div />);',
      createdAt: '2026-09-11T03:00:00.000Z',
    }]));

    render(<App />);

    expect(screen.getByLabelText('API Key')).toHaveValue('saved-api-key');
    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
    expect(screen.getByText('프로필 카드')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('생성에 사용한 설정, 프롬프트 히스토리, 컴포넌트를 저장한다', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url === '/api/config') {
        return Promise.resolve({
          json: () => Promise.resolve({ envKeys: { anthropic: false, google: false } }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ code: 'render(<div />);' }),
      });
    }));
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    await user.type(screen.getByLabelText('API Key'), 'saved-api-key');
    await user.type(screen.getByRole('textbox', { name: '' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    await waitFor(() => {
      expect(localStorage.getItem('react-component-generator:api-key')).toBe('saved-api-key');
      expect(localStorage.getItem('react-component-generator:provider')).toBe('anthropic');
      expect(JSON.parse(localStorage.getItem('react-component-generator:prompt-history') ?? '[]'))
        .toEqual(['프로필 카드']);
      expect(JSON.parse(localStorage.getItem('react-component-generator:components') ?? '[]'))
        .toMatchObject([{ prompt: '프로필 카드', code: 'render(<div />);' }]);
    });
  });
});
