import Link from 'next/link';

export default function NotFound() {
  return (
    <main
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
      {/* Big 404 with gold foil gradient */}
      <h1
        className="gradient-text"
        style={{
          fontSize: 'clamp(5rem, 22vw, 9rem)',
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background:
            'linear-gradient(135deg, var(--brand-gold-light) 0%, var(--brand-gold) 40%, var(--brand-gold-dark) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        ۴۰۴
      </h1>

      <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 700 }}>
        صفحه مورد نظر یافت نشد
      </h2>
      <p
        style={{
          maxWidth: '420px',
          fontSize: '1rem',
          lineHeight: 1.9,
          color: 'var(--text-secondary)',
        }}
      >
        آدرسی که وارد کرده‌اید وجود ندارد یا از سیستم حذف شده است. می‌توانید به صفحه اصلی بازگردید
        و مسیر خود را دوباره پیدا کنید.
      </p>

      <Link
        href="/"
        style={{
          marginTop: '8px',
          padding: '13px 32px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--brand-gold)',
          background: 'linear-gradient(135deg, var(--brand-gold-dark), var(--brand-gold))',
          color: 'var(--brand-black)',
          fontWeight: 700,
          fontSize: '0.95rem',
          textDecoration: 'none',
          display: 'inline-block',
          transition: 'transform 0.2s var(--ease-expo), box-shadow 0.2s var(--ease-expo)',
        }}
      >
        بازگشت به خانه
      </Link>
    </main>
  );
}
