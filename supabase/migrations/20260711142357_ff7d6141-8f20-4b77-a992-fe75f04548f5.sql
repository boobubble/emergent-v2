
-- license_sources: restrict base SELECT to admins; expose safe fields via view
DROP POLICY IF EXISTS "license_sources_read_all" ON public.license_sources;
CREATE POLICY "license_sources_admin_read"
  ON public.license_sources FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE OR REPLACE VIEW public.license_sources_public AS
SELECT id, label, provider, enabled, sort_order
FROM public.license_sources
WHERE enabled = true;
GRANT SELECT ON public.license_sources_public TO anon, authenticated;

-- payment_providers: restrict base SELECT to admins; expose safe fields via view
DROP POLICY IF EXISTS "providers read enabled" ON public.payment_providers;
CREATE POLICY "providers admin read"
  ON public.payment_providers FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE OR REPLACE VIEW public.payment_providers_public AS
SELECT key, enabled
FROM public.payment_providers;
GRANT SELECT ON public.payment_providers_public TO anon, authenticated;

-- competition_follows: owner-only reads; expose aggregate via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "follows readable to authenticated" ON public.competition_follows;
CREATE POLICY "own follows readable"
  ON public.competition_follows FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_competition_follower_count(_competition_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.competition_follows WHERE competition_id = _competition_id;
$$;
REVOKE ALL ON FUNCTION public.get_competition_follower_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_competition_follower_count(uuid) TO anon, authenticated;
