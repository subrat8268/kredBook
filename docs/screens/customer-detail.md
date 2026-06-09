# Customer Detail Screen — Design Spec

> **Status:** ✅ Locked — All sub-passes (4.1.5a–d) built, audited, and verified.
> **Last updated:** 2026-06-09
> **Doc version:** 1.0
> **Product Lead:** No open items remain.

---

## 1. SCREEN PURPOSE

The **Customer Detail** screen is the primary daily hub of the KredBook application. Shopkeepers spend the vast majority of their session time on this page. It serves three main objectives:
1. **At-a-glance Balance Verification:** Instantly know if the customer owes money, has cleared their balance, or holds an advance.
2. **Seamless Payment Collection:** Launch the payment collection console with a single tap to settle dues.
3. **Audit Trail Inspection:** Review chronologically grouped ledger transaction entries (sales entries vs. recorded payments).

**Route:** `app/(main)/people/[customerId].tsx`
**Hook:** `src/hooks/usePeople.ts` → `usePersonDetail`

---

## 2. USER MENTAL MODEL

The screen visual hierarchy follows a natural logical cascade representing how a shopkeeper evaluates a customer:
1. **WHO:** Confirm the customer identity via header avatar, name, and contact buttons.
2. **HOW MUCH:** View the net outstanding balance state (Overdue, Pending, Advance, or Settled) on the large primary hero card.
3. **WHAT DO I DO:** Launch quick actions to add a new transaction entry, share the ledger link, or export the PDF statement.
4. **WHAT HAPPENED:** Browse historical details of all entries and payments chronologically, with the ability to filter by transaction type.
5. **COLLECT MONEY:** Confirm and record a custom or full balance settlement via the sticky collect bar at the bottom.

---

## 3. PLATFORM & CANVAS SPEC

- **Platform:** Android & iOS (React Native / Expo SDK 52)
- **Target device:** `390×844pt` (Pixel 7 / iPhone 14 class)
- **Canvas bg:** `t.colors.canvas`
- **Icons:** Lucide React Native, `strokeWidth: 2`, default `20–24px`
- **Cards:** `bg: t.colors.surface`, `border: 1px solid t.colors.borderDefault`, `borderRadius: 16px`, horizontal margin `16px`, gap `16px`
- **No global tab bar** on this screen.
- **Safe area:** `SafeAreaView` from `react-native-safe-area-context` targeting `["top", "left", "right"]`.

### Design Token Reference

All colours resolved via `useTheme()` → `t.colors.*`. No hardcoded hex in any component.

| Semantic Token | `t.colors.*` key | Light | Dark | Usage |
|---|---|---|---|---|
| Canvas | `canvas` | `#fafaf7` | `#0f1117` | Screen background |
| Card surface | `surface` | `#ffffff` | `#1a1d23` | Cards and sheets |
| Raised surface | `surfaceRaised` | `#f9fafb` | `#21242c` | Inset / secondary surface |
| Border | `borderDefault` | `#e5e7eb` | `#374151` | Card borders |
| Divider | `borderSubtle` | `#f3f4f6` | `#1f2937` | Row separators |
| Text primary | `ink` | `#111827` | `#f9fafb` | Names, headings |
| Text secondary | `muted` | `#6b7280` | `#9ca3af` | Labels, timestamps |

### Hero Card Gradients (by status)

| State | Gradient Start | Gradient End |
|---|---|---|
| Overdue | `#991B1B` | `#B91C1C` |
| Pending | `#F59E0B` | `#B45309` |
| Advance | `#3B82F6` | `#EFF6FF` |
| Settled | `#166534` | `#052E16` |

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── CustomerDetailHeader          ← back + avatar + name + Call + WhatsApp
  ├── ScrollView
  │     ├── CustomerBalanceHero     ← balance amount, status pill, last bill metadata
  │     ├── CustomerQuickActionsRow ← Add Entry · Share Ledger · PDF Statement
  │     └── CustomerTransactionTimeline
  │             ├── CustomerTransactionTabs  (All · Entries · Payments)
  │             └── CustomerTransactionRow (chronologically grouped)
  ├── RecordCustomerPaymentModal    (bottom sheet, offscreen)
  └── CustomerStickyCollectBar      ← fixed bottom (only when balance_due > 0)
```

---

## 5. COMPONENT SPECS

### 5.1 CustomerDetailHeader
**File:** `src/components/people/customer-detail/CustomerDetailHeader.tsx`

Extends shared `DetailHeader` (`src/components/layer2/DetailHeader.tsx`).

- **Left:** Back arrow → `router.back()` + compact circular avatar (initials).
- **Center:** Customer name `17px/600 t.colors.ink` · subtitle `"Last active [X]"` `13px t.colors.muted`.
- **Right:** `Phone` + `MessageCircle` (WhatsApp) icons — only rendered if customer has a valid phone number. Both use `t.colors.primary`, `44dp` touch target.
- **No Share or PDF icons in header** — those live in Quick Actions only.

---

### 5.2 CustomerBalanceHero
**File:** `src/components/people/customer-detail/CustomerBalanceHero.tsx`

High-impact card with status-driven `LinearGradient`.

- **Label:** `"BALANCE DUE"` / `"ADVANCE"` / `"ALL SETTLED"` — `11px/600 uppercase letter-spacing: 1.4`.
- **Amount:** `formatINR()` — `36px ExtraBold`, white.
- **Status Badge:** Translucent dark pill `rgba(0,0,0,0.22)`, white label. OVERDUE adds inline `AlertCircle` icon.
- **Sub-label:** `"Last bill: [date]"` or `"Add an entry to start this ledger"` if no activity.
- **Open Dues line:** `"1 open entry · ₹[amount] due"` — shown when `pendingOrderBalance > 0`.
- **Watermark:** Wallet image, absolute bottom-right, decorative.

---

### 5.3 CustomerQuickActionsRow
**File:** `src/components/people/customer-detail/CustomerQuickActionsRow.tsx`

Three equal `QuickActionTile` columns:

| # | Label | Icon | Action |
|---|---|---|---|
| 1 | Add Entry | `plus-circle` | Navigate to `entries/create` pre-filled with customer payload |
| 2 | Share | `share-2` | RPC `upsert_access_token` → native share sheet |
| 3 | PDF | `download` | `buildStatementHtml` → system print dialog. Disabled if no transactions. |

---

### 5.4 CustomerTransactionTimeline
**File:** `src/components/people/customer-detail/CustomerTransactionTimeline.tsx`

- **Tabs:** `CustomerTransactionTabs` — `All` · `Entries` · `Payments` filter chips.
- **Grouping:** Date headers (`"Today"`, `"Yesterday"`, `"10 Jan 2026"`).
- **Pagination:** First 10 rows shown. `"View Older History (N more)"` pressable expands full list.
- **Empty state:** `CustomerDetailEmptyState` — prompts to record a payment or add a bill.

---

### 5.5 CustomerTransactionRow
**File:** `src/components/people/customer-detail/CustomerTransactionRow.tsx`

- **Icon:** Circle bg — green for payments, red/orange/gray for entries. `ArrowDownLeft` for payment, `ArrowUpRight` for entry.
- **Title:** `"Payment Received"` or `"Entry #[bill_number]"`.
- **Subtitle:** `"3 items · 10:30 am"` + payment mode (`"UPI"` / `"Cash"`).
- **Status chip:** `StatusBadge` on entry rows only. Hidden for payment rows.
- **Right:** Amount (green for payments) + running balance `"Bal: ₹X"`.
- **Tap:** Entry rows → navigate to Entry Detail. Payment rows → not tappable in v1.

---

### 5.6 CustomerStickyCollectBar
**File:** `src/components/people/customer-detail/CustomerStickyCollectBar.tsx`

Absolute-positioned fixed bar. Renders **only** when `pendingOrderBalance > 0`.

- **Left:** `"BALANCE DUE"` micro-label + pending amount bold.
- **Right:** `"Collect Payment"` green primary button with `ArrowDownLeft` icon.
- **Safe area:** `paddingBottom: Math.max(insets.bottom, 12)` via `useSafeAreaInsets` — Android gesture nav safe.
- **Haptics:** `Haptics.impactAsync(Medium)` on press before opening modal.
- **List clearance:** ScrollView `paddingBottom: 100` so last row is never hidden behind bar.

---

## 6. NAVIGATION CONTRACT

### Navigates FROM

| Source | Trigger | Params received |
|---|---|---|
| Customer List (`people/index.tsx`) | Tap customer card | `customerId` |
| Entry List (`entries/index.tsx`) | Tap customer metadata link | `customerId` |
| Dashboard (`dashboard/index.tsx`) | Tap activity item or hero collect | `customerId` |
| Record Payment success | Auto-redirect after payment | `customerId` |

### Navigates TO

| Destination | Trigger | Params passed |
|---|---|---|
| Create Entry (`entries/create.tsx`) | Quick Actions → Add Entry | `customer` (JSON), `customerId` |
| Entry Detail (`entries/[orderId].tsx`) | Tap transaction row | `orderId`, `customerId` |
| Record Payment modal | Sticky bar → Collect Payment | `orderId`, `balanceDue`, `customerId`, `customerName` |
| System dialer | Header → Phone icon | Customer phone number |
| WhatsApp | Header → MessageCircle icon | Pre-filled reminder message |

### Back navigation
- Back arrow → `router.back()`.
- Android hardware back = same as back arrow.

---

## 7. ACTION BAR / STICKY BAR SPEC

| Property | Value |
|---|---|
| Position | Absolute bottom, full width |
| Background | `t.colors.surface` + `t.colors.primary` at 8% opacity overlay |
| Top border | `1px t.colors.borderSubtle` |
| Bottom padding | `Math.max(insets.bottom, 12)` |
| Button | Full green `t.colors.primary`, `borderRadius: full`, `height: 48px` |
| Visibility | Only when `pendingOrderBalance > 0` |
| Android ripple | White `#ffffff30`, boundary constrained |

---

## 8. COMPONENT MAP

| Component | File |
|---|---|
| Screen route | `app/(main)/people/[customerId].tsx` |
| CustomerDetailHeader | `src/components/people/customer-detail/CustomerDetailHeader.tsx` |
| CustomerBalanceHero | `src/components/people/customer-detail/CustomerBalanceHero.tsx` |
| CustomerQuickActionsRow | `src/components/people/customer-detail/CustomerQuickActionsRow.tsx` |
| CustomerTransactionTimeline | `src/components/people/customer-detail/CustomerTransactionTimeline.tsx` |
| CustomerTransactionTabs | `src/components/people/customer-detail/CustomerTransactionTabs.tsx` |
| CustomerTransactionRow | `src/components/people/customer-detail/CustomerTransactionRow.tsx` |
| CustomerStickyCollectBar | `src/components/people/customer-detail/CustomerStickyCollectBar.tsx` |
| CustomerDetailEmptyState | `src/components/people/customer-detail/CustomerDetailEmptyState.tsx` |
| RecordCustomerPaymentModal | `src/components/people/RecordCustomerPaymentModal.tsx` |
| Data hook | `src/hooks/usePeople.ts` → `usePersonDetail` |
| API layer | `src/api/people.ts` → `fetchPersonDetail` |
| Shared header | `src/components/layer2/DetailHeader.tsx` |

---

## 9. WHAT CHANGED AND WHY

| Old | New | Reason |
|---|---|---|
| Share + PDF icons in header | Moved to `CustomerQuickActionsRow` | Header reserved for nav + direct communication only |
| Floating collect card always visible | Sticky bar shown only when `balance_due > 0` | Removes noise for settled/advance customers |
| Inline scroll pagination | First 10 rows + expand trigger | Avoids nested `ScrollView` virtualization conflicts in RN |
| Client-side balance calculation | `sync_party_customer_balance` Postgres trigger | Single source of truth, no client drift |
| `useSafeAreaInsets` not wired in sticky bar | `paddingBottom: Math.max(insets.bottom, 12)` | Android gesture nav area no longer clips bar |
| Global FAB on detail screen | Removed — Add Entry in Quick Actions only | Detail screens use contextual actions, not global FAB |
