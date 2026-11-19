import type { Metadata } from 'next';
import Link from 'next/link';
import PublicPage from '@/components/site/public-page';

export const metadata: Metadata = {
  title: 'Founders | Verliks',
  description: 'Meet the founders of Verliks: Wagner Gois, Director and CEO, and Herminio A. Macamo, Technical Director.',
  alternates: { canonical: '/founders' },
};

const founders = [
  {
    name: 'Wagner Gois',
    initials: 'WG',
    role: 'Co-founder · Director & CEO',
    body: 'Leads the business side of Verliks: strategy, partnerships, operations and growth.',
  },
  {
    name: 'Herminio A. Macamo',
    initials: 'HM',
    role: 'Co-founder · Technical Director',
    body: 'Programmer and systems developer. Builds the Verliks platform and apps, from booking and matching to payments, and leads the technology behind them.',
  },
];

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
          <ul className="split plain-list">
            {founders.map(f => (
              <li key={f.name}>
                <span className="monogram" aria-hidden="true">{f.initials}</span>
                <h2 className="t-col">{f.name}</h2>
                <p className="t-label mt-1">{f.role}</p>
                <p className="col-text">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicPage>
  );
}
