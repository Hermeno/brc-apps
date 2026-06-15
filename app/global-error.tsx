'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 20px' }}>
          <p style={{ fontSize: 64, fontWeight: 800, color: '#0A2540', margin: 0, lineHeight: 1 }}>500</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#0A2540', marginTop: 12 }}>Something went wrong</p>
          <p style={{ fontSize: 14, color: '#697386', marginTop: 8, lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: '#CBD5E1', fontFamily: 'monospace', marginTop: 12 }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <button
              onClick={reset}
              style={{ background: '#0A80DB', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Try again
            </button>
            <a href="/" style={{ background: '#fff', color: '#425466', border: '1px solid #E3E8EE', borderRadius: 4, padding: '10px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
