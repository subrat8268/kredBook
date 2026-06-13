# KredBook — Product Requirements Document (PRD)

> **Version:** 2.1  
> **Last Updated:** 2026-06-13  
> **Status:** Active · Phase 4 (UI/UX Redesign)  
> **Owner:** Subrat Jena  
> **Repo:** [github.com/subrat8268/kredBook](https://github.com/subrat8268/kredBook)  
> **Supabase Project ID:** `sfmoefgjmgkwvauyaiyz`

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users & Personas](#2-target-users--personas)
3. [Problem Statement](#3-problem-statement)
4. [Product Principles](#4-product-principles)
5. [Canonical Nouns & Naming Contract](#5-canonical-nouns--naming-contract)
6. [Scope: In vs Out](#6-scope-in-vs-out)
7. [Constraints & Assumptions](#7-constraints--assumptions)
8. [Tech Stack (Locked)](#8-tech-stack-locked)
9. [Database Schema Reference](#9-database-schema-reference)
10. [Architecture Overview](#10-architecture-overview)
11. [App Navigation & Routes](#11-app-navigation--routes)
12. [Core User Flows](#12-core-user-flows)
13. [Feature Specifications & Acceptance Criteria](#13-feature-specifications--acceptance-criteria)
14. [Offline-First Strategy](#14-offline-first-strategy)
15. [Sharing Strategy (WhatsApp-First)](#15-sharing-strategy-whatsapp-first)
16. [AI Feature Guardrails](#16-ai-feature-guardrails)
17. [Phase Roadmap](#17-phase-roadmap)
18. [Success Metrics](#18-success-metrics)
19. [Success Criteria (Launch Gates)](#19-success-criteria-launch-gates)
20. [Risks & Open Questions](#20-risks--open-questions)
21. [Environment & Setup](#21-environment--setup)
22. [Doc Sync Contract](#22-doc-sync-contract)

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

## 2. Target Users & Personas

### Broad Target

- Small business owners in India (kirana shops, traders, service providers, freelancers)
- Currently tracking udhaar/khata on paper, in WhatsApp, or across fragmented notes
- Often working in low-connectivity or offline environments
- Do not want or need ERP complexity

---

### Persona 1 — Rajan, the Kirana Owner

| Attribute | Detail |
|---|---|
| **Name** | Rajan Mehta |
| **Age** | 42 |
| **Business** | Kirana / grocery store, semi-urban Maharashtra |
| **Current tool** | Paper khata notebook + WhatsApp for reminders |
| **Device** | Android mid-range, often on 4G with patchy signal |
| **Pain** | Loses track of who owes how much; customers dispute old entries |
| **Goal** | Record udhaar instantly at point of sale; share balance to customer on WhatsApp without manual typing |
| **Tech comfort** | Low — no ERP, no Excel |
| **Language** | Prefers Hindi UI |

---

### Persona 2 — Priya, the Freelance Tutor

| Attribute | Detail |
|---|---|
| **Name** | Priya Nair |
| **Age** | 29 |
| **Business** | Home tuition / coaching, urban Bangalore |
| **Current tool** | Notes app + Google Sheets (inconsistent) |
| **Device** | iPhone, good connectivity |
| **Pain** | Forgets to follow up on monthly fees; no clean statement to share with parents |
| **Goal** | Send a clean monthly statement via WhatsApp; know at a glance who hasn't paid |
| **Tech comfort** | Medium — comfortable with apps but not accounting software |
| **Language** | English UI |

---

### Persona 3 — Dinesh, the Wholesale Trader

| Attribute | Detail |
|---|---|
| **Name** | Dinesh Agarwal |
| **Age** | 51 |
| **Business** | Wholesale goods distributor, Tier-2 city |
| **Current tool** | Physical ledger + phone calls for payment follow-up |
| **Device** | Android, often offline during delivery routes |
| **Pain** | Reconciling who paid what at end of day is error-prone; needs PDF for customer disputes |
| **Goal** | Record payments on the go; generate a PDF bill customers can't dispute |
| **Tech comfort** | Low — wants zero-learning-curve UI |
| **Language** | Hindi, prefers large text |

---

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

### Context

Small businesses in India extend credit informally — goods or services delivered now, payment collected later. This is called udhaar or khata. The tracking of this is largely manual and fragmented.

### Current State vs Desired State

| Dimension | Current State (Pain) | Desired State (KredBook) |
|---|---|---|
| **Capture speed** | Slow — written in notebook or typed in WhatsApp chat | Entry created in < 20 seconds on phone |
| **Visibility** | Zero — owner must mentally sum up who owes what | Dashboard shows total outstanding + overdue list in real time |
| **Reliability** | Poor — paper can be lost; WhatsApp history is unstructured | Offline-first writes, cloud-synced, zero silent data loss |
| **Customer communication** | Manual — owner manually types balance on WhatsApp | One-tap share of formatted message or read-only ledger link |
| **Dispute resolution** | Difficult — no audit trail | Every Entry timestamped, edit count tracked, shareable PDF |
| **Overdue follow-up** | Reactive — owner has to remember | Push notification when due date passes |

### Root Problems (Ranked by Severity)

1. **Slow capture** — every second of delay at point of sale reduces adoption
2. **Poor visibility** — fragmented data means owners don't know their actual outstanding total
3. **Data loss risk** — paper and chat are unreliable; any data loss destroys trust immediately

KredBook solves all three with a focused khata workflow, offline-first writes, and clear balance tracking.

---

## 4. Product Principles

| # | Principle | Enforcement |
|---|---|---|
| 1 | **Speed over breadth** | Any feature that adds steps to Entry/Payment creation must justify itself in a product review |
| 2 | **Money clarity over visual noise** | Every screen must surface outstanding amount without user scrolling or tapping |
| 3 | **Offline-first by default** | No write path may depend on live network to commit |
| 4 | **WhatsApp-first sharing** | Share flows are built for WhatsApp before any other surface |
| 5 | **Strict scope beats feature sprawl** | Canonical language and scope are enforced in PR review and docs |
| 6 | **AI is assistive, never authoritative** | AI can suggest and draft — it cannot write data or send messages without explicit user confirmation |

---

## 5. Canonical Nouns & Naming Contract

### Active Canonical Terms

| Domain Term | Use In | Meaning |
|---|---|---|
| `Customer` | UI copy, docs, code comments | The person who owes money |
| `Entry` | UI copy, docs, code comments | A credit sale / money owed event |
| `Payment` | UI copy, docs, code comments | Money collected against an Entry |
| `Dashboard` | Screen name | Overview screen |
| `People` | Screen name (nav label) | Customer management screen |
| `Entries` | Screen name | Entry list/detail screen |
| `Profile` | Screen name | Business settings screen |

### Legacy / Transitional Terms (DO NOT USE in new UI or docs)

| Legacy Term | Canonical Mapping | Still Exists In |
|---|---|---|
| `order` | `Entry` | DB table `orders`, `src/api/entries.ts` |
| `party` | `Customer` | DB table `parties`, `src/api/people.ts` |
| `vendor` | Authenticated business owner | `vendor_id` columns in all DB tables |
| `vendor_id` | Profile ID of the logged-in user | Schema FK references throughout |

If legacy terms must appear in docs or comments, label them explicitly as **[legacy]** or **[transitional]**.

---

## 6. Scope: In vs Out

### Always In Scope

- Customers, Entries, Payments — the core financial loop
- Dashboard, People, Entries, Profile screens
- Offline-first sync and write replay
- EN / HI localization (i18next + react-i18next)
- CSV export
- PDF export (entry / statement — built: `src/api/export.ts`)
- WhatsApp-first sharing
- Public read-only ledger share link (built: `access_tokens` table + `app/l/[token]`)
- Push notifications for overdue reminders (built: `expo-notifications`, `src/api/overdueReminders.ts`)
- Avatar + business logo upload (built: Supabase Storage — `avatars`, `business-logos`)

### In Scope by Phase

- **Phase 4 (Active):** UI/UX redesign, dark mode via tokens, badge consistency
- **Phase 5 (Planned):** UPI collection, opt-in AI features

### Permanently Out of Scope

- Suppliers / distributor mode as an active product mode
- Product catalog / inventory
- Full GST / accounting platform
- Multi-user / team workflows
- Any AI flow that takes autonomous action without explicit user confirmation

### Legacy But Not Active

Legacy supplier and product schema internals may exist in DB or transitional code. They must not be presented as active product direction.

---

## 7. Constraints & Assumptions

### Technical Constraints

| Constraint | Detail |
|---|---|
| **Platform** | iOS and Android only — no web app as primary target |
| **Backend** | Supabase is the sole backend — no other DB, auth, or storage provider |
| **Offline** | App must be fully usable with zero connectivity for all write operations |
| **Schema changes** | Must go through `supabase/migrations/` — no ad-hoc SQL in production |
| **Design tokens** | All colors, font sizes, spacing must come from `src/utils/theme.ts` — no hardcoded values |
| **AI boundary** | All AI/LLM calls must go through Supabase Edge Functions — never directly from client |
| **State** | Zustand for global/local state, TanStack Query for server state — no Redux, no Context for data |
| **Naming** | Canonical nouns enforced (Customer, Entry, Payment) — legacy terms labeled in code |

### Business Constraints

| Constraint | Detail |
|---|---|
| **Free tier first** | Core features must work on the `free` subscription plan |
| **Single-mode** | Product operates in customer-credit mode only — no supplier or inventory mode |
| **India-first** | All UX, currency (₹), and language (EN/HI) decisions default to Indian context |
| **WhatsApp-first share** | Any sharing surface must work via WhatsApp as the primary distribution channel |

### Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| 1 | Users have Android or iOS smartphones with Expo-compatible OS versions | App unusable on very old devices |
| 2 | Users have intermittent but eventual internet connectivity | Pure offline mode needs stronger queue durability |
| 3 | Users prefer Hindi or English — no other regional languages needed in Phase 4 | May need Marathi, Tamil, etc. in future phases |
| 4 | A single business owner operates the app — no employee/staff accounts needed | Multi-user becomes a new phase if assumption breaks |
| 5 | Supabase free tier is sufficient for current user volume | Needs paid plan upgrade if DAU/storage grows |
| 6 | `customer_balance` is maintained by app-level logic (not a DB trigger) | If app logic has bugs, balance can drift — see Open Questions |

---

## 8. Tech Stack (Locked)

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native | `0.81.5` |
| UI Runtime | Expo | `~54.0.33` |
| Navigation | Expo Router (file-based) | `~6.0.6` |
| Styling | NativeWind + TailwindCSS | `^4.2.1` / `^3.4.17` |
| Design Tokens | `src/utils/theme.ts` | **Source of truth — never hardcode** |
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
| Fonts | Inter + Plus Jakarta Sans | via expo-google-fonts |

### Backend

| Layer | Technology | Notes |
|---|---|---|
| Database | Supabase (PostgreSQL) | Project: `sfmoefgjmgkwvauyaiyz` |
| Auth | Supabase Auth | Phone/OTP + email |
| Storage | Supabase Storage | Buckets: `avatars`, `business-logos` |
| RLS | Row Level Security | Enabled on all public tables |
| Realtime | Supabase Realtime | Available but limited scope |
| Edge Functions | Supabase Edge Functions | Required for all AI feature calls |

### Tooling

| Tool | Purpose |
|---|---|
| TypeScript `~5.9.2` | Type safety |
| Biome `^2.4.12` | Linting + formatting (primary) |
| ESLint `^9.25.0` | Expo lint config |
| Jest `~29.7.0` | Testing |
| Metro | Bundler (`metro.config.js` — SVG transformer + NativeWind) |

---

## 9. Database Schema Reference

> **Source of truth:** `schema.sql` at repo root.  
> **Rule:** Never guess schema. Always read `schema.sql` or use Supabase MCP (`list_tables`, `execute_sql`).

### Public Tables

#### `profiles` — Business Owner

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Profile ID — used as `vendor_id` everywhere |
| `user_id` | uuid FK → auth.users | Supabase auth user (unique) |
| `name` | text | Business owner name |
| `phone` | text (unique) | Owner phone |
| `subscription_plan` | text | Default: `'free'` |
| `subscription_expiry` | date | Nullable |
| `avatar_url` | text | Storage: `avatars` bucket |
| `business_logo_url` | text | Storage: `business-logos` bucket |
| `business_name` | text | Shown in exports and share |
| `billing_address` | text | For PDF/export |
| `gstin` | text | Optional |
| `upi_id` | text | For payment sharing |
| `bank_name` / `account_number` / `ifsc_code` | text | Banking details |
| `bill_number_prefix` | text | Default: `'INV'` |
| `onboarding_complete` | boolean | Default: `false` |

#### `parties` [legacy → **Customer**]

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Customer ID |
| `vendor_id` | uuid FK → profiles.id CASCADE | Owner |
| `name` | text | Customer name |
| `phone` | text | Unique per vendor |
| `address` | text | Optional |
| `is_customer` | boolean | Always `true` — enforced by CHECK constraint |
| `customer_balance` | numeric(10,2) | Running balance, default 0 — maintained by app logic |
| `bank_name` / `account_number` / `ifsc_code` / `upi_id` | text | Customer payment details |

#### `orders` [legacy → **Entry**]

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Entry ID |
| `vendor_id` | uuid FK → profiles.id | Owner |
| `customer_id` | uuid FK → parties.id | Customer |
| `total_amount` | numeric(10,2) | Total bill amount |
| `amount_paid` | numeric(10,2) | Default: 0 |
| `balance_due` | numeric **GENERATED STORED** | `total_amount - amount_paid` — **never write directly** |
| `status` | text | `'Pending'` \| `'Partially Paid'` \| `'Paid'` — **set by trigger only** |
| `bill_number` | text | Unique per vendor; prefix from `profiles.bill_number_prefix` |
| `previous_balance` | numeric(10,2) | Carry-forward balance at time of entry |
| `loading_charge` | numeric(10,2) | Default: 0 |
| `tax_percent` | numeric(5,2) | Default: 0 |
| `due_date` | date | Default: `CURRENT_DATE + 30` |
| `edit_count` | integer | Auto-incremented by trigger |
| `edited_at` | timestamptz | Auto-set by trigger |

**Triggers:**
- `orders_edit_tracking` — BEFORE UPDATE → increments `edit_count`, sets `edited_at`
- `on_payment_upsert` — AFTER INSERT/UPDATE on `payments` → calls `update_order_status()`

#### `order_items` — Entry Line Items

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders.id CASCADE | Parent Entry |
| `vendor_id` | uuid FK → profiles.id CASCADE | Owner |
| `product_name` | text | Free-text |
| `variant_name` | text | Optional |
| `variant_id` | uuid | Optional reference |
| `price` | numeric(10,2) | Unit price |
| `quantity` | integer | Must be > 0 (CHECK constraint) |
| `subtotal` | numeric(10,2) **GENERATED STORED** | `price × quantity` — **never write directly** |

#### `payments` — **Payment**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `vendor_id` | uuid FK → profiles.id CASCADE | Owner |
| `order_id` | uuid FK → orders.id CASCADE | Parent Entry |
| `amount` | numeric(10,2) | Collected amount |
| `payment_date` | timestamptz | Default: `now()` |
| `payment_mode` | text | `'Cash'` \| `'UPI'` \| `'NEFT'` \| `'Draft'` \| `'Cheque'` |
| `notes` | text | Optional |

#### `access_tokens` — Share Tokens

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `token` | text (unique) | URL-safe share token |
| `vendor_id` | uuid FK → profiles.id CASCADE | Issuing vendor |
| `customer_id` | uuid FK → parties.id CASCADE | Target customer |
| `expires_at` | timestamptz | Nullable — no expiry if null |
| `is_revoked` | boolean | Default: `false` |
| `last_accessed_at` | timestamptz | Updated on each read |
| `access_count` | integer | Audit counter |

### RLS Summary

All public tables have RLS **enabled**. Universal pattern:

```sql
vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

`profiles` uses `auth.uid() = user_id` directly.

> ⚠️ **Known issue:** Duplicate RLS policies exist (same rule, different names). Safe but should be cleaned up in a future migration.

### Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `avatars` | Public read, authenticated write/delete | User profile photos |
| `business-logos` | Public read, authenticated write/update/delete | Business branding for exports/sharing |

---

## 10. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  React Native App                    │
│                                                     │
│  app/ (Expo Router file-based routing)              │
│  ├── (auth)/          Auth + Onboarding             │
│  ├── (main)/          Core product screens          │
│  │   ├── dashboard/                                 │
│  │   ├── people/                                    │
│  │   ├── entries/                                   │
│  │   ├── export/                                    │
│  │   ├── profile/                                   │
│  │   └── new-entry.tsx                              │
│  ├── l/               Public ledger share views     │
│  └── profile-error.tsx                              │
│                                                     │
│  src/                                               │
│  ├── api/             Supabase query functions       │
│  ├── store/           Zustand global stores         │
│  ├── hooks/           Custom React hooks            │
│  ├── components/      Shared UI components          │
│  ├── features/        Feature-scoped modules        │
│  ├── services/        Platform services             │
│  ├── utils/           theme.ts + helpers            │
│  ├── types/           TypeScript definitions        │
│  ├── i18n/            EN/HI translations            │
│  └── lib/             Supabase client init          │
└──────────────────┬──────────────────────────────────┘
                   │ @supabase/supabase-js
┌──────────────────▼──────────────────────────────────┐
│              Supabase Backend                        │
│  ├── Auth (Phone OTP / Email)                       │
│  ├── PostgreSQL                                     │
│  │   profiles · parties · orders · order_items      │
│  │   payments · access_tokens                       │
│  ├── RLS (vendor-scoped on all tables)              │
│  ├── Storage (avatars · business-logos)             │
│  └── Edge Functions (AI boundary)                   │
└─────────────────────────────────────────────────────┘
```

### State Architecture

| Concern | Tool | File |
|---|---|---|
| Auth session + profile | Zustand | `authStore.ts` |
| Draft entry/order | Zustand | `orderStore.ts` |
| User preferences | Zustand + MMKV (persisted) | `preferencesStore.ts` |
| Language | Zustand | `languageStore.ts` |
| Server data (fetch/cache) | TanStack Query | Per-feature hooks |
| Offline persistence | MMKV + TanStack Query Persist | Hydrated on cold start |

### API Layer

| File | Responsibility |
|---|---|
| `src/api/auth.ts` | Sign in, sign up, sign out, session |
| `src/api/dashboard.ts` | Outstanding totals, overdue queries |
| `src/api/entries.ts` | CRUD: orders + order_items |
| `src/api/people.ts` | CRUD: parties (Customers) |
| `src/api/export.ts` | CSV generation |
| `src/api/exportCustomer.ts` | Customer-level CSV/PDF export |
| `src/api/overdueReminders.ts` | Push notification scheduling |
| `src/api/profiles.ts` | Profile read/update |
| `src/api/upload.ts` | Avatar + logo upload to Storage |

---

## 11. App Navigation & Routes

```
app/
├── index.tsx                  → Auth gate / splash redirect
├── _layout.tsx                → Root layout (providers, fonts, Sentry init)
├── profile-error.tsx          → Profile load failure fallback screen
│
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── onboarding.tsx
│
├── (main)/
│   ├── _layout.tsx            → Bottom tab navigator (4 tabs)
│   ├── dashboard/index.tsx
│   ├── people/
│   │   ├── index.tsx
│   │   └── [id].tsx           → Customer detail
│   ├── entries/
│   │   ├── index.tsx
│   │   └── [id].tsx           → Entry detail
│   ├── export/index.tsx
│   ├── profile/index.tsx
│   └── new-entry.tsx
│
└── l/
    └── [token].tsx            → Public ledger share (read-only, no auth)
```

**Bottom Tabs:** Dashboard · People · Entries · Profile

---

## 12. Core User Flows

### Flow 1: Create an Entry

1. Tap `+` / new-entry from any screen
2. Select or search Customer
3. Add line items (product name, quantity, price)
4. Optionally set due date, tax %, loading charge, previous balance
5. Submit → `orders` + `order_items` rows created
6. Bill number auto-assigned (`INV-xxx` from profile prefix)
7. Customer balance updated
8. Optional: WhatsApp share triggered immediately

### Flow 2: Record a Payment

1. Open Customer or Entry
2. Tap "Record Payment"
3. Enter amount + payment mode (Cash / UPI / NEFT / Draft / Cheque)
4. Submit → `payments` row inserted
5. DB trigger fires → Entry `status` recalculated automatically
6. `balance_due` (generated column) reflects immediately

### Flow 3: Dashboard Overview

1. App opens → auth check → redirect to Dashboard
2. Outstanding totals loaded from `src/api/dashboard.ts`
3. Overdue entries surfaced with visual priority
4. Tap Customer → People detail
5. Tap overdue badge → Entry detail

### Flow 4: Share Ledger (WhatsApp-First)

1. Open Customer detail
2. Tap Share
3. App generates / retrieves `access_token` for Customer
4. Formatted WhatsApp message + read-only link composed
5. Customer opens `app/l/[token]` → read-only ledger view
6. Token revocable by vendor at any time

### Flow 5: Export Data

1. Profile → Export
2. Select CSV or PDF
3. `src/api/export.ts` / `exportCustomer.ts` generates file
4. `expo-sharing` shares to any app

### Flow 6: Onboarding

1. First launch → sign-up (phone OTP or email)
2. Supabase Auth creates `auth.users` row
3. Profile row created in `profiles` with `onboarding_complete = false`
4. Onboarding screen collects: business name, phone
5. `onboarding_complete` set to `true` → redirect to Dashboard

---

## 13. Feature Specifications & Acceptance Criteria

### Dashboard

**Purpose:** Show total outstanding and surface who needs action next.

**Specification:**
- Shows sum of `balance_due` across all Entries with `status != 'Paid'`
- Shows Customers with at least one Entry where `due_date < today` and `balance_due > 0`
- Overdue items must be visually distinct (badge, color, icon)
- One tap → Customer detail; one tap → Entry detail

**Acceptance Criteria:**
- [ ] Outstanding total is accurate to the last sync
- [ ] Overdue Customers are listed and sorted by oldest due date first
- [ ] Overdue badge styling uses `theme.ts` tokens — no hardcoded colors
- [ ] Loading state shown during fetch; error state shown on failure
- [ ] Works correctly in offline mode (shows cached data with stale indicator)

---

### People (Customer Management)

**Purpose:** Manage and act on Customers.

**Specification:**
- List of all Customers with outstanding balance and last activity date
- Search by name or phone (local, no network required)
- Add new Customer: name (required), phone, address, payment details
- Customer detail: full entry/payment history, add Entry, record Payment, share ledger
- Import from phone contacts via `expo-contacts`

**Acceptance Criteria:**
- [ ] Customer list loads from cache first, then refreshes from Supabase
- [ ] Search is instant (< 100ms) and works offline
- [ ] Phone number is unique per vendor — duplicate blocked with user-friendly error
- [ ] Customer balance shown reflects current `customer_balance` value
- [ ] "Add Customer" form validates phone format before submission
- [ ] Customer detail shows all Entries and Payments in chronological order
- [ ] Share ledger action generates a valid `access_token` and opens WhatsApp intent

---

### Entries

**Purpose:** Capture and manage credit sales.

**Specification:**
- List filterable by status: Pending / Partially Paid / Paid
- Entry detail: line items list, payment history, edit option
- Status is system-managed via DB trigger — never set manually in app
- `balance_due` is a generated column — never written directly
- Edit tracked: `edit_count` and `edited_at` updated by DB trigger

**Acceptance Criteria:**
- [ ] New Entry can be created in < 20 seconds (3 taps + form fill)
- [ ] Status updates automatically after Payment is recorded (no manual refresh required)
- [ ] `balance_due` shown matches DB generated value — no client-side calculation divergence
- [ ] Entries can be filtered by Pending / Partially Paid / Paid without network call
- [ ] Entry detail shows edit history (edit_count visible if > 0)
- [ ] Offline Entry creation is queued and replayed on reconnect without data loss

---

### Profile

**Purpose:** Manage business identity, language, and data export.

**Specification:**
- Edit: business name, logo, billing address, GSTIN, UPI ID, bank details
- Avatar upload to `avatars` bucket; logo upload to `business-logos` bucket
- Language toggle: EN / HI (persisted to `languageStore`)
- Export: CSV and PDF (all entries or per customer)
- Subscription plan display

**Acceptance Criteria:**
- [ ] Profile edits are saved and reflected immediately on next screen load
- [ ] Avatar and logo upload succeed and URL is persisted to `profiles` table
- [ ] Language switch applies globally without app restart
- [ ] CSV export contains all Entries with correct column headers
- [ ] PDF export renders business name, logo, billing details, and entry table correctly
- [ ] `bill_number_prefix` change is reflected in next new Entry's bill number

---

### Overdue Push Notifications

**Specification:**
- Scheduled by `src/api/overdueReminders.ts`
- Fires for entries where `due_date < today` AND `status != 'Paid'`
- Uses `expo-notifications` (local, not server-push in Phase 4)

**Acceptance Criteria:**
- [ ] Notification fires within the scheduled window for overdue entries
- [ ] Tapping notification navigates to correct Entry detail
- [ ] Notification does not fire for fully paid entries
- [ ] Respects device notification permissions — fails gracefully if denied

---

### Public Ledger Share

**Specification:**
- `access_tokens` table manages per-customer read tokens
- `app/l/[token]` serves read-only ledger — no auth required
- Token has `expires_at` (nullable) and `is_revoked` fields

**Acceptance Criteria:**
- [ ] Public ledger loads without authentication
- [ ] Shows only the Entries/Payments for the token's `customer_id`
- [ ] Revoked or expired token shows a clear "link is no longer active" message
- [ ] No edit or payment actions available in the public view
- [ ] Vendor can revoke the token from Customer detail screen

---

## 14. Offline-First Strategy

KredBook must work reliably in zero or intermittent connectivity. This is non-negotiable.

### Write Path

1. User creates Entry or Payment
2. Optimistic update applied to TanStack Query cache immediately
3. Write queued for Supabase sync
4. On reconnect: queue replays in order
5. Server response reconciles with optimistic state

### Read Path

- TanStack Query + MMKV persist caches all queries
- App hydrates from MMKV on cold start before any network call
- Stale data displayed with sync status indicator when offline

### Rules

- No write may silently fail — all errors must surface to the user
- `@react-native-community/netinfo` drives connectivity state
- Sync errors must not cause data loss — retry is mandatory

---

## 15. Sharing Strategy (WhatsApp-First)

### Share Artifacts

| Artifact | Status | Implementation |
|---|---|---|
| Formatted WhatsApp text | ✅ Built | Name, amount, due date, business identity |
| Read-only ledger link | ✅ Built | `access_tokens` + `app/l/[token]` |
| PDF statement | ✅ Built | `expo-print` + `expo-sharing` |
| CSV export | ✅ Built | Profile → Export |

### Rules

- Recipients are always read-only — no edit access ever
- Share copy uses canonical terms (Customer/Entry/Payment), never legacy terms
- Business name + logo from Profile included in PDF/share artifacts
- Sharing degrades gracefully offline (WhatsApp text available; link queued)

---

## 16. AI Feature Guardrails

AI is opt-in, Phase 5 only, and must never be the core product loop.

### Hard Rules

- All LLM calls route through **Supabase Edge Functions** — never client-to-LLM directly
- No AI feature writes data or sends messages without explicit user confirmation
- No AI output is accounting truth — always labeled as a suggestion
- Graceful fallback when offline or Edge Function unavailable

### Allowed Use Cases (Phase 5)

- Follow-up prioritization: "Who should you contact today?"
- Customer summary: "Rahul owes ₹4,200, overdue 12 days"
- WhatsApp draft assistance
- Anomaly hints: unusually large entry, duplicate customer names

### Guardrails Checklist

- [ ] Opt-in only — never on by default
- [ ] No autonomous write operations
- [ ] No hidden actions
- [ ] Strict input allowlists on Edge Function
- [ ] Rate limiting on Edge Function
- [ ] Audit log for all AI calls
- [ ] Safe offline fallback with no broken UI

---

## 17. Phase Roadmap

### ✅ Phase 1 — Foundation (Complete)
- Canonical language: Customer / Entry / Payment
- Core screens: Dashboard, People, Entries, Profile
- Offline-first with TanStack Query + MMKV
- CSV export
- Supabase Auth + RLS

### ✅ Phase 2 — Reliability (Complete)
- Sync UX improvements
- Overdue prioritization logic
- Schema constraint hardening

### ✅ Phase 3 — Polish (Complete)
- Push notifications for overdue (`expo-notifications`)
- Public ledger share link (`access_tokens` + `app/l/[token]`)
- WhatsApp-first sharing surfaces
- PDF export (`expo-print`)

### 🔄 Phase 4 — UI/UX Redesign (Active)

**Last completed:** Refactored Entry Detail into `useEntryDetail` custom hook  
**In progress:** Phase 4.1 and 4.2 screen redesign passes

- Token-driven dark mode via `src/utils/theme.ts`
- Overdue badge consistency across all screens
- Semantic token enforcement — zero hardcoded colors
- One clear primary action per screen

### ⏳ Phase 5 — Payments & AI (Planned)

- UPI collection support (payment link / in-app QR)
- Opt-in AI: prioritization, summaries, WhatsApp drafts
- All AI via Supabase Edge Functions
- Receipt-friendly sharing surfaces

---

## 18. Success Metrics

### Core Product

| Metric | Target |
|---|---|
| Time to create an Entry | < 20 seconds |
| Time to record a Payment | < 10 seconds |
| Offline write replay success rate | 99.9% |
| WhatsApp share completion rate | Track → increase each phase |
| Overdue balance resolution rate | Track → trend down over time |
| Customer search response time | < 300ms on device |

### Experience Quality

- Sync failures are never silent — user always knows data state
- Outstanding totals accurate within 1 sync cycle
- No broken layouts or crashes in EN or HI language modes

### Guardrails

- Zero silent data loss events
- Zero scope drift without an explicit phase decision
- AI usage remains opt-in and bounded

---

## 19. Success Criteria (Launch Gates)

These are **binary pass/fail gates** — not aspirational metrics. A phase is not shippable until all criteria for that phase are met.

### Phase 4 Launch Criteria

| # | Criterion | How to Verify |
|---|---|---|
| P4-1 | All screens use only `theme.ts` tokens — zero hardcoded hex/color values | Biome lint + manual grep |
| P4-2 | Dark mode works correctly on all 4 main screens | Manual device test, iOS + Android |
| P4-3 | Overdue badge styling is identical across Dashboard, People, and Entries | Visual regression check |
| P4-4 | Every screen has exactly one primary CTA — no ambiguous dual-action layouts | UX review pass |
| P4-5 | `npm run lint` returns zero errors on all changed files | CI check |
| P4-6 | `useEntryDetail` hook covers all Entry Detail logic — no direct API calls in screen component | Code review |
| P4-7 | No user-facing text uses legacy terms (order, party, vendor) | String search + translation file audit |

### Phase 5 Launch Criteria

| # | Criterion | How to Verify |
|---|---|---|
| P5-1 | UPI payment link generation works end-to-end on Android and iOS | Manual QA |
| P5-2 | All AI calls go through Edge Functions — zero direct client-to-LLM requests | Network audit + code review |
| P5-3 | AI features are gated behind explicit opt-in — disabled by default | Settings screen + feature flag check |
| P5-4 | AI fallback renders correctly when Edge Function is unavailable | Kill Edge Function, test UI |
| P5-5 | Offline write replay success rate ≥ 99.9% under simulated poor network | Automated stress test |

### Always-On Production Criteria (Every Release)

| # | Criterion |
|---|---|
| PROD-1 | No write operation silently fails — all errors surface to user |
| PROD-2 | `balance_due` on screen matches DB generated value — no divergence |
| PROD-3 | Entry `status` is only set by DB trigger — never written from app code |
| PROD-4 | Public ledger (`app/l/[token]`) shows zero edit/payment actions |
| PROD-5 | Revoked or expired token shows correct error state |
| PROD-6 | RLS blocks cross-vendor data reads — verified by Supabase policy test |

---

## 20. Risks & Open Questions

### Active Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Duplicate RLS policies in schema | Low — safe but noisy | Clean up in a future migration; audit naming |
| Legacy `order`/`party` terms confusing AI agents | Medium | Strict naming contract enforced here + `SYSTEM_CONTEXT.md` |
| Dark mode drift if screens bypass `theme.ts` | Medium | Biome lint rule + PR review gate |
| Offline queue silent failure | High | Surfaced errors mandatory; replay audit on reconnect |
| WhatsApp text / link / PDF behavior diverging | Medium | Single share service, unified entry point |
| `customer_balance` drift if app logic has a bug | Medium | Consider converting to DB trigger (see Open Questions) |

### Open Questions

| # | Question | Impact if Unresolved |
|---|---|---|
| OQ-1 | How much preview/edit before sending a WhatsApp draft? | UX gap in Phase 5 AI sharing |
| OQ-2 | Should overdue prioritization be rule-based only, or accept optional AI ranking? | Phase 5 AI scope |
| OQ-3 | Phase 5 UPI UX: deep link only, or in-app QR generator? | Architecture decision needed before Phase 5 |
| OQ-4 | Should `access_tokens.expires_at` have a default expiry enforced at schema level? | Security exposure if tokens never expire |
| OQ-5 | Should `customer_balance` become a DB-trigger-managed generated value? | Data integrity risk if current app logic has edge cases |
| OQ-6 | Are Marathi / Tamil languages needed in Phase 5? | Persona 1 (Rajan) may need regional language |

---

## 21. Environment & Setup

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli` or use `npx expo`
- Supabase account — project `sfmoefgjmgkwvauyaiyz`
- Android Studio (Android) or Xcode (iOS) for native builds

### Local Development

```bash
npm install
npm start           # Expo dev server
npm run android     # Android
npm run ios         # iOS
npm run lint        # Biome + ESLint
```

### Environment Variables

Create `.env.local` at repo root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://sfmoefgjmgkwvauyaiyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> ⚠️ Never commit `.env.local`. It is covered by `.gitignore`.

### Supabase CLI

```bash
npx supabase start                      # Local Supabase
npx supabase db push                    # Apply migrations
npx supabase gen types typescript \
  --project-id sfmoefgjmgkwvauyaiyz \
  > src/types/supabase.ts              # Generate TS types
```

### Key Config Files

| File | Purpose |
|---|---|
| `app.json` | Expo config: name, slug, icons, permissions |
| `metro.config.js` | Bundler: SVG transformer, NativeWind |
| `babel.config.js` | Babel: Reanimated plugin |
| `tailwind.config.js` | TailwindCSS + NativeWind theme |
| `tsconfig.json` | TypeScript paths + config |
| `schema.sql` | DB schema snapshot — structural reference |
| `supabase/migrations/` | Migration history |

---

## 22. Doc Sync Contract

When product truth changes, update **all** relevant docs **in the same commit or task**:

| Document | Owns |
|---|---|
| `PRD.md` ← this file | Product truth: scope, principles, flows, roadmap, success criteria |
| `SYSTEM_CONTEXT.md` | AI agent operational truth: current phase, last completed, next |
| `docs/STATUS.md` | Phase-by-phase implementation state |
| `docs/ARCHITECTURE.md` | Technical boundaries, service contracts |
| `docs/DESIGN.md` | Design system, tokens, component patterns |
| `docs/SCREEN_FLOWS.md` | Per-screen behavior specs |
| `docs/naming-contract.md` | Canonical noun enforcement |
| `schema.sql` | DB schema snapshot — update after every migration |
| `README.md` | Setup, onboarding, active product framing |

### Conflict Resolution Rules

| Priority | File | Wins On |
|---|---|---|
| 1 | `PRD.md` | Scope, principles, phase status |
| 2 | `SYSTEM_CONTEXT.md` | AI agent operational instructions |
| 3 | `schema.sql` | Data shape — never guess schema |
| 4 | `src/utils/theme.ts` | Design tokens — never hardcode |

---

*This document is the product-level source of truth for KredBook. Any AI agent, engineer, or external contributor must treat `PRD.md` as the primary reference for what the product is, what is in scope, what is built, and what comes next.*
