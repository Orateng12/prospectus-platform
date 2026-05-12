'use client';

import type { CompareItem, Route } from '@/lib/types';

interface CompareDrawerProps {
  items: CompareItem[];
  onToggle: (item: CompareItem) => void;
  onClear: () => void;
  navigate: (r: Route) => void;
}

export default function CompareDrawer({ items, onToggle, onClear, navigate }: CompareDrawerProps) {
  if (items.length === 0) return null;

  return (
    <div className={`compare-drawer${items.length > 0 ? ' open' : ''}`}>
      <div className="cd-head">
        <span className="badge brand">{items.length} · compare</span>
        <span className="caption" style={{ flex: 1 }}>Mix programmes, careers &amp; unis · max 4</span>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear</button>
      </div>
      <div className="cd-list">
        {items.map(c => (
          <div key={c.id} className="cd-chip">
            <span className="cd-k">{c.kind}</span>
            <span>{c.name}</span>
            <button onClick={() => onToggle(c)} aria-label={`Remove ${c.name}`}>×</button>
          </div>
        ))}
        {Array.from({ length: 4 - items.length }, (_, i) => (
          <div key={`empty-${i}`} className="cd-chip empty">+ add</div>
        ))}
      </div>
      <button className="btn btn-primary btn-sm" onClick={() => navigate('compare')}>
        Open compare →
      </button>
    </div>
  );
}
