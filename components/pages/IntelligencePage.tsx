import type { Route, StrategicScoreData, CapabilityData, Capability } from '@/lib/types';
import { CAPS } from '@/lib/data';
import DonutChart from '@/components/DonutChart';

interface IntelligencePageProps {
  navigate: (r: Route) => void;
  strategicScore?: StrategicScoreData | null;
  capabilityData?: CapabilityData | null;
}

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

export default function IntelligencePage({ navigate, strategicScore, capabilityData }: IntelligencePageProps) {
  const score = strategicScore?.overall ?? 74;
  const prev  = strategicScore?.previous_score;
  const delta = prev != null ? score - prev : 6;
  const trend = strategicScore?.trend ?? 'improving';

  const subScores = [
    { l: 'Academic readiness',   v: strategicScore?.academic_readiness       ?? 86, sub: 'APS, subject mix, prerequisite gaps',              c: 'success' },
    { l: 'Career alignment',     v: strategicScore?.career_demand_alignment   ?? 68, sub: 'Labour market signal vs. your top careers',        c: 'primary' },
    { l: 'Financial feasibility',v: strategicScore?.financial_feasibility     ?? 71, sub: 'NSFAS + bursary fit · scholarship pipeline',       c: 'accent'  },
    { l: 'Personality fit',      v: strategicScore?.personality_career_fit    ?? 79, sub: 'Big Five · RIASEC vs. target career profiles',     c: 'warning' },
  ];

  const caps: Capability[] = capabilityData
    ? DB_TO_CAP.map(([dbKey, label]) => ({
        l: label,
        v: capabilityData[dbKey] ?? CAPS.find(c => c.l === label)?.v ?? 60,
      }))
    : CAPS.map(c => ({ ...c }));

  const layers = [
    { n: '01', k: 'Identity',    t: 'Cognitive · Big Five · RIASEC · 8-D capability graph',   stat: '92%', sub: 'profile completeness' },
    { n: '02', k: 'Opportunity', t: 'Labour market · industry forecasts · top growing careers', stat: '18',  sub: 'high-demand careers matched' },
    { n: '03', k: 'Decision',    t: 'Scenario generator · career probability · AI insights',   stat: '12',  sub: 'scenarios generated' },
    { n: '04', k: 'Execution',   t: 'Skill gap · trajectory · scholarship matcher',            stat: '9',   sub: 'next actions queued' },
  ];

  const hasData = !!strategicScore;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Intelligence</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />The platform&apos;s moat</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Intelligence dashboard</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Four engines run in parallel against your profile — identity, opportunity, decision and execution.
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
            Four sub-scores combine on a weighted average. Move any of them and the composite moves with it.
          </p>
          <div className="stack-2" style={{ marginTop: '1rem' }}>
            {subScores.map(x => (
              <div key={x.l}>
                <div className="row-between">
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{x.l}</span>
                  <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{x.v}</span>
                </div>
                <div className={`meter ${x.c}`} style={{ marginTop: '0.375rem' }}>
                  <i style={{ width: `${x.v}%` }} />
                </div>
                <div className="caption" style={{ marginTop: '0.25rem' }}>{x.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 engine layers */}
      <div className="grid-4 stack-3">
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

      {/* Lower 2×2 */}
      <div className="grid-2 stack-3" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Career probability</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Per pathway · academic + psych fit</h3>
            </div>
            <button className="btn btn-ghost btn-sm">Why?</button>
          </div>
          <div className="stack-2">
            {[
              ['Software Engineer', 88],
              ['Data Analyst',      82],
              ['Actuary',          76],
              ['Civil Engineer',   58],
              ['Doctor',           41],
            ].map(([l, v]) => (
              <div key={l} className="progress-row">
                <span className="label">{l}</span>
                <div className="meter"><i style={{ width: `${v}%` }} /></div>
                <span className="val">{v}</span>
              </div>
            ))}
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
          <div className="eyebrow"><span className="dot" />Future-You · 2031</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>If you stay on the highest-fit path</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            <div className="stat-pair"><div className="l">Likely role</div><div className="v">Junior Data Scientist</div></div>
            <div className="stat-pair"><div className="l">Median salary</div><div className="v">R 41,200 / mo</div></div>
            <div className="stat-pair"><div className="l">Industry growth</div><div className="v">+18% / yr</div></div>
          </div>
          <div className="caption" style={{ marginTop: '0.75rem' }}>
            Based on labour-market data + your capability graph + 12 generated scenarios.
          </div>
        </div>

        <div className="card">
          <div className="eyebrow"><span className="dot" />AI commentary</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What changed this month</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            <div className="insight">
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                Maths jump moved your strategic position
              </div>
              <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                Your prelim Maths went 72 → 78. APS rose by 6, opening Actuarial Science at Wits
                and UP within direct-entry range.
              </p>
              <div className="src" style={{ marginTop: '0.5rem' }}>GPT-4 · 2 hours ago</div>
            </div>
            <div className="insight">
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                Funding gap is now your bottleneck
              </div>
              <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                You have R 92,000 / yr in matched funding but UCT CS costs R 76,420 + residence.
                Apply to Allan Gray to close it.
              </p>
              <div className="src" style={{ marginTop: '0.5rem' }}>Gemini · 6 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
