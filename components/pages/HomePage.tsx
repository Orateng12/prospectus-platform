'use client';

import type { Route, Subject, Programme, DbApplication, StrategicScoreData, PsychProfileData, CapabilityData } from '@/lib/types';
import { PROGRAMMES, APPS, DEADLINES } from '@/lib/data';
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
): Array<{ icon: string; text: string; urgency: 'high' | 'med' | 'low'; route: Route }> {
  const items: Array<{ icon: string; text: string; urgency: 'high' | 'med' | 'low'; route: Route }> = [];
  const today = new Date();

  // 1. Urgent application deadlines within 14 days
  const urgentApp = applications
    .filter(a => a.deadline)
    .map(a => ({ ...a, daysLeft: Math.ceil((new Date(a.deadline!).getTime() - today.getTime()) / 86_400_000) }))
    .filter(a => a.daysLeft >= 0 && a.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];
  if (urgentApp) {
    items.push({
      icon: '⚠',
      text: `${urgentApp.institution_name} deadline in ${urgentApp.daysLeft} day${urgentApp.daysLeft !== 1 ? 's' : ''}`,
      urgency: urgentApp.daysLeft <= 3 ? 'high' : 'med',
      route: 'applications',
    });
  }

  // 2. Best APS leverage: raise one subject to unlock a nearby programme
  const nextProg = programmes
    .filter(p => p.aps > userAps && p.aps <= userAps + 6)
    .sort((a, b) => a.aps - b.aps)[0];
  const lowestSubject = [...subjects].filter(s => s.id !== 'lo').sort((a, b) => apsPoints(a.mark) - apsPoints(b.mark))[0];
  if (lowestSubject && nextProg) {
    items.push({
      icon: '📈',
      text: `Raise ${lowestSubject.name} to unlock ${nextProg.name}`,
      urgency: 'med',
      route: 'simulator',
    });
  }

  // 3. Saved programmes reminder or fallback prompt
  const savedCount = savedProgrammeIds.length;
  if (savedCount > 0) {
    items.push({
      icon: '★',
      text: `${savedCount} saved programme${savedCount !== 1 ? 's' : ''} — check deadlines`,
      urgency: 'low',
      route: 'programmes',
    });
  } else if (items.length < 2) {
    items.push({
      icon: '🎯',
      text: 'Browse scholarships — multiple matches for your profile',
      urgency: 'low',
      route: 'scholarships',
    });
  }

  return items.slice(0, 3);
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

export default function HomePage({ subjects, navigate, programmes, applications = [], strategicScore, householdIncome, savedProgrammeIds = [], psychProfile, capabilityData }: HomePageProps) {
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

  const rawFocuses = buildFocusItems(applications, subjects, allProgs, aps, savedProgrammeIds);
  // Pad to 3 items with a fallback if needed
  const focusFallbacks: typeof rawFocuses = [
    { icon: '📚', text: 'Re-rank programmes after subject update', urgency: 'low', route: 'simulator' },
    { icon: '🎯', text: 'Explore scholarship options — multiple matches', urgency: 'low', route: 'scholarships' },
    { icon: '🏛', text: 'Compare universities side-by-side', urgency: 'low', route: 'unis' },
  ];
  const focuses = [...rawFocuses, ...focusFallbacks].slice(0, 3);

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
              {Math.round((eligible.length / PROGRAMMES.length) * 100)}%
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

        <div className="card kpi">
          <div className="lbl">Strategic Score</div>
          <div className="row" style={{ alignItems: 'baseline', gap: '0.375rem' }}>
            <span className="val">{strategicScore?.overall ?? 74}</span>
            <span className="caption">/ 100</span>
            {(() => { const d = strategicScore?.previous_score != null ? (strategicScore.overall - strategicScore.previous_score) : 6; return <span className={`badge ${d >= 0 ? 'success' : 'destructive'}`} style={{ marginLeft: 'auto' }}>{d >= 0 ? '+' : ''}{d}</span>; })()}
          </div>
          <div className="hint">{strategicScore?.trend ? `Trending ${strategicScore.trend}.` : 'Best month yet.'}</div>
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="home-grid stack-3">
        {/* Left column */}
        <div className="stack-3">
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
                  </div>
                  <button
                    className={`btn ${x.urgency === 'high' ? 'btn-primary' : i === 0 ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => navigate(x.route)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          {(() => {
            const hasRealApps = applications.length > 0;
            const accepted = hasRealApps ? applications.filter(a => ['accepted','offer'].includes(a.status.toLowerCase())).length : 1;
            const pending   = hasRealApps ? applications.filter(a => ['pending','submitted'].includes(a.status.toLowerCase())).length : 1;
            const review    = hasRealApps ? applications.filter(a => !['accepted','offer','pending','submitted','rejected','declined'].includes(a.status.toLowerCase())).length : 1;
            const rejected  = hasRealApps ? applications.filter(a => ['rejected','declined'].includes(a.status.toLowerCase())).length : 1;
            const count     = hasRealApps ? applications.length : APPS.length;
            return (
              <div className="card">
                <div className="row-between" style={{ marginBottom: '0.875rem' }}>
                  <div>
                    <div className="eyebrow"><span className="dot" />Application pipeline</div>
                    <h3 className="subheading" style={{ marginTop: '0.25rem', cursor: 'pointer' }} onClick={() => navigate('applications')}>{count} active →</h3>
                  </div>
                  <div className="row">
                    {accepted > 0 && <span className="badge success">{accepted} accepted</span>}
                    {pending  > 0 && <span className="badge warning">{pending} pending</span>}
                    {review   > 0 && <span className="badge info">{review} review</span>}
                    {rejected > 0 && <span className="badge destructive">{rejected} rejected</span>}
                  </div>
                </div>
                <div className="stack">
                  {hasRealApps ? applications.map(a => (
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
                  )) : APPS.map(a => (
                    <div className="pipe-row" key={a.uni}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.uni}</div>
                        <div className="caption" style={{ marginTop: 2 }}>{a.meta}</div>
                      </div>
                      <div className="pipe-stages">
                        {a.stages.map((s, i) => (
                          <span key={i} className={`stage${s ? ` ${s}` : ''}`} />
                        ))}
                      </div>
                      <span className={`badge ${a.status}`}>{a.label}</span>
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
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Personalised by capability + market fit</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('programmes')}>
                All {eligible.length} →
              </button>
            </div>
            <div className="stack">
              {eligible.slice(0, 4).map(p => (
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
            <div className="eyebrow"><span className="dot" />Deadlines</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Next 14 days</h3>
            <div className="stack" style={{ marginTop: '0.875rem' }}>
              {DEADLINES.slice(0, 3).map(d => (
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
