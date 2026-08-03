'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import type { DashboardStats, RecentActivity, UserRow, AuditLog, PaginatedResponse } from '@/types';

type TabType = 'dashboard' | 'users' | 'audit';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [users, setUsers] = useState<PaginatedResponse<UserRow> | null>(null);
  const [auditLogs, setAuditLogs] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [s, a] = await Promise.all([adminApi.getDashboardStats(), adminApi.getRecentActivity(5)]);
      setStats(s.data); setActivity(a.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const loadUsers = async (page = 1) => {
    setIsLoading(true);
    try { const r = await adminApi.getUsers(page, 15, searchTerm); setUsers(r.data); setUserPage(page); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const loadAuditLogs = async (page = 1) => {
    setIsLoading(true);
    try { const r = await adminApi.getAuditLogs({ page, limit: 15 }); setAuditLogs(r.data); setAuditPage(page); } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'داشبورد', icon: '📊' },
    { id: 'users' as TabType, label: 'کاربران', icon: '👥' },
    { id: 'audit' as TabType, label: 'گزارش‌ها', icon: '📋' },
  ];

  if (isLoading && !stats && !users && !auditLogs) return (<div className="min-h-screen bg-black flex items-center justify-center" dir="rtl"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" /></div>);

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4"><div className="flex items-center justify-between h-16"><div className="flex items-center gap-4"><Link href="/" className="text-gold-400 font-bold text-lg">آیان تراز</Link><span className="text-gray-600">|</span><h1 className="text-white font-semibold">پنل مدیریت</h1></div><Link href="/" className="text-gray-400 hover:text-white text-sm">خروج</Link></div></div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {tabs.map((t) => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === t.id ? 'border-gold-500 text-gold-400' : 'border-transparent text-gray-400 hover:text-white'}`}>{t.icon} {t.label}</button>))}
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'کل کاربران', v: stats.totalUsers, c: 'border-blue-500', b: 'bg-blue-500/10' },
                { l: 'مقالات', v: stats.totalArticles, c: 'border-green-500', b: 'bg-green-500/10' },
                { l: 'قوانین مالیاتی', v: stats.totalTaxRules, c: 'border-gold-500', b: 'bg-gold-500/10' },
                { l: 'رزروها', v: stats.totalBookings, c: 'border-purple-500', b: 'bg-purple-500/10' },
                { l: 'در انتظار تأیید', v: stats.pendingBookings, c: 'border-yellow-500', b: 'bg-yellow-500/10' },
                { l: 'تأیید شده', v: stats.confirmedBookings, c: 'border-green-500', b: 'bg-green-500/10' },
                { l: 'سوالات چت‌بات', v: stats.totalQuestions, c: 'border-cyan-500', b: 'bg-cyan-500/10' },
                { l: 'نتایج چت‌بات', v: stats.totalResults, c: 'border-pink-500', b: 'bg-pink-500/10' },
              ].map((card, i) => (<div key={i} className={`${card.b} border ${card.c} rounded-xl p-4`}><p className="text-gray-400 text-sm">{card.l}</p><p className="text-2xl font-bold text-white mt-1">{card.v ?? '-'}</p></div>))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800"><h3 className="text-lg font-semibold text-white mb-4">کاربران جدید</h3><div className="space-y-3">{activity?.recentUsers?.map((u: any) => (<div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"><div><p className="text-white text-sm">{u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'بدون نام'}</p><p className="text-gray-500 text-xs">{u.phone}</p></div><span className="text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('fa-IR')}</span></div>))}</div></div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800"><h3 className="text-lg font-semibold text-white mb-4">رزروهای اخیر</h3><div className="space-y-3">{activity?.recentBookings?.map((b: any) => (<div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"><div><p className="text-white text-sm">{b.service?.name || 'مشاوره'}</p><p className="text-gray-500 text-xs">{b.user?.firstName} {b.user?.lastName} - {b.phone}</p></div><span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : b.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>{b.status === 'CONFIRMED' ? 'تأیید شده' : b.status === 'PENDING' ? 'در انتظار' : b.status}</span></div>))}</div></div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex gap-3 mb-4"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadUsers(1)} placeholder="جستجوی کاربر..." className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500" dir="rtl" /><button onClick={() => loadUsers(1)} className="btn-primary px-4 py-2 rounded-lg">جستجو</button></div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-800">{['نام','شماره','نقش','وضعیت','تأیید','تاریخ'].map(h=>(<th key={h} className="text-right text-gray-400 text-xs font-medium px-4 py-3">{h}</th>))}</tr></thead><tbody>{users?.data?.map(u=>(<tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30"><td className="px-4 py-3 text-white text-sm">{u.firstName || u.lastName ? `${u.firstName||''} ${u.lastName||''}` : '---'}</td><td className="px-4 py-3 text-gray-400 text-sm" dir="ltr">{u.phone}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role==='SUPER_ADMIN'?'bg-red-500/20 text-red-400':u.role==='ADMIN'?'bg-gold-500/20 text-gold-400':'bg-gray-500/20 text-gray-400'}`}>{u.role==='SUPER_ADMIN'?'سوپرادمین':u.role==='ADMIN'?'ادمین':'کاربر'}</span></td><td className="px-4 py-3"><span className={`text-xs ${u.isActive?'text-green-400':'text-red-400'}`}>{u.isActive?'فعال':'غیرفعال'}</span></td><td className="px-4 py-3"><span>{u.phoneVerified?'✅':'⏳'}</span></td><td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('fa-IR')}</td></tr>))}</tbody></table></div>{users && users.total > 15 && (<div className="flex items-center justify-between px-4 py-3 border-t border-gray-800"><p className="text-gray-500 text-xs">نمایش {((userPage-1)*15)+1} تا {Math.min(userPage*15,users.total)} از {users.total}</p><div className="flex gap-2"><button onClick={()=>loadUsers(userPage-1)} disabled={userPage<=1} className="px-3 py-1 text-sm rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50">قبلی</button><button onClick={()=>loadUsers(userPage+1)} disabled={userPage*15>=users.total} className="px-3 py-1 text-sm rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50">بعدی</button></div></div>)}</div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-800">{['کاربر','عملیات','نوع','شناسه','تاریخ'].map(h=>(<th key={h} className="text-right text-gray-400 text-xs font-medium px-4 py-3">{h}</th>))}</tr></thead><tbody>{auditLogs?.data?.map(log=>(<tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30"><td className="px-4 py-3 text-white text-sm">{log.user?.firstName} {log.user?.lastName}</td><td className="px-4 py-3"><span className="text-xs text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">{log.action}</span></td><td className="px-4 py-3 text-gray-400 text-sm">{log.entityType}</td><td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.entityId.substring(0,8)}...</td><td className="px-4 py-3 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString('fa-IR')}</td></tr>))}</tbody></table></div>{auditLogs && auditLogs.total > 15 && (<div className="flex items-center justify-between px-4 py-3 border-t border-gray-800"><p className="text-gray-500 text-xs">نمایش {((auditPage-1)*15)+1} تا {Math.min(auditPage*15,auditLogs.total)} از {auditLogs.total}</p><div className="flex gap-2"><button onClick={()=>loadAuditLogs(auditPage-1)} disabled={auditPage<=1} className="px-3 py-1 text-sm rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50">قبلی</button><button onClick={()=>loadAuditLogs(auditPage+1)} disabled={auditPage*15>=auditLogs.total} className="px-3 py-1 text-sm rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50">بعدی</button></div></div>)}</div>
        )}
      </div>
    </div>
  );
}
