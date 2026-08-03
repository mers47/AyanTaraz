import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPhone(phone: string) { return this.prisma.user.findUnique({ where: { phone } }); }
  async findById(id: string) { return this.prisma.user.findUnique({ where: { id } }); }
  async update(id: string, data: any) { return this.prisma.user.update({ where: { id }, data }); }
  async deactivate(id: string) { return this.prisma.user.update({ where: { id }, data: { isActive: false } }); }
}
