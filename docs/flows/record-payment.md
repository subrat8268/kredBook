# KredBook - Record Payment Flow

> Last Updated: May 11, 2026  
> Version: v4.1.4b (result and receipt polish)

## Purpose

Record Payment is a shared bottom-sheet used from Dashboard, Entry Detail, and Customer Detail. It is designed as a premium checkout-style cash-collection surface with a customer-led header, a dominant amount hero, intent-driven CTA copy, and predictable safe-area-aware footer behavior.

## Trigger Points

- Dashboard collect actions (`DashboardPaymentFlow`)
- Entry Detail record payment
- Customer Detail record payment

## Sheet Structure

- Dynamic sizing with max content cap for stable feel
- Header and body are inside scroll content
- Primary action is fixed in a bottom-sheet safe-area footer
- Android uses `adjustResize`; footer remains visible above gesture/nav area

## Architecture

### Hook

`src/components/people/record-payment/useRecordCustomerPaymentModal.ts`

Owns all local modal state and handlers:

- amount, payment mode, notes
- stage: `form | confirmed | queued`
- sanitized amount parsing and validation
- derived values: parsed amount, full/partial state, submit amount, remaining balance
- submit handler (wraps `useRecordPayment` without changing API/offline behavior)
- receipt share handler
- reset handler

### UI Components

- `RecordCustomerPaymentModal.tsx` - thin shell, ref wiring, auto-present, stage switch
- `RecordPaymentForm.tsx` - form body (customer-led header, amount hero, intent toggle, mode cards, notes)
- `RecordPaymentResult.tsx` - confirmed/queued receipt result UI
- `PaymentOutcomeHint.tsx` - pre-submit outcome hint row (clear/remaining/helper/error)

## Form UX

### Reference Layout (Checkout Sheet)

```text
[AS] Ankit Shah                         X
Balance due: ₹12,400

┌────────────────────────────────────┐
│        AMOUNT RECEIVED             │
│            ₹12,400                 │
│                                    │
│   [ Full Payment ] [ Partial ]     │
└────────────────────────────────────┘

✓ Balance will be cleared

PAYMENT MODE
[Cash] [UPI]
[Bank] [Cheque]

+ Add note

[✓ Mark Fully Paid]
```

- Customer-led header shows avatar, customer name, and current balance due.
- Amount hero is the dominant visual element and contains the Full / Partial intent toggle.
- Full intent defaults amount to total due and frames the action as pre-submit outcome (not completed state wording).
- Partial intent uses native numeric keyboard via `BottomSheetTextInput`.
- Outcome hint row sits below hero and above payment mode:
  - Full: `Balance will be cleared`
  - Partial valid: `Remaining ₹x after payment`
  - Partial empty: `Enter amount received` (neutral helper)
  - Partial overpay: `Amount cannot exceed ₹due` (danger hint)
- Payment method is a 2x2 card grid with clear selected state:
  - Cash -> `Cash`
  - UPI -> `UPI`
  - Bank -> internal mode `NEFT`
  - Cheque -> `Cheque`
- Notes are collapsed by default:
  - Collapsed label: `+ Add note`
  - Expanded label: `Note (optional)` with textarea visible

## Footer Behavior

- Form stage uses fixed footer CTA with intent-specific copy:
  - Full intent: `Mark Fully Paid`
  - Partial intent: `Record Payment`
  - Loading: `Recording...`
- Footer is rendered through bottom-sheet footer component (not inside scroll body)
- Content includes extra bottom spacer so last field is never hidden behind footer
- Keyboard remains interactive and CTA stays reachable
- Android keyboard mode uses `adjustResize` and footer respects safe-area inset

## Validation Behavior

- Partial amount does not show immediate red validation when user first switches to Partial.
- Empty partial amount disables CTA without immediate error; helper hint remains neutral.
- Red inline amount errors are delayed until user touches/invalidates amount or attempts submit.
- Partial overpay (amount greater than due) is blocked:
  - CTA disabled
  - Hint explains the limit (`Amount cannot exceed ₹due`)
- Submit math and `useRecordPayment` integration remain unchanged.

## Result States

- `confirmed`
  - Premium receipt-style success panel with status pill (`Confirmed`) and large amount highlight
  - Receipt card keeps customer, amount received, and balance-cleared/remaining breakdown
  - `Share receipt` + `Done`
- `queued`
  - Premium receipt-style queued panel with queue status treatment (`Queued`)
  - Receipt card mirrors confirmed layout for visual parity
  - `Done`

Both states preserve existing receipt template and payment submission semantics.

## Non-negotiables Preserved

- No schema or Supabase flow changes
- No offline queue behavior changes
- No `useRecordPayment` contract changes
- No route/navigation flow changes
- No receipt template changes

## Verification Checklist

- Dashboard collect -> opens shared Record Payment sheet
- Full flow: defaults to balance due, CTA is `Mark Fully Paid`
- Partial flow: native numeric keyboard, empty amount disables CTA without immediate red error, valid amount enables CTA
- Remaining balance hint updates based on partial input
- Payment mode cards map correctly (Bank -> `NEFT`)
- Notes collapse by default and preserve submitted text
- Confirmed and queued states show correct copy and color surfaces
- Share receipt opens native share sheet
- Done dismisses modal cleanly
- Entry Detail and Customer Detail open same redesigned sheet
- `npm run lint` passes
