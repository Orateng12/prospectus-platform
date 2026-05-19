'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const included = [
  'APS calculator — instant NSC mark conversion',
  '1 600+ programmes across 89 institutions',
  'AI career matching (RIASEC + Big Five + capabilities)',
  'Full bursary and NSFAS eligibility screening',
  'Application tracker with deadline management',
  'Strategic Score — one number across 4 dimensions',
  'Subject gap analysis for target programmes',
  'Province-aware funding recommendations',
];

const comparisons = {
  manual: [
    { icon: '⏱', text: 'Hours reading 200-page prospectuses' },
    { icon: '🔢', text: 'APS errors from manual calculation' },
    { icon: '🔍', text: 'Most bursaries discovered too late or not at all' },
    { icon: '📋', text: 'Application deadlines tracked in spreadsheets' },
    { icon: '🧭', text: 'No structured career guidance' },
  ],
  prospectus: [
    { icon: '⚡', text: 'Full eligibility report in 2 minutes' },
    { icon: '✓', text: 'Accurate APS from NSC marks, automatically' },
    { icon: '💡', text: 'All matched bursaries surfaced by profile' },
    { icon: '📊', text: 'Built-in tracker with stage timelines' },
    { icon: '🎯', text: 'Ranked careers matched to who you are' },
  ],
};

const pricingFaqs = [
  {
    q: 'Why is it free?',
    a: 'The students who need this most are the least able to pay. We believe a paywall on university guidance is ethically wrong. Prospectus is free because access to information should not be a privilege.',
  },
  {
    q: 'Will it ever cost money?',
    a: 'The core platform — everything a student needs to apply — will remain free. We may offer optional premium features for schools and counsellors in the future, but student access stays free.',
  },
  {
    q: 'How do you sustain it?',
    a: 'We are exploring institutional partnerships with universities and schools. Students will never be charged, and their data will never be sold.',
  },
];

export default function PricingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          <Link href="/about" className="btn-nav-ghost">About</Link>
          <Link href="/pricing" className="btn-nav-ghost" style={{ color: 'hsl(var(--fg))' }}>Pricing</Link>
          <Link href="/login" className="btn-nav-ghost">Sign in</Link>
          <Link href="/signup" className="btn-nav-dark">Get started</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="mkt-hero">
        <div className="landing-container">
          <p className="section-eyebrow mkt-hero-eyebrow">Pricing</p>
          <h1 className="mkt-hero-headline">
            Free.<br />Always.
          </h1>
          <p className="mkt-hero-body">
            Every feature, every student, every province. No subscription, no credit card, no
            catch. Prospectus is free because it has to be.
          </p>
        </div>
      </div>

      {/* ── Pricing card ────────────────────────────────────── */}
      <section className="mkt-section">
        <div className="landing-container">
          <div className="mkt-centered">
            <p className="section-eyebrow">What&apos;s included</p>
            <h2 className="section-headline">Everything. No exceptions.</h2>
          </div>
          <div className="pricing-card">
            <p className="pricing-plan-badge">
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'hsl(var(--accent))', marginRight: '0.5rem' }} />
              Student plan
            </p>
            <div className="pricing-price-row">
              <span className="pricing-price">R0</span>
              <span className="pricing-price-unit">/ forever</span>
            </div>
            <p className="pricing-price-desc">No credit card. No trial. No limit.</p>
            <hr className="pricing-divider" />
            <div className="pricing-features">
              {included.map(feat => (
                <div key={feat} className="pricing-feature">
                  <span className="pricing-check">✓</span>
                  <span className="pricing-feature-text">{feat}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" className="pricing-cta-full">
              Get started for free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comparison ──────────────────────────────────────── */}
      <section className="mkt-section-alt">
        <div className="landing-container">
          <div className="mkt-centered">
            <p className="section-eyebrow">The difference</p>
            <h2 className="section-headline">
              The old way vs<br />Prospectus.
            </h2>
          </div>
          <div className="pricing-comparison-grid">
            <div className="pricing-compare-card">
              <p className="pricing-compare-label bad">Without Prospectus</p>
              <div className="pricing-compare-list">
                {comparisons.manual.map(row => (
                  <div key={row.text} className="pricing-compare-row">
                    <span className="icon" style={{ color: 'hsl(var(--destructive) / 0.6)' }}>{row.icon}</span>
                    {row.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="pricing-compare-card" style={{ borderColor: 'hsl(var(--success) / 0.3)' }}>
              <p className="pricing-compare-label good">With Prospectus</p>
              <div className="pricing-compare-list">
                {comparisons.prospectus.map(row => (
                  <div key={row.text} className="pricing-compare-row">
                    <span className="icon" style={{ color: 'hsl(var(--success))' }}>{row.icon}</span>
                    {row.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="mkt-section">
        <div className="landing-container">
          <div className="faq-layout">
            <div className="faq-anchor">
              <p className="section-eyebrow">Questions</p>
              <h2 className="section-headline">About the<br />free model.</h2>
              <p className="section-body">Why free? How long? What&apos;s the plan?</p>
            </div>
            <div className="faq-list">
              {pricingFaqs.map((item, i) => {
                const open = faqOpen === i;
                return (
                  <div key={i} className="faq-item">
                    <button
                      className="faq-trigger"
                      aria-expanded={open}
                      onClick={() => setFaqOpen(open ? null : i)}
                    >
                      <span className="faq-q">{item.q}</span>
                      <svg
                        className={`faq-chevron${open ? ' open' : ''}`}
                        viewBox="0 0 20 20" fill="none"
                        stroke="currentColor" strokeWidth={1.75}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
                      </svg>
                    </button>
                    <div
                      className="faq-body-wrap"
                      ref={el => { faqRefs.current[i] = el; }}
                      style={{ height: open ? (faqRefs.current[i]?.scrollHeight ?? 'auto') : 0 }}
                    >
                      <p className="faq-a">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="mkt-section-dark">
        <div className="landing-container">
          <div className="cta-inner">
            <p className="cta-eyebrow">Get started</p>
            <h2 className="cta-headline" style={{ color: 'white' }}>
              No reason to wait.<br />It&apos;s free.
            </h2>
            <p className="cta-body">Your full eligibility report in 2 minutes. No account needed to start.</p>
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
