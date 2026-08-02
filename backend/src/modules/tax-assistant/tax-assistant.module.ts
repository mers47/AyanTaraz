import { Module } from '@nestjs/common';
import { TaxAssistantController } from './tax-assistant.controller';
import { TaxAssistantService } from './tax-assistant.service';

@Module({
  controllers: [TaxAssistantController],
  providers: [TaxAssistantService],
  exports: [TaxAssistantService],
})
export class TaxAssistantModule {}
