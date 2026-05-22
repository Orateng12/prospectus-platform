'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Route, Subject, Programme, CompareItem, PsychProfileData, CapabilityData } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { calcAPS, fmtR, uniToneClass, uniLogoPath } from '@/lib/utils';
import { scoreCareerMatch } from '@/lib/scoring';
import { toggleSavedProgramme } from '@/app/actions/toggleSavedProgramme';
import AddApplicationModal from '@/components/AddApplicationModal';

interface ProgrammePageProps {
  selectedProg: string;
  subjects: Subject[];
  navigate: (r: Route) => void;
  programmes?: Programme[];
  savedProgrammeIds?: string[];
  compareItems?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  userAps?: number;
  householdIncome?: number;
  onOpenCareer?: (name: string) => void;
}

type BadgeVariant = 'success' | 'warning' | 'accent';
interface ClusterCareer { name: string; badgeClass: BadgeVariant }

function getCareerCluster(programmeName: string): ClusterCareer[] {
  const n = programmeName.toLowerCase();
  if (n.includes('computer science') || n.includes('software') || n.includes('ict') || n.includes('app dev') || n.includes('information technology')) {
    return [
      { name: 'Software Engineer',         badgeClass: 'success' },
      { name: 'Data Scientist',            badgeClass: 'success' },
      { name: 'ML Engineer',               badgeClass: 'warning' },
      { name: 'Product Manager (Tech)',     badgeClass: 'warning' },
    ];
  }
  if (n.includes('data science') || n.includes('data analytics') || n.includes('statistics')) {
    return [
      { name: 'Data Scientist',            badgeClass: 'success' },
      { name: 'Data Analyst',              badgeClass: 'success' },
      { name: 'ML Engineer',               badgeClass: 'warning' },
      { name: 'Quantitative Analyst',      badgeClass: 'warning' },
    ];
  }
  if (n.includes('actuarial')) {
    return [
      { name: 'Actuary',                   badgeClass: 'success' },
      { name: 'Quantitative Analyst',      badgeClass: 'success' },
      { name: 'Data Analyst',              badgeClass: 'warning' },
      { name: 'Financial Advisor',         badgeClass: 'warning' },
    ];
  }
  if (n.includes('engineering') || n.includes('mech') || n.includes('civil') || n.includes('electrical') || n.includes('chemical')) {
    return [
      { name: 'Civil Engineer',            badgeClass: 'success' },
      { name: 'Mechanical Engineer',       badgeClass: 'success' },
      { name: 'Software Engineer',         badgeClass: 'warning' },
      { name: 'Product Manager',           badgeClass: 'warning' },
    ];
  }
  if (n.includes('medicine') || n.includes('mbchb') || n.includes('health science') || n.includes('nursing') || n.includes('pharmacy')) {
    return [
      { name: 'Doctor',                    badgeClass: 'success' },
      { name: 'Nurse',                     badgeClass: 'success' },
      { name: 'Doctor (MBChB)',            badgeClass: 'warning' },
      { name: 'Entrepreneur',              badgeClass: 'warning' },
    ];
  }
  if (n.includes('finance') || n.includes('bcom') || n.includes('accounting') || n.includes('economics')) {
    return [
      { name: 'Accountant',                badgeClass: 'success' },
      { name: 'Financial Advisor',         badgeClass: 'success' },
      { name: 'Actuary',                   badgeClass: 'warning' },
      { name: 'Entrepreneur',              badgeClass: 'warning' },
    ];
  }
  if (n.includes('law') || n.includes('llb')) {
    return [
      { name: 'Lawyer',                    badgeClass: 'success' },
      { name: 'Entrepreneur',              badgeClass: 'warning' },
      { name: 'Financial Advisor',         badgeClass: 'warning' },
      { name: 'Teacher',                   badgeClass: 'warning' },
    ];
  }
  if (n.includes('education') || n.includes('teaching') || n.includes('pgce')) {
    return [
      { name: 'Teacher',                   badgeClass: 'success' },
      { name: 'Entrepreneur',              badgeClass: 'warning' },
      { name: 'Product Manager',           badgeClass: 'warning' },
      { name: 'Lawyer',                    badgeClass: 'warning' },
    ];
  }
  return [
    { name: 'Entrepreneur',               badgeClass: 'success' },
    { name: 'Product Manager',            badgeClass: 'warning' },
    { name: 'Data Analyst',              badgeClass: 'warning' },
    { name: 'Teacher',                   badgeClass: 'warning' },
  ];
}

const PROGRAMME_EMPLOYERS: Record<string, string[]> = {
  cs:      ['Takealot', 'Standard Bank', 'Naspers / Prosus', 'Google ZA', 'Investec'],
  data:    ['Discovery Health', 'Absa', 'Old Mutual', 'DataProphet', 'BCX'],
  actuar:  ['Old Mutual', 'Sanlam', 'Momentum', 'Discovery', 'PwC Actuarial'],
  eng:     ['Sasol', 'Eskom', 'Anglo American', 'Murray & Roberts', 'Aurecon'],
  health:  ['Netcare', 'MediClinic', 'Life Healthcare', 'NHLS', 'Groote Schuur'],
  finance: ['KPMG', 'Deloitte', 'Rand Merchant Bank', 'Investec', 'Standard Bank'],
  law:     ['Bowmans', 'ENSafrica', 'Werksmans', 'DLA Piper ZA', 'Legal Aid SA'],
  edu:     ['WCED', 'GDE', 'IEB schools', 'Curro', 'Spark Schools'],
  default: ['Discovery', 'Standard Bank', 'Naspers / Prosus', 'Allan Gray', 'Old Mutual'],
};

function getProgrammeEmployers(programmeName: string): string[] {
  const n = programmeName.toLowerCase();
  if (n.includes('computer science') || n.includes('software') || n.includes('ict') || n.includes('information technology')) return PROGRAMME_EMPLOYERS.cs;
  if (n.includes('data science') || n.includes('data analytics') || n.includes('statistics')) return PROGRAMME_EMPLOYERS.data;
  if (n.includes('actuarial')) return PROGRAMME_EMPLOYERS.actuar;
  if (n.includes('engineering') || n.includes('mech') || n.includes('civil') || n.includes('electrical') || n.includes('chemical')) return PROGRAMME_EMPLOYERS.eng;
  if (n.includes('medicine') || n.includes('mbchb') || n.includes('nursing') || n.includes('pharmacy') || n.includes('health')) return PROGRAMME_EMPLOYERS.health;
  if (n.includes('finance') || n.includes('accounting') || n.includes('bcom') || n.includes('economics')) return PROGRAMME_EMPLOYERS.finance;
  if (n.includes('law') || n.includes('llb')) return PROGRAMME_EMPLOYERS.law;
  if (n.includes('education') || n.includes('teaching') || n.includes('pgce')) return PROGRAMME_EMPLOYERS.edu;
  return PROGRAMME_EMPLOYERS.default;
}



const PATHWAY_LABELS: Record<string, string> = {
  direct:     'Direct entry',
  extended:   'Extended',
  foundation: 'Foundation',
  tvet:       'TVET',
};

/* ─── Detail view ─────────────────────────────────────────────── */
function ProgDetail({
  p, aps, subjects, navigate, onBack, isSaved, onToggleSave, onApply, applyState, psychProfile, capabilityData,
  householdIncome, onOpenCareer,
}: {
  p: Programme;
  aps: number;
  subjects: Subject[];
  navigate: (r: Route) => void;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onApply: () => void;
  applyState: 'idle' | 'pending' | 'done' | 'exists';
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  householdIncome?: number;
  onOpenCareer?: (name: string) => void;
}) {
  const durYears = p.dur ?? 3;
  const YEAR_LABELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
  const YEAR_TITLES = ['Foundations', 'Core modules', 'Specialisation', 'Honours / Professional'];
  const YEAR_DESCS = [
    'Core theory, introduction to the discipline, introductory mathematics and communication modules',
    'Specialisation subjects, practical applications, two electives in your chosen track',
    `Capstone project + advanced electives in chosen track${durYears > 3 ? '; preparation for professional practice' : ''}`,
    'Honours year / professional practice component; industry placement or research thesis',
  ];
  const structure = Array.from({ length: Math.min(durYears, 4) }, (_, i) => ({
    y: YEAR_LABELS[i],
    t: YEAR_TITLES[i],
    d: YEAR_DESCS[i],
  }));

  // Build subject requirements from programme data where available
  const subjectMarks = Object.fromEntries(subjects.map(s => [s.name.toLowerCase(), s.mark]));
  const requiredFromProg = (p.requiredSubjects ?? []).map(req => {
    const matchedMark = Object.entries(subjectMarks).find(([n]) => n.includes(req.toLowerCase()))?.[1] ?? null;
    return {
      name: req,
      req: p.aps >= 38 ? 60 : 50,
      mark: matchedMark,
    };
  });
  const requirements = requiredFromProg.length > 0
    ? [
        ...requiredFromProg,
        { name: 'English Home / First Add. Lang.', req: 50, mark: subjectMarks['english home language'] ?? subjectMarks['english first additional'] ?? null },
        { name: 'NBT / institutional test', req: 55, mark: null as number | null },
      ]
    : [
        { name: 'Mathematics / Maths Literacy', req: p.aps >= 35 ? 60 : 50, mark: subjectMarks['mathematics'] ?? subjectMarks['mathematical literacy'] ?? null },
        { name: 'English Home / First Add. Lang.', req: 50, mark: subjectMarks['english home language'] ?? subjectMarks['english first additional'] ?? null },
        { name: 'Relevant NSC subject', req: 50, mark: null as number | null },
        { name: 'NBT / institutional test', req: 55, mark: null as number | null },
      ];

  const cluster = getCareerCluster(p.name);
  const careerPaths = cluster.map(({ name, badgeClass }) => {
    const score = psychProfile && capabilityData
      ? scoreCareerMatch(name, psychProfile, capabilityData, aps)
      : null;
    return {
      name,
      cls: score !== null ? (score >= 80 ? 'success' : score >= 65 ? 'warning' : 'accent') : badgeClass as string,
      label: score !== null ? `${score}%` : '—',
    };
  });

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit', fontSize: 'inherit' }}
          >
            Programmes
          </button>{' '}
          · {p.uni}
        </div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Programme detail</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{p.name}</h2>
            <div className="caption" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {p.uni} · {p.dur}-year {p.pathway === 'tvet' ? 'national diploma' : 'bachelor degree'}
            </div>
          </div>
          <div className="row">
            <span className={`badge ${p.pathway}`}>
              {p.pathway[0].toUpperCase() + p.pathway.slice(1)} entry
            </span>
            <button
              className={`btn ${isSaved ? 'btn-primary' : 'btn-outline'}`}
              onClick={onToggleSave}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button
              className="btn btn-brand"
              onClick={onApply}
              disabled={applyState === 'pending' || applyState === 'done' || applyState === 'exists'}
            >
              {applyState === 'pending' ? 'Saving…'
                : applyState === 'done' ? '✓ Added'
                : applyState === 'exists' ? '✓ Already added'
                : 'Add to applications'}
            </button>
          </div>
        </div>
      </div>

      <div className="prog-hero">
        <div>
          <h3 className="subheading">
            Why this is a {p.fit >= 80 ? 'strong' : p.fit >= 60 ? 'moderate' : 'stretch'} match
          </h3>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>
            {(() => {
              const surplus = aps - p.aps;
              const apsNote = surplus >= 5
                ? <>APS <strong>{aps}</strong> is well above the {p.aps} entry threshold — a strong academic signal for this programme.</>
                : surplus >= 0
                ? <>APS <strong>{aps}</strong> meets the {p.aps} requirement.</>
                : <>APS <strong>{aps}</strong> falls {Math.abs(surplus)} point{Math.abs(surplus) !== 1 ? 's' : ''} short of the {p.aps} requirement — the foundation pathway or extended programme may apply.</>;

              if (capabilityData) {
                const capPairs: [string, number][] = [
                  ['Analytical', capabilityData.analytical_thinking],
                  ['Technical', capabilityData.technical_aptitude],
                  ['Creative', capabilityData.creative_thinking],
                  ['Communication', capabilityData.communication_skills],
                  ['Leadership', capabilityData.leadership_potential],
                  ['Academic', capabilityData.academic_readiness],
                ];
                const sorted = [...capPairs].sort((a, b) => b[1] - a[1]);
                const top2 = sorted.slice(0, 2);
                const bottom = sorted[sorted.length - 1];
                const capStrength = top2[0][1] >= 75 ? 'above average' : 'solid';
                return <>{apsNote} Your {top2[0][0]} ({top2[0][1]}) and {top2[1][0]} ({top2[1][1]}) capabilities are {capStrength} for this pathway.{bottom[1] < 55 ? <> {bottom[0]} ({bottom[1]}) is your main growth area — this programme typically develops it in Year 2.</> : ''} Labour market demand is <strong>{p.demand.toLowerCase()}</strong>.</>;
              }

              return <>{apsNote} Labour market demand is <strong>{p.demand.toLowerCase()}</strong>. Complete the capability assessment to see a personalised fit breakdown.</>;
            })()}
          </p>

          <div className="grid-4" style={{ marginTop: '1rem' }}>
            <div className="stat-pair"><div className="l">APS required</div><div className="v">{p.aps}</div></div>
            <div className="stat-pair">
              <div className="l">Your APS</div>
              <div className="v" style={{ color: `hsl(var(--${aps >= p.aps ? 'success' : 'destructive'}))` }}>{aps}</div>
            </div>
            <div className="stat-pair"><div className="l">Annual fees</div><div className="v">{fmtR(p.fees)}</div></div>
            <div className="stat-pair">
              <div className="l">Median grad salary</div>
              <div className="v">
                {fmtR(p.salary)}{' '}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-fg))' }}>/mo</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          <h4 className="subheading" style={{ fontSize: '0.9375rem' }}>Subject requirements</h4>
          <div className="stack" style={{ marginTop: '0.625rem' }}>
            {requirements.map(r => {
              const met = r.mark !== null && r.mark >= r.req;
              const gap = r.mark === null;
              const cls = met ? 'met' : gap ? 'gap-req' : 'short';
              return (
                <div key={r.name} className={`req-row ${cls}`}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</div>
                    <div className="caption" style={{ marginTop: 1 }}>
                      {gap ? 'Not yet written · book the next test sitting' : met ? 'Above requirement' : 'Below requirement'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-fg))' }}>
                    Need {r.req}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    {r.mark ?? '—'}
                  </div>
                  <div className="check">{met ? '✓' : gap ? '?' : '✗'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card compact" style={{ borderColor: 'hsl(var(--fg))' }}>
            <div className="eyebrow"><span className="dot" />Match</div>
            <div style={{ fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', marginTop: '0.25rem' }}>
              {p.fit}<span style={{ fontSize: '1rem', color: 'hsl(var(--muted-fg))', fontWeight: 600 }}>/100</span>
            </div>
            <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${p.fit}%` }} /></div>
            <hr className="divider" />
            {(() => {
              const academicFit = p.aps > 0
                ? Math.min(100, Math.round((aps / p.aps) * 100))
                : p.fit;
              const capabilityFit = capabilityData
                ? Math.min(100, Math.round(
                    [
                      capabilityData.analytical_thinking,
                      capabilityData.technical_aptitude,
                      capabilityData.academic_readiness,
                      capabilityData.perseverance,
                    ].reduce((a, b) => a + b, 0) / 4
                  ))
                : Math.max(40, p.fit - 8);
              const marketFit = p.demand === 'High' ? 90 : p.demand === 'Med' ? 65 : 40;
              return ([
                ['Academic fit',   academicFit],
                ['Capability fit', capabilityFit],
                ['Market fit',     marketFit],
              ] as [string, number][]).map(([l, v]) => (
                <div key={l} className="row-between" style={{ fontSize: '0.75rem', marginTop: '0.375rem' }}>
                  <span className="caption">{l}</span>
                  <span style={{ fontWeight: 700, color: `hsl(var(--${v >= 80 ? 'success' : v >= 60 ? 'fg' : 'warning'}))` }}>{v}</span>
                </div>
              ));
            })()}
          </div>

          {(() => {
            const progNsfasFundable = p.nsfas_fundable !== false; // true or null = fundable
            const incomeEligible = householdIncome === undefined || householdIncome <= 350_000;
            const nsfasEligible = progNsfasFundable && incomeEligible;
            const fundingLabel = nsfasEligible ? 'High' : !progNsfasFundable ? 'Low' : householdIncome! <= 600_000 ? 'Medium' : 'Low';
            const fundingPct   = nsfasEligible ? 88 : !progNsfasFundable ? 18 : householdIncome! <= 600_000 ? 52 : 22;
            const fundingCls   = nsfasEligible ? 'success' : !progNsfasFundable ? 'destructive' : householdIncome! <= 600_000 ? 'warning' : 'destructive';
            return (
              <div className="card compact" style={{ marginTop: '1rem' }}>
                <div className="eyebrow"><span className="dot" />Funding likelihood</div>
                <div className="row" style={{ alignItems: 'baseline', marginTop: '0.375rem', gap: '0.375rem' }}>
                  <span style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em' }}>{fundingLabel}</span>
                  <span className={`badge ${fundingCls}`}>{fundingPct}%</span>
                </div>
                <div className="caption" style={{ marginTop: '0.375rem' }}>
                  {!progNsfasFundable
                    ? 'Private institution — NSFAS does not cover this programme'
                    : nsfasEligible
                      ? 'NSFAS-eligible · 4 bursaries may match'
                      : '2 merit bursaries may match · above NSFAS threshold'}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('funding')}
                  style={{ width: '100%', marginTop: '0.625rem' }}
                >
                  Open funding strategy →
                </button>
              </div>
            );
          })()}

          <div className="card compact" style={{ marginTop: '1rem' }}>
            <div className="eyebrow"><span className="dot" />Career path</div>
            <div className="stack" style={{ marginTop: '0.625rem' }}>
              {careerPaths.map(({ name, cls, label }) => (
                <button
                  key={name}
                  className="row-between btn-ghost-row"
                  onClick={() => onOpenCareer?.(name)}
                  style={{ width: '100%', cursor: onOpenCareer ? 'pointer' : 'default', fontSize: '0.8125rem', padding: '0.25rem 0' }}
                >
                  <span>{name}</span>
                  <span className={`badge ${cls}`}>{label}</span>
                </button>
              ))}
            </div>
            {!psychProfile && (
              <div className="caption" style={{ marginTop: '0.5rem', fontSize: '0.6875rem' }}>
                Complete assessment for live match %
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="eyebrow"><span className="dot" />Programme structure</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>{durYears} year{durYears !== 1 ? 's' : ''} · {durYears * 120} credits (NQF {durYears >= 4 ? 8 : durYears >= 3 ? 7 : 6})</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            {structure.map(s => (
              <div key={s.y} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', padding: '0.625rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{s.y}</div>
                  <div className="caption">{s.t}</div>
                </div>
                <div className="caption" style={{ fontSize: '0.8125rem', color: 'hsl(var(--fg))' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {(() => {
          const empPct   = p.demand === 'High' ? 89 : p.demand === 'Med' ? 76 : 58;
          const pname    = p.name.toLowerCase();
          const pgPct    = (pname.includes('science') || pname.includes('research') || pname.includes('law') || pname.includes('mbchb') || pname.includes('medicine')) ? 31
            : (pname.includes('engineering') || pname.includes('accounting') || pname.includes('commerce')) ? 19 : 11;
          const selfPct  = 100 - empPct - pgPct;
          const empColor = empPct >= 85 ? 'success' : empPct >= 70 ? 'primary' : 'accent';
          const medSal   = p.salary;
          const top5Sal  = Math.round(medSal * 1.6);
          return (
            <div className="card">
              <div className="eyebrow"><span className="dot" />Outcomes</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Where graduates land</h3>
              <div className="stack-2" style={{ marginTop: '0.875rem' }}>
                <div>
                  <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                    <span>Industry employment</span>
                    <span style={{ fontWeight: 800 }}>{empPct}%</span>
                  </div>
                  <div className={`meter ${empColor}`} style={{ marginTop: '0.25rem' }}><i style={{ width: `${empPct}%` }} /></div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>Within 6 months of graduation · demand is <strong>{p.demand.toLowerCase()}</strong></div>
                </div>
                <div>
                  <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                    <span>Postgraduate study</span>
                    <span style={{ fontWeight: 800 }}>{pgPct}%</span>
                  </div>
                  <div className="meter primary" style={{ marginTop: '0.25rem' }}><i style={{ width: `${pgPct}%` }} /></div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>Honours / Masters / Professional registration</div>
                </div>
                {selfPct > 0 && (
                  <div>
                    <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                      <span>Entrepreneurial / other</span>
                      <span style={{ fontWeight: 800 }}>{selfPct}%</span>
                    </div>
                    <div className="meter accent" style={{ marginTop: '0.25rem' }}><i style={{ width: `${selfPct}%` }} /></div>
                  </div>
                )}
                <div>
                  <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                    <span>Salary range (grad → top 20%)</span>
                  </div>
                  <div className="row" style={{ marginTop: '0.375rem', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>{fmtR(medSal)}</span>
                    <span className="caption">→</span>
                    <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem', color: 'hsl(var(--success))' }}>{fmtR(top5Sal)}</span>
                    <span className="caption">/mo</span>
                  </div>
                </div>
                <div>
                  <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                    <span>Top employers</span><span className="caption">Last 3 cohorts</span>
                  </div>
                  <div className="row" style={{ marginTop: '0.375rem', flexWrap: 'wrap' }}>
                    {getProgrammeEmployers(p.name).slice(0, 5).map(e => (
                      <span key={e} className="badge">{e}</span>
                    ))}
                  </div>
                </div>
                {p.career_outcomes && p.career_outcomes.length > 0 && (
                  <div>
                    <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                      <span>Career outcomes</span><span className="caption">From programme catalogue</span>
                    </div>
                    <div className="row" style={{ marginTop: '0.375rem', flexWrap: 'wrap' }}>
                      {p.career_outcomes.slice(0, 6).map(c => (
                        <span key={c} className="badge info" style={{ fontSize: '0.6875rem' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ─── Programme List ──────────────────────────────────────────── */
function subjectGapBadges(prog: Programme, subjectNames: string[], aps: number) {
  const apsGap = prog.aps - aps;
  const missing = (prog.requiredSubjects ?? []).filter(r => !subjectNames.some(s => s.toLowerCase().includes(r.toLowerCase())));
  return { apsGap, missing };
}

export default function ProgrammePage({
  selectedProg, subjects, navigate, programmes, savedProgrammeIds = [],
  compareItems = [], onToggleCompare,
  psychProfile, capabilityData, userAps, householdIncome, onOpenCareer,
}: ProgrammePageProps) {
  const allProgs = programmes ?? PROGRAMMES;
  const aps = calcAPS(subjects);
  const subjectNames = subjects.map(s => s.name);

  const initialProg = allProgs.find(p => p.id === selectedProg) ?? null;
  const [selected, setSelected] = useState<Programme | null>(initialProg);
  const [activeTab, setActiveTab] = useState<'fit' | 'aps' | 'fees' | 'saved'>('fit');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  // Local saved state (optimistic — starts from server-fetched ids)
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(savedProgrammeIds));
  const [saveTransition, startSaveTransition] = useTransition();

  // Apply state per-programme
  const [applyStates, setApplyStates] = useState<Record<string, 'idle' | 'pending' | 'done' | 'exists'>>({});
  const [applyTarget, setApplyTarget] = useState<Programme | null>(null);

  function handleToggleSave(progId: string) {
    const currently = savedIds.has(progId);
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (currently) next.delete(progId); else next.add(progId);
      return next;
    });
    startSaveTransition(async () => {
      const result = await toggleSavedProgramme(progId, currently);
      if ('error' in result) {
        // Revert on error
        setSavedIds(prev => {
          const next = new Set(prev);
          if (currently) next.add(progId); else next.delete(progId);
          return next;
        });
      }
    });
  }

  function handleApply(prog: Programme) {
    setApplyTarget(prog);
  }

  const sorted = useMemo(() => {
    let list = allProgs;
    if (activeTab === 'saved') list = list.filter(p => savedIds.has(p.id));
    if (eligibleOnly) list = list.filter(p => p.aps <= aps);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.uni.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (activeTab === 'aps')  return a.aps - b.aps;
      if (activeTab === 'fees') return a.fees - b.fees;
      return b.fit - a.fit;
    });
  }, [allProgs, activeTab, eligibleOnly, search, aps, savedIds]);

  if (selected) {
    return (
      <>
        {applyTarget && (
          <AddApplicationModal
            programmes={allProgs}
            preselectedProg={applyTarget}
            onClose={() => setApplyTarget(null)}
            onAdded={(prog) => {
              setApplyStates(s => ({ ...s, [prog.id]: 'done' }));
              setApplyTarget(null);
              navigate('applications');
            }}
          />
        )}
        <ProgDetail
          p={selected}
          aps={userAps ?? aps}
          subjects={subjects}
          navigate={navigate}
          onBack={() => setSelected(null)}
          isSaved={savedIds.has(selected.id)}
          onToggleSave={() => handleToggleSave(selected.id)}
          onApply={() => handleApply(selected)}
          applyState={applyStates[selected.id] ?? 'idle'}
          psychProfile={psychProfile}
          capabilityData={capabilityData}
          householdIncome={householdIncome}
          onOpenCareer={onOpenCareer}
        />
      </>
    );
  }

  const eligibleCount = allProgs.filter(p => p.aps <= aps).length;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Plan · Programmes</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Programme explorer</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>
              {eligibleCount} programmes match your APS
            </h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {allProgs.length.toLocaleString()} programmes from{' '}
              {new Set(allProgs.map(p => p.uni)).size} institutions across SA.
              Each card shows fit, fees and pathway — click to see the full detail.
            </p>
          </div>
          <div className="row">
            {compareItems.filter(c => c.kind === 'prog').length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('compare')}>
                ⇄ {compareItems.filter(c => c.kind === 'prog').length} in compare
              </button>
            )}
            <button
              className={`btn ${eligibleOnly ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setEligibleOnly(v => !v); setVisibleCount(8); }}
            >
              {eligibleOnly ? '✓ Eligible only' : 'Eligible only'}
            </button>
            <input
              className="input"
              placeholder="Search…"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(8); }}
              style={{ minWidth: 0, width: 180 }}
            />
          </div>
        </div>
      </div>

      {/* Best-fit recommendation strip — only when APS is known and there are eligible programmes */}
      {(userAps ?? aps) > 0 && (() => {
        const effectiveAps = userAps ?? aps;
        const topFit = [...allProgs]
          .filter(p => p.aps <= effectiveAps)
          .sort((a, b) => b.fit - a.fit)
          .slice(0, 3);
        if (topFit.length === 0) return null;
        return (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="row-between" style={{ marginBottom: '0.75rem' }}>
              <div className="eyebrow"><span className="dot" />Best fit for your APS ({effectiveAps})</div>
            </div>
            <div className="grid-3" style={{ gap: '0.75rem' }}>
              {topFit.map(p => {
                const { apsGap, missing } = subjectGapBadges(p, subjectNames, effectiveAps);
                return (
                  <button
                    key={p.id}
                    className="card compact"
                    style={{ textAlign: 'left', cursor: 'pointer', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
                    onClick={() => setSelected(p)}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>{p.name}</div>
                    <div className="caption" style={{ color: 'hsl(var(--muted-fg))' }}>{p.uni}</div>
                    <div className="meter sm"><i style={{ width: `${p.fit}%` }} /></div>
                    <div className="row-between">
                      <span className="caption">{p.fit}% fit</span>
                      <span className={`badge ${apsGap <= 0 ? 'success' : 'destructive'}`} style={{ height: '1.125rem', fontSize: '0.5625rem' }}>
                        {apsGap <= 0 ? `APS ✓ +${Math.abs(apsGap)}` : `+${apsGap} APS`}
                      </span>
                    </div>
                    {missing.length > 0 && (
                      <div className="caption" style={{ color: 'hsl(var(--warning))', fontSize: '0.6875rem' }}>⚠ Needs: {missing.join(', ')}</div>
                    )}
                    <div className="caption">{fmtR(p.fees)}/yr</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab ${activeTab === 'fit'  ? 'active' : ''}`} onClick={() => { setActiveTab('fit'); setVisibleCount(8); }}>
          Best fit ({eligibleCount})
        </button>
        <button className={`tab ${activeTab === 'aps'  ? 'active' : ''}`} onClick={() => { setActiveTab('aps'); setVisibleCount(8); }}>
          Lowest APS first
        </button>
        <button className={`tab ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => { setActiveTab('fees'); setVisibleCount(8); }}>
          Lowest fees first
        </button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => { setActiveTab('saved'); setVisibleCount(8); }}>
          Saved ({savedIds.size})
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3 className="subheading">
            {activeTab === 'saved' ? 'No saved programmes yet' : 'No programmes match'}
          </h3>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>
            {activeTab === 'saved'
              ? 'Click the ☆ Save button on any programme to save it here.'
              : search ? 'Try a different search term.' : 'No eligible programmes at your current APS — use the simulator to explore mark changes.'}
          </p>
          {eligibleOnly && activeTab !== 'saved' && (
            <button className="btn btn-outline" onClick={() => setEligibleOnly(false)} style={{ marginTop: '1rem' }}>
              Show all programmes
            </button>
          )}
        </div>
      ) : (
        <>
        <div className="grid-3">
          {sorted.slice(0, visibleCount).map((p, i) => {
            const eligible = p.aps <= aps;
            const isSaved = savedIds.has(p.id);
            return (
              <div className="career-card" key={p.id} onClick={() => setSelected(p)}>
                <div className={`img-tile ${uniToneClass(p.uni)}`} aria-hidden="true">
                  <img
                    src={uniLogoPath(p.uni)}
                    alt=""
                    width={60} height={60}
                    style={{ objectFit: 'contain', opacity: 0.9 }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="row-between">
                  <div className="row" style={{ gap: '0.5rem' }}>
                    <div className="career-rank">{String(i + 1).padStart(2, '0')}</div>
                    <span className={`badge ${p.pathway}`} style={{ height: '1.25rem', fontSize: '0.625rem' }}>
                      {PATHWAY_LABELS[p.pathway]}
                    </span>
                  </div>
                  <div className="row" style={{ gap: '0.375rem', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                      {p.fit}
                    </span>
                    <span className="caption" style={{ fontSize: '0.6875rem' }}>/100</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{p.name}</div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{p.uni}</div>
                  <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${p.fit}%` }} /></div>
                </div>

                <div className="row-between" style={{ fontSize: '0.75rem', paddingTop: '0.375rem', borderTop: '1px solid hsl(var(--border))' }}>
                  <div>
                    <div className="caption" style={{ fontSize: '0.625rem' }}>Annual fees</div>
                    <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {p.fees ? fmtR(p.fees) : '—'}
                      <span className="caption" style={{ fontWeight: 600 }}>/yr</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="caption" style={{ fontSize: '0.625rem' }}>APS required</div>
                    <div style={{
                      fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                      color: eligible ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                    }}>
                      {p.aps || '—'}
                    </div>
                  </div>
                </div>

                <div className="row" style={{ gap: '0.25rem', flexWrap: 'wrap' }}>
                  {eligible && <span className="career-tag" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>Eligible</span>}
                  <span className="career-tag">{p.dur} yr{p.dur !== 1 ? 's' : ''}</span>
                  {p.fees < 40000 && <span className="career-tag">Affordable</span>}
                  {(() => {
                    const { apsGap, missing } = subjectGapBadges(p, subjectNames, aps);
                    return (
                      <>
                        {apsGap > 0 && <span className="career-tag" style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}>+{apsGap} APS needed</span>}
                        {apsGap <= 0 && <span className="career-tag" style={{ background: 'hsl(var(--success) / 0.08)', color: 'hsl(var(--success))' }}>APS ✓ +{Math.abs(apsGap)}</span>}
                        {missing.map(s => <span key={s} className="career-tag" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>⚠ {s}</span>)}
                      </>
                    );
                  })()}
                </div>

                <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                  <button
                    className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-outline'}`}
                    disabled={saveTransition}
                    onClick={e => { e.stopPropagation(); handleToggleSave(p.id); }}
                    title={isSaved ? 'Saved' : 'Save programme'}
                  >
                    {isSaved ? '★' : '☆'}
                  </button>
                  {onToggleCompare && (
                    <button
                      className={`btn btn-sm ${compareItems.some(c => c.id === p.id) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={e => { e.stopPropagation(); onToggleCompare({ id: p.id, kind: 'prog', name: p.name }); }}
                    >
                      {compareItems.some(c => c.id === p.id) ? '✓ Added' : 'Compare'}
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: onToggleCompare ? undefined : 1 }}
                    onClick={e => { e.stopPropagation(); setSelected(p); }}
                  >
                    View detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {visibleCount < sorted.length && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => setVisibleCount(v => Math.min(v + 8, sorted.length))}
            >
              Show {Math.min(8, sorted.length - visibleCount)} more programmes
            </button>
            <div className="caption" style={{ marginTop: '0.5rem', color: 'hsl(var(--muted-fg))' }}>
              Showing {Math.min(visibleCount, sorted.length)} of {sorted.length}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}
