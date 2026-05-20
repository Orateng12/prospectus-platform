'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route, DbNotification } from '@/lib/types';
import { markNotificationsRead } from '@/app/actions/markNotificationsRead';

interface NotificationsPageProps {
  notifications: DbNotification[];
  navigate: (r: Route) => void;
}

const TYPE_CONFIG: Record<string, { icon: string; cls: string }> = {
  deadline:    { icon: '⏰', cls: 'warning' },
  eligibility: { icon: '✓',  cls: 'success' },
  application: { icon: '📋', cls: 'info' },
  scholarship: { icon: '🎓', cls: 'brand' },
  info:        { icon: 'ℹ',  cls: 'muted' },
};

function typeConfig(type: string) {
  return TYPE_CONFIG[type.toLowerCase()] ?? { icon: '🔔', cls: 'muted' };
}

function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export default function NotificationsPage({ notifications, navigate }: NotificationsPageProps) {
  const router = useRouter();
  const [localRead, setLocalRead] = useState<Set<string>>(
    () => new Set(notifications.filter(n => n.read).map(n => n.id))
  );
  const [marking, setMarking] = useState(false);

  const unread = notifications.filter(n => !localRead.has(n.id));
  const read   = notifications.filter(n =>  localRead.has(n.id));

  async function markOne(id: string) {
    setLocalRead(prev => new Set([...prev, id]));
    await markNotificationsRead([id]);
    router.refresh();
  }

  async function markAll() {
    if (marking) return;
    setMarking(true);
    setLocalRead(new Set(notifications.map(n => n.id)));
    await markNotificationsRead();
    router.refresh();
    setMarking(false);
  }

  const [showAllRead, setShowAllRead] = useState(false);
  const visibleRead = showAllRead ? read : read.slice(0, 5);

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Dashboard · Notifications</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Activity feed</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Notifications</h2>
          </div>
          {unread.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={markAll}
              disabled={marking}
              style={{ opacity: marking ? 0.6 : 1 }}
            >
              {marking ? 'Marking…' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✓</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>You're all caught up</div>
          <div className="caption" style={{ marginTop: '0.375rem' }}>
            No notifications yet. We'll let you know about deadlines, eligibility updates, and application changes.
          </div>
        </div>
      )}

      {unread.length > 0 && (
        <div className="stack" style={{ marginBottom: '1.5rem' }}>
          <div className="eyebrow" style={{ paddingLeft: '0.25rem' }}>
            Unread · {unread.length}
          </div>
          {unread.map(n => {
            const { icon, cls } = typeConfig(n.type);
            return (
              <div
                key={n.id}
                className="card"
                style={{ borderLeft: `3px solid hsl(var(--${cls === 'muted' ? 'border' : cls}))`, padding: '0.875rem 1rem' }}
              >
                <div className="row-between" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div className="row" style={{ gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                    <span style={{ fontSize: '1.125rem', lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.title}</div>
                      <div className="body-text" style={{ marginTop: '0.25rem', fontSize: '0.8125rem' }}>{n.message}</div>
                      <div className="caption" style={{ marginTop: '0.375rem' }}>
                        {relativeTime(n.created_at)}
                        {n.priority === 'high' && (
                          <span className="badge destructive" style={{ marginLeft: '0.5rem', fontSize: '0.6875rem' }}>Urgent</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: '0.5rem', flexShrink: 0 }}>
                    {n.link && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(n.link as Route)}
                      >
                        View →
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => markOne(n.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {read.length > 0 && (
        <div className="stack">
          <div className="eyebrow" style={{ paddingLeft: '0.25rem', color: 'hsl(var(--muted-fg))' }}>
            Read · {read.length}
          </div>
          {visibleRead.map(n => {
            const { icon } = typeConfig(n.type);
            return (
              <div
                key={n.id}
                className="card"
                style={{ opacity: 0.6, padding: '0.75rem 1rem' }}
              >
                <div className="row" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{n.title}</div>
                    <div className="caption" style={{ marginTop: '0.125rem' }}>{n.message}</div>
                  </div>
                  <div className="caption" style={{ flexShrink: 0 }}>{relativeTime(n.created_at)}</div>
                </div>
              </div>
            );
          })}
          {!showAllRead && read.length > 5 && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'center' }}
              onClick={() => setShowAllRead(true)}
            >
              Show {read.length - 5} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
