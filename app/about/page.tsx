import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import PublicPage from '@/components/site/public-page';
import { PageHero } from '@/components/site/photo-hero';

export const metadata: Metadata = {
  title: 'About Verliks | Cleaning Connections Built Around People',
  description: 'Verliks connects households with independent cleaning professionals. Learn how requests, identity review, direct payment and local matching work.',
  alternates: { canonical: '/about' },
};

const principles = [
  {
    title: 'A clear beginning',
    body: 'Describe the space, choose a service and see a starting estimate. Your request is free, and you can discuss the final scope and price before accepting a cleaner.',
  },
  {
    title: 'Room to choose',
    body: 'The professionals on Verliks work independently. They choose which requests to take; you decide who feels right for your home and schedule.',
  },
  {
    title: 'The terms stay yours',
    body: 'You pay the cleaner directly under the terms you agree together. Verliks charges the professional a lead fee only when a client confirms them.',
  },
];

export default function AboutPage() {
  return (
    <PublicPage>
      <PageHero id="about-title" crumbs={[{ label: 'About' }]} position="50% 22%"
        image="/images/site/about-cleaner-van-1200.jpg" alt="Independent cleaning professional preparing for a job beside a work vehicle"
        kicker="The people behind the work"
        title="Good cleaning starts with a good connection."
        lede="Verliks is building a simpler way for households and independent cleaning professionals to find each other, talk through the work and agree on what comes next.">
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/request">Find a cleaner</Link>
          <Link className="btn btn-ghost" href="/for-cleaners">For professionals</Link>
        </div>
        <p className="hero-note">Independent work, thoughtfully connected.</p>
      </PageHero>

      <section className="band" aria-labelledby="purpose-title">
        <div className="wrap split">
          <div>
            <p className="t-label">Why we exist</p>
            <h2 id="purpose-title" className="t-display">The person and the plan should both feel right.</h2>
          </div>
          <div className="prose">
            <p>Finding help at home is personal. So is building an independent cleaning business. We give both sides a clearer starting point: a useful request, a conversation and a choice made with the details in hand.</p>
          </div>
        </div>
      </section>

      <section className="band band-warm band-rule" aria-labelledby="principles-title">
        <div className="wrap">
          <div className="band-head">
            <p className="t-label">What guides us</p>
            <h2 id="principles-title" className="t-display">A more considered way to connect.</h2>
          </div>
          <ol className="cols-3 plain-list">
            {principles.map(item => (
              <li key={item.title}>
                <h3 className="t-col">{item.title}</h3>
                <p className="col-text">{item.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-3"><Link href="/how-it-works" className="text-link">See how it works</Link></div>
        </div>
      </section>

      <section className="band band-rule" aria-labelledby="trust-title">
        <div className="wrap split">
          <div className="figure">
            <Image src="/images/site/trust-cleaner-portrait-1200.jpg" alt="Portrait of a cleaning professional inside a home"
              fill sizes="(max-width: 860px) 100vw, 45vw" style={{ objectPosition: '50% 30%' }} />
          </div>
          <div>
            <p className="t-label">Trust, explained</p>
            <h2 id="trust-title" className="t-display">Know what Verliks checks.</h2>
            <p className="t-lead mt-2">Before a cleaner can receive requests, our team reviews a government ID and selfie. Matching also takes into account the services and area the professional chooses to cover.</p>
            <ul className="checks mt-2">
              <li><Check size={18} aria-hidden="true" /><span>Identity reviewed by our team</span></li>
              <li><Check size={18} aria-hidden="true" /><span>Service and ZIP code matching</span></li>
              <li><Check size={18} aria-hidden="true" /><span>A conversation before you decide</span></li>
            </ul>
            <p className="t-lead mt-2">Identity review is not a criminal background check.</p>
            <p className="mt-2"><Link href="/how-it-works#does-and-doesnt" className="text-link">Read about our approach</Link></p>
          </div>
        </div>
      </section>

      <section className="band band-mist" aria-labelledby="coverage-title">
        <div className="wrap split">
          <div>
            <p className="t-label">Local, from the start</p>
            <h2 id="coverage-title" className="t-display">Starting in Connecticut.<br />Built for more communities.</h2>
          </div>
          <div className="prose">
            <p>Availability depends on the service and ZIP code. We are growing the network of independent professionals across the United States, one local connection at a time.</p>
            <p><Link href="/service-areas" className="text-link">Explore service areas</Link></p>
          </div>
        </div>
      </section>

      <section className="intro-band band-rule" aria-labelledby="about-cta-title">
        <div className="wrap intro-band-inner">
          <div>
            <p className="t-label">The next step is yours</p>
            <h2 id="about-cta-title" className="t-display">Tell us what needs doing.</h2>
          </div>
          <div className="btn-row">
            <Link href="/request" className="btn btn-primary">Start a free request</Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
