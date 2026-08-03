import { Controller, Get, Query } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}
  @Get() async list(@Query('page') p?: number, @Query('limit') l?: number) { return this.svc.list(p?+p:1, l?+l:20); }
}
