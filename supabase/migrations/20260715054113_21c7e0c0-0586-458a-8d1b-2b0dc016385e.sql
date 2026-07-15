-- 1) Hide join_password_hash from client reads on communities
REVOKE SELECT (join_password_hash) ON public.communities FROM anon, authenticated;

-- 2) Remove public read of community invites; server-side lookups use admin client
DROP POLICY IF EXISTS "invites read by code" ON public.community_invites;

-- 3) Fix always-true WITH CHECK on community_verification_requests owner-update policy
DROP POLICY IF EXISTS "cvr owner or admin update" ON public.community_verification_requests;
CREATE POLICY "cvr owner or admin update"
ON public.community_verification_requests
FOR UPDATE
TO authenticated
USING (
  ((submitted_by = auth.uid()) AND (status = ANY (ARRAY['pending'::text, 'needs_changes'::text])))
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  ((submitted_by = auth.uid()) AND (status = ANY (ARRAY['pending'::text, 'needs_changes'::text])))
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 4) Convert posts_safe view to security_invoker so it enforces the caller's RLS
ALTER VIEW public.posts_safe SET (security_invoker = on);