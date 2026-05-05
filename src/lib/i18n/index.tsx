'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ja } from './ja';
import { en } from './en';

export type Locale = 'ja' | 'en';

export type Messages = {
  site: {
    title: string;
    description: string;
  };
  header: {
    autosave: string;
  };
  clearAll: {
    button: string;
    confirm: string;
  };
  steps: {
    step1: { title: string; description: string };
    step2: { title: string; description: string };
    step3: { title: string; description: string };
    step4: { title: string };
    step5: { title: string };
    step6: { title: string; paperLabel: string; pdfNote: string };
  };
  startMonth: {
    startYearLabel: string;
    startMonthLabel: string;
    yearOption: (y: number) => string;
    monthOption: (m: number) => string;
    rangeInfo: (sy: number, sm: number, ey: number, em: number) => string;
  };
  photoUploader: {
    adjustRange: string;
    processing: string;
    selectPhoto: string;
    adjustButton: string;
    replace: string;
    clear: string;
    errorLoad: string;
    monthLabel: (year: number, month: number) => string;
  };
  digitUploader: {
    hint: string;
    processing: string;
    photo: string;
    clear: string;
    errorLoad: string;
  };
  export: {
    pdfButton: string;
    pngButton: string;
    exporting: (current: number, total: number) => string;
    errorPdf: string;
    errorPng: string;
    printHint: {
      title: string;
      paperA4: string;
      twoUp: string;
      cropAfterPrint: string;
      paperExact: string;
      clipMargin: (mm: number, side: 'top' | 'bottom') => string;
      doubleSided: string;
      bindTop: string;
      flipInstruction: string;
    };
  };
  paperSize: {
    a4Label: string;
    a4Description: string;
    exactLabel: string;
    exactDescription: string;
  };
  layout: {
    wall: string;
    deskHorizontal: string;
  };
  calendar: {
    noPhoto: string;
  };
  notFound: {
    title: string;
    description: string;
    backToTop: string;
  };
  error: {
    title: string;
    description: string;
    errorId: (digest: string) => string;
    retry: string;
  };
};

const MESSAGES: Record<Locale, Messages> = { ja, en };

const LOCALE_STORAGE_KEY = 'kids-calendar-locale';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'ja';
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'ja' || stored === 'en') return stored;
  } catch {
    // localStorage がブロックされている環境では無視
  }
  const lang = navigator.language ?? '';
  return lang.startsWith('ja') ? 'ja' : 'en';
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ja',
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ja');

  // クライアント側でロケールを検出して初期化。
  // SSR との hydration ミスマッチを避けるため useEffect で更新する必要があり、
  // 同期 setState だが初回マウント時の一度だけなので意図的に許容する。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(detectLocale());
  }, []);

  // ロケール変更時に localStorage と html[lang] を更新
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // localStorage がブロックされている環境では無視
    }
    document.documentElement.lang = newLocale;
  }, []);

  // locale が変わったら html[lang] を同期
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useSetLocale(): (locale: Locale) => void {
  return useContext(LocaleContext).setLocale;
}

export function useTranslations(): Messages {
  const locale = useLocale();
  return MESSAGES[locale];
}
