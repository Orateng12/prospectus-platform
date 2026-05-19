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
  navigate?: (r: import('@/lib/types').Route) => void;
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

export default function ApplicationsPage({ applications: dbApps, onOpenDetail, programmes = [], userAps, navigate }: ApplicationsPageProps) {
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

  // Portfolio analysis — classify each application as safety/target/reach
  const progApsMap = new Map(programmes.map(p => [p.name.toLowerCase(), p.aps]));
  const rawDbApps = dbApps ?? [];
  interface AppClassified { app: DbApplication; apsReq: number | null; tier: 'safety' | 'target' | 'reach' | 'unknown' }
  const classified: AppClassified[] = rawDbApps.map(a => {
    const apsReq = progApsMap.get(a.programme_name.toLowerCase()) ?? null;
    const u = userAps ?? 0;
    const tier = apsReq === null ? 'unknown'
      : apsReq <= u - 4 ? 'safety'
      : apsReq <= u + 2 ? 'target'
      : 'reach';
    return { app: a, apsReq, tier };
  });
  const tierCounts = {
    safety:  classified.filter(c => c.tier === 'safety').length,
    target:  classified.filter(c => c.tier === 'target').length,
    reach:   classified.filter(c => c.tier === 'reach').length,
    unknown: classified.filter(c => c.tier === 'unknown').length,
  };

  // Deadlines — upcoming within 60 days
  const today = Date.now();
  const upcomingDeadlines = rawDbApps
    .filter(a => a.deadline && ['draft', 'submitted', 'pending'].includes(a.status.toLowerCase()))
    .map(a => ({ name: a.programme_name, institution: a.institution_name, deadline: new Date(a.deadline!), daysLeft: Math.ceil((new Date(a.deadline!).getTime() - today) / 86_400_000) }))
    .filter(a => a.daysLeft >= 0 && a.daysLeft <= 60)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  const hasPortfolioData = userAps !== undefined && rawDbApps.length > 0 && tierCounts.unknown < rawDbApps.length;
  const portfolioWarning = hasPortfolioData && tierCounts.safety === 0 && (tierCounts.reach > 0 || tierCounts.target > 0)
    ? `No safety applications — all current programmes require APS close to or above your score. Consider adding a programme with APS ≤ ${(userAps ?? 0) - 4} as insurance.`
    : hasPortfolioData && tierCounts.reach === 0 && tierCounts.target === 0 && tierCounts.safety > 0
    ? 'All safety applications — good for acceptance rate but consider adding a target programme for upside.'
    : null;

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

      <div className="tabs">
        <button className={`tab${tab === 'all'       ? ' active' : ''}`} onClick={() => setTab('all')}>All ({apps.length})</button>
        <button className={`tab${tab === 'submitted' ? ' active' : ''}`} onClick={() => setTab('submitted')}>Submitted</button>
        <button className={`tab${tab === 'pending'   ? ' active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`tab${tab === 'accepted'  ? ' active' : ''}`} onClick={() => setTab('accepted')}>Accepted</button>
      </div>

      {/* Portfolio analysis */}
      {(hasPortfolioData || upcomingDeadlines.length > 0) && (
        <div className="grid-2" style={{ marginBottom: '1.25rem', alignItems: 'start' }}>
          {hasPortfolioData && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Portfolio balance</div>
              <div className="row" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                  { label: 'Safety',  count: tierCounts.safety,  color: 'success',     tip: `APS ≤ ${(userAps ?? 0) - 4}` },
                  { label: 'Target',  count: tierCounts.target,  color: 'warning',     tip: `APS ${(userAps ?? 0) - 3}–${(userAps ?? 0) + 2}` },
                  { label: 'Reach',   count: tierCounts.reach,   color: 'destructive', tip: `APS > ${(userAps ?? 0) + 2}` },
                ].map(t => (
                  <div key={t.label} className="card compact" style={{ flex: 1, textAlign: 'center', padding: '0.625rem' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', color: `hsl(var(--${t.color}))` }}>{t.count}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', marginTop: '0.125rem' }}>{t.label}</div>
                    <div className="caption" style={{ fontSize: '0.625rem', marginTop: '0.125rem' }}>{t.tip}</div>
                  </div>
                ))}
              </div>
              {portfolioWarning ? (
                <div className="insight" style={{ borderColor: 'hsl(var(--warning) / 0.4)', background: 'hsl(var(--warning) / 0.06)' }}>
                  <p className="body-text" style={{ fontSize: '0.8125rem', margin: 0 }}>⚠ {portfolioWarning}</p>
                  {navigate && (
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '0.625rem' }} onClick={() => navigate('programmes')}>
                      Browse programmes →
                    </button>
                  )}
                </div>
              ) : (
                <p className="caption" style={{ fontSize: '0.75rem' }}>
                  {tierCounts.safety > 0 && tierCounts.target > 0
                    ? 'Good mix — you have both safety and target programmes.'
                    : 'Portfolio analysis based on your APS vs. programme requirements.'}
                </p>
              )}
            </div>
          )}

          {upcomingDeadlines.length > 0 && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Upcoming deadlines</div>
              <div className="stack">
                {upcomingDeadlines.map(d => (
                  <div key={`${d.institution}-${d.name}`} style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div className="row-between">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.name}</div>
                        <div className="caption" style={{ marginTop: '0.125rem' }}>{d.institution}</div>
                      </div>
                      <span className={`badge ${d.daysLeft <= 7 ? 'destructive' : d.daysLeft <= 21 ? 'warning' : 'info'}`}>
                        {d.daysLeft === 0 ? 'Today' : `${d.daysLeft}d`}
                      </span>
                    </div>
                    <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                      {d.deadline.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}
                      {d.daysLeft <= 7 && ' — urgent'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
