import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SeoService } from './seo.service';

@ApiTags('سئو')
@Controller('seo')
export class SeoController {
  constructor(private readonly svc: SeoService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'لیست متادیتای سئو' })
  async all() { return this.svc.getAll(); }

  @Get(':path')
  @Public()
  @ApiOperation({ summary: 'دریافت متادیتای سئو برای مسیر مشخص' })
  async get(@Param('path') p: string) { return this.svc.getByPath(p); }

  @Put(':path')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'به‌روزرسانی متادیتای سئو (فقط ادمین)' })
  async upsert(@Param('path') p: string, @Body() d: any) { return this.svc.upsert(p, d); }
}
