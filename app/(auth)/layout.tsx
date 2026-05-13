export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-split">
      {/* Left brand panel — hidden on mobile */}
      <div className="auth-panel-left">
        <span style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'hsl(var(--chalk))' }}>
          Prospectus<span style={{ color: 'hsl(var(--amber))' }}>.</span>
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p className="kicker-ink">For South African matrics</p>
          <p className="display-ink">
            Your marks.<br />Your options.<br />Your future.
          </p>
          <p className="lede-ink">
            1&thinsp;600+ programmes. 89 institutions. One free platform.
          </p>
        </div>

        <p style={{ color: 'hsl(var(--chalk) / 0.25)', fontSize: '0.75rem' }}>
          Trusted by South African matrics
        </p>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        {children}
      </div>
    </div>
  );
}
