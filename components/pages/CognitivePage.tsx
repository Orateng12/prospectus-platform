import { BIG5, RIASEC } from '@/lib/data';
import type { BigFiveTrait, RiasecItem, PsychProfileData } from '@/lib/types';

interface CognitivePageProps {
  psychProfile?: PsychProfileData | null;
}

export default function CognitivePage({ psychProfile }: CognitivePageProps) {
  // Merge DB data into mock — DB wins when present
  const big5: BigFiveTrait[] = BIG5.map(b => {
    if (!psychProfile) return b;
    const key = b.l.toLowerCase() as keyof PsychProfileData;
    const dbVal = psychProfile[key];
    return typeof dbVal === 'number' ? { ...b, v: dbVal } : b;
  });

  const riasec: RiasecItem[] = RIASEC.map(r => {
    if (!psychProfile) return r;
    const key = r.l.toLowerCase() as keyof PsychProfileData;
    const dbVal = psychProfile[key];
    return typeof dbVal === 'number' ? { ...r, v: dbVal } : r;
  }).sort((a, b) => b.v - a.v);

  // Holland code: top 3 letters
  const hollandCode = riasec
    .slice(0, 3)
    .map(r => r.l[0])
    .join('');

  const top2 = riasec.slice(0, 2).map(r => r.l).join('-');
  const hasData = !!psychProfile;
  const workStyle = psychProfile?.work_style_preference ?? 'Analytical & methodical';
  const motivation = psychProfile?.primary_motivation ?? 'Intellectual challenge';

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Self · Cognitive Assessment</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Identity layer</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Cognitive assessment</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Big Five traits + Holland (RIASEC) interest profile. Combined with your capability graph,
              these feed every match score across the platform.
            </p>
          </div>
          <div className="row">
            <span className={`badge ${hasData ? 'success' : 'warning'}`}>
              {hasData ? 'Profile loaded · real data' : 'Showing defaults · take assessment'}
            </span>
            <button className="btn btn-outline">Re-take</button>
          </div>
        </div>
      </div>

      <div className="grid-2 stack-3">
        {/* Big Five */}
        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Big Five</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Trait profile</h3>
            </div>
            <button className="btn btn-ghost btn-sm">What is this?</button>
          </div>
          <div>
            {big5.map(b => (
              <div key={b.l} style={{ padding: '0.625rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <div className="row-between">
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.l}</div>
                  <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    {b.v}<span className="caption" style={{ fontWeight: 600 }}>/100</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px', gap: '0.875rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div className="caption" style={{ fontSize: '0.6875rem', textAlign: 'left' }}>{b.lo}</div>
                  <div className="pent-bar"><i style={{ left: `${b.v}%` }} /></div>
                  <div className="caption" style={{ fontSize: '0.6875rem', textAlign: 'right' }}>{b.hi}</div>
                </div>
                <div className="caption" style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="stack-3">
          {/* RIASEC */}
          <div className="card">
            <div className="eyebrow"><span className="dot" />RIASEC profile</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Holland code · {hollandCode}</h3>
            <p className="body-text" style={{ marginTop: '0.375rem', fontSize: '0.8125rem' }}>
              {top2}-dominant profile — aligns with technical, research, and analytical career tracks.
              Work style: <strong>{workStyle}</strong>. Primary motivation: <strong>{motivation}</strong>.
            </p>
            <div style={{ marginTop: '1rem' }}>
              {riasec.map(r => (
                <div key={r.l} className="progress-row" style={{ marginBottom: '0.5rem' }}>
                  <span className="label">{r.l}</span>
                  <div className={`meter ${r.v >= 80 ? 'success' : r.v >= 60 ? 'primary' : 'accent'}`}>
                    <i style={{ width: `${r.v}%` }} />
                  </div>
                  <span className="val">{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="card">
            <div className="eyebrow"><span className="dot" />What this means</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Translation for careers</h3>
            <div className="stack-2" style={{ marginTop: '0.875rem' }}>
              <div className="insight">
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  High Conscientiousness × {riasec[0]?.l ?? 'Investigative'}
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                  Combines methodical execution with curiosity — the profile of strong researchers and
                  technical product engineers.
                </p>
              </div>
              <div className="insight">
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  Neuroticism {big5[4]?.v ?? 45} — {(big5[4]?.v ?? 45) < 50 ? 'stability is an asset' : 'worth managing'}
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                  {(big5[4]?.v ?? 45) < 50
                    ? 'A lower score means you stay steady in pressure-heavy roles — surgical, financial, and deadline-driven work all suit you.'
                    : 'A higher score means you feel stress acutely. Build strong routines and recovery habits — they will compound over a long career.'}
                </p>
              </div>
              <div className="insight">
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  Extraversion {big5[2]?.v ?? 61} — flexible range
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                  Mid-range extraversion means you flex between focused solo work and group collaboration.
                  Don&apos;t over-index on either an &quot;introvert&quot; or &quot;extrovert&quot; career.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
