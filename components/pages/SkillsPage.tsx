import { CAPS } from '@/lib/data';
import RadarChart from '@/components/RadarChart';
import { rankCareersByMatch, getCareerCapRequirements, getCareerBigFiveRanges } from '@/lib/scoring';
import type { CareerBigFiveRanges } from '@/lib/scoring';
import type { CapabilityData, Capability, PsychProfileData, Career } from '@/lib/types';

interface SkillsPageProps {
  capabilityData?: CapabilityData | null;
  psychProfile?: PsychProfileData | null;
  careers?: Career[];
  userAps?: number;
  onRetake?: () => void;
}

const DESCRIPTIONS: Record<string, string> = {
  Analytical:  'Pattern recognition · structured reasoning',
  Technical:   'Tool mastery · systems thinking',
  Social:      'Empathy · group dynamics',
  Creative:    'Divergent thinking · synthesis',
  Verbal:      'Comprehension · written expression',
  Numerical:   'Quantitative fluency · statistics',
  Spatial:     'Visualisation · 3D reasoning',
  Practical:   'Real-world execution · hands-on',
};

const GROWTH_NOTES: Record<string, string> = {
  Verbal:   'Lifting Verbal opens Law, journalism, PM tracks. Suggested: 4-week reading-comprehension program.',
  Creative: 'Creative correlates with design + research roles. Suggested: portfolio project on side problem.',
};

// Map DB capability_graphs columns → CAPS labels (best-fit)
const DB_TO_CAP: Array<[keyof CapabilityData, string]> = [
  ['analytical_thinking',  'Analytical'],
  ['technical_aptitude',   'Technical'],
  ['communication_skills', 'Social'],
  ['creative_thinking',    'Creative'],
  ['leadership_potential', 'Verbal'],
  ['academic_readiness',   'Numerical'],
  ['risk_tolerance_score', 'Spatial'],
  ['entrepreneurial_drive','Practical'],
];

// Human-readable label for each CapabilityData DB key
const CAP_DB_LABEL: Record<keyof CapabilityData, string> = {
  analytical_thinking:  'Analytical',
  technical_aptitude:   'Technical',
  communication_skills: 'Communication',
  creative_thinking:    'Creative',
  leadership_potential: 'Leadership',
  academic_readiness:   'Academic',
  risk_tolerance_score: 'Risk tolerance',
  entrepreneurial_drive:'Entrepreneurial',
  perseverance:         'Perseverance',
  career_readiness:     'Career readiness',
};

export default function SkillsPage({ capabilityData, psychProfile, careers = [], userAps = 0, onRetake }: SkillsPageProps) {
  let caps: Capability[] = CAPS.map(c => ({ ...c }));

  if (capabilityData) {
    caps = DB_TO_CAP.map(([dbKey, label]) => ({
      l: label,
      v: capabilityData[dbKey] ?? CAPS.find(c => c.l === label)?.v ?? 60,
    }));
  }

  const labels = caps.map(c => c.l);
  const values = caps.map(c => c.v);
  const composite = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const sorted = [...caps].sort((a, b) => b.v - a.v);
  const hasData = !!capabilityData;

  // ── Big Five alignment ────────────────────────────────────────────────────
  const BIG5_LABEL: Record<string, string> = {
    conscientiousness: 'Conscientiousness',
    openness:          'Openness',
    extraversion:      'Extraversion',
    agreeableness:     'Agreeableness',
    neuroticism:       'Neuroticism',
  };

  const BIG5_DESC: Record<string, string> = {
    conscientiousness: 'Organisation · diligence · reliability',
    openness:          'Curiosity · imagination · flexibility',
    extraversion:      'Sociability · assertiveness · energy',
    agreeableness:     'Empathy · cooperation · trust',
    neuroticism:       'Emotional stability · stress management',
  };

  // ── Career gap analysis ───────────────────────────────────────────────────
  // Find the student's best-matched career and show exact capability gaps
  const topCareer = psychProfile && capabilityData && careers.length > 0
    ? rankCareersByMatch(careers, psychProfile, capabilityData, userAps)[0] ?? null
    : null;

  const careerReqs = topCareer ? getCareerCapRequirements(topCareer.name) : null;

  type B5Key = keyof CareerBigFiveRanges;
  const bigFiveRanges = topCareer ? getCareerBigFiveRanges(topCareer.name) : null;
  const bigFiveItems = bigFiveRanges && psychProfile
    ? (Object.keys(bigFiveRanges) as B5Key[])
        .filter(trait => (psychProfile[trait as keyof PsychProfileData] as number | null | undefined) != null)
        .map(trait => {
          const range = bigFiveRanges[trait]!;
          const [lo, hi] = range;
          const yours = psychProfile[trait as keyof PsychProfileData] as number;
          const inZone = yours >= lo && yours <= hi;
          const gap = inZone ? 0 : Math.max(0, lo - yours);
          return { trait, label: BIG5_LABEL[trait] ?? trait, desc: BIG5_DESC[trait] ?? '', lo, hi, yours, inZone, gap };
        }).sort((a, b) => a.gap - b.gap)
    : [];

  // Build gap items: only capabilities the career actually cares about
  const gapItems = careerReqs && capabilityData
    ? (Object.keys(careerReqs) as Array<keyof CapabilityData>)
        .map(key => ({
          key,
          label:    CAP_DB_LABEL[key] ?? key,
          required: careerReqs[key] ?? 60,
          yours:    (capabilityData[key] as number) ?? 60,
        }))
        .sort((a, b) => (a.yours - a.required) - (b.yours - b.required)) // worst gaps first
    : [];

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Self · Skills Map</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Capability graph</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Skills map</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Eight cognitive dimensions inferred from your assessments, marks history and self-reports.
              Hover any axis on the radar to see what feeds it.
            </p>
          </div>
          <div className="row">
            <span className="badge brand">Composite: {composite}</span>
            {hasData && <span className="badge success">Real data</span>}
            <button className="btn btn-outline" onClick={onRetake}>Update inputs</button>
          </div>
        </div>
      </div>

      <div className="grid-2-asym">
        <div className="card" style={{ display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
          <div className="radar-container">
          <RadarChart values={values} labels={labels} size={440} />
          </div>
        </div>

        <div className="stack-3">
          <div className="card">
            <div className="eyebrow"><span className="dot" />Strengths</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Top three dimensions</h3>
            <div className="stack-2" style={{ marginTop: '0.875rem' }}>
              {sorted.slice(0, 3).map(c => (
                <div key={c.l} className="row" style={{ justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.l}</div>
                    <div className="caption">
                      {c.v >= 85 ? 'Top decile' : c.v >= 75 ? 'Top quartile' : 'Above median'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
                    {c.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="eyebrow"><span className="dot" />Growth areas</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Where one push has high return</h3>
            <div className="stack-2" style={{ marginTop: '0.875rem' }}>
              {sorted.slice(-2).map(c => (
                <div key={c.l}>
                  <div className="row-between">
                    <div style={{ fontWeight: 700 }}>{c.l}</div>
                    <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--warning))' }}>{c.v}</div>
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                    {GROWTH_NOTES[c.l] ?? 'Targeted practice over 4-6 weeks should move this 8-12 points.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Career gap analysis — only shown when we have enough data to be specific */}
      {topCareer && gapItems.length > 0 && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Gap to your best match</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                What {topCareer.name} requires · match {topCareer.personalScore}/100
              </h3>
            </div>
            <span className={`badge ${topCareer.personalScore >= 80 ? 'success' : topCareer.personalScore >= 65 ? 'primary' : 'warning'}`}>
              {topCareer.personalScore >= 80 ? 'Strong fit' : topCareer.personalScore >= 65 ? 'Good fit' : 'Gap exists'}
            </span>
          </div>
          <div className="stack-2">
            {gapItems.map(({ key, label, required, yours }) => {
              const gap = required - yours;
              const isMet = gap <= 0;
              return (
                <div key={key}>
                  <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8125rem' }}>
                      <strong style={{ color: isMet ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>{yours}</strong>
                      <span className="caption"> / {required} needed</span>
                    </span>
                  </div>
                  <div className="meter" style={{ position: 'relative' }}>
                    <i style={{
                      width: `${yours}%`,
                      background: isMet ? undefined : 'hsl(var(--warning))',
                    }} />
                    {/* Target marker line */}
                    <span style={{
                      position: 'absolute', top: 0, bottom: 0,
                      left: `${Math.min(required, 100)}%`,
                      width: 2,
                      background: 'hsl(var(--fg) / 0.4)',
                    }} />
                  </div>
                  {!isMet && (
                    <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.6875rem' }}>
                      {gap} point gap · {gap <= 8 ? 'Close — targeted practice for 3–4 weeks.' : gap <= 18 ? 'Achievable — focused effort over 1–2 months.' : 'Significant gap · consider electives or self-directed study.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="caption" style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid hsl(var(--border))' }}>
            Targets derived from the scoring engine's {topCareer.name} archetype.
            Meeting them improves your match score for this specific career.
          </div>
        </div>
      )}

      {topCareer && bigFiveItems.length > 0 && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Personality fit</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                Big Five alignment for {topCareer.name}
              </h3>
            </div>
            <span className={`badge ${bigFiveItems.every(i => i.inZone) ? 'success' : 'warning'}`}>
              {bigFiveItems.filter(i => i.inZone).length}/{bigFiveItems.length} in zone
            </span>
          </div>
          <div className="stack-2">
            {bigFiveItems.map(({ trait, label, desc, lo, hi, yours, inZone, gap }) => (
              <div key={trait}>
                <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</span>
                    <span className="caption" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>{desc}</span>
                  </div>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8125rem' }}>
                    <strong style={{ color: inZone ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>{yours}</strong>
                    <span className="caption"> · ideal {lo}–{hi}</span>
                  </span>
                </div>
                <div className="meter" style={{ position: 'relative' }}>
                  <i style={{ width: `${yours}%`, background: inZone ? undefined : 'hsl(var(--warning))' }} />
                  <span style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${lo}%`, width: `${hi - lo}%`,
                    background: 'hsl(var(--success) / 0.15)',
                    borderLeft:  '2px solid hsl(var(--success) / 0.6)',
                    borderRight: '2px solid hsl(var(--success) / 0.6)',
                  }} />
                </div>
                {!inZone && gap > 0 && (
                  <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.6875rem' }}>
                    {gap} points below ideal zone ·{' '}
                    {gap <= 8 ? 'Close — naturally develops with practice.' : gap <= 18 ? 'Achievable — consistent habits over 2–3 months.' : 'Notable gap · coaching or structured development program.'}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="caption" style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid hsl(var(--border))' }}>
            Green zone = ideal personality range for {topCareer.name}. Traits not listed have no strong requirement for this career.
          </div>
        </div>
      )}

      <div className="grid-3" style={{ marginTop: '1.25rem' }}>
        {caps.map(c => (
          <div key={c.l} className="card compact">
            <div className="row-between">
              <div style={{ fontWeight: 700 }}>{c.l}</div>
              <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{c.v}</div>
            </div>
            <div className={`meter ${c.v >= 80 ? 'success' : c.v >= 65 ? 'primary' : c.v >= 55 ? 'accent' : 'warning'}`} style={{ marginTop: '0.5rem' }}>
              <i style={{ width: `${c.v}%` }} />
            </div>
            <div className="caption" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              {DESCRIPTIONS[c.l]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
