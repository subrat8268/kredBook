# KredBook — Product Requirements Document (PRD)

> **Version:** 2.0  
> **Last Updated:** 2026-06-13  
> **Status:** Active · Phase 4 (UI/UX Redesign)  
> **Owner:** Subrat Jena  
> **Repo:** [github.com/subrat8268/kredBook](https://github.com/subrat8268/kredBook)  
> **Supabase Project ID:** `sfmoefgjmgkwvauyaiyz`

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target User & Jobs-To-Be-Done](#2-target-user--jobs-to-be-done)
3. [Problem Statement](#3-problem-statement)
4. [Product Principles](#4-product-principles)
5. [Canonical Nouns & Naming Contract](#5-canonical-nouns--naming-contract)
6. [Scope: In vs Out](#6-scope-in-vs-out)
7. [Tech Stack (Locked)](#7-tech-stack-locked)
8. [Database Schema Reference](#8-database-schema-reference)
9. [Architecture Overview](#9-architecture-overview)
10. [App Navigation & Routes](#10-app-navigation--routes)
11. [Core User Flows](#11-core-user-flows)
12. [Feature Specifications](#12-feature-specifications)
13. [Offline-First Strategy](#13-offline-first-strategy)
14. [Sharing Strategy (WhatsApp-First)](#14-sharing-strategy-whatsapp-first)
15. [AI Feature Guardrails](#15-ai-feature-guardrails)
16. [Phase Roadmap](#16-phase-roadmap)
17. [Success Metrics](#17-success-metrics)
18. [Risks & Open Questions](#18-risks--open-questions)
19. [Environment & Setup](#19-environment--setup)
20. [Doc Sync Contract](#20-doc-sync-contract)

---

## 1. Product Overview

**KredBook** is a strict single-mode digital khata (ledger) for small businesses in India.

It solves one problem: helping a business owner record money they are owed, track when it is collected, and know exactly who is overdue — fast, with or without internet.

The product financial loop is:

```
Customer → Entry (money owed) → Payment (money collected) → Outstanding Balance
```

KredBook is **not** an ERP, inventory tool, or accounting platform. Every feature must serve the core loop or it does not belong.

---

## 2. Target User & Jobs-To-Be-Done

### Target User

- Small business owners in India (kirana shops, traders, service providers, freelancers)
- Currently tracking udhaar/khata on paper, in WhatsApp, or across fragmented notes
- Often working in low-connectivity or offline environments
- Do not want or need ERP complexity

### Primary Jobs-To-Be-Done

| Trigger | Job | Outcome |
|---|---|---|
| Sale on credit | Create an Entry in seconds | Customer balance updated, shareable immediately |
| Customer pays | Record a Payment instantly | Balance auto-updated, ledger history clean |
| Need to follow up | Know who owes what | Dashboard shows total outstanding + overdue |
| Bad network | Continue working | No data loss, writes replayed on reconnect |
| Customer needs statement | Share ledger or entry | WhatsApp-ready, no extra steps |

---

## 3. Problem Statement

Small businesses need a fast, reliable way to track customer credit and collections. Existing habits are fragmented across paper, memory, WhatsApp, and generic notes, causing:

1. **Slow capture** at the moment of sale or collection
2. **Poor visibility** into outstanding and overdue totals
3. **Data loss** or confusion when network is poor

KredBook solves all three with a focused khata workflow, offline-first writes, and clear balance tracking.

---

## 4. Product Principles

| # | Principle | What It Means |
|---|---|---|
| 1 | Speed over breadth | If a feature slows down adding an Entry or Payment, it must justify itself |
| 2 | Money clarity over visual noise | Every screen must make outstanding amounts obvious |
| 3 | Offline-first by default | Any write that depends on live network is incomplete |
| 4 | WhatsApp-first sharing | Sharing flows target WhatsApp before any other surface |
| 5 | Strict scope beats feature sprawl | Canonical language and scope are enforced in docs and review |
| 6 | AI is assistive, never authoritative | AI can suggest, summarize, draft — it cannot act autonomously |

---

## 5. Canonical Nouns & Naming Contract

### Active Canonical Terms

| Domain Term | Use In | Notes |
|---|---|---|
| `Customer` | UI copy, docs, code comments | The person who owes money |
| `Entry` | UI copy, docs, code comments | A credit sale / money owed event |
| `Payment` | UI copy, docs, code comments | Money collected against an Entry |
| `Dashboard` | Screen name | Overview screen |
| `People` | Screen name (nav label) | Customer management screen |
| `Entries` | Screen name | Entry list/detail screen |
| `Profile` | Screen name | Business settings screen |

### Legacy / Transitional Terms (DO NOT USE in new UI or docs)

| Legacy Term | Mapped To | Where It Still Exists |
|---|---|---|
| `order` | `Entry` | DB table `orders`, API layer `src/api/entries.ts` |
| `party` | `Customer` | DB table `parties`, API layer `src/api/people.ts` |
| `vendor` | Authenticated business owner | `vendor_id` columns in all DB tables |
| `vendor_id` | Profile ID of the logged-in user | Schema FK references |

If legacy terms must appear in docs, label them explicitly as **legacy** or **transitional**.

---

## 6. Scope: In vs Out

### Always In Scope

- Customers, Entries, Payments
- Dashboard, People, Entries, Profile screens
- Offline-first sync and write replay
- EN / HI localization (i18next + react-i18next)
- CSV export
- PDF export (entry / statement — built, `src/api/export.ts`)
- WhatsApp-first sharing
- Public read-only ledger share link via `access_tokens` table
- Push notifications for overdue reminders (`expo-notifications`, `src/api/overdueReminders.ts`)
- Avatar + business logo upload (Supabase Storage: `avatars`, `business-logos`)

### In Scope by Phase (see Section 16)

- Phase 4: UI/UX redesign — current active phase
- Phase 5: UPI collection support

### Permanently Out of Scope

- Suppliers / distributor mode as an active product mode
- Product catalog / inventory
- Full GST / accounting platform
- Multi-user / team workflows
- Any AI flow that takes autonomous action on behalf of the user

### Legacy But Not Active Scope

Legacy supplier and product schema internals may still exist in the database or transitional code. They must not be presented as active product direction in docs, UI, or AI agent instructions.

---

## 7. Tech Stack (Locked)

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native | `0.81.5` |
| UI Runtime | Expo | `~54.0.33` |
| Navigation | Expo Router (file-based) | `~6.0.6` |
| Styling | NativeWind + TailwindCSS | `^4.2.1` / `^3.4.17` |
| Design Tokens | `src/utils/theme.ts` | Source of truth — never hardcode colors/sizes |
| Global State | Zustand | `^5.0.8` |
| Server State | TanStack Query | `^5.89.0` |
| Persistent Cache | TanStack Query Persist Client + MMKV | `^5.96.2` / `^4.3.1` |
| Forms | Formik + Yup | `^2.4.6` / `^1.7.0` |
| i18n | i18next + react-i18next | `^25.x` / `^16.x` |
| Icons | lucide-react-native | `^0.545.0` |
| Error Tracking | Sentry | `~7.2.0` |
| Lists | Shopify FlashList | `^1.8.3` |
| Bottom Sheet | @gorhom/bottom-sheet | `^5.2.6` |
| Date Utils | date-fns | `^4.1.0` |
| Font | Inter + Plus Jakarta Sans (Google Fonts) | via expo-google-fonts |

### Backend

| Layer | Technology | Notes |
|---|---|---|
| Database | Supabase (PostgreSQL) | Project: `sfmoefgjmgkwvauyaiyz` |
| Auth | Supabase Auth | Phone/OTP + email |
| Storage | Supabase Storage | Buckets: `avatars`, `business-logos` |
| RLS | Row Level Security | Enabled on all public tables |
| Realtime | Supabase Realtime | Available but scope is limited |
| Edge Functions | Supabase Edge Functions | Required for all AI feature boundaries |

### Tooling

| Tool | Purpose |
|---|---|
| TypeScript `~5.9.2` | Type safety |
| Biome `^2.4.12` | Linting + formatting |
| ESLint `^9.25.0` | Expo lint config |
| Jest `~29.7.0` | Testing |
| Metro | Bundler (custom config: `metro.config.js`) |

---

## 8. Database Schema Reference

> **Source of truth:** `schema.sql` in repo root.  
> **DO NOT guess schema** — always read `schema.sql` or use Supabase MCP.

### Public Tables

#### `profiles`
Represents the authenticated business owner (vendor).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Profile ID — used as `vendor_id` everywhere |
| `user_id` | uuid (FK → auth.users) | Supabase auth user |
| `name` | text | Business owner name |
| `phone` | text (unique) | Owner phone |
| `subscription_plan` | text | Default: `'free'` |
| `subscription_expiry` | date | Nullable |
| `avatar_url` | text | Storage: `avatars` bucket |
| `business_logo_url` | text | Storage: `business-logos` bucket |
| `business_name` | text | Displayed in exports and share |
| `billing_address` | text | For PDF/export |
| `gstin` | text | Optional GST number |
| `upi_id` | text | For payment sharing |
| `bank_name` / `account_number` / `ifsc_code` | text | Banking details |
| `bill_number_prefix` | text | Default: `'INV'` |
| `onboarding_complete` | boolean | Default: `false` |

---

#### `parties` (legacy name → **Customer**)
Represents a Customer belonging to a vendor.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Customer ID |
| `vendor_id` | uuid (FK → profiles.id) | Owner of this customer |
| `name` | text | Customer name |
| `phone` | text | Unique per vendor |
| `address` | text | Optional |
| `is_customer` | boolean | Always `true` (enforced by CHECK constraint) |
| `customer_balance` | numeric(10,2) | Running balance — default 0 |
| `bank_name` / `account_number` / `ifsc_code` / `upi_id` | text | Customer payment details |

**Constraint:** `parties_is_customer_only` — `is_customer = true` always. Supplier mode is not active.

---

#### `orders` (legacy name → **Entry**)
Represents a credit sale (Entry) made to a Customer.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Entry ID |
| `vendor_id` | uuid (FK → profiles.id) | Owner |
| `customer_id` | uuid (FK → parties.id) | Customer |
| `total_amount` | numeric(10,2) | Total bill amount |
| `amount_paid` | numeric(10,2) | Default: 0 |
| `balance_due` | numeric (GENERATED STORED) | `total_amount - amount_paid` — never set manually |
| `status` | text | `'Pending'` \| `'Partially Paid'` \| `'Paid'` — set by trigger |
| `bill_number` | text | Unique per vendor, prefix from profile |
| `previous_balance` | numeric(10,2) | Carry-forward balance at time of entry |
| `loading_charge` | numeric(10,2) | Default: 0 |
| `tax_percent` | numeric(5,2) | Default: 0 |
| `due_date` | date | Default: `CURRENT_DATE + 30` |
| `edit_count` | integer | Incremented by trigger on each update |
| `edited_at` | timestamptz | Set by trigger |

**Key Trigger:** `orders_edit_tracking` — auto-updates `edit_count` and `edited_at` on UPDATE.  
**Key Trigger:** `on_payment_upsert` — recalculates `status` on payment insert/update.

---

#### `order_items` (Entry line items)
Individual products/items within an Entry.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK → orders.id CASCADE) | Parent Entry |
| `vendor_id` | uuid (FK → profiles.id CASCADE) | Owner |
| `product_name` | text | Free-text product name |
| `variant_name` | text | Optional variant label |
| `variant_id` | uuid | Optional reference |
| `price` | numeric(10,2) | Unit price |
| `quantity` | integer | Must be > 0 |
| `subtotal` | numeric(10,2) (GENERATED STORED) | `price × quantity` |

---

#### `payments` (**Payment**)
Records money collected against an Entry.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `vendor_id` | uuid (FK → profiles.id CASCADE) | Owner |
| `order_id` | uuid (FK → orders.id CASCADE) | Parent Entry |
| `amount` | numeric(10,2) | Amount collected |
| `payment_date` | timestamptz | Default: `now()` |
| `payment_mode` | text | `'Cash'` \| `'UPI'` \| `'NEFT'` \| `'Draft'` \| `'Cheque'` |
| `notes` | text | Optional |

**Key Trigger:** Payment insert/update fires `update_order_status()` which recalculates Entry `status`.

---

#### `access_tokens` (Public Ledger Share)
Scoped read tokens issued to Customers for viewing their own ledger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `token` | text (unique) | URL-safe share token |
| `vendor_id` | uuid (FK → profiles.id CASCADE) | Issuing vendor |
| `customer_id` | uuid (FK → parties.id CASCADE) | Target customer |
| `expires_at` | timestamptz | Nullable (no expiry if null) |
| `is_revoked` | boolean | Default: `false` |
| `last_accessed_at` | timestamptz | Updated on each read |
| `access_count` | integer | Audit counter |

---

### RLS Rules (Summary)

All public tables have RLS **enabled**. The universal pattern is:

```sql
vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

- Every vendor can only read, write, update, and delete their own rows.
- No cross-vendor data leakage possible at the DB layer.
- `profiles` table uses `auth.uid() = user_id` directly.

> **Note:** Duplicate RLS policies exist in the current schema (same rule under different policy names). This is safe but should be cleaned up in a future migration to reduce confusion.

---

### Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `avatars` | Public read, authenticated write/delete | User profile photos |
| `business-logos` | Public read, authenticated write/update/delete | Business branding for exports/sharing |

---

## 9. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  React Native App                    │
│                                                     │
│  app/ (Expo Router file-based routing)              │
│  ├── (auth)/          Auth + Onboarding screens     │
│  ├── (main)/          Main product screens          │
│  │   ├── dashboard/                                 │
│  │   ├── people/                                    │
│  │   ├── entries/                                   │
│  │   ├── export/                                    │
│  │   ├── profile/                                   │
│  │   └── new-entry.tsx                              │
│  ├── l/               Public ledger (share links)   │
│  └── profile-error.tsx                              │
│                                                     │
│  src/                                               │
│  ├── api/             Supabase query functions       │
│  ├── store/           Zustand stores                │
│  ├── hooks/           Custom React hooks            │
│  ├── components/      Shared UI components          │
│  ├── features/        Feature-scoped modules        │
│  ├── services/        Platform services             │
│  ├── utils/           theme.ts + helpers            │
│  ├── types/           TypeScript types              │
│  ├── i18n/            EN/HI translations            │
│  └── lib/             Supabase client + setup       │
└──────────────────┬──────────────────────────────────┘
                   │ @supabase/supabase-js
┌──────────────────▼──────────────────────────────────┐
│              Supabase Backend                        │
│  ├── Auth (Phone OTP / Email)                       │
│  ├── PostgreSQL (profiles, parties, orders,          │
│  │               order_items, payments,              │
│  │               access_tokens)                      │
│  ├── RLS (all tables — vendor-scoped)                │
│  ├── Storage (avatars, business-logos)               │
│  └── Edge Functions (AI feature boundary)            │
└─────────────────────────────────────────────────────┘
```

### State Architecture

| Concern | Tool | Stores |
|---|---|---|
| Auth session + profile | Zustand | `authStore.ts` |
| Draft order state | Zustand | `orderStore.ts` |
| User preferences | Zustand + MMKV persisted | `preferencesStore.ts` |
| Language selection | Zustand | `languageStore.ts` |
| Server data (fetch/cache) | TanStack Query | Per-feature query hooks |
| Offline persistence | MMKV + TanStack Query Persist | Hydrated on app start |

### API Layer (`src/api/`)

| File | Responsibility |
|---|---|
| `auth.ts` | Sign in, sign up, sign out, session management |
| `dashboard.ts` | Outstanding totals, overdue summary queries |
| `entries.ts` | CRUD for orders + order_items, payment recording |
| `people.ts` | CRUD for parties (Customers) |
| `payments.ts` | Payment creation and history |
| `export.ts` | CSV export generation |
| `exportCustomer.ts` | Customer-specific export |
| `overdueReminders.ts` | Push notification scheduling for overdue entries |
| `profiles.ts` | Profile read/update |
| `upload.ts` | Avatar and business logo upload to Supabase Storage |

---

## 10. App Navigation & Routes

```
app/
├── index.tsx                 → Auth gate / splash redirect
├── _layout.tsx               → Root layout (providers, fonts, Sentry)
├── profile-error.tsx         → Profile load failure fallback
│
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── onboarding.tsx
│
├── (main)/
│   ├── _layout.tsx           → Bottom tab navigator
│   ├── dashboard/
│   │   └── index.tsx
│   ├── people/
│   │   ├── index.tsx
│   │   └── [id].tsx          → Customer detail
│   ├── entries/
│   │   ├── index.tsx
│   │   └── [id].tsx          → Entry detail
│   ├── export/
│   │   └── index.tsx
│   ├── profile/
│   │   └── index.tsx
│   └── new-entry.tsx
│
└── l/
    └── [token].tsx           → Public ledger share view (read-only)
```

**Bottom Tabs (canonical):** Dashboard · People · Entries · Profile

---

## 11. Core User Flows

### Flow 1: Create an Entry (Happy Path)

1. Tap `+` / new-entry from any screen
2. Select or search Customer
3. Add line items (product name, qty, price)
4. Optionally set due date, tax %, loading charge, previous balance
5. Submit → `orders` + `order_items` rows created in Supabase
6. Bill number auto-assigned (`INV-xxx` prefix from profile)
7. Customer balance updated
8. Optional: WhatsApp share triggered

### Flow 2: Record a Payment

1. Open Customer or Entry
2. Tap "Record Payment"
3. Enter amount and payment mode
4. Submit → `payments` row inserted
5. Trigger fires → Entry `status` recalculated to `Partially Paid` or `Paid`
6. `balance_due` (computed column) auto-updated

### Flow 3: Dashboard Overview

1. App opens → auth check → redirect to Dashboard
2. Query outstanding totals across all Customers
3. Overdue Entries surfaced with visual priority
4. Tap Customer → People detail view
5. Tap overdue badge → Entry detail

### Flow 4: Share Ledger (WhatsApp-First)

1. Open Customer detail
2. Tap Share
3. App generates / fetches `access_token` for that Customer
4. Share link + formatted WhatsApp message
5. Customer opens `app/l/[token]` → read-only ledger
6. Token can be revoked by vendor

### Flow 5: Export Data

1. Open Profile
2. Tap Export
3. Select CSV or PDF
4. `src/api/export.ts` / `exportCustomer.ts` generates file
5. Share via `expo-sharing`

---

## 12. Feature Specifications

### Dashboard

- Shows total outstanding amount (sum of `balance_due` across all active entries)
- Shows overdue Customers (entries where `due_date < today` and `balance_due > 0`)
- Quick action: tap Customer → People detail
- Quick action: tap Entry → Entry detail

### People (Customer Management)

- List all Customers with balance and last activity
- Search by name or phone
- Add new Customer (name, phone, address, payment details)
- Customer detail: full ledger history, add Entry, record Payment, share ledger
- Import from phone contacts (`expo-contacts`)

### Entries

- List all Entries filterable by status: Pending / Partially Paid / Paid
- Entry detail: line items, payment history, edit (tracked via `edit_count`)
- Entry status is **system-managed** (trigger-driven) — never set manually in app code
- `balance_due` is a **generated column** — never written directly

### Profile

- Business name, logo, billing address, GSTIN, UPI, bank details
- Avatar upload
- Language toggle: EN / HI
- Export (CSV / PDF)
- Subscription status display

### Overdue Push Notifications

- `src/api/overdueReminders.ts` schedules local notifications
- Fires for entries where `due_date < today` and `status != 'Paid'`
- Uses `expo-notifications`
- Respects offline state

### Public Ledger Share

- `access_tokens` table manages share tokens
- `app/l/[token]` route serves public read-only view
- Token has `expires_at`, `is_revoked` fields — vendor can revoke anytime
- No authentication required for customer to view

---

## 13. Offline-First Strategy

KredBook must work reliably in zero or intermittent connectivity. This is non-negotiable.

### Write Path

1. User creates Entry or Payment
2. Write is optimistically applied to local TanStack Query cache
3. Write is also queued for Supabase sync
4. On reconnect: queue replays in order
5. Conflicts resolved in favor of server (Supabase) on reads, local optimistic state on writes until sync

### Read Path

- TanStack Query + MMKV persist layer caches all query results
- App hydrates from MMKV cache on cold start before any network call
- Stale data shown with sync indicator if offline

### Rules

- No write should silently fail
- Sync errors must surface to user — no data loss without visibility
- `@react-native-community/netinfo` used for connectivity detection

---

## 14. Sharing Strategy (WhatsApp-First)

### Artifacts

| Artifact | Built? | Notes |
|---|---|---|
| Formatted WhatsApp text | ✅ | Name, amount, due date |
| Read-only ledger link | ✅ | `access_tokens` + `app/l/[token]` |
| PDF statement | ✅ | `expo-print` + `expo-sharing` |
| CSV export | ✅ | Profile → Export |

### Rules

- Recipients cannot edit — read-only always
- Share copy must use `Customer`/`Entry`/`Payment` language, not legacy terms
- Business identity from `Profile` (name, logo) included in PDF/share
- Sharing must degrade gracefully offline (WhatsApp text still works; link share queued)

---

## 15. AI Feature Guardrails

AI features are opt-in, Phase 4+ only, and must never become the core product loop.

### Hard Rules

- All AI calls route through **Supabase Edge Functions** — never directly from client to LLM
- No AI feature can take an action without explicit user confirmation
- No AI output is treated as accounting truth
- AI must fall back gracefully if offline or unavailable

### Allowed AI Use Cases (Phase 4)

- Follow-up prioritization suggestions (who to contact next)
- Customer summary generation (e.g., "Rahul owes ₹4,200, overdue 12 days")
- WhatsApp draft message assistance
- Anomaly hints (unusually large entry, duplicate customer names)

### Guardrails Checklist

- [ ] Opt-in only — never enabled by default
- [ ] No autonomous sending / writing
- [ ] No hidden actions
- [ ] Strict input allowlists on Edge Function
- [ ] Rate limiting on Edge Function
- [ ] Audit log for AI calls
- [ ] Safe offline fallback

---

## 16. Phase Roadmap

### ✅ Phase 1 — Foundation (Complete)
- Canonical language reset: Customer / Entry / Payment
- Core screen flows: Dashboard, People, Entries, Profile
- Offline-first baseline with TanStack Query + MMKV
- CSV export
- Supabase Auth + RLS

### ✅ Phase 2 — Reliability (Complete)
- Sync UX improvements
- Overdue prioritization logic
- Tighter product scope enforcement
- Schema constraint hardening

### ✅ Phase 3 — Polish (Complete)
- Push notifications for overdue reminders (`expo-notifications`)
- Public ledger share link (`access_tokens` table + `app/l/[token]`)
- Stronger WhatsApp-first sharing surfaces
- PDF export (`expo-print`)

### 🔄 Phase 4 — UI/UX Redesign (Active)
- **Current:** Refactored Entry Detail into `useEntryDetail` custom hook
- **Next:** Continue Phase 4.1 and 4.2 screen redesign passes
- Token-driven dark mode through `src/utils/theme.ts`
- Overdue badge consistency across all screens
- Semantic token enforcement — no hardcoded colors anywhere
- One clear primary action per screen

### ⏳ Phase 5 — Payments & AI (Planned)
- UPI collection support (payment link generation)
- Opt-in AI features (prioritization, drafts, summaries)
- All AI routed through Supabase Edge Functions
- Receipt-friendly sharing surfaces

---

## 17. Success Metrics

### Core Product

| Metric | Target |
|---|---|
| Time to create an Entry | < 20 seconds |
| Time to record a Payment | < 10 seconds |
| Offline write replay success rate | 99.9% |
| WhatsApp share completion rate | Track and increase |
| Overdue balance resolution rate | Track and improve over time |

### Experience

- Sync failures are never silent — user always knows data state
- Outstanding totals are current within 1 sync cycle
- Customer search returns result in < 300ms on device

### Guardrails

- Zero silent data loss events
- Zero scope drift into non-core workflows without explicit phase change
- AI usage remains optional, bounded, and revocable

---

## 18. Risks & Open Questions

### Active Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Duplicate RLS policies in schema | Low (safe but noisy) | Clean up in a migration, audit policy names |
| Legacy `order`/`party` terms in code confusing AI agents | Medium | Strict naming contract in this doc + SYSTEM_CONTEXT.md |
| Dark mode drift if screens bypass `theme.ts` tokens | Medium | Linting + PR review gate |
| Offline queue silent failure | High | Surfaced errors + replay audit |
| WhatsApp text / link / PDF behavior diverging | Medium | Single share service, unified entry point |

### Open Questions

1. How much preview/edit should users have before sending a WhatsApp draft?
2. Should overdue prioritization stay rule-based, or accept optional AI ranking in Phase 5?
3. What is the Phase 5 UPI collection UX — deep link only, or in-app QR?
4. Should `access_tokens` have a default expiry enforced at schema level?
5. Should `customer_balance` be a generated column driven by a trigger instead of manually maintained?

---

## 19. Environment & Setup

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- Supabase account with project `sfmoefgjmgkwvauyaiyz`
- Android Studio or Xcode for native builds

### Local Development

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Lint
npm run lint
```

### Environment Variables

Create `.env.local` at root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://sfmoefgjmgkwvauyaiyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Never commit** anon key or service role key. `.gitignore` covers `.env*`.

### Supabase Local Dev

```bash
# Start Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts
```

### Key Config Files

| File | Purpose |
|---|---|
| `app.json` | Expo app config (name, slug, icons, permissions) |
| `metro.config.js` | Metro bundler (SVG transformer, NativeWind) |
| `babel.config.js` | Babel (Reanimated plugin) |
| `tailwind.config.js` | TailwindCSS + NativeWind theme config |
| `tsconfig.json` | TypeScript paths and config |
| `schema.sql` | Full DB schema snapshot (structural reference) |
| `supabase/migrations/` | Migration history |

---

## 20. Doc Sync Contract

When the product truth changes, update **all** of these in the **same task**:

| Document | What It Owns |
|---|---|
| `PRD.md` (this file) | Product truth: scope, roadmap, principles, flows |
| `SYSTEM_CONTEXT.md` | AI agent operational truth: current phase, next step |
| `docs/STATUS.md` | Phase-by-phase implementation status |
| `docs/ARCHITECTURE.md` | Technical boundaries, service contracts |
| `docs/DESIGN.md` | Design system, tokens, component patterns |
| `docs/SCREEN_FLOWS.md` | Per-screen behavior specs |
| `docs/naming-contract.md` | Canonical noun enforcement |
| `schema.sql` | DB schema snapshot (update after any migration) |
| `README.md` | Setup, positioning, active product framing |

### Rules

- `PRD.md` beats all other docs on scope conflicts
- `SYSTEM_CONTEXT.md` beats all docs on AI agent operational instructions
- `schema.sql` beats all docs on data shape — never guess schema
- `src/utils/theme.ts` beats all docs on design tokens — never hardcode

---

*This document is the product-level truth for KredBook. Any AI agent, engineer, or contributor working on this codebase should treat this file as the primary reference for what the product is, what is built, and what comes next.*
