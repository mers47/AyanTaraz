import { PrismaClient, UserRole } from '@prisma/client';
const P = new PrismaClient();

const split = (v?: string) => (v || '').split(',').map((x) => x.trim()).filter(Boolean);

async function main() {
  console.log('🌱 بارگذاری داده‌های پایه آیان تراز');

  await P.category.createMany({ skipDuplicates: true, data: [
    { name: 'مالیات مستقیم', slug: 'direct-tax', sortOrder: 1 },
    { name: 'ارزش افزوده', slug: 'vat', sortOrder: 2 },
    { name: 'مشاوره', slug: 'consult', sortOrder: 3 },
    { name: 'قوانین ۱۴۰۵', slug: 'regs-1405', sortOrder: 4 },
  ] });

  await P.taxSource.createMany({ skipDuplicates: true, data: [
    { name: 'قانون مالیات‌های مستقیم ۱۴۰۵', officialName: 'سازمان امور مالیاتی', url: 'https://intamedia.ir', description: 'داده پایه قابل بازبینی توسط ادمین؛ قبل از اتکا در پروداکشن با منبع رسمی تطبیق داده شود.' },
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
    ['salary-tax', 'معافیت حقوق', 'sal-exempt', '۴۰M ماهانه=۴۸۰M سالانه'], ['salary-tax', 'نرخ حقوق', 'sal-rates', '۱۰-۳۰٪ پلکانی'],
    ['biz-tax', 'معافیت مشاغل', 'biz-exempt', '۲۰۰M+POS'], ['biz-tax', 'نرخ مشاغل', 'biz-rates', '۱۵-۲۵٪'],
    ['vat-1405', 'نرخ VAT', 'vat-12', '۱۲٪ بودجه۱۴۰۵'], ['corp', 'نرخ حقوقی', 'corp-25', '۲۵٪'],
    ['exempt', 'سقف حقیقی', 'per-limit', '۶۰B'], ['exempt', 'سقف حقوقی', 'corp-limit', '۶۰۰B'],
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

  const questionDefs = [
    ['نوع فعالیت مالیاتی شما چیست؟', 1, [['حقوق‌بگیر','sal'],['کسب‌وکار','biz'],['شرکت','corp'],['VAT','vat']]],
    ['درآمد سالانه؟', 2, [['زیر معافیت','lo'],['تا ۱B','mid'],['۱-۳B','hi'],['+۳B','top']]],
    ['معافیت خاص؟', 3, [['خیر','no'],['مناطق آزاد','fz'],['دانش‌بنیان','kb'],['ماده۱۳۲','a132'],['کشاورزی','agri']]],
    ['مشمول VAT؟ (۱۲٪)', 4, [['بله-ثبت‌نام','yes'],['بله-ثبت‌نام نشده','noreg'],['خیر','no'],['نمی‌دانم','idk']]],
    ['وضعیت اظهارنامه؟', 5, [['ارسال شده','ok'],['ارسال نشده','no'],['با تأخیر','late']]],
    ['چه کمکی؟', 6, [['محاسبه مالیات','calc'],['اعتراض','app'],['ثبت‌نام','reg'],['مشاوره','cons']]],
    ['POS؟', 7, [['بله','y'],['خیر','n']]], ['حساب تفکیک؟', 8, [['بله','y'],['خیر','n']]], ['my.tax.gov.ir؟', 9, [['بله','y'],['خیر','n']]],
    ['نوع محل؟', 10, [['ملکی','own'],['اجاره','rent'],['فاقد محل','none']]],
  ] as const;
  for (const [question, sortOrder, options] of questionDefs) {
    let q = await P.taxQuestion.findFirst({ where: { sortOrder } });
    q = q ? await P.taxQuestion.update({ where: { id: q.id }, data: { question } }) : await P.taxQuestion.create({ data: { question, sortOrder } });
    for (let i = 0; i < options.length; i++) {
      const [label, value] = options[i];
      const existing = await P.taxQuestionOption.findFirst({ where: { questionId: q.id, value } });
      if (existing) await P.taxQuestionOption.update({ where: { id: existing.id }, data: { label, sortOrder: i + 1 } });
      else await P.taxQuestionOption.create({ data: { questionId: q.id, label, value, sortOrder: i + 1 } });
    }
  }

  await P.taxAssistantResult.createMany({ skipDuplicates: true, data: [
    { name: 'exempt', title: 'معاف — ۱۴۰۵', description: '✅ حقوق:۴۰M|مشاغل:۲۰۰M\n⚠️اظهارنامه الزامی', action: 'REGISTER_TAXPAYER', severity: 'INFO' },
    { name: 'sal', title: 'حقوق ۱۴۰۵', description: '۴۰-۸۰M:۱۰٪|۸۰-۱۰۰:۱۵٪|۱۰۰-۱۲۰:۲۰٪|۱۲۰-۱۴۰:۲۵٪|+۱۴۰:۳۰٪', severity: 'INFO' },
    { name: 'biz', title: 'مشاغل ۱۴۰۵', description: '۱۵٪تا۵۰۰M|۲۰٪تا۱B|۲۵٪مازاد|📅۳۱خرداد', action: 'FILE_TAX_RETURN', severity: 'INFO' },
    { name: 'vat', title: 'VAT ۱۲٪', description: 'نرخ:۱۲٪|جرایم:۷۵٪|مهلت:۱۵روز', action: 'REGISTER_VAT', severity: 'WARNING' },
  ] });


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
    console.log('\xF0\x9F\x8C\xB3 Decision tree flows seeded (Q1->Q2->Q3->Q4->Q5->Q6->result)');
  }

  // Seed consultation services with 1405 prices (toman)
  await P.consultationService.createMany({ skipDuplicates: true, data: [
    { name: 'مشاوره مالیاتی', slug: 'tax-consult', description: 'بررسی پرونده و برنامه‌ریزی مالیاتی', duration: 45, price: 500000, sortOrder: 1 },
    { name: 'تنظیم اظهارنامه', slug: 'tax-return', description: 'اظهارنامه عملکرد و ارزش افزوده', duration: 30, price: 800000, sortOrder: 2 },
    { name: 'حسابرسی مالی', slug: 'audit', description: 'بررسی اسناد و گزارش تحلیلی', duration: 60, price: 1500000, sortOrder: 3 },
    { name: 'دفترداری', slug: 'bookkeeping', description: 'ثبت اسناد و صورت‌های مالی', duration: 30, price: 600000, sortOrder: 4 },
  ] });

  await P.adminSetting.createMany({ skipDuplicates: true, data: [
    { key: 'vat_1405', value: '12', description: 'داده اولیه قابل ممیزی توسط ادمین' }, { key: 'corp_tax', value: '25', description: 'داده اولیه قابل ممیزی توسط ادمین' },
  ] });
  await P.sEOConfig.createMany({ skipDuplicates: true, data: [{ path: '/', title: 'آیان تراز | ۱۴۰۵', description: 'VAT ۱۲٪', indexable: true, followLinks: true }] });
  console.log('✅ Seed completed');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => P.$disconnect());
