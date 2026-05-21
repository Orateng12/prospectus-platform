'use client';

import { useState } from 'react';
import { APPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { Application, DbApplication, Programme, Route } from '@/lib/types';
import AddApplicationModal from '@/components/AddApplicationModal';

interface ApplicationsPageProps {
  applications?: DbApplication[];
  onOpenDetail?: (app: Application) => void;
  programmes?: Programme[];
  userAps?: number;
  householdIncome?: number;
  navigate?: (r: Route) => void;
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

function computeReadiness(app: Application, programmes: Programme[], userAps: number, income?: number): number {
  const portfolio = classifyApp(app, programmes, userAps);
  const apsScore = portfolio === 'safety' ? 90 : portfolio === 'target' ? 65 : portfolio === 'reach' ? 35 : 50;
  const fundingScore = income === undefined ? 60 : income <= 350_000 ? 85 : income <= 600_000 ? 55 : 30;
  return Math.round(apsScore * 0.6 + fundingScore * 0.4);
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage({ applications: dbApps, onOpenDetail, programmes = [], userAps = 0, householdIncome, navigate }: ApplicationsPageProps) {
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
          { l: 'Avg response',  v: (() => { const withDates = apps.filter(a => a.submitted && a.decided && !a.decided.startsWith('Deadline')); if (withDates.length === 0) return '—'; const avg = Math.round(withDates.reduce((sum, a) => { try { return sum + Math.abs(new Date(a.decided!).getTime() - new Date(a.submitted!).getTime()) / 86_400_000; } catch { return sum; } }, 0) / withDates.length); return isNaN(avg) || avg <= 0 ? '—' : `${avg}d`; })(), h: 'submitted → decision window', c: 'success' },
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
            {displayed.map(a => {
              const readiness = userAps > 0 && programmes.length > 0
                ? computeReadiness(a, programmes, userAps, householdIncome)
                : null;
              return (
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
                    <div className="row" style={{ gap: '0.375rem', flexShrink: 0, marginLeft: '0.5rem', alignItems: 'center' }}>
                      {readiness !== null && (
                        <span style={{
                          fontWeight: 900, fontVariantNumeric: 'tabular-nums', fontSize: '1rem',
                          color: readiness >= 75 ? 'hsl(var(--success))' : readiness >= 50 ? 'hsl(var(--fg))' : 'hsl(var(--warning))',
                        }}>
                          {readiness}<span className="caption" style={{ fontWeight: 600, fontSize: '0.5625rem' }}>/100</span>
                        </span>
                      )}
                      <span className={`badge ${a.status}`}>{a.label}</span>
                    </div>
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{a.meta}</div>
                  {readiness !== null && (
                    <div className="row" style={{ gap: '0.5rem', marginTop: '0.375rem', alignItems: 'center' }}>
                      <span className="caption" style={{ fontSize: '0.6875rem', flexShrink: 0 }}>Readiness</span>
                      <div className="meter" style={{ flex: 1, height: 5 }}>
                        <i style={{ width: `${readiness}%`, background: `hsl(var(--${readiness >= 75 ? 'success' : readiness >= 50 ? 'primary' : 'warning'}))` }} />
                      </div>
                    </div>
                  )}
                  <div className="row" style={{ marginTop: '0.5rem', gap: '0.5rem', alignItems: 'center' }}>
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
              );
            })}

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
        <div className="grid-2 stack-3" style={{ marginTop: '1.25rem' }}>
          <div className="card">
            <div className="eyebrow"><span className="dot" />Stage breakdown</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Where things are</h3>
            <div className="stack" style={{ marginTop: '0.875rem' }}>
              {([
                ['Eligibility check',  100] as const,
                ['Submit application', apps.filter(a => a.submitted).length > 0 ? Math.round(apps.filter(a => a.submitted).length / apps.length * 100) : 75] as const,
                ['Document upload',    50] as const,
                ['Decision received',  counts.accepted + apps.filter(a => a.status === 'destructive').length > 0 ? Math.round((counts.accepted + apps.filter(a => a.status === 'destructive').length) / apps.length * 100) : 25] as const,
              ] as [string, number][]).map(([l, v]) => (
                <div key={l} className="progress-row">
                  <span className="label">{l}</span>
                  <div className="meter"><i style={{ width: `${v}%` }} /></div>
                  <span className="val">{v}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow"><span className="dot" />Advisor note</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What to do next</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {counts.rejected > 0
                ? 'A rejection is recoverable — the extended pathway at the same faculty often has a higher acceptance rate at your APS. Consider the foundation year option.'
                : counts.accepted > 0
                ? `You have ${counts.accepted} accepted offer${counts.accepted > 1 ? 's' : ''}. Confirm your place and apply for residence before the deadline.`
                : counts.pending > 0
                ? 'Applications are in review. Use this time to prepare supporting documents and ensure your document vault is complete.'
                : 'No applications yet. Start with your highest-fit programme and apply before the first closing date.'}
            </p>
            {counts.rejected > 0 && (
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.75rem' }}
                onClick={() => navigate?.('programmes')}
              >
                Review extended pathways →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fallback programme suggestions — shown when there are rejections */}
      {(() => {
        const fallbacks = fallbackProgrammes(apps, programmes, userAps);
        if (fallbacks.length === 0) return null;
        return (
          <div className="card" style={{ marginTop: '1.25rem', borderLeft: '3px solid hsl(var(--warning))' }}>
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Recovery options</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                  Alternative programmes within your APS range
                </h3>
                <p className="caption" style={{ marginTop: '0.25rem' }}>
                  Based on your rejections, here are similar-fit programmes you haven&apos;t applied to yet.
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate?.('programmes')}>
                Browse all →
              </button>
            </div>
            <div className="stack">
              {fallbacks.map(p => (
                <button
                  key={p.id}
                  className="prog-row"
                  onClick={() => navigate?.('programmes')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div className="caption" style={{ marginTop: 2 }}>
                      {p.uni} · APS {p.aps} · {fmtR(p.fees)} / yr · {p.dur} years
                    </div>
                  </div>
                  <span className={`badge ${p.pathway}`}>
                    {p.pathway[0].toUpperCase() + p.pathway.slice(1)}
                  </span>
                  <div className="fit">
                    <span className="n">{p.fit}</span>
                    <span className="caption">fit</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
