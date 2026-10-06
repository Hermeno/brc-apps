import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import '../site.css';
import styles from '../informational.module.css';

export const metadata: Metadata = {
  title: 'Contact Verliks',
  description:
    'Questions about cleaning requests, service areas or a Verliks account? Reach the Verliks team at support@verliks.com.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className={`vsite ${styles.page}`}>
      <a className={styles.skipLink} href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1} data-inert-when-menu>
        <section className={styles.contactHero} aria-labelledby="contact-title">
          <div className={styles.container}>
            <nav className={`${styles.breadcrumb} ${styles.breadcrumbOnDark}`} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Contact</span>
            </nav>
            <div className={styles.contactHeroGrid}>
              <div>
                <p className={`${styles.eyebrow} ${styles.eyebrowOnDark}`}><span className={styles.eyebrowLine} /> We are here to help</p>
                <h1 id="contact-title" className={`${styles.heroTitle} ${styles.contactTitle}`}>Every good clean starts with <em>a clear answer.</em></h1>
              </div>
              <div className={styles.contactHeroAside}>
                <p>Have a question about a request, your area or how Verliks works? Write to the team and include the details that will help us understand it.</p>
                <a className={styles.contactEmail} href="mailto:support@verliks.com">
                  <Mail aria-hidden="true" size={24} strokeWidth={1.6} />
                  <span>support@verliks.com</span>
                  <ArrowUpRight aria-hidden="true" size={22} strokeWidth={1.6} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="contact-path-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> Find your next step</p>
              <h2 id="contact-path-title" className={styles.sectionTitle}>The right place for your question.</h2>
              <p className={styles.sectionIntro}>These paths take you straight to the part of Verliks you need.</p>
            </div>
            <div className={styles.pathList}>
              <Link href="/request" className={styles.pathItem}>
                <span className={styles.pathNumber}>01</span>
                <span><strong>Need a cleaner?</strong><small>Describe the work and start a free request.</small></span>
                <ArrowUpRight aria-hidden="true" size={22} />
              </Link>
              <Link href="/for-cleaners" className={styles.pathItem}>
                <span className={styles.pathNumber}>02</span>
                <span><strong>Work as a cleaner?</strong><small>See how local requests and fees work.</small></span>
                <ArrowUpRight aria-hidden="true" size={22} />
              </Link>
              <Link href="/auth/login" className={styles.pathItem}>
                <span className={styles.pathNumber}>03</span>
                <span><strong>Already have an account?</strong><small>Sign in to review requests, messages or your profile.</small></span>
                <ArrowUpRight aria-hidden="true" size={22} />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.contactDetail} aria-labelledby="contact-detail-title">
          <div className={`${styles.container} ${styles.contactDetailGrid}`}>
            <div>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> When you write</p>
              <h2 id="contact-detail-title" className={styles.sectionTitle}>A little context helps us help you.</h2>
            </div>
            <div>
              <p>For service area questions, include the ZIP code. For an existing request, include its reference and the email on your account. For a service question, tell us what kind of cleaning you need.</p>
              <a className={styles.buttonPrimary} href="mailto:support@verliks.com">Email the Verliks team <ArrowRight aria-hidden="true" size={18} /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
