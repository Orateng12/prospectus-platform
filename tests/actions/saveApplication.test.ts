import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { saveApplication } from '../../app/actions/saveApplication';

// ─── Chain builder ────────────────────────────────────────────────────────────
// Supabase queries are chainable (from().select().eq().maybySingle() etc.).
// This factory makes a mock that is awaitable at any point in the chain via
// a `then` shim, AND has overridable terminal methods (maybySingle, single).

function makeChain(opts: {
  base?:       { data?: unknown; error?: { message: string } | null };
  singleData?: unknown;
  maybeData?:  unknown;
} = {}) {
  const base  = opts.base  ?? { data: null, error: null };
  const c: Record<string, unknown> = {};
  (['select', 'insert', 'update', 'delete', 'eq', 'filter'] as const).forEach(
    m => (c[m] = vi.fn().mockReturnValue(c)),
  );
  c.then        = (res: (v: unknown) => unknown) => Promise.resolve(base).then(res);
  c.maybeSingle = vi.fn().mockResolvedValue({ data: opts.maybeData ?? null, error: null });
  c.single      = vi.fn().mockResolvedValue({ data: opts.singleData ?? null, error: null });
  c.upsert      = vi.fn().mockResolvedValue({ error: null });
  return c;
}

const mockUser = { id: 'user-1' };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('saveApplication', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when the user is not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const result = await saveApplication('prog-1', 'BSc CS', 'UCT');
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns the existing application id without inserting when one already exists', async () => {
    const chain = makeChain({ maybeData: { id: 'existing-app-id' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await saveApplication('prog-1', 'BSc CS', 'UCT');
    expect(result).toEqual({ id: 'existing-app-id' });
    expect(chain.single).not.toHaveBeenCalled();
  });

  it('inserts a new application and returns the new id when none exists', async () => {
    const chain = makeChain({ singleData: { id: 'new-app-id' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await saveApplication('prog-1', 'BSc CS', 'UCT');
    expect(result).toEqual({ id: 'new-app-id' });
    expect(chain.insert).toHaveBeenCalledOnce();
  });

  it('passes status "draft" and the supplied deadline to the insert', async () => {
    const chain = makeChain({ singleData: { id: 'new-app-id' } });
    const mockFrom = vi.fn().mockReturnValue(chain);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: mockFrom } });

    await saveApplication('prog-1', 'BSc CS', 'UCT', '30 Sep 2026');
    const insertArg = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertArg.status).toBe('draft');
    expect(insertArg.deadline).toBe('30 Sep 2026');
    expect(insertArg.user_id).toBe(mockUser.id);
  });

  it('uses null for deadline when none is supplied', async () => {
    const chain = makeChain({ singleData: { id: 'new-app-id' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    await saveApplication('prog-1', 'BSc CS', 'UCT');
    const insertArg = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertArg.deadline).toBeNull();
  });

  it('returns an error when the insert fails', async () => {
    const chain = makeChain();
    (chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null, error: { message: 'insert failed' },
    });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await saveApplication('prog-1', 'BSc CS', 'UCT');
    expect(result).toEqual({ error: 'insert failed' });
  });
});
