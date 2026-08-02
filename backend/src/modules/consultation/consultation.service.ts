import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OTPService } from '../auth/otp.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  ConsultationService,
  ConsultationSlot,
  ConsultationBooking,
} from './entities/consultation-booking.entity';

@Injectable()
export class ConsultationService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: any,
    private readonly prisma: PrismaService,
    private readonly otpService: OTPService,
  ) {}

  private readonly BOOKING_LOCK_PREFIX = 'booking_lock:';
  private readonly BOOKING_LOCK_EXPIRY = 300; // 5 minutes

  async getServices(
    isActive: boolean = true,
  ): Promise<ConsultationService[]> {
    const services = await this.prisma.consultationService.findMany({
      where: { isActive },
      orderBy: { sortOrder: 'asc' },
    });

    return services.map((service) => this.mapToServiceEntity(service));
  }

  async getServiceBySlug(slug: string): Promise<ConsultationService | null> {
    const service = await this.prisma.consultationService.findUnique({
      where: { slug },
    });

    if (!service) {
      return null;
    }

    return this.mapToServiceEntity(service);
  }

  async getAvailability(
    serviceId: string,
    date: Date,
  ): Promise<ConsultationSlot[]> {
    const availability = await this.prisma.consultationAvailability.findMany({
      where: {
        serviceId,
        isActive: true,
        dayOfWeek: date.getDay(),
      },
      include: {
        slots: {
          where: {
            date: { gte: date },
            isActive: true,
          },
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'PENDING'] },
              },
            },
            blockedPeriods: {
              where: {
                OR: [
                  { startDate: { lte: date }, endDate: { gte: date } },
                  { startDate: { gte: date } },
                ],
              },
            },
          },
        },
      },
    });

    const slots: ConsultationSlot[] = [];
    for (const avail of availability) {
      for (const slot of avail.slots) {
        const isBooked = slot.bookings.length >= slot.maxBookings;
        const isBlocked = slot.blockedPeriods.length > 0;

        if (!isBooked && !isBlocked) {
          slots.push(this.mapToSlotEntity(slot));
        }
      }
    }

    return slots;
  }

  async createBooking(
    createBookingDto: CreateBookingDto,
    userId?: string,
  ): Promise<ConsultationBooking> {
    // Verify OTP
    await this.otpService.verifyOTP(
      createBookingDto.phone,
      createBookingDto.otpCode,
      'BOOKING_VERIFICATION',
    );

    // Get slot with lock to prevent concurrent bookings
    const lockKey = `${this.BOOKING_LOCK_PREFIX}${createBookingDto.slotId}`;
    const lock = await this.redis.setnx(lockKey, 'locked');

    if (!lock) {
      throw new ConflictException(
        'This slot is being booked by another user. Please try again.',
      );
    }

    await this.redis.expire(lockKey, this.BOOKING_LOCK_EXPIRY);

    try {
      // Get slot with current bookings
      const slot = await this.prisma.consultationSlot.findUnique({
        where: { id: createBookingDto.slotId },
        include: {
          bookings: {
            where: {
              status: { in: ['CONFIRMED', 'PENDING'] },
            },
          },
          blockedPeriods: {
            where: {
              OR: [
                {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                },
                { startDate: { gte: new Date() } },
              ],
            },
          },
        },
      });

      if (!slot) {
        throw new NotFoundException('Slot not found');
      }

      if (slot.bookings.length >= slot.maxBookings) {
        throw new ConflictException('This slot is already fully booked');
      }

      if (slot.blockedPeriods.length > 0) {
        throw new ConflictException('This slot is not available');
      }

      // Create booking
      const booking = await this.prisma.consultationBooking.create({
        data: {
          slotId: createBookingDto.slotId,
          serviceId: createBookingDto.serviceId,
          userId: userId || null,
          phone: createBookingDto.phone,
          otpVerified: true,
          status: 'CONFIRMED',
          notes: createBookingDto.notes,
        },
        include: {
          slot: true,
          service: true,
        },
      });

      return this.mapToBookingEntity(booking);
    } finally {
      // Release lock
      await this.redis.del(lockKey);
    }
  }

  async getBooking(id: string): Promise<ConsultationBooking | null> {
    const booking = await this.prisma.consultationBooking.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            availability: true,
          },
        },
        service: true,
        user: true,
      },
    });

    if (!booking) {
      return null;
    }

    return this.mapToBookingEntity(booking);
  }

  async getUserBookings(userId: string): Promise<ConsultationBooking[]> {
    const bookings = await this.prisma.consultationBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        slot: true,
        service: true,
      },
    });

    return bookings.map((booking) => this.mapToBookingEntity(booking));
  }

  async cancelBooking(id: string, userId: string): Promise<ConsultationBooking> {
    const booking = await this.prisma.consultationBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ConflictException('You can only cancel your own bookings');
    }

    const cancelledBooking = await this.prisma.consultationBooking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        slot: true,
        service: true,
      },
    });

    return this.mapToBookingEntity(cancelledBooking);
  }

  private mapToServiceEntity(service: any): ConsultationService {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      duration: service.duration,
      price: service.price,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  private mapToSlotEntity(slot: any): ConsultationSlot {
    return {
      id: slot.id,
      availabilityId: slot.availabilityId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings,
      isActive: slot.isActive,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    };
  }

  private mapToBookingEntity(booking: any): ConsultationBooking {
    return {
      id: booking.id,
      slotId: booking.slotId,
      serviceId: booking.serviceId,
      userId: booking.userId,
      phone: booking.phone,
      otpVerified: booking.otpVerified,
      status: booking.status as any,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
