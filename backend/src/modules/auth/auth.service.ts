import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { OTPService } from './otp.service';
import { SmsService } from './sms.service';

export interface JwtPayload { sub: string; phone: string; role: string; }
export interface SessionToken { accessToken: string; refreshToken?: string; expiresIn: number; }
export interface SafeUser { id: string; phone: string; phoneVerified: boolean; firstName: string | null; lastName: string | null; avatar: string | null; role: string; isActive: boolean; createdAt: Date; updatedAt: Date; }

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly otpService: OTPService,
    private readonly smsService: SmsService,
  ) {}

  private readonly SESSION_PREFIX = 'session:';

  async sendOTP(phone: string, type: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION'): Promise<{ message: string }> {
    if (type === 'PHONE_VERIFICATION') {
      await this.prisma.user.upsert({ where: { phone }, create: { phone, phoneVerified: false }, update: {} });
    }

    const { code } = await this.otpService.generateOTP(phone, type);

    // ارسال از طریق وب‌سرویس پیامکی
    await this.smsService.sendOTPWithFallback(phone, code, type === 'PHONE_VERIFICATION' ? 1 : 2);

    return { message: 'OTP sent successfully' };
  }

  async verifyOTPAndLogin(phone: string, code: string, ipAddress?: string, userAgent?: string): Promise<SessionToken & { user: SafeUser }> {
    await this.otpService.verifyOTP(phone, code, 'PHONE_VERIFICATION', ipAddress);

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) user = await this.prisma.user.create({ data: { phone, phoneVerified: true } });
    if (!user.phoneVerified) user = await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });

    const { accessToken, expiresIn } = await this.createSession(user, ipAddress, userAgent);
    return { accessToken, expiresIn, user: this.toSafeUser(user) };
  }

  async createSession(user: { id: string; phone: string; role: string }, ipAddress?: string, userAgent?: string): Promise<{ accessToken: string; expiresIn: number }> {
    const payload: JwtPayload = { sub: user.id, phone: user.phone, role: user.role };
    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 86400);
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.prisma.session.create({ data: { id: sessionId, userId: user.id, token: accessToken, expiresAt, ipAddress, userAgent } });
    await this.redis.setex(`${this.SESSION_PREFIX}${accessToken}`, expiresIn, JSON.stringify({ userId: user.id, sessionId, ipAddress, userAgent }));
    return { accessToken, expiresIn };
  }

  async validateSession(token: string): Promise<{ userId: string; sessionId: string } | null> {
    const cachedSession = await this.redis.get(`${this.SESSION_PREFIX}${token}`);
    if (cachedSession) return JSON.parse(cachedSession);
    const session = await this.prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return null;
    return { userId: session.userId, sessionId: session.id };
  }

  async invalidateSession(token: string): Promise<void> {
    await this.redis.del(`${this.SESSION_PREFIX}${token}`);
    await this.prisma.session.deleteMany({ where: { token } });
  }

  async invalidateAllSessions(userId: string): Promise<void> {
    const sessions = await this.prisma.session.findMany({ where: { userId } });
    for (const s of sessions) await this.redis.del(`${this.SESSION_PREFIX}${s.token}`);
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async logout(userId: string, token: string, allSessions = false): Promise<{ message: string }> {
    if (allSessions) await this.invalidateAllSessions(userId);
    else await this.invalidateSession(token);
    return { message: 'Logged out successfully' };
  }

  async refreshSession(refreshToken: string): Promise<SessionToken> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      return await this.createSession({ id: user.id, phone: user.phone, role: user.role });
    } catch (e) { throw new UnauthorizedException('Invalid refresh token'); }
  }

  private toSafeUser(user: any): SafeUser {
    return { id: user.id, phone: user.phone, phoneVerified: user.phoneVerified, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar, role: user.role, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt };
  }
}
