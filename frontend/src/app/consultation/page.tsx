'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { consultationApi } from '@/lib/api';
import type { ConsultationService as Svc, ConsultationBooking } from '@/types';

type Step = 1 | 2 | 3 | 4 | 5;

function formatPrice(n: number | null | undefined): string {
  if (!n) return '—';
  return n.toLocaleString('fa-IR');
}

export default function ConsultationPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ name: '', phone: '', serviceId: '', date: '', time: '', notes: '' });
  const [services, setServices] = useState<Svc[]>([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [booking, setBooking] = useState<ConsultationBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Bank card info (placeholder — admin should update in settings)
  const bankInfo = {
    bankName: 'بانک ملت',
    cardNumber: '۶۱۰۴۳۴۷۰۱۲۳۴۵۶۷۸',
    shaba: 'IR۶۲ ۰۱۲۰۲۸۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۱',
    holder: 'شرکت آین تراز',
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await consultationApi.getServices();
        setServices(r.data);
      } catch (e) {
        // fallback to static list if API fails
        setServices([
          { id: 'tax-consult', name: 'مشاوره مالیاتی', slug: 'tax-consult', description: 'بررسی پرونده و برنامه‌ریزی مالیاتی', duration: 45, price: 500000, isActive: true, sortOrder: 1 },
          { id: 'tax-return', name: 'تنظیم اظهارنامه', slug: 'tax-return', description: 'اظهارنامه عملکرد و ارزش افزوده', duration: 30, price: 800000, isActive: true, sortOrder: 2 },
          { id: 'audit', name: 'حسابرسی مالی', slug: 'audit', description: 'بررسی اسناد و گزارش تحلیلی', duration: 60, price: 1500000, isActive: true, sortOrder: 3 },
          { id: 'bookkeeping', name: 'دفترداری', slug: 'bookkeeping', description: 'ثبت اسناد و صورتهای مالی', duration: 30, price: 600000, isActive: true, sortOrder: 4 },
        ]);
      } finally {
        setLoadingSvc(false);
      }
    })();
  }, []);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const canNext = (s: Step) => {
    if (s === 1) return form.name.length >= 2 && /^0?9\d{9}$/.test(form.phone.replace(/\s/g, ''));
    if (s === 2) return form.serviceId !== '';
    if (s === 3) return form.date !== '' && form.time !== '';
    return true;
  };

  const selectedService = services.find((s) => s.id === form.serviceId);

  const times = ['۰۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۳:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰'];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toLocaleDateString('fa-IR');
  });

  const handleBook = async () => {
    setSubmitting(true);
    setError('');
    try {
      const r = await consultationApi.book({
        serviceId: form.serviceId,
        date: form.date,
        time: form.time,
        phone: form.phone,
        name: form.name,
        notes: form.notes,
      });
      setBooking(r.data);
      setStep(4);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در ثبت رزرو. لطفاً دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setUploadDone(false);
    setError('');
  };

  const handleUpload = async () => {
    if (!receiptFile || !booking) return;
    setUploading(true);
    setError('');
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const r = await consultationApi.uploadReceipt(booking.id, base64, receiptFile.name);
          setBooking(r.data);
          setUploadDone(true);
          setStep(5);
        } catch (e: any) {
          setError(e?.response?.data?.message || 'خطا در بارگذاری رسید');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError('خطا در خواندن فایل');
        setUploading(false);
      };
      reader.readAsDataURL(receiptFile);
    } catch (e: any) {
      setError('خطا در بارگذاری رسید');
      setUploading(false);
    }
  };

  const steps = [
    { n: 1, label: 'اطلاعات' },
    { n: 2, label: 'خدمت' },
    { n: 3, label: 'زمان' },
    { n: 4, label: 'پرداخت' },
    { n: 5, label: 'تأیید' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      {/* Header */}
      <PageHeader title="رزرو مشاوره" backLabel="بازگشت" />

      <div style={{ padding: '32px 20px', maxWidth: 560, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ flex: 1, height: 3, borderRadius: 2, background: s.n <= step ? 'var(--brand-gold)' : 'var(--border-subtle)', transition: 'all 300ms' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 36, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ flex: 1, textAlign: 'center', fontWeight: s.n === step ? 700 : 400, color: s.n === step ? 'var(--brand-gold)' : 'var(--text-muted)' }}>{s.label}</div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, fontSize: '0.875rem', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {/* Step 1: User info */}
        {step === 1 && (
          <div style={{ animation: 'fadeInUp 300ms var(--ease-out-expo)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>اطلاعات شما</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>برای هماهنگی مشاوره، لطفاً اطلاعات زیر را وارد کنید</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>نام و نام خانوادگی</label>
                <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="مثال: علی محمدی" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>شماره تماس</label>
                <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" />
              </div>
              <button onClick={() => setStep(2)} disabled={!canNext(1)} className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>مرحله بعد ←</button>
            </div>
          </div>
        )}

        {/* Step 2: Service selection */}
        {step === 2 && (
          <div style={{ animation: 'fadeInUp 300ms var(--ease-out-expo)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>نوع خدمت</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>خدمت مورد نظر خود را انتخاب کنید</p>
            {loadingSvc ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>در حال بارگذاری خدمات...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {services.map((s) => (
                  <button key={s.id} onClick={() => update('serviceId', s.id)} className="card card-hover" style={{ textAlign: 'right', borderColor: form.serviceId === s.id ? 'var(--brand-gold)' : 'var(--border-subtle)', padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.description} · {s.duration} دقیقه</div>
                        {s.price != null && (
                          <div style={{ marginTop: 8, fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-gold)' }}>{formatPrice(s.price)} تومان</div>
                        )}
                      </div>
                      {form.serviceId === s.id && <span style={{ color: 'var(--brand-gold)', fontSize: '1.25rem' }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost">→ بازگشت</button>
              <button onClick={() => setStep(3)} disabled={!canNext(2)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>مرحله بعد ←</button>
            </div>
          </div>
        )}

        {/* Step 3: Date & time */}
        {step === 3 && (
          <div style={{ animation: 'fadeInUp 300ms var(--ease-out-expo)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>زمان مشاوره</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>روز و ساعت مناسب خود را انتخاب کنید</p>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.875rem' }}>روز</div>
              <div className="datetime-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 8 }}>
                {dates.map((d) => (
                  <button key={d} onClick={() => update('date', d)} style={{ padding: '10px', borderRadius: 8, border: `1.5px solid ${form.date === d ? 'var(--brand-gold)' : 'var(--border-subtle)'}`, background: form.date === d ? 'rgba(198,169,98,0.1)' : 'var(--surface-card)', color: form.date === d ? 'var(--brand-gold)' : 'var(--text-primary)', fontFamily: 'Vazirmatn', fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 150ms' }}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.875rem' }}>ساعت</div>
              <div className="datetime-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 8 }}>
                {times.map((t) => (
                  <button key={t} onClick={() => update('time', t)} style={{ padding: '10px', borderRadius: 8, border: `1.5px solid ${form.time === t ? 'var(--brand-gold)' : 'var(--border-subtle)'}`, background: form.time === t ? 'rgba(198,169,98,0.1)' : 'var(--surface-card)', color: form.time === t ? 'var(--brand-gold)' : 'var(--text-primary)', fontFamily: 'Vazirmatn', fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 150ms' }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>توضیحات (اختیاری)</label>
              <textarea className="input" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="توضیح مختصر در مورد نیازتان..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setStep(2)} className="btn btn-ghost">→ بازگشت</button>
              <button onClick={handleBook} disabled={!canNext(3) || submitting} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                {submitting ? 'در حال ثبت...' : 'ثبت رزرو ←'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment + Receipt upload */}
        {step === 4 && booking && (
          <div style={{ animation: 'fadeInUp 300ms var(--ease-out-expo)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>پرداخت و بارگذاری رسید</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>برای تأیید نهایی رزرو، مبلغ را به کارت زیر واریز کرده و رسید را بارگذاری کنید</p>

            {/* Booking summary */}
            <div className="card" style={{ marginBottom: 20, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>خدمت</span>
                <span style={{ fontWeight: 700 }}>{booking.service?.name || selectedService?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>زمان</span>
                <span style={{ fontWeight: 600 }}>{form.date} - {form.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>مبلغ قابل پرداخت</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-gold)' }}>{formatPrice(booking.amount || selectedService?.price)} تومان</span>
              </div>
            </div>

            {/* Bank card info */}
            <div className="card bank-card-info" style={{ marginBottom: 24, padding: 20, borderColor: 'rgba(198,169,98,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                <span style={{ fontWeight: 700 }}>اطلاعات حساب برای واریز</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>بانک</span>
                  <span style={{ fontWeight: 600 }}>{bankInfo.bankName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>شماره کارت</span>
                  <span style={{ fontWeight: 700, fontFamily: 'Vazirmatn', letterSpacing: 1 }} dir="ltr">{bankInfo.cardNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>شماره شبا</span>
                  <span style={{ fontWeight: 600, fontFamily: 'Vazirmatn', fontSize: '0.8rem' }} dir="ltr">{bankInfo.shaba}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>به نام</span>
                  <span style={{ fontWeight: 600 }}>{bankInfo.holder}</span>
                </div>
              </div>
            </div>

            {/* Receipt upload */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>بارگذاری رسید پرداخت</label>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} className="btn btn-outline" style={{ width: '100%', padding: '14px', borderStyle: 'dashed', borderWidth: 2 }}>
                {receiptFile ? `📎 ${receiptFile.name}` : '📁 انتخاب فایل رسید (تصویر یا PDF)'}
              </button>
              {receiptPreview && receiptFile?.type.startsWith('image/') && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptPreview} alt="پیش‌نمایش رسید" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                </div>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>حداکثر حجم: ۵ مگابایت | فرمت‌ها: تصویر، PDF</p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)} className="btn btn-ghost" disabled={uploading}>→ بازگشت</button>
              <button onClick={handleUpload} disabled={!receiptFile || uploading} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                {uploading ? 'در حال بارگذاری...' : 'بارگذاری رسید و تأیید ←'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && booking && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 400ms var(--ease-out-expo)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-gold),var(--brand-gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(198,169,98,0.2)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>رزرو با موفقیت ثبت شد</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>رسید شما بارگذاری شد و در انتظار تأیید کارشناسان است.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 32 }}>کد پیگیری: <span style={{ fontFamily: 'Vazirmatn', fontWeight: 700, color: 'var(--brand-gold)' }} dir="ltr">{booking.id.slice(0, 8).toUpperCase()}</span></p>

            <div className="card" style={{ textAlign: 'right', marginBottom: 24 }}>
              {[
                { l: 'نام', v: form.name },
                { l: 'شماره تماس', v: form.phone },
                { l: 'خدمت', v: booking.service?.name || selectedService?.name },
                { l: 'زمان', v: `${form.date} - ${form.time}` },
                { l: 'مبلغ', v: `${formatPrice(booking.amount || selectedService?.price)} تومان` },
                { l: 'وضعیت پرداخت', v: 'در انتظار تأیید' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{r.l}</span>
                  <span style={{ fontWeight: 600 }}>{r.v || '---'}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/" className="btn btn-primary btn-lg" style={{ flex: 1 }}>بازگشت به صفحه اصلی</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
