'use client';

import { useTransition, useState, useMemo } from 'react';
import type { Subject, Programme, PsychProfileData, CapabilityData } from '@/lib/types';
import { PROGRAMMES, CAREERS } from '@/lib/data';
import { calcAPS, apsPoints, fmtR } from '@/lib/utils';
import { saveSubjectMarks } from '@/app/actions/saveSubjects';
import { scoreCareerMatch, computeStrategicScore } from '@/lib/scoring';

interface SimulatorPageProps {
  subjects: Subject[];
  onSubjectChange: (id: string, mark: number) => void;
  onReset: () => void;
  onSaved?: (subjects: Subject[]) => void;
  programmes?: Programme[];
  onNavigateProgramme?: (progId: string) => void;
  onOpenDetail?: (subject: Subject) => void;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  householdIncome?: number;
}

// Find minimum mark to reach the next higher NSC point level
function markForNextPoint(mark: number): number | null {
  const boundaries = [30, 40, 50, 60, 70, 80];
  for (const b of boundaries) {
    if (mark < b) return b;
  }
  return null; // already at max (80+)
}

interface UnlockStep {
  subjectId: string;
  subjectName: string;
  fromMark: number;
  toMark: number;
  markDelta: number;
  ptsGained: number;
}

// Greedy: find cheapest subject mark increases to gain `gap` APS points
function optimalPathToAps(subjects: Subject[], gap: number): UnlockStep[] | null {
  if (gap <= 0) return [];
  const BOUNDARIES = [30, 40, 50, 60, 70, 80];
  // For each subject, all valid upgrade steps (cheapest first)
  const allSteps: UnlockStep[] = subjects
    .filter(s => s.id !== 'lo' && s.designated)
    .flatMap(s => {
      const currentPts = apsPoints(s.mark);
      return BOUNDARIES
        .filter(b => b > s.mark)
        .map(b => ({
          subjectId: s.id,
          subjectName: s.name,
          fromMark: s.mark,
          toMark: b,
          markDelta: b - s.mark,
          ptsGained: apsPoints(b) - currentPts,
        }))
        .filter(step => step.ptsGained > 0);
    })
    .sort((a, b) => (a.markDelta / a.ptsGained) - (b.markDelta / b.ptsGained));

  let ptsLeft = gap;
  const chosen: UnlockStep[] = [];
  const used = new Set<string>();
  for (const step of allSteps) {
    if (ptsLeft <= 0) break;
    if (used.has(step.subjectId)) continue;
    used.add(step.subjectId);
    chosen.push(step);
    ptsLeft -= step.ptsGained;
  }
  return ptsLeft <= 0 ? chosen : null;
}

interface GradeBoundaryProps {
  subjects: Subject[];
  aps: number;
  allProgs: Programme[];
  onApply: (id: string, val: string) => void;
}

function GradeBoundaryCalculator({ subjects, aps, allProgs, onApply }: GradeBoundaryProps) {
  const maxAps = subjects.filter(s => s.id !== 'lo' && s.designated).length * 7;
  const [targetAps, setTargetAps] = useState(() => Math.min(aps + 3, maxAps));

  const gap = targetAps - aps;
  const progsNow = allProgs.filter(p => p.aps <= aps).length;
  const progsAtTarget = allProgs.filter(p => p.aps <= targetAps).length;
  const progsUnlocked = progsAtTarget - progsNow;

  // For each designated subject (excl. LO), compute what mark is needed for each additional point
  const rows = useMemo(() => {
    return subjects
      .filter(s => s.id !== 'lo' && s.designated)
      .map(s => {
        const current = s.mark;
        const currentPts = apsPoints(current);
        const nextMark = markForNextPoint(current);
        if (nextMark === null) return null; // already maxed
        const ptsGained = apsPoints(nextMark) - currentPts;
        const markIncrease = nextMark - current;
        return { subject: s, current, nextMark, markIncrease, ptsGained };
      })
      .filter(Boolean)
      .sort((a, b) => a!.markIncrease - b!.markIncrease) as NonNullable<ReturnType<typeof subjects.map>>[number][];
  }, [subjects]);

  if (gap <= 0 && targetAps <= aps) {
    // target is already met — still show the section but with a green message
  }

  return (
    <div className="card" style={{ marginTop: '1.75rem' }}>
      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="eyebrow"><span className="dot" />Grade boundary calculator</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What marks do I need to reach APS {targetAps}?</h3>
        </div>
        {progsUnlocked > 0 && (
          <span className="badge success" style={{ height: '1.5rem', fontSize: '0.75rem' }}>
            +{progsUnlocked} programmes unlocked
          </span>
        )}
      </div>

      <div className="row" style={{ alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <span className="caption" style={{ flexShrink: 0 }}>Target APS</span>
        <input
          type="range"
          className="slider"
          min={aps}
          max={maxAps}
          step={1}
          value={targetAps}
          onChange={e => setTargetAps(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          className="sub-input"
          min={aps}
          max={maxAps}
          value={targetAps}
          onChange={e => setTargetAps(Math.max(aps, Math.min(maxAps, Number(e.target.value))))}
        />
      </div>

      {gap <= 0 ? (
        <div className="caption" style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>
          ✓ Your current APS ({aps}) already meets or exceeds this target.
        </div>
      ) : (
        <>
          <div className="caption" style={{ marginBottom: '0.75rem' }}>
            Need <strong>+{gap} APS point{gap !== 1 ? 's' : ''}</strong>. Cheapest subjects to improve first:
          </div>
          <div className="stack">
            {(rows as Array<{ subject: Subject; current: number; nextMark: number; markIncrease: number; ptsGained: number }>).map(({ subject: s, current, nextMark, markIncrease, ptsGained }, i) => (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid hsl(var(--border))',
                }}
              >
                <div>
                  <div style={{ fontWeight: i === 0 ? 700 : 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {s.name}
                    {i === 0 && <span className="badge success" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.3125rem' }}>Cheapest</span>}
                  </div>
                  <div className="caption" style={{ marginTop: '0.125rem' }}>
                    {current}% → <strong>{nextMark}%</strong> = +{ptsGained} APS pt{ptsGained !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums', color: i === 0 ? 'hsl(var(--success))' : 'hsl(var(--muted-fg))' }}>
                  +{markIncrease}%
                </div>
                <span className={`badge ${ptsGained >= 2 ? 'success' : 'info'}`} style={{ height: '1.25rem', fontSize: '0.5625rem' }}>
                  +{ptsGained} pt{ptsGained !== 1 ? 's' : ''}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0 0.375rem', fontSize: '0.6875rem', height: '1.5rem' }}
                  onClick={() => onApply(s.id, String(nextMark))}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
          {progsUnlocked > 0 && (
            <div className="caption" style={{ marginTop: '0.75rem', color: 'hsl(var(--success))', fontWeight: 600 }}>
              Reaching APS {targetAps} unlocks {progsUnlocked} more programme{progsUnlocked !== 1 ? 's' : ''} you can&apos;t access at APS {aps}.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// For each designated subject, find the minimum mark increase to gain the next APS point
function cheapestLever(subject: Subject) {
  const currentPts = apsPoints(subject.mark);
  const boundaries = [30, 40, 50, 60, 70, 80];
  for (const threshold of boundaries) {
    if (subject.mark < threshold) {
      const gained = apsPoints(threshold) - currentPts;
      return { targetMark: threshold, markDelta: threshold - subject.mark, apsDelta: gained };
    }
  }
  return null; // already at max band
}

export default function SimulatorPage({
  subjects,
  onSubjectChange,
  onReset,
  onSaved,
  programmes,
  onNavigateProgramme,
  onOpenDetail,
  psychProfile,
  capabilityData,
  householdIncome,
}: SimulatorPageProps) {
  const allProgs = programmes ?? PROGRAMMES;
  const aps = calcAPS(subjects);

  // Capture the APS on first render as the baseline for all delta displays
  const [baselineAps] = useState(() => calcAPS(subjects));

  // Capture baseline career scores once — avoids recalculating on every change
  const [baselineCareerData] = useState(() => {
    if (!psychProfile || !capabilityData) return null;
    const initAps = calcAPS(subjects);
    return CAREERS.map(c => ({
      name: c.name,
      demand: c.demand,
      salary: c.salary,
      growth: c.growth,
      baseScore: scoreCareerMatch(c.name, psychProfile, capabilityData, initAps),
    })).sort((a, b) => b.baseScore - a.baseScore).slice(0, 8);
  });

  // Capture baseline strategic score once
  const [baselineStrategic] = useState(() => {
    if (!psychProfile || !capabilityData) return null;
    const initAps = calcAPS(subjects);
    return computeStrategicScore(psychProfile, capabilityData, initAps, householdIncome ?? 350_000);
  });

  const delta = aps - baselineAps;

  const eligible = allProgs.filter(p => p.aps <= aps);
  const opened   = allProgs.filter(p => p.aps <= aps && p.aps > baselineAps);
  const closed   = allProgs.filter(p => p.aps > aps  && p.aps <= baselineAps);

  // Live career scores — recomputed when aps/subjects change
  const currentCareerData = useMemo(() => {
    if (!psychProfile || !capabilityData || !baselineCareerData) return null;
    return baselineCareerData.map(c => ({
      ...c,
      currentScore: scoreCareerMatch(c.name, psychProfile, capabilityData, aps),
    }));
  }, [aps, psychProfile, capabilityData, baselineCareerData]);

  // Live strategic score
  const currentStrategic = useMemo(() => {
    if (!psychProfile || !capabilityData) return null;
    return computeStrategicScore(psychProfile, capabilityData, aps, householdIncome ?? 350_000);
  }, [aps, psychProfile, capabilityData, householdIncome]);

  const strategicDelta = currentStrategic && baselineStrategic
    ? currentStrategic.overall - baselineStrategic.overall
    : 0;

  // Cheapest subject levers — sorted by marks needed (ascending = cheapest first)
  const levers = useMemo(() =>
    subjects
      .filter(s => s.id !== 'lo' && s.designated)
      .map(s => ({ subject: s, lever: cheapestLever(s) }))
      .filter(x => x.lever !== null)
      .sort((a, b) => a.lever!.markDelta - b.lever!.markDelta),
  [subjects]);

  // Programmes just out of reach — ordered by gap ascending
  const nearMiss = useMemo(() =>
    allProgs
      .filter(p => p.aps > aps && p.aps <= aps + 6)
      .sort((a, b) => (a.aps - aps) - (b.aps - aps))
      .slice(0, 4),
  [allProgs, aps]);

  // Career score threshold crossings — moments where APS gate changed meaningfully
  const thresholdCrossings = useMemo(() => {
    if (!currentCareerData) return [];
    return currentCareerData
      .filter(c => Math.abs(c.currentScore - c.baseScore) >= 4)
      .sort((a, b) => (b.currentScore - b.baseScore) - (a.currentScore - a.baseScore))
      .slice(0, 3);
  }, [currentCareerData]);

  const [expandedNearMiss, setExpandedNearMiss] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savedCascade, setSavedCascade] = useState<{
    opened: Programme[];
    closed: Programme[];
    crossings: Array<{ name: string; baseScore: number; currentScore: number }>;
    strategicDelta: number;
    apsGain: number;
  } | null>(null);

  function handleChange(id: string, raw: string) {
    const mark = Math.max(0, Math.min(100, parseInt(raw) || 0));
    onSubjectChange(id, mark);
    setSaveMsg(null);
    setSavedCascade(null);
  }

  function handleSave() {
    // Capture cascade snapshot before save so it persists after baseline resets
    const cascadeSnapshot = (delta !== 0 || opened.length > 0 || closed.length > 0 || thresholdCrossings.length > 0)
      ? {
          opened: opened.slice(0, 5),
          closed: closed.slice(0, 5),
          crossings: thresholdCrossings,
          strategicDelta: strategicDelta ?? 0,
          apsGain: delta,
        }
      : null;
    startTransition(async () => {
      const result = await saveSubjectMarks(subjects);
      if (result && 'error' in result) {
        setSaveMsg({ ok: false, text: result.error ?? 'Save failed' });
      } else {
        setSaveMsg({ ok: true, text: 'Marks saved' });
        if (cascadeSnapshot) setSavedCascade(cascadeSnapshot);
        onSaved?.(subjects);
        setTimeout(() => setSaveMsg(null), 3000);
      }
    });
  }

  const impactProgs = [...allProgs].sort((a, b) => b.fit - a.fit).slice(0, 12);
  const hasPersonalisedData = !!(psychProfile && capabilityData);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · APS &amp; Simulator</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />What if</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Academic simulator</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Move any subject mark. See your APS recalculate live, watch programmes open and close,
              and find the smallest mark change that unlocks your highest-fit programme.
            </p>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: '0.625rem' }}>
            {saveMsg && (
              <span style={{
                fontSize: '0.8125rem', fontWeight: 600,
                color: `hsl(var(--${saveMsg.ok ? 'success' : 'destructive'}))`,
              }}>
                {saveMsg.ok ? '✓ ' : '✗ '}{saveMsg.text}
              </span>
            )}
            <button className="btn btn-outline" onClick={onReset}>Reset</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save marks'}
            </button>
          </div>
        </div>
      </div>

      {savedCascade && (
        <div className="card" style={{
          marginBottom: '1.25rem',
          borderColor: savedCascade.apsGain >= 0 ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--destructive) / 0.4)',
          background: savedCascade.apsGain >= 0 ? 'hsl(var(--success) / 0.03)' : 'hsl(var(--destructive) / 0.03)',
        }}>
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />What your saved marks changed</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                APS {baselineAps} → {baselineAps + savedCascade.apsGain}
                {savedCascade.apsGain !== 0 && (
                  <span className={`badge ${savedCascade.apsGain > 0 ? 'success' : 'destructive'}`} style={{ marginLeft: '0.5rem' }}>
                    {savedCascade.apsGain > 0 ? '+' : ''}{savedCascade.apsGain}
                  </span>
                )}
                {savedCascade.strategicDelta !== 0 && (
                  <span className={`badge ${savedCascade.strategicDelta > 0 ? 'success' : 'destructive'}`} style={{ marginLeft: '0.375rem' }}>
                    Strategic {savedCascade.strategicDelta > 0 ? '+' : ''}{savedCascade.strategicDelta} pts
                  </span>
                )}
              </h3>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSavedCascade(null)} aria-label="Dismiss">✕</button>
          </div>

          <div className="grid-2" style={{ gap: '0.875rem', alignItems: 'start' }}>
            <div>
              {savedCascade.opened.length > 0 ? (
                <>
                  <div className="caption" style={{ fontWeight: 600, marginBottom: '0.375rem' }}>
                    {savedCascade.opened.length} programme{savedCascade.opened.length !== 1 ? 's' : ''} now open
                  </div>
                  <div className="stack">
                    {savedCascade.opened.map(p => (
                      <div key={p.id} className="row-between" style={{ fontSize: '0.8125rem', padding: '0.25rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="caption" style={{ fontSize: '0.6875rem' }}>{p.uni}</div>
                        </div>
                        <span className="badge success" style={{ height: '1rem', fontSize: '0.5625rem' }}>APS {p.aps}</span>
                      </div>
                    ))}
                  </div>
                  {onNavigateProgramme && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '0.625rem', width: '100%' }}
                      onClick={() => onNavigateProgramme('')}
                    >
                      View in Explorer →
                    </button>
                  )}
                </>
              ) : savedCascade.closed.length > 0 ? (
                <>
                  <div className="caption" style={{ fontWeight: 600, marginBottom: '0.375rem', color: 'hsl(var(--destructive))' }}>
                    {savedCascade.closed.length} programme{savedCascade.closed.length !== 1 ? 's' : ''} now out of reach
                  </div>
                  <div className="stack">
                    {savedCascade.closed.map(p => (
                      <div key={p.id} className="row-between" style={{ fontSize: '0.8125rem', padding: '0.25rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <span className="badge destructive" style={{ height: '1rem', fontSize: '0.5625rem' }}>APS {p.aps}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="caption">No programme eligibility changed.</div>
              )}
            </div>

            <div className="stack">
              {savedCascade.crossings.length > 0 && (
                <div>
                  <div className="caption" style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Career score changes</div>
                  {savedCascade.crossings.map(c => {
                    const d = c.currentScore - c.baseScore;
                    return (
                      <div key={c.name} className="row-between" style={{ fontSize: '0.8125rem', padding: '0.1875rem 0' }}>
                        <span>{c.name}</span>
                        <div className="row" style={{ gap: '0.25rem', alignItems: 'baseline' }}>
                          <span className="caption">{c.baseScore}</span>
                          <span className="caption">→</span>
                          <span style={{ fontWeight: 800, color: d > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>{c.currentScore}</span>
                          <span className={`badge ${d > 0 ? 'success' : 'destructive'}`} style={{ height: '1rem', fontSize: '0.5rem', padding: '0 0.1875rem' }}>
                            {d > 0 ? '+' : ''}{d}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sim-grid">
        {/* Left: APS display + subjects */}
        <div className="stack-3">
          <div className="sim-aps">
            <div className="caption">Live APS</div>
            <div className="num">{aps}</div>
            <div className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
              {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : ''}
              {delta !== 0 ? delta : '± 0'} from saved
            </div>
            <hr className="divider" />
            <div className="caption">
              Best 6 designated subjects (LO excluded) · official SA APS method
            </div>
          </div>

          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <h3 className="subheading">Subjects</h3>
              <span className="caption sub-row-hint">Drag slider or type %</span>
            </div>
            <div className="stack">
              {subjects.map(s => (
                <div className="sub-row" key={s.id}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row-between" style={{ marginBottom: '0.125rem' }}>
                      <div className="sub-name">{s.name}</div>
                      {onOpenDetail && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0 0.25rem', height: '1.375rem', fontSize: '0.6875rem', color: 'hsl(var(--primary))' }}
                          onClick={() => onOpenDetail(s)}
                        >
                          Detail →
                        </button>
                      )}
                    </div>
                    <div className="sub-meta">
                      {s.designated ? 'Designated' : 'Life Orientation · excluded'} · {apsPoints(s.mark)} APS pts
                    </div>
                    <input
                      className="slider"
                      type="range"
                      min={0} max={100} step={1}
                      value={s.mark}
                      onChange={e => handleChange(s.id, e.target.value)}
                    />
                  </div>
                  <input
                    className="sub-input"
                    type="number"
                    min={0} max={100}
                    value={s.mark}
                    onChange={e => handleChange(s.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: KPIs + programme impact */}
        <div className="stack-3">
          <div className="grid-3">
            {[
              { l: 'Eligible programmes', v: eligible.length, sub: 'meet your current APS', c: '' },
              { l: 'Newly opened', v: opened.length, sub: 'from mark changes', c: opened.length > 0 ? 'success' : '' },
              { l: 'Newly closed', v: closed.length, sub: 'from mark changes', c: closed.length > 0 ? 'destructive' : '' },
            ].map(x => (
              <div
                key={x.l}
                className="card kpi"
                style={x.c ? { borderColor: `hsl(var(--${x.c}) / 0.4)` } : undefined}
              >
                <div className="lbl">{x.l}</div>
                <div className="val" style={x.c ? { color: `hsl(var(--${x.c}))` } : undefined}>{x.v}</div>
                <div className="hint">{x.sub}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Programme impact</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Top {impactProgs.length} by fit score</h3>
              </div>
              <span className="caption">Live · updates as you type</span>
            </div>
            <div className="stack">
              {impactProgs.map(p => {
                const isEligible  = p.aps <= aps;
                const wasEligible = p.aps <= baselineAps;
                let cls = '';
                let tag: React.ReactNode;
                if (isEligible && !wasEligible) {
                  cls = 'opened';
                  tag = <span className="badge success">▲ Opened</span>;
                } else if (!isEligible && wasEligible) {
                  cls = 'closed';
                  tag = <span className="badge destructive">▼ Closed</span>;
                } else if (isEligible) {
                  tag = <span className="badge success">Eligible</span>;
                } else {
                  tag = <span className="badge" style={{ opacity: 0.5 }}>Need {p.aps}</span>;
                }
                return (
                  <div
                    key={p.id}
                    className={`impact-row ${cls}`}
                    style={{ cursor: onNavigateProgramme ? 'pointer' : 'default' }}
                    onClick={() => onNavigateProgramme?.(p.id)}
                    role={onNavigateProgramme ? 'button' : undefined}
                    tabIndex={onNavigateProgramme ? 0 : undefined}
                    onKeyDown={e => e.key === 'Enter' && onNavigateProgramme?.(p.id)}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div className="caption" style={{ marginTop: 1 }}>
                        {p.uni} · APS {p.aps}{p.fees ? ` · ${fmtR(p.fees)}/yr` : ''}
                      </div>
                    </div>
                    <span className={`badge ${p.pathway}`}>
                      {p.pathway[0].toUpperCase() + p.pathway.slice(1)}
                    </span>
                    {tag}
                    <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '0.9375rem', minWidth: 28, textAlign: 'right' }}>
                      {p.fit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Impact Cascade ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: '1.75rem' }}>
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="eyebrow"><span className="dot" />Impact cascade · live</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>What this scenario changes downstream</h3>
          </div>
          {hasPersonalisedData && strategicDelta !== 0 && (
            <span className={`badge ${strategicDelta > 0 ? 'success' : 'destructive'}`} style={{ fontSize: '0.875rem', height: '1.75rem' }}>
              Strategic score {strategicDelta > 0 ? '+' : ''}{strategicDelta} pts
            </span>
          )}
        </div>

        <div className="grid-2" style={{ gap: '1rem' }}>
          {/* Cheapest levers */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Cheapest path to +1 APS</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Minimum marks per point gained</h3>
              </div>
            </div>
            <div className="stack">
              {levers.map(({ subject: s, lever }, i) => {
                const isFirst = i === 0;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.5625rem 0',
                      borderBottom: '1px solid hsl(var(--border))',
                    }}
                  >
                    <div>
                      <div style={{
                        fontWeight: isFirst ? 700 : 600,
                        fontSize: '0.875rem',
                        color: isFirst ? 'hsl(var(--fg))' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}>
                        {s.name}
                        {isFirst && (
                          <span className="badge success" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.3125rem' }}>
                            Cheapest
                          </span>
                        )}
                      </div>
                      <div className="caption" style={{ marginTop: '0.125rem' }}>
                        {s.mark}% now → <strong>{lever!.targetMark}%</strong> for +{lever!.apsDelta} APS pt{lever!.apsDelta !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.03em',
                      color: isFirst ? 'hsl(var(--success))' : 'hsl(var(--muted-fg))',
                      textAlign: 'right',
                    }}>
                      +{lever!.markDelta}%
                    </div>
                    <div style={{ width: 48, textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0 0.375rem', fontSize: '0.6875rem', height: '1.5rem' }}
                        onClick={() => handleChange(s.id, String(lever!.targetMark))}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Near-miss programmes */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Within reach</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Programmes 1–6 APS points away</h3>
              </div>
            </div>
            {nearMiss.length === 0 ? (
              <div className="caption" style={{ padding: '1rem 0', textAlign: 'center' }}>
                All high-fit programmes are within your current APS range.
              </div>
            ) : (
              <div className="stack">
                {nearMiss.map(p => {
                  const gap = p.aps - aps;
                  const path = optimalPathToAps(subjects, gap);
                  const isExpanded = expandedNearMiss === p.id;
                  const totalMarkDelta = path ? path.reduce((s, x) => s + x.markDelta, 0) : null;
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '0.5625rem 0',
                        borderBottom: '1px solid hsl(var(--border))',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3125rem',
                      }}
                    >
                      <div className="row-between">
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <div className="row" style={{ gap: '0.375rem' }}>
                          <span className={`badge ${gap <= 2 ? 'warning' : 'default'}`}>
                            +{gap} APS
                          </span>
                          {path && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ height: '1.25rem', fontSize: '0.5625rem', padding: '0 0.375rem', color: 'hsl(var(--primary))' }}
                              onClick={() => setExpandedNearMiss(isExpanded ? null : p.id)}
                            >
                              {isExpanded ? 'Hide path ▲' : 'Show path ▼'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="caption">{p.uni} · {fmtR(p.fees)}/yr · fit {p.fit}/100</div>

                      {/* Collapsed hint */}
                      {!isExpanded && path && (
                        <div className="caption" style={{ color: 'hsl(var(--success))', fontWeight: 600, fontSize: '0.75rem' }}>
                          {path.length === 1
                            ? `→ Raise ${path[0].subjectName} by ${path[0].markDelta}% to unlock`
                            : `→ ${path.length} subjects · +${totalMarkDelta}% total effort to unlock`}
                        </div>
                      )}
                      {!path && (
                        <div className="caption" style={{ color: 'hsl(var(--muted-fg))', fontSize: '0.75rem' }}>
                          Requires marks beyond current subject ceilings
                        </div>
                      )}

                      {/* Expanded optimal path */}
                      {isExpanded && path && (
                        <div style={{
                          marginTop: '0.375rem', padding: '0.75rem',
                          background: 'hsl(var(--success) / 0.05)',
                          border: '1px solid hsl(var(--success) / 0.2)',
                          borderRadius: 8,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-fg))', marginBottom: '0.5rem' }}>
                            Optimal unlock path · +{totalMarkDelta}% total
                          </div>
                          <div className="stack-2">
                            {path.map((step, i) => (
                              <div key={step.subjectId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{step.subjectName}</div>
                                  <div className="caption" style={{ fontSize: '0.625rem' }}>
                                    {step.fromMark}% → {step.toMark}% · +{step.ptsGained} APS pt{step.ptsGained !== 1 ? 's' : ''}
                                  </div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'hsl(var(--success))', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                                  +{step.markDelta}%
                                </div>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ height: '1.5rem', fontSize: '0.6875rem', padding: '0 0.375rem' }}
                                  onClick={() => handleChange(step.subjectId, String(step.toMark))}
                                  title="Apply this target mark"
                                >
                                  Apply
                                </button>
                              </div>
                            ))}
                          </div>
                          {onNavigateProgramme && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.75rem' }}
                              onClick={() => onNavigateProgramme(p.id)}
                            >
                              View {p.name} →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Career score impact — only when psychProfile + capabilityData available */}
        {hasPersonalisedData && currentCareerData && (
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="row-between" style={{ marginBottom: '1rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Career match impact · personalised</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                  How this APS scenario shifts your top career scores
                </h3>
              </div>
              {thresholdCrossings.length > 0 && (
                <span className="badge success" style={{ height: '1.5rem', fontSize: '0.75rem' }}>
                  {thresholdCrossings.length} threshold{thresholdCrossings.length !== 1 ? 's' : ''} crossed
                </span>
              )}
            </div>

            <div className="stack-2">
              {currentCareerData.map(c => {
                const scoreDelta = c.currentScore - c.baseScore;
                const maxScore = Math.max(c.baseScore, c.currentScore);
                const crossed = Math.abs(scoreDelta) >= 4;

                return (
                  <div key={c.name} style={{
                    padding: '0.625rem 0',
                    borderBottom: '1px solid hsl(var(--border))',
                  }}>
                    <div className="row-between" style={{ marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</span>
                        {crossed && (
                          <span className={`badge ${scoreDelta > 0 ? 'success' : 'destructive'}`}
                            style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.3125rem' }}>
                            {scoreDelta > 0 ? '▲' : '▼'} Gate
                          </span>
                        )}
                      </div>
                      <div className="row" style={{ gap: '0.5rem', alignItems: 'baseline' }}>
                        <span style={{ color: 'hsl(var(--muted-fg))', fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums' }}>
                          {c.baseScore}
                        </span>
                        <span style={{ color: 'hsl(var(--muted-fg))', fontSize: '0.75rem' }}>→</span>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          fontVariantNumeric: 'tabular-nums',
                          color: scoreDelta > 0 ? 'hsl(var(--success))' : scoreDelta < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--fg))',
                        }}>
                          {c.currentScore}
                        </span>
                        {scoreDelta !== 0 && (
                          <span className={`badge ${scoreDelta > 0 ? 'success' : 'destructive'}`}
                            style={{ height: '1.125rem', fontSize: '0.5625rem', padding: '0 0.3125rem' }}>
                            {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dual-track meter: muted = baseline, primary = current */}
                    <div style={{ position: 'relative', height: '0.375rem', borderRadius: 999, background: 'hsl(var(--border))' }}>
                      {/* Baseline track */}
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0,
                        height: '100%',
                        width: `${c.baseScore}%`,
                        borderRadius: 999,
                        background: 'hsl(var(--muted-fg) / 0.35)',
                        transition: 'width 0.2s ease',
                      }} />
                      {/* Current track */}
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0,
                        height: '100%',
                        width: `${c.currentScore}%`,
                        borderRadius: 999,
                        background: scoreDelta > 0 ? 'hsl(var(--success))' : scoreDelta < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                        maxWidth: '100%',
                        transition: 'width 0.2s ease',
                      }} />
                    </div>

                    <div className="row-between" style={{ marginTop: '0.25rem' }}>
                      <span className="caption" style={{ fontSize: '0.625rem' }}>
                        {fmtR(c.salary)}/mo · {c.growth} growth
                      </span>
                      <span className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`}
                        style={{ height: '1rem', fontSize: '0.5rem', padding: '0 0.25rem' }}>
                        {c.demand} demand
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategic score breakdown if it changed */}
            {currentStrategic && baselineStrategic && strategicDelta !== 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid hsl(var(--border))' }}>
                <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="eyebrow"><span className="dot" />Strategic score estimate</div>
                  <div className="row" style={{ gap: '0.5rem', alignItems: 'baseline' }}>
                    <span style={{ color: 'hsl(var(--muted-fg))', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                      {baselineStrategic.overall}
                    </span>
                    <span style={{ color: 'hsl(var(--muted-fg))', fontSize: '0.75rem' }}>→</span>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                      {currentStrategic.overall}
                    </span>
                    <span className={`badge ${strategicDelta > 0 ? 'success' : 'destructive'}`}>
                      {strategicDelta > 0 ? '+' : ''}{strategicDelta}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                  {([
                    ['Academic',     baselineStrategic.academic_readiness,        currentStrategic.academic_readiness],
                    ['Career align', baselineStrategic.career_demand_alignment,   currentStrategic.career_demand_alignment],
                    ['Global',       baselineStrategic.global_mobility_potential, currentStrategic.global_mobility_potential],
                  ] as const).map(([label, base, curr]) => {
                    const d = curr - base;
                    return (
                      <div key={label} style={{ padding: '0.625rem', background: 'hsl(var(--muted) / 0.4)', borderRadius: 8 }}>
                        <div className="caption" style={{ fontSize: '0.625rem', marginBottom: '0.25rem' }}>{label}</div>
                        <div className="row" style={{ gap: '0.25rem', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{curr}</span>
                          {d !== 0 && (
                            <span className={`badge ${d > 0 ? 'success' : 'destructive'}`}
                              style={{ height: '0.875rem', fontSize: '0.5rem', padding: '0 0.1875rem' }}>
                              {d > 0 ? '+' : ''}{d}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!hasPersonalisedData && (
          <div className="card" style={{ marginTop: '1rem', borderStyle: 'dashed' }}>
            <div className="eyebrow"><span className="dot" />Career match impact</div>
            <p className="body-text" style={{ margin: '0.375rem 0 0', fontSize: '0.875rem' }}>
              Complete your profile assessment to see how this scenario shifts your personalised career match scores and strategic readiness index.
            </p>
          </div>
        )}
      </div>

      {/* ── Grade Boundary Calculator ───────────────────────────────────────── */}
      <GradeBoundaryCalculator subjects={subjects} aps={aps} allProgs={allProgs} onApply={handleChange} />
    </div>
  );
}
