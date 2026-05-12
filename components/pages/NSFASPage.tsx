'use client';

import { useState } from 'react';
import { fmtR } from '@/lib/utils';

interface NSFASPageProps {
  householdIncome?: number;
}

export default function NSFASPage({ householdIncome = 220000 }: NSFASPageProps) {
  const [income, setIncome] = useState(householdIncome);
  const [dependants, setDependants] = useState(3);
  const [residence, setResidence] = useState<'campus' | 'private' | 'home'>('campus');

  const THRESHOLD = 350000;
  const eligible = income <= THRESHOLD;

  const estimatedAward = (() => {
    if (!eligible) return 0;
    if (residence === 'campus') return 88000;
    if (residence === 'private') return 74000;
    return 52000;
  })();

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Fund · NSFAS Calculator</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />2026 funding year</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>NSFAS calculator</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Estimate your NSFAS funding based on household income, programme costs and institution. Updated for the 2026 funding year.
            </p>
          </div>
          <span className={`badge ${eligible ? 'success' : 'destructive'}`} style={{ height: '1.75rem', fontSize: '0.8125rem' }}>
            {eligible ? '✓ Likely eligible' : '✗ Above threshold'}
          </span>
        </div>
      </div>

      <div className="grid-2 stack-3">
        <div className="card">
          <div className="eyebrow"><span className="dot" />Your inputs</div>
          <div className="stack-3" style={{ marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Combined household income (annual)</label>
              <div className="row" style={{ marginTop: '0.375rem' }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  type="number"
                  value={income}
                  onChange={e => setIncome(Number(e.target.value))}
                />
              </div>
              <div className="caption" style={{ marginTop: '0.375rem' }}>
                Threshold: {fmtR(THRESHOLD)} · SASSA recipients qualify regardless
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Number of dependants</label>
              <input
                className="input"
                style={{ marginTop: '0.375rem', width: '100%' }}
                type="number"
                min={1}
                max={10}
                value={dependants}
                onChange={e => setDependants(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Programme &amp; institution</label>
              <input className="input" defaultValue="UCT · BSc Computer Science" style={{ marginTop: '0.375rem', width: '100%' }} readOnly />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Residence type</label>
              <div className="row" style={{ marginTop: '0.375rem', gap: '0.375rem' }}>
                {(['campus', 'private', 'home'] as const).map(r => (
                  <button
                    key={r}
                    className={`btn ${residence === r ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => setResidence(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: eligible ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--destructive) / 0.4)' }}>
          <div className="eyebrow"><span className="dot" />Estimated award</div>
          <div style={{
            fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.04em',
            lineHeight: 1, marginTop: '0.5rem',
            color: eligible ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {eligible ? fmtR(estimatedAward) : 'Not eligible'}
          </div>
          {eligible && <div className="caption" style={{ marginTop: '0.25rem' }}>/ year · full cost of attendance</div>}
          {!eligible && (
            <div className="caption" style={{ marginTop: '0.25rem' }}>
              Household income exceeds {fmtR(THRESHOLD)} threshold. Consider merit bursaries.
            </div>
          )}

          <hr className="divider" />

          <div className="stack">
            {[
              { l: 'Tuition', v: eligible ? fmtR(Math.round(estimatedAward * 0.52)) : '—' },
              { l: 'Accommodation', v: eligible ? fmtR(Math.round(estimatedAward * 0.31)) : '—' },
              { l: 'Book allowance', v: eligible ? fmtR(Math.round(estimatedAward * 0.1)) : '—' },
              { l: 'Transport', v: eligible ? fmtR(Math.round(estimatedAward * 0.07)) : '—' },
            ].map(row => (
              <div key={row.l} className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span className="caption">{row.l}</span>
                <span style={{ fontWeight: 700 }}>{row.v}</span>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Open NSFAS application →
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '1.25rem' }}>
        {[
          { title: 'NSFAS Bursary', desc: 'For SASSA beneficiaries and students from households earning under R122,000/year. Covers tuition, accommodation, meals, books, transport.', icon: 'N' },
          { title: 'Loan-Bursary', desc: 'For students from households earning R122,001–R350,000/year. Convertible to bursary if you pass. Balance may be partially recoverable.', icon: 'L' },
          { title: 'DHET Bursary', desc: 'For students at TVET colleges. Covers registration, tuition and accommodation up to the DHET cap per year.', icon: 'D' },
        ].map(c => (
          <div key={c.title} className="card">
            <div className="row" style={{ gap: '0.625rem', marginBottom: '0.625rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'hsl(var(--fg))', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ fontWeight: 700 }}>{c.title}</div>
            </div>
            <p className="caption" style={{ fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
