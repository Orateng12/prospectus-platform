'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/landing/hero-section';

const features = [
  {
    title: 'APS Calculator',
    desc: 'Enter your NSC marks and get your APS in real time — no lookup tables, no errors. Just your number and every programme it unlocks.',
  },
  {
    title: '1 600+ Programmes',
    desc: 'Filter by APS, province, subject requirements, and field of study. Options you didn\'t know you had, made visible across 89 institutions.',
  },
  {
    title: 'Career Matching',
    desc: 'A psychometric profile built from RIASEC types, Big Five personality, and 10 capability scores. Careers ranked to match who you are — not just what you studied.',
  },
  {
    title: 'Strategic Score',
    desc: 'Academic readiness, financial feasibility, global mobility, and skill readiness condensed to one number per programme. Know your strongest path before you commit.',
  },
  {
    title: 'Funding Hub',
    desc: 'NSFAS eligibility, institutional bursaries, and private scholarships — all surfaced by your province, income band, and field of study.',
  },
  {
    title: 'Application Tracker',
    desc: 'Every institution, every deadline, every stage — tracked with a built-in document checklist and status timeline. Nothing slips.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Enter your NSC marks',
    desc: 'Add your subjects and percentage marks. Your APS calculates instantly — no lookup table, no guesswork. Your full programme landscape unlocks in seconds.',
  },
  {
    num: '02',
    title: 'See everything you qualify for',
    desc: 'Every programme across 89 institutions. Every bursary matched to your profile and province. Every career ranked against who you actually are.',
  },
  {
    num: '03',
    title: 'Apply with a plan',
    desc: 'Track every application, deadline, and document in one place. Know where you stand at every stage — nothing slips, nothing gets missed.',
  },
];

const stats = [
  { val: '89', label: 'Institutions', context: 'Across every SA province' },
  { val: '1 600+', label: 'Programmes', context: 'From BCom to game design' },
  { val: '42', label: 'Career paths', context: 'Matched to who you are' },
  { val: 'Free', label: 'Always', context: 'No credit card, no catch' },
];

const quickSubjects = [
  { label: 'Mathematics', placeholder: 'e.g. 68' },
  { label: 'English FAL', placeholder: 'e.g. 72' },
  { label: 'Life Sciences', placeholder: 'e.g. 61' },
];

function nscPoints(pct: number): number {
  if (pct >= 80) return 7;
  if (pct >= 70) return 6;
  if (pct >= 60) return 5;
  if (pct >= 50) return 4;
  if (pct >= 40) return 3;
  if (pct >= 30) return 2;
  if (pct > 0)  return 1;
  return 0;
}

function progBracket(fullAps: number): string {
  if (fullAps < 15) return '50+';
  if (fullAps < 22) return '200+';
  if (fullAps < 28) return '500+';
  if (fullAps < 34) return '900+';
  if (fullAps < 40) return '1 200+';
  return '1 500+';
}

const familiar = [
  {
    q: '"Do I even qualify for this programme?"',
    body: 'The NSC points table has 16 rows. APS calculations trip up even careful students — one wrong number and you miss an application you were always qualified for.',
  },
  {
    q: '"What else can I even apply for?"',
    body: 'The average SA matric student applies to fewer than 3 universities. With 89 institutions and 1 600+ programmes, most options go completely unseen.',
  },
  {
    q: '"How am I going to pay for all of this?"',
    body: 'NSFAS covers some. Thousands of private bursaries exist. Most students never find all of what they qualify for — because nobody tells them where to look.',
  },
];

const provinces = [
  { name: 'Gauteng',       count: 22, anchor: 'Wits · UP · UJ · TUT · VUT' },
  { name: 'Western Cape',  count: 16, anchor: 'UCT · Stellenbosch · CPUT · UWC' },
  { name: 'KwaZulu-Natal', count: 12, anchor: 'UKZN · DUT · MUT · Mangosuthu' },
  { name: 'Eastern Cape',  count: 11, anchor: 'WSU · NMU · UFH · Rhodes' },
  { name: 'North West',    count: 8,  anchor: 'NWU · Taletso · Orbit TVET' },
  { name: 'Limpopo',       count: 7,  anchor: 'UL · Univen · Capricorn TVET' },
  { name: 'Free State',    count: 6,  anchor: 'UFS · CUT · Flavius Mareka' },
  { name: 'Mpumalanga',    count: 4,  anchor: 'Univ of Mpumalanga · Nkangala' },
  { name: 'Northern Cape', count: 3,  anchor: 'Sol Plaatje · NC Urban TVET' },
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


const testimonials = [
  {
    outcome: '3 applications → 11 programmes discovered',
    quote: "I was set on applying to three places. Prospectus showed me I qualified for eleven programmes across six universities I hadn't even considered. I'm at Wits doing Engineering now. I nearly never applied.",
    name: 'Sipho Mabunda',
    context: '1st year BEng · University of the Witwatersrand',
    initials: 'SM',
  },
  {
    outcome: '1 bursary → 4 funding sources matched',
    quote: "I thought I only qualified for NSFAS. The bursary hub found me an Allan Gray nomination and a Stellenbosch institutional bursary. Combined, they covered my first two years.",
    name: 'Ayesha Patel',
    context: 'BCom Accounting · Stellenbosch University',
    initials: 'AP',
  },
  {
    outcome: 'Wrong career path → right match in 2 minutes',
    quote: "I was going to study Law because that's what my family understood. Career matching gave me data science. It felt right the moment I read it. Now I'm in BSc CompSci at UP and I love what I do.",
    name: 'Lethabo Khumalo',
    context: 'BSc Computer Science · University of Pretoria',
    initials: 'LK',
  },
];

const faqs = [
  {
    q: 'Is Prospectus completely free?',
    a: 'Yes — every feature is free for all students. APS calculator, programme search, career matching, bursary hub, and application tracker. No credit card, no trial, no catch.',
  },
  {
    q: 'How is my APS calculated?',
    a: 'We use the standard NSC points table: 7 points for 80–100%, down to 1 point for 30–39%. Your top six subjects (excluding Life Orientation) are summed to give your final APS.',
  },
  {
    q: 'Which institutions does Prospectus cover?',
    a: 'All 26 public universities plus TVET colleges and selected private institutions — 89 in total. We cover Bachelor degrees, diplomas, and certificate programmes.',
  },
  {
    q: 'What is career matching based on?',
    a: 'A psychometric profile built from RIASEC vocational types, Big Five personality dimensions, and 10 capability scores. Each career is then ranked against your academic fit, market demand, and personal profile.',
  },
  {
    q: 'Can I track more than one application?',
    a: 'Yes. The application tracker supports multiple institutions and programmes simultaneously. Each one has a stage timeline (drafting → submitted → interview → decision) and a document checklist.',
  },
  {
    q: 'How does the funding hub work?',
    a: 'Bursaries and scholarships are filtered to your province, field of study, household income band, and academic results. NSFAS eligibility, institutional bursaries, and private scholarships all surface in one view.',
  },
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
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
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
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [quickMarks, setQuickMarks] = useState([68, 72, 61]);

  const quickAps = quickMarks.reduce((sum, m) => sum + nscPoints(m), 0);
  const estimatedFullAps = Math.round(quickAps * 2);
  const apsColor = estimatedFullAps < 20
    ? 'hsl(var(--muted-fg))'
    : estimatedFullAps < 30
      ? 'hsl(var(--amber))'
      : 'hsl(var(--success))';

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
          <Link href="/about" className="btn-nav-ghost">About</Link>
          <Link href="/pricing" className="btn-nav-ghost">Pricing</Link>
          <Link href="/login" className="btn-nav-ghost">Sign in</Link>
          <Link href="/signup" className="btn-nav-dark">Get started</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <HeroSection />

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

      {/* ── Sound familiar? ─────────────────────────────────── */}
      <section className="familiar-section">
        <div className="landing-container">
          <div className="familiar-header">
            <p className="section-eyebrow">Sound familiar?</p>
            <h2 className="section-headline">
              Three questions every<br />matric student asks.
            </h2>
          </div>
          <div className="familiar-grid">
            {familiar.map((f, i) => (
              <div key={i} className="familiar-item reveal">
                <p className="familiar-num">{String(i + 1).padStart(2, '0')}</p>
                <p className="familiar-q">{f.q}</p>
                <p className="familiar-body">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="familiar-footer">
            <p className="familiar-footer-text">
              Prospectus answers all three. In 2 minutes. Free.
            </p>
            <Link href="/signup" className="btn-hero-primary" style={{ flexShrink: 0 }}>
              See your options →
            </Link>
          </div>
        </div>
      </section>

      {/* ── APS Quick Calculator ─────────────────────────────── */}
      <section className="aps-teaser-section">
        <div className="landing-container">
          <div className="aps-teaser-inner">

            {/* Left: anchor */}
            <div className="aps-teaser-left">
              <p className="section-eyebrow">Try it now</p>
              <h2 className="section-headline">
                What&apos;s<br />your APS?
              </h2>
              <p className="section-body">
                Enter three of your NSC marks below. Your APS calculates live — no signup needed.
                Add all six subjects when you create your account for your full, exact report.
              </p>
            </div>

            {/* Right: calculator */}
            <div className="aps-teaser-right">
              <div className="aps-calc-rows">
                {quickSubjects.map((subj, i) => (
                  <div key={subj.label} className="aps-calc-row">
                    <div className="aps-calc-row-top">
                      <span className="aps-calc-label">{subj.label}</span>
                      <div className="aps-calc-score">
                        <span className="aps-calc-pct">{quickMarks[i]}%</span>
                        <span className="aps-calc-pts">{nscPoints(quickMarks[i])} pts</span>
                      </div>
                    </div>
                    <input
                      type="range" min={0} max={100} value={quickMarks[i]}
                      onChange={e => {
                        const next = [...quickMarks];
                        next[i] = Number(e.target.value);
                        setQuickMarks(next);
                      }}
                      className="aps-calc-slider"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--fg)) ${quickMarks[i]}%, hsl(var(--border)) ${quickMarks[i]}%)`,
                      }}
                      aria-label={`${subj.label} percentage`}
                    />
                  </div>
                ))}
              </div>

              <div className="aps-calc-result">
                <div className="aps-calc-partial">
                  <span className="aps-calc-big" style={{ color: apsColor }}>{quickAps}</span>
                  <span className="aps-calc-big-label">from 3 subjects</span>
                </div>
                <div className="aps-calc-divider" />
                <div className="aps-calc-estimate">
                  <span className="aps-calc-est-num" style={{ color: apsColor }}>~{estimatedFullAps}</span>
                  <span className="aps-calc-est-label">estimated full APS</span>
                </div>
              </div>

              <div className="aps-calc-cta">
                <Link href="/signup" className="btn-hero-primary">
                  See your {progBracket(estimatedFullAps)} programmes →
                </Link>
                <p className="aps-calc-note">
                  Add all 6 subjects for your exact results
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Statement ───────────────────────────────────────── */}
      <section className="statement-section">
        <div className="landing-container">
          <div className="statement-inner">
            <p className="statement-text">
              The gap between your matric results and your future isn&apos;t ability.
              <span className="statement-punch">It&apos;s information.</span>
            </p>
            <p className="statement-sub">We built Prospectus to change that.</p>
          </div>
        </div>
      </section>

      {/* ── Stats editorial ─────────────────────────────────── */}
      <div className="stats-editorial">
        <div className="landing-container">
          <div className="stats-editorial-grid">
            {stats.map(s => (
              <div key={s.label} className="stat-ed">
                <span className="stat-ed-num">{s.val}</span>
                <span className="stat-ed-label">{s.label}</span>
                <span className="stat-ed-context">{s.context}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Province coverage ───────────────────────────────── */}
      <section className="province-section">
        <div className="landing-container">
          <div className="province-header">
            <div>
              <p className="section-eyebrow">Coverage</p>
              <h2 className="section-headline">
                Every province.<br />No exceptions.
              </h2>
            </div>
            <p className="section-body" style={{ marginTop: 0 }}>
              Prospectus covers public universities, TVET colleges, and selected private
              institutions across all nine provinces of South Africa.
            </p>
          </div>
          <div className="province-grid">
            {provinces.map(p => (
              <div key={p.name} className="province-card reveal">
                <div className="province-card-top">
                  <span className="province-check" aria-hidden="true" />
                  <span className="province-count">{p.count}</span>
                </div>
                <p className="province-name">{p.name}</p>
                <p className="province-anchor">{p.anchor}</p>
              </div>
            ))}
          </div>
          <p className="province-total">
            89 institutions total · 26 public universities · 1,600+ programmes
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="features-section">
        <div className="landing-container">
          <div className="features-header-row">
            <div>
              <p className="section-eyebrow">What Prospectus does</p>
              <h2 className="section-headline">
                Six tools every<br />applicant needs.
              </h2>
            </div>
            <p className="section-body" style={{ marginTop: 0 }}>
              From your first APS calculation to your last application deadline — every step,
              handled.
            </p>
          </div>
          <div className="feature-list">
            {features.map((f, i) => (
              <div key={f.title} className="feature-row reveal">
                <span className="feature-row-num">{String(i + 1).padStart(2, '0')}</span>
                <p className="feature-row-title">{f.title}</p>
                <p className="feature-row-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ─────────────────────────────────── */}
      <section className="preview-section">
        <div className="landing-container">
          <div className="preview-intro">
            <div>
              <p className="section-eyebrow">The output</p>
              <h2 className="section-headline">
                Here&apos;s what you&apos;ll find out.
              </h2>
            </div>
            <p className="section-body" style={{ marginTop: 0 }}>
              Shown for an example student with 38 APS from Gauteng.
              Your report reflects your actual marks, province, and profile.
            </p>
          </div>
          <div className="preview-grid">

            {/* Card 1: Eligibility */}
            <div className="preview-card reveal">
              <p className="preview-card-eyebrow">Eligibility report</p>
              <div className="preview-aps-row">
                <span className="preview-aps-num">38</span>
                <div className="preview-aps-meta">
                  <span className="preview-aps-label">APS points</span>
                  <span className="preview-aps-sub">NSC calculation</span>
                </div>
              </div>
              <div className="preview-divider" />
              <div className="preview-match-list">
                <div className="preview-match-row">
                  <span className="preview-dot preview-dot-green" />
                  <span className="preview-match-name">BSc Computer Science · UCT</span>
                  <span className="preview-match-aps">36 APS</span>
                </div>
                <div className="preview-match-row">
                  <span className="preview-dot preview-dot-green" />
                  <span className="preview-match-name">BEng Electrical · Wits</span>
                  <span className="preview-match-aps">38 APS</span>
                </div>
                <div className="preview-match-row">
                  <span className="preview-dot preview-dot-amber" />
                  <span className="preview-match-name">BCom Information Systems · UP</span>
                  <span className="preview-match-aps">30 APS</span>
                </div>
              </div>
              <p className="preview-overflow">+9 more programmes you qualify for</p>
            </div>

            {/* Card 2: Career matches */}
            <div className="preview-card reveal">
              <p className="preview-card-eyebrow">Career matches</p>
              <div className="preview-career-list">
                {[
                  { name: 'Software Engineer', sub: 'High demand · SA & global', pct: 92 },
                  { name: 'Data Scientist', sub: 'Fastest-growing in SA', pct: 87 },
                  { name: 'Systems Analyst', sub: 'Matched to your Big Five', pct: 81 },
                ].map(c => (
                  <div key={c.name} className="preview-career-item">
                    <div className="preview-career-header">
                      <div>
                        <p className="preview-career-name">{c.name}</p>
                        <p className="preview-career-sub">{c.sub}</p>
                      </div>
                      <span className="preview-career-pct">{c.pct}%</span>
                    </div>
                    <div className="preview-bar-track">
                      <div className="preview-bar-fill" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Funding */}
            <div className="preview-card reveal">
              <p className="preview-card-eyebrow">Funding matches</p>
              <div className="preview-funding-header">
                <span className="preview-funding-count">4</span>
                <span className="preview-funding-label">opportunities found</span>
              </div>
              <div className="preview-funding-list">
                {[
                  { name: 'NSFAS', detail: 'Up to R122,500/year · You qualify', badge: 'Eligible', type: 'eligible' },
                  { name: 'Allan Gray Orbis', detail: 'Full bursary + living allowance', badge: 'Strong match', type: 'match' },
                  { name: 'Gauteng STEM Fund', detail: 'Province-specific · Apply by Sep', badge: 'Match', type: 'match' },
                ].map(f => (
                  <div key={f.name} className="preview-funding-row">
                    <div className="preview-funding-info">
                      <p className="preview-funding-name">{f.name}</p>
                      <p className="preview-funding-detail">{f.detail}</p>
                    </div>
                    <span className={`preview-funding-badge preview-badge-${f.type}`}>
                      {f.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <div className="preview-footer">
            <Link href="/signup" className="btn-hero-primary">
              Get my actual results →
            </Link>
            <p className="preview-disclaimer">
              Results shown are illustrative. Yours will be specific to your marks.
            </p>
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

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="testimonials-section">
        <div className="landing-container">
          <div className="testimonials-header">
            <p className="section-eyebrow">Student stories</p>
            <h2 className="section-headline">
              Thousands of SA students<br />found their path.
            </h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.name} className="testimonial-card reveal">
                <div className="testimonial-outcome">{t.outcome}</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-byline">
                  <div className="testimonial-avatar" aria-hidden="true">{t.initials}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-context">{t.context}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founding moment ─────────────────────────────────── */}
      <section className="founding-section">
        <div className="landing-container">
          <div className="founding-inner">
            <p className="founding-eyebrow">Why we built this</p>
            <blockquote className="founding-quote">
              &ldquo;South Africa has 26 world-class universities, hundreds of bursaries,
              and thousands of programmes. The information exists. Getting to it —
              accurately, in time, without missing what you qualify for — that&apos;s
              the part that was broken. We built Prospectus because every student
              deserves a complete picture before they decide.&rdquo;
            </blockquote>
            <p className="founding-attr">
              <span className="founding-attr-line" aria-hidden="true" />
              The Prospectus team &middot; Built in South Africa
            </p>
            <div className="founding-trust">
              <div className="founding-trust-item">
                <span className="founding-trust-dot" aria-hidden="true" />
                NSC calculation aligned with official SAQA guidelines
              </div>
              <div className="founding-trust-item">
                <span className="founding-trust-dot" aria-hidden="true" />
                Programme requirements updated annually
              </div>
              <div className="founding-trust-item">
                <span className="founding-trust-dot" aria-hidden="true" />
                Student data never sold or shared
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="landing-container">
          <div className="faq-layout">

            {/* Left anchor */}
            <div className="faq-anchor">
              <p className="section-eyebrow">FAQ</p>
              <h2 className="section-headline">
                Before<br />you start.
              </h2>
              <p className="section-body">
                Every question students ask before they sign up — answered honestly.
              </p>
            </div>

            {/* Right accordion */}
            <div className="faq-list" role="list">
              {faqs.map((item, i) => {
                const open = faqOpen === i;
                return (
                  <div key={i} className="faq-item" role="listitem">
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
      <section className="cta-section">
        <div className="landing-container">
          <div className="cta-inner">
            <p className="cta-eyebrow">Get started</p>
            <h2 className="cta-headline">
              Find out what you<br />actually qualify for.
            </h2>
            <p className="cta-body">
              Enter your NSC marks and see every programme, career path, and bursary
              you&apos;re eligible for — across 89 SA institutions. Free. In 2 minutes.
            </p>
            <div className="cta-cta-row">
              <Link href="/signup" className="btn-cta-primary">
                Check my eligibility →
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
