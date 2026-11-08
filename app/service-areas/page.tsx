import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, MessagesSquare, Radar } from 'lucide-react';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import PhotoHero from '@/components/site/photo-hero';
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
      <SiteHeader overlay />
      <main id="main" tabIndex={-1} data-inert-when-menu>
        <PhotoHero id="areas-title" crumb="Service areas" position="50% 40%"
          image="/images/site/areas-connecticut-colonial-1600.jpg"
          alt="A white colonial-style building beneath autumn trees"
          kicker="Local by design"
          title={<><span>A good clean starts</span> <span>close to home.</span></>}
          lede="Verliks is starting in Connecticut. Requests are matched by ZIP code, so availability depends on which independent professionals serve your area and offer the work you need.">
          <div className="hero-actions">
            <Link className="btn-solid" href="/request">Start a free request</Link>
            <a className="btn-line" href="#coverage">How coverage works</a>
          </div>
        </PhotoHero>

        <section className="feature-band" id="coverage" aria-labelledby="coverage-title">
          <div className="wrap">
            <div className="feature-head">
              <p className="kicker">How coverage works</p>
              <h2 id="coverage-title" className="v-title">Your ZIP starts the search.</h2>
              <p>There is no fixed list of covered towns. Each professional chooses a base ZIP, a travel radius and the services they take on.</p>
            </div>
            <ol className="feature-list">
              <li>
                <MapPin className="feature-icon" size={64} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                <div><h3>Tell us where</h3><p>Enter the address in your request. Its ZIP code places the job within the local matching area.</p></div>
              </li>
              <li>
                <Radar className="feature-icon" size={64} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                <div><h3>We look for a fit</h3><p>The request reaches eligible, available cleaners whose radius includes that location and who offer your selected service.</p></div>
              </li>
              <li>
                <MessagesSquare className="feature-icon" size={64} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                <div><h3>You hear from a cleaner</h3><p>When a professional responds, you can discuss the job and decide whether to accept. Response time varies with local availability.</p></div>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="area-note-title">
          <div className={`wrap ${styles.areaNoteGrid}`}>
            <div>
              <p className="kicker">Starting in Connecticut</p>
              <h2 id="area-note-title" className="v-title">A nearby ZIP may have a different answer.</h2>
            </div>
            <div className={styles.areaNoteCopy}>
              <p>Coverage is tied to each cleaner’s chosen travel radius, services and current availability. A request in one ZIP may find a match while the next ZIP has none.</p>
              <p>If no one matches, you can see the request status in your account. Sending the request does not book or charge you for a cleaning.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMist}`} aria-labelledby="areas-faq-title">
          <div className={`wrap ${styles.faqGrid}`}>
            <div>
              <p className="kicker">Questions about location</p>
              <h2 id="areas-faq-title" className="v-title">What to know before you request.</h2>
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

        <section className="gold-band" aria-labelledby="areas-cta-title">
          <div className="wrap gold-grid">
            <div>
              <p className="kicker">Begin with your address</p>
              <h2 id="areas-cta-title">Tell us where the clean is.</h2>
              <p>Give the job details and ZIP code. The request is free, and you decide whether to accept a professional.</p>
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
