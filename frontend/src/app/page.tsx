'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const features = [
  { icon: '✅', title: 'مشاوره تخصصی', desc: 'راهنمایی حرفه‌ای از متخصصان مجرب مالیاتی و حسابداری' },
  { icon: '👥', title: 'خدمات شخصی‌سازی شده', desc: 'راهکارهای اختصاصی متناسب با شرایط مالی شما' },
  { icon: '📄', title: 'تضمین انطباق', desc: 'اطمینان از رعایت تمام قوانین و مقررات مالیاتی' },
  { icon: '🧮', title: 'بهینه‌سازی مالیاتی', desc: 'کاهش بدهی و افزایش صرفه‌جویی با برنامه‌ریزی استراتژیک' },
  { icon: '📅', title: 'خدمات به‌موقع', desc: 'رعایت تمام مهلت‌های قانونی با رویکرد فعال ما' },
  { icon: '📞', title: 'پشتیبانی پاسخگو', desc: 'دریافت پاسخ سوالات خود از تیم پشتیبانی اختصاصی' },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 800); return () => clearTimeout(t); }, []);

  if (isLoading) return (<div className="min-h-screen bg-black flex items-center justify-center" dir="rtl"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" /></div>);

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-gold-400 font-bold text-xl">آیان تراز</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white">خانه</Link>
              <Link href="/chatbot" className="text-gray-300 hover:text-white">دستیار مالیاتی</Link>
              <Link href="/admin" className="text-gray-300 hover:text-white">پنل مدیریت</Link>
            </div>
            <Link href="/chatbot" className="btn-outline text-sm">🤖 شروع مشاوره</Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center text-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            خدمات تخصصی <span className="text-gold-400">حسابداری</span> و <span className="text-gold-400">مشاوره مالیاتی</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            با اطمینان کامل در پیچیدگی‌های قوانین مالیاتی گام بردارید. تیم متخصصان ما راهکارهای شخصی‌سازی شده متناسب با نیازهای شما ارائه می‌دهند.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chatbot" className="btn-primary px-8 py-4 text-lg rounded-xl">🤖 شروع مشاوره با دستیار هوشمند</Link>
            <Link href="/admin" className="btn-secondary px-8 py-4 text-lg rounded-xl">📊 پنل مدیریت</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">چرا آیان تراز؟</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">ما تخصص را با خدمات شخصی‌سازی شده ترکیب می‌کنیم تا نتایج استثنایی ارائه دهیم</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-gold-500 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدمات ما</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">راهکارهای جامع برای تمام نیازهای حسابداری و مالیاتی شما</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[{ icon: '🧮', title: 'مشاوره مالیاتی', desc: 'برنامه‌ریزی مالیاتی شخصی' }, { icon: '📄', title: 'خدمات حسابداری', desc: 'دفترداری جامع و گزارش‌دهی مالی' }].map((s, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gold-500 transition-all duration-300">
                <div className="flex items-center mb-3"><span className="text-3xl ml-3">{s.icon}</span><h3 className="text-xl font-semibold">{s.title}</h3></div>
                <p className="text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gradient-to-r from-gold-500/10 to-gold-600/5 rounded-xl p-8 border border-gold-500/30 text-center">
            <span className="text-4xl mb-4 block">🤖</span>
            <h3 className="text-2xl font-bold mb-3">دستیار هوشمند مالیاتی</h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">با پاسخ به چند سوال ساده، راهنمایی مالیاتی دقیق دریافت کنید. بدون هوش مصنوعی - بر اساس قوانین واقعی.</p>
            <Link href="/chatbot" className="btn-primary px-8 py-3 rounded-xl text-lg inline-block">شروع کنید ←</Link>
          </div>
        </div>
      </section>

      <footer className="bg-black/50 border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">© {new Date().getFullYear()} آیان تراز. تمام حقوق محفوظ است.</div>
            <div className="flex gap-6 text-sm">
              <Link href="/chatbot" className="text-gray-400 hover:text-white">دستیار مالیاتی</Link>
              <Link href="/admin" className="text-gray-400 hover:text-white">پنل مدیریت</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
