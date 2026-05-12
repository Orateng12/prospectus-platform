'use client';

import type { CompareItem, Route } from '@/lib/types';
import { CAREERS } from '@/lib/data';
import { fmtR } from '@/lib/utils';

interface CareerComparePageProps {
  compareItems: CompareItem[];
  onClear: () => void;
  navigate: (r: Route) => void;
}

export default function CareerComparePage({ compareItems, onClear, navigate }: CareerComparePageProps) {
  const careerItems = compareItems.filter(c => c.kind === 'career');
  const careers = careerItems
    .map(c => CAREERS.find(career => career.name === c.id || career.name === c.name))
    .filter(Boolean);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · Career Compare</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Side-by-side</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Career compare</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Compare up to 4 careers side-by-side on fit, salary, growth, demand and capability requirements.
            </p>
          </div>
          <div className="row">
            {compareItems.length > 0 && (
              <button className="btn btn-outline" onClick={onClear}>Clear all</button>
            )}
            <button className="btn btn-primary" onClick={() => navigate('careers')}>Add careers →</button>
          </div>
        </div>
      </div>

      {careers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
          <div className="subheading" style={{ marginBottom: '0.5rem' }}>No careers added yet</div>
          <p className="body-text" style={{ maxWidth: '28rem', margin: '0 auto 1.25rem' }}>
            Go to Career Explorer and click &ldquo;Compare&rdquo; on any career card. Add up to 4 to compare them here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('careers')}>Open Career Explorer →</button>
        </div>
      ) : (
        <div className="card">
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${careers.length}, 1fr)`, gap: '1rem', marginBottom: '0.75rem' }}>
            <div />
            {careers.map(c => c && (
              <div key={c.name} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{c.name}</div>
                <div className="row" style={{ justifyContent: 'center', gap: '0.25rem', marginTop: '0.375rem' }}>
                  {c.tags.slice(0, 2).map(t => <span key={t} className="career-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {([
            { label: 'Match score',   values: careers.map(c => c ? `${c.match}/100` : '—') },
            { label: 'Median salary', values: careers.map(c => c ? `${fmtR(c.salary)}/mo` : '—') },
            { label: '10-yr growth',  values: careers.map(c => c ? c.growth : '—') },
            { label: 'Market demand', values: careers.map(c => c ? c.demand : '—') },
          ] as { label: string; values: string[] }[]).map(row => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: `160px repeat(${careers.length}, 1fr)`, gap: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.75rem', paddingBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'hsl(var(--muted-fg))', display: 'flex', alignItems: 'center' }}>{row.label}</div>
              {row.values.map((v, i) => (
                <div key={i} style={{ textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              ))}
            </div>
          ))}

          {/* Meter row */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${careers.length}, 1fr)`, gap: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.75rem', paddingBottom: '0.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'hsl(var(--muted-fg))', display: 'flex', alignItems: 'center' }}>Fit meter</div>
            {careers.map(c => c && (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center' }}>
                <div className="meter" style={{ flex: 1 }}><i style={{ width: `${c.match}%` }} /></div>
              </div>
            ))}
          </div>

          {/* Why row */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${careers.length}, 1fr)`, gap: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'hsl(var(--muted-fg))' }}>Why</div>
            {careers.map(c => c && (
              <div key={c.name} className="caption" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>{c.why}</div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="eyebrow"><span className="dot" />AI commentary</div>
        <h3 className="subheading" style={{ marginTop: '0.25rem' }}>How to read this comparison</h3>
        <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem', margin: 0 }}>
          Match score is composite: academic fit × capability fit × market signal. Salary is SA median for the role (mid-career, 5–8 years). Growth is projected 10-year demand change. The differences between your top careers are often smaller than they appear — workstyle and sector preferences matter as much as fit score.
        </p>
      </div>
    </div>
  );
}
