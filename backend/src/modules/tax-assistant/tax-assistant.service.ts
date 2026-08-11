import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

export interface TaxAssistantResultDto {
  id: string;
  name: string;
  title: string;
  description: string;
  ruleIds: string[];
  action: string;
  severity: string;
}

export interface QuestionDto {
  id: string;
  question: string;
  description: string | null;
  options: { id: string; label: string; value: string }[];
}

interface Session {
  id: string;
  userId: string | null;
  currentQuestionId: string;
  answers: Record<string, string>;
  result: TaxAssistantResultDto | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TaxAssistantService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly prisma: PrismaService) {}

  private readonly PREFIX = 'tax_session:';
  private readonly TTL = 3600;

  async startSession(questionId?: string, answers?: Record<string, string>, userId?: string) {
    const sessionId = uuidv4();
    let firstQuestionId = questionId;
    if (!firstQuestionId) {
      const firstQuestion = await this.prisma.taxQuestion.findFirst({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      if (!firstQuestion) throw new NotFoundException('No questions');
      firstQuestionId = firstQuestion.id;
    }
    const question = await this.getQuestion(firstQuestionId);
    if (!question) throw new NotFoundException('Question not found');
    const session: Session = {
      id: sessionId,
      userId: userId || null,
      currentQuestionId: firstQuestionId,
      answers: answers || {},
      result: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.redis.setex(`${this.PREFIX}${sessionId}`, this.TTL, JSON.stringify(session));
    return { sessionId, question };
  }

  async answerQuestion(sessionId: string, questionId: string, optionId: string, optionValue: string) {
    const key = `${this.PREFIX}${sessionId}`;
    const raw = await this.redis.get(key);
    if (!raw) throw new NotFoundException('Session expired');
    const session: Session = JSON.parse(raw);
    session.answers[questionId] = optionValue;
    session.updatedAt = new Date();

    const flow = await this.prisma.taxQuestionFlow.findFirst({
      where: { fromQuestionId: questionId, optionId },
    });

    let nextQuestionId: string | null = null;
    let result: TaxAssistantResultDto | null = null;
    let done = false;

    if (flow) nextQuestionId = flow.toQuestionId;

    if (!nextQuestionId) {
      result = await this.determine(session.answers);
      done = true;
    } else {
      const nextQuestion = await this.getQuestion(nextQuestionId);
      if (!nextQuestion) {
        result = await this.determine(session.answers);
        done = true;
      } else {
        session.currentQuestionId = nextQuestionId;
      }
    }

    session.result = result;
    await this.redis.setex(key, this.TTL, JSON.stringify(session));

    return {
      question: done ? null : await this.getQuestion(nextQuestionId!),
      result,
      completed: done,
    };
  }

  async getSession(sessionId: string) {
    const raw = await this.redis.get(`${this.PREFIX}${sessionId}`);
    if (!raw) throw new NotFoundException('Session expired or not found');
    const session: Session = JSON.parse(raw);
    const currentQuestion = session.result ? null : await this.getQuestion(session.currentQuestionId);
    const answerCount = Object.keys(session.answers).length;
    return {
      sessionId: session.id,
      currentQuestion,
      answers: session.answers,
      answerCount,
      result: session.result,
      completed: session.result !== null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  async deleteSession(sessionId: string) {
    const deleted = await this.redis.del(`${this.PREFIX}${sessionId}`);
    return { sessionId, deleted: deleted > 0 };
  }

  private async getQuestion(questionId: string): Promise<QuestionDto | null> {
    const question = await this.prisma.taxQuestion.findUnique({
      where: { id: questionId, isActive: true },
      include: { options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    });
    if (!question) return null;
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

  private async determine(answers: Record<string, string>): Promise<TaxAssistantResultDto | null> {
    const answerValues = Object.values(answers);

    const hasSalary = answerValues.includes('sal') || answerValues.includes('salary');
    const hasBusiness = answerValues.includes('biz') || answerValues.includes('business');
    const isLowIncome = answerValues.includes('lo');
    const isMidHighIncome = answerValues.includes('mid') || answerValues.includes('hi') || answerValues.includes('top');
    const hasCorporation = answerValues.includes('corp') || answerValues.includes('corporation');
    const hasVat = answerValues.includes('vat_yes') || answerValues.includes('vat_noreg') || answerValues.includes('vat');
    const hasFilingIssue = answerValues.includes('not_filed') || answerValues.includes('late');
    const hasFreezone = answerValues.includes('fz') || answerValues.includes('freezone') || answerValues.includes('a132') || answerValues.includes('art132');

    let resultName = 'expert';
    if (hasSalary && isLowIncome) resultName = 'exempt';
    else if (hasSalary && isMidHighIncome) resultName = 'sal';
    else if (hasBusiness && isLowIncome) resultName = 'exempt';
    else if (hasBusiness && isMidHighIncome) resultName = 'biz';
    else if (answerValues.includes('rental')) resultName = 'rental';
    else if (answerValues.includes('incidental')) resultName = 'incidental';
    else if (hasCorporation) resultName = 'corp';
    else if (hasVat) resultName = 'vat';
    else if (hasFilingIssue) resultName = 'late';
    else if (answerValues.includes('kb') || answerValues.includes('knowledge')) resultName = 'kb';
    else if (hasFreezone) resultName = 'expert';
    else if (answerValues.includes('agri')) resultName = 'exempt';

    const matched = await this.prisma.taxAssistantResult.findFirst({
      where: { name: resultName, isActive: true },
    });

    if (!matched) {
      const fallback = await this.prisma.taxAssistantResult.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      return fallback ? this.toResultDto(fallback) : null;
    }
    return this.toResultDto(matched);
  }

  private toResultDto(record: {
    id: string;
    name: string;
    title: string;
    description: string;
    ruleIds: unknown;
    action: string | null;
    severity: string;
  }): TaxAssistantResultDto {
    return {
      id: record.id,
      name: record.name,
      title: record.title,
      description: record.description,
      ruleIds: (record.ruleIds as string[]) ?? [],
      action: record.action ?? '',
      severity: record.severity,
    };
  }
}
