-- Release-blocker fix: remove readable room join secrets from public room rows.
-- Store password hashes in backend-only secret tables and expose only status-returning verifier RPCs.

CREATE TABLE IF NOT EXISTS public.chatroom_password_secrets (
  room_id uuid PRIMARY KEY REFERENCES public.chatrooms(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.chatroom_password_secrets TO service_role;
ALTER TABLE public.chatroom_password_secrets ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.trio_room_password_secrets (
  room_id uuid PRIMARY KEY REFERENCES public.trio_rooms(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.trio_room_password_secrets TO service_role;
ALTER TABLE public.trio_room_password_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.chatroom_password_secrets FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.trio_room_password_secrets FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.touch_password_secret_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_chatroom_password_secrets_updated_at ON public.chatroom_password_secrets;
CREATE TRIGGER touch_chatroom_password_secrets_updated_at
BEFORE UPDATE ON public.chatroom_password_secrets
FOR EACH ROW EXECUTE FUNCTION public.touch_password_secret_updated_at();

DROP TRIGGER IF EXISTS touch_trio_room_password_secrets_updated_at ON public.trio_room_password_secrets;
CREATE TRIGGER touch_trio_room_password_secrets_updated_at
BEFORE UPDATE ON public.trio_room_password_secrets
FOR EACH ROW EXECUTE FUNCTION public.touch_password_secret_updated_at();

-- Preserve existing passwords/hashes before removing public columns.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chatrooms' AND column_name = 'password'
  ) THEN
    INSERT INTO public.chatroom_password_secrets (room_id, password_hash)
    SELECT id,
           CASE
             WHEN password ~ '^\$2[aby]\$' THEN password
             ELSE extensions.crypt(password, extensions.gen_salt('bf', 10))
           END
    FROM public.chatrooms
    WHERE password IS NOT NULL AND password <> ''
    ON CONFLICT (room_id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          updated_at = now();
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trio_rooms' AND column_name = 'password'
  ) THEN
    INSERT INTO public.trio_room_password_secrets (room_id, password_hash)
    SELECT id,
           CASE
             WHEN password ~ '^\$2[aby]\$' THEN password
             ELSE extensions.crypt(password, extensions.gen_salt('bf', 10))
           END
    FROM public.trio_rooms
    WHERE password IS NOT NULL AND password <> ''
    ON CONFLICT (room_id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          updated_at = now();
  END IF;
END;
$$;

-- Remove old password-returning compatibility RPC if present.
DROP FUNCTION IF EXISTS public.get_chatroom_password(uuid);

-- Remove password-column triggers before dropping the public columns.
DROP TRIGGER IF EXISTS chatrooms_hash_password ON public.chatrooms;
DROP TRIGGER IF EXISTS trio_rooms_hash_password ON public.trio_rooms;

ALTER TABLE public.chatrooms DROP COLUMN IF EXISTS password;
ALTER TABLE public.trio_rooms DROP COLUMN IF EXISTS password;

DROP FUNCTION IF EXISTS public.verify_chatroom_password(uuid, text);
CREATE OR REPLACE FUNCTION public.verify_chatroom_password(_room uuid, _password text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  secret_hash text;
  room_exists boolean;
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
    RETURN 'success';
  END IF;

  RETURN 'incorrect password';
END;
$$;

DROP FUNCTION IF EXISTS public.verify_trio_room_password(uuid, text);
CREATE OR REPLACE FUNCTION public.verify_trio_room_password(_room uuid, _password text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  uid uuid := auth.uid();
  secret_hash text;
  room_ok boolean;
  allowed boolean;
BEGIN
  IF uid IS NULL THEN
    RETURN 'failure';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.trio_rooms
    WHERE id = _room AND closed_at IS NULL
  ) INTO room_ok;
  IF NOT COALESCE(room_ok, false) THEN
    RETURN 'failure';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.trio_rooms r
    WHERE r.id = _room
      AND (
        r.owner_id = uid
        OR public.is_admin(uid)
        OR EXISTS (
          SELECT 1 FROM public.trio_room_members m
          WHERE m.room_id = _room
            AND m.user_id = uid
            AND m.status IN ('invited', 'accepted')
            AND (m.expires_at IS NULL OR m.expires_at > now())
        )
      )
  ) INTO allowed;
  IF NOT COALESCE(allowed, false) THEN
    RETURN 'failure';
  END IF;

  SELECT password_hash INTO secret_hash
  FROM public.trio_room_password_secrets
  WHERE room_id = _room;

  IF secret_hash IS NULL OR secret_hash = '' THEN
    RETURN 'success';
  END IF;

  IF COALESCE(_password, '') = '' THEN
    RETURN 'room is protected';
  END IF;

  IF secret_hash = extensions.crypt(COALESCE(_password, ''), secret_hash) THEN
    RETURN 'success';
  END IF;

  RETURN 'incorrect password';
END;
$$;

REVOKE ALL ON FUNCTION public.verify_chatroom_password(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_trio_room_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_chatroom_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_trio_room_password(uuid, text) TO authenticated;

DROP FUNCTION IF EXISTS public.create_trio_room(text, text, boolean);
CREATE OR REPLACE FUNCTION public.create_trio_room(_name text, _password text DEFAULT NULL::text, _hidden boolean DEFAULT false)
RETURNS public.trio_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 100;
  new_room public.trio_rooms;
  clean_name text;
  clean_password text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  clean_name := LEFT(COALESCE(TRIM(_name), ''), 60);
  IF clean_name = '' THEN RAISE EXCEPTION 'Room name required'; END IF;
  clean_password := NULLIF(TRIM(COALESCE(_password, '')), '');

  INSERT INTO public.trio_rooms (name, hidden, owner_id)
  VALUES (clean_name, COALESCE(_hidden,false), uid)
  RETURNING * INTO new_room;

  IF clean_password IS NOT NULL THEN
    INSERT INTO public.trio_room_password_secrets (room_id, password_hash)
    VALUES (new_room.id, extensions.crypt(clean_password, extensions.gen_salt('bf', 10)));
  END IF;

  PERFORM public.wallet_apply(
    uid, cost, 'debit', 'trio_create_room',
    'completed', 'system',
    'trio_create:' || new_room.id::text,
    jsonb_build_object('room_id', new_room.id, 'name', clean_name)
  );

  INSERT INTO public.trio_room_members (room_id, user_id, status, invited_by, joined_at)
  VALUES (new_room.id, uid, 'accepted', uid, now());

  RETURN new_room;
END;
$$;

DROP FUNCTION IF EXISTS public.accept_trio_invite(uuid, text);
CREATE OR REPLACE FUNCTION public.accept_trio_invite(_room uuid, _password text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 50;
  invite_expires_at timestamptz;
  room_closed_at timestamptz;
  verification text;
BEGIN
  IF uid IS NULL THEN RETURN 'failure'; END IF;

  SELECT closed_at INTO room_closed_at
  FROM public.trio_rooms
  WHERE id = _room;
  IF NOT FOUND OR room_closed_at IS NOT NULL THEN
    RETURN 'failure';
  END IF;

  SELECT expires_at INTO invite_expires_at
  FROM public.trio_room_members
  WHERE room_id = _room AND user_id = uid AND status = 'invited';
  IF NOT FOUND THEN
    RETURN 'failure';
  END IF;

  IF invite_expires_at IS NOT NULL AND invite_expires_at <= now() THEN
    RETURN 'failure';
  END IF;

  verification := public.verify_trio_room_password(_room, _password);
  IF verification <> 'success' THEN
    RETURN verification;
  END IF;

  PERFORM public.wallet_apply(
    uid, cost, 'debit', 'trio_join_room',
    'completed', 'system',
    'trio_join:' || _room::text || ':' || uid::text,
    jsonb_build_object('room_id', _room)
  );

  UPDATE public.trio_room_members
     SET status = 'accepted', joined_at = now(), expires_at = NULL
   WHERE room_id = _room AND user_id = uid AND status = 'invited';

  RETURN 'success';
END;
$$;

REVOKE ALL ON FUNCTION public.create_trio_room(text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_trio_invite(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_trio_room(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_trio_invite(uuid, text) TO authenticated;

-- Keep realtime room broadcasts explicitly password-free after the schema change.
ALTER TABLE public.trio_rooms REPLICA IDENTITY DEFAULT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'trio_rooms'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.trio_rooms';
  END IF;

  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.trio_rooms (id, name, owner_id, hidden, closed_at, closed_reason, created_at)';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END;
$$;