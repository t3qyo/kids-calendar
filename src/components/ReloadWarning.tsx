'use client';

import { useEffect } from 'react';
import { useProcessingStore } from '@/lib/processingStore';

export function ReloadWarning() {
  // 写真や数字は IndexedDB に永続化されるためリロードしても消えない。
  // 取り込み中(変換・キャンバス処理)の状態だけが本当に消える可能性があるので、
  // その間だけ離脱を警告する。
  const shouldWarn = useProcessingStore((s) => s.count > 0);

  useEffect(() => {
    if (!shouldWarn) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [shouldWarn]);

  return null;
}
