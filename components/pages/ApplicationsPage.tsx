'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { APPS } from '@/lib/data';
import type { Application, DbApplication, Programme } from '@/lib/types';
import { saveApplication } from '@/app/actions/saveApplication';

interface ApplicationsPageProps {
  applications?: DbApplication[];
  onOpenDetail?: (app: Application) => void;
  programmes?: Programme[];
  userAps?: number;
}

type Portfolio = 'safety' | 'target' | 'reach' | 'unknown';

function classifyApp(app: Application, programmes: Programme[], userAps: number): Portfolio {
  const progName = app.uni.includes('·') ? app.uni.split('·').slice(1).join('·').trim() : app.uni;
  const matched = programmes.find(p =>
    p.name.toLowerCase() === progName.toLowerCase() ||
    app.uni.toLowerCase().includes(p.name.toLowerCase()),
  );
  if (!matched) return 'unknown';
  const gap = userAps - matched.aps;
  if (gap >= 5) return 'safety';
  if (gap >= -3) return 'target';
  return 'reach';
}

function fallbackProgrammes(apps: Application[], programmes: Programme[], userAps: number): Programme[] {
  const rejectedNames = apps
    .filter(a => a.status === 'destructive')
    .map(a => a.uni.includes('·') ? a.uni.split('·').slice(1).join('·').trim().toLowerCase() : a.uni.toLowerCase());

  if (rejectedNames.length === 0 || userAps === 0) return [];

  return programmes
    .filter(p => p.aps <= userAps + 2 && p.aps >= userAps - 8)
    .filter(p => !rejectedNames.some(n => p.name.toLowerCase().includes(n) || n.includes(p.name.toLowerCase())))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 3);
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

// ── Add-application modal ────────────────────────────────────────────────────

function AddApplicationModal({
  programmes,
  onClose,
  onAdded,
}: {
  programmes: Programme[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Programme | null>(null);
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = query.trim()
    ? programmes.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.uni.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 8)
    : programmes.slice(0, 8);

  async function handleAdd() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    const result = await saveApplication(selected.id, selected.name, selected.uni, deadline || undefined);
    setSaving(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      router.refresh();
      onAdded();
      onClose();
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'hsl(var(--bg) / 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: '28rem', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <h3 className="subheading">Add application</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>Search programme or institution</div>
          <input
            className="input"
            style={{ width: '100%' }}
            placeholder="e.g. Computer Science, UCT…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            autoFocus
          />
        </div>

        <div className="stack" style={{ marginBottom: '0.875rem', maxHeight: '14rem', overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div className="caption" style={{ padding: '0.5rem', textAlign: 'center' }}>No programmes found.</div>
          )}
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                padding: '0.5rem 0.625rem',
                borderRadius: 6,
                cursor: 'pointer',
                background: selected?.id === p.id ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                border: selected?.id === p.id ? '1px solid hsl(var(--primary) / 0.4)' : '1px solid transparent',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
              <div className="caption" style={{ fontSize: '0.75rem' }}>{p.uni} · APS {p.aps}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>Application deadline (optional)</div>
          <input
            className="input"
            type="date"
            style={{ width: '100%' }}
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', marginBottom: '0.625rem' }}>{error}</p>}

        <div className="row" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!selected || saving}
            onClick={handleAdd}
          >
            {saving ? 'Adding…' : 'Add application'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage({ applications: dbApps, onOpenDetail, programmes = [], userAps = 0 }: ApplicationsPageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const apps: Application[] = dbApps === undefined ? APPS : dbApps.map(dbToApp);

  const counts = {
    accepted: apps.filter(a => a.status === 'success').length,
    pending:  apps.filter(a => a.status === 'warning').length,
    review:   apps.filter(a => a.status === 'info').length,
    rejected: apps.filter(a => a.status === 'destructive').length,
  };

  const displayed = (() => {
    if (tab === 'accepted')  return apps.filter(a => a.status === 'success');
    if (tab === 'pending')   return apps.filter(a => a.status === 'warning' || a.status === 'info');
    if (tab === 'submitted') return apps.filter(a => !!a.submitted);
    return apps;
  })();

  const selectedApp = apps.find(a => a.id === selected);

  const statusLabel: Record<string, string> = {
    success: 'Accepted', warning: 'Pending', info: 'In review', destructive: 'Rejected',
  };

  const portfolio = userAps > 0 && programmes.length > 0
    ? {
        safety:  apps.filter(a => classifyApp(a, programmes, userAps) === 'safety').length,
        target:  apps.filter(a => classifyApp(a, programmes, userAps) === 'target').length,
        reach:   apps.filter(a => classifyApp(a, programmes, userAps) === 'reach').length,
        unknown: apps.filter(a => classifyApp(a, programmes, userAps) === 'unknown').length,
      }
    : null;

  const fallbacks = fallbackProgrammes(apps, programmes, userAps);

  return (
    <div className="page-anim">
      {showAddModal && programmes.length > 0 && (
        <AddApplicationModal
          programmes={programmes}
          onClose={() => setShowAddModal(false)}
          onAdded={() => setShowAddModal(false)}
        />
      )}

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
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add application
            </button>
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        {[
          { l: 'Submitted',     v: String(apps.filter(a => a.submitted).length || apps.length), h: `of ${apps.length} total`,               c: '' },
          { l: 'Accepted',      v: String(counts.accepted),                                     h: counts.accepted > 0 ? 'Confirmed offer' : 'Awaiting decisions', c: counts.accepted > 0 ? 'success' : '' },
          { l: 'Pending',       v: String(counts.pending + counts.review),                      h: 'awaiting response',                      c: counts.pending + counts.review > 0 ? 'warning' : '' },
          { l: 'Avg response',  v: '11 days',                                                   h: 'industry avg: 21 days',                  c: 'success' },
        ].map(({ l, v, h, c }) => (
          <div className="card kpi" key={l}>
            <div className="lbl">{l}</div>
            <div className="val" style={c ? { color: `hsl(var(--${c}))` } : {}}>{v}</div>
            <div className="hint">{h}</div>
          </div>
        ))}
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
            Add applications from the Programme Explorer or click &ldquo;+ Add application&rdquo; above.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add application</button>
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

      {apps.length > 0 && (
        <div className="stack" style={{ marginTop: '1.25rem', gap: '1rem' }}>

          {/* Portfolio balance */}
          {portfolio && (
            <div className="card">
              <div className="row-between" style={{ marginBottom: '0.875rem' }}>
                <div>
                  <div className="eyebrow"><span className="dot" />Portfolio balance</div>
                  <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Safety · Target · Reach distribution</h3>
                </div>
                <span className="caption" style={{ fontSize: '0.75rem' }}>APS {userAps}</span>
              </div>
              <div className="grid-3" style={{ gap: '0.625rem', marginBottom: '0.875rem' }}>
                {[
                  {
                    label: 'Safety',
                    count: portfolio.safety,
                    desc: 'Your APS ≥ programme APS + 5',
                    target: 2,
                    color: 'success',
                  },
                  {
                    label: 'Target',
                    count: portfolio.target,
                    desc: 'Your APS within ±3 of requirement',
                    target: 2,
                    color: 'primary',
                  },
                  {
                    label: 'Reach',
                    count: portfolio.reach,
                    desc: 'Programme APS > your APS + 3',
                    target: 1,
                    color: 'warning',
                  },
                ].map(({ label, count, desc, target, color }) => {
                  const ok = count >= target;
                  return (
                    <div key={label} style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--r-md)',
                      background: ok ? `hsl(var(--${color}) / 0.06)` : 'hsl(var(--destructive) / 0.04)',
                      border: `1px solid hsl(var(--${ok ? color : 'destructive'}) / 0.25)`,
                    }}>
                      <div className="row-between">
                        <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{label}</span>
                        <span style={{
                          fontWeight: 900, fontSize: '1.5rem', lineHeight: 1,
                          color: `hsl(var(--${ok ? color : 'destructive'}))`,
                          fontVariantNumeric: 'tabular-nums',
                        }}>{count}</span>
                      </div>
                      <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>{desc}</div>
                      {!ok && (
                        <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.375rem', color: `hsl(var(--destructive))` }}>
                          Add {target - count} more {label.toLowerCase()} app{target - count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {portfolio.unknown > 0 && (
                <div className="caption" style={{ fontSize: '0.75rem' }}>
                  {portfolio.unknown} application{portfolio.unknown > 1 ? 's' : ''} could not be matched to a programme — APS classification unavailable for these.
                </div>
              )}
              {portfolio.safety < 2 && (
                <div style={{
                  marginTop: '0.625rem', padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--r-md)', background: 'hsl(var(--warning) / 0.08)',
                  border: '1px solid hsl(var(--warning) / 0.3)', fontSize: '0.8125rem', lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700 }}>Portfolio risk: </span>
                  You need at least 2 safety applications (programmes where your APS is 5+ above the minimum). This protects you from rejection cascades if competitive programmes are oversubscribed this cycle.
                </div>
              )}
            </div>
          )}

          <div className="grid-2 stack-3">
            <div className="card">
              <div className="eyebrow"><span className="dot" />Stage breakdown</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Where things are</h3>
              <div className="stack" style={{ marginTop: '0.875rem' }}>
                {[
                  ['Eligibility check',   100],
                  ['Submit application',  apps.filter(a => a.submitted).length > 0 ? Math.round(apps.filter(a => a.submitted).length / apps.length * 100) : 75],
                  ['Document upload',     50],
                  ['Decision received',   counts.accepted + (apps.filter(a => a.status === 'destructive').length) > 0 ? Math.round((counts.accepted + apps.filter(a => a.status === 'destructive').length) / apps.length * 100) : 25],
                ].map(([l, v]) => (
                  <div key={l} className="progress-row">
                    <span className="label">{l}</span>
                    <div className="meter"><i style={{ width: `${v}%` }} /></div>
                    <span className="val">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="eyebrow"><span className="dot" />Next steps</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What to do now</h3>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {counts.rejected > 0
                  ? 'A rejection is recoverable. The extended/foundation pathway at the same faculty often accepts students 2–4 APS points below the direct entry cut-off.'
                  : counts.accepted > 0
                  ? `You have ${counts.accepted} accepted offer${counts.accepted > 1 ? 's' : ''}. Confirm your place and apply for residence before the deadline.`
                  : counts.pending > 0
                  ? 'Applications are in review. Use this time to prepare supporting documents and ensure your document vault is complete.'
                  : 'No applications yet. Start with your highest-fit programme and apply before the first closing date.'}
              </p>
              {fallbacks.length > 0 && (
                <div style={{ marginTop: '0.875rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                    Alternative programmes at your APS:
                  </div>
                  <div className="stack">
                    {fallbacks.map(p => (
                      <div key={p.id} style={{
                        padding: '0.5rem 0.625rem',
                        borderRadius: 6,
                        background: 'hsl(var(--muted) / 0.5)',
                        border: '1px solid hsl(var(--border))',
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{p.name}</div>
                        <div className="caption" style={{ fontSize: '0.6875rem' }}>
                          {p.uni} · APS {p.aps} · {p.demand} demand
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
