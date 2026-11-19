'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SERVICE_GROUP_ORDER, servicesByGroup } from '@/lib/site-content';

/* The public navigation sits over photo heroes and stays in the page flow on
   text-first pages. Both treatments are scoped to .vsite in app/site.css. */

const links = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/service-areas', label: 'Service areas' },
  { href: '/for-cleaners', label: 'For cleaners' },
];

export default function SiteHeader() {
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
  // click, which would open the panel and close it again at once.
  const hover = (value: boolean) => (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setServicesOpen(value);
  };
  const current = (href: string) => (pathname === href ? 'page' : undefined);
  const servicesActive = pathname.startsWith('/services');

  return <>
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Verliks home">
          <Image src="/images/brand/verliks-logo-600.png" width={200} height={43} alt="" priority />
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <Link className="nav-link" href="/" aria-current={current('/')}>Home</Link>
          {/* Trigger and panel share one wrapper, so moving the pointer from the
              button down into the panel never leaves the element that owns the
              open state. Focus leaving the wrapper closes it. */}
          <div className="nav-services" onPointerEnter={hover(true)} onPointerLeave={hover(false)}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false); }}>
            <button ref={triggerRef} type="button" className="nav-link nav-caret"
              aria-expanded={servicesOpen} aria-controls={panelId}
              aria-current={servicesActive ? 'page' : undefined}
              onClick={() => setServicesOpen(value => !value)}>
              Services <ChevronDown size={13} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <div id={panelId} className="nav-services-panel" data-open={servicesOpen ? '' : undefined}
              role="group" aria-label="Cleaning services" aria-hidden={!servicesOpen}>
              <div className="wrap">
                <div className="nav-services-grid">
                  {SERVICE_GROUP_ORDER.map(group => (
                    <div key={group}>
                      <p className="t-label">{group}</p>
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
                <Link className="btn btn-outline nav-services-all" href="/services" tabIndex={servicesOpen ? 0 : -1}>
                  See every cleaning service
                </Link>
              </div>
            </div>
          </div>
          {links.map(link => <Link key={link.href} className="nav-link" href={link.href} aria-current={current(link.href)}>{link.label}</Link>)}
        </nav>

        <Link className="header-action" href="/auth/login">Sign in</Link>

        <button className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-mobile-menu" onClick={() => setOpen(value => !value)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      <nav id="site-mobile-menu" className="mobile-menu" aria-label="Mobile navigation" hidden={!open}>
        <div className="wrap mobile-menu-inner">
          <Link href="/" aria-current={current('/')} onClick={() => setOpen(false)}>Home</Link>
          <Link href="/services" aria-current={servicesActive ? 'page' : undefined} onClick={() => setOpen(false)}>Services</Link>
          <ul className="mobile-services">
            {SERVICE_GROUP_ORDER.flatMap(group => servicesByGroup(group)).map(service => (
              <li key={service.slug}><Link href={`/services/${service.slug}`} onClick={() => setOpen(false)}>{service.name}</Link></li>
            ))}
          </ul>
          {links.map(link => <Link key={link.href} href={link.href} aria-current={current(link.href)} onClick={() => setOpen(false)}>{link.label}</Link>)}
          <Link href="/auth/login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link className="btn btn-primary" href="/request" onClick={() => setOpen(false)}>Find a cleaner</Link>
        </div>
      </nav>
    </header>
  </>;
}
