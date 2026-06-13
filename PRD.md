# KredBook Product Requirements Document (PRD)

<<<<<<< HEAD
KredBook is a strict single-mode digital ledger (khata) designed for small businesses and merchants in India. The product targets speed, visual clarity, and offline reliability over feature breadth.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 1. Product Overview

The core value proposition of KredBook is tracking customer credit transactions and payments. It organizes all operations around a closed financial loop:

```
[Customer] ────(extends credit)───► [Entry] (Money Owed)
    ▲                                  │
    │                              (reduces balance)
    │                                  ▼
[Balance] ◄────(reconciles)─────── [Payment] (Money Collected)
```

- **Customer**: A business entity representing a client to whom the merchant extends credit or from whom they collect cash.
- **Entry**: An individual transaction representing money owed to the merchant by a Customer.
- **Payment**: An individual transaction representing money collected by the merchant from a Customer.
- **Balance**: The net outstanding balance due for each Customer, computed automatically at the Entry level (`total_amount - amount_paid`) and aggregated at the Customer level.

---

## 2. Target Users & Personas

<<<<<<< HEAD
| User Segment                                   | Current Habit                                                                                        | Job-To-Be-Done                                                                                                                                                                                                                                                                                                                                                                |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Small business owners / merchants in India** | Track outstanding credit (udhaar) manually in paper diaries (bahi khata) or loose WhatsApp messages. | - Record credit sales (Entries) in under 30 seconds at the point of sale.<br>- Record cash collection (Payments) instantly without manual arithmetic.<br>- Check total outstanding receivables and identify overdue accounts.<br>- Share ledger statements with customers via WhatsApp.<br>- Rely on secure, offline-first transaction entry in areas with weak connectivity. |
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 3. Problem Statement

<<<<<<< HEAD
KredBook solves three primary problems for Indian small business merchants:

1. **Slow Capture at Point of Sale or Collection**: Manual recording of credit and payments is slow and error-prone during busy business hours, leading to forgotten transactions and cash leaks.
2. **Poor Visibility into Outstanding and Overdue Balances**: Merchants struggle to keep track of who owes what, how much is overdue, and when to follow up, resulting in delayed collections and constrained working capital.
3. **Data Loss and Confusion under Weak Connectivity**: Many wholesale and retail markets in India suffer from poor network signals. If an application lacks a robust local cache and queue system, entries fail, resulting in lost records and broken trust.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 4. Product Principles

<<<<<<< HEAD
| Principle                                | Meaning & Enforcement Strategy                                                                                                                                               |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Speed over breadth**                | Screen layouts are designed amount-first. Key flows (creating an entry or recording a payment) must be achievable in less than 30 seconds.                                   |
| **2. Money clarity over visual noise**   | UI styling uses strong, semantic color weights (e.g., green for payments, red/amber for overdue entries) and large typography to make outstanding amounts instantly obvious. |
| **3. Offline-first by default**          | Read paths retrieve local cached data via React Query (persisted in MMKV). Write paths queue mutations locally and replay them in the background.                            |
| **4. WhatsApp-first sharing**            | WhatsApp is the default communication standard. Sharing is optimized for copy-paste text and deep links rather than email or generic PDF sheets.                             |
| **5. Strict scope beats feature sprawl** | Non-core capabilities (distributor modes, product catalogs, supplier tracking, inventory, GST filing) are strictly kept out of the active product surface.                   |
| **6. Naming contract enforcement**       | The canonical nouns (**Customer**, **Entry**, **Payment**) must be strictly utilized across all UI copy, documentation, and codebase comments.                               |
=======
| # | Principle | Enforcement |
|---|---|---|
| 1 | **Speed over breadth** | Any feature that adds steps to Entry/Payment creation must justify itself in a product review |
| 2 | **Money clarity over visual noise** | Every screen must surface outstanding amount without user scrolling or tapping |
| 3 | **Offline-first by default** | No write path may depend on live network to commit |
| 4 | **WhatsApp-first sharing** | Share flows are built for WhatsApp before any other surface |
| 5 | **Strict scope beats feature sprawl** | Canonical language and scope are enforced in PR review and docs |
| 6 | **AI is assistive, never authoritative** | AI can suggest and draft — it cannot write data or send messages without explicit user confirmation |
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 5. Canonical Nouns & Naming Contract

To prevent nomenclature drift, all new code, documentation, and user-facing copy must adhere to the naming contract. Where database tables use legacy terms, a clear mapping is defined:

<<<<<<< HEAD
| Active Product Term | UI & Copy Label                      | Legacy / Transitional Database Name | Rule                                                                               |
| :------------------ | :----------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------- |
| **Customer**        | Customer (or "People" in navigation) | `parties`                           | Always use "Customer" in text. `is_customer = true` is enforced in the DB.         |
| **Entry**           | Entry (or "Bill")                    | `orders`                            | An individual credit record. "Bill" is allowed only in share context.              |
| **Payment**         | Payment                              | `payments`                          | Cash collection against outstanding entries.                                       |
| **Entry Item**      | Item                                 | `order_items`                       | Nullable legacy fields exist (`product_id`/`variant_id`). Treated as transitional. |
| **User Profile**    | Profile (or Settings)                | `profiles`                          | Represents the merchant running KredBook. Referred to as `vendor` in legacy code.  |
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 6. Scope: In vs Out

### Active Product Surface (Actually Built)

<<<<<<< HEAD
- **Customer Management**: Add customer, search (fuzzy match + highlight), browse customer list, view individual customer ledger details.
- **Entry Management**: Create entry (GST%, loading charges, notes, customized due-date chips), view entry details, and edit entry.
- **Payment Collection**: Record payments (Full/Partial intent selection, payment modes, optional note, result screen).
- **Dashboard**: Total outstanding hero, priority overdue list (up to 3 customers), mini stat cards, collection shortcut.
- **Offline Sync**: MMKV-backed transaction queue with background replayer and status banner.
- **Localization**: Full English (EN) and Hindi (HI) support via `i18next`.
- **Export**: Backup all entries as a locale-safe CSV file from the Profile page.
- **Sharing**: Generate token-based read-only public ledger links (`/l/[token]`) and WhatsApp-friendly text summaries.
- **Dark Mode**: Complete theme compatibility powered by semantic tokens in [theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts).

### Planned Roadmap

- **Phase 5 (Documents & Collections)**:
  - PDF Customer statements generated via Supabase Edge Functions.
  - PDF receipt exports for individual Entries.
  - UPI collection link and on-screen dynamic QR code.
- **Phase 6 (AI Assistance)**:
  - Opt-in AI prioritization engine (ranking overdue accounts).
  - AI WhatsApp follow-up drafting assistance.
  - Anomaly alerts (e.g., highlighting customers with no payments in 45+ days).

### Permanently Out of Scope

- Supplier tracking and distributor workflows.
- Full product inventory catalogs.
- Multi-user business management or staff access roles.
- GST/tax calculation platforms.

---

## 7. Tech Stack
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

The application stack is fully locked. Every dependency version is specified below from [package.json](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/package.json):

<<<<<<< HEAD
### Core App Framework
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

- **React**: `19.1.0`
- **React Native**: `0.81.5`
- **Expo**: `~54.0.33`
- **Expo Router**: `~6.0.6`

<<<<<<< HEAD
### State & Data Layers
=======
| Layer | Technology | Notes |
|---|---|---|
| Database | Supabase (PostgreSQL) | Project: `sfmoefgjmgkwvauyaiyz` |
| Auth | Supabase Auth | Phone/OTP + email |
| Storage | Supabase Storage | Buckets: `avatars`, `business-logos` |
| RLS | Row Level Security | Enabled on all public tables |
| Realtime | Supabase Realtime | Available but limited scope |
| Edge Functions | Supabase Edge Functions | Required for all AI feature calls |
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

- **Local State**: `Zustand` (`^5.0.8`)
- **Server State**: `TanStack React Query` (`^5.89.0`)
- **Offline Storage**: `react-native-mmkv` (`^4.3.1`)
- **Storage Client**: `@react-native-async-storage/async-storage` (`2.2.0`)
- **Database Client**: `@supabase/supabase-js` (`^2.57.4`)

<<<<<<< HEAD
### Styling & Layout

- **CSS Preprocessor**: `NativeWind` (`^4.2.1`)
- **TailwindCSS**: `^3.4.17`
- **Bottom Sheet UI**: `@gorhom/bottom-sheet` (`^5.2.6`)
- **Icons**: `lucide-react-native` (`^0.545.0`)

### Utilities

- **Date Formatting**: `date-fns` (`^4.1.0`)
- **Local Notification Services**: `expo-notifications` (`~0.32.16`)
- **Printing**: `expo-print` (`~15.0.7`)
- **Crash Tracking**: `@sentry/react-native` (`~7.2.0`)
=======
| Tool | Purpose |
|---|---|
| TypeScript `~5.9.2` | Type safety |
| Biome `^2.4.12` | Linting + formatting (primary) |
| ESLint `^9.25.0` | Expo lint config |
| Jest `~29.7.0` | Testing |
| Metro | Bundler (`metro.config.js` — SVG transformer + NativeWind) |
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 9. Database Schema Reference

<<<<<<< HEAD
The database runs on Supabase (Postgres). The tables and columns are defined below based on [schema.sql](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/schema.sql):
=======
> **Source of truth:** `schema.sql` at repo root.  
> **Rule:** Never guess schema. Always read `schema.sql` or use Supabase MCP (`list_tables`, `execute_sql`).
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

### 1. `public.profiles` (Merchant Profile)

<<<<<<< HEAD
Tracks authenticated business accounts:

- `id` (`uuid`, Primary Key, Defaults to `gen_random_uuid()`)
- `user_id` (`uuid`, Unique, Foreign Key to `auth.users.id`, Cascades on Delete)
- `name` (`text`, Not Null)
- `phone` (`text`, Unique)
- `created_at` (`timestamp with time zone`, Defaults to `now()`)
- `subscription_plan` (`text`, Defaults to `'free'`)
- `subscription_expiry` (`date`)
- `avatar_url` (`text`)
- `business_logo_url` (`text`)
- `business_name` (`text`)
- `billing_address` (`text`)
- `gstin` (`text`)
- `upi_id` (`text`)
- `bank_name` (`text`, Defaults to `''`)
- `account_number` (`text`, Defaults to `''`)
- `ifsc_code` (`text`, Defaults to `''`)
- `bill_number_prefix` (`text`, Defaults to `'INV'`)
- `onboarding_complete` (`boolean`, Defaults to `false`)

### 2. `public.parties` (Customers)

Enforces a customer-only check constraint. Supplier fields are removed:

- `id` (`uuid`, Primary Key, Defaults to `gen_random_uuid()`)
- `vendor_id` (`uuid`, Foreign Key to `public.profiles.id`, Cascades on Delete)
- `name` (`text`, Not Null)
- `phone` (`text`)
- `address` (`text`)
- `is_customer` (`boolean`, Defaults to `false`, Must equal `true` via CHECK constraint)
- `customer_balance` (`numeric(10,2)`, Defaults to `0`)
- `bank_name` (`text`)
- `account_number` (`text`)
- `ifsc_code` (`text`)
- `upi_id` (`text`)
- `created_at` (`timestamp with time zone`, Defaults to `now()`)
- `updated_at` (`timestamp with time zone`, Defaults to `now()`)

### 3. `public.orders` (Entries)

Represents money owed. `balance_due` is auto-calculated:

- `id` (`uuid`, Primary Key, Defaults to `gen_random_uuid()`)
- `vendor_id` (`uuid`, Foreign Key to `public.profiles.id`, Cascades on Delete)
- `customer_id` (`uuid`, Foreign Key to `public.parties.id`, Cascades on Delete)
- `total_amount` (`numeric(10,2)`, Not Null, CHECK `>= 0`)
- `amount_paid` (`numeric(10,2)`, Defaults to `0`, CHECK `>= 0` and `<= total_amount`)
- `balance_due` (`numeric`, Generated Stored Column: `(total_amount - amount_paid)`)
- `status` (`text`, Defaults to `'Pending'`, CHECK in `['Pending', 'Partially Paid', 'Paid']`)
- `created_at` (`timestamp with time zone`, Defaults to `now()`)
- `due_date` (`date`, Defaults to `created_at + 30 days`, CHECK `>= created_at`)
- `bill_number` (`text`)
- `previous_balance` (`numeric(10,2)`, Defaults to `0`)
- `loading_charge` (`numeric(10,2)`, Defaults to `0`)
- `tax_percent` (`numeric(5,2)`, Defaults to `0`)
- `edited_at` (`timestamp with time zone`)
- `edit_count` (`integer`, Defaults to `0`)

### 4. `public.order_items` (Legacy Entry Items)

Nullable fields for backward compatibility with deleted product tables:

- `id` (`uuid`, Primary Key, Defaults to `gen_random_uuid()`)
- `order_id` (`uuid`, Foreign Key to `public.orders.id`, Cascades on Delete)
- `product_id` (`uuid`, Nullable)
- `product_name` (`text`, Not Null)
- `variant_id` (`uuid`, Nullable)
- `variant_name` (`text`)
- `price` (`numeric(10,2)`, Not Null)
- `quantity` (`integer`, Not Null, CHECK `> 0`)
- `subtotal` (`numeric(10,2)`, Generated Stored Column: `(price * quantity)`)
- `vendor_id` (`uuid`, Foreign Key to `public.profiles.id`, Cascades on Delete)
- `created_at` (`timestamp with time zone`, Defaults to `now()`)

### 5. `public.payments` (Payments Collected)

Represents collection against a specific entry:

- `id` (`uuid`, Primary Key, Defaults to `gen_random_uuid()`)
- `vendor_id` (`uuid`, Foreign Key to `public.profiles.id`, Cascades on Delete)
- `order_id` (`uuid`, Foreign Key to `public.orders.id`, Cascades on Delete)
- `amount` (`numeric(10,2)`, Not Null)
- `payment_date` (`timestamp with time zone`, Defaults to `now()`)
- `payment_mode` (`text`, Defaults to `'Cash'`, CHECK in `['Cash', 'UPI', 'NEFT', 'Draft', 'Cheque']`)
- `notes` (`text`)

### 6. `public.access_tokens` (Sharing Access Tokens)

Tracks read-only ledger links shared with customers:

- `id` (`uuid`, Primary Key, Defaults to `gen_random_uuid()`)
- `token` (`text`, Unique, Not Null)
- `vendor_id` (`uuid`, Foreign Key to `public.profiles.id`, Cascades on Delete)
- `customer_id` (`uuid`, Foreign Key to `public.parties.id`, Cascades on Delete)
- `created_at` (`timestamp with time zone`, Defaults to `now()`)
- `last_accessed_at` (`timestamp with time zone`)
- `access_count` (`integer`, Defaults to `0`)
- `expires_at` (`timestamp with time zone`)
- `is_revoked` (`boolean`, Defaults to `false`)

### Database Triggers & Functions

1. `orders_edit_tracking`: Tracks update timestamps and increment counts on the `orders` table.
2. `parties_updated_at`: Syncs `updated_at` on customer changes.
3. `on_payment_upsert`: Recalculates order `amount_paid` and updates its `status` (e.g. to `Paid` or `Partially Paid`) whenever a payment is registered.
4. `trg_sync_customer_balance`: Automatically recalculates `parties.customer_balance` as the sum of unpaid `orders.balance_due` whenever orders are inserted, updated, or deleted.

> [!WARNING]
> **Duplicate RLS Policies (Production Issue)**
> An audit of RLS rules in [schema.sql](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/schema.sql) revealed duplicate policies with different names. For example, `order_items` contains identical policies named `"Vendors can delete own order items"` and `"delete_own_order_items"`. This is also present in `orders`, `payments`, and `profiles` tables. This should be consolidated in a future migration sweep.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 10. Architecture Overview

KredBook employs a clean separation of layers, routing database calls through local hooks and a central offline queue:

```
<<<<<<< HEAD
                  ┌──────────────────────────────┐
                  │          App Routes          │
                  │ (app/(auth), app/(main), l/) │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │       Component Layers       │
                  │   (ui/, layer2/, features/)  │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │         State Stores         │
                  │    (Zustand / React Query)   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │    Offline Queue (MMKV)      │
                  │     (syncQueue.ts replayer)  │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │        Supabase API          │
                  │  (Postgres, RLS, Edge Func)  │
                  └──────────────────────────────┘
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a
```

### API Responsibilities

<<<<<<< HEAD
- [auth.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/auth.ts): Handles sign-in, sign-up, Google OAuth, password reset, and logouts.
- [dashboard.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/dashboard.ts): Requests consolidated metrics (total outstanding, collection trends) and net position ranges.
- [entries.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/entries.ts): Executes entry (order) creation, updates, and deletes, payment collection, next invoice numbering, and previous balance fetches.
- [export.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/export.ts): Resolves transaction data sets for backup CSV exports.
- [exportCustomer.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/exportCustomer.ts): Fetches customer ledger entries and formats rows for sharing.
- [overdueReminders.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/overdueReminders.ts): Isolates customers with unpaid balances past their due dates.
- [people.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/people.ts): Manages customer profiles (parties table CRUD) and detail views.
- [profiles.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/profiles.ts): Manages the merchant's business settings.
- [upload.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/upload.ts): Uploads avatars and business logo graphics to Supabase buckets.

### Zustand Stores

- `useAuthStore` ([authStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/authStore.ts)): Tracks authenticated session, fetch status, profile data, and subscription validity.
- `useLanguageStore` ([languageStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/languageStore.ts)): Retains selected local preference ('en' | 'hi') and sets i18next language.
- `useOrderStore` ([orderStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/orderStore.ts)): Manages state for entry/invoice drafts (items list, quantity modifications, rates, GST tax %, loading fees).
- `usePreferencesStore` ([preferencesStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/preferencesStore.ts)): Stores dark mode preference, dashboard range (7/30/90 days), push notification toggles, snoozed reminders, and audit history.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 11. App Navigation & Routes

The application routing is file-based and defined under the `app/` folder:

```
app/
<<<<<<< HEAD
├── index.tsx                         # Landing page, performs session/onboarding redirect
├── _layout.tsx                       # Global layout: Auth listener, secure profile synchronization
├── profile-error.tsx                 # Onboarding boundary error handling
├── (auth)/                           # Authentication flows
│   ├── _layout.tsx                   # Auth route container
│   ├── login.tsx                     # Login via email/password
│   ├── signup.tsx                    # Sign-up sheet
│   ├── phone-setup.tsx               # Phone number input & registration
│   ├── resetPassword.tsx             # Trigger password recovery email
│   ├── set-new-password.tsx          # Confirm and set new password
│   └── onboarding/                   # Merchant onboarding flows
│       ├── _layout.tsx               # Onboarding stack
│       ├── index.tsx                 # Auto-redirects to business setup
│       ├── business.tsx              # Input business name, GSTIN, UPI ID, logo
│       ├── bank.tsx                  # Optional bank details (bank name, account #, IFSC code)
│       └── ready.tsx                 # Onboarding complete screen
├── (main)/                           # Tab navigator for core dashboard features
│   ├── _layout.tsx                   # Main tabs (Dashboard, People, Entries, Profile)
│   ├── new-entry.tsx                 # Deep-link shortcut to creating an Entry
│   ├── dashboard/
│   │   ├── _layout.tsx               # Dashboard sub-stack
│   │   └── index.tsx                 # Dashboard screen (outstanding hero + overdue list)
│   ├── people/
│   │   ├── _layout.tsx               # Customers sub-stack
│   │   ├── index.tsx                 # Customer list page (search, sort, filter)
│   │   ├── create.tsx                # Customer creation sheet
│   │   └── [customerId]/             # Dynamic customer folder
│   │       ├── index.tsx             # Customer Detail page (timeline, actions, collect bar)
│   │       └── edit.tsx              # Edit Customer profile details
│   ├── entries/
│   │   ├── _layout.tsx               # Entries sub-stack
│   │   ├── index.tsx                 # List of all recent bills / entries
│   │   ├── create.tsx                # Full-screen amount numpad to create an entry
│   │   └── [orderId]/                # Dynamic entry folder
│   │       ├── index.tsx             # Entry Detail page (items, payments, options)
│   │       └── edit.tsx              # Edit Entry details
│   ├── profile/
│   │   ├── _layout.tsx               # Settings sub-stack
│   │   ├── index.tsx                 # Profile dashboard (toggle dark mode, language, sign out)
│   │   └── edit.tsx                  # Edit Business address & metadata details
│   └── export/
│       ├── _layout.tsx               # CSV export stack
│       └── index.tsx                 # Download Backup CSV file
└── l/
    └── [token].tsx                   # Public Ledger screen (Unauthenticated, Read-Only)
```

=======
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

>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a
---

## 12. Core User Flows

<<<<<<< HEAD
### 1. Create Entry (Owed Credit)

1. User taps the floating action button (FAB) or navigates to `/entries/create`.
2. Amount pad is focused. User enters the bill total.
3. User selects a Customer from the bottom sheet picker.
4. User selects "Bill" (Entry) mode, optionally inputs a note, adds items, GST%, or loading charges.
5. User taps **Save & Share**.
   - Entry is stored locally and dispatched to the sync queue.
   - A PDF is prepared and sent to the native OS share sheet.
6. The app redirects the user to the newly created Entry Detail page.
=======
### Flow 1: Create an Entry

1. Tap `+` / new-entry from any screen
2. Select or search Customer
3. Add line items (product name, quantity, price)
4. Optionally set due date, tax %, loading charge, previous balance
5. Submit → `orders` + `order_items` rows created
6. Bill number auto-assigned (`INV-xxx` from profile prefix)
7. Customer balance updated
8. Optional: WhatsApp share triggered immediately
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

### 2. Record Payment (Money Collected)

<<<<<<< HEAD
1. Triggered via **Collect** from the Dashboard overdue list, Customer Detail collect bar, or Entry Detail.
2. The shared **Record Payment** modal slides up.
3. User chooses the collection intent:
   - **Full Payment**: Prefills the entire outstanding balance and marks the action button as **Mark Fully Paid**.
   - **Partial Payment**: Shows a numeric keypad to input custom cash collected.
4. User selects the payment method (Cash, UPI, NEFT, Cheque) and inputs optional notes.
5. User taps **Record Payment**.
   - A database trigger updates the corresponding entry balance and status.
   - On success, the modal switches to the receipt state, allowing receipt sharing.
=======
1. Open Customer or Entry
2. Tap "Record Payment"
3. Enter amount + payment mode (Cash / UPI / NEFT / Draft / Cheque)
4. Submit → `payments` row inserted
5. DB trigger fires → Entry `status` recalculated automatically
6. `balance_due` (generated column) reflects immediately
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

### 3. Dashboard Navigation & Collection

<<<<<<< HEAD
1. User logs in and lands on the **Dashboard**.
2. Merchant views total outstanding credit.
3. If overdue bills exist, the top 3 customers are surfaced under **Priority Customers**.
4. User taps **Collect** next to a customer to open the Record Payment sheet pre-filled with the customer's balance.
5. Tapping **Collect Now** on the hero card redirects to the top priority customer, or opens a customer picker if no overdue entries exist.
=======
1. App opens → auth check → redirect to Dashboard
2. Outstanding totals loaded from `src/api/dashboard.ts`
3. Overdue entries surfaced with visual priority
4. Tap Customer → People detail
5. Tap overdue badge → Entry detail
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

### 4. Share Ledger Link

<<<<<<< HEAD
1. User navigates to a **Customer Detail** page and taps **Share**.
2. The app requests a token for the customer, generating a unique token if none exists.
3. The app builds the link: `https://kredbook.app/l/<token>`.
4. The OS share sheet opens with the link and a pre-composed WhatsApp message.
5. The customer clicks the link and views their ledger in a read-only screen.
=======
1. Open Customer detail
2. Tap Share
3. App generates / retrieves `access_token` for Customer
4. Formatted WhatsApp message + read-only link composed
5. Customer opens `app/l/[token]` → read-only ledger view
6. Token revocable by vendor at any time
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

### 5. CSV Data Export

<<<<<<< HEAD
1. User navigates to **Profile** and selects **Backup & Download**.
2. User taps **Download CSV Backup**.
3. All entries, payments, and customers are compiled into a CSV file.
4. The file is saved to the device or opened via the OS share sheet.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 13. Feature Specifications & Acceptance Criteria

### 1. Dashboard Screen

<<<<<<< HEAD
- **Outstanding Card**: Displays total outstanding balance in large bold font (`formatINR`). Highlights changes with red or green indicators.
- **Hero Actions**: Translucent button pills overlaying the card: **Collect Now** and **View Customers**.
- **Mini Stats Row**: Side-by-side micro cards showing `Needs action now` (total overdue) and `Collected this week`.
- **Priority Overdue List**: Denser list showing up to 3 overdue customers with outstanding amount and a quick **Collect** button.
- **Fallback**: Shows "Nothing needs action now" graphic with a primary call to action.

### 2. People (Customer List) Screen

- **Fuzzy Search**: Search input with debounce and substring matching.
- **Add Customer**: Sheet slider inputting customer name, phone, address, bank details, and UPI ID.
- **Customer Cards**: Displays name, phone number, outstanding balance (color-coded red if overdue, blue if in advance, green if settled).
- **Sort Filters**: Toggle chips to sort by _Due Date_, _Balance (high to low)_, or _Name (A-Z)_.

### 3. Entry Creation Screen

- **Amount Hero**: Dominant primary amount display using custom large numeric buttons.
- **Customer Selector Card**: Displays selected customer details and previous outstanding balance.
- **Entry Mode Toggle**: Switches between _Bill_ (credit extended) and _Payment_ (prefilled collect mode).
- **Draft Engine**: Supports adding multiple item rows (prices, fractional quantities), GST%, and loading fees.
- **Bill Footer**: Displays outstanding summary. Provides separate actions for **Save & Share** and **Save Only**.

### 4. Entry Detail Screen

- **Action Bar**: Displays context-aware actions: **Remind** (pre-composed WhatsApp share) and **Record Payment** for pending/partial states, or **Share Receipt** for fully paid entries.
- **Customer Card**: Displays name, phone number, and a direct shortcut to call the customer.
- **Outcome Status Badge**: Status indicator badge (Paid / Partially Paid / Pending / Overdue).
- **Items & Payments Lists**: Nested lists showing bill line items and payment history.

### 5. Profile Settings Screen

- **Business Info Card**: Displays business logo, business name, address, GSTIN, and UPI ID.
- **Preferences**: Toggle dark mode, switch language (English / Hindi).
- **Backup Section**: Link to navigate to the CSV Export backup screen.
- **Danger Zone**: Clear local caches and sync queues, or delete account.

### 6. Notifications Screen (Internal Queue)

- **Status**: Currently placeholder/empty directory. Push notifications are scheduled locally via `expo-notifications` at 9:30 AM for overdue balances.

### 7. Public Ledger Screen

- **Read-Only**: No database write operations are exposed. Tapping rows highlights individual entries.
- **Business Details**: Displays the merchant's business name, phone, address, and logo.
- **Balance Card**: Shows total outstanding balance.
- **Transaction History**: Unified timeline list of entries and payments.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

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

KredBook implements an offline-first strategy using a local cache and a mutation queue:

```
[Write Flow]
  Component Mutation
       │
       ▼
  Check Network Connection
      ├── [Online] ──► Execute Supabase API call ──► Refresh cache
      └── [Offline] ─► Add to MMKV Queue (enqueue) ─► Return optimistic success
                                                             │
                                                             ▼
                                                Replay on reconnect (dequeue)
```

<<<<<<< HEAD
- **Read Path**: Reads query the TanStack Query cache, which is persisted to local storage using MMKV. Data remains readable without active internet.
- **Write Path**: Mutations are checked for network reachability using `NetInfo`.
  - If connected: The mutation is executed directly on Supabase.
  - If offline (or if the request fails due to a network timeout): The mutation payload is serialized and appended to an MMKV-backed FIFO queue.
- **Queue Manager** ([syncQueue.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/lib/syncQueue.ts)):
  - Enforces a maximum size of 100 mutations to prevent memory leaks.
  - Generates a UUID for each queued transaction.
  - Automatically replays mutations in FIFO order when connectivity is restored.
  - Implements a retry count limit (maximum of 3 attempts). If a mutation fails 3 times due to non-network issues (e.g. database constraint failures), it is dropped to prevent queue blocks.
- **Visual Feedback**: A floating sync status banner at the top of the app displays the sync state:
  - **Offline**: Shows "Offline - X changes saved locally".
  - **Syncing**: Shows "Syncing changes...".
  - **Synced**: Shows "All changes synced".
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 15. Sharing Strategy (WhatsApp-First)

<<<<<<< HEAD
All customer communications are optimized for WhatsApp:

| Share Artifact               | Status     | Template / Mechanics                                                                                                                     |
| :--------------------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **WhatsApp Ledger Text**     | ✅ Built   | _"Hello {Customer Name}, your outstanding balance with {Business Name} is ₹{Balance}. Click here to view details: {Public Ledger Link}"_ |
| **Public Ledger Link**       | ✅ Built   | Generates a token-based URL: `https://kredbook.app/l/<token>`. Accesses read-only ledger details.                                        |
| **Individual Entry Receipt** | ⏳ Planned | Phase 5: PDF format containing billing items, taxes, loading charges, and total balance due.                                             |
| **Full Statement PDF**       | ⏳ Planned | Phase 5: Comprehensive PDF statement of transactions over a selected date range.                                                         |
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 16. AI Feature Guardrails

<<<<<<< HEAD
To prevent accounting errors, AI integrations are restricted by strict guidelines:

- **Edge Function Boundary**: All AI operations must be routed through Supabase Edge Functions. No direct AI model calls are allowed from the mobile client.
- **Allowed Use Cases**:
  - Drafting WhatsApp reminders.
  - Summarizing customer transaction timelines.
  - Suggesting priority rankings for collection follow-ups.
- **Hard Guardrails**:
  - **Opt-In Only**: AI features must be explicitly enabled by the user in settings.
  - **No Autonomous Execution**: AI can draft messages but cannot send them automatically.
  - **No Accounting Authority**: AI cannot modify ledger values or calculate outstanding balances. The database triggers and stored procedures remain the single source of truth.
  - **Graceful Fallback**: If the Edge Function is offline or rate-limited, the app must fall back to local rule-based priorities.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 17. Phase Roadmap

<<<<<<< HEAD
The phase roadmap is maintained in [STATUS.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/STATUS.md). The current progress matches the active development branch:

- **Phase 1: Truth Reset** (✅ Done)
  - Aligned codebase names to Customer, Entry, and Payment.
  - Created basic Dashboard layouts and design tokens.
- **Phase 2: DB Hardening** (✅ Done)
  - Dropped deprecated tables (suppliers, products).
  - Added CHECK constraints and `customer_balance` trigger sync.
- **Phase 3: Experience Upgrades** (✅ Done)
  - Implemented dark mode theme tokens.
  - Added localized currency formatting (`₹1,20,000` Indian format).
  - Added public ledger links.
- **Phase 4: UI/UX Redesign** (🔄 In Progress)
  - ✅ **4.0 Design System**: Rebuilt buttons, badges, skeletons, and icons.
  - ✅ **4.1 Core Screens**: Redesigned Dashboard, Entry Creator, Payment Modal, and Customer Detail.
  - ✅ **4.2 Detail Screens**: Redesigned Entry Detail, Edit Entry, and List pages.
  - 🔄 **4.3 Auth & Onboarding**: Rebuilt Welcome screen. Currently working on **4.3.2 Login audit & extraction**.
- **Phase 5: Documents & Collections** (⏳ Planned)
  - Statement PDF generator.
  - UPI collection QR codes.
- **Phase 6: AI Assistance** (⏳ Planned)
  - AI follow-up drafts and prioritize collection ranking.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 18. Success Metrics

Success is measured against performance, engagement, and safety targets:

<<<<<<< HEAD
- **Core Performance**:
  - Time to create an entry: **< 15 seconds** target.
  - Time to record a payment: **< 10 seconds** target.
  - Screen transition latency: **< 200ms**.
- **User Experience**:
  - WhatsApp share completion rate: **> 85%**.
  - Local database synchronization accuracy: **100%** (zero data mismatches between client and server).
- **Safety Guardrails**:
  - Data loss incidents from offline queue syncs: **0** tolerance.
  - API errors from AI edge functions: **< 1%**.
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

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

<<<<<<< HEAD
| Identified Risk                             | Impact | Planned Mitigation                                                                                                                                                                                       |
| :------------------------------------------ | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline Queue Synchronization Conflicts** | High   | Apply strict timestamp ordering. Customer balance recalculations are executed on the server using Postgres database triggers.                                                                            |
| **Theme Token Drift**                       | Medium | Enforce code linting rules preventing raw color values in CSS classes. Design tokens in [theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts) are the single source of truth. |
| **WhatsApp URL Breaking Changes**           | High   | Package share contents as plain text. Fall back to standard OS share sheets if URL scheme integrations change.                                                                                           |
| **Duplicate RLS Policies**                  | Low    | Consolidated migration is planned to remove redundant policy records from the database.                                                                                                                  |

### Open Questions

1. How should conflicts be resolved if the user updates customer details on both the client and server while offline?
2. What payment gateway integrations will support Phase 5 UPI reconciliation without requiring complex merchant banking licenses?
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

---

## 21. Environment & Setup

<<<<<<< HEAD
### Development Commands

```bash
# Install package dependencies
npm ci

# Start the Expo development server
npm run start

# Launch the Android compilation build
npm run android

# Launch the iOS compilation build
npm run ios

# Run code formatting and linter
npm run lint
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a
```

### Environment Variables (`.env` Template)

<<<<<<< HEAD
Configure a local `.env` file at the repository root:
=======
Create `.env.local` at repo root:
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a

```env
# Supabase API Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Sentry Crash Tracking (Optional)
EXPO_PUBLIC_SENTRY_DSN=https://sentry-dsn-url
```

<<<<<<< HEAD
### Supabase Local CLI Setup

```bash
# Initialize local Supabase configuration
supabase init

# Start local postgres and storage containers
supabase start

# Apply database schema migrations
supabase db push
```

---

## 20. Document Sync Contract

To prevent information drift, updates must follow a strict hierarchy. If files contain conflicting guidelines, the order of precedence is:

1. [SYSTEM_CONTEXT.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/SYSTEM_CONTEXT.md) (Highest Authority)
2. [naming-contract.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/naming-contract.md)
3. `PRD.md` (This Document)
4. [ARCHITECTURE.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/ARCHITECTURE.md)
5. [theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts)
6. [STATUS.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/STATUS.md)
7. Individual screen flow documents in `docs/flows/`
=======
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
>>>>>>> e70a190d510873325bb08808bde638b83aaa7c1a
