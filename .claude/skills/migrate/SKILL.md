---
name: migrate
description: Create and apply a Supabase migration for this project. Use when adding tables, columns, RLS policies, indexes, or any schema change.
allowed-tools: mcp__claude_ai_Supabase__apply_migration, mcp__claude_ai_Supabase__list_migrations, mcp__claude_ai_Supabase__execute_sql, mcp__claude_ai_Supabase__list_tables, mcp__claude_ai_Supabase__get_advisors, mcp__claude_ai_Supabase__generate_typescript_types, Read, Edit, Write, Bash
---

# Supabase Migration Skill

## Context

Project: prospectus-platform
Supabase project ID: in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`

Current migrations: !`ls supabase/migrations/ 2>/dev/null | sort || echo "No local migrations directory"`

Existing tables (from codebase): user_profiles, psychological_profiles, capability_graphs, student_applications, saved_programmes, scholarship_applications, ai_insights, notifications, user_documents, strategic_score_records

## Process

Follow these steps exactly:

### Step 1 — Understand the change
- Ask the user what they need (if not already specified in $ARGUMENTS)
- Use `list_tables` to check existing schema before proposing anything
- Use `execute_sql` to inspect existing column definitions if modifying a table

### Step 2 — Draft the SQL
Write clean, production-safe SQL:
- Always add `IF NOT EXISTS` on CREATE TABLE
- Always add RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- Default RLS policy: user owns their rows via `auth.uid() = user_id`
- Add indexes on foreign keys and commonly filtered columns
- Use `timestamptz` for all timestamps (not `timestamp`)
- Never use `serial` — use `uuid` with `gen_random_uuid()` as default

Example pattern:
```sql
create table if not exists my_table (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table my_table enable row level security;

create policy "Users manage own rows"
  on my_table for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on my_table(user_id);
```

### Step 3 — Review with user
Show the full SQL and explain what it does. Wait for approval.

### Step 4 — Apply
Use `apply_migration` with a descriptive name (snake_case, no timestamp prefix needed).

### Step 5 — Update types
After applying, use `generate_typescript_types` and update `lib/types.ts` with any new DB row types needed.

### Step 6 — Update CHANGELOG.md
Add an entry under `## [Unreleased]` → `### DB` describing the migration.

### Step 7 — Commit
Stage and commit: `git add lib/types.ts CHANGELOG.md && git commit -m "DB: <description>"`
