'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          color: '#111827',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <main
          style={{
            maxWidth: '24rem',
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>問題が発生しました</h2>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            アプリを表示できませんでした。再試行してください。
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              borderRadius: '0.25rem',
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            再試行
          </button>
        </main>
      </body>
    </html>
  );
}
