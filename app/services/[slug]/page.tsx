import type { Metadata } from 'next';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import styles from '../services.module.css';
import { SERVICES, getService, exampleEstimate, REQUEST_EXTRAS } from '@/lib/services';
import { PublicNav, PublicFooter, Arrow, btn } from '@/components/public-chrome';

const BASE = 'https://verliks.com';
const footerServices = SERVICES.slice(0, 5).map(s => ({ slug: s.slug, name: s.name }));

export function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
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
      images: [{ url: '/images/home/living-room.jpg', width: 2560, height: 1706, alt: 'A clean, open living room' }],
    },
    twitter: { card: 'summary_large_image', title: `${service.metaTitle} | Verliks`, description: service.metaDescription },
    robots: { index: true, follow: true },
  };
}

const Chevron = () => (
  <svg className={styles.faqChevron} width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

/* The platform mechanic, identical on every service page because it is the
   same mechanic. Wording checked against the matching and conversation code. */
const WHAT_TO_EXPECT = [
  {
    title: 'You describe the job',
    body: 'Your ZIP code, the property details, the day you want and anything specific. The form shows an estimated range before you send it.',
  },
  {
    title: 'It reaches cleaners near you',
    body: 'Only professionals whose service area covers your ZIP, who offer this type of cleaning, and whose ID has been approved by our team.',
  },
  {
    title: 'One of them replies',
    body: 'The first available cleaner takes the request and a conversation opens, where you can ask about scope, timing and price.',
  },
  {
    title: 'You accept or decline',
    body: 'Look at their profile and rating, then decide. If you decline, the request goes back out to another cleaner automatically.',
  },
  {
    title: 'You pay the cleaner directly',
    body: 'Requesting costs you nothing. The price is what you and the cleaner agree, and it is paid to them, not to Verliks.',
  },
];

const SHARED_FAQ = [
  {
    q: 'How much does this cost?',
    a: 'There is no fixed price. It depends on the property, its condition, the scope, your location and the professional. The request form gives you an estimated range from our calculator, and the cleaner confirms the real price with you before anything is booked.',
  },
  {
    q: 'Can I ask for a specific cleaner?',
    a: 'Yes. You can send a request straight to a professional whose profile you have seen, and it goes to them rather than into the general matching. If they are not available, the request falls back to cleaners near you.',
  },
  {
    q: 'Does every cleaner offer this service?',
    a: 'No. Each professional lists the types of cleaning they take on, and requests are only matched to cleaners who offer this one and who cover your area.',
  },
  {
    q: 'Can I add extra work to the request?',
    a: 'Describe it in the notes when you send the request. The cleaner confirms in the conversation what they include and whether the extra work is something they can do.',
  },
];

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const estimate = exampleEstimate(service);
  const related = service.related.map(getService).filter(Boolean);
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
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>Skip to content</a>
      <PublicNav />

      <main id="main">
        {/* ═══ Hero ═══ */}
        <section className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <nav className={styles.crumbs} aria-label="Breadcrumb">
                <NextLink href="/">Home</NextLink> <span aria-hidden="true">/</span>
                <NextLink href="/services">Services</NextLink> <span aria-hidden="true">/</span>
                <span aria-current="page">{service.name}</span>
              </nav>
              <h1 className={styles.h1}>{service.name}</h1>
              <p className={styles.tagline}>{service.tagline}</p>
              <div className={styles.heroActions}>
                <NextLink href={requestUrl} className={btn.navy}>
                  Request {service.name} <Arrow />
                </NextLink>
                <NextLink href="/services" className={styles.textLink}>See all services</NextLink>
              </div>
            </div>

            <div className={styles.estimate}>
              <p className={styles.estimateTop}>Estimated range</p>
              <div className={styles.estimateBody}>
                <p className={styles.estimateLabel}>For {service.example.label}:</p>
                <p className={styles.estimateRange}>${estimate.minPrice} – ${estimate.maxPrice}</p>
                <p className={styles.estimateHours}>
                  around {estimate.hours} {estimate.hours === 1 ? 'hour' : 'hours'} of work
                  {estimate.discountPct > 0 ? `, including the ${estimate.discountPct}% recurring discount` : ''}
                </p>
                <p className={styles.estimateNote}>
                  This is what our calculator returns for that example, shown so you have a starting point
                  rather than a blank page. Your own request is priced on your details, and the cleaner
                  agrees the final price with you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ What is it ═══ */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>What it is</h2>
            <p className={styles.prose}>{service.whatIsIt}</p>
          </div>
        </section>

        {/* ═══ What's included ═══ */}
        <section className={`${styles.section} ${styles.sectionCream}`}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>What is usually included</h2>
            <p className={styles.prose}>
              Scope is agreed between you and the cleaner, so treat this as the shape of the job rather
              than a contract. Anything you need that is not here belongs in your request notes.
            </p>
            <ul className={styles.cols} style={{ listStyle: 'none', padding: 0 }}>
              {service.included.map(item => (
                <li className={styles.item} key={item}>
                  <span className={styles.itemMark} aria-hidden="true">—</span>{item}
                </li>
              ))}
            </ul>
            {service.showExtras && (
              <p className={styles.prose} style={{ marginTop: 28 }}>
                Add-ons you can tick in the request form:{' '}
                {REQUEST_EXTRAS.map(e => `${e.label} (+$${e.price})`).join(', ')}.
              </p>
            )}
          </div>
        </section>

        {/* ═══ Right for you ═══ */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>When people ask for it</h2>
            <ul className={styles.cols} style={{ listStyle: 'none', padding: 0 }}>
              {service.rightForYou.map(item => (
                <li className={styles.item} key={item}>
                  <span className={styles.itemMark} aria-hidden="true">—</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══ What to expect ═══ */}
        <section className={`${styles.section} ${styles.sectionCream}`}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>What happens after you send the request</h2>
            <div className={styles.rows}>
              {WHAT_TO_EXPECT.map(step => (
                <div className={styles.row} key={step.title}>
                  <p className={styles.rowTitle}>{step.title}</p>
                  <p className={styles.rowBody}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Before you request ═══ */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>Worth having ready</h2>
            <p className={styles.prose}>{service.beforeYouRequest}</p>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className={`${styles.section} ${styles.sectionCream}`}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>Questions about {service.name.toLowerCase()}</h2>
            <div className={styles.faq}>
              {[...service.faq, ...SHARED_FAQ].map(item => (
                <details className={styles.faqItem} key={item.q}>
                  <summary className={styles.faqQ}>{item.q}<Chevron /></summary>
                  <p className={styles.faqA}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Related ═══ */}
        {related.length > 0 && (
          <section className={styles.section}>
            <div className={styles.wrap}>
              <h2 className={styles.h2}>Often requested alongside</h2>
              <div className={styles.related}>
                {related.map(r => (
                  <NextLink key={r!.slug} href={`/services/${r!.slug}`} className={styles.relatedLink}>
                    <p className={styles.serviceName}>{r!.name}</p>
                    <p className={styles.serviceTagline}>{r!.tagline}</p>
                  </NextLink>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ═══ Final CTA ═══ */}
      <section className={styles.final}>
        <div className={styles.wrap}>
          <h2 className={styles.finalTitle}>Send your {service.name.toLowerCase()} request</h2>
          <p className={styles.finalBody}>
            The form opens with this service already selected. You will see an estimated range as you
            fill it in, and it costs nothing to ask.
          </p>
          <div className={styles.finalActions}>
            <NextLink href={requestUrl} className={btn.light}>
              Request {service.name} <Arrow />
            </NextLink>
            <NextLink href="/services" className={styles.finalLink}>Look at other services</NextLink>
          </div>
        </div>
      </section>

      <PublicFooter services={footerServices} />
    </div>
  );
}
