'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

/* ---- Hero image slider data ----
   Real images, auto-advance with manual controls. */
const SLIDES = [
  {
    t: 'راهکارهای هوشمند مالیاتی',
    s: 'با آیان تراز، پیچیدگی‌های مالیاتی را به فرصت تبدیل کنید؛ تحلیل دقیق، کاهش قانونی بهره و آرامش خاطر.',
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
    d: 'تحلیل پرونده مالیاتی، شناسایی معافیت‌ها و کاهش قانونی بهدهی مالیاتی',
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
  return (
    <Suspense fallback={
      <div className="bg-pattern" style={{ background: 'var(--brand-black)', minHeight: '100vh' }}>
        <SiteHeader />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [as, sa] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState<string | null>(null);
  const [externalLogin, setExternalLogin] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const ns = useCallback(() => sa((s) => (s + 1) % SLIDES.length), []);

  // Handle ?expired=1 and ?login=required query params.
  // Sent by the API interceptor when an admin/session token expires.
  useEffect(() => {
    const expired = searchParams.get('expired');
    const loginRequired = searchParams.get('login');
    if (expired === '1' || loginRequired === 'required') {
      setExpiredMsg(expired === '1' ? 'نشست شما منقضی شد. لطفاً دوباره وارد شوید.' : 'برای دسترسی به این بخش ابتدا وارد شوید.');
      setExternalLogin(true);
      // Clean the URL so the message doesn't reappear on refresh.
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  // Auto-dismiss the expiry toast after 6 seconds.
  useEffect(() => {
    if (!expiredMsg) return;
    const t = setTimeout(() => setExpiredMsg(null), 6000);
    return () => clearTimeout(t);
  }, [expiredMsg]);

  // Auto-advance the image slider every 5s (pausable on hover/touch).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(ns, 5000);
    return () => clearInterval(id);
  }, [ns, paused]);

  return (
    <div className="bg-pattern" style={{ background: 'var(--brand-black)', minHeight: '100vh' }}>
      <SiteHeader externalOpen={externalLogin} onExternalClose={() => setExternalLogin(false)} />
      {expiredMsg && (
        <div className="toast-warning" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {expiredMsg}
        </div>
      )}
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
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 90, paddingBottom: 60 }}
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
            'radial-gradient(ellipse at 15% 40%, rgba(198,169,98,.14) 0%, transparent 55%), radial-gradient(ellipse at 85% 25%, rgba(234,217,166,.07) 0%, transparent 50%)',
          zIndex: 1,
        }}
      />

      {/* Text overlay — sits above slide + overlay (zIndex 3) */}
      <div className="container hero-content" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        <div style={{ maxWidth: 680 }}>
          <span className="badge badge-gold" style={{ marginBottom: 20 }}>
            {slides[as].tag}
          </span>
          <h1 key={`t-${as}`} className="animate-in hero-headline" style={{ fontSize: 'clamp(1.7rem,5vw,3.4rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 18 }}>
            {slides[as].t}
          </h1>
          <p key={`s-${as}`} className="animate-in stagger-1 hero-sub" style={{ fontSize: 'clamp(0.95rem,2vw,1.15rem)', color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 560, lineHeight: 1.85 }}>
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

      {/* Slide dots */}
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => sa(() => i)} className={`hero-dot${i === as ? ' active' : ''}`} aria-label={`اسلاید ${i + 1}`} />
        ))}
      </div>

      {/* Scroll-down indicator (desktop only) */}
      <div className="hide-mobile" style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 4 }}>
        <button className="scroll-indicator" onClick={scrollToServices} aria-label="اسکرول به پایین" style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}>
          <span>اسکرول</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <style>{`@media(min-width:881px){div.hide-mobile:has(.scroll-indicator){display:block}}`}</style>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {sv.map((s, i) => {
            const { ref, inView } = useInView(0.08);
            return (
              <div
                key={i}
                ref={ref}
                className="glass-card service-card"
                style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `all .45s var(--ease-expo) ${i * 100}ms`, padding: 28 }}
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
    { t: 'تخصص و تجربه', d: 'بیش از یک دهه فعالیت تخصصی در حوزه مالیات و حسابداری', icon: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z' },
    { t: 'دقت و شفافیت', d: 'گزارش‌های شفاف و قابل پیگیری با ارجاع به منابع رسمی', icon: 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z' },
    { t: 'پشتیبانی ۷/۲۴', d: 'تیم پشتیبانی همواره در دسترس برای پاسخ به پرسش‌های شما', icon: 'M12 1a4 4 0 00-4 4v6a4 4 0 008 0V5a4 4 0 00-4-4zm6 10a6 6 0 01-12 0H4a8 8 0 007 7.93V21h2v-2.07A8 8 0 0020 11h-2z' },
    { t: 'رعایت استانداردها', d: 'انطباق کامل با قوانین و مقررات مالیاتی ایران', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' },
  ];
  return (
    <section className="section" style={{ background: 'var(--brand-black-soft)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">چرا آیان تراز</span>
          <h2 className="section-title">
            اعتمادی <span className="gradient-text">پایدار و حرفه‌ای</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
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
        <div className="glass-card" style={{ padding: 'clamp(32px,6vw,52px)' }}>
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
  const social = [
    { l: 'اینستاگرام', h: 'https://instagram.com', i: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 002.12-1.38 5.86 5.86 0 001.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 00-1.38-2.12A5.86 5.86 0 0019.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z' },
    { l: 'تلگرام', h: 'https://telegram.org', i: 'M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56l.38-5.56 10.18-9.19c.44-.39-.1-.61-.69-.22L6.24 13.06l-5.42-1.69c-1.18-.36-1.19-1.16.25-1.72L22.36 2.1c.98-.36 1.84.22 1.55 1.69z' },
    { l: 'واتساپ', h: 'https://whatsapp.com', i: 'M17.47 14.38c-.3-.15-1.75-.87-2.02-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37s-1.04 1.02-1.04 2.5 1.06 2.9 1.21 3.1c.15.2 2.11 3.22 5.1 4.52.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.82c0 4.54-3.7 8.24-8.24 8.24z' },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '56px 0 32px', background: 'var(--brand-black-soft)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36, marginBottom: 36 }}>
          <div>
            <Link href="/" className="brand-logo" style={{ marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-dark.webp" alt="لوگوی آیان تراز" style={{ height: 44 }} />
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.9, marginTop: 12 }}>
              خدمات تخصصی حسابداری و مشاوره مالیاتی از سال ۱۳۹۰
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {social.map((s, i) => (
                <a
                  key={i}
                  href={s.h}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.l}
                  className="footer-social"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.i} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-primary)' }}>دسترسی سریع</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['دستیار مالیاتی', 'رزرو مشاوره', 'قوانین مالیاتی', 'ماشین حساب', 'پنل مدیریت'].map((l, i) => (
                <Link key={i} href={['/chatbot', '/consultation', '/tax-laws', '/tax-calculator', '/admin'][i]} className="footer-link">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-primary)' }}>خدمات ما</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['مشاوره مالیاتی', 'تنظیم اظهارنامه', 'حسابرسی مالی', 'دفترداری و حسابداری'].map((l, i) => (
                <Link key={i} href="/#services" className="footer-link">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-primary)' }}>تماس با ما</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                تهران، ایران
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, direction: 'ltr', fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" /></svg>
                021-12345678
              </div>
            </div>
          </div>
        </div>
        <div className="divider-gold" style={{ marginBottom: 22 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: 12 }}>
          <span>© ۱۴۰۴ آیان تراز — تمامی حقوق محفوظ است</span>
          <Link href="/admin" style={{ color: 'var(--text-muted)' }}>
            پنل مدیریت
          </Link>
        </div>
      </div>
    </footer>
  );
}
