import { Controller, Post, Body, Request, Response, HttpCode, HttpStatus, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() b: { phone: string }) { return this.auth.sendOTP(b.phone); }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() b: { phone: string; code: string },
    @Response({ passthrough: true }) res: any,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) { return this.auth.login(b.phone, b.code, res, ip, ua); }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return this.auth.refresh(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Response({ passthrough: true }) res: any) { return this.auth.logout(res); }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  async me(@Request() req: any) { return { user: req.user }; }
}
