import { FOUNDERS } from '@/lib/site-content';

/* Structured data (schema.org JSON-LD) that search engines read: who Verliks is,
   the site name Google shows, and the founders. Nothing on the page changes. */
const SITE = 'https://verliks.com';
const ORGANIZATION = `${SITE}/#organization`;

const organization = {
  '@type': 'Organization',
  '@id': ORGANIZATION,
  name: 'Verliks',
  url: SITE,
  logo: `${SITE}/images/brand/verliks-logo-600.png`,
  email: 'support@verliks.com',
  description: 'Verliks connects clients with independent cleaning professionals, starting in Connecticut.',
  areaServed: { '@type': 'State', name: 'Connecticut' },
  founder: FOUNDERS.map(f => ({
    '@type': 'Person',
    '@id': `${SITE}/founders#${f.id}`,
    name: f.name,
    jobTitle: f.jobTitle,
    worksFor: { '@id': ORGANIZATION },
  })),
};

/** Home page: the organization, and the site name for search results. */
export const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    organization,
    { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'Verliks', url: SITE, publisher: { '@id': ORGANIZATION } },
  ],
};

/** /founders: a page about the people who founded the organization. */
export const FOUNDERS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE}/founders`,
  url: `${SITE}/founders`,
  name: 'Verliks founders',
  about: organization,
};

export default function JsonLd({ data }: { data: object }) {
  // Escaping "<" keeps the JSON from closing the script tag, as the Next.js docs advise.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
