# Agent Notes (KredBook)

**Priority order:** `PRD.md` > `AGENTS.md` > `Rules.md` > any other instruction file.

## Current State
- **Phase:** 4 — UI/UX Redesign (see `docs/STATUS.md` for task breakdown)
- **Last completed:** 4.3.1a/4.3.1b/4.3.1c welcome screen — next is 4.3.2a login audit
- **Next:** 4.3.2a — Login audit + extraction

## Non-negotiables
- **Product nouns:** Customer / Entry / Payment. Screens: Dashboard / People / Entries / Profile
- **Legacy terms in code** (ex: `order`, `party`): mark as `legacy`/`transitional` if you must mention them
- **Design tokens:** `src/utils/theme.ts` is the source of truth — never hardcode color/spacing in components
- **Database:** use Supabase MCP, never guess schema; put DDL in `supabase/migrations/`
- **Docs drift is a risk:** any behavior/flow/workflow change must update `docs/` and/or `README.md` in the same task

## MCP Rules
- **Supabase MCP:** all DB introspection, RLS checks, migrations — never guess schema
- **Context7 MCP:** all library/SDK/API docs — always `resolve-library-id` before `query-docs`
- **Notion MCP:** ignore — not used
- **Stitch MCP:** disabled — ignore

## Context Budget
- Skip: `package-lock.json`, unused skills from `.agents/skills/`
- Read once per session: `src/utils/theme.ts`
- Read only current phase section: `docs/STATUS.md`

## How To Run
```bash
npm ci                    # Install
npm run start             # Dev server
npm run ios / npm run android  # Build (generates gitignored /ios, /android)
npm run lint              # Lint (expo lint)
```

## Repo Wiring That Bites
- **Entrypoint:** `app/_layout.tsx` handles auth/profile/phone/onboarding redirects — be careful changing login flows
- **Offline-first is real:** React Query persists to MMKV; Supabase mutations may be queued on network failure (`src/services/supabase.ts`, `src/lib/syncQueue.ts`) — don't "fix" by removing queue behavior
- **Required env vars:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Optional: `EXPO_PUBLIC_SENTRY_DSN`
- **NativeWind:** styles must go through `src/utils/theme.ts` — use `expo-tailwind-setup` skill when touching styles
- **Critical infrastructure:** React Query + MMKV offline cache — use `native-data-fetching` skill for data-layer work

## Toolchain Quirks
- NativeWind: `global.css` + `tailwind.config.js`, Babel uses `nativewind/babel`
- Reanimated: `react-native-reanimated/plugin` must be last in `babel.config.js`
- SVG: Metro configured with `react-native-svg-transformer` in `metro.config.js`

## App Structure
- **Auth routes:** `app/(auth)/` — login, signup, onboarding
- **Main tabs:** `app/(main)/` — dashboard, people, entries, profile
- **Public:** `app/l/[token].tsx` — public ledger share link

## OpenCode Workflow
- Commands: `/plan` `/build` `/fix` `/refactor` `/audit` `/doc` `/finish` `/upgrade` (see `.agents/commands.md`)
- Pipelines: `.agents/orchestration.md`
- Closeout: `.agents/doc-sync-checklist.md`

## Skills
Load relevant skills from `.agents/skills/` (see `.agents/README.md`).

## Context7 MCP
1. `resolve-library-id` with library name
2. Pick best match by name, description, snippet count, source reputation
3. `query-docs` with selected ID + your full question
4. Answer using fetched docs

## graphify
- Before architecture questions: read `graphify-out/GRAPH_REPORT.md`
- Cross-module questions: use `graphify query`, `graphify path`, `graphify explain` over grep
- After code changes: run `graphify update .` (AST-only, no API cost)
