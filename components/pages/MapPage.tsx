'use client';

import { useMemo, useState } from 'react';
import { PROVINCES, UNIS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { Programme, Route } from '@/lib/types';

const PROVINCE_NAME_TO_ID: Record<string, string> = {
  'Gauteng':       'gp',
  'Western Cape':  'wc',
  'KwaZulu-Natal': 'kzn',
  'Eastern Cape':  'ec',
  'Limpopo':       'lp',
  'Mpumalanga':    'mp',
  'North West':    'nw',
  'Northern Cape': 'nc',
  'Free State':    'fs',
};

interface MapPageProps {
  navigate?: (r: Route) => void;
  userProvince?: string;
  programmes?: Programme[];
}

export default function MapPage({ navigate, userProvince, programmes }: MapPageProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Build live province counts and avg fees from DB programmes when available
  const liveProvinces = useMemo(() => {
    if (!programmes || programmes.length === 0) return null;
    const uniToProvId: Record<string, string> = {};
    UNIS.forEach(u => {
      const provId = PROVINCE_NAME_TO_ID[u.province];
      if (provId) uniToProvId[u.name] = provId;
    });
    const counts: Record<string, number> = {};
    const feesSum: Record<string, number> = {};
    const feesCnt: Record<string, number> = {};
    programmes.forEach(p => {
      const id = uniToProvId[p.uni];
      if (!id) return;
      counts[id] = (counts[id] ?? 0) + 1;
      if (p.fees) { feesSum[id] = (feesSum[id] ?? 0) + p.fees; feesCnt[id] = (feesCnt[id] ?? 0) + 1; }
    });
    return PROVINCES.map(p => ({
      ...p,
      n: counts[p.id] ?? p.n,
      fees: feesCnt[p.id] ? Math.round(feesSum[p.id] / feesCnt[p.id]) : p.fees,
    }));
  }, [programmes]);

  const provinces = liveProvinces ?? PROVINCES;
  const totalProgs = provinces.reduce((s, p) => s + p.n, 0);
  const sortedByN   = [...provinces].sort((a, b) => b.n - a.n);
  const sortedByFee = [...provinces].sort((a, b) => b.fees - a.fees);

  const homeId = userProvince ? (PROVINCE_NAME_TO_ID[userProvince] ?? null) : null;
  const homeProv = homeId ? provinces.find(p => p.id === homeId) : provinces.find(p => p.you);
  const spotlightIds = homeId && !['gp', 'wc', 'kzn'].includes(homeId)
    ? [homeId, 'gp', 'wc']
    : ['gp', 'wc', 'kzn'];
  const spotlightProvs = spotlightIds.map(id => provinces.find(p => p.id === id)).filter(Boolean) as typeof PROVINCES;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · Opportunity Map</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Geography of options</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Opportunity map</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {totalProgs} eligible programmes across all 9 provinces. Bubble size scales with programme
              density; hover or tap any region for the brief.
            </p>
          </div>
          <div className="row">
            {homeProv && <span className="badge success">Home: {homeProv.name}</span>}
            {liveProvinces
              ? <span className="badge success">Live · {totalProgs} programmes</span>
              : <span className="badge">Estimates</span>}
            <button className="btn btn-outline btn-sm" onClick={() => navigate?.('unis')}>View universities →</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate?.('programmes')}>Browse programmes →</button>
          </div>
        </div>
      </div>

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
                {provinces.length} provinces · {totalProgs} programmes
              </div>
            </div>
            <div className="row" style={{ gap: '0.375rem' }}>
              <span className="badge">{totalProgs} eligible</span>
              <span className="badge success">1 home</span>
            </div>
          </div>

          <div style={{ background: 'hsl(var(--muted) / 0.4)', padding: '1.5rem', minHeight: 540 }}>
            <svg viewBox="0 0 800 600" style={{ width: '100%', maxHeight: 540 }} aria-label="South Africa opportunity map">
              {/* Country outline */}
              <path
                d="M120,440 Q140,470 200,485 Q280,500 380,510 Q480,505 560,475 Q650,440 720,400 Q740,350 730,290 Q700,250 660,235 Q640,180 620,140 Q580,90 530,80 Q480,75 430,90 Q380,95 350,80 Q300,70 250,90 Q190,120 150,180 Q120,240 100,310 Q105,390 120,440 Z"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={2}
              />

              {/* Province bubbles */}
              {provinces.map(p => {
                const r = 16 + Math.sqrt(p.n) * 4;
                const isSelected = selectedProvince === p.id;
                return (
                  <g
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedProvince(isSelected ? null : p.id)}
                    role="button"
                    aria-label={`${p.name} — ${p.n} programmes`}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r + (isSelected ? 4 : 0)}
                      className="za-bubble"
                      style={{
                        fill: isSelected ? 'hsl(var(--primary))' : (homeId ? p.id === homeId : p.you) ? 'hsl(var(--accent))' : undefined,
                        stroke: isSelected ? 'hsl(var(--primary))' : undefined,
                        strokeWidth: isSelected ? 3 : undefined,
                        transition: 'r 0.15s, fill 0.15s',
                      }}
                    />
                    <text x={p.x} y={p.y - 4} className="za-label" style={{ fill: isSelected ? 'white' : undefined }}>{p.n}</text>
                    <text
                      x={p.x}
                      y={p.y + 8}
                      className="za-label"
                      style={{ fontSize: 9, fontWeight: 600, opacity: 0.85, fill: isSelected ? 'white' : undefined }}
                    >
                      {p.id.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {homeProv && (
                <g transform={`translate(${(homeProv as any).x}, ${(homeProv as any).y})`}>
                  <circle r={44} fill="none" stroke="hsl(var(--accent))" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.5} />
                </g>
              )}
            </svg>
          </div>
          {selectedProvince && (() => {
            const p = provinces.find(x => x.id === selectedProvince);
            if (!p) return null;
            return (
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)' }}>
                <div className="row-between">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{p.name}</div>
                    <div className="caption" style={{ marginTop: '0.125rem' }}>{p.n} programmes · Avg {fmtR(p.fees)}/yr</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedProvince(null)}>✕</button>
                </div>
                <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.8125rem', lineHeight: 1.55 }}>{p.intel}</p>
              </div>
            );
          })()}
        </div>

        {/* Side panels */}
        <div className="stack-3">
          {/* Distribution */}
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
                    {(homeId ? p.id === homeId : p.you) && (
                      <span className="badge success" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.3125rem', marginLeft: '0.25rem' }}>
                        Home
                      </span>
                    )}
                  </div>
                  <div className={`meter ${p.you ? 'accent' : p.n >= 15 ? 'success' : 'primary'}`}>
                    <i style={{ width: `${(p.n / (sortedByN[0]?.n || 1)) * 100}%` }} />
                  </div>
                  <div style={{ fontWeight: 800, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>
                    {p.n}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost vs catalog */}
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
        {spotlightProvs.map(p => (
          <div className="card" key={p.id} style={(homeId ? p.id === homeId : p.you) ? { borderColor: 'hsl(var(--accent) / 0.5)' } : undefined}>
            <div className="eyebrow"><span className="dot" />{p.name}{(homeId ? p.id === homeId : p.you) && <span className="badge success" style={{ marginLeft: '0.5rem', fontSize: '0.5625rem', height: '1.125rem' }}>Your province</span>}</div>
            <div className="row-between" style={{ marginTop: '0.375rem' }}>
              <h3 className="subheading">{p.n} programmes</h3>
              <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {fmtR(p.fees)}<span className="caption" style={{ fontWeight: 600 }}>/yr</span>
              </div>
            </div>
            <p className="body-text" style={{ fontSize: '0.8125rem', marginTop: '0.625rem' }}>{p.intel}</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '0.875rem' }} onClick={() => navigate?.('programmes')}>
              Browse programmes →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
