import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockCreate, mockRequireAuth } = vi.hoisted(() => ({
  mockCreate:      vi.fn(),
  mockRequireAuth: vi.fn(),
}));

vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = { create: mockCreate };
  }
  return { default: MockAnthropic };
});

import { getInsight } from '../../app/actions/getInsight';
import type { InsightContext } from '../../lib/types';

const baseCtx: InsightContext = {
  type:           'home',
  aps:            35,
  subjects:       [],
  psychProfile:   null,
  capabilityData: null,
  strategicScore: null,
  topProgrammes:  [],
  topCareers:     [],
};

function makeSupabase(cached: { id: string; body: string } | null = null, insertId = 'new-insight-id') {
  const selectChain: Record<string, unknown> = {};
  (['select', 'eq', 'gte', 'order', 'limit'] as const).forEach(m => {
    selectChain[m] = vi.fn().mockReturnValue(selectChain);
  });
  selectChain.maybeSingle = vi.fn().mockResolvedValue({ data: cached });

  const insertChain: Record<string, unknown> = {};
  (['insert', 'select'] as const).forEach(m => {
    insertChain[m] = vi.fn().mockReturnValue(insertChain);
  });
  insertChain.single = vi.fn().mockResolvedValue({ data: { id: insertId } });

  let callCount = 0;
  const fromFn = vi.fn().mockImplementation(() => {
    callCount++;
    return callCount === 1 ? selectChain : insertChain;
  });

  return { supabase: { from: fromFn }, selectChain, insertChain };
}

describe('getInsight', () => {
  beforeEach(() => {
    mockRequireAuth.mockReset();
    mockCreate.mockReset();
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    expect(await getInsight(baseCtx)).toEqual({ error: 'Not authenticated' });
  });

  it('returns a cached insight without calling Claude', async () => {
    const { supabase } = makeSupabase({ id: 'cached-id', body: 'Cached insight text.' });
    mockRequireAuth.mockResolvedValue({ ok: true, user: { id: 'u1' }, supabase });
    const result = await getInsight(baseCtx);
    expect(result).toEqual({ text: 'Cached insight text.', id: 'cached-id' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('calls Claude and persists the result when no cache exists', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const { supabase, insertChain } = makeSupabase(null, 'new-id');
    mockRequireAuth.mockResolvedValue({ ok: true, user: { id: 'u1' }, supabase });
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'Fresh insight.' }] });

    const result = await getInsight(baseCtx);
    expect(result).toEqual({ text: 'Fresh insight.', id: 'new-id' });
    expect(insertChain.insert as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Fresh insight.', type: 'home', dismissed: false }),
    );
  });

  it('bypasses the cache when force=true', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const { supabase, selectChain } = makeSupabase({ id: 'stale-id', body: 'Stale insight.' }, 'new-id');
    mockRequireAuth.mockResolvedValue({ ok: true, user: { id: 'u1' }, supabase });
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'Forced fresh insight.' }] });

    const result = await getInsight(baseCtx, true);
    expect((result as { text: string }).text).toBe('Forced fresh insight.');
    expect(selectChain.maybeSingle as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
  });

  it('still returns generated text even when DB persistence fails', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const { supabase, insertChain } = makeSupabase(null);
    (insertChain.single as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB down'));
    mockRequireAuth.mockResolvedValue({ ok: true, user: { id: 'u1' }, supabase });
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'Still works.' }] });

    const result = await getInsight(baseCtx);
    expect('text' in result).toBe(true);
    expect((result as { text: string }).text).toBe('Still works.');
  });

  it('returns the fallback text (no API key) without persisting to DB', async () => {
    const { supabase, insertChain } = makeSupabase(null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: { id: 'u1' }, supabase });

    const result = await getInsight(baseCtx);
    expect('text' in result).toBe(true);
    expect((insertChain.insert as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });
});
