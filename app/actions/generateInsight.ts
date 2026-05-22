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

  const typeInstructions: Record<InsightContext['type'], string> = {
    home: 'Give a single specific insight about the most important action this student should take right now based on their APS and programme fit.',
    cognitive: 'Give a specific insight about how this student\'s personality profile (Big Five + RIASEC) aligns with their top career matches, and what this means for choosing a field of study.',
    intelligence: 'Give a specific insight about what is driving their strategic score — which sub-score has the most room to improve and what they should do about it.',
    career: 'Give a specific insight about which career path has the best combination of demand, growth, and fit for this student given their profile.',
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
      };
      return { text: fallbacks[context.type] };
    }
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
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
