# KredBook Product Requirements Document (PRD)

KredBook is a strict single-mode digital ledger (khata) designed for small businesses and merchants in India. The product targets speed, visual clarity, and offline reliability over feature breadth.

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

## 2. Target User & Jobs-To-Be-Done

| User Segment                                   | Current Habit                                                                                        | Job-To-Be-Done                                                                                                                                                                                                                                                                                                                                                                |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Small business owners / merchants in India** | Track outstanding credit (udhaar) manually in paper diaries (bahi khata) or loose WhatsApp messages. | - Record credit sales (Entries) in under 30 seconds at the point of sale.<br>- Record cash collection (Payments) instantly without manual arithmetic.<br>- Check total outstanding receivables and identify overdue accounts.<br>- Share ledger statements with customers via WhatsApp.<br>- Rely on secure, offline-first transaction entry in areas with weak connectivity. |

---

## 3. Problem Statement

KredBook solves three primary problems for Indian small business merchants:

1. **Slow Capture at Point of Sale or Collection**: Manual recording of credit and payments is slow and error-prone during busy business hours, leading to forgotten transactions and cash leaks.
2. **Poor Visibility into Outstanding and Overdue Balances**: Merchants struggle to keep track of who owes what, how much is overdue, and when to follow up, resulting in delayed collections and constrained working capital.
3. **Data Loss and Confusion under Weak Connectivity**: Many wholesale and retail markets in India suffer from poor network signals. If an application lacks a robust local cache and queue system, entries fail, resulting in lost records and broken trust.

---

## 4. Product Principles

| Principle                                | Meaning & Enforcement Strategy                                                                                                                                               |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Speed over breadth**                | Screen layouts are designed amount-first. Key flows (creating an entry or recording a payment) must be achievable in less than 30 seconds.                                   |
| **2. Money clarity over visual noise**   | UI styling uses strong, semantic color weights (e.g., green for payments, red/amber for overdue entries) and large typography to make outstanding amounts instantly obvious. |
| **3. Offline-first by default**          | Read paths retrieve local cached data via React Query (persisted in MMKV). Write paths queue mutations locally and replay them in the background.                            |
| **4. WhatsApp-first sharing**            | WhatsApp is the default communication standard. Sharing is optimized for copy-paste text and deep links rather than email or generic PDF sheets.                             |
| **5. Strict scope beats feature sprawl** | Non-core capabilities (distributor modes, product catalogs, supplier tracking, inventory, GST filing) are strictly kept out of the active product surface.                   |
| **6. Naming contract enforcement**       | The canonical nouns (**Customer**, **Entry**, **Payment**) must be strictly utilized across all UI copy, documentation, and codebase comments.                               |

---

## 5. Canonical Nouns & Naming Contract

To prevent nomenclature drift, all new code, documentation, and user-facing copy must adhere to the naming contract. Where database tables use legacy terms, a clear mapping is defined:

| Active Product Term | UI & Copy Label                      | Legacy / Transitional Database Name | Rule                                                                               |
| :------------------ | :----------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------- |
| **Customer**        | Customer (or "People" in navigation) | `parties`                           | Always use "Customer" in text. `is_customer = true` is enforced in the DB.         |
| **Entry**           | Entry (or "Bill")                    | `orders`                            | An individual credit record. "Bill" is allowed only in share context.              |
| **Payment**         | Payment                              | `payments`                          | Cash collection against outstanding entries.                                       |
| **Entry Item**      | Item                                 | `order_items`                       | Nullable legacy fields exist (`product_id`/`variant_id`). Treated as transitional. |
| **User Profile**    | Profile (or Settings)                | `profiles`                          | Represents the merchant running KredBook. Referred to as `vendor` in legacy code.  |

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

The application stack is fully locked. Every dependency version is specified below from [package.json](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/package.json):

### Core App Framework

- **React**: `19.1.0`
- **React Native**: `0.81.5`
- **Expo**: `~54.0.33`
- **Expo Router**: `~6.0.6`

### State & Data Layers

- **Local State**: `Zustand` (`^5.0.8`)
- **Server State**: `TanStack React Query` (`^5.89.0`)
- **Offline Storage**: `react-native-mmkv` (`^4.3.1`)
- **Storage Client**: `@react-native-async-storage/async-storage` (`2.2.0`)
- **Database Client**: `@supabase/supabase-js` (`^2.57.4`)

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

---

## 8. Database Schema Reference

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
3. `on_payment_upsert`: Recalculates order `amount_paid` and updates its `status` (e.g. to `Paid` or `Partially Paid`) whenever a payment is registered.
4. `trg_sync_customer_balance`: Automatically recalculates `parties.customer_balance` as the sum of unpaid `orders.balance_due` whenever orders are inserted, updated, or deleted.

> [!WARNING]
> **Duplicate RLS Policies (Production Issue)**
> An audit of RLS rules in [schema.sql](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/schema.sql) revealed duplicate policies with different names. For example, `order_items` contains identical policies named `"Vendors can delete own order items"` and `"delete_own_order_items"`. This is also present in `orders`, `payments`, and `profiles` tables. This should be consolidated in a future migration sweep.

---

## 9. Architecture Overview

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

---

## 10. App Navigation & Routes

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

## 11. Core User Flows

### 1. Create Entry (Owed Credit)

1. User taps the floating action button (FAB) or navigates to `/entries/create`.
2. Amount pad is focused. User enters the bill total.
3. User selects a Customer from the bottom sheet picker.
4. User selects "Bill" (Entry) mode, optionally inputs a note, adds items, GST%, or loading charges.
5. User taps **Save & Share**.
   - Entry is stored locally and dispatched to the sync queue.
   - A PDF is prepared and sent to the native OS share sheet.
6. The app redirects the user to the newly created Entry Detail page.

### 2. Record Payment (Money Collected)

1. Triggered via **Collect** from the Dashboard overdue list, Customer Detail collect bar, or Entry Detail.
2. The shared **Record Payment** modal slides up.
3. User chooses the collection intent:
   - **Full Payment**: Prefills the entire outstanding balance and marks the action button as **Mark Fully Paid**.
   - **Partial Payment**: Shows a numeric keypad to input custom cash collected.
4. User selects the payment method (Cash, UPI, NEFT, Cheque) and inputs optional notes.
5. User taps **Record Payment**.
   - A database trigger updates the corresponding entry balance and status.
   - On success, the modal switches to the receipt state, allowing receipt sharing.

### 3. Dashboard Navigation & Collection

1. User logs in and lands on the **Dashboard**.
2. Merchant views total outstanding credit.
3. If overdue bills exist, the top 3 customers are surfaced under **Priority Customers**.
4. User taps **Collect** next to a customer to open the Record Payment sheet pre-filled with the customer's balance.
5. Tapping **Collect Now** on the hero card redirects to the top priority customer, or opens a customer picker if no overdue entries exist.

### 4. Share Ledger Link

1. User navigates to a **Customer Detail** page and taps **Share**.
2. The app requests a token for the customer, generating a unique token if none exists.
3. The app builds the link: `https://kredbook.app/l/<token>`.
4. The OS share sheet opens with the link and a pre-composed WhatsApp message.
5. The customer clicks the link and views their ledger in a read-only screen.

### 5. CSV Data Export

1. User navigates to **Profile** and selects **Backup & Download**.
2. User taps **Download CSV Backup**.
3. All entries, payments, and customers are compiled into a CSV file.
4. The file is saved to the device or opened via the OS share sheet.

---

## 12. Feature Specifications

### 1. Dashboard Screen

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

---

## 13. Offline-First Strategy

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

---

## 14. Sharing Strategy (WhatsApp-First)

All customer communications are optimized for WhatsApp:

| Share Artifact               | Status     | Template / Mechanics                                                                                                                     |
| :--------------------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **WhatsApp Ledger Text**     | ✅ Built   | _"Hello {Customer Name}, your outstanding balance with {Business Name} is ₹{Balance}. Click here to view details: {Public Ledger Link}"_ |
| **Public Ledger Link**       | ✅ Built   | Generates a token-based URL: `https://kredbook.app/l/<token>`. Accesses read-only ledger details.                                        |
| **Individual Entry Receipt** | ⏳ Planned | Phase 5: PDF format containing billing items, taxes, loading charges, and total balance due.                                             |
| **Full Statement PDF**       | ⏳ Planned | Phase 5: Comprehensive PDF statement of transactions over a selected date range.                                                         |

---

## 15. AI Feature Guardrails

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

---

## 16. Phase Roadmap

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

---

## 17. Success Metrics

Success is measured against performance, engagement, and safety targets:

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

---

## 18. Risks & Open Questions

| Identified Risk                             | Impact | Planned Mitigation                                                                                                                                                                                       |
| :------------------------------------------ | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline Queue Synchronization Conflicts** | High   | Apply strict timestamp ordering. Customer balance recalculations are executed on the server using Postgres database triggers.                                                                            |
| **Theme Token Drift**                       | Medium | Enforce code linting rules preventing raw color values in CSS classes. Design tokens in [theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts) are the single source of truth. |
| **WhatsApp URL Breaking Changes**           | High   | Package share contents as plain text. Fall back to standard OS share sheets if URL scheme integrations change.                                                                                           |
| **Duplicate RLS Policies**                  | Low    | Consolidated migration is planned to remove redundant policy records from the database.                                                                                                                  |

### Open Questions

1. How should conflicts be resolved if the user updates customer details on both the client and server while offline?
2. What payment gateway integrations will support Phase 5 UPI reconciliation without requiring complex merchant banking licenses?

---

## 19. Environment & Setup

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
```

### Environment Variables (`.env` Template)

Configure a local `.env` file at the repository root:

```env
# Supabase API Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Sentry Crash Tracking (Optional)
EXPO_PUBLIC_SENTRY_DSN=https://sentry-dsn-url
```

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
