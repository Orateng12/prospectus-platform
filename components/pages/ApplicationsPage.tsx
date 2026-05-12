'use client';

import { useState } from 'react';
import { APPS } from '@/lib/data';
import type { Application, DbApplication } from '@/lib/types';

interface ApplicationsPageProps {
  // When provided: real data from Supabase.
  // undefined → no real data yet, fall back to mock APPS.
  // [] (empty array) → explicitly empty (e.g. emptyMode).
  applications?: DbApplication[];
  onOpenDetail?: (app: Application) => void;
}

type Tab = 'all' | 'submitted' | 'pending' | 'accepted';

// ── DbApplication → Application shape ───────────────────────────────────────

function statusToStages(status: string): Application['stages'] {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'offer')    return ['done', 'done', 'done', 'done'];
  if (s === 'rejected' || s === 'declined') return ['done', 'done', 'fail', ''];
  if (s === 'pending')                       return ['done', 'done', 'active', ''];
  return ['done', 'active', '', ''];
}

function statusToBadge(status: string): Application['status'] {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'offer')    return 'success';
  if (s === 'rejected' || s === 'declined') return 'destructive';
  if (s === 'pending' || s === 'submitted') return 'warning';
  return 'info';
}

function statusToLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'offer')    return 'Accepted';
  if (s === 'rejected' || s === 'declined') return 'Rejected';
  if (s === 'pending')                       return 'Pending';
  if (s === 'submitted')                     return 'Submitted';
  return 'In review';
}

function fmtDate(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dbToApp(a: DbApplication): Application {
  const submittedShort = a.applied_at
    ? new Date(a.applied_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
    : null;
  const deadlineShort = a.deadline
    ? new Date(a.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
    : null;

  return {
    id: a.id,
    uni: `${a.institution_name} · ${a.programme_name}`,
    short: a.institution_name,
    meta: submittedShort
      ? `Submitted ${submittedShort}${deadlineShort ? ` · Deadline ${deadlineShort}` : ''}`
      : deadlineShort
        ? `Deadline ${deadlineShort}`
        : 'Draft application',
    stages: statusToStages(a.status),
    status: statusToBadge(a.status),
    label: statusToLabel(a.status),
    submitted: fmtDate(a.applied_at),
    decided: a.outcome ?? (a.deadline ? `Deadline ${fmtDate(a.deadline)}` : undefined),
    fee: undefined,
    progId: undefined,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ApplicationsPage({ applications: dbApps, onOpenDetail }: ApplicationsPageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<string | null>(null);

  // undefined = no real apps yet → show rich mock data for demo/new users
  // [] = explicitly empty (emptyMode) → show empty state
  // [...] = real data → convert and show
  const apps: Application[] = dbApps === undefined ? APPS : dbApps.map(dbToApp);

  // Compute status counts from actual data
  const counts = {
    accepted: apps.filter(a => a.status === 'success').length,
    pending:  apps.filter(a => a.status === 'warning').length,
    review:   apps.filter(a => a.status === 'info').length,
    rejected: apps.filter(a => a.status === 'destructive').length,
  };

  const displayed = (() => {
    if (tab === 'accepted') return apps.filter(a => a.status === 'success');
    if (tab === 'pending')  return apps.filter(a => a.status === 'warning' || a.status === 'info');
    if (tab === 'submitted') return apps.filter(a => !!a.submitted);
    return apps;
  })();

  const selectedApp = apps.find(a => a.id === selected);

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
          <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.375rem' }}>
            {counts.accepted > 0 && <span className="badge success">{counts.accepted} accepted</span>}
            {counts.pending  > 0 && <span className="badge warning">{counts.pending} pending</span>}
            {counts.review   > 0 && <span className="badge info">{counts.review} review</span>}
            {counts.rejected > 0 && <span className="badge destructive">{counts.rejected} rejected</span>}
            <button className="btn btn-primary">+ Add application</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'all'       ? ' active' : ''}`} onClick={() => setTab('all')}>All ({apps.length})</button>
        <button className={`tab${tab === 'submitted' ? ' active' : ''}`} onClick={() => setTab('submitted')}>Submitted</button>
        <button className={`tab${tab === 'pending'   ? ' active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`tab${tab === 'accepted'  ? ' active' : ''}`} onClick={() => setTab('accepted')}>Accepted</button>
      </div>

      {apps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
          <div className="subheading" style={{ marginBottom: '0.5rem' }}>No applications yet</div>
          <p className="body-text" style={{ maxWidth: '28rem', margin: '0 auto 1rem' }}>
            Add applications from the Programme Explorer — open any programme and click &ldquo;Add to applications&rdquo;.
          </p>
        </div>
      ) : (
        <div className="app-grid grid-2 stack-3" style={{ gridTemplateColumns: selectedApp ? '1fr 1fr' : '1fr', alignItems: 'start' }}>
          <div className="stack">
            {displayed.map(a => (
              <div
                key={a.id ?? a.uni}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: selected === a.id ? 'hsl(var(--primary) / 0.5)' : undefined,
                }}
                onClick={() => {
                  if (onOpenDetail) {
                    onOpenDetail(a);
                  } else {
                    setSelected(prev => prev === a.id ? null : a.id ?? null);
                  }
                }}
              >
                <div className="row-between">
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.uni}</div>
                  <span className={`badge ${a.status}`} style={{ flexShrink: 0, marginLeft: '0.5rem' }}>{a.label}</span>
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

            {displayed.length === 0 && apps.length > 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-fg))' }}>
                No applications match this filter.
              </div>
            )}
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
                  { l: 'Status',                  v: statusLabel[selectedApp.status] },
                  { l: 'Submitted',               v: selectedApp.submitted ?? '—' },
                  { l: 'Decision',                v: selectedApp.decided ?? '—' },
                  { l: 'Application fee',         v: selectedApp.fee ?? '—' },
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
                  {selectedApp.stages[i] === 'done'   && <span className="badge success"     style={{ marginLeft: 'auto', height: '1.125rem', fontSize: '0.5625rem' }}>Done</span>}
                  {selectedApp.stages[i] === 'active' && <span className="badge warning"     style={{ marginLeft: 'auto', height: '1.125rem', fontSize: '0.5625rem' }}>Active</span>}
                  {selectedApp.stages[i] === 'fail'   && <span className="badge destructive" style={{ marginLeft: 'auto', height: '1.125rem', fontSize: '0.5625rem' }}>Failed</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
