CREATE OR REPLACE FUNCTION public.close_inactive_trio_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.trio_rooms r
     SET closed_at = now(),
         closed_reason = COALESCE(closed_reason, 'Inactive for 15 minutes')
   WHERE r.closed_at IS NULL
     AND r.created_at < now() - interval '15 minutes'
     AND GREATEST(
           r.created_at,
           COALESCE((SELECT max(m.created_at) FROM public.messages m
                      WHERE m.channel_id = 'trio:' || r.id::text), r.created_at)
         ) < now() - interval '15 minutes';
END;
$function$;

-- Reopen rooms that were auto-closed prematurely so users can keep chatting.
UPDATE public.trio_rooms
   SET closed_at = NULL,
       closed_reason = NULL
 WHERE closed_reason IN ('Inactive for 1 minute', 'Inactive for 15 minutes')
   AND closed_at > now() - interval '1 day'
   AND EXISTS (
     SELECT 1 FROM public.trio_room_members m
     WHERE m.room_id = trio_rooms.id AND m.status = 'accepted'
   );