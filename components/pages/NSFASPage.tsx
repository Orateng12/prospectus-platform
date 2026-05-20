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
  const [programme, setProgramme] = useState('BSc Computer Science');

  const THRESHOLD = Math.min(600_000, 350_000 + Math.max(0, dependants - 1) * 25_000);
  const eligible = income <= THRESHOLD;

  const estimatedAward = (() => {
    if (!eligible) return 0;
    const dependantBonus = Math.min(8_000, Math.max(0, dependants - 1) * 2_500);
    if (residence === 'campus')  return 88_000 + dependantBonus;
    if (residence === 'private') return 74_000 + dependantBonus;
    return 52_000 + dependantBonus;
  })();

  const monthly = estimatedAward > 0 ? Math.round(estimatedAward / 10) : 0;

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
                Threshold: {fmtR(THRESHOLD)} for {dependants} dependant{dependants !== 1 ? 's' : ''} · SASSA recipients qualify regardless
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Number of dependants</label>
              <input
                className="input"
                style={{ marginTop: '0.375rem', width: '100%' }}
                type="number"
                min={0}
                max={10}
                value={dependants}
                onChange={e => setDependants(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Programme</label>
              <input
                className="input"
                style={{ marginTop: '0.375rem', width: '100%' }}
                value={programme}
                onChange={e => setProgramme(e.target.value)}
                placeholder="e.g. BSc Computer Science"
              />
              <div className="caption" style={{ marginTop: '0.375rem' }}>
                NSFAS covers the institution&apos;s registered fee — not all programmes have the same cost
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Residence type</label>
              <div className="nsfas-type-row row" style={{ marginTop: '0.375rem', gap: '0.375rem' }}>
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

          <a
            href="https://my.nsfas.org.za"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ width: '100%', textAlign: 'center', display: 'block' }}
          >
            Open NSFAS application →
          </a>
        </div>
      </div>

      {/* Monthly cashflow */}
      {eligible && monthly > 0 && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="eyebrow"><span className="dot" />Monthly cashflow</div>
          <h3 className="subheading nsfas-monthly-head" style={{ marginTop: '0.25rem' }}>
            {fmtR(monthly)}/month during term (award paid over 10 academic months)
          </h3>
          <div className="grid-3" style={{ gap: '0.625rem', marginTop: '0.875rem' }}>
            {[
              { label: 'Food & meals',         amt: Math.round(monthly * 0.38) },
              { label: 'Transport',             amt: Math.round(monthly * 0.18) },
              { label: 'Books & stationery',    amt: Math.round(monthly * 0.12) },
              { label: 'Data & phone',          amt: Math.round(monthly * 0.09) },
              { label: 'Personal care',         amt: Math.round(monthly * 0.08) },
              { label: 'Emergency / savings',   amt: Math.round(monthly * 0.15) },
            ].map(item => (
              <div key={item.label} style={{
                padding: '0.75rem',
                borderRadius: 8,
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
              }}>
                <div className="caption" style={{ fontSize: '0.75rem' }}>{item.label}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtR(item.amt)}
                </div>
              </div>
            ))}
          </div>
          <div className="caption" style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
            {residence === 'home'
              ? 'Living at home removes the accommodation cost from your budget — this monthly figure is your personal spending money, giving you more flexibility.'
              : 'Accommodation is paid directly to your institution or landlord from the NSFAS disbursement; this breakdown shows what remains for daily living.'}
          </div>
        </div>
      )}

      {/* Application window */}
      <div className="card" style={{ marginTop: '1.25rem', borderColor: 'hsl(var(--primary) / 0.3)', background: 'hsl(var(--primary) / 0.03)' }}>
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>2026 NSFAS application window</div>
            <div className="caption" style={{ marginTop: 2 }}>September 2025 – January 2026 · apply early for priority processing</div>
          </div>
          <a
            href="https://my.nsfas.org.za"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Apply at nsfas.org.za →
          </a>
        </div>
        <div className="stack-2" style={{ marginTop: '0.875rem' }}>
          {[
            { step: '1', title: 'Confirm eligibility', desc: 'Household income under your threshold → open application' },
            { step: '2', title: 'Upload supporting docs', desc: 'ID, parents\' payslips (3 months), SARS notice of assessment, school report' },
            { step: '3', title: 'Track your reference number', desc: 'Log in to myNSFAS portal weekly — funding provisionally approved within 6–8 weeks' },
            { step: '4', title: 'Renew annually', desc: 'NSFAS is renewable each year — requires 50% academic pass rate to continue' },
          ].map(s => (
            <div key={s.step} className="row" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'hsl(var(--fg))', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                {s.step}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.title}</div>
                <div className="caption" style={{ fontSize: '0.75rem', marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '1.25rem' }}>
        {[
          { title: 'NSFAS Bursary', desc: 'For SASSA beneficiaries and students from households earning under R122,000/year. Covers tuition, accommodation, meals, books, transport.', icon: 'N' },
          { title: 'Loan-Bursary', desc: 'For households earning R122,001–R350,000/year. Converts to a full bursary if you pass each year (50% pass rate required). If you fail, the unpaid portion becomes a recoverable loan — understand the repayment conditions before accepting.', icon: 'L' },
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
