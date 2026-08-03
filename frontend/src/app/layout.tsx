import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'آیان تراز - خدمات تخصصی حسابداری و مشاوره مالیاتی', template: '%s | آیان تراز' },
  description: 'خدمات تخصصی حسابداری و مشاوره مالیاتی برای اشخاص حقیقی و حقوقی.',
  keywords: ['حسابداری', 'مالیات', 'مشاوره مالیاتی', 'اظهارنامه', 'ارزش افزوده', 'آیان تراز'],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#000000', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
