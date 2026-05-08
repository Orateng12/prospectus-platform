import Link from 'next/link';

const features = [
  {
    icon: '🎯',
    title: 'APS Calculator',
    desc: 'Enter your subject marks and instantly see your Admission Point Score — and every university programme you qualify for.',
  },
  {
    icon: '🏛️',
    title: '1 600+ Programmes',
    desc: 'Search and filter across 89 South African universities and colleges, from Bachelor degrees to TVET diplomas.',
  },
  {
    icon: '🧠',
    title: 'Career Matching',
    desc: 'Your personality, aptitude, and market demand — combined into a ranked list of careers that fit who you are.',
  },
  {
    icon: '📊',
    title: 'Strategic Score',
    desc: 'A single 0–100 score across academic readiness, financial feasibility, global mobility, and skill readiness.',
  },
  {
    icon: '💸',
    title: 'Funding Explorer',
    desc: 'NSFAS, bursaries, and scholarships matched to your profile, province, and chosen field of study.',
  },
  {
    icon: '📋',
    title: 'Application Tracker',
    desc: 'Track every application — deadlines, outcomes, and next steps — in one place.',
  },
];

const steps = [
  { num: '01', title: 'Enter your subjects', body: 'Add your NSC subjects and marks. We calculate your APS in real time.' },
  { num: '02', title: 'Explore your options', body: 'See every programme you qualify for, sorted by fit, fees, and career demand.' },
  { num: '03', title: 'Build your strategy', body: 'Review your Strategic Score, career matches, and funding options — then apply.' },
];

const stats = [
  { val: '89', label: 'Universities & Colleges' },
  { val: '1 600+', label: 'Programmes' },
  { val: '42', label: 'Career Paths Tracked' },
  { val: 'Free', label: 'Always' },
];

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="landing-nav">
        <span className="landing-logo">Prospectus<span className="dot-accent">.</span></span>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-outline btn-sm">Sign in</Link>
          <Link href="/signup" className="btn btn-brand btn-sm">Get started free</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero">
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>Built for South African matrics</p>
        <h1 className="display" style={{ maxWidth: 700, textAlign: 'center', lineHeight: 1.1 }}>
          Find the right degree.<br />Build the right future.
        </h1>
        <p className="body-text hero-sub">
          Prospectus turns your matric marks into a personalised university roadmap —
          programmes you qualify for, careers that match, and funding that fits.
        </p>
        <div className="row" style={{ gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link href="/signup" className="btn btn-brand btn-lg">Start for free</Link>
          <Link href="/login" className="btn btn-outline btn-lg">Sign in</Link>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <div className="stats-bar">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-num" style={{ fontSize: '1.75rem' }}>{s.val}</span>
            <span className="caption">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="landing-section">
        <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Everything you need</p>
        <h2 className="heading" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>One platform, every step of the journey</h2>
        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="card">
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <p className="subheading" style={{ marginBottom: '0.375rem' }}>{f.title}</p>
              <p className="body-text">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="landing-section landing-section--muted">
        <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>How it works</p>
        <h2 className="heading" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Three steps to your university plan</h2>
        <div className="grid-3">
          {steps.map(s => (
            <div key={s.num} className="step-card">
              <span className="step-num">{s.num}</span>
              <p className="subheading" style={{ marginBottom: '0.375rem' }}>{s.title}</p>
              <p className="body-text">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="landing-section cta-section">
        <h2 className="heading" style={{ color: '#fff', textAlign: 'center', marginBottom: '0.75rem' }}>
          Your future starts with one click.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '2rem', fontSize: '1rem' }}>
          Free to use. No subscription. No credit card.
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: '0.75rem' }}>
          <Link href="/signup" className="btn btn-lg" style={{ background: '#fff', color: 'hsl(var(--primary))' }}>
            Create your account
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="landing-footer">
        <span className="landing-logo" style={{ fontSize: '1rem' }}>Prospectus<span className="dot-accent">.</span></span>
        <span className="caption">© {new Date().getFullYear()} · Helping every South African matric find their path.</span>
      </footer>

    </div>
  );
}
