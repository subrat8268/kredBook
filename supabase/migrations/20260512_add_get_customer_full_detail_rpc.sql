-- Single-RPC replacement for orders query + get_customer_statement
-- Reduces CD screen from 2 round-trips to 1.
-- Returns orders array and statement (ledger) array as JSONB.

CREATE OR REPLACE FUNCTION public.get_customer_full_detail(
  p_customer_id UUID,
  p_vendor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_orders JSONB;
  v_statements JSONB;
  v_verified BOOLEAN;
BEGIN
  -- Verify this customer belongs to the calling vendor (defense-in-depth)
  SELECT EXISTS (
    SELECT 1 FROM parties
    WHERE id = p_customer_id
      AND vendor_id = p_vendor_id
      AND is_customer = TRUE
  ) INTO v_verified;

  IF NOT v_verified THEN
    RETURN jsonb_build_object(
      'orders', '[]'::JSONB,
      'statements', '[]'::JSONB
    );
  END IF;

  -- Orders (sorted ascending for client-side balance calculation)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'created_at', o.created_at,
      'total_amount', o.total_amount,
      'amount_paid', o.amount_paid,
      'balance_due', o.balance_due,
      'status', o.status,
      'bill_number', o.bill_number,
      'due_date', o.due_date
    )
    ORDER BY o.created_at ASC
  )
  INTO v_orders
  FROM orders o
  WHERE o.customer_id = p_customer_id
    AND o.vendor_id = p_vendor_id;

  -- Statements (ledger: bills + payments with running balance)
  WITH combined_events AS (
    SELECT
      o.id,
      'bill' AS type,
      o.created_at,
      o.total_amount AS amount,
      o.bill_number,
      o.status,
      (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
      NULL::TEXT AS payment_mode,
      NULL::TEXT AS order_bill_number
    FROM orders o
    WHERE o.customer_id = p_customer_id
      AND o.vendor_id = p_vendor_id

    UNION ALL

    SELECT
      p.id,
      'payment' AS type,
      p.payment_date AS created_at,
      p.amount,
      NULL::TEXT AS bill_number,
      NULL::TEXT AS status,
      0::BIGINT AS item_count,
      p.payment_mode,
      o.bill_number AS order_bill_number
    FROM payments p
    JOIN orders o ON p.order_id = o.id AND o.vendor_id = p_vendor_id
    WHERE o.customer_id = p_customer_id
      AND o.vendor_id = p_vendor_id
  ),
  running AS (
    SELECT
      id, type, created_at, amount,
      GREATEST(
        SUM(CASE WHEN type = 'bill' THEN amount ELSE -amount END)
          OVER (ORDER BY created_at ASC, type ASC),
        0
      ) AS running_balance,
      bill_number, status, item_count, payment_mode, order_bill_number
    FROM combined_events
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'type', r.type,
      'created_at', r.created_at,
      'amount', r.amount,
      'running_balance', r.running_balance,
      'bill_number', r.bill_number,
      'status', r.status,
      'item_count', r.item_count,
      'payment_mode', r.payment_mode,
      'order_bill_number', r.order_bill_number
    )
    ORDER BY r.created_at DESC
  )
  INTO v_statements
  FROM running r;

  RETURN jsonb_build_object(
    'orders', COALESCE(v_orders, '[]'::JSONB),
    'statements', COALESCE(v_statements, '[]'::JSONB)
  );
END;
$$;

-- Grant execute to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_customer_full_detail(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_customer_full_detail(UUID, UUID) TO authenticated;
