import { Controller, Get, Patch, Param, Body, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser } from '../auth/auth.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { Prisma } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  /** Get own profile — the authenticated user's own data */
  @Get('me')
  async me(@Request() req: AuthenticatedRequest) {
    const user = await this.svc.findById(req.user?.id as string);
    return this.sanitize(user);
  }

  /** Get user by id — only self or admin */
  @Get(':id')
  async get(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    if (req.user?.id !== id && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('دسترسی فقط به پروفایل خودتان مجاز است');
    }
    const user = await this.svc.findById(id);
    return this.sanitize(user);
  }

  /** Update own profile — users can only edit themselves, cannot change role/isActive */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() d: UpdateUserDto, @Request() req: AuthenticatedRequest) {
    if (req.user?.id !== id && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('شما فقط می‌توانید پروفایل خودتان را ویرایش کنید');
    }
    // Strip dangerous fields — only firstName, lastName, avatar allowed
    const safe: Prisma.UserUpdateInput = {};
    if (d.firstName !== undefined) safe.firstName = d.firstName;
    if (d.lastName !== undefined) safe.lastName = d.lastName;
    if (d.avatar !== undefined) safe.avatar = d.avatar;
    const user = await this.svc.update(id, safe);
    return this.sanitize(user);
  }

  /** Remove sensitive fields from response */
  private sanitize(user: { id: string; phone: string; phoneVerified: boolean; firstName: string | null; lastName: string | null; avatar: string | null; role: string; isActive: boolean; createdAt: Date; updatedAt: Date } | null): SafeUser | null {
    if (!user) return null;
    return {
      id: user.id,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
