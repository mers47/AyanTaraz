import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma: PrismaService) {}

  async getServices() { return this.prisma.consultationService.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }); }
  async getAvailability(sid: string) { return this.prisma.consultationAvailability.findMany({ where: { serviceId: sid, isActive: true } }); }

  async book(dto: { serviceId: string; date: string; time: string; phone: string; name: string; notes?: string }) {
    return this.prisma.consultationBooking.create({
      data: {
        serviceId: dto.serviceId, slotId: '00000000-0000-0000-0000-000000000000',
        userId: '00000000-0000-0000-0000-000000000000', phone: dto.phone,
        notes: `${dto.name} | ${dto.date} ${dto.time}${dto.notes ? ' | ' + dto.notes : ''}`, status: 'PENDING',
      },
    });
  }

  async getBookings(phone: string) { return this.prisma.consultationBooking.findMany({ where: { phone }, include: { service: true }, orderBy: { createdAt: 'desc' } }); }
}
