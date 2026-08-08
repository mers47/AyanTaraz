import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalTaxRules, totalBookings, pendingBookings, confirmedBookings, totalQuestions, totalResults] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.taxRule.count(),
      this.prisma.consultationBooking.count(),
      this.prisma.consultationBooking.count({ where: { status: 'PENDING' } }),
      this.prisma.consultationBooking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.taxQuestion.count({ where: { isActive: true } }),
      this.prisma.taxAssistantResult.count({ where: { isActive: true } }),
    ]);
    return { totalUsers, totalTaxRules, totalBookings, pendingBookings, confirmedBookings, totalQuestions, totalResults };
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

  async createArticle(data: { title: string; slug?: string; excerpt?: string; content: string; featuredImage?: string; status?: string; metaTitle?: string; metaDescription?: string; categoryId?: string; authorId: string }) {
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
    return this.prisma.article.create({
      data: {
        title: data.title, slug, excerpt: data.excerpt || null, content: data.content,
        featuredImage: data.featuredImage || null, status: (data.status as any) || 'DRAFT',
        metaTitle: data.metaTitle || null, metaDescription: data.metaDescription || null,
        categoryId, authorId: data.authorId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: { category: { select: { name: true } } },
    });
  }

  async updateArticle(id: string, data: { title?: string; excerpt?: string; content?: string; featuredImage?: string; status?: string; metaTitle?: string; metaDescription?: string; categoryId?: string }) {
    const updateData: any = { ...data };
    if (data.status) { updateData.status = data.status as any; if (data.status === 'PUBLISHED') { updateData.publishedAt = new Date(); } }
    return this.prisma.article.update({ where: { id }, data: updateData, include: { category: { select: { name: true } } } });
  }

  async deleteArticle(id: string) {
    await this.prisma.article.delete({ where: { id } });
    return { success: true };
  }

  async getCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }
}
