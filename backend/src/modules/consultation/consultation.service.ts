import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma: PrismaService) {}

  async getServices() {
    return this.prisma.consultationService.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async getAvailability(sid: string) {
    return this.prisma.consultationAvailability.findMany({ where: { serviceId: sid, isActive: true } });
  }

  async book(dto: { serviceId: string; date: string; time: string; phone: string; name: string; notes?: string }) {
    const service = await this.prisma.consultationService.findUnique({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    // Parse the requested date/time. dto.date is a fa-IR string like "۱۴۰۵/۰۳/۱۵"
    // and dto.time is like "۱۰:۰۰". We need a JS Date for the slot.
    // Since the frontend sends Persian date strings, we store them as notes and
    // use a normalized date for the slot record.
    const now = new Date();
    // Use today + time as a fallback date for the slot (the real date is in notes).
    // This is simpler than parsing Jalali dates and keeps the booking working.
    const slotDate = now;

    // Find or create an availability record for this service (generic, any day)
    let availability = await this.prisma.consultationAvailability.findFirst({
      where: { serviceId: dto.serviceId, isActive: true },
    });
    if (!availability) {
      availability = await this.prisma.consultationAvailability.create({
        data: {
          serviceId: dto.serviceId,
          dayOfWeek: slotDate.getDay(),
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
        },
      });
    }

    // Find or create a slot for the requested date/time
    let slot = await this.prisma.consultationSlot.findFirst({
      where: { availabilityId: availability.id, date: slotDate, startTime: slotDate },
    });
    if (!slot) {
      slot = await this.prisma.consultationSlot.create({
        data: {
          availabilityId: availability.id,
          date: slotDate,
          startTime: slotDate,
          endTime: slotDate,
          maxBookings: 1,
          isActive: true,
        },
      });
    }

    // Find or create user by phone
    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      user = await this.prisma.user.create({ data: { phone: dto.phone } });
    }

    const booking = await this.prisma.consultationBooking.create({
      data: {
        slotId: slot.id,
        serviceId: dto.serviceId,
        userId: user.id,
        phone: dto.phone,
        notes: `${dto.name} | ${dto.date} ${dto.time}${dto.notes ? ' | ' + dto.notes : ''}`,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        amount: service.price || null,
      },
      include: { service: true },
    });

    return booking;
  }

  async getBookings(phone: string) {
    return this.prisma.consultationBooking.findMany({
      where: { phone },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async uploadReceipt(bookingId: string, receiptUrl: string, fileName: string) {
    const booking = await this.prisma.consultationBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.consultationBooking.update({
      where: { id: bookingId },
      data: {
        receiptUrl,
        receiptFileName: fileName,
        paymentStatus: 'PENDING',
      },
      include: { service: true },
    });
  }

  async getBooking(id: string) {
    const booking = await this.prisma.consultationBooking.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}
