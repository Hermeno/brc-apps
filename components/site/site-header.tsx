'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SERVICE_GROUP_ORDER, servicesByGroup } from '@/lib/site-content';

/* Motion here follows Emil Kowalski's lens from design-motion-principles:
   navigation is triggered often, so it stays fast (180ms), interruptible
   (CSS transitions, not keyframes) and origin-aware — the panel grows from
   under its trigger rather than from its own centre. */

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/service-areas', label: 'Service areas' },
  { href: '/for-cleaners', label: 'For cleaners' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);          // mobile sheet
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); setServicesOpen(false); }, [pathname]);

  // The header has no hairline under it; it earns an edge once the page moves.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open && !servicesOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      if (servicesOpen) { setServicesOpen(false); triggerRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, servicesOpen]);

  const servicesActive = pathname.startsWith('/services');

  return <header className="site-header" data-scrolled={scrolled ? '' : undefined}>
    <div className="wrap header-inner">
      <Link className="brand" href="/" aria-label="Verliks home">
        <Image className="brand-mark" src="/images/brand/verliks-logo-600.png" width={159} height={34} alt="" priority />
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {/* Trigger and panel share one wrapper, so moving the pointer from the
            button down into the panel never leaves the element that owns the
            open state — the gap that used to close it mid-reach is gone. */}
        <div className="nav-services"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}>
          <button ref={triggerRef} type="button" className="nav-services-trigger"
            aria-expanded={servicesOpen} aria-controls={panelId}
            aria-current={servicesActive ? 'page' : undefined}
            onClick={() => setServicesOpen(value => !value)}>
            Services <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div id={panelId} className="nav-services-panel" data-open={servicesOpen ? '' : undefined}
            role="group" aria-label="Cleaning services" aria-hidden={!servicesOpen}>
            <div className="nav-services-grid">
              {SERVICE_GROUP_ORDER.map(group => (
                <div key={group}>
                  <p className="nav-services-group">{group}</p>
                  <ul>
                    {servicesByGroup(group).map(service => (
                      <li key={service.slug}>
                        <Link href={`/services/${service.slug}`} tabIndex={servicesOpen ? 0 : -1}>
                          <span>{service.name}</span>
                          <small>{service.blurb}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link className="nav-services-all" href="/services" tabIndex={servicesOpen ? 0 : -1}>
              See every cleaning service
            </Link>
          </div>
        </div>

        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
      </nav>

      <div className="header-actions">
        <Link className="sign-in-link" href="/auth/login">Sign in</Link>
        <Link className="btn btn-primary" href="/request">Find a cleaner</Link>
      </div>

      <button className="mobile-menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-mobile-menu" onClick={() => setOpen(value => !value)}>
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
    </div>

    <nav id="site-mobile-menu" className="mobile-menu" aria-label="Mobile navigation" hidden={!open}>
      <div className="wrap mobile-menu-inner">
        <Link href="/services" onClick={() => setOpen(false)}>Cleaning services</Link>
        <div className="mobile-services">
          {SERVICE_GROUP_ORDER.flatMap(group => servicesByGroup(group)).map(service => (
            <Link key={service.slug} href={`/services/${service.slug}`} onClick={() => setOpen(false)}>{service.name}</Link>
          ))}
        </div>
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href="/auth/login" onClick={() => setOpen(false)}>Sign in</Link>
        <Link className="btn btn-primary" href="/request" onClick={() => setOpen(false)}>Find a cleaner</Link>
      </div>
    </nav>
  </header>;
}
