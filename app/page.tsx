import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ClipboardList, MessagesSquare, UserCheck } from 'lucide-react';
import './site.css';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import PhotoHero from '@/components/site/photo-hero';
import ZipSearch from '@/components/site/zip-search';
import { SERVICE_GROUP_ORDER, getSiteService, groupAnchor } from '@/lib/site-content';

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

/* The request flow as it really runs: describe the job, talk with a cleaner
   who responds, then accept (or not) and pay the cleaner directly. */
const steps = [
  { Icon: ClipboardList, title: 'Tell us about the job', body: 'Choose a service, share your ZIP code and describe the space. Sending a request is free.' },
  { Icon: MessagesSquare, title: 'Talk through the details', body: 'An available professional who offers the service in your area can respond. Discuss scope, timing and price together.' },
  { Icon: UserCheck, title: 'Choose with confidence', body: 'Review the professional and accept only when it feels right. You pay the cleaner directly on the terms you agree.' },
];

// Six services with photographs, each opening its own /services page.
const gallery = [
  'standard-cleaning', 'deep-cleaning', 'recurring-cleaning',
  'move-in-move-out-cleaning', 'home-organizing', 'post-construction-cleaning',
].map(slug => getSiteService(slug)!);

export default function HomePage() {
  return (
    <div className="vsite">
      <a className="skip-link" href="#main">Skip to main content</a>
      <SiteHeader overlay />
      <main id="main">
        <PhotoHero home id="home-title"
          image="/images/site/verliks-cleaning-hero-editorial-20261006.webp"
          alt="A cleaning professional at work in a sunlit living room"
          kicker="Local cleaning professionals"
          title={<><span>A cleaner home.</span> <span>The right person.</span></>}
          lede="Connect with local cleaning professionals for your home.">
          <ZipSearch id="hero-zip" hint="Free to request · Availability depends on your ZIP code" />
        </PhotoHero>

        <section className="feature-band" aria-labelledby="steps-title">
          <h2 id="steps-title" className="sr-only">How a request works</h2>
          <ol className="wrap feature-list">
            {steps.map(({ Icon, title, body }) => (
              <li key={title}>
                <Icon className="feature-icon" size={64} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                <div><h3>{title}</h3><p>{body}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="intro" aria-labelledby="intro-title">
          <div className="wrap intro-grid">
            <div className="intro-photo">
              <Image src="/images/site/how-it-works-phone-kitchen-1600.jpg" alt="A woman reading a message on her phone in a kitchen" fill sizes="(max-width: 860px) 100vw, 46vw" />
            </div>
            <div className="intro-copy">
              <p className="kicker">The Verliks way</p>
              <h2 id="intro-title" className="v-title">We make the introduction. You agree on the details.</h2>
              <p>Verliks connects you with independent cleaning professionals who serve your ZIP code. They work for themselves, not for Verliks.</p>
              <p>When a cleaner responds, you talk it through in a conversation on Verliks. Agree on the scope, the date and time, and the price before you confirm anyone. You pay the cleaner directly.</p>
              <p className="intro-links">
                <Link className="arrow-link" href="/how-it-works">See how it works <ArrowUpRight size={17} aria-hidden="true" /></Link>
                <Link className="arrow-link" href="/how-it-works#does-and-doesnt">What we check <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </p>
            </div>
          </div>
        </section>

        <section className="gallery" aria-labelledby="gallery-title">
          <div className="wrap">
            <div className="gallery-head">
              <div>
                <h2 id="gallery-title" className="v-title">Cleaning services</h2>
                <p>Choose the kind of cleaning your home needs, then describe the job in a free request.</p>
              </div>
              <Link className="btn-line" href="/services">View all services</Link>
            </div>
            <nav className="gallery-groups" aria-label="Browse services by need">
              <span>Browse by need</span>
              {SERVICE_GROUP_ORDER.map(group => <Link key={group} href={`/services#${groupAnchor(group)}`}>{group}</Link>)}
            </nav>
            <ul className="gallery-grid">
              {gallery.map(service => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`}>
                    <Image src={`/images/site/${service.image}-800.jpg`} alt="" fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px" />
                    <span>{service.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="gold-band" aria-labelledby="ready-title">
          <div className="wrap gold-grid">
            <div>
              <h2 id="ready-title">Ready to find your next cleaner?</h2>
              <p>Verliks is starting in Connecticut, and availability depends on your ZIP code. <Link href="/service-areas">See service areas</Link></p>
            </div>
            <ZipSearch id="closing-zip" tone="gold" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
