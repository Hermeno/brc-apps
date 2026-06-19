'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../landing-page.module.css';

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles['nav-inner']}>
        <Link href="/" className={styles.brand}>
          Brazilian<span>Clean</span>
        </Link>
        <div className={styles['nav-links']}>
          <Link href="/">Home</Link>
          <a href="#about">About Us</a>
          <a href="#services">Our Services</a>
          <a href="#why-us">Why Us</a>
          <Link href="/request" className={styles['nav-quote']}>Get a Quote</Link>
          <a href="#testimonials">Reviews</a>
          <a href="mailto:support@brazilianclean.com">Contact Us</a>
        </div>
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.active : ''}`}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
      <div className={`${styles['mobile-menu']} ${mobileOpen ? styles.open : ''}`}>
        <Link href="/" onClick={close}>Home</Link>
        <a href="#about" onClick={close}>About Us</a>
        <a href="#services" onClick={close}>Our Services</a>
        <a href="#why-us" onClick={close}>Why Us</a>
        <Link href="/request" onClick={close}>Get a Quote</Link>
        <a href="#testimonials" onClick={close}>Reviews</a>
        <a href="mailto:support@brazilianclean.com" onClick={close}>Contact Us</a>
      </div>
    </nav>
  );
}
