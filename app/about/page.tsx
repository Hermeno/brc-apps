import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin } from 'lucide-react';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import '../site.css';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Verliks | Cleaning Connections Built Around People',
  description: 'Verliks connects households with independent cleaning professionals. Learn how requests, identity review, direct payment and local matching work.',
  alternates: { canonical: '/about' },
};

const principles = [
  {
    number: '01',
    title: 'A clear beginning',
    body: 'Describe the space, choose a service and see a starting estimate. Your request is free, and you can discuss the final scope and price before accepting a cleaner.',
  },
  {
    number: '02',
    title: 'Room to choose',
    body: 'The professionals on Verliks work independently. They choose which requests to take; you decide who feels right for your home and schedule.',
  },
  {
    number: '03',
    title: 'The terms stay yours',
    body: 'You pay the cleaner directly under the terms you agree together. Verliks charges the professional a lead fee only when a client confirms them.',
  },
];

export default function AboutPage() {
  return (
    <div className={`vsite ${styles.page}`}>
      <a className="skip-link" href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main" data-inert-when-menu>
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={`wrap ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">About</span>
              </nav>
              <p className="eyebrow eyebrow-rule">THE PEOPLE BEHIND THE WORK</p>
              <h1 id="about-title">Good cleaning starts with a <em>good connection.</em></h1>
              <p>Verliks is building a simpler way for households and independent cleaning professionals to find each other, talk through the work and agree on what comes next.</p>
              <div className={styles.heroActions}>
                <Link className="btn btn-primary" href="/request">Find a cleaner <ArrowRight size={19} aria-hidden="true" /></Link>
                <Link className="text-link" href="/for-cleaners">For professionals <ArrowUpRight size={18} aria-hidden="true" /></Link>
              </div>
            </div>
            <figure className={styles.heroPhoto}>
              <Image src="/images/site/about-cleaner-van-1200.jpg" alt="Independent cleaning professional preparing for a job beside a work vehicle" fill priority sizes="(max-width: 800px) 100vw, 48vw" />
              <figcaption><span>VERLIKS / OUR PURPOSE</span><span>Independent work, thoughtfully connected.</span></figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.statement} aria-labelledby="purpose-title">
          <div className={`wrap ${styles.statementGrid}`}>
            <p className="eyebrow eyebrow-rule">WHY WE EXIST</p>
            <div>
              <h2 id="purpose-title">The person and the plan should both feel right.</h2>
              <p>Finding help at home is personal. So is building an independent cleaning business. We give both sides a clearer starting point: a useful request, a conversation and a choice made with the details in hand.</p>
            </div>
          </div>
        </section>

        <section className={styles.principles} aria-labelledby="principles-title">
          <div className={`wrap ${styles.principlesGrid}`}>
            <div className={styles.principlesIntro}>
              <p className="eyebrow eyebrow-rule">WHAT GUIDES US</p>
              <h2 id="principles-title">A more considered way to connect.</h2>
              <Link href="/how-it-works" className="text-link">See how it works <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
            <ol className={styles.principleList}>
              {principles.map(item => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.trust} aria-labelledby="trust-title">
          <div className={`wrap ${styles.trustGrid}`}>
            <div className={styles.trustPhoto}>
              <Image src="/images/site/trust-cleaner-portrait-1200.jpg" alt="Portrait of a cleaning professional inside a home" fill sizes="(max-width: 800px) 100vw, 40vw" />
            </div>
            <div className={styles.trustCopy}>
              <p className="eyebrow eyebrow-rule">TRUST, EXPLAINED</p>
              <h2 id="trust-title">Know what Verliks checks.</h2>
              <p>Before a cleaner can receive requests, our team reviews a government ID and selfie. Matching also takes into account the services and area the professional chooses to cover.</p>
              <ul>
                <li><Check size={18} aria-hidden="true" /> Identity reviewed by our team</li>
                <li><Check size={18} aria-hidden="true" /> Service and ZIP code matching</li>
                <li><Check size={18} aria-hidden="true" /> A conversation before you decide</li>
              </ul>
              <p className={styles.trustNote}>Identity review is not a criminal background check.</p>
              <Link href="/how-it-works#does-and-doesnt" className="text-link">Read about our approach <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className={styles.coverage} aria-labelledby="coverage-title">
          <div className={`wrap ${styles.coverageGrid}`}>
            <div>
              <p className="eyebrow eyebrow-rule">LOCAL, FROM THE START</p>
              <h2 id="coverage-title">Starting in Connecticut.<br />Built for more communities.</h2>
            </div>
            <div>
              <p>Availability depends on the service and ZIP code. We are growing the network of independent professionals across the United States, one local connection at a time.</p>
              <Link href="/service-areas" className="text-link"><MapPin size={18} aria-hidden="true" /> Explore service areas <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="about-cta-title">
          <div className={`wrap ${styles.ctaInner}`}>
            <div><p className="eyebrow eyebrow-rule">THE NEXT STEP IS YOURS</p><h2 id="about-cta-title">Tell us what needs doing.</h2></div>
            <Link href="/request" className="btn btn-primary">Start a free request <ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
