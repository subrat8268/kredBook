# Entry Detail Screen — Design Spec

> **Status:** Phase 4 — Audited & Polishing.
> **Last updated:** 2026-06-05
> **Product Lead:** All open questions resolved. No open items remain.

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

> **Decision:** There is no Quick Actions row (Edit · Delete · Remind) between cards. All administrative actions (Edit, Delete, Mark as Paid, Share, Print, View Customer) are accessed exclusively via the **⋮ header icon**. The Remind action lives solely in the **Action Bar**.

> **Decision:** No Entry Timeline section on this screen. The Payments Card already surfaces chronological payment history. Audit history belongs on a future Customer Activity screen. This decision is final for v1 and v2.

> **Decision:** `EntryQuickActions` component is **scoped to dead code** — it must not render on screen. Edit and Delete are in the overflow menu. Remind is in the Action Bar. If `EntryQuickActions` is still imported in `[orderId].tsx`, it should be removed.

---

## 5. COMPONENT SPECS

### Header Bar
- **Purpose:** Clear identification, back navigation, and access to all administrative actions.
- **Left:** ← back arrow icon (`#111827`)
- **Center:** Title `Entry #[bill_number]` — `Inter 17px/600 #111827`. Subtitle: entry creation date — `Inter 13px/400 #9ca3af`, below.
- **Right:** ⋮ (three-dot) overflow icon — `24px`, `#111827`. Tap opens the **⋮ Overflow Menu (P2)**.
- **bg:** `#ffffff`, `border-bottom: 1px solid #e5e7eb`, no shadow.
- **Decision:** Call button removed from header. All customer communication actions live on the Customer Card.

---

### ⋮ Overflow Menu (P2) — Three-Dot Header Tap

> **Triggered by:** Tapping the ⋮ icon on the top-right of the Header Bar.

**Visual Spec (as-built — confirmed from live screen):**
- Dropdown card appears below the ⋮ icon, aligned to the right edge of the screen.
- `backgroundColor: #ffffff`, `borderRadius: 12px`, `shadow: 0 4px 16px rgba(0,0,0,0.08)`, `elevation: 5`, `width: 200px`.
- `right: spacing.md`, `top: 56px` (pinned below header).
- Background overlay: `rgba(0,0,0,0.30)` — full screen, tapping it closes the menu.
- Each menu item: `minHeight: 44px`, `paddingVertical: 14px`, `paddingHorizontal: 20px`, `Inter 15px/500`.
- Icon: `16px` bare Lucide stroke element (no wrapping View), `strokeWidth: 2`, `gap: 12px` to label.
- ⚠️ Icons must be **bare Lucide elements** — no `<View>` wrapper. A wrapper collapses `flexDirection: row` and stacks icon above label.
- `1px #f3f4f6` divider between **every** item via `ItemSeparatorComponent` (intentional — not group-only).

**Menu Items (in order — as-built):**

| # | Label | Icon | Color | Destination |
|---|---|---|---|---|
| 1 | Edit Entry | `pencil` | `#374151` | Edit Entry screen (P7A) |
| 2 | Share Invoice | `share-2` | `#374151` | Native PDF share sheet |
| 3 | View Customer | `user` | `#374151` | Customer Detail screen |
| 4 | Print | `printer` | `#374151` | Native print dialog (coming soon toast) |
| 5 | Mark as Paid | `check-circle` | `#16a34a` (green) | Record Payment sheet (P5) pre-filled |
| 6 | Delete Entry | `trash-2` | `#ef4444` (red) | Delete confirm modal (P4) |

**Behaviour:**
- Tapping any item calls `item.onPress()` then `onClose()`.
- Tapping the backdrop calls `onClose()` with no action.
- **Mark as Paid is hidden on PAID entries** — no point showing it when balance is ₹0.
- **Delete Entry is always visible** regardless of status.
- Rendered as a React Native `Modal` with `animationType="fade"`.

---

### Customer Card
- **Purpose:** Immediately identify the customer and provide quick communication actions.
- **Layout:** Full-width card, `flex-row items-center`, `padding: 12px 16px`, `borderRadius: 16px`, `bg: #ffffff`, `border: 1px solid #e5e7eb`.
- **Avatar (Left):** `44×44px` circle, `bg: #dcfce7`, initials `Inter 15px/700 color: #16a34a`. Green avatar system — consistent across ALL screens.
- **Info (Center):** Name `Inter 15px/600 #111827` above phone `Inter 13px/400 #9ca3af`. Strip existing country code before prepending +91.
- **Actions (Right):** Call icon + WhatsApp/chat icon, both `32×32px` circles, `bg: #dcfce7`, icon `#16a34a`, `8px` gap.
- **Entire card is tappable** → navigates to Customer Detail screen.
- **Deleted customer edge case:** Show `"[Deleted Customer]"` in name, hide call/chat icons, disable card tap.

---

### Hero Card
- **Purpose:** Most critical financial number + status at a glance.
- **Layout:** Full-width, `borderRadius: 20px`, no border, status-driven gradient. Large semi-transparent circle watermark top-right `(white, 15% opacity)`.
- **Row 1:** `BALANCE DUE` — `Inter 11px/600`, white, `letter-spacing: 1.4`.
- **Row 2:** Amount — `Inter 40px/800`, white.
- **Row 3 (space-between):** Left: status badge pill. Right: due date line `Inter 13px/400 white 75% opacity`.
  - Upcoming: `"Due [date]"`
  - Past due: `"Overdue · X days"`
  - Paid: **hidden**
- **Gradient by status:** See token table above.
- **Zero balance on non-PAID entry:** Show `₹0` in current status colour. Do not auto-flip to PAID — only a recorded payment triggers a status change.

---

### Payments Card
- **Purpose:** Chronological payment history for the entry.
- **Header:** `"PAYMENTS"` — `Inter 11px/600 #9ca3af letter-spacing: 1.2`. Sub-label: `"Paid ₹X of ₹Y"` — `Inter 13px/400 #6b7280`.
- **Progress Bar:** `4px` tall, full width, `#e5e7eb` track, `#16a34a` fill, `border-radius: full`. Always show a `4px` green pip at the left edge even at 0% fill.
- **Payment Row:** Method name `Inter 14px/600 #111827` + date `Inter 13px/400 #9ca3af` left. Amount `Inter 15px/600 #16a34a` + `Received` chip `(bg: #dcfce7, color: #16a34a, Inter 11px/600, paddingH 8px, paddingV 3px, borderRadius: full)` right. `1px #f3f4f6` divider between rows.
- **Empty State:** Centered, `24px` padding. `32px` wallet icon (`#d1d5db`) + `"No payments recorded yet"` `Inter 14px/400 #9ca3af`.
- **Decision:** Payment rows are not tappable in v1. No edit/delete on individual payments. Revisit in v2.
- **Decision:** Show all payment rows. No pagination in v1.

---

### Items Card
- **Purpose:** Itemized breakdown, accessible on demand.
- **Default (Collapsed):** Single tappable `space-between` row. Left: `"N items · ₹[subtotal] total"` `Inter 14px/500 #374151`. Right: `chevron-down` `20px #9ca3af`. `padding: 14px 16px`.
  - ⚠️ Amount shown is **items subtotal (pre-tax, pre-charges)**, NOT grand total.
- **Expanded (P1):** Chevron rotates to `chevron-up`. Below header row:
  - **Item Row:** Name left `Inter 14px/500 #111827`. Qty×Rate center `Inter 13px/400 #9ca3af`. Amount right `Inter 14px/600 #111827`. `1px #f3f4f6` dividers.
  - **Subtotal Row:** `"Subtotal"` muted left · `₹[subtotal]` muted right.
  - `1px` divider.
  - **Grand Total Row:** `"Grand Total"` `Inter 15px/600` left · `₹[total]` `Inter 16px/700 #111827` right.
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
- **Decision:** Record Payment button is never disabled, even on a PAID entry (overpayment correction use case).

---

## 6. PER-STATE FULL SPECS

### P0 — PENDING State (🟠 Orange) — ✅ BUILT & LIVE

This is the **canonical base**. Every other state matches this layout exactly with only the noted delta changes.

| Component | Spec |
|---|---|
| Hero gradient | Orange: `#f97316` → `#ea580c` |
| Status badge | Orange dot + `"Pending"` `Inter 12px/700 #f97316` |
| Due date line | `"Due [date]"` white 75% opacity |
| Hero amount | Full balance due (e.g. `₹12,555`) |
| Payments card | **Empty state** — wallet icon + `"No payments recorded yet"` |
| Progress bar | 0% fill. Green pip at left edge only. |
| Items card | Collapsed. `"3 items · ₹12,555 total"` (subtotal) |
| Action bar | `Record Payment` (primary) + `Remind` (secondary, neutral outline) |

---

### P8 — OVERDUE State (🔴 Red) — ✅ APPROVED

Identical to P0 in all layout, spacing, and component count. **Only these 4 things change:**

| Component | PENDING (P0) | OVERDUE (P8) |
|---|---|---|
| Hero gradient | Orange | Red: `#ef4444` → `#dc2626` |
| Status badge | Orange dot + `"Pending"` | Red dot + `"Overdue"` `Inter 12px/700 #ef4444` |
| Due date line | `"Due Jun 15, 2026"` | `"Overdue · 12 days"` white 75% opacity |
| Remind button | Neutral gray outline | Red outline `#dc2626`, red text, red bell icon |

> Overdue threshold = **1 day past due date**. Not user-configurable in v1.
> **Overdue with partial payments:** OVERDUE takes precedence over PARTIAL when due date has passed.

---

### P9 — PARTIAL State (🔵 Blue) — ⏳ NEXT

Identical to P0 in all layout, spacing, and component count. **Only these changes apply:**

| Component | PARTIAL (P9) |
|---|---|
| Hero gradient | Blue: `#3b82f6` → `#2563eb` |
| Status badge | Blue dot + `"Partial"` `Inter 12px/700 #2563eb` |
| Due date line | `"Due [date]"` same style as Pending |
| Hero amount | **Remaining balance** (e.g. `₹3,350` if `₹150` paid of `₹3,500`) |
| Payments card | **Has rows** — no empty state. Shows all payments. |
| Progress bar | Proportional fill. Sub-label: `"Paid ₹150 of ₹3,500"`. |
| Action bar | `Record Payment` (primary) + `Remind` (secondary, neutral outline) |

> **PARTIAL trigger:** Automatic. First recorded payment with balance > ₹0 = PARTIAL.

---

### P10 — PAID State (🟢 Green) — ⏳ AFTER P9

Identical to P0 in all layout, spacing, and component count. **Only these changes apply:**

| Component | PAID (P10) |
|---|---|
| Hero gradient | Green: `#16a34a` → `#15803d` |
| Status badge | Green dot + `"Paid"` `Inter 12px/700 #16a34a` |
| Due date line | **Hidden** |
| Hero amount | `₹0` |
| Payments card | All rows + 100% progress bar. Sub-label: `"Paid ₹3,500 of ₹3,500"`. |
| Action bar | **Single full-width** `Share Receipt` — solid green, send icon. No secondary. |

> P6 vs P10: P6 = PAID state + inline success banner (`justPaid=true`). P10 = same PAID state without banner (reopened later). **No separate screen for P10** — implement as conditional banner in code.

> **Overpayment:** Show `₹0` hero, `"Overpaid by ₹X"` in Payments sub-label `Inter 12px #f97316`. Never block payment recording.

---

### P6 — Post-Payment Success State — ✅ APPROVED

**Triggered by:** Payment saved via P5. `justPaid=true` param passed.

- **Base:** PAID state (P10) — green hero, `₹0`, full payments list, `Share Receipt` CTA.
- **Success Banner:**
  - Position: Top of scrollable content, below header, above Customer Card.
  - `bg: #dcfce7`, `borderRadius: 12px`, `padding: 12px 16px`, `margin: 0 16px`.
  - Left: `check-circle` icon `#16a34a` `20px`.
  - Text: `"Payment recorded successfully"` `Inter 14px/600 #16a34a`.
  - **Auto-dismiss:** 4 seconds. Also dismissed on any scroll.

---

## 7. LINKED SCREENS (Entry Detail Flow)

| # | Screen | Triggered by | Status |
|---|---|---|---|
| P0 | Entry Detail — PENDING state | Entry list tap | ✅ **BUILT & LIVE** |
| P1 | Items card expanded | Items row tap | ✅ **BUILT & LIVE** |
| P2 | ⋮ Overflow menu | ⋮ header icon tap | 🔄 **In Polish** (Overlay/style drift) |
| P3 | Remind bottom sheet | `"Remind"` CTA in Action Bar | ✅ **BUILT & LIVE** |
| P4 | Delete confirm modal | `"Delete Entry"` in overflow | ✅ **BUILT & LIVE** |
| P5 | Record Payment bottom sheet | `"Record Payment"` / `"Mark as Paid"` | ✅ **BUILT & LIVE** |
| P6 | Post-payment — PAID state + success banner | Payment saved (`justPaid=true`) | ❌ **Not Started** (Toast used instead) |
| P7A | Edit Entry form | `"Edit Entry"` in overflow | ✅ **BUILT & LIVE** |
| P7B | Save confirmation bottom sheet | `"Save"` on Edit Entry | ✅ **BUILT & LIVE** |
| P8 | Entry Detail — OVERDUE state | State-driven | ✅ **BUILT & LIVE** (style drifts) |
| P9 | Entry Detail — PARTIAL state | State-driven | 🔄 **In Progress** (Basic built; progress bar/Received chip drifts) |
| P10 | Entry Detail — PAID state (no banner) | State-driven | 🔄 **In Progress** (Basic built; overpayment drift) |

---

## 8. MODAL & SHEET SPECS

### P3 — Remind Bottom Sheet

**Triggered by:** `Remind` CTA in action bar.

- **Overlay:** `rgba(0,0,0,0.50)`.
- **Sheet:** Bottom-drawer style. `bg: #ffffff` (`bg-white`), `borderRadius: 20px` top-only, `width: 100%`.
- **Handle:** `32×4px` pill, `#d1d5db` (`bg-gray-300`), centered top.
- **Title:** `"Remind [Customer Name]"` — `Inter 16px/700 #111827`.
- **Subtitle:** `"Select how to send the payment reminder"` — `Inter 14px/400 #6B7280`.
- **Option Cards (stacked, `16px` gap):**
  - **WhatsApp (Primary):** `bg-green-50`, border `border-green-200`. Left: `MessageSquare` green icon inside `bg-green-100` circle. Center: `"Send via WhatsApp"` + `"Opens pre-filled message"`. Right: `chevron-right`.
  - **SMS (Secondary):** `bg-blue-50`, border `border-blue-200`. Left: `MessageSquare` blue icon inside `bg-blue-100` circle. Center: `"Send via SMS"` + `"Standard text message"`. Right: `chevron-right`.
- **Cancel:** Centered text `"Cancel"` — `Inter 16px/500 #9ca3af`.

---

### P4 — Delete Confirm Modal

**Triggered by:** `"Delete Entry"` in ⋮ overflow menu.

- **Overlay:** `rgba(0,0,0,0.50)`.
- **Modal:** Centered card (not bottom sheet). `bg: #f8fafc` (`bg-slate-50`), `borderRadius: 20px`, `padding: 24px`, `width: 320px`.
- **Top icon:** `trash` `24px` inside `bg-rose-200` circle.
- **Title:** `"Delete Entry?"` — `Inter 18px/700 #111827`.
- **Body:** `"Entry #[bill_number] and all its payment records will be permanently deleted."` — `Inter 14px/400 #475569`, centered.
- **Buttons (stacked, `8px` gap):**
  - Primary: `"Delete Permanently"` — `bg: #b91c1c` (`bg-red-700`), white `Inter 16px/600`, `borderRadius: full`, `height: 48px`.
  - Secondary: `"Cancel"` — `bg: #e0f2fe` (`bg-sky-100`), `#111827 Inter 16px/500`, `borderRadius: full`, `height: 48px`.

---

### P5 — Record Payment Bottom Sheet

> **Use the built version** from `RecordCustomerPaymentModal`. Do not redesign.

- **Overlay:** `rgba(0,0,0,0.40)`.
- **Sheet:** `height: 70%`, `bg: #ffffff`, `borderRadius: 20px` top-only, `padding: 20px`.
- **Handle** at top.
- **Title:** `"Record Payment"`. Sub: `"Entry [ID] · Balance ₹[amount]"` `Inter 13px/400 #9ca3af`.
- **Amount input:** `₹` prefix, `Inter 28px/700`, `bg: #f9fafb`, `height: 64px`.
- **Payment method chips:** `Cash` `UPI` `Cheque` `Bank Transfer`. Selected: `bg: #16a34a` white. Unselected: `bg: #f3f4f6`.
- **Date row:** `"Today, [date]"` with calendar icon.
- **Note (optional):** `"e.g. Advance payment"` placeholder.
- **CTA:** `"Save Payment"` full-width solid green.
- **When triggered by `"Mark as Paid"`:** Amount pre-filled with full outstanding balance. Cash pre-selected.

---

## 9. EDIT ENTRY SCREEN SPEC (P7A) — ✅ APPROVED

### Purpose
Modify the details of an existing entry. Pre-filled with all current values. Customer is locked.

### Layout
- **No tab bar.**
- **Header:** `"Edit Entry [bill_number]"` + `"Edited N times"` subtitle.
- **Warning Banner:** Amber, ⚠️ icon, left border `4px solid #f59e0b`, `bg: #fffbeb`. Text: `"Editing will update the person's ledger and payment history"`.
- **Locked Person Row:** `"Person (cannot be changed)"` label. Green avatar system. Lock icon right.
- **Note Field:** Inside / adjacent to Itemized Details section.
- **Itemized Details:** Editable rows, red 🗑️ per row.
- **Totals:** Subtotal → Loading Charge (editable) → GST % (editable) → Tax (calculated) → Grand Total `Inter 16px/700 #111827`.
- **Balance:** Previous Balance → New Total → Total Outstanding `#ef4444`.
- **Save Button:** Full-width solid green, ✓ checkmark icon, `"Save"`.
- **Save → opens P7B.**

### Code Notes
1. Item card: `bg: #ffffff`, `border: 1px #e5e7eb`.
2. Grand Total color: `#111827`. NOT red.
3. Item Name: must pre-fill from entry data at runtime.

---

## 10. SAVE CONFIRMATION BOTTOM SHEET SPEC (P7B) — ✅ APPROVED

- **Bottom sheet.** Overlay `rgba(0,0,0,0.45)`.
- **Handle:** `40×4px` pill, `#d1d5db`.
- **Title:** `"Save changes?"` — `Inter 18px/700 #111827`.
- **Subtitle:** `"This will update the person's ledger and payment history."` — `Inter 14px/400 #6b7280`.
- **Button 1:** Full-width solid green — `"Save & Share PDF"`, share icon, `height: 52px`.
- **Button 2:** Full-width outline green — `"Save Only"`, ✓ icon, `height: 52px`.
- **Cancel:** Centered plain text `"Cancel"` `#9ca3af`.

---

## 11. STATE MATRIX

| Component | PENDING | PARTIAL | PAID | OVERDUE |
|---|---|---|---|---|
| Hero Gradient | Orange | Blue | Green | Red |
| Hero Amount | Balance due | Remaining balance | `₹0` | Balance due |
| Due Date Line | `"Due [date]"` | `"Due [date]"` | Hidden | `"Overdue · X days"` |
| Customer Card | Normal | Normal | Normal | Normal |
| Payments Card | Empty state | Has rows + progress | All rows + 100% | Empty or has rows |
| Items Card | Collapsed (subtotal) | Collapsed (subtotal) | Collapsed (subtotal) | Collapsed (subtotal) |
| ⋮ Overflow | Full 6 items | Full 6 items | 5 items (Mark as Paid hidden) | Full 6 items |
| Action Bar (Pri) | Record Payment | Record Payment | Share Receipt (full width) | Record Payment |
| Action Bar (Sec) | Remind (neutral) | Remind (neutral) | — | Remind (red outline) |
| Success Banner | — | — | Only if `justPaid=true` | — |
| State Priority | Default | Overridden by Overdue if past due | Terminal | Wins over Partial |

---

## 12. WHAT CHANGED AND WHY

| Old | New | Reason |
|---|---|---|
| Customer card below Quick Actions | Customer card at TOP | WHO before HOW MUCH |
| QuickActionTile for Edit/Delete/Remind | ⋮ header overflow for Edit/Delete; Remind in Action Bar only | Admin actions are rare; Remind is frequent |
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
| Overflow order: Share first | **Edit first** in overflow | Edit is most frequent admin action |
| Overflow width 180px (doc) | **200px** (as-built) | Better label readability on device |
| Overflow overlay `rgba(0,0,0,0.20)` | **`rgba(0,0,0,0.30)`** (as-built) | Sufficient dimming without blocking content |
| Divider between groups only | **Divider between every item** (as-built) | Cleaner visual separation, intentional |
| `EntryQuickActions` with Edit+Delete+Remind | **Dead component** — must not render | Edit/Delete in overflow; Remind in Action Bar |
| No token reference | Design token table in §3 | Single source of truth for colour |

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
| Entry Timeline on Entry Detail? | ✅ No. Not now, not in v2 for this screen. |
| OVERDUE + partial payments — which state wins? | ✅ OVERDUE wins. Past-due date overrides PARTIAL. |
| PARTIAL trigger — automatic or manual? | ✅ Automatic. First recorded payment with balance > ₹0 = PARTIAL. |
| Overpayment handling? | ✅ Show `₹0` hero, `"Overpaid by ₹X"` in Payments sub-label. Never block payment recording. |
| Deleted customer on entry? | ✅ Show `"[Deleted Customer]"`, hide icons, disable card tap. |
| Mark as Paid visibility on PAID entry? | ✅ Hidden in overflow menu when entry is already PAID. |
| Remind pre-filled message content? | ✅ `"Hi [Name], your payment of ₹[balance] for Invoice #[ID] is due. Please pay at your earliest convenience."` Not editable in v1. |
| Record Payment button disabled on PAID? | ✅ Never disabled. Overpayment is valid (data correction use case). |
| Max payment rows shown? | ✅ All rows shown. No pagination in v1. |
| Delete with existing payments — extra warning? | ✅ Yes. Show amber warning line in P4 modal if entry has payments. |
| Overflow item order? | ✅ Edit → Share → View Customer → Print → Mark as Paid → Delete (as-built). |
| Overflow width? | ✅ 200px (as-built, intentional). |
| Overflow overlay opacity? | ✅ `rgba(0,0,0,0.30)` (as-built, intentional). |
| Divider between all items or groups only? | ✅ Every item (as-built, intentional). |
| `EntryQuickActions` fate? | ✅ Dead code — must not render. Edit/Delete → overflow. Remind → Action Bar. |

---

## 14. COMPONENT MAP

| Component / Screen | Spec / Screen ID | File Path |
|---|---|---|
| Entry Detail (Container) | P0 / P8 / P9 / P10 | [app/(main)/entries/[orderId].tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId].tsx) |
| Edit Entry (Container) | P7A | [app/(main)/entries/[orderId]/edit.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId]/edit.tsx) |
| Detail Header | A1 | [src/components/layer2/DetailHeader.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/DetailHeader.tsx) |
| Overflow Menu | A2 / P2 | [src/components/layer2/OverflowMenu.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/OverflowMenu.tsx) |
| Customer Card | A3 | [src/components/entries/EntryCustomerCard.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EntryCustomerCard.tsx) |
| Hero Card | A4 | [src/components/entries/EntryHeroCard.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EntryHeroCard.tsx) |
| Payments Card | A5 | [src/components/entries/EntryPaymentsSection.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EntryPaymentsSection.tsx) |
| Items Card | A6 / P1 | [src/components/entries/EntryItemsSection.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EntryItemsSection.tsx) |
| Sticky Action Bar | A7 | [src/components/entries/EntryStickyBar.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EntryStickyBar.tsx) |
| Save Entry Bottom Sheet | P7B | [src/components/entries/SaveEntryBottomSheet.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/SaveEntryBottomSheet.tsx) |
| Entry Summary Card | F1 | [src/components/entries/EntrySummaryCard.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EntrySummaryCard.tsx) |
| Base Bottom Sheet | F3 | [src/components/layer2/BaseBottomSheet.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/BaseBottomSheet.tsx) |
| EditWarningBanner | - | [src/components/entries/EditWarningBanner.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EditWarningBanner.tsx) |
| EditCustomerCard | - | [src/components/entries/EditCustomerCard.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EditCustomerCard.tsx) |
| EditItemizedSection | - | [src/components/entries/EditItemizedSection.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/EditItemizedSection.tsx) |
| OrderSummary | - | [src/components/orders/OrderSummary.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/OrderSummary.tsx) |
| OrderItemCard | - | [src/components/orders/OrderItemCard.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/OrderItemCard.tsx) |
| BillFooter | F6 | [src/components/orders/BillFooter.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/BillFooter.tsx) |
