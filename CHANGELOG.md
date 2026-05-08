# Changelog

All notable changes to the Prospectus platform.

---

## [Unreleased]

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
