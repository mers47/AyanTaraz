import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}
  async getTopics() { return this.prisma.taxTopic.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }); }
  async getRules(topicSlug?: string, page = 1, limit = 20) {
    const skip = (page-1)*limit; const w: any = { status: 'PUBLISHED' };
    if (topicSlug) w.topic = { slug: topicSlug };
    const [d,t] = await Promise.all([
      this.prisma.taxRule.findMany({ where: w, skip, take: limit, include: { topic: true, versions: { where: { status: 'PUBLISHED' }, take: 1, orderBy: { version: 'desc' } } }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.taxRule.count({ where: w }),
    ]);
    return { data: d, total: t, page, limit };
  }
  async getRuleBySlug(slug: string) { return this.prisma.taxRule.findUnique({ where: { slug }, include: { topic: true, versions: { orderBy: { version: 'desc' } } } }); }
}
