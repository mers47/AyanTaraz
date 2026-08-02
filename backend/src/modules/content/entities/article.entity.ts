import { ContentStatus } from '@prisma/client';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ContentStatus;
  featuredImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  categoryId: string;
  authorId: string;
}
