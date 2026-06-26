
-- 1) profile_views: enforce viewer anonymity + owner unlock in policy
DROP POLICY IF EXISTS "Owners can view their profile views" ON public.profile_views;

CREATE POLICY "Owners can view non-anonymous profile views"
ON public.profile_views
FOR SELECT
TO authenticated
USING (
  profile_owner_id = auth.uid()
  AND anonymous = false
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.profile_views_unlocked_full, false) = true
  )
);

-- 2) dj_broadcast_credentials: explicit admin-only SELECT policy
CREATE POLICY "Admins can view broadcast credentials"
ON public.dj_broadcast_credentials
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
