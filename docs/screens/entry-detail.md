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

1. **Header Bar** — Navigation context (Entry ID, date, back arrow, ⋮ overflow).
2. **Customer Card** — WHO. Always at the top.
3. **Hero Card** — HOW MUCH. Status-driven gradient.
4. **Payments Card** — WHAT HAPPENED. Promoted above Items.
5. **Items Card** — DETAILS. Collapsed by default.
6. **Action Bar** — Sticky bottom CTA.

> **Decision (2026-05-29):** The Overflow Actions Row (Edit · Delete text row below Hero) has been removed. All administrative actions (Edit, Delete, Mark as Paid, Share Invoice, Print, View Customer) are accessed exclusively via the **⋮ header icon**. This keeps the scrollable content area clean and focused on financial information only.

---

## 4. COMPONENT SPECS

### Header Bar
- **Purpose:** Clear identification, back navigation, and access to all administrative actions.
- **Left:** ← back arrow
- **Center:** Title `Entry #[bill_number]` — `Inter 17px/600`. Subtitle: entry creation date — `Inter 13px/400`, `#9ca3af`.
- **Right:** ⋮ overflow icon — opens the Overflow Menu (P2).
- **No tab bar** on this screen. It is a detail screen, not a root screen.
- **Decision:** Call button removed from header. All customer actions live on the Customer Card.

---

### ⋮ Overflow Menu (P2)
Opens as a bottom sheet or dropdown from the header ⋮ icon. Options:
1. Share Invoice → native PDF share sheet
2. View Customer → Customer Detail screen
3. Print → native print dialog
4. Mark as Paid → opens Record Payment sheet (P5) pre-filled with full balance amount
5. Edit Entry → Edit Entry screen (P7A)
6. Delete Entry → Delete confirm bottom sheet (P4)

---

### Customer Card
- **Purpose:** Immediately identify the customer and provide quick communication actions.
- **Layout:** Full-width card, `flex-row items-center`, `padding: 12px 16px`, `borderRadius: 16px`, `backgroundColor: #ffffff`, `border: 1px solid #e5e7eb`.
- **Avatar (Left):** `44×44px` circle, `bg: #dcfce7`, initials `Inter 15px/700 color: #16a34a`. **Green avatar system — consistent across ALL screens including Edit Entry.**
- **Info (Center):** Name `Inter 15px/600 #111827` above phone `Inter 13px/400 #9ca3af`. Strip existing country code before prepending +91 to prevent `+91 +91` duplication.
- **Actions (Right):** Call icon + WhatsApp/chat icon, both `32×32px` circles, `bg: #dcfce7`.
- **Entire card is tappable** → navigates to Customer Detail screen.
- **Decision:** "View Customer →" text link removed. Whole card is the tap target.

---

### Hero Card
- **Purpose:** Most critical financial number + status at a glance.
- **Layout:** Full-width, status-driven gradient background.
- **Label:** `BALANCE DUE` — `Inter 11px/600`, white, `letter-spacing: 1.2`
- **Amount:** Balance due — `Inter 40px/800`, white
- **Status Badge:** White pill, left-aligned, colored dot + status text.
- **Due Date Line:** Right-aligned, `Inter 13px/400`, white at 80% opacity.
  - Upcoming: `"Due: [date]"`
  - Past due: `"Overdue · X days"`
  - Paid: hidden
- **Gradient by status:**
  - Pending → Orange
  - Partial → Blue
  - Paid → Green
  - Overdue → Red
- **Decision:** Entry ID removed from hero. Already prominent in header.
- **Decision:** Overdue threshold = 1 day past due date. Not a business setting in v1.

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
- **Default (Collapsed):** Single row — `"N items · ₹[subtotal] total"` + `chevron-down`. Entire row tappable.
  - ⚠️ Amount shown is **items subtotal**, NOT grand total.
- **Expanded:** Full item list with subtotal and grand total. Icon changes to `chevron-up`.
- **Exception:** Auto-expand if entry has only 1 line item.
- **Decision:** Collapsed by default.

---

### Action Bar (Sticky Bottom)
- **Purpose:** Single dominant call to action.
- **No tab bar** visible behind or below this bar.

| Status | Primary CTA | Secondary CTA |
|---|---|---|
| Pending | `Record Payment` (solid green, wallet icon) | `Remind` (outline) |
| Partial | `Record Payment` (solid green, wallet icon) | `Remind` (outline) |
| Overdue | `Record Payment` (solid green, wallet icon) | `Remind` (outline, urgent — red border) |
| Paid | `Share Receipt` (solid green, send icon) | — |

- **Decision:** Remind → opens Remind bottom sheet (P3) with WhatsApp + SMS options.
- **Decision:** "Send Entry" CTA removed. Sharing is accessed via ⋮ overflow menu.

---

## 5. LINKED SCREENS (Entry Detail Flow)

| # | Screen | Triggered by | Status |
|---|---|---|---|
| P0 | Entry Detail — PENDING state | Entry list tap | ✅ **FINALIZED** |
| P1 | Items card expanded | Items row tap | ✅ Approved |
| P2 | ⋮ Overflow menu | ⋮ icon tap | ✅ Approved |
| P3 | Remind bottom sheet | "Remind" CTA | ✅ Approved |
| P4 | Delete confirm bottom sheet | "Delete Entry" in overflow | ✅ Approved |
| P5 | Record Payment bottom sheet | "Record Payment" / "Mark as Paid" | ✅ Use built version |
| P6 | Post-payment — PAID state + success banner | Payment saved | ✅ Approved |
| P7A | Edit Entry form | "Edit Entry" in overflow | ✅ Approved (minor code notes) |
| P7B | Save confirmation bottom sheet | "Save" on Edit Entry | ⏳ In progress |
| P8 | Entry Detail — OVERDUE state | State-driven | ⏳ Next |
| P9 | Entry Detail — PARTIAL state | State-driven | ⏳ After P8 |
| P10 | Entry Detail — PAID state (no banner) | State-driven | ⏳ After P9 |

---

## 6. EDIT ENTRY SCREEN SPEC (P7A)

### Purpose
Allow the business owner to modify the details of an existing entry. Pre-filled with all current values. Customer is locked and cannot be changed.

### Layout
- **No tab bar.** Detail screen only.
- **Header:** `"Edit Entry [bill_number]"` + `"Edited N times"` subtitle. Edit count is a trust/audit signal.
- **Warning Banner:** Full-width amber banner, ⚠️ icon, left border accent `#f59e0b`, bg `#fffbeb`. Text: `"Editing will update the person's ledger and payment history"`.
- **Locked Person Row:** Label `"Person (cannot be changed)"` `#9ca3af`. Avatar: **green system** (`bg: #dcfce7`, initials `color: #16a34a`). Lock icon right.
- **Note Field:** `"+ Add note"` inside or directly adjacent to Itemized Details section.
- **Itemized Details:** Editable rate/quantity rows, red 🗑️ delete per row. Subtotal auto-calculated.
- **Totals Section:** Subtotal → Loading Charge (editable) → GST % (editable) → Tax (calculated) → Grand Total.
- **Balance Section:** Previous Balance → New Total → Total Outstanding. Subtle grey background.
- **Save Button:** Full-width solid green, ✓ checkmark icon, label `"Save"`.
- **Save → opens P7B (Save Confirmation Sheet)**

---

## 7. SAVE CONFIRMATION BOTTOM SHEET SPEC (P7B)

### Purpose
Confirm save intent and offer PDF sharing in one step.

### Layout
- **Bottom sheet**, not alert dialog. Same design language as P4.
- Handle: `40×4px` pill, `#d1d5db`, centered top.
- **Title:** `"Save changes?"` — `Inter 18px/700 #111827`
- **Subtitle:** `"This will update the person's ledger and payment history."` — `Inter 14px/400 #6b7280`
- **Primary:** Full-width solid green — `"Save & Share PDF"`, share icon.
- **Secondary:** Full-width outline — `"Save Only"`, ✓ icon.
- **Tertiary:** Centered plain text — `"Cancel"` `#9ca3af`. No button.
- Edit Entry screen dimmed behind. **No tab bar.**

---

## 8. STATE MATRIX

| Component | PENDING | PARTIAL | PAID | OVERDUE |
|---|---|---|---|---|
| Hero Gradient | Orange | Blue | Green | Red |
| Hero Amount | Shows balance | Shows balance | Shows `₹0` | Shows balance |
| Due Date Line | "Due: [date]" | "Due: [date]" | Hidden | "Overdue · X days" |
| Customer Card | Normal | Normal | Normal | Normal |
| Payments Card | Empty state | Has rows | All rows | Empty or has rows |
| Items Card | Collapsed | Collapsed | Collapsed | Collapsed |
| Overflow Row | — (removed) | — | — | — |
| Action Bar (Pri) | Record Payment | Record Payment | Share Receipt | Record Payment |
| Action Bar (Sec) | Remind | Remind | — | Remind (red border) |

---

## 9. WHAT CHANGED AND WHY

| Old | New | Reason |
|---|---|---|
| Customer card below Quick Actions | Customer card at TOP | WHO before HOW MUCH |
| QuickActionTile for Edit/Delete/Remind | ⋮ header overflow only | Cleaner scroll area; admin actions are rare |
| Overflow Actions Row (Edit · Delete text row) | Removed entirely | ⋮ header is the single overflow entry point |
| Items card above Payments | Items card below Payments, collapsed | Payment history is the primary need |
| Two equal-weight CTAs | One dominant CTA + ghost secondary | Reduces cognitive load |
| No due date on hero | Due date / overdue line on hero | Due date is critical context |
| Entry ID on hero | Removed from hero (kept in header) | Removes redundancy |
| Save modal as native Alert | Save confirmation as bottom sheet (P7B) | Matches design language |
| Blue avatar on Edit Entry | Green avatar system | Consistency across all screens |
| Share icon on Save button | Checkmark ✓ | Share icon implies sending, not saving |
| Tab bar on Edit Entry | Removed | Detail screen, not root screen |
| Remind → direct WhatsApp | Remind → bottom sheet (P3) | More options, consistent pattern |
| Mark as Paid → unknown | Opens P5 pre-filled with full amount | Consistent with payment flow |
| Items card shows grand total | Items card shows **subtotal** | Grand total includes tax/charges; subtotal = what was sold |

---

## 10. OPEN QUESTIONS — ALL RESOLVED

| Question | Resolution |
|---|---|
| Items card collapsed by default? | ✅ Yes. Auto-expand if only 1 item. |
| Remind → modal or direct WhatsApp? | ✅ Bottom sheet (P3) with WhatsApp + SMS. |
| Overdue threshold? | ✅ 1 day past due date. Not a setting in v1. |
| Payment rows tappable? | ✅ Not tappable in v1. |
| Mark as Paid behavior? | ✅ Opens P5 pre-filled with full balance. |
| Save button behavior on Edit Entry? | ✅ Opens P7B Save confirmation sheet. |
| Overflow entry point — header only or also text row? | ✅ **Header ⋮ only.** Text row removed. |
