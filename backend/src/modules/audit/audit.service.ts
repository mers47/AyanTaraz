import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async log(userId: string, action: string, entityType: string, entityId: string, oldValue?: any, newValue?: any, ip?: string) {
    return this.prisma.adminAction.create({ data: { userId, action, entityType, entityId, oldValue: oldValue ? JSON.stringify(oldValue) : null, newValue: newValue ? JSON.stringify(newValue) : null, ipAddress: ip } });
  }
}
