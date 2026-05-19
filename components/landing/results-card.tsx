'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppWindowCard, { Section, StatsStrip } from './app-window-card';

type Status = 'scanning' | 'live' | 'loading' | 'error';

interface EligibilityResultsCardProps {
  animated?: boolean;
}

const mockSubjects = [
  { name: 'Mathematics', pct: 72 },
  { name: 'Physical Science', pct: 68 },
  { name: 'English HL', pct: 65 },
  { name: 'Life Orientation', pct: 80 },
];

const mockMatches = [
  { prog: 'BSc Engineering', inst: 'Wits University', aps: 32 },
  { prog: 'BSc Computer Science', inst: 'UCT', aps: 30 },
  { prog: 'BCom', inst: 'Stellenbosch University', aps: 28 },
];

const panelStats = [
  { num: 47, label: 'Programmes' },
  { num: 23, label: 'Universities' },
  { num: 8, label: 'Bursaries' },
];

export default function EligibilityResultsCard({ animated = false }: EligibilityResultsCardProps) {
  const [status, setStatus] = useState<Status>('scanning');

  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setStatus('live'), 2500);
    return () => clearTimeout(t);
  }, [animated]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating AI-Matched badge */}
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.85 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.9 }}
        style={{
          position: 'absolute',
          top: '-0.75rem',
          right: '-0.75rem',
          zIndex: 20,
          background: 'hsl(var(--accent))',
          color: 'white',
          padding: '0.375rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        ✦ AI-Matched
      </motion.div>

      {/* Card with spring entry */}
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.97, y: 8 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 1, delay: 0.15 }}
      >
        <AppWindowCard status={status}>
          {/* Section 1 — Matric results */}
          <Section label="Matric results">
            {mockSubjects.map((s, i) => (
              <motion.div
                key={s.name}
                className="hero-panel-subject"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.55 + i * 0.08 }}
              >
                <span className="hero-panel-subject-name">{s.name}</span>
                <div className="hero-panel-bar-row">
                  <div className="hero-panel-bar-wrap">
                    <motion.div
                      className="hero-panel-bar-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ delay: 0.75 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: 'hsl(220 92% 7%)' }}
                    />
                  </div>
                  <span className="hero-panel-subject-pts">{s.pct}%</span>
                </div>
              </motion.div>
            ))}
          </Section>

          {/* Stats strip */}
          <StatsStrip stats={panelStats} delay={1.5} />

          {/* Section 2 — Top matches */}
          <Section label="Top matches">
            {mockMatches.map((m, i) => (
              <motion.div
                key={m.prog}
                className="hero-panel-match"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 1.1 + i * 0.08 }}
              >
                <div className="hero-panel-match-left">
                  <span className="hero-panel-match-prog">{m.prog}</span>
                  <span className="hero-panel-match-inst">{m.inst}</span>
                </div>
                <div className="hero-panel-match-right">
                  <span className="hero-panel-match-aps">{m.aps}</span>
                  <span className="hero-panel-match-green" aria-hidden="true" />
                </div>
              </motion.div>
            ))}
          </Section>
        </AppWindowCard>
      </motion.div>
    </div>
  );
}
