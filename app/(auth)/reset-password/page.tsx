'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/app/actions/auth';

const initialState = { error: undefined as string | undefined };

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updatePassword(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <div className="card" style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="eyebrow"><span className="dot" />Prospectus</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.375rem', marginTop: '0.375rem' }}>Set new password</h1>
        <p className="body-text" style={{ marginTop: '0.375rem' }}>
          Choose a strong password for your account.
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
            New password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            placeholder="••••••••"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
            Confirm password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            placeholder="••••••••"
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
          {pending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
