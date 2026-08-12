import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { resolveJwtSecret } from '../../../common/utils/jwt-secret';

export interface JwtPayload { sub: string; phone: string; role: string; iat?: number; exp?: number; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token || ExtractJwt.fromAuthHeaderAsBearerToken()(req),
      ]),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(configService),
    } satisfies StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!payload.sub || !payload.phone) return null;
    const token = req.cookies?.access_token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return this.authService.validateAccessToken(token, payload);
  }
}
