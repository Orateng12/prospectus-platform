'use client';

import { useState, useTransition } from 'react';
import { SUBJECTS, SUBJECT_CATALOG } from '@/lib/data';
import { calcAPS, calcAPSForCurriculum, apsPoints, cambridgeGradeToPoints, ncvMarkToPoints, ibScoreToPoints } from '@/lib/utils';
import { saveOnboarding } from '@/app/actions/saveOnboarding';
import type { Subject, OnboardingData, Curriculum } from '@/lib/types';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
];

const MATRIC_YEARS = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

// Big Five: 2 questions per trait
const BIG5_QUESTIONS = [
  { key: 'openness_1',           trait: 'openness',          text: 'I enjoy exploring new ideas and thinking about abstract concepts.' },
  { key: 'openness_2',           trait: 'openness',          text: 'I have a vivid imagination and enjoy creative activities.' },
  { key: 'conscientiousness_1',  trait: 'conscientiousness', text: 'I complete tasks on time and pay close attention to detail.' },
  { key: 'conscientiousness_2',  trait: 'conscientiousness', text: 'I am organized and follow through on my plans and commitments.' },
  { key: 'extraversion_1',       trait: 'extraversion',      text: 'I feel energized being around other people and enjoy social events.' },
  { key: 'extraversion_2',       trait: 'extraversion',      text: 'I find it easy to start conversations and meet new people.' },
  { key: 'agreeableness_1',      trait: 'agreeableness',     text: 'I enjoy helping others and prioritize cooperation over competition.' },
  { key: 'agreeableness_2',      trait: 'agreeableness',     text: 'I try to understand others\' feelings and avoid unnecessary conflict.' },
  { key: 'neuroticism_1',        trait: 'neuroticism',       text: 'I sometimes feel anxious or worried even when things are going well.' },
  { key: 'neuroticism_2',        trait: 'neuroticism',       text: 'I can feel overwhelmed or stressed under pressure.' },
];

// RIASEC: 1 direct interest rating per code
const RIASEC_QUESTIONS = [
  { key: 'realistic',     text: 'Working with tools, machines, or physical/technical systems.' },
  { key: 'investigative', text: 'Research, analysis, and solving complex intellectual problems.' },
  { key: 'artistic',      text: 'Creative expression — art, writing, design, music, or performance.' },
  { key: 'social',        text: 'Teaching, counselling, or directly helping and supporting people.' },
  { key: 'enterprising',  text: 'Leading teams, selling ideas, negotiating, or running projects.' },
  { key: 'conventional',  text: 'Organizing data, managing records, or following structured procedures.' },
];

// Capabilities
const CAP_QUESTIONS = [
  { key: 'analytical_thinking',  text: 'Analytical thinking — breaking down complex problems logically.' },
  { key: 'creative_thinking',    text: 'Creative thinking — generating original ideas and solutions.' },
  { key: 'leadership_potential', text: 'Leadership — guiding and motivating others toward a goal.' },
  { key: 'communication_skills', text: 'Communication — expressing ideas clearly in writing and speech.' },
  { key: 'technical_aptitude',   text: 'Technical aptitude — working with technology or technical tools.' },
  { key: 'entrepreneurial_drive',text: 'Entrepreneurial drive — initiative, hustle, and building things.' },
  { key: 'risk_tolerance_score', text: 'Risk tolerance — comfort with uncertainty and calculated risk.' },
  { key: 'perseverance',         text: 'Perseverance — staying consistent and resilient through challenges.' },
];

const WORK_STYLES = ['Independent', 'Collaborative', 'Structured', 'Flexible', 'Remote', 'Field-based'];
const MOTIVATIONS = ['Impact & purpose', 'Financial security', 'Creative freedom', 'Status & recognition', 'Learning & growth', 'Community & service'];

const STEP_LABELS = ['About you', 'Subject marks', 'Personality', 'Strengths', 'Your situation'];

// Rating component: 1–5 scale
function Rating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rating-btn${value === n ? ' selected' : ''}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.6875rem', color: 'hsl(var(--ink-light))', fontWeight: 500 }}>Not at all</span>
        <span style={{ fontSize: '0.6875rem', color: 'hsl(var(--ink-light))', fontWeight: 500 }}>Very much</span>
      </div>
    </div>
  );
}

interface WizardProps {
  initialFirstName?: string;
  initialLastName?: string;
}

export default function OnboardingWizard({ initialFirstName = '', initialLastName = '' }: WizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState('');

  // Step 1 — About you
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [province, setProvince] = useState('');
  const [matricYear, setMatricYear] = useState(MATRIC_YEARS[0]);

  // Step 2 — Subjects & Curriculum
  const [curriculum, setCurriculum] = useState<Curriculum>('NSC');
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS.map(s => ({ ...s })));
  const [subjectSearch, setSubjectSearch] = useState('');

  // Step 3 — Personality
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [workStyle, setWorkStyle] = useState('');
  const [motivation, setMotivation] = useState('');

  // Step 4 — Capabilities
  const [caps, setCaps] = useState<Record<string, number>>({});

  // Step 5 — Financial
  const [income, setIncome] = useState(250_000);

  const aps = calcAPSForCurriculum(subjects);
  const totalSteps = 5;

  function canAdvance(): boolean {
    if (step === 1) return firstName.trim().length > 0 && province.length > 0;
    if (step === 3) {
      const allBig5 = BIG5_QUESTIONS.every(q => (ratings[q.key] ?? 0) > 0);
      const allRiasec = RIASEC_QUESTIONS.every(q => (ratings[q.key] ?? 0) > 0);
      return allBig5 && allRiasec && workStyle.length > 0 && motivation.length > 0;
    }
    if (step === 4) return CAP_QUESTIONS.every(q => (caps[q.key] ?? 0) > 0);
    return true;
  }

  function avgRating(keys: string[]): number {
    const vals = keys.map(k => ratings[k] ?? 3);
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20);
  }

  function handleFinish() {
    setSaveError('');
    const data: OnboardingData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      province,
      matricYear,
      subjects,
      openness:          avgRating(['openness_1', 'openness_2']),
      conscientiousness: avgRating(['conscientiousness_1', 'conscientiousness_2']),
      extraversion:      avgRating(['extraversion_1', 'extraversion_2']),
      agreeableness:     avgRating(['agreeableness_1', 'agreeableness_2']),
      neuroticism:       avgRating(['neuroticism_1', 'neuroticism_2']),
      realistic:    (ratings['realistic'] ?? 3) * 20,
      investigative:(ratings['investigative'] ?? 3) * 20,
      artistic:     (ratings['artistic'] ?? 3) * 20,
      social:       (ratings['social'] ?? 3) * 20,
      enterprising: (ratings['enterprising'] ?? 3) * 20,
      conventional: (ratings['conventional'] ?? 3) * 20,
      primary_motivation:    motivation,
      work_style_preference: workStyle,
      analytical_thinking:   (caps['analytical_thinking'] ?? 3) * 20,
      creative_thinking:     (caps['creative_thinking'] ?? 3) * 20,
      leadership_potential:  (caps['leadership_potential'] ?? 3) * 20,
      communication_skills:  (caps['communication_skills'] ?? 3) * 20,
      technical_aptitude:    (caps['technical_aptitude'] ?? 3) * 20,
      entrepreneurial_drive: (caps['entrepreneurial_drive'] ?? 3) * 20,
      risk_tolerance_score:  (caps['risk_tolerance_score'] ?? 3) * 20,
      perseverance:          (caps['perseverance'] ?? 3) * 20,
      householdIncome: income,
    };
    startTransition(async () => {
      const result = await saveOnboarding(data);
      if (result?.error) setSaveError(result.error);
    });
  }

  return (
    <div className="onboarding-shell">

      {/* ── Sidebar / mobile top bar ──────────────────────── */}
      <aside className="onboarding-sidebar">
        <span className="onboarding-sidebar-logo">
          Prospectus<span style={{ color: 'hsl(var(--amber))' }}>.</span>
        </span>

        <div className="onboarding-sidebar-steps">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const isDone = n < step;
            const isActive = n === step;
            return (
              <div key={n} className="onboarding-step-item">
                <div className={`onboarding-step-marker${isDone ? ' done' : isActive ? ' active' : ''}`}>
                  {isDone ? '✓' : n}
                </div>
                <span className={`onboarding-step-label${isActive ? ' active' : isDone ? ' done' : ''}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="onboarding-sidebar-hint">Takes about 5 minutes</p>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="onboarding-content">
        <div className="onboarding-form-card">

          {/* ── Step 1: About you ──────────────────────────── */}
          {step === 1 && (
            <div className="page-anim">
              <p className="kicker" style={{ marginBottom: '1rem' }}>Step 1 of 5</p>
              <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'hsl(var(--ink))', marginBottom: '0.5rem' }}>
                About you
              </h2>
              <p className="lede" style={{ marginBottom: '1.75rem' }}>
                This helps us personalise your programme and funding matches.
              </p>
              <hr className="ink-rule" style={{ marginBottom: '1.75rem' }} />

              <div className="stack-3">
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  <div>
                    <label className="onboarding-label" htmlFor="ob-firstname">First name *</label>
                    <input
                      id="ob-firstname"
                      className="auth-input"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Tumelo"
                    />
                  </div>
                  <div>
                    <label className="onboarding-label" htmlFor="ob-lastname">Last name</label>
                    <input
                      id="ob-lastname"
                      className="auth-input"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Tata"
                    />
                  </div>
                </div>

                <div>
                  <label className="onboarding-label" htmlFor="ob-province">Province *</label>
                  <select
                    id="ob-province"
                    className="auth-input"
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                  >
                    <option value="">Select your province…</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="onboarding-label">Matric year</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {MATRIC_YEARS.map(y => (
                      <button
                        key={y}
                        type="button"
                        className={`choice-pill${matricYear === y ? ' selected' : ''}`}
                        onClick={() => setMatricYear(y)}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Subjects ───────────────────────────── */}
          {step === 2 && (
            <div className="page-anim">
              <p className="kicker" style={{ marginBottom: '1rem' }}>Step 2 of 5</p>
              <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'hsl(var(--ink))', marginBottom: '0.5rem' }}>
                Your subject marks
              </h2>
              <p className="lede" style={{ marginBottom: '1.75rem' }}>
                Select your qualification type, then add your subjects and marks. APS updates in real time.
              </p>
              <hr className="ink-rule" style={{ marginBottom: '1.75rem' }} />

              {/* Curriculum selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(var(--ink))', marginBottom: '0.5rem' }}>Qualification type</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {(['NSC', 'IEB', 'Cambridge_IGCSE', 'Cambridge_A', 'NCV', 'IB'] as Curriculum[]).map(c => {
                    const labels: Record<string, string> = { NSC: 'NSC/DBE', IEB: 'IEB', Cambridge_IGCSE: 'Cambridge IGCSE', Cambridge_A: 'Cambridge A-Level', NCV: 'NC(V)', IB: 'IB' };
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`btn btn-sm ${curriculum === c ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => {
                          setCurriculum(c);
                          setSubjects(SUBJECTS.map(s => ({ ...s, curriculum: c })));
                        }}
                      >
                        {labels[c]}
                      </button>
                    );
                  })}
                </div>
                {curriculum !== 'NSC' && curriculum !== 'IEB' && (
                  <p className="caption" style={{ marginTop: '0.375rem' }}>
                    {curriculum === 'Cambridge_IGCSE' || curriculum === 'Cambridge_A'
                      ? 'Grade input: A*, A, B, C, D, E, U — converted to NSC APS equivalents.'
                      : curriculum === 'NCV'
                        ? 'NC(V) Level 4 percentage marks — converted to NSC APS equivalents.'
                        : 'IB scores 1–7 — mapped directly to NSC APS points.'}
                  </p>
                )}
              </div>

              {/* APS panel */}
              <div className="aps-panel-editorial">
                <p className="aps-panel-label">Your APS Score</p>
                <p className="aps-panel-num">{aps}</p>
                <div className="aps-panel-bar">
                  <i style={{ width: `${Math.min(100, Math.round((aps / 49) * 100))}%` }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--chalk) / 0.35)' }}>out of 49 maximum</p>
              </div>

              {/* Subject rows */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
                {subjects.map(s => {
                  const isCambridge = curriculum === 'Cambridge_IGCSE' || curriculum === 'Cambridge_A';
                  const isIB = curriculum === 'IB';
                  const pts = isCambridge
                    ? (s.grade ? cambridgeGradeToPoints(s.grade) : apsPoints(s.mark))
                    : curriculum === 'NCV'
                      ? ncvMarkToPoints(s.mark)
                      : isIB
                        ? ibScoreToPoints(s.mark)
                        : apsPoints(s.mark);
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid hsl(var(--ink) / 0.08)',
                      }}
                    >
                      <span style={{ fontSize: '0.9375rem', fontWeight: s.designated ? 600 : 400, color: 'hsl(var(--ink))' }}>
                        {s.name}
                      </span>
                      {isCambridge ? (
                        <select
                          className="auth-input"
                          style={{ width: 80 }}
                          value={s.grade ?? 'B'}
                          onChange={e => setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, grade: e.target.value } : x))}
                        >
                          {['A*','A','B','C','D','E','U'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      ) : (
                        <input
                          type="number" min={isIB ? 1 : 0} max={isIB ? 7 : 100}
                          className="auth-input"
                          style={{ width: 80, textAlign: 'center' }}
                          value={s.mark}
                          onChange={e => {
                            const raw = parseInt(e.target.value) || 0;
                            const mark = isIB ? Math.max(1, Math.min(7, raw)) : Math.max(0, Math.min(100, raw));
                            setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, mark } : x));
                          }}
                        />
                      )}
                      <span className="badge" style={{ minWidth: 28, justifyContent: 'center' }}>
                        {pts}
                      </span>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'hsl(var(--ink-light))', cursor: 'pointer', padding: '0 4px', fontSize: '1rem', lineHeight: 1 }}
                        title="Remove subject"
                        onClick={() => setSubjects(prev => prev.filter(x => x.id !== s.id))}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add subject search */}
              <div style={{ marginTop: '1rem' }}>
                <input
                  className="auth-input"
                  placeholder="Search and add a subject…"
                  value={subjectSearch}
                  onChange={e => setSubjectSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
                {subjectSearch.trim().length > 0 && (() => {
                  const q = subjectSearch.trim().toLowerCase();
                  const existing = new Set(subjects.map(s => s.id));
                  const matches = SUBJECT_CATALOG
                    .filter(s => !existing.has(s.id) && s.name.toLowerCase().includes(q))
                    .slice(0, 6);
                  if (matches.length === 0) return <p className="caption" style={{ marginTop: '0.375rem' }}>No subjects found.</p>;
                  return (
                    <div style={{ marginTop: '0.375rem', border: '1px solid hsl(var(--ink) / 0.12)', borderRadius: 8, overflow: 'hidden' }}>
                      {matches.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', background: 'hsl(var(--card))', border: 'none', borderBottom: '1px solid hsl(var(--ink) / 0.08)', cursor: 'pointer', fontSize: '0.875rem', color: 'hsl(var(--ink))' }}
                          onClick={() => {
                            setSubjects(prev => [...prev, { ...s, mark: 60, curriculum }]);
                            setSubjectSearch('');
                          }}
                        >
                          + {s.name}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <p className="caption" style={{ marginTop: '0.75rem', color: 'hsl(var(--ink-light))' }}>
                APS points shown per subject (Life Orientation excluded from total).
              </p>
            </div>
          )}

          {/* ── Step 3: Personality ────────────────────────── */}
          {step === 3 && (
            <div className="page-anim">
              <p className="kicker" style={{ marginBottom: '1rem' }}>Step 3 of 5</p>
              <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'hsl(var(--ink))', marginBottom: '0.5rem' }}>
                Who you are
              </h2>
              <p className="lede" style={{ marginBottom: '1.75rem' }}>
                Rate how much each statement describes you (1 = not at all, 5 = very much).
              </p>
              <hr className="ink-rule" style={{ marginBottom: '1.75rem' }} />

              <div className="stack-3">
                {BIG5_QUESTIONS.map(q => (
                  <div key={q.key}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'hsl(var(--ink))', lineHeight: 1.55 }}>{q.text}</p>
                    <Rating value={ratings[q.key] ?? 0} onChange={v => setRatings(r => ({ ...r, [q.key]: v }))} />
                  </div>
                ))}

                <hr className="ink-rule" />

                <div>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'hsl(var(--ink))', marginBottom: '0.375rem' }}>
                    Your interests
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--ink-light))', marginBottom: '1.25rem' }}>
                    How much do you enjoy each type of work?
                  </p>
                  <div className="stack-3">
                    {RIASEC_QUESTIONS.map(q => (
                      <div key={q.key}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'hsl(var(--ink))', lineHeight: 1.55 }}>{q.text}</p>
                        <Rating value={ratings[q.key] ?? 0} onChange={v => setRatings(r => ({ ...r, [q.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="ink-rule" />

                <div>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'hsl(var(--ink))', marginBottom: '1rem' }}>
                    Work preferences
                  </p>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="onboarding-label">Preferred work style *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {WORK_STYLES.map(s => (
                        <button
                          key={s} type="button"
                          className={`choice-pill${workStyle === s ? ' selected' : ''}`}
                          onClick={() => setWorkStyle(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="onboarding-label">Primary motivation *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {MOTIVATIONS.map(m => (
                        <button
                          key={m} type="button"
                          className={`choice-pill${motivation === m ? ' selected' : ''}`}
                          onClick={() => setMotivation(m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Capabilities ───────────────────────── */}
          {step === 4 && (
            <div className="page-anim">
              <p className="kicker" style={{ marginBottom: '1rem' }}>Step 4 of 5</p>
              <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'hsl(var(--ink))', marginBottom: '0.5rem' }}>
                Your strengths
              </h2>
              <p className="lede" style={{ marginBottom: '1.75rem' }}>
                Rate your natural strengths honestly — this shapes your career matching.
              </p>
              <hr className="ink-rule" style={{ marginBottom: '1.75rem' }} />

              <p className="kicker" style={{ marginBottom: '1.25rem' }}>Rate 1 – 5</p>
              <div className="stack-3">
                {CAP_QUESTIONS.map(q => (
                  <div key={q.key}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'hsl(var(--ink))', lineHeight: 1.55 }}>{q.text}</p>
                    <Rating value={caps[q.key] ?? 0} onChange={v => setCaps(c => ({ ...c, [q.key]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Financial ──────────────────────────── */}
          {step === 5 && (
            <div className="page-anim">
              <p className="kicker" style={{ marginBottom: '1rem' }}>Step 5 of 5</p>
              <h2 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'hsl(var(--ink))', marginBottom: '0.5rem' }}>
                Your situation
              </h2>
              <p className="lede" style={{ marginBottom: '1.75rem' }}>
                We use this to match funding options — NSFAS, bursaries, and student loans.
              </p>
              <hr className="ink-rule" style={{ marginBottom: '1.75rem' }} />

              <div className="stack-3">
                {/* Income slider — dark panel */}
                <div style={{ background: 'hsl(var(--ink))', borderRadius: 'var(--r-xl)', padding: '1.5rem 1.75rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--chalk) / 0.4)', marginBottom: '0.375rem' }}>
                    Household income
                  </p>
                  <p style={{ fontWeight: 900, fontSize: '2.25rem', letterSpacing: '-0.04em', color: 'hsl(var(--chalk))', fontVariantNumeric: 'tabular-nums', marginBottom: '1rem' }}>
                    R {income.toLocaleString('en-ZA')}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--chalk) / 0.4)' }}>/yr</span>
                  </p>
                  <input
                    type="range" min={0} max={1_200_000} step={10_000}
                    value={income}
                    onChange={e => setIncome(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'hsl(var(--amber))', marginBottom: '0.625rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--chalk) / 0.35)' }}>R 0</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--chalk) / 0.35)' }}>R 1.2M</span>
                  </div>
                </div>

                {/* Eligibility banner */}
                {income <= 350_000 ? (
                  <div className="eligibility-banner success">
                    <p className="eligibility-banner-title">✅ NSFAS eligible</p>
                    <p className="eligibility-banner-body">
                      Your household income qualifies you for NSFAS funding — up to R 87 000/yr for tuition and accommodation.
                    </p>
                  </div>
                ) : income <= 600_000 ? (
                  <div className="eligibility-banner warning">
                    <p className="eligibility-banner-title">⚡ Missing middle</p>
                    <p className="eligibility-banner-body">
                      You may not qualify for NSFAS but are eligible for DHET gap bursaries and many private bursary programmes.
                    </p>
                  </div>
                ) : (
                  <div className="eligibility-banner info">
                    <p className="eligibility-banner-title">💡 Merit bursaries available</p>
                    <p className="eligibility-banner-body">
                      You don&apos;t qualify for NSFAS, but merit-based bursaries from Allan Gray, Investec, and Sasol are accessible with your profile.
                    </p>
                  </div>
                )}

                {saveError && (
                  <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', fontWeight: 600 }}>
                    {saveError}
                  </p>
                )}

                <p className="caption" style={{ textAlign: 'center', color: 'hsl(var(--ink-light))' }}>
                  Your data is private and only used to personalise your Prospectus experience.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation bar ────────────────────────────── */}
          <div className="onboarding-nav-bar">
            {step > 1 ? (
              <button type="button" className="btn-onboarding-back" onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <button
                type="button"
                className="btn-onboarding-next"
                disabled={!canAdvance()}
                onClick={() => setStep(s => s + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn-onboarding-next"
                disabled={isPending}
                onClick={handleFinish}
              >
                {isPending ? 'Saving…' : 'Build my profile →'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
