# KredBook

**KredBook** is a simple digital khata for small businesses in India.

It helps one business owner:
- manage **Customers**
- record **Entries** for money owed
- record **Payments** for money collected
- see total outstanding on the **Dashboard**
- manage settings and export from **Profile**

## Current Status

**Phase 4 — UI/UX Redesign** (active)

Full design system overhaul, screen-by-screen component extraction and premium rebuild. See `docs/STATUS.md` for task-level tracking.

## Canonical Product Language

| Concept | Term |
|---|---|
| Business entity | **Customer** |
| Money owed | **Entry** |
| Money collected | **Payment** |
| Screens | **Dashboard**, **People**, **Entries**, **Profile** |

Legacy code terms (`order`, `party`, `vendor`) are transitional — do not use in new docs or UI.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Routing | Expo Router |
| Styling | NativeWind + `src/utils/theme.ts` design tokens |
| Local state | Zustand |
| Server state | TanStack Query |
| Backend | Supabase (Postgres + RLS + Storage) |
| Offline sync | MMKV-backed mutation queue |

## Local Development

```bash
npm ci                          # Install dependencies
npm run start                   # Expo dev server
npm run android                 # Android build (generates gitignored /android)
npm run ios                     # iOS build (generates gitignored /ios)
npm run lint                    # ESLint
```

### Environment Variables

Create `.env.local` at root:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Optional:
EXPO_PUBLIC_SENTRY_DSN=https://sentry-dsn-url
```

## Documentation Map

### Root — Source of Truth

| File | Purpose |
|---|---|
| `PRD.md` | Product requirements — scope, flows, roadmap, acceptance criteria |
| `TRD.md` | Technical requirements — architecture, implementation spec |
| `DESIGN.md` | Design system — tokens, shadows, z-index, tab bar, empty states |
| `Schema.md` | Database schema — live-verified against Supabase |
| `Rules.md` | Engineering guidelines — naming, code, PR, and doc rules |
| `AppFlow.md` | End-to-end user journeys |
| `ImplementationPlan.md` | Master roadmap and Phase 4 plan |
| `AGENTS.md` | AI agent configuration |

### `docs/` — Working References

| Path | Purpose |
|---|---|
| `docs/STATUS.md` | Phase tracker — task-level status |
| `docs/SCREEN_FLOWS.md` | Per-route engineering spec (hooks, tokens, state, drift) |
| `docs/flows/*.md` | Screen-level behavior + layout docs |
| `docs/screens/*.md` | Locked v3.0 visual/interaction specs |
| `docs/audits/*.md` | Point-in-time audit reports |

### Precedence Order

If files conflict:
1. `PRD.md` — scope, principles
2. `AGENTS.md` — agent instructions
3. `Schema.md` — data shape (never guess)
4. `src/utils/theme.ts` — design tokens (never hardcode)

## Repo Layout

```text
kredBook/
├── app/                  # Expo Router screens
│   ├── (auth)/           # Login, signup, onboarding
│   ├── (main)/           # Dashboard, people, entries, profile
│   └── l/[token].tsx     # Public ledger share link
├── src/                  # Components, hooks, store, services, utils
├── docs/                 # Working documentation
├── supabase/migrations/  # DB migration history
├── .agents/              # Agent commands, pipelines, skills
├── PRD.md                # Product spec
├── TRD.md                # Technical spec
├── DESIGN.md             # Design system
├── Schema.md             # DB schema
├── Rules.md              # Engineering rules
└── AGENTS.md             # Agent config
```

## AI Workflow

Use short commands as prompts:
- `/plan` — break down work safely
- `/build` — implement end-to-end
- `/fix` — debug with verification
- `/refactor` — safe structure improvements
- `/audit` — evidence-based audit

See `AGENTS.md` and `.agents/commands.md`.

## Development Rules

- `src/utils/theme.ts` is the design-token source of truth — never hardcode colors.
- Don't guess backend schema — use Supabase MCP.
- Any behavior/flow change must update related docs in the same task.
- Run `.agents/doc-sync-checklist.md` before closing non-trivial work.
