'use client';

import type { Subject, Programme, Route } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { calcAPS, apsPoints, fmtR } from '@/lib/utils';

interface SubjectDetailPageProps {
  subject: Subject | null;
  subjects: Subject[];
  programmes?: Programme[];
  savedProgrammeIds?: string[];
  navigate: (r: Route, prog?: string) => void;
}

const APS_TABLE = [
  { range: '80–100%', pts: 7 },
  { range: '70–79%',  pts: 6 },
  { range: '60–69%',  pts: 5 },
  { range: '50–59%',  pts: 4 },
  { range: '40–49%',  pts: 3 },
  { range: '30–39%',  pts: 2 },
  { range: '0–29%',   pts: 1 },
];

const STUDY_TIPS: Record<string, string[]> = {
  math:        ['Practice past papers from 2021–2025 (DBE website)', 'Focus on algebra, functions, and statistics — highest exam weight', 'Do 30 min of timed problem-solving daily, then mark yourself honestly'],
  mathliteracy:['Focus on finance, measurement, and data handling sections', 'Work through past exam papers under real conditions', 'Use a calculator for all practicals — speed with accuracy matters'],
  techmath:    ['Prioritise trigonometry, geometry, and financial maths', 'Practice past Technical Maths NSC papers (2019–2025)', 'Link concepts to real-world engineering applications'],
  pscience:    ['Master Newton\'s laws and electricity circuits first — highest exam weight', 'Use the CAPS formula sheet in every practice session', 'Pair with a study partner for experimental write-ups'],
  lifesciences:['Use labelled diagrams for cell biology and genetics', 'Make a glossary of technical terms per chapter', 'Focus on ecology, human systems, and evolution — most frequently tested'],
  accounting:  ['Practice the balance sheet and income statement until automatic', 'Do at least one full accounting exam per week under time pressure', 'Reconciliation questions are high-value — don\'t skip them'],
  business:    ['Learn the 4Ps and all business functions thoroughly', 'Write your own case study answers then compare to memo', 'Link theory to real SA companies in your examples'],
  economics:   ['Understand supply/demand shifts with diagram practice', 'Economic indicators (GDP, inflation, unemployment) are frequently tested', 'Write a sample essay per section — examiners reward structure'],
  geography:   ['Sketch maps from memory for high-weight regions', 'Practice climate graphs and data response questions', 'Link human geography to current SA news events'],
  history:     ['Practice source-based questions from all periods', 'Learn to write structured essays with clear argument and evidence', 'Build a timeline for each topic to anchor events in sequence'],
  it:          ['Code consistently — even 30 min of problem-solving daily compounds fast', 'Review Delphi/Java past papers for patterns in examination questions', 'Build a small project that uses the concepts you\'re studying'],
  cat:         ['Master spreadsheet formulas — they appear in every paper', 'Practice word-processing and presentation tasks under time pressure', 'Theory section: learn hardware/software concepts in plain English'],
  eng:         ['Read one quality article per day and summarise it in 3 sentences', 'Practice essay structure: introduction, 3 body paragraphs, conclusion', 'Work through past comprehension papers under timed conditions'],
  afr:         ['Read Afrikaans short stories or articles for 15 min daily', 'Practice formal and informal letter formats', 'Focus on grammar: conjunctions, sentence structure, tenses'],
  zul:         ['Listen to isiZulu radio or news daily for comprehension', 'Practise essay and formal letter writing formats', 'Master grammar rules — consistently tested across all papers'],
  sesotho:     ['Read Sesotho newspapers or short stories weekly', 'Practise essay writing and formal letter format', 'Focus on grammar rules — consistently tested'],
  lo:          ['Life Orientation is excluded from APS — focus on core subjects first', 'Aim for 80%+ as it counts toward your NSC certificate', 'Use it as a confidence booster, not an APS driver'],
};

function getStudyTips(subjectId: string, subjectName: string): string[] {
  const id = subjectId.toLowerCase();
  const name = subjectName.toLowerCase();
  if (STUDY_TIPS[id]) return STUDY_TIPS[id];
  if (name.includes('mathematics') && !name.includes('literacy') && !name.includes('technical')) return STUDY_TIPS.math;
  if (name.includes('mathematical literacy') || name.includes('maths literacy')) return STUDY_TIPS.mathliteracy;
  if (name.includes('technical math')) return STUDY_TIPS.techmath;
  if (name.includes('physical science')) return STUDY_TIPS.pscience;
  if (name.includes('life science')) return STUDY_TIPS.lifesciences;
  if (name.includes('accounting')) return STUDY_TIPS.accounting;
  if (name.includes('business')) return STUDY_TIPS.business;
  if (name.includes('economics')) return STUDY_TIPS.economics;
  if (name.includes('geography')) return STUDY_TIPS.geography;
  if (name.includes('history')) return STUDY_TIPS.history;
  if (name.includes('information technology') || name.includes(' it ')) return STUDY_TIPS.it;
  if (name.includes('computer application') || name.includes('cat')) return STUDY_TIPS.cat;
  if (name.includes('english')) return STUDY_TIPS.eng;
  if (name.includes('afrikaans')) return STUDY_TIPS.afr;
  if (name.includes('zulu') || name.includes('isizulu')) return STUDY_TIPS.zul;
  if (name.includes('sesotho') || name.includes('sotho')) return STUDY_TIPS.sesotho;
  if (name.includes('life orientation')) return STUDY_TIPS.lo;
  return [
    'Work through the most recent 3 years of DBE past papers for this subject',
    'Identify your weakest chapter and dedicate 30 min daily to it for 2 weeks',
    'Form a study group with peers to explain concepts to each other',
  ];
}

function getNextApsThreshold(currentMark: number): { mark: number; pts: number } | null {
  const currentPts = apsPoints(currentMark);
  const thresholds = [30, 40, 50, 60, 70, 80];
  for (const t of thresholds) {
    if (currentMark < t && apsPoints(t) > currentPts) {
      return { mark: t, pts: apsPoints(t) };
    }
  }
  return null;
}

export default function SubjectDetailPage({ subject, subjects, programmes: propProgrammes, savedProgrammeIds = [], navigate }: SubjectDetailPageProps) {
  if (!subject) {
    return (
      <div className="page-anim">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="subheading" style={{ marginBottom: '0.75rem' }}>No subject selected</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('simulator')}>← Back to simulator</button>
        </div>
      </div>
    );
  }

  const allProgs = propProgrammes && propProgrammes.length > 0 ? propProgrammes : PROGRAMMES;
  const currentAps = calcAPS(subjects);
  const currentPts = subject.designated ? apsPoints(subject.mark) : 0;
  const nextThreshold = subject.designated ? getNextApsThreshold(subject.mark) : null;

  // Find programmes that would become eligible with a small APS boost from this subject
  const impactProgs: Array<{ prog: Programme; markNeeded: number; apsGain: number }> = [];
  if (subject.designated) {
    for (const p of allProgs) {
      if (p.aps > currentAps && p.aps <= currentAps + 6) {
        // Binary search for minimum mark that tips APS over threshold
        let lo = subject.mark + 1, hi = 100;
        let found = -1;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          const newAps = calcAPS(subjects.map(s => s.id === subject.id ? { ...s, mark: mid } : s));
          if (newAps >= p.aps) {
            found = mid;
            hi = mid - 1;
          } else {
            lo = mid + 1;
          }
        }
        if (found !== -1) {
          const newAps = calcAPS(subjects.map(s => s.id === subject.id ? { ...s, mark: found } : s));
          impactProgs.push({ prog: p, markNeeded: found, apsGain: newAps - currentAps });
        }
      }
    }
  }
  impactProgs.sort((a, b) => a.markNeeded - b.markNeeded);

  const tips = getStudyTips(subject.id, subject.name);

  // Mark trajectory: what would total APS be at key thresholds for this subject
  const otherAps = subject.designated ? currentAps - currentPts : currentAps;
  const trajectoryRows = subject.designated
    ? [50, 55, 60, 65, 70, 75, 80].map(mark => {
        const pts      = apsPoints(mark);
        const totalAps = otherAps + pts;
        const newProgs = allProgs.filter(p => p.aps <= totalAps && p.aps > currentAps);
        return { mark, pts, totalAps, newProgs };
      })
    : [];
  // The single row that corresponds to the student's current mark (largest trajectory mark ≤ subject.mark)
  const currentTrajMark = trajectoryRows.filter(r => r.mark <= subject.mark).slice(-1)[0]?.mark ?? -1;

  // Saved programmes context: which of the student's saved programmes care about this subject
  const savedProgs = savedProgrammeIds.length > 0
    ? allProgs.filter(p => savedProgrammeIds.includes(p.id) && p.aps > 0)
        .map(p => ({
          ...p,
          gap: Math.max(0, p.aps - currentAps),
          eligible: p.aps <= currentAps,
        }))
        .sort((a, b) => a.gap - b.gap)
        .slice(0, 4)
    : [];

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Simulator · Subject</div>
        <div className="row-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '0.5rem', padding: 0, fontSize: '0.8125rem' }}
              onClick={() => navigate('simulator')}
            >
              ← Back to simulator
            </button>
            <div className="eyebrow"><span className="dot" />Subject deep-dive</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{subject.name}</h2>
            <div className="caption" style={{ marginTop: '0.25rem' }}>
              {subject.designated ? 'Designated subject · counts toward APS' : 'Life Orientation · excluded from APS'}
            </div>
          </div>
          <div className="row" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
            <div className="card compact" style={{ textAlign: 'center', padding: '0.5rem 0.875rem' }}>
              <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em' }}>{subject.mark}%</div>
              <div className="caption" style={{ fontSize: '0.625rem' }}>current mark</div>
            </div>
            {subject.designated && (
              <div className="card compact" style={{ textAlign: 'center', padding: '0.5rem 0.875rem' }}>
                <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', color: 'hsl(var(--primary))' }}>{currentPts}/7</div>
                <div className="caption" style={{ fontSize: '0.625rem' }}>APS pts</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div className="stack-3">
          {/* APS conversion table */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Mark → APS conversion</div>
            <div style={{ marginBottom: '0.875rem' }}>
              <div style={{ position: 'relative', height: '0.375rem', borderRadius: 999, background: 'hsl(var(--border))' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${Math.min(subject.mark, 100)}%`,
                  borderRadius: 999,
                  background: subject.mark >= 80 ? 'hsl(var(--success))' : subject.mark >= 60 ? 'hsl(var(--primary))' : subject.mark >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span className="caption" style={{ fontSize: '0.5rem' }}>0%</span>
                <span className="caption" style={{ fontSize: '0.5rem', fontWeight: 700, color: 'hsl(var(--fg))' }}>{subject.mark}% — you</span>
                <span className="caption" style={{ fontSize: '0.5rem' }}>100%</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', fontWeight: 600, borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--fg-muted))', fontSize: '0.6875rem' }}>Mark range</th>
                    <th style={{ textAlign: 'right', padding: '0.375rem 0.5rem', fontWeight: 600, borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--fg-muted))', fontSize: '0.6875rem' }}>APS points</th>
                  </tr>
                </thead>
                <tbody>
                  {APS_TABLE.map(row => {
                    const isCurrent = row.pts === currentPts;
                    return (
                      <tr
                        key={row.pts}
                        style={{
                          background: isCurrent ? 'hsl(var(--primary) / 0.1)' : undefined,
                          borderLeft: isCurrent ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.5rem', fontWeight: isCurrent ? 700 : 400 }}>{row.range}</td>
                        <td style={{ padding: '0.5rem 0.5rem', textAlign: 'right', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: isCurrent ? 'hsl(var(--primary))' : undefined }}>
                          {row.pts} {isCurrent && <span className="caption" style={{ fontSize: '0.625rem', fontWeight: 400 }}>← you</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {nextThreshold && (() => {
              const marksNeeded = nextThreshold.mark - subject.mark;
              const studyWeeks = Math.max(1, Math.ceil(marksNeeded / 5));
              return (
                <div className="card compact" style={{ marginTop: '0.875rem', background: 'hsl(var(--success) / 0.08)', borderColor: 'hsl(var(--success) / 0.3)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Raise to {nextThreshold.mark}% → earn {nextThreshold.pts} pts (+{nextThreshold.pts - currentPts})
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.6875rem' }}>
                    {marksNeeded}% to go · approx. {studyWeeks === 1 ? '1 week' : `${studyWeeks} weeks`} of focused daily practice
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Study tips */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Study tips</div>
            <div className="stack-2">
              {tips.map((tip, i) => (
                <div key={i} className="row" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    background: 'hsl(var(--primary) / 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', fontWeight: 800, color: 'hsl(var(--primary))',
                  }}>
                    {i + 1}
                  </div>
                  <p className="body-text" style={{ fontSize: '0.875rem', margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="stack-3">
          {/* Mark trajectory table */}
          {subject.designated && trajectoryRows.length > 0 && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Mark trajectory</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      {['Mark', 'APS pts', 'Total APS', 'New programmes'].map(h => (
                        <th key={h} style={{ textAlign: h === 'Mark' ? 'left' : 'right', padding: '0.375rem 0.375rem', fontWeight: 600, borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--fg-muted))', fontSize: '0.625rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trajectoryRows.map(row => {
                      const isCurrent = row.mark === currentTrajMark;
                      const highlight = row.mark === [50,55,60,65,70,75,80].find(m => m > subject.mark);
                      return (
                        <tr key={row.mark} style={{
                          background: isCurrent ? 'hsl(var(--primary) / 0.08)' : highlight ? 'hsl(var(--success) / 0.07)' : undefined,
                          borderLeft: isCurrent ? '3px solid hsl(var(--primary))' : highlight ? '3px solid hsl(var(--success))' : '3px solid transparent',
                        }}>
                          <td style={{ padding: '0.4rem 0.375rem', fontWeight: isCurrent ? 700 : 400 }}>{row.mark}%{isCurrent && <span className="caption" style={{ fontSize: '0.5625rem', marginLeft: 4 }}>← you</span>}</td>
                          <td style={{ padding: '0.4rem 0.375rem', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{row.pts}</td>
                          <td style={{ padding: '0.4rem 0.375rem', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: highlight ? 'hsl(var(--success))' : undefined }}>{row.totalAps}</td>
                          <td style={{ padding: '0.4rem 0.375rem', textAlign: 'right', fontSize: '0.75rem' }}>
                            {row.newProgs.length > 0 ? (
                              <div>
                                <span style={{ color: 'hsl(var(--success))', fontWeight: 700 }}>+{row.newProgs.length}</span>
                                <div className="caption" style={{ fontSize: '0.5rem', lineHeight: 1.35, marginTop: '0.125rem' }}>
                                  {row.newProgs.slice(0, 2).map(p => p.name).join(', ')}
                                  {row.newProgs.length > 2 && ` +${row.newProgs.length - 2} more`}
                                </div>
                              </div>
                            ) : <span className="caption">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="caption" style={{ marginTop: '0.625rem', fontSize: '0.6875rem' }}>
                Next threshold highlighted in green — that&apos;s your nearest leverage point.
              </div>
            </div>
          )}

          {/* Saved programmes context */}
          {savedProgs.length > 0 && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Your saved programmes</div>
              <div className="stack">
                {savedProgs.map(p => (
                  <div key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div className="row-between">
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <span className={`badge ${p.eligible ? 'success' : 'warning'}`} style={{ flexShrink: 0, marginLeft: '0.5rem', fontSize: '0.5625rem' }}>
                        {p.eligible ? `APS ${p.aps} ✓` : `Need +${p.gap}`}
                      </span>
                    </div>
                    <div className="caption" style={{ marginTop: 2 }}>{p.uni} · APS {p.aps} required</div>
                    {!p.eligible && subject.designated && (
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'hsl(var(--fg-muted))' }}>
                        Raising this subject could contribute {Math.min(p.gap, 2)} APS pts toward closing the gap
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APS contribution meter */}
          {subject.designated && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />APS contribution</div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <span className="caption">This subject contributes</span>
                <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{currentPts} / 7 pts</span>
              </div>
              <div className="meter success">
                <i style={{ width: `${(currentPts / 7) * 100}%` }} />
              </div>
              <div className="row-between" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <span className="caption">Your total APS</span>
                <span style={{ fontWeight: 700 }}>{currentAps} / 49</span>
              </div>
              <div className="meter" style={{ marginTop: '0.375rem' }}>
                <i style={{ width: `${(currentAps / 49) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Programme impact */}
          {subject.designated && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Programme unlock potential</div>
              {impactProgs.length === 0 ? (
                <div className="caption" style={{ textAlign: 'center', padding: '1rem 0' }}>
                  {subject.mark >= 80
                    ? 'Already at maximum — all nearby programmes are unlocked!'
                    : 'No programmes within reach for this subject at current APS. Try raising other subjects.'}
                </div>
              ) : (
                <div className="stack">
                  {impactProgs.slice(0, 5).map(({ prog, markNeeded, apsGain }) => (
                    <div key={prog.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                      <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prog.name}
                        </div>
                        <span className="badge success" style={{ flexShrink: 0, marginLeft: '0.5rem' }}>+{apsGain} APS</span>
                      </div>
                      <div className="caption" style={{ marginBottom: '0.375rem' }}>{prog.uni} · {fmtR(prog.fees)}/yr</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.8125rem' }}>
                          Raise to <strong style={{ color: 'hsl(var(--primary))' }}>{markNeeded}%</strong> to unlock
                          <span className="caption" style={{ marginLeft: '0.375rem' }}>({markNeeded - subject.mark}% to go)</span>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', height: 'auto', flexShrink: 0 }}
                          onClick={() => navigate('programmes', prog.id)}
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!subject.designated && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Note</div>
              <p className="body-text" style={{ fontSize: '0.875rem' }}>
                Life Orientation does not contribute to your APS score but is required for your NSC certificate.
                Aim for 80%+ to maximise your overall results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
