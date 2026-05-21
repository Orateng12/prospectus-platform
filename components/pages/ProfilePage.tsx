'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Subject, PsychProfileData, CapabilityData } from '@/lib/types';
import { CAPS, SUBJECT_CATALOG } from '@/lib/data';
import { calcAPS, fmtR, apsPoints } from '@/lib/utils';
import { updateProfile } from '@/app/actions/updateProfile';
import { saveSubjectMarks } from '@/app/actions/saveSubjects';

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
];

interface ProfilePageProps {
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  userProvince?: string;
  matricYear?: number;
  subjects?: Subject[];
  householdIncome?: number;
  capabilityData?: CapabilityData | null;
  psychProfile?: PsychProfileData | null;
  emptyMode?: boolean;
  onToggleEmptyMode?: () => void;
  onSubjectsSaved?: (subjects: Subject[]) => void;
  navigate?: (r: import('@/lib/types').Route) => void;
}

export default function ProfilePage({
  userName = 'Lerato Mokoena',
  userFirstName = 'Lerato',
  userLastName = '',
  userEmail = 'lerato.mokoena@gmail.com',
  userProvince = 'Limpopo',
  matricYear,
  subjects = [],
  householdIncome = 220000,
  capabilityData,
  psychProfile,
  emptyMode = false,
  onToggleEmptyMode,
  onSubjectsSaved,
  navigate,
}: ProfilePageProps) {
  const router = useRouter();
  const [editSection, setEditSection] = useState<string | null>(null);

  // ── Personal form state ────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(userFirstName);
  const [lastName, setLastName] = useState(userLastName);
  const [province, setProvince] = useState(userProvince ?? '');
  const [matricYearStr, setMatricYearStr] = useState(String(matricYear ?? ''));
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // ── Household form state ───────────────────────────────────────────────────────
  const [incomeStr, setIncomeStr] = useState(String(householdIncome ?? ''));
  const [householdSaving, setHouseholdSaving] = useState(false);
  const [householdError, setHouseholdError] = useState<string | null>(null);

  // ── Subject edit state ─────────────────────────────────────────────────────────
  const [editSubjects, setEditSubjects] = useState<Subject[]>(() => subjects.map(s => ({ ...s })));
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = useState('');

  const displaySubjects = subjects.length > 0 ? subjects : [
    { id: 'eng', name: 'English HL', mark: 62, designated: true },
    { id: 'math', name: 'Mathematics', mark: 78, designated: true },
    { id: 'pscience', name: 'Physical Sciences', mark: 71, designated: true },
  ];
  const aps = subjects.length > 0 ? calcAPS(subjects) : 42;

  const caps = capabilityData ? [
    { l: 'Analytical', v: capabilityData.analytical_thinking },
    { l: 'Technical', v: capabilityData.technical_aptitude },
    { l: 'Social', v: capabilityData.communication_skills },
    { l: 'Creative', v: capabilityData.creative_thinking },
    { l: 'Leadership', v: capabilityData.leadership_potential },
    { l: 'Drive', v: capabilityData.entrepreneurial_drive },
  ] : CAPS.slice(0, 6);

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || userName;
  const initial = displayName.charAt(0).toUpperCase();
  const displayIncome = Number(incomeStr) || householdIncome || 0;

  // Real profile completion — 7 meaningful signals
  const completionSignals = [
    { label: 'Name',          done: !!(firstName && lastName) },
    { label: 'Province',      done: !!province },
    { label: 'Matric year',   done: !!matricYearStr },
    { label: 'Household income', done: !!householdIncome },
    { label: 'Subjects',      done: subjects.length > 0 },
    { label: 'Personality',   done: !!psychProfile },
    { label: 'Capabilities',  done: !!capabilityData },
  ];
  const completionPct = Math.round((completionSignals.filter(s => s.done).length / completionSignals.length) * 100);
  const completionOf  = `${completionSignals.filter(s => s.done).length} of ${completionSignals.length} sections`;
  const missingSignal = completionSignals.find(s => !s.done);

  // AI confidence tier based on data completeness
  const aiConfidence = completionPct >= 85 ? 'High' : completionPct >= 57 ? 'Medium' : 'Low';
  const dataSources  = completionSignals.filter(s => s.done).length + 4; // +4 for APS, subjects count, programmes, careers

  // RIASEC dominant type for display
  const dominantRiasec = psychProfile
    ? Object.entries({
        Realistic: psychProfile.realistic ?? 0,
        Investigative: psychProfile.investigative ?? 0,
        Artistic: psychProfile.artistic ?? 0,
        Social: psychProfile.social ?? 0,
        Enterprising: psychProfile.enterprising ?? 0,
        Conventional: psychProfile.conventional ?? 0,
      }).sort((a, b) => b[1] - a[1])[0]
    : null;

  async function savePersonal() {
    setPersonalSaving(true);
    setPersonalError(null);
    const parsedYear = matricYearStr ? parseInt(matricYearStr, 10) : undefined;
    const result = await updateProfile({ firstName, lastName, province, matricYear: parsedYear });
    setPersonalSaving(false);
    if ('error' in result) {
      setPersonalError(result.error);
    } else {
      setEditSection(null);
      router.refresh();
    }
  }

  async function saveHousehold() {
    const income = parseInt(incomeStr, 10);
    if (isNaN(income) || income < 0) {
      setHouseholdError('Please enter a valid income amount.');
      return;
    }
    setHouseholdSaving(true);
    setHouseholdError(null);
    const result = await updateProfile({ householdIncome: income });
    setHouseholdSaving(false);
    if ('error' in result) {
      setHouseholdError(result.error);
    } else {
      setEditSection(null);
      router.refresh();
    }
  }

  async function saveSubjects() {
    setSubjectSaving(true);
    setSubjectError(null);
    const result = await saveSubjectMarks(editSubjects);
    setSubjectSaving(false);
    if ('error' in result) {
      setSubjectError(result.error);
    } else {
      setEditSection(null);
      onSubjectsSaved?.(editSubjects);
    }
  }

  function enterEdit(id: string) {
    if (id === 'academic') {
      setEditSubjects((subjects.length > 0 ? subjects : displaySubjects).map(s => ({ ...s })));
    }
    setEditSection(prev => prev === id ? null : id);
  }

  function Section({
    id,
    title,
    children,
    onSave,
    saving,
    saveError,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
    onSave?: () => void;
    saving?: boolean;
    saveError?: string | null;
  }) {
    const isEditing = editSection === id;
    return (
      <div className="card">
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <h3 className="subheading">{title}</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => isEditing ? setEditSection(null) : enterEdit(id)}
            disabled={saving}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {children}
        {isEditing && onSave && (
          <div style={{ marginTop: '1rem' }}>
            {saveError && (
              <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                {saveError}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-anim">
      {emptyMode && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'hsl(var(--warning) / 0.12)',
          border: '1px solid hsl(var(--warning) / 0.4)',
          borderRadius: 8,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          <span style={{ fontSize: '1rem' }}>⚠</span>
          <span>You&apos;re viewing in new student mode — your real data is preserved.</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onToggleEmptyMode}>Exit preview</button>
        </div>
      )}
      <div className="page-head">
        <div className="breadcrumb">Self · Profile</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Your account</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Profile</h2>
          </div>
          <span className="badge brand" style={{ height: '1.75rem', fontSize: '0.8125rem' }}>PRO</span>
        </div>
      </div>

      {/* Hero */}
      <div className="card profile-hero" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.625rem', background: 'hsl(var(--primary))', flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="heading" style={{ fontSize: '1.375rem' }}>{displayName}</div>
          <div className="caption" style={{ marginTop: '0.25rem' }}>{userEmail}</div>
          <div className="row" style={{ marginTop: '0.5rem', gap: '0.375rem' }}>
            <span className="badge">{province || userProvince}</span>
            <span className="badge success">APS {aps}</span>
            <span className="badge brand">PRO</span>
          </div>
        </div>
        <button className="btn btn-outline">Change photo</button>
      </div>

      {/* KPI row */}
      <div className="grid-4 stack-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { l: 'Profile complete', v: `${completionPct}%`, h: completionPct < 100 ? `Next: ${missingSignal?.label ?? 'all done'}` : 'All sections complete', c: completionPct >= 85 ? 'success' : 'warning' },
          { l: 'Current APS',     v: String(aps),          h: aps >= 40 ? 'Strong academic profile' : aps >= 32 ? 'Competitive range' : 'Use simulator to improve', c: aps >= 36 ? 'success' : '' },
          { l: 'Capability index',v: String(capabilityData ? Math.round([capabilityData.analytical_thinking, capabilityData.technical_aptitude, capabilityData.communication_skills, capabilityData.creative_thinking, capabilityData.leadership_potential, capabilityData.entrepreneurial_drive].reduce((a, b) => a + b, 0) / 6) : 0), h: capabilityData ? 'from assessment' : 'Complete assessment to unlock', c: capabilityData ? 'success' : '' },
          { l: 'AI confidence',   v: aiConfidence,         h: `${dataSources} data sources active`, c: aiConfidence === 'High' ? 'success' : '' },
        ].map(({ l, v, h, c }) => (
          <div className="card kpi" key={l}>
            <div className="lbl">{l}</div>
            <div className="val" style={c ? { color: `hsl(var(--${c}))` } : {}}>{v}</div>
            <div className="hint">{h}</div>
          </div>
        ))}
      </div>

      {/* Completion guide — show when not 100% */}
      {completionPct < 100 && !emptyMode && (
        <div className="card" style={{ marginBottom: '1.25rem', borderColor: 'hsl(var(--warning) / 0.4)', background: 'hsl(var(--warning) / 0.03)' }}>
          <div className="row-between" style={{ marginBottom: '0.875rem' }}>
            <div>
              <div className="eyebrow"><span className="dot" />Complete your profile</div>
              <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                {completionPct}% complete · {completionSignals.filter(s => !s.done).length} step{completionSignals.filter(s => !s.done).length !== 1 ? 's' : ''} remaining
              </h3>
            </div>
            <div style={{ width: 72, height: 72, position: 'relative', flexShrink: 0 }}>
              <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                <circle cx="36" cy="36" r="28" fill="none"
                  stroke={completionPct >= 85 ? 'hsl(var(--success))' : 'hsl(var(--warning))'}
                  strokeWidth="6"
                  strokeDasharray={`${(completionPct / 100) * 175.9} 175.9`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                {completionPct}%
              </div>
            </div>
          </div>
          <div className="stack-2">
            {completionSignals.filter(s => !s.done).map(sig => {
              let action: (() => void) | null = null;
              let actionLabel = '';
              let actionNote = '';
              if (sig.label === 'Name' || sig.label === 'Province' || sig.label === 'Matric year') {
                action = () => enterEdit('personal');
                actionLabel = 'Fill in →';
                actionNote = 'Needed for province-specific bursary matching';
              } else if (sig.label === 'Household income') {
                action = () => enterEdit('household');
                actionLabel = 'Add income →';
                actionNote = 'Required to determine NSFAS eligibility';
              } else if (sig.label === 'Subjects') {
                action = () => enterEdit('academic');
                actionLabel = 'Add subjects →';
                actionNote = 'Your marks calculate your APS score';
              } else if (sig.label === 'Personality' || sig.label === 'Capabilities') {
                action = () => router.push('/onboarding?retake=true');
                actionLabel = 'Take assessment →';
                actionNote = 'Unlocks career match scores and gap analysis';
              }
              return (
                <div key={sig.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5625rem 0.875rem', background: 'hsl(var(--muted) / 0.4)', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: 'hsl(var(--warning))', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sig.label}</div>
                    {actionNote && <div className="caption" style={{ fontSize: '0.6875rem', marginTop: 1 }}>{actionNote}</div>}
                  </div>
                  {action && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={action}
                      style={{ flexShrink: 0 }}
                    >
                      {actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid-2 stack-3">
        {/* Personal */}
        <Section
          id="personal"
          title="Personal"
          onSave={savePersonal}
          saving={personalSaving}
          saveError={personalError}
        >
          <div className="stack-2">
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem' }}>First name</div>
              {editSection === 'personal' ? (
                <input
                  className="input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              ) : (
                <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{firstName || '—'}</div>
              )}
            </div>
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem' }}>Last name</div>
              {editSection === 'personal' ? (
                <input
                  className="input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              ) : (
                <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{lastName || '—'}</div>
              )}
            </div>
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem' }}>Email</div>
              <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{userEmail || '—'}</div>
            </div>
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem' }}>Matric year</div>
              {editSection === 'personal' ? (
                <input
                  className="input"
                  type="number"
                  min={2000}
                  max={2030}
                  value={matricYearStr}
                  onChange={e => setMatricYearStr(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              ) : (
                <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{matricYearStr || '—'}</div>
              )}
            </div>
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem' }}>Province</div>
              {editSection === 'personal' ? (
                <select
                  className="input"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  <option value="">Select province</option>
                  {SA_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{province || '—'}</div>
              )}
            </div>
          </div>
        </Section>

        {/* Household */}
        <Section
          id="household"
          title="Household"
          onSave={saveHousehold}
          saving={householdSaving}
          saveError={householdError}
        >
          <div className="stack-2">
            <div>
              <div className="caption" style={{ fontSize: '0.6875rem' }}>Annual household income</div>
              {editSection === 'household' ? (
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={incomeStr}
                  onChange={e => setIncomeStr(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              ) : (
                <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{fmtR(displayIncome)}</div>
              )}
            </div>
            {(() => {
              const inc = displayIncome;
              const nsfas   = inc <= 350_000;
              const provBur = inc <= 400_000;
              const corpBur = inc <= 600_000;
              const tiers: Array<{ label: string; eligible: boolean; note: string }> = [
                { label: 'NSFAS (govt bursary)', eligible: nsfas,   note: nsfas   ? 'Up to R100k/yr · covers fees + living' : 'Threshold: R350k/yr household' },
                { label: 'Provincial bursaries', eligible: provBur, note: provBur  ? 'Gauteng, WC, KZN, LP bursaries open' : 'Most close above R400k income' },
                { label: 'Corporate bursaries',  eligible: corpBur, note: corpBur  ? 'Merit-based · income gates are soft' : 'Most corporates have no income cap' },
                { label: 'Merit scholarships',   eligible: true,    note: 'Allan Gray, Investec, NRF — open to all' },
              ];
              return (
                <div>
                  <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.5rem' }}>Funding eligibility by tier</div>
                  <div className="stack" style={{ gap: '0.375rem' }}>
                    {tiers.map(t => (
                      <div key={t.label} className="row" style={{ gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span className={`badge ${t.eligible ? 'success' : 'accent'}`} style={{ fontSize: '0.5rem', flexShrink: 0, marginTop: 2 }}>
                          {t.eligible ? '✓' : '✗'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{t.label}</div>
                          <div className="caption" style={{ fontSize: '0.6875rem' }}>{t.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </Section>

        {/* Academic */}
        <Section
          id="academic"
          title="Academic record"
          onSave={saveSubjects}
          saving={subjectSaving}
          saveError={subjectError}
        >
          <div className="row-between" style={{ marginBottom: '0.625rem' }}>
            <span className="caption">APS Score</span>
            <span style={{ fontWeight: 800, fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
              {editSection === 'academic' ? calcAPS(editSubjects) : aps}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 56px 48px 72px auto', gap: 0, border: '1px solid hsl(var(--border))', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            {['Subject', 'Mark', 'APS', 'Trend', ''].map(h => (
              <div key={h} style={{ padding: '0.5rem 0.75rem', background: 'hsl(var(--muted))', fontWeight: 700, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(var(--muted-fg))' }}>{h}</div>
            ))}
            {(editSection === 'academic' ? editSubjects : displaySubjects).map(s => {
              const pts = apsPoints(s.mark);
              const trend = s.mark >= 70 ? 'success' : s.mark >= 60 ? 'warning' : 'destructive';
              const trendLabel = s.mark >= 70 ? '▲ up' : s.mark >= 60 ? '→ flat' : '▼ down';
              return [
                <div key={`${s.id}-name`} style={{ padding: '0.5625rem 0.75rem', borderTop: '1px solid hsl(var(--border))', fontWeight: 600, fontSize: '0.8125rem' }}>
                  {s.name}{!s.designated && <span className="caption"> · LO</span>}
                </div>,
                <div key={`${s.id}-mark`} style={{ padding: '0.5625rem 0.75rem', borderTop: '1px solid hsl(var(--border))', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                  {editSection === 'academic' ? (
                    <input
                      type="number" min={0} max={100}
                      className="input"
                      value={editSubjects.find(e => e.id === s.id)?.mark ?? s.mark}
                      onChange={ev => {
                        const mark = Math.min(100, Math.max(0, parseInt(ev.target.value, 10) || 0));
                        setEditSubjects(prev => prev.map(sub => sub.id === s.id ? { ...sub, mark } : sub));
                      }}
                      style={{ width: '3.25rem', textAlign: 'right', fontWeight: 700, padding: '0.25rem 0.375rem' }}
                    />
                  ) : (
                    `${s.mark}%`
                  )}
                </div>,
                <div key={`${s.id}-pts`} style={{ padding: '0.5625rem 0.75rem', borderTop: '1px solid hsl(var(--border))', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--muted-fg))' }}>
                  {s.designated ? pts : '—'}
                </div>,
                <div key={`${s.id}-trend`} style={{ padding: '0.5625rem 0.75rem', borderTop: '1px solid hsl(var(--border))' }}>
                  <span className={`badge ${trend}`} style={{ fontSize: '0.5625rem' }}>{trendLabel}</span>
                </div>,
                <div key={`${s.id}-rm`} style={{ padding: '0.5625rem 0.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                  {editSection === 'academic' && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-fg))', fontSize: '0.875rem', lineHeight: 1, padding: '0 2px' }}
                      title="Remove subject"
                      onClick={() => setEditSubjects(prev => prev.filter(x => x.id !== s.id))}
                    >
                      ✕
                    </button>
                  )}
                </div>,
              ];
            })}
          </div>
          {editSection === 'academic' && (
            <div style={{ marginTop: '0.75rem' }}>
              <input
                className="input"
                placeholder="Search and add a subject…"
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
                style={{ width: '100%' }}
              />
              {subjectSearch.trim().length > 0 && (() => {
                const q = subjectSearch.trim().toLowerCase();
                const existing = new Set(editSubjects.map(s => s.id));
                const matches = SUBJECT_CATALOG
                  .filter(s => !existing.has(s.id) && s.name.toLowerCase().includes(q))
                  .slice(0, 5);
                if (matches.length === 0) return <p className="caption" style={{ marginTop: '0.25rem' }}>No subjects found.</p>;
                return (
                  <div style={{ marginTop: '0.25rem', border: '1px solid hsl(var(--border))', borderRadius: 6, overflow: 'hidden' }}>
                    {matches.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: 'hsl(var(--card))', border: 'none', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', fontSize: '0.875rem' }}
                        onClick={() => {
                          setEditSubjects(prev => [...prev, { ...s, mark: 60 }]);
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
          )}
        </Section>

      </div>

      {/* Personality & Capability snapshot */}
      {!emptyMode && (
        <div className="grid-2 stack-3" style={{ marginTop: '1.25rem' }}>
          {/* Personality panel — real data when available, prompt when not */}
          <div className="card stack-3">
            <div className="eyebrow"><span className="dot" />Personality profile</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
              {psychProfile ? 'Your RIASEC + motivation' : 'Complete assessment to unlock'}
            </h3>
            {psychProfile ? (
              <>
                <div className="stack-2" style={{ marginTop: '0.625rem' }}>
                  {(Object.entries({
                    Realistic: psychProfile.realistic ?? 0,
                    Investigative: psychProfile.investigative ?? 0,
                    Artistic: psychProfile.artistic ?? 0,
                    Social: psychProfile.social ?? 0,
                    Enterprising: psychProfile.enterprising ?? 0,
                    Conventional: psychProfile.conventional ?? 0,
                  }) as [string, number][])
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, score]) => (
                      <div key={type} className="progress-row">
                        <span className="label">{type}</span>
                        <div className={`meter ${score >= 80 ? 'success' : score >= 60 ? 'primary' : 'accent'}`}>
                          <i style={{ width: `${score}%` }} />
                        </div>
                        <span className="val">{score}</span>
                      </div>
                    ))}
                </div>
                {dominantRiasec && (
                  <div className="caption" style={{ marginTop: '0.625rem' }}>
                    Dominant type: <strong>{dominantRiasec[0]}</strong> ({dominantRiasec[1]}/100)
                    {psychProfile.primary_motivation ? ` · Motivation: ${psychProfile.primary_motivation}` : ''}
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: '0.625rem' }}>
                <p className="body-text" style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-fg))' }}>
                  Your Big Five and RIASEC profile unlocks personalised career matching, capability gap analysis, and Intelligence scoring.
                </p>
                <div className="row" style={{ marginTop: '0.75rem' }}>
                  <span className="badge warning">Assessment incomplete</span>
                </div>
              </div>
            )}
          </div>

          {/* Capability snapshot */}
          <div className="card stack-3">
            <div className="eyebrow"><span className="dot" />Capability snapshot</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
              {capabilityData ? 'Your 6 dimensions' : 'Assessment not yet taken'}
            </h3>
            {capabilityData ? (
              <div className="stack" style={{ marginTop: '0.75rem' }}>
                {caps.map(c => (
                  <div key={c.l} className="progress-row">
                    <span className="label">{c.l}</span>
                    <div className={`meter ${c.v >= 80 ? 'success' : c.v >= 65 ? 'primary' : 'accent'}`}>
                      <i style={{ width: `${c.v}%` }} />
                    </div>
                    <span className="val">{c.v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '0.625rem' }}>
                <p className="body-text" style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-fg))' }}>
                  The capability assessment measures 8 dimensions: analytical, technical, communication, creative, leadership, entrepreneurial, perseverance, and risk tolerance.
                </p>
                <div className="row" style={{ marginTop: '0.75rem' }}>
                  <span className="badge warning">Capability index: not assessed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <div>
            <div className="eyebrow"><span className="dot" />Activity</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Recent on Prospectus</h3>
          </div>
        </div>
        {emptyMode ? (
          <div className="grid-3">
            {[
              { l: 'Applications', v: '0', sub: 'No applications yet' },
              { l: 'Scholarships saved', v: '0', sub: 'None saved yet' },
              { l: 'Programmes saved', v: '0', sub: 'None saved yet' },
            ].map(s => (
              <div key={s.l} className="card compact" style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginTop: '0.25rem' }}>{s.l}</div>
                <div className="caption" style={{ marginTop: '0.125rem', fontSize: '0.6875rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stack">
            {((): Array<[string, string]> => {
              const items: Array<[string, string]> = [];
              if (subjects.length > 0)     items.push(['Profile data', `${subjects.length} subjects tracked · APS ${aps}`]);
              if (psychProfile)            items.push(['Assessment', 'Personality profile complete · RIASEC + Big Five']);
              if (capabilityData)          items.push(['Assessment', `Capability assessment complete · index ${Math.round([capabilityData.analytical_thinking, capabilityData.technical_aptitude, capabilityData.communication_skills, capabilityData.creative_thinking, capabilityData.leadership_potential, capabilityData.entrepreneurial_drive].reduce((a, b) => a + b, 0) / 6)}/100`]);
              if (householdIncome)         items.push(['Household', `Income: ${fmtR(householdIncome)}/yr · ${householdIncome <= 350_000 ? 'NSFAS eligible' : 'Bursary strategy'}`]);
              if (province)                items.push(['Location', `Province: ${province}`]);
              if (items.length === 0)      items.push(['Getting started', 'Add your subjects and complete the assessment to unlock personalised insights']);
              return items.slice(0, 5);
            })().map(([d, t], i) => (
              <div key={i} className="row-between" style={{ padding: '0.625rem 0', borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                <span>{t}</span>
                <span className="caption" style={{ whiteSpace: 'nowrap', marginLeft: '1rem', color: 'hsl(var(--success))' }}>✓ {d}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview mode toggle */}
      {onToggleEmptyMode && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="row-between">
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.375rem' }}><span className="dot" />Preview mode</div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>New student view</div>
              <p className="body-text" style={{ marginTop: '0.375rem', fontSize: '0.875rem', maxWidth: '36rem' }}>
                Preview exactly what a brand-new student sees — empty lists, default APS, no profile data.
                Your real data is preserved while this is active.
              </p>
            </div>
            <button
              className={`btn btn-sm ${emptyMode ? 'btn-primary' : 'btn-outline'}`}
              onClick={onToggleEmptyMode}
              style={{ flexShrink: 0 }}
            >
              {emptyMode ? 'Exit preview' : 'Enable preview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
