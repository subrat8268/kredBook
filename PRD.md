# KredBook Product Requirements Document (PRD)

> **Version:** 2.2  
> **Last Updated:** 2026-06-13  
> **Status:** Active · Phase 4 (UI/UX Redesign)  
> **Owner:** Subrat Jena  
> **Repo:** [github.com/subrat8268/kredBook](https://github.com/subrat8268/kredBook)  
> **Supabase Project ID:** `sfmoefgjmgkwvauyaiyz`

KredBook is a strict single-mode digital ledger (khata) designed for small businesses and merchants in India. The product targets speed, visual clarity, and offline reliability over feature breadth.

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
23. [Accessibility (a11y) & Font Scaling](#23-accessibility-a11y--font-scaling)
24. [Security, Privacy & Compliance (DPDP Act)](#24-security-privacy--compliance-dpdp-act)
25. [Testing Strategy & Quality Gates](#25-testing-strategy--quality-gates)

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

### Broad Target
- Small business owners in India (kirana shops, traders, service providers, freelancers).
- Currently tracking udhaar/khata on paper, in WhatsApp, or across fragmented notes.
- Often working in low-connectivity or offline environments.
- Do not want or need ERP complexity.

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
| **Sale on credit** | Create an Entry in seconds | Customer balance updated, shareable immediately |
| **Customer pays** | Record a Payment instantly | Balance auto-updated, ledger history clean |
| **Need to follow up** | Know who owes what | Dashboard shows total outstanding + overdue |
| **Bad network** | Continue working | No data loss, writes replayed on reconnect |
| **Customer needs statement** | Share ledger or entry | WhatsApp-ready, no extra steps |

---

## 3. Problem Statement

### Context
Small businesses in India extend credit informally — goods or services delivered now, payment collected later. This is called *udhaar* or *khata*. The tracking of this is largely manual and fragmented.

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
1. **Slow capture** — every second of delay at point of sale reduces adoption.
2. **Poor visibility** — fragmented data means owners don't know their actual outstanding total.
3. **Data loss risk** — paper and chat are unreliable; any data loss destroys trust immediately.

KredBook solves all three with a focused khata workflow, offline-first writes, and clear balance tracking.

---

## 4. Product Principles

| # | Principle | Meaning & Enforcement Strategy |
|---|---|---|
| 1 | **Speed over breadth** | Screen layouts are designed amount-first. Key flows (creating an entry or recording a payment) must be achievable in less than 30 seconds. Any feature that adds steps must justify itself. |
| 2 | **Money clarity over visual noise** | UI styling uses strong, semantic color weights (e.g., green for payments, red/amber for overdue entries) and large typography to make outstanding amounts instantly obvious. |
| 3 | **Offline-first by default** | Read paths retrieve local cached data via React Query (persisted in MMKV). Write paths queue mutations locally and replay them in the background. No write path may depend on a live network to commit. |
| 4 | **WhatsApp-first sharing** | WhatsApp is the default communication standard. Share flows are optimized for WhatsApp copy-paste text and deep links rather than email or generic PDF sheets. |
| 5 | **Strict scope beats feature sprawl** | Non-core capabilities (distributor modes, product catalogs, supplier tracking, inventory, GST filing) are strictly kept out of the active product surface. Enforced in PR reviews and docs. |
| 6 | **AI is assistive, never authoritative** | AI can suggest and draft — it cannot write ledger data or send messages autonomously. AI outputs are labeled as suggestions, with graceful offline fallbacks. |
| 7 | **Naming contract enforcement** | The canonical nouns (**Customer**, **Entry**, **Payment**) must be strictly utilized across all UI copy, documentation, and codebase comments. |

---

## 5. Canonical Nouns & Naming Contract

To prevent nomenclature drift, all new code, documentation, and user-facing copy must adhere to the naming contract. Where database tables use legacy terms, a clear mapping is defined:

| Active Product Term | UI & Copy Label | Legacy / Transitional Database Name | Rule / Status |
| :--- | :--- | :--- | :--- |
| **Customer** | Customer (or "People" in navigation) | `parties` | Always use "Customer" in text. `is_customer = true` is enforced in the DB. |
| **Entry** | Entry (or "Bill") | `orders` | An individual credit record. "Bill" is allowed only in share context. |
| **Payment** | Payment | `payments` | Cash collection against outstanding entries. |
| **Entry Item** | Item | `order_items` | Nullable legacy fields exist (`product_id`/`variant_id`). Treated as transitional. |
| **User Profile** | Profile (or Settings) | `profiles` | Represents the merchant running KredBook. Referred to as `vendor` in legacy code. |

If legacy terms must appear in docs or comments, label them explicitly as **[legacy]** or **[transitional]**.

---

## 6. Scope: In vs Out

### Active Product Surface (Actually Built)
- **Customer Management**: Add customer, search (fuzzy match + highlight), browse customer list, view individual customer ledger details.
- **Entry Management**: Create entry (GST%, loading charges, notes, customized due-date chips), view entry details, and edit entry.
- **Payment Collection**: Record payments (Full/Partial intent selection, payment modes, optional note, result screen).
- **Dashboard**: Total outstanding hero, priority overdue list (up to 3 customers), mini stat cards, collection shortcut.
- **Offline Sync**: MMKV-backed transaction queue with background replayer and status banner.
- **Localization**: Full English (EN) and Hindi (HI) support via `i18next`.
- **Export**: Backup all entries as a locale-safe CSV file from the Profile page.
- **Sharing**: Generate token-based read-only public ledger links (`/l/[token]`) and WhatsApp-friendly text summaries.
- **Dark Mode**: Complete theme compatibility powered by semantic tokens in [theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts).
- **Push Notifications**: Local reminders for overdue accounts scheduled via `expo-notifications`.
- **Media Upload**: Avatar + business logo upload to Supabase Storage.

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
- Any AI flow that takes autonomous action without explicit user confirmation.

---

## 7. Constraints & Assumptions

### Technical Constraints

| Constraint | Detail |
|---|---|
| **Platform** | iOS and Android only — no web app as a primary target. |
| **Backend** | Supabase is the sole backend — no other DB, auth, or storage provider. |
| **Offline** | App must be fully usable with zero connectivity for all write operations. |
| **Schema changes** | Must go through `supabase/migrations/` — no ad-hoc SQL in production. |
| **Design tokens** | All colors, font sizes, spacing must come from `src/utils/theme.ts` — no hardcoded values. |
| **AI boundary** | All AI/LLM calls must go through Supabase Edge Functions — never directly from client. |
| **State** | Zustand for global/local state, TanStack Query for server state — no Redux. |
| **Naming** | Canonical nouns enforced (Customer, Entry, Payment) — legacy terms quarantined. |

### Business Constraints

| Constraint | Detail |
|---|---|
| **Free tier first** | Core features must work on the `free` subscription plan. Free features include: Customer management, entry creation, manual WhatsApp text sharing, local PDF generation, and MMKV offline sync queue. |
| **Paid tier ("Pro")** | Premium features (UPI links, on-screen QR codes, automated WhatsApp reminders, CSV backups, and AI priorities/summaries) will be paywalled under the `pro` subscription plan. |
| **Single-mode** | Product operates in customer-credit mode only — no supplier or inventory mode. |
| **India-first** | All UX, currency (₹), and language (EN/HI) decisions default to Indian context. |
| **WhatsApp-first share** | Any sharing surface must work via WhatsApp as the primary distribution channel. |

### Assumptions

| # | Assumption | Risk if Wrong |
|---|---|---|
| 1 | Users have Android or iOS smartphones with Expo-compatible OS versions. | App unusable on very old devices. |
| 2 | Users have intermittent but eventual internet connectivity. | Pure offline mode needs stronger queue durability. |
| 3 | Users prefer Hindi or English — no other regional languages needed in Phase 4. | May need Marathi, Tamil, etc. in future phases. |
| 4 | A single business owner operates the app — no employee/staff accounts needed. | Multi-user becomes a new phase if assumption breaks. |
| 5 | Supabase free tier is sufficient for current user volume. | Needs paid plan upgrade if DAU/storage grows. |

---

## 8. Tech Stack (Locked)

The application stack is fully locked. Every dependency version is specified below from [package.json](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/package.json):

### Core App Framework & Database

| Layer | Technology | Version / Notes |
|---|---|---|
| **Framework** | React Native | `0.81.5` |
| **UI Runtime** | Expo | `~54.0.33` |
| **Navigation** | Expo Router (file-based) | `~6.0.6` |
| **React** | React / React DOM | `19.1.0` |
| **Database** | Supabase (PostgreSQL) | Project: `sfmoefgjmgkwvauyaiyz` |
| **Auth** | Supabase Auth | Phone/OTP + email |
| **Storage** | Supabase Storage | Buckets: `avatars`, `business-logos` |
| **RLS** | Row Level Security | Enabled on all public tables |
| **Edge Functions** | Supabase Edge Functions | Required for all AI feature calls |

### State, Styling, & UI Components

| Layer | Technology | Version |
|---|---|---|
| **Global State** | Zustand | `^5.0.8` |
| **Server State** | TanStack Query | `^5.89.0` |
| **Persistent Cache** | TanStack Query Persist Client + MMKV | `^5.96.2` / `^4.3.1` |
| **Styling** | NativeWind + TailwindCSS | `^4.2.1` / `^3.4.17` |
| **Design Tokens** | `src/utils/theme.ts` | **Source of truth — never hardcode** |
| **Lists** | Shopify FlashList | `^1.8.3` |
| **Bottom Sheet** | @gorhom/bottom-sheet | `^5.2.6` |
| **Forms** | Formik + Yup | `^2.4.6` / `^1.7.0` |
| **i18n** | i18next + react-i18next | `^25.8.13` / `^16.5.4` |
| **Icons** | lucide-react-native | `^0.545.0` |

### Utilities & Developer Tools

| Tool | Purpose | Version |
|---|---|---|
| **Date Utils** | date-fns | `^4.1.0` |
| **Notifications** | expo-notifications | `~0.32.16` |
| **Printing** | expo-print | `~15.0.7` |
| **Crash Tracking** | @sentry/react-native | `~7.2.0` |
| **TypeScript** | Advanced Type Safety | `~5.9.2` |
| **Linter / Formatter**| Biome | `^2.4.12` |
| **ESLint Config** | ESLint configuration | `^9.25.0` / `eslint-config-expo: ~10.0.0` |
| **Testing** | Jest | `~29.7.0` |

---

## 9. Database Schema Reference

The database runs on Supabase (Postgres). The tables and columns are defined below based on [schema.sql](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/schema.sql):

### 1. `public.profiles` (Merchant Profile)
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
3. `on_payment_upsert`: Recalculates order `amount_paid` and updates its `status` (e.g., to `Paid` or `Partially Paid`) whenever a payment is registered.
4. `trg_sync_customer_balance`: Automatically recalculates `parties.customer_balance` as the sum of unpaid `orders.balance_due` whenever orders are inserted, updated, or deleted.

### RLS Policies
All public tables have Row-Level Security **enabled**. The universal pattern scoped to profiles is:
```sql
vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```
`profiles` uses `auth.uid() = user_id` directly.

> [!WARNING]
> **Duplicate RLS Policies (Production Issue)**
> An audit of RLS rules in [schema.sql](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/schema.sql) revealed duplicate policies with different names. For example, `order_items` contains identical policies named `"Vendors can delete own order items"` and `"delete_own_order_items"`. This is also present in `orders`, `payments`, and `profiles` tables. This should be consolidated in a future migration sweep.

### Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `avatars` | Public read, authenticated write/delete | User profile photos |
| `business-logos` | Public read, authenticated write/update/delete | Business branding for exports/sharing |

---

## 10. Architecture Overview

KredBook employs a clean separation of layers, routing database calls through local hooks and a central offline queue:

```
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
```

### API Responsibilities

| File | Responsibility |
|---|---|
| [auth.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/auth.ts) | Sign in, sign up, sign out, Google OAuth, session initialization |
| [dashboard.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/dashboard.ts) | Outstanding totals, overdue queries, net position report metrics |
| [entries.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/entries.ts) | CRUD operations on Entries (`orders` + `order_items`), recording payments |
| [people.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/people.ts) | CRUD operations on Customers (`parties`), detail resolution |
| [export.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/export.ts) | Resolves transaction data sets for backup CSV exports |
| [exportCustomer.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/exportCustomer.ts) | Fetches customer ledger entries and formats rows for sharing |
| [overdueReminders.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/overdueReminders.ts) | Isolates customers with unpaid balances past their due dates |
| [profiles.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/profiles.ts) | Profile read / update settings |
| [upload.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/upload.ts) | Avatar + business logo upload handling to Storage |

### Zustand Stores

| Store | State Managed |
|---|---|
| `useAuthStore` ([authStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/authStore.ts)) | Tracks authenticated session, fetch status, profile data, and subscription validity. |
| `useLanguageStore` ([languageStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/languageStore.ts)) | Retains selected local preference ('en' \| 'hi') and sets i18next language. |
| `useOrderStore` ([orderStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/orderStore.ts)) | Manages state for entry/invoice drafts (items list, quantity modifications, rates, GST tax %, loading fees). |
| `usePreferencesStore` ([preferencesStore.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/preferencesStore.ts)) | Stores dark mode preference, dashboard range (7/30/90 days), push notification toggles, snoozed reminders, and audit history. |

---

## 11. App Navigation & Routes

The application routing is file-based and defined under the `app/` folder:

```
app/
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

---

## 12. Core User Flows

### Flow 1: Create an Entry (Owed Credit)
1. User taps the floating action button (FAB) or navigates to `/entries/create`.
2. Amount pad is focused. User enters the bill total.
3. User selects or searches a Customer from the bottom sheet picker.
4. User selects "Bill" (Entry) mode, optionally inputs a note, adds items, GST%, or loading charges.
5. User taps **Save & Share**.
   - Entry is stored locally and dispatched to the sync queue.
   - A PDF is prepared and sent to the native OS share sheet.
6. The app redirects the user to the newly created Entry Detail page.

### Flow 2: Record Payment (Money Collected)
1. Triggered via **Collect** from the Dashboard overdue list, Customer Detail collect bar, or Entry Detail.
2. The shared **Record Payment** modal slides up.
3. User chooses the collection intent:
   - **Full Payment**: Prefills the entire outstanding balance and marks the action button as **Mark Fully Paid**.
   - **Partial Payment**: Shows a numeric keypad to input custom cash collected.
4. User selects the payment method (Cash, UPI, NEFT, Cheque) and inputs optional notes.
5. User taps **Record Payment**.
   - A database trigger updates the corresponding entry balance and status.
   - On success, the modal switches to the receipt state, allowing receipt sharing.

### Flow 3: Dashboard Navigation & Collection
1. App opens → auth check → redirect to Dashboard.
2. Outstanding totals loaded from `src/api/dashboard.ts`.
3. If overdue bills exist, the top 3 customers are surfaced under **Priority Customers**.
4. User taps **Collect** next to a customer to open the Record Payment sheet pre-filled with the customer's balance.
5. Tapping **Collect Now** on the hero card redirects to the top priority customer, or opens a customer picker if no overdue entries exist.

### Flow 4: Share Ledger Link
1. User navigates to a **Customer Detail** page and taps **Share**.
2. The app requests a token for the customer, generating a unique token if none exists.
3. The app builds the link: `https://kredbook.app/l/<token>`.
4. The OS share sheet opens with the link and a pre-composed WhatsApp message.
5. The customer clicks the link and views their ledger in a read-only screen.
6. Token is revocable by the vendor at any time.

### Flow 5: CSV Data Export
1. User navigates to **Profile** and selects **Backup & Download**.
2. User taps **Download CSV Backup**.
3. All entries, payments, and customers are compiled into a CSV file.
4. The file is saved to the device or opened via the OS share sheet.

### Flow 6: Onboarding
1. First launch → sign-up (phone OTP or email).
2. Supabase Auth creates `auth.users` row.
3. Profile row created in `profiles` with `onboarding_complete = false`.
4. Onboarding screens collect business name, phone, and optional bank details.
5. `onboarding_complete` set to `true` → redirect to Dashboard.

---

## 13. Feature Specifications & Acceptance Criteria

### 1. Dashboard Screen

**Specification:**
- **Outstanding Card**: Displays total outstanding balance in large bold font (`formatINR`). Highlights changes with red or green indicators.
- **Hero Actions**: Translucent button pills overlaying the card: **Collect Now** and **View Customers**.
- **Mini Stats Row**: Side-by-side micro cards showing `Needs action now` (total overdue) and `Collected this week`.
- **Priority Overdue List**: Denser list showing up to 3 overdue customers with outstanding amount and a quick **Collect** button.
- **Fallback**: Shows "Nothing needs action now" graphic with a primary call to action.

**Acceptance Criteria:**
- [ ] Outstanding total is accurate to the last sync.
- [ ] Overdue Customers are listed and sorted by oldest due date first.
- [ ] Overdue badge styling uses `theme.ts` tokens — no hardcoded colors.
- [ ] Loading state shown during fetch; error state shown on failure.
- [ ] Works correctly in offline mode (shows cached data with stale indicator).

---

### 2. People (Customer Management) Screen

**Specification:**
- List of all Customers with outstanding balance and last activity date.
- Search by name or phone (local, no network required).
- Add new Customer: name (required), phone, address, payment details.
- Customer detail: full entry/payment history, add Entry, record Payment, share ledger.
- Import from phone contacts via `expo-contacts`.

**Acceptance Criteria:**
- [ ] Customer list loads from cache first, then refreshes from Supabase.
- [ ] Search is instant (< 100ms) and works offline.
- [ ] Phone number is unique per vendor — duplicate blocked with user-friendly error.
- [ ] Customer balance shown reflects current `customer_balance` value.
- [ ] "Add Customer" form validates phone format before submission.
- [ ] Customer detail shows all Entries and Payments in chronological order.
- [ ] Share ledger action generates a valid `access_token` and opens WhatsApp intent.

---

### 3. Entry Creation Screen

**Specification:**
- **Amount Hero**: Dominant primary amount display using custom large numeric buttons.
- **Customer Selector Card**: Displays selected customer details and previous outstanding balance.
- **Entry Mode Toggle**: Switches between *Bill* (credit extended) and *Payment* (prefilled collect mode).
- **Draft Engine**: Supports adding multiple item rows (prices, fractional quantities), GST%, and loading fees.
- **Bill Footer**: Displays outstanding summary. Provides separate actions for **Save & Share** and **Save Only**.
- **Bill Number Auto-Generation**:
  - Auto-generated sequentially per vendor via Supabase RPC `get_next_bill_number` using `vendor_id` and the `bill_number_prefix` (default `INV`).
  - Format: `<Prefix>-<PaddedSeqNumber>` (e.g., `INV-001`, `INV-002`).
  - Uniqueness: Strictly scoped per-vendor via database unique constraint `UNIQUE(vendor_id, bill_number)`.
  - Offline Fallback: If database query fails or user is offline, falls back to timestamp-based suffix: `${prefix}-${Date.now().toString().slice(-6)}`.

**Acceptance Criteria:**
- [ ] New Entry can be created in < 20 seconds (3 taps + form fill).
- [ ] Status updates automatically after Payment is recorded (no manual refresh required).
- [ ] `balance_due` shown matches DB generated value — no client-side calculation divergence.
- [ ] Entries can be filtered by Pending / Partially Paid / Paid without network call.
- [ ] Entry detail shows edit history (edit_count visible if > 0).
- [ ] Offline Entry creation is queued and replayed on reconnect without data loss.
- [ ] Auto-generation sequence correctly pads bill numbers (e.g. `INV-001`, `INV-002`) and increments correctly.
- [ ] Fallback timestamp-based bill number is generated successfully when offline.

---

### 4. Entry Detail Screen

**Specification:**
- **Action Bar**: Displays context-aware actions: **Remind** (pre-composed WhatsApp share) and **Record Payment** for pending/partial states, or **Share Receipt** for fully paid entries.
- **Customer Card**: Displays name, phone number, and a direct shortcut to call the customer.
- **Outcome Status Badge**: Status indicator badge (Paid / Partially Paid / Pending / Overdue).
- **Items & Payments Lists**: Nested lists showing bill line items and payment history.

**Acceptance Criteria:**
- [ ] Back button, titles, dates are aligned to typography tokens.
- [ ] Tapping Customer Card redirects to the Customer Detail screen.
- [ ] Payments lists match individual payment records in DB.
- [ ] Edit/delete actions in the header overflow menu trigger correct database/sync events.

---

### 5. Profile Settings Screen

**Specification:**
- **Business Info Card**: Displays business logo, business name, address, GSTIN, and UPI ID.
- **Preferences**: Toggle dark mode, switch language (English / Hindi).
- **Backup Section**: Link to navigate to the CSV Export backup screen.
- **Danger Zone**: Clear local caches and sync queues, or delete account.

**Acceptance Criteria:**
- [ ] Profile edits are saved and reflected immediately on next screen load.
- [ ] Avatar and logo upload succeed and URL is persisted to `profiles` table.
- [ ] Language switch applies globally without app restart.
- [ ] CSV export contains all Entries with correct column headers.
- [ ] PDF export renders business name, logo, billing details, and entry table correctly.
- [ ] `bill_number_prefix` change is reflected in next new Entry's bill number.

---

### 6. Overdue Push Notifications

**Specification:**
- Scheduled by `src/api/overdueReminders.ts`.
- Fires for entries where `due_date < today` AND `status != 'Paid'`.
- Uses `expo-notifications` (local, not server-push in Phase 4).
- **Permission Flow**:
  - Request permission during the ready/complete stage of Onboarding, or when the user toggles reminders on in Settings.
  - Denials: If permission is denied, log quietly, toggle remains disabled, and store `remindersPermissionDenied = true` in preferences.
  - Re-prompt Strategy: If permission was denied, subsequent toggling prompts the user to open native system settings (`Linking.openSettings()`).

**Acceptance Criteria:**
- [ ] Notification fires within the scheduled window for overdue entries.
- [ ] Tapping notification navigates to correct Entry detail.
- [ ] Notification does not fire for fully paid entries.
- [ ] Respects device notification permissions — fails gracefully if denied.
- [ ] Permission toggle gracefully fails when denied, resetting status to off.
- [ ] Redirects user to native OS settings when enabling notifications after a previous denial.

---

### 7. Public Ledger Screen

**Specification:**
- `access_tokens` table manages per-customer read tokens.
- `app/l/[token]` serves read-only ledger — no auth required.
- Token has `expires_at` (nullable) and `is_revoked` fields.

**Acceptance Criteria:**
- [ ] Public ledger loads without authentication.
- [ ] Shows only the Entries/Payments for the token's `customer_id`.
- [ ] Revoked or expired token shows a clear "link is no longer active" message.
- [ ] No edit or payment actions available in the public view.
- [ ] Vendor can revoke the token from Customer detail screen.

---

### 8. Payment Overpay Validation & Downtime UI

**Specification:**
- **Overpay Prevention**:
  - In the Record Payment modal, partial payments cannot exceed the outstanding balance due.
  - Input amounts exceeding the outstanding balance display an inline error: `"Amount cannot exceed ₹due"`, and the submit button is disabled.
- **Downtime UI Handling**:
  - If Supabase is entirely down, read paths retrieve and display cached data from MMKV with a top warning status banner ("Offline - X changes saved locally").
  - Attempting to record payments or create entries during downtime displays a warning or sync-pending state. Local mutations are queued.
- **Malformed Ledger Token**:
  - Accessing `/l/[token]` with an invalid, revoked, or expired token renders a "Link unavailable" error screen: "This link is invalid or has expired."

**Acceptance Criteria:**
- [ ] Entering an amount greater than the outstanding balance disables the collect/payment button and displays an inline warning.
- [ ] Read paths retrieve cache and display stale warning banner when network or database is offline.
- [ ] Malformed or expired shared tokens successfully render the "Link unavailable" screen instead of raw errors.

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

### Read Path
- TanStack Query + MMKV persist caches all queries.
- App hydrates from MMKV on cold start before any network call.
- Stale data is displayed with a sync status indicator when offline.

### Write Path
- Mutations are checked for network reachability using `@react-native-community/netinfo`.
- If connected: The mutation is executed directly on Supabase.
- If offline (or if the request fails due to a network timeout): The mutation payload is serialized and appended to an MMKV-backed FIFO queue.

### Queue Manager ([syncQueue.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/lib/syncQueue.ts))
- Enforces a maximum size of 100 mutations to prevent memory leaks.
- Generates a UUID for each queued transaction.
- Automatically replays mutations in FIFO order when connectivity is restored.
- Implements a retry count limit (maximum of 3 attempts). If a mutation fails 3 times due to non-network issues, it is dropped to prevent queue blocks.

### Visual Feedback
- A floating sync status banner at the top of the app displays the sync state:
  - **Offline**: Shows "Offline - X changes saved locally".
  - **Syncing**: Shows "Syncing changes...".
  - **Synced**: Shows "All changes synced".
  - **Sync Error**: If Supabase is down or unreachable during sync replay, displays "Sync failed • Tap to retry". Replay retries up to 3 times before prompting manual retry or marking queue item as paused.

---

## 15. Sharing Strategy (WhatsApp-First)

All customer communications are optimized for WhatsApp:

### Share Artifacts

| Artifact | Status | Implementation |
|---|---|---|
| **Formatted WhatsApp text** | ✅ Built | Message detailing name, outstanding amount, due date, and payment instructions. |
| **Read-only ledger link** | ✅ Built | Generated token-based URL: `https://kredbook.app/l/<token>`. |
| **PDF statement** | ✅ Built | Full ledger statement generated locally via `expo-print` and shared via `expo-sharing`. |
| **CSV export** | ✅ Built | Profile → Export backup CSV. |

### Rules
- Recipients are always read-only — no edit access ever.
- Share copy uses canonical terms (Customer/Entry/Payment), never legacy terms.
- Business name + logo from Profile included in PDF/share artifacts.
- Sharing degrades gracefully offline (WhatsApp text available; link queued).

---

## 16. AI Feature Guardrails

AI features are strictly assistive, opt-in (planned for Phase 5/6), and must never be in the core product loop.

### Hard Rules
- All LLM calls route through **Supabase Edge Functions** — never client-to-LLM directly.
- No AI feature writes data or sends messages without explicit user confirmation.
- No AI output is accounting truth — always labeled as a suggestion.
- Graceful fallback when offline or Edge Function is unavailable.

### Allowed Use Cases (Phase 5)
- Follow-up prioritization: "Who should you contact today?"
- Customer summary: "Rahul owes ₹4,200, overdue 12 days."
- WhatsApp draft assistance.
- Anomaly hints: unusually large entry, duplicate customer names.

### Guardrails Checklist
- [ ] Opt-in only — never on by default.
- [ ] No autonomous write operations.
- [ ] No hidden actions.
- [ ] Strict input allowlists on Edge Function.
- [ ] Rate limiting on Edge Function.
- [ ] Audit log for all AI calls.
- [ ] Safe offline fallback with no broken UI.

---

## 17. Phase Roadmap

The phase roadmap is maintained in [STATUS.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/STATUS.md). The current progress matches the active development branch:

### ✅ Phase 1 — Foundation (Complete)
- Aligned codebase names to Customer, Entry, and Payment.
- Created basic Dashboard layouts and design tokens.
- Offline-first with TanStack Query + MMKV.
- CSV export.
- Supabase Auth + RLS.

### ✅ Phase 2 — Reliability (Complete)
- Sync UX improvements.
- Overdue prioritization logic.
- Schema constraint hardening (dropped deprecated tables, added CHECK constraints).

### ✅ Phase 3 — Polish (Complete)
- Push notifications for overdue (`expo-notifications`).
- Public ledger share link (`access_tokens` + `app/l/[token]`).
- WhatsApp-first sharing surfaces.
- PDF export (`expo-print`).

### 🔄 Phase 4 — UI/UX Redesign (Active)
- ✅ **4.0 Design System**: Rebuilt buttons, badges, skeletons, and icons.
- ✅ **4.1 Core Screens**: Redesigned Dashboard, Entry Creator, Payment Modal, and Customer Detail.
- ✅ **4.2 Detail Screens**: Redesigned Entry Detail, Edit Entry, and List pages.
- 🔄 **4.3 Auth & Onboarding**: Rebuilt Welcome screen. Currently working on **4.3.2 Login audit & extraction**.

### ⏳ Phase 5 — Payments & AI (Planned)
- UPI collection support (payment link / in-app QR).
- Opt-in AI: prioritization, summaries, WhatsApp drafts.
- All AI via Supabase Edge Functions.
- Receipt-friendly sharing surfaces.

---

## 18. Success Metrics

Success is measured against performance, engagement, and safety targets:

| Metric | Target |
|---|---|
| **Time to create an Entry** | < 20 seconds |
| **Time to record a Payment** | < 10 seconds |
| **Offline write replay success rate** | 99.9% |
| **WhatsApp share completion rate** | Track → increase each phase |
| **Overdue balance resolution rate** | Track → trend down over time |
| **Customer search response time** | < 300ms on device |
| **Screen transition latency** | < 200ms |
| **Local database sync accuracy** | 100% (zero silent data mismatches) |
| **AI Edge Function API error rate** | < 1% |
| **Cold start time** | < 1.5s on mid-range devices |
| **Scroll performance (FlashList)** | 60fps average (zero frame drops on swipe) |
| **Max payload size per page** | PAGE_SIZE = 10 items (paginated) |

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
- **PROD-1**: No write operation silently fails — all errors surface to user.
- **PROD-2**: `balance_due` on screen matches DB generated value — no divergence.
- **PROD-3**: Entry `status` is only set by DB trigger — never written from app code.
- **PROD-4**: Public ledger (`app/l/[token]`) shows zero edit/payment actions.
- **PROD-5**: Revoked or expired token shows correct error state.
- **PROD-6**: RLS blocks cross-vendor data reads — verified by Supabase policy test.
- **PROD-7**: Minimum touch target size of 44dp (iOS) / 48dp (Android) on all interactive elements.
- **PROD-8**: 100% of linting checks run clean with Biome and ESLint (`npm run lint`).
- **PROD-9**: RLS policies active and verified on all public schema tables.

---

## 20. Risks & Open Questions

### Active Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Duplicate RLS policies in schema** | Low — safe but noisy | Clean up in a future migration; audit naming. |
| **Legacy `order`/`party` terms confusing AI agents** | Medium | Strict naming contract enforced here + `SYSTEM_CONTEXT.md`. |
| **Dark mode drift if screens bypass `theme.ts`** | Medium | Biome lint rule + PR review gate. |
| **Offline queue silent failure** | High | Surfaced errors mandatory; replay audit on reconnect. |
| **WhatsApp text / link / PDF behavior diverging** | Medium | Single share service, unified entry point. |
| **`customer_balance` drift if app logic has a bug** | Medium | Consider converting to DB trigger (see Open Questions). |

### Open Questions

| # | Question | Impact if Unresolved |
|---|---|---|
| OQ-1 | How much preview/edit before sending a WhatsApp draft? | UX gap in Phase 5 AI sharing. |
| OQ-2 | Should overdue prioritization be rule-based only, or accept optional AI ranking? | Phase 5 AI scope. |
| OQ-3 | Phase 5 UPI UX: deep link only, or in-app QR generator? | Architecture decision needed before Phase 5. |
| OQ-4 | Should `access_tokens.expires_at` have a default expiry enforced at schema level? | Security exposure if tokens never expire. |
| OQ-5 | Should `customer_balance` become a DB-trigger-managed generated value? | Data integrity risk if current app logic has edge cases. |
| OQ-6 | Are Marathi / Tamil languages needed in Phase 5? | Persona 1 (Rajan) may need regional language. |

---

## 21. Environment & Setup

### Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli` or use `npx expo`
- Supabase account — project `sfmoefgjmgkwvauyaiyz`
- Android Studio (Android) or Xcode (iOS) for native builds

### Local Development
```bash
# Install package dependencies
npm install

# Start the Expo development server
npm start

# Launch the Android compilation build
npm run android

# Launch the iOS compilation build
npm run ios

# Run code formatting and linter (ESLint + Biome)
npm run lint
```

### Environment Variables (`.env.local` Template)
Create a `.env.local` file at the repository root:
```env
# Supabase API Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Sentry Crash Tracking (Optional)
EXPO_PUBLIC_SENTRY_DSN=https://sentry-dsn-url
```
> ⚠️ Never commit `.env.local`. It is covered by `.gitignore`.

### Supabase Local CLI Setup
```bash
# Initialize local Supabase configuration
npx supabase start

# Apply database schema migrations
npx supabase db push

# Generate TypeScript type definitions from live schema
npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts
```

### Key Config Files

| File | Purpose |
|---|---|
| `app.json` | Expo config: name, slug, icons, permissions, credentials |
| `metro.config.js` | Bundler: SVG transformer, NativeWind support |
| `babel.config.js` | Babel: Reanimated plugin registration |
| `tailwind.config.js` | TailwindCSS + NativeWind theme configuration |
| `tsconfig.json` | TypeScript paths + configuration |
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

If files contain conflicting guidelines, the order of precedence is:

| Priority | File | Wins On |
|---|---|---|
| 1 | `PRD.md` | Scope, principles, phase status |
| 2 | `SYSTEM_CONTEXT.md` | AI agent operational instructions |
| 3 | `schema.sql` | Data shape — never guess schema |
| 4 | `src/utils/theme.ts` | Design tokens — never hardcode |

---

## 23. Accessibility (a11y) & Font Scaling

### 1. Minimum Touch Targets
All interactive controls, including tab bar buttons, floating action buttons (FABs), list items, edit fields, and dialog options, must adhere to standard physical target boundaries:
- **Android**: Minimum of **48 x 48 dp**.
- **iOS**: Minimum of **44 x 44 dp**.
Dense table cells or small list accessories must use padding to expand the target area to satisfy these requirements.

### 2. Dynamic Font Scaling
To support merchants needing readability improvements (such as Dinesh, Persona 3):
- Every text element must support user-selected system accessibility font scaling (React Native `allowFontScaling={true}`).
- Components must use flexible layouts (`flex-wrap`, auto-wrapping text labels, and scrollable container limits) rather than hardcoded container heights to prevent text clipping, overlapping, or layout disruption when scaled up to 200%.

### 3. Screen Reader Configuration
Core elements must be fully compatible with VoiceOver (iOS) and TalkBack (Android):
- **Labels**: Use explicit `accessibilityLabel` attributes to describe the function of graphic-only buttons (e.g. `accessibilityLabel="Record payment"` on the check icon button).
- **Roles & States**: Assign appropriate `accessibilityRole` (e.g., `'button'`, `'checkbox'`, `'header'`) and track dynamic states using `accessibilityState`.

### 4. Color Contrast Standards
All foreground-to-background combinations must satisfy **WCAG 2.1 Level AA** contrast minimums:
- **Normal Text**: Minimum contrast ratio of **4.5:1** against the background.
- **Large Text (≥ 18dp Bold or 24dp Regular)**: Minimum contrast ratio of **3.0:1**.
- **State Badges**: Color combinations for state indicators must maintain legibility (e.g. `colors.overdue.text` [Red-600] on `colors.overdue.bg` [Red-100] is verified at 5.1:1 contrast).

---

## 24. Security, Privacy & Compliance (DPDP Act)

### 1. PII Handling & Isolation
Merchant business names, customer names, phone numbers, addresses, bank details, and ledger balances represent Personally Identifiable Information (PII) under India's Digital Personal Data Protection (DPDP) Act.
- **Data Scoping**: RLS policies strictly quarantine records. No vendor can access another vendor's profile, customers, or entries. Scoping is enforced via database RLS policy checking `vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`.
- **API Boundary**: Client-to-database requests are strictly authenticated. Public routes do not expose write APIs or internal vendor identifiers.

### 2. User Data Deletion Workflow
To respect the "Right to Erasure" under the DPDP Act, KredBook supports complete account deletion:
- **Cascade Deletion**: When a user account is deleted in Supabase auth (`auth.users`), the system triggers a cascade delete down through the associated `public.profiles` record.
- **Cleanup Chain**: The deletion cascades automatically to all associated `parties`, `orders`, `order_items`, `payments`, and `access_tokens` rows, permanently purging all transactional, ledger, and personal data from the database.

### 3. Public Ledger Sharing Controls
The read-only ledger links generated under `/l/[token]`:
- Use unauthenticated GET mapping strictly to the RPC `get_ledger_by_token`.
- Restrict visible data to the customer's specific transaction timeline (type, date, amount, bill number) and the vendor business name/phone.
- Do not expose any edit/record payment capabilities, other vendor profiles, or other customers' ledgers.
- Are instantly revocable by the merchant from the customer details screen, which deletes the corresponding token row and immediately disables access.

---

## 25. Testing Strategy & Quality Gates

### 1. Testing Scopes
- **Unit Tests (Jest)**: Target mathematical functions (INR currency formatting, interest/GST calculation, outstanding sum reductions), schema validation schemas (Yup, Formik inputs), and offline queue serialization helpers.
- **Integration Tests (Zustand/Query)**: Validate state store actions, local MMKV cache hydration cycles, network status transitions, and offline write synchronization queues.
- **End-to-End Tests (Maestro/Detox)**: Focus on primary critical paths: Onboarding flow, Customer creation, Entry recording, and Payment collecting.

### 2. Release Quality Gates
Prior to shipping a new phase or feature release, the application must pass these quality gates:
1. **Linting Check**: `npm run lint` must return 0 errors and warning-clean logs on Biome and ESLint.
2. **TypeScript Compilation**: The project must build without TypeScript compilation warnings or errors.
3. **Database Consistency**: 100% of active schema tables must have verified RLS policies and passing security tests.
4. **Offline Queue Replay Verification**: Replay success rate must meet the 99.9% target under simulated network latency.

---

*This document is the product-level source of truth for KredBook. Any AI agent, engineer, or external contributor must treat `PRD.md` as the primary reference for what the product is, what is in scope, what is built, and what comes next.*
