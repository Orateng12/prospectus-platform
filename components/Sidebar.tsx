import type { Route } from '@/lib/types';
import { signOut } from '@/app/actions/auth';

interface SidebarProps {
  route: Route;
  navigate: (r: Route) => void;
  userName?: string;
  userProvince?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  route?: Route;
  pill?: { text: string; variant: 'brand' | 'success' | 'dark' | 'default' };
  dot?: boolean;
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
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
    ],
  },
  {
    label: 'Fund',
    items: [
      { label: 'Funding Strategy', route: 'funding' },
      { label: 'Scholarships', route: 'scholarships', pill: { text: '3 new', variant: 'success' } },
    ],
  },
  {
    label: 'Execute',
    items: [
      { label: 'Applications', route: 'applications', pill: { text: '4', variant: 'default' } },
    ],
  },
  {
    label: 'Self',
    items: [
      { label: 'Profile', route: 'profile' },
      { label: 'Assessment', route: 'cognitive' },
      { label: 'Intelligence', route: 'intelligence', pill: { text: 'PRO', variant: 'dark' } },
    ],
  },
];

export default function Sidebar({ route, navigate, userName = 'Student', userProvince, isOpen, onClose }: SidebarProps) {
  const initial = userName.charAt(0).toUpperCase();
  const caption = userProvince ? `Free plan · ${userProvince}` : 'Free plan';

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

      {NAV_GROUPS.map(group => (
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
