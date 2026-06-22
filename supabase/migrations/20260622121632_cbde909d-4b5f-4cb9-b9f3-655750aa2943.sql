
ALTER TABLE public.trio_room_members
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Backfill: pending invites expire 7 days after invited_at
UPDATE public.trio_room_members
  SET expires_at = invited_at + interval '7 days'
  WHERE status = 'invited' AND expires_at IS NULL;

-- Update SELECT policy on trio_rooms to exclude expired invites
DROP POLICY IF EXISTS "View own trio rooms" ON public.trio_rooms;
CREATE POLICY "View own trio rooms" ON public.trio_rooms
FOR SELECT
USING (
  owner_id = auth.uid()
  OR public.is_trio_member(id, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.trio_room_members m
    WHERE m.room_id = trio_rooms.id
      AND m.user_id = auth.uid()
      AND (
        m.status = 'accepted'
        OR (m.status = 'invited' AND (m.expires_at IS NULL OR m.expires_at > now()))
      )
  )
  OR public.is_admin(auth.uid())
);

-- create_trio_room: set invite expiration not applicable for owner (accepted), but set default for new invites via insert path elsewhere.
-- Update accept_trio_invite to reject expired invites
CREATE OR REPLACE FUNCTION public.accept_trio_invite(_room uuid, _password text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cost int := 50;
  bal int;
  r public.trio_rooms;
  mem public.trio_room_members;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO r FROM public.trio_rooms WHERE id = _room;
  IF NOT FOUND OR r.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Room not available';
  END IF;
  IF r.password IS NOT NULL AND r.password <> '' AND COALESCE(_password,'') <> r.password THEN
    RAISE EXCEPTION 'Wrong password';
  END IF;

  SELECT * INTO mem FROM public.trio_room_members
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invitation';
  END IF;

  IF mem.expires_at IS NOT NULL AND mem.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation expired';
  END IF;

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < cost THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', cost, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - cost WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, ref_type, ref_id)
  VALUES (uid, 'coins', -cost, 'trio_join_room', 'trio_room', _room);

  UPDATE public.trio_room_members
     SET status = 'accepted', joined_at = now(), expires_at = NULL
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
END;
$function$;

-- Trigger to set default expires_at on new invites (7 days)
CREATE OR REPLACE FUNCTION public.set_trio_invite_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'invited' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := COALESCE(NEW.invited_at, now()) + interval '7 days';
  ELSIF NEW.status = 'accepted' THEN
    NEW.expires_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_trio_invite_expiry ON public.trio_room_members;
CREATE TRIGGER trg_set_trio_invite_expiry
BEFORE INSERT OR UPDATE OF status ON public.trio_room_members
FOR EACH ROW EXECUTE FUNCTION public.set_trio_invite_expiry();
