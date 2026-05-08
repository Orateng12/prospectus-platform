'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '@/app/actions/auth';

const initialState = { error: undefined as string | undefined };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await signIn(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <div className="card" style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="eyebrow"><span className="dot" />Prospectus</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.375rem', marginTop: '0.375rem' }}>
          Sign in
        </h1>
        <p className="body-text" style={{ marginTop: '0.375rem' }}>
          Your AI-powered university application workspace
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            style={{ width: '100%' }}
          />
        </div>

        {state.error && (
          <p style={{ color: 'hsl(var(--danger, 0 84% 60%))', fontSize: '0.8125rem', fontWeight: 600 }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.25rem' }}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="caption" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
