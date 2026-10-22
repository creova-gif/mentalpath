# CLAUDE.md — mentalpath

Instructions for AI coding agents working in this repository.

## Project Overview

HealthTech product. Real Supabase backend (`mental_path` project) with committed seed data (`seed_production.sql`, `seed_demo_users_fixed.sql`) and edge functions — currently paused behind the same org-wide unpaid Supabase invoice affecting kaya-rentals and seen. This is not a "missing backend" situation; the backend exists and was seeded, it's just unreachable pending billing resolution.

## Repository Structure

- `supabase/functions/server/` and `supabase/functions/make-server-4d1a502d/` both exist — this is a genuine candidate duplicate (unlike several other repos in the portfolio where a single `server/` directory is mistakenly assumed to be a duplicate when it's actually the only real one). Diff these before assuming either is dead, and check `utils/supabase/info.tsx` plus frontend fetch calls for which slug is actually referenced.

## Current Blocker

Supabase project is `INACTIVE` pending an org-level invoice. No live schema/RLS verification possible until resolved.

## Technology Stack

Confirmed real test infrastructure exists in this repo (test + build CI tier) — check `package.json` scripts before assuming test coverage is absent.

## AI Agent Rules

- Do not describe this repo as having "no backend" — it has one, seeded, just currently paused.
- Verify which of the two edge function directories is live before modifying either.

## Definition of Done

Any backend change is made against the confirmed-live function directory, not assumed based on directory name alone.
