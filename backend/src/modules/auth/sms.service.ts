import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SmsOTPResponse {
  code?: number;
  data?: boolean;
  message?: string | null;
  success?: boolean;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>(
      'SMS_API_URL',
      'https://sms-otp-api.example.com/api/send'
    );
    this.apiKey = this.configService.get<string>('SMS_API_KEY', '');
  }

  /**
   * ارسال کد OTP از طریق وب‌سرویس پیامکی
   * template: 0=کد | 1=کد ورود | 2=کد تایید | 3=رمز | 4=رمز ورود
   */
  async sendOTP(phone: string, code: string, template: number = 0): Promise<boolean> {
    // نرمال‌سازی شماره
    const normalizedPhone = this.normalizePhone(phone);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          code,
          mobile: normalizedPhone,
          template,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        this.logger.warn(`SMS API returned ${response.status} for ${normalizedPhone}`);
        return false;
      }

      const result: SmsOTPResponse = await response.json();

      if (result.success === true || result.data === true) {
        this.logger.log(`✅ SMS sent to ${normalizedPhone} — template: ${template}`);
        return true;
      }

      this.logger.warn(`SMS API returned success=false for ${normalizedPhone}: ${result.message || 'unknown'}`);
      return false;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        this.logger.error(`SMS API timeout for ${normalizedPhone}`);
      } else {
        this.logger.error(`SMS API error for ${normalizedPhone}: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * ارسال OTP با fallback
   */
  async sendOTPWithFallback(phone: string, code: string, template: number = 0): Promise<void> {
    const sent = await this.sendOTP(phone, code, template);

    if (!sent) {
      const isDev = this.configService.get<string>('NODE_ENV') === 'development';
      this.logger.warn(
        `⚠️ SMS fallback — could not send to ${phone}. Code: ${code}${isDev ? '' : ' (suppressed in production)'}`
      );

      // در محیط development، کد در console نمایش داده می‌شود
      if (isDev) {
        console.log(`\n📱 [DEV SMS] To: ${phone} | Code: ${code} | Template: ${template}\n`);
      }
    }
  }

  private normalizePhone(phone: string): string {
    let normalized = phone.replace(/[\s\-()]/g, '');

    if (normalized.startsWith('+98')) {
      normalized = '0' + normalized.substring(3);
    } else if (normalized.startsWith('98')) {
      normalized = '0' + normalized.substring(2);
    }

    if (!normalized.startsWith('0')) {
      normalized = '0' + normalized;
    }

    return normalized;
  }
}
