-- Fix: The sync_party_customer_balance() function was created in
-- 20260512_fix_customer_balance_trigger.sql but the trigger binding
-- on the orders table was never created. This means parties.customer_balance
-- has been stale since the initial migration (only set once during
-- 20260408_migrate_customers_to_parties.sql) and never updated when
-- orders are inserted, updated, or deleted.
--
-- This migration:
--   1. Creates the missing trigger on orders
--   2. Recalculates customer_balance for all parties from current orders
--   3. Also fires the trigger on payments changes (since payments update
--      order amount_paid/status via on_payment_upsert, which in turn
--      updates balance_due via GENERATED ALWAYS AS)

CREATE TRIGGER sync_customer_balance_on_order_change
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_party_customer_balance();

-- One-time recalc: fix all stale customer_balance values
UPDATE public.parties
SET customer_balance = COALESCE(
  (
    SELECT SUM(balance_due)
    FROM public.orders
    WHERE customer_id = parties.id
      AND LOWER(status) != 'paid'
  ),
  0
)
WHERE is_customer = TRUE;
