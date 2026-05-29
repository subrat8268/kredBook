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

## 3. PLATFORM & CANVAS SPEC

> Apply to every screen and every Stitch prompt in this flow.

- **Platform:** Android mobile, `390×844pt`
- **Style:** Clean, minimal, trust-first. PhonePe / Razorpay / Khatabook aesthetic.
- **Font:** Inter throughout.
- **Canvas bg:** `#f3f4f6`
- **Icons:** Lucide stroke style, `24px` default.
- **Cards:** `bg: #ffffff`, `border: 1px solid #e5e7eb`, `borderRadius: 16px`, subtle drop shadow, `16px` horizontal screen margin, `12px` gap between cards.
- **No tab bar** on any Entry Detail or Edit Entry screen. These are detail screens, not root screens.

### Design Token Reference

| Token | Value |
|---|---|
| Canvas | `#f3f4f6` |
| Card bg | `#ffffff` |
| Border | `#e5e7eb` |
| Divider | `#f3f4f6` |
| Brand green | `#16a34a` |
| Green light bg | `#dcfce7` |
| Text primary | `#111827` |
| Text secondary | `#6b7280` |
| Text faint | `#9ca3af` |
| Danger | `#ef4444` |
| Pending orange | `#f97316` → `#ea580c` |
| Partial blue | `#3b82f6` → `#2563eb` |
| Paid green | `#16a34a` → `#15803d` |
| Overdue red | `#ef4444` → `#dc2626` |
| Amber warning bg | `#fffbeb` |
| Amber warning border | `#f59e0b` |
| Input bg | `#f9fafb` |

---

## 4. INFORMATION HIERARCHY (Top → Bottom)

1. **Header Bar** — Navigation context (Entry ID, date, back arrow, ⋮ overflow).
2. **Customer Card** — WHO. Always at the top.
3. **Hero Card** — HOW MUCH. Status-driven gradient.
4. **Payments Card** — WHAT HAPPENED. Promoted above Items.
5. **Items Card** — DETAILS. Collapsed by default.
6. **Action Bar** — Sticky bottom CTA.

> **Decision (2026-05-29):** The Overflow Actions Row (Edit · Delete text row below Hero) has been removed. All administrative actions (Edit, Delete, Mark as Paid, Share Invoice, Print, View Customer) are accessed exclusively via the **⋮ header icon**.

---

## 5. COMPONENT SPECS

### Header Bar
- **Purpose:** Clear identification, back navigation, and access to all administrative actions.
- **Left:** ← back arrow icon (`#111827`)
- **Center:** Title `Entry #[bill_number]` — `Inter 17px/600 #111827`. Subtitle: entry creation date — `Inter 13px/400 #9ca3af`, below.
- **Right:** ⋮ (three-dot) overflow icon — `24px`, `#111827`. Tap opens the **⋮ Overflow Menu (P2)** as a dropdown from top-right.
- **bg:** `#ffffff`, no shadow.
- **Decision:** Call button removed from header. All customer actions live on the Customer Card.

---

### ⋮ Overflow Menu (P2) — Three-Dot Header Tap

> **Triggered by:** Tapping the ⋮ icon on the top-right of the Header Bar.

**Visual Spec:**
- Dropdown card appears below the ⋮ icon, aligned to the right edge of the screen.
- `backgroundColor: #ffffff`, `borderRadius: 12px`, `shadow-lg`, `width: 180px`.
- Background overlay: `rgba(0,0,0,0.20)` behind the dropdown, dims the screen.
- Each menu item: `height: 44px`, `paddingHorizontal: 16px`, `Inter 14px/500`.
- Icon: `20px` Lucide stroke, left-aligned, `8px` gap to label.
- `1px #f3f4f6` divider between groups.

**Menu Items (in order):**

| # | Label | Icon | Color | Destination |
|---|---|---|---|---|
| 1 | Share Invoice | `share` | `#374151` | Native PDF share sheet |
| 2 | View Customer | `user` | `#374151` | Customer Detail screen |
| 3 | Print | `printer` | `#374151` | Native print dialog |
| — | `1px divider` | — | — | — |
| 4 | Edit Entry | `pencil` | `#374151` | Edit Entry screen (P7A) |
| 5 | Mark as Paid | `check-circle` | `#16a34a` | Record Payment sheet (P5) pre-filled with full balance |
| — | `1px divider` | — | — | — |
| 6 | Delete Entry | `trash-2` | `#ef4444` | Delete confirm bottom sheet (P4) |

**Behaviour:**
- Tapping any item closes the menu and navigates/triggers the relevant action.
- Tapping the overlay or pressing back closes the menu without any action.
- **Architecture decision:** Delete Entry appears **only** in the overflow menu — not in any inline row.

---

### Customer Card
- **Purpose:** Immediately identify the customer and provide quick communication actions.
- **Layout:** Full-width card, `flex-row items-center`, `padding: 12px 16px`, `borderRadius: 16px`, `bg: #ffffff`, `border: 1px solid #e5e7eb`.
- **Avatar (Left):** `44×44px` circle, `bg: #dcfce7`, initials `Inter 15px/700 color: #16a34a`. **Green avatar system — consistent across ALL screens including Edit Entry.**
- **Info (Center):** Name `Inter 15px/600 #111827` above phone `Inter 13px/400 #9ca3af`. Strip existing country code before prepending +91 to prevent `+91 +91` duplication.
- **Actions (Right):** Call icon + WhatsApp/chat icon, both `32×32px` circles, `bg: #dcfce7`, icon `#16a34a`, `8px` gap.
- **Entire card is tappable** → navigates to Customer Detail screen.

---

### Hero Card
- **Purpose:** Most critical financial number + status at a glance.
- **Layout:** Full-width, `borderRadius: 20px`, no border, status-driven gradient background. Large semi-transparent circle watermark top-right `(white, 15% opacity)`.
- **Row 1:** `BALANCE DUE` — `Inter 11px/600`, white, `letter-spacing: 1.4`.
- **Row 2:** Amount — `Inter 40px/800`, white.
- **Row 3 (space-between):** Left: status badge pill (`white bg, colored dot + text`). Right: due date line `Inter 13px/400 white 75% opacity`.
  - Upcoming: `"Due [date]"`
  - Past due: `"Overdue · X days"`
  - Paid: **hidden**
- **Gradient by status:** See token table.

---

### Payments Card
- **Purpose:** Chronological payment history for the entry.
- **Header:** `"PAYMENTS"` — `Inter 11px/600 #9ca3af letter-spacing: 1.2`. Sub-label: `"Paid ₹X of ₹Y"` — `Inter 13px/400 #6b7280`.
- **Progress Bar:** `4px` tall, full width, `#e5e7eb` track, `#16a34a` fill, `border-radius: full`. **Add a `4px` green pip at the left edge even at 0% fill** so it feels active, not like a loading skeleton.
- **Payment Row:** Method name `Inter 14px/600 #111827` + date `Inter 13px/400 #9ca3af` (left). Amount `Inter 15px/600 #16a34a` + `Received` chip `(bg: #dcfce7, color: #16a34a, Inter 11px/600, paddingH 8px, paddingV 3px, borderRadius: full)` (right). `1px #f3f4f6` divider between rows.
- **Empty State:** Centered, `24px` padding top/bottom. `32px` wallet icon (`#d1d5db`) + `"No payments recorded yet"` `Inter 14px/400 #9ca3af`.
- **Decision:** Payment rows are not tappable in v1. No edit/delete on individual payments.

---

### Items Card
- **Purpose:** Itemized breakdown, accessible on demand.
- **Default (Collapsed):** Single tappable `space-between` row. Left: `"N items · ₹[subtotal] total"` `Inter 14px/500 #374151`. Right: `chevron-down` `20px #9ca3af`. `padding: 14px 16px`.
  - ⚠️ Amount shown is **items subtotal**, NOT grand total.
- **Expanded (P1):** Chevron rotates to `chevron-up`. Below the header row, shows full item list:
  - **Item Row:** Name left `Inter 14px/500 #111827`. Qty×Rate center `Inter 13px/400 #9ca3af`. Amount right `Inter 14px/600 #111827`. `1px #f3f4f6` dividers.
  - **Subtotal Row:** `"Subtotal"` muted left · `₹[subtotal]` muted right.
  - `1px` thin divider.
  - **Grand Total Row:** `"Grand Total"` `Inter 15px/600` left · `₹[total]` `Inter 16px/700 #111827` right. Status pill inline `(bg: #fef3c7, color: #d97706)` for Pending/Overdue.
- **Exception:** Auto-expand if entry has only 1 line item.
- **No icon** in the row — text-only, no blue circle icon.

---

### Action Bar (Sticky Bottom)
- **Layout:** Fixed bottom. `bg: #ffffff`, `borderTop: 1px solid #f3f4f6`, `padding: 12px 16px`, safe area bottom.
- **No tab bar** visible behind or below this bar.

| Status | Primary CTA (60% width) | Secondary CTA (36% width) |
|---|---|---|
| Pending | `Record Payment` — solid green `#16a34a`, white `Inter 15px/600`, wallet icon, `borderRadius: full`, `height: 52px` | `Remind` — `bg: transparent`, `border: 1px solid #e5e7eb`, `color: #374151 Inter 14px/500`, bell icon, `height: 52px` |
| Partial | Same as Pending | Same as Pending |
| Overdue | Same as Pending | `Remind` — `border: 1px solid #dc2626`, `color: #dc2626`, red bell icon, red dot badge on bell |
| Paid | `Share Receipt` — full width `(16px margin each side)`, solid green, send/WhatsApp icon, white `Inter 15px/600`, `height: 52px` | — (no secondary) |

- **Decision:** Remind → opens Remind bottom sheet (P3) with WhatsApp + SMS options.
- **Decision:** "Send Entry" CTA removed. Sharing is accessed via ⋮ overflow menu.
- **Gap between primary and secondary:** `10px`.

---

## 6. PER-STATE FULL SPECS

### P0 — PENDING State (🟠 Orange) — FINALIZED

This is the **canonical base**. Every other state must match this layout exactly, with only the noted delta changes.

| Component | Spec |
|---|---|
| Hero gradient | Orange: `#f97316` → `#ea580c` |
| Status badge | Orange dot + `"Pending"` `Inter 12px/700 #f97316` |
| Due date line | `"Due [date]"` white 75% opacity |
| Hero amount | Full balance due (e.g. `₹12,555`) |
| Payments card | **Empty state** — wallet icon + `"No payments recorded yet"` |
| Progress bar | 0% fill. Green pip at left edge only. |
| Items card | Collapsed. `"3 items · ₹12,555 total"` |
| Action bar | `Record Payment` (primary) + `Remind` (secondary, neutral outline) |

---

### P8 — OVERDUE State (🔴 Red)

Identical to P0 in all layout, spacing, and component count. **Only these 4 things change:**

| Component | PENDING (P0) | OVERDUE (P8) |
|---|---|---|
| Hero gradient | Orange | Red: `#ef4444` → `#dc2626` |
| Status badge | Orange dot + `"Pending"` | Red dot + `"Overdue"` `Inter 12px/700 #ef4444` |
| Due date line | `"Due Jun 15, 2026"` | `"Overdue · 12 days"` white 75% opacity |
| Remind button | Neutral gray outline | Red outline `#dc2626`, red text, red bell icon |

> Overdue threshold = **1 day past due date**. Not a user-configurable setting in v1.

---

### P9 — PARTIAL State (🔵 Blue)

Identical to P0 in all layout, spacing, and component count. **Only these changes apply:**

| Component | PARTIAL (P9) |
|---|---|
| Hero gradient | Blue: `#3b82f6` → `#2563eb` |
| Status badge | Blue dot + `"Partial"` `Inter 12px/700 #2563eb` |
| Due date line | `"Due [date]"` same style as Pending |
| Hero amount | Remaining balance (e.g. `₹3,350`) |
| Payments card | **Has rows** — no empty state. Shows all payments received so far. |
| Progress bar | Proportional fill (e.g. 4% if `₹150` of `₹3,500` paid). |
| Sub-label | `"Paid ₹150 of ₹3,500"` |
| Action bar | `Record Payment` (primary) + `Remind` (secondary, neutral outline) |

**Payment Row example:**
- Left: `"Cash"` `Inter 14px/600 #111827` + `"May 19, 2026"` `Inter 13px/400 #9ca3af` below.
- Right: `"₹100"` `Inter 15px/600 #16a34a` + `Received` chip below.
- `1px #f3f4f6` divider between rows.

---

### P10 — PAID State (🟢 Green, no banner)

Identical to P0 in all layout, spacing, and component count. **Only these changes apply:**

| Component | PAID (P10) |
|---|---|
| Hero gradient | Green: `#16a34a` → `#15803d` |
| Status badge | Green dot + `"Paid"` `Inter 12px/700 #16a34a` |
| Due date line | **Hidden** — paid entries have no due date shown |
| Hero amount | `₹0` |
| Payments card | **All rows** — progress bar 100% filled `#16a34a`. Sub-label: `"Paid ₹3,500 of ₹3,500"`. No empty state. |
| Action bar | **Single full-width button:** `Share Receipt` — solid green, send icon, `height: 52px`, `16px` margin each side. No secondary button. |

> **P6 vs P10:** P6 = PAID state with a success banner at top (shown immediately after a payment is recorded, driven by `justPaid` param). P10 = same PAID state without the banner (reopened later). **No separate Stitch screen needed for P10** — implement as conditional banner in code.

---

### P6 — Post-Payment Success State

**Triggered by:** Payment saved via Record Payment sheet (P5). `justPaid=true` param passed.

- **Base:** Same as PAID state (P10) — green hero, `₹0`, full payments list, `Share Receipt` CTA.
- **Success Banner (top of scrollable content, below header):**
  - `bg: #dcfce7`, `borderRadius: 12px`, `padding: 12px 16px`, `margin: 0 16px`.
  - Left: `check-circle` icon `#16a34a` `20px`.
  - Text: `"Payment recorded successfully"` `Inter 14px/600 #16a34a`.
  - Banner is **conditional** — only shown when `justPaid === true`. Auto-dismiss after `3s` or on scroll.
  - **Decision:** Toast was previous pattern; Banner (inline, top of content) is the new pattern for this screen. More visible, less intrusive than a center toast.

---

## 7. LINKED SCREENS (Entry Detail Flow)

| # | Screen | Triggered by | Stitch Status |
|---|---|---|---|
| P0 | Entry Detail — PENDING state | Entry list tap | ✅ **FINALIZED** |
| P1 | Items card expanded | Items row tap | ✅ Approved |
| P2 | ⋮ Overflow menu | ⋮ header icon tap | ✅ Approved |
| P3 | Remind bottom sheet | `"Remind"` CTA | ✅ Approved |
| P4 | Delete confirm bottom sheet | `"Delete Entry"` in overflow | ✅ Approved |
| P5 | Record Payment bottom sheet | `"Record Payment"` / `"Mark as Paid"` | ✅ Use built version |
| P6 | Post-payment — PAID state + success banner | Payment saved (`justPaid=true`) | ✅ Approved |
| P7A | Edit Entry form | `"Edit Entry"` in overflow | ✅ Approved (3 code notes — see §9) |
| P7B | Save confirmation bottom sheet | `"Save"` on Edit Entry | ✅ Approved |
| P8 | Entry Detail — OVERDUE state | State-driven | ✅ Approved |
| P9 | Entry Detail — PARTIAL state | State-driven | ⏳ Next |
| P10 | Entry Detail — PAID state (no banner) | State-driven | ⏳ After P9 |

---

## 8. MODAL & SHEET SPECS

### P3 — Remind Bottom Sheet

**Triggered by:** `Remind` CTA in action bar.

- **Overlay:** `rgba(0,0,0,0.40)` behind sheet.
- **Sheet:** Slides up from bottom. `bg: #ffffff`, `borderRadius: 20px` top-only, `padding: 20px`.
- **Handle:** `32×4px` pill, `#d1d5db`, centered top.
- **Title:** `"Remind [Customer Name]"` — `Inter 17px/600 #111827`.
- **Subtitle:** `"Choose how to send the reminder"` — `Inter 14px/400 #6b7280`.
- **Option Cards (stacked, `12px` gap):**
  - **Card 1 — WhatsApp (Primary):** `border: 1.5px solid #16a34a`, `bg: #f0fdf4`. Left: WhatsApp logo icon `32px` green circle bg. Center: `"Send via WhatsApp"` `Inter 14px/600 #111827` + `"Opens WhatsApp with pre-filled message"` `Inter 12px/400 #9ca3af`. Right: `chevron-right #9ca3af`. *(WhatsApp is the dominant option for Indian SMB — stronger visual weight intentional.)*
  - **Card 2 — SMS (Secondary):** `border: 1px solid #e5e7eb`, `bg: #ffffff`. Left: `message-square` icon `32px` blue circle bg. Same center structure.
- **Cancel:** Centered plain text `Inter 15px/500 #6b7280`. No button chrome.
- **Known issue (Stitch only):** WhatsApp icon renders as generic chat bubble in Stitch prototype. Use real WhatsApp glyph/SVG in code.

---

### P4 — Delete Confirm Bottom Sheet

**Triggered by:** `"Delete Entry"` in ⋮ overflow menu.

- **Overlay:** `rgba(0,0,0,0.50)` behind modal.
- **Modal:** Centered card (not bottom sheet). `bg: #ffffff`, `borderRadius: 20px`, `padding: 24px`, `width: 320px`.
- **Top icon:** `trash-2` icon `40px` inside `#fee2e2` circle.
- **Title:** `"Delete this entry?"` — `Inter 17px/700 #111827`.
- **Body:** `"Entry RMT-010 will be permanently deleted. This cannot be undone."` — `Inter 14px/400 #6b7280`, centered.
- **Buttons (stacked, `12px` gap):**
  - Primary: `"Delete Entry"` — `bg: #ef4444`, white `Inter 15px/600`, `borderRadius: full`, `height: 48px`.
  - Secondary: `"Cancel"` — `bg: transparent`, `color: #6b7280 Inter 15px/500`.
- **Decision:** Native `Alert.alert` replaced by this custom modal. Matches design language.

---

### P5 — Record Payment Bottom Sheet

**Triggered by:** `"Record Payment"` CTA or `"Mark as Paid"` in overflow.

> Use the **built version** from `RecordCustomerPaymentModal`. Do not redesign.

Spec for reference (matches built component):
- **Overlay:** `rgba(0,0,0,0.40)`.
- **Sheet:** `height: 70%`, `bg: #ffffff`, `borderRadius: 20px` top-only, `padding: 20px`.
- **Handle** at top.
- **Title:** `"Record Payment"` `Inter 17px/600`. **Sub:** `"Entry [ID] · Balance ₹[amount]"` `Inter 13px/400 #9ca3af`.
- **Amount input:** Label `"Amount Received"` `Inter 12px/600 #6b7280`. Large `₹` prefix + number input `Inter 28px/700 #111827`. `bg: #f9fafb`, `border: 1px #e5e7eb`, `borderRadius: 12px`, `height: 64px`.
- **Payment method chips:** `Cash` `UPI` `Cheque` `Bank Transfer`. Selected: `bg: #16a34a`, white text. Unselected: `bg: #f3f4f6`, `#374151`.
- **Date row:** `"Date"` label + `"Today, [date]"` with calendar icon. `bg: #f9fafb`, `border: 1px #e5e7eb`, `borderRadius: 12px`.
- **Note (optional):** Placeholder `"e.g. Advance payment"` `#d1d5db`.
- **CTA:** `"Save Payment"` full-width solid green, `borderRadius: full`, `height: 52px`.
- **When triggered by `"Mark as Paid"`:** Amount pre-filled with full outstanding balance. Cash pre-selected.

---

## 9. EDIT ENTRY SCREEN SPEC (P7A)

### Purpose
Allow the business owner to modify the details of an existing entry. Pre-filled with all current values. Customer is locked and cannot be changed.

### Layout
- **No tab bar.** Detail screen only.
- **Header:** `"Edit Entry [bill_number]"` `Inter 17px/600` + `"Edited N times"` `Inter 13px/400 #9ca3af` subtitle. Edit count is a trust/audit signal.
- **Warning Banner:** Full-width amber banner, ⚠️ icon, left border accent `4px solid #f59e0b`, `bg: #fffbeb`. Text: `"Editing will update the person's ledger and payment history"` `Inter 14px #92400e`.
- **Locked Person Row:** Label `"Person (cannot be changed)"` `Inter 12px #9ca3af` above. Avatar: **green system** (`bg: #dcfce7`, initials `color: #16a34a`). Lock icon right.
- **Note Field:** `"+ Add note"` grouped inside or directly adjacent to Itemized Details section.
- **Itemized Details:** Editable rate/quantity rows, red 🗑️ delete per row. Subtotal auto-calculated.
- **Totals Section:** Subtotal → Loading Charge (editable) → GST % (editable) → Tax (calculated) → Grand Total. **Grand Total color: `#111827` (dark), NOT red.** Red = danger; Grand Total is not a danger signal.
- **Balance Section:** Previous Balance → New Total → Total Outstanding `#ef4444` (red = debt signal). Subtle `#f9fafb` background.
- **Save Button:** Full-width solid green `#16a34a`, **✓ checkmark icon** (not share icon), label `"Save"`, `borderRadius: 14px`.
- **Save → opens P7B (Save Confirmation Sheet)**

### Known Code Notes (for OpenCode build sprint)
1. **Item card background:** Use `bg: #ffffff`, `border: 1px #e5e7eb` — not grey bg.
2. **Grand Total color:** Use `#111827` (dark), not `#ef4444`. Red reserved for Total Outstanding only.
3. **Item Name pre-fill:** Product name must pre-fill from entry data. No blank `"Item Name"` placeholder at runtime.

---

## 10. SAVE CONFIRMATION BOTTOM SHEET SPEC (P7B)

### Purpose
Confirm save intent and offer PDF sharing in one step.

### Layout
- **Bottom sheet**, not alert dialog. Same pattern as P4.
- **Overlay:** `rgba(0,0,0,0.45)` behind dimmed P7A screen.
- **Handle:** `40×4px` pill, `#d1d5db`, centered top, `8px` margin.
- **Title:** `"Save changes?"` — `Inter 18px/700 #111827`
- **Subtitle:** `"This will update the person's ledger and payment history."` — `Inter 14px/400 #6b7280`
- **`24px` gap**
- **Button 1 (Primary):** Full-width solid green `#16a34a` — `"Save & Share PDF"`, share icon left, `height: 52px`, `borderRadius: 14px`.
- **Button 2 (Secondary):** Full-width outline `border: 1.5px solid #16a34a`, green text — `"Save Only"`, ✓ icon left, `height: 52px`, `borderRadius: 14px`.
- **`16px` gap**
- **Cancel:** Centered plain text `"Cancel"` `Inter 14px #9ca3af`. No button chrome.
- **No tab bar.** P7A screen is visible but dimmed behind.

---

## 11. STATE MATRIX

| Component | PENDING | PARTIAL | PAID | OVERDUE |
|---|---|---|---|---|
| Hero Gradient | Orange | Blue | Green | Red |
| Hero Amount | Balance due | Balance due | `₹0` | Balance due |
| Due Date Line | `"Due [date]"` | `"Due [date]"` | Hidden | `"Overdue · X days"` |
| Customer Card | Normal | Normal | Normal | Normal |
| Payments Card | Empty state | Has rows + progress | All rows + 100% bar | Empty or has rows |
| Items Card | Collapsed | Collapsed | Collapsed | Collapsed |
| ⋮ Overflow Menu | Available | Available | Available | Available |
| Action Bar (Pri) | Record Payment | Record Payment | Share Receipt | Record Payment |
| Action Bar (Sec) | Remind (neutral) | Remind (neutral) | — | Remind (red outline + red dot) |
| Success Banner | — | — | Only if `justPaid=true` | — |

---

## 12. WHAT CHANGED AND WHY

| Old | New | Reason |
|---|---|---|
| Customer card below Quick Actions | Customer card at TOP | WHO before HOW MUCH |
| QuickActionTile for Edit/Delete/Remind | ⋮ header overflow only | Cleaner scroll area; admin actions are rare |
| Overflow Actions Row (Edit · Delete text row) | Removed entirely | ⋮ header is the single overflow entry point |
| ⋮ menu not documented | Full visual spec added to Section 5 | Three-dot tap was designed (P2) but never documented |
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
| Items card shows grand total | Items card shows **subtotal** | Grand total includes tax/charges |
| Delete Entry inline (below Items) | Delete Entry in ⋮ overflow only | Prevents accidental delete |
| Payment success as toast | Inline success banner (top of content) | More visible; less intrusive |
| Grand Total in red on Edit Entry | Grand Total in `#111827` dark | Red = danger signal; Grand Total is not danger |
| No token reference in doc | Design token table added (Section 3) | Single source for all colour values |

---

## 13. OPEN QUESTIONS — ALL RESOLVED

| Question | Resolution |
|---|---|
| Items card collapsed by default? | ✅ Yes. Auto-expand if only 1 item. |
| Remind → modal or direct WhatsApp? | ✅ Bottom sheet (P3) with WhatsApp + SMS. |
| Overdue threshold? | ✅ 1 day past due date. Not a setting in v1. |
| Payment rows tappable? | ✅ Not tappable in v1. |
| Mark as Paid behavior? | ✅ Opens P5 pre-filled with full balance. |
| Save button behavior on Edit Entry? | ✅ Opens P7B Save confirmation sheet. |
| Overflow entry point — header only or also text row? | ✅ Header ⋮ only. Text row removed. |
| Delete Entry placement — inline or overflow? | ✅ Overflow only. No inline delete row. |
| Payment success feedback — toast or banner? | ✅ Inline banner, top of content, conditional on `justPaid`. |
| P6 vs P10 — separate Stitch screen? | ✅ No. Same PAID screen, banner is conditional in code. |
| Grand Total color on Edit Entry? | ✅ `#111827` dark. Red (`#ef4444`) reserved for Total Outstanding only. |
