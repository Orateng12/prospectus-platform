import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }));

const { mockSignInWithPassword, mockSignUp, mockSignOut, mockSignInWithOAuth,
        mockResetPassword, mockUpdateUser, mockGetUser } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignUp:             vi.fn(),
  mockSignOut:            vi.fn(),
  mockSignInWithOAuth:    vi.fn(),
  mockResetPassword:      vi.fn(),
  mockUpdateUser:         vi.fn(),
  mockGetUser:            vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp:             mockSignUp,
      signOut:            mockSignOut,
      signInWithOAuth:    mockSignInWithOAuth,
      resetPasswordForEmail: mockResetPassword,
    },
  }),
}));

vi.mock('@/lib/supabase/requireAuth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    ok: true,
    user: { id: 'user-1', email: 'test@example.com' },
    supabase: { auth: { updateUser: mockUpdateUser } },
  }),
}));

// Import after mocks are registered
import { signIn, signUp, signOut, signInWithGoogle, requestPasswordReset, updatePassword } from '../../app/actions/auth';
import { requireAuth } from '@/lib/supabase/requireAuth';

// ─── Env-var helpers ──────────────────────────────────────────────────────────

function withSiteUrl(url: string) {
  process.env.NEXT_PUBLIC_SITE_URL = url;
}
function clearSiteUrl() {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
}

const formData = (pairs: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(pairs)) fd.append(k, v);
  return fd;
};

// ─── signIn ───────────────────────────────────────────────────────────────────

describe('signIn', () => {
  beforeEach(() => clearSiteUrl());

  it('returns an error object when Supabase rejects the credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    const result = await signIn(formData({ email: 'a@b.com', password: 'wrong' }));
    expect(result).toEqual({ error: 'Invalid login credentials' });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('calls redirect to /dashboard on successful sign-in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    await signIn(formData({ email: 'a@b.com', password: 'correct' }));
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});

// ─── signUp ───────────────────────────────────────────────────────────────────

describe('signUp', () => {
  afterEach(() => clearSiteUrl());

  it('returns an error when no site URL is configured', async () => {
    clearSiteUrl();
    const result = await signUp(formData({ name: 'Alice', email: 'a@b.com', password: 'pass1234' }));
    expect(result).toEqual({ error: 'Signup is not configured — contact support' });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('reads NEXT_PUBLIC_SITE_URL when set', async () => {
    withSiteUrl('https://example.com');
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    const result = await signUp(formData({ name: 'Alice', email: 'a@b.com', password: 'pass1234' }));
    expect(result).toEqual({ needsConfirmation: true });
  });

  it('reads VERCEL_PROJECT_PRODUCTION_URL as fallback', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'my-app.vercel.app';
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    const result = await signUp(formData({ name: 'Alice', email: 'a@b.com', password: 'pass1234' }));
    expect(result).toEqual({ needsConfirmation: true });
  });

  it('returns { needsConfirmation: true } when Supabase returns no session (email confirmation required)', async () => {
    withSiteUrl('https://example.com');
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    const result = await signUp(formData({ name: 'Alice', email: 'a@b.com', password: 'pass1234' }));
    expect(result).toEqual({ needsConfirmation: true });
  });

  it('redirects to /dashboard when a session is established immediately', async () => {
    withSiteUrl('https://example.com');
    mockSignUp.mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null });
    await signUp(formData({ name: 'Alice', email: 'a@b.com', password: 'pass1234' }));
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('returns an error when Supabase errors', async () => {
    withSiteUrl('https://example.com');
    mockSignUp.mockResolvedValue({ data: { session: null }, error: { message: 'Email already registered' } });
    const result = await signUp(formData({ name: 'Alice', email: 'a@b.com', password: 'pass1234' }));
    expect(result).toEqual({ error: 'Email already registered' });
  });
});

// ─── signOut ──────────────────────────────────────────────────────────────────

describe('signOut', () => {
  it('signs out and redirects to /login', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await signOut();
    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });
});

// ─── signInWithGoogle ─────────────────────────────────────────────────────────

describe('signInWithGoogle', () => {
  afterEach(() => clearSiteUrl());

  it('returns an error when no site URL is configured', async () => {
    clearSiteUrl();
    const result = await signInWithGoogle();
    expect(result).toEqual({ error: 'Google sign-in is not configured — contact support' });
  });

  it('returns the OAuth redirect URL on success', async () => {
    withSiteUrl('https://example.com');
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://accounts.google.com/oauth' }, error: null });
    const result = await signInWithGoogle();
    expect(result).toEqual({ url: 'https://accounts.google.com/oauth' });
  });

  it('returns an error when Supabase returns no URL', async () => {
    withSiteUrl('https://example.com');
    mockSignInWithOAuth.mockResolvedValue({ data: { url: null }, error: null });
    const result = await signInWithGoogle();
    expect(result).toEqual({ error: 'No redirect URL returned' });
  });

  it('returns an error when Supabase errors', async () => {
    withSiteUrl('https://example.com');
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: { message: 'OAuth error' } });
    const result = await signInWithGoogle();
    expect(result).toEqual({ error: 'OAuth error' });
  });
});

// ─── requestPasswordReset ─────────────────────────────────────────────────────

describe('requestPasswordReset', () => {
  afterEach(() => clearSiteUrl());

  it('returns an error when no site URL is configured', async () => {
    clearSiteUrl();
    const result = await requestPasswordReset(formData({ email: 'a@b.com' }));
    expect(result).toEqual({ error: 'Password reset is not configured — contact support' });
  });

  it('returns { success: true } when the reset email is sent', async () => {
    withSiteUrl('https://example.com');
    mockResetPassword.mockResolvedValue({ error: null });
    const result = await requestPasswordReset(formData({ email: 'a@b.com' }));
    expect(result).toEqual({ success: true });
  });

  it('returns an error when Supabase errors', async () => {
    withSiteUrl('https://example.com');
    mockResetPassword.mockResolvedValue({ error: { message: 'Email not found' } });
    const result = await requestPasswordReset(formData({ email: 'a@b.com' }));
    expect(result).toEqual({ error: 'Email not found' });
  });
});

// ─── updatePassword ───────────────────────────────────────────────────────────

describe('updatePassword', () => {
  it('returns an error when the password is shorter than 8 characters', async () => {
    const result = await updatePassword(formData({ password: 'short', confirmPassword: 'short' }));
    expect(result).toEqual({ error: 'Password must be at least 8 characters' });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('returns an error when the passwords do not match', async () => {
    const result = await updatePassword(formData({ password: 'longpassword1', confirmPassword: 'longpassword2' }));
    expect(result).toEqual({ error: 'Passwords do not match' });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('returns an error when the user is not authenticated', async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce({ ok: false, error: 'Not authenticated' });
    const result = await updatePassword(formData({ password: 'newpassword1', confirmPassword: 'newpassword1' }));
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns an error when Supabase fails to update the password', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'Weak password' } });
    const result = await updatePassword(formData({ password: 'newpassword1', confirmPassword: 'newpassword1' }));
    expect(result).toEqual({ error: 'Weak password' });
  });

  it('redirects to /dashboard on successful password update', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    await updatePassword(formData({ password: 'newpassword1', confirmPassword: 'newpassword1' }));
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});
