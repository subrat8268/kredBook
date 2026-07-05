# Dashboard Screen — Design Spec

> **Status:** 🔄 Audited — Open items pending fix. See `docs/audits/dashboard-2026-07-04.md`.
> **Last updated:** 2026-07-04
> **Doc version:** 2.0
> **Phase:** 4 — UI/UX Redesign (4.1.1x complete, post fresh-eyes audit)
> **Product Lead:** All architecture questions resolved. Open items: see §16 Known Issues.

---

## 1. SCREEN PURPOSE

The Dashboard is the **home and command center** of KredBook. It provides the merchant with an immediate, high-trust overview of their business ledger health and guides them to take swift collection actions. It serves four core jobs:

1. **Financial Health at a Glance** — How much outstanding balance is due? Is it trending up or down vs. last week?
2. **Urgency & Action Prioritization** — Who has overdue payments? Who should I contact or follow up with right now?
3. **Daily Work Feed** — What are the most recent sales entries and payments recorded in my ledger?
4. **Quick Entry Points** — Speed Dial FAB to quickly add entries, create customers, or record payments.

**Entry point:** App boot / redirection from login/onboarding once completed.

**Route:** `app/(main)/dashboard/index.tsx`
**Screen file:** [`DashboardScreen.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardScreen.tsx)
**Hooks:** [`useDashboard.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useDashboard.ts), [`useDashboardPresentation.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/hooks/useDashboardPresentation.ts), [`useDashboardPaymentFlow.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/hooks/useDashboardPaymentFlow.ts)

---

## 2. USER MENTAL MODEL

The Dashboard is structured top-to-bottom to answer the merchant's most pressing questions:

1. **WHO AM I & IS THERE NEWS?** → Header showing business initials avatar, greeting, business name, and notification bell (with overdue items count).
2. **WHAT IS MY NET EXPOSURE?** → DashboardHeroCard showing the total outstanding receivables, weekly delta, and quick actions (Record Payment + Send Reminder).
3. **HOW ARE MY GENERAL METRICS?** → Quick Stats showing total Customer count, Overdue customers list trigger, and This Month's collections.
4. **WHO SHOULD I CHASE NOW?** → Follow-up section listing a horizontal scroll of customers with the oldest overdue balances.
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

### Design Token Reference

> All colours resolved at runtime via `useTheme()` → `t.colors.*`.
> **Never hardcode hex values in components.** Source of truth: [`theme.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts)

#### Core Colour Tokens (Light / Dark)

| Semantic Token | `t.colors.*` key | Light Value | Dark Value |
|---|---|---|---|
| Canvas / Screen bg | `canvas` | `#fafaf7` | `#0f1012` |
| Card surface | `surface` | `#ffffff` | `#18191c` |
| Raised surface | `surfaceRaised` | `#f4f4f0` | `#222427` |
| Muted surface | `surfaceMuted` | `#eeede8` | `#2a2d31` |
| Default border | `borderDefault` | `#e5e7eb` | `#2a2d31` |
| Subtle divider | `borderSubtle` | `#f3f4f6` | `#1f2023` |
| Text primary | `ink` | `#111827` | `#f3f4f6` |
| Text body | `body` | `#374151` | `#d1d5db` |
| Text secondary | `muted` | `#6b7280` | `#9ca3af` |
| Text faint | `faint` | `#9ca3af` | `#6b7280` |
| Brand / success | `primary` | `#16a34a` | `#4ade80` |
| Brand dark | `primaryActive` | `#166534` | `#166534` |
| Danger / overdue | `danger` | `#dc2626` | `#f87171` |
| Warning | `pending` | `#d97706` | `#fbbf24` |
| Info / advance | `advance` | `#3b82f6` | `#60a5fa` |

#### Dashboard Gradient Tokens (by `dashboardState`)

| State | Gradient key | Start | End |
|---|---|---|---|
| `overdue` | `dashboard.overdue` | `#DC2626` | `#7F1D1D` |
| `pending` | `dashboard.pending` | `#EF4444` | `#991B1B` |
| `settled` | `dashboard.settled` | `#22C55E` | `#047857` |
| `advance` | `dashboard.advance` | `#2563EB` | `#1D4ED8` |

> ⚠️ **Never use raw hex values for these gradients in components.** Reference `t.gradients.dashboard.*` from `theme.ts`.

#### Dashboard Semantic Tokens

| Purpose | Token | Notes |
|---|---|---|
| Hero text / amount | `dashboard.heroText` | `rgba(255,255,255,0.96)` — use instead of hardcoded `#ffffff` |
| Hero pill background | `dashboard.heroPill` | `rgba(255,255,255,0.20)` |
| Hero pill indicator dot | `dashboard.heroIndicatorDot` | `rgba(255,255,255,0.9)` |
| Chip background (follow-up) | `warningBg` | Amber wash for overdue chip |
| Shadow base | `ink` or dedicated shadow token | **Not** raw `#000` |

#### Typography Tokens

| Token | Font | Style |
|---|---|---|
| `t.fontFamily.display` | Inter Bold 700 | Headings, card titles |
| `t.fontFamily.bodySemiBold` | Inter SemiBold 600 | Labels, stat values |
| `t.fontFamily.body` | Inter Regular 400 | Body text, captions |
| `t.fontFamily.bodyMedium` | Inter Medium 500 | Secondary labels |
| `t.typography.heroAmount` | Inter ExtraBold 800 | Hero outstanding amount |

#### Spacing Tokens

| Token | Value |
|---|---|
| `spacing.screenPadding` | 16px |
| `spacing.md` | 12–16px |
| `spacing.xs` | 4–8px |
| `spacing.tabBarHeight` | Used for bottom content inset |
| `spacing.fabSize` | Used for right-inset of follow-up scroll |

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── DashboardHeader
  │     ├── Avatar (size: sm, colors.brand bg, business initials)
  │     ├── Business name & Greeting (Good morning/afternoon/evening 👋)
  │     └── Bell Notification Button (absolute red circular badge, count)
  ├── ScrollView (pull-to-refresh enabled)
  │     ├── DashboardHeroCard (LinearGradient, outstanding, week delta, Record Payment, Send Reminder)
  │     ├── DashboardQuickStats (Customers tile · Overdue tile · This Month tile)
  │     ├── DashboardFollowUpSection
  │     │     └── Horizontal ScrollView of DashboardFollowUpCards
  │     └── DashboardRecentActivity
  │           └── List of DashboardRecentActivityRows (fade overlay at bottom)
  └── DashboardPaymentFlow (NewCustomerModal, CustomerPickerSheet, RecordCustomerPaymentModal)
```

> **SpeedDialFAB** is rendered at the tab layout level (`app/(main)/_layout.tsx`), not inside DashboardScreen. Dashboard must reserve right-edge padding for it in the follow-up horizontal list.

---

## 5. STATUS DERIVATION

The overall dashboard status `dashboardState` (type: `'overdue' | 'pending' | 'settled' | 'advance'`) is computed based on active ledger variables in `useDashboardPresentation`:

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

| Element | Spec |
|---|---|
| Background | `t.colors.surface` |
| Bottom border | `1px t.colors.borderSubtle` |
| Padding | `paddingHorizontal: 16`, `paddingVertical: 12` |
| Left | `Avatar` component · `size="sm"` · `color: t.colors.brand` · business initials |
| Center | Business name · `t.fontFamily.bodySemiBold` · `t.colors.ink` · stacked greeting `t.colors.muted` |
| Right | `Bell` icon with red circular badge `bg: t.colors.danger` |
| Badge | Visible only when `overdueTotalCount > 0` · `10px` white bold text · position `top: -2, right: -6` · capped display at `9+` |
| Bell press | Navigates to `(main)/people` with `filter: "Overdue"` |

> **Open Issue (C3):** `onPressNotifications` currently doubles as `onOpenPeopleOverdue`. These must be split into separate props. The bell should navigate to People+Overdue; the Overdue stat tile should have its own handler.

---

### 6.2 Hero Card — DashboardHeroCard

**File:** [`DashboardHeroCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardHeroCard.tsx)

| Element | Spec |
|---|---|
| Container | `LinearGradient` · `mx-4 mt-section-md rounded-2xl px-5 py-5` |
| Gradient direction | `start: {x:0, y:0}` → `end: {x:1, y:0}` (horizontal) |
| Gradient colours | See §3 gradient token table — keyed from `dashboardState` |
| Animated blob | `160×160px` circle · `top: -10, right: -58` · `rgba(255,255,255,0.15)` · slow pulse via Reanimated |
| Row 1 — Label | State label uppercase (`"COLLECT OUTSTANDING"` / `"ALL SETTLED"` / `"ADVANCE"`) · `fontSize: 11` · `fontWeight: 600` · `color: t.dashboard.heroText` · `letterSpacing: 1.4` |
| Pending pill | Right-aligned · `"Outstanding"` / `"Settled"` / `"Advance"` · `bg: t.dashboard.heroPill` · `rounded-full` |
| Row 2 — Amount | `formatINR(displayOutstanding)` · `t.typography.heroAmount` · `color: t.dashboard.heroText` |
| Row 3 — Delta | `ArrowUpRight` or `ArrowDownRight` · `"Up/Down ₹X vs last week"` · zero case: `Minus` icon + `"No change vs last week"` |
| Row 4 — Buttons | Left: Record Payment (white, text `colors.successDark`) · Right: Send Reminder (translucent, white outline) |
| Record Payment | Press: Medium haptic · Opens Customer Picker (or directly opens payment modal for top overdue customer) |
| Send Reminder | Press: Light haptic · Opens OS share sheet with WhatsApp-first template |

> ⚠️ **Bug (C2):** Hero amount currently hardcodes `"#ffffff"` — must be replaced with `t.colors.dashboard.heroText`.
> ⚠️ **Bug (M2):** `dashboardState` IIFE not memoized — wrap in `useMemo([totalOutstanding, overdueTotalCount])`.

---

### 6.3 Quick Stats — DashboardQuickStats

**File:** [`DashboardQuickStats.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardQuickStats.tsx)

| Element | Spec |
|---|---|
| Layout | Row of 3 equal tiles · `spacing.sm` gap between tiles |
| Tile container | `Pressable` · `bg: t.colors.surface` · `border: 1px t.colors.borderDefault` · standard card shadow |
| Haptics | `Haptics.selectionAsync()` on tile press |

**Tiles:**

| Tile | Value | Icon | Press Action |
|---|---|---|---|
| Customers | `totalCustomersCount` | `Users` | Navigate to People List (`filter: "All"`) |
| Overdue | `overdueTotalCount` | `Clock3` | Navigate to People List (`filter: "Overdue"`) |
| This Month | `collectedThisMonth` (formatted `formatINR`) | `Wallet` | Navigate to Entries List |

> ⚠️ **Bug (M5):** `quickStats` array and `safeCollectedThisMonth` recompute on every render — wrap in `useMemo`.

---

### 6.4 Follow-up Section — DashboardFollowUpSection

**File:** [`DashboardFollowUpSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardFollowUpSection.tsx)

| Element | Spec |
|---|---|
| Title row | `"Top follow-up"` label · small overdue count badge · `"See all"` Pressable → People List (`filter: "Overdue"`) |
| Overdue count badge | Hidden (replaced by `"--"`) when section is in error state |
| Horizontal list left inset | `spacing.xs` |
| Horizontal list right inset | `spacing.screenPadding + spacing.fabSize` (prevents last card hiding behind SpeedDialFAB) |
| `keyboardShouldPersistTaps` | `"handled"` — required on horizontal ScrollView |

**States:**

| State | UI |
|---|---|
| Loading | Shimmer skeletons |
| Empty | Empty state illustration + `"No overdue customers"` label |
| Error | Error message · count badge shows `"--"` |
| Populated | Horizontal ScrollView of `DashboardFollowUpCard` |

> ⚠️ **Bug (M3):** `keyboardShouldPersistTaps="handled"` missing from horizontal ScrollView.
> ⚠️ **Bug (m3):** `isFetching` prop is accepted but unused — remove from Props.
> ⚠️ **Bug (M7):** Overdue count badge renders raw number even during error state — should show `"--"` on error.

#### 6.4.1 Follow-up Card — DashboardFollowUpCard

**File:** [`DashboardFollowUpCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardFollowUpCard.tsx)

| Element | Spec |
|---|---|
| Container | `Pressable` · `width: 200` · `bg: t.colors.surface` · `border: 1px t.colors.borderDefault` · standard card shadow |
| Card tap | Light haptic · navigates to `(main)/people/[customerId]` |
| Avatar | Business initials circle · `bg: t.colors.primaryBorderFill` |
| Customer name | `t.fontFamily.bodySemiBold` · `t.colors.ink` · `numberOfLines: 1` |
| Balance | `formatINR(balance)` · `t.colors.overdue` or `t.colors.ink` based on state |
| Days-since chip | Amber chip (`bg: t.colors.warningBg`) · `"X days"` |
| Collect button | `bg: t.colors.success` · white text · Medium haptic · opens payment modal for customer |

> 🔴 **Critical Bug (C5):** Outer `Pressable` (card nav) wraps inner `Pressable` (Collect button). On Android TalkBack the Collect button is unreachable. **Fix:** Restructure so Collect is a sibling of the card Pressable, not a child.
> ⚠️ **Bug (m6):** `chipStyles` IIFE not memoized — wrap in `useMemo([daysSince, colors])`.

---

### 6.5 Recent Activity Feed — DashboardRecentActivity

**File:** [`DashboardRecentActivity.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardRecentActivity.tsx)

| Element | Spec |
|---|---|
| Container | Card `mx-4` · `bg: t.colors.surface` · `border: 1px t.colors.borderDefault` |
| Header row | `"Recent activity"` title · `"View entries"` link → Entries List |
| Fade overlay | Bottom `LinearGradient` · `["transparent", t.colors.surface]` (both colours from token) |
| Shadow | `shadowColor: t.colors.ink` — **not** raw `"#000"` |
| Row count | Shows last 5 activity items maximum |

> ⚠️ **Bug (C1):** Gradient end colour uses `colors.surface` but the card NativeWind class is `dark:bg-surface-dark`. Verify `surface-dark` Tailwind token equals `darkColors.surface`; or switch to `["transparent", colors.surface]` to always match runtime surface.
> ⚠️ **Bug (M6):** `shadowColor: "#000"` is a raw hex — replace with `colors.ink`.
> ⚠️ **Bug (m4):** `isLoading` prop is accepted but always `false` (parent shows `DashboardSkeleton` instead). Remove prop or wire a query-level loading state.

#### 6.5.1 Activity Row — DashboardRecentActivityRow

**File:** [`DashboardRecentActivityRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardRecentActivityRow.tsx)

| Element | Spec |
|---|---|
| Layout | Flex row: left icon circle · middle text block · right amount + status badge |
| Left icon | `Receipt` 20px · coloured circle background by activity type |
| Middle primary | Customer name (fallback: `"Bill"` or `"Payment"` based on `item.type` if name absent) |
| Middle secondary | Action detail (`"Entry recorded"`, `"Payment received"`, etc.) |
| Right amount | `formatINR(amount)` · coloured by entry/payment type |
| Right badge | `StatusBadge` component |
| Row tap | Light haptic · `router.push("/(main)/entries/[orderId]", { orderId: item.id })` |

---

### 6.6 Loading Skeleton — DashboardSkeleton

**File:** [`DashboardSkeleton.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardSkeleton.tsx)

| Element | Spec |
|---|---|
| Header border | `1px t.colors.borderSubtle` — **not** hardcoded `#f3f4f6` (invisible in dark mode) |
| Card horizontal padding | `spacing.screenPadding` (from token, not hardcoded `16`) |
| Card vertical padding | `spacing.md` (from token, not hardcoded `12`) |
| Hero card skeleton | Matches `DashboardHeroCard` dimensions |
| Follow-up card width | `200` — must match real `DashboardFollowUpCard` width (not `260`) |
| Shimmer | Uses shared `Skeleton` / shimmer animation from `src/components/ui/Skeleton.tsx` |

> 🔴 **Bug (C4):** Header border hardcoded `#f3f4f6` (light-only) — invisible in dark mode. Replace with `colors.borderSubtle`.
> ⚠️ **Bug (m8):** Follow-up skeleton card width is `260` but real card is `200` — causes layout shift on load.
> ⚠️ **Bug (m9):** Padding hardcoded as `16` / `12` — replace with `spacing.screenPadding` / `spacing.md`.

---

### 6.7 Payment Flow Container — DashboardPaymentFlow

**File:** [`DashboardPaymentFlow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardPaymentFlow.tsx)

Renders the three modals used by the Dashboard payment entry flow:

| Modal | Trigger | Purpose |
|---|---|---|
| `NewCustomerModal` | SpeedDialFAB → New Customer | Quick-add a new customer |
| `CustomerPickerSheet` | Hero "Record Payment" (no top overdue customer) | Let user pick customer before payment |
| `RecordCustomerPaymentModal` | Customer selected or Follow-up Collect pressed | Payment keypad collector |

---

## 7. MODAL SPECS

### 7.1 CustomerPickerSheet

**File:** [`CustomerPickerSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/CustomerPickerSheet.tsx)
**Mechanism:** `BaseBottomSheet` · `snapPoints={["70%"]}` · search-enabled list

- Renders all customers sorted by: overdue first, then by name.
- Shows customer balance and status badge per row.
- Recent customers section at top (from `recentCustomers` cache in `AsyncStorage`).
- Selecting a customer opens `RecordCustomerPaymentModal`.
- Footer reserves explicit space + Android bottom inset to avoid list clipping behind gesture nav.

---

### 7.2 RecordCustomerPaymentModal

**File:** [`RecordCustomerPaymentModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/RecordCustomerPaymentModal.tsx)
**Triggered by:** Hero "Record Payment" (after customer selection), Follow-up card Collect button, SpeedDialFAB.

Props passed from `DashboardPaymentFlow`:
- `customerId`, `customerName` — for display
- `pendingOrderId` — for payment API call
- `pendingOrderBalance` — for pre-fill

On success: calls `onPaymentSuccess(amountPaid)` → triggers data refresh + optional `PaymentSuccessAnimation`.

---

### 7.3 NewCustomerModal

**File:** [`NewCustomerModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/NewCustomerModal.tsx)
**Triggered by:** SpeedDialFAB → New Customer.
On success: calls `onCustomerAdded()` → invalidates customer query keys.

---

## 8. DATA LAYER

**Primary data hook:** [`useDashboard.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useDashboard.ts)
**Presentation layer:** [`useDashboardPresentation.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/hooks/useDashboardPresentation.ts)
**Payment flow:** [`useDashboardPaymentFlow.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/hooks/useDashboardPaymentFlow.ts)

| Data | Source / RPC | Query Key | Notes |
|---|---|---|---|
| Dashboard summary | `get_dashboard_summary` (Supabase RPC) | `["dashboard", profileId]` | Single-query: outstanding, overdue count, week delta, collections |
| Follow-up customers | `fetchOverdueCustomers` | `["dashboard", "overdue", profileId]` | Top N ordered by balance desc |
| Recent activity | `fetchRecentActivity` | `["dashboard", "activity", profileId]` | Last 5 entries + payments |
| Profile / business name | `useAuthStore()` | Zustand (MMKV-persisted) | Needed for greeting and avatar |

**Offline behaviour:** React Query with MMKV persistence. Dashboard data shows stale cache while refetching. Mutations queue when offline via `syncQueue.ts`. Do not remove queue behaviour.

**Pull-to-refresh:** `RefreshControl` on the main `ScrollView` — calls `refetch()` on all three query keys.

**Query invalidation on payment success:**
- `["dashboard"]`
- `["customers"]`
- `orderKeys.all`

---

## 9. NAVIGATION CONTRACT

### Navigates FROM (entry points into Dashboard)

| Source | Trigger |
|---|---|
| App boot / `app/_layout.tsx` | Auth + profile check passes, no redirect needed |
| Login / Onboarding | Successful auth → `router.replace("/(main)/dashboard")` |
| Bottom Tab Bar | "Home" / Dashboard tab tap |

### Navigates TO (exits from Dashboard)

| Destination Screen | Trigger | Params Passed |
|---|---|---|
| Entry Detail (`entries/[orderId].tsx`) | Tap Recent Activity row | `orderId` |
| Customer Detail (`people/[customerId].tsx`) | Tap Overdue Follow-up Card | `customerId` |
| People List (`people/index.tsx`) | Bell icon · Quick Stats Overdue tile | `filter: "Overdue"` |
| People List (`people/index.tsx`) | Quick Stats Customers tile | `filter: "All"` |
| Entries List (`entries/index.tsx`) | Quick Stats This Month tile · View Entries header link | — |
| Create Customer (`people/create.tsx`) | SpeedDialFAB → New Customer | — |
| Create Entry (`entries/create.tsx`) | SpeedDialFAB → New Entry | — |
| Record Payment Modal | SpeedDialFAB → Record Payment · Hero button · Follow-up Collect | Opens inline (no navigation) |

---

## 10. ANIMATION SPEC

### Hero Card Pulse (Reanimated)

```ts
// Active during 'overdue' and 'pending' states
useFocusEffect(() => {
  pulseAnim.value = withRepeat(
    withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
    -1,   // infinite
    true  // reverse
  );
  return () => cancelAnimation(pulseAnim);
});
```

> `pulseAnim` drives opacity and/or scale on the pending pill badge.
> ⚠️ The pulse hook pattern is duplicated in `DashboardFollowUpCard`. Extract to a shared `usePulseAnimation(active: boolean)` hook (suggestion s1).

### Follow-up Card Chip Animation

Chip background shifts from amber (`warningBg`) to danger (`overdueSurface`) based on `daysSince > 14` threshold. Computed via `chipStyles` IIFE (see m6).

---

## 11. STATE MATRIX

### Hero Card States

| | OVERDUE 🔴 | PENDING 🟠 | SETTLED 🟢 | ADVANCE 🔵 |
|---|---|---|---|---|
| Trigger | `receivables > 0` and `overdueCount > 0` | `receivables > 0` and `overdueCount === 0` | `receivables === 0` and `overdueCount === 0` | `receivables < 0` |
| Gradient | `dashboard.overdue` | `dashboard.pending` | `dashboard.settled` | `dashboard.advance` |
| Label | `COLLECT OUTSTANDING` | `COLLECT OUTSTANDING` | `ALL SETTLED` | `ADVANCE` |
| Amount | `netOutstanding` | `netOutstanding` | `₹0.00` | `abs(netOutstanding)` |
| Badge Pill | `"Overdue"` + `AlertCircle` icon | `"Pending"` | `"Settled"` | `"Advance"` |
| Delta icon | `ArrowUpRight` (bad) or `ArrowDownRight` (good) | Same | `Minus` (zero) | `ArrowDownRight` |
| Record Payment | Enabled | Enabled | Enabled | Enabled |
| Send Reminder | Enabled | Enabled | Disabled (no one to remind) | Disabled |
| Pulse animation | Active | Active | Inactive | Inactive |

### Follow-up Section States

| State | UI |
|---|---|
| Loading | Horizontal shimmer skeletons |
| Empty (no overdue customers) | Empty state illustration + `"All caught up!"` copy |
| Error | `"Couldn't load"` message · count badge shows `"--"` |
| Populated | Horizontal `ScrollView` of `DashboardFollowUpCard` components |

### Recent Activity States

| State | UI |
|---|---|
| Loading | Handled by `DashboardSkeleton` at parent level (component never receives `isLoading=true`) |
| Empty | `"No recent activity"` copy + icon |
| Error | `"Couldn't load recent activity"` with retry link |
| Populated | Up to 5 `DashboardRecentActivityRow` items |

---

## 12. COMPONENT FILE MAP

| Component | Purpose | File |
|---|---|---|
| Dashboard Route | Thin Expo Router wrapper | [`app/(main)/dashboard/index.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/dashboard/index.tsx) |
| DashboardScreen | Orchestrator — assembles all sub-components | [`src/features/dashboard/components/DashboardScreen.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardScreen.tsx) |
| DashboardHeader | Top header bar — avatar, greeting, bell | [`src/features/dashboard/components/DashboardHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardHeader.tsx) |
| DashboardHeroCard | Gradient hero — outstanding amount, delta, actions | [`src/features/dashboard/components/DashboardHeroCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardHeroCard.tsx) |
| DashboardQuickStats | 3-tile stats row | [`src/features/dashboard/components/DashboardQuickStats.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardQuickStats.tsx) |
| DashboardFollowUpSection | Follow-up list container + states | [`src/features/dashboard/components/DashboardFollowUpSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardFollowUpSection.tsx) |
| DashboardFollowUpCard | Per-customer overdue follow-up card | [`src/features/dashboard/components/DashboardFollowUpCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardFollowUpCard.tsx) |
| DashboardRecentActivity | Activity feed container | [`src/features/dashboard/components/DashboardRecentActivity.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardRecentActivity.tsx) |
| DashboardRecentActivityRow | Single activity row | [`src/features/dashboard/components/DashboardRecentActivityRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardRecentActivityRow.tsx) |
| DashboardSkeleton | Full-screen loading skeleton | [`src/features/dashboard/components/DashboardSkeleton.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardSkeleton.tsx) |
| DashboardPaymentFlow | Modal orchestrator | [`src/features/dashboard/components/DashboardPaymentFlow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/components/DashboardPaymentFlow.tsx) |
| useDashboard | React Query data + computed values | [`src/hooks/useDashboard.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useDashboard.ts) |
| useDashboardPresentation | Animation state, derived metrics | [`src/features/dashboard/hooks/useDashboardPresentation.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/hooks/useDashboardPresentation.ts) |
| useDashboardPaymentFlow | Modal open/close, picker state | [`src/features/dashboard/hooks/useDashboardPaymentFlow.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/features/dashboard/hooks/useDashboardPaymentFlow.ts) |
| CustomerPickerSheet | Bottom sheet customer selector | [`src/components/people/CustomerPickerSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/CustomerPickerSheet.tsx) |
| RecordCustomerPaymentModal | Payment keypad + confirmation | [`src/components/people/RecordCustomerPaymentModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/RecordCustomerPaymentModal.tsx) |
| NewCustomerModal | Quick-add customer bottom sheet | [`src/components/people/NewCustomerModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/NewCustomerModal.tsx) |
| SpeedDialFAB | Expandable FAB (tab layout level) | [`src/components/ui/SpeedDialFAB.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/ui/SpeedDialFAB.tsx) |
| Avatar | Business initials circle | `src/components/ui/Avatar.tsx` |
| StatusBadge | Coloured status pill | `src/components/ui/StatusBadge.tsx` |
| Skeleton | Shimmer base component | `src/components/ui/Skeleton.tsx` |
| theme.ts | All design tokens | [`src/utils/theme.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts) |

---

## 13. FEATURE BARREL (Dashboard)

```
src/features/dashboard/
  ├── components/
  │     DashboardScreen.tsx
  │     DashboardHeader.tsx
  │     DashboardHeroCard.tsx
  │     DashboardQuickStats.tsx
  │     DashboardFollowUpSection.tsx
  │     DashboardFollowUpCard.tsx
  │     DashboardRecentActivity.tsx
  │     DashboardRecentActivityRow.tsx
  │     DashboardSkeleton.tsx
  │     DashboardPaymentFlow.tsx
  ├── hooks/
  │     useDashboardPresentation.ts
  │     useDashboardPaymentFlow.ts
  └── types/
        dashboard.types.ts
```

---

## 14. KNOWN OPEN ISSUES (as of 2026-07-04)

Tracked in full in [`docs/audits/dashboard-2026-07-04.md`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/audits/dashboard-2026-07-04.md).

| Ref | Severity | Component | Issue | Fix |
|---|---|---|---|---|
| C5 | 🔴 Critical | `DashboardFollowUpCard` | Nested `Pressable` breaks TalkBack on Android — Collect button unreachable | Restructure: Collect must be sibling, not child |
| C4 | 🔴 Critical | `DashboardSkeleton` | Header border `#f3f4f6` hardcoded — invisible dark mode | Replace with `colors.borderSubtle` |
| C2 | 🔴 Critical | `DashboardHeroCard` | Hero amount `"#ffffff"` hardcoded | Replace with `t.colors.dashboard.heroText` |
| C1 | 🔴 Critical | `DashboardRecentActivity` | Gradient end `colors.surface` may mismatch `surface-dark` NativeWind token | Verify tokens match or use `["transparent", colors.surface]` |
| C3 | 🔴 Critical | `DashboardScreen` | `onOpenPeopleOverdue` wired to `onPressNotifications` — no separate prop slot | Add `onOpenPeopleOverdue: () => void` to Props |
| M1 | 🟠 Moderate | 6 components | `console.log` in production paths | Remove all; guard with `__DEV__` if needed |
| m8 | 🟡 Minor | `DashboardSkeleton` | Follow-up card skeleton width `260` ≠ real card width `200` | Change skeleton to `200` |
| M11 | 🟠 Moderate | All 8 components | `colors: any`, `gradients: any` prop types | Type as `ColorTokens`, `GradientTokens`, `typeof spacing` |
| M2 | 🟠 Moderate | `DashboardHeroCard` | `dashboardState` IIFE not memoized | `useMemo([totalOutstanding, overdueTotalCount])` |
| M5 | 🟠 Moderate | `DashboardQuickStats` | `quickStats` array not memoized | `useMemo([...])`  |
| m3 | 🟡 Minor | `DashboardFollowUpSection` | `isFetching` prop unused | Remove from Props |
| m4 | 🟡 Minor | `DashboardRecentActivity` | `isLoading` prop always `false` (unreachable path) | Remove prop or wire separate query loading |
| m10 | 🟡 Minor | `DashboardScreen` | `onCustomerAdded` / `onPaymentSuccess` recreated every render | Wrap in `useCallback` |

---

## 15. DECISION LOG

| Component | Old Behavior | New Specification | Reason |
|---|---|---|---|
| Hero Card Gradient | Static brand green gradient | Dynamic gradient based on `dashboardState` | Urgency-first feedback. Prompts merchant to focus on collection. |
| Header Avatar | Hardcoded inline circle | Reusable `Avatar` component | Code deduplication; unified shape/font. |
| Notification Badge | Plain red dot | Numbered badge with `overdueTotalCount` | Merchant instantly sees count of urgent items. |
| Recent Activity row tap | Navigates to entries list | Navigates directly to `entries/[orderId]` | Fewer taps to the specific transaction. |
| Quick Stats Overdue tap | Navigates to people list | Pre-filtered by `"Overdue"` | Matches user expectation — click "Overdue" → see overdue. |
| Follow-up Card tap | Only Collect button tappable | Entire card navigates to Customer Detail | Merchant may want to review timeline before collecting. |
| Haptic feedback | None | Wired to all primary actions | Premium tactile native feel. |
| Data fetching | Multiple separate queries | Single `get_dashboard_summary` RPC | Fewer network roundtrips; consistent snapshot. |
| Component architecture | Monolith route file | Feature-scoped `DashboardScreen` + sub-components | Each component independently testable and auditable. |
| Screen skeleton | Inline loading spinners | Full-screen `DashboardSkeleton` | No layout shift; premium loading experience. |
| SpeedDialFAB placement | Inside DashboardScreen | Tab layout level (`app/(main)/_layout.tsx`) | FAB persists across tabs; avoids z-index conflicts with Dashboard modals. |

---

## 16. OPEN QUESTIONS — RESOLVED

| Question | Resolution |
|---|---|
| Where does SpeedDialFAB live? | ✅ Tab layout level — `app/(main)/_layout.tsx`. Not inside DashboardScreen. |
| Separate `onOpenPeopleOverdue` prop? | ⏳ Open — C3 issue pending fix. Bell and Overdue tile currently share one handler. |
| Hero text token for `#ffffff`? | ⏳ Open — C2 pending. Add `dashboard.heroText` to `theme.ts`. |
| Follow-up card width mismatch? | ⏳ Open — m8 pending. Change skeleton from 260 to 200. |
| Pulse animation shared hook? | ⏳ Open — suggestion s1. Both HeroCard and FollowUpCard duplicate the pattern. |
| Zero-delta hero icon? | ✅ Decided: show `Minus` icon for zero-change (no text-only inconsistency). |
| Nested Pressable on Android? | ⏳ Open — C5 critical fix pending. Must resolve before next release. |
| `isFetching` prop on FollowUpSection? | ⏳ Open — m3 pending removal. |
