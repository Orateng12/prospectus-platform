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

type DeadlineKind = 'application' | 'funding' | 'custom';

function buildChecklist(daysLeft: number, kind: DeadlineKind): string[] {
  if (kind === 'application') {
    if (daysLeft > 30) return [
      'Download and read the institution\'s official application guide for the current cycle',
      'Gather certified ID, NSC certificate or latest results, and proof of residence',
      'Request official academic transcripts from your school (allow 5–10 working days)',
      'Draft your motivation letter (500–750 words) explaining your chosen programme',
      'Confirm your APS meets the minimum — check the institution\'s website for the exact cut-off',
    ];
    if (daysLeft > 14) return [
      'Complete the online application form — save your progress regularly',
      'Attach all supporting documents and verify each against the institution\'s checklist',
      'Have your completed motivation letter proofread by a teacher or trusted adult',
      'Make certified copies of every document before submitting originals',
      'Confirm the application fee has been paid (if applicable) — keep proof of payment',
    ];
    if (daysLeft > 7) return [
      'Do a final read-through of your application — check spelling and factual accuracy',
      'Confirm all attachments are in the correct format (PDF preferred, under 5 MB each)',
      'Set aside 2 uninterrupted hours to submit without rushing',
      'Screenshot the confirmation screen and download the submission receipt',
    ];
    return [
      'Submit your application TODAY — universities rarely accept late submissions',
      'If the portal is down, email the admissions office with your full application attached',
      'Screenshot every step of the submission process as proof',
      'Note your application reference number for all future correspondence',
    ];
  }

  if (kind === 'funding') {
    if (daysLeft > 30) return [
      'Verify eligibility criteria on the funding provider\'s official website — requirements change yearly',
      'Prepare certified copies of ID, NSC results, and proof of household income for all earners',
      'Draft your motivation letter (600–800 words): field of study, career goal, and why you deserve this award',
      'Approach 2 referees (teachers or community leaders) and brief them on the scholarship criteria',
      'Check whether an employer or SETA letter is required (for SETA bursaries)',
    ];
    if (daysLeft > 14) return [
      'Collect signed reference letters from both of your referees',
      'Complete the application form and double-check every field against the requirements',
      'Attach all supporting documents in the correct format (PDF, certified copies)',
      'Confirm your banking details are correct — awards are paid directly to your account',
      'Check the portal again for any new required documents added since you started',
    ];
    if (daysLeft > 7) return [
      'Proofread your motivation letter one final time — grammar errors are often a disqualifier',
      'Ensure all document file names are descriptive (e.g. Surname_ID.pdf, not scan001.pdf)',
      'Set aside 3 uninterrupted hours to complete and submit the application',
      'Screenshot the confirmation and save the reference number',
    ];
    return [
      'Submit your funding application IMMEDIATELY — funding portals close precisely at midnight',
      'If the portal is unresponsive, email the provider with the full application attached and request confirmation',
      'Screenshot or print every page of the completed submission as evidence',
      'Note the reference number and provider email for follow-up correspondence',
    ];
  }

  // custom deadline
  if (daysLeft > 14) return [
    'Review the requirements for this deadline and confirm you have everything needed',
    'Set a calendar reminder for 3 days before the deadline as a final check',
    'Identify who you need to contact or coordinate with to meet this deadline',
  ];
  if (daysLeft > 3) return [
    'Complete any outstanding tasks related to this deadline',
    'Confirm any required approvals or sign-offs are in place',
    'Prepare to submit or hand over on time',
  ];
  return [
    'This deadline is very close — prioritise it above other tasks today',
    'Complete it and record the outcome for your own reference',
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
  kind: DeadlineKind;
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
        tag, tagL, daysLeft, kind: 'application' as DeadlineKind,
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
        tag, tagL, daysLeft, kind: 'funding' as DeadlineKind,
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
      tag, tagL, daysLeft, kind: 'custom' as DeadlineKind,
      isCustom: true,
    };
  });

  const ALL_DEADLINES: DisplayDeadline[] = [...APP_DEADLINES, ...FUNDING_DEADLINES, ...CUSTOM_DEADLINES]
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const urgent   = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'urgent');
  const soon     = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'soon');
  const upcoming = ALL_DEADLINES.filter(d => urgencyGroup(d.tag) === 'upcoming');

  // Monthly load — next 6 months
  const monthlyLoad = (() => {
    const months: Array<{ label: string; key: string; count: number; maxAmount?: number }> = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' });
      // Count all deadlines that fall in this month
      const fundingInMonth = opps.filter(f => {
        const fd = parseFundingDeadline(f.deadline);
        if (!fd) return false;
        return fd.getFullYear() === d.getFullYear() && fd.getMonth() === d.getMonth() && fd > today;
      });
      const appInMonth = applications.filter(a => {
        if (!a.deadline) return false;
        const fd = new Date(a.deadline);
        return fd.getFullYear() === d.getFullYear() && fd.getMonth() === d.getMonth() && fd > today;
      });
      const count = fundingInMonth.length + appInMonth.length + customDeadlines.filter(c => {
        const fd = new Date(c.date);
        return fd.getFullYear() === d.getFullYear() && fd.getMonth() === d.getMonth() && fd > today;
      }).length;
      const maxAmount = fundingInMonth.length > 0 ? Math.max(...fundingInMonth.map(f => f.amount)) : undefined;
      months.push({ label, key, count, maxAmount });
    }
    return months;
  })();
  const maxMonthCount = Math.max(...monthlyLoad.map(m => m.count), 1);

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
          const checklist = buildChecklist(d.daysLeft, d.kind);
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
                      if (d.kind === 'application') navigate?.('applications');
                      else if (d.kind === 'funding') navigate?.('scholarships');
                      else navigate?.('documents');
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

      {/* Monthly load forecast */}
      {monthlyLoad.some(m => m.count > 0) && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Load forecast</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Deadlines by month</h3>
            </div>
            <span className="caption" style={{ fontSize: '0.6875rem' }}>Next 6 months</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', alignItems: 'end' }}>
            {monthlyLoad.map((m, i) => {
              const barH = m.count > 0 ? Math.max(24, Math.round((m.count / maxMonthCount) * 80)) : 6;
              const isNow = i === 0;
              const color = m.count >= 4 ? 'hsl(var(--destructive))' : m.count >= 2 ? 'hsl(var(--warning))' : 'hsl(var(--primary))';
              return (
                <div key={m.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: m.count > 0 ? color : 'hsl(var(--muted-fg))' }}>
                    {m.count > 0 ? m.count : '—'}
                  </div>
                  <div style={{ width: '100%', height: barH, borderRadius: 4, background: m.count > 0 ? color : 'hsl(var(--border))', opacity: isNow ? 1 : 0.7 }} />
                  <div style={{ fontSize: '0.5625rem', fontWeight: isNow ? 800 : 500, color: isNow ? 'hsl(var(--fg))' : 'hsl(var(--muted-fg))', textAlign: 'center' }}>
                    {m.label}
                    {isNow && <div style={{ fontSize: '0.5rem', color: 'hsl(var(--primary))' }}>NOW</div>}
                  </div>
                  {m.maxAmount && (
                    <div style={{ fontSize: '0.5rem', color: 'hsl(var(--success))', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
                      up to R{Math.round(m.maxAmount / 1000)}k
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
