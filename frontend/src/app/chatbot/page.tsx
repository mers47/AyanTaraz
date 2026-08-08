'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { taxAssistantApi } from '@/lib/api';
import type { TaxAssistantQuestion, TaxAssistantSession } from '@/types';

interface Msg {
  from: 'bot' | 'user';
  text: string;
  options?: TaxAssistantQuestion['options'];
  result?: any;
}

export default function ChatbotPage() {
  const [sess, setSess] = useState<TaxAssistantSession | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [load, setLoad] = useState(true);
  const [wait, setWait] = useState(false);
  const [qid, setQid] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [qIndex, setQIndex] = useState(1); // 1-based question counter
  const TOTAL_QS = 6; // total questions in the decision tree flow
  const end = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoad(true);
      setErr(false);
      setQIndex(1);
      const r = await taxAssistantApi.startSession();
      setSess(r.data);
      setMsgs([{ from: 'bot', text: r.data.question.question, options: r.data.question.options }]);
      setQid(r.data.question.id);
    } catch (e: any) {
      setErr(true);
      setMsgs([
        {
          from: 'bot',
          text:
            'در حال حاضر امکان برقراری ارتباط با سرور وجود ندارد. ممکن است سرویس هنوز راه‌اندازی نشده باشد یا پایگاه داده اولیه‌سازی نشده باشد. لطفاً کمی بعد دوباره تلاش کنید.',
        },
      ]);
    } finally {
      setLoad(false);
    }
  };

  const ans = async (oId: string, oVal: string, oLabel: string) => {
    if (!sess || !qid || wait) return;
    setWait(true);
    setMsgs((p) => [...p, { from: 'user', text: oLabel }]);
    try {
      const r = await taxAssistantApi.answerQuestion(sess.sessionId, qid, oId, oVal);
      if (r.data.completed && r.data.result) {
        setMsgs((p) => [...p, { from: 'bot', text: '', result: r.data.result }]);
      } else if (r.data.question) {
        setQIndex((p) => Math.min(p + 1, TOTAL_QS));
        setMsgs((p) => [...p, { from: 'bot', text: r.data.question.question, options: r.data.question.options }]);
        setQid(r.data.question.id);
      }
    } catch {
      setMsgs((p) => [
        ...p,
        { from: 'bot', text: 'خطایی در پردازش پاسخ رخ داد. لطفاً از دکمه «شروع مجدد» استفاده کنید.' },
      ]);
    } finally {
      setWait(false);
    }
  };

  const copy = (t: string) => {
    navigator.clipboard?.writeText(t);
    setToast('کپی شد ✅');
    setTimeout(() => setToast(''), 2000);
  };

  const restart = async () => {
    if (sess?.sessionId) {
      try { await taxAssistantApi.resetSession(sess.sessionId); } catch { /* ignore */ }
    }
    setMsgs([]);
    setSess(null);
    setQid(null);
    setErr(false);
    init();
  };

  const sev: Record<string, { bg: string; border: string; icon: string; label: string }> = {
    INFO: { bg: 'rgba(59,130,246,.1)', border: '#3b82f6', icon: 'ℹ️', label: 'اطلاع‌رسانی' },
    WARNING: { bg: 'rgba(234,179,8,.1)', border: '#eab308', icon: '⚠️', label: 'هشدار' },
    CRITICAL: { bg: 'rgba(239,68,68,.1)', border: '#ef4444', icon: '🚨', label: 'حیاتی' },
    NEEDS_REVIEW: { bg: 'rgba(168,85,247,.1)', border: '#a855f7', icon: '📋', label: 'نیاز به بررسی' },
  };

  if (load)
    return (
      <div style={{ minHeight: '100vh', background: 'var(--brand-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'goldPulse 2s ease-in-out infinite' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#07070a">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>در حال راه‌اندازی...</p>
      </div>
    );

  return (
    <div className="chat-container" style={{ minHeight: '100vh', background: 'var(--brand-black)', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(7,7,10,.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          gap: 12,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          بازگشت
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-dark.webp" alt="آین تراز" style={{ height: 34, width: 'auto' }} />
          <div>
            <div className="chat-header-title" style={{ fontWeight: 700, fontSize: '0.9rem' }}>دستیار آین تراز</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>پاسخگویی سوالات مالیاتی</div>
          </div>
        </div>
        <button onClick={restart} style={{ background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Vazirmatn', padding: '6px 12px', borderRadius: 8 }}>
          شروع مجدد
        </button>
      </header>

      {/* Progress indicator */}
      {!err && (
        <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--brand-black-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>پیشرفت گفتگو</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-gold)' }}>
              سوال {qIndex} از {TOTAL_QS}
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 2,
                background: 'linear-gradient(90deg, var(--brand-gold-dark), var(--brand-gold), var(--brand-gold-light))',
                width: `${(qIndex / TOTAL_QS) * 100}%`,
                transition: 'width 400ms var(--ease-out-expo)',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
            {m.from === 'bot' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#07070a">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
            )}
            <div style={{ maxWidth: m.from === 'user' ? '80%' : '100%' }}>
              {m.result ? (
                <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 22, maxWidth: 500, animation: 'fadeInUp .3s var(--ease-expo)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.4rem' }}>✅</span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{m.result.title}</span>
                  </div>
                  {(() => {
                    const s = sev[m.result.severity] || sev.INFO;
                    return (
                      <span className="badge" style={{ background: s.bg, color: s.border, border: `1px solid ${s.border}`, marginBottom: 14 }}>
                        {s.icon} {s.label}
                      </span>
                    );
                  })()}
                  <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 'var(--radius-sm)', padding: 14, whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 14 }}>
                    {m.result.description}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={restart} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                      🔄 شروع دوباره
                    </button>
                    <button onClick={() => copy(m.result.description)} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                      📋 کپی نتیجه
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      background: m.from === 'user' ? 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-dark))' : 'var(--surface-card)',
                      color: m.from === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                      padding: '12px 16px',
                      borderRadius: m.from === 'user' ? 'var(--radius-lg) 4px var(--radius-lg) var(--radius-lg)' : '4px var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      animation: 'fadeInUp .2s var(--ease-expo)',
                      border: m.from === 'bot' ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    {m.text}
                  </div>
                  {m.options && (
                    <div className="chat-options" style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                      {m.options.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => ans(o.id, o.value, o.label)}
                          disabled={wait}
                          className="chat-option-btn"
                          style={{
                            textAlign: 'right',
                            padding: '13px 16px',
                            background: 'var(--surface-card)',
                            border: '1.5px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontFamily: 'Vazirmatn',
                            fontSize: '0.9rem',
                            cursor: wait ? 'default' : 'pointer',
                            transition: 'all .2s',
                            opacity: wait ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!wait) {
                              e.currentTarget.style.borderColor = 'var(--brand-gold)';
                              e.currentTarget.style.background = 'rgba(198,169,98,.06)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.background = 'var(--surface-card)';
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {err && i === msgs.length - 1 && (
                    <button onClick={restart} className="btn btn-primary" style={{ marginTop: 12, fontSize: '0.85rem' }}>
                      🔄 تلاش مجدد
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {wait && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#07070a">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div className="typing-wave">
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </div>
          </div>
        )}
        <div ref={end} />
      </div>

      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', background: 'var(--brand-black-soft)' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          پاسخ‌ها بر اساس قوانین مالیاتی ایران و بدون استفاده از هوش مصنوعی
        </span>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
