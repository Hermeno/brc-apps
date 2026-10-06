'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import {
  SERVICE_GROUP_ORDER, SITE_NAV, PRIMARY_CTA, servicesByGroup, requestHref,
} from '@/lib/site-content';

/* Header ported from the prototype, including the behaviour in its site.js:
   the services panel opens on click and from the keyboard, Escape closes it and
   returns focus to the button, the rest of the page goes inert while the mobile
   menu is open, and a resize past the breakpoint closes the menu.

   Motion follows design-motion-principles (Emil Kowalski for navigation):
   short, 120-200 ms, and skipped entirely when the panel is opened from the
   keyboard or when the visitor prefers reduced motion - both handled in CSS. */

export default function SiteHeader() {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const servicesBtn = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLLIElement>(null);

  const closeServices = useCallback((returnFocus = false) => {
    setServicesOpen(false);
    if (returnFocus) servicesBtn.current?.focus();
  }, []);

  // Every navigation closes whatever was open.
  useEffect(() => { setServicesOpen(false); setMenuOpen(false); }, [pathname]);

  // Escape closes, and focus goes back to the control that opened the panel.
  useEffect(() => {
    if (!servicesOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (servicesOpen) closeServices(true);
      if (menuOpen) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [servicesOpen, menuOpen, closeServices]);

  // A click or a focus outside the dropdown closes it.
  useEffect(() => {
    if (!servicesOpen) return;
    const outside = (e: Event) => {
      if (!dropdown.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [servicesOpen]);

  // While the mobile menu is open the rest of the page is inert and the body
  // does not scroll, which is what the prototype's site.js does.
  useEffect(() => {
    const regions = Array.from(document.querySelectorAll<HTMLElement>('[data-inert-when-menu]'));
    regions.forEach(el => { if (menuOpen) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      regions.forEach(el => el.removeAttribute('inert'));
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Past the breakpoint the mobile menu has no reason to stay open.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia('(min-width: 1000px)');
    const onChange = () => { if (mq.matches) setMenuOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [menuOpen]);

  const current = (href: string) => (pathname === href ? 'page' : undefined);

  const serviceGroups = SERVICE_GROUP_ORDER.map(group => ({
    group,
    id: group.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''),
    items: servicesByGroup(group),
  }));

  return (
    <header className="site-header">
      <div className="wrap header-bar">
        <Link className="brand" href="/" aria-label="Verliks home">
          <Image className="brand-mark" src="/images/site/verliks-mark-128.png" width={34} height={34} alt="" priority />
          <span className="brand-word" aria-hidden="true">verliks</span>
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          <ul className="nav-list">
            <li data-dropdown ref={dropdown}>
              {/* Fallback for no JavaScript; CSS hides it once the button is usable. */}
              <Link className="nav-link nav-services-fallback" href="/services">Services</Link>
              <button
                className="nav-link"
                type="button"
                ref={servicesBtn}
                aria-expanded={servicesOpen}
                aria-controls="nav-services"
                data-dropdown-button
                onClick={() => setServicesOpen(v => !v)}
              >
                Services <Icon name="caret-down" />
              </button>

              <div className="mega" id="nav-services" hidden={!servicesOpen}>
                <div className="wrap mega-inner">
                  {serviceGroups.map(({ group, id, items }) => (
                    <div className="mega-group" key={group}>
                      <p className="label" id={`mega-${id}`}>{group}</p>
                      <ul className="mega-list" aria-labelledby={`mega-${id}`}>
                        {items.map(s => (
                          <li key={s.slug}>
                            <Link className="mega-link" href={`/services/${s.slug}`}>
                              <strong>{s.name}</strong>
                              <span>{s.blurb}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="mega-foot">
                    <p>Not sure which one fits? Start from the situation on the services page.</p>
                    <Link className="link-arrow" href="/services">
                      <span>All services</span><Icon name="arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            </li>

            {SITE_NAV.map(item => (
              <li key={item.href}>
                <Link className="nav-link" href={item.href} aria-current={current(item.href)}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className="btn btn-sm header-cta" href={requestHref()}>{PRIMARY_CTA}</Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          <Icon name={menuOpen ? 'x' : 'list'} />
          <span data-menu-label>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      <div className="mobile-menu" id="mobile-menu" hidden={!menuOpen}>
        <nav className="mm-inner" aria-label="Main">
          <div className="mm-section">
            <div className="mm-head">
              <p className="label">Services</p>
              <Link className="link-arrow" href="/services">
                <span>All services</span><Icon name="arrow-right" />
              </Link>
            </div>
            <div className="mm-groups">
              {serviceGroups.map(({ group, id, items }) => (
                <div className="mm-group" key={group}>
                  <p className="label" id={`mm-${id}`}>{group}</p>
                  <ul className="mm-list" aria-labelledby={`mm-${id}`}>
                    {items.map(s => (
                      <li key={s.slug}>
                        <Link className="mm-link" href={`/services/${s.slug}`}>{s.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mm-section">
            <ul className="mm-list">
              {SITE_NAV.map(item => (
                <li key={item.href}>
                  <Link className="mm-link" href={item.href} aria-current={current(item.href)}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <Link className="btn mm-cta" href={requestHref()}>{PRIMARY_CTA}</Link>
        </nav>
      </div>
    </header>
  );
}
