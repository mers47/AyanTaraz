import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const LAWS = {
  salary: {title:'مالیات حقوق ۱۴۰۵',hero:'راهکارهای هوشمند مالیاتی ۱۴۰۵',subtitle:'بخشنامه ۲۰۰/۱۰۰۵/ص — سقف معافیت ۴۰ میلیون تومان',description:'مالیات حقوق ۱۴۰۵: سقف معافیت ۴۰M ماهانه\nنرخ‌ها: ۱۰٪(۴۰-۸۰M), ۱۵٪(۸۰-۱۰۰M), ۲۰٪(۱۰۰-۱۲۰M), ۲۵٪(۱۲۰-۱۴۰M), ۳۰٪(+۱۴۰M)\nعیدی معاف: ۴۰M'},
  business: {title:'مالیات مشاغل ۱۴۰۵',hero:'کسب‌وکار هوشمند',subtitle:'معافیت ۲۰۰M (POS:۴۳۲M) — نرخ ۱۵-۲۵٪',description:'معافیت:۲۰۰M\nنرخ‌ها:۱۵٪(تا۵۰۰M),۲۰٪(۵۰۰M-۱B),۲۵٪(+۱B)\nمهلت:۳۱ خرداد'},
  corporate: {title:'اشخاص حقوقی ۱۴۰۵',hero:'نرخ ۲۵٪ + ماده ۱۳۲',subtitle:'سقف معافیت ۶۰۰B — ۴ ماه پس از سال مالی',description:'نرخ:۲۵٪\nماده۱۳۲:۸۰٪ معاف تولید\nمهلت:۴ماه پس از سال مالی'},
  vat: {title:'VAT ۱۴۰۵ — ۱۲٪',hero:'نرخ جدید ۱۲٪',subtitle:'افزایش از ۱۰٪',description:'نرخ:۱۲٪\nکالاهای معاف:کشاورزی،دارو،کتاب\nجرایم:۷۵٪+۵۰٪'},
  penalties: {title:'جرایم ۱۴۰۵',hero:'از جرایم جلوگیری کنید',subtitle:'۳۰٪+۲.۵٪ماهانه — بخشودگی ۱۰۰٪',description:'عدم اظهارنامه:۳۰٪|تأخیر:۲.۵٪ماهانه|بخشودگی:تا۱۰۰٪'},
  exemptions: {title:'معافیت‌های ۱۴۰۵',hero:'از معافیت‌ها بهره ببرید',subtitle:'حقوق۴۰M|مشاغل۲۰۰M|دانش‌بنیان۱۵سال',description:'سقف‌ها:حقوق۴۰M,مشاغل۲۰۰M,حقیقی۶۰B,حقوقی۶۰۰B'},
  obligations: {title:'تکالیف ۱۴۰۵',hero:'تکالیف خود را بشناسید',subtitle:'مهلت‌ها و الزامات',description:'ثبت‌نام مودیان|تفکیک حساب|POS|اظهارنامه|نگهداری اسناد ۵سال'},
  consultation: {title:'مشاوره آیان تراز',hero:'برای مشاوره آماده‌اید؟',subtitle:'گفتگو با دستیار هوشمند',description:'مشاوره۳۰دقیقه رایگان|تخصصی۶۰دقیقه|تنظیم اظهارنامه|اعتراض'},
};

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

  async autoFill() {
    for (const [k, v] of Object.entries(LAWS)) {
      await this.prisma.adminSetting.upsert({ where: { key: `content_${k}` }, create: { key: `content_${k}`, value: JSON.stringify(v) }, update: { value: JSON.stringify(v) } });
    }
    return { ok: true, count: Object.keys(LAWS).length, message: '✅ ۸ بخش قوانین ۱۴۰۵ جای‌گذاری شد' };
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
