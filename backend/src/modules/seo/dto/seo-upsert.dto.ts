import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Payload for upserting SEO metadata for a given route path.
 *
 * Only the scalar, user-editable fields are exposed — `id`, `createdAt` and
 * `updatedAt` are managed by Prisma and must not be set by the client.
 * Prisma accepts plain scalar values in both `create` and `update` inputs, so
 * the same DTO can be spread into both halves of the `upsert` call safely.
 */
export class SeoUpsertDto {
  @ApiPropertyOptional({ description: 'Page <title>' })
  @IsOptional() @IsString()
  title?: string | null;

  @ApiPropertyOptional({ description: 'Meta description' })
  @IsOptional() @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Canonical URL' })
  @IsOptional() @IsString()
  canonical?: string | null;

  @ApiPropertyOptional({ description: 'Open Graph title' })
  @IsOptional() @IsString()
  ogTitle?: string | null;

  @ApiPropertyOptional({ description: 'Open Graph description' })
  @IsOptional() @IsString()
  ogDescription?: string | null;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  @IsOptional() @IsString()
  ogImage?: string | null;

  @ApiPropertyOptional({ description: 'Open Graph URL' })
  @IsOptional() @IsString()
  ogUrl?: string | null;

  @ApiPropertyOptional({ description: 'Twitter card type' })
  @IsOptional() @IsString()
  twitterCard?: string | null;

  @ApiPropertyOptional({ description: 'Twitter title' })
  @IsOptional() @IsString()
  twitterTitle?: string | null;

  @ApiPropertyOptional({ description: 'Twitter description' })
  @IsOptional() @IsString()
  twitterDescription?: string | null;

  @ApiPropertyOptional({ description: 'Twitter image URL' })
  @IsOptional() @IsString()
  twitterImage?: string | null;

  @ApiPropertyOptional({ description: 'JSON-LD schema markup' })
  @IsOptional() @IsString()
  schemaMarkup?: string | null;

  @ApiPropertyOptional({ description: 'Whether search engines may index the page', default: true })
  @IsOptional() @IsBoolean()
  indexable?: boolean;

  @ApiPropertyOptional({ description: 'Whether search engines may follow links', default: true })
  @IsOptional() @IsBoolean()
  followLinks?: boolean;
}
