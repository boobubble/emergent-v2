
-- Admin: list every table in the public schema (for row-data dump)
CREATE OR REPLACE FUNCTION public.admin_list_public_tables()
RETURNS TABLE(table_name text, estimated_rows bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
    SELECT c.relname::text, GREATEST(c.reltuples::bigint, 0)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname;
END $$;

REVOKE ALL ON FUNCTION public.admin_list_public_tables() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_public_tables() TO authenticated, service_role;

-- Admin: emit a restorable schema-only SQL script for the public schema.
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
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  out := E'-- ============================================\n';
  out := out || E'-- BooBubble Schema Dump\n';
  out := out || E'-- Generated: ' || now()::text || E'\n';
  out := out || E'-- ============================================\n\n';
  out := out || E'SET statement_timeout = 0;\nSET client_min_messages = warning;\n\n';

  -- Extensions
  out := out || E'-- ---------- Extensions ----------\n';
  FOR r IN
    SELECT e.extname, n.nspname
    FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname NOT IN ('plpgsql')
    ORDER BY e.extname
  LOOP
    out := out || format('CREATE EXTENSION IF NOT EXISTS %I WITH SCHEMA %I;', r.extname, r.nspname) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Sequences
  out := out || E'-- ---------- Sequences ----------\n';
  FOR r IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    ORDER BY sequence_name
  LOOP
    out := out || format('CREATE SEQUENCE IF NOT EXISTS public.%I;', r.sequence_name) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Tables (columns only; constraints emitted below)
  out := out || E'-- ---------- Tables ----------\n';
  FOR r IN
    SELECT c.oid, c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  LOOP
    SELECT string_agg(
      format(E'\n  %I %s%s%s',
        a.attname,
        pg_catalog.format_type(a.atttypid, a.atttypmod),
        CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END,
        CASE WHEN ad.adbin IS NOT NULL
             THEN ' DEFAULT ' || pg_get_expr(ad.adbin, ad.adrelid)
             ELSE '' END
      ), ','
      ORDER BY a.attnum
    )
    INTO cols
    FROM pg_attribute a
    LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
    WHERE a.attrelid = r.oid AND a.attnum > 0 AND NOT a.attisdropped;

    out := out || format('CREATE TABLE IF NOT EXISTS public.%I (%s\n);', r.relname, cols) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Constraints (PK, UNIQUE, FK, CHECK) — primary keys first
  out := out || E'-- ---------- Constraints ----------\n';
  FOR r IN
    SELECT c.conname,
           n.nspname || '.' || cl.relname AS tbl,
           pg_get_constraintdef(c.oid, true) AS def,
           c.contype
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY CASE c.contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'f' THEN 3 ELSE 4 END, c.conname
  LOOP
    out := out || format('ALTER TABLE %s ADD CONSTRAINT %I %s;', r.tbl, r.conname, r.def) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Indexes (skip index that backs a constraint)
  out := out || E'-- ---------- Indexes ----------\n';
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
    out := out || r.indexdef || E';\n';
  END LOOP;
  out := out || E'\n';

  -- Views
  out := out || E'-- ---------- Views ----------\n';
  FOR r IN SELECT viewname, definition FROM pg_views WHERE schemaname = 'public' ORDER BY viewname LOOP
    out := out || format('CREATE OR REPLACE VIEW public.%I AS %s', r.viewname, r.definition) || E'\n';
  END LOOP;

  -- Materialized views
  FOR r IN SELECT matviewname, definition FROM pg_matviews WHERE schemaname = 'public' ORDER BY matviewname LOOP
    out := out || format('CREATE MATERIALIZED VIEW IF NOT EXISTS public.%I AS %s', r.matviewname, r.definition) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Functions & procedures (includes SECURITY DEFINER, search_path, body)
  out := out || E'-- ---------- Functions ----------\n';
  FOR r IN
    SELECT pg_get_functiondef(p.oid) AS def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind IN ('f','p')
    ORDER BY p.proname
  LOOP
    out := out || r.def || E';\n\n';
  END LOOP;

  -- Triggers (on public tables, excluding internal / constraint-backing)
  out := out || E'-- ---------- Triggers ----------\n';
  FOR r IN
    SELECT pg_get_triggerdef(t.oid, true) AS def
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND NOT t.tgisinternal
    ORDER BY t.tgname
  LOOP
    out := out || r.def || E';\n';
  END LOOP;
  out := out || E'\n';

  -- Enable RLS
  out := out || E'-- ---------- Row Level Security ----------\n';
  FOR r IN
    SELECT c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    ORDER BY c.relname
  LOOP
    out := out || format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.relname) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Policies
  out := out || E'-- ---------- Policies ----------\n';
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
    ) || E'\n';
  END LOOP;
  out := out || E'\n';

  -- Grants
  out := out || E'-- ---------- Grants ----------\n';
  FOR r IN
    SELECT grantee, table_name, string_agg(DISTINCT privilege_type, ', ' ORDER BY privilege_type) AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee IN ('anon','authenticated','service_role')
    GROUP BY grantee, table_name
    ORDER BY table_name, grantee
  LOOP
    out := out || format('GRANT %s ON public.%I TO %I;', r.privs, r.table_name, r.grantee) || E'\n';
  END LOOP;

  RETURN out;
END $$;

REVOKE ALL ON FUNCTION public.admin_export_schema_sql() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_export_schema_sql() TO authenticated, service_role;
