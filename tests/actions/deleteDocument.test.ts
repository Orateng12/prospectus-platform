import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { deleteDocument } from '../../app/actions/deleteDocument';

const mockUser = { id: 'user-42' };

function makeSupabase(opts: {
  fetchData?: { storage_path: string } | null;
  fetchErr?: string | null;
  storageErr?: string | null;
  dbDeleteErr?: string | null;
} = {}) {
  const {
    fetchData = { storage_path: 'user-42/id.pdf' },
    fetchErr = null,
    storageErr = null,
    dbDeleteErr = null,
  } = opts;

  const mockRemove = vi.fn().mockResolvedValue({ error: storageErr ? { message: storageErr } : null });
  const mockStorageFrom = vi.fn().mockReturnValue({ remove: mockRemove });

  let callCount = 0;
  const makeChain = (err: string | null, data: unknown = null) => {
    const chain: Record<string, unknown> = {};
    (['from', 'select', 'eq', 'single', 'delete'] as const).forEach(m => {
      chain[m] = vi.fn().mockReturnValue(chain);
    });
    chain.then = (res: (v: unknown) => unknown) =>
      Promise.resolve({ data, error: err ? { message: err } : null }).then(res);
    return chain;
  };

  const fromFn = vi.fn().mockImplementation(() => {
    callCount++;
    if (callCount === 1) return makeChain(fetchErr, fetchData);
    return makeChain(dbDeleteErr);
  });

  return {
    supabase: {
      storage: { from: mockStorageFrom },
      from: fromFn,
    },
    mockRemove,
  };
}

describe('deleteDocument', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    expect(await deleteDocument('id')).toEqual({ error: 'Not authenticated' });
  });

  it('returns an error when the document is not found in the DB', async () => {
    const { supabase } = makeSupabase({ fetchData: null, fetchErr: 'no rows' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    expect(await deleteDocument('id')).toEqual({ error: 'no rows' });
  });

  it('returns a generic error when fetch returns null without an error message', async () => {
    const { supabase } = makeSupabase({ fetchData: null, fetchErr: null });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    expect(await deleteDocument('id')).toEqual({ error: 'Document not found' });
  });

  it('returns an error when the storage delete fails', async () => {
    const { supabase } = makeSupabase({ storageErr: 'object not found' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    expect(await deleteDocument('id')).toEqual({ error: 'object not found' });
  });

  it('returns an error when the DB delete fails', async () => {
    const { supabase } = makeSupabase({ dbDeleteErr: 'RLS violation' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    expect(await deleteDocument('id')).toEqual({ error: 'RLS violation' });
  });

  it('returns { success: true } on complete success', async () => {
    const { supabase } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    expect(await deleteDocument('id')).toEqual({ success: true });
  });

  it('calls storage.remove with the correct path', async () => {
    const { supabase, mockRemove } = makeSupabase({
      fetchData: { storage_path: 'user-42/matric.pdf' },
    });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    await deleteDocument('matric');
    expect(mockRemove).toHaveBeenCalledWith(['user-42/matric.pdf']);
  });
});
