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

export interface SafeUser { id: string; phone: string; phoneVerified: boolean; firstName: string | null; lastName: string | null; role: string; isActive: boolean; }

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

  async sendOTP(phone: string, type = 'PHONE_VERIFICATION') {
    if (type === 'PHONE_VERIFICATION') await this.prisma.user.upsert({ where: { phone }, create: { phone }, update: {} });
    const { code } = await this.otpService.generateOTP(phone, type);
    await this.smsService.sendOTPWithFallback(phone, code, 1);
    return { message: 'کد تأیید ارسال شد' };
  }

  async verifyOTPAndLogin(phone: string, code: string, res: Response, ip?: string, ua?: string) {
    await this.otpService.verifyOTP(phone, code, 'PHONE_VERIFICATION');
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) user = await this.prisma.user.create({ data: { phone, phoneVerified: true } });
    if (!user.phoneVerified) user = await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });

    const token = await this.createSession(user, res, ip, ua);
    return { user: { id: user.id, phone: user.phone, phoneVerified: user.phoneVerified, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive }, accessToken: token.accessToken, expiresIn: token.expiresIn };
  }

  async refreshSession(req: Request, res: Response) {
    const rt = req.cookies?.refresh_token;
    if (!rt) throw new UnauthorizedException('نشست منقضی شده');
    const fp = this.fingerprint(req);
    const data = await this.redis.get(`session:refresh:${rt}`);
    if (!data) throw new UnauthorizedException('نشست منقضی شده');
    const { userId, fingerprint } = JSON.parse(data);
    if (fingerprint !== fp) { await this.redis.del(`session:refresh:${rt}`); throw new UnauthorizedException('دستگاه نامعتبر'); }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');
    return this.createSession(user, res, req.ip, req.headers['user-agent'] || '');
  }

  async logout(res: Response) {
    res.clearCookie('access_token', { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
    res.clearCookie('refresh_token', { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
    return { message: 'خروج موفق' };
  }

  private async createSession(user: any, res: Response, ip?: string, ua?: string) {
    const fp = createHash('sha256').update(`${ip || ''}|${ua || ''}`).digest('hex').substring(0, 32);
    const accessExpiry = this.configService.get<number>('JWT_EXPIRES_IN', 86400);
    const accessToken = this.jwtService.sign({ sub: user.id, phone: user.phone, role: user.role }, { expiresIn: accessExpiry });
    const refreshToken = randomBytes(48).toString('hex');
    const sid = uuidv4();

    await this.prisma.session.create({ data: { id: sid, userId: user.id, token: accessToken, expiresAt: new Date(Date.now() + accessExpiry * 1000), ipAddress: ip, userAgent: ua } }).catch(() => {});
    await this.redis.setex(`session:${accessToken}`, accessExpiry, JSON.stringify({ userId: user.id, sid, fingerprint: fp }));
    await this.redis.setex(`session:refresh:${refreshToken}`, 2592000, JSON.stringify({ userId: user.id, fingerprint: fp }));

    const isProd = this.configService.get('NODE_ENV') === 'production';
    const co = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', accessToken, { ...co, maxAge: accessExpiry * 1000 });
    res.cookie('refresh_token', refreshToken, { ...co, maxAge: 2592000000 });
    return { accessToken, expiresIn: accessExpiry };
  }

  fingerprint(req: Request): string {
    return createHash('sha256').update(`${req.ip || ''}|${req.headers['user-agent'] || ''}|${req.headers['accept-language'] || ''}`).digest('hex').substring(0, 32);
  }
}
