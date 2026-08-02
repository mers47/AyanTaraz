'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiUsers, FiFileText, FiCalculator, FiCalendar, FiPhone } from 'react-icons/fi';

// Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import CTASection from '@/components/CTASection';

const features = [
  {
    icon: <FiCheckCircle className="w-8 h-8" />,
    title: 'Expert Advice',
    description: 'Get professional guidance from experienced tax and accounting specialists.',
  },
  {
    icon: <FiUsers className="w-8 h-8" />,
    title: 'Personalized Service',
    description: 'Tailored solutions for your unique financial situation and goals.',
  },
  {
    icon: <FiFileText className="w-8 h-8" />,
    title: 'Compliance Assurance',
    description: 'Stay compliant with all tax regulations and filing requirements.',
  },
  {
    icon: <FiCalculator className="w-8 h-8" />,
    title: 'Tax Optimization',
    description: 'Maximize deductions and minimize liabilities with strategic planning.',
  },
  {
    icon: <FiCalendar className="w-8 h-8" />,
    title: 'Timely Service',
    description: 'Meet all deadlines with our proactive approach to tax management.',
  },
  {
    icon: <FiPhone className="w-8 h-8" />,
    title: 'Responsive Support',
    description: 'Get answers to your questions with our dedicated support team.',
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection
        title="Professional Accounting & Tax Advisory"
        subtitle="Expert financial guidance for individuals and businesses"
        description="Navigate the complexities of tax regulations and financial management with confidence. Our team of experienced professionals provides personalized solutions tailored to your unique needs."
        ctaText="Start Your Consultation"
        ctaHref="/consultation"
        secondaryCtaText="Learn More"
        secondaryCtaHref="/about"
      />

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Ayan Taraz?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We combine expertise with personalized service to deliver exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Services
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive solutions for all your accounting and tax needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tax Consultation */}
            <div className="card card-hover group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
                  <FiCalculator className="w-6 h-6 text-gold-500 group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold ml-4">Tax Consultation</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Personalized tax planning and strategy to minimize your liability and maximize savings.
              </p>
              <Link
                href="/services/tax-consultation"
                className="inline-flex items-center text-gold-400 hover:text-gold-300 transition-colors duration-200 font-medium"
              >
                Learn more <FiArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Accounting Services */}
            <div className="card card-hover group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
                  <FiFileText className="w-6 h-6 text-gold-500 group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold ml-4">Accounting Services</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Comprehensive bookkeeping, financial reporting, and business advisory services.
              </p>
              <Link
                href="/services/accounting"
                className="inline-flex items-center text-gold-400 hover:text-gold-300 transition-colors duration-200 font-medium"
              >
                Learn more <FiArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Tax Assistant */}
            <div className="card card-hover group md:col-span-2">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
                    <FiUsers className="w-6 h-6 text-gold-500 group-hover:text-black transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold ml-4">Interactive Tax Assistant</h3>
                </div>
                <div className="md:ml-auto">
                  <Link
                    href="/tax-assistant"
                    className="btn btn-outline"
                  >
                    Try it now
                  </Link>
                </div>
              </div>
              <p className="text-gray-400 mt-4">
                Get instant, personalized tax advice with our intelligent assistant. Answer a few questions and receive tailored recommendations based on your specific situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Take Control of Your Finances?"
        description="Schedule a consultation with one of our experts today and discover how we can help you achieve your financial goals."
        ctaText="Book a Consultation"
        ctaHref="/consultation"
        secondaryCtaText="Contact Us"
        secondaryCtaHref="/contact"
      />

      <Footer />
    </div>
  );
}
