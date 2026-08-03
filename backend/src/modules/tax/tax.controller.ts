import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { TaxService } from './tax.service';

@Controller('tax')
@Public()
export class TaxController {
  constructor(private readonly svc: TaxService) {}
  @Get('topics') async topics() { return this.svc.getTopics(); }
  @Get('rules') async rules(@Query('topic') t?: string, @Query('page') p?: number, @Query('limit') l?: number) { return this.svc.getRules(t, p?+p:1, l?+l:20); }
  @Get('rules/:slug') async rule(@Param('slug') s: string) { return this.svc.getRuleBySlug(s); }
}
