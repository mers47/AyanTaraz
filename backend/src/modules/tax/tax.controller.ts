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
import { TaxService } from './tax.service';
import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { TaxRule, TaxRuleVersion } from './entities/tax-rule.entity';

@ApiTags('tax')
@Controller('tax')
@Public()
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tax rule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tax rule created' })
  async createTaxRule(
    @Body() createTaxRuleDto: CreateTaxRuleDto,
    @Request() req: { user: { id: string } },
  ): Promise<TaxRule> {
    return this.taxService.createTaxRule(createTaxRuleDto, req.user.id);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all tax rules (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'topic', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of tax rules' })
  async findTaxRules(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('topic') topicSlug?: string,
    @Query('status') status?: string,
  ) {
    return this.taxService.findTaxRules(page, limit, topicSlug, status);
  }

  @Get('rules/:slug')
  @ApiOperation({ summary: 'Get tax rule by slug' })
  @ApiResponse({ status: 200, description: 'Tax rule data with versions' })
  @ApiResponse({ status: 404, description: 'Tax rule not found' })
  async findTaxRuleBySlug(
    @Param('slug') slug: string,
  ): Promise<TaxRule & { versions: TaxRuleVersion[] }> {
    const rule = await this.taxService.findTaxRuleBySlug(slug);
    if (!rule) {
      throw new Error('Tax rule not found');
    }
    return rule;
  }

  @Get('rules/:topicSlug/effective')
  @ApiOperation({ summary: 'Get effective tax rule for a topic as of a date' })
  @ApiQuery({ name: 'asOf', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Effective tax rule version' })
  @ApiResponse({ status: 404, description: 'No effective rule found' })
  async findEffectiveRule(
    @Param('topicSlug') topicSlug: string,
    @Query('asOf') asOf?: string,
  ): Promise<TaxRuleVersion> {
    const asOfDate = asOf ? new Date(asOf) : new Date();
    const rule = await this.taxService.findEffectiveRule(topicSlug, asOfDate);
    if (!rule) {
      throw new Error('No effective rule found');
    }
    return rule;
  }
}
