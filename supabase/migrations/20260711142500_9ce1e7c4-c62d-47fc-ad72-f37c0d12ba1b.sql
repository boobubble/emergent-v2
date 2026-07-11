
DROP VIEW IF EXISTS public.license_sources_public;
DROP VIEW IF EXISTS public.payment_providers_public;

CREATE OR REPLACE FUNCTION public.list_enabled_payment_providers()
RETURNS TABLE(key text, enabled boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT key, enabled FROM public.payment_providers;
$$;
REVOKE ALL ON FUNCTION public.list_enabled_payment_providers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_enabled_payment_providers() TO anon, authenticated;
