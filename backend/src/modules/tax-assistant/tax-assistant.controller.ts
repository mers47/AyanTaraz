import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { TaxAssistantService } from './tax-assistant.service';

@ApiTags('دستیار مالیاتی')
@Controller('tax-assistant')
@Public()
export class TaxAssistantController {
  constructor(private readonly taxAssistantService: TaxAssistantService) {}

  @Post('start')
  @ApiOperation({ summary: 'شروع یک نشست جدید دستیار مالیاتی' })
  @ApiResponse({ status: 201, description: 'نشست با موفقیت ایجاد شد' })
  async startSession(@Body() body: { questionId?: string; answers?: Record<string, string> }, @Request() req: any) {
    return this.taxAssistantService.startSession(body.questionId, body.answers, req.user?.id);
  }

  @Post('answer')
  @ApiOperation({ summary: 'پاسخ به سوال و دریافت سوال بعدی یا نتیجه' })
  @ApiResponse({ status: 200, description: 'نتیجه یا سوال بعدی' })
  async answerQuestion(@Body() body: { sessionId: string; questionId: string; optionId: string; optionValue: string }) {
    return this.taxAssistantService.answerQuestion(body.sessionId, body.questionId, body.optionId, body.optionValue);
  }
}
