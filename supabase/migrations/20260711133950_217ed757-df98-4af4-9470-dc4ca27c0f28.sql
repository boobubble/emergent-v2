
REVOKE SELECT ON public.payment_providers FROM anon, authenticated;
GRANT SELECT (key, enabled) ON public.payment_providers TO anon, authenticated;
GRANT ALL ON public.payment_providers TO service_role;

REVOKE SELECT ON public.license_sources FROM anon, authenticated;
GRANT SELECT (id, label, provider, enabled, sort_order, created_at, updated_at) ON public.license_sources TO anon, authenticated;
GRANT ALL ON public.license_sources TO service_role;
