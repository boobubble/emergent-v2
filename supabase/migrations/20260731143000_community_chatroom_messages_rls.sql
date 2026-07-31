-- Community chatroom messages: additive RLS for database-backed rooms.
-- Preserves existing lobby / games / DM / trio policies unchanged.
-- channel_id for community rooms = public.chatrooms.id (UUID text).

-- ---------------------------------------------------------------------------
-- Password verification sessions (required so UUID alone never grants access)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chatroom_password_grants (
  room_id uuid NOT NULL REFERENCES public.chatrooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS chatroom_password_grants_user_expires_idx
  ON public.chatroom_password_grants (user_id, expires_at DESC);

ALTER TABLE public.chatroom_password_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own chatroom password grants" ON public.chatroom_password_grants;

REVOKE ALL ON public.chatroom_password_grants FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.chatroom_password_grants TO service_role;

-- Issue / refresh a time-boxed grant after successful password verification.
-- Callable only from verify_chatroom_password (same owner, SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.grant_chatroom_password_access(_room uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF _room IS NULL OR uid IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.chatroom_password_grants (room_id, user_id, granted_at, expires_at)
  VALUES (_room, uid, now(), now() + interval '24 hours')
  ON CONFLICT (room_id, user_id) DO UPDATE
    SET granted_at = EXCLUDED.granted_at,
        expires_at = EXCLUDED.expires_at;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_chatroom_password_access(uuid) FROM PUBLIC, anon, authenticated;

-- Extend verifier to record grants; callers still receive the same status strings.
CREATE OR REPLACE FUNCTION public.verify_chatroom_password(_room uuid, _password text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  secret_hash text;
  room_exists boolean;
  uid uuid := auth.uid();
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.chatrooms WHERE id = _room) INTO room_exists;
  IF NOT COALESCE(room_exists, false) THEN
    RETURN 'failure';
  END IF;

  SELECT password_hash INTO secret_hash
  FROM public.chatroom_password_secrets
  WHERE room_id = _room;

  IF secret_hash IS NULL OR secret_hash = '' THEN
    RETURN 'success';
  END IF;

  IF COALESCE(_password, '') = '' THEN
    RETURN 'room is protected';
  END IF;

  IF secret_hash = extensions.crypt(COALESCE(_password, ''), secret_hash) THEN
    IF uid IS NOT NULL THEN
      PERFORM public.grant_chatroom_password_access(_room);
    END IF;
    RETURN 'success';
  END IF;

  RETURN 'incorrect password';
END;
$$;

REVOKE ALL ON FUNCTION public.verify_chatroom_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_chatroom_password(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Helper: community chatroom channel access (read vs write)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_community_chatroom_channel_allowed(
  _channel text,
  _user uuid,
  _for_write boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _room_id uuid;
  _community_id uuid;
  _room_owner_id uuid;
  _community_status text;
  _member_status public.community_member_status;
  _is_platform_admin boolean;
BEGIN
  IF _user IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;

  IF _user IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_user_banned(_user) THEN
    RETURN false;
  END IF;

  IF _channel IS NULL
     OR _channel IN ('lobby', 'games')
     OR _channel LIKE 'dm:%'
     OR _channel LIKE 'trio:%'
     OR _channel !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  THEN
    RETURN false;
  END IF;

  _room_id := _channel::uuid;

  SELECT cr.community_id, cr.owner_id, c.status
  INTO _community_id, _room_owner_id, _community_status
  FROM public.chatrooms cr
  INNER JOIN public.communities c ON c.id = cr.community_id
  WHERE cr.id = _room_id
    AND cr.community_id IS NOT NULL
    AND cr.archived_at IS NULL
    AND cr.visibility IS DISTINCT FROM 'archived';

  IF _community_id IS NULL OR _community_status <> 'active' THEN
    RETURN false;
  END IF;

  _is_platform_admin :=
    public.has_role(_user, 'admin'::public.app_role)
    OR public.has_role(_user, 'super_admin'::public.app_role);

  IF public.is_community_owner(_community_id, _user) OR _room_owner_id = _user THEN
    _member_status := 'active'::public.community_member_status;
  ELSIF _is_platform_admin THEN
    _member_status := 'active'::public.community_member_status;
  ELSE
    SELECT m.status
    INTO _member_status
    FROM public.community_members m
    WHERE m.community_id = _community_id
      AND m.user_id = _user;

    IF _member_status IS NULL THEN
      RETURN false;
    END IF;
  END IF;

  IF _member_status = 'banned'::public.community_member_status THEN
    RETURN false;
  END IF;

  IF _member_status = 'pending'::public.community_member_status THEN
    RETURN false;
  END IF;

  IF _for_write THEN
    IF _member_status = 'muted'::public.community_member_status THEN
      RETURN false;
    END IF;
  ELSE
    IF _member_status NOT IN (
      'active'::public.community_member_status,
      'muted'::public.community_member_status
    ) THEN
      RETURN false;
    END IF;
  END IF;

  -- Password-protected rooms: UUID alone is never sufficient.
  IF EXISTS (
    SELECT 1 FROM public.chatroom_password_secrets s WHERE s.room_id = _room_id
  ) THEN
    IF _room_owner_id <> _user
       AND NOT public.is_community_owner(_community_id, _user)
       AND NOT _is_platform_admin
    THEN
      IF NOT EXISTS (
        SELECT 1
        FROM public.chatroom_password_grants g
        WHERE g.room_id = _room_id
          AND g.user_id = _user
          AND g.expires_at > now()
      ) THEN
        RETURN false;
      END IF;
    END IF;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.is_community_chatroom_channel_allowed(text, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_community_chatroom_channel_allowed(text, uuid, boolean) TO authenticated;

-- ---------------------------------------------------------------------------
-- Additive message policies (existing policies remain untouched)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read community chatroom messages" ON public.messages;
CREATE POLICY "Read community chatroom messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_community_chatroom_channel_allowed(channel_id, auth.uid(), false)
  );

DROP POLICY IF EXISTS "Send to community chatroom messages" ON public.messages;
CREATE POLICY "Send to community chatroom messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT public.is_user_banned(auth.uid())
    AND NOT public.is_user_muted(auth.uid(), channel_id)
    AND public.is_community_chatroom_channel_allowed(channel_id, auth.uid(), true)
  );
