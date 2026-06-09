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
3. **Audit Trail Inspection:** Review chronologically grouped ledger transaction entries (sales entries vs. recorded payments) with search-like filtering.

**Entry point:** Tapping any customer card in the People screen (`app/(main)/people/index.tsx`), tapping an entry timeline item, or tapping a dashboard activity item.

**Route:** `app/(main)/people/[customerId].tsx`
**Screen file:** [`[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx)
**Hook:** [`usePersonDetail` in `usePeople.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/usePeople.ts)

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
- **Canvas bg:** `t.colors.canvas` (`#fafaf7` light / `#0f1012` dark)
- **Icons:** Lucide React Native, `strokeWidth: 2`, default sizing `20px` to `24px`
- **Cards:** `bg: t.colors.surface`, `border: 1px solid t.colors.borderDefault`, `borderRadius: 16px` (`rounded-xl`), horizontal screen margin `16px` (`mx-4`), vertical margin/gap `16px` (`mt-4`)
- **No global tabs** on this screen to preserve visual real estate for ledger detail scrolling.
- **Safe area:** Wrapped in `SafeAreaView` from `react-native-safe-area-context` targeting `["top", "left", "right"]`.

### Design Token Reference

Colors are resolved dynamically via `useTheme()` → `t.colors.*`. No hardcoded hex color values exist in components.

#### Core Color Tokens

| Semantic Token | `t.colors.*` key | Light Mode | Dark Mode | Usage |
|---|---|---|---|---|
| Canvas / Screen bg | `canvas` | `#fafaf7` | `#0f1117` | Main screen backdrop |
| Card surface | `surface` | `#ffffff` | `#1a1d23` | Inner cards and sheet components |
| Raised surface | `surfaceRaised` | `#f9fafb` | `#21242c` | Inset actions and secondary wrappers |
| Default border | `borderDefault` | `#e5e7eb` | `#374151` | General card dividers and bounds |
| Subtle divider | `borderSubtle` | `#f3f4f6` | `#1f2937` | Thin transaction separators |
| Text primary | `ink` | `#111827` | `#f9fafb` | Headings and primary names |
| Text secondary | `muted` | `#6b7280` | `#9ca3af` | Secondary labels and timestamp strings |

#### Status & State Gradients (Hero Card)

Status colors follow gradients specified in `theme.ts` → `gradients.customerDetailHero.*`:

| State | Start Color | End Color | Badge Style |
|---|---|---|---|
| **Overdue** | `#991B1B` | `#B91C1C` | Dark semi-translucent pill, red alert indicator |
| **Pending** | `#F59E0B` | `#B45309` | Dark semi-translucent pill, yellow warning indicator |
| **Advance** | `#EFF6FF` | `#3B82F6` | Dark semi-translucent pill, blue indicator |
| **Settled** | `#166534` | `#052E16` | Dark semi-translucent pill, green check indicator |

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── CustomerDetailHeader          ← navigation + Call + WhatsApp shortcuts
  ├── ScrollView
  │     ├── CustomerBalanceHero     ← net outstanding amount, status pill, last bill metadata
  │     ├── CustomerQuickActionsRow ← Add Entry (accent), Share Ledger, PDF Statement
  │     └── CustomerTransactionTimeline
  │             ├── CustomerTransactionTabs (All, Entries, Payments)
  │             └── List of chronologically grouped transaction headers + CustomerTransactionRow
  ├── RecordCustomerPaymentModal    (bottom sheet modal, offscreen)
  └── CustomerStickyCollectBar      ← sticky bottom bar (shown if balance due exists)
```

---

## 5. COMPONENT SPECS

### 5.1 CustomerDetailHeader
**File:** [`CustomerDetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailHeader.tsx)

Extends the shared [`DetailHeader`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/DetailHeader.tsx) element. It strips out legacy widgets like direct invoice share from the header bar, keeping call/remind icons contextual.

- **Title:** Customer Name (17px Bold, `t.colors.ink`, single line ellipsis).
- **Subtitle:** Last active status (e.g. `"Last active today"`, `"Last active 15 days ago"`).
- **Left Slot:** Tappable back arrow (`router.back()`) + compact circular Avatar showing customer initials.
- **Header Actions:** If customer has a valid phone number, renders a `MessageCircle` (WhatsApp reminder) and a `Phone` (Direct system dialer) call action. Both icons are styled using `t.colors.primary` with a 44dp minimum touch target.

---

### 5.2 CustomerBalanceHero
**File:** [`CustomerBalanceHero.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerBalanceHero.tsx)

Renders the high-impact card displaying financial status using status-driven horizontal gradients (`LinearGradient`).

- **Label:** Net balance state title (e.g., `"BALANCE DUE"`, `"ADVANCE"`, or `"ALL SETTLED"`). Uppercase, 11px, `t.colors.customerDetail.heroTextMuted` with `1.4` letter spacing.
- **Amount:** Primary ledger figure formatted via `formatINR()`. 36px ExtraBold, `t.colors.customerDetail.heroText` with `-0.5` letter spacing.
- **Status Badge:** Renders a translucent dark pill (`rgba(0, 0, 0, 0.22)`) with a white label. If status is `OVERDUE`, displays an inline white `AlertCircle` warning icon (11px).
- **Metadata Sub-label:** Displays last bill date (e.g. `"Last bill: 15 Jan 2026"`). If there is no activity, falls back to `"Add an entry to start this ledger"`.
- **Watermark:** A background wallet image is placed absolutely in the bottom-right corner to add premium texture to the card.
- **Open Dues Indicator:** If a pending order balance exists, appends `"1 open entry · ₹[amount] due"`.

---

### 5.3 CustomerQuickActionsRow
**File:** [`CustomerQuickActionsRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerQuickActionsRow.tsx)

Renders a three-column layout of equal-sized action tiles (`QuickActionTile`) for key features:
1. **Add Entry:** Highlighted with `accent` styling. Tapping routes to `/entries/create` pre-filled with the customer payload.
2. **Share:** Renders a `Share2` icon. Generates a temporary public share link via RPC (`upsert_access_token`) and triggers native sharing with a localized message. Shows a loading spinner during execution.
3. **PDF:** Renders a `Download` icon. Converts transaction history into a clean HTML layout using `buildStatementHtml` and displays the system print/save dialog. Disabled if there are no transactions.

---

### 5.4 CustomerTransactionTimeline
**File:** [`CustomerTransactionTimeline.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionTimeline.tsx)

Acts as the container for the list of transactions.
- **Tabs:** Segmented filter chips powered by [`CustomerTransactionTabs.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionTabs.tsx) for `"All"`, `"Entries"`, and `"Payments"`.
- **Chronological Grouping:** Renders text headers separating transactions by date (e.g. `"Today"`, `"Yesterday"`, or `"10 Jan 2026"`).
- **Infinite Scroll Expansion:** Displays the first 10 transactions by default. Renders a `"View Older History (N more)"` pressable button to expand the full list instead of slow scroll paging.
- **Empty State:** If transaction count is zero, delegates to [`CustomerDetailEmptyState.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailEmptyState.tsx), prompting the user to either record a payment or add a bill entry.

---

### 5.5 CustomerTransactionRow
**File:** [`CustomerTransactionRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionRow.tsx)

Individual transaction entry lines showing specific transaction metrics.
- **Icon:** Renders a circular background indicator (green for payments, red/orange/gray for entry statuses). Displays an `ArrowDownLeft` icon for payment collections and an `ArrowUpRight` icon for credit sales.
- **Title:** Displays `"Payment Received"` or `"Entry #[Bill Number]"`.
- **Subtitle:** Shows metadata like the number of items and formatted time (e.g. `"3 items · 10:30 am"`), alongside payment mode (e.g. `"UPI"` or `"Cash"`).
- **Status Chip:** Renders a status badge pill next to entries (e.g., `"OVERDUE"` or `"PENDING"`). Hidden for payment rows.
- **Right Side Details:** Displays the transaction amount (colored green for payments) and the running net customer ledger balance (`"Bal: ₹X"`).

---

### 5.6 CustomerStickyCollectBar
**File:** [`CustomerStickyCollectBar.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerStickyCollectBar.tsx)

A fixed action bar positioned absolutely at the bottom of the screen. Renders only when a customer has a positive pending order balance.
- **Left Column:** Displays `"BALANCE DUE"` label in micro-text and the pending bill amount in bold.
- **Right Column:** Renders a green `Collect Payment` primary button with a down-left arrow.
- **Haptics:** Triggers a medium tactile impact vibration on press.
- **Safe Area:** Computes bottom padding using `useSafeAreaInsets` to prevent overlaying the Android gesture navigation area (`paddingBottom: Math.max(insets.bottom, 12)`).

---

## 6. NAVIGATION CONTRACT

### Navigates FROM (Entry Points)

| Source Screen | Navigation Action | Parameters Passed |
|---|---|---|
| **Customer List** (`people/index.tsx`) | Tap customer list card | `customerId` |
| **Entry List** (`entries/index.tsx`) | Tap details link or metadata | `customerId` |
| **Dashboard** (`dashboard/index.tsx`) | Tap activity line item or hero collector | `customerId` |
| **Record Payment** | Automated redirect after recording payment | `customerId` |

### Navigates TO (Exit Points)

| Destination Screen | Trigger | Parameters Passed |
|---|---|---|
| **Create Entry** (`entries/create.tsx`) | Tap "Add Entry" CTA or empty state action | `customer` (JSON payload), `customerId` |
| **Entry Detail** (`entries/[orderId].tsx`) | Tap transaction row inside timeline | `orderId`, `customerId` |
| **Record Payment Modal** | Tap "Collect Payment" or timeline record action | `orderId`, `balanceDue`, `customerId`, `customerName` |
| **System Dialer** / **WhatsApp** | Tap Phone/Message icons in header | Preconfigured text message/number |

---

## 7. ACTION BAR / STICKY BAR SPEC

The sticky collect bar serves as the primary transaction trigger. It is absolute-positioned at the bottom of the screen, ensuring that the scroll list contents have sufficient bottom inset (`paddingBottom: 100`) so they are never clipped behind it.

- **Visual Weight:** Renders a top border divider (`1px t.colors.border`) with an inset overlay of `t.colors.primary` at `8%` opacity to differentiate the footer surface.
- **Ripple Effect:** Uses Android native boundary-constrained white ripple (`#ffffff30`).
- **Tactile Feedback:** Calls `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` synchronously on button press before popping up the bottom sheet modal.

---

## 8. COMPONENT MAP

| Component Name | File Path |
|---|---|
| **Customer Detail Screen** | [`app/(main)/people/[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx) |
| **CustomerDetailHeader** | [`src/components/people/customer-detail/CustomerDetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailHeader.tsx) |
| **CustomerBalanceHero** | [`src/components/people/customer-detail/CustomerBalanceHero.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerBalanceHero.tsx) |
| **CustomerQuickActionsRow** | [`src/components/people/customer-detail/CustomerQuickActionsRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerQuickActionsRow.tsx) |
| **CustomerTransactionTimeline** | [`src/components/people/customer-detail/CustomerTransactionTimeline.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionTimeline.tsx) |
| **CustomerTransactionTabs** | [`src/components/people/customer-detail/CustomerTransactionTabs.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionTabs.tsx) |
| **CustomerTransactionRow** | [`src/components/people/customer-detail/CustomerTransactionRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionRow.tsx) |
| **CustomerStickyCollectBar** | [`src/components/people/customer-detail/CustomerStickyCollectBar.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerStickyCollectBar.tsx) |
| **CustomerDetailEmptyState** | [`src/components/people/customer-detail/CustomerDetailEmptyState.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailEmptyState.tsx) |
| **RecordCustomerPaymentModal** | [`src/components/people/RecordCustomerPaymentModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/RecordCustomerPaymentModal.tsx) |

---

## 9. WHAT CHANGED AND WHY (Decision Log)

Key architectural decisions taken during the 4.1.5a–d passes:

1. **Header Action Demotion:** PDF statement generation and generic ledger link sharing were removed from the top navigation bar and moved down to secondary actions inside `CustomerQuickActionsRow`. This reduces header clutter, keeping navigation and direct communication (Call / WhatsApp) as the primary focus.
2. **Scroll-Triggered Sticky Bar vs. Floating Card:** The sticky collect bar is designed to pin directly above the system navigation line without a floating card layout. It renders only if the customer has an unpaid open entry (`balance_due > 0`), avoiding redundant inputs.
3. **Chronological Page Limits:** The transaction timeline loads the first 10 rows by default and renders an in-list expand trigger. This avoids virtualized infinite-scroll conflicts inside a nested `ScrollView` wrapper on React Native.
4. **Database-Driven Balance Syncing:** A background migration and Postgres trigger (`public.sync_party_customer_balance()`) were attached to automated ledger entries. This ensures the customer details hook (`usePersonDetail`) pulls cached, aggregated ledger numbers rather than recalculating them client-side.
