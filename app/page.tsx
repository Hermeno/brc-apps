import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CircleArrowRight, ShieldCheck, Sparkles, SprayCan, Truck } from 'lucide-react';
import PublicPage from '@/components/site/public-page';
import PhotoHero from '@/components/site/photo-hero';
import ZipSearch from '@/components/site/zip-search';
import { getSiteService } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Find a Cleaner Near You | Verliks',
  description: 'Tell Verliks what needs cleaning and connect with an independent cleaner who serves your ZIP code. Your request is free; you agree on the work and price before accepting.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Verliks',
    title: 'Find a Cleaner Near You | Verliks',
    description: 'A simpler way to find independent cleaning professionals near you. Describe the job for free and decide before you book.',
    url: '/',
  },
};

const featured = [
  { slug: 'standard-cleaning', Icon: Sparkles, text: 'Routine cleaning for a home that is already more or less kept up: the kitchen, bathrooms, bedrooms, living areas and floors.' },
  { slug: 'deep-cleaning', Icon: SprayCan, text: 'A slower, more detailed clean for what routine cleaning keeps missing: build-up, baseboards, edges and the places behind and around things.' },
  { slug: 'move-in-move-out-cleaning', Icon: Truck, text: 'The clean that happens while the rooms are still empty, with cabinets and closets cleaned inside, before or after a move.' },
].map(item => ({ ...item, service: getSiteService(item.slug)! }));

const moreServices = ['recurring-cleaning', 'tile-and-grout-cleaning', 'home-organizing', 'post-construction-cleaning', 'commercial-cleaning']
  .map(slug => getSiteService(slug)!);

// "Standard Cleaning" → "Standard" / "Cleaning": two-line titles, as in the reference.
const twoLines = (name: string) => {
  const cut = name.lastIndexOf(' ');
  return <>{name.slice(0, cut)}<br />{name.slice(cut + 1)}</>;
};

export default function HomePage() {
  return (
    <PublicPage>
      <PhotoHero image="/images/site/verliks-cleaning-hero-editorial-20261006.webp" position="50% 30%"
        alt="A cleaning professional at work in a sunlit living room" labelledBy="home-title">
        <h1 id="home-title" className="hero-lines">
          <span className="l1">A cleaner home</span>
          <span className="l2">starts with</span>
          <span className="l3">the right person.</span>
        </h1>
        <p className="hero-lede">Connect with local cleaning professionals for your home.</p>
        <ZipSearch id="hero-zip" hint="Free to request · Availability depends on your ZIP code" />
      </PhotoHero>

      <section className="intro-band" aria-labelledby="intro-title">
        <div className="wrap intro-band-inner">
          <div>
            <h2 id="intro-title" className="t-display">Simple from the first request.</h2>
            <p className="t-sub">You decide before anyone comes to your home.</p>
            <p className="t-lead">Describe the job for free, then agree on the work and price with the cleaner before you accept.</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn-dark" href="/how-it-works">How it works</Link>
            <Link className="btn btn-primary" href="/request">Start a free request</Link>
          </div>
        </div>
      </section>

      <section className="band band-tight band-warm band-rule" aria-labelledby="featured-title">
        <div className="wrap">
          <h2 id="featured-title" className="sr-only">Popular cleaning services</h2>
          <div className="cols-3">
            {featured.map(({ slug, Icon, text, service }) => (
              <article key={slug}>
                <div className="col-head">
                  <Icon size={36} strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="t-item">{twoLines(service.name)}</h3>
                </div>
                <Link className="col-photo" href={`/services/${slug}`} tabIndex={-1} aria-hidden="true">
                  <Image src={`/images/site/${service.image}-800.jpg`} alt="" fill sizes="(max-width: 860px) 100vw, 30vw" />
                </Link>
                <p className="col-text">{text}</p>
                <Link className="more-link col-more" href={`/services/${slug}`}>
                  Learn more<span className="sr-only"> about {service.name}</span>
                  <CircleArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="info-title">
        <div className="wrap">
          <h2 id="info-title" className="sr-only">Good to know before you start</h2>
          <div className="cols-4">
            <div>
              <h3 className="t-col">How it works</h3>
              <ul className="ruled">
                <li>Describe the job for free</li>
                <li>A nearby cleaner can reply</li>
                <li>Agree on scope and price</li>
                <li>Accept when it feels right</li>
                <li>Pay the cleaner directly</li>
              </ul>
            </div>
            <div>
              <h3 className="t-col">Coverage</h3>
              <p>Verliks is starting in Connecticut. Requests are matched by ZIP code, so availability depends on the professionals near you.</p>
            </div>
            <div>
              <h3 className="t-col">More services</h3>
              <ul className="ruled">
                {moreServices.map(service => <li key={service.slug}><Link href={`/services/${service.slug}`}>{service.name}</Link></li>)}
              </ul>
            </div>
            <div>
              <h3 className="t-col">For cleaners</h3>
              <ul className="ruled">
                <li>Creating a profile is free</li>
                <li>Choose your area and work</li>
                <li>Answer only what you want</li>
                <li>Fee only when chosen</li>
                <li>ID reviewed by our team</li>
              </ul>
            </div>
          </div>
          <div className="cols-end btn-row">
            <Link className="btn btn-dark" href="/services">See all services</Link>
            <Link className="btn btn-primary" href="/for-cleaners">Join as a cleaner</Link>
          </div>
        </div>
      </section>

      <section className="photo-band on-dark" aria-labelledby="checks-title">
        <Image src="/process-bg.jpg" alt="" fill sizes="100vw" />
        <div className="wrap">
          <h2 id="checks-title" className="photo-band-title">What Verliks checks</h2>
          <div className="photo-band-body">
            <span className="photo-band-mark" aria-hidden="true"><ShieldCheck size={52} strokeWidth={1.5} /></span>
            <div>
              <p>Our team reviews a government ID and selfie before a cleaner can receive requests. Requests are matched to the services and area each professional chooses, and ratings from completed jobs appear on professional profiles.</p>
              <p className="note">Identity review is not a criminal background check. <Link href="/how-it-works#does-and-doesnt">What we check and what we leave to you</Link></p>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
