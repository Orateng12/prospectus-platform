export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'hsl(var(--muted) / 0.4)',
      padding: '1.5rem',
    }}>
      {children}
    </div>
  );
}
