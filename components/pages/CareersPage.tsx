'use client';

import { useState, useMemo } from 'react';
import { CAREERS } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import type { Career, CompareItem } from '@/lib/types';

interface CareersPageProps {
  careers?: Career[];
  compareItems?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
}

type Tab = 'fit' | 'demand' | 'growth' | 'salary';

function parseGrowth(g: string): number {
  return parseFloat(g.replace('%', '')) || 0;
}

export default function CareersPage({ careers: propCareers, compareItems = [], onToggleCompare }: CareersPageProps) {
  const allCareers = propCareers && propCareers.length > 0 ? propCareers : CAREERS;
  const [activeTab, setActiveTab] = useState<Tab>('fit');

  const displayed = useMemo(() => {
    let list = [...allCareers];
    if (activeTab === 'demand') {
      list = list.filter(c => c.demand === 'High').sort((a, b) => b.match - a.match);
    } else if (activeTab === 'growth') {
      list = list.sort((a, b) => parseGrowth(b.growth) - parseGrowth(a.growth));
    } else if (activeTab === 'salary') {
      list = list.sort((a, b) => b.salary - a.salary);
    } else {
      list = list.sort((a, b) => b.match - a.match);
    }
    return list.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [allCareers, activeTab]);

  const highDemandCount = allCareers.filter(c => c.demand === 'High').length;

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Career Explorer</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Discover</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Career explorer</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '48rem' }}>
              {allCareers.length} roles ranked against your capability graph and labour-market signal.
              Each card shows fit, salary, growth and one line on why.
            </p>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab ${activeTab === 'fit' ? 'active' : ''}`} onClick={() => setActiveTab('fit')}>
          Best fit ({allCareers.length})
        </button>
        <button className={`tab ${activeTab === 'demand' ? 'active' : ''}`} onClick={() => setActiveTab('demand')}>
          High demand ({highDemandCount})
        </button>
        <button className={`tab ${activeTab === 'growth' ? 'active' : ''}`} onClick={() => setActiveTab('growth')}>
          High growth
        </button>
        <button className={`tab ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>
          Top salary
        </button>
      </div>

      <div className="grid-3">
        {displayed.map(c => (
          <div className="career-card" key={c.name}>
            <div className="row-between">
              <div className="row" style={{ gap: '0.5rem' }}>
                <div className="career-rank">{String(c.rank).padStart(2, '0')}</div>
                <span
                  className={`badge ${c.demand === 'High' ? 'success' : 'warning'}`}
                  style={{ height: '1.25rem', fontSize: '0.625rem' }}
                >
                  {c.demand} demand
                </span>
              </div>
              <div className="row" style={{ gap: '0.375rem', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                  {c.match}
                </span>
                <span className="caption" style={{ fontSize: '0.6875rem' }}>/100</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>{c.name}</div>
              <div className="meter" style={{ marginTop: '0.5rem' }}><i style={{ width: `${c.match}%` }} /></div>
            </div>

            <div className="row-between" style={{ fontSize: '0.75rem', paddingTop: '0.375rem', borderTop: '1px solid hsl(var(--border))' }}>
              <div>
                <div className="caption" style={{ fontSize: '0.625rem' }}>Median salary</div>
                <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtR(c.salary)}<span className="caption" style={{ fontWeight: 600 }}>/mo</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="caption" style={{ fontSize: '0.625rem' }}>10-yr growth</div>
                <div style={{ fontWeight: 800, color: 'hsl(var(--success))' }}>{c.growth}</div>
              </div>
            </div>

            <p className="body-text" style={{ fontSize: '0.8125rem', lineHeight: 1.55, margin: 0 }}>{c.why}</p>

            <div className="row" style={{ gap: '0.25rem' }}>
              {c.tags.map(t => (
                <span key={t} className="career-tag">{t}</span>
              ))}
            </div>

            {onToggleCompare && (
              <div className="row" style={{ gap: '0.375rem', marginTop: 'auto' }}>
                <button
                  className={`btn btn-sm ${compareItems.some(ci => ci.name === c.name) ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => onToggleCompare({ id: c.name, kind: 'career', name: c.name })}
                >
                  {compareItems.some(ci => ci.name === c.name) ? '✓ Added' : 'Compare'}
                </button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Open path</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card stack-3" style={{ marginTop: '1.25rem' }}>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />AI commentary</div>
            <h3 className="subheading" style={{ marginTop: '0.25rem' }}>Reading your top 3</h3>
          </div>
        </div>
        <p className="body-text" style={{ margin: 0, fontSize: '0.875rem' }}>
          {displayed[0] && displayed[1] && displayed[2]
            ? <>
                <strong>{displayed[0].name}</strong>, <strong>{displayed[1].name}</strong> and{' '}
                <strong>{displayed[2].name}</strong> lead your ranking.{' '}
                {displayed.filter(c => c.demand === 'High').length > 0
                  ? `${displayed.filter(c => c.demand === 'High').length} of your top careers have high market demand in South Africa.`
                  : 'Explore the High demand tab to filter for fastest-growing roles.'}
              </>
            : 'Complete your profile to unlock personalised career commentary.'
          }
        </p>
      </div>
    </div>
  );
}
