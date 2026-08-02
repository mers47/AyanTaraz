import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalArticles,
      totalVideos,
      totalMiniBooks,
      totalTaxRules,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.article.count(),
      this.prisma.video.count(),
      this.prisma.miniBook.count(),
      this.prisma.taxRule.count(),
      this.prisma.consultationBooking.count(),
      this.prisma.consultationBooking.count({ where: { status: 'PENDING' } }),
      this.prisma.consultationBooking.count({ where: { status: 'CONFIRMED' } }),
    ]);

    return {
      totalUsers,
      totalArticles,
      totalVideos,
      totalMiniBooks,
      totalTaxRules,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    };
  }

  async getRecentActivity(limit: number = 10) {
    const [
      recentUsers,
      recentArticles,
      recentBookings,
      recentTaxRules,
    ] = await Promise.all([
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
      this.prisma.article.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.consultationBooking.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.taxRule.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      recentUsers,
      recentArticles,
      recentBookings,
      recentTaxRules,
    };
  }

  async getAdminUsers() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createAdminUser(
    phone: string,
    firstName: string,
    lastName: string,
    role: UserRole = UserRole.ADMIN,
    createdById: string,
  ) {
    return this.prisma.user.create({
      data: {
        phone,
        firstName,
        lastName,
        role,
        phoneVerified: true,
      },
    });
  }

  async updateAdminUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      isActive?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 20,
    action?: string,
    userId?: string,
    entityType?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;

    const [logs, total] = await Promise.all([
      this.prisma.adminAction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.adminAction.count({ where }),
    ]);

    return { data: logs, total, page, limit };
  }

  async logAdminAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValue?: any,
    newValue?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.adminAction.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent,
      },
    });
  }
}
