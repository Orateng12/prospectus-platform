'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const features = [
  {
    icon: '🎯',
    title: 'APS Calculator',
    desc: 'Enter your subject marks and instantly see your Admission Point Score — and every programme you qualify for.',
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
    title: 'Funding Hub',
    desc: 'NSFAS, bursaries, and scholarships matched to your profile, province, and chosen field of study.',
  },
  {
    icon: '📋',
    title: 'Application Tracker',
    desc: 'Track every application — deadlines, outcomes, and next steps — in one place.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Enter your results',
    desc: 'Add your NSC subjects and marks. We calculate your APS in real time and unlock your full programme landscape.',
  },
  {
    num: '02',
    title: 'Get your personalised report',
    desc: 'See every programme you qualify for, every institution in range, every bursary matched to your profile — in one clear view.',
  },
  {
    num: '03',
    title: 'Apply with a clear plan',
    desc: 'Track applications, manage deadlines, and move forward knowing every option is accounted for.',
  },
];

const stats = [
  { val: '89', label: 'Universities & Colleges' },
  { val: '1 600+', label: 'Programmes' },
  { val: '42', label: 'Career Paths' },
  { val: 'Free', label: 'Always' },
];

const INSTITUTIONS = [
  'University of the Witwatersrand', 'University of Cape Town',
  'Stellenbosch University', 'University of KwaZulu-Natal',
  'University of Pretoria', 'University of the Free State',
  'North-West University', 'UNISA', 'Rhodes University',
  'University of Johannesburg', 'Durban University of Technology',
  'Tshwane University of Technology', 'Cape Peninsula University of Technology',
  'Walter Sisulu University', 'University of Limpopo', 'University of Venda',
];

const mockSubjects = [
  { name: 'Mathematics', pts: 6 },
  { name: 'Physical Sciences', pts: 5 },
  { name: 'English HL', pts: 6 },
  { name: 'Life Sciences', pts: 6 },
];

const mockMatches = [
  { prog: 'BSc Computer Science', inst: 'UCT', aps: 42 },
  { prog: 'BSc Engineering', inst: 'Wits', aps: 38 },
  { prog: 'BCom Finance', inst: 'Stellenbosch', aps: 36 },
];

const footerCols = [
  {
    heading: 'Platform',
    links: [
      { label: 'APS Calculator', href: '/signup' },
      { label: 'Programme Search', href: '/signup' },
      { label: 'Career Matching', href: '/signup' },
      { label: 'Funding Hub', href: '/signup' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'For Schools', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'POPIA', href: '#' },
    ],
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="landing-logo">
          Prospectus<span className="dot-accent">.</span>
        </Link>
        <div className="landing-nav-links">
          <Link href="/login" className="btn-nav-ghost">Sign in</Link>
          <Link href="/signup" className="btn-nav-dark">Get started</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="landing-container">
          <div className="hero-inner">

            {/* Left: copy */}
            <div className="hero-copy">
              <p className="hero-eyebrow">
                <span className="hero-eyebrow-dot" aria-hidden="true" />
                For South African students
              </p>
              <h1 className="hero-headline">
                Every opportunity<br />
                you didn&apos;t know<br />
                existed.
              </h1>
              <p className="hero-body">
                Enter your matric results and instantly see every programme, career, and bursary
                you qualify for — across 89+ South African institutions.
              </p>
              <div className="hero-cta-row">
                <Link href="/signup" className="btn-hero-primary">
                  Start for free →
                </Link>
                <Link href="/login" className="btn-hero-outline">
                  Sign in
                </Link>
              </div>
              <p className="hero-trust">
                <span className="hero-trust-dot" aria-hidden="true" />
                100% free
                <span>·</span>
                No account needed to start
                <span>·</span>
                Results in 2 minutes
              </p>
            </div>

            {/* Right: APS preview card — AppWindowCard chrome */}
            <div className="hero-panel">

              {/* Chrome header */}
              <div className="hero-panel-chrome">
                <div className="hero-panel-chrome-left">
                  <div className="hero-panel-traffic" aria-hidden="true">
                    <span className="hero-panel-dot hero-panel-dot-red" />
                    <span className="hero-panel-dot hero-panel-dot-amber" />
                    <span className="hero-panel-dot hero-panel-dot-green" />
                  </div>
                  <span className="hero-panel-title">aps-snapshot.tsx</span>
                </div>
                <div className="hero-panel-status">
                  <span className="hero-panel-status-dot" aria-hidden="true" />
                  <span className="hero-panel-live">Live</span>
                </div>
              </div>

              {/* Section 1 — Matric results */}
              <div className="hero-panel-section">
                <p className="hero-panel-section-label">Matric results</p>
                {mockSubjects.map(s => (
                  <div key={s.name} className="hero-panel-subject">
                    <span className="hero-panel-subject-name">{s.name}</span>
                    <div className="hero-panel-bar-row">
                      <div className="hero-panel-bar-wrap">
                        <div className="hero-panel-bar-fill" style={{ width: `${(s.pts / 7) * 100}%`, background: 'hsl(220 92% 7%)' }} />
                      </div>
                      <span className="hero-panel-subject-pts">{Math.round((s.pts / 7) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats strip */}
              <div className="hero-panel-stats">
                {[
                  { num: '187', label: 'Programmes' },
                  { num: '23', label: 'Universities' },
                  { num: '12', label: 'Bursaries' },
                ].map(s => (
                  <div key={s.label} className="hero-panel-stat">
                    <span className="hero-panel-stat-num">{s.num}</span>
                    <span className="hero-panel-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Section 2 — Top matches */}
              <div className="hero-panel-section">
                <p className="hero-panel-section-label">Top matches</p>
                {mockMatches.map(m => (
                  <div key={m.prog} className="hero-panel-match">
                    <div className="hero-panel-match-left">
                      <span className="hero-panel-match-prog">{m.prog}</span>
                      <span className="hero-panel-match-inst">{m.inst}</span>
                    </div>
                    <div className="hero-panel-match-right">
                      <span className="hero-panel-match-aps">{m.aps}</span>
                      <span className="hero-panel-match-green" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── Institution strip ───────────────────────────────── */}
      <div className="institution-strip" aria-label="Institutions covered">

        {/* Row 1 — forward */}
        <div className="marquee-wrap">
          <div className="marquee-fade-left" aria-hidden="true" />
          <div className="marquee-fade-right" aria-hidden="true" />
          <div className="marquee-track" aria-hidden="true">
            {[...INSTITUTIONS, ...INSTITUTIONS].map((name, i) => (
              <span key={i} className="marquee-item">{name}</span>
            ))}
          </div>
        </div>

        {/* Centre label */}
        <div className="institution-strip-divider">
          <div className="institution-strip-divider-line" />
          <span className="institution-strip-divider-label">89+ institutions covered</span>
          <div className="institution-strip-divider-line" />
        </div>

        {/* Row 2 — reverse */}
        <div className="marquee-wrap">
          <div className="marquee-fade-left" aria-hidden="true" />
          <div className="marquee-fade-right" aria-hidden="true" />
          <div className="marquee-track-reverse" aria-hidden="true">
            {[...INSTITUTIONS.slice(0, 8), ...INSTITUTIONS.slice(0, 8)].map((name, i) => (
              <span key={i} className="marquee-item">{name}</span>
            ))}
          </div>
        </div>

      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="stats-strip">
        <div className="landing-container">
          <div className="stats-strip-inner">
            {stats.map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-num">{s.val}</span>
                <span className="caption">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="features-section">
        <div className="landing-container">
          <div className="features-header">
            <p className="section-eyebrow">Platform features</p>
            <h2 className="section-headline">
              Everything you need to<br />make the right choice.
            </h2>
            <p className="section-body">
              From eligibility checks to funding applications, Prospectus gives you the full
              toolkit — no guesswork required.
            </p>
          </div>
          <div className="feature-cards">
            {features.map(f => (
              <div key={f.title} className="feature-card reveal">
                <div className="feature-icon">{f.icon}</div>
                <p className="feature-title">{f.title}</p>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="how-section">
        <div className="landing-container">
          <div className="how-grid">

            {/* Left: sticky anchor */}
            <div className="how-anchor">
              <p className="section-eyebrow">How it works</p>
              <h2 className="section-headline">
                From your matric<br />results to a clear plan.
              </h2>
              <p className="section-body">
                Most students apply blind. Prospectus gives you the full picture before you
                commit to anything.
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link href="/signup" className="btn-hero-primary" style={{ display: 'inline-flex' }}>
                  Start for free →
                </Link>
              </div>
              <p className="hero-trust" style={{ marginTop: '1rem' }}>
                <span className="hero-trust-dot" aria-hidden="true" />
                No account needed · Takes 2 minutes
              </p>
            </div>

            {/* Right: steps */}
            <div className="how-steps">
              {steps.map(s => (
                <div key={s.num} className="how-step">
                  <div className="how-step-num">{s.num}</div>
                  <div className="how-step-body">
                    <p className="how-step-title">{s.title}</p>
                    <p className="how-step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="landing-container">
          <div className="cta-inner">
            <p className="cta-eyebrow">Get started</p>
            <h2 className="cta-headline">
              Your future is clearer<br />than you think.
            </h2>
            <p className="cta-body">
              See every programme you qualify for, every career path, every bursary — in 2
              minutes. No account needed to start.
            </p>
            <div className="cta-cta-row">
              <Link href="/signup" className="btn-cta-primary">
                Start for free →
              </Link>
              <Link href="/signup" className="btn-cta-outline">
                Create free account
              </Link>
            </div>
            <p className="cta-trust">
              <span className="hero-trust-dot" aria-hidden="true" />
              100% free
              <span>·</span>
              No credit card required
              <span>·</span>
              Results in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">

            {/* Brand column */}
            <div className="footer-brand">
              <div className="footer-brand-logo">
                Prospectus<span style={{ color: 'hsl(var(--amber))' }}>.</span>
              </div>
              <p className="footer-brand-desc">
                South Africa&apos;s university decision engine — helping every student find the
                right programme, funding, and career path.
              </p>
            </div>

            {/* Nav columns */}
            {footerCols.map(col => (
              <div key={col.heading}>
                <p className="footer-col-heading">{col.heading}</p>
                <div className="footer-col-links">
                  {col.links.map(l => (
                    <Link key={l.label} href={l.href} className="footer-link">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} Prospectus. All rights reserved.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">
                <span className="hero-trust-dot" aria-hidden="true" />
                POPIA Compliant
              </span>
              <span className="footer-copy">Made with ♥ in South Africa</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
