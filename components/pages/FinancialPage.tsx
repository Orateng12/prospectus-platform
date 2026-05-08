'use client';

import { useState } from 'react';
import type { Subject } from '@/lib/types';
import { calcAPS, fmtR } from '@/lib/utils';

interface FinancialPageProps {
  subjects: Subject[];
  householdIncome?: number;
}

// NSFAS threshold: R350k/year combined household income
const NSFAS_THRESHOLD = 350_000;
const NSFAS_ANNUAL = 87_000;       // NSFAS living + tuition allowance approx
const DHET_BURSARY  = 45_000;      // DHET bursary for qualifying students

const BURSARY_SOURCES = [
  { name: 'NSFAS',                  type: 'Government', maxAmt: 87_000,  incomeReq: 350_000, apsReq: 0,  desc: 'National Student Financial Aid Scheme. Covers fees, accommodation, meals, transport and books for qualifying students.' },
  { name: 'Funza Lushaka',          type: 'Government', maxAmt: 95_000,  incomeReq: 600_000, apsReq: 28, desc: 'Full bursary for education students committing to teach in public schools. Covers all study costs.' },
  { name: 'SETA Sector Bursaries',  type: 'Sectoral',   maxAmt: 60_000,  incomeReq: 500_000, apsReq: 24, desc: 'Sector Education and Training Authority bursaries for scarce skills. Engineering, ICT, Finance & more.' },
  { name: 'Allan Gray Orbis',       type: 'Merit',      maxAmt: 280_000, incomeReq: null,    apsReq: 38, desc: 'Full scholarship + mentorship for entrepreneurially-minded students. Extremely competitive — 3% acceptance rate.' },
  { name: 'ABSA Bank Bursary',      type: 'Corporate',  maxAmt: 55_000,  incomeReq: 400_000, apsReq: 30, desc: 'Covers tuition and books for Commerce, Finance, IT and Engineering students.' },
  { name: 'Sasol Bursary',          type: 'Corporate',  maxAmt: 80_000,  incomeReq: 350_000, apsReq: 32, desc: 'Full bursary for Engineering, Science, and Finance students. Includes guaranteed vacation work.' },
  { name: 'Standard Bank Bursary',  type: 'Corporate',  maxAmt: 65_000,  incomeReq: 350_000, apsReq: 30, desc: 'For Commerce, IT, Actuarial Science, and Engineering students. Mentorship + work-back agreement.' },
  { name: 'Old Mutual Foundation',  type: 'Corporate',  maxAmt: 50_000,  incomeReq: 300_000, apsReq: 28, desc: 'Finance, Actuarial Science, IT and Business Management. Strong preference for financial need.' },
  { name: 'Ikusasa Student Fund',   type: 'Government', maxAmt: 75_000,  incomeReq: 600_000, apsReq: 0,  desc: 'Bridges the funding gap for "missing middle" students — those who earn too much for NSFAS but too little to self-fund.' },
  { name: 'NLDTF Arts Bursary',     type: 'Sectoral',   maxAmt: 40_000,  incomeReq: 300_000, apsReq: 20, desc: 'National Lottery Development Trust Fund. Supports arts, culture, heritage and creative discipline students.' },
];

const TYPE_COLORS: Record<string, string> = {
  Government: 'var(--fg)',
  Sectoral:   'var(--primary)',
  Merit:      'var(--accent)',
  Corporate:  'var(--success)',
};

const LOAN_OPTIONS = [
  { name: 'NSFAS Loan (legacy)',     rate: '0%',   note: 'Income-contingent repayment once earning > R30k/month' },
  { name: 'Fundi Student Loan',      rate: 'Prime+2%', note: 'Up to R150k/yr. Flexible repayment. No guarantor required.' },
  { name: 'Standard Bank StudyLoan', rate: 'Prime+1%', note: 'Repayments start 6 months after graduation. Up to R200k.' },
  { name: 'FNB Student Loan',        rate: 'Prime+1.5%', note: 'Linked to FNB account. Up to R100k/yr. Parent as co-signatory.' },
];

export default function FinancialPage({ subjects, householdIncome }: FinancialPageProps) {
  const aps = calcAPS(subjects);
  const [income, setIncome] = useState(householdIncome ?? 180_000);
  const [activeTab, setActiveTab] = useState<'overview' | 'bursaries' | 'loans'>('overview');

  const nsfasEligible = income <= NSFAS_THRESHOLD;
  const missingMiddle = income > NSFAS_THRESHOLD && income <= 600_000;

  const eligibleBursaries = BURSARY_SOURCES.filter(b =>
    (b.incomeReq === null || income <= b.incomeReq) && aps >= b.apsReq
  );
  const totalAvailable = eligibleBursaries.reduce((s, b) => s + b.maxAmt, 0);
  const typicalFees = 65_000; // mid-range programme
  const gap = Math.max(0, typicalFees - (nsfasEligible ? NSFAS_ANNUAL : 0) - (missingMiddle ? 40_000 : 0));
  const coveragePct = Math.min(100, Math.round(((nsfasEligible ? NSFAS_ANNUAL : missingMiddle ? 40_000 : 0) / typicalFees) * 100));

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Fund · Financial Aid</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />All funding sources</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Financial aid</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {eligibleBursaries.length} funding sources match your income and APS.
              Adjust your household income below to see how your eligibility changes across NSFAS,
              bursaries, and loan options.
            </p>
          </div>
          <div className="row">
            <button className="btn btn-outline">Download report</button>
            <button className="btn btn-primary">Start applications</button>
          </div>
        </div>
      </div>

      {/* Income slider */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <div>
            <div className="eyebrow"><span className="dot" />Household income</div>
            <div style={{ fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.025em', marginTop: '0.25rem' }}>
              {fmtR(income)}<span className="caption" style={{ fontWeight: 600 }}>/year combined</span>
            </div>
          </div>
          <div className="row" style={{ gap: '0.625rem' }}>
            {nsfasEligible && <span className="badge success">NSFAS eligible</span>}
            {missingMiddle && <span className="badge warning">Missing middle</span>}
            {income > 600_000 && <span className="badge">Self-funding range</span>}
          </div>
        </div>
        <input
          className="slider"
          type="range"
          min={0}
          max={1_200_000}
          step={5_000}
          value={income}
          onChange={e => setIncome(Number(e.target.value))}
        />
        <div className="row-between" style={{ marginTop: '0.375rem' }}>
          <span className="caption">R 0</span>
          <span className="caption" style={{ color: 'hsl(var(--success))' }}>NSFAS cutoff {fmtR(NSFAS_THRESHOLD)}</span>
          <span className="caption" style={{ color: 'hsl(var(--warning))' }}>Missing middle {fmtR(600_000)}</span>
          <span className="caption">R 1.2M</span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card kpi">
          <div className="lbl">Your APS score</div>
          <div className="val">{aps}</div>
          <div className="hint">Affects merit bursary eligibility</div>
        </div>
        <div className="card kpi" style={nsfasEligible ? { borderColor: 'hsl(var(--success) / 0.4)' } : undefined}>
          <div className="lbl">NSFAS eligible</div>
          <div className="val" style={{ color: `hsl(var(--${nsfasEligible ? 'success' : 'muted-fg'}))`, fontSize: '1.5rem' }}>
            {nsfasEligible ? 'Yes' : 'No'}
          </div>
          <div className="hint">Income threshold {fmtR(NSFAS_THRESHOLD)}</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Matching bursaries</div>
          <div className="val">{eligibleBursaries.length}</div>
          <div className="hint">Of {BURSARY_SOURCES.length} sources checked</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Max available aid</div>
          <div className="val" style={{ fontSize: '1.375rem' }}>{fmtR(Math.min(totalAvailable, 280_000))}</div>
          <div className="hint">Across all matching sources</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab ${activeTab === 'overview'  ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'bursaries' ? 'active' : ''}`} onClick={() => setActiveTab('bursaries')}>
          Bursaries &amp; grants ({eligibleBursaries.length} eligible)
        </button>
        <button className={`tab ${activeTab === 'loans'     ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Student loans</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <div className="eyebrow"><span className="dot" />Funding coverage estimate</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
              {typicalFees ? `${coveragePct}% covered` : 'Enter programme fees'}
            </h3>
            <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
              Based on a typical mid-range programme ({fmtR(typicalFees)}/yr) at your current income level.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <div className="fund-bar" style={{ marginBottom: '0.875rem' }}>
                {nsfasEligible && (
                  <div className="fund-seg nsfas" style={{ width: `${(NSFAS_ANNUAL / typicalFees) * 100}%` }}>
                    NSFAS
                  </div>
                )}
                {missingMiddle && (
                  <div className="fund-seg bursary" style={{ width: `${(DHET_BURSARY / typicalFees) * 100}%` }}>
                    Ikusasa
                  </div>
                )}
                <div className="fund-seg fund-gap-seg" style={{ flex: 1 }}>
                  {gap > 0 ? `Gap ${fmtR(gap)}` : ''}
                </div>
              </div>
              {[
                nsfasEligible && { label: 'NSFAS allowances', amt: NSFAS_ANNUAL, cls: 'nsfas' },
                missingMiddle && { label: 'Ikusasa / missing-middle fund', amt: DHET_BURSARY, cls: 'bursary' },
                gap > 0 && { label: 'Uncovered gap', amt: gap, cls: 'fund-gap-seg' },
              ].filter((x): x is { label: string; amt: number; cls: string } => Boolean(x)).map((s, i) => (
                <div key={i} className="fund-source">
                  <div className={`fund-icon ${s.cls === 'fund-gap-seg' ? '' : s.cls}`}
                    style={s.cls === 'fund-gap-seg' ? { background: 'hsl(var(--destructive))', color: 'white' } : undefined}
                  >
                    {s.cls === 'nsfas' ? 'N' : s.cls === 'bursary' ? 'I' : '!'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</div>
                    <div className="caption">Per academic year</div>
                  </div>
                  <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmtR(s.amt)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="eyebrow"><span className="dot" />Top matches for you</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Best {Math.min(5, eligibleBursaries.length)} bursaries</h3>
            <div className="stack" style={{ marginTop: '0.875rem' }}>
              {eligibleBursaries.slice(0, 5).map(b => (
                <div key={b.name} className="scholar-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.name}</div>
                    <div className="caption" style={{ marginTop: '0.125rem' }}>
                      {b.type} · APS {b.apsReq > 0 ? `≥ ${b.apsReq}` : 'any'}
                      {b.incomeReq ? ` · income ≤ ${fmtR(b.incomeReq)}` : ' · no income limit'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>
                    {fmtR(b.maxAmt)}
                  </div>
                  <div className={`match-circle ${b.maxAmt >= 80_000 ? '' : 'med'}`}>
                    {b.apsReq <= aps && b.apsReq > 0 ? '✓' : 'A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bursaries' && (
        <div className="stack">
          {BURSARY_SOURCES.map(b => {
            const eligible = (b.incomeReq === null || income <= b.incomeReq) && aps >= b.apsReq;
            return (
              <div
                key={b.name}
                className="card compact"
                style={eligible ? { borderColor: 'hsl(var(--success) / 0.3)' } : { opacity: 0.65 }}
              >
                <div className="row-between">
                  <div className="row" style={{ gap: '0.625rem' }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 999, flexShrink: 0,
                      background: `hsl(${TYPE_COLORS[b.type]})`,
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.name}</div>
                      <div className="caption" style={{ marginTop: '0.125rem' }}>
                        {b.type} · Max {fmtR(b.maxAmt)}/yr
                        {b.apsReq > 0 ? ` · APS ≥ ${b.apsReq}` : ''}
                        {b.incomeReq ? ` · income ≤ ${fmtR(b.incomeReq)}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: '0.5rem' }}>
                    {eligible
                      ? <span className="badge success">You qualify</span>
                      : <span className="badge">
                          {aps < b.apsReq ? `Need APS ${b.apsReq}` : `Income too high`}
                        </span>
                    }
                    <button className="btn btn-outline btn-sm">Apply →</button>
                  </div>
                </div>
                <p className="body-text" style={{ margin: '0.625rem 0 0', fontSize: '0.8125rem' }}>{b.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="stack-3">
          <div className="card">
            <div className="eyebrow"><span className="dot" />Important</div>
            <p className="body-text" style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem' }}>
              Exhaust all bursary and grant options first — loans must be repaid with interest.
              Use loans only to cover the gap after applying all eligible grants.
            </p>
          </div>
          {LOAN_OPTIONS.map(l => (
            <div key={l.name} className="card compact">
              <div className="row-between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{l.name}</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{l.note}</div>
                </div>
                <div className="row" style={{ gap: '0.5rem', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{l.rate}</span>
                  <span className="caption">interest</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                View details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
