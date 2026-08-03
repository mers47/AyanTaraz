import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('dashboard') async dash() { return this.svc.getDashboardStats(); }
  @Get('recent-activity') async rec(@Query('limit') l?: number) { return this.svc.getRecentActivity(l ? +l : 10); }
  @Get('users') async users(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) { return this.svc.getUsers(p ? +p : 1, l ? +l : 20, s); }
  @Get('users/admin') async admins() { return this.svc.getAdminUsers(); }
  @Post('users/admin') async ca(@Body() b: { phone: string; firstName: string; lastName: string; role?: UserRole }) { return this.svc.createAdminUser(b.phone, b.firstName, b.lastName, b.role); }
  @Patch('users/admin/:id') async ua(@Param('id') id: string, @Body() b: { firstName?: string; lastName?: string; role?: UserRole; isActive?: boolean }) { return this.svc.updateAdminUser(id, b); }
  @Get('audit-logs') async al(@Query('page') p?: number, @Query('limit') l?: number, @Query('action') a?: string, @Query('userId') u?: string, @Query('entityType') e?: string) { return this.svc.getAuditLogs(p ? +p : 1, l ? +l : 20, a, u, e); }
}
