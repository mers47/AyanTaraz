# راهنمای راه‌اندازی SMS برای محیط تولید

این راهنما نحوه پیکربندی ارسال پیامک تأیید (OTP) در محیط تولید (Production) را برای پلتفرم **آیان تراز** شرح می‌دهد.

---

## ۱. متغیرهای محیطی مورد نیاز

در فایل `.env` بک‌اند (پوشه `backend/`) متغیرهای زیر باید تنظیم شوند:

```env
# آدرس API سرویس پیامک شما
SMS_API_URL=https://your-sms-provider.com/api/send

# کلید API (Bearer Token) سرویس پیامک
SMS_API_KEY=your-api-key-here

# محیط اجرا (در production پیامک‌های واقعی ارسال می‌شود)
NODE_ENV=production
```

> **نکته مهم:** اگر `SMS_API_URL` خالی باشد یا تنظیم نشده باشد، سیستم به حالت توسعه (Dev) برمی‌گردد و کد OTP فقط در کنسول سرور چاپ می‌شود. این رفتار برای محیط توسعه مناسب است اما در تولید **باید** تنظیم شود.

---

## ۲. قرارداد API پیامک

سرویس SMS آیان تراز (`backend/src/modules/auth/sms.service.ts`) یک درخواست POST به `SMS_API_URL` ارسال می‌کند با ساختار زیر:

### درخواست (Request)

```http
POST {SMS_API_URL}
Content-Type: application/json
Authorization: Bearer {SMS_API_KEY}

{
  "code": "123456",
  "mobile": "09123456789",
  "template": 1,
  "message": "کد ورود به آیان تراز: 123456\n\nآیان تراز\nمشاوره مالیاتی و حسابداری"
}
```

### پاسخ مورد انتظار (Response)

سیستم یکی از دو ساختار زیر را به عنوان موفقیت می‌پذیرد:

```json
{ "success": true }
```
یا
```json
{ "data": true }
```

اگر پاسخ این الگو را نداشته باشد، ارسال ناموفق تلقی شده و سیستم به fallback (چاپ در کنسول) برمی‌گردد.

---

## ۳. قالب‌های پیامک (Templates)

سیستم از ۵ قالب پیش‌فرض پشتیبانی می‌کند:

| شماره قالب | پیشوند پیام | کاربرد |
|-----------|-------------|--------|
| 0 | `کد: ` | عمومی |
| 1 | `کد ورود به آیان تراز: ` | ورود به سیستم (پیش‌فرض) |
| 2 | `کد تأیید آیان تراز: ` | تأیید عملیات |
| 3 | `رمز عبور موقت آیان تراز: ` | بازنشانی رمز |
| 4 | `رمز ورود آیان تراز: ` | رمز ورود دومرحله‌ای |

قالب پیش‌فرض برای ورود شماره **۱** است. برای تغییر قالب، پارامتر `type` در درخواست `send-otp` را تنظیم کنید.

---

## ۴. پیکربندی با سرویس‌های پیامک ایرانی

### ۴.۱. کاوه‌نگار (Kavenegar)

کاوه‌نگار از قالب‌های از پیش تعریف شده (Pattern) استفاده می‌کند. نیاز به یک لایه میانی (Middleware) دارید که درخواست آیان تراز را به فرمت کاوه‌نگار تبدیل کند:

```env
SMS_API_URL=https://your-middleware.com/kavenegar-send
SMS_API_KEY=your-kavenegar-api-key
```

**نمونه لایه میانی (Node.js):**

```javascript
// middleware.js — بین آیان تراز و کاوه‌نگار
const express = require('express');
const app = express();
app.use(express.json());

app.post('/kavenegar-send', async (req, res) => {
  const { code, mobile, message } = req.body;
  // کاوه‌نگار: استفاده از verify API
  const url = `https://api.kavenegar.com/v1/${req.headers.authorization.replace('Bearer ','')}/verify/lookup.json`;
  const params = new URLSearchParams({
    receptor: mobile,
    token: code,
    template: 'ayantaraz-login' // نام قالب در پنل کاوه‌نگار
  });
  const r = await fetch(`${url}?${params}`);
  const j = await r.json();
  res.json({ success: j.return?.status === 200 });
});
app.listen(3001);
```

### ۴.۲. قاصدک (Ghasedak)

```env
SMS_API_URL=https://your-middleware.com/ghasedak-send
SMS_API_KEY=your-ghasedak-api-key
```

### ۴.۳. ملی‌پیامک (MeliPayamak)

```env
SMS_API_URL=https://your-middleware.com/melipayamak-send
SMS_API_KEY=your-melipayamak-api-key
```

### ۴.۴. فراپیامک (Farapayamak)

```env
SMS_API_URL=https://your-middleware.com/farapayamak-send
SMS_API_KEY=your-farapayamak-api-key
```

> **توجه:** اکثر سرویس‌های پیامک ایرانی از قالب‌های OTP با متغیر (Pattern-based) استفاده می‌کنند که فرمت متفاوتی از درخواست مستقیم آیان تراز دارند. استفاده از لایه میانی توصیه می‌شود.

---

## ۵. راه‌اندازی سریع (Quick Start)

### مرحله ۱: ایجاد فایل `.env` در پوشه `backend/`

```bash
cd backend
cp .env.example .env
```

### مرحله ۲: تنظیم متغیرهای SMS

```env
SMS_API_URL=https://your-sms-middleware.com/send
SMS_API_KEY=your-secret-key
NODE_ENV=production
```

### مرحله ۳: تست ارسال پیامک

می‌توانید با ارسال درخواست به API تست کنید:

```bash
curl -X POST http://localhost:4000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"09123456789","type":"PHONE_VERIFICATION"}'
```

در محیط توسعه (NODE_ENV ≠ production)، کد OTP در کنسول سرور چاپ می‌شود:

```
📱 [DEV SMS]
To: 09123456789
Template: کد ورود
کد ورود به آیان تراز: 123456

آیان تراز
مشاوره مالیاتی و حسابداری
```

---

## ۶. نرمال‌سازی شماره موبایل

سیستم به‌طور خودکار شماره‌ها را نرمال می‌کند:

- `+989123456789` → `09123456789`
- `989123456789` → `09123456789`
- `9123456789` → `09123456789`
- `0912-345-6789` → `09123456789` (حذف فاصله و خط تیره)

---

## ۷. عیب‌یابی (Troubleshooting)

### پیامک ارسال نمی‌شود

۱. **بررسی `SMS_API_URL`:** مطمئن شوید خالی نیست و آدرس صحیح است.
۲. **بررسی `SMS_API_KEY`:** کلید API معتبر باشد.
۳. **بررسی `NODE_ENV`:** در تولید باید `production` باشد.
۴. **بررسی لاگ‌های سرور:** خطاهای SMS در لاگ با برچسب `SmsService` نمایش داده می‌شوند.

### کد در کنسول چاپ می‌شود اما پیامک واقعی نمی‌رسد

این یعنی `SMS_API_URL` تنظیم نشده یا ناموفق بوده و سیستم به fallback رسیده است. آدرس و کلید API را بررسی کنید.

### خطای timeout

سیستم ۸ ثانیه timeout دارد. اگر سرویس پیامک کند است، ممکن است timeout رخ دهد. در این صورت fallback فعال می‌شود.

---

## ۸. امنیت

- **هرگز** کلید API پیامک را در Git commit نکنید. فایل `.env` در `.gitignore` قرار دارد.
- کلید API را به‌صورت متغیر محیطی در سرور تولید تنظیم کنید (نه در فایل).
- نرخ ارسال OTP را محدود کنید (Rate Limiting) تا از سوءاستفاده جلوگیری شود.
- کد OTP پس از مدت مشخصی منقضی می‌شود (توسط `OTPService` مدیریت می‌شود).

---

## ۹. فایل‌های مرتبط

| فایل | توضیح |
|------|-------|
| `backend/src/modules/auth/sms.service.ts` | سرویس اصلی ارسال پیامک |
| `backend/src/modules/auth/auth.service.ts` | تولید و تأیید OTP |
| `backend/src/modules/auth/otp.service.ts` | مدیریت ذخیره و انقضای کد |
| `backend/.env.example` | نمونه متغیرهای محیطی |
