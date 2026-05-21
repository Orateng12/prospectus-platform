'use client';

import { useState } from 'react';
import { FUNDING_OPPORTUNITIES } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { FundingOpportunity, Programme, Route } from '@/lib/types';

interface FundingPageProps {
  householdIncome?: number;
  userAps?: number;
  programmes?: Programme[];
  navigate?: (r: Route) => void;
  fundingOpportunities?: FundingOpportunity[];
}

function computeNsfas(income: number | undefined): number {
  if (income === undefined || income <= 350_000) return 115_060;
  if (income <= 600_000)                         return  48_000;
  return 0;
}

function computeBursary(aps: number | undefined): number {
  const a = aps ?? 0;
  if (a >= 42) return 165_000;
  if (a >= 38) return  95_000;
  if (a >= 32) return  42_000;
  if (a >= 26) return  18_000;
  return 0;
}

function computeMatch(f: FundingOpportunity, aps: number | undefined, income: number | undefined): number {
  let score = 60;
  const a = aps ?? 0;
  if (f.min_aps) score += a >= f.min_aps ? 20 : Math.max(-15, Math.round((a - f.min_aps) / f.min_aps * 20));
  else score += 8;
  if (f.income_threshold && income !== undefined) score += income <= f.income_threshold ? 15 : -20;
  else if (!f.income_threshold) score += 8;
  return Math.max(10, Math.min(99, score));
}

const TYPE_ICON: Record<string, string> = {
  grant: 'N', bursary: 'B', scholarship: 'S', seta: 'T', loan: 'L', international: 'I', disability: 'D',
};
const TYPE_CLS: Record<string, string> = {
  grant: 'nsfas', bursary: 'bursary', scholarship: 'scholar', seta: 'bursary', loan: 'nsfas',
  international: 'scholar', disability: 'scholar',
};

const DEFAULT_YEAR1_COST = 165_420;
const INFLATION = 0.048;

export default function FundingPage({ householdIncome, userAps, programmes, navigate, fundingOpportunities }: FundingPageProps) {
  const [showAll, setShowAll] = useState(false);

  const opportunities = fundingOpportunities ?? FUNDING_OPPORTUNITIES;
  const aboveNsfasThreshold = householdIncome !== undefined && householdIncome > 350_000;

  const topProg = programmes && programmes.length > 0
    ? programmes.reduce((best, p) => p.fit > best.fit ? p : best)
    : null;
  const year1Cost = topProg ? Math.round(topProg.fees * 1.8) : DEFAULT_YEAR1_COST;
  const progLabel = topProg ? `${topProg.name} · ${topProg.uni}` : 'your shortlisted programme';

  const nsfas   = computeNsfas(householdIncome);
  const bursary = computeBursary(userAps);

  // Filter and score opportunities
  const matchedOpps = opportunities
    .filter(f => {
      if (f.income_threshold && householdIncome !== undefined && householdIncome > f.income_threshold) return false;
      if (f.min_aps && (userAps ?? 0) < f.min_aps) return false;
      return true;
    })
    .map(f => ({ ...f, score: computeMatch(f, userAps, householdIncome) }))
    .sort((a, b) => b.amount - a.amount);

  const topScholar    = matchedOpps.find(f => f.type !== 'loan') ?? null;
  const serviceScholar = matchedOpps.find(f => f.service_contract) ?? null;
  const scholar       = topScholar?.amount ?? 18_000;
  const total         = year1Cost;
  const gap           = Math.max(0, total - nsfas - bursary - scholar);
  const pct           = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  const PIPELINE_LIMIT = 6;
  const visibleOpps = showAll ? matchedOpps : matchedOpps.slice(0, PIPELINE_LIMIT);

  const projection = [1, 2, 3].map(y => {
    const cost = Math.round(total * Math.pow(1 + INFLATION, y - 1));
    const cov  = Math.min(cost, nsfas + bursary + scholar);
    return { y: `Year ${y}`, cost, cov };
  });

  const bursaryLabel = bursary >= 95_000 ? 'Investec Bursary' : bursary >= 42_000 ? 'Merit Bursary' : 'Achievement Bursary';
  const bursorySub   = bursary > 0
    ? `APS ${userAps ?? '—'} qualifies · application open`
    : 'APS below merit threshold';

  const fundingTier = householdIncome === undefined
    ? null
    : householdIncome <= 350_000
    ? { label: 'NSFAS-eligible', sub: `Full NSFAS coverage + bursaries available`, cls: 'success', cta: 'nsfas' as const }
    : householdIncome <= 600_000
    ? { label: 'Bursary-first strategy', sub: `Above NSFAS threshold · merit bursaries are your primary route`, cls: 'warning', cta: 'scholarships' as const }
    : { label: 'Merit + self-fund strategy', sub: `High-income bracket · target merit scholarships and service bursaries`, cls: 'info', cta: 'scholarships' as const };

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Funding strategy</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Personalised plan</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Funding strategy</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Based on {progLabel} ({fmtR(total)} estimated year 1 total cost),
              here is the optimal stack of NSFAS, bursaries and scholarships matched to your profile.
            </p>
          </div>
          <div className="row">
            {aboveNsfasThreshold && (
              <span className="badge destructive">NSFAS: Above R 350k threshold</span>
            )}
            <button className="btn btn-outline" onClick={() => navigate?.('programmes')}>Switch programme</button>
            <button className="btn btn-primary" onClick={() => navigate?.('applications')}>View applications</button>
          </div>
        </div>
      </div>

      {fundingTier && userAps !== undefined && (
        <div
          className="card"
          style={{ borderLeft: `3px solid hsl(var(--${fundingTier.cls}))`, marginBottom: '1.25rem', padding: '1rem 1.25rem' }}
        >
          <div className="row-between">
            <div>
              <div className="eyebrow"><span className="dot" />Your funding profile</div>
              <div style={{ fontWeight: 800, fontSize: '1.0625rem', marginTop: '0.25rem' }}>{fundingTier.label}</div>
              <div className="caption" style={{ marginTop: '0.25rem' }}>{fundingTier.sub}</div>
              <div className="caption" style={{ marginTop: '0.25rem' }}>
                Household income {fmtR(householdIncome!)} / yr · APS {userAps}
                {bursary > 0 ? ` · qualifies for ${fmtR(bursary)} bursary` : ''}
              </div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate?.(fundingTier.cta)}
            >
              {fundingTier.cta === 'nsfas' ? 'Check NSFAS →' : 'View scholarships →'}
            </button>
          </div>
        </div>
      )}

      <div className="fund-strategy">
        <div>
          <div className="caption">Year 1 total cost</div>
          <div className="display" style={{ fontSize: '2.75rem', marginTop: '0.25rem' }}>{fmtR(total)}</div>
          <div className="caption" style={{ marginTop: '0.5rem' }}>Tuition + residence + meals + materials</div>
          <hr className="divider" />
          <div className="caption">Currently covered</div>
          <div className="display" style={{ fontSize: '2rem', color: 'hsl(var(--success))', marginTop: '0.25rem' }}>
            {fmtR(total - gap)}
          </div>
          <div className="caption" style={{ marginTop: '0.25rem' }}>
            {(((total - gap) / total) * 100).toFixed(0)}% of total
          </div>
          <hr className="divider" />
          <div className="caption">Remaining gap</div>
          <div
            className="display"
            style={{ fontSize: '2rem', color: gap > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))', marginTop: '0.25rem' }}
          >
            {gap > 0 ? fmtR(gap) : 'Closed'}
          </div>
          {gap > 0 && topScholar && (
            <div className="caption" style={{ marginTop: '0.25rem' }}>Apply to {topScholar.name} to close 100%.</div>
          )}
        </div>

        <div>
          <h3 className="subheading">Funding stack</h3>
          <div className="caption" style={{ marginTop: '0.25rem' }}>Year 1 · ZAR</div>

          <div className="fund-bar" style={{ marginTop: '1rem' }}>
            <div className="fund-seg nsfas"  style={{ flex: nsfas }}   title="NSFAS">{pct(nsfas)}</div>
            {bursary > 0 && (
              <div className="fund-seg bursary" style={{ flex: bursary }} title="Bursary">{pct(bursary)}</div>
            )}
            <div className="fund-seg scholar" style={{ flex: scholar }} title="Scholarship">{pct(scholar)}</div>
            {gap > 0 && (
              <div className="fund-seg fund-gap-seg" style={{ flex: gap }} title="Gap">{pct(gap)}</div>
            )}
          </div>

          <div className="row" style={{ gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.6875rem' }}>
            {[
              { label: 'NSFAS',       bg: 'hsl(var(--fg))' },
              ...(bursary > 0 ? [{ label: 'Bursary', bg: 'hsl(var(--primary))' }] : []),
              { label: topScholar?.name ?? 'Scholarship', bg: 'hsl(var(--accent))' },
              ...(gap > 0 ? [{ label: 'Gap', bg: 'hsl(var(--destructive) / 0.4)' }] : []),
            ].map(x => (
              <span key={x.label} className="row" style={{ gap: '0.375rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: x.bg, display: 'inline-block' }} />
                {x.label}
              </span>
            ))}
          </div>

          <div className="stack-2" style={{ marginTop: '1.25rem' }}>
            {[
              { cls: 'nsfas',   icon: 'N', label: 'NSFAS',                     amount: nsfas,   sub: aboveNsfasThreshold ? 'Above income threshold · not eligible' : 'Government bursary · confirmed eligible' },
              ...(bursary > 0 ? [{ cls: 'bursary', icon: 'B', label: bursaryLabel, amount: bursary, sub: bursorySub }] : []),
              ...(topScholar ? [{ cls: 'scholar', icon: 'S', label: topScholar.name, amount: scholar, sub: `${topScholar.score}% match · application open` }] : []),
            ].map(x => (
              <div key={x.label} className="fund-source">
                <div className={`fund-icon ${x.cls}`}>{x.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{x.label}</div>
                  <div className="caption" style={{ marginTop: '0.125rem' }}>{x.sub}</div>
                </div>
                <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '1rem' }}>
                  {fmtR(x.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funding pipeline */}
      <div className="card">
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <div>
            <div className="eyebrow"><span className="dot" />Funding pipeline</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
              {matchedOpps.length} opportunities matched to your profile
            </h3>
          </div>
          <div className="row">
            <span className="badge success">{matchedOpps.filter(f => f.score >= 80).length} strong match</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate?.('scholarships')}>View all →</button>
          </div>
        </div>
        <div className="stack">
          {visibleOpps.map(f => (
            <div className="scholar-row" key={f.id}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{f.name}</div>
                <div className="caption" style={{ marginTop: 1 }}>
                  {f.eligibility.split('·')[0].trim()} · closes {f.deadline ?? 'Rolling'}
                </div>
                <div className="row" style={{ gap: '0.375rem', marginTop: '0.375rem' }}>
                  <span className={`badge ${TYPE_CLS[f.type] ?? 'info'}`} style={{ height: '1.125rem', fontSize: '0.5625rem', padding: '0 0.375rem' }}>
                    {f.type}
                  </span>
                  {f.service_contract && (
                    <span className="badge warning" style={{ height: '1.125rem', fontSize: '0.5625rem', padding: '0 0.375rem' }}>
                      Service contract
                    </span>
                  )}
                  {f.province_specific && (
                    <span className="badge info" style={{ height: '1.125rem', fontSize: '0.5625rem', padding: '0 0.375rem' }}>
                      {f.province_specific}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(f.amount)}</div>
                <div className="caption">/ year</div>
              </div>
              <div className="row" style={{ gap: '0.625rem' }}>
                <div className={`match-circle${f.score < 80 ? ' med' : ''}`}>{f.score}</div>
                <button
                  className={`btn ${f.score >= 80 ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => navigate?.('scholarships')}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
        {matchedOpps.length > PIPELINE_LIMIT && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowAll(s => !s)}
            >
              {showAll
                ? 'Show less'
                : `Show ${matchedOpps.length - PIPELINE_LIMIT} more opportunities`}
            </button>
          </div>
        )}
      </div>

      {/* 4-year projection + AI commentary */}
      <div className="grid-2 stack-3" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="eyebrow"><span className="dot" />4-year projection</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Total degree cost &amp; coverage</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            {projection.map(({ y, cost, cov }) => {
              const pc = Math.round(cov / cost * 100);
              return (
                <div key={y}>
                  <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600 }}>{y}</span>
                    <span style={{ fontWeight: 800 }}>{fmtR(cov)} <span className="caption">/ {fmtR(cost)}</span></span>
                  </div>
                  <div className={`meter ${pc >= 90 ? 'success' : pc >= 70 ? 'primary' : 'warning'}`} style={{ marginTop: '0.375rem' }}>
                    <i style={{ width: `${pc}%` }} />
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{pc}% covered</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow"><span className="dot" />Strategy notes</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>AI commentary</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            {topScholar && (
              <div className="insight">
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  Apply to {topScholar.name} first
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                  {topScholar.deadline && topScholar.deadline !== 'Rolling' ? `Closes ${topScholar.deadline}, ` : ''}
                  Highest amount ({fmtR(topScholar.amount)}) and {topScholar.score}% match.
                  {gap === 0 ? ' Combined with your other funding, this fully covers your degree.' : ' If awarded, decline lower-value bursaries.'}
                </p>
                <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>Strategic priority</div>
              </div>
            )}
            {serviceScholar && (
              <div className="insight">
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  Watch the {serviceScholar.name} service contract
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                  {serviceScholar.name}&apos;s {fmtR(serviceScholar.amount)} bursary requires a post-graduation service period — limits mobility. Stack only if committed to the sector.
                </p>
                <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>Risk note</div>
              </div>
            )}
            {matchedOpps.filter(f => f.type === 'loan').length > 0 && (
              <div className="insight">
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  Student loans as last resort
                </div>
                <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                  {matchedOpps.filter(f => f.type === 'loan').length} loan products available from {fmtR(matchedOpps.filter(f => f.type === 'loan').sort((a,b) => a.amount - b.amount)[0]?.amount ?? 0)}.
                  Exhaust bursaries and scholarships first — loan repayments begin 6 months after graduation.
                </p>
                <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>Financial risk</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
