import type { Route, StrategicScoreData, CapabilityData, Capability, Programme, Career, PsychProfileData, Subject } from '@/lib/types';
import { CAPS, CAREERS } from '@/lib/data';
import { scoreCareerMatch } from '@/lib/scoring';
import { fmtR } from '@/lib/utils';
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

const FALLBACK_PROBS = [
  { name: 'Software Engineer', score: 88, salary: undefined as number | undefined, growth: '+22%' },
  { name: 'Data Analyst',      score: 82, salary: undefined as number | undefined, growth: '+18%' },
  { name: 'Actuary',           score: 76, salary: undefined as number | undefined, growth: '+9%'  },
  { name: 'Civil Engineer',    score: 58, salary: undefined as number | undefined, growth: '+5%'  },
  { name: 'Doctor',            score: 41, salary: undefined as number | undefined, growth: '+7%'  },
];

export default function IntelligencePage({ navigate, strategicScore, capabilityData, programmes = [], careers = [], psychProfile, subjects = [], userAps = 0 }: IntelligencePageProps) {
  const score = strategicScore?.overall ?? 74;
  const prev  = strategicScore?.previous_score;
  const delta = prev != null ? score - prev : 6;
  const trend = strategicScore?.trend ?? 'improving';

  const subScores = [
    { l: 'Academic readiness',   v: strategicScore?.academic_readiness        ?? 86, sub: 'APS, subject mix, prerequisite gaps',                c: 'success' },
    { l: 'Career alignment',     v: strategicScore?.career_demand_alignment    ?? 68, sub: 'Labour market signal vs. your top careers',          c: 'primary' },
    { l: 'Financial feasibility',v: strategicScore?.financial_feasibility      ?? 71, sub: 'NSFAS + bursary fit · scholarship pipeline',         c: 'accent'  },
    { l: 'Personality fit',      v: strategicScore?.personality_career_fit     ?? 79, sub: 'Big Five · RIASEC vs. target career profiles',       c: 'warning' },
    { l: 'Global mobility',      v: strategicScore?.global_mobility_potential  ?? 68, sub: 'International demand × academic strength',           c: 'primary' },
    { l: 'Skill readiness',      v: strategicScore?.skill_readiness            ?? 72, sub: 'Mean of 8 core capability dimensions',               c: 'success' },
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
              <div key={name} className="progress-row">
                <span className="label">{name}</span>
                <div className={`meter ${score >= 80 ? 'success' : score >= 65 ? 'primary' : 'accent'}`}>
                  <i style={{ width: `${score}%` }} />
                </div>
                <span className="val">{score}</span>
              </div>
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
          <div className="eyebrow"><span className="dot" />Future-You · 2031</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>If you stay on the highest-fit path</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            <div className="stat-pair">
              <div className="l">Likely role</div>
              <div className="v">{topCareer ? topCareer.name : 'Data Scientist'}</div>
            </div>
            <div className="stat-pair">
              <div className="l">Median salary</div>
              <div className="v">
                {topCareer?.salary ? `${fmtR(topCareer.salary)} / mo` : 'R\u00A041,200 / mo'}
              </div>
            </div>
            <div className="stat-pair">
              <div className="l">Industry growth</div>
              <div className="v">{topCareer?.growth ? `${topCareer.growth} / yr` : '+18% / yr'}</div>
            </div>
          </div>
          <div className="caption" style={{ marginTop: '0.75rem' }}>
            {psychProfile
              ? `Derived from your RIASEC profile + capability graph. Match score: ${topCareer?.score ?? '—'}/100.`
              : 'Based on labour-market data + your capability graph + 12 generated scenarios.'}
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
