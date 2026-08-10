import { Controller, Get, Patch, Param, Body, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser } from '../auth/auth.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  /** Get own profile — the authenticated user's own data */
  @Get('me')
  async me(@Request() req: any) {
    const user = await this.svc.findById(req.user?.id);
    return this.sanitize(user);
  }

  /** Get user by id — only self or admin */
  @Get(':id')
  async get(@Param('id') id: string, @Request() req: any) {
    if (req.user?.id !== id && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('دسترسی فقط به پروفایل خودتان مجاز است');
    }
    const user = await this.svc.findById(id);
    return this.sanitize(user);
  }

  /** Update own profile — users can only edit themselves, cannot change role/isActive */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() d: UpdateUserDto, @Request() req: any) {
    if (req.user?.id !== id && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('شما فقط می‌توانید پروفایل خودتان را ویرایش کنید');
    }
    // Strip dangerous fields — only firstName, lastName, avatar allowed
    const safe: any = {};
    if (d.firstName !== undefined) safe.firstName = d.firstName;
    if (d.lastName !== undefined) safe.lastName = d.lastName;
    if (d.avatar !== undefined) safe.avatar = d.avatar;
    const user = await this.svc.update(id, safe);
    return this.sanitize(user);
  }

  /** Remove sensitive fields from response */
  private sanitize(user: any): SafeUser | null {
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
