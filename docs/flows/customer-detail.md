# KredBook — Customer Detail Screen UX Specification

> **Last Updated**: May 17, 2026
> **Version**: v4.1.5d (final UX polish)

---

## Screen Purpose

The **Customer Detail** screen is the **most important screen** in the app. It's where shopkeepers spend 80% of their time — checking balances, recording payments, and viewing transaction history.

**Primary Goal**: Make the balance instantly visible and actions instantly accessible.

## Visual Source Notes (Customer Detail Fidelity Pass)

Primary reference:
- `designs/Customer Detail Screen.png`

Secondary references:
- `designs/Customer Detail Empty Screen.png`
- `designs/Seller Dashboard.png` (hero visual language only)

Reused from references:
- Strong rounded gradient balance hero with amount-first hierarchy.
- Hero status pill styling and subtle decorative orbs.
- White secondary surfaces for CTA cluster and transaction history section.
- Dense, list-first transaction rows with compact icon, title/subtitle, amount, and running balance.
- Segmented filter tabs (`All`, `Entries`, `Payments`) in a pill container.

Ignored on purpose (outdated / out of scope):
- Supplier/product/distributor widgets and flows.
- Legacy reminder/report widgets not part of current Customer detail scope.
- Any extra dashboard-style metrics beyond balance, actions, and transaction history.

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ HEADER (fixed, 56dp)                        │
│ [←]  Customer Name           [PDF] [Call]   │
├─────────────────────────────────────────────┤
│ SCROLLABLE CONTENT                          │
│ ┌─────────────────────────────────────────┐ │
│ │ HERO BALANCE CARD                       │ │
│ │ Total Balance Due        [OVERDUE]     │ │
│ │ ₹25,000                                 │ │
│ │ Last entry: 15 Jan 2026                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ PRIMARY CTAs                           │ │
│ │ [Add Entry 🟢]  [Record Payment 🔴]     │ │
│ │ [Share] [Quick Pay ₹Xk]                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ TRANSACTION LIST                        │ │
│ │ [All] [Entries] [Payments] (tabs)      │ │
│ │ ─────────────────────────────────────  │ │
│ │ ● Entry #001  ₹5,000    15 Jan         │ │
│ │   Bal: ₹25,000                          │ │
│ │ ─────────────────────────────────────  │ │
│ │ ● Payment  -₹2,000   14 Jan           │ │
│ │   Bal: ₹20,000                          │ │
│ │ ─────────────────────────────────────  │ │
│ │ ● Entry #002  ₹7,000   10 Jan         │ │
│ │   Bal: ₹22,000                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ FOOTER ACTIONS                          │ │
│ │ [Download PDF]  [Share WhatsApp]        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Reference Layout States

#### Default (balance due)

```text
[←] [AS] Ankit Shah                [Reminder] [Call]

┌────────────────────────────────────┐
│ BALANCE DUE               [OVERDUE] │
│ ₹25,000                            │
│ Last entry: 15 Jan                 │
│ Open entry due: ₹12,400            │
└────────────────────────────────────┘

[Add Entry]
[Share] [PDF]

[All] [Entries] [Payments]
- Entry #001       ₹5,000
- Payment         -₹2,000

[Sticky Collect Bar]
Balance due ₹12,400   [Collect]
```

#### Payments tab selected

```text
[←] Ankit Shah                  [Reminder] [Call]

┌────────────────────────────────────┐
│ TOTAL BALANCE DUE        [OVERDUE] │
│ ₹25,000                            │
└────────────────────────────────────┘

[Add Entry]

[All] [Entries] [Payments*]
- Payment         -₹2,000
- Payment         -₹1,500
```

#### Cleared balance state

```text
[←] [AS] Ankit Shah                [Reminder] [Call]

┌────────────────────────────────────┐
│ ALL SETTLED                        │
│ ₹0                                 │
│ Status: no dues                    │
└────────────────────────────────────┘

[Add Entry]
[Share] [PDF]

No sticky collect bar
```

---

## Component Specifications

### 1. Header (56dp height)

| Element | Spec |
|---------|------|
| Back button | 44×44dp touch target, ArrowLeft icon |
| Identity | Avatar/initials + customer name + last active |
| Title | Customer name, 17px bold, single line |
| Right actions | Reminder (icon), Call (icon), 44dp each |

### 2. Hero Balance Card

| Element | Spec |
|---------|------|
| Height | 140dp |
| Background | Subtle gradient: Red when overdue, Amber when pending, Deep green when settled |
| Amount | 38px, bold, white |
| Label | 11px, uppercase, white/70% |
| Status badge | "OVERDUE · 15 days" pill when overdue |
| Fallback text | "No outstanding balance" when cleared |

### 3. Primary CTAs

**Row 1 — Main Actions**

| Button | Style | Behavior |
|--------|-------|----------|
| Add Entry | Primary (`colors.primary`), full-width | Opens create screen with customer pre-filled |
| Record Payment | Danger (`colors.danger`) when due, gray when settled | Opens payment modal |

**Row 2 — Timeline Actions**

| Button | Style | Behavior |
|--------|-------|----------|
| Add Entry | Secondary action tile | Opens create entry pre-filled with customer |
| Share | Secondary action tile | Opens ledger share flow |
| PDF | Secondary action tile | Generates and shares statement PDF |

Layout note: these CTAs render as a flat 3-column row outside the card shell, between the filter tabs and the transaction timeline.

### 3.1 Sticky Collect Bar

Shows only when `outstandingBalance > 0` and `pendingOrderId` exists.

| Element | Spec |
|---------|------|
| Left block | Compact `Balance due` + amount |
| Main CTA | `Collect` (opens `RecordCustomerPaymentModal`) |
| Secondary icon | Add Entry shortcut |
| Position | Fixed above bottom safe area; does not cover timeline rows |

### 4. Transaction List

**Filter Tabs**

| Tab | Shows |
|-----|-------|
| All | Both entries and payments |
| Entries | Bills/entries only |
| Payments | Payments only |

**Transaction Row**

| Element | Spec |
|---------|------|
| Left border | 4dp, Green for payment, Red for entry |
| Icon | 38dp circle with arrow (up=entry, down=payment) |
| Title | "Entry #001" or "Payment" |
| Subtitle | Mode (Cash/UPI) or date |
| Amount | Right-aligned, 16px bold, colored |
| Running balance | Below title, 12px, gray |

### 5. Empty State

When no transactions:
- Dashed border icon
- "No transactions yet" message
- "Add an entry to start this ledger" subtitle

---

## Visual Design

### Color System

| State | Background | Text |
|-------|------------|------|
| Balance Due | `#DC2626 → #B91C1C` (red gradient) | White |
| Balance Pending | `#F59E0B → #B45309` (amber gradient) | White |
| Balance Cleared | `#166534 → #052E16` (deep green gradient) | White |
| Balance Overdue | `#991B1B → #B91C1C` (red gradient) | White |

Hero surface includes soft decorative blobs layered behind the content, using state-matched translucent tokens.
| Payment | Left border green | Amount green |
| Entry | Left border red | Amount red |
| Overdue badge | `rgba(255,255,255,0.18)` (white/18%) | White |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Balance amount | Inter | 38px | 800 |
| Transaction title | Inter | 15px | 700 |
| Transaction amount | Inter | 16px | 800 |
| Running balance | Inter | 12px | 500 |
| Tab labels | Inter | 13px | 600 |
| Button text | Inter | 14px | 700 |

### Spacing

| Element | Value |
|---------|-------|
| Screen padding | 16dp |
| Card padding | 22dp |
| Card border radius | 20dp |
| Button height | 52dp |
| Button border radius | 16dp |
| Transaction row padding | 14dp |
| Section gap | 16dp |

---

## Interactions

### Tap Behaviors

| Element | Action |
|---------|--------|
| Back arrow | Navigate back |
| Customer name (header) | None (static) |
| PDF icon | Download statement PDF |
| Call icon | Open phone dialer |
| Add Entry button | Navigate to create screen |
| Record Payment button | Open payment modal |
| Share button | Share ledger via WhatsApp |
| Quick Pay button | Record payment with pre-filled amount |
| Transaction row | Navigate to entry detail |
| Filter tab | Filter transaction list |

### Animations

| Action | Animation |
|--------|-----------|
| Screen transition | Slide from right (300ms) |
| Modal open | Slide up from bottom (250ms) |
| Button press | Scale to 0.96 (100ms) |
| Tab switch | Fade (150ms) |

---

## States

### Balance States

| State | Hero Background | Amount Color | Status |
|-------|-----------------|--------------|--------|
| Has dues | Red gradient | White | Shows "TOTAL BALANCE DUE" |
| Overdue | Red gradient | White | Shows "OVERDUE · X days" |
| Cleared (₹0) | Green gradient | White | Shows "No outstanding balance" |
| Advance (negative) | Green gradient | White | Shows "Advance: ₹X,XXX" |

### Button States

| Button | Has Balance | No Balance |
|--------|-------------|-------------|
| Add Entry | Green, enabled | Green, enabled |
| Record Payment | Red, enabled | Gray, disabled |
| Quick Pay | Shows amount | Hidden |

---

## Edge Cases

### Long Customer Name

- Truncate with ellipsis after 20 characters
- Full name shown in Customer Detail

### Very Large Amount

- Format with Lakhs: ₹5.25L
- Or Crores: ₹2.50Cr

### No Transactions

- Show empty state with CTA to add entry
- No "0 transactions" text without guidance

### Network Offline

- Show last cached data
- Queue all mutations
- Show sync status banner

### Customer Has No Phone

- Hide call button in header

---

## Accessibility

| Element | Accessibility |
|---------|---------------|
| Balance amount | Screen reader announces "Balance: ₹X,XXX" |
| Status badge | Announces "Overdue, X days" |
| Transaction amount | Announces "Payment received: ₹X" or "Entry: ₹X" |
| Buttons | Minimum 44dp touch target |

---

## Performance

| Metric | Target |
|--------|--------|
| Initial render | < 300ms |
| Transaction list scroll | 60fps |
| Payment modal open | < 250ms |

---

## Implementation Checklist

- [x] Hero balance card with gradient
- [x] Add Entry primary button (green)
- [x] Record Payment button (red when due)
- [x] Quick Pay with amount
- [x] Share ledger button
- [x] Transaction list with tabs
- [x] Transaction row with color coding
- [x] Running balance per row
- [x] Empty state
- [x] Call button (when phone exists)
- [x] PDF download button
- [x] Filter tabs (All/Entries/Payments)

---

## Related Documentation

- `docs/design-system.md` — Color tokens, typography
- `docs/flows/record-payment.md` — Record Payment flow
- `docs/ARCHITECTURE.md` — Data layer

---

*This screen is optimized for quick actions. Every element should answer: "How much?" or "What do I do next?"*
