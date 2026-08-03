import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import Redis from 'ioredis';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly prisma: PrismaService, @Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  @Get() async check() {
    const db = await this.prisma.$queryRaw`SELECT 1`.then(()=>true).catch(()=>false);
    const rds = await this.redis.ping().then(r=>r==='PONG').catch(()=>false);
    return { status: db && rds ? 'healthy' : 'degraded', timestamp: new Date().toISOString(), service: 'ayan-taraz-backend', version: '1.0.0', checks: { database: db ? 'ok' : 'fail', redis: rds ? 'ok' : 'fail' } };
  }

  @Get('ready') async ready() {
    try { await this.prisma.$queryRaw`SELECT 1`; await this.redis.ping(); return { status: 'ready' }; }
    catch { return { status: 'not_ready' }; }
  }
}
