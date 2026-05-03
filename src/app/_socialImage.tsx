/**
 * Open Graph / Twitter Card 用の社交画像のレイアウト本体。
 * og (1200x630) と twitter (1200x600) で寸法だけ変えてレンダーするため共有する。
 */
export function SocialImageBody() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff8e7 0%, #ffe9d6 100%)',
        padding: '72px 96px',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
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
          fontSize: 80,
          fontWeight: 700,
          color: '#111827',
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        <span>てがき数字</span>
        <span>カレンダーメーカー</span>
      </div>
      <div style={{ marginTop: 28, fontSize: 28, color: '#4b5563', lineHeight: 1.4 }}>
        子供の写真と手書き数字で、世界に一つだけのオリジナルカレンダーを。
      </div>
    </div>
  );
}
