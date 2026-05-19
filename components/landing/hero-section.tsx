'use client';

import Link from 'next/link';
import EligibilityResultsCard from './results-card';

export default function HeroSection() {
  return (
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
                Check my eligibility →
              </Link>
              <Link href="/signup" className="btn-hero-outline">
                Create free account
              </Link>
            </div>
            <p className="hero-trust">
              <span className="hero-trust-dot" aria-hidden="true" />
              14,000+ students matched
              <span>·</span>
              All 9 provinces
              <span>·</span>
              100% free
            </p>
          </div>

          {/* Right: animated eligibility card */}
          <div>
            <EligibilityResultsCard animated />
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <div className="hero-scroll-line" />
      </div>

    </section>
  );
}
