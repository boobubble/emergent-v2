-- DM send 403 (sqlstate 42501): is_dm_channel_allowed() required
-- friendships.status = 'accepted', but the UI opens dm:{uuid}:{uuid}
-- without that check. Product: the two encoded participants may DM.
--
-- Minimal change: replace ONLY this helper body.
-- messages INSERT/SELECT, realtime dm:% topics, and dm_shared_themes
-- already call it. Lobby / games / trio branches and has_friendship()
-- are unchanged.

CREATE OR REPLACE FUNCTION public.is_dm_channel_allowed(_channel text, _user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  a uuid;
  b uuid;
  other uuid;
BEGIN
  -- Exact two-participant channel: dm:{uuid}:{uuid}
  IF _channel !~ '^dm:[0-9a-f-]{36}:[0-9a-f-]{36}$' THEN
    RETURN false;
  END IF;

  a := substring(_channel from 4 for 36)::uuid;
  b := substring(_channel from 41 for 36)::uuid;

  IF a = _user THEN
    other := b;
  ELSIF b = _user THEN
    other := a;
  ELSE
    -- Caller is not one of the two encoded UUIDs.
    RETURN false;
  END IF;

  IF other = _user THEN
    RETURN false;
  END IF;

  -- Participant match is sufficient. Friendship is not required.
  RETURN true;
END
$function$;

COMMENT ON FUNCTION public.is_dm_channel_allowed(text, uuid) IS
  'True when _user is one of the two UUIDs encoded in dm:{uuid}:{uuid}. Does not require accepted friendship. Does not grant lobby/games/trio access.';
