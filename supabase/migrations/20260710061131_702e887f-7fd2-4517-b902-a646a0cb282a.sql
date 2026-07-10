-- Rewrite admin_export_schema_sql so newlines come from chr(10) rather than
-- E'\n' escapes. This keeps the function's own source free of the two-char
-- sequence `\n`, so when the schema dumper emits its own pg_get_functiondef
-- the output contains only real newlines. The runtime SQL is byte-identical
-- to the previous E-string version.
CREATE OR REPLACE FUNCTION public.admin_export_schema_sql()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $$
DECLARE
  out text := '';
  r record;
  cols text;
  nl  text := chr(10);
  nl2 text := chr(10) || chr(10);
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  out := '-- ============================================' || nl;
  out := out || '-- BooBubble Schema Dump' || nl;
  out := out || '-- Generated: ' || now()::text || nl;
  out := out || '-- ============================================' || nl2;
  out := out || 'SET statement_timeout = 0;' || nl || 'SET client_min_messages = warning;' || nl2;

  out := out || '-- ---------- Extensions ----------' || nl;
  FOR r IN
    SELECT e.extname, x.nspname
    FROM pg_extension e JOIN pg_namespace x ON x.oid = e.extnamespace
    WHERE e.extname NOT IN ('plpgsql')
    ORDER BY e.extname
  LOOP
    out := out || format('CREATE EXTENSION IF NOT EXISTS %I WITH SCHEMA %I;', r.extname, r.nspname) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Sequences ----------' || nl;
  FOR r IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    ORDER BY sequence_name
  LOOP
    out := out || format('CREATE SEQUENCE IF NOT EXISTS public.%I;', r.sequence_name) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Tables ----------' || nl;
  FOR r IN
    SELECT c.oid, c.relname
    FROM pg_class c JOIN pg_namespace x ON x.oid = c.relnamespace
    WHERE x.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  LOOP
    SELECT string_agg(
      nl || '  ' || quote_ident(a.attname) || ' ' ||
        pg_catalog.format_type(a.atttypid, a.atttypmod) ||
        CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN ad.adbin IS NOT NULL
             THEN ' DEFAULT ' || pg_get_expr(ad.adbin, ad.adrelid)
             ELSE '' END,
      ','
      ORDER BY a.attnum
    )
    INTO cols
    FROM pg_attribute a
    LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
    WHERE a.attrelid = r.oid AND a.attnum > 0 AND NOT a.attisdropped;

    out := out || 'CREATE TABLE IF NOT EXISTS public.' || quote_ident(r.relname)
                || ' (' || COALESCE(cols, '') || nl || ');' || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Constraints ----------' || nl;
  FOR r IN
    SELECT c.conname,
           x.nspname || '.' || cl.relname AS tbl,
           pg_get_constraintdef(c.oid, true) AS def,
           c.contype
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace x ON x.oid = cl.relnamespace
    WHERE x.nspname = 'public'
    ORDER BY CASE c.contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'f' THEN 3 ELSE 4 END, c.conname
  LOOP
    out := out || format('ALTER TABLE %s ADD CONSTRAINT %I %s;', r.tbl, r.conname, r.def) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Indexes ----------' || nl;
  FOR r IN
    SELECT i.indexdef
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class cl ON cl.oid = c.conindid
        WHERE cl.relname = i.indexname
      )
    ORDER BY i.indexname
  LOOP
    out := out || r.indexdef || ';' || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Views ----------' || nl;
  FOR r IN SELECT viewname, definition FROM pg_views WHERE schemaname = 'public' ORDER BY viewname LOOP
    out := out || format('CREATE OR REPLACE VIEW public.%I AS %s', r.viewname, r.definition) || nl;
  END LOOP;

  FOR r IN SELECT matviewname, definition FROM pg_matviews WHERE schemaname = 'public' ORDER BY matviewname LOOP
    out := out || format('CREATE MATERIALIZED VIEW IF NOT EXISTS public.%I AS %s', r.matviewname, r.definition) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Functions ----------' || nl;
  FOR r IN
    SELECT pg_get_functiondef(p.oid) AS def
    FROM pg_proc p JOIN pg_namespace x ON x.oid = p.pronamespace
    WHERE x.nspname = 'public' AND p.prokind IN ('f','p')
    ORDER BY p.proname
  LOOP
    out := out || r.def || ';' || nl2;
  END LOOP;

  out := out || '-- ---------- Triggers ----------' || nl;
  FOR r IN
    SELECT pg_get_triggerdef(t.oid, true) AS def
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace x ON x.oid = c.relnamespace
    WHERE x.nspname = 'public' AND NOT t.tgisinternal
    ORDER BY t.tgname
  LOOP
    out := out || r.def || ';' || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Row Level Security ----------' || nl;
  FOR r IN
    SELECT c.relname FROM pg_class c
    JOIN pg_namespace x ON x.oid = c.relnamespace
    WHERE x.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    ORDER BY c.relname
  LOOP
    out := out || format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.relname) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Policies ----------' || nl;
  FOR r IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  LOOP
    out := out || format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s;',
      r.policyname, r.schemaname, r.tablename, r.permissive, r.cmd,
      array_to_string(r.roles, ', '),
      CASE WHEN r.qual IS NOT NULL THEN ' USING (' || r.qual || ')' ELSE '' END,
      CASE WHEN r.with_check IS NOT NULL THEN ' WITH CHECK (' || r.with_check || ')' ELSE '' END
    ) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Grants ----------' || nl;
  FOR r IN
    SELECT grantee, table_name, string_agg(DISTINCT privilege_type, ', ' ORDER BY privilege_type) AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee IN ('anon','authenticated','service_role')
    GROUP BY grantee, table_name
    ORDER BY table_name, grantee
  LOOP
    out := out || format('GRANT %s ON public.%I TO %I;', r.privs, r.table_name, r.grantee) || nl;
  END LOOP;

  RETURN out;
END $$;

REVOKE ALL ON FUNCTION public.admin_export_schema_sql() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_export_schema_sql() TO authenticated, service_role;