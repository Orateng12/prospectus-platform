'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Application, Route } from '@/lib/types';
import { updateApplication } from '@/app/actions/updateApplication';
import { deleteApplication } from '@/app/actions/deleteApplication';

interface ApplicationDetailPageProps {
  application: Application | null;
  navigate: (r: Route) => void;
}

const STAGE_LABELS = ['Applied', 'Docs reviewed', 'Decision', 'Outcome'];

const STATUS_BADGE: Record<string, string> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  destructive: 'destructive',
};

function deriveStages(app: Application): Array<'done' | 'active' | 'fail' | ''> {
  if (app.status === 'success')     return ['done', 'done', 'done', 'done'];
  if (app.status === 'destructive') return ['done', 'done', 'fail', ''];
  if (app.status === 'info')        return ['done', 'done', 'active', ''];
  if (app.status === 'warning')     return ['done', 'active', '', ''];
  if (app.decided)                  return ['done', 'done', 'active', ''];
  if (app.submitted)                return ['done', 'active', '', ''];
  return ['active', '', '', ''];
}

function buildDocs(app: Application): Array<{ label: string; done: boolean }> {
  const submitted = !!app.submitted;
  const accepted  = app.status === 'success';
  return [
    { label: 'Certified ID copy',                      done: submitted || accepted },
    { label: 'NSC certificate / statement of results', done: submitted || accepted },
    { label: 'Academic transcript',                    done: submitted || accepted },
    { label: 'Proof of household income',              done: accepted },
    { label: 'Application fee proof of payment',       done: accepted },
  ];
}

function fmtDate(d: string | undefined): string {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ApplicationDetailPage({ application, navigate }: ApplicationDetailPageProps) {
  const router = useRouter();
  const [actioning, setActioning] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState(application?.label ?? '');

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

  const stages = application.stages?.some(s => s !== '') ? application.stages : deriveStages(application);
  const docs = buildDocs(application);

  const docsReviewDate = application.submitted
    ? new Date(new Date(application.submitted).getTime() + 3 * 86_400_000).toISOString()
    : undefined;

  const commsLog = [
    application.submitted && {
      date: fmtDate(application.submitted),
      title: 'Application submitted',
      body: `Application to ${application.uni} was received and queued for processing.`,
    },
    application.submitted && {
      date: fmtDate(docsReviewDate),
      title: 'Documents under review',
      body: 'Supporting documents are being reviewed by the admissions office. Allow 3–5 working days.',
    },
    application.decided && {
      date: fmtDate(application.decided),
      title: `Decision: ${application.label}`,
      body: application.status === 'success'
        ? 'Congratulations — offer of admission received. Check your email for next steps.'
        : application.status === 'destructive'
        ? 'Your application was unsuccessful. You may apply for alternative programmes or appeal.'
        : 'Decision has been communicated. See your application status above.',
    },
  ].filter((e): e is { date: string; title: string; body: string } => !!e);

  async function act(status: 'submitted' | 'pending' | 'accepted' | 'rejected') {
    if (!application?.id) return;
    setActioning(status);
    setActionError(null);
    const result = await updateApplication(application.id, { status });
    setActioning(null);
    if ('error' in result) {
      setActionError(result.error);
    } else {
      router.refresh();
      navigate('applications');
    }
  }

  async function handleDelete() {
    if (!application?.id) return;
    setActioning('delete');
    setActionError(null);
    const result = await deleteApplication(application.id);
    setActioning(null);
    if ('error' in result) {
      setActionError(result.error);
      setConfirmDelete(false);
    } else {
      router.refresh();
      navigate('applications');
    }
  }

  // Determine which action buttons to show based on current status
  const isDraft     = application.status === 'info' && !application.submitted;
  const isPending   = application.status === 'warning' || application.status === 'info';
  const isFinal     = application.status === 'success' || application.status === 'destructive';

  // Stale submission detection
  const daysSinceSubmit = application.submitted
    ? Math.floor((Date.now() - new Date(application.submitted).getTime()) / 86_400_000)
    : null;
  const isStale = daysSinceSubmit !== null && daysSinceSubmit > 30 && !isFinal;

  // Days to deadline
  const daysToDeadline = application.deadline
    ? Math.ceil((new Date(application.deadline).getTime() - Date.now()) / 86_400_000)
    : null;

  // "What to do now" guidance
  const guidance = isFinal && application.status === 'success'
    ? { icon: '🎉', text: 'Offer received — review and accept before the deadline.', cta: 'Review offer letter, confirm acceptance, and submit registration fee.', cls: 'success' }
    : isFinal
    ? { icon: '📋', text: 'Application unsuccessful — consider alternatives.', cta: 'Check appeal requirements or explore other programmes with your APS.', cls: 'warning' }
    : application.submitted && !isFinal
    ? { icon: '⏳', text: 'Waiting for decision — check email daily.', cta: 'Admissions offices typically respond within 4–8 weeks. Follow up politely if stale.', cls: 'info' }
    : { icon: '📤', text: 'Submit your application as soon as possible.', cta: 'Gather certified ID, NSC results, transcripts, and income proof. Most portals close at 23:59.', cls: 'warning' };

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Execute · Applications · Detail</div>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
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
          <div className="row" style={{ flexWrap: 'wrap', gap: '0.375rem' }}>
            <span className={`badge ${STATUS_BADGE[application.status] ?? 'info'}`} style={{ fontSize: '0.8125rem', height: '1.875rem' }}>
              {application.label}
            </span>
            {application.submitted && (
              <span className="badge" style={{ height: '1.875rem', fontSize: '0.75rem' }}>Submitted {application.submitted}</span>
            )}
          </div>
        </div>
      </div>

      {/* Guidance + stale alert */}
      <div
        className="card"
        style={{ marginBottom: '1.25rem', borderLeft: `3px solid hsl(var(--${guidance.cls}))`, padding: '1rem 1.25rem' }}
      >
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{guidance.icon} {guidance.text}</div>
            <div className="caption" style={{ marginTop: '0.375rem' }}>{guidance.cta}</div>
            {daysToDeadline !== null && (
              <div
                className={`badge ${daysToDeadline <= 7 ? 'destructive' : daysToDeadline <= 21 ? 'warning' : 'info'}`}
                style={{ marginTop: '0.5rem', display: 'inline-flex' }}
              >
                {daysToDeadline > 0 ? `${daysToDeadline} days to deadline` : 'Deadline passed'}
              </div>
            )}
          </div>
        </div>
      </div>

      {isStale && (
        <div
          className="card"
          style={{ marginBottom: '1.25rem', borderLeft: '3px solid hsl(var(--warning))', padding: '1rem 1.25rem', background: 'hsl(var(--warning) / 0.05)' }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'hsl(var(--warning))' }}>
            ⚠ No update in {daysSinceSubmit} days
          </div>
          <div className="caption" style={{ marginTop: '0.375rem' }}>
            Applications typically receive a response within 30–45 days. Consider following up with the admissions office by email, quoting your application reference number.
          </div>
          <div className="row" style={{ marginTop: '0.625rem' }}>
            <span className="caption" style={{ fontSize: '0.75rem' }}>
              Subject: Application follow-up — {application.short ?? application.uni} — [Your Name]
            </span>
          </div>
        </div>
      )}

      {/* Status action buttons */}
      {!isFinal && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Update status</div>
          {actionError && (
            <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', marginBottom: '0.625rem' }}>{actionError}</p>
          )}
          <div className="row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {(isDraft || (!application.submitted && isPending)) && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => act('submitted')}
                disabled={!!actioning}
              >
                {actioning === 'submitted' ? 'Saving…' : 'Mark submitted'}
              </button>
            )}
            {isPending && application.submitted && (
              <>
                <button
                  className="btn btn-sm"
                  style={{ background: 'hsl(var(--success) / 0.15)', color: 'hsl(var(--success))', border: '1px solid hsl(var(--success) / 0.3)' }}
                  onClick={() => act('accepted')}
                  disabled={!!actioning}
                >
                  {actioning === 'accepted' ? 'Saving…' : 'Mark accepted'}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'hsl(var(--destructive) / 0.1)', color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive) / 0.3)' }}
                  onClick={() => act('rejected')}
                  disabled={!!actioning}
                >
                  {actioning === 'rejected' ? 'Saving…' : 'Mark rejected'}
                </button>
              </>
            )}
            {confirmDelete ? (
              <>
                <span className="caption" style={{ alignSelf: 'center', fontSize: '0.8125rem' }}>Delete this application?</span>
                <button className="btn btn-sm" style={{ background: 'hsl(var(--destructive))', color: '#fff' }} onClick={handleDelete} disabled={!!actioning}>
                  {actioning === 'delete' ? 'Deleting…' : 'Confirm delete'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', color: 'hsl(var(--destructive))' }}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Stage timeline */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Stage timeline</div>
          <div className="stack-2">
            {STAGE_LABELS.map((label, i) => {
              const stageVal = stages[i] ?? '';
              return (
                <div key={label} className="row" style={{ gap: '0.875rem', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.125rem', alignSelf: 'stretch' }}>
                    <span className={`stage ${stageVal}`} style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: 'block' }} />
                    {i < STAGE_LABELS.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 20, background: 'hsl(var(--border))', marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < STAGE_LABELS.length - 1 ? '0.5rem' : 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                    {stageVal === 'done'   && <span className="badge success"     style={{ height: '1.125rem', fontSize: '0.5625rem', marginTop: '0.25rem' }}>Done</span>}
                    {stageVal === 'active' && <span className="badge warning"     style={{ height: '1.125rem', fontSize: '0.5625rem', marginTop: '0.25rem' }}>In progress</span>}
                    {stageVal === 'fail'   && <span className="badge destructive" style={{ height: '1.125rem', fontSize: '0.5625rem', marginTop: '0.25rem' }}>Unsuccessful</span>}
                    {stageVal === ''       && <span className="caption" style={{ fontSize: '0.6875rem' }}>Pending</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="divider" />

          <div className="stack-2" style={{ marginTop: '0.25rem' }}>
            {[
              { l: 'Institution', v: application.uni },
              { l: 'Submitted',   v: fmtDate(application.submitted) },
              { l: 'Decision',    v: fmtDate(application.decided) },
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
              {docs.map(doc => (
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
              {docs.filter(d => d.done).length}/{docs.length} documents submitted
            </div>
          </div>

          {/* Communications log */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Communications log</div>
            {commsLog.length === 0 ? (
              <div className="caption" style={{ padding: '0.5rem 0' }}>
                No communications recorded yet. Updates will appear here once your application is processed.
              </div>
            ) : (
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
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Notes</div>
            <textarea
              className="input"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add personal notes about this application…"
              style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem' }}
            />
            <div style={{ marginTop: '0.625rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={!!actioning}
                onClick={async () => {
                  if (!application?.id) return;
                  setActioning('notes');
                  await updateApplication(application.id, { notes });
                  setActioning(null);
                }}
              >
                {actioning === 'notes' ? 'Saving…' : 'Save notes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
