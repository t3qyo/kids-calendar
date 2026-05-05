import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale, useSetLocale } from './index';

const LOCALE_STORAGE_KEY = 'kids-calendar-locale';

function LocaleDisplay() {
  const locale = useLocale();
  return <div data-testid="locale">{locale}</div>;
}

function LocaleSwitcher() {
  const setLocale = useSetLocale();
  return (
    <>
      <button onClick={() => setLocale('ja')}>ja</button>
      <button onClick={() => setLocale('en')}>en</button>
    </>
  );
}

function TestApp() {
  return (
    <LocaleProvider>
      <LocaleDisplay />
      <LocaleSwitcher />
    </LocaleProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = '';
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LocaleProvider / detectLocale', () => {
  it('localStorage に保存済みのロケールが優先される', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    await act(async () => {
      render(<TestApp />);
    });
    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('localStorage が空のとき navigator.language が ja なら ja になる', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP');
    await act(async () => {
      render(<TestApp />);
    });
    expect(screen.getByTestId('locale').textContent).toBe('ja');
  });

  it('localStorage が空で navigator.language が非日本語なら en になる', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    await act(async () => {
      render(<TestApp />);
    });
    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('setLocale が localStorage と html[lang] を更新する', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TestApp />);
    });

    await user.click(screen.getByRole('button', { name: 'en' }));

    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('setLocale で ja に戻すと localStorage と html[lang] も ja になる', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    const user = userEvent.setup();
    await act(async () => {
      render(<TestApp />);
    });

    await user.click(screen.getByRole('button', { name: 'ja' }));

    expect(screen.getByTestId('locale').textContent).toBe('ja');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ja');
    expect(document.documentElement.lang).toBe('ja');
  });
});
