# Entry Detail Screen — Design Spec

> **Status:** ✅ Locked — All states built, audited, and verified.
> **Last updated:** 2026-06-09
> **Doc version:** 2.0
> **Phase:** 3 — Polish & Features (as of STATUS.md)
> **Product Lead:** All open questions resolved. No open items remain.

---

## 1. SCREEN PURPOSE

The Entry Detail screen is the **single source of truth** for one transaction. It lets a business owner:

1. Instantly understand the financial status of an entry (who owes, how much, overdue or not).
2. Take the most critical next action (record a payment or remind the customer).
3. Review transaction history and itemized details on demand.

**Entry point:** Tapping any row in the Entries list (`app/(main)/entries/index.tsx`) or from the Customer Detail screen.

**Route:** `app/(main)/entries/[orderId].tsx`
**Screen file:** [`[orderId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId].tsx)
**Hook:** [`useEntryDetail.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/entries/useEntryDetail.ts)

---

## 2. USER MENTAL MODEL

The screen follows the business owner's thought process top-to-bottom:

1. **WHO** is this transaction with? → Customer Card
2. **HOW MUCH** is owed and what's the status? → Hero Card
3. **WHAT HAPPENED** since creation? → Payments Card
4. **DETAILS** of what was sold → Items Card (collapsed by default)
5. **NEXT ACTION** → Sticky Action Bar

---

## 3. PLATFORM & CANVAS SPEC

- **Platform:** Android & iOS (React Native / Expo SDK 52)
- **Target device:** `390×844pt` (Pixel 7 / iPhone 14 class)
- **Style:** Clean, minimal, trust-first. PhonePe / Razorpay / Khatabook aesthetic.
- **Font stack:** Plus Jakarta Sans (headings/display) + Inter (body/captions)
- **Canvas bg:** `t.colors.canvas` (`#fafaf7` light / `#0f1012` dark)
- **Icons:** Lucide React Native, `strokeWidth: 2`, `24px` default
- **Cards:** `bg: t.colors.surface`, `border: 1px solid t.colors.borderDefault`, `borderRadius: 12px` (`rounded-xl`), standard shadow/elevation, `16px` horizontal screen margin (`mx-4`), `16px` gap between cards (`mb-4`)
- **No tab bar** on this screen or any sub-screens in this flow.
- **Safe area:** Wrapped in `<SafeAreaView edges={["top","bottom"]}>`

### Design Token Reference

> All colours resolved at runtime via `useTheme()` → `t.colors.*`.  
> **Never hardcode hex values in components.** Source of truth: [`theme.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/theme/theme.ts)

#### Core Colour Tokens (Light / Dark)

| Semantic Token | `t.colors.*` key | Light Value | Dark Value |
|---|---|---|---|
| Canvas / Screen bg | `canvas` | `#fafaf7` | `#0f1012` |
| Card surface | `surface` | `#ffffff` | `#18191c` |
| Raised surface | `surfaceRaised` | `#f4f4f0` | `#222427` |
| Muted surface | `surfaceMuted` | `#eeede8` | `#2a2d31` |
| Modal overlay | `surfaceOverlay` | `rgba(17,24,39,0.40)` | `rgba(0,0,0,0.60)` |
| Default border | `borderDefault` | `#e5e7eb` | `#2a2d31` |
| Subtle divider | `borderSubtle` | `#f3f4f6` | `#1f2023` |
| Strong border | `borderStrong` | `#d1d5db` | `#374151` |
| Focus border | `borderFocus` | `#16a34a` | `#4ade80` |
| Text primary | `ink` | `#111827` | `#f3f4f6` |
| Text body | `body` | `#374151` | `#d1d5db` |
| Text secondary | `muted` | `#6b7280` | `#9ca3af` |
| Text faint | `faint` | `#9ca3af` | `#6b7280` |
| On-primary text | `onPrimary` | `#ffffff` | `#052e16` |
| Brand error | `error` | `#dc2626` | `#f87171` |

#### Status / State Colour Tokens

| State | Surface | Border | Text | Hero gradient |
|---|---|---|---|---|
| Paid (green) | `paidSurface` `#f0fdf4` | `paidBorder` `#bbf7d0` | `paidText` `#166534` | `paid` `#16a34a` → `primaryActive` `#166534` |
| Pending (amber) | `pendingSurface` `#fffbeb` | `pendingBorder` `#fde68a` | `pendingText` `#92400e` | `pending` `#d97706` → `pendingText` `#92400e` |
| Overdue (red) | `overdueSurface` `#fef2f2` | `overdueBorder` `#fecaca` | `overdueText` `#991b1b` | `overdue` `#dc2626` → `overdueText` `#991b1b` |
| Partial (blue) | `partialSurface` `#eff6ff` | `partialBorder` `#bfdbfe` | `partialText` `#1d4ed8` | `partial` `#3b82f6` → `partialText` `#1d4ed8` |
| Advance (purple) | `advanceSurface` `#f5f3ff` | `advanceBorder` `#ddd6fe` | `advanceText` `#5b21b6` | — |
| Primary (brand green) | `primarySurface` `#f0fdf4` | `primaryBorder` `#bbf7d0` | `primary` `#16a34a` | — |

#### Typography Tokens

| Token | Font | Style |
|---|---|---|
| `t.fontFamily.display` | Plus Jakarta Sans Bold 700 | Headings, card titles |
| `t.fontFamily.displaySemiBold` | Plus Jakarta Sans SemiBold 600 | Header bar title |
| `t.fontFamily.displayExtraBold` | Plus Jakarta Sans ExtraBold 800 | Hero amount |
| `t.fontFamily.body` | Inter Regular 400 | Body text, captions |
| `t.fontFamily.bodyMedium` | Inter Medium 500 | Labels, secondary text |
| `t.fontFamily.bodySemiBold` | Inter SemiBold 600 | Buttons, emphasis |
| `t.fontFamily.bodyBold` | Inter Bold 700 | Strong emphasis |

#### Spacing & Radius Tokens

| Token | Value |
|---|---|
| `t.spacing[3]` | 12px (screen top padding) |
| `t.spacing[4]` | 16px (screen horizontal padding) |
| `t.layout.screenPaddingH` | 16px |
| `t.radius.lg` | 12px (cards, inputs) |
| `t.radius['2xl']` | 16px |
| `t.radius['3xl']` | 20px (hero card) |
| `t.radius.full` | 9999 (pills, buttons) |

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── DetailHeader          ← navigation + ⋮ overflow
  ├── ScrollView
  │     ├── EntryCustomerCard   ← WHO
  │     ├── EntryHeroCard       ← HOW MUCH + status
  │     ├── EntryPaymentsSection ← WHAT HAPPENED
  │     └── EntryItemsSection   ← DETAILS (collapsed)
  ├── RecordCustomerPaymentModal  (bottom sheet, offscreen)
  ├── DeleteEntryModal            (centered modal, offscreen)
  ├── RemindCustomerSheet         (bottom sheet, offscreen)
  ├── PaymentSuccessAnimation     (full-screen overlay, conditional)
  └── EntryStickyBar              ← absolute bottom, primary CTA
```

> **Decision:** No Quick Actions row between cards. All admin actions (Edit, Delete, Mark as Paid, Share, Print, View Customer) live exclusively in the **⋮ header overflow menu**. The Remind action lives only in the **Sticky Action Bar**.

> **Decision:** No Entry Timeline section. The Payments Card already surfaces chronological payment history.

> **Decision:** `EntryQuickActions` is dead code — must not render on screen.

---

## 5. STATUS DERIVATION

Computed in [`useEntryDetail.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/entries/useEntryDetail.ts) via `statusKey` (type: `'pending' | 'partial' | 'paid' | 'overdue'`).

```
grandTotal    = order.total_amount + order.previous_balance
balanceDue    = max(0, grandTotal - totalPaid)
isPastDue     = order.due_date < today (midnight boundary)

statusKey priority order:
  1. overdue  → balanceDue > 0 AND isPastDue
  2. paid     → balanceDue === 0
  3. partial  → payments.length > 0 AND balanceDue > 0
  4. pending  → default
```

**Overdue threshold:** 1 day past the due date (midnight boundary). Not user-configurable.

**Overpaid:** `totalPaid > grandTotal` → `isOverpaid = true`. Hero shows `₹0`, Payments sub-label shows `"Overpaid by ₹X"`. Never blocks further payment recording.

---

## 6. COMPONENT SPECS

### 6.1 DetailHeader

**File:** [`DetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/DetailHeader.tsx)

| Element | Spec |
|---|---|
| Background | `t.colors.surface` |
| Bottom border | `1px t.colors.borderSubtle` |
| Padding | `paddingHorizontal: 16`, `paddingVertical: 12` |
| Left | `ArrowLeft` 22px `t.colors.ink`, `strokeWidth: 2.2`, `hitSlop: 10` |
| Center — Title | `Entry #[bill_number]` · `t.fontFamily.displaySemiBold` · `fontSize: 17` · `t.colors.ink` · `lineHeight: 22` |
| Center — Subtitle | Entry creation date (via `formatDate`) · `t.fontFamily.body` · `fontSize: 13` · `t.colors.muted` · `lineHeight: 18` |
| Right | `MoreVertical` 22px `t.colors.ink`, `strokeWidth: 2.2` · `42×42px` rounded pill · opens `OverflowMenu` |

---

### 6.2 OverflowMenu (⋮)

**File:** [`OverflowMenu.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/OverflowMenu.tsx)

- React Native `Modal`, `animationType="fade"`, `transparent`
- Backdrop: full-screen `t.colors.surfaceOverlay` — tap dismisses menu
- Card: `w-52` (208px) absolute `right: 16px top: 56px` · `rounded-xl` · `backgroundColor: t.colors.surface` · `borderColor: t.colors.borderDefault` · `borderWidth: 1` · `elevation: 10` · `shadowOpacity: 0.40`
- Items rendered via `FlatList` with `ItemSeparatorComponent` (1px `t.colors.borderSubtle` between **every** item)
- Item row: `h-12 px-4 gap-2` flex-row · icon `16px` in `20px` container (via `React.cloneElement`) · label `t.fontFamily.bodyMedium` · `fontSize: 16`

**Menu Items (in order):**

| # | Key | Label | Icon | Colour |
|---|---|---|---|---|
| 1 | `edit-entry` | Edit Entry | `Pencil` | `t.colors.body` |
| 2 | `share-invoice` | Share Invoice | `Share2` | `t.colors.body` |
| 3 | `view-customer` | View Customer | `User` | `t.colors.body` |
| 4 | `print` | Print | `Printer` | `t.colors.body` (shows "coming soon" toast) |
| 5 | `mark-as-paid` | Mark as Paid | `CheckCircle` | `t.colors.paid` — **hidden when `statusKey === "paid"`** |
| 6 | `delete-entry` | Delete Entry | `Trash` | `t.colors.error` — always visible |

> Colour for `mark-as-paid` and `delete-entry` are hard-keyed in `OverflowMenu.tsx` via `item.key` check, not the `color` prop.

---

### 6.3 EntryCustomerCard

**File:** [`EntryCustomerCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryCustomerCard.tsx)

| Element | Spec |
|---|---|
| Container | `mx-4 mb-4 rounded-xl` · `backgroundColor: t.colors.surface` · `elevation: 3` · `shadowOpacity: 0.08` |
| Pressable | Entire card tappable → Customer Detail screen · `pressed` state dims to `t.colors.borderSubtle` bg |
| Avatar | `w-11 h-11 rounded-full` · `bg: t.colors.primaryBorderFill` · initials `t.fontFamily.display` · `color: t.colors.primaryActive` · `fontSize: 16` |
| Name | `t.fontFamily.bodySemiBold` · `fontSize: 16` · `t.colors.ink` · `lineHeight: 24` · `numberOfLines: 1` |
| Phone | `t.fontFamily.body` · `fontSize: 12` · `t.colors.muted` · `lineHeight: 16` · pre-formatted as `+91 XXXXX XXXXX` (strips non-digits, strips leading `91`) |
| Call button | `w-10 h-10 rounded-full` · `bg: t.colors.primaryBorderFill` · `Phone` icon 16px `t.colors.primaryActive` · opens `tel:` URL |
| Chat button | `w-10 h-10 rounded-full` · `bg: t.colors.primaryBorderFill` · `MessageCircle` icon 16px `t.colors.primaryActive` · opens `https://wa.me/91{phone}` |
| **Deleted customer** | Name → `"[Deleted Customer]"` in `t.typeStyles.caption` `t.colors.faint` · call/chat buttons hidden · card tap disabled |

Phone formatting is done in `useEntryDetail.ts` via `phoneFormatted` (not inside the component).

---

### 6.4 EntryHeroCard

**File:** [`EntryHeroCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryHeroCard.tsx)

| Element | Spec |
|---|---|
| Container | `LinearGradient` · `mx-4 mb-4` · `borderRadius: 20` · `px-6 py-6` · `elevation: 8` · `shadowOpacity: 0.20` |
| Gradient direction | `start: {x:0, y:0}` → `end: {x:1, y:0}` (horizontal left→right) |
| Gradient colours | See status table in §3 |
| Animated blob | `160×160px` circle · `top: -10`, `right: -58` · `rgba(255,255,255,0.15)` · slow breathing scale animation (4s repeat, 1.0→1.08, via Reanimated) |
| Row 1 — Label | `"BALANCE DUE"` · `color: #ffffff` · `fontSize: 12` · `fontWeight: "600"` · uppercase · `letterSpacing: t.letterSpacing.label` |
| Row 2 — Amount | `formatINR(balanceDue)` · `t.fontFamily.displayExtraBold` · `fontSize: 40` · `color: #ffffff` · `lineHeight: 40` · `pb-4` |
| Row 3 separator | `1px rgba(255,255,255,0.20)` top border · `pt-4` |
| Status badge pill | `rgba(255,255,255,0.20)` bg · `rounded-full px-3 py-1` · animated pulsing opacity (1.5s, 1.0→0.6, Reanimated) |
| Badge icon | Paid → `CheckCircle2` 13px · Overdue → `Clock3` 13px · Other → `8×8px` circle `rgba(255,255,255,0.9)` |
| Badge label | displayStatus string · `color: #ffffff` · `fontSize: 12` · `fontWeight: "600"` · `letterSpacing: 0.6` |
| Due date label | Right-aligned · `color: #ffffff` · `opacity: 0.9` · `fontSize: 14` · `fontWeight: "500"` · **hidden when `statusKey === "paid"`** |
| Due date format | Past due: `"X day(s) ago"` · Future/today: `"Due [Mon DD, YYYY]"` (en-US locale) |

**displayStatus mapping:**
- `"pending"` → `"Pending"`
- `"partial"` → `"Partial"` _(not "Partially Paid")_
- `"paid"` → `"Paid"`
- `"overdue"` → `"Overdue"`

---

### 6.5 EntryPaymentsSection

**File:** [`EntryPaymentsSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryPaymentsSection.tsx)

| Element | Spec |
|---|---|
| Container | `mx-4 mb-4 p-5 gap-4 rounded-xl` · `backgroundColor: t.colors.surface` · `elevation: 2` · `shadowOpacity: 0.04` |
| Section label | `"PAYMENTS"` · uppercase · `fontSize: 12` · `fontWeight: "700"` · `t.colors.muted` · `letterSpacing: t.letterSpacing.micro` |
| Sub-label (normal) | `"Paid ₹X of ₹Y"` · `t.typeStyles.caption` · `t.colors.muted` · `lineHeight: 20` |
| Sub-label (overpaid) | `"Overpaid by ₹X"` · `t.typeStyles.caption` · `t.colors.advance` · `lineHeight: 20` |
| Progress bar track | `height: 4` · `backgroundColor: t.colors.borderDefault` · `rounded-full` · `overflow: hidden` |
| Progress bar fill | Animated width (1000ms `Easing.out(Easing.exp)`) · `backgroundColor: t.colors.primary` · `rounded-full` |
| 0% pip | When `progress === 0`: `4×4px` dot at left edge · `backgroundColor: t.colors.primary` |

**Payment Row:**

| Element | Spec |
|---|---|
| Layout | `flex-row items-center justify-between py-4` · `1px t.colors.borderSubtle` bottom border between rows (not on last) |
| Payment mode icon | `h-11 w-11 rounded-full items-center justify-center` · coloured circle per mode |
| Mode name | `t.colors.ink` · `fontSize: 16` · `fontWeight: "500"` |
| Date label | `t.colors.muted` · `fontSize: 12` · `fontWeight: "500"` · `"Today"` or `"DD MMM"` |
| Amount | `MoneyAmount` component · `fontSize: 18` · `t.fontFamily.bodyBold` · coloured by mode accent · `showPlusForPositive` |

**Payment mode colour map:**

| Mode | Circle bg | Accent colour | Icon |
|---|---|---|---|
| Cash | `paidSurface` | `paid` | `Banknote` |
| UPI | `advanceSurface` | `advance` | `QrCode` |
| NEFT | `partialSurface` | `partial` | `Landmark` |
| Cheque | `pendingSurface` | `pending` | `ReceiptText` |
| Other | `borderSubtle` | `muted` | `Ellipsis` |

**Empty State:** `Wallet` icon 20px · `h-11 w-11 rounded-full bg-borderSubtle` container · `"No payments recorded yet"` `t.typeStyles.caption` `t.colors.faint` · `py-6` total vertical padding.

Payment rows are **not tappable** in v1. No edit/delete on individual payments.

---

### 6.6 EntryItemsSection

**File:** [`EntryItemsSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryItemsSection.tsx)

| Element | Spec |
|---|---|
| Container | `mx-4 mb-6 rounded-xl` · `bg: t.colors.surface` · `borderWidth: 1 t.colors.borderDefault` |
| **Default (Collapsed)** | Header row only |
| Package icon container | `h-11 w-11 rounded-xl bg: t.colors.surfaceRaised` · `Package` icon 20px `t.colors.body` |
| Count label | `"N item(s)"` · `t.colors.ink` · `fontSize: 16` · `fontWeight: "600"` |
| Subtotal label | `"₹[itemsSubtotal] total"` · `t.colors.muted` · `fontSize: 12` · `fontWeight: "600"` |
| Chevron | `ChevronDown` / `ChevronUp` 20px `t.colors.muted` |
| **Auto-expand rule** | `items.length === 1` → expanded by default, header not pressable |

**Expanded Content (inside `px-4 pb-4`):**

| Row | Spec |
|---|---|
| Item Name | `t.colors.ink` · `fontSize: 15` · `fontWeight: "600"` · `numberOfLines: 1` |
| Qty × Rate | `t.colors.muted` · `fontSize: 13` · `fontWeight: "500"` |
| Item Amount | `t.colors.ink` · `fontSize: 16` · `fontWeight: "700"` |
| Item divider | `1px t.colors.borderSubtle` below each item row |
| Subtotal row | `"Subtotal"` `t.colors.muted` 14px · `₹X` `t.colors.ink` 14px semibold |
| GST row | `"GST (X%)"` `t.colors.muted` 14px · `₹X` `t.colors.ink` 14px semibold · **only shown if `order.tax_percent > 0`** |
| Loading Charge row | `"Loading Charge"` `t.colors.muted` 14px · `₹X` `t.colors.ink` 14px semibold · **only shown if `order.loading_charge > 0`** |
| Previous Balance row | `"Previous Balance"` · `t.colors.overdue` both label and value · **only shown if `order.previous_balance > 0`** |
| Divider before grand total | `1px t.colors.borderSubtle` · `my-3` |
| Grand Total row | `"Grand Total"` `t.colors.ink` 16px bold · `₹X` `t.colors.ink` 17px bold |
| Status badge on Grand Total | `rounded-full px-2 py-0.5` · `fontSize: 10` bold uppercase · colours from `statusStyle` map |

> **IMPORTANT:** Items card always shows **pre-tax subtotal** in the collapsed header, NOT the grand total. Grand total appears only inside the expanded view.

---

### 6.7 EntryStickyBar

**File:** [`EntryStickyBar.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryStickyBar.tsx)

- Position: `absolute bottom: 0 left: 0 right: 0`
- Background: `t.colors.surface`
- Top border: `1px t.colors.borderSubtle`
- Padding: `paddingHorizontal: 16`, `paddingTop: 12`, `paddingBottom: Math.max(Math.min(insets.bottom, 12), 4)` (inset capped to 12px)
- Shadow: upward `shadowOffset: {width:0, height:-3}` · `shadowOpacity: 0.05` · `elevation: 8`
- `ScrollView` bottom padding set to `100` to avoid content hidden behind bar

| Status | Primary CTA | Secondary CTA |
|---|---|---|
| Pending | `Record Payment` — `Wallet` 18px · solid `t.colors.primary` · `h-48` `rounded-full` · flex-1 | `Remind` — `Bell` 18px · outline `t.colors.borderDefault` · `w-128` `rounded-full` |
| Partial | Same as Pending | Same as Pending |
| Overdue | Same as Pending | `Remind` — `Bell` `t.colors.overdue` · outline `t.colors.overdueBorder` · text `t.colors.overdue` |
| Paid | `Share Receipt` — `Send` 18px · solid `t.colors.primary` · full width (`flex: 1`) | — (no secondary) |

Primary button shadow: `shadowColor: t.colors.primary` · `shadowOffset: {0, 4}` · `shadowOpacity: 0.30` · `elevation: 4`

> **Record Payment is never disabled**, even on a PAID entry (overpayment correction use case). Only the `initialAmount` prop is pre-filled with `balanceDue` when opened from "Mark as Paid".

---

## 7. MODAL & SHEET SPECS

### 7.1 RecordCustomerPaymentModal (P5)

**File:** [`RecordCustomerPaymentModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/RecordCustomerPaymentModal.tsx)  
**Triggered by:** "Record Payment" in Sticky Bar, or "Mark as Paid" in overflow.  
**Mechanism:** `ref`-based bottom sheet (`modalRef.current?.present()`).

Props passed from `[orderId].tsx`:
- `orderId` — for API call
- `balanceDue` — for display
- `customerId`, `customerName` — for display
- `initialAmount={balanceDue}` — pre-filled amount field

On success: calls `handlePaymentSuccess(amountPaid)` → triggers `PaymentSuccessAnimation`.

---

### 7.2 DeleteEntryModal (P4)

**File:** [`DeleteEntryModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/modals/DeleteEntryModal.tsx)  
**Triggered by:** "Delete Entry" in overflow menu.  
**Mechanism:** React Native `Modal` · `animationType="fade"` · `transparent`

| Element | Spec |
|---|---|
| Overlay | `t.colors.surfaceOverlay` full-screen · tap dismisses |
| Card | `w-80 p-6 rounded-2xl` · centered · `t.colors.surface` · `elevation: 10` · `shadowOpacity: 0.15` |
| Icon | `Trash` 24px `t.colors.overdueText` · `w-14 h-14 rounded-full bg-overdueSurface` · `mb-4` |
| Title | `"Delete Entry?"` · `t.fontFamily.display` · `fontSize: 18` · `t.colors.ink` · centered |
| Body | `"Entry #[bill_number] and all its payment records will be permanently deleted."` · `t.fontFamily.body` · `fontSize: 14` · `t.colors.muted` · centered · `mb-6` |
| Delete btn | `"Delete Permanently"` · `h-12 rounded-xl bg-overdue` · `#ffffff` text · `t.fontFamily.bodySemiBold` |
| Cancel btn | `"Cancel"` · `h-12 rounded-xl bg-surfaceRaised` · `t.colors.ink` text · `t.fontFamily.bodyMedium` |

> After confirmed delete: invalidates `orderKeys.all`, `dashboard`, and `customerDetail` query keys → navigates back.

---

### 7.3 RemindCustomerSheet (P3)

**File:** [`RemindCustomerSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/sheets/RemindCustomerSheet.tsx)  
**Triggered by:** "Remind" CTA in Sticky Bar.  
**Mechanism:** `BaseBottomSheet` · `withScroll: false` · `enableDynamicSizing: true`

| Element | Spec |
|---|---|
| Title | `"Remind [customerName]"` · `t.fontFamily.display` · `fontSize: 18` · `t.colors.ink` · centered |
| Subtitle | `"Select how to send the payment reminder"` · `t.fontFamily.body` · `fontSize: 16` · `t.colors.muted` · centered |
| WhatsApp option | `bg: t.colors.primarySurface` · `border: t.colors.primaryBorder` · `rounded-xl p-4` · `MessageCircle` icon `t.colors.primary` in `t.colors.primaryBorderFill` circle · `ChevronRight` · opens pre-filled wa.me URL |
| SMS option | `bg: t.colors.partialSurface` · `border: t.colors.partialBorder` · `rounded-xl p-4` · `MessageSquare` icon `t.colors.partialText` in `t.colors.partialBorder` circle · `ChevronRight` · opens native `sms:` URL |
| Cancel | Centered text · `t.fontFamily.bodyMedium` · `t.colors.muted` |

**Reminder message template** (built by `buildEntryShareMessage`):
> `"Hi [Name], your payment of ₹[amount] for Invoice #[ID] is due. Please pay at your earliest convenience."` — respects `i18n.language` (en/hi). Not editable in v1.

**iOS SMS scheme:** `sms:+91{phone}&body={msg}`  
**Android SMS scheme:** `sms:+91{phone}?body={msg}`

---

### 7.4 PaymentSuccessAnimation (P6)

**File:** [`PaymentSuccessAnimation.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/feedback/PaymentSuccessAnimation.tsx)  
**Triggered by:** `handlePaymentSuccess()` after a successful payment is recorded.

- Fullscreen `Modal` · `transparent` · `animationType="none"` (animation is JS-driven)
- Background: `white/95` light mode, `slate-950/95` dark mode
- **Sequence (parallel):**
  - Background fade-in (350ms)
  - Central `96×96px` green circle spring-scale in (delay 100ms, friction 6, tension 40)
  - `Check` 48px white checkmark spring-scale in (delay 300ms)
  - Text fade-in (delay 500ms, 400ms duration)
  - Ring 1 pulse-expand (delay 200ms, scale 0.5→2.2, opacity 0.4→0, 900ms)
  - Ring 2 pulse-expand (delay 400ms, same spec)
- **Auto-dismiss:** 2300ms after start → fade-out 350ms → `onAnimationEnd()` callback
- `onAnimationEnd` invalidates 5 query keys: `orderKeys.all`, `orderKeys.detail`, `payments`, `customerDetail`, `dashboard`
- **Haptics:** `Haptics.notificationAsync(NotificationFeedbackType.Success)` on trigger

> The `justPaid=true` URL param (set by `RecordCustomerPaymentModal` on success) also re-triggers this animation when navigating back to the detail screen.

---

## 8. DATA LAYER

**All data fetched in:** [`useEntryDetail.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/entries/useEntryDetail.ts)

| Data | Source hook | Query key |
|---|---|---|
| Order details + items | `useOrderDetail(orderId)` | `orderKeys.detail(orderId)` |
| Payments | `usePayments(orderId, profile.id)` | `["payments", orderId]` |
| Auth profile | `useAuthStore()` | Zustand (MMKV-persisted) |

**Offline behaviour:** React Query with MMKV persistence. Mutations queue when offline via `syncQueue`. Do not remove queue behaviour.

**Computed values:**

```ts
sortedPayments   = payments sorted by payment_date ASC
paymentRows      = sortedPayments.map(p => ({ payment: p, remaining: runningBalance }))
itemsSubtotal    = sum(item.subtotal)
taxAmount        = round((itemsSubtotal * tax_percent / 100) * 100) / 100
grandTotal       = order.total_amount + order.previous_balance
balanceDue       = max(0, grandTotal - totalPaid)
isOverpaid       = totalPaid > grandTotal
```

---

## 9. EDIT ENTRY SCREEN (P7A)

**File:** [`edit.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId]/edit.tsx)  
**Route:** `/(main)/entries/[orderId]/edit`  
**Triggered by:** "Edit Entry" in ⋮ overflow menu.

### Layout (top to bottom)

```
SafeAreaView (canvas bg)
  ├── Stack.Screen (headerShown: false)
  ├── DetailHeader
  │     title: "Edit Entry [bill_number]"
  │     subtitle: "Edited N times"  (order.edit_count)
  ├── KeyboardAvoidingView
  │   └── ScrollView
  │         ├── EditWarningBanner
  │         ├── EditCustomerCard       ← locked, no change allowed
  │         ├── Due Date section       ← preset chips + DatePickerSheet
  │         ├── Note field             ← collapsible, optional
  │         ├── EditItemizedSection    ← items, quick-amount, Add Item modal
  │         ├── OrderSummary           ← loading charge, GST inputs
  │         ├── EntrySummaryCard       ← previous balance (hidden if previousBalance ≤ 0)
  │         └── BillFooter             ← grand total display
  │         └── Save button
  ├── DatePickerSheet                  ← sibling (outside scroll), for custom due date
  └── SaveEntryBottomSheet             ← triggered by Save button
```

### Sub-component specs

#### EditWarningBanner
**File:** [`EditWarningBanner.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditWarningBanner.tsx)  
- `bg: t.colors.pendingSurface` · `borderLeftWidth: 4` `borderLeftColor: t.colors.pending`
- `AlertCircle` 20px `t.colors.pending` · message `fontSize: 13` `lineHeight: 18` `t.colors.ink`
- Default message: `"Editing will update the person's ledger and payment history"`

#### EditCustomerCard
**File:** [`EditCustomerCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditCustomerCard.tsx)  
- Customer locked — cannot be changed during edit
- Shows avatar (initials), name, phone, lock icon on right

#### Due Date Section (in `edit.tsx`)
- **Preset chips:** `Today`, `7 Days`, `15 Days`, `30 Days`, `Custom [date]`
- Selected chip: `bg: t.colors.primary` · `text: t.colors.onPrimary`
- Unselected: `bg: t.colors.surfaceRaised` · `text: t.colors.body`
- `Custom` chip opens `DatePickerSheet` (calendar grid bottom sheet)
- Preset is reverse-derived from stored `due_date` vs `created_at` diff on load

#### Note Field
- Optional, collapsible (toggles on tap)
- Expands when order already has a note on load

#### EditItemizedSection
**File:** [`EditItemizedSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditItemizedSection.tsx)  
- Shows existing items with quantity/rate inputs and red trash icon per row
- "Add Item" button opens an in-screen modal (`isAddItemModalOpen`)
- Item name has autocomplete from `AsyncStorage` cache (last 50 unique names)
- Quick-amount mode: single numeric input when entry has no itemized lines

#### EntrySummaryCard
**File:** [`EntrySummaryCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EntrySummaryCard.tsx)  
- **Hidden when `previousBalance ≤ 0`** (returns `null`)
- Shows: Previous Balance · New Total · divider · Total Outstanding (in `t.colors.overdue`)

#### OrderSummary
**File:** [`OrderSummary.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/OrderSummary.tsx)  
- Editable Loading Charge and GST % inputs

#### BillFooter
**File:** [`BillFooter.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/BillFooter.tsx)  
- Displays calculated grand total

### Dirty-state tracking (`isFormDirty`)
The Save button only enables when the form has changes:
- Itemized mode: items changed, loading charge changed, GST changed, note changed, due date changed
- Quick-amount mode: amount changed, items added, note changed, due date changed

### Save flow
1. Save button → `setSaveSheetVisible(true)` → `SaveEntryBottomSheet` appears
2. `"Save Only"` → `handleSave(false)` → API call → navigate back
3. `"Save & Share PDF"` → `handleSave(true)` → API call → `generateBillPdf` → `Sharing.shareAsync`

### Code notes
- Grand Total colour: `t.colors.ink` (`#111827` light) — **NOT red**
- Customer locked during edit: only name/phone shown, no navigation
- Item names pre-fill from `order.items[idx].product_name` on load

---

## 10. SAVE CONFIRMATION BOTTOM SHEET (P7B)

**File:** [`SaveEntryBottomSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/SaveEntryBottomSheet.tsx)  
**Mechanism:** `BaseBottomSheet` · `withScroll: false` · `enableDynamicSizing: true`

| Element | Spec |
|---|---|
| Title | `"Save Entry [billNumber]?"` · `t.fontFamily.display` · `fontSize: 18` · `t.colors.ink` · centered |
| Subtitle | `"Financial ledger will be updated immediately."` · `t.fontFamily.body` · `fontSize: 16` · `t.colors.muted` · centered |
| Btn 1 (Primary) | `"Save & Share PDF"` · `Share2` 18px · `h-[52px] rounded-full` · `bg: t.colors.primaryActive` · white text |
| Btn 2 (Secondary) | `"Save Only"` · `h-[52px] rounded-full` · `border: 1px t.colors.primaryActive` · `bg: t.colors.surface` · `text: t.colors.primaryActive` |
| Cancel | Centered text · `t.fontFamily.bodySemiBold` · `t.colors.muted` |

---

## 11. DATE PICKER SHEET

**File:** [`DateRangePicker.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/ui/DateRangePicker.tsx)  
**Export:** `DatePickerSheet` (also `DateRangePicker` default export for filter use)

**Architecture:** `BottomSheetModal` (from `@gorhom/bottom-sheet`) · standalone ref · no nesting inside `BaseBottomSheet` · `snapPoints={["71%"]}` · `enableDynamicSizing={false}`

**Used in:** `edit.tsx` (due date) and `create.tsx` (due date)

| Element | Spec |
|---|---|
| Header | Title prop + `✕` close button |
| Month navigator | `ChevronLeft` · `"[Month] [Year]"` `t.fontFamily.displaySemiBold` · `ChevronRight` |
| Weekday row | Mon–Sun (Monday-first) · `t.fontFamily.bodyMedium` · `t.colors.muted` · `fontSize: 12` |
| Day cell | `38×38px rounded-full` |
| Selected day | `bg: t.colors.primary` · text `t.colors.onPrimary` `t.fontFamily.bodyBold` |
| Today (unselected) | `border: 1.5px t.colors.primary` |
| Other-month days | `t.colors.faint` (dimmed) |
| Disabled days | `opacity: 0.25` · not pressable (outside minDate/maxDate) |
| Grid layout | 7 columns × 6 rows = 42 cells always (pads with prev/next month days) |
| Monday-first | `startDayOfWeek = (getDay() === 0) ? 6 : getDay() - 1` |
| Confirm button | Full-width · `bg: t.colors.primary` · `t.colors.onPrimary` · `borderRadius: t.radius.lg` · `py-3.5` |
| Bottom padding | `Math.max(insets.bottom, 24) + t.spacing[4]` |

---

## 12. STATE MATRIX

| Component | PENDING 🟠 | PARTIAL 🔵 | PAID 🟢 | OVERDUE 🔴 |
|---|---|---|---|---|
| Hero gradient | `pending`→`pendingText` | `partial`→`partialText` | `paid`→`primaryActive` | `overdue`→`overdueText` |
| Hero amount | `balanceDue` | `balanceDue` (remaining) | `₹0.00` | `balanceDue` |
| Status badge | White dot · "Pending" | White dot · "Partial" | `CheckCircle2` · "Paid" | `Clock3` · "Overdue" |
| Due date line | `"Due [date]"` | `"Due [date]"` | **Hidden** | `"X day(s) ago"` |
| Payments card | Empty state | Has rows + progress | All rows + 100% bar | Empty or has rows |
| Progress bar | 4px pip at left | Proportional fill | Full width | Pip or fill |
| Payments sub-label | `"Paid ₹0 of ₹X"` | `"Paid ₹Y of ₹X"` | `"Paid ₹X of ₹X"` | `"Paid ₹0 of ₹X"` |
| Items card | Collapsed (subtotal) | Collapsed (subtotal) | Collapsed (subtotal) | Collapsed (subtotal) |
| ⋮ Overflow | 6 items (incl. Mark as Paid) | 6 items | 5 items (Mark as Paid hidden) | 6 items |
| Sticky Bar Primary | Record Payment | Record Payment | Share Receipt (full width) | Record Payment |
| Sticky Bar Secondary | Remind (neutral) | Remind (neutral) | — | Remind (red outline) |
| Success animation | — | — | Only if `justPaid=true` or after recording | — |
| State priority | Default | Overridden by Overdue | Terminal | Wins over Partial |

---

## 13. LINKED SCREENS (Entry Detail Flow)

| ID | Screen | Trigger | Status | File |
|---|---|---|---|---|
| P0 | Entry Detail — PENDING | Entry list tap | ✅ BUILT & LIVE | [`[orderId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId].tsx) |
| P1 | Items card expanded | Items row tap | ✅ BUILT & LIVE | `EntryItemsSection.tsx` |
| P2 | ⋮ Overflow menu | ⋮ header icon | ✅ BUILT & LIVE | `OverflowMenu.tsx` |
| P3 | Remind bottom sheet | "Remind" CTA | ✅ BUILT & LIVE | `RemindCustomerSheet.tsx` |
| P4 | Delete confirm modal | "Delete Entry" | ✅ BUILT & LIVE | `DeleteEntryModal.tsx` |
| P5 | Record Payment sheet | "Record Payment" / "Mark as Paid" | ✅ BUILT & LIVE | `RecordCustomerPaymentModal.tsx` |
| P6 | Post-payment success overlay | Payment saved | ✅ BUILT & LIVE | `PaymentSuccessAnimation.tsx` |
| P7A | Edit Entry form | "Edit Entry" | ✅ BUILT & LIVE | [`edit.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId]/edit.tsx) |
| P7B | Save confirmation sheet | "Save" on Edit | ✅ BUILT & LIVE | `SaveEntryBottomSheet.tsx` |
| P8 | Entry Detail — OVERDUE | State-driven | ✅ BUILT & LIVE | same as P0 |
| P9 | Entry Detail — PARTIAL | State-driven | ✅ BUILT & LIVE | same as P0 |
| P10 | Entry Detail — PAID | State-driven | ✅ BUILT & LIVE | same as P0 |

---

## 14. COMPONENT FILE MAP

| Component | Purpose | File |
|---|---|---|
| Entry Detail (Container) | Screen root, data orchestration | [`app/(main)/entries/[orderId].tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId].tsx) |
| useEntryDetail | All data + state + handlers | [`src/hooks/entries/useEntryDetail.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/entries/useEntryDetail.ts) |
| Edit Entry (Container) | Edit screen root | [`app/(main)/entries/[orderId]/edit.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId]/edit.tsx) |
| DetailHeader | Top nav bar with overflow | [`src/components/layer2/DetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/DetailHeader.tsx) |
| OverflowMenu | ⋮ dropdown menu | [`src/components/layer2/OverflowMenu.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/OverflowMenu.tsx) |
| EntryCustomerCard | Customer identity + actions | [`src/components/entries/detail/EntryCustomerCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryCustomerCard.tsx) |
| EntryHeroCard | Amount + status gradient | [`src/components/entries/detail/EntryHeroCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryHeroCard.tsx) |
| EntryPaymentsSection | Payment history + progress bar | [`src/components/entries/detail/EntryPaymentsSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryPaymentsSection.tsx) |
| EntryItemsSection | Itemized breakdown (collapsible) | [`src/components/entries/detail/EntryItemsSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryItemsSection.tsx) |
| EntryStickyBar | Sticky bottom action bar | [`src/components/entries/detail/EntryStickyBar.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/detail/EntryStickyBar.tsx) |
| DeleteEntryModal | Destructive confirm modal | [`src/components/entries/modals/DeleteEntryModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/modals/DeleteEntryModal.tsx) |
| RemindCustomerSheet | WhatsApp / SMS channel picker | [`src/components/entries/sheets/RemindCustomerSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/sheets/RemindCustomerSheet.tsx) |
| SaveEntryBottomSheet | Save / save & share confirmation | [`src/components/entries/edit/SaveEntryBottomSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/SaveEntryBottomSheet.tsx) |
| EditWarningBanner | Amber warning on edit screen | [`src/components/entries/edit/EditWarningBanner.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditWarningBanner.tsx) |
| EditCustomerCard | Locked customer row on edit | [`src/components/entries/edit/EditCustomerCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditCustomerCard.tsx) |
| EditItemizedSection | Editable items list | [`src/components/entries/edit/EditItemizedSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditItemizedSection.tsx) |
| EntrySummaryCard | Previous balance summary | [`src/components/entries/edit/EntrySummaryCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EntrySummaryCard.tsx) |
| RecordCustomerPaymentModal | Payment recording sheet | [`src/components/people/RecordCustomerPaymentModal.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/people/RecordCustomerPaymentModal.tsx) |
| PaymentSuccessAnimation | Full-screen payment success | [`src/components/feedback/PaymentSuccessAnimation.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/feedback/PaymentSuccessAnimation.tsx) |
| DatePickerSheet | Calendar grid date picker | [`src/components/ui/DateRangePicker.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/ui/DateRangePicker.tsx) |
| OrderSummary | Loading charge + GST inputs | [`src/components/orders/OrderSummary.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/OrderSummary.tsx) |
| BillFooter | Grand total display | [`src/components/orders/BillFooter.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/BillFooter.tsx) |
| BaseBottomSheet | Reusable bottom sheet wrapper | [`src/components/layer2/BaseBottomSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/BaseBottomSheet.tsx) |
| Theme | All design tokens | [`src/theme/theme.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/theme/theme.ts) |

---

## 15. ENTRIES INDEX (barrel export)

**File:** [`src/components/entries/index.ts`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/index.ts)

```
src/components/entries/
  ├── detail/
  │     EntryCustomerCard.tsx
  │     EntryHeroCard.tsx
  │     EntryItemsSection.tsx
  │     EntryPaymentsSection.tsx
  │     EntryStickyBar.tsx
  ├── edit/
  │     EditCustomerCard.tsx
  │     EditItemizedSection.tsx
  │     EditWarningBanner.tsx
  │     EntrySummaryCard.tsx
  │     SaveEntryBottomSheet.tsx
  ├── modals/
  │     DeleteEntryModal.tsx
  ├── sheets/
  │     RemindCustomerSheet.tsx
  └── index.ts
```

---

## 16. WHAT CHANGED AND WHY (Decision Log)

| Old | New | Reason |
|---|---|---|
| Customer card below Quick Actions | Customer card at TOP | WHO before HOW MUCH |
| QuickActionTile for Edit/Delete/Remind | ⋮ header overflow for Edit/Delete; Remind in Action Bar | Admin actions are rare; Remind is frequent |
| Overflow Actions Row between cards | Removed entirely | ⋮ is single overflow entry point |
| Items card above Payments | Items card below Payments, collapsed | Payment status is primary need |
| Two equal-weight CTAs | One dominant CTA + ghost secondary | Reduces cognitive load |
| No due date on hero | Due date / overdue line on hero | Critical context at a glance |
| Blue avatar on Edit Entry | Green avatar system | Brand consistency |
| Save modal as native Alert | Bottom sheet P7B | Matches design language |
| Remind → direct WhatsApp | Remind → bottom sheet P3 with channel picker | Options + consistent bottom sheet pattern |
| Mark as Paid → unknown | Opens P5 pre-filled with full balance | Consistent payment flow |
| Items card shows grand total | Items card shows **subtotal** in collapsed state | Subtotal = what was sold; grand total includes tax/charges |
| Scroll-wheel date picker | Grid calendar bottom sheet | Avoids gesture conflicts in bottom sheets |
| Payment success as toast | Full-screen animated overlay (2.3s → auto dismiss) | Premium, GPay/PhonePe-level feedback |
| Grand Total red on Edit Entry | `t.colors.ink` (dark text) | Red was misleading (not an error state) |
| `EntrySummaryCard` always visible | Hidden when `previousBalance ≤ 0` | Avoids redundant "₹0 Previous Balance" noise |
| Overflow width 180px (old doc) | 208px (`w-52` Tailwind) | Confirmed from source code |
| Divider between item groups only | Divider between **every** item | Intentional cleaner separation |
| `EntryQuickActions` component | **Dead code — must not render** | Edit/Delete → overflow, Remind → Action Bar |
| Hardcoded hex tokens in doc | Semantic `t.colors.*` token table | Doc must match runtime theme system |

---

## 17. OPEN QUESTIONS — ALL RESOLVED

| Question | Resolution |
|---|---|
| Items card collapsed by default? | ✅ Yes. Auto-expand if `items.length === 1`. |
| Remind → modal or direct WhatsApp? | ✅ Bottom sheet P3 with WhatsApp + SMS channels. |
| Overdue threshold? | ✅ 1 day past due date (midnight). Not a setting. |
| Payment rows tappable? | ✅ Not tappable in v1. Revisit v2. |
| Mark as Paid behaviour? | ✅ Opens P5 pre-filled with full `balanceDue`. |
| Save button on Edit Entry? | ✅ Opens P7B Save confirmation sheet. |
| Overflow entry point? | ✅ Header ⋮ only. No text row. |
| Delete Entry placement? | ✅ Overflow only. No inline delete. |
| Payment success feedback? | ✅ Full-screen overlay (2.3s auto-dismiss) + haptics. |
| P6 vs P10 — separate screen? | ✅ No. Same screen; animation triggered by `justPaid` param. |
| Grand Total colour on Edit Entry? | ✅ `t.colors.ink` (not red). |
| Entry Timeline on detail screen? | ✅ No — not in v1 or v2 for this screen. |
| OVERDUE + partial payments — which wins? | ✅ OVERDUE wins. Past-due overrides PARTIAL. |
| PARTIAL trigger — automatic or manual? | ✅ Automatic. First recorded payment with `balanceDue > 0` = PARTIAL. |
| Overpayment handling? | ✅ Hero shows `₹0`, Payments sub-label shows `"Overpaid by ₹X"`. Never block recording. |
| Deleted customer on entry? | ✅ `"[Deleted Customer]"`, hide action icons, disable card tap. |
| Mark as Paid visibility on PAID entry? | ✅ Hidden from overflow when `statusKey === "paid"`. |
| Remind message content? | ✅ Built by `buildEntryShareMessage` util, respects i18n (en/hi). Not editable in v1. |
| Record Payment disabled on PAID? | ✅ Never disabled. Overpayment = valid data correction. |
| Max payment rows shown? | ✅ All rows. No pagination in v1. |
| `EntrySummaryCard` when `previousBalance === 0`? | ✅ Returns `null` — component is not rendered. |
| Overflow item order? | ✅ Edit → Share → View Customer → Print → Mark as Paid → Delete. |
| Overflow card width? | ✅ `w-52` = 208px (Tailwind). |
| Overflow overlay? | ✅ `t.colors.surfaceOverlay` (full screen flex-1, no opacity modifier). |
| Divider between all items or groups? | ✅ Every item via `ItemSeparatorComponent`. |
| Date picker approach? | ✅ Custom grid calendar (no scroll-wheel) inside `BottomSheetModal`. |
| `EntryQuickActions` fate? | ✅ Dead code. Must not render. Edit/Delete → overflow. Remind → Action Bar. |

---

## 15. NAVIGATION CONTRACT

### Navigates FROM (entry points into this screen)

| Source screen | Trigger | Params received |
|---|---|---|
| Entry List (`entries/index.tsx`) | Tap any entry row | `orderId`, `customerId` |
| Customer Detail (`people/[customerId].tsx`) | Tap entry in timeline | `orderId`, `customerId` |
| Dashboard activity feed | Tap overdue entry | `orderId`, `customerId` |
| Record Payment success | Auto-redirect after payment | `orderId`, `customerId` |

### Navigates TO (exits from this screen)

| Destination | Trigger | Params passed |
|---|---|---|
| Edit Entry (`entries/[orderId]/edit.tsx`) | Overflow → Edit Entry | `orderId` |
| Customer Detail (`people/[customerId].tsx`) | Tap Customer Card | `customerId` |
| Record Payment sheet (P5) | Action Bar → Record Payment | `orderId`, `balance`, `customerId` |
| Record Payment sheet (P5) | Overflow → Mark as Paid | `orderId`, `balance`, `customerId`, `prefillFull: true` |
| Remind sheet (P3) | Action Bar → Remind | `orderId`, `customerId` |
| Delete modal (P4) | Overflow → Delete Entry | `orderId` |
| Native share sheet | Overflow → Share Invoice | PDF blob |
| Native print dialog | Overflow → Print | PDF blob |

### Back navigation
- Back arrow → `router.back()`.
- If navigating here post-create, pop to Entry List — not to Create Entry.
- Android hardware back = same as back arrow.
