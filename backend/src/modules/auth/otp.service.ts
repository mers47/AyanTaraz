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
  private readonly OTP_LOOKUP_PREFIX = 'otp_lookup:';
  private readonly BAN_PREFIX = 'otp_ban:';
  private readonly IP_BAN_PREFIX = 'otp_ip_ban:';

  async generateOTP(phone: string, type: OTPType = OTPType.PHONE_VERIFICATION, ip?: string, ua?: string): Promise<{ code: string; otpId: string }> {
    const banKey = `${this.BAN_PREFIX}${phone}:${type}`;
    const ipKey = `${this.IP_BAN_PREFIX}${ip || 'unknown'}`;
    const [banned, ipCount] = await Promise.all([this.redis.get(banKey), this.redis.incr(ipKey)]);
    if (ipCount === 1) await this.redis.expire(ipKey, 600);
    if (ipCount > 20) throw new HttpException('تعداد درخواست‌ها بیش از حد مجاز است', HttpStatus.TOO_MANY_REQUESTS);
    if (banned) {
      const ttl = await this.redis.ttl(banKey);
      const mins = Math.ceil(ttl / 60);
      throw new HttpException(`لطفاً ${mins === 0 ? 'چند لحظه' : mins + ' دقیقه'} دیگر تلاش کنید`, HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = `${randomInt(100000, 999999)}`;
    const hashed = createHash('sha256').update(code).digest('hex');
    const id = uuidv4();
    const ttl = 300;
    const lookupKey = `${this.OTP_LOOKUP_PREFIX}${phone}:${type}`;

    const previousId = await this.redis.get(lookupKey);
    if (previousId) await this.redis.del(`${this.OTP_PREFIX}${previousId}`);
    await this.redis.setex(`${this.OTP_PREFIX}${id}`, ttl, JSON.stringify({ phone, type, hash: hashed, attempts: 0 }));
    await this.redis.setex(lookupKey, ttl, id);
    await this.redis.setex(banKey, 600, '1');

    await this.prisma.oTP.updateMany({ where: { phone, type, used: false }, data: { used: true } });
    await this.prisma.oTP.create({
      data: { id, phone, code: hashed, type, expiresAt: new Date(Date.now() + ttl * 1000), ipAddress: ip, attemptCount: 0 },
    });

    return { code, otpId: id };
  }

  async verifyOTP(phone: string, code: string, type: OTPType = OTPType.PHONE_VERIFICATION): Promise<{ otpId: string }> {
    const lookupKey = `${this.OTP_LOOKUP_PREFIX}${phone}:${type}`;
    const id = await this.redis.get(lookupKey);
    if (!id) throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
    const otpKey = `${this.OTP_PREFIX}${id}`;
    const raw = await this.redis.get(otpKey);
    if (!raw) throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');

    const d = JSON.parse(raw);
    const inputHash = createHash('sha256').update(code).digest('hex');
    if (d.phone !== phone || d.type !== type || d.attempts >= 5 || d.hash !== inputHash) {
      d.attempts = (d.attempts || 0) + 1;
      const ttl = await this.redis.ttl(otpKey);
      if (ttl > 0 && d.attempts < 5) await this.redis.setex(otpKey, ttl, JSON.stringify(d));
      else await this.redis.del(otpKey, lookupKey);
      await this.prisma.oTP.updateMany({ where: { id }, data: { attemptCount: d.attempts, used: d.attempts >= 5 } });
      throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
    }

    await this.redis.del(otpKey, lookupKey, `${this.BAN_PREFIX}${phone}:${type}`);
    await this.prisma.oTP.update({ where: { id }, data: { used: true, attemptCount: d.attempts } });
    return { otpId: id };
  }
}
