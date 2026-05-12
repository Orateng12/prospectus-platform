'use client';

import type { Application, Route } from '@/lib/types';

interface ApplicationDetailPageProps {
  application: Application | null;
  navigate: (r: Route) => void;
}

const STAGE_LABELS = ['Applied', 'Docs reviewed', 'Decision', 'Outcome'];

const DOCS = [
  { label: 'Certified ID copy', done: true },
  { label: 'NSC certificate / statement of results', done: true },
  { label: 'Proof of household income', done: false },
  { label: 'Academic transcript', done: true },
  { label: 'Application fee proof of payment', done: false },
];

const STATUS_BADGE: Record<string, string> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  destructive: 'destructive',
};

export default function ApplicationDetailPage({ application, navigate }: ApplicationDetailPageProps) {
  if (!application) {
    return (
      <div className="page-anim">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="subheading" style={{ marginBottom: '0.75rem' }}>No application selected</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('applications')}>← Back to applications</button>
        </div>
      </div>
    );
  }

  const submitted = application.submitted ?? 'Unknown';
  const commsLog = [
    { date: submitted, title: 'Application received', body: 'Your application has been received and is queued for processing.' },
    { date: application.decided ?? submitted, title: 'Documents under review', body: 'Your supporting documents are being reviewed. Allow 3–5 working days.' },
    { date: application.decided ?? '—', title: 'Decision communicated', body: 'See your application status above for the current outcome.' },
  ];

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Execute · Applications · Detail</div>
        <div className="row-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '0.5rem', padding: 0, fontSize: '0.8125rem' }}
              onClick={() => navigate('applications')}
            >
              ← Back to applications
            </button>
            <div className="eyebrow"><span className="dot" />Application detail</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{application.short ?? application.uni}</h2>
            <div className="caption" style={{ marginTop: '0.25rem' }}>{application.meta}</div>
          </div>
          <div className="row">
            <span className={`badge ${STATUS_BADGE[application.status] ?? 'info'}`} style={{ fontSize: '0.8125rem', height: '1.875rem' }}>
              {application.label}
            </span>
            {application.submitted && (
              <span className="badge" style={{ height: '1.875rem', fontSize: '0.75rem' }}>Submitted {application.submitted}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Stage timeline */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Stage timeline</div>
          <div className="stack-2">
            {STAGE_LABELS.map((label, i) => {
              const stageVal = application.stages[i] ?? '';
              return (
                <div key={label} className="row" style={{ gap: '0.875rem', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.125rem', alignSelf: 'stretch' }}>
                    <span
                      className={`stage ${stageVal}`}
                      style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: 'block' }}
                    />
                    {i < STAGE_LABELS.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 20, background: 'hsl(var(--border))', marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < STAGE_LABELS.length - 1 ? '0.5rem' : 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                    {stageVal === 'done' && <span className="badge success" style={{ height: '1.125rem', fontSize: '0.5625rem', marginTop: '0.25rem' }}>Done</span>}
                    {stageVal === 'active' && <span className="badge warning" style={{ height: '1.125rem', fontSize: '0.5625rem', marginTop: '0.25rem' }}>In progress</span>}
                    {stageVal === 'fail' && <span className="badge destructive" style={{ height: '1.125rem', fontSize: '0.5625rem', marginTop: '0.25rem' }}>Unsuccessful</span>}
                    {stageVal === '' && <span className="caption" style={{ fontSize: '0.6875rem' }}>Pending</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="divider" />

          <div className="stack-2" style={{ marginTop: '0.25rem' }}>
            {[
              { l: 'Institution', v: application.uni },
              { l: 'Submitted', v: application.submitted ?? '—' },
              { l: 'Decision', v: application.decided ?? '—' },
              { l: 'Application fee', v: application.fee ?? '—' },
            ].map(row => (
              <div key={row.l} className="stat-pair">
                <div className="l">{row.l}</div>
                <div className="v" style={{ fontSize: '0.875rem' }}>{row.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stack-3">
          {/* Document checklist */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Document checklist</div>
            <div className="stack-2">
              {DOCS.map(doc => (
                <div key={doc.label} className="row" style={{ gap: '0.75rem' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid hsl(var(--${doc.done ? 'success' : 'border'}))`,
                    background: doc.done ? 'hsl(var(--success) / 0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', color: 'hsl(var(--success))', fontWeight: 800,
                  }}>
                    {doc.done ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: doc.done ? 400 : 600, opacity: doc.done ? 0.7 : 1 }}>
                    {doc.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="caption" style={{ marginTop: '0.875rem', fontSize: '0.6875rem' }}>
              {DOCS.filter(d => d.done).length}/{DOCS.length} documents submitted
            </div>
          </div>

          {/* Communications log */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Communications log</div>
            <div className="stack">
              {commsLog.map((entry, i) => (
                <div key={i} style={{ paddingBottom: '0.875rem', borderBottom: i < commsLog.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                  <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{entry.title}</span>
                    <span className="caption" style={{ fontSize: '0.6875rem' }}>{entry.date}</span>
                  </div>
                  <p className="body-text" style={{ fontSize: '0.8125rem', margin: 0 }}>{entry.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
