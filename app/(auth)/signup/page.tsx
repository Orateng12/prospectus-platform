'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp } from '@/app/actions/auth';
import GoogleSignInButton from '@/components/GoogleSignInButton';

interface State { error?: string; needsConfirmation?: boolean; }
const initialState: State = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      const result = await signUp(formData);
      return result ?? {};
    },
    initialState
  );

  if (state.needsConfirmation) {
    return (
      <div
        className="auth-form-inner"
        style={{ borderLeft: '3px solid hsl(var(--amber))', paddingLeft: '1.5rem' }}
      >
        <p className="kicker" style={{ marginBottom: '1.25rem' }}>Almost there</p>
        <h1 style={{
          fontWeight: 900, fontSize: '1.875rem',
          letterSpacing: '-0.03em', color: 'hsl(var(--ink))',
          marginBottom: '0.75rem', lineHeight: 1.05,
        }}>
          Check your email.
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'hsl(var(--ink-light))', lineHeight: 1.65, marginBottom: '2rem' }}>
          We&apos;ve sent a confirmation link to your email address.
          Click the link to verify your account, then come back here to sign in.
        </p>
        <Link href="/login" className="btn-auth-submit" style={{ display: 'flex' }}>
          Go to sign in
        </Link>
        <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'hsl(var(--ink-light))' }}>
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

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
          Create your account.
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'hsl(var(--ink-light))', lineHeight: 1.5 }}>
          Start your university application journey — free.
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="onboarding-label" htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="auth-input"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="onboarding-label" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="onboarding-label" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="auth-input"
            placeholder="Min. 8 characters"
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
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
        <hr className="ink-rule" style={{ flex: 1 }} />
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--ink-light))', fontWeight: 600 }}>or</span>
        <hr className="ink-rule" style={{ flex: 1 }} />
      </div>

      <GoogleSignInButton label="Sign up with Google" />

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--ink-light))' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'hsl(var(--ink))', fontWeight: 700 }}>
            Sign in
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
