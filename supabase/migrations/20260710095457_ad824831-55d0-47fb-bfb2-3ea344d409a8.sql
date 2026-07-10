CREATE OR REPLACE FUNCTION public.admin_export_schema_sql()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $function$
DECLARE
  out text := '';
  r record;
  cols text; enum_vals text; attrs text;
  nl  text := chr(10);
  nl2 text := chr(10) || chr(10);
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  out := '-- ============================================' || nl
      || '-- BooBubble Schema Dump (pg_dump-style ordering)' || nl
      || '-- Generated: ' || now()::text || nl
      || '-- ============================================' || nl2
      || 'SET statement_timeout = 0;' || nl
      || 'SET client_min_messages = warning;' || nl2;

  -- Extensions
  out := out || '-- ---------- Extensions ----------' || nl;
  FOR r IN
    SELECT e.extname, x.nspname
    FROM pg_extension e JOIN pg_namespace x ON x.oid = e.extnamespace
    WHERE e.extname <> 'plpgsql' ORDER BY e.extname
  LOOP
    out := out || format('CREATE EXTENSION IF NOT EXISTS %I WITH SCHEMA %I;', r.extname, r.nspname) || nl;
  END LOOP;
  out := out || nl;

  out := out || 'CREATE SCHEMA IF NOT EXISTS public;' || nl2;

  -- ENUM types
  out := out || '-- ---------- ENUM Types ----------' || nl;
  FOR r IN
    SELECT t.oid, t.typname FROM pg_type t JOIN pg_namespace x ON x.oid = t.typnamespace
    WHERE x.nspname = 'public' AND t.typtype = 'e' ORDER BY t.typname
  LOOP
    SELECT string_agg(quote_literal(enumlabel), ', ' ORDER BY enumsortorder)
      INTO enum_vals FROM pg_enum WHERE enumtypid = r.oid;
    out := out || 'DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname='
               || quote_literal(r.typname) || ') THEN CREATE TYPE public.' || quote_ident(r.typname)
               || ' AS ENUM (' || COALESCE(enum_vals,'') || '); END IF; END $do$;' || nl;
  END LOOP;
  out := out || nl;

  -- Domains
  out := out || '-- ---------- Domains ----------' || nl;
  FOR r IN
    SELECT t.typname, pg_catalog.format_type(t.typbasetype, t.typtypmod) AS basetype,
           t.typnotnull, pg_get_expr(t.typdefaultbin, 0) AS defexpr
    FROM pg_type t JOIN pg_namespace x ON x.oid = t.typnamespace
    WHERE x.nspname = 'public' AND t.typtype = 'd' ORDER BY t.typname
  LOOP
    out := out || 'DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname='
               || quote_literal(r.typname) || ') THEN CREATE DOMAIN public.' || quote_ident(r.typname)
               || ' AS ' || r.basetype
               || CASE WHEN r.typnotnull THEN ' NOT NULL' ELSE '' END
               || CASE WHEN r.defexpr IS NOT NULL THEN ' DEFAULT ' || r.defexpr ELSE '' END
               || '; END IF; END $do$;' || nl;
  END LOOP;
  out := out || nl;

  -- Composite types
  out := out || '-- ---------- Composite Types ----------' || nl;
  FOR r IN
    SELECT t.oid, t.typname FROM pg_type t JOIN pg_namespace x ON x.oid = t.typnamespace
    LEFT JOIN pg_class c ON c.reltype = t.oid
    WHERE x.nspname = 'public' AND t.typtype = 'c' AND c.oid IS NULL ORDER BY t.typname
  LOOP
    SELECT string_agg(quote_ident(a.attname) || ' ' || pg_catalog.format_type(a.atttypid, a.atttypmod),
                      ', ' ORDER BY a.attnum) INTO attrs
    FROM pg_attribute a
    WHERE a.attrelid = (SELECT typrelid FROM pg_type WHERE oid = r.oid)
      AND a.attnum > 0 AND NOT a.attisdropped;
    out := out || 'DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname='
               || quote_literal(r.typname) || ') THEN CREATE TYPE public.' || quote_ident(r.typname)
               || ' AS (' || COALESCE(attrs,'') || '); END IF; END $do$;' || nl;
  END LOOP;
  out := out || nl;

  -- Sequences
  out := out || '-- ---------- Sequences ----------' || nl;
  FOR r IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public' ORDER BY sequence_name
  LOOP
    out := out || format('CREATE SEQUENCE IF NOT EXISTS public.%I;', r.sequence_name) || nl;
  END LOOP;
  out := out || nl;

  -- Pre-table functions
  out := out || '-- ---------- Functions (pre-table, dependency sorted) ----------' || nl;
  FOR r IN
    WITH RECURSIVE tbls AS (
      SELECT c.oid, c.relname, c.reltype FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r','m')
    ), funcs AS (
      SELECT p.oid, p.proname,
             pg_get_functiondef(p.oid) AS def,
             lower(pg_get_functiondef(p.oid)) AS def_lc,
             (
               EXISTS (
                 SELECT 1 FROM pg_depend d
                 JOIN pg_class c ON c.oid = d.refobjid
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid
                   AND d.refclassid = 'pg_class'::regclass
                   AND n.nspname = 'public' AND c.relkind IN ('r','m')
               )
               OR EXISTS (
                 -- Body scan: qualified reference to any public table/mview
                 SELECT 1 FROM tbls
                 WHERE lower(pg_get_functiondef(p.oid)) ~
                       ('(^|[^a-z0-9_])(public|"public")[.]("?)' || lower(tbls.relname) || '\3([^a-z0-9_]|$)')
               )
               OR EXISTS (
                 -- Signature scan: return type or any argument type is a public table row type
                 SELECT 1 FROM tbls
                 WHERE tbls.reltype = p.prorettype
                    OR tbls.reltype = ANY(COALESCE(p.proargtypes::oid[], ARRAY[]::oid[]))
                    OR tbls.reltype = ANY(COALESCE(p.proallargtypes, ARRAY[]::oid[]))
               )
             ) AS depends_on_table
      FROM pg_proc p JOIN pg_namespace x ON x.oid = p.pronamespace
      WHERE x.nspname = 'public' AND p.prokind IN ('f','p')
    ), edges AS (
      SELECT DISTINCT f.oid AS dep, g.oid AS ref
      FROM funcs f
      JOIN pg_depend d ON d.classid = 'pg_proc'::regclass AND d.objid = f.oid
                       AND d.refclassid = 'pg_proc'::regclass
      JOIN funcs g ON g.oid = d.refobjid
      WHERE f.oid <> g.oid
      UNION
      SELECT DISTINCT f.oid, g.oid FROM funcs f JOIN funcs g ON f.oid <> g.oid
      WHERE f.def_lc ~ ('(^|[^a-z0-9_])(public|"public")[.]("?)' || lower(g.proname) || '\3[[:space:]]*[(]')
      UNION
      SELECT DISTINCT f.oid, g.oid FROM funcs f JOIN funcs g ON f.oid <> g.oid
      WHERE f.def_lc ~ ('(^|[^.a-z0-9_])' || lower(g.proname) || '[[:space:]]*[(]')
    ), paths AS (
      SELECT dep, ref, ARRAY[dep, ref] AS visited, 1 AS depth FROM edges
      UNION ALL
      SELECT p.dep, e.ref, p.visited || e.ref, p.depth + 1
      FROM paths p JOIN edges e ON e.dep = p.ref
      WHERE NOT e.ref = ANY(p.visited) AND p.depth < 200
    )
    SELECT f.def, f.proname,
           COALESCE((SELECT max(depth) FROM paths WHERE paths.dep = f.oid), 0) AS rank
    FROM funcs f WHERE NOT f.depends_on_table ORDER BY rank ASC, f.proname
  LOOP
    out := out || r.def || ';' || nl2;
  END LOOP;

  -- Tables
  out := out || '-- ---------- Tables ----------' || nl;
  FOR r IN
    SELECT c.oid, c.relname FROM pg_class c JOIN pg_namespace x ON x.oid = c.relnamespace
    WHERE x.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname
  LOOP
    SELECT string_agg(
      nl || '  ' || quote_ident(a.attname) || ' ' ||
        pg_catalog.format_type(a.atttypid, a.atttypmod) ||
        CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN ad.adbin IS NOT NULL
             THEN ' DEFAULT ' || pg_get_expr(ad.adbin, ad.adrelid) ELSE '' END,
      ',' ORDER BY a.attnum
    ) INTO cols
    FROM pg_attribute a
    LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
    WHERE a.attrelid = r.oid AND a.attnum > 0 AND NOT a.attisdropped;
    out := out || 'CREATE TABLE IF NOT EXISTS public.' || quote_ident(r.relname)
               || ' (' || COALESCE(cols,'') || nl || ');' || nl;
  END LOOP;
  out := out || nl;

  -- Post-table functions
  out := out || '-- ---------- Functions (post-table, dependency sorted) ----------' || nl;
  FOR r IN
    WITH RECURSIVE tbls AS (
      SELECT c.oid, c.relname, c.reltype FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r','m')
    ), funcs AS (
      SELECT p.oid, p.proname,
             pg_get_functiondef(p.oid) AS def,
             lower(pg_get_functiondef(p.oid)) AS def_lc,
             (
               EXISTS (
                 SELECT 1 FROM pg_depend d
                 JOIN pg_class c ON c.oid = d.refobjid
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid
                   AND d.refclassid = 'pg_class'::regclass
                   AND n.nspname = 'public' AND c.relkind IN ('r','m')
               )
               OR EXISTS (
                 SELECT 1 FROM tbls
                 WHERE lower(pg_get_functiondef(p.oid)) ~
                       ('(^|[^a-z0-9_])(public|"public")[.]("?)' || lower(tbls.relname) || '\3([^a-z0-9_]|$)')
               )
               OR EXISTS (
                 SELECT 1 FROM tbls
                 WHERE tbls.reltype = p.prorettype
                    OR tbls.reltype = ANY(COALESCE(p.proargtypes::oid[], ARRAY[]::oid[]))
                    OR tbls.reltype = ANY(COALESCE(p.proallargtypes, ARRAY[]::oid[]))
               )
             ) AS depends_on_table
      FROM pg_proc p JOIN pg_namespace x ON x.oid = p.pronamespace
      WHERE x.nspname = 'public' AND p.prokind IN ('f','p')
    ), edges AS (
      SELECT DISTINCT f.oid AS dep, g.oid AS ref
      FROM funcs f
      JOIN pg_depend d ON d.classid = 'pg_proc'::regclass AND d.objid = f.oid
                       AND d.refclassid = 'pg_proc'::regclass
      JOIN funcs g ON g.oid = d.refobjid
      WHERE f.oid <> g.oid
      UNION
      SELECT DISTINCT f.oid, g.oid FROM funcs f JOIN funcs g ON f.oid <> g.oid
      WHERE f.def_lc ~ ('(^|[^a-z0-9_])(public|"public")[.]("?)' || lower(g.proname) || '\3[[:space:]]*[(]')
      UNION
      SELECT DISTINCT f.oid, g.oid FROM funcs f JOIN funcs g ON f.oid <> g.oid
      WHERE f.def_lc ~ ('(^|[^.a-z0-9_])' || lower(g.proname) || '[[:space:]]*[(]')
    ), paths AS (
      SELECT dep, ref, ARRAY[dep, ref] AS visited, 1 AS depth FROM edges
      UNION ALL
      SELECT p.dep, e.ref, p.visited || e.ref, p.depth + 1
      FROM paths p JOIN edges e ON e.dep = p.ref
      WHERE NOT e.ref = ANY(p.visited) AND p.depth < 200
    )
    SELECT f.def, f.proname,
           COALESCE((SELECT max(depth) FROM paths WHERE paths.dep = f.oid), 0) AS rank
    FROM funcs f WHERE f.depends_on_table ORDER BY rank ASC, f.proname
  LOOP
    out := out || r.def || ';' || nl2;
  END LOOP;

  -- Constraints
  out := out || '-- ---------- Constraints ----------' || nl;
  FOR r IN
    SELECT c.conname, x.nspname || '.' || cl.relname AS tbl,
           pg_get_constraintdef(c.oid, true) AS def, c.contype
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace x ON x.oid = cl.relnamespace
    WHERE x.nspname = 'public'
    ORDER BY CASE c.contype
               WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'c' THEN 3 WHEN 'f' THEN 4 ELSE 5 END,
             c.conname
  LOOP
    out := out || format('ALTER TABLE %s ADD CONSTRAINT %I %s;', r.tbl, r.conname, r.def) || nl;
  END LOOP;
  out := out || nl;

  -- Indexes
  out := out || '-- ---------- Indexes ----------' || nl;
  FOR r IN
    SELECT i.indexdef FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class cl ON cl.oid = c.conindid WHERE cl.relname = i.indexname)
    ORDER BY i.indexname
  LOOP out := out || r.indexdef || ';' || nl; END LOOP;
  out := out || nl;

  -- Triggers
  out := out || '-- ---------- Triggers ----------' || nl;
  FOR r IN
    SELECT pg_get_triggerdef(t.oid, true) AS def
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace x ON x.oid = c.relnamespace
    WHERE x.nspname = 'public' AND NOT t.tgisinternal ORDER BY t.tgname
  LOOP out := out || r.def || ';' || nl; END LOOP;
  out := out || nl;

  -- RLS
  out := out || '-- ---------- Row Level Security ----------' || nl;
  FOR r IN
    SELECT c.relname FROM pg_class c JOIN pg_namespace x ON x.oid = c.relnamespace
    WHERE x.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    ORDER BY c.relname
  LOOP out := out || format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.relname) || nl; END LOOP;
  out := out || nl;

  -- Policies
  out := out || '-- ---------- Policies ----------' || nl;
  FOR r IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname
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

  -- Views
  out := out || '-- ---------- Views ----------' || nl;
  FOR r IN
    WITH RECURSIVE v AS (
      SELECT c.oid, c.relname, pg_get_viewdef(c.oid, true) AS def
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'v'
    ), edges AS (
      SELECT DISTINCT v1.oid AS dep, v2.oid AS ref
      FROM v v1
      JOIN pg_rewrite rw ON rw.ev_class = v1.oid
      JOIN pg_depend dep ON dep.objid = rw.oid
      JOIN v v2 ON v2.oid = dep.refobjid
      WHERE v1.oid <> v2.oid
    ), paths AS (
      SELECT dep, ref, ARRAY[dep, ref] AS visited, 1 AS depth FROM edges
      UNION ALL
      SELECT p.dep, e.ref, p.visited || e.ref, p.depth + 1
      FROM paths p JOIN edges e ON e.dep = p.ref
      WHERE NOT e.ref = ANY(p.visited) AND p.depth < 100
    )
    SELECT v.relname, v.def,
           COALESCE((SELECT max(depth) FROM paths WHERE paths.dep = v.oid), 0) AS rank
    FROM v ORDER BY rank ASC, v.relname
  LOOP
    out := out || format('CREATE OR REPLACE VIEW public.%I AS %s', r.relname, r.def) || nl;
  END LOOP;
  out := out || nl;

  -- Materialized views
  out := out || '-- ---------- Materialized Views ----------' || nl;
  FOR r IN
    WITH RECURSIVE mv AS (
      SELECT c.oid, c.relname, pg_get_viewdef(c.oid, true) AS def
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'm'
    ), edges AS (
      SELECT DISTINCT v1.oid AS dep, v2.oid AS ref
      FROM mv v1
      JOIN pg_rewrite rw ON rw.ev_class = v1.oid
      JOIN pg_depend dep ON dep.objid = rw.oid
      JOIN mv v2 ON v2.oid = dep.refobjid
      WHERE v1.oid <> v2.oid
    ), paths AS (
      SELECT dep, ref, ARRAY[dep, ref] AS visited, 1 AS depth FROM edges
      UNION ALL
      SELECT p.dep, e.ref, p.visited || e.ref, p.depth + 1
      FROM paths p JOIN edges e ON e.dep = p.ref
      WHERE NOT e.ref = ANY(p.visited) AND p.depth < 100
    )
    SELECT mv.relname, mv.def,
           COALESCE((SELECT max(depth) FROM paths WHERE paths.dep = mv.oid), 0) AS rank
    FROM mv ORDER BY rank ASC, mv.relname
  LOOP
    out := out || format('CREATE MATERIALIZED VIEW IF NOT EXISTS public.%I AS %s', r.relname, r.def) || nl;
  END LOOP;
  out := out || nl;

  -- Grants
  out := out || '-- ---------- Grants ----------' || nl;
  FOR r IN
    SELECT grantee, table_name,
           string_agg(DISTINCT privilege_type, ', ' ORDER BY privilege_type) AS privs
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