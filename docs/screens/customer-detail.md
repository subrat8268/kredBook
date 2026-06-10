# Customer Detail Screen — Full UX Redesign Spec

> **Status:** 🟢 Stitch-ready. All open questions resolved. Awaiting Stitch screen generation.
> **Last updated:** 2026-06-10
> **Doc version:** 2.1 (all open questions locked)
> **Route:** `app/(main)/people/[customerId].tsx`

---

## 1. SCREEN PURPOSE

The **Customer Detail screen is the most visited screen in KredBook.** A shopkeeper opens this screen multiple times per day — when a customer walks in, calls, or when the owner wants to check outstanding dues at end of day. It serves three jobs:

1. **Status at a glance** — How much does this person owe me? Since when? Am I in trouble here?
2. **Collect or remind** — Record a payment right now, or send a reminder with one tap.
3. **Audit trail** — What did I sell? What has been paid? What's still open?

Everything else is secondary.

---

## 2. RETHINKING FROM SCRATCH — WHAT THE CURRENT SCREEN GETS WRONG

### Current Problems

| Problem | Why It Matters |
|---|---|
| Quick Actions row (Add Entry · Share · PDF) sits between Hero and Timeline | These are secondary admin actions. They break the visual flow from balance → collect |
| Sticky Collect Bar only appears when `balance_due > 0` | A settled customer should still have an option to start a new entry — the bar disappears entirely |
| Transaction Timeline tabs (All · Entries · Payments) require a tap to filter | Most owners want to see "Entries" first — open dues are the primary concern, not a mix of everything |
| No urgency signal anywhere on the page for overdue entries | An entry 45 days overdue looks the same as one created yesterday |
| "Last bill: [date]" sub-label on hero is passive | Owners need to know HOW LONG money has been owed, not just the last bill date |
| PDF / Share actions are buried in Quick Actions | These are admin tasks. They should be in an overflow menu, not the primary screen flow |
| No entry-level aging on the timeline rows | Each transaction row doesn't tell you "this is 22 days old" — owners need that urgency signal inline |
| Payment rows are not tappable — no view detail | If an owner disputes a recorded payment, they have no way to see or delete it |
| Empty state is too generic | First-time view for a new customer with no entries should guide the owner toward creating the first entry, not just show a blank state |

### The Correct Mental Model Order

```
1. WHO      → Customer identity + contact actions
2. HOW MUCH → Net balance, status, since how long
3. ACT NOW  → Collect payment or add new entry — always visible
4. HISTORY  → Timeline of what happened — entries and payments
5. ADMIN    → Share, PDF, edit customer — overflow only
```

---

## 3. PLATFORM & CANVAS SPEC

> Apply to every Stitch prompt in this flow.

- **Platform:** Android & iOS, React Native / Expo SDK 52
- **Target device:** `390×844pt`
- **Style:** Clean, minimal, trust-first. PhonePe / Razorpay / Khatabook aesthetic.
- **Font:** Inter throughout.
- **Canvas bg:** `t.colors.canvas` → `#fafaf7` light / `#0f1117` dark
- **Icons:** Lucide React Native, `strokeWidth: 2`, `20–24px` default.
- **Cards:** `bg: t.colors.surface`, `border: 1px solid t.colors.borderDefault`, `borderRadius: 16px`, `16px` horizontal screen margin, `12px` gap between cards.
- **No tab bar** on this screen.
- **Safe area:** top + left + right only.

### Design Token Reference

| Token | `t.colors.*` key | Light | Dark | Usage |
|---|---|---|---|---|
| Canvas | `canvas` | `#fafaf7` | `#0f1117` | Screen background |
| Surface | `surface` | `#ffffff` | `#1a1d23` | Cards, sheets |
| Surface Raised | `surfaceRaised` | `#f9fafb` | `#21242c` | Inset / secondary areas |
| Border | `borderDefault` | `#e5e7eb` | `#374151` | Card borders |
| Divider | `borderSubtle` | `#f3f4f6` | `#1f2937` | Row separators |
| Text Primary | `ink` | `#111827` | `#f9fafb` | Names, amounts |
| Text Secondary | `muted` | `#6b7280` | `#9ca3af` | Labels, timestamps |
| Text Faint | `subtle` | `#9ca3af` | `#6b7280` | Tertiary hints |
| Brand Green | `primary` | `#16a34a` | `#22c55e` | CTAs, positive |
| Green Light bg | `primarySubtle` | `#dcfce7` | `#14532d` | Payment icons, chips |
| Danger | `danger` | `#ef4444` | `#f87171` | Overdue signals |
| Warning | `warning` | `#f59e0b` | `#fbbf24` | Pending signals |
| Blue | `info` | `#3b82f6` | `#60a5fa` | Advance state |

### Hero Card Gradients (by balance state)

| State | Gradient Start | Gradient End | Trigger |
|---|---|---|---|
| Overdue | `#991B1B` | `#B91C1C` | Any entry past due date |
| Pending | `#F59E0B` | `#B45309` | Balance > 0, no overdue entry |
| Advance | `#3B82F6` | `#1D4ED8` | Customer paid more than owed |
| Settled | `#166534` | `#052E16` | Balance = 0, no open entries |

---

## 4. INFORMATION HIERARCHY (New — Top → Bottom)

```
SafeAreaView (canvas bg)
  ├── [C1] CustomerDetailHeader        ← WHO: back + avatar + name + contact actions
  ├── ScrollView
  │     ├── [C2] CustomerBalanceHero   ← HOW MUCH: amount + status + aging + open entries count
  │     ├── [C3] CustomerActionStrip   ← ACT NOW: Collect Payment + Add Entry (always visible, inline)
  │     └── [C4] CustomerTransactionTimeline
  │             ├── [C4a] SectionHeader  (date group label)
  │             ├── [C4b] EntryRow       (per entry — with aging badge + status)
  │             └── [C4c] PaymentRow     (per payment — tappable, view-only in v1)
  │             └── [C4d] EmptyState     (first-time or filtered empty)
  └── [M1] RecordCustomerPaymentModal  ← bottom sheet, offscreen until triggered
  └── [M2] CustomerOverflowMenu        ← dropdown from header ⋮ icon
  └── [M3] PaymentDetailSheet          ← view recorded payment (v1: view only, delete in v2)
```

### What Changed in the Hierarchy

| Old Position | Component | New Position | Reason |
|---|---|---|---|
| Between Hero and Timeline | `CustomerQuickActionsRow` (Add · Share · PDF) | Removed from main flow | Admin actions, not daily tasks |
| Below Hero | `CustomerStickyCollectBar` | Replaced by `CustomerActionStrip` inline after Hero | Always visible, not floating |
| Header (right side) | Share + PDF icons | Moved to `⋮` overflow | Header = nav + contact only |
| None | Aging signal on Hero | `"Overdue · 22 days"` sub-label added | Critical missing context |
| None | Aging badge on Entry rows | `"12d overdue"` chip on each entry row | Urgency at item level |
| None | Open entries count on Hero | `"2 open entries · ₹18,000 due"` line | Owner sees how many are pending |

---

## 5. COMPONENT SPECS

### [C1] CustomerDetailHeader
**File:** `src/components/people/customer-detail/CustomerDetailHeader.tsx`

**Purpose:** Confirm identity, go back, communicate.

- **Left:** ← back arrow (`t.colors.ink`) + `44×44dp` circular avatar (initials, `bg: t.colors.primarySubtle`, `color: t.colors.primary`, `Inter 15px/700`).
- **Center:**
  - Name: `Inter 17px/600 t.colors.ink`
  - Subtitle: `"₹[balance] due"` when balance > 0, or `"All settled"` when balance = 0, or `"₹[amount] advance"` when advance — `Inter 13px/400 t.colors.muted`. **This replaces the passive "Last active [X]" sub-label.**
- **Right:** `⋮` overflow icon (`24px t.colors.ink`) + Phone icon + WhatsApp icon.
  - Phone + WhatsApp: only rendered when customer has a valid phone number.
  - Both: `44dp` touch target, `t.colors.primary`.
  - `⋮` icon: opens `CustomerOverflowMenu` (M2).
- **bg:** `t.colors.surface`, no bottom shadow.

**Decision:** Header subtitle now shows live balance state, not passive last-active timestamp. Owner gets context the instant the screen opens.

---

### [C2] CustomerBalanceHero
**File:** `src/components/people/customer-detail/CustomerBalanceHero.tsx`

**Purpose:** The single most important number on the screen.

**Visual Spec:**
- Full-width card, `borderRadius: 20px`, no border.
- Status-driven `LinearGradient` background (see token table).
- Large semi-transparent circle watermark (decorative, absolute bottom-right, white `15%` opacity).

**Content (top → bottom):**

| Row | Content | Typography |
|---|---|---|
| Label | `"BALANCE DUE"` / `"ADVANCE"` / `"ALL SETTLED"` | `Inter 11px/600 white uppercase letter-spacing: 1.4` |
| Amount | `formatINR(netBalance)` | `Inter 40px/800 white` |
| Status row | Status badge (left) + aging label (right) | See below |
| Open entries | `"N open entr[y/ies] · ₹X due"` (only when `pendingOrderBalance > 0`) | `Inter 13px/400 white 75% opacity` |

**Status Badge (pill, inside hero):**
- Background: `rgba(255,255,255,0.20)`, `borderRadius: full`.
- Text: status label — `Inter 12px/700 white`.
- Overdue state: adds inline `AlertCircle` icon `16px white` before text.

**Aging Label (right of status row):**

> **✅ LOCKED — Q1:** When multiple overdue entries exist, always show **oldest overdue days** (worst-case exposure is what drives action).

- Overdue: `"Overdue · [X] days"` where X = `oldestOverdueDays` — `Inter 13px/400 white 75% opacity`.
- Pending (due date exists): `"Due [date]"` where date = `nearestDueDate` — same style.
- Pending (no due date): hidden.
- Settled / Advance: hidden.

**Decision:** "Last bill: [date]" sub-label removed. Replaced by aging signal. An owner doesn't need to know *when* the last bill was — they need to know *how long money has been waiting.*

---

### [C3] CustomerActionStrip *(new component, replaces StickyCollectBar + Quick Actions row)*
**File:** `src/components/people/customer-detail/CustomerActionStrip.tsx`

**Purpose:** Single always-visible strip for the two most frequent actions: collect money and add a new entry.

**Layout:** Full-width, below Hero card, `bg: t.colors.surface`, `borderRadius: 16px`, `border: 1px solid t.colors.borderDefault`, `padding: 14px 16px`.

**Always shows two buttons side-by-side:**

| Button | State: Has Balance | State: Settled / Advance |
|---|---|---|
| Primary (60% width) | `"Collect Payment"` — solid green `t.colors.primary`, white text `Inter 15px/600`, `ArrowDownLeft` icon, `borderRadius: full`, `height: 52px` | `"Record Payment"` — same style, slightly muted (owner can still record an advance) |
| Secondary (36% width) | `"+ Add Entry"` — outline `border: 1px t.colors.borderDefault`, `color: t.colors.ink Inter 14px/500`, `Plus` icon, `borderRadius: full`, `height: 52px` | `"+ Add Entry"` — same |

**Gap between buttons:** `10px`.

**Haptics:** `Haptics.impactAsync(Medium)` on Collect Payment press.

> **✅ LOCKED — Q2:** `"+ Add Entry"` **always pre-selects the customer automatically.** Navigation passes `customer` (JSON object) + `customerId` so the Create Entry screen skips the customer picker entirely. Coming from a specific customer's screen, context is already known.

> **✅ LOCKED — Q4:** `"Collect Payment"` button is **green always** (`t.colors.primary`). Never red-tinted even in Overdue state. Red on a CTA reads as error/blocked — urgency is already communicated by the red hero gradient and `"Overdue · X days"` aging label.

**Decision:** The old `CustomerStickyCollectBar` only appeared when `balance_due > 0`, hiding itself completely for settled customers. This broke the Add Entry flow for settled customers. The new `CustomerActionStrip` is **always visible, always inline** — no floating overlay, no conditional visibility.

**Decision:** Share, PDF, and Edit Customer actions are removed from this strip entirely and moved to `⋮` overflow.

---

### [C4] CustomerTransactionTimeline
**File:** `src/components/people/customer-detail/CustomerTransactionTimeline.tsx`

**Purpose:** Chronological record of everything that has happened with this customer.

**Default view:** Show all transactions (entries + payments), most recent first, grouped by date.

#### [C4a] Section Header (date group label)
- `"Today"`, `"Yesterday"`, `"[Day], [Date]"` (e.g. `"Mon, 02 Jun 2026"`).
- `Inter 12px/600 t.colors.muted uppercase letter-spacing: 1.2`.
- `paddingHorizontal: 16px`, `paddingVertical: 8px`.
- No card/border — plain label.

#### Filter Tabs (above timeline, below Action Strip)
- `All` · `Entries` · `Payments` — horizontal scroll chips.
- Selected: `bg: t.colors.primary`, white text `Inter 13px/600`.
- Unselected: `bg: t.colors.surfaceRaised`, `t.colors.muted Inter 13px/400`.
- `borderRadius: full`, `paddingH: 14px`, `paddingV: 7px`.
- **Default selected tab: `"All"`** (not Entries — showing full picture is the right default).

#### [C4b] Entry Row
**File:** `src/components/people/customer-detail/CustomerTransactionRow.tsx`

- **Left icon:** `32×32px` circle. Color by status: Pending `bg: #fef3c7 icon: #f59e0b`, Partial `bg: #eff6ff icon: #3b82f6`, Paid `bg: #dcfce7 icon: #16a34a`, Overdue `bg: #fee2e2 icon: #ef4444`. Icon: `FileText`.
- **Title:** `"Entry #[bill_number]"` — `Inter 14px/600 t.colors.ink`.
- **Subtitle:** `"[N] item[s] · [time]"` — `Inter 13px/400 t.colors.muted`.
- **Status badge:** `StatusBadge` component, inline right of title.
- **Aging badge (NEW):** Shown only for PENDING / PARTIAL / OVERDUE entries.
  - Overdue: `bg: #fee2e2`, `color: #ef4444`, label `"[N]d overdue"` `Inter 11px/600`.
  - Pending: `bg: #fef3c7`, `color: #d97706`, label `"Due [date]"` `Inter 11px/600`. Hidden if no due date.
  - `borderRadius: full`, `paddingH: 8px`, `paddingV: 3px`.
- **Right:** Amount `Inter 15px/600 t.colors.danger` for unpaid, `t.colors.primary` for paid.

> **✅ LOCKED — Q5:** **Running balance shown on every timeline row.** `"Bal: ₹X"` `Inter 12px/400 t.colors.muted` below the amount. Shopkeepers use this to verify hand-counted totals — it's one of the highest-trust features in the timeline.

- **Tap:** → Entry Detail screen (`entries/[orderId].tsx`), pass `orderId`, `customerId`.

#### [C4c] Payment Row
**File:** `src/components/people/customer-detail/CustomerTransactionRow.tsx`

- **Left icon:** `32×32px` circle, `bg: t.colors.primarySubtle`, `ArrowDownLeft` icon `t.colors.primary`.
- **Title:** `"Payment Received"` — `Inter 14px/600 t.colors.ink`.
- **Subtitle:** `"[Method] · [time]"` (e.g. `"UPI · 10:30 am"`) — `Inter 13px/400 t.colors.muted`.
- **Right:** Amount `Inter 15px/600 t.colors.primary` + running balance `"Bal: ₹X"` below.
- **Tap:** Opens `PaymentDetailSheet` (M3) — view details.

> **✅ LOCKED — Q3:** **v1: view only.** No delete in v1. Delete reserved for v2 after observing usage patterns. `"Delete Payment"` button exists in sheet UI but is greyed out with `"Coming soon"` tooltip.

- **No status badge** on payment rows.

#### [C4d] Empty State
**File:** `src/components/people/customer-detail/CustomerDetailEmptyState.tsx`

**Two variants:**

1. **No transactions ever (new customer):**
   - Illustration: ledger / book icon `48px t.colors.muted`.
   - Title: `"No entries yet"` `Inter 16px/600 t.colors.ink`.
   - Sub: `"Add the first entry to start tracking this person's balance"` `Inter 14px/400 t.colors.muted`, centered.
   - CTA: `"+ Add First Entry"` — green outline button.
   - *This is the most important empty state in the app. New onboarding users land here.*

2. **Filtered empty (e.g. Payments tab, no payments recorded):**
   - Title: `"No [entries / payments] yet"` `Inter 15px/600 t.colors.ink`.
   - Sub: `"Nothing to show for this filter"` — `Inter 14px/400 t.colors.muted`.
   - No CTA.

#### Pagination
- First **15 rows** shown (increased from 10 — 10 was too few for active customers).
- `"View [N] older records →"` pressable below last row — loads all remaining rows.
- No infinite scroll in v1 — avoids nested `ScrollView` virtualization conflicts in RN.

---

### [M1] RecordCustomerPaymentModal
**File:** `src/components/people/RecordCustomerPaymentModal.tsx`

> Use the **built version**. Do not redesign.

- **Trigger:** `"Collect Payment"` in `CustomerActionStrip` (C3).
- **Pre-fills:** Customer name, outstanding balance (single entry mode when coming from sticky bar on a specific entry, full customer balance when from action strip).
- **On save:** Closes modal, refreshes timeline, shows success banner.

**Success banner (after save):**
- Inline banner at top of scroll content, below header.
- `bg: t.colors.primarySubtle`, `borderRadius: 12px`, `padding: 12px 16px`.
- `check-circle` icon `t.colors.primary` + `"Payment of ₹[amount] recorded"` `Inter 14px/600 t.colors.primary`.
- Auto-dismiss after `3s` or on scroll.

---

### [M2] CustomerOverflowMenu (⋮ header tap)
**File:** `src/components/people/customer-detail/CustomerOverflowMenu.tsx`

**Triggered by:** `⋮` icon in header.

**Visual spec:**
- Dropdown from top-right, below header.
- `bg: t.colors.surface`, `borderRadius: 12px`, `shadow-lg`, `width: 200px`.
- Overlay: `rgba(0,0,0,0.20)` dims screen.
- Item height: `44px`, `paddingH: 16px`, `Inter 14px/500`.
- Icon: `20px` Lucide stroke, `8px` gap.
- `1px t.colors.borderSubtle` divider between groups.

| # | Label | Icon | Color | Action |
|---|---|---|---|---|
| 1 | Share Ledger | `share-2` | `t.colors.ink` | `upsert_access_token` → native share sheet |
| 2 | PDF Statement | `download` | `t.colors.ink` | `buildStatementHtml` → print dialog. Disabled if no transactions. |
| — | divider | — | — | — |
| 3 | Edit Customer | `pencil` | `t.colors.ink` | Navigate to Edit Customer screen |
| — | divider | — | — | — |
| 4 | Delete Customer | `trash-2` | `t.colors.danger` | Delete confirm bottom sheet |

**Decision:** Share and PDF removed from the Quick Actions row and placed here. These are low-frequency admin tasks — they don't belong in the primary screen flow.

---

### [M3] PaymentDetailSheet *(v1: view only)*
**File:** `src/components/people/customer-detail/PaymentDetailSheet.tsx`

**Triggered by:** Tapping a Payment row in the timeline.

**Visual spec:**
- Bottom sheet, `height: auto` (not full screen), `bg: t.colors.surface`, `borderRadius: 20px` top-only.
- Handle pill: `40×4px #d1d5db`, centered top.
- `padding: 20px`.

**Content:**

| Row | Content |
|---|---|
| Title | `"Payment Details"` `Inter 17px/600 t.colors.ink` |
| Amount | `formatINR(amount)` `Inter 32px/700 t.colors.primary` |
| Method | `"Paid via [Cash / UPI / Cheque / Bank Transfer]"` `Inter 14px/400 t.colors.muted` |
| Date | `"[Full date + time]"` `Inter 14px/400 t.colors.muted` |
| Note | `"Note: [note]"` — only if note exists |
| Linked Entry | `"Entry #[bill_number]"` link → tappable to navigate. Only if payment is linked to a specific entry. |

**Actions (bottom of sheet):**
- `"Close"` — plain text button, centered, `Inter 15px/500 t.colors.muted`.
- `"Delete Payment"` — `Inter 14px/500 t.colors.danger`, below Close. *(v1: disabled, greyed out, tooltip: "Coming soon").*

---

## 6. STATE MATRIX

| Component | Overdue | Pending | Partial | Settled | Advance |
|---|---|---|---|---|---|
| Hero gradient | Red | Amber | Amber | Dark green | Blue |
| Hero label | `BALANCE DUE` | `BALANCE DUE` | `BALANCE DUE` | `ALL SETTLED` | `ADVANCE` |
| Hero aging | `"Overdue · X days"` (oldest) | `"Due [date]"` (nearest) or hidden | `"Due [date]"` or hidden | hidden | hidden |
| Status badge | Red `AlertCircle` + `"Overdue"` | Amber `"Pending"` | Blue `"Partial"` | Green `"Settled"` | Blue `"Advance"` |
| Open entries line | `"N entries · ₹X overdue"` | `"N entries · ₹X due"` | `"N entries · ₹X due"` | hidden | hidden |
| Header subtitle | `"₹X due"` | `"₹X due"` | `"₹X due"` | `"All settled"` | `"₹X advance"` |
| Action Strip Primary | `"Collect Payment"` green (never red) | `"Collect Payment"` | `"Collect Payment"` | `"Record Payment"` (muted) | `"Record Payment"` |
| Action Strip Secondary | `"+ Add Entry"` (pre-selects customer) | `"+ Add Entry"` (pre-selects) | `"+ Add Entry"` (pre-selects) | `"+ Add Entry"` (pre-selects) | `"+ Add Entry"` (pre-selects) |
| Entry row aging badge | `"[N]d overdue"` red | `"Due [date]"` amber | Mixed per entry | — | — |
| Timeline running balance | ✅ shown every row | ✅ shown every row | ✅ shown every row | ✅ shown every row | ✅ shown every row |
| Success banner | — | — | — | shown if `justPaid=true` | shown if `justPaid=true` |

---

## 7. NAVIGATION CONTRACT

### Navigates FROM

| Source | Trigger | Params received |
|---|---|---|
| Customer List (`people/index.tsx`) | Tap customer card | `customerId` |
| Dashboard | Tap activity item or hero collect | `customerId` |
| Entry Detail | Tap customer name / View Customer | `customerId` |
| Record Payment success | Auto-redirect after payment | `customerId`, `justPaid=true` |

### Navigates TO

| Destination | Trigger | Params passed |
|---|---|---|
| Entry Detail (`entries/[orderId].tsx`) | Tap entry row | `orderId`, `customerId` |
| Create Entry (`entries/create.tsx`) | `"+ Add Entry"` in Action Strip | `customer` (JSON), `customerId` *(pre-selected, customer picker skipped)* |
| Record Payment modal (M1) | `"Collect Payment"` | `customerId`, `customerName`, `balanceDue` |
| System dialer | Phone icon in header | customer phone |
| WhatsApp | `MessageCircle` icon in header | pre-filled reminder message |
| `⋮` overflow menu (M2) | `⋮` header icon | — |
| Edit Customer | M2 → Edit Customer | `customerId` |
| Delete confirm sheet | M2 → Delete Customer | `customerId` |

### Back Navigation
- ← back arrow → `router.back()`.
- Android hardware back → same.

---

## 8. LINKED STITCH SCREENS

| # | Screen | Triggered by | Status |
|---|---|---|---|
| CD-0 | Customer Detail — Overdue state | State-driven | 🔴 Needs design |
| CD-1 | Customer Detail — Pending state | State-driven | 🔴 Needs design |
| CD-2 | Customer Detail — Settled state | State-driven | 🔴 Needs design |
| CD-3 | Customer Detail — Advance state | State-driven | 🔴 Needs design |
| CD-4 | Customer Detail — Empty state (new customer) | First visit | 🔴 Needs design |
| CD-5 | `⋮` Overflow menu open | `⋮` header icon | 🔴 Needs design |
| CD-6 | Payment Detail Sheet (M3) | Payment row tap | 🔴 Needs design |
| CD-7 | Record Payment success banner | `justPaid=true` | 🔴 Needs design |

> **Build order:** CD-0 (Overdue) is the most emotionally charged state — design this first as the canonical base. Then CD-1, CD-2, CD-3, CD-4 as deltas.

---

## 9. COMPONENT FILE MAP

| Component | File | Status |
|---|---|---|
| Screen route | `app/(main)/people/[customerId].tsx` | Exists — needs update |
| CustomerDetailHeader | `src/components/people/customer-detail/CustomerDetailHeader.tsx` | Exists — needs subtitle update |
| CustomerBalanceHero | `src/components/people/customer-detail/CustomerBalanceHero.tsx` | Exists — needs aging line |
| CustomerActionStrip *(new)* | `src/components/people/customer-detail/CustomerActionStrip.tsx` | 🔴 New file |
| CustomerTransactionTimeline | `src/components/people/customer-detail/CustomerTransactionTimeline.tsx` | Exists — pagination update |
| CustomerTransactionTabs | `src/components/people/customer-detail/CustomerTransactionTabs.tsx` | Exists — default tab update |
| CustomerTransactionRow | `src/components/people/customer-detail/CustomerTransactionRow.tsx` | Exists — aging badge + running balance |
| CustomerDetailEmptyState | `src/components/people/customer-detail/CustomerDetailEmptyState.tsx` | Exists — two variants needed |
| RecordCustomerPaymentModal | `src/components/people/RecordCustomerPaymentModal.tsx` | Exists — use as-is |
| CustomerOverflowMenu *(new)* | `src/components/people/customer-detail/CustomerOverflowMenu.tsx` | 🔴 New file |
| PaymentDetailSheet *(new)* | `src/components/people/customer-detail/PaymentDetailSheet.tsx` | 🔴 New file (v1: view only) |
| CustomerStickyCollectBar | `src/components/people/customer-detail/CustomerStickyCollectBar.tsx` | 🗑️ Delete — replaced by CustomerActionStrip |
| CustomerQuickActionsRow | `src/components/people/customer-detail/CustomerQuickActionsRow.tsx` | 🗑️ Delete — actions moved to overflow + action strip |
| Data hook | `src/hooks/usePeople.ts` → `usePersonDetail` | Exists — add 4 new computed fields |
| API layer | `src/api/people.ts` → `fetchPersonDetail` | Exists — no change needed |

---

## 10. DATA REQUIREMENTS

### New fields needed from `usePersonDetail` hook

| Field | Type | Purpose | Computed from |
|---|---|---|---|
| `oldestOverdueDays` | `number \| null` | Aging label on hero: `"Overdue · X days"` *(oldest overdue — worst case)* | `entries` — find overdue entries, calc max days past due |
| `nearestDueDate` | `Date \| null` | Aging label on hero: `"Due [date]"` for pending entries | `entries` — find earliest upcoming due date |
| `openEntriesCount` | `number` | `"N open entries · ₹X due"` line on hero | `entries` filter by non-paid status |
| `balanceState` | `'overdue' \| 'pending' \| 'partial' \| 'settled' \| 'advance'` | Drives hero gradient + status badge + action strip variant | Computed from `netBalance` + `entries` |

> All 4 fields are computable client-side from `entries` data already fetched. **No new RPC or API call needed.**

---

## 11. EDGE CASES

| Case | Behaviour |
|---|---|
| Customer has no phone number | Phone + WhatsApp icons hidden in header. No crash, no empty placeholder. |
| Customer has phone but it already has `+91` prefix | Strip existing prefix before rendering — prevent `+91 +91` duplication bug. |
| Customer has 0 transactions | Show CD-4 empty state. Action strip still visible. |
| All entries are paid, balance = 0 | `"All settled"` hero, no aging line, action strip shows `"Record Payment"` (muted). |
| Advance (customer paid more than owed) | Blue hero, `"ADVANCE"` label, amount shown as advance credit. Action strip shows `"Record Payment"`. |
| Very long customer name (`> 20 chars`) | Header center: truncate at `1` line with `...`. Full name visible on Customer Profile. |
| Network error loading timeline | Show skeleton rows (3 rows) with shimmer. `"Tap to retry"` button below. |
| `justPaid=true` on arrive | Show success banner for `3s` then auto-dismiss. Hero should reflect updated balance immediately. |
| Empty Payments tab filter | Show variant 2 empty state: `"No payments yet"` with no CTA. |
| PDF disabled (no transactions) | `"PDF Statement"` in overflow is greyed out with tooltip `"Add entries first"`. |
| Multiple overdue entries exist | Show `oldestOverdueDays` on hero (worst-case). All overdue entry rows show their own individual aging badges. |

---

## 12. WHAT CHANGED AND WHY (Full Decision Log)

| Old | New | Reason |
|---|---|---|
| `CustomerQuickActionsRow` (Add · Share · PDF) between Hero and Timeline | Removed from main flow | Admin tasks, not daily actions. Broke visual flow from balance → collect. |
| Share + PDF icons in header | Moved to `⋮` overflow menu | Header = navigation + communication only. Admin actions in overflow. |
| `CustomerStickyCollectBar` (floating, conditional) | Replaced by `CustomerActionStrip` (inline, always visible) | Floating bar disappeared for settled customers. Add Entry became inaccessible. |
| Header subtitle: `"Last active [X]"` | `"₹X due"` / `"All settled"` / `"₹X advance"` | Passive timestamp vs live financial state. Owners need the number, not the date. |
| Hero sub-label: `"Last bill: [date]"` | Aging label: `"Overdue · X days"` or `"Due [date]"` | Owners need urgency context, not last activity date. |
| No open entries count on hero | `"N open entries · ₹X due"` line added | Owner needs to know depth of exposure, not just total balance. |
| No aging badge on timeline rows | `"[N]d overdue"` / `"Due [date]"` chip per entry row | Urgency at item level — owner can see which specific entry is overdue. |
| Payment rows not tappable | Tap opens `PaymentDetailSheet` (view only v1) | Owners dispute recorded payments and need to verify details. |
| 10 rows paginated | 15 rows before expand trigger | 10 rows was too few for customers with frequent transactions. |
| Default timeline tab: `"All"` | Kept as `"All"` | Full picture is the right default. Filtering is opt-in. |
| `CustomerStickyCollectBar` file | Deleted, replaced by `CustomerActionStrip` | Cleaner architecture, no conditional visibility logic. |
| Blue avatar color on some screens | Green avatar system: `bg: primarySubtle, color: primary` | Consistency across all screens. |
| `background`, `textPrimary`, `surfaceAlt` old tokens | `canvas`, `ink`, `surfaceRaised` aligned tokens | Token alignment: all components use the same aliases. |
| `"+ Add Entry"` navigated to blank Create Entry form | Pre-selects current customer automatically | Coming from a specific customer's screen — context is already known. |
| Hero aging used most-recent overdue | Hero aging uses **oldest** overdue days | Worst-case is the number that drives action. |
| Payment delete in v1 | View only in v1, delete deferred to v2 | Irreversible action — build usage confidence first. |
| Collect Payment had red tint option in Overdue | Green always | Red CTA = error state. Urgency is the hero's job. |
| Running balance on timeline rows was uncertain | Running balance always shown | Shopkeepers verify hand-counted totals — highest-trust detail in timeline. |

---

## 13. OPEN QUESTIONS — ✅ ALL RESOLVED

All 5 questions resolved on **2026-06-10**. No blockers for Stitch.

| # | Question | ✅ Decision | Rationale |
|---|---|---|---|
| 1 | Which aging to show on hero when multiple overdue entries? | **Oldest overdue days** | Worst-case drives action |
| 2 | Should `"+ Add Entry"` pre-select customer? | **Yes, always** | Context is already established |
| 3 | PaymentDetailSheet delete in v1? | **v1: view only, delete in v2** | Irreversible — build confidence first |
| 4 | Collect Payment red tint in Overdue state? | **Green always** | Red = error; urgency belongs on hero |
| 5 | Show running balance on timeline? | **Yes, keep it** | Shopkeepers verify hand-totals |
