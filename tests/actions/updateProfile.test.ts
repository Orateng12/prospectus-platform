import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

// computeStrategicScore is called only on the income path; spy on its return.
const { mockComputeStrategicScore } = vi.hoisted(() => ({ mockComputeStrategicScore: vi.fn() }));
vi.mock('@/lib/scoring', () => ({ computeStrategicScore: mockComputeStrategicScore }));

import { updateProfile } from '../../app/actions/updateProfile';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockUser = { id: 'user-99', email: 'tester@example.com' };

const fakeScore = {
  overall: 72, academic_readiness: 68, career_demand_alignment: 65,
  financial_feasibility: 90, global_mobility_potential: 60,
  personality_career_fit: 70, skill_readiness: 75,
};

/** Returns a Supabase mock covering the call shapes in updateProfile. */
function makeSupabase({
  upsertError = null,
  profileAps = 32,
  psychData = { openness: 70 },
  capData = { analytical_thinking: 65 },
  insertError = null,
}: {
  upsertError?: { message: string } | null;
  profileAps?: number;
  psychData?: object | null;
  capData?: object | null;
  insertError?: { message: string } | null;
} = {}) {
  // upsert on user_profiles
  const upsertFn = vi.fn().mockResolvedValue({ error: upsertError });

  // select chain for aps_score, psych, cap (used only on income path)
  const singleFn   = vi.fn().mockResolvedValue({ data: { aps_score: profileAps } });
  const maybeSinglePsych = vi.fn().mockResolvedValue({ data: psychData });
  const maybeSingleCap   = vi.fn().mockResolvedValue({ data: capData });
  const eqFn       = vi.fn().mockReturnThis();

  // strategic_score_records insert
  const insertFn = vi.fn().mockResolvedValue({ error: insertError });

  // Build a from() that routes by table name
  const fromFn = vi.fn().mockImplementation((table: string) => {
    if (table === 'user_profiles') {
      return {
        upsert: upsertFn,
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: singleFn }) }),
      };
    }
    if (table === 'psychological_profiles') {
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: maybeSinglePsych }) }) };
    }
    if (table === 'capability_graphs') {
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: maybeSingleCap }) }) };
    }
    if (table === 'strategic_score_records') {
      return { insert: insertFn };
    }
    return { eq: eqFn };
  });

  return { client: { from: fromFn }, upsertFn, insertFn };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  beforeEach(() => {
    mockRequireAuth.mockReset();
    mockComputeStrategicScore.mockReset();
    mockComputeStrategicScore.mockReturnValue(fakeScore);
  });

  it('returns an error when the user is not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const result = await updateProfile({ firstName: 'Thabo' });
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns an error when the user_profiles upsert fails', async () => {
    const { client } = makeSupabase({ upsertError: { message: 'constraint violation' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await updateProfile({ firstName: 'Thabo' });
    expect(result).toEqual({ error: 'constraint violation' });
  });

  it('returns { success: true } on a successful name update', async () => {
    const { client } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await updateProfile({ firstName: 'Thabo', lastName: 'Dlamini' });
    expect(result).toEqual({ success: true });
  });

  it('maps firstName/lastName/province to the correct DB column names', async () => {
    const { client, upsertFn } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await updateProfile({ firstName: 'Thabo', lastName: 'Dlamini', province: 'Gauteng' });
    const upsertArg = upsertFn.mock.calls[0][0];
    expect(upsertArg.first_name).toBe('Thabo');
    expect(upsertArg.last_name).toBe('Dlamini');
    expect(upsertArg.province).toBe('Gauteng');
    expect(upsertArg.id).toBe(mockUser.id);
  });

  it('does not include undefined fields in the upsert payload', async () => {
    const { client, upsertFn } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await updateProfile({ province: 'Limpopo' });
    const upsertArg = upsertFn.mock.calls[0][0];
    expect('first_name' in upsertArg).toBe(false);
    expect('last_name' in upsertArg).toBe(false);
    expect('household_income' in upsertArg).toBe(false);
    expect(upsertArg.province).toBe('Limpopo');
  });

  it('does NOT call computeStrategicScore when householdIncome is not in the input', async () => {
    const { client } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await updateProfile({ firstName: 'Thabo' });
    expect(mockComputeStrategicScore).not.toHaveBeenCalled();
  });

  it('calls computeStrategicScore and inserts a strategic score when householdIncome is provided', async () => {
    const { client, insertFn } = makeSupabase({ profileAps: 36 });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await updateProfile({ householdIncome: 300_000 });
    expect(mockComputeStrategicScore).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      36,
      300_000,
    );
    expect(insertFn).toHaveBeenCalledOnce();
    const insertArg = insertFn.mock.calls[0][0];
    expect(insertArg.user_id).toBe(mockUser.id);
    expect(insertArg.overall).toBe(fakeScore.overall);
    expect(insertArg.trend).toBe('stable');
    expect(insertArg.previous_score).toBeNull();
  });

  it('still returns { success: true } even when the strategic score insert fails (non-blocking)', async () => {
    const { client } = makeSupabase({ insertError: { message: 'insert failed' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await updateProfile({ householdIncome: 250_000 });
    expect(result).toEqual({ success: true });
  });

  it('skips strategic score insert when psych or capability data is absent', async () => {
    const { client, insertFn } = makeSupabase({ psychData: null });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await updateProfile({ householdIncome: 200_000 });
    expect(mockComputeStrategicScore).not.toHaveBeenCalled();
    expect(insertFn).not.toHaveBeenCalled();
  });
});
