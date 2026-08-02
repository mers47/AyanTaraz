import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
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
  private readonly OTP_RATE_LIMIT_PREFIX = 'otp_rate_limit:';

  async generateOTP(phone: string, type: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION'): Promise<{ code: string; otpId: string }> {
    // Rate limiting check
    const rateLimitKey = `${this.OTP_RATE_LIMIT_PREFIX}${phone}:${type}`;
    const rateLimitWindow = this.configService.get<number>('OTP_RATE_LIMIT_WINDOW', 900000); // 15 minutes
    const rateLimitMax = this.configService.get<number>('OTP_RATE_LIMIT_MAX', 3);

    const currentCount = await this.redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await this.redis.expire(rateLimitKey, rateLimitWindow / 1000);
    }

    if (currentCount > rateLimitMax) {
      throw new ConflictException(
        `Too many OTP requests. Please wait ${rateLimitWindow / 1000 / 60} minutes.`,
      );
    }

    // Generate 6-digit code
    const code = this.generateRandomCode(6);
    const otpId = uuidv4();
    const expiresIn = this.configService.get<number>('OTP_EXPIRES_IN', 300000); // 5 minutes
    const expiresAt = new Date(Date.now() + expiresIn);

    // Store in database
    await this.prisma.oTP.create({
      data: {
        id: otpId,
        phone,
        code,
        type,
        expiresAt,
      },
    });

    // Also store in Redis for faster validation
    const redisKey = `${this.OTP_PREFIX}${phone}:${type}`;
    await this.redis.setex(
      redisKey,
      Math.floor(expiresIn / 1000),
      JSON.stringify({ code, otpId, attemptCount: 0 }),
    );

    return { code, otpId };
  }

  async verifyOTP(
    phone: string,
    code: string,
    type: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION',
    ipAddress?: string,
  ): Promise<{ otpId: string; phone: string }> {
    const redisKey = `${this.OTP_PREFIX}${phone}:${type}`;
    const cachedOTP = await this.redis.get(redisKey);

    let otpData: { code: string; otpId: string; attemptCount: number } | null = null;

    if (cachedOTP) {
      otpData = JSON.parse(cachedOTP);
    } else {
      // Fallback to database
      const otp = await this.prisma.oTP.findFirst({
        where: {
          phone,
          type,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otp) {
        throw new BadRequestException('Invalid or expired OTP code.');
      }

      otpData = {
        code: otp.code,
        otpId: otp.id,
        attemptCount: otp.attemptCount,
      };
    }

    if (!otpData) {
      throw new BadRequestException('Invalid or expired OTP code.');
    }

    // Check attempt count
    const maxAttempts = this.configService.get<number>('OTP_MAX_ATTEMPTS', 5);
    if (otpData.attemptCount >= maxAttempts) {
      throw new BadRequestException(
        `Maximum OTP attempts (${maxAttempts}) reached. Please request a new code.`,
      );
    }

    // Verify code
    if (otpData.code !== code) {
      // Increment attempt count
      otpData.attemptCount++;
      await this.redis.setex(
        redisKey,
        300, // 5 minutes
        JSON.stringify(otpData),
      );
      await this.prisma.oTP.update({
        where: { id: otpData.otpId },
        data: { attemptCount: otpData.attemptCount },
      });
      throw new BadRequestException('Invalid OTP code.');
    }

    // Mark as used
    await this.prisma.oTP.update({
      where: { id: otpData.otpId },
      data: { used: true, usedAt: new Date() },
    });

    // Delete from Redis
    await this.redis.del(redisKey);

    return { otpId: otpData.otpId, phone };
  }

  async invalidateOTP(phone: string, type: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION'): Promise<void> {
    const redisKey = `${this.OTP_PREFIX}${phone}:${type}`;
    await this.redis.del(redisKey);

    await this.prisma.oTP.updateMany({
      where: {
        phone,
        type,
        used: false,
      },
      data: { used: true },
    });
  }

  private generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}
