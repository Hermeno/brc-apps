'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SAMPLE_TESTIMONIALS, type Testimonial } from '@/lib/testimonials';

// The card outline from the supplied design: a rounded quadrilateral whose bottom
// edge drops toward the right (300×320 box, 84 px slant, 44 px corners).
const SHAPE = 'M0,44 Q0,0 44,0 L256,0 Q300,0 300,44 L300,276 Q300,320 257.6,308.1 L42.4,247.9 Q0,236 0,192 Z';

// The green layer behind each card shows on a different side, as drawn.
const OFFSET = { left: 'translate(-14 -12)', center: 'translate(14 -12)', right: 'translate(-12 14)' } as const;
type Slot = keyof typeof OFFSET;

const initials = (name: string) => name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();

function Card({ t, slot }: { t: Testimonial; slot: Slot }) {
  return (
    <figure className="tm-card" data-slot={slot}>
      <figcaption>
        <span className="tm-avatar">
          {t.photo
            ? <Image src={t.photo} alt="" fill sizes="96px" />
            : <span className="tm-initials" aria-hidden="true">{initials(t.name)}</span>}
        </span>
        <span className="tm-name">{t.name}</span>
        <span className="tm-detail">{t.detail}</span>
      </figcaption>
      <span className="tm-mark" aria-hidden="true">”</span>
      <blockquote className="tm-quote"><p>{t.quote}</p></blockquote>
      <svg className="tm-shape" viewBox="0 0 300 320" aria-hidden="true" focusable="false">
        <path className="tm-back" d={SHAPE} transform={OFFSET[slot]} />
        <path className="tm-front" d={SHAPE} />
      </svg>
    </figure>
  );
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [list, setList] = useState(items.length >= 3 ? items : null);
  const [preview, setPreview] = useState(false);
  const [active, setActive] = useState(0);

  // Until three real testimonials exist, only the team sees the section, with samples.
  useEffect(() => {
    if (!list && new URLSearchParams(window.location.search).get('preview') === 'testimonials') {
      setList(SAMPLE_TESTIMONIALS);
      setPreview(true);
    }
  }, [list]);

  if (!list) return null;
  const at = (offset: number) => (active + offset + list.length) % list.length;

  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <div className="wrap">
        {preview && (
          <p className="tm-preview">Preview with sample testimonials. The public sees this section once three real ones are added.</p>
        )}
        <h2 id="testimonials-title" className="tm-title">What our customers say</h2>
        <div className="tm-stage">
          {(['left', 'center', 'right'] as const).map((slot, i) => (
            <Card key={`${slot}-${at(i - 1)}`} t={list[at(i - 1)]} slot={slot} />
          ))}
        </div>
        <div className="tm-dots" role="group" aria-label="Choose a testimonial">
          {list.map((t, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              aria-label={`Show the testimonial from ${t.name}`} aria-current={i === active ? 'true' : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}
