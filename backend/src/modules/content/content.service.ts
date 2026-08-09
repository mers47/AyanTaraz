import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const rows = await this.prisma.adminSetting.findMany({ where: { key: { startsWith: 'content_' } } });
    const r: any = {};
    for (const row of rows) { try { r[row.key] = JSON.parse(row.value); } catch { r[row.key] = row.value; } }
    return r;
  }

  async get(key: string) {
    const row = await this.prisma.adminSetting.findUnique({ where: { key: `content_${key}` } });
    return row ? (()=>{try{return JSON.parse(row.value)}catch{return row.value}})() : null;
  }

  async save(key: string, data: any) {
    const val = typeof data === 'string' ? data : JSON.stringify(data);
    await this.prisma.adminSetting.upsert({ where: { key: `content_${key}` }, create: { key: `content_${key}`, value: val }, update: { value: val } });
    return { ok: true };
  }

  /**
   * Seed the admin content store from the REAL TaxTopic data in the database.
   *
   * Previously this used a hardcoded `LAWS` mock with abbreviated placeholder
   * strings that duplicated (and often contradicted) the authoritative 1405 tax
   * rules already stored in the TaxRule/TaxTopic tables. That mock has been
   * removed. Now autoFill pulls each active TaxTopic and stores a content card
   * (title + summary) keyed by the topic slug, so the admin content tab reflects
   * the real, seeded 1405 reference data — which the admin can then refine.
   *
   * Existing admin-edited content_* settings are preserved (upsert with update
   * only sets title/hero when the row does not yet exist; existing rows keep the
   * admin's edits via a guard on `createdAt`).
   */
  async autoFill() {
    const topics = await this.prisma.taxTopic.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { rules: { where: { status: 'PUBLISHED' }, select: { name: true } } },
    });

    let count = 0;
    for (const topic of topics) {
      const key = `content_${topic.slug}`;
      const summary = topic.description
        ? topic.description
        : topic.rules.map((r: { name: string }) => `• ${r.name}`).join('\n');
      const card = {
        title: topic.name,
        hero: topic.name,
        subtitle: `${topic.rules.length} قانون مرتبط`,
        description: summary,
      };
      // Only create if it doesn't already exist — never overwrite admin edits.
      const existing = await this.prisma.adminSetting.findUnique({ where: { key } });
      if (!existing) {
        await this.prisma.adminSetting.create({ data: { key, value: JSON.stringify(card) } });
        count += 1;
      }
    }
    return {
      ok: true,
      count,
      total: topics.length,
      message: `✅ ${count} بخش محتوایی از داده واقعی موضوعات مالیاتی ایجاد شد (از مجموع ${topics.length} موضوع)`,
    };
  }

  // ─── Public content: Articles ───
  async getPublishedArticles(page = 1, limit = 20, search?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }];
    const [items, total] = await Promise.all([
      this.prisma.article.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { category: { select: { name: true, slug: true } } } }),
      this.prisma.article.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getArticleBySlug(slug: string) {
    return this.prisma.article.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { category: { select: { name: true, slug: true } } } });
  }

  // ─── Public content: Videos ───
  async getPublishedVideos(page = 1, limit = 20, search?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    const [items, total] = await Promise.all([
      this.prisma.video.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { category: { select: { name: true, slug: true } } } }),
      this.prisma.video.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getVideoBySlug(slug: string) {
    return this.prisma.video.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { category: { select: { name: true, slug: true } } } });
  }

  // ─── Public content: MiniBooks ───
  async getPublishedMiniBooks(page = 1, limit = 20, search?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    const [items, total] = await Promise.all([
      this.prisma.miniBook.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { category: { select: { name: true, slug: true } } } }),
      this.prisma.miniBook.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMiniBookBySlug(slug: string) {
    return this.prisma.miniBook.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { category: { select: { name: true, slug: true } } } });
  }

  // ─── Public content: Categories ───
  async getCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, slug: true } });
  }
}
