import { IsString, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaxRuleVersionStatus } from '@prisma/client';

export class CreateTaxRuleDto {
  @ApiProperty({ description: 'Tax topic ID', example: 'uuid' })
  @IsString()
  topicId: string;

  @ApiProperty({ description: 'Rule name', example: 'Income Tax Rate 2024' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Rule slug', example: 'income-tax-rate-2024' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Rule description', example: 'Tax rate for income...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Initial version content', example: 'Tax rate is 15%...' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Source ID', example: 'uuid' })
  @IsString()
  sourceId: string;

  @ApiProperty({ description: 'Effective from date', example: '2024-01-01' })
  @IsDateString()
  effectiveFrom: string;

  @ApiProperty({ description: 'Effective to date (optional)', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({ description: 'Rule status', enum: TaxRuleVersionStatus, default: TaxRuleVersionStatus.DRAFT })
  @IsOptional()
  @IsEnum(TaxRuleVersionStatus)
  status?: TaxRuleVersionStatus = TaxRuleVersionStatus.DRAFT;
}
