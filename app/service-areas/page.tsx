import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, MessagesSquare, Radar } from 'lucide-react';
import PublicPage from '@/components/site/public-page';
import { PageHero } from '@/components/site/photo-hero';
import ZipSearch from '@/components/site/zip-search';

export const metadata: Metadata = {
  title: 'Service Areas | Cleaning Requests by ZIP Code',
  description:
    'Verliks is starting in Connecticut. Cleaning requests are matched by ZIP code, service and professional availability, so coverage varies by location.',
  alternates: { canonical: '/service-areas' },
};

export default function ServiceAreasPage() {
  return (
    <PublicPage>
      <PageHero id="areas-title" crumbs={[{ label: 'Service areas' }]} position="50% 40%"
        image="/images/site/areas-connecticut-colonial-1600.jpg" alt="A white colonial-style building beneath autumn trees"
        kicker="Local by design"
        title="A good clean starts close to home."
        lede="Verliks is starting in Connecticut. Requests are matched by ZIP code, so availability depends on which independent professionals serve your area and offer the work you need.">
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/request">Start a free request</Link>
          <a className="btn btn-ghost" href="#coverage">How coverage works</a>
        </div>
      </PageHero>

      <section className="band" id="coverage" aria-labelledby="coverage-title">
        <div className="wrap">
          <div className="band-head">
            <p className="t-label">How coverage works</p>
            <h2 id="coverage-title" className="t-display">Your ZIP starts the search.</h2>
            <p className="t-lead">There is no fixed list of covered towns. Each professional chooses a base ZIP, a travel radius and the services they take on.</p>
          </div>
          <ol className="cols-3 plain-list">
            <li>
              <div className="col-head"><MapPin size={32} strokeWidth={1.75} aria-hidden="true" /><h3 className="t-item">Tell us where</h3></div>
              <p className="col-text">Enter the address in your request. Its ZIP code places the job within the local matching area.</p>
            </li>
            <li>
              <div className="col-head"><Radar size={32} strokeWidth={1.75} aria-hidden="true" /><h3 className="t-item">We look for a fit</h3></div>
              <p className="col-text">The request reaches eligible, available cleaners whose radius includes that location and who offer your selected service.</p>
            </li>
            <li>
              <div className="col-head"><MessagesSquare size={32} strokeWidth={1.75} aria-hidden="true" /><h3 className="t-item">You hear from a cleaner</h3></div>
              <p className="col-text">When a professional responds, you can discuss the job and decide whether to accept. Response time varies with local availability.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="band band-warm band-rule" aria-labelledby="area-note-title">
        <div className="wrap split">
          <div>
            <p className="t-label">Starting in Connecticut</p>
            <h2 id="area-note-title" className="t-display">A nearby ZIP may have a different answer.</h2>
          </div>
          <div className="prose">
            <p>Coverage is tied to each cleaner’s chosen travel radius, services and current availability. A request in one ZIP may find a match while the next ZIP has none.</p>
            <p>If no one matches, you can see the request status in your account. Sending the request does not book or charge you for a cleaning.</p>
          </div>
        </div>
      </section>

      <section className="band band-rule" aria-labelledby="areas-faq-title">
        <div className="wrap split">
          <div>
            <p className="t-label">Questions about location</p>
            <h2 id="areas-faq-title" className="t-display">What to know before you request.</h2>
          </div>
          <div className="faq">
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

      <section className="intro-band band-rule" aria-labelledby="areas-cta-title">
        <div className="wrap intro-band-inner">
          <div>
            <p className="t-label">Begin with your address</p>
            <h2 id="areas-cta-title" className="t-display">Tell us where the clean is.</h2>
            <p className="t-lead">Give the job details and ZIP code. The request is free, and you decide whether to accept a professional.</p>
          </div>
          <ZipSearch id="areas-zip" tone="light" />
        </div>
      </section>
    </PublicPage>
  );
}
