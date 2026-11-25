'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/testimonials';

/* The home page's testimonials, after the supplied reference: a centered title,
   three panels side by side (two on tablets, one on phones), round arrows,
   short dashes for the positions and, when there is more to read, one button.
   The track is a native horizontal scroller with snap points, so a phone
   swipes it and a keyboard scrolls it; the controls only move it. How many
   panels fit comes from the CSS (--per-view), so there is one source for it. */

const FIRST_BATCH = 6; // reviews shown before "View More Testimonials"

const initials = (name: string) => name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const reviews = items[0]?.kind === 'review';
  const [expanded, setExpanded] = useState(false);
  const shown = reviews && !expanded ? items.slice(0, FIRST_BATCH) : items;
  const hasMore = reviews && !expanded && items.length > FIRST_BATCH;

  const trackRef = useRef<HTMLUListElement>(null);
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const positions = Math.max(1, shown.length - perView + 1);
  const trackId = useId();

  // Distance between two snap points: a panel plus the gap.
  const step = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 0;
    return first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setPerView(Math.max(1, parseInt(getComputedStyle(track).getPropertyValue('--per-view'), 10) || 1));
    const s = step();
    if (s) setIndex(Math.round(track.scrollLeft / s));
  }, [step]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(measure);
    measure();
    track.addEventListener('scroll', onScroll, { passive: true });
    resize.observe(track);
    return () => { cancelAnimationFrame(frame); track.removeEventListener('scroll', onScroll); resize.disconnect(); };
  }, [measure]);

  // CSS sets scroll-behavior: smooth unless the visitor asked for less motion.
  const go = useCallback((target: number) => {
    trackRef.current?.scrollTo({ left: Math.max(0, target) * step() });
  }, [step]);

  // After "View More Testimonials", show the first new review and hand focus to the list,
  // since the button that had it is gone.
  const jumpTo = useRef<number | null>(null);
  useEffect(() => {
    if (jumpTo.current === null) return;
    go(Math.min(jumpTo.current, positions - 1));
    trackRef.current?.focus({ preventScroll: true });
    jumpTo.current = null;
  }, [expanded, positions, go]);

  const current = Math.min(index, positions - 1);
  const navigable = positions > 1;

  return (
    <section id="testimonials" className="tm-section" aria-labelledby="testimonials-title">
      <div className="wrap">
        <header className="tm-head">
          {reviews ? (
            <>
              <h2 id="testimonials-title" className="tm-headline">What Our <span>Clients</span> Say</h2>
              <p className="tm-sub">Real experiences from clients who found a cleaning professional through Verliks.</p>
            </>
          ) : (
            <>
              <h2 id="testimonials-title" className="tm-headline">How a good match can begin</h2>
              <p className="tm-sub">These scenarios show how Verliks works. They are examples, not reviews from customers or cleaners.</p>
            </>
          )}
        </header>

        <div className="tm-carousel" data-navigable={navigable || undefined}>
          <ul ref={trackRef} id={trackId} className="tm-track" role="list"
            aria-label={reviews ? 'Client testimonials' : 'Examples of how Verliks works'}
            tabIndex={navigable ? 0 : undefined}>
            {shown.map((item, i) => (
              <li key={`${item.name}-${i}`} className="tm-slide">
                {item.kind === 'review' ? (
                  <figure className="tm-panel">
                    <Quote className="tm-mark" size={36} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                    <blockquote className="tm-quote"><p>{item.quote}</p></blockquote>
                    <figcaption className="tm-who">
                      <span className="tm-avatar" aria-hidden="true">{initials(item.name)}</span>
                      <span>
                        <span className="tm-name">{item.name}</span>
                        <span className="tm-role">{item.detail}</span>
                      </span>
                    </figcaption>
                  </figure>
                ) : (
                  <article className="tm-panel">
                    <p className="tm-audience">{item.detail}</p>
                    <h3 className="tm-scenario">{item.name}</h3>
                    <p className="tm-quote">{item.quote}</p>
                  </article>
                )}
              </li>
            ))}
          </ul>

          {navigable && (
            <div className="tm-controls">
              <button type="button" className="tm-arrow tm-prev" aria-controls={trackId}
                aria-label={reviews ? 'Previous testimonials' : 'Previous examples'}
                disabled={current === 0} onClick={() => go(current - 1)}>
                <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
              </button>
              <div className="tm-dots" role="group" aria-label="Positions">
                {Array.from({ length: positions }, (_, i) => (
                  <button key={i} type="button" className="tm-dot" aria-controls={trackId}
                    aria-label={`Position ${i + 1} of ${positions}`} aria-current={i === current ? 'true' : undefined}
                    onClick={() => go(i)} />
                ))}
              </div>
              <button type="button" className="tm-arrow tm-next" aria-controls={trackId}
                aria-label={reviews ? 'Next testimonials' : 'Next examples'}
                disabled={current === positions - 1} onClick={() => go(current + 1)}>
                <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="tm-actions">
            <button type="button" className="tm-more" aria-controls={trackId}
              onClick={() => { jumpTo.current = FIRST_BATCH; setExpanded(true); }}>
              View More Testimonials <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
