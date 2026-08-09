'use client';

// Global error boundary — catches errors that the root error.tsx cannot,
// including errors thrown in the root layout itself. Must render its own
// <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '24px',
          textAlign: 'center',
          background: '#07070a',
          color: '#f7f6f3',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif',
        }}
      >
        <div style={{ fontSize: '3rem' }} aria-hidden="true">
          {'\u26A0\uFE0F'}
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          خطای سیستمی رخ داده است
        </h1>
        <p style={{ maxWidth: '420px', fontSize: '0.95rem', lineHeight: 1.9, color: '#a7a7b0' }}>
          متأسفانه یک خطای پیش‌بینی‌نشده در برنامه رخ داد. لطفاً صفحه را مجدداً بارگذاری کنید.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px',
            borderRadius: '14px',
            border: '1px solid #c6a962',
            background: 'linear-gradient(135deg, #9c7f3f, #c6a962)',
            color: '#07070a',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          تلاش مجدد
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html: 'console.error(' + JSON.stringify(error?.digest || error?.message || 'unknown') + ')',
          }}
        />
      </body>
    </html>
  );
}
