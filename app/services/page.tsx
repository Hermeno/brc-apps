import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import '../site.css';
import styles from './services.module.css';
import { SERVICES, SERVICE_GROUPS } from '@/lib/services';
import { groupAnchor } from '@/lib/site-content';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import PhotoHero from '@/components/site/photo-hero';
import { Icon, IconSprite } from '@/components/site/icons';

const BASE = 'https://verliks.com';

const recurring = {
  slug: 'recurring-cleaning',
  name: 'Recurring Cleaning',
  tagline: 'Regular upkeep on a schedule that works for your home.',
};

const groups = SERVICE_GROUPS.map(group => ({
  ...group,
  id: groupAnchor(group.title),
  slugs: group.title === 'Inside the home'
    ? ['standard-cleaning', 'recurring-cleaning', ...group.slugs.filter(slug => slug !== 'standard-cleaning')]
    : group.slugs,
}));

const groupDetails: Record<string, { intro: string; image: string; alt: string }> = {
  'Inside the home': {
    intro: 'For the rooms you live in, from a regular reset to detailed work on the places that need more attention.',
    image: '/images/site/standard-cleaning-dusting-shelves-1600.jpg',
    alt: 'A cleaning professional dusting shelves inside a home',
  },
  'Moving or finishing work': {
    intro: 'When the space is changing hands, opening back up, or still carrying the dust from a project.',
    image: '/images/site/post-construction-kitchen-renovation-1600.jpg',
    alt: 'A kitchen after renovation work',
  },
  'Outside the home': {
    intro: 'For the surfaces and drainage around the house that weather and time leave behind.',
    image: '/images/site/deck-wooden-terrace-1600.jpg',
    alt: 'A wooden outdoor deck',
  },
  'For businesses': {
    intro: 'Cleaning for workspaces, planned around how the space is actually used.',
    image: '/images/site/commercial-hallway-cart-1600.jpg',
    alt: 'Cleaning equipment in a commercial hallway',
  },
};

export const metadata: Metadata = {
  title: 'Cleaning Services',
  description:
    'Explore cleaning services through Verliks, from routine and deep cleaning to post-construction, outdoor and commercial work. See the scope before you send a request.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Cleaning Services | Verliks',
    description:
      'Find the right cleaning for your home or workplace. Explore each service and send a free request to independent professionals near you.',
    url: '/services',
    siteName: 'Verliks',
    type: 'website',
    images: [{ url: '/images/site/standard-cleaning-dusting-shelves-1600.jpg', width: 1600, height: 1067, alt: 'Home cleaning' }],
  },
  robots: { index: true, follow: true },
};

export default function ServicesIndexPage() {
  const listedServices = groups.flatMap(group => group.slugs.map(slug =>
    slug === recurring.slug ? recurring : SERVICES.find(service => service.slug === slug),
  ).filter((service): service is typeof recurring => Boolean(service)));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE}/services`,
        url: `${BASE}/services`,
        name: 'Cleaning Services',
        description: 'The cleaning services that can be requested through Verliks.',
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
        itemListElement: listedServices.map((service, index) => ({
          '@type': 'ListItem', position: index + 1, name: service.name, url: `${BASE}/services/${service.slug}`,
        })),
      },
    ],
  };

  return (
    <div className={`vsite ${styles.page}`}>
      <IconSprite />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>Skip to main content</a>
      <SiteHeader overlay />

      <main id="main" data-inert-when-menu>
        <PhotoHero id="services-title" crumb="Services"
          image="/images/site/standard-cleaning-dusting-shelves-1600.jpg"
          alt="A cleaning professional dusting shelves inside a home"
          kicker="The Verliks service guide"
          title={<><span>The right clean</span> <span>for what needs doing.</span></>}
          lede="Explore the work, understand the scope, then describe your place to cleaners near you. You agree on the details and price before accepting anyone.">
          <div className="hero-actions">
            <Link className="btn-solid" href="/request">Find a cleaner</Link>
            <a className="btn-line" href="#service-catalog">Explore services</a>
          </div>
        </PhotoHero>

        <nav className={styles.categoryNav} aria-label="Service categories">
          <div className="wrap">
            <span className={styles.categoryNavLabel}>Browse by need</span>
            <div className={styles.categoryLinks}>
              {groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}</a>)}
            </div>
          </div>
        </nav>

        <section id="service-catalog" className={styles.catalog} aria-labelledby="catalog-title">
          <div className="wrap">
            <div className={styles.catalogIntro}>
              <p className="kicker">Explore the work</p>
              <h2 id="catalog-title" className="v-title">A clear place to start.</h2>
              <p>Select a service to see what cleaners typically cover, what to prepare, and questions worth asking before you decide.</p>
            </div>

            {groups.map(group => {
              const detail = groupDetails[group.title];
              return (
                <section className={styles.category} id={group.id} aria-labelledby={`${group.id}-title`} key={group.id}>
                  <div className={styles.categoryHeading}>
                    <h3 id={`${group.id}-title`}>{group.title}</h3>
                    <p>{detail.intro}</p>
                  </div>
                  <div className={styles.categoryGrid}>
                    <figure className={styles.categoryImage}>
                      <Image src={detail.image} alt={detail.alt} fill sizes="(max-width: 800px) 100vw, 38vw" />
                    </figure>
                    <ul className={styles.serviceList}>
                      {group.slugs.map(slug => {
                        const service = slug === recurring.slug ? recurring : SERVICES.find(item => item.slug === slug);
                        if (!service) return null;
                        return (
                          <li key={service.slug}>
                            <Link href={`/services/${service.slug}`} className={styles.serviceLink}>
                              <span>
                                <strong>{service.name}</strong>
                                <small>{service.tagline}</small>
                              </span>
                              <Icon name="arrow-up-right" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="gold-band" aria-labelledby="guidance-title">
          <div className="wrap gold-grid">
            <div>
              <p className="kicker">Need a hand choosing?</p>
              <h2 id="guidance-title">You can start with the situation.</h2>
              <p>Choose the closest service and describe the work in your request. A cleaner can discuss the right scope with you before you accept.</p>
            </div>
            <div className="gold-actions">
              <Link className="btn-ink" href="/request">Describe your job</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
