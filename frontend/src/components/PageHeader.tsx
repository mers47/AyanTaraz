'use client';
import Link from 'next/link';

interface PageHeaderProps {
  title?: string;
  titleHref?: string;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  titleHref,
  showBack = true,
  backHref = '/',
  backLabel = 'بازگشت',
}: PageHeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 90,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(12, 12, 17, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '0 20px',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Link href="/" className="brand-logo" aria-label="آیان تراز — خانه" style={{ gap: 8 }}>
            <img src="/images/logo-dark.webp" alt="لوگوی آیان تراز" style={{ height: 36, width: 'auto' }} />
          </Link>
          {title && (
            <>
              <span style={{ color: 'var(--border-default)', fontSize: '1.1rem' }}>|</span>
              {titleHref ? (
                <Link href={titleHref} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{title}</Link>
              ) : (
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{title}</span>
              )}
            </>
          )}
        </div>
        {showBack && (
          <Link href={backHref} style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            {backLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
