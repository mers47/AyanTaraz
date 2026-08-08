'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      <PageHeader title="درباره ما" />

      <div className="container section">
        <div className="section-header">
          <span className="section-tag">درباره ما</span>
          <h1 className="section-title gradient-text">آین تراز</h1>
          <p className="section-subtitle">تخصص، دقت، اعتماد — همراه شما در مسیر مالیاتی</p>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="glass-card">
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 16, color: 'var(--brand-gold)' }}>🧭 مأموریت ما</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 2, fontSize: '0.9375rem' }}>
              آین تراز با هدف ارائه خدمات تخصصی حسابداری و مشاوره مالیاتی به اشخاص حقیقی و حقوقی تأسیس شده است.
            </p>
          </div>

          <div className="glass-card">
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 16, color: 'var(--brand-gold)' }}>📊 خدمات ما</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { i: '🧭', t: 'مشاوره مالیاتی' },
                { i: '📄', t: 'تنظیم اظهارنامه' },
                { i: '🗓️', t: 'وقت مشاوره' },
                { i: '📚', t: 'مقالات و بوک' },
                { i: '🎬', t: 'ویدیو' },
                { i: '🤖', t: 'دستیار' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(198,169,98,0.04)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.i}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{s.t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 12, color: 'var(--brand-gold)' }}>📞 تماس با ما</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 16 }}>برای مشاوره تخصصی با ما تماس بگیرید</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/consultation" className="btn btn-primary">📅 رزرو وقت مشاوره</Link>
              <Link href="/chatbot" className="btn btn-outline">🤖 دستیار هوشمند</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
