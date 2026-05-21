'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route, DbApplication, DbCustomDeadline, FundingOpportunity } from '@/lib/types';
import { FUNDING_OPPORTUNITIES } from '@/lib/data';
import { addDeadline, deleteDeadline } from '@/app/actions/deadlines';

function parseFundingDeadline(deadline: string | undefined): Date | null {
  if (!deadline || deadline === 'Rolling') return null;
  const d = new Date(deadline);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function urgencyGroup(tag: string): 'urgent' | 'soon' | 'upcoming' {
  if (tag === 'destructive') return 'urgent';
  if (tag === 'warning') return 'soon';
  return 'upcoming';
}

function buildChecklist(daysLeft: number): string[] {
  if (daysLeft > 30) {
    return [
      'Verify full eligibility criteria on the provider website',
      'Request certified academic transcripts (allow 5–10 working days)',
      'Obtain certified copy of ID and matric certificate',
      'Draft your motivation letter (500–750 words)',
      'Identify and brief 2 academic or character referees',
    ];
  }
  if (daysLeft > 14) {
    return [
      'Complete the online application form (save progress regularly)',
      'Attach all supporting documents — verify against the checklist',
      'Request signed reference letters from your referees now',
      'Make certified copies of every document',
      'Review eligibility criteria one final time before submitting',
    ];
  }
  if (daysLeft > 7) {
    return [
      'Finalise and proofread your motivation letter',
      'Confirm all attachments are in correct format (PDF, certified)',
      'Set aside 2 uninterrupted hours to complete submission',
      'Screenshot and save the confirmation screen',
    ];
  }
  return [
    'Submit your application TODAY — do not delay',
    'Screenshot the confirmation screen immediately',
    'Note your reference number for all future correspondence',
    'Email the provider directly if the portal has technical issues',
  ];
}

type DisplayDeadline = {
  id?: string;
  d: number;
  m: string;
  t: string;
  sub: string;
  tag: string;
  tagL: string;
  isCustom?: boolean;
  daysLeft: number;
};

export default function DeadlinesPage({
  navigate,
  applications = [],
  customDeadlines = [],
  fundingOpportunities,
}: {
  navigate?: (r: Route) => void;
  applications?: DbApplication[];
  customDeadlines?: DbCustomDeadline[];
  fundingOpportunities?: FundingOpportunity[];
}) {
  const router = useRouter();
  const today = new Date();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addDate, setAddDate] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const opps = fundingOpportunities ?? FUNDING_OPPORTUNITIES;

  const APP_DEADLINES: DisplayDeadline[] = applications
    .filter(a => a.deadline)
    .map(a => {
      const date     = new Date(a.deadline!);
      const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
      const tag      = daysLeft <= 7 ? 'destructive' : daysLeft <= 21 ? 'warning' : '';
      const tagL     = daysLeft <= 7 ? 'Urgent' : daysLeft <= 21 ? 'Soon' : 'Open';
      return {
        id: `app-${a.id}`,
        d:    date.getDate(),
        m:    date.toLocaleDateString('en-ZA', { month: 'short' }),
        t:    `${a.institution_name} — ${a.programme_name}`,
        sub:  `${daysLeft > 0 ? `${daysLeft} days` : 'Today'} · application deadline`,
        tag, tagL, daysLeft,
      };
    });

  const FUNDING_DEADLINES: DisplayDeadline[] = opps
    .flatMap(f => {
      const date = parseFundingDeadline(f.deadline);
      if (!date || date < today) return [];
      const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
      const tag      = daysLeft <= 7 ? 'destructive' : daysLeft <= 21 ? 'warning' : '';
      const tagL     = daysLeft <= 7 ? 'Urgent' : daysLeft <= 21 ? 'Soon' : 'Open';
      return [{
        id: `funding-${f.id}`,
        d:   date.getDate(),
        m:   date.toLocaleDateString('en-ZA', { month: 'short' }),
        t:   f.name,
        sub: `${daysLeft} days · ${f.eligibility.split('·')[0].trim()}`,
        tag, tagL, daysLeft,
        _ts: date.getTime(),
      }];
    })
    .sort((a: any, b: any) => a._ts - b._ts)
    .slice(0, 8) as DisplayDeadline[];

  const CUSTOM_DEADLINES: DisplayDeadline[] = customDeadlines.map(c => {
    const date     = new Date(c.date);
    const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
    const tag      = daysLeft <= 7 ? 'destructive' : daysLeft <= 21 ? 'warning' : '';
    const tagL     = daysLeft <= 7 ? 'Urgent' : daysLeft <= 21 ? 'Soon' : 'Open';
    return {
      id: c.id,
      d:    date.getDate(),
      m:    date.toLocaleDateString('en-ZA', { month: 'short' }),
      t:    c.title,
      sub:  `${daysLeft > 0 ? `${daysLeft} days` : 'Today'} · custom deadline`,
      tag, tagL, daysLeft,
      isCustom: true,
    };
  });

  const ALL_DEADLINES: DisplayDeadline[] = [...APP_DEADLINES, ...FUNDING_DEADLINES, ...CUSTOM_DEADLINES]
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const urgent   = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'urgent');
  const soon     = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'soon');
  const upcoming = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'upcoming');

  const mostUrgent = urgent[0] ?? soon[0] ?? upcoming[0];
  const aiReminderText = mostUrgent
    ? urgencyGroup(mostUrgent.tag) === 'urgent'
      ? `Your most critical deadline is <strong>${mostUrgent.t}</strong> — ${mostUrgent.daysLeft} day${mostUrgent.daysLeft !== 1 ? 's' : ''} left. Stop everything and complete it now.`
      : urgencyGroup(mostUrgent.tag) === 'soon'
      ? `<strong>${mostUrgent.t}</strong> is coming up soon (${mostUrgent.daysLeft} days). Gather your supporting documents now to avoid a last-minute rush.`
      : `Your nearest upcoming deadline is <strong>${mostUrgent.t}</strong> — ${mostUrgent.daysLeft} days away. Use this lead time to prepare documents carefully.`
    : 'No active deadlines right now. Stay ahead by adding your application deadlines above.';

  function handleAdd() {
    if (!addTitle.trim() || !addDate) return;
    setAddError(null);
    startTransition(async () => {
      const result = await addDeadline(addTitle.trim(), addDate);
      if ('error' in result) {
        setAddError(result.error);
      } else {
        setAddTitle(''); setAddDate('');
        setShowAddForm(false);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDeadline(id);
      router.refresh();
    });
  }

  function DeadlineList({ items }: { items: DisplayDeadline[] }) {
    return (
      <div className="stack">
        {items.map(d => {
          const key = d.id ?? d.t;
          const isExpanded = expandedId === key;
          const checklist = buildChecklist(d.daysLeft);
          return (
            <div key={key}>
              <div className="deadline" style={{ alignItems: 'flex-start' }}>
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
                  style={{ padding: '0 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setExpandedId(isExpanded ? null : key)}
                  title={isExpanded ? 'Hide checklist' : 'Show preparation checklist'}
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
                {d.isCustom && d.id ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0 0.5rem', color: 'hsl(var(--destructive))' }}
                    onClick={() => handleDelete(d.id!)}
                    title="Delete deadline"
                    disabled={isPending}
                  >✕</button>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0 0.5rem' }}
                    onClick={() => {
                      if (d.tag === 'destructive') navigate?.('documents');
                      else navigate?.('scholarships');
                    }}
                    title="Open related page"
                  >→</button>
                )}
              </div>
              {isExpanded && (
                <div style={{
                  marginLeft: '3.75rem', marginBottom: '0.375rem', padding: '0.875rem 1rem',
                  background: 'hsl(var(--muted) / 0.35)', borderRadius: 8,
                  borderLeft: `3px solid hsl(var(--${d.tag || 'primary'}))`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.625rem', color: 'hsl(var(--muted-fg))' }}>
                    PREPARATION CHECKLIST · {d.daysLeft} DAYS
                  </div>
                  {checklist.map((step, i) => (
                    <div key={i} className="row" style={{ gap: '0.625rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        border: '2px solid hsl(var(--border))',
                        background: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.625rem', marginTop: 1,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
              Click ▼ on any item to expand its preparation checklist.
            </p>
          </div>
          <div className="row">
            {urgent.length > 0 && <span className="badge destructive">{urgent.length} urgent</span>}
            {soon.length   > 0 && <span className="badge warning">{soon.length} soon</span>}
            <button className="btn btn-primary" onClick={() => setShowAddForm(p => !p)}>
              {showAddForm ? 'Cancel' : 'Add deadline'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { l: 'This week',     v: String(urgent.length),               h: urgent.length > 0 ? 'needs immediate action' : 'nothing critical',   c: urgent.length > 0 ? 'destructive' : '' },
          { l: 'This month',    v: String(urgent.length + soon.length), h: `${urgent.length} urgent · ${soon.length} soon`,                      c: urgent.length + soon.length > 0 ? 'warning' : '' },
          { l: 'Total tracked', v: String(ALL_DEADLINES.length),        h: `applications + ${FUNDING_DEADLINES.length} funding opportunities`,   c: '' },
        ].map(({ l, v, h, c }) => (
          <div className="card kpi" key={l}>
            <div className="lbl">{l}</div>
            <div className="val" style={c ? { color: `hsl(var(--${c}))` } : {}}>{v}</div>
            <div className="hint" dangerouslySetInnerHTML={{ __html: h }} />
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Add custom deadline</div>
          <div className="grid-2" style={{ gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>Deadline title</div>
              <input
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. NSFAS supporting docs"
                value={addTitle}
                onChange={e => setAddTitle(e.target.value)}
              />
            </div>
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>Date</div>
              <input
                className="input"
                type="date"
                style={{ width: '100%' }}
                value={addDate}
                onChange={e => setAddDate(e.target.value)}
              />
            </div>
          </div>
          {addError && <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{addError}</p>}
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary btn-sm"
              disabled={!addTitle.trim() || !addDate || isPending}
              onClick={handleAdd}
            >
              {isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      )}

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

        {ALL_DEADLINES.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="subheading" style={{ marginBottom: '0.5rem' }}>No deadlines yet</div>
            <p className="caption">Add application deadlines or they&apos;ll appear automatically once you track applications.</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="eyebrow"><span className="dot" />Deadline intelligence</div>
        <p
          style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', lineHeight: 1.6, color: 'hsl(var(--fg))' }}
          dangerouslySetInnerHTML={{ __html: aiReminderText }}
        />
        <div className="row" style={{ marginTop: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate?.('nsfas')}>Open NSFAS portal</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate?.('documents')}>View documents</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate?.('scholarships')}>All funding →</button>
        </div>
      </div>
    </div>
  );
}
