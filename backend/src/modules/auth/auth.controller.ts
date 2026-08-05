import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post, Request, Response, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { SendOTPDto } from './dto/send-otp.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: SendOTPDto, @Ip() ip: string, @Headers('user-agent') ua: string) {
    return this.auth.sendOTP(body.phone, body.type as any, ip, ua);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Response({ passthrough: true }) res: any,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.auth.login(body.phone, body.code, res, ip, ua);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return this.auth.refresh(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return this.auth.logout(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  @HttpCode(HttpStatus.OK)
  async me(@Request() req: any) { return { user: req.user }; }
}
