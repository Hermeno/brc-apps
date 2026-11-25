import type { MetadataRoute } from 'next';
import { SITE_SERVICES } from '@/lib/site-content';

const BASE = 'https://verliks.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/request`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/for-cleaners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/services`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/service-areas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...SITE_SERVICES.map(svc => ({
      url: `${BASE}/services/${svc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/founders`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/terms`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
  ];
}
