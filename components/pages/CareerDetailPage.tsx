'use client';

import type { Career, Programme, CapabilityData, Route } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import { getCareerCapRequirements } from '@/lib/scoring';

interface CareerDetailPageProps {
  career: Career | null;
  programmes?: Programme[];
  capabilityData?: CapabilityData | null;
  navigate: (r: Route, prog?: string) => void;
  savedProgrammeIds?: string[];
  userAps?: number;
}

const CAREER_TO_KEYWORDS: Record<string, string[]> = {
  'Software Engineer':       ['computer science', 'software', 'ict', 'information technology'],
  'Data Scientist':          ['data science', 'data analytics', 'statistics', 'computer science'],
  'Data Analyst':            ['data science', 'statistics', 'information technology'],
  'Actuary':                 ['actuarial'],
  'Quantitative Analyst':    ['actuarial', 'mathematics', 'statistics', 'finance'],
  'ML Engineer':             ['computer science', 'data science', 'artificial intelligence'],
  'Civil Engineer':          ['civil engineering', 'engineering'],
  'Mechanical Engineer':     ['mechanical engineering', 'engineering'],
  'Doctor (MBChB)':          ['mbchb', 'medicine', 'health science'],
  'Doctor':                  ['medicine', 'mbchb', 'health science'],
  'Nurse':                   ['nursing', 'health science'],
  'Lawyer':                  ['law', 'llb'],
  'Accountant':              ['accounting', 'bcom', 'finance'],
  'Financial Advisor':       ['finance', 'bcom', 'economics'],
  'Teacher':                 ['education', 'teaching', 'pgce'],
  'Entrepreneur':            ['bcom', 'management', 'business'],
  'Product Manager (Tech)':  ['computer science', 'software', 'information technology'],
  'Product Manager':         ['bcom', 'engineering', 'computer science'],
};

const TAG_TO_CAPS: Record<string, Array<keyof CapabilityData>> = {
  'STEM':            ['analytical_thinking', 'technical_aptitude'],
  'Science':         ['analytical_thinking', 'technical_aptitude'],
  'Tech':            ['technical_aptitude', 'analytical_thinking'],
  'Engineering':     ['technical_aptitude', 'analytical_thinking'],
  'Finance':         ['analytical_thinking', 'risk_tolerance_score'],
  'Business':        ['entrepreneurial_drive', 'communication_skills'],
  'Remote-friendly': ['communication_skills', 'perseverance'],
  'High growth':     ['perseverance', 'entrepreneurial_drive'],
  'Creative':        ['creative_thinking', 'communication_skills'],
  'Leadership':      ['leadership_potential', 'communication_skills'],
  'Health':          ['perseverance', 'communication_skills'],
  'Law':             ['analytical_thinking', 'communication_skills'],
};

const CAP_LABEL: Record<keyof CapabilityData, string> = {
  analytical_thinking: 'Analytical',
  creative_thinking: 'Creative',
  leadership_potential: 'Leadership',
  communication_skills: 'Communication',
  technical_aptitude: 'Technical',
  entrepreneurial_drive: 'Entrepreneurial',
  risk_tolerance_score: 'Risk tolerance',
  perseverance: 'Perseverance',
  academic_readiness: 'Academic readiness',
  career_readiness: 'Career readiness',
};

const SA_EMPLOYERS: Record<string, string[]> = {
  'Software Engineer':       ['Takealot', 'Standard Bank', 'Discovery Health', 'Investec', 'Allan Gray', 'Naspers / Prosus', 'BCX'],
  'Data Scientist':          ['Discovery Health', 'Absa', 'Old Mutual', 'DataProphet', 'BCX', 'Rand Merchant Bank', 'Sanlam'],
  'Data Analyst':            ['Discovery', 'Nedbank', 'Shoprite', 'Capitec', 'PwC', 'Deloitte', 'KPMG'],
  'Actuary':                 ['Old Mutual', 'Sanlam', 'Discovery', 'PwC', 'Deloitte', 'Liberty', 'Momentum'],
  'Quantitative Analyst':    ['Rand Merchant Bank', 'Investec', 'Absa CIB', 'Standard Bank CIB', 'Allan Gray', 'Coronation'],
  'ML Engineer':             ['DataProphet', 'Discovery', 'Naspers / Prosus', 'Standard Bank AI', 'Nuvei', 'AWS SA'],
  'Civil Engineer':          ['AECOM', 'WSP', 'Bigen Group', 'Aurecon', 'SMEC', 'eThekwini Municipality', 'SANRAL'],
  'Mechanical Engineer':     ['Sasol', 'Eskom', 'ArcelorMittal', 'AECI', 'Bidvest', 'Anglo American'],
  'Doctor (MBChB)':          ['Netcare', 'Life Healthcare', 'Mediclinic', 'Department of Health', 'NHLS', 'Groote Schuur'],
  'Doctor':                  ['Netcare', 'Life Healthcare', 'Mediclinic', 'Department of Health', 'NHLS'],
  'Nurse':                   ['Netcare', 'Life Healthcare', 'Department of Health', 'Mediclinic', 'SANBS'],
  'Lawyer':                  ['Webber Wentzel', 'Cliffe Dekker Hofmeyr', 'ENSafrica', 'Werksmans', 'DLA Piper ZA'],
  'Accountant':              ['PwC', 'Deloitte', 'EY', 'KPMG', 'Grant Thornton', 'BDO', 'Capitec'],
  'Financial Advisor':       ['Old Mutual', 'Sanlam', 'Liberty', 'Discovery', 'PSG Wealth', 'Momentum'],
  'Teacher':                 ['WCED', 'GDE', 'KZN DoE', 'Curro Holdings', 'ADvTECH', 'Spark Schools'],
  'Entrepreneur':            ['Own venture', 'Allan Gray Orbis Fellowship', 'Grindstone Accelerator', 'SEDA'],
  'Product Manager (Tech)':  ['Takealot', 'Standard Bank', 'Discovery', 'Naspers / Prosus', 'Jumo', 'Yoco'],
  'Product Manager':         ['Takealot', 'Capitec', 'Discovery', 'FNB', 'Standard Bank', 'Shoprite'],
};

const NEXT_STEPS: Record<string, string[]> = {
  'Software Engineer':       ['Build a portfolio project on GitHub (3–5 weeks)', 'Take CS50 or freeCodeCamp (free)', 'Apply to CS programmes with APS ≥ 30', 'Attend a hackathon this year'],
  'Data Scientist':          ['Learn Python basics (4 weeks, Kaggle free course)', 'Complete one end-to-end data project', 'Apply to BCom/BSc Data Science or Statistics', 'Join a data community (DataKind, Zindi)'],
  'Actuary':                 ['Confirm APS ≥ 42 for UCT/WITS actuarial', 'Study Maths intensively — need 80%+', 'Register for the actuarial science programme', 'Look into Allan Gray / Momentum bursaries'],
  'Civil Engineer':          ['Confirm APS ≥ 35 for engineering', 'Ensure Maths + Physical Sciences both above 60%', 'Apply to Eskom / AECOM graduate bursary', 'Visit ECSA website for engineering registration requirements'],
  'Doctor (MBChB)':          ['Target APS 42+ (MBChB is the most competitive)', 'Physical Sciences + Life Sciences + Maths required', 'Apply to UKZN / Wits / UP MBChB with early deadline', 'Shadow a doctor for work-experience letter'],
  'Doctor':                  ['Target APS 42+ and strong Maths + Sciences', 'Apply to UKZN / Wits / Sefako Makgatho MBChB', 'Explore Funza Lushaka or Medunsa bursary paths', 'Shadow a practitioner for experience letter'],
  'Lawyer':                  ['APS ≥ 33 typically needed for LLB', 'Focus on English and History for entry', 'Apply to UWC / Wits / UP Law Faculty', 'Attend a moot court or legal clinic as observer'],
  'Teacher':                 ['Look into Funza Lushaka bursary (covers full costs)', 'Confirm which subject you want to specialise in', 'Apply to BEd programmes at WITS / UJ / UNISA', 'Contact your district DoE about student placements'],
};

function getNextSteps(careerName: string, aps: number, minAps: number): string[] {
  const specific = NEXT_STEPS[careerName];
  if (specific) return specific;
  const gap = minAps - aps;
  return [
    gap > 0
      ? `Raise APS from ${aps} to ${minAps} — focus on your lowest-scoring subjects`
      : `Your APS of ${aps} meets the ${minAps} requirement — apply now`,
    'Research bursary options specific to this career on the Scholarships page',
    'Book an interview with a career counsellor at your school or SETA office',
    'Connect with a practitioner in this field for informational guidance',
  ];
}

function inferSubjectsFromAps(minAps: number): string {
  if (minAps >= 38) return 'Mathematics (60%+), Physical Sciences or Life Sciences, English HL';
  if (minAps >= 30) return 'Mathematics or Maths Literacy, English, relevant NSC subject';
  return 'English Home Language, any 4 NSC subjects at minimum marks';
}

function sparklinePoints(_baseSalary: number): string {
  const w = 160;
  const h = 48;
  const growth = [1, 1.12, 1.22, 1.35, 1.48, 1.6, 1.72, 1.82, 1.95, 2.1];
  const max = growth[growth.length - 1];
  return growth
    .map((g, i) => {
      const x = (i / (growth.length - 1)) * w;
      const y = h - ((g / max) * h * 0.85) - 4;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function CareerDetailPage({ career, programmes: propProgrammes, capabilityData, navigate, savedProgrammeIds = [], userAps = 0 }: CareerDetailPageProps) {
  if (!career) {
    return (
      <div className="page-anim">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="subheading" style={{ marginBottom: '0.75rem' }}>No career selected</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('careers')}>← Back to careers</button>
        </div>
      </div>
    );
  }

  const allProgs = propProgrammes && propProgrammes.length > 0 ? propProgrammes : PROGRAMMES;
  const savedSet = new Set(savedProgrammeIds);
  const keywords = CAREER_TO_KEYWORDS[career.name] ?? [];
  const keywordProgs = keywords.length > 0
    ? allProgs.filter(p => keywords.some(k => p.name.toLowerCase().includes(k)))
    : allProgs.filter(p => p.demand === career.demand && p.fit >= 70);
  const relatedProgs = (keywordProgs.length > 0 ? keywordProgs : allProgs)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 5);
  const fallbackProgs = relatedProgs.length > 0 ? relatedProgs : allProgs.sort((a, b) => b.fit - a.fit).slice(0, 3);

  // Capability requirements from the scoring engine — real required scores per cap
  const capReqs = getCareerCapRequirements(career.name);
  const capList = (Object.keys(capReqs) as Array<keyof CapabilityData>)
    .sort((a, b) => (capReqs[b] ?? 0) - (capReqs[a] ?? 0))
    .slice(0, 4);
  // Fallback to tag-based if archetype returned nothing (shouldn't happen)
  if (capList.length === 0) {
    const tagCaps = new Set<keyof CapabilityData>();
    career.tags.forEach(tag => (TAG_TO_CAPS[tag] ?? []).forEach(k => tagCaps.add(k)));
    if (tagCaps.size === 0) { tagCaps.add('analytical_thinking'); tagCaps.add('communication_skills'); }
    capList.push(...Array.from(tagCaps).slice(0, 4));
  }

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · Careers · Detail</div>
        <div className="row-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '0.5rem', padding: 0, fontSize: '0.8125rem' }}
              onClick={() => navigate('careers')}
            >
              ← Back to careers
            </button>
            <div className="eyebrow"><span className="dot" />Career path</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{career.name}</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>{career.why}</p>
          </div>
          <div className="row" style={{ alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span className={`badge ${career.demand === 'High' ? 'success' : 'warning'}`}>{career.demand} demand</span>
            {career.scarce_skill && (
              <span className="badge accent">Scarce skill</span>
            )}
            <div className="card compact" style={{ textAlign: 'center', padding: '0.5rem 0.875rem', minWidth: 80 }}>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>{career.match}</div>
              <div className="caption" style={{ fontSize: '0.625rem' }}>/ 100 match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Path visualization */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="eyebrow" style={{ marginBottom: '1rem' }}><span className="dot" />Your path to this career</div>
        <div className="path-viz">
          {[
            { icon: '🎯', label: 'Career goal', sub: career.name },
            null,
            { icon: '🎓', label: 'Qualification', sub: `${fallbackProgs[0]?.name ?? 'Degree programme'} or similar` },
            null,
            { icon: '📚', label: 'Required subjects', sub: inferSubjectsFromAps(fallbackProgs[0]?.aps ?? 30) },
            null,
            { icon: '🧠', label: 'Key capabilities', sub: capList.map(k => CAP_LABEL[k]).join(', ') },
          ].map((item, i) =>
            item === null ? (
              <div key={`arrow-${i}`} className="path-viz-arrow">↓</div>
            ) : (
              <div key={item.label} className="path-viz-step">
                <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{item.label}</div>
                <div className="caption" style={{ fontSize: '0.625rem', marginTop: '0.25rem' }}>{item.sub}</div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div className="stack-3">
          {/* Leading programmes */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div className="eyebrow"><span className="dot" />Degree pathways to this career</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('programmes')}>
                All →
              </button>
            </div>
            <div className="stack">
              {fallbackProgs.map(p => {
                const apsGap = Math.max(0, p.aps - userAps);
                const isSaved = savedSet.has(p.id);
                return (
                  <div
                    key={p.id}
                    style={{ padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('programmes', p.id)}
                    onKeyDown={e => e.key === 'Enter' && navigate('programmes', p.id)}
                  >
                    <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                      <div className="row" style={{ gap: '0.375rem' }}>
                        {isSaved && (
                          <span className="badge brand" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.25rem' }}>★ Saved</span>
                        )}
                        <span className={`badge ${p.pathway}`}>{p.pathway}</span>
                      </div>
                    </div>
                    <div className="caption" style={{ marginTop: 2 }}>{p.uni}</div>
                    <div className="row" style={{ gap: '0.875rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <span>
                        APS <strong style={{ color: apsGap === 0 ? 'hsl(var(--success))' : apsGap <= 3 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>{p.aps}</strong>
                        {apsGap > 0 && <span className="caption"> (+{apsGap})</span>}
                      </span>
                      <span>{fmtR(p.fees)}/yr</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{p.fit}% fit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary progression */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Salary progression</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {[
                { level: 'Entry',   years: '0–3 yrs',  mult: 0.55, cls: '' },
                { level: 'Mid',     years: '4–7 yrs',  mult: 1.0,  cls: '' },
                { level: 'Senior',  years: '8–14 yrs', mult: 1.6,  cls: 'success' },
                { level: 'Lead',    years: '15+ yrs',  mult: 2.2,  cls: 'success' },
              ].map(({ level, years, mult, cls }) => {
                const amt = Math.round(career.salary * mult);
                return (
                  <div key={level} className="card compact" style={{ padding: '0.75rem' }}>
                    <div className="caption" style={{ fontSize: '0.6875rem' }}>{level}</div>
                    <div style={{
                      fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.03em',
                      fontVariantNumeric: 'tabular-nums',
                      color: cls ? `hsl(var(--${cls}))` : undefined,
                    }}>
                      {fmtR(amt)}
                    </div>
                    <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.125rem' }}>/mo · {years}</div>
                    <div className="meter sm" style={{ marginTop: '0.5rem' }}>
                      <i style={{ width: `${Math.min(100, Math.round((mult / 2.2) * 100))}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="row-between" style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border))' }}>
              <svg width="100%" viewBox="0 0 160 36" preserveAspectRatio="none" style={{ display: 'block', height: 36 }}>
                <polyline
                  points={sparklinePoints(career.salary)}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="row-between" style={{ marginTop: '0.25rem' }}>
              <span className="caption" style={{ fontSize: '0.625rem' }}>Year 1</span>
              <span className="caption" style={{ fontSize: '0.625rem', color: 'hsl(var(--success))' }}>10-yr growth: {career.growth}</span>
            </div>
          </div>

          {/* Top SA employers */}
          {(() => {
            const employers = SA_EMPLOYERS[career.name] ?? SA_EMPLOYERS['Accountant'];
            return (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Top SA employers</div>
                <div className="row" style={{ gap: '0.375rem', flexWrap: 'wrap' }}>
                  {employers.map(e => (
                    <span key={e} className="career-tag" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{e}</span>
                  ))}
                </div>
                <div className="caption" style={{ marginTop: '0.625rem', fontSize: '0.6875rem' }}>
                  Companies actively recruiting {career.name}s in South Africa.
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right column */}
        <div className="stack-3">
          {/* Tags */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Career profile</div>
            <div className="row" style={{ gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              {career.tags.map(t => (
                <span key={t} className="career-tag">{t}</span>
              ))}
            </div>
            <div className="stack-2">
              {[
                { l: 'Median monthly salary', v: `${fmtR(career.salary)}/mo` },
                { l: '10-year growth', v: career.growth },
                { l: 'Market demand', v: `${career.demand} demand` },
                { l: 'Match score', v: `${career.match}/100` },
              ].map(row => (
                <div key={row.l} className="stat-pair">
                  <div className="l">{row.l}</div>
                  <div className="v" style={{ fontSize: '0.875rem' }}>{row.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable next steps */}
          {(() => {
            const minAps = fallbackProgs[0]?.aps ?? 30;
            const steps = getNextSteps(career.name, userAps, minAps);
            return (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Your next steps</div>
                <div className="stack">
                  {steps.map((step, i) => (
                    <div key={i} className="row" style={{ gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))', alignItems: 'flex-start' }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                        background: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                        color: i === 0 ? 'hsl(var(--primary-fg))' : 'hsl(var(--muted-fg))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.6875rem', marginTop: 1,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ marginTop: '0.875rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('programmes')}>Browse programmes →</button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('scholarships')}>Find funding →</button>
                </div>
              </div>
            );
          })()}

          {/* Skills gap */}
          {capabilityData && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Capability alignment</div>
              <div className="stack">
                {capList.map(key => {
                  const required = capReqs[key] ?? 70;
                  const yours = capabilityData[key] as number;
                  const gap = Math.max(0, required - yours);
                  return (
                    <div key={key}>
                      <div className="progress-row">
                        <span className="label">{CAP_LABEL[key]}</span>
                        <div className="meter" style={{ flex: 1, position: 'relative' }}>
                          <i style={{ width: `${yours}%`, background: gap > 0 ? 'hsl(var(--warning))' : undefined }} />
                          {/* Target marker */}
                          <span style={{
                            position: 'absolute', top: 0, bottom: 0, left: `${required}%`,
                            width: 2, background: 'hsl(var(--fg) / 0.35)',
                          }} />
                        </div>
                        <span className="val" style={{ color: gap > 0 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                          {yours}<span className="caption">/{required}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="caption" style={{ marginTop: '0.75rem', fontSize: '0.6875rem' }}>
                Bar line = target for {career.name}. Yellow = gap to address.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
