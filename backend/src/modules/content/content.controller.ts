import { Controller, Get, Put, Post, Param, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ContentService } from './content.service';

@Controller('content')
@Public()
export class ContentController {
  constructor(private readonly svc: ContentService) {}

  @Get() async all() { return this.svc.getAll(); }
  @Get(':key') async one(@Param('key') k: string) { return this.svc.get(k) || { error: 'not found' }; }
  @Put(':key') async save(@Param('key') k: string, @Body() d: any) { return this.svc.save(k, d); }
  @Post('autofill') async fill() { return this.svc.autoFill(); }
}
