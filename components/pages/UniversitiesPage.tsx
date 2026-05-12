'use client';

import { useState, useMemo } from 'react';
import { UNIS, PROGRAMMES } from '@/lib/data';
import { calcAPS } from '@/lib/utils';
import type { Subject, Route, CompareItem } from '@/lib/types';
import { fmtR } from '@/lib/utils';

type Tab = 'all' | 'eligible' | 'tier1' | 'tvet' | 'private';

interface UniversitiesPageProps {
  subjects: Subject[];
  navigate: (r: Route) => void;
  compareItems: CompareItem[];
  onToggleCompare: (item: CompareItem) => void;
}

export default function UniversitiesPage({ subjects, navigate, compareItems, onToggleCompare }: UniversitiesPageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const aps = calcAPS(subjects);

  const displayed = useMemo(() => {
    if (tab === 'tier1') return UNIS.filter(u => u.acpt === 'Tier 1');
    if (tab === 'tvet') return UNIS.filter(u => u.acpt === 'Tier 2');
    return UNIS;
  }, [tab]);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Universities</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />26 SA institutions</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Universities &amp; institutions</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Every accredited South African public university, plus selected private and TVET institutions — ranked by your eligibility, capability fit and funding likelihood.
            </p>
          </div>
          <div className="row">
            <button className="btn btn-outline" onClick={() => navigate('map')}>Map view</button>
            <button className="btn btn-primary" onClick={() => navigate('compare')}>Compare selected</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        {([['all', `All (${UNIS.length})`], ['eligible', 'Eligible'], ['tier1', 'Tier 1'], ['tvet', 'Tier 2 / UoT'], ['private', 'Private']] as const).map(([t, label]) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      <div className="grid-3">
        {displayed.map(u => {
          const inCompare = compareItems.some(c => c.id === u.short);
          return (
            <div className="card interactive" key={u.short} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="row-between">
                <div className="row" style={{ gap: '0.625rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'hsl(var(--fg))', color: 'white',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 800, fontSize: '0.8125rem', flexShrink: 0,
                  }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
                <div>
                  <div className="caption" style={{ fontSize: '0.6875rem' }}>Programmes</div>
                  <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums' }}>{u.progs}</div>
                </div>
                <div>
                  <div className="caption" style={{ fontSize: '0.6875rem' }}>Accept rate</div>
                  <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums' }}>{u.accept}%</div>
                </div>
                <div>
                  <div className="caption" style={{ fontSize: '0.6875rem' }}>Avg fees</div>
                  <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(u.fees)}</div>
                </div>
              </div>

              <div className="row" style={{ gap: '0.375rem' }}>
                <span className="badge success">Eligible</span>
                <span className={`badge ${u.acpt === 'Tier 1' ? 'brand' : 'info'}`}>{u.acpt}</span>
              </div>

              <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                  onClick={() => onToggleCompare({ id: u.short, kind: 'uni', name: u.name })}>
                  {inCompare ? 'Remove' : 'Compare'}
                </button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                  onClick={() => navigate('programmes')}>
                  Browse →
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
