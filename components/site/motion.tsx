'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';

/* Motion for the public site.

   Skills applied: design-motion-principles in create mode. Jakub Krehel as the
   primary lens (motion explains the content, entrances are short and land once)
   and Emil Kowalski for navigation and forms (fast, interruptible, never in the
   way of a click).

   Rules kept from the brief:
   - only transform, opacity, filter and clip-path are animated
   - no scroll listeners: useScroll drives everything that follows the page
   - each element animates once, then stays put
   - exits are shorter and quieter than entrances
   - prefers-reduced-motion removes every animation, it does not shorten it

   The markup is server rendered either way, so the copy is in the HTML before
   any JavaScript runs. */

export const DUR = { fast: 0.16, ui: 0.24, reveal: 0.6, hero: 0.9 } as const;
export const EASE_IN = [0.16, 1, 0.3, 1] as const;   // entrances
export const EASE_UI = [0.2, 0.7, 0.2, 1] as const;  // interface state

/** The standard entrance: fade up with a touch of defocus, once. */
export function Reveal({
  children, delay = 0, as = 'div', className, id,
}: {
  children: ReactNode; delay?: number;
  as?: 'div' | 'section' | 'li' | 'figure' | 'nav' | 'ul' | 'article'; className?: string; id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduce) {
    const Plain = as as 'div';
    return <Plain className={className} id={id}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      id={id}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DUR.reveal, delay, ease: EASE_IN }}
    >
      {children}
    </Tag>
  );
}

/** Same entrance, staggered down a list. 60 ms apart, capped so long lists
    do not keep the reader waiting. */
export function RevealGroup({
  children, className, step = 0.06, max = 8,
}: { children: ReactNode[]; className?: string; step?: number; max?: number }) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={Math.min(i, max) * step}>{child}</Reveal>
      ))}
    </div>
  );
}

/** Hero copy: eyebrow, each headline line, lead, then the actions, 80 ms apart.
    On load rather than on scroll, because the hero is already in view. */
export function HeroIntro({ children, className }: { children: ReactNode[]; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.08 } } }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
            shown:  { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: DUR.reveal, ease: EASE_IN }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Hero photograph: uncovers from the top, settles out of a small zoom, then
    drifts at most 40 px against the scroll. The image keeps its width and
    height, so nothing shifts while it animates. */
export function HeroMedia({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  if (reduce) return <figure className={className}>{children}</figure>;

  return (
    <motion.figure
      ref={ref}
      className={className}
      style={{ y }}
      initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.06 }}
      animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
      transition={{ duration: DUR.hero, ease: EASE_IN }}
    >
      {children}
    </motion.figure>
  );
}

/** A photograph inside a band that drifts a little as the band passes. */
export function ParallaxMedia({
  children, className, distance = 30,
}: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);

  if (reduce) return <div className={className}>{children}</div>;
  return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}

/* Staggers whatever is already inside it, without adding a single element.
   The container gets data-stagger, and once it enters the viewport it gets
   data-in; the per-child delay lives in CSS, keyed off nth-child. That keeps
   sibling selectors like `.hero-index li+li a` working, which a wrapper per
   child would have broken. */
export function Stagger({
  children, className, as = 'div', id, ariaLabelledby,
}: {
  children: ReactNode; className?: string;
  as?: 'div' | 'ul' | 'ol' | 'nav' | 'section'; id?: string; ariaLabelledby?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const Tag = as as 'div';

  return (
    <Tag
      ref={ref as never}
      className={className}
      id={id}
      aria-labelledby={ariaLabelledby}
      data-stagger={reduce ? undefined : ''}
      data-in={!reduce && inView ? '' : undefined}
    >
      {children}
    </Tag>
  );
}
