'use client';

import { useCalendarStore } from '@/lib/store';
import { useTranslations } from '@/lib/i18n';

export function ClearAllButton() {
  const reset = useCalendarStore((s) => s.reset);
  const hasContent = useCalendarStore(
    (s) =>
      Object.keys(s.monthPhotos).length > 0 ||
      Object.keys(s.digitImages).length > 0 ||
      Object.keys(s.photoTransforms).length > 0,
  );
  const t = useTranslations();

  const handleClick = () => {
    if (!confirm(t.clearAll.confirm)) return;
    reset();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasContent}
      className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {t.clearAll.button}
    </button>
  );
}
