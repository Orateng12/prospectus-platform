'use client';

import { useState, useMemo } from 'react';
import { UNIS, PROGRAMMES, PROVINCES } from '@/lib/data';
import { calcAPS, fmtR, uniToneClass } from '@/lib/utils';
import type { Subject, Route, CompareItem } from '@/lib/types';

type Tab = 'all' | 'eligible' | 'tier1' | 'comprehensive' | 'uot' | 'tvet' | 'private' | 'distance';
type ViewMode = 'list' | 'map';

// Maps full province names (from user_profiles) to PROVINCES ids
const PROVINCE_NAME_TO_ID: Record<string, string> = {
  'Limpopo': 'lp',
  'Gauteng': 'gp',
  'Mpumalanga': 'mp',
  'KwaZulu-Natal': 'kzn',
  'Free State': 'fs',
  'Eastern Cape': 'ec',
  'Western Cape': 'wc',
  'Northern Cape': 'nc',
  'North West': 'nw',
};

interface UniversitiesPageProps {
  subjects: Subject[];
  navigate: (r: Route) => void;
  compareItems: CompareItem[];
  onToggleCompare: (item: CompareItem) => void;
  userProvince?: string;
}

export default function UniversitiesPage({ subjects, navigate, compareItems, onToggleCompare, userProvince }: UniversitiesPageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [view, setView] = useState<ViewMode>('list');
  const [visibleCount, setVisibleCount] = useState(9);
  const aps = calcAPS(subjects);
  const homeProvinceId = userProvince ? (PROVINCE_NAME_TO_ID[userProvince] ?? null) : null;

  const eligibleUniShorts = useMemo(() => {
    return new Set(
      PROGRAMMES.filter(p => p.aps <= aps).map(p => {
        const match = UNIS.find(u => u.name === p.uni);
        return match?.short;
      }).filter(Boolean)
    );
  }, [aps]);

  // Per-university count of eligible programmes
  const eligibleProgsByUni = useMemo(() => {
    return PROGRAMMES.filter(p => p.aps <= aps).reduce<Record<string, number>>((acc, p) => {
      const uni = UNIS.find(u => u.name === p.uni);
      if (uni) acc[uni.short] = (acc[uni.short] ?? 0) + 1;
      return acc;
    }, {});
  }, [aps]);

  // Universities the student is within 6 APS points of qualifying at
  const nearlyEligible = useMemo(() => {
    return UNIS
      .filter(u => !eligibleUniShorts.has(u.short))
      .map(u => {
        const uProgs = PROGRAMMES.filter(p => p.uni === u.name);
        if (uProgs.length === 0) return null;
        const minAps = Math.min(...uProgs.map(p => p.aps));
        const gap = minAps - aps;
        return gap > 0 && gap <= 6 ? { ...u, gap, minAps } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.gap - b!.gap)
      .slice(0, 3) as Array<typeof UNIS[number] & { gap: number; minAps: number }>;
  }, [aps, eligibleUniShorts]);

  const displayed = useMemo(() => {
    if (tab === 'eligible')      return UNIS.filter(u => eligibleUniShorts.has(u.short));
    if (tab === 'tier1')         return UNIS.filter(u => u.acpt === 'Tier 1');
    if (tab === 'comprehensive') return UNIS.filter(u => u.acpt === 'Comprehensive');
    if (tab === 'uot')           return UNIS.filter(u => u.acpt === 'UoT');
    if (tab === 'tvet')          return UNIS.filter(u => u.acpt === 'TVET');
    if (tab === 'private')       return UNIS.filter(u => u.acpt === 'Private');
    if (tab === 'distance')      return UNIS.filter(u => u.acpt === 'Distance');
    return UNIS;
  }, [tab, eligibleUniShorts]);

  const totalProgs = PROVINCES.reduce((s, p) => s + p.n, 0);
  const sortedByN   = [...PROVINCES].sort((a, b) => b.n - a.n);
  const sortedByFee = [...PROVINCES].sort((a, b) => b.fees - a.fees);
  const homeUniCount = homeProvinceId
    ? UNIS.filter(u => (PROVINCE_NAME_TO_ID[u.province] ?? null) === homeProvinceId).length
    : 0;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Universities</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />{UNIS.length} SA institutions</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Universities &amp; institutions</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Every accredited South African public university, plus selected private and TVET institutions — ranked by your eligibility, capability fit and funding likelihood.
            </p>
          </div>
          <div className="row">
            <button
              className={`btn ${view === 'map' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView(v => v === 'map' ? 'list' : 'map')}
              title={view === 'map' ? 'Switch to list view' : 'Switch to map view'}
            >
              {view === 'map' ? 'List view' : 'Map view'}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('compare')}>Compare selected</button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        // ── Map view (inlined MapPage content) ─────────────────────────────
        <div className="page-anim">
          <div className="grid-2-asym">
            {/* Map */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div className="eyebrow"><span className="dot" />South Africa</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.125rem' }}>
                    {PROVINCES.length} provinces · {totalProgs} programmes
                  </div>
                </div>
                <div className="row" style={{ gap: '0.375rem' }}>
                  <span className="badge">{totalProgs} eligible</span>
                  {homeUniCount > 0 && <span className="badge success">{homeUniCount} home</span>}
                </div>
              </div>

              <div style={{ background: 'hsl(var(--muted) / 0.4)', padding: '1.5rem', minHeight: 540 }}>
                <svg viewBox="0 0 800 600" style={{ width: '100%', maxHeight: 540 }} aria-label="South Africa opportunity map">
                  <path
                    d="M120,440 Q140,470 200,485 Q280,500 380,510 Q480,505 560,475 Q650,440 720,400 Q740,350 730,290 Q700,250 660,235 Q640,180 620,140 Q580,90 530,80 Q480,75 430,90 Q380,95 350,80 Q300,70 250,90 Q190,120 150,180 Q120,240 100,310 Q105,390 120,440 Z"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                  />
                  {PROVINCES.map(p => {
                    const r = 16 + Math.sqrt(p.n) * 4;
                    return (
                      <g key={p.id} style={{ cursor: 'pointer' }}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r}
                          className="za-bubble"
                          style={(homeProvinceId ? p.id === homeProvinceId : p.you) ? { fill: 'hsl(var(--accent))' } : undefined}
                        />
                        <text x={p.x} y={p.y - 4} className="za-label">{p.n}</text>
                        <text
                          x={p.x}
                          y={p.y + 8}
                          className="za-label"
                          style={{ fontSize: 9, fontWeight: 600, opacity: 0.85 }}
                        >
                          {p.id.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                  <g transform="translate(560, 120)">
                    <circle
                      r={44}
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      opacity={0.5}
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Side panels */}
            <div className="stack-3">
              <div className="card">
                <div className="eyebrow"><span className="dot" />Distribution by province</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>{totalProgs} eligible programmes</h3>
                <div className="stack" style={{ marginTop: '0.875rem' }}>
                  {sortedByN.map(p => (
                    <div
                      key={p.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '110px 1fr 32px',
                        gap: '0.625rem',
                        alignItems: 'center',
                        padding: '0.4375rem 0',
                        borderBottom: '1px solid hsl(var(--border))',
                      }}
                      className="province-row"
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {p.name}
                        {(homeProvinceId ? p.id === homeProvinceId : p.you) && (
                          <span className="badge success" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.3125rem', marginLeft: '0.25rem' }}>
                            Home
                          </span>
                        )}
                      </div>
                      <div className={`meter ${(homeProvinceId ? p.id === homeProvinceId : p.you) ? 'accent' : p.n >= 15 ? 'success' : 'primary'}`}>
                        <i style={{ width: `${(p.n / 21) * 100}%` }} />
                      </div>
                      <div style={{ fontWeight: 800, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>
                        {p.n}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="eyebrow"><span className="dot" />Cost vs. catalog</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Median fees by province</h3>
                <div className="stack" style={{ marginTop: '0.625rem' }}>
                  {sortedByFee.slice(0, 5).map(p => (
                    <div
                      key={p.id}
                      className="row-between"
                      style={{ fontSize: '0.8125rem', padding: '0.4375rem 0', borderBottom: '1px solid hsl(var(--border))' }}
                    >
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtR(p.fees)}<span className="caption" style={{ fontWeight: 600 }}> /yr</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Province spotlight cards */}
          <div className="grid-3" style={{ marginTop: '1.25rem' }}>
            {PROVINCES.filter(p => ['gp', 'wc', 'kzn'].includes(p.id)).map(p => (
              <div className="card" key={p.id}>
                <div className="eyebrow"><span className="dot" />{p.name}</div>
                <div className="row-between" style={{ marginTop: '0.375rem' }}>
                  <h3 className="subheading">{p.n} programmes</h3>
                  <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtR(p.fees)}<span className="caption" style={{ fontWeight: 600 }}>/yr</span>
                  </div>
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem', marginTop: '0.625rem' }}>{p.intel}</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '0.875rem' }} onClick={() => navigate('programmes')}>
                  Browse programmes →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── List view ──────────────────────────────────────────────────────
        <>
          {nearlyEligible.length > 0 && (
            <div className="card" style={{ marginBottom: '1.25rem', borderColor: 'hsl(var(--warning) / 0.4)', background: 'hsl(var(--warning) / 0.03)' }}>
              <div className="eyebrow" style={{ marginBottom: '0.625rem' }}><span className="dot" />Almost there — within reach</div>
              <div className="grid-3" style={{ gap: '0.75rem' }}>
                {nearlyEligible.map(u => (
                  <div key={u.short} className="card compact" style={{ background: 'transparent' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{u.name}</div>
                    <div className="caption" style={{ marginTop: 2 }}>Minimum APS: {u.minAps}</div>
                    <div className="row" style={{ marginTop: '0.5rem', gap: '0.375rem' }}>
                      <span className="badge warning">+{u.gap} APS needed</span>
                      <span className="badge">{u.acpt}</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.6875rem' }}
                      onClick={() => navigate('simulator')}
                    >
                      Simulate mark increase →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tabs">
            {([
              ['all',           `All (${UNIS.length})`],
              ['eligible',      `Eligible (${UNIS.filter(u => eligibleUniShorts.has(u.short)).length})`],
              ['tier1',         `Tier 1 (${UNIS.filter(u => u.acpt === 'Tier 1').length})`],
              ['comprehensive', `Comprehensive (${UNIS.filter(u => u.acpt === 'Comprehensive').length})`],
              ['uot',           `UoTs (${UNIS.filter(u => u.acpt === 'UoT').length})`],
              ['tvet',          `TVET (${UNIS.filter(u => u.acpt === 'TVET').length})`],
              ['private',       `Private (${UNIS.filter(u => u.acpt === 'Private').length})`],
              ['distance',      `Distance (${UNIS.filter(u => u.acpt === 'Distance').length})`],
            ] as [Tab, string][]).map(([t, label]) => (
              <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => { setTab(t as Tab); setVisibleCount(9); }}>{label}</button>
            ))}
          </div>

          <div className="grid-3">
            {displayed.slice(0, visibleCount).map(u => {
              const inCompare = compareItems.some(c => c.id === u.short);
              const eligCount  = eligibleProgsByUni[u.short] ?? 0;
              const isEligible = eligCount > 0;
              return (
                <div className="card interactive" key={u.short} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="row-between">
                    <div className="row" style={{ gap: '0.625rem' }}>
                      <div className={`img-tile sm ${uniToneClass(u.short)}`} aria-hidden="true" style={{ flexShrink: 0, fontWeight: 800, fontSize: '0.8125rem' }}>
                        {u.short}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>{u.name}</div>
                        <div className="caption">{u.city} · {u.province}</div>
                      </div>
                    </div>
                    <span className={`badge ${u.tag}`}>#{u.rank} ZA</span>
                  </div>

                  <hr className="divider" style={{ margin: 0 }} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                    <div>
                      <div className="caption" style={{ fontSize: '0.6875rem' }}>Total progs</div>
                      <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums' }}>{u.progs}</div>
                    </div>
                    <div>
                      <div className="caption" style={{ fontSize: '0.6875rem' }}>Eligible</div>
                      <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums', color: isEligible ? 'hsl(var(--success))' : 'hsl(var(--muted-fg))' }}>
                        {eligCount}
                      </div>
                    </div>
                    <div>
                      <div className="caption" style={{ fontSize: '0.6875rem' }}>Avg fees</div>
                      <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(u.fees)}</div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: '0.375rem' }}>
                    {isEligible
                      ? <span className="badge success">{eligCount} eligible</span>
                      : <span className="badge accent">APS needed</span>
                    }
                    <span className={`badge ${u.acpt === 'Tier 1' ? 'brand' : 'info'}`}>{u.acpt}</span>
                  </div>

                  <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                      onClick={() => onToggleCompare({ id: u.short, kind: 'uni', name: u.name })}>
                      {inCompare ? 'Remove' : 'Compare'}
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                      onClick={() => navigate('programmes')}>
                      Programmes →
                    </button>
                    {u.website && (
                      <a
                        href={u.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Open official website"
                        style={{ flexShrink: 0, padding: '0 0.5rem' }}
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {visibleCount < displayed.length && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => setVisibleCount(v => Math.min(v + 9, displayed.length))}
              >
                Show {Math.min(9, displayed.length - visibleCount)} more institutions
              </button>
              <div className="caption" style={{ marginTop: '0.5rem', color: 'hsl(var(--muted-fg))' }}>
                Showing {Math.min(visibleCount, displayed.length)} of {displayed.length}
              </div>
            </div>
          )}

          <div className="card stack-3" style={{ marginTop: '1.25rem' }}>
            <div className="row-between">
              <div>
                <div className="eyebrow"><span className="dot" />Your APS · {aps}</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>How your APS maps to acceptance rates</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('simulator')}>Simulator →</button>
            </div>
            <p className="body-text" style={{ margin: 0, fontSize: '0.875rem' }}>
              With an APS of <strong>{aps}</strong>, you sit within the direct-entry range at{' '}
              <strong>{PROGRAMMES.filter(p => p.aps <= aps).length} of {PROGRAMMES.length}</strong> shortlisted programmes across these institutions.
              Tier 1 institutions (UCT, Wits, SUN, UP, UKZN) require APS 36–48 depending on faculty.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
