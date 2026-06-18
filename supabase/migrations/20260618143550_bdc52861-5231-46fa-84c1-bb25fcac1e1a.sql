
CREATE OR REPLACE FUNCTION public.is_trio_room_owner(_room uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.trio_rooms WHERE id = _room AND owner_id = _user)
$$;

-- Rebuild trio_rooms SELECT policy without referencing trio_room_members directly
DROP POLICY IF EXISTS "View own trio rooms" ON public.trio_rooms;
CREATE POLICY "View own trio rooms"
ON public.trio_rooms
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR public.is_trio_member(id, auth.uid())
  OR public.is_admin(auth.uid())
);

-- Rebuild trio_room_members policies to avoid sub-selecting trio_rooms
DROP POLICY IF EXISTS "View own memberships" ON public.trio_room_members;
CREATE POLICY "View own memberships"
ON public.trio_room_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_trio_room_owner(room_id, auth.uid())
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Owner or self deletes membership" ON public.trio_room_members;
CREATE POLICY "Owner or self deletes membership"
ON public.trio_room_members
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_trio_room_owner(room_id, auth.uid())
  OR public.is_admin(auth.uid())
);

-- Owner invites: keep the seat-count check inline, but resolve ownership via helper
DROP POLICY IF EXISTS "Owner invites members" ON public.trio_room_members;
CREATE POLICY "Owner invites members"
ON public.trio_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND public.is_trio_room_owner(room_id, auth.uid())
  AND (
    SELECT count(*) FROM public.trio_room_members m
    WHERE m.room_id = trio_room_members.room_id
      AND m.status = ANY (ARRAY['invited','accepted'])
  ) < 3
);
