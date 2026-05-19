'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';
import { computeStrategicScore } from '@/lib/scoring';
import type { PsychProfileData, CapabilityData } from '@/lib/types';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  province?: string;
  householdIncome?: number;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ success: true } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const update: Record<string, unknown> = {};
  if (input.firstName !== undefined) update.first_name = input.firstName;
  if (input.lastName !== undefined) update.last_name = input.lastName;
  if (input.province !== undefined) update.province = input.province;
  if (input.householdIncome !== undefined) update.household_income = input.householdIncome;

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id, ...update }, { onConflict: 'id' });

  if (error) return { error: error.message };

  // When income changes, financial_feasibility sub-score needs a refresh.
  if (input.householdIncome !== undefined) {
    const [profileRes, psychRes, capRes] = await Promise.all([
      supabase.from('user_profiles').select('aps_score').eq('id', user.id).single(),
      supabase.from('psychological_profiles')
        .select('openness, conscientiousness, extraversion, agreeableness, neuroticism, realistic, investigative, artistic, social, enterprising, conventional, primary_motivation, work_style_preference')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.from('capability_graphs')
        .select('analytical_thinking, creative_thinking, leadership_potential, communication_skills, technical_aptitude, entrepreneurial_drive, risk_tolerance_score, perseverance, academic_readiness, career_readiness')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    const psychProfile = psychRes.data as PsychProfileData | null;
    const capabilityData = capRes.data as CapabilityData | null;

    if (psychProfile && capabilityData) {
      const apsScore = (profileRes.data as { aps_score: number } | null)?.aps_score ?? 0;
      const score = computeStrategicScore(psychProfile, capabilityData, apsScore, input.householdIncome);
      await supabase.from('strategic_score_records').insert({
        user_id:                   user.id,
        overall:                   score.overall,
        academic_readiness:        score.academic_readiness,
        career_demand_alignment:   score.career_demand_alignment,
        financial_feasibility:     score.financial_feasibility,
        global_mobility_potential: score.global_mobility_potential,
        personality_career_fit:    score.personality_career_fit,
        skill_readiness:           score.skill_readiness,
        previous_score:            null,
        trend:                     'stable',
      });
    }
  }

  return { success: true };
}
