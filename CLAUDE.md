@AGENTS.md

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
