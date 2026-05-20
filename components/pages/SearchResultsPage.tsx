'use client';

import { useMemo } from 'react';
import { PROGRAMMES, CAREERS } from '@/lib/data';
import type { Route } from '@/lib/types';

interface SearchResult {
  id: string;
  section: string;
  icon: string;
  title: string;
  sub: string;
  route: Route;
}

interface SearchResultsPageProps {
  query: string;
  navigate: (r: Route) => void;
}

const STATIC_RESULTS: SearchResult[] = [
  { id: 'p-home',         section: 'Pages', icon: '⌂',  title: 'Dashboard',           sub: 'Home · KPIs · focus list',          route: 'home' },
  { id: 'p-simulator',    section: 'Pages', icon: '⟳',  title: 'APS Simulator',       sub: 'Adjust marks · see impact',         route: 'simulator' },
  { id: 'p-programmes',   section: 'Pages', icon: '🎓', title: 'Programmes',           sub: 'Browse · eligibility · match',      route: 'programmes' },
  { id: 'p-funding',      section: 'Pages', icon: '💰', title: 'Funding Strategy',     sub: 'NSFAS · bursaries · scholarships',  route: 'funding' },
  { id: 'p-careers',      section: 'Pages', icon: '📊', title: 'Career Explorer',      sub: 'Ranked careers · fit scores',       route: 'careers' },
  { id: 'p-intelligence', section: 'Pages', icon: '✦',  title: 'Intelligence',         sub: 'Strategic score · AI insights',     route: 'intelligence' },
  { id: 'p-cognitive',    section: 'Pages', icon: '🧠', title: 'Cognitive Assessment', sub: 'Big Five · RIASEC profile',         route: 'cognitive' },
  { id: 'p-skills',       section: 'Pages', icon: '⬡',  title: 'Skills Map',           sub: '8-dimension capability radar',      route: 'skills' },
  { id: 'p-map',          section: 'Pages', icon: '🗺️', title: 'Opportunity Map',      sub: 'SA provinces · programme density',  route: 'map' },
  { id: 'p-unis',         section: 'Pages', icon: '🏛️', title: 'Universities',          sub: '26 SA institutions · ranked',       route: 'unis' },
  { id: 'p-scholarships', section: 'Pages', icon: '🏆', title: 'Scholarships',          sub: 'Matched to your profile',          route: 'scholarships' },
  { id: 'p-nsfas',        section: 'Pages', icon: 'N',  title: 'NSFAS Calculator',     sub: 'Estimate your award',               route: 'nsfas' },
  { id: 'p-applications', section: 'Pages', icon: '📝', title: 'Applications',          sub: 'Pipeline tracker',                  route: 'applications' },
  { id: 'p-deadlines',    section: 'Pages', icon: '📅', title: 'Deadlines',             sub: 'Upcoming · urgent · open',          route: 'deadlines' },
  { id: 'p-documents',    section: 'Pages', icon: '📁', title: 'Documents',             sub: 'Upload · verify · track',           route: 'documents' },
  { id: 'p-compare',      section: 'Pages', icon: '⇄',  title: 'Career Compare',       sub: 'Side-by-side career comparison',    route: 'compare' },
  { id: 'p-discover',     section: 'Pages', icon: '✦',  title: 'Discover · AI',        sub: 'AI-powered cross-domain search',    route: 'discover' },
  { id: 'p-profile',      section: 'Pages', icon: '👤', title: 'Profile',               sub: 'Personal · academic · capability',  route: 'profile' },
  // Funding
  { id: 'f-allangray', section: 'Funding', icon: '🏆', title: 'Allan Gray Orbis Foundation', sub: 'R280 000 · 92% match · entrepreneurial', route: 'scholarships' },
  { id: 'f-nsfas',     section: 'Funding', icon: 'N',  title: 'NSFAS Bursary',               sub: 'Means-tested · covers full fees + living', route: 'nsfas' },
  { id: 'f-sasol',     section: 'Funding', icon: '⚡', title: 'Sasol Bursary (Engineering)',  sub: 'R198 000 · engineering · service contract', route: 'scholarships' },
  // Actions
  { id: 'a-simulator', section: 'Actions', icon: '⟳', title: 'Run scenario: drop History, add Geography', sub: 'Open simulator →', route: 'simulator' },
  { id: 'a-rerank',    section: 'Actions', icon: '✦', title: 'Re-rank programmes by fit',                 sub: 'Refresh AI ranking', route: 'programmes' },
  { id: 'a-compare',   section: 'Actions', icon: '⇄', title: 'Compare UCT vs Wits CS',                   sub: 'Open compare →', route: 'compare' },
];

export default function SearchResultsPage({ query, navigate }: SearchResultsPageProps) {
  const results = useMemo(() => {
    const progResults: SearchResult[] = PROGRAMMES.map(p => ({
      id: `prog-${p.id}`,
      section: 'Programmes',
      icon: 'P',
      title: p.name,
      sub: `${p.uni} · APS ${p.aps} · fit ${p.fit}`,
      route: 'programmes' as Route,
    }));

    const careerResults: SearchResult[] = CAREERS.map(c => ({
      id: `car-${c.name}`,
      section: 'Careers',
      icon: 'C',
      title: c.name,
      sub: `Match ${c.match} · ${c.growth} growth · ${c.demand} demand`,
      route: 'careers' as Route,
    }));

    const all = [...STATIC_RESULTS, ...progResults, ...careerResults];

    if (!query.trim()) return all;

    const q = query.toLowerCase();
    return all.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.sub.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q)
    );
  }, [query]);

  const sections = [...new Set(results.map(r => r.section))];

  return (
    <div className="page">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Search</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />
              {results.length} result{results.length !== 1 ? 's' : ''}
              {query ? ` for "${query}"` : ''}
            </div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Search results</h2>
          </div>
        </div>
      </div>

      {!query.trim() ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⌕</div>
          <div className="subheading">Start typing to search</div>
          <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '28rem', margin: '0.5rem auto 0' }}>
            Search across pages, programmes, careers, funding, and more — press ⌘K to open the palette.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>∅</div>
          <div className="subheading">No matches for &ldquo;{query}&rdquo;</div>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>Try a different term — e.g. &ldquo;actuary&rdquo;, &ldquo;NSFAS&rdquo;, or &ldquo;Cape Town&rdquo;.</p>
        </div>
      ) : (
        <div className="stack-3">
          {sections.map(section => (
            <div key={section}>
              <div className="cmdk-section" style={{ marginBottom: '0.5rem' }}>{section}</div>
              <div className="stack" style={{ gap: '0.25rem' }}>
                {results.filter(r => r.section === section).map(r => (
                  <div
                    key={r.id}
                    className="cmdk-row"
                    style={{ borderRadius: 'var(--r-lg)', cursor: 'pointer' }}
                    onClick={() => navigate(r.route)}
                  >
                    <div className="ico">{r.icon}</div>
                    <div className="body">
                      <div className="ttl">{r.title}</div>
                      <div className="sub">{r.sub}</div>
                    </div>
                    <div className="meta">→</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
