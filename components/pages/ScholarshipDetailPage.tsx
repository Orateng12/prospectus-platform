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

function parseCriteria(
  scholarship: Scholarship | FundingOpportunity,
  userAps?: number,
  householdIncome?: number,
  userProvince?: string,
): Criterion[] {
  const fo = scholarship as FundingOpportunity;
  const criteria: Criterion[] = [];
  const eligibility = scholarship.eligibility;
  const lower = eligibility.toLowerCase();

  const parsedApsMatch = eligibility.match(/APS\s*[≥>=]+\s*(\d+)/);
  const minAps = fo.min_aps ?? (parsedApsMatch ? parseInt(parsedApsMatch[1]) : null);
  if (minAps !== null) {
    criteria.push({
      label: `APS ≥ ${minAps}`,
      met: userAps !== undefined ? userAps >= minAps : null,
    });
  }

  const incomeThreshold = fo.income_threshold ?? (lower.includes('financial need') ? 350000 : null);
  if (incomeThreshold !== null) {
    criteria.push({
      label: `Household income ≤ ${fmtR(incomeThreshold)}`,
      met: householdIncome !== undefined ? householdIncome <= incomeThreshold : null,
    });
  }

  if (fo.province_specific) {
    criteria.push({
      label: `${fo.province_specific} resident`,
      met: userProvince !== undefined ? userProvince === fo.province_specific : null,
    });
  }

  if (lower.includes('maths') || lower.includes('mathematics')) {
    const mathMatch = eligibility.match(/[Mm]aths?\s*[≥>=]+\s*(\d+)/);
    const required = mathMatch ? parseInt(mathMatch[1]) : 60;
    criteria.push({ label: `Mathematics ≥ ${required}%`, met: null });
  }

  const progMatch = eligibility.match(/\b(BSc|BCom|BEng|BA|BEd|LLB|BPharm)\b/g);
  if (progMatch) {
    criteria.push({ label: `Programme: ${progMatch.slice(0, 3).join(' / ')}`, met: null });
  }

  if (lower.includes('work experience') || lower.includes('yrs work')) {
    criteria.push({ label: '≥ 2 years work experience', met: null });
  }

  if (lower.includes('entrepreneur') || lower.includes('leadership pitch')) {
    criteria.push({ label: 'Leadership/entrepreneurial pitch required', met: null });
  }

  if (fo.service_contract) {
    criteria.push({ label: 'Service contract required after graduation', met: null });
  }

  criteria.push({ label: 'South African citizen or permanent resident', met: null });

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

function getApplicationSteps(type: string, providerType: string, isServiceContract: boolean): string[] {
  if (type === 'loan') {
    return [
      'Visit the bank\'s website or nearest branch to obtain the student loan application form.',
      'Gather your ID, proof of registration or acceptance letter, and a guardian\'s income statement. A guarantor with permanent income is required by most lenders.',
      'Request a cost-of-study breakdown (tuition, accommodation, books) from your institution\'s finance office.',
      'Submit at least 4–6 weeks before your institution\'s registration deadline.',
      'Follow up every two weeks by phone or branch visit until you receive a written decision letter.',
    ];
  }
  if (type === 'seta') {
    return [
      'Confirm your field of study appears on this SETA\'s list of registered occupations (available on the SETA website).',
      'If employed: ask your employer\'s HR or skills development facilitator to submit the bursary application — SETAs primarily fund through levy-paying employers.',
      'If a school-leaver: apply directly via the SETA\'s individual bursary portal with certified ID, NSC results, and a motivation letter.',
      'Attach proof of enrolment or an official acceptance letter from your institution.',
      'SETA bursaries follow the government fiscal year — deadlines typically fall between February and April. Apply well in advance.',
    ];
  }
  if (providerType === 'government') {
    return [
      'Download the application form from the official government department, provincial bursary website, or DHET online portal.',
      'Certified documents required: South African ID, NSC certificate or latest results, proof of income for every household earner (payslips or SASSA letter), and proof of residence.',
      'Obtain a letter of acceptance or proof of enrolment from your institution — applications without this are automatically rejected.',
      'Submit the complete bundle in one submission — government bursaries do not accept late or supplementary documents.',
      'Record your submission reference number and follow up after 6–8 weeks if you have not received an acknowledgement.',
    ];
  }
  if (providerType === 'international') {
    return [
      'Register on the scholarship portal as early as possible — access to the full application form typically requires an activated account.',
      'Write a compelling personal statement (800–1 200 words) covering academic record, leadership experience, community involvement, and long-term development goals.',
      'Secure two strong references from teachers, lecturers, or employers who can speak to your academic ability and character.',
      'Prepare certified copies of your ID or passport, NSC or university transcripts, and proof of language proficiency if required.',
      isServiceContract
        ? 'Review the return-home or service obligation carefully — most leadership awards require you to return to SA and apply skills locally.'
        : 'Submit at least two weeks before the deadline — international portals often experience high traffic near closing dates.',
    ];
  }
  return [
    `Visit ${isServiceContract ? "the sponsor's careers or bursary portal" : "the scholarship provider's official website"} to obtain the current application form.`,
    'Prepare certified copies of ID, NSC certificate or latest results, and proof of household income for all earners.',
    'Write a 400–600 word motivation letter explaining your chosen field, career goals, and why you are a strong candidate.',
    'Obtain two reference letters from Grade 12 teachers or lecturers who can speak to your academic ability and work ethic.',
    isServiceContract
      ? 'Read the service contract before accepting — you may be required to work for the funder for 1–3 years after graduation. Clarify posting location and start date up front.'
      : 'Submit the complete application by the closing date. Late or incomplete submissions are not considered under any circumstances.',
  ];
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

  const foType = fo.type ?? 'bursary';
  const foProviderType = fo.provider_type ?? 'corporate';
  const applicationSteps = getApplicationSteps(foType, foProviderType, isServiceContract);

  const criteria = parseCriteria(scholarship, userAps, householdIncome, userProvince);
  const metCount = criteria.filter(c => c.met === true).length;
  const totalKnown = criteria.filter(c => c.met !== null).length;

  const isRolling = scholarship.deadline === 'Rolling';
  const keyDates = isRolling
    ? [
        { label: 'Applications open year-round', date: 'Any time', isClose: false },
        { label: 'Allow 4–6 weeks for processing', date: 'Ongoing', isClose: false },
      ]
    : [
        { label: 'Research & approach referees', date: addWeeks(scholarship.deadline, 8), isClose: false },
        { label: 'Gather certified documents', date: addWeeks(scholarship.deadline, 5), isClose: false },
        { label: 'Write motivation letter', date: addWeeks(scholarship.deadline, 3), isClose: false },
        { label: 'Final review & submit', date: addWeeks(scholarship.deadline, 1), isClose: false },
        { label: 'Application closes', date: scholarship.deadline, isClose: true },
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
                    color: d.isClose ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {d.date}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: d.isClose ? 600 : 400 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {(() => {
            const TYPICAL_COST = 95000;
            const coveragePct = Math.min(100, Math.round((scholarship.amount / TYPICAL_COST) * 100));
            const surplus = scholarship.amount - TYPICAL_COST;
            return (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Annual cost coverage</div>
                <div className="stack-2">
                  <div className="row-between">
                    <span className="caption" style={{ fontSize: '0.8125rem' }}>Award value</span>
                    <span style={{ fontWeight: 800, color: 'hsl(var(--success))' }}>{fmtR(scholarship.amount)}</span>
                  </div>
                  <div className="row-between">
                    <span className="caption" style={{ fontSize: '0.8125rem' }}>Typical SA annual cost</span>
                    <span style={{ fontWeight: 600 }}>{fmtR(TYPICAL_COST)}</span>
                  </div>
                  <div>
                    <div className="meter success" style={{ marginBottom: '0.25rem' }}>
                      <i style={{ width: `${coveragePct}%` }} />
                    </div>
                    <div className="row-between">
                      <span className="caption" style={{ fontSize: '0.6875rem' }}>
                        {coveragePct >= 100 ? 'Full annual cost covered' : coveragePct >= 75 ? 'Largely covered' : coveragePct >= 50 ? 'About half covered' : 'Partial support'}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: coveragePct >= 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))' }}>{coveragePct}%</span>
                    </div>
                  </div>
                </div>
                {surplus > 0 && (
                  <div className="caption" style={{ marginTop: '0.625rem', fontSize: '0.6875rem', padding: '0.5rem', background: 'hsl(var(--success) / 0.08)', borderRadius: 'var(--r-sm)', border: '1px solid hsl(var(--success) / 0.2)' }}>
                    {fmtR(surplus)} surplus may cover textbooks, transport, and personal expenses.
                  </div>
                )}
                <div className="caption" style={{ marginTop: '0.5rem', fontSize: '0.5625rem' }}>
                  Based on average SA tuition + accommodation. Actual costs vary by institution and field.
                </div>
              </div>
            );
          })()}

          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />How to apply</div>
            <div className="stack-2">
              {applicationSteps.map((step, i) => (
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
