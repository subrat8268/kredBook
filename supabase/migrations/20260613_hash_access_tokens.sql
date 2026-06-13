-- Hash access tokens for defense-in-depth
-- Stores only SHA-256(token), never the raw token in the database

-- 1. Add token_hash column
ALTER TABLE access_tokens ADD COLUMN IF NOT EXISTS token_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_access_tokens_token_hash ON access_tokens(token_hash);

-- 2. Backfill existing tokens with their SHA-256 hash
UPDATE access_tokens
SET token_hash = encode(digest(token, 'sha256'), 'hex')
WHERE token_hash IS NULL;

-- 3. Enforce token_hash constraints
ALTER TABLE access_tokens ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE access_tokens ADD CONSTRAINT access_tokens_token_hash_key UNIQUE (token_hash);

-- 4. Drop old token UNIQUE constraint (kept for backward compat reads)
ALTER TABLE access_tokens ALTER COLUMN token DROP NOT NULL;
DROP INDEX IF EXISTS idx_access_tokens_token;

-- Replace get_or_create_access_token: store hash only, return raw token
CREATE OR REPLACE FUNCTION get_or_create_access_token(
  p_vendor_id UUID,
  p_customer_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_raw_token TEXT;
  v_token_hash TEXT;
BEGIN
  SELECT token INTO v_raw_token
  FROM access_tokens
  WHERE vendor_id = p_vendor_id
    AND customer_id = p_customer_id
    AND is_revoked = FALSE
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF v_raw_token IS NOT NULL THEN
    RETURN v_raw_token;
  END IF;

  v_raw_token := generate_access_token();
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');

  INSERT INTO access_tokens (token_hash, vendor_id, customer_id)
  VALUES (v_token_hash, p_vendor_id, p_customer_id);

  RETURN v_raw_token;
END;
$$;

-- Replace upsert_access_token: store hash only, return raw token
CREATE OR REPLACE FUNCTION public.upsert_access_token(p_party_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_vendor_id uuid;
  v_raw_token text;
  v_token_hash text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT p.vendor_id
  INTO v_vendor_id
  FROM public.parties p
  JOIN public.profiles pr ON pr.id = p.vendor_id
  WHERE p.id = p_party_id
    AND pr.user_id = v_user_id;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Party is not owned by caller';
  END IF;

  SELECT at.token
  INTO v_raw_token
  FROM public.access_tokens at
  WHERE at.customer_id = p_party_id
    AND at.vendor_id = v_vendor_id
    AND COALESCE(at.is_revoked, false) = false
    AND (at.expires_at IS NULL OR at.expires_at > now())
  ORDER BY at.created_at DESC
  LIMIT 1;

  IF v_raw_token IS NOT NULL THEN
    RETURN v_raw_token;
  END IF;

  v_raw_token := gen_random_uuid()::text;
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');

  UPDATE public.access_tokens
  SET
    token_hash = v_token_hash,
    vendor_id = v_vendor_id,
    is_revoked = false,
    created_at = now()
  WHERE customer_id = p_party_id;

  IF NOT FOUND THEN
    INSERT INTO public.access_tokens (vendor_id, customer_id, token_hash, is_revoked, created_at)
    VALUES (v_vendor_id, p_party_id, v_token_hash, false, now());
  END IF;

  RETURN v_raw_token;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_access_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_access_token(uuid) TO authenticated;

-- Replace get_ledger_by_token: lookup by hash
CREATE OR REPLACE FUNCTION get_ledger_by_token(p_token TEXT)
RETURNS TABLE(
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  vendor_business_name TEXT,
  vendor_name TEXT,
  vendor_phone TEXT,
  vendor_address TEXT,
  vendor_gstin TEXT,
  vendor_logo_url TEXT,
  total_sales NUMERIC,
  total_payments NUMERIC,
  current_balance NUMERIC,
  last_transaction_date TIMESTAMPTZ,
  transactions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_vendor_id UUID;
  v_token_valid BOOLEAN;
  v_token_hash TEXT;
BEGIN
  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  SELECT customer_id, vendor_id, (is_revoked = FALSE AND (expires_at IS NULL OR expires_at > NOW()))
  INTO v_customer_id, v_vendor_id, v_token_valid
  FROM access_tokens
  WHERE token_hash = v_token_hash;

  IF NOT v_token_valid THEN
    RETURN;
  END IF;

  PERFORM track_token_access(p_token);

  RETURN QUERY
  SELECT
    c.name::TEXT,
    c.phone::TEXT,
    c.address::TEXT,
    p.business_name::TEXT,
    p.name::TEXT,
    p.phone::TEXT,
    p.billing_address::TEXT,
    p.gstin::TEXT,
    p.business_logo_url::TEXT,
    COALESCE(SUM(o.total_amount), 0),
    COALESCE(SUM(o.amount_paid), 0),
    COALESCE(SUM(o.balance_due), 0),
    MAX(o.created_at),
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', o2.id,
            'date', o2.created_at,
            'type', 'sale',
            'bill_number', o2.bill_number,
            'amount', o2.total_amount,
            'balance_due', o2.balance_due,
            'status', o2.status,
            'items', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'product_name', oi.product_name,
                  'variant_name', oi.variant_name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'subtotal', oi.subtotal
                )
                ORDER BY oi.id
              )
              FROM order_items oi
              WHERE oi.order_id = o2.id
            )
          )
          ORDER BY o2.created_at DESC
        )
        FROM orders o2
        WHERE o2.vendor_id = v_vendor_id
          AND o2.customer_id = v_customer_id
      ),
      '[]'::jsonb
    )
  FROM parties c
  INNER JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN orders o ON (o.customer_id = c.id AND o.vendor_id = p.id)
  WHERE c.id = v_customer_id
    AND c.is_customer = TRUE
    AND p.id = v_vendor_id
  GROUP BY c.id, c.name, c.phone, c.address,
           p.id, p.business_name, p.name, p.phone, p.billing_address, p.gstin, p.business_logo_url;
END;
$$;

-- Replace track_token_access: lookup by hash
CREATE OR REPLACE FUNCTION track_token_access(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_hash TEXT;
BEGIN
  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  UPDATE access_tokens
  SET
    last_accessed_at = NOW(),
    access_count = access_count + 1
  WHERE token_hash = v_token_hash;
END;
$$;
