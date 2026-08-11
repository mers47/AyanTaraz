'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  // Determine if a nav item is "active" — matches exact path or section anchor on home.
  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

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

  // Close mobile menu on route change is handled by onClick handlers.
  // Prevent body scroll when mobile menu is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Logo — top-right in RTL (first item in the row) */}
        <Link href="/" className="brand-logo" aria-label="آیان تراز — خانه">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-dark.webp" alt="لوگوی آیان تراز" />
        </Link>

        {/* Desktop nav */}
        <nav className="hide-mobile" style={{ display: 'none', alignItems: 'center', gap: 2 }}>
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  padding: '8px 14px',
                  color: active ? 'var(--brand-gold)' : 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: active ? 600 : 500,
                  borderRadius: 8,
                  transition: 'color .2s, background .2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--brand-gold)';
                    e.currentTarget.style.background = 'rgba(198,169,98,.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {n.label}
                {active && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 18,
                      height: 2,
                      borderRadius: 1,
                      background: 'linear-gradient(90deg, var(--brand-gold-dark), var(--brand-gold-light))',
                    }}
                  />
                )}
              </Link>
            );
          })}
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
            aria-expanded={open}
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
          <style>{`@media(max-width:879px){button.hide-desktop{display:inline-flex!important;align-items:center;justify-content:center}}`}</style>
        </div>
      </div>

      {/* Mobile menu — full-screen premium overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            background: 'rgba(7,7,10,.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding: '80px 24px 32px',
            zIndex: 99,
            animation: 'slideDown .3s var(--ease-expo)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflowY: 'auto',
          }}
        >
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 12px',
                  color: active ? 'var(--brand-gold)' : 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontWeight: active ? 700 : 600,
                  fontSize: '1rem',
                  transition: 'color .2s',
                  background: active ? 'rgba(198,169,98,.05)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--brand-gold)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                <svg width="6" height="6" viewBox="0 0 6 6" fill={active ? 'var(--brand-gold)' : 'var(--brand-gold)'} opacity={active ? 1 : 0.5}>
                  <circle cx="3" cy="3" r="3" />
                </svg>
                {n.label}
              </Link>
            );
          })}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/consultation" onClick={() => setOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
              مشاوره رایگان
            </Link>
            <button onClick={() => { setOpen(false); setShowLogin(true); }} className="btn btn-outline" style={{ width: '100%' }}>
              ورود
            </button>
          </div>
        </div>
      )}

      {showLogin && (
        <LoginModal title="ورود به آیان تراز" onClose={closeLogin} onSuccess={closeLogin} />
      )}
    </header>
  );
}
