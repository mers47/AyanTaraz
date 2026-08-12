import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import Redis from 'ioredis';
import { randomBytes, createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { OTPService } from './otp.service';
import { SmsService } from './sms.service';
import { OTPType, User } from '@prisma/client';

export interface JwtPayload { sub: string; phone: string; role: string; iat?: number; exp?: number; }
export interface SafeUser { id: string; phone: string; phoneVerified: boolean; firstName: string | null; lastName: string | null; avatar: string | null; role: string; isActive: boolean; createdAt: Date; updatedAt: Date; }

@Injectable()
export class AuthService {
  private readonly SESSION = 'sess:';

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly otpService: OTPService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * ارسال کد تأیید از طریق پیامک
   * پیامک: "کد ورود به آیان تراز: XXXXXX" با template=1
   */
  async sendOTP(phone: string, type: OTPType = OTPType.PHONE_VERIFICATION, ip?: string, ua?: string) {
    if (type === OTPType.PHONE_VERIFICATION) await this.prisma.user.upsert({ where: { phone }, create: { phone, phoneVerified: false }, update: {} });
    const { code } = await this.otpService.generateOTP(phone, type, ip, ua);
    await this.smsService.sendWithFallback(phone, code, 1);
    return { message: 'کد تأیید ارسال شد' };
  }

  /**
   * ورود با شماره و کد ۶ رقمی
   * httpOnly cookie ست می‌شود — کاربر تا ۳۰ روز نیاز به ورود مجدد ندارد
   */
  async login(phone: string, code: string, res: Response, ip?: string, ua?: string) {
    await this.otpService.verifyOTP(phone, code);
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) user = await this.prisma.user.create({ data: { phone, phoneVerified: true } });
    if (!user.phoneVerified) user = await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    return this.createSession(user, res, ip, ua);
  }

  /**
   * تمدید نشست بدون ورود مجدد
   * fingerprint کاربر با refresh_token تطبیق داده می‌شود
   */
  async refresh(req: Request, res: Response) {
    const old = req.cookies?.refresh_token;
    if (!old) throw new UnauthorizedException('نشست منقضی شده');
    const fp = this.fingerprint(req);
    const data = await this.redis.get(`${this.SESSION}refresh:${old}`);
    if (!data) throw new UnauthorizedException('نشست منقضی شده');
    const sess = JSON.parse(data);
    if (sess.fp !== fp) { await this.redis.del(`${this.SESSION}refresh:${old}`); throw new UnauthorizedException('دستگاه نامعتبر'); }
    const user = await this.prisma.user.findUnique({ where: { id: sess.userId } });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');
    return this.createSession(user, res, req.ip, req.headers['user-agent'] || '');
  }

  async logout(req: Request, res: Response) {
    const accessToken = req.cookies?.access_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const refreshToken = req.cookies?.refresh_token;
    if (accessToken) {
      await this.redis.del(`${this.SESSION}${accessToken}`);
      await this.prisma.session.deleteMany({ where: { token: accessToken } });
    }
    if (refreshToken) await this.redis.del(`${this.SESSION}refresh:${refreshToken}`);
    const prod = this.configService.get('NODE_ENV') === 'production';
    res.clearCookie('access_token', { path: '/', httpOnly: true, secure: prod, sameSite: 'lax' });
    res.clearCookie('refresh_token', { path: '/', httpOnly: true, secure: prod, sameSite: 'lax' });
    return { message: 'خروج موفق' };
  }

  private async createSession(user: User, res: Response, ip?: string, ua?: string) {
    const fp = this.fingerprintParts(ip, ua);
    const accExp = this.configService.get<number>('JWT_EXPIRES_IN', 86400);
    const refExp = 2592000;

    const accessToken = this.jwtService.sign({ sub: user.id, phone: user.phone, role: user.role }, { expiresIn: accExp });
    const refreshToken = randomBytes(48).toString('hex');

    await this.prisma.session.create({ data: { id: uuidv4(), userId: user.id, token: accessToken, expiresAt: new Date(Date.now() + accExp * 1000), ipAddress: ip, userAgent: ua } });
    await this.redis.setex(`${this.SESSION}${accessToken}`, accExp, JSON.stringify({ userId: user.id, fp }));
    await this.redis.setex(`${this.SESSION}refresh:${refreshToken}`, refExp, JSON.stringify({ userId: user.id, fp }));

    const prod = this.configService.get('NODE_ENV') === 'production';
    const opts = { httpOnly: true, secure: prod, sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', accessToken, { ...opts, maxAge: accExp * 1000 });
    res.cookie('refresh_token', refreshToken, { ...opts, maxAge: refExp * 1000 });

    return { user: this.safe(user), accessToken, expiresIn: accExp };
  }

  fingerprint(req: Request): string {
    return this.fingerprintParts(req.ip, req.headers['user-agent'] || '');
  }

  private fingerprintParts(ip?: string, ua?: string | string[]): string {
    return createHash('sha256').update(`${ip || ''}|${Array.isArray(ua) ? ua.join(',') : ua || ''}`).digest('hex').substring(0, 32);
  }

  async validateAccessToken(token: string, payload: JwtPayload) {
    const cached = await this.redis.get(`${this.SESSION}${token}`);
    if (!cached) throw new UnauthorizedException('نشست منقضی شده');
    const session = await this.prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session || session.expiresAt.getTime() < Date.now() || !session.user.isActive) {
      await this.redis.del(`${this.SESSION}${token}`);
      throw new UnauthorizedException('نشست نامعتبر است');
    }
    if (session.user.id !== payload.sub || session.user.phone !== payload.phone) throw new UnauthorizedException('نشست نامعتبر است');
    return this.safe(session.user);
  }

  safe(u: User): SafeUser {
    return { id: u.id, phone: u.phone, phoneVerified: u.phoneVerified, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar, role: u.role, isActive: u.isActive, createdAt: u.createdAt, updatedAt: u.updatedAt };
  }
}
