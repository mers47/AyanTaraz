'use client';

import { useEffect } from 'react';

/**
 * useScrollReveal — attaches an IntersectionObserver to all elements with
 * the `.reveal` class on the page. Ideal for content pages that render
 * server-side and want scroll-reveal without wrapping every element.
 *
 * Usage (in a client component or page):
 *   useScrollReveal();
 *
 * Then add className="reveal" to any element you want to animate in.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)');
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
