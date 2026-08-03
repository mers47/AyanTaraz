import { PrismaClient } from '@prisma/client';
const P = new PrismaClient();

async function main() {
  console.log('🌱 قوانین ۱۴۰۵ (بخشنامه ۲۰۰/۱۰۰۵/ص)\n');

  await Promise.all([
    P.category.create({data:{name:'مالیات مستقیم',slug:'direct-tax',sortOrder:1}}),
    P.category.create({data:{name:'ارزش افزوده',slug:'vat',sortOrder:2}}),
    P.category.create({data:{name:'مشاوره',slug:'consult',sortOrder:3}}),
    P.category.create({data:{name:'قوانین ۱۴۰۵',slug:'regs-1405',sortOrder:4}}),
  ]);

  const [s1] = await Promise.all([
    P.taxSource.create({data:{name:'قانون مالیات‌های مستقیم ۱۴۰۵',officialName:'سازمان امور مالیاتی',url:'https://intamedia.ir'}}),
    P.taxSource.create({data:{name:'قانون VAT ۱۴۰۵',officialName:'سازمان امور مالیاتی',url:'https://evat.ir',description:'۱۲٪'}}),
  ]);

  const tp = await Promise.all([
    P.taxTopic.create({data:{name:'اشخاص حقیقی',slug:'personal',sortOrder:1}}),
    P.taxTopic.create({data:{name:'اشخاص حقوقی',slug:'corp',sortOrder:2}}),
    P.taxTopic.create({data:{name:'VAT ۱۴۰۵',slug:'vat-1405',sortOrder:3}}),
    P.taxTopic.create({data:{name:'معافیت‌های ۱۴۰۵',slug:'exempt-1405',sortOrder:4}}),
    P.taxTopic.create({data:{name:'حقوق ۱۴۰۵',slug:'salary-1405',description:'۴۰M',sortOrder:5}}),
    P.taxTopic.create({data:{name:'مشاغل ۱۴۰۵',slug:'biz-1405',sortOrder:6}}),
    P.taxTopic.create({data:{name:'مستغلات',slug:'property',sortOrder:7}}),
    P.taxTopic.create({data:{name:'جرایم',slug:'penalties',sortOrder:8}}),
  ]);

  for(const r of [
    {tid:tp[4].id,n:'معافیت حقوق ۱۴۰۵',s:'sal-exempt',d:'۴۰M ماهانه=۴۸۰M سالانه (ماده۸۴)'},
    {tid:tp[4].id,n:'نرخ حقوق ۱۴۰۵',s:'sal-rates',d:'۱۰٪ ۴۰-۸۰M, ۱۵٪ ۸۰-۱۰۰M, ۲۰٪ ۱۰۰-۱۲۰M, ۲۵٪ ۱۲۰-۱۴۰M, ۳۰٪ +۱۴۰M'},
    {tid:tp[5].id,n:'معافیت مشاغل',s:'biz-exempt',d:'۲۰۰M (POS:۴۳۲M)'},
    {tid:tp[5].id,n:'نرخ مشاغل',s:'biz-rates',d:'۱۵٪تا۵۰۰M,۲۰٪تا۱B,۲۵٪مازاد(ماده۱۳۱)'},
    {tid:tp[2].id,n:'VAT ۱۲٪',s:'vat-12',d:'۱۲٪(از۱۰٪) — بودجه۱۴۰۵'},
    {tid:tp[1].id,n:'نرخ حقوقی',s:'corp-25',d:'۲۵٪(ماده۱۰۵)'},
    {tid:tp[3].id,n:'سقف حقیقی',s:'per-lim',d:'۶۰B'},
    {tid:tp[3].id,n:'سقف حقوقی',s:'corp-lim',d:'۶۰۰B'},
  ]) await P.taxRule.create({data:{topicId:r.tid,name:r.n,slug:r.s,description:r.d,status:'PUBLISHED',versions:{create:{version:1,content:`۱۴۰۵:${r.d}`,sourceId:s1.id,effectiveFrom:new Date('2025-03-21'),status:'PUBLISHED'}}}});
  console.log('✅ ۸ قانون');

  const q = await Promise.all([
    P.taxQuestion.create({data:{question:'نوع فعالیت مالیاتی شما؟',sortOrder:1,options:{create:[
      {label:'حقوق‌بگیر',value:'sal',sortOrder:1},{label:'کسب‌وکار',value:'biz',sortOrder:2},
      {label:'شرکت',value:'corp',sortOrder:3},{label:'مرتبط با VAT',value:'vat',sortOrder:4}]}}),
    P.taxQuestion.create({data:{question:'درآمد سالانه؟',sortOrder:2,options:{create:[
      {label:'زیر معافیت',value:'lo',sortOrder:1},{label:'تا ۱B',value:'mid',sortOrder:2},
      {label:'۱-۳B',value:'hi',sortOrder:3},{label:'+۳B',value:'top',sortOrder:4}]}}),
    P.taxQuestion.create({data:{question:'معافیت خاص؟',sortOrder:3,options:{create:[
      {label:'خیر',value:'no',sortOrder:1},{label:'مناطق آزاد',value:'fz',sortOrder:2},
      {label:'دانش‌بنیان',value:'kb',sortOrder:3},{label:'ماده۱۳۲',value:'a132',sortOrder:4},{label:'کشاورزی',value:'agri',sortOrder:5}]}}),
    P.taxQuestion.create({data:{question:'مشمول VAT؟ (۱۲٪ جدید)',sortOrder:4,options:{create:[
      {label:'بله-ثبت‌نام',value:'yes',sortOrder:1},{label:'بله-ثبت‌نام نشده',value:'noreg',sortOrder:2},
      {label:'خیر',value:'no',sortOrder:3},{label:'نمی‌دانم',value:'idk',sortOrder:4}]}}),
    P.taxQuestion.create({data:{question:'وضعیت اظهارنامه؟',sortOrder:5,options:{create:[
      {label:'ارسال شده',value:'ok',sortOrder:1},{label:'ارسال نشده',value:'no',sortOrder:2},{label:'با تأخیر',value:'late',sortOrder:3}]}}),
    P.taxQuestion.create({data:{question:'چه کمکی؟',sortOrder:6,options:{create:[
      {label:'محاسبه مالیات',value:'calc',sortOrder:1},{label:'اعتراض',value:'app',sortOrder:2},
      {label:'ثبت‌نام',value:'reg',sortOrder:3},{label:'مشاوره',value:'cons',sortOrder:4}]}}),
    P.taxQuestion.create({data:{question:'POS؟',sortOrder:7,options:{create:[{label:'بله',value:'y',sortOrder:1},{label:'خیر',value:'n',sortOrder:2}]}}),
    P.taxQuestion.create({data:{question:'حساب تفکیک؟',sortOrder:8,options:{create:[{label:'بله',value:'y',sortOrder:1},{label:'خیر',value:'n',sortOrder:2}]}}),
    P.taxQuestion.create({data:{question:'ثبت‌نام مودیان؟',sortOrder:9,options:{create:[{label:'بله',value:'y',sortOrder:1},{label:'خیر',value:'n',sortOrder:2}]}}),
    P.taxQuestion.create({data:{question:'نوع محل فعالیت؟',sortOrder:10,options:{create:[{label:'ملکی',value:'own',sortOrder:1},{label:'اجاره',value:'rent',sortOrder:2},{label:'فاقد محل',value:'none',sortOrder:3}]}}),
  ]);
  console.log('✅ ۱۰ سوال');

  const go=async(qid:string,val:string)=>(await P.taxQuestionOption.findFirst({where:{questionId:qid,value:val}}))!.id;
  const fs:any[]=[];
  for(const v of['sal','biz','corp','vat'])fs.push([q[0].id,q[1].id,await go(q[0].id,v)]);
  for(const v of['lo','mid','hi','top'])fs.push([q[1].id,q[2].id,await go(q[1].id,v)]);
  for(const v of['no','fz','kb','a132','agri'])fs.push([q[2].id,q[3].id,await go(q[2].id,v)]);
  for(const v of['yes','noreg','no','idk'])fs.push([q[3].id,q[4].id,await go(q[3].id,v)]);
  for(const v of['ok','no','late'])fs.push([q[4].id,q[5].id,await go(q[4].id,v)]);
  for(const v of['calc','app','reg','cons'])fs.push([q[5].id,q[6].id,await go(q[5].id,v)]);
  for(const v of['y','n'])fs.push([q[6].id,q[7].id,await go(q[6].id,v)]);
  for(const v of['y','n'])fs.push([q[7].id,q[8].id,await go(q[7].id,v)]);
  for(const v of['y','n'])fs.push([q[8].id,q[9].id,await go(q[8].id,v)]);
  await P.taxQuestionFlow.createMany({data:fs.map(([f,t,o]:any)=>({fromQuestionId:f,toQuestionId:t,optionId:o}))});
  console.log(`✅ ${fs.length} مسیر`);

  await P.taxAssistantResult.createMany({data:[
    {name:'exempt',title:'معاف — ۱۴۰۵',description:'✅ حقوق:تا۴۰M(۴۸۰Mسال)\nمشاغل:تا۲۰۰M(POS:۴۳۲M)\nکشاورزی:معاف کامل\n⚠️اظهارنامه الزامی',action:'REGISTER_TAXPAYER',severity:'INFO'},
    {name:'sal',title:'مالیات حقوق ۱۴۰۵',description:'۴۰-۸۰M:۱۰٪|۸۰-۱۰۰M:۱۵٪|۱۰۰-۱۲۰M:۲۰٪|۱۲۰-۱۴۰M:۲۵٪|+۱۴۰M:۳۰٪\n✅کارفرما کسر کند\nعیدی معاف:۴۰M',severity:'INFO'},
    {name:'biz',title:'مشاغل ۱۴۰۵',description:'تا۵۰۰M:۱۵٪|۵۰۰M-۱B:۲۰٪|+۱B:۲۵٪\n📅۳۱خرداد\n۱.ثبت‌نام مودیان ۲.POS ۳.تفکیک حساب',action:'FILE_TAX_RETURN',severity:'INFO'},
    {name:'corp',title:'اشخاص حقوقی ۱۴۰۵',description:'۲۵٪|ماده۱۳۲:۸۰٪معاف\n۴ماه پس از سال مالی\n⚠️جریمه تأخیر:۳۰٪',action:'CONSULT_ACCOUNTANT',severity:'WARNING'},
    {name:'vat',title:'VAT ۱۴۰۵=۱۲٪',description:'📊نرخ جدید:۱۲٪\nمهلت:۱۵روز\nکالاهای معاف:کشاورزی،دارو،کتاب\n⚠️جرایم:۷۵٪+۵۰٪',action:'REGISTER_VAT',severity:'WARNING'},
    {name:'late',title:'⚠️اظهارنامه ارسال نشده',description:'جریمه:۳۰٪+۲.۵٪ماهانه\nارسال فوری+بخشودگی',action:'FILE_TAX_RETURN',severity:'CRITICAL'},
    {name:'expert',title:'نیاز به مشاوره',description:'وضعیت پیچیده\nرزرو وقت با آیان تراز',action:'BOOK_CONSULTATION',severity:'NEEDS_REVIEW'},
    {name:'kb',title:'دانش‌بنیان',description:'✅معافیت ۱۵ساله\n✅VAT صفر\n✅گمرک معاف\nتأیید معاونت علمی',action:'CONSULT_ACCOUNTANT',severity:'INFO'},
    {name:'property',title:'مستغلات ۱۴۰۵',description:'معافیت:۲۸۰M (فاقد درآمد)\nنرخ:۱۵-۲۵٪\nقرارداد ۳ساله:۱۰۰٪معاف',action:'FILE_TAX_RETURN',severity:'INFO'},
    {name:'penalty',title:'جرایم ۱۴۰۵',description:'عدم اظهارنامه:۳۰٪|تأخیر:۲.۵٪ماهانه\nعدم VAT:۷۵٪|کتمان:۳۰٪\n💰بخشودگی تا ۱۰۰٪',action:'CONSULT_ACCOUNTANT',severity:'WARNING'},
  ]});console.log('✅ ۱۰ نتیجه');

  const sv1=await P.consultationService.create({data:{name:'مشاوره ۳۰دقیقه رایگان',slug:'c30',duration:30,price:0,sortOrder:1}});
  const sv2=await P.consultationService.create({data:{name:'مشاوره تخصصی ۶۰دقیقه',slug:'c60',duration:60,price:1500000,sortOrder:2}});
  await P.consultationService.create({data:{name:'تنظیم اظهارنامه',slug:'tax-filing',duration:45,price:2500000,sortOrder:3}});
  await P.consultationService.create({data:{name:'اعتراض برگ تشخیص',slug:'tax-appeal',duration:60,price:3000000,sortOrder:4}});
  await P.consultationService.create({data:{name:'ثبت‌نام مودیان',slug:'taxpayer-reg',duration:30,price:500000,sortOrder:5}});
  for(let d=0;d<5;d++){await P.consultationAvailability.create({data:{serviceId:sv1.id,dayOfWeek:d,startTime:'09:00',endTime:'17:00'}});await P.consultationAvailability.create({data:{serviceId:sv2.id,dayOfWeek:d,startTime:'09:00',endTime:'17:00'}})}

  await P.adminSetting.createMany({data:[
    {key:'vat_1405',value:'12'},{key:'vat_1404',value:'10'},{key:'corp_tax',value:'25'},
    {key:'sal_exempt_m',value:'400000000'},{key:'sal_exempt_y',value:'4800000000'},
    {key:'biz_exempt',value:'20000000000'},{key:'biz_exempt_pos',value:'43200000000'},
    {key:'prop_exempt',value:'2800000000'},{key:'per_cap',value:'600000000000'},{key:'corp_cap',value:'6000000000000'},
  ]});
  await P.sEOConfig.createMany({data:[
    {path:'/',title:'آیان تراز | مشاوره مالیاتی ۱۴۰۵',description:'VAT ۱۲٪، قوانین جدید ۱۴۰۵',indexable:true,followLinks:true},
    {path:'/chatbot',title:'دستیار مالیاتی ۱۴۰۵',description:'قوانین بودجه ۱۴۰۵',indexable:true},
    {path:'/consultation',title:'رزرو مشاوره',indexable:true},
  ]});
  console.log('\n🎉 کامل شد! ۱۴۰۵ — بخشنامه ۲۰۰/۱۰۰۵/ص');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>P.$disconnect());
