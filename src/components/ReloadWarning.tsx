'use client';

import { useEffect } from 'react';
import { useCalendarStore } from '@/lib/store';

export function ReloadWarning() {
  const hasContent = useCalendarStore(
    (s) => Object.keys(s.monthPhotos).length > 0 || Object.keys(s.digitImages).length > 0,
  );

  useEffect(() => {
    if (!hasContent) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasContent]);

  return null;
}
