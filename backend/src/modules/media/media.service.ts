import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}
  async list(page = 1, limit = 20) { const skip = (page-1)*limit; const [d,t] = await Promise.all([this.prisma.media.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }), this.prisma.media.count()]); return { data: d, total: t, page, limit }; }
}
