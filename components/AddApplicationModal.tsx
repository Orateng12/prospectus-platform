'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Programme } from '@/lib/types';
import { saveApplication } from '@/app/actions/saveApplication';

interface AddApplicationModalProps {
  programmes: Programme[];
  preselectedProg?: Programme;
  onClose: () => void;
  onAdded: (prog: Programme) => void;
}

export default function AddApplicationModal({
  programmes,
  preselectedProg,
  onClose,
  onAdded,
}: AddApplicationModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Programme | null>(preselectedProg ?? null);
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = query.trim()
    ? programmes.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.uni.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 8)
    : programmes.slice(0, 8);

  async function handleAdd() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    const result = await saveApplication(selected.id, selected.name, selected.uni, deadline || undefined);
    setSaving(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      router.refresh();
      onAdded(selected);
      onClose();
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'hsl(var(--bg) / 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: '28rem', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <h3 className="subheading">
            {preselectedProg ? 'Track application' : 'Add application'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {preselectedProg ? (
          <div
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 6,
              background: 'hsl(var(--primary) / 0.08)',
              border: '1px solid hsl(var(--primary) / 0.25)',
              marginBottom: '0.875rem',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{preselectedProg.name}</div>
            <div className="caption" style={{ marginTop: 2 }}>
              {preselectedProg.uni} · APS {preselectedProg.aps} · {preselectedProg.dur} yr
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '0.75rem' }}>
              <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>Search programme or institution</div>
              <input
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. Computer Science, UCT…"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null); }}
                autoFocus
              />
            </div>

            <div className="stack" style={{ marginBottom: '0.875rem', maxHeight: '14rem', overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div className="caption" style={{ padding: '0.5rem', textAlign: 'center' }}>No programmes found.</div>
              )}
              {filtered.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  style={{
                    padding: '0.5rem 0.625rem',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selected?.id === p.id ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    border: selected?.id === p.id ? '1px solid hsl(var(--primary) / 0.4)' : '1px solid transparent',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                  <div className="caption" style={{ fontSize: '0.75rem' }}>{p.uni} · APS {p.aps}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <div className="caption" style={{ fontSize: '0.6875rem', marginBottom: '0.25rem' }}>Application deadline (optional)</div>
          <input
            className="input"
            type="date"
            style={{ width: '100%' }}
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <div className="caption" style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
            Setting a deadline shows it on your Deadlines page.
          </div>
        </div>

        {error && <p style={{ color: 'hsl(var(--destructive))', fontSize: '0.8125rem', marginBottom: '0.625rem' }}>{error}</p>}

        <div className="row" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!selected || saving}
            onClick={handleAdd}
          >
            {saving ? 'Adding…' : 'Track application'}
          </button>
        </div>
      </div>
    </div>
  );
}
