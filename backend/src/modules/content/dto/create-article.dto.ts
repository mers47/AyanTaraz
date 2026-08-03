import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({ description: 'Article title', example: 'Tax Deductions Guide' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Article slug', example: 'tax-deductions-guide' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Article excerpt', example: 'A comprehensive guide...', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: 'Article content (HTML or Markdown)', example: '<p>Content...</p>' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Featured image URL', example: 'https://...', required: false })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ description: 'Tag IDs', example: ['uuid1', 'uuid2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ description: 'SEO meta title', example: 'Tax Deductions Guide | Ayan Taraz', required: false })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({ description: 'SEO meta description', example: 'Learn about tax deductions...', required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ description: 'Content status', enum: ContentStatus, default: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.DRAFT;

  @ApiProperty({ description: 'Related article IDs', example: ['uuid1', 'uuid2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedArticleIds?: string[];
}
