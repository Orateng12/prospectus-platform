'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { calcAPS } from '@/lib/utils';
import type { OnboardingData } from '@/lib/types';

export async function saveOnboarding(data: OnboardingData): Promise<{ error: string } | undefined> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const apsScore = calcAPS(data.subjects);

  const [profileResult, psychResult, capResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        province: data.province,
        subject_marks: data.subjects,
        aps_score: apsScore,
        household_income: data.householdIncome,
      })
      .eq('id', user.id),

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

  if (profileResult.error) return { error: profileResult.error.message };
  if (psychResult.error) return { error: psychResult.error.message };
  if (capResult.error) return { error: capResult.error.message };

  redirect('/dashboard');
}
