'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { taxApi } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface Topic { id: string; name: string; slug: string; sortOrder: number; }
interface RuleVersion { id: string; content: string; version: number; status: string; effectiveFrom: string; }
interface Rule {
  id: string; name: string; slug: string; description: string | null; status: string;
  topic: Topic | null;
  versions: RuleVersion[];
}

export default function TaxLawsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null); // null = all
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');

  const loadTopics = useCallback(async () => {
    try {
      const r = await taxApi.getTopics();
      setTopics(r.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در دریافت موضوعات مالیاتی');
    }
  }, []);

  const loadRules = useCallback(async (topicSlug?: string) => {
    setLoading(true);
    setError('');
    try {
      const r = await taxApi.getRules(topicSlug, 1, 100);
      setRules(r.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در دریافت قوانین مالیاتی');
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openRule = useCallback(async (slug: string) => {
    setLoadingDetail(true);
    setSelectedRule(null);
    try {
      const r = await taxApi.getRule(slug);
      setSelectedRule(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در دریافت جزئیات قانون');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadTopics();
      await loadRules();
      setLoading(false);
    })();
  }, [loadTopics, loadRules]);

  const selectTopic = (slug: string | null) => {
    setActiveTopic(slug);
    setSelectedRule(null);
    loadRules(slug || undefined);
  };

  const topicName = (slug?: string) => topics.find((t) => t.slug === slug)?.name || '';
  const activeRules = activeTopic ? rules : rules;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
        <PageHeader title="قوانین مالیاتی ۱۴۰۵" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: '120px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-gold)', animation: 'spin .8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>در حال بارگذاری قوانین مالیاتی...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .tl-rule-card{transition:border-color .2s,transform .2s,background .2s}
        .tl-rule-card:hover{border-color:var(--brand-gold)!important;transform:translateY(-2px);background:var(--surface-hover)!important}
        .tl-topic-btn{transition:all .2s}
        .tl-topic-btn:hover{border-color:var(--brand-gold)!important;color:var(--brand-gold)!important}
        .tl-content p{margin:0 0 14px;line-height:2}
        .tl-content strong{color:var(--brand-gold-light);font-weight:700}
      `}</style>

      {/* Header */}
      <PageHeader title="قوانین مالیاتی ۱۴۰۵" />

      {/* Hero section */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 24, textAlign: 'center' }}>
        <span className="badge badge-gold" style={{ marginBottom: 16 }}>۱۴۰۵</span>
        <h1 className="section-title gradient-text" style={{ fontSize: '2.2rem', marginBottom: 12 }}>
          مرجع کامل قوانین مالیاتی ایران
        </h1>
        <p className="section-subtitle" style={{ maxWidth: 600, margin: '0 auto' }}>
          تمام قوانین مالیاتی ۱۴۰۵ شامل حقوق، مشاغل، شرکت‌ها، ارزش افزوده، اجاره املاک، اظهارنامه‌ها، معافیت‌ها، جرایم و مراحل اعتراض — با توضیحات کامل و نحوه محاسبه
        </p>
      </div>

      {error && (
        <div className="container" style={{ maxWidth: 800, margin: '0 auto 24px' }}>
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius-md)', padding: 16, color: '#fca5a5', fontSize: '0.875rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Main layout: sidebar + content */}
      <div className="container" style={{ paddingBottom: 80, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Sidebar — topics */}
        <aside style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '0.5px' }}>
              موضوعات
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => selectTopic(null)}
                className="tl-topic-btn"
                style={{
                  textAlign: 'right', padding: '11px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'Vazirmatn',
                  fontSize: '0.875rem', fontWeight: activeTopic === null ? 700 : 500, cursor: 'pointer',
                  background: activeTopic === null ? 'rgba(198,169,98,.1)' : 'transparent',
                  border: `1px solid ${activeTopic === null ? 'var(--brand-gold)' : 'var(--border-subtle)'}`,
                  color: activeTopic === null ? 'var(--brand-gold)' : 'var(--text-secondary)',
                }}
              >
                📋 همه قوانین
              </button>
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTopic(t.slug)}
                  className="tl-topic-btn"
                  style={{
                    textAlign: 'right', padding: '11px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'Vazirmatn',
                    fontSize: '0.875rem', fontWeight: activeTopic === t.slug ? 700 : 500, cursor: 'pointer',
                    background: activeTopic === t.slug ? 'rgba(198,169,98,.1)' : 'transparent',
                    border: `1px solid ${activeTopic === t.slug ? 'var(--brand-gold)' : 'var(--border-subtle)'}`,
                    color: activeTopic === t.slug ? 'var(--brand-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content area */}
        <div>
          {loadingDetail ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-gold)', animation: 'spin .8s linear infinite' }} />
            </div>
          ) : selectedRule ? (
            /* ── Rule detail view ── */
            <div style={{ animation: 'fadeInUp .3s var(--ease-expo)' }}>
              <button
                onClick={() => setSelectedRule(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Vazirmatn', marginBottom: 16 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                بازگشت به فهرست
              </button>

              <div className="tl-detail-card" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 32, marginBottom: 20 }}>
                {selectedRule.topic && (
                  <span className="badge badge-gold" style={{ marginBottom: 16 }}>
                    {selectedRule.topic.name}
                  </span>
                )}
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>
                  {selectedRule.name}
                </h1>
                {selectedRule.description && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
                    {selectedRule.description}
                  </p>
                )}
                {selectedRule.versions && selectedRule.versions.length > 0 && (
                  <div className="tl-content" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 2.1 }}>
                    {selectedRule.versions
                      .filter((v) => v.status === 'PUBLISHED')
                      .sort((a, b) => b.version - a.version)[0]?.content
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => {
                        const trimmed = line.trim();
                        // Render lines starting with a marker as bold headings
                        if (/^[■▸●◆▪─\-\*]/.test(trimmed) || trimmed.endsWith('؟') || trimmed.endsWith(':')) {
                          return <p key={i}><strong>{trimmed.replace(/^[■▸●◆▪─\-\*]\s*/, '')}</strong></p>;
                        }
                        return <p key={i}>{trimmed}</p>;
                      })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/chatbot" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
                  💬 پرسش از دستیار مالیاتی
                </Link>
                <Link href="/consultation" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
                  📅 مشاوره تخصصی
                </Link>
              </div>
            </div>
          ) : (
            /* ── Rule list view ── */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {activeTopic ? topicName(activeTopic) : 'همه قوانین مالیاتی'}
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {activeRules.length} قانون
                </span>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-gold)', animation: 'spin .8s linear infinite' }} />
                </div>
              ) : activeRules.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '0.9rem' }}>
                  قانونی برای این موضوع یافت نشد.
                </div>
              ) : (
                <div className="tl-rule-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {activeRules.map((rule) => (
                    <button
                      key={rule.id}
                      onClick={() => openRule(rule.slug)}
                      className="tl-rule-card glass-card"
                      style={{
                        textAlign: 'right', cursor: 'pointer', background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                        padding: 22, fontFamily: 'Vazirmatn', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10,
                      }}
                    >
                      {rule.topic && (
                        <span className="badge" style={{ background: 'rgba(198,169,98,.08)', color: 'var(--brand-gold)', border: '1px solid rgba(198,169,98,.2)', fontSize: '0.72rem', alignSelf: 'flex-start' }}>
                          {rule.topic.name}
                        </span>
                      )}
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.5 }}>
                        {rule.name}
                      </h3>
                      {rule.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.8, flex: 1 }}>
                          {rule.description}
                        </p>
                      )}
                      <span style={{ fontSize: '0.8125rem', color: 'var(--brand-gold)', fontWeight: 600, marginTop: 4 }}>
                        مطالعه قانون ←
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile responsive: stack sidebar on top + smaller rule cards */}
      <style>{`
        @media(max-width:880px){
          .container[style*="grid-template-columns"],
          .container[style*="gridTemplateColumns"]{
            grid-template-columns: 1fr !important;
          }
          aside[style*="sticky"]{
            position: relative !important;
            top: 0 !important;
          }
        }
        @media(max-width:640px){
          .tl-rule-list{grid-template-columns:1fr !important}
          .tl-detail-card{padding:20px !important}
          .tl-detail-card h1{font-size:1.3rem !important}
        }
      `}</style>
    </div>
  );
}
