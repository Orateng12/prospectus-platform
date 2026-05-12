'use client';

import Link from 'next/link';
import ErrorNavigation from '@/components/ErrorNavigation';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <main className="card" style={{ maxWidth: 640, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <p className="caption" style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
        <Link href="/">Home</Link> / Error
      </p>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Something went wrong</h1>
      <p className="body-text" style={{ marginBottom: '1.25rem', lineHeight: 1.75 }}>
        An unexpected error occurred while loading this page. Try again or return to the application.
      </p>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '1rem', background: 'hsl(var(--muted) / 0.6)', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        {error?.message ?? 'Unknown error'}
      </pre>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <button type="button" className="btn btn-primary" onClick={reset} style={{ minWidth: 140 }}>
          Try again
        </button>
        <ErrorNavigation />
      </div>
    </main>
  );
}
