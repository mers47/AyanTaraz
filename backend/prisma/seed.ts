import { PrismaClient, UserRole, TaxResultSeverity } from '@prisma/client';
const P = new PrismaClient();

const split = (v?: string) => (v || '').split(',').map((x) => x.trim()).filter(Boolean);

async function main() {
  console.log('🌱 بارگذاری داده‌های پایه آیان تراز — قوانین مالیاتی ۱۴۰۵');

  await P.category.createMany({ skipDuplicates: true, data: [
    { name: 'مالیات مستقیم', slug: 'direct-tax', sortOrder: 1 },
    { name: 'ارزش افزوده', slug: 'vat', sortOrder: 2 },
    { name: 'مشاوره', slug: 'consult', sortOrder: 3 },
    { name: 'قوانین ۱۴۰۵', slug: 'regs-1405', sortOrder: 4 },
  ] });

  await P.taxSource.createMany({ skipDuplicates: true, data: [
    { name: 'قانون مالیات‌های مستقیم ۱۴۰۵', officialName: 'سازمان امور مالیاتی', url: 'https://intamedia.ir', description: 'داده پایه قابل بازبینی توسط ادمین؛ قبل از اتکا در تولید با منبع رسمی تطبیق داده شود.' },
    { name: 'قانون VAT ۱۴۰۵', officialName: 'سازمان امور مالیاتی', url: 'https://evat.ir', description: 'داده پایه قابل بازبینی توسط ادمین؛ نرخ‌ها باید قبل از انتشار نهایی ممیزی شوند.' },
  ] });
  const source = await P.taxSource.findUniqueOrThrow({ where: { name: 'قانون مالیات‌های مستقیم ۱۴۰۵' } });

  const topics = [
    ['اشخاص حقیقی', 'personal', 1], ['اشخاص حقوقی', 'corp', 2], ['VAT ۱۴۰۵', 'vat-1405', 3], ['معافیت‌ها', 'exempt', 4],
    ['مالیات حقوق', 'salary-tax', 5], ['مشاغل', 'biz-tax', 6], ['مستغلات', 'property', 7], ['جرایم', 'penalties', 8],
  ] as const;
  await P.taxTopic.createMany({ skipDuplicates: true, data: topics.map(([name, slug, sortOrder]) => ({ name, slug, sortOrder })) });
  const topicBySlug = Object.fromEntries((await P.taxTopic.findMany()).map((t) => [t.slug, t]));

  const rules = [
    ['salary-tax', 'معافیت حقوق ۱۴۰۵', 'sal-exempt', 'سقف معافیت: ۴۰ میلیون تومان در ماه (۴۸۰M سالانه) — افزایش ۶۶.۶٪ نسبت به ۱۴۰۴'],
    ['salary-tax', 'نرخ پلکانی حقوق ۱۴۰۵', 'sal-rates', '۴۰-۸۰M:۱۰٪|۸۰-۱۰۰M:۱۵٪|۱۰۰-۱۲۰M:۲۰٪|۱۲۰-۱۴۰M:۲۵٪|+۱۴۰M:۳۰٪'],
    ['salary-tax', 'مالیات مزایا ۱۴۰۵', 'sal-bonus', 'مزایا و پاداش‌ها با نرخ ثابت ۱۰٪'],
    ['salary-tax', 'جرایم عدم ارسال لیست حقوق', 'sal-penalty', 'عدم ارسال لیست: ۲٪ حقوق|عدم پرداخت: ۱۰٪+۲.۵٪/ماه تأخیر'],
    ['biz-tax', 'معافیت مشاغل ۱۴۰۵', 'biz-exempt', 'سقف معافیت مشاغل (ماده ۱۰۱): ۴۸۰M تومان سالانه (۴۰M ماهانه)'],
    ['biz-tax', 'نرخ پلکانی مشاغل (ماده ۱۳۱)', 'biz-rates', '۱۵٪|۲۰٪|۲۵٪ پلکانی بر درآمد مازاد بر معافیت'],
    ['property', 'مالیات اجاره — مالک حقیقی به مستاجر حقیقی', 'rent-exempt', 'معاف اگر زیر ۱۵۰م۲ (تهران) یا ۲۰۰م² (شهرستان) یا خانوار ≤۳ نفر'],
    ['property', 'مالیات اجاره — مالک حقیقی به مستاجر حقوقی', 'rent-personal', '۷۵٪ اجاره × نرخ پلکانی ماده ۱۳۱ (۱۰-۳۰٪)'],
    ['property', 'مالیات اجاره — مالک حقوقی', 'rent-corp', '۲۵٪ مقطوع بر درآمد اجاره'],
    ['property', 'جریمه تأخیر مالیات اجاره', 'rent-penalty', '۱۰٪ جریمه عدم پرداخت + ۲.۵٪ برای هر ماه تأخیر'],
    ['vat-1405', 'نرخ VAT ۱۴۰۵', 'vat-12', '۱۲٪ — لایحه بودجه ۱۴۰۵'],
    ['vat-1405', 'جرایم VAT', 'vat-penalty', '۷۵٪ جریمه عدم تسلیم اظهارنامه|مهلت: ۱۵ روز پس از پایان دوره'],
    ['corp', 'نرخ مالیات اشخاص حقوقی ۱۴۰۵', 'corp-25', '۲۵٪ بر سود شرکت قبل از مالیات'],
    ['exempt', 'معافیت کشاورزی (ماده ۸۱)', 'agri-exempt', 'کشاورزی/دامداری/پرورش طیور/شیلات/زنبورداری/صیادی/جنگل‌داری معاف'],
    ['exempt', 'معافیت دانش‌بنیان', 'kb-exempt', 'تسهیلات مالیاتی ویژه شرکت‌های دانش‌بنیان (نیازمند تأیید معاونت علمی)'],
    ['exempt', 'مناطق آزاد', 'fz-exempt', 'معافیت ۲۰ ساله از مالیات در مناطق آزاد تجاری-صنعتی'],
    ['exempt', 'ماده ۱۳۲ — معافیت ۵ ساله', 'a132-exempt', 'معافیت ۵ ساله برای فعالیت‌های جدید تولیدی/کشاورزی/فناوری'],
    ['personal', 'مالیات درآمد اتفاقی (ماده ۱۱۹)', 'incidental', 'نرخ پلکانی ماده ۱۳۱: ۱۰-۳۰٪ بر جوایز/هدایا/درآمد غیرنقدی'],
  ] as const;
  for (const [topicSlug, name, slug, description] of rules) {
    const rule = await P.taxRule.upsert({
      where: { slug },
      create: { topicId: topicBySlug[topicSlug].id, name, slug, description, status: 'PUBLISHED' },
      update: { topicId: topicBySlug[topicSlug].id, name, description, status: 'PUBLISHED' },
    });
    await P.taxRuleVersion.upsert({
      where: { ruleId_version: { ruleId: rule.id, version: 1 } },
      create: { ruleId: rule.id, version: 1, content: `۱۴۰۵:${description}\nمنبع/اعتبار: داده اولیه قابل ممیزی؛ قبل از استفاده حقوقی با مرجع رسمی بررسی شود.`, sourceId: source.id, effectiveFrom: new Date('2025-03-21'), status: 'PUBLISHED' },
      update: { content: `۱۴۰۵:${description}\nمنبع/اعتبار: داده اولیه قابل ممیزی؛ قبل از استفاده حقوقی با مرجع رسمی بررسی شود.`, sourceId: source.id, status: 'PUBLISHED' },
    });
  }

  for (const phone of split(process.env.SEED_SUPER_ADMIN_PHONES)) {
    await P.user.upsert({ where: { phone }, create: { phone, phoneVerified: true, role: UserRole.SUPER_ADMIN, isActive: true }, update: { role: UserRole.SUPER_ADMIN, phoneVerified: true, isActive: true } });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TaxAssistant Questions — decision tree (6 questions, Q1→Q2→...→Q6→result)
  // Option values MUST match the determine() logic in tax-assistant.service.ts
  // ───────────────────────────────────────────────────────────────────────────
  const questionDefs = [
    ['نوع فعالیت مالیاتی شما چیست؟', 1, [
      ['حقوق‌بگیر', 'sal'],
      ['کسب‌وکار / مشاغل', 'biz'],
      ['شرکت / شخص حقوقی', 'corp'],
      ['درآمد اجاره املاک', 'rental'],
      ['ارزش افزوده (VAT)', 'vat'],
      ['درآمد اتفاقی', 'incidental'],
    ]],
    ['درآمد سالانه شما چقدر است؟', 2, [
      ['زیر معافیت (۴۸۰M تومان)', 'lo'],
      ['تا ۱ میلیارد تومان', 'mid'],
      ['۱ تا ۳ میلیارد تومان', 'hi'],
      ['بیش از ۳ میلیارد تومان', 'top'],
    ]],
    ['آیا از معافیت خاصی برخوردار هستید؟', 3, [
      ['خیر', 'no'],
      ['منطقه آزاد', 'fz'],
      ['دانش‌بنیان', 'kb'],
      ['ماده ۱۳۲ (فعالیت جدید)', 'a132'],
      ['کشاورزی (ماده ۸۱)', 'agri'],
    ]],
    ['آیا مشمول ارزش افزوده (۱۲٪) هستید؟', 4, [
      ['بله — ثبت‌نام شده', 'vat_yes'],
      ['بله — ثبت‌نام نکرده‌ام', 'vat_noreg'],
      ['خیر', 'no'],
      ['نمی‌دانم', 'idk'],
    ]],
    ['وضعیت اظهارنامه مالیاتی شما؟', 5, [
      ['ارسال شده', 'ok'],
      ['ارسال نشده', 'not_filed'],
      ['با تأخیر ارسال شده', 'late'],
    ]],
    ['چه کمکی از ما می‌خواهید؟', 6, [
      ['محاسبه مالیات', 'calc'],
      ['اعتراض به مالیات', 'app'],
      ['ثبت‌نام مالیاتی', 'reg'],
      ['مشاوره تخصصی', 'cons'],
    ]],
    ['POS؟', 7, [['بله', 'y'], ['خیر', 'n']]], ['حساب تفکیک؟', 8, [['بله', 'y'], ['خیر', 'n']]], ['my.tax.gov.ir؟', 9, [['بله', 'y'], ['خیر', 'n']]],
    ['نوع محل؟', 10, [['ملکی', 'own'], ['اجاره', 'rent'], ['فاقد محل', 'none']]],
  ] as const;
  for (const [question, sortOrder, options] of questionDefs) {
    let q = await P.taxQuestion.findFirst({ where: { sortOrder } });
    q = q ? await P.taxQuestion.update({ where: { id: q.id }, data: { question, isActive: true } }) : await P.taxQuestion.create({ data: { question, sortOrder } });
    for (let i = 0; i < options.length; i++) {
      const [label, value] = options[i];
      const existing = await P.taxQuestionOption.findFirst({ where: { questionId: q.id, value } });
      if (existing) await P.taxQuestionOption.update({ where: { id: existing.id }, data: { label, sortOrder: i + 1, isActive: true } });
      else await P.taxQuestionOption.create({ data: { questionId: q.id, label, value, sortOrder: i + 1 } });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TaxAssistantResult — use UPSERT so existing (deprecated/incomplete) results
  // get UPDATED with accurate 1405 data instead of being skipped by createMany.
  // ───────────────────────────────────────────────────────────────────────────
  const results: { name: string; title: string; description: string; action: string; severity: TaxResultSeverity }[] = [
    {
      name: 'exempt',
      title: 'معاف از مالیات — ۱۴۰۵',
      description: '✅ سقف معافیت حقوق و مشاغل: ۴۰ میلیون تومان/ماه (۴۸۰M سالانه)\n✅ کشاورزی (ماده ۸۱): معاف کامل\n✅ مناطق آزاد: معافیت ۲۰ ساله\n⚠️ ارسال اظهارنامه الزامی است حتی در صورت معافیت\n⚠️ معافیت مزایا: عیدی تا ۱۲ برابر حقوق پایه، حق بیمه، بازنشستگی',
      action: 'REGISTER_TAXPAYER',
      severity: 'INFO',
    },
    {
      name: 'sal',
      title: 'مالیات حقوق ۱۴۰۵ — پلکانی',
      description: '📊 نرخ‌های پلکانی حقوق ۱۴۰۵ (ماهانه):\n• ۴۰-۸۰M تومان: ۱۰٪\n• ۸۰-۱۰۰M: ۱۵٪\n• ۱۰۰-۱۲۰M: ۲۰٪\n• ۱۲۰-۱۴۰M: ۲۵٪\n• بالای ۱۴۰M: ۳۰٪\n📋 مزایا و پاداش: نرخ ثابت ۱۰٪\n⚠️ جریمه عدم ارسال لیست حقوق: ۲٪\n⚠️ جریمه عدم پرداخت: ۱۰٪ + ۲.۵٪/ماه تأخیر\n✅ معافیت: ۴۰M ماهانه (۴۸۰M سالانه)',
      action: 'FILE_TAX_RETURN',
      severity: 'INFO',
    },
    {
      name: 'biz',
      title: 'مالیات مشاغل ۱۴۰۵ — پلکانی ماده ۱۳۱',
      description: '📊 نرخ‌های پلکانی مشاغل (ماده ۱۳۱):\n• ۱۵٪ تا سقف اول\n• ۲۰٪ سقف دوم\n• ۲۵٪ مازاد\n✅ معافیت (ماده ۱۰۱): ۴۸۰M تومان سالانه (۴۰M ماهانه)\n📋 مشاغل کوچک زیر معافیت: معاف کامل\n📅 مهلت ارسال اظهارنامه: تا پایان تیرماه سال بعد\n⚠️ جریمه عدم ارسال: ۱۵-۳۰٪ مالیات',
      action: 'FILE_TAX_RETURN',
      severity: 'INFO',
    },
    {
      name: 'corp',
      title: 'مالات اشخاص حقوقی ۱۴۰۵',
      description: '📊 نرخ مالیات شرکت‌ها: ۲۵٪ بر سود قبل از مالیات\n📋 اظهارنامه اشخاص حقوقی: تا پایان تیرماه\n💼 شامل: شرکت‌های سهامی، با مسئولیت محدود، تضامنی\n⚠️ سقف درآمد معاف برای اشخاص حقوقی: ندارد (تمام درآمد مشمول)\n✅ معافیت‌های خاص: دانش‌بنیان، مناطق آزاد، ماده ۱۳۲',
      action: 'FILE_TAX_RETURN',
      severity: 'INFO',
    },
    {
      name: 'rental',
      title: 'مالیات اجاره املاک ۱۴۰۵',
      description: '📊 مالیات اجاره بر اساس نوع مالک و مستاجر:\n• حقیقی → حقیقی: معاف (زیر ۱۵۰م² تهران/۲۰۰م² شهرستان یا خانوار ≤۳)\n• حقیقی → حقوقی: ۷۵٪ اجاره × نرخ پلکانی (۱۰-۳۰٪)\n• حقوقی: ۲۵٪ مقطوع\n📋 فرمول: کل اجاره × ۷۵٪ (کسر ۲۵٪ هزینه ماده ۵۳) × نرخ پلکانی\n⚠️ جریمه تأخیر پرداخت: ۱۰٪ + ۲.۵٪/ماه\n📅 پرداخت: تا پایان ماه بعد از ماه اجاره',
      action: 'FILE_TAX_RETURN',
      severity: 'WARNING',
    },
    {
      name: 'vat',
      title: 'مالیات ارزش افزوده ۱۴۰۵ — ۱۲٪',
      description: '📊 نرخ VAT: ۱۲٪ (لایحه بودجه ۱۴۰۵)\n📋 دوره‌های مالیاتی: فصلی (هر ۳ ماه)\n📅 مهلت تسلیم اظهارنامه: ۱۵ روز پس از پایان دوره\n⚠️ جریمه عدم تسلیم اظهارنامه: ۷۵٪ مالیات\n⚠️ جریمه عدم پرداخت: ۱۰٪ + ۲.۵٪/ماه تأخیر\n💸 آستانه ثبت‌نام: turnover بالای سقف قانونی\n✅ معافیت: صادرات، محصولات کشاورزی، خدمات پزشکی',
      action: 'REGISTER_VAT',
      severity: 'WARNING',
    },
    {
      name: 'late',
      title: 'جرایم تأخیر مالیاتی ۱۴۰۵',
      description: '⚠️ جرایم عدم ارسال اظهارنامه:\n• حقوق: ۲٪ حقوق + ۱۰٪ عدم پرداخت\n• مشاغل: ۱۵-۳۰٪ مالیات سالانه\n• VAT: ۷۵٪ مالیات عدم تسلیم\n💸 جریمه تأخیر پرداخت: ۲.۵٪ برای هر ماه تأخیر\n📋 جریمه عدم ارسال لیست حقوق: ۲٪ حقوق پرداختی\n🚨 مرحله بعد: اخطار و اجراییه — نیاز به مشاوره فوری',
      action: 'CONSULT_EXPERT',
      severity: 'CRITICAL',
    },
    {
      name: 'kb',
      title: 'معافیت شرکت‌های دانش‌بنیان',
      description: '✅ تسهیلات مالیاتی ویژه برای شرکت‌های دانش‌بنیان\n📋 شرط: تأیید از معاونت علمی و فناوری ریاست جمهوری\n📊 معافیت درآمد حاصل از فعالیت دانش‌بنیان (درصد متغیر)\n📋 نیازمند: ارزیابی و رتبه‌بندی توسط کارگروه‌های تخصصی\n⚠️ سایر درآمدهای غیردانش‌بنیان مشمول مالیات عادی',
      action: 'CONSULT_EXPERT',
      severity: 'INFO',
    },
    {
      name: 'expert',
      title: 'مشاوره تخصصی مالیاتی',
      description: '📋 بر اساس پاسخ‌های شما، نیاز به مشاوره تخصصی دارید.\n✅ کارشناسان آیان تراز در زمینه‌های زیر آماده کمک هستند:\n• معافیت‌های ماده ۱۳۲ و مناطق آزاد\n• محاسبه دقیق مالیات پلکانی\n• اعتراض به مالیات و رسیدگی\n• تنظیم اظهارنامه\n📅 نوبت‌دهی مشاوره: از طریق پنل کاربری\n⚠️ توصیه: قبل از هر اقدام، با مشاور مالیاتی هماهنگ کنید',
      action: 'CONSULT_EXPERT',
      severity: 'NEEDS_REVIEW',
    },
    {
      name: 'incidental',
      title: 'مالیات درآمد اتفاقی ۱۴۰۵ — ماده ۱۱۹',
      description: '📊 درآمد اتفاقی (جوایز، هدایا، درآمد غیرنقدی):\nنرخ پلکانی ماده ۱۳۱: ۱۰-۳۰٪\n📋 شامل: جوایز، هدایا، معاملات محاباتی\n✅ اگر زیر سقف معافیت سالانه باشد ممکن است مالیاتی تعلق نگیرد\n⚠️ ارزش‌گذاری درآمد غیرنقدی: بر اساس ارزش روز کارشناسی',
      action: 'FILE_TAX_RETURN',
      severity: 'INFO',
    },
  ];

  for (const r of results) {
    await P.taxAssistantResult.upsert({
      where: { name: r.name },
      create: { name: r.name, title: r.title, description: r.description, action: r.action || null, severity: r.severity, ruleIds: [], isActive: true },
      update: { title: r.title, description: r.description, action: r.action || null, severity: r.severity, isActive: true },
    });
  }

  // Build the decision-tree flows so the chatbot walks a real multi-question path.
  // Flow: Q1(activity) -> Q2(income) -> Q3(exemption) -> Q4(vat) -> Q5(filing) -> Q6(help) -> done
  {
    const qs = await P.taxQuestion.findMany({ orderBy: { sortOrder: 'asc' } });
    const qByOrder = Object.fromEntries(qs.map(q => [q.sortOrder, q]));
    const optsOf = async (qId: string) => {
      const opts = await P.taxQuestionOption.findMany({ where: { questionId: qId }, orderBy: { sortOrder: 'asc' } });
      return Object.fromEntries(opts.map(o => [o.value, o]));
    };

    // Q1 -> Q2, Q2 -> Q3, Q3 -> Q4, Q4 -> Q5, Q5 -> Q6 (all options advance to next question)
    const chain = [[1,2], [2,3], [3,4], [4,5], [5,6]];
    for (const [fromOrder, toOrder] of chain) {
      const fromQ = qByOrder[fromOrder];
      const toQ = qByOrder[toOrder];
      if (!fromQ || !toQ) continue;
      const opts = await optsOf(fromQ.id);
      for (const [val, opt] of Object.entries(opts)) {
        await P.taxQuestionFlow.upsert({
          where: { fromQuestionId_optionId: { fromQuestionId: fromQ.id, optionId: opt.id } },
          create: { fromQuestionId: fromQ.id, toQuestionId: toQ.id, optionId: opt.id, sortOrder: 1 },
          update: { toQuestionId: toQ.id },
        });
      }
    }
    // Q6 -> terminal (no flow => determine() runs after Q6 answer)
    console.log('🌳 Decision tree flows seeded (Q1->Q2->Q3->Q4->Q5->Q6->result)');
  }

  // Seed consultation services with 1405 prices (toman)
  await P.consultationService.createMany({ skipDuplicates: true, data: [
    { name: 'مشاوره مالیاتی', slug: 'tax-consult', description: 'بررسی پرونده و برنامه‌ریزی مالیاتی', duration: 45, price: 500000, sortOrder: 1 },
    { name: 'تنظیم اظهارنامه', slug: 'tax-return', description: 'اظهارنامه عملکرد و ارزش افزوده', duration: 30, price: 800000, sortOrder: 2 },
    { name: 'حسابرسی مالی', slug: 'audit', description: 'بررسی اسناد و گزارش تحلیلی', duration: 60, price: 1500000, sortOrder: 3 },
    { name: 'دفترداری', slug: 'bookkeeping', description: 'ثبت اسناد و صورت‌های مالی', duration: 30, price: 600000, sortOrder: 4 },
  ] });

  await P.adminSetting.createMany({ skipDuplicates: true, data: [
    { key: 'vat_1405', value: '12', description: 'نرخ ارزش افزوده ۱۴۰۵ — داده اولیه قابل ممیزی توسط ادمین' },
    { key: 'corp_tax', value: '25', description: 'نرخ مالیات اشخاص حقوقی ۱۴۰۵ — داده اولیه قابل ممیزی توسط ادمین' },
    { key: 'salary_exemption_1405', value: '480000000', description: 'سقف معافیت حقوق سالانه ۱۴۰۵ (تومان)' },
  ] });
  await P.sEOConfig.createMany({ skipDuplicates: true, data: [{ path: '/', title: 'آیان تراز | ۱۴۰۵', description: 'VAT ۱۲٪|حقوق پلکانی|مشاوره مالیاتی', indexable: true, followLinks: true }] });
  console.log('✅ Seed completed — قوانین مالیاتی ۱۴۰۵ به‌روزرسانی شد');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => P.$disconnect());
