'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 1 | 2 | 3 | 4;

export default function ConsultationPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ name: '', phone: '', service: '', date: '', time: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (k:string,v:string) => setForm(p=>({...p,[k]:v}));
  const canNext = (s:Step) => {
    if (s===1) return form.name.length>=2 && form.phone.length>=10;
    if (s===2) return form.service!=='';
    if (s===3) return form.date!=='' && form.time!=='';
    return true;
  };

  const handleSubmit = () => { setStep(4); setSubmitted(true); setTimeout(()=>{setSubmitted(false)},2500); };

  const services = [
    { id: 'tax-consult', label: 'مشاوره مالیاتی', desc: 'بررسی پرونده و برنامه‌ریزی', icon: '🧮', duration: '۴۵ دقیقه' },
    { id: 'tax-return', label: 'تنظیم اظهارنامه', desc: 'اظهارنامه عملکرد و ارزش افزوده', icon: '📄', duration: '۳۰ دقیقه' },
    { id: 'audit', label: 'حسابرسی مالی', desc: 'بررسی اسناد و گزارش تحلیلی', icon: '🔍', duration: '۶۰ دقیقه' },
    { id: 'bookkeeping', label: 'دفترداری', desc: 'ثبت اسناد و صورت‌های مالی', icon: '📊', duration: '۳۰ دقیقه' },
  ];

  const times = ['۰۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۳:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰'];
  const dates = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i+1);return d.toLocaleDateString('fa-IR')});

  return (
    <div style={{minHeight:'100vh',background:'var(--brand-black)'}}>
      {/* Header */}
      <header style={{padding:'14px 20px',borderBottom:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,color:'var(--text-secondary)',fontSize:'0.875rem'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg> بازگشت
        </Link>
        <div style={{fontWeight:700}}>رزرو مشاوره</div>
        <div style={{width:60}} />
      </header>

      {/* Steps */}
      <div style={{padding:'32px 20px',maxWidth:560,margin:'0 auto'}}>
        {/* Progress */}
        <div style={{display:'flex',gap:6,marginBottom:36}}>
          {[1,2,3,4].map(s=>(<div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?'var(--brand-gold)':'var(--border-subtle)',transition:'all 300ms'}}/>))}
        </div>

        {step===1 && (
          <div style={{animation:'fadeInUp 300ms var(--ease-out-expo)'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:8}}>اطلاعات شما</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:28}}>برای هماهنگی مشاوره، لطفاً اطلاعات زیر را وارد کنید</p>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div><label style={{display:'block',fontSize:'0.8125rem',fontWeight:600,marginBottom:6,color:'var(--text-secondary)'}}>نام و نام خانوادگی</label><input className="input" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="مثال: علی محمدی" /></div>
              <div><label style={{display:'block',fontSize:'0.8125rem',fontWeight:600,marginBottom:6,color:'var(--text-secondary)'}}>شماره تماس</label><input className="input" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" /></div>
              <button onClick={()=>setStep(2)} disabled={!canNext(1)} className="btn btn-primary btn-lg" style={{marginTop:8}}>مرحله بعد →</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div style={{animation:'fadeInUp 300ms var(--ease-out-expo)'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:8}}>نوع خدمت</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:28}}>خدمت مورد نظر خود را انتخاب کنید</p>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
              {services.map(s=>(<button key={s.id} onClick={()=>update('service',s.id)} className="card card-hover" style={{textAlign:'right',borderColor:form.service===s.id?'var(--brand-gold)':'var(--border-subtle)',padding:20}}><div style={{display:'flex',alignItems:'center',gap:14}}><span style={{fontSize:'1.75rem'}}>{s.icon}</span><div style={{flex:1}}><div style={{fontWeight:700,marginBottom:2}}>{s.label}</div><div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>{s.desc} · {s.duration}</div></div>{form.service===s.id&&<span style={{color:'var(--brand-gold)',fontSize:'1.25rem'}}>✓</span>}</div></button>))}
            </div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setStep(1)} className="btn btn-ghost">← بازگشت</button>
              <button onClick={()=>setStep(3)} disabled={!canNext(2)} className="btn btn-primary btn-lg" style={{flex:1}}>مرحله بعد →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{animation:'fadeInUp 300ms var(--ease-out-expo)'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:8}}>زمان مشاوره</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:28}}>روز و ساعت مناسب خود را انتخاب کنید</p>
            <div style={{marginBottom:24}}>
              <div style={{fontWeight:600,marginBottom:12,fontSize:'0.875rem'}}>روز</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}}>
                {dates.map(d=>(<button key={d} onClick={()=>update('date',d)} style={{padding:'10px',borderRadius:8,border:`1.5px solid ${form.date===d?'var(--brand-gold)':'var(--border-subtle)'}`,background:form.date===d?'rgba(198,169,98,0.1)':'var(--surface-card)',color:form.date===d?'var(--brand-gold)':'var(--text-primary)',fontFamily:'Vazirmatn',fontSize:'0.8125rem',cursor:'pointer',transition:'all 150ms'}}>{d}</button>))}
              </div>
            </div>
            <div style={{marginBottom:28}}>
              <div style={{fontWeight:600,marginBottom:12,fontSize:'0.875rem'}}>ساعت</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}}>
                {times.map(t=>(<button key={t} onClick={()=>update('time',t)} style={{padding:'10px',borderRadius:8,border:`1.5px solid ${form.time===t?'var(--brand-gold)':'var(--border-subtle)'}`,background:form.time===t?'rgba(198,169,98,0.1)':'var(--surface-card)',color:form.time===t?'var(--brand-gold)':'var(--text-primary)',fontFamily:'Vazirmatn',fontSize:'0.8125rem',cursor:'pointer',transition:'all 150ms'}}>{t}</button>))}
              </div>
            </div>
            <div><label style={{display:'block',fontSize:'0.8125rem',fontWeight:600,marginBottom:6,color:'var(--text-secondary)'}}>توضیحات (اختیاری)</label><textarea className="input" value={form.notes} onChange={e=>update('notes',e.target.value)} rows={3} placeholder="توضیح مختصر در مورد نیازتان..." style={{resize:'vertical'}}/></div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setStep(2)} className="btn btn-ghost">← بازگشت</button>
              <button onClick={handleSubmit} disabled={!canNext(3)} className="btn btn-primary btn-lg" style={{flex:1}}>تأیید و ثبت نهایی</button>
            </div>
          </div>
        )}

        {step===4 && (
          <div style={{textAlign:'center',animation:'fadeInUp 400ms var(--ease-out-expo)'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',boxShadow:'0 0 40px rgba(198,169,98,0.2)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:8}}>رزرو با موفقیت ثبت شد</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:32}}>کارشناسان ما در زمان مقرر با شما تماس خواهند گرفت</p>
            <div className="card" style={{textAlign:'right',marginBottom:24}}>
              {[{l:'نام',v:form.name},{l:'شماره تماس',v:form.phone},{l:'خدمت',v:services.find(s=>s.id===form.service)?.label},{l:'زمان',v:`${form.date} - ${form.time}`}].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<3?'1px solid var(--border-subtle)':'none'}}><span style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>{r.l}</span><span style={{fontWeight:600}}>{r.v||'---'}</span></div>))}
            </div>
            <Link href="/" className="btn btn-primary btn-lg">بازگشت به صفحه اصلی</Link>
          </div>
        )}

        {submitted && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'rgba(34,197,94,0.9)',color:'#fff',padding:'12px 24px',borderRadius:12,fontWeight:600,fontSize:'0.9375rem',zIndex:100,animation:'fadeInUp 300ms var(--ease-out-expo)'}}>✅ ثبت شد! کارشناسان ما با شما تماس می‌گیرند</div>}
      </div>
    </div>
  );
}
