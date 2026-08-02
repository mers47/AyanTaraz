import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaxAssistantService } from './tax-assistant.service';
import { StartAssistantDto } from './dto/start-assistant.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { AssistantQuestion, AssistantResult } from './entities/assistant-session.entity';

@ApiTags('tax-assistant')
@Controller('tax-assistant')
@Public()
export class TaxAssistantController {
  constructor(private readonly taxAssistantService: TaxAssistantService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new tax assistant session' })
  @ApiResponse({ status: 201, description: 'Session started' })
  async startSession(
    @Body() startAssistantDto: StartAssistantDto,
    @Request() req: { user?: { id: string } },
  ): Promise<{ sessionId: string; question: AssistantQuestion }> {
    return this.taxAssistantService.startSession(
      startAssistantDto,
      req.user?.id,
    );
  }

  @Post('answer')
  @ApiOperation({ summary: 'Answer a question in the session' })
  @ApiResponse({ status: 200, description: 'Next question or result' })
  async answerQuestion(
    @Body() answerQuestionDto: AnswerQuestionDto,
  ): Promise<{
    question: AssistantQuestion | null;
    result: AssistantResult | null;
    completed: boolean;
  }> {
    return this.taxAssistantService.answerQuestion(answerQuestionDto);
  }
}
