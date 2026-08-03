'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { taxAssistantApi } from '@/lib/api';
import type { TaxAssistantQuestion, TaxAssistantResult, TaxAssistantSession } from '@/types';

const severityLabels: Record<string, string> = {
  INFO: 'اطلاع‌رسانی', WARNING: 'هشدار', CRITICAL: 'حیاتی', NEEDS_REVIEW: 'نیاز به بررسی',
};

const severityColors: Record<string, string> = {
  INFO: 'bg-blue-500/20 text-blue-400 border-blue-500',
  WARNING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500',
  NEEDS_REVIEW: 'bg-purple-500/20 text-purple-400 border-purple-500',
};

const actionLabels: Record<string, string> = {
  REGISTER_TAXPAYER: 'ثبت‌نام در سامانه مودیان',
  FILE_TAX_RETURN: 'تکمیل اظهارنامه مالیاتی',
  CONSULT_ACCOUNTANT: 'مشاوره با حسابدار',
  REGISTER_VAT: 'ثبت‌نام ارزش افزوده',
  BOOK_CONSULTATION: 'رزرو وقت مشاوره',
};

export default function ChatbotPage() {
  const [session, setSession] = useState<TaxAssistantSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TaxAssistantQuestion | null>(null);
  const [result, setResult] = useState<TaxAssistantResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { initSession(); }, []);

  const initSession = async () => {
    try {
      setIsLoading(true); setError(null);
      const res = await taxAssistantApi.startSession();
      setSession(res.data); setCurrentQuestion(res.data.question);
    } catch (err: any) { setError(err.response?.data?.message || 'خطا در شروع دستیار مالیاتی'); }
    finally { setIsLoading(false); }
  };

  const handleAnswer = async (qId: string, oId: string, oVal: string) => {
    if (!session) return; setError(null); setIsLoading(true);
    try {
      const newAns = { ...answers, [qId]: oVal }; setAnswers(newAns);
      const res = await taxAssistantApi.answerQuestion(session.sessionId, qId, oId, oVal);
      if (res.data.completed) { setResult(res.data.result); setCompleted(true); }
      else if (res.data.question) { setCurrentQuestion(res.data.question); }
    } catch (err: any) { setError(err.response?.data?.message || 'خطا'); }
    finally { setIsLoading(false); }
  };

  const handleRestart = () => { setResult(null); setCompleted(false); setAnswers({}); setCurrentQuestion(null); initSession(); };

  if (isLoading && !currentQuestion) return (<div className="min-h-screen bg-black flex items-center justify-center" dir="rtl"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" /><p className="text-gray-400">در حال راه‌اندازی...</p></div></div>);

  if (error) return (<div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl"><div className="max-w-md w-full"><div className="bg-gray-900 rounded-xl p-6 text-center"><span className="text-3xl">⚠️</span><h2 className="text-xl font-bold mb-2 text-red-400">خطا</h2><p className="text-gray-400 mb-6">{error}</p><button onClick={handleRestart} className="btn-primary px-6 py-3 rounded-lg">🔄 تلاش مجدد</button></div></div></div>);

  if (completed && result) return (
    <div className="min-h-screen bg-black p-4" dir="rtl">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-6"><Link href="/" className="text-gold-400 hover:text-gold-300">← بازگشت</Link></div>
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <span className="text-3xl">✅</span>
          <h1 className="text-2xl font-bold mb-3 text-white mt-4">{result.title}</h1>
          <span className={`inline-flex px-4 py-1 rounded-full text-sm border mb-6 ${severityColors[result.severity]}`}>{severityLabels[result.severity]}</span>
          <div className="bg-gray-800 rounded-lg p-6 mb-6 text-right"><pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm">{result.description}</pre></div>
          {result.action && <div className="mb-6"><button className="btn-primary px-6 py-3 rounded-lg">{actionLabels[result.action] || result.action}</button></div>}
          <button onClick={handleRestart} className="btn-outline px-6 py-3 rounded-lg">🔄 شروع دوباره</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4" dir="rtl">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-gold-400 hover:text-gold-300">← بازگشت</Link>
          <button onClick={handleRestart} className="text-gray-400 hover:text-white text-sm">شروع دوباره</button>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">دستیار مالیاتی</h1>
          <p className="text-gray-400 text-sm">به سوالات زیر پاسخ دهید</p>
          <div className="mt-4 w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-gold-600 to-gold-400 h-2 rounded-full transition-all" style={{ width: `${Math.min((Object.keys(answers).length + 1) * 20, 100)}%` }} /></div>
          <p className="text-gray-500 text-xs mt-1">سوال {Object.keys(answers).length + 1}</p>
        </div>
        {currentQuestion && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-2">{currentQuestion.question}</h2>
            {currentQuestion.description && <p className="text-gray-400 mb-6 text-sm">{currentQuestion.description}</p>}
            <div className="space-y-3">
              {currentQuestion.options.map((o) => (
                <button key={o.id} onClick={() => handleAnswer(currentQuestion.id, o.id, o.value)} disabled={isLoading}
                  className={`w-full p-4 rounded-lg border-2 text-right transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'border-gray-700 hover:border-gold-500 hover:bg-gold-500/10 cursor-pointer'} ${answers[currentQuestion.id] === o.value ? 'border-gold-500 bg-gold-500/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${answers[currentQuestion.id] === o.value ? 'border-gold-500 bg-gold-500' : 'border-gray-600'}`}>
                      {answers[currentQuestion.id] === o.value && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-white">{o.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {isLoading && <div className="mt-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500 mx-auto" /><p className="text-gray-400 text-sm mt-2">در حال پردازش...</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
