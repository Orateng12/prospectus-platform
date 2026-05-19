import type { Route } from '@/lib/types';
import { signOut } from '@/app/actions/auth';

interface SidebarProps {
  route: Route;
  navigate: (r: Route) => void;
  userName?: string;
  userProvince?: string;
  isOpen?: boolean;
  onClose?: () => void;
  pendingAppCount?: number;
  unappliedScholarshipCount?: number;
}

interface NavItem {
  label: string;
  route?: Route;
  pill?: { text: string; variant: 'brand' | 'success' | 'dark' | 'default' };
  dot?: boolean;
}

function buildNavGroups(pendingAppCount: number, unappliedScholarshipCount: number): Array<{ label: string; items: NavItem[] }> {
  return [
    {
      label: 'Plan',
      items: [
        { label: 'Dashboard', route: 'home', dot: true },
        { label: 'APS & Simulator', route: 'simulator' },
        { label: 'Programmes', route: 'programmes' },
        { label: 'Universities', route: 'unis' },
      ],
    },
    {
      label: 'Discover',
      items: [
        { label: 'Career Explorer', route: 'careers' },
        { label: 'Career Compare', route: 'compare' },
        { label: 'Discover', route: 'discover', pill: { text: 'AI', variant: 'brand' as const } },
        { label: 'Opportunity Map', route: 'map' },
      ],
    },
    {
      label: 'Fund',
      items: [
        { label: 'Funding Strategy', route: 'funding' },
        {
          label: 'Scholarships',
          route: 'scholarships',
          ...(unappliedScholarshipCount > 0
            ? { pill: { text: `${unappliedScholarshipCount} new`, variant: 'success' as const } }
            : {}),
        },
        { label: 'NSFAS Calculator', route: 'nsfas' },
      ],
    },
    {
      label: 'Execute',
      items: [
        {
          label: 'Applications',
          route: 'applications',
          ...(pendingAppCount > 0
            ? { pill: { text: String(pendingAppCount), variant: 'default' as const } }
            : {}),
        },
        { label: 'Documents', route: 'documents' },
        { label: 'Deadlines', route: 'deadlines' },
      ],
    },
    {
      label: 'Self',
      items: [
        { label: 'Cognitive Assessment', route: 'cognitive' },
        { label: 'Skills Map', route: 'skills' },
        { label: 'Intelligence', route: 'intelligence', pill: { text: 'PRO', variant: 'dark' as const } },
      ],
    },
  ];
}

export default function Sidebar({ route, navigate, userName = 'Student', userProvince, isOpen, onClose, pendingAppCount = 0, unappliedScholarshipCount = 0 }: SidebarProps) {
  const initial = userName.charAt(0).toUpperCase();
  const caption = userProvince ? `Free plan · ${userProvince}` : 'Free plan';
  const navGroups = buildNavGroups(pendingAppCount, unappliedScholarshipCount);

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <div className="brand-name">Prospectus</div>
          <div className="brand-sub">Student workspace</div>
        </div>
      </div>

      {navGroups.map(group => (
        <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item => (
            <button
              key={item.label}
              className={`nav${item.route && route === item.route ? ' active' : ''}`}
              onClick={() => item.route && navigate(item.route)}
            >
              {item.dot && (
                <span style={{
                  display: 'inline-block', width: 5, height: 5,
                  borderRadius: 999, background: 'hsl(var(--accent))', flexShrink: 0,
                }} />
              )}
              {item.label}
              {item.pill && (
                <span className={`pill ${item.pill.variant}-pill`}>
                  {item.pill.text}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}

      <div className="user-strip" style={{ marginTop: 'auto' }}>
        <div className="avatar">{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: '0.8125rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {userName}
          </div>
          <div className="caption" style={{ fontSize: '0.6875rem' }}>{caption}</div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0 0.5rem', fontSize: '0.75rem' }}
            title="Sign out"
          >
            ↪
          </button>
        </form>
      </div>
    </aside>
  );
}
