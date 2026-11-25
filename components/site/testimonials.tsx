import Image from 'next/image';
import type { Testimonial } from '@/lib/testimonials';

const initials = (name: string) => name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();

export default function Testimonials({ items, sample }: { items: Testimonial[]; sample: boolean }) {
  const visibleItems = items.filter(item => item.kind === (sample ? 'scenario' : 'review'));
  if (visibleItems.length === 0) return null;

  return (
    <section id="testimonials" className="testimonials" aria-labelledby="testimonials-title">
      <div className="wrap">
        <div className="tm-heading">
          <div>
            <p className="tm-eyebrow">{sample ? 'Illustrative examples' : 'Community stories'}</p>
            <h2 id="testimonials-title" className="tm-title">
              {sample ? 'How a good match can begin' : 'What clients and cleaners say'}
            </h2>
          </div>
          <p className="tm-intro">
            {sample
              ? 'These scenarios show how Verliks works. They are examples, not reviews from customers or cleaners.'
              : 'Experiences shared by people who have used Verliks.'}
          </p>
        </div>

        <div className="tm-grid">
          {visibleItems.map((item, index) => (
            <article className="tm-card" key={`${item.name}-${index}`}>
              {item.kind === 'scenario' ? (
                <>
                  <p className="tm-card-label">{item.detail}</p>
                  <h3 className="tm-card-title">{item.name}</h3>
                  <p className="tm-card-body">{item.quote}</p>
                </>
              ) : (
                <>
                  <span className="tm-quote-mark" aria-hidden="true">“</span>
                  <blockquote className="tm-quote"><p>{item.quote}</p></blockquote>
                  <div className="tm-person">
                    <span className="tm-avatar">
                      {item.photo
                        ? <Image src={item.photo} alt="" fill sizes="44px" />
                        : <span className="tm-initials" aria-hidden="true">{initials(item.name)}</span>}
                    </span>
                    <div>
                      <p className="tm-person-name">{item.name}</p>
                      <p className="tm-person-detail">{item.detail}</p>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
