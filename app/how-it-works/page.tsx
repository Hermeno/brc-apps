import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, X } from 'lucide-react';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import PhotoHero from '@/components/site/photo-hero';
import '../site.css';
import styles from '../informational.module.css';

export const metadata: Metadata = {
  title: 'How Verliks Works | Find a Cleaner Near You',
  description:
    'Describe your cleaning job for free, review an estimated range, talk with an independent cleaner, and decide before anything is booked. Verliks is starting in Connecticut.',
  alternates: { canonical: '/how-it-works' },
};

const steps = [
  {
    number: '01',
    title: 'Tell us what needs cleaning',
    body: 'Choose a service, add the address and preferred time, and describe anything the cleaner should know. Sending a request is free.',
  },
  {
    number: '02',
    title: 'See a starting estimate',
    body: 'The details you enter produce an estimated range. It is a guide, not a fixed quote; you and the cleaner settle the final scope and price together.',
  },
  {
    number: '03',
    title: 'A nearby professional responds',
    body: 'Your request goes to independent cleaners whose service area includes your ZIP and who offer that kind of work. A cleaner who is available can start a conversation.',
  },
  {
    number: '04',
    title: 'You decide who to hire',
    body: 'Review the professional’s profile and rating, ask questions, and agree on the work, timing and price. You can accept or decline before a job is confirmed.',
  },
  {
    number: '05',
    title: 'Pay the cleaner directly',
    body: 'The cleaning payment stays between you and the independent professional, on the terms you agree. Verliks does not collect the job payment.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className={`vsite ${styles.page}`}>
      <a className={styles.skipLink} href="#main">Skip to main content</a>
      <SiteHeader overlay />
      <main id="main" tabIndex={-1} data-inert-when-menu>
        <PhotoHero id="how-title" crumb="How it works"
          image="/process-bg.jpg" alt="A bright, tidy living room and kitchen"
          kicker="The Verliks process"
          title={<><span>A cleaner you choose.</span> <span>A plan you understand.</span></>}
          lede="Tell us what your space needs, then speak with an independent cleaner near you. You decide on the work and the price before you say yes.">
          <div className="hero-actions">
            <Link className="btn-solid" href="/request">Start a free request</Link>
            <Link className="btn-line" href="/services">Explore services</Link>
          </div>
          <p className="hero-note">Starting in Connecticut · Availability depends on your ZIP code</p>
        </PhotoHero>

        <section className={styles.section} aria-labelledby="steps-title">
          <div className="wrap">
            <div className={styles.sectionHead}>
              <p className="kicker">How it unfolds</p>
              <h2 id="steps-title" className="v-title">Five steps. Your decision at every turn.</h2>
              <p className={styles.sectionIntro}>The request starts the conversation. A booking happens only after you choose the cleaner and confirm the details.</p>
            </div>
            <ol className={styles.stepList}>
              {steps.map((step) => (
                <li className={styles.step} key={step.number}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.navySection} on-dark`} id="does-and-doesnt" aria-labelledby="checks-title">
          <div className={`wrap ${styles.trustGrid}`}>
            <div className={styles.trustVisual}>
              <Image
                src="/images/site/trust-cleaner-portrait-1200.jpg"
                alt="A person in overalls holding a bucket in a kitchen"
                width={1200}
                height={1800}
                sizes="(max-width: 800px) 100vw, 35vw"
                className={styles.trustImage}
              />
            </div>
            <div className={styles.trustCopy}>
              <p className="kicker">Know who you are inviting in</p>
              <h2 id="checks-title" className="v-title">What we check.<br />What we leave to you.</h2>
              <p className={styles.trustIntro}>Clear information matters when the work happens in your home. Here is how Verliks approaches trust.</p>
              <div className={styles.trustGroup}>
                <h3>Verliks checks</h3>
                <ul>
                  <li><Check aria-hidden="true" size={18} /><span>A government ID and selfie are reviewed by our team before a cleaner receives requests.</span></li>
                  <li><Check aria-hidden="true" size={18} /><span>Matching uses the professional’s offered services and service area.</span></li>
                  <li><Check aria-hidden="true" size={18} /><span>Ratings from completed jobs appear on professional profiles.</span></li>
                </ul>
              </div>
              <div className={styles.trustGroup}>
                <h3>Verliks does not</h3>
                <ul>
                  <li><X aria-hidden="true" size={18} /><span>Run criminal background checks. Identity review is not a criminal record check.</span></li>
                  <li><X aria-hidden="true" size={18} /><span>Employ the professionals or set the price of their work.</span></li>
                  <li><X aria-hidden="true" size={18} /><span>Hold or take a percentage of the cleaning payment.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="money-title">
          <div className={`wrap ${styles.moneyGrid}`}>
            <div>
              <p className="kicker">The money, plainly</p>
              <h2 id="money-title" className="v-title">A free request. A price you agree on.</h2>
            </div>
            <div className={styles.moneyCopy}>
              <p>There is no charge to send a request or to decline a cleaner. You see an estimated price range, then discuss the final amount with the professional before confirming.</p>
              <p>The professional pays Verliks a fee for the lead only if you confirm them. Your payment for the cleaning goes directly to the professional.</p>
              <Link className={styles.textLink} href="/for-cleaners">How it works for professionals <ArrowUpRight aria-hidden="true" size={17} /></Link>
            </div>
          </div>
        </section>

        <section className="gold-band" aria-labelledby="how-cta-title">
          <div className="wrap gold-grid">
            <div>
              <p className="kicker">Ready when you are</p>
              <h2 id="how-cta-title">Tell us what needs doing.</h2>
              <p>Start with the space, the service and your ZIP code. You can decide on a cleaner after the conversation.</p>
            </div>
            <div className="gold-actions">
              <Link className="btn-ink" href="/request">Find a cleaner</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
