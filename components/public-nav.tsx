'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './public-chrome.module.css';
import { SERVICES, SERVICE_GROUPS } from '@/lib/services';

/* Header for the public server-rendered pages. It is a client component only
   because the services panel needs open/closed state. */

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const Caret = () => (
  <svg className={styles.navCaret} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

export function PublicNav() {
  const [svcOpen, setSvcOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!svcOpen && !drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSvcOpen(false); setDrawer(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [svcOpen, drawer]);

  const close = () => { setSvcOpen(false); setDrawer(false); };

  return (
    <header className={styles.nav} onMouseLeave={() => setSvcOpen(false)}>
      <div className={styles.navInner}>
        <NextLink href="/" className={styles.logo} aria-label="Verliks home">
          <Image src="/vlogo.PNG" alt="" width={34} height={34} className={styles.logoMark} priority />
          <span>verliks</span>
        </NextLink>

        <ul className={styles.navLinks}>
          <li className={styles.navItem} onMouseEnter={() => setSvcOpen(true)}>
            <button
              type="button"
              className={styles.navTrigger}
              aria-expanded={svcOpen}
              aria-controls="public-services-menu"
              onClick={() => setSvcOpen(v => !v)}
            >
              Services <Caret />
            </button>
          </li>
          <li><NextLink href="/for-cleaners" className={styles.navLink}>For cleaners</NextLink></li>
          <li><NextLink href="/about" className={styles.navLink}>About</NextLink></li>
        </ul>

        <div className={styles.navRight}>
          <NextLink href="/auth/login" className={styles.navLink}>Sign in</NextLink>
          <NextLink href="/request" className={`${styles.btn} ${styles.btnNavy} ${styles.btnSmall}`}>
            Find a cleaner
          </NextLink>
        </div>

        <button
          className={styles.navMenuBtn}
          onClick={() => setDrawer(v => !v)}
          aria-label={drawer ? 'Close menu' : 'Open menu'}
          aria-expanded={drawer}
          aria-controls="public-drawer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" aria-hidden="true">
            {drawer ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {svcOpen && (
        <div id="public-services-menu" className={styles.mega}>
          <div className={styles.megaInner}>
            {SERVICE_GROUPS.map(group => (
              <div className={styles.megaGroup} key={group.title}>
                <p className={styles.megaGroupTitle}>{group.title}</p>
                {group.slugs.map(slug => {
                  const svc = SERVICES.find(x => x.slug === slug);
                  return svc ? (
                    <NextLink key={svc.slug} href={`/services/${svc.slug}`} className={styles.megaLink} onClick={close}>
                      {svc.name}
                    </NextLink>
                  ) : null;
                })}
              </div>
            ))}
          </div>
          <div className={styles.megaFoot}>
            <NextLink href="/services" className={styles.megaAll} onClick={close}>
              All 12 services <Arrow />
            </NextLink>
          </div>
        </div>
      )}

      <nav id="public-drawer" className={`${styles.drawer} ${drawer ? styles.drawerOpen : ''}`} aria-label="Mobile">
        {SERVICE_GROUPS.map(group => (
          <div key={group.title}>
            <p className={styles.mobileGroupTitle}>{group.title}</p>
            {group.slugs.map(slug => {
              const svc = SERVICES.find(x => x.slug === slug);
              return svc ? (
                <NextLink key={svc.slug} href={`/services/${svc.slug}`} className={styles.mobileSub} onClick={close}>
                  {svc.name}
                </NextLink>
              ) : null;
            })}
          </div>
        ))}
        <NextLink href="/services" onClick={close}>All 12 services</NextLink>
        <NextLink href="/for-cleaners" onClick={close}>For cleaners</NextLink>
        <NextLink href="/about" onClick={close}>About</NextLink>
        <NextLink href="/auth/login" onClick={close}>Sign in</NextLink>
        <NextLink href="/request" onClick={close} className={`${styles.btn} ${styles.btnNavy} ${styles.drawerCta}`}>
          Find a cleaner
        </NextLink>
      </nav>
    </header>
  );
}
