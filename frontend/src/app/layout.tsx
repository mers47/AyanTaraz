import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'آیان تراز | خدمات تخصصی حسابداری و مشاوره مالیاتی', template: '%s | آیان تراز' },
  description: 'خدمات حرفه‌ای حسابداری، مشاوره مالیاتی، تنظیم اظهارنامه، حسابرسی و برنامه‌ریزی مالی. تیم متخصص آیان تراز همراه کسب‌وکار شما.',
  keywords: ['حسابداری', 'مشاوره مالیاتی', 'اظهارنامه مالیاتی', 'مالیات بر ارزش افزوده', 'حسابرسی', 'برنامه‌ریزی مالی', 'آیان تراز', 'دفترداری', 'مشاور مالیاتی', 'تهران'],
  authors: [{ name: 'آیان تراز', url: 'https://ayantaraz.ir' }],
  creator: 'آیان تراز',
  publisher: 'آیان تراز',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://ayantaraz.ir'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'fa_IR', siteName: 'آیان تراز',
    title: 'آیان تراز | خدمات تخصصی حسابداری و مشاوره مالیاتی',
    description: 'خدمات حرفه‌ای حسابداری، مشاوره مالیاتی و برنامه‌ریزی مالی',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'آیان تراز' }],
  },
  twitter: { card: 'summary_large_image', title: 'آیان تراز', description: 'خدمات تخصصی حسابداری و مشاوره مالیاتی', images: ['/images/og-image.jpg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = { themeColor: '#0a0a0a', width: 'device-width', initialScale: 1, maximumScale: 5 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'ProfessionalService',
          name: 'آیان تراز', url: 'https://ayantaraz.ir',
          description: 'خدمات تخصصی حسابداری و مشاوره مالیاتی',
          address: { '@type': 'PostalAddress', addressLocality: 'تهران', addressCountry: 'IR' },
          telephone: '+982112345678', email: 'info@ayantaraz.ir',
          openingHours: 'Sa,Su,Mo,Tu,We,Th 09:00-17:00',
          priceRange: 'IRR',
          sameAs: ['https://instagram.com/ayantaraz', 'https://linkedin.com/company/ayantaraz'],
        }) }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
