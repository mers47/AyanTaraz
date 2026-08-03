import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع بارگذاری داده‌های اولیه...');

  // دسته‌بندی‌ها
  await Promise.all([
    prisma.category.create({ data: { name: 'مالیات مستقیم', slug: 'direct-tax', description: 'مقالات و محتوای مرتبط با مالیات‌های مستقیم', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'مالیات بر ارزش افزوده', slug: 'vat', description: 'مقالات مرتبط با مالیات بر ارزش افزوده', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'مشاوره مالیاتی', slug: 'tax-consultation', description: 'راهنماها و مشاوره‌های مالیاتی', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'قوانین و مقررات', slug: 'regulations', description: 'قوانین و مقررات مالیاتی کشور', sortOrder: 4 } }),
  ]);

  // منابع رسمی
  await Promise.all([
    prisma.taxSource.create({ data: { name: 'قانون مالیات‌های مستقیم', officialName: 'سازمان امور مالیاتی کشور', url: 'https://www.intamedia.ir', description: 'قانون مالیات‌های مستقیم مصوب مجلس شورای اسلامی' } }),
    prisma.taxSource.create({ data: { name: 'قانون مالیات بر ارزش افزوده', officialName: 'سازمان امور مالیاتی کشور', url: 'https://www.intamedia.ir', description: 'قانون مالیات بر ارزش افزوده مصوب ۱۴۰۰' } }),
  ]);

  // موضوعات مالیاتی
  await Promise.all([
    prisma.taxTopic.create({ data: { name: 'مالیات بر درآمد اشخاص حقیقی', slug: 'personal-income-tax', description: 'قوانین و مقررات مالیات بر درآمد اشخاص حقیقی', sortOrder: 1 } }),
    prisma.taxTopic.create({ data: { name: 'مالیات بر درآمد اشخاص حقوقی', slug: 'corporate-tax', description: 'قوانین مالیات بر درآمد شرکت‌ها و اشخاص حقوقی', sortOrder: 2 } }),
    prisma.taxTopic.create({ data: { name: 'مالیات بر ارزش افزوده', slug: 'vat-rules', description: 'قوانین و مقررات مالیات بر ارزش افزوده', sortOrder: 3 } }),
    prisma.taxTopic.create({ data: { name: 'معافیت‌های مالیاتی', slug: 'tax-exemptions', description: 'انواع معافیت‌های مالیاتی و شرایط برخورداری', sortOrder: 4 } }),
    prisma.taxTopic.create({ data: { name: 'تکالیف مالیاتی', slug: 'tax-obligations', description: 'تکالیف قانونی مودیان مالیاتی', sortOrder: 5 } }),
  ]);

  // سوالات دستیار مالیاتی
  const q1 = await prisma.taxQuestion.create({
    data: {
      question: 'شما جزو کدام دسته از مودیان مالیاتی هستید؟',
      description: 'لطفاً نوع فعالیت خود را مشخص کنید',
      sortOrder: 1,
      options: {
        create: [
          { label: 'شخص حقیقی (حقوق‌بگیر)', value: 'salary_employee', sortOrder: 1 },
          { label: 'شخص حقیقی (کسب‌وکار شخصی)', value: 'self_employed', sortOrder: 2 },
          { label: 'شخص حقوقی (شرکت)', value: 'corporation', sortOrder: 3 },
          { label: 'مشمول ارزش افزوده', value: 'vat_person', sortOrder: 4 },
        ],
      },
    },
  });

  const q2 = await prisma.taxQuestion.create({
    data: {
      question: 'درآمد سالانه شما (به تومان) چقدر است؟',
      description: 'مبنای محاسبه معافیت مالیاتی',
      sortOrder: 2,
      options: {
        create: [
          { label: 'کمتر از ۱۰۰ میلیون تومان', value: 'income_under_100m', sortOrder: 1 },
          { label: 'بین ۱۰۰ تا ۵۰۰ میلیون تومان', value: 'income_100m_500m', sortOrder: 2 },
          { label: 'بین ۵۰۰ میلیون تا ۱ میلیارد تومان', value: 'income_500m_1b', sortOrder: 3 },
          { label: 'بیشتر از ۱ میلیارد تومان', value: 'income_over_1b', sortOrder: 4 },
        ],
      },
    },
  });

  const q3 = await prisma.taxQuestion.create({
    data: {
      question: 'آیا از معافیت خاصی برخوردار هستید؟',
      description: 'برخی مشاغل و مناطق از معافیت مالیاتی برخوردارند',
      sortOrder: 3,
      options: {
        create: [
          { label: 'خیر، معافیت خاصی ندارم', value: 'no_exemption', sortOrder: 1 },
          { label: 'فعالیت در مناطق آزاد تجاری', value: 'free_zone', sortOrder: 2 },
          { label: 'فعالیت در مناطق محروم', value: 'deprived_area', sortOrder: 3 },
          { label: 'مشمول ماده ۱۳۲ (واحدهای تولیدی جدید)', value: 'article_132', sortOrder: 4 },
          { label: 'معافیت دانش‌بنیان', value: 'knowledge_based', sortOrder: 5 },
        ],
      },
    },
  });

  const q4 = await prisma.taxQuestion.create({
    data: {
      question: 'آیا اظهارنامه مالیاتی خود را به موقع ارسال کرده‌اید؟',
      description: 'تأخیر در ارسال اظهارنامه مشمول جریمه می‌شود',
      sortOrder: 4,
      options: {
        create: [
          { label: 'بله، به موقع ارسال شده', value: 'filed_ontime', sortOrder: 1 },
          { label: 'خیر، هنوز ارسال نکرده‌ام', value: 'not_filed', sortOrder: 2 },
          { label: 'با تأخیر ارسال شده', value: 'filed_late', sortOrder: 3 },
        ],
      },
    },
  });

  const q5 = await prisma.taxQuestion.create({
    data: {
      question: 'آیا مشمول مالیات بر ارزش افزوده هستید؟',
      description: 'شرکت‌ها و کسب‌وکارهای بالای حد نصاب',
      sortOrder: 5,
      options: {
        create: [
          { label: 'بله، ثبت‌نام کرده‌ام', value: 'vat_registered', sortOrder: 1 },
          { label: 'خیر، مشمول نیستم', value: 'vat_not_subject', sortOrder: 2 },
          { label: 'نمی‌دانم / مطمئن نیستم', value: 'vat_unsure', sortOrder: 3 },
        ],
      },
    },
  });

  // Flows - درخت تصمیم
  const getOpt = async (qId: string, val: string) =>
    (await prisma.taxQuestionOption.findFirst({ where: { questionId: qId, value: val } }))!.id;

  await prisma.taxQuestionFlow.createMany({
    data: [
      { fromQuestionId: q1.id, toQuestionId: q2.id, optionId: await getOpt(q1.id, 'salary_employee') },
      { fromQuestionId: q1.id, toQuestionId: q2.id, optionId: await getOpt(q1.id, 'self_employed') },
      { fromQuestionId: q1.id, toQuestionId: q2.id, optionId: await getOpt(q1.id, 'corporation') },
      { fromQuestionId: q1.id, toQuestionId: q5.id, optionId: await getOpt(q1.id, 'vat_person') },
      { fromQuestionId: q2.id, toQuestionId: q3.id, optionId: await getOpt(q2.id, 'income_under_100m') },
      { fromQuestionId: q2.id, toQuestionId: q3.id, optionId: await getOpt(q2.id, 'income_100m_500m') },
      { fromQuestionId: q2.id, toQuestionId: q3.id, optionId: await getOpt(q2.id, 'income_500m_1b') },
      { fromQuestionId: q2.id, toQuestionId: q3.id, optionId: await getOpt(q2.id, 'income_over_1b') },
      { fromQuestionId: q3.id, toQuestionId: q4.id, optionId: await getOpt(q3.id, 'no_exemption') },
      { fromQuestionId: q3.id, toQuestionId: q4.id, optionId: await getOpt(q3.id, 'free_zone') },
      { fromQuestionId: q3.id, toQuestionId: q4.id, optionId: await getOpt(q3.id, 'deprived_area') },
      { fromQuestionId: q3.id, toQuestionId: q4.id, optionId: await getOpt(q3.id, 'article_132') },
      { fromQuestionId: q3.id, toQuestionId: q4.id, optionId: await getOpt(q3.id, 'knowledge_based') },
      { fromQuestionId: q5.id, toQuestionId: q4.id, optionId: await getOpt(q5.id, 'vat_registered') },
      { fromQuestionId: q5.id, toQuestionId: q4.id, optionId: await getOpt(q5.id, 'vat_not_subject') },
      { fromQuestionId: q5.id, toQuestionId: q4.id, optionId: await getOpt(q5.id, 'vat_unsure') },
    ],
  });

  // نتایج
  await prisma.taxAssistantResult.createMany({
    data: [
      {
        name: 'low_income_guidance', title: 'راهنمایی مالیاتی - درآمد پایین',
        description: `با توجه به پاسخ‌های شما، درآمد سالانه شما زیر سقف معافیت مالیاتی قرار دارد.

اقدامات پیشنهادی:
۱. ثبت‌نام در سامانه مودیان (my.tax.gov.ir)
۲. تکمیل اظهارنامه مالیاتی حتی در صورت معافیت
۳. نگهداری اسناد و مدارک درآمدی به مدت ۵ سال

نکته مهم: حتی اگر مالیات شما صفر باشد، ارائه اظهارنامه الزامی است.`,
        ruleIds: [], action: 'REGISTER_TAXPAYER', severity: 'INFO',
      },
      {
        name: 'self_employed_tax_guide', title: 'راهنمای مالیاتی - مشاغل شخصی',
        description: `با توجه به اطلاعات شما به عنوان صاحب کسب‌وکار شخصی:

اقدامات مورد نیاز:
۱. نگهداری دفاتر قانونی (دفتر روزنامه و کل)
۲. محاسبه درآمد مشمول مالیات
۳. تکمیل اظهارنامه عملکرد تا پایان خردادماه
۴. پرداخت مالیات در ۴ قسط مساوی

نرخ‌های مالیاتی:
- تا ۵۰۰ میلیون: ۱۵٪
- ۵۰۰ میلیون تا ۱ میلیارد: ۲۰٪
- بالای ۱ میلیارد: ۲۵٪`,
        ruleIds: [], action: 'FILE_TAX_RETURN', severity: 'INFO',
      },
      {
        name: 'corporate_tax_guide', title: 'راهنمای مالیاتی - اشخاص حقوقی',
        description: `به عنوان یک شخص حقوقی (شرکت):

تکالیف قانونی:
۱. نرخ مالیات: ۲۵٪ از درآمد مشمول مالیات
۲. تسلیم اظهارنامه حداکثر تا ۴ ماه پس از پایان سال مالی
۳. ارائه صورت‌های مالی حسابرسی شده
۴. پرداخت علی‌الحساب مالیات به صورت ماهانه

نکات مهم:
- نگهداری اسناد و دفاتر قانونی الزامی است
- عدم ارائه به موقع اظهارنامه مشمول جریمه ۳۰٪ می‌شود`,
        ruleIds: [], action: 'CONSULT_ACCOUNTANT', severity: 'WARNING',
      },
      {
        name: 'vat_guidance', title: 'راهنمای مالیات بر ارزش افزوده',
        description: `راهنمای مالیات بر ارزش افزوده:

۱. نرخ مالیات بر ارزش افزوده: ۱۰٪ (۹٪ مالیات + ۱٪ عوارض)
۲. مهلت تسلیم اظهارنامه: ۱۵ روز پس از پایان هر دوره
۳. صورتحساب الکترونیکی الزامی است

کالاهای معاف:
- محصولات کشاورزی فرآوری نشده
- دارو و تجهیزات پزشکی
- کالاهای اساسی

جرایم:
- عدم ثبت‌نام: ۷۵٪ مالیات متعلق
- عدم صدور صورتحساب: ۵۰٪`,
        ruleIds: [], action: 'REGISTER_VAT', severity: 'WARNING',
      },
      {
        name: 'need_consultation', title: 'نیاز به مشاوره تخصصی',
        description: `با توجه به پیچیدگی وضعیت مالیاتی شما، توصیه می‌شود از مشاوره تخصصی بهره ببرید.

مواردی که نیاز به بررسی بیشتر دارند:
- معافیت‌های خاص و شرایط برخورداری
- محاسبه دقیق درآمد مشمول مالیات
- استفاده از معافیت‌های قانونی ماده ۱۳۲

برای رزرو وقت مشاوره می‌توانید از بخش "مشاوره" در سایت استفاده کنید.`,
        ruleIds: [], action: 'BOOK_CONSULTATION', severity: 'NEEDS_REVIEW',
      },
    ],
  });

  // سرویس مشاوره
  const service1 = await prisma.consultationService.create({
    data: { name: 'مشاوره مالیاتی مقدماتی', slug: 'basic-tax-consultation', description: 'مشاوره ۳۰ دقیقه‌ای', duration: 30, price: 500000, sortOrder: 1 },
  });
  await prisma.consultationService.create({
    data: { name: 'مشاوره مالیاتی تخصصی', slug: 'expert-tax-consultation', description: 'مشاوره ۶۰ دقیقه‌ای', duration: 60, price: 1000000, sortOrder: 2 },
  });

  for (let day = 0; day <= 4; day++) {
    await prisma.consultationAvailability.create({ data: { serviceId: service1.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00' } });
  }

  // تنظیمات
  await prisma.adminSetting.createMany({
    data: [
      { key: 'site_name', value: 'آیان تراز', description: 'نام سایت' },
      { key: 'site_description', value: 'خدمات تخصصی حسابداری و مشاوره مالیاتی', description: 'توضیحات سایت' },
      { key: 'max_otp_attempts', value: '3', description: 'حداکثر تلاش OTP' },
      { key: 'otp_expiry_minutes', value: '5', description: 'اعتبار کد تأیید' },
      { key: 'session_expiry_hours', value: '24', description: 'اعتبار نشست' },
    ],
  });

  console.log('✅ داده‌های اولیه با موفقیت بارگذاری شد.');
}

main().catch((e) => { console.error('❌ خطا:', e); process.exit(1); }).finally(() => prisma.$disconnect());
