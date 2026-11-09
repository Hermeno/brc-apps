import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, MessagesSquare } from 'lucide-react';

/* White contacts band, then the navy footer. Only facts Verliks actually has:
   a launch area, an email address and the public pages. No phone, street
   address or social profiles, because there are none to show. */
export default function SiteFooter({ contacts = true }: { contacts?: boolean }) {
  return <>
    {contacts && (
      <section className="contacts" aria-label="Contact Verliks">
        <div className="wrap contacts-grid">
          <div className="contact">
            <MapPin size={44} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="contact-name">Verliks</p>
              <ul>
                <li>Starting in Connecticut</li>
                <li>Requests matched by ZIP code</li>
                <li><Link href="/service-areas">See service areas</Link></li>
              </ul>
            </div>
          </div>
          <div className="contact">
            <MessagesSquare size={44} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="contact-title">Questions before you start:</p>
              <ul>
                <li><Link href="/how-it-works">How a request works</Link></li>
                <li><Link href="/for-cleaners">Information for cleaners</Link></li>
                <li><Link href="/contact">Contact page</Link></li>
              </ul>
            </div>
          </div>
          <div className="contact">
            <Mail size={44} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="contact-title">Send us a message:</p>
              <ul>
                <li><a href="mailto:support@verliks.com">support@verliks.com</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    )}
    <footer className="site-footer on-dark">
      <div className="wrap footer-inner">
        <Link href="/" aria-label="Verliks home">
          <Image src="/images/brand/verliks-logo-white-600.png" width={200} height={43} alt="" />
        </Link>
        <nav aria-label="Footer">
          <ul className="footer-links">
            <li><Link href="/services">Cleaning services</Link></li>
            <li><Link href="/how-it-works">How it works</Link></li>
            <li><Link href="/service-areas">Service areas</Link></li>
            <li><Link href="/for-cleaners">For cleaners</Link></li>
            <li><Link href="/about">About Verliks</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
        <p className="footer-legal">
          © {new Date().getFullYear()} Verliks · <Link href="/privacy">Privacy policy</Link> · <Link href="/terms">Terms</Link> · Independent cleaning professionals, not employees.
        </p>
      </div>
    </footer>
  </>;
}
