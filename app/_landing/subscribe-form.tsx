'use client';

import styles from '../landing-page.module.css';

export function SubscribeColumn() {
  return (
    <div className={`${styles['footer-col']} ${styles['footer-subscribe']}`}>
      <h4>Subscribe</h4>
      <p>Get to know about BrazilianClean, our updates and all news, straight to your inbox.</p>
      <form className={styles['subscribe-form']} onSubmit={e => e.preventDefault()}>
        <input type="email" placeholder="Your email address" />
        <button type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
