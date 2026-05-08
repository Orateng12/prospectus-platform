'use client';

import type { Route, Subject, Programme, DbApplication, StrategicScoreData } from '@/lib/types';
import { PROGRAMMES, APPS, DEADLINES } from '@/lib/data';
import { calcAPS, fmtR } from '@/lib/utils';
import AiInsightCard from '@/components/AiInsightCard';

interface HomePageProps {
  subjects: Subject[];
  navigate: (r: Route, prog?: string) => void;
  programmes?: Programme[];
  applications?: DbApplication[];
  strategicScore?: StrategicScoreData | null;
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

export default function HomePage({ subjects, navigate, programmes, applications = [], strategicScore }: HomePageProps) {
  const aps = calcAPS(subjects);
  const allProgs = programmes ?? PROGRAMMES;
  const eligible = allProgs.filter(p => p.aps <= aps);
  const direct = eligible.filter(p => p.pathway === 'direct').length;
  const extended = eligible.filter(p => p.pathway === 'extended' || p.pathway === 'foundation').length;

  const focuses = [
    { n: '01', t: 'Submit NSFAS supporting documents', s: <>Closes in <strong style={{ color: 'hsl(var(--destructive))' }}>2 days</strong> · ID copy + household income proof</>, cta: 'Open', primary: true },
    { n: '02', t: 'Apply for Allan Gray Orbis — 92% match', s: 'R 280,000 · closes 15 Oct · you meet every criterion bar one', cta: 'Apply' },
    { n: '03', t: 'Re-rank programmes after Maths bump', s: 'Your prelim Maths went 72→78 · opens 9 new programmes', cta: 'Re-rank' },
  ];

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

        <div className="card kpi">
          <div className="lbl">Eligible programmes</div>
          <div className="val">{eligible.length}</div>
          <div className="row" style={{ gap: '0.25rem', marginTop: '0.5rem' }}>
            <span className="badge direct">{direct} direct</span>
            <span className="badge extended">{extended} ext.</span>
          </div>
        </div>

        <div className="card kpi">
          <div className="lbl">Funding matched</div>
          <div className="val" style={{ color: 'hsl(var(--success))' }}>R&nbsp;412k</div>
          <div className="hint">across <strong style={{ color: 'hsl(var(--fg))' }}>9 sources</strong> · NSFAS + 8 bursaries</div>
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
              <button className="btn btn-ghost btn-sm">View all</button>
            </div>
            <div className="stack">
              {focuses.map(x => (
                <div className="focus-item" key={x.n}>
                  <span className="focus-num">{x.n}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="focus-title">{x.t}</div>
                    <div className="caption" style={{ marginTop: 2 }}>{x.s}</div>
                  </div>
                  <button className={`btn ${x.primary ? 'btn-primary' : 'btn-outline'} btn-sm`}>{x.cta}</button>
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
                    <h3 className="subheading" style={{ marginTop: '0.25rem' }}>{count} active</h3>
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
              psychProfile: null,
              capabilityData: null,
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
