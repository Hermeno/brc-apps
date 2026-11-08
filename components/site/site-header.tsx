'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SERVICE_GROUP_ORDER, servicesByGroup } from '@/lib/site-content';

/* Header for the public pages, white on dark in both forms. With `overlay` it
   lies transparent over the page's opening photograph and scrolls away with
   it; without, it is a solid navy bar that stays at the top. The search for a
   cleaner lives in the page itself, so the bar carries links only. */

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/service-areas', label: 'Service areas' },
  { href: '/for-cleaners', label: 'For cleaners' },
];

export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);          // mobile menu
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); setServicesOpen(false); }, [pathname]);

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

  // Hover opens the panel for a mouse only: a tap fires pointerenter and then
  // click, which used to open the panel and close it again at once.
  const hover = (value: boolean) => (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setServicesOpen(value);
  };
  const servicesActive = pathname.startsWith('/services');

  return <header className="site-header" data-overlay={overlay ? '' : undefined} data-open={open ? '' : undefined}>
    <div className="wrap header-inner">
      <Link className="brand" href="/" aria-label="Verliks home">
        <Image className="brand-mark" src="/images/brand/verliks-logo-white-600.png" width={200} height={43} alt="" priority />
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {/* Trigger and panel share one wrapper, so moving the pointer from the
            button down into the panel never leaves the element that owns the
            open state. Focus leaving the wrapper closes it, too. */}
        <div className="nav-services" onPointerEnter={hover(true)} onPointerLeave={hover(false)}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false); }}>
          <button ref={triggerRef} type="button" className="nav-link nav-services-trigger"
            aria-expanded={servicesOpen} aria-controls={panelId}
            aria-current={servicesActive ? 'page' : undefined}
            onClick={() => setServicesOpen(value => !value)}>
            Services <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div id={panelId} className="nav-services-panel" data-open={servicesOpen ? '' : undefined}
            role="group" aria-label="Cleaning services" aria-hidden={!servicesOpen}>
            <div className="wrap nav-services-grid">
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
            <div className="wrap">
              <Link className="nav-services-all" href="/services" tabIndex={servicesOpen ? 0 : -1}>
                See every cleaning service
              </Link>
            </div>
          </div>
        </div>

        {links.map(link => <Link key={link.href} className="nav-link" href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
        <Link className="nav-link" href="/auth/login">Sign in</Link>
      </nav>

      <button className="mobile-menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-mobile-menu" onClick={() => setOpen(value => !value)}>
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>
    </div>

    <nav id="site-mobile-menu" className="mobile-menu" aria-label="Mobile navigation" hidden={!open}>
      <div className="wrap mobile-menu-inner">
        <Link href="/services" onClick={() => setOpen(false)} aria-current={servicesActive ? 'page' : undefined}>Cleaning services</Link>
        <ul className="mobile-services">
          {SERVICE_GROUP_ORDER.flatMap(group => servicesByGroup(group)).map(service => (
            <li key={service.slug}><Link href={`/services/${service.slug}`} onClick={() => setOpen(false)}>{service.name}</Link></li>
          ))}
        </ul>
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href="/auth/login" onClick={() => setOpen(false)}>Sign in</Link>
        <Link className="mobile-cta" href="/request" onClick={() => setOpen(false)}>Find a cleaner</Link>
      </div>
    </nav>
  </header>;
}
