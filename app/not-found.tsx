import Link from 'next/link';
import ErrorNavigation from '@/components/ErrorNavigation';

export default function NotFound() {
  return (
    <main className="card" style={{ maxWidth: 640, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <p className="caption" style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
        <Link href="/">Home</Link> / 404
      </p>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Page not found</h1>
      <p className="body-text" style={{ marginBottom: '1.25rem', lineHeight: 1.75 }}>
        We couldn&rsquo;t find the page you were looking for. If you arrived here after Google sign-in,
        please confirm your OAuth redirect URI is configured as <code>{'{SITE_URL}/auth/callback'}</code>.
      </p>
      <p className="body-text" style={{ marginBottom: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
        Use the buttons below to return home, sign in again, or go back to the previous page.
      </p>
      <ErrorNavigation />
    </main>
  );
}
