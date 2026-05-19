# Changelog

All notable changes to the Prospectus platform.

---

## [Unreleased]

### Added — Test suite: 138 tests, 0% → full coverage of critical modules
- **Framework** — Vitest + `@vitest/coverage-v8`; `npm test` / `npm run test:coverage` scripts added
- `tests/lib/utils.test.ts` — `apsPoints` (all 7 band boundaries), `calcAPS` (LO filtering, best-6 selection, sample dataset), `fmtR`
- `tests/lib/scoring.test.ts` — `scoreCareerMatch` output clamp [35, 97], APS gate (at/below/no-minAps), Big Five above-`hi` penalty, known exact score (Teacher profile = 93); `computeStrategicScore` all sub-score formulas (academic_readiness capped at 95, 5 income bands, 3 merit bonus thresholds, skill_readiness excludes academic/career readiness from mean, overall weighted composite); `rankCareersByMatch` sort order and property preservation; `getCareerCapRequirements` / `getCareerBigFiveRanges` key mapping and keyword inference fallback
- `tests/proxy.test.ts` — /dashboard and /onboarding protected when unauthenticated; /login, /signup, /forgot-password redirect authenticated users to dashboard; /reset-password passes through when authenticated; Supabase error and thrown exception both treated as unauthenticated
- `tests/actions/auth.test.ts` — `signIn` (error, redirect); `signUp` (no siteUrl guard, email-confirmation path, immediate-session redirect, Supabase error); `signOut`; `signInWithGoogle` (no siteUrl, OAuth URL, no URL returned); `requestPasswordReset`; `updatePassword` (length < 8, mismatch, auth failure, success)
- `tests/actions/saveOnboarding.test.ts` — auth guard; `user_profiles` upsert before parallel psych+caps upserts; `academic_readiness` = mean(analytical_thinking, perseverance); `career_readiness` = mean(communication_skills, leadership_potential); APS computed and stored; strategic score shape validation; non-blocking insert (resolved error ignored, redirect still fires)
- `tests/actions/generateInsight.test.ts` — auth guard; fallback copy for all 4 context types when `ANTHROPIC_API_KEY` absent; API call shape (model `claude-opus-4-6`, max_tokens 400, South African system prompt); empty content array → error; thrown API error → error
- `tests/actions/saveApplication.test.ts` — duplicate deduplication (returns existing id without inserting); insert payload (status=draft, deadline, user_id); insert error propagation
- `tests/actions/toggleSavedProgramme.test.ts` — delete path (eq filter args, returns `{ saved: false }`); insert path (payload user_id + programme_id, returns `{ saved: true }`); error propagation for both paths
- `tests/actions/saveSubjects.test.ts` — update payload, user_id filter, error propagation

### Fixed — Code review: 6 bugs patched across 5 pages
- `components/pages/SkillsPage.tsx` — Big Five alignment card: filter out null/undefined psychProfile trait values before mapping; prevents misleading 0-score display for traits the user hasn't completed
- `components/pages/ScholarshipsPage.tsx` — Guard `withLiveMatch.length > 0` before rendering Top Priority / Stacking Strategy cards to prevent crash when `SCHOLARSHIPS` is empty
- `components/pages/ApplicationDetailPage.tsx` — `deriveStages()`: add explicit cases for `'info'` (in-review → docs done, awaiting decision) and `'warning'` (pending/queried → docs need attention) status values; deduplicate comms log by offsetting "Documents under review" entry +3 days from submission date
- `components/pages/SubjectDetailPage.tsx` — Trajectory table `isCurrent` highlight: replaced ambiguous `row.mark + 5 > subject.mark` logic with exact match against `currentTrajMark` (largest trajectory row ≤ subject.mark) so exactly one row is highlighted
- `components/pages/NSFASPage.tsx` — Dependants input `min` changed from `1` → `0` to allow independent students with no dependants

### Added — Phase 9: One living product — last-mile data wiring + detail page depth

**Student model rippled everywhere (last-mile gaps closed):**
- `components/pages/HomePage.tsx` — Funding KPI now computed live from `computeNsfas()` + `computeBursary()` using real `householdIncome` + `userAps`; "3 things to move the needle" section replaced with `buildFocusItems()` — derives urgent app deadlines, APS leverage opportunities (lowest subject + nearest unlockable programme), and saved-programme reminders from real data
- `components/Dashboard.tsx` — `SimulatorPage` now receives `displaySubjects` instead of live `subjects`, making `emptyMode` consistent; `liveCareerMatches` `useMemo` computed from scoring engine and threaded to `CompareDrawer` and `CareerComparePage`
- `components/CompareDrawer.tsx` — Accepts `liveCareerMatches` prop; career subtitles now show live-scored match%, not cached static values

**Detail pages with real depth:**
- `components/pages/ApplicationDetailPage.tsx` — Added `deriveStages()` (maps `status`/`submitted`/`decided` to timeline stages); `buildDocs()` makes checklist status-aware (submitted = standard docs done); `fmtDate()` formats ISO timestamps; comms log entries use real dates and are hidden when no data exists
- `components/pages/CareerDetailPage.tsx` — Path viz "Required subjects" now computed from top programme's APS via `inferSubjectsFromAps()`; clicking a leading programme now navigates to its detail (`navigate('programmes', p.id)`); salary trajectory shows Year 1 / Year 5 / Year 10 labels; `navigate` prop updated to accept optional `prog` arg
- `components/pages/SubjectDetailPage.tsx` — New mark trajectory table: shows APS pts + total APS + new programmes unlocked at marks 50–80; new "Your saved programmes" card shows APS eligibility gap per saved programme; accepts `savedProgrammeIds` prop (threaded from Dashboard)
- `components/pages/CareerComparePage.tsx` — Accepts `psychProfile`, `capabilityData`, `userAps`, `liveCareerMatches` props; career match scores use live `scoreCareerMatch()` rather than static DB values

### Added — Phase 8: Deep personalisation Round 4 (Big Five, real match scores, dynamic scholarships, NSFAS dependants, live deadlines)
- `lib/scoring.ts` — Added `CareerBigFiveRanges` interface and `getCareerBigFiveRanges(careerName)` export; returns ideal `[lo, hi]` tuples per Big Five trait for any career archetype
- `components/pages/SkillsPage.tsx` — New Big Five personality alignment card: zone-bracket overlay on meter bars shows ideal range for top-matched career; traits sorted in-zone first; gap notes at 3 severity levels
- `components/pages/ProgrammePage.tsx` — Match breakdown now uses real scores: Academic fit = `Math.min(100, aps/p.aps * 100)`, Capability fit = mean of 4 core capability dims, Market fit = demand tier (90/65/40); color-coded by threshold
- `components/pages/ScholarshipsPage.tsx` — Top priority card and stacking strategy both derived from live `withLiveMatch` scores; highest-match scholarship (tie-broken by earliest deadline) replaces hardcoded Allan Gray; service contract scholarships flagged in stacking note
- `components/pages/NSFASPage.tsx` — Dependants input now wires to threshold: base R350k + R25k per additional dependant (capped R600k); estimated award includes dependant food-allowance bonus (R2.5k each, capped R8k); threshold label shows computed value
- `components/pages/DeadlinesPage.tsx` — Accepts `applications?: DbApplication[]` prop; real application deadlines merged into timeline with correct urgency classification (≤7 days = Urgent, ≤21 = Soon); apps without deadline silently skipped
- `components/Dashboard.tsx` — Passes `applications` to `DeadlinesPage`; `emptyMode` suppresses real deadlines

### Added — Phase 7: Deeper personalisation Round 3 (scoring engine connections)
- `lib/scoring.ts` — New file: 16 SA career archetypes with RIASEC weights, capability requirements, Big Five ideal ranges; `scoreCareerMatch()` (RIASEC 38% + Capabilities 30% + Big Five 15% + APS gate 17%); `rankCareersByMatch()`, `getCareerCapRequirements()`, `getCareerCapRequirements()`
- `lib/types.ts` — Added `scarce_skill?: boolean` to `Career` interface
- `app/dashboard/page.tsx` — `mapDbCareerToCareer` maps `scarce_skill` from DB row
- `components/pages/IntelligencePage.tsx` — Exposes all 6 strategic sub-scores (was 4); reads live values from `strategicScore` prop
- `components/pages/FundingPage.tsx` — Full rewrite: `computeNsfas()` and `computeBursary()` with real SA policy bands; 3-year cost projection at 4.8% HEI inflation; dynamic scholarship commentary from `SCHOLARSHIPS` data
- `components/pages/ProgrammePage.tsx` — `getCareerCluster()` keyword function maps programme name to career cluster (8 types + fallback); career paths show live `scoreCareerMatch()` percentages when profile present
- `components/pages/DiscoverPage.tsx` — `buildInsightText()` reads dominant RIASEC type and top capabilities from real profile data; AI insight card personalised per user
- `components/pages/CareersPage.tsx` — `scarce_skill` badge surfaced per career card
- `components/pages/CareerDetailPage.tsx` — `scarce_skill` badge in detail header

### Added — Phase 6: Mobile polish + navigation connective tissue
- `components/Sidebar.tsx` — `isOpen`/`onClose` props; `.sidebar.open` class toggled from Dashboard; close button rendered inside sidebar
- `components/Topbar.tsx` — Hamburger button wired to `onMenuClick`; search bar gets `topbar-search` class so CSS hides it at ≤900px
- `components/Dashboard.tsx` — `sidebarOpen` state lifted here; backdrop div toggles `.open`; `navigate` callback closes sidebar; new props threaded to Sidebar and Topbar
- `components/pages/MapPage.tsx` — Inline `gridTemplateColumns` replaced with `.grid-2-asym` class for responsive layout
- `components/pages/ProfilePage.tsx` — Inline `gridTemplateColumns: repeat(3,1fr)` replaced with `.grid-3`

### Added — Phase 4: Design system expansion (9 new pages + global UI)
- `lib/types.ts` — Expanded `Route` union (+9 routes: `unis`, `compare`, `discover`, `scholarships`, `nsfas`, `applications`, `documents`, `deadlines`, `profile`); added `University` and `CompareItem` interfaces; extended `Application` with `id`, `short`, `progId`, `submitted`, `decided`, `fee`
- `lib/data.ts` — Added `UNIS` array (10 SA institutions: UCT, Wits, SUN, UP, UKZN, UJ, UWC, RU, CPUT, TUT); updated `APPS` with rich tracking fields
- `app/globals.css` — Added ~175 lines: `.aps-chip`, `.search-wrap/.search-icon/.search-input/.search-kbd`, `.icon-btn/.avatar-btn`, `.profile-menu/.pm-head/.pm-list/.pm-item`, `.cmdk-backdrop/.cmdk/.cmdk-inputwrap/.cmdk-input/.cmdk-results/.cmdk-section/.cmdk-row/.cmdk-foot`, `.compare-drawer/.cd-head/.cd-list/.cd-chip/.cd-k`
- `components/Topbar.tsx` — Full rewrite: live APS chip with delta badge, search bar with ⌘K hint, notification/message icon buttons, Apply CTA, avatar profile menu with sign-out, full ⌘K command palette (keyboard-navigable, filters all pages/programmes/careers)
- `components/Sidebar.tsx` — All 9 new routes wired; pills on Discover (AI), Scholarships (3 new), Applications (4), Intelligence (PRO)
- `components/Dashboard.tsx` — Imports all 9 new pages + CompareDrawer; lifts `compareItems` state with `toggleCompare`/`clearCompare`; passes live `aps`/`apsDelta` to Topbar
- `components/CompareDrawer.tsx` — New: fixed bottom-right drawer, persists across page navigation, shows up to 4 items with kind badges and Remove buttons
- `components/pages/UniversitiesPage.tsx` — New: 10 SA institutions, tabs (All/Eligible/Tier 1/Tier 2/Private), compare toggle per card
- `components/pages/CareerComparePage.tsx` — New: side-by-side table for up to 4 careers (match, salary, growth, demand, fit meter, why)
- `components/pages/DiscoverPage.tsx` — New: live search across programmes + careers, category browse (STEM/Finance/Health/Law/Arts/Education), AI insight card
- `components/pages/ScholarshipsPage.tsx` — New: 5 matched scholarships, 4 tabs (All/Closing soon/High value/My applications), match circles, stacking strategy commentary
- `components/pages/NSFASPage.tsx` — New: interactive calculator (income, dependants, residence type), live estimated award breakdown, NSFAS category explainers
- `components/pages/ApplicationsPage.tsx` — New: pipeline tracker with click-to-expand detail panel, tabs (All/Submitted/Pending/Accepted), stage pipeline visualisation
- `components/pages/DocumentsPage.tsx` — New: document vault grouped by category (Identity/Academic/Household/Financial), upload/view per doc, missing count badge
- `components/pages/DeadlinesPage.tsx` — New: all deadlines grouped by Urgent/Soon/Upcoming with date boxes and urgency badges
- `components/pages/ProfilePage.tsx` — New: Personal/Household/Academic/Capability/Activity sections with per-section edit toggle
- `components/pages/CareersPage.tsx` — Added Compare/Open path button pair per career card; props for `compareItems` + `onToggleCompare`
- `components/pages/FundingPage.tsx` — Added 4-year degree cost projection (Years 1–3 meters) and AI strategy commentary section

### Fixed
- `app/actions/generateInsight.ts` — `new Anthropic()` was crashing the server action when `ANTHROPIC_API_KEY` was absent; now checks for the key explicitly and returns a static contextual fallback insight per insight type when the key is not configured
- `app/globals.css` — Added `color: hsl(var(--fg))` to `.cmdk-input` to prevent invisible text in browsers that don't inherit input colour from parent

### Fixed — Auth broken in production (signup, Google OAuth, password reset)
- `app/actions/auth.ts` — `signUp`, `signInWithGoogle`, and `requestPasswordReset` all checked `NEXT_PUBLIC_SITE_URL` and failed immediately in production because `.env.local` is never uploaded to Vercel. Added `getSiteUrl()` helper that falls back to `VERCEL_PROJECT_PRODUCTION_URL` (auto-injected by Vercel), so auth works in production without any manual env var changes.
- Error messages no longer expose internal env var names to end users.
- **Manual step still required:** Supabase → Authentication → URL Configuration → set Site URL to `https://prospectus-platform.vercel.app` and add `https://prospectus-platform.vercel.app/auth/callback` to Redirect URLs.

### Added — Forgot password flow
- `/forgot-password` — email input page; sends Supabase reset link via `requestPasswordReset`
- `/reset-password` — new password form; calls `updatePassword` server action
- `app/actions/auth.ts` — added `requestPasswordReset` and `updatePassword` server actions
- `app/(auth)/login/page.tsx` — added "Forgot password?" link above password field
- `proxy.ts` — `/forgot-password` added to login-only routes; `/reset-password` left accessible to authenticated users too

### Added — Phase 3: AI insight layer
- `app/actions/generateInsight.ts` — server action using `claude-opus-4-6`; builds a structured prompt from real user data (APS, subjects, Big Five, RIASEC, capabilities, strategic score, top programmes/careers) and returns a personalised 2–3 sentence insight
- `components/AiInsightCard.tsx` — client component; calls `generateInsight` on mount via `useTransition`, shows shimmer skeleton while loading, fades in text, exposes a Regenerate button
- `components/pages/HomePage.tsx` — replaced hardcoded AI insight card with `<AiInsightCard type="home">`; added `'use client'`
- `components/pages/CognitivePage.tsx` — replaced 3 hardcoded insight bullets with `<AiInsightCard type="cognitive">`; added `'use client'`
- `components/pages/IntelligencePage.tsx` — replaced hardcoded AI commentary section with `<AiInsightCard type="intelligence">`
- `lib/types.ts` — added `InsightContext` interface
- `app/globals.css` — added `.skeleton` shimmer animation and `fadeIn` keyframe

### Fixed
- `app/actions/saveOnboarding.ts` — FK constraint error on `psychological_profiles`: changed `user_profiles.update()` → `upsert()` (with `onConflict: 'id'`) and made it sequential before the dependent upserts; ensures the parent row exists before FK-constrained tables are written

### Added — Phase 2: Wire stubs (interactivity)
- `saved_programmes` Supabase table with RLS (user-owned saved programmes)
- `app/actions/toggleSavedProgramme.ts` — optimistic save/unsave with DB persistence
- `app/actions/saveApplication.ts` — create draft application in `student_applications`
- `components/pages/CareersPage.tsx` — tabs now sort by match/demand/growth/salary
- `components/pages/ProgrammePage.tsx` — save button persists, Saved tab works, Apply button creates DB row
- `components/pages/SimulatorPage.tsx` — impact list rows are now clickable → navigates to programme detail
- `components/pages/IntelligencePage.tsx` — engine layer stats computed from real data (profile completeness, eligible programmes, high-demand careers)
- `components/Dashboard.tsx` — passes `savedProgrammeIds` to ProgrammePage; passes real data to IntelligencePage
- `app/dashboard/page.tsx` — fetches `saved_programmes` in parallel with other queries

### Added — Phase 1: Onboarding wizard
- `app/onboarding/page.tsx` — Server Component route for new-user onboarding
- `components/onboarding/OnboardingWizard.tsx` — 5-step client wizard:
  - Step 1: Name + province + matric year
  - Step 2: Subject marks with live APS calculator
  - Step 3: Big Five personality (10 Likert questions) + RIASEC interests (6 ratings) + work style/motivation
  - Step 4: 8 capability self-ratings
  - Step 5: Household income with live NSFAS eligibility indicator
- `app/actions/saveOnboarding.ts` — Server action: parallel upserts to `user_profiles`, `psychological_profiles`, `capability_graphs`
- `lib/types.ts` — Added `OnboardingData` interface
- `app/dashboard/page.tsx` — Redirects new users to `/onboarding` if no psych profile, capability graph, or province
- `proxy.ts` — Protects `/onboarding` route (auth required)

---

## [2025-05-08] — Initial full platform

### Added
- Supabase SSR auth (login, signup, signout, OAuth callback)
- Dashboard at `/dashboard` — auth-protected, 7 parallel Supabase queries
- 10 dashboard pages: Home, Intelligence, Simulator, Programmes, Funding, Financial, Careers, Cognitive, Skills, Map
- `proxy.ts` — session refresh + route protection (Next.js 16 convention, replaces deprecated middleware)
- Public landing page at `/` with hero, stats bar, features, how-it-works, CTA sections
- GitHub: Orateng12/prospectus-platform
- Vercel deployment: prospectus-platform.vercel.app
