@AGENTS.md

# Workflow rules
- **Always update `CHANGELOG.md`** before every commit and push. Add entries under the relevant `[Unreleased]` section (or create a new dated section). Include what changed and why.

# Architecture

## Routes
- `/` — Public landing page (static)
- `/login`, `/signup` — Auth pages (static)
- `/auth/callback` — OAuth code exchange (dynamic)
- `/onboarding` — New-user profile wizard (dynamic, auth-required)
- `/dashboard` — Main app shell (dynamic, auth-required)

## Auth & Session
- `proxy.ts` (project root) — Next.js 16 proxy (replaces deprecated `middleware.ts`)
  - Refreshes Supabase session on every request
  - Protects `/dashboard` and `/onboarding` — redirects to `/login` if unauthenticated
  - Redirects authenticated users away from `/login` and `/signup`

## Data flow
- `app/dashboard/page.tsx` — Server Component; runs 7 parallel Supabase queries, passes all data as props to `<Dashboard />`
- `components/Dashboard.tsx` — Client Component; manages route state, renders one of 10 page components

## Supabase tables written to
| Table | Written by |
|-------|-----------|
| `user_profiles` | auth trigger (on signup), `saveSubjectMarks`, `saveOnboarding` |
| `psychological_profiles` | `saveOnboarding` |
| `capability_graphs` | `saveOnboarding` |
| `student_applications` | `saveApplication` |
| `saved_programmes` | `toggleSavedProgramme` (upsert/delete, RLS-protected) |

## Server actions (`app/actions/`)
- `auth.ts` — signIn, signUp, signOut
- `saveSubjects.ts` — update subject_marks in user_profiles
- `saveOnboarding.ts` — 3-table parallel upsert (profiles + psych + capabilities)

## Design system
All styles in `app/globals.css` — custom CSS variables + utility classes. No external UI library.
Key classes: `.card`, `.btn`, `.btn-primary`, `.btn-brand`, `.input`, `.badge`, `.meter`, `.grid-2/3/4`, `.stack`

## Onboarding trigger
`app/dashboard/page.tsx` redirects to `/onboarding` when:
- `psychological_profiles` row is null AND
- `capability_graphs` row is null AND
- `user_profiles.province` is null

## Scoring engine (`lib/scoring.ts`)
- 16 SA career archetypes: RIASEC weights, `capRequirements` (10 capability dims), `bigFive` ideal ranges `[lo, hi]`
- `scoreCareerMatch(name, psychProfile, capabilityData, aps)` — RIASEC 38% + Capabilities 30% + Big Five 15% + APS gate 17%
- `rankCareersByMatch(careers, psychProfile, capabilityData, aps)` — returns sorted array with `personalScore`
- `getCareerCapRequirements(name)` — returns `Partial<CapabilityData>` of required scores
- `getCareerBigFiveRanges(name)` — returns `CareerBigFiveRanges` with `[lo, hi]` tuples per Big Five trait

## Personalisation data flow
- `psychProfile` (RIASEC + Big Five) flows from `psychological_profiles` DB table → `app/dashboard/page.tsx` → `Dashboard` → page components
- `capabilityData` (10 dims) flows from `capability_graphs` DB table → same path
- Pages using live scoring: `CareersPage`, `SkillsPage`, `ProgrammePage`, `DiscoverPage`, `IntelligencePage`, `CareerDetailPage`, `ScholarshipsPage`, `CareerComparePage`
- `emptyMode` (toggled in ProfilePage) suppresses all real data → shows placeholder state across ALL pages including SimulatorPage
- `liveCareerMatches` — `useMemo` in Dashboard.tsx, computed from `scoreCareerMatch()` for all careers, threaded to `CompareDrawer` (subtitles) and `CareerComparePage` (comparison rows)

## Detail page conventions
- `navigate(r: Route, prog?: string)` — second arg sets `selectedProg` in Dashboard, opening ProgrammePage at that programme's detail
- `ApplicationDetailPage` — derives timeline stages from `status`/`submitted`/`decided` via `deriveStages()`; doc checklist is status-aware via `buildDocs()`
- `SubjectDetailPage` — mark trajectory table shows new programmes unlocked per mark threshold; `savedProgrammeIds` prop shows saved-programme APS gaps
- `CareerDetailPage` — `inferSubjectsFromAps(minAps)` drives required subjects in path viz; clicking a leading programme navigates to its detail
