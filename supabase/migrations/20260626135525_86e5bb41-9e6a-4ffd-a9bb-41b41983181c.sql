
-- 1) user_devices: super_admin only
DROP POLICY IF EXISTS "Admins read all devices" ON public.user_devices;
CREATE POLICY "Super admins read all devices"
ON public.user_devices
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 2) trio_rooms: revoke password column from authenticated; owner-only RPC
REVOKE SELECT (password) ON public.trio_rooms FROM authenticated;
REVOKE SELECT (password) ON public.trio_rooms FROM anon;

CREATE OR REPLACE FUNCTION public.get_trio_room_password(_room uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pwd text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT password INTO pwd FROM public.trio_rooms
   WHERE id = _room AND owner_id = auth.uid();
  RETURN pwd;
END;
$$;
REVOKE ALL ON FUNCTION public.get_trio_room_password(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trio_room_password(uuid) TO authenticated;

-- 3) posts: ensure author_id is null for any anonymous rows (belt-and-braces)
UPDATE public.posts SET author_id = NULL WHERE is_anonymous = true AND author_id IS NOT NULL;
