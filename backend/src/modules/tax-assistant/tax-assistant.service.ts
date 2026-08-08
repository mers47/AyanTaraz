import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

interface Session { id: string; userId: string | null; currentQuestionId: string; answers: Record<string, string>; result: any | null; createdAt: Date; updatedAt: Date }

@Injectable()
export class TaxAssistantService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly prisma: PrismaService) {}

  private readonly PREFIX = 'tax_session:';
  private readonly TTL = 3600;

  async startSession(questionId?: string, answers?: Record<string, string>, userId?: string) {
    const sid = uuidv4(); let qid = questionId;
    if (!qid) { const q = await this.prisma.taxQuestion.findFirst({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }); if (!q) throw new NotFoundException('No questions'); qid = q.id; }
    const q = await this.getQ(qid); if (!q) throw new NotFoundException('Q not found');
    const s: Session = { id: sid, userId: userId || null, currentQuestionId: qid, answers: answers || {}, result: null, createdAt: new Date(), updatedAt: new Date() };
    await this.redis.setex(`${this.PREFIX}${sid}`, this.TTL, JSON.stringify(s));
    return { sessionId: sid, question: q };
  }

  async answerQuestion(sessionId: string, questionId: string, optionId: string, optionValue: string) {
    const key = `${this.PREFIX}${sessionId}`; const raw = await this.redis.get(key);
    if (!raw) throw new NotFoundException('Session expired');
    const s: Session = JSON.parse(raw); s.answers[questionId] = optionValue; s.updatedAt = new Date();
    const flow = await this.prisma.taxQuestionFlow.findFirst({ where: { fromQuestionId: questionId, optionId } });
    let nid: string | null = null; let result: any = null; let done = false;
    if (flow) nid = flow.toQuestionId;
    if (!nid) { result = await this.determine(s.answers); done = true; }
    else { const nq = await this.getQ(nid); if (!nq) { result = await this.determine(s.answers); done = true; } else s.currentQuestionId = nid; }
    s.result = result; await this.redis.setex(key, this.TTL, JSON.stringify(s));
    return { question: done ? null : await this.getQ(nid!), result, completed: done };
  }

  async getSession(sessionId: string) {
    const raw = await this.redis.get(`${this.PREFIX}${sessionId}`);
    if (!raw) throw new NotFoundException('Session expired or not found');
    const s: Session = JSON.parse(raw);
    const currentQuestion = s.result ? null : await this.getQ(s.currentQuestionId);
    const answerCount = Object.keys(s.answers).length;
    return {
      sessionId: s.id,
      currentQuestion,
      answers: s.answers,
      answerCount,
      result: s.result,
      completed: s.result !== null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  async deleteSession(sessionId: string) {
    const deleted = await this.redis.del(`${this.PREFIX}${sessionId}`);
    return { sessionId, deleted: deleted > 0 };
  }

  private async getQ(qid: string) {
    const q = await this.prisma.taxQuestion.findUnique({ where: { id: qid, isActive: true }, include: { options: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } } });
    if (!q) return null;
    return { id: q.id, question: q.question, description: q.description, options: q.options.map(o => ({ id: o.id, label: o.label, value: o.value })) };
  }

  private async determine(answers: Record<string, string>) {
    const vals = Object.values(answers);
    let name = 'expert';
    if ((vals.includes('sal')||vals.includes('salary')) && vals.includes('lo')) name = 'exempt';
    else if ((vals.includes('sal')||vals.includes('salary')) && (vals.includes('mid')||vals.includes('hi')||vals.includes('top'))) name = 'sal';
    else if ((vals.includes('biz')||vals.includes('business')) && vals.includes('lo')) name = 'exempt';
    else if ((vals.includes('biz')||vals.includes('business')) && (vals.includes('mid')||vals.includes('hi')||vals.includes('top'))) name = 'biz';
    else if (vals.includes('rental')) name = 'rental';
    else if (vals.includes('incidental')) name = 'incidental';
    else if (vals.includes('corp')||vals.includes('corporation')) name = 'corp';
    else if (vals.includes('vat_yes')||vals.includes('vat_noreg')||vals.includes('vat')) name = 'vat';
    else if (vals.includes('not_filed')||vals.includes('late')) name = 'late';
    else if (vals.includes('kb')||vals.includes('knowledge')) name = 'kb';
    else if (vals.includes('fz')||vals.includes('freezone')||vals.includes('a132')||vals.includes('art132')) name = 'expert';
    else if (vals.includes('agri')) name = 'exempt';
    const r = await this.prisma.taxAssistantResult.findFirst({ where: { name, isActive: true } });
    if (!r) { const fallback = await this.prisma.taxAssistantResult.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }); return fallback ? { id: fallback.id, name: fallback.name, title: fallback.title, description: fallback.description, ruleIds: fallback.ruleIds as string[], action: fallback.action, severity: fallback.severity } : null; }
    return { id: r.id, name: r.name, title: r.title, description: r.description, ruleIds: r.ruleIds as string[], action: r.action, severity: r.severity };
  }
}
