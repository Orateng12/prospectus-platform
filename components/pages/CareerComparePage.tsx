'use client';

import type { CompareItem, Route, Career, Programme, University, Scholarship, PsychProfileData, CapabilityData } from '@/lib/types';
import { PROGRAMMES, CAREERS, UNIS, SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import { scoreCareerMatch } from '@/lib/scoring';

interface ComparePageProps {
  compareItems: CompareItem[];
  onClear: () => void;
  navigate: (r: Route) => void;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  userAps?: number;
  liveCareerMatches?: Record<string, number>;
  programmes?: Programme[];
  allCareersData?: Career[];
}

// ── Reusable section layout ──────────────────────────────────────────────────
// Each section is a card with a fixed label column + one column per item.
// Wrapped in overflow-x: auto so it scrolls on narrow screens instead of breaking.

function CmpSection({ title, n, header, rows }: {
  title: string;
  n: number;
  header: React.ReactNode[];
  rows: Array<{ label: string; cells: React.ReactNode[] }>;
}) {
  const LABEL_W = 110;
  const ITEM_W  = 155;

  return (
    <div className="card">
      <div className="eyebrow" style={{ marginBottom: '0.875rem' }}>
        <span className="dot" />{title}
        <span className="caption" style={{ marginLeft: '0.5rem' }}>
          {n} item{n !== 1 ? 's' : ''} · {4 - n > 0 ? `${4 - n} slot${4 - n !== 1 ? 's' : ''} open` : 'full'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: LABEL_W + n * ITEM_W }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `${LABEL_W}px repeat(${n}, 1fr)`,
            gap: '0.5rem 1rem',
            paddingBottom: '0.625rem',
            borderBottom: '1px solid hsl(var(--border))',
          }}>
            <div />
            {header.map((h, i) => <div key={i}>{h}</div>)}
          </div>

          {/* Data rows */}
          {rows.map(row => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: `${LABEL_W}px repeat(${n}, 1fr)`,
                gap: '0.5rem 1rem',
                borderTop: '1px solid hsl(var(--border))',
                padding: '0.5rem 0',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'hsl(var(--muted-fg))' }}>
                {row.label}
              </div>
              {row.cells.map((cell, ci) => (
                <div key={ci} style={{ fontVariantNumeric: 'tabular-nums' }}>{cell}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add-more buttons based on what's missing ─────────────────────────────────
function AddButtons({ navigate }: { navigate: (r: Route) => void }) {
  return (
    <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('careers')}>+ Career</button>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('programmes')}>+ Programme</button>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('unis')}>+ University</button>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('scholarships')}>+ Scholarship</button>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CareerComparePage({ compareItems, onClear, navigate, psychProfile, capabilityData, userAps = 0, liveCareerMatches, programmes, allCareersData }: ComparePageProps) {
  const allProgs = programmes && programmes.length > 0 ? programmes : PROGRAMMES;
  const allCareers = allCareersData && allCareersData.length > 0 ? allCareersData : CAREERS;
  // Group and look up full objects for each type
  const careers = compareItems
    .filter(c => c.kind === 'career')
    .map(c => {
      const base = allCareers.find(x => x.name === c.id);
      if (!base) return undefined;
      // Use live score if available, otherwise fall back to static match
      const liveMatch = liveCareerMatches?.[c.name]
        ?? (psychProfile && capabilityData ? scoreCareerMatch(c.name, psychProfile, capabilityData, userAps) : base.match);
      return { ...base, match: liveMatch };
    })
    .filter((c): c is Career => c !== undefined);

  const progs = compareItems
    .filter(c => c.kind === 'prog')
    .map(c => allProgs.find(x => x.id === c.id || x.name === c.name))
    .filter((p): p is Programme => p !== undefined);

  const unis = compareItems
    .filter(c => c.kind === 'uni')
    .map(c => UNIS.find(x => x.short === c.id || x.name === c.name))
    .filter((u): u is University => u !== undefined);

  const scholars = compareItems
    .filter(c => c.kind === 'scholarship')
    .map(c => SCHOLARSHIPS.find(x => x.name === c.id))
    .filter((s): s is Scholarship => s !== undefined);

  const hasAny = compareItems.length > 0;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · Compare</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Side-by-side</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Compare</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Compare careers, programmes, universities and scholarships side-by-side.
              Add up to 4 items per type using the buttons below or the Compare button on any list page.
            </p>
          </div>
          <div className="row" style={{ gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {hasAny && (
              <button className="btn btn-outline" onClick={onClear}>Clear all</button>
            )}
            <AddButtons navigate={navigate} />
          </div>
        </div>
      </div>

      {!hasAny ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚖️</div>
          <div className="subheading" style={{ marginBottom: '0.5rem' }}>Nothing to compare yet</div>
          <p className="body-text" style={{ maxWidth: '28rem', margin: '0 auto 1.5rem' }}>
            Hit <strong>Compare</strong> on any career, programme, university or scholarship card.
            Add up to 4 items per type, then come back here to see them side-by-side.
          </p>
          <AddButtons navigate={navigate} />
        </div>
      ) : (
        <div className="stack-3">

          {/* ── Careers ── */}
          {careers.length > 0 && (
            <CmpSection
              title="Careers"
              n={careers.length}
              header={careers.map(c => (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{c.name}</div>
                  <div className="row" style={{ gap: '0.25rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                    {c.tags.slice(0, 2).map(t => (
                      <span key={t} className="career-tag" style={{ fontSize: '0.625rem', padding: '0 0.375rem', height: '1.25rem' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              rows={[
                {
                  label: 'Match score',
                  cells: careers.map(c => (
                    <div>
                      <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>{c.match}</span>
                      <span className="caption" style={{ fontWeight: 400 }}>/100</span>
                    </div>
                  )),
                },
                {
                  label: 'Fit',
                  cells: careers.map(c => (
                    <div className="meter" style={{ maxWidth: 120 }}><i style={{ width: `${c.match}%` }} /></div>
                  )),
                },
                {
                  label: 'Median salary',
                  cells: careers.map(c => (
                    <span style={{ fontWeight: 700 }}>{fmtR(c.salary)}<span className="caption">/mo</span></span>
                  )),
                },
                {
                  label: '10-yr growth',
                  cells: careers.map(c => (
                    <span className={`badge ${c.growth.startsWith('+') ? 'success' : 'destructive'}`}>{c.growth}</span>
                  )),
                },
                {
                  label: 'Demand',
                  cells: careers.map(c => (
                    <span className={`badge ${c.demand === 'High' ? 'success' : c.demand === 'Low' ? 'destructive' : 'warning'}`}>{c.demand}</span>
                  )),
                },
                {
                  label: 'Why',
                  cells: careers.map(c => (
                    <p className="body-text" style={{ fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>{c.why}</p>
                  )),
                },
                {
                  label: 'Scarce skill',
                  cells: careers.map(c => (
                    c.scarce_skill
                      ? <span className="badge accent" style={{ fontSize: '0.625rem' }}>Yes</span>
                      : <span className="caption">No</span>
                  )),
                },
              ]}
            />
          )}

          {/* ── Programmes ── */}
          {progs.length > 0 && (
            <CmpSection
              title="Programmes"
              n={progs.length}
              header={progs.map(p => (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', lineHeight: 1.25 }}>{p.name}</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{p.uni}</div>
                </div>
              ))}
              rows={[
                {
                  label: 'Fit score',
                  cells: progs.map(p => (
                    <div>
                      <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>{p.fit}</span>
                      <span className="caption">/100</span>
                    </div>
                  )),
                },
                {
                  label: 'Fit',
                  cells: progs.map(p => (
                    <div className="meter" style={{ maxWidth: 120 }}><i style={{ width: `${p.fit}%` }} /></div>
                  )),
                },
                {
                  label: 'APS required',
                  cells: progs.map(p => <span style={{ fontWeight: 700 }}>{p.aps || '—'}</span>),
                },
                {
                  label: 'Annual fees',
                  cells: progs.map(p => <span style={{ fontWeight: 700 }}>{fmtR(p.fees)}<span className="caption">/yr</span></span>),
                },
                {
                  label: 'Duration',
                  cells: progs.map(p => <span style={{ fontWeight: 600 }}>{p.dur} yr{p.dur !== 1 ? 's' : ''}</span>),
                },
                {
                  label: 'Pathway',
                  cells: progs.map(p => (
                    <span className={`badge ${p.pathway}`}>{p.pathway[0].toUpperCase() + p.pathway.slice(1)}</span>
                  )),
                },
                {
                  label: 'Demand',
                  cells: progs.map(p => (
                    <span className={`badge ${p.demand === 'High' ? 'success' : p.demand === 'Low' ? 'destructive' : 'warning'}`}>{p.demand}</span>
                  )),
                },
                {
                  label: 'Total cost',
                  cells: progs.map(p => (
                    <div>
                      <span style={{ fontWeight: 700 }}>{fmtR(p.fees * p.dur)}</span>
                      <div className="caption" style={{ fontSize: '0.6875rem' }}>{p.dur} yr × {fmtR(p.fees)}</div>
                    </div>
                  )),
                },
              ]}
            />
          )}

          {/* ── Universities ── */}
          {unis.length > 0 && (
            <CmpSection
              title="Universities"
              n={unis.length}
              header={unis.map(u => (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{u.short}</div>
                  <div className="caption" style={{ marginTop: '0.125rem' }}>{u.city} · {u.province}</div>
                </div>
              ))}
              rows={[
                {
                  label: 'SA rank',
                  cells: unis.map(u => <span style={{ fontWeight: 900, fontSize: '1.125rem' }}>#{u.rank}</span>),
                },
                {
                  label: 'Acceptance',
                  cells: unis.map(u => (
                    <span className={`badge ${u.accept <= 20 ? 'destructive' : u.accept <= 30 ? 'warning' : 'success'}`}>{u.accept}%</span>
                  )),
                },
                {
                  label: 'Annual fees',
                  cells: unis.map(u => <span style={{ fontWeight: 700 }}>{fmtR(u.fees)}<span className="caption">/yr</span></span>),
                },
                {
                  label: 'Programmes',
                  cells: unis.map(u => <span style={{ fontWeight: 600 }}>{u.progs}</span>),
                },
                {
                  label: 'Tier',
                  cells: unis.map(u => <span className={`badge ${u.tag}`}>{u.acpt}</span>),
                },
              ]}
            />
          )}

          {/* ── Scholarships ── */}
          {scholars.length > 0 && (
            <CmpSection
              title="Scholarships"
              n={scholars.length}
              header={scholars.map(s => (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', lineHeight: 1.25 }}>{s.name}</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>Closes {s.deadline}</div>
                </div>
              ))}
              rows={[
                {
                  label: 'Annual value',
                  cells: scholars.map(s => (
                    <span style={{ fontWeight: 900, fontSize: '1.125rem', color: 'hsl(var(--success))' }}>{fmtR(s.amount)}</span>
                  )),
                },
                {
                  label: 'Match score',
                  cells: scholars.map(s => (
                    <div className={`match-circle${s.match < 80 ? ' med' : ''}`} style={{ width: 36, height: 36, fontSize: '0.875rem' }}>
                      {s.match}
                    </div>
                  )),
                },
                {
                  label: 'Eligibility',
                  cells: scholars.map(s => (
                    <p className="caption" style={{ fontSize: '0.75rem', lineHeight: 1.5, margin: 0 }}>{s.eligibility}</p>
                  )),
                },
                {
                  label: 'Deadline',
                  cells: scholars.map(s => <span style={{ fontWeight: 700 }}>{s.deadline}</span>),
                },
              ]}
            />
          )}

          {/* Dynamic verdict */}
          <div className="card">
            <div className="eyebrow"><span className="dot" />Comparison verdict</div>
            <div className="stack" style={{ marginTop: '0.75rem', gap: '0.75rem' }}>
              {careers.length > 1 && (() => {
                const top = [...careers].sort((a, b) => b.match - a.match)[0];
                const highestSalary = [...careers].sort((a, b) => b.salary - a.salary)[0];
                const growthLeader = [...careers].sort((a, b) => parseFloat(b.growth) - parseFloat(a.growth))[0];
                const scarceCount = careers.filter(c => c.scarce_skill).length;
                return (
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                    <strong>Careers:</strong>{' '}
                    <strong>{top.name}</strong> has your highest match score ({top.match}/100).{' '}
                    {highestSalary.name !== top.name
                      ? <><strong>{highestSalary.name}</strong> leads on salary at {fmtR(highestSalary.salary)}/mo.</>
                      : <><strong>{top.name}</strong> also leads on salary at {fmtR(top.salary)}/mo.</>
                    }{' '}
                    {growthLeader.name !== highestSalary.name
                      ? <><strong>{growthLeader.name}</strong> has the strongest 10-year growth trajectory ({growthLeader.growth}).</>
                      : null
                    }{' '}
                    {scarceCount > 0 && <>{scarceCount} of {careers.length} {scarceCount === 1 ? 'is' : 'are'} a government-designated scarce skill — bursary priority is higher.</>}
                  </div>
                );
              })()}
              {progs.length > 1 && (() => {
                const cheapest = [...progs].sort((a, b) => a.fees - b.fees)[0];
                const bestFit  = [...progs].sort((a, b) => b.fit  - a.fit)[0];
                const totalCosts = progs.map(p => ({ name: p.name, total: p.fees * p.dur }));
                const cheapestTotal = totalCosts.sort((a, b) => a.total - b.total)[0];
                return (
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                    <strong>Programmes:</strong>{' '}
                    <strong>{bestFit.name}</strong> has the highest fit score ({bestFit.fit}/100).{' '}
                    <strong>{cheapest.name}</strong> is the most affordable at {fmtR(cheapest.fees)}/yr
                    {cheapestTotal.name !== cheapest.name
                      ? `, though ${cheapestTotal.name} has the lowest total cost over its full duration (${fmtR(cheapestTotal.total)}).`
                      : ` (${fmtR(cheapestTotal.total)} total over ${progs.find(p => p.name === cheapest.name)?.dur ?? '?'} years).`
                    }
                  </div>
                );
              })()}
              {unis.length > 1 && (() => {
                const topRanked = [...unis].sort((a, b) => a.rank - b.rank)[0];
                const mostAffordable = [...unis].sort((a, b) => a.fees - b.fees)[0];
                const mostOpen = [...unis].sort((a, b) => b.accept - a.accept)[0];
                return (
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                    <strong>Universities:</strong>{' '}
                    <strong>{topRanked.name ?? topRanked.short}</strong> ranks highest nationally (#{topRanked.rank}).{' '}
                    <strong>{mostAffordable.short}</strong> is the most affordable at {fmtR(mostAffordable.fees)}/yr.{' '}
                    <strong>{mostOpen.short}</strong> has the highest acceptance rate ({mostOpen.accept}%).
                  </div>
                );
              })()}
              {scholars.length > 1 && (() => {
                const largest = [...scholars].sort((a, b) => b.amount - a.amount)[0];
                const mostCompetitive = [...scholars].sort((a, b) => a.match - b.match)[0];
                return (
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                    <strong>Scholarships:</strong>{' '}
                    <strong>{largest.name}</strong> offers the highest value ({fmtR(largest.amount)}/yr).{' '}
                    <strong>{mostCompetitive.name}</strong> is the most competitive based on your current profile — focus preparation there first.
                  </div>
                );
              })()}
              <div className="caption" style={{ paddingTop: '0.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                Match and fit scores are composite: academic readiness × capability alignment × market signal.
                Use the Simulator to see how improving a subject mark shifts your position.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
