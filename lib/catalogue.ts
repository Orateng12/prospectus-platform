import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// ── Raw shapes returned by the DB ─────────────────────────────────────────────

export interface RawProgramme {
  id: string;
  name: string;
  min_aps: number;
  duration_years: number | null;
  tuition_fee_min: number | null;
  tuition_fee_max: number | null;
  qualification_type: string | null;
  nqf_level: number | null;
  competition_level: string | null;
  career_outcomes: string[] | null;
  nsfas_fundable: boolean | null;
  application_deadline: string | null;
  institutions: { name: string } | null;
}

export interface RawCareer {
  id: string;
  title: string;
  description: string | null;
  demand_level: string | null;
  salary_percentile_50: number | null;
  salary_entry_min: number | null;
  salary_mid_max: number | null;
  employment_rate: number | null;
  job_posting_trend: string | null;
  skills_needed: string[] | null;
  scarce_skill: boolean | null;
  category: string | null;
}

export interface RawFunding {
  id: string;
  name: string;
  amount: number;
  type: string;
  provider_type: string;
  eligibility: string;
  deadline: string | null;
  income_threshold: number | null;
  min_aps: number | null;
  study_fields: string[] | null;
  service_contract: boolean | null;
  disability_specific: boolean | null;
  province_specific: string | null;
  application_url: string | null;
  last_verified_at: string | null;
}

export interface CatalogueData {
  progRows: RawProgramme[];
  careerRows: RawCareer[];
  fundingRows: RawFunding[];
}

// ── Cached fetcher — shared across ALL users, refreshed every hour ─────────────
// Uses the anon/publishable key (no user session needed) — all three tables have
// public SELECT RLS policies so this works without authentication.

export const getCatalogueData = unstable_cache(
  async (): Promise<CatalogueData> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    const [progResult, careerResult, fundingResult] = await Promise.all([
      supabase
        .from('programmes')
        .select('id, name, min_aps, duration_years, tuition_fee_min, tuition_fee_max, qualification_type, nqf_level, competition_level, career_outcomes, nsfas_fundable, application_deadline, institutions(name)')
        .eq('is_active', true)
        .order('min_aps', { ascending: true }),

      supabase
        .from('careers')
        .select('id, title, description, demand_level, salary_percentile_50, salary_entry_min, salary_mid_max, employment_rate, job_posting_trend, skills_needed, scarce_skill, category')
        .order('demand_level', { ascending: false }),

      supabase
        .from('funding_opportunities')
        .select('id, name, amount, type, provider_type, eligibility, deadline, income_threshold, min_aps, study_fields, service_contract, disability_specific, province_specific, application_url, last_verified_at')
        .eq('is_active', true)
        .order('amount', { ascending: false }),
    ]);

    return {
      progRows: (progResult.data ?? []) as unknown as RawProgramme[],
      careerRows: (careerResult.data ?? []) as unknown as RawCareer[],
      fundingRows: (fundingResult.data ?? []) as unknown as RawFunding[],
    };
  },
  ['catalogue'],
  { revalidate: 3600, tags: ['catalogue'] },
);
