import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../site.css';
import styles from '../services.module.css';
import { SERVICES, getService, REQUEST_EXTRAS, type Service } from '@/lib/services';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import { Icon, IconSprite } from '@/components/site/icons';

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
    title: 'Describe the job',
    body: 'Add your ZIP code, property details, preferred day and anything specific. Sending a request costs nothing.',
  },
  {
    title: 'Discuss the details',
    body: 'A cleaner who offers this service and covers your ZIP can reply. Use the conversation to agree on the scope, timing and price.',
  },
  {
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

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getPageService(slug);
  if (!service) notFound();

  const related = service.related.map(getPageService).filter((item): item is Service => Boolean(item));
  const requestUrl = `/request?service=${service.id}`;
  const heroImage = slug === recurring.slug
    ? '/images/site/recurring-cleaning-bedroom-1200.jpg'
    : `/images/services/${service.slug}.jpg`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE}/services/${service.slug}`,
        name: service.name,
        serviceType: service.name,
        description: service.whatIsIt,
        areaServed: { '@type': 'Country', name: 'United States' },
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
    <div className={`vsite ${styles.page}`}>
      <IconSprite />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>Skip to main content</a>
      <SiteHeader />

      <main id="main" data-inert-when-menu>
        <section className={styles.detailHero} aria-labelledby="service-title">
          <div className={styles.container}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/services">Services</Link><span aria-hidden="true">/</span>
              <span aria-current="page">{service.name}</span>
            </nav>
            <div className={styles.detailHeroGrid}>
              <div className={styles.detailHeroCopy}>
                <p className={styles.eyebrow}>Cleaning services / {service.name}</p>
                <h1 id="service-title" className={styles.detailTitle}>{service.name}</h1>
                <p className={styles.heroLead}>{service.tagline}</p>
                <div className={styles.actions}>
                  <Link className={styles.primaryButton} href={requestUrl}>Request this service <Icon name="arrow-right" /></Link>
                  <Link className={styles.secondaryLink} href="/services">All services <Icon name="arrow-right" /></Link>
                </div>
                <p className={styles.heroNote}>Free to send a request. Discuss scope and price before deciding.</p>
              </div>
              <figure className={styles.detailHeroMedia}>
                <Image src={heroImage} alt="" fill priority sizes="(max-width: 800px) 100vw, 46vw" />
              </figure>
            </div>
          </div>
        </section>

        <div className={styles.factBar} aria-label="How Verliks works">
          <div className={styles.container}>
            <span>01 <strong>Describe the work</strong></span>
            <span>02 <strong>Discuss with a cleaner</strong></span>
            <span>03 <strong>Decide before booking</strong></span>
          </div>
        </div>

        <div className={styles.detailContent}>
          <div className={styles.container}>
            <div className={styles.articleGrid}>
              <aside className={styles.articleAside} aria-label="On this page">
                <p className={styles.eyebrow}>On this page</p>
                <nav>
                  <a href="#overview">Overview</a>
                  <a href="#included">Typical scope</a>
                  <a href="#when-to-book">When it fits</a>
                  <a href="#before-request">Before you request</a>
                  <a href="#questions">Questions</a>
                </nav>
                <Link className={styles.asideCta} href={requestUrl}>Start a request <Icon name="arrow-right" /></Link>
              </aside>

              <article className={styles.article}>
                <section id="overview" className={styles.articleSection} aria-labelledby="overview-title">
                  <p className={styles.sectionKicker}>01 / The service</p>
                  <h2 id="overview-title">What it is</h2>
                  <p className={styles.introProse}>{service.whatIsIt}</p>
                </section>

                <section id="included" className={styles.articleSection} aria-labelledby="included-title">
                  <p className={styles.sectionKicker}>02 / The work</p>
                  <h2 id="included-title">What is usually included</h2>
                  <p className={styles.sectionIntro}>The exact scope is agreed with the cleaner. Use this list as a starting point and put anything unusual in your request notes.</p>
                  <ul className={styles.includedList}>
                    {service.included.map(item => <li key={item}>{item}</li>)}
                  </ul>
                  {service.showExtras && (
                    <p className={styles.extrasNote}><strong>Optional work in the request form:</strong> {REQUEST_EXTRAS.map(extra => extra.label).join(', ')}. Confirm any extras with the cleaner.</p>
                  )}
                </section>

                <section id="when-to-book" className={styles.articleSection} aria-labelledby="when-title">
                  <p className={styles.sectionKicker}>03 / The moment</p>
                  <h2 id="when-title">When this service fits</h2>
                  <ul className={styles.situationsList}>
                    {service.rightForYou.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}
                  </ul>
                </section>

                <section id="before-request" className={styles.prepSection} aria-labelledby="prep-title">
                  <p className={styles.sectionKicker}>04 / Prepare your request</p>
                  <h2 id="prep-title">Worth having ready</h2>
                  <p>{service.beforeYouRequest}</p>
                  <Link href={requestUrl} className={styles.inlineCta}>Request {service.name} <Icon name="arrow-right" /></Link>
                </section>
              </article>
            </div>
          </div>
        </div>

        <section className={styles.processSection} aria-labelledby="process-title">
          <div className={styles.container}>
            <div className={styles.processHeading}>
              <p className={styles.sectionKicker}>From request to decision</p>
              <h2 id="process-title">How it works</h2>
              <p>You stay in control of whom you hire and the price you agree to.</p>
            </div>
            <ol className={styles.processList}>
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className={styles.stepNumber}>0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="questions" className={styles.faqSection} aria-labelledby="faq-title">
          <div className={styles.container}>
            <div className={styles.faqGrid}>
              <div className={styles.faqHeading}>
                <p className={styles.sectionKicker}>Good to know</p>
                <h2 id="faq-title">Questions about {service.name.toLowerCase()}</h2>
                <p>Ask the cleaner about anything specific to your property before you accept.</p>
              </div>
              <div className={styles.faqList}>
                {[...service.faq, ...SHARED_FAQ].map(item => (
                  <details key={item.q}>
                    <summary>{item.q}<span className={styles.faqPlus} aria-hidden="true">+</span></summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className={styles.relatedSection} aria-labelledby="related-title">
            <div className={styles.container}>
              <div className={styles.relatedHeading}>
                <div>
                  <p className={styles.sectionKicker}>Keep exploring</p>
                  <h2 id="related-title">Related services</h2>
                </div>
                <Link href="/services" className={styles.secondaryLink}>View all services <Icon name="arrow-right" /></Link>
              </div>
              <div className={styles.relatedGrid}>
                {related.map(item => (
                  <Link key={item.slug} href={`/services/${item.slug}`} className={styles.relatedCard}>
                    <span className={styles.relatedImage}>
                      <Image src={item.slug === recurring.slug ? '/images/site/recurring-cleaning-bedroom-1200.jpg' : `/images/services/${item.slug}.jpg`} alt="" fill sizes="(max-width: 700px) 100vw, 30vw" />
                    </span>
                    <span className={styles.relatedText}><strong>{item.name}</strong><Icon name="arrow-up-right" /></span>
                    <span className={styles.relatedTagline}>{item.tagline}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={styles.guidance} aria-labelledby="request-title">
          <div className={styles.container}>
            <p className={styles.eyebrow}>Ready when you are</p>
            <div className={styles.guidanceGrid}>
              <div>
                <h2 id="request-title">Tell a cleaner what you need.</h2>
                <p>The request opens with {service.name.toLowerCase()} selected. Sending it costs nothing, and you can discuss the price before deciding.</p>
              </div>
              <Link className={styles.goldButton} href={requestUrl}>Request {service.name} <Icon name="arrow-right" /></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
