'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './pathways.css';

export default function PathwaysPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [activePathway, setActivePathway] = useState('');

  /* scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }); },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.pw-page .reveal-up').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* scroll-spy for jump nav */
  useEffect(() => {
    const ids = ['direct', 'extended', 'foundation', 'tvet'];
    const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActivePathway(e.target.id); }); },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* keyboard nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="pw-page">

      {/* ══ NAV ══ */}
      <header className="nav">
        <div className="container nav-row">
          <Link href="/" className="brand" aria-label="Prospectus home">
            <div className="brand-mark" aria-hidden="true">P</div>
            <span className="brand-name">Prospectus</span>
            <span className="brand-tag">built in SA · est. 2026</span>
          </Link>
          <nav className="nav-links" aria-label="Site navigation">
            <Link href="/programmes">Programmes</Link>
            <Link href="/pathways" className="is-active">Pathways</Link>
            <Link href="/bursaries">Bursaries</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/for-institutions">For institutions</Link>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <span className="arr">→</span></Link>
            <button
              className="nav-mob-btn"
              onClick={() => setNavOpen(o => !o)}
              aria-expanded={navOpen}
              aria-controls="mobile-nav-pw"
              aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            >
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {navOpen
                  ? <><line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" /></>
                  : <><line x1="2" y1="5" x2="16" y2="5" /><line x1="2" y1="9" x2="16" y2="9" /><line x1="2" y1="13" x2="16" y2="13" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* mobile drawer */}
        <nav
          id="mobile-nav-pw"
          className={`nav-drawer${navOpen ? ' open' : ''}`}
          aria-label="Mobile navigation"
          aria-hidden={!navOpen}
        >
          <div className="nav-drawer-head">
            <Link href="/" className="brand" onClick={() => setNavOpen(false)}>
              <div className="brand-mark" aria-hidden="true">P</div>
              <span className="brand-name">Prospectus</span>
            </Link>
            <button
              className="nav-mob-btn"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" />
              </svg>
            </button>
          </div>
          <div className="nav-drawer-links">
            <Link href="/programmes" onClick={() => setNavOpen(false)}>Programmes</Link>
            <Link href="/pathways" className="is-active" onClick={() => setNavOpen(false)}>Pathways</Link>
            <Link href="/bursaries" onClick={() => setNavOpen(false)}>Bursaries</Link>
            <Link href="/careers" onClick={() => setNavOpen(false)}>Careers</Link>
            <Link href="/for-institutions" onClick={() => setNavOpen(false)}>For institutions</Link>
          </div>
          <div className="nav-drawer-cta">
            <Link href="/login" className="btn btn-outline" onClick={() => setNavOpen(false)}>Sign in</Link>
            <Link href="/signup" className="btn btn-accent" onClick={() => setNavOpen(false)}>Start free →</Link>
          </div>
        </nav>

        <div className="container live-strip" aria-hidden="true">
          <span><span className="pulse"></span> Live</span>
          <span>·</span>
          <span>4 pathway taxonomies · indexed weekly</span>
          <span className="sep">·</span>
          <span>Source: USAf / CHE / DBE</span>
          <span className="sep">·</span>
          <span>Last updated 24 May 2026 04:12 SAST</span>
        </div>
      </header>

      {/* ══ PAGE HEADER ══ */}
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Prospectus</Link>
            <span className="sep">/</span>
            <span>The four pathways</span>
          </div>
          <div className="eyebrow"><span className="dot"></span>Signature taxonomy · est. 2026</div>
          <h1 className="display text-balance" style={{ marginTop: '1.25rem' }}>
            Four doors into<br /><span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>South African</span> tertiary.
          </h1>
          <p className="sub text-pretty">Most students see one — the front door. The Direct route. The other three are equally legitimate, often better-funded, and frequently lead to better outcomes for the right student. We made it our job to make them legible.</p>
        </div>
      </section>

      {/* ══ PATHWAY JUMP NAV ══ */}
      <nav className="pw-jump" aria-label="Jump to pathway">
        <div className="container pw-jump-row">
          <a href="#direct" className={`d${activePathway === 'direct' ? ' is-active' : ''}`}>
            <span className="sw"></span>
            <div>
              <div className="k">01 / 04</div>
              <div className="nm">Direct entry</div>
            </div>
          </a>
          <a href="#extended" className={`e${activePathway === 'extended' ? ' is-active' : ''}`}>
            <span className="sw"></span>
            <div>
              <div className="k">02 / 04</div>
              <div className="nm">Extended curriculum</div>
            </div>
          </a>
          <a href="#foundation" className={`f${activePathway === 'foundation' ? ' is-active' : ''}`}>
            <span className="sw"></span>
            <div>
              <div className="k">03 / 04</div>
              <div className="nm">Foundation year</div>
            </div>
          </a>
          <a href="#tvet" className={`t${activePathway === 'tvet' ? ' is-active' : ''}`}>
            <span className="sw"></span>
            <div>
              <div className="k">04 / 04</div>
              <div className="nm">TVET / FET</div>
            </div>
          </a>
        </div>
      </nav>

      {/* ══ INTRO ══ */}
      <section className="section">
        <div className="container">
          <div className="rule">
            <span className="num">00 / 04</span>
            <span className="line"></span>
            <span className="lbl">Why this taxonomy</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', marginTop: '3rem' }}>
            <p className="intro-pull text-pretty reveal-up">
              The pathway you take matters <span className="em">more than the score</span> you take it with.
            </p>
            <div className="pw-intro-cols">
              <div className="reveal-up">
                <div className="eyebrow"><span className="dot"></span>The frame</div>
                <p style={{ marginTop: '1rem', fontSize: '1.0625rem', lineHeight: '1.65', color: 'hsl(var(--ink-2))' }}>
                  South African tertiary education has four entry pathways. The Direct route is the one everyone knows about. The other three — Extended, Foundation, TVET — exist in plain sight but are systematically under-explained at the matric level. Most students don&apos;t know they qualify for them, or that they often lead to the same degree, or that NSFAS covers all four.
                </p>
              </div>
              <div className="reveal-up">
                <div className="eyebrow" style={{ color: 'hsl(var(--accent-600))' }}><span className="dot"></span>The promise</div>
                <p style={{ marginTop: '1rem', fontSize: '1.0625rem', lineHeight: '1.65', color: 'hsl(var(--ink-2))' }}>
                  Every programme on Prospectus is tagged with one of the four pathway badges below. You filter by them. You compare across them. You sort funding against them. The taxonomy is the index, and the index is the product. This page is the long-form companion — read it once, refer to it forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ DIRECT ══ */}
      <section className="pw-section" id="direct">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">01 / 04</span>
            <span className="line"></span>
            <span className="lbl" style={{ color: 'hsl(var(--pw-direct))' }}>Pathway · direct entry</span>
          </div>
          <div className="pw-hero">
            <div className="pw-letter d reveal-up">
              <span className="glyph" aria-hidden="true">D</span>
              <div className="top"><span>D · 01</span><span>30% of programmes</span></div>
              <div className="bottom">
                <h2>Direct entry</h2>
                <p className="tagline">&ldquo;You&apos;re qualified. Apply. Get in. Start in year one.&rdquo;</p>
              </div>
            </div>
            <div className="pw-content reveal-up">
              <h2 className="title text-balance">The route everyone <span className="em">thinks</span> they have to take.</h2>
              <p className="lede text-pretty">
                You meet the APS, the subject requirements, and the language requirements. You apply, you get in, you start in year one. It&apos;s the fastest route — three or four years — and the one with the most cultural cachet. But &ldquo;fastest&rdquo; doesn&apos;t always mean &ldquo;best fit&rdquo;. Direct entry has the highest throughput rate, but it also has the highest dropout rate in year one. The match has to be real.
              </p>
              <div className="pw-stats">
                <div className="pw-stat">
                  <div className="k">Avg APS required</div>
                  <div className="v">34–46</div>
                  <div className="label">Floor varies by programme. Medicine and Engineering top the range.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Duration</div>
                  <div className="v">3<span style={{ fontSize: '0.5em', color: 'hsl(var(--mute))' }}>yrs</span></div>
                  <div className="label">Sometimes 4 (Eng, Law). The shortest standard route.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Throughput · 5 yr</div>
                  <div className="v">71<span style={{ fontSize: '0.5em' }}>%</span></div>
                  <div className="label">Highest of the four pathways — but with a 14% year-1 dropout rate.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Funding eligible</div>
                  <div className="v">Yes</div>
                  <div className="label">NSFAS + every private bursary on the platform.</div>
                </div>
              </div>
              <div className="myths">
                <div className="myth">
                  <div className="k">Myth · 01</div>
                  <p className="said">&ldquo;Direct entry is the only legitimate route.&rdquo;</p>
                  <p className="truth">Direct accounts for <strong>30%</strong> of programmes nationally. The other three pathways are equally accredited and equally fundable.</p>
                </div>
                <div className="myth">
                  <div className="k">Myth · 02</div>
                  <p className="said">&ldquo;If you can do Direct, you should always do Direct.&rdquo;</p>
                  <p className="truth">Students at the bottom of the APS range for Direct entry are <strong>twice as likely to drop out</strong> in year one as students who chose Extended.</p>
                </div>
              </div>
              <div className="prog-sampler">
                <div className="prog-sampler-head">
                  <span>Sample Direct programmes · APS range 34–46</span>
                  <span>9,412 indexed · 30%</span>
                </div>
                <div className="prog-sampler-list">
                  {[
                    { nm: 'BSc Computer Science', inst: 'UCT', aps: 'APS 38', fee: 'R 76,420/yr' },
                    { nm: 'MBChB Medicine', inst: 'UCT', aps: 'APS 45', fee: 'R 91,200/yr' },
                    { nm: 'BSc Actuarial Science', inst: 'Wits', aps: 'APS 40', fee: 'R 82,100/yr' },
                    { nm: 'BEng Chemical', inst: 'UP', aps: 'APS 38', fee: 'R 72,400/yr' },
                    { nm: 'LLB Law', inst: 'Wits', aps: 'APS 39', fee: 'R 71,400/yr' },
                  ].map(r => (
                    <div key={r.nm} className="prog-sampler-row">
                      <div className="nm">{r.nm}<span className="inst">{r.inst}</span></div>
                      <span className="meta">{r.aps}</span>
                      <span className="meta">{r.fee}</span>
                      <span className="arr">→</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="story">
                <div className="story-portrait" aria-hidden="true">
                  <div className="stripe"></div>
                  <div className="face"></div>
                  <div className="label">Thandi B. · 18 · Gauteng</div>
                </div>
                <div className="story-text">
                  <div className="k">Direct · year 2 · Wits</div>
                  <p className="quote">&ldquo;My parents wanted me to do law. The career data made it a conversation, not a fight. I&apos;m now doing actuarial science with their full support.&rdquo;</p>
                  <div className="arc">
                    <div className="arc-step">
                      <div className="yr">2025 · matric</div>
                      <div className="h">APS 41 <span className="ct">+ R 0 funding</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2026 · year 1</div>
                      <div className="h">Wits BSc Actuarial <span className="ct">R 82k bursary</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2031 · projected</div>
                      <div className="h">Actuarial analyst <span className="ct">R 42,800/mo</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EXTENDED ══ */}
      <section className="pw-section dark" id="extended">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">02 / 04</span>
            <span className="line"></span>
            <span className="lbl" style={{ color: 'hsl(var(--pw-extended))', filter: 'brightness(1.5)' }}>Pathway · extended curriculum</span>
          </div>
          <div className="pw-hero">
            <div className="pw-letter e reveal-up">
              <span className="glyph" aria-hidden="true">E</span>
              <div className="top"><span>E · 02</span><span>26% of programmes</span></div>
              <div className="bottom">
                <h2>Extended curriculum</h2>
                <p className="tagline">&ldquo;Same degree. One more year. Built-in support.&rdquo;</p>
              </div>
            </div>
            <div className="pw-content reveal-up">
              <h2 className="title text-balance">The <span className="em">best-kept secret</span> in SA tertiary.</h2>
              <p className="lede text-pretty">
                You enrol in the same degree. You graduate with the same qualification. The only difference is one extra year and a curriculum stretched to include academic support modules — writing, numeracy, study skills. Available for borderline-APS students who&apos;d otherwise be rejected from Direct entry. The data is unambiguous: extended cohorts have <em>higher</em> graduation rates than the bottom quartile of Direct cohorts in the same programme.
              </p>
              <div className="pw-stats">
                <div className="pw-stat">
                  <div className="k">Avg APS required</div>
                  <div className="v">28–34</div>
                  <div className="label">Sits 4–8 points below Direct for the same degree.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Duration</div>
                  <div className="v">4<span style={{ fontSize: '0.5em', opacity: 0.6 }}>yrs</span></div>
                  <div className="label">One extra year. Same final qualification.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Throughput · 5 yr</div>
                  <div className="v">68<span style={{ fontSize: '0.5em' }}>%</span></div>
                  <div className="label">Only 3pp behind Direct — with weaker entry profiles.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Funding eligible</div>
                  <div className="v">Yes</div>
                  <div className="label">NSFAS funds all four years. Same bursaries open.</div>
                </div>
              </div>
              <div className="myths">
                <div className="myth">
                  <div className="k">Myth · 01</div>
                  <p className="said">&ldquo;Extended is the lesser degree.&rdquo;</p>
                  <p className="truth">The certificate is <strong>identical</strong>. No employer can distinguish between a BSc earned via Direct or Extended. Same lectures, same exams, same graduation.</p>
                </div>
                <div className="myth">
                  <div className="k">Myth · 02</div>
                  <p className="said">&ldquo;Extended adds a useless year.&rdquo;</p>
                  <p className="truth">For students at the borderline APS, the support modules <strong>raise the year-1 pass rate from 58% to 81%</strong>. That extra year buys a degree, not a delay.</p>
                </div>
              </div>
              <div className="prog-sampler">
                <div className="prog-sampler-head">
                  <span>Sample Extended programmes · APS range 28–34</span>
                  <span>9,412 indexed · 26%</span>
                </div>
                <div className="prog-sampler-list">
                  {[
                    { nm: 'BSc Computer Sci · Extended', inst: 'Wits', aps: 'APS 32', fee: 'R 71,400/yr' },
                    { nm: 'BEng Mechanical · Extended', inst: 'UCT', aps: 'APS 30', fee: 'R 71,890/yr' },
                    { nm: 'BCom · Extended', inst: 'NMU', aps: 'APS 28', fee: 'R 52,100/yr' },
                    { nm: 'BSc Biological Sci · Extended', inst: 'Rhodes', aps: 'APS 30', fee: 'R 56,200/yr' },
                    { nm: 'BSc Health Sci · Extended', inst: 'UFS', aps: 'APS 32', fee: 'R 48,200/yr' },
                  ].map(r => (
                    <div key={r.nm} className="prog-sampler-row">
                      <div className="nm">{r.nm}<span className="inst">{r.inst}</span></div>
                      <span className="meta">{r.aps}</span>
                      <span className="meta">{r.fee}</span>
                      <span className="arr">→</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="story">
                <div className="story-portrait" aria-hidden="true">
                  <div className="stripe"></div>
                  <div className="face"></div>
                  <div className="label">Sipho M. · 19 · Eastern Cape</div>
                </div>
                <div className="story-text">
                  <div className="k">Extended · year 3 · NMU</div>
                  <p className="quote">&ldquo;My APS was 30. Direct rejected me. Extended took me — and gave me a tutor. I&apos;m now top quartile of my year, on a bursary I never knew existed.&rdquo;</p>
                  <div className="arc">
                    <div className="arc-step">
                      <div className="yr">2024 · matric</div>
                      <div className="h">APS 30 <span className="ct">+ rejected Direct</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2025 · year 1</div>
                      <div className="h">NMU BEng Extended <span className="ct">+ NSFAS full</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2031 · projected</div>
                      <div className="h">Process engineer <span className="ct">R 36,400/mo</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOUNDATION ══ */}
      <section className="pw-section" id="foundation">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">03 / 04</span>
            <span className="line"></span>
            <span className="lbl" style={{ color: 'hsl(var(--pw-foundation))' }}>Pathway · foundation year</span>
          </div>
          <div className="pw-hero">
            <div className="pw-letter f reveal-up">
              <span className="glyph" aria-hidden="true">F</span>
              <div className="top"><span>F · 03</span><span>18% of programmes</span></div>
              <div className="bottom">
                <h2>Foundation year</h2>
                <p className="tagline">&ldquo;A bridging year that gets you to the same degree.&rdquo;</p>
              </div>
            </div>
            <div className="pw-content reveal-up">
              <h2 className="title text-balance">A door, <span className="em">not a detour</span>.</h2>
              <p className="lede text-pretty">
                A one-year bridging programme that ends in a guaranteed seat in the degree above — provided you pass. Most major universities run Foundation tracks for Science, Health Sciences, Engineering and Commerce, and most matric students don&apos;t know they exist. Foundation is not &ldquo;remedial.&rdquo; It&apos;s a deliberate, well-funded year of academic rebuild. For a student with a strong work ethic but a poor matric environment, it&apos;s the highest-leverage year of their life.
              </p>
              <div className="pw-stats">
                <div className="pw-stat">
                  <div className="k">Avg APS required</div>
                  <div className="v">24–30</div>
                  <div className="label">The lowest entry threshold of any university route.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Duration</div>
                  <div className="v">4–5<span style={{ fontSize: '0.5em', color: 'hsl(var(--mute))' }}>yrs</span></div>
                  <div className="label">Foundation year + degree.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Progression rate</div>
                  <div className="v">62<span style={{ fontSize: '0.5em' }}>%</span></div>
                  <div className="label">Pass Foundation → guaranteed seat in the degree.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Funding eligible</div>
                  <div className="v">Yes</div>
                  <div className="label">NSFAS covers the Foundation year and all subsequent years.</div>
                </div>
              </div>
              <div className="myths">
                <div className="myth">
                  <div className="k">Myth · 01</div>
                  <p className="said">&ldquo;Foundation is for students who failed matric.&rdquo;</p>
                  <p className="truth">Foundation requires a <strong>valid Bachelor&apos;s pass</strong>. It&apos;s an academic stretch, not a recovery programme. Most Foundation students passed matric with merit.</p>
                </div>
                <div className="myth">
                  <div className="k">Myth · 02</div>
                  <p className="said">&ldquo;Universities push students into Foundation to reject them.&rdquo;</p>
                  <p className="truth">Foundation is an <strong>active selection</strong>. Students earn their seat. Of those who complete Foundation, <strong>91% enrol</strong> in the linked degree the following year.</p>
                </div>
              </div>
              <div className="prog-sampler">
                <div className="prog-sampler-head">
                  <span>Sample Foundation programmes · APS range 24–30</span>
                  <span>9,412 indexed · 18%</span>
                </div>
                <div className="prog-sampler-list">
                  {[
                    { nm: 'BSc Foundation', inst: 'UFS', aps: 'APS 24', fee: 'R 44,200/yr' },
                    { nm: 'BHSc Foundation', inst: 'UWC', aps: 'APS 28', fee: 'R 46,800/yr' },
                    { nm: 'BCom Foundation', inst: 'UJ', aps: 'APS 26', fee: 'R 48,200/yr' },
                    { nm: 'BEng Foundation', inst: 'UP', aps: 'APS 28', fee: 'R 51,200/yr' },
                    { nm: 'B Med Sci Foundation', inst: 'UKZN', aps: 'APS 30', fee: 'R 49,800/yr' },
                  ].map(r => (
                    <div key={r.nm} className="prog-sampler-row">
                      <div className="nm">{r.nm}<span className="inst">{r.inst}</span></div>
                      <span className="meta">{r.aps}</span>
                      <span className="meta">{r.fee}</span>
                      <span className="arr">→</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="story">
                <div className="story-portrait" aria-hidden="true">
                  <div className="stripe"></div>
                  <div className="face"></div>
                  <div className="label">Naledi K. · 20 · Free State</div>
                </div>
                <div className="story-text">
                  <div className="k">Foundation · year 3 · UFS</div>
                  <p className="quote">&ldquo;I thought I couldn&apos;t do medicine. Prospectus showed me three Foundation routes I&apos;d never heard of. I&apos;m in my second BHSc year now — and on track.&rdquo;</p>
                  <div className="arc">
                    <div className="arc-step">
                      <div className="yr">2023 · matric</div>
                      <div className="h">APS 28 <span className="ct">+ no Direct options</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2024 · foundation</div>
                      <div className="h">UFS BHSc Foundation <span className="ct">passed top 20%</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2031 · projected</div>
                      <div className="h">Health practitioner <span className="ct">R 38,200/mo</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TVET ══ */}
      <section className="pw-section dark" id="tvet">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">04 / 04</span>
            <span className="line"></span>
            <span className="lbl" style={{ color: 'hsl(var(--pw-tvet))', filter: 'brightness(1.6)' }}>Pathway · TVET / FET</span>
          </div>
          <div className="pw-hero">
            <div className="pw-letter t reveal-up">
              <span className="glyph" aria-hidden="true">T</span>
              <div className="top"><span>T · 04</span><span>26% of programmes</span></div>
              <div className="bottom">
                <h2>TVET / FET</h2>
                <p className="tagline">&ldquo;Vocational. Funded. Hiring. For many careers, plan A.&rdquo;</p>
              </div>
            </div>
            <div className="pw-content reveal-up">
              <h2 className="title text-balance">Not plan B. <span className="em">Plan A</span> for the right career.</h2>
              <p className="lede text-pretty">
                Technical and Vocational Education and Training colleges run NCV (National Certificate Vocational) and Diploma programmes that lead directly into the labour market — usually in two or three years. NSFAS covers them in full, including a monthly stipend. Twelve months after qualification, TVET graduates are <em>more likely</em> to be employed than university graduates in the same field. The cultural bias against TVET is the single biggest information failure in SA tertiary education.
              </p>
              <div className="pw-stats">
                <div className="pw-stat">
                  <div className="k">Avg APS required</div>
                  <div className="v">18–28</div>
                  <div className="label">Many programmes have no APS — only a matric certificate.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Duration</div>
                  <div className="v">2–3<span style={{ fontSize: '0.5em', opacity: 0.6 }}>yrs</span></div>
                  <div className="label">Plus optional workplace integration year.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Employed · 12mo</div>
                  <div className="v">82<span style={{ fontSize: '0.5em' }}>%</span></div>
                  <div className="label">Highest of the four pathways. Some sectors are 95%+.</div>
                </div>
                <div className="pw-stat">
                  <div className="k">Funding eligible</div>
                  <div className="v">Yes</div>
                  <div className="label">NSFAS covers fees, books and a R 1,500/mo stipend.</div>
                </div>
              </div>
              <div className="myths">
                <div className="myth">
                  <div className="k">Myth · 01</div>
                  <p className="said">&ldquo;TVET is for students who can&apos;t get into university.&rdquo;</p>
                  <p className="truth">TVET is a <strong>different track</strong>, not a lower one. For trades, technical roles, and many service-sector careers, TVET produces <strong>better employment outcomes</strong> than a university degree.</p>
                </div>
                <div className="myth">
                  <div className="k">Myth · 02</div>
                  <p className="said">&ldquo;You can&apos;t earn well from a TVET diploma.&rdquo;</p>
                  <p className="truth">A qualified mechatronics technician earns <strong>R 24,500/mo</strong> on day one — more than the median BCom graduate&apos;s first three years.</p>
                </div>
              </div>
              <div className="prog-sampler">
                <div className="prog-sampler-head">
                  <span>Sample TVET programmes · APS range 18–28</span>
                  <span>50 colleges · 26%</span>
                </div>
                <div className="prog-sampler-list">
                  {[
                    { nm: 'Dip · Information Tech', inst: 'TVET Ekurhuleni', aps: 'APS 22', fee: 'R 18,200/yr' },
                    { nm: 'Dip · Mechatronics', inst: 'TVET Tshwane', aps: 'APS 24', fee: 'R 16,800/yr' },
                    { nm: 'NCV · Engineering', inst: 'TVET False Bay', aps: 'APS 18', fee: 'R 14,200/yr' },
                    { nm: 'Dip · Tourism Mgmt', inst: 'TVET Boland', aps: 'APS 20', fee: 'R 15,400/yr' },
                    { nm: 'NCV · Office Admin', inst: 'TVET Coastal KZN', aps: 'APS 18', fee: 'R 13,800/yr' },
                  ].map(r => (
                    <div key={r.nm} className="prog-sampler-row">
                      <div className="nm">{r.nm}<span className="inst">{r.inst}</span></div>
                      <span className="meta">{r.aps}</span>
                      <span className="meta">{r.fee}</span>
                      <span className="arr">→</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="story">
                <div className="story-portrait" aria-hidden="true">
                  <div className="stripe"></div>
                  <div className="face"></div>
                  <div className="label">Lebo S. · 21 · Mpumalanga</div>
                </div>
                <div className="story-text">
                  <div className="k">TVET · year 2 of work · SAB Miller</div>
                  <p className="quote">&ldquo;University was the wrong shape for me. TVET wasn&apos;t. Two years in, I&apos;m a mechatronics technician earning more than my older cousin&apos;s BCom job.&rdquo;</p>
                  <div className="arc">
                    <div className="arc-step">
                      <div className="yr">2022 · matric</div>
                      <div className="h">APS 24 <span className="ct">+ no degree fit</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2023 · diploma</div>
                      <div className="h">TVET Tshwane Mechatronics <span className="ct">+ stipend</span></div>
                    </div>
                    <div className="arc-step">
                      <div className="yr">2025 · working</div>
                      <div className="h">SAB Miller technician <span className="ct">R 24,500/mo</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPARISON TABLE ══ */}
      <section className="section">
        <div className="container">
          <div className="rule">
            <span className="num">—</span>
            <span className="line"></span>
            <span className="lbl">Side-by-side · the whole picture</span>
          </div>
          <h2 className="display reveal-up text-balance" style={{ marginTop: '2rem' }}>
            Four routes, <span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>one decision</span>.
          </h2>
          <p className="sub reveal-up" style={{ marginTop: '1.25rem', maxWidth: '44rem' }}>
            The single most useful table in South African tertiary education. Print it, screenshot it, send it to your group chat.
          </p>
          <div className="compare reveal-up">
            <div className="compare-row head">
              <div className="label-cell">Metric</div>
              <div className="cell d"><span className="sw"></span>Direct</div>
              <div className="cell e"><span className="sw"></span>Extended</div>
              <div className="cell f"><span className="sw"></span>Foundation</div>
              <div className="cell t"><span className="sw"></span>TVET</div>
            </div>
            <div className="compare-row">
              <div className="label-cell">APS range</div>
              <div data-h="Direct"><span className="v">34–46</span><div className="vsub">strict</div></div>
              <div data-h="Extended"><span className="v">28–34</span><div className="vsub">supportive</div></div>
              <div data-h="Foundation"><span className="v">24–30</span><div className="vsub">bridging</div></div>
              <div data-h="TVET"><span className="v">18–28</span><div className="vsub">accessible</div></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">Duration</div>
              <div data-h="Direct"><span className="v">3–4 yrs</span></div>
              <div data-h="Extended"><span className="v">4 yrs</span></div>
              <div data-h="Foundation"><span className="v">4–5 yrs</span></div>
              <div data-h="TVET"><span className="v">2–3 yrs</span></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">Final qualification</div>
              <div data-h="Direct"><span className="v">Degree</span></div>
              <div data-h="Extended"><span className="v">Same degree</span></div>
              <div data-h="Foundation"><span className="v">Same degree</span></div>
              <div data-h="TVET"><span className="v">Diploma / NCV</span></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">5-yr throughput</div>
              <div data-h="Direct"><span className="v">71%</span></div>
              <div data-h="Extended"><span className="v">68%</span></div>
              <div data-h="Foundation"><span className="v">62%</span></div>
              <div data-h="TVET"><span className="v">74%</span><div className="vsub">to diploma</div></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">12-mo employment</div>
              <div data-h="Direct"><span className="v">66%</span></div>
              <div data-h="Extended"><span className="v">64%</span></div>
              <div data-h="Foundation"><span className="v">65%</span></div>
              <div data-h="TVET"><span className="v">82%</span><div className="vsub">highest</div></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">Median fees / yr</div>
              <div data-h="Direct"><span className="v">R 68,000</span></div>
              <div data-h="Extended"><span className="v">R 62,000</span></div>
              <div data-h="Foundation"><span className="v">R 48,000</span></div>
              <div data-h="TVET"><span className="v">R 16,000</span><div className="vsub">lowest</div></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">NSFAS funded</div>
              <div data-h="Direct"><span className="v">Yes</span><div className="vsub">full</div></div>
              <div data-h="Extended"><span className="v">Yes</span><div className="vsub">full</div></div>
              <div data-h="Foundation"><span className="v">Yes</span><div className="vsub">full + bursary</div></div>
              <div data-h="TVET"><span className="v">Yes</span><div className="vsub">full + stipend</div></div>
            </div>
            <div className="compare-row">
              <div className="label-cell">Best for</div>
              <div data-h="Direct"><span className="v">Strong matric, clear field</span></div>
              <div data-h="Extended"><span className="v">Borderline APS, same goal</span></div>
              <div data-h="Foundation"><span className="v">Bachelor&apos;s pass, weak prep</span></div>
              <div data-h="TVET"><span className="v">Trades &amp; service careers</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="final">
        <div className="container">
          <div className="eyebrow reveal-up" style={{ color: 'hsl(var(--accent))' }}>
            <span className="dot" style={{ background: 'hsl(var(--accent))' }}></span>Pick the right door
          </div>
          <h2 className="reveal-up" style={{ marginTop: '1.5rem' }}>
            All four open<br /><span className="serif">at once</span>.
          </h2>
          <p className="sub reveal-up">
            Calculate your APS in sixty seconds. Every programme in South Africa, tagged with the pathway badge that matches your profile. No more guessing which door to knock on.
          </p>
          <div className="actions reveal-up">
            <Link href="/" className="btn btn-accent btn-lg">Render my future <span className="arr">→</span></Link>
            <Link href="/programmes" className="btn btn-outline btn-lg">Browse all 9,412 programmes</Link>
          </div>
          <div className="final-grid">
            <div className="reveal-up">
              <h4>The taxonomy is the index</h4>
              <p>The four pathway badges appear next to every programme on the platform. Filter by them, compare across them, sort funding against them. We don&apos;t hide the longer routes — we make them legible. Every student deserves to see all four of their options.</p>
            </div>
            <div className="reveal-up">
              <h4>Related reading</h4>
              <nav className="next" aria-label="Related pages">
                <Link href="/programmes"><span>Browse programmes · filter by pathway</span><span className="arr">→</span></Link>
                <Link href="/bursaries"><span>NSFAS &amp; bursary funding · all pathways</span><span className="arr">→</span></Link>
                <Link href="/careers"><span>Careers by pathway · salary &amp; growth</span><span className="arr">→</span></Link>
                <Link href="/for-institutions"><span>Source: USAf / CHE methodology</span><span className="arr">→</span></Link>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-row">
            <Link href="/" className="brand">
              <div className="brand-mark" aria-hidden="true">P</div>
              <span className="brand-name">Prospectus</span>
              <span className="brand-tag" style={{ color: 'hsl(var(--bg) / 0.6)', borderColor: 'hsl(var(--bg) / 0.2)' }}>marks → future</span>
            </Link>
            <div className="footer-links">
              <Link href="/programmes">Programmes</Link>
              <Link href="/bursaries">Bursaries</Link>
              <Link href="/careers">Career explorer</Link>
              <Link href="/pathways">Pathways</Link>
              <Link href="/for-institutions">For institutions</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-meta">
            <span>© 2026 Prospectus · built in South Africa · v1.4.1</span>
            <span className="serif-tag">Marks in. Future out.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
