import Image from 'next/image';
import type { Testimonial } from '@/lib/testimonials';

// The card outline from the supplied design: a rounded quadrilateral whose bottom
// edge drops toward the right (300×320 box, 84 px slant, 44 px corners).
const SHAPE = 'M0,44 Q0,0 44,0 L256,0 Q300,0 300,44 L300,276 Q300,320 257.6,308.1 L42.4,247.9 Q0,236 0,192 Z';

// The blue layer behind each card shows on a different side, as drawn.
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

export default function Testimonials({ items, sample }: { items: Testimonial[]; sample: boolean }) {
  if (items.length < 3) return null;
  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <div className="wrap">
        <h2 id="testimonials-title" className="tm-title">What our customers say</h2>
        <div className="tm-stage">
          <Card t={items[2]} slot="left" />
          <Card t={items[0]} slot="center" />
          <Card t={items[1]} slot="right" />
        </div>
        {sample && <p className="tm-note">Examples shown while we gather our first client reviews.</p>}
      </div>
    </section>
  );
}
