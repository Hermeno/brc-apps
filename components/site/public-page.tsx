import type { ReactNode } from 'react';
import '@/app/site.css';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';

/* The one layout for the public pages: skip link, top bar and header, the page,
   contacts and footer. Every rule it brings is scoped to .vsite. */
export default function PublicPage({ children, contacts = true }: { children: ReactNode; contacts?: boolean }) {
  return (
    <div className="vsite">
      <a className="skip-link" href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter contacts={contacts} />
    </div>
  );
}
