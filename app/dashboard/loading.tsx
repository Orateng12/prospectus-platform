export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'hsl(var(--bg))', overflow: 'hidden' }}>
      {/* Sidebar skeleton */}
      <aside style={{ width: 220, flexShrink: 0, padding: '1.5rem 1rem', borderRight: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: 36, borderRadius: 8, marginBottom: '0.5rem' }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 32, borderRadius: 8, opacity: 1 - i * 0.08 }} />
        ))}
      </aside>

      {/* Main area */}
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Topbar skeleton */}
        <div className="skeleton" style={{ height: 56, borderRadius: 'var(--r-xl)' }} />

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 'var(--r-lg)' }} />
          ))}
        </div>

        {/* Two-column content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem', flex: 1 }}>
          <div className="skeleton" style={{ borderRadius: 'var(--r-lg)', minHeight: 320 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ borderRadius: 'var(--r-lg)', flex: 1 }} />
            <div className="skeleton" style={{ borderRadius: 'var(--r-lg)', height: 140 }} />
          </div>
        </div>
      </main>
    </div>
  );
}
