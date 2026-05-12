'use client';

import { useState } from 'react';
import { SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { CompareItem, Scholarship } from '@/lib/types';

interface ScholarshipsPageProps {
  userAps?: number;
  householdIncome?: number;
  compareItems?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
  onOpenDetail?: (scholarship: Scholarship) => void;
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

export default function ScholarshipsPage({ userAps, householdIncome, compareItems = [], onToggleCompare, onOpenDetail }: ScholarshipsPageProps) {
  const [tab, setTab] = useState<Tab>('all');

  const withLiveMatch = SCHOLARSHIPS.map(s => ({ ...s, match: computeMatch(s, userAps, householdIncome) }));

  const displayed = (() => {
    if (tab === 'high') return [...withLiveMatch].sort((a, b) => b.amount - a.amount);
    if (tab === 'closing') return [...withLiveMatch].sort((a, b) => a.deadline.localeCompare(b.deadline));
    return [...withLiveMatch].sort((a, b) => b.match - a.match);
  })();

  const highMatch = withLiveMatch.filter(s => s.match >= 80).length;

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
            <span className="badge warning">3 new</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>All matches ({SCHOLARSHIPS.length})</button>
        <button className={`tab${tab === 'closing' ? ' active' : ''}`} onClick={() => setTab('closing')}>Closing soon</button>
        <button className={`tab${tab === 'high' ? ' active' : ''}`} onClick={() => setTab('high')}>High value</button>
        <button className={`tab${tab === 'mine' ? ' active' : ''}`} onClick={() => setTab('mine')}>My applications</button>
      </div>

      {tab === 'mine' ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏆</div>
          <div className="subheading" style={{ marginBottom: '0.5rem' }}>No applications yet</div>
          <p className="caption">Click Apply on any scholarship to start tracking your applications here.</p>
        </div>
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
                  <button
                    className={`btn ${s.match >= 80 ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => onOpenDetail?.(s)}
                  >
                    {onOpenDetail ? 'View' : 'Apply'}
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
