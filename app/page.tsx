import Link from 'next/link';
import styles from './landing-page.module.css';
import { NavBar } from './_landing/nav-bar';
import { ServiceTabs } from './_landing/service-tabs';
import { WhyTabs } from './_landing/why-tabs';
import { SubscribeColumn } from './_landing/subscribe-form';
import { prisma } from '@/lib/prisma';

async function getHeroVideoUrl(): Promise<string | null> {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
    return config?.heroVideoUrl ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const heroVideoUrl = await getHeroVideoUrl();

  return (
    <div className={styles.wrapper}>

      {/* ── Top Bar ── */}
      <div className={styles['top-bar']}>
        <div className={styles['top-bar-inner']}>
          <div className={styles['top-bar-contact']}>
            <a href="tel:+18005551234" className={styles['top-contact-item']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>+1 800 555 1234</span>
              <small>24 x 7 Helpline</small>
            </a>
          </div>
          <div className={styles['top-bar-track']}>
            <Link href="/auth/login" className={styles['top-contact-item']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>Track Your Booking</span>
              <small>Spot Your Cleaner</small>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Navbar (client — hamburger state) ── */}
      <NavBar />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles['hero-bg']} />
        <div className={styles['hero-overlay']} />
        <div className={styles['hero-content']}>
          <p className={styles['hero-eyebrow']}>Trusted by homeowners across the US</p>
          <h1>
            <span className={styles['hero-sub-title']}>Cleaning Excellence,</span>
            Around Your Home
          </h1>
          <Link href="/request" className={styles['btn-hero']}>
            Book Now
          </Link>
        </div>
      </section>

      {/* ── Services Tab Bar (client — tab state) ── */}
      <ServiceTabs />

      {/* ── Why Choose Us (client — tab state) ── */}
      <WhyTabs />

      {/* ── Hero Video Section ── */}
      {heroVideoUrl && (
        <section className={styles['video-section']}>
          <div className={styles['video-section-inner']}>
            <div className={styles['video-section-header']}>
              <h2>See Us in Action</h2>
              <p>Watch how our professional cleaners deliver spotless results — every single time.</p>
            </div>
            <div className={styles['video-wrapper']}>
              <video src={heroVideoUrl} controls playsInline preload="metadata" />
            </div>
          </div>
        </section>
      )}

      {/* ── Difference Section ── */}
      <section className={styles.difference} id="about">
        <div className={`${styles.container} ${styles['difference-grid']}`}>
          <div className={styles['difference-text']}>
            <h2>A Cleaning Company<br />With a Difference.<br /><span>Innovation.</span></h2>
            <p>BrazilianClean is one of the leader groups in the home cleaning industry as it continues to expand its horizons, by providing innovative solutions, supported by bold, resolute and decisive action. We are aiming with confidence, to be the best professional cleaning provider.</p>
            <div className={styles['founder-credit']}>
              <strong>ANWAR TAHER</strong>
              <span>Founder &amp; Director</span>
            </div>
          </div>
          <div className={styles['difference-cards']}>
            <div className={styles['diff-card']}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" alt="Who we are" />
              <div className={styles['diff-card-body']}>
                <div style={{ flex: 1 }}>
                  <h4>WHO WE ARE</h4>
                  <p>BrazilianClean is one of the leader groups in the home cleaning industry as it continues to expand its horizons, providing professional, vetted cleaning services.</p>
                </div>
                <a href="#about" className={styles['diff-card-btn']}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
            <div className={styles['diff-card']}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80" alt="Excellence redefined" />
              <div className={styles['diff-card-body']}>
                <div style={{ flex: 1 }}>
                  <h4>EXCELLENCE REDEFINED</h4>
                  <p>BrazilianClean is one of the leader groups in the home cleaning industry as it continues to expand its horizons, delivering unmatched results every time.</p>
                </div>
                <a href="#services" className={styles['diff-card-btn']}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark Services Section ── */}
      <section className={styles['dark-services']}>
        <div className={styles['dark-services-inner']}>
          <div className={styles['dark-services-headline']}>
            <h2>Unmatched<br />Services.<br />Unmatched<br />Excellence.<br /><span>Innovation.</span></h2>
            <Link href="/request" className={styles['circle-btn']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className={styles['dark-services-grid']}>
            {([
              {
                label: 'STANDARD CLEANING',
                desc: 'Provides professional cleaning services to meet up with your household needs, delivering your home fresh and safe to its top condition.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
              },
              {
                label: 'DEEP CLEANING',
                desc: 'Provides comprehensive cleaning services to meet up with your transportation needs, delivering your home spotless and safe to its finest condition.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
              },
              {
                label: 'MOVE IN/OUT',
                desc: 'Provides professional transition cleaning services to meet up with your moving needs, delivering your home fresh and safe to its final destination.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
              },
              {
                label: 'POST-CONSTRUCTION',
                desc: "Provides specialist builder's cleaning services to meet up with your renovation needs, delivering your space dust-free and safe to its final state.",
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
              },
              {
                label: 'OFFICE CLEANING',
                desc: 'Provides commercial cleaning services to meet up with your office needs, delivering your workspace clean and safe to its finest standard.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
              },
            ] as { label: string; desc: string; icon: React.ReactNode }[]).map(svc => (
              <div key={svc.label} className={styles['dark-svc-card']}>
                <div className={styles['dark-svc-icon']}>{svc.icon}</div>
                <h4>{svc.label}</h4>
                <p>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className={styles['stats-section']}>
        <div className={`${styles.container} ${styles['stats-grid']}`}>
          <div className={styles['stats-numbers']}>
            {([
              { val: '12',    label: 'Cities\nCovered' },
              { val: '2,400+', label: 'Satisfied\nClients' },
              { val: '500+',  label: 'Verified\nCleaners' },
              { val: '4.9★',  label: 'Average\nRating' },
            ] as { val: string; label: string }[]).map(s => (
              <div key={s.val} className={styles['stat-item']}>
                <span className={styles['stat-val']}>{s.val}</span>
                <span className={styles['stat-label']}>
                  {s.label.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
                </span>
              </div>
            ))}
          </div>
          <div className={styles['stats-map']}>
            <svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg" className={styles['world-map-svg']}>
              <ellipse cx="220" cy="220" rx="180" ry="120" fill="#c8d8e8" opacity="0.5"/>
              <ellipse cx="460" cy="280" rx="140" ry="100" fill="#c8d8e8" opacity="0.4"/>
              <ellipse cx="680" cy="200" rx="160" ry="120" fill="#c8d8e8" opacity="0.45"/>
              <ellipse cx="300" cy="360" rx="100" ry="60" fill="#c8d8e8" opacity="0.3"/>
              <ellipse cx="520" cy="400" rx="80" ry="50" fill="#c8d8e8" opacity="0.3"/>
              <ellipse cx="750" cy="370" rx="90" ry="55" fill="#c8d8e8" opacity="0.35"/>
              <circle cx="220" cy="240" r="8" fill="#1F6FEA"/>
              <circle cx="220" cy="240" r="16" fill="#1F6FEA" opacity="0.2"/>
              <circle cx="380" cy="200" r="6" fill="#1F6FEA"/>
              <circle cx="600" cy="180" r="6" fill="#1F6FEA"/>
              <circle cx="480" cy="310" r="5" fill="#1F6FEA"/>
              <circle cx="730" cy="220" r="5" fill="#1F6FEA"/>
              <line x1="220" y1="240" x2="380" y2="200" stroke="#1F6FEA" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3"/>
              <line x1="380" y1="200" x2="600" y2="180" stroke="#1F6FEA" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3"/>
              <line x1="220" y1="240" x2="480" y2="310" stroke="#1F6FEA" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3"/>
              <line x1="600" y1="180" x2="730" y2="220" stroke="#1F6FEA" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={styles.testimonials} id="testimonials">
        <div className={styles.container}>
          <h2 className={styles['section-center-title']}>What Our Clients Say</h2>
          <p className={styles['section-center-sub']}>Homeowners across the US trust BrazilianClean for consistent, high-quality results — every time.</p>
          <div className={styles['testimonials-grid']}>
            {([
              { initials: 'SM', name: 'Sarah M.', location: 'Miami, FL · Standard Cleaning', text: "I've been using BrazilianClean for 6 months and it's completely changed my routine. The cleaner is always on time, professional, and my home looks spotless every single time." },
              { initials: 'MR', name: 'Michael R.', location: 'Hartford, CT · Deep Cleaning', text: 'Booked a deep clean before hosting a family gathering. They exceeded every expectation — areas I forgot existed were cleaned. Booking took 2 minutes. Highly recommend.' },
              { initials: 'JK', name: 'Jennifer K.', location: 'Boston, MA · Move-Out Cleaning', text: 'Used BrazilianClean for a move-out clean. Got my full security deposit back. The platform makes everything so simple — booking, communication, payment. No stress at all.' },
            ] as { initials: string; name: string; location: string; text: string }[]).map(t => (
              <div key={t.name} className={styles['testimonial-card']}>
                <div className={styles.stars}>★★★★★</div>
                <p>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.reviewer}>
                  <div className={styles['reviewer-avatar']}>{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles['footer-inner']}`}>
          <div className={styles['footer-brand']}>
            <Link href="/" className={`${styles.brand} ${styles['brand-sm']}`}>
              Brazilian<span>Clean</span>
            </Link>
            <p>Provides professional cleaning services to meet up with your household needs, professional services to deliver your home fresh and safe to its finest condition.</p>
            <div className={styles['footer-social']}>
              <a href="#" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0B1E3D"/></svg>
              </a>
            </div>
          </div>
          <div className={styles['footer-links']}>
            <div className={styles['footer-col']}>
              <h4>Services</h4>
              <a href="#services">Standard Cleaning</a>
              <a href="#services">Deep Cleaning</a>
              <a href="#services">Move In/Out Clean</a>
              <a href="#services">Post-Construction</a>
              <a href="#services">Office Cleaning</a>
            </div>
            <div className={styles['footer-col']}>
              <h4>Quick Links</h4>
              <Link href="/auth/login">Track Your Booking</Link>
              <Link href="/request">Get a Quote</Link>
              <Link href="/auth/login">Sign In</Link>
              <Link href="/auth/register?role=cleaner">Become a Cleaner</Link>
            </div>
            {/* Subscribe column — client for form submit handler */}
            <SubscribeColumn />
          </div>
        </div>
        <div className={styles['footer-bottom']}>
          <div className={`${styles.container} ${styles['footer-bottom-inner']}`}>
            <div className={styles['footer-bottom-links']}>
              <Link href="/terms">Terms &amp; Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <a href="mailto:support@brazilianclean.com">Contact Us</a>
            </div>
            <p>Powered by <strong>BrazilianClean</strong></p>
          </div>
        </div>
      </footer>

    </div>
  );
}
