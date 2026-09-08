'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './platform-home.module.css';
import { useLocale } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

/* ── Inline icons (single family, consistent stroke) ── */
const IcPin = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const IcShield = () => (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>);
const IcCard = () => (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>);
const IcChat = () => (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const IcStar = () => (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const IcUsers = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IcShieldSm = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const IcChart = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="6" y1="20" x2="6" y2="13"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="9"/></svg>);
const IcArrow = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
const IcChevL = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>);
const IcChevR = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>);
const IcMenu = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>);
const IcClose = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>);
const IcInstagram = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>);
const IcFacebook = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"/></svg>);
const IcTwitter = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.9-9L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z"/></svg>);
const IcWhatsapp = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.5A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 1112 20zm4.5-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.9.9-.9 2.1-.6 3.2.4 1.5 1.4 2.9 3.6 4 .6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2z"/></svg>);
const BadgeGoogle = () => (<svg width="132" height="40" viewBox="0 0 135 40" aria-hidden="true"><rect width="135" height="40" rx="6" fill="#1E3A5F"/><path d="M20 12.2v15.6c0 .6.5.9 1 .6l13.6-7.8c.5-.3.5-1 0-1.2L21 11.6c-.5-.3-1 0-1 .6z" fill="#D4AF37"/><text x="46" y="16" fill="#fff" fontSize="8" fontFamily="sans-serif">GET IT ON</text><text x="46" y="29" fill="#fff" fontSize="13" fontWeight="700" fontFamily="sans-serif">Google Play</text></svg>);
const BadgeApple = () => (<svg width="120" height="40" viewBox="0 0 120 40" aria-hidden="true"><rect width="120" height="40" rx="6" fill="#1E3A5F"/><path d="M25 20.3c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.5 1.2-2.5s-2.3-.9-2.3-3.6zm-2.3-6.5c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.1z" fill="#fff"/><text x="34" y="16" fill="#fff" fontSize="8" fontFamily="sans-serif">Download on the</text><text x="34" y="29" fill="#fff" fontSize="13" fontWeight="700" fontFamily="sans-serif">App Store</text></svg>);

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState(false);
  const [testimonials, setTestimonials] = useState<{ quote: string; name: string; city: string; rating: number }[] | null>(null);
  const [completedJobs, setCompletedJobs] = useState<number>(0);
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => { if (status === 'authenticated') router.replace('/dashboard'); }, [status, router]);

  // English-first landing (US market) — force English on the first visit of a session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!sessionStorage.getItem('verliks_lang_seen')) {
        sessionStorage.setItem('verliks_lang_seen', '1');
        if (locale !== 'en') setLocale('en');
      }
    } catch { /* storage unavailable */ }
  }, [locale, setLocale]);

  // Real reviews + completed-job count; fall back to mockup until the DB has data.
  useEffect(() => {
    fetch('/api/home-stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        if (Array.isArray(d.testimonials) && d.testimonials.length) setTestimonials(d.testimonials);
        if (typeof d.completedJobs === 'number') setCompletedJobs(d.completedJobs);
      })
      .catch(() => {});
  }, []);

  const fallbackTestimonials = [
    { quote: t('home.reFbQuote1'), name: t('home.reFbName1'), city: t('home.reFbCity1'), rating: 5 },
    { quote: t('home.reFbQuote2'), name: t('home.reFbName2'), city: t('home.reFbCity2'), rating: 5 },
    { quote: t('home.reFbQuote3'), name: t('home.reFbName3'), city: t('home.reFbCity3'), rating: 5 },
  ];
  const reviews = testimonials && testimonials.length ? testimonials : fallbackTestimonials;
  const current = reviews[tIndex % reviews.length];
  // Real count once it's meaningful; otherwise the mockup figure from the reference.
  const metricNum = completedJobs >= 100 ? completedJobs : 10000;

  // The input only ever holds digits, so a partial ZIP is the one bad state
  // left. Catch it here instead of sending a malformed value to /request.
  const submitSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length > 0 && zip.length < 5) { setZipError(true); return; }
    setZipError(false);
    router.push(zip.length === 5 ? `/request?zip=${zip}` : '/request');
  }, [zip, router]);

  // Strip anything that isn't a digit and cap at 5 — paste, autofill and
  // keyboards that ignore inputMode all land here.
  const handleZipChange = useCallback((raw: string) => {
    setZip(raw.replace(/\D/g, '').slice(0, 5));
    setZipError(false);
  }, []);

  const SearchForm = () => (
    <div>
      <form className={styles.search} onSubmit={submitSearch} role="search" noValidate>
        <label className={styles.searchField}>
          <IcPin />
          <input
            className={styles.searchInput}
            value={zip}
            onChange={e => handleZipChange(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            aria-invalid={zipError || undefined}
            aria-describedby={zipError ? 'zip-error' : undefined}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
          />
        </label>
        <button type="submit" className={styles.searchBtn}>{t('home.searchCta')}</button>
      </form>
      {zipError && (
        <p id="zip-error" role="alert" className={styles.searchError}>{t('home.searchZipError')}</p>
      )}
    </div>
  );

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'Verliks',
    url: 'https://verliks.com', logo: 'https://verliks.com/logo-blue.png',
    description: 'Verliks connects people with verified local cleaning professionals. Find a trusted pro near you.',
    areaServed: 'US',
  };

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>{t('home.skipToContent')}</a>

      {/* ── Header ── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <NextLink href="/" className={styles.logo} aria-label="Verliks">
            <Image src="/vlogo.PNG" alt="" width={34} height={34} className={styles.logoMark} priority />
            <span className={styles.logoWord}>verliks</span>
          </NextLink>
          <ul className={styles.navLinks}>
            <li><a href="#for-clients">{t('home.navClients')}</a></li>
            <li><NextLink href="/for-cleaners">{t('home.navPros')}</NextLink></li>
            <li><a href="#how-it-works">{t('home.navHowItWorks')}</a></li>
            <li><a href="#trust">{t('home.navSafety')}</a></li>
            <li><NextLink href="/about">{t('home.navHelp')}</NextLink></li>
          </ul>
          <div className={styles.navRight}>
            <LanguageSwitcher />
            <NextLink href="/auth/login" className={styles.navSignIn}>{t('home.navSignIn')}</NextLink>
            <NextLink href="/request" className={styles.navCta}>{t('home.navCta')}</NextLink>
          </div>
          <button className={styles.navMenuBtn} onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? t('home.menuClose') : t('home.menuOpen')} aria-expanded={menuOpen}>
            {menuOpen ? <IcClose /> : <IcMenu />}
          </button>
        </div>
        <nav className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`} aria-label="Mobile">
          <a href="#for-clients" onClick={() => setMenuOpen(false)}>{t('home.navClients')}</a>
          <NextLink href="/for-cleaners" onClick={() => setMenuOpen(false)}>{t('home.navPros')}</NextLink>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{t('home.navHowItWorks')}</a>
          <a href="#trust" onClick={() => setMenuOpen(false)}>{t('home.navSafety')}</a>
          <NextLink href="/auth/login" onClick={() => setMenuOpen(false)}>{t('home.navSignIn')}</NextLink>
          <NextLink href="/request" className={styles.mobileCta} style={{ display: 'block', padding: '13px 4px' }} onClick={() => setMenuOpen(false)}>{t('home.navCta')}</NextLink>
        </nav>
      </header>

      <main id="main">
        {/* ── Hero ── */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className={`${styles.eyebrow} ${styles.heroEyebrow}`}>{t('home.heroEyebrow')}</p>
              <h1 id="hero-title" className={styles.heroTitle}>
                {t('home.heroTitleA')}<br />{t('home.heroTitleB')}<br /><span className={styles.orange}>{t('home.heroTitleC')}</span>
              </h1>
              <p className={styles.heroBody}>{t('home.heroBody')}</p>
              <SearchForm />
            </div>
            <div className={styles.heroImageWrap}>
              <Image src="/process-bg.jpg" alt={t('home.heroImgAlt')} fill sizes="(max-width: 900px) 100vw, 55vw" style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className={styles.trustbar} id="trust" aria-label="Why Verliks">
          <div className={styles.trustGrid}>
            {[
              { Icon: IcShield, title: t('home.tb1Title'), body: t('home.tb1Body') },
              { Icon: IcCard,   title: t('home.tb2Title'), body: t('home.tb2Body') },
              { Icon: IcChat,   title: t('home.tb3Title'), body: t('home.tb3Body') },
              { Icon: IcStar,   title: t('home.tb4Title'), body: t('home.tb4Body') },
            ].map((c, i) => (
              <div className={styles.trustCol} key={i}>
                <span className={styles.trustIcon}><c.Icon /></span>
                <div>
                  <p className={styles.trustColTitle}>{c.title}</p>
                  <p className={styles.trustColBody}>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className={styles.section} id="how-it-works" aria-labelledby="hw-title">
          <div className={styles.hwInner}>
            <div>
              <p className={`${styles.eyebrow} ${styles.sectionEyebrow}`}>{t('home.hwEyebrow')}</p>
              <h2 id="hw-title" className={styles.sectionTitle}>{t('home.hwTitleA')}<br />{t('home.hwTitleB')}</h2>
            </div>
            <div className={styles.hwSteps}>
              {[
                { n: '01', title: t('home.s1Title'), body: t('home.s1Body') },
                { n: '02', title: t('home.s2Title'), body: t('home.s2Body') },
                { n: '03', title: t('home.s3Title'), body: t('home.s3Body') },
                { n: '04', title: t('home.s4Title'), body: t('home.s4Body') },
              ].map(s => (
                <div key={s.n}>
                  <div className={styles.hwStepNum}>{s.n}</div>
                  <h3 className={styles.hwStepTitle}>{s.title}</h3>
                  <p className={styles.hwStepBody}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Real experiences ── */}
        <section className={styles.section} id="for-clients" aria-labelledby="re-title" style={{ paddingTop: 0 }}>
          <div className={styles.reInner}>
            <div className={styles.reLeft}>
              <div className={styles.reHead}>
                <p className={`${styles.eyebrow} ${styles.sectionEyebrow}`}>{t('home.reEyebrow')}</p>
                <h2 id="re-title" className={styles.sectionTitle}>{t('home.reTitleA')}<br />{t('home.reTitleB')}</h2>
              </div>
              <div className={styles.reCard}>
                <span className={styles.reQuoteMark} aria-hidden="true">&ldquo;</span>
                <p className={styles.reQuote}>{current.quote}</p>
                <div className={styles.reStars} aria-label={`${current.rating} / 5`}>{'★'.repeat(Math.max(1, Math.min(5, current.rating)))}</div>
                <p className={styles.reName}>{current.name}</p>
                {current.city ? <p className={styles.reCity}>{current.city}</p> : null}
                <div className={styles.reNav}>
                  <button className={styles.reNavBtn} aria-label={t('home.rePrev')} onClick={() => setTIndex(i => (i - 1 + reviews.length) % reviews.length)}><IcChevL /></button>
                  <button className={styles.reNavBtn} aria-label={t('home.reNext')} onClick={() => setTIndex(i => (i + 1) % reviews.length)}><IcChevR /></button>
                </div>
              </div>
            </div>
            <div>
              <div className={styles.rePhotos}>
                <div className={styles.rePhoto}><Image src="/process-bg.jpg" alt={t('home.rePhoto1Alt')} fill sizes="220px" style={{ objectFit: 'cover', objectPosition: 'left top' }} /></div>
                <div className={styles.rePhoto}><Image src="/process-bg.jpg" alt={t('home.rePhoto2Alt')} fill sizes="220px" style={{ objectFit: 'cover', objectPosition: 'center' }} /></div>
                <div className={styles.rePhoto}><Image src="/process-bg.jpg" alt={t('home.rePhoto3Alt')} fill sizes="220px" style={{ objectFit: 'cover', objectPosition: 'right bottom' }} /></div>
              </div>
              <p className={styles.reMetric}>{t('home.reMetric', { n: metricNum.toLocaleString('en-US') })}</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── For professionals band ── */}
      <section className={styles.pro} id="for-pros" aria-labelledby="pro-title">
        <div className={styles.proImageWrap}>
          <Image src="/process-bg.jpg" alt={t('home.proImgAlt')} fill sizes="(max-width: 900px) 100vw, 32vw" style={{ objectFit: 'cover', objectPosition: 'left center' }} />
        </div>
        <div className={styles.proContent}>
          <p className={`${styles.eyebrow} ${styles.proEyebrow}`}>{t('home.proEyebrow')}</p>
          <h2 id="pro-title" className={styles.proTitle}>{t('home.proTitle')}</h2>
          <p className={styles.proBody}>{t('home.proBody')}</p>
          <div className={styles.proRow}>
            <div className={styles.proItems}>
              <div className={styles.proItem}><IcUsers /><span className={styles.proItemText}>{t('home.proItem1')}</span></div>
              <div className={styles.proItem}><IcShieldSm /><span className={styles.proItemText}>{t('home.proItem2')}</span></div>
              <div className={styles.proItem}><IcChart /><span className={styles.proItemText}>{t('home.proItem3')}</span></div>
            </div>
            <NextLink href="/for-cleaners" className={styles.proCta}>{t('home.proCta')} <IcArrow /></NextLink>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.final} aria-labelledby="final-title">
        <div className={styles.finalPhoto}>
          <Image src="/process-bg.jpg" alt="" fill sizes="34vw" style={{ objectFit: 'cover', objectPosition: 'right center' }} />
        </div>
        <div className={styles.finalInner}>
          <h2 id="final-title" className={styles.finalTitle}>{t('home.finalTitle')}</h2>
          <p className={styles.finalBody}>{t('home.finalBody')}</p>
          <SearchForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <NextLink href="/" className={styles.logo} aria-label="Verliks">
            <Image src="/vlogo.PNG" alt="" width={34} height={34} className={styles.logoMark} priority />
            <span className={styles.logoWord}>verliks</span>
          </NextLink>
            <p className={styles.footerTagline}>{t('home.footerTagline')}</p>
            <div className={styles.footerSocials}>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><IcInstagram /></a>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><IcFacebook /></a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><IcTwitter /></a>
              <a href="https://wa.me/" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><IcWhatsapp /></a>
            </div>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerClients')}</p>
            <ul>
              <li><NextLink href="/request">{t('home.footerFindPros')}</NextLink></li>
              <li><a href="#how-it-works">{t('home.footerHowItWorks')}</a></li>
              <li><a href="#trust">{t('home.footerSafety')}</a></li>
              <li><NextLink href="/about">{t('home.footerHelp')}</NextLink></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerPros')}</p>
            <ul>
              <li><NextLink href="/for-cleaners">{t('home.footerBecomePro')}</NextLink></li>
              <li><a href="#how-it-works">{t('home.footerHowItWorks')}</a></li>
              <li><NextLink href="/about">{t('home.footerTips')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerHelp')}</NextLink></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>{t('home.footerCompany')}</p>
            <ul>
              <li><NextLink href="/about">{t('home.footerAbout')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerCareers')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerPress')}</NextLink></li>
              <li><NextLink href="/about">{t('home.footerContact')}</NextLink></li>
            </ul>
          </div>
          <div className={`${styles.footerCol} ${styles.footerBadgesCol}`}>
            <p className={styles.footerColTitle}>{t('home.footerGetApp')}</p>
            <div className={styles.footerBadges}>
              <a href="#" className={styles.footerBadge} aria-label="Google Play"><BadgeGoogle /></a>
              <a href="#" className={styles.footerBadge} aria-label="App Store"><BadgeApple /></a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>{t('home.footerRights')}</span>
          <div className={styles.footerLegal}>
            <NextLink href="/terms">{t('home.footerTerms')}</NextLink>
            <NextLink href="/privacy">{t('home.footerPrivacy')}</NextLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
