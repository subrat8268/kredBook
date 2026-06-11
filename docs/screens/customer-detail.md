# Customer Detail Screen — Design Spec

> **Status:** ✅ Locked — All states built, audited, and verified.
> **Last updated:** 2026-06-11
> **Doc version:** 3.1
> **Phase:** 3 — Polish & Features (as of STATUS.md)
> **Product Lead:** All open questions resolved. No open items remain.

---

## 1. SCREEN PURPOSE

The Customer Detail screen is the **most visited screen in KredBook**. A shopkeeper opens this screen multiple times per day — when a customer walks in, calls, or when the owner wants to check outstanding dues at the end of the day. It serves three core jobs:

1. **Status at a glance** — How much does this person owe me? Since when? What is their payment urgency?
2. **Collect or remind** — Record a payment right now, or send a pre-formatted reminder with one tap.
3. **Audit trail** — What did I sell? What has been paid? What's still open?

**Entry point:** Tapping any customer card in the People list (`app/(main)/people/index.tsx`) or deep-linking from the Dashboard activity feed.

**Route:** `app/(main)/people/[customerId].tsx`
**Screen file:** [`[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx)
**Hook:** `usePersonDetail` via [`usePeople.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/usePeople.ts)

---

## 2. USER MENTAL MODEL

The screen is structured top-to-bottom to follow the merchant's workflow during a customer interaction:

1. **WHO** is this customer? → Identity header with quick communication buttons (Call, WhatsApp).
2. **HOW MUCH** do they owe and since when? → Hero status card showing net balance, open entries, and oldest overdue days.
3. **ACT NOW** → Quick actions row (Add Entry, Share, PDF) + sticky footer for Collect Payment.
4. **WHAT HAPPENED** → Transaction timeline of entries, payments, and running balances grouped chronologically.
5. **ADMIN** → Overflow actions (Share Ledger, PDF Statement, Edit Profile, Delete Customer) in the header menu.

---

## 3. PLATFORM & CANVAS SPEC

- **Platform:** Android & iOS (React Native / Expo SDK 52)
- **Target device:** `390×844pt` (Pixel 7 / iPhone 14 class)
- **Style:** Clean, minimal, trust-first. PhonePe / Razorpay / Khatabook aesthetic.
- **Font stack:** Inter (headings, body, captions, labels)
- **Canvas bg:** `t.colors.canvas` (`#F9FAFB` light / `#08111F` dark)
- **Icons:** Lucide React Native, `strokeWidth: 2`, `20px` or `24px` default
- **Cards:** `bg: t.colors.surface`, `border: 1px solid t.colors.borderDefault`, `borderRadius: 16px` (`rounded-2xl`), `16px` horizontal screen margin (`mx-4`), `12px` gap between components (`mb-3`) *(adjusted during build — verified against 390px canvas)*
- **No tab bar** on this screen or any sub-screens in this flow.
- **Safe area:** wrapped in `<SafeAreaView edges={["top", "left", "right"]}>`

### Design Token Reference

> All colors resolved at runtime via `useTheme()` → `t.colors.*`.  
> **Never hardcode hex values in components.** Source of truth: [`theme.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts)

#### Core Colour Tokens (Light / Dark)

| Semantic Token | `t.colors.*` key | Light Value | Dark Value | Usage |
|---|---|---|---|---|
| Canvas / Screen bg | `canvas` | `#F9FAFB` | `#08111F` | Screen background |
| Card surface | `surface` | `#FFFFFF` | `#122036` | Cards, bottom sheets |
| Raised surface | `surfaceRaised` | `#F4F4F0` | `#1A2A43` | Inner cards, unselected chips |
| Default border | `borderDefault` | `#E5E7EB` | `#31415D` | Card borders, inputs |
| Subtle divider | `borderSubtle` | `#F3F4F6` | `#1F2937` | Row separators, menu lines |
| Text primary | `ink` | `#111827` | `#F3F4F6` | Names, amounts, prominent text |
| Text body | `body` | `#374151` | `#D1D5DB` | Subtitles, description body |
| Text secondary | `muted` | `#6B7280` | `#B4C0D4` | Secondary labels, timestamps |
| Text faint | `faint` | `#9CA3AF` | `#6B7280` | Placeholders, inactive state |
| Brand green | `primary` | `#16A34A` | `#22C55E` | Primary CTAs, positive numbers |
| Brand green active | `primaryActive` | `#15803D` | `#16A34A` | Pressed state for primary CTAs |
| Brand green light | `primaryBorderFill` | `#DCFCE7` | `#0F2A1A` | Avatar bg, badge fill |
| Brand error | `danger` | `#DC2626` | `#FCA5A5` | Unpaid balance, destructive CTAs |
| Brand warning | `warning` | `#F59E0B` | `#F59E0B` | Pending status colors |

#### Status / State Color Tokens

| State | Surface | Text | Gradient Start | Gradient End |
|---|---|---|---|---|
| Paid / Settled (green) | `paid.bg` `#DCFCE7` | `paid.text` `#15803D` | `#22C55E` | `#047857` |
| Pending (amber) | `pending.bg` `#FEF3C7` | `pending.text` `#D97706` | `#EF4444` | `#991B1B` |
| Overdue (red) | `overdue.bg` `#FEE2E2` | `overdue.text` `#DC2626` | `#DC2626` | `#7F1D1D` |
| Partial (blue) | `partial.bg` `#DBEAFE` | `partial.text` `#2563EB` | — | — |
| Advance (blue/purple) | `partial.bg` `#DBEAFE` | `partial.text` `#2563EB` | `#2563EB` | `#1D4ED8` |

#### Typography Tokens

| Token | Family | Font style | Usage |
|---|---|---|---|
| `t.typography.heroAmount` | Inter | Bold 800 · `fontSize: 36` · `lineHeight: 42` | Hero balance amount |
| `t.typography.screenTitle` | Inter (Manrope override) | Bold 700 · `fontSize: 24` · `lineHeight: 30` | Main headers |
| `t.typography.sectionTitle` | Inter (Manrope override) | Bold 700 · `fontSize: 18` · `lineHeight: 24` | Timeline section headers |
| `t.typography.cardTitle` | Inter | SemiBold 600 · `fontSize: 16` · `lineHeight: 22` | Card headings |
| `t.typography.body` | Inter | Regular 400 · `fontSize: 15` · `lineHeight: 22` | Body labels, messages |
| `t.typography.caption` | Inter | Medium 500 · `fontSize: 12` · `lineHeight: 16` | Timestamps, secondary subtitles |
| `t.typography.label` | Inter | Bold 700 · `fontSize: 11` · `lineHeight: 14` · Uppercase | Small micro caps, chips |

#### Spacing & Radius Tokens

| Token | Value | Description |
|---|---|---|
| `t.spacing.xs` | 4px | Micro padding between items |
| `t.spacing.sm` | 8px | Label-to-value gap |
| `t.spacing.md` | 12px | Spacing between sub-items in cards |
| `t.spacing.lg` | 16px | Outer screen padding, card padding |
| `t.spacing.xl` | 20px | Large modal padding |
| `t.spacing.screenPadding` | 16px | Page horizontal padding |
| `t.spacing.cardRadius` | 16px | Default card rounded corners |
| `t.spacing.avatarMd` | 44px | List avatar size |
| `t.radius.full` | 9999px | Circle pills, rounded buttons |

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── CustomerDetailHeader          ← WHO: title + back + contact CTAs + ⋮
  ├── ScrollView
  │     ├── CustomerBalanceHero     ← HOW MUCH: outstanding amount + oldest overdue days
  │     ├── CustomerQuickActionsRow ← ACT NOW: Add Entry · Share · PDF (always inline)
  │     └── CustomerTransactionTimeline ← HISTORY: grouped entries/payments + running balance
  │             ├── FilterTabs      ← All · Entries · Payments
  │             ├── SectionHeader   ← Chronological Date Group Label
  │             └── TransactionRows ← EntryRow / PaymentRow
  ├── RecordCustomerPaymentModal    (M1 bottom sheet, offscreen)
  ├── CustomerOverflowMenu          (M2 backdrop dropdown modal, offscreen)
  ├── PaymentDetailSheet            (M3 bottom sheet, offscreen)
  └── DeleteCustomerSheet           (M4 destructive confirmation sheet, offscreen)
```

---

## 5. STATUS DERIVATION

The overall customer status `balanceState` (type: `'overdue' | 'pending' | 'partial' | 'settled' | 'advance'`) is computed client-side inside the hook based on active entries and net outstanding balances:

```
netBalance          = customer.outstandingBalance (derived from sum of open orders)
hasOverdueEntries   = entries.some(e => e.balance_due > 0 AND e.due_date < today)
hasPartialEntries   = entries.some(e => e.amount_paid > 0 AND e.balance_due > 0)

balanceState priority order:
  1. overdue  → netBalance > 0 AND hasOverdueEntries
  2. advance  → netBalance < 0
  3. settled  → netBalance === 0
  4. partial  → netBalance > 0 AND hasPartialEntries AND NOT hasOverdueEntries
  5. pending  → default (netBalance > 0 AND no payments recorded yet)
```

- **Overdue threshold:** 1 day past the entry's due date (midnight boundary).
- **oldestOverdueDays calculation:** If `balanceState === 'overdue'`, find the oldest overdue entry and calculate:
  `oldestOverdueDays = Math.floor((today - oldestOverdueEntry.due_date) / (1000 * 60 * 60 * 24))`
- **nearestDueDate calculation:** If `balanceState === 'pending'` and a future due date exists:
  `nearestDueDate = earliest upcoming due date`

---

## 6. COMPONENT SPECS

### 6.1 CustomerDetailHeader

**File:** [`CustomerDetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailHeader.tsx)

- **Layout:** Flex row, `h-14 px-4 items-center justify-between bg: t.colors.surface`.
- **Left:** Back button (`ArrowLeft` 24px `t.colors.ink`, hitSlop 10) + `44×44px` Circular Avatar (Initials from customer name, `bg: t.colors.primaryBorderFill`, `color: t.colors.primary` Inter Bold 15px).
- **Center:**
  - Name: `t.typography.cardTitle` · `color: t.colors.ink` · `numberOfLines: 1`
  - Subtitle: Dynamic live balance state: `"₹[netBalance] due"` (overdue/pending), `"All settled"` (settled), or `"₹[abs(netBalance)] advance"` (advance) · `t.typography.caption` · `color: t.colors.muted`.
- **Right:** Flex row with action buttons:
  - Phone icon (24px `t.colors.primary` inside a 44px touch target) -> opens system dialer `tel:[phone]`.
  - WhatsApp icon (24px `t.colors.primary` inside a 44px touch target) -> opens WhatsApp reminder URL.
  - Overflow Menu `⋮` icon (24px `t.colors.ink` inside 44px target) -> triggers `CustomerOverflowMenu` (M2).
  - *Call and WhatsApp icons are only rendered if the customer has a phone number registered.*

---

### 6.2 CustomerBalanceHero

**File:** [`CustomerBalanceHero.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerBalanceHero.tsx)

- **Layout:** `LinearGradient` card, `mx-4 mb-3 rounded-2xl px-5 py-5 elevation: 8`. *(adjusted during build — px-6 py-6 made Row 4 clip on 390px canvas; dropped to px-5 py-5)*
- **Background Gradient:** Left-to-right gradient driven by `balanceState`:
  - `overdue` -> Red (`#DC2626` → `#7F1D1D`)
  - `pending` / `partial` -> Amber (`#EF4444` → `#991B1B`)
  - `settled` -> Green (`#22C55E` → `#047857`)
  - `advance` -> Blue (`#2563EB` → `#1D4ED8`)
- **Watermark:** Translucent circle overlay `160×160px` at `top: -10, right: -58` with 12% white opacity (`t.colors.customerDetail.heroOrb`).
- **Content:**
  - Row 1: Label uppercase matching state (`"BALANCE DUE"`, `"ADVANCE"`, or `"ALL SETTLED"`) · `fontSize: 11` · `fontWeight: 600` · `color: white` · `letterSpacing: 1.4`.
  - Row 2: Outstanding amount formatted in Indian style via `formatINR(netBalance)` · `t.typography.heroAmount` · `color: white` · `pb-3`.
  - Row 3 (Status & Aging):
    - Status badge: Rounded-full pill `bg: rgba(255,255,255,0.20), px-3 py-1`. Label matched to state (`"Overdue"`, `"Pending"`, `"Partial"`, `"Settled"`, or `"Advance"`). If `overdue`, pre-pended with Lucide `AlertCircle` icon (14px white).
    - Aging label (right-aligned):
      - Overdue -> `"Overdue · [oldestOverdueDays] days"`
      - Pending (with due date) -> `"Due [nearestDueDate]"`
      - Settled / Advance / Pending (no due date) -> Hidden.
  - Row 4 (Open Entries): `"N open entries · ₹X due"` (rendered in `white 75% opacity` Inter 13px, hidden if settled/advance).

---

### 6.3 CustomerQuickActionsRow

**File:** [`CustomerQuickActionsRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerQuickActionsRow.tsx)

- **Layout:** Flex row, `mx-4 mb-3 gap-2`, 3 equal tiles distributed via `flex-1` *(adjusted during build — 60%/36% split was not clean at 390px; switched to flex-1 + shrink-0)*.
- **Tile:** Each tile is a `Pressable` with `bg: t.colors.surfaceRaised`, `border: 1px t.colors.borderDefault`, `borderRadius: 16px`, `py-3 px-2`, `flex: 1`, centered content.
- **Icon container:** `52×52px` circle, `bg: t.colors.surface`, `borderRadius: 26`, centered inside tile.
- **Label below icon:** `color: t.colors.body` · `fontSize: 13` · `fontWeight: 600` · `numberOfLines: 1` · centred.
- **Tile 1 — Add Entry:** Lucide `Plus` icon (20px `t.colors.primary`) → navigates to `/(main)/entries/create` with customer pre-filled.
- **Tile 2 — Share:** Lucide `Share2` icon (20px `t.colors.muted`) → invokes upsert_access_token RPC and opens Native Share Sheet. Shows `"Sharing"` label + ActivityIndicator while in-flight.
- **Tile 3 — PDF:** Lucide `Download` icon (20px `t.colors.muted`) → generates HTML statement via `expo-print` then opens `expo-sharing`. Disabled (opacity 0.5) when no transactions exist. Shows `"Exporting"` label + spinner while in-flight.

---

### 6.4 CustomerTransactionTimeline

**File:** [`CustomerTransactionTimeline.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionTimeline.tsx)

- **Layout:** Container `mx-4 mb-4 mt-3`. *(adjusted during build — gap between components standardised to mb-3 (12px) from preceding element)*
- **Filter Tabs:** Horizontally scrollable chips (`All`, `Entries`, `Payments`), `gap-2` between chips. *(adjusted during build — added explicit gap-2 to prevent cramped layout)*
  - Selected chip: `flex-1 rounded-full bg: t.colors.primary py-2.5`, label `color: white` `fontSize: 15` Inter SemiBold.
  - Unselected chip: `flex-1 rounded-full bg: t.colors.surfaceRaised py-2.5 border: 1px t.colors.border`, label `color: t.colors.muted` `fontSize: 15` Inter SemiBold.
  - Default selected tab: `"All"`.
- **Section Headers:** Chronological group labels (e.g. `"Today"`, `"Mon, 02 Jun 2026"`). Text style: `t.typography.label` · `color: t.colors.muted` · `py-2 px-1`.
- **Row separators:** Hairline divider (1px `t.colors.borderSubtle`) between rows.

#### 6.4.1 EntryRow (in `CustomerTransactionRow.tsx`)
- **Left Icon:** Circle `36×36px` container. Icon `ArrowUpRight` (16px). Colored by entry status: *(adjusted during build — 32×32px looked undersized next to cardTitle text; bumped to 36×36px)*
  - Overdue: `bg: overdue.bg` · `color: overdue.text`
  - Pending: `bg: pending.bg` · `color: pending.text`
  - Partial: `bg: partial.bg` · `color: partial.text`
  - Paid: `bg: paid.bg` · `color: paid.text`
- **Title:** `"Entry #[bill_number]"` · `t.typography.cardTitle` · `color: t.colors.ink`.
- **Subtitle:** `"[itemCount] item(s) · [time]"` · `t.typography.caption` · `color: t.colors.muted`.
- **Aging chip:** Rendered inline next to status.
  - Overdue -> `bg: #fee2e2`, `color: #ef4444`, label `"[N]d overdue"` Inter Bold 11px.
  - Pending (with due date) -> `bg: #fef3c7`, `color: #d97706`, label `"Due [date]"` Inter Bold 11px.
- **Right block:**
  - Amount: `formatINR(amount)` · `color: t.colors.danger` · `t.typography.cardTitle`.
  - Running balance: `"Bal: ₹[runningBalance]"` · `color: t.colors.muted` · `fontSize: 12` below the amount.
- **Press action:** Navigates to `/(main)/entries/[orderId]`.

#### 6.4.2 PaymentRow (in `CustomerTransactionRow.tsx`)
- **Left Icon:** Circle `36×36px` container. Icon `ArrowDownLeft` (16px) · `bg: t.colors.primaryBorderFill` · `color: t.colors.primary`. *(adjusted during build — 32×32px looked undersized next to cardTitle text; bumped to 36×36px)*
- **Title:** `"Payment Received"` · `t.typography.cardTitle` · `color: t.colors.ink`.
- **Subtitle:** `"[paymentMode] · [time]"` · `t.typography.caption` · `color: t.colors.muted`.
- **Right block:**
  - Amount: `formatINR(amount)` · `color: t.colors.primary` · `t.typography.cardTitle`.
  - Running balance: `"Bal: ₹[runningBalance]"` · `color: t.colors.muted` · `fontSize: 12` below the amount.
- **Press action:** Opens `PaymentDetailSheet` (M3).

#### 6.4.3 EmptyState
- **Variant 1 (New Customer):** Ledger icon (48px `t.colors.muted`) · `"No entries yet"` · `"Add the first entry to start tracking this person's balance"` · CTA button `"+ Add First Entry"` (outline green).
- **Variant 2 (Filtered Empty):** `"No [entries/payments] yet"` · `"Nothing to show for this filter"` · No CTA.

#### 6.4.4 Pagination
- Show first **15 rows**. Clicking `"View [N] older records"` loads the remaining dataset.

---

## 7. MODAL & SHEET SPECS

### 7.1 RecordCustomerPaymentModal (M1)

**File:** [`RecordCustomerPaymentModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/RecordCustomerPaymentModal.tsx)

- **Trigger:** Tapping `"Collect Payment"` in `CustomerStickyCollectBar`.
- **Mechanism:** Bottom sheet modal using `@gorhom/bottom-sheet` (`modalRef.current?.present()`).
- **Details:** Pre-fills customer name, outstanding balance, and linked order ID. On submit, invokes mutation and closes, displaying the Success Banner.

### 7.2 Success Banner

- **Layout:** Inline banner displayed below header at the top of content, `bg: t.colors.primaryBorderFill` · `borderRadius: 12px` · `p-3` · `mx-4 mb-3`.
- **Content:** Lucide `CheckCircle` icon (18px `t.colors.primary`) + `"Payment of ₹[amount] recorded"` (Inter SemiBold 14px `color: t.colors.primary`).
- **Dismiss:** Automatically hides after `3s` or when the user scrolls the timeline.

### 7.3 CustomerOverflowMenu (M2)

**File:** `src/components/people/customer-detail/CustomerOverflowMenu.tsx` [NEW]

- **Trigger:** Tapping `⋮` in the header.
- **Backdrop:** Full-screen modal overlay `backgroundColor: rgba(0,0,0,0.20)`.
- **Card:** Width 200px, absolute `top: 56px, right: 16px` · `bg: t.colors.surface border: 1px t.colors.borderDefault rounded-xl elevation: 10`.
- **List items:** Separated by 1px `t.colors.borderSubtle` dividers:
  1. Share Ledger (`Share2` icon, `t.colors.ink`) -> Invokes token RPC and opens Native Share Sheet.
  2. PDF Statement (`Download` icon, `t.colors.ink`) -> Generates and prints customer PDF. (Greyed out if no transactions exist).
  3. Edit Customer (`Pencil` icon, `t.colors.ink`) -> Navigates to Edit Customer Screen.
  4. Delete Customer (`Trash2` icon, `t.colors.danger`) -> Opens `DeleteCustomerSheet` (M4).

### 7.4 PaymentDetailSheet (M3)

**File:** `src/components/people/customer-detail/PaymentDetailSheet.tsx` [NEW]

- **Trigger:** Tapping a Payment row in the timeline.
- **Layout:** Bottom sheet, height auto, `bg: t.colors.surface rounded-t-3xl px-5 py-5`.
- **Header:** Close drag handle `40×4px #D1D5DB`. Title `"Payment Details"` Inter SemiBold 17px.
- **Content:**
  - Big Amount: `formatINR(amount)` · `color: t.colors.primary` · `fontSize: 32` · `fontWeight: 700`.
  - Mode: `"Paid via [Cash / UPI / Cheque / NEFT / Other]"` · `color: t.colors.muted` · 14px.
  - Date: `"[Full Date + Timestamp]"` · 14px.
  - Note: `"Note: [noteText]"` (only if present).
- **CTAs:**
  - `"Close"` button -> `color: t.colors.muted` Inter SemiBold 15px.
  - `"Delete Payment"` button -> Red text `t.colors.danger` · **Disabled in v1** (greyed out with `"Coming soon"` tooltip, deleted capability reserved for v2).

### 7.5 DeleteCustomerSheet (M4)

**File:** `src/components/people/customer-detail/DeleteCustomerSheet.tsx` [NEW]

- **Trigger:** Tapping `"Delete Customer"` in `CustomerOverflowMenu`.
- **Mechanism:** destructive confirmation bottom sheet.
- **Content:**
  - Header: `"Delete Customer?"` Inter Bold 18px `color: t.colors.ink`.
  - Body: `"All transaction history ([N] entries, [N] payments) for [customerName] will be permanently deleted. This action cannot be undone."` · Inter Regular 14px · `color: t.colors.muted` · `mb-5`.
- **CTAs:**
  - `"Delete Permanently"` button -> Solid red `bg: t.colors.danger`, white text Inter SemiBold 15px, `h-12 rounded-xl`.
  - `"Cancel"` button -> `bg: t.colors.surfaceRaised`, `color: t.colors.ink` Inter SemiBold 15px, `h-12 rounded-xl`.

---

## 8. DATA LAYER

Data is fetched via TanStack Query from the database `parties` and `orders` tables:

| Hook | Query Key | Description |
|---|---|---|
| `usePersonDetail(customerId)` | `["customerDetail", customerId]` | Fetches profile, orders, statement timeline |
| `usePeople(vendorId, search)` | `["customers", vendorId, {search}]` | Fetches/paginates customer index list |
| `useUpdatePerson()` | - | Mutation to update customer profile fields |
| `useDeletePerson()` | - | Mutation to delete customer profile + clear cache |

### Offline Synchronisation

- **Caching:** Caches are persisted offline via Zustand + MMKV.
- **Mutation Queue:** When connection is down, mutations (create entry, record payment, update profile) are stored in `syncQueue.ts` under transactional payloads and replayed automatically once a connection is re-established.

### Client-side Computed Values

```ts
netBalance         = orders.reduce((sum, o) => sum + o.balance_due, 0)
oldestOverdueDays  = max(today - overdueOrder.due_date)
nearestDueDate     = min(futureOrder.due_date - today)
openEntriesCount   = orders.filter(o => o.status !== "Paid").length
balanceState       = (derived using logic in Section 5)
```

---

## 9. EDIT CUSTOMER SCREEN SPEC

- **Route:** `app/(main)/people/[customerId]/edit.tsx` [NEW]
- **Trigger:** Tapping `"Edit Customer"` in the ⋮ overflow menu.

### Layout (Top → Bottom)
```
SafeAreaView (canvas bg)
  ├── DetailHeader
  │     title: "Edit Profile"
  ├── KeyboardAvoidingView
  │     └── ScrollView
  │           ├── InputField (Name)          ← Editable, required
  │           ├── InputField (Phone)         ← Editable, formats to +91
  │           ├── InputField (Address)       ← Editable, optional
  │           ├── DisabledInputField (Bal)   ← Locked opening balance (info only)
  │           └── SaveButton (Sticky Footer) ← Enabled only when dirty
```

### Form Validations & Constraints
- **Customer Name:** Required. Length must be `> 1` and `< 50` characters.
- **Phone Number:** Editable, but strips non-digits. Displays alert warning below input if modified and existing entries exist: `"Warning: Changing the phone number will affect WhatsApp communication hooks."`
- **Opening Balance:** **Locked.** Uneditable on this screen to prevent accounting ledger corruption.
- **Dirty State (`isFormDirty`):** Save Button is disabled by default, and only activates if one or more editable fields (name, phone, address) differ from initial values.
- **Save Flow:**
  - Clicking "Save" calls `useUpdatePerson` mutation.
  - On success, invalidates query keys `["customerDetail", customerId]` and `["customers"]`.
  - Returns to detail screen with a success toast.

---

## 10. STATE MATRIX

| Component | OVERDUE 🔴 | PENDING 🟠 | PARTIAL 🔵 | SETTLED 🟢 | ADVANCE 🔵 |
|---|---|---|---|---|---|
| Hero Gradient | Red (`#DC2626`→`#7F1D1D`) | Amber (`#EF4444`→`#991B1B`) | Amber (`#EF4444`→`#991B1B`) | Green (`#22C55E`→`#047857`) | Blue (`#2563EB`→`#1D4ED8`) |
| Hero Label | `BALANCE DUE` | `BALANCE DUE` | `BALANCE DUE` | `ALL SETTLED` | `ADVANCE` |
| Hero Amount | `netBalance` | `netBalance` | `netBalance` | `₹0.00` | `abs(netBalance)` |
| Hero Aging | `"Overdue · X days"` | `"Due [date]"` (if set) | `"Due [date]"` (if set) | Hidden | Hidden |
| Header Subtitle | `"₹X due"` | `"₹X due"` | `"₹X due"` | `"All settled"` | `"₹X advance"` |
| Quick Actions | 3-tile row (Add · Share · PDF) | 3-tile row (Add · Share · PDF) | 3-tile row (Add · Share · PDF) | 3-tile row (PDF disabled if empty) | 3-tile row (PDF disabled if empty) |
| Sticky Bar CTA | `"Collect Payment"` (green) | `"Collect Payment"` (green) | `"Collect Payment"` (green) | Hidden (settled) | Hidden (advance) |
| Timeline Rows | Aging badge red | Aging badge amber | Aging badge mixed | No badges | No badges |
| Running Balance | Shown | Shown | Shown | Shown | Shown |
| WhatsApp CTA | Pre-filled reminder | Pre-filled reminder | Pre-filled reminder | Disabled | Disabled |

---

## 11. LINKED SCREENS (Customer Detail Flow)

| ID | Screen | Trigger | Status | Screen Route / File |
|---|---|---|---|---|
| CD-0 | Customer Detail — Overdue | Balance overdue | ✅ BUILT & LIVE | [`[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx) |
| CD-1 | Customer Detail — Pending | Balance pending | ✅ BUILT & LIVE | [`[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx) |
| CD-2 | Customer Detail — Settled | Balance = 0 | ✅ BUILT & LIVE | [`[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx) |
| CD-3 | Customer Detail — Advance | Balance credit | ✅ BUILT & LIVE | [`[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx) |
| CD-4 | Customer Detail — Empty | No entries exist | ✅ BUILT & LIVE | `CustomerDetailEmptyState.tsx` |
| CD-5 | ⋮ Overflow Menu | Tap ⋮ header | ✅ BUILT & LIVE | `CustomerOverflowMenu.tsx` |
| CD-6 | Payment Detail Sheet (M3) | Tap Payment row | ✅ BUILT & LIVE | `PaymentDetailSheet.tsx` |
| CD-7 | Success Banner | Payment recorded | ✅ BUILT & LIVE | Inline top banner |
| CD-8 | Delete Customer Sheet (M4) | Overflow → Delete | ✅ BUILT & LIVE | `DeleteCustomerSheet.tsx` |
| CD-9 | Edit Customer Screen | Overflow → Edit | ✅ BUILT & LIVE | `app/(main)/people/[customerId]/edit.tsx` |

---

## 12. COMPONENT FILE MAP

| Component | File Path | Purpose |
|---|---|---|
| Customer Detail screen | [`app/(main)/people/[customerId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId].tsx) | Orchestrator container and router view |
| Edit Customer screen | [`app/(main)/people/[customerId]/edit.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/people/[customerId]/edit.tsx) | Profile modifications route |
| CustomerDetailHeader | [`CustomerDetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailHeader.tsx) | Custom navbar with avatar and contact tools |
| CustomerBalanceHero | [`CustomerBalanceHero.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerBalanceHero.tsx) | Status gradient card showing overdue days |
| CustomerQuickActionsRow | [`CustomerQuickActionsRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerQuickActionsRow.tsx) | Three-tile row: Add Entry, Share, PDF |
| CustomerTransactionTimeline | [`CustomerTransactionTimeline.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionTimeline.tsx) | Chronological events timeline |
| CustomerTransactionRow | [`CustomerTransactionRow.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerTransactionRow.tsx) | Visual row details with inline aging badge |
| CustomerDetailEmptyState | [`CustomerDetailEmptyState.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/customer-detail/CustomerDetailEmptyState.tsx) | Empty layouts (filters vs new customer) |
| CustomerOverflowMenu | `CustomerOverflowMenu.tsx` | Dropdown with share, statement, edit, delete |
| PaymentDetailSheet | `PaymentDetailSheet.tsx` | Details display sheet for timeline payments |
| DeleteCustomerSheet | `DeleteCustomerSheet.tsx` | Bottom sheet for customer deletion confirmation |

---

## 13. COMPONENT FOLDER STRUCTURE TREE

```
src/components/people/
  ├── customer-detail/
  │     ├── CustomerQuickActionsRow.tsx
  │     ├── CustomerBalanceHero.tsx
  │     ├── CustomerDetailEmptyState.tsx
  │     ├── CustomerDetailHeader.tsx
  │     ├── CustomerDetailSectionShell.tsx
  │     ├── CustomerQuickActionsRow.tsx
  │     ├── CustomerTransactionRow.tsx
  │     ├── CustomerTransactionTabs.tsx
  │     ├── CustomerTransactionTimeline.tsx
  │     └── types.ts
  ├── record-payment/
  │     ├── PaymentOutcomeHint.tsx
  │     ├── RecordPaymentAmountConsole.tsx
  │     ├── RecordPaymentForm.tsx
  │     ├── RecordPaymentIntentToggle.tsx
  │     ├── RecordPaymentModeChips.tsx
  │     ├── RecordPaymentResult.tsx
  │     └── useRecordCustomerPaymentModal.ts
  ├── CustomerCard.tsx
  ├── CustomerList.tsx
  ├── NewCustomerModal.tsx
  ├── RecordCustomerPaymentModal.tsx
  └── index.ts
```

---

## 14. WHAT CHANGED AND WHY (Decision Log)

| # | Old Spec / Design | New Spec / Design | Reason |
|---|---|---|---|
| 1 | Share + PDF tiles in `CustomerQuickActionsRow` | Kept — QuickActionsRow retained as inline tile strip | Not admin-only during build validation; Add Entry + Share + PDF are frequent enough to warrant inline access. |
| 2 | Share + PDF icons in header | Remains tile 2 & 3 of `CustomerQuickActionsRow` inline | Quick actions row is compact enough (3 flex-1 tiles at 390px). |
| 3 | `CustomerStickyCollectBar` (floating, conditional) | Kept as sticky footer for Collect Payment | Sticky bar provides persistent CTA below scroll — inline action strip would lose Collect Payment visibility. |
| 4 | Header subtitle: `"Last active [X]"` | `"₹X due"` / `"All settled"` / `"₹X advance"` | Passive timestamp vs live financial state. Owners need numerical context. |
| 5 | Hero sub-label: `"Last bill: [date]"` | Aging label: `"Overdue · X days"` or `"Due [date]"` | Owners need urgency context, not last activity date. |
| 6 | No open entries count on hero | `"N open entries · ₹X due"` line added | Owner needs to know depth of exposure, not just total balance. |
| 7 | No aging badge on timeline rows | `"[N]d overdue"` / `"Due [date]"` chip per entry row | Urgency at item level — owner can see which specific entry is overdue. |
| 8 | Payment rows not tappable | Tap opens `PaymentDetailSheet` (view only v1) | Owners dispute recorded payments and need to verify details. |
| 9 | 10 rows paginated | 15 rows before expand trigger | 10 rows was too few for customers with frequent transactions. |
| 10 | Default timeline tab: `"All"` | Kept as `"All"` | Full picture is the right default. Filtering is opt-in. |
| 11 | `CustomerStickyCollectBar` file | Deleted, replaced by `CustomerActionStrip` | Cleaner layout, no floating/clipping conflicts with system overlays. |
| 12 | Blue avatar color on some screens | Green avatar system: `bg: primaryBorderFill, color: primary` | Brand consistency across all user profiles. |
| 13 | `background`, `textPrimary` old tokens | `canvas`, `ink` aligned theme tokens | Aligns to new design system aliases. |
| 14 | `"+ Add Entry"` navigated to blank Create Entry form | Pre-selects current customer automatically | Skips customer picker as context is already known. |
| 15 | Hero aging used most-recent overdue | Hero aging uses **oldest** overdue days | Worst-case exposure is what drives action. |
| 16 | Payment delete in v1 | View only in v1, delete deferred to v2 | Irreversible action; prevent data corruption before confidence is built. |

---

## 15. OPEN QUESTIONS — ALL RESOLVED

| # | Question | ✅ Resolution | Rationale |
|---|---|---|---|
| 1 | Which aging to show on hero when multiple overdue entries? | **Oldest overdue days** | Worst-case exposure is what drives action |
| 2 | Should `"+ Add Entry"` pre-select customer? | **Yes, always** | Context is already established, skipping customer picker is faster |
| 3 | PaymentDetailSheet delete in v1? | **v1: view only, delete in v2** | Irreversible action; prevent data loss |
| 4 | Collect Payment red tint in Overdue state? | **Green always** | Red = error state. Urgency is already visual on hero gradients |
| 5 | Show running balance on timeline? | **Yes, keep it** | Shopkeepers verify hand-totals. Builds trust in the ledger |

---

## 16. NAVIGATION CONTRACT

### Navigates FROM (entry points into this screen)

| Source Screen | Trigger | Params Received |
|---|---|---|
| Customer List (`people/index.tsx`) | Tap customer row | `customerId` |
| Dashboard (`dashboard/index.tsx`) | Tap activity feed or collect shortcut | `customerId` |
| Entry Detail (`entries/[orderId].tsx`) | Tap customer name / View Customer | `customerId` |
| Record Payment success | Redirect after payment | `customerId`, `justPaid=true` |

### Navigates TO (exits from this screen)

| Destination Screen | Trigger | Params Passed |
|---|---|---|
| Entry Detail (`entries/[orderId].tsx`) | Tap entry row | `orderId`, `customerId` |
| Create Entry (`entries/create.tsx`) | `"+ Add Entry"` in `CustomerQuickActionsRow` | `customer` (JSON), `customerId` *(picker skipped)* |
| Record Payment modal (M1) | `"Collect Payment"` in `CustomerStickyCollectBar` | `customerId`, `customerName`, `balanceDue` |
| Edit Customer (`people/[customerId]/edit.tsx`) | Overflow → Edit Customer | `customerId` |
| System Dialer | Phone icon in header | `customer.phone` |
| WhatsApp | MessageCircle icon in header | pre-filled reminder template |
