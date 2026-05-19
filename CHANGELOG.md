# Changelog

All notable changes to the Prospectus platform.

---

## Phase 12 — Real document vault, AI insight caching, notification bell (2026-05-19)

### New features
- **Document vault** — real Supabase Storage uploads (`documents` bucket, 10 MB limit, PDF/JPEG/PNG/HEIC/WebP). Each document type stored at `{userId}/{docType}.{ext}` with an upsert so re-uploading replaces the previous file. Signed URLs (1 h TTL) generated server-side on each page load so View links are instant.
- **Delete with confirmation** — inline delete flow in DocumentsPage; storage object + DB row removed atomically.
- **AI insight caching** — `getInsight` action checks `ai_insights` for a non-dismissed insight < 24 h old before calling Claude. On cache miss, generates via Claude and persists to DB so the next load is instant. Fallback text (no API key) is returned but not persisted. Insights are dismissible (✕ button → `dismissInsight` action sets `dismissed = true` in DB).
- **Notification bell** — unread count from `notifications` table (server-side query) wired into Topbar. Red dot only renders when `unreadNotificationCount > 0`.

### DB
- `user_documents` table (`id, user_id, doc_type, file_name, storage_path, file_size, mime_type, uploaded_at`) — unique on `(user_id, doc_type)`; RLS restricts to owner.
- `storage.buckets` — `documents` bucket created (private, 10 MB, allowed MIME types).
- Storage RLS policies — upload / select / update / delete guarded by `foldername(name)[1] = auth.uid()`.

### New server actions
- `uploadDocument(FormData)` — validates MIME type + size, uploads to Storage (upsert), upserts `user_documents` row.
- `deleteDocument(docType)` — fetches storage path from DB, removes from Storage, deletes DB row.
- `getInsight(context, force?)` — DB-first with 24 h TTL cache; persists Claude responses to `ai_insights`.
- `dismissInsight(id)` — sets `dismissed = true` scoped to authenticated user.

### Types
- `DbDocument` — shape for `user_documents` rows + `signed_url`.
- `DbNotification` — shape for `notifications` rows.

### Tests
- `uploadDocument` — 9 cases covering auth, validation, storage errors, DB errors, success, and path construction.
- `deleteDocument` — 7 cases covering auth, not-found, storage errors, DB errors, success, and correct path passed to `remove`.
- `dismissInsight` — 4 cases covering auth, success, DB error, and correct `eq` filters.
- `getInsight` — 5 cases covering auth, cache hit, cache miss + persist, force bypass, persistence failure resilience, and no-persist for fallback.

---

## [Unreleased]

### Added — Landing redesign + marketing pages
- `/about` marketing page — mission statement, core values (Radical clarity, Free always, Whole-person matching, Privacy by default), problems solved for SA students
- `/pricing` page — "Free. Always." model, full feature list (1600+ programmes, AI career matching, bursary/NSFAS screening, application tracker), comparison table, FAQ
- `components/landing/HeroSection` — reusable hero with SA-focused copy ("Every opportunity you didn't know existed") and animated eligibility card
- `components/landing/EligibilityResultsCard` — animated eligibility results display component
- `components/landing/AppWindowCard` — desktop-style window card component
- `components/landing/CountUp` — number count-up animation component
- `framer-motion` v12 dependency for UI animations
- Fraunces (variable serif display) + Plus Jakarta Sans fonts via Google Fonts
- Editorial typography design system: `display-xl`, `kicker`, `lede`, `number-xl` classes
- Marketing layout helpers: `landing-container`, `section-gap`, `mkt-page` scope
- Extended color palette: ink, paper, chalk, amber editorial tones

### Changed — Landing redesign + marketing pages
- `app/page.tsx` — full homepage redesign using new `HeroSection` component; richer SA-focused copy emphasising "89 institutions", "NSFAS", "TVET pathways"; added `nscPoints()` and `progBracket()` helpers; `provinces` (9 SA provinces with institution counts) and `familiar` (3 common student questions) data arrays
- `app/layout.tsx` — updated metadata title to "Prospectus — South Africa's University Decision Engine"; comprehensive value-prop description; applied Fraunces + Plus Jakarta Sans font variables to HTML root
- `components/Sidebar.tsx` — navigation consolidated; removed standalone pages (financial, skills, map, discover, nsfas, documents, deadlines, compare) which now live as tabs within parent pages; backward-compatible via `Route` type
- `components/Dashboard.tsx` — component signature and prop handling updated to match consolidated routing
- `components/pages/ApplicationsPage.tsx` — full feature implementation with application tracking, timeline stages, document checklist
- `components/pages/CareersPage.tsx` — enhanced career-matching UI with live scoring display
- `components/pages/CognitivePage.tsx` — cognitive and personality assessment section expanded
- `components/pages/FundingPage.tsx` — complete funding hub redesign covering NSFAS, bursaries, scholarships
- `components/pages/SimulatorPage.tsx` — APS simulator with interactive mark controls
- `components/pages/UniversitiesPage.tsx` — universities browser with province/type filtering
- `lib/types.ts` — route backward-compatibility comments documenting removed sidebar items

---

### Added — Phase 11: Application Lifecycle + Real Values Everywhere

**New server actions:**
- `app/actions/updateApplication.ts` — updates `student_applications` for `{status, notes}`; automatically sets `applied_at` when status transitions to `submitted`; user-scoped with double `.eq('id').eq('user_id')` guard
- `app/actions/deleteApplication.ts` — hard-deletes a `student_applications` row; user-scoped
- `app/actions/toggleScholarshipApplication.ts` — checks for existing row via `maybeSingle()`; inserts → `{ applied: true }` if absent; deletes → `{ applied: false }` if present; writes to new `scholarship_applications` table

**Supabase migration:**
- `scholarship_applications` table — `id, user_id, scholarship_name, applied_at`; RLS policy restricts to `auth.uid() = user_id`

**ApplicationDetailPage rewritten (`components/pages/ApplicationDetailPage.tsx`):**
- Status-update buttons: "Mark submitted" (draft), "Mark accepted"/"Mark rejected" (submitted); each calls `updateApplication` then `router.refresh()`
- Editable notes textarea — saves via `updateApplication`
- "Delete application" with inline confirmation; calls `deleteApplication`, refreshes, navigates to applications list

**ApplicationsPage extended (`components/pages/ApplicationsPage.tsx`):**
- `AddApplicationModal` component — search over real `programmes` prop; optional deadline field; calls `saveApplication` + `router.refresh()` on submit
- "+ Add application" button now opens the modal

**ScholarshipsPage wired (`components/pages/ScholarshipsPage.tsx`):**
- Accepts `appliedScholarshipNames: string[]` prop (from DB via 9th parallel query in dashboard)
- `localApplied: Set<string>` state for optimistic UI — updated immediately before server round-trip
- "Apply" button shows "✓ Applied" for applied scholarships; calls `toggleScholarshipApplication`
- "My applications" tab renders actual applied list with "Withdraw" affordance
- Applied badge count is real (`localApplied.size`)

**DeadlinesPage rewritten (`components/pages/DeadlinesPage.tsx`):**
- Static deadlines replaced with `BURSARY_DEADLINES` array (Allan Gray, Investec, Standard Bank) using month/day anchors
- `computeDynamic(month, day, today)` — computes real days remaining with year rollover; tags as Urgent (≤7d) / Soon (≤21d)
- "Add deadline" opens inline form → appends to `customDeadlines` state
- AI reminder text computed dynamically from urgency groups (e.g. "1 deadline closing in 7 days")

**FundingPage: real programme data (`components/pages/FundingPage.tsx`):**
- Now accepts `programmes?: Programme[]` prop; derives `topProg` as highest-fit programme
- `year1Cost = topProg ? Math.round(topProg.fees * 1.8) : 165_420` — reflects real programme fees
- "Switch programme" → `navigate('programmes')`; "View applications" → `navigate('applications')`

**NSFASPage (`components/pages/NSFASPage.tsx`):**
- "Open NSFAS application" button changed to `<a href="https://my.nsfas.org.za" target="_blank">` — actually opens the portal

**Data threading — real values closed:**
- Applications SELECT: `programmes ( name, institutions ( name ) )` nested join — institution name no longer ever "Unknown Institution"
- `saveApplication` now fetches `institution_id` from `programmes` before inserting
- `matric_year` added to profile SELECT; passed to Dashboard → ProfilePage; editable in ProfilePage
- `appliedScholarshipNames` 9th parallel query added to `app/dashboard/page.tsx`; threaded to ScholarshipsPage
- `programmes` + `navigate` now passed to FundingPage
- `programmes` now passed to ApplicationsPage

**New tests — Phase 11 (`tests/actions/`):**
- `updateApplication.test.ts` (6 cases) — auth guard; success; DB error; `applied_at` set on submit status; `applied_at` absent for non-submit status; `notes` field included
- `deleteApplication.test.ts` (4 cases) — auth guard; success; DB error; double-eq filter verified
- `toggleScholarshipApplication.test.ts` (4 cases) — auth guard; insert + `{ applied: true }`; delete + `{ applied: false }`; insert error propagation

**TypeScript fix:**
- `tests/proxy.test.ts` — eliminated pre-existing `__type` / `location` type errors by casting mock results through `unknown` via local helper `r()`

---

### Added — Phase 10: Profile Ownership — students can now edit and persist their own data

**New server action:**
- `app/actions/updateProfile.ts` — upserts `user_profiles` for any subset of `{first_name, last_name, province, household_income}`; when income changes, fetches psych + capability profiles, recomputes `computeStrategicScore`, and inserts a new `strategic_score_records` row so the Intelligence dashboard reflects the updated financial picture immediately

**ProfilePage now fully editable (`components/pages/ProfilePage.tsx`):**
- Personal section (first name, last name, province) — controlled inputs; province uses a `<select>` with all 9 SA provinces; "Cancel" reverts without saving; "Save changes" calls `updateProfile` and refreshes server data via `router.refresh()`
- Household section — editable income field; saves via `updateProfile`; NSFAS eligibility badge updates live from the edited income; hardcoded "Dependants: 3 / SASSA: No" rows removed (data not in DB)
- Academic section — mark inputs per subject in edit mode; live APS recompute shown while editing; saves via `saveSubjectMarks` and propagates new subjects to Dashboard state via `onSubjectsSaved` callback
- Capability section — read-only (set during onboarding; no edit path in Phase 10)
- Error messages surfaced inline per section; cancel-without-save is safe

**Data threading (`app/dashboard/page.tsx` + `components/Dashboard.tsx`):**
- `user.email` now passed to Dashboard (was always in props but wired as `''`)
- `userLastName` added to Dashboard props and threaded to ProfilePage so first/last name can be edited independently
- `onSubjectsSaved` callback wired from Dashboard's existing `handleSubjectsSaved` to ProfilePage

**`app/actions/saveSubjects.ts` extended:**
- Now also writes `aps_score: calcAPS(subjects)` alongside `subject_marks` so the stored APS stays in sync after a profile edit
- Explicit `Promise<{ success: true } | { error: string }>` return type added for clean inference

**New tests — `tests/actions/updateProfile.test.ts` (9 cases, 147 total):**
- Auth guard; upsert error propagation; name/province field mapping (`firstName → first_name` etc.); undefined fields excluded from payload; strategic score path not triggered without income; strategic score insert shape and user_id; non-blocking insert failure (still returns `{ success: true }`); skips recompute when psych/cap data absent

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
