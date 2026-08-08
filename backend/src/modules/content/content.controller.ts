import { Controller, Get, Put, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly svc: ContentService) {}

  // ─── Public content listings (articles / videos / minibooks) ───
  @Get('articles') @Public() @ApiOperation({ summary: 'لیست مقالات منتشر شده' })
  async articles(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) {
    return this.svc.getPublishedArticles(p, l, s);
  }
  @Get('articles/:slug') @Public() @ApiOperation({ summary: 'جزئیات مقاله' })
  async article(@Param('slug') slug: string) { return this.svc.getArticleBySlug(slug); }

  @Get('videos') @Public() @ApiOperation({ summary: 'لیست ویدیوهای منتشر شده' })
  async videos(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) {
    return this.svc.getPublishedVideos(p, l, s);
  }
  @Get('videos/:slug') @Public() @ApiOperation({ summary: 'جزئیات ویدیو' })
  async video(@Param('slug') slug: string) { return this.svc.getVideoBySlug(slug); }

  @Get('minibooks') @Public() @ApiOperation({ summary: 'لیست مینی‌بوک‌های منتشر شده' })
  async minibooks(@Query('page') p?: number, @Query('limit') l?: number, @Query('search') s?: string) {
    return this.svc.getPublishedMiniBooks(p, l, s);
  }
  @Get('minibooks/:slug') @Public() @ApiOperation({ summary: 'جزئیات مینی‌بوک' })
  async minibook(@Param('slug') slug: string) { return this.svc.getMiniBookBySlug(slug); }

  @Get('categories') @Public() @ApiOperation({ summary: 'لیست دسته‌بندی‌ها' })
  async categories() { return this.svc.getCategories(); }

  // ─── Existing key-value content (tax laws) ───
  @Get() @Public() async all() { return this.svc.getAll(); }
  @Get(':key') @Public() async one(@Param('key') k: string) { return this.svc.get(k) || { error: 'not found' }; }
  @Put(':key') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) async save(@Param('key') k: string, @Body() d: any) { return this.svc.save(k, d); }
  @Post('autofill') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) async fill() { return this.svc.autoFill(); }
}
