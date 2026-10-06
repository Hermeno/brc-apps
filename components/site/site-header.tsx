'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/service-areas', label: 'Service areas' },
  { href: '/for-cleaners', label: 'For cleaners' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return <header className="site-header">
    <div className="wrap header-inner">
      <Link className="brand" href="/" aria-label="Verliks home">
        <Image className="brand-mark" src="/images/brand/verliks-logo-600.png" width={159} height={34} alt="" priority />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
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
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href="/auth/login" onClick={() => setOpen(false)}>Sign in</Link>
        <Link className="btn btn-primary" href="/request" onClick={() => setOpen(false)}>Find a cleaner</Link>
      </div>
    </nav>
  </header>;
}
