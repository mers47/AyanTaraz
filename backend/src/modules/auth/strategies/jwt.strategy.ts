import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: JwtPayload) {
    // Validate the session
    const session = await this.authService.validateSession(
      this.configService.get<string>('JWT_SECRET') +
        '.' +
        payload.sub +
        '.' +
        payload.role,
    );

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
