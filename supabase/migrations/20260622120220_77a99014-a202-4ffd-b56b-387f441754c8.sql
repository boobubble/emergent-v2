DROP POLICY IF EXISTS "View own trio rooms" ON public.trio_rooms;

CREATE POLICY "View own trio rooms"
ON public.trio_rooms
FOR SELECT
USING (
  owner_id = auth.uid()
  OR public.is_trio_member(id, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.trio_room_members m
    WHERE m.room_id = trio_rooms.id
      AND m.user_id = auth.uid()
      AND m.status IN ('invited','accepted')
  )
  OR public.is_admin(auth.uid())
);