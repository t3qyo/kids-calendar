'use client';

import { useLocale, useSetLocale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={() => setLocale('ja')}
        className={`px-2 py-1 rounded transition ${
          locale === 'ja'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        日本語
      </button>
      <span className="text-gray-300">/</span>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded transition ${
          locale === 'en'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        English
      </button>
    </div>
  );
}
