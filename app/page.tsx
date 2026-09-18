'use client';

import { useEffect, useState, useCallback, useId } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './platform-home.module.css';
import { useLocale } from '@/lib/i18n';
import SiteHeader from '@/components/site-header';
import { SERVICES } from '@/lib/services';

/* ── Icons: one family — 24px box, round caps and joins ── */
const svg = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const IcPin      = () => (<svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.7" {...svg}><path d="M20 10c0 6.5-8 12-8 12s-8-5.5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/></svg>);
const IcArrow    = () => (<svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
const IcChevL    = () => (<svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M15 18l-6-6 6-6"/></svg>);
const IcChevR    = () => (<svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" {...svg}><path d="M9 6l6 6-6 6"/></svg>);

/* The six services people ask for most. Each row links to its own page. */
const LEDGER = ['standard', 'deep', 'moving', 'post-work', 'tile-grout', 'commercial']
  .map(id => SERVICES.find(s => s.id === id)!)
  .filter(Boolean);

/* Declared at module level on purpose. It used to be defined inside HomePage,
   which gave it a new component identity on every render: each keystroke
   remounted the input and dropped focus after the first digit. */
function SearchForm({
  variant, value, onValue, onSubmit, showError, placeholder, cta, errorText,
}: {
  variant: 'dark' | 'light';
  value: string;
  onValue: (raw: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  showError: boolean;
  placeholder: string;
  cta: string;
  errorText: string;
}) {
  const errorId = useId();
  return (
    <div className={styles.searchWrap}>
      <form
        className={`${styles.search} ${variant === 'dark' ? styles.searchDark : styles.searchLight}`}
        onSubmit={onSubmit} role="search" noValidate
      >
        <label className={styles.searchField}>
          <IcPin />
          <input
            className={styles.searchInput}
            value={value}
            onChange={e => onValue(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? errorId : undefined}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
          />
        </label>
        <button type="submit" className={`${styles.btn} ${styles.searchBtn}`}>
          {cta} <IcArrow />
        </button>
      </form>
      {showError && <p id={errorId} role="alert" className={styles.searchError}>{errorText}</p>}
    </div>
  );
}

type Testimonial = { quote: string; name: string; city: string; rating: number };

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  const [zip, setZip]             = useState('');
  const [zipError, setZipError]   = useState<'hero' | 'final' | null>(null);
  const [reviews, setReviews]     = useState<Testimonial[]>([]);
  const [completedJobs, setJobs]  = useState(0);
  const [tIndex, setTIndex]       = useState(0);

  useEffect(() => { if (status === 'authenticated') router.replace('/dashboard'); }, [status, router]);

  // English-first landing (US market) — force English on the first visit of a session.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('verliks_lang_seen')) {
        sessionStorage.setItem('verliks_lang_seen', '1');
        if (locale !== 'en') setLocale('en');
      }
    } catch { /* storage unavailable */ }
  }, [locale, setLocale]);

  // Only real reviews and a real job count are shown. There is no mock
  // fallback: with no reviews the section is simply not rendered.
  useEffect(() => {
    fetch('/api/home-stats')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!d) return;
        if (Array.isArray(d.testimonials)) setReviews(d.testimonials);
        if (typeof d.completedJobs === 'number') setJobs(d.completedJobs);
      })
      .catch(() => {});
  }, []);



  // Digits only, capped at 5 — covers paste, autofill and keyboards that ignore inputMode.
  const handleZip = useCallback((raw: string) => {
    setZip(raw.replace(/\D/g, '').slice(0, 5));
    setZipError(null);
  }, []);

  const submitFrom = useCallback((which: 'hero' | 'final') => (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length > 0 && zip.length < 5) { setZipError(which); return; }
    setZipError(null);
    router.push(zip.length === 5 ? `/request?zip=${zip}` : '/request');
  }, [zip, router]);

  const current = reviews.length ? reviews[tIndex % reviews.length] : null;

  const searchCopy = {
    value: zip, onValue: handleZip,
    placeholder: t('home.searchPlaceholder'), cta: t('home.searchCta'), errorText: t('home.searchZipError'),
  };

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'Verliks',
    url: 'https://verliks.com', logo: 'https://verliks.com/logo-blue.png',
    description: 'Verliks connects people with ID-verified local cleaning professionals.',
    areaServed: 'US',
  };

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>{t('home.skipToContent')}</a>

      <SiteHeader onHome />

      <main id="main">
        {/* ═══ Hero ═══ */}
        <section data-hero className={styles.hero} aria-labelledby="hero-title">
          <Image
            src="/images/home/living-room.jpg" alt={t('home.heroImgAlt')}
            fill priority sizes="100vw" quality={80} className={styles.heroImg}
          />
          <div className={styles.heroShade} aria-hidden="true" />

          <div className={styles.heroContent}>
            <h1 id="hero-title" className={styles.heroTitle}>
              {t('home.heroTitleA')} {t('home.heroTitleB')}<br /><em>{t('home.heroTitleC')}</em>
            </h1>
            <p className={styles.heroBody}>{t('home.heroBody')}</p>
            <SearchForm variant="dark" {...searchCopy} onSubmit={submitFrom('hero')} showError={zipError === 'hero'} />
            <p className={styles.heroPro}>
              {t('home.heroProLine')}{' '}
              <NextLink href="/for-cleaners">{t('home.heroProLink')}</NextLink>
            </p>
          </div>
        </section>

        {/* ═══ How it works ═══ */}
        <section className={styles.split} id="how-it-works" aria-labelledby="hw-title">
          <div className={styles.splitMedia}>
            <Image src="/images/home/cloth.jpg" alt={t('home.hwImgAlt')} fill sizes="(max-width: 900px) 100vw, 50vw"
              quality={78} style={{ objectPosition: '22% 62%' }} />
          </div>
          <div className={styles.splitBody}>
            <h2 id="hw-title" className={styles.sectionTitle}>{t('home.hwTitle')}</h2>
            <dl className={styles.rows}>
              {[1, 2, 3, 4].map(n => (
                <div className={styles.row} key={n}>
                  <dt className={styles.rowTitle}>{t(`home.hwRow${n}Title`)}</dt>
                  <dd className={styles.rowBody}>{t(`home.hwRow${n}Body`)}</dd>
                </div>
              ))}
            </dl>
            <NextLink href="/request" className={`${styles.btn} ${styles.btnNavy}`}>
              {t('home.hwCta')} <IcArrow />
            </NextLink>
          </div>
        </section>

        {/* ═══ Trust ═══ */}
        <section className={`${styles.split} ${styles.splitReverse} ${styles.sectionCream}`} id="trust" aria-labelledby="trust-title">
          <div className={styles.splitMedia}>
            <Image src="/images/home/gloved-hand.jpg" alt={t('home.trustImgAlt')} fill sizes="(max-width: 900px) 100vw, 50vw"
              quality={78} style={{ objectPosition: '62% 50%' }} />
          </div>
          <div className={styles.splitBody}>
            <h2 id="trust-title" className={styles.sectionTitle}>{t('home.trustTitle')}</h2>
            <p className={styles.trustText}>{t('home.trust1')}</p>
            <p className={styles.trustText}>{t('home.trust2')}</p>
            <p className={styles.trustNote}>{t('home.trustNote')}</p>
          </div>
        </section>

        {/* ═══ Services ledger ═══ */}
        <section className={styles.section} id="services" aria-labelledby="svc-title">
          <div className={styles.wrap}>
            <div className={styles.ledgerHead}>
              <div>
                <h2 id="svc-title" className={styles.sectionTitle} style={{ marginTop: 0 }}>{t('home.svcTitle')}</h2>
                <p className={styles.ledgerIntro}>{t('home.svcIntro')}</p>
              </div>
              <NextLink href="/services" className={`${styles.btn} ${styles.btnNavy}`}>
                {t('home.svcAll')} <IcArrow />
              </NextLink>
            </div>

            <div className={styles.ledger}>
              {LEDGER.map(service => (
                <NextLink key={service.slug} href={`/services/${service.slug}`} className={styles.ledgerRow}>
                  <p className={styles.ledgerName}>{service.name}</p>
                  <p className={styles.ledgerScope}>{service.tagline}</p>
                  <span className={styles.ledgerGo} aria-hidden="true"><IcArrow /></span>
                </NextLink>
              ))}
            </div>

            <div className={styles.ledgerFoot}>
              <p className={styles.ledgerNote}>{t('home.svcNote')}</p>
            </div>

          </div>
        </section>

        {/* ═══ Reviews — real ones only ═══ */}
        {current && (
          <section className={`${styles.section} ${styles.reviews}`} id="reviews" aria-labelledby="re-title">
            <div className={styles.wrap}>
              <h2 id="re-title" className={styles.sectionTitle}>{t('home.reTitle')}</h2>
              <blockquote className={styles.reviewQuote}>&ldquo;{current.quote}&rdquo;</blockquote>
              <div className={styles.reviewStars} role="img" aria-label={`${current.rating} / 5`}>
                {'★'.repeat(Math.max(1, Math.min(5, current.rating)))}
              </div>
              <p className={styles.reviewName}>{current.name}</p>
              {current.city ? <p className={styles.reviewCity}>{current.city}</p> : null}
              {reviews.length > 1 && (
                <div className={styles.reviewNav}>
                  <button className={styles.reviewNavBtn} aria-label={t('home.rePrev')}
                    onClick={() => setTIndex(i => (i - 1 + reviews.length) % reviews.length)}><IcChevL /></button>
                  <button className={styles.reviewNavBtn} aria-label={t('home.reNext')}
                    onClick={() => setTIndex(i => (i + 1) % reviews.length)}><IcChevR /></button>
                </div>
              )}
              {completedJobs >= 100 && (
                <p className={styles.reviewMetric}>{t('home.reMetric', { n: completedJobs.toLocaleString('en-US') })}</p>
              )}
            </div>
          </section>
        )}

        {/* ═══ For cleaners ═══ */}
        <section className={styles.pro} id="for-pros" aria-labelledby="pro-title">
          <Image src="/images/home/mopping.jpg" alt="" fill sizes="100vw" quality={75} className={styles.proImg} />
          <div className={styles.proShade} aria-hidden="true" />
          <div className={`${styles.wrap} ${styles.proInner}`}>
            <div className={styles.proContent}>
              <h2 id="pro-title" className={styles.proTitle}>{t('home.proTitle')}</h2>
              <p className={styles.proBody}>{t('home.proBody')}</p>
              <ul className={styles.proList}>
                <li className={styles.proItem}>{t('home.proItem1')}</li>
                <li className={styles.proItem}>{t('home.proItem2')}</li>
                <li className={styles.proItem}>{t('home.proItem3')}</li>
              </ul>
              <NextLink href="/for-cleaners" className={`${styles.btn} ${styles.btnGold}`}>
                {t('home.proCta')} <IcArrow />
              </NextLink>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className={`${styles.section} ${styles.sectionCream}`} id="faq" aria-labelledby="faq-title">
          <div className={`${styles.wrap} ${styles.faqGrid}`}>
            <div className={styles.faqAside}>
              <h2 id="faq-title" className={styles.sectionTitle}>{t('home.faqTitle')}</h2>
              <p className={styles.faqAsideBody}>{t('home.faqIntro')}</p>
            </div>
            <div className={styles.faqList}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div className={styles.faqItem} key={n}>
                  <h3 className={styles.faqQ}>{t(`home.faqQ${n}`)}</h3>
                  <p className={styles.faqA}>{t(`home.faqA${n}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Final CTA ═══ */}
        <section className={`${styles.section} ${styles.sectionCream} ${styles.final}`} aria-labelledby="final-title">
          <div className={`${styles.wrap} ${styles.finalInner}`}>
            <h2 id="final-title" className={styles.sectionTitle} style={{ marginTop: 0 }}>{t('home.finalTitle')}</h2>
            <p className={styles.finalBody}>{t('home.finalBody')}</p>
            <SearchForm variant="light" {...searchCopy} onSubmit={submitFrom('final')} showError={zipError === 'final'} />
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <NextLink href="/" className={styles.logo} aria-label="Verliks">
              <Image src="/vlogo.PNG" alt="" width={34} height={34} className={styles.logoMark} />
              <span className={styles.logoWord}>verliks</span>
            </NextLink>
            <p className={styles.footerTagline}>{t('home.footerTagline')}</p>
          </div>
          <nav className={styles.footerCol} aria-label={t('home.footerClients')}>
            <p className={styles.footerColTitle}>{t('home.footerClients')}</p>
            <ul>
              <li><NextLink href="/request">{t('home.footerFindPros')}</NextLink></li>
              <li><NextLink href="/services">{t('home.footerServices')}</NextLink></li>
              <li><a href="#how-it-works">{t('home.footerHowItWorks')}</a></li>
              <li><a href="#trust">{t('home.footerSafety')}</a></li>
            </ul>
          </nav>
          <nav className={styles.footerCol} aria-label={t('home.footerPros')}>
            <p className={styles.footerColTitle}>{t('home.footerPros')}</p>
            <ul>
              <li><NextLink href="/for-cleaners">{t('home.footerBecomePro')}</NextLink></li>
              <li><NextLink href="/auth/login">{t('home.navSignIn')}</NextLink></li>
            </ul>
          </nav>
          <nav className={styles.footerCol} aria-label={t('home.footerCompany')}>
            <p className={styles.footerColTitle}>{t('home.footerCompany')}</p>
            <ul>
              <li><NextLink href="/about">{t('home.footerAbout')}</NextLink></li>
              <li><NextLink href="/terms">{t('home.footerTerms')}</NextLink></li>
              <li><NextLink href="/privacy">{t('home.footerPrivacy')}</NextLink></li>
            </ul>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <span>{t('home.footerRights')}</span>
        </div>
      </footer>
    </div>
  );
}
