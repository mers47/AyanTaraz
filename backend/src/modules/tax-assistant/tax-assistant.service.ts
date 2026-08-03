import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

interface AssistantSession {
  id: string; userId: string | null; currentQuestionId: string;
  answers: Record<string, string>; result: any | null;
  createdAt: Date; updatedAt: Date;
}

@Injectable()
export class TaxAssistantService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  private readonly SESSION_PREFIX = 'tax_assistant_session:';
  private readonly SESSION_EXPIRY = 86400;

  async startSession(questionId?: string, answers?: Record<string, string>, userId?: string) {
    const sessionId = uuidv4();
    let currentQuestionId = questionId;
    if (!currentQuestionId) {
      const firstQuestion = await this.prisma.taxQuestion.findFirst({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
      if (!firstQuestion) throw new NotFoundException('هیچ سوالی برای دستیار مالیاتی موجود نیست');
      currentQuestionId = firstQuestion.id;
    }
    const question = await this.getQuestionWithOptions(currentQuestionId);
    if (!question) throw new NotFoundException('سوال مورد نظر یافت نشد');

    const session: AssistantSession = { id: sessionId, userId: userId || null, currentQuestionId, answers: answers || {}, result: null, createdAt: new Date(), updatedAt: new Date() };
    await this.redis.setex(`${this.SESSION_PREFIX}${sessionId}`, this.SESSION_EXPIRY, JSON.stringify(session));
    return { sessionId, question };
  }

  async answerQuestion(sessionId: string, questionId: string, optionId: string, optionValue: string) {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = await this.redis.get(sessionKey);
    if (!sessionData) throw new NotFoundException('نشست یافت نشد یا منقضی شده است');

    const session: AssistantSession = JSON.parse(sessionData);
    session.answers[questionId] = optionValue;
    session.updatedAt = new Date();

    const flow = await this.prisma.taxQuestionFlow.findFirst({ where: { fromQuestionId: questionId, optionId } });
    let nextQuestionId: string | null = null;
    let result: any = null;
    let completed = false;

    if (flow) {
      if (flow.condition) {
        try {
          const c = JSON.parse(flow.condition);
          if (c.field && c.op && c.value) {
            const val = session.answers[c.field];
            if (val && this.evaluateCondition(val, c.op, c.value)) nextQuestionId = flow.toQuestionId;
          }
        } catch { nextQuestionId = flow.toQuestionId; }
      } else { nextQuestionId = flow.toQuestionId; }
    }

    if (!nextQuestionId) { result = await this.determineResult(session.answers); completed = true; }
    else {
      const nextQ = await this.getQuestionWithOptions(nextQuestionId);
      if (!nextQ) { result = await this.determineResult(session.answers); completed = true; }
      else session.currentQuestionId = nextQuestionId;
    }

    session.result = result;
    await this.redis.setex(sessionKey, this.SESSION_EXPIRY, JSON.stringify(session));
    return { question: completed ? null : await this.getQuestionWithOptions(nextQuestionId!), result, completed };
  }

  async getQuestionWithOptions(questionId: string) {
    const q = await this.prisma.taxQuestion.findUnique({ where: { id: questionId, isActive: true }, include: { options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } } });
    if (!q) return null;
    return { id: q.id, question: q.question, description: q.description, options: q.options.map(o => ({ id: o.id, label: o.label, value: o.value })) };
  }

  private async determineResult(answers: Record<string, string>) {
    const vals = Object.values(answers);
    let name = 'need_consultation';
    if (vals.includes('salary_employee') && vals.includes('income_under_100m')) name = 'low_income_guidance';
    else if (vals.includes('self_employed')) name = 'self_employed_tax_guide';
    else if (vals.includes('corporation')) name = 'corporate_tax_guide';
    else if (vals.includes('vat_person') || vals.includes('vat_registered')) name = 'vat_guidance';
    else if ((vals.includes('income_over_1b') || vals.includes('income_500m_1b')) && (vals.includes('article_132') || vals.includes('knowledge_based'))) name = 'need_consultation';

    const r = await this.prisma.taxAssistantResult.findFirst({ where: { name, isActive: true } });
    if (!r) return null;
    return { id: r.id, name: r.name, title: r.title, description: r.description, ruleIds: r.ruleIds as string[], action: r.action, severity: r.severity };
  }

  private evaluateCondition(value: string, op: string, target: string | number): boolean {
    switch (op) {
      case '==': return value === String(target);
      case '!=': return value !== String(target);
      case '>': return Number(value) > Number(target);
      case '<': return Number(value) < Number(target);
      case '>=': return Number(value) >= Number(target);
      case '<=': return Number(value) <= Number(target);
      case 'in': return (target as string).split(',').includes(value);
      default: return false;
    }
  }
}
