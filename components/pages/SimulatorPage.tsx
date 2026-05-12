'use client';

import { useTransition, useState } from 'react';
import type { Subject, Programme } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { calcAPS, apsPoints, fmtR } from '@/lib/utils';
import { saveSubjectMarks } from '@/app/actions/saveSubjects';

interface SimulatorPageProps {
  subjects: Subject[];
  onSubjectChange: (id: string, mark: number) => void;
  onReset: () => void;
  onSaved?: (subjects: Subject[]) => void;
  programmes?: Programme[];
  onNavigateProgramme?: (progId: string) => void;
  onOpenDetail?: (subject: Subject) => void;
}

export default function SimulatorPage({ subjects, onSubjectChange, onReset, onSaved, programmes, onNavigateProgramme, onOpenDetail }: SimulatorPageProps) {
  const allProgs = programmes ?? PROGRAMMES;
  const aps = calcAPS(subjects);
  // Capture the APS on first render as the baseline for delta display
  const [baselineAps] = useState(() => aps);
  const delta = aps - baselineAps;

  const eligible = allProgs.filter(p => p.aps <= aps);
  const opened  = allProgs.filter(p => p.aps <= aps && p.aps > baselineAps);
  const closed  = allProgs.filter(p => p.aps > aps && p.aps <= baselineAps);

  const [isPending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleChange(id: string, raw: string) {
    const mark = Math.max(0, Math.min(100, parseInt(raw) || 0));
    onSubjectChange(id, mark);
    setSaveMsg(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveSubjectMarks(subjects);
      if (result && 'error' in result) {
        setSaveMsg({ ok: false, text: result.error ?? 'Save failed' });
      } else {
        setSaveMsg({ ok: true, text: 'Marks saved' });
        onSaved?.(subjects);
        setTimeout(() => setSaveMsg(null), 3000);
      }
    });
  }

  // For impact list: show top programmes sorted by fit score
  const impactProgs = [...allProgs].sort((a, b) => b.fit - a.fit).slice(0, 12);

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
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? 'Saving…' : 'Save marks'}
            </button>
          </div>
        </div>
      </div>

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
                      min={0}
                      max={100}
                      step={1}
                      value={s.mark}
                      onChange={e => handleChange(s.id, e.target.value)}
                    />
                  </div>
                  <input
                    className="sub-input"
                    type="number"
                    min={0}
                    max={100}
                    value={s.mark}
                    onChange={e => handleChange(s.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: KPIs + impact list */}
        <div className="stack-3">
          <div className="grid-3">
            {[
              { l: 'Eligible programmes', v: eligible.length, sub: 'meet your current APS', c: '' },
              { l: 'Newly opened', v: opened.length, sub: 'from mark changes', c: 'success' },
              { l: 'Newly closed', v: closed.length, sub: 'from mark changes', c: 'destructive' },
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
                const isEligible = p.aps <= aps;
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
                      <div style={{
                        fontWeight: 600, fontSize: '0.875rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
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
                    <div style={{
                      fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                      fontSize: '0.9375rem', minWidth: 28, textAlign: 'right',
                    }}>
                      {p.fit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
