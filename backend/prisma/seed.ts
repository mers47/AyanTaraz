import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بارگذاری کامل داده‌های ۱۴۰۴-۱۴۰۵...\n');

  const [cat1,cat2,cat3,cat4] = await Promise.all([
    prisma.category.create({data:{name:'مالیات مستقیم',slug:'direct-tax',sortOrder:1}}),
    prisma.category.create({data:{name:'مالیات بر ارزش افزوده',slug:'vat',sortOrder:2}}),
    prisma.category.create({data:{name:'مشاوره مالیاتی',slug:'tax-consultation',sortOrder:3}}),
    prisma.category.create({data:{name:'قوانین ۱۴۰۴',slug:'regs-1404',sortOrder:4}}),
  ]);
  console.log('✅ ۴ دسته‌بندی');

  const [src1,src2] = await Promise.all([
    prisma.taxSource.create({data:{name:'قانون مالیات‌های مستقیم ۱۴۰۴',officialName:'سازمان امور مالیاتی',url:'https://intamedia.ir',description:'اصلاحیه ۱۴۰۴'}}),
    prisma.taxSource.create({data:{name:'قانون ارزش افزوده ۱۴۰۴',officialName:'سازمان امور مالیاتی',url:'https://evat.ir',description:'نرخ ۱۰٪'}}),
  ]);
  console.log('✅ ۲ منبع قانونی');

  const tops = await Promise.all([
    prisma.taxTopic.create({data:{name:'مالیات اشخاص حقیقی',slug:'personal-tax',description:'نرخ‌ها و معافیت‌ها',sortOrder:1}}),
    prisma.taxTopic.create({data:{name:'مالیات اشخاص حقوقی',slug:'corporate-tax',description:'نرخ ۲۵٪',sortOrder:2}}),
    prisma.taxTopic.create({data:{name:'ارزش افزوده',slug:'vat-rules',description:'۱۰٪',sortOrder:3}}),
    prisma.taxTopic.create({data:{name:'معافیت‌های ۱۴۰۴',slug:'exemptions-1404',description:'سقف‌های جدید',sortOrder:4}}),
    prisma.taxTopic.create({data:{name:'تکالیف و جرایم',slug:'obligations',description:'مهلت‌ها و جرایم',sortOrder:5}}),
    prisma.taxTopic.create({data:{name:'سامانه مودیان',slug:'taxpayer-sys',description:'ثبت‌نام و صورتحساب',sortOrder:6}}),
    prisma.taxTopic.create({data:{name:'مالیات حقوق ۱۴۰۴',slug:'salary-tax',description:'۲۴ میلیون ماهانه',sortOrder:7}}),
  ]);
  console.log('✅ ۷ موضوع مالیاتی');

  const rl = [{tid:tops[0].id,n:'معافیت پایه اشخاص حقیقی',s:'personal-exemption',d:'۲۸۸ میلیون سالانه'},{tid:tops[0].id,n:'نرخ پلکانی مشاغل',s:'graduated-rates',d:'۱۵٪ تا ۲۵٪'},{tid:tops[1].id,n:'نرخ مالیات اشخاص حقوقی',s:'corp-rate',d:'۲۵٪'},{tid:tops[2].id,n:'نرخ ارزش افزوده',s:'vat-rate',d:'۱۰٪'},{tid:tops[3].id,n:'معافیت حقوق',s:'salary-exempt',d:'۲۴ میلیون ماهانه'},{tid:tops[3].id,n:'معافیت مشاغل',s:'biz-exempt',d:'۲۰۰ میلیون + POS'},{tid:tops[4].id,n:'جریمه عدم اظهارنامه',s:'late-penalty',d:'۳۰٪'},{tid:tops[5].id,n:'ثبت‌نام مودیان',s:'taxpayer-reg',d:'الزامی'}];
  for(const r of rl) await prisma.taxRule.create({data:{topicId:r.tid,name:r.n,slug:r.s,description:r.d,status:'PUBLISHED',versions:{create:{version:1,content:`قانون ۱۴۰۴: ${r.d}`,sourceId:src1.id,effectiveFrom:new Date('2025-03-21'),status:'PUBLISHED'}}}});
  console.log('✅ ۸ قانون');

  const q1 = await prisma.taxQuestion.create({data:{question:'نوع فعالیت شما چیست؟',sortOrder:1,options:{create:[{label:'حقوق‌بگیر',value:'salary',sortOrder:1},{label:'کسب‌وکار شخصی',value:'biz',sortOrder:2},{label:'شرکت',value:'corp',sortOrder:3},{label:'حوزه ارزش افزوده',value:'vat',sortOrder:4}]}}});
  const q2 = await prisma.taxQuestion.create({data:{question:'درآمد سالانه شما چقدر است؟',sortOrder:2,options:{create:[{label:'زیر سقف معافیت',value:'low',sortOrder:1},{label:'تا ۵۰۰ میلیون',value:'mid',sortOrder:2},{label:'۵۰۰ تا ۱ میلیارد',value:'high',sortOrder:3},{label:'بالای ۱ میلیارد',value:'top',sortOrder:4}]}}});
  const q3 = await prisma.taxQuestion.create({data:{question:'آیا معافیت خاصی دارید؟',sortOrder:3,options:{create:[{label:'خیر',value:'none',sortOrder:1},{label:'مناطق آزاد',value:'freezone',sortOrder:2},{label:'دانش‌بنیان',value:'knowledge',sortOrder:3},{label:'ماده ۱۳۲',value:'art132',sortOrder:4}]}}});
  const q4 = await prisma.taxQuestion.create({data:{question:'مشمول ارزش افزوده هستید؟',sortOrder:4,options:{create:[{label:'بله',value:'vat_yes',sortOrder:1},{label:'خیر',value:'vat_no',sortOrder:2},{label:'نمی‌دانم',value:'vat_idk',sortOrder:3}]}}});
  const q5 = await prisma.taxQuestion.create({data:{question:'وضعیت اظهارنامه شما؟',sortOrder:5,options:{create:[{label:'ارسال شده',value:'ok',sortOrder:1},{label:'ارسال نشده',value:'no',sortOrder:2},{label:'با تأخیر',value:'late',sortOrder:3}]}}});
  const q6 = await prisma.taxQuestion.create({data:{question:'چه کمکی نیاز دارید؟',sortOrder:6,options:{create:[{label:'محاسبه مالیات',value:'calc',sortOrder:1},{label:'اعتراض',value:'appeal',sortOrder:2},{label:'ثبت‌نام',value:'reg',sortOrder:3},{label:'مشاوره',value:'consult',sortOrder:4}]}}});
  const q7 = await prisma.taxQuestion.create({data:{question:'آیا POS دارید؟',sortOrder:7,options:{create:[{label:'بله',value:'yes',sortOrder:1},{label:'خیر',value:'no',sortOrder:2}]}}});
  const q8 = await prisma.taxQuestion.create({data:{question:'حساب تجاری تفکیک شده؟',sortOrder:8,options:{create:[{label:'بله',value:'yes',sortOrder:1},{label:'خیر',value:'no',sortOrder:2}]}}});
  console.log('✅ ۸ سوال + ۳۲ گزینه');

  const go=async(qid:string,val:string)=>(await prisma.taxQuestionOption.findFirst({where:{questionId:qid,value:val}}))!.id;
  const fl=[[q1.id,q2.id,await go(q1.id,'salary')],[q1.id,q2.id,await go(q1.id,'biz')],[q1.id,q2.id,await go(q1.id,'corp')],[q1.id,q4.id,await go(q1.id,'vat')],[q2.id,q3.id,await go(q2.id,'low')],[q2.id,q3.id,await go(q2.id,'mid')],[q2.id,q3.id,await go(q2.id,'high')],[q2.id,q3.id,await go(q2.id,'top')],[q3.id,q4.id,await go(q3.id,'none')],[q3.id,q4.id,await go(q3.id,'freezone')],[q3.id,q4.id,await go(q3.id,'knowledge')],[q3.id,q4.id,await go(q3.id,'art132')],[q4.id,q5.id,await go(q4.id,'vat_yes')],[q4.id,q5.id,await go(q4.id,'vat_no')],[q4.id,q5.id,await go(q4.id,'vat_idk')],[q5.id,q6.id,await go(q5.id,'ok')],[q5.id,q6.id,await go(q5.id,'no')],[q5.id,q6.id,await go(q5.id,'late')],[q6.id,q7.id,await go(q6.id,'calc')],[q6.id,q7.id,await go(q6.id,'appeal')],[q6.id,q7.id,await go(q6.id,'reg')],[q6.id,q7.id,await go(q6.id,'consult')],[q7.id,q8.id,await go(q7.id,'yes')],[q7.id,q8.id,await go(q7.id,'no')]];
  await prisma.taxQuestionFlow.createMany({data:fl.map(([f,t,o]:any)=>({fromQuestionId:f,toQuestionId:t,optionId:o}))});
  console.log(`✅ ${fl.length} مسیر درخت`);

  await prisma.taxAssistantResult.createMany({data:[
    {name:'under_exempt',title:'معاف از مالیات',description:'✅ درآمد زیر سقف معافیت\nحقوق: ۲۴ میلیون ماهانه\nمشاغل: ۲۰۰ میلیون سالانه\n⚠️ اظهارنامه الزامیست',ruleIds:[],action:'REGISTER_TAXPAYER',severity:'INFO'},
    {name:'salary_guide',title:'مالیات حقوق ۱۴۰۴',description:'📊 معافیت: ۲۴M ماهانه\nنرخ: ۱۰٪-۳۰٪ پلکانی\n✅ کسر توسط کارفرما',ruleIds:[],action:null,severity:'INFO'},
    {name:'biz_guide',title:'مالیات مشاغل ۱۴۰۴',description:'📊 معافیت: ۲۰۰M (با POS: ۴۳۲M)\nنرخ: ۱۵٪-۲۵٪\nاظهارنامه تا ۳۱ خرداد',ruleIds:[],action:'FILE_TAX_RETURN',severity:'INFO'},
    {name:'corp_guide',title:'مالیات شرکت ۱۴۰۴',description:'📊 نرخ: ۲۵٪\nماده ۱۳۲: معافیت ۸۰٪\n۴ ماه پس از سال مالی',ruleIds:[],action:'CONSULT_ACCOUNTANT',severity:'WARNING'},
    {name:'vat_guide',title:'ارزش افزوده ۱۴۰۴',description:'📊 نرخ: ۱۰٪\nمهلت: ۱۵ روز\n⚠️ جریمه: ۷۵٪\n📌 ۱۴۰۵ → ۱۲٪',ruleIds:[],action:'REGISTER_VAT',severity:'WARNING'},
    {name:'late_warn',title:'⚠️ اظهارنامه ارسال نشده',description:'جریمه ۳۰٪\nاقدام فوری:\n۱. ارسال اظهارنامه\n۲. بخشودگی جرایم\n۳. مشاوره',ruleIds:[],action:'FILE_TAX_RETURN',severity:'CRITICAL'},
    {name:'need_expert',title:'نیاز به مشاوره تخصصی',description:'وضعیت شما پیچیده است\nرزرو وقت با متخصصین آیان تراز',ruleIds:[],action:'BOOK_CONSULTATION',severity:'NEEDS_REVIEW'},
    {name:'knowledge_guide',title:'دانش‌بنیان',description:'✅ معافیت ۱۵ ساله\n✅ نرخ صفر ارزش افزوده\nشرط: تأیید معاونت علمی',ruleIds:[],action:'CONSULT_ACCOUNTANT',severity:'INFO'},
  ]});
  console.log('✅ ۸ نتیجه');

  const sv1 = await prisma.consultationService.create({data:{name:'مشاوره مالیاتی ۳۰ دقیقه',slug:'consult-30',description:'رایگان',duration:30,price:0,sortOrder:1}});
  await prisma.consultationService.create({data:{name:'مشاوره تخصصی ۶۰ دقیقه',slug:'consult-60',description:'تحلیل عمیق',duration:60,price:1500000,sortOrder:2}});
  for(let d=0;d<5;d++) await prisma.consultationAvailability.create({data:{serviceId:sv1.id,dayOfWeek:d,startTime:'09:00',endTime:'17:00'}});
  console.log('✅ سرویس مشاوره');

  await prisma.adminSetting.createMany({data:[
    {key:'site_name',value:'آیان تراز'},{key:'vat_rate',value:'10'},{key:'corp_tax',value:'25'},
    {key:'salary_exempt',value:'240000000'},{key:'biz_exempt',value:'20000000000'},
    {key:'otp_attempts',value:'5'},{key:'otp_expiry',value:'300'},{key:'otp_ban',value:'600'},
    {key:'session_ttl',value:'86400'},{key:'refresh_ttl',value:'2592000'},
  ]});
  console.log('✅ ۱۰ تنظیمات');

  await prisma.sEOConfig.createMany({data:[
    {path:'/',title:'آیان تراز | خدمات حسابداری و مالیاتی ۱۴۰۴',description:'مشاوره مالیاتی، اظهارنامه، حسابرسی',indexable:true,followLinks:true},
    {path:'/chatbot',title:'دستیار مالیاتی | آیان تراز',description:'پاسخ به سوالات مالیاتی بر اساس قوانین ۱۴۰۴',indexable:true},
    {path:'/consultation',title:'رزرو مشاوره | آیان تراز',description:'رزرو وقت مشاوره با متخصصین',indexable:true},
  ]});
  console.log('✅ SEO');

  console.log('\n🎉 کامل شد! ۴ دسته + ۷ موضوع + ۸ قانون + ۸ سوال + ۸ نتیجه + ۴ سرویس');
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
