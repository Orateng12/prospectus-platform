import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { updateApplication } from '../../app/actions/updateApplication';

const mockUser = { id: 'user-42' };

function makeChain(error: { message: string } | null = null) {
  const c: Record<string, unknown> = {};
  (['update', 'eq'] as const).forEach(m => (c[m] = vi.fn().mockReturnValue(c)));
  c.then = (res: (v: unknown) => unknown) => Promise.resolve({ error }).then(res);
  return c;
}

describe('updateApplication', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    expect(await updateApplication('id-1', { status: 'submitted' })).toEqual({ error: 'Not authenticated' });
  });

  it('returns { success: true } when the update succeeds', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    expect(await updateApplication('id-1', { status: 'submitted' })).toEqual({ success: true });
  });

  it('returns an error when the DB update fails', async () => {
    const chain = makeChain({ message: 'row not found' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    expect(await updateApplication('id-1', { status: 'accepted' })).toEqual({ error: 'row not found' });
  });

  it('sets applied_at when status is submitted', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    await updateApplication('id-1', { status: 'submitted' });
    const updateArg = (chain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg.applied_at).toBeDefined();
    expect(updateArg.status).toBe('submitted');
  });

  it('does NOT set applied_at when status is accepted', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    await updateApplication('id-1', { status: 'accepted' });
    const updateArg = (chain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect('applied_at' in updateArg).toBe(false);
  });

  it('includes notes in the update when provided', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });
    await updateApplication('id-1', { notes: 'remember to attach CV' });
    const updateArg = (chain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg.notes).toBe('remember to attach CV');
  });
});
