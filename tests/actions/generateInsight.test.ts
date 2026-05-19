import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockCreate, mockRequireAuth } = vi.hoisted(() => ({
  mockCreate:      vi.fn(),
  mockRequireAuth: vi.fn(),
}));

vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

vi.mock('@anthropic-ai/sdk', () => {
  // Must use class syntax — arrow functions cannot be used as constructors.
  class MockAnthropic {
    messages = { create: mockCreate };
  }
  return { default: MockAnthropic };
});

import { generateInsight } from '../../app/actions/generateInsight';
import type { InsightContext } from '../../lib/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const authOk = {
  ok: true as const,
  user: { id: 'user-1', email: 'test@example.com' },
  supabase: {} as any,
};

const baseCtx: InsightContext = {
  type:            'home',
  aps:             35,
  subjects:        [{ id: 'math', name: 'Mathematics', mark: 78, designated: true }],
  psychProfile:    null,
  capabilityData:  null,
  strategicScore:  null,
  topProgrammes:   [],
  topCareers:      [],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('generateInsight', () => {
  beforeEach(() => {
    mockRequireAuth.mockResolvedValue(authOk);
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  // ── Auth guard ───────────────────────────────────────────────────────────────

  it('returns an error when the user is not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const result = await generateInsight(baseCtx);
    expect(result).toEqual({ error: 'Not authenticated' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // ── Missing API key (fallback copy) ──────────────────────────────────────────

  it.each([
    ['home',        /APS|NSFAS|programme/i],
    ['cognitive',   /RIASEC|personality|Data Science|Actuarial/i],
    ['intelligence', /sub-score|APS|Mathematics/i],
    ['career',      /Software|Data Science|demand/i],
  ] as [InsightContext['type'], RegExp][])(
    'returns non-empty fallback text for type "%s" when API key is absent',
    async (type, pattern) => {
      const result = await generateInsight({ ...baseCtx, type });
      expect('text' in result).toBe(true);
      expect((result as { text: string }).text).toMatch(pattern);
      expect(mockCreate).not.toHaveBeenCalled();
    },
  );

  // ── Successful API call ───────────────────────────────────────────────────────

  it('calls the Anthropic API with the correct model when the key is present', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Your APS is strong.' }],
    });
    const result = await generateInsight(baseCtx);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      model:      'claude-opus-4-6',
      max_tokens: 400,
    }));
    expect(result).toEqual({ text: 'Your APS is strong.' });
  });

  it('trims whitespace from the returned text', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '  Padded advice.  ' }],
    });
    const result = await generateInsight(baseCtx);
    expect((result as { text: string }).text).toBe('Padded advice.');
  });

  it('includes the system prompt in the API call', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'OK' }] });
    await generateInsight(baseCtx);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      system: expect.stringContaining('South African'),
    }));
  });

  it('builds a user message that contains the APS score', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'OK' }] });
    await generateInsight({ ...baseCtx, aps: 42 });
    const call = mockCreate.mock.calls[0][0];
    const userMessage = call.messages[0].content as string;
    expect(userMessage).toContain('42');
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────

  it('returns an error when the API returns an empty content array', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockResolvedValue({ content: [] });
    const result = await generateInsight(baseCtx);
    expect(result).toEqual({ error: 'Empty response' });
  });

  it('returns an error when the API throws', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockRejectedValue(new Error('rate limit'));
    const result = await generateInsight(baseCtx);
    expect(result).toEqual({ error: 'Failed to generate insight' });
  });
});
