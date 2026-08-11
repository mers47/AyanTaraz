import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers, totalTaxRules, totalBookings, pendingBookings, confirmedBookings, totalQuestions, totalResults,
      articlesPublished, articlesDraft, articlesReview, articlesArchived,
      videosPublished, videosDraft, videosReview,
      minibooksPublished, minibooksDraft,
      totalCategories, activeCategories,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.taxRule.count(),
      this.prisma.consultationBooking.count(),
      this.prisma.consultationBooking.count({ where: { status: 'PENDING' } }),
      this.prisma.consultationBooking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.taxQuestion.count({ where: { isActive: true } }),
      this.prisma.taxAssistantResult.count({ where: { isActive: true } }),
      this.prisma.article.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.article.count({ where: { status: 'DRAFT' } }),
      this.prisma.article.count({ where: { status: 'REVIEW' } }),
      this.prisma.article.count({ where: { status: 'ARCHIVED' } }),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.video.count({ where: { status: 'DRAFT' } }),
      this.prisma.video.count({ where: { status: 'REVIEW' } }),
      this.prisma.miniBook.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.miniBook.count({ where: { status: 'DRAFT' } }),
      this.prisma.category.count(),
      this.prisma.category.count({ where: { isActive: true } }),
    ]);
    return {
      totalUsers, totalTaxRules, totalBookings, pendingBookings, confirmedBookings, totalQuestions, totalResults,
      content: {
        articles: { published: articlesPublished, draft: articlesDraft, review: articlesReview, archived: articlesArchived, total: articlesPublished + articlesDraft + articlesReview + articlesArchived },
        videos: { published: videosPublished, draft: videosDraft, review: videosReview, total: videosPublished + videosDraft + videosReview },
        minibooks: { published: minibooksPublished, draft: minibooksDraft, total: minibooksPublished + minibooksDraft },
        categories: { total: totalCategories, active: activeCategories },
      },
    };
  }

  async getRecentActivity(limit = 10) {
    const [recentUsers, recentBookings] = await Promise.all([
      this.prisma.user.findMany({ take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, phone: true, firstName: true, lastName: true, role: true, createdAt: true } }),
      this.prisma.consultationBooking.findMany({ take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } }, service: { select: { id: true, name: true } } } }),
    ]);
    return { recentUsers, recentBookings };
  }

  async getAdminUsers() {
    return this.prisma.user.findMany({ where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } }, select: { id: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true } });
  }

  async createAdminUser(phone: string, firstName: string, lastName: string, role: UserRole = UserRole.ADMIN) {
    return this.prisma.user.create({ data: { phone, firstName, lastName, role, phoneVerified: true } });
  }

  async updateAdminUser(id: string, data: { firstName?: string; lastName?: string; role?: UserRole; isActive?: boolean }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) { where.OR = [{ phone: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }]; }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, phoneVerified: true, createdAt: true } }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, total, page, limit };
  }

  async getAuditLogs(page = 1, limit = 20, action?: string, userId?: string, entityType?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    const [logs, total] = await Promise.all([
      this.prisma.adminAction.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, phone: true, firstName: true, lastName: true } } } }),
      this.prisma.adminAction.count({ where }),
    ]);
    return { data: logs, total, page, limit };
  }

  // ==================== Chatbot Q&A Management ====================

  async getTaxQuestions() {
    return this.prisma.taxQuestion.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async createTaxQuestion(data: { question: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.taxQuestion.create({
      data: {
        question: data.question,
        description: data.description || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
      include: { options: true },
    });
  }

  async updateTaxQuestion(id: string, data: { question?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.taxQuestion.update({ where: { id }, data, include: { options: { orderBy: { sortOrder: 'asc' } } } });
  }

  async deleteTaxQuestion(id: string) {
    // Cascade delete will handle options and flows
    await this.prisma.taxQuestion.delete({ where: { id } });
    return { success: true };
  }

  async createTaxQuestionOption(data: { questionId: string; label: string; value: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.taxQuestionOption.create({
      data: {
        questionId: data.questionId,
        label: data.label,
        value: data.value,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateTaxQuestionOption(id: string, data: { label?: string; value?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.taxQuestionOption.update({ where: { id }, data });
  }

  async deleteTaxQuestionOption(id: string) {
    await this.prisma.taxQuestionOption.delete({ where: { id } });
    return { success: true };
  }

  async getTaxQuestionFlows() {
    return this.prisma.taxQuestionFlow.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { fromQuestion: { select: { id: true, question: true } }, toQuestion: { select: { id: true, question: true } }, option: { select: { id: true, label: true } } },
    });
  }

  async createTaxQuestionFlow(data: { fromQuestionId: string; toQuestionId: string; optionId?: string; condition?: string; sortOrder?: number }) {
    return this.prisma.taxQuestionFlow.create({
      data: {
        fromQuestionId: data.fromQuestionId,
        toQuestionId: data.toQuestionId,
        optionId: data.optionId || null,
        condition: data.condition || null,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { fromQuestion: { select: { question: true } }, toQuestion: { select: { question: true } }, option: { select: { label: true } } },
    });
  }

  async deleteTaxQuestionFlow(id: string) {
    await this.prisma.taxQuestionFlow.delete({ where: { id } });
    return { success: true };
  }

  async getTaxAssistantResults() {
    return this.prisma.taxAssistantResult.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createTaxAssistantResult(data: { name: string; title: string; description: string; ruleIds?: string[]; action?: string; severity?: string; isActive?: boolean }) {
    return this.prisma.taxAssistantResult.create({
      data: {
        name: data.name,
        title: data.title,
        description: data.description,
        ruleIds: data.ruleIds || [],
        action: data.action || null,
        severity: (data.severity as any) || 'INFO',
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateTaxAssistantResult(id: string, data: { name?: string; title?: string; description?: string; ruleIds?: string[]; action?: string; severity?: string; isActive?: boolean }) {
    return this.prisma.taxAssistantResult.update({ where: { id }, data: { ...data, severity: data.severity as any } });
  }

  async deleteTaxAssistantResult(id: string) {
    await this.prisma.taxAssistantResult.delete({ where: { id } });
    return { success: true };
  }

  // ==================== Articles Management ====================

  async getArticles(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) { where.OR = [{ title: { contains: search } }, { slug: { contains: search } }]; }
    const [data, total] = await Promise.all([
      this.prisma.article.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { category: { select: { id: true, name: true } }, author: { select: { id: true, firstName: true, lastName: true } } } }),
      this.prisma.article.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getArticleById(id: string) {
    return this.prisma.article.findUnique({ where: { id }, include: { category: true, author: { select: { id: true, firstName: true, lastName: true } } } });
  }

  async createArticle(data: { title: string; slug?: string; excerpt?: string; content: string; featuredImage?: string; status?: string; metaTitle?: string; metaDescription?: string; categoryId?: string; authorId: string }, auditUserId?: string, auditIp?: string) {
    // Ensure a category exists (create default if needed)
    let categoryId = data.categoryId;
    if (!categoryId) {
      let cat = await this.prisma.category.findFirst();
      if (!cat) { cat = await this.prisma.category.create({ data: { name: 'عمومی', slug: 'general' } }); }
      categoryId = cat.id;
    }
    let slug = data.slug || data.title.trim().replace(/\s+/g, '-').toLowerCase();
    // Ensure slug uniqueness
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) { slug = `${slug}-${Date.now()}`; }
    const article = await this.prisma.article.create({
      data: {
        title: data.title, slug, excerpt: data.excerpt || null, content: data.content,
        featuredImage: data.featuredImage || null, status: (data.status as any) || 'DRAFT',
        metaTitle: data.metaTitle || null, metaDescription: data.metaDescription || null,
        categoryId, authorId: data.authorId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: { category: { select: { name: true } } },
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'Article', article.id, null, { title: data.title, slug }, auditIp);
    return article;
  }

  async updateArticle(id: string, data: { title?: string; excerpt?: string; content?: string; featuredImage?: string; status?: string; metaTitle?: string; metaDescription?: string; categoryId?: string }, auditUserId?: string, auditIp?: string) {
    const updateData: any = { ...data };
    if (data.status) { updateData.status = data.status as any; if (data.status === 'PUBLISHED') { updateData.publishedAt = new Date(); } }
    const article = await this.prisma.article.update({ where: { id }, data: updateData, include: { category: { select: { name: true } } } });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'Article', id, null, data, auditIp);
    return article;
  }

  async deleteArticle(id: string, auditUserId?: string, auditIp?: string) {
    await this.prisma.article.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'Article', id, null, null, auditIp);
    return { success: true };
  }

  async getCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  // ==================== Videos Management ====================

  async getVideos(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) { where.OR = [{ title: { contains: search } }, { slug: { contains: search } }]; }
    const [data, total] = await Promise.all([
      this.prisma.video.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { category: { select: { id: true, name: true } }, author: { select: { id: true, firstName: true, lastName: true } } } }),
      this.prisma.video.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async createVideo(data: { title: string; slug?: string; description?: string; url: string; thumbnail?: string; duration?: number; status?: string; categoryId?: string; authorId: string }, auditUserId?: string, auditIp?: string) {
    let categoryId = data.categoryId;
    if (!categoryId) {
      let cat = await this.prisma.category.findFirst();
      if (!cat) { cat = await this.prisma.category.create({ data: { name: 'عمومی', slug: 'general' } }); }
      categoryId = cat.id;
    }
    let slug = data.slug || data.title.trim().replace(/\s+/g, '-').toLowerCase();
    const existing = await this.prisma.video.findUnique({ where: { slug } });
    if (existing) { slug = `${slug}-${Date.now()}`; }
    const video = await this.prisma.video.create({
      data: {
        title: data.title, slug, description: data.description || null, url: data.url,
        thumbnail: data.thumbnail || null, duration: data.duration || null,
        status: (data.status as any) || 'DRAFT', categoryId, authorId: data.authorId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: { category: { select: { name: true } } },
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'Video', video.id, null, { title: data.title, slug }, auditIp);
    return video;
  }

  async updateVideo(id: string, data: { title?: string; description?: string; url?: string; thumbnail?: string; duration?: number; status?: string; categoryId?: string }, auditUserId?: string, auditIp?: string) {
    const updateData: any = { ...data };
    if (data.status) { updateData.status = data.status as any; if (data.status === 'PUBLISHED') { updateData.publishedAt = new Date(); } }
    const video = await this.prisma.video.update({ where: { id }, data: updateData, include: { category: { select: { name: true } } } });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'Video', id, null, data, auditIp);
    return video;
  }

  async deleteVideo(id: string, auditUserId?: string, auditIp?: string) {
    await this.prisma.video.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'Video', id, null, null, auditIp);
    return { success: true };
  }

  // ==================== MiniBooks Management ====================

  async getMiniBooks(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) { where.OR = [{ title: { contains: search } }, { slug: { contains: search } }]; }
    const [data, total] = await Promise.all([
      this.prisma.miniBook.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { category: { select: { id: true, name: true } }, author: { select: { id: true, firstName: true, lastName: true } } } }),
      this.prisma.miniBook.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async createMiniBook(data: { title: string; slug?: string; description?: string; fileUrl: string; coverImage?: string; pageCount?: number; status?: string; categoryId?: string; authorId: string }, auditUserId?: string, auditIp?: string) {
    let categoryId = data.categoryId;
    if (!categoryId) {
      let cat = await this.prisma.category.findFirst();
      if (!cat) { cat = await this.prisma.category.create({ data: { name: 'عمومی', slug: 'general' } }); }
      categoryId = cat.id;
    }
    let slug = data.slug || data.title.trim().replace(/\s+/g, '-').toLowerCase();
    const existing = await this.prisma.miniBook.findUnique({ where: { slug } });
    if (existing) { slug = `${slug}-${Date.now()}`; }
    const minibook = await this.prisma.miniBook.create({
      data: {
        title: data.title, slug, description: data.description || null, fileUrl: data.fileUrl,
        coverImage: data.coverImage || null, pageCount: data.pageCount || null,
        status: (data.status as any) || 'DRAFT', categoryId, authorId: data.authorId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: { category: { select: { name: true } } },
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'MiniBook', minibook.id, null, { title: data.title, slug }, auditIp);
    return minibook;
  }

  async updateMiniBook(id: string, data: { title?: string; description?: string; fileUrl?: string; coverImage?: string; pageCount?: number; status?: string; categoryId?: string }, auditUserId?: string, auditIp?: string) {
    const updateData: any = { ...data };
    if (data.status) { updateData.status = data.status as any; if (data.status === 'PUBLISHED') { updateData.publishedAt = new Date(); } }
    const minibook = await this.prisma.miniBook.update({ where: { id }, data: updateData, include: { category: { select: { name: true } } } });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'MiniBook', id, null, data, auditIp);
    return minibook;
  }

  async deleteMiniBook(id: string, auditUserId?: string, auditIp?: string) {
    await this.prisma.miniBook.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'MiniBook', id, null, null, auditIp);
    return { success: true };
  }

  // ==================== Consultation Services Management ====================

  async getConsultationServices() {
    return this.prisma.consultationService.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createConsultationService(data: { name: string; slug?: string; description: string; duration: number; price?: number; isActive?: boolean; sortOrder?: number }, auditUserId?: string, auditIp?: string) {
    let slug = data.slug || data.name.trim().replace(/\s+/g, '-').toLowerCase();
    const existing = await this.prisma.consultationService.findUnique({ where: { slug } });
    if (existing) { slug = `${slug}-${Date.now()}`; }
    const service = await this.prisma.consultationService.create({
      data: { name: data.name, slug, description: data.description, duration: data.duration, price: data.price ?? null, isActive: data.isActive ?? true, sortOrder: data.sortOrder ?? 0 },
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'ConsultationService', service.id, null, { name: data.name, slug }, auditIp);
    return service;
  }

  async updateConsultationService(id: string, data: { name?: string; description?: string; duration?: number; price?: number; isActive?: boolean; sortOrder?: number }, auditUserId?: string, auditIp?: string) {
    const service = await this.prisma.consultationService.update({ where: { id }, data });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'ConsultationService', id, null, data, auditIp);
    return service;
  }

  async deleteConsultationService(id: string, auditUserId?: string, auditIp?: string) {
    await this.prisma.consultationService.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'ConsultationService', id, null, null, auditIp);
    return { success: true };
  }

  // ==================== Tax Topics Management ====================

  async getTaxTopics() {
    return this.prisma.taxTopic.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { rules: true } } } });
  }

  async createTaxTopic(data: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }, auditUserId?: string, auditIp?: string) {
    let slug = data.slug || data.name.trim().replace(/\s+/g, '-').toLowerCase();
    const existing = await this.prisma.taxTopic.findUnique({ where: { slug } });
    if (existing) { slug = `${slug}-${Date.now()}`; }
    const topic = await this.prisma.taxTopic.create({
      data: { name: data.name, slug, description: data.description ?? null, sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true },
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'TaxTopic', topic.id, null, { name: data.name, slug }, auditIp);
    return topic;
  }

  async updateTaxTopic(id: string, data: { name?: string; description?: string; sortOrder?: number; isActive?: boolean }, auditUserId?: string, auditIp?: string) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const topic = await this.prisma.taxTopic.update({ where: { id }, data: updateData });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'TaxTopic', id, null, data, auditIp);
    return topic;
  }

  async deleteTaxTopic(id: string, auditUserId?: string, auditIp?: string) {
    // Tax rules under this topic will be deleted via cascade? No — TaxRule.topicId has no onDelete cascade.
    // We must first check if there are rules and prevent deletion, or reassign. We'll block if rules exist.
    const ruleCount = await this.prisma.taxRule.count({ where: { topicId: id } });
    if (ruleCount > 0) {
      throw new BadRequestException(`Cannot delete topic with ${ruleCount} rule(s). Remove or reassign rules first.`);
    }
    await this.prisma.taxTopic.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'TaxTopic', id, null, null, auditIp);
    return { success: true };
  }

  // ==================== Tax Sources Management ====================

  async getTaxSources() {
    return this.prisma.taxSource.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { rules: true } } } });
  }

  async createTaxSource(data: { name: string; url?: string; officialName?: string; description?: string; isActive?: boolean }, auditUserId?: string, auditIp?: string) {
    const source = await this.prisma.taxSource.create({
      data: { name: data.name, url: data.url ?? null, officialName: data.officialName ?? null, description: data.description ?? null, isActive: data.isActive ?? true },
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'TaxSource', source.id, null, { name: data.name }, auditIp);
    return source;
  }

  async updateTaxSource(id: string, data: { name?: string; url?: string; officialName?: string; description?: string; isActive?: boolean }, auditUserId?: string, auditIp?: string) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.officialName !== undefined) updateData.officialName = data.officialName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const source = await this.prisma.taxSource.update({ where: { id }, data: updateData });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'TaxSource', id, null, data, auditIp);
    return source;
  }

  async deleteTaxSource(id: string, auditUserId?: string, auditIp?: string) {
    const versionCount = await this.prisma.taxRuleVersion.count({ where: { sourceId: id } });
    if (versionCount > 0) {
      throw new BadRequestException(`Cannot delete source referenced by ${versionCount} rule version(s).`);
    }
    await this.prisma.taxSource.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'TaxSource', id, null, null, auditIp);
    return { success: true };
  }

  // ==================== Tax Rules Management ====================

  async getTaxRulesAdmin(topicId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (topicId) where.topicId = topicId;
    const [data, total] = await Promise.all([
      this.prisma.taxRule.findMany({
        where,
        skip,
        take: limit,
        include: { topic: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.taxRule.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async createTaxRule(data: { topicId: string; name: string; slug?: string; description?: string; content: string; sourceId: string; effectiveFrom: string; effectiveTo?: string; status?: string }, auditUserId?: string, auditIp?: string) {
    let slug = data.slug || data.name.trim().replace(/\s+/g, '-').toLowerCase();
    const existing = await this.prisma.taxRule.findUnique({ where: { slug } });
    if (existing) { slug = `${slug}-${Date.now()}`; }
    // Create the rule + its first version in a transaction
    const rule = await this.prisma.$transaction(async (tx) => {
      const rule = await tx.taxRule.create({
        data: {
          topicId: data.topicId,
          name: data.name,
          slug,
          description: data.description ?? null,
          status: (data.status as any) || 'DRAFT',
        },
      });
      await tx.taxRuleVersion.create({
        data: {
          ruleId: rule.id,
          version: 1,
          content: data.content,
          sourceId: data.sourceId,
          effectiveFrom: new Date(data.effectiveFrom),
          effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
          status: 'DRAFT',
        },
      });
      return rule;
    });
    if (auditUserId) await this.audit.log(auditUserId, 'CREATE', 'TaxRule', rule.id, null, { name: data.name, slug, topicId: data.topicId }, auditIp);
    return this.prisma.taxRule.findUnique({ where: { id: rule.id }, include: { topic: true, versions: { orderBy: { version: 'desc' } } } });
  }

  async updateTaxRule(id: string, data: { topicId?: string; name?: string; description?: string; status?: string }, auditUserId?: string, auditIp?: string) {
    const updateData: any = {};
    if (data.topicId !== undefined) updateData.topicId = data.topicId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    const rule = await this.prisma.taxRule.update({ where: { id }, data: updateData, include: { topic: true, versions: { orderBy: { version: 'desc' } } } });
    if (auditUserId) await this.audit.log(auditUserId, 'UPDATE', 'TaxRule', id, null, data, auditIp);
    return rule;
  }

  async deleteTaxRule(id: string, auditUserId?: string, auditIp?: string) {
    // TaxRuleVersion has onDelete: Cascade on ruleId, so versions are auto-deleted
    await this.prisma.taxRule.delete({ where: { id } });
    if (auditUserId) await this.audit.log(auditUserId, 'DELETE', 'TaxRule', id, null, null, auditIp);
    return { success: true };
  }

  // ==================== Tax Rule Versions Management ====================

  async createTaxRuleVersion(data: { ruleId: string; content: string; sourceId: string; effectiveFrom: string; effectiveTo?: string; status?: string; reviewNotes?: string }) {
    // Find the latest version number for this rule
    const latest = await this.prisma.taxRuleVersion.findFirst({ where: { ruleId: data.ruleId }, orderBy: { version: 'desc' } });
    const nextVersion = (latest?.version || 0) + 1;
    const version = await this.prisma.taxRuleVersion.create({
      data: {
        ruleId: data.ruleId,
        version: nextVersion,
        content: data.content,
        sourceId: data.sourceId,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        status: (data.status as any) || 'DRAFT',
        reviewNotes: data.reviewNotes ?? null,
      },
    });
    return version;
  }

  async updateTaxRuleVersion(id: string, data: { content?: string; status?: string; effectiveFrom?: string; effectiveTo?: string; reviewNotes?: string; publishedById?: string }) {
    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.effectiveFrom) updateData.effectiveFrom = new Date(data.effectiveFrom);
    if (data.effectiveTo) updateData.effectiveTo = new Date(data.effectiveTo);
    if (data.reviewNotes !== undefined) updateData.reviewNotes = data.reviewNotes;
    // If publishing, set publishedBy and publishedAt
    if (data.status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
      if (data.publishedById) {
        updateData.publishedById = data.publishedById;
      }
    }
    return this.prisma.taxRuleVersion.update({ where: { id }, data: updateData });
  }

  async deleteTaxRuleVersion(id: string) {
    await this.prisma.taxRuleVersion.delete({ where: { id } });
    return { success: true };
  }
}
