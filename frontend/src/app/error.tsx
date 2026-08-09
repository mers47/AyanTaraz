'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Page error:', error?.digest || error?.message);
  }, [error]);

  return (
    <main
      role="alert"
      aria-live="assertive"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '24px',
        textAlign: 'center',
        background:
          'radial-gradient(ellipse at 50% 0%, var(--brand-black-soft) 0%, var(--brand-black) 70%)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background:
            'conic-gradient(from 0deg, var(--brand-gold), var(--brand-gold-dark), var(--brand-gold-light), var(--brand-gold))',
          animation: 'spinBorder 6s linear infinite',
        }}
      >
        <div
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--brand-black)',
            fontSize: '2rem',
          }}
        >
          <span>{'\u26A0\uFE0F'}</span>
        </div>
      </div>

      <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.3 }}>
        خطایی رخ داده است
      </h1>
      <p
        style={{
          maxWidth: '420px',
          fontSize: '1rem',
          lineHeight: 1.9,
          color: 'var(--text-secondary)',
        }}
      >
        متأسفانه در بارگذاری این صفحه مشکلی پیش آمد. لطفاً دوباره تلاش کنید یا به صفحه اصلی
        بازگردید.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--brand-gold)',
            background: 'linear-gradient(135deg, var(--brand-gold-dark), var(--brand-gold))',
            color: 'var(--brand-black)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'transform 0.2s var(--ease-expo), box-shadow 0.2s var(--ease-expo)',
          }}
        >
          تلاش مجدد
        </button>
        <Link
          href="/"
          style={{
            padding: '12px 28px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
            transition: 'border-color 0.2s var(--ease-expo)',
          }}
        >
          بازگشت به خانه
        </Link>
      </div>
    </main>
  );
}
