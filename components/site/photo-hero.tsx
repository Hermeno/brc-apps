import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

/* Full-width photograph, greyed and dimmed under one flat navy layer
   (app/site.css), with the message on the left of the page axis. */
export default function PhotoHero({ image, alt = '', position, size = 'home', labelledBy, children }: {
  image: string;
  alt?: string;
  /** CSS object-position, to keep the subject on the right. */
  position?: string;
  size?: 'home' | 'page';
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <section className="hero on-dark" data-size={size === 'page' ? 'page' : undefined} aria-labelledby={labelledBy}>
      <Image className="hero-img" src={image} alt={alt} fill priority sizes="100vw"
        style={position ? { objectPosition: position } : undefined} />
      <div className="wrap hero-inner"><div className="hero-copy">{children}</div></div>
    </section>
  );
}

/** The proportioned opening of an inner page: breadcrumb, kicker, title, lede, actions. */
export function PageHero({ id, image, alt, position, crumbs, kicker, title, lede, children }: {
  id: string;
  image: string;
  alt?: string;
  position?: string;
  /** Trail after "Home"; the last entry is the current page. */
  crumbs: { href?: string; label: string }[];
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <PhotoHero image={image} alt={alt} position={position} size="page" labelledBy={id}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.label}>
            <span aria-hidden="true">/</span>
            {index === crumbs.length - 1 || !crumb.href
              ? <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>
              : <Link href={crumb.href}>{crumb.label}</Link>}
          </Fragment>
        ))}
      </nav>
      {kicker && <p className="hero-kicker">{kicker}</p>}
      <h1 id={id} className="hero-title">{title}</h1>
      {lede && <p className="hero-lede">{lede}</p>}
      {children}
    </PhotoHero>
  );
}
