'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '@/app/actions/auth';
import GoogleSignInButton from '@/components/GoogleSignInButton';

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
    <div className="auth-form-inner">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontWeight: 900,
          fontSize: '1.875rem',
          letterSpacing: '-0.03em',
          color: 'hsl(var(--ink))',
          marginBottom: '0.5rem',
          lineHeight: 1.05,
        }}>
          Welcome back.
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'hsl(var(--ink-light))', lineHeight: 1.5 }}>
          Sign in to your Prospectus account.
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="onboarding-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <label className="onboarding-label" htmlFor="login-password" style={{ margin: 0 }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{ color: 'hsl(var(--ink))', fontSize: '0.75rem', fontWeight: 700 }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="auth-input"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', fontWeight: 600 }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-auth-submit"
          style={{ marginTop: '0.25rem' }}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
        <hr className="ink-rule" style={{ flex: 1 }} />
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--ink-light))', fontWeight: 600 }}>or</span>
        <hr className="ink-rule" style={{ flex: 1 }} />
      </div>

      <GoogleSignInButton />

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--ink-light))' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'hsl(var(--ink))', fontWeight: 700 }}>
            Sign up free
          </Link>
        </p>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--ink-light))' }}>
          <Link href="/" style={{ color: 'hsl(var(--ink))', fontWeight: 700 }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
