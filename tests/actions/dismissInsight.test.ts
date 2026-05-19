import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { dismissInsight } from '../../app/actions/dismissInsight';

const mockUser = { id: 'user-7' };

function makeChain(err: string | null = null) {
  const chain: Record<string, unknown> = {};
  (['from', 'update', 'eq'] as const).forEach(m => (chain[m] = vi.fn().mockReturnValue(chain)));
  chain.then = (res: (v: unknown) => unknown) =>
    Promise.resolve({ error: err ? { message: err } : null }).then(res);
  return chain;
}

describe('dismissInsight', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    expect(await dismissInsight('insight-1')).toEqual({ error: 'Not authenticated' });
  });

  it('returns { success: true } when the update succeeds', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: mockUser,
      supabase: { from: vi.fn().mockReturnValue(chain) },
    });
    expect(await dismissInsight('insight-1')).toEqual({ success: true });
  });

  it('returns an error when the DB update fails', async () => {
    const chain = makeChain('RLS denied');
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: mockUser,
      supabase: { from: vi.fn().mockReturnValue(chain) },
    });
    expect(await dismissInsight('insight-1')).toEqual({ error: 'RLS denied' });
  });

  it('applies eq filters for both id and user_id', async () => {
    const chain = makeChain(null);
    const eqFn = chain.eq as ReturnType<typeof vi.fn>;
    const fromFn = vi.fn().mockReturnValue(chain);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: fromFn } });
    await dismissInsight('insight-abc');
    const eqCalls = eqFn.mock.calls as [string, string][];
    expect(eqCalls).toEqual(expect.arrayContaining([
      ['id', 'insight-abc'],
      ['user_id', mockUser.id],
    ]));
  });
});
