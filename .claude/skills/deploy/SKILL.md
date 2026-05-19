---
name: deploy
description: Full deploy pipeline for prospectus-platform — typecheck, commit, push, Vercel production deploy, and smoke-test key routes. Use whenever you want to ship changes.
allowed-tools: Bash, mcp__claude_ai_Vercel__list_deployments, mcp__claude_ai_Vercel__get_deployment, mcp__claude_ai_Vercel__web_fetch_vercel_url, mcp__claude_ai_Vercel__get_deployment_build_logs, Read, Edit
---

# Deploy Skill — prospectus-platform

## Live state

Git status: !`cd C:/Users/tatat/Projects/prospectus-platform && git status --short`
Current branch: !`cd C:/Users/tatat/Projects/prospectus-platform && git branch --show-current`
Unpushed commits: !`cd C:/Users/tatat/Projects/prospectus-platform && git log origin/master..HEAD --oneline 2>/dev/null || echo "none"`

## Process

Run every step in order. Stop and report to the user if any step fails.

### Step 1 — TypeScript check
```bash
cd C:/Users/tatat/Projects/prospectus-platform && npx tsc --noEmit 2>&1
```
- If errors: fix them before continuing. Do NOT skip.
- Common fixes: missing imports in Dashboard.tsx, prop type mismatches, unused variables.

### Step 2 — CHANGELOG.md
- Verify `## [Unreleased]` section documents all changes in the uncommitted diff.
- Add any missing entries. Keep it concise.

### Step 3 — Stage & commit
Stage only source files (never `.agent/`, `.agents/`, `.qwen/`, `_bmad/`):
```bash
git add app/ components/ lib/ public/ supabase/ package.json package-lock.json tsconfig.json CHANGELOG.md
git status --short  # show what's staged
```
Ask user to confirm staged files, then commit:
```bash
git commit -m "<conventional commit message>\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Step 4 — Push
```bash
git push origin master
```
If rejected (non-fast-forward): pull --rebase, resolve conflicts, then push.

### Step 5 — Vercel deploy
```bash
cd C:/Users/tatat/Projects/prospectus-platform && vercel deploy --prod --yes 2>&1
```
Watch for:
- `✓ Compiled successfully` — good
- `Running TypeScript ... Finished TypeScript` — good
- `✓ Generating static pages` — good
- `Command "npm run build" exited with 1` — STOP, get build logs

### Step 6 — Smoke test
After deploy, fetch these routes and verify 200 responses:
- `https://prospectus-platform.vercel.app/` — check for `hero-headline` in HTML
- `https://prospectus-platform.vercel.app/about` — check for `mkt-hero` in HTML
- `https://prospectus-platform.vercel.app/login` — check for `sign in` (case-insensitive)

### Step 7 — Report
Tell the user:
- Commit hash and message
- Vercel deployment URL
- Which routes passed smoke test
- Any warnings from the build output
