# آیان تراز — پلتفرم حسابداری و مشاوره مالیاتی

## 📋 بررسی کلی

**آیان تراز** یک پلتفرم جامع و آماده-پروداکشن برای خدمات تخصصی حسابداری و مشاوره مالیاتی است. این پروژه با رویکرد **Modular Monolith** و به زبان فارسی طراحی شده است.

### ویژگی‌های کلیدی

- ✅ طراحی Premium مشکی/طلایی
- ✅ احراز هویت با شماره موبایل و کد تأیید (OTP)
- ✅ **دستیار مالیاتی قطعی (بدون هوش مصنوعی)** با درخت تصمیم
- ✅ محتوای قابل پیگیری با ارجاع به منابع رسمی
- ✅ سیستم رزرو مشاوره
- ✅ **پنل مدیریت کامل** با گزارش‌گیری حسابرسی
- ✅ طراحی واکنش‌گرا (Mobile-First)
- ✅ کاملاً فارسی و RTL

---

## 🏗️ معماری

```
USER
 ↓
CDN/WAF/HTTPS (Nginx)
 ↓
Next.js (Frontend - RTL فارسی)
 ↓
REST API / NestJS (Backend - Modular Monolith)
 ├─ PostgreSQL + Prisma (منبع حقیقت)
 ├─ Redis (OTP, Rate Limiting, نشست چت‌بات)
 └─ Object Storage (فایل‌های رسانه‌ای)
```

### ساختار پروژه

```
ayan-taraz/
├── backend/                   # NestJS Modular Monolith
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # احراز هویت با OTP
│   │   │   ├── tax-assistant/ # دستیار مالیاتی قطعی
│   │   │   ├── admin/         # پنل مدیریت
│   │   │   ├── content/       # مقالات، ویدیوها
│   │   │   ├── consultation/  # سیستم رزرو
│   │   │   └── audit/         # گزارش‌گیری حسابرسی
│   │   ├── common/            # ابزارهای مشترک
│   │   └── prisma/            # لایه دیتابیس
│   ├── prisma/
│   │   ├── schema.prisma     # اسکیمای دیتابیس
│   │   └── seed.ts           # داده‌های اولیه فارسی
│   └── Dockerfile
│
├── frontend/                  # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # صفحه اصلی (landing)
│   │   │   ├── chatbot/      # دستیار مالیاتی
│   │   │   └── admin/        # پنل مدیریت
│   │   ├── components/       # کامپوننت‌های اشتراکی
│   │   ├── lib/api.ts        # API Client
│   │   └── types/            # TypeScript Types
│   └── Dockerfile
│
├── docker-compose.yml        # Docker Compose
└── README.md
```

---

## 🚀 راه‌اندازی سریع

### پیش‌نیازها

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### توسعه محلی

1. **کلون کردن مخزن:**

```bash
git clone https://github.com/mers47/AyanTaraz.git
cd AyanTaraz
```

2. **راه‌اندازی سرویس‌ها:**

```bash
docker-compose up -d
```

3. **دسترسی به سرویس‌ها:**

| سرویس | آدرس |
|--------|------|
| فرانت‌اند | http://localhost:3000 |
| API بک‌اند | http://localhost:4000 |
| مستندات API | http://localhost:4000/api/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

4. **راه‌اندازی دیتابیس:**

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 🎯 ویژگی‌های اصلی

### دستیار مالیاتی (بدون AI)

- موتور تصمیم‌گیری قطعی با درخت سوال و جواب
- ۵ سوال اصلی با گزینه‌های متعدد
- ۵ نتیجه از پیش تعریف شده با راهنمایی کامل
- مسیریابی شرطی (Condition-based routing)
- ذخیره‌سازی نشست در Redis
- ارجاع به منابع رسمی مالیاتی

**نحوه کار:**
1. کاربر نوع فعالیت خود را انتخاب می‌کند
2. درآمد سالانه را مشخص می‌کند
3. وضعیت معافیت‌ها را اعلام می‌کند
4. وضعیت اظهارنامه را مشخص می‌کند
5. نتیجه نهایی با راهنمایی کامل نمایش داده می‌شود

### پنل مدیریت

- **داشبورد:** آمار کلی (کاربران، مقالات، قوانین، رزروها)
- **کاربران:** جستجو، مشاهده، مدیریت نقش‌ها
- **گزارش‌ها:** audit log کامل با فیلتر و صفحه‌بندی

### تم دارک/طلایی

- پس‌زمینه مشکی
- رنگ طلایی (#ca8a04) به عنوان accent
- تایپوگرافی Inter + Vazirmatn
- طراحی RTL کامل فارسی

---

## 📦 تکنولوژی‌ها

### بک‌اند
| تکنولوژی | کاربرد |
|-----------|--------|
| NestJS 10+ | فریم‌ورک |
| TypeScript | زبان |
| PostgreSQL + Prisma | دیتابیس |
| Redis (ioredis) | کش و نشست |
| JWT | احراز هویت |
| Swagger | مستندات API |

### فرانت‌اند
| تکنولوژی | کاربرد |
|-----------|--------|
| Next.js 14 (App Router) | فریم‌ورک |
| TypeScript | زبان |
| Tailwind CSS | استایل‌دهی |
| Axios | HTTP Client |

---

## 🔒 امنیت

- Rate Limiting برای OTP و API
- JWT با secure cookies
- CSRF Protection
- XSS Protection
- SQL Injection Prevention (Prisma ORM)
- IDOR Protection
- Audit Logging

---

## 📊 اسکیمای دیتابیس

مدل‌های اصلی:

- **User** — حساب‌های کاربری
- **Session** — نشست‌های احراز هویت
- **OTP** — کدهای یکبار مصرف
- **Article, Video, MiniBook** — محتوا
- **Category, Tag** — دسته‌بندی
- **TaxTopic, TaxRule, TaxRuleVersion** — قوانین مالیاتی
- **TaxSource** — منابع رسمی
- **TaxQuestion, TaxQuestionOption, TaxQuestionFlow** — درخت تصمیم
- **TaxAssistantResult** — نتایج دستیار
- **ConsultationService, ConsultationAvailability, ConsultationSlot** — رزرو
- **ConsultationBooking** — رزرو کاربران
- **AdminAction** — گزارش حسابرسی
- **AdminSetting** — تنظیمات ادمین
- **SEOConfig, Redirect** — سئو
- **Media** — فایل‌های رسانه‌ای

---

## 🚀 دیپلوی پروداکشن (یک دستور!)

اسکریپت `deploy.sh` به‌صورت **کاملاً خودکار** همه چیز را انجام می‌دهد:

```bash
# فقط این را اجرا کنید — همه چیز خودکار است!
./deploy.sh
```

### 🎯 اسکریپت چه می‌کند؟

| مرحله | توضیح |
|-------|-------|
| ۱. نصب Docker | اگر Docker نصب نیست، خودکار نصب می‌کند |
| ۲. تولید `.env` | پسورد PostgreSQL، JWT Secret و تمام رمزها را **خودکار** تولید می‌کند |
| ۳. پرسش ادمین | فقط شماره موبایل ادمین ارشد را از شما می‌پرسد |
| ۴. پرسش SMS API | کلید SMS API را می‌پرسد (می‌توانید Enter بزنید و بعداً اضافه کنید) |
| ۵. Build | تمام ایمیج‌های Docker را build می‌کند |
| ۶. Migrate | دیتابیس را migrate می‌کند |
| ۷. Seed | داده‌های قوانین مالیاتی ۱۴۰۵ را بارگذاری می‌کند |
| ۸. Start | تمام سرویس‌ها را راه‌اندازی می‌کند |
| ۹. Health Check | وضعیت همه سرویس‌ها را بررسی می‌کند |

### 📋 دستورات

```bash
./deploy.sh                    # دیپلوی کامل + تولید خودکار .env
./deploy.sh domain example.com # فعال‌سازی دامنه + SSL خودکار (Certbot)
./deploy.sh ssl example.com    # فقط نصب SSL روی دامنه موجود
./deploy.sh status             # بررسی وضعیت سرویس‌ها
./deploy.sh logs [svc]         # مشاهده لاگ‌ها (اختیاری: سرویس خاص)
./deploy.sh restart            # راه‌اندازی مجدد
./deploy.sh down               # توقف همه سرویس‌ها
./deploy.sh reset              # حذف کامل دیتابیس (خطر!)
```

### 🔑 بعد از دیپلوی — جای‌گذاری کلید SMS API

اگر در زمان دیپلوی کلید SMS را خالی گذاشتید، بعداً این کار را بکنید:

```bash
nano .env
# بخش زیر را پیدا و پر کنید:
#   SMS_API_URL=https://api.kavenegar.com/v1/...
#   SMS_API_KEY=your-api-key
#   SMS_SENDER=your-sender-number

# سپس ری‌استارت کنید:
./deploy.sh restart
```

### 🌍 فعال‌سازی دامنه + SSL

```bash
# ۱. رکورد DNS دامنه را به IP سرور اشاره دهید
# ۲. اجرا کنید:
./deploy.sh domain ayantaraz.com

# اسکریپت خودکار:
#   ✓ CORS و BASE_URL را برای دامنه آپدیت می‌کند
#   ✓ Frontend را rebuild می‌کند
#   ✓ SSL Certbot را نصب می‌کند
#   ✓ گواهی Let's Encrypt را دریافت می‌کند
#   ✓ Nginx را برای HTTPS کانفیگ می‌کند
#   ✓ تمدید خودکار SSL را تنظیم می‌کند (هر ۱۲ روز)
```

### 👤 ورود به پنل ادمین

پس از دیپلوی، با شماره موبایلی که در زمان نصب وارد کردید وارد شوید:

```
URL:     http://YOUR_SERVER_IP/admin
شماره:   همان شماره‌ای که به‌عنوان ادمین ارشد وارد کردید
کد OTP:  اگر SMS API تنظیم شده → پیامک می‌شود
         اگر SMS API خالی است → در لاگ کنسول: ./deploy.sh logs backend
```

---

## 📄 مجوز

MIT License

---

**ساخته شده با ❤️ برای صنعت خدمات مالی**
