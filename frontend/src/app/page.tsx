'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

/* ---- Hero image slider data ----
   Real images, auto-advance with manual controls. */
const SLIDES = [
  {
    t: 'راهکارهای هوشمند مالیاتی',
    s: 'با آین تراز، پیچیدگی‌های مالیاتی را به فرصت تبدیل کنید؛ تحلیل دقیق، کاهش قانونی بدهی و آرامش خاطر.',
    tag: 'مشاوره تخصصی',
    img: 'https://images.unsplash.com/photo-1554224155-6726b9ff8cb2?auto=format&fit=crop&w=1920&q=80',
  },
  {
    t: 'تنظیم اظهارنامه مالیاتی',
    s: 'دقیق، به‌موقع و بدون نگرانی از جرایم مالیاتی؛ اظهارنامه عملکرد، ارزش افزوده و گزارش‌های فصلی.',
    tag: 'خدمات مالی',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80',
  },
  {
    t: 'برنامه‌ریزی مالیاتی کسب‌وکارها',
    s: 'استراتژی‌های کاهش هزینه مالیاتی برای رشد پایدار و رقابت‌پذیری در بازار.',
    tag: 'راهبری مالی',
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80',
  },
];

const SV = [
  {
    i: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    n: 'مشاوره مالیاتی',
    d: 'تحلیل پرونده مالیاتی، شناسایی معافیت‌ها و کاهش قانونی بدهی مالیاتی',
    tags: ['بررسی پرونده', 'معافیت‌ها', 'برنامه‌ریزی'],
  },
  {
    i: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
    n: 'تنظیم اظهارنامه',
    d: 'تنظیم و ارسال اظهارنامه عملکرد، ارزش افزوده و گزارش‌های فصلی',
    tags: ['اظهارنامه', 'گزارش فصلی', 'ارزش افزوده'],
  },
  {
    i: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    n: 'حسابرسی مالی',
    d: 'بررسی صحت اسناد مالی، کشف مغایرت‌ها و ارائه گزارش‌های تحلیلی',
    tags: ['حسابرسی', 'گزارش تحلیلی', 'رفع مغایرت'],
  },
  {
    i: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    n: 'دفترداری و حسابداری',
    d: 'ثبت و نگهداری اسناد مالی، دفتر روزنامه و کل، تهیه صورت‌های مالی',
    tags: ['دفترداری', 'صورت‌های مالی', 'بایگانی'],
  },
];

const ST = [
  { n: '۱۲', l: 'سال تجربه' },
  { n: '۱۰۰۰', l: 'پرونده موفق' },
  { n: '۹۸٪', l: 'رضایت مشتریان' },
  { n: '۷/۲۴', l: 'پشتیبانی' },
];

const FQ = [
  { q: 'چه زمانی اظهارنامه ارائه دهم؟', a: 'اشخاص حقیقی تا پایان خردادماه و اشخاص حقوقی ۴ ماه پس از پایان سال مالی.' },
  { q: 'خدمات شامل اعتراض به برگ تشخیص می‌شود؟', a: 'بله، تیم ما تجربه کامل در تنظیم لایحه اعتراض دارد.' },
  { q: 'نرخ ارزش افزوده چقدر است؟', a: '۱۰٪ (۹٪ مالیات + ۱٪ عوارض).' },
  { q: 'مشاوره اولیه رایگان است؟', a: 'بله، ۳۰ دقیقه جلسه اولیه رایگان.' },
];

function useInView(t = 0.05) {
  const r = useRef<HTMLDivElement>(null);
  const [v, sv] = useState(false);
  useEffect(() => {
    const e = r.current;
    if (!e) return;
    const o = new IntersectionObserver(
      ([x]) => {
        if (x.isIntersecting) {
          sv(true);
          o.unobserve(e);
        }
      },
      { threshold: t },
    );
    o.observe(e);
    return () => o.disconnect();
  }, [t]);
  return { ref: r, inView: v };
}

export default function Home() {
  const [as, sa] = useState(0);
  const [paused, setPaused] = useState(false);
  const ns = useCallback(() => sa((s) => (s + 1) % SLIDES.length), []);

  // Auto-advance the image slider every 4.5s (pausable on hover).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(ns, 4500);
    return () => clearInterval(id);
  }, [ns, paused]);

  return (
    <div className="bg-pattern" style={{ background: 'var(--brand-black)', minHeight: '100vh' }}>
      <SiteHeader />
      <Hero as={as} sa={sa} slides={SLIDES} paused={paused} setPaused={setPaused} />
      <Stats st={ST} />
      <Svc sv={SV} />
      <WhyUs />
      <CTA />
      <Faq fq={FQ} />
      <Foo />
    </div>
  );
}

function Hero({
  as,
  sa,
  slides,
  paused,
  setPaused,
}: {
  as: number;
  sa: (f: (s: number) => number) => void;
  slides: typeof SLIDES;
  paused: boolean;
  setPaused: (v: boolean) => void;
}) {
  return (
    <section
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image slides */}
      {slides.map((s, i) => (
        <div key={i} className={`hero-slide${i === as ? ' active' : ''}`} style={{ backgroundImage: `url(${s.img})` }} aria-hidden={i !== as} />
      ))}

      {/* Ambient gold glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 15% 40%, rgba(198,169,98,.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 25%, rgba(234,217,166,.06) 0%, transparent 50%)',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 740 }}>
          <span className="badge badge-gold" style={{ marginBottom: 20 }}>
            {slides[as].tag}
          </span>
          <h1 key={`t-${as}`} className="animate-in" style={{ fontSize: 'clamp(2rem,5.5vw,3.6rem)', fontWeight: 900, lineHeight: 1.12, marginBottom: 20 }}>
            {slides[as].t}
          </h1>
          <p key={`s-${as}`} className="animate-in stagger-1" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 580, lineHeight: 1.85 }}>
            {slides[as].s}
          </p>
          <div className="animate-in stagger-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/chatbot" className="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              دستیار هوشمند
            </Link>
            <Link href="/consultation" className="btn btn-outline btn-lg">
              رزرو مشاوره
            </Link>
          </div>
        </div>
      </div>

      {/* Slide dots + counter */}
      <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => sa(() => i)} className={`hero-dot${i === as ? ' active' : ''}`} aria-label={`اسلاید ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}

function Stats({ st }: { st: typeof ST }) {
  return (
    <section style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '48px 0', background: 'var(--brand-black-soft)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 28, textAlign: 'center' }}>
        {st.map((s, i) => {
          const { ref, inView } = useInView(0.1);
          return (
            <div
              key={i}
              ref={ref}
              style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: `all .4s var(--ease-expo) ${i * 120}ms` }}
            >
              <div className="gradient-text" style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 900, marginBottom: 2 }}>
                {s.n}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.l}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Svc({ sv }: { sv: typeof SV }) {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">خدمات ما</span>
          <h2 className="section-title">
            راهکارهای <span className="gradient-text">جامع مالی و مالیاتی</span>
          </h2>
          <p className="section-subtitle">از مشاوره تا اجرا، تمام نیازهای مالی و مالیاتی شما در یک مجموعه تخصصی</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {sv.map((s, i) => {
            const { ref, inView } = useInView(0.08);
            return (
              <div
                key={i}
                ref={ref}
                className="glass-card service-card"
                style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `all .45s var(--ease-expo) ${i * 100}ms`, padding: 30 }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(198,169,98,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--brand-gold)">
                    <path d={s.i} />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{s.n}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 18 }}>{s.d}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.tags.map((t, j) => (
                    <span key={j} style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const items = [
    { t: 'تخصص و تجربه', d: 'بیش از یک دهه فعالیت تخصصی در حوزه مالیات و حسابرسی', icon: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z' },
    { t: 'دقت و شفافیت', d: 'گزارش‌های شفاف و قابل پیگیری با ارجاع به منابع رسمی', icon: 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z' },
    { t: 'پشتیبانی ۷/۲۴', d: 'تیم پشتیبانی همواره در دسترس برای پاسخ به پرسش‌های شما', icon: 'M12 1a4 4 0 00-4 4v6a4 4 0 008 0V5a4 4 0 00-4-4zm6 10a6 6 0 01-12 0H4a8 8 0 007 7.93V21h2v-2.07A8 8 0 0020 11h-2z' },
    { t: 'رعایت استانداردها', d: 'انطباق کامل با قوانین و مقررات مالیاتی ایران', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' },
  ];
  return (
    <section className="section" style={{ background: 'var(--brand-black-soft)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">چرا آین تراز</span>
          <h2 className="section-title">
            اعتمادی <span className="gradient-text">پایدار و حرفه‌ای</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {items.map((it, i) => {
            const { ref, inView } = useInView(0.1);
            return (
              <div
                key={i}
                ref={ref}
                className="glass-card"
                style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: `all .4s var(--ease-expo) ${i * 90}ms`, textAlign: 'center' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(198,169,98,.15), rgba(198,169,98,.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(198,169,98,.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="1.8">
                    <path d={it.icon} />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{it.t}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{it.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ padding: '90px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(198,169,98,.06) 0%, transparent 40%, rgba(198,169,98,.04) 100%)' }} />
      <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: 52 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-gold), var(--brand-gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(198,169,98,.25)', animation: 'goldPulse 2.5s ease-in-out infinite' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#07070a">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, marginBottom: 16 }}>
            برای <span className="gradient-text">مشاوره تخصصی</span> آماده‌اید؟
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem', lineHeight: 1.8 }}>
            همین حالا با دستیار هوشمند مالیاتی ما گفتگو کنید و مسیر درست را بیابید.
          </p>
          <Link href="/chatbot" className="btn btn-primary btn-lg" style={{ fontSize: '1rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            شروع گفتگو با دستیار مالیاتی
          </Link>
        </div>
      </div>
    </section>
  );
}

function Faq({ fq }: { fq: typeof FQ }) {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 740 }}>
        <div className="section-header">
          <span className="section-tag">سوالات متداول</span>
          <h2 className="section-title">پرسش‌های پرتکرار</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fq.map((f, i) => (
            <details key={i} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)' }}>
              <summary style={{ padding: '16px 22px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {f.q}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div style={{ padding: '14px 22px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.9, borderTop: '1px solid var(--border-subtle)' }}>{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Foo() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '48px 0', background: 'var(--brand-black-soft)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36, marginBottom: 36 }}>
          <div>
            <Link href="/" className="brand-logo" style={{ marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-dark.webp" alt="لوگوی آین تراز" style={{ height: 44 }} />
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.9, marginTop: 12 }}>
              خدمات تخصصی حسابداری و مشاوره مالیاتی از سال ۱۳۹۰
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>دسترسی سریع</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['دستیار مالیاتی', 'رزرو مشاوره', 'پنل مدیریت'].map((l, i) => (
                <Link key={i} href={['/chatbot', '/consultation', '/admin'][i]} style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>تماس</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 2 }}>
              تهران، ایران
              <br />
              ۰۲۱-۱۲۳۴۵۶۷۸
            </div>
          </div>
        </div>
        <div className="divider-gold" style={{ marginBottom: 22 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>© ۱۴۰۴ آین تراز</span>
          <Link href="/admin" style={{ color: 'var(--text-muted)' }}>
            پنل مدیریت
          </Link>
        </div>
      </div>
    </footer>
  );
}
