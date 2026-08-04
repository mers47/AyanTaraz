'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { taxAssistantApi } from '@/lib/api';
import type { TaxAssistantQuestion, TaxAssistantSession } from '@/types';

interface Msg{from:'bot'|'user';text:string;options?:TaxAssistantQuestion['options'];result?:any}

export default function ChatbotPage(){
  const[sess,setSess]=useState<TaxAssistantSession|null>(null);
  const[msgs,setMsgs]=useState<Msg[]>([]);
  const[load,setLoad]=useState(true);
  const[wait,setWait]=useState(false);
  const[qid,setQid]=useState<string|null>(null);
  const end=useRef<HTMLDivElement>(null);
  const[toast,setToast]=useState('');

  useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth'})},[msgs]);
  useEffect(()=>{init()},[]);

  const init=async()=>{try{setLoad(true);const r=await taxAssistantApi.startSession();setSess(r.data);setMsgs([{from:'bot',text:r.data.question.question,options:r.data.question.options}]);setQid(r.data.question.id)}catch{setMsgs([{from:'bot',text:'ارتباط با سرور برقرار نشد.'}])}finally{setLoad(false)}};

  const ans=async(oId:string,oVal:string,oLabel:string)=>{if(!sess||!qid||wait)return;setWait(true);setMsgs(p=>[...p,{from:'user',text:oLabel}]);try{const r=await taxAssistantApi.answerQuestion(sess.sessionId,qid,oId,oVal);if(r.data.completed&&r.data.result)setMsgs(p=>[...p,{from:'bot',text:'',result:r.data.result}]);else if(r.data.question){setMsgs(p=>[...p,{from:'bot',text:r.data.question.question,options:r.data.question.options}]);setQid(r.data.question.id)}}catch{setMsgs(p=>[...p,{from:'bot',text:'خطا در پردازش پاسخ.'}])}finally{setWait(false)}};

  const copy=(t:string)=>{navigator.clipboard?.writeText(t);setToast('کپی شد ✅');setTimeout(()=>setToast(''),2000)};

  const restart=()=>{setMsgs([]);setSess(null);setQid(null);setLoad(true);(async()=>{try{const r=await taxAssistantApi.startSession();setSess(r.data);setMsgs([{from:'bot',text:r.data.question.question,options:r.data.question.options}]);setQid(r.data.question.id)}catch{setMsgs([{from:'bot',text:'خطا'}]);}finally{setLoad(false)}})()};

  const sev:Record<string,{bg:string;border:string;icon:string;label:string}>={INFO:{bg:'rgba(59,130,246,.1)',border:'#3b82f6',icon:'ℹ️',label:'اطلاع‌رسانی'},WARNING:{bg:'rgba(234,179,8,.1)',border:'#eab308',icon:'⚠️',label:'هشدار'},CRITICAL:{bg:'rgba(239,68,68,.1)',border:'#ef4444',icon:'🚨',label:'حیاتی'},NEEDS_REVIEW:{bg:'rgba(168,85,247,.1)',border:'#a855f7',icon:'📋',label:'نیاز به بررسی'}};

  if(load)return<div style={{minHeight:'100vh',background:'var(--brand-black)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14}}><div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><p style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>در حال راه‌اندازی...</p></div>;

  return<div style={{minHeight:'100vh',background:'var(--brand-black)',display:'flex',flexDirection:'column'}}>
    <header style={{padding:'12px 20px',borderBottom:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,10,.9)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:50}}>
      <Link href="/" style={{display:'flex',alignItems:'center',gap:6,color:'var(--text-secondary)',fontSize:'0.85rem'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>بازگشت</Link>
      <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div><div style={{fontWeight:700,fontSize:'0.9rem'}}>دستیار آیان تراز</div><div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>پاسخگوی سوالات مالیاتی</div></div></div>
      <button onClick={restart} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'0.8rem',fontFamily:'Vazirmatn',padding:'6px 10px',borderRadius:6}}>شروع مجدد</button>
    </header>
    <div style={{flex:1,overflowY:'auto',padding:'14px 20px 100px',display:'flex',flexDirection:'column',gap:14}}>
      {msgs.map((m,i)=><div key={i} style={{display:'flex',gap:8,justifyContent:m.from==='user'?'flex-end':'flex-start',alignItems:'flex-start'}}>
        {m.from==='bot'&&<div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>}
        <div style={{maxWidth:m.from==='user'?'80%':'100%'}}>
          {m.result?<div style={{background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',padding:22,maxWidth:500,animation:'fadeInUp .3s var(--ease-expo)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><span style={{fontSize:'1.4rem'}}>✅</span><span style={{fontWeight:700,fontSize:'1.05rem'}}>{m.result.title}</span></div>
            {(()=>{const s=sev[m.result.severity]||sev.INFO;return<span className="badge" style={{background:s.bg,color:s.border,border:`1px solid ${s.border}`,marginBottom:14}}>{s.icon} {s.label}</span>})()}
            <div style={{background:'rgba(255,255,255,.03)',borderRadius:'var(--radius-sm)',padding:14,whiteSpace:'pre-wrap',fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.85,marginBottom:14}}>{m.result.description}</div>
            <div style={{display:'flex',gap:8}}><button onClick={restart} className="btn btn-outline" style={{fontSize:'0.8rem',padding:'8px 14px'}}>🔄 شروع دوباره</button><button onClick={()=>copy(m.result.description)} className="btn btn-ghost" style={{fontSize:'0.8rem',padding:'8px 14px'}}>📋 کپی نتیجه</button></div>
          </div>:<div>
            <div style={{background:m.from==='user'?'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-dark))':'var(--surface-card)',color:m.from==='user'?'var(--text-inverse)':'var(--text-primary)',padding:'12px 16px',borderRadius:m.from==='user'?'var(--radius-lg) 4px var(--radius-lg) var(--radius-lg)':'4px var(--radius-lg) var(--radius-lg) var(--radius-lg)',fontSize:'0.92rem',lineHeight:1.7,animation:'fadeInUp .2s var(--ease-expo)',border:m.from==='bot'?'1px solid var(--border-subtle)':'none'}}>{m.text}</div>
            {m.options&&<div style={{display:'flex',flexDirection:'column',gap:7,marginTop:10}}>{m.options.map(o=><button key={o.id} onClick={()=>ans(o.id,o.value,o.label)} disabled={wait} style={{textAlign:'right',padding:'13px 16px',background:'var(--surface-card)',border:`1.5px solid ${wait?'var(--border-subtle)':'var(--border-subtle)'}`,borderRadius:'var(--radius-md)',color:'var(--text-primary)',fontFamily:'Vazirmatn',fontSize:'0.9rem',cursor:wait?'default':'pointer',transition:'all .2s',opacity:wait?.5:1}} onMouseEnter={e=>{if(!wait){e.currentTarget.style.borderColor='var(--brand-gold)';e.currentTarget.style.background='rgba(198,169,98,.06)'}}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-subtle)';e.currentTarget.style.background='var(--surface-card)'}}>{o.label}</button>)}</div>}
          </div>}
        </div>
      </div>)}
      {wait&&<div style={{display:'flex',gap:8,alignItems:'center'}}><div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div className="typing-wave"><span className="bar"/><span className="bar"/><span className="bar"/><span className="bar"/></div></div>}
      <div ref={end}/>
    </div>
    <div style={{padding:'10px 20px',borderTop:'1px solid var(--border-subtle)',textAlign:'center',background:'var(--brand-black-soft)'}}><span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>پاسخ‌ها بر اساس قوانین مالیاتی ایران و بدون استفاده از هوش مصنوعی</span></div>
    {toast&&<div className="toast">{toast}</div>}
  </div>;
}
