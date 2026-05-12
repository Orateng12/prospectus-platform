'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/requireAuth';
import { calcAPS } from '@/lib/utils';
import { computeStrategicScore } from '@/lib/scoring';
import type { OnboardingData, PsychProfileData, CapabilityData } from '@/lib/types';

export async function saveOnboarding(data: OnboardingData): Promise<{ error: string } | undefined> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const apsScore = calcAPS(data.subjects);

  // Upsert user_profiles first — psychological_profiles and capability_graphs have
  // FK constraints referencing public.user_profiles.id, so this row must exist before
  // the dependent upserts run.
  const profileResult = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      email: user.email,
      first_name: data.firstName,
      last_name: data.lastName,
      province: data.province,
      subject_marks: data.subjects,
      aps_score: apsScore,
      household_income: data.householdIncome,
    }, { onConflict: 'id' });

  if (profileResult.error) return { error: profileResult.error.message };

  // Now that the parent row is guaranteed to exist, upsert the dependent tables in parallel.
  const [psychResult, capResult] = await Promise.all([
    supabase
      .from('psychological_profiles')
      .upsert({
        user_id: user.id,
        openness: data.openness,
        conscientiousness: data.conscientiousness,
        extraversion: data.extraversion,
        agreeableness: data.agreeableness,
        neuroticism: data.neuroticism,
        realistic: data.realistic,
        investigative: data.investigative,
        artistic: data.artistic,
        social: data.social,
        enterprising: data.enterprising,
        conventional: data.conventional,
        primary_motivation: data.primary_motivation,
        work_style_preference: data.work_style_preference,
      }, { onConflict: 'user_id' }),

    supabase
      .from('capability_graphs')
      .upsert({
        user_id: user.id,
        analytical_thinking: data.analytical_thinking,
        creative_thinking: data.creative_thinking,
        leadership_potential: data.leadership_potential,
        communication_skills: data.communication_skills,
        technical_aptitude: data.technical_aptitude,
        entrepreneurial_drive: data.entrepreneurial_drive,
        risk_tolerance_score: data.risk_tolerance_score,
        perseverance: data.perseverance,
        academic_readiness: Math.round((data.analytical_thinking + data.perseverance) / 2),
        career_readiness: Math.round((data.communication_skills + data.leadership_potential) / 2),
      }, { onConflict: 'user_id' }),
  ]);

  if (psychResult.error) return { error: psychResult.error.message };
  if (capResult.error) return { error: capResult.error.message };

  // Compute and persist the strategic score so the Intelligence dashboard
  // shows real sub-scores immediately after onboarding, not fallback values.
  const psychProfile: PsychProfileData = {
    openness: data.openness,
    conscientiousness: data.conscientiousness,
    extraversion: data.extraversion,
    agreeableness: data.agreeableness,
    neuroticism: data.neuroticism,
    realistic: data.realistic,
    investigative: data.investigative,
    artistic: data.artistic,
    social: data.social,
    enterprising: data.enterprising,
    conventional: data.conventional,
    primary_motivation: data.primary_motivation,
    work_style_preference: data.work_style_preference,
  };

  const academicReadiness = Math.round((data.analytical_thinking + data.perseverance) / 2);
  const careerReadiness   = Math.round((data.communication_skills + data.leadership_potential) / 2);

  const capabilityData: CapabilityData = {
    analytical_thinking:  data.analytical_thinking,
    creative_thinking:    data.creative_thinking,
    leadership_potential: data.leadership_potential,
    communication_skills: data.communication_skills,
    technical_aptitude:   data.technical_aptitude,
    entrepreneurial_drive: data.entrepreneurial_drive,
    risk_tolerance_score: data.risk_tolerance_score,
    perseverance:         data.perseverance,
    academic_readiness:   academicReadiness,
    career_readiness:     careerReadiness,
  };

  const score = computeStrategicScore(psychProfile, capabilityData, apsScore, data.householdIncome);

  // Non-blocking — if this insert fails the user still lands on the dashboard
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

  redirect('/dashboard');
}
