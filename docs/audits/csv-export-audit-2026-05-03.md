# CSV Export Audit — 2026-05-03

Scope: correctness and locale safety for customer ledger CSV export.

## Checks Requested

1. Validate exported totals match on-screen totals (spot-check 3 customers)
2. Confirm all amounts use `formatINR` (no raw `toLocaleString`)
3. Confirm date format is `DD MMM YYYY` across export rows
4. Flag CSV row break risk for customer names with commas

## Findings

### 1) Totals Match (Spot-check 3 customers): PASS

Using Supabase SQL on project `sfmoefgjmgkwvauyaiyz`, compared:

- UI-style outstanding: `SUM(orders.balance_due)`
- Export-style running balance: `SUM(orders.total_amount) - SUM(payments.amount)` (payments joined via `orders`)

Results:

- Ankit Shah: `3500.00` vs `3500.00` (match)
- Priya Verma: `10500.00` vs `10500.00` (match)
- Suresh Mehta: `45000.00` vs `45000.00` (match)

Conclusion: 3/3 customer spot-check passed.

### 2) Amount Locale Formatting (`formatINR`): FAIL (CSV path)

Observed in `app/(main)/export/index.tsx`:

- CSV rows are built with raw numeric values (`amount`, `balance_after`) and passed to `toCsv()`.
- No `formatINR` is applied in this CSV row mapping.

Conclusion: amount formatting is not locale-formatted in CSV rows.

### 3) Date Formatting (`DD MMM YYYY`): FAIL (CSV rows)

Observed in both:

- `app/(main)/export/index.tsx` (`e.date.substring(0, 10)`)
- `src/api/exportCustomer.ts` (`entry.date.substring(0, 10)`)

Current format is `YYYY-MM-DD`, not `DD MMM YYYY`.

Conclusion: date format is inconsistent with requested output format.

### 4) CSV Safety for Commas in Names: PASS

Observed in `src/utils/exportCsv.ts`:

- `escapeCell()` wraps fields containing comma/newline/quote in double quotes and escapes inner quotes.

This correctly protects CSV structure when customer names or descriptions include commas.

## Risk Notes

- Filename generation in `app/(main)/export/index.tsx` sanitizes whitespace but not punctuation; this does not break CSV content, but may create less predictable filenames.

## Recommended Follow-up (`/fix`)

1. Apply `formatINR` consistently to CSV amount fields (or intentionally export numeric-only with explicit product decision).
2. Replace raw date substring with a single shared formatter for `DD MMM YYYY`.
3. Keep `escapeCell()` as-is (it is correct and protects comma-containing values).
