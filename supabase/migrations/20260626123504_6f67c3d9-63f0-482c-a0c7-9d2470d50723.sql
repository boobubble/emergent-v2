
CREATE OR REPLACE FUNCTION public.close_trio_room_if_empty()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining int;
  rid uuid;
BEGIN
  rid := COALESCE(NEW.room_id, OLD.room_id);
  IF rid IS NULL THEN RETURN NULL; END IF;

  SELECT count(*) INTO remaining
  FROM public.trio_room_members
  WHERE room_id = rid AND status = 'accepted';

  IF remaining = 0 THEN
    UPDATE public.trio_rooms
       SET closed_at = COALESCE(closed_at, now()),
           closed_reason = COALESCE(closed_reason, 'All members left')
     WHERE id = rid AND closed_at IS NULL;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_close_trio_room_if_empty_upd ON public.trio_room_members;
DROP TRIGGER IF EXISTS trg_close_trio_room_if_empty_del ON public.trio_room_members;

CREATE TRIGGER trg_close_trio_room_if_empty_upd
AFTER UPDATE OF status ON public.trio_room_members
FOR EACH ROW EXECUTE FUNCTION public.close_trio_room_if_empty();

CREATE TRIGGER trg_close_trio_room_if_empty_del
AFTER DELETE ON public.trio_room_members
FOR EACH ROW EXECUTE FUNCTION public.close_trio_room_if_empty();

-- Backfill: close any open room with no accepted members
UPDATE public.trio_rooms r
   SET closed_at = now(),
       closed_reason = COALESCE(closed_reason, 'All members left')
 WHERE closed_at IS NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.trio_room_members m
     WHERE m.room_id = r.id AND m.status = 'accepted'
   );
