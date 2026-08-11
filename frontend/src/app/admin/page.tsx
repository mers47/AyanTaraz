'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { adminApi, contentApi } from '@/lib/api';
import LoginModal from '@/components/LoginModal';
import type {
  DashboardStats, RecentActivity, UserRow, AuditLog, PaginatedResponse,
  Article, Video, MiniBook, Category, TaxQuestion, TaxQuestionOption, TaxAssistantResultAdmin,
  TaxTopic, TaxSource, TaxRule, ConsultationService, ConsultationBooking,
  ContentSection, ContentStatus, TaxRuleStatus, TaxResultSeverity,
} from '@/types';

type Tab = 'dashboard' | 'users' | 'content' | 'chatbot' | 'articles' | 'videos' | 'minibooks' | 'consultation' | 'taxlaws' | 'audit';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [users, setUsers] = useState<PaginatedResponse<UserRow> | null>(null);
  const [logs, setLogs] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [contentSections, setContentSections] = useState<Record<string, ContentSection>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editData, setEditData] = useState<ContentSection>({ title: '', hero: '', subtitle: '', description: '' });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // ---- Content management state (from main: chatbot / articles / videos / minibooks / consultation) ----
  const [needsLogin, setNeedsLogin] = useState(false);
  const checkAuthError = (err: unknown) => {
    const e = err as { response?: { status?: number } };
    if (e?.response?.status === 401 || e?.response?.status === 403) setNeedsLogin(true);
  };
  const [taxQuestions, setTaxQuestions] = useState<TaxQuestion[]>([]);
  const [taxResults, setTaxResults] = useState<TaxAssistantResultAdmin[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<TaxQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({ question: '', description: '', sortOrder: 0, isActive: true });
  const [editingOption, setEditingOption] = useState<TaxQuestionOption | null>(null);
  const [newOption, setNewOption] = useState({ questionId: '', label: '', value: '', sortOrder: 0 });
  const [newResult, setNewResult] = useState({ name: '', title: '', description: '', action: '', severity: 'INFO' as TaxResultSeverity, isActive: true });
  const [editingResult, setEditingResult] = useState<TaxAssistantResultAdmin | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState({ title: '', slug: '', excerpt: '', content: '', featuredImage: '', status: 'DRAFT' as ContentStatus, categoryId: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', slug: '', description: '', url: '', thumbnail: '', duration: 0, status: 'DRAFT' as ContentStatus, categoryId: '' });
  const [miniBooks, setMiniBooks] = useState<MiniBook[]>([]);
  const [editingMiniBook, setEditingMiniBook] = useState<MiniBook | null>(null);
  const [newMiniBook, setNewMiniBook] = useState({ title: '', slug: '', description: '', fileUrl: '', coverImage: '', pageCount: 0, status: 'DRAFT' as ContentStatus, categoryId: '' });
  const [consultationServices, setConsultationServices] = useState<ConsultationService[]>([]);
  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>([]);
  const [editingService, setEditingService] = useState<ConsultationService | null>(null);
  const [newService, setNewService] = useState({ name: '', slug: '', description: '', duration: 30, price: 0, isActive: true, sortOrder: 0 });

  // ---- Tax laws management state ----
  const [taxTopics, setTaxTopics] = useState<TaxTopic[]>([]);
  const [taxSources, setTaxSources] = useState<TaxSource[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [editingTopic, setEditingTopic] = useState<TaxTopic | null>(null);
  const [newTopic, setNewTopic] = useState({ name: '', slug: '', description: '', sortOrder: 0, isActive: true });
  const [editingSource, setEditingSource] = useState<TaxSource | null>(null);
  const [newSource, setNewSource] = useState({ name: '', url: '', officialName: '', description: '', isActive: true });
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [newRule, setNewRule] = useState({ topicId: '', name: '', slug: '', description: '', content: '', sourceId: '', effectiveFrom: '', status: 'DRAFT' as TaxRuleStatus });
  const [txSubTab, setTxSubTab] = useState<'rules' | 'topics' | 'sources'>('rules');

  const debounceSave = useCallback((k: string, d: ContentSection) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await contentApi.save(k, d);
        setContentSections((p) => ({ ...p, [k]: d }));
        showToast('ذخیره خودکار ✅');
      } catch {
        showToast('ذخیره خودکار ناموفق ❌');
      }
    }, 800);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setAuthFailed(false);
    try {
      const [statsRes, activityRes] = await Promise.all([adminApi.getDashboardStats(), adminApi.getRecentActivity(5)]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConsultation = useCallback(async () => {
    setLoading(true); setAuthFailed(false);
    try {
      const servicesRes = await adminApi.getConsultationServices(); setConsultationServices(servicesRes.data || []);
      try { const bookingsRes = await adminApi.getAllBookings(); setConsultationBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []); } catch { setConsultationBookings([]); }
    }
    catch (e: unknown) { const err = e as { response?: { status?: number } }; if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true); }
    finally { setLoading(false); }
  }, []);

  const loadTaxLaws = useCallback(async () => {
    setLoading(true); setAuthFailed(false);
    try {
      const [topicsRes, sourcesRes, rulesRes] = await Promise.all([
        adminApi.getTaxTopicsAdmin(),
        adminApi.getTaxSources(),
        adminApi.getTaxRulesAdmin(),
      ]);
      setTaxTopics(topicsRes.data || []);
      setTaxSources(sourcesRes.data || []);
      setTaxRules(rulesRes.data?.data || []);
    } catch (e: unknown) { const err = e as { response?: { status?: number } }; if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true); }
    finally { setLoading(false); }
  }, []);

  const loadMiniBooks = useCallback(async () => {
    setLoading(true); setAuthFailed(false);
    try { const res = await adminApi.getMiniBooks(1, 50); setMiniBooks(res.data?.data || []); }
    catch (e: unknown) { const err = e as { response?: { status?: number } }; if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true); }
    finally { setLoading(false); }
  }, []);

  const loadVideos = useCallback(async () => {
    setLoading(true); setAuthFailed(false);
    try { const res = await adminApi.getVideos(1, 50); setVideos(res.data?.data || []); }
    catch (e: unknown) { const err = e as { response?: { status?: number } }; if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true); }
    finally { setLoading(false); }
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true); setAuthFailed(false);
    try { const [artsRes, catsRes] = await Promise.all([adminApi.getArticles(1, 50), adminApi.getCategories()]); setArticles(artsRes.data?.data || []); setCategories(catsRes.data || []); }
    catch (e: unknown) { const err = e as { response?: { status?: number } }; if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true); }
    finally { setLoading(false); }
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true); setAuthFailed(false);
    try { const [questionsRes, resultsRes] = await Promise.all([adminApi.getTaxQuestions(), adminApi.getTaxAssistantResults()]); setTaxQuestions(questionsRes.data || []); setTaxResults(resultsRes.data || []); }
    catch (e: unknown) { const err = e as { response?: { status?: number } }; if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setAuthFailed(false);
    try {
      const res = await adminApi.getUsers(page, 15, searchQuery);
      setUsers(res.data);
      setUsersPage(page);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setAuthFailed(false);
    try {
      const res = await contentApi.getAll();
      if (res.data && typeof res.data === 'object') {
        const sections: Record<string, ContentSection> = {};
        for (const [k, v] of Object.entries(res.data as Record<string, ContentSection>)) {
          const key = k.replace('content_', '');
          sections[key] = v;
        }
        setContentSections(sections);
      }
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setAuthFailed(false);
    try {
      const res = await adminApi.getAuditLogs({ page, limit: 15 });
      setLogs(res.data);
      setAuditPage(page);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 401 || err?.response?.status === 403) setAuthFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'content') loadContent();
    else if (activeTab === 'chatbot') loadQuestions();
    else if (activeTab === 'articles') loadArticles();
    else if (activeTab === 'videos') loadVideos();
    else if (activeTab === 'minibooks') loadMiniBooks();
    else if (activeTab === 'consultation') loadConsultation();
    else if (activeTab === 'taxlaws') loadTaxLaws();
    else if (activeTab === 'audit') loadLogs();
  }, [activeTab, loadDashboard, loadUsers, loadContent, loadQuestions, loadArticles, loadVideos, loadMiniBooks, loadConsultation, loadTaxLaws, loadLogs]);

  const autoFillContent = async () => {
    setLoading(true);
    try {
      const response = await contentApi.autoFill();
      showToast(response.data.message || '✅');
      loadContent();
    } catch {
      showToast('❌ خطا در جای‌گذاری خودکار');
    } finally {
      setLoading(false);
    }
  };

  const saveContentSection = async () => {
    if (!editingKey) return;
    try {
      await contentApi.save(editingKey, editData);
      setContentSections((p) => ({ ...p, [editingKey]: editData }));
      setEditingKey(null);
      showToast('ذخیره شد ✅');
    } catch {
      showToast('ذخیره ناموفق ❌');
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'داشبورد', icon: '📊' },
    { id: 'users', label: 'کاربران', icon: '👥' },
    { id: 'content', label: 'ویرایش محتوا', icon: '✏️' },
    { id: 'chatbot', label: 'چتبات', icon: '🤖' },
    { id: 'articles', label: 'مقالات', icon: '📝' },
    { id: 'videos', label: 'ویدیوها', icon: '🎬' },
    { id: 'minibooks', label: 'مینی‌بوک‌ها', icon: '📚' },
    { id: 'consultation', label: 'مشاوره', icon: '📅' },
    { id: 'taxlaws', label: 'قوانین مالیاتی', icon: '⚖️' },
    { id: 'audit', label: 'گزارش‌ها', icon: '📋' },
  ];

  // ---- Loading gate: only show full-screen spinner on the very first load ----
  if (loading && !authFailed && !stats && !users && !logs && Object.keys(contentSections).length === 0) {
    return (
      <div style={centerStyle}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  // ---- Auth failed: show login prompt instead of infinite spinner ----
  if (authFailed) {
    return (
      <div style={centerStyle}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="glass-card" style={{ maxWidth: 440, width: '92%', padding: 40, textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-dark.webp" alt="آیان تراز" style={{ width: 110, margin: '0 auto 20px', display: 'block' }} />
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
    <div style={blockStyle}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {needsLogin && (
        <LoginModal
          title="ورود به پنل مدیریت"
          onClose={() => setNeedsLogin(false)}
          onSuccess={() => { setNeedsLogin(false); loadDashboard(); }}
        />
      )}
      <header style={headerStyle}>
        <div className="container" style={headerInnerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-dark.webp" alt="آیان تراز" style={{ height: 34, width: 'auto', filter: 'drop-shadow(0 2px 8px rgba(198,169,98,.25))' }} />
            <span style={{ color: 'var(--border-default)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>پنل مدیریت</span>
          </div>
          <Link href="/" style={headerLinkStyle}>خروج</Link>
        </div>
      </header>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {toastMsg && <div className="toast">{toastMsg}</div>}
        <div style={tabBarStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? tabActiveStyle : tabInactiveStyle}
            >
              <span style={{ marginLeft: 6 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <DashboardView stats={stats} recentActivity={recentActivity} loading={loading} />}
        {activeTab === 'content' && <ContentEditor sections={contentSections} onAutoFill={autoFillContent} editingKey={editingKey} setEditingKey={setEditingKey} editData={editData} setEditData={setEditData} debounceSave={debounceSave} onSave={saveContentSection} loading={loading} />}
        {activeTab === 'users' && <UsersTable users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadUsers={loadUsers} usersPage={usersPage} loading={loading} />}
        {activeTab === 'chatbot' && <ChatbotManager questions={taxQuestions} results={taxResults} editingQuestion={editingQuestion} setEditingQuestion={setEditingQuestion} newQuestion={newQuestion} setNewQuestion={setNewQuestion} editingOption={editingOption} setEditingOption={setEditingOption} newOption={newOption} setNewOption={setNewOption} newResult={newResult} setNewResult={setNewResult} editingResult={editingResult} setEditingResult={setEditingResult} showToast={showToast} reload={() => loadQuestions()} inputStyle={inputStyle} editButtonStyle={editButtonStyle} labelStyle={labelStyle} textareaStyle={textareaStyle} />}
        {activeTab === 'articles' && <ArticlesManager articles={articles} editingArticle={editingArticle} setEditingArticle={setEditingArticle} newArticle={newArticle} setNewArticle={setNewArticle} categories={categories} showToast={showToast} reload={() => loadArticles()} inputStyle={inputStyle} textareaStyle={textareaStyle} editButtonStyle={editButtonStyle} />}
        {activeTab === 'videos' && <VideosManager videos={videos} editingVideo={editingVideo} setEditingVideo={setEditingVideo} newVideo={newVideo} setNewVideo={setNewVideo} categories={categories} showToast={showToast} reload={() => loadVideos()} inputStyle={inputStyle} textareaStyle={textareaStyle} editButtonStyle={editButtonStyle} />}
        {activeTab === 'minibooks' && <MiniBooksManager miniBooks={miniBooks} editingMiniBook={editingMiniBook} setEditingMiniBook={setEditingMiniBook} newMiniBook={newMiniBook} setNewMiniBook={setNewMiniBook} categories={categories} showToast={showToast} reload={() => loadMiniBooks()} inputStyle={inputStyle} textareaStyle={textareaStyle} editButtonStyle={editButtonStyle} />}
        {activeTab === 'consultation' && <ConsultationManager services={consultationServices} bookings={consultationBookings} editingService={editingService} setEditingService={setEditingService} newService={newService} setNewService={setNewService} showToast={showToast} reload={() => loadConsultation()} inputStyle={inputStyle} textareaStyle={textareaStyle} editButtonStyle={editButtonStyle} />}
        {activeTab === 'taxlaws' && <TaxLawsManager taxTopics={taxTopics} taxSources={taxSources} taxRules={taxRules} editingTopic={editingTopic} setEditingTopic={setEditingTopic} newTopic={newTopic} setNewTopic={setNewTopic} editingSource={editingSource} setEditingSource={setEditingSource} newSource={newSource} setNewSource={setNewSource} editingRule={editingRule} setEditingRule={setEditingRule} newRule={newRule} setNewRule={setNewRule} txSubTab={txSubTab} setTxSubTab={setTxSubTab} showToast={showToast} reload={() => loadTaxLaws()} inputStyle={inputStyle} textareaStyle={textareaStyle} editButtonStyle={editButtonStyle} />}
        {activeTab === 'audit' && <AuditTable logs={logs} loadLogs={loadLogs} auditPage={auditPage} loading={loading} />}
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

function DashboardView({ stats, recentActivity, loading }: { stats: DashboardStats | null; recentActivity: RecentActivity | null; loading: boolean }) {
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
          {recentActivity?.recentUsers?.length ? (
            recentActivity.recentUsers.map((user) => (
              <div key={user.id} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : 'بدون نام'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }} dir="ltr">{user.phone}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>کاربری ثبت نشده است.</p>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>رزروها</h3>
          {recentActivity?.recentBookings?.length ? (
            recentActivity.recentBookings.map((booking) => (
              <div key={booking.id} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 600 }}>{booking.service?.name || 'مشاوره'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{booking.user?.firstName} {booking.user?.lastName}</div>
                </div>
                <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : booking.status === 'PENDING' ? 'badge-warning' : 'badge-error'}`}>
                  {booking.status === 'CONFIRMED' ? 'تأیید' : booking.status === 'PENDING' ? 'منتظر' : booking.status}
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

function ContentEditor({ sections, onAutoFill, editingKey, setEditingKey, editData, setEditData, debounceSave, onSave, loading }: {
  sections: Record<string, ContentSection>;
  onAutoFill: () => void;
  editingKey: string | null;
  setEditingKey: (k: string | null) => void;
  editData: ContentSection;
  setEditData: (d: ContentSection) => void;
  debounceSave: (k: string, d: ContentSection) => void;
  onSave: () => void;
  loading: boolean;
}) {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>ویرایش متون سایت</h3>
        <button onClick={onAutoFill} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '10px 20px' }} disabled={loading}>
          🪄 جای‌گذاری خودکار قوانین ۱۴۰۵
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(sections).length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>هنوز محتوایی ذخیره نشده</p>
            <button onClick={onAutoFill} className="btn btn-primary">🪄 جای‌گذاری خودکار قوانین ۱۴۰۵</button>
          </div>
        )}
        {Object.entries(sections).map(([k, v]) => (
          <div key={k} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', marginRight: 8 }}>{v?.title || ''}</span>
              </div>
              {editingKey !== k && (
                <button onClick={() => { setEditingKey(k); setEditData(v || { title: '', hero: '', subtitle: '', description: '' }); }} style={editButtonStyle}>✏️ ویرایش</button>
              )}
            </div>
            {editingKey === k ? (
              <>
                <input value={editData.title} onChange={(e) => { const d = { ...editData, title: e.target.value }; setEditData(d); debounceSave(k, d); }} style={inputStyle} placeholder="عنوان" />
                <input value={editData.hero} onChange={(e) => { const d = { ...editData, hero: e.target.value }; setEditData(d); debounceSave(k, d); }} style={inputStyle} placeholder="متن اصلی" />
                <input value={editData.subtitle} onChange={(e) => { const d = { ...editData, subtitle: e.target.value }; setEditData(d); debounceSave(k, d); }} style={inputStyle} placeholder="زیرعنوان" />
                <textarea value={editData.description} onChange={(e) => { const d = { ...editData, description: e.target.value }; setEditData(d); debounceSave(k, d); }} rows={5} style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} placeholder="توضیحات" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={onSave} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '8px 16px' }}>💾 ذخیره</button>
                  <button onClick={() => setEditingKey(null)} className="btn btn-ghost" style={{ fontSize: '0.8125rem', padding: '8px 16px' }}>انصراف</button>
                </div>
                <div style={previewStyle}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 600 }}>🔍 پیش‌نمایش</span>
                  <div style={{ marginTop: 8, padding: 12, background: 'var(--surface-card)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>{editData.title}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', margin: '4px 0' }}>{editData.hero || '—'}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{editData.subtitle || '—'}</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>{editData.description || '—'}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8 }}>
                  <div>
                    <span style={labelStyle}>Hero</span>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{v?.hero || '—'}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>زیرعنوان</span>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{v?.subtitle || '—'}</div>
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>توضیحات</span>
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

function UsersTable({ users, searchQuery, setSearchQuery, loadUsers, usersPage, loading }: {
  users: PaginatedResponse<UserRow> | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loadUsers: (p?: number) => void;
  usersPage: number;
  loading: boolean;
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadUsers(1)} placeholder="جستجو..." style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => loadUsers(1)} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '10px 18px' }}>جستجو</button>
      </div>
      {loading && !users ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>در حال بارگذاری…</div>
      ) : !users || !users.data?.length ? (
        <Empty label="کاربری یافت نشد" />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableRowStyle}>
                  {(['نام', 'شماره', 'نقش', 'وضعیت', 'تأیید', 'تاریخ'] as string[]).map((header) => (
                    <th key={header} style={tableHeadStyle}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.data.map((user) => (
                  <tr key={user.id} style={tableRowStyle}>
                    {(
                      [
                        user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : '---',
                        <span dir="ltr">{user.phone}</span>,
                        <span className={`badge ${user.role === 'SUPER_ADMIN' ? 'badge-error' : user.role === 'ADMIN' ? 'badge-gold' : 'badge-success'}`}>
                          {user.role === 'SUPER_ADMIN' ? 'سوپر' : user.role === 'ADMIN' ? 'ادمین' : 'کاربر'}
                        </span>,
                        <span style={{ fontSize: '0.8125rem', color: user.isActive ? '#22c55e' : '#ef4444' }}>{user.isActive ? 'فعال' : 'غیرفعال'}</span>,
                        user.phoneVerified ? '✅' : '⏳',
                        new Date(user.createdAt).toLocaleDateString('fa-IR'),
                      ] as React.ReactNode[]
                    ).map((cell, cellIndex) => (
                      <td key={cellIndex} style={tableDataStyle}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.total > 15 && (
            <div style={paginationStyle}>
              <span>صفحه {usersPage} از {Math.ceil(users.total / 15)}</span>
              <div style={paginationButtonsStyle}>
                <PaginationButton onClick={() => loadUsers(usersPage - 1)} disabled={usersPage <= 1}>قبلی</PaginationButton>
                <PaginationButton onClick={() => loadUsers(usersPage + 1)} disabled={usersPage * 15 >= users.total}>بعدی</PaginationButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuditTable({ logs, loadLogs, auditPage, loading }: {
  logs: PaginatedResponse<AuditLog> | null;
  loadLogs: (p?: number) => void;
  auditPage: number;
  loading: boolean;
}) {
  if (loading && !logs) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>در حال بارگذاری…</div>;
  if (!logs || !logs.data?.length) return <Empty label="گزارشی ثبت نشده است" />;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableRowStyle}>
              {(['کاربر', 'عملیات', 'نوع', 'تاریخ'] as string[]).map((header) => (
                <th key={header} style={tableHeadStyle}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.data.map((log) => (
              <tr key={log.id} style={tableRowStyle}>
                {(
                  [
                    log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}` : '—',
                    <span className="badge badge-gold">{log.action}</span>,
                    log.entityType,
                    new Date(log.createdAt).toLocaleString('fa-IR'),
                  ] as React.ReactNode[]
                ).map((cell, cellIndex) => (
                  <td key={cellIndex} style={tableDataStyle}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.total > 15 && (
        <div style={paginationStyle}>
          <span>صفحه {auditPage} از {Math.ceil(logs.total / 15)}</span>
          <div style={paginationButtonsStyle}>
            <PaginationButton onClick={() => loadLogs(auditPage - 1)} disabled={auditPage <= 1}>قبلی</PaginationButton>
            <PaginationButton onClick={() => loadLogs(auditPage + 1)} disabled={auditPage * 15 >= logs.total}>بعدی</PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
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

function ConsultationManager({services,bookings,editingService,setEditingService,newService,setNewService,showToast,reload,inputStyle,textareaStyle,editButtonStyle}:{
  services: ConsultationService[];
  bookings: ConsultationBooking[];
  editingService: ConsultationService | null;
  setEditingService: (s: ConsultationService | null) => void;
  newService: { name: string; slug: string; description: string; duration: number; price: number; isActive: boolean; sortOrder: number };
  setNewService: (s: { name: string; slug: string; description: string; duration: number; price: number; isActive: boolean; sortOrder: number }) => void;
  showToast: (m: string) => void;
  reload: () => void;
  inputStyle: React.CSSProperties; textareaStyle: React.CSSProperties; editButtonStyle: React.CSSProperties;
}){
const saveService=async()=>{if(!newService.name.trim()||!newService.description.trim()){showToast('\u0646\u0627\u0645 \u0648 \u062a\u0648\u0636\u06cc\u062d \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(editingService){await adminApi.updateConsultationService(editingService.id,{name:newService.name,description:newService.description,duration:newService.duration,price:newService.price||undefined,isActive:newService.isActive,sortOrder:newService.sortOrder});showToast('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createConsultationService({name:newService.name,slug:newService.slug,description:newService.description,duration:newService.duration,price:newService.price||undefined,isActive:newService.isActive,sortOrder:newService.sortOrder});showToast('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}setEditingService(null);setNewService({name:'',slug:'',description:'',duration:30,price:0,isActive:true,sortOrder:0});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteService=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteConsultationService(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const fmtP=(p?:number|null)=>{if(!p||p===0)return'\u0631\u0627\u06cc\u06af\u0627\u0646';return new Intl.NumberFormat('fa-IR').format(p)+' \u062a\u0648\u0645\u0627\u0646'};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83d\udcc5 \u0645\u062f\u06cc\u0631\u06cc\u062a \u062e\u062f\u0645\u0627\u062a \u0645\u0634\u0627\u0648\u0631\u0647 ({services.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingService?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u062e\u062f\u0645\u062a':'\u2795 \u062e\u062f\u0645\u062a \u0645\u0634\u0627\u0648\u0631\u0647 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newService.name} onChange={e=>setNewService({...newService,name:e.target.value})} style={inputStyle} placeholder="\u0646\u0627\u0645 \u062e\u062f\u0645\u062a (\u0645\u062b\u0627\u0644: \u0645\u0634\u0627\u0648\u0631\u0647 \u062a\u0644\u0641\u0646\u06cc)"/>
<input value={newService.slug} onChange={e=>setNewService({...newService,slug:e.target.value})} style={inputStyle} placeholder="\u0646\u0634\u0627\u0646 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631)"/>
<textarea value={newService.description} onChange={e=>setNewService({...newService,description:e.target.value})} style={textareaStyle} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u062e\u062f\u0645\u062a"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={newService.duration} onChange={e=>setNewService({...newService,duration:+e.target.value})} style={{...inputStyle,width:120}} placeholder="\u0632\u0645\u0627\u0646 (\u062f\u0642\u06cc\u0642\u0647)"/>
<input type="number" value={newService.price} onChange={e=>setNewService({...newService,price:+e.target.value})} style={{...inputStyle,width:150}} placeholder="\u0642\u06cc\u0645\u062a (\u062a\u0648\u0645\u0627\u0646)"/>
<input type="number" value={newService.sortOrder} onChange={e=>setNewService({...newService,sortOrder:+e.target.value})} style={{...inputStyle,width:100}} placeholder="\u062a\u0631\u062a\u06cc\u0628"/>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={newService.isActive} onChange={e=>setNewService({...newService,isActive:e.target.checked})}/> \u0641\u0639\u0627\u0644</label>
<button onClick={saveService} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingService?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{editingService&&<button onClick={()=>{setEditingService(null);setNewService({name:'',slug:'',description:'',duration:30,price:0,isActive:true,sortOrder:0})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{services.map((service)=><div key={service.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{display:'flex',alignItems:'center',gap:8}}>
<span style={{fontWeight:600,fontSize:'0.9375rem'}}>{service.name}</span>
<span className={service.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{service.isActive?'\u0641\u0639\u0627\u0644':'\u063a\u06cc\u0631\u0641\u0639\u0627\u0644'}</span>
</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4,lineHeight:1.6}}>{service.description?.substring(0,150)}</div>
<div style={{display:'flex',gap:12,marginTop:8,alignItems:'center'}}>
<span style={{fontSize:'0.8125rem',color:'var(--brand-gold)',fontWeight:600}}>{fmtP(service.price)}</span>
<span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>\u23f1 {service.duration} \u062f\u0642\u06cc\u0642\u0647</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{setEditingService(service);setNewService({name:service.name,slug:service.slug,description:service.description,duration:service.duration,price:service.price||0,isActive:service.isActive,sortOrder:service.sortOrder})}} style={editButtonStyle}>\u270f\ufe0f</button>
<button onClick={()=>deleteService(service.id)} style={{...editButtonStyle,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{services.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u062e\u062f\u0645\u0627\u062a \u0645\u0634\u0627\u0648\u0631\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u062e\u062f\u0645\u062a \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
<h3 style={{fontWeight:700,fontSize:'1.125rem',marginTop:8}}>\ud83d\udcc5 \u0631\u0632\u0631\u0648\u0647\u0627\u06cc \u0645\u0634\u0627\u0648\u0631\u0647 ({bookings?.length||0})</h3>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{(bookings||[]).map((booking)=><div key={booking.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,flexWrap:'wrap'}}>
<div style={{flex:1,minWidth:200}}>
<div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
<span style={{fontWeight:600,fontSize:'0.9375rem'}}>{booking.service?.name||'\u0646\u0627\u0645\u0634\u0646\u0627\u0633'}</span>
<span className={booking.status==='CONFIRMED'?'badge badge-success':booking.status==='PENDING'?'badge badge-warning':'badge badge-error'} style={{fontSize:'0.7rem'}}>{booking.status==='CONFIRMED'?'\u062a\u0627\u06cc\u06cc\u062f \u0634\u062f\u0647':booking.status==='PENDING'?'\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631':'\u0644\u063a\u0648 \u0634\u062f\u0647'}</span>
<span className={booking.paymentStatus==='PAID'?'badge badge-success':booking.paymentStatus==='PENDING'?'badge badge-warning':'badge badge-error'} style={{fontSize:'0.7rem'}}>{booking.paymentStatus==='PAID'?'\u067e\u0631\u062f\u0627\u062e\u062a \u0634\u062f\u0647':booking.paymentStatus==='PENDING'?'\u067e\u0631\u062f\u0627\u062e\u062a \u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631':'\u067e\u0631\u062f\u0627\u062e\u062a \u0646\u0634\u062f\u0647'}</span>
</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4,lineHeight:1.6}}>{booking.notes||'\u0628\u062f\u0648\u0646 \u062a\u0648\u0636\u06cc\u062d\u0627\u062a'}</div>
<div style={{display:'flex',gap:12,marginTop:6,alignItems:'center',flexWrap:'wrap'}}>
<span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>\ud83d\udcde {booking.phone}</span>
{booking.amount!=null&&<span style={{fontSize:'0.8125rem',color:'var(--brand-gold)',fontWeight:600}}>{fmtP(booking.amount)}</span>}
{booking.receiptUrl&&<a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.75rem',color:'var(--brand-gold)'}}>\ud83d\udcc4 \u0631\u0633\u06cc\u062f</a>}
</div>
</div>
</div>
</div>)}
{(bookings||[]).length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0631\u0632\u0631\u0648\u06cc \u0628\u0631\u0627\u06cc \u0646\u0645\u0627\u06cc\u0634 \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f</div>}
</div>
</div>}

function TaxLawsManager({taxTopics,taxSources,taxRules,editingTopic,setEditingTopic,newTopic,setNewTopic,editingSource,setEditingSource,newSource,setNewSource,editingRule,setEditingRule,newRule,setNewRule,txSubTab,setTxSubTab,showToast,reload,inputStyle,textareaStyle,editButtonStyle}:{
  taxTopics: TaxTopic[];
  taxSources: TaxSource[];
  taxRules: TaxRule[];
  editingTopic: TaxTopic | null;
  setEditingTopic: (t: TaxTopic | null) => void;
  newTopic: { name: string; slug: string; description: string; sortOrder: number; isActive: boolean };
  setNewTopic: (t: { name: string; slug: string; description: string; sortOrder: number; isActive: boolean }) => void;
  editingSource: TaxSource | null;
  setEditingSource: (s: TaxSource | null) => void;
  newSource: { name: string; url: string; officialName: string; description: string; isActive: boolean };
  setNewSource: (s: { name: string; url: string; officialName: string; description: string; isActive: boolean }) => void;
  editingRule: TaxRule | null;
  setEditingRule: (r: TaxRule | null) => void;
  newRule: { topicId: string; name: string; slug: string; description: string; content: string; sourceId: string; effectiveFrom: string; status: TaxRuleStatus };
  setNewRule: (r: { topicId: string; name: string; slug: string; description: string; content: string; sourceId: string; effectiveFrom: string; status: TaxRuleStatus }) => void;
  txSubTab: 'rules' | 'topics' | 'sources';
  setTxSubTab: (t: 'rules' | 'topics' | 'sources') => void;
  showToast: (m: string) => void;
  reload: () => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  editButtonStyle: React.CSSProperties;
}){
const subBtn=(id:string,label:string)=>({
padding:'10px 18px',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',fontFamily:'Vazirmatn',
border:'none',borderBottom:txSubTab===id?'2px solid var(--brand-gold)':'2px solid transparent',
background:'none',color:txSubTab===id?'var(--brand-gold)':'var(--text-muted)'});

// ---- Topics CRUD ----
const saveTopic=async()=>{if(!newTopic.name.trim()){showToast('نام موضوع را وارد کنید');return}try{
if(editingTopic){await adminApi.updateTaxTopic(editingTopic.id,{name:newTopic.name,description:newTopic.description,sortOrder:newTopic.sortOrder,isActive:newTopic.isActive});showToast('ویرایش شد ✅')}
else{await adminApi.createTaxTopic({name:newTopic.name,slug:newTopic.slug,description:newTopic.description,sortOrder:newTopic.sortOrder,isActive:newTopic.isActive});showToast('افزوده شد ✅')}
setEditingTopic(null);setNewTopic({name:'',slug:'',description:'',sortOrder:0,isActive:true});reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};
const deleteTopic=async(id:string)=>{if(!confirm('حذف شود؟'))return;try{await adminApi.deleteTaxTopic(id);showToast('حذف شد ✅');reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};

// ---- Sources CRUD ----
const saveSource=async()=>{if(!newSource.name.trim()){showToast('نام منبع را وارد کنید');return}try{
if(editingSource){await adminApi.updateTaxSource(editingSource.id,{name:newSource.name,url:newSource.url,officialName:newSource.officialName,description:newSource.description,isActive:newSource.isActive});showToast('ویرایش شد ✅')}
else{await adminApi.createTaxSource({name:newSource.name,url:newSource.url,officialName:newSource.officialName,description:newSource.description,isActive:newSource.isActive});showToast('افزوده شد ✅')}
setEditingSource(null);setNewSource({name:'',url:'',officialName:'',description:'',isActive:true});reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};
const deleteSource=async(id:string)=>{if(!confirm('حذف شود؟'))return;try{await adminApi.deleteTaxSource(id);showToast('حذف شد ✅');reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};

// ---- Rules CRUD ----
const saveRule=async()=>{if(!newRule.name.trim()||!newRule.content.trim()||!newRule.topicId||!newRule.sourceId||!newRule.effectiveFrom){showToast('نام، متن قانون، موضوع، منبع و تاریخ اجرا را پر کنید');return}try{
if(editingRule){await adminApi.updateTaxRule(editingRule.id,{topicId:newRule.topicId,name:newRule.name,description:newRule.description,status:newRule.status});showToast('ویرایش شد ✅')}
else{await adminApi.createTaxRule({topicId:newRule.topicId,name:newRule.name,slug:newRule.slug,description:newRule.description,content:newRule.content,sourceId:newRule.sourceId,effectiveFrom:newRule.effectiveFrom,status:newRule.status});showToast('افزوده شد ✅')}
setEditingRule(null);setNewRule({topicId:'',name:'',slug:'',description:'',content:'',sourceId:'',effectiveFrom:'',status:'DRAFT'});reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};
const deleteRule=async(id:string)=>{if(!confirm('حذف شود؟ این عمل تمام نسخه‌های قانون را حذف می‌کند.'))return;try{await adminApi.deleteTaxRule(id);showToast('حذف شد ✅');reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};

// ---- Publish a rule version ----
const publishRule=async(ruleId:string)=>{if(!confirm('منتشر شود؟'))return;try{
const rule=taxRules.find((ruleItem)=>ruleItem.id===ruleId);const latestVer=rule?.versions?.[0];
if(!latestVer){showToast('نسخه‌ای وجود ندارد ❌');return}
await adminApi.updateTaxRuleVersion(latestVer.id,{status:'PUBLISHED'});
await adminApi.updateTaxRule(ruleId,{status:'PUBLISHED'});
showToast('قانون منتشر شد ✅');reload()}catch(e:unknown){const err=e as {response?:{data?:{message?:string}}};showToast(err?.response?.data?.message||'خطا ❌')}};

const statusBadgeClass=(s:string)=>{const m:Record<string,string>={DRAFT:'badge-warning',REVIEW:'badge-gold',APPROVED:'badge-success',PUBLISHED:'badge-success',SUPERSEDED:'badge-error'};return m[s]||'badge-warning'};
const statusLabel=(s:string)=>{const m:Record<string,string>={DRAFT:'پیش‌نویس',REVIEW:'بررسی',APPROVED:'تأیید شده',PUBLISHED:'منتشر شده',SUPERSEDED:'منسوخ'};return m[s]||s};

return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>⚖️ مدیریت قوانین مالیاتی</h3>
<div style={{display:'flex',gap:2,marginBottom:8,borderBottom:'1px solid var(--border-subtle)'}}>
<button onClick={()=>setTxSubTab('rules')} style={subBtn('rules','قوانین')}>📋 قوانین ({taxRules.length})</button>
<button onClick={()=>setTxSubTab('topics')} style={subBtn('topics','موضوعات')}>📂 موضوعات ({taxTopics.length})</button>
<button onClick={()=>setTxSubTab('sources')} style={subBtn('sources','منابع')}>📚 منابع ({taxSources.length})</button>
</div>

{txSubTab==='rules'&&<>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingRule?'✏️ ویرایش قانون':'➕ قانون مالیاتی جدید'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newRule.name} onChange={e=>setNewRule({...newRule,name:e.target.value})} style={inputStyle} placeholder="نام قانون (مثال: نرخ مالیات حقوق ۱۴۰۵)"/>
<input value={newRule.slug} onChange={e=>setNewRule({...newRule,slug:e.target.value})} style={inputStyle} placeholder="نشان (اختیاری — خودکار ساخته می‌شود)"/>
<textarea value={newRule.description} onChange={e=>setNewRule({...newRule,description:e.target.value})} style={textareaStyle} placeholder="خلاصه قانون"/>
<textarea value={newRule.content} onChange={e=>setNewRule({...newRule,content:e.target.value})} style={{...textareaStyle,minHeight:160}} placeholder="متن کامل قانون (نسخه اول)"/>
<div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
<select value={newRule.topicId} onChange={e=>setNewRule({...newRule,topicId:e.target.value})} style={{...inputStyle,flex:1}}>
<option value="">انتخاب موضوع...</option>
{taxTopics.map((topic)=><option key={topic.id} value={topic.id}>{topic.name}</option>)}
</select>
<select value={newRule.sourceId} onChange={e=>setNewRule({...newRule,sourceId:e.target.value})} style={{...inputStyle,flex:1}}>
<option value="">انتخاب منبع...</option>
{taxSources.map((source)=><option key={source.id} value={source.id}>{source.name}</option>)}
</select>
</div>
<div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
<input type="date" value={newRule.effectiveFrom} onChange={e=>setNewRule({...newRule,effectiveFrom:e.target.value})} style={{...inputStyle,flex:1}} placeholder="تاریخ اجرا"/>
<select value={newRule.status} onChange={e=>setNewRule({...newRule,status:e.target.value as TaxRuleStatus})} style={{...inputStyle,flex:1}}>
<option value="DRAFT">پیش‌نویس</option><option value="REVIEW">بررسی</option><option value="APPROVED">تأیید شده</option><option value="PUBLISHED">منتشر شده</option>
</select>
<button onClick={saveRule} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingRule?'💾 ذخیره':'➕ افزودن قانون'}</button>
{editingRule&&<button onClick={()=>{setEditingRule(null);setNewRule({topicId:'',name:'',slug:'',description:'',content:'',sourceId:'',effectiveFrom:'',status:'DRAFT'})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{taxRules.map((rule)=><div key={rule.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{rule.name}</div>
<div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}} dir="ltr">/{rule.slug}</div>
{rule.description&&<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4,lineHeight:1.6}}>{rule.description.substring(0,150)}</div>}
<div style={{display:'flex',gap:6,marginTop:6,alignItems:'center',flexWrap:'wrap'}}>
<span className={statusBadgeClass(rule.status)} style={{fontSize:'0.7rem'}}>{statusLabel(rule.status)}</span>
{rule.topic&&<span style={{fontSize:'0.7rem',color:'var(--brand-gold)'}}>{rule.topic.name}</span>}
{rule.versions?.[0]&&<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>نسخه {rule.versions[0].version}</span>}
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
{rule.status!=='PUBLISHED'&&<button onClick={()=>publishRule(rule.id)} style={{...editButtonStyle,color:'#22c55e'}}>📢 انتشار</button>}
<button onClick={()=>{setEditingRule(rule);setNewRule({topicId:rule.topicId,name:rule.name,slug:rule.slug,description:rule.description||'',content:rule.versions?.[0]?.content||'',sourceId:rule.versions?.[0]?.sourceId||'',effectiveFrom:rule.versions?.[0]?.effectiveFrom?new Date(rule.versions[0].effectiveFrom).toISOString().split('T')[0]:'',status:rule.status})}} style={editButtonStyle}>✏️</button>
<button onClick={()=>deleteRule(rule.id)} style={{...editButtonStyle,color:'#ef4444'}}>🗑</button>
</div>
</div>
</div>)}
{taxRules.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>قانونی وجود ندارد — ابتدا یک موضوع و منبع ایجاد کنید، سپس قانون جدید اضافه کنید.</div>}
</div>
</>}

{txSubTab==='topics'&&<>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingTopic?'✏️ ویرایش موضوع':'➕ موضوع جدید'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newTopic.name} onChange={e=>setNewTopic({...newTopic,name:e.target.value})} style={inputStyle} placeholder="نام موضوع (مثال: مالیات حقوق)"/>
<input value={newTopic.slug} onChange={e=>setNewTopic({...newTopic,slug:e.target.value})} style={inputStyle} placeholder="نشان (اختیاری — خودکار)"/>
<textarea value={newTopic.description} onChange={e=>setNewTopic({...newTopic,description:e.target.value})} style={textareaStyle} placeholder="توضیحات موضوع"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={newTopic.sortOrder} onChange={e=>setNewTopic({...newTopic,sortOrder:+e.target.value})} style={{...inputStyle,width:100}} placeholder="ترتیب"/>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={newTopic.isActive} onChange={e=>setNewTopic({...newTopic,isActive:e.target.checked})}/> فعال</label>
<button onClick={saveTopic} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingTopic?'💾 ذخیره':'➕ افزودن'}</button>
{editingTopic&&<button onClick={()=>{setEditingTopic(null);setNewTopic({name:'',slug:'',description:'',sortOrder:0,isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{taxTopics.map((topic)=><div key={topic.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{topic.name}</div>
{topic.description&&<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:4}}>{topic.description.substring(0,100)}</div>}
<div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
<span className={topic.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{topic.isActive?'فعال':'غیرفعال'}</span>
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{topic._count?.rules||0} قانون</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{setEditingTopic(topic);setNewTopic({name:topic.name,slug:topic.slug,description:topic.description||'',sortOrder:topic.sortOrder,isActive:topic.isActive})}} style={editButtonStyle}>✏️</button>
<button onClick={()=>deleteTopic(topic.id)} style={{...editButtonStyle,color:'#ef4444'}}>🗑</button>
</div>
</div>
</div>)}
{taxTopics.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>موضوعی وجود ندارد — اولین موضوع را اضافه کنید.</div>}
</div>
</>}

{txSubTab==='sources'&&<>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingSource?'✏️ ویرایش منبع':'➕ منبع جدید'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newSource.name} onChange={e=>setNewSource({...newSource,name:e.target.value})} style={inputStyle} placeholder="نام منبع (مثال: قانون مالیات‌های مستقیم)"/>
<input value={newSource.officialName} onChange={e=>setNewSource({...newSource,officialName:e.target.value})} style={inputStyle} placeholder="نام رسمی (اختیاری)"/>
<input value={newSource.url} onChange={e=>setNewSource({...newSource,url:e.target.value})} style={inputStyle} placeholder="آدرس منبع (URL — اختیاری)"/>
<textarea value={newSource.description} onChange={e=>setNewSource({...newSource,description:e.target.value})} style={textareaStyle} placeholder="توضیحات منبع"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={newSource.isActive} onChange={e=>setNewSource({...newSource,isActive:e.target.checked})}/> فعال</label>
<button onClick={saveSource} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingSource?'💾 ذخیره':'➕ افزودن'}</button>
{editingSource&&<button onClick={()=>{setEditingSource(null);setNewSource({name:'',url:'',officialName:'',description:'',isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{taxSources.map((source)=><div key={source.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{source.name}</div>
{source.officialName&&<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:2}}>{source.officialName}</div>}
{source.url&&<a href={source.url} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.75rem',color:'var(--brand-gold)',display:'block',marginTop:4}} dir="ltr">{source.url.substring(0,60)}</a>}
<div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
<span className={source.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{source.isActive?'فعال':'غیرفعال'}</span>
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{source._count?.rules||0} نسخه</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{setEditingSource(source);setNewSource({name:source.name,url:source.url||'',officialName:source.officialName||'',description:source.description||'',isActive:source.isActive})}} style={editButtonStyle}>✏️</button>
<button onClick={()=>deleteSource(source.id)} style={{...editButtonStyle,color:'#ef4444'}}>🗑</button>
</div>
</div>
</div>)}
{taxSources.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>منبعی وجود ندارد — اولین منبع را اضافه کنید.</div>}
</div>
</>}
</div>}

function MiniBooksManager({miniBooks,editingMiniBook,setEditingMiniBook,newMiniBook,setNewMiniBook,categories,showToast,reload,inputStyle,textareaStyle,editButtonStyle}:{
  miniBooks: MiniBook[];
  editingMiniBook: MiniBook | null;
  setEditingMiniBook: (b: MiniBook | null) => void;
  newMiniBook: { title: string; slug: string; description: string; fileUrl: string; coverImage: string; pageCount: number; status: ContentStatus; categoryId: string };
  setNewMiniBook: (b: { title: string; slug: string; description: string; fileUrl: string; coverImage: string; pageCount: number; status: ContentStatus; categoryId: string }) => void;
  categories: Category[];
  showToast: (m: string) => void;
  reload: () => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  editButtonStyle: React.CSSProperties;
}){
const saveMiniBook=async()=>{if(!newMiniBook.title.trim()||!newMiniBook.fileUrl.trim()){showToast('\u0639\u0646\u0648\u0627\u0646 \u0648 \u0622\u062f\u0631\u0633 \u0641\u0627\u06cc\u0644 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(editingMiniBook){await adminApi.updateMiniBook(editingMiniBook.id,{title:newMiniBook.title,description:newMiniBook.description,fileUrl:newMiniBook.fileUrl,coverImage:newMiniBook.coverImage,pageCount:newMiniBook.pageCount||undefined,status:newMiniBook.status,categoryId:newMiniBook.categoryId||undefined});showToast('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createMiniBook({title:newMiniBook.title,slug:newMiniBook.slug,description:newMiniBook.description,fileUrl:newMiniBook.fileUrl,coverImage:newMiniBook.coverImage,pageCount:newMiniBook.pageCount||undefined,status:newMiniBook.status,categoryId:newMiniBook.categoryId||undefined});showToast('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}setEditingMiniBook(null);setNewMiniBook({title:'',slug:'',description:'',fileUrl:'',coverImage:'',pageCount:0,status:'DRAFT',categoryId:''});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteMiniBook=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteMiniBook(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const statusBadgeClass=(s:string)=>{const m:Record<string,string>={DRAFT:'badge-warning',REVIEW:'badge-gold',PUBLISHED:'badge-success',ARCHIVED:'badge-error'};return m[s]||'badge-warning'};
const statusLabel=(s:string)=>{const m:Record<string,string>={DRAFT:'\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633',REVIEW:'\u0628\u0631\u0631\u0633\u06cc',PUBLISHED:'\u0645\u0646\u062a\u0634\u0631',ARCHIVED:'\u0622\u0631\u0634\u06cc\u0648'};return m[s]||s};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83d\udcd5 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9\u200c\u0647\u0627 ({miniBooks.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingMiniBook?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9':'\u2795 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newMiniBook.title} onChange={e=>setNewMiniBook({...newMiniBook,title:e.target.value})} style={inputStyle} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9"/>
<input value={newMiniBook.slug} onChange={e=>setNewMiniBook({...newMiniBook,slug:e.target.value})} style={inputStyle} placeholder="\u0646\u0634\u0627\u0646 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631)"/>
<textarea value={newMiniBook.description} onChange={e=>setNewMiniBook({...newMiniBook,description:e.target.value})} style={textareaStyle} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a"/>
<input value={newMiniBook.fileUrl} onChange={e=>setNewMiniBook({...newMiniBook,fileUrl:e.target.value})} style={inputStyle} placeholder="\u0622\u062f\u0631\u0633 \u0641\u0627\u06cc\u0644 PDF (URL)"/>
<input value={newMiniBook.coverImage} onChange={e=>setNewMiniBook({...newMiniBook,coverImage:e.target.value})} style={inputStyle} placeholder="\u0622\u062f\u0631\u0633 \u06a9\u0627\u0648\u0631 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={newMiniBook.pageCount} onChange={e=>setNewMiniBook({...newMiniBook,pageCount:+e.target.value})} style={{...inputStyle,width:120}} placeholder="\u062a\u0639\u062f\u0627\u062f \u0635\u0641\u062d\u0647"/>
<select value={newMiniBook.status} onChange={e=>setNewMiniBook({...newMiniBook,status:e.target.value as ContentStatus})} style={{...inputStyle,flex:1}}>
<option value="DRAFT">\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633</option><option value="REVIEW">\u0628\u0631\u0631\u0633\u06cc</option><option value="PUBLISHED">\u0645\u0646\u062a\u0634\u0631</option><option value="ARCHIVED">\u0622\u0631\u0634\u06cc\u0648</option>
</select>
<select value={newMiniBook.categoryId} onChange={e=>setNewMiniBook({...newMiniBook,categoryId:e.target.value})} style={{...inputStyle,flex:1}}>
<option value="">\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc (\u062e\u0648\u062f\u06a9\u0627\u0631)</option>
{categories.map((cat)=><option key={cat.id} value={cat.id}>{cat.name}</option>)}
</select>
<button onClick={saveMiniBook} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingMiniBook?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{editingMiniBook&&<button onClick={()=>{setEditingMiniBook(null);setNewMiniBook({title:'',slug:'',description:'',fileUrl:'',coverImage:'',pageCount:0,status:'DRAFT',categoryId:''})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
{miniBooks.map((book)=><div key={book.id} className="glass-card" style={{padding:14,display:'flex',flexDirection:'column',gap:10}}>
{book.coverImage?<img src={book.coverImage} alt={book.title} style={{width:'100%',height:180,objectFit:'cover',borderRadius:8}}/>:<div style={{width:'100%',height:180,background:'rgba(198,169,98,.06)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem'}}>\ud83d\udcd5</div>}
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{book.title}</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',flex:1}}>{book.description?.substring(0,80)||'\u0628\u062f\u0648\u0646 \u062a\u0648\u0636\u06cc\u062d'}</div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{display:'flex',gap:6,alignItems:'center'}}>
<span className={statusBadgeClass(book.status)} style={{fontSize:'0.7rem'}}>{statusLabel(book.status)}</span>
{book.pageCount&&<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{book.pageCount} \u0635</span>}
</div>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{setEditingMiniBook(book);setNewMiniBook({title:book.title,slug:book.slug,description:book.description||'',fileUrl:book.fileUrl,coverImage:book.coverImage||'',pageCount:book.pageCount||0,status:book.status,categoryId:book.categoryId||''})}} style={editButtonStyle}>\u270f\ufe0f</button>
<button onClick={()=>deleteMiniBook(book.id)} style={{...editButtonStyle,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{miniBooks.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0645\u06cc\u0646\u06cc\u200c\u0628\u0648\u06a9 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function VideosManager({videos,editingVideo,setEditingVideo,newVideo,setNewVideo,categories,showToast,reload,inputStyle,textareaStyle,editButtonStyle}:{
  videos: Video[];
  editingVideo: Video | null;
  setEditingVideo: (v: Video | null) => void;
  newVideo: { title: string; slug: string; description: string; url: string; thumbnail: string; duration: number; status: ContentStatus; categoryId: string };
  setNewVideo: (v: { title: string; slug: string; description: string; url: string; thumbnail: string; duration: number; status: ContentStatus; categoryId: string }) => void;
  categories: Category[];
  showToast: (m: string) => void;
  reload: () => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  editButtonStyle: React.CSSProperties;
}){
const saveVideo=async()=>{if(!newVideo.title.trim()||!newVideo.url.trim()){showToast('\u0639\u0646\u0648\u0627\u0646 \u0648 \u0622\u062f\u0631\u0633 \u0648\u06cc\u062f\u06cc\u0648 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(editingVideo){await adminApi.updateVideo(editingVideo.id,{title:newVideo.title,description:newVideo.description,url:newVideo.url,thumbnail:newVideo.thumbnail,duration:newVideo.duration||undefined,status:newVideo.status,categoryId:newVideo.categoryId||undefined});showToast('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createVideo({title:newVideo.title,slug:newVideo.slug,description:newVideo.description,url:newVideo.url,thumbnail:newVideo.thumbnail,duration:newVideo.duration||undefined,status:newVideo.status,categoryId:newVideo.categoryId||undefined});showToast('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}setEditingVideo(null);setNewVideo({title:'',slug:'',description:'',url:'',thumbnail:'',duration:0,status:'DRAFT',categoryId:''});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteVideo=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteVideo(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const statusBadgeClass=(s:string)=>{const m:Record<string,string>={DRAFT:'badge-warning',REVIEW:'badge-gold',PUBLISHED:'badge-success',ARCHIVED:'badge-error'};return m[s]||'badge-warning'};
const statusLabel=(s:string)=>{const m:Record<string,string>={DRAFT:'\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633',REVIEW:'\u0628\u0631\u0631\u0633\u06cc',PUBLISHED:'\u0645\u0646\u062a\u0634\u0631',ARCHIVED:'\u0622\u0631\u0634\u06cc\u0648'};return m[s]||s};
const fmtDur=(d?:number)=>{if(!d)return'-';const m=Math.floor(d/60);const s=d%60;return `${m}:${s.toString().padStart(2,'0')}`};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83c\udfa5 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0648\u06cc\u062f\u06cc\u0648\u0647\u0627 ({videos.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingVideo?'\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0648\u06cc\u062f\u06cc\u0648':'\u2795 \u0648\u06cc\u062f\u06cc\u0648 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newVideo.title} onChange={e=>setNewVideo({...newVideo,title:e.target.value})} style={inputStyle} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0648\u06cc\u062f\u06cc\u0648"/>
<input value={newVideo.slug} onChange={e=>setNewVideo({...newVideo,slug:e.target.value})} style={inputStyle} placeholder="\u0646\u0634\u0627\u0646 (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631)"/>
<textarea value={newVideo.description} onChange={e=>setNewVideo({...newVideo,description:e.target.value})} style={textareaStyle} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a"/>
<input value={newVideo.url} onChange={e=>setNewVideo({...newVideo,url:e.target.value})} style={inputStyle} placeholder="\u0622\u062f\u0631\u0633 \u0648\u06cc\u062f\u06cc\u0648 (URL \u2014 \u0645\u062b\u0627\u0644: https://...mp4)"/>
<input value={newVideo.thumbnail} onChange={e=>setNewVideo({...newVideo,thumbnail:e.target.value})} style={inputStyle} placeholder="\u0622\u062f\u0631\u0633 \u062a\u0635\u0648\u06cc\u0631 \u06a9\u0627\u0648\u0631 (URL \u2014 \u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={newVideo.duration} onChange={e=>setNewVideo({...newVideo,duration:+e.target.value})} style={{...inputStyle,width:120}} placeholder="\u0632\u0645\u0627\u0646 (\u062b\u0627\u0646\u06cc\u0647)"/>
<select value={newVideo.status} onChange={e=>setNewVideo({...newVideo,status:e.target.value as ContentStatus})} style={{...inputStyle,flex:1}}>
<option value="DRAFT">\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633</option><option value="REVIEW">\u0628\u0631\u0631\u0633\u06cc</option><option value="PUBLISHED">\u0645\u0646\u062a\u0634\u0631</option><option value="ARCHIVED">\u0622\u0631\u0634\u06cc\u0648</option>
</select>
<select value={newVideo.categoryId} onChange={e=>setNewVideo({...newVideo,categoryId:e.target.value})} style={{...inputStyle,flex:1}}>
<option value="">\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc (\u062e\u0648\u062f\u06a9\u0627\u0631)</option>
{categories.map((cat)=><option key={cat.id} value={cat.id}>{cat.name}</option>)}
</select>
<button onClick={saveVideo} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingVideo?'\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{editingVideo&&<button onClick={()=>{setEditingVideo(null);setNewVideo({title:'',slug:'',description:'',url:'',thumbnail:'',duration:0,status:'DRAFT',categoryId:''})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
{videos.map((video)=><div key={video.id} className="glass-card" style={{padding:14,display:'flex',flexDirection:'column',gap:10}}>
{video.thumbnail?<img src={video.thumbnail} alt={video.title} style={{width:'100%',height:140,objectFit:'cover',borderRadius:8}}/>:<div style={{width:'100%',height:140,background:'rgba(198,169,98,.06)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>\ud83c\udfa5</div>}
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{video.title}</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',flex:1}}>{video.description?.substring(0,80)||'\u0628\u062f\u0648\u0646 \u062a\u0648\u0636\u06cc\u062d'}</div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{display:'flex',gap:6,alignItems:'center'}}>
<span className={statusBadgeClass(video.status)} style={{fontSize:'0.7rem'}}>{statusLabel(video.status)}</span>
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{fmtDur(video.duration||undefined)}</span>
</div>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{setEditingVideo(video);setNewVideo({title:video.title,slug:video.slug,description:video.description||'',url:video.url,thumbnail:video.thumbnail||'',duration:video.duration||0,status:video.status,categoryId:video.categoryId||''})}} style={editButtonStyle}>\u270f\ufe0f</button>
<button onClick={()=>deleteVideo(video.id)} style={{...editButtonStyle,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{videos.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0648\u06cc\u062f\u06cc\u0648\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0648\u06cc\u062f\u06cc\u0648 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function ArticlesManager({articles,editingArticle,setEditingArticle,newArticle,setNewArticle,categories,showToast,reload,inputStyle,textareaStyle,editButtonStyle}:{
  articles: Article[];
  editingArticle: Article | null;
  setEditingArticle: (a: Article | null) => void;
  newArticle: { title: string; slug: string; excerpt: string; content: string; featuredImage: string; status: ContentStatus; categoryId: string };
  setNewArticle: (a: { title: string; slug: string; excerpt: string; content: string; featuredImage: string; status: ContentStatus; categoryId: string }) => void;
  categories: Category[];
  showToast: (m: string) => void;
  reload: () => void;
  inputStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
  editButtonStyle: React.CSSProperties;
}){
const saveArticle=async()=>{if(!newArticle.title.trim()||!newArticle.content.trim()){showToast('\u0639\u0646\u0648\u0627\u0646 \u0648 \u0645\u062a\u0646 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(editingArticle){await adminApi.updateArticle(editingArticle.id,{title:newArticle.title,excerpt:newArticle.excerpt,content:newArticle.content,featuredImage:newArticle.featuredImage,status:newArticle.status,categoryId:newArticle.categoryId||undefined});showToast('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createArticle({title:newArticle.title,slug:newArticle.slug,excerpt:newArticle.excerpt,content:newArticle.content,featuredImage:newArticle.featuredImage,status:newArticle.status,categoryId:newArticle.categoryId||undefined});showToast('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}setEditingArticle(null);setNewArticle({title:'',slug:'',excerpt:'',content:'',featuredImage:'',status:'DRAFT',categoryId:''});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteArticle=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteArticle(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const statusBadgeClass=(s:string)=>{const m:Record<string,string>={DRAFT:'badge-warning',REVIEW:'badge-gold',PUBLISHED:'badge-success',ARCHIVED:'badge-error'};return m[s]||'badge-warning'};
const statusLabel=(s:string)=>{const m:Record<string,string>={DRAFT:'\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633',REVIEW:'\u0628\u0631\u0631\u0633\u06cc',PUBLISHED:'\u0645\u0646\u062a\u0634\u0631',ARCHIVED:'\u0622\u0631\u0634\u06cc\u0648'};return m[s]||s};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83d\udcdd \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u0642\u0627\u0644\u0627\u062a ({articles.length})</h3>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>{editingArticle?'}\u270f\ufe0f \u0648\u06cc\u0631\u0627\u06cc\u0634 \u0645\u0642\u0627\u0644\u0647':'\u2795 \u0645\u0642\u0627\u0644\u0647 \u062c\u062f\u06cc\u062f'}</h4>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input value={newArticle.title} onChange={e=>setNewArticle({...newArticle,title:e.target.value})} style={inputStyle} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0645\u0642\u0627\u0644\u0647"/>
<input value={newArticle.slug} onChange={e=>setNewArticle({...newArticle,slug:e.target.value})} style={inputStyle} placeholder="\u0646\u0634\u0627\u0646 \u0627\u06cc\u0646\u062a\u0631\u0646\u062a\u06cc (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc \u2014 \u062e\u0648\u062f\u06a9\u0627\u0631 \u0633\u0627\u062e\u062a\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f)"/>
<input value={newArticle.excerpt} onChange={e=>setNewArticle({...newArticle,excerpt:e.target.value})} style={inputStyle} placeholder="\u062e\u0644\u0627\u0635\u0647 \u06a9\u0648\u062a\u0627\u0647"/>
<textarea value={newArticle.content} onChange={e=>setNewArticle({...newArticle,content:e.target.value})} style={{...textareaStyle,minHeight:200}} placeholder="\u0645\u062a\u0646 \u06a9\u0627\u0645\u0644 \u0645\u0642\u0627\u0644\u0647"/>
<input value={newArticle.featuredImage} onChange={e=>setNewArticle({...newArticle,featuredImage:e.target.value})} style={inputStyle} placeholder="\u0622\u062f\u0631\u0633 \u062a\u0635\u0648\u06cc\u0631 \u0634\u0627\u062e\u0635 (URL)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<select value={newArticle.status} onChange={e=>setNewArticle({...newArticle,status:e.target.value as ContentStatus})} style={{...inputStyle,flex:1}}>
<option value="DRAFT">\u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633</option><option value="REVIEW">\u0628\u0631\u0631\u0633\u06cc</option><option value="PUBLISHED">\u0645\u0646\u062a\u0634\u0631</option><option value="ARCHIVED">\u0622\u0631\u0634\u06cc\u0648</option>
</select>
<select value={newArticle.categoryId} onChange={e=>setNewArticle({...newArticle,categoryId:e.target.value})} style={{...inputStyle,flex:1}}>
<option value="">\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc (\u062e\u0648\u062f\u06a9\u0627\u0631)</option>
{categories.map((cat)=><option key={cat.id} value={cat.id}>{cat.name}</option>)}
</select>
<button onClick={saveArticle} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingArticle?'}\ud83d\udcbe \u0630\u062e\u06cc\u0631\u0647 \u0648\u06cc\u0631\u0627\u06cc\u0634':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646'}</button>
{editingArticle&&<button onClick={()=>{setEditingArticle(null);setNewArticle({title:'',slug:'',excerpt:'',content:'',featuredImage:'',status:'DRAFT',categoryId:''})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{articles.map((article)=><div key={article.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{article.title}</div>
<div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}} dir="ltr">/{article.slug}</div>
{article.excerpt&&<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:4}}>{article.excerpt.substring(0,120)}</div>}
<div style={{display:'flex',gap:6,marginTop:6,alignItems:'center',flexWrap:'wrap'}}>
<span className={statusBadgeClass(article.status)} style={{fontSize:'0.7rem'}}>{statusLabel(article.status)}</span>
{article.category&&<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{article.category.name}</span>}
<span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<button onClick={()=>{setEditingArticle(article);setNewArticle({title:article.title,slug:article.slug,excerpt:article.excerpt||'',content:article.content,featuredImage:article.featuredImage||'',status:article.status,categoryId:article.categoryId||''})}} style={editButtonStyle}>\u270f\ufe0f</button>
<button onClick={()=>deleteArticle(article.id)} style={{...editButtonStyle,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>)}
{articles.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0645\u0642\u0627\u0644\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0645\u0642\u0627\u0644\u0647 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>}

function ChatbotManager({questions,results,editingQuestion,setEditingQuestion,newQuestion,setNewQuestion,editingOption,setEditingOption,newOption,setNewOption,newResult,setNewResult,editingResult,setEditingResult,showToast,reload,inputStyle,editButtonStyle,labelStyle,textareaStyle}:{
  questions: TaxQuestion[];
  results: TaxAssistantResultAdmin[];
  editingQuestion: TaxQuestion | null;
  setEditingQuestion: (q: TaxQuestion | null) => void;
  newQuestion: { question: string; description: string; sortOrder: number; isActive: boolean };
  setNewQuestion: (q: { question: string; description: string; sortOrder: number; isActive: boolean }) => void;
  editingOption: TaxQuestionOption | null;
  setEditingOption: (o: TaxQuestionOption | null) => void;
  newOption: { questionId: string; label: string; value: string; sortOrder: number };
  setNewOption: (o: { questionId: string; label: string; value: string; sortOrder: number }) => void;
  newResult: { name: string; title: string; description: string; action: string; severity: TaxResultSeverity; isActive: boolean };
  setNewResult: (r: { name: string; title: string; description: string; action: string; severity: TaxResultSeverity; isActive: boolean }) => void;
  editingResult: TaxAssistantResultAdmin | null;
  setEditingResult: (r: TaxAssistantResultAdmin | null) => void;
  showToast: (m: string) => void;
  reload: () => void;
  inputStyle: React.CSSProperties;
  editButtonStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  textareaStyle: React.CSSProperties;
}){
const saveQuestion=async()=>{if(!newQuestion.question.trim()){showToast('\u0633\u0648\u0627\u0644 \u062e\u0627\u0644\u06cc \u0627\u0633\u062a');return}try{if(editingQuestion){await adminApi.updateTaxQuestion(editingQuestion.id,{question:newQuestion.question,description:newQuestion.description,sortOrder:newQuestion.sortOrder,isActive:newQuestion.isActive});showToast('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createTaxQuestion({question:newQuestion.question,description:newQuestion.description,sortOrder:newQuestion.sortOrder,isActive:newQuestion.isActive});showToast('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}setEditingQuestion(null);setNewQuestion({question:'',description:'',sortOrder:0,isActive:true});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteQuestion=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteTaxQuestion(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const saveOption=async()=>{if(!newOption.label.trim()||!newOption.questionId){showToast('\u06af\u0632\u06cc\u0646\u0647 \u0648 \u0633\u0648\u0627\u0644 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{await adminApi.createTaxQuestionOption({questionId:newOption.questionId,label:newOption.label,value:newOption.value||newOption.label,sortOrder:newOption.sortOrder});showToast('\u06af\u0632\u06cc\u0646\u0647 \u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705');setNewOption({questionId:'',label:'',value:'',sortOrder:0});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteOption=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteTaxQuestionOption(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const saveResult=async()=>{if(!newResult.name.trim()||!newResult.title.trim()){showToast('\u0646\u0627\u0645 \u0648 \u0639\u0646\u0648\u0627\u0646 \u0631\u0627 \u067e\u0631 \u06a9\u0646\u06cc\u062f');return}try{if(editingResult){await adminApi.updateTaxAssistantResult(editingResult.id,{name:newResult.name,title:newResult.title,description:newResult.description,action:newResult.action,severity:newResult.severity,isActive:newResult.isActive});showToast('\u0648\u06cc\u0631\u0627\u06cc\u0634 \u0634\u062f \u2705')}else{await adminApi.createTaxAssistantResult({name:newResult.name,title:newResult.title,description:newResult.description,action:newResult.action,severity:newResult.severity,isActive:newResult.isActive});showToast('\u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f \u2705')}setEditingResult(null);setNewResult({name:'',title:'',description:'',action:'',severity:'INFO',isActive:true});reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const deleteResult=async(id:string)=>{if(!confirm('\u062d\u0630\u0641 \u0634\u0648\u062f\u061f'))return;try{await adminApi.deleteTaxAssistantResult(id);showToast('\u062d\u0630\u0641 \u0634\u062f \u2705');reload()}catch{showToast('\u062e\u0637\u0627 \u274c')}};
const severityBadgeClass=(s:string)=>{const m:Record<string,string>={INFO:'badge-success',WARNING:'badge-warning',CRITICAL:'badge-error',NEEDS_REVIEW:'badge-gold'};return m[s]||'badge-success'};
const severityLabel=(s:string)=>{const m:Record<string,string>={INFO:'\u0627\u0637\u0644\u0627\u0639',WARNING:'\u0647\u0634\u062f\u0627\u0631',CRITICAL:'\u062d\u06cc\u0627\u062a\u06cc',NEEDS_REVIEW:'\u0646\u06cc\u0627\u0632 \u0628\u0647 \u0628\u0631\u0631\u0633\u06cc'};return m[s]||s};
return<div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:920}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3 style={{fontWeight:700,fontSize:'1.125rem'}}>\ud83e\udd16 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0686\u062a\u200c\u0628\u0627\u062a \u2014 \u0633\u0624\u0627\u0644\u0627\u062a \u0648 \u062c\u0648\u0627\u0628\u200c\u0647\u0627</h3></div>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>\ud83d\udccb \u0633\u0624\u0627\u0644\u0627\u062a ({questions.length})</h4>
<div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
<input value={newQuestion.question} onChange={e=>setNewQuestion({...newQuestion,question:e.target.value})} style={inputStyle} placeholder="\u0645\u062a\u0646 \u0633\u0624\u0627\u0644"/>
<textarea value={newQuestion.description} onChange={e=>setNewQuestion({...newQuestion,description:e.target.value})} style={textareaStyle} placeholder="\u062a\u0648\u0636\u06cc\u062d (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<input type="number" value={newQuestion.sortOrder} onChange={e=>setNewQuestion({...newQuestion,sortOrder:+e.target.value})} style={{...inputStyle,width:100}} placeholder="\u062a\u0631\u062a\u06cc\u0628"/>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={newQuestion.isActive} onChange={e=>setNewQuestion({...newQuestion,isActive:e.target.checked})}/> \u0641\u0639\u0627\u0644</label>
<button onClick={saveQuestion} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingQuestion?'\ud83d\udcbe \u0648\u06cc\u0631\u0627\u06cc\u0634':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0624\u0627\u0644'}</button>
{editingQuestion&&<button onClick={()=>{setEditingQuestion(null);setNewQuestion({question:'',description:'',sortOrder:0,isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{questions.map((question)=><div key={question.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{question.sortOrder+1}. {question.question}</div>
{question.description&&<div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:4}}>{question.description}</div>}
<div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
{question.options?.map((option)=><span key={option.id} style={{fontSize:'0.75rem',background:'rgba(198,169,98,.1)',border:'1px solid var(--border-subtle)',borderRadius:6,padding:'3px 8px',color:'var(--brand-gold)'}}>{option.label} <button onClick={()=>deleteOption(option.id)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:'0.75rem',padding:0,marginRight:4}}>\u2715</button></span>)}
</div>
</div>
<div style={{display:'flex',gap:6,flexShrink:0}}>
<span className={question.isActive?'badge badge-success':'badge badge-error'} style={{fontSize:'0.7rem'}}>{question.isActive?'\u0641\u0639\u0627\u0644':'\u063a\u06cc\u0631\u0641\u0639\u0627\u0644'}</span>
<button onClick={()=>{setEditingQuestion(question);setNewQuestion({question:question.question,description:question.description||'',sortOrder:question.sortOrder,isActive:question.isActive})}} style={editButtonStyle}>\u270f\ufe0f</button>
<button onClick={()=>deleteQuestion(question.id)} style={{...editButtonStyle,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
<div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--border-subtle)'}}>
<div style={{display:'flex',gap:6,alignItems:'center'}}>
<select value={newOption.questionId} onChange={e=>setNewOption({...newOption,questionId:e.target.value})} style={{...inputStyle,flex:1,fontSize:'0.8125rem',padding:'6px 10px'}}>
<option value="">\u0627\u0646\u062a\u062e\u0627\u0628 \u0633\u0624\u0627\u0644...</option>
{questions.map((q)=><option key={q.id} value={q.id}>{q.question.substring(0,40)}</option>)}
</select>
<input value={newOption.label} onChange={e=>setNewOption({...newOption,label:e.target.value})} style={{...inputStyle,flex:1,fontSize:'0.8125rem',padding:'6px 10px'}} placeholder="\u0645\u062a\u0646 \u06af\u0632\u06cc\u0646\u0647"/>
<input type="number" value={newOption.sortOrder} onChange={e=>setNewOption({...newOption,sortOrder:+e.target.value})} style={{...inputStyle,width:60,fontSize:'0.8125rem',padding:'6px 10px'}} placeholder="\u062a\u0631\u062a\u06cc\u0628"/>
<button onClick={saveOption} className="btn btn-primary" style={{fontSize:'0.75rem',padding:'6px 12px'}}>\u2795 \u06af\u0632\u06cc\u0646\u0647</button>
</div>
</div>
</div>)}
{questions.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0633\u0624\u0627\u0644\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f \u2014 \u0627\u0648\u0644\u06cc\u0646 \u0633\u0624\u0627\u0644 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f</div>}
</div>
</div>
<div className="card" style={{padding:20}}>
<h4 style={{fontWeight:700,marginBottom:14}}>\ud83c\udfc1 \u0646\u062a\u0627\u06cc\u062c \u0645\u0634\u0627\u0648\u0631\u0647 ({results.length})</h4>
<div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
<input value={newResult.name} onChange={e=>setNewResult({...newResult,name:e.target.value})} style={inputStyle} placeholder="\u0646\u0627\u0645 (\u0627\u0646\u06af\u0644\u06cc\u0633\u06cc\u060c \u06cc\u06a9\u062a\u0627)"/>
<input value={newResult.title} onChange={e=>setNewResult({...newResult,title:e.target.value})} style={inputStyle} placeholder="\u0639\u0646\u0648\u0627\u0646 \u0646\u0645\u0627\u06cc\u0634\u06cc"/>
<textarea value={newResult.description} onChange={e=>setNewResult({...newResult,description:e.target.value})} style={textareaStyle} placeholder="\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u0646\u062a\u06cc\u062c\u0647"/>
<input value={newResult.action} onChange={e=>setNewResult({...newResult,action:e.target.value})} style={inputStyle} placeholder="\u0627\u0642\u062f\u0627\u0645 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f\u06cc (\u0627\u062e\u062a\u06cc\u0627\u0631\u06cc)"/>
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<select value={newResult.severity} onChange={e=>setNewResult({...newResult,severity:e.target.value as TaxResultSeverity})} style={{...inputStyle,flex:1}}>
<option value="INFO">\u0627\u0637\u0644\u0627\u0639</option><option value="WARNING">\u0647\u0634\u062f\u0627\u0631</option><option value="CRITICAL">\u062d\u06cc\u0627\u062a\u06cc</option><option value="NEEDS_REVIEW">\u0646\u06cc\u0627\u0632 \u0628\u0647 \u0628\u0631\u0631\u0633\u06cc</option>
</select>
<label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',color:'var(--text-muted)'}}><input type="checkbox" checked={newResult.isActive} onChange={e=>setNewResult({...newResult,isActive:e.target.checked})}/> \u0641\u0639\u0627\u0644</label>
<button onClick={saveResult} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>{editingResult?'\ud83d\udcbe \u0648\u06cc\u0631\u0627\u06cc\u0634':'\u2795 \u0627\u0641\u0632\u0648\u062f\u0646 \u0646\u062a\u06cc\u062c\u0647'}</button>
{editingResult&&<button onClick={()=>{setEditingResult(null);setNewResult({name:'',title:'',description:'',action:'',severity:'INFO',isActive:true})}} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>\u0627\u0646\u0635\u0631\u0627\u0641</button>}
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{results.map((result)=><div key={result.id} className="glass-card" style={{padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:'0.9375rem'}}>{result.title}</div>
<div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2}}>{result.name}</div>
<div style={{fontSize:'0.8125rem',color:'var(--text-secondary)',marginTop:6,lineHeight:1.6}}>{result.description?.substring(0,150)}{(result.description?.length||0)>150?'...':''}</div>
{result.action&&<div style={{fontSize:'0.8125rem',color:'var(--brand-gold)',marginTop:6}}>\u2192 {result.action}</div>}
</div>
<div style={{display:'flex',gap:8,flexShrink:0,flexDirection:'column',alignItems:'flex-end'}}>
<span className={severityBadgeClass(result.severity)} style={{fontSize:'0.7rem'}}>{severityLabel(result.severity)}</span>
<div style={{display:'flex',gap:6}}>
<button onClick={()=>{setEditingResult(result);setNewResult({name:result.name,title:result.title,description:result.description,action:result.action||'',severity:result.severity,isActive:result.isActive})}} style={editButtonStyle}>\u270f\ufe0f</button>
<button onClick={()=>deleteResult(result.id)} style={{...editButtonStyle,color:'#ef4444'}}>\ud83d\uddd1</button>
</div>
</div>
</div>
</div>)}
{results.length===0&&<div style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f</div>}
</div>
</div>
</div>}


const centerStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--brand-black)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const blockStyle: React.CSSProperties = { ...centerStyle, display: 'block' };
const spinnerStyle: React.CSSProperties = { width: 44, height: 44, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' };
const headerStyle: React.CSSProperties = { borderBottom: '1px solid var(--border-subtle)', background: 'var(--brand-black-soft)', padding: '0 20px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' };
const headerInnerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 };
const headerLinkStyle: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '0.8125rem' };
const tabBarStyle: React.CSSProperties = { display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' };
const tabActiveStyle: React.CSSProperties = { padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, border: 'none', background: 'none', color: 'var(--brand-gold)', borderBottom: '2px solid var(--brand-gold)', cursor: 'pointer', fontFamily: 'Vazirmatn', whiteSpace: 'nowrap' };
const tabInactiveStyle: React.CSSProperties = { ...tabActiveStyle, color: 'var(--text-muted)', borderBottom: '2px solid transparent' };
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1.5px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'Vazirmatn', fontSize: '0.9375rem', outline: 'none' };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 80 };
const editButtonStyle: React.CSSProperties = { background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--brand-gold)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: '0.8125rem' };
const previewStyle: React.CSSProperties = { padding: 14, background: 'rgba(198,169,98,.04)', borderRadius: 8, border: '1px solid var(--border-subtle)' };
const labelStyle: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const tableRowStyle = { borderBottom: '1px solid var(--border-subtle)' };
const tableHeadStyle: React.CSSProperties = { textAlign: 'right', padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 };
const tableDataStyle: React.CSSProperties = { padding: '10px 16px', fontSize: '0.875rem' };
const paginationStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)' };
const paginationButtonsStyle: React.CSSProperties = { display: 'flex', gap: 6 };
