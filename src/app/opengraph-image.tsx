import { ImageResponse } from 'next/og';

// Open Graph / Twitter カード用のシンプルな自動生成画像。
// /opengraph-image として Vercel の Fluid Compute (Node.js) で生成される。
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'てがき風カレンダーメーカー';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff8e7 0%, #ffe9d6 100%)',
          padding: '80px 96px',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: '#1f2937',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 700,
              fontStyle: 'italic',
            }}
          >
            12
          </div>
          <div style={{ fontSize: 36, color: '#6b7280', fontWeight: 500 }}>2026</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 84,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          <span>てがき風</span>
          <span>カレンダーメーカー</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 30, color: '#4b5563', lineHeight: 1.4 }}>
          子供の写真と手書き数字で、世界に一つだけのオリジナルカレンダーを。
        </div>
      </div>
    ),
    size,
  );
}
