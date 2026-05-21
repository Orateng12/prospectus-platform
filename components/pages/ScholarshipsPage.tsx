'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { CompareItem, Scholarship } from '@/lib/types';
import { toggleScholarshipApplication } from '@/app/actions/toggleScholarshipApplication';

interface ScholarshipsPageProps {
  userAps?: number;
  householdIncome?: number;
  compareItems?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
  onOpenDetail?: (scholarship: Scholarship) => void;
  appliedScholarshipNames?: string[];
}

function computeMatch(s: Scholarship, userAps?: number, income?: number): number {
  let score = s.match;
  if (userAps !== undefined) {
    const apsMatch = s.eligibility.match(/APS\s*[≥>=]+\s*(\d+)/);
    if (apsMatch) {
      const required = parseInt(apsMatch[1]);
      if (userAps < required) score = Math.min(score, 45);
    }
  }
  if (income !== undefined && s.eligibility.toLowerCase().includes('financial need') && income > 350000) {
    score = Math.min(score, 50);
  }
  return score;
}

type Tab = 'all' | 'closing' | 'high' | 'mine';

export default function ScholarshipsPage({ userAps, householdIncome, compareItems = [], onToggleCompare, onOpenDetail, appliedScholarshipNames = [] }: ScholarshipsPageProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [applying, setApplying] = useState<string | null>(null);
  const [localApplied, setLocalApplied] = useState<Set<string>>(() => new Set(appliedScholarshipNames));

  const withLiveMatch = SCHOLARSHIPS.map(s => ({ ...s, match: computeMatch(s, userAps, householdIncome) }));

  const displayed = (() => {
    if (tab === 'high') return [...withLiveMatch].sort((a, b) => b.amount - a.amount);
    if (tab === 'closing') return [...withLiveMatch].sort((a, b) => a.deadline.localeCompare(b.deadline));
    return [...withLiveMatch].sort((a, b) => b.match - a.match);
  })();

  const highMatch = withLiveMatch.filter(s => s.match >= 80).length;
  const appliedList = withLiveMatch.filter(s => localApplied.has(s.name));

  async function handleApply(scholarshipName: string) {
    setApplying(scholarshipName);
    const result = await toggleScholarshipApplication(scholarshipName);
    setApplying(null);
    if ('error' in result) return;
    setLocalApplied(prev => {
      const next = new Set(prev);
      if (result.applied) next.add(scholarshipName);
      else next.delete(scholarshipName);
      return next;
    });
    router.refresh();
  }

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Fund · Scholarships</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Matched for you</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Scholarships</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              {SCHOLARSHIPS.length} scholarships and bursaries matched to your academic profile, financial background and capability graph. Ranked by fit.
            </p>
          </div>
          <div className="row">
            <span className="badge success">{highMatch} ≥ 80% match</span>
            {localApplied.size > 0 && <span className="badge brand">{localApplied.size} applied</span>}
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        {(() => {
          const totalValue = withLiveMatch.reduce((s, x) => s + x.amount, 0);
          const avgMatch   = Math.round(withLiveMatch.reduce((s, x) => s + x.match, 0) / (withLiveMatch.length || 1));
          const today      = new Date();
          const closing14  = withLiveMatch.filter(s => {
            const d = new Date(`${s.deadline} ${today.getFullYear()}`);
            const days = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
            return days >= 0 && days <= 14;
          }).length;
          return [
            { l: 'Total value matched',  v: fmtR(totalValue),              h: `across ${withLiveMatch.length} scholarships`,    c: 'success' },
            { l: 'Applied to',           v: String(localApplied.size),      h: `of ${highMatch} high-fit (≥ 80%)`,               c: '' },
            { l: 'Avg match',            v: `${avgMatch}%`,                 h: 'vs. your profile',                               c: 'success' },
            { l: 'Closing in 14 days',   v: String(closing14 || 0),         h: closing14 > 0 ? 'act now' : 'none imminent',      c: closing14 > 0 ? 'destructive' : '' },
          ].map(({ l, v, h, c }) => (
            <div className="card kpi" key={l}>
              <div className="lbl">{l}</div>
              <div className="val" style={c ? { color: `hsl(var(--${c}))` } : {}}>{v}</div>
              <div className="hint">{h}</div>
            </div>
          ));
        })()}
      </div>

      {/* Likely-eligible section — shown when APS and/or income are known */}
      {(userAps !== undefined || householdIncome !== undefined) && (() => {
        const topEligible = withLiveMatch
          .filter(s => s.match >= 70)
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
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>{s.name}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'hsl(var(--success))', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtR(s.amount)}<span className="caption" style={{ fontWeight: 400, fontSize: '0.6875rem' }}>/yr</span>
                  </div>
                  <div className="meter sm"><i style={{ width: `${s.match}%` }} /></div>
                  <div className="caption">{s.match}% match · closes {s.deadline}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="tabs">
        <button className={`tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>All matches ({SCHOLARSHIPS.length})</button>
        <button className={`tab${tab === 'closing' ? ' active' : ''}`} onClick={() => setTab('closing')}>Closing soon</button>
        <button className={`tab${tab === 'high' ? ' active' : ''}`} onClick={() => setTab('high')}>High value</button>
        <button className={`tab${tab === 'mine' ? ' active' : ''}`} onClick={() => setTab('mine')}>My applications</button>
      </div>

      {tab === 'mine' ? (
        appliedList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏆</div>
            <div className="subheading" style={{ marginBottom: '0.5rem' }}>No applications yet</div>
            <p className="caption">Click &ldquo;Apply&rdquo; on any scholarship to start tracking your applications here.</p>
          </div>
        ) : (
          <div className="card">
            <div className="stack">
              {appliedList.map(s => (
                <div key={s.name} className="scholar-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</div>
                    <div className="caption" style={{ marginTop: 1 }}>{s.eligibility} · closes {s.deadline}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(s.amount)}</div>
                    <div className="caption">/ year</div>
                  </div>
                  <div className="row" style={{ gap: '0.5rem' }}>
                    <div className={`match-circle${s.match < 80 ? ' med' : ''}`}>{s.match}</div>
                    <span className="badge success" style={{ height: '1.75rem' }}>Applied</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleApply(s.name)}
                      disabled={applying === s.name}
                    >
                      {applying === s.name ? '…' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="card">
          <div className="stack">
            {displayed.map(s => (
              <div key={s.name} className="scholar-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</div>
                  <div className="caption" style={{ marginTop: 1 }}>{s.eligibility} · closes {s.deadline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(s.amount)}</div>
                  <div className="caption">/ year</div>
                </div>
                <div className="row" style={{ gap: '0.5rem' }}>
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
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onOpenDetail(s)}
                    >
                      View
                    </button>
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

      {withLiveMatch.length > 0 && (() => {
        const sortedByPriority = [...withLiveMatch].sort((a, b) => {
          if (b.match !== a.match) return b.match - a.match;
          return a.deadline.localeCompare(b.deadline);
        });
        const topPriority = sortedByPriority[0];
        const runnerUp    = sortedByPriority[1];
        const serviceContracts = withLiveMatch.filter(s =>
          s.eligibility.toLowerCase().includes('service')
        );
        const stackPartner = withLiveMatch
          .filter(s => s.name !== topPriority.name && !s.eligibility.toLowerCase().includes('service'))
          .sort((a, b) => b.match - a.match)[0];

        return (
          <div className="grid-2" style={{ marginTop: '1.25rem' }}>
            <div className="card">
              <div className="eyebrow"><span className="dot" />Top priority</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                {topPriority.name} — apply first
              </h3>
              <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Closes {topPriority.deadline}. Highest match at {topPriority.match}% of criteria
                {topPriority.match >= 85 ? ' — strong fit, prioritise the application' : ' — worth the effort given the value'}.
                {' '}{fmtR(topPriority.amount)}/year. {topPriority.eligibility}.
              </p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.875rem' }}
                onClick={() => onOpenDetail?.(topPriority)}>
                View details →
              </button>
            </div>
            <div className="card">
              <div className="eyebrow"><span className="dot" />AI commentary</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Stacking strategy</h3>
              <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Apply to {topPriority.name} first.{' '}
                {runnerUp && stackPartner
                  ? `If awarded, you can skip lower-value alternatives. If not, ${stackPartner.name} (${stackPartner.match}% match)${runnerUp.name !== stackPartner.name ? ` + ${runnerUp.name}` : ''} combined cover a strong percentage of year-1 costs.`
                  : 'If awarded, decline lower-value bursaries with service contracts.'}
                {serviceContracts.length > 0 && ` Watch the ${serviceContracts[0].name} — ${fmtR(serviceContracts[0].amount)} but requires a post-graduation service period.`}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
