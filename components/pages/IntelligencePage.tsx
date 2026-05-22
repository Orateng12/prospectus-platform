'use client';

import { useState } from 'react';
import type { Route, StrategicScoreData, CapabilityData, Capability, Programme, Career, PsychProfileData, Subject } from '@/lib/types';
import { CAPS, CAREERS } from '@/lib/data';
import { scoreCareerMatch } from '@/lib/scoring';
import { fmtR, apsPoints } from '@/lib/utils';
import { DB_TO_CAP } from '@/lib/capability';
import DonutChart from '@/components/DonutChart';
import AiInsightCard from '@/components/AiInsightCard';

interface IntelligencePageProps {
  navigate: (r: Route) => void;
  strategicScore?: StrategicScoreData | null;
  capabilityData?: CapabilityData | null;
  programmes?: Programme[];
  careers?: Career[];
  psychProfile?: PsychProfileData | null;
  subjects?: Subject[];
  userAps?: number;
  onOpenCareer?: (careerName: string) => void;
}

interface SubScoreNarrative { why: string; action: string; fixable: boolean }

interface LeverROI {
  key: string;
  label: string;
  currentScore: number;
  estGain: number;
  effort: string;
  effortHours: number;
  action: string;
}

function buildLeverROI(
  subScores: Array<{ key: string; v: number }>,
  psychProfile: PsychProfileData | null,
  userAps: number,
): LeverROI[] {
  const sm = Object.fromEntries(subScores.map(s => [s.key, s.v]));
  const noAssessment = !psychProfile;

  const levers: LeverROI[] = [
    {
      key: 'career',
      label: 'Career alignment',
      currentScore: sm.career ?? 68,
      estGain: noAssessment ? 5 : 2,
      effort: noAssessment ? '15 min assessment' : '1–2 weeks research',
      effortHours: noAssessment ? 0.25 : 14,
      action: noAssessment
        ? 'Complete the cognitive assessment — instantly personalises your career probability table with RIASEC + Big Five data'
        : 'Filter Career Explorer by "High demand" — those roles have 3× more SA job postings. Sort by "Fit" to see which match your profile.',
    },
    {
      key: 'personality',
      label: 'Personality fit',
      currentScore: sm.personality ?? 79,
      estGain: noAssessment ? 3 : 1,
      effort: noAssessment ? '15 min (same as career above)' : 'Structural — develops over years',
      effortHours: noAssessment ? 0.25 : 300,
      action: noAssessment
        ? 'The same 15-min cognitive assessment unlocks Big Five scoring — both career and personality sub-scores improve simultaneously'
        : 'Personality is relatively stable short-term. Focus the career and skills levers for faster composite-score gains.',
    },
    {
      key: 'financial',
      label: 'Financial feasibility',
      currentScore: sm.financial ?? 71,
      estGain: userAps < 42 ? 6 : 3,
      effort: userAps < 42 ? '6 hrs — two scholarship applications' : '2 hrs — merit bursary confirmation',
      effortHours: userAps < 42 ? 6 : 2,
      action: userAps < 42
        ? 'Apply for 2 APS-tiered bursaries (Sasol, NRF — no income test). Each takes ~3 hrs. Stacking NSFAS + merit bursary can cover 130% of annual costs.'
        : 'You are already in the top merit bursary tier. Confirm stacking rules with your target institution and apply by the August deadline.',
    },
    {
      key: 'skills',
      label: 'Skill readiness',
      currentScore: sm.skills ?? 72,
      estGain: 4,
      effort: '8 weeks · 2 hrs/week',
      effortHours: 16,
      action: 'Open Skills Map → pick your lowest-scoring dimension → follow the specific roadmap (debate club, coding course, practical project). Most students gain +12 pts in 6–8 weeks.',
    },
    {
      key: 'academic',
      label: 'Academic readiness',
      currentScore: sm.academic ?? 86,
      estGain: (sm.academic ?? 86) < 80 ? 5 : 2,
      effort: (sm.academic ?? 86) < 80 ? '20 hrs tutoring + study' : 'Near ceiling — NBT only',
      effortHours: (sm.academic ?? 86) < 80 ? 20 : 120,
      action: (sm.academic ?? 86) < 80
        ? 'Raise your lowest subject by one band (e.g. 55% → 60%). Adds 1 APS point and opens programmes currently 1 point out of reach. Open the Simulator to model it.'
        : 'Book the NBT (National Benchmark Test). A strong NBT score compensates for lower APS at some institutions and strengthens individual applications.',
    },
    {
      key: 'global',
      label: 'Global mobility',
      currentScore: sm.global ?? 68,
      estGain: 3,
      effort: '1 academic year — Year 1 performance',
      effortHours: 800,
      action: 'Graduate in the top 20% of your Year 1 cohort. That single outcome is the fastest path to international scholarship eligibility (Commonwealth, Vanier, Endeavour).',
    },
  ];

  return levers.sort((a, b) => (b.estGain / b.effortHours) - (a.estGain / a.effortHours));
}

function buildSubScoreNarratives(
  aps: number,
  subjects: Subject[],
  psychProfile: PsychProfileData | null,
  capabilityData: CapabilityData | null,
  strategicScore: StrategicScoreData | null,
  programmes: Programme[],
  householdIncome?: number,
): Record<string, SubScoreNarrative> {
  const eligible = programmes.filter(p => p.aps <= aps).length;
  const nearMiss = programmes.filter(p => p.aps > aps && p.aps <= aps + 2).length;
  const lowestSub = [...subjects].filter(s => s.id !== 'lo').sort((a, b) => apsPoints(a.mark) - apsPoints(b.mark))[0];
  const nextMark = lowestSub ? (lowestSub.mark < 50 ? 50 : lowestSub.mark < 60 ? 60 : 70) : null;

  const nsfas = householdIncome === undefined || householdIncome <= 350_000 ? 115_060
    : householdIncome <= 600_000 ? 48_000 : 0;
  const bursary = aps >= 42 ? 165_000 : aps >= 38 ? 95_000 : aps >= 32 ? 42_000 : 18_000;

  const riasecEntries = psychProfile ? ([
    ['Investigative', psychProfile.investigative ?? 0],
    ['Realistic', psychProfile.realistic ?? 0],
    ['Enterprising', psychProfile.enterprising ?? 0],
    ['Social', psychProfile.social ?? 0],
    ['Conventional', psychProfile.conventional ?? 0],
    ['Artistic', psychProfile.artistic ?? 0],
  ] as [string, number][]).sort((a, b) => b[1] - a[1]) : [];
  const topR = riasecEntries[0];

  const capEntries = capabilityData ? [
    { name: 'Analytical thinking', v: capabilityData.analytical_thinking ?? 60 },
    { name: 'Technical aptitude', v: capabilityData.technical_aptitude ?? 60 },
    { name: 'Communication', v: capabilityData.communication_skills ?? 60 },
    { name: 'Creative thinking', v: capabilityData.creative_thinking ?? 60 },
    { name: 'Leadership', v: capabilityData.leadership_potential ?? 60 },
    { name: 'Perseverance', v: capabilityData.perseverance ?? 60 },
  ].sort((a, b) => a.v - b.v) : [];
  const lowestCap = capEntries[0];
  const highestCap = capEntries[capEntries.length - 1];

  const mobilityScore = strategicScore?.global_mobility_potential ?? 0;
  const alignScore = strategicScore?.career_demand_alignment ?? 0;

  return {
    academic: {
      why: `APS ${aps}/49 opens ${eligible} programmes.${nearMiss > 0 ? ` ${nearMiss} more are within 2 APS points — just one grade bump away.` : ' You\'re fully eligible for your current target programmes.'}`,
      action: lowestSub && nearMiss > 0 && nextMark
        ? `Raise ${lowestSub.name} from ${lowestSub.mark}% → ${nextMark}% — adds 1 APS point and unlocks ${nearMiss} more programme${nearMiss !== 1 ? 's' : ''}. Open the Simulator to model it.`
        : 'Your academic profile is strong. Book the NBT (National Benchmark Test) to strengthen individual university applications.',
      fixable: nearMiss > 0,
    },
    career: {
      why: topR
        ? `Your dominant RIASEC type is ${topR[0]} (${topR[1]}/100). ${alignScore >= 75 ? 'This type is in strong demand across SA\'s tech, finance, and engineering sectors.' : 'Investigative + Realistic types attract the most SA job postings — your profile aligns partially.'}`
        : 'Career alignment is estimated from your academic profile. Complete the personality assessment for a personalised score.',
      action: alignScore < 75
        ? 'Filter Career Explorer by "High demand" — those roles have 3× more SA job postings than average. Sort by "Fit" to see which high-demand careers match your profile.'
        : 'Your profile maps to growing SA sectors. Explore the Discover page to find niche roles that match your combination.',
      fixable: !psychProfile,
    },
    financial: {
      why: nsfas > 0
        ? `Household income qualifies for NSFAS (R ${Math.round(nsfas / 1000)}k). APS ${aps} puts you in the R ${Math.round(bursary / 1000)}k bursary tier.`
        : `Income is above the NSFAS threshold. APS ${aps} qualifies for the R ${Math.round(bursary / 1000)}k merit bursary tier — no income test applied.`,
      action: nsfas > 0 && bursary > 0
        ? `Stack NSFAS (R ${Math.round(nsfas / 1000)}k) + APS bursary (R ${Math.round(bursary / 1000)}k) = R ${Math.round((nsfas + bursary) / 1000)}k. Apply order: NSFAS first (April deadline), then merit bursaries (August).`
        : 'Focus on merit scholarships: Sasol, Old Mutual Actuarial, NRF — none require an income test. Apply by September.',
      fixable: aps < 42,
    },
    personality: {
      why: psychProfile
        ? (() => {
            const top = [
              ['Conscientiousness', psychProfile.conscientiousness ?? 0],
              ['Openness', psychProfile.openness ?? 0],
              ['Extraversion', psychProfile.extraversion ?? 0],
              ['Agreeableness', psychProfile.agreeableness ?? 0],
            ].sort((a, b) => (b[1] as number) - (a[1] as number))[0];
            const label = top[0] === 'Conscientiousness' ? 'organised and persistent — high fit for structured professions'
              : top[0] === 'Openness' ? 'curious and inventive — high fit for research and tech'
              : top[0] === 'Extraversion' ? 'energetic and expressive — high fit for leadership and client-facing roles'
              : 'cooperative and empathetic — high fit for health, education, and social careers';
            return `Dominant trait: ${top[0]} (${top[1]}/100). You are ${label}.`;
          })()
        : 'Personality fit uses your Big Five profile against career trait requirements. Complete the cognitive assessment to personalise this score.',
      action: psychProfile
        ? 'Open Career Explorer → sort by "Fit" — these results factor in your personality profile, not just APS.'
        : 'Complete the cognitive assessment (≈15 min) to see which careers align with your Big Five profile.',
      fixable: !psychProfile,
    },
    global: {
      why: mobilityScore >= 75
        ? `Academic strength (APS ${aps}) + strong Investigative profile creates competitive international postgraduate potential. SA students with this combination qualify for UK, Canadian, and Australian programmes.`
        : `Your profile qualifies for regional African scholarships and select international programmes. Research experience or a strong honours year significantly improves this score.`,
      action: mobilityScore >= 75
        ? 'Explore: Commonwealth Scholarship (UK), Vanier Graduate Scholarship (Canada), Endeavour (Australia). Your profile is competitive for 2028 entry.'
        : 'Focus on graduating top 20% in Year 1 — that single outcome is the fastest path to international scholarship eligibility.',
      fixable: true,
    },
    skills: {
      why: capabilityData && lowestCap
        ? `Strongest: ${highestCap?.name} (${highestCap?.v}/100). Lowest: ${lowestCap.name} (${lowestCap.v}/100) — this limits access to careers requiring ${lowestCap.name.toLowerCase()} above ${lowestCap.v + 15}.`
        : 'Skills readiness is estimated from your academic profile. Complete the capability assessment for a breakdown across 8 dimensions.',
      action: lowestCap?.name === 'Communication'
        ? 'Communication is the highest-leverage gap. Join a debating society or structured writing programme — most students see +12–18 points after 6 months of consistent practice.'
        : lowestCap?.name === 'Technical aptitude'
          ? 'Technical aptitude is buildable. A 6-week coding bootcamp, Arduino project, or electronics short course typically raises this by 15–20 points.'
          : capabilityData
            ? `Raise ${lowestCap?.name} to unlock careers that currently gate on this dimension. Open the Skills Map to see the specific gap for each career you\'re targeting.`
            : 'Complete the capability assessment to see your exact gaps across analytical, technical, communication, creative, leadership, and perseverance dimensions.',
      fixable: true,
    },
  };
}

const FALLBACK_PROBS = [
  { name: 'Software Engineer', score: 88, salary: undefined as number | undefined, growth: '+22%', demand: 'High' as const },
  { name: 'Data Analyst',      score: 82, salary: undefined as number | undefined, growth: '+18%', demand: 'High' as const },
  { name: 'Actuary',           score: 76, salary: undefined as number | undefined, growth: '+9%',  demand: 'Med'  as const },
  { name: 'Civil Engineer',    score: 58, salary: undefined as number | undefined, growth: '+5%',  demand: 'Med'  as const },
  { name: 'Doctor',            score: 41, salary: undefined as number | undefined, growth: '+7%',  demand: 'High' as const },
];

export default function IntelligencePage({ navigate, strategicScore, capabilityData, programmes = [], careers = [], psychProfile, subjects = [], userAps = 0, householdIncome, onOpenCareer }: IntelligencePageProps & { householdIncome?: number }) {
  const futureYear = new Date().getFullYear() + 5;
  const [expandedScore, setExpandedScore] = useState<string | null>(null);
  const score = strategicScore?.overall ?? 74;
  const prev  = strategicScore?.previous_score;
  const delta = prev != null ? score - prev : 6;
  const trend = strategicScore?.trend ?? 'improving';

  const narratives = buildSubScoreNarratives(userAps, subjects, psychProfile ?? null, capabilityData ?? null, strategicScore ?? null, programmes, householdIncome);

  const subScores = [
    { key: 'academic',    l: 'Academic readiness',    v: strategicScore?.academic_readiness        ?? 86, sub: 'APS, subject mix, prerequisite gaps',           c: 'success' },
    { key: 'career',      l: 'Career alignment',      v: strategicScore?.career_demand_alignment    ?? 68, sub: 'Labour market signal vs. your top careers',     c: 'primary' },
    { key: 'financial',   l: 'Financial feasibility', v: strategicScore?.financial_feasibility      ?? 71, sub: 'NSFAS + bursary fit · scholarship pipeline',    c: 'accent'  },
    { key: 'personality', l: 'Personality fit',       v: strategicScore?.personality_career_fit     ?? 79, sub: 'Big Five · RIASEC vs. target career profiles',  c: 'warning' },
    { key: 'global',      l: 'Global mobility',       v: strategicScore?.global_mobility_potential  ?? 68, sub: 'International demand × academic strength',      c: 'primary' },
    { key: 'skills',      l: 'Skill readiness',       v: strategicScore?.skill_readiness            ?? 72, sub: 'Mean of 8 core capability dimensions',          c: 'success' },
  ];

  const caps: Capability[] = capabilityData
    ? DB_TO_CAP.map(([dbKey, label]) => ({
        l: label,
        v: capabilityData[dbKey] ?? CAPS.find(c => c.l === label)?.v ?? 60,
      }))
    : CAPS.map(c => ({ ...c }));

  // Compute profile completeness from available data
  const profileFields = [
    subjects.length > 0,
    userAps > 0,
    !!psychProfile,
    !!capabilityData,
    !!strategicScore,
  ];
  const completeness = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const highDemandCareers = careers.filter(c => c.demand === 'High').length;
  const eligibleProgrammes = programmes.filter(p => p.aps <= userAps).length;

  // Personalised career probability — computed from RIASEC + capabilities + APS
  const careerProbs = (() => {
    if (!psychProfile || !capabilityData) return FALLBACK_PROBS;
    const source = careers.length > 0 ? careers : CAREERS;
    return source
      .map(c => ({
        name:   c.name,
        score:  scoreCareerMatch(c.name, psychProfile, capabilityData, userAps),
        salary: c.salary,
        growth: c.growth,
        demand: c.demand,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  })();

  const topCareer = careerProbs[0];

  const layers = [
    { n: '01', k: 'Identity',    t: 'Cognitive · Big Five · RIASEC · 8-D capability graph',   stat: `${completeness}%`, sub: 'profile completeness' },
    { n: '02', k: 'Opportunity', t: 'Labour market · industry forecasts · top growing careers', stat: String(highDemandCareers || 18), sub: 'high-demand careers matched' },
    { n: '03', k: 'Decision',    t: 'Eligible programmes · scenario generator · AI insights',  stat: String(eligibleProgrammes || 12), sub: 'eligible programmes' },
    { n: '04', k: 'Execution',   t: 'Skill gap · trajectory · scholarship matcher',            stat: psychProfile ? '✓' : '—', sub: psychProfile ? 'assessment complete' : 'complete onboarding' },
  ];

  const hasData = !!strategicScore;

  const leverROI = buildLeverROI(subScores, psychProfile ?? null, userAps);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Intelligence</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />The platform&apos;s moat</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Intelligence dashboard</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Six engines run in parallel against your profile — identity, opportunity, decision, execution,
              global mobility and skill readiness.
              The orchestrator merges them into one payload and reports a completeness score so the UI can
              progressively enhance.
            </p>
          </div>
          <div className="row">
            <span className="badge success" style={{ height: '1.625rem' }}>● Live</span>
            {hasData
              ? <span className="badge success">Real score</span>
              : <span className="badge">Estimated · complete assessment</span>}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="intel-hero">
        <div>
          <div className="score-circle">
            <DonutChart value={score} size={200} stroke={14} />
            <div className="donut-text">
              <div>
                <div className="n">{score}</div>
                <div className="l">Strategic score</div>
              </div>
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: '1rem', gap: '0.375rem' }}>
            <span className={`badge ${delta >= 0 ? 'success' : 'destructive'}`}>
              {delta >= 0 ? '+' : ''}{delta} {trend}
            </span>
            <span className="badge">Composite</span>
          </div>
        </div>

        <div>
          <h3 className="subheading">Where the score comes from</h3>
          <p className="body-text" style={{ marginTop: '0.375rem' }}>
            Six sub-scores combine on a weighted average. Move any of them and the composite moves with it.
          </p>
          <div className="stack-2" style={{ marginTop: '1rem' }}>
            {subScores.map(x => {
              const narr = narratives[x.key];
              const isOpen = expandedScore === x.key;
              return (
                <div key={x.l}>
                  <button
                    className="row-between"
                    style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => setExpandedScore(isOpen ? null : x.key)}
                    aria-expanded={isOpen}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{x.l}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{x.v}</span>
                      <span className="caption" style={{ color: 'hsl(var(--muted-fg))', fontSize: '0.7rem' }}>{isOpen ? '▲' : '▼'}</span>
                    </span>
                  </button>
                  <div className={`meter ${x.c}`} style={{ marginTop: '0.375rem' }}>
                    <i style={{ width: `${x.v}%` }} />
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{x.sub}</div>
                  {isOpen && narr && (
                    <div style={{ marginTop: '0.625rem', padding: '0.75rem', background: 'hsl(var(--muted) / 0.5)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>{narr.why}</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: narr.fixable ? 'hsl(var(--success))' : 'hsl(var(--muted-fg))', background: narr.fixable ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--muted))', borderRadius: '4px', padding: '0.125rem 0.375rem', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                          {narr.fixable ? '↑ Improvable' : '✓ Structural'}
                        </span>
                        <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: 0, color: 'hsl(var(--muted-fg))' }}>{narr.action}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lever ROI */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <div>
            <div className="eyebrow"><span className="dot" />Score optimiser</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What to move first — ranked by effort-to-impact</h3>
          </div>
          <span className="badge success">ROI ranked</span>
        </div>
        <div className="stack-2">
          {leverROI.map((lever, idx) => (
            <div key={lever.key} style={{
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--r-md)',
              background: idx < 2 ? 'hsl(var(--success) / 0.05)' : 'transparent',
              border: idx < 2 ? '1px solid hsl(var(--success) / 0.2)' : '1px solid hsl(var(--border) / 0.4)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: idx < 2 ? 'hsl(var(--success))' : 'hsl(var(--muted))',
                color: idx < 2 ? 'white' : 'hsl(var(--muted-fg))',
                display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.75rem',
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-between">
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{lever.label}</span>
                  <div className="row lever-badge-cluster" style={{ gap: '0.375rem', marginLeft: '0.5rem' }}>
                    {idx < 2 && (
                      <span className="badge success" style={{ height: '1.25rem', fontSize: '0.625rem' }}>Do first</span>
                    )}
                    <span className="badge" style={{ height: '1.25rem', fontSize: '0.625rem' }}>+{lever.estGain} pts</span>
                    <span className="badge lever-meta-badge" style={{ height: '1.25rem', fontSize: '0.625rem', color: 'hsl(var(--muted-fg))' }}>
                      {lever.currentScore}/100 now
                    </span>
                  </div>
                </div>
                <div className="caption" style={{ marginTop: '0.125rem', fontSize: '0.75rem' }}>{lever.effort}</div>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: '0.375rem 0 0', color: 'hsl(var(--muted-fg))' }}>
                  {lever.action}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="caption" style={{ marginTop: '0.75rem', fontSize: '0.75rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.625rem' }}>
          Ranked by composite score gain ÷ hours of effort. Completing the cognitive assessment first unlocks personalised scoring across all dimensions simultaneously.
        </div>
      </div>

      {/* 4 engine layers */}
      <div className="grid-4">
        {layers.map(x => (
          <div className="layer-block" key={x.k}>
            <div className="row-between">
              <div className="lk">{x.k}</div>
              <div className="ln">{x.n}</div>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem' }}>{x.stat}</div>
            <div className="caption" style={{ marginTop: '0.125rem' }}>{x.sub}</div>
            <hr className="divider" />
            <div className="caption" style={{ fontSize: '0.6875rem', lineHeight: 1.5 }}>{x.t}</div>
          </div>
        ))}
      </div>

      {/* APS What-if panel */}
      {programmes.length > 0 && (() => {
        const currentEligible = programmes.filter(p => p.aps <= userAps).length;
        const scenarios = [1, 2, 3].map(delta => {
          const newAps = userAps + delta;
          const newEligible = programmes.filter(p => p.aps <= newAps).length;
          const newUnlocked = newEligible - currentEligible;
          const highFitUnlocked = programmes.filter(p => p.aps > userAps && p.aps <= newAps && p.fit >= 70).length;
          const lowestSub = [...subjects].filter(s => s.id !== 'lo').sort((a, b) => a.mark - b.mark)[0];
          const markNeeded = lowestSub
            ? (lowestSub.mark < 50 ? 50 : lowestSub.mark < 60 ? 60 : lowestSub.mark < 70 ? 70 : 80)
            : null;
          return { delta, newAps, newUnlocked, highFitUnlocked, markNeeded, subjectName: lowestSub?.name };
        });
        const nearMissProgs = programmes
          .filter(p => p.aps > userAps && p.aps <= userAps + 3)
          .sort((a, b) => a.aps - b.aps)
          .slice(0, 3);
        return (
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Scenario explorer</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What would +1, +2, +3 APS unlock?</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('simulator')}>Open Simulator →</button>
            </div>
            <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              {scenarios.map(sc => (
                <div key={sc.delta} className="card compact" style={{ padding: '0.875rem', borderColor: sc.delta === 1 ? 'hsl(var(--success) / 0.4)' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="eyebrow" style={{ fontSize: '0.6875rem' }}>APS {sc.newAps}</span>
                    <span className="badge success" style={{ fontSize: '0.65rem', padding: '0 4px', height: '1.1rem' }}>+{sc.delta}</span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1, marginTop: '0.375rem', fontVariantNumeric: 'tabular-nums', color: sc.newUnlocked > 0 ? 'hsl(var(--success))' : 'hsl(var(--muted-fg))' }}>
                    +{sc.newUnlocked}
                  </div>
                  <div className="caption" style={{ marginTop: '0.125rem' }}>
                    programme{sc.newUnlocked !== 1 ? 's' : ''} unlocked
                    {sc.highFitUnlocked > 0 ? ` · ${sc.highFitUnlocked} high-fit` : ''}
                  </div>
                  {sc.markNeeded && sc.subjectName && (
                    <div className="caption" style={{ marginTop: '0.375rem', fontSize: '0.7rem', color: 'hsl(var(--muted-fg))' }}>
                      Raise {sc.subjectName} → {sc.markNeeded}%
                    </div>
                  )}
                </div>
              ))}
            </div>
            {nearMissProgs.length > 0 && (
              <div>
                <div className="caption" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Near-miss programmes (within 3 APS points):</div>
                <div className="stack-2">
                  {nearMissProgs.map(p => (
                    <div key={p.id} className="row-between" style={{ fontSize: '0.8125rem', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span className="caption" style={{ marginLeft: '0.5rem' }}>{p.uni.split(' ').slice(0, 3).join(' ')}</span>
                      </div>
                      <div className="row" style={{ gap: '0.5rem' }}>
                        <span className="badge destructive" style={{ fontSize: '0.65rem' }}>Need APS {p.aps}</span>
                        <span className="caption">Gap: {p.aps - userAps}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Lower 2×2 */}
      <div className="grid-2" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Career probability</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Per pathway · academic + psych fit</h3>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('cognitive')}>Why?</button>
          </div>
          <div className="stack-2">
            {careerProbs.map(({ name, score }) => (
              <button
                key={name}
                className="progress-row"
                style={{ background: 'none', border: 'none', padding: 0, cursor: onOpenCareer ? 'pointer' : 'default', textAlign: 'left', width: '100%' }}
                onClick={() => onOpenCareer?.(name)}
                title={onOpenCareer ? `Open ${name} detail` : undefined}
              >
                <span className="label" style={{ flex: 1 }}>{name}</span>
                <div className={`meter ${score >= 80 ? 'success' : score >= 65 ? 'primary' : 'accent'}`} style={{ flex: 3 }}>
                  <i style={{ width: `${score}%` }} />
                </div>
                <span className="val">{score}</span>
                {onOpenCareer && <span className="caption" style={{ marginLeft: '0.375rem', color: 'hsl(var(--muted-fg))' }}>→</span>}
              </button>
            ))}
            {!psychProfile && (
              <div className="caption" style={{ marginTop: '0.375rem', color: 'hsl(var(--warning))' }}>
                Estimated · complete profile assessment to personalise
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Capability graph</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>8 dimensions</h3>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('skills')}>
              Open Skills Map →
            </button>
          </div>
          <div className="stack">
            {caps.map(c => (
              <div key={c.l} className="progress-row">
                <span className="label">{c.l}</span>
                <div className={`meter ${c.v >= 80 ? 'success' : c.v >= 65 ? 'primary' : 'accent'}`}>
                  <i style={{ width: `${c.v}%` }} />
                </div>
                <span className="val">{c.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow"><span className="dot" />Future-You · {futureYear}</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>5-year salary trajectory on the highest-fit path</h3>
          {(() => {
            const medianSalary = topCareer?.salary ?? 41200;
            const growthPct = topCareer?.growth
              ? parseFloat(topCareer.growth.replace(/[^0-9.-]/g, '')) / 100
              : 0.18;
            const stages = [
              { label: 'Graduate entry', yr: 1, salary: Math.round(medianSalary * 0.72) },
              { label: 'Junior role',    yr: 2, salary: Math.round(medianSalary * 0.88) },
              { label: 'Mid-level',      yr: 3, salary: Math.round(medianSalary * 1.0) },
              { label: 'Senior / Spec.', yr: 5, salary: Math.round(medianSalary * (1 + growthPct * 2)) },
            ];
            const maxSalary = stages[stages.length - 1].salary;
            return (
              <div className="stack-2" style={{ marginTop: '0.875rem' }}>
                {stages.map(s => (
                  <div key={s.label}>
                    <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Yr {s.yr} · {s.label}</span>
                      <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>{fmtR(s.salary)}/mo</span>
                    </div>
                    <div className="meter success">
                      <i style={{ width: `${Math.round((s.salary / maxSalary) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div className="stat-pair" style={{ marginTop: '0.25rem' }}>
                  <div className="l">Career</div>
                  <div className="v">{topCareer ? topCareer.name : 'Data Scientist'}</div>
                </div>
                <div className="stat-pair">
                  <div className="l">Market growth</div>
                  <div className="v">{topCareer?.growth ?? '+18%'}/yr · {topCareer?.demand ?? 'High'} demand</div>
                </div>
              </div>
            );
          })()}
          <div className="caption" style={{ marginTop: '0.75rem' }}>
            {psychProfile
              ? `Derived from RIASEC profile + capability graph. Match: ${topCareer?.score ?? '—'}/100. SA salary medians.`
              : 'SA market salary trajectory. Complete your profile to personalise to your top career.'}
          </div>
        </div>

        <AiInsightCard
          context={{
            type: 'intelligence',
            aps: userAps,
            subjects,
            psychProfile: psychProfile ?? null,
            capabilityData: capabilityData ?? null,
            strategicScore: strategicScore ?? null,
            topProgrammes: programmes.slice(0, 4),
            topCareers: careers.slice(0, 4),
          }}
        />
      </div>
    </div>
  );
}
