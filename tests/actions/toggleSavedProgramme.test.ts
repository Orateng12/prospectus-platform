import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { toggleSavedProgramme } from '../../app/actions/toggleSavedProgramme';

// ─── Chain builder ────────────────────────────────────────────────────────────
// toggleSavedProgramme uses:
//   delete().eq().eq()  → awaitable result
//   insert({})          → awaitable result
// The chain is thenable so awaiting the chain at .eq() works.

function makeChain(result: { error?: { message: string } | null } = {}) {
  const r = { error: result.error ?? null };
  const c: Record<string, unknown> = {};
  (['delete', 'insert', 'eq'] as const).forEach(m => (c[m] = vi.fn().mockReturnValue(c)));
  c.then = (res: (v: unknown) => unknown) => Promise.resolve(r).then(res);
  return c;
}

const mockUser = { id: 'user-1' };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('toggleSavedProgramme', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when the user is not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const result = await toggleSavedProgramme('prog-1', false);
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  // ── Unsave (currentlySaved = true) ───────────────────────────────────────────

  it('deletes the saved programme and returns { saved: false } when it was saved', async () => {
    const chain = makeChain();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await toggleSavedProgramme('prog-1', true);
    expect(chain.delete).toHaveBeenCalledOnce();
    expect(result).toEqual({ saved: false });
  });

  it('filters the delete by both user_id and programme_id', async () => {
    const chain = makeChain();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    await toggleSavedProgramme('prog-42', true);
    const eqCalls = (chain.eq as ReturnType<typeof vi.fn>).mock.calls;
    expect(eqCalls).toContainEqual(['user_id', mockUser.id]);
    expect(eqCalls).toContainEqual(['programme_id', 'prog-42']);
  });

  it('returns an error when the delete fails', async () => {
    const chain = makeChain({ error: { message: 'delete failed' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await toggleSavedProgramme('prog-1', true);
    expect(result).toEqual({ error: 'delete failed' });
  });

  // ── Save (currentlySaved = false) ────────────────────────────────────────────

  it('inserts the saved programme and returns { saved: true } when it was not saved', async () => {
    const chain = makeChain();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await toggleSavedProgramme('prog-1', false);
    expect(chain.insert).toHaveBeenCalledOnce();
    expect(result).toEqual({ saved: true });
  });

  it('inserts with the correct user_id and programme_id', async () => {
    const chain = makeChain();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    await toggleSavedProgramme('prog-99', false);
    const insertArg = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertArg.user_id).toBe(mockUser.id);
    expect(insertArg.programme_id).toBe('prog-99');
  });

  it('returns an error when the insert fails', async () => {
    const chain = makeChain({ error: { message: 'duplicate key' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await toggleSavedProgramme('prog-1', false);
    expect(result).toEqual({ error: 'duplicate key' });
  });
});
