'use client';

import { useState, useMemo } from 'react';
import { CAREERS, PROGRAMMES } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import { scoreCareerMatch } from '@/lib/scoring';
import type { Career, CompareItem, PsychProfileData, CapabilityData, Route, Programme } from '@/lib/types';

interface CareersPageProps {
  careers?: Career[];
  compareItems?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
  userAps?: number;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  onOpenDetail?: (career: Career) => void;
  navigate?: (r: Route) => void;
  initialTab?: Tab;
  programmes?: Programme[];
}

type Tab = 'fit' | 'demand' | 'growth' | 'salary' | 'discover';

function parseGrowth(g: string): number {
  return parseFloat(g.replace('%', '')) || 0;
}

// ── Discover tab helpers ─────────────────────────────────────────────────────

type RiasecKey = 'realistic' | 'investigative' | 'artistic' | 'social' | 'enterprising' | 'conventional';

const RIASEC_DESCRIPTORS: Record<RiasecKey, { label: string; cluster: string; examples: string }> = {
  investigative: { label: 'Investigative',  cluster: 'quantitative analysis',        examples: 'data science, actuarial science and quant finance' },
  realistic:     { label: 'Realistic',      cluster: 'applied engineering',           examples: 'civil, mechanical and electrical engineering' },
  artistic:      { label: 'Artistic',       cluster: 'creative and design work',      examples: 'UX design, architecture and media production' },
  social:        { label: 'Social',         cluster: 'people-centred professions',    examples: 'teaching, social work and healthcare' },
  enterprising:  { label: 'Enterprising',   cluster: 'business leadership',           examples: 'management, entrepreneurship and law' },
  conventional:  { label: 'Conventional',   cluster: 'structured finance and admin',  examples: 'accounting, compliance and financial advisory' },
};

const CAP_LABELS: Array<[keyof CapabilityData, string]> = [
  ['analytical_thinking',  'Analytical'],
  ['technical_aptitude',   'Technical'],
  ['communication_skills', 'Communication'],
  ['creative_thinking',    'Creative'],
  ['leadership_potential', 'Leadership'],
  ['entrepreneurial_drive','Entrepreneurial'],
];

function buildInsightText(psychProfile: PsychProfileData, capabilityData: CapabilityData | null | undefined): string {
  const riasecKeys: RiasecKey[] = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
  const sorted = [...riasecKeys].sort((a, b) => (psychProfile[b] as number) - (psychProfile[a] as number));
  const dominant  = RIASEC_DESCRIPTORS[sorted[0]];
  const secondary = RIASEC_DESCRIPTORS[sorted[1]];
  const domScore   = (psychProfile[sorted[0]] as number) ?? 0;
  const secScore   = (psychProfile[sorted[1]] as number) ?? 0;

  let capPhrase = '';
  let capAction = '';
  if (capabilityData) {
    const ranked = [...CAP_LABELS].sort((a, b) => (capabilityData[b[0]] as number) - (capabilityData[a[0]] as number));
    const top2 = ranked.slice(0, 2);
    const bottom = ranked[ranked.length - 1];
    capPhrase = ` paired with strong ${top2[0][1].toLowerCase()} and ${top2[1][1].toLowerCase()} capability`;
    capAction = ` Lifting ${bottom[1].toLowerCase()} (currently your lowest dimension) by 10 points would widen your top match score by an estimated 5–8%.`;
  }

  const dominanceNote = domScore >= 75
    ? `Your ${dominant.label} score (${domScore}) is distinctly high`
    : `Your ${dominant.label} tendency (${domScore}) shapes your strongest fits`;

  return (
    `${dominanceNote}${capPhrase}. ` +
    `The sharpest career cluster for you is ${dominant.cluster} — spanning ${dominant.examples}. ` +
    `Your secondary ${secondary.label} streak (${secScore}) means you can bridge into ${secondary.cluster} without a full pivot — hybrid roles like ${
      sorted[0] === 'investigative' && sorted[1] === 'enterprising' ? 'product management or VC analyst'
      : sorted[0] === 'realistic' && sorted[1] === 'investigative' ? 'R&D engineering or data systems'
      : sorted[0] === 'social' && sorted[1] === 'enterprising' ? 'EdTech or health startups'
      : sorted[0] === 'enterprising' && sorted[1] === 'conventional' ? 'corporate finance or strategy consulting'
      : `${secondary.examples.split(',')[0].trim()}`
    } often suit this combination well in SA.${capAction}`
  );
}

const CATEGORIES = [
  { label: 'STEM',      icon: '⚗️', desc: 'Science, tech, engineering & maths',  route: 'careers'    as Route },
  { label: 'Finance',   icon: '💹', desc: 'Actuarial, accounting, banking',       route: 'funding'    as Route },
  { label: 'Health',    icon: '🩺', desc: 'Medicine, nursing, pharmacy',          route: 'programmes' as Route },
  { label: 'Law',       icon: '⚖️', desc: 'LLB, corporate, public interest',      route: 'programmes' as Route },
  { label: 'Arts',      icon: '🎨', desc: 'Design, media, architecture',          route: 'programmes' as Route },
  { label: 'Education', icon: '📚', desc: 'Teaching, higher education',           route: 'programmes' as Route },
];

function careerTileClass(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('machine learning') || n.includes('ml eng')) return 'ml';
  if (n.includes('software') || n.includes('developer') || n.includes('cloud eng') || n.includes('blockchain')) return 'swe';
  if (n.includes('data scientist') || n.includes('data analyst')) return 'data';
  if (n.includes('actuar')) return 'actuary';
  if (n.includes('quant')) return 'quant';
  if (n.includes('product manager') || n.includes('ux') || n.includes('ui design')) return 'pm';
  if (n.includes('civil') || n.includes('structural') || n.includes('mechanical') || n.includes('architect')) return 'civil';
  if (n.includes('doctor') || n.includes('medicine') || n.includes('mbchb') || n.includes('nurse') ||
      n.includes('pharma') || n.includes('physio') || n.includes('radiograph') || n.includes('lab tech') ||
      n.includes('veterinar')) return 'med';
  if (n.includes('account') || n.includes('chartered') || n.includes('financial') || n.includes('compliance')) return 'finance';
  if (n.includes('teacher') || n.includes('educator') || n.includes('psycholog') || n.includes('social work')) return 'edu';
  if (n.includes('electrician') || n.includes('plumber') || n.includes('welder') || n.includes('boilermaker') ||
      n.includes('instrument') || n.includes('mineral')) return 'trades';
  if (n.includes('data')) return 'data';
  if (n.includes('engineer')) return 'swe';
  return 'default-career';
}

const CAREER_ICON: Record<string, string> = {
  swe:            '⌨',
  data:           '∑',
  actuary:        'π',
  quant:          '⬡',
  ml:             '◉',
  pm:             '◈',
  civil:          '△',
  med:            '⚕',
  finance:        '§',
  edu:            '✎',
  trades:         '⚡',
  'default-career':'✦',
};

// ────────────────────────────────────────────────────────────────────────────

export default function CareersPage({
  careers: propCareers,
  compareItems = [],
  onToggleCompare,
  userAps,
  psychProfile,
  capabilityData,
  onOpenDetail,
  navigate,
  initialTab,
  programmes,
}: CareersPageProps) {
  const allCareers = propCareers && propCareers.length > 0 ? propCareers : CAREERS;
  const allProgs = (programmes && programmes.length > 0 ? programmes : PROGRAMMES);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? 'fit');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  const withLiveMatch = useMemo(() => allCareers.map(c => ({
    ...c,
    match: psychProfile && capabilityData && userAps !== undefined
      ? scoreCareerMatch(c.name, psychProfile, capabilityData, userAps)
      : userAps !== undefined
      ? Math.min(100, Math.round(c.match * 0.7 + Math.min(userAps / 42 * 30, 30)))
      : c.match,
  })), [allCareers, psychProfile, capabilityData, userAps]);

  const displayed = useMemo(() => {
    let list = [...withLiveMatch];
    if (activeTab === 'demand') {
      list = list.filter(c => c.demand === 'High').sort((a, b) => b.match - a.match);
    } else if (activeTab === 'growth') {
      list = list.sort((a, b) => parseGrowth(b.growth) - parseGrowth(a.growth));
    } else if (activeTab === 'salary') {
      list = list.sort((a, b) => b.salary - a.salary);
    } else {
      list = list.sort((a, b) => b.match - a.match);
    }
    return list.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [withLiveMatch, activeTab]);

  const highDemandCount = allCareers.filter(c => c.demand === 'High').length;

  const filteredProgs = query
    ? allProgs.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.uni.toLowerCase().includes(query.toLowerCase())
      )
    : allProgs.slice(0, 4);

  const filteredCareers = query
    ? allCareers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : allCareers.slice(0, 3);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Career Explorer</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Discover</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Career explorer</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {allCareers.length} roles ranked against your capability graph and labour-market signal.
              Each card shows fit, salary, growth and one line on why.
            </p>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab ${activeTab === 'fit' ? 'active' : ''}`} onClick={() => { setActiveTab('fit'); setVisibleCount(9); }}>
          Best fit ({allCareers.length})
        </button>
        <button className={`tab ${activeTab === 'demand' ? 'active' : ''}`} onClick={() => { setActiveTab('demand'); setVisibleCount(9); }}>
          High demand ({highDemandCount})
        </button>
        <button className={`tab ${activeTab === 'growth' ? 'active' : ''}`} onClick={() => { setActiveTab('growth'); setVisibleCount(9); }}>
          High growth
        </button>
        <button className={`tab ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => { setActiveTab('salary'); setVisibleCount(9); }}>
          Top salary
        </button>
        <button className={`tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => { setActiveTab('discover'); setVisibleCount(9); }}>
          For You
          <span className="badge brand" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.375rem', marginLeft: '0.375rem' }}>AI</span>
        </button>
      </div>

      {/* Recommended strip — shown on all non-discover tabs when APS is available */}
      {activeTab !== 'discover' && userAps !== undefined && userAps > 0 && displayed.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '0.75rem' }}>
            <div className="eyebrow"><span className="dot" />Top 3 matches for your profile</div>
          </div>
          <div className="grid-3" style={{ gap: '0.75rem' }}>
            {displayed.slice(0, 3).map(c => (
              <button
                key={c.name}
                className="card compact"
                style={{ textAlign: 'left', cursor: 'pointer', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
                onClick={() => onOpenDetail?.(c)}
              >
                <div className="row-between">
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.name}</div>
                  <span className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`} style={{ height: '1.25rem', fontSize: '0.5625rem' }}>
                    {c.demand}
                  </span>
                </div>
                <div className="meter sm"><i style={{ width: `${c.match}%` }} /></div>
                <div className="row-between">
                  <span className="caption">{c.match}% match</span>
                  <span className="caption" style={{ color: 'hsl(var(--success))' }}>{c.growth}</span>
                </div>
                <div className="caption" style={{ color: 'hsl(var(--muted-fg))' }}>{fmtR(c.salary)}/mo</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'discover' ? (
        <div className="page-anim">
          {/* Big search */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', color: 'hsl(var(--muted-fg))' }}>⌕</span>
              <input
                className="input"
                style={{ flex: 1, minWidth: 0, height: '2.75rem', fontSize: '1rem' }}
                placeholder="Try: data science in Gauteng, or: careers with salary over R40k…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="btn btn-ghost btn-sm" onClick={() => setQuery('')}>Clear</button>
              )}
            </div>
            {!query && (
              <div className="row" style={{ marginTop: '0.875rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(() => {
                  const chips: string[] = [];
                  if (psychProfile) {
                    const riasecKeys: RiasecKey[] = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
                    const top = [...riasecKeys].sort((a, b) => ((psychProfile[b] as number) ?? 0) - ((psychProfile[a] as number) ?? 0))[0];
                    if (top === 'investigative') chips.push('Data Scientist', 'Actuary');
                    else if (top === 'realistic') chips.push('Mechanical Engineer', 'Civil Engineer');
                    else if (top === 'artistic') chips.push('UX Designer', 'Architect');
                    else if (top === 'social') chips.push('Teacher', 'Nurse', 'Social Worker');
                    else if (top === 'enterprising') chips.push('Entrepreneur', 'Product Manager');
                    else chips.push('Accountant', 'Financial Advisor');
                  }
                  chips.push('High demand careers', 'Remote-friendly');
                  return [...new Set(chips)].slice(0, 5).map(s => (
                    <button key={s} className="badge" style={{ cursor: 'pointer', height: '1.75rem', fontSize: '0.75rem' }}
                      onClick={() => setQuery(s)}>
                      {s}
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>

          {!query ? (
            <>
              {/* Category browse */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="sec">
                  <h3>Browse by category</h3>
                </div>
                <div className="grid-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.label}
                      className="card interactive"
                      style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                      onClick={() => navigate?.(cat.route)}
                    >
                      <div style={{ fontSize: '1.75rem' }}>{cat.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{cat.label}</div>
                      <div className="caption" style={{ fontSize: '0.8125rem' }}>{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI insight */}
              <div className="card">
                <div className="eyebrow"><span className="dot" />AI insight · for you</div>
                {psychProfile ? (
                  <>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'hsl(var(--fg))' }}>
                      {buildInsightText(psychProfile, capabilityData)}
                    </p>
                    <div className="row" style={{ marginTop: '0.75rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('fit')}>Best Fit →</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate?.('intelligence')}>Why this?</button>
                    </div>
                  </>
                ) : (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'hsl(var(--muted-fg))' }}>
                    Complete your profile assessment to unlock personalised AI insights.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="stack-3">
              {filteredProgs.length > 0 && (
                <div>
                  <div className="sec"><h3>Programmes</h3><span className="caption">{filteredProgs.length} results</span></div>
                  <div className="stack">
                    {filteredProgs.map(p => (
                      <button key={p.id} className="prog-row" style={{ textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => navigate?.('programmes')}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                          <div className="caption" style={{ marginTop: 2 }}>{p.uni} · APS {p.aps} · {fmtR(p.fees)}/yr</div>
                        </div>
                        <span className={`badge ${p.pathway}`}>{p.pathway[0].toUpperCase() + p.pathway.slice(1)}</span>
                        <div className="fit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                          <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '1rem' }}>{p.fit}</span>
                          <span className="caption">fit</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {filteredCareers.length > 0 && (
                <div>
                  <div className="sec"><h3>Careers</h3><span className="caption">{filteredCareers.length} results</span></div>
                  <div className="stack">
                    {filteredCareers.map(c => (
                      <div key={c.name} className="card compact" style={{ cursor: 'pointer' }} onClick={() => onOpenDetail?.(c)}>
                        <div className="row-between">
                          <div style={{ fontWeight: 700 }}>{c.name}</div>
                          <div className="row" style={{ gap: '0.375rem' }}>
                            {c.scarce_skill && <span className="badge accent" style={{ height: '1.125rem', fontSize: '0.5625rem' }}>Scarce skill</span>}
                            <span className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`}>{c.demand} demand</span>
                          </div>
                        </div>
                        <div className="caption" style={{ marginTop: '0.25rem' }}>{fmtR(c.salary)}/mo · {c.growth} growth</div>
                        <div className="row" style={{ gap: '0.25rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                          {c.tags.slice(0, 3).map(t => (
                            <span key={t} className="career-tag" style={{ fontSize: '0.625rem' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {filteredProgs.length === 0 && filteredCareers.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="caption">No results for &ldquo;{query}&rdquo; — try a different search term</div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid-3">
            {displayed.slice(0, visibleCount).map(c => (
              <div className="career-card" key={c.name}>
                <div className={`img-tile ${careerTileClass(c.name)}`} aria-hidden="true">
                  <span className="glyph">{CAREER_ICON[careerTileClass(c.name)] ?? '✦'}</span>
                </div>
                <div className="row-between">
                  <div className="row" style={{ gap: '0.5rem' }}>
                    <div className="career-rank">{String(c.rank).padStart(2, '0')}</div>
                    <span
                      className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`}
                      style={{ height: '1.25rem', fontSize: '0.625rem' }}
                    >
                      {c.demand} demand
                    </span>
                    {c.scarce_skill && (
                      <span className="badge accent" style={{ height: '1.25rem', fontSize: '0.625rem' }}>
                        Scarce skill
                      </span>
                    )}
                  </div>
                  <div className="row" style={{ gap: '0.375rem', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                      {c.match}
                    </span>
                    <span className="caption" style={{ fontSize: '0.6875rem' }}>/100</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>{c.name}</div>
                  <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${c.match}%` }} /></div>
                </div>

                <div className="row-between" style={{ fontSize: '0.75rem', paddingTop: '0.375rem', borderTop: '1px solid hsl(var(--border))' }}>
                  <div>
                    <div className="caption" style={{ fontSize: '0.625rem' }}>Median salary</div>
                    <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {fmtR(c.salary)}<span className="caption" style={{ fontWeight: 600 }}>/mo</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="caption" style={{ fontSize: '0.625rem' }}>10-yr growth</div>
                    <div style={{ fontWeight: 800, color: 'hsl(var(--success))' }}>{c.growth}</div>
                  </div>
                </div>

                <p className="body-text" style={{ fontSize: '0.8125rem', lineHeight: 1.55, margin: 0 }}>{c.why}</p>

                <div className="row" style={{ gap: '0.25rem' }}>
                  {c.tags.map(t => (
                    <span key={t} className="career-tag">{t}</span>
                  ))}
                </div>

                <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                  {onToggleCompare && (
                    <button
                      className={`btn btn-sm ${compareItems.some(ci => ci.name === c.name) ? 'btn-primary' : 'btn-outline'}`}
                      style={{ flex: 1 }}
                      onClick={() => onToggleCompare({ id: c.name, kind: 'career', name: c.name })}
                    >
                      {compareItems.some(ci => ci.name === c.name) ? '✓ Added' : 'Compare'}
                    </button>
                  )}
                  {onOpenDetail && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => onOpenDetail(c)}
                    >
                      Open path
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {visibleCount < displayed.length && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => setVisibleCount(v => Math.min(v + 9, displayed.length))}
              >
                Show {Math.min(9, displayed.length - visibleCount)} more careers
              </button>
              <div className="caption" style={{ marginTop: '0.5rem', color: 'hsl(var(--muted-fg))' }}>
                Showing {Math.min(visibleCount, displayed.length)} of {displayed.length}
              </div>
            </div>
          )}

          {(() => {
            if (!displayed[0] || !displayed[1] || !displayed[2]) return null;
            const top3 = displayed.slice(0, 3);
            const minSal = Math.min(...top3.map(c => c.salary));
            const maxSal = Math.max(...top3.map(c => c.salary));
            const highDemandTop = top3.filter(c => c.demand === 'High').length;
            const scarceTop = top3.filter(c => c.scarce_skill).length;
            const growthLeader = [...top3].sort((a, b) => parseGrowth(b.growth) - parseGrowth(a.growth))[0];
            const salaryVsGradAvg = minSal > 22000;
            return (
              <div className="card" style={{ marginTop: '1.25rem' }}>
                <div className="row-between" style={{ marginBottom: '0.875rem' }}>
                  <div>
                    <div className="eyebrow"><span className="dot" />AI commentary</div>
                    <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Reading your top 3</h3>
                  </div>
                  <div className="row" style={{ gap: '0.375rem' }}>
                    {scarceTop > 0 && <span className="badge accent">{scarceTop} scarce skill{scarceTop > 1 ? 's' : ''}</span>}
                    {highDemandTop > 0 && <span className="badge success">{highDemandTop} high demand</span>}
                  </div>
                </div>
                <p className="body-text" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65 }}>
                  <strong>{top3[0].name}</strong>, <strong>{top3[1].name}</strong> and{' '}
                  <strong>{top3[2].name}</strong> lead your ranking.{' '}
                  {minSal === maxSal
                    ? `All three pay ${fmtR(minSal)}/mo median`
                    : `Your salary range across the top 3 is ${fmtR(minSal)}–${fmtR(maxSal)}/mo median`}
                  {salaryVsGradAvg ? ', well above the SA graduate average of ~R22,000/mo' : ''}.{' '}
                  <strong>{growthLeader.name}</strong> leads on growth at{' '}
                  <span style={{ color: 'hsl(var(--success))' }}>{growthLeader.growth}</span> over 10 years.{' '}
                  {highDemandTop === 3
                    ? 'All 3 have high employer demand — strong labour-market positioning.'
                    : highDemandTop > 0
                    ? `${highDemandTop} of 3 have high employer demand. Check the High demand tab to compare alternatives.`
                    : 'Switch to the High demand tab to find roles with stronger current hiring in SA.'}
                </p>
                <div className="row" style={{ marginTop: '0.875rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('discover')}>Explore For You →</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate?.('intelligence')}>Full intelligence →</button>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
