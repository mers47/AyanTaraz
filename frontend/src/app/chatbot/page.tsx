'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { taxAssistantApi } from '@/lib/api';
import type { TaxAssistantQuestion, TaxAssistantSession, TaxAssistantResult } from '@/types';

interface Msg {
  from: 'bot' | 'user';
  text: string;
  options?: TaxAssistantQuestion['options'];
  result?: TaxAssistantResult;
}

interface SeverityStyle {
  bg: string;
  border: string;
  icon: string;
  label: string;
}

export default function ChatbotPage() {
  const [sess, setSess] = useState<TaxAssistantSession | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [load, setLoad] = useState(true);
  const [wait, setWait] = useState(false);
  const [qid, setQid] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [qIndex, setQIndex] = useState(1); // 1-based question counter
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
    } catch (e: unknown) {
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
        setQIndex((p) => p + 1);
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

  const sev: Record<string, SeverityStyle> = {
    INFO: { bg: 'rgba(59,130,246,.1)', border: '#3b82f6', icon: 'ℹ️', label: 'اطلاع‌رسانی' },
    WARNING: { bg: 'rgba(234,179,8,.1)', border: '#eab308', icon: '⚠️', label: 'هشدار' },
    CRITICAL: { bg: 'rgba(239,68,68,.1)', border: '#ef4444', icon: '🚨', label: 'حیاتی' },
    NEEDS_REVIEW: { bg: 'rgba(168,85,247,.1)', border: '#a855f7', icon: '📋', label: 'نیاز به بررسی' },
  };

  if (load)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3.5 bg-[var(--brand-black)]">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center animate-[goldPulse_2s_ease-in-out_infinite]"
          style={{ background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#07070a">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <p className="text-[0.9rem] text-[var(--text-secondary)]">در حال راه‌اندازی...</p>
      </div>
    );

  return (
    <div className="chat-container min-h-screen flex flex-col bg-[var(--brand-black)]">
      <header className="px-5 py-3 flex items-center justify-between gap-3 sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(7,7,10,0.92)] backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[0.85rem] text-[var(--text-secondary)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          بازگشت
        </Link>
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-dark.webp" alt="آیان تراز" className="h-[34px] w-auto" />
          <div>
            <div className="chat-header-title font-bold text-[0.9rem]">دستیار آیان تراز</div>
            <div className="text-[0.7rem] text-[var(--text-muted)]">پاسخگوی سوالات مالیاتی</div>
          </div>
        </div>
        <button
          onClick={restart}
          className="bg-transparent border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-pointer text-[0.8rem] font-sans px-3 py-1.5 rounded-lg"
        >
          شروع مجدد
        </button>
      </header>

      {/* Progress indicator */}
      {!err && (
        <div className="px-5 py-2 border-b border-[var(--border-subtle)] bg-[var(--brand-black-soft)]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[0.75rem] text-[var(--text-muted)]">پیشرفت گفتگو</span>
            <span className="text-[0.75rem] font-bold text-[var(--brand-gold)]">
              سؤال {qIndex}
            </span>
          </div>
          <div className="h-[3px] rounded-[2px] bg-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-[2px] transition-[width] duration-400"
              style={{
                background: 'linear-gradient(90deg, var(--brand-gold-dark), var(--brand-gold), var(--brand-gold-light))',
                // Visual cap at ~96% — the decision tree length is dynamic,
                // so we cap the indicator until the API signals completion.
                width: `${Math.min(qIndex, 6) * 16}%`,
                transitionTimingFunction: 'var(--ease-expo)',
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pt-3.5 pb-25 flex flex-col gap-3.5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 items-start ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.from === 'bot' && (
              <div
                className="w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#07070a">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
            )}
            <div className={m.from === 'user' ? 'max-w-[80%]' : 'max-w-full'}>
              {m.result ? (
                <div
                  className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-[22px] max-w-[500px] animate-[fadeInUp_0.3s_var(--ease-expo)]"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[1.4rem]">✅</span>
                    <span className="font-bold text-[1.05rem]">{m.result.title}</span>
                  </div>
                  {(() => {
                    const s = sev[m.result.severity] || sev.INFO;
                    return (
                      <span
                        className="badge mb-3.5"
                        style={{ background: s.bg, color: s.border, border: `1px solid ${s.border}` }}
                      >
                        {s.icon} {s.label}
                      </span>
                    );
                  })()}
                  <div className="bg-white/[0.03] rounded-[var(--radius-sm)] p-3.5 whitespace-pre-wrap text-[0.875rem] text-[var(--text-secondary)] leading-[1.85] mb-3.5">
                    {m.result.description}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href="/consultation"
                      className="btn btn-primary text-[0.8rem] px-3.5 py-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      درخواست مشاوره تخصصی
                    </Link>
                    <button onClick={restart} className="btn btn-outline text-[0.8rem] px-3.5 py-2">
                      🔄 شروع دوباره
                    </button>
                    <button
                      onClick={() => copy(m.result?.description || '')}
                      className="btn btn-ghost text-[0.8rem] px-3.5 py-2"
                    >
                      📋 کپی نتیجه
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className="p-3 px-4 text-[0.92rem] leading-[1.7] animate-[fadeInUp_0.2s_var(--ease-expo)]"
                    style={
                      m.from === 'user'
                        ? {
                            background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-dark))',
                            color: 'var(--text-inverse)',
                            borderRadius: 'var(--radius-lg) 4px var(--radius-lg) var(--radius-lg)',
                          }
                        : {
                            background: 'var(--surface-card)',
                            color: 'var(--text-primary)',
                            borderRadius: '4px var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                            border: '1px solid var(--border-subtle)',
                          }
                    }
                  >
                    {m.text}
                  </div>
                  {m.options && (
                    <div className="chat-options flex flex-col gap-[7px] mt-2.5">
                      {m.options.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => ans(o.id, o.value, o.label)}
                          disabled={wait}
                          className={`chat-option-btn text-right px-4 py-[13px] bg-[var(--surface-card)] border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] font-sans text-[0.9rem] transition-all duration-200 ${wait ? 'opacity-50 cursor-default' : 'cursor-pointer hover:border-[var(--brand-gold)] hover:bg-[rgba(198,169,98,0.06)]'}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {err && i === msgs.length - 1 && (
                    <button onClick={restart} className="btn btn-primary mt-3 text-[0.85rem]">
                      🔄 تلاش مجدد
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {wait && (
          <div className="flex gap-2 items-center">
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))' }}
            >
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

      <div className="px-5 py-2.5 border-t border-[var(--border-subtle)] text-center bg-[var(--brand-black-soft)]">
        <span className="text-[0.72rem] text-[var(--text-muted)]">
          پاسخ‌ها بر اساس قوانین مالیاتی ایران و بدون استفاده از هوش مصنوعی
        </span>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
