-- Guard against overpayment: amount_paid must never exceed total_amount
-- balance_due = total_amount - amount_paid (GENERATED column) would go
-- negative if this constraint is violated, causing downstream divergence
-- between client-side SUM and trigger-based customer_balance.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.check_constraints
    WHERE  constraint_name = 'orders_amount_paid_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_amount_paid_check
      CHECK (amount_paid <= total_amount);
  END IF;
END $$;
