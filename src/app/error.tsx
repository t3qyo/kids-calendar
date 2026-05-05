'use client';

import { useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h2 className="text-xl font-semibold">{t.error.title}</h2>
      <p className="text-sm text-gray-600">{t.error.description}</p>
      {error.digest && (
        <p className="text-xs text-gray-400">{t.error.errorId(error.digest)}</p>
      )}
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
      >
        {t.error.retry}
      </button>
    </main>
  );
}
