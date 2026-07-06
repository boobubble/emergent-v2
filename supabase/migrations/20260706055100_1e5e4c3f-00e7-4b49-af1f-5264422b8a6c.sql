
-- Explicitly lock down trio_rooms.password
REVOKE ALL (password) ON public.trio_rooms FROM anon, authenticated, PUBLIC;
GRANT SELECT (password) ON public.trio_rooms TO service_role;

-- Ensure all other trio_rooms columns remain readable to authenticated clients
GRANT SELECT
  (id, owner_id, name, hidden, closed_at, closed_reason, created_at)
  ON public.trio_rooms TO authenticated;

-- Re-assert chatrooms password lockdown
REVOKE ALL (password) ON public.chatrooms FROM anon, authenticated, PUBLIC;
GRANT SELECT (password) ON public.chatrooms TO service_role;

-- Secure RPC to verify a trio room password without exposing it
CREATE OR REPLACE FUNCTION public.verify_trio_room_password(_room uuid, _password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trio_rooms
    WHERE id = _room
      AND (
        password IS NULL
        OR password = ''
        OR password = _password
      )
  );
$$;

REVOKE ALL ON FUNCTION public.verify_trio_room_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_trio_room_password(uuid, text) TO authenticated;
