# KredBook Architecture (Phase 4 — Active)

KredBook is a strict single-mode digital khata: **Customers**, **Entries**, **Payments**.

Current product truth:
- Active screens: `Dashboard`, `People`, `Entries`, `Profile`
- Always in scope: offline-first sync, EN/HI localization, CSV export
- **Phase 4 focus:** Full UI/UX redesign — design system overhaul, screen-by-screen
  component extraction and premium rebuild (Vercel × Khatabook × Linear aesthetic)
- **AI layer is Phase 6** — not Phase 4. Remove all Phase 4 AI references.

## Stack

| Area | Choice |
|---|---|
| App | React Native + Expo + Expo Router |
| Local state | Zustand |
| Server state | TanStack Query |
| Offline writes | MMKV-backed mutation queue |
| Backend | Supabase (Postgres + RLS + Storage + Edge Functions) |
| Styling | NativeWind + `src/utils/theme.ts` tokens |

## Routes (active)

`(auth)` handles login/onboarding; `(main)` contains `dashboard`, `people`,
`entries`, `profile`, plus hidden/supporting routes like `export`.
`/l/[token]` is the public ledger surface (unauthenticated).

## Component Layer Architecture

Components are organized into three layers:

| Layer | Path | Purpose |
|---|---|---|
| `ui/` | `src/components/ui/` | Atomic, stateless primitives — Button, Input, Avatar, Badge, Skeleton, MoneyAmount |
| `layer2/` | `src/components/layer2/` | Composed screen-level building blocks — Header, DetailHeader, ListItem, ScreenLayout, BaseBottomSheet, StatusBadge, OverflowMenu |
| Feature components | `src/components/[domain]/` | Domain-specific — `people/`, `orders/`, `dashboard/`, `picker/` |

### `layer2/` Key Components (Phase 4)

| Component | File | Used by |
|---|---|---|
| `DetailHeader` | `src/components/layer2/DetailHeader.tsx` | Entry Detail, Edit Entry, Customer Detail, Profile Edit |
| `OverflowMenu` | `src/components/layer2/OverflowMenu.tsx` | Entry Detail header (⋮ overflow), future detail screens |
| `BaseBottomSheet` | `src/components/layer2/BaseBottomSheet.tsx` | RecordPaymentModal, remind sheets |
| `StatusBadge` | `src/components/layer2/StatusBadge.tsx` | People list, Entry list (canonical badge) |
| `Header` | `src/components/layer2/Header.tsx` | List screens (People, Entries, Export) |

> ⚠️ `OverflowMenu` icon props must be bare Lucide elements — no View wrapper.
> A wrapping View collapses flexDirection:row and stacks icon above label.

## Data Model (product)

- Customer, Entry, Payment are the canonical nouns.
- Some internals still use legacy names (`order`, `party`). Treat as transitional.
- Supplier/product tables are legacy and not active product pillars.
- `parties` is customers-only. `parties.is_customer = TRUE` constraint enforced.
- `parties.customer_balance` is kept in sync via Supabase trigger
  `trg_sync_customer_balance` on `public.orders`.

## Offline-First

- Reads prefer React Query cache (persisted to MMKV).
- Writes are queued when offline and replayed on reconnect.
- Primary surfaces: `src/services/supabase.ts`, `src/lib/syncQueue.ts`.
- Product correctness depends on preserving queued writes; do not bypass
  the queue for core capture flows.

## Sharing (WhatsApp-first)

- Short-term: share a read-only Customer ledger link (token-based) and
  formatted WhatsApp text.
- Phase 5: generate a PDF statement / Entry PDF and share via WhatsApp.
- Flow:
  1. App requests a share artifact (link/PDF) for a Customer/Entry.
  2. Supabase Edge Function builds payload, stores to Storage (if needed),
     returns URL + message text.
  3. App invokes WhatsApp share with the prepared content.

## Planned AI Layer (Phase 6)

- Supabase Edge Functions as the AI boundary.
- Functions call OpenAI (or equivalent) with strict prompts + allowlisted inputs.
- Guardrails: rate limits, audit logs, opt-in UX, safe fallbacks when offline.
- AI remains assistive only; must not become source of accounting truth or
  perform autonomous sending.
- **Phase 6 starts only after Phase 4 (UI/UX Redesign) is complete.**
