'use client';

import type { Career, Programme, CapabilityData, Route } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { fmtR } from '@/lib/utils';

interface CareerDetailPageProps {
  career: Career | null;
  programmes?: Programme[];
  capabilityData?: CapabilityData | null;
  navigate: (r: Route) => void;
}

const TAG_TO_CAPS: Record<string, Array<keyof CapabilityData>> = {
  'STEM':            ['analytical_thinking', 'technical_aptitude'],
  'Science':         ['analytical_thinking', 'technical_aptitude'],
  'Tech':            ['technical_aptitude', 'analytical_thinking'],
  'Engineering':     ['technical_aptitude', 'analytical_thinking'],
  'Finance':         ['analytical_thinking', 'risk_tolerance_score'],
  'Business':        ['entrepreneurial_drive', 'communication_skills'],
  'Remote-friendly': ['communication_skills', 'perseverance'],
  'High growth':     ['perseverance', 'entrepreneurial_drive'],
  'Creative':        ['creative_thinking', 'communication_skills'],
  'Leadership':      ['leadership_potential', 'communication_skills'],
  'Health':          ['perseverance', 'communication_skills'],
  'Law':             ['analytical_thinking', 'communication_skills'],
};

const CAP_LABEL: Record<keyof CapabilityData, string> = {
  analytical_thinking: 'Analytical',
  creative_thinking: 'Creative',
  leadership_potential: 'Leadership',
  communication_skills: 'Communication',
  technical_aptitude: 'Technical',
  entrepreneurial_drive: 'Entrepreneurial',
  risk_tolerance_score: 'Risk tolerance',
  perseverance: 'Perseverance',
  academic_readiness: 'Academic readiness',
  career_readiness: 'Career readiness',
};

function sparklinePoints(_baseSalary: number): string {
  const w = 160;
  const h = 48;
  const growth = [1, 1.12, 1.22, 1.35, 1.48, 1.6, 1.72, 1.82, 1.95, 2.1];
  const max = growth[growth.length - 1];
  return growth
    .map((g, i) => {
      const x = (i / (growth.length - 1)) * w;
      const y = h - ((g / max) * h * 0.85) - 4;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function CareerDetailPage({ career, programmes: propProgrammes, capabilityData, navigate }: CareerDetailPageProps) {
  if (!career) {
    return (
      <div className="page-anim">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="subheading" style={{ marginBottom: '0.75rem' }}>No career selected</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('careers')}>← Back to careers</button>
        </div>
      </div>
    );
  }

  const allProgs = propProgrammes && propProgrammes.length > 0 ? propProgrammes : PROGRAMMES;
  const relatedProgs = allProgs
    .filter(p => p.demand === career.demand && p.fit >= 70)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 3);
  const fallbackProgs = relatedProgs.length > 0 ? relatedProgs : allProgs.sort((a, b) => b.fit - a.fit).slice(0, 3);

  // Collect relevant capability dimensions from tags
  const capKeys = new Set<keyof CapabilityData>();
  career.tags.forEach(tag => {
    (TAG_TO_CAPS[tag] ?? []).forEach(k => capKeys.add(k));
  });
  if (capKeys.size === 0) {
    capKeys.add('analytical_thinking');
    capKeys.add('communication_skills');
  }
  const capList = Array.from(capKeys).slice(0, 4);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · Careers · Detail</div>
        <div className="row-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '0.5rem', padding: 0, fontSize: '0.8125rem' }}
              onClick={() => navigate('careers')}
            >
              ← Back to careers
            </button>
            <div className="eyebrow"><span className="dot" />Career path</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{career.name}</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>{career.why}</p>
          </div>
          <div className="row" style={{ alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span className={`badge ${career.demand === 'High' ? 'success' : 'warning'}`}>{career.demand} demand</span>
            <div className="card compact" style={{ textAlign: 'center', padding: '0.5rem 0.875rem', minWidth: 80 }}>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>{career.match}</div>
              <div className="caption" style={{ fontSize: '0.625rem' }}>/ 100 match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Path visualization */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="eyebrow" style={{ marginBottom: '1rem' }}><span className="dot" />Your path to this career</div>
        <div className="path-viz">
          {[
            { icon: '🎯', label: 'Career goal', sub: career.name },
            null,
            { icon: '🎓', label: 'Qualification', sub: `${fallbackProgs[0]?.name ?? 'Degree programme'} or similar` },
            null,
            { icon: '📚', label: 'Required subjects', sub: 'Maths, Sciences, English HL' },
            null,
            { icon: '🧠', label: 'Key capabilities', sub: capList.map(k => CAP_LABEL[k]).join(', ') },
          ].map((item, i) =>
            item === null ? (
              <div key={`arrow-${i}`} className="path-viz-arrow">↓</div>
            ) : (
              <div key={item.label} className="path-viz-step">
                <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{item.label}</div>
                <div className="caption" style={{ fontSize: '0.625rem', marginTop: '0.25rem' }}>{item.sub}</div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div className="stack-3">
          {/* Leading programmes */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Leading programmes</div>
            <div className="stack">
              {fallbackProgs.map(p => (
                <div
                  key={p.id}
                  style={{ padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('programmes')}
                  onKeyDown={e => e.key === 'Enter' && navigate('programmes')}
                >
                  <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <span className={`badge ${p.pathway}`}>{p.pathway}</span>
                  </div>
                  <div className="caption" style={{ marginTop: 2 }}>{p.uni}</div>
                  <div className="row" style={{ gap: '0.875rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span>APS <strong>{p.aps}</strong></span>
                    <span>{fmtR(p.fees)}/yr</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{p.fit}% fit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary sparkline */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />10-year salary trajectory</div>
            <div className="row-between" style={{ marginBottom: '0.75rem' }}>
              <div>
                <div className="caption" style={{ fontSize: '0.6875rem' }}>Entry</div>
                <div style={{ fontWeight: 800 }}>{fmtR(Math.round(career.salary * 0.55))}/mo</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="caption" style={{ fontSize: '0.6875rem' }}>Senior</div>
                <div style={{ fontWeight: 800, color: 'hsl(var(--success))' }}>{fmtR(Math.round(career.salary * 2))}/mo</div>
              </div>
            </div>
            <svg width="100%" viewBox="0 0 160 48" preserveAspectRatio="none" style={{ display: 'block' }}>
              <polyline
                points={sparklinePoints(career.salary)}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="row-between" style={{ marginTop: '0.375rem' }}>
              <span className="caption" style={{ fontSize: '0.625rem' }}>Year 1</span>
              <span className="caption" style={{ fontSize: '0.625rem', color: 'hsl(var(--success))' }}>Growth {career.growth}</span>
              <span className="caption" style={{ fontSize: '0.625rem' }}>Year 10</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="stack-3">
          {/* Tags */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Career profile</div>
            <div className="row" style={{ gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              {career.tags.map(t => (
                <span key={t} className="career-tag">{t}</span>
              ))}
            </div>
            <div className="stack-2">
              {[
                { l: 'Median monthly salary', v: `${fmtR(career.salary)}/mo` },
                { l: '10-year growth', v: career.growth },
                { l: 'Market demand', v: `${career.demand} demand` },
                { l: 'Match score', v: `${career.match}/100` },
              ].map(row => (
                <div key={row.l} className="stat-pair">
                  <div className="l">{row.l}</div>
                  <div className="v" style={{ fontSize: '0.875rem' }}>{row.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills gap */}
          {capabilityData && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Capability alignment</div>
              <div className="stack">
                {capList.map(key => {
                  const required = 70;
                  const yours = capabilityData[key] as number;
                  const gap = Math.max(0, required - yours);
                  return (
                    <div key={key} className="progress-row">
                      <span className="label">{CAP_LABEL[key]}</span>
                      <div className="meter" style={{ flex: 1 }}>
                        <i style={{ width: `${yours}%`, background: gap > 0 ? 'hsl(var(--warning))' : undefined }} />
                      </div>
                      <span className="val" style={{ color: gap > 0 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                        {yours}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="caption" style={{ marginTop: '0.75rem', fontSize: '0.6875rem' }}>
                Target ≥ 70 for this career. Yellow = gap to address.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
