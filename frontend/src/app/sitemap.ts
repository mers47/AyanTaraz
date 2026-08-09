import type { MetadataRoute } from 'next';

type Item = { slug: string; updatedAt?: string; publishedAt?: string };

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://ayantaraz.ir';
// Server-side API base for SSR fetches.
// Priority: INTERNAL_API_URL (docker internal, e.g. http://backend:4000) →
// NEXT_PUBLIC_API_URL (explicit public URL) →
// relative "/api" fallback (works when SSR runs behind same Nginx proxy).
const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

function apiUrl(path: string): string {
  if (API) return `${API}/api/${path}`;
  // In standalone server mode inside a container without INTERNAL_API_URL,
  // fall back to localhost:4000 (works when backend is on same host).
  return `http://localhost:4000/api/${path}`;
}

async function fetchSlugs(path: string): Promise<Item[]> {
  try {
    const res = await fetch(apiUrl(`content/${path}?limit=1000`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.items ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, videos, minibooks] = await Promise.all([
    fetchSlugs('articles'),
    fetchSlugs('videos'),
    fetchSlugs('minibooks'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/minibooks`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/consultation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tax-laws`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tax-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/chatbot`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt ? new Date(a.updatedAt || a.publishedAt!) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${BASE}/videos/${v.slug}`,
    lastModified: v.updatedAt || v.publishedAt ? new Date(v.updatedAt || v.publishedAt!) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const minibookRoutes: MetadataRoute.Sitemap = minibooks.map((b) => ({
    url: `${BASE}/minibooks/${b.slug}`,
    lastModified: b.updatedAt || b.publishedAt ? new Date(b.updatedAt || b.publishedAt!) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...videoRoutes, ...minibookRoutes];
}
