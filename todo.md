# ممیزی و اصلاح کد — آماده‌سازی پروداکشن

بر اساس ممیزی کامل مخزن `mers47/AyanTaraz` (برANCH `main`)، موارد زیر شناسایی شده و در ۷ فاز تقسیم‌بندی شده‌اند. هر فاز با کامیت، PR و مرج پایان می‌یابد و پیش از شروع فاز بعدی، تأیید کاربر لازم است.

---

## فاز ۱ — اصلاحات امنیتی بحرانی (Critical Security Fixes)
- [x] 1.1: حذف `.env` از رهگیری گیت (`git rm --cached .env`) — فایل با مقادیر حساس در گیت رهگیری شده است
- [x] 1.2: ایجاد `.env.example` با مقادیر نمونه و کامنت‌گذاری کامل
- [x] 1.3: محدود کردن `remotePatterns` در `next.config.js` — فقط دامنه‌های مجاز به جای `hostname: '**'`
- [x] 1.4: اضافه کردن احراز هویت به `uploadReceipt` در consultation controller (حالا `@Public` است — هرکس می‌تواند فایل آپلود کند)
- [x] 1.5: اصلاح fallback UUID در admin controller — به جای `'00000000-...'` باید خطای 401 پرتاب شود اگر `req.user` وجود نداشته باشد
- [x] 1.6: کامیت، push، ایجاد PR، مرج به main

## فاز ۲ — تکمیل کد ناقص و سرویس‌های استاب (Incomplete & Stub Features)
- [x] 2.1: تکمیل `MediaService` — اضافه کردن متدهای `upload()`, `delete()`, `getById()` (حالا فقط `list()` وجود دارد)
- [x] 2.2: تکمیل `MediaController` — endpoint های آپلود و حذف با guard ادمین
- [x] 2.3: اتصال `AuditService.log()` به عملیات ادمین در `admin.service.ts` (AuditService وجود دارد اما هیچ‌جا فراخوانی نمی‌شود — کد مرده/صوری)
- [x] 2.4: تکمیل Step 4 فاز ۶ — endpoint آمار داشبورد در `admin.service.ts` + `admin.controller.ts`
- [x] 2.5: اصلاح auto-create availability در consultation service — نباید به‌صورت خودکار رکورد بسازد؛ در صورت نبود داده، خطای مناسب برگرداند
- [ ] 2.6: کامیت، push، PR، مرج

## فاز ۳ — اصلاح ناسازگاری‌ها و کیفیت کد بک‌اند (Backend Code Quality)
- [ ] 3.1: راه‌اندازی Swagger در `main.ts` — import‌ها در کنترلرها وجود دارد اما `SwaggerModule.setup` فراخوانی نمی‌شود (فقط در dev)
- [ ] 3.2: اصلاح مدیریت خطا در `uploadReceipt` — به جای `{ error: ... }` باید `HttpException` پرتاب شود
- [ ] 3.3: جایگزینی `fs.writeFileSync` (همگام/مسدودکننده) با `fs.promises.writeFile` (ناهمگام)
- [ ] 3.4: جایگزینی native `fetch` در `sms.service.ts` با `axios`
- [ ] 3.5: حذف/کاهش `any` در بک‌اند (~۵۷ مورد) — تعریف DTO و تایپ مناسب
- [ ] 3.6: اصلاح naming مخفف در بک‌اند (`getQ`, `nid`, `d`, `vals.includes('sal')` در tax-assistant)
- [ ] 3.7: کامیت، push، PR، مرج

## فاز ۴ — اصلاح کیفیت کد و UI فرانت‌اند (Frontend Code Quality)
- [ ] 4.1: حذف/کاهش `any` در فرانت‌اند (~۶۶ مورد) — تایپ‌گذاری کامل `adminApi` و `RecentActivity`
- [ ] 4.2: اصلاح naming مخفف در `admin/page.tsx` (`tb, st, ss, sa, su, sl, ld, sl2` → نام‌گذاری واضح)
- [ ] 4.3: جایگزینی inline style در `chatbot/page.tsx` با کلاس‌های Tailwind
- [ ] 4.4: داینامیک کردن آمار صفحه فرود — به جای مقادیر هاردکد از API/AdminSetting بخواند
- [ ] 4.5: حذف `TOTAL_QS = 6` هاردکد در chatbot — تعداد سؤال‌ها از درخت تصمیم محاسبه شود
- [ ] 4.6: کامیت، push، PR، مرج

## فاز ۵ — بهبود زیرساخت و دیپلوی (Infrastructure & Deployment)
- [ ] 5.1: اضافه کردن پیکربندی HTTPS/TLS در nginx (حالا فقط HTTP روی پورت ۸۰)
- [ ] 5.2: بهبود Dockerfileها — health check دقیق‌تر، .dockerignore بهینه
- [ ] 5.3: بررسی و تکمیل GitHub Actions CI — اضافه کردن lint/type-check
- [ ] 5.4: بهبود docker-compose — environment validation، restart policy
- [ ] 5.5: کامیت، push، PR، مرج

## فاز ۶ — بهبود منطق تجاری و تست (Business Logic & Testing)
- [ ] 6.1: بهبود `determine()` در tax-assistant — به جای هاردکد value matching از مپینگ دیتابیس استفاده کند
- [ ] 6.2: اضافه کردن تست واحد برای سرویس‌های کلیدی: auth, otp, consultation, admin
- [ ] 6.3: اضافه کردن تست integration برای endpoint های بحرانی
- [ ] 6.4: کامیت، push، PR، مرج

## فاز ۷ — بررسی نهایی و آماده‌سازی پروداکشن (Final Review)
- [ ] 7.1: اجرای کامل build بک‌اند و فرانت‌اند — اطمینان از عدم خطا
- [ ] 7.2: اجرای تست‌ها و lint
- [ ] 7.3: بررسی نهایی امنیتی — اسکن وابستگی‌ها، بررسی مجدد .env
- [ ] 7.4: به‌روزرسانی README و مستندات دیپلوی
- [ ] 7.5: کامیت نهایی، PR، مرج — پروژه آماده پروداکشن
