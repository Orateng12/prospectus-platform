import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { saveSubjectMarks } from '../../app/actions/saveSubjects';
import type { Subject } from '../../lib/types';

// ─── Chain builder ────────────────────────────────────────────────────────────
// saveSubjectMarks uses: from('user_profiles').update({}).eq('id', userId)
// The chain is thenable so awaiting after .eq() resolves with { error }.

function makeChain(error: { message: string } | null = null) {
  const c: Record<string, unknown> = {};
  (['update', 'eq'] as const).forEach(m => (c[m] = vi.fn().mockReturnValue(c)));
  c.then = (res: (v: unknown) => unknown) => Promise.resolve({ error }).then(res);
  return c;
}

const mockUser = { id: 'user-1' };

const subjects: Subject[] = [
  { id: 'math', name: 'Mathematics', mark: 82, designated: true },
  { id: 'eng',  name: 'English',     mark: 65, designated: true },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('saveSubjectMarks', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when the user is not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const result = await saveSubjectMarks(subjects);
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns { success: true } when the update succeeds', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await saveSubjectMarks(subjects);
    expect(result).toEqual({ success: true });
  });

  it('passes the subject array to the update call', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    await saveSubjectMarks(subjects);
    const updateArg = (chain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg.subject_marks).toEqual(subjects);
  });

  it('filters the update by the authenticated user id', async () => {
    const chain = makeChain(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    await saveSubjectMarks(subjects);
    const eqCall = (chain.eq as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(eqCall).toEqual(['id', mockUser.id]);
  });

  it('returns an error when the Supabase update fails', async () => {
    const chain = makeChain({ message: 'row not found' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: { from: vi.fn().mockReturnValue(chain) } });

    const result = await saveSubjectMarks(subjects);
    expect(result).toEqual({ error: 'row not found' });
  });
});
