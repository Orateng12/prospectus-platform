'use client';

import type { CompareItem, Route } from '@/lib/types';
import { PROGRAMMES, CAREERS, UNIS, SCHOLARSHIPS } from '@/lib/data';
import { fmtR } from '@/lib/utils';

interface CompareDrawerProps {
  items: CompareItem[];
  onToggle: (item: CompareItem) => void;
  onClear: () => void;
  navigate: (r: Route) => void;
}

function getSubtitle(item: CompareItem): string {
  if (item.kind === 'career') {
    const c = CAREERS.find(x => x.name === item.id);
    return c ? `${c.match}% match · ${fmtR(c.salary)}/mo` : 'Career';
  }
  if (item.kind === 'prog') {
    const p = PROGRAMMES.find(x => x.id === item.id);
    return p ? `APS ${p.aps} · ${fmtR(p.fees)}/yr` : 'Programme';
  }
  if (item.kind === 'uni') {
    const u = UNIS.find(x => x.short === item.id);
    return u ? `Rank #${u.rank} · ${u.city}` : 'University';
  }
  if (item.kind === 'scholarship') {
    const s = SCHOLARSHIPS.find(x => x.name === item.id);
    return s ? `${fmtR(s.amount)}/yr · ${s.match}% match` : 'Scholarship';
  }
  return '';
}

const KIND_LABEL: Record<CompareItem['kind'], string> = {
  prog: 'Prog',
  career: 'Career',
  uni: 'Uni',
  scholarship: 'Bursary',
};

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
            <span className="cd-k">{KIND_LABEL[c.kind]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
              <div className="caption" style={{ fontSize: '0.625rem', marginTop: 1 }}>{getSubtitle(c)}</div>
            </div>
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
