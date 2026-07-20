GRANT SELECT, INSERT, UPDATE, DELETE ON public.confessions TO authenticated;
GRANT SELECT ON public.confessions TO anon;
GRANT ALL ON public.confessions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.confession_reactions TO authenticated;
GRANT SELECT ON public.confession_reactions TO anon;
GRANT ALL ON public.confession_reactions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.confession_replies TO authenticated;
GRANT SELECT ON public.confession_replies TO anon;
GRANT ALL ON public.confession_replies TO service_role;