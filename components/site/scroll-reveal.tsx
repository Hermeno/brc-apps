'use client';

import { useEffect } from 'react';

// Blocks of the public pages that materialize as they scroll into view. The look
// lives in app/site.css ([data-reveal]); this only flips the attribute.
const TARGETS = [
  '.intro-band-inner > *', '.band-head', '.split > *', '.cols-3 > *', '.cols-4 > *',
  '.steps li', '.cols-end', '.photo-band .wrap > *', '.faq details', '.prose',
].map(selector => `.vsite main ${selector}`).join(',');

export default function ScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        const done = (event: TransitionEvent) => {
          if (event.target !== el) return; // a child's own hover transition bubbles here too
          el.removeAttribute('data-reveal');
          el.removeEventListener('transitionend', done);
        };
        el.addEventListener('transitionend', done);
        el.dataset.reveal = 'in';
      }
    }, { rootMargin: '0px 0px -8% 0px' });

    const fold = window.innerHeight;
    for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
      // Never hide what the visitor can already see, what already has its own entrance,
      // or a block inside one that will reveal as a whole.
      if (el.getBoundingClientRect().top < fold) continue;
      if (getComputedStyle(el).animationName !== 'none') continue;
      if (el.parentElement?.closest('[data-reveal]')) continue;
      const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--reveal-i', String(Math.min(index, 4)));
      el.dataset.reveal = 'pending';
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return null;
}
