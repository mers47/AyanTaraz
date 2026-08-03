import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConsultationService } from './consultation.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  ConsultationSlot,
  ConsultationBooking,
} from './entities/consultation-booking.entity';

@ApiTags('consultation')
@Controller('consultation')
@Public()
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get('services')
  @ApiOperation({ summary: 'Get all consultation services' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of services' })
  async getServices(
    @Query('active') active: boolean = true,
  ): Promise<any[]> {
    return this.consultationService.getServices(active);
  }

  @Get('services/:slug')
  @ApiOperation({ summary: 'Get consultation service by slug' })
  @ApiResponse({ status: 200, description: 'Service data' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceBySlug(
    @Param('slug') slug: string,
  ): Promise<any> {
    const service = await this.consultationService.getServiceBySlug(slug);
    if (!service) {
      throw new Error('Service not found');
    }
    return service;
  }

  @Get('services/:serviceId/availability')
  @ApiOperation({ summary: 'Get available slots for a service on a date' })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of available slots' })
  async getAvailability(
    @Param('serviceId') serviceId: string,
    @Query('date') date: Date,
  ): Promise<ConsultationSlot[]> {
    return this.consultationService.getAvailability(serviceId, date);
  }

  @Post('bookings')
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: { user?: { id: string } },
  ): Promise<ConsultationBooking> {
    return this.consultationService.createBooking(
      createBookingDto,
      req.user?.id,
    );
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(@Param('id') id: string): Promise<ConsultationBooking> {
    const booking = await this.consultationService.getBooking(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my bookings' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  async getMyBookings(
    @Request() req: { user: { id: string } },
  ): Promise<ConsultationBooking[]> {
    return this.consultationService.getUserBookings(req.user.id);
  }

  @Post('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancelBooking(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ConsultationBooking> {
    return this.consultationService.cancelBooking(id, req.user.id);
  }
}
