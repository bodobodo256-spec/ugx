'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0d0d0d',
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFD600' }}>
        Temporary Service Interruption
      </h1>
      <p style={{ color: '#aaa', maxWidth: '480px', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        We encountered a momentary server glitch. Your data is safe. Please tap the button below to refresh the page.
      </p>
      {error.digest && (
        <span style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
          Error Ref: {error.digest}
        </span>
      )}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: '#FFD600',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          🔄 Try Again
        </button>
        <Link
          href="/"
          style={{
            background: '#222',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}
