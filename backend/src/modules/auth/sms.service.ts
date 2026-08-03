import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const SMS_TEMPLATES: Record<number, { prefix: string; label: string }> = {
  0: { prefix: 'کد: ', label: 'کد' },
  1: { prefix: 'کد ورود به آیان تراز: ', label: 'کد ورود' },
  2: { prefix: 'کد تأیید آیان تراز: ', label: 'کد تأیید' },
  3: { prefix: 'رمز عبور موقت آیان تراز: ', label: 'رمز' },
  4: { prefix: 'رمز ورود آیان تراز: ', label: 'رمز ورود' },
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('SMS_API_URL', '');
    this.apiKey = this.configService.get<string>('SMS_API_KEY', '');
  }

  buildMessage(code: string, template: number = 1): string {
    const t = SMS_TEMPLATES[template] || SMS_TEMPLATES[0];
    return `${t.prefix}${code}\n\nآیان تراز\nمشاوره مالیاتی و حسابداری`;
  }

  async send(phone: string, code: string, template = 1): Promise<boolean> {
    const normalized = this.normalize(phone);
    const message = this.buildMessage(code, template);
    if (!this.apiUrl) { this.logDev(normalized, message, template); return false; }
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(this.apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}) },
        body: JSON.stringify({ code, mobile: normalized, template, message }), signal: ctrl.signal,
      });
      clearTimeout(to);
      if (!res.ok) { this.logger.warn(`SMS ${res.status}`); return false; }
      const json = await res.json();
      if (json.success === true || json.data === true) { this.logger.log(`SMS sent to ${normalized}`); return true; }
      return false;
    } catch (e: any) { this.logger.error(`SMS error: ${e.message}`); return false; }
  }

  async sendWithFallback(phone: string, code: string, template = 1): Promise<void> {
    const sent = await this.send(phone, code, template);
    if (!sent) { this.logger.warn(`SMS fallback for ${phone}`); this.logDev(phone, this.buildMessage(code, template), template); }
  }

  private normalize(phone: string): string {
    let n = phone.replace(/[\s\-()]/g, '');
    if (n.startsWith('+98')) n = '0' + n.substring(3);
    else if (n.startsWith('98')) n = '0' + n.substring(2);
    if (!n.startsWith('0')) n = '0' + n;
    return n;
  }

  private logDev(phone: string, msg: string, template: number) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`\n📱 [DEV SMS]\nTo: ${phone}\nTemplate: ${SMS_TEMPLATES[template]?.label}\n${msg}\n`);
    }
  }
}
