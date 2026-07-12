
-- Fix: prevent tampering with user_inventory item_id/category via UPDATE.
-- Only allow toggling the equipped/updated_at column on rows the user owns.
CREATE OR REPLACE FUNCTION public.prevent_inventory_item_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.item_id IS DISTINCT FROM OLD.item_id
     OR NEW.category IS DISTINCT FROM OLD.category
  THEN
    RAISE EXCEPTION 'Only the equipped state can be changed on existing inventory rows';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_inventory_item_tampering ON public.user_inventory;
CREATE TRIGGER trg_prevent_inventory_item_tampering
BEFORE UPDATE ON public.user_inventory
FOR EACH ROW EXECUTE FUNCTION public.prevent_inventory_item_tampering();

-- Fix: prevent client-side fabrication of loyalty stats.
-- Revoke direct INSERT/UPDATE from authenticated users; writes must happen
-- via SECURITY DEFINER RPCs / server-side functions (service_role).
DROP POLICY IF EXISTS "User inserts own room loyalty" ON public.room_loyalty;
DROP POLICY IF EXISTS "User updates own room loyalty" ON public.room_loyalty;

REVOKE INSERT, UPDATE, DELETE ON public.room_loyalty FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.room_loyalty FROM anon;
GRANT ALL ON public.room_loyalty TO service_role;
