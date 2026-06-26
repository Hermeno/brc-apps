'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './platform-home.module.css';
import { useT } from '@/lib/i18n';

const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconMsg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function PlatformHomePage() {
  const { status } = useSession();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  const FEATURES = [
    { Icon: IconBolt,   title: t('home.f1t'), desc: t('home.f1d') },
    { Icon: IconShield, title: t('home.f2t'), desc: t('home.f2d') },
    { Icon: IconCard,   title: t('home.f3t'), desc: t('home.f3d') },
    { Icon: IconPin,    title: t('home.f4t'), desc: t('home.f4d') },
    { Icon: IconMsg,    title: t('home.f5t'), desc: t('home.f5d') },
    { Icon: IconChart,  title: t('home.f6t'), desc: t('home.f6d') },
  ];

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <NextLink href="/" className={styles.navLogo}>
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} className={styles.navLogoImg} />
            <span className={styles.navLogoText}>Brazilian<span>Clean</span></span>
          </NextLink>
          <ul className={styles.navLinks}>
            <li><a href="#features">{t('home.featuresLabel')}</a></li>
            <li><a href="#for-who">{t('home.hw02Title')}</a></li>
            <li><a href="#how-it-works">{t('home.stepsLabel')}</a></li>
          </ul>
          <div className={styles.navActions}>
            <NextLink href="/auth/login" className={styles.navSignIn}>{t('home.heroSignIn').split(' ')[0]}</NextLink>
            <NextLink href="/request" className={styles.navCta}>{t('home.heroCta')}</NextLink>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBgImg} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroH1}>
            {t('home.heroH1a')}<br />
            <em>{t('home.heroH1b')}</em>
          </h1>
          <p className={styles.heroSub}>{t('home.heroSub')}</p>
          <div className={styles.heroActions}>
            <NextLink href="/request" className={styles.heroBtnDark}>
              {t('home.heroCta')} <span className={styles.heroArrow}>&rarr;</span>
            </NextLink>
          </div>
        </div>
        <div className={styles.heroBorder} />
      </section>

      {/* ── Statement + Stats ── */}
      <section className={styles.statement}>
        <div className={styles.statementInner}>
          <p className={styles.statementQuote}>
            {t('home.quoteText').split('—').map((part, i) =>
              i === 1 ? <em key={i}>—{part}</em> : part
            )}
          </p>
          <div className={styles.statementStats}>
            {[
              { val: '500+',   desc: t('home.statCleaner') },
              { val: '2,400+', desc: t('home.statBookings') },
              { val: '4.9★',  desc: t('home.statRating') },
            ].map(s => (
              <div key={s.val} className={styles.statRow}>
                <span className={styles.statNum}>{s.val}</span>
                <span className={styles.statDesc}>
                  {s.desc.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features} id="features">
        <div className={styles.featuresInner}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>{t('home.featuresTitle')}</h2>
            <p className={styles.featuresSub}>{t('home.featuresSub')}</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className={styles.featureItem}>
                <div className={styles.featureItemIcon}><Icon /></div>
                <h3 className={styles.featureItemTitle}>{title}</h3>
                <p className={styles.featureItemDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For who ── */}
      <section className={styles.forWho} id="for-who">
        <div className={styles.forWhoInner}>
          <p className={styles.forWhoLabel}>{t('home.forWhoLabel')}</p>
          <div className={styles.forWhoGrid}>

            <div className={`${styles.forWhoCard} ${styles.forWhoCardDark}`}>
              <p className={`${styles.forWhoNum} ${styles.forWhoNumWhite}`}>{t('home.hw01')}</p>
              <h3 className={`${styles.forWhoTitle} ${styles.forWhoTitleWhite}`}>{t('home.hw01Title')}</h3>
              <p className={`${styles.forWhoDesc} ${styles.forWhoDescWhite}`}>{t('home.hw01Desc')}</p>
              <ul className={styles.forWhoBullets}>
                {(['home.hw01b1','home.hw01b2','home.hw01b3','home.hw01b4'] as const).map(k => (
                  <li key={k} className={`${styles.forWhoBullet} ${styles.forWhoBulletWhite}`}>
                    <span className={`${styles.forWhoBulletCheck} ${styles.forWhoBulletCheckWhite}`}>—</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
              <NextLink href="/request" className={styles.forWhoLinkWhite}>
                {t('home.hw01Cta')} <IconArrow />
              </NextLink>
            </div>

            <div className={styles.forWhoCard}>
              <p className={styles.forWhoNum}>{t('home.hw02')}</p>
              <h3 className={styles.forWhoTitle}>{t('home.hw02Title')}</h3>
              <p className={styles.forWhoDesc}>{t('home.hw02Desc')}</p>
              <ul className={styles.forWhoBullets}>
                {(['home.hw02b1','home.hw02b2','home.hw02b3','home.hw02b4'] as const).map(k => (
                  <li key={k} className={styles.forWhoBullet}>
                    <span className={styles.forWhoBulletCheck}>—</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
              <NextLink href="/auth/register?role=cleaner" className={styles.forWhoLink}>
                {t('home.hw02Cta')} <IconArrow />
              </NextLink>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.steps} id="how-it-works">
        <div className={styles.stepsInner}>
          <div className={styles.stepsHeader}>
            <h2 className={styles.stepsTitle}>{t('home.stepsTitle')}</h2>
            <p className={styles.stepsSub}>{t('home.stepsSub')}</p>
          </div>
          <div className={styles.stepsGrid}>
            {([
              { n: 'home.s1n', title: 'home.s1t', desc: 'home.s1d' },
              { n: 'home.s2n', title: 'home.s2t', desc: 'home.s2d' },
              { n: 'home.s3n', title: 'home.s3t', desc: 'home.s3d' },
            ] as const).map(s => (
              <div key={s.n} className={styles.stepItem}>
                <p className={styles.stepN}>{t(s.n)}</p>
                <h4 className={styles.stepTitle}>{t(s.title)}</h4>
                <p className={styles.stepDesc}>{t(s.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            {t('home.ctaTitle').split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
          </h2>
          <div className={styles.ctaRight}>
            <p className={styles.ctaDesc}>{t('home.ctaDesc')}</p>
            <NextLink href="/request" className={styles.ctaBtnWhite}>
              {t('home.ctaBtn')} <IconArrow />
            </NextLink>
            <NextLink href="/auth/login" className={styles.ctaBtnOutline}>
              {t('home.ctaSignIn')} &rarr;
            </NextLink>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <NextLink href="/" className={styles.footerLogo}>
              <Image src="/2.png" alt="BrazilianClean" width={26} height={26} className={styles.footerLogoImg} />
              <span className={styles.footerLogoText}>Brazilian<span>Clean</span></span>
            </NextLink>
            <p className={styles.footerDesc}>
              The professional cleaning platform trusted by homeowners and cleaners across the US.
            </p>
          </div>
          <div>
            <p className={styles.footerColTitle}>Platform</p>
            <NextLink href="/auth/login"    className={styles.footerColLink}>Sign in</NextLink>
            <NextLink href="/request" className={styles.footerColLink}>Create account</NextLink>
            <a href="#features"             className={styles.footerColLink}>Features</a>
            <a href="#how-it-works"         className={styles.footerColLink}>How it works</a>
          </div>
          <div>
            <p className={styles.footerColTitle}>For cleaners</p>
            <NextLink href="/auth/register?role=cleaner" className={styles.footerColLink}>Join as cleaner</NextLink>
            <NextLink href="/auth/login"                 className={styles.footerColLink}>Cleaner login</NextLink>
          </div>
          <div>
            <p className={styles.footerColTitle}>Company</p>
            <NextLink href="/landing" className={styles.footerColLink}>Public website</NextLink>
            <NextLink href="/terms"   className={styles.footerColLink}>Terms of service</NextLink>
            <NextLink href="/privacy" className={styles.footerColLink}>Privacy policy</NextLink>
            <a href="mailto:support@brazilianclean.com" className={styles.footerColLink}>Support</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>© {new Date().getFullYear()} BrazilianClean. All rights reserved.</span>
          <span className={styles.footerCopy}>Built for professionals.</span>
        </div>
      </footer>

    </div>
  );
}
