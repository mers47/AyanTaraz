import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { notFound } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://ayantaraz.ir';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  featuredImage?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: { name: string; slug: string };
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API}/content/articles/${slug}`, {
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
  const article = await getArticle(slug);
  if (!article) {
    return { title: 'مقاله یافت نشد', robots: { index: false, follow: false } };
  }
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    alternates: { canonical: article.canonicalUrl || `${BASE}/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      locale: 'fa_IR',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      url: `${BASE}/articles/${article.slug}`,
      siteName: 'آیان تراز',
      images: article.featuredImage ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }] : undefined,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || article.excerpt || '',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'آیان تراز' },
    publisher: { '@type': 'Organization', name: 'آیان تراز' },
    mainEntityOfPage: `${BASE}/articles/${article.slug}`,
    image: article.featuredImage || undefined,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title="مقالات" titleHref="/articles" backHref="/articles" backLabel="بازگشت به لیست" />
      <div className="container section" style={{ maxWidth: 800, margin: '0 auto' }}>
        <article className="card" style={{ padding: '2.5rem', overflow: 'hidden' }}>
          {/* detail responsive: padding/title scale on mobile via globals.css detail-* classes */}
          {article.category && (
            <div className="badge badge-gold" style={{ marginBottom: 16 }}>{article.category.name}</div>
          )}
          <h1 className="detail-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.6 }}>{article.title}</h1>
          {article.excerpt && (
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: 24, borderRight: '3px solid var(--brand-gold)', paddingRight: 16 }}>{article.excerpt}</p>
          )}
          {article.featuredImage && (
            <img src={article.featuredImage} alt={article.title} style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 24 }} />
          )}
          <div className="detail-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 2.1, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            {article.content}
          </div>
        </article>
      </div>
    </div>
  );
}
