import { SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { Programme, Route, Subject, PsychProfileData, CapabilityData } from '@/lib/types';
import AiInsightCard from '@/components/AiInsightCard';

interface FundingPageProps {
  householdIncome?: number;
  userAps?: number;
  programmes?: Programme[];
  navigate?: (r: Route) => void;
  subjects?: Subject[];
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
}

function computeNsfas(income: number | undefined): number {
  if (income === undefined || income <= 350_000) return 115_060;
  if (income <= 600_000)                         return  48_000;
  return 0;
}

function computeBursary(aps: number | undefined): number {
  const a = aps ?? 0;
  if (a >= 42) return 165_000;
  if (a >= 38) return  95_000;
  if (a >= 32) return  42_000;
  if (a >= 26) return  18_000;
  return 0;
}

const DEFAULT_YEAR1_COST = 165_420;
const INFLATION = 0.048;

export default function FundingPage({ householdIncome, userAps, programmes, navigate, subjects = [], psychProfile, capabilityData }: FundingPageProps) {
  const aboveNsfasThreshold = householdIncome !== undefined && householdIncome > 350_000;

  // Derive top programme — highest fit score from the real list, or fallback label
  const topProg = programmes && programmes.length > 0
    ? programmes.reduce((best, p) => p.fit > best.fit ? p : best)
    : null;
  const year1Cost = topProg ? Math.round(topProg.fees * 1.8) : DEFAULT_YEAR1_COST;
  const progLabel = topProg ? `${topProg.name} · ${topProg.uni}` : 'your shortlisted programme';

  const nsfas   = computeNsfas(householdIncome);
  const bursary = computeBursary(userAps);
  const scholar = 18_000;
  const total   = year1Cost;
  const gap     = Math.max(0, total - nsfas - bursary - scholar);
  const pct     = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  const projection = [1, 2, 3].map(y => {
    const cost = Math.round(total * Math.pow(1 + INFLATION, y - 1));
    const cov  = Math.min(cost, nsfas + bursary + scholar);
    return { y: `Year ${y}`, cost, cov };
  });

  const topScholar     = [...SCHOLARSHIPS].sort((a, b) => b.amount - a.amount)[0];
  const serviceScholar = SCHOLARSHIPS.find(s => s.eligibility.toLowerCase().includes('service'));

  const bursaryLabel = bursary >= 95_000 ? 'Investec Bursary' : bursary >= 42_000 ? 'Merit Bursary' : 'Achievement Bursary';
  const bursorySub   = bursary > 0
    ? `APS ${userAps ?? '—'} qualifies · application open`
    : 'APS below merit threshold';

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Funding strategy</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Personalised plan</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Funding strategy</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Based on {progLabel} ({fmtR(total)} estimated year 1 total cost),
              here is the optimal stack of NSFAS, bursaries and scholarships matched to your profile.
            </p>
          </div>
          <div className="row">
            {aboveNsfasThreshold && (
              <span className="badge destructive">NSFAS: Above R 350k threshold</span>
            )}
            <button className="btn btn-outline" onClick={() => navigate?.('programmes')}>Switch programme</button>
            <button className="btn btn-primary" onClick={() => navigate?.('applications')}>View applications</button>
          </div>
        </div>
      </div>

      <div className="fund-strategy">
        {/* Totals */}
        <div>
          <div className="caption">Year 1 total cost</div>
          <div className="display" style={{ fontSize: '2.75rem', marginTop: '0.25rem' }}>{fmtR(total)}</div>
          <div className="caption" style={{ marginTop: '0.5rem' }}>Tuition + residence + meals + materials</div>
          <hr className="divider" />
          <div className="caption">Currently covered</div>
          <div className="display" style={{ fontSize: '2rem', color: 'hsl(var(--success))', marginTop: '0.25rem' }}>
            {fmtR(total - gap)}
          </div>
          <div className="caption" style={{ marginTop: '0.25rem' }}>
            {(((total - gap) / total) * 100).toFixed(0)}% of total
          </div>
          <hr className="divider" />
          <div className="caption">Remaining gap</div>
          <div
            className="display"
            style={{ fontSize: '2rem', color: gap > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))', marginTop: '0.25rem' }}
          >
            {gap > 0 ? fmtR(gap) : 'Closed'}
          </div>
          {gap > 0 && topScholar && (
            <div className="caption" style={{ marginTop: '0.25rem' }}>Apply to {topScholar.name} to close 100%.</div>
          )}
        </div>

        {/* Stack */}
        <div>
          <h3 className="subheading">Funding stack</h3>
          <div className="caption" style={{ marginTop: '0.25rem' }}>Year 1 · ZAR</div>

          <div className="fund-bar" style={{ marginTop: '1rem' }}>
            <div className="fund-seg nsfas"  style={{ flex: nsfas }}   title="NSFAS">{pct(nsfas)}</div>
            {bursary > 0 && (
              <div className="fund-seg bursary" style={{ flex: bursary }} title="Bursary">{pct(bursary)}</div>
            )}
            <div className="fund-seg scholar" style={{ flex: scholar }} title="Scholarship">{pct(scholar)}</div>
            {gap > 0 && (
              <div className="fund-seg fund-gap-seg" style={{ flex: gap }} title="Gap">{pct(gap)}</div>
            )}
          </div>

          <div className="row" style={{ gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.6875rem' }}>
            {[
              { label: 'NSFAS',       bg: 'hsl(var(--fg))' },
              ...(bursary > 0 ? [{ label: 'Bursary', bg: 'hsl(var(--primary))' }] : []),
              { label: 'Scholarship', bg: 'hsl(var(--accent))' },
              ...(gap > 0 ? [{ label: 'Gap', bg: 'hsl(var(--destructive) / 0.4)' }] : []),
            ].map(x => (
              <span key={x.label} className="row" style={{ gap: '0.375rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: x.bg, display: 'inline-block' }} />
                {x.label}
              </span>
            ))}
          </div>

          <div className="stack-2" style={{ marginTop: '1.25rem' }}>
            {[
              { cls: 'nsfas',   icon: 'N', label: 'NSFAS',                     amount: nsfas,   sub: aboveNsfasThreshold ? 'Above income threshold · not eligible' : 'Government bursary · confirmed eligible' },
              ...(bursary > 0 ? [{ cls: 'bursary', icon: 'B', label: bursaryLabel, amount: bursary, sub: bursorySub }] : []),
              { cls: 'scholar', icon: 'S', label: 'NRF Innovation Scholarship', amount: scholar, sub: 'Matched 74% · application open' },
            ].map(x => (
              <div key={x.label} className="fund-source">
                <div className={`fund-icon ${x.cls}`}>{x.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{x.label}</div>
                  <div className="caption" style={{ marginTop: '0.125rem' }}>{x.sub}</div>
                </div>
                <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '1rem' }}>
                  {fmtR(x.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scholarships table */}
      <div className="card">
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <div>
            <div className="eyebrow"><span className="dot" />Scholarship pipeline</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
              {SCHOLARSHIPS.length} scholarships matched to your profile
            </h3>
          </div>
          <div className="row">
            <span className="badge success">{SCHOLARSHIPS.filter(s => s.match >= 80).length} ≥ 80%</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate?.('scholarships')}>View all →</button>
          </div>
        </div>
        <div className="stack">
          {SCHOLARSHIPS.map(s => (
            <div className="scholar-row" key={s.name}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</div>
                <div className="caption" style={{ marginTop: 1 }}>{s.eligibility} · closes {s.deadline}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>{fmtR(s.amount)}</div>
                <div className="caption">/ year</div>
              </div>
              <div className="row" style={{ gap: '0.625rem' }}>
                <div className={`match-circle${s.match < 80 ? ' med' : ''}`}>{s.match}</div>
                <button
                  className={`btn ${s.match >= 80 ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => navigate?.('scholarships')}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-year projection + AI commentary */}
      <div className="grid-2 stack-3" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="eyebrow"><span className="dot" />4-year projection</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Total degree cost &amp; coverage</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            {projection.map(({ y, cost, cov }) => {
              const pc = Math.round(cov / cost * 100);
              return (
                <div key={y}>
                  <div className="row-between" style={{ fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600 }}>{y}</span>
                    <span style={{ fontWeight: 800 }}>{fmtR(cov)} <span className="caption">/ {fmtR(cost)}</span></span>
                  </div>
                  <div className={`meter ${pc >= 90 ? 'success' : pc >= 70 ? 'primary' : 'warning'}`} style={{ marginTop: '0.375rem' }}>
                    <i style={{ width: `${pc}%` }} />
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem' }}>{pc}% covered</div>
                </div>
              );
            })}
          </div>
        </div>

        <AiInsightCard
          context={{
            type: 'funding',
            aps: userAps ?? 0,
            subjects,
            psychProfile: psychProfile ?? null,
            capabilityData: capabilityData ?? null,
            strategicScore: null,
            topProgrammes: programmes ? programmes.slice(0, 4) : [],
            topCareers: [],
            householdIncome,
          }}
          navigate={navigate}
        />
      </div>
    </div>
  );
}
