'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface CTASectionProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  background?: 'dark' | 'light';
}

export default function CTASection({
  title,
  description,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  background = 'dark',
}: CTASectionProps) {
  return (
    <section
      className={`py-16 md:py-24 ${background === 'dark' ? 'bg-black' : 'bg-gray-900 bg-opacity-50'}`}
    >
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-300 mb-8">{description}</p>
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
        </div>
      </div>
    </section>
  );
}
