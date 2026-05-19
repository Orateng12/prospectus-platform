'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const values = [
  {
    icon: '🎯',
    title: 'Radical clarity',
    desc: 'Every student deserves to know exactly where they stand — no vague advice, no guesswork. We show you the numbers.',
  },
  {
    icon: '🌍',
    title: 'Built for South Africa',
    desc: 'NSC marks, APS calculations, NSFAS eligibility, TVET pathways — we work with the SA system as it actually exists.',
  },
  {
    icon: '🆓',
    title: 'Free, always',
    desc: 'The students who need this most can\'t afford to pay for it. That\'s why every feature is free, with no strings attached.',
  },
  {
    icon: '🧠',
    title: 'Whole-person matching',
    desc: 'Academic eligibility is just the start. We factor in personality, aptitude, and the economy to match you to careers that fit.',
  },
  {
    icon: '📍',
    title: 'No student left behind',
    desc: 'Rural students, first-generation applicants, TVET leavers — Prospectus works for every student in every province.',
  },
  {
    icon: '🔒',
    title: 'Privacy by default',
    desc: 'Your marks and personal data stay yours. We are POPIA-compliant and never sell your information.',
  },
];

const problems = [
  {
    icon: '📄',
    title: 'University prospectuses are 200 pages long',
    desc: 'Students spend weeks reading documents just to find the programmes they qualify for — if they read them at all.',
  },
  {
    icon: '🔢',
    title: 'APS calculations are error-prone',
    desc: 'Most students calculate their APS wrong. The stakes are too high for a formula mistake to cost you a place.',
  },
  {
    icon: '💸',
    title: 'Bursaries go unclaimed every year',
    desc: 'Billions in funding go unclaimed because students don\'t know the bursaries exist or don\'t know they qualify.',
  },
  {
    icon: '🧭',
    title: 'Career guidance is scarce',
    desc: 'Most SA schools have one under-resourced counsellor for hundreds of learners. The guidance gap is real.',
  },
];

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="mkt-page landing">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="landing-logo">
          Prospectus<span className="dot-accent">.</span>
        </Link>
        <div className="landing-nav-links">
          <Link href="/about" className="btn-nav-ghost" style={{ color: 'hsl(var(--fg))' }}>About</Link>
          <Link href="/pricing" className="btn-nav-ghost">Pricing</Link>
          <Link href="/login" className="btn-nav-ghost">Sign in</Link>
          <Link href="/signup" className="btn-nav-dark">Get started</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="mkt-hero">
        <div className="landing-container">
          <p className="section-eyebrow mkt-hero-eyebrow">Our mission</p>
          <h1 className="mkt-hero-headline">
            Every SA student<br />deserves a clear path.
          </h1>
          <p className="mkt-hero-body">
            South Africa has 89 universities and colleges, 1 600+ programmes, and millions of
            students navigating the application process with limited guidance. Prospectus exists
            to change that.
          </p>
        </div>
      </div>

      {/* ── The problem ─────────────────────────────────────── */}
      <section className="mkt-section-alt">
        <div className="landing-container">
          <div className="about-problem-grid">
            <div>
              <p className="section-eyebrow">The problem</p>
              <h2 className="section-headline">
                The system is hard<br />to navigate alone.
              </h2>
              <p className="section-body">
                Applying to university in South Africa means dealing with complex eligibility
                rules, scattered information, and almost no personal guidance — at exactly the
                wrong moment.
              </p>
            </div>
            <div className="about-problem-list">
              {problems.map(p => (
                <div key={p.title} className="about-problem-item">
                  <span className="about-problem-icon">{p.icon}</span>
                  <p className="about-problem-text">
                    <strong>{p.title}</strong>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What we believe ─────────────────────────────────── */}
      <section className="mkt-section">
        <div className="landing-container">
          <div className="mkt-centered">
            <p className="section-eyebrow">What we believe</p>
            <h2 className="section-headline">
              Our principles.
            </h2>
            <p className="section-body">
              We build Prospectus around a small set of ideas we refuse to compromise on.
            </p>
          </div>
          <div className="about-values-grid">
            {values.map(v => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <p className="about-value-title">{v.title}</p>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="mkt-section-dark">
        <div className="landing-container">
          <div className="cta-inner">
            <p className="cta-eyebrow">Get started</p>
            <h2 className="cta-headline" style={{ color: 'white' }}>
              See where your results<br />can take you.
            </h2>
            <p className="cta-body">
              Enter your marks. Get your full eligibility report in 2 minutes. No account needed.
            </p>
            <div className="cta-cta-row">
              <Link href="/signup" className="btn-cta-primary">Start for free →</Link>
              <Link href="/" className="btn-cta-outline">Back to home</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-bottom" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <Link href="/" className="footer-brand-logo" style={{ textDecoration: 'none' }}>
              Prospectus<span style={{ color: 'hsl(var(--amber))' }}>.</span>
            </Link>
            <p className="footer-copy">© {new Date().getFullYear()} Prospectus. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
