import { CAPS } from '@/lib/data';
import RadarChart from '@/components/RadarChart';
import { rankCareersByMatch, getCareerCapRequirements, getCareerBigFiveRanges } from '@/lib/scoring';
import type { CareerBigFiveRanges } from '@/lib/scoring';
import type { CapabilityData, Capability, PsychProfileData, Career, Route } from '@/lib/types';
import { DB_TO_CAP, CAP_DB_LABEL, CAP_DESCRIPTIONS, BIG5_LABEL, BIG5_DESC } from '@/lib/capability';

interface SkillsPageProps {
  capabilityData?: CapabilityData | null;
  psychProfile?: PsychProfileData | null;
  careers?: Career[];
  userAps?: number;
  onRetake?: () => void;
  navigate?: (r: Route) => void;
  onOpenCareer?: (name: string) => void;
}

const DEVELOPMENT_ACTIONS: Record<string, Array<{ action: string; timeframe: string; resource: string }>> = {
  Analytical: [
    { action: 'Solve 3 logic puzzles daily', timeframe: '4 weeks', resource: 'Brilliant.org (free tier)' },
    { action: 'Study Statistics fundamentals', timeframe: '6 weeks', resource: 'Khan Academy Statistics' },
    { action: 'Practice data interpretation with past NSC papers', timeframe: 'Ongoing', resource: 'SAAEA exam archive' },
  ],
  Technical: [
    { action: 'Build one complete project from scratch', timeframe: '4–6 weeks', resource: 'freeCodeCamp or The Odin Project' },
    { action: 'Master Excel / Google Sheets to advanced level', timeframe: '2 weeks', resource: 'ExcelJet tutorials (free)' },
    { action: 'Complete one structured online course', timeframe: '6–8 weeks', resource: 'Coursera / edX (audit free)' },
  ],
  Social: [
    { action: 'Join one student society or community org', timeframe: 'This term', resource: 'School / campus noticeboard' },
    { action: 'Practice active listening — paraphrase 3 conversations daily', timeframe: '2 weeks', resource: 'Self-directed practice' },
    { action: 'Lead a study group or small project team', timeframe: 'Next month', resource: 'Class peers' },
  ],
  Creative: [
    { action: 'Complete a side project on a problem you care about', timeframe: '4–6 weeks', resource: 'Self-directed' },
    { action: 'Sketch 3 ideas for a random problem every morning (5 min)', timeframe: '3 weeks', resource: 'Notebook' },
    { action: 'Study one design discipline (UX, architecture, writing)', timeframe: '4 weeks', resource: 'YouTube / Canva Design School' },
  ],
  Verbal: [
    { action: 'Read one non-fiction article and summarise it daily', timeframe: '4 weeks', resource: 'Mail & Guardian, Daily Maverick' },
    { action: 'Write a 300-word reflection each week on what you learned', timeframe: '6 weeks', resource: 'Personal journal / Google Docs' },
    { action: 'Complete NSC reading comprehension past papers weekly', timeframe: '3 weeks', resource: 'NSC past papers (SAAEA)' },
  ],
  Numerical: [
    { action: 'Complete 30 min of Maths practice every day', timeframe: 'Ongoing', resource: 'Khan Academy Maths' },
    { action: 'Attempt a full Maths paper under timed conditions weekly', timeframe: '8 weeks', resource: 'NSC exam papers' },
    { action: 'Learn financial basics (interest, budgeting, percentages)', timeframe: '2 weeks', resource: 'Investopedia / YouTube' },
  ],
  Spatial: [
    { action: 'Practice 3D visualisation exercises daily (10 min)', timeframe: '3 weeks', resource: 'YouTube tutorials + graph paper' },
    { action: 'Study one Engineering Graphics or CAD concept weekly', timeframe: '6 weeks', resource: 'Free CAD tutorials (Fusion 360)' },
    { action: 'Build or assemble a physical model (electrical kit, model)', timeframe: '2 weeks', resource: 'Hardware store / DIY kits' },
  ],
  Practical: [
    { action: 'Complete one real-world task in your area of interest', timeframe: 'Next school holiday', resource: 'Family business or community org' },
    { action: 'Document 3 problems you solved this week with method + outcome', timeframe: 'Ongoing', resource: 'Personal journal' },
    { action: 'Shadow someone working in your target career for a day', timeframe: 'Within 1 month', resource: 'School career centre / LinkedIn' },
  ],
};

export default function SkillsPage({ capabilityData, psychProfile, careers = [], userAps = 0, onRetake, navigate, onOpenCareer }: SkillsPageProps) {
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

  // ── Careers within reach ───────────────────────────────────────────────────
  // Pre-rank all careers once; find those where 1–2 small capability gaps are the blocker
  interface WithinReachCareer {
    name: string;
    currentScore: number;
    gaps: Array<{ label: string; yours: number; required: number; gap: number }>;
  }

  const withinReachCareers: WithinReachCareer[] = (() => {
    if (!capabilityData || !psychProfile || careers.length === 0) return [];

    const ranked = rankCareersByMatch(careers, psychProfile, capabilityData, userAps);
    const result: WithinReachCareer[] = [];

    for (const career of ranked) {
      // Skip careers already well-matched or very poor fits
      if (career.personalScore >= 78 || career.personalScore < 40) continue;

      const reqs = getCareerCapRequirements(career.name);
      if (!reqs) continue;

      const gaps = (Object.keys(reqs) as Array<keyof CapabilityData>)
        .map(key => {
          const required = reqs[key] ?? 60;
          const yours = (capabilityData[key] as number) ?? 60;
          return { label: CAP_DB_LABEL[key] ?? key, yours, required, gap: Math.max(0, required - yours) };
        })
        .filter(g => g.gap > 0)
        .sort((a, b) => a.gap - b.gap);

      // Within reach = 1–2 gaps, each small enough to close in < 2 months
      if (gaps.length >= 1 && gaps.length <= 2 && gaps.every(g => g.gap <= 18)) {
        result.push({ name: career.name, currentScore: career.personalScore, gaps });
      }

      if (result.length >= 4) break;
    }

    return result;
  })();

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
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Lowest 2 — highest ROI to move</h3>
            <div className="stack-2" style={{ marginTop: '0.875rem' }}>
              {sorted.slice(-2).map(c => {
                const plan = PROGRESSION_PLANS[c.l];
                return (
                  <div key={c.l} style={{ paddingBottom: '0.875rem', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div className="row-between" style={{ marginBottom: '0.375rem' }}>
                      <div style={{ fontWeight: 700 }}>{c.l}</div>
                      <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--warning))' }}>{c.v}/100</div>
                    </div>
                    <div className="meter warning" style={{ marginBottom: '0.5rem' }}>
                      <i style={{ width: `${c.v}%` }} />
                    </div>
                    {plan ? (
                      <>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{plan.action}</div>
                        <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                          <span className="badge">{plan.commitment}</span>
                          <span className="badge">{plan.weeks} weeks</span>
                          <span className="badge success">+8–12 pts</span>
                        </div>
                        <div className="caption" style={{ fontSize: '0.75rem' }}>
                          Unlocks: {plan.unlocks.slice(0, 3).join(' · ')}{plan.unlocks.length > 3 ? ` + ${plan.unlocks.length - 3} more` : ''}
                        </div>
                      </>
                    ) : (
                      <div className="caption" style={{ fontSize: '0.75rem' }}>
                        Targeted practice over 4–6 weeks should move this 8–12 points.
                      </div>
                    )}
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                    {DEVELOPMENT_ACTIONS[c.l]?.[0]?.action ?? 'Targeted practice over 4-6 weeks should move this 8-12 points.'}
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
              {CAP_DESCRIPTIONS[c.l]}
            </div>
          </div>
        ))}
      </div>

      {/* Development playbook — show for the 2 lowest-scoring dimensions */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Development playbook</div>
        <h3 className="subheading" style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>
          Specific actions to lift your lowest dimensions
        </h3>
        <div className="grid-2">
          {sorted.slice(-2).map(c => {
            const actions = DEVELOPMENT_ACTIONS[c.l];
            if (!actions) return null;
            return (
              <div key={c.l} style={{ padding: '1rem', background: 'hsl(var(--muted) / 0.3)', borderRadius: 8 }}>
                <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{c.l}</div>
                    <div className="caption" style={{ marginTop: '0.125rem' }}>{CAP_DESCRIPTIONS[c.l]}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'hsl(var(--warning))', fontVariantNumeric: 'tabular-nums' }}>
                    {c.v}
                  </div>
                </div>
                <div className="stack">
                  {actions.map((a, i) => (
                    <div key={i} style={{ paddingBottom: '0.625rem', borderBottom: i < actions.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                      <div className="row" style={{ gap: '0.625rem', alignItems: 'flex-start' }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                          background: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          color: i === 0 ? 'hsl(var(--primary-fg))' : 'hsl(var(--muted-fg))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.625rem', marginTop: 2,
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{a.action}</div>
                          <div className="caption" style={{ marginTop: '0.125rem', fontSize: '0.6875rem' }}>
                            {a.timeframe} · {a.resource}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="caption" style={{ marginTop: '0.875rem', fontSize: '0.6875rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.75rem' }}>
          Moving your bottom two dimensions by 8–12 points each typically improves your overall career match by 5–10 points.
          Consistent 4-week effort is more effective than sporadic intensive sessions.
        </div>
      </div>

      {/* Careers within reach */}
      {withinReachCareers.length > 0 && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '1rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Capability roadmap</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Careers within reach</h3>
              <p className="caption" style={{ marginTop: '0.25rem', maxWidth: '36rem' }}>
                These careers are close — one or two targeted capability improvements would make them strong matches for you.
              </p>
            </div>
            <span className="badge brand">{withinReachCareers.length} within reach</span>
          </div>
          <div className="grid-2">
            {withinReachCareers.map(career => (
              <div
                key={career.name}
                style={{
                  padding: '1rem',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  background: 'hsl(var(--muted) / 0.2)',
                  cursor: onOpenCareer || navigate ? 'pointer' : 'default',
                }}
                onClick={() => onOpenCareer ? onOpenCareer(career.name) : navigate?.('careers')}
              >
                <div className="row-between" style={{ marginBottom: '0.625rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{career.name}</div>
                  <span className="badge warning">Match: {career.currentScore}</span>
                </div>
                <div className="stack" style={{ gap: '0.5rem' }}>
                  {career.gaps.map(g => (
                    <div key={g.label}>
                      <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{g.label}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color: 'hsl(var(--warning))' }}>
                          +{g.gap} pts needed
                        </span>
                      </div>
                      <div className="meter warning" style={{ position: 'relative' }}>
                        <i style={{ width: `${g.yours}%`, background: 'hsl(var(--warning))' }} />
                        <span style={{
                          position: 'absolute', top: 0, bottom: 0,
                          left: `${Math.min(g.required, 100)}%`,
                          width: 2,
                          background: 'hsl(var(--fg) / 0.35)',
                        }} />
                      </div>
                      <div className="caption" style={{ marginTop: '0.2rem', fontSize: '0.6875rem' }}>
                        {DEVELOPMENT_ACTIONS[g.label]?.[0]?.action ?? `Lift ${g.label} by ${g.gap} points`}
                        {DEVELOPMENT_ACTIONS[g.label]?.[0] && ` · ${DEVELOPMENT_ACTIONS[g.label][0].timeframe}`}
                      </div>
                    </div>
                  ))}
                </div>
                {(onOpenCareer || navigate) && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid hsl(var(--border))' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%' }}
                      onClick={e => { e.stopPropagation(); onOpenCareer ? onOpenCareer(career.name) : navigate?.('careers'); }}
                    >
                      View career path →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="caption" style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border))', fontSize: '0.6875rem' }}>
            Scores calculated using the scoring engine. Gap sizes reflect capability requirements for each career archetype.
          </div>
        </div>
      )}
    </div>
  );
}
