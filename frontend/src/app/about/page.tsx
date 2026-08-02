'use client';

import Link from 'next/link';
import { FiArrowLeft, FiUsers, FiAward, FiTarget, FiTrendingUp, FiShield, FiHeadphones } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';

const values = [
  {
    icon: <FiTarget className="w-8 h-8" />,
    title: 'Our Mission',
    description: 'To provide exceptional accounting and tax advisory services that empower our clients to achieve financial success with confidence and clarity.',
  },
  {
    icon: <FiTrendingUp className="w-8 h-8" />,
    title: 'Our Vision',
    description: 'To be the most trusted and innovative financial advisory firm in Iran, setting the standard for excellence in client service and professional expertise.',
  },
  {
    icon: <FiShield className="w-8 h-8" />,
    title: 'Our Values',
    description: 'Integrity, excellence, client focus, innovation, and teamwork are the foundation of everything we do at Ayan Taraz.',
  },
];

const teamMembers = [
  {
    name: 'Reza Ahmadi',
    title: 'Founder & Senior Tax Advisor',
    description: 'With over 15 years of experience in tax law and financial consulting, Reza leads our team with a commitment to excellence.',
    image: '/images/team/reza-ahmadi.jpg',
  },
  {
    name: 'Sara Mohammadi',
    title: 'Chief Accountant',
    description: 'Sara brings a decade of accounting expertise, specializing in financial reporting and business advisory services.',
    image: '/images/team/sara-mohammadi.jpg',
  },
  {
    name: 'Ali Karimi',
    title: 'Tax Consultant',
    description: 'Ali is our tax compliance specialist, helping clients navigate complex tax regulations with ease.',
    image: '/images/team/ali-karimi.jpg',
  },
  {
    name: 'Fatemeh Zahraei',
    title: 'Client Relations Manager',
    description: 'Fatemeh ensures our clients receive exceptional service and support throughout their financial journey.',
    image: '/images/team/fatemeh-zahraei.jpg',
  },
];

const stats = [
  { number: '15+', label: 'Years of Experience' },
  { number: '500+', label: 'Satisfied Clients' },
  { number: '1000+', label: 'Successful Projects' },
  { number: '95%', label: 'Client Satisfaction' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Ayan Taraz
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your trusted partner in financial success
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-300 mb-6">
                Founded in 2008, Ayan Taraz was born from a simple idea: to provide exceptional financial advisory services that empower individuals and businesses to achieve their financial goals with confidence.
              </p>
              <p className="text-gray-300 mb-6">
                Over the years, we have grown from a small practice to a leading accounting and tax advisory firm, serving clients across Iran. Our journey has been marked by a relentless pursuit of excellence, a deep commitment to our clients, and a passion for helping others succeed.
              </p>
              <p className="text-gray-300">
                Today, we continue to build on our foundation of trust, expertise, and innovation, delivering personalized solutions that make a real difference in the lives of our clients.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-gold p-1 rounded-xl">
                <div className="bg-gray-900 rounded-lg p-8">
                  <img
                    src="/images/about-us.jpg"
                    alt="Ayan Taraz Team"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Drives Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold-400">{value.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <h3 className="text-4xl font-bold text-gold-400 mb-2">{stat.number}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                  <img
                    src={member.image || '/images/team-placeholder.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gold-400 text-sm mb-2">{member.title}</p>
                <p className="text-gray-400 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Ayan Taraz?</h2>
              <p className="text-gray-300 mb-6">
                When you choose Ayan Taraz, you&apos;re choosing a partner who is deeply committed to your success. Here&apos;s what sets us apart:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiUsers className="w-6 h-6 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong>Personalized Service:</strong> We take the time to understand your unique needs and tailor our approach accordingly.
                  </span>
                </li>
                <li className="flex items-start">
                  <FiAward className="w-6 h-6 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong>Expertise:</strong> Our team brings years of experience and deep knowledge in accounting and tax advisory.
                  </span>
                </li>
                <li className="flex items-start">
                  <FiHeadphones className="w-6 h-6 text-gold-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">
                    <strong>Responsive Support:</strong> We&apos;re here when you need us, providing timely and helpful guidance.
                  </span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="/images/why-choose-us.jpg"
                alt="Why Choose Ayan Taraz"
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black via-black/50 to-transparent rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Experience the Ayan Taraz Difference?"
        description="Contact us today to learn how we can help you achieve your financial goals with confidence."
        ctaText="Contact Us"
        ctaHref="/contact"
        secondaryCtaText="Our Services"
        secondaryCtaHref="/services"
      />

      <Footer />
    </div>
  );
}
