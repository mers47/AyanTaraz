'use client';

import Link from 'next/link';
import { FiArrowRight, FiChevronDown } from 'react-icons/fi';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage = '/images/hero-bg.jpg',
}: HeroSectionProps) {
  return (
    <section className="hero">
      {/* Background */}
      <div className="hero-bg" />
      
      {/* Content */}
      <div className="hero-content">
        <div className="mb-6">
          <p className="text-gold-400 font-medium text-lg mb-2">{subtitle}</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={ctaHref} className="btn btn-primary">
            {ctaText}
            <FiArrowRight className="w-5 h-5 ml-2" />
          </Link>
          {secondaryCtaText && secondaryCtaHref && (
            <Link href={secondaryCtaHref} className="btn btn-outline">
              {secondaryCtaText}
            </Link>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <FiChevronDown className="w-6 h-6 text-gold-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
