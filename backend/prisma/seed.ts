import { PrismaClient, UserRole, ContentStatus, TaxRuleStatus, TaxRuleVersionStatus, TaxResultSeverity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { phone: '+989120000000' },
    update: {},
    create: {
      phone: '+989120000000',
      phoneVerified: true,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('Created admin user:', adminUser.id);

  // Create categories
  const taxCategory = await prisma.category.upsert({
    where: { slug: 'tax' },
    update: {},
    create: {
      name: 'Tax',
      slug: 'tax',
      description: 'Tax-related articles',
      isActive: true,
      sortOrder: 1,
    },
  });

  const accountingCategory = await prisma.category.upsert({
    where: { slug: 'accounting' },
    update: {},
    create: {
      name: 'Accounting',
      slug: 'accounting',
      description: 'Accounting and financial articles',
      isActive: true,
      sortOrder: 2,
    },
  });

  const businessCategory = await prisma.category.upsert({
    where: { slug: 'business' },
    update: {},
    create: {
      name: 'Business',
      slug: 'business',
      description: 'Business and entrepreneurship articles',
      isActive: true,
      sortOrder: 3,
    },
  });

  console.log('Created categories');

  // Create tags
  const taxTag = await prisma.tag.upsert({
    where: { slug: 'tax' },
    update: {},
    create: {
      name: 'Tax',
      slug: 'tax',
    },
  });

  const accountingTag = await prisma.tag.upsert({
    where: { slug: 'accounting' },
    update: {},
    create: {
      name: 'Accounting',
      slug: 'accounting',
    },
  });

  const guideTag = await prisma.tag.upsert({
    where: { slug: 'guide' },
    update: {},
    create: {
      name: 'Guide',
      slug: 'guide',
    },
  });

  console.log('Created tags');

  // Create sample articles
  const article1 = await prisma.article.upsert({
    where: { slug: 'tax-deductions-guide' },
    update: {},
    create: {
      title: 'Complete Guide to Tax Deductions',
      slug: 'tax-deductions-guide',
      excerpt: 'Learn about all available tax deductions and how to claim them.',
      content: `# Tax Deductions Guide

This is a comprehensive guide to understanding tax deductions available to individuals and businesses.

## Introduction

Tax deductions can significantly reduce your taxable income. Understanding what deductions you qualify for is essential for effective tax planning.

## Common Deductions

- **Standard Deduction**: Available to all taxpayers
- **Itemized Deductions**: Medical expenses, mortgage interest, charitable contributions
- **Business Deductions**: Expenses related to your business operations

## How to Claim

1. Keep accurate records of all expenses
2. Determine whether to take standard or itemized deductions
3. File the appropriate forms with your tax return

## Important Notes

- Deduction limits may apply
- Some deductions phase out at higher income levels
- State and local deductions may differ

## Need Help?

Consider consulting with a tax professional for personalized advice based on your specific situation.`,
      status: ContentStatus.PUBLISHED,
      featuredImage: '/images/tax-guide.jpg',
      publishedAt: new Date(),
      categoryId: taxCategory.id,
      authorId: adminUser.id,
      metaTitle: 'Complete Guide to Tax Deductions | Ayan Taraz',
      metaDescription: 'Learn about all available tax deductions and how to claim them with this comprehensive guide.',
      canonicalUrl: '/articles/tax-deductions-guide',
      tags: {
        connect: [{ id: taxTag.id }, { id: guideTag.id }],
      },
    },
  });

  const article2 = await prisma.article.upsert({
    where: { slug: 'small-business-accounting' },
    update: {},
    create: {
      title: 'Small Business Accounting Basics',
      slug: 'small-business-accounting',
      excerpt: 'Essential accounting principles for small business owners.',
      content: `# Small Business Accounting Basics

Proper accounting is the foundation of a successful small business. This guide covers the essentials.

## Why Accounting Matters

- Track income and expenses
- Prepare for tax obligations
- Make informed business decisions
- Secure financing when needed

## Key Concepts

### Cash vs. Accrual Accounting

**Cash Basis**: Record income when received, expenses when paid
**Accrual Basis**: Record income when earned, expenses when incurred

### Chart of Accounts

- Assets: What your business owns
- Liabilities: What your business owes
- Equity: Owner investment and retained earnings
- Revenue: Income from sales
- Expenses: Costs of doing business

## Getting Started

1. Choose an accounting method
2. Set up your chart of accounts
3. Implement a system for tracking transactions
4. Regularly reconcile accounts
5. Generate financial statements

## Tools and Software

Consider using accounting software to automate many of these processes and reduce errors.`,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      categoryId: accountingCategory.id,
      authorId: adminUser.id,
      metaTitle: 'Small Business Accounting Basics | Ayan Taraz',
      metaDescription: 'Essential accounting principles for small business owners to manage their finances effectively.',
      canonicalUrl: '/articles/small-business-accounting',
      tags: {
        connect: [{ id: accountingTag.id }, { id: businessTag.id }],
      },
    },
  });

  console.log('Created sample articles');

  // Create tax topics
  const incomeTaxTopic = await prisma.taxTopic.upsert({
    where: { slug: 'income-tax' },
    update: {},
    create: {
      name: 'Income Tax',
      slug: 'income-tax',
      description: 'Personal and business income tax rules and regulations',
      sortOrder: 1,
      isActive: true,
    },
  });

  const vatTopic = await prisma.taxTopic.upsert({
    where: { slug: 'vat' },
    update: {},
    create: {
      name: 'Value Added Tax (VAT)',
      slug: 'vat',
      description: 'VAT rules, rates, and compliance requirements',
      sortOrder: 2,
      isActive: true,
    },
  });

  console.log('Created tax topics');

  // Create tax sources
  const taxAuthoritySource = await prisma.taxSource.upsert({
    where: { name: 'National Tax Authority' },
    update: {},
    create: {
      name: 'National Tax Authority',
      officialName: 'Iran National Tax Administration',
      url: 'https://www.tax.gov.ir',
      description: 'Official tax authority of Iran',
      isActive: true,
    },
  });

  console.log('Created tax sources');

  // Create tax rules
  const incomeTaxRule = await prisma.taxRule.upsert({
    where: { slug: 'personal-income-tax-2024' },
    update: {},
    create: {
      topicId: incomeTaxTopic.id,
      name: 'Personal Income Tax Rates 2024',
      slug: 'personal-income-tax-2024',
      description: 'Progressive tax rates for personal income in 2024',
      status: TaxRuleStatus.PUBLISHED,
    },
  });

  // Create tax rule version
  await prisma.taxRuleVersion.upsert({
    where: { ruleId_version: { ruleId: incomeTaxRule.id, version: 1 } },
    update: {},
    create: {
      ruleId: incomeTaxRule.id,
      version: 1,
      content: `Personal Income Tax Rates for 2024:

- 0 - 50,000,000 IRR: 0%
- 50,000,001 - 150,000,000 IRR: 10%
- 150,000,001 - 300,000,000 IRR: 15%
- 300,000,001 - 500,000,000 IRR: 20%
- 500,000,001 - 1,000,000,000 IRR: 25%
- Over 1,000,000,000 IRR: 35%

Note: These rates apply to annual taxable income after deductions.`,
      sourceId: taxAuthoritySource.id,
      effectiveFrom: new Date('2024-01-01'),
      effectiveTo: new Date('2024-12-31'),
      status: TaxRuleVersionStatus.PUBLISHED,
      publishedById: adminUser.id,
      publishedAt: new Date(),
    },
  });

  console.log('Created tax rules');

  // Create consultation services
  const taxConsultationService = await prisma.consultationService.upsert({
    where: { slug: 'tax-consultation' },
    update: {},
    create: {
      name: 'Tax Consultation',
      slug: 'tax-consultation',
      description: 'One-on-one consultation with our tax experts to address your specific tax questions and concerns.',
      duration: 60,
      price: 5000000, // 5,000,000 IRR
      isActive: true,
      sortOrder: 1,
    },
  });

  const accountingConsultationService = await prisma.consultationService.upsert({
    where: { slug: 'accounting-consultation' },
    update: {},
    create: {
      name: 'Accounting Consultation',
      slug: 'accounting-consultation',
      description: 'Professional accounting advice for individuals and small businesses.',
      duration: 45,
      price: 3000000, // 3,000,000 IRR
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log('Created consultation services');

  // Create availability for services (Monday to Friday, 9 AM to 5 PM)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayNumbers = [1, 2, 3, 4, 5]; // Monday = 1, Sunday = 0

  for (let i = 0; i < days.length; i++) {
    await prisma.consultationAvailability.upsert({
      where: {
        serviceId_dayOfWeek_startTime: {
          serviceId: taxConsultationService.id,
          dayOfWeek: dayNumbers[i],
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        serviceId: taxConsultationService.id,
        dayOfWeek: dayNumbers[i],
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    });

    await prisma.consultationAvailability.upsert({
      where: {
        serviceId_dayOfWeek_startTime: {
          serviceId: accountingConsultationService.id,
          dayOfWeek: dayNumbers[i],
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        serviceId: accountingConsultationService.id,
        dayOfWeek: dayNumbers[i],
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    });
  }

  console.log('Created consultation availability');

  // Create sample slots for the next 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Only create slots for weekdays
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      // Create slots every 2 hours from 9 AM to 5 PM
      for (let hour = 9; hour <= 17; hour += 2) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(hour + 1, 0, 0, 0);

        // Get availability for this day and service
        const availabilities = await prisma.consultationAvailability.findMany({
          where: {
            dayOfWeek: date.getDay(),
            startTime: { lte: `${hour}:00` },
            endTime: { gte: `${hour + 1}:00` },
          },
        });

        for (const avail of availabilities) {
          await prisma.consultationSlot.upsert({
            where: { id: `${avail.id}-${date.toISOString().split('T')[0]}-${hour}` },
            update: {},
            create: {
              availabilityId: avail.id,
              date,
              startTime,
              endTime,
              maxBookings: 1,
              isActive: true,
            },
          });
        }
      }
    }
  }

  console.log('Created consultation slots');

  // Create tax assistant questions
  const q1 = await prisma.taxQuestion.upsert({
    where: { id: 'q1' },
    update: {},
    create: {
      id: 'q1',
      question: 'What type of taxpayer are you?',
      description: 'Select the category that best describes your tax situation',
      sortOrder: 1,
      isActive: true,
    },
  });

  const q2 = await prisma.taxQuestion.upsert({
    where: { id: 'q2' },
    update: {},
    create: {
      id: 'q2',
      question: 'What is your approximate annual income?',
      description: 'Select the range that includes your total annual income',
      sortOrder: 2,
      isActive: true,
    },
  });

  const q3 = await prisma.taxQuestion.upsert({
    where: { id: 'q3' },
    update: {},
    create: {
      id: 'q3',
      question: 'Do you have any tax deductions to claim?',
      description: 'Consider standard deductions, itemized deductions, or business expenses',
      sortOrder: 3,
      isActive: true,
    },
  });

  console.log('Created tax assistant questions');

  // Create tax assistant options
  const q1Option1 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q1_opt1' },
    update: {},
    create: {
      id: 'q1_opt1',
      questionId: q1.id,
      label: 'Individual',
      value: 'individual',
      sortOrder: 1,
      isActive: true,
    },
  });

  const q1Option2 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q1_opt2' },
    update: {},
    create: {
      id: 'q1_opt2',
      questionId: q1.id,
      label: 'Small Business Owner',
      value: 'small_business',
      sortOrder: 2,
      isActive: true,
    },
  });

  const q1Option3 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q1_opt3' },
    update: {},
    create: {
      id: 'q1_opt3',
      questionId: q1.id,
      label: 'Corporation',
      value: 'corporation',
      sortOrder: 3,
      isActive: true,
    },
  });

  const q2Option1 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q2_opt1' },
    update: {},
    create: {
      id: 'q2_opt1',
      questionId: q2.id,
      label: 'Less than 50,000,000 IRR',
      value: 'under_50m',
      sortOrder: 1,
      isActive: true,
    },
  });

  const q2Option2 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q2_opt2' },
    update: {},
    create: {
      id: 'q2_opt2',
      questionId: q2.id,
      label: '50,000,000 - 150,000,000 IRR',
      value: '50m_150m',
      sortOrder: 2,
      isActive: true,
    },
  });

  const q2Option3 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q2_opt3' },
    update: {},
    create: {
      id: 'q2_opt3',
      questionId: q2.id,
      label: '150,000,000 - 500,000,000 IRR',
      value: '150m_500m',
      sortOrder: 3,
      isActive: true,
    },
  });

  const q2Option4 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q2_opt4' },
    update: {},
    create: {
      id: 'q2_opt4',
      questionId: q2.id,
      label: 'Over 500,000,000 IRR',
      value: 'over_500m',
      sortOrder: 4,
      isActive: true,
    },
  });

  const q3Option1 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q3_opt1' },
    update: {},
    create: {
      id: 'q3_opt1',
      questionId: q3.id,
      label: 'Yes, I have significant deductions',
      value: 'yes_deductions',
      sortOrder: 1,
      isActive: true,
    },
  });

  const q3Option2 = await prisma.taxQuestionOption.upsert({
    where: { id: 'q3_opt2' },
    update: {},
    create: {
      id: 'q3_opt2',
      questionId: q3.id,
      label: 'No, I will take the standard deduction',
      value: 'standard_deduction',
      sortOrder: 2,
      isActive: true,
    },
  });

  console.log('Created tax assistant options');

  // Create tax assistant flows
  await prisma.taxQuestionFlow.upsert({
    where: { id: 'flow_q1_to_q2' },
    update: {},
    create: {
      id: 'flow_q1_to_q2',
      fromQuestionId: q1.id,
      toQuestionId: q2.id,
      sortOrder: 1,
    },
  });

  await prisma.taxQuestionFlow.upsert({
    where: { id: 'flow_q2_to_q3' },
    update: {},
    create: {
      id: 'flow_q2_to_q3',
      fromQuestionId: q2.id,
      toQuestionId: q3.id,
      sortOrder: 1,
    },
  });

  console.log('Created tax assistant flows');

  // Create tax assistant results
  const result1 = await prisma.taxAssistantResult.upsert({
    where: { name: 'LOW_TAX_BRACKET' },
    update: {},
    create: {
      name: 'LOW_TAX_BRACKET',
      title: 'You are in a Low Tax Bracket',
      description: `Based on your income, you fall into one of the lower tax brackets. Your effective tax rate will be relatively low. You may benefit from standard deductions and should consider tax-advantaged savings accounts if available.`,
      ruleIds: [incomeTaxRule.id],
      action: 'REVIEW_DEDUCTIONS',
      severity: TaxResultSeverity.INFO,
      isActive: true,
    },
  });

  const result2 = await prisma.taxAssistantResult.upsert({
    where: { name: 'MEDIUM_TAX_BRACKET' },
    update: {},
    create: {
      name: 'MEDIUM_TAX_BRACKET',
      title: 'You are in a Medium Tax Bracket',
      description: `Your income places you in a medium tax bracket. You should carefully consider itemizing deductions if you have significant expenses. Tax planning can help reduce your liability.`,
      ruleIds: [incomeTaxRule.id],
      action: 'CONSIDER_ITEMIZING',
      severity: TaxResultSeverity.INFO,
      isActive: true,
    },
  });

  const result3 = await prisma.taxAssistantResult.upsert({
    where: { name: 'HIGH_TAX_BRACKET' },
    update: {},
    create: {
      name: 'HIGH_TAX_BRACKET',
      title: 'You are in a High Tax Bracket',
      description: `With your income level, you are in one of the highest tax brackets. Aggressive tax planning is essential. Consider consulting with a tax professional to explore all available deductions, credits, and tax-advantaged investment strategies.`,
      ruleIds: [incomeTaxRule.id],
      action: 'CONSULT_PROFESSIONAL',
      severity: TaxResultSeverity.WARNING,
      isActive: true,
    },
  });

  console.log('Created tax assistant results');

  // Create SEO configurations
  await prisma.sEOConfig.upsert({
    where: { path: '/' },
    update: {},
    create: {
      path: '/',
      title: 'Ayan Taraz - Professional Accounting & Tax Advisory Services',
      description: 'Expert accounting and tax advisory services for individuals and businesses. Get professional advice on tax planning, compliance, and financial management.',
      canonical: '/',
      ogTitle: 'Ayan Taraz - Professional Accounting & Tax Advisory',
      ogDescription: 'Expert accounting and tax advisory services for individuals and businesses.',
      ogUrl: '/',
      twitterCard: 'summary_large_image',
      schemaMarkup: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Ayan Taraz',
        url: 'https://ayantaraz.ir',
        description: 'Professional Accounting & Tax Advisory Services',
        logo: 'https://ayantaraz.ir/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+98-21-12345678',
          contactType: 'Customer Service',
        },
      }),
      indexable: true,
      followLinks: true,
    },
  });

  await prisma.sEOConfig.upsert({
    where: { path: '/articles' },
    update: {},
    create: {
      path: '/articles',
      title: 'Articles - Ayan Taraz',
      description: 'Read our expert articles on accounting, tax, and financial management topics.',
      canonical: '/articles',
      ogTitle: 'Articles - Ayan Taraz',
      ogDescription: 'Expert articles on accounting, tax, and financial management.',
      indexable: true,
      followLinks: true,
    },
  });

  await prisma.sEOConfig.upsert({
    where: { path: '/tax-assistant' },
    update: {},
    create: {
      path: '/tax-assistant',
      title: 'Tax Assistant - Ayan Taraz',
      description: 'Use our interactive tax assistant to get personalized tax advice based on your situation.',
      canonical: '/tax-assistant',
      ogTitle: 'Tax Assistant - Ayan Taraz',
      ogDescription: 'Interactive tax assistant for personalized advice.',
      indexable: true,
      followLinks: true,
    },
  });

  console.log('Created SEO configurations');

  // Create redirects
  await prisma.redirect.upsert({
    where: { fromPath: '/old-article' },
    update: {},
    create: {
      fromPath: '/old-article',
      toPath: '/articles/tax-deductions-guide',
      statusCode: 301,
      isActive: true,
    },
  });

  console.log('Created redirects');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
