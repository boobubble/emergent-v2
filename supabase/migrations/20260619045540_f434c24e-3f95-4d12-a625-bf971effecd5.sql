REVOKE SELECT (ip_address) ON public.user_devices FROM authenticated;
GRANT ALL ON public.user_devices TO service_role;