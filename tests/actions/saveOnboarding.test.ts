import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }));

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { saveOnboarding } from '../../app/actions/saveOnboarding';
import type { OnboardingData } from '../../lib/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseData: OnboardingData = {
  firstName: 'Thabo',
  lastName:  'Mokoena',
  province:  'Gauteng',
  matricYear: 2024,
  subjects: [
    { id: 'math', name: 'Mathematics',      mark: 78, designated: true },
    { id: 'eng',  name: 'English',          mark: 62, designated: true },
    { id: 'phy',  name: 'Physics',          mark: 71, designated: true },
    { id: 'bio',  name: 'Biology',          mark: 74, designated: true },
    { id: 'his',  name: 'History',          mark: 68, designated: true },
    { id: 'lo',   name: 'Life Orientation', mark: 80, designated: false },
    { id: 'ses',  name: 'Sesotho',          mark: 84, designated: true },
  ],
  openness: 78, conscientiousness: 84, extraversion: 52, agreeableness: 68, neuroticism: 34,
  realistic: 62, investigative: 88, artistic: 48, social: 64, enterprising: 71, conventional: 56,
  primary_motivation: 'impact', work_style_preference: 'hybrid',
  analytical_thinking: 86, creative_thinking: 62, leadership_potential: 58,
  communication_skills: 64, technical_aptitude: 79, entrepreneurial_drive: 51,
  risk_tolerance_score: 55, perseverance: 73,
  householdIncome: 280_000,
};

/** Returns a fresh chainable Supabase mock with configurable per-table upsert/insert results. */
function makeSupabase(upsertResults: Array<{ error: null | { message: string } }>) {
  let callCount = 0;
  const upsertFn = vi.fn().mockImplementation(() =>
    Promise.resolve(upsertResults[callCount++] ?? { error: null }),
  );
  const insertFn = vi.fn().mockResolvedValue({ error: null });
  return {
    upsertFn,
    insertFn,
    client: {
      from: vi.fn().mockReturnValue({
        upsert: upsertFn,
        insert: insertFn,
      }),
    },
  };
}

const mockUser = { id: 'user-1', email: 'thabo@example.com' };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('saveOnboarding', () => {
  beforeEach(() => {
    mockRequireAuth.mockReset();
    mockRedirect.mockReset();
  });

  it('returns an error immediately when the user is not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const result = await saveOnboarding(baseData);
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns an error when the user_profiles upsert fails', async () => {
    const { client } = makeSupabase([{ error: { message: 'profile DB error' } }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await saveOnboarding(baseData);
    expect(result).toEqual({ error: 'profile DB error' });
  });

  it('returns an error when the psychological_profiles upsert fails', async () => {
    const { client } = makeSupabase([
      { error: null },                            // user_profiles OK
      { error: { message: 'psych DB error' } },   // psychological_profiles FAIL
      { error: null },                            // capability_graphs OK
    ]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await saveOnboarding(baseData);
    expect(result).toEqual({ error: 'psych DB error' });
  });

  it('returns an error when the capability_graphs upsert fails', async () => {
    const { client } = makeSupabase([
      { error: null },                           // user_profiles OK
      { error: null },                           // psychological_profiles OK
      { error: { message: 'cap DB error' } },    // capability_graphs FAIL
    ]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    const result = await saveOnboarding(baseData);
    expect(result).toEqual({ error: 'cap DB error' });
  });

  it('redirects to /dashboard on full success', async () => {
    const { client } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('passes the user id and email to the user_profiles upsert', async () => {
    const { client, upsertFn } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    const firstCall = upsertFn.mock.calls[0][0];
    expect(firstCall.id).toBe(mockUser.id);
    expect(firstCall.email).toBe(mockUser.email);
  });

  it('derives academic_readiness as the mean of analytical_thinking and perseverance', async () => {
    const { client, upsertFn } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    // capability_graphs upsert is call index 2 (0=user_profiles, 1=psych, 2=caps)
    const capCall = upsertFn.mock.calls[2][0];
    const expected = Math.round((baseData.analytical_thinking + baseData.perseverance) / 2);
    expect(capCall.academic_readiness).toBe(expected);
  });

  it('derives career_readiness as the mean of communication_skills and leadership_potential', async () => {
    const { client, upsertFn } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    const capCall = upsertFn.mock.calls[2][0];
    const expected = Math.round((baseData.communication_skills + baseData.leadership_potential) / 2);
    expect(capCall.career_readiness).toBe(expected);
  });

  it('calculates APS from subjects and passes it to user_profiles', async () => {
    const { client, upsertFn } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    const profileCall = upsertFn.mock.calls[0][0];
    // Non-LO subjects: math=78→6, eng=62→5, phy=71→6, bio=74→6, his=68→5, ses=84→7
    // best 6 of [6,5,6,6,5,7] = [7,6,6,6,5,5] = 35
    expect(profileCall.aps_score).toBe(35);
  });

  it('inserts a strategic score record with the correct overall score', async () => {
    const { client, insertFn } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    expect(insertFn).toHaveBeenCalledOnce();
    const insertArg = insertFn.mock.calls[0][0];
    // overall must be a number in a reasonable range
    expect(insertArg.overall).toBeGreaterThan(0);
    expect(insertArg.overall).toBeLessThanOrEqual(100);
    expect(insertArg.user_id).toBe(mockUser.id);
    expect(insertArg.trend).toBe('stable');
    expect(insertArg.previous_score).toBeNull();
  });

  it('still redirects when the strategic score insert returns an error (non-blocking)', async () => {
    // "Non-blocking" means the returned error object is NOT checked — execution continues.
    // A thrown rejection would propagate, but a resolved { error } is silently ignored.
    const { client, insertFn } = makeSupabase([{ error: null }, { error: null }, { error: null }]);
    insertFn.mockResolvedValue({ error: { message: 'insert failed' } });
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase: client });
    await saveOnboarding(baseData);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});
