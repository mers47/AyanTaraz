import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';

@ApiTags('پنل مدیریت')
@Controller('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'آمار داشبورد' })
  getDashboardStats() { return this.adminService.getDashboardStats(); }

  @Get('recent-activity')
  @ApiOperation({ summary: 'فعالیت‌های اخیر' })
  getRecentActivity(@Query('limit') limit?: number) { return this.adminService.getRecentActivity(limit ? +limit : 10); }

  @Get('users')
  @ApiOperation({ summary: 'لیست کاربران' })
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.adminService.getUsers(page ? +page : 1, limit ? +limit : 20, search);
  }

  @Get('users/admin')
  @ApiOperation({ summary: 'لیست ادمین‌ها' })
  getAdminUsers() { return this.adminService.getAdminUsers(); }

  @Post('users/admin')
  @ApiOperation({ summary: 'ایجاد ادمین جدید (فقط سوپرادمین)' })
  createAdminUser(@Body() body: { phone: string; firstName: string; lastName: string; role?: UserRole }) {
    return this.adminService.createAdminUser(body.phone, body.firstName, body.lastName, body.role);
  }

  @Patch('users/admin/:id')
  @ApiOperation({ summary: 'ویرایش ادمین (فقط سوپرادمین)' })
  updateAdminUser(@Param('id') id: string, @Body() body: { firstName?: string; lastName?: string; role?: UserRole; isActive?: boolean }) {
    return this.adminService.updateAdminUser(id, body);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'گزارش‌های حسابرسی' })
  getAuditLogs(@Query('page') page?: number, @Query('limit') limit?: number, @Query('action') action?: string, @Query('userId') userId?: string, @Query('entityType') entityType?: string) {
    return this.adminService.getAuditLogs(page ? +page : 1, limit ? +limit : 20, action, userId, entityType);
  }
}
