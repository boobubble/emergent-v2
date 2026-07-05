
-- Guard: room_loyalty — only service role / admins can write
CREATE OR REPLACE FUNCTION public.guard_room_loyalty_self_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR public.is_admin(uid) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'Room loyalty stats are computed server-side and cannot be modified directly';
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_room_loyalty_self_write ON public.room_loyalty;
CREATE TRIGGER trg_guard_room_loyalty_self_write
BEFORE INSERT OR UPDATE ON public.room_loyalty
FOR EACH ROW EXECUTE FUNCTION public.guard_room_loyalty_self_write();

-- Guard: user_inventory — non-admin users may only toggle the `equipped` flag,
-- never change item_id/category/user_id, and cannot self-insert items.
CREATE OR REPLACE FUNCTION public.guard_user_inventory_self_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR public.is_admin(uid) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Inventory items must be granted server-side';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Cannot change inventory owner';
    END IF;
    IF NEW.item_id IS DISTINCT FROM OLD.item_id THEN
      RAISE EXCEPTION 'Cannot change inventory item';
    END IF;
    IF NEW.category IS DISTINCT FROM OLD.category THEN
      RAISE EXCEPTION 'Cannot change inventory category';
    END IF;
    IF NEW.acquired_at IS DISTINCT FROM OLD.acquired_at THEN
      RAISE EXCEPTION 'Cannot change acquired_at';
    END IF;
    -- Only `equipped` may be flipped by the owner.
    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_user_inventory_self_write ON public.user_inventory;
CREATE TRIGGER trg_guard_user_inventory_self_write
BEFORE INSERT OR UPDATE ON public.user_inventory
FOR EACH ROW EXECUTE FUNCTION public.guard_user_inventory_self_write();
