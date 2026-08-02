'use client';

import Link from 'next/link';
import { FiArrowLeft, FiCalculator, FiFileText, FiUsers, FiTrendingUp, FiShield, FiDollarSign } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';

const services = [
  {
    id: 'tax-consultation',
    title: 'Tax Consultation',
    description: 'Expert advice on tax planning, compliance, and optimization strategies tailored to your specific situation.',
    icon: <FiCalculator className="w-8 h-8" />,
    features: [
      'Personalized tax planning',
      'Tax compliance assistance',
      'Deduction optimization',
      'Tax return preparation',
      'Audit representation',
    ],
    price: 'From 5M IRR',
    href: '/services/tax-consultation',
  },
  {
    id: 'accounting-services',
    title: 'Accounting Services',
    description: 'Comprehensive bookkeeping and financial management services to keep your business on track.',
    icon: <FiFileText className="w-8 h-8" />,
    features: [
      'Bookkeeping and record-keeping',
      'Financial statement preparation',
      'Payroll processing',
      'Budgeting and forecasting',
      'Cash flow management',
    ],
    price: 'From 3M IRR',
    href: '/services/accounting',
  },
  {
    id: 'business-consulting',
    title: 'Business Consulting',
    description: 'Strategic guidance to help you make informed decisions and achieve your business goals.',
    icon: <FiUsers className="w-8 h-8" />,
    features: [
      'Business plan development',
      'Market analysis',
      'Financial projections',
      'Risk assessment',
      'Growth strategies',
    ],
    price: 'From 8M IRR',
    href: '/services/business-consulting',
  },
  {
    id: 'financial-planning',
    title: 'Financial Planning',
    description: 'Personalized financial planning services to help you achieve your long-term financial goals.',
    icon: <FiTrendingUp className="w-8 h-8" />,
    features: [
      'Retirement planning',
      'Investment advice',
      'Estate planning',
      'Insurance analysis',
      'Wealth management',
    ],
    price: 'From 6M IRR',
    href: '/services/financial-planning',
  },
  {
    id: 'audit-services',
    title: 'Audit Services',
    description: 'Professional audit services to ensure accuracy and compliance in your financial reporting.',
    icon: <FiShield className="w-8 h-8" />,
    features: [
      'Financial statement audits',
      'Internal control reviews',
      'Compliance audits',
      'Fraud investigation',
      'Risk assessment',
    ],
    price: 'From 10M IRR',
    href: '/services/audit',
  },
  {
    id: 'tax-assistant',
    title: 'Tax Assistant',
    description: 'Our interactive tool provides instant, personalized tax advice based on your specific situation.',
    icon: <FiDollarSign className="w-8 h-8" />,
    features: [
      'Deterministic decision engine',
      'Personalized recommendations',
      'Rule-based calculations',
      'Source references',
      'Actionable insights',
    ],
    price: 'Free',
    href: '/tax-assistant',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-gray-300">
              Comprehensive solutions for all your financial needs
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={service.id} className="card card-hover group">
                <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors duration-300">
                  <span className="text-gold-400 group-hover:text-black transition-colors duration-300">
                    {service.icon}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-gold-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-gold-400 font-bold">{service.price}</span>
                  <Link
                    href={service.href}
                    className="text-gold-400 hover:text-gold-300 transition-colors font-medium"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Service Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-gold-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <FiCalculator className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tax Services</h3>
              <p className="text-gray-400 mb-4">
                Comprehensive tax solutions for individuals and businesses
              </p>
              <Link href="/services/tax-consultation" className="btn btn-outline">
                View Services
              </Link>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-gold-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accounting Services</h3>
              <p className="text-gray-400 mb-4">
                Professional bookkeeping and financial management
              </p>
              <Link href="/services/accounting" className="btn btn-outline">
                View Services
              </Link>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-gold-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Services</h3>
              <p className="text-gray-400 mb-4">
                Strategic guidance for business growth and success
              </p>
              <Link href="/services/business-consulting" className="btn btn-outline">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Expertise You Can Trust</h3>
              <p className="text-gray-400">
                Our team consists of highly qualified professionals with years of experience in accounting and tax advisory services.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Personalized Approach</h3>
              <p className="text-gray-400">
                We take the time to understand your unique needs and develop tailored solutions that deliver real results.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Commitment to Excellence</h3>
              <p className="text-gray-400">
                We are committed to providing the highest quality service and maintaining the highest ethical standards in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Get Started?"
        description="Contact us today to learn how our services can help you achieve your financial goals."
        ctaText="Book a Consultation"
        ctaHref="/consultation"
        secondaryCtaText="Contact Us"
        secondaryCtaHref="/contact"
      />

      <Footer />
    </div>
  );
}
