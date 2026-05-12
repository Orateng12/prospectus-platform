import { CAPS } from '@/lib/data';
import RadarChart from '@/components/RadarChart';
import type { CapabilityData, Capability } from '@/lib/types';

interface SkillsPageProps {
  capabilityData?: CapabilityData | null;
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

export default function SkillsPage({ capabilityData }: SkillsPageProps) {
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
            <button className="btn btn-outline">Update inputs</button>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
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
