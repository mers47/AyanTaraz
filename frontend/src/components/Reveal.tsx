'use client';

import { useEffect, useRef, ReactNode } from 'react';

/**
 * Reveal — wraps children and fades them up when scrolled into view.
 * Uses IntersectionObserver (zero deps, GPU-friendly).
 *
 * Usage:
 *   <Reveal><h2>عنوان</h2></Reveal>
 *   <Reveal delay={120}>...</Reveal>
 *   <Reveal as="section">...</Reveal>
 *
 * Honors prefers-reduced-motion automatically via CSS (.reveal rule).
 */
interface RevealProps {
  children: ReactNode;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  once?: boolean;
}

export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
  threshold = 0.12,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is unavailable, show immediately.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Component>
  );
}
