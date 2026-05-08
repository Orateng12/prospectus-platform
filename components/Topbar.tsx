'use client';

import { useEffect, useState } from 'react';
import type { Route } from '@/lib/types';

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
};

interface TopbarProps {
  route: Route;
  userFirstName?: string;
}

export default function Topbar({ route, userFirstName = 'there' }: TopbarProps) {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    const weekday = d.toLocaleDateString('en-ZA', { weekday: 'long' });
    const dayMonth = d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' });
    setDateStr(`${weekday} · ${dayMonth}`);
  }, []);

  const greetTpl = GREET_TEMPLATE[route];
  const greet = typeof greetTpl === 'function' ? greetTpl(userFirstName) : greetTpl;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="caption">{dateStr}</div>
        <div className="greet">{greet}</div>
      </div>
      <div className="topbar-right">
        <input className="input" placeholder="Search programmes, careers, funding…" style={{ minWidth: 0, flex: 1 }} />
        <button className="btn btn-outline">⌘K</button>
        <button className="btn btn-primary">Apply now</button>
      </div>
    </div>
  );
}
