'use client';

import { useEffect, useRef, useState } from 'react';
import type { Route } from '@/lib/types';
import { signOut } from '@/app/actions/auth';
import { PROGRAMMES, CAREERS } from '@/lib/data';
import { fmtR } from '@/lib/utils';

const GREET_TEMPLATE: Record<Route, string | ((name: string) => string)> = {
  home:         (n) => `Welcome back, ${n}`,
  intelligence: 'Your Intelligence Dashboard',
  simulator:    'Academic Simulator',
  programmes:   'Programme Explorer',
  funding:      'Funding Strategy',
  financial:    'Financial Aid',
  careers:      'Career Explorer',
  cognitive:    'Cognitive Assessment',
  skills:       'Skills Map',
  map:          'Opportunity Map',
  unis:         'Universities',
  compare:      'Career Compare',
  discover:     'Discover',
  scholarships: 'Scholarships',
  nsfas:        'NSFAS Calculator',
  applications: 'Applications',
  documents:           'Documents',
  deadlines:           'Deadlines',
  profile:             'Your Profile',
  'application-detail': 'Application Detail',
  'scholarship-detail': 'Scholarship Detail',
  'career-detail':      'Career Path',
  'subject-detail':     'Subject Deep-dive',
  'notifications':      'Notifications',
};

interface CmdkResult {
  id: string;
  section: string;
  icon: string;
  title: string;
  sub: string;
  route?: Route;
}

const ALL_CMDK: CmdkResult[] = [
  // Pages
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
  { id: 'p-scholarships', section: 'Pages', icon: '🏆', title: 'Scholarships',          sub: '5 matches · 3 new',                 route: 'scholarships' },
  { id: 'p-nsfas',        section: 'Pages', icon: 'N',  title: 'NSFAS Calculator',     sub: 'Estimate your award',               route: 'nsfas' },
  { id: 'p-applications', section: 'Pages', icon: '📝', title: 'Applications',          sub: '4 active · 1 accepted',             route: 'applications' },
  { id: 'p-deadlines',    section: 'Pages', icon: '📅', title: 'Deadlines',             sub: 'Upcoming · urgent · open',          route: 'deadlines' },
  { id: 'p-profile',      section: 'Pages', icon: '👤', title: 'Profile',               sub: 'Personal · academic · capability',  route: 'profile' },
  // All programmes (searchable)
  ...PROGRAMMES.map(p => ({
    id: `prog-${p.id}`, section: 'Programmes', icon: 'P',
    title: p.name, sub: `${p.uni} · APS ${p.aps} · ${p.demand} demand`, route: 'programmes' as Route,
  })),
  // All careers (searchable)
  ...CAREERS.map(c => ({
    id: `car-${c.name}`, section: 'Careers', icon: 'C',
    title: c.name, sub: `${c.growth} growth · ${c.demand} demand · ${fmtR(c.salary)}/mo`, route: 'careers' as Route,
  })),
];

interface TopbarProps {
  route: Route;
  userFirstName?: string;
  userName?: string;
  userEmail?: string;
  aps?: number;
  apsDelta?: number;
  navigate?: (r: Route) => void;
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
  unreadNotificationCount?: number;
}

export default function Topbar({
  route,
  userFirstName = 'there',
  userName = 'Student',
  userEmail = '',
  aps = 42,
  apsDelta = 0,
  navigate,
  onSearch,
  onMenuClick,
  unreadNotificationCount = 0,
}: TopbarProps) {
  const [dateStr, setDateStr] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [cmdkQuery, setCmdkQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const cmdkRef = useRef<HTMLDivElement>(null);
  const cmdkInputRef = useRef<HTMLInputElement>(null);
  const initial = (userName || userFirstName).charAt(0).toUpperCase();

  useEffect(() => {
    const d = new Date();
    const weekday = d.toLocaleDateString('en-ZA', { weekday: 'long' });
    const dayMonth = d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' });
    setDateStr(`${weekday} · ${dayMonth}`);
  }, []);

  // ⌘K / Ctrl+K open
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdkOpen(prev => !prev);
        setCmdkQuery('');
      }
      if (e.key === 'Escape') {
        setCmdkOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when palette opens
  useEffect(() => {
    if (cmdkOpen) setTimeout(() => cmdkInputRef.current?.focus(), 50);
  }, [cmdkOpen]);

  // Click-outside to close profile menu
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const greetTpl = GREET_TEMPLATE[route];
  const greet = typeof greetTpl === 'function' ? greetTpl(userFirstName) : greetTpl;

  const filteredResults = cmdkQuery.trim()
    ? ALL_CMDK.filter(r =>
        r.title.toLowerCase().includes(cmdkQuery.toLowerCase()) ||
        r.sub.toLowerCase().includes(cmdkQuery.toLowerCase())
      )
    : ALL_CMDK.filter(r => r.section === 'Pages').slice(0, 8);

  const sections = [...new Set(filteredResults.map(r => r.section))];

  function handleCmdkSelect(r: CmdkResult) {
    setCmdkOpen(false);
    if (r.route && navigate) navigate(r.route);
  }

  function handleProfileNav(r: Route) {
    setProfileOpen(false);
    if (navigate) navigate(r);
  }

  return (
    <>
      <div className="topbar">
        <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="topbar-left">
          <div className="caption">{dateStr}</div>
          <div className="row" style={{ gap: '0.625rem', alignItems: 'center', marginTop: '0.125rem' }}>
            <div className="greet">{greet}</div>
            <span className="aps-chip" title="Your live APS — changes ripple to every page">
              APS <span className="num">{aps}</span>
              {apsDelta > 0 && <span className="delta up">▲ +{apsDelta}</span>}
              {apsDelta < 0 && <span className="delta dn">▼ {apsDelta}</span>}
              {apsDelta === 0 && <span className="delta zero">± 0</span>}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-search search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="input search-input"
              placeholder="Search programmes, careers, funding…"
              autoComplete="off"
              onFocus={() => { setCmdkOpen(true); setCmdkQuery(''); }}
              readOnly
            />
            <span className="search-kbd">⌘K</span>
          </div>

          <button
            className="icon-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => navigate?.('notifications')}
          >
            {unreadNotificationCount > 0 && (
              <span
                className="icon-dot"
                aria-label={`${unreadNotificationCount} unread notification${unreadNotificationCount > 1 ? 's' : ''}`}
              />
            )}
            🔔
          </button>
          <button className="icon-btn" title="Messages" aria-label="Messages">
            💬
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate?.('applications')}
          >
            Apply
          </button>

          {/* Avatar + profile menu wrapper */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              className="avatar-btn"
              onClick={() => setProfileOpen(p => !p)}
              title={userName}
              aria-label="Open profile menu"
            >
              <div className="avatar" style={{ width: 36, height: 36, background: 'hsl(var(--primary))' }}>
                {initial}
              </div>
            </button>

            <div className={`profile-menu${profileOpen ? ' open' : ''}`}>
              <div className="pm-head">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.9375rem', background: 'hsl(var(--primary))', flexShrink: 0 }}>
                  {initial}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{userName}</div>
                  {userEmail && <div className="caption">{userEmail}</div>}
                </div>
                <span className="badge brand">PRO</span>
              </div>
              <div className="pm-list">
                <button className="pm-item" onClick={() => handleProfileNav('profile')}>My profile</button>
                <button className="pm-item" onClick={() => handleProfileNav('documents')}>Document vault</button>
                <button className="pm-item" onClick={() => handleProfileNav('applications')}>Applications</button>
                <hr className="divider" style={{ margin: '0.375rem 0' }} />
                <button className="pm-item">Account &amp; billing</button>
                <button className="pm-item">Privacy &amp; data</button>
                <button className="pm-item">Help centre</button>
                <hr className="divider" style={{ margin: '0.375rem 0' }} />
                <form action={signOut} style={{ display: 'contents' }}>
                  <button type="submit" className="pm-item" style={{ color: 'hsl(var(--destructive))' }}>
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command palette */}
      <div
        className={`cmdk-backdrop${cmdkOpen ? ' open' : ''}`}
        onClick={() => setCmdkOpen(false)}
      />
      <div className={`cmdk${cmdkOpen ? ' open' : ''}`} ref={cmdkRef} role="dialog" aria-label="Search">
        <div className="cmdk-inputwrap">
          <span className="cmdk-icon">⌕</span>
          <input
            ref={cmdkInputRef}
            className="cmdk-input"
            placeholder="Type to search across Prospectus…"
            value={cmdkQuery}
            onChange={e => setCmdkQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && cmdkQuery.trim() && onSearch) {
                setCmdkOpen(false);
                onSearch(cmdkQuery.trim());
              }
            }}
          />
          <span className="cmdk-kbd">esc</span>
        </div>
        <div className="cmdk-results">
          {filteredResults.length === 0 ? (
            <div className="cmdk-empty">No results for &ldquo;{cmdkQuery}&rdquo;</div>
          ) : (
            sections.map(section => (
              <div key={section}>
                <div className="cmdk-section">{section}</div>
                {filteredResults.filter(r => r.section === section).map(r => (
                  <div
                    key={r.id}
                    className="cmdk-row"
                    onClick={() => handleCmdkSelect(r)}
                  >
                    <div className="ico">{r.icon}</div>
                    <div className="body">
                      <div className="ttl">{r.title}</div>
                      <div className="sub">{r.sub}</div>
                    </div>
                    {r.route && <div className="meta">→</div>}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="cmdk-foot">
          <span><b>↑↓</b> navigate</span>
          <span><b>↵</b> open</span>
          <span><b>esc</b> close</span>
          <span style={{ marginLeft: 'auto' }}>Prospectus AI</span>
        </div>
      </div>
    </>
  );
}
