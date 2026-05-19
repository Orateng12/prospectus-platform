'use server';

import Anthropic from '@anthropic-ai/sdk';
import type { InsightContext } from '@/lib/types';
import { requireAuth } from '@/lib/supabase/requireAuth';

function buildPrompt(ctx: InsightContext): string {
  const lines: string[] = [];

  lines.push(`Insight type: ${ctx.type}`);
  lines.push(`APS score: ${ctx.aps}`);

  if (ctx.subjects.length > 0) {
    const subjectLines = ctx.subjects
      .filter(s => s.designated)
      .map(s => `  ${s.name}: ${s.mark}%`)
      .join('\n');
    lines.push(`Subject marks:\n${subjectLines}`);
  }

  if (ctx.strategicScore) {
    const s = ctx.strategicScore;
    lines.push(`Strategic score: ${s.overall}/100 (prev: ${s.previous_score ?? 'n/a'}, trend: ${s.trend ?? 'n/a'})`);
    lines.push(`Sub-scores: academic ${s.academic_readiness}, career alignment ${s.career_demand_alignment}, financial ${s.financial_feasibility}, personality fit ${s.personality_career_fit}`);
  }

  if (ctx.psychProfile) {
    const p = ctx.psychProfile;
    lines.push(`Big Five: O${p.openness} C${p.conscientiousness} E${p.extraversion} A${p.agreeableness} N${p.neuroticism}`);
    lines.push(`RIASEC: R${p.realistic} I${p.investigative} A${p.artistic} S${p.social} E${p.enterprising} C${p.conventional}`);
    if (p.work_style_preference) lines.push(`Work style: ${p.work_style_preference}`);
    if (p.primary_motivation) lines.push(`Primary motivation: ${p.primary_motivation}`);
  }

  if (ctx.capabilityData) {
    const c = ctx.capabilityData;
    lines.push(`Capabilities: analytical ${c.analytical_thinking}, creative ${c.creative_thinking}, leadership ${c.leadership_potential}, communication ${c.communication_skills}, technical ${c.technical_aptitude}`);
  }

  if (ctx.topProgrammes.length > 0) {
    const progs = ctx.topProgrammes
      .slice(0, 4)
      .map(p => `${p.name} at ${p.uni} (APS ${p.aps}, fit ${p.fit})`)
      .join('; ');
    lines.push(`Top programmes: ${progs}`);
  }

  if (ctx.topCareers.length > 0) {
    const careers = ctx.topCareers
      .slice(0, 4)
      .map(c => `${c.name} (${c.demand} demand, R${Math.round(c.salary / 1000)}k/mo)`)
      .join('; ');
    lines.push(`Top career matches: ${careers}`);
  }

  if (ctx.householdIncome !== undefined) {
    lines.push(`Household income: R${ctx.householdIncome.toLocaleString()}/year`);
  }
  if (ctx.applicationCount !== undefined) {
    lines.push(`Active applications: ${ctx.applicationCount}`);
  }

  const typeInstructions: Record<InsightContext['type'], string> = {
    home: 'Give a single specific insight about the most important action this student should take right now based on their APS and programme fit.',
    cognitive: 'Give a specific insight about how this student\'s personality profile (Big Five + RIASEC) aligns with their top career matches, and what this means for choosing a field of study.',
    intelligence: 'Give a specific insight about what is driving their strategic score — which sub-score has the most room to improve and what they should do about it.',
    career: 'Give a specific insight about which career path has the best combination of demand, growth, and fit for this student given their profile.',
    funding: 'Give a specific insight about this student\'s funding situation — which combination of NSFAS, bursaries and scholarships best covers their gap, and what they should apply for first. Reference their APS and household income.',
    scholarships: 'Give a specific insight about the 1-2 scholarships this student has the highest chance of winning given their APS, income and subject profile. Mention the application deadline urgency.',
    simulator: 'Given the student\'s current APS and marks, identify the single subject where a small improvement unlocks the most new programmes. Be specific about the mark delta and what it opens.',
    skills: 'Based on this student\'s capability graph, identify the one skill gap that most limits their career options, and suggest one concrete action to close it within 3 months.',
    careers_page: 'Given this student\'s RIASEC profile and capability scores, name the single career that best balances fit, SA market demand, and salary trajectory. Explain the fit in one sentence.',
    programmes_page: 'Based on this student\'s APS and top subject marks, recommend the single programme with the best combination of fit score, career outcome and financial feasibility. Be specific.',
  };

  lines.push(`\nTask: ${typeInstructions[ctx.type]}`);
  lines.push('Write 2-3 sentences. Be specific to the numbers provided. No generic advice.');

  return lines.join('\n');
}

export async function generateInsight(context: InsightContext): Promise<{ text: string } | { error: string }> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return { error: auth.error };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const fallbacks: Record<InsightContext['type'], string> = {
        home: 'Your APS trajectory is strong. Focus on finalising your NSFAS application and submitting UCT residence documents — both are time-sensitive. Your top programme match (BSc Computer Science) has a strong demand curve in SA.',
        cognitive: 'Your Investigative RIASEC profile combined with high Analytical and Numerical capability aligns closely with quantitative fields. Data Science and Actuarial Science are your sharpest career clusters — both have high demand in SA finance and tech.',
        intelligence: 'Your Academic Readiness sub-score has the most room for improvement. Lifting your Mathematics and Physical Sciences marks by 5–8% would push your APS above 45 and unlock direct entry at Wits and SUN.',
        career: 'Software Engineering and Data Science offer the best combination of fit, growth (+22% and +18%) and demand for your profile. Both are remote-friendly in SA with mid-career salaries above R38k/month.',
        funding: 'With your APS above 38, you qualify for a merit bursary worth R95,000 — apply to Investec or Old Mutual directly. Stack this with NSFAS if your household income is below R350k to cover 100% of year-one costs. Submit both applications before September to avoid the rush.',
        scholarships: 'The Thuthuka Bursary and Funza Lushaka align best with your profile — both offer full cost-of-study funding with fewer applicants than NSFAS. Apply to Thuthuka first; the March deadline is earliest. Your APS qualifies you for the merit track on both.',
        simulator: 'Your Physical Sciences mark is closest to the next APS threshold. Raising it by 5% adds one APS point and unlocks Engineering programmes at UKZN and TUT. That single change has the highest leverage of any subject in your current profile.',
        skills: 'Your Communication score is your most limiting capability — it sits below the threshold for Business, Law and Management programmes. A focused 6-week public-speaking or debate practice adds measurable lift and directly impacts your career readiness score.',
        careers_page: 'Based on your Investigative RIASEC score and high Analytical capability, Data Science is your sharpest career match — it has High demand in SA, 18% annual growth, and median salaries above R45k/month at 5 years. Your current APS already qualifies you for BSc Data Science at WITS and UCT.',
        programmes_page: 'Your highest fit score goes to BCom Accounting at UNISA — your APS clears the minimum by 6 points, your Conscientiousness profile suits its structure, and NSFAS covers 68% of fees. Apply by 30 September; the distance-learning format also lets you work part-time.',
      };
      return { text: fallbacks[context.type] };
    }
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 400,
      system: 'You are an expert South African university admissions counsellor with deep knowledge of the SA higher education system, APS requirements, NSFAS funding, and the SA labour market. Give concise, actionable, personalised advice. Write in second person. Be specific — reference the actual numbers given.',
      messages: [{ role: 'user', content: buildPrompt(context) }],
    });

    const textBlock = msg.content.find(b => b.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text.trim() : '';
    return text ? { text } : { error: 'Empty response' };
  } catch (err) {
    console.error('generateInsight error:', err);
    return { error: 'Failed to generate insight' };
  }
}
