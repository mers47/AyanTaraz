import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}
  async getByPath(path: string) { return this.prisma.sEOConfig.findUnique({ where: { path } }); }
  async getAll() { return this.prisma.sEOConfig.findMany(); }
  async upsert(path: string, data: any) { return this.prisma.sEOConfig.upsert({ where: { path }, create: { path, ...data }, update: data }); }
}
