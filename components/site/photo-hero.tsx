import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/* Full-bleed photograph with the header over it and the page's message centred
   on top: the opening of the home page and of the pages in the main menu.
   One flat navy layer darkens the photo (app/site.css) — no gradient — and is
   strong enough for white text over the brightest part of the picture. */
export default function PhotoHero({ id, image, alt = '', position, kicker, title, lede, crumb, home = false, children }: {
  id: string;
  image: string;
  alt?: string;
  /** CSS object-position, to keep the subject clear of the text. */
  position?: string;
  kicker: string;
  title: ReactNode;
  lede: ReactNode;
  /** Current page for the breadcrumb; the home page has none. */
  crumb?: string;
  home?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="photo-hero" data-home={home ? '' : undefined} aria-labelledby={id}>
      <Image className="photo-hero-img" src={image} alt={alt} fill priority sizes="100vw"
        style={position ? { objectPosition: position } : undefined} />
      <div className="wrap photo-hero-inner">
        <p className="kicker">{kicker}</p>
        <h1 id={id}>{title}</h1>
        <p className="photo-hero-lede">{lede}</p>
        {children}
      </div>
      {crumb && (
        <nav className="wrap photo-hero-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{crumb}</span>
        </nav>
      )}
    </section>
  );
}
