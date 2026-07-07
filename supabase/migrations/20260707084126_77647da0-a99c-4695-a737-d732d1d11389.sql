
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;
  EXECUTE sql;
END;
$$;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, service_role;
