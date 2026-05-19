import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { deleteApplication } from '../../app/actions/deleteApplication';

const mockUser = { id: 'user-42' };

function makeChain(error: { message: string } | null = null) {
  const c: Record<string, unknown> = {};
  (['delete', 'eq'] as const).forEach(m => (c[m] = vi.fn().mockReturnValue(c)));
  c.then = (res: (v: unknown) => unknown) => Promise.resolve({ error }).then(res);
  return c;
}

describe('deleteApplication', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    expect(await deleteApplication('id-1')).toEqual({ error: 'Not authenticated' });
  });

  it('returns { success: true } when the delete succeeds', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    expect(await deleteApplication('id-1')).toEqual({ success: true });
  });

  it('returns an error when the DB delete fails', async () => {
    const chain = makeChain({ message: 'row not found' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    expect(await deleteApplication('id-1')).toEqual({ error: 'row not found' });
  });

  it('filters by both id and user_id', async () => {
    const chain = makeChain(null);
    const fromFn = vi.fn().mockReturnValue(chain);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: fromFn } });
    await deleteApplication('app-99');
    expect(fromFn).toHaveBeenCalledWith('student_applications');
    const eqCalls = (chain.eq as ReturnType<typeof vi.fn>).mock.calls;
    expect(eqCalls).toContainEqual(['id', 'app-99']);
    expect(eqCalls).toContainEqual(['user_id', mockUser.id]);
  });
});
