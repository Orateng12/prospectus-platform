/**
 * Personalized career match scoring engine.
 *
 * Uses three profile layers — RIASEC, capabilities, Big Five — to compute
 * a genuine match score (0–100) for each career. Replaces the APS-only
 * fallback used previously.
 *
 * Weights:
 *   RIASEC alignment    38 %  — Holland theory: career × personality type match
 *   Capability fit      30 %  — does the student have what the role demands?
 *   Big Five fit        15 %  — personality traits in the ideal zone for the role
 *   APS gate            17 %  — hard gate for selective programmes
 */

import type { PsychProfileData, CapabilityData } from './types';

// ─── Archetype definitions ─────────────────────────────────────────────────────

interface RiasecWeights {
  realistic?: number;
  investigative?: number;
  artistic?: number;
  social?: number;
  enterprising?: number;
  conventional?: number;
}

interface CapRequirements {
  analytical?: number;       // → analytical_thinking
  technical?: number;        // → technical_aptitude
  communication?: number;    // → communication_skills
  creative?: number;         // → creative_thinking
  leadership?: number;       // → leadership_potential
  academic?: number;         // → academic_readiness
  risk?: number;             // → risk_tolerance_score
  entrepreneurial?: number;  // → entrepreneurial_drive
}

// [lo, hi] — user value inside range = 100; outside = penalised
type B5Range = [number, number];

interface BigFiveRanges {
  conscientiousness?: B5Range;
  openness?: B5Range;
  extraversion?: B5Range;
  agreeableness?: B5Range;
  neuroticism?: B5Range;
}

interface CareerArchetype {
  riasec: RiasecWeights;
  caps: CapRequirements;
  bigFive?: BigFiveRanges;
  /** Min APS for typical qualifying programme. Missing = no gate. */
  minAps?: number;
}

// Explicit archetypes for careers common in the SA context
const ARCHETYPES: Record<string, CareerArchetype> = {
  'Software Engineer': {
    riasec: { investigative: 85, realistic: 75, conventional: 55 },
    caps:   { analytical: 85, technical: 90, academic: 70 },
    bigFive: { conscientiousness: [65, 100], openness: [55, 100] },
    minAps: 32,
  },
  'Data Scientist': {
    riasec: { investigative: 90, conventional: 60, realistic: 50 },
    caps:   { analytical: 90, academic: 85, technical: 70, creative: 60 },
    bigFive: { openness: [65, 100], conscientiousness: [60, 100] },
    minAps: 36,
  },
  'Data Analyst': {
    riasec: { investigative: 80, conventional: 70, realistic: 50 },
    caps:   { analytical: 85, academic: 80, technical: 65 },
    bigFive: { conscientiousness: [60, 100] },
    minAps: 32,
  },
  'Actuary': {
    riasec: { investigative: 80, conventional: 85, realistic: 40 },
    caps:   { analytical: 80, academic: 90 },
    bigFive: { conscientiousness: [75, 100], neuroticism: [0, 50] },
    minAps: 38,
  },
  'Quantitative Analyst': {
    riasec: { investigative: 85, conventional: 80, realistic: 45 },
    caps:   { analytical: 90, academic: 85 },
    bigFive: { conscientiousness: [70, 100] },
    minAps: 40,
  },
  'ML Engineer': {
    riasec: { investigative: 90, realistic: 70, artistic: 50 },
    caps:   { analytical: 90, technical: 85, creative: 65, academic: 75 },
    bigFive: { openness: [70, 100] },
    minAps: 36,
  },
  'Civil Engineer': {
    riasec: { realistic: 85, investigative: 65, conventional: 60 },
    caps:   { analytical: 70, technical: 75, risk: 65 },
    bigFive: { conscientiousness: [65, 100] },
    minAps: 32,
  },
  'Mechanical Engineer': {
    riasec: { realistic: 85, investigative: 70, conventional: 55 },
    caps:   { analytical: 75, technical: 80, risk: 65 },
    bigFive: { conscientiousness: [65, 100] },
    minAps: 34,
  },
  'Doctor (MBChB)': {
    riasec: { investigative: 80, social: 70, realistic: 60 },
    caps:   { analytical: 75, academic: 90, communication: 70 },
    bigFive: { conscientiousness: [75, 100], agreeableness: [60, 100], neuroticism: [0, 45] },
    minAps: 44,
  },
  'Doctor': {
    riasec: { investigative: 80, social: 70, realistic: 60 },
    caps:   { analytical: 75, academic: 90, communication: 70 },
    bigFive: { conscientiousness: [75, 100], agreeableness: [60, 100], neuroticism: [0, 45] },
    minAps: 44,
  },
  'Product Manager (Tech)': {
    riasec: { enterprising: 80, social: 70, conventional: 60 },
    caps:   { leadership: 80, communication: 85, analytical: 65, entrepreneurial: 70 },
    bigFive: { extraversion: [55, 100], conscientiousness: [60, 100] },
  },
  'Product Manager': {
    riasec: { enterprising: 80, social: 70, conventional: 60 },
    caps:   { leadership: 80, communication: 85, analytical: 65, entrepreneurial: 70 },
    bigFive: { extraversion: [55, 100], conscientiousness: [60, 100] },
  },
  'Lawyer': {
    riasec: { enterprising: 80, investigative: 70, social: 65 },
    caps:   { communication: 85, analytical: 80, academic: 75 },
    bigFive: { conscientiousness: [70, 100], extraversion: [50, 100] },
    minAps: 38,
  },
  'Accountant': {
    riasec: { conventional: 85, enterprising: 60, investigative: 55 },
    caps:   { analytical: 75, academic: 70 },
    bigFive: { conscientiousness: [75, 100], neuroticism: [0, 50] },
    minAps: 28,
  },
  'Financial Advisor': {
    riasec: { enterprising: 80, social: 70, conventional: 60 },
    caps:   { communication: 80, analytical: 65, entrepreneurial: 65 },
    bigFive: { extraversion: [55, 100], conscientiousness: [65, 100] },
  },
  'Teacher': {
    riasec: { social: 85, artistic: 55, conventional: 55 },
    caps:   { communication: 85, leadership: 60 },
    bigFive: { extraversion: [50, 100], agreeableness: [60, 100] },
    minAps: 26,
  },
  'Entrepreneur': {
    riasec: { enterprising: 90, artistic: 65, realistic: 55 },
    caps:   { entrepreneurial: 90, risk: 75, leadership: 75, creative: 70 },
    bigFive: { openness: [65, 100], extraversion: [50, 100] },
  },
  'Nurse': {
    riasec: { social: 85, realistic: 65, investigative: 55 },
    caps:   { communication: 80, academic: 65 },
    bigFive: { agreeableness: [65, 100], conscientiousness: [65, 100] },
    minAps: 24,
  },
};

// ─── Keyword-based fallback ────────────────────────────────────────────────────

function inferArchetype(name: string): CareerArchetype {
  const n = name.toLowerCase();
  if (n.includes('engineer') || n.includes('developer') || n.includes('programmer') || (n.includes('architect') && !n.includes('landscape'))) {
    return { riasec: { investigative: 80, realistic: 75, conventional: 50 }, caps: { analytical: 80, technical: 85, academic: 65 }, bigFive: { conscientiousness: [60, 100] }, minAps: 30 };
  }
  if (n.includes('scientist') || n.includes('researcher')) {
    return { riasec: { investigative: 88, conventional: 55, realistic: 45 }, caps: { analytical: 85, academic: 80, technical: 60 }, bigFive: { openness: [60, 100] }, minAps: 34 };
  }
  if (n.includes('analyst') || (n.includes('data') && !n.includes('entry'))) {
    return { riasec: { investigative: 82, conventional: 65, realistic: 48 }, caps: { analytical: 85, academic: 78, technical: 65 }, minAps: 30 };
  }
  if (n.includes('doctor') || n.includes('physician') || n.includes('surgeon') || (n.includes('medical') && !n.includes('admin'))) {
    return { riasec: { investigative: 80, social: 70, realistic: 60 }, caps: { analytical: 75, academic: 88, communication: 70 }, bigFive: { conscientiousness: [70, 100] }, minAps: 44 };
  }
  if (n.includes('nurs') || n.includes('therapist') || n.includes('counsel')) {
    return { riasec: { social: 85, realistic: 60, investigative: 55 }, caps: { communication: 80, academic: 65 }, bigFive: { agreeableness: [60, 100] }, minAps: 24 };
  }
  if (n.includes('manager') || n.includes('director') || n.includes('executive') || n.includes('officer')) {
    return { riasec: { enterprising: 85, social: 70, conventional: 60 }, caps: { leadership: 85, communication: 80, entrepreneurial: 70 }, bigFive: { extraversion: [55, 100] } };
  }
  if (n.includes('accountant') || n.includes('auditor') || n.includes('actuar')) {
    return { riasec: { conventional: 85, investigative: 65, enterprising: 55 }, caps: { analytical: 78, academic: 75 }, bigFive: { conscientiousness: [70, 100] }, minAps: 30 };
  }
  if (n.includes('financ') || n.includes('invest') || n.includes('bank') || n.includes('quant')) {
    return { riasec: { conventional: 75, enterprising: 70, investigative: 60 }, caps: { analytical: 72, academic: 68, entrepreneurial: 60 }, bigFive: { conscientiousness: [65, 100] }, minAps: 28 };
  }
  if (n.includes('design') || n.includes('artist') || n.includes('creative') || n.includes('media') || n.includes('ux')) {
    return { riasec: { artistic: 85, investigative: 55, realistic: 50 }, caps: { creative: 85, technical: 55 }, bigFive: { openness: [70, 100] } };
  }
  if (n.includes('teach') || n.includes('lectur') || n.includes('educat') || n.includes('tutor')) {
    return { riasec: { social: 85, conventional: 55, artistic: 50 }, caps: { communication: 85, leadership: 60 }, bigFive: { agreeableness: [60, 100], extraversion: [50, 100] }, minAps: 26 };
  }
  if (n.includes('law') || n.includes('legal') || n.includes('attorney') || n.includes('advocate') || n.includes('barrister')) {
    return { riasec: { enterprising: 80, investigative: 70, social: 60 }, caps: { communication: 85, analytical: 80, academic: 75 }, bigFive: { conscientiousness: [65, 100] }, minAps: 38 };
  }
  if (n.includes('market') || n.includes('adverti') || n.includes('pr ') || n.includes('public relat')) {
    return { riasec: { enterprising: 75, artistic: 65, social: 60 }, caps: { communication: 80, creative: 70, entrepreneurial: 65 }, bigFive: { extraversion: [55, 100] } };
  }
  // Generic
  return { riasec: { investigative: 60, realistic: 55, conventional: 55 }, caps: { analytical: 60, academic: 60 } };
}

function getArchetype(careerName: string): CareerArchetype {
  const exact = Object.keys(ARCHETYPES).find(k => k.toLowerCase() === careerName.toLowerCase());
  if (exact) return ARCHETYPES[exact];
  const partial = Object.keys(ARCHETYPES).find(k =>
    careerName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(careerName.toLowerCase()),
  );
  if (partial) return ARCHETYPES[partial];
  return inferArchetype(careerName);
}

// ─── Component scorers ────────────────────────────────────────────────────────
//
// One-sided quadratic: at-or-above the ideal = 100, below = (val/ideal)² × 100
// This penalises deficits meaningfully while not punishing exceeding an ideal.

function scoreRiasec(profile: PsychProfileData, weights: RiasecWeights): number {
  const pairs: Array<[keyof RiasecWeights & keyof PsychProfileData, number]> = [
    ['investigative', weights.investigative ?? 0],
    ['realistic',     weights.realistic     ?? 0],
    ['artistic',      weights.artistic      ?? 0],
    ['social',        weights.social        ?? 0],
    ['enterprising',  weights.enterprising  ?? 0],
    ['conventional',  weights.conventional  ?? 0],
  ];
  let num = 0, den = 0;
  for (const [key, ideal] of pairs) {
    if (ideal === 0) continue;
    const val = (profile[key] as number | undefined) ?? 50;
    const score = val >= ideal ? 100 : Math.round((val / ideal) ** 2 * 100);
    num += score * ideal;
    den += ideal;
  }
  return den === 0 ? 65 : Math.round(num / den);
}

function scoreCaps(data: CapabilityData, req: CapRequirements): number {
  const mapping: Array<[keyof CapRequirements, keyof CapabilityData]> = [
    ['analytical',    'analytical_thinking'],
    ['technical',     'technical_aptitude'],
    ['communication', 'communication_skills'],
    ['creative',      'creative_thinking'],
    ['leadership',    'leadership_potential'],
    ['academic',      'academic_readiness'],
    ['risk',          'risk_tolerance_score'],
    ['entrepreneurial', 'entrepreneurial_drive'],
  ];
  let num = 0, den = 0;
  for (const [reqKey, capKey] of mapping) {
    const required = req[reqKey] ?? 0;
    if (required === 0) continue;
    const val = (data[capKey] as number | undefined) ?? 60;
    const score = val >= required ? 100 : Math.round((val / required) ** 2 * 100);
    num += score * required;
    den += required;
  }
  return den === 0 ? 70 : Math.round(num / den);
}

function scoreBigFive(profile: PsychProfileData, ranges?: BigFiveRanges): number {
  if (!ranges) return 78;
  const keys: Array<keyof BigFiveRanges & keyof PsychProfileData> = [
    'conscientiousness', 'openness', 'extraversion', 'agreeableness', 'neuroticism',
  ];
  let total = 0, count = 0;
  for (const key of keys) {
    const range = ranges[key as keyof BigFiveRanges];
    if (!range) continue;
    const val = (profile[key] as number | undefined) ?? 50;
    const [lo, hi] = range;
    let score: number;
    if (val >= lo && val <= hi) {
      score = 100;
    } else if (val < lo) {
      score = Math.round((val / lo) ** 2 * 100);
    } else {
      // Above hi: being too high on neuroticism is bad; others it's mild
      score = key === 'neuroticism'
        ? Math.max(20, Math.round((hi / val) ** 2 * 100))
        : 82;
    }
    total += score;
    count++;
  }
  return count === 0 ? 78 : Math.round(total / count);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute a personalised career match score (0–100).
 * The score reflects how well this specific student's RIASEC type,
 * capability graph and Big Five traits align with a given career path,
 * gated by academic readiness (APS).
 */
export function scoreCareerMatch(
  careerName: string,
  psychProfile: PsychProfileData,
  capabilityData: CapabilityData,
  userAps: number,
): number {
  const archetype = getArchetype(careerName);

  const riasecScore  = scoreRiasec(psychProfile, archetype.riasec);
  const capScore     = scoreCaps(capabilityData, archetype.caps);
  const bigFiveScore = scoreBigFive(psychProfile, archetype.bigFive);

  // APS gate: above threshold = 100; below = scaled with a soft penalty floor
  const apsScore = archetype.minAps
    ? userAps >= archetype.minAps
      ? 100
      : Math.max(20, Math.round((userAps / archetype.minAps) * 60))
    : 80;

  const raw = Math.round(
    riasecScore  * 0.38 +
    capScore     * 0.30 +
    bigFiveScore * 0.15 +
    apsScore     * 0.17,
  );

  // Clamp: perfect matches are rare; floor keeps low-fit careers visible
  return Math.min(97, Math.max(35, raw));
}

/**
 * Returns a transparent breakdown of the four components that make up the
 * career match score. Each component is expressed as points contributed
 * toward the 100-point total (e.g. riasec is out of 38, caps out of 30, etc.).
 */
export interface CareerMatchBreakdown {
  total: number;
  riasecRaw: number;   // 0–100 before weighting
  capsRaw: number;     // 0–100 before weighting
  bigFiveRaw: number;  // 0–100 before weighting
  apsRaw: number;      // 0–100 before weighting
  riasecPts: number;   // contribution toward 100 (out of 38)
  capsPts: number;     // contribution toward 100 (out of 30)
  bigFivePts: number;  // contribution toward 100 (out of 15)
  apsPts: number;      // contribution toward 100 (out of 17)
  minAps: number;
}

export function scoreCareerMatchDetailed(
  careerName: string,
  psychProfile: PsychProfileData,
  capabilityData: CapabilityData,
  userAps: number,
): CareerMatchBreakdown {
  const archetype = getArchetype(careerName);
  const riasecRaw  = scoreRiasec(psychProfile, archetype.riasec);
  const capsRaw    = scoreCaps(capabilityData, archetype.caps);
  const bigFiveRaw = scoreBigFive(psychProfile, archetype.bigFive);
  const apsRaw     = archetype.minAps
    ? userAps >= archetype.minAps ? 100 : Math.max(20, Math.round((userAps / archetype.minAps) * 60))
    : 80;
  const raw = Math.round(riasecRaw * 0.38 + capsRaw * 0.30 + bigFiveRaw * 0.15 + apsRaw * 0.17);
  return {
    total:       Math.min(97, Math.max(35, raw)),
    riasecRaw,   capsRaw,   bigFiveRaw,   apsRaw,
    riasecPts:   Math.round(riasecRaw  * 0.38),
    capsPts:     Math.round(capsRaw    * 0.30),
    bigFivePts:  Math.round(bigFiveRaw * 0.15),
    apsPts:      Math.round(apsRaw     * 0.17),
    minAps:      archetype.minAps ?? 0,
  };
}


export function rankCareersByMatch<T extends { name: string }>(
  careers: T[],
  psychProfile: PsychProfileData,
  capabilityData: CapabilityData,
  userAps: number,
): Array<T & { personalScore: number }> {
  return careers
    .map(c => ({ ...c, personalScore: scoreCareerMatch(c.name, psychProfile, capabilityData, userAps) }))
    .sort((a, b) => b.personalScore - a.personalScore);
}

// ─── Capability requirements export ──────────────────────────────────────────

export type CapabilityKey = keyof CapabilityData;

/** Map from CapRequirements key → CapabilityData field */
const CAP_KEY_MAP: Array<[keyof CapRequirements, CapabilityKey]> = [
  ['analytical',     'analytical_thinking'],
  ['technical',      'technical_aptitude'],
  ['communication',  'communication_skills'],
  ['creative',       'creative_thinking'],
  ['leadership',     'leadership_potential'],
  ['academic',       'academic_readiness'],
  ['risk',           'risk_tolerance_score'],
  ['entrepreneurial','entrepreneurial_drive'],
];

/**
 * Returns the capability requirements for a career as a partial map of
 * CapabilityData keys → required score (0–100).
 * Only capabilities that matter for this career are included.
 */
export function getCareerCapRequirements(
  careerName: string,
): Partial<Record<CapabilityKey, number>> {
  const archetype = getArchetype(careerName);
  const result: Partial<Record<CapabilityKey, number>> = {};
  for (const [reqKey, capKey] of CAP_KEY_MAP) {
    const val = archetype.caps[reqKey];
    if (val !== undefined) result[capKey] = val;
  }
  return result;
}

/**
 * Ideal Big Five trait ranges for a career.
 * Each value is a [lo, hi] tuple where being inside the range is optimal.
 * Only traits the career explicitly requires are included.
 */
export interface CareerBigFiveRanges {
  conscientiousness?: [number, number];
  openness?:          [number, number];
  extraversion?:      [number, number];
  agreeableness?:     [number, number];
  neuroticism?:       [number, number];
}

export function getCareerBigFiveRanges(careerName: string): CareerBigFiveRanges {
  const archetype = getArchetype(careerName);
  return (archetype.bigFive ?? {}) as CareerBigFiveRanges;
}

// ─── Strategic score computation ──────────────────────────────────────────────

export interface ComputedStrategicScore {
  overall: number;
  academic_readiness: number;
  career_demand_alignment: number;
  financial_feasibility: number;
  global_mobility_potential: number;
  personality_career_fit: number;
  skill_readiness: number;
}

/**
 * Compute a full strategic score from raw profile data.
 *
 * Sub-score formulas:
 *  academic_readiness        APS normalised to 49, capped at 95
 *  career_demand_alignment   RIASEC profile weighted against SA labour-market demand
 *  financial_feasibility     Household income band + merit-bursary APS bonus
 *  global_mobility_potential Academic strength × investigative-type demand globally
 *  personality_career_fit    Strength of top-3 RIASEC types (clear profile = better)
 *  skill_readiness           Mean of the 8 core capability dimensions
 *  overall                   Weighted composite of the above
 */
export function computeStrategicScore(
  psychProfile: PsychProfileData,
  capabilityData: CapabilityData,
  aps: number,
  householdIncome: number,
): ComputedStrategicScore {
  // ── Academic readiness ───────────────────────────────────────────────────
  const academic_readiness = Math.min(95, Math.round((aps / 49) * 100));

  // ── Career demand alignment ──────────────────────────────────────────────
  // Weights reflect relative SA labour-market demand by RIASEC type:
  //   Investigative (tech, science)  → 0.35
  //   Realistic (engineering, trades) → 0.25
  //   Conventional (finance, admin)   → 0.20
  //   Enterprising (management)       → 0.15
  //   Social (education, health)      → 0.05  (high supply, moderate demand)
  //   Artistic                        → 0.00  (niche, excluded)
  const career_demand_alignment = Math.round(
    psychProfile.investigative * 0.35 +
    psychProfile.realistic     * 0.25 +
    psychProfile.conventional  * 0.20 +
    psychProfile.enterprising  * 0.15 +
    psychProfile.social        * 0.05,
  );

  // ── Financial feasibility ────────────────────────────────────────────────
  let finBase: number;
  if      (householdIncome <= 350_000)   finBase = 88;  // NSFAS eligible
  else if (householdIncome <= 600_000)   finBase = 62;  // missing middle (Ikusasa)
  else if (householdIncome <= 900_000)   finBase = 48;  // lower self-fund
  else if (householdIncome <= 1_500_000) finBase = 62;  // mid self-fund
  else                                   finBase = 76;  // comfortably self-fund
  // Merit bursaries are income-agnostic — high APS earns a bonus regardless
  const meritBonus = aps >= 40 ? 8 : aps >= 36 ? 5 : aps >= 32 ? 2 : 0;
  const financial_feasibility = Math.min(96, finBase + meritBonus);

  // ── Global mobility potential ────────────────────────────────────────────
  const global_mobility_potential = Math.round(
    academic_readiness         * 0.55 +
    psychProfile.investigative * 0.30 +
    psychProfile.realistic     * 0.15,
  );

  // ── Personality career fit ───────────────────────────────────────────────
  // Coherence: a clear dominant RIASEC profile is more actionable than a flat one
  const riasecSorted = [
    psychProfile.realistic, psychProfile.investigative, psychProfile.artistic,
    psychProfile.social, psychProfile.enterprising, psychProfile.conventional,
  ].sort((a, b) => b - a);
  const personality_career_fit = Math.round(
    riasecSorted[0] * 0.50 +
    riasecSorted[1] * 0.30 +
    riasecSorted[2] * 0.20,
  );

  // ── Skill readiness ──────────────────────────────────────────────────────
  const skill_readiness = Math.round((
    capabilityData.analytical_thinking  +
    capabilityData.creative_thinking    +
    capabilityData.leadership_potential +
    capabilityData.communication_skills +
    capabilityData.technical_aptitude   +
    capabilityData.entrepreneurial_drive +
    capabilityData.risk_tolerance_score +
    capabilityData.perseverance
  ) / 8);

  // ── Overall ─────────────────────────────────────────────────────────────
  const overall = Math.round(
    academic_readiness        * 0.25 +
    career_demand_alignment   * 0.20 +
    financial_feasibility     * 0.20 +
    personality_career_fit    * 0.15 +
    global_mobility_potential * 0.10 +
    skill_readiness           * 0.10,
  );

  return {
    overall,
    academic_readiness,
    career_demand_alignment,
    financial_feasibility,
    global_mobility_potential,
    personality_career_fit,
    skill_readiness,
  };
}
