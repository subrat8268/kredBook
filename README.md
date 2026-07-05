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

#### Recent Audits

| Date | Report | Scope |
|---|---|---|
| 2026-07-04 | `docs/audits/dashboard-2026-07-04.md` | Dashboard redesign — 31 findings across UI, dark mode, a11y, runtime, performance, code quality |

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
├── src/
│   ├── api/              # Supabase query functions
│   ├── components/       # Shared UI components (layer1 primitives, layer2 compositions)
│   ├── features/         # Feature-scoped components, hooks, types
│   │   └── dashboard/    # DashboardScreen + sub-components, hooks, types
│   ├── hooks/            # Cross-feature React Query hooks
│   ├── lib/              # syncQueue, mmkv
│   ├── services/         # supabase client
│   ├── store/            # Zustand stores (authStore)
│   ├── theme/            # useTheme hook
│   ├── types/            # Shared TypeScript types
│   └── utils/            # theme.ts (tokens), format, helper
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

## Phase 4 Progress

| Sub-phase | Block | Status |
|---|---|---|
| 4.0 | Design System Foundation | ✅ Done |
| 4.1 | Core Loop Screens (Dashboard, Tab Nav, Create Entry, Record Payment, Customer Detail) | ✅ Done |
| 4.1.1x | Dashboard code health & UX polish (component extraction, token alignment) | ✅ Done |
| 4.2 | Detail + List Screens (Entry Detail, Edit Entry, Customer List, Entry List) | ✅ Done |
| 4.3 | Auth + Onboarding | 🔄 In Progress — Welcome ✅, **Login next (4.3.2a)** |
| 4.4 | Profile, Export, Public Ledger | ⏳ Not Started |

**Next task:** `4.3.2a` — Login screen audit + extraction (`app/(auth)/login.tsx`)

## Dashboard Audit Fixes (2026-07-04)

All open issues from `docs/audits/dashboard-2026-07-04.md` fixed in this pass. See the audit file for full context.

| Ref | Severity | Component | Fix Applied |
|---|---|---|---|
| C5 | ✅ Fixed | `DashboardFollowUpCard` | Nested `Pressable` flattened to siblings — Collect accessible on TalkBack |
| C4 | ✅ Fixed | `DashboardSkeleton` | Border now uses `colors.borderSubtle` token (dark mode correct) |
| C2 | ✅ Fixed | `DashboardHeroCard` | Hero amount uses `colors.dashboard.heroText` token |
| C1 | ✅ Fixed | `DashboardRecentActivity` | Gradient end uses `colors.surface` runtime value |
| C3 | ✅ Fixed | `DashboardScreen` + route | `onOpenPeopleOverdue` split as dedicated prop from `onPressNotifications` |
| M1 | ✅ Fixed | All 8 components | All `console.log` removed (guarded or deleted) |
| m8 | ✅ Fixed | `DashboardSkeleton` | Follow-up skeleton width corrected to `200` |
| M11 | ✅ Fixed | All 8 components | Props typed as `ColorTokens` / `GradientTokens` — no more `any` |
| M2 | ✅ Fixed | `DashboardHeroCard` | `dashboardState` wrapped in `useMemo` |
| M5 | ✅ Fixed | `DashboardQuickStats` | `quickStats` + `safeCollectedThisMonth` wrapped in `useMemo` |
| m3 | ✅ Fixed | `DashboardFollowUpSection` | `isFetching` prop removed; `keyboardShouldPersistTaps="handled"` added |
| m4 | ✅ Fixed | `DashboardRecentActivity` | `isLoading` prop removed |
| M7 | ✅ Fixed | `DashboardFollowUpSection` | Overdue badge shows `"--"` on error state |
| M6 | ✅ Fixed | `DashboardRecentActivity` | `shadowColor` uses `colors.ink` instead of `"#000"` |
| m6 | ✅ Fixed | `DashboardFollowUpCard` | `chipStyles` wrapped in `useMemo` |
| m9 | ✅ Fixed | `DashboardSkeleton` | Padding values use `spacing.screenPadding` / `spacing.md` tokens |
| m10 | ✅ Fixed | `DashboardScreen` | `onCustomerAdded` / `onPaymentSuccess` stable with `useCallback` |

## AI Workflow

Use short commands as prompts:
- `/plan` — break down work safely
- `/build` — implement end-to-end
- `/fix` — debug with verification
- `/refactor` — safe structure improvements
- `/audit` — evidence-based audit

See `AGENTS.md` and `.agents/commands.md`.

## Development Rules

- `src/utils/theme.ts` is the design-token source of truth — never hardcode colors, spacing, or shadow colors.
- Don't guess backend schema — use Supabase MCP.
- Any behavior/flow change must update related docs in the same task.
- All props that accept theme values must be typed as `ColorTokens`, `GradientTokens`, or `typeof spacing` — not `any`.
- Run `.agents/doc-sync-checklist.md` before closing non-trivial work.
