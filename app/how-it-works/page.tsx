import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import PublicPage from '@/components/site/public-page';
import { PageHero } from '@/components/site/photo-hero';

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
    <PublicPage>
      <PageHero id="how-title" crumbs={[{ label: 'How it works' }]} position="50% 30%"
        image="/images/site/how-it-works-phone-kitchen-1600.jpg" alt="A woman using her phone in a kitchen"
        kicker="The Verliks process"
        title={<>A cleaner you choose.<br />A plan you understand.</>}
        lede="Tell us what your space needs, then speak with an independent cleaner near you. You decide on the work and the price before you say yes.">
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/request">Start a free request</Link>
          <Link className="btn btn-ghost" href="/services">Explore services</Link>
        </div>
        <p className="hero-note">Starting in Connecticut · Availability depends on your ZIP code</p>
      </PageHero>

      <section className="band" aria-labelledby="steps-title">
        <div className="wrap">
          <div className="band-head">
            <p className="t-label">How it unfolds</p>
            <h2 id="steps-title" className="t-display">Five steps. Your decision at every turn.</h2>
            <p className="t-lead">The request starts the conversation. A booking happens only after you choose the cleaner and confirm the details.</p>
          </div>
          <ol className="steps">
            {steps.map(step => (
              <li key={step.number}>
                <h3 className="t-item">{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-warm band-rule" id="does-and-doesnt" aria-labelledby="checks-title">
        <div className="wrap split">
          <div className="figure">
            <Image src="/images/site/trust-cleaner-portrait-1200.jpg" alt="A person in overalls holding a bucket in a kitchen"
              fill sizes="(max-width: 860px) 100vw, 45vw" style={{ objectPosition: '50% 30%' }} />
          </div>
          <div>
            <p className="t-label">Know who you are inviting in</p>
            <h2 id="checks-title" className="t-display">What we check.<br />What we leave to you.</h2>
            <p className="t-lead mt-2">Clear information matters when the work happens in your home. Here is how Verliks approaches trust.</p>
            <h3 className="t-col mt-3">Verliks checks</h3>
            <ul className="checks">
              <li><Check size={18} aria-hidden="true" /><span>A government ID and selfie are reviewed by our team before a cleaner receives requests.</span></li>
              <li><Check size={18} aria-hidden="true" /><span>Matching uses the professional’s offered services and service area.</span></li>
              <li><Check size={18} aria-hidden="true" /><span>Ratings from completed jobs appear on professional profiles.</span></li>
            </ul>
            <h3 className="t-col mt-3">Verliks does not</h3>
            <ul className="checks">
              <li className="no"><X size={18} aria-hidden="true" /><span>Run criminal background checks. Identity review is not a criminal record check.</span></li>
              <li className="no"><X size={18} aria-hidden="true" /><span>Employ the professionals or set the price of their work.</span></li>
              <li className="no"><X size={18} aria-hidden="true" /><span>Hold or take a percentage of the cleaning payment.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="band band-rule" aria-labelledby="money-title">
        <div className="wrap split">
          <div>
            <p className="t-label">The money, plainly</p>
            <h2 id="money-title" className="t-display">A free request. A price you agree on.</h2>
          </div>
          <div className="prose">
            <p>There is no charge to send a request or to decline a cleaner. You see an estimated price range, then discuss the final amount with the professional before confirming.</p>
            <p>The professional pays Verliks a fee for the lead only if you confirm them. Your payment for the cleaning goes directly to the professional.</p>
            <p><Link className="text-link" href="/for-cleaners">How it works for professionals</Link></p>
          </div>
        </div>
      </section>

      <section className="intro-band band-rule" aria-labelledby="how-cta-title">
        <div className="wrap intro-band-inner">
          <div>
            <p className="t-label">Ready when you are</p>
            <h2 id="how-cta-title" className="t-display">Tell us what needs doing.</h2>
            <p className="t-lead">Start with the space, the service and your ZIP code. You can decide on a cleaner after the conversation.</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/request">Find a cleaner</Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
