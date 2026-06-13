# KredBook Implementation Plan (ImplementationPlan.md)

> **KredBook** is a Bharat-first credit ledger (khata) app designed for kirana owners, traders, and small merchants in India. This implementation plan tracks the historical work completed, details the active UI/UX redesigns, and documents the technical layout specifications for the core screens.

---

## 1. Project Goal & Phase 4 Scope

KredBook is currently in **Phase 4 — UI/UX Redesign**. The primary goal is to upgrade the application's visual layout, interaction paradigms, and offline-first data patterns to match premium design system tokens. 

We are systematically auditing, refactoring, and redesigning every screen to ensure:
* Strict alignment with [DESIGN.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/DESIGN.md) tokens (colors, typography, spacing, radius, shadows, and z-indices).
* High-density, touch-friendly layouts (44dp+ touch targets, clear tabular amounts, and thumb-zone optimization).
* Robust offline-first operations driven by TanStack Query and the MMKV sync queue.
* Deep support for a11y (low-light contrast, dynamic scaling) and dual languages (EN / HI).

---

## 2. Git History & Milestone Registry

Below is the repository's git commit timeline tracking completed database improvements, core experience upgrades, and the Phase 4 UI/UX redesign progress:

### 2.1 Technical & Database Hardening (Phase 2 & 3)
* **`34ca734` — DB Audit Fixes**: Fixed vendor authentication, schema table triggers (case-sensitivity), NULL coercion, and consolidated DB queries into single optimized RPC calls.
* **`6127854` — RPC Unwrap Resolution**: Resolved RPC payload unwrapping issues and corrected the running balance signs.
* **`86f0846` — Financial Logic Audit**: Consolidated customer code paths, aligned overdue status logic, and added database safety constraints to prevent negative amount calculations.
* **`b61fafa` — Balance Reconciliation Trigger**: Created a live database trigger (`sync_party_customer_balance`) that automatically reconciles a customer's `customer_balance` whenever orders are created, updated, or deleted, ensuring mathematical parity.
* **`47a0d17` — History Paginate & Skeletons**: Added paginated history loading for older transactions on the Customer Detail timeline and wired skeleton loader states.
* **`6e4a3cc` & `3a18f8c` — Offline Queue Hardening**: Wired backoff retry intervals, reachability monitoring, and offline status banners to ensure smooth queue replay operations.

### 2.2 Design System Foundations & Welcome (Phase 4.0 & 4.3.1)
* **`58302ca` — Design System Tokens**: Refactored `tailwind.config.js` to map Tailwind CSS variables directly to the unified runtime color tokens in `src/utils/theme.ts`.
* **`0f5e639` — Motion Tokens**: Introduced standard easing curves and transition speed parameters (`fast: 150ms`, `base: 250ms`, `slow: 400ms`).
* **`28a4307` — Unified Icons**: Migrated the entire iconography system to `lucide-react-native` to prevent mix-and-match stroke variations.
* **`bf13490` — StatusBadge Component**: Built filled, contrast-compliant badge pills for Paid, Partial, Pending, and Overdue states.
* **`7f271ea` — Button Component**: Created primary, secondary, destructive, and ghost buttons with integrated platform shadows and touch feedback.
* **`3049f19` — Skeleton Component**: Implemented shimmer loading skeletons reflecting real card layouts.
* **`07ddd84` — SpeedDialFAB**: Implemented the expandable floating action button for quick entries.
* **`4.3.1a-c` — Welcome Screen**: Completed functional audit, component extraction, and visual redesign of `app/index.tsx`.

### 2.3 Documentation Upgrades
* **`46b6d52` — TRD.md**: Upgraded the technical specification document covering database constraints, API signatures, State Management contracts, and offline queue details.
* **`6e1eaf4` — AppFlow.md**: Created the user journey mapping document featuring flow indexes, route guards, and error paths.
* **`87acd34` — DESIGN.md**: Relocated the design specifications to the root level and addressed design gaps (Platform Shadows, Z-Indices, Snap Points, Empty States, Tab Bar styling, OTP/Auth Screens specs).

---

## 3. Customer Detail Redesign Spec (`app/(main)/people/[customerId].tsx`)

The Customer Detail screen acts as the customer ledger (khata), rendering transaction timelines, balances, and quick actions.

### 3.1 Visual Components & Layout
```
+--------------------------------------------------------+
|  [<-]  (Avatar initials)  Customer Name                | <-- DetailHeader (Call, WhatsApp, ⋮)
|                           Outstanding Balance Due      |
+--------------------------------------------------------+
|                                                        |
|                 OUTSTANDING BALANCE                    | <-- CustomerBalanceHero
|                      ₹12,555.00                        |
|                                                        |
|     [Overdue Badge]   [Last Billing Date]              |
+--------------------------------------------------------+
|    [ Collect Payment ]       [ + New Entry ]           | <-- CustomerActionStrip
+--------------------------------------------------------+
|   Filter: [All]  [Entries]  [Payments]                 | <-- CustomerTransactionTimeline
|                                                        |
|   Today                                                |
|   - Entry #1254 ........................... ₹10,000.00 |
|   - Cash Payment ..........................  ₹2,000.00 |
|                                                        |
+--------------------------------------------------------+
|                                                        |
|                 [ Collect Payment ]                    | <-- CustomerStickyCollectBar (Scroll-triggered)
|                                                        |
+--------------------------------------------------------+
```

* **DetailHeader**: Displays back controls, customer avatar with deterministic name initials (resolved using name hash), and action icons (Call, WhatsApp, ⋮ Overflow Menu).
  - *Overflow Items*: Share Ledger, PDF Statement, Edit Customer, and Delete Customer.
  - *A11y*: Share and PDF are kept in the overflow menu to reduce header density. Call and WhatsApp are hidden if the balance state is settled or advance.
* **CustomerBalanceHero**: A card that renders the net balance and oldest overdue days using status-specific background gradients (Red for overdue, Amber for pending, Blue for advance, and Green for settled).
* **CustomerActionStrip**: Two equal-width action buttons sitting in the primary thumb zone:
  - *Collect Payment*: Opens `RecordCustomerPaymentModal`. Disabled if balance is zero or in advance.
  - *New Entry*: Navigates to `app/(main)/entries/create.tsx` with customer params pre-populated.
* **CustomerTransactionTimeline**: Renders chronological lists of transactions grouped by day, utilizing a highly optimized Shopify `FlashList` for 60fps scrolling. Uses tabular numbers (`"tnum"`) for amount columns to ensure digit alignment.
* **CustomerStickyCollectBar**: A scroll-triggered bottom bar. It stays hidden at the top and animates in when the user scrolls past the hero card (~220px).
  - *A11y Fix*: Respects device bottom safe area boundaries using `useSafeAreaInsets` to ensure the button is not clipped by Android's navigation pills: `paddingBottom: Math.max(insets.bottom, 12)`.

### 3.2 Key Logic & Hook Boundaries (`usePersonDetail.ts`)
* Uses `usePersonDetail` to query customer information, transactions list, and financial summaries.
* **Reconciliation Banner**: Displays an alert at the top if a database mismatch is detected between `customer_balance` and the sum of unpaid invoices.
* **Access Tokens**: Generates public share tokens via the `upsert_access_token` RPC, allowing ledger sharing using `Share.share` with i18n-supported templates.

---

## 4. Entry Detail Redesign Spec (`app/(main)/entries/[orderId].tsx`)

The Entry Detail screen displays the invoice details of a single entry, itemized rows, and recorded payments.

### 4.1 Visual Components & Layout
```
+--------------------------------------------------------+
|  [<-]  Entry #1254                                 ⋮   | <-- DetailHeader
|        13 Jun 2026, 07:00 PM                           |
+--------------------------------------------------------+
|  (Avatar) Customer Name ............ [Call] [WhatsApp] | <-- EntryCustomerCard
+--------------------------------------------------------+
|                 BALANCE DUE                            | <-- EntryHeroCard
|                  ₹8,000.00                             |
|  [Pending Badge]                      Due in 7 days    |
+--------------------------------------------------------+
|  PAYMENTS  (Paid ₹2,000 of ₹10,000)                    | <-- EntryPaymentsSection
|  ==================[============]                      | <-- Progress indicator bar
|  - Cash Payment ........................... ₹2,000.00  |
+--------------------------------------------------------+
|  [Package Icon]  3 item(s)  ............... ₹10,000.00 | <-- EntryItemsSection (Collapsible)
+--------------------------------------------------------+
|         [ Remind ]          [ Record Payment ]         | <-- EntryStickyBar
+--------------------------------------------------------+
```

* **DetailHeader**: Contains back navigation, title, date subtitle, and a ⋮ overflow icon.
  - *Overflow Items*: Edit Entry, Share Invoice, View Customer, Print (shows Toast hint), Mark as Paid (hidden if fully paid), and Delete Entry.
* **EntryCustomerCard**: Renders the customer identity card. Clicking it navigates to the Customer Detail page. Shows Call and WhatsApp actions. If the customer is deleted in the database, it renders `"[Deleted Customer]"` and disables navigation.
* **EntryHeroCard**: Renders the outstanding balance due of the invoice inside a status-styled horizontal linear gradient (Green for paid, Red for overdue, Amber for pending, and Blue for partial).
  - Renders a slow-breathing circular background blob (4-second loop) to represent payment progress.
* **EntryPaymentsSection**: Renders the transaction's payment history. Displays an animated payment progress bar:
  - Background track: `t.colors.borderDefault`.
  - Foreground fill: `t.colors.primary` (animates width using a snappy spring ease).
  - If no payments have been made, it renders a clean empty state card with a Wallet icon.
* **EntryItemsSection**: Renders the itemized invoice list. It remains collapsed by default to save screen space, displaying the pre-tax items subtotal. Tapping the chevron expands the list to show item rows, GST calculations, loading charges, previous balances, and the grand total.
* **EntryStickyBar**: Positioned absolutely at the bottom with an elevation/shadow.
  - *Pending / Partial state*: Shows a primary `Record Payment` button and a secondary outline `Remind` button.
  - *Paid state*: Shows a full-width `Share Receipt` button.

### 4.2 Key Logic & Hook Boundaries (`useEntryDetail.ts`)
* Integrates `useOrderDetail` and `usePayments` hooks.
* **Payment Success Animation**: On a successful payment record, it displays a fullscreen `PaymentSuccessAnimation` overlay with a circular checkmark bounce and system haptic feedback, auto-dismissing after 2.3 seconds.
* **Remind Sheet**: Tapping Remind triggers `RemindCustomerSheet` to choose between WhatsApp and SMS notifications with prefilled billing text templates.

---

## 5. Verification & Quality Gate Checklist

To close out any work on these screens:
1. **Linter Check**: Execute `npm run lint` and confirm zero typescript/compilation errors.
2. **Safe Areas**: Test the screens on an Android emulator with gesture navigation enabled to verify bottom sheets and sticky bars do not overlap the OS navigation pill.
3. **Dark Mode**: Toggle dark mode in the settings page and inspect headers, heroes, and text contrast on both screens.
4. **Data Sync**: Simulate offline mode (toggle Wi-Fi), record a payment, verify the offline status banner displays correctly, and confirm the queue replays successfully upon reconnection.
