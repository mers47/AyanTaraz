import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly svc: ContentService) {}

  @Get() @Public() async all() { return this.svc.getAll(); }
  @Get(':key') @Public() async one(@Param('key') k: string) { return this.svc.get(k) || { error: 'not found' }; }
  @Put(':key') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) async save(@Param('key') k: string, @Body() d: any) { return this.svc.save(k, d); }
  @Post('autofill') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) async fill() { return this.svc.autoFill(); }
}
