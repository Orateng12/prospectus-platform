'use server';

import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from '@/lib/supabase/requireAuth';
import type { PsychProfileData, CapabilityData } from '@/lib/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  aps: number;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  householdIncome?: number;
}

function buildSystemPrompt(
  aps: number,
  psychProfile?: PsychProfileData | null,
  capabilityData?: CapabilityData | null,
  householdIncome?: number,
): string {
  const lines: string[] = [
    'You are Prospectus AI — an expert South African university admissions counsellor embedded in the Prospectus student platform.',
    'You have deep knowledge of SA higher education (NSFAS, APS requirements, university rankings, bursaries), the SA labour market, and career pathways.',
    '',
    'STUDENT PROFILE:',
    `APS score: ${aps}`,
  ];

  if (householdIncome) {
    lines.push(`Household income: R${householdIncome.toLocaleString()}/year`);
    lines.push(`NSFAS eligibility: ${householdIncome < 350000 ? 'Eligible (income below R350k threshold)' : 'Not eligible (income above R350k threshold)'}`);
  }

  if (psychProfile) {
    const { realistic: r, investigative: i, artistic: a, social: s, enterprising: e, conventional: c } = psychProfile;
    const riasec = [
      { k: 'Realistic', v: r },
      { k: 'Investigative', v: i },
      { k: 'Artistic', v: a },
      { k: 'Social', v: s },
      { k: 'Enterprising', v: e },
      { k: 'Conventional', v: c },
    ].sort((x, y) => y.v - x.v);
    lines.push(`RIASEC (dominant first): ${riasec.map(x => `${x.k} ${x.v}`).join(', ')}`);
    lines.push(`Big Five: Openness ${psychProfile.openness}, Conscientiousness ${psychProfile.conscientiousness}, Extraversion ${psychProfile.extraversion}, Agreeableness ${psychProfile.agreeableness}, Neuroticism ${psychProfile.neuroticism}`);
    if (psychProfile.primary_motivation) lines.push(`Primary motivation: ${psychProfile.primary_motivation}`);
    if (psychProfile.work_style_preference) lines.push(`Work style: ${psychProfile.work_style_preference}`);
  }

  if (capabilityData) {
    const c = capabilityData;
    lines.push(`Capabilities (0–100): analytical ${c.analytical_thinking}, creative ${c.creative_thinking}, leadership ${c.leadership_potential}, communication ${c.communication_skills}, technical ${c.technical_aptitude}, entrepreneurial ${c.entrepreneurial_drive}, risk tolerance ${c.risk_tolerance_score}, perseverance ${c.perseverance}, academic readiness ${c.academic_readiness}, career readiness ${c.career_readiness}`);
  }

  lines.push('');
  lines.push('INSTRUCTIONS:');
  lines.push('- Answer in 2–4 sentences for simple questions; use structured lists/tables for comparisons.');
  lines.push('- Always be specific — reference actual APS numbers, salary figures, programme names, and fee amounts.');
  lines.push('- Ground every answer in the student\'s profile data above.');
  lines.push('- When relevant, append a navigation cue on its own line using this exact format: [→route] where route is one of: careers, programmes, funding, scholarships, nsfas, simulator, compare, cognitive, intelligence');
  lines.push('- Only include one [→route] tag per response, only when it adds clear value.');
  lines.push('- Write in second person. No generic advice. No disclaimers.');

  return lines.join('\n');
}

export async function sendChatMessage(
  req: ChatRequest,
): Promise<{ reply: string } | { error: string }> {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return { error: 'Not authenticated' };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { error: 'AI service unavailable' };
    }

    const client = new Anthropic({ apiKey });

    // Cap conversation history at last 10 turns (20 messages) to stay within limits
    const recentMessages = req.messages.slice(-20);

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: buildSystemPrompt(req.aps, req.psychProfile, req.capabilityData, req.householdIncome),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: recentMessages.map(m => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const reply = textBlock?.type === 'text' ? textBlock.text.trim() : '';
    return reply ? { reply } : { error: 'Empty response from AI' };
  } catch (err) {
    console.error('sendChatMessage error:', err);
    return { error: 'Failed to get AI response' };
  }
}
