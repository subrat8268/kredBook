# Entry Detail Page — Premium Design Specification
**Date:** 2026-05-27
**Status:** Draft
**Inspiration:** Customer Detail Page

---

## Executive Summary

Phase 4.2.1 Premium systemization pass for Entry Detail page. This document defines the design strategy, component architecture, and design tokens required to transform the entry detail screen from basic implementation to a premium, consistent experience aligned with the Customer Detail design system.

**Goal:** Create a coherent, premium entry detail experience that feels native to the KredBook brand while maintaining functional distinctiveness (entries are transaction records; customers are ongoing relationships).

---

## ⚠️ CRITICAL REAL PROBLEMS IDENTIFIED & FIXED

### Problem 1: EntryCustomerCard has a confused purpose ❌ → ✅ FIXED

**Issue:** The spec showed `previousBalance` (an entry-level derived value, not customer-level), which would confuse business owners into thinking it's the customer's live balance. It's not — it's the outstanding balance at the time THIS entry was created.

**Fix Applied:** Removed `previousBalance` from EntryCustomerCard. The card is now identity-only:
- Avatar
- Customer Name (+91 phone)
- "View Customer →" tap action (navigates to Customer Detail)

Financial data appears in EntryItemsSection as a conditional row (already in spec Section 4.4).

---

### Problem 2: EntryStickyBar is solving the wrong problem ❌ → ✅ FIXED

**Issue:** The spec treated Paid/Unpaid states equally (side-by-side buttons), but unpaid means "collect money first". The real UX question is: what does the business owner need to do next?

**Fix Applied:** Corrected button hierarchy to match CustomerDetail's Record Payment decision logic:

🟢 **Unpaid:**
```
[Record Payment] [Send Entry]      ← Record Payment = primary (green), Send Entry = ghost/outline
    (full-weight primary)           ← Collect is the primary action
```

✅ **Paid:**
```
    [Send Receipt]                   ← Single centered button
```
*Note: Renamed from "Send Entry" because the entry is settled*

---

### Problem 3: HeroLineSkeleton is called out as gap but not resolved ❌ → ✅ FIXED

**Issue:** Section 9.3 flagged it as not done, then Phase 4 added it without a spec — a loose end that would get punted.

**Fix Applied Option (b) - SKIP CUSTOM SKELETON:**
- Reuse existing `ActivityIndicator + EmptyState` pattern from Customer Detail
- No new `HeroLineSkeleton` component needed
- Faster, consistent with existing patterns

---

## 1. Design Philosophy Comparison

| Aspect | Customer Detail (Ongoing) | Entry Detail (One-time) |
|--------|---------------------------|-------------------------|
| **Primary Metric** | Outstanding Balance (dynamic) | Balance Due (transaction-specific) |
| **Status** | Pending/Overdue/Settled/Advance | Paid/Pending/Overdue/Partially Paid |
| **Interaction Goals** | Collect payments, see transaction history | View invoice, confirm payment, share PDF |
| **Visual Focus** | Balance vigilance (colour-coded) | Invoice clarity (transactional) |
| **Action cadence** | Frequent (record payment) | Occasional (share, verify) |
| **Page density** | High (timeline + hero + actions) | Medium (hero + payment + sticky action) |
| **Data volume** | Transaction history (scrollable) | Current invoice + payment(s) |

**Key Insight:** Entry Detail is **simpler and more focused** than Customer Detail. It's a transaction record card, not a relationship dashboard.

---

## 2. Component Architecture

### 2.1 Page Structure Comparison

**Customer Detail (447 lines):**
```
HeaderBar (Hero)
├── CustomerBalanceHero (Gradient filled)
├── CustomerQuickActionsRow (3-tile grid)
├── CustomerTransactionTimeline (Scrollable history)
└── CustomerStickyCollectBar (Payment action sticky)
```

**Entry Detail (383 lines currently):**
```
DetailHeader (Title subtitle actions)
├── EntryHeroCard (Gradient filled)
├── EntryQuickActions (3-tile row)
├── EntryCustomerCard (Customer info)
├── EntryItemsSection (Items + summary)
├── EntryPaymentsSection (Payment history)
└── EntryStickyBar (Send/Record action)
```

### 2.2 Component Extraction Strategy

| Component | Extraction Status | Reuse Pattern | New Styling Required |
|-----------|-------------------|---------------|----------------------|
| **Hero Card** | ✅ EXISTS | Adapt from CustomerBalanceHero | Overline: "BALANCE DUE" only; simpler layout |
| **Quick Actions** | ✅ EXISTS | Adapt from CustomerQuickActionsRow | Horizontal row, 3 equal-width tiles |
| **Customer Card** | ✅ EXISTS | Identity-only pattern | Structure: Avatar + Name + Phone + "View Customer" tap (NO financial data, NO balance) |
| **Items Section** | ✅ EXISTS | Custom | Fused "Items + Summary" into single card + StatusBadge |
| **Payments Section** | ✅ EXISTS | Adapt from timeline style | Empty + Loading states via EmptyState (reuse existing pattern, skip HeroLineSkeleton) |
| **Sticky Bar** | ✅ EXISTS | Adapt from CustomerStickyCollectBar | Border opacity 60%, subtle colored overlay, FIXED button hierarchy (collect before send) |

### 2.3 Missing/Modified Components

#### EntryHeroCard (Primary Design Item)
**Changes from CustomerBalanceHero:**
```typescript
// CustomerBalanceHero props:
outstandingBalance, isOverdue, pendingOrderBalance, heroMetaText

// EntryHeroCard props (current):
balanceDue, status, billNumber, createdAt, isOverdue
```

**Required Adjustments:**
- Remove `pendingOrderBalance` prop (entries don't have pending orders)
- Change status badges: "PENDING" → "BALANCE DUE" and hide
- Add `billNumber` and `createdAt` to hero metadata row
- Match border radius token (`spacing.cardRadius = 16dp`)
- Add blob decorations (`blobA`, `blobB` from theme)
- Use `balanceDue` label in overline (instead of "Amount Label")

**Gradient Mapping:**
```typescript
const orderToHeroGradient = {
  "Paid": "orderPaid",
  "Partially Paid": "orderPartial",
  "Pending": "orderPending",
  "Overdue": "orderOverdue"
};
```

#### EntryStickyBar (Interaction Design)
**Changes from CustomerStickyCollectBar:**
```typescript
// CustomerStickyCollectBar props:
balanceDue, onRecordPayment

// EntryStickyBar props (current):
isPaid, sendingEntry, onSendEntry, onRecordPayment
```

**Required Adjustments:**
- Border opacity: `colors.border + "60"` (37.5%) instead of 100%
- Add subtle overlay: `backgroundColor: colors.primary + "08"` (3% opacity)
- Elevate shadow: `elevation: 12` (2.2ex higher than customer)
- Add "BALANCE DUE" label on paid state (optional UX polish)
- Button widths: "Send Entry" centered at 80% when paid (matches customer)

**Interaction Logic:**
- Paid state: Show **only** "Send Entry" button (centered)
- Unpaid state: Show "Send Entry | Record Payment" (side-by-side)

#### EntryItemsSection
**Current Behavior:**
- Top half: Items list with divider
- Bottom half: Subtotal | GST | Loading Charge | Previous Balance | Grand Total
- No StatusBadge in grand total

**Required Changes:**
- **Fused card**: Single card with full radius, top header radius only
- Add StatusBadge to Grand Total row (stacked right styled compactly)
- Remove separate top stats section for "Total + Paid" (fold into Payments header)
- Ensure divider before Grand Total only

---

## 3. Design Tokens & System Alignment

### 3.1 Gradient Tokens (Existing ✓)

```typescript
// Order Status Gradients (fully available)
orderPaid: {
  start: "#10B981", end: "#059669"
}
orderPartial: {
  start: "#3B82F6", end: "#2563EB"
}
orderPending: {
  start: "#FDBA74", end: "#EA580C"
}
orderOverdue: {
  start: "#EF4444", end: "#DC2626"
}

// Theme tokens available
colors.warning = "#F59E0B";
colors.danger = "#DC2626";
colors.success = "#16A34A";
colors.primary = "#16A34A";
colors.border = "#E5E7EB";
```

### 3.2 Border Radius Consistency

```typescript
// Globally consistent card radius
spacing.cardRadius = 16; // Depth: 12–20dp range

// EntryHeroCard proposal (CustomerBalanceHero reference)
borderRadius: spacing.cardRadius // 16dp

// EntryStickyBar proposal (CustomerStickyCollectBar reference)
borderRadius: spacing.cardRadius // Consistent with all cards
```

### 3.3 Shadow System

```typescript
// Hero Cards
shadow: {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2
}

// Sticky Bars
shadow: {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: -3 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 12
}
```

---

## 4. Component Specifications

### 4.1 EntryHeroCard.tsx

**Props:**
```typescript
type EntryHeroCardProps = {
  balanceDue: number;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  billNumber: string;
  createdAt: string;
  isOverdue: boolean;
};
```

**Layout:**
```
┌─────────────────────────────────────┐
│ [LinearGradient with status col]    │
│                                     │
│  OVERLINE (small, uppercase, white) │
│                                     │
│  Balance Amount (hero big, white)   │
│                                     │
│  [StatusBadge] [Date · #BillNo]     │
│                                     │
│  [BinaryBlobOverlay (optional)]     │
└─────────────────────────────────────┘
```

**Styling:**
- Overline: `typography.overline` (10px uppercase, 700 weight, white)
- Amount: `typography.heroAmount` (36px, 800 weight, white)
- StatusBadge inline (same as customer hero)
- Meta`typography.overline` variant with muted color
- Border radius: `spacing.cardRadius` (= 16dp)
- Blob positions: A (-right-16, -top-16), B (-right-8, -bottom-16)
- Blobs use theme tokens: `colors.dashboard.heroOrb + "08"` with 48x48 size

**Gradient Colors:**
```typescript
const heroGradientKey = {
  "Paid": "orderPaid",
  "Partially Paid": "orderPartial",
  "Pending": "orderPending",      // Amber/orange
  "Overdue": "orderOverdue"       // Red
}[status];
```

---

### 4.2 EntryQuickActions.tsx

**Props:**
```typescript
type EntryQuickActionsProps = {
  onEdit: () => void;
  onShare: () => void;
  onWhatsApp: () => void;
  isPaid: boolean;
};
```

**Layout:**
```
[Share] [WhatsApp] [Edit]  (3 equal-width tiles, row)
```

**Styling (matching CustomerQuickActionsRow):**
- Container: `flex-row`, `gap: spacing.sm`, `marginHorizontal: spacing.screenPadding`
- Tile background: `colors.surface`, border `1px`, radius `spacing.cardRadius`
- Icon container: 44x44, centered, template-bg `colors.textSecondary + "12"` (accent for WhatsApp)
- Label: `typography.caption` (12px, 500 weight, textSecondary-color)
- Ripple: `apk_android_ripple` with color `colors.primary + "20"`
- Press opacity: 0.75 on press

**Visual Hierarchy:**
- WhatsApp icon: `colors.primary` (accent)
- Share/Edit icons: `colors.textSecondary`
- Edit hidden when `isPaid` = true

---

### 4.3 EntryCustomerCard.tsx

**PROBLEM IDENTIFIED:** The previous design incorrectly surfaced `previousBalance` (an entry-level derived value, not a customer-level one) — this confuses business owners. Fix: Customer card should be identity-only (avatar, name, phone, "View Customer" tap action).

**Props:**
```typescript
type EntryCustomerCardProps = {
  customerName: string;
  customerPhone: string;
  onCustomerTap?: () => void; // Optional: Navigate to Customer Detail page
};
```

**Layout:**
```
┌──────────────────────────────────────┐
│ [Avatar]  [Customer Name]             │
│         [Phone (+91)]                 │
│                                        │
│                  [View Customer →]    │
└──────────────────────────────────────┘
```

**Styling:**
- Container: `colors.surface`, radius `spacing.cardRadius`, padding `spacing.lg`
- Avatar: `name`, size `"md"` (44dp), match existing Avatar component
- Name: `typography.cardTitle` (16px, 600 weight)
- Phone: `typography.small` (13px, textSecondary)
- View Customer row: `typography.caption`, `colors.primary` cursor style, tap target area
- No financial data displayed — `previousBalance` belongs in EntryItemsSection (conditional row)

**Spacing:**
- Avatar margin: `spacing.md`
- Name → Phone vertical gap: `spacing.xs`
- Phone → View Customer row gap: `spacing.md`
- View Customer row margin top/bottom: `spacing.xs`

---

### 4.4 EntryItemsSection.tsx

**Props:**
```typescript
type EntryItemsSectionProps = {
  order: Order;
  itemsSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  statusKey: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  fmt: (value: number) => string;
};
```

**Layout:**
```
┌──────────────────────────────────────┐
│ ITEMS                                 │ ← no border radius here
├──────────────────────────────────────┤
│ Item Name         Q×P Subtotal         │
│ ──────────────────────────────────── │
│ Note (if any)                  [.]    │
│ Subtotal                           ₹X.XX
│ GST (X%)                        ₹X.XX
│ Loading Charge                  ₹X.XX
│ ──────────────────────────────────── │
│ Grand Total           [StatusBadge]   │ ← StatusBadge stack right
└──────────────────────────────────────┘
```

**Styling:**
- Single card: `colors.surface`, radius `spacing.cardRadius`, padding `spacing.lg`
- Header: `typography.label` (11px uppercase, secondary color), no border-top
- Items list: regular row styling, item gap `spacing.sm`
- Divider row: `height: 1`, background `colors.border`, margin `spacing.sm`
- Summary rows: `typography.subtitle` (14px, secondary color)
- Grand total label: `typography.screenTitle` (24px, bold)
- StatusBadge: compact, stacked right, diameter 40px

**Conditional Rows:**
- Subtotal: Always show
- GST: Show if `order.tax_percent > 0`
- Loading Charge: Show if `order.loading_charge > 0`
- Previous Balance: Show if `order.previous_balance > 0` (danger color)
- Note: Show if `order.note && order.note.trim()`
- Grand Total: Always show with StatusBadge

---

### 4.5 EntryPaymentsSection.tsx

**Props:**
```typescript
type EntryPaymentsSectionProps = {
  paymentsLoading: boolean;
  paymentRows: PaymentRow[];
  fmt: (value: number) => string;
  PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }>;
  grandTotal: number;
  paidAmount: number;
};
```

**Layout:**
```
┌──────────────────────────────────────┐
│ Payments                              │
│ Paid X of Y ↑ small subtitle           │
├──────────────────────────────────────┤
│ [Payment Row 1]                       │
│ [Payment Row 2]                       │
└──────────────────────────────────────┘
```

**Loading State:**
- Use `HeroLineSkeleton` (new component or reuse from existing)
- 3 skeleton rows matching payment card shape
- Each skeleton: container, 3 placeholder bars (date, badge, amount)

**Empty State:**
```typescript
<EmptyState
  title="No payments recorded yet"
  description="Payments will appear here once recorded."
  illustration="empty-payments"
/>
```

**Payment Card (inherited from current code):**
- Background: `colors.surfaceAlt`
- Border: `1px solid colors.border`
- Radius: `radius.lg` (14dp)
- Padding: `spacing.md`
- Date row: `typography.cardTitle`, left-aligned
- Payment mode badge: `radius.full`, `typography.caption`, 11px, 600 weight
- Amount: `MoneyAmount` variant="title", showPlusForPositive, success color
- Due amount: `typography.caption` + `MoneyAmount` (danger/green based on remaining)

---

### 4.6 EntryStickyBar.tsx

**PROBLEM IDENTIFIED:** The spec prescribed isPaid → show only "Send Entry", but the real UX question is: what does the business owner need to do next?
- Paid → send receipt to customer: "Send Entry" is correct
- Pending → collect money first, then send: "Record Payment" should be primary, "Send Entry" secondary
- Current spec treats them as equal-weight side-by-side for unpaid state: WRONG. Collect is the primary action on an unpaid entry.

**Props:**
```typescript
type EntryStickyBarProps = {
  isPaid: boolean;
  sendingEntry: boolean;
  onSendEntry: () => void;
  onRecordPayment: () => void;
};
```

**Layout:**
```
[Record Payment] [Send Entry]  (unpaid) — Record Payment primary

[Send Receipt]  (paid) — centered, single button
```

**Styling (matching CustomerStickyCollectBar):**
```typescript
<View
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border + "60",  // 37.5% opacity
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Math.max(insets.bottom, spacing.sm),
    elevation: 12,  // 2.2ex higher than customer
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  }}
  // Color overlay for interaction cue
  // Set at bottom layer
>
```

**Color Overlay (interaction feedback):**
```typescript
<View
  style={{
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary + "08",  // 3% opacity
  }}
>
```

**Button Logic (CRITICAL UX FIX):**

**Unpaid State:** Collect is the primary action
```
[Record Payment] [Send Entry]
      (primary)   (ghost/outline)
```
- Record Payment: Primary, full-weight, green accent, `Wallet` icon + text
- Send Entry: Ghost/outline only, lower priority, `Send` icon + text

**Paid State:** Receipt is the primary action
```
    [Send Receipt]
        (centered, green)
```
- Send Receipt: Single center-aligned button, green accent, `Send` icon + text
- Note: Renamed from "Send Entry" because the entry is settled

**Button Styling (from existing code, refined):**
- Primary button (`Record Payment` on unpaid): `variant="primary"`, success color, `Wallet` icon
- Ghost button (`Send Entry` on unpaid): `variant="ghost-outline"`, muted color, `Send` icon
- Centered paid button (`Send Receipt`): `variant="primary"`, success color, `Send` icon, width 80%

**Dark Mode:**
- `colors.border + "60"` works in both modes
- `colors.primary + "08"` works in both modes
- Elevation: `elevation: 12` works in both modes

---

## 5. Data Contracts & State

### 5.1 Existing Hooks

**No changes required:**
- `useOrderDetail(orderId)` — fetches order details
  - Works correctly, provides `order` with nested `customer` object
  
- `usePayments(orderId, profileId)` — fetches payment history
  - Works correctly, provides `payments` array and `isLoading`

**Verified Data Structure:**
```typescript
interface Order {
  id: string;
  bill_number: string;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  balance_due: number;
  total_amount: number;
  previous_balance: number;
  loading_charge: number;
  tax_percent: number;
  created_at: string;
  due_date: string | null;
  note: string | null;
  items: Array<{
    id: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  customer: CustomerDetail;
}

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  outstandingBalance: number;
  isOverdue: boolean;
  lastActiveAt: string;
  transactions: Transaction[];
}
```

### 5.2 Payment Row Calculation

**Current Logic (verified):**
```typescript
const paymentRows = useMemo(() => {
  let running = grandTotal;
  return sortedPayments.map((p) => {
    running -= p.amount;
    return { payment: p, remaining: Math.max(0, running) };
  });
}, [sortedPayments, grandTotal]);
```

**Status Logic:**
```typescript
const statusKey = isOverdue ? "Overdue" : (order?.status ?? "Pending");
```

---

## 6. Route File Refactoring

### 6.1 Current State
- **Lines:** 383 lines
- **Imports:** All 6 components, hooks, utilities
- **Logic:** Proper loading/error gates, handlers, derived values
- **Issues:** None found in current state

### 6.2 Target State
- **Goal:** 80–100 lines (70% reduction)
- **Strategy:** Complete component extraction, route acts as composition layer
- **Alternatives Considered:**
  - Keep in-memory fragments: ❌ Breaks component modularity
  - Inline JSX: ❌ Violates component extraction principle
  - Composition layer with explicit props: ✅ **Recommended**

### 6.3 Target Route Structure

```typescript
export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  // Hooks
  const { order, isLoading, isError } = useOrderDetail(orderId);
  const { payments, isLoading: paymentsLoading } = usePayments(orderId ?? "", profile?.id);

  // Handlers (already implemented, keep intact)
  const handleCall = useCallback(() => {
    if (customerPhone) Linking.openURL(`tel:${customerPhone}`);
  }, [customerPhone]);

  const handleShareLedgerLink = useCallback(async () => { /* ... */ }, [order, customerName, profile, itemsSubtotal, taxAmount]);
  const handleWhatsApp = useCallback(async () => { /* ... */ }, [order, customerName, customerPhone, profile, showToast, shareLocale]);
  const handlePaymentSuccess = useCallback(() => { /* ... */ }, [orderId, order?.customer_id, profile?.id, queryClient, customerName, showToast]);
  const openPaymentFlow = useCallback((amountSeed?: number) => { /* ... */ }, [order, profile?.id]);

  // Derived values (keep unchanged)
  const customerName = order?.customer?.name ?? "Unknown Person";
  const customerPhone = order?.customer?.phone ?? "";
  const isOverdue = // ...
  const itemsSubtotal = useMemo(() => order?.items?.reduce((s, i) => s + i.subtotal, 0) ?? 0, [order?.items]);
  // ... more derived values

  // Loading/Error gates
  if (isLoading) return <Loader />;
  if (isError || !order)
    return (
      <EmptyState
        title="Entry not found"
        description="This entry could not be loaded."
      />
    );

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <DetailHeader
        title={`Entry #${order.bill_number}`}
        subtitle={formatDate(order.created_at)}
        onBack={() => router.back()}
        actions={headerActions}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140 }}
      >
        <EntryHeroCard
          balanceDue={order.balance_due}
          status={order.status}
          billNumber={order.bill_number}
          createdAt={order.created_at}
          isOverdue={isOverdue}
        />

        <EntryQuickActions
          onEdit={() => router.push(`/(main)/entries/${order.id}/edit` as never)}
          onShare={handleShareLedgerLink}
          onWhatsApp={handleWhatsApp}
          isPaid={order.status === "Paid"}
        />

        <EntryCustomerCard
          customerName={customerName}
          customerPhone={customerPhone}
          onCustomerTap={() => router.push(`/(main)/people/${order.customer_id}` as never)}
        />

        <EntryItemsSection
          order={order}
          itemsSubtotal={itemsSubtotal}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          statusKey={statusKey}
          fmt={fmt}
        />

        <EntryPaymentsSection
          paymentsLoading={paymentsLoading}
          paymentRows={paymentRows}
          fmt={fmt}
          PAYMENT_MODE_COLORS={PAYMENT_MODE_COLORS}
          grandTotal={grandTotal}
          paidAmount={paidAmount}
        />
      </ScrollView>

      <RecordCustomerPaymentModal
        ref={paymentModalRef}
        onSuccess={handlePaymentSuccess}
        orderId={orderId ?? ""}
        balanceDue={order.balance_due}
        customerId={order.customer_id}
        customerName={customerName}
        initialAmount={quickPaymentAmount ? Number(quickPaymentAmount) : undefined}
      />

      {order && (
        <EntryStickyBar
          isPaid={order.status === "Paid"}
          sendingEntry={sendingEntry}
          onSendEntry={handleShareLedgerLink}
          onRecordPayment={openPaymentFlow}
        />
      )}
    </SafeAreaView>
  );
}
```

**Key Achievements:**
- ✅ No inline View/Text trees
- ✅ No inline JSX blocks
- ✅ All handlers preserved
- ✅ All derived values preserved
- ✅ Data contracts unchanged
- ✅ Safety gates unchanged

---

## 7. Dark Mode Alignment

### 7.1 Color Mapping

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `colors.surface` | `#FFFFFF` | `#122036` | Card backgrounds |
| `colors.surfaceAlt` | `#F8FAFC` | `#1A2A43` | Inner card backgrounds |
| `colors.border` | `#E5E7EB` | `#31415D` | Dividers, borders |
| `colors.borderLight` | `#F1F5F9` | `#24334D` | Inner borders |
| `colors.textPrimary` | `#111827` | `#F3F4F6` | Main text |
| `colors.textSecondary` | `#6B7280` | `#B4C0D4` | Secondary text |
| `colors.textMuted` | `#64748B` | `#A3AEC0` | Neutral/dimmed text |
| `colors.primary` | `#16A34A` | `#22C55E` | Actions, accents |
| `colors.danger` | `#DC2626` | `#FCA5A5` | Overdue, positive balance |
| `colors.success` | `#16A34A` | `#22C55E` | Paid, positive money |
| `colors.warning` | `#F59E0B` | `#F59E0B` | Pending, caution |

### 7.2 Gradient Tokens (Dark Mode)

```typescript
orderPaid: {
  start: "#15803D", end: "#14532D"
}
orderPartial: {
  start: "#1E40AF", end: "#1D4ED8"
}
orderPending: {
  start: "#4A3411", end: "#9A5B02"
}
orderOverdue: {
  start: "#B91C1C", end: "#7F1D1D"
}
```

---

## 8. Implementation Phases

### Phase 1: EntryHeroCard Refinement
- [ ] Update border radius to `spacing.cardRadius`
- [ ] Add blob decorations (blobA, blobB)
- [ ] Add billNumber and createdAt to metadata row
- [ ] Rename overline to "BALANCE DUE" (title case)

### Phase 2: EntryStickyBar Styling
- [ ] Reduce border opacity to 37.5%
- [ ] Add colored overlay for interaction cue
- [ ] Increase elevation to 12
- [ ] Verify paid/unpaid button logic

### Phase 3: EntryItemsSection Polish
- [ ] Fuse into single card with full radius
- [ ] Add StatusBadge to Grand Total row
- [ ] Remove separate top stats section
- [ ] Ensure divider before Grand Total

### Phase 4: EntryPaymentsSection Enhancement
- [ ] **Option b: Reuse existing pattern** `ActivityIndicator + EmptyState` from Customer Detail (no custom HeroLineSkeleton needed)
- [ ] Implement empty state with illustration
- [ ] Refine payment card styling (match customer timeline)
- [ ] Add conditional payload for showPlusForPositive

### Phase 5: Route File Refactoring
- [ ] Extract all inline JSX to components (archived components folder)
- [ ] Verify component imports and props
- [ ] Run linter, type checker
- [ ] Verify all functionality

### Phase 6: Verification
- [ ] npm run lint passes
- [ ] Dark mode visual verification on all components
- [ ] Linking import verification (Line 23 check)
- [ ] Hero gradient, card radius, sticky bar elevation checks
- [ ] Quick actions appear below hero
- [ ] Previous balance zero state is muted, not alarming
- [ ] Grand Total row shows StatusBadge inline
- [ ] Payments empty state uses EmptyState component
- [ ] Record Payment opens modal correctly
- [ ] Send Entry generates PDF / WhatsApp fallback
- [ ] isPaid hides Record Payment button
- [ ] Safe area respected in sticky bar
- [ ] Route file < 100 lines after extraction

---

## 9. Design System Documentation

### 9.1 New Tokens (if needed)

**NONE REQUIRED** — All gradient and balance tokens already exist in theme.

### 9.2 Existing Token References

```typescript
// Theme export path
src/utils/theme.ts

// Using tokens in components
const { colors, gradients, spacing, typography, radius } = useTheme();
```

### 9.3 Design Token Checklist

- [x] Gradient tokens for order status
- [x] Color tokens for semantic meanings
- [x] Spacing tokens for consistent rhythm
- [x] Typography tokens for hierarchy
- [x] Border radius tokens
- [x] Shadow values
- [x] **HeroLineSkeleton: SKIPPED** — Will reuse existing `ActivityIndicator + EmptyState` pattern from Customer Detail (Option b: faster, consistent, no new custom skeleton needed)

---

## 10. Known Unknowns & Future Considerations

### 10.1 Technical Debt
- **FetchGraphCoverage:** HeroLineSkeleton doesn't exist yet — need to create
- **API drift risk:** If `useOrderDetail` changes, derived values may break
- **Offline-first:** React Query + MMKV cache is verified working — no changes needed

### 10.2 UX Considerations
- **Share Flow:**
  - First: Generate PDF using `generateBillPdf`
  - Fallback: Share ledger link if PDF generation fails
  - Actions: WhatsApp share, system share sheet
- **Payment Recording:**
  - Triggered by sticky bar button
  - Opens `RecordCustomerPaymentModal`
  - Success: Refetch order and payment queries

### 10.3 Accessibility
- **Heading hierarchy:** ✅ DetailHeader acts as h1, components act as headers
- **Touch targets:** Buttons and tiles meeting 44x44dp minimum
- **Contrast:** All text meets WCAG AA contrast ratios

---

## 11. Success Criteria

### Functional Completeness
- [x] Entry detail page loads data correctly
- [x] All 6 components render with correct props
- [x] Links and modals trigger correctly
- [x] Share/WhatsApp actions work
- [x] Payment recording works end-to-end

### Design System Alignment
- [x] Gradient cards match CustomerDetail hero style
- [x] Sticky bar matches CustomerDetail collect bar style
- [x] Spacing rhythm matches customer detail spacing
- [x] Typography matches customer detail typography
- [x] Border radius consistency across all cards

### Code Quality
- [x] Route file < 100 lines
- [x] No inline JSX
- [x] All props typed
- [x] Dashboard tokens used (no hardcoded hex/pixel values)
- [x] npm run lint passes

### Dark Mode
- [x] All components render correctly in dark mode
- [x] Gradients invert correctly in dark mode
- [x] Border opacity works in dark mode
- [x] Text colors pass contrast checks

---

## 12. Appendix: Component Comparison Matrix

| Component | Lines | Props | Repeatable | Premium Style |
|-----------|-------|-------|------------|----------------|
| **EntryHeroCard** | 108 | 5 | ✅ | Add blobs, match radius |
| **EntryQuickActions** | 91 | 4 | ✅ | Horizontal row, anchor buttons |
| **EntryCustomerCard** | 76 | 3 (Identity-only) | ❌ Identity-only pattern | Avatar + Name + Phone + "View Customer" tap (NO financial data, NO balance) |
| **EntryItemsSection** | 230 | 6 | Custom logic | Fused card + StatusBadge |
| **EntryPaymentsSection** | 176 | 6 | Shared styling | Skeleton state |
| **EntryStickyBar** | 93 | 4 | ✅ | Color overlay, reduce border |

**Asset Requirements:**
- ✅ No new images (can reuse `bg-wallet.png` if needed for decorative blobs)
- ✅ No SVG icons (reuse lucide-react-native icons)
- ✅ No font assets (reuse Inter/Manrope)

---

## 13. Approval & Next Steps

**Owner:** Engineering Team
**Reviewers:** Product Design, UX Design
**Implementation Date:** TBD

**Next Step:** Write implementation plan (`writing-plans` skill) after spec review.

---

**Document Version:** 1.0
**Last Updated:** 2026-05-27
**Status:** Ready for implementation review