import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { toggleScholarshipApplication } from '../../app/actions/toggleScholarshipApplication';

const mockUser = { id: 'user-77' };

function makeSupabase({ existing = null as { id: string } | null, insertError = null as { message: string } | null, deleteError = null as { message: string } | null } = {}) {
  const maybeSingleFn = vi.fn().mockResolvedValue({ data: existing });
  const deleteThen = vi.fn().mockImplementation((res: (v: unknown) => unknown) => Promise.resolve({ error: deleteError }).then(res));
  const deleteFn   = vi.fn().mockReturnValue({ then: deleteThen });
  const insertFn   = vi.fn().mockResolvedValue({ error: insertError });

  const fromFn = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: maybeSingleFn }) }) }),
    delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ then: deleteThen }) }),
    insert: insertFn,
  });
  return { client: { from: fromFn }, insertFn, deleteThen };
}

describe('toggleScholarshipApplication', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    expect(await toggleScholarshipApplication('NSFAS')).toEqual({ error: 'Not authenticated' });
  });

  it('inserts a new row and returns { applied: true } when not previously applied', async () => {
    const { client, insertFn } = makeSupabase({ existing: null });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await toggleScholarshipApplication('Investec Bursary');
    expect(result).toEqual({ applied: true });
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: mockUser.id, scholarship_name: 'Investec Bursary' }),
    );
  });

  it('deletes the existing row and returns { applied: false } when already applied', async () => {
    const { client } = makeSupabase({ existing: { id: 'row-123' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await toggleScholarshipApplication('Investec Bursary');
    expect(result).toEqual({ applied: false });
  });

  it('returns an error when insert fails', async () => {
    const { client } = makeSupabase({ existing: null, insertError: { message: 'unique violation' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    expect(await toggleScholarshipApplication('NSFAS')).toEqual({ error: 'unique violation' });
  });
});
