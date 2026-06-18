
-- Trio rooms (Yahoo-style private mini rooms, up to 3 participants)
CREATE TABLE public.trio_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 60),
  owner_id uuid NOT NULL,
  password text,
  hidden boolean NOT NULL DEFAULT false,
  closed_at timestamptz,
  closed_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trio_rooms_owner ON public.trio_rooms(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trio_rooms TO authenticated;
GRANT ALL ON public.trio_rooms TO service_role;
ALTER TABLE public.trio_rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.trio_room_members (
  room_id uuid NOT NULL REFERENCES public.trio_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','accepted','rejected','blocked','left')),
  invited_by uuid,
  invited_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  PRIMARY KEY (room_id, user_id)
);
CREATE INDEX idx_trio_members_user ON public.trio_room_members(user_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trio_room_members TO authenticated;
GRANT ALL ON public.trio_room_members TO service_role;
ALTER TABLE public.trio_room_members ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.trio_channel_room(_channel text)
RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN _channel ~ '^trio:[0-9a-f-]{36}$' THEN substring(_channel from 6)::uuid ELSE NULL END
$$;

CREATE OR REPLACE FUNCTION public.is_trio_member(_room uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trio_room_members
    WHERE room_id = _room AND user_id = _user AND status = 'accepted'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_trio_channel_allowed(_channel text, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.trio_channel_room(_channel) IS NOT NULL
     AND public.is_trio_member(public.trio_channel_room(_channel), _user)
     AND NOT EXISTS (
       SELECT 1 FROM public.trio_rooms
       WHERE id = public.trio_channel_room(_channel) AND closed_at IS NOT NULL
     )
$$;

-- trio_rooms policies
CREATE POLICY "View own trio rooms" ON public.trio_rooms FOR SELECT TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.trio_room_members m WHERE m.room_id = id AND m.user_id = auth.uid())
  OR public.is_admin(auth.uid())
);
CREATE POLICY "Create own trio room" ON public.trio_rooms FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner or admin update room" ON public.trio_rooms FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin delete room" ON public.trio_rooms FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));

-- trio_room_members policies
CREATE POLICY "View own memberships" ON public.trio_room_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.trio_rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
  OR public.is_admin(auth.uid())
);
CREATE POLICY "Owner invites members" ON public.trio_room_members FOR INSERT TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.trio_rooms r
    WHERE r.id = room_id AND r.owner_id = auth.uid() AND r.closed_at IS NULL
  )
  AND (
    SELECT COUNT(*) FROM public.trio_room_members m
    WHERE m.room_id = trio_room_members.room_id AND m.status IN ('invited','accepted')
  ) < 3
);
CREATE POLICY "Self updates own membership" ON public.trio_room_members FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner or self deletes membership" ON public.trio_room_members FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.trio_rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
  OR public.is_admin(auth.uid())
);

-- Extend messages policies to allow trio channels
DROP POLICY IF EXISTS "Read lobby games or own DMs" ON public.messages;
DROP POLICY IF EXISTS "Send as self to lobby games or own DMs" ON public.messages;

CREATE POLICY "Read lobby games dms or trio" ON public.messages FOR SELECT TO authenticated
USING (
  channel_id = 'lobby'
  OR channel_id = 'games'
  OR channel_id ~ ('^dm:' || auth.uid()::text || ':[0-9a-f-]{36}$')
  OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || auth.uid()::text || '$')
  OR public.is_trio_channel_allowed(channel_id, auth.uid())
);

CREATE POLICY "Send to lobby games dms or trio" ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND (
    channel_id = 'lobby'
    OR channel_id = 'games'
    OR channel_id ~ ('^dm:' || auth.uid()::text || ':[0-9a-f-]{36}$')
    OR channel_id ~ ('^dm:[0-9a-f-]{36}:' || auth.uid()::text || '$')
    OR public.is_trio_channel_allowed(channel_id, auth.uid())
  )
);

-- Accept invite with optional password
CREATE OR REPLACE FUNCTION public.accept_trio_invite(_room uuid, _password text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.trio_rooms;
BEGIN
  SELECT * INTO r FROM public.trio_rooms WHERE id = _room;
  IF NOT FOUND OR r.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Room not available';
  END IF;
  IF r.password IS NOT NULL AND r.password <> '' AND COALESCE(_password,'') <> r.password THEN
    RAISE EXCEPTION 'Wrong password';
  END IF;
  UPDATE public.trio_room_members
     SET status = 'accepted', joined_at = now()
   WHERE room_id = _room AND user_id = auth.uid() AND status = 'invited';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invitation';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.accept_trio_invite(uuid, text) TO authenticated;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trio_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trio_room_members;
