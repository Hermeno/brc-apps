import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CircleArrowRight } from 'lucide-react';
import { SERVICES, SERVICE_GROUPS } from '@/lib/services';
import { getSiteService, groupAnchor } from '@/lib/site-content';
import PublicPage from '@/components/site/public-page';
import { PageHero } from '@/components/site/photo-hero';

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

const groupIntro: Record<string, string> = {
  'Inside the home': 'For the rooms you live in, from a regular reset to detailed work on the places that need more attention.',
  'Moving or finishing work': 'When the space is changing hands, opening back up, or still carrying the dust from a project.',
  'Outside the home': 'For the surfaces and drainage around the house that weather and time leave behind.',
  'For businesses': 'Cleaning for workspaces, planned around how the space is actually used.',
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

const findService = (slug: string) => slug === recurring.slug ? recurring : SERVICES.find(service => service.slug === slug);

export default function ServicesIndexPage() {
  const listedServices = groups.flatMap(group => group.slugs.map(findService)
    .filter((service): service is typeof recurring => Boolean(service)));

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
    <PublicPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero id="services-title" crumbs={[{ label: 'Services' }]} position="50% 35%"
        image="/images/site/home-organizing-closet-1600.jpg" alt="A person sorting clothes in a bedroom closet"
        kicker="The Verliks service guide"
        title="The right clean for what needs doing."
        lede="Explore the work, understand the scope, then describe your place to cleaners near you. You agree on the details and price before accepting anyone.">
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/request">Find a cleaner</Link>
          <a className="btn btn-ghost" href="#service-catalog">Explore services</a>
        </div>
      </PageHero>

      <nav className="subnav" aria-label="Service categories">
        <div className="wrap subnav-inner">
          <span>Browse by need</span>
          {groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}</a>)}
        </div>
      </nav>

      <section id="service-catalog" className="intro-band" aria-labelledby="catalog-title">
        <div className="wrap">
          <h2 id="catalog-title" className="t-display">A clear place to start.</h2>
          <p className="t-lead">Select a service to see what cleaners typically cover, what to prepare, and questions worth asking before you decide.</p>
        </div>
      </section>

      {groups.map((group, index) => (
        <section key={group.id} id={group.id} className={`band band-rule${index % 2 === 0 ? ' band-warm' : ''}`} aria-labelledby={`${group.id}-title`}>
          <div className="wrap">
            <div className="band-head">
              <h3 id={`${group.id}-title`} className="t-col">{group.title}</h3>
              <p className="t-lead">{groupIntro[group.title]}</p>
            </div>
            <div className="cols-3">
              {group.slugs.map(slug => {
                const service = findService(slug);
                const site = getSiteService(slug);
                if (!service || !site) return null;
                return (
                  <article key={slug}>
                    <h4 className="t-item">{service.name}</h4>
                    <Link className="col-photo" href={`/services/${slug}`} tabIndex={-1} aria-hidden="true">
                      <Image src={`/images/site/${site.image}-800.jpg`} alt="" fill sizes="(max-width: 860px) 100vw, 30vw" />
                    </Link>
                    <p className="col-text">{service.tagline}</p>
                    <Link className="more-link col-more" href={`/services/${slug}`}>
                      Learn more<span className="sr-only"> about {service.name}</span>
                      <CircleArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      <section className="intro-band band-rule" aria-labelledby="guidance-title">
        <div className="wrap intro-band-inner">
          <div>
            <p className="t-label">Need a hand choosing?</p>
            <h2 id="guidance-title" className="t-display">You can start with the situation.</h2>
            <p className="t-lead">Choose the closest service and describe the work in your request. A cleaner can discuss the right scope with you before you accept.</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn-dark" href="/how-it-works">How it works</Link>
            <Link className="btn btn-primary" href="/request">Describe your job</Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
