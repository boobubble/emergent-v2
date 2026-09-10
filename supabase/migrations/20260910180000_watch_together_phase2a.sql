-- ============================================================
-- Yaarzo Watch Together — Phase 2a
-- Registered DM + YouTube link sessions only
--
-- Scope:
--   - DM sessions only
--   - YouTube media only
--   - No uploads/transcoding in this phase
--   - Playback state is controlled by the session host
--   - Clients cannot directly INSERT/DELETE sessions
-- ============================================================


-- ============================================================
-- 1. Watch sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.watch_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  scope_type text NOT NULL DEFAULT 'dm'
    CHECK (scope_type = 'dm'),

  channel_id text NOT NULL
    CHECK (channel_id ~ '^dm:[0-9a-f-]{36}:[0-9a-f-]{36}$'),

  host_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'ended')),

  media_kind text NOT NULL DEFAULT 'youtube'
    CHECK (media_kind = 'youtube'),

  provider text NOT NULL DEFAULT 'youtube'
    CHECK (provider = 'youtube'),

  provider_video_id text NOT NULL
    CHECK (provider_video_id ~ '^[A-Za-z0-9_-]{11}$'),

  started_at timestamptz NOT NULL DEFAULT now(),

  ended_at timestamptz,

  ends_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT watch_sessions_ended_at_check
    CHECK (
      (status = 'active' AND ended_at IS NULL)
      OR
      (status = 'ended' AND ended_at IS NOT NULL)
    )
);


-- Only one active Watch Together session per DM.
CREATE UNIQUE INDEX IF NOT EXISTS watch_sessions_one_active_per_dm
ON public.watch_sessions(channel_id)
WHERE status = 'active';


CREATE INDEX IF NOT EXISTS watch_sessions_host_idx
ON public.watch_sessions(host_id);

CREATE INDEX IF NOT EXISTS watch_sessions_channel_idx
ON public.watch_sessions(channel_id);

CREATE INDEX IF NOT EXISTS watch_sessions_status_ends_idx
ON public.watch_sessions(status, ends_at);


-- ============================================================
-- 2. Protect immutable session identity
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_watch_session_identity_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.host_id <> OLD.host_id
     OR NEW.channel_id <> OLD.channel_id
     OR NEW.scope_type <> OLD.scope_type
     OR NEW.media_kind <> OLD.media_kind
     OR NEW.provider <> OLD.provider
     OR NEW.provider_video_id <> OLD.provider_video_id
  THEN
    RAISE EXCEPTION 'Watch session identity cannot be changed';
  END IF;

  RETURN NEW;
END
$function$;


DROP TRIGGER IF EXISTS watch_sessions_identity_guard
ON public.watch_sessions;

CREATE TRIGGER watch_sessions_identity_guard
BEFORE UPDATE ON public.watch_sessions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_watch_session_identity_change();


-- ============================================================
-- 3. Validate host is actually a DM participant
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_watch_session_host()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_dm_channel_allowed(NEW.channel_id, NEW.host_id) THEN
    RAISE EXCEPTION 'Watch session host is not a DM participant';
  END IF;

  RETURN NEW;
END
$function$;


DROP TRIGGER IF EXISTS watch_sessions_host_guard
ON public.watch_sessions;

CREATE TRIGGER watch_sessions_host_guard
BEFORE INSERT OR UPDATE ON public.watch_sessions
FOR EACH ROW
EXECUTE FUNCTION public.validate_watch_session_host();


-- ============================================================
-- 4. Playback state
-- ============================================================

CREATE TABLE IF NOT EXISTS public.watch_playback_state (
  session_id uuid PRIMARY KEY
    REFERENCES public.watch_sessions(id) ON DELETE CASCADE,

  playing boolean NOT NULL DEFAULT false,

  position_ms bigint NOT NULL DEFAULT 0
    CHECK (position_ms >= 0),

  playback_rate numeric(4,2) NOT NULL DEFAULT 1.00
    CHECK (playback_rate >= 0.25 AND playback_rate <= 2.00),

  updated_at timestamptz NOT NULL DEFAULT now(),

  updated_by uuid
    REFERENCES auth.users(id) ON DELETE SET NULL,

  host_clock_ms bigint
    CHECK (host_clock_ms IS NULL OR host_clock_ms >= 0)
);


CREATE INDEX IF NOT EXISTS watch_playback_state_updated_idx
ON public.watch_playback_state(updated_at);


-- ============================================================
-- 5. Playback state validation
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_watch_playback_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_host uuid;
  session_status text;
BEGIN
  SELECT host_id, status
    INTO session_host, session_status
  FROM public.watch_sessions
  WHERE id = NEW.session_id;

  IF session_host IS NULL THEN
    RAISE EXCEPTION 'Watch session does not exist';
  END IF;

  IF session_status <> 'active' THEN
    RAISE EXCEPTION 'Watch session is not active';
  END IF;

  IF NEW.updated_by IS DISTINCT FROM session_host THEN
    RAISE EXCEPTION 'Only the Watch Together host can control playback';
  END IF;

  NEW.updated_at := now();

  RETURN NEW;
END
$function$;


DROP TRIGGER IF EXISTS watch_playback_state_guard
ON public.watch_playback_state;

CREATE TRIGGER watch_playback_state_guard
BEFORE INSERT OR UPDATE ON public.watch_playback_state
FOR EACH ROW
EXECUTE FUNCTION public.validate_watch_playback_update();


-- ============================================================
-- 6. Row Level Security — watch_sessions
-- ============================================================

ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Watch participants can view sessions"
ON public.watch_sessions;

CREATE POLICY "Watch participants can view sessions"
ON public.watch_sessions
FOR SELECT
TO authenticated
USING (
  public.is_dm_channel_allowed(channel_id, auth.uid())
);


-- No client INSERT policy.
-- Session creation happens through a server function.


-- No client DELETE policy.
-- Ending a session happens through a server function.


-- No general client UPDATE policy.
-- Session lifecycle is controlled through server functions.


-- ============================================================
-- 7. Row Level Security — watch_playback_state
-- ============================================================

ALTER TABLE public.watch_playback_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Watch participants can view playback"
ON public.watch_playback_state;

CREATE POLICY "Watch participants can view playback"
ON public.watch_playback_state
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.watch_sessions ws
    WHERE ws.id = watch_playback_state.session_id
      AND ws.status = 'active'
      AND public.is_dm_channel_allowed(ws.channel_id, auth.uid())
  )
);


DROP POLICY IF EXISTS "Watch host can update playback"
ON public.watch_playback_state;

CREATE POLICY "Watch host can update playback"
ON public.watch_playback_state
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.watch_sessions ws
    WHERE ws.id = watch_playback_state.session_id
      AND ws.status = 'active'
      AND ws.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.watch_sessions ws
    WHERE ws.id = watch_playback_state.session_id
      AND ws.status = 'active'
      AND ws.host_id = auth.uid()
  )
);


-- No client INSERT.
-- Playback state is created by the trusted server function.


-- No client DELETE.


-- ============================================================
-- 8. Realtime Broadcast authorization helper
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_watch_broadcast_allowed(
  _topic text,
  _user uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_id uuid;
  allowed boolean;
BEGIN
  IF _topic !~ '^watch:[0-9a-f-]{36}$' THEN
    RETURN false;
  END IF;

  session_id := substring(_topic from 7)::uuid;

  SELECT EXISTS (
    SELECT 1
    FROM public.watch_sessions ws
    WHERE ws.id = session_id
      AND ws.status = 'active'
      AND public.is_dm_channel_allowed(ws.channel_id, _user)
      AND now() < ws.ends_at
  )
  INTO allowed;

  RETURN COALESCE(allowed, false);
END
$function$;


COMMENT ON FUNCTION public.is_watch_broadcast_allowed(text, uuid) IS
  'True when an authenticated user is a participant in the active DM Watch Together session represented by watch:{session_uuid}.';


-- ============================================================
-- 9. Realtime SELECT authorization
-- ============================================================

DROP POLICY IF EXISTS "Authenticated can subscribe to allowed channels"
ON realtime.messages;

CREATE POLICY "Authenticated can subscribe to allowed channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() = ANY (ARRAY['lobby'::text, 'games'::text]))
  OR (
    realtime.topic() LIKE 'dm:%'
    AND public.is_dm_channel_allowed(
      realtime.topic(),
      (SELECT auth.uid())
    )
  )
  OR (
    realtime.topic() LIKE 'trio:%'
    AND public.is_trio_channel_allowed(
      realtime.topic(),
      (SELECT auth.uid())
    )
  )
  OR (
    realtime.topic() LIKE 'watch:%'
    AND public.is_watch_broadcast_allowed(
      realtime.topic(),
      (SELECT auth.uid())
    )
  )
  OR (
    realtime.topic() = (
      'notifications:' || ((SELECT auth.uid()))::text
    )
  )
);


-- ============================================================
-- 10. Realtime INSERT/Broadcast authorization
-- ============================================================

DROP POLICY IF EXISTS "Authenticated can broadcast to allowed channels"
ON realtime.messages;

CREATE POLICY "Authenticated can broadcast to allowed channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() = ANY (ARRAY['lobby'::text, 'games'::text]))
  OR (
    realtime.topic() LIKE 'dm:%'
    AND public.is_dm_channel_allowed(
      realtime.topic(),
      (SELECT auth.uid())
    )
  )
  OR (
    realtime.topic() LIKE 'trio:%'
    AND public.is_trio_channel_allowed(
      realtime.topic(),
      (SELECT auth.uid())
    )
  )
  OR (
    realtime.topic() LIKE 'watch:%'
    AND public.is_watch_broadcast_allowed(
      realtime.topic(),
      (SELECT auth.uid())
    )
  )
  OR (
    realtime.topic() = (
      'notifications:' || ((SELECT auth.uid()))::text
    )
  )
);


-- ============================================================
-- 11. Grants
-- ============================================================

REVOKE ALL ON public.watch_sessions
FROM anon;

REVOKE ALL ON public.watch_playback_state
FROM anon;

REVOKE INSERT, UPDATE, DELETE
ON public.watch_sessions
FROM authenticated;

REVOKE INSERT, DELETE
ON public.watch_playback_state
FROM authenticated;

GRANT SELECT ON public.watch_sessions
TO authenticated;

GRANT SELECT, UPDATE
ON public.watch_playback_state
TO authenticated;


-- Server/service role retains full access.
GRANT ALL ON public.watch_sessions
TO service_role;

GRANT ALL ON public.watch_playback_state
TO service_role;


-- ============================================================
-- 12. Initial playback row helper
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_watch_playback_state(
  _session_id uuid,
  _host_id uuid
)
RETURNS public.watch_playback_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.watch_playback_state;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.watch_sessions ws
    WHERE ws.id = _session_id
      AND ws.host_id = _host_id
      AND ws.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid Watch Together session or host';
  END IF;

  INSERT INTO public.watch_playback_state (
    session_id,
    playing,
    position_ms,
    playback_rate,
    updated_by
  )
  VALUES (
    _session_id,
    false,
    0,
    1.00,
    _host_id
  )
  ON CONFLICT (session_id) DO NOTHING;

  SELECT *
    INTO result
  FROM public.watch_playback_state
  WHERE session_id = _session_id;

  RETURN result;
END
$function$;


REVOKE ALL
ON FUNCTION public.create_watch_playback_state(uuid, uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.create_watch_playback_state(uuid, uuid)
TO service_role;


-- ============================================================
-- 13. Comments
-- ============================================================

COMMENT ON TABLE public.watch_sessions IS
  'Watch Together sessions. Phase 2a supports registered DM YouTube sessions only.';

COMMENT ON TABLE public.watch_playback_state IS
  'Current host-controlled playback state for a Watch Together session.';


-- ============================================================
-- End Phase 2a
-- ============================================================
