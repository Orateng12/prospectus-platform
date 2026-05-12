import { SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';

interface FundingPageProps {
  householdIncome?: number;
  userAps?: number;
}

export default function FundingPage({ householdIncome, userAps }: FundingPageProps) {
  const aboveNsfasThreshold = householdIncome !== undefined && householdIncome > 350000;
  const total   = 165420;
  const nsfas   = aboveNsfasThreshold ? 0 : 88000;
  const bursary = 42000;
  const scholar = 18000;
  const gap     = total - nsfas - bursary - scholar;
  const pct     = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Funding strategy</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Personalised plan</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Funding strategy</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              Based on your top-shortlisted programme (BSc Computer Science · UCT · {fmtR(total)} year 1),
              here is the optimal stack of NSFAS, bursaries and scholarships matched to your profile.
            </p>
          </div>
          <div className="row">
            {aboveNsfasThreshold && (
              <span className="badge destructive">NSFAS: Above R 350k threshold</span>
            )}
            <button className="btn btn-outline">Switch programme</button>
            <button className="btn btn-primary">Generate applications</button>
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
          {gap > 0 && (
            <div className="caption" style={{ marginTop: '0.25rem' }}>Apply to Allan Gray Orbis to close 100%.</div>
          )}
        </div>

        {/* Stack */}
        <div>
          <h3 className="subheading">Funding stack</h3>
          <div className="caption" style={{ marginTop: '0.25rem' }}>Year 1 · ZAR</div>

          <div className="fund-bar" style={{ marginTop: '1rem' }}>
            <div className="fund-seg nsfas" style={{ flex: nsfas }} title="NSFAS">{pct(nsfas)}</div>
            <div className="fund-seg bursary" style={{ flex: bursary }} title="Bursary">{pct(bursary)}</div>
            <div className="fund-seg scholar" style={{ flex: scholar }} title="Scholarship">{pct(scholar)}</div>
            <div className="fund-seg fund-gap-seg" style={{ flex: gap }} title="Gap">{pct(gap)}</div>
          </div>

          <div className="row" style={{ gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.6875rem' }}>
            {[
              { label: 'NSFAS',       cls: 'nsfas',   bg: 'hsl(var(--fg))' },
              { label: 'Bursary',     cls: 'bursary',  bg: 'hsl(var(--primary))' },
              { label: 'Scholarship', cls: 'scholar',  bg: 'hsl(var(--accent))' },
              { label: 'Gap',         cls: 'gap',      bg: 'hsl(var(--destructive) / 0.4)' },
            ].map(x => (
              <span key={x.label} className="row" style={{ gap: '0.375rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: x.bg, display: 'inline-block' }} />
                {x.label}
              </span>
            ))}
          </div>

          <div className="stack-2" style={{ marginTop: '1.25rem' }}>
            {[
              { cls: 'nsfas',   icon: 'N', label: 'NSFAS',                         amount: nsfas,   sub: aboveNsfasThreshold ? 'Above income threshold · not eligible' : 'Government bursary · confirmed eligible' },
              { cls: 'bursary', icon: 'B', label: 'Investec Bursary',               amount: bursary, sub: 'Matched 88% · application open' },
              { cls: 'scholar', icon: 'S', label: 'NRF Innovation Scholarship',     amount: scholar, sub: 'Matched 74% · application open' },
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
            <button className="btn btn-ghost btn-sm">Filters</button>
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
                <button className={`btn ${s.match >= 80 ? 'btn-primary' : 'btn-outline'} btn-sm`}>Apply</button>
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
            {[
              { y: 'Year 1', cost: 165420, cov: 148000 },
              { y: 'Year 2', cost: 173200, cov: 158400 },
              { y: 'Year 3', cost: 181800, cov: 166200 },
            ].map(({ y, cost, cov }) => {
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

        <div className="card">
          <div className="eyebrow"><span className="dot" />AI commentary</div>
          <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Strategy notes</h3>
          <div className="stack-2" style={{ marginTop: '0.875rem' }}>
            <div className="insight">
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Apply to Allan Gray first</div>
              <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                Closes 15 Oct, highest amount ({fmtR(280000)}) and you match 92% of criteria. If awarded, decline lower-value bursaries.
              </p>
              <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>GPT-4 · Strategic priority</div>
            </div>
            <div className="insight">
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Watch the Sasol service contract</div>
              <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                Sasol&apos;s {fmtR(198000)} bursary requires a post-graduation service period — limits mobility. Stack only if committed to the energy sector.
              </p>
              <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>Gemini · Risk note</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
