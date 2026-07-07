DROP POLICY IF EXISTS "Admins manage levels" ON public.arrowflow_levels;
DROP POLICY IF EXISTS "Anyone signed in can read enabled levels" ON public.arrowflow_levels;
DROP POLICY IF EXISTS "Admins manage daily challenges" ON public.arrowflow_daily;

CREATE POLICY "Anyone signed in can read enabled levels"
ON public.arrowflow_levels FOR SELECT
TO authenticated
USING (is_enabled = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage levels"
ON public.arrowflow_levels FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage daily challenges"
ON public.arrowflow_daily FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));