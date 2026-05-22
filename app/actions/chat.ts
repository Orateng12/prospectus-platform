'use server';

import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '@/lib/supabase/requireAuth';
import { ROUTE_LABELS, type ChatTurn } from '@/lib/chat';

export async function chat(
  history: ChatTurn[],
  userMessage: string,
): Promise<{ text: string; routes: string[]; letters?: Array<{ title: string; content: string }> } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: 'AI not configured' };

  const [profileResult, psychResult, capResult, appsResult] = await Promise.all([
    supabase.from('user_profiles')
      .select('aps_score, first_name, last_name, province, household_income')
      .eq('id', user.id).single(),
    supabase.from('psychological_profiles')
      .select('openness, conscientiousness, extraversion, agreeableness, neuroticism, realistic, investigative, artistic, social, enterprising, conventional, primary_motivation, work_style_preference')
      .eq('user_id', user.id).maybeSingle(),
    supabase.from('capability_graphs')
      .select('analytical_thinking, creative_thinking, leadership_potential, communication_skills, technical_aptitude, entrepreneurial_drive, perseverance')
      .eq('user_id', user.id).maybeSingle(),
    supabase
      .from('student_applications')
      .select('id, status, programmes(name, institutions(name, city))')
      .eq('user_id', user.id)
      .limit(20),
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

  const apps = (appsResult?.data ?? []).map((a: Record<string, unknown>) => {
    const prog = a.programmes as { name: string; institutions: { name: string; city?: string } | null } | null;
    return `${prog?.name ?? 'Unknown Programme'} at ${prog?.institutions?.name ?? 'Unknown Institution'} (${a.status})`;
  });
  const lastName = (profileResult.data as Record<string, unknown> | null)?.last_name as string ?? '';
  const fullName = [profile?.first_name, lastName].filter(Boolean).join(' ') || 'Student';

  const isLetterRequest = /\b(letter|motivation|cover letter|recommenda|application letter)\b/i.test(userMessage);
  const maxTokens = isLetterRequest ? 2500 : 600;

  const systemPrompt = `You are a personalised South African university admissions advisor embedded in the Prospectus platform.
The platform has 1,606 real SA programmes across 61 institutions and 43 verified funding opportunities.

Answer depth: For simple navigation questions, 2–4 sentences suffice. For complex "how does X work" questions, financial decisions, or step-by-step guidance, write as much as needed (numbered lists, bullets, paragraphs). For letters, write complete professional documents.

CRITICAL SA FACTS — never contradict these:
- APS scale: 80–100%=7, 70–79%=6, 60–69%=5, 50–59%=4, 40–49%=3, 30–39%=2, <30=1. Best 6 subjects. Life Orientation EXCLUDED.
- NSFAS income threshold: ≤ R350,000/year combined. Does NOT cover private institutions (IIE, AFDA, STADIO).
- NSFAS Loan-Bursary: R122,001–R350,000/year. Converts to bursary if ≥50% pass rate each year.
- NSFAS payment guarantee: Payments are disbursed per semester if registration is confirmed and you remain enrolled. Delays happen — apply by 31 January; keep all proof of enrolment.
- Taking a student loan while waiting for NSFAS: Risky — if NSFAS later approves, repayment still required. Rather apply for NSFAS first; apply for emergency bridging only if registration is at risk.
- Medicine (MBChB): APS 48–50 minimum, PLUS NBT score and interview. ~200 seats per university per year.
- Law (LLB): standalone 4-year degree at most universities since 2017.
- Engineering: Physical Sciences AND Maths both required at 60%+ minimum.
- UCT uses Faculty Points Score (FPS), not raw APS. Wits uses a weighted APS.
- NSFAS application opens September each year; closes 31 January.

LETTER DRAFTING — when asked to write motivation/cover/application letters:
- Use student full name: ${fullName}
- Use exact institution and programme from the applications list below
- Use today's date: ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
- Format: Date → Institution address block → "Dear Admissions Committee," → "Re: Application for [Programme]" → 4 paragraphs (intro, academic background, motivation, closing) → "Yours sincerely," → ${fullName}
- Wrap EACH letter in: ===LETTER: [Programme Name] — [Institution Name]===\n[full letter content]\n===END LETTER===
- Write all requested letters in one response

End each reply with relevant navigation hints using this exact format on the last line: [→route1] [→route2]
Valid routes: home, programmes, careers, scholarships, simulator, funding, nsfas, deadlines, intelligence, cognitive, skills, map, unis, compare, discover, applications, documents.
Only include routes that are genuinely relevant — omit the navigation line entirely if nothing applies.

--- STUDENT PROFILE ---
${profileLines}

--- APPLICATIONS (${apps.length}) ---
${apps.length > 0 ? apps.join('\n') : 'No applications recorded yet.'}`;

  const client = new Anthropic({ apiKey });

  // Cap history at 10 turns to avoid token explosion
  const cappedHistory = history.slice(-10);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [
      ...cappedHistory.map(t => ({ role: t.role, content: t.content })),
      { role: 'user', content: userMessage },
    ],
  });

  const block = response.content.find(b => b.type === 'text');
  const raw = block?.type === 'text' ? block.text.trim() : '';
  if (!raw) return { error: 'Empty response from AI' };

  // Extract letters first
  const LETTER_RE = /===LETTER: ([^\n=]+)===\n([\s\S]+?)===END LETTER===/g;
  const letters: Array<{ title: string; content: string }> = [];
  let lm: RegExpExecArray | null;
  while ((lm = LETTER_RE.exec(raw)) !== null) {
    letters.push({ title: lm[1].trim(), content: lm[2].trim() });
  }
  const cleanRaw = raw.replace(/===LETTER: [^\n=]+===\n[\s\S]+?===END LETTER===/g, '').trim();

  // Extract [→route] tags from cleanRaw
  const routePattern = /\[→(\w+)\]/g;
  const found = new Set<string>();
  const text = cleanRaw.replace(routePattern, (_, r: string) => {
    if (r in ROUTE_LABELS) found.add(r);
    return '';
  }).trim();

  const displayText = letters.length > 0 && !text
    ? `I've drafted ${letters.length} letter${letters.length !== 1 ? 's' : ''} for you — click "Save as PDF" to export each one.`
    : text;

  return { text: displayText, routes: [...found], letters: letters.length > 0 ? letters : undefined };
}
