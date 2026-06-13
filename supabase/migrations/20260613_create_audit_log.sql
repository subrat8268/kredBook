-- Create audit_log table for DPDP Act §9(3) compliance
-- Logs all customer deletions with actor, timestamp, and data snapshot

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own audit entries
CREATE POLICY "vendors_can_select_own_audit" ON public.audit_log
  FOR SELECT
  USING (actor_id = auth.uid());

-- Trigger function: auto-audit party (customer) deletions
CREATE OR REPLACE FUNCTION public.audit_party_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'customer_deleted',
    'party',
    OLD.id,
    jsonb_build_object(
      'name', OLD.name,
      'phone', OLD.phone,
      'vendor_id', OLD.vendor_id,
      'customer_balance', OLD.customer_balance
    )
  );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_party_delete ON public.parties;
CREATE TRIGGER trg_audit_party_delete
  BEFORE DELETE ON public.parties
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_party_delete();
