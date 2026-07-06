
-- Prevent password column exposure via SELECT on chatrooms
REVOKE SELECT ON public.chatrooms FROM anon, authenticated;

GRANT SELECT
  (id, owner_id, slug, name, description, category, cover_image_url, avatar_url,
   rules, welcome_message, theme_color, background_image_url, visibility,
   age_restricted, member_count, featured, archived_at, created_at, updated_at)
  ON public.chatrooms TO anon, authenticated;

-- Password column is only readable by service_role (server-side verification)
GRANT SELECT (password) ON public.chatrooms TO service_role;

-- SECURITY DEFINER RPC to verify a chatroom password without exposing it
CREATE OR REPLACE FUNCTION public.verify_chatroom_password(_room uuid, _password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chatrooms
    WHERE id = _room
      AND (
        password IS NULL
        OR password = ''
        OR password = _password
      )
  );
$$;

REVOKE ALL ON FUNCTION public.verify_chatroom_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_chatroom_password(uuid, text) TO authenticated;
