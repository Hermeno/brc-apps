'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from '../app/platform-home.module.css';
import { useLocale } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';
import { SERVICES, SERVICE_GROUPS } from '@/lib/services';

/* The one header used by every public page.

   It is transparent while a photo hero is behind it and turns solid once that
   hero has scrolled past. A page opts in by putting `data-hero` on its hero
   section; a page without one gets a solid header and a spacer, because the
   header is fixed. */

const svg = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const IcCaret = () => (<svg className={styles.navCaret} width="14" height="14" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M6 9.5l6 6 6-6" /></svg>);
const IcArrow = () => (<svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const IcMenu  = () => (<svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
const IcClose = () => (<svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M6 6l12 12M18 6L6 18" /></svg>);

export default function SiteHeader({ onHome = false }: { onHome?: boolean }) {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [svcOpen, setSvcOpen]   = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hasHero, setHasHero]   = useState(true);

  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) { setHasHero(false); return; }
    const navH = window.matchMedia('(max-width: 640px)').matches ? 64 : 76;
    const io = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
      rootMargin: `-${navH}px 0px 0px 0px`,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen && !svcOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); setSvcOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, svcOpen]);

  const solid = !hasHero || pastHero || menuOpen || svcOpen;
  const close = () => { setMenuOpen(false); setSvcOpen(false); };
  const href  = (hash: string) => (onHome ? hash : `/${hash}`);

  const serviceColumns = SERVICE_GROUPS.map(group => (
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
  ));

  return (
    <>
      <header
        className={`${styles.nav} ${solid ? styles.navSolid : ''}`}
        onMouseLeave={() => setSvcOpen(false)}
      >
        <div className={styles.navInner}>
          <NextLink href="/" className={styles.logo} aria-label="Verliks">
            <Image src="/vlogo.PNG" alt="" width={34} height={34} className={styles.logoMark} priority />
            <span className={styles.logoWord}>verliks</span>
          </NextLink>

          <ul className={styles.navLinks}>
            <li className={styles.navItem} onMouseEnter={() => setSvcOpen(true)}>
              <button
                type="button"
                className={styles.navTrigger}
                aria-expanded={svcOpen}
                aria-controls="services-menu"
                onClick={() => setSvcOpen(v => !v)}
              >
                {t('home.navServices')} <IcCaret />
              </button>
            </li>
            <li><a href={href('#how-it-works')} className={styles.navLink}>{t('home.navHowItWorks')}</a></li>
            <li><a href={href('#trust')} className={styles.navLink}>{t('home.navSafety')}</a></li>
            <li><NextLink href="/for-cleaners" className={styles.navLink}>{t('home.navPros')}</NextLink></li>
            <li><NextLink href="/about" className={styles.navLink}>{t('home.navAbout')}</NextLink></li>
          </ul>

          <div className={styles.navRight}>
            <LanguageSwitcher dark={!solid} square />
            <NextLink href="/auth/login" className={styles.navLink}>{t('home.navSignIn')}</NextLink>
            <NextLink href="/request" className={`${styles.btn} ${styles.btnSmall} ${solid ? styles.btnNavy : styles.btnLight}`}>
              {t('home.navCta')}
            </NextLink>
          </div>

          <button
            className={styles.navMenuBtn}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? t('home.menuClose') : t('home.menuOpen')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <IcClose /> : <IcMenu />}
          </button>
        </div>

        {svcOpen && (
          <div id="services-menu" className={styles.mega}>
            <div className={styles.megaInner}>{serviceColumns}</div>
            <div className={styles.megaFoot}>
              <NextLink href="/services" className={styles.megaAll} onClick={close}>
                {t('home.svcAll')} <IcArrow />
              </NextLink>
            </div>
          </div>
        )}

        <nav id="mobile-menu" className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`} aria-label="Mobile">
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
          <NextLink href="/services" onClick={close}>{t('home.svcAll')}</NextLink>
          <a href={href('#how-it-works')} onClick={close}>{t('home.navHowItWorks')}</a>
          <a href={href('#trust')} onClick={close}>{t('home.navSafety')}</a>
          <NextLink href="/for-cleaners" onClick={close}>{t('home.navPros')}</NextLink>
          <NextLink href="/about" onClick={close}>{t('home.navAbout')}</NextLink>
          <NextLink href="/auth/login" onClick={close}>{t('home.navSignIn')}</NextLink>
          <NextLink href="/request" onClick={close} className={`${styles.btn} ${styles.btnNavy} ${styles.mobileMenuCta}`}>
            {t('home.navCta')} <IcArrow />
          </NextLink>
        </nav>
      </header>

      {/* The header is fixed; pages without a photo hero need the height back. */}
      {!hasHero && <div className={styles.navSpacer} aria-hidden="true" />}
    </>
  );
}
