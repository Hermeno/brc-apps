'use client';

import { useEffect } from 'react';

/* No Chakra and no providers here on purpose - see the note in not-found.tsx.
   This boundary catches render failures, so it has to survive a broken tree.
   It is also what bots hit when they POST a junk `Next-Action` header, which is
   how the ChakraProvider context error reached production. */

const navy = '#021A3A';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error boundary]', error);
  }, [error]);

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
          500
        </p>
        <p style={{ fontSize: 20, fontWeight: 700, color: navy, marginTop: 12, letterSpacing: '-0.02em' }}>
          Something went wrong
        </p>
        <p style={{ fontSize: 14, color: '#5E5E5E', marginTop: 8, lineHeight: 1.6 }}>
          An unexpected error occurred. Try again, or go back to the home page.
        </p>
        {error.digest && (
          <p style={{ fontSize: 11, color: '#9AA3AE', fontFamily: 'ui-monospace, monospace', marginTop: 12 }}>
            Error ID: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <button onClick={reset} style={{
            background: navy, color: '#fff', border: `1.5px solid ${navy}`, borderRadius: 2,
            padding: '13px 28px', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Try again
          </button>
          <a href="/" style={{
            background: '#fff', color: navy, border: `1.5px solid ${navy}`, borderRadius: 2,
            padding: '13px 28px', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em',
            textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block',
          }}>
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
