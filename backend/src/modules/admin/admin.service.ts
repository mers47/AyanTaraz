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
}
