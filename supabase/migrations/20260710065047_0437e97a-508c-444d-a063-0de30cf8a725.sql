CREATE OR REPLACE FUNCTION public.admin_export_schema_sql()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  out text := '';
  r record;
  cols text;
  enum_vals text;
  attrs text;
  nl  text := chr(10);
  nl2 text := chr(10) || chr(10);
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  out := '-- ============================================' || nl;
  out := out || '-- BooBubble Schema Dump' || nl;
  out := out || '-- Generated: ' || now()::text || nl;
  out := out || '-- Dependency order: extensions, schemas, enum/domain/composite types, sequences, tables, constraints, indexes, functions, triggers, RLS, policies, views, materialized views' || nl;
  out := out || '-- ============================================' || nl2;
  out := out || 'SET statement_timeout = 0;' || nl || 'SET client_min_messages = warning;' || nl2;

  -- Extensions
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

  -- Schemas referenced by exported public objects. Public normally exists on a fresh project,
  -- but this makes the dependency order explicit and idempotent.
  out := out || '-- ---------- Schemas ----------' || nl;
  out := out || 'CREATE SCHEMA IF NOT EXISTS public;' || nl2;

  -- ENUM types (MUST come before tables that use them)
  out := out || '-- ---------- ENUM Types ----------' || nl;
  FOR r IN
    SELECT t.oid, t.typname
    FROM pg_type t
    JOIN pg_namespace x ON x.oid = t.typnamespace
    WHERE x.nspname = 'public' AND t.typtype = 'e'
    ORDER BY t.typname
  LOOP
    SELECT string_agg(quote_literal(enumlabel), ', ' ORDER BY enumsortorder)
      INTO enum_vals
      FROM pg_enum WHERE enumtypid = r.oid;
    out := out || 'DO $do$ BEGIN' || nl
                || '  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname='
                || quote_literal(r.typname) || ') THEN' || nl
                || '    CREATE TYPE public.' || quote_ident(r.typname) || ' AS ENUM (' || COALESCE(enum_vals,'') || ');' || nl
                || '  END IF;' || nl
                || 'END $do$;' || nl;
  END LOOP;
  out := out || nl;

  -- Domains
  out := out || '-- ---------- Domains ----------' || nl;
  FOR r IN
    SELECT t.typname,
           pg_catalog.format_type(t.typbasetype, t.typtypmod) AS basetype,
           t.typnotnull,
           pg_get_expr(t.typdefaultbin, 0) AS defaultexpr
    FROM pg_type t
    JOIN pg_namespace x ON x.oid = t.typnamespace
    WHERE x.nspname = 'public' AND t.typtype = 'd'
    ORDER BY t.typname
  LOOP
    out := out || 'DO $do$ BEGIN' || nl
                || '  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname='
                || quote_literal(r.typname) || ') THEN' || nl
                || '    CREATE DOMAIN public.' || quote_ident(r.typname) || ' AS ' || r.basetype
                || CASE WHEN r.typnotnull THEN ' NOT NULL' ELSE '' END
                || CASE WHEN r.defaultexpr IS NOT NULL THEN ' DEFAULT ' || r.defaultexpr ELSE '' END
                || ';' || nl
                || '  END IF;' || nl
                || 'END $do$;' || nl;
  END LOOP;
  out := out || nl;

  -- Composite types (user-defined, not table row types)
  out := out || '-- ---------- Composite Types ----------' || nl;
  FOR r IN
    SELECT t.oid, t.typname
    FROM pg_type t
    JOIN pg_namespace x ON x.oid = t.typnamespace
    LEFT JOIN pg_class c ON c.reltype = t.oid
    WHERE x.nspname = 'public' AND t.typtype = 'c' AND c.oid IS NULL
    ORDER BY t.typname
  LOOP
    SELECT string_agg(quote_ident(a.attname) || ' ' || pg_catalog.format_type(a.atttypid, a.atttypmod), ', ' ORDER BY a.attnum)
      INTO attrs
      FROM pg_attribute a
      WHERE a.attrelid = (SELECT typrelid FROM pg_type WHERE oid = r.oid)
        AND a.attnum > 0 AND NOT a.attisdropped;
    out := out || 'DO $do$ BEGIN' || nl
                || '  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname='
                || quote_literal(r.typname) || ') THEN' || nl
                || '    CREATE TYPE public.' || quote_ident(r.typname) || ' AS (' || COALESCE(attrs,'') || ');' || nl
                || '  END IF;' || nl
                || 'END $do$;' || nl;
  END LOOP;
  out := out || nl;

  -- Sequences
  out := out || '-- ---------- Sequences ----------' || nl;
  FOR r IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    ORDER BY sequence_name
  LOOP
    out := out || format('CREATE SEQUENCE IF NOT EXISTS public.%I;', r.sequence_name) || nl;
  END LOOP;
  out := out || nl;

  -- Tables
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

  -- Constraints (PK, unique, FK ordered)
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

  -- Indexes
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

  -- Functions. Build a dependency graph from catalog dependencies plus function-body
  -- references such as public.some_fn(...), then topologically sort so referenced
  -- functions exist before functions that call them. This fixes SQL-language
  -- validation failures like public.is_trio_channel_allowed referencing
  -- public.trio_channel_room before it exists.
  out := out || '-- ---------- Base / Helper / SECURITY DEFINER Functions (dependency sorted) ----------' || nl;
  FOR r IN
    WITH RECURSIVE funcs AS (
      SELECT p.oid,
             p.proname,
             p.prosecdef,
             p.prokind,
             pg_get_functiondef(p.oid) AS def,
             lower(pg_get_functiondef(p.oid)) AS def_lc
      FROM pg_proc p JOIN pg_namespace x ON x.oid = p.pronamespace
      WHERE x.nspname = 'public' AND p.prokind IN ('f','p')
    ), edges AS (
      SELECT DISTINCT f.oid AS dependent_oid, g.oid AS referenced_oid
      FROM funcs f
      JOIN pg_depend d ON d.objid = f.oid
      JOIN funcs g ON g.oid = d.refobjid
      WHERE f.oid <> g.oid
      UNION
      SELECT DISTINCT f.oid, g.oid
      FROM funcs f
      JOIN funcs g ON f.oid <> g.oid
      WHERE f.def_lc ~ ('(^|[^a-z0-9_])public[.]' || lower(g.proname) || '[[:space:]]*[(]')
      UNION
      SELECT DISTINCT f.oid, g.oid
      FROM funcs f
      JOIN funcs g ON f.oid <> g.oid
      WHERE f.def_lc ~ ('(^|[^.a-z0-9_])' || lower(g.proname) || '[[:space:]]*[(]')
    ), paths AS (
      SELECT e.dependent_oid, e.referenced_oid, ARRAY[e.dependent_oid, e.referenced_oid] AS path, 1 AS depth
      FROM edges e
      UNION ALL
      SELECT p.dependent_oid, e.referenced_oid, p.path || e.referenced_oid, p.depth + 1
      FROM paths p
      JOIN edges e ON e.dependent_oid = p.referenced_oid
      WHERE NOT e.referenced_oid = ANY(p.path)
        AND p.depth < 100
    )
    SELECT f.def,
           f.proname,
           f.prosecdef,
           COALESCE((SELECT max(depth) FROM paths p WHERE p.dependent_oid = f.oid), 0) AS dependency_rank,
           CASE
             WHEN f.prosecdef THEN 3
             WHEN EXISTS (SELECT 1 FROM edges e WHERE e.dependent_oid = f.oid OR e.referenced_oid = f.oid) THEN 2
             ELSE 1
           END AS function_class
    FROM funcs f
    ORDER BY dependency_rank, function_class, f.prosecdef, f.proname, f.oid
  LOOP
    out := out || r.def || ';' || nl2;
  END LOOP;

  -- Triggers (after trigger functions)
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

  -- RLS
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

  -- Policies (after referenced functions)
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

  -- Views, dependency sorted so a view never references a missing table/function/view.
  out := out || '-- ---------- Views ----------' || nl;
  FOR r IN
    WITH RECURSIVE views AS (
      SELECT c.oid, c.relname, pg_get_viewdef(c.oid, true) AS definition
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'v'
    ), edges AS (
      SELECT DISTINCT v.oid AS dependent_oid, rv.oid AS referenced_oid
      FROM views v
      JOIN pg_rewrite rw ON rw.ev_class = v.oid
      JOIN pg_depend d ON d.objid = rw.oid
      JOIN views rv ON rv.oid = d.refobjid
      WHERE v.oid <> rv.oid
    ), paths AS (
      SELECT e.dependent_oid, e.referenced_oid, ARRAY[e.dependent_oid, e.referenced_oid] AS path, 1 AS depth
      FROM edges e
      UNION ALL
      SELECT p.dependent_oid, e.referenced_oid, p.path || e.referenced_oid, p.depth + 1
      FROM paths p JOIN edges e ON e.dependent_oid = p.referenced_oid
      WHERE NOT e.referenced_oid = ANY(p.path)
        AND p.depth < 100
    )
    SELECT v.relname AS viewname, v.definition,
           COALESCE((SELECT max(depth) FROM paths p WHERE p.dependent_oid = v.oid), 0) AS dependency_rank
    FROM views v
    ORDER BY dependency_rank, v.relname
  LOOP
    out := out || format('CREATE OR REPLACE VIEW public.%I AS %s', r.viewname, r.definition) || nl;
  END LOOP;
  out := out || nl;

  out := out || '-- ---------- Materialized Views ----------' || nl;
  FOR r IN
    WITH RECURSIVE matviews AS (
      SELECT c.oid, c.relname, pg_get_viewdef(c.oid, true) AS definition
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'm'
    ), edges AS (
      SELECT DISTINCT v.oid AS dependent_oid, rv.oid AS referenced_oid
      FROM matviews v
      JOIN pg_rewrite rw ON rw.ev_class = v.oid
      JOIN pg_depend d ON d.objid = rw.oid
      JOIN matviews rv ON rv.oid = d.refobjid
      WHERE v.oid <> rv.oid
    ), paths AS (
      SELECT e.dependent_oid, e.referenced_oid, ARRAY[e.dependent_oid, e.referenced_oid] AS path, 1 AS depth
      FROM edges e
      UNION ALL
      SELECT p.dependent_oid, e.referenced_oid, p.path || e.referenced_oid, p.depth + 1
      FROM paths p JOIN edges e ON e.dependent_oid = p.referenced_oid
      WHERE NOT e.referenced_oid = ANY(p.path)
        AND p.depth < 100
    )
    SELECT v.relname AS matviewname, v.definition,
           COALESCE((SELECT max(depth) FROM paths p WHERE p.dependent_oid = v.oid), 0) AS dependency_rank
    FROM matviews v
    ORDER BY dependency_rank, v.relname
  LOOP
    out := out || format('CREATE MATERIALIZED VIEW IF NOT EXISTS public.%I AS %s', r.matviewname, r.definition) || nl;
  END LOOP;
  out := out || nl;

  -- Grants
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
END $function$;

REVOKE ALL ON FUNCTION public.admin_export_schema_sql() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_export_schema_sql() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_validate_export_sql(_schema_sql text, _data_sql text DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  test_schema text := '_backup_restore_' || replace(gen_random_uuid()::text, '-', '_');
  schema_sql text;
  data_sql text;
  err_message text;
  err_detail text;
  err_hint text;
  err_context text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  EXECUTE format('CREATE SCHEMA %I', test_schema);

  schema_sql := COALESCE(_schema_sql, '');
  schema_sql := replace(schema_sql, 'public.', quote_ident(test_schema) || '.');
  schema_sql := replace(schema_sql, '''public''', quote_literal(test_schema));
  schema_sql := 'SET search_path = ' || quote_ident(test_schema) || ', pg_catalog;' || chr(10) || schema_sql;

  data_sql := COALESCE(_data_sql, '');
  IF data_sql <> '' THEN
    data_sql := replace(data_sql, 'public.', quote_ident(test_schema) || '.');
    data_sql := replace(data_sql, '''public''', quote_literal(test_schema));
  END IF;

  BEGIN
    EXECUTE schema_sql;
    IF data_sql <> '' THEN
      EXECUTE data_sql;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      err_message = MESSAGE_TEXT,
      err_detail = PG_EXCEPTION_DETAIL,
      err_hint = PG_EXCEPTION_HINT,
      err_context = PG_EXCEPTION_CONTEXT;
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', test_schema);
    RETURN jsonb_build_object(
      'ok', false,
      'missing_or_invalid_object', err_message,
      'referenced_by', err_context,
      'detail', err_detail,
      'hint', err_hint,
      'test_schema', test_schema
    );
  END;

  EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', test_schema);
  RETURN jsonb_build_object('ok', true, 'test_schema', test_schema);
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS
    err_message = MESSAGE_TEXT,
    err_detail = PG_EXCEPTION_DETAIL,
    err_hint = PG_EXCEPTION_HINT,
    err_context = PG_EXCEPTION_CONTEXT;
  BEGIN
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', test_schema);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN jsonb_build_object(
    'ok', false,
    'missing_or_invalid_object', err_message,
    'referenced_by', err_context,
    'detail', err_detail,
    'hint', err_hint,
    'test_schema', test_schema
  );
END $function$;

REVOKE ALL ON FUNCTION public.admin_validate_export_sql(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_validate_export_sql(text, text) TO authenticated, service_role;