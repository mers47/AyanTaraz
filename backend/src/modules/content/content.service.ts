import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async createArticle(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<Article> {
    // Check if slug already exists
    const existingArticle = await this.prisma.article.findUnique({
      where: { slug: createArticleDto.slug },
    });

    if (existingArticle) {
      throw new ConflictException('Article with this slug already exists');
    }

    // Create article with related tags
    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        slug: createArticleDto.slug,
        excerpt: createArticleDto.excerpt,
        content: createArticleDto.content,
        status: createArticleDto.status,
        featuredImage: createArticleDto.featuredImage,
        metaTitle: createArticleDto.metaTitle,
        metaDescription: createArticleDto.metaDescription,
        categoryId: createArticleDto.categoryId,
        authorId,
        publishedAt: createArticleDto.status === 'PUBLISHED' ? new Date() : null,
        tags: createArticleDto.tagIds
          ? { connect: createArticleDto.tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        category: true,
        tags: true,
        author: true,
      },
    });

    // Handle related articles
    if (createArticleDto.relatedArticleIds && createArticleDto.relatedArticleIds.length > 0) {
      await this.prisma.articleRelation.createMany({
        data: createArticleDto.relatedArticleIds.map((relatedId, index) => ({
          fromArticleId: article.id,
          toArticleId: relatedId,
          sortOrder: index,
        })),
      });
    }

    return this.mapToArticleEntity(article);
  }

  async findArticleBySlug(slug: string): Promise<Article | null> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        author: true,
        relatedArticles: {
          include: {
            toArticle: true,
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    return this.mapToArticleEntity(article);
  }

  async findArticles(
    page: number = 1,
    limit: number = 10,
    categorySlug?: string,
    tagSlug?: string,
    status?: string,
  ): Promise<{ data: Article[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }
    if (tagSlug) {
      const tag = await this.prisma.tag.findUnique({
        where: { slug: tagSlug },
      });
      if (tag) {
        where.tags = { some: { id: tag.id } };
      }
    }
    if (status) {
      where.status = status as any;
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          tags: true,
          author: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles.map((article) => this.mapToArticleEntity(article)),
      total,
      page,
      limit,
    };
  }

  async findFeaturedArticles(limit: number = 5): Promise<Article[]> {
    const articles = await this.prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        featuredImage: { not: null },
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        tags: true,
        author: true,
      },
    });

    return articles.map((article) => this.mapToArticleEntity(article));
  }

  async findRelatedArticles(
    articleId: string,
    limit: number = 3,
  ): Promise<Article[]> {
    const relations = await this.prisma.articleRelation.findMany({
      where: {
        fromArticleId: articleId,
      },
      include: {
        toArticle: {
          include: {
            category: true,
            tags: true,
            author: true,
          },
        },
      },
      take: limit,
    });

    return relations.map((relation) => this.mapToArticleEntity(relation.toArticle));
  }

  private mapToArticleEntity(article: any): Article {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      status: article.status as any,
      featuredImage: article.featuredImage,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      canonicalUrl: article.canonicalUrl,
      categoryId: article.categoryId,
      authorId: article.authorId,
    };
  }
}
