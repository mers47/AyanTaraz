import { Injectable, Inject, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { OTPType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { randomInt, createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OTPService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private readonly OTP_PREFIX = 'otp:';
  private readonly BAN_PREFIX = 'otp_ban:';

  /**
   * تولید کد ۶ رقمی امن با crypto.randomInt
   * Ban: ۱۰ دقیقه پس از هر درخواست
   * اعتبار کد: ۵ دقیقه
   */
  async generateOTP(phone: string, type: OTPType = OTPType.PHONE_VERIFICATION): Promise<{ code: string; otpId: string }> {
    const banKey = `${this.BAN_PREFIX}${phone}:${type}`;
    const banned = await this.redis.get(banKey);
    if (banned) {
      const ttl = await this.redis.ttl(banKey);
      const mins = Math.ceil(ttl / 60);
      throw new HttpException(`لطفاً ${mins === 0 ? 'چند لحظه' : mins + ' دقیقه'} دیگر تلاش کنید`, HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = `${randomInt(100000, 999999)}`;
    const hashed = createHash('sha256').update(code).digest('hex');
    const id = uuidv4();
    const ttl = 300;

    await this.redis.setex(`${this.OTP_PREFIX}${id}`, ttl, JSON.stringify({ phone, type, hash: hashed, attempts: 0 }));
    await this.redis.setex(banKey, 600, '1');

    await this.prisma.oTP.create({
      data: { id, phone, code: hashed, type, expiresAt: new Date(Date.now() + ttl * 1000) },
    });

    return { code, otpId: id };
  }

  async verifyOTP(phone: string, code: string, type: OTPType = OTPType.PHONE_VERIFICATION): Promise<{ otpId: string }> {
    const keys = await this.redis.keys(`${this.OTP_PREFIX}*`);
    const inputHash = createHash('sha256').update(code).digest('hex');
    let matched: string | null = null;

    for (const k of keys) {
      const raw = await this.redis.get(k);
      if (!raw) continue;
      try {
        const d = JSON.parse(raw);
        if (d.phone === phone && d.type === type) {
          if (d.hash === inputHash && d.attempts < 5) { matched = k; break; }
          if (d.hash !== inputHash) { d.attempts++; const t = await this.redis.ttl(k); await this.redis.setex(k, t > 0 ? t : 300, JSON.stringify(d)); }
        }
      } catch {}
    }

    if (!matched) throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');

    await this.redis.del(matched);
    await this.redis.del(`${this.BAN_PREFIX}${phone}:${type}`);

    return { otpId: matched.replace(this.OTP_PREFIX, '') };
  }
}
