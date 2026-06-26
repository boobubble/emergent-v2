CREATE OR REPLACE FUNCTION public.close_inactive_trio_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.trio_rooms r
     SET closed_at = now(),
         closed_reason = COALESCE(closed_reason, 'Inactive for 5 minutes')
   WHERE r.closed_at IS NULL
     AND r.created_at < now() - interval '5 minutes'
     AND GREATEST(
           r.created_at,
           COALESCE((SELECT max(m.created_at) FROM public.messages m
                      WHERE m.channel_id = 'trio:' || r.id::text), r.created_at)
         ) < now() - interval '5 minutes';
END;
$function$;