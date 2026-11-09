import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleArrowRight, ClipboardList, MessagesSquare, UserCheck } from 'lucide-react';
import { SERVICES, getService, REQUEST_EXTRAS, type Service } from '@/lib/services';
import PublicPage from '@/components/site/public-page';
import { PageHero } from '@/components/site/photo-hero';

const BASE = 'https://verliks.com';

/* The public navigation includes recurring cleaning, while the request form
   records it as standard cleaning with a frequency. Keep that route useful. */
const standard = getService('standard-cleaning')!;
const recurring: Service = {
  ...standard,
  slug: 'recurring-cleaning',
  id: 'standard',
  name: 'Recurring Cleaning',
  tagline: 'Regular upkeep on a schedule that works for your home.',
  metaTitle: 'Recurring House Cleaning',
  metaDescription: 'Arrange regular house cleaning through Verliks. Describe your home and preferred frequency, then agree on the scope and price with an independent cleaner near you.',
  whatIsIt: 'Recurring cleaning is a regular arrangement for standard home cleaning. It focuses on the kitchen, bathrooms, floors and lived-in surfaces, with the schedule and exact tasks agreed between you and the cleaner who replies.',
  rightForYou: [
    'Weekly or biweekly upkeep',
    'A home that is already reasonably maintained',
    'A routine that leaves more time between detailed cleans',
  ],
  beforeYouRequest: 'Have the number of bedrooms and bathrooms, the approximate home size and your preferred days ready. Mention pets, rooms to skip and whether you want to use your own supplies. Discuss the schedule and the tasks with the cleaner before accepting.',
  faq: [
    {
      q: 'Can I choose the frequency?',
      a: 'Yes. Select the frequency in the request form and share your preferred days in the notes. The cleaner confirms what schedule they can offer in the conversation.',
    },
    {
      q: 'Will the same cleaner come every time?',
      a: 'That is something to agree with the independent cleaner who takes your request. Ask about their ongoing availability before you accept.',
    },
  ],
  related: ['standard-cleaning', 'deep-cleaning', 'home-organizing'],
};

function getPageService(slug: string): Service | undefined {
  return slug === recurring.slug ? recurring : getService(slug);
}

export function generateStaticParams() {
  return [...SERVICES.map(service => ({ slug: service.slug })), { slug: recurring.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getPageService(slug);
  if (!service) return {};
  const image = slug === recurring.slug
    ? '/images/site/recurring-cleaning-bedroom-1200.jpg'
    : `/images/services/${service.slug}.jpg`;
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.metaTitle} | Verliks`,
      description: service.metaDescription,
      url: `/services/${service.slug}`,
      siteName: 'Verliks',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: { card: 'summary_large_image', title: `${service.metaTitle} | Verliks`, description: service.metaDescription },
    robots: { index: true, follow: true },
  };
}

const STEPS = [
  {
    Icon: ClipboardList,
    title: 'Describe the job',
    body: 'Add your ZIP code, property details, preferred day and anything specific. Sending a request costs nothing.',
  },
  {
    Icon: MessagesSquare,
    title: 'Discuss the details',
    body: 'A cleaner who offers this service and covers your ZIP can reply. Use the conversation to agree on the scope, timing and price.',
  },
  {
    Icon: UserCheck,
    title: 'Decide who to hire',
    body: 'Review the cleaner’s profile and rating. Accept or decline before anything is booked, then pay the cleaner directly for the work.',
  },
];

const SHARED_FAQ = [
  {
    q: 'How much does this cost?',
    a: 'There is no fixed price. It depends on the property, its condition, the scope, your location and the professional. The cleaner who takes your request discusses the price with you before anything is booked.',
  },
  {
    q: 'Can I ask for a specific cleaner?',
    a: 'Yes. You can send a request straight to a professional whose profile you have seen. If they are not available, the request falls back to cleaners near you.',
  },
  {
    q: 'Does every cleaner offer this service?',
    a: 'No. Each professional lists the types of cleaning they take on. Requests are only matched to cleaners who offer this service and cover your area.',
  },
  {
    q: 'Can I add extra work to the request?',
    a: 'Describe it in the notes when you send the request. The cleaner confirms what they include and whether they can do the extra work.',
  },
];

const imageFor = (slug: string) => slug === recurring.slug
  ? '/images/site/recurring-cleaning-bedroom-1200.jpg'
  : `/images/services/${slug}.jpg`;

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getPageService(slug);
  if (!service) notFound();

  const related = service.related.map(getPageService).filter((item): item is Service => Boolean(item));
  const requestUrl = `/request?service=${service.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE}/services/${service.slug}`,
        name: service.name,
        serviceType: service.name,
        description: service.whatIsIt,
        areaServed: { '@type': 'State', name: 'Connecticut' },
        provider: { '@type': 'Organization', name: 'Verliks', url: BASE },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services` },
          { '@type': 'ListItem', position: 3, name: service.name, item: `${BASE}/services/${service.slug}` },
        ],
      },
    ],
  };

  return (
    <PublicPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero id="service-title" image={imageFor(service.slug)} position="50% 40%"
        crumbs={[{ href: '/services', label: 'Services' }, { label: service.name }]}
        kicker="Cleaning services"
        title={service.name}
        lede={service.tagline}>
        <div className="hero-actions">
          <Link className="btn btn-primary" href={requestUrl}>Request this service</Link>
          <Link className="btn btn-ghost" href="/services">All services</Link>
        </div>
        <p className="hero-note">Free to send a request. Discuss scope and price before deciding.</p>
      </PageHero>

      <nav className="subnav" aria-label="On this page">
        <div className="wrap subnav-inner">
          <span>On this page</span>
          <a href="#overview">Overview</a>
          <a href="#included">Typical scope</a>
          <a href="#when-to-book">When it fits</a>
          <a href="#before-request">Before you request</a>
          <a href="#questions">Questions</a>
        </div>
      </nav>

      <section className="band" aria-labelledby="overview-title">
        <div className="wrap split">
          <div id="overview">
            <p className="t-label">The service</p>
            <h2 id="overview-title" className="t-display">What it is</h2>
            <div className="prose mt-2"><p>{service.whatIsIt}</p></div>
          </div>
          <div id="before-request">
            <h3 className="t-col">Worth having ready</h3>
            <div className="prose mt-1"><p>{service.beforeYouRequest}</p></div>
            <Link className="more-link mt-1" href={requestUrl}>
              Request {service.name} <CircleArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-warm band-rule" aria-label="Scope and fit">
        <div className="wrap split">
          <div id="included">
            <h2 className="t-col">What is usually included</h2>
            <p className="t-lead mt-1">The exact scope is agreed with the cleaner. Use this list as a starting point and put anything unusual in your request notes.</p>
            <ul className="ruled mt-2">{service.included.map(item => <li key={item}>{item}</li>)}</ul>
            {service.showExtras && (
              <p className="t-lead mt-2"><strong>Optional work in the request form:</strong> {REQUEST_EXTRAS.map(extra => extra.label).join(', ')}. Confirm any extras with the cleaner.</p>
            )}
          </div>
          <div id="when-to-book">
            <h2 className="t-col">When this service fits</h2>
            <ul className="ruled mt-2">{service.rightForYou.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="band band-rule" aria-labelledby="process-title">
        <div className="wrap">
          <div className="band-head">
            <p className="t-label">From request to decision</p>
            <h2 id="process-title" className="t-display">How it works</h2>
            <p className="t-lead">You stay in control of whom you hire and the price you agree to.</p>
          </div>
          <ol className="cols-3 plain-list">
            {STEPS.map(({ Icon, title, body }) => (
              <li key={title}>
                <div className="col-head"><Icon size={32} strokeWidth={1.75} aria-hidden="true" /><h3 className="t-item">{title}</h3></div>
                <p className="col-text">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="questions" className="band band-mist" aria-labelledby="faq-title">
        <div className="wrap split">
          <div>
            <p className="t-label">Good to know</p>
            <h2 id="faq-title" className="t-display">Questions about {service.name.toLowerCase()}</h2>
            <p className="t-lead mt-1">Ask the cleaner about anything specific to your property before you accept.</p>
          </div>
          <div className="faq">
            {[...service.faq, ...SHARED_FAQ].map(item => (
              <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="band band-warm" aria-labelledby="related-title">
          <div className="wrap">
            <div className="band-head">
              <p className="t-label">Keep exploring</p>
              <h2 id="related-title" className="t-display">Related services</h2>
            </div>
            <div className="cols-3">
              {related.map(item => (
                <article key={item.slug}>
                  <h3 className="t-item">{item.name}</h3>
                  <Link className="col-photo" href={`/services/${item.slug}`} tabIndex={-1} aria-hidden="true">
                    <Image src={imageFor(item.slug)} alt="" fill sizes="(max-width: 860px) 100vw, 30vw" />
                  </Link>
                  <p className="col-text">{item.tagline}</p>
                  <Link className="more-link col-more" href={`/services/${item.slug}`}>
                    Learn more<span className="sr-only"> about {item.name}</span>
                    <CircleArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="intro-band band-rule" aria-labelledby="request-title">
        <div className="wrap intro-band-inner">
          <div>
            <p className="t-label">Ready when you are</p>
            <h2 id="request-title" className="t-display">Tell a cleaner what you need.</h2>
            <p className="t-lead">The request opens with {service.name.toLowerCase()} selected. Sending it costs nothing, and you can discuss the price before deciding.</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn-dark" href="/services">View all services</Link>
            <Link className="btn btn-primary" href={requestUrl}>Request {service.name}</Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
