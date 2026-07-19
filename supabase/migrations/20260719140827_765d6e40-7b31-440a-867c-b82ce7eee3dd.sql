-- Fix privilege escalation on community_members self-insert
DROP POLICY IF EXISTS "cm self insert" ON public.community_members;
CREATE POLICY "cm self insert" ON public.community_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'member'::community_member_role
  AND (
    status = 'pending'::community_member_status
    OR (
      status = 'active'::community_member_status
      AND EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_members.community_id
          AND c.privacy_mode = 'public'::community_privacy
          AND c.status = 'active'
      )
    )
  )
);

-- Fix mutable search_path on mehfil_compute_writer_rank
CREATE OR REPLACE FUNCTION public.mehfil_compute_writer_rank(poems integer, upvotes integer, wins integer, featured integer, hof integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  SELECT CASE
    WHEN hof >= 1 OR wins >= 10 THEN 'hall_of_fame'
    WHEN wins >= 3 OR upvotes >= 5000 OR featured >= 10 THEN 'legend_poet'
    WHEN wins >= 1 OR upvotes >= 1500 OR poems >= 50 OR featured >= 3 THEN 'master_poet'
    WHEN upvotes >= 300 OR poems >= 15 THEN 'poet'
    WHEN upvotes >= 30 OR poems >= 3 THEN 'rising_poet'
    ELSE 'fresh_writer'
  END;
$function$;