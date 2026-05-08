'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp } from '@/app/actions/auth';

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
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="eyebrow"><span className="dot" />Prospectus</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.375rem', marginTop: '0.375rem' }}>Check your email</h1>
        <p className="body-text" style={{ marginTop: '0.5rem', lineHeight: 1.7 }}>
          We&apos;ve sent a confirmation link to your email address.
          Click the link to verify your account, then come back here to sign in.
        </p>
        <hr style={{ border: 0, borderTop: '1px solid hsl(var(--border))', margin: '1.25rem 0' }} />
        <Link
          href="/login"
          className="btn btn-primary"
          style={{ display: 'block', textAlign: 'center', width: '100%' }}
        >
          Go to sign in
        </Link>
        <p className="caption" style={{ marginTop: '1rem', textAlign: 'center' }}>
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="eyebrow"><span className="dot" />Prospectus</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.375rem', marginTop: '0.375rem' }}>
          Create account
        </h1>
        <p className="body-text" style={{ marginTop: '0.375rem' }}>
          Start your university application journey
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
            Full name
          </label>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className="input"
            placeholder="Tumelo Tata"
            style={{ width: '100%' }}
          />
        </div>

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
            autoComplete="new-password"
            minLength={8}
            className="input"
            placeholder="Min. 8 characters"
            style={{ width: '100%' }}
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
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.25rem' }}
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="caption" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
