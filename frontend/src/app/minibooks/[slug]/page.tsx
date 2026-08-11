import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { notFound } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://ayantaraz.ir';
const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

interface MiniBook {
  id: string;
  title: string;
  slug: string;
  description?: string;
  fileUrl?: string;
  coverImage?: string;
  pageCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: { name: string; slug: string };
}

async function getMiniBook(slug: string): Promise<MiniBook | null> {
  try {
    const apiUrl = API ? `${API}/api/content/minibooks/${slug}` : `http://localhost:4000/api/content/minibooks/${slug}`;
    const res = await fetch(apiUrl, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getMiniBook(slug);
  if (!book) {
    return { title: 'مینی‌بوک یافت نشد', robots: { index: false, follow: false } };
  }
  return {
    title: book.metaTitle || book.title,
    description: book.metaDescription || book.description || '',
    alternates: { canonical: book.canonicalUrl || `${BASE}/minibooks/${book.slug}` },
    openGraph: {
      type: 'book',
      locale: 'fa_IR',
      title: book.metaTitle || book.title,
      description: book.metaDescription || book.description || '',
      url: `${BASE}/minibooks/${book.slug}`,
      siteName: 'آیان تراز',
      images: book.coverImage ? [{ url: book.coverImage, width: 1200, height: 630, alt: book.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: book.metaTitle || book.title,
      description: book.metaDescription || book.description || '',
      images: book.coverImage ? [book.coverImage] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function MiniBookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getMiniBook(slug);
  if (!book) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    description: book.metaDescription || book.description || '',
    bookFormat: 'https://schema.org/EBook',
    numberOfPages: book.pageCount || undefined,
    image: book.coverImage || undefined,
    publisher: { '@type': 'Organization', name: 'آیان تراز' },
    url: `${BASE}/minibooks/${book.slug}`,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title="مینی‌بوک‌ها" titleHref="/minibooks" backHref="/minibooks" backLabel="بازگشت به لیست" />
      <div className="container section" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card" style={{ padding: '2.5rem', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ width: 160, height: 220, flexShrink: 0, background: book.coverImage ? `url(${book.coverImage}) center/cover` : 'linear-gradient(135deg, var(--brand-gold-dark), var(--brand-gold))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: 'var(--text-inverse)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {!book.coverImage && book.title.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            {book.category && (
              <div className="badge badge-gold" style={{ marginBottom: 12 }}>{book.category.name}</div>
            )}
            <h1 className="detail-title" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.6 }}>{book.title}</h1>
            {book.pageCount && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>📄 {book.pageCount} صفحه</div>
            )}
            {book.description && (
              <p className="detail-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.9375rem', marginBottom: 24 }}>{book.description}</p>
            )}
            {book.fileUrl && (
              <a href={book.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                📥 دانلود مینی‌بوک
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
