/* No Chakra, no providers, no next/image here on purpose.

   This page is rendered on paths where the app-level provider tree is not
   guaranteed to be mounted. When it used Chakra it crashed in production with
   "useContext returned undefined. Seems you forgot to wrap component within
   <ChakraProvider />" and the 404 turned into a 500. An error page has to be
   able to render when everything else is broken, so it depends on nothing. */

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const navy = '#021A3A';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#fff', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '0 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/verliks-logo-600.png" alt="Verliks" width={32} height={32}
          style={{ objectFit: 'contain', marginBottom: 28 }} />

        <p style={{ fontSize: 56, fontWeight: 800, color: navy, margin: 0, lineHeight: 1, letterSpacing: '-0.04em' }}>
          404
        </p>
        <p style={{ fontSize: 20, fontWeight: 700, color: navy, marginTop: 12, letterSpacing: '-0.02em' }}>
          Page not found
        </p>
        <p style={{ fontSize: 14, color: '#5E5E5E', marginTop: 8, lineHeight: 1.6 }}>
          This page does not exist, or it has moved.
        </p>

        <a href="/" style={{
          display: 'inline-block', marginTop: 32, background: navy, color: '#fff',
          padding: '13px 28px', borderRadius: 2, fontWeight: 700, fontSize: 13,
          letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
        }}>
          Back to home
        </a>
      </div>
    </div>
  );
}
