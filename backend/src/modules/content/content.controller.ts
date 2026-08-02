import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ContentService } from './content.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './entities/article.entity';

@ApiTags('content')
@Controller('content')
@Public()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article (Admin only)' })
  @ApiResponse({ status: 201, description: 'Article created' })
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req: { user: { id: string } },
  ): Promise<Article> {
    return this.contentService.createArticle(createArticleDto, req.user.id);
  }

  @Get('articles')
  @ApiOperation({ summary: 'Get all articles (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of articles' })
  async findArticles(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('category') categorySlug?: string,
    @Query('tag') tagSlug?: string,
    @Query('status') status?: string,
  ) {
    return this.contentService.findArticles(page, limit, categorySlug, tagSlug, status);
  }

  @Get('articles/featured')
  @ApiOperation({ summary: 'Get featured articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of featured articles' })
  async findFeaturedArticles(@Query('limit', ParseIntPipe) limit: number = 5) {
    return this.contentService.findFeaturedArticles(limit);
  }

  @Get('articles/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiResponse({ status: 200, description: 'Article data' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findArticleBySlug(@Param('slug') slug: string): Promise<Article> {
    const article = await this.contentService.findArticleBySlug(slug);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  @Get('articles/:id/related')
  @ApiOperation({ summary: 'Get related articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of related articles' })
  async findRelatedArticles(
    @Param('id') id: string,
    @Query('limit', ParseIntPipe) limit: number = 3,
  ) {
    return this.contentService.findRelatedArticles(id, limit);
  }
}
