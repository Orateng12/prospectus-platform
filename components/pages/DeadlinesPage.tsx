'use client';

import { DEADLINES } from '@/lib/data';
import type { Route, DbApplication } from '@/lib/types';

const EXTRA_DEADLINES = [
  { d: 15, m: 'Oct', t: 'Allan Gray Orbis Foundation', sub: '161 days · entrepreneurial essay required', tag: 'info', tagL: 'Open' },
  { d: 30, m: 'Sep', t: 'Investec Bursary application', sub: '146 days · supporting docs required', tag: '', tagL: 'Open' },
  { d: 30, m: 'Aug', t: 'Standard Bank Bursary', sub: '115 days', tag: '', tagL: 'Open' },
];

function urgencyGroup(tag: string): 'urgent' | 'soon' | 'upcoming' {
  if (tag === 'destructive') return 'urgent';
  if (tag === 'warning') return 'soon';
  return 'upcoming';
}

export default function DeadlinesPage({
  navigate,
  applications = [],
}: {
  navigate?: (r: Route) => void;
  applications?: DbApplication[];
}) {
  const today = new Date();
  const APP_DEADLINES = applications
    .filter(a => a.deadline)
    .map(a => {
      const date     = new Date(a.deadline!);
      const daysLeft = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const tag      = daysLeft <= 7 ? 'destructive' : daysLeft <= 21 ? 'warning' : '';
      const tagL     = daysLeft <= 7 ? 'Urgent' : daysLeft <= 21 ? 'Soon' : 'Open';
      return {
        d:    date.getDate(),
        m:    date.toLocaleDateString('en-ZA', { month: 'short' }),
        t:    `${a.institution_name} · ${a.programme_name}`,
        sub:  `${daysLeft > 0 ? `${daysLeft} days` : 'Today'} · application deadline`,
        tag,
        tagL,
      };
    });

  const ALL_DEADLINES = [...DEADLINES, ...EXTRA_DEADLINES, ...APP_DEADLINES];

  const urgent = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'urgent');
  const soon = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'soon');
  const upcoming = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'upcoming');

  function DeadlineList({ items }: { items: typeof ALL_DEADLINES }) {
    return (
      <div className="stack">
        {items.map(d => (
          <div key={d.t} className="deadline">
            <div className="dl-date">
              <span className="d">{d.d}</span>
              <span className="m">{d.m}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.t}</div>
              <div className="caption" style={{ marginTop: 1 }}>{d.sub}</div>
            </div>
            <span className={`badge ${d.tag || 'info'}`}>{d.tagL}</span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '0 0.5rem' }}
              onClick={() => d.tag === 'destructive' ? navigate?.('documents') : undefined}
              title={d.tag === 'destructive' ? 'Open documents' : 'Add to calendar'}
            >
              +
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Execute · Deadlines</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Timeline</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Deadlines</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              All upcoming deadlines across applications, funding and documentation — grouped by urgency.
            </p>
          </div>
          <div className="row">
            {urgent.length > 0 && <span className="badge destructive">{urgent.length} urgent</span>}
            {soon.length > 0 && <span className="badge warning">{soon.length} soon</span>}
            <button className="btn btn-primary">Add deadline</button>
          </div>
        </div>
      </div>

      <div className="stack-3">
        {urgent.length > 0 && (
          <div>
            <div className="sec">
              <h3 style={{ color: 'hsl(var(--destructive))' }}>Urgent · &lt; 7 days</h3>
              <span className="badge destructive">{urgent.length}</span>
            </div>
            <div className="card" style={{ borderColor: 'hsl(var(--destructive) / 0.3)', background: 'hsl(var(--destructive) / 0.03)' }}>
              <DeadlineList items={urgent} />
            </div>
          </div>
        )}

        {soon.length > 0 && (
          <div>
            <div className="sec">
              <h3>Soon · 8 – 21 days</h3>
              <span className="badge warning">{soon.length}</span>
            </div>
            <div className="card" style={{ borderColor: 'hsl(var(--warning) / 0.3)' }}>
              <DeadlineList items={soon} />
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div className="sec">
              <h3>Upcoming</h3>
              <span className="badge">{upcoming.length}</span>
            </div>
            <div className="card">
              <DeadlineList items={upcoming} />
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="eyebrow"><span className="dot" />AI reminder</div>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', lineHeight: 1.6, color: 'hsl(var(--fg))' }}>
          Your most critical deadline is <strong>NSFAS supporting docs in 2 days</strong>. Missing this window pushes your funding application to next year&apos;s cycle. ID copy + household income proof are the two outstanding items — both are in your Documents vault marked as uploaded.
        </p>
        <div className="row" style={{ marginTop: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate?.('nsfas')}>Open NSFAS portal</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate?.('documents')}>View documents</button>
        </div>
      </div>
    </div>
  );
}
