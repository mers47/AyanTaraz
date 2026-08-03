'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const slides = [
  { title: 'راهکارهای هوشمند مالیاتی', subtitle: 'با آیان تراز، پیچیدگی‌های مالیاتی را به فرصت تبدیل کنید', tag: 'مشاوره تخصصی' },
  { title: 'تنظیم اظهارنامه مالیاتی', subtitle: 'دقیق، به‌موقع و بدون نگرانی از جرایم مالیاتی', tag: 'خدمات مالی' },
  { title: 'مشاوره مالیاتی کسب‌وکارها', subtitle: 'برنامه‌ریزی استراتژیک برای کاهش هزینه‌های مالیاتی شما', tag: 'راهبری مالی' },
];

const services = [
  { id: 1, icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', title: 'مشاوره مالیاتی', desc: 'تحلیل پرونده مالیاتی، شناسایی معافیت‌ها و کاهش قانونی بدهی مالیاتی. مشاوره تخصصی برای اشخاص حقیقی و حقوقی.', items: ['بررسی پرونده', 'معافیت‌های قانونی', 'برنامه‌ریزی سالانه'] },
  { id: 2, icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z', title: 'تنظیم اظهارنامه', desc: 'تنظیم و ارسال اظهارنامه عملکرد، ارزش افزوده و گزارش‌های فصلی با رعایت کامل مواعد قانونی.', items: ['اظهارنامه عملکرد', 'گزارش فصلی', 'ارزش افزوده'] },
  { id: 3, icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z', title: 'حسابرسی مالی', desc: 'بررسی و تأیید صحت اسناد مالی، کشف مغایرت‌ها و ارائه گزارش‌های تحلیلی برای تصمیم‌گیری.', items: ['حسابرسی داخلی', 'گزارش تحلیلی', 'رفع مغایرت'] },
  { id: 4, icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', title: 'دفترداری و حسابداری', desc: 'ثبت و نگهداری اسناد مالی، دفتر روزنامه و کل، تهیه صورت‌های مالی مطابق با استانداردهای قانونی.', items: ['دفترداری قانونی', 'صورت‌های مالی', 'بایگانی اسناد'] },
];

const features = [
  { num: '+۱۲', label: 'سال تجربه', suffix: '' },
  { num: '۱۰۰۰+', label: 'پرونده موفق', suffix: '' },
  { num: '۹۸٪', label: 'رضایت مشتریان', suffix: '' },
  { num: '۲۴/۷', label: 'پشتیبانی', suffix: '' },
];

const faq = [
  { q: 'چه زمانی باید اظهارنامه مالیاتی ارائه دهم؟', a: 'اشخاص حقیقی تا پایان خردادماه و اشخاص حقوقی حداکثر ۴ ماه پس از پایان سال مالی باید اظهارنامه ارائه دهند.' },
  { q: 'آیا خدمات شما شامل اعتراض به برگ تشخیص مالیات می‌شود؟', a: 'بله، تیم ما تجربه کامل در تنظیم لایحه اعتراض و پیگیری در هیئت‌های حل اختلاف مالیاتی دارد.' },
  { q: 'نرخ مالیات بر ارزش افزوده چقدر است؟', a: 'نرخ فعلی ۱۰٪ (۹٪ مالیات + ۱٪ عوارض) است که برای برخی کالاهای اساسی معافیت وجود دارد.' },
  { q: 'آیا مشاوره اولیه رایگان است؟', a: 'بله، جلسه مشاوره اولیه ۳۰ دقیقه‌ای کاملاً رایگان و بدون تعهد می‌باشد.' },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  const nextSlide = useCallback(() => setActiveSlide(s => (s + 1) % slides.length), []);
  const goSlide = (i: number) => setActiveSlide(i);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCards(prev => {
        if (prev.length >= services.length) return prev;
        return [...prev, prev.length];
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{background:'var(--brand-black)'}}>
      {/* ═══ HEADER ═══ */}
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'12px',fontWeight:800,fontSize:'1.25rem',color:'var(--brand-gold)'}}>
            <span style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center',color:'#0a0a0a',fontWeight:900,fontSize:'0.875rem'}}>آت</span>
            آیان تراز
            <span style={{fontSize:'0.625rem',opacity:0.5,fontWeight:400,marginRight:4}}>از ۱۳۹۰</span>
          </Link>
          <nav className="hide-mobile" style={{display:'none'}}>
            {['خدمات', 'دستیار مالیاتی', 'رزرو مشاوره', 'درباره ما', 'تماس'].map((l,i) => (
              <Link key={i} href={i===0?'#services':i===1?'/chatbot':i===2?'/consultation':'#'} style={{padding:'8px 16px',color:'var(--text-secondary)',fontSize:'0.875rem',fontWeight:500,transition:'all 150ms'}} className="nav-link" onMouseEnter={e=>e.currentTarget.style.color='var(--brand-gold)'} onMouseLeave={e=>e.currentTarget.style.color=''}>
                {l}
              </Link>
            ))}
          </nav>
          <style>{`@media(min-width:768px){nav.hide-mobile{display:flex!important;align-items:center;gap:4px}}`}</style>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <Link href="/chatbot" className="btn btn-primary hide-mobile" style={{fontSize:'0.8125rem',padding:'10px 20px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              مشاوره رایگان
            </Link>
            <button onClick={()=>setMobileMenu(!mobileMenu)} className="hide-desktop" style={{background:'none',border:'none',color:'var(--text-primary)',cursor:'pointer',padding:8,display:'none'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{mobileMenu?<path d="M18 6L6 18M6 6l12 12"/>:<path d="M3 12h18M3 6h18M3 18h18"/>}</svg>
            </button>
          </div>
        </div>
        <style>{`@media(max-width:767px){button.hide-desktop{display:block!important}}`}</style>
        {mobileMenu && (
          <div style={{background:'rgba(10,10,10,0.98)',backdropFilter:'blur(20px)',borderTop:'1px solid var(--border-subtle)',padding:'16px 20px',animation:'slideDown 200ms var(--ease-out-expo)'}}>
            {['خدمات','دستیار مالیاتی','رزرو مشاوره','درباره ما'].map((l,i)=>(
              <Link key={i} href={i===0?'#services':i===1?'/chatbot':i===2?'/consultation':'#'} onClick={()=>setMobileMenu(false)} style={{display:'block',padding:'12px 0',color:'var(--text-secondary)',fontSize:'0.9375rem',borderBottom:'1px solid var(--border-subtle)'}}>{l}</Link>
            ))}
            <Link href="/chatbot" onClick={()=>setMobileMenu(false)} className="btn btn-primary" style={{marginTop:16,width:'100%'}}>مشاوره رایگان</Link>
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden',paddingTop:80}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 20% 50%, rgba(198,169,98,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(224,200,120,0.04) 0%, transparent 50%)'}} />
        <div className="container" style={{position:'relative',zIndex:2}}>
          <div style={{maxWidth:720}}>
            <span className="badge badge-gold" style={{marginBottom:24,fontSize:'0.75rem',padding:'6px 16px'}}>{slides[activeSlide].tag}</span>
            <h1 className="animate-in" key={`t-${activeSlide}`} style={{fontSize:'clamp(2rem, 5vw, 3.5rem)',fontWeight:900,lineHeight:1.15,marginBottom:24}}>
              {slides[activeSlide].title.split(' ').map((w,i)=>w.startsWith('آیان')?<span key={i} style={{color:'var(--brand-gold)'}}>{w} </span>:w+' ')}
            </h1>
            <p className="animate-in stagger-1" key={`s-${activeSlide}`} style={{fontSize:'1.0625rem',color:'var(--text-secondary)',marginBottom:40,maxWidth:560,lineHeight:1.8}}>
              {slides[activeSlide].subtitle}
            </p>
            <div className="animate-in stagger-2" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Link href="/chatbot" className="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                دستیار هوشمند مالیاتی
              </Link>
              <Link href="/consultation" className="btn btn-outline btn-lg">رزرو وقت مشاوره</Link>
            </div>
          </div>
        </div>

        {/* Slide dots + arrows */}
        <div style={{position:'absolute',bottom:40,left:0,right:0,display:'flex',justifyContent:'center',gap:8,zIndex:10}}>
          {slides.map((_,i) => (
            <button key={i} onClick={()=>goSlide(i)} style={{width:i===activeSlide?32:8,height:8,borderRadius:4,border:'none',background:i===activeSlide?'var(--brand-gold)':'rgba(255,255,255,0.2)',cursor:'pointer',transition:'all 300ms var(--ease-out-expo)'}} />
          ))}
        </div>
        <button onClick={()=>goSlide((activeSlide-1+slides.length)%slides.length)} style={{position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',zIndex:10,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border-subtle)',color:'var(--text-primary)',width:40,height:40,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} className="hide-mobile">←</button>
        <button onClick={nextSlide} style={{position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',zIndex:10,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border-subtle)',color:'var(--text-primary)',width:40,height:40,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} className="hide-mobile">→</button>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{borderTop:'1px solid var(--border-subtle)',borderBottom:'1px solid var(--border-subtle)',padding:'48px 0'}}>
        <div className="container" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:32,textAlign:'center'}}>
          {features.map((f,i)=>(
            <div key={i} className="animate-in" style={{animationDelay:`${i*100+200}ms`}}>
              <div style={{fontSize:'clamp(1.5rem,4vw,2.25rem)',fontWeight:900,color:'var(--brand-gold)',marginBottom:4}}>{f.num}<span style={{fontSize:'0.625em',opacity:0.6}}>{f.suffix}</span></div>
              <div style={{fontSize:'0.875rem',color:'var(--text-muted)'}}>{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">خدمات ما</span>
            <h2 className="section-title">راهکارهای جامع مالی و مالیاتی</h2>
            <p className="section-subtitle">از مشاوره تا اجرا، تمام نیازهای مالی و مالیاتی شما را پوشش می‌دهیم</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
            {services.map((s,i) => (
              <div key={s.id} className={`card card-hover animate-in${visibleCards.includes(i)?'' : ' skeleton'}`} style={{opacity:visibleCards.includes(i)?1:0,transform:visibleCards.includes(i)?'translateY(0)':'translateY(24px)',animationDelay:`${i*100}ms`,padding:32,cursor:'default'}}>
                <div style={{width:52,height:52,borderRadius:14,background:'rgba(198,169,98,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--brand-gold)"><path d={s.icon}/></svg>
                </div>
                <h3 style={{fontSize:'1.125rem',fontWeight:700,marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:'0.875rem',color:'var(--text-secondary)',lineHeight:1.8,marginBottom:20}}>{s.desc}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {s.items.map((item,j)=>(
                    <span key={j} style={{fontSize:'0.75rem',padding:'4px 10px',borderRadius:6,background:'rgba(255,255,255,0.04)',color:'var(--text-muted)',border:'1px solid var(--border-subtle)'}}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg, rgba(198,169,98,0.06) 0%, rgba(0,0,0,0) 40%, rgba(198,169,98,0.04) 100%)'}} />
        <div className="container" style={{position:'relative',zIndex:2,textAlign:'center',maxWidth:640,margin:'0 auto'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',boxShadow:'0 0 40px rgba(198,169,98,0.3)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <h2 style={{fontSize:'clamp(1.5rem,4vw,2.25rem)',fontWeight:800,marginBottom:16}}>برای مشاوره تخصصی آماده‌اید؟</h2>
          <p style={{color:'var(--text-secondary)',marginBottom:36,fontSize:'1.0625rem',lineHeight:1.8}}>همین حالا با دستیار هوشمند مالیاتی ما گفتگو کنید و راهنمایی دقیق و شخصی‌سازی شده دریافت کنید. بدون انتظار، بدون هزینه.</p>
          <Link href="/chatbot" className="btn btn-primary btn-lg" style={{fontSize:'1rem'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            شروع گفتگو با دستیار مالیاتی
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:4}}><path d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="section" id="faq">
        <div className="container" style={{maxWidth:720}}>
          <div className="section-header">
            <span className="section-tag">سوالات متداول</span>
            <h2 className="section-title">پرسش‌های پرتکرار</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {faq.map((item,i)=>(
              <details key={i} style={{border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-md)',overflow:'hidden'}}>
                <summary style={{padding:'18px 24px',fontWeight:600,fontSize:'0.9375rem',cursor:'pointer',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--surface-card)'}}>
                  {item.q}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </summary>
                <div style={{padding:'16px 24px',color:'var(--text-secondary)',fontSize:'0.875rem',lineHeight:1.8,borderTop:'1px solid var(--border-subtle)'}}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{borderTop:'1px solid var(--border-subtle)',padding:'48px 0',background:'var(--brand-black-soft)'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:40,marginBottom:40}}>
            <div>
              <div style={{fontWeight:800,fontSize:'1.125rem',color:'var(--brand-gold)',marginBottom:12}}>آیان تراز</div>
              <p style={{fontSize:'0.875rem',color:'var(--text-muted)',lineHeight:1.8}}>خدمات تخصصی حسابداری و مشاوره مالیاتی از سال ۱۳۹۰</p>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'0.9375rem',marginBottom:12}}>دسترسی سریع</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {['دستیار مالیاتی','رزرو مشاوره','پنل مدیریت'].map((l,i)=>(<Link key={i} href={['/chatbot','/consultation','/admin'][i]} style={{fontSize:'0.875rem',color:'var(--text-muted)'}}>{l}</Link>))}
              </div>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'0.9375rem',marginBottom:12}}>تماس با ما</div>
              <div style={{fontSize:'0.875rem',color:'var(--text-muted)',lineHeight:2}}>تهران، ایران<br />۰۲۱-۱۲۳۴۵۶۷۸<br />info@ayantaraz.ir</div>
            </div>
          </div>
          <div style={{borderTop:'1px solid var(--border-subtle)',paddingTop:24,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12,fontSize:'0.8125rem',color:'var(--text-muted)'}}>
            <span>© ۱۴۰۴ آیان تراز. کلیه حقوق محفوظ است.</span>
            <Link href="/admin" style={{color:'var(--text-muted)'}}>پنل مدیریت</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
