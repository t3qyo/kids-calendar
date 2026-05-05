'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export default function NotFound() {
  const t = useTranslations();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h2 className="text-xl font-semibold">{t.notFound.title}</h2>
      <p className="text-sm text-gray-600">{t.notFound.description}</p>
      <Link
        href="/"
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
      >
        {t.notFound.backToTop}
      </Link>
    </main>
  );
}
