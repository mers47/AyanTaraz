import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ConsultationService } from './consultation.service';

@ApiTags('consultation')
@Controller('consultation')
@Public()
export class ConsultationController {
  constructor(private readonly svc: ConsultationService) {}

  @Get('services')
  async getServices() { return this.svc.getServices(); }

  @Get('availability/:sid')
  async getAvailability(@Param('sid') sid: string) { return this.svc.getAvailability(sid); }

  @Post('book')
  async book(@Body() d: { serviceId: string; date: string; time: string; phone: string; name: string; notes?: string }) { return this.svc.book(d); }

  @Get('bookings')
  async getBookings(@Query('phone') phone: string) { return this.svc.getBookings(phone); }
}
