'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ErrorNavigation() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => router.back()}
        style={{ minWidth: 140 }}
      >
        Go back
      </button>
      <Link href="/" className="btn btn-primary" style={{ minWidth: 140, textAlign: 'center' }}>
        Return home
      </Link>
      <Link href="/login" className="btn btn-outline" style={{ minWidth: 140, textAlign: 'center' }}>
        Sign in
      </Link>
    </div>
  );
}
