import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';
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

  @Get('booking/:id')
  async getBooking(@Param('id') id: string) { return this.svc.getBooking(id); }

  @Post('upload-receipt')
  async uploadReceipt(@Body() d: { bookingId: string; fileBase64: string; fileName: string }) {
    if (!d.bookingId || !d.fileBase64 || !d.fileName) {
      return { error: 'bookingId, fileBase64, and fileName are required' };
    }
    // Extract the actual base64 data (strip data URI prefix if present)
    const base64Data = d.fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (~5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      return { error: 'File too large (max 5MB)' };
    }

    // Generate unique filename
    const ext = path.extname(d.fileName) || '.jpg';
    const safeName = `receipt_${d.bookingId}_${Date.now()}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const receiptUrl = `/uploads/${safeName}`;
    return this.svc.uploadReceipt(d.bookingId, receiptUrl, d.fileName);
  }
}
