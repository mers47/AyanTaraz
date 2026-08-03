import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly svc: SeoService) {}
  @Get() @Public() async all() { return this.svc.getAll(); }
  @Get(':path') @Public() async get(@Param('path') p: string) { return this.svc.getByPath(p); }
  @Put(':path') async upsert(@Param('path') p: string, @Body() d: any) { return this.svc.upsert(p, d); }
}
