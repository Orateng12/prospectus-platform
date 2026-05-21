'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '2rem', background: 'hsl(var(--bg))' }}>
      <div className="card" style={{ maxWidth: 560, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dashboard failed to load</h1>
        <p className="body-text" style={{ marginBottom: '1.5rem', color: 'hsl(var(--muted-fg))' }}>
          Something went wrong while loading your dashboard. This is usually a temporary issue — try again.
        </p>
        {process.env.NODE_ENV !== 'production' && error?.message && (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '0.75rem', background: 'hsl(var(--muted)/0.5)', borderRadius: 8, marginBottom: '1.5rem', fontSize: '0.75rem', textAlign: 'left' }}>
            {error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={reset}>Try again</button>
          <a className="btn btn-outline" href="/dashboard">Reload page</a>
        </div>
      </div>
    </div>
  );
}
