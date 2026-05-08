# Changelog

All notable changes to the Prospectus platform.

---

## [Unreleased]

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
