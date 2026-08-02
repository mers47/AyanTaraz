import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { OTPService } from './otp.service';
import { User } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
}

export interface SessionToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly otpService: OTPService,
  ) {}

  private readonly SESSION_PREFIX = 'session:';

  async sendOTP(phone: string, type: 'PHONE_VERIFICATION' | 'BOOKING_VERIFICATION' = 'PHONE_VERIFICATION'): Promise<{ message: string }> {
    // Check if user exists (for phone verification, create if not exists)
    if (type === 'PHONE_VERIFICATION') {
      await this.prisma.user.upsert({
        where: { phone },
        create: {
          phone,
          phoneVerified: false,
        },
        update: {},
      });
    }

    // Generate and send OTP
    const { code } = await this.otpService.generateOTP(phone, type);

    // Send OTP via configured provider
    const smsProvider = this.configService.get<string>('SMS_PROVIDER', 'console');
    
    if (smsProvider === 'twilio') {
      // TODO: Implement Twilio integration
      // Example:
      // const twilioClient = require('twilio')(
      //   this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      //   this.configService.get<string>('TWILIO_AUTH_TOKEN')
      // );
      // await twilioClient.messages.create({
      //   body: `Your OTP code is: ${code}`,
      //   from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      //   to: phone,
      // });
      this.logger.warn('Twilio SMS provider not yet implemented. Falling back to console log.');
      this.logger.log(`[OTP] Sent to ${phone}: ${code} (type: ${type}) [PROVIDER: console]`);
    } else {
      // Default: Log to console (for development)
      this.logger.log(`[OTP] Sent to ${phone}: ${code} (type: ${type}) [PROVIDER: console]`);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOTPAndLogin(
    phone: string,
    code: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SessionToken & { user: Omit<User, 'password'> }> {
    // Verify OTP
    const { otpId } = await this.otpService.verifyOTP(phone, code, 'PHONE_VERIFICATION', ipAddress);

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          phoneVerified: true,
        },
      });
    }

    // Mark phone as verified
    if (!user.phoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    // Create session
    const { accessToken, expiresIn } = await this.createSession(user, ipAddress, userAgent);

    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role as User['role'],
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async createSession(
    user: { id: string; phone: string; role: string },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 86400); // 1 day
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    // Store session in database
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: accessToken,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Store in Redis for faster lookup
    const sessionKey = `${this.SESSION_PREFIX}${accessToken}`;
    await this.redis.setex(
      sessionKey,
      expiresIn,
      JSON.stringify({ userId: user.id, sessionId, ipAddress, userAgent }),
    );

    return { accessToken, expiresIn };
  }

  async validateSession(token: string): Promise<{ userId: string; sessionId: string } | null> {
    const sessionKey = `${this.SESSION_PREFIX}${token}`;
    const cachedSession = await this.redis.get(sessionKey);

    if (cachedSession) {
      return JSON.parse(cachedSession);
    }

    // Fallback to database
    const session = await this.prisma.session.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return { userId: session.userId, sessionId: session.id };
  }

  async invalidateSession(token: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${token}`;
    await this.redis.del(sessionKey);

    await this.prisma.session.deleteMany({
      where: { token },
    });
  }

  async invalidateAllSessions(userId: string): Promise<void> {
    // Find all sessions for user
    const sessions = await this.prisma.session.findMany({
      where: { userId },
    });

    // Delete from Redis
    for (const session of sessions) {
      const sessionKey = `${this.SESSION_PREFIX}${session.token}`;
      await this.redis.del(sessionKey);
    }

    // Delete from database
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async logout(userId: string, token: string, allSessions: boolean = false): Promise<{ message: string }> {
    if (allSessions) {
      await this.invalidateAllSessions(userId);
    } else {
      await this.invalidateSession(token);
    }

    return { message: 'Logged out successfully' };
  }

  async refreshSession(refreshToken: string): Promise<SessionToken> {
    // In this implementation, we use JWT directly without refresh tokens
    // For production, consider implementing refresh token rotation
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { accessToken, expiresIn } = await this.createSession(
        { id: user.id, phone: user.phone, role: user.role },
        undefined,
        undefined,
      );

      return { accessToken, expiresIn };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}