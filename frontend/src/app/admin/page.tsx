'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import type { DashboardStats, RecentActivity, UserRow, AuditLog, PaginatedResponse } from '@/types';

type TabType = 'dashboard' | 'users' | 'content' | 'audit';

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

  // Editable content
  const [editableTexts, setEditableTexts] = useState<{[key:string]:string}>({
    hero_title: 'راهکارهای هوشمند مالیاتی',
    hero_subtitle: 'با آیان تراز، پیچیدگی‌های مالیاتی را به فرصت تبدیل کنید',
    about_text: 'آیان تراز از سال ۱۳۹۰ با تیمی از متخصصان مجرب، خدمات مشاوره مالیاتی و حسابداری را به اشخاص حقیقی و حقوقی ارائه می‌دهد.',
    contact_phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    contact_email: 'info@ayantaraz.ir',
    contact_address: 'تهران، ایران',
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => { if (activeTab === 'dashboard') loadDashboard(); else if (activeTab === 'users') loadUsers(); else if (activeTab === 'audit') loadAuditLogs(); }, [activeTab]);

  const loadDashboard = async () => { setIsLoading(true); try { const [s, a] = await Promise.all([adminApi.getDashboardStats(), adminApi.getRecentActivity(5)]); setStats(s.data); setActivity(a.data); } catch {} finally { setIsLoading(false); } };
  const loadUsers = async (page = 1) => { setIsLoading(true); try { const r = await adminApi.getUsers(page, 15, searchTerm); setUsers(r.data); setUserPage(page); } catch {} finally { setIsLoading(false); } };
  const loadAuditLogs = async (page = 1) => { setIsLoading(true); try { const r = await adminApi.getAuditLogs({ page, limit: 15 }); setAuditLogs(r.data); setAuditPage(page); } catch {} finally { setIsLoading(false); } };

  const saveText = (key: string) => {
    setEditableTexts(p=>({...p,[key]:editValue}));
    setEditingKey(null);
    setSaveMessage('ذخیره شد ✅');
    setTimeout(()=>setSaveMessage(''),2000);
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'داشبورد', icon: '📊' },
    { id: 'users' as TabType, label: 'کاربران', icon: '👥' },
    { id: 'content' as TabType, label: 'ویرایش محتوا', icon: '✏️' },
    { id: 'audit' as TabType, label: 'گزارش‌ها', icon: '📋' },
  ];

  const statCards = [
    { l: 'کاربران', v: stats?.totalUsers, c: '#3b82f6' },
    { l: 'قوانین مالیاتی', v: stats?.totalTaxRules, c: 'var(--brand-gold)' },
    { l: 'رزروها', v: stats?.totalBookings, c: '#a855f7' },
    { l: 'در انتظار', v: stats?.pendingBookings, c: '#eab308' },
    { l: 'تأیید شده', v: stats?.confirmedBookings, c: '#22c55e' },
    { l: 'سوالات چت‌بات', v: stats?.totalQuestions, c: '#06b6d4' },
  ];

  if (isLoading && !stats && !users && !auditLogs) return <div style={{minHeight:'100vh',background:'var(--brand-black)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:40,height:40,border:'3px solid var(--border-subtle)',borderTopColor:'var(--brand-gold)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;

  return (
    <div style={{minHeight:'100vh',background:'var(--brand-black)'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <header style={{borderBottom:'1px solid var(--border-subtle)',background:'var(--brand-black-soft)',padding:'0 20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:60}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Link href="/" style={{fontWeight:800,color:'var(--brand-gold)'}}>آیان تراز</Link>
            <span style={{color:'var(--border-default)'}}>|</span>
            <span style={{fontWeight:600,fontSize:'0.9375rem'}}>پنل مدیریت</span>
          </div>
          <Link href="/" style={{color:'var(--text-muted)',fontSize:'0.8125rem'}}>خروج</Link>
        </div>
      </header>

      <div className="container" style={{paddingTop:28,paddingBottom:60}}>
        {saveMessage && <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',padding:'10px 16px',borderRadius:8,marginBottom:16,fontSize:'0.875rem',color:'#22c55e'}}>{saveMessage}</div>}

        <div style={{display:'flex',gap:2,marginBottom:28,borderBottom:'1px solid var(--border-subtle)',overflowX:'auto'}}>
          {tabs.map(t=>(<button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:'12px 24px',fontSize:'0.875rem',fontWeight:600,border:'none',background:'none',color:activeTab===t.id?'var(--brand-gold)':'var(--text-muted)',borderBottom:activeTab===t.id?'2px solid var(--brand-gold)':'2px solid transparent',cursor:'pointer',fontFamily:'Vazirmatn',whiteSpace:'nowrap',transition:'all 150ms'}}>{t.icon} {t.label}</button>))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && stats && (
          <div style={{display:'flex',flexDirection:'column',gap:28}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:14}}>
              {statCards.map((c,i)=>(
                <div key={i} className="card" style={{borderLeft:`3px solid ${c.c}`}}>
                  <div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginBottom:8}}>{c.l}</div>
                  <div style={{fontSize:'1.75rem',fontWeight:800,color:c.c}}>{c.v??'-'}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20}}>
              <div className="card">
                <h3 style={{fontWeight:700,marginBottom:16}}>کاربران جدید</h3>
                {activity?.recentUsers?.map((u:any)=>(<div key={u.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border-subtle)'}}><div><div style={{fontWeight:600}}>{u.firstName||u.lastName?`${u.firstName||''} ${u.lastName||''}`:'بدون نام'}</div><div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}} dir="ltr">{u.phone}</div></div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString('fa-IR')}</div></div>))}
              </div>
              <div className="card">
                <h3 style={{fontWeight:700,marginBottom:16}}>رزروهای اخیر</h3>
                {activity?.recentBookings?.map((b:any)=>(<div key={b.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border-subtle)'}}><div><div style={{fontWeight:600}}>{b.service?.name||'مشاوره'}</div><div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>{b.user?.firstName} {b.user?.lastName}</div></div><span className={`badge ${b.status==='CONFIRMED'?'badge-success':b.status==='PENDING'?'badge-warning':'badge-error'}`}>{b.status==='CONFIRMED'?'تأیید':b.status==='PENDING'?'منتظر':b.status}</span></div>))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT EDITOR */}
        {activeTab === 'content' && (
          <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:700}}>
            <div style={{fontWeight:700,fontSize:'1.125rem',marginBottom:8}}>ویرایش متن‌های سایت</div>
            {Object.entries(editableTexts).map(([key,val])=>(
              <div key={key} className="card" style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'0.8125rem',color:'var(--text-muted)',fontWeight:600}}>{key.replace(/_/g,' ')}</span>
                  {editingKey!==key && <button onClick={()=>{setEditingKey(key);setEditValue(val)}} style={{background:'none',border:'1px solid var(--border-subtle)',color:'var(--brand-gold)',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontFamily:'Vazirmatn',fontSize:'0.8125rem'}}>✏️ ویرایش</button>}
                </div>
                {editingKey===key ? (
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {val.length>60?<textarea value={editValue} onChange={e=>setEditValue(e.target.value)} rows={3} style={{...inputStyles,resize:'vertical',minHeight:80}}/>:<input value={editValue} onChange={e=>setEditValue(e.target.value)} style={inputStyles} />}
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>saveText(key)} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>ذخیره</button>
                      <button onClick={()=>setEditingKey(null)} className="btn btn-ghost" style={{fontSize:'0.8125rem',padding:'8px 16px'}}>انصراف</button>
                    </div>
                  </div>
                ) : <div style={{padding:'10px 14px',background:'rgba(255,255,255,0.02)',borderRadius:8,fontSize:'0.9375rem',color:'var(--text-secondary)'}}>{val}</div>}
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadUsers(1)} placeholder="جستجوی کاربر..." style={{...inputStyles,flex:1}} />
              <button onClick={()=>loadUsers(1)} className="btn btn-primary" style={{fontSize:'0.8125rem',padding:'10px 18px'}}>جستجو</button>
            </div>
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid var(--border-subtle)'}}>{['نام','شماره','نقش','وضعیت','تأیید','تاریخ'].map(h=>(<th key={h} style={{textAlign:'right',padding:'12px 16px',fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>{h}</th>))}</tr></thead>
                  <tbody>{users?.data?.map(u=>(<tr key={u.id} style={{borderBottom:'1px solid var(--border-subtle)'}}><td style={{padding:'10px 16px',fontWeight:500}}>{u.firstName||u.lastName?`${u.firstName||''} ${u.lastName||''}`:'---'}</td><td style={{padding:'10px 16px',fontSize:'0.875rem',color:'var(--text-muted)'}} dir="ltr">{u.phone}</td><td style={{padding:'10px 16px'}}><span className={`badge ${u.role==='SUPER_ADMIN'?'badge-error':u.role==='ADMIN'?'badge-gold':'badge-success'}`}>{u.role==='SUPER_ADMIN'?'سوپرادمین':u.role==='ADMIN'?'ادمین':'کاربر'}</span></td><td style={{padding:'10px 16px',fontSize:'0.8125rem',color:u.isActive?'#22c55e':'#ef4444'}}>{u.isActive?'فعال':'غیرفعال'}</td><td style={{padding:'10px 16px'}}>{u.phoneVerified?'✅':'⏳'}</td><td style={{padding:'10px 16px',fontSize:'0.8125rem',color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString('fa-IR')}</td></tr>))}</tbody>
                </table>
              </div>
              {users && users.total > 15 && <div style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',fontSize:'0.8125rem',color:'var(--text-muted)'}}><span>صفحه {userPage} از {Math.ceil(users.total/15)}</span><div style={{display:'flex',gap:6}}><button onClick={()=>loadUsers(userPage-1)} disabled={userPage<=1} style={btnSmall}>قبلی</button><button onClick={()=>loadUsers(userPage+1)} disabled={userPage*15>=users.total} style={btnSmall}>بعدی</button></div></div>}
            </div>
          </div>
        )}

        {/* AUDIT */}
        {activeTab === 'audit' && (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid var(--border-subtle)'}}>{['کاربر','عملیات','نوع','تاریخ'].map(h=>(<th key={h} style={{textAlign:'right',padding:'12px 16px',fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>{h}</th>))}</tr></thead>
                <tbody>{auditLogs?.data?.map(log=>(<tr key={log.id} style={{borderBottom:'1px solid var(--border-subtle)'}}><td style={{padding:'10px 16px',fontWeight:500}}>{log.user?.firstName} {log.user?.lastName}</td><td style={{padding:'10px 16px'}}><span className="badge badge-gold">{log.action}</span></td><td style={{padding:'10px 16px',fontSize:'0.875rem',color:'var(--text-muted)'}}>{log.entityType}</td><td style={{padding:'10px 16px',fontSize:'0.8125rem',color:'var(--text-muted)'}}>{new Date(log.createdAt).toLocaleString('fa-IR')}</td></tr>))}</tbody>
              </table>
            </div>
            {auditLogs && auditLogs.total > 15 && <div style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',fontSize:'0.8125rem',color:'var(--text-muted)'}}><span>صفحه {auditPage} از {Math.ceil(auditLogs.total/15)}</span><div style={{display:'flex',gap:6}}><button onClick={()=>loadAuditLogs(auditPage-1)} disabled={auditPage<=1} style={btnSmall}>قبلی</button><button onClick={()=>loadAuditLogs(auditPage+1)} disabled={auditPage*15>=auditLogs.total} style={btnSmall}>بعدی</button></div></div>}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyles: React.CSSProperties = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,0.04)',border:'1.5px solid var(--border-subtle)',borderRadius:8,color:'var(--text-primary)',fontFamily:'Vazirmatn',fontSize:'0.9375rem',outline:'none'};
const btnSmall: React.CSSProperties = {padding:'6px 12px',background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:6,color:'var(--text-secondary)',cursor:'pointer',fontFamily:'Vazirmatn',fontSize:'0.8125rem'};
