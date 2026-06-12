-- Fix: case-insensitive status check in sync_party_customer_balance
-- The old `status != 'Paid'` misses rows with 'paid', 'PAID', etc.
-- Also add a CHECK constraint on orders.status to prevent invalid values.

CREATE OR REPLACE FUNCTION public.sync_party_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.parties
  SET customer_balance = COALESCE(
    (
      SELECT SUM(balance_due)
      FROM public.orders
      WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
        AND LOWER(status) != 'paid'
    ),
    0
  )
  WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Constrain orders.status to valid values
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Paid', 'Pending', 'Partially Paid'));
