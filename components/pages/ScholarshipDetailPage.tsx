'use client';

import type { Scholarship, FundingOpportunity, Route } from '@/lib/types';
import { fmtR } from '@/lib/utils';

interface ScholarshipDetailPageProps {
  scholarship: Scholarship | FundingOpportunity | null;
  userAps?: number;
  householdIncome?: number;
  userProvince?: string;
  userName?: string;
  navigate: (r: Route) => void;
}

interface Criterion {
  label: string;
  met: boolean | null; // null = unknown
}

function parseCriteria(eligibility: string, userAps?: number, householdIncome?: number): Criterion[] {
  const criteria: Criterion[] = [];
  const lower = eligibility.toLowerCase();

  // APS requirement
  const apsMatch = eligibility.match(/APS\s*[≥>=]+\s*(\d+)/);
  if (apsMatch) {
    const required = parseInt(apsMatch[1]);
    criteria.push({
      label: `APS ≥ ${required}`,
      met: userAps !== undefined ? userAps >= required : null,
    });
  }

  // Financial need
  if (lower.includes('financial need')) {
    criteria.push({
      label: 'Financial need (household income ≤ R 350k)',
      met: householdIncome !== undefined ? householdIncome <= 350000 : null,
    });
  }

  // Subject requirements (Maths)
  if (lower.includes('maths') || lower.includes('mathematics')) {
    const mathMatch = eligibility.match(/[Mm]aths?\s*[≥>=]+\s*(\d+)/);
    const required = mathMatch ? parseInt(mathMatch[1]) : 60;
    criteria.push({
      label: `Mathematics ≥ ${required}%`,
      met: userAps !== undefined ? userAps >= 34 : null, // rough proxy
    });
  }

  // Programme/field requirement (BSc, BCom, etc.)
  const progMatch = eligibility.match(/\b(BSc|BCom|BEng|BA|BEd|LLB|BPharm)\b/g);
  if (progMatch) {
    criteria.push({
      label: `Programme: ${progMatch.slice(0, 3).join(' / ')}`,
      met: null,
    });
  }

  // RIASEC/personality (entrepreneurial)
  if (lower.includes('entrepreneur') || lower.includes('leader')) {
    criteria.push({
      label: 'Entrepreneurial/leadership pitch required',
      met: null,
    });
  }

  // SA citizen
  criteria.push({ label: 'South African citizen', met: null });

  return criteria;
}

function addWeeks(dateStr: string, weeks: number): string {
  // Try to parse deadline as "DD Mon YYYY" or "DD Mon"
  const parts = dateStr.split(' ');
  if (parts.length >= 2) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = parseInt(parts[0]);
    const monthIdx = months.findIndex(m => parts[1]?.startsWith(m));
    if (!isNaN(day) && monthIdx >= 0) {
      const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
      const d = new Date(year, monthIdx, day);
      d.setDate(d.getDate() - weeks * 7);
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
  }
  return dateStr;
}

export default function ScholarshipDetailPage({ scholarship, userAps, householdIncome, userProvince, userName, navigate }: ScholarshipDetailPageProps) {
  if (!scholarship) {
    return (
      <div className="page-anim">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="subheading" style={{ marginBottom: '0.75rem' }}>No scholarship selected</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('scholarships')}>← Back to scholarships</button>
        </div>
      </div>
    );
  }

  const fo = scholarship as FundingOpportunity;
  const applicationUrl = fo.application_url ?? null;
  const isServiceContract = fo.service_contract ?? false;
  const isDisabilitySpecific = fo.disability_specific ?? false;
  const studyFields = fo.study_fields ?? [];
  const lastVerified = fo.last_verified_at ?? null;

  const criteria = parseCriteria(scholarship.eligibility, userAps, householdIncome);
  const metCount = criteria.filter(c => c.met === true).length;
  const totalKnown = criteria.filter(c => c.met !== null).length;

  const keyDates = [
    { label: 'Prepare documents', date: addWeeks(scholarship.deadline, 4) },
    { label: 'Submit application', date: addWeeks(scholarship.deadline, 2) },
    { label: 'Application closes', date: scholarship.deadline },
  ];

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Fund · Scholarships · Detail</div>
        <div className="row-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '0.5rem', padding: 0, fontSize: '0.8125rem' }}
              onClick={() => navigate('scholarships')}
            >
              ← Back to scholarships
            </button>
            <div className="eyebrow"><span className="dot" />Scholarship detail</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{scholarship.name}</h2>
            <div className="caption" style={{ marginTop: '0.25rem' }}>{scholarship.eligibility}</div>
            <div className="row" style={{ marginTop: '0.5rem', gap: '0.375rem', flexWrap: 'wrap' }}>
              {isServiceContract && <span className="badge warning">Service contract required</span>}
              {isDisabilitySpecific && <span className="badge info">Disability-specific</span>}
              {studyFields.map(f => <span key={f} className="badge" style={{ fontSize: '0.65rem' }}>{f}</span>)}
              {lastVerified && <span className="badge" style={{ fontSize: '0.65rem' }}>Verified {new Date(lastVerified).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>
          <div className="row" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
            <div className="card compact" style={{ textAlign: 'center', padding: '0.5rem 0.875rem' }}>
              <div style={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.04em', color: 'hsl(var(--success))' }}>{fmtR(scholarship.amount)}</div>
              <div className="caption" style={{ fontSize: '0.625rem' }}>per year</div>
            </div>
            <div className={`match-circle${scholarship.match < 80 ? ' med' : ''}`} style={{ width: 56, height: 56, fontSize: '1.25rem' }}>
              {scholarship.match}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Left: eligibility + form preview */}
        <div className="stack-3">
          {/* Eligibility breakdown */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Eligibility breakdown</div>
            {totalKnown > 0 && (
              <div className="caption" style={{ marginBottom: '0.75rem' }}>
                {metCount}/{totalKnown} criteria verified from your profile
              </div>
            )}
            <div className="stack-2">
              {criteria.map((c, i) => (
                <div key={i} className="row" style={{ gap: '0.75rem' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                    background: c.met === true ? 'hsl(var(--success) / 0.15)' : c.met === false ? 'hsl(var(--destructive) / 0.15)' : 'hsl(var(--fg) / 0.08)',
                    border: `1.5px solid hsl(var(--${c.met === true ? 'success' : c.met === false ? 'destructive' : 'border'}))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', fontWeight: 800,
                    color: c.met === true ? 'hsl(var(--success))' : c.met === false ? 'hsl(var(--destructive))' : 'hsl(var(--fg-muted))',
                  }}>
                    {c.met === true ? '✓' : c.met === false ? '✗' : '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{c.label}</div>
                    {c.met === null && <div className="caption" style={{ fontSize: '0.6875rem' }}>Check eligibility on scholarship website</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-filled form preview */}
          <div className="card" style={{ opacity: 0.85 }}>
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Application form preview</div>
            <div className="stack-2">
              {[
                { label: 'Full name', value: userName ?? 'Your full name' },
                { label: 'Province', value: userProvince ?? '—' },
                { label: 'APS score', value: userAps !== undefined ? String(userAps) : '—' },
                { label: 'SA ID number', value: '00 00 00 0000 000' },
                { label: 'Email address', value: 'your.email@example.com' },
              ].map(field => (
                <div key={field.label}>
                  <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>{field.label}</div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    background: 'hsl(var(--surface))',
                    color: 'hsl(var(--fg-muted))',
                    fontFamily: 'inherit',
                  }}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="caption" style={{ marginTop: '0.875rem', fontSize: '0.6875rem', fontStyle: 'italic' }}>
              Preview only. Full form opens on the scholarship provider&apos;s website.
            </div>
          </div>
        </div>

        {/* Right: key dates + how to apply */}
        <div className="stack-3">
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Key dates</div>
            <div className="stack">
              {keyDates.map((d, i) => (
                <div key={i} className="row" style={{ gap: '1rem', padding: '0.625rem 0', borderBottom: i < keyDates.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                  <div style={{
                    minWidth: 52, textAlign: 'center',
                    fontWeight: 800, fontSize: '0.9375rem',
                    color: i === keyDates.length - 1 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {d.date}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: i === keyDates.length - 1 ? 600 : 400 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />How to apply</div>
            <div className="stack-2">
              {[
                'Visit the scholarship provider\'s official website to download the application form.',
                'Prepare certified copies of ID, NSC results, and proof of income for all household members.',
                'Submit your completed form and supporting documents before the closing date.',
              ].map((step, i) => (
                <div key={i} className="row" style={{ gap: '0.875rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                    background: 'hsl(var(--primary) / 0.12)',
                    border: '1.5px solid hsl(var(--primary) / 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.6875rem', color: 'hsl(var(--primary))',
                  }}>
                    {i + 1}
                  </div>
                  <p className="body-text" style={{ fontSize: '0.875rem', margin: 0 }}>{step}</p>
                </div>
              ))}
            </div>
            {isServiceContract && (
              <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'hsl(var(--warning) / 0.1)', border: '1px solid hsl(var(--warning) / 0.3)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'hsl(var(--warning))' }}>Service contract applies</div>
                <p className="caption" style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
                  You will be required to work for the sponsor after graduation, typically for 1–3 years. Read the service agreement before accepting the award.
                </p>
              </div>
            )}
            {applicationUrl ? (
              <a
                href={applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ marginTop: '1.25rem', width: '100%', textAlign: 'center', display: 'block' }}
              >
                Apply on scholarship website →
              </a>
            ) : (
              <button className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%' }} disabled>
                Search "{scholarship.name}" for application link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
