import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import '../site.css';
import styles from '../informational.module.css';

export const metadata: Metadata = {
  title: 'Service Areas | Cleaning Requests by ZIP Code',
  description:
    'Verliks is starting in Connecticut. Cleaning requests are matched by ZIP code, service and professional availability, so coverage varies by location.',
  alternates: { canonical: '/service-areas' },
};

export default function ServiceAreasPage() {
  return (
    <div className={`vsite ${styles.page}`}>
      <a className={styles.skipLink} href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1} data-inert-when-menu>
        <section className={`${styles.hero} ${styles.areaHero}`} aria-labelledby="areas-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Service areas</span>
              </nav>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> Local by design</p>
              <h1 id="areas-title" className={styles.heroTitle}>A good clean starts <em>close to home.</em></h1>
              <p className={styles.heroLead}>Verliks is starting in Connecticut. Requests are matched by ZIP code, so availability depends on which independent professionals serve your area and offer the work you need.</p>
              <div className={styles.heroActions}>
                <Link className={styles.buttonPrimary} href="/request">Start a free request <ArrowRight aria-hidden="true" size={18} /></Link>
                <a className={styles.textLink} href="#coverage">How coverage works <ArrowUpRight aria-hidden="true" size={17} /></a>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <Image
                src="/images/site/areas-connecticut-colonial-1600.jpg"
                alt="A white colonial-style building beneath autumn trees"
                width={1600}
                height={1280}
                priority
                sizes="(max-width: 800px) 100vw, 47vw"
                className={`${styles.heroImage} ${styles.areaImage}`}
              />
              <div className={styles.visualCaption}><span>CONNECTICUT</span><span>Launch area</span></div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="coverage" aria-labelledby="coverage-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> How coverage works</p>
              <h2 id="coverage-title" className={styles.sectionTitle}>Your ZIP starts the search.</h2>
              <p className={styles.sectionIntro}>There is no fixed list of covered towns. Each professional chooses a base ZIP, a travel radius and the services they take on.</p>
            </div>
            <div className={styles.coverageGrid}>
              <div className={styles.coverageItem}>
                <span className={styles.coverageNumber}>01</span>
                <MapPin aria-hidden="true" size={23} strokeWidth={1.7} />
                <h3>Tell us where</h3>
                <p>Enter the address in your request. Its ZIP code places the job within the local matching area.</p>
              </div>
              <div className={styles.coverageItem}>
                <span className={styles.coverageNumber}>02</span>
                <span className={styles.coverageGlyph} aria-hidden="true">↗</span>
                <h3>We look for a fit</h3>
                <p>The request reaches eligible, available cleaners whose radius includes that location and who offer your selected service.</p>
              </div>
              <div className={styles.coverageItem}>
                <span className={styles.coverageNumber}>03</span>
                <span className={styles.coverageGlyph} aria-hidden="true">✓</span>
                <h3>You hear from a cleaner</h3>
                <p>When a professional responds, you can discuss the job and decide whether to accept. Response time varies with local availability.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.navySection} aria-labelledby="area-note-title">
          <div className={`${styles.container} ${styles.areaNoteGrid}`}>
            <div>
              <p className={`${styles.eyebrow} ${styles.eyebrowOnDark}`}><span className={styles.eyebrowLine} /> Starting in Connecticut</p>
              <h2 id="area-note-title" className={`${styles.sectionTitle} ${styles.titleOnDark}`}>A nearby ZIP may have a different answer.</h2>
            </div>
            <div className={styles.areaNoteCopy}>
              <p>Coverage is tied to each cleaner’s chosen travel radius, services and current availability. A request in one ZIP may find a match while the next ZIP has none.</p>
              <p>If no one matches, you can see the request status in your account. Sending the request does not book or charge you for a cleaning.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="areas-faq-title">
          <div className={`${styles.container} ${styles.faqGrid}`}>
            <div>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> Questions about location</p>
              <h2 id="areas-faq-title" className={styles.sectionTitle}>What to know before you request.</h2>
            </div>
            <div className={styles.faqList}>
              <details>
                <summary>Is every Connecticut town covered?</summary>
                <p>Not necessarily. Availability changes with the independent cleaners active near a ZIP code and the service you choose.</p>
              </details>
              <details>
                <summary>Can I request cleaning outside Connecticut?</summary>
                <p>Connecticut is our starting area. Coverage elsewhere is not guaranteed. Enter your location in a request to see whether a nearby professional can respond.</p>
              </details>
              <details>
                <summary>Does a matching ZIP mean a job is booked?</summary>
                <p>No. A cleaner must respond, and you must agree on the scope, timing and price before confirming them.</p>
              </details>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection} aria-labelledby="areas-cta-title">
          <div className={`${styles.container} ${styles.ctaGrid}`}>
            <div>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> Begin with your address</p>
              <h2 id="areas-cta-title" className={styles.sectionTitle}>Tell us where the clean is.</h2>
              <p>Give the job details and ZIP code. The request is free, and you decide whether to accept a professional.</p>
            </div>
            <Link className={styles.buttonPrimary} href="/request">Find a cleaner <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
