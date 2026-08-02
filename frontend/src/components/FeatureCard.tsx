'use client';

import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export default function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <div
      className="card card-hover group"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors duration-300">
        <span className="text-gold-400 group-hover:text-black transition-colors duration-300">
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
