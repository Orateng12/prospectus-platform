'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Route, Subject, Programme, PsychProfileData, CapabilityData } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { calcAPS, fmtR, apsPoints } from '@/lib/utils';
import { scoreCareerMatch } from '@/lib/scoring';
import { toggleSavedProgramme } from '@/app/actions/toggleSavedProgramme';
import { saveApplication } from '@/app/actions/saveApplication';

interface ProgrammePageProps {
  selectedProg: string;
  subjects: Subject[];
  navigate: (r: Route) => void;
  programmes?: Programme[];
  savedProgrammeIds?: string[];
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  userAps?: number;
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

const PATHWAY_LABELS: Record<string, string> = {
  direct:     'Direct entry',
  extended:   'Extended',
  foundation: 'Foundation',
  tvet:       'TVET',
};

/* ─── APS gap helper ──────────────────────────────────────────── */
function apsGapLine(programme: Programme, subjects: Subject[], userAps: number): { text: string; color: string } {
  const gap = programme.aps - userAps;
  if (gap <= 0) {
    const surplus = -gap;
    return {
      text: surplus === 0 ? '✓ Exactly at minimum APS' : `✓ ${surplus} pt${surplus !== 1 ? 's' : ''} above minimum`,
      color: 'hsl(var(--success))',
    };
  }
  if (gap <= 4) {
    // Find the cheapest subject lever — smallest mark increase that gains at least 1 APS point
    const designated = subjects.filter(s => s.designated && s.id !== 'lo');
    let best: { name: string; from: number; to: number } | null = null;
    for (const s of designated) {
      const thresholds = [30, 40, 50, 60, 70, 80];
      for (const t of thresholds) {
        if (s.mark < t && apsPoints(t) > apsPoints(s.mark)) {
          const delta = t - s.mark;
          if (!best || delta < (best.to - best.from)) best = { name: s.name, from: s.mark, to: t };
          break;
        }
      }
    }
    if (best) {
      return {
        text: `${gap} pt${gap !== 1 ? 's' : ''} needed — raise ${best.name} ${best.from}%→${best.to}%`,
        color: 'hsl(var(--warning))',
      };
    }
    return { text: `${gap} pt${gap !== 1 ? 's' : ''} needed`, color: 'hsl(var(--warning))' };
  }
  if (gap <= 8) {
    return { text: `${gap} pts needed — extended pathway may apply`, color: 'hsl(var(--warning))' };
  }
  return { text: `${gap} pts away — foundation year recommended`, color: 'hsl(var(--muted-fg))' };
}

/* ─── Detail view ─────────────────────────────────────────────── */
function ProgDetail({
  p, aps, subjects, navigate, onBack, isSaved, onToggleSave, onApply, applyState, psychProfile, capabilityData,
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
}) {
  const structure = [
    { y: 'Year 1', t: 'Foundations',    d: 'Core theory, introduction to the discipline, one minor' },
    { y: 'Year 2', t: 'Core modules',   d: 'Specialisation subjects, practical applications, two electives' },
    { y: 'Year 3', t: 'Specialisation', d: 'Capstone project + advanced electives in chosen track' },
  ];

  // Build subject requirements from the student's actual subjects
  const name = p.name.toLowerCase();
  const mathsMin = p.aps >= 38 ? 60 : p.aps >= 32 ? 50 : 40;
  const isScienceOrTech = name.includes('engineer') || name.includes('science') || name.includes('physic') || name.includes('ict') || name.includes('comput') || name.includes('math') || name.includes('data');
  const isHealth = name.includes('medic') || name.includes('nurs') || name.includes('pharma') || name.includes('health');
  const isLaw = name.includes('law') || name.includes('llb');

  const requirements = subjects
    .filter(s => s.id !== 'lo')
    .sort((a, b) => b.mark - a.mark)
    .slice(0, 4)
    .map(s => {
      const sn = s.name.toLowerCase();
      let req = 40;
      if (sn.includes('math') && !sn.includes('literacy')) req = mathsMin;
      else if (sn.includes('math') && sn.includes('literacy')) req = isScienceOrTech ? 0 : 40;
      else if (sn.includes('english') || sn.includes('afrikaans') || sn.includes('language')) req = 50;
      else if ((sn.includes('physical') || sn.includes('life science')) && (isScienceOrTech || isHealth)) req = 50;
      else if (isLaw && (sn.includes('history') || sn.includes('english'))) req = 55;
      else req = 40;
      return { name: s.name, req, mark: s.mark as number | null };
    });

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
            Why this is a {p.fit >= 80 ? 'strong' : 'moderate'} match
          </h3>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>
            {p.fit >= 80
              ? <>
                  {capabilityData
                    ? (() => {
                        const sorted = (['analytical_thinking', 'technical_aptitude', 'creative_thinking', 'communication_skills'] as const)
                          .sort((a, b) => (capabilityData[b] ?? 0) - (capabilityData[a] ?? 0));
                        const labels: Record<string, string> = { analytical_thinking: 'Analytical', technical_aptitude: 'Technical', creative_thinking: 'Creative', communication_skills: 'Communication' };
                        return `Your ${labels[sorted[0]]} (${capabilityData[sorted[0]]}) and ${labels[sorted[1]]} (${capabilityData[sorted[1]]}) capability scores sit above the typical profile for this programme. `;
                      })()
                    : 'Your capability profile aligns well with this programme. '}
                  APS of <strong>{aps}</strong> exceeds the <strong>{p.aps}</strong> requirement by {aps - p.aps} point{aps - p.aps !== 1 ? 's' : ''}.
                  Labour market signal: <strong>{p.demand.toLowerCase()}</strong> demand.
                </>
              : <>
                  Your APS of <strong>{aps}</strong>{' '}
                  {aps >= p.aps ? 'meets the requirement of' : 'falls short of'}{' '}
                  <strong>{p.aps}</strong>.
                  {aps < p.aps && (() => {
                    const gap = apsGapLine(p, subjects, aps);
                    return <> {gap.text}.</>;
                  })()}
                  {' '}Worth a conversation with the faculty about the {p.pathway === 'extended' ? 'extended' : 'foundation'} pathway.
                </>
            }
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

          <div className="card compact" style={{ marginTop: '1rem' }}>
            <div className="eyebrow"><span className="dot" />Funding likelihood</div>
            <div className="row" style={{ alignItems: 'baseline', marginTop: '0.375rem', gap: '0.375rem' }}>
              <span style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em' }}>High</span>
              <span className="caption">87%</span>
            </div>
            <div className="caption" style={{ marginTop: '0.375rem' }}>
              NSFAS-eligible · 4 bursaries match · Allan Gray Orbis 92%
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('funding')}
              style={{ width: '100%', marginTop: '0.625rem' }}
            >
              Open funding strategy →
            </button>
          </div>

          <div className="card compact" style={{ marginTop: '1rem' }}>
            <div className="eyebrow"><span className="dot" />Career path</div>
            <div className="stack" style={{ marginTop: '0.625rem' }}>
              {careerPaths.map(({ name, cls, label }) => (
                <div key={name} className="row-between" style={{ fontSize: '0.8125rem' }}>
                  <span>{name}</span>
                  <span className={`badge ${cls}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="eyebrow"><span className="dot" />Programme structure</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>3 years · 360 credits</h3>
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

        <div className="card">
          <div className="eyebrow"><span className="dot" />Outcomes</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Where graduates land</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            <div>
              <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span>Industry employment</span><span style={{ fontWeight: 800 }}>81%</span>
              </div>
              <div className="meter success" style={{ marginTop: '0.25rem' }}><i style={{ width: '81%' }} /></div>
              <div className="caption" style={{ marginTop: '0.25rem' }}>Within 6 months of graduation</div>
            </div>
            <div>
              <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span>Postgraduate study</span><span style={{ fontWeight: 800 }}>14%</span>
              </div>
              <div className="meter primary" style={{ marginTop: '0.25rem' }}><i style={{ width: '14%' }} /></div>
            </div>
            <div>
              <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                <span>Top employers</span><span className="caption">Last 3 cohorts</span>
              </div>
              <div className="row" style={{ marginTop: '0.375rem' }}>
                {['Discovery', 'Standard Bank', 'Naspers / Prosus', 'Google ZA', 'Allan Gray'].map(e => (
                  <span key={e} className="badge">{e}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Programme List ──────────────────────────────────────────── */
export default function ProgrammePage({
  selectedProg, subjects, navigate, programmes, savedProgrammeIds = [],
  psychProfile, capabilityData, userAps,
}: ProgrammePageProps) {
  const allProgs = programmes ?? PROGRAMMES;
  const aps = calcAPS(subjects);

  const initialProg = allProgs.find(p => p.id === selectedProg) ?? null;
  const [selected, setSelected] = useState<Programme | null>(initialProg);
  const [activeTab, setActiveTab] = useState<'fit' | 'aps' | 'fees' | 'saved'>('fit');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Local saved state (optimistic — starts from server-fetched ids)
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(savedProgrammeIds));
  const [saveTransition, startSaveTransition] = useTransition();

  // Apply state per-programme
  const [applyStates, setApplyStates] = useState<Record<string, 'idle' | 'pending' | 'done' | 'exists'>>({});
  const [applyTransition, startApplyTransition] = useTransition();

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
    setApplyStates(s => ({ ...s, [prog.id]: 'pending' }));
    startApplyTransition(async () => {
      const result = await saveApplication(prog.id, prog.name, prog.uni);
      if ('error' in result) {
        setApplyStates(s => ({ ...s, [prog.id]: 'idle' }));
      } else {
        setApplyStates(s => ({ ...s, [prog.id]: 'done' }));
      }
    });
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
      />
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
            <button
              className={`btn ${eligibleOnly ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setEligibleOnly(v => !v)}
            >
              {eligibleOnly ? '✓ Eligible only' : 'Eligible only'}
            </button>
            <input
              className="input"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 0, width: 180 }}
            />
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab ${activeTab === 'fit'  ? 'active' : ''}`} onClick={() => setActiveTab('fit')}>
          Best fit ({eligibleCount})
        </button>
        <button className={`tab ${activeTab === 'aps'  ? 'active' : ''}`} onClick={() => setActiveTab('aps')}>
          Lowest APS first
        </button>
        <button className={`tab ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}>
          Lowest fees first
        </button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
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
        <div className="grid-3">
          {sorted.map((p, i) => {
            const eligible = p.aps <= aps;
            const isSaved = savedIds.has(p.id);
            return (
              <div className="career-card" key={p.id} onClick={() => setSelected(p)}>
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
                  {(() => {
                    const gap = apsGapLine(p, subjects, aps);
                    return (
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: gap.color, marginTop: '0.375rem' }}>
                        {gap.text}
                      </div>
                    );
                  })()}
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

                <div className="row" style={{ gap: '0.25rem' }}>
                  {eligible && <span className="career-tag" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>Eligible</span>}
                  <span className="career-tag">{p.dur} yr{p.dur !== 1 ? 's' : ''}</span>
                  {p.fees < 40000 && <span className="career-tag">Affordable</span>}
                </div>

                <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                  <button
                    className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                    disabled={saveTransition}
                    onClick={e => { e.stopPropagation(); handleToggleSave(p.id); }}
                  >
                    {isSaved ? '★' : '☆'} Save
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={e => { e.stopPropagation(); setSelected(p); }}
                  >
                    View detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
