'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

type CalcKey = 'salary' | 'business' | 'vat' | 'rental';

const TABS: { key: CalcKey; label: string; icon: string }[] = [
  { key: 'salary', label: 'مالیات حقوق', icon: '💼' },
  { key: 'business', label: 'مالیات مشاغل', icon: '🏪' },
  { key: 'vat', label: 'مالیات ارزش افزوده', icon: '🧾' },
  { key: 'rental', label: 'مالیات اجاره', icon: '🏠' },
];

const fmt = (n: number) => {
  if (!isFinite(n) || isNaN(n)) return '۰';
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 0 });
};

// ── Salary tax (1405) ── annual exemption 480M Toman, progressive brackets
function calcSalary(monthly: number): { exempt: boolean; tax: number; net: number; annual: number; exemptAmt: number } {
  const annual = monthly * 12;
  const exemptAmt = 480_000_000; // 40M/month × 12
  if (annual <= exemptAmt) {
    return { exempt: true, tax: 0, net: annual, annual, exemptAmt };
  }
  // Progressive brackets (simplified 1405 scale, % of excess over exemption)
  const excess = annual - exemptAmt;
  let tax = 0;
  // Bracket 1: up to 50M excess → 10%
  // Bracket 2: 50M–130M → 15%
  // Bracket 3: 130M–250M → 20%
  // Bracket 4: 250M–450M → 25%
  // Bracket 5: above 450M → 30%
  const b = [
    { upto: 50_000_000, rate: 0.10 },
    { upto: 130_000_000, rate: 0.15 },
    { upto: 250_000_000, rate: 0.20 },
    { upto: 450_000_000, rate: 0.25 },
    { upto: Infinity, rate: 0.30 },
  ];
  let prev = 0;
  for (const br of b) {
    if (excess > prev) {
      const slice = Math.min(excess, br.upto) - prev;
      tax += slice * br.rate;
      prev = br.upto;
    } else break;
  }
  return { exempt: false, tax, net: annual - tax, annual, exemptAmt };
}

// ── Business tax (sole proprietor, simplified) ── 1405: exemption under threshold, progressive
function calcBusiness(annualIncome: number, expenses: number): { taxable: number; tax: number; net: number; exempt: boolean } {
  const profit = Math.max(0, annualIncome - expenses);
  const exemptAmt = 96_000_000; // simplified small-business exemption threshold
  if (profit <= exemptAmt) {
    return { taxable: profit, tax: 0, net: profit, exempt: true };
  }
  const taxable = profit;
  let tax = 0;
  const b = [
    { upto: 150_000_000, rate: 0.15 },
    { upto: 300_000_000, rate: 0.20 },
    { upto: 600_000_000, rate: 0.25 },
    { upto: Infinity, rate: 0.30 },
  ];
  let prev = 0;
  for (const br of b) {
    if (taxable > prev) {
      const slice = Math.min(taxable, br.upto) - prev;
      tax += slice * br.rate;
      prev = br.upto;
    } else break;
  }
  return { taxable, tax, net: profit - tax, exempt: false };
}

// ── VAT (1405): 12%
function calcVAT(amount: number, mode: 'add' | 'extract'): { vat: number; total: number; base: number } {
  const rate = 0.12;
  if (mode === 'add') {
    const vat = amount * rate;
    return { vat, total: amount + vat, base: amount };
  }
  // extract: amount is tax-inclusive
  const base = amount / (1 + rate);
  return { vat: amount - base, total: amount, base };
}

// ── Rental tax (1405): real-person landlord to real-person tenant exempt up to threshold
function calcRental(monthlyRent: number, landlordType: 'real' | 'corp', tenantType: 'real' | 'corp'): { annualRent: number; tax: number; exempt: boolean; rate: number } {
  const annualRent = monthlyRent * 12;
  // Real landlord → real tenant: exempt up to 150M annual (1405 simplified)
  if (landlordType === 'real' && tenantType === 'real') {
    const exemptAmt = 150_000_000;
    if (annualRent <= exemptAmt) return { annualRent, tax: 0, exempt: true, rate: 0 };
    const taxable = annualRent - exemptAmt;
    return { annualRent, tax: taxable * 0.15, exempt: false, rate: 0.15 };
  }
  // Real landlord → corporate tenant: 15% on full amount
  if (landlordType === 'real' && tenantType === 'corp') {
    return { annualRent, tax: annualRent * 0.15, exempt: false, rate: 0.15 };
  }
  // Corporate landlord: 25% (corporate income tax rate)
  return { annualRent, tax: annualRent * 0.25, exempt: false, rate: 0.25 };
}

function NumberField({ label, value, onChange, placeholder, suffix }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          className="input calc-input"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
          placeholder={placeholder || '۰'}
          style={{ width: '100%', textAlign: 'right', paddingLeft: suffix ? 64 : 16 }}
        />
        {suffix && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{suffix}</span>
        )}
      </div>
    </label>
  );
}

function ResultRow({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '0.9rem', color: muted ? 'var(--text-muted)' : 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: highlight ? '1.15rem' : '1rem', fontWeight: highlight ? 800 : 700, color: highlight ? 'var(--brand-gold)' : muted ? 'var(--text-muted)' : 'var(--text-primary)', fontFamily: 'Vazirmatn' }}>{value}</span>
    </div>
  );
}

export default function TaxCalculatorPage() {
  const [active, setActive] = useState<CalcKey>('salary');

  // salary
  const [salMonthly, setSalMonthly] = useState('');
  // business
  const [bizIncome, setBizIncome] = useState('');
  const [bizExpenses, setBizExpenses] = useState('');
  // vat
  const [vatAmount, setVatAmount] = useState('');
  const [vatMode, setVatMode] = useState<'add' | 'extract'>('add');
  // rental
  const [rentMonthly, setRentMonthly] = useState('');
  const [landlord, setLandlord] = useState<'real' | 'corp'>('real');
  const [tenant, setTenant] = useState<'real' | 'corp'>('real');

  const sal = useMemo(() => calcSalary(Number(salMonthly) || 0), [salMonthly]);
  const biz = useMemo(() => calcBusiness(Number(bizIncome) || 0, Number(bizExpenses) || 0), [bizIncome, bizExpenses]);
  const vat = useMemo(() => calcVAT(Number(vatAmount) || 0, vatMode), [vatAmount, vatMode]);
  const rent = useMemo(() => calcRental(Number(rentMonthly) || 0, landlord, tenant), [rentMonthly, landlord, tenant]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .calc-tab{transition:all .2s;cursor:pointer}
        .calc-tab:hover{border-color:var(--brand-gold)!important;color:var(--brand-gold)!important}
        .calc-input:focus{border-color:var(--brand-gold)!important;box-shadow:0 0 0 3px var(--brand-gold-glow)!important}
        .calc-radio{transition:all .2s;cursor:pointer}
        .calc-radio:hover{border-color:var(--brand-gold)!important}
      `}</style>

      {/* Header */}
      <PageHeader title="ماشین حساب مالیاتی" backLabel="بازگشت" />

      {/* Hero */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 24, textAlign: 'center' }}>
        <span className="badge badge-gold" style={{ marginBottom: 16 }}>۱۴۰۵</span>
        <h1 className="section-title gradient-text" style={{ fontSize: '2.2rem', marginBottom: 12 }}>
          ماشین حساب مالیاتی ایران
        </h1>
        <p className="section-subtitle" style={{ maxWidth: 600, margin: '0 auto' }}>
          محاسبه آنلاین مالیات حقوق، مشاغل، ارزش افزوده و اجاره املاک بر اساس قوانین مالیاتی ۱۴۰۵ — سریع، دقیق و رایگان
        </p>
      </div>

      {/* Tabs */}
      <div className="container" style={{ paddingBottom: 24 }}>
        <div className="calc-tabs" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="calc-tab"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 'var(--radius-md)',
                fontFamily: 'Vazirmatn', fontSize: '0.9rem', fontWeight: active === t.key ? 700 : 500, cursor: 'pointer',
                background: active === t.key ? 'rgba(198,169,98,.1)' : 'transparent',
                border: `1px solid ${active === t.key ? 'var(--brand-gold)' : 'var(--border-subtle)'}`,
                color: active === t.key ? 'var(--brand-gold)' : 'var(--text-secondary)',
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator body */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }} className="calc-grid">
          {/* Input panel */}
          <div className="glass-card" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
            {active === 'salary' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>مالیات بر حقوق</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.7 }}>
                  سقف معافیت حقوق ۱۴۰۵: ۴۸۰ میلیون تومان سالانه (۴۰ میلیون ماهانه)
                </p>
                <NumberField label="حقوق ماهانه (تومان)" value={salMonthly} onChange={setSalMonthly} placeholder="۴۰,۰۰۰,۰۰۰" suffix="تومان" />
              </>
            )}

            {active === 'business' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>مالیات مشاغل (اشخاص حقیقی)</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.7 }}>
                  محاسبه مالیات بر سود مشاغل بر اساس پلکانی ۱۴۰۵
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <NumberField label="درآمد سالانه (تومان)" value={bizIncome} onChange={setBizIncome} placeholder="۳۰۰,۰۰۰,۰۰۰" suffix="تومان" />
                  <NumberField label="هزینه‌های قابل کسر (تومان)" value={bizExpenses} onChange={setBizExpenses} placeholder="۱۰۰,۰۰۰,۰۰۰" suffix="تومان" />
                </div>
              </>
            )}

            {active === 'vat' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>مالیات بر ارزش افزوده</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.7 }}>
                  نرخ VAT ۱۴۰۵: ۱۲٪ — محاسبه جداگانه یا استخراج از مبلغ کل
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {([['add', 'افزودن به مبلغ'], ['extract', 'استخراج از کل']] as const).map(([m, l]) => (
                    <button
                      key={m}
                      onClick={() => setVatMode(m)}
                      className="calc-radio"
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'Vazirmatn', fontSize: '0.85rem', fontWeight: vatMode === m ? 700 : 500, cursor: 'pointer',
                        background: vatMode === m ? 'rgba(198,169,98,.1)' : 'transparent',
                        border: `1px solid ${vatMode === m ? 'var(--brand-gold)' : 'var(--border-subtle)'}`,
                        color: vatMode === m ? 'var(--brand-gold)' : 'var(--text-secondary)',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <NumberField label={vatMode === 'add' ? 'مبلغ کالا/خدمت (تومان)' : 'مبلغ کل شامل مالیات (تومان)'} value={vatAmount} onChange={setVatAmount} placeholder="۱,۰۰۰,۰۰۰" suffix="تومان" />
              </>
            )}

            {active === 'rental' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>مالیات بر اجاره املاک</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.7 }}>
                  معافیت اجاره ملک شخصی به مستاجر شخصی تا سقف ۱۵۰ میلیون تومان سالانه
                </p>
                <NumberField label="اجاره ماهانه (تومان)" value={rentMonthly} onChange={setRentMonthly} placeholder="۲۰,۰۰۰,۰۰۰" suffix="تومان" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>نوع مالک</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {([['real', 'شخص حقیقی'], ['corp', 'شخص حقوقی']] as const).map(([v, l]) => (
                        <button key={v} onClick={() => setLandlord(v)} className="calc-radio" style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'Vazirmatn', fontSize: '0.85rem', fontWeight: landlord === v ? 700 : 500, cursor: 'pointer', background: landlord === v ? 'rgba(198,169,98,.1)' : 'transparent', border: `1px solid ${landlord === v ? 'var(--brand-gold)' : 'var(--border-subtle)'}`, color: landlord === v ? 'var(--brand-gold)' : 'var(--text-secondary)' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>نوع مستاجر</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {([['real', 'شخص حقیقی'], ['corp', 'شخص حقوقی']] as const).map(([v, l]) => (
                        <button key={v} onClick={() => setTenant(v)} className="calc-radio" style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'Vazirmatn', fontSize: '0.85rem', fontWeight: tenant === v ? 700 : 500, cursor: 'pointer', background: tenant === v ? 'rgba(198,169,98,.1)' : 'transparent', border: `1px solid ${tenant === v ? 'var(--brand-gold)' : 'var(--border-subtle)'}`, color: tenant === v ? 'var(--brand-gold)' : 'var(--text-secondary)' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Result panel */}
          <div className="glass-card" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 28, animation: 'fadeInUp .3s var(--ease-expo)' }}>
            {active === 'salary' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>نتیجه محاسبه حقوق</h2>
                <ResultRow label="حقوق سالانه" value={fmt(sal.annual) + ' ت'} />
                <ResultRow label="سقف معافیت" value={fmt(sal.exemptAmt) + ' ت'} muted />
                {sal.exempt ? (
                  <div style={{ marginTop: 20, padding: 18, borderRadius: 'var(--radius-md)', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)', textAlign: 'center' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>✓ معاف از مالیات حقوق</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 6 }}>حقوق شما زیر سقف معافیت ۱۴۰۵ است</p>
                  </div>
                ) : (
                  <>
                    <ResultRow label="مالیات سالانه" value={fmt(sal.tax) + ' ت'} highlight />
                    <ResultRow label="مالیات ماهانه" value={fmt(sal.tax / 12) + ' ت'} />
                    <ResultRow label="حقوق خالص سالانه" value={fmt(sal.net) + ' ت'} />
                  </>
                )}
              </>
            )}

            {active === 'business' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>نتیجه محاسبه مشاغل</h2>
                <ResultRow label="درآمد ناخالص" value={fmt(Number(bizIncome) || 0) + ' ت'} muted />
                <ResultRow label="هزینه‌های قابل کسر" value={fmt(Number(bizExpenses) || 0) + ' ت'} muted />
                <ResultRow label="سود مشمول مالیات" value={fmt(biz.taxable) + ' ت'} />
                {biz.exempt ? (
                  <div style={{ marginTop: 20, padding: 18, borderRadius: 'var(--radius-md)', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)', textAlign: 'center' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>✓ معاف از مالیات مشاغل</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 6 }}>سود شما زیر سقف معافیت است</p>
                  </div>
                ) : (
                  <>
                    <ResultRow label="مالیات قابل پرداخت" value={fmt(biz.tax) + ' ت'} highlight />
                    <ResultRow label="سود خالص پس از مالیات" value={fmt(biz.net) + ' ت'} />
                  </>
                )}
              </>
            )}

            {active === 'vat' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>نتیجه محاسبه ارزش افزوده</h2>
                <ResultRow label="مبلغ پایه (بدون مالیات)" value={fmt(vat.base) + ' ت'} muted />
                <ResultRow label="نرخ مالیات" value="۱۲٪" muted />
                <ResultRow label="مالیات بر ارزش افزوده" value={fmt(vat.vat) + ' ت'} highlight />
                <ResultRow label="مبلغ کل (با مالیات)" value={fmt(vat.total) + ' ت'} />
              </>
            )}

            {active === 'rental' && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>نتیجه محاسبه اجاره</h2>
                <ResultRow label="اجاره سالانه" value={fmt(rent.annualRent) + ' ت'} />
                <ResultRow label="نوع قرارداد" value={landlord === 'real' ? (tenant === 'real' ? 'شخصی → شخصی' : 'شخصی → حقوقی') : 'حقوقی'} muted />
                {rent.exempt ? (
                  <div style={{ marginTop: 20, padding: 18, borderRadius: 'var(--radius-md)', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)', textAlign: 'center' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>✓ معاف از مالیات اجاره</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 6 }}>اجاره زیر سقف معافیت ۱۵۰ میلیون تومان است</p>
                  </div>
                ) : (
                  <>
                    <ResultRow label="نرخ اعمال شده" value={rent.rate ? (rent.rate * 100).toLocaleString('fa-IR') + '٪' : '—'} muted />
                    <ResultRow label="مالات سالانه اجاره" value={fmt(rent.tax) + ' ت'} highlight />
                    <ResultRow label="مالات ماهانه" value={fmt(rent.tax / 12) + ' ت'} />
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/tax-laws" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '10px 16px' }}>📚 قوانین مالیاتی</Link>
              <Link href="/consultation" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 16px' }}>📅 مشاوره تخصصی</Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="container" style={{ marginTop: 32, maxWidth: 900 }}>
          <div style={{ background: 'rgba(198,169,98,.05)', border: '1px solid rgba(198,169,98,.2)', borderRadius: 'var(--radius-md)', padding: 18, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.8, textAlign: 'center' }}>
            ⚠️ این محاسبات بر اساس قوانین مالیاتی ۱۴۰۵ و به صورت تقریبی ارائه می‌شود. برای محاسبه دقیق و موارد خاص (معافیت‌های شغلی، کسورات اضافی، مالیات تکلیفی)، با کارشناسان مالیاتی آین تراز مشاوره نمایید.
          </div>
        </div>
      </div>
    </div>
  );
}
