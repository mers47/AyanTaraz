'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { taxAssistantApi } from '@/lib/api';
import type { TaxAssistantQuestion, TaxAssistantSession } from '@/types';

interface Message { from: 'bot' | 'user'; text: string; options?: TaxAssistantQuestion['options']; result?: any }

export default function ChatbotPage() {
  const [session, setSession] = useState<TaxAssistantSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [currentQId, setCurrentQId] = useState<string | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const res = await taxAssistantApi.startSession();
        setSession(res.data);
        setMessages([{ from: 'bot', text: res.data.question.question, options: res.data.question.options }]);
        setCurrentQId(res.data.question.id);
      } catch { setMessages([{ from: 'bot', text: 'متأسفانه ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.' }]);
      } finally { setIsLoading(false); }
    })();
  }, []);

  const handleAnswer = async (oId: string, oVal: string, oLabel: string) => {
    if (!session || !currentQId || awaitingAnswer) return;
    setAwaitingAnswer(true);
    setMessages(prev => [...prev, { from: 'user', text: oLabel }]);

    try {
      const res = await taxAssistantApi.answerQuestion(session.sessionId, currentQId, oId, oVal);
      if (res.data.completed && res.data.result) {
        setMessages(prev => [...prev, { from: 'bot', text: '', result: res.data.result }]);
      } else if (res.data.question) {
        setMessages(prev => [...prev, { from: 'bot', text: res.data.question.question, options: res.data.question.options }]);
        setCurrentQId(res.data.question.id);
      }
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'خطا در پردازش پاسخ. لطفاً دوباره تلاش کنید.' }]);
    } finally { setAwaitingAnswer(false); }
  };

  const restart = () => { setMessages([]); setSession(null); setCurrentQId(null); setIsLoading(true);
    (async () => {
      try { const r = await taxAssistantApi.startSession(); setSession(r.data); setMessages([{ from: 'bot', text: r.data.question.question, options: r.data.question.options }]); setCurrentQId(r.data.question.id); }
      catch { setMessages([{ from: 'bot', text: 'خطا در ارتباط' }]); }
      finally { setIsLoading(false); }
    })();
  };

  const severityStyles: Record<string,{bg:string;border:string;icon:string;label:string}> = {
    INFO: { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', icon: 'ℹ️', label: 'اطلاع‌رسانی' },
    WARNING: { bg: 'rgba(234,179,8,0.1)', border: '#eab308', icon: '⚠️', label: 'هشدار' },
    CRITICAL: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', icon: '🚨', label: 'حیاتی' },
    NEEDS_REVIEW: { bg: 'rgba(168,85,247,0.1)', border: '#a855f7', icon: '📋', label: 'نیاز به بررسی' },
  };

  if (isLoading) return (
    <div style={{minHeight:'100vh',background:'var(--brand-black)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 30px rgba(198,169,98,0.3)'}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      </div>
      <p style={{color:'var(--text-secondary)',fontSize:'0.9375rem'}}>در حال راه‌اندازی دستیار...</p>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'var(--brand-black)',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <header style={{padding:'14px 20px',borderBottom:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,10,0.9)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:50}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,color:'var(--text-secondary)',fontSize:'0.875rem'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          بازگشت
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 16px rgba(198,169,98,0.25)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div><div style={{fontWeight:700,fontSize:'0.9375rem'}}>دستیار آیان تراز</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>پاسخگوی سوالات مالیاتی</div></div>
        </div>
        <button onClick={restart} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'0.8125rem',fontFamily:'Vazirmatn',padding:'6px 12px',borderRadius:8}}>شروع مجدد</button>
      </header>

      {/* Chat */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 120px',display:'flex',flexDirection:'column',gap:16}}>
        {messages.map((m, i) => (
          <div key={i} style={{display:'flex',gap:10,justifyContent:m.from==='user'?'flex-end':'flex-start',alignItems:'flex-start'}}>
            {m.from==='bot' && (
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(198,169,98,0.2)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
            )}
            <div style={{maxWidth:m.from==='user'?'80%':'100%'}}>
              {m.result ? (
                <div style={{background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',padding:24,maxWidth:500,animation:'fadeInUp 300ms var(--ease-out-expo)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                    <span style={{fontSize:'1.5rem'}}>✅</span>
                    <span style={{fontWeight:700,fontSize:'1.0625rem'}}>{m.result.title}</span>
                  </div>
                  {(()=>{const s=severityStyles[m.result.severity]||severityStyles.INFO;return(<span className="badge" style={{background:s.bg,color:s.border,border:`1px solid ${s.border}`,marginBottom:16}}>{s.icon} {s.label}</span>)})()}
                  <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'var(--radius-sm)',padding:16,whiteSpace:'pre-wrap',fontSize:'0.875rem',color:'var(--text-secondary)',lineHeight:1.8,marginBottom:16}}>{m.result.description}</div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={restart} className="btn btn-outline" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>🔄 شروع دوباره</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{background:m.from==='user'?'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-dark))':'var(--surface-card)',color:m.from==='user'?'var(--text-inverse)':'var(--text-primary)',padding:'12px 16px',borderRadius:m.from==='user'?'var(--radius-lg) 4px var(--radius-lg) var(--radius-lg)':'4px var(--radius-lg) var(--radius-lg) var(--radius-lg)',fontSize:'0.9375rem',lineHeight:1.7,animation:'fadeInUp 200ms var(--ease-out-expo)',border:m.from==='bot'?'1px solid var(--border-subtle)':'none'}}>{m.text}</div>
                  {m.options && (
                    <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
                      {m.options.map(o => (
                        <button key={o.id} onClick={()=>handleAnswer(o.id,o.value,o.label)} disabled={awaitingAnswer}
                          style={{textAlign:'right',padding:'14px 18px',background:'var(--surface-card)',border:`1.5px solid ${awaitingAnswer?'var(--border-subtle)':'var(--border-subtle)'}`,borderRadius:'var(--radius-md)',color:'var(--text-primary)',fontFamily:'Vazirmatn',fontSize:'0.9375rem',cursor:awaitingAnswer?'default':'pointer',transition:'all 200ms var(--ease-out-expo)',opacity:awaitingAnswer?0.5:1}}
                          onMouseEnter={e=>{if(!awaitingAnswer){e.currentTarget.style.borderColor='var(--brand-gold)';e.currentTarget.style.background='rgba(198,169,98,0.06)'}}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-subtle)';e.currentTarget.style.background='var(--surface-card)'}}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {awaitingAnswer && (
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div style={{display:'flex',gap:6}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:'var(--brand-gold)',animation:`pulse-gold 1.4s infinite`,animationDelay:`${i*200}ms`}}/>)}
            </div>
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      {/* Footer */}
      <div style={{padding:'12px 20px',borderTop:'1px solid var(--border-subtle)',textAlign:'center',background:'var(--brand-black-soft)'}}>
        <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>پاسخ‌ها بر اساس قوانین مالیاتی ایران و بدون استفاده از هوش مصنوعی تولید می‌شوند.</span>
      </div>
    </div>
  );
}
