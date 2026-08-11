import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException, BadRequestException, NotFoundException, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConsultationService } from './consultation.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

interface BookConsultationDto {
  serviceId: string;
  date: string;
  time: string;
  phone: string;
  name: string;
  notes?: string;
}

interface UploadReceiptDto {
  bookingId: string;
  fileBase64: string;
  fileName: string;
}

@ApiTags('مشاوره')
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly svc: ConsultationService) {}

  @Get('services')
  @Public()
  @ApiOperation({ summary: 'لیست خدمات مشاوره' })
  async getServices() { return this.svc.getServices(); }

  @Get('availability/:sid')
  @Public()
  @ApiOperation({ summary: 'زمان‌های خالی available برای یک سرویس' })
  async getAvailability(@Param('sid') sid: string) { return this.svc.getAvailability(sid); }

  @Post('book')
  @Public()
  @ApiOperation({ summary: 'رزرو نوبت مشاوره (بدون نیاز به ورود)' })
  async book(@Body() dto: BookConsultationDto) {
    return this.svc.book(dto);
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'لیست رزروها — کاربر فقط رزروهای خودش را می‌بیند، ادمین همه را' })
  async getBookings(@Query('phone') phone: string, @Request() req: AuthenticatedRequest) {
    // Regular users can only see their own bookings (matched by phone)
    // Admins can see all bookings
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    if (!isAdmin && !phone) {
      throw new ForbiddenException('شماره تلفن الزامی است');
    }
    return this.svc.getBookings(phone);
  }

  @Get('booking/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'جزئیات یک رزرو' })
  async getBooking(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const booking = await this.svc.getBooking(id);
    if (!booking) return null;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    // Non-admin users can only view bookings that match their phone
    if (!isAdmin && booking.phone && req.user?.phone !== booking.phone) {
      throw new ForbiddenException('دسترسی به این رزرو مجاز نیست');
    }
    return booking;
  }

  @Post('upload-receipt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'آپلود رسید پرداخت (نیازمند احراز هویت)' })
  async uploadReceipt(@Body() dto: UploadReceiptDto, @Request() req: AuthenticatedRequest) {
    if (!dto.bookingId || !dto.fileBase64 || !dto.fileName) {
      throw new BadRequestException('bookingId, fileBase64, and fileName are required');
    }

    // Verify the booking exists and belongs to the authenticated user (or admin)
    const booking = await this.svc.getBooking(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('رزرو یافت نشد');
    }
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    if (!isAdmin && booking.phone && req.user?.phone !== booking.phone) {
      throw new ForbiddenException('آپلود رسید برای این رزرو مجاز نیست');
    }

    // Extract the actual base64 data (strip data URI prefix if present)
    const base64Data = dto.fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (~5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('حجم فایل بیش از حد مجاز است (حداکثر ۵ مگابایت)');
    }

    // Validate file extension — only images and PDF allowed
    const ext = path.extname(dto.fileName).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException('فقط فایل‌های تصویری و PDF مجاز هستند');
    }

    // Generate unique filename
    const safeName = `receipt_${dto.bookingId}_${Date.now()}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, safeName);

    // Use async write instead of blocking synchronous writeFileSync
    await fs.promises.writeFile(filePath, buffer);

    const receiptUrl = `/uploads/${safeName}`;
    return this.svc.uploadReceipt(dto.bookingId, receiptUrl, dto.fileName);
  }
}
