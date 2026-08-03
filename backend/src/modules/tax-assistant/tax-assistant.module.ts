import { Module } from '@nestjs/common';
import { TaxAssistantController } from './tax-assistant.controller';
import { TaxAssistantService } from './tax-assistant.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TaxAssistantController],
  providers: [TaxAssistantService, PrismaService],
  exports: [TaxAssistantService],
})
export class TaxAssistantModule {}
