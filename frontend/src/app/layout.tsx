import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ayan Taraz - Professional Accounting & Tax Advisory',
    template: '%s | Ayan Taraz',
  },
  description: 'Expert accounting and tax advisory services for individuals and businesses. Get professional advice on tax planning, compliance, and financial management.',
  keywords: ['accounting', 'tax', 'advisory', 'financial', 'consultation', 'Iran'],
  authors: [{ name: 'Ayan Taraz' }],
  creator: 'Ayan Taraz',
  publisher: 'Ayan Taraz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'fa-IR': '/fa-IR',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    siteName: 'Ayan Taraz',
    title: 'Ayan Taraz - Professional Accounting & Tax Advisory',
    description: 'Expert accounting and tax advisory services for individuals and businesses.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ayan Taraz - Professional Accounting & Tax Advisory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayan Taraz - Professional Accounting & Tax Advisory',
    description: 'Expert accounting and tax advisory services for individuals and businesses.',
    images: ['/images/og-image.jpg'],
    creator: '@AyanTaraz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
