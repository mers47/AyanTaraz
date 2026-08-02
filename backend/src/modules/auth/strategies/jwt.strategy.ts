import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ) {
    // Extract the raw JWT token from the Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '');

    // Validate the session using the actual token
    const session = await this.authService.validateSession(token);
    if (!session) {
      return null;
    }

    // Return user information
    return {
      id: payload.sub,
      phone: payload.phone,
      role: payload.role,
    };
  }
}