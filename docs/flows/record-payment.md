# KredBook - Record Payment Flow

> Last Updated: May 09, 2026  
> Version: v4.1.4 (Dashboard-first redesign)

## Purpose

Record Payment is a shared bottom-sheet used from Dashboard, Entry Detail, and Customer Detail. It is designed as a fast cash-collection surface with predictable height, fixed CTA, and clear result states.

## Trigger Points

- Dashboard collect actions (`DashboardPaymentFlow`)
- Entry Detail record payment
- Customer Detail record payment

## Sheet Structure

- Single stable snap point: `90%`
- Base container: `BaseBottomSheet`
- Header and body are inside scroll content
- Primary action is fixed in a bottom-sheet safe-area footer

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
- `RecordPaymentForm.tsx` - form body (amount, chips, mode, notes)
- `RecordPaymentResult.tsx` - confirmed/queued receipt result UI

## Form UX

- Title: `Record Payment`
- Subtitle: contextual copy for customer + entry collection
- Customer card shows avatar and current entry balance
- Large amount input with rupee prefix and quick chips:
  - Full
  - Half
  - Clear
- Payment mode chips (Cash/UPI/NEFT/Draft/Cheque) with strong selected state
- Remaining-balance message updates for full vs partial payment
- Notes remain optional

## Footer Behavior

- Form stage uses fixed footer CTA:
  - `Record Payment` or `Mark Fully Paid`
- Footer is rendered through bottom-sheet footer component (not inside scroll body)
- Content includes extra bottom spacer so last field is never hidden behind footer
- Keyboard remains interactive and CTA stays reachable
- Android keyboard mode uses `adjustResize` and footer respects safe-area inset

## Result States

- `confirmed`
  - Success panel + summary card
  - `Share receipt` + `Done`
- `queued`
  - Offline panel + summary card
  - `Done`

Both states preserve existing receipt template and payment submission semantics.

## Non-negotiables Preserved

- No schema or Supabase flow changes
- No offline queue behavior changes
- No `useRecordPayment` contract changes
- No route/navigation flow changes

## Verification Checklist

- Dashboard collect -> opens sheet at a predictable height
- Full and partial amounts compute correctly
- Confirmed and queued states show correct copy and color surfaces
- Share receipt opens native share sheet
- Done dismisses modal cleanly
- Entry Detail and Customer Detail open same redesigned sheet
- `npm run lint` passes
