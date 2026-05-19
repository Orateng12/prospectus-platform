import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proxy } from '../proxy';

// ─── Mock @supabase/ssr ───────────────────────────────────────────────────────

const { mockGetUser } = vi.hoisted(() => ({ mockGetUser: vi.fn() }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

// ─── Mock next/server ─────────────────────────────────────────────────────────
// NextResponse.redirect / .next are mocked so we can inspect routing decisions
// without a live Next.js runtime. Each mock returns a plain object with just
// the properties needed to verify the test assertions.

const mockRedirect = vi.fn();
const mockNext = vi.fn();

vi.mock('next/server', () => {
  const nextResult = () => ({
    __type: 'next' as const,
    cookies: {
      set: vi.fn(),
      getAll: vi.fn().mockReturnValue([]),
    },
  });

  return {
    NextResponse: {
      redirect: (url: URL) => {
        mockRedirect(url);
        return { __type: 'redirect' as const, location: url.pathname };
      },
      next: (opts: unknown) => {
        mockNext(opts);
        return nextResult();
      },
    },
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ANON  = { data: { user: null }, error: null };
const AUTH  = { data: { user: { id: 'user-1' } }, error: null };
const ERROR = { data: { user: null }, error: new Error('auth error') };

/** Creates a minimal NextRequest-compatible mock for the given path. */
function makeReq(path: string) {
  return {
    url: `http://localhost${path}`,
    nextUrl: { pathname: path },
    cookies: { getAll: () => [] as Array<{ name: string; value: string }> },
  } as Parameters<typeof proxy>[0];
}

// Helper — the mock NextResponse returns plain objects; cast through unknown
// so TypeScript doesn't reject the __type / location property accesses.
function r(res: unknown): { __type: string; location?: string } {
  return res as { __type: string; location?: string };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('proxy', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockNext.mockClear();
  });

  // ── Protected routes (unauthenticated) ──────────────────────────────────────

  it('redirects unauthenticated users from /dashboard to /login', async () => {
    mockGetUser.mockResolvedValue(ANON);
    const res = r(await proxy(makeReq('/dashboard')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/login');
  });

  it('redirects unauthenticated users from /onboarding to /login', async () => {
    mockGetUser.mockResolvedValue(ANON);
    const res = r(await proxy(makeReq('/onboarding')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/login');
  });

  it('redirects unauthenticated users from /onboarding/step-2 to /login', async () => {
    mockGetUser.mockResolvedValue(ANON);
    const res = r(await proxy(makeReq('/onboarding/step-2')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/login');
  });

  // ── Auth routes (authenticated) ──────────────────────────────────────────────

  it('redirects authenticated users from /login to /dashboard', async () => {
    mockGetUser.mockResolvedValue(AUTH);
    const res = r(await proxy(makeReq('/login')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/dashboard');
  });

  it('redirects authenticated users from /signup to /dashboard', async () => {
    mockGetUser.mockResolvedValue(AUTH);
    const res = r(await proxy(makeReq('/signup')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/dashboard');
  });

  it('redirects authenticated users from /forgot-password to /dashboard', async () => {
    mockGetUser.mockResolvedValue(AUTH);
    const res = r(await proxy(makeReq('/forgot-password')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/dashboard');
  });

  // ── Pass-through cases ────────────────────────────────────────────────────────

  it('passes through unauthenticated users on /login', async () => {
    mockGetUser.mockResolvedValue(ANON);
    const res = r(await proxy(makeReq('/login')));
    expect(res.__type).toBe('next');
  });

  it('passes through unauthenticated users on /signup', async () => {
    mockGetUser.mockResolvedValue(ANON);
    const res = r(await proxy(makeReq('/signup')));
    expect(res.__type).toBe('next');
  });

  it('passes through authenticated users on /dashboard', async () => {
    mockGetUser.mockResolvedValue(AUTH);
    const res = r(await proxy(makeReq('/dashboard')));
    expect(res.__type).toBe('next');
  });

  it('passes through authenticated users on /reset-password (allowed while logged in)', async () => {
    mockGetUser.mockResolvedValue(AUTH);
    const res = r(await proxy(makeReq('/reset-password')));
    expect(res.__type).toBe('next');
  });

  it('passes through requests to the public landing page', async () => {
    mockGetUser.mockResolvedValue(ANON);
    const res = r(await proxy(makeReq('/')));
    expect(res.__type).toBe('next');
  });

  // ── Error handling ────────────────────────────────────────────────────────────

  it('treats a Supabase auth error as unauthenticated and protects /dashboard', async () => {
    mockGetUser.mockResolvedValue(ERROR);
    const res = r(await proxy(makeReq('/dashboard')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/login');
  });

  it('treats a thrown getUser exception as unauthenticated and protects /dashboard', async () => {
    mockGetUser.mockRejectedValue(new Error('network failure'));
    const res = r(await proxy(makeReq('/dashboard')));
    expect(res.__type).toBe('redirect');
    expect(res.location).toBe('/login');
  });
});
