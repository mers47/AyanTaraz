import { TaxRuleStatus, TaxRuleVersionStatus } from '@prisma/client';

export interface TaxRule {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  description: string | null;
  status: TaxRuleStatus | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxRuleVersion {
  id: string;
  ruleId: string;
  version: number;
  content: string;
  sourceId: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: TaxRuleVersionStatus | string;
  reviewNotes: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  publishedById: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
