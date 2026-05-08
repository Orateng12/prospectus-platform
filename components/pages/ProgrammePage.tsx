'use client';

import { useState, useMemo } from 'react';
import type { Route, Subject, Programme } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { calcAPS, fmtR } from '@/lib/utils';

interface ProgrammePageProps {
  selectedProg: string;
  subjects: Subject[];
  navigate: (r: Route) => void;
  programmes?: Programme[];
}

const PATHWAY_LABELS: Record<string, string> = {
  direct:     'Direct entry',
  extended:   'Extended',
  foundation: 'Foundation',
  tvet:       'TVET',
};

/* ─── Detail view ─── keeps original prog-hero design exactly */
function ProgDetail({
  p, aps, navigate, onBack,
}: { p: Programme; aps: number; navigate: (r: Route) => void; onBack: () => void }) {
  const structure = [
    { y: 'Year 1', t: 'Foundations',    d: 'Core theory, introduction to the discipline, one minor' },
    { y: 'Year 2', t: 'Core modules',   d: 'Specialisation subjects, practical applications, two electives' },
    { y: 'Year 3', t: 'Specialisation', d: 'Capstone project + advanced electives in chosen track' },
  ];

  const requirements = [
    { name: 'Mathematics / Maths Literacy', req: p.aps >= 35 ? 60 : 50, mark: 78 },
    { name: 'English Home / First Add. Lang.', req: 50, mark: 62 },
    { name: 'Relevant NSC subject',           req: 50, mark: 71 },
    { name: 'NBT / institutional test',       req: 55, mark: null as number | null },
  ];

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit', fontSize: 'inherit' }}
          >
            Programmes
          </button>{' '}
          · {p.uni}
        </div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Programme detail</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{p.name}</h2>
            <div className="caption" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {p.uni} · {p.dur}-year {p.pathway === 'tvet' ? 'national diploma' : 'bachelor degree'}
            </div>
          </div>
          <div className="row">
            <span className={`badge ${p.pathway}`}>
              {p.pathway[0].toUpperCase() + p.pathway.slice(1)} entry
            </span>
            <button className="btn btn-outline">Save</button>
            <button className="btn btn-primary">Add to applications</button>
          </div>
        </div>
      </div>

      <div className="prog-hero">
        <div>
          <h3 className="subheading">
            Why this is a {p.fit >= 80 ? 'strong' : 'moderate'} match
          </h3>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>
            {p.fit >= 80
              ? <>Your Analytical (86) and Numerical (88) capability scores sit well above the median for
                  graduates of this programme. APS of <strong>{aps}</strong> exceeds the{' '}
                  <strong>{p.aps}</strong> requirement by {aps - p.aps} points.
                  Labour market signal is <strong>{p.demand.toLowerCase()}</strong> demand.</>
              : <>Your APS of <strong>{aps}</strong>{' '}
                  {aps >= p.aps ? 'meets the requirement of' : 'falls short of'}{' '}
                  <strong>{p.aps}</strong>. Capability fit is mixed — verbal score may need lifting via
                  the foundation pathway. Worth a conversation with the faculty.</>
            }
          </p>

          <div className="grid-4 stack-3" style={{ marginTop: '1rem' }}>
            <div className="stat-pair"><div className="l">APS required</div><div className="v">{p.aps}</div></div>
            <div className="stat-pair">
              <div className="l">Your APS</div>
              <div className="v" style={{ color: `hsl(var(--${aps >= p.aps ? 'success' : 'destructive'}))` }}>{aps}</div>
            </div>
            <div className="stat-pair"><div className="l">Annual fees</div><div className="v">{fmtR(p.fees)}</div></div>
            <div className="stat-pair">
              <div className="l">Median grad salary</div>
              <div className="v">
                {fmtR(p.salary)}{' '}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-fg))' }}>/mo</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          <h4 className="subheading" style={{ fontSize: '0.9375rem' }}>Subject requirements</h4>
          <div className="stack" style={{ marginTop: '0.625rem' }}>
            {requirements.map(r => {
              const met = r.mark !== null && r.mark >= r.req;
              const gap = r.mark === null;
              const cls = met ? 'met' : gap ? 'gap-req' : 'short';
              return (
                <div key={r.name} className={`req-row ${cls}`}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</div>
                    <div className="caption" style={{ marginTop: 1 }}>
                      {gap ? 'Not yet written · book the next test sitting' : met ? 'Above requirement' : 'Below requirement'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-fg))' }}>
                    Need {r.req}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    {r.mark ?? '—'}
                  </div>
                  <div className="check">{met ? '✓' : gap ? '?' : '✗'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card compact" style={{ borderColor: 'hsl(var(--fg))' }}>
            <div className="eyebrow"><span className="dot" />Match</div>
            <div style={{ fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', marginTop: '0.25rem' }}>
              {p.fit}<span style={{ fontSize: '1rem', color: 'hsl(var(--muted-fg))', fontWeight: 600 }}>/100</span>
            </div>
            <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${p.fit}%` }} /></div>
            <hr className="divider" />
            {([
              ['Academic fit',   Math.min(100, Math.round(p.fit + 5))],
              ['Capability fit', Math.max(40,  p.fit - 8)],
              ['Market fit',     p.demand === 'High' ? 92 : 64],
            ] as [string, number][]).map(([l, v]) => (
              <div key={l} className="row-between" style={{ fontSize: '0.75rem', marginTop: '0.375rem' }}>
                <span className="caption">{l}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card compact" style={{ marginTop: '1rem' }}>
            <div className="eyebrow"><span className="dot" />Funding likelihood</div>
            <div className="row" style={{ alignItems: 'baseline', marginTop: '0.375rem', gap: '0.375rem' }}>
              <span style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em' }}>High</span>
              <span className="caption">87%</span>
            </div>
            <div className="caption" style={{ marginTop: '0.375rem' }}>
              NSFAS-eligible · 4 bursaries match · Allan Gray Orbis 92%
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('funding')}
              style={{ width: '100%', marginTop: '0.625rem' }}
            >
              Open funding strategy →
            </button>
          </div>

          <div className="card compact" style={{ marginTop: '1rem' }}>
            <div className="eyebrow"><span className="dot" />Career path</div>
            <div className="stack" style={{ marginTop: '0.625rem' }}>
              {[
                ['Software Engineer', 'success', '88%'],
                ['Data Scientist',    'success', '82%'],
                ['ML Engineer',      'warning', '71%'],
                ['Research Scientist','warning', '64%'],
              ].map(([l, c, v]) => (
                <div key={l} className="row-between" style={{ fontSize: '0.8125rem' }}>
                  <span>{l}</span>
                  <span className={`badge ${c}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 stack-3">
        <div className="card">
          <div className="eyebrow"><span className="dot" />Programme structure</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>3 years · 360 credits</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            {structure.map(s => (
              <div key={s.y} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', padding: '0.625rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{s.y}</div>
                  <div className="caption">{s.t}</div>
                </div>
                <div className="caption" style={{ fontSize: '0.8125rem', color: 'hsl(var(--fg))' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow"><span className="dot" />Outcomes</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Where graduates land</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            <div>
              <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span>Industry employment</span><span style={{ fontWeight: 800 }}>81%</span>
              </div>
              <div className="meter success" style={{ marginTop: '0.25rem' }}><i style={{ width: '81%' }} /></div>
              <div className="caption" style={{ marginTop: '0.25rem' }}>Within 6 months of graduation</div>
            </div>
            <div>
              <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span>Postgraduate study</span><span style={{ fontWeight: 800 }}>14%</span>
              </div>
              <div className="meter primary" style={{ marginTop: '0.25rem' }}><i style={{ width: '14%' }} /></div>
            </div>
            <div>
              <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span>Top employers</span><span className="caption">Last 3 cohorts</span>
              </div>
              <div className="row" style={{ marginTop: '0.375rem' }}>
                {['Discovery', 'Standard Bank', 'Naspers / Prosus', 'Google ZA', 'Allan Gray'].map(e => (
                  <span key={e} className="badge">{e}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Programme List ─── career-card grid style */
export default function ProgrammePage({ selectedProg, subjects, navigate, programmes }: ProgrammePageProps) {
  const allProgs = programmes ?? PROGRAMMES;
  const aps = calcAPS(subjects);

  const initialProg = allProgs.find(p => p.id === selectedProg) ?? null;
  const [selected, setSelected] = useState<Programme | null>(initialProg);
  const [activeTab, setActiveTab] = useState<'fit' | 'aps' | 'fees' | 'saved'>('fit');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    let list = allProgs;
    if (eligibleOnly) list = list.filter(p => p.aps <= aps);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.uni.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (activeTab === 'aps')  return a.aps - b.aps;
      if (activeTab === 'fees') return a.fees - b.fees;
      return b.fit - a.fit; // default: best fit
    });
  }, [allProgs, activeTab, eligibleOnly, search, aps]);

  if (selected) {
    return <ProgDetail p={selected} aps={aps} navigate={navigate} onBack={() => setSelected(null)} />;
  }

  const eligibleCount = allProgs.filter(p => p.aps <= aps).length;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Plan · Programmes</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Programme explorer</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>
              {eligibleCount} programmes match your APS
            </h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {allProgs.length.toLocaleString()} programmes from{' '}
              {new Set(allProgs.map(p => p.uni)).size} institutions across SA.
              Each card shows fit, fees and pathway — click to see the full detail.
            </p>
          </div>
          <div className="row">
            <button
              className={`btn ${eligibleOnly ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setEligibleOnly(v => !v)}
            >
              {eligibleOnly ? '✓ Eligible only' : 'Eligible only'}
            </button>
            <input
              className="input"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 0, width: 180 }}
            />
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab ${activeTab === 'fit'  ? 'active' : ''}`} onClick={() => setActiveTab('fit')}>
          Best fit ({eligibleCount})
        </button>
        <button className={`tab ${activeTab === 'aps'  ? 'active' : ''}`} onClick={() => setActiveTab('aps')}>
          Lowest APS first
        </button>
        <button className={`tab ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}>
          Lowest fees first
        </button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          Saved
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3 className="subheading">No programmes match</h3>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>
            {search ? 'Try a different search term.' : 'No eligible programmes at your current APS — use the simulator to explore mark changes.'}
          </p>
          {eligibleOnly && (
            <button className="btn btn-outline" onClick={() => setEligibleOnly(false)} style={{ marginTop: '1rem' }}>
              Show all programmes
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3 stack-3">
          {sorted.map((p, i) => {
            const eligible = p.aps <= aps;
            return (
              <div
                className="career-card"
                key={p.id}
                onClick={() => setSelected(p)}
              >
                {/* Top row: rank + pathway badge | fit score */}
                <div className="row-between">
                  <div className="row" style={{ gap: '0.5rem' }}>
                    <div className="career-rank">{String(i + 1).padStart(2, '0')}</div>
                    <span className={`badge ${p.pathway}`} style={{ height: '1.25rem', fontSize: '0.625rem' }}>
                      {PATHWAY_LABELS[p.pathway]}
                    </span>
                  </div>
                  <div className="row" style={{ gap: '0.375rem', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                      {p.fit}
                    </span>
                    <span className="caption" style={{ fontSize: '0.6875rem' }}>/100</span>
                  </div>
                </div>

                {/* Name + institution + meter */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{p.name}</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{p.uni}</div>
                  <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${p.fit}%` }} /></div>
                </div>

                {/* Stats row */}
                <div className="row-between" style={{ fontSize: '0.75rem', paddingTop: '0.375rem', borderTop: '1px solid hsl(var(--border))' }}>
                  <div>
                    <div className="caption" style={{ fontSize: '0.625rem' }}>Annual fees</div>
                    <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {p.fees ? fmtR(p.fees) : '—'}
                      <span className="caption" style={{ fontWeight: 600 }}>/yr</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="caption" style={{ fontSize: '0.625rem' }}>APS required</div>
                    <div style={{
                      fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                      color: eligible ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                    }}>
                      {p.aps || '—'}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="row" style={{ gap: '0.25rem' }}>
                  {eligible && <span className="career-tag" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>Eligible</span>}
                  <span className="career-tag">{p.dur} yr{p.dur !== 1 ? 's' : ''}</span>
                  {p.fees < 40000 && <span className="career-tag">Affordable</span>}
                </div>

                {/* Actions */}
                <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); }}>Save</button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>View detail</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
