import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, X } from 'lucide-react';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
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
      <SiteHeader />
      <main id="main" tabIndex={-1} data-inert-when-menu>
        <section className={styles.hero} aria-labelledby="how-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">How it works</span>
              </nav>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> The Verliks process</p>
              <h1 id="how-title" className={styles.heroTitle}>A cleaner you choose.<br /><em>A plan you understand.</em></h1>
              <p className={styles.heroLead}>Tell us what your space needs, then speak with an independent cleaner near you. You decide on the work and the price before you say yes.</p>
              <div className={styles.heroActions}>
                <Link className={styles.buttonPrimary} href="/request">Start a free request <ArrowRight aria-hidden="true" size={18} /></Link>
                <Link className={styles.textLink} href="/services">Explore services <ArrowUpRight aria-hidden="true" size={17} /></Link>
              </div>
              <p className={styles.heroNote}>Starting in Connecticut · Availability depends on your ZIP code</p>
            </div>
            <div className={styles.heroVisual}>
              <Image
                src="/images/site/how-it-works-phone-kitchen-1600.jpg"
                alt="A woman using her phone in a kitchen"
                width={1600}
                height={1067}
                priority
                sizes="(max-width: 800px) 100vw, 47vw"
                className={styles.heroImage}
              />
              <div className={styles.visualCaption}><span>From request to a clear agreement</span></div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="steps-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> How it unfolds</p>
              <h2 id="steps-title" className={styles.sectionTitle}>Five steps. Your decision at every turn.</h2>
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

        <section className={styles.navySection} id="does-and-doesnt" aria-labelledby="checks-title">
          <div className={`${styles.container} ${styles.trustGrid}`}>
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
              <p className={`${styles.eyebrow} ${styles.eyebrowOnDark}`}><span className={styles.eyebrowLine} /> Know who you are inviting in</p>
              <h2 id="checks-title" className={`${styles.sectionTitle} ${styles.titleOnDark}`}>What we check.<br />What we leave to you.</h2>
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
          <div className={`${styles.container} ${styles.moneyGrid}`}>
            <div>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> The money, plainly</p>
              <h2 id="money-title" className={styles.sectionTitle}>A free request. A price you agree on.</h2>
            </div>
            <div className={styles.moneyCopy}>
              <p>There is no charge to send a request or to decline a cleaner. You see an estimated price range, then discuss the final amount with the professional before confirming.</p>
              <p>The professional pays Verliks a fee for the lead only if you confirm them. Your payment for the cleaning goes directly to the professional.</p>
              <Link className={styles.textLink} href="/for-cleaners">How it works for professionals <ArrowUpRight aria-hidden="true" size={17} /></Link>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection} aria-labelledby="how-cta-title">
          <div className={`${styles.container} ${styles.ctaGrid}`}>
            <div>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> Ready when you are</p>
              <h2 id="how-cta-title" className={styles.sectionTitle}>Tell us what needs doing.</h2>
              <p>Start with the space, the service and your ZIP code. You can decide on a cleaner after the conversation.</p>
            </div>
            <Link className={styles.buttonPrimary} href="/request">Find a cleaner <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
