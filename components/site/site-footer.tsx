import Image from 'next/image';
import Link from 'next/link';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="wrap">
      <div className="footer-top">
        <div className="footer-intro">
          <Link className="brand" href="/" aria-label="Verliks home">
            <Image className="brand-mark" src="/images/brand/verliks-logo-600.png" width={159} height={34} alt="" />
          </Link>
          <p>A thoughtful way to connect homes with independent cleaning professionals nearby.</p>
        </div>
        <div className="footer-links">
          <nav aria-label="Explore"><h2>Explore</h2><ul>
            <li><Link href="/services">Cleaning services</Link></li>
            <li><Link href="/how-it-works">How it works</Link></li>
            <li><Link href="/service-areas">Service areas</Link></li>
            <li><Link href="/request">Find a cleaner</Link></li>
          </ul></nav>
          <nav aria-label="Professionals"><h2>Professionals</h2><ul>
            <li><Link href="/for-cleaners">For cleaners</Link></li>
            <li><Link href="/auth/register">Create a profile</Link></li>
            <li><Link href="/auth/login">Sign in</Link></li>
          </ul></nav>
          <nav aria-label="Company"><h2>Company</h2><ul>
            <li><Link href="/about">About Verliks</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul></nav>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Verliks. Independent cleaning professionals, not employees.</span><span>Starting in Connecticut. Built for the United States.</span></div>
    </div>
  </footer>;
}
