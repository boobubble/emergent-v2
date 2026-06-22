DO $$
DECLARE
  u uuid;
BEGIN
  FOR u IN SELECT id FROM public.profiles WHERE LOWER(username) LIKE 'demo%' LOOP
    PERFORM public.delete_user_cascade(u);
    DELETE FROM auth.users WHERE id = u;
  END LOOP;
END $$;