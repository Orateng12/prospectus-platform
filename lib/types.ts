export type Curriculum = 'NSC' | 'IEB' | 'Cambridge_IGCSE' | 'Cambridge_AS' | 'Cambridge_A' | 'NCV' | 'IB';

export type SubjectType =
  | 'home_language' | 'first_additional' | 'second_additional'
  | 'mathematics' | 'math_literacy' | 'technical_math'
  | 'elective' | 'life_orientation';

export type FundingType = 'bursary' | 'scholarship' | 'loan' | 'grant' | 'seta' | 'international' | 'disability';
export type FundingProviderType = 'government' | 'corporate' | 'ngo' | 'seta' | 'university' | 'international';

export interface Subject {
  id: string;
  name: string;
  mark: number;
  designated: boolean;
  curriculum?: Curriculum;
  subjectType?: SubjectType;
  grade?: string;
}

export interface Programme {
  id: string;
  name: string;
  uni: string;
  aps: number;
  fees: number;
  dur: number;
  fit: number;
  pathway: 'direct' | 'extended' | 'foundation' | 'tvet';
  salary: number;
  demand: 'High' | 'Med' | 'Low';
  requiredSubjects?: string[];
  nsfas_fundable?: boolean | null;
  career_outcomes?: string[] | null;
  application_deadline?: string | null;
}

export interface Application {
  id?: string;
  uni: string;
  short?: string;
  meta: string;
  stages: Array<'done' | 'active' | 'fail' | ''>;
  status: 'success' | 'warning' | 'info' | 'destructive';
  label: string;
  progId?: string | null;
  submitted?: string;
  decided?: string;
  deadline?: string;
  fee?: string;
}

export interface University {
  name: string;
  short: string;
  city: string;
  province: string;
  rank: number;
  progs: number;
  accept: number;
  fees: number;
  tag: 'success' | 'info' | 'warning' | 'destructive';
  acpt: 'Tier 1' | 'Comprehensive' | 'UoT' | 'TVET' | 'Distance' | 'Private';
  website?: string;
}

export interface CompareItem {
  id: string;
  kind: 'prog' | 'career' | 'uni' | 'scholarship';
  name: string;
}

export interface Deadline {
  d: number;
  m: string;
  t: string;
  sub: string;
  tag: string;
  tagL: string;
}

export interface Scholarship {
  name: string;
  amount: number;
  match: number;
  eligibility: string;
  deadline: string;
}

export interface FundingOpportunity extends Scholarship {
  id: string;
  type: FundingType;
  provider_type: FundingProviderType;
  service_contract?: boolean;
  disability_specific?: boolean;
  province_specific?: string;
  application_url?: string;
  last_verified_at?: string;
  income_threshold?: number;
  min_aps?: number;
  study_fields?: string[];
}

export interface Capability {
  l: string;
  v: number;
}

export interface Career {
  rank: number;
  name: string;
  match: number;
  salary: number;
  growth: string;
  demand: 'High' | 'Med' | 'Low';
  tags: string[];
  why: string;
  scarce_skill?: boolean;
}

export interface BigFiveTrait {
  l: string;
  v: number;
  lo: string;
  hi: string;
  sub: string;
}

export interface RiasecItem {
  l: string;
  v: number;
}

export interface Province {
  id: string;
  name: string;
  x: number;
  y: number;
  n: number;
  fees: number;
  you?: boolean;
  intel: string;
}

// ── Real DB data shapes ──────────────────────────────────────

export interface PsychProfileData {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  primary_motivation?: string;
  work_style_preference?: string;
}

export interface CapabilityData {
  analytical_thinking: number;
  creative_thinking: number;
  leadership_potential: number;
  communication_skills: number;
  technical_aptitude: number;
  entrepreneurial_drive: number;
  risk_tolerance_score: number;
  perseverance: number;
  academic_readiness: number;
  career_readiness: number;
}

export interface StrategicScoreData {
  overall: number;
  academic_readiness: number;
  career_demand_alignment: number;
  financial_feasibility: number;
  global_mobility_potential: number;
  personality_career_fit: number;
  skill_readiness: number;
  previous_score?: number;
  trend?: string;
}

export interface DbApplication {
  id: string;
  programme_name: string;
  institution_name: string;
  status: string;
  applied_at?: string;
  deadline?: string;
  outcome?: string;
  notes?: string;
}

export interface DbCareer {
  id: string;
  title: string;
  description?: string;
  demand_level?: string;
  salary_percentile_50?: number;
  salary_entry_min?: number;
  salary_mid_max?: number;
  employment_rate?: number;
  job_posting_trend?: string;
  skills_needed?: string[];
  scarce_skill?: boolean;
  category?: string;
}

export type Route =
  | 'home'
  | 'intelligence'
  | 'simulator'
  | 'programmes'
  | 'funding'
  | 'financial'
  | 'careers'
  | 'cognitive'
  | 'skills'
  | 'map'
  | 'unis'
  | 'compare'
  | 'discover'
  | 'scholarships'
  | 'nsfas'
  | 'applications'
  | 'documents'
  | 'deadlines'
  | 'profile'
  | 'application-detail'
  | 'scholarship-detail'
  | 'career-detail'
  | 'subject-detail'
  | 'notifications'
  | 'search';

// Routes still in the type for backward-compatibility with navigate() callsites.
// Sidebar items removed: financial, skills, map, discover, nsfas, documents, deadlines, compare
// These routes now land on the correct tab of their merged parent page.

export interface InsightContext {
  type: 'home' | 'cognitive' | 'intelligence' | 'career';
  aps: number;
  subjects: Subject[];
  psychProfile: PsychProfileData | null;
  capabilityData: CapabilityData | null;
  strategicScore: StrategicScoreData | null;
  topProgrammes: Programme[];
  topCareers: Career[];
}

export interface DbDocument {
  doc_type: string;
  file_name: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
  signed_url?: string;
}

export interface DbCustomDeadline {
  id: string;
  title: string;
  date: string;
}

export interface DbNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read?: boolean | null;
  priority?: string | null;
  created_at?: string | null;
}

export interface OnboardingData {
  firstName: string;
  lastName: string;
  province: string;
  matricYear: number;
  subjects: Subject[];
  // Big Five (0–100)
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  // RIASEC (0–100)
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  primary_motivation: string;
  work_style_preference: string;
  // Capabilities (0–100)
  analytical_thinking: number;
  creative_thinking: number;
  leadership_potential: number;
  communication_skills: number;
  technical_aptitude: number;
  entrepreneurial_drive: number;
  risk_tolerance_score: number;
  perseverance: number;
  // Financial
  householdIncome: number;
}
