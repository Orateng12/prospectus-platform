'use client';

import { useState } from 'react';
import type { Route, Subject, Programme, DbApplication, StrategicScoreData, PsychProfileData, CapabilityData, Deadline, Career, DbCustomDeadline, DbDocument } from '@/lib/types';
import { PROGRAMMES, DEADLINES } from '@/lib/data';
import { calcAPS, fmtR, apsPoints } from '@/lib/utils';
import AiInsightCard from '@/components/AiInsightCard';

function computeNsfas(income: number | undefined): number {
  if (income === undefined || income <= 350_000) return 115_060;
  if (income <= 600_000)                         return  48_000;
  return 0;
}

function computeBursary(aps: number | undefined): number {
  const a = aps ?? 0;
  if (a >= 42) return 165_000;
  if (a >= 38) return  95_000;
  if (a >= 32) return  42_000;
  if (a >= 26) return  18_000;
  return 0;
}

function buildFocusItems(
  applications: DbApplication[],
  subjects: Subject[],
  programmes: Programme[],
  userAps: number,
  savedProgrammeIds: string[],
  householdIncome?: number,
  capabilityData?: CapabilityData | null,
  documents?: DbDocument[],
  psychProfile?: PsychProfileData | null,
): Array<{ icon: string; text: string; detail?: string; urgency: 'high' | 'med' | 'low'; route: Route }> {
  const items: Array<{ icon: string; text: string; detail?: string; urgency: 'high' | 'med' | 'low'; route: Route }> = [];
  const today = new Date();

  // 0. Profile completion — highest priority if assessment not yet taken
  if (!psychProfile && !capabilityData) {
    items.push({
      icon: '🧠',
      text: 'Complete your cognitive assessment',
      detail: 'Takes 8 minutes. Unlocks personalised career matching, capability gap analysis, and your Intelligence score.',
      urgency: 'high',
      route: 'cognitive',
    });
  } else if (!capabilityData) {
    items.push({
      icon: '⬡',
      text: 'Complete the capability assessment',
      detail: 'Your RIASEC profile is set — add 8-dimension capability data to unlock Skills Map and gap analysis.',
      urgency: 'med',
      route: 'skills',
    });
  }

  // 1. Urgent application deadlines
  const urgentApp = applications
    .filter(a => a.deadline)
    .map(a => ({ ...a, daysLeft: Math.ceil((new Date(a.deadline!).getTime() - today.getTime()) / 86_400_000) }))
    .filter(a => a.daysLeft >= 0 && a.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];
  if (urgentApp) {
    items.push({
      icon: '⚠',
      text: `${urgentApp.institution_name} deadline in ${urgentApp.daysLeft} day${urgentApp.daysLeft !== 1 ? 's' : ''}`,
      detail: `${urgentApp.programme_name} · Don't lose this application.`,
      urgency: urgentApp.daysLeft <= 3 ? 'high' : 'med',
      route: 'applications',
    });
  }

  // 2. APS leverage: name the exact subject + mark target + programmes unlocked
  const nearMissProgs = programmes.filter(p => p.aps > userAps && p.aps <= userAps + 2);
  const lowestSubject = [...subjects].filter(s => s.id !== 'lo').sort((a, b) => apsPoints(a.mark) - apsPoints(b.mark))[0];
  if (lowestSubject && nearMissProgs.length > 0) {
    const nextMark = lowestSubject.mark < 50 ? 50 : lowestSubject.mark < 60 ? 60 : 70;
    const unlockCount = nearMissProgs.length;
    items.push({
      icon: '📈',
      text: `Raise ${lowestSubject.name} from ${lowestSubject.mark}% → ${nextMark}%`,
      detail: `Adds 1 APS point and unlocks ${unlockCount} programme${unlockCount !== 1 ? 's' : ''} you can't access yet.`,
      urgency: 'med',
      route: 'simulator',
    });
  } else if (lowestSubject) {
    const nextProg = programmes.filter(p => p.aps > userAps && p.aps <= userAps + 6).sort((a, b) => a.aps - b.aps)[0];
    if (nextProg) {
      items.push({
        icon: '📈',
        text: `Raise ${lowestSubject.name} to reach ${nextProg.name}`,
        detail: `${nextProg.uni} requires APS ${nextProg.aps} — you need ${nextProg.aps - userAps} more point${nextProg.aps - userAps !== 1 ? 's' : ''}.`,
        urgency: 'med',
        route: 'simulator',
      });
    }
  }

  // 3. Communication gap — blocks most leadership/PM careers
  const commScore = capabilityData?.communication_skills;
  if (commScore !== undefined && commScore < 60 && items.length < 2) {
    items.push({
      icon: '🗣',
      text: 'Communication score limits 12+ careers',
      detail: `Your score (${commScore}/100) is below the threshold for Product Manager, Marketing, and HR roles. Fixable through practice.`,
      urgency: 'med',
      route: 'skills',
    });
  }

  // 3b. Documents missing — applications exist but no docs uploaded
  if (applications.length > 0 && documents !== undefined && documents.length === 0 && items.length < 3) {
    items.push({
      icon: '📎',
      text: 'No documents uploaded yet',
      detail: 'Universities require ID, matric certificate, and proof of residence. Upload now to avoid last-minute delays.',
      urgency: 'med',
      route: 'documents',
    });
  }

  // 4. NSFAS eligibility — prompt to apply if income qualifies
  const nsfasEligible = householdIncome === undefined || householdIncome <= 350_000;
  if (nsfasEligible && applications.length === 0 && items.length < 3) {
    items.push({
      icon: '💰',
      text: 'NSFAS application opens — you qualify',
      detail: 'Household income qualifies for R 115,060 annual coverage. Apply before 30 April to secure your funding.',
      urgency: 'med',
      route: 'funding',
    });
  }

  // 5. Funding gap for saved programmes (above NSFAS threshold)
  const savedCount = savedProgrammeIds.length;
  const aboveNsfas = householdIncome !== undefined && householdIncome > 350_000;
  if (savedCount > 0 && aboveNsfas && householdIncome! <= 600_000 && items.length < 3) {
    const savedProgs = programmes.filter(p => savedProgrammeIds.includes(p.id));
    const bursary = computeBursary(userAps);
    const topGap = savedProgs
      .map(p => ({ p, gap: Math.max(0, Math.round(p.fees * 1.8) - bursary - 18_000) }))
      .sort((a, b) => b.gap - a.gap)[0];
    if (topGap && topGap.gap > 20_000) {
      items.push({
        icon: '💳',
        text: `${fmtR(topGap.gap)} funding gap on ${topGap.p.name.split(' ').slice(0, 3).join(' ')}`,
        detail: `Above NSFAS threshold — merit bursaries and targeted scholarships needed to close this gap.`,
        urgency: 'med',
        route: 'scholarships',
      });
    } else if (savedCount > 0 && items.length < 3) {
      items.push({
        icon: '★',
        text: `${savedCount} saved programme${savedCount !== 1 ? 's' : ''} — verify deadlines`,
        detail: 'Application windows close at different times. Check each saved programme now.',
        urgency: 'low',
        route: 'programmes',
      });
    }
  } else if (savedCount > 0 && items.length < 3) {
    items.push({
      icon: '★',
      text: `${savedCount} saved programme${savedCount !== 1 ? 's' : ''} — verify deadlines`,
      detail: 'Application windows close at different times. Check each saved programme now.',
      urgency: 'low',
      route: 'programmes',
    });
  }

  // 6. Generic fallbacks
  const fallbacks: typeof items = [
    { icon: '🎯', text: 'Browse scholarships — multiple profile matches', detail: 'Your APS and subject mix qualify you for at least 3 bursary programmes.', urgency: 'low', route: 'scholarships' },
    { icon: '🏛',  text: 'Compare universities side-by-side', detail: 'Use the Universities page to weigh fees, acceptance rates, and provincial proximity.', urgency: 'low', route: 'unis' },
    { icon: '🔭', text: 'Explore career matches on Discover', detail: 'The Discover page surfaces careers you may not have considered based on your profile.', urgency: 'low', route: 'discover' },
  ];

  return [...items, ...fallbacks].slice(0, 3);
}

interface HomePageProps {
  subjects: Subject[];
  navigate: (r: Route, prog?: string) => void;
  programmes?: Programme[];
  applications?: DbApplication[];
  strategicScore?: StrategicScoreData | null;
  householdIncome?: number;
  savedProgrammeIds?: string[];
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  careers?: Career[];
  liveCareerMatches?: Record<string, number>;
  customDeadlines?: DbCustomDeadline[];
  documents?: DbDocument[];
  onOpenCareer?: (name: string) => void;
}

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildDeadlines(applications: DbApplication[], customDeadlines: DbCustomDeadline[] = []): Deadline[] {
  const now = Date.now();
  const appDeadlines: (Deadline & { ts: number })[] = applications
    .filter(a => a.deadline)
    .map(a => {
      const date = new Date(a.deadline!);
      const ts = date.getTime();
      const daysLeft = Math.ceil((ts - now) / 86_400_000);
      const isPast = daysLeft < 0;
      const isUrgent = daysLeft >= 0 && daysLeft <= 7;
      return {
        ts,
        d: date.getDate(),
        m: MONTH_ABBR[date.getMonth()],
        t: `${a.institution_name} — ${a.programme_name}`,
        sub: isPast ? 'Deadline passed' : daysLeft === 0 ? 'Today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
        tag: isPast ? 'destructive' : isUrgent ? 'warning' : '',
        tagL: isPast ? 'Overdue' : isUrgent ? 'Soon' : 'Open',
      };
    })
    .sort((a, b) => a.ts - b.ts);

  const customItems: (Deadline & { ts: number })[] = customDeadlines.map(c => {
    const date = new Date(c.date);
    const ts = date.getTime();
    const daysLeft = Math.ceil((ts - now) / 86_400_000);
    const isPast = daysLeft < 0;
    const isUrgent = daysLeft >= 0 && daysLeft <= 7;
    return {
      ts,
      d: date.getDate(),
      m: MONTH_ABBR[date.getMonth()],
      t: c.title,
      sub: isPast ? 'Deadline passed' : daysLeft === 0 ? 'Today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      tag: isPast ? 'destructive' : isUrgent ? 'warning' : '',
      tagL: isPast ? 'Overdue' : isUrgent ? 'Soon' : 'Open',
    };
  });

  // Fill remaining slots with static deadlines (future ones only)
  const year = new Date().getFullYear();
  const staticFuture: (Deadline & { ts: number })[] = DEADLINES
    .map(d => ({ ...d, ts: new Date(`${d.d} ${d.m} ${year}`).getTime() }))
    .filter(d => d.ts >= now);

  const merged = [...appDeadlines, ...customItems, ...staticFuture].sort((a, b) => a.ts - b.ts);
  return merged.slice(0, 10);
}

function statusToBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'offer') return 'success';
  if (s === 'rejected' || s === 'declined') return 'destructive';
  if (s === 'pending' || s === 'submitted') return 'warning';
  return 'info';
}

function statusToLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'offer') return 'Accepted';
  if (s === 'rejected' || s === 'declined') return 'Rejected';
  if (s === 'pending') return 'Pending';
  if (s === 'submitted') return 'Submitted';
  return 'In review';
}

function statusToStages(status: string): string[] {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'offer') return ['done', 'done', 'done', 'done'];
  if (s === 'rejected' || s === 'declined') return ['done', 'done', 'fail', ''];
  if (s === 'pending') return ['done', 'done', 'active', ''];
  return ['done', 'active', '', ''];
}

export default function HomePage({ subjects, navigate, programmes, applications = [], strategicScore, householdIncome, savedProgrammeIds = [], psychProfile, capabilityData, careers, liveCareerMatches, customDeadlines, documents, onOpenCareer }: HomePageProps) {
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);
  const aps = calcAPS(subjects);
  const allProgs = programmes ?? PROGRAMMES;
  const eligible = allProgs.filter(p => p.aps <= aps);
  const direct = eligible.filter(p => p.pathway === 'direct').length;
  const extended = eligible.filter(p => p.pathway === 'extended' || p.pathway === 'foundation').length;

  // Live funding computation
  const nsfasAmt   = computeNsfas(householdIncome);
  const bursaryAmt = computeBursary(aps);
  const scholarAmt = 18_000;
  const totalFunding = nsfasAmt + bursaryAmt + scholarAmt;
  const fundingSourceCount = (nsfasAmt > 0 ? 1 : 0) + (bursaryAmt > 0 ? 1 : 0) + 1;
  const fundingEligible = householdIncome === undefined || householdIncome <= 600_000;

  // Top career recommendations (only when APS is set and matches are available)
  const topCareers = liveCareerMatches && careers && aps > 0
    ? [...careers]
        .map(c => ({ ...c, score: liveCareerMatches[c.name] ?? c.match }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  const rawFocuses = buildFocusItems(applications, subjects, allProgs, aps, savedProgrammeIds, householdIncome, capabilityData, documents, psychProfile);
  // Pad to 3 items with a fallback if needed
  const focusFallbacks: typeof rawFocuses = [
    { icon: '📚', text: 'Re-rank programmes after subject update', urgency: 'low', route: 'simulator' },
    { icon: '🎯', text: 'Explore scholarship options — multiple matches', urgency: 'low', route: 'scholarships' },
    { icon: '🏛', text: 'Compare universities side-by-side', urgency: 'low', route: 'unis' },
  ];
  const focuses = [...rawFocuses, ...focusFallbacks].slice(0, 3);

  const deadlineItems = buildDeadlines(applications, customDeadlines);

  return (
    <div className="page-anim">
      {/* KPI strip */}
      <div className="grid-4">
        <div className="card kpi">
          <div className="lbl">APS Score</div>
          <div className="row" style={{ alignItems: 'baseline', gap: '0.375rem' }}>
            <span className="val">{aps}</span>
            <span className="caption">/ 49</span>
          </div>
          <div className="meter" style={{ marginTop: '0.5rem' }}>
            <i style={{ width: `${(aps / 49) * 100}%` }} />
          </div>
          <div className="hint">
            Above threshold for{' '}
            <strong style={{ color: 'hsl(var(--fg))' }}>
              {Math.round((eligible.length / (allProgs.length || 1)) * 100)}%
            </strong>{' '}
            of shortlisted programmes.
          </div>
        </div>

        <div className="card kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('programmes')}>
          <div className="lbl">Eligible programmes</div>
          <div className="val">{eligible.length}</div>
          <div className="row" style={{ gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge direct">{direct} direct</span>
            <span className="badge extended">{extended} ext.</span>
            {savedProgrammeIds && savedProgrammeIds.length > 0 && (
              <span className="badge" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary) / 0.2)' }}>
                ★ {savedProgrammeIds.length} saved
              </span>
            )}
          </div>
        </div>

        <div className="card kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('funding')}>
          <div className="lbl">Funding matched</div>
          {fundingEligible ? (
            <>
              <div className="val" style={{ color: 'hsl(var(--success))' }}>{fmtR(Math.round(totalFunding / 1000) * 1000)}</div>
              <div className="hint">across <strong style={{ color: 'hsl(var(--fg))' }}>{fundingSourceCount} source{fundingSourceCount !== 1 ? 's' : ''}</strong>{nsfasAmt > 0 ? ' · NSFAS + bursaries' : ' · merit bursaries'}</div>
            </>
          ) : (
            <>
              <div className="val" style={{ color: 'hsl(var(--destructive))', fontSize: '1.125rem' }}>Not eligible</div>
              <div className="hint">Household income above NSFAS threshold · merit bursaries available</div>
            </>
          )}
        </div>

        <div className="card kpi" style={{ cursor: strategicScore ? undefined : 'pointer' }} onClick={strategicScore ? undefined : () => navigate('cognitive')}>
          <div className="lbl">Strategic Score</div>
          {strategicScore ? (
            <>
              <div className="row" style={{ alignItems: 'baseline', gap: '0.375rem' }}>
                <span className="val">{strategicScore.overall}</span>
                <span className="caption">/ 100</span>
                {strategicScore.previous_score != null && (
                  <span className={`badge ${strategicScore.overall - strategicScore.previous_score >= 0 ? 'success' : 'destructive'}`} style={{ marginLeft: 'auto' }}>
                    {strategicScore.overall - strategicScore.previous_score >= 0 ? '+' : ''}{strategicScore.overall - strategicScore.previous_score}
                  </span>
                )}
              </div>
              <div className="hint">Trending {strategicScore.trend}.</div>
            </>
          ) : (
            <>
              <div className="val" style={{ color: 'hsl(var(--muted-fg))' }}>—</div>
              <div className="hint">Take the assessment to unlock your score →</div>
            </>
          )}
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="home-grid stack-3">
        {/* Left column */}
        <div className="stack-3">
          {/* Career recommendations strip — shown once APS is entered */}
          {topCareers.length > 0 && (
            <div className="card">
              <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <div className="eyebrow"><span className="dot" />Recommended for you</div>
                  <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Your top career matches</h3>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('careers')}>Explore all →</button>
              </div>
              <div className="grid-3" style={{ gap: '0.625rem' }}>
                {topCareers.map(c => (
                  <button
                    key={c.name}
                    className="card compact"
                    style={{ textAlign: 'left', cursor: 'pointer', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
                    onClick={() => onOpenCareer ? onOpenCareer(c.name) : navigate('careers')}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>{c.name}</div>
                    <div className="meter sm" style={{ width: '100%', height: 4 }}>
                      <i style={{ width: `${c.score}%` }} />
                    </div>
                    <div className="row-between">
                      <span className="caption">{c.score}% match</span>
                      <span className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`} style={{ height: '1.125rem', fontSize: '0.5625rem' }}>
                        {c.demand}
                      </span>
                    </div>
                    <div className="row-between">
                      <span className="caption" style={{ color: 'hsl(var(--muted-fg))' }}>{fmtR(c.salary)}/mo</span>
                      <span className="caption" style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>{c.growth}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Focus */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Today&apos;s focus</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>3 things to move the needle</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('deadlines')}>View all</button>
            </div>
            <div className="stack">
              {focuses.map((x, i) => (
                <div className="focus-item" key={x.text}>
                  <span className="focus-num" style={{ color: x.urgency === 'high' ? 'hsl(var(--destructive))' : undefined }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="focus-title">{x.icon} {x.text}</div>
                    {x.detail && (
                      <div className="caption" style={{ marginTop: '0.125rem', color: 'hsl(var(--muted-fg))' }}>{x.detail}</div>
                    )}
                  </div>
                  <button
                    className={`btn ${x.urgency === 'high' ? 'btn-primary' : i === 0 ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => navigate(x.route)}
                  >
                    {x.urgency === 'high' ? 'Act now →' : i === 0 ? 'Open →' : 'View →'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          {(() => {
            const hasApps = applications.length > 0;
            if (!hasApps) {
              return (
                <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
                  <div style={{ fontWeight: 700 }}>No applications yet</div>
                  <p className="caption" style={{ marginTop: '0.375rem', maxWidth: '22rem', margin: '0.375rem auto 0' }}>
                    Explore programmes that match your APS, then track your applications here.
                  </p>
                  <div className="row" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('programmes')}>Explore programmes →</button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('applications')}>Add manually →</button>
                  </div>
                </div>
              );
            }
            const accepted = applications.filter(a => ['accepted','offer'].includes(a.status.toLowerCase())).length;
            const pending   = applications.filter(a => ['pending','submitted'].includes(a.status.toLowerCase())).length;
            const review    = applications.filter(a => !['accepted','offer','pending','submitted','rejected','declined'].includes(a.status.toLowerCase())).length;
            const rejected  = applications.filter(a => ['rejected','declined'].includes(a.status.toLowerCase())).length;
            return (
              <div className="card">
                <div className="row-between" style={{ marginBottom: '0.875rem' }}>
                  <div>
                    <div className="eyebrow"><span className="dot" />Application pipeline</div>
                    <h3 className="subheading" style={{ marginTop: '0.25rem', cursor: 'pointer' }} onClick={() => navigate('applications')}>{applications.length} active →</h3>
                  </div>
                  <div className="row">
                    {accepted > 0 && <span className="badge success">{accepted} accepted</span>}
                    {pending  > 0 && <span className="badge warning">{pending} pending</span>}
                    {review   > 0 && <span className="badge info">{review} review</span>}
                    {rejected > 0 && <span className="badge destructive">{rejected} rejected</span>}
                  </div>
                </div>
                <div className="stack">
                  {applications.map(a => (
                    <div className="pipe-row" key={a.id}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.institution_name} · {a.programme_name}</div>
                        <div className="caption" style={{ marginTop: 2 }}>
                          {a.applied_at ? `Submitted ${new Date(a.applied_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}` : 'Application submitted'}
                          {a.deadline ? ` · Deadline ${new Date(a.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}` : ''}
                        </div>
                      </div>
                      <div className="pipe-stages">
                        {statusToStages(a.status).map((s, i) => (
                          <span key={i} className={`stage${s ? ` ${s}` : ''}`} />
                        ))}
                      </div>
                      <span className={`badge ${statusToBadge(a.status)}`}>{statusToLabel(a.status)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Top matched */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Top matched programmes</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Highest fit scores you qualify for now</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('programmes')}>
                All {eligible.length} →
              </button>
            </div>
            <div className="stack">
              {[...eligible].sort((a, b) => b.fit - a.fit).slice(0, 4).map(p => (
                <button
                  key={p.id}
                  className="prog-row"
                  onClick={() => navigate('programmes', p.id)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div className="caption" style={{ marginTop: 2 }}>
                      {p.uni} · {p.dur} yrs · {fmtR(p.fees)} / yr
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

          {/* Near-miss programmes */}
          {(() => {
            const nearMiss = [...allProgs]
              .filter(p => p.aps > aps && p.aps <= aps + 4)
              .sort((a, b) => (a.aps - aps) - (b.aps - aps) || b.fit - a.fit)
              .slice(0, 3);
            if (nearMiss.length === 0) return null;
            return (
              <div className="card">
                <div className="row-between" style={{ marginBottom: '0.875rem' }}>
                  <div>
                    <div className="eyebrow"><span className="dot" />Within reach</div>
                    <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                      Programmes unlocked by raising 1–4 APS points
                    </h3>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('simulator')}>Simulate →</button>
                </div>
                <div className="stack">
                  {nearMiss.map(p => {
                    const gap = p.aps - aps;
                    return (
                      <button
                        key={p.id}
                        className="prog-row"
                        onClick={() => navigate('programmes', p.id)}
                        style={{ opacity: 0.9 }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                          <div className="caption" style={{ marginTop: 2 }}>
                            {p.uni} · APS {p.aps} · {fmtR(p.fees)} / yr
                          </div>
                        </div>
                        <span className="badge warning">+{gap} APS</span>
                        <div className="fit">
                          <span className="n">{p.fit}</span>
                          <span className="caption">fit</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="caption" style={{ marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid hsl(var(--border))' }}>
                  Use the APS Simulator to see exactly which subject marks need to move.
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right column */}
        <div className="stack-3">
          {/* Strategic score */}
          {(() => {
            const scoreVal = strategicScore?.overall ?? 74;
            const prev     = strategicScore?.previous_score;
            const delta    = prev != null ? scoreVal - prev : 6;
            const subRows  = [
              ['Academic',           strategicScore?.academic_readiness    ?? 86],
              ['Career alignment',   strategicScore?.career_demand_alignment ?? 68],
              ['Financial',         strategicScore?.financial_feasibility  ?? 71],
              ['Personality fit',    strategicScore?.personality_career_fit ?? 79],
            ] as const;
            return (
              <div className="card">
                <div className="eyebrow"><span className="dot" />Strategic Score</div>
                <div className="row" style={{ alignItems: 'baseline', gap: '0.375rem', marginTop: '0.5rem' }}>
                  <span className="stat-num" style={{ fontSize: '3rem', lineHeight: 0.95 }}>{scoreVal}</span>
                  <span className="caption">/ 100</span>
                  <span className={`badge ${delta >= 0 ? 'success' : 'destructive'}`} style={{ marginLeft: 'auto' }}>
                    {delta >= 0 ? '+' : ''}{delta}
                  </span>
                </div>
                <div className="meter lg" style={{ marginTop: '0.5rem' }}><i style={{ width: `${scoreVal}%` }} /></div>
                <div className="caption" style={{ marginTop: '0.625rem' }}>
                  Composite of academic readiness, funding coverage, application momentum and capability fit.
                </div>
                <hr className="divider" />
                {subRows.map(([l, v]) => (
                  <div key={l} className="row-between" style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                    <span className="caption">{l}</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('intelligence')}
                  style={{ marginTop: '0.875rem', width: '100%' }}
                >
                  Open Intelligence →
                </button>
              </div>
            );
          })()}

          {/* Deadlines */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Deadlines</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Upcoming dates</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('deadlines')}>View all →</button>
            </div>
            <div className="stack">
              {(showAllDeadlines ? deadlineItems : deadlineItems.slice(0, 3)).map(d => (
                <div className="deadline" key={d.t}>
                  <div className="dl-date">
                    <span className="d">{d.d}</span>
                    <span className="m">{d.m}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{d.t}</div>
                    <div className="caption" style={{ marginTop: 1 }}>{d.sub}</div>
                  </div>
                  <span className={`badge${d.tag ? ` ${d.tag}` : ''}`}>{d.tagL}</span>
                </div>
              ))}
            </div>
            {deadlineItems.length > 3 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', marginTop: '0.625rem' }}
                onClick={() => setShowAllDeadlines(s => !s)}
              >
                {showAllDeadlines ? 'Show less' : `Show ${deadlineItems.length - 3} more deadlines`}
              </button>
            )}
          </div>

          <AiInsightCard
            context={{
              type: 'home',
              aps,
              subjects,
              psychProfile: psychProfile ?? null,
              capabilityData: capabilityData ?? null,
              strategicScore: strategicScore ?? null,
              topProgrammes: eligible.slice(0, 4),
              topCareers: [],
            }}
            navigate={(r) => navigate(r as Route)}
          />
        </div>
      </div>
    </div>
  );
}
