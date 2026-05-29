# Entry Detail Screen — Design Spec

> **Status:** Design-first. All screens must be approved in Stitch before coding begins.
> **Last updated:** 2026-05-29
> **Product Lead:** All open questions resolved as of 2026-05-29. No open items remain.

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

> **Decision:** The Overflow Actions Row (Edit · Delete text row below Hero) is removed. All administrative actions are accessed exclusively via the **⋮ header icon**.

> **Decision:** No Entry Timeline section on this screen. The Payments Card already surfaces chronological payment history, which is the only timeline a business owner needs on a single entry view. Audit history (entry created, edited, reminder sent) is noise here — it belongs on a future Customer Activity screen, not Entry Detail. This decision is final for v1 and v2.

---

## 5. COMPONENT SPECS

### Header Bar
- **Purpose:** Clear identification, back navigation, and access to all administrative actions.
- **Left:** ← back arrow icon (`#111827`)
- **Center:** Title `Entry #[bill_number]` — `Inter 17px/600 #111827`. Subtitle: entry creation date — `Inter 13px/400 #9ca3af`, below.
- **Right:** ⋮ (three-dot) overflow icon — `24px`, `#111827`. Tap opens the **⋮ Overflow Menu (P2)**.
- **bg:** `#ffffff`, no shadow.
- **Decision:** Call button removed from header. All customer actions live on the Customer Card.

---

### ⋮ Overflow Menu (P2) — Three-Dot Header Tap

> **Triggered by:** Tapping the ⋮ icon on the top-right of the Header Bar.

**Visual Spec:**
- Dropdown card appears below the ⋮ icon, aligned to the right edge of the screen.
- `backgroundColor: #ffffff`, `borderRadius: 12px`, `shadow-lg`, `width: 180px`.
- Background overlay: `rgba(0,0,0,0.20)` behind the dropdown.
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
| 5 | Mark as Paid | `check-circle` | `#16a34a` | Record Payment sheet (P5) pre-filled |
| — | `1px divider` | — | — | — |
| 6 | Delete Entry | `trash-2` | `#ef4444` | Delete confirm bottom sheet (P4) |

**Behaviour:**
- Tapping any item closes the menu and triggers the relevant action.
- Tapping overlay or pressing back closes the menu with no action.
- **Mark as Paid is hidden on PAID entries** — no point showing it when balance is already ₹0.
- **Delete Entry is always visible** regardless of status. Business owners may need to delete even paid entries (data correction).

---

### Customer Card
- **Purpose:** Immediately identify the customer and provide quick communication actions.
- **Layout:** Full-width card, `flex-row items-center`, `padding: 12px 16px`, `borderRadius: 16px`, `bg: #ffffff`, `border: 1px solid #e5e7eb`.
- **Avatar (Left):** `44×44px` circle, `bg: #dcfce7`, initials `Inter 15px/700 color: #16a34a`. **Green avatar system — consistent across ALL screens.**
- **Info (Center):** Name `Inter 15px/600 #111827` above phone `Inter 13px/400 #9ca3af`. Strip existing country code before prepending +91.
- **Actions (Right):** Call icon + WhatsApp/chat icon, both `32×32px` circles, `bg: #dcfce7`, icon `#16a34a`, `8px` gap.
- **Entire card is tappable** → navigates to Customer Detail screen.
- **Decision — deleted customer edge case:** If a customer has been deleted from the contacts list but the entry still exists, show `\"[Deleted Customer]\"` in name, hide call/chat icons, disable card tap. Do not crash or show blank name.

---

### Hero Card
- **Purpose:** Most critical financial number + status at a glance.
- **Layout:** Full-width, `borderRadius: 20px`, no border, status-driven gradient. Large semi-transparent circle watermark top-right `(white, 15% opacity)`.
- **Row 1:** `BALANCE DUE` — `Inter 11px/600`, white, `letter-spacing: 1.4`.
- **Row 2:** Amount — `Inter 40px/800`, white.
- **Row 3 (space-between):** Left: status badge pill. Right: due date line `Inter 13px/400 white 75% opacity`.
  - Upcoming: `\"Due [date]\"`
  - Past due: `\"Overdue · X days\"`
  - Paid: **hidden**
- **Gradient by status:** See token table above.
- **Decision — zero balance on non-PAID entry:** If remaining balance somehow reaches ₹0 but status was not explicitly set to Paid, still show `₹0` in orange/blue (matching current status). Do not auto-flip to PAID state — only a recorded payment triggers a status change.

---

### Payments Card
- **Purpose:** Chronological payment history for the entry.
- **Header:** `\"PAYMENTS\"` — `Inter 11px/600 #9ca3af letter-spacing: 1.2`. Sub-label: `\"Paid ₹X of ₹Y\"` — `Inter 13px/400 #6b7280`.
- **Progress Bar:** `4px` tall, full width, `#e5e7eb` track, `#16a34a` fill, `border-radius: full`. **Always show a `4px` green pip at the left edge even at 0% fill.**
- **Payment Row:** Method name `Inter 14px/600 #111827` + date `Inter 13px/400 #9ca3af` left. Amount `Inter 15px/600 #16a34a` + `Received` chip `(bg: #dcfce7, color: #16a34a, Inter 11px/600, paddingH 8px, paddingV 3px, borderRadius: full)` right. `1px #f3f4f6` divider between rows.
- **Empty State:** Centered, `24px` padding. `32px` wallet icon (`#d1d5db`) + `\"No payments recorded yet\"` `Inter 14px/400 #9ca3af`.
- **Decision:** Payment rows are **not tappable in v1**. No edit/delete on individual payments. Revisit in v2 if users request correction flow.
- **Decision — max visible rows:** Show all payment rows. No pagination or "Show more" in v1. Entries rarely exceed 5–6 payments in practice.

---

### Items Card
- **Purpose:** Itemized breakdown, accessible on demand.
- **Default (Collapsed):** Single tappable `space-between` row. Left: `\"N items · ₹[subtotal] total\"` `Inter 14px/500 #374151`. Right: `chevron-down` `20px #9ca3af`. `padding: 14px 16px`.
  - ⚠️ Amount shown is **items subtotal (pre-tax, pre-charges)**, NOT grand total.
- **Expanded (P1):** Chevron rotates to `chevron-up`. Below header row:
  - **Item Row:** Name left `Inter 14px/500 #111827`. Qty×Rate center `Inter 13px/400 #9ca3af`. Amount right `Inter 14px/600 #111827`. `1px #f3f4f6` dividers.
  - **Subtotal Row:** `\"Subtotal\"` muted left · `₹[subtotal]` muted right.
  - `1px` divider.
  - **Grand Total Row:** `\"Grand Total\"` `Inter 15px/600` left · `₹[total]` `Inter 16px/700 #111827` right.
- **Exception:** Auto-expand if entry has only 1 line item.
- **No icon** in the row — text-only.

---

### Action Bar (Sticky Bottom)
- **Layout:** Fixed bottom. `bg: #ffffff`, `borderTop: 1px solid #f3f4f6`, `padding: 12px 16px`, safe area bottom.
- **No tab bar** below.

| Status | Primary CTA (60% width) | Secondary CTA (36% width) |
|---|---|---|
| Pending | `Record Payment` — solid `#16a34a`, white `Inter 15px/600`, wallet icon, `borderRadius: full`, `height: 52px` | `Remind` — outline `border: 1px #e5e7eb`, `color: #374151`, bell icon, `height: 52px` |
| Partial | Same as Pending | Same as Pending |
| Overdue | Same as Pending | `Remind` — `border: 1px solid #dc2626`, `color: #dc2626`, red bell icon |
| Paid | `Share Receipt` — **full width** `(16px margin each side)`, solid green, send icon, `height: 52px` | — (no secondary) |

- **Gap between primary and secondary:** `10px`.
- **Decision:** Remind → opens bottom sheet (P3). Never goes directly to WhatsApp.
- **Decision — disabled states:** Record Payment button is never disabled, even on a PAID entry. A user can always record an additional payment (overpayment correction). The status update logic lives in the backend, not the button.

---

## 6. PER-STATE FULL SPECS

### P0 — PENDING State (🟠 Orange) — ✅ FINALIZED

This is the **canonical base**. Every other state matches this layout exactly with only the noted delta changes.

| Component | Spec |
|---|---|
| Hero gradient | Orange: `#f97316` → `#ea580c` |
| Status badge | Orange dot + `\"Pending\"` `Inter 12px/700 #f97316` |
| Due date line | `\"Due [date]\"` white 75% opacity |
| Hero amount | Full balance due (e.g. `₹12,555`) |
| Payments card | **Empty state** — wallet icon + `\"No payments recorded yet\"` |
| Progress bar | 0% fill. Green pip at left edge only. |
| Items card | Collapsed. `\"3 items · ₹12,555 total\"` (subtotal) |
| Action bar | `Record Payment` (primary) + `Remind` (secondary, neutral outline) |

---

### P8 — OVERDUE State (🔴 Red) — ✅ APPROVED

Identical to P0 in all layout, spacing, and component count. **Only these 4 things change:**

| Component | PENDING (P0) | OVERDUE (P8) |
|---|---|---|
| Hero gradient | Orange | Red: `#ef4444` → `#dc2626` |
| Status badge | Orange dot + `\"Pending\"` | Red dot + `\"Overdue\"` `Inter 12px/700 #ef4444` |
| Due date line | `\"Due Jun 15, 2026\"` | `\"Overdue · 12 days\"` white 75% opacity |
| Remind button | Neutral gray outline | Red outline `#dc2626`, red text, red bell icon |

> Overdue threshold = **1 day past due date**. Not user-configurable in v1.
> **Decision — overdue with partial payments:** If a customer has made some payments but the entry is still past due, the state is **OVERDUE** (not PARTIAL). OVERDUE takes precedence over PARTIAL when due date has passed. Payments card shows the existing payment rows (not empty state).

---

### P9 — PARTIAL State (🔵 Blue) — ⏳ NEXT

Identical to P0 in all layout, spacing, and component count. **Only these changes apply:**

| Component | PARTIAL (P9) |
|---|---|
| Hero gradient | Blue: `#3b82f6` → `#2563eb` |
| Status badge | Blue dot + `\"Partial\"` `Inter 12px/700 #2563eb` |
| Due date line | `\"Due [date]\"` same style as Pending |
| Hero amount | **Remaining balance** (e.g. `₹3,350` if `₹150` paid of `₹3,500`) |
| Payments card | **Has rows** — no empty state. Shows all payments. |
| Progress bar | Proportional fill. Sub-label: `\"Paid ₹150 of ₹3,500\"`. |
| Action bar | `Record Payment` (primary) + `Remind` (secondary, neutral outline) |

**Payment Row example:**
- Left: `\"Cash\"` `Inter 14px/600 #111827` + `\"May 19, 2026\"` `Inter 13px/400 #9ca3af`.
- Right: `\"₹100\"` `Inter 15px/600 #16a34a` + `Received` chip.

> **Decision — PARTIAL state trigger:** Status changes to PARTIAL immediately after the first payment is recorded if the remaining balance > ₹0. No manual toggle needed.

---

### P10 — PAID State (🟢 Green, no banner) — ⏳ AFTER P9

Identical to P0 in all layout, spacing, and component count. **Only these changes apply:**

| Component | PAID (P10) |
|---|---|
| Hero gradient | Green: `#16a34a` → `#15803d` |
| Status badge | Green dot + `\"Paid\"` `Inter 12px/700 #16a34a` |
| Due date line | **Hidden** |
| Hero amount | `₹0` |
| Payments card | All rows + 100% progress bar. Sub-label: `\"Paid ₹3,500 of ₹3,500\"`. |
| Action bar | **Single full-width** `Share Receipt` — solid green, send icon. No secondary. |

> **P6 vs P10:** P6 = PAID state + inline success banner (`justPaid=true`). P10 = same PAID state without banner (reopened later). **No separate Stitch screen for P10** — implement as conditional banner in code.

> **Decision — overpayment:** If a payment is recorded that exceeds the outstanding balance, show `₹0` on the hero (not a negative). Show a `\"Overpaid by ₹X\"` note in the Payments card sub-label `Inter 12px #f97316`. Do not block the payment recording.

---

### P6 — Post-Payment Success State — ✅ APPROVED

**Triggered by:** Payment saved via P5. `justPaid=true` param passed.

- **Base:** PAID state (P10) — green hero, `₹0`, full payments list, `Share Receipt` CTA.
- **Success Banner:**
  - Position: Top of scrollable content, below header, above Customer Card.
  - `bg: #dcfce7`, `borderRadius: 12px`, `padding: 12px 16px`, `margin: 0 16px 0 16px`.
  - Left: `check-circle` icon `#16a34a` `20px`.
  - Text: `\"Payment recorded successfully\"` `Inter 14px/600 #16a34a`.
  - **Auto-dismiss:** 4 seconds. Also dismissed on any scroll.
  - **Decision:** Toast was previous pattern. Inline banner is new standard for this screen — more visible, not blocked by keyboard or action bar.

---

## 7. LINKED SCREENS (Entry Detail Flow)

| # | Screen | Triggered by | Status |
|---|---|---|---|
| P0 | Entry Detail — PENDING state | Entry list tap | ✅ **FINALIZED** |
| P1 | Items card expanded | Items row tap | ✅ Approved |
| P2 | ⋮ Overflow menu | ⋮ header icon tap | ✅ Approved |
| P3 | Remind bottom sheet | `\"Remind\"` CTA | ✅ Approved |
| P4 | Delete confirm bottom sheet | `\"Delete Entry\"` in overflow | ✅ Approved |
| P5 | Record Payment bottom sheet | `\"Record Payment\"` / `\"Mark as Paid\"` | ✅ Use built version |
| P6 | Post-payment — PAID state + success banner | Payment saved (`justPaid=true`) | ✅ Approved |
| P7A | Edit Entry form | `\"Edit Entry\"` in overflow | ✅ Approved |
| P7B | Save confirmation bottom sheet | `\"Save\"` on Edit Entry | ✅ Approved |
| P8 | Entry Detail — OVERDUE state | State-driven | ✅ **APPROVED** |
| P9 | Entry Detail — PARTIAL state | State-driven | ⏳ Next |
| P10 | Entry Detail — PAID state (no banner) | State-driven | ⏳ After P9 |

---

## 8. MODAL & SHEET SPECS

### P3 — Remind Bottom Sheet

**Triggered by:** `Remind` CTA in action bar.

- **Overlay:** `rgba(0,0,0,0.40)`.
- **Sheet:** Slides up. `bg: #ffffff`, `borderRadius: 20px` top-only, `padding: 20px`.
- **Handle:** `32×4px` pill, `#d1d5db`, centered top.
- **Title:** `\"Remind [Customer Name]\"` — `Inter 17px/600 #111827`.
- **Subtitle:** `\"Choose how to send the reminder\"` — `Inter 14px/400 #6b7280`.
- **Option Cards (stacked, `12px` gap):**
  - **WhatsApp (Primary):** `border: 1.5px solid #16a34a`, `bg: #f0fdf4`. Left: WhatsApp icon `32px` green bg. Center: `\"Send via WhatsApp\"` `Inter 14px/600` + `\"Opens WhatsApp with pre-filled message\"` `Inter 12px/400 #9ca3af`. Right: `chevron-right`.
  - **SMS (Secondary):** `border: 1px solid #e5e7eb`, `bg: #ffffff`. Same structure. `message-square` icon `32px` blue bg.
- **Cancel:** Centered plain text `Inter 15px/500 #6b7280`.
- **Decision — pre-filled message content:** WhatsApp and SMS both pre-fill with: `\"Hi [Name], your payment of ₹[balance] for Invoice #[ID] is due. Please pay at your earliest convenience.\"` Message is not editable in v1.
- **Known issue (Stitch only):** WhatsApp icon renders as generic chat bubble. Use real WhatsApp SVG in code.

---

### P4 — Delete Confirm Bottom Sheet

**Triggered by:** `\"Delete Entry\"` in ⋮ overflow menu.

- **Overlay:** `rgba(0,0,0,0.50)`.
- **Modal:** Centered card (not bottom sheet). `bg: #ffffff`, `borderRadius: 20px`, `padding: 24px`, `width: 320px`.
- **Top icon:** `trash-2` `40px` inside `#fee2e2` circle.
- **Title:** `\"Delete this entry?\"` — `Inter 17px/700 #111827`.
- **Body:** `\"Entry [ID] will be permanently deleted. This cannot be undone.\"` — `Inter 14px/400 #6b7280`, centered.
- **Buttons (stacked, `12px` gap):**
  - Primary: `\"Delete Entry\"` — `bg: #ef4444`, white `Inter 15px/600`, `borderRadius: full`, `height: 48px`.
  - Secondary: `\"Cancel\"` — transparent, `#6b7280 Inter 15px/500`.
- **Decision — delete with payments:** If the entry has recorded payments, show an additional warning line in amber: `\"⚠️ This entry has recorded payments. Deleting will remove all payment records too.\"` This replaces the generic body text.

---

### P5 — Record Payment Bottom Sheet

> **Use the built version** from `RecordCustomerPaymentModal`. Do not redesign.

- **Overlay:** `rgba(0,0,0,0.40)`.
- **Sheet:** `height: 70%`, `bg: #ffffff`, `borderRadius: 20px` top-only, `padding: 20px`.
- **Handle** at top.
- **Title:** `\"Record Payment\"`. Sub: `\"Entry [ID] · Balance ₹[amount]\"` `Inter 13px/400 #9ca3af`.
- **Amount input:** `₹` prefix, `Inter 28px/700`, `bg: #f9fafb`, `height: 64px`.
- **Payment method chips:** `Cash` `UPI` `Cheque` `Bank Transfer`. Selected: `bg: #16a34a` white. Unselected: `bg: #f3f4f6`.
- **Date row:** `\"Today, [date]\"` with calendar icon.
- **Note (optional):** `\"e.g. Advance payment\"` placeholder.
- **CTA:** `\"Save Payment\"` full-width solid green.
- **When triggered by `\"Mark as Paid\"`:** Amount pre-filled with full outstanding balance. Cash pre-selected.

---

## 9. EDIT ENTRY SCREEN SPEC (P7A) — ✅ APPROVED

### Purpose
Modify the details of an existing entry. Pre-filled with all current values. Customer is locked.

### Layout
- **No tab bar.**
- **Header:** `\"Edit Entry [bill_number]\"` + `\"Edited N times\"` subtitle.
- **Warning Banner:** Amber, ⚠️ icon, left border `4px solid #f59e0b`, `bg: #fffbeb`. Text: `\"Editing will update the person's ledger and payment history\"`.
- **Locked Person Row:** `\"Person (cannot be changed)\"` label. Green avatar system. Lock icon right.
- **Note Field:** Inside / adjacent to Itemized Details section.
- **Itemized Details:** Editable rows, red 🗑️ per row.
- **Totals:** Subtotal → Loading Charge (editable) → GST % (editable) → Tax (calculated) → Grand Total `Inter 16px/700 #111827`.
- **Balance:** Previous Balance → New Total → Total Outstanding `#ef4444`.
- **Save Button:** Full-width solid green, ✓ checkmark icon, `\"Save\"`.
- **Save → opens P7B.**

### Code Notes
1. Item card: `bg: #ffffff`, `border: 1px #e5e7eb`.
2. Grand Total color: `#111827`. NOT red.
3. Item Name: must pre-fill from entry data at runtime.

---

## 10. SAVE CONFIRMATION BOTTOM SHEET SPEC (P7B) — ✅ APPROVED

- **Bottom sheet.** Overlay `rgba(0,0,0,0.45)`.
- **Handle:** `40×4px` pill, `#d1d5db`.
- **Title:** `\"Save changes?\"` — `Inter 18px/700 #111827`.
- **Subtitle:** `\"This will update the person's ledger and payment history.\"` — `Inter 14px/400 #6b7280`.
- **Button 1:** Full-width solid green — `\"Save & Share PDF\"`, share icon, `height: 52px`.
- **Button 2:** Full-width outline green — `\"Save Only\"`, ✓ icon, `height: 52px`.
- **Cancel:** Centered plain text `\"Cancel\"` `#9ca3af`.

---

## 11. STATE MATRIX

| Component | PENDING | PARTIAL | PAID | OVERDUE |
|---|---|---|---|---|
| Hero Gradient | Orange | Blue | Green | Red |
| Hero Amount | Balance due | Remaining balance | `₹0` | Balance due |
| Due Date Line | `\"Due [date]\"` | `\"Due [date]\"` | Hidden | `\"Overdue · X days\"` |
| Customer Card | Normal | Normal | Normal | Normal |
| Payments Card | Empty state | Has rows + progress | All rows + 100% | Empty or has rows |
| Items Card | Collapsed (subtotal) | Collapsed (subtotal) | Collapsed (subtotal) | Collapsed (subtotal) |
| ⋮ Overflow | Available | Available | Available (Mark as Paid hidden) | Available |
| Action Bar (Pri) | Record Payment | Record Payment | Share Receipt (full width) | Record Payment |
| Action Bar (Sec) | Remind (neutral) | Remind (neutral) | — | Remind (red outline) |
| Success Banner | — | — | Only if `justPaid=true` | — |
| State Priority | Default | Overridden by Overdue if past due | Terminal | Wins over Partial |

---

## 12. WHAT CHANGED AND WHY

| Old | New | Reason |
|---|---|---|
| Customer card below Quick Actions | Customer card at TOP | WHO before HOW MUCH |
| QuickActionTile for Edit/Delete/Remind | ⋮ header overflow only | Admin actions are rare |
| Overflow Actions Row (text row below Hero) | Removed entirely | ⋮ is single overflow entry point |
| Items card above Payments | Items card below Payments, collapsed | Payment status is primary need |
| Two equal-weight CTAs | One dominant CTA + ghost secondary | Reduces cognitive load |
| No due date on hero | Due date / overdue line on hero | Critical context |
| Entry ID on hero | Removed (kept in header) | Redundancy |
| Save modal as native Alert | Bottom sheet P7B | Matches design language |
| Blue avatar on Edit Entry | Green avatar system | Consistency |
| Share icon on Save | Checkmark ✓ | Share implies sending, not saving |
| Tab bar on Edit Entry | Removed | Detail screen, not root |
| Remind → direct WhatsApp | Remind → bottom sheet P3 | Options + consistent pattern |
| Mark as Paid → unknown | Opens P5 pre-filled | Consistent payment flow |
| Items card shows grand total | Items card shows **subtotal** | Subtotal = what was sold; grand total includes tax |
| Delete Entry inline | Delete Entry in ⋮ only | Prevents accidental delete |
| Payment success as toast | Inline banner, top of content | More visible, not blocked by keyboard |
| Grand Total red on Edit Entry | Grand Total `#111827` | Red reserved for debt signal only |
| No token reference | Design token table in §3 | Single source of truth for colour |
| No edge case handling | Deleted customer, zero balance, overpayment, delete-with-payments all documented | Prevents build-time surprises |
| Entry Timeline section | **Not added, final decision** | Payments Card already surfaces chronological history; audit log = noise on entry detail |

---

## 13. OPEN QUESTIONS — ALL RESOLVED

| Question | Resolution |
|---|---|
| Items card collapsed by default? | ✅ Yes. Auto-expand if only 1 item. |
| Remind → modal or direct WhatsApp? | ✅ Bottom sheet P3 with WhatsApp + SMS. |
| Overdue threshold? | ✅ 1 day past due date. Not a setting in v1. |
| Payment rows tappable? | ✅ Not tappable in v1. Revisit v2. |
| Mark as Paid behavior? | ✅ Opens P5 pre-filled with full balance. |
| Save button behavior on Edit Entry? | ✅ Opens P7B Save confirmation sheet. |
| Overflow entry point? | ✅ Header ⋮ only. Text row removed. |
| Delete Entry placement? | ✅ Overflow only. No inline delete row. |
| Payment success feedback? | ✅ Inline banner, top of content, `justPaid` conditional, 4s auto-dismiss. |
| P6 vs P10 — separate Stitch screen? | ✅ No. Same PAID screen, banner is conditional in code. |
| Grand Total color on Edit Entry? | ✅ `#111827`. Red reserved for Total Outstanding only. |
| Entry Timeline on Entry Detail? | ✅ **No.** Not now, not in v2 for this screen. Customer Activity screen is the right home. |
| OVERDUE + partial payments — which state wins? | ✅ OVERDUE wins. Past-due date overrides PARTIAL. |
| PARTIAL trigger — automatic or manual? | ✅ Automatic. First recorded payment with balance > ₹0 = PARTIAL. |
| Overpayment handling? | ✅ Show `₹0` hero, `\"Overpaid by ₹X\"` in Payments sub-label. Never block payment recording. |
| Deleted customer on entry? | ✅ Show `\"[Deleted Customer]\"`, hide icons, disable card tap. |
| Mark as Paid visibility on PAID entry? | ✅ Hidden in overflow menu when entry is already PAID. |
| Remind pre-filled message content? | ✅ `\"Hi [Name], your payment of ₹[balance] for Invoice #[ID] is due. Please pay at your earliest convenience.\"` Not editable in v1. |
| Record Payment button disabled on PAID? | ✅ Never disabled. Overpayment is valid (data correction use case). |
| Max payment rows shown? | ✅ All rows shown. No pagination in v1. |
| Delete with existing payments — extra warning? | ✅ Yes. Show amber warning line in P4 modal if entry has payments. |
