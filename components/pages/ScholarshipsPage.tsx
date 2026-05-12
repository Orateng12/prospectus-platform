'use client';

import { useState } from 'react';
import { SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';

type Tab = 'all' | 'closing' | 'high' | 'mine';

export default function ScholarshipsPage() {
  const [tab, setTab] = useState<Tab>('all');

  const displayed = (() => {
    if (tab === 'high') return [...SCHOLARSHIPS].sort((a, b) => b.amount - a.amount);
    if (tab === 'closing') return [...SCHOLARSHIPS].sort((a, b) => a.deadline.localeCompare(b.deadline));
    return [...SCHOLARSHIPS].sort((a, b) => b.match - a.match);
  })();

  const highMatch = SCHOLARSHIPS.filter(s => s.match >= 80).length;

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
                <div className="row" style={{ gap: '0.625rem' }}>
                  <div className={`match-circle${s.match < 80 ? ' med' : ''}`}>{s.match}</div>
                  <button className={`btn ${s.match >= 80 ? 'btn-primary' : 'btn-outline'} btn-sm`}>Apply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="eyebrow"><span className="dot" />Top priority</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Allan Gray Orbis — apply first</h3>
          <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Closes 15 Oct. Highest value at {fmtR(280000)}/year. You match 92% of criteria — the only gap is the entrepreneurial pitch, which can be prepped in 2 weeks. Full tuition + residence + stipend + laptop.
          </p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: '0.875rem' }}>Start application →</button>
        </div>
        <div className="card">
          <div className="eyebrow"><span className="dot" />AI commentary</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Stacking strategy</h3>
          <p className="body-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Apply to Allan Gray first. If awarded, you can decline lower-value bursaries with service contracts. If not awarded, Investec (88% match) + UCT Vice-Chancellor&apos;s together cover 89% of year-1 costs — stronger than any single source.
          </p>
        </div>
      </div>
    </div>
  );
}
