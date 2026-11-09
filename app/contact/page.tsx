import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleArrowRight, Mail } from 'lucide-react';
import PublicPage from '@/components/site/public-page';
import { PageHero } from '@/components/site/photo-hero';

export const metadata: Metadata = {
  title: 'Contact Verliks',
  description:
    'Questions about cleaning requests, service areas or a Verliks account? Reach the Verliks team at support@verliks.com.',
  alternates: { canonical: '/contact' },
};

const paths = [
  { href: '/request', title: 'Need a cleaner?', body: 'Describe the work and start a free request.' },
  { href: '/for-cleaners', title: 'Work as a cleaner?', body: 'See how local requests and fees work.' },
  { href: '/auth/login', title: 'Already have an account?', body: 'Sign in to review requests, messages or your profile.' },
];

/* The contacts band is left out here: this page already is the contact. */
export default function ContactPage() {
  return (
    <PublicPage contacts={false}>
      <PageHero id="contact-title" crumbs={[{ label: 'Contact' }]} position="50% 45%"
        image="/images/site/commercial-hallway-cart-1600.jpg" alt="A cleaning cart in a hallway"
        kicker="We are here to help"
        title="Every good clean starts with a clear answer."
        lede="Have a question about a request, your area or how Verliks works? Write to the team and include the details that will help us understand it.">
        <div className="hero-actions">
          <a className="btn btn-primary" href="mailto:support@verliks.com"><Mail size={18} aria-hidden="true" /> support@verliks.com</a>
        </div>
      </PageHero>

      <section className="band" aria-labelledby="contact-path-title">
        <div className="wrap">
          <div className="band-head">
            <p className="t-label">Find your next step</p>
            <h2 id="contact-path-title" className="t-display">The right place for your question.</h2>
            <p className="t-lead">These paths take you straight to the part of Verliks you need.</p>
          </div>
          <ul className="cols-3 plain-list">
            {paths.map(path => (
              <li key={path.href}>
                <h3 className="t-item">{path.title}</h3>
                <p className="col-text">{path.body}</p>
                <Link className="more-link col-more" href={path.href}>
                  Continue<span className="sr-only">: {path.title}</span>
                  <CircleArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-warm band-rule" aria-labelledby="contact-detail-title">
        <div className="wrap split">
          <div>
            <p className="t-label">When you write</p>
            <h2 id="contact-detail-title" className="t-display">A little context helps us help you.</h2>
          </div>
          <div className="prose">
            <p>For service area questions, include the ZIP code. For an existing request, include its reference and the email on your account. For a service question, tell us what kind of cleaning you need.</p>
            <p><a className="btn btn-primary" href="mailto:support@verliks.com">Email the Verliks team</a></p>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
