import type { Metadata } from 'next';
import Link from 'next/link';
import PublicPage from '@/components/site/public-page';
import JsonLd, { FOUNDERS_JSON_LD } from '@/components/site/json-ld';
import { FOUNDERS } from '@/lib/site-content';

export const metadata: Metadata = {
  // absolute: the layout's "%s | Verliks" template would print the name twice.
  title: { absolute: 'Verliks Founders: Wagner Gois and Herminio A. Macamo' },
  description: 'Meet the founders of Verliks: Wagner Gois, Director and CEO, and Herminio A. Macamo, Technical Director.',
  alternates: { canonical: '/founders' },
};

export default function FoundersPage() {
  return (
    <PublicPage>
      <section className="band band-mist" aria-labelledby="founders-title">
        <div className="wrap">
          <nav className="crumbs crumbs-dark" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Founders</span>
          </nav>
          <p className="t-label">The people behind Verliks</p>
          <h1 id="founders-title" className="t-display">Our founders</h1>
          <p className="t-lead mt-2">Two partners started Verliks: one leads the business, the other builds the technology.</p>
        </div>
      </section>

      <section className="band" aria-labelledby="founders-title">
        <div className="wrap">
          <ul className="split plain-list founders">
            {FOUNDERS.map(f => (
              <li key={f.id} id={f.id}>
                <span className="monogram" aria-hidden="true">{f.initials}</span>
                <h2 className="t-col">{f.name}</h2>
                <p className="t-label mt-1">{f.role}</p>
                <p className="col-text">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <JsonLd data={FOUNDERS_JSON_LD} />
    </PublicPage>
  );
}
