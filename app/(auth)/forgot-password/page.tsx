'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/auth';

interface State { error?: string; success?: boolean; }
const initialState: State = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      const result = await requestPasswordReset(formData);
      if (!result) return {};
      return result;
    },
    initialState
  );

  if (state.success) {
    return (
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="eyebrow"><span className="dot" />Prospectus</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.375rem', marginTop: '0.375rem' }}>Check your email</h1>
        <p className="body-text" style={{ marginTop: '0.5rem' }}>
          We&apos;ve sent a password reset link. Check your inbox and follow the link to set a new password.
        </p>
        <Link
          href="/login"
          className="btn btn-outline"
          style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem' }}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="eyebrow"><span className="dot" />Prospectus</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.375rem', marginTop: '0.375rem' }}>Reset password</h1>
        <p className="body-text" style={{ marginTop: '0.375rem' }}>
          Enter your email and we&apos;ll send a reset link.
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
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="caption" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
