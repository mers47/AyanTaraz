import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MediaService } from './media.service';

@ApiTags('رسانه')
@Controller('media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'فهرست رسانه‌های آپلود‌شده' })
  async list(@Query('page') p?: number, @Query('limit') l?: number) {
    return this.svc.list(p ? +p : 1, l ? +l : 20);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'دریافت یک رسانه با شناسه' })
  async getById(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'آپلود رسانه جدید (فقط ادمین)' })
  async upload(
    @Body() b: { name: string; fileName: string; fileBase64: string; mimeType?: string; altText?: string; dimensions?: string; description?: string },
    @Request() req: any,
  ) {
    if (!req.user?.id) throw new Error('کاربر احراز هویت نشده');
    return this.svc.upload(b, req.user.id, req.ip);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'حذف رسانه (فقط ادمین)' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.svc.delete(id, req.user?.id, req.ip);
  }
}
