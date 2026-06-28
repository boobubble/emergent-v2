REVOKE EXECUTE ON FUNCTION public.my_active_plan() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_active_plan() TO authenticated;