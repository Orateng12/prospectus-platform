'use client';

import { useState } from 'react';
import type { Route, DbNotification } from '@/lib/types';

interface NotificationsPageProps {
  navigate: (r: Route) => void;
  notifications?: DbNotification[];
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  deadline:    'hsl(38 92% 50%)',
  scholarship: 'hsl(152 55% 38%)',
  application: 'hsl(212 72% 45%)',
  funding:     'hsl(262 70% 50%)',
  system:      'hsl(var(--muted-foreground))',
};

const TYPE_ICONS: Record<string, string> = {
  deadline:    '📅',
  scholarship: '🏆',
  application: '📝',
  funding:     '💰',
  system:      '✦',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

const DEMO_NOTIFICATIONS: DbNotification[] = [
  {
    id: 'demo-1',
    type: 'deadline',
    title: 'UCT application closes in 7 days',
    message: 'The UCT 2025 application deadline is 31 July. Submit your supporting documents now to avoid delays.',
    link: 'applications',
    read: false,
    priority: 'high',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-2',
    type: 'scholarship',
    title: 'Allan Gray bursary — 92% match',
    message: 'You have a strong match for the Allan Gray Orbis Foundation bursary (R280 000/yr). Application closes 15 Oct.',
    link: 'scholarships',
    read: false,
    priority: 'high',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'demo-3',
    type: 'application',
    title: 'Wits application status updated',
    message: 'Your BSc Computer Science application at Wits has moved to "Under Review". No action needed yet.',
    link: 'applications',
    read: true,
    priority: 'medium',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  },
  {
    id: 'demo-4',
    type: 'funding',
    title: 'NSFAS applications open',
    message: 'NSFAS applications for 2026 are now open. Based on your household income, you are eligible. Apply early.',
    link: 'nsfas',
    read: true,
    priority: 'medium',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
];

export default function NotificationsPage({ navigate, notifications, onMarkAllRead, onDismiss }: NotificationsPageProps) {
  const items = (notifications && notifications.length > 0) ? notifications : DEMO_NOTIFICATIONS;
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set(items.filter(n => n.read).map(n => n.id)));

  const visible = items.filter(n => !dismissed.has(n.id));
  const unreadCount = visible.filter(n => !readSet.has(n.id)).length;

  function handleDismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]));
    onDismiss?.(id);
  }

  function handleMarkAllRead() {
    setReadSet(new Set(items.map(n => n.id)));
    onMarkAllRead?.();
  }

  function handleViewLink(link?: string) {
    if (link) navigate(link as Route);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="breadcrumb">Workspace · Notifications</div>
        <div className="row-between">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Notifications</h2>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔔</div>
          <div className="subheading">You're all caught up</div>
          <p className="body-text" style={{ marginTop: '0.5rem' }}>No new notifications.</p>
        </div>
      ) : (
        <div className="stack-3">
          {visible.map(n => {
            const isRead = readSet.has(n.id);
            const color = TYPE_COLORS[n.type] ?? TYPE_COLORS.system;
            const icon = TYPE_ICONS[n.type] ?? '✦';
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  borderLeft: `3px solid ${isRead ? 'hsl(var(--border))' : color}`,
                  opacity: isRead ? 0.8 : 1,
                  display: 'flex',
                  gap: '0.875rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isRead ? 'hsl(var(--muted))' : `${color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    {!isRead && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                          display: 'inline-block',
                        }}
                      />
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{n.title}</span>
                  </div>
                  <p className="body-text" style={{ margin: 0, marginBottom: '0.5rem' }}>{n.message}</p>
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <span className="caption">{timeAgo(n.created_at)}</span>
                    {n.link && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', height: '1.625rem' }}
                        onClick={() => handleViewLink(n.link)}
                      >
                        View →
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', height: '1.625rem', marginLeft: 'auto', color: 'hsl(var(--muted-foreground))' }}
                      onClick={() => handleDismiss(n.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
