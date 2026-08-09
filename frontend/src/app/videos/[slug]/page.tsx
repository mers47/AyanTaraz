import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://ayantaraz.ir';
const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: { name: string; slug: string };
}

async function getVideo(slug: string): Promise<Video | null> {
  try {
    const apiUrl = API ? `${API}/api/content/videos/${slug}` : `http://localhost:4000/api/content/videos/${slug}`;
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
  const video = await getVideo(slug);
  if (!video) {
    return { title: 'ویدیو یافت نشد', robots: { index: false, follow: false } };
  }
  return {
    title: video.metaTitle || video.title,
    description: video.metaDescription || video.description || '',
    alternates: { canonical: video.canonicalUrl || `${BASE}/videos/${video.slug}` },
    openGraph: {
      type: 'video.other',
      locale: 'fa_IR',
      title: video.metaTitle || video.title,
      description: video.metaDescription || video.description || '',
      url: `${BASE}/videos/${video.slug}`,
      siteName: 'آین تراز',
      images: video.thumbnail ? [{ url: video.thumbnail, width: 1200, height: 630, alt: video.title }] : undefined,
      videos: video.url ? [{ url: video.url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: video.metaTitle || video.title,
      description: video.metaDescription || video.description || '',
      images: video.thumbnail ? [video.thumbnail] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.metaDescription || video.description || '',
    thumbnailUrl: video.thumbnail || undefined,
    uploadDate: video.publishedAt,
    contentUrl: video.url || `${BASE}/videos/${video.slug}`,
    embedUrl: `${BASE}/videos/${video.slug}`,
    publisher: { '@type': 'Organization', name: 'آین تراز' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-black)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title="ویدیوها" titleHref="/videos" backHref="/videos" backLabel="بازگشت به لیست" />
      <div className="container section" style={{ maxWidth: 900, margin: '0 auto' }}>
        {video.category && (
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>{video.category.name}</div>
        )}
        <h1 className="detail-title" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24, lineHeight: 1.6 }}>{video.title}</h1>
        <VideoPlayer url={video.url} title={video.title} poster={video.thumbnail} />
        {video.description && (
          <p className="detail-body" style={{ marginTop: 24, color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.9375rem' }}>{video.description}</p>
        )}
      </div>
    </div>
  );
}
