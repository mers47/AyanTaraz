'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { adminApi, contentApi } from '@/lib/api';
import LoginModal from '@/components/LoginModal';
import type { DashboardStats, RecentActivity, UserRow, AuditLog, PaginatedResponse } from '@/types';

type Tab = 'dashboard' | 'users' | 'content' | 'chatbot' | 'articles' | 'videos' | 'minibooks' | 'consultation' | 'taxlaws' | 'audit';

interface CS {
  title: string;
  hero: string;
  subtitle: string;
  description: string;
}

export default function AdminPage() {
  const [tb, st] = useState<Tab>('dashboard');
  const [stats, ss] = useState<DashboardStats | null>(null);
  const [act, sa] = useState<RecentActivity | null>(null);
  const [users, su] = useState<PaginatedResponse<UserRow> | null>(null);
  const [logs, sl] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [ld, sl2] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [up, sp] = useState(1);
  const [ap, sp2] = useState(1);
  const [q, sq] = useState('');
  const [to, sto] = useState('');
  const [ac, sc] = useState<Record<string, CS>>({});
  const [ek, se] = useState<string | null>(null);
  const [ed, sd] = useState<CS>({ title: '', hero: '', subtitle: '', description: '' });
  const tmr = useRef<any>(null);

  const sh = (m: string) => {
    sto(m);
    setTimeout(() => sto(''), 2500);
  };

  // ---- Content management state (from main: chatbot / articles / videos / minibooks / consultation) ----
  const [nl, snl] = useState(false);
  const chkErr = (x: any) => { if (x?.response?.status === 401 || x?.response?.status === 403) snl(true); };
  const [tq, stq] = useState<any[]>([]);
  const [tqr, stqr] = useState<any[]>([]);
  const [eq, seq] = useState<any | null>(null);
  const [nq, snq] = useState({ question: '', description: '', sortOrder: 0, isActive: true });
  const [eo, seo] = useState<any | null>(null);
  const [no, sno] = useState({ questionId: '', label: '', value: '', sortOrder: 0 });
  const [nr, snr] = useState({ name: '', title: '', description: '', action: '', severity: 'INFO', isActive: true });
  const [er, ser] = useState<any | null>(null);
  const [arts, sarts] = useState<any[]>([]);
  const [ea, sea] = useState<any | null>(null);
  const [na, sna] = useState({ title: '', slug: '', excerpt: '', content: '', featuredImage: '', status: 'DRAFT', categoryId: '' });
  const [cats, scats] = useState<any[]>([]);
  const [vids, svids] = useState<any[]>([]);
  const [ev, sev] = useState<any | null>(null);
  const [nv, snv] = useState({ title: '', slug: '', description: '', url: '', thumbnail: '', duration: 0, status: 'DRAFT', categoryId: '' });
  const [mbs, smbs] = useState<any[]>([]);
  const [emb, semb] = useState<any | null>(null);
  const [nmb, snmb] = useState({ title: '', slug: '', description: '', fileUrl: '', coverImage: '', pageCount: 0, status: 'DRAFT', categoryId: '' });
  const [csvs, scsvs] = useState<any[]>([]);
  const [ecv, secv] = useState<any | null>(null);
  const [ncv, sncv] = useState({ name: '', slug: '', description: '', duration: 30, price: 0, isActive: true, sortOrder: 0 });

  // ---- Tax laws management state ----
  const [taxTopics, stxTopics] = useState<any[]>([]);
  const [taxSources, stxSources] = useState<any[]>([]);
  const [taxRules, stxRules] = useState<any[]>([]);
  const [etxTopic, setEtxTopic] = useState<any | null>(null);
  const [ntxTopic, setNtxTopic] = useState({ name: '', slug: '', description: '', sortOrder: 0, isActive: true });
  const [etxSource, setEtxSource] = useState<any | null>(null);
  const [ntxSource, setNtxSource] = useState({ name: '', url: '', officialName: '', description: '', isActive: true });
  const [etxRule, setEtxRule] = useState<any | null>(null);
  const [ntxRule, setNtxRule] = useState({ topicId: '', name: '', slug: '', description: '', content: '', sourceId: '', effectiveFrom: '', status: 'DRAFT' });
  const [txSubTab, setTxSubTab] = useState<'rules' | 'topics' | 'sources'>('rules');

  const db = useCallback((k: string, d: CS) => {
    if (tmr.current) clearTimeout(tmr.current);
    tmr.current = setTimeout(async () => {
      try {
        await contentApi.save(k, d);
        sc((p) => ({ ...p, [k]: d }));
        sh('ذخیره خودکار ✅');
      } catch {
        sh('ذخیره خودکار ناموفق ❌');
      }
    }, 800);
  }, []);

  const ldD = useCallback(async () => {
    sl2(true);
    setAuthFailed(false);
    try {
      const [s, a] = await Promise.all([adminApi.getDashboardStats(), adminApi.getRecentActivity(5)]);
      ss(s.data);
      sa(a.data);
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true);
    } finally {
      sl2(false);
    }
  }, []);

  const ldCS = useCallback(async () => {
    sl2(true); setAuthFailed(false);
    try { const r = await adminApi.getConsultationServices(); scsvs(r.data || []); }
    catch (e: any) { if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true); }
    finally { sl2(false); }
  }, []);

  const ldTxLaws = useCallback(async () => {
    sl2(true); setAuthFailed(false);
    try {
      const [tp, ts, tr] = await Promise.all([
        adminApi.getTaxTopicsAdmin(),
        adminApi.getTaxSources(),
        adminApi.getTaxRulesAdmin(),
      ]);
      stxTopics(tp.data || []);
      stxSources(ts.data || []);
      stxRules(tr.data?.data || []);
    } catch (e: any) { if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true); }
    finally { sl2(false); }
  }, []);

  const ldMB = useCallback(async () => {
    sl2(true); setAuthFailed(false);
    try { const r = await adminApi.getMiniBooks(1, 50); smbs(r.data?.data || []); }
    catch (e: any) { if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true); }
    finally { sl2(false); }
  }, []);

  const ldV = useCallback(async () => {
    sl2(true); setAuthFailed(false);
    try { const r = await adminApi.getVideos(1, 50); svids(r.data?.data || []); }
    catch (e: any) { if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true); }
    finally { sl2(false); }
  }, []);

  const ldA = useCallback(async () => {
    sl2(true); setAuthFailed(false);
    try { const [r, cs] = await Promise.all([adminApi.getArticles(1, 50), adminApi.getCategories()]); sarts(r.data?.data || []); scats(cs.data || []); }
    catch (e: any) { if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true); }
    finally { sl2(false); }
  }, []);

  const ldQ = useCallback(async () => {
    sl2(true); setAuthFailed(false);
    try { const [qs, rs] = await Promise.all([adminApi.getTaxQuestions(), adminApi.getTaxAssistantResults()]); stq(qs.data || []); stqr(rs.data || []); }
    catch (e: any) { if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true); }
    finally { sl2(false); }
  }, []);

  const ldU = useCallback(async (p = 1) => {
    sl2(true);
    setAuthFailed(false);
    try {
      const r = await adminApi.getUsers(p, 15, q);
      su(r.data);
      sp(p);
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true);
    } finally {
      sl2(false);
    }
  }, [q]);

  const ldC = useCallback(async () => {
    sl2(true);
    setAuthFailed(false);
    try {
      const r = await contentApi.getAll();
      if (r.data && typeof r.data === 'object') {
        const m: any = {};
        for (const [k, v] of Object.entries(r.data)) {
          const key = k.replace('content_', '');
          m[key] = v;
        }
        sc(m);
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true);
    } finally {
      sl2(false);
    }
  }, []);

  const ldL = useCallback(async (p = 1) => {
    sl2(true);
    setAuthFailed(false);
    try {
      const r = await adminApi.getAuditLogs({ page: p, limit: 15 });
      sl(r.data);
      sp2(p);
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) setAuthFailed(true);
    } finally {
      sl2(false);
    }
  }, []);

  useEffect(() => {
    if (tb === 'dashboard') ldD();
    else if (tb === 'users') ldU();
    else if (tb === 'content') ldC();
    else if (tb === 'chatbot') ldQ();
    else if (tb === 'articles') ldA();
    else if (tb === 'videos') ldV();
    else if (tb === 'minibooks') ldMB();
    else if (tb === 'consultation') ldCS();
    else if (tb === 'taxlaws') ldTxLaws();
    else if (tb === 'audit') ldL();
  }, [tb, ldD, ldU, ldC, ldQ, ldA, ldV, ldMB, ldCS, ldTxLaws, ldL]);

  const af = async () => {
    sl2(true);
    try {
      const r = await contentApi.autoFill();
      sh(r.data.message || '✅');
      ldC();
    } catch {
      sh('❌ خطا در جای‌گذاری خودکار');
    } finally {
      sl2(false);
    }
  };

  const sv = async () => {
    if (!ek) return;
    try {
      await contentApi.save(ek, ed);
      sc((p) => ({ ...p, [ek]: ed }));
      se(null);
      sh('ذخیره شد ✅');
    } catch {
      sh('ذخیره ناموفق ❌');
    }
  };

  const tabs: any[] = [
    { id: 'dashboard', l: 'داشبورد', i: '📊' },
    { id: 'users', l: 'کاربران', i: '👥' },
    { id: 'content', l: 'ویرایش محتوا', i: '✏️' },
    { id: 'chatbot', l: 'چتبات', i: '🤖' },
    { id: 'articles', l: 'مقالات', i: '📝' },
    { id: 'videos', l: 'ویدیوها', i: '🎬' },
    { id: 'minibooks', l: 'مینی‌بوک‌ها', i: '📚' },
    { id: 'consultation', l: 'مشاوره', i: '📅' },
    { id: 'taxlaws', l: 'قوانین مالیاتی', i: '⚖️' },
    { id: 'audit', l: 'گزارش‌ها', i: '📋' },
  ];

  // ---- Loading gate: only show full-screen spinner on the very first load ----
  if (ld && !authFailed && !stats && !users && !logs && Object.keys(ac).length === 0) {
    return (
      <div style={C}>
        <div style={SP} />
      </div>
    );
  }

  // ---- Auth failed: show login prompt instead of infinite spinner ----
  if (authFailed) {
    return (
      <div style={C}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="glass-card" style={{ maxWidth: 440, width: '92%', padding: 40, textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-dark.webp" alt="آین تراز" style={{ width: 110, margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>دسترسی محدود</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7, fontSize: '0.9rem' }}>
            برای ورود به پنل مدیریت ابتدا باید با حساب کاربری مدیر وارد شوید.
          </p>
          <Link href="/?expired=1" className="btn btn-primary" style={{ width: '100%' }}>
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={C2}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {nl && (
        <LoginModal
          title="ورود به پنل مدیریت"
          onClose={() => snl(false)}
          onSuccess={() => { snl(false); ldD(); }}
        />
      )}
      <header style={HD}>
        <div className="container" style={HD2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-dark.webp" alt="آین تراز" style={{ height: 34, width: 'auto', filter: 'drop-shadow(0 2px 8px rgba(198,169,98,.25))' }} />
            <span style={{ color: 'var(--border-default)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>پنل مدیریت</span>
          </div>
          <Link href="/" style={HL2}>خروج</Link>
        </div>
      </header>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {to && <div className="toast">{to}</div>}
        <div style={TBAR}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => st(t.id as Tab)}
              style={tb === t.id ? TBA : TBB}
            >
              <span style={{ marginLeft: 6 }}>{t.i}</span> {t.l}
            </button>
          ))}
        </div>

        {tb === 'dashboard' && <Dash stats={stats} act={act} loading={ld} />}
        {tb === 'content' && <CT ac={ac} af={af} ek={ek} se={se} ed={ed} sd={sd} db={db} sv={sv} loading={ld} />}
        {tb === 'users' && <UT users={users} q={q} sq={sq} ldU={ldU} up={up} loading={ld} />}
        {tb === 'chatbot' && <CB tq={tq} stq={stq} tqr={tqr} stqr={stqr} eq={eq} seq={seq} nq={nq} snq={snq} eo={eo} seo={seo} no={no} sno={sno} nr={nr} snr={snr} er={er} ser={ser} sh={sh} ldQ={() => ldQ()} IS={IS} EB={EB} LB={LB} IS2={IS2} />}
        {tb === 'articles' && <AR arts={arts} ea={ea} sea={sea} na={na} sna={sna} cats={cats} sh={sh} ldA={() => ldA()} IS={IS} IS2={IS2} EB={EB} />}
        {tb === 'videos' && <VI vids={vids} ev={ev} sev={sev} nv={nv} snv={snv} cats={cats} sh={sh} ldV={() => ldV()} IS={IS} IS2={IS2} EB={EB} />}
        {tb === 'minibooks' && <MB mbs={mbs} emb={emb} semb={semb} nmb={nmb} snmb={snmb} cats={cats} sh={sh} ldMB={() => ldMB()} IS={IS} IS2={IS2} EB={EB} />}
        {tb === 'consultation' && <CSComp csvs={csvs} ecv={ecv} secv={secv} ncv={ncv} sncv={sncv} sh={sh} ldCS={() => ldCS()} IS={IS} IS2={IS2} EB={EB} />}
        {tb === 'taxlaws' && <TaxLaws taxTopics={taxTopics} taxSources={taxSources} taxRules={taxRules} etxTopic={etxTopic} setEtxTopic={setEtxTopic} ntxTopic={ntxTopic} setNtxTopic={setNtxTopic} etxSource={etxSource} setEtxSource={setEtxSource} ntxSource={ntxSource} setNtxSource={setNtxSource} etxRule={etxRule} setEtxRule={setEtxRule} ntxRule={ntxRule} setNtxRule={setNtxRule} txSubTab={txSubTab} setTxSubTab={setTxSubTab} sh={sh} ldTxLaws={() => ldTxLaws()} IS={IS} IS2={IS2} EB={EB} />}
        {tb === 'audit' && <AT logs={logs} ldL={ldL} ap={ap} loading={ld} />}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: '2.2rem', marginBottom: 12, opacity: 0.5 }}>📭</div>
      <p style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function Dash({ stats, act, loading }: any) {
  if (loading && !stats) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>در حال بارگذاری…</div>;
  if (!stats) return <Empty label="اطلاعات داشبورد در دسترس نیست" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
        {[
          { l: 'کاربران', v: stats.totalUsers, c: '#3b82f6' },
          { l: 'قوانین', v: stats.totalTaxRules, c: 'var(--brand-gold)' },
          { l: 'رزروها', v: stats.totalBookings, c: '#a855f7' },
          { l: 'منتظر', v: stats.pendingBookings, c: '#eab308' },
          { l: 'تأیید', v: stats.confirmedBookings, c: '#22c55e' },
          { l: 'سوالات', v: stats.totalQuestions, c: '#06b6d4' },
          { l: 'مقالات', v: stats.content?.articles?.total ?? 0, c: '#f97316' },
          { l: 'ویدیوها', v: stats.content?.videos?.total ?? 0, c: '#ec4899' },
          { l: 'مینی‌بوک‌ها', v: stats.content?.minibooks?.total ?? 0, c: '#14b8a6' },
          { l: 'دسته‌ها', v: stats.content?.categories?.active ?? 0, c: '#8b5cf6' },
        ].map((c, i) => (
          <div key={i} className="card" style={{ borderLeft: `3px solid ${c.c}` }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8 }}>{c.l}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c.c }}>{c.v ?? '-'}</div>
          </div>
        ))}
      </div>
      {stats.content && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>محتوای منتشر شده</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
            {[
              { l: 'مقالات منتشر', v: stats.content.articles?.published ?? 0, c: '#22c55e' },
              { l: 'مقالات پیش‌نویس', v: stats.content.articles?.draft ?? 0, c: '#94a3b8' },
              { l: 'مقالات در بازبینی', v: stats.content.articles?.review ?? 0, c: '#eab308' },
              { l: 'ویدیوهای منتشر', v: stats.content.videos?.published ?? 0, c: '#22c55e' },
              { l: 'ویدیوهای پیش‌نویس', v: stats.content.videos?.draft ?? 0, c: '#94a3b8' },
              { l: 'مینی‌بوک منتشر', v: stats.content.minibooks?.published ?? 0, c: '#22c55e' },
              { l: 'مینی‌بوک پیش‌نویس', v: stats.content.minibooks?.draft ?? 0, c: '#94a3b8' },
              { l: 'دسته‌های فعال', v: stats.content.categories?.active ?? 0, c: '#8b5cf6' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--brand-black-card)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.l}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: c.c }}>{c.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>کاربران جدید</h3>
          {act?.recentUsers?.length ? (
            act.recentUsers.map((u: any) => (
              <div key={u.id} style={KR}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'بدون نام'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }} dir="ltr">{u.phone}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('fa-IR')}</div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>کاربری ثبت نشده است.</p>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>رزروها</h3>
          {act?.recentBookings?.length ? (
            act.recentBookings.map((b: any) => (
              <div key={b.id} style={KR}>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.service?.name || 'مشاوره'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{b.user?.firstName} {b.user?.lastName}</div>
                </div>
                <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'PENDING' ? 'badge-warning' : 'badge-error'}`}>
                  {b.status === 'CONFIRMED' ? 'تأیید' : b.status === 'PENDING' ? 'منتظر' : b.status}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>رزروی ثبت نشده است.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CT({ ac, af, ek, se, ed, sd, db, sv, loading }: any) {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>ویرایش متون سایت</h3>
        <button onClick={af} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '10px 20px' }} disabled={loading}>
          🪄 جای‌گذاری خودکار قوانین ۱۴۰۵
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(ac).length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>هنوز محتوایی ذخیره نشده</p>
            <button onClick={af} className="btn btn-primary">🪄 جای‌گذاری خودکار قوانین ۱۴۰۵</button>
          </div>
        )}
        {Object.entries(ac).map(([k, v]: any) => (
          <div key={k} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', marginRight: 8 }}>{v?.title || ''}</span>
              </div>
              {ek !== k && (
                <button onClick={() => { se(k); sd(v || { title: '', hero: '', subtitle: '', description: '' }); }} style={EB}>✏️ ویرایش</button>
              )}
            </div>
            {ek === k ? (
              <>
                <input value={ed.title} onChange={(e) => { const d = { ...ed, title: e.target.value }; sd(d); db(k, d); }} style={IS} placeholder="عنوان" />
                <input value={ed.hero} onChange={(e) => { const d = { ...ed, hero: e.target.value }; sd(d); db(k, d); }} style={IS} placeholder="متن اصلی" />
                <input value={ed.subtitle} onChange={(e) => { const d = { ...ed, subtitle: e.target.value }; sd(d); db(k, d); }} style={IS} placeholder="زیرعنوان" />
                <textarea value={ed.description} onChange={(e) => { const d = { ...ed, description: e.target.value }; sd(d); db(k, d); }} rows={5} style={{ ...IS, resize: 'vertical', minHeight: 100 }} placeholder="توضیحات" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={sv} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '8px 16px' }}>💾 ذخیره</button>
                  <button onClick={() => se(null)} className="btn btn-ghost" style={{ fontSize: '0.8125rem', padding: '8px 16px' }}>انصراف</button>
                </div>
                <div style={PVS}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 600 }}>🔍 پیش‌نمایش</span>
                  <div style={{ marginTop: 8, padding: 12, background: 'var(--surface-card)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>{ed.title}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', margin: '4px 0' }}>{ed.hero || '—'}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{ed.subtitle || '—'}</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>{ed.description || '—'}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8 }}>
                  <div>
                    <span style={LB}>Hero</span>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{v?.hero || '—'}</div>
                  </div>
                  <div>
                    <span style={LB}>زیرعنوان</span>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{v?.subtitle || '—'}</div>
                  </div>
                </div>
                <div>
                  <span style={LB}>توضیحات</span>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxHeight: 80, overflow: 'hidden' }}>
                    {v?.description?.substring(0, 200) || '—'}{(v?.description?.length || 0) > 200 ? '...' : ''}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UT({ users, q, sq, ldU, up, loading }: any) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={q} onChange={(e) => sq(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ldU(1)} placeholder="جستجو..." style={{ ...IS, flex: 1 }} />
        <button onClick={() => ldU(1)} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '10px 18px' }}>جستجو</button>
      </div>
      {loading && !users ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>در حال بارگذاری…</div>
      ) : !users || !users.data?.length ? (
        <Empty label="کاربری یافت نشد" />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={TB}>
              <thead>
                <tr style={TR}>
                  {(['نام', 'شماره', 'نقش', 'وضعیت', 'تأیید', 'تاریخ'] as string[]).map((x) => (
                    <th key={x} style={TH}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.data.map((u: any) => (
                  <tr key={u.id} style={TR}>
                    {(
                      [
                        u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : '---',
                        <span dir="ltr">{u.phone}</span>,
                        <span className={`badge ${u.role === 'SUPER_ADMIN' ? 'badge-error' : u.role === 'ADMIN' ? 'badge-gold' : 'badge-success'}`}>
                          {u.role === 'SUPER_ADMIN' ? 'سوپر' : u.role === 'ADMIN' ? 'ادمین' : 'کاربر'}
                        </span>,
                        <span style={{ fontSize: '0.8125rem', color: u.isActive ? '#22c55e' : '#ef4444' }}>{u.isActive ? 'فعال' : 'غیرفعال'}</span>,
                        u.phoneVerified ? '✅' : '⏳',
                        new Date(u.createdAt).toLocaleDateString('fa-IR'),
                      ] as any[]
                    ).map((c: any, j: number) => (
                      <td key={j} style={TD}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.total > 15 && (
            <div style={PG}>
              <span>صفحه {up} از {Math.ceil(users.total / 15)}</span>
              <div style={PGB}>
                <B onClick={() => ldU(up - 1)} disabled={up <= 1}>قبلی</B>
                <B onClick={() => ldU(up + 1)} disabled={up * 15 >= users.total}>بعدی</B>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AT({ logs, ldL, ap, loading }: any) {
  if (loading && !logs) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>در حال بارگذاری…</div>;
  if (!logs || !logs.data?.length) return <Empty label="گزارشی ثبت نشده است" />;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={TB}>
          <thead>
            <tr style={TR}>
              {(['کاربر', 'عملیات', 'نوع', 'تاریخ'] as string[]).map((x) => (
                <th key={x} style={TH}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.data.map((l: any) => (
              <tr key={l.id} style={TR}>
                {(
                  [
                    l.user ? `${l.user.firstName || ''} ${l.user.lastName || ''}` : '—',
                    <span className="badge badge-gold">{l.action}</span>,
                    l.entityType,
                    new Date(l.createdAt).toLocaleString('fa-IR'),
                  ] as any[]
                ).map((c: any, j: number) => (
                  <td key={j} style={TD}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.total > 15 && (
        <div style={PG}>
          <span>صفحه {ap} از {Math.ceil(logs.total / 15)}</span>
          <div style={PGB}>
            <B onClick={() => ldL(ap - 1)} disabled={ap <= 1}>قبلی</B>
            <B onClick={() => ldL(ap + 1)} disabled={ap * 15 >= logs.total}>بعدی</B>
          </div>
        </div>
      )}
    </div>
  );
}

function B({ onClick, disabled, children }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 12px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        color: 'var(--text-secondary)',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'Vazirmatn',
        fontSize: '0.8125rem',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function CSComp({csvs,ecv,secv,ncv,sncv,sh,ldCS,IS,IS2,EB}:any){
const sv=async()=>{if(!ncv.name.trim()||!ncv.description.trim()){sh('\u0646\u0627\u0645 \u0648 \u062a\u0648\u0636\u06cc\u062d \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(ecv){await adminApi.updateConsultationService(ecv.id,{name:ncv.name,description:ncv.description,duration:ncv.duration,price:ncv.price||undefined,isActive:ncv.isActive,sortOrder:ncv.sortOrder});sh('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createConsultationService({name:ncv.name,slug:ncv.slug,description:ncv.description,duration:ncv.duration,price:ncv.price||undefined,isActive:ncv.isActive,sortOrder:ncv.sortOrder});sh('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}secv(null);sncv({name:'',slug:'',description:'',duration:30,price:0,isActive:true,sortOrder:0});ldCS()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dl=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteConsultationService(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldCS()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const fmtP=(p?:number|null)=>{if(!p||p===0)return'\u0631\u0627\u06cc\u06af\u0627\u0646';return new Intl.NumberFormat('fa-IR').format(p)+' \u062a\u0648\u0645\u0627\u0646'};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83d\udcc5 \u0645\u062f\u06cc\u0631\u06cc\u062a \u062e\u062f\u0645\u0627\u062a \u0645\u0634\u0627\u0648\u0631\u0647 ({csvs.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{ecv?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u062e\u062f\u0645\u062a':'\u2795 \u062e\u062f\u0645\u062a \u0645\u0634\u0627\u0648\u0631\u0647 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={ncv.name} onChange={e=>sncv({...ncv,name:e.target.value})} style={IS} placeholder="\u0646\u0627\u0645 \u062e\u062f\u0645\u062a (\u0645\u062b\u0627\u0644: \u0645\u0634\u0627\u0648\u0631\u0647 \u062a\u0644\u0641\u0646\u06cc)"/>
<input value={ncv.slug} onChange={e=>sncv({...ncv,slug:e.target.value})} style={IS} placeholder="\u0646\u0634\u0627\u0646 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631)"/>
<textarea value={ncv.description} onChange={e=>sncv({...ncv,description:e.target.value})} style={IS2} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u062e\u062f\u0645\u062a"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={ncv.duration} onChange={e=>sncv({...ncv,duration:+e.target.value})} style={{...IS,width:120}} placeholder="\u0632\u0645\u0627\u0646 (\u062f\u0642\u06cc\u0642\u0647)"/>
<input type="number" value={ncv.price} onChange={e=>sncv({...ncv,price:+e.target.value})} style={{...IS,width:150}} placeholder="\u0642\u06cc\u0645\u062a (\u062a\u0648\u0645\u0627\u0646)"/>
<input type="number" value={ncv.sortOrder} onChange={e=>sncv({...ncv,sortOrder:+e.target.value})} style={{...IS,width:100}} placeholder="\u062a\u0631\u062a\u06cc\u0628"/>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={ncv.isActive} onChange={e=>sncv({...ncv,isActive:e.target.checked})}/> \u0641\u0639\u0627\u0644</label>
<button onClick={sv} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{ecv?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{ecv&&<button onClick={()=>{secv(null);sncv({name:'',slug:'',description:'',duration:30,price:0,isActive:true,sortOrder:0})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{csvs.map((s:any)=><div key={s.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{display:'flex',alignItems:'center',gap:8}}>
<span style={{fontWeight:600,fontSize:'0.9375rem'}}>{s.name}</span>
<span className={s.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{s.isActive?'\u0641\u0639\u0627\u0644':'\u063a\u06cc\u0631\u0641\u0639\u0627\u0644'}</span>
</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4,lineHeight:1.6}}>{s.description?.substring(0,150)}</div>
<div style={{display:'flex',gap:12,marginTop:8,alignItems:'center'}}>
<span style={{fontSize:'0.8125rem',color:'var(--brand-gold)',fontWeight:600}}>{fmtP(s.price)}</span>
<span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>\u23f1 {s.duration} \u062f\u0642\u06cc\u0642\u0647</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{secv(s);sncv({name:s.name,slug:s.slug,description:s.description,duration:s.duration,price:s.price||0,isActive:s.isActive,sortOrder:s.sortOrder})}} style={EB}>\u270f\ufe0f</button>
<button onClick={()=>dl(s.id)} style={{...EB,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{csvs.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u062e\u062f\u0645\u0627\u062a \u0645\u0634\u0627\u0648\u0631\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u062e\u062f\u0645\u062a \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function TaxLaws({taxTopics,taxSources,taxRules,etxTopic,setEtxTopic,ntxTopic,setNtxTopic,etxSource,setEtxSource,ntxSource,setNtxSource,etxRule,setEtxRule,ntxRule,setNtxRule,txSubTab,setTxSubTab,sh,ldTxLaws,IS,IS2,EB}:any){
const subBtn=(id:string,label:string)=>({
padding:'10px 18px',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',fontFamily:'Vazirmatn',
border:'none',borderBottom:txSubTab===id?'2px solid var(--brand-gold)':'2px solid transparent',
background:'none',color:txSubTab===id?'var(--brand-gold)':'var(--text-muted)'});

// ---- Topics CRUD ----
const svTopic=async()=>{if(!ntxTopic.name.trim()){sh('نام موضوع را وارد کنید');return}try{
if(etxTopic){await adminApi.updateTaxTopic(etxTopic.id,{name:ntxTopic.name,description:ntxTopic.description,sortOrder:ntxTopic.sortOrder,isActive:ntxTopic.isActive});sh('ویرایش شد ✅')}
else{await adminApi.createTaxTopic({name:ntxTopic.name,slug:ntxTopic.slug,description:ntxTopic.description,sortOrder:ntxTopic.sortOrder,isActive:ntxTopic.isActive});sh('افزوده شد ✅')}
setEtxTopic(null);setNtxTopic({name:'',slug:'',description:'',sortOrder:0,isActive:true});ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};
const dlTopic=async(id:string)=>{if(!confirm('حذف شود؟'))return;try{await adminApi.deleteTaxTopic(id);sh('حذف شد ✅');ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};

// ---- Sources CRUD ----
const svSource=async()=>{if(!ntxSource.name.trim()){sh('نام منبع را وارد کنید');return}try{
if(etxSource){await adminApi.updateTaxSource(etxSource.id,{name:ntxSource.name,url:ntxSource.url,officialName:ntxSource.officialName,description:ntxSource.description,isActive:ntxSource.isActive});sh('ویرایش شد ✅')}
else{await adminApi.createTaxSource({name:ntxSource.name,url:ntxSource.url,officialName:ntxSource.officialName,description:ntxSource.description,isActive:ntxSource.isActive});sh('افزوده شد ✅')}
setEtxSource(null);setNtxSource({name:'',url:'',officialName:'',description:'',isActive:true});ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};
const dlSource=async(id:string)=>{if(!confirm('حذف شود؟'))return;try{await adminApi.deleteTaxSource(id);sh('حذف شد ✅');ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};

// ---- Rules CRUD ----
const svRule=async()=>{if(!ntxRule.name.trim()||!ntxRule.content.trim()||!ntxRule.topicId||!ntxRule.sourceId||!ntxRule.effectiveFrom){sh('نام، متن قانون، موضوع، منبع و تاریخ اجرا را پر کنید');return}try{
if(etxRule){await adminApi.updateTaxRule(etxRule.id,{topicId:ntxRule.topicId,name:ntxRule.name,description:ntxRule.description,status:ntxRule.status});sh('ویرایش شد ✅')}
else{await adminApi.createTaxRule({topicId:ntxRule.topicId,name:ntxRule.name,slug:ntxRule.slug,description:ntxRule.description,content:ntxRule.content,sourceId:ntxRule.sourceId,effectiveFrom:ntxRule.effectiveFrom,status:ntxRule.status});sh('افزوده شد ✅')}
setEtxRule(null);setNtxRule({topicId:'',name:'',slug:'',description:'',content:'',sourceId:'',effectiveFrom:'',status:'DRAFT'});ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};
const dlRule=async(id:string)=>{if(!confirm('حذف شود؟ این عمل تمام نسخه‌های قانون را حذف می‌کند.'))return;try{await adminApi.deleteTaxRule(id);sh('حذف شد ✅');ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};

// ---- Publish a rule version ----
const publishRule=async(ruleId:string)=>{if(!confirm('منتشر شود؟'))return;try{
const rule=taxRules.find((r:any)=>r.id===ruleId);const latestVer=rule?.versions?.[0];
if(!latestVer){sh('نسخه‌ای وجود ندارد ❌');return}
await adminApi.updateTaxRuleVersion(latestVer.id,{status:'PUBLISHED'});
await adminApi.updateTaxRule(ruleId,{status:'PUBLISHED'});
sh('قانون منتشر شد ✅');ldTxLaws()}catch(e:any){sh(e?.response?.data?.message||'خطا ❌')}};

const stl=(s:string)=>{const m:any={DRAFT:'badge-warning',REVIEW:'badge-gold',APPROVED:'badge-success',PUBLISHED:'badge-success',SUPERSEDED:'badge-error'};return m[s]||'badge-warning'};
const stx=(s:string)=>{const m:any={DRAFT:'پیش‌نویس',REVIEW:'بررسی',APPROVED:'تأیید شده',PUBLISHED:'منتشر شده',SUPERSEDED:'منسوخ'};return m[s]||s};

return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>⚖️ مدیریت قوانین مالیاتی</h3>
<div style={{display:'flex',gap:2,marginBottom:8,borderBottom:'1px solid var(--border-subtle)'}}>
<button onClick={()=>setTxSubTab('rules')} style={subBtn('rules','قوانین')}>📋 قوانین ({taxRules.length})</button>
<button onClick={()=>setTxSubTab('topics')} style={subBtn('topics','موضوعات')}>📂 موضوعات ({taxTopics.length})</button>
<button onClick={()=>setTxSubTab('sources')} style={subBtn('sources','منابع')}>📚 منابع ({taxSources.length})</button>
</div>

{txSubTab==='rules'&&<>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{etxRule?'✏️ ویرایش قانون':'➕ قانون مالیاتی جدید'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={ntxRule.name} onChange={e=>setNtxRule({...ntxRule,name:e.target.value})} style={IS} placeholder="نام قانون (مثال: نرخ مالیات حقوق ۱۴۰۵)"/>
<input value={ntxRule.slug} onChange={e=>setNtxRule({...ntxRule,slug:e.target.value})} style={IS} placeholder="نشان (اختیاری — خودکار ساخته می‌شود)"/>
<textarea value={ntxRule.description} onChange={e=>setNtxRule({...ntxRule,description:e.target.value})} style={IS2} placeholder="خلاصه قانون"/>
<textarea value={ntxRule.content} onChange={e=>setNtxRule({...ntxRule,content:e.target.value})} style={{...IS2,minHeight:160}} placeholder="متن کامل قانون (نسخه اول)"/>
<div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
<select value={ntxRule.topicId} onChange={e=>setNtxRule({...ntxRule,topicId:e.target.value})} style={{...IS,flex:1}}>
<option value="">انتخاب موضوع...</option>
{taxTopics.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
</select>
<select value={ntxRule.sourceId} onChange={e=>setNtxRule({...ntxRule,sourceId:e.target.value})} style={{...IS,flex:1}}>
<option value="">انتخاب منبع...</option>
{taxSources.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
</select>
</div>
<div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
<input type="date" value={ntxRule.effectiveFrom} onChange={e=>setNtxRule({...ntxRule,effectiveFrom:e.target.value})} style={{...IS,flex:1}} placeholder="تاریخ اجرا"/>
<select value={ntxRule.status} onChange={e=>setNtxRule({...ntxRule,status:e.target.value})} style={{...IS,flex:1}}>
<option value="DRAFT">پیش‌نویس</option><option value="REVIEW">بررسی</option><option value="APPROVED">تأیید شده</option><option value="PUBLISHED">منتشر شده</option>
</select>
<button onClick={svRule} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{etxRule?'💾 ذخیره':'➕ افزودن قانون'}</button>
{etxRule&&<button onClick={()=>{setEtxRule(null);setNtxRule({topicId:'',name:'',slug:'',description:'',content:'',sourceId:'',effectiveFrom:'',status:'DRAFT'})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{taxRules.map((r:any)=><div key={r.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{r.name}</div>
<div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}} dir="ltr">/{r.slug}</div>
{r.description&&<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4,lineHeight:1.6}}>{r.description.substring(0,150)}</div>}
<div style={{display:'flex',gap:6,marginTop:6,alignItems:'center',flexWrap:'wrap'}}>
<span className={stl(r.status)} style={{fontSize:'0.7rem'}}>{stx(r.status)}</span>
{r.topic&&<span style={{fontSize:'0.7rem',color:'var(--brand-gold)'}}>{r.topic.name}</span>}
{r.versions?.[0]&&<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>نسخه {r.versions[0].version}</span>}
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
{r.status!=='PUBLISHED'&&<button onClick={()=>publishRule(r.id)} style={{...EB,color:'#22c55e'}}>📢 انتشار</button>}
<button onClick={()=>{setEtxRule(r);setNtxRule({topicId:r.topicId,name:r.name,slug:r.slug,description:r.description||'',content:r.versions?.[0]?.content||'',sourceId:r.versions?.[0]?.sourceId||'',effectiveFrom:r.versions?.[0]?.effectiveFrom?new Date(r.versions[0].effectiveFrom).toISOString().split('T')[0]:'',status:r.status})}} style={EB}>✏️</button>
<button onClick={()=>dlRule(r.id)} style={{...EB,color:'#ef4444'}}>🗑</button>
</div>
</div>
</div>)}
{taxRules.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>قانونی وجود ندارد — ابتدا یک موضوع و منبع ایجاد کنید، سپس قانون جدید اضافه کنید.</div>}
</div>
</>}

{txSubTab==='topics'&&<>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{etxTopic?'✏️ ویرایش موضوع':'➕ موضوع جدید'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={ntxTopic.name} onChange={e=>setNtxTopic({...ntxTopic,name:e.target.value})} style={IS} placeholder="نام موضوع (مثال: مالیات حقوق)"/>
<input value={ntxTopic.slug} onChange={e=>setNtxTopic({...ntxTopic,slug:e.target.value})} style={IS} placeholder="نشان (اختیاری — خودکار)"/>
<textarea value={ntxTopic.description} onChange={e=>setNtxTopic({...ntxTopic,description:e.target.value})} style={IS2} placeholder="توضیحات موضوع"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={ntxTopic.sortOrder} onChange={e=>setNtxTopic({...ntxTopic,sortOrder:+e.target.value})} style={{...IS,width:100}} placeholder="ترتیب"/>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={ntxTopic.isActive} onChange={e=>setNtxTopic({...ntxTopic,isActive:e.target.checked})}/> فعال</label>
<button onClick={svTopic} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{etxTopic?'💾 ذخیره':'➕ افزودن'}</button>
{etxTopic&&<button onClick={()=>{setEtxTopic(null);setNtxTopic({name:'',slug:'',description:'',sortOrder:0,isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{taxTopics.map((t:any)=><div key={t.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{t.name}</div>
{t.description&&<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:4}}>{t.description.substring(0,100)}</div>}
<div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
<span className={t.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{t.isActive?'فعال':'غیرفعال'}</span>
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{t._count?.rules||0} قانون</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{setEtxTopic(t);setNtxTopic({name:t.name,slug:t.slug,description:t.description||'',sortOrder:t.sortOrder,isActive:t.isActive})}} style={EB}>✏️</button>
<button onClick={()=>dlTopic(t.id)} style={{...EB,color:'#ef4444'}}>🗑</button>
</div>
</div>
</div>)}
{taxTopics.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>موضوعی وجود ندارد — اولین موضوع را اضافه کنید.</div>}
</div>
</>}

{txSubTab==='sources'&&<>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{etxSource?'✏️ ویرایش منبع':'➕ منبع جدید'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={ntxSource.name} onChange={e=>setNtxSource({...ntxSource,name:e.target.value})} style={IS} placeholder="نام منبع (مثال: قانون مالیات‌های مستقیم)"/>
<input value={ntxSource.officialName} onChange={e=>setNtxSource({...ntxSource,officialName:e.target.value})} style={IS} placeholder="نام رسمی (اختیاری)"/>
<input value={ntxSource.url} onChange={e=>setNtxSource({...ntxSource,url:e.target.value})} style={IS} placeholder="آدرس منبع (URL — اختیاری)"/>
<textarea value={ntxSource.description} onChange={e=>setNtxSource({...ntxSource,description:e.target.value})} style={IS2} placeholder="توضیحات منبع"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={ntxSource.isActive} onChange={e=>setNtxSource({...ntxSource,isActive:e.target.checked})}/> فعال</label>
<button onClick={svSource} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{etxSource?'💾 ذخیره':'➕ افزودن'}</button>
{etxSource&&<button onClick={()=>{setEtxSource(null);setNtxSource({name:'',url:'',officialName:'',description:'',isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{taxSources.map((s:any)=><div key={s.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{s.name}</div>
{s.officialName&&<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:2}}>{s.officialName}</div>}
{s.url&&<a href={s.url} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.75rem',color:'var(--brand-gold)',display:'block',marginTop:4}} dir="ltr">{s.url.substring(0,60)}</a>}
<div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
<span className={s.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{s.isActive?'فعال':'غیرفعال'}</span>
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{s._count?.rules||0} نسخه</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{setEtxSource(s);setNtxSource({name:s.name,url:s.url||'',officialName:s.officialName||'',description:s.description||'',isActive:s.isActive})}} style={EB}>✏️</button>
<button onClick={()=>dlSource(s.id)} style={{...EB,color:'#ef4444'}}>🗑</button>
</div>
</div>
</div>)}
{taxSources.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>منبعی وجود ندارد — اولین منبع را اضافه کنید.</div>}
</div>
</>}
</div>}

function MB({mbs,emb,semb,nmb,snmb,cats,sh,ldMB,IS,IS2,EB}:any){
const sv=async()=>{if(!nmb.title.trim()||!nmb.fileUrl.trim()){sh('\u0639\u0646\u0648\u0627\u0646 \u0648 \u0622\u062f\u0631\u0633 \u0641\u0627\u06cc\u0644 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(emb){await adminApi.updateMiniBook(emb.id,{title:nmb.title,description:nmb.description,fileUrl:nmb.fileUrl,coverImage:nmb.coverImage,pageCount:nmb.pageCount||undefined,status:nmb.status,categoryId:nmb.categoryId||undefined});sh('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createMiniBook({title:nmb.title,slug:nmb.slug,description:nmb.description,fileUrl:nmb.fileUrl,coverImage:nmb.coverImage,pageCount:nmb.pageCount||undefined,status:nmb.status,categoryId:nmb.categoryId||undefined});sh('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}semb(null);snmb({title:'',slug:'',description:'',fileUrl:'',coverImage:'',pageCount:0,status:'DRAFT',categoryId:''});ldMB()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dl=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteMiniBook(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldMB()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const stl=(s:string)=>{const m:any={DRAFT:'badge-warning',REVIEW:'badge-gold',PUBLISHED:'badge-success',ARCHIVED:'badge-error'};return m[s]||'badge-warning'};
const stx=(s:string)=>{const m:any={DRAFT:'\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633',REVIEW:'\u0628\u0631\u0631\u0633\u06cc',PUBLISHED:'\u0645\u0646\u062a\u0634\u0631',ARCHIVED:'\u0622\u0631\u0634\u06cc\u0648'};return m[s]||s};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83d\udcd5 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9\u200c\u0647\u0627 ({mbs.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{emb?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9':'\u2795 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={nmb.title} onChange={e=>snmb({...nmb,title:e.target.value})} style={IS} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9"/>
<input value={nmb.slug} onChange={e=>snmb({...nmb,slug:e.target.value})} style={IS} placeholder="\u0646\u0634\u0627\u0646 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631)"/>
<textarea value={nmb.description} onChange={e=>snmb({...nmb,description:e.target.value})} style={IS2} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a"/>
<input value={nmb.fileUrl} onChange={e=>snmb({...nmb,fileUrl:e.target.value})} style={IS} placeholder="\u0622\u062f\u0631\u0633 \u0641\u0627\u06cc\u0644 PDF (URL)"/>
<input value={nmb.coverImage} onChange={e=>snmb({...nmb,coverImage:e.target.value})} style={IS} placeholder="\u0622\u062f\u0631\u0633 \u06a9\u0627\u0648\u0631 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={nmb.pageCount} onChange={e=>snmb({...nmb,pageCount:+e.target.value})} style={{...IS,width:120}} placeholder="\u062a\u0639\u062f\u0627\u062f \u0635\u0641\u062d\u0647"/>
<select value={nmb.status} onChange={e=>snmb({...nmb,status:e.target.value})} style={{...IS,flex:1}}>
<option value="DRAFT">\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633</option><option value="REVIEW">\u0628\u0631\u0631\u0633\u06cc</option><option value="PUBLISHED">\u0645\u0646\u062a\u0634\u0631</option><option value="ARCHIVED">\u0622\u0631\u0634\u06cc\u0648</option>
</select>
<select value={nmb.categoryId} onChange={e=>snmb({...nmb,categoryId:e.target.value})} style={{...IS,flex:1}}>
<option value="">\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc (\u062e\u0648\u062f\u06a9\u0627\u0631)</option>
{cats.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
</select>
<button onClick={sv} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{emb?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{emb&&<button onClick={()=>{semb(null);snmb({title:'',slug:'',description:'',fileUrl:'',coverImage:'',pageCount:0,status:'DRAFT',categoryId:''})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
{mbs.map((b:any)=><div key={b.id} className="glass-card" style={{padding:14,display:'flex',flexDirection:'column',gap:10}}>
{b.coverImage?<img src={b.coverImage} alt={b.title} style={{width:'100%',height:180,objectFit:'cover',borderRadius:8}}/>:<div style={{width:'100%',height:180,background:'rgba(198,169,98,.06)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem'}}>\ud83d\udcd5</div>}
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{b.title}</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',flex:1}}>{b.description?.substring(0,80)||'\u0628\u062f\u0648\u0646 \u062a\u0648\u0636\u06cc\u062d'}</div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{display:'flex',gap:6,alignItems:'center'}}>
<span className={stl(b.status)} style={{fontSize:'0.7rem'}}>{stx(b.status)}</span>
{b.pageCount&&<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{b.pageCount} \u0635</span>}
</div>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{semb(b);snmb({title:b.title,slug:b.slug,description:b.description||'',fileUrl:b.fileUrl,coverImage:b.coverImage||'',pageCount:b.pageCount||0,status:b.status,categoryId:b.categoryId})}} style={EB}>\u270f\ufe0f</button>
<button onClick={()=>dl(b.id)} style={{...EB,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{mbs.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function VI({vids,ev,sev,nv,snv,cats,sh,ldV,IS,IS2,EB}:any){
const sv=async()=>{if(!nv.title.trim()||!nv.url.trim()){sh('\u0639\u0646\u0648\u0627\u0646 \u0648 \u0622\u062f\u0631\u0633 \u0648\u06cc\u062f\u06cc\u0648 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(ev){await adminApi.updateVideo(ev.id,{title:nv.title,description:nv.description,url:nv.url,thumbnail:nv.thumbnail,duration:nv.duration||undefined,status:nv.status,categoryId:nv.categoryId||undefined});sh('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createVideo({title:nv.title,slug:nv.slug,description:nv.description,url:nv.url,thumbnail:nv.thumbnail,duration:nv.duration||undefined,status:nv.status,categoryId:nv.categoryId||undefined});sh('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}sev(null);snv({title:'',slug:'',description:'',url:'',thumbnail:'',duration:0,status:'DRAFT',categoryId:''});ldV()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dl=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteVideo(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldV()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const stl=(s:string)=>{const m:any={DRAFT:'badge-warning',REVIEW:'badge-gold',PUBLISHED:'badge-success',ARCHIVED:'badge-error'};return m[s]||'badge-warning'};
const stx=(s:string)=>{const m:any={DRAFT:'\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633',REVIEW:'\u0628\u0631\u0631\u0633\u06cc',PUBLISHED:'\u0645\u0646\u062a\u0634\u0631',ARCHIVED:'\u0622\u0631\u0634\u06cc\u0648'};return m[s]||s};
const fmtDur=(d?:number)=>{if(!d)return'-';const m=Math.floor(d/60);const s=d%60;return `${m}:${s.toString().padStart(2,'0')}`};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83c\udfa5 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0648\u06cc\u062f\u06cc\u0648\u0647\u0627 ({vids.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{ev?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0648\u06cc\u062f\u06cc\u0648':'\u2795 \u0648\u06cc\u062f\u06cc\u0648 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={nv.title} onChange={e=>snv({...nv,title:e.target.value})} style={IS} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0648\u06cc\u062f\u06cc\u0648"/>
<input value={nv.slug} onChange={e=>snv({...nv,slug:e.target.value})} style={IS} placeholder="\u0646\u0634\u0627\u0646 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631)"/>
<textarea value={nv.description} onChange={e=>snv({...nv,description:e.target.value})} style={IS2} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a"/>
<input value={nv.url} onChange={e=>snv({...nv,url:e.target.value})} style={IS} placeholder="\u0622\u062f\u0631\u0633 \u0648\u06cc\u062f\u06cc\u0648 (URL \u2014 \u0645\u062b\u0627\u0644: https://...mp4)"/>
<input value={nv.thumbnail} onChange={e=>snv({...nv,thumbnail:e.target.value})} style={IS} placeholder="\u0622\u062f\u0631\u0633 \u062a\u0635\u0648\u06cc\u0631 \u06a9\u0627\u0648\u0631 (URL \u2014 \u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={nv.duration} onChange={e=>snv({...nv,duration:+e.target.value})} style={{...IS,width:120}} placeholder="\u0632\u0645\u0627\u0646 (\u062b\u0627\u0646\u06cc\u0647)"/>
<select value={nv.status} onChange={e=>snv({...nv,status:e.target.value})} style={{...IS,flex:1}}>
<option value="DRAFT">\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633</option><option value="REVIEW">\u0628\u0631\u0631\u0633\u06cc</option><option value="PUBLISHED">\u0645\u0646\u062a\u0634\u0631</option><option value="ARCHIVED">\u0622\u0631\u0634\u06cc\u0648</option>
</select>
<select value={nv.categoryId} onChange={e=>snv({...nv,categoryId:e.target.value})} style={{...IS,flex:1}}>
<option value="">\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc (\u062e\u0648\u062f\u06a9\u0627\u0631)</option>
{cats.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
</select>
<button onClick={sv} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{ev?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{ev&&<button onClick={()=>{sev(null);snv({title:'',slug:'',description:'',url:'',thumbnail:'',duration:0,status:'DRAFT',categoryId:''})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
{vids.map((v:any)=><div key={v.id} className="glass-card" style={{padding:14,display:'flex',flexDirection:'column',gap:10}}>
{v.thumbnail?<img src={v.thumbnail} alt={v.title} style={{width:'100%',height:140,objectFit:'cover',borderRadius:8}}/>:<div style={{width:'100%',height:140,background:'rgba(198,169,98,.06)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>\ud83c\udfa5</div>}
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{v.title}</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',flex:1}}>{v.description?.substring(0,80)||'\u0628\u062f\u0648\u0646 \u062a\u0648\u0636\u06cc\u062d'}</div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{display:'flex',gap:6,alignItems:'center'}}>
<span className={stl(v.status)} style={{fontSize:'0.7rem'}}>{stx(v.status)}</span>
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{fmtDur(v.duration)}</span>
</div>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{sev(v);snv({title:v.title,slug:v.slug,description:v.description||'',url:v.url,thumbnail:v.thumbnail||'',duration:v.duration||0,status:v.status,categoryId:v.categoryId})}} style={EB}>\u270f\ufe0f</button>
<button onClick={()=>dl(v.id)} style={{...EB,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{vids.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0648\u06cc\u062f\u06cc\u0648\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0648\u06cc\u062f\u06cc\u0648 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function AR({arts,ea,sea,na,sna,cats,sh,ldA,IS,IS2,EB}:any){
const sv=async()=>{if(!na.title.trim()||!na.content.trim()){sh('\u0639\u0646\u0648\u0627\u0646 \u0648 \u0645\u062a\u0646 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(ea){await adminApi.updateArticle(ea.id,{title:na.title,excerpt:na.excerpt,content:na.content,featuredImage:na.featuredImage,status:na.status,categoryId:na.categoryId||undefined});sh('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createArticle({title:na.title,slug:na.slug,excerpt:na.excerpt,content:na.content,featuredImage:na.featuredImage,status:na.status,categoryId:na.categoryId||undefined});sh('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}sea(null);sna({title:'',slug:'',excerpt:'',content:'',featuredImage:'',status:'DRAFT',categoryId:''});ldA()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dl=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteArticle(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldA()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const stl=(s:string)=>{const m:any={DRAFT:'badge-warning',REVIEW:'badge-gold',PUBLISHED:'badge-success',ARCHIVED:'badge-error'};return m[s]||'badge-warning'};
const stx=(s:string)=>{const m:any={DRAFT:'\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633',REVIEW:'\u0628\u0631\u0631\u0633\u06cc',PUBLISHED:'\u0645\u0646\u062a\u0634\u0631',ARCHIVED:'\u0622\u0631\u0634\u06cc\u0648'};return m[s]||s};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83d\udcdd \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u0642\u0627\u0644\u0627\u062a ({arts.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{ea?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0645\u0642\u0627\u0644\u0647':'\u2795 \u0645\u0642\u0627\u0644\u0647 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={na.title} onChange={e=>sna({...na,title:e.target.value})} style={IS} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0645\u0642\u0627\u0644\u0647"/>
<input value={na.slug} onChange={e=>sna({...na,slug:e.target.value})} style={IS} placeholder="\u0646\u0634\u0627\u0646 \u0627\u06cc\u0646\u062a\u0631\u0646\u062a\u06cc (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631 \u0633\u0627\u062e\u062a\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f)"/>
<input value={na.excerpt} onChange={e=>sna({...na,excerpt:e.target.value})} style={IS} placeholder="\u062e\u0644\u0627\u0635\u0647 \u06a9\u0648\u062a\u0627\u0647"/>
<textarea value={na.content} onChange={e=>sna({...na,content:e.target.value})} style={{...IS2,minHeight:200}} placeholder="\u0645\u062a\u0646 \u06a9\u0627\u0645\u0644 \u0645\u0642\u0627\u0644\u0647"/>
<input value={na.featuredImage} onChange={e=>sna({...na,featuredImage:e.target.value})} style={IS} placeholder="\u0622\u062f\u0631\u0633 \u062a\u0635\u0648\u06cc\u0631 \u0634\u0627\u062e\u0635 (URL)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<select value={na.status} onChange={e=>sna({...na,status:e.target.value})} style={{...IS,flex:1}}>
<option value="DRAFT">\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633</option><option value="REVIEW">\u0628\u0631\u0631\u0633\u06cc</option><option value="PUBLISHED">\u0645\u0646\u062a\u0634\u0631</option><option value="ARCHIVED">\u0622\u0631\u0634\u06cc\u0648</option>
</select>
<select value={na.categoryId} onChange={e=>sna({...na,categoryId:e.target.value})} style={{...IS,flex:1}}>
<option value="">\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc (\u062e\u0648\u062f\u06a9\u0627\u0631)</option>
{cats.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
</select>
<button onClick={sv} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{ea?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647 \u0648\u06cc\u0631\u0627\u06cc\u0634':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{ea&&<button onClick={()=>{sea(null);sna({title:'',slug:'',excerpt:'',content:'',featuredImage:'',status:'DRAFT',categoryId:''})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{arts.map((a:any)=><div key={a.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{a.title}</div>
<div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}} dir="ltr">/{a.slug}</div>
{a.excerpt&&<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4}}>{a.excerpt.substring(0,120)}</div>}
<div style={{display:'flex',gap:6,marginTop:6,alignItems:'center',flexWrap:'wrap'}}>
<span className={stl(a.status)} style={{fontSize:'0.7rem'}}>{stx(a.status)}</span>
{a.category&&<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{a.category.name}</span>}
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{new Date(a.createdAt).toLocaleDateString('fa-IR')}</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{sea(a);sna({title:a.title,slug:a.slug,excerpt:a.excerpt||'',content:a.content,featuredImage:a.featuredImage||'',status:a.status,categoryId:a.categoryId})}} style={EB}>\u270f\ufe0f</button>
<button onClick={()=>dl(a.id)} style={{...EB,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{arts.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0645\u0642\u0627\u0644\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0645\u0642\u0627\u0644\u0647 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function CB({tq,stq,tqr,stqr,eq,seq,nq,snq,eo,seo,no,sno,nr,snr,er,ser,sh,ldQ,IS,EB,LB,IS2}:any){
const svQ=async()=>{if(!nq.question.trim()){sh('\u0633\u0648\u0627\u0644 \u062e\u0627\u0644\u06cc \u0627\u0633\u062a');return}try{if(eq){await adminApi.updateTaxQuestion(eq.id,{question:nq.question,description:nq.description,sortOrder:nq.sortOrder,isActive:nq.isActive});sh('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createTaxQuestion({question:nq.question,description:nq.description,sortOrder:nq.sortOrder,isActive:nq.isActive});sh('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}seq(null);snq({question:'',description:'',sortOrder:0,isActive:true});ldQ()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dlQ=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteTaxQuestion(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldQ()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const svO=async()=>{if(!no.label.trim()||!no.questionId){sh('\u06af\u0632\u06cc\u0646\u0647 \u0648 \u0633\u0648\u0627\u0644 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{await adminApi.createTaxQuestionOption({questionId:no.questionId,label:no.label,value:no.value||no.label,sortOrder:no.sortOrder});sh('\u06af\u0632\u06cc\u0646\u0647 \u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705');sno({questionId:'',label:'',value:'',sortOrder:0});ldQ()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dlO=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteTaxQuestionOption(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldQ()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const svR=async()=>{if(!nr.name.trim()||!nr.title.trim()){sh('\u0646\u0627\u0645 \u0648 \u0639\u0646\u0648\u0627\u0646 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(er){await adminApi.updateTaxAssistantResult(er.id,{name:nr.name,title:nr.title,description:nr.description,action:nr.action,severity:nr.severity,isActive:nr.isActive});sh('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createTaxAssistantResult({name:nr.name,title:nr.title,description:nr.description,action:nr.action,severity:nr.severity,isActive:nr.isActive});sh('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}ser(null);snr({name:'',title:'',description:'',action:'',severity:'INFO',isActive:true});ldQ()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const dlR=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteTaxAssistantResult(id);sh('\u062d\u0630\u0641 \u0634\u062f \u2705');ldQ()}catch{sh('\u062e\u0637\u0627 \u274c')}};
const sevr=(s:string)=>{const m:any={INFO:'badge-success',WARNING:'badge-warning',CRITICAL:'badge-error',NEEDS_REVIEW:'badge-gold'};return m[s]||'badge-success'};
const sevl=(s:string)=>{const m:any={INFO:'\u0627\u0637\u0644\u0627\u0639',WARNING:'\u0647\u0634\u062f\u0627\u0631',CRITICAL:'\u062d\u06cc\u0627\u062a\u06cc',NEEDS_REVIEW:'\u0646\u06cc\u0627\u0632 \u0628\u0647 \u0628\u0631\u0631\u0633\u06cc'};return m[s]||s};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83e\udd16 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0686\u062a\u200c\u0628\u0627\u062a \u2014 \u0633\u0624\u0627\u0644\u0627\u062a \u0648 \u062c\u0648\u0627\u0628\u200c\u0647\u0627</h3></div>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>\ud83d\udccb \u0633\u0624\u0627\u0644\u0627\u062a ({tq.length})</h4>
<div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
<input value={nq.question} onChange={e=>snq({...nq,question:e.target.value})} style={IS} placeholder="\u0645\u062a\u0646 \u0633\u0624\u0627\u0644"/>
<textarea value={nq.description} onChange={e=>snq({...nq,description:e.target.value})} style={IS2} placeholder="\u062a\u0648\u0636\u06cc\u062d (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={nq.sortOrder} onChange={e=>snq({...nq,sortOrder:+e.target.value})} style={{...IS,width:100}} placeholder="\u062a\u0631\u062a\u06cc\u0628"/>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={nq.isActive} onChange={e=>snq({...nq,isActive:e.target.checked})}/> \u0641\u0639\u0627\u0644</label>
<button onClick={svQ} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{eq?'\ud83d\udcbe \u0648\u06cc\u0631\u0627\u06cc\u0634':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0624\u0627\u0644'}</button>
{eq&&<button onClick={()=>{seq(null);snq({question:'',description:'',sortOrder:0,isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{tq.map((qq:any)=><div key={qq.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{qq.sortOrder+1}. {qq.question}</div>
{qq.description&&<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:4}}>{qq.description}</div>}
<div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
{qq.options?.map((o:any)=><span key={o.id} style={{fontSize:'0.75rem',background:'rgba(198,169,98,.1)',border:'1px solid var(--border-subtle)',borderRadius:6,padding:'3px 8px',color:'var(--brand-gold)'}}>{o.label} <button onClick={()=>dlO(o.id)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:'0.75rem',padding:0,marginRight:4}}>\u2715</button></span>)}
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<span className={qq.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{qq.isActive?'\u0641\u0639\u0627\u0644':'\u063a\u06cc\u0631\u0641\u0639\u0627\u0644'}</span>
<button onClick={()=>{seq(qq);snq({question:qq.question,description:qq.description||'',sortOrder:qq.sortOrder,isActive:qq.isActive})}} style={EB}>\u270f\ufe0f</button>
<button onClick={()=>dlQ(qq.id)} style={{...EB,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
<div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--border-subtle)'}}>
<div style={{display:'flex',gap:6,alignItems:'center'}}>
<select value={no.questionId} onChange={e=>sno({...no,questionId:e.target.value})} style={{...IS,flex:1,fontSize:'0.8125rem',padding:'6px 10px'}}>
<option value="">\u0627\u0646\u062a\u062e\u0627\u0628 \u0633\u0624\u0627\u0644...</option>
{tq.map((qq2:any)=><option key={qq2.id} value={qq2.id}>{qq2.question.substring(0,40)}</option>)}
</select>
<input value={no.label} onChange={e=>sno({...no,label:e.target.value})} style={{...IS,flex:1,fontSize:'0.8125rem',padding:'6px 10px'}} placeholder="\u0645\u062a\u0646 \u06af\u0632\u06cc\u0646\u0647"/>
<input type="number" value={no.sortOrder} onChange={e=>sno({...no,sortOrder:+e.target.value})} style={{...IS,width:60,fontSize:'0.8125rem',padding:'6px 10px'}} placeholder="\u062a\u0631\u062a\u06cc\u0628"/>
<button onClick={svO} className="btn btn-primary" style={{fontSize:'0.75rem',padding:'6px 12px'}}>\u2795 \u06af\u0632\u06cc\u0646\u0647</button>
</div>
</div>
</div>)}
{tq.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0633\u0624\u0627\u0644\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0633\u0624\u0627\u0644 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>\ud83c\udfc1 \u0646\u062a\u0627\u06cc\u062c \u0645\u0634\u0627\u0648\u0631\u0647 ({tqr.length})</h4>
<div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
<input value={nr.name} onChange={e=>snr({...nr,name:e.target.value})} style={IS} placeholder="\u0646\u0627\u0645 (\u0627\u0646\u06af\u0644\u06cc\u0633\u06cc\u060c \u06cc\u06a9\u062a\u0627)"/>
<input value={nr.title} onChange={e=>snr({...nr,title:e.target.value})} style={IS} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0646\u0645\u0627\u06cc\u0634\u06cc"/>
<textarea value={nr.description} onChange={e=>snr({...nr,description:e.target.value})} style={IS2} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u0646\u062a\u06cc\u062c\u0647"/>
<input value={nr.action} onChange={e=>snr({...nr,action:e.target.value})} style={IS} placeholder="\u0627\u0642\u062f\u0627\u0645 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f\u06cc (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<select value={nr.severity} onChange={e=>snr({...nr,severity:e.target.value})} style={{...IS,flex:1}}>
<option value="INFO">\u0627\u0637\u0644\u0627\u0639</option><option value="WARNING">\u0647\u0634\u062f\u0627\u0631</option><option value="CRITICAL">\u062d\u06cc\u0627\u062a\u06cc</option><option value="NEEDS_REVIEW">\u0646\u06cc\u0627\u0632 \u0628\u0647 \u0628\u0631\u0631\u0633\u06cc</option>
</select>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={nr.isActive} onChange={e=>snr({...nr,isActive:e.target.checked})}/> \u0641\u0639\u0627\u0644</label>
<button onClick={svR} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{er?'\ud83d\udcbe \u0648\u06cc\u0631\u0627\u06cc\u0634':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646 \u0646\u062a\u06cc\u062c\u0647'}</button>
{er&&<button onClick={()=>{ser(null);snr({name:'',title:'',description:'',action:'',severity:'INFO',isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{tqr.map((r:any)=><div key={r.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{r.title}</div>
<div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}}>{r.name}</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:6,lineHeight:1.6}}>{r.description?.substring(0,150)}{(r.description?.length||0)>150?'...':''}</div>
{r.action&&<div style={{fontSize:'0.8125rem',color:'var(--brand-gold)',marginTop:6}}>\u2192 {r.action}</div>}
</div>
<div style={{display:'flex',gap:8,flexShrink:0,flexDirection:'column',alignItems:'flex-end'}}>
<span className={sevr(r.severity)} style={{fontSize:'0.7rem'}}>{sevl(r.severity)}</span>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{ser(r);snr({name:r.name,title:r.title,description:r.description,action:r.action||'',severity:r.severity,isActive:r.isActive})}} style={EB}>\u270f\ufe0f</button>
<button onClick={()=>dlR(r.id)} style={{...EB,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>
</div>)}
{tqr.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f</div>}
</div>
</div>
</div>}


const C: React.CSSProperties = { minHeight: '100vh', background: 'var(--brand-black)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const C2: React.CSSProperties = { ...C, display: 'block' };
const SP: React.CSSProperties = { width: 44, height: 44, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' };
const HD: React.CSSProperties = { borderBottom: '1px solid var(--border-subtle)', background: 'var(--brand-black-soft)', padding: '0 20px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' };
const HD2: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 };
const HL2: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '0.8125rem' };
const TBAR: React.CSSProperties = { display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' };
const TBA: React.CSSProperties = { padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, border: 'none', background: 'none', color: 'var(--brand-gold)', borderBottom: '2px solid var(--brand-gold)', cursor: 'pointer', fontFamily: 'Vazirmatn', whiteSpace: 'nowrap' };
const TBB: React.CSSProperties = { ...TBA, color: 'var(--text-muted)', borderBottom: '2px solid transparent' };
const KR: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' };
const IS: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1.5px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'Vazirmatn', fontSize: '0.9375rem', outline: 'none' };
const IS2: React.CSSProperties = { ...IS, resize: 'vertical', minHeight: 80 };
const EB: React.CSSProperties = { background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--brand-gold)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: '0.8125rem' };
const PVS: React.CSSProperties = { padding: 14, background: 'rgba(198,169,98,.04)', borderRadius: 8, border: '1px solid var(--border-subtle)' };
const LB: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 };
const TB: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const TR = { borderBottom: '1px solid var(--border-subtle)' };
const TH: React.CSSProperties = { textAlign: 'right', padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 };
const TD: React.CSSProperties = { padding: '10px 16px', fontSize: '0.875rem' };
const PG: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)' };
const PGB: React.CSSProperties = { display: 'flex', gap: 6 };
