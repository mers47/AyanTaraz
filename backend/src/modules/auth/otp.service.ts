import { Injectable, Inject, BadRequestException, TooManyRequestsException } from '@nestjs/common';
import Redis from 'ioredis';
import { randomInt, createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OTPService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async generateOTP(phone: string, type: string): Promise<{ code: string; otpId: string }> {
    const banKey = `otp_ban:${phone}:${type}`;
    const ban = await this.redis.get(banKey);
    if (ban) {
      const ttl = await this.redis.ttl(banKey);
      throw new TooManyRequestsException(`لطفاً ${Math.ceil(ttl / 60)} دقیقه دیگر درخواست دهید`);
    }

    const code = `${randomInt(100000, 999999)}`;
    const hash = createHash('sha256').update(code).digest('hex');
    const otpId = uuidv4();

    await this.redis.setex(`otp:${otpId}`, 300, JSON.stringify({ phone, type, hash, attempts: 0 }));
    await this.redis.setex(banKey, 600, '1');

    await this.prisma.oTP.create({
      data: { id: otpId, phone, code: hash, type, expiresAt: new Date(Date.now() + 300000) }
    });

    return { code, otpId };
  }

  async verifyOTP(phone: string, code: string, type: string): Promise<{ otpId: string }> {
    const keys = await this.redis.keys('otp:*');
    for (const k of keys) {
      const raw = await this.redis.get(k);
      if (!raw) continue;
      try {
        const d = JSON.parse(raw);
        if (d.phone === phone && d.type === type) {
          if (d.hash === createHash('sha256').update(code).digest('hex')) {
            if (d.attempts >= 5) throw new BadRequestException('تعداد تلاش مجاز به پایان رسید');
            const id = k.replace('otp:', '');
            await this.redis.del(k);
            await this.redis.del(`otp_ban:${phone}:${type}`);
            return { otpId: id };
          }
          d.attempts++;
          const ttl = await this.redis.ttl(k);
          await this.redis.setex(k, ttl > 0 ? ttl : 300, JSON.stringify(d));
        }
      } catch (e) { if (e instanceof BadRequestException) throw e; }
    }
    throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
  }
}
