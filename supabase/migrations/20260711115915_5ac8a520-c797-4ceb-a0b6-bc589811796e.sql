-- Fix Security Definer View: rebuild license_statistics with security_invoker
ALTER VIEW public.license_statistics SET (security_invoker = on);

-- Harden competition_participants self-join policy: force vote_count=0, rank NULL, status in known values
DROP POLICY IF EXISTS "user can self-join" ON public.competition_participants;
CREATE POLICY "user can self-join"
ON public.competition_participants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND COALESCE(vote_count, 0) = 0
  AND rank IS NULL
  AND status IN ('pending','approved')
  AND EXISTS (
    SELECT 1 FROM public.competitions c
    WHERE c.id = competition_participants.competition_id
      AND c.status = ANY (ARRAY['upcoming'::text, 'live'::text])
      AND (c.max_participants IS NULL OR c.total_participants < c.max_participants)
      AND (
        (COALESCE(c.require_approval, false) = true AND competition_participants.status = 'pending')
        OR (COALESCE(c.require_approval, false) = false AND competition_participants.status = 'approved')
      )
  )
);

-- Prevent users from mutating vote_count/rank/status on their own row.
-- Only admins (existing "admins manage participants" policy) can update these.
DROP POLICY IF EXISTS "user can self-update participant" ON public.competition_participants;