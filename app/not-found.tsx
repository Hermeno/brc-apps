/* No Chakra, no providers, no next/image here on purpose.
   This page is rendered on paths where the app-level provider tree is not
   guaranteed to be mounted. When it used Chakra it crashed in production with
   "useContext returned undefined. Seems you forgot to wrap component within
   <ChakraProvider />" and the 404 turned into a 500. An error page has to be
   able to render when everything else is broken, so it depends on nothing —
   which is also why it does not use the public header and footer. Colours and
   type follow the public pages (app/site.css). */

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const ink = '#18314E';
const body = '#455B70';
const blue = '#185FC6';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#FFFFFF', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '0 20px',
      fontFamily: 'var(--font-body), system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/verliks-logo-600.png" alt="Verliks" width={149} height={32}
          style={{ objectFit: 'contain', marginBottom: 28 }} />
        <p style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: 56, fontWeight: 700, color: ink, margin: 0, lineHeight: 1 }}>
          404
        </p>
        <h1 style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: 26, fontWeight: 300, color: ink, margin: '14px 0 0' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 16, color: body, margin: '8px 0 0', lineHeight: 1.6 }}>
          This page does not exist, or it has moved.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', minHeight: 42, padding: '0 22px',
            background: blue, border: `1px solid ${blue}`, color: '#FFFFFF',
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Back to home
          </a>
          <a href="/services" style={{
            display: 'inline-flex', alignItems: 'center', minHeight: 42, padding: '0 22px',
            background: '#FFFFFF', border: `1px solid ${blue}`, color: blue,
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Cleaning services
          </a>
        </div>
      </div>
    </div>
  );
}
