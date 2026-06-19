'use client';

import { useState } from 'react';
import styles from '../landing-page.module.css';

type ServiceTab = 'standard' | 'deep' | 'moveout' | 'post' | 'office';

const TABS: { id: ServiceTab; label: string; sub: string; hasArrow?: boolean; icon: React.ReactNode }[] = [
  {
    id: 'standard', label: 'Standard Cleaning', sub: 'Regular Home Care', hasArrow: true,
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'deep', label: 'Deep Cleaning', sub: 'Thorough Service',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
  {
    id: 'moveout', label: 'Move In/Out', sub: 'Transition Cleaning',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    id: 'post', label: 'Post-Construction', sub: "Builder's Clean",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
  {
    id: 'office', label: 'Office Cleaning', sub: 'Commercial Service',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
];

const ARROW = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export function ServiceTabs() {
  const [active, setActive] = useState<ServiceTab>('standard');

  return (
    <section className={styles['services-bar']} id="services">
      <div className={styles['services-bar-inner']}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            className={`${styles['svc-tab']} ${active === tab.id ? styles.active : ''}`}
            onClick={() => setActive(tab.id)}
          >
            <div className={styles['svc-tab-icon']}>{tab.icon}</div>
            <strong>{tab.label}</strong>
            <span>{tab.sub}</span>
            {tab.hasArrow && <div className={styles['svc-tab-arrow']}>{ARROW}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
