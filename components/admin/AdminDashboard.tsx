'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminRoute =
  | 'overview' | 'alerts' | 'health'
  | 'students' | 'institution-admins' | 'staff'
  | 'institutions' | 'programmes' | 'careers' | 'bursaries'
  | 'moderation' | 'reports' | 'audit'
  | 'ai' | 'exports' | 'settings';

type StudFilter = 'all' | 'pro' | 'flagged' | 'new';

// ─── Static Data ──────────────────────────────────────────────────────────────

const INSTITUTIONS = [
  { short: 'UCT',  name: 'University of Cape Town',              city: 'Cape Town',      students: 2841, progs: 142, admins: 12, status: 'active',   last: '8 min ago',   tier: 1 },
  { short: 'Wits', name: 'University of the Witwatersrand',      city: 'Johannesburg',   students: 3120, progs: 168, admins: 14, status: 'active',   last: '12 min ago',  tier: 1 },
  { short: 'SUN',  name: 'Stellenbosch University',              city: 'Stellenbosch',   students: 1872, progs: 154, admins: 9,  status: 'active',   last: '3 min ago',   tier: 1 },
  { short: 'UP',   name: 'University of Pretoria',               city: 'Pretoria',       students: 2210, progs: 187, admins: 11, status: 'active',   last: '21 min ago',  tier: 1 },
  { short: 'UKZN', name: 'University of KwaZulu-Natal',          city: 'Durban',         students: 1402, progs: 162, admins: 7,  status: 'sync',     last: '6 hrs ago',   tier: 1 },
  { short: 'UJ',   name: 'University of Johannesburg',           city: 'Johannesburg',   students: 974,  progs: 198, admins: 8,  status: 'active',   last: '4 min ago',   tier: 1 },
  { short: 'CPUT', name: 'Cape Peninsula University of Tech.',   city: 'Cape Town',      students: 411,  progs: 118, admins: 4,  status: 'active',   last: '1 hr ago',    tier: 2 },
  { short: 'NWU',  name: 'North-West University',                city: 'Potchefstroom',  students: 542,  progs: 124, admins: 5,  status: 'active',   last: '22 min ago',  tier: 2 },
  { short: 'NMU',  name: 'Nelson Mandela University',            city: 'Gqeberha',       students: 391,  progs: 102, admins: 4,  status: 'sync',     last: '2 hrs ago',   tier: 2 },
  { short: 'UWC',  name: 'University of the Western Cape',       city: 'Cape Town',      students: 314,  progs: 94,  admins: 4,  status: 'active',   last: '14 min ago',  tier: 2 },
  { short: 'TUT',  name: 'Tshwane University of Technology',     city: 'Pretoria',       students: 287,  progs: 142, admins: 3,  status: 'inactive', last: '3 days ago',  tier: 2 },
  { short: 'DUT',  name: 'Durban University of Technology',      city: 'Durban',         students: 248,  progs: 88,  admins: 3,  status: 'active',   last: '38 min ago',  tier: 2 },
];

const STUDENTS = [
  { name: 'Lerato Mokoena',  email: 'lerato.mokoena@gmail.com',   school: 'Soshanguve South Secondary',  prov: 'Gauteng',      aps: 42, plan: 'Free', joined: '12 Mar 2026', last: '12 min ago', flags: 0 },
  { name: 'Sipho Dlamini',   email: 'sipho.dlamini@outlook.com',  school: 'Durban High School',          prov: 'KZN',          aps: 38, plan: 'Pro',  joined: '08 Mar 2026', last: '2 hrs ago',  flags: 0 },
  { name: 'Aisha Mahmood',   email: 'aisha.m@gmail.com',          school: 'Northcliff High',             prov: 'Gauteng',      aps: 46, plan: 'Pro',  joined: '02 Feb 2026', last: '34 min ago', flags: 0 },
  { name: 'Thabo Mokoa',     email: 'thabo.mokoa@yahoo.com',      school: 'Mthatha Senior Secondary',    prov: 'Eastern Cape', aps: 34, plan: 'Free', joined: '15 Apr 2026', last: '1 day ago',  flags: 1 },
  { name: 'Naledi Khumalo',  email: 'naledi.k@gmail.com',         school: "Westville Girls' High",       prov: 'KZN',          aps: 44, plan: 'Pro',  joined: '21 Jan 2026', last: '5 min ago',  flags: 0 },
  { name: 'Karabo Sithole',  email: 'karabo.s@outlook.com',       school: 'Polokwane Secondary',         prov: 'Limpopo',      aps: 36, plan: 'Free', joined: '03 Apr 2026', last: '2 days ago', flags: 0 },
  { name: 'Sarah van Wyk',   email: 'sarahvw@gmail.com',          school: "Rondebosch Boys' High",       prov: 'Western Cape', aps: 48, plan: 'Pro',  joined: '11 Feb 2026', last: '21 min ago', flags: 0 },
  { name: 'Lethabo Mbeki',   email: 'lethabo@gmail.com',          school: 'King Edward VII School',      prov: 'Gauteng',      aps: 39, plan: 'Free', joined: '04 Apr 2026', last: '3 days ago', flags: 2 },
];

const ALERTS = [
  { level: 'destructive', title: 'TUT data sync stalled',          msg: '3-day sync lag · affects 287 student dashboards. Engineering paged.',              when: '2 hrs ago' },
  { level: 'warning',     title: 'NSFAS bursary list outdated',    msg: '12 bursaries past their deadline still showing as Open. Auto-flagged.',            when: '5 hrs ago' },
  { level: 'warning',     title: 'AI engine latency 480ms (target 350)', msg: 'Slow Gemini cross-check responses. Cache hit rate down 8%.',                 when: '8 hrs ago' },
];

const MODERATION_QUEUE = [
  { kind: 'Programme', target: 'BSc Marine Biology · UCT',      reason: 'Duplicate entry submitted by uct-admin-04',     when: '14 min ago' },
  { kind: 'Bursary',   target: 'Volkswagen SA Foundation',       reason: 'Deadline conflict · two contradictory dates',   when: '1 hr ago'   },
  { kind: 'Career',    target: 'Cryptocurrency Trader',          reason: 'Reported by 4 students · not on SETA list',     when: '4 hrs ago'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SparkLine({ values, color, width = 80, height = 28 }: { values: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...values), max = Math.max(...values);
  const pad = 2;
  const dx = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * dx;
    const y = height - pad - (max === min ? 0 : ((v - min) / (max - min)) * (height - pad * 2));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

const INIT_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669', '#dc2626', '#0891b2', '#65a30d',
];
function initials(name: string) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function initColor(name: string) { return INIT_COLORS[name.charCodeAt(0) % INIT_COLORS.length]; }

function routeGreeting(route: AdminRoute): string {
  const map: Partial<Record<AdminRoute, string>> = {
    overview:            'Platform overview',
    alerts:              'Alerts & incidents',
    health:              'System health',
    students:            'Student directory',
    'institution-admins':'Institution admins',
    staff:               'Platform staff',
    institutions:        'Institution management',
    programmes:          'Programme library',
    careers:             'Career catalogue',
    bursaries:           'Bursaries & funding',
    moderation:          'Moderation queue',
    reports:             'Reports',
    audit:               'Audit log',
    ai:                  'AI engine',
    exports:             'Data exports',
    settings:            'Settings',
  };
  return map[route] ?? 'Platform overview';
}

// ─── Nav config ───────────────────────────────────────────────────────────────

interface NavItem { label: string; route: AdminRoute; pill?: string; alert?: boolean; }
interface NavGroup { label: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operate',
    items: [
      { label: 'Platform overview', route: 'overview' },
      { label: 'Alerts',            route: 'alerts',  pill: '3',  alert: true },
      { label: 'System health',     route: 'health' },
    ],
  },
  {
    label: 'Users',
    items: [
      { label: 'Students',             route: 'students',           pill: '12,418' },
      { label: 'Institution admins',   route: 'institution-admins', pill: '142' },
      { label: 'Platform staff',       route: 'staff',              pill: '8' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Institutions',      route: 'institutions', pill: '26' },
      { label: 'Programmes',        route: 'programmes',   pill: '4,247' },
      { label: 'Careers',           route: 'careers' },
      { label: 'Bursaries & funding', route: 'bursaries' },
    ],
  },
  {
    label: 'Trust & safety',
    items: [
      { label: 'Moderation queue', route: 'moderation', pill: '7', alert: true },
      { label: 'Reports',          route: 'reports' },
      { label: 'Audit log',        route: 'audit' },
    ],
  },
  {
    label: 'Engine',
    items: [
      { label: 'AI engine',    route: 'ai' },
      { label: 'Data exports', route: 'exports' },
      { label: 'Settings',     route: 'settings' },
    ],
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AdminSidebar({ route, navigate, isOpen, onClose }: {
  route: AdminRoute;
  navigate: (r: AdminRoute) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop open"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar admin-sidebar${isOpen ? ' open' : ''}`}>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>

        <div className="brand">
          <div className="brand-mark" style={{ background: 'hsl(38 92% 44%)', color: 'hsl(222 47% 11%)' }}>P</div>
          <div>
            <div className="brand-name">Prospectus</div>
            <div className="brand-sub">Admin console</div>
          </div>
        </div>

        {NAV_GROUPS.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(item => (
              <button
                key={item.route}
                className={`nav${route === item.route ? ' active' : ''}`}
                onClick={() => navigate(item.route)}
              >
                {item.label}
                {item.pill && (
                  <span className={`pill${item.alert ? ' alert' : ''}`}>{item.pill}</span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div className="user-strip" style={{ marginTop: 'auto' }}>
          <div className="avatar" style={{ background: 'hsl(38 92% 44%)', color: 'hsl(222 47% 11%)' }}>T</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Tumi Ndlovu
            </div>
            <div className="caption" style={{ fontSize: '0.6875rem', color: 'hsl(210 40% 92% / 0.6)' }}>
              Founder · Platform admin
            </div>
          </div>
          <Link href="/dashboard" style={{ fontSize: '0.75rem', color: 'hsl(210 40% 92% / 0.7)', whiteSpace: 'nowrap' }}>
            ↪ Student
          </Link>
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function AdminTopbar({ route, onMenuClick }: { route: AdminRoute; onMenuClick: () => void }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="caption">{dateStr}</div>
        <div className="topbar-left greet">{routeGreeting(route)}</div>
      </div>
      <div className="topbar-right">
        <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <span className="health-chip">All systems operational</span>
        <input className="input topbar-search" placeholder="Search platform…" style={{ minWidth: 200 }} />
        <button className="btn btn-outline">Export</button>
        <Link href="/dashboard" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>
          View as student →
        </Link>
      </div>
    </div>
  );
}

// ─── Stub page ────────────────────────────────────────────────────────────────

const STUB_DESCRIPTIONS: Partial<Record<AdminRoute, string>> = {
  health:              'Monitor live service health across all platform components — database, API, CDN, email and AI inference nodes.',
  'institution-admins':'Manage the 142 institution admin accounts across all partner universities and TVET colleges.',
  staff:               'Platform staff directory — 8 internal team members with role-based access control.',
  programmes:          'Full library of 4,247 accredited programmes across 26 partner institutions. Edit, publish, archive.',
  careers:             'SA career catalogue powered by SETA and O*NET data. Curate RIASEC tags and capability mappings.',
  bursaries:           'Manage bursary and scholarship listings. Flag outdated deadlines, sync with NSFAS and funders.',
  reports:             'Generate compliance, engagement and outcome reports for funders, institutions and the board.',
  audit:               'Immutable audit log of all admin actions — content changes, user management, config updates.',
  exports:             'Export student cohort data, application outcomes and platform metrics as CSV or JSON.',
  settings:            'Platform-wide configuration — feature flags, rate limits, email templates, billing and integrations.',
};

function StubPage({ route }: { route: AdminRoute }) {
  const label = routeGreeting(route);
  const desc = STUB_DESCRIPTIONS[route] ?? 'This section is under construction.';
  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="eyebrow">Admin · {label}</div>
        <h1 className="heading">{label}</h1>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="stack-2">
          <div className="subheading">{label}</div>
          <p className="body-text">{desc}</p>
          <p className="caption">This page is scaffolded. Full implementation coming soon.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Overview ───────────────────────────────────────────────────────────

const FUNNEL = [
  { stage: 'Signed up',          n: 12418, pct: 100, color: 'success' },
  { stage: 'Profile completed',  n: 9842,  pct: 79,  color: 'success' },
  { stage: 'Assessment done',    n: 7210,  pct: 58,  color: 'success' },
  { stage: 'Shortlisted',        n: 5804,  pct: 47,  color: 'success' },
  { stage: 'Applied',            n: 3842,  pct: 31,  color: 'warning' },
  { stage: 'Funded',             n: 1240,  pct: 10,  color: 'warning' },
  { stage: 'Enrolled',           n: 612,   pct: 5,   color: 'destructive' },
];

const TOP_INSTS = [
  { name: 'University of the Witwatersrand', students: 3120, status: 'ok'   },
  { name: 'University of Cape Town',         students: 2841, status: 'ok'   },
  { name: 'University of Pretoria',          students: 2210, status: 'ok'   },
  { name: 'Stellenbosch University',         students: 1872, status: 'ok'   },
  { name: 'University of KwaZulu-Natal',     students: 1402, status: 'warn' },
  { name: 'University of Johannesburg',      students: 974,  status: 'ok'   },
];

const HEALTH_SERVICES = [
  { name: 'Supabase DB',        status: 'ok'   },
  { name: 'Next.js API',        status: 'ok'   },
  { name: 'Vercel Edge CDN',    status: 'ok'   },
  { name: 'Sendgrid Email',     status: 'ok'   },
  { name: 'OpenAI GPT-4',       status: 'ok'   },
  { name: 'Google Gemini',      status: 'warn' },
  { name: 'Institution Sync',   status: 'bad'  },
];

const ACTIVITY = [
  { msg: 'Lerato Mokoena completed profile assessment',            when: '4 min ago'  },
  { msg: 'UCT admin updated 14 programme APS requirements',        when: '11 min ago' },
  { msg: 'New bursary: Sasol Foundation Engineering 2027',         when: '28 min ago' },
  { msg: 'Sarah van Wyk submitted UCT application',               when: '42 min ago' },
  { msg: 'AI engine cache cleared — cold start in progress',       when: '1 hr ago'   },
  { msg: 'NSFAS bursary sync completed (partial — 12 flagged)',    when: '5 hrs ago'  },
  { msg: 'TUT sync job failed — retry #3 queued',                  when: '3 hrs ago'  },
];

const SIGNUP_SPARK = [12, 18, 14, 22, 31, 28, 19, 24, 30, 35, 28, 40, 38, 45, 52, 48, 60, 55, 70, 65, 80, 72, 84, 78, 90, 85, 94];
const STUDENT_SPARK = [10200, 10450, 10780, 10940, 11200, 11480, 11720, 11950, 12180, 12418];

function pageOverview() {
  return (
    <div className="page-anim stack-4">
      {/* Alert banner */}
      <div className="alert-bar">
        <span className="dot-alert" />
        <span className="msg">
          <strong>3 active alerts</strong> — TUT sync stalled, NSFAS bursaries outdated, AI engine latency elevated.
        </span>
        <button className="btn btn-sm" style={{ background: 'hsl(var(--destructive))', color: 'white', border: 'none' }}>
          Open 3 alerts →
        </button>
      </div>

      {/* KPIs */}
      <div className="grid-4">
        <div className="card kpi">
          <div className="lbl">Active students</div>
          <div className="val">12,418</div>
          <SparkLine values={STUDENT_SPARK} color="hsl(152 55% 40%)" />
          <div className="hint" style={{ color: 'hsl(var(--success))' }}>+842 in last 30 days</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Applications submitted</div>
          <div className="val">38,420</div>
          <div className="hint" style={{ color: 'hsl(var(--success))' }}>+3,210 in last 7 days</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Funding matched</div>
          <div className="val">R412M</div>
          <div className="hint" style={{ color: 'hsl(var(--success))' }}>+R18M in last 30 days</div>
        </div>
        <div className="card kpi">
          <div className="lbl">AI engine cost</div>
          <div className="val">R142k<span style={{ fontSize: '1rem', fontWeight: 500 }}>/mo</span></div>
          <div className="hint" style={{ color: 'hsl(var(--warning))' }}>+8% MoM ↑ watch</div>
        </div>
      </div>

      {/* Funnel + Top institutions */}
      <div className="grid-2">
        <div className="card">
          <div className="sec"><h3>Application funnel</h3><span className="caption">All students · all time</span></div>
          <div className="funnel">
            {FUNNEL.map(f => (
              <div className="funnel-row" key={f.stage}>
                <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{f.stage}</div>
                <div className="funnel-bar">
                  <div className={`funnel-bar-fill ${f.color}`} style={{ width: `${f.pct}%` }} />
                  <div className="funnel-bar-fill muted" style={{ width: `${100 - f.pct}%` }} />
                </div>
                <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.8125rem', textAlign: 'right' }}>
                  {f.n.toLocaleString()}
                </div>
                <div className="caption" style={{ textAlign: 'right' }}>{f.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="sec"><h3>Top institutions</h3><span className="caption">By student count</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {TOP_INSTS.map(inst => (
                  <tr key={inst.name}>
                    <td style={{ fontWeight: 500 }}>{inst.name}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{inst.students.toLocaleString()}</td>
                    <td><span className={`status-dot ${inst.status}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Health + Signups + Activity */}
      <div className="grid-3">
        <div className="card">
          <div className="sec"><h3>System health</h3></div>
          <div className="stack">
            {HEALTH_SERVICES.map(s => (
              <div key={s.name} className="row-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <span style={{ fontSize: '0.8125rem' }}>{s.name}</span>
                <span className={`status-dot ${s.status}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="sec"><h3>Today's signups</h3><span className="caption" style={{ color: 'hsl(var(--success))' }}>94 new</span></div>
          <SparkLine values={SIGNUP_SPARK} color="hsl(var(--primary))" width={200} height={48} />
          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="row-between caption">
              <span>Top channel</span><span style={{ fontWeight: 600, color: 'hsl(var(--fg))' }}>Organic search</span>
            </div>
            <div className="row-between caption">
              <span>Top province</span><span style={{ fontWeight: 600, color: 'hsl(var(--fg))' }}>Gauteng (38%)</span>
            </div>
            <div className="row-between caption">
              <span>Profile completion</span><span style={{ fontWeight: 600, color: 'hsl(var(--fg))' }}>79%</span>
            </div>
            <div className="row-between caption">
              <span>Assessment conversion</span><span style={{ fontWeight: 600, color: 'hsl(var(--fg))' }}>58%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sec"><h3>Activity feed</h3></div>
          <div className="stack">
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>{a.msg}</div>
                <div className="caption" style={{ marginTop: '0.25rem' }}>{a.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Alerts ─────────────────────────────────────────────────────────────

function pageAlerts() {
  return (
    <div className="page-anim stack-4">
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi">
          <div className="lbl">Destructive</div>
          <div className="val" style={{ color: 'hsl(var(--destructive))' }}>1</div>
          <div className="hint">Open · P1 severity</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Warning</div>
          <div className="val" style={{ color: 'hsl(var(--warning))' }}>2</div>
          <div className="hint">Open · P2 severity</div>
        </div>
        <div className="card kpi">
          <div className="lbl">MTTR</div>
          <div className="val">94<span style={{ fontSize: '1rem', fontWeight: 500 }}> min</span></div>
          <div className="hint">Avg. mean time to resolve</div>
        </div>
      </div>

      <div className="card">
        <div className="sec"><h3>Active alerts</h3><span className="caption">3 open</span></div>
        <div className="stack-2">
          {ALERTS.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1rem', borderRadius: 'var(--r-lg)',
                border: `1px solid hsl(var(--${a.level}) / 0.3)`,
                background: `hsl(var(--${a.level}) / 0.05)`,
              }}
            >
              <span className={`badge ${a.level}`} style={{ flexShrink: 0 }}>
                {a.level === 'destructive' ? 'P1' : 'P2'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{a.title}</div>
                <div className="body-text" style={{ marginTop: '0.25rem' }}>{a.msg}</div>
                <div className="caption" style={{ marginTop: '0.375rem' }}>{a.when}</div>
              </div>
              <button className="btn btn-sm btn-outline">Investigate →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page: Students ───────────────────────────────────────────────────────────

function pageStudents(filter: StudFilter, setFilter: (f: StudFilter) => void) {
  const filtered = STUDENTS.filter(s => {
    if (filter === 'pro') return s.plan === 'Pro';
    if (filter === 'flagged') return s.flags > 0;
    if (filter === 'new') return s.joined.includes('Apr 2026');
    return true;
  });

  return (
    <div className="page-anim stack-4">
      <div className="grid-4">
        <div className="card kpi"><div className="lbl">Active</div><div className="val">9,842</div><div className="hint">Logged in last 30d</div></div>
        <div className="card kpi"><div className="lbl">Pro plan</div><div className="val">1,420</div><div className="hint">11.4% of active</div></div>
        <div className="card kpi"><div className="lbl">First-gen</div><div className="val">7,610</div><div className="hint">61% of active</div></div>
        <div className="card kpi"><div className="lbl">Flagged</div><div className="val" style={{ color: 'hsl(var(--destructive))' }}>12</div><div className="hint">Needs review</div></div>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {(['all', 'pro', 'flagged', 'new'] as StudFilter[]).map(f => (
              <button
                key={f}
                className={`tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'pro' ? 'Pro plan' : f === 'flagged' ? 'Flagged' : 'New (7d)'}
              </button>
            ))}
          </div>
          <button className="btn btn-sm btn-outline">Export CSV</button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>School · Province</th>
                <th>APS</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Last seen</th>
                <th>Flags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                      <span className="av-init" style={{ background: initColor(s.name) }}>{initials(s.name)}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{s.name}</div>
                        <div className="caption">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem' }}>{s.school}</div>
                    <div className="caption">{s.prov}</div>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{s.aps}</td>
                  <td>
                    <span className={`badge ${s.plan === 'Pro' ? 'brand' : 'default'}`}>{s.plan}</span>
                  </td>
                  <td className="caption">{s.joined}</td>
                  <td className="caption">{s.last}</td>
                  <td>
                    {s.flags > 0
                      ? <span className="badge destructive">{s.flags} flag{s.flags > 1 ? 's' : ''}</span>
                      : <span className="caption">—</span>
                    }
                  </td>
                  <td><button className="btn btn-sm btn-outline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Institutions ───────────────────────────────────────────────────────

function pageInstitutions() {
  return (
    <div className="page-anim stack-4">
      <div className="grid-4">
        <div className="card kpi"><div className="lbl">Active</div><div className="val">22</div><div className="hint">Syncing normally</div></div>
        <div className="card kpi"><div className="lbl">Sync pending</div><div className="val" style={{ color: 'hsl(var(--warning))' }}>3</div><div className="hint">Stale &gt; 2 hrs</div></div>
        <div className="card kpi"><div className="lbl">Inactive</div><div className="val" style={{ color: 'hsl(var(--destructive))' }}>1</div><div className="hint">TUT — 3 day lag</div></div>
        <div className="card kpi"><div className="lbl">Programmes total</div><div className="val">4,247</div><div className="hint">Across all institutions</div></div>
      </div>

      <div className="card">
        <div className="sec">
          <h3>All institutions</h3>
          <button className="btn btn-sm btn-outline">+ Add institution</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>City</th>
                <th>Students</th>
                <th>Programmes</th>
                <th>Admins</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Last sync</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {INSTITUTIONS.map((inst) => (
                <tr key={inst.short}>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                      <span className="av-init" style={{ background: initColor(inst.short), width: 32, height: 32, fontSize: '0.75rem' }}>
                        {inst.short.slice(0, 2)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{inst.name}</div>
                        <div className="caption">{inst.short}</div>
                      </div>
                    </div>
                  </td>
                  <td className="caption">{inst.city}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{inst.students.toLocaleString()}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{inst.progs}</td>
                  <td>{inst.admins}</td>
                  <td><span className="badge">{inst.tier === 1 ? 'Tier 1' : 'Tier 2'}</span></td>
                  <td>
                    <div className="row" style={{ gap: '0.375rem', flexWrap: 'nowrap' }}>
                      <span className={`status-dot ${inst.status === 'active' ? 'ok' : inst.status === 'sync' ? 'warn' : 'bad'}`} />
                      <span className="caption">{inst.status === 'active' ? 'Active' : inst.status === 'sync' ? 'Sync' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="caption">{inst.last}</td>
                  <td><button className="btn btn-sm btn-outline">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Moderation ─────────────────────────────────────────────────────────

function pageModeration() {
  return (
    <div className="page-anim stack-4">
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi"><div className="lbl">Programmes</div><div className="val">4</div><div className="hint">Pending review</div></div>
        <div className="card kpi"><div className="lbl">Bursaries</div><div className="val">2</div><div className="hint">Pending review</div></div>
        <div className="card kpi"><div className="lbl">Careers</div><div className="val">1</div><div className="hint">Reported by students</div></div>
      </div>

      <div className="card">
        <div className="sec"><h3>Moderation queue</h3><span className="caption">7 items · sorted by age</span></div>
        <div className="stack-2">
          {MODERATION_QUEUE.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1rem', borderRadius: 'var(--r-lg)',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted) / 0.3)',
              }}
            >
              <span className="badge info" style={{ flexShrink: 0 }}>{item.kind}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.target}</div>
                <div className="body-text" style={{ marginTop: '0.25rem' }}>{item.reason}</div>
                <div className="caption" style={{ marginTop: '0.375rem' }}>{item.when}</div>
              </div>
              <div className="row" style={{ flexWrap: 'nowrap', gap: '0.5rem' }}>
                <button className="btn btn-sm btn-outline">View</button>
                <button className="btn btn-sm" style={{ background: 'hsl(var(--destructive) / 0.1)', color: 'hsl(var(--destructive))', border: '1px solid hsl(var(--destructive) / 0.25)' }}>
                  Reject
                </button>
                <button className="btn btn-sm" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))', border: '1px solid hsl(var(--success) / 0.25)' }}>
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page: AI Engine ──────────────────────────────────────────────────────────

const AI_SPARK = [310, 295, 320, 340, 315, 330, 380, 420, 395, 360, 340, 312];
const CACHE_SPARK = [65, 68, 72, 70, 74, 76, 73, 71, 69, 72, 70, 71.4];

function pageAI() {
  return (
    <div className="page-anim stack-4">
      <div className="grid-4">
        <div className="card kpi">
          <div className="lbl">Requests (30d)</div>
          <div className="val">148,210</div>
          <div className="hint">+12% MoM</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Cache hit rate</div>
          <div className="val" style={{ color: 'hsl(var(--warning))' }}>71.4%</div>
          <div className="hint" style={{ color: 'hsl(var(--warning))' }}>Target 80% — below threshold</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Avg latency</div>
          <div className="val">312<span style={{ fontSize: '1rem', fontWeight: 500 }}>ms</span></div>
          <div className="hint">P95: 890ms</div>
        </div>
        <div className="card kpi">
          <div className="lbl">Cost / 1k requests</div>
          <div className="val">R11.40</div>
          <div className="hint">Total: R142k this month</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="sec"><h3>Model usage</h3><span className="caption">Last 30 days</span></div>
          <div className="stack-2">
            <div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>GPT-4o (primary scoring)</span>
                <span className="caption">82,840 req · R98k</span>
              </div>
              <div className="meter success lg"><i style={{ width: '56%' }} /></div>
            </div>
            <div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Gemini 1.5 Pro (cross-check)</span>
                <span className="caption">65,370 req · R44k</span>
              </div>
              <div className="meter primary lg"><i style={{ width: '44%' }} /></div>
            </div>
            <hr className="divider" />
            <div className="sec" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '0.9375rem' }}>Latency trend (30d)</h3>
            </div>
            <SparkLine values={AI_SPARK} color="hsl(var(--warning))" width={300} height={56} />
            <div className="caption" style={{ textAlign: 'center' }}>ms · lower is better · spike at day 8 = Gemini outage</div>
          </div>
        </div>

        <div className="card">
          <div className="sec"><h3>Cache performance</h3><span className="caption">Redis + in-memory</span></div>
          <SparkLine values={CACHE_SPARK} color="hsl(var(--primary))" width={300} height={56} />
          <div className="caption" style={{ textAlign: 'center', marginBottom: '1rem' }}>Cache hit % · 30-day trend</div>
          <div className="stack-2">
            <div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem' }}>Redis (career scoring)</span>
                <span className="caption" style={{ fontWeight: 600 }}>58.2%</span>
              </div>
              <div className="meter primary"><i style={{ width: '58.2%' }} /></div>
            </div>
            <div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem' }}>In-memory (session)</span>
                <span className="caption" style={{ fontWeight: 600 }}>13.2%</span>
              </div>
              <div className="meter accent"><i style={{ width: '13.2%' }} /></div>
            </div>
            <div>
              <div className="row-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem' }}>Cache miss</span>
                <span className="caption" style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>28.6%</span>
              </div>
              <div className="meter warning"><i style={{ width: '28.6%' }} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [route, setRoute] = useState<AdminRoute>('overview');
  const [studFilter, setStudFilter] = useState<StudFilter>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function renderPage() {
    switch (route) {
      case 'overview':    return pageOverview();
      case 'alerts':      return pageAlerts();
      case 'students':    return pageStudents(studFilter, setStudFilter);
      case 'institutions':return pageInstitutions();
      case 'moderation':  return pageModeration();
      case 'ai':          return pageAI();
      default:            return <StubPage route={route} />;
    }
  }

  return (
    <div className="app">
      <AdminSidebar
        route={route}
        navigate={(r) => { setRoute(r); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <AdminTopbar route={route} onMenuClick={() => setSidebarOpen(true)} />
        {renderPage()}
      </main>
    </div>
  );
}
