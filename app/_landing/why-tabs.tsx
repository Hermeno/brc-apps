'use client';

import { useState } from 'react';
import styles from '../landing-page.module.css';

type WhyTab = 'knowledge' | 'excellence' | 'pricing';

const WHY_TABS: { id: WhyTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'knowledge', label: 'In-Depth Knowledge',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  },
  {
    id: 'excellence', label: 'Excellence & Leadership',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
  {
    id: 'pricing', label: 'Competitive Pricing',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
];

export function WhyTabs() {
  const [active, setActive] = useState<WhyTab>('knowledge');

  return (
    <section className={styles['why-us']} id="why-us">
      <div className={styles.container}>
        <h2 className={styles['section-center-title']}>Why Choose Us?</h2>
        <div className={styles['why-tabs']}>
          {WHY_TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles['why-tab']} ${active === tab.id ? styles.active : ''}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles['why-body']}>
          <div className={styles['why-images']}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80" alt="Professional cleaning team" className={styles['why-img-main']} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80" alt="Cleaning supplies" className={styles['why-img-side']} />
          </div>
          <div className={styles['why-content']}>
            <div className={`${styles['why-panel']} ${active === 'knowledge' ? styles.active : ''}`}>
              <h3>Years of Cleaning Expertise</h3>
              <p>BrazilianClean is built on decades of professional cleaning knowledge. Our network of vetted cleaners brings deep expertise in residential and commercial spaces — delivering spotless results backed by real experience.</p>
              <p>Every cleaner on our platform is background-checked, trained in modern cleaning techniques, and equipped with the best products to keep your home safe and sparkling clean.</p>
            </div>
            <div className={`${styles['why-panel']} ${active === 'excellence' ? styles.active : ''}`}>
              <h3>Excellence &amp; Leadership in Cleaning</h3>
              <p>BrazilianClean is positioned in the United States as a leader in professional home cleaning services, backed by professionals who have decades of global experience in the cleaning industry.</p>
              <p>Where our headquarters is located in Miami, Florida, and we have branches operating across Connecticut, New York, Massachusetts, and expanding nationwide.</p>
            </div>
            <div className={`${styles['why-panel']} ${active === 'pricing' ? styles.active : ''}`}>
              <h3>Transparent, Competitive Pricing</h3>
              <p>No hidden fees, no surprises. We believe in clear, upfront pricing that works for every budget. Our platform ensures you always know exactly what you&apos;re paying before you confirm a booking.</p>
              <p>Flexible plans for one-time cleans, recurring visits, and specialized services — all priced fairly so quality is never out of reach.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
