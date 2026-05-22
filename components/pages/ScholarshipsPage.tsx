'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FUNDING_OPPORTUNITIES } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { CompareItem, Scholarship, FundingOpportunity } from '@/lib/types';
import { toggleScholarshipApplication } from '@/app/actions/toggleScholarshipApplication';
import { addDeadline } from '@/app/actions/deadlines';

const MONTH_MAP: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

function deadlineToISO(dl: string): string | null {
  const [day, mon, year] = dl.split(' ');
  const m = MONTH_MAP[mon];
  if (!m || !day || !year) return null;
  return `${year}-${m}-${day.padStart(2, '0')}`;
}

function dataAgeBadge(opportunities: FundingOpportunity[]): string | null {
  const latest = opportunities.reduce((best, f) => {
    return f.last_verified_at && f.last_verified_at > best ? f.last_verified_at : best;
  }, '');
  if (!latest) return null;
  const monthsAgo = Math.floor((Date.now() - new Date(latest).getTime()) / (30 * 86_400_000));
  return monthsAgo === 0 ? 'Verified this month' : `Verified ${monthsAgo}mo ago`;
}

interface ScholarshipsPageProps {
  userAps?: number;
  householdIncome?: number;
  compareItems?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
  onOpenDetail?: (scholarship: Scholarship) => void;
  appliedScholarshipNames?: string[];
  fundingOpportunities?: FundingOpportunity[];
}

function computeMatch(s: FundingOpportunity, userAps?: number, income?: number): number {
  let score = s.match;
  if (userAps !== undefined && s.min_aps && userAps < s.min_aps) {
    score = Math.min(score, 45);
  }
  if (userAps !== undefined && !s.min_aps) {
    const apsMatch = s.eligibility.match(/APS\s*[≥>=]+\s*(\d+)/);
    if (apsMatch && userAps < parseInt(apsMatch[1])) score = Math.min(score, 45);
  }
  if (income !== undefined && s.income_threshold && income > s.income_threshold) {
    score = Math.min(score, 30);
  }
  if (income !== undefined && !s.income_threshold && s.eligibility.toLowerCase().includes('financial need') && income > 350000) {
    score = Math.min(score, 50);
  }
  return score;
}

type Tab = 'all' | 'bursaries' | 'seta' | 'loans' | 'international' | 'mine';

const TAB_LABELS: Record<Tab, string> = {
  all:           'All',
  bursaries:     'Bursaries',
  seta:          'SETA',
  loans:         'Loans',
  international: 'International',
  mine:          'My applications',
};

export default function ScholarshipsPage({
  userAps, householdIncome, compareItems = [], onToggleCompare, onOpenDetail,
  appliedScholarshipNames = [], fundingOpportunities,
}: ScholarshipsPageProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [applying, setApplying] = useState<string | null>(null);
  const [localApplied, setLocalApplied] = useState<Set<string>>(() => new Set(appliedScholarshipNames));
  const [visibleCount, setVisibleCount] = useState(10);

  const source = fundingOpportunities && fundingOpportunities.length > 0
    ? fundingOpportunities
    : FUNDING_OPPORTUNITIES;

  const withLiveMatch = source.map(s => ({ ...s, match: computeMatch(s, userAps, householdIncome) }));

  const typeFiltered = (() => {
    if (tab === 'bursaries') return withLiveMatch.filter(s => s.type === 'bursary' || s.type === 'scholarship' || s.type === 'grant' || s.type === 'disability');
    if (tab === 'seta')      return withLiveMatch.filter(s => s.type === 'seta');
    if (tab === 'loans')     return withLiveMatch.filter(s => s.type === 'loan');
    if (tab === 'international') return withLiveMatch.filter(s => s.type === 'international');
    return withLiveMatch;
  })();

  const sorted = [...typeFiltered].sort((a, b) => b.match - a.match);
  const displayed = sorted.slice(0, visibleCount);
  const highMatch = withLiveMatch.filter(s => s.match >= 80).length;
  const appliedList = withLiveMatch.filter(s => localApplied.has(s.name));
  const verifiedBadge = dataAgeBadge(source);

  async function handleApply(scholarshipName: string) {
    setApplying(scholarshipName);
    const result = await toggleScholarshipApplication(scholarshipName);
    setApplying(null);
    if ('error' in result) return;
    if (result.applied) {
      const scholarship = source.find(s => s.name === scholarshipName);
      if (scholarship && scholarship.deadline && scholarship.deadline !== 'Rolling') {
        const isoDate = deadlineToISO(scholarship.deadline);
        if (isoDate) await addDeadline(`${scholarshipName} application deadline`, isoDate);
      }
    }
    setLocalApplied(prev => {
      const next = new Set(prev);
      if (result.applied) next.add(scholarshipName);
      else next.delete(scholarshipName);
      return next;
    });
    router.refresh();
  }

  const totalValue = withLiveMatch.reduce((s, x) => s + x.amount, 0);
  const avgMatch = Math.round(withLiveMatch.reduce((s, x) => s + x.match, 0) / (withLiveMatch.length || 1));
  const today = new Date();

  function daysUntil(deadline: string): number | null {
    if (!deadline || deadline === 'Rolling') return null;
    const d = new Date(`${deadline} ${today.getFullYear()}`);
    const days = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
    return days >= 0 ? days : null;
  }

  const closingSoon = withLiveMatch
    .filter(s => { const d = daysUntil(s.deadline ?? ''); return d !== null && d <= 30; })
    .sort((a, b) => (daysUntil(a.deadline ?? '') ?? 999) - (daysUntil(b.deadline ?? '') ?? 999))
    .slice(0, 3);

  const closing14 = closingSoon.filter(s => (daysUntil(s.deadline ?? '') ?? 999) <= 14).length;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Fund · Scholarships</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Matched for you</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Funding opportunities</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              {source.length} bursaries, scholarships, SETA awards, international scholarships and student loans — matched to your profile and ranked by fit.
            </p>
          </div>
          <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {verifiedBadge && <span className="badge info">{verifiedBadge}</span>}
            <span className="badge success">{highMatch} ≥ 80% match</span>
            {localApplied.size > 0 && <span className="badge brand">{localApplied.size} applied</span>}
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        {[
          { l: 'Total value matched',  v: fmtR(totalValue),         h: `across ${withLiveMatch.length} opportunities`,   c: 'success' },
          { l: 'Applied to',           v: String(localApplied.size), h: `of ${highMatch} high-fit (≥ 80%)`,               c: '' },
          { l: 'Avg match',            v: `${avgMatch}%`,            h: 'vs. your profile',                               c: 'success' },
          { l: 'Closing in 14 days',   v: String(closing14 || 0),    h: closing14 > 0 ? 'act now' : 'none imminent',      c: closing14 > 0 ? 'destructive' : '' },
        ].map(({ l, v, h, c }) => (
          <div className="card kpi" key={l}>
            <div className="lbl">{l}</div>
            <div className="val" style={c ? { color: `hsl(var(--${c}))` } : {}}>{v}</div>
            <div className="hint">{h}</div>
          </div>
        ))}
      </div>

      {/* Closing soon alert */}
      {closingSoon.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '3px solid hsl(var(--destructive))', padding: '0.875rem 1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '0.625rem' }}>
            <div className="eyebrow" style={{ color: 'hsl(var(--destructive))' }}><span className="dot" />Closing soon — act now</div>
            <span className="badge destructive">{closingSoon.length} deadline{closingSoon.length > 1 ? 's' : ''} within 30 days</span>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {closingSoon.map(s => {
              const days = daysUntil(s.deadline ?? '');
              return (
                <div
                  key={s.name}
                  className="card compact"
                  style={{ flex: '1 1 200px', padding: '0.75rem', cursor: onOpenDetail ? 'pointer' : 'default', borderColor: (days ?? 999) <= 7 ? 'hsl(var(--destructive) / 0.4)' : 'hsl(var(--warning) / 0.4)' }}
                  onClick={() => onOpenDetail?.(s)}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>{s.name}</div>
                  <div className="caption" style={{ marginTop: '0.125rem' }}>{fmtR(s.amount)}/yr · {s.match}% match</div>
                  <div style={{ marginTop: '0.375rem' }}>
                    <span className={`badge ${(days ?? 999) <= 7 ? 'destructive' : 'warning'}`} style={{ fontSize: '0.6rem' }}>
                      {days === 0 ? 'Today' : `${days}d left`} · closes {s.deadline}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Likely-eligible spotlight */}
      {(userAps !== undefined || householdIncome !== undefined) && (() => {
        const topEligible = withLiveMatch
          .filter(s => s.match >= 70 && s.type !== 'loan')
          .sort((a, b) => b.match - a.match)
          .slice(0, 3);
        if (topEligible.length === 0) return null;
        return (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="row-between" style={{ marginBottom: '0.75rem' }}>
              <div className="eyebrow"><span className="dot" />Likely eligible for you</div>
              <span className="badge success">{topEligible.length} strong match{topEligible.length > 1 ? 'es' : ''}</span>
            </div>
            <div className="grid-3" style={{ gap: '0.75rem' }}>
              {topEligible.map(s => (
                <button
                  key={s.name}
                  className="card compact"
                  style={{ textAlign: 'left', cursor: 'pointer', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
                  onClick={() => onOpenDetail?.(s)}
                >
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>{s.name}</div>
                    {s.service_contract && <span className="badge warning" style={{ fontSize: '0.6rem', padding: '0 4px' }}>Service</span>}
                    {s.disability_specific && <span className="badge info" style={{ fontSize: '0.6rem', padding: '0 4px' }}>Disability</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'hsl(var(--success))', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtR(s.amount)}<span className="caption" style={{ fontWeight: 400, fontSize: '0.6875rem' }}>/yr</span>
                  </div>
                  <div className="meter sm"><i style={{ width: `${s.match}%` }} /></div>
                  <div className="caption">{s.match}% match · {s.deadline === 'Rolling' ? 'Rolling deadline' : `closes ${s.deadline}`}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1rem' }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => {
          const count = t === 'mine' ? localApplied.size
            : t === 'all' ? withLiveMatch.length
            : t === 'bursaries' ? withLiveMatch.filter(s => ['bursary','scholarship','grant','disability'].includes(s.type)).length
            : withLiveMatch.filter(s => s.type === t).length;
          return (
            <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => { setTab(t); setVisibleCount(10); }}>
              {TAB_LABELS[t]}{count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {tab === 'mine' ? (
        appliedList.length === 0 ? (
          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />How this works</div>
              <div className="row" style={{ gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {[
                  { n: '1', label: 'Browse funding', desc: 'Go to the All or Bursaries tab — filter by type, income, or study field' },
                  { n: '2', label: 'Click Apply', desc: 'Opens the official site and logs your application here automatically' },
                  { n: '3', label: 'Track here', desc: 'Monitor status, deadlines and any service-contract obligations in one place' },
                ].map(step => (
                  <div key={step.n} style={{ flex: '1 1 10rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      {step.n}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{step.label}</div>
                    <p className="caption" style={{ color: 'hsl(var(--fg))' }}>{step.desc}</p>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('all')}>Browse all funding →</button>
            </div>

            {/* Ghost scholarship example */}
            <div className="card" style={{ opacity: 0.72, pointerEvents: 'none', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                <span className="badge accent" style={{ fontSize: '0.625rem' }}>Example</span>
              </div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Investec Bursary Programme</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>Corporate · Engineering, Commerce, Science</div>
                </div>
                <div className="row" style={{ gap: '0.375rem' }}>
                  <span className="badge info">Applied</span>
                  <span className="badge success" style={{ fontWeight: 800 }}>R165,000/yr</span>
                </div>
              </div>
              <div className="row" style={{ gap: '0.5rem' }}>
                <span className="badge warning">Deadline 31 Aug 2026</span>
                <span className="badge destructive" style={{ fontSize: '0.5625rem' }}>Service contract</span>
              </div>
              <div className="caption" style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid hsl(var(--border))', fontStyle: 'italic' }}>
                Your tracked funding applications will look exactly like this.
              </div>
            </div>
          </div>
        ) : (() => {
          const TYPICAL_COST = 165_420;
          const appliedTotal = appliedList.reduce((s, x) => s + x.amount, 0);
          const coveragePct  = Math.min(100, Math.round((appliedTotal / TYPICAL_COST) * 100));
          const gapAmount    = Math.max(0, TYPICAL_COST - appliedTotal);
          const serviceCount = appliedList.filter(s => s.service_contract).length;
          const loanTotal    = appliedList.filter(s => s.type === 'loan').reduce((s, x) => s + x.amount, 0);
          const grantTotal   = appliedTotal - loanTotal;
          return (
            <div className="stack-3">
              {/* Stack summary */}
              <div className="card" style={{
                borderColor: coveragePct >= 100 ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--warning) / 0.4)',
                background:  coveragePct >= 100 ? 'hsl(var(--success) / 0.03)' : 'hsl(var(--warning) / 0.03)',
              }}>
                <div className="row-between" style={{ marginBottom: '0.875rem' }}>
                  <div>
                    <div className="eyebrow"><span className="dot" />Your funding stack</div>
                    <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                      {appliedList.length} application{appliedList.length !== 1 ? 's' : ''} · {fmtR(appliedTotal)}/yr combined
                    </h3>
                  </div>
                  <span className={`badge ${coveragePct >= 100 ? 'success' : coveragePct >= 70 ? 'warning' : 'destructive'}`} style={{ fontSize: '0.875rem', height: '1.75rem' }}>
                    {coveragePct}% covered
                  </span>
                </div>
                <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                  {[
                    { l: 'Grant / bursary',  v: fmtR(grantTotal),   h: 'does not need repayment', c: 'success' },
                    { l: 'Student loans',    v: loanTotal > 0 ? fmtR(loanTotal) : '—', h: loanTotal > 0 ? 'repayment required' : 'none in stack', c: loanTotal > 0 ? 'destructive' : '' },
                    { l: 'Remaining gap',    v: gapAmount > 0 ? fmtR(gapAmount) : 'Closed', h: gapAmount > 0 ? `vs ${fmtR(TYPICAL_COST)} yr 1 cost` : 'fully covered', c: gapAmount > 0 ? 'warning' : 'success' },
                  ].map(({ l, v, h, c }) => (
                    <div key={l} style={{ padding: '0.75rem', background: 'hsl(var(--muted) / 0.4)', borderRadius: 8 }}>
                      <div className="caption" style={{ fontSize: '0.625rem', marginBottom: '0.25rem' }}>{l}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums', color: c ? `hsl(var(--${c}))` : undefined }}>{v}</div>
                      <div className="caption" style={{ fontSize: '0.625rem', marginTop: '0.125rem' }}>{h}</div>
                    </div>
                  ))}
                </div>
                {/* Coverage bar */}
                <div style={{ height: '0.5rem', borderRadius: 999, background: 'hsl(var(--border))', overflow: 'hidden', marginBottom: '0.375rem', display: 'flex' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round(grantTotal / TYPICAL_COST * 100))}%`, background: 'hsl(var(--success))', borderRadius: 999, flexShrink: 0, transition: 'width 0.3s ease' }} />
                  {loanTotal > 0 && (
                    <div style={{ height: '100%', width: `${Math.min(100 - Math.round(grantTotal / TYPICAL_COST * 100), Math.round(loanTotal / TYPICAL_COST * 100))}%`, background: 'hsl(var(--destructive) / 0.6)', flexShrink: 0, transition: 'width 0.3s ease' }} />
                  )}
                </div>
                <div className="caption" style={{ fontSize: '0.6875rem' }}>
                  {coveragePct >= 100
                    ? 'Your stack covers the full estimated year 1 cost. Review service contract terms below.'
                    : `${fmtR(gapAmount)} gap remaining vs. estimated R 165,420 year 1 cost (tuition + residence + materials).`}
                </div>
                {serviceCount > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', background: 'hsl(var(--warning) / 0.12)', border: '1px solid hsl(var(--warning) / 0.4)', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500 }}>
                    {serviceCount} scholarship{serviceCount > 1 ? 's' : ''} in your stack require{serviceCount === 1 ? 's' : ''} a service contract — you must work for the sponsor for a fixed period after graduating.
                  </div>
                )}
              </div>

              {/* Applied list */}
              <div className="card">
                <div className="stack">
                  {appliedList.map(s => (
                    <div key={s.name} className="scholar-row">
                      <div>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</span>
                          {s.service_contract && <span className="badge warning" style={{ fontSize: '0.6rem', padding: '0 4px' }}>Service</span>}
                          {s.type === 'loan' && <span className="badge destructive" style={{ fontSize: '0.6rem', padding: '0 4px' }}>Loan</span>}
                        </div>
                        <div className="caption" style={{ marginTop: 1 }}>{s.eligibility} · {s.deadline === 'Rolling' ? 'Rolling deadline' : `closes ${s.deadline}`}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(s.amount)}</div>
                        <div className="caption">/ year</div>
                      </div>
                      <div className="row" style={{ gap: '0.5rem' }}>
                        <div className={`match-circle${s.match < 80 ? ' med' : ''}`}>{s.match}</div>
                        <span className="badge success" style={{ height: '1.75rem' }}>Applied</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleApply(s.name)} disabled={applying === s.name}>
                          {applying === s.name ? '…' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="card">
          <div className="stack">
            {displayed.map(s => (
              <div key={s.name} className="scholar-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</span>
                    {s.service_contract && <span className="badge warning" style={{ fontSize: '0.6rem', padding: '0 5px', height: '1.25rem' }}>Service contract</span>}
                    {s.disability_specific && <span className="badge info" style={{ fontSize: '0.6rem', padding: '0 5px', height: '1.25rem' }}>Disability</span>}
                    {s.province_specific && <span className="badge" style={{ fontSize: '0.6rem', padding: '0 5px', height: '1.25rem' }}>{s.province_specific}</span>}
                    {s.type === 'loan' && <span className="badge destructive" style={{ fontSize: '0.6rem', padding: '0 5px', height: '1.25rem' }}>Loan</span>}
                    {s.type === 'international' && <span className="badge brand" style={{ fontSize: '0.6rem', padding: '0 5px', height: '1.25rem' }}>International</span>}
                  </div>
                  <div className="caption" style={{ marginTop: 2 }}>{s.eligibility} · {s.deadline === 'Rolling' ? 'Rolling deadline' : `closes ${s.deadline}`}</div>
                  {s.study_fields && s.study_fields.length > 0 && (
                    <div className="row" style={{ gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {s.study_fields.slice(0, 3).map(f => (
                        <span key={f} className="career-tag" style={{ fontSize: '0.5625rem', padding: '0 0.3rem', height: '1.125rem' }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(s.amount)}</div>
                  <div className="caption">/ year</div>
                </div>
                <div className="row" style={{ gap: '0.5rem', flexShrink: 0 }}>
                  <div className={`match-circle${s.match < 80 ? ' med' : ''}`}>{s.match}</div>
                  {onToggleCompare && (
                    <button
                      className={`btn btn-sm ${compareItems.some(ci => ci.id === s.name) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => onToggleCompare({ id: s.name, kind: 'scholarship', name: s.name })}
                    >
                      {compareItems.some(ci => ci.id === s.name) ? '✓' : 'Compare'}
                    </button>
                  )}
                  {onOpenDetail && (
                    <button className="btn btn-outline btn-sm" onClick={() => onOpenDetail(s)}>View</button>
                  )}
                  <button
                    className={`btn btn-sm ${localApplied.has(s.name) ? 'btn-ghost' : s.match >= 80 ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleApply(s.name)}
                    disabled={applying === s.name}
                  >
                    {applying === s.name ? '…' : localApplied.has(s.name) ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab !== 'mine' && visibleCount < sorted.length && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setVisibleCount(v => Math.min(v + 10, sorted.length))}>
            Show {Math.min(10, sorted.length - visibleCount)} more opportunities
          </button>
          <div className="caption" style={{ marginTop: '0.375rem', color: 'hsl(var(--muted-fg))' }}>
            Showing {Math.min(visibleCount, sorted.length)} of {sorted.length}
          </div>
        </div>
      )}

      {/* Strategy cards */}
      {withLiveMatch.filter(s => s.type !== 'loan').length > 1 && (() => {
        const nonLoans = withLiveMatch.filter(s => s.type !== 'loan').sort((a, b) => b.match - a.match);
        const topPriority = nonLoans[0];
        const stackPartner = nonLoans.find(s => s.name !== topPriority.name && !s.service_contract);
        const serviceContracts = withLiveMatch.filter(s => s.service_contract);
        return (
          <div className="grid-2" style={{ marginTop: '1.25rem' }}>
            <div className="card">
              <div className="eyebrow"><span className="dot" />Top priority</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>{topPriority.name} — apply first</h3>
              <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {topPriority.deadline !== 'Rolling' ? `Closes ${topPriority.deadline}. ` : ''}
                Highest match at {topPriority.match}% of criteria
                {topPriority.match >= 85 ? ' — strong fit, prioritise the application' : ' — worth the effort given the value'}.
                {' '}{fmtR(topPriority.amount)}/year. {topPriority.eligibility}.
              </p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.875rem' }} onClick={() => onOpenDetail?.(topPriority)}>
                View details →
              </button>
            </div>
            <div className="card">
              <div className="eyebrow"><span className="dot" />Stacking strategy</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Combine to maximise coverage</h3>
              <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Apply to {topPriority.name} first.{' '}
                {stackPartner
                  ? `If awarded, skip lower-value alternatives. If not, ${stackPartner.name} (${stackPartner.match}% match) can close a strong share of year-1 costs.`
                  : 'If awarded, you can decline alternatives with service contracts.'}
                {serviceContracts.length > 0 && ` Note: ${serviceContracts[0].name} requires a post-graduation service period — consider this before accepting.`}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
