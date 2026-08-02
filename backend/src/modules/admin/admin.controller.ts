import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('recent-activity')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ status: 200, description: 'Recent activity' })
  async getRecentActivity(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.adminService.getRecentActivity(limit);
  }

  @Get('users/admin')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'List of admin users' })
  async getAdminUsers() {
    return this.adminService.getAdminUsers();
  }

  @Post('users/admin')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new admin user (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin user created' })
  async createAdminUser(
    @Body() body: { phone: string; firstName: string; lastName: string; role?: UserRole },
    @Request() req: { user: { id: string } },
  ) {
    return this.adminService.createAdminUser(
      body.phone,
      body.firstName,
      body.lastName,
      body.role || UserRole.ADMIN,
      req.user.id,
    );
  }

  @Post('users/admin/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admin user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin user updated' })
  async updateAdminUser(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; role?: UserRole; isActive?: boolean },
  ) {
    return this.adminService.updateAdminUser(id, body);
  }

  @Get('audit-logs')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs' })
  async getAuditLogs(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.adminService.getAuditLogs(
      page,
      limit,
      action,
      userId,
      entityType,
    );
  }
}
