'use client';

import { useState } from 'react';
import { fmtR } from '@/lib/utils';
import type { Programme } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';

interface NSFASPageProps {
  householdIncome?: number;
  programmes?: Programme[];
  userAps?: number;
}

export default function NSFASPage({ householdIncome = 220000, programmes, userAps }: NSFASPageProps) {
  const [income, setIncome] = useState(householdIncome);
  const [dependants, setDependants] = useState(3);
  const [residence, setResidence] = useState<'campus' | 'private' | 'home'>('campus');

  // Build eligible programme list for the selector
  const allProgs = (programmes && programmes.length > 0 ? programmes : PROGRAMMES);
  const eligibleProgs = userAps
    ? [...allProgs].filter(p => p.aps <= userAps).sort((a, b) => b.fit - a.fit).slice(0, 8)
    : allProgs.slice(0, 8);
  const [selectedProgId, setSelectedProgId] = useState(() => eligibleProgs[0]?.id ?? '');

  const THRESHOLD = Math.min(600_000, 350_000 + Math.max(0, dependants - 1) * 25_000);
  const eligible = income <= THRESHOLD;

  const estimatedAward = (() => {
    if (!eligible) return 0;
    const dependantBonus = Math.min(8_000, Math.max(0, dependants - 1) * 2_500);
    if (residence === 'campus')  return 88_000 + dependantBonus;
    if (residence === 'private') return 74_000 + dependantBonus;
    return 52_000 + dependantBonus;
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
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Programme &amp; institution</label>
              {eligibleProgs.length > 0 ? (
                <select
                  className="input"
                  style={{ marginTop: '0.375rem', width: '100%' }}
                  value={selectedProgId}
                  onChange={e => setSelectedProgId(e.target.value)}
                >
                  {eligibleProgs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.uni} · {p.name} (APS {p.aps})
                    </option>
                  ))}
                </select>
              ) : (
                <input className="input" defaultValue="Enter your APS to see eligible programmes" style={{ marginTop: '0.375rem', width: '100%' }} readOnly />
              )}
              {eligibleProgs.length > 0 && (() => {
                const sel = eligibleProgs.find(p => p.id === selectedProgId);
                return sel ? (
                  <div className="caption" style={{ marginTop: '0.375rem' }}>
                    Estimated year 1 cost: {fmtR(Math.round(sel.fees * 1.8))} (tuition + living)
                  </div>
                ) : null;
              })()}
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

      {eligibleProgs.length > 0 && (() => {
        const sel = eligibleProgs.find(p => p.id === selectedProgId);
        if (!sel) return null;
        const yearCost = Math.round(sel.fees * 1.8);
        const meritBursary = (userAps ?? 0) >= 42 ? 165_000 : (userAps ?? 0) >= 38 ? 95_000 : (userAps ?? 0) >= 32 ? 42_000 : 18_000;
        const scholarStipend = 18_000;
        const totalFunding = estimatedAward + (eligible ? 0 : meritBursary + scholarStipend);
        const nsfasTotal = eligible ? estimatedAward : 0;
        const bursaryTotal = eligible ? 0 : meritBursary;
        const stipendTotal = eligible ? 0 : scholarStipend;
        const combinedFunding = nsfasTotal + bursaryTotal + stipendTotal;
        const gap = yearCost - combinedFunding;
        const coveragePct = Math.min(100, Math.round((combinedFunding / yearCost) * 100));
        const rows = eligible
          ? [
              { l: 'NSFAS award', v: fmtR(estimatedAward), c: 'success' },
              { l: 'Estimated year 1 cost', v: fmtR(yearCost), c: '' },
              { l: gap > 0 ? 'Funding gap' : 'Surplus', v: `${gap > 0 ? '-' : '+'}${fmtR(Math.abs(gap))}`, c: gap > 0 ? 'destructive' : 'success' },
            ]
          : [
              { l: 'Merit bursary (est.)', v: fmtR(meritBursary), c: 'warning' },
              { l: 'Scholar stipend', v: fmtR(scholarStipend), c: '' },
              { l: 'Estimated year 1 cost', v: fmtR(yearCost), c: '' },
              { l: 'Funding gap', v: `-${fmtR(Math.max(0, gap))}`, c: 'destructive' },
            ];

        return (
          <div className="card" style={{ marginTop: '1.25rem', borderColor: gap > 0 ? 'hsl(var(--destructive) / 0.3)' : 'hsl(var(--success) / 0.3)' }}>
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Funding gap analysis</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                  {sel.name} at {sel.uni.split(' ').slice(0, 3).join(' ')}
                </h3>
              </div>
              <span className={`badge ${gap > 0 ? 'destructive' : 'success'}`}>
                {gap > 0 ? `${fmtR(gap)} gap` : 'Fully covered'}
              </span>
            </div>
            <div style={{ marginBottom: '0.875rem' }}>
              <div className="row-between" style={{ marginBottom: '0.375rem' }}>
                <span className="caption" style={{ fontSize: '0.75rem' }}>Coverage {coveragePct}%</span>
                <span className="caption" style={{ fontSize: '0.75rem' }}>{fmtR(combinedFunding)} of {fmtR(yearCost)}</span>
              </div>
              <div className="meter">
                <i style={{ width: `${coveragePct}%`, background: gap > 0 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }} />
              </div>
            </div>
            <div className="stack">
              {rows.map(row => (
                <div key={row.l} className="row-between" style={{ fontSize: '0.8125rem', padding: '0.375rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span className="caption">{row.l}</span>
                  <span style={{ fontWeight: 700, color: row.c ? `hsl(var(--${row.c}))` : undefined }}>{row.v}</span>
                </div>
              ))}
            </div>
            {gap > 0 && (
              <p className="caption" style={{ marginTop: '0.75rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                A {fmtR(gap)} gap remains after {eligible ? 'NSFAS' : 'merit bursaries'}. Apply to a targeted scholarship or part-time work to close this.
              </p>
            )}
          </div>
        );
      })()}

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

      {/* Application steps */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />How to apply — 2026 step by step</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            {
              step: '1',
              title: 'Create myNSFAS account',
              deadline: 'Open now · closes 31 Jan 2027',
              detail: 'Go to my.nsfas.org.za → Register with your SA ID number. Check spam for the verification email. Use a working email you check regularly.',
              cls: 'success',
            },
            {
              step: '2',
              title: 'Complete online application',
              deadline: 'After account creation',
              detail: 'Fill in all sections: personal info, academic history, household income. Do not leave fields blank — incomplete applications are rejected automatically.',
              cls: 'success',
            },
            {
              step: '3',
              title: 'Upload supporting documents',
              deadline: 'Within 7 days of applying',
              detail: 'See the document checklist below. PDFs preferred. Each file must be under 5 MB. All income documents must be for the most recent tax year.',
              cls: 'warning',
            },
            {
              step: '4',
              title: 'Await outcome & registration',
              deadline: 'Jan–Feb 2027',
              detail: 'NSFAS will SMS/email an outcome. If approved, go to your university and request NSFAS registration. Do not pay upfront — NSFAS pays the institution directly.',
              cls: 'primary',
            },
            {
              step: '5',
              title: 'Confirm allowance method',
              deadline: 'After registration',
              detail: 'NSFAS pays directly to your institution for tuition. Allowances (accommodation, books, transport) are paid via Fundi card or EFT. Confirm your banking details on the portal.',
              cls: 'primary',
            },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: 'flex', gap: '0.875rem', paddingBottom: i < arr.length - 1 ? '1rem' : 0, position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(var(--${s.cls}) / 0.15)`, border: `2px solid hsl(var(--${s.cls}))`, color: `hsl(var(--${s.cls}))`, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                  {s.step}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: 'hsl(var(--border))', marginTop: '0.375rem', minHeight: '1.25rem' }} />
                )}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? '0.5rem' : 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{s.title}</div>
                <div className="caption" style={{ color: `hsl(var(--${s.cls}))`, marginTop: '0.125rem', fontWeight: 600 }}>{s.deadline}</div>
                <p className="caption" style={{ marginTop: '0.375rem', lineHeight: 1.55, margin: '0.375rem 0 0' }}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document checklist */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <div className="eyebrow"><span className="dot" />Document checklist</div>
          <span className="badge warning">Upload within 7 days</span>
        </div>
        <div className="grid-2" style={{ gap: '0.625rem' }}>
          {[
            { doc: 'SA ID or birth certificate', note: 'Certified copy (not older than 3 months)', required: true },
            { doc: 'Matric results / Grade 11 report', note: 'Official school stamp required', required: true },
            { doc: 'Proof of household income', note: 'Payslips (3 months) or SASSA grant letter', required: true },
            { doc: 'Parent/Guardian ID', note: 'Both parents if applicable', required: true },
            { doc: 'Proof of registration (from university)', note: 'Only after you register', required: false },
            { doc: 'Disability certificate', note: 'From a medical practitioner — only if applicable', required: false },
            { doc: 'Death certificate (if orphan)', note: 'Both parents\' certificates if applicable', required: false },
            { doc: 'Proof of address', note: 'Utility bill or affidavit, not older than 3 months', required: true },
          ].map(d => (
            <div key={d.doc} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', padding: '0.625rem', background: 'hsl(var(--muted) / 0.4)', borderRadius: 'var(--r-md)' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${d.required ? 'hsl(var(--fg))' : 'hsl(var(--muted-fg))'}`, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: d.required ? 700 : 500, fontSize: '0.8125rem' }}>{d.doc}</div>
                <div className="caption" style={{ marginTop: '0.125rem' }}>{d.note}</div>
                {d.required && <span className="badge" style={{ fontSize: '0.6rem', padding: '0 4px', height: '1.1rem', marginTop: '0.25rem' }}>Required</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="caption" style={{ marginTop: '0.875rem', lineHeight: 1.55 }}>
          All documents must be in PDF or JPEG format, each under 5 MB. Certified copies must be certified by a commissioner of oaths (SAPS, post office, bank).
        </p>
      </div>
    </div>
  );
}
