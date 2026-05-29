# Entry Detail Screen — Design Spec

> **Status:** Design-first. All screens must be approved in Stitch before coding begins.
> **Last updated:** 2026-05-29

---

## 1. SCREEN PURPOSE

The Entry Detail screen is the source of truth for a single transaction. It is designed for business owners to instantly understand the status of an entry (who owes them, how much, and since when), take the most critical next action (record a payment or remind a customer), and review the transaction history and details if needed.

---

## 2. USER MENTAL MODEL

The screen is structured to follow a business owner's thought process when reviewing an entry:

1. **WHO** is this transaction with? (Customer Card)
2. **HOW MUCH** is owed, and what's the status? (Hero Card)
3. **WHAT HAPPENED** since the entry was created? (Payments Card)
4. **DETAILS** of what was sold. (Items Card)

---

## 3. INFORMATION HIERARCHY (Top → Bottom)

1. **Header Bar** — Navigation context (Entry ID, date, back arrow).
2. **Customer Card** — WHO. Always at the top.
3. **Hero Card** — HOW MUCH. Status-driven gradient.
4. **Overflow Actions Row** — Edit · Delete. Subtle, below hero.
5. **Payments Card** — WHAT HAPPENED. Promoted above Items.
6. **Items Card** — DETAILS. Collapsed by default.
7. **Action Bar** — Sticky bottom CTA.

---

## 4. COMPONENT SPECS

### Header Bar
- **Purpose:** Clear identification and back navigation.
- **Title:** `Entry #[bill_number]` — `Inter 17px/600`
- **Subtitle:** Entry creation date — `Inter 13px/400`, `#9ca3af`
- **No tab bar** on this screen. It is a detail screen, not a root screen.
- **Decision:** Call button removed from header. All customer actions live on the Customer Card.

---

### Customer Card
- **Purpose:** Immediately identify the customer and provide quick communication actions.
- **Layout:** Full-width card, `flex-row items-center`, `padding: 12px 16px`, `borderRadius: 16px`, `backgroundColor: #ffffff`, `border: 1px solid #e5e7eb`.
- **Avatar (Left):** `44×44px` circle, `bg: #dcfce7`, initials `Inter 15px/700 color: #16a34a`. **This green avatar system must be used consistently across all screens including Edit Entry.**
- **Info (Center):** Name `Inter 15px/600 #111827` above phone `Inter 13px/400 #9ca3af`. Strip existing country code before prepending +91 to prevent `+91 +91` duplication.
- **Actions (Right):** Call icon + WhatsApp icon, both `32×32px` circles, `bg: #dcfce7`.
- **Entire card is tappable** → navigates to Customer Detail screen.
- **Decision:** "View Customer →" text link removed. Whole card is the tap target.

---

### Hero Card
- **Purpose:** Most critical financial number + status at a glance.
- **Layout:** Full-width, status-driven gradient background.
- **Label:** `BALANCE DUE` — `Inter 11px/600`, white, `letter-spacing: 1.2`
- **Amount:** Balance due — `Inter 40px/800`, white
- **Status Badge:** White pill, colored text matching status.
- **Due Date Line:** `Inter 13px/400`, white at 80% opacity.
  - Upcoming: `"Due [date]"`
  - Past due: `"Overdue · X days"`
  - Paid: hidden
- **Gradient by status:**
  - Pending → Orange
  - Partial → Blue
  - Paid → Green
  - Overdue → Red
- **Decision:** Entry ID removed from hero. Already prominent in header.
- **Decision:** Overdue threshold = 1 day past due date (not a business setting for now).

---

### Overflow Actions Row
- **Purpose:** Access to rare, high-consequence administrative actions.
- **Layout:** Simple text row below Hero Card (above Payments).
  - Left: `"Edit entry"` — `Inter 13px/500`, `#374151`
  - Right: `"Delete entry"` — `Inter 13px/500`, `#ef4444`
- **Decision:** Replaced the prominent QuickActionTile component. Edit and Delete are rare and should not compete visually with Record Payment.
- **Overflow menu (⋮) options when tapped:**
  1. Share Invoice → native PDF share sheet
  2. View Customer → Customer Detail screen
  3. Print → native print dialog
  4. Mark as Paid → opens Record Payment sheet (P5) pre-filled with full balance amount
  5. Edit Entry → Edit Entry screen (P7A)
  6. Delete Entry → Delete confirm bottom sheet (P4)

---

### Payments Card
- **Purpose:** Chronological payment history for the entry.
- **Header:** `"PAYMENTS"` label + `"Paid ₹X of ₹Y"` sub-label.
- **Progress Bar:** `4px` tall, `#e5e7eb` track, `#16a34a` fill.
- **Payment Rows:** Vertical list, `1px #f3f4f6` divider. Method/date left, amount/chip right.
- **Empty State:** `32px` wallet icon (`#d1d5db`) + `"No payments recorded yet"`.
- **Decision:** Payment rows are not tappable in v1. No edit/delete on individual payments.

---

### Items Card
- **Purpose:** Itemized breakdown, accessible on demand.
- **Default (Collapsed):** Single row — `"N items · ₹total"` + `chevron-down`. Entire row tappable.
- **Expanded:** Full item list with subtotal and grand total. Icon changes to `chevron-up`.
- **Exception:** Auto-expand if entry has only 1 line item. Collapsing a single row adds friction.
- **Decision:** Collapsed by default. Users open this screen for payment status, not to re-check items.

---

### Action Bar (Sticky Bottom)
- **Purpose:** Single dominant call to action.
- **No tab bar** visible behind or below this bar.
- **State variations:**

| Status | Primary CTA | Secondary CTA |
|---|---|---|
| Pending | `Record Payment` (solid green, Wallet icon) | `Remind` (ghost/outline) |
| Partial | `Record Payment` (solid green, Wallet icon) | `Remind` (ghost/outline) |
| Overdue | `Record Payment` (solid green, Wallet icon) | `Remind` (ghost, urgent styling) |
| Paid | `Share Receipt` (solid green, Send icon) | — |

- **Decision:** "Send Entry" button removed. Replaced by "Remind" as secondary. Sharing is handled via overflow menu.
- **Decision:** Remind → opens Remind bottom sheet (P3) with WhatsApp + SMS options. Does NOT go directly to WhatsApp.

---

## 5. LINKED SCREENS (Entry Detail Flow)

| # | Screen | Triggered by | Status |
|---|---|---|---|
| P0 | Entry Detail — PENDING state | Entry list tap | ✅ Approved |
| P1 | Items card expanded | Items row tap | ✅ Approved |
| P2 | ⋮ Overflow menu | ⋮ icon tap | ✅ Approved |
| P3 | Remind bottom sheet | "Remind" CTA tap | ✅ Approved |
| P4 | Delete confirm bottom sheet | "Delete entry" in overflow | ✅ Approved |
| P5 | Record Payment bottom sheet | "Record Payment" CTA / "Mark as Paid" | ✅ Use built version |
| P6 | Post-payment — PAID state with success banner | Payment saved successfully | ✅ Approved |
| P7A | Edit Entry form | "Edit entry" in overflow | ❌ Redesign needed |
| P7B | Save confirmation bottom sheet | "Save" button on Edit Entry | ❌ New — needs design |
| P8 | Entry Detail — OVERDUE state | (state-driven) | ⏳ Next |
| P9 | Entry Detail — PARTIAL state | (state-driven) | ⏳ After P8 |
| P10 | Entry Detail — PAID state (no banner) | (state-driven, revisit) | ⏳ After P9 |

---

## 6. EDIT ENTRY SCREEN SPEC (P7A)

### Purpose
Allow the business owner to modify the details of an existing entry. Pre-filled with all current values. Customer is locked and cannot be changed.

### Layout
- **No tab bar.** Detail screen only.
- **Header:** `"Edit Entry [bill_number]"` title + `"Edited N times"` subtitle (edit count is a trust/audit signal — keep it).
- **Warning Banner:** Full-width amber banner with ⚠️ icon. Text: `"Editing will update the person's ledger and payment history"`. Left border accent `#f59e0b`.
- **Locked Person Row:** Label `"Person (cannot be changed)"` in `#9ca3af`. Avatar uses **green system** (`bg: #dcfce7`, initials `color: #16a34a`) — NOT blue. Name + phone below.
- **Note Field:** `"+ Add note"` placed inside or directly adjacent to the Itemized Details section, not floating between sections.
- **Itemized Details:** Editable rate/quantity rows with delete (🗑️ red) per row. Subtotal auto-calculated.
- **Totals Section:** Subtotal, Loading Charge (editable), GST % (editable), Tax (calculated), Grand Total.
- **Balance Section:** Previous Balance, New Total, Total Outstanding.
- **Save Button:** Full-width solid green. Icon: ✓ checkmark (NOT share/network icon). Label: `"Save"`.

### Save Button → opens P7B (Save Confirmation Sheet)

---

## 7. SAVE CONFIRMATION BOTTOM SHEET SPEC (P7B)

### Purpose
Intercept the save action to confirm intent and offer PDF sharing in one step.

### Layout
- **Bottom sheet** (not an alert dialog). Consistent with P4 Delete sheet design language.
- **Handle:** Small `4px` pill at top center, `#d1d5db`.
- **Title:** `"Save changes?"` — `Inter 18px/700`, `#111827`
- **Subtitle:** `"This will update the person's ledger and payment history."` — `Inter 14px/400`, `#6b7280`
- **Primary CTA:** Full-width solid green button — `"Save & Share PDF"` with Share icon. Most valuable action for a business owner.
- **Secondary CTA:** Full-width outline button — `"Save Only"` with ✓ icon.
- **Tertiary:** Centered ghost text link — `"Cancel"` in `#9ca3af`.
- **Background:** Edit Entry screen dimmed behind sheet. **Tab bar NOT visible.**

---

## 8. STATE MATRIX

| Component | PENDING | PARTIAL | PAID | OVERDUE |
|---|---|---|---|---|
| Hero Gradient | Orange | Blue | Green | Red |
| Hero Amount | Shows balance | Shows balance | Shows `₹0` | Shows balance |
| Due Date Line | "Due [date]" | "Due [date]" | Hidden | "Overdue · X days" |
| Customer Card | Normal | Normal | Normal | Normal |
| Payments Card | Empty state | Has rows | All rows | Empty or has rows |
| Items Card | Collapsed | Collapsed | Collapsed | Collapsed |
| Overflow Row | Edit · Delete | Edit · Delete | Edit · Delete | Edit · Delete |
| Action Bar (Pri) | Record Payment | Record Payment | Share Receipt | Record Payment |
| Action Bar (Sec) | Remind | Remind | — | Remind (urgent) |

---

## 9. WHAT CHANGED AND WHY

| Old | New | Reason |
|---|---|---|
| Customer card below Quick Actions | Customer card at TOP | WHO before HOW MUCH |
| QuickActionTile for Edit/Delete/Remind | Overflow row + Action bar secondary | Edit/Delete are rare admin tasks; Remind is communication |
| Items card above Payments | Items card below Payments, collapsed | Payment history is the primary need |
| Two equal-weight CTAs (Record Payment + Send Entry) | One dominant CTA + ghost secondary | Single clear action reduces cognitive load |
| No due date on hero | Due date / overdue line on hero | Due date is critical context |
| Entry ID on hero and header | Removed from hero (kept in header) | Removes redundancy |
| Save modal as native Alert dialog | Save confirmation as bottom sheet (P7B) | Matches KredBook design language |
| Blue avatar on Edit Entry locked person | Green avatar system (`#dcfce7` / `#16a34a`) | Consistency across all screens |
| Share icon on Save button | Checkmark ✓ icon | Share icon implies sending, not saving |
| Tab bar visible on Edit Entry | Tab bar removed | Edit Entry is a detail screen, not a root screen |
| "+ Add note" floating between sections | "+ Add note" inside / adjacent to Items section | Clearer grouping, no orphaned elements |
| Remind → direct WhatsApp | Remind → bottom sheet with WhatsApp + SMS | More options, consistent with sheet pattern |
| Mark as Paid → unknown | Mark as Paid → opens P5 pre-filled with full amount | Consistent with payment flow, user can change mode |

---

## 10. OPEN QUESTIONS — RESOLVED

| Question | Resolution |
|---|---|
| Should Items card be collapsed by default? | ✅ Yes, collapsed. Auto-expand if only 1 item. |
| Should Remind open a modal or go directly to WhatsApp? | ✅ Opens bottom sheet (P3) with WhatsApp + SMS options. |
| What is the overdue threshold? | ✅ 1 day past due date. Not a business setting in v1. |
| Should payment rows be tappable? | ✅ Not tappable in v1. No edit/delete on individual payments. |
| Mark as Paid behavior? | ✅ Opens P5 (Record Payment sheet) pre-filled with full balance. |
| Save button behavior on Edit Entry? | ✅ Opens P7B Save confirmation bottom sheet. |
