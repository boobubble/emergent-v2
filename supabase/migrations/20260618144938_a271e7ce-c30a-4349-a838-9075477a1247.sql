
-- Coin-gated private (trio) room creation
CREATE OR REPLACE FUNCTION public.create_trio_room(
  _name text,
  _password text DEFAULT NULL,
  _hidden boolean DEFAULT false
)
RETURNS public.trio_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 100;
  bal int;
  new_room public.trio_rooms;
  clean_name text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  clean_name := LEFT(COALESCE(TRIM(_name), ''), 60);
  IF clean_name = '' THEN RAISE EXCEPTION 'Room name required'; END IF;

  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < cost THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', cost, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - cost WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, target_type, target_id)
  VALUES (uid, 'coins', -cost, 'trio_create_room', 'trio_room', NULL);

  INSERT INTO public.trio_rooms (name, password, hidden, owner_id)
  VALUES (clean_name, NULLIF(TRIM(COALESCE(_password,'')), ''), COALESCE(_hidden,false), uid)
  RETURNING * INTO new_room;

  INSERT INTO public.trio_room_members (room_id, user_id, status, invited_by, joined_at)
  VALUES (new_room.id, uid, 'accepted', uid, now());

  RETURN new_room;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_trio_room(text, text, boolean) TO authenticated;

-- Coin-gated invite acceptance (replaces previous accept_trio_invite)
CREATE OR REPLACE FUNCTION public.accept_trio_invite(_room uuid, _password text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 50;
  bal int;
  r public.trio_rooms;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT * INTO r FROM public.trio_rooms WHERE id = _room;
  IF NOT FOUND OR r.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Room not available';
  END IF;
  IF r.password IS NOT NULL AND r.password <> '' AND COALESCE(_password,'') <> r.password THEN
    RAISE EXCEPTION 'Wrong password';
  END IF;

  -- Ensure an open invitation exists
  PERFORM 1 FROM public.trio_room_members
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invitation';
  END IF;

  -- Charge coins
  SELECT coins INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF bal < cost THEN
    RAISE EXCEPTION 'Not enough coins (need %, have %)', cost, bal;
  END IF;

  UPDATE public.profiles SET coins = coins - cost WHERE id = uid;

  INSERT INTO public.coin_transactions (user_id, kind, amount, reason, target_type, target_id)
  VALUES (uid, 'coins', -cost, 'trio_join_room', 'trio_room', _room);

  UPDATE public.trio_room_members
     SET status = 'accepted', joined_at = now()
   WHERE room_id = _room AND user_id = uid AND status = 'invited';
END;
$$;
