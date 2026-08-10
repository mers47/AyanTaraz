import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MediaService } from './media.service';

@ApiTags('رسانه')
@Controller('media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'فهرست رسانه‌های آپلود‌شده' })
  async list(@Query('page') p?: number, @Query('limit') l?: number) {
    return this.svc.list(p ? +p : 1, l ? +l : 20);
  }
}
