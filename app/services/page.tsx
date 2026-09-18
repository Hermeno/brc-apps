import type { Metadata } from 'next';
import NextLink from 'next/link';
import styles from './services.module.css';
import { SERVICES, SERVICE_GROUPS } from '@/lib/services';
import { PublicFooter, Arrow, btn } from '@/components/public-chrome';
import SiteHeader from '@/components/site-header';

const BASE = 'https://verliks.com';
const footerServices = SERVICES.slice(0, 5).map(s => ({ slug: s.slug, name: s.name }));

export const metadata: Metadata = {
  title: 'Cleaning Services',
  description:
    'Every type of cleaning you can request through Verliks — from routine and deep cleaning to post-construction, gutters, tile and commercial work. Each one with what it covers and what to have ready.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Cleaning Services | Verliks',
    description:
      'Routine, deep, move-out, post-construction, exterior and commercial cleaning — what each one covers and what to have ready.',
    url: '/services',
    siteName: 'Verliks',
    type: 'website',
    images: [{ url: '/images/home/living-room.jpg', width: 2560, height: 1706, alt: 'A clean, open living room' }],
  },
  robots: { index: true, follow: true },
};

export default function ServicesIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE}/services`,
        url: `${BASE}/services`,
        name: 'Cleaning Services',
        description: 'The types of cleaning that can be requested through Verliks.',
        inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', name: 'Verliks', url: BASE },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services` },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: SERVICES.map((s, i) => ({
          '@type': 'ListItem', position: i + 1, name: s.name, url: `${BASE}/services/${s.slug}`,
        })),
      },
    ],
  };

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>Skip to content</a>
      <SiteHeader />

      <main id="main">
        <section className={`${styles.hero} ${styles.heroFlat}`}>
          <div className={styles.heroContent}>
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <NextLink href="/">Home</NextLink> <span aria-hidden="true">/</span>
              <span aria-current="page">Services</span>
            </nav>
            <h1 className={styles.h1}>What you can ask a cleaner for</h1>
            <p className={styles.tagline}>
              Twelve kinds of work, each with what it covers, what it usually leaves out, and what is
              worth telling the cleaner before you ask.
            </p>
            <div className={styles.heroActions}>
              <NextLink href="/request" className={btn.navy}>Start a request <Arrow /></NextLink>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.wrap}>
            {SERVICE_GROUPS.map(group => (
              <div className={styles.group} key={group.title}>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                {group.slugs.map(slug => {
                  const s = SERVICES.find(x => x.slug === slug);
                  if (!s) return null;
                  return (
                    <NextLink href={`/services/${s.slug}`} className={styles.serviceLink} key={s.slug}>
                      <span>
                        <span className={styles.serviceName} style={{ display: 'block' }}>{s.name}</span>
                        <span className={styles.serviceTagline} style={{ display: 'block' }}>{s.tagline}</span>
                      </span>
                      <span className={styles.serviceArrow} aria-hidden="true"><Arrow /></span>
                    </NextLink>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className={styles.final}>
        <div className={styles.wrap}>
          <h2 className={styles.finalTitle}>Not sure which one you need?</h2>
          <p className={styles.finalBody}>
            Start the request with whichever is closest and describe the situation in the notes. The
            cleaner who picks it up can tell you if a different service fits better.
          </p>
          <div className={styles.finalActions}>
            <NextLink href="/request" className={btn.navy}>Start a request <Arrow /></NextLink>
            <NextLink href="/for-cleaners" className={styles.finalLink}>I am a cleaner, not a client</NextLink>
          </div>
        </div>
      </section>

      <PublicFooter services={footerServices} />
    </div>
  );
}
