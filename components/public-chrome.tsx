import NextLink from 'next/link';
import Image from 'next/image';
import styles from './public-chrome.module.css';


/* Header and footer for the public server-rendered pages. The home page keeps
   its own, because its header is transparent over the hero photo and needs
   client state; these pages sit on white and do not. */

export const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const btn = {
  base: styles.btn,
  navy: `${styles.btn} ${styles.btnNavy}`,
  light: `${styles.btn} ${styles.btnLight}`,
  small: styles.btnSmall,
};

export function PublicFooter({ services }: { services: { slug: string; name: string }[] }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <NextLink href="/" className={styles.logo} aria-label="Verliks home">
            <Image src="/vlogo.PNG" alt="" width={34} height={34} className={styles.logoMark} />
            <span>verliks</span>
          </NextLink>
          <p className={styles.footerTagline}>
            Verliks connects people who need a cleaning with independent cleaners nearby.
          </p>
        </div>
        <nav className={styles.footerCol} aria-label="Services">
          <p className={styles.footerColTitle}>Services</p>
          <ul>
            {services.map(s => (
              <li key={s.slug}><NextLink href={`/services/${s.slug}`}>{s.name}</NextLink></li>
            ))}
            <li><NextLink href="/services">All services</NextLink></li>
          </ul>
        </nav>
        <nav className={styles.footerCol} aria-label="For clients">
          <p className={styles.footerColTitle}>For clients</p>
          <ul>
            <li><NextLink href="/request">Find cleaners</NextLink></li>
            <li><NextLink href="/">How it works</NextLink></li>
            <li><NextLink href="/auth/login">Sign in</NextLink></li>
          </ul>
        </nav>
        <nav className={styles.footerCol} aria-label="Company">
          <p className={styles.footerColTitle}>Company</p>
          <ul>
            <li><NextLink href="/for-cleaners">Become a cleaner</NextLink></li>
            <li><NextLink href="/about">About Verliks</NextLink></li>
            <li><NextLink href="/terms">Terms of use</NextLink></li>
            <li><NextLink href="/privacy">Privacy policy</NextLink></li>
          </ul>
        </nav>
      </div>
      <div className={styles.footerBottom}>
        © {new Date().getFullYear()} Verliks. Verliks connects clients with independent cleaning
        professionals and is not an employer or staffing agency.
      </div>
    </footer>
  );
}
