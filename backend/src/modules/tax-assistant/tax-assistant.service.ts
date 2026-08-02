import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { StartAssistantDto } from './dto/start-assistant.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { AssistantSession, AssistantQuestion, AssistantResult } from './entities/assistant-session.entity';

@Injectable()
export class TaxAssistantService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  private readonly SESSION_PREFIX = 'tax_assistant_session:';
  private readonly SESSION_EXPIRY = 86400; // 24 hours

  async startSession(
    startAssistantDto: StartAssistantDto,
    userId?: string,
  ): Promise<{ sessionId: string; question: AssistantQuestion }> {
    const sessionId = uuidv4();

    // Get the first question
    let currentQuestionId = startAssistantDto.questionId;
    if (!currentQuestionId) {
      const firstQuestion = await this.prisma.taxQuestion.findFirst({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      if (!firstQuestion) {
        throw new NotFoundException('No questions available for tax assistant');
      }
      currentQuestionId = firstQuestion.id;
    }

    // Get the question with options
    const question = await this.getQuestionWithOptions(currentQuestionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Create session
    const session: AssistantSession = {
      id: sessionId,
      userId: userId || null,
      currentQuestionId,
      answers: startAssistantDto.answers || {},
      result: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in Redis
    await this.redis.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      this.SESSION_EXPIRY,
      JSON.stringify(session),
    );

    return { sessionId, question };
  }

  async answerQuestion(
    answerQuestionDto: AnswerQuestionDto,
  ): Promise<{ question: AssistantQuestion | null; result: AssistantResult | null; completed: boolean }> {
    // Get session
    const sessionKey = `${this.SESSION_PREFIX}${answerQuestionDto.sessionId}`;
    const sessionData = await this.redis.get(sessionKey);

    if (!sessionData) {
      throw new NotFoundException('Session not found or expired');
    }

    const session: AssistantSession = JSON.parse(sessionData);

    // Store answer
    session.answers[answerQuestionDto.questionId] = answerQuestionDto.optionValue;
    session.updatedAt = new Date();

    // Find the flow based on the answer
    const flow = await this.prisma.taxQuestionFlow.findFirst({
      where: {
        fromQuestionId: answerQuestionDto.questionId,
        optionId: answerQuestionDto.optionId,
      },
    });

    let nextQuestionId: string | null = null;
    let result: AssistantResult | null = null;
    let completed = false;

    if (flow) {
      // Check if flow has a condition (for dynamic routing)
      if (flow.condition) {
        try {
          const condition = JSON.parse(flow.condition);
          // Simple condition evaluation (extend for complex logic)
          if (condition.field && condition.op && condition.value) {
            const answerValue = session.answers[condition.field];
            if (answerValue) {
              const shouldFollow = this.evaluateCondition(
                answerValue,
                condition.op,
                condition.value,
              );
              if (shouldFollow) {
                nextQuestionId = flow.toQuestionId;
              }
            }
          }
        } catch (e) {
          // If condition evaluation fails, follow the flow
          nextQuestionId = flow.toQuestionId;
        }
      } else {
        nextQuestionId = flow.toQuestionId;
      }
    }

    // If no next question, check if we have a result
    if (!nextQuestionId) {
      // Find result based on answers
      result = await this.determineResult(session.answers);
      completed = true;
    } else {
      // Get the next question
      const nextQuestion = await this.getQuestionWithOptions(nextQuestionId);
      if (!nextQuestion) {
        // If next question not found, try to determine result
        result = await this.determineResult(session.answers);
        completed = true;
      } else {
        session.currentQuestionId = nextQuestionId;
      }
    }

    // Update session
    session.result = result;
    await this.redis.setex(
      sessionKey,
      this.SESSION_EXPIRY,
      JSON.stringify(session),
    );

    return {
      question: nextQuestionId ? await this.getQuestionWithOptions(nextQuestionId) : null,
      result,
      completed,
    };
  }

  async getQuestionWithOptions(questionId: string): Promise<AssistantQuestion | null> {
    const question = await this.prisma.taxQuestion.findUnique({
      where: { id: questionId, isActive: true },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!question) {
      return null;
    }

    return {
      id: question.id,
      question: question.question,
      description: question.description,
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label,
        value: option.value,
      })),
    };
  }

  private async determineResult(answers: Record<string, string>): Promise<AssistantResult | null> {
    // This is a simplified implementation
    // In production, implement a more sophisticated decision engine
    // based on the answers and tax rules

    // For now, return a default result
    const defaultResult = await this.prisma.taxAssistantResult.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!defaultResult) {
      return null;
    }

    return {
      id: defaultResult.id,
      name: defaultResult.name,
      title: defaultResult.title,
      description: defaultResult.description,
      ruleIds: defaultResult.ruleIds as string[],
      action: defaultResult.action,
      severity: defaultResult.severity,
    };
  }

  private evaluateCondition(
    value: string,
    op: string,
    target: string | number,
  ): boolean {
    switch (op) {
      case '==':
        return value === String(target);
      case '!=':
        return value !== String(target);
      case '>':
        return Number(value) > Number(target);
      case '<':
        return Number(value) < Number(target);
      case '>=':
        return Number(value) >= Number(target);
      case '<=':
        return Number(value) <= Number(target);
      case 'in':
        return (target as string).split(',').includes(value);
      default:
        return false;
    }
  }
}
