'use client';

import { useState, useTransition } from 'react';
import { SUBJECTS } from '@/lib/data';
import { calcAPS, apsPoints } from '@/lib/utils';
import { saveOnboarding } from '@/app/actions/saveOnboarding';
import type { Subject, OnboardingData } from '@/lib/types';

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

// Rating component: 1–5 scale
function Rating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: '2px solid',
            borderColor: value === n ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            background: value === n ? 'hsl(var(--primary))' : 'hsl(var(--card))',
            color: value === n ? '#fff' : 'hsl(var(--muted-fg))',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            transition: 'all 150ms',
          }}
        >
          {n}
        </button>
      ))}
      <span style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'hsl(var(--muted-fg))', marginLeft: '0.25rem' }}>
        {value === 1 ? 'Not at all' : value === 2 ? 'A little' : value === 3 ? 'Somewhat' : value === 4 ? 'Quite a bit' : value === 5 ? 'Very much' : ''}
      </span>
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

  // Step 2 — Subjects
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS.map(s => ({ ...s })));

  // Step 3 — Personality
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [workStyle, setWorkStyle] = useState('');
  const [motivation, setMotivation] = useState('');

  // Step 4 — Capabilities
  const [caps, setCaps] = useState<Record<string, number>>({});

  // Step 5 — Financial
  const [income, setIncome] = useState(250_000);

  const aps = calcAPS(subjects);
  const totalSteps = 5;
  const progress = ((step - 1) / totalSteps) * 100;

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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'hsl(var(--muted) / 0.4)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Prospectus<span style={{ color: 'hsl(var(--accent))' }}>.</span>
          </span>
          <p className="caption" style={{ marginTop: '0.25rem' }}>Let&apos;s build your profile — takes about 5 minutes</p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="row-between" style={{ marginBottom: '0.375rem' }}>
            <span className="caption">Step {step} of {totalSteps}</span>
            <span className="caption">{Math.round(progress)}% complete</span>
          </div>
          <div className="meter" style={{ height: 6 }}>
            <i style={{ width: `${progress}%`, background: 'hsl(var(--primary))` ' }} />
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>

          {/* ── Step 1: About you ──────────────────────────── */}
          {step === 1 && (
            <div className="page-anim">
              <p className="eyebrow" style={{ marginBottom: '0.375rem' }}>Step 1 of 5</p>
              <h2 className="heading" style={{ marginBottom: '0.25rem' }}>About you</h2>
              <p className="body-text" style={{ marginBottom: '1.5rem' }}>This helps us personalise your programme and funding matches.</p>

              <div className="stack-3">
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  <div>
                    <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>First name *</label>
                    <input className="input" style={{ width: '100%' }} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Tumelo" />
                  </div>
                  <div>
                    <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>Last name</label>
                    <input className="input" style={{ width: '100%' }} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Tata" />
                  </div>
                </div>

                <div>
                  <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>Province *</label>
                  <select className="input" style={{ width: '100%' }} value={province} onChange={e => setProvince(e.target.value)}>
                    <option value="">Select your province…</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="caption" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>Matric year</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {MATRIC_YEARS.map(y => (
                      <button
                        key={y} type="button"
                        className={matricYear === y ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                        onClick={() => setMatricYear(y)}
                      >{y}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Subjects ───────────────────────────── */}
          {step === 2 && (
            <div className="page-anim">
              <p className="eyebrow" style={{ marginBottom: '0.375rem' }}>Step 2 of 5</p>
              <h2 className="heading" style={{ marginBottom: '0.25rem' }}>Your subject marks</h2>
              <p className="body-text" style={{ marginBottom: '1.5rem' }}>Enter your final (or expected) marks. Your APS updates in real time.</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.875rem 1rem', background: 'hsl(var(--muted))', borderRadius: 'var(--r-lg)' }}>
                <div>
                  <p className="caption">Your APS</p>
                  <p className="stat-num" style={{ fontSize: '2rem' }}>{aps}</p>
                </div>
                <div className="meter" style={{ flex: 1 }}>
                  <i style={{ width: `${Math.min(100, Math.round((aps / 49) * 100))}%`, background: 'hsl(var(--primary))' }} />
                </div>
                <span className="caption">/49</span>
              </div>

              <div className="stack-2">
                {subjects.map(s => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="body-text" style={{ fontWeight: s.designated ? 600 : 400 }}>{s.name}</span>
                    <input
                      type="number" min={0} max={100}
                      className="input" style={{ width: 72, textAlign: 'center' }}
                      value={s.mark}
                      onChange={e => {
                        const mark = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                        setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, mark } : x));
                      }}
                    />
                    <span className="badge" style={{ minWidth: 28, justifyContent: 'center' }}>{apsPoints(s.mark)}</span>
                  </div>
                ))}
              </div>
              <p className="caption" style={{ marginTop: '0.75rem' }}>APS points shown per subject (Life Orientation excluded from total).</p>
            </div>
          )}

          {/* ── Step 3: Personality ────────────────────────── */}
          {step === 3 && (
            <div className="page-anim">
              <p className="eyebrow" style={{ marginBottom: '0.375rem' }}>Step 3 of 5</p>
              <h2 className="heading" style={{ marginBottom: '0.25rem' }}>Who you are</h2>
              <p className="body-text" style={{ marginBottom: '1.5rem' }}>Rate how much each statement describes you (1 = not at all, 5 = very much).</p>

              <div className="stack-3">
                {BIG5_QUESTIONS.map(q => (
                  <div key={q.key}>
                    <p className="body-text" style={{ fontWeight: 500 }}>{q.text}</p>
                    <Rating value={ratings[q.key] ?? 0} onChange={v => setRatings(r => ({ ...r, [q.key]: v }))} />
                  </div>
                ))}

                <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1.25rem' }}>
                  <p className="subheading" style={{ marginBottom: '0.75rem' }}>Your interests</p>
                  <p className="body-text" style={{ marginBottom: '1rem' }}>How much do you enjoy each type of work?</p>
                  {RIASEC_QUESTIONS.map(q => (
                    <div key={q.key} style={{ marginBottom: '1rem' }}>
                      <p className="body-text" style={{ fontWeight: 500 }}>{q.text}</p>
                      <Rating value={ratings[q.key] ?? 0} onChange={v => setRatings(r => ({ ...r, [q.key]: v }))} />
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1.25rem' }}>
                  <p className="subheading" style={{ marginBottom: '0.75rem' }}>Work preferences</p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="caption" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Preferred work style *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {WORK_STYLES.map(s => (
                        <button key={s} type="button" className={workStyle === s ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setWorkStyle(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="caption" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Primary motivation *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {MOTIVATIONS.map(m => (
                        <button key={m} type="button" className={motivation === m ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setMotivation(m)}>{m}</button>
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
              <p className="eyebrow" style={{ marginBottom: '0.375rem' }}>Step 4 of 5</p>
              <h2 className="heading" style={{ marginBottom: '0.25rem' }}>Your strengths</h2>
              <p className="body-text" style={{ marginBottom: '1.5rem' }}>Rate your natural strengths honestly — this shapes your career matching.</p>

              <div className="stack-3">
                {CAP_QUESTIONS.map(q => (
                  <div key={q.key}>
                    <p className="body-text" style={{ fontWeight: 500 }}>{q.text}</p>
                    <Rating value={caps[q.key] ?? 0} onChange={v => setCaps(c => ({ ...c, [q.key]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Financial ──────────────────────────── */}
          {step === 5 && (
            <div className="page-anim">
              <p className="eyebrow" style={{ marginBottom: '0.375rem' }}>Step 5 of 5</p>
              <h2 className="heading" style={{ marginBottom: '0.25rem' }}>Your situation</h2>
              <p className="body-text" style={{ marginBottom: '1.5rem' }}>We use this to match funding options — NSFAS, bursaries, and student loans.</p>

              <div className="stack-3">
                <div style={{ padding: '1.25rem', background: 'hsl(var(--muted))', borderRadius: 'var(--r-lg)' }}>
                  <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                    <p className="subheading">Household income</p>
                    <span className="stat-num" style={{ fontSize: '1.25rem' }}>R {income.toLocaleString('en-ZA')}/yr</span>
                  </div>
                  <input
                    type="range" min={0} max={1_200_000} step={10_000}
                    value={income}
                    onChange={e => setIncome(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'hsl(var(--primary))' }}
                  />
                  <div className="row-between">
                    <span className="caption">R 0</span>
                    <span className="caption">R 1.2M</span>
                  </div>
                </div>

                <div>
                  {income <= 350_000 ? (
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'hsl(var(--success) / 0.1)', border: '1px solid hsl(var(--success) / 0.3)', borderRadius: 'var(--r-lg)' }}>
                      <span style={{ fontSize: '1.25rem' }}>✅</span>
                      <div>
                        <p className="subheading" style={{ color: 'hsl(var(--success))' }}>NSFAS eligible</p>
                        <p className="body-text">Your household income qualifies you for NSFAS funding — up to R 87 000/yr for tuition and accommodation.</p>
                      </div>
                    </div>
                  ) : income <= 600_000 ? (
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'hsl(var(--warning) / 0.1)', border: '1px solid hsl(var(--warning) / 0.3)', borderRadius: 'var(--r-lg)' }}>
                      <span style={{ fontSize: '1.25rem' }}>⚡</span>
                      <div>
                        <p className="subheading" style={{ color: 'hsl(var(--warning))' }}>Missing middle</p>
                        <p className="body-text">You may not qualify for NSFAS but are eligible for DHET gap bursaries and many private bursary programmes.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'hsl(var(--info) / 0.1)', border: '1px solid hsl(var(--info) / 0.3)', borderRadius: 'var(--r-lg)' }}>
                      <span style={{ fontSize: '1.25rem' }}>💡</span>
                      <div>
                        <p className="subheading" style={{ color: 'hsl(var(--info))' }}>Merit bursaries available</p>
                        <p className="body-text">You don&apos;t qualify for NSFAS, but merit-based bursaries from Allan Gray, Investec, and Sasol are accessible with your profile.</p>
                      </div>
                    </div>
                  )}
                </div>

                {saveError && (
                  <p className="body-text" style={{ color: 'hsl(var(--destructive))' }}>{saveError}</p>
                )}

                <p className="caption" style={{ textAlign: 'center' }}>
                  Your data is private and only used to personalise your Prospectus experience.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation ────────────────────────────────── */}
          <div className="row-between" style={{ marginTop: '2rem' }}>
            {step > 1 ? (
              <button type="button" className="btn btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <button
                type="button"
                className="btn btn-brand"
                disabled={!canAdvance()}
                onClick={() => setStep(s => s + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-brand btn-lg"
                disabled={isPending}
                onClick={handleFinish}
              >
                {isPending ? 'Saving…' : 'Build my profile →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
