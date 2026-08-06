'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './platform-home.module.css';
import { useLocale } from '@/lib/i18n';
import { SERVICE_TYPES } from '@/lib/estimate';
import LanguageSwitcher from '@/components/language-switcher';

/* ── Inline icons (self-contained, no external deps) ── */
const IcMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);
const IcClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);
const IcVerified = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className={styles.verified} aria-hidden="true">
    <path d="M12 1l2.4 2.1 3.2-.3 1.3 2.9 2.9 1.3-.3 3.2L23.6 16l-2.1 2.4.3 3.2-2.9 1.3-1.3 2.9-3.2-.3L12 27.6 9.6 25.5l-3.2.3-1.3-2.9-2.9-1.3.3-3.2L.4 16l2.1-2.4-.3-3.2 2.9-1.3L6.4 6.2l3.2.3z" transform="scale(0.82) translate(2.6 -1)" />
    <path d="M10.2 13.6l-2-2-1.2 1.2 3.2 3.2 5.6-5.6-1.2-1.2z" fill="#fff" transform="scale(0.82) translate(2.6 -1)" />
  </svg>
);
const IcStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);
const IcArrow = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const IcFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z" /></svg>
);
const IcInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/* Illustrative example data — clearly labeled "Example" in the UI, never
   presented as real reviews. Real profiles surface after a request. */
const EXAMPLE_PROS = [
  { initials: 'S', name: 'Sarah M.',   services: ['standard', 'deep'],       distance: 2.1, rating: 4.9, jobs: 128, avail: 'Tomorrow · 9:00 AM' },
  { initials: 'J', name: 'Jessica R.', services: ['deep', 'moving'],         distance: 3.4, rating: 4.8, jobs: 96,  avail: 'Wed · 1:00 PM' },
  { initials: 'E', name: 'Emily T.',   services: ['standard', 'standard'],   distance: 4.7, rating: 4.9, jobs: 142, avail: 'Thu · 10:00 AM' },
];

/* The landing page always greets US visitors in English. The switcher still
   works — once a visitor changes language in a session we don't force it again
   (flag in sessionStorage), so their choice sticks while they browse. */
const TESTIMONIAL = {
  quote: 'I used Verliks to find a deep cleaning before my mom came to visit. The cleaner was on time, detailed, and so respectful of my home. It made a huge difference.',
  name: 'Amanda R.',
  location: 'Somerville, MA',
  meta: 'Deep Cleaning · April 2024',
};

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  // English-first landing: force English on the first visit of a session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('verliks_lang_seen')) {
      sessionStorage.setItem('verliks_lang_seen', '1');
      if (locale !== 'en') setLocale('en');
    }
  }, [locale, setLocale]);

  const serviceLabel = (id: string) => {
    const s = SERVICE_TYPES.find(x => x.id === id);
    return s ? (locale === 'pt' ? s.label : s.labelEn) : id;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Verliks',
    url: 'https://verliks.com',
    logo: 'https://verliks.com/logo-blue.png',
    description: 'Verliks connects homeowners with trusted local cleaning professionals. Send a free request and choose who to hire.',
    areaServed: 'US',
    sameAs: ['https://www.instagram.com/'],
  };

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>{t('home.skipToContent')}</a>

      {/* ── Header ── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <NextLink href="/" className={styles.navLogo} aria-label="Verliks">
            <Image src="/vlogo.PNG" alt="" width={34} height={34} style={{ objectFit: 'contain' }} />
            <span className={styles.navLogoText}>Verliks</span>
          </NextLink>

          <ul className={styles.navLinks}>
            <li><a href="#how-it-works">{t('home.navHowItWorks')}</a></li>
            <li><a href="#for-pros">{t('home.navForPros')}</a></li>
            <li><NextLink href="/about">{t('home.navAbout')}</NextLink></li>
          </ul>

          <div className={styles.navRight}>
            <LanguageSwitcher />
            <NextLink href="/auth/login" className={styles.navSignIn}>{t('home.navSignIn')}</NextLink>
            <NextLink href="/request" className={styles.navBook}>{t('home.navBook')}</NextLink>
            <button
              className={styles.navMenuBtn}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IcClose /> : <IcMenu />}
            </button>
          </div>
        </div>
        <nav className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`} aria-label="Mobile">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{t('home.navHowItWorks')}</a>
          <a href="#for-pros" onClick={() => setMenuOpen(false)}>{t('home.navForPros')}</a>
          <NextLink href="/about" onClick={() => setMenuOpen(false)}>{t('home.navAbout')}</NextLink>
          <NextLink href="/auth/login" onClick={() => setMenuOpen(false)}>{t('home.navSignIn')}</NextLink>
          <NextLink href="/request" className={styles.mobileBook} style={{ display: 'block', padding: '13px 4px' }} onClick={() => setMenuOpen(false)}>{t('home.navBook')}</NextLink>
        </nav>
      </header>

      <main id="main">

        {/* ── Hero ── */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 id="hero-title" className={styles.heroTitle}>
                {t('home.heroTitleA')}<br />{t('home.heroTitleB')}
              </h1>
              <p className={styles.heroBody}>{t('home.heroBody')}</p>
              <NextLink href="/request" className={styles.heroCta}>{t('home.heroCta')}</NextLink>
              <p className={styles.heroHelper}>{t('home.heroHelper')}</p>
              <NextLink href="/auth/register?role=cleaner" className={styles.heroProLink}>{t('home.heroProLink')}</NextLink>
            </div>
            <div className={styles.heroImageWrap}>
              <Image src="/abc.png" alt={t('home.heroImgAlt')} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
            </div>
          </div>
        </section>

        {/* ── Professionals preview ── */}
        <section className={styles.section} aria-labelledby="pros-title">
          <div className={styles.inner}>
            <div className={styles.prosHead}>
              <h2 id="pros-title" className={styles.sectionTitle}>{t('home.prosTitle')}</h2>
              <span className={styles.prosTag}>{t('home.prosExample')}</span>
            </div>
            <p className={styles.prosNote}>{t('home.prosNote')}</p>
            <div className={styles.prosTableWrap}>
              <table className={styles.prosTable}>
                <thead>
                  <tr>
                    <th>{t('home.colPro')}</th>
                    <th>{t('home.colServices')}</th>
                    <th>{t('home.colDistance')}</th>
                    <th>{t('home.colRating')}</th>
                    <th>{t('home.colAvail')}</th>
                    <th aria-hidden="true"></th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE_PROS.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <span className={styles.proCell}>
                          <span className={styles.proAvatar} aria-hidden="true">{p.initials}</span>
                          <span className={styles.proName}>{p.name}<IcVerified /></span>
                        </span>
                      </td>
                      <td>{Array.from(new Set(p.services)).map(s => serviceLabel(s)).join(' · ')}</td>
                      <td>{t('home.milesAway', { n: p.distance })}</td>
                      <td>
                        <span className={styles.proStars}><IcStar /> {p.rating.toFixed(1)} ({p.jobs})</span>
                        <span className={styles.proSub}>{t('home.jobsCount', { n: p.jobs })}</span>
                      </td>
                      <td>{p.avail}</td>
                      <td><NextLink href="/request" className={styles.viewProfile}>{t('home.viewProfile')}</NextLink></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.seeMoreRow}>
              <NextLink href="/request" className={styles.seeMore}>{t('home.seeMorePros')}</NextLink>
            </div>
          </div>
        </section>

        {/* ── Process ── */}
        <section className={styles.section} id="how-it-works" aria-labelledby="process-title">
          <div className={styles.inner}>
            <h2 id="process-title" className={styles.sectionTitle}>{t('home.processTitle')}</h2>
            <p className={styles.processSub}>{t('home.processSub')}</p>
            <div className={styles.processGrid}>
              {/* Step 1 */}
              <div>
                <h3 className={styles.procStepTitle}>{t('home.p1Title')}</h3>
                <p className={styles.procStepBody}>{t('home.p1Body')}</p>
                <div className={styles.mock} aria-hidden="true">
                  <p className={styles.mockLabel}>{t('home.uiTypeOfCleaning')}</p>
                  <div className={styles.mockField}>{serviceLabel('deep')}<span>▾</span></div>
                  <div className={styles.mockField}>{t('home.uiBedrooms')}
                    <span className={styles.mockStepper}><span className={styles.mockStepBtn}>–</span>2<span className={styles.mockStepBtn}>+</span></span>
                  </div>
                  <div className={styles.mockField}>{t('home.uiBathrooms')}
                    <span className={styles.mockStepper}><span className={styles.mockStepBtn}>–</span>2<span className={styles.mockStepBtn}>+</span></span>
                  </div>
                  <span className={styles.mockAddLink}>{t('home.uiAddDetails')}</span>
                </div>
              </div>
              <div className={styles.procArrow}><IcArrow /></div>
              {/* Step 2 */}
              <div>
                <h3 className={styles.procStepTitle}>{t('home.p2Title')}</h3>
                <p className={styles.procStepBody}>{t('home.p2Body')}</p>
                <div className={styles.mock} aria-hidden="true">
                  {EXAMPLE_PROS.map((p, i) => (
                    <div key={i} className={`${styles.mockRow} ${i === 1 ? styles.mockRowActive : ''}`}>
                      <span className={styles.mockMini}>{p.initials}</span>
                      <span className={styles.mockRowMain}>
                        <span className={styles.mockRowName}>{p.name}</span>
                      </span>
                      <span className={styles.mockRowMeta}>★ {p.rating}<br />{p.avail.split(' · ')[0]}</span>
                    </div>
                  ))}
                </div>
                <NextLink href="/request" className={styles.procUnderLink}>{t('home.uiSeeAvailability')}</NextLink>
              </div>
              <div className={styles.procArrow}><IcArrow /></div>
              {/* Step 3 */}
              <div>
                <h3 className={styles.procStepTitle}>{t('home.p3Title')}</h3>
                <p className={styles.procStepBody}>{t('home.p3Body')}</p>
                <div className={styles.mock} aria-hidden="true">
                  <p className={styles.mockBookTitle}>{serviceLabel('deep')}</p>
                  <p className={styles.mockBookLine}>Wed · 1:00 PM</p>
                  <p className={styles.mockBookLine}>Jessica R.</p>
                  <p className={styles.mockBookLine}>2 bd · 2 ba</p>
                  <span className={styles.mockConfirm}>{t('home.uiConfirmBooking')}</span>
                </div>
                <NextLink href="/request" className={styles.procUnderLink}>{t('home.uiRescheduleNote')}</NextLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Trust band ── */}
      <section className={styles.trust} aria-labelledby="trust-title">
        <div className={styles.trustInner}>
          <h2 id="trust-title" className={styles.trustTitle}>{t('home.trustTitle')}</h2>
          <div className={styles.trustCol}>
            <h3 className={styles.trustColTitle}>{t('home.trust1Title')}</h3>
            <p className={styles.trustColBody}>{t('home.trust1Body')}</p>
          </div>
          <div className={styles.trustCol}>
            <h3 className={styles.trustColTitle}>{t('home.trust2Title')}</h3>
            <p className={styles.trustColBody}>{t('home.trust2Body')}</p>
          </div>
          <div className={styles.trustCol}>
            <h3 className={styles.trustColTitle}>{t('home.trust3Title')}</h3>
            <p className={styles.trustColBody}>{t('home.trust3Body')}</p>
          </div>
        </div>
      </section>

      {/* ── Leads (for cleaning professionals) ── */}
      <section className={styles.leads} id="for-pros" aria-labelledby="leads-title">
        <div className={styles.leadsInner}>
          <div className={styles.leadsText}>
            <h2 id="leads-title" className={styles.sectionTitle}>{t('home.leadsTitle')}</h2>
            <p className={styles.leadsBody}>{t('home.leadsBody')}</p>
            <NextLink href="/auth/register?role=cleaner" className={styles.leadsCta}>{t('home.leadsCta')}</NextLink>
            <NextLink href="/about" className={styles.leadsLearn}>{t('home.leadsLearnMore')}</NextLink>
          </div>
          <div className={styles.leadsPanel}>
            <div className={styles.leadCard} aria-hidden="true">
              <p className={styles.leadCardTitle}>{serviceLabel('deep')}</p>
              <p className={styles.leadCardMeta}>Miami, FL · May 24 · 3 bed / 2 bath</p>
              <p className={styles.leadCardLine}>{t('home.leadCardEstimated')}: $180–$240</p>
              <p className={styles.leadCardFee}>{t('home.leadCardFee')}: $18</p>
              <span className={styles.leadCardBtn}>{t('home.leadCardRespond')}</span>
              <p className={styles.leadCardNote}>{t('home.leadCardNote')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial (kept in English across locales — real quotes aren't translated) ── */}
      <section className={styles.testimonial} aria-label="Customer testimonial">
        <div className={styles.testimonialInner}>
          <div className={styles.testimonialAside}>
            <p className={styles.quoteMark} aria-hidden="true">&ldquo;</p>
            <p className={styles.testimonialLabel}>What clients say</p>
          </div>
          <figure style={{ margin: 0 }}>
            <blockquote style={{ margin: 0 }}>
              <p className={styles.quoteText}>{TESTIMONIAL.quote}</p>
            </blockquote>
            <hr className={styles.quoteDivider} />
            <figcaption>
              <p className={styles.quoteName}>{TESTIMONIAL.name}</p>
              <p className={styles.quoteMeta}>{TESTIMONIAL.location} · {TESTIMONIAL.meta}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.final} aria-labelledby="final-title">
        <div className={styles.finalInner}>
          <h2 id="final-title" className={styles.finalTitle}>{t('home.finalTitle')}</h2>
          <p className={styles.finalBody}>{t('home.finalBody')}</p>
          <NextLink href="/request" className={styles.finalCta}>{t('home.finalCta')}</NextLink>
          <p className={styles.finalHelper}>{t('home.finalHelper')}</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <NextLink href="/" className={styles.navLogo} aria-label="Verliks">
              <Image src="/vlogo.PNG" alt="" width={30} height={30} style={{ objectFit: 'contain' }} />
              <span className={styles.footerBrandName}>Verliks</span>
            </NextLink>
            <p className={styles.footerTagline}>{t('home.footerTagline')}</p>
            <div className={styles.footerSocials}>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><IcFacebook /></a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><IcInstagram /></a>
            </div>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerPlatform')}</p>
            <ul>
              <li><a href="#how-it-works">{t('home.footerHowItWorks')}</a></li>
              <li><a href="#for-pros">{t('home.footerForPros')}</a></li>
              <li><NextLink href="/about">{t('home.footerTrust')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerSupport')}</NextLink></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerPros')}</p>
            <ul>
              <li><a href="#for-pros">{t('home.footerHowItWorks')}</a></li>
              <li><NextLink href="/auth/register?role=cleaner">{t('home.footerPricing')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerHelp')}</NextLink></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerAbout')}</p>
            <ul>
              <li><NextLink href="/about">{t('home.footerOurStory')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerCareers')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerPress')}</NextLink></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerLegal')}</p>
            <ul>
              <li><NextLink href="/terms">{t('home.footerTerms')}</NextLink></li>
              <li><NextLink href="/privacy">{t('home.footerPrivacy')}</NextLink></li>
              <li><NextLink href="/terms">{t('home.footerTos')}</NextLink></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>{t('home.footerRights')}</span>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
