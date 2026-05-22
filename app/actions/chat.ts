'use server';

import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '@/lib/supabase/requireAuth';
import { ROUTE_LABELS, type ChatTurn } from '@/lib/chat';

export async function chat(
  history: ChatTurn[],
  userMessage: string,
): Promise<{ text: string; routes: string[] } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: 'AI not configured' };

  const [profileResult, psychResult, capResult] = await Promise.all([
    supabase.from('user_profiles')
      .select('aps_score, first_name, province, household_income')
      .eq('id', user.id).single(),
    supabase.from('psychological_profiles')
      .select('openness, conscientiousness, extraversion, agreeableness, neuroticism, realistic, investigative, artistic, social, enterprising, conventional, primary_motivation, work_style_preference')
      .eq('user_id', user.id).maybeSingle(),
    supabase.from('capability_graphs')
      .select('analytical_thinking, creative_thinking, leadership_potential, communication_skills, technical_aptitude, entrepreneurial_drive, perseverance')
      .eq('user_id', user.id).maybeSingle(),
  ]);

  const profile = profileResult.data;
  const psych = psychResult.data;
  const cap = capResult.data;

  const profileLines = [
    profile
      ? `APS: ${profile.aps_score ?? 'unknown'}, Province: ${profile.province ?? 'unset'}, Household income: R${profile.household_income ?? 'unknown'}/yr`
      : 'Profile not yet set.',
    psych ? `Big Five: O${psych.openness} C${psych.conscientiousness} E${psych.extraversion} A${psych.agreeableness} N${psych.neuroticism}` : '',
    psych ? `RIASEC: R${psych.realistic} I${psych.investigative} A${psych.artistic} S${psych.social} E${psych.enterprising} C${psych.conventional}` : '',
    psych?.primary_motivation ? `Motivation: ${psych.primary_motivation}` : '',
    psych?.work_style_preference ? `Work style: ${psych.work_style_preference}` : '',
    cap ? `Capabilities (0–100): analytical ${cap.analytical_thinking}, creative ${cap.creative_thinking}, leadership ${cap.leadership_potential}, communication ${cap.communication_skills}, technical ${cap.technical_aptitude}` : '',
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are a personalised South African university admissions advisor embedded in the Prospectus platform.
The platform has 1,606 real SA programmes across 61 institutions and 43 verified funding opportunities.
Give concise, specific, actionable advice in 2–4 sentences per answer. Reference the student's actual numbers when relevant.
When recommending programmes or careers, prefer specifics (e.g. "BSc Actuarial Science at Wits — APS 38") over generics ("STEM degrees").

CRITICAL SA FACTS — never contradict these:
- APS scale: 80–100%=7, 70–79%=6, 60–69%=5, 50–59%=4, 40–49%=3, 30–39%=2, <30=1. Best 6 subjects count. Life Orientation is EXCLUDED.
- NSFAS income threshold: household income ≤ R350,000/year combined. NSFAS does NOT cover private institutions (IIE, AFDA, STADIO).
- NSFAS Loan-Bursary tier: R122,001–R350,000/year. Converts to bursary if you pass each year (≥50% pass rate).
- Medicine (MBChB): APS 48–50 minimum, PLUS NBT score and interview required. Only ~200 seats per university per year.
- Law (LLB): standalone 4-year degree at most universities since 2017 — not a 3-year add-on.
- Engineering: Physical Sciences AND Maths both required at 60%+ minimum.
- UCT uses Faculty Points Score (FPS), not raw APS. Wits uses a weighted APS.
- NSFAS application opens September each year; closes 31 January.

End each reply with relevant navigation hints using this exact format on the last line: [→route1] [→route2]
Valid routes: home, programmes, careers, scholarships, simulator, funding, nsfas, deadlines, intelligence, cognitive, skills, map, unis, compare, discover, applications, documents.
Only include routes that are genuinely relevant — omit the navigation line entirely if nothing applies.

--- STUDENT PROFILE ---
${profileLines}`;

  const client = new Anthropic({ apiKey });

  // Cap history at 10 turns to avoid token explosion
  const cappedHistory = history.slice(-10);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [
      ...cappedHistory.map(t => ({ role: t.role, content: t.content })),
      { role: 'user', content: userMessage },
    ],
  });

  const block = response.content.find(b => b.type === 'text');
  const raw = block?.type === 'text' ? block.text.trim() : '';
  if (!raw) return { error: 'Empty response from AI' };

  // Extract [→route] tags from the last line
  const routePattern = /\[→(\w+)\]/g;
  const found = new Set<string>();
  const text = raw.replace(routePattern, (_, r: string) => {
    if (r in ROUTE_LABELS) found.add(r);
    return '';
  }).trim();

  return { text, routes: [...found] };
}
