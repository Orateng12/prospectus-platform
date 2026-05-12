'use client';

import { useState } from 'react';
import type { Route } from '@/lib/types';
import { PROGRAMMES, CAREERS } from '@/lib/data';
import { fmtR } from '@/lib/utils';

interface DiscoverPageProps {
  navigate: (r: Route) => void;
}

const CATEGORIES = [
  { label: 'STEM', icon: '⚗️', desc: 'Science, tech, engineering & maths', route: 'careers' as Route },
  { label: 'Finance', icon: '💹', desc: 'Actuarial, accounting, banking', route: 'funding' as Route },
  { label: 'Health', icon: '🩺', desc: 'Medicine, nursing, pharmacy', route: 'programmes' as Route },
  { label: 'Law', icon: '⚖️', desc: 'LLB, corporate, public interest', route: 'programmes' as Route },
  { label: 'Arts', icon: '🎨', desc: 'Design, media, architecture', route: 'programmes' as Route },
  { label: 'Education', icon: '📚', desc: 'Teaching, higher education', route: 'programmes' as Route },
];

export default function DiscoverPage({ navigate }: DiscoverPageProps) {
  const [query, setQuery] = useState('');

  const filteredProgs = query
    ? PROGRAMMES.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.uni.toLowerCase().includes(query.toLowerCase())
      )
    : PROGRAMMES.slice(0, 4);

  const filteredCareers = query
    ? CAREERS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : CAREERS.slice(0, 3);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · AI Discovery</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />AI-powered</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Discover</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Search across programmes, careers, universities and funding. Prospectus AI cross-references your capability graph and market data to surface the best matches.
            </p>
          </div>
          <span className="badge brand" style={{ height: '1.75rem', fontSize: '0.8125rem' }}>AI</span>
        </div>
      </div>

      {/* Big search */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', color: 'hsl(var(--muted-fg))' }}>⌕</span>
          <input
            className="input"
            style={{ flex: 1, minWidth: 0, height: '2.75rem', fontSize: '1rem' }}
            placeholder="Try: data science in Gauteng, or: careers with salary over R40k…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="btn btn-ghost btn-sm" onClick={() => setQuery('')}>Clear</button>
          )}
        </div>
        {!query && (
          <div className="row" style={{ marginTop: '0.875rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Software Engineer', 'BSc Data Science', 'NSFAS bursary', 'UCT programmes', 'High demand careers'].map(s => (
              <button key={s} className="badge" style={{ cursor: 'pointer', height: '1.75rem', fontSize: '0.75rem' }}
                onClick={() => setQuery(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {!query ? (
        <>
          {/* Category browse */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="sec">
              <h3>Browse by category</h3>
            </div>
            <div className="grid-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  className="card interactive"
                  style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  onClick={() => navigate(cat.route)}
                >
                  <div style={{ fontSize: '1.75rem' }}>{cat.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{cat.label}</div>
                  <div className="caption" style={{ fontSize: '0.8125rem' }}>{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI insight */}
          <div className="card">
            <div className="eyebrow"><span className="dot" />AI insight · for you</div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'hsl(var(--fg))' }}>
              Based on your Investigative RIASEC profile and high Analytical + Numerical capability scores, the sharpest career cluster for you is <strong>quantitative analysis</strong> — spanning data science, actuarial science and quant finance. All three are growing in SA, all pay above R 40k/mo at mid-career, and all build directly on your Maths trajectory.
            </p>
            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('careers')}>Career Explorer →</button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('intelligence')}>Why this?</button>
            </div>
          </div>
        </>
      ) : (
        <div className="stack-3">
          {filteredProgs.length > 0 && (
            <div>
              <div className="sec"><h3>Programmes</h3><span className="caption">{filteredProgs.length} results</span></div>
              <div className="stack">
                {filteredProgs.map(p => (
                  <button key={p.id} className="prog-row" style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => navigate('programmes')}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                      <div className="caption" style={{ marginTop: 2 }}>{p.uni} · APS {p.aps} · {fmtR(p.fees)}/yr</div>
                    </div>
                    <span className={`badge ${p.pathway}`}>{p.pathway[0].toUpperCase() + p.pathway.slice(1)}</span>
                    <div className="fit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                      <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '1rem' }}>{p.fit}</span>
                      <span className="caption">fit</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {filteredCareers.length > 0 && (
            <div>
              <div className="sec"><h3>Careers</h3><span className="caption">{filteredCareers.length} results</span></div>
              <div className="stack">
                {filteredCareers.map(c => (
                  <div key={c.name} className="card compact" style={{ cursor: 'pointer' }} onClick={() => navigate('careers')}>
                    <div className="row-between">
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <span className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`}>{c.demand} demand</span>
                    </div>
                    <div className="caption" style={{ marginTop: '0.25rem' }}>{fmtR(c.salary)}/mo · {c.growth} growth</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {filteredProgs.length === 0 && filteredCareers.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="caption">No results for &ldquo;{query}&rdquo; — try a different search term</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
