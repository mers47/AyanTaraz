import { Controller, Post, Get, Delete, Param, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { TaxAssistantService } from './tax-assistant.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

interface StartSessionDto {
  questionId?: string;
  answers?: Record<string, string>;
}

@ApiTags('دستیار مالیاتی')
@Controller('tax-assistant')
@Public()
export class TaxAssistantController {
  constructor(private readonly taxAssistantService: TaxAssistantService) {}

  @Post('start')
  @ApiOperation({ summary: 'شروع یک نشست جدید دستیار مالیاتی' })
  @ApiResponse({ status: 201, description: 'نشست با موفقیت ایجاد شد' })
  async startSession(@Body() body: StartSessionDto, @Request() req: AuthenticatedRequest) {
    return this.taxAssistantService.startSession(body.questionId, body.answers, req.user?.id);
  }

  @Post('answer')
  @ApiOperation({ summary: 'پاسخ به سوال و دریافت سوال بعدی یا نتیجه' })
  @ApiResponse({ status: 200, description: 'نتیجه یا سوال بعدی' })
  async answerQuestion(@Body() body: { sessionId: string; questionId: string; optionId: string; optionValue: string }) {
    return this.taxAssistantService.answerQuestion(body.sessionId, body.questionId, body.optionId, body.optionValue);
  }

  @Get('session/:id')
  @ApiOperation({ summary: 'دریافت وضعیت نشست و پاسخ‌های ثبت‌شده' })
  @ApiResponse({ status: 200, description: 'اطلاعات نشست' })
  async getSession(@Param('id') id: string) {
    return this.taxAssistantService.getSession(id);
  }

  @Delete('session/:id')
  @ApiOperation({ summary: 'حذف و بازنشانی نشست دستیار مالیاتی' })
  @ApiResponse({ status: 200, description: 'نشست حذف شد' })
  async deleteSession(@Param('id') id: string) {
    return this.taxAssistantService.deleteSession(id);
  }
}
