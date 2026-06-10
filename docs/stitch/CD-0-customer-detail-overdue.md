# Stitch Prompt — CD-0: Customer Detail Screen (Overdue State)

> **Canonical base.** All other Customer Detail states (CD-1 through CD-7) are deltas against this screen.
> **Doc reference:** [`docs/screens/customer-detail.md`](../screens/customer-detail.md) — v3.0 Locked

---

## GLOBAL RULES (apply to every element on this screen)

- Platform: React Native / Expo. Render as a mobile screen `390×844pt`.
- Font: **Inter** throughout. No other typeface.
- Canvas background: `#F9FAFB`.
- All cards: `borderRadius: 16px`, `backgroundColor: #FFFFFF`, `border: 1px solid #E5E7EB`, `16px` left/right screen margin.
- Gap between every card/component: `12px`.
- No tab bar. No bottom navigation. This is a detail screen.
- Safe area padding at top only.
- Icons: Lucide style, `strokeWidth: 2`.
- Do NOT use shadows heavier than `elevation: 4` on cards (except hero which uses `elevation: 8`).
- All amounts formatted Indian style: `₹1,20,000` not `₹120,000`.

---

## SCREEN: Customer Detail — OVERDUE State

**Customer context for this prompt:**
- Customer name: `Ramesh Verma`
- Phone: `+91 98765 43210`
- Net balance due: `₹18,500`
- Oldest overdue entry: `22 days` overdue
- Open entries count: `2 open entries · ₹18,500 due`
- Timeline has: 1 overdue entry, 1 pending entry, 1 payment row

---

## SECTION 1 — HEADER BAR

**Height:** `56px`. **Background:** `#FFFFFF`. **Horizontal padding:** `16px`.

### Left cluster (flex-row, gap 10px, vertically centered)
- **Back arrow:** `ArrowLeft` icon, `22px`, color `#111827`, `hitSlop: 10` on all sides.
- **Avatar:** `44×44px` circle.
  - Background: `#DCFCE7`.
  - Initials: `"RV"` — Inter Bold `15px`, color `#16A34A`.
  - No border.

### Center (flex: 1, centered horizontally)
- **Name:** `"Ramesh Verma"` — Inter SemiBold `17px`, color `#111827`, `numberOfLines: 1`.
- **Subtitle:** `"₹18,500 due"` — Inter Regular `13px`, color `#6B7280`. Sits directly below name, `lineHeight: 18`.

### Right cluster (flex-row, gap 4px, vertically centered)
- **Phone icon button:** `Phone` icon `22px`, color `#16A34A`, inside a `44×44px` touch target.
- **WhatsApp icon button:** `MessageCircle` icon `22px`, color `#16A34A`, inside a `44×44px` touch target.
- **Overflow button:** `MoreVertical` icon `22px`, color `#111827`, inside a `44×44px` touch target.

> No bottom border on the header. Clean edge.

---

## SECTION 2 — BALANCE HERO CARD

**Layout:** Full screen width, `mx-4` (16px each side), `borderRadius: 20px`, `paddingHorizontal: 24px`, `paddingVertical: 24px`, `elevation: 8`.

**Background:** `LinearGradient`, left-to-right horizontal.
- Start color: `#DC2626` (left)
- End color: `#7F1D1D` (right)

**Watermark orb:** Large circle `160×160px`, `backgroundColor: rgba(255,255,255,0.10)`, positioned absolute `top: -10, right: -58`. Partially clipped by card overflow hidden.

### Content (top → bottom, white text throughout)

**Row 1 — Label**
- Text: `"BALANCE DUE"`
- Style: Inter SemiBold `11px`, `color: #FFFFFF`, `letterSpacing: 1.4`, uppercase.
- `marginBottom: 6px`.

**Row 2 — Hero Amount**
- Text: `"₹18,500"`
- Style: Inter ExtraBold `36px`, `color: #FFFFFF`, `lineHeight: 42`.
- `paddingBottom: 16px`.

**Row 3 — Status row** (flex-row, `justifyContent: space-between`, `alignItems: center`)

- **Left — Status badge pill:**
  - Container: `backgroundColor: rgba(255,255,255,0.20)`, `borderRadius: 9999px`, `paddingHorizontal: 12px`, `paddingVertical: 4px`.
  - Content: flex-row, gap `6px`.
    - Icon: `AlertCircle` `14px` white.
    - Text: `"Overdue"` — Inter Bold `12px`, `color: #FFFFFF`.

- **Right — Aging label:**
  - Text: `"Overdue · 22 days"`
  - Style: Inter Regular `13px`, `color: rgba(255,255,255,0.75)`.

**Row 4 — Open entries line**
- Text: `"2 open entries · ₹18,500 due"`
- Style: Inter Regular `13px`, `color: rgba(255,255,255,0.75)`.
- `marginTop: 8px`.

---

## SECTION 3 — ACTION STRIP

**Layout:** `mx-4`, `borderRadius: 16px`, `backgroundColor: #FFFFFF`, `border: 1px solid #E5E7EB`, `paddingHorizontal: 16px`, `paddingVertical: 14px`. Flex-row, `gap: 10px`, `alignItems: center`.

### Button 1 — Collect Payment (60% width)
- **Shape:** `borderRadius: 9999px`, `height: 52px`.
- **Background:** `#16A34A` (solid green — NEVER red, even in overdue state).
- **Content:** flex-row, centered, `gap: 8px`.
  - Icon: `ArrowDownLeft` `18px`, `color: #FFFFFF`.
  - Label: `"Collect Payment"` — Inter SemiBold `15px`, `color: #FFFFFF`.

### Button 2 — Add Entry (36% width)
- **Shape:** `borderRadius: 9999px`, `height: 52px`.
- **Background:** `#FFFFFF`.
- **Border:** `1px solid #E5E7EB`.
- **Content:** flex-row, centered, `gap: 6px`.
  - Icon: `Plus` `16px`, `color: #111827`.
  - Label: `"+ Add Entry"` — Inter Medium `14px`, `color: #111827`.

---

## SECTION 4 — TRANSACTION TIMELINE

**Container:** `mx-4`, `backgroundColor: #FFFFFF`, `borderRadius: 16px`, `border: 1px solid #E5E7EB`, `paddingHorizontal: 16px`.

### 4.1 Filter Tabs

Horizontally scrollable row of chips. `paddingVertical: 12px`. `gap: 8px`.

| Tab | State in this screen | Style |
|---|---|---|
| `All` | **Selected** | `bg: #16A34A`, label Inter Bold `13px` `#FFFFFF`, `borderRadius: 9999px`, `paddingH: 14px`, `paddingV: 7px` |
| `Entries` | Unselected | `bg: #F4F4F0`, label Inter Regular `13px` `#6B7280`, same padding |
| `Payments` | Unselected | `bg: #F4F4F0`, label Inter Regular `13px` `#6B7280`, same padding |

1px `#F3F4F6` divider below tab row.

---

### 4.2 Section Header — "Today"

- Text: `"TODAY"`
- Style: Inter Bold `11px`, `color: #6B7280`, `letterSpacing: 1.2`, uppercase.
- `paddingVertical: 8px`, `paddingHorizontal: 4px`.
- No background, no border. Plain label.

---

### 4.3 Entry Row — OVERDUE (first row)

**Layout:** flex-row, `paddingVertical: 14px`, `alignItems: flex-start`. 1px `#F3F4F6` divider at bottom.

**Left icon circle:**
- Size: `36×36px`, `borderRadius: 9999px`.
- Background: `#FEE2E2`.
- Icon: `FileText` `16px`, color `#EF4444`.
- `marginRight: 12px`.

**Center block (flex: 1)**
- Row 1 (flex-row, `alignItems: center`, `gap: 6px`, `flexWrap: wrap`):
  - Title: `"Entry #1042"` — Inter SemiBold `14px`, `color: #111827`.
  - Status badge: `"Overdue"` — `backgroundColor: #FEE2E2`, `color: #EF4444`, Inter Bold `10px`, `borderRadius: 9999px`, `paddingH: 6px`, `paddingV: 2px`, uppercase.
  - Aging chip: `"22d overdue"` — `backgroundColor: #FEE2E2`, `color: #EF4444`, Inter Bold `11px`, `borderRadius: 9999px`, `paddingH: 8px`, `paddingV: 3px`.
- Row 2:
  - Subtitle: `"3 items · 2:30 pm"` — Inter Regular `13px`, `color: #6B7280`, `marginTop: 2px`.

**Right block (`alignItems: flex-end`)**
- Amount: `"₹12,000"` — Inter SemiBold `15px`, `color: #DC2626`.
- Running balance: `"Bal: ₹18,500"` — Inter Regular `12px`, `color: #6B7280`, `marginTop: 2px`.

---

### 4.4 Section Header — "Mon, 08 Jun 2026"

- Text: `"MON, 08 JUN 2026"`
- Same style as 4.2.

---

### 4.5 Payment Row (second row)

**Layout:** flex-row, `paddingVertical: 14px`, `alignItems: flex-start`. 1px `#F3F4F6` divider at bottom.

**Left icon circle:**
- Size: `36×36px`, `borderRadius: 9999px`.
- Background: `#DCFCE7`.
- Icon: `ArrowDownLeft` `16px`, color `#16A34A`.
- `marginRight: 12px`.

**Center block (flex: 1)**
- Row 1: `"Payment Received"` — Inter SemiBold `14px`, `color: #111827`.
- Row 2: `"UPI · 11:00 am"` — Inter Regular `13px`, `color: #6B7280`, `marginTop: 2px`.

**Right block (`alignItems: flex-end`)**
- Amount: `"+₹5,000"` — Inter SemiBold `15px`, `color: #16A34A`.
- Running balance: `"Bal: ₹30,500"` — Inter Regular `12px`, `color: #6B7280`, `marginTop: 2px`.

---

### 4.6 Section Header — "Fri, 05 Jun 2026"

- Text: `"FRI, 05 JUN 2026"`
- Same style as 4.2.

---

### 4.7 Entry Row — PENDING (third row)

**Layout:** Same as 4.3. No bottom divider (last row).

**Left icon circle:**
- Background: `#FEF3C7`.
- Icon: `FileText` `16px`, color `#D97706`.

**Center block:**
- Row 1: Title `"Entry #1038"` + Status badge `"Pending"` (`bg: #FEF3C7`, `color: #D97706`) + Aging chip `"Due 15 Jun"` (`bg: #FEF3C7`, `color: #D97706`).
- Row 2: `"2 items · 9:15 am"` — same caption style.

**Right block:**
- Amount: `"₹6,500"` — `color: #DC2626`.
- Running balance: `"Bal: ₹35,500"` — `color: #6B7280`.

---

## WHAT NOT TO RENDER

- ❌ No tab bar at bottom.
- ❌ No `CustomerQuickActionsRow` (deleted component — do not render).
- ❌ No floating sticky collect bar.
- ❌ No Share or PDF icons in the header bar.
- ❌ No red tint on "Collect Payment" button — always green `#16A34A`.
- ❌ Do not show `"Last active"` or `"Last bill"` anywhere.
- ❌ Do not show a WhatsApp button if no phone exists (this screen has a phone, so show it).

---

## ANNOTATION CALLOUTS (label these on the design)

1. **Hero gradient** → `"Left: #DC2626 → Right: #7F1D1D"`
2. **Aging label** → `"Always oldest overdue days (Q1 locked)"`
3. **Collect Payment** → `"Green always — never red tinted (Q4 locked)"`
4. **Running balance** → `"Shown on every row (Q5 locked)"`
5. **+ Add Entry** → `"Pre-selects Ramesh Verma automatically (Q2 locked)"`
6. **Payment row** → `"Tappable → opens PaymentDetailSheet (M3)"`

---

## DELTA NOTES FOR NEXT SCREENS

| Screen | Key change from CD-0 |
|---|---|
| CD-1 Pending | Hero gradient: Amber `#EF4444→#991B1B`. No `AlertCircle` in badge. Aging label: `"Due [date]"`. |
| CD-2 Settled | Hero gradient: Green `#22C55E→#047857`. Label: `"ALL SETTLED"`. Amount: `₹0`. Aging label: hidden. Action strip primary: `"Record Payment"` (muted). |
| CD-3 Advance | Hero gradient: Blue `#2563EB→#1D4ED8`. Label: `"ADVANCE"`. Amount shows credit. |
| CD-4 Empty | No timeline rows. EmptyState variant 1 shows. Action strip still visible. |
| CD-5 Overflow | Overlay dims screen. Dropdown card appears top-right below header. |
| CD-6 PaymentDetailSheet | Bottom sheet slides up over CD-0. Shows payment details. |
| CD-7 Success Banner | Green inline banner below header, `"Payment of ₹X recorded"`. |
