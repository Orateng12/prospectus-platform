import { CAREERS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { Career } from '@/lib/types';

interface CareersPageProps {
  careers?: Career[];
}

export default function CareersPage({ careers: propCareers }: CareersPageProps) {
  const careers = propCareers && propCareers.length > 0 ? propCareers : CAREERS;
  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Career Explorer</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Discover</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Career explorer</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {careers.length} roles ranked against your capability graph and labour-market signal.
              Each card shows fit, salary, growth and one line on why.
            </p>
          </div>
          <div className="row">
            <button className="btn btn-outline">Filters</button>
            <button className="btn btn-outline">Sort: Best fit</button>
            <button className="btn btn-primary">Compare 3</button>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className="tab active">Best fit ({careers.length})</button>
        <button className="tab">High demand</button>
        <button className="tab">High growth</button>
        <button className="tab">Top salary</button>
        <button className="tab">Saved</button>
      </div>

      <div className="grid-3 stack-3">
        {careers.map(c => (
          <div className="career-card" key={c.rank}>
            <div className="row-between">
              <div className="row" style={{ gap: '0.5rem' }}>
                <div className="career-rank">{String(c.rank).padStart(2, '0')}</div>
                <span
                  className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`}
                  style={{ height: '1.25rem', fontSize: '0.625rem' }}
                >
                  {c.demand} demand
                </span>
              </div>
              <div className="row" style={{ gap: '0.375rem', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                  {c.match}
                </span>
                <span className="caption" style={{ fontSize: '0.6875rem' }}>/100</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>{c.name}</div>
              <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${c.match}%` }} /></div>
            </div>

            <div className="row-between" style={{ fontSize: '0.75rem', paddingTop: '0.375rem', borderTop: '1px solid hsl(var(--border))' }}>
              <div>
                <div className="caption" style={{ fontSize: '0.625rem' }}>Median salary</div>
                <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtR(c.salary)}<span className="caption" style={{ fontWeight: 600 }}>/mo</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="caption" style={{ fontSize: '0.625rem' }}>10-yr growth</div>
                <div style={{ fontWeight: 800, color: 'hsl(var(--success))' }}>{c.growth}</div>
              </div>
            </div>

            <p className="body-text" style={{ fontSize: '0.8125rem', lineHeight: 1.55, margin: 0 }}>{c.why}</p>

            <div className="row" style={{ gap: '0.25rem' }}>
              {c.tags.map(t => (
                <span key={t} className="career-tag">{t}</span>
              ))}
            </div>

            <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>Compare</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Open path</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card stack-3" style={{ marginTop: '1.25rem' }}>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />AI commentary</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Reading your top 3</h3>
          </div>
          <button className="btn btn-ghost btn-sm">Why these careers?</button>
        </div>
        <p className="body-text" style={{ margin: 0, fontSize: '0.875rem' }}>
          Software Engineer, Data Scientist and Actuary form a tight cluster — all heavy on analytical +
          numerical capability and all currently expanding in SA. Picking among them is less about fit
          (close to identical) and more about <strong>workstyle</strong>: SE skews remote/async, Data
          Science hybrid/research, Actuary office/long-form. Try Career Compare to see them side-by-side.
        </p>
      </div>
    </div>
  );
}
