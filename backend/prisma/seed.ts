import { PrismaClient } from '@prisma/client';
const P = new PrismaClient();

async function main() {
  console.log('🌱 بارگذاری ۱۴۰۵\n');
  const [c1] = await Promise.all([
    P.category.create({data:{name:'مالیات مستقیم',slug:'direct-tax',sortOrder:1}}),
    P.category.create({data:{name:'ارزش افزوده',slug:'vat',sortOrder:2}}),
    P.category.create({data:{name:'مشاوره',slug:'consult',sortOrder:3}}),
    P.category.create({data:{name:'قوانین ۱۴۰۵',slug:'regs-1405',sortOrder:4}}),
  ]);

  const [s1] = await Promise.all([
    P.taxSource.create({data:{name:'قانون مالیات‌های مستقیم',officialName:'سازمان امور مالیاتی',url:'https://intamedia.ir'}}),
    P.taxSource.create({data:{name:'قانون VAT',officialName:'سازمان امور مالیاتی',url:'https://evat.ir',description:'۱۲٪ ۱۴۰۵'}}),
  ]);

  const t = await Promise.all([
    P.taxTopic.create({data:{name:'اشخاص حقیقی',slug:'personal',sortOrder:1}}),
    P.taxTopic.create({data:{name:'اشخاص حقوقی',slug:'corp',sortOrder:2}}),
    P.taxTopic.create({data:{name:'ارزش افزوده ۱۴۰۵',slug:'vat-1405',sortOrder:3}}),
    P.taxTopic.create({data:{name:'معافیت‌ها',slug:'exempt',sortOrder:4}}),
    P.taxTopic.create({data:{name:'مالیات حقوق ۱۴۰۵',slug:'salary-1405',description:'۴۰M',sortOrder:5}}),
    P.taxTopic.create({data:{name:'مالیات مشاغل ۱۴۰۵',slug:'biz-1405',sortOrder:6}}),
    P.taxTopic.create({data:{name:'تکالیف/جرایم',slug:'duties',sortOrder:7}}),
  ]);

  for(const r of [{tid:t[4].id,n:'معافیت حقوق ۱۴۰۵',s:'sal-exempt',d:'۴۰M ماهانه=۴۸۰M سالانه'},{tid:t[4].id,n:'نرخ حقوق ۱۴۰۵',s:'sal-rates',d:'۱۰-۳۰٪ پلکانی'},{tid:t[5].id,n:'معافیت مشاغل ۱۴۰۵',s:'biz-exempt',d:'۲۰۰M (POS:۴۳۲M)'},{tid:t[5].id,n:'نرخ مشاغل',s:'biz-rates',d:'۱۵-۲۵٪'},{tid:t[2].id,n:'VAT ۱۴۰۵',s:'vat-12',d:'۱۲٪'},{tid:t[1].id,n:'نرخ حقوقی',s:'corp-25',d:'۲۵٪'},{tid:t[6].id,n:'جریمه تأخیر',s:'penalty',d:'۳۰٪+۲.۵٪ماهانه'},{tid:t[6].id,n:'مهلت اظهارنامه',s:'deadline',d:'حقیقی:۳۱خرداد'}])
    await P.taxRule.create({data:{topicId:r.tid,name:r.n,slug:r.s,description:r.d,status:'PUBLISHED',versions:{create:{version:1,content:r.d,sourceId:s1.id,effectiveFrom:new Date('2025-03-21'),status:'PUBLISHED'}}}});

  const q1 = await P.taxQuestion.create({data:{question:'نوع فعالیت؟',sortOrder:1,options:{create:[{label:'حقوق‌بگیر',value:'s',sortOrder:1},{label:'کسب‌وکار',value:'b',sortOrder:2},{label:'شرکت',value:'c',sortOrder:3},{label:'VAT',value:'v',sortOrder:4}]}}});
  const q2 = await P.taxQuestion.create({data:{question:'درآمد؟',sortOrder:2,options:{create:[{label:'کم',value:'lo',sortOrder:1},{label:'متوسط',value:'mid',sortOrder:2},{label:'زیاد',value:'hi',sortOrder:3},{label:'خیلی زیاد',value:'top',sortOrder:4}]}}});
  const q3 = await P.taxQuestion.create({data:{question:'معافیت؟',sortOrder:3,options:{create:[{label:'خیر',value:'no',sortOrder:1},{label:'مناطق آزاد',value:'fz',sortOrder:2},{label:'دانش‌بنیان',value:'kb',sortOrder:3},{label:'ماده۱۳۲',value:'a132',sortOrder:4}]}}});
  const q4 = await P.taxQuestion.create({data:{question:'VAT؟ ۱۲٪',sortOrder:4,options:{create:[{label:'بله',value:'y',sortOrder:1},{label:'خیر',value:'n',sortOrder:2},{label:'نمی‌دانم',value:'idk',sortOrder:3}]}}});
  const q5 = await P.taxQuestion.create({data:{question:'اظهارنامه؟',sortOrder:5,options:{create:[{label:'ارسال شده',value:'ok',sortOrder:1},{label:'ارسال نشده',value:'no',sortOrder:2},{label:'با تأخیر',value:'late',sortOrder:3}]}}});
  const q6 = await P.taxQuestion.create({data:{question:'کمک؟',sortOrder:6,options:{create:[{label:'محاسبه',value:'calc',sortOrder:1},{label:'اعتراض',value:'app',sortOrder:2},{label:'ثبت‌نام',value:'reg',sortOrder:3},{label:'مشاوره',value:'cons',sortOrder:4}]}}});
  const q7 = await P.taxQuestion.create({data:{question:'POS؟',sortOrder:7,options:{create:[{label:'بله',value:'y',sortOrder:1},{label:'خیر',value:'n',sortOrder:2}]}}});
  const q8 = await P.taxQuestion.create({data:{question:'حساب تفکیک؟',sortOrder:8,options:{create:[{label:'بله',value:'y',sortOrder:1},{label:'خیر',value:'n',sortOrder:2}]}}});

  const go=async(q:string,v:string)=>(await P.taxQuestionOption.findFirst({where:{questionId:q,value:v}}))!.id;
  await P.taxQuestionFlow.createMany({data:[
    {fromQuestionId:q1.id,toQuestionId:q2.id,optionId:await go(q1.id,'s')},{fromQuestionId:q1.id,toQuestionId:q2.id,optionId:await go(q1.id,'b')},
    {fromQuestionId:q1.id,toQuestionId:q2.id,optionId:await go(q1.id,'c')},{fromQuestionId:q1.id,toQuestionId:q4.id,optionId:await go(q1.id,'v')},
    {fromQuestionId:q2.id,toQuestionId:q3.id,optionId:await go(q2.id,'lo')},{fromQuestionId:q2.id,toQuestionId:q3.id,optionId:await go(q2.id,'mid')},
    {fromQuestionId:q2.id,toQuestionId:q3.id,optionId:await go(q2.id,'hi')},{fromQuestionId:q2.id,toQuestionId:q3.id,optionId:await go(q2.id,'top')},
    {fromQuestionId:q3.id,toQuestionId:q4.id,optionId:await go(q3.id,'no')},{fromQuestionId:q3.id,toQuestionId:q4.id,optionId:await go(q3.id,'fz')},
    {fromQuestionId:q3.id,toQuestionId:q4.id,optionId:await go(q3.id,'kb')},{fromQuestionId:q3.id,toQuestionId:q4.id,optionId:await go(q3.id,'a132')},
    {fromQuestionId:q4.id,toQuestionId:q5.id,optionId:await go(q4.id,'y')},{fromQuestionId:q4.id,toQuestionId:q5.id,optionId:await go(q4.id,'n')},
    {fromQuestionId:q4.id,toQuestionId:q5.id,optionId:await go(q4.id,'idk')},{fromQuestionId:q5.id,toQuestionId:q6.id,optionId:await go(q5.id,'ok')},
    {fromQuestionId:q5.id,toQuestionId:q6.id,optionId:await go(q5.id,'no')},{fromQuestionId:q5.id,toQuestionId:q6.id,optionId:await go(q5.id,'late')},
    {fromQuestionId:q6.id,toQuestionId:q7.id,optionId:await go(q6.id,'calc')},{fromQuestionId:q6.id,toQuestionId:q7.id,optionId:await go(q6.id,'app')},
    {fromQuestionId:q6.id,toQuestionId:q7.id,optionId:await go(q6.id,'reg')},{fromQuestionId:q6.id,toQuestionId:q7.id,optionId:await go(q6.id,'cons')},
    {fromQuestionId:q7.id,toQuestionId:q8.id,optionId:await go(q7.id,'y')},{fromQuestionId:q7.id,toQuestionId:q8.id,optionId:await go(q7.id,'n')},
  ]});

  await P.taxAssistantResult.createMany({data:[
    {name:'exempt',title:'معاف ۱۴۰۵',description:'✅ حقوق:۴۰M\nمشاغل:۲۰۰M\n⚠️اظهارنامه الزامی',action:'REGISTER_TAXPAYER',severity:'INFO'},
    {name:'sal',title:'مالیات حقوق ۱۴۰۵',description:'۴۰-۸۰M:۱۰٪|۸۰-۱۰۰M:۱۵٪|۱۰۰-۱۲۰M:۲۰٪|۱۲۰-۱۴۰M:۲۵٪|+۱۴۰M:۳۰٪',severity:'INFO'},
    {name:'biz',title:'مالیات مشاغل ۱۴۰۵',description:'تا۵۰۰M:۱۵٪|۵۰۰M-۱B:۲۰٪|+۱B:۲۵٪\n📅۳۱خرداد',action:'FILE_TAX_RETURN',severity:'INFO'},
    {name:'corp',title:'شرکت',description:'۲۵٪|ماده۱۳۲:۸۰٪|۴ماه',action:'CONSULT_ACCOUNTANT',severity:'WARNING'},
    {name:'vat',title:'VAT ۱۴۰۵=۱۲٪',description:'نرخ:۱۲٪|مهلت:۱۵روز|جریمه:۷۵٪',action:'REGISTER_VAT',severity:'WARNING'},
    {name:'late',title:'⚠️اظهارنامه',description:'جریمه:۳۰٪+۲.۵٪ماهانه',action:'FILE_TAX_RETURN',severity:'CRITICAL'},
    {name:'expert',title:'نیاز به مشاوره',description:'رزرو وقت آیان تراز',action:'BOOK_CONSULTATION',severity:'NEEDS_REVIEW'},
    {name:'kb',title:'دانش‌بنیان',description:'معاف۱۵سال|VATصفر',action:'CONSULT_ACCOUNTANT',severity:'INFO'},
  ]});

  const sv1 = await P.consultationService.create({data:{name:'مشاوره ۳۰دقیقه رایگان',slug:'c30',duration:30,price:0,sortOrder:1}});
  await P.consultationService.create({data:{name:'مشاوره ۶۰دقیقه',slug:'c60',duration:60,price:1500000,sortOrder:2}});
  for(let d=0;d<5;d++)await P.consultationAvailability.create({data:{serviceId:sv1.id,dayOfWeek:d,startTime:'09:00',endTime:'17:00'}});

  await P.adminSetting.createMany({data:[{key:'site','value':'آیان تراز'},{key:'vat_1405','value':'12'},{key:'corp_tax','value':'25'},{key:'salary_1405','value':'4800000000'},{key:'biz_exempt','value':'20000000000'}]});
  await P.sEOConfig.createMany({data:[{path:'/',title:'آیان تراز ۱۴۰۵',description:'VAT ۱۲٪',indexable:true,followLinks:true}]});
  console.log('✅ ۱۴۰۵ آماده');
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>P.$disconnect());
