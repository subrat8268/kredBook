# Dashboard Screen — Design Spec

> **Status:** 🔄 In Audit / Redesign
> **Last updated:** 2026-06-23
> **Doc version:** 1.0
> **Phase:** 4 — UI/UX Redesign (as of STATUS.md)
> **Product Lead:** Design approved. Transitioning to implementation plan.

---

## 1. SCREEN PURPOSE

The Dashboard is the **home and command center** of KredBook. It provides the merchant with an immediate, high-trust overview of their business ledger health and guides them to take swift collection actions. It serves three core jobs:

1. **Financial Health at a Glance** — How much outstanding balance is due? Is it trending up or down vs. last week?
2. **Urgency & Action Prioritization** — Who has overdue payments? Who should I contact or follow up with right now?
3. **Daily Work Feed** — What are the most recent sales entries and payments recorded in my ledger?
4. **Quick Entry Points** — Speed Dial FAB to quickly add entries, create customers, or record bulk/scoped payments.

**Entry point:** App boot / redirection from login/onboarding once completed.

**Route:** `app/(main)/dashboard/index.tsx`
**Screen file:** [`DashboardScreen.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardScreen.tsx)
**Hooks:** [`useDashboard.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useDashboard.ts)

---

## 2. USER MENTAL MODEL

The Dashboard is structured top-to-bottom to answer the merchant's most pressing questions:

1. **WHO AM I & IS THERE NEWS?** → Header showing business initials avatar, greeting, business name, and notification bell (with overdue items count).
2. **WHAT IS MY NET EXPOSURE?** → DashboardHeroCard showing the total outstanding receivables, weekly delta, and quick actions (Record Payment + Send Reminder).
3. **HOW ARE MY GENERAL METRICS?** → Quick Stats showing total Customer count, Overdue customers list trigger, and This Month's collections.
4. **WHO SHOUD I CHASE NOW?** → Top follow-up section listing a horizontal scroll of customers with the oldest overdue balances.
5. **WHAT WAS MY RECENT PROGRESS?** → Activity feed of the 5 most recent transaction logs.

---

## 3. PLATFORM & CANVAS SPEC

- **Platform:** Android & iOS (React Native / Expo SDK 52)
- **Target device:** `390×844pt` (Pixel 7 / iPhone 14 class)
- **Style:** Clean, minimal, trust-first. PhonePe / Razorpay / Khatabook aesthetic.
- **Font stack:** Inter (headings, body, captions, labels)
- **Canvas bg:** `t.colors.canvas` (`#fafaf7` light / `#0f1012` dark)
- **Icons:** Lucide React Native, `strokeWidth: 2`, `20px` or `24px` default
- **Cards:** `bg: t.colors.surface`, `border: 1px solid t.colors.borderDefault`, `borderRadius: 16px` (`rounded-2xl`), shadow mapped to standard tokens, `16px` horizontal screen margin (`mx-4`), `16px` gap between major blocks (`mb-4`).
- **Tab bar:** Displayed at the bottom of this screen (`spacing.tabBarHeight`).
- **Safe area:** Wrapped in `<SafeAreaView edges={["top"]}>`

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── DashboardHeader
  │     ├── Avatar (size: sm, colors.brand bg, business initials)
  │     ├── Business name & Greeting
  │     └── Bell Notification Button (with absolute circular Red Numbered Badge)
  ├── ScrollView (pull-to-refresh enabled)
  │     ├── DashboardHeroCard (LinearGradient, outstanding amount, week delta, Collect/Record Payment, Send Reminder)
  │     ├── DashboardQuickStats (Customers tile, Overdue tile, This Month tile)
  │     ├── DashboardFollowUpSection (Horizontal ScrollView of DashboardFollowUpCards)
  │     └── DashboardRecentActivity (List of DashboardRecentActivityRows with fade overlay)
  └── DashboardPaymentFlow (NewCustomerModal, CustomerPickerSheet, RecordCustomerPaymentModal)
```

---

## 5. STATUS DERIVATION

The overall dashboard status `dashboardState` (type: `'overdue' | 'pending' | 'settled' | 'advance'`) is computed based on active ledger variables:

```
netOutstanding      = total receivables (toReceive / customersOweMe)
overdueTotalCount   = number of customers with at least one overdue entry

dashboardState priority order:
  1. overdue  → netOutstanding > 0 AND overdueTotalCount > 0
  2. advance  → netOutstanding < 0
  3. settled  → netOutstanding === 0 AND overdueTotalCount === 0
  4. pending  → default (netOutstanding > 0 AND overdueTotalCount === 0)
```

---

## 6. COMPONENT SPECS

### 6.1 Header — DashboardHeader

**File:** [`DashboardHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardHeader.tsx)

*   **Left**: Uses the standard shared `Avatar` component:
    *   `<Avatar name={businessName} size="sm" color={colors.brand} />`
*   **Center**: Business name + dynamic greeting stacked vertically (`Good morning 👋`, `Good afternoon 👋`, `Good evening 👋`).
*   **Right**: Bell icon with a numbered badge positioned at `top: -2, right: -6`:
    *   *Visible*: Only when `overdueTotalCount > 0`.
    *   *Badge Styling*: Circular or capsule background `bg: t.colors.danger`, containing white, bold `10px` text of `overdueTotalCount`.
*   **Press action**: Tapping the Bell or Notification Badge navigates to `(main)/people` pre-filtered by `"Overdue"`.

---

### 6.2 Hero Card — DashboardHeroCard

**File:** [`DashboardHeroCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardHeroCard.tsx)

*   **Layout**: `LinearGradient` card, `mx-4 mt-section-md rounded-2xl px-5 py-5`.
*   **Background Gradient**: Left-to-right gradient driven by `dashboardState`:
    *   `overdue` -> Red (`#DC2626` → `#7F1D1D`)
    *   `pending` -> Amber (`#EF4444` → `#991B1B`)
    *   `settled` -> Green (`#22C55E` → `#047857`)
    *   `advance` -> Blue (`#2563EB` → `#1D4ED8`)
*   **Content**:
    *   Row 1: Label uppercase matching state (`"COLLECT OUTSTANDING"`, `"ADVANCE"`, or `"ALL SETTLED"`) · `fontSize: 11` · `fontWeight: 600` · `color: white` · `letterSpacing: 1.4`. Right-aligned pill `"Outstanding"` (translucent background).
    *   Row 2: Net outstanding amount formatted via `formatINR(displayOutstanding)` · `t.typography.heroAmount` · `color: white` · `pb-2`.
    *   Row 3: Weekly delta indicator (`ArrowUpRight` or `ArrowDownRight`) with trend text: `"Up/Down ₹X vs last week"`.
    *   Row 4: Action strip (dual buttons):
        *   **Left (Record Payment)**: White button, text `colors.successDark` or `colors.ink`. Press opens Customer Picker.
        *   **Right (Send Reminder)**: Translucent button with white outline, text `white`. Opens OS share sheet with template reminder.
*   **Haptic triggers**:
    *   Tapping `Record Payment`: Medium haptic impact.
    *   Tapping `Send Reminder`: Light haptic impact.

---

### 6.3 Quick Stats — DashboardQuickStats

**File:** [`DashboardQuickStats.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardQuickStats.tsx)

*   **Layout**: Row of 3 equal cards separated by `spacing.sm` (8px).
*   **Tiles**:
    1.  **Customers**: Value: `totalCustomersCount`. Icon: `Users`. Press navigates to People List (filter: "All").
    2.  **Overdue**: Value: `overdueTotalCount`. Icon: `Clock3`. Press navigates to People List (filter: "Overdue").
    3.  **This Month**: Value: `collectedThisMonth`. Icon: `Wallet`. Press navigates to Entries List.
*   **Styling**: Each tile is a `Pressable` with `bg: t.colors.surface`, standard card border `t.colors.borderDefault`, standard card shadow `shadow.card`.
*   **Haptics**: Calls `Haptics.selectionAsync()` on selection.

---

### 6.4 Follow-up Section — DashboardFollowUpSection

**File:** [`DashboardFollowUpSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardFollowUpSection.tsx)

*   **Layout**: Vertically aligned title row + Horizontal ScrollView of customer cards.
*   **Title Row**: Label `"Top follow-up"` with a small badge showing total overdue count, and a `"See all"` pressable (navigates to People List with "Overdue" filter).
*   **Horizontal List Insets**: Left padding `spacing.xs`, right padding `spacing.screenPadding + spacing.fabSize` (to ensure the last card is not hidden beneath the global SpeedDialFAB).

#### 6.4.1 Follow-up Card — DashboardFollowUpCard

*   **Layout**: Card container, width `200px`, `bg: t.colors.surface`, border `t.colors.borderDefault`, shadow `shadow.card`.
*   **Card Tap**: Tapping anywhere on the card body (avatar, name, balance) navigates directly to `(main)/people/[customerId]`.
*   **Collect CTA Button**: Green button (`bg: colors.success`). Opens payment modal for that customer.
*   **Haptic triggers**:
    *   Card Tap: Light haptic impact.
    *   Collect Button: Medium haptic impact.

---

### 6.5 Recent Activity Feed — DashboardRecentActivity

**File:** [`DashboardRecentActivity.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardRecentActivity.tsx)

*   **Layout**: Card container holding the 5 most recent activity rows.
*   **Action Row**: Header title `"Recent activity"` with a `"View entries"` button (navigates to Entries List).
*   **Fade Overlay**: Bottom `LinearGradient` overlay (`transparent` to `colors.surface`) to create a smooth exit.

#### 6.5.1 Activity Row — DashboardRecentActivityRow

*   **Layout**: Flex row, left circular icon `Receipt` (colored background), middle text block (customer name + action details), right amount block (colored amount + status badge).
*   **Interaction**: Tapping any row navigates directly to the specific Entry Detail screen:
    `router.push({ pathname: "/(main)/entries/[orderId]", params: { orderId: item.id } })`
*   **Haptic trigger**: Light haptic feedback on row tap.

---

### 6.6 Payment Flow Container — DashboardPaymentFlow

**File:** [`DashboardPaymentFlow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardPaymentFlow.tsx)

*   Contains the modals used dynamically on the Dashboard:
    1.  `NewCustomerModal` (for quick addition).
    2.  `CustomerPickerSheet` (when tapping "Record Payment" with no top overdue customer).
    3.  `RecordCustomerPaymentModal` (opens the keypad payment collector).

---

## 7. STATE MATRIX (Dashboard Hero Card States)

| State | OVERDUE 🔴 | PENDING 🟠 | SETTLED 🟢 | ADVANCE 🔵 |
|---|---|---|---|---|
| Trigger Condition | `receivables > 0` and `overdueCount > 0` | `receivables > 0` and `overdueCount === 0` | `receivables === 0` | `receivables < 0` |
| Hero Gradient | Red (`#DC2626`→`#7F1D1D`) | Amber (`#EF4444`→`#991B1B`) | Green (`#22C55E`→`#047857`) | Blue (`#2563EB`→`#1D4ED8`) |
| Hero Label | `COLLECT OUTSTANDING` | `COLLECT OUTSTANDING` | `ALL SETTLED` | `ADVANCE` |
| Hero Amount | `netOutstanding` | `netOutstanding` | `₹0.00` | `abs(netOutstanding)` |
| Badge Pill | `"Overdue" (with AlertCircle)` | `"Pending"` | `"Settled"` | `"Advance"` |
| Left Button | `"Record Payment"` | `"Record Payment"` | `"Record Payment"` | `"Record Payment"` |
| Right Button | `"Send Reminder"` | `"Send Reminder"` | `"Send Reminder" (disabled)` | `"Send Reminder" (disabled)` |

---

## 8. NAVIGATION CONTRACT

### Navigates TO (Exits from Dashboard)

| Destination Screen | Trigger | Params Passed |
|---|---|---|
| Entry Detail (`entries/[orderId].tsx`) | Tap Recent Activity row | `orderId` |
| Customer Detail (`people/[customerId].tsx`) | Tap Overdue Follow-up Card | `customerId` |
| People List (`people/index.tsx`) | Tap Quick Stats (Customers or Overdue) or Bell Icon | `filter: "All" \| "Overdue"` |
| Entries List (`entries/index.tsx`) | Tap Quick Stats (This Month) or View Entries header | - |
| Create Customer (`people/create.tsx`) | SpeedDialFAB -> New Customer | `action: "add"` |
| Create Entry (`entries/create.tsx`) | SpeedDialFAB -> New Entry | - |
| Record Payment Modal | SpeedDialFAB / Hero Record Payment / Follow-up card Collect | (Opens inline Bottom Sheet) |

---

## 9. DESIGN DECISION LOG

| Component | Old Behavior | New Specification | Reason |
|---|---|---|---|
| Hero Card Gradient | Static brand green gradient | Dynamic gradient based on outstanding balance and aging | Urgency-first feedback. Prompts merchant to focus on collection. |
| Header Avatar | Hardcoded inline circle with brand green background | Reusable `Avatar` component with green color override | Code duplication removal; unified shape and font styling. |
| Notification Badge | Plain red dot | Numbered badge containing overdue customer count | Numeric transparency. Allows merchant to instantly gauge urgent collection count. |
| Recent Activity Row Tap | Navigates to generic entries list | Navigates directly to `entries/[orderId]` | Streamlined workflow. Saves clicks to view specific transaction details. |
| Quick Stats Overdue Tap | Navigates to people list | Navigates to people list pre-filtered by "Overdue" | User expectation matching. Clicking "Overdue" should filter by overdue. |
| Follow-up Card Tap | Taps only on Collect button allowed | Entire card body navigates to Customer Detail | Ledger analysis visibility. Merchant can inspect the timeline before collecting. |
| Haptic Feedback | None | Haptics wired to buttons, lists, and modal toggles | Premium, tactile native feel. |
