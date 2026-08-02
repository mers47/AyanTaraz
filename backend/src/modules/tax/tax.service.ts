import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { TaxRule, TaxRuleVersion } from './entities/tax-rule.entity';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async createTaxRule(
    createTaxRuleDto: CreateTaxRuleDto,
    createdById: string,
  ): Promise<TaxRule> {
    // Check if slug already exists
    const existingRule = await this.prisma.taxRule.findUnique({
      where: { slug: createTaxRuleDto.slug },
    });

    if (existingRule) {
      throw new ConflictException('Tax rule with this slug already exists');
    }

    // Create the tax rule
    const rule = await this.prisma.taxRule.create({
      data: {
        topicId: createTaxRuleDto.topicId,
        name: createTaxRuleDto.name,
        slug: createTaxRuleDto.slug,
        description: createTaxRuleDto.description,
        status: createTaxRuleDto.status,
      },
    });

    // Create the first version
    await this.prisma.taxRuleVersion.create({
      data: {
        ruleId: rule.id,
        version: 1,
        content: createTaxRuleDto.content,
        sourceId: createTaxRuleDto.sourceId,
        effectiveFrom: new Date(createTaxRuleDto.effectiveFrom),
        effectiveTo: createTaxRuleDto.effectiveTo
          ? new Date(createTaxRuleDto.effectiveTo)
          : null,
        status: createTaxRuleDto.status,
        publishedById: createdById,
        publishedAt: new Date(),
      },
    });

    return this.mapToTaxRuleEntity(rule);
  }

  async findTaxRuleBySlug(slug: string): Promise<TaxRule & { versions: TaxRuleVersion[] } | null> {
    const rule = await this.prisma.taxRule.findUnique({
      where: { slug },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          include: {
            source: true,
            reviewedBy: true,
            publishedBy: true,
          },
        },
        topic: true,
      },
    });

    if (!rule) {
      return null;
    }

    return {
      ...this.mapToTaxRuleEntity(rule),
      versions: rule.versions.map((v) => this.mapToTaxRuleVersionEntity(v)),
    };
  }

  async findTaxRules(
    page: number = 1,
    limit: number = 10,
    topicSlug?: string,
    status?: string,
  ): Promise<{ data: TaxRule[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (topicSlug) {
      const topic = await this.prisma.taxTopic.findUnique({
        where: { slug: topicSlug },
      });
      if (topic) {
        where.topicId = topic.id;
      }
    }
    if (status) {
      where.status = status as any;
    }

    const [rules, total] = await Promise.all([
      this.prisma.taxRule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          topic: true,
        },
      }),
      this.prisma.taxRule.count({ where }),
    ]);

    return {
      data: rules.map((rule) => this.mapToTaxRuleEntity(rule)),
      total,
      page,
      limit,
    };
  }

  async findEffectiveRule(
    topicSlug: string,
    asOfDate: Date = new Date(),
  ): Promise<TaxRuleVersion | null> {
    const topic = await this.prisma.taxTopic.findUnique({
      where: { slug: topicSlug },
    });

    if (!topic) {
      return null;
    }

    const version = await this.prisma.taxRuleVersion.findFirst({
      where: {
        rule: {
          topicId: topic.id,
        },
        status: 'PUBLISHED',
        effectiveFrom: { lte: asOfDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: asOfDate } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
      include: {
        rule: true,
        source: true,
      },
    });

    if (!version) {
      return null;
    }

    return this.mapToTaxRuleVersionEntity(version);
  }

  private mapToTaxRuleEntity(rule: any): TaxRule {
    return {
      id: rule.id,
      topicId: rule.topicId,
      name: rule.name,
      slug: rule.slug,
      description: rule.description,
      status: rule.status as any,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  private mapToTaxRuleVersionEntity(version: any): TaxRuleVersion {
    return {
      id: version.id,
      ruleId: version.ruleId,
      version: version.version,
      content: version.content,
      sourceId: version.sourceId,
      effectiveFrom: version.effectiveFrom,
      effectiveTo: version.effectiveTo,
      status: version.status,
      reviewNotes: version.reviewNotes,
      reviewedById: version.reviewedById,
      reviewedAt: version.reviewedAt,
      publishedById: version.publishedById,
      publishedAt: version.publishedAt,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    };
  }
}
