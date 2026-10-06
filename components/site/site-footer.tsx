import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './icons';
import { SITE_SERVICES, SITE_NAV, PRIMARY_CTA, requestHref } from '@/lib/site-content';

/* Footer ported from the prototype. `data-inert-when-menu` is what the header
   reads to make the rest of the page inert while the mobile menu is open. */

export default function SiteFooter() {
  return (
    <footer className="site-footer" data-inert-when-menu>
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Link className="brand footer-brand" href="/" aria-label="Verliks home">
              <Image className="brand-mark" src="/images/site/verliks-mark-128.png" width={34} height={34} alt="" />
              <span className="brand-word" aria-hidden="true">verliks</span>
            </Link>
            <p className="footer-statement">
              Verliks connects people who need a cleaning with independent cleaning professionals nearby.
            </p>
          </div>
          <Link className="btn btn-light" href={requestHref()}>
            {PRIMARY_CTA} <Icon name="arrow-right" />
          </Link>
        </div>

        <div className="footer-cols">
          <nav className="footer-col footer-services" id="footer-services" aria-labelledby="f-services">
            <h2 id="f-services">Services</h2>
            <ul>
              <li><Link href="/services">All services</Link></li>
              {SITE_SERVICES.map(s => (
                <li key={s.slug}><Link href={`/services/${s.slug}`}>{s.name}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-labelledby="f-company">
            <h2 id="f-company">Company</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              {SITE_NAV.map(item => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h2 id="f-account">Account</h2>
            <ul>
              <li><Link href="/auth/login">Sign in</Link></li>
              <li><Link href="/for-cleaners">For cleaners</Link></li>
              <li><Link href="/terms">Terms of use</Link></li>
              <li><Link href="/privacy">Privacy policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Verliks. Independent cleaning professionals, not employees.</p>
        </div>
      </div>
    </footer>
  );
}
