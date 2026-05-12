'use client';

import { useState } from 'react';
import { APPS } from '@/lib/data';

type Tab = 'all' | 'submitted' | 'pending' | 'accepted';

export default function ApplicationsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const displayed = (() => {
    if (tab === 'accepted') return APPS.filter(a => a.status === 'success');
    if (tab === 'pending') return APPS.filter(a => a.status === 'warning' || a.status === 'info');
    if (tab === 'submitted') return APPS.filter(a => a.submitted);
    return APPS;
  })();

  const selectedApp = APPS.find(a => a.id === selected);

  const statusLabel: Record<string, string> = {
    success: 'Accepted', warning: 'Pending', info: 'In review', destructive: 'Rejected',
  };

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Execute · Applications</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Tracking</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Applications</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              All active applications — university, NSFAS and bursaries. Track stage progress, decisions and required actions.
            </p>
          </div>
          <div className="row">
            <span className="badge success">1 accepted</span>
            <span className="badge warning">1 pending</span>
            <span className="badge info">1 review</span>
            <span className="badge destructive">1 rejected</span>
            <button className="btn btn-primary">+ Add application</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>All ({APPS.length})</button>
        <button className={`tab${tab === 'submitted' ? ' active' : ''}`} onClick={() => setTab('submitted')}>Submitted</button>
        <button className={`tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`tab${tab === 'accepted' ? ' active' : ''}`} onClick={() => setTab('accepted')}>Accepted</button>
      </div>

      <div className="grid-2 stack-3" style={{ gridTemplateColumns: selectedApp ? '1fr 1fr' : '1fr', alignItems: 'start' }}>
        <div className="stack">
          {displayed.map(a => (
            <div
              key={a.id ?? a.uni}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: selected === a.id ? 'hsl(var(--primary) / 0.5)' : undefined,
              }}
              onClick={() => setSelected(prev => prev === a.id ? null : a.id ?? null)}
            >
              <div className="row-between">
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{a.uni}</div>
                <span className={`badge ${a.status}`}>{a.label}</span>
              </div>
              <div className="caption" style={{ marginTop: '0.25rem' }}>{a.meta}</div>
              <div className="row" style={{ marginTop: '0.625rem', gap: '0.5rem', alignItems: 'center' }}>
                <div className="pipe-stages">
                  {a.stages.map((s, i) => (
                    <span key={i} className={`stage ${s}`} />
                  ))}
                </div>
                {a.submitted && (
                  <span className="caption" style={{ fontSize: '0.6875rem' }}>Submitted {a.submitted}</span>
                )}
                {a.fee && (
                  <span className="badge" style={{ marginLeft: 'auto', height: '1.25rem', fontSize: '0.6875rem' }}>{a.fee}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedApp && (
          <div className="card" style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Detail view</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>{selectedApp.short ?? selectedApp.uni}</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="stack-2">
              {[
                { l: 'Institution / programme', v: selectedApp.uni },
                { l: 'Status', v: statusLabel[selectedApp.status] },
                { l: 'Submitted', v: selectedApp.submitted ?? '—' },
                { l: 'Decision', v: selectedApp.decided ?? '—' },
                { l: 'Application fee', v: selectedApp.fee ?? '—' },
              ].map(row => (
                <div key={row.l} className="stat-pair">
                  <div className="l">{row.l}</div>
                  <div className="v" style={{ fontSize: '0.875rem' }}>{row.v}</div>
                </div>
              ))}
            </div>

            <hr className="divider" />

            <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.625rem' }}>Stage pipeline</div>
            <div className="pipe-stages" style={{ gap: 6 }}>
              {selectedApp.stages.map((s, i) => (
                <span key={i} className={`stage ${s}`} style={{ width: 32, height: 6 }} />
              ))}
            </div>
            {['Applied', 'Docs reviewed', 'Decision', 'Outcome'].map((label, i) => (
              <div key={label} className="row" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <span className={`stage ${selectedApp.stages[i] ?? ''}`} style={{ width: 14, height: 14, borderRadius: 999, flexShrink: 0 }} />
                <span className="caption" style={{ marginLeft: '0.5rem' }}>{label}</span>
                {selectedApp.stages[i] === 'done' && <span className="badge success" style={{ marginLeft: 'auto', height: '1.125rem', fontSize: '0.5625rem' }}>Done</span>}
                {selectedApp.stages[i] === 'active' && <span className="badge warning" style={{ marginLeft: 'auto', height: '1.125rem', fontSize: '0.5625rem' }}>Active</span>}
                {selectedApp.stages[i] === 'fail' && <span className="badge destructive" style={{ marginLeft: 'auto', height: '1.125rem', fontSize: '0.5625rem' }}>Failed</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
