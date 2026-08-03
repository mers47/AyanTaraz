import { Controller, Post, Body, Request, Response, HttpCode, HttpStatus, Ip, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ارسال کد تأیید' })
  async sendOTP(@Body() body: { phone: string; type?: string }) {
    return this.authService.sendOTP(body.phone, body.type);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ورود با شماره و کد' })
  async login(@Body() body: { phone: string; code: string }, @Response({ passthrough: true }) res: any, @Ip() ip: string, @Header('user-agent') ua: string) {
    return this.authService.verifyOTPAndLogin(body.phone, body.code, res, ip, ua);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تمدید نشست' })
  async refresh(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return this.authService.refreshSession(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'خروج' })
  async logout(@Response({ passthrough: true }) res: any) {
    return this.authService.logout(res);
  }
}
