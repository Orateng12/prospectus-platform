'use client';

import { useState, useEffect, useTransition } from 'react';
import type { InsightContext } from '@/lib/types';
import { getInsight } from '@/app/actions/getInsight';
import { dismissInsight } from '@/app/actions/dismissInsight';

interface AiInsightCardProps {
  context: InsightContext;
  navigate?: (r: string) => void;
}

export default function AiInsightCard({ context, navigate }: AiInsightCardProps) {
  const [text, setText] = useState<string | null>(null);
  const [insightId, setInsightId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function load(force = false) {
    setError(null);
    startTransition(async () => {
      const result = await getInsight(context, force);
      if ('error' in result) {
        setError(result.error);
      } else {
        setText(result.text);
        setInsightId(result.id);
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDismiss() {
    if (insightId) {
      startTransition(async () => {
        await dismissInsight(insightId);
        setDismissed(true);
        setText(null);
        setInsightId(undefined);
      });
    } else {
      setDismissed(true);
      setText(null);
    }
  }

  if (dismissed) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="eyebrow"><span className="dot" />AI insight · dismissed</div>
        <p className="body-text" style={{ fontSize: '0.875rem' }}>Insight dismissed.</p>
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => { setDismissed(false); load(true); }}>
          ↻ Generate new insight
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: '0.25rem' }}>
        <div className="eyebrow"><span className="dot" />AI insight · {isPending ? 'generating…' : (insightId ? 'cached' : 'live')}</div>
        {text && !isPending && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDismiss}
            style={{ fontSize: '0.6875rem', padding: '0.125rem 0.375rem' }}
            title="Dismiss this insight"
          >
            ✕
          </button>
        )}
      </div>

      {isPending && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="skeleton" style={{ height: '0.875rem', width: '100%', borderRadius: 4, marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '0.875rem', width: '85%', borderRadius: 4, marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '0.875rem', width: '70%', borderRadius: 4 }} />
        </div>
      )}

      {!isPending && error && (
        <p style={{ margin: '0.5rem 0 0', color: 'hsl(var(--destructive))', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}

      {!isPending && text && (
        <p style={{
          margin: '0.5rem 0 0',
          color: 'hsl(var(--fg))',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          animation: 'fadeIn 0.4s ease',
        }}>
          {text}
        </p>
      )}

      <div className="row" style={{ marginTop: '0.75rem' }}>
        {navigate && (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('programmes')}>See programmes</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('intelligence')}>Why this?</button>
          </>
        )}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => load(true)}
          disabled={isPending}
          style={{ marginLeft: navigate ? 'auto' : undefined }}
        >
          {isPending ? 'Generating…' : '↻ Regenerate'}
        </button>
      </div>

      <hr className="divider" />
      <div className="caption" style={{ fontSize: '0.6875rem' }}>
        Claude · Anthropic ·{' '}
        {navigate && (
          <button
            onClick={() => navigate('intelligence')}
            style={{ color: 'hsl(var(--primary))', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontSize: 'inherit' }}
          >
            how the engine works →
          </button>
        )}
      </div>
    </div>
  );
}
