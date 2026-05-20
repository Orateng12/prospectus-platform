import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/requireAuth';
import { SUBJECTS, PROGRAMMES, CAREERS } from '@/lib/data';
import { computeStrategicScore } from '@/lib/scoring';
import Dashboard from '@/components/Dashboard';
import type {
  Subject, Programme, Career,
  PsychProfileData, CapabilityData, StrategicScoreData, DbApplication, DbCareer, DbDocument,
} from '@/lib/types';

function pathwayFromQualType(qt: string | null, nqf: number | null): Programme['pathway'] {
  if (!qt) return 'direct';
  const q = qt.toLowerCase();
  if (q.includes('extended') || q.includes('augmented')) return 'extended';
  if (q.includes('foundation') || (nqf != null && nqf <= 5)) return 'foundation';
  if (q.includes('tvet') || q.includes('diploma') || q.includes('certificate')) return 'tvet';
  return 'direct';
}

function fitScore(userAps: number, minAps: number): number {
  if (minAps <= 0) return 80;
  if (userAps >= minAps) return Math.min(100, Math.round(80 + ((userAps - minAps) / minAps) * 20));
  return Math.max(10, Math.round((userAps / minAps) * 80));
}

function normaliseDemand(d?: string): Career['demand'] {
  const s = (d ?? '').toLowerCase();
  if (s === 'high') return 'High';
  if (s === 'low')  return 'Low';
  return 'Med';
}

function mapDbCareerToCareer(c: DbCareer, rank: number): Career {
  const annualSalary = c.salary_percentile_50 ?? c.salary_mid_max ?? c.salary_entry_min ?? 420_000;
  const salary = Math.round(annualSalary / 12);
  const growth = c.job_posting_trend
    ? (c.job_posting_trend === 'growing' ? '+18%' : c.job_posting_trend === 'declining' ? '-4%' : '+8%')
    : '+12%';
  const tags = (c.skills_needed ?? []).slice(0, 3);
  const match = c.employment_rate
    ? Math.min(100, Math.round(c.employment_rate * 100))
    : Math.max(50, 90 - rank * 2);
  return {
    rank,
    name: c.title,
    match,
    salary,
    growth,
    demand: normaliseDemand(c.demand_level),
    tags,
    why: c.description ?? `${c.title} is a strong career path with ${normaliseDemand(c.demand_level).toLowerCase()} market demand in South Africa.`,
    scarce_skill: c.scarce_skill ?? false,
  };
}

export default async function Page() {
  const auth = await requireAuth();
  if (!auth.ok) redirect('/login');
  const { user, supabase } = auth;

  const [profileResult, progResult, psychResult, capResult, scoreResult, appsResult, careersResult, savedResult, scholarshipAppsResult, documentsResult, notificationsResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('aps_score, subject_marks, first_name, last_name, province, household_income, matric_year')
      .eq('id', user.id)
      .single(),
    supabase
      .from('programmes')
      .select('id, name, min_aps, duration_years, tuition_fee_min, tuition_fee_max, qualification_type, nqf_level, is_active, institutions ( name )')
      .eq('is_active', true)
      .order('min_aps', { ascending: true })
      .limit(500),
    supabase
      .from('psychological_profiles')
      .select('openness, conscientiousness, extraversion, agreeableness, neuroticism, realistic, investigative, artistic, social, enterprising, conventional, primary_motivation, work_style_preference')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('capability_graphs')
      .select('analytical_thinking, creative_thinking, leadership_potential, communication_skills, technical_aptitude, entrepreneurial_drive, risk_tolerance_score, perseverance, academic_readiness, career_readiness')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('strategic_score_records')
      .select('overall, academic_readiness, career_demand_alignment, financial_feasibility, global_mobility_potential, personality_career_fit, skill_readiness, previous_score, trend')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('student_applications')
      .select('id, status, applied_at, deadline, outcome, notes, programmes ( name, institutions ( name ) )')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('careers')
      .select('id, title, description, demand_level, salary_percentile_50, salary_entry_min, salary_mid_max, employment_rate, job_posting_trend, skills_needed, scarce_skill, category')
      .order('demand_level', { ascending: false })
      .limit(42),
    supabase
      .from('saved_programmes')
      .select('programme_id')
      .eq('user_id', user.id),
    supabase
      .from('scholarship_applications')
      .select('scholarship_name')
      .eq('user_id', user.id),
    supabase
      .from('user_documents')
      .select('doc_type, file_name, storage_path, file_size, mime_type, uploaded_at')
      .eq('user_id', user.id),
    supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('read', false),
  ]);

  const profile = profileResult.data;
  const userAps = profile?.aps_score ?? 0;

  // Name
  const firstName = profile?.first_name
    ?? (user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user.email?.split('@')[0]
    ?? 'Student';
  const lastName = profile?.last_name
    ?? (user.user_metadata?.full_name as string | undefined)?.split(' ').slice(1).join(' ')
    ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  // Subjects
  let subjects: Subject[] = SUBJECTS.map(s => ({ ...s }));
  if (profile?.subject_marks && Array.isArray(profile.subject_marks)) {
    const marks = profile.subject_marks as Array<{ id: string; name: string; mark: number; designated: boolean }>;
    if (marks.length > 0 && marks.every(m => typeof m.id === 'string' && typeof m.mark === 'number')) {
      subjects = marks;
    }
  }

  // Programmes
  let programmes: Programme[] = PROGRAMMES;
  if (progResult.data && progResult.data.length > 0) {
    programmes = progResult.data.map(p => {
      const inst = (p.institutions as unknown) as { name: string } | null;
      return {
        id: p.id,
        name: p.name,
        uni: inst?.name ?? 'Unknown',
        aps: p.min_aps ?? 0,
        fees: p.tuition_fee_min ?? p.tuition_fee_max ?? 45_000,
        dur: p.duration_years ?? 3,
        fit: fitScore(userAps, p.min_aps ?? 0),
        pathway: pathwayFromQualType(p.qualification_type, p.nqf_level),
        salary: 35_000,
        demand: 'Med' as const,
      };
    });
  }

  // Psychological profile
  // Only redirect brand-new accounts that have no profile row at all (auth trigger not yet run).
  // PGRST116 = "0 rows returned by .single()" — the row genuinely doesn't exist.
  // Any other error code (network, RLS, etc.) is treated as degraded mode, not a redirect.
  // Users who have a profile but haven't completed onboarding stay on the dashboard in
  // graceful-degraded (empty) mode rather than being bounced on every router.refresh().
  const isNewAccount = !profile && profileResult.error?.code === 'PGRST116';
  if (isNewAccount) redirect('/onboarding');

  const psychProfile: PsychProfileData | null = psychResult.data ?? null;

  // Capability graph
  const capabilityData: CapabilityData | null = capResult.data ?? null;

  // Strategic score — compute and persist on first visit if missing
  let strategicScore: StrategicScoreData | null = scoreResult.data ?? null;

  if (!strategicScore && psychProfile && capabilityData) {
    const income = profile?.household_income ?? 0;
    const computed = computeStrategicScore(psychProfile, capabilityData, userAps, income);
    // Fire-and-forget: don't block page render on the insert
    supabase.from('strategic_score_records').insert({
      user_id:                   user.id,
      overall:                   computed.overall,
      academic_readiness:        computed.academic_readiness,
      career_demand_alignment:   computed.career_demand_alignment,
      financial_feasibility:     computed.financial_feasibility,
      global_mobility_potential: computed.global_mobility_potential,
      personality_career_fit:    computed.personality_career_fit,
      skill_readiness:           computed.skill_readiness,
      previous_score:            null,
      trend:                     'stable',
    }).then(() => { /* intentional no-op */ });
    strategicScore = { ...computed, trend: 'stable' };
  }

  // Applications
  let applications: DbApplication[] = [];
  if (appsResult.data && appsResult.data.length > 0) {
    applications = appsResult.data.map(a => {
      const prog = (a.programmes as unknown) as { name: string; institutions: { name: string } | null } | null;
      return {
        id: a.id,
        programme_name: prog?.name ?? 'Unknown Programme',
        institution_name: prog?.institutions?.name ?? 'Unknown Institution',
        status: a.status ?? 'draft',
        applied_at: a.applied_at ?? undefined,
        deadline: a.deadline ?? undefined,
        outcome: a.outcome ?? undefined,
        notes: (a as Record<string, unknown>).notes as string | undefined,
      };
    });
  }

  // Saved programmes
  const savedProgrammeIds: string[] = (savedResult.data ?? []).map((r: { programme_id: string }) => r.programme_id);

  // Applied scholarships
  const appliedScholarshipNames: string[] = (scholarshipAppsResult.data ?? []).map(
    (r: { scholarship_name: string }) => r.scholarship_name,
  );

  // Documents with signed URLs (1 h expiry, generated server-side so they are ready on first render)
  let documents: DbDocument[] = [];
  if (documentsResult.data && documentsResult.data.length > 0) {
    const paths = (documentsResult.data as { storage_path: string }[]).map(d => d.storage_path);
    const { data: signedData } = await supabase.storage
      .from('documents')
      .createSignedUrls(paths, 3600);
    const urlMap: Record<string, string> = {};
    (signedData ?? []).forEach((s: { path: string | null; signedUrl: string | null }) => {
      if (s.path && s.signedUrl) urlMap[s.path] = s.signedUrl;
    });
    documents = (documentsResult.data as Array<{
      doc_type: string; file_name: string; storage_path: string;
      file_size?: number; mime_type?: string; uploaded_at: string;
    }>).map(d => ({ ...d, signed_url: urlMap[d.storage_path] }));
  }

  // Unread notification count
  const unreadNotificationCount = (notificationsResult.data ?? []).length;

  // Matric year
  const matricYear: number | undefined = (profile as Record<string, unknown> | null)?.matric_year as number | undefined;

  // Careers
  let careers: Career[] = CAREERS;
  if (careersResult.data && careersResult.data.length > 0) {
    careers = (careersResult.data as DbCareer[]).map((c, i) => mapDbCareerToCareer(c, i + 1));
  }

  return (
    <Dashboard
      initialSubjects={subjects}
      initialProgrammes={programmes}
      userAps={userAps}
      userName={fullName}
      userFirstName={firstName}
      userLastName={lastName}
      userEmail={user.email ?? undefined}
      userProvince={profile?.province ?? undefined}
      householdIncome={profile?.household_income ?? undefined}
      matricYear={matricYear}
      psychProfile={psychProfile}
      capabilityData={capabilityData}
      strategicScore={strategicScore}
      applications={applications}
      careers={careers}
      savedProgrammeIds={savedProgrammeIds}
      appliedScholarshipNames={appliedScholarshipNames}
      documents={documents}
      unreadNotificationCount={unreadNotificationCount}
    />
  );
}
