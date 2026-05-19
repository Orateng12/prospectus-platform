'use client';

import React from 'react';
import CountUp from './count-up';

type Status = 'scanning' | 'live' | 'loading' | 'error';

interface AppWindowCardProps {
  status?: Status;
  children?: React.ReactNode;
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

interface StatItem {
  num: number;
  label: string;
}

interface StatsStripProps {
  stats: StatItem[];
  delay?: number;
}

const STATUS_CONFIG: Record<Status, { dot: string; animClass: string; label: string; textClass: string }> = {
  scanning: {
    dot: '#60a5fa',
    animClass: 'animate-bounce',
    label: 'Scanning...',
    textClass: 'hero-panel-scanning',
  },
  live: {
    dot: 'hsl(var(--success))',
    animClass: 'hero-panel-status-dot-pulse',
    label: 'Live',
    textClass: 'hero-panel-live',
  },
  loading: {
    dot: '#fcd34d',
    animClass: 'animate-pulse',
    label: 'Loading…',
    textClass: 'hero-panel-loading',
  },
  error: {
    dot: '#fca5a5',
    animClass: '',
    label: 'Error',
    textClass: 'hero-panel-error',
  },
};

export function Section({ label, children }: SectionProps) {
  return (
    <div className="hero-panel-section">
      <p className="hero-panel-section-label">{label}</p>
      {children}
    </div>
  );
}

export function StatsStrip({ stats, delay = 0 }: StatsStripProps) {
  return (
    <div className="hero-panel-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="hero-panel-stat">
          <span className="hero-panel-stat-num">
            <CountUp from={0} to={stat.num} duration={1} delay={delay} />
          </span>
          <span className="hero-panel-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AppWindowCard({ status = 'live', children }: AppWindowCardProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="hero-panel">
      {/* Chrome header */}
      <div className="hero-panel-chrome">
        <div className="hero-panel-chrome-left">
          <div className="hero-panel-traffic" aria-hidden="true">
            <span className="hero-panel-dot hero-panel-dot-red" />
            <span className="hero-panel-dot hero-panel-dot-amber" />
            <span className="hero-panel-dot hero-panel-dot-green" />
          </div>
          <span className="hero-panel-title">eligibility-report.prospectus</span>
        </div>
        <div className="hero-panel-status">
          <span
            className={cfg.animClass}
            style={{
              display: 'inline-block',
              width: '0.375rem',
              height: '0.375rem',
              borderRadius: '50%',
              background: cfg.dot,
            }}
            aria-hidden="true"
          />
          <span className={cfg.textClass} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
