# Production-Readiness Audit — AyanTaraz

> تاریخ: ۱۴۰۵/۰۵/۲۱  •  روش: اجرای واقعی build/audit/migration-diff (نه شبیه‌سازی)

## خلاصه اجرایی

| حوزه | وضعیت | توضیح |
|---|---|---|
| Build بک‌اند | ✅ تایید | prisma generate (musl+glibc)، type-check، nest build، seed compile همگی پاس |
| Build فرانت‌اند | ✅ تایید | next build → ۱۴ صفحه (static+dynamic)، ۰ خطا |
| Type Integrity | ✅ تایید | بک‌اند و فرانت‌اند tsc --noEmit بدون خطا |
| Dependency Audit فرانت | ✅ تایید | ۰ آسیب‌پذیری |
| Dependency Audit بک | ⚠️ ۱ مورد | `js-yaml` (high) از طریق `@nestjs/swagger` — قابل audit fix |
| Schema ↔ Migration | 🔴 drift (اصلاح شد) | ستون‌های پرداخت ConsultationBooking در migration موجود نبود |
| امنیت | ✅ قوی | helmet, CORS, ValidationPipe, Throttler, JWT fail-fast, non-root, nginx headers |
| تست | ⚠️ کم اما واقعی | ۹ تست (stub حذف شد) — پوشش ماژول‌ها پایین |
| Infra (Docker/Nginx) | ✅ قوی | multi-stage، healthcheck، non-root، rate-limit، gzip، caching |

## یافته‌های بحرانی (اصلاح‌شده در این PR)

### ۱) Drift بین Prisma Schema و Migration — 🔴 بحرانی
`schema.prisma` شامل enum `PaymentStatus` و ستون‌های `amount, paidAt, paymentStatus, receiptFileName, receiptUrl` در جدول `ConsultationBooking` بود، اما `migration.sql` موجود (20260805000000_init) این تغییرات را نداشت.

**اثر production:** کد `consultation.service.ts` در ۷ نقطه از این ستون‌ها استفاده می‌کند (ساخت booking با `paymentStatus: 'UNPAID'`، آپلود رسیپ با `receiptUrl/receiptFileName`)، اما `prisma migrate deploy` این ستون‌ها را اعمال نمی‌کرد → خطای runtime `column "paymentStatus" does not exist` هنگام رزرو مشاوره یا آپلود رسید.

**تایید با اجرای واقعی:** `prisma migrate diff` drift را نشان داد → migration جدید تولید شد → اعمال شد → diff مجدد: "No difference detected".

**اصلاح:** افزودن migration `20260812162323_add_consultation_payment`.

### ۲) تست stub نمایشی — ⚠️ حذف شد
`test/full-suite.test.ts` تنها شامل `expect(true).toBe(true)` بود. با ۵ تست واقعی روی `resolveJwtSecret` (منطق امنیتی JWT: fail-fast در production، رد CHANGE_ME، trim) جایگزین شد.

## یافته‌های غیربحرانی (توصیه‌شده برای ادامه)

### ۳) آسیب‌پذیری `js-yaml` (high) — بک‌اند
از طریق `@nestjs/swagger` وارد می‌شود. در production تاثیر محدود (Swagger فقط در غیر-production فعال است) ولی توصیه: `npm audit fix` یا ارتقای `@nestjs/swagger`.

### ۴) استفاده از `any` در بک‌اند — ۱۷ مورد
بیشتر در `content.service.ts` و `auth.service.ts` (مثل `user: any`, `data: any`). با اینکه `tsconfig` `noImplicitAny` دارد، این موارد explicit هستند. برای کاهش ریسک تایپ، توصیه می‌شود با DTO/interface جایگزین شوند.

### ۵) پوشش تست پایین
۹ تست برای ۱۳ ماژول. توصیه: افزودن تست واحد برای auth, consultation, tax-assistant.

### ۶) CSP شامل `unsafe-inline`/`unsafe-eval`
به‌خاطر Next.js اجتناب‌ناپذیر است؛ با nonce-based CSP در آینده قابل بهینه‌سازی.

### ۷) حساسیت بیلد به incremental cache
`nest build` در صورت وجود `*.tsbuildinfo` ناقص خروجی تولید نمی‌کرد. در CI/Docker (clean) مشکلی نیست، اما `deleteOutDir: true` موجود است و توصیه می‌شود در CI همیشه clean اجرا شود.

## نتیجه‌گیری

پروژه از نظر معماری، امنیت، و infrastructure **آماده production** است. دو مورد بحرانی (drift migration و تست stub) در این PR اصلاح شد. با رفع آسیب‌پذیری `js-yaml` و افزایش پوشش تست، آمادگی کامل خواهد بود.
