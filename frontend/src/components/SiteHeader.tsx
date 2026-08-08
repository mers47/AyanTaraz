'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

interface NavItem {
  label: string;
  href: string;
}

const NAV: NavItem[] = [
  { label: 'خانه', href: '/' },
  { label: 'خدمات', href: '/#services' },
  { label: 'قوانین مالیاتی', href: '/tax-laws' },
  { label: 'ماشین حساب مالیاتی', href: '/tax-calculator' },
  { label: 'دستیار مالیاتی', href: '/chatbot' },
  { label: 'رزرو مشاوره', href: '/consultation' },
];

interface SiteHeaderProps {
  /** When true, the login modal is shown regardless of internal state.
   *  Used by pages to auto-open login (e.g. on session expiry). */
  externalOpen?: boolean;
  /** Called when the externally-opened login modal is closed. */
  onExternalClose?: () => void;
}

export default function SiteHeader({ externalOpen = false, onExternalClose }: SiteHeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // React to external open requests (e.g. ?expired=1 on home page).
  useEffect(() => {
    if (externalOpen) setShowLogin(true);
  }, [externalOpen]);

  const closeLogin = () => {
    setShowLogin(false);
    if (externalOpen) onExternalClose?.();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Logo — top-right in RTL (first item in the row) */}
        <Link href="/" className="brand-logo" aria-label="آین تراز — خانه">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-dark.webp" alt="لوگوی آین تراز" />
        </Link>

        {/* Desktop nav */}
        <nav className="hide-mobile" style={{ display: 'none', alignItems: 'center', gap: 4 }}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                padding: '8px 16px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 500,
                borderRadius: 8,
                transition: 'color .2s, background .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--brand-gold)';
                e.currentTarget.style.background = 'rgba(198,169,98,.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {n.label}
            </Link>
          ))}
          <style>{`@media(min-width:880px){nav.hide-mobile{display:flex!important}}`}</style>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowLogin(true)}
            className="btn btn-ghost hide-mobile"
            style={{ fontSize: '0.85rem', padding: '10px 16px', color: 'var(--text-secondary)' }}
          >
            ورود
          </button>
          <Link href="/consultation" className="btn btn-primary hide-mobile" style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
            مشاوره رایگان
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="hide-desktop"
            aria-label="منو"
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 10,
              display: 'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
          <style>{`@media(max-width:879px){button.hide-desktop{display:inline-flex!important;align-items:center;justify-content:center}}`}</style>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            background: 'rgba(7,7,10,.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '12px 20px 20px',
            animation: 'slideDown .25s var(--ease-expo)',
          }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '14px 0', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 500 }}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/consultation" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>
            مشاوره رایگان
          </Link>
          <button onClick={() => { setOpen(false); setShowLogin(true); }} className="btn btn-outline" style={{ marginTop: 8, width: '100%' }}>
            ورود
          </button>
        </div>
      )}

      {showLogin && (
        <LoginModal title="ورود به آین تراز" onClose={closeLogin} onSuccess={closeLogin} />
      )}
    </header>
  );
}
