# Changelog

All notable changes to the Prospectus platform.

---

## [Unreleased]

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
