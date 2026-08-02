import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  async getSEOConfig(path: string) {
    const config = await this.prisma.sEOConfig.findUnique({
      where: { path },
    });

    return config || null;
  }

  async getRedirect(fromPath: string) {
    const redirect = await this.prisma.redirect.findUnique({
      where: { fromPath },
    });

    return redirect || null;
  }

  async generateSitemap() {
    // Get all public pages
    const articles = await this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const videos = await this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const miniBooks = await this.prisma.miniBook.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const taxTopics = await this.prisma.taxTopic.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    const services = await this.prisma.consultationService.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    const urls = [
      { loc: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { loc: '/about', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
      { loc: '/contact', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
      { loc: '/services', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
      { loc: '/articles', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
      { loc: '/videos', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
      { loc: '/mini-books', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
      { loc: '/tax-assistant', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
      ...articles.map((a) => ({
        loc: `/articles/${a.slug}`,
        lastmod: a.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      })),
      ...videos.map((v) => ({
        loc: `/videos/${v.slug}`,
        lastmod: v.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      })),
      ...miniBooks.map((m) => ({
        loc: `/mini-books/${m.slug}`,
        lastmod: m.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      })),
      ...taxTopics.map((t) => ({
        loc: `/tax/${t.slug}`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      })),
      ...services.map((s) => ({
        loc: `/services/${s.slug}`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      })),
    ];

    return {
      urls,
      generatedAt: new Date().toISOString(),
    };
  }

  async getRobotsTxt() {
    return `User-agent: *
Allow: /

Sitemap: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/sitemap.xml`;
  }
}
