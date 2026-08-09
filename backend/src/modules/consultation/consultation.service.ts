import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parseJalaliDateTime } from '../../common/utils/jalali-date';

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
    if (!dto.date || !dto.time) throw new BadRequestException('تاریخ و زمان نوبت الزامی است');

    // Parse the requested Persian (Jalali) date + time into a real Gregorian Date.
    // dto.date is a fa-IR string like "۱۴۰۵/۰۳/۱۵" and dto.time like "۱۰:۰۰".
    const slotDate = parseJalaliDateTime(dto.date, dto.time);
    if (!slotDate) throw new BadRequestException('تاریخ نوبت نامعتبر است');

    const dayOfWeek = slotDate.getDay();

    // Find or create an availability record matching the requested day of week.
    let availability = await this.prisma.consultationAvailability.findFirst({
      where: { serviceId: dto.serviceId, dayOfWeek, isActive: true },
    });
    if (!availability) {
      availability = await this.prisma.consultationAvailability.create({
        data: {
          serviceId: dto.serviceId,
          dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
        },
      });
    }

    // Slot start/end as Date objects for the requested date/time.
    const slotStart = new Date(slotDate);
    const slotEnd = new Date(slotDate.getTime() + (service.duration || 45) * 60 * 1000);

    // Find or create a slot for the requested exact date + time.
    let slot = await this.prisma.consultationSlot.findFirst({
      where: { availabilityId: availability.id, date: slotDate, startTime: slotStart },
    });
    if (!slot) {
      slot = await this.prisma.consultationSlot.create({
        data: {
          availabilityId: availability.id,
          date: slotDate,
          startTime: slotStart,
          endTime: slotEnd,
          maxBookings: 1,
          isActive: true,
        },
      });
    }

    // Prevent double-booking of the same slot.
    const existingBooking = await this.prisma.consultationBooking.findFirst({
      where: { slotId: slot.id, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (existingBooking) {
      throw new BadRequestException('این نوبت قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.');
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
      include: { service: true, slot: true },
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
